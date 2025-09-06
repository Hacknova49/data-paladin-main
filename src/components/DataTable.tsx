import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dataset } from '@/types/data';
import { Database, Rows, Columns, HardDrive } from 'lucide-react';

interface DataTableProps {
  dataset: Dataset;
  maxRows?: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getColumnIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    numeric: '🔢',
    categorical: '🏷️',
    datetime: '📅',
    text: '📝'
  };
  return iconMap[type] || '❓';
};

export const DataTable: React.FC<DataTableProps> = ({ dataset, maxRows = 100 }) => {
  const previewRows = useMemo(() => dataset.rows.slice(0, maxRows), [dataset.rows, maxRows]);
  
  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Dataset Overview: {dataset.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <Rows className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-semibold">{dataset.totalRows.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Rows</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <Columns className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-semibold">{dataset.totalColumns}</div>
                <div className="text-sm text-muted-foreground">Columns</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <HardDrive className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-semibold">{formatBytes(dataset.memoryUsage)}</div>
                <div className="text-sm text-muted-foreground">Memory</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <Database className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-semibold">
                  {dataset.columns.reduce((sum, col) => sum + col.missingCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Missing Values</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Information */}
      <Card>
        <CardHeader>
          <CardTitle>Column Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {dataset.columns.map((column, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getColumnIcon(column.type)}</span>
                  <div>
                    <div className="font-medium">{column.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {column.uniqueCount} unique values
                      {column.missingCount > 0 && `, ${column.missingCount} missing`}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {column.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Data Preview 
            {maxRows < dataset.totalRows && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (showing first {maxRows} rows)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  {dataset.columns.map((column, index) => (
                    <TableHead key={index} className="min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <span>{getColumnIcon(column.type)}</span>
                        <span>{column.name}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {rowIndex + 1}
                    </TableCell>
                    {dataset.columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className="max-w-[200px] truncate">
                        {row[column.name] ?? (
                          <span className="text-muted-foreground italic">null</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};