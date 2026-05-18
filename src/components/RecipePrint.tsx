import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Star, Users, ChefHat, Printer, X, BookOpen, LockKeyhole } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { useMedia } from '../hooks/useMedia';
import { useUser } from '../hooks/useUser';
import { getMediaAssetUrl } from '../lib/mediaUtils';

const toStepText = (s: any) => (typeof s === 'string' ? s : s?.instruction || '');
const normalizeNotes = (notes: any) => {
    if (!notes) return [];
    if (Array.isArray(notes)) return notes.filter(Boolean);
    try { const p = JSON.parse(notes); return Array.isArray(p) ? p.filter(Boolean) : []; }
    catch { return [notes]; }
};

export default function RecipePrint() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { publicRecipes, isLoading } = useRecipes();
    const { media } = useMedia();
    const { user } = useUser();
    const canPrint = user?.isGod || (user?.subscriptionTier && user.subscriptionTier !== 'Free');

    const recipe = (publicRecipes || []).find((r: any) => r.id?.toString() === id?.toString());
    const heroImage = recipe ? getMediaAssetUrl(recipe.cover_image_id, media, recipe.image) : null;
    const parsedNotes = normalizeNotes(recipe?.notes);
    const steps = (recipe?.steps || []).map(toStepText).filter(Boolean);
    const ingredients = (recipe?.ingredients || []).filter((i: any) => i?.name);
    const tags = Array.isArray(recipe?.tags) ? recipe.tags : [];

    if (isLoading) return <div className="min-h-screen bg-text-1 flex items-center justify-center"><ChefHat size={32} className="animate-pulse text-border" /></div>;
    if (!recipe) return <div className="min-h-screen bg-text-1 flex flex-col items-center justify-center gap-4"><BookOpen size={40} className="text-border" /><p className="section-label text-text-3">Recipe not found</p><button onClick={() => navigate(-1)} className="text-xs text-text-3 underline">Go back</button></div>;
    if (!canPrint) return (
        <div className="min-h-screen bg-text-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center"><LockKeyhole size={28} className="text-warning" /></div>
            <div><h2 className="text-xl font-black uppercase tracking-tight text-base mb-2">Members Only</h2><p className="text-sm text-text-3 max-w-xs leading-relaxed">Print access is available to premium members. Upgrade your plan to print and save recipes.</p></div>
            <div className="flex gap-3"><button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-surface text-text-2 text-xs font-bold rounded-xl hover:bg-elevated transition-colors">Go Back</button><button onClick={() => navigate('/profile')} className="px-5 py-2.5 bg-base text-text-1 text-xs font-bold rounded-xl hover:bg-elevated transition-colors">Upgrade Plan</button></div>
        </div>
    );

    return (
        <>
            <style>{`@media print { .no-print { display: none !important; } .print-page { padding-top: 0 !important; } body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { margin: 1.8cm; size: A4; } }`}</style>
            <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5 bg-text-1/95 backdrop-blur-md border-b border-border shadow-sm">
                <div className="flex items-center gap-3"><img src="/CWC.svg" alt="CWC+" className="h-7 w-auto" onError={e => { e.currentTarget.style.display='none'; }} /><div className="h-4 w-px bg-border" /><span className="section-label text-text-3">Print Preview</span></div>
                <div className="flex items-center gap-2"><button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-text-3 hover:text-base rounded-lg hover:bg-surface transition-all"><X size={14} /> Close</button><button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 bg-base text-text-1 text-xs font-bold rounded-lg hover:bg-elevated transition-all shadow-sm"><Printer size={14} /> Print</button></div>
            </div>
            <div className="print-page max-w-[740px] mx-auto px-8 pt-24 pb-20 bg-text-1 min-h-screen text-base">
                {heroImage && <div className="aspect-[16/7] w-full rounded-2xl overflow-hidden mb-8 bg-surface"><img src={heroImage} alt={recipe.title} className="w-full h-full object-cover" /></div>}
                <div className="mb-7 pb-7 border-b border-border">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9] text-base mb-5">{recipe.title}</h1>
                    <div className="flex items-center gap-6 flex-wrap text-text-2">
                        {recipe.time && <div className="flex items-center gap-1.5"><Clock size={13} /><span className="text-sm font-semibold">{recipe.time}</span></div>}
                        <div className="flex items-center gap-1.5"><Star size={13} className="text-warning fill-warning" /><span className="text-sm font-semibold">{recipe.rating || '4.9'}</span></div>
                        {(recipe.base_servings || recipe.baseServings) && <div className="flex items-center gap-1.5"><Users size={13} /><span className="text-sm font-semibold">{recipe.base_servings || recipe.baseServings} servings</span></div>}
                        {recipe.author && <span className="text-sm">by <span className="font-semibold">{recipe.author}</span></span>}
                    </div>
                </div>
                {recipe.description && <p className="text-sm text-text-2 leading-relaxed italic mb-8 max-w-xl">{recipe.description}</p>}
                <div className="grid grid-cols-5 gap-10 mb-10">
                    <div className="col-span-2">
                        <h2 className="section-label mb-4 pb-2 border-b border-border text-text-3">Ingredients</h2>
                        {ingredients.length > 0 ? ingredients.map((ing: any, i: number) => (
                            <div key={i} className="flex justify-between items-baseline py-2 border-b border-border/50 last:border-0"><span className="text-sm text-base capitalize leading-snug">{ing.name}</span><span className="text-xs font-bold text-text-3 ml-3 shrink-0 tabular-nums">{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</span></div>
                        )) : <p className="text-xs text-text-3 italic">No ingredients listed.</p>}
                    </div>
                    <div className="col-span-3">
                        <h2 className="section-label mb-4 pb-2 border-b border-border text-text-3">Method</h2>
                        {steps.length > 0 ? <ol className="space-y-5">{steps.map((step: any, i: number) => (
                            <li key={i} className="flex gap-3.5"><span className="w-5 h-5 rounded-full bg-base text-text-1 text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span><p className="text-sm text-text-2 leading-relaxed">{step}</p></li>
                        ))}</ol> : <p className="text-xs text-text-3 italic">No steps listed.</p>}
                    </div>
                </div>
                {parsedNotes.length > 0 && (
                    <div className="mb-10 p-6 bg-surface rounded-2xl">
                        <h2 className="section-label mb-4 text-text-3">Chef's Notes</h2>
                        <ul className="space-y-2.5">{parsedNotes.map((note: any, i: number) => (
                            <li key={i} className="flex gap-3 text-sm text-text-2 leading-relaxed"><span className="text-text-3 shrink-0 font-bold mt-0.5">—</span>{note}</li>
                        ))}</ul>
                    </div>
                )}
            </div>
        </>
    );
}
