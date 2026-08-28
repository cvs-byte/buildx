import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ERROR BOUNDARY CAUGHT EXCEPTION]', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-white text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">
              {this.props.fallbackTitle || 'Scanner Encountered an Error'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {this.props.fallbackMessage ||
                this.state.error?.message ||
                'An unexpected error occurred while running the scanner.'}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw size={14} />}
            onClick={this.handleRetry}
          >
            Retry Scanner
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
