import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './useUser';

export function useNotifications() {
    const { session } = useUser();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStoredArray = (key) => {
        if (!session?.user?.id) return [];
        try { 
            const val = JSON.parse(localStorage.getItem(`${key}_${session.user.id}`));
            return Array.isArray(val) ? val : []; 
        } catch(e){ return []; }
    };

    const triggerSync = () => {
        window.dispatchEvent(new Event('notifications_updated'));
    };

    useEffect(() => {
        let subscription;
        if (session) {
            fetchNotifications();

            const channelName = `public:notifications:${Math.random().toString(36).substring(7)}`;
            subscription = supabase
                .channel(channelName)
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'notifications'
                 }, payload => {
                    fetchNotifications();
                })
                .subscribe();

            window.addEventListener('notifications_updated', fetchNotifications);
        } else {
            setNotifications([]);
            setLoading(false);
        }

        return () => {
            if (subscription) supabase.removeChannel(subscription);
            window.removeEventListener('notifications_updated', fetchNotifications);
        };
    }, [session]);

    const fetchNotifications = async () => {
        if (!session) return;
        try {
            // Fetch user specific and global notifications
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .or(`user_id.eq.${session.user.id},user_id.is.null`)
                .or(`scheduled_post_date.is.null,scheduled_post_date.lte.${new Date().toISOString()}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const dismissed = getStoredArray('dismissed_notifs');
            const readIds = getStoredArray('read_notifs');
            
            const visibleNotifs = (data || []).filter(n => !dismissed.includes(n.id)).map(n => ({
                ...n,
                read_status: n.read_status || readIds.includes(n.id)
            }));
            
            setNotifications(visibleNotifs);
        } catch (error) {
            console.error('Error fetching notifications:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const dismissNotification = (id) => {
        if (!session?.user?.id) return;
        const newDismissed = [...getStoredArray('dismissed_notifs'), id];
        localStorage.setItem(`dismissed_notifs_${session.user.id}`, JSON.stringify(newDismissed));
        setNotifications(prev => prev.filter(n => n.id !== id));
        triggerSync();
    };

    const markAsRead = async (id) => {
        if (!session?.user?.id) return;
        const newRead = [...getStoredArray('read_notifs'), id];
        localStorage.setItem(`read_notifs_${session.user.id}`, JSON.stringify(newRead));
        
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n));
        triggerSync();
        
        const target = notifications.find(n => n.id === id);
        if (target && target.user_id) {
            try { await supabase.from('notifications').update({ read_status: true }).eq('id', id); } catch (e) {}
        }
    };

    const markAllAsRead = async () => {
        if (!session?.user?.id) return;
        const allIds = notifications.map(n => n.id);
        const newRead = [...new Set([...getStoredArray('read_notifs'), ...allIds])];
        localStorage.setItem(`read_notifs_${session.user.id}`, JSON.stringify(newRead));
        
        setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
        triggerSync();
        
        const unreadPersonalIds = notifications.filter(n => !n.read_status && n.user_id === session.user.id).map(n => n.id);
        if (unreadPersonalIds.length > 0) {
            try { await supabase.from('notifications').update({ read_status: true }).in('id', unreadPersonalIds); } catch (e) {}
        }
    };

    const pushNotification = async (notification) => {
        try {
            const { error } = await supabase.from('notifications').insert([{
                ...notification,
                read_status: false
            }]);
            if (error) throw error;
        } catch (error) {
            console.error('Error pushing notification:', error.message);
            throw error;
        }
    };

    return {
        notifications,
        loading,
        dismissNotification,
        markAsRead,
        markAllAsRead,
        pushNotification,
        refresh: fetchNotifications
    };
}
