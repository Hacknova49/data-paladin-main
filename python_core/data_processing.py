"""
Data processing and manipulation functionality.
"""
from typing import List, Dict, Any, Optional, Callable
import re
from .types import Dataset, FilterRule, FilterOperator, SortDirection


class DataProcessor:
    """Handles data filtering, sorting, and manipulation operations."""
    
    def __init__(self, dataset: Dataset):
        """
        Initialize the data processor with a dataset.
        
        Args:
            dataset: The dataset to process
        """
        self.dataset = dataset
        self._filtered_rows: Optional[List[Dict[str, Any]]] = None
        self._search_term = ""
        self._filter_rules: List[FilterRule] = []
        self._sort_column = ""
        self._sort_direction = SortDirection.ASC
    
    @property
    def filtered_rows(self) -> List[Dict[str, Any]]:
        """Get the currently filtered rows."""
        if self._filtered_rows is None:
            self._apply_all_filters()
        return self._filtered_rows or []
    
    @property
    def total_filtered_rows(self) -> int:
        """Get the count of filtered rows."""
        return len(self.filtered_rows)
    
    def set_search_term(self, term: str) -> None:
        """
        Set the global search term.
        
        Args:
            term: Search term to filter by
        """
        self._search_term = term.lower()
        self._filtered_rows = None  # Reset cache
    
    def add_filter_rule(self, rule: FilterRule) -> None:
        """
        Add a filter rule.
        
        Args:
            rule: Filter rule to add
        """
        self._filter_rules.append(rule)
        self._filtered_rows = None  # Reset cache
    
    def remove_filter_rule(self, index: int) -> None:
        """
        Remove a filter rule by index.
        
        Args:
            index: Index of the rule to remove
        """
        if 0 <= index < len(self._filter_rules):
            self._filter_rules.pop(index)
            self._filtered_rows = None  # Reset cache
    
    def update_filter_rule(self, index: int, rule: FilterRule) -> None:
        """
        Update a filter rule at the given index.
        
        Args:
            index: Index of the rule to update
            rule: New filter rule
        """
        if 0 <= index < len(self._filter_rules):
            self._filter_rules[index] = rule
            self._filtered_rows = None  # Reset cache
    
    def set_sort(self, column: str, direction: SortDirection = SortDirection.ASC) -> None:
        """
        Set sorting parameters.
        
        Args:
            column: Column name to sort by
            direction: Sort direction
        """
        self._sort_column = column
        self._sort_direction = direction
        self._filtered_rows = None  # Reset cache
    
    def clear_all_filters(self) -> None:
        """Clear all filters and sorting."""
        self._search_term = ""
        self._filter_rules = []
        self._sort_column = ""
        self._sort_direction = SortDirection.ASC
        self._filtered_rows = None  # Reset cache
    
    def _apply_all_filters(self) -> None:
        """Apply all filters and sorting to the dataset."""
        data = list(self.dataset.rows)  # Create a copy
        
        # Apply search filter
        if self._search_term:
            data = self._apply_search_filter(data, self._search_term)
        
        # Apply filter rules
        for rule in self._filter_rules:
            if rule.column and rule.value:
                data = self._apply_filter_rule(data, rule)
        
        # Apply sorting
        if self._sort_column:
            data = self._apply_sorting(data, self._sort_column, self._sort_direction)
        
        self._filtered_rows = data
    
    def _apply_search_filter(self, data: List[Dict[str, Any]], search_term: str) -> List[Dict[str, Any]]:
        """
        Apply global search filter.
        
        Args:
            data: Data to filter
            search_term: Search term (already lowercased)
            
        Returns:
            Filtered data
        """
        def row_matches(row: Dict[str, Any]) -> bool:
            return any(
                search_term in str(value).lower()
                for value in row.values()
                if value is not None
            )
        
        return [row for row in data if row_matches(row)]
    
    def _apply_filter_rule(self, data: List[Dict[str, Any]], rule: FilterRule) -> List[Dict[str, Any]]:
        """
        Apply a single filter rule.
        
        Args:
            data: Data to filter
            rule: Filter rule to apply
            
        Returns:
            Filtered data
        """
        def row_matches(row: Dict[str, Any]) -> bool:
            cell_value = str(row.get(rule.column, '')).lower()
            filter_value = rule.value.lower()
            
            if rule.operator == FilterOperator.EQUALS:
                return cell_value == filter_value
            elif rule.operator == FilterOperator.CONTAINS:
                return filter_value in cell_value
            elif rule.operator == FilterOperator.NOT_EQUALS:
                return cell_value != filter_value
            elif rule.operator == FilterOperator.GREATER:
                try:
                    return float(cell_value) > float(filter_value)
                except ValueError:
                    return False
            elif rule.operator == FilterOperator.LESS:
                try:
                    return float(cell_value) < float(filter_value)
                except ValueError:
                    return False
            
            return True
        
        return [row for row in data if row_matches(row)]
    
    def _apply_sorting(self, data: List[Dict[str, Any]], column: str, direction: SortDirection) -> List[Dict[str, Any]]:
        """
        Apply sorting to the data.
        
        Args:
            data: Data to sort
            column: Column to sort by
            direction: Sort direction
            
        Returns:
            Sorted data
        """
        def sort_key(row: Dict[str, Any]) -> Any:
            value = row.get(column)
            
            if value is None:
                return float('inf')  # Put None values at the end
            
            # Try to convert to number for numeric sorting
            try:
                return float(value)
            except (ValueError, TypeError):
                return str(value).lower()
        
        reverse = direction == SortDirection.DESC
        return sorted(data, key=sort_key, reverse=reverse)


def remove_duplicates(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Remove duplicate rows from the dataset.
    
    Args:
        rows: List of data rows
        
    Returns:
        List with duplicates removed
    """
    seen = set()
    unique_rows = []
    
    for row in rows:
        row_key = tuple(sorted(row.items()))
        if row_key not in seen:
            seen.add(row_key)
            unique_rows.append(row)
    
    return unique_rows


def handle_missing_values(
    rows: List[Dict[str, Any]], 
    column: str, 
    method: str, 
    fill_value: Any = None
) -> List[Dict[str, Any]]:
    """
    Handle missing values in a specific column.
    
    Args:
        rows: List of data rows
        column: Column name to process
        method: Method to handle missing values ('remove', 'fill', 'mean', 'mode')
        fill_value: Value to fill with (for 'fill' method)
        
    Returns:
        Processed data rows
    """
    if method == 'remove':
        return [
            row for row in rows 
            if row.get(column) is not None and row.get(column) != ''
        ]
    
    elif method == 'fill' and fill_value is not None:
        return [
            {**row, column: row.get(column) or fill_value}
            for row in rows
        ]
    
    elif method == 'mean':
        # Calculate mean for numeric columns
        values = []
        for row in rows:
            val = row.get(column)
            if val is not None and val != '':
                try:
                    values.append(float(val))
                except (ValueError, TypeError):
                    pass
        
        if values:
            mean_val = sum(values) / len(values)
            return [
                {**row, column: row.get(column) or mean_val}
                for row in rows
            ]
    
    elif method == 'mode':
        # Calculate mode (most frequent value)
        from collections import Counter
        values = [
            row.get(column) for row in rows 
            if row.get(column) is not None and row.get(column) != ''
        ]
        
        if values:
            mode_val = Counter(values).most_common(1)[0][0]
            return [
                {**row, column: row.get(column) or mode_val}
                for row in rows
            ]
    
    return rows


def standardize_text(rows: List[Dict[str, Any]], column: str) -> List[Dict[str, Any]]:
    """
    Standardize text in a column (trim, normalize spaces, lowercase).
    
    Args:
        rows: List of data rows
        column: Column name to standardize
        
    Returns:
        Rows with standardized text
    """
    def standardize_value(value: Any) -> Any:
        if isinstance(value, str):
            # Trim whitespace, normalize multiple spaces, convert to lowercase
            return re.sub(r'\s+', ' ', value.strip().lower())
        return value
    
    return [
        {**row, column: standardize_value(row.get(column))}
        for row in rows
    ]


def remove_outliers(rows: List[Dict[str, Any]], column: str) -> List[Dict[str, Any]]:
    """
    Remove outliers from a numeric column using IQR method.
    
    Args:
        rows: List of data rows
        column: Column name to process
        
    Returns:
        Rows with outliers removed
    """
    # Extract numeric values
    values = []
    for row in rows:
        val = row.get(column)
        if val is not None and val != '':
            try:
                values.append(float(val))
            except (ValueError, TypeError):
                pass
    
    if not values:
        return rows
    
    # Calculate IQR bounds
    sorted_values = sorted(values)
    n = len(sorted_values)
    q1 = sorted_values[int(n * 0.25)]
    q3 = sorted_values[int(n * 0.75)]
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    # Filter rows
    def is_not_outlier(row: Dict[str, Any]) -> bool:
        val = row.get(column)
        if val is None or val == '':
            return True
        
        try:
            num_val = float(val)
            return lower_bound <= num_val <= upper_bound
        except (ValueError, TypeError):
            return True
    
    return [row for row in rows if is_not_outlier(row)]