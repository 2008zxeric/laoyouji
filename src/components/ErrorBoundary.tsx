import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[280px] p-6 bg-[#FAF9F6] rounded-3xl border border-[#EAE6DF] shadow-sm flex flex-col items-center justify-center text-center space-y-4 my-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#85660d] border border-amber-200 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base md:text-lg text-[#2C3E50]">
              {this.props.fallbackTitle || '内容正在平稳加载中'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm">
              已为您自动启动乐龄守护机制，点击下方按钮即可重新加载该模块或返回首页。
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#2C3E50] text-[#D4AF37] rounded-xl text-xs font-bold shadow-xs hover:bg-[#1a252f] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重新尝试</span>
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-white text-stone-700 border border-stone-200 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>刷新页面</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
