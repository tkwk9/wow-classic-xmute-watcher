import React from "react";

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentWillReceiveProps() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              fontSize: "30px",
              color: "white",
            }}
          >
            Something went wrong
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
