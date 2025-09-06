import { useState, useCallback, useMemo } from 'react';
import { Dataset, FilterRule, SortDirection } from '@/types/data';
import { debounce } from '@/utils/dataUtils';

interface UseDataProcessingProps {
  dataset: Dataset;
}

interface ProcessedData {
  filteredRows: Record<string, any>[];
  totalRows: number;
  isLoading: boolean;
}

export const useDataProcessing = ({ dataset }: UseDataProcessingProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounced search to avoid excessive filtering
  const debouncedSetSearchTerm = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    []
  );

  const processedData = useMemo((): ProcessedData => {
    setIsProcessing(true);
    
    try {
      let data = [...dataset.rows];

      // Apply search filter
      if (searchTerm) {
        data = data.filter(row =>
          Object.values(row).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }

      // Apply filter rules
      filterRules.forEach(rule => {
        if (rule.column && rule.value) {
          data = data.filter(row => {
            const cellValue = row[rule.column]?.toString().toLowerCase() || '';
            const filterValue = rule.value.toLowerCase();

            switch (rule.operator) {
              case 'equals':
                return cellValue === filterValue;
              case 'contains':
                return cellValue.includes(filterValue);
              case 'not_equals':
                return cellValue !== filterValue;
              case 'greater':
                return parseFloat(cellValue) > parseFloat(filterValue);
              case 'less':
                return parseFloat(cellValue) < parseFloat(filterValue);
              default:
                return true;
            }
          });
        }
      });

      // Apply sorting
      if (sortColumn) {
        data.sort((a, b) => {
          const aVal = a[sortColumn];
          const bVal = b[sortColumn];
          
          if (aVal === bVal) return 0;
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;

          const isNumeric = !isNaN(Number(aVal)) && !isNaN(Number(bVal));
          
          if (isNumeric) {
            const comparison = Number(aVal) - Number(bVal);
            return sortDirection === 'asc' ? comparison : -comparison;
          } else {
            const comparison = String(aVal).localeCompare(String(bVal));
            return sortDirection === 'asc' ? comparison : -comparison;
          }
        });
      }

      return {
        filteredRows: data,
        totalRows: data.length,
        isLoading: false
      };
    } catch (error) {
      console.error('Error processing data:', error);
      return {
        filteredRows: [],
        totalRows: 0,
        isLoading: false
      };
    } finally {
      setIsProcessing(false);
    }
  }, [dataset.rows, searchTerm, filterRules, sortColumn, sortDirection]);

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
    isProcessing,
    
    // Processed data
    ...processedData,
    
    // Actions
    setSearchTerm: debouncedSetSearchTerm,
    setSortColumn,
    setSortDirection,
    addFilterRule,
    updateFilterRule,
    removeFilterRule,
    clearAllFilters
  };
};