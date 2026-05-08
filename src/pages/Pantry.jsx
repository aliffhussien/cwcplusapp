import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Refrigerator, ShoppingCart, CheckCircle2, X } from 'lucide-react';
import Header from '../components/Header';

export default function Pantry() {
    const [ingredients, setIngredients] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('pantry'); // 'pantry' or 'shopping'

    // Load from local storage for demo purposes
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

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        
        const newIng = {
            id: Date.now(),
            name: newItem.trim(),
            category: activeTab,
            addedAt: Date.now()
        };
        
        setIngredients([newIng, ...ingredients]);
        setNewItem('');
    };

    const handleRemove = (id) => {
        setIngredients(ingredients.filter(i => i.id !== id));
    };

    const handleMove = (id, targetCategory) => {
        setIngredients(ingredients.map(i => i.id === id ? { ...i, category: targetCategory } : i));
    };

    const filteredItems = ingredients
        .filter(i => i.category === activeTab)
        .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-32">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.08, 0.05] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600 blur-[100px]" />
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600 blur-[120px]" />
            </div>

            <Header variant="back" title="My Pantry" />

            <main className="relative z-10 pt-24 px-4 md:px-10 max-w-4xl mx-auto">
                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md mb-8 shadow-lg">
                    <button onClick={() => setActiveTab('pantry')} className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${activeTab === 'pantry' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <Refrigerator size={18} /> In Pantry
                    </button>
                    <button onClick={() => setActiveTab('shopping')} className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${activeTab === 'shopping' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <ShoppingCart size={18} /> Shopping List
                    </button>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[32px] p-6 shadow-2xl mb-8">
                    <form onSubmit={handleAdd} className="flex gap-3 mb-6">
                        <div className="relative flex-1">
                            <Plus size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                value={newItem} 
                                onChange={e => setNewItem(e.target.value)} 
                                placeholder={activeTab === 'pantry' ? "Add ingredient to pantry..." : "Add item to buy..."}
                                className="w-full bg-slate-950 border border-slate-800 rounded-full pl-12 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <button type="submit" className={`px-6 py-4 rounded-full font-black text-white transition-all hover:scale-105 active:scale-95 shadow-lg ${activeTab === 'pantry' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                            Add
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            placeholder="Search stored items..."
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium text-white outline-none focus:border-slate-600 transition-colors"
                        />
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        <AnimatePresence>
                            {filteredItems.map(item => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={item.id} 
                                    className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl group hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800`}>
                                            {activeTab === 'pantry' ? <Refrigerator size={18} className="text-indigo-400" /> : <ShoppingCart size={18} className="text-emerald-400" />}
                                        </div>
                                        <span className="text-base font-bold text-white">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeTab === 'shopping' ? (
                                            <button onClick={() => handleMove(item.id, 'pantry')} className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors" title="Move to Pantry">
                                                <CheckCircle2 size={18} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleMove(item.id, 'shopping')} className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors" title="Out of stock? Add to list">
                                                <ShoppingCart size={18} />
                                            </button>
                                        )}
                                        <button onClick={() => handleRemove(item.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {filteredItems.length === 0 && (
                            <div className="text-center py-12">
                                {activeTab === 'pantry' ? <Refrigerator size={48} className="mx-auto text-slate-700 mb-4" /> : <ShoppingCart size={48} className="mx-auto text-slate-700 mb-4" />}
                                <p className="text-lg font-bold text-slate-500">
                                    {searchQuery ? "No items found." : activeTab === 'pantry' ? "Your pantry is empty!" : "Your shopping list is clear!"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
