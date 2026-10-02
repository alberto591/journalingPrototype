import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
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
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-3xl border border-sand-200 shadow-card text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h3 className="font-serif font-bold text-xl text-stone-900">
            {this.props.fallbackTitle || 'Ha ocurrido un inconveniente al cargar esta vista'}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            {this.props.fallbackDescription ||
              'Se ha presentado un error imprevisto al renderizar el contenido. Puedes intentar recargar la vista o volver al panel principal.'}
          </p>

          {this.state.error?.message && (
            <div className="text-[11px] font-mono text-stone-500 bg-sand-50 p-3 rounded-xl border border-sand-200 max-w-lg mx-auto overflow-x-auto text-left">
              {this.state.error.message}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="travesia-btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Intentar de nuevo</span>
            </button>
            <a
              href="/dashboard"
              className="travesia-btn-primary text-xs py-2 px-5 flex items-center justify-center gap-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Ir al panel principal</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
