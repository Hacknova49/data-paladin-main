import { Dataset, DataColumn } from '@/types/data';

export type DataType = 'numeric' | 'categorical' | 'datetime' | 'text';

/**
 * Detects the data type of a column based on its values
 */
export const detectColumnType = (values: any[]): DataType => {
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
  
  // Check if it's categorical
  const uniqueValues = new Set(cleanValues).size;
  const uniqueRatio = uniqueValues / cleanValues.length;
  
  if (uniqueRatio < 0.1 && uniqueValues < 20) return 'categorical';
  
  return 'text';
};

/**
 * Analyzes a dataset and returns structured data with column information
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
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};