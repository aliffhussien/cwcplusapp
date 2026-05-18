import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, Recipe, CookingClass } from '../types';

const PRIVILEGED_ROLES = ['admin', 'management', 'employee'];

const defaultUser: UserProfile = {
    id: null,
    email: null,
    name: "Chef",
    subscriptionTier: "Free",
    role: "user",
    isGod: false,
    unlockedVolumes: [],
    unlockedClasses: [],
    avatarUrl: null,
    coverUrl: null,
    dietaryPreferences: [],
    favoriteFood: null
};

const STRIP_FROM_STORAGE = ['isGod'];

function toStorage(profile: UserProfile): any {
    const copy = { ...profile } as any;
    STRIP_FROM_STORAGE.forEach(k => delete copy[k]);
    return copy;
}

export function useUser() {
    const [session, setSession] = useState<any>(null);
    const [user, setUser] = useState<UserProfile>(() => {
        const stored = localStorage.getItem('cwc_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return { ...defaultUser, ...parsed, isGod: false };
            } catch { /* empty */ }
        }
        return defaultUser;
    });
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (authUser: any) => {
        const { data } = await supabase.from('people').select('*').eq('id', authUser.id).single();
        if (data) {
            const role = data.role || 'user';
            const profile: UserProfile = {
                id: authUser.id,
                email: authUser.email,
                name: data.name || authUser.email?.split('@')[0] || 'Chef',
                subscriptionTier: data.subscription_tier || 'Free',
                role,
                isGod: PRIVILEGED_ROLES.includes(role),
                unlockedVolumes: data.unlocked_volumes || [],
                unlockedClasses: data.unlocked_classes || [],
                avatarUrl: data.avatar_url || authUser.user_metadata?.avatar_url || null,
                coverUrl: data.cover_url || null,
                dietaryPreferences: data.dietary_preferences || [],
                favoriteFood: data.favorite_food || null,
                pushSubscription: data.push_subscription || null,
            };
            setUser(profile);
            localStorage.setItem('cwc_user', JSON.stringify(toStorage(profile)));
        } else {
            const newProfile = {
                id: authUser.id,
                email: authUser.email,
                name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Chef',
                avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
                subscription_tier: 'Free',
                role: 'user',
            };
            await supabase.from('people').upsert([newProfile], { onConflict: 'id' });
            const finalProfile: UserProfile = {
                ...defaultUser,
                id: authUser.id,
                email: authUser.email,
                name: newProfile.name,
                role: 'user',
                isGod: false,
                avatarUrl: newProfile.avatar_url,
            };
            setUser(finalProfile);
            localStorage.setItem('cwc_user', JSON.stringify(toStorage(finalProfile)));
        }
        setLoading(false);
    };

    const loadLocalUser = () => {
        const stored = localStorage.getItem('cwc_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (!parsed.id) {
                    setUser(defaultUser);
                } else {
                    setUser({
                        ...defaultUser,
                        ...parsed,
                        isGod: false,
                        unlockedVolumes: Array.isArray(parsed.unlockedVolumes) ? parsed.unlockedVolumes : [],
                        unlockedClasses: Array.isArray(parsed.unlockedClasses) ? parsed.unlockedClasses : [],
                        dietaryPreferences: Array.isArray(parsed.dietaryPreferences) ? parsed.dietaryPreferences : []
                    });
                }
            } catch { setUser(defaultUser); }
        } else { setUser(defaultUser); }
        setLoading(false);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) fetchUserProfile(session.user);
            else loadLocalUser();
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) fetchUserProfile(session.user);
            else loadLocalUser();
        });

        const handleUserUpdate = () => {
            const stored = localStorage.getItem('cwc_user');
            if (stored) {
                try { setUser({ ...JSON.parse(stored), isGod: false }); } 
                catch { /* empty */ }
            }
        };
        window.addEventListener('cwc_user_updated', handleUserUpdate);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('cwc_user_updated', handleUserUpdate);
        };
    }, []);

    const updateUser = async (updates: Partial<UserProfile>) => {
        const safeUpdates = { ...updates };
        delete safeUpdates.isGod;
        if (!user.isGod && safeUpdates.role && ['admin', 'management'].includes(safeUpdates.role)) {
            delete safeUpdates.role;
        }

        const updatedUser = { ...user, ...safeUpdates } as UserProfile;
        setUser(updatedUser);
        localStorage.setItem('cwc_user', JSON.stringify(toStorage(updatedUser)));
        window.dispatchEvent(new Event('cwc_user_updated'));

        if (session?.user) {
            const dbUpdates: any = {};
            if (safeUpdates.name !== undefined)               dbUpdates.name = safeUpdates.name;
            if (safeUpdates.subscriptionTier !== undefined)   dbUpdates.subscription_tier = safeUpdates.subscriptionTier;
            if (safeUpdates.unlockedVolumes !== undefined)    dbUpdates.unlocked_volumes = safeUpdates.unlockedVolumes;
            if (safeUpdates.unlockedClasses !== undefined)    dbUpdates.unlocked_classes = safeUpdates.unlockedClasses;
            if (safeUpdates.avatarUrl !== undefined)          dbUpdates.avatar_url = safeUpdates.avatarUrl;
            if (safeUpdates.coverUrl !== undefined)           dbUpdates.cover_url = safeUpdates.coverUrl;
            if (safeUpdates.dietaryPreferences !== undefined) dbUpdates.dietary_preferences = safeUpdates.dietaryPreferences;
            if (safeUpdates.favoriteFood !== undefined)       dbUpdates.favorite_food = safeUpdates.favoriteFood;
            if (safeUpdates.pushSubscription !== undefined)   dbUpdates.push_subscription = safeUpdates.pushSubscription;
            
            if (Object.keys(dbUpdates).length > 0) {
                await supabase.from('people').update(dbUpdates).eq('id', session.user.id);
            }
        }
    };

    const refreshUserFromDB = async () => {
        if (!session?.user) return;
        await fetchUserProfile(session.user);
    };

    const unlockVolume = (volumeName: string) => {
        if (!user.unlockedVolumes.includes(volumeName)) {
            updateUser({ unlockedVolumes: [...user.unlockedVolumes, volumeName] });
        }
    };

    const unlockClass = (classId: number) => {
        if (!user.unlockedClasses.includes(classId)) {
            updateUser({ unlockedClasses: [...user.unlockedClasses, classId] });
        }
    };

    const hasAccessToRecipe = (recipe: Partial<Recipe>) => {
        const volume = recipe?.volume || 'Free';
        if (volume === 'Free') return true;
        if (PRIVILEGED_ROLES.includes(user?.role)) return true;
        if (user?.subscriptionTier && user.subscriptionTier !== 'Free') return true;
        return user?.unlockedVolumes?.includes(volume) ?? false;
    };

    const hasAccessToClass = (cls: Partial<CookingClass>) => {
        const tier = cls?.tierRequired || 'Free';
        if (!tier || tier === 'Free') return true;
        if (PRIVILEGED_ROLES.includes(user?.role)) return true;
        if (user?.subscriptionTier && user.subscriptionTier !== 'Free') return true;
        if (user?.subscriptionTier === tier) return true;
        return user?.unlockedClasses?.includes(cls.id!) ?? false;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(defaultUser);
        localStorage.removeItem('cwc_user');
    };

    const isGod = PRIVILEGED_ROLES.includes(user?.role) && !!user?.id;

    return {
        session, user: { ...user, isGod }, loading,
        updateUser, refreshUserFromDB,
        unlockVolume, unlockClass,
        hasAccessToRecipe, hasAccessToClass,
        signOut,
        isGod,
    };
}
