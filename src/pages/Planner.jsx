import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, ChevronRight, ChevronLeft, X, Search, ChefHat, Trash2, ArrowRight, Wand2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useRecipes } from '../hooks/useRecipes';
import { usePlanner } from '../hooks/usePlanner';
import { useUser } from '../hooks/useUser';
import AuthModal from '../components/AuthModal';

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.08, 0.12, 0.08] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-emerald-600 blur-[100px]" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.08, 0.05] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600 blur-[120px]" />
    </div>
);

const getWeekDates = (baseDate) => {
    const dates = [];
    const d = new Date(baseDate);
    const day = d.getDay() || 7; 
    d.setDate(d.getDate() - day + 1);
    for (let i = 0; i < 7; i++) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return dates;
};

const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const RecipePickerModal = ({ isOpen, onClose, onSelect, recipes }) => {
    const [search, setSearch] = useState('');
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-sm" onClick={onClose} />
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-black text-white">Select a Recipe</h3>
                            <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full"><X size={20}/></button>
                        </div>
                        <div className="p-4 border-b border-slate-800 relative">
                            <Search size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="text" placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-full pl-12 pr-4 py-3 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {filtered.map(r => (
                                <div key={r.id} onClick={() => onSelect(r.id)} className="flex items-center gap-4 p-3 bg-slate-950/50 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 rounded-2xl cursor-pointer transition-all group">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                                        {r.image ? <img src={r.image} className="w-full h-full object-cover" /> : <ChefHat className="m-auto mt-3 text-slate-600"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{r.title}</h4>
                                        <div className="text-xs font-medium text-slate-500 flex gap-2">
                                            <span>{r.category || 'Mains'}</span>•<span>{r.time || '30m'}</span>
                                        </div>
                                    </div>
                                    <Plus size={20} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="text-center py-10 text-slate-500 font-medium">No recipes found.</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const MealSlot = ({ type, meal, onAdd, onRemove }) => (
    <div className="relative group mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 p-5 rounded-3xl overflow-hidden transition-all shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${meal ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-700'}`} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{type}</span>
                </div>
                {!meal ? (
                    <button onClick={onAdd} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors shadow-lg">
                        <Plus size={16} />
                    </button>
                ) : (
                    <button onClick={onRemove} className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
            
            {meal ? (
                <Link to={`/recipe/${meal.id}`} className="flex items-center gap-4 block group/link cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                        {meal.image ? (
                            <img src={meal.image} alt={meal.title} className="w-full h-full object-cover group-hover/link:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center"><ChefHat className="text-slate-600"/></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-base font-black text-white mb-1 truncate group-hover/link:text-emerald-400 transition-colors">{meal.title}</h4>
                        <p className="text-xs font-bold text-slate-400">{meal.time || '30 mins'} • {meal.difficulty || 'Beginner'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center opacity-0 group-hover/link:opacity-100 transition-opacity -ml-4 group-hover/link:ml-0 group-hover/link:bg-emerald-500">
                        <ArrowRight size={16} className="text-white" />
                    </div>
                </Link>
            ) : (
                <div onClick={onAdd} className="h-16 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/50 cursor-pointer hover:bg-slate-800/50 hover:border-slate-700 transition-colors group/empty">
                    <span className="text-sm font-bold text-slate-500 group-hover/empty:text-white transition-colors">Tap to choose a recipe</span>
                </div>
            )}
        </div>
    </div>
);

export default function Planner() {
    const { session } = useUser();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [baseDate, setBaseDate] = useState(new Date());
    const [activeDate, setActiveDate] = useState(new Date());
    const [pickingFor, setPickingFor] = useState(null);

    const { publicRecipes } = useRecipes();
    const { plan, updatePlan, autoGenerate, clearPlan } = usePlanner();

    const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
    const activeDateStr = formatDate(activeDate);
    
    const dayPlan = plan[activeDateStr] || {};
    
    const getRecipeObj = (id) => publicRecipes.find(r => r.id === id) || null;

    const handleAutoGenerate = () => {
        const dateStrings = weekDates.map(d => formatDate(d));
        autoGenerate(dateStrings, publicRecipes);
    };

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-emerald-500/30 pb-32">
            <AnimatedBackground />
            <Header variant="back" title="Meal Planner" rightAction={
                <button onClick={() => { setBaseDate(new Date()); setActiveDate(new Date()); }} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-emerald-400">
                    <CalendarIcon size={18} />
                </button>
            }/>

            <RecipePickerModal 
                isOpen={!!pickingFor} 
                onClose={() => setPickingFor(null)} 
                recipes={publicRecipes}
                onSelect={(recipeId) => {
                    updatePlan(pickingFor.date, pickingFor.type, recipeId);
                    setPickingFor(null);
                }}
            />

            <main className="relative z-10 pt-24 px-4 md:px-10 max-w-6xl mx-auto">
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                {!session ? (
                   <div className="w-full max-w-lg mx-auto bg-[#0F172A]/80 backdrop-blur-xl border border-emerald-500/30 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden mt-8 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 pointer-events-none" />
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <CalendarIcon size={36} className="text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3">Plan Your Week</h2>
                        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                            Sign in to unlock your personal Meal Planner. Organize your breakfasts, lunches, and dinners effortlessly.
                        </p>
                        <button 
                            onClick={() => setAuthModalOpen(true)}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-full text-white font-black text-lg shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <LogIn size={20} /> Sign In or Create Account
                        </button>
                    </div>
                ) : (
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
                    
                    {/* Left Column: Calendar & Controls */}
                    <div className="lg:col-span-5 lg:sticky lg:top-32">
                        {/* Week Selector */}
                        <div className="flex justify-between items-center mb-8">
                            <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); }} className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"><ChevronLeft size={20} className="text-white"/></button>
                            <h2 className="text-sm font-black tracking-widest uppercase text-emerald-400">
                                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </h2>
                            <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); }} className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"><ChevronRight size={20} className="text-white"/></button>
                        </div>

                        {/* Date Ribbon */}
                        <div className="flex justify-between mb-10 overflow-x-auto no-scrollbar gap-2 pb-2">
                            {weekDates.map((date, i) => {
                                const isSelected = formatDate(date) === activeDateStr;
                                const isToday = formatDate(date) === formatDate(new Date());
                                const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                                const dateNum = date.getDate();
                                
                                return (
                                    <div key={i} onClick={() => setActiveDate(date)} className={`flex-shrink-0 flex flex-col items-center justify-center w-[13%] min-w-[50px] aspect-[3/4] rounded-[24px] cursor-pointer transition-all ${isSelected ? 'bg-emerald-500/20 border-2 border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.2)] scale-105' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:-translate-y-1'}`}>
                                        <span className={`text-[10px] font-black uppercase mb-1 ${isSelected ? 'text-emerald-400' : (isToday ? 'text-emerald-400/70' : 'text-slate-500')}`}>{dayStr}</span>
                                        <span className={`text-lg font-black ${isSelected ? 'text-emerald-400' : 'text-white'}`}>{dateNum}</span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="hidden lg:block mt-12">
                            <button onClick={handleAutoGenerate} className="w-full py-5 rounded-[24px] border-2 border-dashed border-emerald-500/30 text-emerald-400 font-black text-lg flex justify-center items-center gap-3 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all active:scale-95 group">
                                <Wand2 size={24} className="group-hover:animate-pulse" /> Auto-Fill Weekly Plan
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Daily Meal Slots */}
                    <div className="lg:col-span-7 mt-8 lg:mt-0">
                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-white mb-6 tracking-tight drop-shadow-md">
                                {activeDateStr === formatDate(new Date()) ? "Today's Plan" : activeDate.toLocaleDateString('en-US', { weekday: 'long' }) + "'s Plan"}
                            </h3>
                            
                            {['Breakfast', 'Lunch', 'Dinner'].map(type => (
                                <MealSlot 
                                    key={type} 
                                    type={type} 
                                    meal={getRecipeObj(dayPlan[type])} 
                                    onAdd={() => setPickingFor({ date: activeDateStr, type })}
                                    onRemove={() => clearPlan(activeDateStr, type)}
                                />
                            ))}
                        </div>

                        <div className="lg:hidden mt-8">
                            <button onClick={handleAutoGenerate} className="w-full py-5 rounded-[24px] border-2 border-dashed border-emerald-500/30 text-emerald-400 font-black text-lg flex justify-center items-center gap-3 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all active:scale-95 group">
                                <Wand2 size={24} className="group-hover:animate-pulse" /> Auto-Fill Weekly Plan
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </main>
        </div>
    );
}
