"""
Data visualization utilities for generating charts and plots.
"""
from typing import List, Dict, Any, Optional, Tuple
import json
from collections import Counter

from .types import Dataset, ChartConfig, DataType


class ChartDataGenerator:
    """Generates chart data from datasets."""
    
    def __init__(self, dataset: Dataset):
        """
        Initialize with a dataset.
        
        Args:
            dataset: The dataset to generate charts from
        """
        self.dataset = dataset
    
    def generate_bar_chart_data(self, x_column: str, y_column: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Generate data for a bar chart.
        
        Args:
            x_column: Column for x-axis
            y_column: Column for y-axis (numeric)
            limit: Maximum number of data points
            
        Returns:
            Chart data as list of dictionaries
        """
        data = []
        for row in self.dataset.rows[:limit]:
            x_val = row.get(x_column)
            y_val = row.get(y_column)
            
            if x_val is not None and y_val is not None:
                try:
                    y_numeric = float(y_val)
                    data.append({
                        'x': x_val,
                        'y': y_numeric,
                        x_column: x_val,
                        y_column: y_numeric
                    })
                except (ValueError, TypeError):
                    continue
        
        return data
    
    def generate_line_chart_data(self, x_column: str, y_column: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Generate data for a line chart.
        
        Args:
            x_column: Column for x-axis
            y_column: Column for y-axis (numeric)
            limit: Maximum number of data points
            
        Returns:
            Chart data as list of dictionaries
        """
        # Same as bar chart data for now
        return self.generate_bar_chart_data(x_column, y_column, limit)
    
    def generate_scatter_plot_data(self, x_column: str, y_column: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Generate data for a scatter plot.
        
        Args:
            x_column: Column for x-axis (numeric)
            y_column: Column for y-axis (numeric)
            limit: Maximum number of data points
            
        Returns:
            Chart data as list of dictionaries
        """
        data = []
        for row in self.dataset.rows[:limit]:
            x_val = row.get(x_column)
            y_val = row.get(y_column)
            
            if x_val is not None and y_val is not None:
                try:
                    x_numeric = float(x_val)
                    y_numeric = float(y_val)
                    data.append({
                        'x': x_numeric,
                        'y': y_numeric,
                        x_column: x_numeric,
                        y_column: y_numeric
                    })
                except (ValueError, TypeError):
                    continue
        
        return data
    
    def generate_pie_chart_data(self, column: str) -> List[Dict[str, Any]]:
        """
        Generate data for a pie chart.
        
        Args:
            column: Column to count values from
            
        Returns:
            Chart data with name and value pairs
        """
        # Count occurrences of each value
        values = [
            row.get(column) for row in self.dataset.rows
            if row.get(column) is not None and row.get(column) != ''
        ]
        
        counts = Counter(values)
        
        return [
            {'name': str(name), 'value': count}
            for name, count in counts.most_common()
        ]
    
    def get_chart_colors(self, count: int) -> List[str]:
        """
        Get a list of chart colors.
        
        Args:
            count: Number of colors needed
            
        Returns:
            List of color strings
        """
        base_colors = [
            '#3b82f6',  # blue
            '#10b981',  # green
            '#f59e0b',  # yellow
            '#8b5cf6',  # purple
            '#ef4444',  # red
        ]
        
        # Repeat colors if we need more
        colors = []
        for i in range(count):
            colors.append(base_colors[i % len(base_colors)])
        
        return colors
    
    def generate_chart_config(self, chart_type: str, x_column: str, y_column: Optional[str] = None) -> ChartConfig:
        """
        Generate a chart configuration.
        
        Args:
            chart_type: Type of chart ('bar', 'line', 'scatter', 'pie')
            x_column: X-axis column
            y_column: Y-axis column (optional for pie charts)
            
        Returns:
            Chart configuration object
        """
        return ChartConfig(
            chart_type=chart_type,  # type: ignore
            x_column=x_column,
            y_column=y_column
        )
    
    def validate_chart_config(self, config: ChartConfig) -> Tuple[bool, Optional[str]]:
        """
        Validate a chart configuration against the dataset.
        
        Args:
            config: Chart configuration to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check if x_column exists
        column_names = [col.name for col in self.dataset.columns]
        
        if config.x_column not in column_names:
            return False, f"Column '{config.x_column}' not found in dataset"
        
        # For non-pie charts, check y_column
        if config.chart_type != 'pie':
            if not config.y_column:
                return False, "Y-column is required for this chart type"
            
            if config.y_column not in column_names:
                return False, f"Column '{config.y_column}' not found in dataset"
            
            # Check if y_column is numeric for most chart types
            y_col = next(col for col in self.dataset.columns if col.name == config.y_column)
            if y_col.type != DataType.NUMERIC:
                return False, f"Column '{config.y_column}' must be numeric for this chart type"
        
        # For pie charts, check if x_column is categorical
        if config.chart_type == 'pie':
            x_col = next(col for col in self.dataset.columns if col.name == config.x_column)
            if x_col.type not in [DataType.CATEGORICAL, DataType.TEXT]:
                return False, f"Column '{config.x_column}' should be categorical for pie charts"
        
        # For scatter plots, check if x_column is numeric
        if config.chart_type == 'scatter':
            x_col = next(col for col in self.dataset.columns if col.name == config.x_column)
            if x_col.type != DataType.NUMERIC:
                return False, f"Column '{config.x_column}' must be numeric for scatter plots"
        
        return True, None
    
    def get_recommended_charts(self) -> List[Dict[str, Any]]:
        """
        Get recommended chart types based on the dataset structure.
        
        Returns:
            List of recommended chart configurations
        """
        recommendations = []
        
        numeric_cols = [col for col in self.dataset.columns if col.type == DataType.NUMERIC]
        categorical_cols = [col for col in self.dataset.columns if col.type in [DataType.CATEGORICAL, DataType.TEXT]]
        
        # Recommend bar charts for categorical x numeric combinations
        for cat_col in categorical_cols[:2]:  # Limit to first 2
            for num_col in numeric_cols[:2]:  # Limit to first 2
                recommendations.append({
                    'type': 'bar',
                    'title': f'{num_col.name} by {cat_col.name}',
                    'x_column': cat_col.name,
                    'y_column': num_col.name,
                    'description': f'Bar chart showing {num_col.name} values grouped by {cat_col.name}'
                })
        
        # Recommend scatter plots for numeric x numeric combinations
        for i, col1 in enumerate(numeric_cols):
            for col2 in numeric_cols[i+1:]:
                recommendations.append({
                    'type': 'scatter',
                    'title': f'{col1.name} vs {col2.name}',
                    'x_column': col1.name,
                    'y_column': col2.name,
                    'description': f'Scatter plot showing relationship between {col1.name} and {col2.name}'
                })
                break  # Only recommend one scatter plot
            if len(recommendations) >= 5:  # Limit total recommendations
                break
        
        # Recommend pie charts for categorical columns with reasonable unique counts
        for cat_col in categorical_cols:
            if 2 <= cat_col.unique_count <= 10:  # Good range for pie charts
                recommendations.append({
                    'type': 'pie',
                    'title': f'Distribution of {cat_col.name}',
                    'x_column': cat_col.name,
                    'y_column': None,
                    'description': f'Pie chart showing the distribution of {cat_col.name} values'
                })
                break  # Only recommend one pie chart
        
        return recommendations[:5]  # Return top 5 recommendations


def export_chart_data(chart_data: List[Dict[str, Any]], filename: str, format_type: str = 'json') -> str:
    """
    Export chart data to various formats.
    
    Args:
        chart_data: Chart data to export
        filename: Output filename
        format_type: Export format ('json', 'csv')
        
    Returns:
        Exported data as string
    """
    if format_type == 'json':
        return json.dumps(chart_data, indent=2)
    
    elif format_type == 'csv':
        if not chart_data:
            return ""
        
        # Get all unique keys
        keys = set()
        for item in chart_data:
            keys.update(item.keys())
        
        keys = sorted(keys)
        
        # Create CSV content
        lines = [','.join(keys)]
        for item in chart_data:
            values = [str(item.get(key, '')) for key in keys]
            lines.append(','.join(values))
        
        return '\n'.join(lines)
    
    else:
        raise ValueError(f"Unsupported export format: {format_type}")