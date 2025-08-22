export interface DataColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
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
}