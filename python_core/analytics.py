"""
Advanced analytics and machine learning utilities.
"""
import math
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter
import statistics

from .types import Dataset, DataType, ColumnStats
from .data_utils import safe_parse_number, calculate_correlation, detect_outliers


class DataAnalyzer:
    """Advanced data analysis and insights generation."""
    
    def __init__(self, dataset: Dataset):
        """
        Initialize the analyzer with a dataset.
        
        Args:
            dataset: Dataset to analyze
        """
        self.dataset = dataset
    
    def generate_insights(self) -> List[Dict[str, Any]]:
        """
        Generate intelligent insights about the dataset.
        
        Returns:
            List of insight dictionaries
        """
        insights = []
        
        # Correlation insights
        insights.extend(self._find_correlations())
        
        # Distribution insights
        insights.extend(self._analyze_distributions())
        
        # Anomaly detection
        insights.extend(self._detect_anomalies())
        
        # Pattern insights
        insights.extend(self._find_patterns())
        
        # Sort by confidence and return top insights
        insights.sort(key=lambda x: x.get('confidence', 0), reverse=True)
        return insights[:10]
    
    def _find_correlations(self) -> List[Dict[str, Any]]:
        """Find correlations between numeric columns."""
        insights = []
        numeric_columns = [col for col in self.dataset.columns if col.type == DataType.NUMERIC]
        
        for i, col1 in enumerate(numeric_columns):
            for col2 in numeric_columns[i+1:]:
                # Get paired values
                pairs = []
                for row in self.dataset.rows:
                    val1 = safe_parse_number(row.get(col1.name))
                    val2 = safe_parse_number(row.get(col2.name))
                    if val1 is not None and val2 is not None:
                        pairs.append((val1, val2))
                
                if len(pairs) > 10:
                    x_vals = [p[0] for p in pairs]
                    y_vals = [p[1] for p in pairs]
                    correlation = calculate_correlation(x_vals, y_vals)
                    
                    if abs(correlation) > 0.7:
                        insights.append({
                            'type': 'correlation',
                            'title': f"Strong {'Positive' if correlation > 0 else 'Negative'} Correlation",
                            'description': f"{col1.name} and {col2.name} show a {'positive' if correlation > 0 else 'negative'} correlation of {correlation:.3f}",
                            'confidence': abs(correlation) * 100,
                            'columns': [col1.name, col2.name],
                            'data': {
                                'correlation': correlation,
                                'pairs': pairs[:100]  # Limit for performance
                            }
                        })
        
        return insights
    
    def _analyze_distributions(self) -> List[Dict[str, Any]]:
        """Analyze distributions of numeric columns."""
        insights = []
        
        for col in self.dataset.columns:
            if col.type == DataType.NUMERIC:
                numeric_values = [safe_parse_number(v) for v in col.values]
                values = [v for v in numeric_values if v is not None]
                
                if len(values) > 0:
                    mean_val = statistics.mean(values)
                    std_val = statistics.stdev(values) if len(values) > 1 else 0
                    
                    if std_val > 0:
                        # Calculate skewness
                        skewness = sum((v - mean_val) ** 3 for v in values) / (len(values) * std_val ** 3)
                        
                        if abs(skewness) > 1:
                            insights.append({
                                'type': 'distribution',
                                'title': f"{col.name} Distribution Skew",
                                'description': f"{col.name} shows {'right' if skewness > 0 else 'left'} skewness ({skewness:.2f})",
                                'confidence': min(abs(skewness) * 30, 95),
                                'columns': [col.name],
                                'data': {
                                    'skewness': skewness,
                                    'mean': mean_val,
                                    'std': std_val
                                }
                            })
        
        return insights
    
    def _detect_anomalies(self) -> List[Dict[str, Any]]:
        """Detect anomalies and outliers in the data."""
        insights = []
        
        for col in self.dataset.columns:
            if col.type == DataType.NUMERIC:
                numeric_values = [safe_parse_number(v) for v in col.values]
                values = [v for v in numeric_values if v is not None]
                
                if len(values) > 0:
                    outliers = detect_outliers(values)
                    
                    if outliers:
                        outlier_percentage = (len(outliers) / len(values)) * 100
                        insights.append({
                            'type': 'anomaly',
                            'title': f"Outliers Detected in {col.name}",
                            'description': f"Found {len(outliers)} outliers ({outlier_percentage:.1f}% of data)",
                            'confidence': min(outlier_percentage * 2, 95),
                            'columns': [col.name],
                            'data': {
                                'outliers': outliers[:10],  # Show first 10
                                'count': len(outliers)
                            }
                        })
        
        return insights
    
    def _find_patterns(self) -> List[Dict[str, Any]]:
        """Find patterns in categorical data."""
        insights = []
        
        for col in self.dataset.columns:
            if col.type == DataType.CATEGORICAL:
                non_null_values = [v for v in col.values if v is not None and v != '']
                
                if non_null_values:
                    frequency = Counter(non_null_values)
                    total = len(non_null_values)
                    most_common = frequency.most_common(1)[0]
                    
                    percentage = (most_common[1] / total) * 100
                    
                    if percentage > 50:
                        insights.append({
                            'type': 'pattern',
                            'title': f"Dominant Category in {col.name}",
                            'description': f'"{most_common[0]}" represents {percentage:.1f}% of all values',
                            'confidence': percentage,
                            'columns': [col.name],
                            'data': {
                                'category': most_common[0],
                                'percentage': percentage
                            }
                        })
        
        return insights
    
    def create_prediction_model(self, target_column: str, feature_columns: List[str]) -> Optional[Dict[str, Any]]:
        """
        Create a simple linear regression model.
        
        Args:
            target_column: Target variable column name
            feature_columns: List of feature column names
            
        Returns:
            Model information or None if creation fails
        """
        if not feature_columns:
            return None
        
        # For simplicity, use only the first feature for linear regression
        feature_column = feature_columns[0]
        
        # Get paired values
        pairs = []
        for row in self.dataset.rows:
            x_val = safe_parse_number(row.get(feature_column))
            y_val = safe_parse_number(row.get(target_column))
            if x_val is not None and y_val is not None:
                pairs.append((x_val, y_val))
        
        if len(pairs) < 10:
            return None
        
        # Calculate linear regression coefficients
        n = len(pairs)
        sum_x = sum(p[0] for p in pairs)
        sum_y = sum(p[1] for p in pairs)
        sum_xy = sum(p[0] * p[1] for p in pairs)
        sum_xx = sum(p[0] ** 2 for p in pairs)
        
        denominator = n * sum_xx - sum_x ** 2
        if denominator == 0:
            return None
        
        slope = (n * sum_xy - sum_x * sum_y) / denominator
        intercept = (sum_y - slope * sum_x) / n
        
        # Calculate R-squared
        mean_y = sum_y / n
        total_sum_squares = sum((p[1] - mean_y) ** 2 for p in pairs)
        residual_sum_squares = sum((p[1] - (slope * p[0] + intercept)) ** 2 for p in pairs)
        
        r_squared = 1 - (residual_sum_squares / total_sum_squares) if total_sum_squares > 0 else 0
        
        # Generate predictions
        predictions = []
        for x, y in pairs[:50]:  # Limit to first 50 for performance
            predicted = slope * x + intercept
            predictions.append({
                'actual': y,
                'predicted': predicted,
                'feature': x
            })
        
        return {
            'type': 'linear_regression',
            'target': target_column,
            'features': [feature_column],
            'accuracy': r_squared * 100,
            'predictions': predictions,
            'coefficients': {
                'slope': slope,
                'intercept': intercept
            }
        }
    
    def calculate_feature_importance(self, target_column: str) -> List[Dict[str, Any]]:
        """
        Calculate feature importance using correlation with target.
        
        Args:
            target_column: Target variable column name
            
        Returns:
            List of features with importance scores
        """
        target_col = next((col for col in self.dataset.columns if col.name == target_column), None)
        if not target_col or target_col.type != DataType.NUMERIC:
            return []
        
        target_values = [safe_parse_number(v) for v in target_col.values]
        target_values = [v for v in target_values if v is not None]
        
        if not target_values:
            return []
        
        importance_scores = []
        
        for col in self.dataset.columns:
            if col.name != target_column and col.type == DataType.NUMERIC:
                feature_values = [safe_parse_number(v) for v in col.values]
                feature_values = [v for v in feature_values if v is not None]
                
                if len(feature_values) == len(target_values):
                    correlation = abs(calculate_correlation(feature_values, target_values))
                    importance_scores.append({
                        'feature': col.name,
                        'importance': correlation,
                        'type': 'correlation'
                    })
        
        # Sort by importance
        importance_scores.sort(key=lambda x: x['importance'], reverse=True)
        return importance_scores
    
    def detect_data_drift(self, reference_dataset: Dataset, threshold: float = 0.1) -> List[Dict[str, Any]]:
        """
        Detect data drift between current dataset and a reference dataset.
        
        Args:
            reference_dataset: Reference dataset to compare against
            threshold: Threshold for detecting significant drift
            
        Returns:
            List of drift detection results
        """
        drift_results = []
        
        # Compare column distributions
        for col in self.dataset.columns:
            ref_col = next((c for c in reference_dataset.columns if c.name == col.name), None)
            if not ref_col:
                continue
            
            if col.type == DataType.NUMERIC:
                # Compare means and standard deviations
                current_values = [safe_parse_number(v) for v in col.values]
                current_values = [v for v in current_values if v is not None]
                
                ref_values = [safe_parse_number(v) for v in ref_col.values]
                ref_values = [v for v in ref_values if v is not None]
                
                if current_values and ref_values:
                    current_mean = statistics.mean(current_values)
                    ref_mean = statistics.mean(ref_values)
                    
                    mean_diff = abs(current_mean - ref_mean) / ref_mean if ref_mean != 0 else 0
                    
                    if mean_diff > threshold:
                        drift_results.append({
                            'column': col.name,
                            'type': 'numeric_drift',
                            'metric': 'mean',
                            'current_value': current_mean,
                            'reference_value': ref_mean,
                            'drift_score': mean_diff,
                            'significant': mean_diff > threshold
                        })
            
            elif col.type == DataType.CATEGORICAL:
                # Compare category distributions
                current_dist = Counter([v for v in col.values if v is not None and v != ''])
                ref_dist = Counter([v for v in ref_col.values if v is not None and v != ''])
                
                # Calculate distribution difference (simplified)
                all_categories = set(current_dist.keys()) | set(ref_dist.keys())
                total_current = sum(current_dist.values())
                total_ref = sum(ref_dist.values())
                
                if total_current > 0 and total_ref > 0:
                    drift_score = 0
                    for category in all_categories:
                        current_prop = current_dist.get(category, 0) / total_current
                        ref_prop = ref_dist.get(category, 0) / total_ref
                        drift_score += abs(current_prop - ref_prop)
                    
                    drift_score /= 2  # Normalize
                    
                    if drift_score > threshold:
                        drift_results.append({
                            'column': col.name,
                            'type': 'categorical_drift',
                            'metric': 'distribution',
                            'drift_score': drift_score,
                            'significant': drift_score > threshold
                        })
        
        return drift_results