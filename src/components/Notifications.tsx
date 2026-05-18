import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChefHat, ShoppingBag, Info, CheckCircle2, X, Play, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { useNotifications } from '../hooks/useNotifications';
import { timeAgo } from '../lib/dateUtils';

const TYPE_ICONS: any = {
    alert:   <Bell size={18} className="text-danger" />,
    class:   <Play size={18} className="text-warning" />,
    recipe:  <ChefHat size={18} className="text-accent" />,
    shop:    <ShoppingBag size={18} className="text-accent" />,
    system:  <Info size={18} className="text-accent" />,
    success: <CheckCircle2 size={18} className="text-accent" />,
};

const TYPE_COLORS: any = {
    alert:   'bg-danger/10 border-danger/20',
    class:   'bg-warning/10 border-warning/20',
    recipe:  'bg-accent/10 border-accent/20',
    shop:    'bg-accent/10 border-accent/20',
    system:  'bg-glass-bg border-glass-border',
    success: 'bg-accent/10 border-accent/20',
};

const NotificationItem = ({ notif, onDismiss, onMarkRead }: any) => {
    const icon = TYPE_ICONS[notif.type] || TYPE_ICONS.system;
    const colorCls = TYPE_COLORS[notif.type] || TYPE_COLORS.system;

    return (
        <motion.div
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2}
            onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 100) onDismiss(notif.id); }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 80, scale: 0.95 }}
            onClick={() => !notif.read_status && onMarkRead(notif.id)}
            className={`relative rounded-2xl border mb-3 overflow-hidden cursor-pointer transition-opacity ${colorCls} ${notif.read_status ? 'opacity-50' : ''}`}
        >
            {!notif.read_status && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent shadow-[0_0_8px_rgba(20,184,166,0.6)]" />}
            <div className="flex gap-3 items-start p-4 pl-5">
                <div className="w-9 h-9 rounded-xl bg-base/30 border border-glass-border flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h4 className={`text-sm font-bold leading-snug ${notif.read_status ? 'text-text-3' : 'text-text-1'}`}>{notif.title}</h4>
                        <span className="section-label shrink-0 mt-0.5 text-text-3">{timeAgo(notif.created_at)}</span>
                    </div>
                    {notif.message && <p className="text-xs text-text-3 leading-relaxed mb-2">{notif.message}</p>}
                    
                    {notif.attachment_type === 'recipe' && notif.attachment_id && (
                        <Link to={`/recipe/${notif.attachment_id}`} onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"><ChefHat size={11} /> View Recipe <ArrowRight size={11} /></Link>
                    )}
                    {notif.attachment_type === 'class' && notif.attachment_id && (
                        <Link to={`/classes?id=${notif.attachment_id}`} onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 hover:bg-warning/20 text-warning rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"><Play size={11} /> View Class <ArrowRight size={11} /></Link>
                    )}
                    {notif.attachment_type === 'file' && notif.attachment_url && (
                        <a href={notif.attachment_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-glass-bg hover:bg-elevated text-text-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"><BookOpen size={11} /> Open File <ArrowRight size={11} /></a>
                    )}
                </div>
                <button onClick={e => { e.stopPropagation(); onDismiss(notif.id); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-elevated text-text-3 hover:text-text-1 transition-colors shrink-0"><X size={13} /></button>
            </div>
        </motion.div>
    );
};

export default function Notifications() {
    const { notifications, markAsRead, markAllAsRead, dismissNotification, loading } = useNotifications();
    const unreadCount = (notifications || []).filter((n: any) => !n.read_status).length;

    useEffect(() => {
        if (unreadCount === 0) return;
        const timer = setTimeout(() => markAllAsRead(), 2000);
        return () => clearTimeout(timer);
    }, []); 

    if (loading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-base text-text-1 pb-28">
            <Header variant="back" title="Notifications" />
            <main className="relative z-10 pt-20 px-5 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Inbox</h1>
                        {unreadCount > 0 && <p className="section-label mt-0.5">{unreadCount} unread</p>}
                    </div>
                    {unreadCount > 0 && <button onClick={markAllAsRead} className="section-label text-accent hover:text-text-1 px-3 py-2 bg-accent/10 hover:bg-accent/20 rounded-xl transition-all">Mark all read</button>}
                </div>
                <AnimatePresence mode="popLayout">
                    {(notifications || []).length > 0 ? (
                        notifications.map((notif: any) => <NotificationItem key={notif.id} notif={notif} onDismiss={dismissNotification} onMarkRead={markAsRead} />)
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-glass-bg border border-glass-border rounded-full flex items-center justify-center mb-5"><CheckCircle2 size={28} className="text-text-3" /></div>
                            <h3 className="text-base font-black italic uppercase tracking-tighter text-text-3 mb-1">All Caught Up</h3>
                            <p className="section-label">No notifications yet</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
