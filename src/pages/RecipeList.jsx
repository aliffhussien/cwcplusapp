import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Clock,
    ChevronLeft,
    Filter,
    Star,
    PlayCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';

// --- Components ---

// --- Components ---

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600 blur-[100px]"
        />
    </div>
);

// --- Components ---

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
                    onClick={() => window.location.href = item.type === 'recipe' ? `/recipe/${item.id}` : '/classes'}
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
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.type === 'class' ? 'Featured Class' : 'Featured Recipe'}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] mb-1">
                            {item.title}
                        </h2>
                        <p className="text-slate-300 text-xs md:text-sm font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-3">
                            {item.instructor || item.author || 'Chef Exclusive'}
                        </p>

                        <button 
                            onClick={(e) => { e.stopPropagation(); window.location.href = item.type === 'recipe' ? `/recipe/${item.id}` : '/classes'; }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-md transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.3)] w-max">
                            <PlayCircle size={16} className="text-indigo-400" />
                            <span className="text-xs font-bold text-white">{item.type === 'class' ? 'View Class' : 'Cook Now'}</span>
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

// Horizontal Scrollable Category Pills
const CategoryPills = ({ activeCategory, setActiveCategory }) => {
    const categories = ["All", "Breakfast", "Mains", "Desserts", "Vegan", "Quick 15m"];
    return (
        <div className="-mx-4 px-4 md:mx-0 md:px-0 flex gap-2 overflow-x-auto pb-4 no-scrollbar snap-x">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.4)] ${activeCategory === cat
                            ? 'bg-indigo-500 border border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                            : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

// 2-Column Grid Recipe Card
const RecipeGridItem = ({ id, title, time, rating, image, index }) => {
    const navigate = useNavigate();
    return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate(`/recipe/${id}`)}
        className="card-3d-base rounded-[20px] relative overflow-hidden cursor-pointer group aspect-[4/5] flex flex-col"
    >
        {/* 3/4 Image Fade Setup */}
        <div className="absolute top-0 left-0 right-0 h-[75%] z-0 rounded-t-[20px] overflow-hidden">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent pointer-events-none" />
        </div>

        {/* Glare */}
        <div className="absolute top-0 left-0 right-0 h-[30%] card-3d-glare pointer-events-none z-10" />

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 flex items-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <Star size={8} className="text-amber-400 fill-amber-400" />
            <span className="text-[9px] font-bold text-white">{rating}</span>
        </div>

        {/* Typography Area */}
        <div className="relative z-20 mt-auto p-2.5 pt-0">
            <h4 className="text-[11px] md:text-sm text-white/95 font-bold mb-1 line-clamp-2 leading-snug drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                {title}
            </h4>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-400 text-[9px] md:text-[10px] font-semibold">
                    <Clock size={10} className="text-indigo-400" />
                    <span>{time}</span>
                </div>
            </div>
        </div>
    </motion.div>
    );
};

// --- Main App Layout ---

export default function RecipeList() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get("q") || "";
    
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [activeCategory, setActiveCategory] = useState("All");
    const { publicRecipes } = useRecipes();
    const { publicClasses } = useClasses();

    const featuredItems = [
        ...publicClasses.filter(c => c.isFeatured).map(c => ({ ...c, type: 'class' })),
        ...publicRecipes.filter(r => r.isFeatured).map(r => ({ ...r, type: 'recipe' }))
    ];

    const filteredRecipes = publicRecipes.filter((recipe) => {
        const matchesCategory = activeCategory === "All" || recipe.category === activeCategory;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || 
            recipe.title.toLowerCase().includes(searchLower) || 
            (recipe.author && recipe.author.toLowerCase().includes(searchLower));
        
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-32">
            <AnimatedBackground />
            <Header 
                variant="back" 
                title="Recipes" 
                rightAction={
                    <button 
                        onClick={() => console.log("Open filter modal")}
                        className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]">
                        <Filter size={18} className="text-slate-300" />
                    </button>
                } 
            />

            <main className="relative z-10 pt-20 pb-16 px-4 md:px-10 max-w-7xl mx-auto">

                {/* Search Input (Pinned below header for mobile) */}
                <div className="relative w-full mb-6">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search thousands of recipes..."
                        className="w-full pl-10 pr-4 py-3 text-[13px] md:text-sm bg-[#0F172A]/80 border border-white/10 rounded-[18px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white placeholder-slate-500 hover:bg-[#1E293B]/80 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-xl"
                    />
                </div>

                {/* Hero Section / Ad Banner */}
                {featuredItems.length > 0 && <HeroCarousel items={featuredItems} />}

                {/* Scrollable Categories */}
                <CategoryPills activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

                {/* 2-Column Mobile Grid / 3-Column Tablet / 4-Column Desktop / 5-Column Widescreen */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-6">
                    {filteredRecipes.length > 0 ? (
                        filteredRecipes.map((recipe, index) => (
                            <RecipeGridItem key={recipe.id} index={index} {...recipe} />
                        ))
                    ) : (
                        <div className="col-span-2 md:col-span-3 text-center py-12">
                            <p className="text-slate-400 text-sm md:text-base font-medium">No recipes found matching your criteria.</p>
                            <button 
                                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                                className="mt-4 text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}