import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, ChefHat } from 'lucide-react';

interface ProfileRecipeCardProps {
    id: string | number;
    title: string;
    time: string;
    rating: string | number;
    image: string | null;
    index: number;
}

export default function ProfileRecipeCard({ id, title, time, rating, image, index }: ProfileRecipeCardProps) {
    const navigate = useNavigate();
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/recipe/${id}`)}
            className="group relative bg-glass-bg border border-glass-border rounded-2xl overflow-hidden cursor-pointer hover:border-border transition-all active:scale-95"
        >
            <div className="aspect-square overflow-hidden relative">
                {image ? (
                    <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full bg-glass-bg flex items-center justify-center">
                        <ChefHat className="text-text-3" size={24} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-base/60 backdrop-blur-md rounded-lg border border-glass-border flex items-center gap-1">
                    <Star size={8} className="text-accent fill-accent" />
                    <span className="text-[8px] font-black text-text-1">{rating}</span>
                </div>
            </div>
            <div className="p-2.5">
                <h4 className="text-[10px] font-black uppercase italic tracking-tight text-text-1 group-hover:text-accent transition-colors truncate">{title}</h4>
                <div className="flex items-center gap-1.5 text-text-3 text-[8px] font-bold mt-1 uppercase tracking-widest">
                    <Clock size={10} className="text-accent" />
                    <span>{time}</span>
                </div>
            </div>
        </motion.div>
    );
}
