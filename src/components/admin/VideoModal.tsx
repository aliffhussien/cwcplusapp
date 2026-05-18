import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';

interface VideoModalProps {
    videoData: any;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function VideoModal({ videoData, onClose, onSave }: VideoModalProps) {
    const [formData, setFormData] = useState(videoData || { title: '', subtitle: '', url: '' });
    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 z-[200] bg-base/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface border border-glass-border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-text-1">Atmosphere Video</h3>
                    <button onClick={onClose} className="text-text-3 hover:text-text-1"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-accent mb-1.5">Display Title</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-1 focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-accent mb-1.5">Subtitle Tag</label>
                        <input required type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-1 focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-accent mb-1.5">Direct Video Link (MP4)</label>
                        <input required type="url" name="url" value={formData.url} onChange={handleChange} className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-text-1 focus:outline-none focus:border-accent" />
                    </div>
                    <button type="submit" className="mt-4 w-full bg-accent text-text-1 font-black uppercase tracking-[0.2em] text-xs py-4 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95">
                        <Save size={16} /> Update Media
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
