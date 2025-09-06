import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDataProcessing } from '../useDataProcessing';
import { Dataset } from '@/types/data';

const mockDataset: Dataset = {
  name: 'test.csv',
  totalRows: 3,
  totalColumns: 3,
  memoryUsage: 1000,
  rows: [
    { name: 'John', age: 25, city: 'NYC' },
    { name: 'Jane', age: 30, city: 'LA' },
    { name: 'Bob', age: 35, city: 'Chicago' },
  ],
  columns: [
    { name: 'name', type: 'text', values: ['John', 'Jane', 'Bob'], missingCount: 0, uniqueCount: 3 },
    { name: 'age', type: 'numeric', values: [25, 30, 35], missingCount: 0, uniqueCount: 3 },
    { name: 'city', type: 'categorical', values: ['NYC', 'LA', 'Chicago'], missingCount: 0, uniqueCount: 3 },
  ],
};

describe('useDataProcessing', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useDataProcessing({ dataset: mockDataset }));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.filterRules).toEqual([]);
    expect(result.current.sortColumn).toBe('');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.filteredRows).toHaveLength(3);
    expect(result.current.totalRows).toBe(3);
  });

  it('should filter data based on search term', async () => {
    const { result } = renderHook(() => useDataProcessing({ dataset: mockDataset }));

    act(() => {
      result.current.setSearchTerm('John');
    });

    // Wait for debounced search
    await new Promise(resolve => setTimeout(resolve, 350));

    expect(result.current.filteredRows).toHaveLength(1);
    expect(result.current.filteredRows[0].name).toBe('John');
  });

  it('should add and remove filter rules', () => {
    const { result } = renderHook(() => useDataProcessing({ dataset: mockDataset }));

    act(() => {
      result.current.addFilterRule();
    });

    expect(result.current.filterRules).toHaveLength(1);

    act(() => {
      result.current.removeFilterRule(0);
    });

    expect(result.current.filterRules).toHaveLength(0);
  });

  it('should update filter rules', () => {
    const { result } = renderHook(() => useDataProcessing({ dataset: mockDataset }));

    act(() => {
      result.current.addFilterRule();
    });

    act(() => {
      result.current.updateFilterRule(0, 'column', 'name');
      result.current.updateFilterRule(0, 'value', 'John');
    });

    expect(result.current.filterRules[0].column).toBe('name');
    expect(result.current.filterRules[0].value).toBe('John');
  });

  it('should sort data correctly', () => {
    const { result } = renderHook(() => useDataProcessing({ dataset: mockDataset }));

    act(() => {
      result.current.setSortColumn('age');
      result.current.setSortDirection('desc');
    });

    expect(result.current.filteredRows[0].age).toBe(35); // Bob should be first
    expect(result.current.filteredRows[2].age).toBe(25); // John should be last
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useDataProcessing({ dataset: mockDataset }));

    act(() => {
      result.current.setSearchTerm('test');
      result.current.addFilterRule();
      result.current.setSortColumn('age');
    });

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.searchTerm).toBe('');
    expect(result.current.filterRules).toHaveLength(0);
    expect(result.current.sortColumn).toBe('');
  });
});