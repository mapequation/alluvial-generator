import { Component, ErrorInfo } from "react";

export default class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {}

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return <>Something went wrong</>;
    }

    return this.props.children;
  }
}
