import { useContext } from 'react';
import { ClassesContext } from '../context/AppDataProvider';

export function useClasses() {
    const ctx = useContext(ClassesContext);
    if (!ctx) throw new Error('useClasses must be used within AppDataProvider');
    return ctx;
}
