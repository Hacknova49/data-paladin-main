import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset } from '@/types/data';
import { Trash2, AlertTriangle, CheckCircle, RefreshCw, Download, Wand2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface DataCleaningProps {
  dataset: Dataset;
  onDatasetChange: (newDataset: Dataset) => void;
}

interface CleaningOperation {
  id: string;
  type: 'remove_duplicates' | 'handle_missing' | 'remove_outliers' | 'standardize_text' | 'convert_types';
  description: string;
  column?: string;
  method?: string;
  value?: any;
  applied: boolean;
}

export const DataCleaning: React.FC<DataCleaningProps> = ({ dataset, onDatasetChange }) => {
  const [operations, setOperations] = useState<CleaningOperation[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [missingValueMethod, setMissingValueMethod] = useState<string>('remove');
  const [fillValue, setFillValue] = useState<string>('');

  // Analyze data quality issues
  const dataQualityIssues = useMemo(() => {
    const issues = {
      duplicates: 0,
      missingValues: 0,
      outliers: 0,
      inconsistentTypes: 0,
      textIssues: 0
    };

    // Check for duplicates
    const uniqueRows = new Set(dataset.rows.map(row => JSON.stringify(row)));
    issues.duplicates = dataset.rows.length - uniqueRows.size;

    // Count missing values
    issues.missingValues = dataset.columns.reduce((sum, col) => sum + col.missingCount, 0);

    // Detect outliers in numeric columns
    dataset.columns.forEach(col => {
      if (col.type === 'numeric') {
        const values = col.values.filter(v => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
        if (values.length > 0) {
          const sorted = values.sort((a, b) => a - b);
          const q1 = sorted[Math.floor(sorted.length * 0.25)];
          const q3 = sorted[Math.floor(sorted.length * 0.75)];
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;
          issues.outliers += values.filter(v => v < lowerBound || v > upperBound).length;
        }
      }
    });

    // Check for text inconsistencies
    dataset.columns.forEach(col => {
      if (col.type === 'text' || col.type === 'categorical') {
        const textValues = col.values.filter(v => typeof v === 'string');
        const hasInconsistencies = textValues.some(v => 
          v !== v.trim() || // leading/trailing spaces
          /\s{2,}/.test(v) || // multiple spaces
          v !== v.toLowerCase() && v !== v.toUpperCase() // mixed case
        );
        if (hasInconsistencies) issues.textIssues++;
      }
    });

    return issues;
  }, [dataset]);

  const addOperation = (operation: Omit<CleaningOperation, 'id' | 'applied'>) => {
    const newOperation: CleaningOperation = {
      ...operation,
      id: Date.now().toString(),
      applied: false
    };
    setOperations([...operations, newOperation]);
  };

  const removeOperation = (id: string) => {
    setOperations(operations.filter(op => op.id !== id));
  };

  const applyOperation = (operation: CleaningOperation) => {
    let newRows = [...dataset.rows];
    let newColumns = [...dataset.columns];

    switch (operation.type) {
      case 'remove_duplicates':
        const uniqueRowsMap = new Map();
        newRows = newRows.filter(row => {
          const key = JSON.stringify(row);
          if (uniqueRowsMap.has(key)) {
            return false;
          }
          uniqueRowsMap.set(key, true);
          return true;
        });
        break;

      case 'handle_missing':
        if (operation.column && operation.method) {
          const columnIndex = newColumns.findIndex(col => col.name === operation.column);
          if (columnIndex !== -1) {
            const column = newColumns[columnIndex];
            
            if (operation.method === 'remove') {
              newRows = newRows.filter(row => 
                row[operation.column!] !== null && 
                row[operation.column!] !== undefined && 
                row[operation.column!] !== ''
              );
            } else if (operation.method === 'fill') {
              newRows = newRows.map(row => ({
                ...row,
                [operation.column!]: row[operation.column!] || operation.value
              }));
            } else if (operation.method === 'mean' && column.type === 'numeric') {
              const values = column.values.filter(v => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
              const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
              newRows = newRows.map(row => ({
                ...row,
                [operation.column!]: row[operation.column!] || mean
              }));
            } else if (operation.method === 'mode') {
              const frequency: Record<string, number> = {};
              column.values.forEach(v => {
                if (v !== null && v !== undefined && v !== '') {
                  frequency[String(v)] = (frequency[String(v)] || 0) + 1;
                }
              });
              const mode = Object.entries(frequency).sort(([,a], [,b]) => b - a)[0]?.[0];
              newRows = newRows.map(row => ({
                ...row,
                [operation.column!]: row[operation.column!] || mode
              }));
            }
          }
        }
        break;

      case 'remove_outliers':
        if (operation.column) {
          const column = newColumns.find(col => col.name === operation.column);
          if (column && column.type === 'numeric') {
            const values = column.values.filter(v => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
            const sorted = values.sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const iqr = q3 - q1;
            const lowerBound = q1 - 1.5 * iqr;
            const upperBound = q3 + 1.5 * iqr;
            
            newRows = newRows.filter(row => {
              const value = Number(row[operation.column!]);
              return !isNaN(value) && value >= lowerBound && value <= upperBound;
            });
          }
        }
        break;

      case 'standardize_text':
        if (operation.column) {
          newRows = newRows.map(row => ({
            ...row,
            [operation.column!]: typeof row[operation.column!] === 'string' 
              ? row[operation.column!].trim().replace(/\s+/g, ' ').toLowerCase()
              : row[operation.column!]
          }));
        }
        break;

      case 'convert_types':
        if (operation.column && operation.method) {
          newRows = newRows.map(row => {
            let value = row[operation.column!];
            if (value !== null && value !== undefined && value !== '') {
              try {
                switch (operation.method) {
                  case 'number':
                    value = Number(value);
                    break;
                  case 'string':
                    value = String(value);
                    break;
                  case 'date':
                    value = new Date(value).toISOString().split('T')[0];
                    break;
                }
              } catch (e) {
                // Keep original value if conversion fails
              }
            }
            return { ...row, [operation.column!]: value };
          });
        }
        break;
    }

    // Recalculate column statistics
    const columnNames = Object.keys(newRows[0] || {});
    newColumns = columnNames.map(name => {
      const values = newRows.map(row => row[name]);
      const missingCount = values.filter(v => v === null || v === undefined || v === '').length;
      const uniqueCount = new Set(values).size;
      const existingColumn = dataset.columns.find(col => col.name === name);
      
      return {
        name,
        type: existingColumn?.type || 'text',
        values,
        missingCount,
        uniqueCount
      };
    });

    const newDataset: Dataset = {
      ...dataset,
      rows: newRows,
      columns: newColumns,
      totalRows: newRows.length,
      totalColumns: newColumns.length,
      memoryUsage: JSON.stringify(newRows).length
    };

    onDatasetChange(newDataset);
    
    // Mark operation as applied
    setOperations(operations.map(op => 
      op.id === operation.id ? { ...op, applied: true } : op
    ));

    toast.success(`Applied: ${operation.description}`);
  };

  const applyAllOperations = () => {
    operations.filter(op => !op.applied).forEach(op => {
      applyOperation(op);
    });
  };

  const autoClean = () => {
    const autoOperations: Omit<CleaningOperation, 'id' | 'applied'>[] = [];

    // Auto-remove duplicates if found
    if (dataQualityIssues.duplicates > 0) {
      autoOperations.push({
        type: 'remove_duplicates',
        description: `Remove ${dataQualityIssues.duplicates} duplicate rows`
      });
    }

    // Auto-handle missing values for numeric columns (use mean)
    dataset.columns.forEach(col => {
      if (col.missingCount > 0 && col.type === 'numeric') {
        autoOperations.push({
          type: 'handle_missing',
          column: col.name,
          method: 'mean',
          description: `Fill missing values in ${col.name} with mean`
        });
      } else if (col.missingCount > 0 && (col.type === 'categorical' || col.type === 'text')) {
        autoOperations.push({
          type: 'handle_missing',
          column: col.name,
          method: 'mode',
          description: `Fill missing values in ${col.name} with mode`
        });
      }
    });

    // Auto-standardize text columns
    dataset.columns.forEach(col => {
      if (col.type === 'text' || col.type === 'categorical') {
        const hasTextIssues = col.values.some(v => 
          typeof v === 'string' && (
            v !== v.trim() || 
            /\s{2,}/.test(v)
          )
        );
        if (hasTextIssues) {
          autoOperations.push({
            type: 'standardize_text',
            column: col.name,
            description: `Standardize text in ${col.name}`
          });
        }
      }
    });

    setOperations([...operations, ...autoOperations.map(op => ({
      ...op,
      id: Date.now().toString() + Math.random(),
      applied: false
    }))]);

    toast.success(`Added ${autoOperations.length} auto-cleaning operations`);
  };

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Data Quality Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{dataQualityIssues.duplicates}</div>
              <div className="text-sm text-muted-foreground">Duplicate Rows</div>
            </div>
            <div className="text-center p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{dataQualityIssues.missingValues}</div>
              <div className="text-sm text-muted-foreground">Missing Values</div>
            </div>
            <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{dataQualityIssues.outliers}</div>
              <div className="text-sm text-muted-foreground">Outliers</div>
            </div>
            <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dataQualityIssues.textIssues}</div>
              <div className="text-sm text-muted-foreground">Text Issues</div>
            </div>
            <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((dataset.totalRows * dataset.totalColumns - dataQualityIssues.missingValues) / (dataset.totalRows * dataset.totalColumns)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Data Completeness</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={autoClean} className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Auto Clean
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operations">Cleaning Operations</TabsTrigger>
          <TabsTrigger value="missing">Handle Missing Data</TabsTrigger>
          <TabsTrigger value="transform">Data Transformation</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Cleaning Operations Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {operations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No cleaning operations queued. Use the tabs above to add operations or click "Auto Clean".
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {operations.map((operation) => (
                      <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {operation.applied ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <RefreshCw className="w-5 h-5 text-blue-500" />
                          )}
                          <div>
                            <div className="font-medium">{operation.description}</div>
                            {operation.column && (
                              <div className="text-sm text-muted-foreground">Column: {operation.column}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={operation.applied ? "default" : "secondary"}>
                            {operation.applied ? "Applied" : "Pending"}
                          </Badge>
                          {!operation.applied && (
                            <>
                              <Button size="sm" onClick={() => applyOperation(operation)}>
                                Apply
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => removeOperation(operation.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={applyAllOperations} disabled={operations.every(op => op.applied)}>
                      Apply All Pending
                    </Button>
                    <Button variant="outline" onClick={() => setOperations([])}>
                      Clear All
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing">
          <Card>
            <CardHeader>
              <CardTitle>Handle Missing Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Column</label>
                  <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataset.columns.filter(col => col.missingCount > 0).map(col => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name} ({col.missingCount} missing)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Method</label>
                  <Select value={missingValueMethod} onValueChange={setMissingValueMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remove">Remove rows</SelectItem>
                      <SelectItem value="fill">Fill with value</SelectItem>
                      <SelectItem value="mean">Fill with mean (numeric)</SelectItem>
                      <SelectItem value="mode">Fill with mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {missingValueMethod === 'fill' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fill Value</label>
                    <Input
                      value={fillValue}
                      onChange={(e) => setFillValue(e.target.value)}
                      placeholder="Enter fill value"
                    />
                  </div>
                )}
              </div>

              <Button 
                onClick={() => {
                  if (selectedColumn) {
                    addOperation({
                      type: 'handle_missing',
                      column: selectedColumn,
                      method: missingValueMethod,
                      value: fillValue,
                      description: `Handle missing values in ${selectedColumn} using ${missingValueMethod}${missingValueMethod === 'fill' ? ` (${fillValue})` : ''}`
                    });
                  }
                }}
                disabled={!selectedColumn}
              >
                Add Missing Data Operation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transform">
          <Card>
            <CardHeader>
              <CardTitle>Data Transformation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => addOperation({
                    type: 'remove_duplicates',
                    description: 'Remove duplicate rows'
                  })}
                  disabled={dataQualityIssues.duplicates === 0}
                  className="h-20 flex-col"
                >
                  <Trash2 className="w-6 h-6 mb-2" />
                  Remove Duplicates
                  <span className="text-xs opacity-70">({dataQualityIssues.duplicates} found)</span>
                </Button>

                <Button
                  onClick={() => {
                    dataset.columns.forEach(col => {
                      if (col.type === 'text' || col.type === 'categorical') {
                        addOperation({
                          type: 'standardize_text',
                          column: col.name,
                          description: `Standardize text in ${col.name}`
                        });
                      }
                    });
                  }}
                  className="h-20 flex-col"
                  variant="outline"
                >
                  <RefreshCw className="w-6 h-6 mb-2" />
                  Standardize Text
                  <span className="text-xs opacity-70">All text columns</span>
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remove Outliers by Column</label>
                <div className="flex gap-2">
                  <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select numeric column" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataset.columns.filter(col => col.type === 'numeric').map(col => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      if (selectedColumn) {
                        addOperation({
                          type: 'remove_outliers',
                          column: selectedColumn,
                          description: `Remove outliers from ${selectedColumn}`
                        });
                      }
                    }}
                    disabled={!selectedColumn}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};