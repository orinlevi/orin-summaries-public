"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ContentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg p-6 text-center my-8">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">
              שגיאה בטעינת התוכן
            </p>
            <p className="text-red-500/70 dark:text-red-400/60 text-sm">
              נסו לרפרש את הדף. אם הבעיה נמשכת, כתבו לי.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
