import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Wand2 } from 'lucide-react';
import Header from './Header';
import { useRecipes } from '../hooks/useRecipes';
import { usePlanner } from '../hooks/usePlanner';
import { useUser } from '../hooks/useUser';
import { useMedia } from '../hooks/useMedia';
import AuthModal from './AuthModal';
import RecipePickerModal from './RecipePickerModal';
import MealSlot from './MealSlot';
import { APP_COPY } from '../config/appCopy';
import { getWeekDates, formatDate } from '../lib/dateUtils';

export default function Planner() {
    const { session } = useUser();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [baseDate, setBaseDate] = useState(new Date());
    const [activeDate, setActiveDate] = useState(new Date());
    const [pickingFor, setPickingFor] = useState<{date: string, type: string} | null>(null);

    const { publicRecipes } = useRecipes();
    const { media } = useMedia();
    const { plan, updatePlan, autoGenerate, clearPlan } = usePlanner();

    const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
    const activeDateStr = formatDate(activeDate);
    const dayPlan = plan[activeDateStr] || {};
    const getRecipeObj = (id: string) => (publicRecipes || []).find((r: any) => r.id === id) || null;

    const handleAutoGenerate = () => {
        const dateStrings = weekDates.map(d => formatDate(d));
        autoGenerate(dateStrings, publicRecipes);
    };

    return (
        <div className="min-h-screen bg-base text-text-1 pb-32">
            <Header variant="back" title={APP_COPY.navigation.planner} />

            <RecipePickerModal 
                isOpen={!!pickingFor} 
                onClose={() => setPickingFor(null)} 
                recipes={publicRecipes}
                mediaList={media}
                onSelect={(recipeId) => {
                    if (pickingFor) updatePlan(pickingFor.date, pickingFor.type, recipeId);
                    setPickingFor(null);
                }}
            />

            <main className="pt-24 px-4 md:px-8 max-w-6xl mx-auto">
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                
                {!session ? (
                    <div className="max-w-md mx-auto py-20 text-center">
                        <div className="w-16 h-16 bg-glass-bg border border-glass-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon size={28} className="text-text-1" />
                        </div>
                        <h2 className="text-xl font-bold text-text-1 mb-2">Plan Your Meals</h2>
                        <p className="text-sm text-text-3 font-medium mb-8">
                            Sign in to organize your weekly meal prep and find simple, tasty recipes for every day.
                        </p>
                        <button onClick={() => setAuthModalOpen(true)} className="btn-primary w-full py-4 text-sm">
                            Get Started
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4">
                            <div className="flex justify-between items-center mb-6">
                                <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); }} className="p-2 hover:bg-elevated rounded-xl transition-colors"><ChevronLeft size={20}/></button>
                                <span className="section-label text-accent">
                                    {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); }} className="p-2 hover:bg-elevated rounded-xl transition-colors"><ChevronRight size={20}/></button>
                            </div>

                            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                                {weekDates.map((date, i) => {
                                    const isSelected = formatDate(date) === activeDateStr;
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => setActiveDate(date)} 
                                            className={`flex-shrink-0 lg:w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-text-1 border-text-1 text-base' : 'bg-glass-bg border-glass-border text-text-3 hover:border-border hover:text-text-1'}`}
                                        >
                                            <span className="section-label">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            <span className="text-sm font-bold">{date.getDate()}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button onClick={handleAutoGenerate} className="w-full mt-6 py-4 rounded-xl border border-dashed border-glass-border section-label text-text-3 hover:text-text-1 hover:border-border transition-all flex items-center justify-center gap-2">
                                <Wand2 size={14} /> Smart Meal Plan
                            </button>
                        </div>

                        <div className="lg:col-span-8">
                            <h3 className="text-xl font-bold text-text-1 mb-6 tracking-tight">
                                {activeDateStr === formatDate(new Date()) ? "Today's Menu" : activeDate.toLocaleDateString('en-US', { weekday: 'long' }) + "'s Menu"}
                            </h3>
                            
                            <div className="space-y-4">
                                {['Breakfast', 'Lunch', 'Dinner'].map(type => (
                                    <MealSlot 
                                        key={type} 
                                        type={type} 
                                        meal={getRecipeObj(dayPlan[type] as string)} 
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
