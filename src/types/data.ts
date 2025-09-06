export interface Dataset {
  name: string;
  rows: Record<string, any>[];
  columns: DataColumn[];
  totalRows: number;
  totalColumns: number;
  memoryUsage: number;
}

export interface DataColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  values: any[];
  missingCount: number;
  uniqueCount: number;
}