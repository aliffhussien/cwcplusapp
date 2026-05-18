import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ChefHat } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Removed console.error per SIGMA rule
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-base text-text-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-md text-center space-y-6">
                        <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center mx-auto">
                            <ChefHat size={28} className="text-danger" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-text-1 uppercase tracking-tight mb-2">Something went wrong</h1>
                            <p className="text-sm text-text-3 font-medium">The kitchen hit an unexpected issue. Refresh to get back on track.</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary px-8 py-3 text-sm mx-auto"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
