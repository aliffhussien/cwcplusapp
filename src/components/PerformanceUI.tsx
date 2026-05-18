import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useDevicePerformance } from '../hooks/useDevicePerformance';

export const triggerHaptic = (type: 'light' | 'medium' | 'error' = 'light') => {
    try {
        if (!window.navigator.vibrate) return;
        if (type === 'light') window.navigator.vibrate(15);
        else if (type === 'medium') window.navigator.vibrate(35);
        else if (type === 'error') window.navigator.vibrate([40, 40, 40]);
    } catch(e) {}
};

export const Skeleton = ({ width = '100%', height = '20px', radius = '12px', className = "" }: { width?: string, height?: string, radius?: string, className?: string }) => (
    <div 
        className={`relative overflow-hidden bg-glass-bg ${className}`}
        style={{ width, height, borderRadius: radius }}
    >
        <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-border-mid to-transparent w-1/2"
        />
    </div>
);

interface JankFreeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const JankFreeButton = ({ onClick, children, className = "", disabled = false, variant = "primary", ...props }: JankFreeButtonProps) => {
    const baseStyles = "relative flex items-center justify-center font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 min-h-[48px] px-6 rounded-2xl";
    const variants = {
        primary: "bg-accent text-text-1 shadow-lg active:bg-accent-sec",
        secondary: "bg-glass-bg text-text-1 border border-glass-border active:bg-elevated",
        danger: "bg-danger/10 text-danger border border-danger/20 active:bg-danger active:text-text-1",
        success: "bg-success text-text-1 shadow-xl active:opacity-80"
    };

    return (
        <button 
            onClick={(e) => {
                triggerHaptic('light');
                if (onClick) onClick(e);
            }}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const AdaptiveContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const { isLowEnd } = useDevicePerformance();
    
    return (
        <div className={`
            ${className} 
            ${isLowEnd ? 'border-none shadow-none bg-base' : 'border-2 border-border bg-base/50 backdrop-blur-3xl shadow-2xl'}
            rounded-[32px]
        `}>
            {children}
        </div>
    );
};

export const OptimizedImage = ({ src, alt, className = "", aspect = "aspect-square" }: { src?: string, alt?: string, className?: string, aspect?: string }) => {
    const [loaded, setLoaded] = React.useState(false);
    
    return (
        <div className={`relative ${aspect} overflow-hidden bg-glass-bg rounded-2xl ${className}`}>
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
                <div className="w-full h-full bg-glass-bg flex items-center justify-center">
                    <Sparkles className="text-text-3" size={24} />
                </div>
            )}
        </div>
    );
};

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
            className="fixed bottom-24 left-4 right-4 z-[100] bg-danger text-text-1 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-danger/30 backdrop-blur-xl"
        >
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-text-1 rounded-full animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">You're Offline</span>
            </div>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Using Cached Data</p>
        </motion.div>
    );
};
