import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ChefHat, Video, ShoppingBag, Film, Users, Bell, Settings, ShieldAlert, TrendingUp } from 'lucide-react';

interface AdminSidebarProps {
    isMobileOpen: boolean;
    activeTab: string;
    handleTabChange: (tab: string) => void;
}

export default function AdminSidebar({ isMobileOpen, activeTab, handleTabChange }: AdminSidebarProps) {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Command HQ' },
        { id: 'recipes', icon: ChefHat, label: 'Recipe Library' },
        { id: 'classes', icon: Video, label: 'Studio Classes' },
        { id: 'orders', icon: ShoppingBag, label: 'Order Pipeline' },
        { id: 'media', icon: Film, label: 'Media Vault' },
        { id: 'people', icon: Users, label: 'Personnel' },
        { id: 'broadcasts', icon: Bell, label: 'Broadcast' },
        { id: 'settings', icon: Settings, label: 'System Engine' }
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface/80 backdrop-blur-3xl border-r border-glass-border transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="flex flex-col h-full">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => handleTabChange('dashboard')}>
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-sec rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform"><ShieldAlert className="text-text-1" size={24} /></div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-text-1 leading-none">CWC+<span className="text-accent italic">HQ</span></h1>
                            <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.3em] mt-1">Admin Command</p>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${activeTab === item.id ? 'bg-accent/10 text-text-1' : 'text-text-3 hover:text-text-2'}`}>
                                <item.icon size={18} className={activeTab === item.id ? 'text-accent' : 'group-hover:text-text-1 transition-colors'} />
                                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                {activeTab === item.id && <motion.div layoutId="nav-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-r-full" />}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-8 border-t border-glass-border bg-base/40">
                    <div className="p-4 rounded-2xl bg-glass-bg border border-glass-border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent"><TrendingUp size={16} /></div>
                            <p className="text-[10px] font-black uppercase text-text-3 tracking-widest">Platform Pulse</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1 bg-glass-border rounded-full overflow-hidden"><div className="h-full bg-accent w-[85%]" /></div>
                            <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest">System Load: 24%</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
