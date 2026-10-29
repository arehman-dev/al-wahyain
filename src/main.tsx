import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-ibm">
          <div className="max-w-xl w-full bg-slate-800 border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-xl font-bold">ایپ میں غیر متوقع مسئلہ پیش آیا (Runtime Error)</h2>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              براؤزر کے کیش یا لوکل ڈیٹا کی وجہ سے اسکرین لوڈ نہیں ہو سکی۔ ذیل کا بٹن دبا کر ایپ کو ری سیٹ کریں۔
            </p>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-red-300 overflow-x-auto text-left" dir="ltr">
              {this.state.error?.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all"
              >
                ڈیٹا ری سیٹ کریں اور دوبارہ لوڈ کریں (Reset & Reload)
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-all"
              >
                صفحہ ریفریش کریں
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
