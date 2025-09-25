import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="border shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-red-600">
                  Oops! Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm text-center">
                  The application encountered an unexpected error. This usually happens due to:
                </p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Network connectivity issues</li>
                  <li>Server maintenance</li>
                  <li>Browser compatibility issues</li>
                  <li>Temporary data inconsistencies</li>
                </ul>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                    <summary className="cursor-pointer font-medium text-red-600">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-red-500">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={this.handleReset} 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={this.handleReload} 
                    size="sm" 
                    className="flex-1"
                  >
                    Reload Page
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center pt-2">
                  If the problem persists, please try refreshing the page or contact support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}