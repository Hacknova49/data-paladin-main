import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Database } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onDataLoaded: (data: any[], filename: string) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isLoading }) => {
  const processFile = useCallback((file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            onDataLoaded(results.data as any[], file.name);
          }
        },
        header: true,
        skipEmptyLines: true,
        error: (error) => {
          console.error('CSV parsing error:', error);
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          onDataLoaded(jsonData, file.name);
        } catch (error) {
          console.error('Excel parsing error:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [onDataLoaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <Card className={cn(
      "border-2 border-dashed border-border transition-all duration-200 cursor-pointer",
      "hover:border-primary/50 hover:bg-accent/5",
      isDragActive && "border-primary bg-primary/5",
      isLoading && "opacity-50 cursor-not-allowed"
    )}>
      <div
        {...getRootProps()}
        className="p-12 text-center space-y-4"
      >
        <input {...getInputProps()} />
        
        <div className="flex justify-center">
          {isDragActive ? (
            <Database className="w-16 h-16 text-primary animate-pulse" />
          ) : (
            <Upload className="w-16 h-16 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {isDragActive ? 'Drop your file here' : 'Upload your dataset'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Drag and drop your CSV or Excel file here, or click to browse. 
            We'll automatically detect column types and prepare your data for exploration.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>Excel</span>
          </div>
        </div>
        
        {isLoading && (
          <div className="text-sm text-primary">
            Processing your file...
          </div>
        )}
      </div>
    </Card>
  );
};