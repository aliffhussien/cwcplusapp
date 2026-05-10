import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Heart,
    Share2,
    Clock,
    ChefHat,
    Play,
    Pause,
    CheckCircle2,
    Info,
    X,
    ChevronRight,
    Edit3,
    Save,
    RotateCcw,
    List,
    ShoppingBag,
    Lock as LockIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useFavorites } from '../hooks/useFavorites';
import { useRecipes } from '../hooks/useRecipes';
import { useUser } from '../hooks/useUser';
import { useAppSettings } from '../hooks/useAppSettings';
import { createStripeCheckout } from '../lib/stripe';
import { formatPrice } from '../lib/currency';

// --- Smart Parser Logic ---
const cleanText = (text) => {
    if (!text) return '';
    const cleaned = String(text)
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/,""/g, '')  // Remove common junk artifacts
        .replace(/^"|"$/g, '') // Remove wrapping quotes
        .replace(/\\n/g, ' ') // Replace newlines with spaces
        .trim();
    
    if (cleaned.length === 0) return '';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const isHeader = (text) => {
    const cleaned = cleanText(text);
    if (!cleaned) return false;
    
    // Pattern 1: Explicit header marker from Admin uploader
    if (cleaned.startsWith('---') && cleaned.endsWith('---')) return true;
    
    // Pattern 2: Ends with colon (common for "Bahan A:", "Step 1:")
    if (cleaned.endsWith(':')) return true;
    
    // Pattern 3: Short, no numbers, all caps or title case (likely a subtitle)
    const isShort = cleaned.length < 40 && cleaned.length > 2;
    const hasNoNumbers = !/[\d]/.test(cleaned);
    const isCapitalized = cleaned === cleaned.toUpperCase() || /^[A-Z]/.test(cleaned);
    
    return isShort && hasNoNumbers && isCapitalized;
};

const parseIngredient = (rawText) => {
    let text = cleanText(rawText);
    if (!text) return { amount: '', name: '', isHeader: false };
    
    if (isHeader(text)) {
        return { amount: '', name: text.replace(/:$/, ''), isHeader: true };
    }

    const units = [
        'sudu besar', 'sudu kecil', 'cawan', 'g', 'gm', 'kg', 'ml', 'liter', 'l',
        'biji', 'ulas', 'keping', 'tangkai', 'ikat', 'helai', 'batang', 'ketul', 'inci', 'ekor',
        'tbsp', 'tsp', 'cup', 'oz', 'lb', 'piece', 'clove', 'can', 'packet'
    ].join('|');
    
    const regex = new RegExp(`^([\\d\\s\\/\\.,Â½Â¼Â¾]+(?:\\s*(?:${units}))?)\\s+(.*)`, 'i');
    const match = text.match(regex);
    
    if (match) {
        return {
            amount: match[1].trim(),
            name: match[2].trim(),
            isHeader: false
        };
    }
    return { amount: '', name: text, isHeader: false };
};


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
                    src={image || null}
                    alt="Recipe Hero"
                    className="w-full h-full object-cover opacity-90"
                />
            )}
            {/* Seamless gradient fade into the #070B14 background */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent pointer-events-none" />
        </div>
    );
};

const IngredientsTab = ({ groups, isEditing, onUpdate }) => {
    const [checked, setChecked] = useState(new Set());
    const toggle = (i) => {
        if (isEditing) return;
        const next = new Set(checked);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        setChecked(next);
    };

    const updateItem = (gIdx, iIdx, field, value) => {
        const newGroups = [...groups];
        newGroups[gIdx].items[iIdx][field] = value;
        onUpdate(newGroups);
    };

    const updateTitle = (gIdx, value) => {
        const newGroups = [...groups];
        newGroups[gIdx].title = value;
        onUpdate(newGroups);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-8"
        >
            {groups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3">
                    {group.title !== null && (
                        <div className="mb-4 px-1">
                            {isEditing ? (
                                <input 
                                    value={group.title} 
                                    onChange={e => updateTitle(gIdx, e.target.value)}
                                    className="bg-indigo-500/10 border-b border-indigo-500/30 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 w-full outline-none py-1"
                                    placeholder="Section Title..."
                                />
                            ) : (
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80">{group.title}</h3>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col gap-2.5">
                        {group.items.map((item, iIdx) => {
                            const globalIdx = `${gIdx}-${iIdx}`;
                            return (
                                <div 
                                    key={iIdx} 
                                    onClick={() => toggle(globalIdx)}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isEditing ? 'cursor-default border-indigo-500/20 bg-indigo-500/5' : checked.has(globalIdx) ? 'bg-indigo-500/5 border-indigo-500/20 opacity-60 cursor-pointer' : 'bg-white/[0.03] border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.2)] cursor-pointer'}`}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        {!isEditing && (
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked.has(globalIdx) ? 'bg-indigo-500 border-indigo-500' : 'border-indigo-500/50 bg-black/20'}`}>
                                                {checked.has(globalIdx) && <CheckCircle2 size={12} className="text-white" />}
                                            </div>
                                        )}
                                        {isEditing ? (
                                            <input 
                                                value={item.name} 
                                                onChange={e => updateItem(gIdx, iIdx, 'name', e.target.value)}
                                                className="bg-transparent text-[13px] md:text-sm font-semibold text-white/95 w-full outline-none"
                                            />
                                        ) : (
                                            <span className={`text-[13px] md:text-sm font-semibold transition-all ${checked.has(globalIdx) ? 'text-slate-500 line-through' : 'text-white/95'}`}>{item.name}</span>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <input 
                                            value={item.amount} 
                                            onChange={e => updateItem(gIdx, iIdx, 'amount', e.target.value)}
                                            className="bg-transparent text-[11px] md:text-xs font-bold tracking-wide text-indigo-400 w-24 text-right outline-none"
                                            placeholder="Qty..."
                                        />
                                    ) : (
                                        <span className={`text-[11px] md:text-xs font-bold tracking-wide transition-colors ${checked.has(globalIdx) ? 'text-slate-600' : 'text-indigo-400'}`}>{item.amount}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </motion.div>
    );
};


const StepsTab = ({ groups, isEditing, onUpdate }) => {
    const updateStep = (gIdx, iIdx, value) => {
        const newGroups = [...groups];
        newGroups[gIdx].items[iIdx] = value;
        onUpdate(newGroups);
    };

    const updateTitle = (gIdx, value) => {
        const newGroups = [...groups];
        newGroups[gIdx].title = value;
        onUpdate(newGroups);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-8"
        >
            {groups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-4">
                    {group.title !== null && (
                        <div className="mb-6 px-1">
                            {isEditing ? (
                                <input 
                                    value={group.title} 
                                    onChange={e => updateTitle(gIdx, e.target.value)}
                                    className="bg-indigo-500/10 border-b border-indigo-500/30 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 w-full outline-none py-1"
                                    placeholder="Section Title..."
                                />
                            ) : (
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80">{group.title}</h3>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col gap-4">
                        {group.items.map((step, iIdx) => (
                            <div key={iIdx} className="flex gap-4 p-4 rounded-[20px] card-3d-base relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1/3 card-3d-glare pointer-events-none" />
                                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] relative z-10">
                                    <span className="text-sm font-extrabold text-indigo-300 text-3d">{iIdx + 1}</span>
                                </div>
                                <div className="relative z-10 flex-1 pt-0.5">
                                    {isEditing ? (
                                        <textarea 
                                            value={step} 
                                            onChange={e => updateStep(gIdx, iIdx, e.target.value)}
                                            rows={2}
                                            className="w-full bg-transparent text-[13px] md:text-sm font-medium text-slate-300 leading-relaxed outline-none"
                                        />
                                    ) : (
                                        <p className="text-[13px] md:text-sm font-medium text-slate-300 leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                            {step}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </motion.div>
    );
};


const NotesTab = ({ notes, isEditing, onUpdate }) => {
    let notesArray = [];
    if (Array.isArray(notes)) {
        notesArray = notes;
    } else if (typeof notes === 'string') {
        try {
            const parsed = JSON.parse(notes);
            notesArray = Array.isArray(parsed) ? parsed : [notes];
        } catch (e) {
            notesArray = notes.split('\n').filter(n => n.trim() !== "");
        }
    }

    if (!isEditing && notesArray.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
        >
            {isEditing ? (
                <div className="p-4 rounded-[20px] bg-indigo-500/10 border border-indigo-500/20 flex gap-3 shadow-[inset_0_2px_8px_rgba(16,185,129,0.1)] relative overflow-hidden">
                    <Info size={20} className="text-indigo-400 flex-shrink-0 mt-0.5 relative z-10" />
                    <textarea 
                        value={notesArray.join('\n')}
                        onChange={e => onUpdate(e.target.value.split('\n'))}
                        className="w-full bg-transparent text-[13px] md:text-sm font-medium text-indigo-300/90 leading-relaxed outline-none min-h-[120px] relative z-10"
                        placeholder="Type notes (one per line)..."
                    />
                </div>
            ) : (
                notesArray.map((note, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-[20px] card-3d-base relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1/3 card-3d-glare pointer-events-none" />
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] relative z-10">
                            <Info size={16} className="text-indigo-300" />
                        </div>
                        <div className="relative z-10 flex-1 pt-0.5">
                            <p className="text-[13px] md:text-sm font-medium text-slate-300 leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                {note.replace(/^-+\s*|\s*-+$/g, '')}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </motion.div>
    );
};

const CookingModeOverlay = ({ steps, ingredients, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showIngredients, setShowIngredients] = useState(false);

    return (
        <motion.div 
            initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-[#070B14] text-white flex flex-col justify-center items-center px-6"
        >
            {/* Ambient Background for Cook Mode */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 blur-[150px] rounded-full" />
            </div>

            <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-20">
                <button 
                    onClick={() => setShowIngredients(!showIngredients)} 
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-xl border border-white/10 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                >
                    <List size={18} /> {showIngredients ? 'Hide Prep' : 'Peek Prep'}
                </button>
                <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-xl border border-white/10 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-4xl w-full">
                <h2 className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-indigo-400 font-black mb-8 opacity-80">Phase {currentStep + 1} of {steps.length}</h2>
                
                <AnimatePresence mode="wait">
                    <motion.p 
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="text-2xl md:text-5xl font-black text-center leading-[1.1] mb-16 px-4 md:px-0"
                    >
                        {steps[currentStep]}
                    </motion.p>
                </AnimatePresence>

                <div className="flex gap-8">
                    <button 
                        onClick={() => setCurrentStep(s => Math.max(0, s-1))} 
                        disabled={currentStep === 0} 
                        className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-3xl disabled:opacity-20 hover:bg-white/10 transition-all flex items-center justify-center group"
                    >
                        <ChevronLeft size={32} className="group-active:-translate-x-1 transition-transform" />
                    </button>
                    <button 
                        onClick={() => {
                            if (currentStep === steps.length - 1) onClose();
                            else setCurrentStep(s => Math.min(steps.length-1, s+1));
                        }} 
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl transition-all flex items-center justify-center shadow-2xl ${currentStep === steps.length - 1 ? 'bg-indigo-600 shadow-indigo-600/30' : 'bg-indigo-600 shadow-indigo-600/30'} group`}
                    >
                        {currentStep === steps.length - 1 ? <CheckCircle2 size={32} /> : <ChevronRight size={32} className="group-active:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>

            {/* Peek Ingredients Drawer */}
            <AnimatePresence>
                {showIngredients && (
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-black/60 backdrop-blur-[40px] border-l border-white/10 z-30 p-8 pt-24 overflow-y-auto"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <ShoppingBag size={20} className="text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Ingredient Prep</h3>
                        </div>

                        <div className="space-y-8">
                            {ingredients.map((group, gIdx) => (
                                <div key={gIdx}>
                                    {group.title && (
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">{group.title}</h4>
                                    )}
                                    <div className="space-y-3">
                                        {group.items.map((item, iIdx) => (
                                            <div key={iIdx} className="flex justify-between items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-sm font-bold text-slate-200">{item.name}</span>
                                                <span className="text-[11px] font-black text-indigo-400 uppercase shrink-0 mt-0.5">{item.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function RecipeView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { publicRecipes, fetchRecipeContent } = useRecipes();
    const { hasAccessToRecipe, user, loading: userLoading, refreshUserFromDB } = useUser();
    const { settings } = useAppSettings();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [servings, setServings] = useState(2);
    const [isCookingMode, setIsCookingMode] = useState(false);
    const [activeTab, setActiveTab] = useState("Ingredients");
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedRecipe, setEditedRecipe] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadRecipe = async () => {
            const baseRecipe = publicRecipes.find(r => r.id.toString() === id);
            if (!baseRecipe) {
                if (publicRecipes.length > 0) setLoading(false);
                return;
            }

            const access = hasAccessToRecipe(baseRecipe);
            setHasAccess(access);

            if (access) {
                const content = await fetchRecipeContent(id);
                setRecipe({ ...baseRecipe, ...content });
            } else {
                setRecipe(baseRecipe);
            }
            setLoading(false);
        };

        loadRecipe();
    }, [id, publicRecipes, hasAccessToRecipe, fetchRecipeContent]);

    useEffect(() => {
        if (recipe?.base_servings) setServings(recipe.base_servings);
    }, [recipe]);

    // Verify payment server-side using the Stripe session_id Stripe appended to the redirect URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const volumeName = urlParams.get('volume');
        if (!sessionId || !volumeName || !user?.id) return;

        window.history.replaceState({}, document.title, window.location.pathname);

        (async () => {
            try {
                const { data, error } = await supabase.functions.invoke('verify-payment', {
                    body: { session_id: sessionId, type: 'volume', item_id: volumeName, user_id: user.id },
                });
                if (error || !data?.success) throw new Error(error?.message || 'Verification failed');
                await refreshUserFromDB();
            } catch (err) {
                console.error('Payment verification failed:', err);
            }
        })();
    }, [user?.id]);

    // Find the recipe - wait for data to load
    const isAdmin = user?.role === 'admin' || user?.role === 'owner';

    // Structure ingredients with logical grouping
    const structuredIngredients = useMemo(() => {
        if (!recipe) return [];
        const raw = recipe.ingredients || [];
        const groups = [];
        let currentGroup = { title: null, items: [] };

        raw.forEach(item => {
            const parsed = typeof item === 'string' 
                ? parseIngredient(item) 
                : { ...item, name: cleanText(item.name || item.text), amount: cleanText(item.amount), isHeader: false };
            
            const name = cleanText(item.name || item.text);
            const amount = cleanText(item.amount);
            const isItemHeader = isHeader(name) && !amount;

            if (parsed.isHeader || isItemHeader) {
                if (currentGroup.items.length > 0 || currentGroup.title) {
                    groups.push(currentGroup);
                }
                currentGroup = { title: name.replace(/^-+\s*|\s*-+$/g, '').replace(/:$/, ''), items: [] };
            } else {
                let scaledAmount = amount;
                if (scaledAmount) {
                    scaledAmount = String(scaledAmount).replace(/[\d.]+/, (match) => {
                        const num = parseFloat(match);
                        if (isNaN(num)) return match;
                        const scaled = (num * servings) / (recipe.base_servings || recipe.baseServings || 2);
                        return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
                    });
                }
                currentGroup.items.push({ ...parsed, name, amount: scaledAmount });
            }
        });
        
        if (currentGroup.items.length > 0 || currentGroup.title) {
            groups.push(currentGroup);
        }
        return groups;
    }, [recipe, servings]);

    // Structure steps with logical grouping
    const structuredSteps = useMemo(() => {
        if (!recipe) return [];
        const raw = recipe.steps || [];
        const groups = [];
        let currentGroup = { title: null, items: [] };

        raw.forEach(step => {
            const cleaned = cleanText(step);
            if (isHeader(cleaned)) {
                if (currentGroup.items.length > 0 || currentGroup.title) {
                    groups.push(currentGroup);
                }
                currentGroup = { title: cleaned.replace(/:$/, ''), items: [] };
            } else {
                currentGroup.items.push(cleaned);
            }
        });

        if (currentGroup.items.length > 0 || currentGroup.title) {
            groups.push(currentGroup);
        }
        return groups;
    }, [recipe]);

    useEffect(() => {
        if (recipe && !editedRecipe) {
            setEditedRecipe({ ...recipe });
        }
    }, [recipe, editedRecipe]);

    if (loading || userLoading) {
        return (
            <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 text-sm">Initializing Signature Theater...</p>
                </div>
            </div>
        );
    }


    
    const recipeVolume = settings.volumes?.find(v => v.id === recipe.volume || v.name === recipe.volume) || { name: recipe.volume || 'Premium Collection', price: '29.99', discount: 0 };
    const currency = settings.currency || 'MYR';
    const basePrice = parseFloat(recipeVolume.price) || 29.99;
    const discount = parseFloat(recipeVolume.discount) || 0;
    const finalPrice = discount > 0 ? (basePrice * (1 - discount / 100)) : basePrice;
    const displayPrice = formatPrice(finalPrice, currency);

    const handleUnlockVolume = async (volumeName, price) => {
        setIsUnlocking(true);
        try {
            const successUrl = `${window.location.origin}/recipe/${id}?session_id={CHECKOUT_SESSION_ID}&volume=${encodeURIComponent(volumeName)}`;
            const checkoutUrl = await createStripeCheckout(
                price,
                currency,
                `VOL-${volumeName.replace(/\s+/g, '')}-${Date.now()}`,
                successUrl,
                `${recipeVolume.name} — CWC+`
            );
            if (checkoutUrl) window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Payment failed', error);
        } finally {
            setIsUnlocking(false);
        }
    };

    // Dynamic Tabs Logic
    const availableTabs = [];
    if (structuredIngredients && structuredIngredients.some(g => g.items.length > 0)) availableTabs.push("Ingredients");
    if (structuredSteps && structuredSteps.some(g => g.items.length > 0)) availableTabs.push("Steps");
    
    // Process notes for availability check
    let hasNotes = false;
    if (recipe.notes) {
        try {
            const parsed = JSON.parse(recipe.notes);
            if (Array.isArray(parsed)) hasNotes = parsed.some(n => n.trim() !== "");
            else hasNotes = String(recipe.notes).trim() !== "";
        } catch(e) {
            console.warn("Error parsing recipe notes", e);
            hasNotes = String(recipe.notes).trim() !== "";
        }
    }
    if (hasNotes || isEditing) availableTabs.push("Notes");

    const handleSaveRecipe = async () => {
        if (!editedRecipe) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('recipes')
                .update({
                    title: editedRecipe.title,
                    description: editedRecipe.description,
                    time: editedRecipe.time,
                    difficulty: editedRecipe.difficulty,
                    ingredients: editedRecipe.ingredients,
                    steps: editedRecipe.steps,
                    notes: JSON.stringify(editedRecipe.notes),
                    volume: editedRecipe.volume
                })
                .eq('id', recipe.id);

            if (error) throw error;
            setIsEditing(false);
            alert("Recipe updated successfully! âœ¨");
            window.location.reload(); // Refresh to get latest data
        } catch (error) {
            console.error("Error updating recipe:", error);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-24">
            <AnimatedBackground />

            {/* ADMIN TOOLBAR */}
            {isAdmin && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 p-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                        >
                            <Edit3 size={14} /> Visual Editor
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleSaveRecipe}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                            >
                                {isSaving ? <RotateCcw size={14} className="animate-spin" /> : <Save size={14} />} 
                                {isSaving ? 'Saving...' : 'Commit Changes'}
                            </button>
                            <button 
                                onClick={() => { setIsEditing(false); setEditedRecipe({...recipe}); }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                            >
                                <X size={14} /> Cancel
                            </button>
                        </>
                    )}
                </div>
            )}
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
                            onClick={() => navigator.share?.({ title: recipe.title, url: window.location.href })}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]">
                            <Share2 size={18} className="text-white" />
                        </button>
                    </>
                }
            />

            <HeroMedia image={recipe.hero_image || recipe.image} video={recipe.video} />

            {/* Main Content Area - Pulled up to overlap hero media */}
            <main className="relative z-10 px-4 md:px-10 max-w-3xl mx-auto -mt-12 md:-mt-20">

                {/* Title & Meta Data */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        {isEditing ? (
                            <select 
                                value={editedRecipe.difficulty} 
                                onChange={e => setEditedRecipe({...editedRecipe, difficulty: e.target.value})}
                                className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded text-[10px] font-bold text-rose-400 uppercase tracking-wider outline-none"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Pro">Pro Chef</option>
                            </select>
                        ) : (
                            <>
                                {recipe.difficulty && (
                                    <div className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded text-[10px] font-bold text-rose-400 uppercase tracking-wider shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                        {recipe.difficulty}
                                    </div>
                                )}
                                <div className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[10px] font-bold text-indigo-400 uppercase tracking-wider shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                    {recipe.volume || 'Original'}
                                </div>
                            </>
                        )}
                    </div>
                    {isEditing && (
                        <div className="mb-4 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Recipe Collection / Volume</label>
                            <select 
                                value={editedRecipe.volume} 
                                onChange={e => setEditedRecipe({...editedRecipe, volume: e.target.value})}
                                className="w-full bg-indigo-500/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500/50"
                            >
                                {settings.volumes?.map(v => (
                                    <option key={v.id} value={v.name}>{v.name}</option>
                                ))}
                                <option value="CWC Original">CWC Original</option>
                                <option value="Free">Free / Uncategorized</option>
                            </select>
                        </div>
                    )}
                    {isEditing ? (
                        <input 
                            value={editedRecipe.title} 
                            onChange={e => setEditedRecipe({...editedRecipe, title: e.target.value})}
                            className="w-full bg-transparent text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight outline-none border-b border-white/10"
                            placeholder="Recipe Title..."
                        />
                    ) : (
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight text-3d">
                            {recipe.title}
                        </h1>
                    )}
                    
                    <p className="text-xs md:text-sm font-semibold text-indigo-300 mb-4 flex items-center gap-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                        <ChefHat size={14} /> {recipe.author}
                    </p>

                    <div className="flex gap-4">
                        {isEditing ? (
                            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] md:text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                <Clock size={12} className="text-indigo-400" />
                                <input 
                                    value={editedRecipe.time} 
                                    onChange={e => setEditedRecipe({...editedRecipe, time: e.target.value})}
                                    className="bg-transparent outline-none w-20"
                                    placeholder="Time..."
                                />
                            </div>
                        ) : recipe.time && (
                            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] md:text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)]">
                                <Clock size={12} className="text-indigo-400" />
                                {recipe.time}
                            </div>
                        )}
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
                    <div className="relative mt-8 mb-12">
                        {/* Blurred Preview Teaser */}
                        <div className="absolute inset-x-0 -top-12 bottom-0 z-0 pointer-events-none opacity-40 blur-2xl grayscale">
                             <div className="space-y-4">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="h-12 bg-white/10 rounded-2xl w-full" />
                                ))}
                             </div>
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center py-16 px-8 text-center bg-[#0A0F1C]/80 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
                            <div className="w-20 h-20 mb-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center rotate-3">
                                <LockIcon size={32} className="text-indigo-400" />
                            </div>
                            
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">Initialize Signature Mastery</h2>
                            <p className="text-slate-400 text-sm font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                                This signature method is secured within the <span className="text-indigo-400 font-extrabold">{recipeVolume.name}</span>. 
                                Unlock it to access full instructions, ingredients deck, and the cinema-quality production.
                            </p>
                            
                            <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                                <button 
                                    disabled={isUnlocking} 
                                    onClick={() => handleUnlockVolume(recipeVolume.name, finalPrice)} 
                                    className="w-full py-5 bg-white text-[#070B14] rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <ShoppingBag size={18} /> {isUnlocking ? 'Authorizing...' : `Unlock for ${displayPrice}`}
                                </button>
                                <button 
                                    onClick={() => navigate('/profile')} 
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                                >
                                    Access License Manager
                                </button>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/5 w-full flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0F1C] bg-slate-800" />
                                    ))}
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">+1.4k Elite Chefs Accessing</span>
                            </div>
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
                                {activeTab === "Ingredients" && (
                                    <IngredientsTab 
                                        key="ingredients" 
                                        groups={isEditing ? 
                                            // Re-group current edited ingredients for the tab
                                            (() => {
                                                const groups = [];
                                                let currentGroup = { title: null, items: [] };
                                                editedRecipe.ingredients.forEach(item => {
                                                    const name = typeof item === 'string' ? item : item.name;
                                                    const amount = typeof item === 'string' ? '' : item.amount;
                                                    if (isHeader(name)) {
                                                        if (currentGroup.items.length > 0 || currentGroup.title) groups.push(currentGroup);
                                                        currentGroup = { title: name.replace(/^-+\s*|\s*-+$/g, '').replace(/:$/, ''), items: [] };
                                                    } else {
                                                        currentGroup.items.push({ name, amount });
                                                    }
                                                });
                                                if (currentGroup.items.length > 0 || currentGroup.title) groups.push(currentGroup);
                                                return groups;
                                            })()
                                            : structuredIngredients
                                        } 
                                        isEditing={isEditing}
                                        onUpdate={(newGroups) => {
                                            // Flatten groups back into linear array for storage
                                            const flattened = [];
                                            newGroups.forEach(g => {
                                                if (g.title) flattened.push(`${g.title.toUpperCase()}:`);
                                                g.items.forEach(i => flattened.push(i));
                                            });
                                            setEditedRecipe({...editedRecipe, ingredients: flattened});
                                        }}
                                    />
                                )}
                                {activeTab === "Steps" && (
                                    <StepsTab 
                                        key="steps" 
                                        groups={isEditing ? 
                                            (() => {
                                                const groups = [];
                                                let currentGroup = { title: null, items: [] };
                                                editedRecipe.steps.forEach(step => {
                                                    if (isHeader(step)) {
                                                        if (currentGroup.items.length > 0 || currentGroup.title) groups.push(currentGroup);
                                                        currentGroup = { title: step.replace(/^-+\s*|\s*-+$/g, '').replace(/:$/, ''), items: [] };
                                                    } else {
                                                        currentGroup.items.push(step);
                                                    }
                                                });
                                                if (currentGroup.items.length > 0 || currentGroup.title) groups.push(currentGroup);
                                                return groups;
                                            })()
                                            : structuredSteps
                                        } 
                                        isEditing={isEditing}
                                        onUpdate={(newGroups) => {
                                            const flattened = [];
                                            newGroups.forEach(g => {
                                                if (g.title) flattened.push(`${g.title.toUpperCase()}:`);
                                                g.items.forEach(i => flattened.push(i));
                                            });
                                            setEditedRecipe({...editedRecipe, steps: flattened});
                                        }}
                                    />
                                )}
                                {activeTab === "Notes" && (
                                    <NotesTab 
                                        key="notes" 
                                        notes={isEditing ? editedRecipe.notes : recipe.notes} 
                                        isEditing={isEditing}
                                        onUpdate={(newNotes) => setEditedRecipe({...editedRecipe, notes: newNotes})}
                                    />
                                )}
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
                {isCookingMode && (
                    <CookingModeOverlay 
                        steps={structuredSteps.flatMap(g => g.items)} 
                        ingredients={structuredIngredients}
                        onClose={() => setIsCookingMode(false)} 
                    />
                )}
            </AnimatePresence>

        </div>
    );
}
