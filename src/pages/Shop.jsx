import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Info, PlayCircle } from 'lucide-react';
import Header from '../components/Header';
import { useMerch } from '../hooks/useMerch';
import { useAppSettings } from '../hooks/useAppSettings';
import { createStripeCheckout } from '../lib/stripe';

const AnimatedBackground = ({ settings }) => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#070B14]">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px]" style={{ backgroundColor: settings.accentColor || '#4f46e5' }} />
    </div>
);

// Featured Hero Carousel
const HeroCarousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!items || items.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [items]);

    if (!items || items.length === 0) return null;

    const item = items[currentIndex];
    
    return (
        <div className="relative w-full h-64 md:h-80 card-3d-base rounded-[24px] overflow-hidden group mb-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => {
                        const target = document.getElementById(`merch-${item.id}`);
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                >
                    <div className="absolute inset-0 z-0">
                        {item.video ? (
                            <video src={item.video} poster={item.image} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <img
                                src={item.image || "https://images.unsplash.com/photo-1544025162-811114bd3118?auto=format&fit=crop&q=80&w=1200"}
                                alt={item.title}
                                className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/60 to-transparent" />
                    </div>

                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-rose-500/90 backdrop-blur-md rounded-lg border border-rose-400/40 shadow-[0_4px_12px_rgba(244,63,94,0.5)] flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Featured Gear</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] mb-1">
                            {item.title}
                        </h2>
                        <p className="text-slate-300 text-xs md:text-sm font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-3 line-clamp-2 max-w-lg">
                            {item.description || 'Exclusive Item'}
                        </p>

                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                const target = document.getElementById(`merch-${item.id}`);
                                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-md transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.3)] w-max">
                            <PlayCircle size={16} className="text-indigo-400" />
                            <span className="text-xs font-bold text-white">Shop Now</span>
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
            
            {items.length > 1 && (
                <div className="absolute bottom-4 right-4 z-30 flex gap-2">
                    {items.map((_, idx) => (
                        <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-rose-500 w-4' : 'bg-white/30'}`} />
                    ))}
                </div>
            )}
        </div>
    );
};

const MerchCard = ({ product }) => {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleBuy = async () => {
        setIsLoading(true);
        try {
            const checkoutUrl = await createStripeCheckout(
                product.price,
                'USD',
                `MERCH-${product.id}-${Date.now()}`,
                `${window.location.origin}/shop?payment=success`
            );
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            }
        } catch (error) {
            console.error("Payment failed", error);
            alert("Unable to initiate payment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            id={`merch-${product.id}`}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            whileHover={{ y: -4 }}
            className="card-3d-base rounded-[24px] overflow-hidden group cursor-pointer flex flex-col"
        >
            <div className="aspect-square relative overflow-hidden bg-white/5">
                {product.image ? (
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={48} className="text-white/10" />
                    </div>
                )}
                
                {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500/90 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                        Only {product.stock} Left
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-rose-500/90 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                        Out of Stock
                    </div>
                )}
                
                {/* Dark fade at bottom of image for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent opacity-80" />
            </div>
            
            <div className="p-5 flex flex-col flex-1 relative z-10 bg-[#0F172A]">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm md:text-base font-bold text-white leading-tight line-clamp-2">{product.title}</h3>
                    <span className="text-sm font-extrabold text-indigo-400 shrink-0">${product.price}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">{product.description}</p>
                
                <button 
                    disabled={product.stock === 0 || isLoading}
                    onClick={handleBuy}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                        product.stock === 0 || isLoading
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                        : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                    }`}
                >
                    {isLoading ? 'Processing...' : product.stock === 0 ? 'Sold Out' : 'Buy with Stripe'}
                </button>
            </div>
        </motion.div>
    );
};

export default function Shop() {
    const { publicMerch } = useMerch();
    const { settings } = useAppSettings();
    
    // Check for payment success redirect
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            alert('Payment successful! Your order is confirmed.');
            // remove query param
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-32">
            <AnimatedBackground settings={settings} />
            <Header variant="home" />

            <main className="relative z-10 pt-24 px-4 md:px-10 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">CWC+ Merchandise</h1>
                        <p className="text-sm text-slate-400">Exclusive gear and tools for premium chefs.</p>
                    </div>
                </div>

                {publicMerch.length > 0 && (
                    <HeroCarousel items={publicMerch.slice(0, 3)} />
                )}

                {publicMerch.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[32px]">
                        <ShoppingBag size={48} className="mx-auto text-white/20 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Shop is Empty</h3>
                        <p className="text-sm text-slate-400">We're restocking! Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {publicMerch.map(product => (
                            <MerchCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
