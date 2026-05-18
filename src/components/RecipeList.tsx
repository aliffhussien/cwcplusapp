import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FeaturedRecipeHero from './FeaturedRecipeHero';
import RecipeCard from './RecipeCard';
import { useRecipes } from '../hooks/useRecipes';
import { useMedia } from '../hooks/useMedia';
import { APP_COPY } from '../config/appCopy';
import { useUser } from '../hooks/useUser';

export default function RecipeList() {
    const navigate = useNavigate();
    const { publicRecipes, isLoading } = useRecipes();
    const { media } = useMedia();
    const { user } = useUser();
    const isAdmin = user?.isGod;

    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [visibleCount, setVisibleCount] = useState(20);
    const [showHeader, setShowHeader] = useState(true);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        setShowHeader(!(latest > previous && latest > 120));
    });

    const categories = ["All", "Breakfast", "Mains", "Desserts", "Vegan", "Quick 15m"];

    const featuredRecipes = useMemo(() => {
        const featured = (publicRecipes || []).filter((r: any) => r.featured);
        return featured.length > 0 ? featured : (publicRecipes || []).slice(0, 5);
    }, [publicRecipes]);

    const filteredRecipes = useMemo(() => (publicRecipes || []).filter((recipe: any) => {
        const matchesCategory = activeCategory === "All" || recipe?.category === activeCategory;
        const matchesSearch = !searchQuery || recipe?.title?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    }), [publicRecipes, activeCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-base text-text-1 selection:bg-accent/30 overflow-x-hidden pb-[env(safe-area-inset-bottom,32px)]">
            <motion.div 
                animate={{ y: showHeader ? 0 : -110 }} 
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
                className="fixed top-0 left-0 right-0 z-[100] pt-[env(safe-area-inset-top,0px)] bg-base/90 backdrop-blur-2xl border-b border-border"
            >
                <Header variant="back" title={APP_COPY.navigation.library} isStatic />
            </motion.div>

            <FeaturedRecipeHero recipes={featuredRecipes} mediaList={media} />

            <main className="max-w-7xl mx-auto px-6 mt-8 pb-20">
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">THE <span className="text-accent">VAULT</span></h2>
                            <p className="text-[9px] text-text-3 font-black uppercase tracking-[0.4em] mt-1">ALL RECIPES</p>
                        </div>
                        {isAdmin && (
                            <button onClick={() => navigate('/admin?tab=recipes&create=true')} className="bg-accent/10 border border-accent/20 text-accent p-2.5 rounded-xl active:scale-95 transition-transform shadow-xl">
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-3"><Search size={14} /></div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH COLLECTION..."
                            className="w-full bg-surface border border-glass-border rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent transition-colors"
                        />
                    </div>
                </div>

                <motion.div
                    animate={{ top: showHeader ? 68 : 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="sticky z-40 bg-base/95 backdrop-blur-2xl -mx-6 px-6 py-4 border-b border-border mb-10 shadow-2xl"
                >
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                        {categories.map((cat) => (
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

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                        <p className="section-label">Syncing Vault...</p>
                    </div>
                ) : filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 min-h-[400px]">
                        <AnimatePresence mode="popLayout">
                            {filteredRecipes.slice(0, visibleCount).map((recipe: any, index: number) => (
                                <RecipeCard key={recipe.id} index={index} {...recipe} mediaList={media} isAdmin={isAdmin} />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-20 h-20 bg-glass-bg rounded-[2.5rem] flex items-center justify-center mb-6 border border-glass-border">
                            <Search size={32} className="text-text-3" />
                        </div>
                        <p className="text-sm font-black uppercase italic text-text-3 mb-2">No Recipes Found</p>
                    </div>
                )}

                {(filteredRecipes || []).length > visibleCount && (
                    <div className="flex justify-center mt-16">
                        <button onClick={() => setVisibleCount(p => p + 20)} className="bg-glass-bg border border-glass-border px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-text-1 hover:text-base transition-all active:scale-95">
                            Load More
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
