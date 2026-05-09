import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const defaultUser = {
    id: null,
    email: null,
    name: "Chef",
    subscriptionTier: "Free",
    role: "user",
    unlockedVolumes: [],
    unlockedClasses: [],
    avatarUrl: null,
    coverUrl: null,
    dietaryPreferences: [],
    favoriteFood: null
};

export function useUser() {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('cwc_user');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        return defaultUser;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                loadLocalUser();
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                loadLocalUser();
            }
        });

        // Listen for cross-component user updates
        const handleUserUpdate = () => {
            const stored = localStorage.getItem('cwc_user');
            if (stored) {
                try {
                    setUser(JSON.parse(stored));
                } catch(e) {}
            }
        };
        window.addEventListener('cwc_user_updated', handleUserUpdate);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('cwc_user_updated', handleUserUpdate);
        };
    }, []);

    const fetchUserProfile = async (authUser) => {
        const { data, error } = await supabase.from('people').select('*').eq('id', authUser.id).single();
        if (data) {
            const profile = {
                id: authUser.id,
                email: authUser.email,
                name: data.name || authUser.email?.split('@')[0] || 'Chef',
                subscriptionTier: data.subscription_tier || "Free",
                role: authUser.email === 'ononeline30@gmail.com' ? 'admin' : (data.role || "user"),
                isGod: authUser.email === 'ononeline30@gmail.com',
                unlockedVolumes: data.unlocked_volumes || [],
                unlockedClasses: data.unlocked_classes || [],
                avatarUrl: data.avatar_url || authUser.user_metadata?.avatar_url || null,
                coverUrl: data.cover_url || null,
                dietaryPreferences: data.dietary_preferences || [],
                favoriteFood: data.favorite_food || null,
                pushSubscription: data.push_subscription || null,
            };
            setUser(profile);
            localStorage.setItem('cwc_user', JSON.stringify(profile));
        } else {
            // Trigger should have already created the row; try an upsert as fallback
            const newProfile = {
                id: authUser.id,
                email: authUser.email,
                name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Chef',
                avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
                subscription_tier: 'Free',
                role: 'user',
            };
            await supabase.from('people').upsert([newProfile], { onConflict: 'id' });
            const finalProfile = {
                ...defaultUser,
                id: authUser.id,
                email: authUser.email,
                name: newProfile.name,
                role: authUser.email === 'ononeline30@gmail.com' ? 'admin' : 'user',
                isGod: authUser.email === 'ononeline30@gmail.com',
                avatarUrl: newProfile.avatar_url,
                dietaryPreferences: [],
                favoriteFood: null,
            };
            setUser(finalProfile);
            localStorage.setItem('cwc_user', JSON.stringify(finalProfile));
        }
        setLoading(false);
    };

    const loadLocalUser = () => {
        const stored = localStorage.getItem('cwc_user');
        if (stored) {
            try { 
                const parsed = JSON.parse(stored);
                // If id is null, they are a guest. Don't trust local storage as it may have the old 'admin' bug.
                if (!parsed.id) {
                    setUser(defaultUser);
                } else {
                    setUser({ 
                        ...defaultUser, 
                        ...parsed,
                        unlockedVolumes: Array.isArray(parsed.unlockedVolumes) ? parsed.unlockedVolumes : [],
                        unlockedClasses: Array.isArray(parsed.unlockedClasses) ? parsed.unlockedClasses : [],
                        dietaryPreferences: Array.isArray(parsed.dietaryPreferences) ? parsed.dietaryPreferences : []
                    }); 
                }
            }
            catch (e) { setUser(defaultUser); }
        } else {
            setUser(defaultUser);
        }
        setLoading(false);
    };

    const updateUser = async (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('cwc_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('cwc_user_updated'));
        
        if (session?.user) {
            // sync to supabase
            const dbUpdates = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.subscriptionTier !== undefined) dbUpdates.subscription_tier = updates.subscriptionTier;
            if (updates.unlockedVolumes !== undefined) dbUpdates.unlocked_volumes = updates.unlockedVolumes;
            if (updates.unlockedClasses !== undefined) dbUpdates.unlocked_classes = updates.unlockedClasses;
            if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
            if (updates.coverUrl !== undefined) dbUpdates.cover_url = updates.coverUrl;
            if (updates.dietaryPreferences !== undefined) dbUpdates.dietary_preferences = updates.dietaryPreferences;
            if (updates.favoriteFood !== undefined) dbUpdates.favorite_food = updates.favoriteFood;
            if (updates.pushSubscription !== undefined) dbUpdates.push_subscription = updates.pushSubscription;
            
            if (Object.keys(dbUpdates).length > 0) {
                await supabase.from('people').update(dbUpdates).eq('id', session.user.id);
            }
        }
    };

    const unlockVolume = (volumeName) => {
        if (!user.unlockedVolumes.includes(volumeName)) {
            updateUser({ unlockedVolumes: [...user.unlockedVolumes, volumeName] });
        }
    };

    const unlockClass = (classId) => {
        if (!user.unlockedClasses.includes(classId)) {
            updateUser({ unlockedClasses: [...user.unlockedClasses, classId] });
        }
    };

    const hasAccessToRecipe = (recipe) => {
        const volume = recipe?.volume || 'Free';
        if (volume === 'Free') return true;
        if (['admin', 'management', 'employee'].includes(user?.role)) return true;
        if (user.subscriptionTier === 'Premium') return true;
        
        return user.unlockedVolumes?.includes(volume);
    };

    const hasAccessToClass = (cls) => {
        const tier = cls?.tierRequired || 'Free';
        if (tier === 'Free') return true;
        if (['admin', 'management', 'employee'].includes(user?.role)) return true;
        if (user.subscriptionTier === 'Premium') return true;
        if (user.subscriptionTier === tier) return true;

        return user.unlockedClasses?.includes(cls.id);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(defaultUser);
        localStorage.removeItem('cwc_user');
    };

    return { session, user, loading, updateUser, unlockVolume, unlockClass, hasAccessToRecipe, hasAccessToClass, signOut, isGod: user?.isGod };
}
