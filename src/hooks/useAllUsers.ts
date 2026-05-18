import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAllUsers() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('people')
                .select('id, name, email, subscription_tier, role, created_at, avatar_url')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setUsers(data);
            }
        };

        fetchUsers();

        const channelName = 'people_changes_' + Math.random().toString(36).substring(2, 9);
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, () => {
                fetchUsers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addUser = async (newUser: any) => {
        const { data, error } = await supabase.from('people').insert([newUser]).select();
        if (error) return;
        if (data) setUsers(prev => [data[0], ...prev.filter(u => u.id !== data[0].id)]);
    };

    const removeUser = async (id: string) => {
        const { error } = await supabase.from('people').delete().eq('id', id);
        if (error) return;
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const updateUserTier = async (id: string, newTier: string) => {
        const { error } = await supabase.from('people').update({ subscription_tier: newTier }).eq('id', id);
        if (error) return;
        setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription_tier: newTier } : u));
    };

    const updateUser = async (id: string, updates: any) => {
        const { error } = await supabase.from('people').update(updates).eq('id', id);
        if (error) return;
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    return { users, addUser, removeUser, updateUserTier, updateUser };
}
