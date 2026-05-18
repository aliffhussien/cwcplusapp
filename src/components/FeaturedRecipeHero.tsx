import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMediaAssetUrl } from '../lib/mediaUtils';

interface FeaturedRecipeHeroProps {
    recipes: any[];
    mediaList: any[];
}

export default function FeaturedRecipeHero({ recipes, mediaList }: FeaturedRecipeHeroProps) {
    const [index, setIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!recipes || recipes.length <= 1) return;
        const timer = setInterval(() => setIndex((prev) => (prev + 1) % recipes.length), 6000);
        return () => clearInterval(timer);
    }, [recipes]);

    if (!recipes || recipes.length === 0) return null;

    const currentRecipe = recipes[index];
    const heroImage = getMediaAssetUrl(currentRecipe.cover_image_id, mediaList, currentRecipe.image);

    return (
        <section
            className="relative h-[45vh] md:h-[50vh] flex items-end overflow-hidden cursor-pointer group"
            onClick={() => navigate(`/recipe/${currentRecipe.id}`)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentRecipe.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 z-0 bg-base"
                >
                    {heroImage ? (
                        <img src={heroImage} alt={currentRecipe.title} className="w-full h-full object-cover opacity-60 transition-transform duration-[4s] group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full bg-glass-bg flex items-center justify-center"><ChefHat className="text-text-3" size={48} /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-accent text-text-1 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">Featured</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-3">{currentRecipe.category || 'Signature'}</span>
                </div>

                <div className="flex justify-between items-end gap-4">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-text-1 leading-none drop-shadow-2xl line-clamp-2 max-w-[80%]">
                        {currentRecipe.title}
                    </h1>
                    <div className="flex gap-1.5 pb-2">
                        {recipes.map((_, i) => (
                            <button key={i} onClick={(e) => { e.stopPropagation(); setIndex(i); }} className={`h-1.5 transition-all duration-500 rounded-full ${index === i ? 'w-6 bg-accent' : 'w-1.5 bg-text-1/30'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
