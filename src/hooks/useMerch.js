import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './useUser';

const initialMerch = [
    { id: '1', title: 'CWC+ Official Apron', price: '35.00', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800', description: 'Premium cotton cooking apron.', status: 'published', stock: 50 },
    { id: '2', title: 'Pro Chef Knife', price: '120.00', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=800', description: 'Japanese steel chef knife.', status: 'draft', stock: 10 }
];

export function useMerch() {
    const { user } = useUser();
    const [merch, setMerch] = useState(() => {
        const stored = localStorage.getItem('cwc_merch');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        return initialMerch;
    });

    useEffect(() => {
        const fetchMerch = async () => {
            const { data, error } = await supabase.from('merch').select('*').order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching merch:", error);
                const stored = localStorage.getItem('cwc_merch');
                if (stored) setMerch(JSON.parse(stored));
                else setMerch(initialMerch);
                return;
            }

            if (data && data.length > 0) {
                setMerch(data);
                localStorage.setItem('cwc_merch', JSON.stringify(data));
            } else {
                setMerch(initialMerch);
                localStorage.setItem('cwc_merch', JSON.stringify(initialMerch));
            }
        };

        fetchMerch();

        const channelName = 'merch_changes_' + Math.random().toString(36).substring(2, 9);
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'merch' }, () => {
                fetchMerch();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const addProduct = async (newProduct) => {
        const { data, error } = await supabase.from('merch').insert([newProduct]).select();
        if (error) {
            console.error("Error adding product:", error);
            setMerch(prev => [...prev, { ...newProduct, id: Date.now().toString() }]);
        } else if (data) {
            setMerch(prev => [data[0], ...prev.filter(m => m.id !== data[0].id)]);
        }
    };

    const updateProduct = async (id, updatedProduct) => {
        const { error } = await supabase.from('merch').update(updatedProduct).eq('id', id);
        if (error) console.error("Error updating product:", error);
        
        setMerch(prev => prev.map(m => m.id === id ? { ...m, ...updatedProduct } : m));
    };

    const deleteProduct = async (id) => {
        const { error } = await supabase.from('merch').delete().eq('id', id);
        if (error) console.error("Error deleting product:", error);
        
        setMerch(prev => prev.filter(m => m.id !== id));
    };

    const isGodAdmin = user?.email === 'ononeline30@gmail.com';
    
    const visibleMerch = merch.filter(m => {
        const isMock = typeof m.id === 'number' || (typeof m.id === 'string' && m.id.length < 5);
        if (isMock && !isGodAdmin) return false;
        return true;
    });

    const publicMerch = visibleMerch.filter(m => {
        if (m.status === 'draft') return false;
        
        const isAdmin = ['admin', 'management', 'employee'].includes(user?.role);
        if (!isAdmin && m.scheduled_post_date) {
            if (new Date(m.scheduled_post_date) > new Date()) return false;
        }
        
        return true;
    });

    return { merch: visibleMerch, publicMerch, addProduct, updateProduct, deleteProduct };
}
