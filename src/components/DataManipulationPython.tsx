import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dataset, FilterRule } from '@/types/data';
import { useDataProcessing } from '@/hooks/usePythonApi';
import { Filter, SortAsc, SortDesc, Trash2, Eye, EyeOff, Search, Loader2 } from 'lucide-react';

interface DataManipulationPythonProps {
  dataset: Dataset;
  onDatasetChange: (newDataset: Dataset) => void;
}

export const DataManipulationPython: React.FC<DataManipulationPythonProps> = ({ 
  dataset, 
  onDatasetChange 
}) => {
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(dataset.columns.map(col => col.name))
  );

  const {
    searchTerm,
    filterRules,
    sortColumn,
    sortDirection,
    filteredRows,
    totalRows,
    loading,
    error,
    setSearchTerm,
    setSortColumn,
    setSortDirection,
    addFilterRule,
    updateFilterRule,
    removeFilterRule,
    clearAllFilters,
    processDataset
  } = useDataProcessing();

  // Process data when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      processDataset(dataset);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [dataset, searchTerm, filterRules, sortColumn, sortDirection, processDataset]);

  const visibleColumns = dataset.columns.filter(col => 
    selectedColumns.has(col.name) && !hiddenColumns.has(col.name)
  );

  const toggleColumnVisibility = (columnName: string) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(columnName)) {
      newHidden.delete(columnName);
    } else {
      newHidden.add(columnName);
    }
    setHiddenColumns(newHidden);
  };

  const removeColumn = (columnName: string) => {
    const newColumns = dataset.columns.filter(col => col.name !== columnName);
    const newRows = dataset.rows.map(row => {
      const newRow = { ...row };
      delete newRow[columnName];
      return newRow;
    });

    const newDataset: Dataset = {
      ...dataset,
      columns: newColumns,
      rows: newRows,
      totalColumns: newColumns.length
    };

    onDatasetChange(newDataset);
    setSelectedColumns(new Set(newColumns.map(col => col.name)));
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Data Filtering & Search
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Global Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search across all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>

          {/* Filter Rules */}
          <div className="space-y-3">
            {filterRules.map((rule, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Select
                  value={rule.column}
                  onValueChange={(value) => updateFilterRule(index, 'column', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataset.columns.map(col => (
                      <SelectItem key={col.name} value={col.name}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={rule.operator}
                  onValueChange={(value) => updateFilterRule(index, 'operator', value as FilterRule['operator'])}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="greater">Greater Than</SelectItem>
                    <SelectItem value="less">Less Than</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Filter value"
                  value={rule.value}
                  onChange={(e) => updateFilterRule(index, 'value', e.target.value)}
                  className="flex-1"
                  disabled={loading}
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeFilterRule(index)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={addFilterRule} disabled={loading}>
                Add Filter Rule
              </Button>
              <Button variant="outline" onClick={clearAllFilters} disabled={loading}>
                Clear All Filters
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">Error: {error.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Management */}
      <Card>
        <CardHeader>
          <CardTitle>Column Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dataset.columns.map(col => (
              <div key={col.name} className="flex items-center gap-2 p-2 border rounded">
                <span className="text-sm">{col.name}</span>
                <Badge variant="outline" className="text-xs">
                  {col.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleColumnVisibility(col.name)}
                >
                  {hiddenColumns.has(col.name) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeColumn(col.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sorting Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sorting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select 
              value={sortColumn} 
              onValueChange={setSortColumn}
              disabled={loading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select column to sort" />
              </SelectTrigger>
              <SelectContent>
                {dataset.columns.map(col => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={sortDirection === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortDirection('asc')}
                disabled={loading}
              >
                <SortAsc className="w-4 h-4 mr-2" />
                Ascending
              </Button>
              <Button
                variant={sortDirection === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortDirection('desc')}
                disabled={loading}
              >
                <SortDesc className="w-4 h-4 mr-2" />
                Descending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Filtered Results ({totalRows} rows)
            {loading && <span className="text-sm font-normal ml-2">(Processing...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {visibleColumns.map((column, index) => (
                      <TableHead key={index} className="min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <span>{column.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {column.type}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + 1} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Processing data...</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.slice(0, 100).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {rowIndex + 1}
                        </TableCell>
                        {visibleColumns.map((column, colIndex) => (
                          <TableCell key={colIndex} className="max-w-[200px] truncate">
                            {row[column.name] ?? (
                              <span className="text-muted-foreground italic">null</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};