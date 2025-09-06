"""
Python Core Data Analysis Library

A comprehensive data analysis library converted from TypeScript,
providing data processing, visualization, and analytics capabilities.
"""

from .types import (
    DataType,
    SortDirection,
    FilterOperator,
    FilterRule,
    DataColumn,
    Dataset,
    ColumnStats,
    DataQualityIssues,
    DataProfile,
    ChartConfig
)

from .data_utils import (
    detect_column_type,
    analyze_dataset,
    format_bytes,
    get_column_icon,
    detect_outliers,
    calculate_correlation,
    safe_parse_number,
    calculate_basic_stats,
    generate_data_profile,
    debounce
)

from .data_processing import (
    DataProcessor,
    remove_duplicates,
    handle_missing_values,
    standardize_text,
    remove_outliers
)

from .visualization import (
    ChartDataGenerator,
    export_chart_data
)

from .analytics import (
    DataAnalyzer
)

__version__ = "1.0.0"
__author__ = "DataExplorer Team"
__description__ = "Python core library for data analysis and visualization"

__all__ = [
    # Types
    'DataType',
    'SortDirection', 
    'FilterOperator',
    'FilterRule',
    'DataColumn',
    'Dataset',
    'ColumnStats',
    'DataQualityIssues',
    'DataProfile',
    'ChartConfig',
    
    # Data Utils
    'detect_column_type',
    'analyze_dataset',
    'format_bytes',
    'get_column_icon',
    'detect_outliers',
    'calculate_correlation',
    'safe_parse_number',
    'calculate_basic_stats',
    'generate_data_profile',
    'debounce',
    
    # Data Processing
    'DataProcessor',
    'remove_duplicates',
    'handle_missing_values',
    'standardize_text',
    'remove_outliers',
    
    # Visualization
    'ChartDataGenerator',
    'export_chart_data',
    
    # Analytics
    'DataAnalyzer'
]