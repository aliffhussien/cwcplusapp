import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { OptimizedImage } from './PerformanceUI';
import { formatPrice } from '../lib/currency';
import { createStripeCheckout } from '../lib/stripe';
import { getMediaAssetUrl } from '../lib/mediaUtils';

interface ShopCardProps {
    product: any;
    mediaList: any[];
    isAdmin: boolean;
    onEdit: (product: any) => void;
    onDelete: (id: string) => void;
    currency: string;
}

export default function ShopCard({ product, mediaList, isAdmin, onEdit, onDelete, currency }: ShopCardProps) {
    const [loading, setLoading] = useState(false);
    const cardImage = getMediaAssetUrl(product.media_id, mediaList, product.image || '');
    const isSoldOut = product.stock === 0;

    const handleBuy = async () => {
        if (isAdmin) return;
        setLoading(true);
        try {
            const checkoutUrl = await createStripeCheckout(
                product.price,
                currency || 'MYR',
                `MERCH-${product.id}-${Date.now()}`,
                `${window.location.origin}/shop?payment=success`,
                product.title
            );
            if (checkoutUrl) window.location.href = checkoutUrl;
        } catch (error) {
            console.error("Checkout failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div layout id={`merch-${product.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group flex flex-col">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 bg-glass-bg border border-glass-border group-hover:border-accent/40 transition-all duration-500 shadow-xl">
                <OptimizedImage src={cardImage} alt={product.title} aspect="aspect-[4/5]" className="transition-transform duration-[1.5s] group-hover:scale-110" />

                {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-warning rounded-lg text-[8px] font-black uppercase tracking-widest text-text-1 shadow-xl z-10">
                        Only {product.stock} Left
                    </div>
                )}

                {isSoldOut && (
                    <div className="absolute inset-0 bg-base/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-3 border border-glass-border px-4 py-2 rounded-full">Sold Out</span>
                    </div>
                )}

                {isAdmin && (
                    <div className="absolute inset-0 bg-base/80 backdrop-blur-md flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button onClick={() => onEdit(product)} className="w-[80%] bg-text-1 text-base py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2"><Edit2 size={12} /> Edit</button>
                        <button onClick={() => onDelete(product.id)} className="w-[80%] bg-danger/10 text-danger py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-danger hover:text-text-1 transition-all flex items-center justify-center gap-2"><Trash2 size={12} /> Remove</button>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-start px-1 mb-3 flex-1">
                <div>
                    <h3 className="text-xs font-black uppercase italic tracking-tight text-text-1 group-hover:text-accent transition-colors line-clamp-1">{product.title}</h3>
                    <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest mt-1 line-clamp-1">{product.description}</p>
                </div>
                <span className="text-[11px] font-black text-accent ml-2">{formatPrice(product.price, currency)}</span>
            </div>

            <button
                disabled={isSoldOut || loading || isAdmin}
                onClick={handleBuy}
                className="w-full py-3.5 bg-glass-bg border border-glass-border rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-text-1 hover:text-base transition-all disabled:opacity-30 flex items-center justify-center gap-2 active:scale-95"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : isSoldOut ? 'Restocking' : 'Acquire'}
            </button>
        </motion.div>
    );
}
