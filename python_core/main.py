"""
FastAPI server for DataExplorer Python backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from . import (
    analyze_dataset,
    DataProcessor,
    ChartDataGenerator,
    DataAnalyzer,
    generate_data_profile,
    FilterRule,
    SortDirection,
    Dataset
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="DataExplorer Python Backend",
    description="Python backend for data processing and analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class DataAnalysisRequest(BaseModel):
    data: List[Dict[str, Any]]
    filename: str

class FilterRequest(BaseModel):
    dataset: Dict[str, Any]  # Dataset as dict
    searchTerm: Optional[str] = ""
    filterRules: Optional[List[Dict[str, Any]]] = []
    sortColumn: Optional[str] = ""
    sortDirection: Optional[str] = "asc"

class ChartDataRequest(BaseModel):
    dataset: Dict[str, Any]
    chartType: str
    xColumn: str
    yColumn: Optional[str] = None

class InsightRequest(BaseModel):
    dataset: Dict[str, Any]

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None

# Helper function to convert dict to Dataset
def dict_to_dataset(data: Dict[str, Any]) -> Dataset:
    """Convert dictionary representation to Dataset object"""
    from .types import DataColumn, DataType
    
    columns = []
    for col_data in data['columns']:
        columns.append(DataColumn(
            name=col_data['name'],
            type=DataType(col_data['type']),
            values=col_data['values'],
            missing_count=col_data['missingCount'],
            unique_count=col_data['uniqueCount']
        ))
    
    return Dataset(
        name=data['name'],
        rows=data['rows'],
        columns=columns,
        total_rows=data['totalRows'],
        total_columns=data['totalColumns'],
        memory_usage=data['memoryUsage']
    )

# API Routes
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return ApiResponse(
        success=True,
        data={"status": "healthy", "version": "1.0.0"},
        message="Python backend is running"
    )

@app.post("/api/analyze")
async def analyze_data(request: DataAnalysisRequest):
    """Analyze dataset and return structured data"""
    try:
        logger.info(f"Analyzing dataset: {request.filename}")
        dataset = analyze_dataset(request.data, request.filename)
        
        # Convert to dict for JSON serialization
        dataset_dict = {
            "name": dataset.name,
            "rows": dataset.rows,
            "columns": [
                {
                    "name": col.name,
                    "type": col.type.value,
                    "values": col.values,
                    "missingCount": col.missing_count,
                    "uniqueCount": col.unique_count
                }
                for col in dataset.columns
            ],
            "totalRows": dataset.total_rows,
            "totalColumns": dataset.total_columns,
            "memoryUsage": dataset.memory_usage
        }
        
        return ApiResponse(
            success=True,
            data=dataset_dict,
            message=f"Successfully analyzed {dataset.total_rows} rows"
        )
    except Exception as e:
        logger.error(f"Error analyzing dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process")
async def process_data(request: FilterRequest):
    """Process data with filters and sorting"""
    try:
        dataset = dict_to_dataset(request.dataset)
        processor = DataProcessor(dataset)
        
        # Apply filters
        if request.searchTerm:
            processor.set_search_term(request.searchTerm)
        
        for rule_data in request.filterRules or []:
            if rule_data.get('column') and rule_data.get('value'):
                from .types import FilterOperator
                rule = FilterRule(
                    column=rule_data['column'],
                    operator=FilterOperator(rule_data['operator']),
                    value=rule_data['value']
                )
                processor.add_filter_rule(rule)
        
        if request.sortColumn:
            processor.set_sort(
                request.sortColumn,
                SortDirection(request.sortDirection or 'asc')
            )
        
        return ApiResponse(
            success=True,
            data={
                "filteredRows": processor.filtered_rows,
                "totalRows": processor.total_filtered_rows
            }
        )
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chart-data")
async def generate_chart_data(request: ChartDataRequest):
    """Generate chart data"""
    try:
        dataset = dict_to_dataset(request.dataset)
        chart_gen = ChartDataGenerator(dataset)
        
        if request.chartType == 'bar':
            data = chart_gen.generate_bar_chart_data(request.xColumn, request.yColumn)
        elif request.chartType == 'line':
            data = chart_gen.generate_line_chart_data(request.xColumn, request.yColumn)
        elif request.chartType == 'scatter':
            data = chart_gen.generate_scatter_plot_data(request.xColumn, request.yColumn)
        elif request.chartType == 'pie':
            data = chart_gen.generate_pie_chart_data(request.xColumn)
        else:
            raise ValueError(f"Unsupported chart type: {request.chartType}")
        
        return ApiResponse(success=True, data=data)
    except Exception as e:
        logger.error(f"Error generating chart data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/insights")
async def get_insights(request: InsightRequest):
    """Generate data insights"""
    try:
        dataset = dict_to_dataset(request.dataset)
        analyzer = DataAnalyzer(dataset)
        insights = analyzer.generate_insights()
        
        return ApiResponse(success=True, data=insights)
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chart-recommendations")
async def get_chart_recommendations(request: InsightRequest):
    """Get chart recommendations"""
    try:
        dataset = dict_to_dataset(request.dataset)
        chart_gen = ChartDataGenerator(dataset)
        recommendations = chart_gen.get_recommended_charts()
        
        return ApiResponse(success=True, data=recommendations)
    except Exception as e:
        logger.error(f"Error getting chart recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data-profile")
async def get_data_profile(request: InsightRequest):
    """Generate data profile"""
    try:
        dataset = dict_to_dataset(request.dataset)
        profile = generate_data_profile(dataset)
        
        # Convert to dict for JSON serialization
        profile_dict = {
            "overview": profile.overview,
            "quality": {
                "duplicates": profile.quality.duplicates,
                "missingValues": profile.quality.missing_values,
                "outliers": profile.quality.outliers,
                "inconsistentTypes": profile.quality.inconsistent_types,
                "textIssues": profile.quality.text_issues
            },
            "columns": profile.columns
        }
        
        return ApiResponse(success=True, data=profile_dict)
    except Exception as e:
        logger.error(f"Error generating data profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/prediction-model")
async def create_prediction_model(request: Dict[str, Any]):
    """Create prediction model"""
    try:
        dataset = dict_to_dataset(request['dataset'])
        analyzer = DataAnalyzer(dataset)
        
        model = analyzer.create_prediction_model(
            request['targetColumn'],
            request['featureColumns']
        )
        
        return ApiResponse(success=True, data=model)
    except Exception as e:
        logger.error(f"Error creating prediction model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)