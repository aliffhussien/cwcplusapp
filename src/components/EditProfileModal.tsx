import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSave: (data: any) => Promise<void>;
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
    const [name, setName] = useState(user?.name || '');
    const [diet, setDiet] = useState<string[]>(user?.dietaryPreferences || []);
    const [food, setFood] = useState(user?.favoriteFood || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(user?.name || '');
            setDiet(user?.dietaryPreferences || []);
            setFood(user?.favoriteFood || '');
        }
    }, [isOpen, user]);

    const dietOptions = ['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Nut-Free', 'Low-Carb', 'Paleo'];

    const toggleDiet = (option: string) => {
        if (diet.includes(option)) setDiet(diet.filter(d => d !== option));
        else setDiet([...diet, option]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ name, dietaryPreferences: diet, favoriteFood: food });
        setIsSaving(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-base/90 backdrop-blur-md" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface border-[0.5px] border-glass-border rounded-[2.5rem] overflow-hidden shadow-2xl p-6">
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-glass-bg hover:bg-elevated text-text-3 hover:text-text-1 transition-colors border border-glass-border"><X size={16} /></button>
                        <h2 className="text-lg font-black text-text-1 mb-6 tracking-tight uppercase italic">Update Identity</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black text-text-3 uppercase tracking-widest mb-1.5 ml-1">Chef Alias</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-glass-bg border border-glass-border rounded-2xl py-3 px-4 text-sm font-bold text-text-1 focus:outline-none focus:border-accent/50 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-text-3 uppercase tracking-widest mb-1.5 ml-1">Loves / Signature</label>
                                <input type="text" value={food} onChange={(e) => setFood(e.target.value)} className="w-full bg-glass-bg border border-glass-border rounded-2xl py-3 px-4 text-sm font-bold text-text-1 focus:outline-none focus:border-accent/50 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-text-3 uppercase tracking-widest mb-2 ml-1">Dietary Logic</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {dietOptions.map(option => (
                                        <button key={option} onClick={() => toggleDiet(option)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight border transition-all ${diet.includes(option) ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-glass-bg border-glass-border text-text-3 hover:border-border'}`}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleSave} disabled={isSaving} className="w-full py-4 mt-2 rounded-2xl bg-accent text-text-1 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-accent/20">
                                <Save size={14} /> {isSaving ? 'Syncing...' : 'Confirm Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
