# DataHub Business Intelligence Platform

A web-based business intelligence platform that processes multi-source CSV data and generates interactive dashboards with automated relationship detection and intelligent KPI calculations.

## Technical Overview

The platform implements an ETL pipeline with automatic data source correlation, enabling organizations to upload disparate CSV files and receive unified analytics dashboards without manual data modeling.

### Core Architecture

**Backend Engine (Python/Flask)**
- Multi-format data ingestion with encoding detection
- Automated column type inference and relationship mapping  
- Dynamic KPI calculation engine with statistical analysis
- RESTful API design with JSON data serialization
- Memory-efficient data processing using pandas optimization

**Frontend Interface (React)**
- Component-based dashboard rendering system
- Real-time data visualization with interactive charts
- Responsive design with mobile-optimized touch interfaces
- Asynchronous data fetching with error boundary handling

## Key Technical Features

### Intelligent Data Processing
- **Automatic Schema Detection**: Analyzes CSV headers to identify value columns, geographic data, temporal fields, and categorical dimensions
- **Relationship Inference**: Detects foreign key relationships between datasets using column name pattern matching and data correlation analysis
- **Data Quality Assessment**: Implements validation algorithms to identify and handle missing values, format inconsistencies, and outliers

### Advanced Analytics Engine
- **Dynamic Aggregation**: Calculates metrics across multiple dimensions (temporal, geographic, categorical)
- **Statistical Correlation**: Identifies significant relationships between numerical variables using correlation coefficients
- **Performance Optimization**: Implements caching strategies and query optimization for large dataset processing

### Dashboard Generation
- **Chart Type Selection**: Automatically suggests optimal visualization types based on data characteristics and statistical properties
- **Interactive Components**: Implements drill-down capabilities and cross-filtering between dashboard elements
- **Export Functionality**: Generates formatted reports in multiple output formats

## Technology Stack

**Backend**
```
Python 3.8+
Flask 2.3.x - Web framework
Pandas 2.0+ - Data manipulation
NumPy - Numerical computing
```

**Frontend**
```
React 18 - UI framework
Axios - HTTP client
CSS3 - Styling and animations
```

**Data Processing**
```
CSV parsing with encoding detection
JSON serialization for API responses
Statistical analysis for relationship detection
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

### Backend Setup
```bash
cd datahub-universal-centralizer
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python server_mvp.py
```

### Frontend Setup
```bash
cd frontend_mvp
npm install
npm start
```

The application will be available at `http://localhost:3002` with the API running on `http://localhost:3001`.

## API Endpoints

### Data Upload
```
POST /upload
Content-Type: multipart/form-data
Accepts: CSV files with automatic encoding detection
Returns: Data summary with column analysis and row count
```

### Dashboard Generation
```
GET /dashboard
Returns: Processed analytics with KPIs, relationships, and chart data
Includes: Automated metric calculations and visualization suggestions
```

### System Status
```
GET /status
Returns: Current system state with loaded datasets and processing metrics
```

## Performance Characteristics

- **Processing Speed**: Handles datasets up to 100k rows with sub-second response times
- **Memory Efficiency**: Optimized pandas operations with streaming data processing
- **Scalability**: Stateless architecture enabling horizontal scaling capabilities
- **Browser Compatibility**: Cross-browser support with responsive design principles

## Data Processing Capabilities

### Supported Formats
- CSV files with various encoding formats (UTF-8, Latin-1, CP1252)
- Excel integration via CSV export functionality
- JSON data structures with nested object flattening

### Analytics Features
- Revenue and sales trend analysis
- Geographic distribution mapping
- Product performance ranking
- Seasonal pattern detection
- Channel performance comparison
- Inventory analysis with threshold monitoring

## Security Considerations

- File upload validation with type checking
- Memory management for large dataset processing
- Error handling with graceful degradation
- Input sanitization for CSV data processing

---

**Diego Fonte**  
Full Stack Developer | Cybersecurity & AI Focused  
[Portfolio PT](https://diegofontedev.com.br/) | [EN](https://diegofontedev.com.br/index-en.html) | [ES](https://diegofontedev.com.br/index-es.html)  
Contato: contato@diegofontedev.com.br