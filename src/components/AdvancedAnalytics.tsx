import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset } from '@/types/data';
import { TrendingUp, Target, Brain, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdvancedAnalyticsProps {
  dataset: Dataset;
}

interface Insight {
  type: 'correlation' | 'trend' | 'anomaly' | 'distribution' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  columns: string[];
  data?: any;
}

interface PredictionModel {
  type: 'linear_regression' | 'classification' | 'clustering';
  target: string;
  features: string[];
  accuracy?: number;
  predictions?: any[];
}

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ dataset }) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [modelType, setModelType] = useState<'linear_regression' | 'classification' | 'clustering'>('linear_regression');

  // Generate intelligent insights
  const insights = useMemo(() => {
    const insights: Insight[] = [];

    // Correlation insights
    const numericColumns = dataset.columns.filter(col => col.type === 'numeric');
    if (numericColumns.length >= 2) {
      for (let i = 0; i < numericColumns.length; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const col1 = numericColumns[i];
          const col2 = numericColumns[j];
          
          // Calculate correlation
          const pairs: Array<[number, number]> = [];
          dataset.rows.forEach(row => {
            const val1 = parseFloat(row[col1.name]);
            const val2 = parseFloat(row[col2.name]);
            if (!isNaN(val1) && !isNaN(val2)) {
              pairs.push([val1, val2]);
            }
          });

          if (pairs.length > 10) {
            const n = pairs.length;
            const sum1 = pairs.reduce((sum, [x]) => sum + x, 0);
            const sum2 = pairs.reduce((sum, [, y]) => sum + y, 0);
            const sum1Sq = pairs.reduce((sum, [x]) => sum + x * x, 0);
            const sum2Sq = pairs.reduce((sum, [, y]) => sum + y * y, 0);
            const sumProducts = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
            
            const numerator = n * sumProducts - sum1 * sum2;
            const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
            
            if (denominator !== 0) {
              const correlation = numerator / denominator;
              
              if (Math.abs(correlation) > 0.7) {
                insights.push({
                  type: 'correlation',
                  title: `Strong ${correlation > 0 ? 'Positive' : 'Negative'} Correlation`,
                  description: `${col1.name} and ${col2.name} show a ${correlation > 0 ? 'positive' : 'negative'} correlation of ${correlation.toFixed(3)}`,
                  confidence: Math.abs(correlation) * 100,
                  columns: [col1.name, col2.name],
                  data: { correlation, pairs: pairs.slice(0, 100) }
                });
              }
            }
          }
        }
      }
    }

    // Distribution insights
    dataset.columns.forEach(col => {
      if (col.type === 'numeric') {
        const values = col.values.filter(v => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
        if (values.length > 0) {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const std = Math.sqrt(variance);
          const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / values.length;
          
          if (Math.abs(skewness) > 1) {
            insights.push({
              type: 'distribution',
              title: `${col.name} Distribution Skew`,
              description: `${col.name} shows ${skewness > 0 ? 'right' : 'left'} skewness (${skewness.toFixed(2)})`,
              confidence: Math.min(Math.abs(skewness) * 30, 95),
              columns: [col.name],
              data: { skewness, mean, std }
            });
          }
        }
      }
    });

    // Anomaly detection
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
          
          const outliers = values.filter(v => v < lowerBound || v > upperBound);
          if (outliers.length > 0) {
            insights.push({
              type: 'anomaly',
              title: `Outliers Detected in ${col.name}`,
              description: `Found ${outliers.length} outliers (${((outliers.length / values.length) * 100).toFixed(1)}% of data)`,
              confidence: Math.min((outliers.length / values.length) * 200, 95),
              columns: [col.name],
              data: { outliers: outliers.slice(0, 10), count: outliers.length }
            });
          }
        }
      }
    });

    // Pattern insights for categorical data
    dataset.columns.forEach(col => {
      if (col.type === 'categorical') {
        const frequency: Record<string, number> = {};
        col.values.forEach(v => {
          if (v !== null && v !== undefined && v !== '') {
            frequency[String(v)] = (frequency[String(v)] || 0) + 1;
          }
        });
        
        const entries = Object.entries(frequency).sort(([,a], [,b]) => b - a);
        const total = entries.reduce((sum, [,count]) => sum + count, 0);
        const topCategory = entries[0];
        
        if (topCategory && (topCategory[1] / total) > 0.5) {
          insights.push({
            type: 'pattern',
            title: `Dominant Category in ${col.name}`,
            description: `"${topCategory[0]}" represents ${((topCategory[1] / total) * 100).toFixed(1)}% of all values`,
            confidence: (topCategory[1] / total) * 100,
            columns: [col.name],
            data: { category: topCategory[0], percentage: (topCategory[1] / total) * 100 }
          });
        }
      }
    });

    return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }, [dataset]);

  // Simple linear regression for predictions
  const createPredictionModel = () => {
    if (!selectedTarget || selectedFeatures.length === 0) return null;

    const targetColumn = dataset.columns.find(col => col.name === selectedTarget);
    if (!targetColumn || targetColumn.type !== 'numeric') return null;

    // Simple linear regression with first feature
    const feature = selectedFeatures[0];
    const featureColumn = dataset.columns.find(col => col.name === feature);
    if (!featureColumn || featureColumn.type !== 'numeric') return null;

    const pairs: Array<[number, number]> = [];
    dataset.rows.forEach(row => {
      const x = parseFloat(row[feature]);
      const y = parseFloat(row[selectedTarget]);
      if (!isNaN(x) && !isNaN(y)) {
        pairs.push([x, y]);
      }
    });

    if (pairs.length < 10) return null;

    // Calculate linear regression coefficients
    const n = pairs.length;
    const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
    const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumXX = pairs.reduce((sum, [x]) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const meanY = sumY / n;
    const totalSumSquares = pairs.reduce((sum, [, y]) => sum + Math.pow(y - meanY, 2), 0);
    const residualSumSquares = pairs.reduce((sum, [x, y]) => {
      const predicted = slope * x + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    // Generate predictions
    const predictions = pairs.map(([x, y]) => ({
      actual: y,
      predicted: slope * x + intercept,
      feature: x
    }));

    return {
      type: 'linear_regression' as const,
      target: selectedTarget,
      features: [feature],
      accuracy: rSquared * 100,
      predictions: predictions.slice(0, 50),
      coefficients: { slope, intercept }
    };
  };

  const model = createPredictionModel();

  const renderInsightVisualization = (insight: Insight) => {
    if (insight.type === 'correlation' && insight.data?.pairs) {
      const chartData = insight.data.pairs.map(([x, y]: [number, number], index: number) => ({
        x, y, index
      }));

      return (
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="x" stroke="hsl(var(--muted-foreground))" />
            <YAxis dataKey="y" stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Scatter dataKey="y" fill={CHART_COLORS[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (insight.type === 'distribution' && insight.columns.length === 1) {
      const column = dataset.columns.find(col => col.name === insight.columns[0]);
      if (column) {
        const values = column.values.filter(v => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
        const bins = 10;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binSize = (max - min) / bins;
        
        const histogram = Array.from({ length: bins }, (_, i) => {
          const binStart = min + i * binSize;
          const binEnd = binStart + binSize;
          const count = values.filter(v => v >= binStart && v < binEnd).length;
          return {
            range: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
            count
          };
        });

        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="count" fill={CHART_COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        );
      }
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Modeling</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Intelligent Data Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  AI-powered analysis has discovered {insights.length} key insights in your data.
                </div>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {insight.type === 'correlation' && <TrendingUp className="w-4 h-4 text-blue-500" />}
                            {insight.type === 'anomaly' && <AlertCircle className="w-4 h-4 text-red-500" />}
                            {insight.type === 'distribution' && <BarChart className="w-4 h-4 text-green-500" />}
                            {insight.type === 'pattern' && <Target className="w-4 h-4 text-purple-500" />}
                            {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-orange-500" />}
                            <h3 className="font-semibold">{insight.title}</h3>
                          </div>
                          <Badge variant="outline">
                            {Math.round(insight.confidence)}% confidence
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{insight.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {insight.columns.map(col => (
                            <Badge key={col} variant="secondary" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                        </div>
                        {renderInsightVisualization(insight)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Predictive Modeling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Variable</label>
                    <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataset.columns.filter(col => col.type === 'numeric').map(col => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feature Variables</label>
                    <Select 
                      value={selectedFeatures[0] || ''} 
                      onValueChange={(value) => setSelectedFeatures([value])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select features" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataset.columns
                          .filter(col => col.type === 'numeric' && col.name !== selectedTarget)
                          .map(col => (
                            <SelectItem key={col.name} value={col.name}>
                              {col.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model Type</label>
                    <Select value={modelType} onValueChange={(value: any) => setModelType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear_regression">Linear Regression</SelectItem>
                        <SelectItem value="classification">Classification</SelectItem>
                        <SelectItem value="clustering">Clustering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {model && (
                  <Card className="bg-accent/5">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold">Model Results</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Model Accuracy (R²)</div>
                          <div className="text-2xl font-bold text-green-600">
                            {model.accuracy?.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Predictions Generated</div>
                          <div className="text-2xl font-bold">
                            {model.predictions?.length || 0}
                          </div>
                        </div>
                      </div>

                      {model.predictions && model.predictions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Actual vs Predicted</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart data={model.predictions}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis 
                                dataKey="actual" 
                                stroke="hsl(var(--muted-foreground))"
                                name="Actual"
                              />
                              <YAxis 
                                dataKey="predicted" 
                                stroke="hsl(var(--muted-foreground))"
                                name="Predicted"
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--background))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '6px'
                                }}
                              />
                              <Scatter dataKey="predicted" fill={CHART_COLORS[2]} />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Statistical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Correlation Heatmap</h3>
                    <div className="text-sm text-muted-foreground">
                      Coming soon: Interactive correlation matrix for all numeric variables
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Time Series Analysis</h3>
                    <div className="text-sm text-muted-foreground">
                      Coming soon: Trend analysis and forecasting for time-based data
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Clustering Analysis</h3>
                    <div className="text-sm text-muted-foreground">
                      Coming soon: K-means clustering and pattern discovery
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Feature Importance</h3>
                    <div className="text-sm text-muted-foreground">
                      Coming soon: Identify the most important variables in your dataset
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};