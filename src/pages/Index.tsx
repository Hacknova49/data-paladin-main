import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { PixelBlast } from '@/components/PixelBlast';
import { Dataset } from '@/types/data';
import { analyzeDataset } from '@/utils/dataAnalysis';
import { BarChart3, Brain, Sparkles } from 'lucide-react';

const Index = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoaded = async (data: any[], filename: string) => {
    setIsLoading(true);
    
    try {
      // Analyze the dataset
      const analyzedDataset = analyzeDataset(data, filename);
      setDataset(analyzedDataset);
    } catch (error) {
      console.error('Failed to analyze dataset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <PixelBlast className="opacity-30" />
      
      {/* Hero Section */}
      <div className="relative z-10 border-b bg-gradient-to-br from-background/95 to-accent/5 backdrop-blur-sm overflow-hidden">
        {/* Animated Background for Hero */}
        <PixelBlast className="opacity-20" />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                DataExplorer
              </h1>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Your intelligent data analysis companion. Upload any CSV or Excel file and explore it with 
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
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {!dataset ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload 
              onDataLoaded={handleDataLoaded} 
              isLoading={isLoading}
            />
          </div>
        ) : (
          <DataTable dataset={dataset} />
        )}
      </div>
    </div>
  );
};

export default Index;