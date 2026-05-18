import { useState, useEffect } from 'react';

export function useFavorites() {
    const [favorites, setFavorites] = useState<number[]>(() => {
        try {
            const item = window.localStorage.getItem('cwc_favorites');
            const parsed = item ? JSON.parse(item) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('cwc_favorites', JSON.stringify(favorites));
            window.dispatchEvent(new Event('cwc_favorites_updated'));
        } catch { /* ignore */ }
    }, [favorites]);

    useEffect(() => {
        const handleSync = () => {
            try {
                const item = window.localStorage.getItem('cwc_favorites');
                if (item) setFavorites(JSON.parse(item));
            } catch { /* ignore */ }
        };
        window.addEventListener('cwc_favorites_updated', handleSync);
        return () => window.removeEventListener('cwc_favorites_updated', handleSync);
    }, []);

    const toggleFavorite = (recipeId: number) => {
        setFavorites(prev => 
            prev.includes(recipeId) 
                ? prev.filter(id => id !== recipeId)
                : [...prev, recipeId]
        );
    };

    const isFavorite = (recipeId: number) => favorites.includes(recipeId);

    return { favorites, toggleFavorite, isFavorite };
}
