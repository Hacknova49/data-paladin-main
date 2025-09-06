import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Database } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface FileUploadProps {
  onDataLoaded: (data: any[], filename: string) => void;
  isLoading?: boolean;
}

interface ParsedFileResult {
  data: any[];
  filename: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isLoading }) => {
  const processFile = useCallback(async (file: File): Promise<ParsedFileResult> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      throw new Error('Unsupported file format. Please upload CSV or Excel files.');
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('File size too large. Please upload files smaller than 50MB.');
    }
    
    if (fileExtension === 'csv') {
      return new Promise<ParsedFileResult>((resolve, reject) => {
        Papa.parse(file, {
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
              return;
            }
            
            if (!results.data || results.data.length === 0) {
              reject(new Error('No data found in the CSV file.'));
              return;
            }
            
            resolve({ data: results.data as any[], filename: file.name });
          },
          header: true,
          skipEmptyLines: true,
          error: (error) => {
            reject(new Error(`CSV parsing error: ${error.message}`));
          }
        });
      });
    } else {
      return new Promise<ParsedFileResult>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            if (workbook.SheetNames.length === 0) {
              reject(new Error('No sheets found in the Excel file.'));
              return;
            }
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
              reject(new Error('No data found in the Excel file.'));
              return;
            }
            
            resolve({ data: jsonData, filename: file.name });
          } catch (error) {
            reject(new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        };
        reader.onerror = () => {
          reject(new Error('Failed to read the file.'));
        };
        reader.readAsArrayBuffer(file);
      });
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      try {
        toast.loading('Processing file...');
        const result = await processFile(acceptedFiles[0]);
        toast.success(`Successfully loaded ${result.filename}`);
        onDataLoaded(result.data, result.filename);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to process file');
      }
    } else {
      toast.error('Please select a valid CSV or Excel file.');
    }
  }, [processFile, onDataLoaded]);

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
            {isDragActive 
              ? 'Drop your file here' 
              : 'Upload your dataset'
            }
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Drag and drop your CSV or Excel file here, or click to browse. We'll automatically analyze your data with Python-powered intelligence.
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