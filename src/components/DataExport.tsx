import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dataset } from '@/types/data';
import { Download, FileText, Image, Code, Share2, Mail } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import Papa from 'papaparse';

interface DataExportProps {
  dataset: Dataset;
}

export const DataExport: React.FC<DataExportProps> = ({ dataset }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel' | 'pdf'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(dataset.columns.map(col => col.name));
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [reportTitle, setReportTitle] = useState('Data Analysis Report');
  const [reportDescription, setReportDescription] = useState('');

  const handleColumnToggle = (columnName: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnName) 
        ? prev.filter(name => name !== columnName)
        : [...prev, columnName]
    );
  };

  const exportData = () => {
    const filteredRows = dataset.rows.map(row => {
      const filteredRow: Record<string, any> = {};
      selectedColumns.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });

    switch (exportFormat) {
      case 'csv':
        exportAsCSV(filteredRows);
        break;
      case 'json':
        exportAsJSON(filteredRows);
        break;
      case 'excel':
        exportAsExcel(filteredRows);
        break;
      case 'pdf':
        exportAsPDF(filteredRows);
        break;
    }
  };

  const exportAsCSV = (data: Record<string, any>[]) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.name.replace(/\.[^/.]+$/, '')}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported as CSV');
  };

  const exportAsJSON = (data: Record<string, any>[]) => {
    const exportData = {
      metadata: includeMetadata ? {
        title: reportTitle,
        description: reportDescription,
        exportDate: new Date().toISOString(),
        totalRows: data.length,
        columns: selectedColumns.map(name => {
          const col = dataset.columns.find(c => c.name === name);
          return {
            name,
            type: col?.type,
            uniqueCount: col?.uniqueCount,
            missingCount: col?.missingCount
          };
        })
      } : undefined,
      data
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.name.replace(/\.[^/.]+$/, '')}_export.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported as JSON');
  };

  const exportAsExcel = (data: Record<string, any>[]) => {
    // For now, export as CSV with Excel-friendly format
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.name.replace(/\.[^/.]+$/, '')}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported (Excel-compatible CSV)');
  };

  const exportAsPDF = (data: Record<string, any>[]) => {
    // Generate HTML report for PDF conversion
    const htmlContent = generateHTMLReport(data);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.name.replace(/\.[^/.]+$/, '')}_report.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported as HTML (print to PDF)');
  };

  const generateHTMLReport = (data: Record<string, any>[]) => {
    const columnStats = selectedColumns.map(name => {
      const col = dataset.columns.find(c => c.name === name);
      const values = data.map(row => row[name]).filter(v => v !== null && v !== undefined && v !== '');
      
      let stats = {
        name,
        type: col?.type || 'unknown',
        count: values.length,
        missing: data.length - values.length,
        unique: new Set(values).size
      };

      if (col?.type === 'numeric') {
        const numValues = values.map(Number).filter(v => !isNaN(v));
        if (numValues.length > 0) {
          const sum = numValues.reduce((a, b) => a + b, 0);
          const mean = sum / numValues.length;
          const sorted = numValues.sort((a, b) => a - b);
          const median = sorted.length % 2 === 0 
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
          
          Object.assign(stats, {
            mean: mean.toFixed(2),
            median: median.toFixed(2),
            min: Math.min(...numValues).toFixed(2),
            max: Math.max(...numValues).toFixed(2)
          });
        }
      }

      return stats;
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <title>${reportTitle}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .description { color: #666; font-size: 16px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { color: #666; font-size: 14px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${reportTitle}</div>
        <div class="description">${reportDescription}</div>
        <div style="margin-top: 10px; color: #888; font-size: 14px;">
            Generated on ${new Date().toLocaleDateString()} | ${data.length} rows, ${selectedColumns.length} columns
        </div>
    </div>

    <div class="section">
        <div class="section-title">Dataset Overview</div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${data.length.toLocaleString()}</div>
                <div class="stat-label">Total Rows</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${selectedColumns.length}</div>
                <div class="stat-label">Columns</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${columnStats.reduce((sum, col) => sum + col.missing, 0)}</div>
                <div class="stat-label">Missing Values</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round(((data.length * selectedColumns.length - columnStats.reduce((sum, col) => sum + col.missing, 0)) / (data.length * selectedColumns.length)) * 100)}%</div>
                <div class="stat-label">Data Completeness</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Column Statistics</div>
        <table>
            <thead>
                <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Missing</th>
                    <th>Unique</th>
                    <th>Mean</th>
                    <th>Median</th>
                    <th>Min</th>
                    <th>Max</th>
                </tr>
            </thead>
            <tbody>
                ${columnStats.map(stat => `
                    <tr>
                        <td><strong>${stat.name}</strong></td>
                        <td>${stat.type}</td>
                        <td>${stat.count}</td>
                        <td>${stat.missing}</td>
                        <td>${stat.unique}</td>
                        <td>${(stat as any).mean || '-'}</td>
                        <td>${(stat as any).median || '-'}</td>
                        <td>${(stat as any).min || '-'}</td>
                        <td>${(stat as any).max || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Data Sample (First 10 Rows)</div>
        <table>
            <thead>
                <tr>
                    ${selectedColumns.map(col => `<th>${col}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.slice(0, 10).map(row => `
                    <tr>
                        ${selectedColumns.map(col => `<td>${row[col] ?? 'N/A'}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>This report was generated by DataExplorer. For questions or support, please contact your data analysis team.</p>
    </div>
</body>
</html>
    `;
  };

  const shareData = () => {
    if (navigator.share) {
      navigator.share({
        title: reportTitle,
        text: `Data analysis report: ${reportDescription}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export & Share Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Export Format</label>
                <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        CSV (Comma Separated)
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        JSON (JavaScript Object)
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Excel Compatible
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        PDF Report
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Report Title</label>
                <Input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Enter report title"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Add a description for your export..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <label htmlFor="metadata" className="text-sm">
                  Include metadata and statistics
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Columns ({selectedColumns.length} of {dataset.columns.length})
              </label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                <div className="flex gap-2 mb-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedColumns(dataset.columns.map(col => col.name))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedColumns([])}
                  >
                    Clear All
                  </Button>
                </div>
                {dataset.columns.map((column) => (
                  <div key={column.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.name}
                      checked={selectedColumns.includes(column.name)}
                      onCheckedChange={() => handleColumnToggle(column.name)}
                    />
                    <label htmlFor={column.name} className="text-sm flex-1 flex items-center justify-between">
                      <span>{column.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {column.type}
                        </Badge>
                        {column.missingCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {column.missingCount} missing
                          </Badge>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <Card className="bg-accent/5">
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-2">Export Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Format</div>
                  <div className="font-medium uppercase">{exportFormat}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Rows</div>
                  <div className="font-medium">{dataset.totalRows.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Columns</div>
                  <div className="font-medium">{selectedColumns.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Est. Size</div>
                  <div className="font-medium">
                    {Math.round((JSON.stringify(dataset.rows).length * selectedColumns.length / dataset.columns.length) / 1024)} KB
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={exportData}
              disabled={selectedColumns.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            
            <Button 
              variant="outline"
              onClick={shareData}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>

            <Button 
              variant="outline"
              onClick={() => {
                const subject = encodeURIComponent(`Data Analysis Report: ${reportTitle}`);
                const body = encodeURIComponent(`I've prepared a data analysis report that might interest you.\n\nReport: ${reportTitle}\nDescription: ${reportDescription}\n\nRows: ${dataset.totalRows.toLocaleString()}\nColumns: ${selectedColumns.length}\n\nGenerated with DataExplorer`);
                window.open(`mailto:?subject=${subject}&body=${body}`);
              }}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};