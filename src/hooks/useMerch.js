import { useContext } from 'react';
import { MerchContext } from '../context/AppDataProvider';

export function useMerch() {
    const ctx = useContext(MerchContext);
    if (!ctx) throw new Error('useMerch must be used within AppDataProvider');
    return ctx;
}
