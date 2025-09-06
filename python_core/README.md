# Python Core Data Analysis Library

A comprehensive Python library converted from TypeScript, providing powerful data processing, visualization, and analytics capabilities without external dependencies.

## 🚀 Features

### 📊 **Data Analysis**
- **Automatic Type Detection**: Intelligently identifies numeric, categorical, datetime, and text columns
- **Data Quality Assessment**: Comprehensive analysis of completeness, duplicates, and outliers
- **Statistical Analysis**: Mean, median, mode, standard deviation, and correlation analysis

### 🔧 **Data Processing**
- **Advanced Filtering**: Multiple filter rules with various operators
- **Smart Search**: Global search across all columns
- **Data Cleaning**: Handle missing values, remove duplicates, standardize text
- **Sorting & Manipulation**: Multi-column sorting with intelligent type handling

### 📈 **Visualization Support**
- **Chart Data Generation**: Prepare data for bar, line, scatter, and pie charts
- **Smart Recommendations**: Automatic chart type suggestions based on data
- **Export Capabilities**: Export chart data in multiple formats

### 🤖 **Advanced Analytics**
- **Correlation Discovery**: Automatic detection of relationships between variables
- **Anomaly Detection**: Statistical outlier identification using IQR method
- **Pattern Recognition**: Identify trends and patterns in categorical data
- **Predictive Modeling**: Simple linear regression implementation
- **Data Drift Detection**: Compare datasets for distribution changes

## 📦 Installation

```bash
# Clone or download the python_core directory
# No external dependencies required - uses only Python standard library
```

## 🔧 Quick Start

```python
from python_core import analyze_dataset, DataProcessor, ChartDataGenerator, DataAnalyzer

# Load your data (list of dictionaries)
data = [
    {"name": "John", "age": 25, "salary": 50000},
    {"name": "Jane", "age": 30, "salary": 60000},
    # ... more data
]

# Analyze the dataset
dataset = analyze_dataset(data, "my_data.csv")
print(f"Dataset has {dataset.total_rows} rows and {dataset.total_columns} columns")

# Process and filter data
processor = DataProcessor(dataset)
processor.set_search_term("John")
filtered_data = processor.filtered_rows

# Generate chart data
chart_gen = ChartDataGenerator(dataset)
bar_data = chart_gen.generate_bar_chart_data("name", "salary")

# Advanced analytics
analyzer = DataAnalyzer(dataset)
insights = analyzer.generate_insights()
```

## 📚 Core Components

### **Types & Data Structures**
```python
from python_core.types import Dataset, DataColumn, FilterRule, ChartConfig
```
- Type-safe data structures using Python dataclasses
- Enums for consistent data types and operations
- Comprehensive type hints throughout

### **Data Utilities**
```python
from python_core.data_utils import (
    detect_column_type,
    analyze_dataset,
    calculate_correlation,
    detect_outliers
)
```
- Pure functions for data analysis
- Statistical calculations
- Data quality assessment

### **Data Processing**
```python
from python_core.data_processing import DataProcessor, remove_duplicates
```
- Flexible filtering and sorting
- Data cleaning operations
- Memory-efficient processing

### **Visualization**
```python
from python_core.visualization import ChartDataGenerator
```
- Chart data preparation
- Smart chart recommendations
- Export capabilities

### **Analytics**
```python
from python_core.analytics import DataAnalyzer
```
- Insight generation
- Predictive modeling
- Feature importance calculation

## 🎯 Example Usage

### Basic Data Analysis
```python
from python_core import analyze_dataset, generate_data_profile

# Analyze your dataset
dataset = analyze_dataset(your_data, "filename.csv")

# Generate comprehensive profile
profile = generate_data_profile(dataset)
print(f"Data completeness: {profile.overview['completeness']:.1f}%")
```

### Data Filtering & Processing
```python
from python_core import DataProcessor, FilterRule, FilterOperator

processor = DataProcessor(dataset)

# Add filters
filter_rule = FilterRule(
    column="age",
    operator=FilterOperator.GREATER,
    value="25"
)
processor.add_filter_rule(filter_rule)

# Get filtered results
results = processor.filtered_rows
```

### Chart Data Generation
```python
from python_core import ChartDataGenerator

chart_gen = ChartDataGenerator(dataset)

# Generate different chart types
bar_data = chart_gen.generate_bar_chart_data("category", "value")
pie_data = chart_gen.generate_pie_chart_data("category")
scatter_data = chart_gen.generate_scatter_plot_data("x_col", "y_col")

# Get recommendations
recommendations = chart_gen.get_recommended_charts()
```

### Advanced Analytics
```python
from python_core import DataAnalyzer

analyzer = DataAnalyzer(dataset)

# Generate insights
insights = analyzer.generate_insights()
for insight in insights:
    print(f"{insight['type']}: {insight['title']}")

# Create prediction model
model = analyzer.create_prediction_model("target_col", ["feature_col"])
if model:
    print(f"Model accuracy: {model['accuracy']:.1f}%")
```

## 🧪 Testing

```python
# Run the example usage
python -m python_core.example_usage

# The library includes comprehensive examples and demonstrations
```

## 🔄 TypeScript Equivalency

This Python library provides equivalent functionality to the original TypeScript implementation:

| TypeScript | Python | Description |
|------------|--------|-------------|
| `interface Dataset` | `@dataclass Dataset` | Type-safe data structures |
| `useDataProcessing` | `DataProcessor` | Data filtering and manipulation |
| `DataVisualization` | `ChartDataGenerator` | Chart data preparation |
| `AdvancedAnalytics` | `DataAnalyzer` | AI-powered insights |
| `detectColumnType()` | `detect_column_type()` | Automatic type detection |
| `calculateCorrelation()` | `calculate_correlation()` | Statistical analysis |

## 🎨 Key Differences from TypeScript

### **Advantages of Python Version:**
- **No Dependencies**: Uses only Python standard library
- **Better Statistical Support**: Built-in `statistics` module
- **Cleaner Syntax**: Python's readability and expressiveness
- **Type Safety**: Comprehensive type hints and dataclasses
- **Memory Efficient**: Optimized for large datasets

### **Design Patterns:**
- **Dataclasses** instead of TypeScript interfaces
- **Enums** for consistent constants
- **Context managers** for resource management
- **Generator functions** for memory efficiency
- **Pure functions** for testability

## 📊 Performance

The Python implementation is optimized for:
- **Memory efficiency** with generator functions
- **Fast processing** using built-in data structures
- **Scalability** for large datasets
- **Pure functions** for easy testing and debugging

## 🤝 Contributing

The library follows Python best practices:
- **PEP 8** code style
- **Type hints** throughout
- **Docstrings** for all functions
- **Pure functions** where possible
- **Comprehensive error handling**

## 📄 License

Same license as the original TypeScript project.

---

**Converted from TypeScript with ❤️ - Maintaining full feature parity while leveraging Python's strengths**