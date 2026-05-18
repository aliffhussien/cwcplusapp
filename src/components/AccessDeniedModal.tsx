import React from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, Loader2 } from 'lucide-react';

interface AccessDeniedModalProps {
    volume: string;
    price: string;
    onPurchase: () => void;
    loading: boolean;
}

export default function AccessDeniedModal({ volume, price, onPurchase, loading }: AccessDeniedModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-base/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-surface border border-glass-border p-8 rounded-[3rem] shadow-2xl max-w-md w-full text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <LockKeyhole size={28} className="text-accent" />
                </div>
                <h2 className="text-xl font-black uppercase italic mb-2 tracking-tighter text-text-1">Classified Recipe</h2>
                <p className="text-text-3 text-sm mb-7">This recipe belongs to <strong className="text-text-1">{volume}</strong>. Unlock the entire volume to access all related formulas.</p>
                <button onClick={onPurchase} disabled={loading} className="w-full py-4 bg-accent rounded-2xl text-text-1 font-black text-[10px] uppercase tracking-widest transition-all flex justify-center items-center gap-2 active:scale-95">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Unlock Volume for {price}</>}
                </button>
                <button onClick={() => window.history.back()} className="w-full py-4 mt-2 text-text-3 hover:text-text-1 font-bold text-[10px] uppercase tracking-widest transition-colors">
                    Return to Library
                </button>
            </motion.div>
        </div>
    );
}
