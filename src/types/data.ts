export type DataType = 'numeric' | 'categorical' | 'datetime' | 'text';

export type SortDirection = 'asc' | 'desc';

export type FilterOperator = 'equals' | 'contains' | 'greater' | 'less' | 'not_equals';

export interface FilterRule {
  column: string;
  operator: FilterOperator;
  value: string;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'pie';
  xColumn: string;
  yColumn?: string;
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

// API Response types for Python backend
export interface PythonApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DataAnalysisRequest {
  data: Record<string, any>[];
  filename: string;
}

export interface FilterRequest {
  dataset: Dataset;
  searchTerm?: string;
  filterRules?: FilterRule[];
  sortColumn?: string;
  sortDirection?: SortDirection;
}

export interface ChartDataRequest {
  dataset: Dataset;
  chartType: ChartConfig['type'];
  xColumn: string;
  yColumn?: string;
}

export interface InsightRequest {
  dataset: Dataset;
}