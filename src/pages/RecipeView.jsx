import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Heart,
    Share2,
    Clock,
    Users,
    ChefHat,
    Play,
    Pause,
    CheckCircle2,
    Info,
    X,
    ChevronRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useFavorites } from '../hooks/useFavorites';
import { useRecipes } from '../hooks/useRecipes';
import { useUser } from '../hooks/useUser';
import { useAppSettings } from '../hooks/useAppSettings';
import { createStripeCheckout } from '../lib/stripe';

// --- Components ---

// --- Components ---

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-indigo-600 blur-[100px]"
        />
        <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] rounded-full bg-rose-600 blur-[120px]"
        />
    </div>
);

// --- Components ---

const HeroMedia = ({ image, video }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="relative w-full h-[45vh] md:h-[55vh] bg-black overflow-hidden z-0">
            {video ? (
                <>
                    <video
                        ref={videoRef}
                        src={video}
                        poster={image}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    <button
                        onClick={togglePlay}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:bg-black/60 transition-colors"
                    >
                        {isPlaying ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white ml-1" />}
                    </button>
                </>
            ) : (
                <img
                    src={image}
                    alt="Recipe Hero"
                    className="w-full h-full object-cover opacity-90"
                />
            )}
            {/* Seamless gradient fade into the #070B14 background */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent pointer-events-none" />
        </div>
    );
};

const IngredientsTab = ({ ingredients }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="flex flex-col gap-2.5"
    >
        {ingredients.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-indigo-500/50 flex items-center justify-center bg-black/20">
                        <CheckCircle2 size={12} className="text-indigo-400 opacity-0 hover:opacity-100 cursor-pointer transition-opacity" />
                    </div>
                    <span className="text-[13px] md:text-sm font-semibold text-white/95">{item.name}</span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-slate-400 tracking-wide">{item.amount}</span>
            </div>
        ))}
    </motion.div>
);

const StepsTab = ({ steps }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="flex flex-col gap-4"
    >
        {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-[20px] card-3d-base relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1/3 card-3d-glare pointer-events-none" />
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] relative z-10">
                    <span className="text-sm font-extrabold text-indigo-300 text-3d">{idx + 1}</span>
                </div>
                <div className="relative z-10 flex-1 pt-0.5">
                    <p className="text-[13px] md:text-sm font-medium text-slate-300 leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                        {step}
                    </p>
                </div>
            </div>
        ))}
    </motion.div>
);

const NotesTab = ({ notes }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="p-4 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 flex gap-3 shadow-[inset_0_2px_8px_rgba(16,185,129,0.1)] relative overflow-hidden"
    >
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/20 blur-xl rounded-full pointer-events-none" />
        <Info size={20} className="text-emerald-400 flex-shrink-0 mt-0.5 relative z-10" />
        <p className="text-[13px] md:text-sm font-medium text-emerald-100/90 leading-relaxed relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {notes}
        </p>
    </motion.div>
);

const CookingModeOverlay = ({ steps, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    return (
        <motion.div 
            initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-[#070B14] text-white flex flex-col justify-center items-center px-6"
        >
            <button onClick={onClose} className="absolute top-8 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
            </button>
            <h2 className="text-sm uppercase tracking-widest text-indigo-400 font-bold mb-6">Step {currentStep + 1} of {steps.length}</h2>
            <p className="text-2xl md:text-5xl font-extrabold text-center leading-tight mb-16 max-w-4xl">
                {steps[currentStep]}
            </p>
            <div className="flex gap-6">
                <button 
                    onClick={() => setCurrentStep(s => Math.max(0, s-1))} 
                    disabled={currentStep === 0} 
                    className="p-5 bg-white/5 border border-white/10 rounded-full disabled:opacity-30 hover:bg-white/10 transition-colors">
                    <ChevronLeft size={32} />
                </button>
                <button 
                    onClick={() => {
                        if (currentStep === steps.length - 1) onClose();
                        else setCurrentStep(s => Math.min(steps.length-1, s+1));
                    }} 
                    className={`p-5 rounded-full transition-colors ${currentStep === steps.length - 1 ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-indigo-500 hover:bg-indigo-400'}`}>
                    {currentStep === steps.length - 1 ? <CheckCircle2 size={32} /> : <ChevronRight size={32} />}
                </button>
            </div>
        </motion.div>
    );
};

// --- Main App Layout ---

export default function RecipeView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { publicRecipes } = useRecipes();
    const { unlockVolume, hasAccessToRecipe } = useUser();
    const { settings } = useAppSettings();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [servings, setServings] = useState(2);
    const [isCookingMode, setIsCookingMode] = useState(false);
    const [activeTab, setActiveTab] = useState("Ingredients");
    const [isUnlocking, setIsUnlocking] = useState(false);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success' || urlParams.get('status') === 'success') {
            const volumeName = urlParams.get('volume');
            if (volumeName) {
                unlockVolume(volumeName);
                alert(`Payment successful! ${volumeName} unlocked.`);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [unlockVolume]);

    // Find the recipe - wait for data to load
    const recipe = publicRecipes.find(r => r.id === parseInt(id)) || publicRecipes[0];

    // Show loading state while recipes are loading from localStorage
    if (!recipe) {
        return (
            <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 text-sm">Loading recipe...</p>
                </div>
            </div>
        );
    }

    const hasAccess = hasAccessToRecipe(recipe);
    
    const recipeVolume = settings.volumes?.find(v => v.id === recipe.volume || v.name === recipe.volume) || { name: recipe.volume || 'Premium Collection', price: '9.99', discount: 0 };
    const basePrice = parseFloat(recipeVolume.price) || 9.99;
    const discount = parseFloat(recipeVolume.discount) || 0;
    const finalPrice = discount > 0 ? (basePrice * (1 - discount/100)).toFixed(2) : basePrice.toFixed(2);

    // Scale ingredients safely
    const scaledIngredients = (recipe.ingredients || []).map(item => {
        if (!item.amount) return item;
        const scaledAmount = item.amount.replace(/[\d.]+/, (match) => {
            const num = parseFloat(match);
            if (isNaN(num)) return match;
            const scaled = (num * servings) / (recipe.baseServings || 2);
            return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
        });
        return { ...item, amount: scaledAmount };
    });

    const handleUnlockVolume = async (volumeName, price) => {
        setIsUnlocking(true);
        try {
            const checkoutUrl = await createStripeCheckout(
                price,
                'USD',
                `VOL-${volumeName.replace(/\s+/g, '')}-${Date.now()}`,
                `${window.location.origin}/recipe/${id}?payment=success&volume=${encodeURIComponent(volumeName)}`
            );
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                unlockVolume(volumeName);
                alert(`Unlocked ${volumeName}!`);
            }
        } catch (error) {
            console.error("Payment failed", error);
            alert("Unable to initiate payment. Please try again.");
        } finally {
            setIsUnlocking(false);
        }
    };

    // Dynamic Tabs Logic
    const availableTabs = ["Ingredients", "Steps"];
    if (recipe.notes) availableTabs.push("Notes");

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-24">
            <AnimatedBackground />
            <Header 
                variant="back" 
                transparentOverride={true}
                rightAction={
                    <>
                        <button 
                            onClick={() => toggleFavorite(recipe.id)}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-rose-500/20 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)] group">
                            <Heart size={18} className={`transition-colors ${isFavorite(recipe.id) ? 'text-rose-500 fill-rose-500' : 'text-white group-hover:text-rose-400 group-hover:fill-rose-400'}`} />
                        </button>
                        <button 
                            onClick={() => console.log("Share Recipe")}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]">
                            <Share2 size={18} className="text-white" />
                        </button>
                    </>
                }
            />

            <HeroMedia image={recipe.image} video={recipe.video} />

            {/* Main Content Area - Pulled up to overlap hero media */}
            <main className="relative z-10 px-4 md:px-10 max-w-3xl mx-auto -mt-12 md:-mt-20">

                {/* Title & Meta Data */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded text-[10px] font-bold text-rose-400 uppercase tracking-wider shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            {recipe.difficulty}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight text-3d">
                        {recipe.title}
                    </h1>
                    <p className="text-xs md:text-sm font-semibold text-indigo-300 mb-4 flex items-center gap-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                        <ChefHat size={14} /> {recipe.author}
                    </p>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-slate-300 text-[11px] md:text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)]">
                            <Clock size={12} className="text-emerald-400" />
                            {recipe.time}
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-[11px] md:text-xs font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)]">
                            <button onClick={() => setServings(s => Math.max(1, s - 1))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-white">-</button>
                            <span className="w-4 text-center">{servings}</span>
                            <span className="mr-1">Portions</span>
                            <button onClick={() => setServings(s => s + 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-white">+</button>
                        </div>
                    </div>
                </div>
                {/* Dynamic 3D Segmented Controls (Tabs) OR Lock Screen */}
                {!hasAccess ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md mb-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        <div className="w-20 h-20 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            <Info size={32} className="text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-extrabold text-white mb-2">Unlock {recipeVolume.name}</h2>
                        <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
                            This recipe belongs to {recipeVolume.name}. Unlock this volume to get access to all its recipes!
                        </p>
                        
                        <div className="flex flex-col gap-3 w-full max-w-[200px] mx-auto">
                            <button disabled={isUnlocking} onClick={() => handleUnlockVolume(recipeVolume.name, finalPrice)} className="py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.4)] transition-all text-xs flex flex-col items-center leading-tight disabled:opacity-50">
                                <span>{isUnlocking ? 'Processing...' : `Unlock for $${finalPrice}`}</span>
                                {discount > 0 && !isUnlocking && <span className="text-[9px] line-through opacity-70">${basePrice.toFixed(2)}</span>}
                            </button>
                            <button onClick={() => navigate('/profile')} className="py-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 font-bold rounded-xl transition-all text-xs">
                                Upgrade to Premium
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 p-1.5 bg-black/40 border border-white/10 rounded-[18px] backdrop-blur-xl mb-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                            {availableTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 rounded-xl text-[11px] md:text-[13px] font-bold transition-all ${activeTab === tab
                                            ? 'btn-3d-active text-white'
                                            : 'btn-3d-inactive text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Area */}
                        <div className="min-h-[300px]">
                            <AnimatePresence mode="wait">
                                {activeTab === "Ingredients" && <IngredientsTab key="ingredients" ingredients={scaledIngredients} />}
                                {activeTab === "Steps" && <StepsTab key="steps" steps={recipe.steps} />}
                                {activeTab === "Notes" && <NotesTab key="notes" notes={recipe.notes} />}
                            </AnimatePresence>
                        </div>
                    </>
                )}

            </main>

            {/* Floating Action Button Bottom */}
            <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50 pointer-events-none">
                <button 
                    onClick={() => setIsCookingMode(true)}
                    className="pointer-events-auto w-full max-w-sm py-3.5 rounded-[18px] btn-3d-active text-white text-[13px] md:text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    <Play size={16} className="fill-white" /> Start Cooking Mode
                </button>
            </div>

            <AnimatePresence>
                {isCookingMode && <CookingModeOverlay steps={recipe.steps} onClose={() => setIsCookingMode(false)} />}
            </AnimatePresence>
        </div>
    );
}