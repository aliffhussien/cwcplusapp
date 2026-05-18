import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';

const CATEGORIES = ["All", "Cutlery", "Cookware", "Apparel", "Digital"];

interface ProductModalProps {
    product: any;
    onClose: () => void;
    onSave: (product: any) => void;
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [formData, setFormData] = useState(
        product || {
            id: `new-${Date.now()}`,
            title: '', price: 0, category: 'Cutlery',
            description: '', stock: 10, featured: false,
            image: '', media_id: ''
        }
    );

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 z-[200] bg-base/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-surface border border-glass-border rounded-[2.5rem] w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl custom-scrollbar">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-surface py-2 z-10 border-b border-glass-border">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-text-1">{product ? 'Edit Equipment' : 'Add Equipment'}</h3>
                    <button onClick={onClose} className="bg-glass-bg p-2 rounded-full text-text-3 hover:text-text-1"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-accent mb-1.5 ml-1">Title</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-1 focus:outline-none focus:border-accent transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-accent mb-1.5 ml-1">Price ($)</label>
                            <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-1 focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-accent mb-1.5 ml-1">Stock</label>
                            <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-1 focus:outline-none focus:border-accent" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-accent mb-1.5 ml-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface border border-glass-border rounded-xl px-4 py-3 text-text-1 focus:outline-none focus:border-accent appearance-none">
                            {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="block text-[10px] font-black uppercase text-accent mb-1.5 ml-1">Product Media</label>
                        <div className="flex gap-4 items-center bg-glass-bg border border-glass-border p-3 rounded-2xl">
                            {formData.image && <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-base/20 border border-glass-border"><img src={formData.image} className="w-full h-full object-cover" alt="Preview" /></div>}
                            <div className="flex-1">
                                <p className="section-label mb-1">{formData.image ? 'Media Attached' : 'Empty Slot'}</p>
                                <button type="button" onClick={() => setIsPickerOpen(true)} className="text-[11px] font-black uppercase tracking-widest text-accent hover:text-accent-sec transition-colors">{formData.image ? 'Change Asset' : 'Browse Library'}</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-accent mb-1.5 ml-1">Description</label>
                        <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-1 focus:outline-none focus:border-accent resize-none" />
                    </div>
                    <label className="flex items-center gap-4 p-4 bg-glass-bg border border-glass-border rounded-2xl cursor-pointer hover:bg-elevated transition-colors">
                        <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-5 h-5 rounded-md accent-accent" />
                        <div>
                            <span className="block text-xs font-bold text-text-1 uppercase tracking-tight">Feature in Hero</span>
                            <span className="block text-[10px] text-text-3">Banner rotation on shop home</span>
                        </div>
                    </label>
                    <button type="submit" className="mt-2 w-full bg-accent text-text-1 font-black uppercase tracking-[0.2em] text-xs py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-accent/20 transition-all active:scale-[0.98]">
                        <Save size={16} /> Sync Changes
                    </button>
                </form>
                <MediaPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} contentId="" onSelect={(media: any) => { setFormData((prev: any) => ({ ...prev, media_id: media.id, image: media.hero_url || media.url })); setIsPickerOpen(false); }} contentType="merch" />
            </motion.div>
        </div>
    );
}
