import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, PlayCircle, VolumeX, Volume2, Edit2, Loader2, Heart, LockKeyhole, Printer } from 'lucide-react';
import Header from '../components/Header';
import { useRecipes } from '../hooks/useRecipes';
import { useUser } from '../hooks/useUser';
import { useFavorites } from '../hooks/useFavorites';
import { useMedia } from '../hooks/useMedia';
import { useAppSettings } from '../hooks/useAppSettings';
import { createStripeCheckout } from '../lib/stripe';
import { formatPrice } from '../lib/currency';
import { supabase } from '../lib/supabase';
import { OptimizedImage } from '../components/PerformanceUI';
import { getMediaAssetUrl } from '../lib/mediaUtils';
import { normalizeNotes } from '../lib/recipeUtils';

import AccessDeniedModal from '../components/AccessDeniedModal';
import RecipeEditor from '../components/admin/RecipeEditor';
import RecipeMetaStrip from '../components/RecipeMetaStrip';
import IngredientLine from '../components/IngredientLine';
import StepItem from '../components/StepItem';

export default function RecipeView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { publicRecipes, isLoading: recipesLoading, updateRecipe, deleteRecipe } = useRecipes();
    const { user, refreshUserFromDB, hasAccessToRecipe } = useUser();
    const { media } = useMedia();
    const { settings } = useAppSettings();

    const isAdmin = user?.isGod;
    const canPrint = user?.isGod || (user?.subscriptionTier && user.subscriptionTier !== 'Free');
    const { favorites, toggleFavorite } = useFavorites();
    const isFavorite = favorites.includes(id as any);

    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [servings, setServings] = useState(2);
    const [activeStep, setActiveStep] = useState(0);
    const [activeTab, setActiveTab] = useState('ingredients');
    const [isEditing, setIsEditing] = useState(false);
    const [hasAccess, setHasAccess] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    const volumePriceMap = useMemo(() => {
        try { return settings.volumePrices ? JSON.parse(settings.volumePrices) : { "VOL 1": 29, "VOL 2": 39 }; } 
        catch { return { "VOL 1": 29, "VOL 2": 39 }; }
    }, [settings.volumePrices]);

    useEffect(() => {
        if (recipesLoading) return;
        setLoading(true);
        const found = (publicRecipes || []).find((r: any) => r.id?.toString() === id?.toString());
        if (found) {
            setRecipe(found);
            setHasAccess(hasAccessToRecipe(found));
            setLoading(false);
        } else {
            // Fallback: recipe not in cached list — fetch directly by ID
            supabase
                .from('recipes')
                .select('*')
                .eq('id', id)
                .eq('status', 'published')
                .maybeSingle()
                .then(({ data }) => {
                    setRecipe(data || null);
                    setHasAccess(hasAccessToRecipe(data));
                    setLoading(false);
                });
        }
    }, [id, publicRecipes, recipesLoading]);

    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        if (p.get('edit') === 'true' && isAdmin) {
            setIsEditing(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (recipe?.base_servings) setServings(recipe.base_servings);
    }, [recipe]);

    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        const sessionId = p.get('session_id');
        const volumeName = p.get('volume');
        if (!sessionId || !volumeName || !user?.id) return;
        window.history.replaceState({}, document.title, window.location.pathname);
        (async () => {
            try {
                const { data, error } = await supabase.functions.invoke('verify-payment', { body: { session_id: sessionId, type: 'volume', item_id: volumeName, user_id: user.id } });
                if (error || !data?.success) throw new Error(error?.message || 'Verification failed');
                await refreshUserFromDB();
            } catch (err) { console.error('Payment verification failed:', err); }
        })();
    }, [user?.id]);

    const handlePurchase = async () => {
        setCheckoutLoading(true);
        try {
            const price = volumePriceMap[recipe.volume] || 29;
            const url = await createStripeCheckout(price, settings.currency || 'MYR', recipe.volume, `${window.location.origin}/recipe/${id}?payment=success&volume=${encodeURIComponent(recipe.volume)}`);
            if (url) window.location.href = url;
        } catch (err) { alert('Checkout failed.'); } 
        finally { setCheckoutLoading(false); }
    };

    if (loading || recipesLoading) return <div className="min-h-screen bg-base flex justify-center items-center"><Loader2 className="animate-spin text-accent" size={32} /></div>;
    if (!recipe) return <div className="min-h-screen bg-base text-text-1 flex flex-col justify-center items-center gap-4"><ChefHat size={48} className="text-text-3" /><p className="text-sm font-black uppercase tracking-widest text-text-3">Recipe Not Found</p><button onClick={() => navigate('/recipes')} className="text-accent text-[10px] font-black uppercase tracking-widest mt-4">Return to Vault</button></div>;
    if (isEditing && isAdmin) return <div className="min-h-screen bg-base text-text-1"><Header variant="back" title={recipe.title} /><div className="pt-20"><RecipeEditor recipe={recipe} onSave={async (data: any) => { await updateRecipe(data.id, data); setIsEditing(false); }} onCancel={() => setIsEditing(false)} onDelete={async (delId: string) => { await deleteRecipe(delId); navigate('/recipes'); }} /></div></div>;

    const ratio = recipe.base_servings ? servings / recipe.base_servings : 1;
    const priceDisplay = formatPrice(volumePriceMap[recipe.volume] || 29, settings.currency || 'MYR');
    const heroImage = getMediaAssetUrl(recipe.cover_image_id, media, recipe.image);
    const heroVideo = getMediaAssetUrl(recipe.video_id, media, recipe.video_url || recipe.video);
    const ingredientCount = recipe.ingredients?.length || 0;
    const steps = recipe.steps || [];
    const stepCount = steps.length;
    const parsedNotes = normalizeNotes(recipe.notes);
    const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

    return (
        <div className="min-h-screen bg-base text-text-1 selection:bg-accent/30 pb-28 md:pb-20">
            <Header variant="back" title={recipe.title} rightAction={isAdmin ? (<button onClick={() => setIsEditing(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-base/40 backdrop-blur-md border border-glass-border hover:bg-elevated transition-colors text-text-1 shadow-xl"><Edit2 size={16} /></button>) : null} />
            {!hasAccess && <AccessDeniedModal volume={recipe.volume} price={priceDisplay} onPurchase={handlePurchase} loading={checkoutLoading} />}

            <div className="relative h-[52vh] md:h-[65vh] w-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {heroImage ? <OptimizedImage src={heroImage} alt={recipe.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-surface flex items-center justify-center"><ChefHat size={48} className="text-text-3" /></div>}
                    {heroVideo && isPlaying && <motion.video key="hero-video" ref={videoRef} src={heroVideo} autoPlay loop muted={isMuted} playsInline initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/30 to-transparent" />
                </div>
                {heroVideo && !isPlaying && (
                    <button onClick={() => setIsPlaying(true)} className="absolute inset-0 z-10 flex items-center justify-center group">
                        <div className="relative flex items-center justify-center"><div className="absolute w-16 h-16 rounded-full bg-glass-border animate-ping" /><div className="w-14 h-14 rounded-full bg-base/50 backdrop-blur-md border border-glass-border flex items-center justify-center group-hover:bg-base/70 group-hover:scale-110 transition-all shadow-2xl"><PlayCircle size={26} className="text-text-1 ml-0.5" /></div></div>
                    </button>
                )}
                {heroVideo && isPlaying && (
                    <button onClick={() => setIsMuted(m => !m)} className="absolute top-16 right-4 z-20 w-9 h-9 rounded-full bg-base/50 backdrop-blur-md border border-glass-border flex items-center justify-center text-text-3 hover:text-text-1 transition-colors">{isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
                )}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-16 z-10">
                    <div className="flex items-center gap-2 mb-2.5">
                        {recipe.volume && <span className="px-2.5 py-1 bg-accent/90 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-text-1">{recipe.volume}</span>}
                        {recipe.difficulty && <span className="px-2 py-1 bg-elevated backdrop-blur-md rounded-lg text-[9px] font-bold uppercase tracking-widest text-text-3">{recipe.difficulty}</span>}
                        <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest">{recipe.category || 'Signature'}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="flex-1 text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] text-text-1 drop-shadow-2xl">{recipe.title}</h1>
                        <div className="flex items-center gap-2 shrink-0 mt-1">
                            <button onClick={() => canPrint && navigate(`/recipe/${id}/print`)} title={canPrint ? 'Print recipe' : 'Upgrade to print'} className={`relative w-11 h-11 rounded-full bg-base/40 backdrop-blur-md border border-glass-border flex items-center justify-center transition-all ${canPrint ? 'active:scale-90 hover:bg-base/60' : 'opacity-50 cursor-not-allowed'}`}><Printer size={16} className="text-text-3" />{!canPrint && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-warning rounded-full flex items-center justify-center"><LockKeyhole size={8} className="text-text-1" /></span>}</button>
                            <button onClick={() => toggleFavorite(id as any)} className="w-11 h-11 rounded-full bg-base/40 backdrop-blur-md border border-glass-border flex items-center justify-center transition-all active:scale-90 hover:bg-base/60"><Heart size={18} className={isFavorite ? 'text-accent fill-accent' : 'text-text-3'} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <RecipeMetaStrip recipe={recipe} tags={tags} />

            {hasAccess && (
                <>
                    <div className="md:hidden flex border-b border-glass-border">
                        {[{ key: 'ingredients', label: `Bahan-bahan${ingredientCount ? ` (${ingredientCount})` : ''}` }, { key: 'steps', label: `Langkah${stepCount ? ` (${stepCount})` : ''}` }, ...(parsedNotes.length > 0 ? [{ key: 'notes', label: 'Nota Chef' }] : [])].map(({ key, label }) => (
                            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === key ? 'border-accent text-accent' : 'border-transparent text-text-3'}`}>{label}</button>
                        ))}
                    </div>

                    <main className="max-w-4xl mx-auto px-5 pt-6 pb-24">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
                            <div className={`md:col-span-5 ${activeTab !== 'ingredients' ? 'hidden md:block' : ''}`}>
                                <div className="md:sticky md:top-24">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-black italic uppercase tracking-tight text-text-3">Bahan-bahan</h3>
                                        <div className="flex items-center gap-1 bg-glass-bg rounded-full p-1 border border-glass-border">
                                            <button onClick={() => setServings(s => Math.max(1, s - 1))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-elevated text-text-3 hover:text-text-1 transition-colors">−</button>
                                            <span className="text-[10px] font-black w-6 text-center text-text-1">{servings}</span>
                                            <button onClick={() => setServings(s => s + 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-elevated text-text-3 hover:text-text-1 transition-colors">+</button>
                                        </div>
                                    </div>
                                    {ingredientCount > 0 ? (recipe.ingredients || []).map((ing: any, i: number) => <IngredientLine key={i} {...ing} ratio={ratio} />) : <p className="text-sm text-text-3 py-6 text-center">Tiada bahan disenaraikan.</p>}
                                </div>
                            </div>
                            <div className={`md:col-span-7 ${activeTab !== 'steps' ? 'hidden md:block' : ''}`}>
                                <h3 className="text-sm font-black italic uppercase tracking-tight text-text-3 mb-4">Langkah</h3>
                                {stepCount > 0 ? (
                                    <div className="space-y-2.5">
                                        {(() => {
                                            let actualStepNum = 0;
                                            return steps.map((step: any, i: number) => {
                                                const text = typeof step === 'string' ? step : step?.instruction || String(step);
                                                const isSection = text.startsWith('──') && text.endsWith('──');
                                                if (!isSection) {
                                                    actualStepNum++;
                                                }
                                                return (
                                                    <StepItem 
                                                        key={i} 
                                                        step={step} 
                                                        index={i} 
                                                        stepNumber={isSection ? undefined : actualStepNum} 
                                                        active={activeStep === i} 
                                                        onClick={() => setActiveStep(i)} 
                                                    />
                                                );
                                            });
                                        })()}
                                    </div>
                                ) : (
                                    <p className="text-sm text-text-3 py-6 text-center">Tiada langkah disenaraikan.</p>
                                )}
                                {parsedNotes.length > 0 && (
                                    <div className="hidden md:block mt-8 pt-6 border-t border-glass-border">
                                        <h3 className="text-sm font-black italic uppercase tracking-tight text-text-3 mb-3">Nota Chef</h3>
                                        <ul className="space-y-2">{parsedNotes.map((note: string, i: number) => <li key={i} className="flex gap-2 text-sm text-text-3 leading-relaxed"><span className="text-accent shrink-0 mt-0.5">•</span>{note}</li>)}</ul>
                                    </div>
                                )}
                            </div>
                            {parsedNotes.length > 0 && (
                                <div className={`md:hidden col-span-full ${activeTab !== 'notes' ? 'hidden' : ''}`}>
                                    <h3 className="text-sm font-black italic uppercase tracking-tight text-text-3 mb-4">Nota Chef</h3>
                                    <ul className="space-y-3">{parsedNotes.map((note: string, i: number) => <li key={i} className="flex gap-3 p-4 bg-glass-bg border border-glass-border rounded-2xl text-sm text-text-3 leading-relaxed"><span className="text-accent shrink-0 font-black mt-0.5">•</span>{note}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    </main>
                </>
            )}
        </div>
    );
}
