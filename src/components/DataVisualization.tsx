import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dataset, ChartConfig } from '@/types/data';
import { BarChart3, LineChart as LineChartIcon, Zap, PieChart as PieChartIcon, Download } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface DataVisualizationProps {
  dataset: Dataset;
}

type ChartType = ChartConfig['type'];

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const DataVisualization: React.FC<DataVisualizationProps> = ({ dataset }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');

  const { numericColumns, categoricalColumns, allColumns } = useMemo(() => ({
    numericColumns: dataset.columns.filter(col => col.type === 'numeric'),
    categoricalColumns: dataset.columns.filter(col => col.type === 'categorical' || col.type === 'text'),
    allColumns: dataset.columns
  }), [dataset.columns]);

  const chartData = useMemo(() => {
    if (!xColumn || (chartType !== 'pie' && !yColumn)) return [];

    if (chartType === 'pie') {
      // For pie chart, count occurrences of categorical data
      const counts: Record<string, number> = {};
      dataset.rows.forEach(row => {
        const value = row[xColumn];
        if (value !== null && value !== undefined) {
          counts[value] = (counts[value] || 0) + 1;
        }
      });
      
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    // For other charts, use x and y columns
    return dataset.rows
      .filter(row => row[xColumn] !== null && row[xColumn] !== undefined && 
                     row[yColumn] !== null && row[yColumn] !== undefined)
      .slice(0, 100) // Limit to first 100 rows for performance
      .map(row => ({
        x: row[xColumn],
        y: parseFloat(row[yColumn]) || 0,
        [xColumn]: row[xColumn],
        [yColumn]: parseFloat(row[yColumn]) || 0
      }));
  }, [dataset.rows, xColumn, yColumn, chartType]);

  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type);
    // Reset columns when changing chart type
    if (type === 'pie') {
      setYColumn('');
    }
  }, []);

  const handleExportChart = useCallback(() => {
    try {
      // This would implement actual chart export functionality
      toast.success('Chart export feature coming soon!');
    } catch (error) {
      toast.error('Failed to export chart');
    }
  }, []);

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Select columns to generate visualization
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xColumn} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar dataKey={yColumn} fill={CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xColumn} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey={yColumn} stroke={CHART_COLORS[1]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xColumn} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey={yColumn} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Scatter dataKey={yColumn} fill={CHART_COLORS[2]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill={CHART_COLORS[3]}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Visualization</span>
          <Button variant="outline" size="sm" onClick={handleExportChart}>
            <Download className="w-4 h-4 mr-2" />
            Export Chart
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart Type Selection */}
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart' },
            { type: 'line' as const, icon: LineChartIcon, label: 'Line Chart' },
            { type: 'scatter' as const, icon: Zap, label: 'Scatter Plot' },
            { type: 'pie' as const, icon: PieChartIcon, label: 'Pie Chart' }
          ].map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant={chartType === type ? "default" : "outline"}
              size="sm"
              onClick={() => handleChartTypeChange(type)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Column Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {chartType === 'pie' ? 'Category Column' : 'X-Axis Column'}
            </label>
            <Select value={xColumn} onValueChange={setXColumn}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${chartType === 'pie' ? 'category' : 'X-axis'} column`} />
              </SelectTrigger>
              <SelectContent>
                {(chartType === 'pie' ? categoricalColumns : allColumns).map(col => (
                  <SelectItem key={col.name} value={col.name}>
                    <div className="flex items-center gap-2">
                      <span>{col.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {col.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {chartType !== 'pie' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Y-Axis Column</label>
              <Select value={yColumn} onValueChange={setYColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y-axis column" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.map(col => (
                    <SelectItem key={col.name} value={col.name}>
                      <div className="flex items-center gap-2">
                        <span>{col.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {col.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Chart Display */}
        <div className="border rounded-lg p-4 bg-card">
          {renderChart()}
        </div>

        {/* Chart Info */}
        {chartData.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {chartData.length} data points
            {chartType !== 'pie' && dataset.rows.length > 100 && ' (limited to first 100 rows for performance)'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};