import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAllUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('people').select('id, name, email, subscription_tier, role, created_at, avatar_url').order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching users:", error);
                return;
            }

            setUsers(data || []);
        };

        fetchUsers();

        const channelName = 'people_changes_' + Math.random().toString(36).substring(2, 9);
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, () => {
                fetchUsers();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const addUser = async (newUser) => {
        const { data, error } = await supabase.from('people').insert([newUser]).select();
        if (error) { console.error("Error adding user:", error); return; }
        if (data) setUsers(prev => [data[0], ...prev.filter(u => u.id !== data[0].id)]);
    };

    const removeUser = async (id) => {
        const { error } = await supabase.from('people').delete().eq('id', id);
        if (error) { console.error("Error deleting user:", error); return; }
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const updateUserTier = async (id, newTier) => {
        const { error } = await supabase.from('people').update({ subscription_tier: newTier }).eq('id', id);
        if (error) { console.error("Error updating user tier:", error); return; }
        setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription_tier: newTier } : u));
    };

    const updateUser = async (id, updates) => {
        const { error } = await supabase.from('people').update(updates).eq('id', id);
        if (error) { console.error("Error updating user:", error); return; }
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    return { users, addUser, removeUser, updateUserTier, updateUser };
}
