/// <reference types="vite/client" />
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Star, Pencil, Video, Image as ImageIcon, Link as LinkIcon, CheckCircle, Cloud, Loader2, PlayCircle, Trash2, Library } from 'lucide-react';
import { useMedia } from '../../hooks/useMedia';

interface MediaImage {
  id: string;
  url: string;
  displayName: string;
  systemFileName: string;
  type: 'image';
  isPrimary: boolean;
  dominantColor?: string;
  schemaSnippet?: string;
  variants?: {
    thumb: string;
    card: string;
    hero: string;
  };
}

interface MediaVideo {
  id: string;
  yt_id: string;
  displayName: string;
  type: 'video';
  thumbnail_url: string;
}

interface MediaFile {
  id: string;
  url: string;
  displayName: string;
  systemFileName: string;
  type: 'file';
  mimeType: string;
  size: number;
}

// Helper to sanitize filename
const sanitizeFileName = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const extractYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export interface MediaPayload {
  images: MediaImage[];
  videos: MediaVideo[];
  files: MediaFile[];
  contentId?: string;
  contentType?: 'recipe' | 'class' | 'merch';
}

export interface MediaStudioProps {
  onSync?: (payload: MediaPayload) => Promise<void> | void;
  isSyncing?: boolean;
  contentId?: string;
  contentType?: 'recipe' | 'class' | 'merch';
}

export default function MediaStudio({ onSync, isSyncing = false, contentId, contentType }: MediaStudioProps) {
  const { media, deleteMedia, updateMediaName, togglePrimary, isLoading } = useMedia();
  const [images, setImages] = useState<MediaImage[]>([]);
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  
  const [ytUrl, setYtUrl] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [isSyncingChannel, setIsSyncingChannel] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const filteredMedia = media.filter((m: any) => m.filename?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Drag and Drop
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  // Helper: Extract Dominant Color
  const extractDominantColor = (imgEl: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#10b981'; // default emerald

    canvas.width = 50;
    canvas.height = 50;
    ctx.drawImage(imgEl, 0, 0, 50, 50);
    
    try {
      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < imageData.length; i += 4 * 10) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }
      return `rgb(${Math.floor(r / count)}, ${Math.floor(g / count)}, ${Math.floor(b / count)})`;
    } catch (e) {
      return '#10b981';
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const otherFiles = Array.from(files).filter(f => !f.type.startsWith('image/'));
    
    const results: MediaImage[] = [];
    const fileResults: MediaFile[] = [];

    // Process Images
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const rawName = file.name.split('.').slice(0, -1).join('.');
      
      const isDuplicateSynced = media.some((m: any) => m.filename === rawName);
      if (isDuplicateSynced) continue;

      const schemaName = sanitizeFileName(rawName);
      
      const imgUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imgUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Skip on error
      });

      const dominantColor = extractDominantColor(img);

      const generateSizedWebp = (img: HTMLImageElement, targetRatio: number, maxWidth: number, watermarked: boolean = false): string => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
    
        const imgRatio = img.width / img.height;
        let cropX = 0, cropY = 0, cropW = img.width, cropH = img.height;
    
        if (imgRatio > targetRatio) {
          cropW = img.height * targetRatio;
          cropX = (img.width - cropW) / 2;
        } else {
          cropH = img.width / targetRatio;
          cropY = (img.height - cropH) / 2;
        }
    
        const scale = Math.min(1, maxWidth / cropW);
        canvas.width = cropW * scale;
        canvas.height = cropH * scale;
    
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    
        if (watermarked) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          const fontSize = Math.max(16, canvas.width * 0.04);
          ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = Math.max(4, canvas.width * 0.01);
          ctx.fillText('CWC+', canvas.width - (fontSize * 0.5), canvas.height - (fontSize * 0.5));
        }
    
        return canvas.toDataURL('image/webp', 0.85);
      };

      const thumb = generateSizedWebp(img, 1, 400);        // Thumbnail (sq)
      const card = generateSizedWebp(img, 4/3, 800);       // Card (4:3)
      const hero = generateSizedWebp(img, 16/9, 1920, true); // Hero (16:9) with Watermark

      const schemaSnippet = `<script type="application/ld+json">\n{\n  "@context": "https://schema.org/",\n  "@type": "ImageObject",\n  "contentUrl": "https://cwcplus.com/media/${schemaName}.webp",\n  "name": "${rawName}",\n  "description": "High quality image of ${rawName} on CWC+"\n}\n</script>`;

      results.push({
        id: Math.random().toString(36).substring(7),
        url: hero,
        displayName: rawName,
        systemFileName: `${schemaName}.webp`,
        type: 'image',
        isPrimary: images.length === 0 && i === 0,
        dominantColor,
        schemaSnippet,
        variants: { thumb, card, hero }
      });
    }

    // Process Other Files
    for (const file of otherFiles) {
        const rawName = file.name.split('.').slice(0, -1).join('.');
        const extension = file.name.split('.').pop();
        const schemaName = sanitizeFileName(rawName);
        
        fileResults.push({
            id: Math.random().toString(36).substring(7),
            url: URL.createObjectURL(file),
            displayName: rawName,
            systemFileName: `${schemaName}.${extension}`,
            type: 'file',
            mimeType: file.type,
            size: file.size
        });
    }

    if ((results.length > 0 || fileResults.length > 0) && onSync) {
      await onSync({ 
        images: results, 
        videos: [], 
        files: fileResults,
        contentId,
        contentType
      });
    }
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const setPrimaryImage = (id: string) => {
    setImages(images.map(img => ({
      ...img,
      isPrimary: img.id === id
    })));
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleYtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYouTubeID(ytUrl);
    if (!ytId) {
      alert("Invalid YouTube URL");
      return;
    }

    let videoTitle = 'YouTube Video';
    let thumbnailUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (apiKey) {
        try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ytId}&key=${apiKey}`);
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                const snippet = data.items[0].snippet;
                let decodedTitle = snippet.title;
                try {
                  const doc = new DOMParser().parseFromString(snippet.title, "text/html");
                  decodedTitle = doc.documentElement.textContent || snippet.title;
                } catch(e) {}
                videoTitle = decodedTitle;
                if (snippet.thumbnails?.maxres?.url) {
                    thumbnailUrl = snippet.thumbnails.maxres.url;
                } else if (snippet.thumbnails?.high?.url) {
                    thumbnailUrl = snippet.thumbnails.high.url;
                }
            }
        } catch (err) {
            console.error("Failed to fetch video details via API, falling back to defaults.", err);
        }
    }

    const newVideo: MediaVideo = {
      id: Math.random().toString(36).substring(7),
      yt_id: ytId,
      displayName: videoTitle,
      type: 'video',
      thumbnail_url: thumbnailUrl
    };
    
    
    if (onSync) {
        await onSync({ 
          images: [], 
          videos: [newVideo], 
          files: [],
          contentId,
          contentType
        });
    }
    setYtUrl('');
  };

  const removeVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const handleChannelSync = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
       alert("Please add VITE_YOUTUBE_API_KEY to your .env file to use Channel Sync.");
       return;
    }
    
    setIsSyncingChannel(true);
    try {
        let channelId = '';
        let queryHandle = '';
        
        if (channelUrl.includes('youtube.com/channel/')) {
            channelId = channelUrl.split('youtube.com/channel/')[1].split('/')[0].split('?')[0];
        } else if (channelUrl.includes('@')) {
            queryHandle = channelUrl.split('@')[1].split('/')[0].split('?')[0];
        } else if (channelUrl.startsWith('UC') && channelUrl.length > 20) {
            channelId = channelUrl;
        } else {
            // Treat as a search query for a channel name
            queryHandle = channelUrl;
        }

        if (!channelId && queryHandle) {
            const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(queryHandle)}&key=${apiKey}`);
            const searchData = await searchRes.json();
            if (searchData.error) {
                alert(`API Error: ${searchData.error.message}`);
                setIsSyncingChannel(false);
                return;
            }
            if (searchData.items && searchData.items.length > 0) {
               channelId = searchData.items[0].snippet.channelId;
            }
        }

        if (!channelId) {
            alert(`Could not find a Channel ID for "${channelUrl}". Try using the exact @handle.`);
            setIsSyncingChannel(false);
            return;
        }

        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`);
        const data = await res.json();
        
        if (data.error) {
            alert(`API Error fetching videos: ${data.error.message}`);
            setIsSyncingChannel(false);
            return;
        }
        
        if (data.items && data.items.length > 0) {
           const newVideos: MediaVideo[] = data.items.map((item: any) => {
              let decodedTitle = item.snippet.title;
              try {
                const doc = new DOMParser().parseFromString(item.snippet.title, "text/html");
                decodedTitle = doc.documentElement.textContent || item.snippet.title;
              } catch(e) {}
              
              return {
                  id: Math.random().toString(36).substring(7),
                  yt_id: item.id.videoId,
                  displayName: decodedTitle,
                  type: 'video',
                  thumbnail_url: item.snippet.thumbnails.high?.url || `https://img.youtube.com/vi/${item.id.videoId}/maxresdefault.jpg`
              };
           });
           
           const syncedIds = new Set(media.map((m: any) => m.yt_id).filter(Boolean));
           const uniqueNew = newVideos.filter(v => !syncedIds.has(v.yt_id));
           if (onSync && uniqueNew.length > 0) {
               await onSync({ 
                 images: [], 
                 videos: uniqueNew, 
                 files: [],
                 contentId,
                 contentType
               });
               alert(`Success! Auto-saved ${uniqueNew.length} videos from the channel.`);
           } else {
               alert('All videos from this channel are already in the library.');
           }
           setChannelUrl('');
        } else {
            alert(`Found the channel (ID: ${channelId}) but no recent videos were returned.`);
        }
    } catch (err: any) {
        console.error(err);
        alert(`Failed to sync channel: ${err.message}`);
    } finally {
        setIsSyncingChannel(false);
    }
  };

  // Inline Rename Component
  const InlineRename = ({ 
    initialName, 
    onSave, 
    className = "" 
  }: { 
    initialName: string, 
    onSave: (val: string, sanitized: string) => void,
    className?: string 
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    const handleSave = () => {
      setIsEditing(false);
      const trimmed = value.trim();
      if (trimmed && trimmed !== initialName) {
        onSave(trimmed, sanitizeFileName(trimmed));
      } else {
        setValue(initialName);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') {
        setValue(initialName);
        setIsEditing(false);
      }
    };

    return (
      <div className={`relative group w-full flex justify-center ${className}`}>
        {isEditing ? (
          <motion.input
            layoutId="rename-input"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full max-w-[200px] bg-white/10 border border-white/30 text-white rounded px-2 py-1 outline-none focus:ring-2 focus:ring-accent backdrop-blur-md text-sm text-center shadow-lg"
          />
        ) : (
          <motion.div
            layoutId="rename-input"
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 cursor-text p-1 rounded hover:bg-white/5 transition-colors group"
          >
            <span className="text-sm font-medium text-white/90 truncate max-w-[150px]">{value}</span>
            <Pencil className="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-base rounded-3xl text-text-1 p-8 font-['Poppins',_sans-serif]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-sec">
              Media Command Center
            </h1>
            <p className="text-text-3">Upload, manage, and automatically sync your high-end media assets.</p>
          </div>
          
          {isSyncing && (
             <div className="flex items-center gap-2 px-6 py-3 bg-accent/20 text-accent rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 <span className="font-medium">Auto-Saving to CWC+ CMS...</span>
             </div>
          )}
        </header>

        {/* Component A: Multi-Media Upload */}
        <section className="p-6 rounded-2xl bg-surface backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="text-accent w-6 h-6" />
            <h2 className="text-2xl font-semibold text-text-1">Image Assets</h2>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all duration-300 ${isProcessing ? 'cursor-not-allowed border-white/20 opacity-70' : 'cursor-pointer'} ${isDragging && !isProcessing ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
          >
            {isProcessing ? (
               <Loader2 className="w-12 h-12 mb-4 text-accent animate-spin" />
            ) : (
               <Upload className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-accent' : 'text-text-3'}`} />
            )}
            <p className="text-lg font-medium text-text-2">
              {isProcessing ? 'Processing files (Optimizing & Syncing)...' : 'Drag & Drop massive files here'}
            </p>
            {!isProcessing && <p className="text-sm text-text-3 mt-2">Supports Images, PDFs, and Documents (Optimized for performance)</p>}
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileInput}
              disabled={isProcessing}
            />
          </div>
        </section>

        {/* Component B: YouTube Bridge */}
        <section className="p-6 rounded-2xl bg-surface backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-6">
            <Video className="text-accent-sec w-6 h-6" />
            <h2 className="text-2xl font-semibold text-text-1">YouTube Bridge</h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Single Video Extract */}
            <form onSubmit={handleYtSubmit} className="flex gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="text"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="Paste magic YouTube video link here..."
                  className="w-full bg-base border border-white/20 rounded-xl py-3 pl-12 pr-4 text-text-1 placeholder-text-3 focus:outline-none focus:border-accent-sec focus:ring-1 focus:ring-accent-sec transition-all backdrop-blur-sm shadow-inner"
                />
              </div>
              <button 
                type="submit"
                className="bg-accent-sec hover:bg-accent text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] w-40"
              >
                Extract Video
              </button>
            </form>

            {/* Channel Sync */}
            <form onSubmit={handleChannelSync} className="flex gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Video className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="Or paste a channel link (e.g. youtube.com/@cwcplus) to sync latest 10 videos..."
                  className="w-full bg-base border border-white/20 rounded-xl py-3 pl-12 pr-4 text-text-1 placeholder-text-3 focus:outline-none focus:border-premium focus:ring-1 focus:ring-premium transition-all backdrop-blur-sm shadow-inner"
                />
              </div>
              <button 
                type="submit"
                disabled={isSyncingChannel}
                className="bg-premium hover:bg-premium-dim text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] w-40 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncingChannel ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sync Channel'}
              </button>
            </form>
          </div>
        </section>

        {/* Component C: CWC+ Media Library */}
        <section className="p-6 rounded-2xl bg-surface backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Library className="text-accent w-6 h-6" />
              <h2 className="text-2xl font-semibold text-text-1">CWC+ Media Library</h2>
            </div>
            <div className="flex gap-4 items-center">
              <input type="text" placeholder="Search media..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-base border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent text-text-1" />
              <span className="text-sm text-text-3">{filteredMedia.length} items</span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
               <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-xl">
               <ImageIcon className="w-12 h-12 text-text-3 mx-auto mb-4" />
               <p className="text-text-3">{media.length === 0 ? 'Your library is empty. Sync some assets to see them here.' : 'No items match your search.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((m: any) => (
                <div key={m.id} className="relative aspect-square group rounded-xl overflow-hidden bg-base border border-white/10">
                   <img src={m.thumb_url || m.hero_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   
                   {m.type === 'video' && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                         <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
                       </div>
                     </div>
                   )}

                   {m.type === 'file' && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md border border-white/20">
                         <Cloud className="w-6 h-6 text-white/60 mb-0.5" />
                         <span className="text-[8px] font-bold text-white/40 uppercase">{(m.hero_url || '').split('.').pop() || 'FILE'}</span>
                       </div>
                     </div>
                   )}

                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 pb-8">
                      {/* Name placeholder to push gradient up */}
                   </div>
                   
                   <div className="absolute bottom-0 left-0 right-0 p-2 bg-base/60 backdrop-blur-md border-t border-white/10 transition-opacity">
                      <InlineRename 
                        initialName={m.filename}
                        onSave={async (newName) => {
                           if (newName !== m.filename) {
                              await updateMediaName(m.id, newName);
                           }
                        }}
                      />
                   </div>
                   
                   <button 
                      onClick={() => togglePrimary(m.id)}
                      className={`absolute top-2 left-2 p-2 rounded-full transition-all z-[20] ${m.is_primary ? 'bg-warning text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] opacity-100' : 'bg-base/40 text-text-3 opacity-0 group-hover:opacity-100 hover:bg-base/60 hover:text-text-1'}`}
                   >
                      <Star className={`w-4 h-4 ${m.is_primary ? 'fill-white' : ''}`} />
                   </button>

                   <button onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this asset?')) {
                          await deleteMedia(m.id);
                      }
                   }} className="absolute top-2 right-2 p-2 bg-danger/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger z-10">
                      <Trash2 className="w-4 h-4" />
                   </button>

                   {m.dominant_color && (
                     <div className="absolute top-2 left-2 w-3 h-3 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: m.dominant_color }} />
                   )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
