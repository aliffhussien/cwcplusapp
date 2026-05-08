import React, { useState, useEffect } from 'react';
import { Reorder, motion } from 'framer-motion';
import { GripVertical, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';
import { useRecipes } from '../../hooks/useRecipes';

export default function ContentCurator() {
    const { recipes } = useRecipes();
    const [items, setItems] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (recipes && recipes.length > 0 && items.length === 0) {
            setItems(recipes.filter(r => r.status === 'published').slice(0, 10)); // just load top 10 for demo
        }
    }, [recipes]);

    const handleSave = () => {
        setIsSaving(true);
        // Here you would typically map through items and update their 'sort_order' in Supabase
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    if (items.length === 0) return <div className="text-center p-12 text-slate-500 font-bold">No published recipes available to curate.</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        Drag & Drop Curation
                    </h2>
                    <p className="text-slate-400 text-sm">Reorder how recipes appear on the homepage.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-sm shadow-xl flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    {isSaving ? <span className="animate-pulse">Saving...</span> : saved ? <><CheckCircle2 size={18} /> Saved!</> : <><Save size={18} /> Save Order</>}
                </button>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] p-6 shadow-2xl">
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
                    {items.map((item) => (
                        <Reorder.Item 
                            key={item.id} 
                            value={item} 
                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm"
                        >
                            <GripVertical className="text-slate-600" size={20} />
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-500/20" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-sm md:text-base line-clamp-1">{item.title}</h4>
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{item.category || 'Mains'}</span>
                            </div>
                            <div className="hidden md:flex">
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1">
                                    <Eye size={14} /> Visible
                                </span>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
        </div>
    );
}
