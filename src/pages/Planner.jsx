import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Wand2 } from 'lucide-react';
import Header from '../components/Header';
import { useRecipes } from '../hooks/useRecipes';
import { usePlanner } from '../hooks/usePlanner';
import { useUser } from '../hooks/useUser';
import { useMedia } from '../hooks/useMedia';
import AuthModal from '../components/AuthModal';
import RecipePickerModal from '../components/RecipePickerModal';
import MealSlot from '../components/MealSlot';
import { APP_COPY } from '../config/appCopy';
import { getWeekDates, formatDate } from '../lib/dateUtils';

export default function Planner() {
    const { session } = useUser();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [baseDate, setBaseDate] = useState(new Date());
    const [activeDate, setActiveDate] = useState(new Date());
    const [pickingFor, setPickingFor] = useState(null);

    const { publicRecipes } = useRecipes();
    const { media } = useMedia();
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
        <div className="min-h-screen bg-[#070B14] text-white pb-32">
            <Header variant="back" title={APP_COPY.navigation.planner} />

            <RecipePickerModal 
                isOpen={!!pickingFor} 
                onClose={() => setPickingFor(null)} 
                recipes={publicRecipes}
                mediaList={media}
                onSelect={(recipeId) => {
                    updatePlan(pickingFor.date, pickingFor.type, recipeId);
                    setPickingFor(null);
                }}
            />

            <main className="pt-24 px-4 md:px-8 max-w-6xl mx-auto">
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                
                {!session ? (
                    <div className="max-w-md mx-auto py-20 text-center">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon size={28} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Plan Your Meals</h2>
                        <p className="text-sm text-slate-500 font-medium mb-8">
                            Sign in to organize your weekly meal prep and source professional recipes for every session.
                        </p>
                        <button 
                            onClick={() => setAuthModalOpen(true)}
                            className="btn-primary w-full py-4 text-sm"
                        >
                            Get Started
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4">
                            <div className="flex justify-between items-center mb-6">
                                <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); }} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><ChevronLeft size={20}/></button>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                                    {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); }} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><ChevronRight size={20}/></button>
                            </div>

                            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                                {weekDates.map((date, i) => {
                                    const isSelected = formatDate(date) === activeDateStr;
                                    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                                    const dateNum = date.getDate();
                                    
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => setActiveDate(date)} 
                                            className={`flex-shrink-0 lg:w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-white border-white text-[#070B14]' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-white'}`}
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{dayStr}</span>
                                            <span className="text-sm font-bold">{dateNum}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button onClick={handleAutoGenerate} className="w-full mt-6 py-4 rounded-xl border border-dashed border-white/10 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2">
                                <Wand2 size={14} /> Auto-Generate Week
                            </button>
                        </div>

                        <div className="lg:col-span-8">
                            <h3 className="text-xl font-bold text-white mb-6 tracking-tight">
                                {activeDateStr === formatDate(new Date()) ? "Today's Method" : activeDate.toLocaleDateString('en-US', { weekday: 'long' }) + "'s Method"}
                            </h3>
                            
                            <div className="space-y-4">
                                {['Breakfast', 'Lunch', 'Dinner'].map(type => (
                                    <MealSlot 
                                        key={type} 
                                        type={type} 
                                        meal={getRecipeObj(dayPlan[type])} 
                                        onAdd={() => setPickingFor({ date: activeDateStr, type })}
                                        onRemove={() => clearPlan(activeDateStr, type)}
                                        mediaList={media}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

