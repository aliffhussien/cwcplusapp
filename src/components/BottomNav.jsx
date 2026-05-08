import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, PlaySquare, CalendarHeart, User, ShoppingBag } from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show bottom nav on recipe specific views, cooking mode, or admin panel
    if (location.pathname.startsWith('/recipe/') || location.pathname.startsWith('/admin')) return null;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/recipes', icon: Compass, label: 'Library' },
        { path: '/classes', icon: PlaySquare, label: 'Classes' },
        { path: '/planner', icon: CalendarHeart, label: 'Planner' },
    ];

    return (
        <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[500px] z-50">
            <nav className="bg-[#070B14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-2 md:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] flex justify-between items-center relative overflow-hidden">
                {/* Subtle top glare */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="relative flex flex-col items-center justify-center w-full h-14 md:h-16 rounded-2xl transition-all duration-300"
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none"></div>
                            )}
                            <Icon 
                                size={22} 
                                className={`mb-1 transition-all duration-300 md:w-6 md:h-6 ${isActive ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'text-slate-400 hover:text-slate-200'}`} 
                            />
                            <span className={`text-[10px] md:text-xs font-bold tracking-wider transition-colors ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
