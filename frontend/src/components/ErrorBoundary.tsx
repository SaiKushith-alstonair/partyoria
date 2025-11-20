import React, { Component, ErrorInfo, ReactNode } from 'react';


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group('🚨 React Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();



    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{
            padding: '20px',
            margin: '20px',
            border: '2px solid #ff4444',
            borderRadius: '8px',
            backgroundColor: '#fff5f5',
            color: '#cc0000'
          }}>
            <h2>🚨 Something went wrong!</h2>
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Click to see error details
              </summary>
              <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
                <strong>Error:</strong> {this.state.error?.message}
                <br />
                <strong>Stack:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>
                  {this.state.error?.stack}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <strong>Component Stack:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;