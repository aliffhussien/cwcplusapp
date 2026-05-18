import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { CheckCircle2, X, Plus } from 'lucide-react';
import Header from './Header';
import ShopCard from './ShopCard';
import ShopHero from './ShopHero';
import ShopCinema from './ShopCinema';
import ProductModal from './admin/ProductModal';
import VideoModal from './admin/VideoModal';
import { useMerch } from '../hooks/useMerch';
import { useMedia } from '../hooks/useMedia';
import { useUser } from '../hooks/useUser';
import { APP_COPY } from '../config/appCopy';
import { useAppSettings } from '../hooks/useAppSettings';

const CATEGORIES = ["All", "Cutlery", "Cookware", "Apparel", "Digital"];

export default function Shop() {
    const { publicMerch, addProduct, updateProduct, deleteProduct } = useMerch();
    const { media } = useMedia();
    const { user } = useUser();
    const { settings } = useAppSettings();
    const isAdmin = user?.isGod;
    const currency = settings.currency || 'MYR';

    const [videoData, setVideoData] = useState({ title: '', subtitle: '', url: '' });
    const [activeCategory, setActiveCategory] = useState("All");
    const [showSuccess, setShowSuccess] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isEditingVideo, setIsEditingVideo] = useState(false);

    const [showHeader, setShowHeader] = useState(true);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest: number) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 120) setShowHeader(false);
        else setShowHeader(true);
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            setShowSuccess(true);
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, []);

    const featuredItems = useMemo(() => (publicMerch || []).filter((p: any) => p.featured), [publicMerch]);
    const filteredProducts = useMemo(() =>
        activeCategory === "All" ? (publicMerch || []) : (publicMerch || []).filter((p: any) => p.category === activeCategory),
        [activeCategory, publicMerch]
    );

    const handleSaveProduct = async (productData: any) => {
        const isNew = !(publicMerch || []).find((p: any) => p.id === productData.id);
        isNew ? await addProduct(productData) : await updateProduct(productData.id, productData);
        setEditingProduct(null);
    };

    return (
        <div className="min-h-screen bg-base text-text-1 selection:bg-accent/30 pb-[env(safe-area-inset-bottom,32px)] overflow-x-hidden">
            <motion.div 
                animate={{ y: showHeader ? 0 : -110 }} 
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
                className="fixed top-0 left-0 right-0 z-[100] pt-[env(safe-area-inset-top,0px)] bg-base/90 backdrop-blur-2xl border-b border-glass-border"
            >
                <Header variant="back" title={APP_COPY.navigation.shop} isStatic />
            </motion.div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-[env(safe-area-inset-top,24px)] left-4 right-4 z-[120] bg-accent p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <CheckCircle2 className="shrink-0" />
                        <div className="flex-1"><p className="text-[10px] font-black uppercase tracking-widest text-text-1">Order Confirmed</p></div>
                        <X size={16} className="cursor-pointer opacity-50" onClick={() => setShowSuccess(false)} />
                    </motion.div>
                )}
                {editingProduct !== null && (
                    <ProductModal product={Object.keys(editingProduct).length === 0 ? null : editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSaveProduct} />
                )}
                {isEditingVideo && (
                    <VideoModal videoData={videoData} onClose={() => setIsEditingVideo(false)} onSave={(data) => { setVideoData(data); setIsEditingVideo(false); }} />
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-6 pt-24">
                <div className="flex justify-between items-end mb-6">
                    <div><h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">THE <span className="text-accent">EQUIP</span></h1></div>
                    {isAdmin && (
                        <button onClick={() => setEditingProduct({})} className="bg-accent/10 border border-accent/20 text-accent p-2.5 rounded-xl active:scale-95 transition-transform"><Plus size={16} /></button>
                    )}
                </div>

                <ShopHero products={featuredItems} mediaList={media} isAdmin={isAdmin || false} />

                <motion.div
                    animate={{ top: showHeader ? 68 : 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="sticky z-40 bg-base/95 backdrop-blur-2xl -mx-6 px-6 py-4 border-b border-glass-border mb-12 shadow-2xl"
                >
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`snap-start px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-text-1 text-base border-text-1 shadow-lg' : 'bg-glass-bg text-text-3 border-glass-border'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
                    <AnimatePresence>
                        {(filteredProducts || []).map((product: any) => (
                            <ShopCard key={product.id} product={product} mediaList={media} isAdmin={isAdmin || false} currency={currency} onEdit={setEditingProduct} onDelete={(id) => window.confirm("Delete item?") && deleteProduct(id)} />
                        ))}
                    </AnimatePresence>
                </div>

                <ShopCinema videoData={videoData} isAdmin={isAdmin || false} onEdit={() => setIsEditingVideo(true)} />
            </main>
        </div>
    );
}
