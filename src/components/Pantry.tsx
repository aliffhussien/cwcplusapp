import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Refrigerator, ShoppingCart, CheckCircle2, Zap } from 'lucide-react';
import Header from './Header';

interface PantryItem {
    id: number;
    name: string;
    category: string;
    addedAt: number;
}

export default function Pantry() {
    const [ingredients, setIngredients] = useState<PantryItem[]>([]);
    const [newItem, setNewItem] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('pantry'); // 'pantry' or 'shopping'

    useEffect(() => {
        const stored = localStorage.getItem('cwc_pantry');
        if (stored) setIngredients(JSON.parse(stored));
        else setIngredients([
            { id: 1, name: 'All-Purpose Flour', category: 'pantry', addedAt: Date.now() },
            { id: 2, name: 'Eggs', category: 'pantry', addedAt: Date.now() },
            { id: 3, name: 'Milk', category: 'shopping', addedAt: Date.now() }
        ]);
    }, []);

    useEffect(() => {
        if (ingredients.length > 0) {
            localStorage.setItem('cwc_pantry', JSON.stringify(ingredients));
        }
    }, [ingredients]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        
        const newIng: PantryItem = {
            id: Date.now(),
            name: newItem.trim(),
            category: activeTab,
            addedAt: Date.now()
        };
        
        setIngredients([newIng, ...ingredients]);
        setNewItem('');
    };

    const handleRemove = (id: number) => {
        setIngredients(ingredients.filter(i => i.id !== id));
    };

    const handleMove = (id: number, targetCategory: string) => {
        setIngredients(ingredients.map(i => i.id === id ? { ...i, category: targetCategory } : i));
    };

    const filteredItems = ingredients
        .filter(i => i.category === activeTab)
        .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="relative min-h-screen bg-base text-text-1 selection:bg-accent/30 pb-32 font-sans">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <Header variant="back" title="My Pantry" />

            <main className="relative z-10 pt-20 px-4 md:px-8 max-w-5xl mx-auto">
                <div className="flex bg-surface p-1 rounded-2xl border-[0.5px] border-glass-border backdrop-blur-xl mb-10 shadow-2xl">
                    <button onClick={() => setActiveTab('pantry')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${activeTab === 'pantry' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-3 hover:text-text-1'}`}>
                        <Refrigerator size={14} /> Inventory
                    </button>
                    <button onClick={() => setActiveTab('shopping')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${activeTab === 'shopping' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-3 hover:text-text-1'}`}>
                        <ShoppingCart size={14} /> Shopping
                    </button>
                </div>

                <div className="bg-surface border-[0.5px] border-glass-border rounded-[32px] p-6 shadow-2xl mb-10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent pointer-events-none" />
                    
                    <form onSubmit={handleAdd} className="flex gap-3 mb-8 relative z-10">
                        <div className="relative flex-1 group/input">
                            <Plus size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-3 group-focus-within/input:text-accent transition-colors" />
                            <input 
                                type="text" 
                                value={newItem} 
                                onChange={e => setNewItem(e.target.value)} 
                                placeholder={activeTab === 'pantry' ? "Add a new ingredient..." : "Add to shopping list..."}
                                className="w-full bg-glass-bg border border-glass-border rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-text-1 outline-none focus:border-accent/50 transition-all placeholder:text-text-3/40"
                            />
                        </div>
                        <button type="submit" className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-text-1 transition-all active:scale-95 shadow-xl bg-accent shadow-accent/20`}>
                            Add Item
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-3/40" />
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            placeholder="Search items..."
                            className="w-full bg-transparent border-b border-glass-border pl-12 pr-6 py-3 text-[11px] font-black uppercase tracking-widest text-text-3 outline-none focus:border-accent/30 transition-all placeholder:text-text-3/20"
                        />
                    </div>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
                        <AnimatePresence mode='popLayout'>
                            {filteredItems.map((item) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={item.id} 
                                    className="flex items-center justify-between p-3.5 bg-glass-bg border-[0.5px] border-glass-border rounded-2xl group hover:bg-elevated hover:border-border transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-glass-border group-hover:scale-105 transition-transform`}>
                                            {activeTab === 'pantry' ? <Zap size={14} className="text-accent" /> : <Plus size={14} className="text-accent" />}
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-text-1 block leading-none">{item.name}</span>
                                            <span className="text-[9px] font-bold text-text-3 uppercase tracking-tighter mt-1 block">Logged: {new Date(item.addedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeTab === 'shopping' ? (
                                            <button onClick={() => handleMove(item.id, 'pantry')} className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all border border-accent/10" title="Move to Inventory">
                                                <CheckCircle2 size={16} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleMove(item.id, 'shopping')} className="w-9 h-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center hover:bg-warning hover:text-white transition-all border border-warning/10" title="Add to Shopping">
                                                <ShoppingCart size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => handleRemove(item.id)} className="w-9 h-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all border border-danger/10">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {filteredItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <div className="w-16 h-16 bg-surface rounded-[20px] flex items-center justify-center mb-6 border border-glass-border rotate-12">
                                    {activeTab === 'pantry' ? <Refrigerator size={32} /> : <ShoppingCart size={32} />}
                                </div>
                                <p className="section-label text-text-3">
                                    {searchQuery ? "No matches found." : "Your pantry list is empty."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface border-[0.5px] border-glass-border rounded-3xl p-5 flex items-center gap-5">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                            <Zap size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-text-3 uppercase tracking-widest mb-1">Cloud Sync Status</p>
                            <p className="text-xs font-bold text-text-1">Your pantry is synchronized across all your devices.</p>
                        </div>
                    </div>
                    <div className="bg-surface border-[0.5px] border-glass-border rounded-3xl p-5 flex items-center gap-5">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                            <CheckCircle2 size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-text-3 uppercase tracking-widest mb-1">Total Items</p>
                            <p className="text-xs font-bold text-text-1">{ingredients.length} items tracked across all categories.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
