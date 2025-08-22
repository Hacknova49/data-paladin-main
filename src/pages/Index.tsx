import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { Dataset } from '@/types/data';
import { analyzeDataset, generateDataProfile } from '@/utils/dataUtils';
import { BarChart3, Brain, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoaded = (data: any[], filename: string) => {
    setIsLoading(true);
    toast.success(`Loading ${filename}...`);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const analyzedDataset = analyzeDataset(data, filename);
      const profile = generateDataProfile(analyzedDataset);
      
      // Show data quality summary
      const qualityScore = Math.round(profile.overview.completeness);
      if (qualityScore >= 90) {
        toast.success(`Dataset loaded! Data quality: ${qualityScore}% (Excellent)`);
      } else if (qualityScore >= 70) {
        toast.success(`Dataset loaded! Data quality: ${qualityScore}% (Good)`);
      } else {
        toast.success(`Dataset loaded! Data quality: ${qualityScore}% (Needs cleaning)`);
      }
      
      setDataset(analyzedDataset);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-br from-background to-accent/5">
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
              Your friendly data science companion. Upload any CSV or Excel file and explore it with 
              powerful analytics, beautiful visualizations, and intelligent insights — no coding required.
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
                <span>Beautiful Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!dataset ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onDataLoaded={handleDataLoaded} isLoading={isLoading} />
          </div>
        ) : (
          <DataPreview dataset={dataset} />
        )}
      </div>
    </div>
  );
};

export default Index;
