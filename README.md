# DataExplorer 🧠✨ (Python-Powered)

A powerful, user-friendly data analysis tool powered by Python that transforms CSV and Excel files into beautiful insights without requiring any coding knowledge.

![DataExplorer Demo](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop)

## ✨ Features

### 🐍 **Python-Powered Backend**
- **High-Performance Processing**: Leverages Python's data science ecosystem for fast, reliable analysis
- **Advanced Analytics**: Statistical analysis, machine learning, and AI-powered insights
- **Scalable Architecture**: Handles large datasets efficiently with optimized algorithms

### 📊 Smart Data Analysis
- **Automatic Type Detection**: Intelligently identifies numeric, categorical, datetime, and text columns
- **Data Quality Assessment**: Comprehensive analysis of completeness, duplicates, and outliers
- **Statistical Insights**: Mean, median, mode, standard deviation, and correlation analysis

### 🎨 Beautiful Visualizations
- **Interactive Charts**: Bar charts, line graphs, scatter plots, and pie charts
- **Real-time Updates**: Dynamic visualizations that update as you filter and manipulate data
- **Export Ready**: Download charts and reports in multiple formats

### 🔧 Data Manipulation
- **Advanced Filtering**: Multiple filter rules with various operators
- **Smart Search**: Global search across all columns with debounced input
- **Column Management**: Hide, show, and reorder columns as needed
- **Sorting**: Multi-column sorting with intelligent type handling

### 🧹 Data Cleaning
- **Duplicate Detection**: Identify and remove duplicate rows
- **Missing Value Handling**: Fill, remove, or interpolate missing data
- **Outlier Detection**: Statistical outlier identification using IQR method
- **Text Standardization**: Clean and normalize text data

### 🤖 AI-Powered Insights
- **Correlation Discovery**: Automatic detection of relationships between variables
- **Pattern Recognition**: Identify trends and anomalies in your data
- **Predictive Modeling**: Simple linear regression and forecasting
- **Quality Recommendations**: Intelligent suggestions for data improvement

### 📤 Export & Share
- **Multiple Formats**: Export to CSV, JSON, Excel, and PDF
- **Custom Reports**: Generate comprehensive analysis reports
- **Shareable Links**: Easy sharing with team members
- **Email Integration**: Send reports directly via email

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.8+** with pip
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Architecture
- **Frontend**: React + TypeScript + Vite
- **Backend**: Python + FastAPI
- **Communication**: REST API with JSON

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/data-explorer.git
   cd data-explorer
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Python backend dependencies**
   ```bash
   cd python_core
   pip install -r requirements.txt
   cd ..
   ```

4. **Start both servers**
   ```bash
   # Option 1: Start both simultaneously
   npm run start:full
   
   # Option 2: Start separately
   npm run dev          # Frontend (port 8080)
   npm run dev:python   # Backend (port 8000)
   ```bash

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Quick Start

1. **Ensure Backend is Running**: Check the Python backend status indicator
2. **Upload Your Data**: Drag and drop a CSV or Excel file onto the upload area
3. **Explore**: Browse through the automatically generated data preview and statistics
4. **Visualize**: Create charts using the visualization tab
5. **Clean**: Use the data cleaning tools to improve data quality
6. **Analyze**: Discover insights with AI-powered analytics
7. **Export**: Download your results in your preferred format

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── DataPreview.tsx # Main data preview component
│   ├── DataManipulationPython.tsx
│   ├── PythonBackendStatus.tsx
│   └── ...
├── hooks/              # React hooks for Python API
│   ├── usePythonApi.ts
│   └── ...
├── services/           # API services
│   ├── pythonApi.ts    # Python backend communication
│   └── ...
├── types/              # TypeScript type definitions
├── pages/              # Page components
└── styles/             # CSS and styling

python_core/            # Python backend
├── types.py           # Data type definitions
├── data_utils.py      # Core data processing
├── data_processing.py # Filtering and manipulation
├── visualization.py   # Chart data generation
├── analytics.py       # AI-powered insights
├── main.py           # FastAPI server
└── requirements.txt   # Python dependencies
```

## 🛠️ Built With

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Visualizations**: Recharts
- **File Handling**: React Dropzone
- **Notifications**: Sonner

### Backend
- **Python 3.8+** with FastAPI
- **Data Processing**: Pure Python (no external dependencies for core logic)
- **API**: RESTful JSON API with automatic documentation
- **Type Safety**: Pydantic models and Python type hints

### File Processing
- **CSV**: Papa Parse (frontend)
- **Excel**: SheetJS (frontend)
- **Analysis**: Python backend processing

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Test Python backend
cd python_core
python -m pytest  # If you add pytest later
```

## 📦 Building for Production

```bash
# Build frontend
npm run build

# Preview the production build
npm run preview

# For production deployment, you'll need to:
# 1. Build the React app
# 2. Deploy Python backend to a server
# 3. Update VITE_PYTHON_API_URL to point to production backend
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
VITE_PYTHON_API_URL=http://localhost:8000
NODE_ENV=development
```

For production, update the Python API URL to your deployed backend.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

**Prerequisites for Contributors:**
- Node.js 18+ and npm
- Python 3.8+ and pip
- Familiarity with React/TypeScript and Python

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Set up both frontend and backend development environments
4. Make your changes (frontend in `src/`, backend in `python_core/`)
5. Add tests for new functionality
6. Ensure all tests pass (`npm test`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Code Style

- **Frontend**: ESLint and Prettier for TypeScript/React
- **Backend**: Follow PEP 8 for Python code
- Use meaningful commit messages
- Add type hints for all Python functions
- Write meaningful commit messages
- Add docstrings for Python functions and JSDoc for TypeScript

## 📊 Performance

DataExplorer is optimized for performance with a hybrid architecture:

### Frontend Optimizations
- **React Optimizations**: useMemo, useCallback, lazy loading
- **Debounced Operations**: Prevents excessive API calls
- **Efficient Rendering**: Virtual scrolling for large tables

### Backend Optimizations  
- **Pure Python**: Fast processing without heavy dependencies
- **Memory Efficient**: Optimized data structures and algorithms
- **Async Processing**: FastAPI with async/await support
- **Scalable**: Can handle large datasets efficiently

## 🔒 Security

- **Local Processing**: Data analysis happens on your local Python backend
- **No External Data Transfer**: Your data stays on your machine
- **Secure File Handling**: Robust validation and error handling
- **API Security**: Input validation and error handling
- **CORS Protection**: Configured for local development

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐍 Python Requirements

- Python 3.8 or higher
- See `python_core/requirements.txt` for dependencies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python web framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Recharts](https://recharts.org/) for the charting library
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [SheetJS](https://sheetjs.com/) for Excel file support

## 📞 Support

- 📧 Email: support@dataexplorer.com
- 💬 Discord: [Join our community](https://discord.gg/dataexplorer)
- 📖 Documentation: [docs.dataexplorer.com](https://docs.dataexplorer.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/data-explorer/issues)

## 🗺️ Roadmap

### Backend Enhancements
- [ ] **Advanced ML Models**: Integration with scikit-learn, pandas
- [ ] **Database Support**: PostgreSQL, SQLite integration
- [ ] **Streaming Data**: Real-time data processing capabilities

### Frontend & General
- [ ] **Collaboration**: Multi-user editing and sharing capabilities
- [ ] **Custom Plugins**: Extensible architecture for custom analysis tools
- [ ] **Mobile App**: Native mobile applications for iOS and Android
- [ ] **Cloud Sync**: Optional cloud storage and synchronization

---

Made with ❤️ and 🐍 by the DataExplorer team