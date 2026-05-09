import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Search, CheckCircle2 } from 'lucide-react';
import { useMedia } from '../../hooks/useMedia';

export default function MediaPickerModal({ isOpen, onClose, onSelect }) {
  const { media, isLoading } = useMedia();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredMedia = media.filter(m => 
    m.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }} 
          className="relative w-full max-w-5xl h-[80vh] flex flex-col bg-slate-900 border-2 border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <ImageIcon size={24} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Select Media Asset</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-500 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-slate-800 bg-slate-900">
            <div className="relative max-w-md">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search media by filename..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-full py-3 pl-12 pr-6 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-bold">No media found.</p>
                <p className="text-sm">Upload assets via the Media Studio tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMedia.map(m => (
                  <div 
                    key={m.id}
                    onClick={() => {
                      onSelect(m);
                      onClose();
                    }}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-800 cursor-pointer group hover:border-emerald-500 transition-colors bg-slate-950"
                  >
                    {m.type === 'file' ? (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 transition-colors group-hover:bg-slate-700">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                             <span className="text-[10px] font-black text-white/60 mb-0.5 uppercase">{(m.hero_url || '').split('.').pop() || 'FILE'}</span>
                          </div>
                       </div>
                    ) : (
                       <img src={m.thumb_url || m.hero_url} alt={m.filename} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-xs text-white font-bold truncate">{m.filename}</p>
                    </div>

                    {(m.type === 'video' || (m.hero_url && m.hero_url.includes('.mp4'))) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
                        </div>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-500/20" />
                    </div>

                    {m.dominant_color && (
                      <div className="absolute top-2 left-2 w-3 h-3 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: m.dominant_color }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
