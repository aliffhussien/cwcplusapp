import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Flame, ChevronRight, PlayCircle, BookOpen, Calendar as CalendarIcon, ChefHat, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useRecipes } from '../hooks/useRecipes';
import { useUser } from '../hooks/useUser';
import { useAppSettings } from '../hooks/useAppSettings';

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#070B14]">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.2, 0.15] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-600 blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-rose-600 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070B14]/80 to-[#070B14]" />
    </div>
);

// Modern Bento Box Item
const BentoBox = ({ title, subtitle, icon: Icon, image, colSpan, glowColor, delay, onClick }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        whileHover={{ y: -4, scale: 1.02 }} 
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative cursor-pointer group rounded-[32px] overflow-hidden ${colSpan} shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/5`}
    >
        <div className="absolute inset-0 z-0">
            {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70" />
            ) : (
                <div className="w-full h-full bg-slate-900" />
            )}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none`} />
            <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-20 mix-blend-overlay group-hover:opacity-40 transition-opacity duration-500`} />
        </div>

        <div className="absolute top-0 left-0 right-0 h-[30%] card-3d-glare pointer-events-none z-10" />

        <div className="relative z-20 flex items-center h-full p-4 md:p-5 gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform shrink-0">
                <Icon size={24} className="text-white drop-shadow-md" />
            </div>
            <div className="flex flex-col">
                <h3 className="text-lg md:text-xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-0.5">
                    {title}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-300 font-bold uppercase tracking-widest opacity-90 drop-shadow-md">
                    {subtitle}
                </p>
            </div>
        </div>
    </motion.div>
);

const TrendingCard = ({ recipe, index, onClick }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
        onClick={onClick}
        className="min-w-[240px] lg:w-full card-3d-base rounded-[28px] overflow-hidden cursor-pointer group snap-start shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
    >
        <div className="w-full h-40 md:h-48 relative overflow-hidden">
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" /> {recipe.difficulty || 'Pro'}
            </div>
        </div>
        <div className="p-4 relative z-10 bg-slate-900/50 backdrop-blur-xl border-t border-white/5">
            <h4 className="text-sm md:text-base text-white font-black mb-1.5 truncate group-hover:text-indigo-400 transition-colors">
                {recipe.title}
            </h4>
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">{recipe.time || '45m'} • {recipe.category || 'Mains'}</p>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors border border-white/10 shadow-lg">
                    <ChevronRight size={16} className="text-white" />
                </div>
            </div>
        </div>
    </motion.div>
);

export default function Home() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const { publicRecipes } = useRecipes();
    const { user } = useUser();

    const userName = user?.name && user.name !== 'Chef' ? user.name : 'Chef';

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-32 overflow-x-hidden">
            <AnimatedBackground />
            <Header variant="home" />

            <main className="relative z-10 pt-24 pb-16 px-4 md:px-10 max-w-7xl mx-auto">
                
                {/* Immersive Welcome Hero */}
                <section className="mb-10 lg:mb-16 mt-4 md:mt-8">
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                            Ready to cook, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">{userName}?</span>
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base lg:text-lg font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-8 md:mb-12 max-w-xl">
                            Dive into exclusive masterclasses, organize your week, and discover your next favorite recipe.
                        </p>

                        <div className="relative max-w-xl group">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative flex items-center bg-[#0F172A]/80 border border-white/10 rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all focus-within:border-indigo-500/50 focus-within:bg-[#0F172A]">
                                <Search size={22} className="ml-6 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search thousands of recipes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/recipes?q=${encodeURIComponent(searchQuery)}`)}
                                    className="w-full bg-transparent border-none outline-none py-4 md:py-5 px-5 text-sm md:text-base font-bold text-white placeholder-slate-500" 
                                />
                                <button 
                                    onClick={() => navigate(`/recipes?q=${encodeURIComponent(searchQuery)}`)}
                                    className="mr-3 p-2 md:p-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full transition-colors shadow-lg"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Bento Grid - Quick Links */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-12 lg:mb-20">
                    <BentoBox 
                        title="The Library" 
                        subtitle="Explore Recipes" 
                        icon={BookOpen}
                        image="/library_hero.png"
                        colSpan="col-span-1"
                        glowColor="from-indigo-500 to-blue-500"
                        delay={0.1}
                        onClick={() => navigate('/recipes')}
                    />
                    <BentoBox 
                        title="Masterclasses" 
                        subtitle="Learn from Pros" 
                        icon={PlayCircle}
                        image="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800"
                        colSpan="col-span-1"
                        glowColor="from-rose-500 to-orange-500"
                        delay={0.2}
                        onClick={() => navigate('/classes')}
                    />
                    <BentoBox 
                        title="Meal Planner" 
                        subtitle="Organize Week" 
                        icon={CalendarIcon}
                        image="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800"
                        colSpan="col-span-1"
                        glowColor="from-emerald-500 to-teal-500"
                        delay={0.3}
                        onClick={() => navigate('/planner')}
                    />
                </section>

                {/* Trending Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-[0_4px_12px_rgba(244,63,94,0.4)]">
                                <Flame size={20} className="text-white" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Trending Weekly</h2>
                        </div>
                        <button onClick={() => navigate('/recipes')} className="text-indigo-400 text-xs md:text-sm font-bold flex items-center hover:text-indigo-300 transition-colors group px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full shadow-lg">
                            View All <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="-mx-4 px-4 md:mx-0 md:px-0 flex lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 overflow-x-auto lg:overflow-visible pb-8 lg:pb-0 no-scrollbar snap-x snap-mandatory">
                        {publicRecipes.slice(0, 5).map((recipe, index) => (
                            <TrendingCard 
                                key={recipe.id} 
                                recipe={recipe} 
                                index={index} 
                                onClick={() => navigate(`/recipe/${recipe.id}`)} 
                            />
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}