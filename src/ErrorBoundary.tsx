import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-8 text-center text-red-500 font-bold bg-white h-screen flex flex-col justify-center items-center">
          <h2>Sorry.. there was an error</h2>
          <p className="mt-4 text-sm text-gray-500 max-w-xl mx-auto break-all">{this.state.error?.toString()}</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
