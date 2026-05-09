import { useContext } from 'react';
import { MediaContext } from '../context/AppDataProvider';

export function useMedia() {
    const ctx = useContext(MediaContext);
    if (!ctx) throw new Error('useMedia must be used within AppDataProvider');
    return ctx;
}
