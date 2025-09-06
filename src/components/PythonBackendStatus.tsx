import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePythonBackendHealth } from '@/hooks/usePythonApi';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export const PythonBackendStatus: React.FC = () => {
  const { isHealthy, checking, checkHealth } = usePythonBackendHealth();

  if (isHealthy === null && !checking) {
    return null; // Don't show anything while initial check is pending
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {checking ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : isHealthy ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Python Backend</span>
                <Badge variant={isHealthy ? "default" : "destructive"}>
                  {checking ? "Checking..." : isHealthy ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {checking 
                  ? "Checking connection to Python backend..."
                  : isHealthy 
                    ? "All data processing features are available"
                    : "Python backend is not available. Please start the server."
                }
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={checking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {!isHealthy && !checking && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">To start the Python backend:</p>
            <code className="text-xs bg-background p-2 rounded block">
              cd python_core && python -m uvicorn main:app --reload --port 8000
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
};