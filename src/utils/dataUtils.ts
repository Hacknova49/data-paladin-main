import { DataColumn, Dataset, DataType, DataProfile } from '@/types/data';

/**
 * Detects the data type of a column based on its values
 * @param values Array of values to analyze
 * @returns The detected data type
 */
export const detectColumnType = (values: any[]): DataType => {
  // Remove null/undefined values for analysis
  const cleanValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (cleanValues.length === 0) return 'text';
  
  // Check if it's numeric
  const numericCount = cleanValues.filter(v => !isNaN(Number(v)) && isFinite(Number(v))).length;
  const numericRatio = numericCount / cleanValues.length;
  
  if (numericRatio > 0.8) return 'numeric';
  
  // Check if it's datetime
  const dateCount = cleanValues.filter(v => {
    const date = new Date(v);
    return !isNaN(date.getTime()) && v.toString().match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
  }).length;
  const dateRatio = dateCount / cleanValues.length;
  
  if (dateRatio > 0.6) return 'datetime';
  
  // Check if it's categorical (limited unique values relative to total)
  const uniqueValues = new Set(cleanValues).size;
  const uniqueRatio = uniqueValues / cleanValues.length;
  
  if (uniqueRatio < 0.1 && uniqueValues < 20) return 'categorical';
  
  return 'text';
};

/**
 * Analyzes a dataset and returns structured data with column information
 * @param rows Raw data rows
 * @param filename Name of the source file
 * @returns Analyzed dataset structure
 */
export const analyzeDataset = (rows: Record<string, any>[], filename: string): Dataset => {
  if (rows.length === 0) {
    return {
      name: filename,
      rows: [],
      columns: [],
      totalRows: 0,
      totalColumns: 0,
      memoryUsage: 0
    };
  }
  
  const columnNames = Object.keys(rows[0]);
  const columns: DataColumn[] = columnNames.map(name => {
    const values = rows.map(row => row[name]);
    const type = detectColumnType(values);
    const missingCount = values.filter(v => v === null || v === undefined || v === '').length;
    const uniqueCount = new Set(values).size;
    
    return {
      name,
      type,
      values,
      missingCount,
      uniqueCount
    };
  });
  
  const memoryUsage = JSON.stringify(rows).length;
  
  return {
    name: filename,
    rows,
    columns,
    totalRows: rows.length,
    totalColumns: columnNames.length,
    memoryUsage
  };
};

/**
 * Formats bytes into human-readable format
 * @param bytes Number of bytes
 * @returns Formatted string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Returns an emoji icon for a given data type
 * @param type Data type
 * @returns Emoji string
 */
export const getColumnIcon = (type: DataType): string => {
  const iconMap: Record<DataType, string> = {
    numeric: '🔢',
    categorical: '🏷️',
    datetime: '📅',
    text: '📝'
  };
  return iconMap[type] || '❓';
};

/**
 * Detects outliers in numeric data using IQR method
 * @param values Array of numeric values
 * @returns Array of outlier values
 */
export const detectOutliers = (values: number[]): number[] => {
  if (values.length === 0) return [];
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(v => v < lowerBound || v > upperBound);
};

/**
 * Calculates Pearson correlation coefficient between two numeric arrays
 * @param x First array
 * @param y Second array
 * @returns Correlation coefficient (-1 to 1)
 */
export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Generates a comprehensive data profile for quality assessment
 * @param dataset Dataset to analyze
 * @returns Data profile with quality metrics
 */
export const generateDataProfile = (dataset: Dataset): DataProfile => {
  const profile: DataProfile = {
    overview: {
      totalRows: dataset.totalRows,
      totalColumns: dataset.totalColumns,
      memoryUsage: dataset.memoryUsage,
      completeness: 0
    },
    quality: {
      duplicates: 0,
      missingValues: 0,
      outliers: 0,
      inconsistentTypes: 0,
      textIssues: 0
    },
    columns: dataset.columns.map(col => ({
      name: col.name,
      type: col.type,
      uniqueCount: col.uniqueCount,
      missingCount: col.missingCount,
      completeness: ((dataset.totalRows - col.missingCount) / dataset.totalRows) * 100
    }))
  };
  
  // Calculate overall completeness
  const totalCells = dataset.totalRows * dataset.totalColumns;
  const totalMissing = dataset.columns.reduce((sum, col) => sum + col.missingCount, 0);
  profile.overview.completeness = ((totalCells - totalMissing) / totalCells) * 100;
  
  // Calculate quality metrics
  profile.quality.missingValues = totalMissing;
  
  // Detect duplicates
  const uniqueRows = new Set(dataset.rows.map(row => JSON.stringify(row)));
  profile.quality.duplicates = dataset.totalRows - uniqueRows.size;
  
  // Count outliers in numeric columns
  dataset.columns.forEach(col => {
    if (col.type === 'numeric') {
      const values = col.values.filter(v => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
      const outliers = detectOutliers(values);
      profile.quality.outliers += outliers.length;
    }
  });
  
  return profile;
};

/**
 * Debounces a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Safely parses a numeric value
 * @param value Value to parse
 * @returns Parsed number or null if invalid
 */
export const safeParseNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
};

/**
 * Calculates basic statistics for numeric data
 * @param values Array of numeric values
 * @returns Statistics object
 */
export const calculateBasicStats = (values: number[]) => {
  if (values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;
  
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  return {
    mean,
    median,
    std,
    variance,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    count: values.length
  };
};