import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, ChevronDown, CheckCircle2, 
  ChefHat, Package, Star, Eye, EyeOff, Wand2, X,
  Save, Loader2, Minus, List, AlignLeft, Info
} from 'lucide-react';
import { getTierMeta } from '../../../lib/ui';
import { advancedMultiParse } from '../../../lib/parser';
import MediaUploader from '../MediaUploader';

export default function RecipeManager({ 
  recipes, 
  addRecipe, 
  updateRecipe, 
  deleteRecipe, 
  settings, 
  media,
  searchQuery,
  godMode,
  selectedItems,
  toggleSelection,
  showToast,
  requestDelete
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [activeVolume, setActiveVolume] = useState('All');
  const [visibleCount, setVisibleCount] = useState(20);
  const [rawText, setRawText] = useState("");
  
  const [recipeForm, setRecipeForm] = useState({ 
    title: '', author: 'Abid Nasa', time: '30 min', image: null, video: '', 
    category: 'Mains', difficulty: 'Beginner', baseServings: 2, 
    ingredients: [{ name: '', amount: '' }], steps: [''], notes: [''], 
    tags: [], status: 'published', isFeatured: false, 
    volume: 'CWC Original', scheduled_post_date: '' 
  });

  const fRecipes = useMemo(() => recipes.filter(r =>
    (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeVolume === 'All' || r.volume === activeVolume)
  ), [recipes, searchQuery, activeVolume]);

  const handlePostRecipe = async (e) => {
    e.preventDefault();
    try {
      const data = { ...recipeForm };
      
      // Clean up dynamic arrays
      data.ingredients = data.ingredients.filter(i => i.name.trim() !== '');
      data.steps = data.steps.filter(s => s.trim() !== '');
      data.notes = data.notes.filter(n => n.trim() !== '');

      // Handle potential media object to ID mapping
      if (data.image && typeof data.image === 'object') {
        data.cover_image_id = data.image.id;
        data.image = data.image.hero_url || data.image.url;
      }
      if (data.hero_image && typeof data.hero_image === 'object') {
        data.hero_image_id = data.hero_image.id;
        data.hero_image = data.hero_image.hero_url || data.hero_image.url;
      }
      if (data.video && typeof data.video === 'object') {
        data.video_asset_id = data.video.id;
        data.video = data.video.hero_url || data.video.url;
      }

      if (data.id) {
        await updateRecipe(data.id, data);
        showToast("Recipe Updated! 🍳");
      } else {
        await addRecipe(data);
        showToast("Recipe Published! 🍳");
      }
      setIsCreating(false);
    } catch (err) {
      showToast("Failed to save recipe: " + err.message, "error");
    }
  };

  const handleSmartParse = () => {
    const parsedRecipes = advancedMultiParse(rawText);

    if (!parsedRecipes || parsedRecipes.length === 0) {
      showToast("No recipes found. Check format.", "error");
      return;
    }

    if (parsedRecipes.length === 1) {
      const parsed = parsedRecipes[0];
      setRecipeForm({
        ...recipeForm,
        title: parsed.title || recipeForm.title,
        author: parsed.instructor || recipeForm.author || 'Abid Nasa',
        category: parsed.category || recipeForm.category || 'Mains',
        tierRequired: parsed.tier_required || recipeForm.tierRequired || 'Free',
        ingredients: parsed.ingredients.length ? parsed.ingredients : recipeForm.ingredients,
        steps: parsed.steps.length ? parsed.steps : recipeForm.steps,
        notes: parsed.notes.length ? parsed.notes : recipeForm.notes
      });
      showToast("Magic Complete! ✨");
      setRawText("");
    } else {
      showToast(`Detected ${parsedRecipes.length} recipes. Auto-fill supports 1 at a time.`, "info");
    }
  };

  const handleBulkUploadRecipes = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          showToast(`Ingesting ${data.length} recipes...`, "info");
          let successCount = 0;
          for (const item of data) {
            try {
              await addRecipe(item);
              successCount++;
            } catch (err) {
              console.error("Bulk upload item failed:", err);
            }
          }
          showToast(`Successfully ingested ${successCount} recipes! ✨`);
        } else {
          showToast("Invalid JSON format. Expected an array.", "error");
        }
      } catch (err) {
        showToast("Error parsing JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  if (isCreating) {
    return (
      <div className="w-full bg-surface border-[0.5px] border-white/10 rounded-[3rem] overflow-hidden shadow-2xl pb-20">
        <div className="bg-accent p-8 md:p-12 flex justify-between items-center relative overflow-hidden">
          <Wand2 className="absolute right-10 opacity-20 w-40 h-40" />
          <h4 className="text-3xl md:text-5xl font-black text-white relative z-10 tracking-tighter italic">Recipe Master Deck</h4>
          <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-16 md:h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center relative z-10 transition-colors border border-white/20"><X size={32} /></button>
        </div>

        <div className="p-6 md:p-12 space-y-12">
          <div className="p-8 bg-slate-900/50 border-2 border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Wand2 size={80} /></div>
            <h5 className="text-2xl font-black text-white mb-6 flex items-center gap-3">Magic Auto-Fill <span className="text-[10px] bg-accent px-3 py-1 rounded-full uppercase tracking-widest">AI Parsing</span></h5>
            <textarea rows={4} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Paste the whole recipe here (Title, Ingredients, Steps...)" className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-accent transition-all mb-6 custom-scrollbar" />
            <button type="button" onClick={handleSmartParse} className="w-full py-6 bg-slate-800 hover:bg-slate-700 rounded-full font-black text-xl text-white transition-all shadow-xl active:scale-95">Trigger Extraction✨</button>
          </div>

          <form onSubmit={handlePostRecipe} className="space-y-12">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5">
              <div className="flex items-center gap-8">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 ml-1">Lifecycle</span>
                   <div className="flex bg-slate-950 rounded-2xl p-1 border border-white/5">
                     <button type="button" onClick={() => setRecipeForm({ ...recipeForm, status: 'draft' })} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${recipeForm.status === 'draft' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}><EyeOff size={14} className="inline mr-2" />Draft</button>
                     <button type="button" onClick={() => setRecipeForm({ ...recipeForm, status: 'published' })} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${recipeForm.status === 'published' ? 'bg-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Eye size={14} className="inline mr-2" />Live</button>
                   </div>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 ml-1">Promoted</span>
                   <button type="button" onClick={() => setRecipeForm({ ...recipeForm, isFeatured: !recipeForm.isFeatured })} className={`h-11 px-6 rounded-2xl border-2 flex items-center gap-3 transition-all ${recipeForm.isFeatured ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'}`}>
                     <Star size={16} className={recipeForm.isFeatured ? 'fill-amber-500' : ''} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Featured</span>
                   </button>
                 </div>
              </div>
              <div className="h-12 w-[1px] bg-white/5 hidden md:block" />
              <div className="flex-1 max-w-xs">
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 ml-1">Volume Collection</label>
                <select value={recipeForm.volume || 'CWC Original'} onChange={e => setRecipeForm({ ...recipeForm, volume: e.target.value })} className="w-full h-11 bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest text-white cursor-pointer appearance-none outline-none focus:border-accent">
                   {(settings.volumes || []).map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                   <option value="Free">Free (No Volume)</option>
                </select>
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3 lg:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Full Title</label>
                <input required type="text" value={recipeForm.title} onChange={e => setRecipeForm({ ...recipeForm, title: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-xl font-black text-white focus:border-accent outline-none shadow-xl" placeholder="e.g. TRUFFLE BUTTER PANCAKES" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Author</label>
                <input type="text" value={recipeForm.author || ''} onChange={e => setRecipeForm({ ...recipeForm, author: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" placeholder="Abid Nasa" />
              </div>

              <div className="space-y-3">
                 <MediaUploader label="Primary Hero (16:9)" value={recipeForm.hero_image} onChange={(val) => setRecipeForm({ ...recipeForm, hero_image: val })} contentId={recipeForm.id} contentType="recipe" />
              </div>
              <div className="space-y-3">
                 <MediaUploader label="Library Thumbnail (1:1)" value={recipeForm.image} onChange={(val) => setRecipeForm({ ...recipeForm, image: val })} contentId={recipeForm.id} contentType="recipe" />
              </div>
              <div className="space-y-3">
                 <MediaUploader label="Cooking Video (MP4)" value={recipeForm.video} onChange={(val) => setRecipeForm({ ...recipeForm, video: val })} contentId={recipeForm.id} contentType="recipe" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Complexity</label>
                <select value={recipeForm.difficulty || 'Beginner'} onChange={e => setRecipeForm({ ...recipeForm, difficulty: e.target.value })} className="w-full h-16 bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 text-sm font-black uppercase tracking-widest text-white outline-none focus:border-accent appearance-none cursor-pointer">
                  {['Beginner', 'Easy', 'Medium', 'Hard', 'Pro'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Time Investment</label>
                <input type="text" value={recipeForm.time || ''} onChange={e => setRecipeForm({ ...recipeForm, time: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" placeholder="30 min" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Yield / Servings</label>
                <input type="number" value={recipeForm.baseServings || 2} onChange={e => setRecipeForm({ ...recipeForm, baseServings: parseInt(e.target.value) })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" />
              </div>
            </div>

            {/* Dynamic Content Sections */}
            <div className="space-y-12 pt-12 border-t border-white/5">
               {/* Ingredients */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <h5 className="text-2xl font-black text-white flex items-center gap-4"><List className="text-accent" /> Formulation <span className="text-xs text-slate-500 uppercase tracking-widest">(Ingredients)</span></h5>
                    <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { name: '', amount: '' }] })} className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"><Plus size={20} /></button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recipeForm.ingredients.map((ing, i) => (
                       <div key={i} className="flex gap-3 bg-slate-950/50 p-4 rounded-2xl border border-white/5 hover:border-accent/20 transition-all group">
                         <input type="text" value={ing.amount} onChange={e => { const n = [...recipeForm.ingredients]; n[i].amount = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }} className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-accent outline-none focus:border-accent" placeholder="Amt" />
                         <input type="text" value={ing.name} onChange={e => { const n = [...recipeForm.ingredients]; n[i].name = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-accent" placeholder="Ingredient name..." />
                         <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: recipeForm.ingredients.filter((_, idx) => idx !== i) })} className="w-10 h-10 text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Minus size={18} /></button>
                       </div>
                    ))}
                 </div>
               </div>

               {/* Steps */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <h5 className="text-2xl font-black text-white flex items-center gap-4"><AlignLeft className="text-violet-500" /> Execution <span className="text-xs text-slate-500 uppercase tracking-widest">(Methodology)</span></h5>
                    <button type="button" onClick={() => setRecipeForm({ ...recipeForm, steps: [...recipeForm.steps, ''] })} className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"><Plus size={20} /></button>
                 </div>
                 <div className="space-y-4">
                    {recipeForm.steps.map((step, i) => (
                       <div key={i} className="flex gap-4 bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 hover:border-violet-500/20 transition-all group">
                         <div className="w-10 h-10 bg-violet-600/10 text-violet-500 rounded-xl flex items-center justify-center font-black flex-shrink-0">{i + 1}</div>
                         <textarea value={step} onChange={e => { const n = [...recipeForm.steps]; n[i] = e.target.value; setRecipeForm({ ...recipeForm, steps: n }); }} className="flex-1 bg-transparent border-none text-white text-lg font-medium outline-none placeholder:text-slate-700 custom-scrollbar resize-none" rows={2} placeholder="Detail this step..." />
                         <button type="button" onClick={() => setRecipeForm({ ...recipeForm, steps: recipeForm.steps.filter((_, idx) => idx !== i) })} className="w-10 h-10 text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity self-start"><Minus size={18} /></button>
                       </div>
                    ))}
                 </div>
               </div>

               {/* Notes */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <h5 className="text-2xl font-black text-white flex items-center gap-4"><Info className="text-amber-500" /> Intelligence <span className="text-xs text-slate-500 uppercase tracking-widest">(Chef's Notes)</span></h5>
                    <button type="button" onClick={() => setRecipeForm({ ...recipeForm, notes: [...recipeForm.notes, ''] })} className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"><Plus size={20} /></button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recipeForm.notes.map((note, i) => (
                       <div key={i} className="flex gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 hover:border-amber-500/30 transition-all group">
                         <textarea value={note} onChange={e => { const n = [...recipeForm.notes]; n[i] = e.target.value; setRecipeForm({ ...recipeForm, notes: n }); }} className="flex-1 bg-transparent border-none text-amber-100 text-sm font-bold outline-none placeholder:text-amber-900/40 custom-scrollbar resize-none" rows={2} placeholder="Crucial tip or secret..." />
                         <button type="button" onClick={() => setRecipeForm({ ...recipeForm, notes: recipeForm.notes.filter((_, idx) => idx !== i) })} className="w-10 h-10 text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity self-start"><Minus size={18} /></button>
                       </div>
                    ))}
                 </div>
               </div>
            </div>

            <div className="flex gap-4 pt-12">
               <button onClick={() => setIsCreating(false)} className="flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black text-xl uppercase tracking-widest transition-all">Discard Changes</button>
               <button type="submit" className="flex-[2] py-6 bg-accent hover:bg-accent-sec text-white rounded-full font-black text-xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3">
                 <Save size={28} /> {recipeForm.id ? 'Commit Updates' : 'Launch Masterpiece'}
               </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Recipe Archive</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Total Intelligence Assets: {recipes.length}</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <label className="h-12 px-6 bg-slate-900/80 hover:bg-white/10 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer backdrop-blur-xl shadow-xl">
            <Package size={16} className="text-accent" /> Bulk Ingest (JSON)
            <input type="file" accept=".json" className="hidden" onChange={handleBulkUploadRecipes} />
          </label>
          <button 
            onClick={() => {
              setRecipeForm({ 
                title: '', author: 'Abid Nasa', time: '30 min', image: null, video: '', 
                category: 'Mains', difficulty: 'Beginner', baseServings: 2, 
                ingredients: [{ name: '', amount: '' }], steps: [''], notes: [''], 
                tags: [], status: 'published', isFeatured: false, 
                volume: 'CWC Original', scheduled_post_date: '' 
              }); 
              setIsCreating(true); 
            }} 
            className="h-12 px-8 bg-accent hover:bg-accent-sec text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center gap-3 active:scale-95 transition-all"
          >
            <Plus size={18} /> New Recipe
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative group flex-1 max-w-xs">
          <select
            value={activeVolume}
            onChange={(e) => { setActiveVolume(e.target.value); setVisibleCount(20); }}
            className="w-full h-12 bg-slate-900 border border-white/10 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest text-accent appearance-none focus:outline-none focus:border-accent/50 transition-all cursor-pointer shadow-lg"
          >
            {["All Collections", ...new Set([...(settings.volumes?.map(v => v.name) || []), ...recipes.map(r => r.volume).filter(Boolean)])].map(vol => (
              <option key={vol} value={vol === 'All Collections' ? 'All' : vol} className="bg-slate-950 text-white font-bold">{vol}</option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-accent transition-colors">
            <ChevronDown size={16} />
          </div>
        </div>
        <div className="flex gap-2">
           {['published', 'draft'].map(s => (
             <button key={s} className="px-5 py-2.5 bg-slate-900 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">{s}</button>
           ))}
        </div>
      </div>

      {fRecipes.length === 0 ? (
        <div className="text-center py-32 bg-white/5 border-2 border-dashed border-white/5 rounded-[3rem]">
          <ChefHat size={60} className="mx-auto text-slate-800 mb-6" />
          <p className="text-slate-600 font-black uppercase tracking-widest text-sm italic">Library match: Null</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {fRecipes.slice(0, visibleCount).map(r => {
            const tierMeta = getTierMeta(r.tierRequired || 'Free', settings);
            const isSelected = selectedItems.has(r.id);
            return (
              <motion.div layout key={r.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`group relative bg-slate-900/40 border-2 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-2xl ${r.status === 'draft' ? 'opacity-60' : ''} ${isSelected ? 'border-rose-500/50 shadow-[0_20px_50px_rgba(244,63,94,0.15)]' : 'border-white/5 hover:border-accent/40'}`}
              >
                <div className="aspect-[4/3] relative bg-slate-950 overflow-hidden">
                  {r.image
                    ? <img src={r.image} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    : <ChefHat size={40} className="absolute inset-0 m-auto text-slate-800" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {r.isFeatured && <div className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Star size={14} className="fill-white" /></div>}
                  </div>

                  {godMode && (
                    <button onClick={() => toggleSelection(r.id)}
                      className={`absolute top-4 right-4 w-7 h-7 rounded-xl border-2 flex items-center justify-center z-10 transition-all ${isSelected ? 'bg-rose-500 border-rose-500' : 'bg-slate-950/80 border-white/20 backdrop-blur-md hover:border-rose-500/50'}`}>
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </button>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h4 className="text-sm font-black text-white leading-tight line-clamp-2 group-hover:text-accent transition-colors">{r.title}</h4>
                    <span className="text-[10px] font-black text-slate-500 whitespace-nowrap">{r.time}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`} style={tierMeta.customColor ? { borderColor: `${tierMeta.customColor}40`, color: tierMeta.customColor } : {}}>{tierMeta.label}</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">{r.category || 'Mains'}</span>
                  </div>
                </div>
                <div className="px-5 pb-5 flex gap-2">
                  <button 
                    onClick={() => {
                      let parsedNotes = [''];
                      try { parsedNotes = r.notes ? (typeof r.notes === 'string' ? JSON.parse(r.notes) : r.notes) : ['']; } catch (e) { parsedNotes = [r.notes]; }
                      let parsedIngredients = [{ name: '', amount: '' }];
                      try { parsedIngredients = r.ingredients ? (typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients) : [{ name: '', amount: '' }]; } catch (e) { parsedIngredients = [{ name: '', amount: '' }]; }
                      let parsedSteps = [''];
                      try { parsedSteps = r.steps ? (typeof r.steps === 'string' ? JSON.parse(r.steps) : r.steps) : ['']; } catch (e) { parsedSteps = [r.steps]; }
                      
                      const recipeToEdit = { 
                        ...r, 
                        notes: Array.isArray(parsedNotes) ? parsedNotes : [parsedNotes],
                        ingredients: Array.isArray(parsedIngredients) ? parsedIngredients : [{ name: '', amount: '' }],
                        steps: Array.isArray(parsedSteps) ? parsedSteps : [parsedSteps]
                      };
                      if (r.cover_image_id && Array.isArray(media)) recipeToEdit.image = media.find(m => m.id === r.cover_image_id) || r.image;
                      setRecipeForm(recipeToEdit);
                      setIsCreating(true);
                    }} 
                    className="flex-1 py-3 text-slate-400 hover:text-white bg-white/5 hover:bg-accent-dim rounded-2xl border border-white/5 hover:border-accent transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Edit3 size={12} /> Refine
                  </button>
                  <button onClick={() => requestDelete('recipes', r.id, r.title)}
                    className="w-12 h-12 text-rose-500/60 hover:text-white hover:bg-rose-500 bg-rose-500/5 rounded-2xl border border-rose-500/10 hover:border-rose-500 transition-all flex items-center justify-center">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {fRecipes.length > visibleCount && (
        <div className="flex justify-center pt-16">
          <button onClick={() => setVisibleCount(prev => prev + 20)}
            className="px-16 py-4 bg-slate-900 hover:bg-white/5 border-2 border-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all active:scale-95 shadow-xl">
            Reveal More Intel ({fRecipes.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
