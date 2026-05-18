import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { formatPrice } from '../lib/currency';
import { APP_COPY } from '../config/appCopy';

export function parseDurationMs(dur: string | number, fallbackHours = 2) {
    if (!dur && !fallbackHours) return fallbackHours * 3600000;
    if (typeof dur === 'number') return dur * 3600000;
    const h = String(dur).match(/(\d+)\s*h/i);
    const m = String(dur).match(/(\d+)\s*m/i);
    const total = (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
    return (total || fallbackHours * 60) * 60000;
}

interface ClassCardProps {
    cls: any;
    onClick: (cls: any) => void;
    mediaList: any[];
    now: Date;
    currency: string;
}

export default function ClassCard({ cls, onClick, mediaList, now, currency }: ClassCardProps) {
    const mediaAsset = (cls.thumbnail_image_id && Array.isArray(mediaList)) ? mediaList.find(m => m.id === cls.thumbnail_image_id) : null;
    const cardImage = mediaAsset ? (mediaAsset.card_url || mediaAsset.thumb_url || mediaAsset.hero_url || mediaAsset.url) : (cls.image || null);

    const liveDate = cls.live_date ? new Date(cls.live_date) : null;
    const liveDurationMs = parseDurationMs(cls.live_duration_hours || 2);
    const isLive = liveDate && now >= liveDate && now <= new Date(liveDate.getTime() + liveDurationMs);
    const isUpcoming = liveDate && now < liveDate;

    return (
        <motion.div
            onClick={() => onClick(cls)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="group cursor-pointer flex flex-col relative rounded-[28px] overflow-hidden bg-surface border border-glass-border hover:border-accent/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_30px_60px_rgba(16,185,129,0.2)] transition-all duration-500 h-full"
        >
            <div className="aspect-[16/10] w-full relative overflow-hidden bg-base shrink-0">
                {cardImage ? (
                    <img src={cardImage} alt={cls.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-base/40 flex items-center justify-center">
                        <Play size={28} className="text-text-3 opacity-50" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    {isLive ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-danger rounded-xl shadow-[0_8px_16px_rgba(244,63,94,0.5)] border border-danger/50">
                            <div className="w-2 h-2 bg-text-1 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-text-1 tracking-[0.1em]">LIVE</span>
                        </div>
                    ) : isUpcoming ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface backdrop-blur-md rounded-xl shadow-lg border border-accent/30">
                            <Clock size={12} className="text-text-1" />
                            <span className="text-[10px] font-black uppercase text-text-1 tracking-[0.1em]">UPCOMING</span>
                        </div>
                    ) : (
                         <div className="px-2.5 py-1.5 bg-base/40 backdrop-blur-md rounded-lg border border-glass-border opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                             <span className="text-[10px] font-black uppercase text-text-3 tracking-[0.1em]">{cls.category || 'Cooking Class'}</span>
                         </div>
                    )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-14 h-14 rounded-full bg-glass-bg backdrop-blur-xl flex items-center justify-center border border-glass-border shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                        <Play size={24} className="text-text-1 fill-text-1 ml-1" />
                    </div>
                </div>
                
                {cls.duration && (
                    <div className="absolute bottom-4 right-4 z-20 px-2 py-1 bg-base/60 backdrop-blur-md rounded-md border border-glass-border opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-[9px] font-black text-text-2 uppercase tracking-widest">{cls.duration}</span>
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col relative bg-gradient-to-b from-surface to-base">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-accent rounded-full" />
                    <span className="text-[9px] font-black text-accent-sec uppercase tracking-[0.4em]">{cls.category || APP_COPY.classesPage.badge}</span>
                </div>
                
                <h4 className="text-lg font-black text-text-1 group-hover:text-accent-sec transition-colors line-clamp-2 leading-[1.2] mb-4 tracking-tight">
                    {cls.title}
                </h4>
                
                <div className="mt-auto pt-4 border-t border-glass-border flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest mb-0.5">Teacher</p>
                        <p className="text-xs text-text-2 font-black uppercase tracking-wider truncate max-w-[140px]">{cls.instructor}</p>
                    </div>
                    <div className="px-3 py-1.5 bg-glass-bg rounded-xl border border-glass-border group-hover:bg-surface group-hover:border-accent transition-all duration-300">
                         <span className="text-[11px] font-black text-text-1 tracking-wide">
                            {formatPrice(cls.price || '29.99', currency || 'MYR')}
                         </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
