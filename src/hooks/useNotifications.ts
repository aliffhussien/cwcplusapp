import { useContext } from 'react';
import { NotificationsContext } from '../context/AppDataProvider';

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used within AppDataProvider');
    return ctx;
}
