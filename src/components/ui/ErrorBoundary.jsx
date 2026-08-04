import { Component } from 'react';
import { COLORS } from '../../theme/colors';

// Production-readiness safety net: without this, any uncaught render error
// anywhere in the tree white-screens the entire app with nothing but a blank
// page and a console stack trace. Mounted once at the app root (see
// App.jsx) so a crash in one screen still leaves the user with a way back
// out instead of a dead tab.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled render error:', error, info?.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.assign('/');
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-surface-light px-6 text-center dark:bg-surface-dark">
        <p className="text-xl font-bold text-gray-900 dark:text-white">Something went wrong</p>
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          An unexpected error occurred. Your data is safe — try reloading the page.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: COLORS.primary }}
        >
          Reload
        </button>
      </div>
    );
  }
}
