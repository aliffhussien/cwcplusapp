import React from 'react';
import { LayoutDashboard, Search, Loader2, ShieldAlert } from 'lucide-react';

interface AdminHeaderProps {
    activeTab: string;
    isMobileOpen: boolean;
    setIsMobileOpen: (v: boolean) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    mrr: number;
    user: any;
    godMode: boolean;
    setGodMode: (v: boolean) => void;
    setSelectedItems: (v: Set<any>) => void;
    showToast: (msg: string, type?: string) => void;
}

const NAV_LABELS: Record<string, string> = { dashboard: 'HQ Dashboard', recipes: 'Library', classes: 'Production', media: 'Vault', people: 'Personnel', broadcasts: 'Comms', settings: 'Engine' };

export default function AdminHeader({ activeTab, isMobileOpen, setIsMobileOpen, searchQuery, setSearchQuery, mrr, user, godMode, setGodMode, setSelectedItems, showToast }: AdminHeaderProps) {
    return (
        <header className="h-20 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-xl border-b border-glass-border sticky top-0 z-40">
            <div className="flex items-center gap-6">
                <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden p-2 text-text-3"><LayoutDashboard size={20} /></button>
                <div className="relative group hidden md:block">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-accent transition-colors" />
                    <input type="text" placeholder={`Search ${NAV_LABELS[activeTab] || 'Platform'}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-96 h-11 bg-glass-bg border border-glass-border rounded-xl pl-12 pr-6 text-xs font-bold text-text-1 outline-none focus:border-accent/30 focus:bg-elevated transition-all" />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button onClick={() => { const btn = document.getElementById('sync-spinner'); if (btn) btn.classList.add('animate-spin-slow'); setTimeout(() => window.location.reload(), 1000); }} className="p-2.5 bg-elevated hover:bg-glass-bg text-text-3 hover:text-accent rounded-xl border border-glass-border transition-all group overflow-hidden relative" title="Deep Sync Everything"><Loader2 id="sync-spinner" size={18} className="transition-transform duration-700" /></button>
                <div className="hidden xl:flex items-center gap-5 mr-3 pr-5 border-r border-glass-border">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-3 leading-none mb-1">CWC+ Sync</p>
                        <div className="flex items-center justify-end gap-1.5"><div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /><p className="text-xs font-bold text-accent leading-none">Live</p></div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-3 leading-none">Global MRR</p>
                        <p className="text-xs font-bold text-text-1 mt-1 leading-none">${mrr.toFixed(0)}</p>
                    </div>
                </div>
                {user?.isGod && (
                    <button onClick={() => { setGodMode(!godMode); setSelectedItems(new Set()); if (!godMode) showToast("MANAGEMENT MODE ACTIVE ⚡", "success"); }} className={`px-5 py-2 rounded-full border flex items-center gap-2 transition-all ${godMode ? 'bg-danger border-danger text-text-1 shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'bg-elevated border-glass-border text-text-3 hover:text-text-1'}`}>
                        <ShieldAlert size={14} /><span className="text-[10px] font-black uppercase tracking-widest">{godMode ? 'Management Active' : 'Advanced Mode'}</span>
                    </button>
                )}
                <div className="px-4 py-2 bg-glass-bg border border-glass-border rounded-full flex items-center gap-2 group hover:border-accent/30 transition-colors">
                    <div className="w-1.5 h-1.5 bg-text-3 group-hover:bg-accent rounded-full transition-colors" /><span className="text-[10px] font-black text-text-3 group-hover:text-text-1 uppercase tracking-widest">v2.0.4</span>
                </div>
            </div>
        </header>
    );
}
