import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, ChevronDown, CheckCircle2, 
  ChefHat, Package, Star
} from 'lucide-react';
import { getTierMeta } from '../../../lib/ui';
import { advancedMultiParse } from '../../../lib/parser';
import RecipeManagerEditor from './RecipeManagerEditor';

interface RecipeManagerProps {
  recipes: any[];
  addRecipe: (data: any) => Promise<void>;
  updateRecipe: (id: string, data: any) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  settings: any;
  media: any[];
  searchQuery: string;
  godMode?: boolean;
  selectedItems: Set<string>;
  toggleSelection: (id: string) => void;
  showToast: (msg: string, type?: string) => void;
  requestDelete: (coll: string, id: string, title: string) => void;
}

export default function RecipeManager({ 
  recipes, 
  addRecipe, 
  updateRecipe, 
  settings, 
  media,
  searchQuery,
  godMode,
  selectedItems,
  toggleSelection,
  showToast,
  requestDelete
}: RecipeManagerProps) {
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

  const handlePostRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...recipeForm };
      data.ingredients = data.ingredients.filter((i: any) => i.name.trim() !== '');
      data.steps = data.steps.filter((s: any) => s.trim() !== '');
      data.notes = data.notes.filter((n: any) => n.trim() !== '');

      if (data.image && typeof data.image === 'object') {
        (data as any).cover_image_id = (data.image as any).id;
        data.image = (data.image as any).hero_url || (data.image as any).url;
      }
      if ((data as any).hero_image && typeof (data as any).hero_image === 'object') {
        (data as any).hero_image_id = ((data as any).hero_image as any).id;
        (data as any).hero_image = ((data as any).hero_image as any).hero_url || ((data as any).hero_image as any).url;
      }
      if (data.video && typeof data.video === 'object') {
        (data as any).video_asset_id = (data.video as any).id;
        data.video = (data.video as any).hero_url || (data.video as any).url;
      }

      if ((data as any).id) {
        await updateRecipe((data as any).id, data);
        showToast("Recipe Updated! 🍳");
      } else {
        await addRecipe(data);
        showToast("Recipe Published! 🍳");
      }
      setIsCreating(false);
    } catch (err: any) {
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

  const handleBulkUploadRecipes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          showToast(`Ingesting ${data.length} recipes...`, "info");
          let successCount = 0;
          for (const item of data) {
            try {
              await addRecipe(item);
              successCount++;
            } catch (err) {
              // Fail silently for individual items in bulk upload
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
    return <RecipeManagerEditor recipeForm={recipeForm} setRecipeForm={setRecipeForm} rawText={rawText} setRawText={setRawText} handleSmartParse={handleSmartParse} handlePostRecipe={handlePostRecipe} setIsCreating={setIsCreating} settings={settings} />;
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h3 className="text-3xl font-black text-text-1 italic tracking-tighter uppercase leading-none">Recipe Archive</h3>
          <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.4em] mt-2">Total Intelligence Assets: {recipes.length}</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <label className="h-12 px-6 bg-base hover:bg-glass-bg border border-glass-border rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer backdrop-blur-xl shadow-xl text-text-1">
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
            className="h-12 px-8 bg-accent hover:bg-accent/85 text-text-1 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center gap-3 active:scale-95 transition-all"
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
            className="w-full h-12 bg-base border border-glass-border rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest text-accent appearance-none focus:outline-none focus:border-accent/50 transition-all cursor-pointer shadow-lg"
          >
            {["All Collections", ...new Set([...(settings.volumes?.map((v: any) => v.name) || []), ...recipes.map(r => r.volume).filter(Boolean)])].map(vol => (
              <option key={vol} value={vol === 'All Collections' ? 'All' : vol} className="bg-surface text-text-1 font-bold">{vol}</option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-3 group-hover:text-accent transition-colors">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {fRecipes.length === 0 ? (
        <div className="text-center py-32 bg-glass-bg border-2 border-dashed border-glass-border rounded-[3rem]">
          <ChefHat size={60} className="mx-auto text-text-3 mb-6" />
          <p className="text-text-3 font-black uppercase tracking-widest text-sm italic">Library match: Null</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {fRecipes.slice(0, visibleCount).map(r => {
            const tierMeta = getTierMeta(r.tierRequired || 'Free', settings);
            const isSelected = selectedItems.has(r.id);
            return (
              <motion.div layout key={r.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`group relative bg-base border-2 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-2xl ${r.status === 'draft' ? 'opacity-60' : ''} ${isSelected ? 'border-danger/50 shadow-[0_20px_50px_rgba(244,63,94,0.15)]' : 'border-glass-border hover:border-accent/40'}`}
              >
                <div className="aspect-[4/3] relative bg-surface overflow-hidden">
                  {r.image
                    ? <img src={r.image} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    : <ChefHat size={40} className="absolute inset-0 m-auto text-text-3" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    {r.isFeatured && <div className="w-8 h-8 bg-warning text-text-1 rounded-xl flex items-center justify-center shadow-lg"><Star size={14} className="fill-text-1" /></div>}
                  </div>

                  {godMode && (
                    <button onClick={() => toggleSelection(r.id)} className={`absolute top-4 right-4 w-7 h-7 rounded-xl border-2 flex items-center justify-center z-10 transition-all ${isSelected ? 'bg-danger border-danger' : 'bg-surface/80 border-glass-border backdrop-blur-md hover:border-danger/50'}`}>
                      {isSelected && <CheckCircle2 size={14} className="text-text-1" />}
                    </button>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h4 className="text-sm font-black text-text-1 leading-tight line-clamp-2 group-hover:text-accent transition-colors">{r.title}</h4>
                    <span className="text-[10px] font-black text-text-3 whitespace-nowrap">{r.time}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`}>{tierMeta.label}</span>
                    <span className="text-[8px] font-black text-text-3 uppercase tracking-widest bg-glass-bg px-2 py-1 rounded-lg border border-glass-border">{r.category || 'Mains'}</span>
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
                    className="flex-1 py-3 text-text-2 hover:text-text-1 bg-glass-bg hover:bg-accent/10 rounded-2xl border border-glass-border hover:border-accent transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Edit3 size={12} /> Refine
                  </button>
                  <button onClick={() => requestDelete('recipes', r.id, r.title)} className="w-12 h-12 text-danger/60 hover:text-text-1 hover:bg-danger bg-danger/5 rounded-2xl border border-danger/10 hover:border-danger transition-all flex items-center justify-center">
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
          <button onClick={() => setVisibleCount(prev => prev + 20)} className="px-16 py-4 bg-base hover:bg-glass-bg border-2 border-glass-border rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-text-3 hover:text-text-1 transition-all active:scale-95 shadow-xl">
            Reveal More Intel ({fRecipes.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
