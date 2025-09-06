/**
 * Python API service for data processing and analysis
 */

import { 
  Dataset, 
  PythonApiResponse, 
  DataAnalysisRequest, 
  FilterRequest, 
  ChartDataRequest,
  InsightRequest 
} from '@/types/data';

const API_BASE_URL = process.env.VITE_PYTHON_API_URL || 'http://localhost:8000';

class PythonApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'PythonApiError';
  }
}

/**
 * Generic API request handler with error handling
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new PythonApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const result: PythonApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new PythonApiError(result.error || 'Unknown API error');
    }

    return result.data as T;
  } catch (error) {
    if (error instanceof PythonApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new PythonApiError('Unable to connect to Python backend. Please ensure the server is running.');
    }
    
    throw new PythonApiError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze dataset using Python backend
 */
export async function analyzeDataset(data: Record<string, any>[], filename: string): Promise<Dataset> {
  const request: DataAnalysisRequest = { data, filename };
  
  return apiRequest<Dataset>('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Process data with filters and sorting
 */
export async function processData(request: FilterRequest): Promise<{
  filteredRows: Record<string, any>[];
  totalRows: number;
}> {
  return apiRequest('/api/process', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Generate chart data
 */
export async function generateChartData(request: ChartDataRequest): Promise<any[]> {
  return apiRequest('/api/chart-data', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get data insights using AI analytics
 */
export async function getDataInsights(request: InsightRequest): Promise<any[]> {
  return apiRequest('/api/insights', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get chart recommendations
 */
export async function getChartRecommendations(dataset: Dataset): Promise<any[]> {
  return apiRequest('/api/chart-recommendations', {
    method: 'POST',
    body: JSON.stringify({ dataset }),
  });
}

/**
 * Generate data profile and quality metrics
 */
export async function generateDataProfile(dataset: Dataset): Promise<any> {
  return apiRequest('/api/data-profile', {
    method: 'POST',
    body: JSON.stringify({ dataset }),
  });
}

/**
 * Clean data (remove duplicates, handle missing values, etc.)
 */
export async function cleanData(dataset: Dataset, operations: any[]): Promise<Dataset> {
  return apiRequest('/api/clean-data', {
    method: 'POST',
    body: JSON.stringify({ dataset, operations }),
  });
}

/**
 * Create prediction model
 */
export async function createPredictionModel(
  dataset: Dataset, 
  targetColumn: string, 
  featureColumns: string[]
): Promise<any> {
  return apiRequest('/api/prediction-model', {
    method: 'POST',
    body: JSON.stringify({ dataset, targetColumn, featureColumns }),
  });
}

/**
 * Health check for Python backend
 */
export async function healthCheck(): Promise<{ status: string; version: string }> {
  return apiRequest('/api/health');
}

// Export the error class for use in components
export { PythonApiError };