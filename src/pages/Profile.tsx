import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, LockKeyhole, LogOut, Camera, User, Shield, Zap, Settings, Calendar, Wand2, ChevronRight, ChevronLeft, Edit3, Loader2 } from 'lucide-react';
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
import { APP_COPY } from '../config/appCopy';
import { createStripeCheckout } from '../lib/stripe';
import { useAppSettings } from '../hooks/useAppSettings';
import EditProfileModal from '../components/EditProfileModal';
import ProfileRecipeCard from '../components/ProfileRecipeCard';

const HeroBackground = ({ coverUrl }: { coverUrl: string | null }) => (
    <div className="absolute top-0 left-0 w-full h-[25vh] md:h-[35vh] z-0 overflow-hidden bg-base">
        {coverUrl && <img src={coverUrl} alt="Cover" className="w-full h-full object-cover opacity-30 transition-transform duration-1000" />}
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/80 to-transparent pointer-events-none" />
    </div>
);

const ProfileStat = ({ label, value, icon: Icon, color = "accent" }: any) => (
    <div className="bg-glass-bg border border-glass-border rounded-2xl p-4 flex flex-col items-center justify-center text-center group transition-all hover:bg-elevated">
        <div className={`p-1.5 rounded-xl bg-${color}/10 text-${color} mb-1.5 group-hover:scale-110 transition-transform`}><Icon size={16} /></div>
        <p className="text-base font-black text-text-1 leading-tight">{value}</p>
        <p className="text-[8px] font-black uppercase tracking-widest text-text-3 mt-0.5">{label}</p>
    </div>
);

export default function Profile() {
    const { favorites } = useFavorites();
    const { publicRecipes } = useRecipes();
    const { session, user, updateUser, signOut } = useUser();
    const { media } = useMedia();
    const { plan, updatePlan, autoGenerate, clearPlan } = usePlanner();
    const { settings } = useAppSettings();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('recipes');
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    
    const [showHeader, setShowHeader] = useState(true);
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", (latest: number) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 100) setShowHeader(false);
        else setShowHeader(true);
    });

    const unlockedVolumes = user?.unlockedVolumes || [];
    const unlockedClasses = user?.unlockedClasses || [];
    const favoriteRecipes = (publicRecipes || []).filter((r: any) => (favorites || []).includes(r?.id));

    const userName = user?.name || session?.user?.user_metadata?.full_name || 'Aliff Hussien';
    const userTier = user?.subscriptionTier || 'Free';
    const avatarUrl = user?.avatarUrl || session?.user?.user_metadata?.avatar_url || null;
    const coverUrl = user?.coverUrl || '/profile-cover.webp';
    const userEmail = session?.user?.email || null;

    const [baseDate, setBaseDate] = useState(new Date());
    const [activeDate, setActiveDate] = useState(new Date());
    const [pickingFor, setPickingFor] = useState<{date: string, type: string} | null>(null);

    const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
    const activeDateStr = formatDate(activeDate);
    const dayPlan = plan[activeDateStr] || {};
    const getRecipeObj = (id: string) => (publicRecipes || []).find((r: any) => r.id === id) || null;

    const handleAutoGenerate = () => {
        autoGenerate(weekDates.map(d => formatDate(d)), publicRecipes || []);
    };

    const handleImageUpload = async (e: any, type: string) => {
        const file = e.target.files[0];
        if (!file || !session) return;
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const filePath = `profiles/${session.user.id}/${type}_${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage.from('public-assets').upload(filePath, file);
        if (error) alert('Upload failed: ' + error.message);
        else {
            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(filePath);
            await updateUser(type === 'avatar' ? { avatarUrl: publicUrl } : { coverUrl: publicUrl });
        }
        setIsUploading(false);
    };

    const handleSubscribe = async () => {
        setCheckoutLoading(true);
        try {
            const checkoutUrl = await createStripeCheckout(99, settings?.currency || 'MYR', 'CWC+ VIP License', window.location.href);
            if (checkoutUrl) window.location.href = checkoutUrl;
        } catch (err) { console.error("Checkout failed", err); }
        finally { setCheckoutLoading(false); }
    };

    return (
        <div className="relative min-h-screen bg-base text-text-1 selection:bg-accent/30 pb-[env(safe-area-inset-bottom,32px)] font-sans overflow-x-hidden">
            {session ? (
                <>
                    <HeroBackground coverUrl={coverUrl} />
                    <div className="absolute top-0 left-0 w-full h-[25vh] md:h-[35vh] z-20 pointer-events-none flex items-end justify-end p-4 md:p-8">
                        <label className="p-2.5 bg-base/40 backdrop-blur-xl rounded-2xl text-text-1 cursor-pointer border border-glass-border z-30 pointer-events-auto transition-all active:scale-90 shadow-2xl">
                            <Camera size={16} strokeWidth={2.5} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} disabled={isUploading} />
                        </label>
                    </div>
                </>
            ) : <div className="fixed inset-0 z-0 bg-base" />}

            <motion.div animate={{ y: showHeader ? 0 : -100 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="fixed top-0 left-0 right-0 z-[100] pt-[env(safe-area-inset-top,0px)] bg-base/90 backdrop-blur-2xl border-b border-glass-border">
                <Header variant="back" title={APP_COPY.navigation.profile} userName={userName} isStatic />
            </motion.div>

            <RecipePickerModal isOpen={!!pickingFor} onClose={() => setPickingFor(null)} recipes={publicRecipes || []} mediaList={media} onSelect={(recipeId) => { if (pickingFor) updatePlan(pickingFor.date, pickingFor.type, recipeId); setPickingFor(null); }} />

            <main className="relative z-10 pt-20 px-6 max-w-6xl mx-auto">
                <div className="flex flex-col items-center mb-8">
                    <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                    <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} user={user} onSave={async (data) => await updateUser(data)} />

                    {session ? (
                        <div className="w-full">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 mb-8">
                                <div className="relative group shrink-0">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] overflow-hidden border border-glass-border bg-surface flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500">
                                        {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User size={40} className="text-text-3" />}
                                        {isUploading && <div className="absolute inset-0 bg-base/60 flex items-center justify-center"><Zap className="text-accent animate-pulse" /></div>}
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 p-2 bg-accent rounded-2xl text-text-1 cursor-pointer shadow-xl border-2 border-base z-20 active:scale-90 transition-transform">
                                        <Camera size={14} />
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={isUploading} />
                                    </label>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <h1 className="text-2xl md:text-4xl font-black text-text-1 tracking-tighter uppercase italic">{userName}</h1>
                                        <button onClick={() => setEditModalOpen(true)} className="p-1.5 rounded-xl bg-glass-bg hover:bg-elevated text-text-3 transition-colors"><Edit3 size={14} /></button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 justify-center md:justify-start">
                                        <span className="px-2 py-0.5 bg-accent text-text-1 text-[8px] font-black uppercase tracking-widest rounded shadow-lg shadow-accent/20">{userTier} MEMBER</span>
                                        <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">{userEmail}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {user?.isGod && <button onClick={() => navigate('/admin')} className="h-10 px-4 bg-accent/10 border border-accent/20 text-accent rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"><Shield size={14} /> Admin</button>}
                                    <button onClick={() => signOut()} className="h-10 px-4 bg-glass-bg border border-glass-border rounded-xl font-black text-[9px] uppercase tracking-widest text-text-3 active:scale-95 transition-all"><LogOut size={14} /></button>
                                </div>
                            </div>

                            <div className="flex bg-glass-bg p-1 rounded-2xl border border-glass-border mb-8 max-w-sm mx-auto md:mx-0">
                                {[{ id: 'recipes', icon: Heart }, { id: 'logistics', icon: Calendar }, { id: 'settings', icon: Settings }].map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-text-1 text-base shadow-lg' : 'text-text-3 hover:text-text-1'}`}>
                                        <tab.icon size={14} /><span>{tab.id}</span>
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'recipes' && (
                                    <motion.div key="recipes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <ProfileStat label="SAVED" value={favoriteRecipes.length} icon={Heart} color="danger" />
                                            <ProfileStat label="VOLUMES" value={unlockedVolumes.length} icon={Shield} />
                                            <ProfileStat label="CLASSES" value={unlockedClasses.length} icon={Zap} color="warning" />
                                        </div>
                                        <div className="space-y-4">
                                            {favoriteRecipes.length > 0 ? (
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                    {favoriteRecipes.map((recipe: any, idx: number) => <ProfileRecipeCard key={recipe.id} index={idx} {...recipe} />)}
                                                </div>
                                            ) : (
                                                <div className="text-center p-10 bg-glass-bg border border-dashed border-glass-border rounded-[2rem] group hover:bg-elevated transition-all">
                                                    <Heart size={32} className="mx-auto text-text-3 mb-3 group-hover:scale-110 transition-transform" />
                                                    <p className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] mb-6 leading-relaxed">Initialize your collection in the library.</p>
                                                    <button onClick={() => navigate('/recipes')} className="px-6 py-3 rounded-xl bg-accent text-text-1 text-[9px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">Explore Vault</button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'logistics' && (
                                    <motion.div key="logistics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                            <div className="lg:col-span-4">
                                                <div className="bg-glass-bg border border-glass-border rounded-[2.5rem] p-5 shadow-2xl">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); }} className="p-2 hover:bg-elevated rounded-xl transition-colors text-text-3"><ChevronLeft size={16} /></button>
                                                        <span className="section-label text-accent">{weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); }} className="p-2 hover:bg-elevated rounded-xl transition-colors text-text-3"><ChevronRight size={16} /></button>
                                                    </div>
                                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
                                                        {weekDates.map((date, i) => {
                                                            const isSelected = formatDate(date) === activeDateStr;
                                                            return (
                                                                <button key={i} onClick={() => setActiveDate(date)} className={`flex-shrink-0 w-12 py-3 rounded-2xl border transition-all snap-start flex flex-col items-center gap-1 ${isSelected ? 'bg-accent border-accent text-text-1 shadow-lg' : 'bg-glass-bg border-glass-border text-text-3 hover:text-text-1 hover:border-border'}`}>
                                                                    <span className="text-[8px] font-black uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                                    <span className="text-xs font-black">{date.getDate()}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <button onClick={handleAutoGenerate} className="w-full mt-4 py-3 rounded-xl bg-glass-bg border border-dashed border-glass-border section-label text-text-3 hover:text-text-1 hover:border-border flex items-center justify-center gap-2 transition-all active:scale-95">
                                                        <Wand2 size={12} /> Smart Sync Plan
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="lg:col-span-8 space-y-4">
                                                {['Breakfast', 'Lunch', 'Dinner'].map(type => (
                                                    <MealSlot key={type} type={type} meal={getRecipeObj(dayPlan[type] as string)} onAdd={() => setPickingFor({ date: activeDateStr, type })} onRemove={() => clearPlan(activeDateStr, type)} mediaList={media} />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'settings' && (
                                    <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-glass-bg border border-glass-border rounded-[2rem] p-6 shadow-2xl">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20"><Shield className="text-accent" size={20} /></div>
                                                <p className="text-[10px] font-black text-text-1 italic uppercase tracking-widest leading-none">Access Control</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-3 bg-glass-bg border border-glass-border rounded-xl">
                                                    <span className="section-label">Vault Tier</span>
                                                    <span className="text-xs font-black text-accent">{userTier}</span>
                                                </div>
                                            </div>
                                            <button disabled={checkoutLoading} onClick={handleSubscribe} className="w-full mt-6 py-3.5 bg-accent text-text-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                                                {checkoutLoading ? <Loader2 size={16} className="animate-spin" /> : "Get Full License"}
                                            </button>
                                        </div>
                                        <div className="bg-glass-bg border border-glass-border rounded-[2rem] p-6 shadow-2xl space-y-6">
                                            <PushManager />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm mx-auto bg-glass-bg border border-accent/20 rounded-[2.5rem] p-10 shadow-2xl text-center">
                            <LockKeyhole size={40} className="mx-auto text-accent mb-6 opacity-40" />
                            <h2 className="text-2xl font-black text-text-1 mb-3 tracking-tighter uppercase italic">License Required</h2>
                            <button onClick={() => setAuthModalOpen(true)} className="w-full py-4 bg-accent rounded-xl text-text-1 font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Identify Chef</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
