import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './useUser';

const initialClasses = [
    { id: 1, title: 'The Perfect Steak', instructor: 'Chef Ramsey', duration: '45m', price: '19.99', tierRequired: 'Premium', status: 'published', isFeatured: true, image: 'https://images.unsplash.com/photo-1544025162-83141f237f81?auto=format&fit=crop&q=80&w=800', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
];

export function useClasses() {
    const { user } = useUser();
    const [classes, setClasses] = useState(() => {
        const stored = localStorage.getItem('cwc_classes');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        return initialClasses;
    });

    useEffect(() => {
        const fetchClasses = async () => {
            const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching classes:", error);
                const stored = localStorage.getItem('cwc_classes');
                if (stored) setClasses(JSON.parse(stored));
                else setClasses(initialClasses);
                return;
            }

            if (data && data.length > 0) {
                const stored = localStorage.getItem('cwc_classes');
                let mergedData = data;
                if (stored) {
                    try {
                        const localClasses = JSON.parse(stored);
                        mergedData = data.map(serverClass => {
                            const localMatch = localClasses.find(c => c.id === serverClass.id);
                            if (localMatch) {
                                return { ...serverClass, isFeatured: localMatch.isFeatured };
                            }
                            return serverClass;
                        });
                    } catch(e) {}
                }

                setClasses(mergedData);
                localStorage.setItem('cwc_classes', JSON.stringify(mergedData));
            } else {
                setClasses(initialClasses);
                localStorage.setItem('cwc_classes', JSON.stringify(initialClasses));
            }
        };

        fetchClasses();

        const channelName = 'classes_changes_' + Math.random().toString(36).substring(2, 9);
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => {
                fetchClasses();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const addClass = async (newClass) => {
        const { data, error } = await supabase.from('classes').insert([newClass]).select();
        if (error) {
            console.error("Error adding class:", error);
            const updated = [...classes, { ...newClass, id: Date.now().toString() }];
            setClasses(updated);
            localStorage.setItem('cwc_classes', JSON.stringify(updated));
        } else if (data) {
            setClasses(prev => {
                const updated = [data[0], ...prev.filter(c => c.id !== data[0].id)];
                localStorage.setItem('cwc_classes', JSON.stringify(updated));
                return updated;
            });
        }
    };

    const updateClass = async (id, updatedClass) => {
        const { error } = await supabase.from('classes').update(updatedClass).eq('id', id);
        if (error) console.error("Error updating class:", error);
        
        setClasses(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, ...updatedClass } : c);
            localStorage.setItem('cwc_classes', JSON.stringify(updated));
            return updated;
        });
    };

    const deleteClass = async (id) => {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) console.error("Error deleting class:", error);
        
        setClasses(prev => {
            const updated = prev.filter(c => c.id !== id);
            localStorage.setItem('cwc_classes', JSON.stringify(updated));
            return updated;
        });
    };

    const isGodAdmin = user?.email === 'ononeline30@gmail.com';
    
    const visibleClasses = classes.filter(c => {
        const isMock = typeof c.id === 'number' || (typeof c.id === 'string' && c.id.length < 5);
        if (isMock && !isGodAdmin) return false;
        return true;
    });

    const publicClasses = visibleClasses.filter(c => {
        if (c.status === 'draft') return false;
        
        const isAdmin = ['admin', 'management', 'employee'].includes(user?.role);
        
        if (!isAdmin && c.scheduled_post_date) {
            if (new Date(c.scheduled_post_date) > new Date()) return false;
        }
        
        return true;
    });

    return { classes: visibleClasses, publicClasses, addClass, updateClass, deleteClass };
}
