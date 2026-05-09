import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Volume2,
    VolumeX,
    ChevronRight,
    Edit2,
    Trash2,
    Plus,
    Settings,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import Header from '../components/Header';
import { useMerch } from '../hooks/useMerch';
import { useMedia } from '../hooks/useMedia';
import { useUser } from '../hooks/useUser';
import { APP_COPY } from '../config/appCopy';
import { createStripeCheckout } from '../lib/stripe';
import { OptimizedImage } from '../components/PerformanceUI';
import { getMediaAssetUrl } from '../lib/mediaUtils';

const CATEGORIES = ["All", "Cutlery", "Cookware", "Apparel", "Digital"];

const getProductImage = (product, mediaList) =>
    getMediaAssetUrl(product.media_id, mediaList, product.image || '');

const ProductModal = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState(
        product || {
            id: `new-${Date.now()}`,
            title: '',
            price: 0,
            category: 'Cutlery',
            description: '',
            stock: 10,
            featured: false,
            image: '',
            media_id: ''
        }
    );

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0f1423] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl no-scrollbar"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">
                        {product ? 'Edit Equipment' : 'Add Equipment'}
                    </h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Title</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Price ($)</label>
                            <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Stock</label>
                            <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#1a2035] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
                            {CATEGORIES.filter(c => c !== "All").map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Image URL / Media Fallback</label>
                        <input type="url" name="image" value={formData.image} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Description</label>
                        <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none" />
                    </div>

                    <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                        <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 accent-indigo-500" />
                        <div>
                            <span className="block text-xs font-bold text-white">Featured Hero Item</span>
                            <span className="block text-[10px] text-slate-400">Shows in the top rotating carousel</span>
                        </div>
                    </label>

                    <button type="submit" className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs py-3 rounded-lg flex justify-center items-center gap-2 transition-colors">
                        <Save size={16} /> Save Metadata
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const VideoModal = ({ videoData, onClose, onSave }) => {
    const [formData, setFormData] = useState(
        videoData || { title: '', subtitle: '', url: '' }
    );

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0f1423] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Edit Video Asset</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Title</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Subtitle</label>
                        <input required type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-indigo-400 mb-1">Video URL (MP4)</label>
                        <input required type="url" name="url" value={formData.url} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <button type="submit" className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs py-3 rounded-lg flex justify-center items-center gap-2 transition-colors">
                        <Save size={16} /> Save Asset
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const FeaturedHero = ({ products, mediaList, isAdmin }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (products.length <= 1) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % products.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [products.length]);

    if (products.length === 0) {
        return (
            <div className="w-full h-[60vh] md:h-[70vh] bg-white/5 rounded-3xl mb-12 border border-dashed border-white/20 flex flex-col items-center justify-center text-center p-6">
                <ImageIcon size={48} className="text-white/20 mb-4" />
                <p className="text-white font-bold mb-2">No Featured Items</p>
                <p className="text-sm text-white/50 max-w-sm">Mark a product as "Featured Hero Item" to display it here.</p>
            </div>
        );
    }

    const safeIndex = index >= products.length ? 0 : index;
    const currentItem = products[safeIndex];
    const heroImage = getProductImage(currentItem, mediaList);

    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-3xl mb-12 group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {heroImage ? (
                        <img src={heroImage} className="w-full h-full object-cover" alt={currentItem.title} />
                    ) : (
                        <div className="w-full h-full bg-white/10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent" />

                    <div className="absolute bottom-10 left-6 md:left-12 max-w-xl z-10">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                            <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block flex items-center gap-2">
                                Featured Equipment
                                {isAdmin && <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[8px]">Auto-Rotating</span>}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none mb-4">
                                {currentItem.title}
                            </h2>
                            <button
                                onClick={() => document.getElementById(`merch-${currentItem.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                            >
                                View Details <ArrowRight size={14} />
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
                        className={`h-1 transition-all duration-500 rounded-full ${safeIndex === i ? 'w-12 bg-white' : 'w-4 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const SmartVideoSection = ({ videoData, isAdmin, onEdit }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) videoRef.current?.play();
                else videoRef.current?.pause();
            },
            { threshold: 0.5 }
        );
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    if (!videoData?.url && !isAdmin) return null;

    return (
        <div className="mb-32">
            <div className="flex flex-col items-center text-center mb-12">
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
                    Master the <span className="text-indigo-500">Craft</span>
                </h2>
                <p className="text-slate-500 text-xs font-medium max-w-md">Our equipment is used by the world's most demanding culinary professionals.</p>
            </div>

            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden bg-white/5 group border border-white/5">
                {videoData?.url ? (
                    <video
                        ref={videoRef}
                        src={videoData.url}
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <VolumeX size={48} className="text-white/20 mb-4" />
                        <p className="text-white/50 text-sm font-medium">No Video Asset Configured</p>
                    </div>
                )}

                {videoData?.url && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
                            {videoData.subtitle}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-8 max-w-2xl">
                            {videoData.title}
                        </h2>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all bg-black/40 backdrop-blur-md"
                            >
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                {isAdmin && (
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="bg-amber-500 text-black p-3 rounded-xl hover:bg-amber-400 shadow-xl flex items-center gap-2">
                            <Edit2 size={16} /> <span className="text-xs font-bold uppercase">Edit Media</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductCard = ({ product, mediaList, isAdmin, onEdit, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const isSoldOut = product.stock === 0;
    const cardImage = getProductImage(product, mediaList);

    const handleBuy = async () => {
        if (isAdmin) return;
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div layout id={`merch-${product.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-white/5 border border-white/5 group-hover:border-indigo-500/50 transition-colors">
                <OptimizedImage src={cardImage} alt={product.title} aspect="aspect-square" className="transition-transform duration-700 group-hover:scale-110" />

                {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 rounded-md text-[9px] font-black uppercase tracking-tighter text-white shadow-xl">
                        Only {product.stock} Left
                    </div>
                )}

                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/10 px-4 py-2 rounded">Sold Out</span>
                    </div>
                )}

                {isAdmin && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {product.featured && (
                            <span className="absolute top-3 right-3 text-[9px] font-bold bg-indigo-500 px-2 py-1 rounded text-white uppercase">Hero</span>
                        )}
                        <button onClick={() => onEdit(product)} className="bg-white/10 hover:bg-white text-white hover:text-black w-[70%] py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                            <Edit2 size={14} /> Edit Meta
                        </button>
                        <button onClick={() => onDelete(product.id)} className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white w-[70%] py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                            <Trash2 size={14} /> Remove
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{product.title}</h3>
                <span className="text-sm font-black text-indigo-400 ml-2">${product.price}</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4 line-clamp-2">{product.description}</p>

            <button
                disabled={isSoldOut || loading || isAdmin}
                onClick={handleBuy}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : isSoldOut ? 'Restocking' : 'Add to Order'}
            </button>
        </motion.div>
    );
};

export default function Shop() {
    const { publicMerch, addProduct, updateProduct, deleteProduct } = useMerch();
    const { media } = useMedia();
    const { user } = useUser();

    const isAdmin = user?.isGod === true;

    const [videoData, setVideoData] = useState({ title: '', subtitle: '', url: '' });
    const [activeCategory, setActiveCategory] = useState("All");
    const [showSuccess, setShowSuccess] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isEditingVideo, setIsEditingVideo] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            setShowSuccess(true);
            window.history.replaceState({}, document.title, window.location.pathname);
            const timer = setTimeout(() => setShowSuccess(false), 8000);
            return () => clearTimeout(timer);
        }
    }, []);

    const featuredItems = useMemo(() => publicMerch.filter(p => p.featured), [publicMerch]);
    const filteredProducts = useMemo(() => {
        if (activeCategory === "All") return publicMerch;
        return publicMerch.filter(p => p.category === activeCategory);
    }, [activeCategory, publicMerch]);

    const handleSaveProduct = async (productData) => {
        const isNew = !publicMerch.find(p => p.id === productData.id);
        if (isNew) {
            await addProduct(productData);
        } else {
            const { id, ...updates } = productData;
            await updateProduct(id, updates);
        }
        setEditingProduct(null);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Remove this item from the catalogue?")) {
            await deleteProduct(id);
        }
    };

    const handleSaveVideo = (data) => {
        setVideoData(data);
        setIsEditingVideo(false);
    };

    return (
        <div className="min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-32">
            <Header variant="back" title={APP_COPY.navigation.shop} />

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]"
                    >
                        <CheckCircle2 />
                        <div className="flex-1">
                            <p className="text-sm font-bold leading-none">Order Received</p>
                            <p className="text-[10px] opacity-80">Your payment was successful.</p>
                        </div>
                        <X size={16} className="cursor-pointer" onClick={() => setShowSuccess(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingProduct !== null && (
                    <ProductModal
                        product={Object.keys(editingProduct).length === 0 ? null : editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onSave={handleSaveProduct}
                    />
                )}
                {isEditingVideo && (
                    <VideoModal
                        videoData={videoData}
                        onClose={() => setIsEditingVideo(false)}
                        onSave={handleSaveVideo}
                    />
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-4 pt-32 relative">

                <AnimatePresence>
                    {isAdmin && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                            <div>
                                <h3 className="text-amber-500 font-bold flex items-center gap-2"><Settings size={18} /> Admin Mode</h3>
                                <p className="text-xs text-amber-500/70 mt-1">Add, edit, or remove items. Changes sync to Supabase instantly.</p>
                            </div>
                            <button
                                onClick={() => setEditingProduct({})}
                                className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 w-full md:w-auto justify-center transition-colors"
                            >
                                <Plus size={16} /> Add New Equipment
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <FeaturedHero products={featuredItems} mediaList={media} isAdmin={isAdmin} />

                <div className="sticky top-20 z-40 bg-[#070B14]/80 backdrop-blur-md py-6 border-b border-white/5 mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                            Catalogue
                            <span className="text-xs font-medium tracking-normal text-slate-500 bg-white/5 px-2 py-1 rounded-md not-italic">
                                {filteredProducts.length} Items
                            </span>
                        </h2>

                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <ShoppingBag size={48} className="text-white/10 mb-4" />
                        <p className="text-white/50 text-sm">No equipment found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                        <AnimatePresence>
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    mediaList={media}
                                    isAdmin={isAdmin}
                                    onEdit={setEditingProduct}
                                    onDelete={handleDeleteProduct}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <SmartVideoSection
                    videoData={videoData}
                    isAdmin={isAdmin}
                    onEdit={() => setIsEditingVideo(true)}
                />

            </main>

            {!isAdmin && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center gap-8 bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-full shadow-2xl">
                    <button className="text-indigo-500"><ShoppingBag size={20} /></button>
                    <button className="text-white/40"><ChevronRight size={20} /></button>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Store</span>
                </div>
            )}
        </div>
    );
}