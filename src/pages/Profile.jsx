import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Heart, LockKeyhole, LogIn, LogOut, Refrigerator, Camera, User, X, Save, Edit3 } from 'lucide-react';
import Header from '../components/Header';
import { useFavorites } from '../hooks/useFavorites';
import { useRecipes } from '../hooks/useRecipes';
import { useUser } from '../hooks/useUser';
import AuthModal from '../components/AuthModal';
import { supabase } from '../lib/supabase';

const HeroBackground = ({ coverUrl, onUpload, isUploading }) => (
    <div className="absolute top-0 left-0 w-full h-[35vh] md:h-[45vh] z-0 overflow-hidden bg-[#070B14] group">
        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent pointer-events-none" />
        {onUpload && (
            <label className={`absolute top-24 right-4 md:right-10 p-3 bg-black/60 backdrop-blur-md rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 shadow-xl border border-white/20 z-50 ${isUploading ? 'animate-pulse' : ''}`}>
                <Camera size={20} />
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#070B14]/85 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-md card-3d-base rounded-[36px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.9)] border border-white/10 p-8">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors z-20 border border-white/10">
                    <X size={18} />
                </button>
                <h2 className="text-2xl font-black text-white mb-6">Edit Profile</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
                            placeholder="Chef John"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4 ml-1">Favorite Food</label>
                        <input 
                            type="text" 
                            value={food} 
                            onChange={(e) => setFood(e.target.value)}
                            className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
                            placeholder="e.g. Wagyu Steak, Spicy Ramen"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-6 ml-1">Dietary Preferences</label>
                        <div className="flex flex-wrap gap-2">
                            {dietOptions.map(option => (
                                <button 
                                    key={option}
                                    onClick={() => toggleDiet(option)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${diet.includes(option) ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 mt-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-wide shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
            <div className="absolute top-0 left-0 right-0 h-[75%] z-0 rounded-t-[20px] overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent pointer-events-none" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-[30%] card-3d-glare pointer-events-none z-10" />
            <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 flex items-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <Star size={8} className="text-amber-400 fill-amber-400" />
                <span className="text-[9px] font-bold text-white">{rating}</span>
            </div>
            <div className="relative z-20 mt-auto p-2.5 pt-0">
                <h4 className="text-[11px] md:text-sm text-white/95 font-bold mb-1 line-clamp-2 leading-snug drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{title}</h4>
                <div className="flex items-center gap-1 text-slate-400 text-[9px] md:text-[10px] font-semibold">
                    <Clock size={10} className="text-indigo-400" />
                    <span>{time}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default function Profile() {
    const { favorites } = useFavorites();
    const { publicRecipes } = useRecipes();
    const { session, user, signOut, updateUser } = useUser();
    const navigate = useNavigate();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const favoriteRecipes = publicRecipes.filter(r => favorites.includes(r.id));

    // Safe defaults while user loads from localStorage
    const userName = user?.name || session?.user?.user_metadata?.full_name || 'Chef';
    const userTier = user?.subscriptionTier || 'Free';
    const unlockedVolumes = user?.unlockedVolumes || [];
    const unlockedClasses = user?.unlockedClasses || [];

    const avatarUrl = user?.avatarUrl || session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || null;
    const coverUrl = user?.coverUrl || '/profile-cover.webp'; // Default mock background
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

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 pb-24">
            {session ? <HeroBackground coverUrl={coverUrl} onUpload={handleImageUpload} isUploading={isUploading} /> : <div className="fixed inset-0 z-0 bg-[#070B14]" />}
            <Header variant="back" title="My Profile" />

            <main className="relative z-10 pt-24 px-4 md:px-10 max-w-5xl mx-auto">
                <div className="flex flex-col items-center mb-10 text-center">
                    <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                    <EditProfileModal 
                        isOpen={isEditModalOpen} 
                        onClose={() => setEditModalOpen(false)} 
                        user={user} 
                        onSave={async (data) => await updateUser(data)} 
                    />

                    {session ? (
                        <>
                            <div className="relative mb-4 group">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#070B14] bg-slate-800 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative z-10">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <User size={48} className="text-slate-500" />
                                    )}
                                </div>
                                <label className={`absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white cursor-pointer shadow-lg border-2 border-[#070B14] z-20 transition-all ${isUploading ? 'animate-pulse' : ''} scale-90 md:scale-100`}>
                                    <Camera size={16} />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={isUploading} />
                                </label>
                            </div>
                            <div className="flex items-center gap-2 mb-1 justify-center">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{userName}</h1>
                                <button onClick={() => setEditModalOpen(true)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                            {userEmail && (
                                <p className="text-xs font-medium text-slate-500 mb-1">{userEmail}</p>
                            )}
                            {user?.favoriteFood && (
                                <p className="text-xs font-medium text-amber-400/80 mb-2 italic">Loves: {user.favoriteFood}</p>
                            )}
                            <div className="flex items-center gap-2 mb-4 justify-center">
                                <p className="text-sm font-medium text-indigo-400 uppercase tracking-widest">{userTier} Member</p>
                                {user?.dietaryPreferences?.length > 0 && (
                                    <>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {user.dietaryPreferences.join(', ')}
                                        </p>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex gap-3 mb-8">
                                <button 
                                    onClick={() => navigate('/pantry')}
                                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:text-white transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center gap-1.5"
                                >
                                    <Refrigerator size={14} /> My Pantry
                                </button>
                                
                                {['admin', 'management', 'employee'].includes(user?.role) && (
                                    <button 
                                        onClick={() => navigate('/admin')}
                                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                                    >
                                        Access Admin Panel
                                    </button>
                                )}

                                <button 
                                    onClick={signOut}
                                    className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                            
                            <div className="w-full max-w-sm mx-auto text-left mb-6">
                                <h2 className="text-sm font-bold flex items-center gap-2 mb-3 text-slate-300"><LockKeyhole size={16} className="text-emerald-400"/> My Vault (Unlocked Content)</h2>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                                    {userTier === 'Premium' ? (
                                        <p className="text-xs text-emerald-400 font-bold text-center">You have Premium access to everything.</p>
                                    ) : (
                                        <>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Unlocked Volumes</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {unlockedVolumes.length > 0 ? unlockedVolumes.map((v, i) => <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs">{v}</span>) : <span className="text-xs text-slate-500">None</span>}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Unlocked Classes</p>
                                            <div className="flex flex-wrap gap-2">
                                                {unlockedClasses.length > 0 ? unlockedClasses.map((v, i) => <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs">Class ID: {v}</span>) : <span className="text-xs text-slate-500">None</span>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full max-w-lg mx-auto bg-[#0F172A]/80 backdrop-blur-xl border border-indigo-500/30 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden mt-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/5 pointer-events-none" />
                            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                <LockKeyhole size={36} className="text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-3">Your Kitchen Awaits</h2>
                            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                                Join CWC+ to unlock premium recipes, save your favorite meals, manage your personal pantry, and access exclusive masterclasses.
                            </p>
                            <button 
                                onClick={() => setAuthModalOpen(true)}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-black text-lg shadow-[0_8px_20px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <LogIn size={20} /> Sign In or Create Account
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Heart size={18} className="text-rose-400 fill-rose-400" />
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Saved Favorites</h2>
                    </div>
                    <span className="text-sm font-bold text-slate-400">{favoriteRecipes.length} recipes</span>
                </div>

                {favoriteRecipes.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                        {favoriteRecipes.map((recipe, idx) => (
                            <RecipeGridItem key={recipe.id} index={idx} {...recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 md:p-12 card-3d-base rounded-[24px] border border-white/10 mt-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                        <Heart size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">No favorites yet</h3>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                            Start exploring our culinary library and tap the heart icon to save recipes here for quick access later!
                        </p>
                        <button 
                            onClick={() => navigate('/recipes')}
                            className="px-6 py-2.5 rounded-[12px] btn-3d-active text-white text-sm font-extrabold shadow-[0_4px_12px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-transform">
                            Discover Recipes
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
