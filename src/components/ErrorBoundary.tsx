import { Component, ErrorInfo, PropsWithChildren } from "react";

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      return <>Something went wrong</>;
    }

    return this.props.children;
  }
}
