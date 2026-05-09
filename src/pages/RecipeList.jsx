import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Star, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useRecipes } from '../hooks/useRecipes';
import { useMedia } from '../hooks/useMedia';
import { useAppSettings } from '../hooks/useAppSettings';
import { APP_COPY } from '../config/appCopy';
import { getMediaAssetUrl } from '../lib/mediaUtils';

const RecipeCard = ({ id, title, time, rating, image, index, cover_image_id, mediaList, volume }) => {
    const navigate = useNavigate();
    const cardImage = getMediaAssetUrl(cover_image_id, mediaList, image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 30,
                delay: (index % 20) * 0.02 
            }}
            onClick={() => navigate(`/recipe/${id}`)}
            className="group cursor-pointer"
        >
            <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative bg-[#0a0f1d] border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                {cardImage ? (
                    <motion.img
                        src={cardImage}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center"><ChefHat className="text-slate-700" size={24}/></div>
                )}
                {volume && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-20">
                        <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">{volume}</span>
                    </div>
                )}
                <div className="absolute bottom-3 right-3 z-20 flex gap-2">
                    <div className="flex items-center gap-1 text-[9px] text-amber-400 font-bold bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg">
                        <Star size={10} className="fill-current" />
                        <span>{rating || '4.9'}</span>
                    </div>
                </div>
            </div>
            <div className="px-1">
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 tracking-tight mb-2 uppercase">{title}</h4>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        <Clock size={10} className="text-indigo-500" />
                        <span>{time}</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-800 rounded-full" />
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Premium Recipe</span>
                </div>
            </div>
        </motion.div>
    );
};

export default function RecipeList() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get("q") || "";
    const initialVolume = queryParams.get("v") || "All";

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeVolume, setActiveVolume] = useState(initialVolume);
    const [visibleCount, setVisibleCount] = useState(20);

    const { publicRecipes, isLoading } = useRecipes();
    const { media } = useMedia();
    const { settings } = useAppSettings();

    const categories = ["All", "Breakfast", "Mains", "Desserts", "Vegan", "Quick 15m"];
    
    const volumes = useMemo(() => {
        const fromSettings = settings.volumes?.map(v => v.name) || [];
        const fromRecipes = [...new Set((publicRecipes || []).map(r => r.volume))].filter(Boolean);
        return ["All", ...new Set([...fromSettings, ...fromRecipes])];
    }, [settings.volumes, publicRecipes]);

    const filteredRecipes = useMemo(() => (publicRecipes || []).filter((recipe) => {
        if (!recipe) return false;
        
        const matchesCategory = activeCategory === "All" || recipe.category === activeCategory;
        const matchesVolume = activeVolume === "All" || recipe.volume === activeVolume;
        
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (recipe.title || "").toLowerCase().includes(searchLower) ||
            (recipe.author && recipe.author.toLowerCase().includes(searchLower));

        return matchesCategory && matchesVolume && matchesSearch;
    }), [publicRecipes, activeCategory, activeVolume, searchQuery]);

    const handleVolumeSelect = (vol) => {
        setActiveVolume(vol);
        setVisibleCount(20);
        const url = new URL(window.location);
        if (vol === "All") url.searchParams.delete("v");
        else url.searchParams.set("v", vol);
        window.history.pushState({}, '', url);
    };

    return (
        <div className="min-h-screen bg-[#070B14] text-white pb-32 relative overflow-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[60rem] h-[60rem] bg-indigo-900/10 rounded-full blur-[120px]"
                />
            </div>

            <div className="relative z-10">
                <Header variant="back" title={APP_COPY.navigation.library} />

                <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex flex-col gap-2 px-1">
                            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
                                Recipe <span className="text-indigo-500">Vault</span>
                            </h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Explore our signature methods</p>
                        </div>
                        
                        <div className="relative w-full md:max-w-md group">
                            <div className="absolute -inset-0.5 bg-indigo-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                            <div className="relative flex items-center bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1 backdrop-blur-xl transition-all duration-300">
                                <Search size={16} className="ml-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={APP_COPY.hero.searchPlaceholder}
                                    className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-xs font-bold text-white placeholder-slate-600 uppercase tracking-widest"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center">
                        <div className="relative group w-full md:w-48 shrink-0">
                            <select 
                                value={activeVolume}
                                onChange={(e) => handleVolumeSelect(e.target.value)}
                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest text-indigo-400 appearance-none focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                            >
                                {volumes.map(vol => (
                                    <option key={vol} value={vol} className="bg-[#070B14] text-slate-300 font-bold">{vol}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-indigo-400 transition-colors">
                                <ChevronDown size={14} />
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                            {categories.map((cat) => (
                                <motion.button
                                    key={cat}
                                    layout
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap border ${activeCategory === cat
                                        ? 'bg-white border-white text-[#070B14] shadow-lg shadow-white/5'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="fluid-grid !px-0 relative min-h-[500px]">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {isLoading ? (
                                <motion.div 
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center z-20"
                                >
                                    <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                                    <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em]">Loading Library</p>
                                </motion.div>
                            ) : filteredRecipes.length > 0 ? (
                                filteredRecipes.slice(0, visibleCount).map((recipe, index) => (
                                    <RecipeCard 
                                        key={recipe.id || index} 
                                        index={index} 
                                        {...recipe} 
                                        mediaList={media} 
                                    />
                                ))
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="col-span-full py-32 text-center bg-white/[0.01] border border-white/[0.05] rounded-[32px]"
                                >
                                    <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search size={24} className="text-slate-700" />
                                    </div>
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{APP_COPY.uiElements.emptySearch}</h3>
                                    <button
                                        onClick={() => { setSearchQuery(""); setActiveCategory("All"); setActiveVolume("All"); }}
                                        className="mt-8 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-[0.3em] transition-colors"
                                    >
                                        Reset Search
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {filteredRecipes.length > visibleCount && (
                        <div className="flex justify-center mt-20 mb-8">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 20)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-10 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
