import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Galaxy Finance Crash Guard Caught Error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearStorageAndReload = () => {
    try {
      localStorage.removeItem('rupeewise_token');
      localStorage.removeItem('rupeewise_user');
      sessionStorage.clear();
    } catch {
      // ignore storage access errors
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-[#0D0D11] text-[#FBFBFB] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
          {/* Ambient radial glows */}
          <div 
            className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(74, 18, 26, 0.25) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 w-full max-w-2xl bg-[#13131A] rounded-3xl border border-[rgba(74,18,26,0.5)] p-6 sm:p-8 shadow-2xl shadow-black/90">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-[rgba(255,255,255,0.06)]">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(74,18,26,0.35)] border border-[rgba(229,57,53,0.4)] flex items-center justify-center shrink-0 shadow-lg shadow-[rgba(74,18,26,0.3)]">
                <AlertTriangle className="w-6 h-6 text-[#E53935]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#FBFBFB]">
                  Galaxy Finance — System Recovery Guard
                </h2>
                <p className="text-xs text-[#8E929D] font-mono mt-0.5">
                  An unhandled component exception was intercepted. Telemetry halted to prevent corrupt state.
                </p>
              </div>
            </div>

            {/* Error Diagnostics Box */}
            <div className="mb-6 rounded-2xl bg-[#0D0D11] border border-[rgba(142,146,157,0.2)] p-4 overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-mono text-[#E53935] mb-2 font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Error Diagnosis:</span>
              </div>
              <p className="font-mono text-xs text-[#FBFBFB] break-words whitespace-pre-wrap leading-relaxed">
                {this.state.error?.message || 'Unknown runtime error occurred.'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <details className="mt-3 text-[11px] font-mono text-[#8E929D]">
                  <summary className="cursor-pointer hover:text-[#FBFBFB] transition-colors py-1">
                    Component Stack Trace
                  </summary>
                  <pre className="mt-2 p-2 rounded-lg bg-black/50 text-[10px] overflow-x-auto text-[#8E929D] max-h-40 overflow-y-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-crimson flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] cursor-pointer shadow-lg shadow-[rgba(211,47,47,0.25)]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearStorageAndReload}
                className="btn-slate-subtle flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8E929D] hover:text-[#FBFBFB] border border-[rgba(142,146,157,0.25)] bg-[rgba(74,18,26,0.2)] hover:border-[#8E929D] cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Reset Session & Return</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
