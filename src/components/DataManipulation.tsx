import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dataset } from '@/types/data';
import { Filter, SortAsc, SortDesc, Trash2, Eye, EyeOff, Search } from 'lucide-react';

interface DataManipulationProps {
  dataset: Dataset;
  onDatasetChange: (newDataset: Dataset) => void;
}

interface FilterRule {
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'not_equals';
  value: string;
}

export const DataManipulation: React.FC<DataManipulationProps> = ({ dataset, onDatasetChange }) => {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set(dataset.columns.map(col => col.name)));

  const filteredAndSortedData = useMemo(() => {
    let data = [...dataset.rows];

    // Apply search filter
    if (searchTerm) {
      data = data.filter(row =>
        Object.values(row).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filter rules
    filterRules.forEach(rule => {
      if (rule.column && rule.value) {
        data = data.filter(row => {
          const cellValue = row[rule.column]?.toString().toLowerCase() || '';
          const filterValue = rule.value.toLowerCase();

          switch (rule.operator) {
            case 'equals':
              return cellValue === filterValue;
            case 'contains':
              return cellValue.includes(filterValue);
            case 'not_equals':
              return cellValue !== filterValue;
            case 'greater':
              return parseFloat(cellValue) > parseFloat(filterValue);
            case 'less':
              return parseFloat(cellValue) < parseFloat(filterValue);
            default:
              return true;
          }
        });
      }
    });

    // Apply sorting
    if (sortColumn) {
      data.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const isNumeric = !isNaN(Number(aVal)) && !isNaN(Number(bVal));
        
        if (isNumeric) {
          const comparison = Number(aVal) - Number(bVal);
          return sortDirection === 'asc' ? comparison : -comparison;
        } else {
          const comparison = String(aVal).localeCompare(String(bVal));
          return sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }

    return data;
  }, [dataset.rows, searchTerm, filterRules, sortColumn, sortDirection]);

  const visibleColumns = dataset.columns.filter(col => 
    selectedColumns.has(col.name) && !hiddenColumns.has(col.name)
  );

  const addFilterRule = () => {
    setFilterRules([...filterRules, { column: '', operator: 'contains', value: '' }]);
  };

  const updateFilterRule = (index: number, field: keyof FilterRule, value: string) => {
    const newRules = [...filterRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setFilterRules(newRules);
  };

  const removeFilterRule = (index: number) => {
    setFilterRules(filterRules.filter((_, i) => i !== index));
  };

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
            />
          </div>

          {/* Filter Rules */}
          <div className="space-y-3">
            {filterRules.map((rule, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Select
                  value={rule.column}
                  onValueChange={(value) => updateFilterRule(index, 'column', value)}
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
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeFilterRule(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={addFilterRule}>
              Add Filter Rule
            </Button>
          </div>
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
            <Select value={sortColumn} onValueChange={setSortColumn}>
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
              >
                <SortAsc className="w-4 h-4 mr-2" />
                Ascending
              </Button>
              <Button
                variant={sortDirection === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortDirection('desc')}
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
            Filtered Results ({filteredAndSortedData.length} rows)
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
                  {filteredAndSortedData.slice(0, 100).map((row, rowIndex) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};