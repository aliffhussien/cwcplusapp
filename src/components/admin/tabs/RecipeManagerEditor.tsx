import React from 'react';
import { Wand2, X, EyeOff, Eye, Star, List, Plus, Minus, AlignLeft, Info, Save } from 'lucide-react';
import MediaUploader from '../MediaUploader';

interface RecipeManagerEditorProps {
  recipeForm: any;
  setRecipeForm: (data: any) => void;
  rawText: string;
  setRawText: (txt: string) => void;
  handleSmartParse: () => void;
  handlePostRecipe: (e: React.FormEvent) => Promise<void>;
  setIsCreating: (state: boolean) => void;
  settings: any;
}

export default function RecipeManagerEditor({
  recipeForm,
  setRecipeForm,
  rawText,
  setRawText,
  handleSmartParse,
  handlePostRecipe,
  setIsCreating,
  settings
}: RecipeManagerEditorProps) {
  return (
    <div className="w-full bg-surface border-[0.5px] border-glass-border rounded-[3rem] overflow-hidden shadow-2xl pb-20">
      <div className="bg-accent p-8 md:p-12 flex justify-between items-center relative overflow-hidden">
        <Wand2 className="absolute right-10 opacity-20 w-40 h-40 text-text-1" />
        <h4 className="text-3xl md:text-5xl font-black text-text-1 relative z-10 tracking-tighter italic">Recipe Master Deck</h4>
        <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-16 md:h-16 bg-glass-bg hover:bg-glass-bg/80 rounded-full flex items-center justify-center relative z-10 transition-colors border border-glass-border"><X size={32} className="text-text-1" /></button>
      </div>

      <div className="p-6 md:p-12 space-y-12">
        <div className="p-8 bg-glass-bg border-2 border-glass-border rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Wand2 size={80} /></div>
          <h5 className="text-2xl font-black text-text-1 mb-6 flex items-center gap-3">Magic Auto-Fill <span className="text-[10px] bg-accent px-3 py-1 rounded-full uppercase tracking-widest text-text-1">AI Parsing</span></h5>
          <textarea rows={4} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Paste the whole recipe here (Title, Ingredients, Steps...)" className="w-full bg-surface border-2 border-glass-border rounded-[2rem] px-8 py-6 text-lg text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent transition-all mb-6 custom-scrollbar" />
          <button type="button" onClick={handleSmartParse} className="w-full py-6 bg-base hover:bg-elevated rounded-full font-black text-xl text-text-1 transition-all shadow-xl active:scale-95">Trigger Extraction✨</button>
        </div>

        <form onSubmit={handlePostRecipe} className="space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-glass-bg p-6 rounded-[2.5rem] border border-glass-border">
            <div className="flex items-center gap-8">
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase text-text-3 tracking-widest mb-2 ml-1">Lifecycle</span>
                 <div className="flex bg-surface rounded-2xl p-1 border border-glass-border">
                   <button type="button" onClick={() => setRecipeForm({ ...recipeForm, status: 'draft' })} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${recipeForm.status === 'draft' ? 'bg-glass-bg text-text-1' : 'text-text-3 hover:text-text-2'}`}><EyeOff size={14} className="inline mr-2" />Draft</button>
                   <button type="button" onClick={() => setRecipeForm({ ...recipeForm, status: 'published' })} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${recipeForm.status === 'published' ? 'bg-accent text-text-1 shadow-lg' : 'text-text-3 hover:text-text-2'}`}><Eye size={14} className="inline mr-2" />Live</button>
                 </div>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase text-text-3 tracking-widest mb-2 ml-1">Promoted</span>
                 <button type="button" onClick={() => setRecipeForm({ ...recipeForm, isFeatured: !recipeForm.isFeatured })} className={`h-11 px-6 rounded-2xl border-2 flex items-center gap-3 transition-all ${recipeForm.isFeatured ? 'bg-warning/10 border-warning text-warning' : 'bg-surface border-glass-border text-text-3 hover:text-text-2'}`}>
                   <Star size={16} className={recipeForm.isFeatured ? 'fill-warning text-warning' : ''} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Featured</span>
                 </button>
               </div>
            </div>
            <div className="h-12 w-[1px] bg-glass-border hidden md:block" />
            <div className="flex-1 max-w-xs">
              <label className="text-[10px] font-black uppercase text-text-3 block mb-2 ml-1">Volume Collection</label>
              <select value={recipeForm.volume || 'CWC Original'} onChange={e => setRecipeForm({ ...recipeForm, volume: e.target.value })} className="w-full h-11 bg-surface border-2 border-glass-border rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest text-text-1 cursor-pointer appearance-none outline-none focus:border-accent">
                 {(settings?.volumes || []).map((v: any) => <option key={v.id} value={v.name}>{v.name}</option>)}
                 <option value="Free">Free (No Volume)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3 lg:col-span-2">
              <label className="text-[10px] font-black uppercase text-text-3 ml-4">Full Title</label>
              <input required type="text" value={recipeForm.title} onChange={e => setRecipeForm({ ...recipeForm, title: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-xl font-black text-text-1 focus:border-accent outline-none shadow-xl" placeholder="e.g. TRUFFLE BUTTER PANCAKES" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-text-3 ml-4">Author</label>
              <input type="text" value={recipeForm.author || ''} onChange={e => setRecipeForm({ ...recipeForm, author: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" placeholder="Abid Nasa" />
            </div>

            <div className="space-y-3">
               <MediaUploader label="Primary Hero (16:9)" value={recipeForm.hero_image} onChange={(val: any) => setRecipeForm({ ...recipeForm, hero_image: val })} contentId={recipeForm.id} contentType="recipe" />
            </div>
            <div className="space-y-3">
               <MediaUploader label="Library Thumbnail (1:1)" value={recipeForm.image} onChange={(val: any) => setRecipeForm({ ...recipeForm, image: val })} contentId={recipeForm.id} contentType="recipe" />
            </div>
            <div className="space-y-3">
               <MediaUploader label="Cooking Video (MP4)" value={recipeForm.video} onChange={(val: any) => setRecipeForm({ ...recipeForm, video: val })} contentId={recipeForm.id} contentType="recipe" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-text-3 ml-4">Complexity</label>
              <select value={recipeForm.difficulty || 'Beginner'} onChange={e => setRecipeForm({ ...recipeForm, difficulty: e.target.value })} className="w-full h-16 bg-surface border-2 border-glass-border rounded-3xl px-8 text-sm font-black uppercase tracking-widest text-text-1 outline-none focus:border-accent appearance-none cursor-pointer">
                {['Beginner', 'Easy', 'Medium', 'Hard', 'Pro'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-text-3 ml-4">Time Investment</label>
              <input type="text" value={recipeForm.time || ''} onChange={e => setRecipeForm({ ...recipeForm, time: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" placeholder="30 min" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-text-3 ml-4">Yield / Servings</label>
              <input type="number" value={recipeForm.baseServings || 2} onChange={e => setRecipeForm({ ...recipeForm, baseServings: parseInt(e.target.value) })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" />
            </div>
          </div>

          <div className="space-y-12 pt-12 border-t border-glass-border">
             <div className="space-y-6">
               <div className="flex items-center justify-between px-4">
                  <h5 className="text-2xl font-black text-text-1 flex items-center gap-4"><List className="text-accent" /> Formulation <span className="text-xs text-text-3 uppercase tracking-widest">(Ingredients)</span></h5>
                  <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { name: '', amount: '' }] })} className="w-10 h-10 bg-accent text-text-1 rounded-full flex items-center justify-center hover:scale-110 transition-transform"><Plus size={20} /></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipeForm.ingredients.map((ing: any, i: number) => (
                     <div key={i} className="flex gap-3 bg-base/50 p-4 rounded-2xl border border-glass-border hover:border-accent/20 transition-all group">
                       <input type="text" value={ing.amount} onChange={e => { const n = [...recipeForm.ingredients]; n[i].amount = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }} className="w-24 bg-surface border border-glass-border rounded-xl px-4 py-2 text-sm font-bold text-accent outline-none focus:border-accent" placeholder="Amt" />
                       <input type="text" value={ing.name} onChange={e => { const n = [...recipeForm.ingredients]; n[i].name = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }} className="flex-1 bg-surface border border-glass-border rounded-xl px-4 py-2 text-sm font-bold text-text-1 outline-none focus:border-accent" placeholder="Ingredient name..." />
                       <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: recipeForm.ingredients.filter((_: any, idx: number) => idx !== i) })} className="w-10 h-10 text-danger hover:bg-danger/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Minus size={18} /></button>
                     </div>
                  ))}
               </div>
             </div>

             <div className="space-y-6">
               <div className="flex items-center justify-between px-4">
                  <h5 className="text-2xl font-black text-text-1 flex items-center gap-4"><AlignLeft className="text-accent" /> Execution <span className="text-xs text-text-3 uppercase tracking-widest">(Methodology)</span></h5>
                  <button type="button" onClick={() => setRecipeForm({ ...recipeForm, steps: [...recipeForm.steps, ''] })} className="w-10 h-10 bg-accent text-text-1 rounded-full flex items-center justify-center hover:scale-110 transition-transform"><Plus size={20} /></button>
               </div>
               <div className="space-y-4">
                  {recipeForm.steps.map((step: string, i: number) => (
                     <div key={i} className="flex gap-4 bg-base/50 p-6 rounded-[2.5rem] border border-glass-border hover:border-accent/20 transition-all group">
                       <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center font-black flex-shrink-0">{i + 1}</div>
                       <textarea value={step} onChange={e => { const n = [...recipeForm.steps]; n[i] = e.target.value; setRecipeForm({ ...recipeForm, steps: n }); }} className="flex-1 bg-transparent border-none text-text-1 text-xl font-medium outline-none placeholder:text-text-3 custom-scrollbar resize-none" rows={2} placeholder="Detail this step..." />
                       <button type="button" onClick={() => setRecipeForm({ ...recipeForm, steps: recipeForm.steps.filter((_: any, idx: number) => idx !== i) })} className="w-10 h-10 text-danger hover:bg-danger/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity self-start"><Minus size={18} /></button>
                     </div>
                  ))}
               </div>
             </div>

             <div className="space-y-6">
               <div className="flex items-center justify-between px-4">
                  <h5 className="text-2xl font-black text-text-1 flex items-center gap-4"><Info className="text-warning" /> Intelligence <span className="text-xs text-text-3 uppercase tracking-widest">(Chef's Notes)</span></h5>
                  <button type="button" onClick={() => setRecipeForm({ ...recipeForm, notes: [...recipeForm.notes, ''] })} className="w-10 h-10 bg-warning text-text-1 rounded-full flex items-center justify-center hover:scale-110 transition-transform"><Plus size={20} /></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipeForm.notes.map((note: string, i: number) => (
                     <div key={i} className="flex gap-3 bg-warning/5 p-4 rounded-2xl border border-warning/10 hover:border-warning/30 transition-all group">
                       <textarea value={note} onChange={e => { const n = [...recipeForm.notes]; n[i] = e.target.value; setRecipeForm({ ...recipeForm, notes: n }); }} className="flex-1 bg-transparent border-none text-warning text-sm font-bold outline-none placeholder:text-warning/40 custom-scrollbar resize-none" rows={2} placeholder="Crucial tip or secret..." />
                       <button type="button" onClick={() => setRecipeForm({ ...recipeForm, notes: recipeForm.notes.filter((_: any, idx: number) => idx !== i) })} className="w-10 h-10 text-danger hover:bg-danger/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity self-start"><Minus size={18} /></button>
                     </div>
                  ))}
               </div>
             </div>
          </div>

          <div className="flex gap-4 pt-12">
             <button onClick={() => setIsCreating(false)} className="flex-1 py-6 bg-base hover:bg-elevated text-text-1 rounded-full font-black text-xl uppercase tracking-widest transition-all">Discard Changes</button>
             <button type="submit" className="flex-[2] py-6 bg-accent hover:bg-accent/80 text-text-1 rounded-full font-black text-xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3">
               <Save size={28} /> {recipeForm.id ? 'Commit Updates' : 'Launch Masterpiece'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
