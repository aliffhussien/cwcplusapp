import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useDevicePerformance } from '../hooks/useDevicePerformance';

/**
 * Mobile Pro Trick: Trigger a subtle vibration on tap (Android/Mobile-Web)
 */
export const triggerHaptic = (type = 'light') => {
    try {
        if (!window.navigator.vibrate) return;
        if (type === 'light') window.navigator.vibrate(15);
        else if (type === 'medium') window.navigator.vibrate(35);
        else if (type === 'error') window.navigator.vibrate([40, 40, 40]);
    } catch(e) {}
};

/**
 * World-Class Mobile Architecture: Skeleton Loader
 * Eliminates full-screen spinners to maintain perceived motion.
 */
export const Skeleton = ({ width = '100%', height = '20px', radius = '12px', className = "" }) => (
    <div 
        className={`relative overflow-hidden bg-white/5 ${className}`}
        style={{ width, height, borderRadius: radius }}
    >
        <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-1/2"
        />
    </div>
);

/**
 * Zero-Jank Button: Enforces 48px Touch Target & Instant Feedback
 */
export const JankFreeButton = ({ onClick, children, className = "", disabled = false, variant = "primary" }) => {
    const { isLowEnd } = useDevicePerformance();
    
    const baseStyles = "relative flex items-center justify-center font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 min-h-[48px] px-6 rounded-2xl";
    const variants = {
        primary: "bg-indigo-600 text-white shadow-lg active:bg-indigo-500",
        secondary: "bg-white/5 text-slate-300 border border-white/10 active:bg-white/10",
        danger: "bg-rose-500/10 text-rose-500 border border-rose-500/20 active:bg-rose-500 active:text-white",
        success: "bg-emerald-500 text-white shadow-xl active:bg-emerald-400"
    };

    return (
        <button 
            onClick={(e) => {
                triggerHaptic('light');
                if (onClick) onClick(e);
            }}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

/**
 * Adaptive UI Container: Trims non-essential decorations on low-spec hardware
 */
export const AdaptiveContainer = ({ children, className = "" }) => {
    const { isLowEnd } = useDevicePerformance();
    
    return (
        <div className={`
            ${className} 
            ${isLowEnd ? 'border-none shadow-none bg-slate-900' : 'border-2 border-slate-800 bg-slate-900/50 backdrop-blur-3xl shadow-2xl'}
            rounded-[32px]
        `}>
            {children}
        </div>
    );
};

/**
 * Optimized Image: Native-driver fade-in with loading skeleton
 */
export const OptimizedImage = ({ src, alt, className = "", aspect = "aspect-square" }) => {
    const [loaded, setLoaded] = React.useState(false);
    
    return (
        <div className={`relative ${aspect} overflow-hidden bg-white/5 rounded-2xl ${className}`}>
            {!loaded && <Skeleton width="100%" height="100%" radius="0" />}
            {src ? (
                <img 
                    src={src} 
                    alt={alt}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
            ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Sparkles className="text-slate-800" size={24} />
                </div>
            )}
        </div>
    );
};

/**
 * Memory-Safe List Wrapper: Virtualization Placeholder for Web
 */
export const PerformanceList = ({ items, renderItem, emptyState, visibleCount = 10, onLoadMore }) => {
    if (!items || items.length === 0) return emptyState;

    return (
        <div className="space-y-4">
            {items.slice(0, visibleCount).map((item, index) => renderItem(item, index))}
            {items.length > visibleCount && (
                <div className="pt-8 pb-12 flex justify-center">
                    <JankFreeButton variant="secondary" onClick={onLoadMore}>
                        Load More Content
                    </JankFreeButton>
                </div>
            )}
        </div>
    );
};

/**
 * Offline Sentry: Detects network drops and provides graceful fallbacks
 */
export const OfflineSentry = () => {
    const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-24 left-4 right-4 z-[100] bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-rose-400/30 backdrop-blur-xl"
        >
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">You're Offline</span>
            </div>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Using Cached Data</p>
        </motion.div>
    );
};
