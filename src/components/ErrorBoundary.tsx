import React from 'react';

interface State {
  error: Error | null;
}

/** Shows a readable message instead of a blank white screen if any component crashes. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[E-INVORA] Page error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', background: '#F8F3EA', color: '#29221F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 520, background: '#fff', border: '1px solid #D4B477', borderRadius: 24, padding: 32, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#6E2639', fontSize: 28, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
            This page could not be shown. Please reload. If it keeps happening, contact us on WhatsApp at +91 8778095016.
          </p>
          <pre style={{ textAlign: 'left', fontSize: 11, background: '#F8F3EA', padding: 12, borderRadius: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0 0 16px' }}>
            {String(this.state.error.message || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#6E2639', color: '#fff', border: 0, borderRadius: 999, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
