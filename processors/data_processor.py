"""
Advanced Data Processing Engine
Handles multi-format data ingestion with intelligent ETL capabilities
"""

import pandas as pd
import numpy as np
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class DataProcessor:
    """Advanced data processing with auto-detection and cleaning capabilities"""
    
    def __init__(self):
        self.supported_formats = ['.xlsx', '.xls', '.csv', '.json']
        self.encoding_attempts = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    
    def process_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        """
        Process uploaded file with intelligent format detection
        Returns processed data summary and metrics
        """
        try:
            # Detect and load data based on file extension
            if filename.endswith(('.xlsx', '.xls')):
                df = self._process_excel(file_path)
            elif filename.endswith('.csv'):
                df = self._process_csv(file_path)
            elif filename.endswith('.json'):
                df = self._process_json(file_path)
            else:
                raise ValueError(f"Unsupported format: {filename}")
            
            # Apply intelligent data cleaning
            df_cleaned = self._clean_dataframe(df)
            
            # Generate analytics and insights
            analytics = self._generate_analytics(df_cleaned)
            
            # Prepare response with processed data
            return {
                "success": True,
                "filename": filename,
                "original_rows": len(df),
                "processed_rows": len(df_cleaned),
                "columns": len(df_cleaned.columns),
                "column_info": self._analyze_columns(df_cleaned),
                "data_types": df_cleaned.dtypes.astype(str).to_dict(),
                "analytics": analytics,
                "sample_data": df_cleaned.head(10).to_dict('records'),
                "processing_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Processing failed for {filename}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "filename": filename
            }
    
    def _process_excel(self, file_path: str) -> pd.DataFrame:
        """Process Excel files with multiple sheet detection"""
        try:
            # Try to read the first sheet
            df = pd.read_excel(file_path, sheet_name=0)
            
            # Check if multiple sheets exist and merge if needed
            excel_file = pd.ExcelFile(file_path)
            if len(excel_file.sheet_names) > 1:
                logger.info(f"Multiple sheets detected: {excel_file.sheet_names}")
                # For now, use first sheet, but this could be enhanced
            
            return df
            
        except Exception as e:
            logger.error(f"Excel processing failed: {str(e)}")
            raise
    
    def _process_csv(self, file_path: str) -> pd.DataFrame:
        """Process CSV with intelligent encoding detection"""
        for encoding in self.encoding_attempts:
            try:
                df = pd.read_csv(file_path, encoding=encoding)
                logger.info(f"CSV loaded successfully with encoding: {encoding}")
                return df
            except UnicodeDecodeError:
                continue
            except Exception as e:
                logger.error(f"CSV processing failed with {encoding}: {str(e)}")
                continue
        
        raise ValueError("Could not decode CSV file with any supported encoding")
    
    def _process_json(self, file_path: str) -> pd.DataFrame:
        """Process JSON with nested structure flattening"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Handle different JSON structures
            if isinstance(data, list):
                df = pd.json_normalize(data)
            elif isinstance(data, dict):
                # Try to find the main data array
                for key, value in data.items():
                    if isinstance(value, list) and len(value) > 0:
                        df = pd.json_normalize(value)
                        break
                else:
                    # Single record
                    df = pd.json_normalize([data])
            else:
                raise ValueError("Unsupported JSON structure")
            
            return df
            
        except Exception as e:
            logger.error(f"JSON processing failed: {str(e)}")
            raise
    
    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply intelligent data cleaning operations"""
        df_clean = df.copy()
        
        # Remove completely empty rows and columns
        df_clean = df_clean.dropna(how='all').dropna(axis=1, how='all')
        
        # Clean column names
        df_clean.columns = [self._clean_column_name(col) for col in df_clean.columns]
        
        # Auto-detect and convert data types
        df_clean = self._auto_convert_types(df_clean)
        
        # Remove duplicate rows
        initial_rows = len(df_clean)
        df_clean = df_clean.drop_duplicates()
        duplicates_removed = initial_rows - len(df_clean)
        
        if duplicates_removed > 0:
            logger.info(f"Removed {duplicates_removed} duplicate rows")
        
        return df_clean
    
    def _clean_column_name(self, col_name: str) -> str:
        """Clean and standardize column names"""
        # Convert to string and strip whitespace
        clean_name = str(col_name).strip()
        
        # Replace special characters with underscores
        clean_name = re.sub(r'[^\w\s]', '_', clean_name)
        
        # Replace spaces with underscores
        clean_name = re.sub(r'\s+', '_', clean_name)
        
        # Remove consecutive underscores
        clean_name = re.sub(r'_+', '_', clean_name)
        
        # Remove leading/trailing underscores
        clean_name = clean_name.strip('_')
        
        # Ensure it's not empty
        if not clean_name:
            clean_name = "unnamed_column"
        
        return clean_name
    
    def _auto_convert_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """Intelligent data type conversion"""
        df_converted = df.copy()
        
        for col in df_converted.columns:
            # Skip if already numeric
            if df_converted[col].dtype in ['int64', 'float64']:
                continue
            
            # Try to convert to datetime
            if self._is_datetime_column(df_converted[col]):
                try:
                    df_converted[col] = pd.to_datetime(df_converted[col], errors='coerce')
                    continue
                except:
                    pass
            
            # Try to convert to numeric
            if self._is_numeric_column(df_converted[col]):
                try:
                    df_converted[col] = pd.to_numeric(df_converted[col], errors='coerce')
                    continue
                except:
                    pass
        
        return df_converted
    
    def _is_datetime_column(self, series: pd.Series) -> bool:
        """Check if column contains datetime data"""
        # Sample a few non-null values
        sample = series.dropna().head(10)
        if len(sample) == 0:
            return False
        
        datetime_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY or DD/MM/YYYY
            r'\d{2}-\d{2}-\d{4}',  # MM-DD-YYYY or DD-MM-YYYY
        ]
        
        for value in sample:
            str_value = str(value)
            if any(re.search(pattern, str_value) for pattern in datetime_patterns):
                return True
        
        return False
    
    def _is_numeric_column(self, series: pd.Series) -> bool:
        """Check if column contains numeric data"""
        # Sample non-null values
        sample = series.dropna().head(20)
        if len(sample) == 0:
            return False
        
        numeric_count = 0
        for value in sample:
            str_value = str(value).replace(',', '').replace('$', '').replace('%', '').strip()
            try:
                float(str_value)
                numeric_count += 1
            except:
                pass
        
        # If more than 70% are numeric, consider it a numeric column
        return (numeric_count / len(sample)) > 0.7
    
    def _analyze_columns(self, df: pd.DataFrame) -> Dict[str, Dict]:
        """Analyze column characteristics for dashboard suggestions"""
        column_analysis = {}
        
        for col in df.columns:
            analysis = {
                "name": col,
                "type": str(df[col].dtype),
                "null_count": df[col].isnull().sum(),
                "unique_count": df[col].nunique(),
                "suggested_chart": self._suggest_chart_type(df[col])
            }
            
            # Add type-specific analysis
            if df[col].dtype in ['int64', 'float64']:
                analysis.update({
                    "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
                    "max": float(df[col].max()) if not pd.isna(df[col].max()) else None,
                    "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None
                })
            elif df[col].dtype == 'object':
                top_values = df[col].value_counts().head(5)
                analysis["top_values"] = top_values.to_dict()
            
            column_analysis[col] = analysis
        
        return column_analysis
    
    def _suggest_chart_type(self, series: pd.Series) -> str:
        """Suggest appropriate chart type based on data characteristics"""
        unique_ratio = series.nunique() / len(series) if len(series) > 0 else 0
        
        if series.dtype in ['int64', 'float64']:
            if unique_ratio > 0.8:
                return "line"  # Continuous data
            elif series.nunique() < 20:
                return "bar"   # Discrete numeric data
            else:
                return "histogram"  # Distribution
        elif series.dtype == 'datetime64[ns]':
            return "line"  # Time series
        else:
            if series.nunique() < 10:
                return "pie"   # Few categories
            elif series.nunique() < 50:
                return "bar"   # Many categories
            else:
                return "table"  # Too many categories for chart
    
    def _generate_analytics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate basic analytics and insights"""
        return {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
            "numeric_columns": len(df.select_dtypes(include=[np.number]).columns),
            "datetime_columns": len(df.select_dtypes(include=['datetime64']).columns),
            "text_columns": len(df.select_dtypes(include=['object']).columns),
            "missing_data_percentage": round((df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100, 2)
        }