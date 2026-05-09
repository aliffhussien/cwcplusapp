import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Heart, LockKeyhole, LogIn, LogOut, Refrigerator, Camera, User, X, Save, Edit3, Shield, Award, Zap, BellRing, Calendar, Wand2, ChefHat, ChevronRight, ChevronLeft, Globe, CheckCircle2 } from 'lucide-react';

import Header from '../components/Header';
import { useFavorites } from '../hooks/useFavorites';
import { useRecipes } from '../hooks/useRecipes';
import { useUser } from '../hooks/useUser';
import { usePlanner } from '../hooks/usePlanner';
import { useMedia } from '../hooks/useMedia';
import AuthModal from '../components/AuthModal';
import RecipePickerModal from '../components/RecipePickerModal';
import MealSlot from '../components/MealSlot';
import PushManager from '../components/PushManager';
import { supabase } from '../lib/supabase';
import { getWeekDates, formatDate } from '../lib/dateUtils';


const HeroBackground = ({ coverUrl, onUpload, isUploading }) => (
    <div className="absolute top-0 left-0 w-full h-[30vh] md:h-[40vh] z-0 overflow-hidden bg-[#070B14]">
        {coverUrl && (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover opacity-40 transition-transform duration-1000" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/40 to-transparent pointer-events-none" />
        {onUpload && (
            <label className={`absolute bottom-8 right-4 md:right-10 p-3 bg-white/5 backdrop-blur-xl rounded-xl text-white cursor-pointer hover:bg-indigo-600/50 transition-all border border-white/10 z-50 group ${isUploading ? 'animate-pulse' : ''}`}>
                <Camera size={18} className="group-hover:scale-110 transition-transform" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, 'cover')} disabled={isUploading} />
            </label>
        )}
    </div>
);

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [name, setName] = useState(user?.name || '');
    const [diet, setDiet] = useState(user?.dietaryPreferences || []);
    const [food, setFood] = useState(user?.favoriteFood || '');
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setName(user?.name || '');
            setDiet(user?.dietaryPreferences || []);
            setFood(user?.favoriteFood || '');
        }
    }, [isOpen, user]);
    
    const dietOptions = ['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Nut-Free', 'Low-Carb', 'Paleo'];

    const toggleDiet = (option) => {
        if (diet.includes(option)) setDiet(diet.filter(d => d !== option));
        else setDiet([...diet, option]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ name, dietaryPreferences: diet, favoriteFood: food });
        setIsSaving(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#070B14]/90 backdrop-blur-md" 
                        onClick={onClose} 
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#0F172A] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5">
                            <X size={16} />
                        </button>
                        <h2 className="text-xl font-black text-white mb-8 tracking-tight uppercase">Update Profile</h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Chef Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    placeholder="Chef John"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Signature Dish / Loves</label>
                                <input 
                                    type="text" 
                                    value={food} 
                                    onChange={(e) => setFood(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    placeholder="e.g. Wagyu Steak"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Dietary Core</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {dietOptions.map(option => (
                                        <button 
                                            key={option}
                                            onClick={() => toggleDiet(option)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all ${diet.includes(option) ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-4 mt-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const ProfileStat = ({ label, value, icon: Icon, color = "indigo" }) => (
    <div className="bg-[#0F172A]/50 border-[0.5px] border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:bg-[#0F172A]/80 transition-all hover:border-white/10">
        <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400 mb-2 group-hover:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <p className="text-lg font-black text-white leading-tight">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 mt-1">{label}</p>
    </div>
);

const RecipeGridItem = ({ id, title, time, rating, image, index }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/recipe/${id}`)}
            className="group relative bg-[#0F172A]/30 border-[0.5px] border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-all"
        >
            <div className="aspect-[4/3] overflow-hidden relative">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center"><ChefHat className="text-slate-700" size={24}/></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1">
                    <Star size={8} className="text-amber-400 fill-amber-400" />
                    <span className="text-[9px] font-black text-white">{rating}</span>
                </div>
            </div>
            <div className="p-3">
                <h4 className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{title}</h4>
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mt-1.5">
                    <Clock size={10} className="text-indigo-500" />
                    <span className="uppercase tracking-tighter">{time}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default function Profile() {
    const { favorites } = useFavorites();
    const { publicRecipes } = useRecipes();
    const { session, user, signOut, updateUser } = useUser();
    const { media } = useMedia();
    const { plan, updatePlan, autoGenerate, clearPlan } = usePlanner();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('recipes');
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Planner Logic
    const [baseDate, setBaseDate] = useState(new Date());
    const [activeDate, setActiveDate] = useState(new Date());
    const [pickingFor, setPickingFor] = useState(null);

    const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
    const activeDateStr = formatDate(activeDate);
    const dayPlan = plan[activeDateStr] || {};
    const getRecipeObj = (id) => publicRecipes.find(r => r.id === id) || null;

    const favoriteRecipes = (publicRecipes && Array.isArray(publicRecipes))
        ? publicRecipes.filter(r => r && favorites && Array.isArray(favorites) && favorites.includes(r.id))
        : [];

    const pantryCount = useMemo(() => {
        try {
            const stored = localStorage.getItem('cwc_pantry');
            const items = stored ? JSON.parse(stored) : [];
            return Array.isArray(items) ? items.length : 0;
        } catch { return 0; }
    }, []);

    const userName = user?.name || session?.user?.user_metadata?.full_name || 'Chef';
    const userTier = user?.subscriptionTier || 'Free';
    const unlockedVolumes = Array.isArray(user?.unlockedVolumes) ? user.unlockedVolumes : [];
    const unlockedClasses = Array.isArray(user?.unlockedClasses) ? user.unlockedClasses : [];

    const avatarUrl = user?.avatarUrl || session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || null;
    const coverUrl = user?.coverUrl || '/profile-cover.webp';
    const userEmail = session?.user?.email || null;

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file || !session) return;
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}_${Date.now()}.${fileExt}`;
        const filePath = `profiles/${session.user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('public-assets').upload(filePath, file);
        if (uploadError) {
            alert('Upload failed: ' + uploadError.message);
        } else {
            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(filePath);
            if (type === 'avatar') updateUser({ avatarUrl: publicUrl });
            else updateUser({ coverUrl: publicUrl });
        }
        setIsUploading(false);
    };

    const handleAutoGenerate = () => {
        const dateStrings = weekDates.map(d => formatDate(d));
        autoGenerate(dateStrings, publicRecipes);
    };

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-32 font-sans overflow-x-hidden">
            {session ? <HeroBackground coverUrl={coverUrl} onUpload={handleImageUpload} isUploading={isUploading} /> : <div className="fixed inset-0 z-0 bg-[#070B14]" />}
            <Header variant="back" title="Command Center" />

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

            <main className="relative z-10 pt-20 px-4 md:px-8 max-w-6xl mx-auto">
                <div className="flex flex-col items-center mb-12">
                    <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                    <EditProfileModal 
                        isOpen={isEditModalOpen} 
                        onClose={() => setEditModalOpen(false)} 
                        user={user} 
                        onSave={async (data) => await updateUser(data)} 
                    />

                    {session ? (
                        <div className="w-full">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
                                <div className="relative group shrink-0">
                                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-[40px] overflow-hidden border-[0.5px] border-white/20 bg-slate-900 flex items-center justify-center shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <User size={56} className="text-slate-700" />
                                        )}
                                        {isUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Zap className="text-indigo-400 animate-pulse" /></div>}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white cursor-pointer shadow-xl border-2 border-[#070B14] z-20 transition-all active:scale-90">
                                        <Camera size={18} />
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={isUploading} />
                                    </label>
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <div className="flex items-center gap-3 justify-center md:justify-start">
                                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">{userName}</h1>
                                        <button onClick={() => setEditModalOpen(true)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all border border-white/5">
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-600/20">{userTier} MEMBER</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{userEmail}</span>
                                    </div>
                                    {user?.favoriteFood && (
                                        <p className="text-xs font-bold text-amber-400/60 uppercase tracking-tight">Signature Dish: <span className="text-white">{user.favoriteFood}</span></p>
                                    )}
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    {['admin', 'management', 'employee'].includes(user?.role) && (
                                        <button onClick={() => navigate('/admin')} className="h-12 px-6 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3">
                                            <Shield size={16} /> Admin
                                        </button>
                                    )}
                                    <button onClick={signOut} className="h-12 px-6 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex bg-white/5 p-1 rounded-3xl border border-white/5 mb-12 max-w-md mx-auto md:mx-0">
                                {[
                                    { id: 'recipes', label: 'Recipe Vault', icon: Heart },
                                    { id: 'logistics', label: 'Meal Planner', icon: Calendar },
                                    { id: 'settings', label: 'Settings', icon: BellRing }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white text-[#070B14] shadow-xl' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <tab.icon size={14} /> {tab.label.split(' ')[1]}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'recipes' && (
                                    <motion.div 
                                        key="recipes"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-12"
                                    >
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <ProfileStat label="Saved Masterpieces" value={favoriteRecipes.length} icon={Heart} color="rose" />
                                            <ProfileStat label="Pantry Items" value={pantryCount} icon={Refrigerator} color="indigo" />
                                            <ProfileStat label="Unlocked Volumes" value={unlockedVolumes.length} icon={Shield} color="indigo" />
                                            <ProfileStat label="Classes Taken" value={unlockedClasses.length} icon={Zap} color="amber" />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Signature Collection</h2>
                                                </div>
                                            </div>

                                            {favoriteRecipes.length > 0 ? (
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {favoriteRecipes.map((recipe, idx) => (
                                                        <RecipeGridItem key={recipe.id} index={idx} {...recipe} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center p-12 bg-[#0F172A]/20 border-[0.5px] border-dashed border-white/10 rounded-[32px] group hover:bg-[#0F172A]/40 transition-all">
                                                    <Heart size={40} className="mx-auto text-slate-800 mb-4 group-hover:scale-110 transition-transform" />
                                                    <h3 className="text-sm font-black text-white mb-2 uppercase tracking-tight">Vault is Empty</h3>
                                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto mb-8 leading-relaxed">
                                                        Initialize your collection by tapping the heart icon on your favorite culinary productions.
                                                    </p>
                                                    <button 
                                                        onClick={() => navigate('/recipes')}
                                                        className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95">
                                                        Explore Library
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'logistics' && (
                                    <motion.div 
                                        key="logistics"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-8"
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            <div className="lg:col-span-4 space-y-6">
                                                <div className="bg-[#0F172A]/40 border border-white/5 rounded-[32px] p-6 shadow-2xl">
                                                    <div className="flex justify-between items-center mb-6 px-2">
                                                        <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); }} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors text-slate-400"><ChevronLeft size={20}/></button>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                                                            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); }} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors text-slate-400"><ChevronRight size={20}/></button>
                                                    </div>

                                                    <div className="grid grid-cols-7 lg:grid-cols-1 gap-2">
                                                        {weekDates.map((date, i) => {
                                                            const isSelected = formatDate(date) === activeDateStr;
                                                            const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                                                            const dateNum = date.getDate();
                                                            
                                                            return (
                                                                <button 
                                                                    key={i} 
                                                                    onClick={() => setActiveDate(date)} 
                                                                    className={`flex flex-col lg:flex-row items-center justify-between p-3 lg:p-4 rounded-2xl border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-white'}`}
                                                                >
                                                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">{dayStr}</span>
                                                                    <span className="text-xs lg:text-sm font-black">{dateNum}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <button onClick={handleAutoGenerate} className="w-full mt-6 py-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-3">
                                                        <Wand2 size={14} /> AI Planner
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-8 space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                                                        {activeDateStr === formatDate(new Date()) ? "TODAY'S PRODUCTION" : activeDate.toLocaleDateString('en-US', { weekday: 'long' }) + "'S PLAN"}
                                                    </h3>
                                                    <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">{activeDateStr}</div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                                    </motion.div>
                                )}

                                {activeTab === 'settings' && (
                                    <motion.div 
                                        key="settings"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                    >
                                        <div className="space-y-4">
                                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                                                <LockKeyhole size={14} className="text-indigo-400"/> Security & Access
                                            </h2>
                                            <div className="bg-[#0F172A]/40 border-[0.5px] border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group min-h-[240px] flex flex-col justify-center">
                                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                                    <Award size={120} />
                                                </div>
                                                {userTier === 'Premium' ? (
                                                    <div className="space-y-6 relative z-10">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-16 h-16 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20">
                                                                <Shield className="text-indigo-400" size={32} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">FULL EMPIRE ACCESS</p>
                                                                <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest">Premium Tier Active</p>
                                                            </div>
                                                        </div>
                                                        <button className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] transition-all">Manage Production Plan</button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6 relative z-10">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Vault Licenses</p>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Vault Unlocked</span>
                                                                    <span className="text-sm font-black text-indigo-400">{unlockedVolumes.length}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Studio Workshops</span>
                                                                    <span className="text-sm font-black text-indigo-400">{unlockedClasses.length}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => navigate('/shop')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3">
                                                            <Zap size={16}/> Upgrade to Premium
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                                                <BellRing size={14} className="text-amber-400"/> Notifications & Settings
                                            </h2>
                                            <div className="bg-[#0F172A]/40 border-[0.5px] border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                                                <PushManager />
                                                <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/5 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                                            <CheckCircle2 size={18} className="text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-white uppercase tracking-tighter">System Status</p>
                                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">All systems operational</p>
                                                        </div>
                                                    </div>
                                                    <div className="px-2 py-1 bg-emerald-500/20 rounded-md">
                                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Online</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/5 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                                            <Shield size={18} className="text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-white uppercase tracking-tighter">Account Security</p>
                                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">TLS 1.3 Active</p>
                                                        </div>
                                                    </div>
                                                    <div className="px-2 py-1 bg-indigo-500/20 rounded-md">
                                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Secure</span>
                                                    </div>
                                                </div>
                                                <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                                                    <button onClick={() => navigate('/pantry')} className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-3">
                                                        <Refrigerator size={16}/> Pantry
                                                    </button>
                                                    <button onClick={() => navigate('/sanctum')} className="py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-3">
                                                        <Globe size={16}/> Sanctum
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="w-full max-w-lg mx-auto bg-[#0F172A]/80 backdrop-blur-3xl border-[0.5px] border-indigo-500/30 rounded-[40px] p-8 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.5)] relative overflow-hidden mt-8 text-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                            <div className="w-24 h-24 bg-indigo-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 rotate-6 shadow-2xl">
                                <LockKeyhole size={48} className="text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Kitchen Access Required</h2>
                            <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed max-w-sm mx-auto">
                                Secure your personal culinary vault. Save masterpieces, track your pantry, and access elite masterclasses.
                            </p>
                            <button 
                                onClick={() => setAuthModalOpen(true)}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <LogIn size={18} /> Sign In
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
