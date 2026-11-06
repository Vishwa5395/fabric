import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  departmentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Department crashed safely caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', marginTop: '40px' }}>
          <div className="card" style={{ maxWidth: '450px', margin: '0 auto', borderTop: '4px solid var(--color-coral)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>
              Arre! Is department mein thoda gadbad ho gaya.
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              Fikar mat kijiye, baaki departments ekdum theek chal rahe hain. Aap dobara try kar sakte hain ya HQ par wapas ja sakte hain.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => this.setState({ hasError: false })}
              >
                Dobara Koshish Karein
              </button>
              <a
                href="#/hq"
                className="btn btn-primary"
                onClick={() => this.setState({ hasError: false })}
              >
                HQ Par Wapas Jao
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
