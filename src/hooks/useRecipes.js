import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { recipesData as initialRecipes } from '../data/recipes';
import { useUser } from './useUser';

export function useRecipes() {
    const { user } = useUser();
    const [recipes, setRecipes] = useState(() => {
        const stored = localStorage.getItem('cwc_recipes');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        return initialRecipes;
    });

    useEffect(() => {
        const fetchRecipes = async () => {
            const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching recipes:", error);
                // Fallback to local
                const stored = localStorage.getItem('cwc_recipes');
                if (stored) setRecipes(JSON.parse(stored));
                else setRecipes(initialRecipes);
                return;
            }

            if (data && data.length > 0) {
                // Merge with local storage to preserve fields that might not be in Supabase yet (e.g. isFeatured, video)
                const stored = localStorage.getItem('cwc_recipes');
                let mergedData = data;
                if (stored) {
                    try {
                        const localRecipes = JSON.parse(stored);
                        mergedData = data.map(serverRecipe => {
                            const localMatch = localRecipes.find(r => r.id === serverRecipe.id);
                            if (localMatch) {
                                return { ...serverRecipe, isFeatured: localMatch.isFeatured, video: localMatch.video || serverRecipe.video };
                            }
                            return serverRecipe;
                        });
                    } catch(e) {}
                }
                
                setRecipes(mergedData);
                localStorage.setItem('cwc_recipes', JSON.stringify(mergedData));
            } else {
                setRecipes(initialRecipes);
                localStorage.setItem('cwc_recipes', JSON.stringify(initialRecipes));
            }
        };

        fetchRecipes();

        // Optional: Subscribe to changes
        const channelName = 'recipes_changes_' + Math.random().toString(36).substring(2, 9);
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => {
                fetchRecipes();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const addRecipe = async (newRecipe) => {
        const { data, error } = await supabase.from('recipes').insert([newRecipe]).select();
        if (error) {
            console.error("Error adding recipe:", error);
            const updated = [{ ...newRecipe, id: Date.now().toString() }, ...recipes];
            setRecipes(updated);
            localStorage.setItem('cwc_recipes', JSON.stringify(updated));
        } else if (data) {
            setRecipes(prev => {
                const updated = [data[0], ...prev.filter(r => r.id !== data[0].id)];
                localStorage.setItem('cwc_recipes', JSON.stringify(updated));
                return updated;
            });
        }
    };

    const updateRecipe = async (id, updatedRecipe) => {
        const { error } = await supabase.from('recipes').update(updatedRecipe).eq('id', id);
        if (error) console.error("Error updating recipe:", error);
        
        setRecipes(prev => {
            const updated = prev.map(r => r.id === id ? { ...r, ...updatedRecipe } : r);
            localStorage.setItem('cwc_recipes', JSON.stringify(updated));
            return updated;
        });
    };

    const deleteRecipe = async (id) => {
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) console.error("Error deleting recipe:", error);
        
        setRecipes(prev => {
            const updated = prev.filter(r => r.id !== id);
            localStorage.setItem('cwc_recipes', JSON.stringify(updated));
            return updated;
        });
    };

    const isGodAdmin = user?.email === 'ononeline30@gmail.com';
    
    const visibleRecipes = recipes.filter(r => {
        const isMock = typeof r.id === 'number' || (typeof r.id === 'string' && r.id.length < 5);
        if (isMock && !isGodAdmin) return false;
        return true;
    });

    const publicRecipes = visibleRecipes.filter(r => {
        if (r.status === 'draft') return false;
        
        const isAdmin = ['admin', 'management', 'employee'].includes(user?.role);
        
        if (!isAdmin && r.scheduled_post_date) {
            if (new Date(r.scheduled_post_date) > new Date()) return false;
        }
        
        return true;
    });

    return { recipes: visibleRecipes, publicRecipes, addRecipe, updateRecipe, deleteRecipe };
}
