import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, ChefHat, User, Search } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useClasses } from '../hooks/useClasses';
import { useNotifications } from '../hooks/useNotifications';
import { useAppSettings } from '../hooks/useAppSettings';
import { useDevicePerformance } from '../hooks/useDevicePerformance';
import { OptimizedImage, JankFreeButton } from './PerformanceUI';
import { APP_COPY } from '../config/appCopy';
import { useRecipes } from '../hooks/useRecipes';
import { useMerch } from '../hooks/useMerch';
import { X, Search as SearchIcon, PlayCircle, BookOpen, ShoppingBag as ShopIcon, ArrowRight } from 'lucide-react';

export default function Header({ variant = 'home', title, rightAction, transparentOverride = false }) {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const { user } = useUser();
    const { settings } = useAppSettings();
    const { isLowEnd } = useDevicePerformance();
    const { notifications } = useNotifications();
    const { publicClasses } = useClasses();
    const { publicRecipes } = useRecipes();
    const { publicMerch } = useMerch();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const hasUnread = notifications?.some(n => !n.read_status) || false;

    const liveUrl = settings.tiktokLiveUrl || settings.youtubeLiveUrl;
    const isTikTok = !!settings.tiktokLiveUrl;

    useEffect(() => {
        if (isSearchOpen) document.body.classList.add('search-open');
        else document.body.classList.remove('search-open');
    }, [isSearchOpen]);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') setIsSearchOpen(false);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [scrolled]);

    const bgClass = (scrolled && !transparentOverride)
        ? `${isLowEnd ? 'bg-[#070B14]' : 'bg-[#070B14]/80 backdrop-blur-md'} border-b border-white/5 shadow-sm`
        : 'bg-transparent border-b border-transparent';

    if (variant === 'home') {
        return (
            <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-8 md:py-4 flex justify-between items-center transition-all duration-300 ${bgClass}`}>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-sm">
                        <img src="/CWC.svg" alt={APP_COPY.branding.name} className="h-7 md:h-8 w-auto object-contain" onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }} />
                        <div className="hidden w-7 h-7 items-center justify-center">
                            <ChefHat size={18} className="text-white" />
                        </div>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">{APP_COPY.branding.shortName}</span>
                </div>
                <div className="flex items-center gap-3">
                    {liveUrl && (
                        <a 
                            href={liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                        >
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                                {isTikTok ? 'Live' : 'Live Now'}
                            </span>
                        </a>
                    )}
                    
                    {/* Search Trigger */}
                    <button 
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-3 h-10 px-3 md:px-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                        <SearchIcon size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:inline opacity-60 group-hover:opacity-100 transition-opacity">Search</span>
                        <div className="hidden md:flex items-center justify-center w-7 h-5 bg-white/10 rounded-lg border border-white/10 text-[9px] font-black opacity-40 group-hover:opacity-100 transition-opacity">
                            K
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative shadow-sm">
                        <Bell size={18} className="text-white" />
                        {hasUnread && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span>}
                    </button>
                </div>

                {/* Smart Search Overlay */}
                {isSearchOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#070B14]/95 backdrop-blur-2xl flex flex-col p-4 md:p-20"
                    >
                        <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 relative">
                                    <SearchIcon size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" />
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search recipes, classes, gear..." 
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-xl font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-2xl"
                                    />
                                </div>
                                <button 
                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                    className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-500 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-12">
                                {searchQuery.length >= 2 ? (
                                    <>
                                        {/* Recipe Results */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Recipe Results</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {publicRecipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4).map(r => (
                                                    <div key={r.id} onClick={() => { navigate(`/recipe/${r.id}`); setIsSearchOpen(false); }} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer">
                                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                            <BookOpen size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">{r.title}</p>
                                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{r.category || 'Signature'}</p>
                                                        </div>
                                                        <ArrowRight size={14} className="text-slate-700 group-hover:text-white transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Class Results */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Masterclasses</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {publicClasses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4).map(c => (
                                                    <div key={c.id} onClick={() => { navigate(`/classes?id=${c.id}`); setIsSearchOpen(false); }} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-rose-500/30 transition-all group cursor-pointer">
                                                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                            <PlayCircle size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">{c.title}</p>
                                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{c.instructor || 'Expert'}</p>
                                                        </div>
                                                        <ArrowRight size={14} className="text-slate-700 group-hover:text-white transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Gear Results */}
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Elite Gear</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {publicMerch.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4).map(p => (
                                                    <div key={p.id} onClick={() => { navigate(`/shop#merch-${p.id}`); setIsSearchOpen(false); }} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-amber-500/30 transition-all group cursor-pointer">
                                                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                            <ShopIcon size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">{p.title}</p>
                                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">${p.price}</p>
                                                        </div>
                                                        <ArrowRight size={14} className="text-slate-700 group-hover:text-white transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                        <SearchIcon size={64} className="mb-6 text-slate-700" />
                                        <h4 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Searching the Vault</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Enter keywords to scan the CWC+ library</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>
        );
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-8 md:py-4 flex justify-between items-center transition-all duration-300 ${bgClass}`}>
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
                    <ChevronLeft size={20} className="text-white" />
                </button>
                {title && (
                    <span className="text-base md:text-lg font-bold tracking-tight text-white ml-1">
                        {title}
                    </span>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                {rightAction}
            </div>
        </nav>
    );
}

