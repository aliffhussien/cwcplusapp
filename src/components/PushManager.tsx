import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { triggerHaptic } from './PerformanceUI';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushManager() {
    const { user, updateUser } = useUser();
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<string>('default');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(() => setPermission(Notification.permission));
            });
        }
    }, []);

    const subscribeUser = async () => {
        triggerHaptic('medium');
        setIsSubscribing(true);
        setError(null);
        try {
            if (!VAPID_PUBLIC_KEY) throw new Error('Push notifications are not configured.');
            const res = await Notification.requestPermission();
            setPermission(res);
            if (res !== 'granted') throw new Error('Permission not granted for notifications');

            const registration = await navigator.serviceWorker.ready;
            const existingSub = await registration.pushManager.getSubscription();
            if (existingSub) await existingSub.unsubscribe();

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const { error: subError } = await supabase.from('people').update({ push_subscription: subscription }).eq('id', user?.id);
            if (subError) throw subError;
            if (updateUser) updateUser({ pushSubscription: subscription });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubscribing(false);
        }
    };

    const unsubscribeUser = async () => {
        triggerHaptic('light');
        setIsSubscribing(true);
        setError(null);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) await subscription.unsubscribe();

            const { error: subError } = await supabase.from('people').update({ push_subscription: null }).eq('id', user?.id);
            if (subError) throw subError;
            if (updateUser) updateUser({ pushSubscription: null });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubscribing(false);
        }
    };

    if (!isSupported) return null;

    const isSubscribed = (permission === 'granted') && (user?.pushSubscription);
    const isBlocked = permission === 'denied';

    return (
        <div className="p-6 bg-glass-bg border border-glass-border rounded-[32px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-premium/5 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.div 
                            animate={{ scale: isSubscribed ? [1, 1.2, 1] : 1, rotate: isSubscribed ? [0, 10, -10, 0] : 0 }}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isSubscribed ? 'bg-success/20 text-success' : 'bg-elevated text-text-3'}`}
                        >
                            {isSubscribed ? <Bell size={24} /> : <BellOff size={24} />}
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-black text-text-1 leading-tight uppercase tracking-tighter">Push Alerts</h3>
                            <span className="section-label flex items-center gap-1.5 mt-1">
                                {isSubscribed ? <><span className="inline-block w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Channel Active</> : <><span className="inline-block w-1.5 h-1.5 bg-text-3 rounded-full" /> Inactive</>}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => isSubscribed ? unsubscribeUser() : subscribeUser()}
                        disabled={isSubscribing || isBlocked}
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center px-1 ${isSubscribed ? 'bg-accent' : 'bg-elevated'} ${isBlocked ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                        <motion.div 
                            layout
                            className="w-6 h-6 rounded-full bg-text-1 shadow-xl flex items-center justify-center"
                            animate={{ x: isSubscribed ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            {isSubscribing && <Loader2 size={12} className="text-accent animate-spin" />}
                        </motion.div>
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-xs text-text-3 leading-relaxed font-medium">
                        {isBlocked ? "Notifications are blocked by your browser settings. Please enable them to receive real-time culinary updates." : isSubscribed ? "You're linked to the CWC+ Command Center. You'll receive real-time alerts for new cooking classes and drops." : "Enable native push notifications to never miss a cooking class or secret recipe drop. Works even when the app is closed."}
                    </p>

                    {error && (
                        <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-2">
                            <ShieldAlert size={14} className="text-danger" />
                            <p className="text-[10px] font-bold text-danger uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    {isSubscribed && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-success/5 rounded-xl border border-success/10">
                            <ShieldCheck size={14} className="text-success" />
                            <span className="section-label text-success">Device Verification Sync Complete</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
