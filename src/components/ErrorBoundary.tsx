import React, { Component, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Hook-based error handler component
const ErrorToastHandler = ({ error }: { error: Error }) => {
  const { toast } = useToast();

  React.useEffect(() => {
    toast({
      title: "Terjadi Kesalahan",
      description: `Error: ${error.message}`,
      variant: "destructive",
      duration: 20000,
    });
  }, [error, toast]);

  return null;
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
            <p className="text-muted-foreground">
              Aplikasi mengalami error yang tidak terduga.
            </p>
            <p className="text-sm text-muted-foreground">
              {this.state.error.message}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reload Halaman
            </button>
            <ErrorToastHandler error={this.state.error} />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;