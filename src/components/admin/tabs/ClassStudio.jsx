import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, ChevronDown, CheckCircle2, 
  Video, Package, Star, Eye, EyeOff, Wand2, X,
  Save, Loader2, Film, Clock, BookOpen, Layout, Globe,
  Minus, List, AlignLeft, Info, Link2, FileText
} from 'lucide-react';
import { getTierMeta } from '../../../lib/ui';
import { advancedMultiParse } from '../../../lib/parser';
import MediaUploader from '../MediaUploader';

export default function ClassStudio({ 
  classes, 
  addClass, 
  updateClass, 
  deleteClass, 
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
  const [activeSection, setActiveSection] = useState('identity');
  const [rawText, setRawText] = useState("");
  
  const [classForm, setClassForm] = useState({ 
    title: '', instructor: 'Abid Nasa', duration: '', price: '19.99', 
    category: 'Cooking Class', image: null, video: '', live_link: '', 
    status: 'published', isFeatured: false, 
    tierRequired: settings?.premiumTiers?.[0]?.name || 'Premium', 
    ingredients: [{ name: '', amount: '' }], steps: [''], notes: [''], 
    tags: [], attachments: [], scheduled_post_date: '', 
    live_date: '', live_duration_hours: 2 
  });

  const fClasses = useMemo(() => classes.filter(c => 
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [classes, searchQuery]);

  const handlePostClass = async (e) => {
    e.preventDefault();
    try {
      const { id, ...formData } = classForm;
      const data = {
        ...formData,
        ingredients: (formData.ingredients || []).filter(i => i.name && i.name.trim() !== ''),
        steps: (formData.steps || []).filter(s => s && s.trim() !== ''),
        notes: (formData.notes || []).filter(s => typeof s === 'string' && s.trim() !== ''),
        tags: (formData.tags || []).filter(t => t && t.trim() !== '').slice(0, 10),
        is_featured: formData.isFeatured !== undefined ? formData.isFeatured : (formData.is_featured ?? false),
        tier_required: formData.tierRequired !== undefined ? formData.tierRequired : (formData.tier_required ?? 'Premium'),
        scheduled_post_date: formData.scheduled_post_date ? new Date(formData.scheduled_post_date).toISOString() : null,
        live_date: formData.live_date ? new Date(formData.live_date).toISOString() : null
      };

      // Handle media objects
      if (data.image && typeof data.image === 'object' && data.image.id) {
        data.thumbnail_image_id = data.image.id;
        data.image = data.image.hero_url || data.image.url;
      }
      if (data.hero_image && typeof data.hero_image === 'object' && data.hero_image.id) {
        data.hero_image_id = data.hero_image.id;
        data.hero_image = data.hero_image.hero_url || data.hero_image.url;
      }
      if (data.video && typeof data.video === 'object' && data.video.id) {
        data.video_asset_id = data.video.id;
        data.video = data.video.hero_url || data.video.url;
      }

      if (id) {
        await updateClass(id, data);
        showToast("Class Updated! 🎬");
      } else {
        await addClass(data);
        showToast("Class Published! 🎬");
      }
      setIsCreating(false);
    } catch (err) {
      showToast("Failed to save class: " + err.message, "error");
    }
  };

  const handleClassSmartParse = () => {
    const parsedRecipes = advancedMultiParse(rawText);
    if (!parsedRecipes || parsedRecipes.length === 0) {
      showToast("No classes found. Check format.", "error");
      return;
    }

    if (parsedRecipes.length === 1) {
      const parsed = parsedRecipes[0];
      setClassForm({
        ...classForm,
        title: parsed.title || classForm.title,
        instructor: parsed.instructor || classForm.instructor || 'Abid Nasa',
        category: parsed.category || classForm.category || 'Cooking Class',
        price: parsed.price || classForm.price || '19.99',
        tierRequired: parsed.tier_required || classForm.tierRequired || 'Premium',
        ingredients: parsed.ingredients.length ? parsed.ingredients : classForm.ingredients,
        steps: parsed.steps.length ? parsed.steps : classForm.steps,
        notes: parsed.notes.length ? parsed.notes : classForm.notes
      });
      showToast("Magic Complete! ✨");
      setRawText("");
    } else {
      showToast(`Detected ${parsedRecipes.length} classes. Auto-fill supports 1 at a time.`, "info");
    }
  };

  const handleBulkUploadClasses = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          showToast(`Ingesting ${data.length} classes...`, "info");
          let successCount = 0;
          for (const item of data) {
            try {
              await addClass(item);
              successCount++;
            } catch (err) {
              console.error("Bulk upload item failed:", err);
            }
          }
          showToast(`Successfully ingested ${successCount} classes! 🎬`);
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
      <div className="w-full bg-[#0F172A]/80 border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl pb-20">
        <div className="bg-slate-900/80 border-b border-white/5 p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <Video size={40} className="text-white" />
            </div>
            <div>
              <h4 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic leading-none">{classForm.id ? 'Studio Refinement' : 'New Studio Production'}</h4>
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mt-3 ml-1">V2.0 Production Interface</p>
            </div>
          </div>
          <div className="flex bg-slate-950/80 p-2 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-2xl">
            {[
              { id: 'identity', label: 'Identity', icon: Layout },
              { id: 'media', label: 'Media', icon: Film },
              { id: 'studio', label: 'Studio', icon: Globe },
              { id: 'content', label: 'Content', icon: BookOpen }
            ].map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`px-8 py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${activeSection === sec.id ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <sec.icon size={16} /> {sec.label}
              </button>
            ))}
          </div>
          <button onClick={() => setIsCreating(false)} className="w-16 h-16 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white rounded-full flex items-center justify-center transition-all border border-white/10"><X size={32} /></button>
        </div>

        <form onSubmit={handlePostClass} className="p-8 md:p-14 space-y-16">
            <AnimatePresence mode="wait">
               {activeSection === 'identity' && (
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                    <div className="p-10 bg-slate-900/50 border-2 border-slate-800 rounded-[3rem] shadow-2xl">
                      <h5 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><Wand2 className="text-accent" /> Magic Auto-Fill</h5>
                      <textarea rows={3} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Paste the class details here to auto-populate form..." className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg text-white placeholder:text-slate-700 focus:outline-none focus:border-accent transition-all mb-6 custom-scrollbar" />
                      <button type="button" onClick={handleClassSmartParse} className="w-full py-5 bg-slate-800 hover:bg-slate-700 rounded-full font-black text-lg text-white transition-all shadow-xl active:scale-95">Perform Extraction ✨</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Class Title</label>
                         <input required type="text" value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-xl font-black text-white focus:border-accent outline-none" placeholder="Mastering the French Omelette" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Instructor</label>
                         <input type="text" value={classForm.instructor || ''} onChange={e => setClassForm({ ...classForm, instructor: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Category</label>
                         <input type="text" value={classForm.category} onChange={e => setClassForm({ ...classForm, category: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Duration</label>
                         <input type="text" value={classForm.duration} onChange={e => setClassForm({ ...classForm, duration: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" placeholder="45 min" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Access Tier</label>
                         <select value={classForm.tierRequired} onChange={e => setClassForm({ ...classForm, tierRequired: e.target.value })} className="w-full h-16 bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 text-sm font-black uppercase tracking-widest text-accent outline-none focus:border-accent appearance-none cursor-pointer shadow-lg">
                           {(settings?.premiumTiers || []).map(t => <option key={t.id} value={t.name}>{t.name} Exclusive</option>)}
                           <option value="Free">Free / Public</option>
                         </select>
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Production Status</label>
                         <div className="flex bg-slate-950 rounded-3xl p-1.5 border-2 border-slate-800">
                           <button type="button" onClick={() => setClassForm({ ...classForm, status: 'draft' })} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${classForm.status === 'draft' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Draft Mode</button>
                           <button type="button" onClick={() => setClassForm({ ...classForm, status: 'published' })} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${classForm.status === 'published' ? 'bg-accent text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Live Production</button>
                         </div>
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeSection === 'media' && (
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <MediaUploader label="Class Thumbnail (Library)" value={classForm.image} onChange={(val) => setClassForm({ ...classForm, image: val })} contentId={classForm.id} contentType="class" />
                    <MediaUploader label="Cinema Hero (Widescreen)" value={classForm.hero_image} onChange={(val) => setClassForm({ ...classForm, hero_image: val })} contentId={classForm.id} contentType="class" />
                    <MediaUploader label="Full Production Video" value={classForm.video} onChange={(val) => setClassForm({ ...classForm, video: val })} contentId={classForm.id} contentType="class" />
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Live Link Override</label>
                       <input type="text" value={classForm.live_link} onChange={e => setClassForm({ ...classForm, live_link: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white focus:border-accent outline-none" placeholder="https://youtube.com/live/..." />
                    </div>
                 </motion.div>
               )}

               {activeSection === 'studio' && (
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Scheduled Release</label>
                         <input type="datetime-local" value={classForm.scheduled_post_date} onChange={e => setClassForm({ ...classForm, scheduled_post_date: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white focus:border-accent outline-none" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Live Session Date</label>
                         <input type="datetime-local" value={classForm.live_date} onChange={e => setClassForm({ ...classForm, live_date: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white focus:border-accent outline-none" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Live Duration (Hours)</label>
                         <input type="number" value={classForm.live_duration_hours || 2} onChange={e => setClassForm({ ...classForm, live_duration_hours: parseInt(e.target.value) })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Featured Status</label>
                         <button type="button" onClick={() => setClassForm({ ...classForm, isFeatured: !classForm.isFeatured })} className={`w-full h-[68px] border-2 rounded-3xl flex items-center justify-center gap-4 transition-all ${classForm.isFeatured ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-xl shadow-amber-500/10' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                           <Star size={20} className={classForm.isFeatured ? 'fill-amber-500' : ''} />
                           <span className="text-[11px] font-black uppercase tracking-widest">Pin to Home Spotlight</span>
                         </button>
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeSection === 'content' && (
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-16">
                    {/* Ingredients */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-6">
                         <h5 className="text-2xl font-black text-white flex items-center gap-4"><List className="text-accent" /> Essential Assets <span className="text-xs text-slate-500 uppercase tracking-widest">(Ingredients)</span></h5>
                         <button type="button" onClick={() => setClassForm({ ...classForm, ingredients: [...classForm.ingredients, { name: '', amount: '' }] })} className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><Plus size={24} /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {classForm.ingredients.map((ing, i) => (
                            <div key={i} className="flex gap-4 bg-slate-950/50 p-5 rounded-3xl border border-white/5 hover:border-accent/20 transition-all group">
                              <input type="text" value={ing.amount} onChange={e => { const n = [...classForm.ingredients]; n[i].amount = e.target.value; setClassForm({ ...classForm, ingredients: n }); }} className="w-24 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-accent outline-none focus:border-accent" placeholder="Amt" />
                              <input type="text" value={ing.name} onChange={e => { const n = [...classForm.ingredients]; n[i].name = e.target.value; setClassForm({ ...classForm, ingredients: n }); }} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white outline-none focus:border-accent" placeholder="Item name..." />
                              <button type="button" onClick={() => setClassForm({ ...classForm, ingredients: classForm.ingredients.filter((_, idx) => idx !== i) })} className="w-10 h-10 text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Minus size={18} /></button>
                            </div>
                         ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-6">
                         <h5 className="text-2xl font-black text-white flex items-center gap-4"><AlignLeft className="text-violet-500" /> Production Flow <span className="text-xs text-slate-500 uppercase tracking-widest">(Steps)</span></h5>
                         <button type="button" onClick={() => setClassForm({ ...classForm, steps: [...classForm.steps, ''] })} className="w-12 h-12 bg-violet-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><Plus size={24} /></button>
                      </div>
                      <div className="space-y-4">
                         {classForm.steps.map((step, i) => (
                            <div key={i} className="flex gap-6 bg-slate-950/50 p-8 rounded-[2.5rem] border border-white/5 hover:border-violet-500/20 transition-all group">
                              <div className="w-12 h-12 bg-violet-600/10 text-violet-500 rounded-2xl flex items-center justify-center font-black flex-shrink-0 text-lg border border-violet-500/10 shadow-inner">{i + 1}</div>
                              <textarea value={step} onChange={e => { const n = [...classForm.steps]; n[i] = e.target.value; setClassForm({ ...classForm, steps: n }); }} className="flex-1 bg-transparent border-none text-white text-xl font-medium outline-none placeholder:text-slate-700 custom-scrollbar resize-none" rows={2} placeholder="Explain this production phase..." />
                              <button type="button" onClick={() => setClassForm({ ...classForm, steps: classForm.steps.filter((_, idx) => idx !== i) })} className="w-12 h-12 text-rose-500 hover:bg-rose-500/10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity self-start"><Minus size={22} /></button>
                            </div>
                         ))}
                      </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="flex justify-center pt-20 border-t border-white/5">
                <button type="submit" className="px-16 py-7 bg-accent hover:bg-accent-sec text-white rounded-full font-black text-2xl shadow-[0_30px_70px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center gap-4 group">
                    <Save size={32} className="group-hover:rotate-12 transition-transform" /> {classForm.id ? 'Authorize Production Update' : 'Launch New Masterclass'}
                </button>
            </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-violet-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)]">
            <Video className="text-white" size={32} />
          </div>
          <div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Studio Control</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-3">Production Archive • {classes.length} ACTIVE CLASSES</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <label className="group h-14 px-8 bg-slate-900/80 hover:bg-white/5 border border-white/5 rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center gap-4 transition-all cursor-pointer backdrop-blur-3xl shadow-2xl">
            <Package size={20} className="text-accent group-hover:scale-110 transition-transform" />
            <span>Bulk Import</span>
            <input type="file" accept=".json" className="hidden" onChange={handleBulkUploadClasses} />
          </label>
          <button
            onClick={() => {
              setClassForm({ 
                title: '', instructor: 'Abid Nasa', duration: '', price: '19.99', 
                category: 'Cooking Class', image: null, video: '', live_link: '', 
                status: 'published', isFeatured: false, 
                tierRequired: settings?.premiumTiers?.[0]?.name || 'Premium', 
                ingredients: [{ name: '', amount: '' }], steps: [''], notes: [''], 
                tags: [], attachments: [], scheduled_post_date: '', 
                live_date: '', live_duration_hours: 2 
              });
              setIsCreating(true);
              setActiveSection('identity');
            }}
            className="h-14 px-10 bg-gradient-to-r from-accent to-violet-600 hover:from-accent-500 hover:to-violet-500 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_15px_45px_rgba(79,70,229,0.3)] flex items-center gap-4 active:scale-95 transition-all"
          >
            <Plus size={22} /> Initiate Production
          </button>
        </div>
      </div>

      {fClasses.length === 0 ? (
        <div className="text-center py-40 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[4rem]">
          <Film size={60} className="mx-auto text-slate-800 mb-6" />
          <p className="text-slate-600 font-black uppercase tracking-widest text-sm">Studio Archive: Null</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {fClasses.map(c => {
            const tierMeta = getTierMeta(c.tier_required || c.tierRequired || 'Premium', settings);
            const classMedia = Array.isArray(media) ? media.find(m => m.id === (c.thumbnail_image_id || c.cover_image_id)) : null;
            const displayImage = classMedia?.hero_url || classMedia?.url || c.image;
            const isSelected = selectedItems.has(c.id);

            return (
              <motion.div layout key={c.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`group relative bg-slate-900/40 border-2 rounded-[3rem] overflow-hidden transition-all hover:shadow-2xl ${c.status === 'draft' ? 'opacity-60' : ''} ${isSelected ? 'border-rose-500/50 shadow-[0_25px_60px_rgba(244,63,94,0.15)]' : 'border-white/5 hover:border-accent/40'}`}
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-950">
                  {displayImage
                    ? <img src={displayImage} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    : <Film size={32} className="absolute inset-0 m-auto text-slate-800" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-5 left-5 flex flex-col gap-2">
                    {c.isFeatured && <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-xl border border-amber-400/50"><Star size={16} className="fill-white" /></div>}
                  </div>

                  {godMode && (
                    <button onClick={e => { e.stopPropagation(); toggleSelection(c.id); }}
                      className={`absolute top-5 right-5 w-8 h-8 z-10 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-rose-500 border-rose-500' : 'bg-slate-950/80 border-white/20 backdrop-blur-md hover:border-rose-500'}`}>
                      {isSelected && <CheckCircle2 size={16} className="text-white" />}
                    </button>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="text-sm font-black text-white line-clamp-2 leading-tight group-hover:text-accent transition-colors mb-3 tracking-tight">{c.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`} style={tierMeta.customColor ? { borderColor: `${tierMeta.customColor}40`, color: tierMeta.customColor } : {}}>{tierMeta.label}</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">{c.category || 'Class'}</span>
                  </div>
                </div>
                <div className="px-5 pb-5 flex gap-2">
                  <button onClick={() => {
                    let parsedNotes = [''];
                    try { parsedNotes = c.notes ? (typeof c.notes === 'string' ? JSON.parse(c.notes) : c.notes) : ['']; } catch (e) { parsedNotes = [c.notes]; }
                    let parsedIngredients = [{ name: '', amount: '' }];
                    try { parsedIngredients = c.ingredients ? (typeof c.ingredients === 'string' ? JSON.parse(c.ingredients) : c.ingredients) : [{ name: '', amount: '' }]; } catch (e) { parsedIngredients = [{ name: '', amount: '' }]; }
                    let parsedSteps = [''];
                    try { parsedSteps = c.steps ? (typeof c.steps === 'string' ? JSON.parse(c.steps) : c.steps) : ['']; } catch (e) { parsedSteps = [c.steps]; }
                    
                    const classToEdit = { 
                      ...c, 
                      notes: Array.isArray(parsedNotes) ? parsedNotes : [parsedNotes],
                      ingredients: Array.isArray(parsedIngredients) ? parsedIngredients : [{ name: '', amount: '' }],
                      steps: Array.isArray(parsedSteps) ? parsedSteps : [parsedSteps]
                    };
                    if (c.thumbnail_image_id && Array.isArray(media)) classToEdit.image = media.find(m => m.id === c.thumbnail_image_id) || c.image;
                    setClassForm(classToEdit);
                    setIsCreating(true);
                    setActiveSection('identity');
                  }} className="flex-1 py-3 text-slate-400 hover:text-white bg-white/5 hover:bg-accent/20 rounded-2xl border border-white/5 hover:border-accent transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Edit3 size={12} /> Production
                  </button>
                  <button onClick={() => requestDelete('classes', c.id, c.title)}
                    className="w-12 h-12 text-rose-500/60 hover:text-white hover:bg-rose-500 bg-rose-500/5 rounded-2xl border border-rose-500/10 hover:border-rose-500 transition-all flex items-center justify-center">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
