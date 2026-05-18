import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, ChefHat, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMediaAssetUrl } from '../lib/mediaUtils';

interface RecipeCardProps {
    id: string;
    title: string;
    time?: string;
    rating?: number | string;
    image?: string;
    index: number;
    cover_image_id?: string;
    mediaList: any[];
    volume?: string;
    isAdmin?: boolean;
}

export default function RecipeCard({ id, title, time, rating, image, index, cover_image_id, mediaList, volume, isAdmin }: RecipeCardProps) {
    const navigate = useNavigate();
    const cardImage = getMediaAssetUrl(cover_image_id, mediaList, image as any);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: (index % 10) * 0.02 }}
            onClick={() => navigate(`/recipe/${id}`)}
            className="group cursor-pointer flex flex-col"
        >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-3 bg-glass-bg border border-glass-border shadow-xl">
                {cardImage ? (
                    <img src={cardImage} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full bg-glass-bg flex items-center justify-center"><ChefHat className="text-text-3" size={24} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent opacity-60" />
                <div className="absolute top-3 left-3">
                    {volume && (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-accent/90 backdrop-blur-md text-text-1 px-2 py-1 rounded-md shadow-md">
                            {volume}
                        </span>
                    )}
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-base/60 backdrop-blur-md border border-glass-border px-2 py-1 rounded-lg">
                    <Star size={8} className="text-accent fill-accent" />
                    <span className="text-[9px] font-black text-text-1">{rating || '4.9'}</span>
                </div>
                {isAdmin && (
                    <div className="absolute top-3 right-3 z-20">
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/recipe/${id}?edit=true`); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-text-1 text-base text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl hover:bg-accent hover:text-text-1 transition-all active:scale-95"
                        >
                            <Edit2 size={10} /> Edit
                        </button>
                    </div>
                )}
            </div>
            <div className="px-1 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-black uppercase italic tracking-tight text-text-1 group-hover:text-accent transition-colors line-clamp-2 leading-tight">{title}</h4>
                <div className="flex items-center gap-1.5 text-text-3 text-[9px] font-bold mt-2 uppercase tracking-widest">
                    <Clock size={10} className="text-accent" />
                    <span>{time}</span>
                </div>
            </div>
        </motion.div>
    );
}
