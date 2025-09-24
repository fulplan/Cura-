import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 [ERROR BOUNDARY] Caught an error:', errorDetails);
    }

    // Log to server for production (could be implemented later)
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorDetails)
    // });

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [ERROR BOUNDARY] Reloading application...');
    }
    window.location.reload();
  };

  private handleReset = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [ERROR BOUNDARY] Resetting error state...');
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl text-destructive">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                An unexpected error occurred. The development team has been notified.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-3 rounded">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap overflow-auto">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\nStack Trace:'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload}>
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;