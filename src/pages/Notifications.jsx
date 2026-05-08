import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChefHat, ShoppingBag, Star, Info, CheckCircle2, X, Play, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAppSettings } from '../hooks/useAppSettings';
import { useNotifications } from '../hooks/useNotifications';

const AnimatedBackground = ({ settings }) => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#070B14]">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px]" style={{ backgroundColor: settings?.accentColor || '#f43f5e' }} />
    </div>
);

const NotificationItem = ({ notif, onDismiss }) => {
    const icons = {
        alert: <Bell size={20} className="text-rose-400" />,
        class: <Star size={20} className="text-amber-400" />,
        shop: <ShoppingBag size={20} className="text-emerald-400" />,
        system: <Info size={20} className="text-indigo-400" />,
        success: <CheckCircle2 size={20} className="text-emerald-400" />
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
                if (info.offset.x > 100 || info.offset.x < -100) {
                    onDismiss(notif.id);
                }
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            whileDrag={{ scale: 1.02 }}
            className={`p-5 card-3d-base rounded-[24px] mb-4 relative overflow-hidden group border ${notif.read_status ? 'border-white/5 opacity-70' : 'border-white/20 bg-white/5'}`}
        >
            {!notif.read_status && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
            
            <div className="flex gap-4 items-start">
                <div className="p-3 bg-black/40 rounded-full border border-white/10 shrink-0">
                    {icons[notif.type] || icons.system}
                </div>
                <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-base font-bold ${notif.read_status ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h4>
                        <span className="text-xs text-slate-500 font-medium">{timeAgo(notif.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{notif.message}</p>
                    
                    {notif.attachment_type === 'recipe' && notif.attachment_id && (
                        <Link to={`/recipe/${notif.attachment_id}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold transition-colors">
                            <ChefHat size={14} /> View Recipe <ArrowRight size={14} />
                        </Link>
                    )}
                    {notif.attachment_type === 'class' && notif.attachment_id && (
                        <Link to={`/classes`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition-colors">
                            <Play size={14} /> View Class <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
                <button onClick={() => onDismiss(notif.id)} className="p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>
        </motion.div>
    );
};

export default function Notifications() {
    const { settings } = useAppSettings();
    const { notifications, markAsRead, markAllAsRead, dismissNotification, loading } = useNotifications();

    const handleDismiss = (id) => {
        dismissNotification(id);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-32">
            <AnimatedBackground settings={settings} />
            <Header variant="back" title="Notifications" />

            <main className="relative z-10 pt-24 px-4 md:px-10 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Bell className="text-indigo-400" /> Notifications
                    </h1>
                    {notifications?.some(n => !n.read_status) && (
                        <button onClick={markAllAsRead} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-4 py-2 rounded-full">
                            Mark all as read
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {notifications?.length > 0 ? (
                        notifications.map(notif => (
                            <NotificationItem key={notif.id} notif={notif} onDismiss={handleDismiss} />
                        ))
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/5 border border-white/10 rounded-[32px]">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell size={32} className="text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
                            <p className="text-sm text-slate-400">You have no new notifications right now.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
