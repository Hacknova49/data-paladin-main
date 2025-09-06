import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { PythonBackendStatus } from '@/components/PythonBackendStatus';
import { Dataset } from '@/types/data';
import { useDatasetAnalysis, usePythonBackendHealth } from '@/hooks/usePythonApi';
import { BarChart3, Brain, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const { execute: analyzeData, loading: isLoading } = useDatasetAnalysis();
  const { isHealthy: isPythonHealthy } = usePythonBackendHealth();

  const handleDataLoaded = async (data: any[], filename: string) => {
    toast.success(`Loading ${filename}...`);
    
    try {
      const analyzedDataset = await analyzeData(() => 
        import('@/services/pythonApi').then(api => api.analyzeDataset(data, filename))
      );
      
      if (analyzedDataset.qualityScore >= 90) {
        toast.success(`Dataset loaded successfully!`);
      }
      
      setDataset(analyzedDataset);
    } catch (error) {
      console.error('Failed to analyze dataset:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-br from-background to-accent/5">
        <div className="container mx-auto px-4 py-16">
          {/* Python Backend Status */}
          <PythonBackendStatus />
          
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                DataExplorer
              </h1>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Your friendly data science companion powered by Python. Upload any CSV or Excel file and explore it with 
              powerful analytics, beautiful visualizations, and AI-powered insights — no coding required.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Smart Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>Auto Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Python-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!dataset ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload 
              onDataLoaded={handleDataLoaded} 
              isLoading={isLoading}
              disabled={!isPythonHealthy}
            />
          </div>
        ) : (
          <DataPreview dataset={dataset} />
        )}
      </div>
    </div>
  );
};

export default Index;
