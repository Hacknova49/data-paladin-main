import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset } from '@/types/data';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

interface DataStatisticsProps {
  dataset: Dataset;
}

interface ColumnStats {
  name: string;
  type: string;
  count: number;
  unique: number;
  missing: number;
  mean?: number;
  median?: number;
  mode?: string;
  min?: number;
  max?: number;
  std?: number;
  variance?: number;
}

export const DataStatistics: React.FC<DataStatisticsProps> = ({ dataset }) => {
  const columnStatistics = useMemo(() => {
    return dataset.columns.map(col => {
      const values = col.values.filter(v => v !== null && v !== undefined && v !== '');
      const stats: ColumnStats = {
        name: col.name,
        type: col.type,
        count: values.length,
        unique: col.uniqueCount,
        missing: col.missingCount
      };

      if (col.type === 'numeric' && values.length > 0) {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        
        if (numericValues.length > 0) {
          // Basic statistics
          stats.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
          stats.min = Math.min(...numericValues);
          stats.max = Math.max(...numericValues);
          
          // Median
          const sorted = [...numericValues].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          stats.median = sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
          
          // Standard deviation and variance
          const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - stats.mean!, 2), 0) / numericValues.length;
          stats.variance = variance;
          stats.std = Math.sqrt(variance);
        }
      }

      if (col.type === 'categorical' || col.type === 'text') {
        // Mode (most frequent value)
        const frequency: Record<string, number> = {};
        values.forEach(v => {
          const key = String(v);
          frequency[key] = (frequency[key] || 0) + 1;
        });
        
        const mostFrequent = Object.entries(frequency)
          .sort(([,a], [,b]) => b - a)[0];
        
        if (mostFrequent) {
          stats.mode = mostFrequent[0];
        }
      }

      return stats;
    });
  }, [dataset]);

  const overallStats = useMemo(() => {
    const totalCells = dataset.totalRows * dataset.totalColumns;
    const totalMissing = dataset.columns.reduce((sum, col) => sum + col.missingCount, 0);
    const completeness = ((totalCells - totalMissing) / totalCells) * 100;

    return {
      totalRows: dataset.totalRows,
      totalColumns: dataset.totalColumns,
      totalCells,
      totalMissing,
      completeness,
      memoryUsage: dataset.memoryUsage
    };
  }, [dataset]);

  const correlationMatrix = useMemo(() => {
    const numericColumns = dataset.columns.filter(col => col.type === 'numeric');
    
    if (numericColumns.length < 2) return [];

    const matrix: Array<{ col1: string; col2: string; correlation: number }> = [];
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        // Get paired values (both non-null)
        const pairs: Array<[number, number]> = [];
        
        dataset.rows.forEach(row => {
          const val1 = parseFloat(row[col1.name]);
          const val2 = parseFloat(row[col2.name]);
          
          if (!isNaN(val1) && !isNaN(val2)) {
            pairs.push([val1, val2]);
          }
        });

        if (pairs.length > 1) {
          // Calculate Pearson correlation coefficient
          const n = pairs.length;
          const sum1 = pairs.reduce((sum, [x]) => sum + x, 0);
          const sum2 = pairs.reduce((sum, [, y]) => sum + y, 0);
          const sum1Sq = pairs.reduce((sum, [x]) => sum + x * x, 0);
          const sum2Sq = pairs.reduce((sum, [, y]) => sum + y * y, 0);
          const sumProducts = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
          
          const numerator = n * sumProducts - sum1 * sum2;
          const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
          
          const correlation = denominator !== 0 ? numerator / denominator : 0;
          
          matrix.push({
            col1: col1.name,
            col2: col2.name,
            correlation: parseFloat(correlation.toFixed(3))
          });
        }
      }
    }
    
    return matrix.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [dataset]);

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Dataset Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold">{overallStats.totalRows.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold">{overallStats.totalColumns}</div>
              <div className="text-sm text-muted-foreground">Columns</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold">{overallStats.totalMissing.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Missing Values</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold">{formatNumber(overallStats.completeness)}%</div>
              <div className="text-sm text-muted-foreground">Data Completeness</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold">{(overallStats.memoryUsage / 1024).toFixed(1)}KB</div>
              <div className="text-sm text-muted-foreground">Memory Usage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="descriptive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="descriptive">Descriptive Statistics</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="missing">Missing Data Analysis</TabsTrigger>
        </TabsList>

        {/* Descriptive Statistics */}
        <TabsContent value="descriptive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Column Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Unique</TableHead>
                    <TableHead>Missing</TableHead>
                    <TableHead>Mean</TableHead>
                    <TableHead>Median</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Min</TableHead>
                    <TableHead>Max</TableHead>
                    <TableHead>Std Dev</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnStatistics.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{stat.type}</Badge>
                      </TableCell>
                      <TableCell>{stat.count.toLocaleString()}</TableCell>
                      <TableCell>{stat.unique.toLocaleString()}</TableCell>
                      <TableCell>{stat.missing.toLocaleString()}</TableCell>
                      <TableCell>{stat.mean ? formatNumber(stat.mean) : '-'}</TableCell>
                      <TableCell>{stat.median ? formatNumber(stat.median) : '-'}</TableCell>
                      <TableCell className="max-w-[100px] truncate">{stat.mode || '-'}</TableCell>
                      <TableCell>{stat.min ? formatNumber(stat.min) : '-'}</TableCell>
                      <TableCell>{stat.max ? formatNumber(stat.max) : '-'}</TableCell>
                      <TableCell>{stat.std ? formatNumber(stat.std) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlation Analysis */}
        <TabsContent value="correlations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Correlation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              {correlationMatrix.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column 1</TableHead>
                      <TableHead>Column 2</TableHead>
                      <TableHead>Correlation</TableHead>
                      <TableHead>Strength</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {correlationMatrix.map((corr, index) => {
                      const absCorr = Math.abs(corr.correlation);
                      let strength = 'Weak';
                      let strengthColor = 'default';
                      
                      if (absCorr >= 0.7) {
                        strength = 'Strong';
                        strengthColor = 'destructive';
                      } else if (absCorr >= 0.5) {
                        strength = 'Moderate';
                        strengthColor = 'secondary';
                      }

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{corr.col1}</TableCell>
                          <TableCell className="font-medium">{corr.col2}</TableCell>
                          <TableCell>
                            <span className={`font-mono ${corr.correlation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {corr.correlation >= 0 ? '+' : ''}{corr.correlation}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={strengthColor as any}>{strength}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No numeric columns available for correlation analysis
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Missing Data Analysis */}
        <TabsContent value="missing">
          <Card>
            <CardHeader>
              <CardTitle>Missing Data Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Missing Count</TableHead>
                    <TableHead>Missing %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnStatistics.map((stat, index) => {
                    const missingPercent = (stat.missing / dataset.totalRows) * 100;
                    let status = 'Good';
                    let statusColor = 'default';
                    
                    if (missingPercent > 50) {
                      status = 'Critical';
                      statusColor = 'destructive';
                    } else if (missingPercent > 20) {
                      status = 'Warning';
                      statusColor = 'secondary';
                    }

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{stat.type}</Badge>
                        </TableCell>
                        <TableCell>{stat.missing.toLocaleString()}</TableCell>
                        <TableCell>{formatNumber(missingPercent)}%</TableCell>
                        <TableCell>
                          <Badge variant={statusColor as any}>{status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};