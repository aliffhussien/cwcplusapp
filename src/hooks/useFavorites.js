import { useState, useEffect } from 'react';

export function useFavorites() {
    const [favorites, setFavorites] = useState(() => {
        try {
            const item = window.localStorage.getItem('cwc_favorites');
            const parsed = item ? JSON.parse(item) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn("Error reading localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('cwc_favorites', JSON.stringify(favorites));
            // Dispatch a custom event so other components can sync
            window.dispatchEvent(new Event('cwc_favorites_updated'));
        } catch (error) {
            console.warn("Error setting localStorage", error);
        }
    }, [favorites]);

    // Listen for changes from other components (so Profile updates instantly if we navigate)
    useEffect(() => {
        const handleSync = () => {
            try {
                const item = window.localStorage.getItem('cwc_favorites');
                if (item) setFavorites(JSON.parse(item));
            } catch (e) {
                console.error("Error syncing favorites", e);
            }
        };
        window.addEventListener('cwc_favorites_updated', handleSync);
        return () => window.removeEventListener('cwc_favorites_updated', handleSync);
    }, []);

    const toggleFavorite = (recipeId) => {
        setFavorites(prev => 
            prev.includes(recipeId) 
                ? prev.filter(id => id !== recipeId)
                : [...prev, recipeId]
        );
    };

    const isFavorite = (recipeId) => favorites.includes(recipeId);

    return { favorites, toggleFavorite, isFavorite };
}
