import { Component } from 'react';
import { ChefHat } from 'lucide-react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('App error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center p-6">
                    <div className="w-full max-w-md text-center space-y-6">
                        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <ChefHat size={28} className="text-rose-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight mb-2">Something went wrong</h1>
                            <p className="text-sm text-slate-500 font-medium">The kitchen hit an unexpected issue. Refresh to get back on track.</p>
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
