import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';

interface UseAsyncOperationOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useAsyncOperation = <T = any>(options: UseAsyncOperationOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      setData(result);
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      
      const errorMessage = options.errorMessage || error.message;
      toast.error(errorMessage);
      
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset
  };
};