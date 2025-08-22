import { DataColumn, Dataset } from '@/types/data';

export const detectColumnType = (values: any[]): 'numeric' | 'categorical' | 'datetime' | 'text' => {
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

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getColumnIcon = (type: string): string => {
  switch (type) {
    case 'numeric': return '🔢';
    case 'categorical': return '🏷️';
    case 'datetime': return '📅';
    case 'text': return '📝';
    default: return '❓';
  }
};

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

export const generateDataProfile = (dataset: Dataset) => {
  const profile = {
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
      inconsistencies: 0
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