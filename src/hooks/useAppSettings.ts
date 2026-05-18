import { useContext } from 'react';
import { SettingsContext } from '../context/AppDataProvider';

export function useAppSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useAppSettings must be used within AppDataProvider');
    return ctx;
}
