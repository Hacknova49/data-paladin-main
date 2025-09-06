"""
Core data processing and analysis utilities.
"""
import json
import math
import statistics
from typing import List, Dict, Any, Optional, Tuple, Union
from collections import Counter
import re
from datetime import datetime

from .types import DataType, Dataset, DataColumn, ColumnStats, DataProfile, DataQualityIssues


def detect_column_type(values: List[Any]) -> DataType:
    """
    Detects the data type of a column based on its values.
    
    Args:
        values: List of values to analyze
        
    Returns:
        The detected data type
    """
    # Remove null/undefined values for analysis
    clean_values = [v for v in values if v is not None and v != '']
    
    if not clean_values:
        return DataType.TEXT
    
    # Check if it's numeric
    numeric_count = 0
    for v in clean_values:
        try:
            float(v)
            if math.isfinite(float(v)):
                numeric_count += 1
        except (ValueError, TypeError):
            pass
    
    numeric_ratio = numeric_count / len(clean_values)
    
    if numeric_ratio > 0.8:
        return DataType.NUMERIC
    
    # Check if it's datetime
    date_count = 0
    date_patterns = [
        r'\d{1,4}[-/]\d{1,2}[-/]\d{1,4}',
        r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}'
    ]
    
    for v in clean_values:
        str_v = str(v)
        # Try parsing as date
        try:
            datetime.fromisoformat(str_v.replace('/', '-'))
            date_count += 1
            continue
        except ValueError:
            pass
        
        # Check date patterns
        for pattern in date_patterns:
            if re.search(pattern, str_v):
                date_count += 1
                break
    
    date_ratio = date_count / len(clean_values)
    
    if date_ratio > 0.6:
        return DataType.DATETIME
    
    # Check if it's categorical (limited unique values relative to total)
    unique_values = len(set(clean_values))
    unique_ratio = unique_values / len(clean_values)
    
    if unique_ratio < 0.1 and unique_values < 20:
        return DataType.CATEGORICAL
    
    return DataType.TEXT


def analyze_dataset(rows: List[Dict[str, Any]], filename: str) -> Dataset:
    """
    Analyzes a dataset and returns structured data with column information.
    
    Args:
        rows: Raw data rows
        filename: Name of the source file
        
    Returns:
        Analyzed dataset structure
    """
    if not rows:
        return Dataset(
            name=filename,
            rows=[],
            columns=[],
            total_rows=0,
            total_columns=0,
            memory_usage=0
        )
    
    column_names = list(rows[0].keys())
    columns = []
    
    for name in column_names:
        values = [row.get(name) for row in rows]
        data_type = detect_column_type(values)
        missing_count = sum(1 for v in values if v is None or v == '')
        unique_count = len(set(v for v in values if v is not None and v != ''))
        
        columns.append(DataColumn(
            name=name,
            type=data_type,
            values=values,
            missing_count=missing_count,
            unique_count=unique_count
        ))
    
    memory_usage = len(json.dumps(rows).encode('utf-8'))
    
    return Dataset(
        name=filename,
        rows=rows,
        columns=columns,
        total_rows=len(rows),
        total_columns=len(column_names),
        memory_usage=memory_usage
    )


def format_bytes(bytes_count: int) -> str:
    """
    Formats bytes into human-readable format.
    
    Args:
        bytes_count: Number of bytes
        
    Returns:
        Formatted string
    """
    if bytes_count == 0:
        return '0 Bytes'
    
    k = 1024
    sizes = ['Bytes', 'KB', 'MB', 'GB']
    i = int(math.floor(math.log(bytes_count) / math.log(k)))
    
    return f"{round(bytes_count / math.pow(k, i), 2)} {sizes[i]}"


def get_column_icon(data_type: DataType) -> str:
    """
    Returns an emoji icon for a given data type.
    
    Args:
        data_type: Data type
        
    Returns:
        Emoji string
    """
    icon_map = {
        DataType.NUMERIC: '🔢',
        DataType.CATEGORICAL: '🏷️',
        DataType.DATETIME: '📅',
        DataType.TEXT: '📝'
    }
    return icon_map.get(data_type, '❓')


def detect_outliers(values: List[float]) -> List[float]:
    """
    Detects outliers in numeric data using IQR method.
    
    Args:
        values: List of numeric values
        
    Returns:
        List of outlier values
    """
    if not values:
        return []
    
    sorted_values = sorted(values)
    n = len(sorted_values)
    
    q1 = sorted_values[int(n * 0.25)]
    q3 = sorted_values[int(n * 0.75)]
    iqr = q3 - q1
    
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    return [v for v in values if v < lower_bound or v > upper_bound]


def calculate_correlation(x: List[float], y: List[float]) -> float:
    """
    Calculates Pearson correlation coefficient between two numeric arrays.
    
    Args:
        x: First array
        y: Second array
        
    Returns:
        Correlation coefficient (-1 to 1)
    """
    if len(x) != len(y) or len(x) == 0:
        return 0.0
    
    n = len(x)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_xx = sum(xi * xi for xi in x)
    sum_yy = sum(yi * yi for yi in y)
    
    numerator = n * sum_xy - sum_x * sum_y
    denominator = math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y))
    
    return numerator / denominator if denominator != 0 else 0.0


def safe_parse_number(value: Any) -> Optional[float]:
    """
    Safely parses a numeric value.
    
    Args:
        value: Value to parse
        
    Returns:
        Parsed number or None if invalid
    """
    if value is None or value == '':
        return None
    
    try:
        parsed = float(value)
        return parsed if math.isfinite(parsed) else None
    except (ValueError, TypeError):
        return None


def calculate_basic_stats(values: List[float]) -> Optional[ColumnStats]:
    """
    Calculates basic statistics for numeric data.
    
    Args:
        values: List of numeric values
        
    Returns:
        Statistics object or None if no valid data
    """
    if not values:
        return None
    
    try:
        mean_val = statistics.mean(values)
        median_val = statistics.median(values)
        std_val = statistics.stdev(values) if len(values) > 1 else 0.0
        variance_val = statistics.variance(values) if len(values) > 1 else 0.0
        min_val = min(values)
        max_val = max(values)
        
        # Calculate quartiles
        sorted_values = sorted(values)
        n = len(sorted_values)
        q1 = sorted_values[int(n * 0.25)]
        q3 = sorted_values[int(n * 0.75)]
        quartiles = [min_val, q1, median_val, q3, max_val]
        
        return ColumnStats(
            mean=mean_val,
            median=median_val,
            std=std_val,
            variance=variance_val,
            min_val=min_val,
            max_val=max_val,
            quartiles=quartiles
        )
    except statistics.StatisticsError:
        return None


def generate_data_profile(dataset: Dataset) -> DataProfile:
    """
    Generates a comprehensive data profile for quality assessment.
    
    Args:
        dataset: Dataset to analyze
        
    Returns:
        Data profile with quality metrics
    """
    # Calculate overall completeness
    total_cells = dataset.total_rows * dataset.total_columns
    total_missing = sum(col.missing_count for col in dataset.columns)
    completeness = ((total_cells - total_missing) / total_cells) * 100 if total_cells > 0 else 0
    
    # Detect duplicates
    unique_rows = set(json.dumps(row, sort_keys=True) for row in dataset.rows)
    duplicates = dataset.total_rows - len(unique_rows)
    
    # Count outliers in numeric columns
    outliers_count = 0
    for col in dataset.columns:
        if col.type == DataType.NUMERIC:
            numeric_values = [safe_parse_number(v) for v in col.values]
            valid_values = [v for v in numeric_values if v is not None]
            outliers = detect_outliers(valid_values)
            outliers_count += len(outliers)
    
    # Count text issues
    text_issues = 0
    for col in dataset.columns:
        if col.type in [DataType.TEXT, DataType.CATEGORICAL]:
            text_values = [str(v) for v in col.values if isinstance(v, str)]
            has_issues = any(
                v != v.strip() or  # leading/trailing spaces
                re.search(r'\s{2,}', v)  # multiple spaces
                for v in text_values
            )
            if has_issues:
                text_issues += 1
    
    quality = DataQualityIssues(
        duplicates=duplicates,
        missing_values=total_missing,
        outliers=outliers_count,
        inconsistent_types=0,  # Would need more complex analysis
        text_issues=text_issues
    )
    
    overview = {
        'total_rows': dataset.total_rows,
        'total_columns': dataset.total_columns,
        'memory_usage': dataset.memory_usage,
        'completeness': completeness
    }
    
    columns_info = []
    for col in dataset.columns:
        col_completeness = ((dataset.total_rows - col.missing_count) / dataset.total_rows) * 100 if dataset.total_rows > 0 else 0
        columns_info.append({
            'name': col.name,
            'type': col.type.value,
            'unique_count': col.unique_count,
            'missing_count': col.missing_count,
            'completeness': col_completeness
        })
    
    return DataProfile(
        overview=overview,
        quality=quality,
        columns=columns_info
    )


def debounce(func, wait_time: float):
    """
    Decorator to debounce function calls.
    
    Args:
        func: Function to debounce
        wait_time: Wait time in seconds
        
    Returns:
        Debounced function
    """
    import threading
    import time
    
    def debounced(*args, **kwargs):
        def call_func():
            time.sleep(wait_time)
            func(*args, **kwargs)
        
        # Cancel previous timer if exists
        if hasattr(debounced, '_timer'):
            debounced._timer.cancel()
        
        # Start new timer
        debounced._timer = threading.Timer(wait_time, call_func)
        debounced._timer.start()
    
    return debounced