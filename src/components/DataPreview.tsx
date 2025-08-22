import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset } from '@/types/data';
import { formatBytes, getColumnIcon } from '@/utils/dataUtils';
import { Database, Rows, Columns, HardDrive, BarChart3, Filter, TrendingUp } from 'lucide-react';
import { DataVisualization } from './DataVisualization';
import { DataManipulation } from './DataManipulation';
import { DataStatistics } from './DataStatistics';
import { DataCleaning } from './DataCleaning';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { DataExport } from './DataExport';

interface DataPreviewProps {
  dataset: Dataset;
  maxRows?: number;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ dataset, maxRows = 100 }) => {
  const [currentDataset, setCurrentDataset] = useState<Dataset>(dataset);
  const previewRows = currentDataset.rows.slice(0, maxRows);
  
  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Dataset Overview: {currentDataset.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <Rows className="w-5 h-5 text-chart-1" />
              <div>
                <div className="font-semibold">{currentDataset.totalRows.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Rows</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <Columns className="w-5 h-5 text-chart-2" />
              <div>
                <div className="font-semibold">{currentDataset.totalColumns}</div>
                <div className="text-sm text-muted-foreground">Columns</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <HardDrive className="w-5 h-5 text-chart-3" />
              <div>
                <div className="font-semibold">{formatBytes(currentDataset.memoryUsage)}</div>
                <div className="text-sm text-muted-foreground">Memory</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50">
              <Database className="w-5 h-5 text-chart-4" />
              <div>
                <div className="font-semibold">
                  {currentDataset.columns.reduce((sum, col) => sum + col.missingCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Missing Values</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="visualize" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Visualize
          </TabsTrigger>
          <TabsTrigger value="manipulate" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="cleaning" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Clean
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          {/* Column Information */}
          <Card>
            <CardHeader>
              <CardTitle>Column Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {currentDataset.columns.map((column, index) => (
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
                {maxRows < currentDataset.totalRows && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (showing first {maxRows} rows)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-2 text-left font-medium w-12">#</th>
                      {currentDataset.columns.map((column, index) => (
                        <th key={index} className="border border-border p-2 text-left font-medium min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <span>{getColumnIcon(column.type)}</span>
                            <span>{column.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/30">
                        <td className="border border-border p-2 font-mono text-xs text-muted-foreground">
                          {rowIndex + 1}
                        </td>
                        {currentDataset.columns.map((column, colIndex) => (
                          <td key={colIndex} className="border border-border p-2 max-w-[200px] truncate">
                            {row[column.name] ?? (
                              <span className="text-muted-foreground italic">null</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualize">
          <DataVisualization dataset={currentDataset} />
        </TabsContent>

        <TabsContent value="manipulate">
          <DataManipulation 
            dataset={currentDataset} 
            onDatasetChange={setCurrentDataset}
          />
        </TabsContent>

        <TabsContent value="statistics">
          <DataStatistics dataset={currentDataset} />
        </TabsContent>

        <TabsContent value="cleaning">
          <DataCleaning 
            dataset={currentDataset} 
            onDatasetChange={setCurrentDataset}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalytics dataset={currentDataset} />
        </TabsContent>

        <TabsContent value="export">
          <DataExport dataset={currentDataset} />
        </TabsContent>
      </Tabs>
    </div>
  );
};