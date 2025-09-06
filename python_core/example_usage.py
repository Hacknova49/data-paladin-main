"""
Example usage of the Python core data analysis library.
"""
import json
from typing import List, Dict, Any

from . import (
    analyze_dataset,
    DataProcessor,
    ChartDataGenerator,
    DataAnalyzer,
    generate_data_profile,
    FilterRule,
    FilterOperator,
    SortDirection
)


def load_sample_data() -> List[Dict[str, Any]]:
    """Load sample data for demonstration."""
    return [
        {"name": "John", "age": 25, "city": "NYC", "salary": 50000, "department": "Engineering"},
        {"name": "Jane", "age": 30, "city": "LA", "salary": 60000, "department": "Marketing"},
        {"name": "Bob", "age": 35, "city": "Chicago", "salary": 70000, "department": "Engineering"},
        {"name": "Alice", "age": 28, "city": "NYC", "salary": 55000, "department": "Design"},
        {"name": "Charlie", "age": 32, "city": "LA", "salary": 65000, "department": "Marketing"},
        {"name": "Diana", "age": 29, "city": "Chicago", "salary": 58000, "department": "Engineering"},
        {"name": "Eve", "age": 26, "city": "NYC", "salary": 52000, "department": "Design"},
        {"name": "Frank", "age": 31, "city": "LA", "salary": 62000, "department": "Marketing"},
    ]


def demonstrate_basic_analysis():
    """Demonstrate basic data analysis functionality."""
    print("=== Basic Data Analysis Demo ===")
    
    # Load and analyze data
    raw_data = load_sample_data()
    dataset = analyze_dataset(raw_data, "sample_data.json")
    
    print(f"Dataset: {dataset.name}")
    print(f"Rows: {dataset.total_rows}")
    print(f"Columns: {dataset.total_columns}")
    print(f"Memory usage: {dataset.memory_usage} bytes")
    
    print("\nColumn Information:")
    for col in dataset.columns:
        print(f"  {col.name}: {col.type.value} ({col.unique_count} unique, {col.missing_count} missing)")
    
    # Generate data profile
    profile = generate_data_profile(dataset)
    print(f"\nData Quality:")
    print(f"  Completeness: {profile.overview['completeness']:.1f}%")
    print(f"  Duplicates: {profile.quality.duplicates}")
    print(f"  Missing values: {profile.quality.missing_values}")
    print(f"  Outliers: {profile.quality.outliers}")


def demonstrate_data_processing():
    """Demonstrate data processing and filtering."""
    print("\n=== Data Processing Demo ===")
    
    raw_data = load_sample_data()
    dataset = analyze_dataset(raw_data, "sample_data.json")
    
    # Create data processor
    processor = DataProcessor(dataset)
    
    # Add search filter
    processor.set_search_term("NYC")
    print(f"After search filter 'NYC': {processor.total_filtered_rows} rows")
    
    # Add filter rule
    filter_rule = FilterRule(
        column="age",
        operator=FilterOperator.GREATER,
        value="28"
    )
    processor.add_filter_rule(filter_rule)
    print(f"After age > 28 filter: {processor.total_filtered_rows} rows")
    
    # Apply sorting
    processor.set_sort("salary", SortDirection.DESC)
    print(f"After sorting by salary (desc): {processor.total_filtered_rows} rows")
    
    # Show filtered results
    print("\nFiltered Results:")
    for i, row in enumerate(processor.filtered_rows[:3]):
        print(f"  {i+1}. {row['name']}, {row['age']}, {row['city']}, ${row['salary']}")


def demonstrate_visualization():
    """Demonstrate chart data generation."""
    print("\n=== Visualization Demo ===")
    
    raw_data = load_sample_data()
    dataset = analyze_dataset(raw_data, "sample_data.json")
    
    # Create chart generator
    chart_gen = ChartDataGenerator(dataset)
    
    # Generate bar chart data
    bar_data = chart_gen.generate_bar_chart_data("department", "salary")
    print(f"Bar chart data points: {len(bar_data)}")
    
    # Generate pie chart data
    pie_data = chart_gen.generate_pie_chart_data("city")
    print(f"Pie chart data: {pie_data}")
    
    # Get chart recommendations
    recommendations = chart_gen.get_recommended_charts()
    print(f"\nChart Recommendations ({len(recommendations)}):")
    for rec in recommendations[:3]:
        print(f"  - {rec['type']}: {rec['title']}")


def demonstrate_analytics():
    """Demonstrate advanced analytics."""
    print("\n=== Advanced Analytics Demo ===")
    
    raw_data = load_sample_data()
    dataset = analyze_dataset(raw_data, "sample_data.json")
    
    # Create analyzer
    analyzer = DataAnalyzer(dataset)
    
    # Generate insights
    insights = analyzer.generate_insights()
    print(f"Generated {len(insights)} insights:")
    
    for insight in insights[:3]:
        print(f"  - {insight['type']}: {insight['title']}")
        print(f"    {insight['description']} (confidence: {insight['confidence']:.1f}%)")
    
    # Create prediction model
    model = analyzer.create_prediction_model("salary", ["age"])
    if model:
        print(f"\nPrediction Model:")
        print(f"  Type: {model['type']}")
        print(f"  Accuracy: {model['accuracy']:.1f}%")
        print(f"  Features: {model['features']}")
    
    # Calculate feature importance
    importance = analyzer.calculate_feature_importance("salary")
    print(f"\nFeature Importance for 'salary':")
    for feat in importance[:3]:
        print(f"  {feat['feature']}: {feat['importance']:.3f}")


def main():
    """Run all demonstrations."""
    demonstrate_basic_analysis()
    demonstrate_data_processing()
    demonstrate_visualization()
    demonstrate_analytics()
    
    print("\n=== Demo Complete ===")
    print("The Python core library provides equivalent functionality to the TypeScript version.")
    print("Key features:")
    print("- Type-safe data structures using dataclasses and enums")
    print("- Comprehensive data analysis and profiling")
    print("- Flexible data processing and filtering")
    print("- Chart data generation for visualization")
    print("- Advanced analytics and machine learning")


if __name__ == "__main__":
    main()