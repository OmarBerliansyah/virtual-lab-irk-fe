import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useGlobalErrorHandler = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      let errorMessage = 'Terjadi kesalahan yang tidak terduga';
      
      if (event.reason?.message) {
        errorMessage = event.reason.message;
      } else if (typeof event.reason === 'string') {
        errorMessage = event.reason;
      }

      // Check for specific error types
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = 'Anda tidak memiliki akses untuk melakukan tindakan ini.';
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorMessage = 'Data yang diminta tidak ditemukan.';
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        errorMessage = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        errorMessage = 'Koneksi internet bermasalah. Periksa koneksi Anda.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 20000, 
      });
    };

    // Handle general JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      toast({
        title: 'Error',
        description: `Terjadi kesalahan: ${event.message}`,
        variant: 'destructive',
        duration: 20000, 
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [toast]);
};