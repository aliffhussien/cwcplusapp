import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const initialUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', subscriptionTier: 'Free' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', subscriptionTier: 'Pro Premium' }
];

export function useAllUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('people').select('*').order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching users:", error);
                const stored = localStorage.getItem('cwc_simulated_users');
                if (stored) setUsers(JSON.parse(stored));
                else setUsers(initialUsers);
                return;
            }

            if (data && data.length > 0) {
                setUsers(data);
            } else {
                setUsers(initialUsers);
            }
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
        if (error) {
            console.error("Error adding user:", error);
            const updated = [...users, { ...newUser, id: Date.now().toString() }];
            setUsers(updated);
            localStorage.setItem('cwc_simulated_users', JSON.stringify(updated));
        } else if (data) {
            setUsers(prev => {
                const updated = [data[0], ...prev.filter(u => u.id !== data[0].id)];
                localStorage.setItem('cwc_simulated_users', JSON.stringify(updated));
                return updated;
            });
        }
    };

    const removeUser = async (id) => {
        const { error } = await supabase.from('people').delete().eq('id', id);
        if (error) console.error("Error deleting user:", error);
        
        setUsers(prev => {
            const updated = prev.filter(u => u.id !== id);
            localStorage.setItem('cwc_simulated_users', JSON.stringify(updated));
            return updated;
        });
    };

    const updateUserTier = async (id, newTier) => {
        const { error } = await supabase.from('people').update({ subscription_tier: newTier }).eq('id', id);
        if (error) console.error("Error updating user tier:", error);
        
        setUsers(prev => {
            const updated = prev.map(u => u.id === id ? { ...u, subscriptionTier: newTier, subscription_tier: newTier } : u);
            localStorage.setItem('cwc_simulated_users', JSON.stringify(updated));
            return updated;
        });
    };

    const updateUser = async (id, updates) => {
        const { error } = await supabase.from('people').update(updates).eq('id', id);
        if (error) console.error("Error updating user:", error);
        
        setUsers(prev => {
            const updated = prev.map(u => u.id === id ? { ...u, ...updates } : u);
            localStorage.setItem('cwc_simulated_users', JSON.stringify(updated));
            return updated;
        });
    };

    return { users, addUser, removeUser, updateUserTier, updateUser };
}
