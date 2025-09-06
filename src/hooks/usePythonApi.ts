/**
 * React hooks for Python API integration
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { 
  Dataset, 
  FilterRule, 
  SortDirection,
  ChartConfig 
} from '@/types/data';
import {
  analyzeDataset,
  processData,
  generateChartData,
  getDataInsights,
  getChartRecommendations,
  generateDataProfile,
  cleanData,
  createPredictionModel,
  healthCheck,
  PythonApiError
} from '@/services/pythonApi';

interface UseAsyncStateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

/**
 * Generic hook for async operations with loading and error states
 */
function useAsyncState<T>(options: UseAsyncStateOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (options.showToast !== false) {
        toast.error(error.message);
      }
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Hook for dataset analysis
 */
export function useDatasetAnalysis() {
  return useAsyncState<Dataset>({
    onSuccess: (dataset) => {
      toast.success(`Dataset analyzed: ${dataset.totalRows} rows, ${dataset.totalColumns} columns`);
    }
  });
}

/**
 * Hook for data processing with filters and sorting
 */
export function useDataProcessing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data, loading, error, execute } = useAsyncState<{
    filteredRows: Record<string, any>[];
    totalRows: number;
  }>();

  const processDataset = useCallback(async (dataset: Dataset) => {
    return execute(() => processData({
      dataset,
      searchTerm,
      filterRules,
      sortColumn,
      sortDirection
    }));
  }, [execute, searchTerm, filterRules, sortColumn, sortDirection]);

  const addFilterRule = useCallback(() => {
    setFilterRules(prev => [...prev, { column: '', operator: 'contains', value: '' }]);
  }, []);

  const updateFilterRule = useCallback((index: number, field: keyof FilterRule, value: string) => {
    setFilterRules(prev => {
      const newRules = [...prev];
      newRules[index] = { ...newRules[index], [field]: value };
      return newRules;
    });
  }, []);

  const removeFilterRule = useCallback((index: number) => {
    setFilterRules(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setFilterRules([]);
    setSortColumn('');
  }, []);

  return {
    // State
    searchTerm,
    filterRules,
    sortColumn,
    sortDirection,
    filteredRows: data?.filteredRows || [],
    totalRows: data?.totalRows || 0,
    loading,
    error,
    
    // Actions
    setSearchTerm,
    setSortColumn,
    setSortDirection,
    addFilterRule,
    updateFilterRule,
    removeFilterRule,
    clearAllFilters,
    processDataset
  };
}

/**
 * Hook for chart data generation
 */
export function useChartData() {
  return useAsyncState<any[]>();
}

/**
 * Hook for data insights
 */
export function useDataInsights() {
  return useAsyncState<any[]>({
    onSuccess: (insights) => {
      toast.success(`Generated ${insights.length} insights`);
    }
  });
}

/**
 * Hook for chart recommendations
 */
export function useChartRecommendations() {
  return useAsyncState<any[]>();
}

/**
 * Hook for data profile generation
 */
export function useDataProfile() {
  return useAsyncState<any>();
}

/**
 * Hook for data cleaning operations
 */
export function useDataCleaning() {
  return useAsyncState<Dataset>({
    onSuccess: () => {
      toast.success('Data cleaning completed successfully');
    }
  });
}

/**
 * Hook for prediction model creation
 */
export function usePredictionModel() {
  return useAsyncState<any>({
    onSuccess: (model) => {
      toast.success(`Prediction model created with ${model.accuracy?.toFixed(1)}% accuracy`);
    }
  });
}

/**
 * Hook for Python backend health check
 */
export function usePythonBackendHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      await healthCheck();
      setIsHealthy(true);
    } catch (error) {
      setIsHealthy(false);
      console.warn('Python backend health check failed:', error);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { isHealthy, checking, checkHealth };
}