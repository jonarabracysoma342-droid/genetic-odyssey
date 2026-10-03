import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary — Jaring pengaman React.
 * Menangkap error runtime pada child components dan menampilkan
 * fallback UI yang ramah (bukan layar putih kosong).
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#74c2e8] flex items-center justify-center p-6 font-sans select-none">
          <div className="max-w-md w-full bg-[#fae8b6] border-4 border-[#361706] rounded-2xl shadow-[6px_6px_0_#1a0b03] p-6 text-center space-y-5">
            
            {/* Icon */}
            <div className="w-16 h-16 mx-auto rounded-xl bg-rose-100 border-3 border-[#361706] flex items-center justify-center shadow-sm">
              <AlertCircle className="w-9 h-9 text-rose-500 animate-bounce" />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <h2 className="text-sm font-black text-[#361706] uppercase tracking-wider font-pixel">
                ⚠️ Ups, Terjadi Kesalahan!
              </h2>
              <p className="text-xs text-[#884318] leading-relaxed">
                Komponen ini mengalami error dan tidak bisa ditampilkan. 
                Tenang, data kamu tetap aman di cloud!
              </p>
            </div>

            {/* Error Detail (collapsed) */}
            {this.state.error && (
              <details className="text-left bg-[#2b1103] rounded-lg p-3 border-2 border-[#361706]">
                <summary className="text-[10px] font-pixel text-[#ffd699] cursor-pointer uppercase tracking-wider">
                  Detail Error (untuk developer)
                </summary>
                <pre className="mt-2 text-[9px] text-rose-300 font-mono whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <span className="text-[#ffd699]/50">{this.state.errorInfo.componentStack}</span>
                  )}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center pt-1">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#ca7c38] hover:bg-[#b56e2f] text-[#2b1103] border-2 border-[#361706] rounded-xl font-pixel text-[10px] uppercase tracking-wider font-black shadow-[2px_2px_0_#1a0b03] cursor-pointer active:translate-y-0.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Coba Lagi
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#df9b52] hover:bg-[#ca7c38] text-[#2b1103] border-2 border-[#361706] rounded-xl font-pixel text-[10px] uppercase tracking-wider font-black shadow-[2px_2px_0_#1a0b03] cursor-pointer active:translate-y-0.5 transition-all"
              >
                🔄 Muat Ulang
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
