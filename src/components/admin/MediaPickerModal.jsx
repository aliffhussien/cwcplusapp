import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Search, CheckCircle2, Upload } from 'lucide-react';
import { useMedia } from '../../hooks/useMedia';
import MediaStudio from './MediaStudio';
import { supabase } from '../../lib/supabase';

export default function MediaPickerModal({ isOpen, onClose, onSelect, contentId, contentType }) {
  const { media, isLoading } = useMedia();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  
  const filteredMedia = media.filter(m => 
    m.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocalSync = async (payload) => {
    setIsSavingMedia(true);
    try {
      // Re-use logic from Admin.jsx or move to hook?
      // For now, let's keep it simple and just use a callback if provided, 
      // but since we want "Zero-Click", we should actually perform the sync here too.
      // Actually, Admin.jsx has handleMediaSync. Maybe we should move that to useMedia hook.
      // But for now, let's just trigger the onSelect if a single item is uploaded.
      
      // I'll skip the full sync logic here to avoid duplication, 
      // and instead suggest moving it to the hook.
      // BUT, we need it to work NOW.
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingMedia(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-base/80 backdrop-blur-md" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }} 
          className="relative w-full max-w-5xl h-[80vh] flex flex-col bg-surface border-2 border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-base/50">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/20 text-accent rounded-xl">
                  <ImageIcon size={24} />
                </div>
                <h2 className="text-2xl font-black text-text-1 tracking-tight">Media Library</h2>
              </div>
              
              <div className="flex bg-surface rounded-2xl p-1">
                <button 
                   onClick={() => setActiveTab('browse')}
                   className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'browse' ? 'bg-white/10 text-text-1 shadow-lg' : 'text-text-3 hover:text-text-1'}`}
                >
                   Browse
                </button>
                <button 
                   onClick={() => setActiveTab('upload')}
                   className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-accent text-white shadow-lg' : 'text-text-3 hover:text-text-1'}`}
                >
                   Upload New
                </button>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-text-3 hover:text-text-1 bg-white/5 hover:bg-danger rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-white/5 bg-surface">
            <div className="relative max-w-md">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" />
              <input 
                type="text" 
                placeholder="Search media by filename..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-base border border-white/10 rounded-full py-3 pl-12 pr-6 text-text-1 font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'upload' ? (
              <div className="h-full">
                <MediaStudio 
                  contentId={contentId} 
                  contentType={contentType} 
                  isSyncing={isSavingMedia}
                  onSync={async (payload) => {
                    setIsSavingMedia(true);
                    try {
                      let uploadCount = 0;
                      
                      // Process Images
                      for (const img of payload.images) {
                        const fileExt = 'webp';
                        const fileName = `${img.systemFileName}`;
                        const filePath = `uploads/${fileName}`;

                        const blob = await (await fetch(img.url)).blob();
                        const { error: storageError } = await supabase.storage.from('public-assets').upload(filePath, blob, { contentType: 'image/webp', upsert: true });
                        if (storageError) throw storageError;

                        const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(filePath);

                        const { data: dbData, error: dbError } = await supabase.from('media_library').insert([{
                          filename: img.displayName,
                          hero_url: publicUrl,
                          thumb_url: img.variants?.thumb || publicUrl,
                          card_url: img.variants?.card || publicUrl,
                          dominant_color: img.dominantColor,
                          seo_schema: img.schemaSnippet,
                          type: 'image',
                          is_primary: img.isPrimary,
                          content_id: payload.contentId,
                          content_type: payload.contentType
                        }]).select();

                        if (dbError) throw dbError;
                        uploadCount++;
                        
                        // Automatically select the first uploaded image if it's primary or only one
                        if (img.isPrimary || payload.images.length === 1) {
                          onSelect(dbData[0]);
                        }
                      }

                      // Process Videos
                      for (const vid of payload.videos) {
                        const { data: dbData, error: dbError } = await supabase.from('media_library').insert([{
                          filename: vid.displayName,
                          hero_url: `https://www.youtube.com/watch?v=${vid.yt_id}`,
                          thumb_url: vid.thumbnail_url,
                          card_url: vid.thumbnail_url,
                          type: 'video',
                          content_id: payload.contentId,
                          content_type: payload.contentType
                        }]).select();
                        if (dbError) throw dbError;
                        uploadCount++;
                        if (payload.videos.length === 1) onSelect(dbData[0]);
                      }

                      if (uploadCount > 0) {
                        setActiveTab('browse');
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Upload failed: " + err.message);
                    } finally {
                      setIsSavingMedia(false);
                    }
                  }}
                />
              </div>
            ) : isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-bold">No media found.</p>
                <p className="text-sm">Upload assets via the Upload New tab.</p>
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
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer group transition-all bg-base ${m.is_primary ? 'border-warning ring-2 ring-warning/20' : 'border-white/5 hover:border-accent'}`}
                  >
                    {m.type === 'file' ? (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-surface transition-colors group-hover:bg-white/10">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                             <span className="text-[10px] font-black text-text-3 mb-0.5 uppercase">{(m.hero_url || '').split('.').pop() || 'FILE'}</span>
                          </div>
                       </div>
                    ) : (
                       <img src={m.thumb_url || m.hero_url} alt={m.filename} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-xs text-white font-bold truncate">{m.filename}</p>
                    </div>

                    {m.is_primary && (
                      <div className="absolute top-2 left-2 p-1.5 bg-warning text-white rounded-full shadow-lg">
                        <CheckCircle2 size={12} className="fill-white" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 size={24} className="text-accent fill-accent/20" />
                    </div>

                    {!m.is_primary && m.dominant_color && (
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
