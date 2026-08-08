import { Component } from 'react';

/**
 * Last line of defense for a live demo: if any render error slips through
 * (a bad SDK payload shape, a null somewhere unexpected), this shows a
 * recoverable screen instead of a blank white page mid pitch.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[voyager] render error caught by boundary', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash-screen">
        <div className="crash-card">
          <h2>Something interrupted the page</h2>
          <p>The call itself is unaffected. Reload to bring the interface back.</p>
          <button className="btn primary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}
