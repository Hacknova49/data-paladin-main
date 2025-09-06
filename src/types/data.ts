export type DataType = 'numeric' | 'categorical' | 'datetime' | 'text';

export type SortDirection = 'asc' | 'desc';

export type FilterOperator = 'equals' | 'contains' | 'greater' | 'less' | 'not_equals';

export interface FilterRule {
  column: string;
  operator: FilterOperator;
  value: string;
}

export interface CleaningOperation {
  id: string;
  type: 'remove_duplicates' | 'handle_missing' | 'remove_outliers' | 'standardize_text' | 'convert_types';
  description: string;
  column?: string;
  method?: string;
  value?: any;
  applied: boolean;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'pie';
  xColumn: string;
  yColumn?: string;
}

export interface DataQualityIssues {
  duplicates: number;
  missingValues: number;
  outliers: number;
  inconsistentTypes: number;
  textIssues: number;
}

export interface DataProfile {
  overview: {
    totalRows: number;
    totalColumns: number;
    memoryUsage: number;
    completeness: number;
  };
  quality: DataQualityIssues;
  columns: Array<{
    name: string;
    type: DataType;
    uniqueCount: number;
    missingCount: number;
    completeness: number;
  }>;
}

export interface DataColumn {
  name: string;
  type: DataType;
  values: any[];
  missingCount: number;
  uniqueCount: number;
}

export interface Dataset {
  name: string;
  rows: Record<string, any>[];
  columns: DataColumn[];
  totalRows: number;
  totalColumns: number;
  memoryUsage: number;
}

export interface ColumnStats {
  mean?: number;
  median?: number;
  mode?: any;
  min?: any;
  max?: any;
  std?: number;
  variance?: number;
  quartiles?: number[];
  outliers?: any[];
}

export interface DataSummary {
  columnStats: Record<string, ColumnStats>;
  correlationMatrix?: number[][];
  missingValuesReport: Record<string, number>;
  duplicateRows: number;