"""
Data types and interfaces for the data analysis system.
"""
from typing import Dict, List, Any, Optional, Union, Literal
from dataclasses import dataclass
from enum import Enum


class DataType(str, Enum):
    """Enumeration of supported data types."""
    NUMERIC = "numeric"
    CATEGORICAL = "categorical"
    DATETIME = "datetime"
    TEXT = "text"


class SortDirection(str, Enum):
    """Sort direction options."""
    ASC = "asc"
    DESC = "desc"


class FilterOperator(str, Enum):
    """Filter operators for data manipulation."""
    EQUALS = "equals"
    CONTAINS = "contains"
    GREATER = "greater"
    LESS = "less"
    NOT_EQUALS = "not_equals"


@dataclass
class FilterRule:
    """Represents a filter rule for data manipulation."""
    column: str
    operator: FilterOperator
    value: str


@dataclass
class DataColumn:
    """Represents a column in the dataset with metadata."""
    name: str
    type: DataType
    values: List[Any]
    missing_count: int
    unique_count: int


@dataclass
class Dataset:
    """Main dataset structure containing rows, columns, and metadata."""
    name: str
    rows: List[Dict[str, Any]]
    columns: List[DataColumn]
    total_rows: int
    total_columns: int
    memory_usage: int


@dataclass
class ColumnStats:
    """Statistical information for a column."""
    mean: Optional[float] = None
    median: Optional[float] = None
    mode: Optional[Any] = None
    min_val: Optional[Any] = None
    max_val: Optional[Any] = None
    std: Optional[float] = None
    variance: Optional[float] = None
    quartiles: Optional[List[float]] = None
    outliers: Optional[List[Any]] = None


@dataclass
class DataQualityIssues:
    """Data quality metrics."""
    duplicates: int
    missing_values: int
    outliers: int
    inconsistent_types: int
    text_issues: int


@dataclass
class DataProfile:
    """Comprehensive data profile with quality metrics."""
    overview: Dict[str, Union[int, float]]
    quality: DataQualityIssues
    columns: List[Dict[str, Any]]


@dataclass
class ChartConfig:
    """Configuration for chart generation."""
    chart_type: Literal["bar", "line", "scatter", "pie"]
    x_column: str
    y_column: Optional[str] = None