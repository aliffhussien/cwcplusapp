import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import {
    RecipesContext,
    ClassesContext,
    MediaContext,
    NotificationsContext,
    MerchContext,
    SettingsContext
} from './AppContexts';

export {
    RecipesContext,
    ClassesContext,
    MediaContext,
    NotificationsContext,
    MerchContext,
    SettingsContext
};

// â”€â”€â”€ Settings (single subscription, shared via context) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const defaultSettings = {
    heroTitle: "Ready to cook, Chef?",
    siteName: "Cooking With Cattitude Plus",
    maintenanceMode: false,
    bannerEnabled: false,
    bannerText: "New Cooking Class coming soon! ðŸ³",
    youtubeLiveUrl: "",
    tiktokLiveUrl: "",
    classesHeroTitle: "",
    classesHeroDesc: "",
    classesHeroClassId: "",
    classesHeroImageUrl: "",
    currency: 'MYR',
    premiumTiers: [
        { id: 'tier1', name: 'Basic Premium', price: '19.99', discount: 0, benefits: 'Ad-free experience, 10 Recipes/mo' },
        { id: 'tier2', name: 'Plus Member', price: '49.99', discount: 0, benefits: 'All Recipes, Fun Cooking Classes, Priority Support' },
        { id: 'tier3', name: 'Gold Member', price: '99.99', discount: 0, benefits: 'All Access, Live Q&A, VIP Community' }
    ],
    accentColor: '#10B981',
    secondaryAccentColor: '#34D399',
    plugins: { stripe: false, mailchimp: false, zapier: false },
    apiKeys: [],
    volumes: [
        { id: 'v1', name: 'Volume 1', price: '29.99', discount: 0 },
        { id: 'v2', name: 'Volume 2', price: '39.99', discount: 10 },
        { id: 'cwc', name: 'CWC Original', price: '9.99', discount: 0 }
    ]
};

function useSettingsState() {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        let cancelled = false;

        const fetchSettings = async () => {
            const { data, error } = await supabase.from('settings').select('config').eq('id', 'platform').single();
            if (cancelled) return;
            if (error) {
                try {
                    const stored = localStorage.getItem('cwc_settings');
                    const parsed = stored ? JSON.parse(stored) : null;
                    setSettings(parsed && typeof parsed === 'object' ? { ...defaultSettings, ...parsed } : defaultSettings);
                } catch {
                    setSettings(defaultSettings);
                }
                return;
            }
            if (data?.config) setSettings({ ...defaultSettings, ...data.config });
        };

        fetchSettings();
        const ch = supabase.channel('cwc_settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.platform' }, () => {
                if (!cancelled) fetchSettings();
            })
            .subscribe();
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, []);

    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('cwc_settings', JSON.stringify(updated));
        const { error } = await supabase.from('settings').upsert({ id: 'platform', config: updated, updated_at: new Date() });
        if (error) console.error("Error updating settings:", error);
    };

    useEffect(() => {
        if (settings.accentColor) {
            document.documentElement.style.setProperty('--color-accent', settings.accentColor);
        }
        if (settings.secondaryAccentColor) {
            document.documentElement.style.setProperty('--color-accent-sec', settings.secondaryAccentColor);
        }
    }, [settings.accentColor, settings.secondaryAccentColor]);

    return { settings, updateSettings };
}

// â”€â”€â”€ Recipes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useRecipesState(user) {
    const [recipes, setRecipes] = useState(() => {
        try { const s = localStorage.getItem('cwc_recipes'); return s ? JSON.parse(s) : []; } catch { return []; }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const cols = 'id, title, author, time, image, category, difficulty, rating, status, is_featured, tier_required, volume, scheduled_post_date, created_at, cover_image_id, hero_image, hero_image_id, cover:media_library!cover_image_id(*), hero:media_library!hero_image_id(*)';

        const fetch = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('recipes').select(cols).order('created_at', { ascending: false }).limit(200);
            if (cancelled) return;
            if (error) {
                try { 
                    const s = localStorage.getItem('cwc_recipes'); 
                    if (s) setRecipes(JSON.parse(s)); 
                } catch {
                    // Ignore malformed storage
                }
            } else if (data) {
                const merged = data.map(r => ({ ...r, isFeatured: r.is_featured ?? false, tierRequired: r.tier_required ?? 'Free' }));
                setRecipes(merged);
                localStorage.setItem('cwc_recipes', JSON.stringify(merged));
            }
            setIsLoading(false);
        };

        fetch();
        const ch = supabase.channel('cwc_recipes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => { if (!cancelled) fetch(); })
            .subscribe();
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, []);

    const addRecipe = async (newRecipe) => {
        const { data, error } = await supabase.from('recipes').insert([newRecipe]).select();
        if (error) throw error;
        if (data?.[0]) {
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
        if (!r) return false;
        const isAdmin = user?.isGod;
        if (r.status === 'draft' && !isAdmin) return false;
        if (!isAdmin && r.scheduled_post_date && new Date(r.scheduled_post_date) > new Date()) return false;
        return true;
    });

    return { recipes, publicRecipes, isLoading, addRecipe, updateRecipe, deleteRecipe, fetchRecipeContent };
}

// â”€â”€â”€ Classes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useClassesState(user) {
    const [classes, setClasses] = useState(() => {
        try { const s = localStorage.getItem('cwc_classes'); return s ? JSON.parse(s) : []; } catch { return []; }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetch = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false }).limit(200);
            if (cancelled) return;
            if (error) {
                try { 
                    const s = localStorage.getItem('cwc_classes'); 
                    if (s) setClasses(JSON.parse(s)); 
                    else setClasses([]); 
                } catch { 
                    setClasses([]); 
                }
            } else {
                const merged = (data || []).map(c => ({ ...c, isFeatured: c.is_featured ?? false, tierRequired: c.tier_required ?? 'Premium' }));
                setClasses(merged);
                localStorage.setItem('cwc_classes', JSON.stringify(merged));
            }
            setIsLoading(false);
        };

        fetch();
        const ch = supabase.channel('cwc_classes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => { if (!cancelled) fetch(); })
            .subscribe();
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, []);

    const addClass = async (newClass) => {
        // eslint-disable-next-line no-unused-vars
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
        if (!c) return false;
        if (c.status === 'draft') {
            const isAdmin = user?.isGod;
            if (!isAdmin) return false;
        }
        return true;
    });

    return { classes, publicClasses, addClass, updateClass, deleteClass, fetchClassContent, isLoading };
}

// â”€â”€â”€ Media â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useMediaState() {
    const [media, setMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetch = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false }).limit(500);
            if (cancelled) return;
            if (!error && data) setMedia(data);
            setIsLoading(false);
        };

        fetch();
        const ch = supabase.channel('cwc_media')
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
        const sanitized = newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const newSchema = `<script type="application/ld+json">\n{\n  "@context": "https://schema.org/",\n  "@type": "ImageObject",\n  "contentUrl": "https://cwcplus.com/media/${sanitized}.webp",\n  "name": "${newName}",\n  "description": "High quality image of ${newName} on CWC+"\n}\n</script>`;
        
        const { error } = await supabase.from('media_library').update({ 
            filename: newName,
            seo_schema: newSchema
        }).eq('id', id);
        
        if (error) throw error;
        setMedia(prev => prev.map(m => m.id === id ? { ...m, filename: newName, seo_schema: newSchema } : m));
    };

    const togglePrimary = async (id) => {
        const item = media.find(m => m.id === id);
        if (!item) return;

        const nextState = !item.is_primary;

        // If setting to primary and it has a content_id, unset other primaries for that content
        if (nextState && item.content_id) {
            await supabase.from('media_library')
                .update({ is_primary: false })
                .eq('content_id', item.content_id)
                .eq('content_type', item.content_type);
        }

        const { error } = await supabase.from('media_library').update({ is_primary: nextState }).eq('id', id);
        if (error) throw error;
        
        setMedia(prev => prev.map(m => {
            if (m.id === id) return { ...m, is_primary: nextState };
            if (nextState && m.content_id === item.content_id && m.content_type === item.content_type) {
                return { ...m, is_primary: false };
            }
            return m;
        }));
    };

    return { media, isLoading, fetchMedia, addMedia, deleteMedia, updateMediaName, togglePrimary };
}

// â”€â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useNotificationsState(session) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStored = useCallback((key) => {
        if (!session?.user?.id) return [];
        try { 
            const v = JSON.parse(localStorage.getItem(`${key}_${session.user.id}`)); 
            return Array.isArray(v) ? v : []; 
        } catch { 
            return []; 
        }
    }, [session]);

    const fetchNotifications = useCallback(async () => {
        if (!session) return;
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .or(`user_id.eq.${session.user.id},user_id.is.null`)
                .or(`scheduled_post_date.is.null,scheduled_post_date.lte.${new Date().toISOString()}`)
                .order('created_at', { ascending: false });
            if (error) {
                console.error("Error fetching notifications:", error);
                setLoading(false);
                return;
            }
            const dismissed = getStored('dismissed_notifs');
            const readIds = getStored('read_notifs');
            setNotifications((data || []).filter(n => !dismissed.includes(n.id)).map(n => ({ ...n, read_status: n.read_status || readIds.includes(n.id) })));
            setLoading(false);
        } catch (e) {
            console.error('Error fetching notifications:', e.message);
            setLoading(false);
        }
    }, [session, getStored]);

    useEffect(() => {
        let cancelled = false;
        
        // Fix: Use separate effect or check to avoid direct setState in render path
        if (!session) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        fetchNotifications();
        const ch = supabase.channel('cwc_notifications')
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
            try { await supabase.from('notifications').update({ read_status: true }).eq(id); } catch { /* Ignore */ }
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
            try { await supabase.from('notifications').update({ read_status: true }).in('id', unread); } catch { /* Ignore */ }
        }
    };

    const pushNotification = async (notification) => {
        const { error } = await supabase.from('notifications').insert([{ ...notification, read_status: false }]);
        if (error) throw error;
    };

    return { notifications, loading, dismissNotification, markAsRead, markAllAsRead, pushNotification, refresh: fetchNotifications };
}

// â”€â”€â”€ Merch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                try { 
                    const s = localStorage.getItem('cwc_merch'); 
                    if (s) setMerch(JSON.parse(s)); 
                } catch {
                    // Ignore
                }
            } else {
                setMerch(data || []);
                if (data?.length) localStorage.setItem('cwc_merch', JSON.stringify(data));
            }
        };

        fetch();
        const ch = supabase.channel('cwc_merch')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'merch' }, () => { if (!cancelled) fetch(); })
            .subscribe();
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, []);

    const addProduct = async (product) => {
        // eslint-disable-next-line no-unused-vars
        const { id, ...payload } = product;
        const { data, error } = await supabase.from('merch').insert([payload]).select();
        if (error) {
            console.error("Error adding merch:", error);
            return;
        }
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
        const isAdmin = user?.isGod;
        if (!isAdmin && m.scheduled_post_date && new Date(m.scheduled_post_date) > new Date()) return false;
        return true;
    });

    return { merch, publicMerch, addProduct, updateProduct, deleteProduct };
}

// â”€â”€â”€ Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function AppDataProvider({ children }) {
    const { user, session } = useUser();

    const settingsData    = useSettingsState();
    const recipes         = useRecipesState(user);
    const classes         = useClassesState(user);
    const media           = useMediaState();
    const notifications   = useNotificationsState(session);
    const merch           = useMerchState(user);

    return (
        <SettingsContext.Provider value={settingsData}>
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
        </SettingsContext.Provider>
    );
}

