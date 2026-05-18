import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { getMediaAssetUrl } from '../lib/mediaUtils';

interface ShopHeroProps {
    products: any[];
    mediaList: any[];
    isAdmin: boolean;
}

export default function ShopHero({ products, mediaList, isAdmin }: ShopHeroProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (products.length <= 1) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % products.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [products.length]);

    if (products.length === 0) {
        return (
            <div className="w-full h-[40vh] bg-glass-bg border border-dashed border-glass-border rounded-[2.5rem] mb-12 flex flex-col items-center justify-center text-center p-8">
                <ImageIcon size={40} className="text-text-3/50 mb-4" />
                <p className="section-label">No Featured Content</p>
            </div>
        );
    }

    const safeIndex = index >= products.length ? 0 : index;
    const currentItem = products[safeIndex];
    const heroImage = getMediaAssetUrl(currentItem.media_id, mediaList, currentItem.image || '');

    return (
        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-[2.5rem] mb-12 group shadow-2xl border border-glass-border">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {heroImage ? (
                        <img src={heroImage} className="w-full h-full object-cover" alt={currentItem.title} />
                    ) : (
                        <div className="w-full h-full bg-glass-bg" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />

                    <div className="absolute bottom-10 left-6 md:left-12 max-w-2xl z-10">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-accent text-text-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Featured Gear</span>
                                {isAdmin && <span className="bg-glass-bg backdrop-blur-md text-text-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase border border-glass-border">Admin View</span>}
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-text-1 uppercase leading-[0.9] mb-6 drop-shadow-2xl">
                                {currentItem.title}
                            </h2>
                            <button
                                onClick={() => document.getElementById(`merch-${currentItem.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                className="flex items-center gap-3 bg-text-1 text-base px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                            >
                                Secure Now <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-10 right-6 md:right-12 flex gap-2 z-20">
                {products.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 transition-all duration-500 rounded-full ${safeIndex === i ? 'w-8 bg-accent' : 'w-2 bg-glass-border'}`}
                    />
                ))}
            </div>
        </div>
    );
}
