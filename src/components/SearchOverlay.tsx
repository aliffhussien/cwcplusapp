import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, PlayCircle, BookOpen, ShoppingBag as ShopIcon, ArrowRight, ChefHat } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';
import { useMerch } from '../hooks/useMerch';
import { APP_COPY } from '../config/appCopy';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const { publicRecipes, isLoading: recipesLoading } = useRecipes();
    const { publicClasses, isLoading: classesLoading } = useClasses();
    const { publicMerch } = useMerch();

    const isGlobalLoading = recipesLoading || classesLoading;
    const q = searchQuery.toLowerCase().trim();

    const recipeResults = useMemo(() => {
        if (!q) return [];
        return (publicRecipes || []).filter((r: any) =>
            r.title?.toLowerCase().includes(q) ||
            r.category?.toLowerCase().includes(q) ||
            r.volume?.toLowerCase().includes(q)
        ).slice(0, 5);
    }, [q, publicRecipes]);

    const classResults = useMemo(() => {
        if (!q) return [];
        return (publicClasses || []).filter((c: any) =>
            c.title?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.instructor?.toLowerCase().includes(q)
        ).slice(0, 4);
    }, [q, publicClasses]);

    const shopResults = useMemo(() => {
        if (!q) return [];
        return (publicMerch || []).filter((p: any) =>
            p.title?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        ).slice(0, 3);
    }, [q, publicMerch]);

    const hasResults = recipeResults.length > 0 || classResults.length > 0 || shopResults.length > 0;

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('search-open');
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.classList.remove('search-open');
        }
        return () => document.body.classList.remove('search-open');
    }, [isOpen]);

    const handleClose = () => {
        setSearchQuery('');
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                key="search-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[1000] flex flex-col"
            >
                <div
                    className="absolute inset-0 pointer-events-none bg-base/95"
                    style={{
                        backdropFilter: 'blur(48px) saturate(0.2)',
                        WebkitBackdropFilter: 'blur(48px) saturate(0.2)',
                    }}
                />

                <div className="relative z-10 flex flex-col h-full w-full max-w-xl mx-auto px-4 pt-12 pb-8">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex-1 flex items-center gap-3 px-4 py-4 rounded-2xl border bg-glass-bg border-glass-border focus-within:border-accent focus-within:bg-surface transition-all shadow-md">
                            <SearchIcon size={18} className="text-accent shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search recipes, classes, gear…"
                                className="flex-1 bg-transparent outline-none text-base font-bold text-text-1 placeholder-text-3 min-w-0"
                            />
                            {searchQuery && (
                                <button
                                    onMouseDown={e => { e.preventDefault(); setSearchQuery(''); }}
                                    className="text-text-3 hover:text-text-1 transition-colors shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-14 h-14 rounded-2xl bg-glass-bg border border-glass-border flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-surface transition-all shrink-0 shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pb-10">
                        {q.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                <div className="w-20 h-20 bg-glass-bg rounded-[2.5rem] flex items-center justify-center mb-6 border border-glass-border">
                                    <ChefHat size={32} className="text-accent" />
                                </div>
                                <p className="text-sm font-black uppercase italic text-text-1 mb-2">Search the vault</p>
                                <p className="section-label">Find recipes, masterclasses, and gear</p>
                            </div>
                        )}

                        {q.length > 0 && !hasResults && !isGlobalLoading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-20 h-20 bg-glass-bg rounded-[2.5rem] flex items-center justify-center mb-6 border border-glass-border">
                                    <SearchIcon size={32} className="text-text-3" />
                                </div>
                                <p className="text-sm font-black uppercase italic text-text-3 mb-2">No matches found</p>
                                <p className="section-label">Try searching for something else</p>
                            </div>
                        )}

                        {isGlobalLoading && !hasResults && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="section-label">Syncing Library...</p>
                            </div>
                        )}

                        {recipeResults.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="section-label mb-3 px-1 text-accent">Recipes</p>
                                <div className="space-y-2">
                                    {recipeResults.map((r: any) => (
                                        <button
                                            key={r.id}
                                            onClick={() => { navigate(`/recipe/${r.id}`); handleClose(); }}
                                            className="w-full flex items-center gap-4 p-4 bg-glass-bg border border-glass-border rounded-2xl hover:bg-elevated hover:border-accent/40 transition-all text-left group shadow-sm"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 group-hover:scale-110 transition-transform">
                                                <BookOpen size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-text-1 truncate">{r.title}</p>
                                                <p className="section-label mt-0.5">{r.category || 'Signature'}</p>
                                            </div>
                                            <ArrowRight size={14} className="text-text-3 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {classResults.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="section-label mb-3 px-1 text-danger">{APP_COPY.navigation.classes}</p>
                                <div className="space-y-2">
                                    {classResults.map((c: any) => (
                                        <button
                                            key={c.id}
                                            onClick={() => { navigate(`/classes?id=${c.id}`); handleClose(); }}
                                            className="w-full flex items-center gap-4 p-4 bg-glass-bg border border-glass-border rounded-2xl hover:bg-elevated hover:border-danger/40 transition-all text-left group shadow-sm"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger shrink-0 group-hover:scale-110 transition-transform">
                                                <PlayCircle size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-text-1 truncate">{c.title}</p>
                                                <p className="section-label mt-0.5">{c.instructor || 'Instructor'}</p>
                                            </div>
                                            <ArrowRight size={14} className="text-text-3 group-hover:text-danger group-hover:translate-x-1 transition-all shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {shopResults.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                                <p className="section-label mb-3 px-1 text-warning">{APP_COPY.navigation.shop}</p>
                                <div className="space-y-2">
                                    {shopResults.map((p: any) => (
                                        <button
                                            key={p.id}
                                            onClick={() => { navigate(`/shop#merch-${p.id}`); handleClose(); }}
                                            className="w-full flex items-center gap-4 p-4 bg-glass-bg border border-glass-border rounded-2xl hover:bg-elevated hover:border-warning/40 transition-all text-left group shadow-sm"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning shrink-0 group-hover:scale-110 transition-transform">
                                                <ShopIcon size={16} />
                                            </div>
                                             <div className="flex-1 min-w-0">
                                                 <p className="text-sm font-black text-text-1 truncate">{p.title || p.name || 'Equipment'}</p>
                                                 <p className="section-label mt-0.5">{p.price ? `$${p.price}` : 'Shop'}</p>
                                             </div>
                                             <ArrowRight size={14} className="text-text-3 group-hover:text-warning group-hover:translate-x-1 transition-all shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
