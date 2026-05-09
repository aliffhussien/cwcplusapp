import { useContext } from 'react';
import { RecipesContext } from '../context/AppDataProvider';

export function useRecipes() {
    const ctx = useContext(RecipesContext);
    if (!ctx) throw new Error('useRecipes must be used within AppDataProvider');
    return ctx;
}
