import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';

// ─── Contexts ───────────────────────────────────────────────────────────────
export const RecipesContext      = createContext(null);
export const ClassesContext      = createContext(null);
export const MediaContext        = createContext(null);
export const NotificationsContext = createContext(null);
export const MerchContext        = createContext(null);

// ─── Recipes ─────────────────────────────────────────────────────────────────
function useRecipesState(user) {
    const [recipes, setRecipes] = useState(() => {
        try { const s = localStorage.getItem('cwc_recipes'); return s ? JSON.parse(s) : []; } catch { return []; }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const cols = 'id, title, author, time, image, category, difficulty, rating, status, is_featured, tier_required, volume, scheduled_post_date, created_at, cover_image_id, hero_image, hero_image_id';

        const fetch = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('recipes').select(cols).order('created_at', { ascending: false });
            if (cancelled) return;
            if (error) {
                try { const s = localStorage.getItem('cwc_recipes'); if (s) setRecipes(JSON.parse(s)); } catch {}
            } else if (data) {
                const merged = data.map(r => ({ ...r, isFeatured: r.is_featured ?? false, tierRequired: r.tier_required ?? 'Free' }));
                setRecipes(merged);
                localStorage.setItem('cwc_recipes', JSON.stringify(merged));
            }
            setIsLoading(false);
        };

        fetch();
        const ch = supabase.channel('recipes_' + Math.random().toString(36).slice(2))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => { if (!cancelled) fetch(); })
            .subscribe();
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, []);

    const addRecipe = async (newRecipe) => {
        const { data, error } = await supabase.from('recipes').insert([newRecipe]).select();
        if (error) throw error;
        if (data) {
            setRecipes(prev => {
                const u = [{ ...data[0], isFeatured: data[0].is_featured, tierRequired: data[0].tier_required }, ...prev.filter(r => r.id !== data[0].id)];
                localStorage.setItem('cwc_recipes', JSON.stringify(u));
                return u;
            });
            return data[0];
        }
    };

    const updateRecipe = async (id, updates) => {
        const { error } = await supabase.from('recipes').update(updates).eq('id', id);
        if (error) throw error;
        setRecipes(prev => {
            const u = prev.map(r => r.id === id ? { ...r, ...updates, isFeatured: updates.is_featured ?? r.isFeatured, tierRequired: updates.tier_required ?? r.tierRequired } : r);
            localStorage.setItem('cwc_recipes', JSON.stringify(u));
            return u;
        });
    };

    const deleteRecipe = async (id) => {
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) console.error('Error deleting recipe:', error);
        setRecipes(prev => { const u = prev.filter(r => r.id !== id); localStorage.setItem('cwc_recipes', JSON.stringify(u)); return u; });
    };

    const fetchRecipeContent = useCallback(async (id) => {
        const { data, error } = await supabase.rpc('get_recipe_content', { p_id: Number(id) });
        if (error) { console.error('Error fetching recipe content:', error); return null; }
        return data?.[0] ?? null;
    }, []);

    const publicRecipes = (Array.isArray(recipes) ? recipes : []).filter(r => {
        if (!r || r.status === 'draft') return false;
        const isAdmin = ['admin', 'management', 'employee'].includes(user?.role);
        if (!isAdmin && r.scheduled_post_date && new Date(r.scheduled_post_date) > new Date()) return false;
        return true;
    });

    return { recipes, publicRecipes, isLoading, addRecipe, updateRecipe, deleteRecipe, fetchRecipeContent };
}

// ─── Classes ─────────────────────────────────────────────────────────────────
function useClassesState(user) {
    const [classes, setClasses] = useState(() => {
        try { const s = localStorage.getItem('cwc_classes'); return s ? JSON.parse(s) : []; } catch { return []; }
    });

    useEffect(() => {
        let cancelled = false;
        // live_link intentionally excluded — it's gated behind get_class_content RPC (tier-checked)
        const cols = 'id, title, instructor, duration, price, image, status, tier_required, is_featured, created_at, category, live_duration_hours, thumbnail_image_id, hero_image, hero_image_id, scheduled_post_date, live_date';

        const fetch = async () => {
            const { data, error } = await supabase.from('classes').select(cols).order('created_at', { ascending: false });
            if (cancelled) return;
            if (error) {
                try { const s = localStorage.getItem('cwc_classes'); if (s) setClasses(JSON.parse(s)); else setClasses([]); } catch { setClasses([]); }
            } else {
                const merged = (data || []).map(c => ({ ...c, isFeatured: c.is_featured ?? false, tierRequired: c.tier_required ?? 'Premium' }));
                setClasses(merged);
                localStorage.setItem('cwc_classes', JSON.stringify(merged));
            }
        };

        fetch();
        const ch = supabase.channel('classes_' + Math.random().toString(36).slice(2))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => { if (!cancelled) fetch(); })
            .subscribe();
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, []);

    const addClass = async (newClass) => {
        const { id, ...payload } = newClass;
        const { data, error } = await supabase.from('classes').insert([payload]).select();
        if (error) throw error;
        if (data?.[0]) {
            setClasses(prev => {
                const u = [{ ...data[0], isFeatured: data[0].is_featured, tierRequired: data[0].tier_required }, ...prev];
                localStorage.setItem('cwc_classes', JSON.stringify(u));
                return u;
            });
            return data[0];
        }
    };

    const updateClass = async (id, updates) => {
        const { error } = await supabase.from('classes').update(updates).eq('id', id);
        if (error) throw error;
        setClasses(prev => {
            const u = prev.map(c => c.id === id ? { ...c, ...updates, isFeatured: updates.is_featured ?? c.isFeatured, tierRequired: updates.tier_required ?? c.tierRequired } : c);
            localStorage.setItem('cwc_classes', JSON.stringify(u));
            return u;
        });
    };

    const deleteClass = async (id) => {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) console.error('Error deleting class:', error);
        setClasses(prev => { const u = prev.filter(c => c.id !== id); localStorage.setItem('cwc_classes', JSON.stringify(u)); return u; });
    };

    const fetchClassContent = useCallback(async (id) => {
        const { data, error } = await supabase.rpc('get_class_content', { p_id: Number(id) });
        if (error) { console.error('Error fetching class content:', error); return null; }
        return data?.[0] ?? null;
    }, []);

    const publicClasses = (Array.isArray(classes) ? classes : []).filter(c => {
        if (!c || c.status === 'draft') return false;
        const isAdmin = ['admin', 'management', 'employee'].includes(user?.role);
        if (!isAdmin && c.scheduled_post_date && new Date(c.scheduled_post_date) > new Date()) return false;
        return true;
    });

    return { classes, publicClasses, addClass, updateClass, deleteClass, fetchClassContent };
}

// ─── Media ───────────────────────────────────────────────────────────────────
function useMediaState() {
    const [media, setMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetch = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
            if (cancelled) return;
            if (!error && data) setMedia(data);
            setIsLoading(false);
        };

        fetch();
        const ch = supabase.channel('media_' + Math.random().toString(36).slice(2))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'media_library' }, () => { if (!cancelled) fetch(); })
            .subscribe();
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, []);

    const fetchMedia = useCallback(async () => {
        const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
        if (!error && data) setMedia(data);
    }, []);

    const addMedia = async (mediaData) => {
        const { data, error } = await supabase.from('media_library').insert([mediaData]).select();
        if (error) throw error;
        return data[0];
    };

    const deleteMedia = async (id) => {
        const { error } = await supabase.from('media_library').delete().eq('id', id);
        if (error) throw error;
        setMedia(prev => prev.filter(m => m.id !== id));
    };

    const updateMediaName = async (id, newName) => {
        const { error } = await supabase.from('media_library').update({ filename: newName }).eq('id', id);
        if (error) throw error;
        setMedia(prev => prev.map(m => m.id === id ? { ...m, filename: newName } : m));
    };

    return { media, isLoading, fetchMedia, addMedia, deleteMedia, updateMediaName };
}

// ─── Notifications ───────────────────────────────────────────────────────────
function useNotificationsState(session) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStored = (key) => {
        if (!session?.user?.id) return [];
        try { const v = JSON.parse(localStorage.getItem(`${key}_${session.user.id}`)); return Array.isArray(v) ? v : []; } catch { return []; }
    };

    const fetchNotifications = useCallback(async () => {
        if (!session) return;
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .or(`user_id.eq.${session.user.id},user_id.is.null`)
                .or(`scheduled_post_date.is.null,scheduled_post_date.lte.${new Date().toISOString()}`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            const dismissed = getStored('dismissed_notifs');
            const readIds = getStored('read_notifs');
            setNotifications((data || []).filter(n => !dismissed.includes(n.id)).map(n => ({ ...n, read_status: n.read_status || readIds.includes(n.id) })));
        } catch (e) {
            console.error('Error fetching notifications:', e.message);
        } finally {
            setLoading(false);
        }
    }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        let cancelled = false;
        if (!session) { setNotifications([]); setLoading(false); return; }

        fetchNotifications();
        const ch = supabase.channel('notifs_' + Math.random().toString(36).slice(2))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => { if (!cancelled) fetchNotifications(); })
            .subscribe();
        window.addEventListener('notifications_updated', fetchNotifications);
        return () => {
            cancelled = true;
            supabase.removeChannel(ch);
            window.removeEventListener('notifications_updated', fetchNotifications);
        };
    }, [session, fetchNotifications]);

    const sync = () => window.dispatchEvent(new Event('notifications_updated'));

    const dismissNotification = (id) => {
        if (!session?.user?.id) return;
        const updated = [...getStored('dismissed_notifs'), id];
        localStorage.setItem(`dismissed_notifs_${session.user.id}`, JSON.stringify(updated));
        setNotifications(prev => prev.filter(n => n.id !== id));
        sync();
    };

    const markAsRead = async (id) => {
        if (!session?.user?.id) return;
        const updated = [...getStored('read_notifs'), id];
        localStorage.setItem(`read_notifs_${session.user.id}`, JSON.stringify(updated));
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n));
        sync();
        const target = notifications.find(n => n.id === id);
        if (target?.user_id) {
            try { await supabase.from('notifications').update({ read_status: true }).eq('id', id); } catch {}
        }
    };

    const markAllAsRead = async () => {
        if (!session?.user?.id) return;
        const allIds = notifications.map(n => n.id);
        localStorage.setItem(`read_notifs_${session.user.id}`, JSON.stringify([...new Set([...getStored('read_notifs'), ...allIds])]));
        setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
        sync();
        const unread = notifications.filter(n => !n.read_status && n.user_id === session.user.id).map(n => n.id);
        if (unread.length > 0) {
            try { await supabase.from('notifications').update({ read_status: true }).in('id', unread); } catch {}
        }
    };

    const pushNotification = async (notification) => {
        const { error } = await supabase.from('notifications').insert([{ ...notification, read_status: false }]);
        if (error) throw error;
    };

    return { notifications, loading, dismissNotification, markAsRead, markAllAsRead, pushNotification, refresh: fetchNotifications };
}

// ─── Merch ───────────────────────────────────────────────────────────────────
function useMerchState(user) {
    const [merch, setMerch] = useState(() => {
        try { const s = localStorage.getItem('cwc_merch'); return s ? JSON.parse(s) : []; } catch { return []; }
    });

    useEffect(() => {
        let cancelled = false;

        const fetch = async () => {
            const { data, error } = await supabase.from('merch').select('*').order('created_at', { ascending: false });
            if (cancelled) return;
            if (error) {
                try { const s = localStorage.getItem('cwc_merch'); if (s) setMerch(JSON.parse(s)); } catch {}
            } else {
                setMerch(data || []);
                if (data?.length) localStorage.setItem('cwc_merch', JSON.stringify(data));
            }
        };

        fetch();
        const ch = supabase.channel('merch_' + Math.random().toString(36).slice(2))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'merch' }, () => { if (!cancelled) fetch(); })
            .subscribe();
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, []);

    const addProduct = async (product) => {
        const { id, ...payload } = product;
        const { data, error } = await supabase.from('merch').insert([payload]).select();
        if (error) { console.error('Error adding merch:', error); return; }
        if (data?.[0]) setMerch(prev => { const u = [data[0], ...prev]; localStorage.setItem('cwc_merch', JSON.stringify(u)); return u; });
    };

    const updateProduct = async (id, updates) => {
        const { error } = await supabase.from('merch').update(updates).eq('id', id);
        if (error) console.error('Error updating merch:', error);
        setMerch(prev => { const u = prev.map(m => m.id === id ? { ...m, ...updates } : m); localStorage.setItem('cwc_merch', JSON.stringify(u)); return u; });
    };

    const deleteProduct = async (id) => {
        const { error } = await supabase.from('merch').delete().eq('id', id);
        if (error) console.error('Error deleting merch:', error);
        setMerch(prev => { const u = prev.filter(m => m.id !== id); localStorage.setItem('cwc_merch', JSON.stringify(u)); return u; });
    };

    const publicMerch = merch.filter(m => {
        if (m.status === 'draft') return false;
        const isAdmin = ['admin', 'management', 'employee'].includes(user?.role);
        if (!isAdmin && m.scheduled_post_date && new Date(m.scheduled_post_date) > new Date()) return false;
        return true;
    });

    return { merch, publicMerch, addProduct, updateProduct, deleteProduct };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppDataProvider({ children }) {
    const { user, session } = useUser();

    const recipes      = useRecipesState(user);
    const classes      = useClassesState(user);
    const media        = useMediaState();
    const notifications = useNotificationsState(session);
    const merch        = useMerchState(user);

    return (
        <RecipesContext.Provider value={recipes}>
        <ClassesContext.Provider value={classes}>
        <MediaContext.Provider value={media}>
        <NotificationsContext.Provider value={notifications}>
        <MerchContext.Provider value={merch}>
            {children}
        </MerchContext.Provider>
        </NotificationsContext.Provider>
        </MediaContext.Provider>
        </ClassesContext.Provider>
        </RecipesContext.Provider>
    );
}
