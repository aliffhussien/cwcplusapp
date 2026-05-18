import React, { useState } from 'react';
import { PlayCircle, Image as ImageIcon, Save, X, XCircle, Eye, EyeOff, Star, Tag, Loader2, Trash2, Plus } from 'lucide-react';
import { getMediaAssetUrl } from '../../lib/mediaUtils';
import MediaPickerModal from './MediaPickerModal';
import RecipeEditorIngredients from './RecipeEditorIngredients';
import RecipeEditorSteps from './RecipeEditorSteps';
import { normalizeSteps, normalizeNotes } from '../../lib/recipeUtils';

const DIFFICULTIES = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Pro'];
const CATEGORIES = ['Breakfast', 'Mains', 'Desserts', 'Vegan', 'Quick 15m', 'Snacks', 'Soups', 'Sides'];
const inputCls = "bg-glass-bg border border-glass-border rounded-xl px-3 py-2.5 text-sm text-text-1 outline-none focus:border-accent/60 transition-colors w-full";
const Field = ({ label, children }: any) => (<div className="flex flex-col gap-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-text-3">{label}</label>{children}</div>);

export default function RecipeEditor({ recipe, onSave, onCancel, onDelete }: any) {
    const [formData, setFormData] = useState({
        ...recipe,
        steps: normalizeSteps(recipe.steps),
        notes: normalizeNotes(recipe.notes),
        ingredients: recipe.ingredients || [],
        tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : (recipe.tags || ''),
        isFeatured: recipe.is_featured || recipe.isFeatured || false,
        base_servings: recipe.base_servings || recipe.baseServings || 2,
        difficulty: recipe.difficulty || 'Beginner',
        status: recipe.status || 'published',
        author: recipe.author || '',
        rating: recipe.rating || '',
        description: recipe.description || '',
        scheduled_post_date: recipe.scheduled_post_date || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const set = (key: string, val: any) => setFormData((prev: any) => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // Construct payload with strictly whitelisted database columns
            const payload: Record<string, any> = {
                title: formData.title,
                author: formData.author,
                time: formData.time,
                image: formData.image,
                category: formData.category,
                difficulty: formData.difficulty,
                status: formData.status,
                volume: formData.volume,
                cover_image_id: formData.cover_image_id || null,
                hero_image: formData.hero_image || null,
                hero_image_id: formData.hero_image_id || null,

                // Fix video — save video URL into existing column "video"
                video: formData.video_url || formData.video || null,

                // Computed/normalized JSONB columns
                ingredients: (formData.ingredients || []).filter((i: any) => i?.name?.trim()),
                steps: (formData.steps || []).filter((s: string) => s?.trim()),
                tags: (formData.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
                
                // Remap fields to snake_case database columns
                is_featured: formData.isFeatured ?? false,
                tier_required: formData.tier_required || formData.tierRequired || 'Free',
                
                // Notes column (text format with stringified array)
                notes: JSON.stringify(normalizeNotes(formData.notes.join ? formData.notes : [formData.notes]).filter((s: string) => s?.trim())),
                
                // Numeric and type casting
                base_servings: parseInt(formData.base_servings) || 2,
                scheduled_post_date: formData.scheduled_post_date || null,
                rating: formData.rating ? parseFloat(formData.rating) : null,
            };

            // Call context save function, passing the ID alongside the whitelisted payload
            await onSave({
                id: formData.id,
                ...payload
            });
        } catch (err: any) {
            console.error('Error saving recipe:', err);
            setError(err?.message || String(err));
        } finally {
            setIsSaving(false);
        }
    };

    const addNote = () => set('notes', [...(formData.notes || []), '']);
    const removeNote = (idx: number) => set('notes', formData.notes.filter((_: any, i: number) => i !== idx));
    const updateNote = (idx: number, val: string) => { const next = [...formData.notes]; next[idx] = val; set('notes', next); };

    const updateIngredient = (idx: number, field: string, val: string) => { const next = [...formData.ingredients]; next[idx] = { ...next[idx], [field]: val }; set('ingredients', next); };
    const updateStep = (idx: number, val: string) => { const next = [...formData.steps]; next[idx] = val; set('steps', next); };

    const coverUrl = getMediaAssetUrl(formData.cover_image_id, [], formData.image);
    const videoUrl = formData.video_url || formData.video || '';

    return (
        <div className="max-w-2xl mx-auto px-4 pb-32 pt-4 space-y-6">
            <div className="flex items-center justify-between sticky top-16 z-20 bg-base/90 backdrop-blur-md py-3 -mx-4 px-4 border-b border-glass-border">
                <h2 className="text-base font-black italic uppercase tracking-tight truncate mr-4 text-text-1">{recipe.title || 'Edit Recipe'}</h2>
                <div className="flex gap-2 shrink-0">
                    <button onClick={onCancel} className="px-4 py-2 bg-glass-bg hover:bg-elevated rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors text-text-1">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-4 py-2 bg-accent text-text-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors disabled:opacity-60">
                        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-danger text-xs font-semibold animate-pulse">
                    <div className="flex items-center gap-2">
                        <XCircle size={16} className="shrink-0 animate-bounce" />
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="hover:opacity-80 transition-opacity"><X size={14} /></button>
                </div>
            )}

            <div className="flex items-center gap-3 bg-glass-bg border border-glass-border rounded-2xl p-3">
                <div className="flex bg-glass-bg rounded-xl p-1 gap-1">
                    <button type="button" onClick={() => set('status', 'draft')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'draft' ? 'bg-elevated text-text-1' : 'text-text-3'}`}><EyeOff size={12} /> Draft</button>
                    <button type="button" onClick={() => set('status', 'published')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'published' ? 'bg-accent text-text-1' : 'text-text-3'}`}><Eye size={12} /> Published</button>
                </div>
                <div className="h-6 w-px bg-glass-border" />
                <button type="button" onClick={() => set('isFeatured', !formData.isFeatured)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.isFeatured ? 'bg-warning/20 border-warning/40 text-warning' : 'bg-glass-bg border-glass-border text-text-3'}`}>
                    <Star size={12} className={formData.isFeatured ? 'fill-warning' : ''} /> Featured
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div onClick={() => { setPickerTarget('cover'); setIsPickerOpen(true); }} className="relative aspect-video rounded-2xl overflow-hidden bg-glass-bg border border-glass-border cursor-pointer hover:border-accent/40 transition-colors group">
                    {coverUrl ? <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-text-3" /></div>}
                    <div className="absolute inset-0 bg-base/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-[9px] font-black uppercase tracking-widest text-text-1">Change Cover</span></div>
                    <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase tracking-widest text-text-3">Cover</span>
                </div>
                <div onClick={() => { setPickerTarget('video'); setIsPickerOpen(true); }} className="relative aspect-video rounded-2xl overflow-hidden bg-glass-bg border border-glass-border cursor-pointer hover:border-accent/40 transition-colors group">
                    {videoUrl ? <video src={videoUrl} className="w-full h-full object-cover" muted /> : <div className="w-full h-full flex items-center justify-center"><PlayCircle size={20} className="text-text-3" /></div>}
                    <div className="absolute inset-0 bg-base/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-[9px] font-black uppercase tracking-widest text-text-1">Change Video</span></div>
                    <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase tracking-widest text-text-3">Video</span>
                </div>
            </div>

            <Field label="Title"><input className={inputCls} value={formData.title || ''} onChange={e => set('title', e.target.value)} placeholder="Recipe name" /></Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Author"><input className={inputCls} value={formData.author || ''} onChange={e => set('author', e.target.value)} placeholder="Chef name" /></Field>
                <Field label="Volume / Access"><input className={inputCls} value={formData.volume || ''} onChange={e => set('volume', e.target.value)} placeholder="e.g. VOL 1" /></Field>
                <Field label="Category"><input className={inputCls} list="editor-cats" value={formData.category || ''} onChange={e => set('category', e.target.value)} placeholder="e.g. Mains" /><datalist id="editor-cats">{CATEGORIES.map(c => <option key={c} value={c} />)}</datalist></Field>
                <Field label="Difficulty"><select className={inputCls} value={formData.difficulty || 'Beginner'} onChange={e => set('difficulty', e.target.value)}>{DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}</select></Field>
                <Field label="Cook Time"><input className={inputCls} value={formData.time || ''} onChange={e => set('time', e.target.value)} placeholder="e.g. 30 min" /></Field>
                <Field label="Base Servings"><input className={inputCls} type="number" min="1" value={formData.base_servings || 2} onChange={e => set('base_servings', e.target.value)} /></Field>
                <Field label="Rating (0–5)"><input className={inputCls} type="number" min="0" max="5" step="0.1" value={formData.rating || ''} onChange={e => set('rating', e.target.value)} placeholder="4.9" /></Field>
                <Field label="Scheduled Date"><input className={`${inputCls} appearance-none`} type="datetime-local" value={formData.scheduled_post_date || ''} onChange={e => set('scheduled_post_date', e.target.value)} /></Field>
            </div>
            <Field label="Description"><textarea className={`${inputCls} resize-none`} rows={3} value={formData.description || ''} onChange={e => set('description', e.target.value)} placeholder="Short description…" /></Field>
            <Field label="Tags (comma-separated)">
                <div className="relative">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
                    <input className={`${inputCls} pl-8`} value={formData.tags || ''} onChange={e => set('tags', e.target.value)} placeholder="pasta, quick, weeknight" />
                </div>
            </Field>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-3">Chef's Notes</label>
                    <button type="button" onClick={addNote} className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-1 hover:text-text-1 transition-colors"><Plus size={11} /> Add Note</button>
                </div>
                <div className="space-y-2">
                    {(formData.notes || []).map((note: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                            <input value={note} onChange={e => updateNote(idx, e.target.value)} className={`${inputCls} flex-1`} placeholder="Tip, substitution, or secret…" />
                            <button type="button" onClick={() => removeNote(idx)} className="w-9 flex items-center justify-center bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-xl transition-colors shrink-0"><X size={13} /></button>
                        </div>
                    ))}
                    {(formData.notes || []).length === 0 && <p className="text-[10px] text-text-3 text-center py-3 border border-dashed border-glass-border rounded-xl">No notes yet</p>}
                </div>
            </div>

            <RecipeEditorIngredients ingredients={formData.ingredients} updateIngredient={updateIngredient} addIngredient={() => set('ingredients', [...(formData.ingredients || []), { name: '', amount: '', unit: '' }])} removeIngredient={(idx) => set('ingredients', formData.ingredients.filter((_: any, i: number) => i !== idx))} />
            <RecipeEditorSteps steps={formData.steps} updateStep={updateStep} addStep={() => set('steps', [...(formData.steps || []), ''])} removeStep={(idx) => set('steps', formData.steps.filter((_: any, i: number) => i !== idx))} />

            <div className="pt-6 border-t border-glass-border">
                <button type="button" onClick={() => onDelete(recipe.id)} className="w-full py-3 bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> Delete Recipe Permanently</button>
            </div>

            <MediaPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={(sel: any) => {
                if (pickerTarget === 'cover') { 
                    set('cover_image_id', sel.id); 
                    set('hero_image_id', sel.id); 
                    set('image', sel.hero_url || sel.url); 
                    set('hero_image', sel.hero_url || sel.url); 
                } 
                else { set('video_id', sel.id); set('video_url', sel.url); set('video', sel.url); }
                setIsPickerOpen(false);
            }} contentId={recipe.id} contentType={pickerTarget === 'cover' ? 'image' : 'video'} />
        </div>
    );
}
