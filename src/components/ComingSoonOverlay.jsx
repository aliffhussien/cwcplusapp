import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

// Hides the public app behind a countdown while VOL 23 fixes are finished.
// Ends automatically at END_AT — no manual cleanup needed after that.
const END_AT = new Date('2026-08-10T00:00:00+08:00').getTime();

const formatRemaining = (ms) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
};

export default function ComingSoonOverlay() {
    const location = useLocation();
    const [remaining, setRemaining] = useState(() => END_AT - Date.now());

    useEffect(() => {
        const interval = setInterval(() => setRemaining(END_AT - Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const bypass = location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth/callback');
    if (bypass || remaining <= 0) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-base flex flex-col items-center justify-center px-6 text-center">
            <Sparkles size={40} className="text-accent mb-4" />
            <h1 className="text-2xl font-semibold text-text-1 mb-2">Something new is coming</h1>
            <p className="text-text-2 mb-8 max-w-sm">We're putting the finishing touches on CWC+. Back shortly.</p>
            <div className="text-4xl font-mono font-bold text-accent tracking-wider">{formatRemaining(remaining)}</div>
        </div>
    );
}
