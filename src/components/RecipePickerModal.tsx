import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChefHat, Plus } from 'lucide-react';
import { getMediaAssetUrl } from '../lib/mediaUtils';

interface RecipePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
    recipes: any[];
    mediaList: any[];
}

export default function RecipePickerModal({ isOpen, onClose, onSelect, recipes, mediaList }: RecipePickerModalProps) {
    const [search, setSearch] = useState('');
    const filtered = (recipes || []).filter(r => (r.title || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-base/80 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="relative w-full max-w-lg bg-surface border border-border rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[80vh] shadow-2xl"
                    >
                        <div className="p-6 border-b border-glass-border flex items-center justify-between">
                            <h3 className="text-lg font-black text-text-1 uppercase tracking-tight">Select Signature Dish</h3>
                            <button onClick={onClose} className="p-2 hover:bg-elevated rounded-full transition-colors text-text-3">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 border-b border-glass-border relative">
                            <Search size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-text-3" />
                            <input
                                type="text"
                                placeholder="Search culinary vault..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-glass-bg border border-glass-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-text-1 outline-none focus:border-accent/50 transition-all"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px] custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((r, index) => {
                                    const cardImage = getMediaAssetUrl(r.cover_image_id, mediaList, r.image);
                                    return (
                                        <motion.div
                                            key={r.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.01 }}
                                            onClick={() => { onSelect(r.id); setSearch(''); }}
                                            className="flex items-center gap-4 p-3 hover:bg-glass-bg border border-transparent hover:border-glass-border rounded-2xl cursor-pointer transition-all group"
                                        >
                                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-glass-bg border border-glass-border">
                                                {cardImage
                                                    ? <img src={cardImage} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
                                                    : <ChefHat className="m-auto mt-3 text-text-3" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-black text-text-1 truncate group-hover:text-accent transition-colors uppercase tracking-tight">{r.title}</h4>
                                                <div className="section-label mt-1">
                                                    <span>{r.category || 'Mains'}</span> · <span>{r.time || '30m'}</span>
                                                </div>
                                            </div>
                                            <Plus size={18} className="text-text-3 group-hover:text-text-1 transition-colors mr-2" />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {filtered.length === 0 && (
                                <div className="text-center py-20 section-label text-text-3">No methods found</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
