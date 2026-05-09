import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Refrigerator, ShoppingCart, CheckCircle2, X, Zap, ChevronRight, Filter } from 'lucide-react';
import Header from '../components/Header';

export default function Pantry() {
    const [ingredients, setIngredients] = useState([]);
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
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-32 font-sans">
            {/* Ambient Background Engine */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full" />
            </div>

            <Header variant="back" title="My Pantry" />

            <main className="relative z-10 pt-20 px-4 md:px-8 max-w-5xl mx-auto">
                {/* Mode Selector */}
                <div className="flex bg-[#0F172A]/50 p-1 rounded-2xl border-[0.5px] border-white/5 backdrop-blur-xl mb-10 shadow-2xl">
                    <button onClick={() => setActiveTab('pantry')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${activeTab === 'pantry' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Refrigerator size={14} /> Inventory
                    </button>
                    <button onClick={() => setActiveTab('shopping')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${activeTab === 'shopping' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                        <ShoppingCart size={14} /> Shopping
                    </button>
                </div>

                {/* Add Items Section */}
                <div className="bg-[#0F172A]/30 border-[0.5px] border-white/10 rounded-[32px] p-6 shadow-2xl mb-10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none" />
                    
                    <form onSubmit={handleAdd} className="flex gap-3 mb-8 relative z-10">
                        <div className="relative flex-1 group/input">
                            <Plus size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                            <input 
                                type="text" 
                                value={newItem} 
                                onChange={e => setNewItem(e.target.value)} 
                                placeholder={activeTab === 'pantry' ? "Add a new ingredient..." : "Add to shopping list..."}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <button type="submit" className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl ${activeTab === 'pantry' ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}>
                            Add Item
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            placeholder="Search items..."
                            className="w-full bg-transparent border-b border-white/5 pl-12 pr-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 outline-none focus:border-indigo-500/30 transition-all placeholder:text-slate-700"
                        />
                    </div>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
                        <AnimatePresence mode='popLayout'>
                            {filteredItems.map((item, idx) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={item.id} 
                                    className="flex items-center justify-between p-3.5 bg-white/[0.02] border-[0.5px] border-white/5 rounded-2xl group hover:bg-white/[0.05] hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 border border-white/5 group-hover:scale-105 transition-transform`}>
                                            {activeTab === 'pantry' ? <Zap size={14} className="text-indigo-400" /> : <Plus size={14} className="text-indigo-400" />}
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-white block leading-none">{item.name}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter mt-1 block">Logged: {new Date(item.addedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeTab === 'shopping' ? (
                                            <button onClick={() => handleMove(item.id, 'pantry')} className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/10" title="Move to Inventory">
                                                <CheckCircle2 size={16} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleMove(item.id, 'shopping')} className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all border border-amber-500/10" title="Add to Shopping">
                                                <ShoppingCart size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => handleRemove(item.id)} className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {filteredItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <div className="w-16 h-16 bg-slate-800 rounded-[20px] flex items-center justify-center mb-6 border border-white/5 rotate-12">
                                    {activeTab === 'pantry' ? <Refrigerator size={32} /> : <ShoppingCart size={32} />}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                    {searchQuery ? "No matches found." : "Your pantry list is empty."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Intel Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0F172A]/40 border-[0.5px] border-white/10 rounded-3xl p-5 flex items-center gap-5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <Zap size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cloud Sync Status</p>
                            <p className="text-xs font-bold text-white">Your pantry is synchronized across all your devices.</p>
                        </div>
                    </div>
                    <div className="bg-[#0F172A]/40 border-[0.5px] border-white/10 rounded-3xl p-5 flex items-center gap-5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <CheckCircle2 size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Items</p>
                            <p className="text-xs font-bold text-white">{ingredients.length} items tracked across all categories.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
