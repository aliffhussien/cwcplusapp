import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, ChefHat, ShoppingBag, User } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useNotifications } from '../hooks/useNotifications';

export default function Header({ variant = 'home', title, rightAction, transparentOverride = false }) {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const { user } = useUser();
    const { notifications } = useNotifications();
    const hasUnread = notifications?.some(n => !n.read_status) || false;

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    // Apply transparent background if not scrolled and no override is forcing transparency
    const bgClass = (scrolled && !transparentOverride)
        ? 'bg-[#070B14]/85 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
        : 'bg-transparent border-b border-transparent';

    if (variant === 'home') {
        return (
            <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-2.5 md:px-6 md:py-3 flex justify-between items-center transition-all duration-300 ${bgClass}`}>
                <div className="flex items-center gap-2.5 cursor-pointer relative" onClick={() => navigate('/')}>
                    <motion.div
                        animate={{ boxShadow: ["0 0 0 0px rgba(99,102,241,0.4)", "0 0 0 8px rgba(99,102,241,0)", "0 0 0 0px rgba(99,102,241,0)"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="rounded-full flex items-center justify-center relative bg-indigo-500/10 p-1"
                    >
                        <img src="/CWC.svg" alt="CWC Logo" className="h-8 md:h-10 w-auto object-contain relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }} />
                        {/* Fallback icon in case CWC.svg fails to load */}
                        <div className="hidden w-8 h-8 rounded-lg items-center justify-center relative z-10">
                            <ChefHat size={16} className="text-indigo-400" />
                        </div>
                    </motion.div>
                    <span className="text-lg font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">CWC+</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => navigate('/shop')}
                        className="p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]">
                        <ShoppingBag size={18} className="text-slate-300 md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]">
                        <Bell size={18} className="text-slate-300 md:w-5 md:h-5" />
                        {hasUnread && <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>}
                    </button>
                    <div
                        onClick={() => navigate('/profile')}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-white/10 cursor-pointer hover:border-indigo-400 transition-colors shadow-[0_4px_8px_rgba(0,0,0,0.5)] bg-slate-800 flex items-center justify-center">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <User size={16} className="text-slate-400" />
                        )}
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center transition-all duration-300 ${bgClass}`}>
            <div className="flex items-center gap-2.5 md:gap-3 group">
                <button onClick={() => navigate(-1)} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]">
                    <ChevronLeft size={20} className="text-slate-300 hover:text-white transition-colors hover:-translate-x-0.5" />
                </button>
                <button onClick={() => navigate('/')} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
                    <img src="/CWC.svg" alt="Home" className="h-5 md:h-6 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                    <div className="hidden w-full h-full items-center justify-center">
                        <ChefHat size={16} className="text-indigo-400" />
                    </div>
                </button>
                {title && (
                    <span className="text-base md:text-lg font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ml-1 line-clamp-1">
                        {title}
                    </span>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                {rightAction}
                {!rightAction && (
                    <div
                        onClick={() => navigate('/profile')}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-white/10 cursor-pointer hover:border-indigo-400 transition-colors shadow-[0_4px_8px_rgba(0,0,0,0.5)] bg-slate-800 flex items-center justify-center ml-1">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <User size={16} className="text-slate-400" />
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
