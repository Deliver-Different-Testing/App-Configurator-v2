import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class AttachmentBuilderErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AttachmentBuilderErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-700 font-semibold">Attachment Builder failed to render</h3>
        <p className="text-red-600 text-sm mt-1">{this.state.message}</p>
        <button className="mt-3 px-3 py-1.5 text-sm rounded bg-red-600 text-white" onClick={this.reset}>Try again</button>
      </div>
    );
  }
}
