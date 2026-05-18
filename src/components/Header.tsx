import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, ChefHat, Search as SearchIcon } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAppSettings } from '../hooks/useAppSettings';
import { useDevicePerformance } from '../hooks/useDevicePerformance';
import { APP_COPY } from '../config/appCopy';
import SearchOverlay from './SearchOverlay';

interface HeaderProps {
    variant?: 'home' | 'page' | 'back' | 'transparent';
    title?: string;
    userName?: string;
    rightAction?: React.ReactNode;
    transparentOverride?: boolean;
    isStatic?: boolean;
}

export default function Header({ variant = 'home', title, rightAction, transparentOverride = false, isStatic = false }: HeaderProps) {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { settings } = useAppSettings();
    const { isLowEnd } = useDevicePerformance();
    const { notifications } = useNotifications();

    const hasUnread = notifications?.some((n: any) => !n.read_status) || false;
    const liveUrl = settings?.tiktokLiveUrl || settings?.youtubeLiveUrl;
    const isTikTok = !!settings?.tiktokLiveUrl;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(true); }
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
    }, []);

    const bgClass = scrolled && !transparentOverride
        ? `${isLowEnd ? 'bg-base' : 'bg-base/95 backdrop-blur-xl'} border-b border-border shadow-md`
        : 'bg-transparent border-b border-transparent';

    const positionClass = isStatic ? 'relative w-full' : 'fixed top-0 left-0 right-0 z-50';

    return (
        <>
            <nav className={`${positionClass} px-4 py-3 md:px-8 md:py-4 flex justify-between items-center transition-all duration-300 ${bgClass}`}>
                {variant === 'home' ? (
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-glass-bg p-1.5 rounded-xl border border-glass-border shadow-sm">
                            <img
                                src="/CWC.svg"
                                alt={APP_COPY.branding.name}
                                className="h-7 md:h-8 w-auto object-contain"
                                onError={e => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                            />
                            <div className="hidden w-7 h-7 items-center justify-center">
                                <ChefHat size={18} className="text-text-1" />
                            </div>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-text-1">{APP_COPY.branding.shortName}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-glass-bg border border-glass-border hover:bg-elevated transition-colors"
                        >
                            <ChevronLeft size={20} className="text-text-1" />
                        </button>
                        {title && (
                            <span className="text-base font-bold tracking-tight text-text-1 truncate max-w-[200px]">{title}</span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {variant === 'home' && liveUrl && (
                        <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-danger/10 border border-danger/20 hover:bg-danger/20 transition-all">
                            <div className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-danger">
                                {isTikTok ? 'Live' : 'Live Now'}
                            </span>
                        </a>
                    )}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-2 h-9 px-3 bg-glass-bg border border-glass-border rounded-xl text-text-3 hover:text-text-1 hover:bg-elevated transition-all shadow-sm"
                    >
                        <SearchIcon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Search</span>
                    </button>
                    {variant === 'home' ? (
                        <button
                            onClick={() => navigate('/notifications')}
                            className="relative p-2 rounded-xl bg-glass-bg border border-glass-border hover:bg-elevated transition-colors"
                        >
                            <Bell size={17} className="text-text-1" />
                            {hasUnread && (
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                            )}
                        </button>
                    ) : rightAction}
                </div>
            </nav>

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
