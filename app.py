"""
DataHub Universal Centralizer - Main Application
Multi-source data integration with real-time dashboard capabilities
"""

from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
import pandas as pd
import redis
import json
import os
from werkzeug.utils import secure_filename
from datetime import datetime

# Application configuration
app = Flask(__name__)
app.config['SECRET_KEY'] = 'datahub-development-key'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Initialize extensions
socketio = SocketIO(app, cors_allowed_origins="*")
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return jsonify({
        "status": "active",
        "service": "DataHub Universal Centralizer",
        "version": "1.0.0",
        "endpoints": ["/api/upload", "/api/data", "/api/dashboard"]
    })

@app.route('/api/upload', methods=['POST'])
def upload_data():
    """Handle multi-format data upload and processing"""
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Process file based on extension
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    try:
        # Auto-detect and process file format
        if filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        elif filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400
        
        # Basic data processing and validation
        data_summary = {
            "filename": filename,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "data_types": df.dtypes.astype(str).to_dict(),
            "upload_time": datetime.now().isoformat()
        }
        
        # Cache processed data
        cache_key = f"dataset:{filename}"
        redis_client.setex(cache_key, 3600, df.to_json())
        
        # Emit real-time update to connected clients
        socketio.emit('data_uploaded', data_summary)
        
        return jsonify({
            "status": "success",
            "data": data_summary,
            "cache_key": cache_key
        })
        
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

@app.route('/api/data/<cache_key>')
def get_data(cache_key):
    """Retrieve cached dataset"""
    
    try:
        cached_data = redis_client.get(cache_key)
        if not cached_data:
            return jsonify({"error": "Dataset not found or expired"}), 404
        
        df = pd.read_json(cached_data)
        
        # Return sample data for dashboard rendering
        return jsonify({
            "data": df.head(100).to_dict('records'),
            "total_rows": len(df),
            "columns": df.columns.tolist()
        })
        
    except Exception as e:
        return jsonify({"error": f"Data retrieval failed: {str(e)}"}), 500

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    emit('status', {'message': 'Connected to DataHub real-time service'})

@socketio.on('request_update')
def handle_update_request():
    """Handle client request for data updates"""
    emit('update_available', {'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)