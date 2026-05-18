import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, CheckCircle2, 
  Video, Package, Star, Film
} from 'lucide-react';
import { getTierMeta } from '../../../lib/ui';
import { advancedMultiParse } from '../../../lib/parser';
import ClassStudioEditor from './ClassStudioEditor';

interface ClassStudioProps {
  classes: any[];
  addClass: (data: any) => Promise<void>;
  updateClass: (id: string, data: any) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  settings: any;
  media: any[];
  searchQuery: string;
  godMode?: boolean;
  selectedItems: Set<string>;
  toggleSelection: (id: string) => void;
  showToast: (msg: string, type?: string) => void;
  requestDelete: (coll: string, id: string, title: string) => void;
}

export default function ClassStudio({ 
  classes, 
  addClass, 
  updateClass, 
  settings, 
  media,
  searchQuery,
  godMode,
  selectedItems,
  toggleSelection,
  showToast,
  requestDelete
}: ClassStudioProps) {
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

  const handlePostClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...formData } = classForm as any;
      const data = {
        ...formData,
        ingredients: (formData.ingredients || []).filter((i: any) => i.name && i.name.trim() !== ''),
        steps: (formData.steps || []).filter((s: any) => s && s.trim() !== ''),
        notes: (formData.notes || []).filter((s: any) => typeof s === 'string' && s.trim() !== ''),
        tags: (formData.tags || []).filter((t: any) => t && t.trim() !== '').slice(0, 10),
        is_featured: formData.isFeatured !== undefined ? formData.isFeatured : ((formData as any).is_featured ?? false),
        tier_required: formData.tierRequired !== undefined ? formData.tierRequired : ((formData as any).tier_required ?? 'Premium'),
        scheduled_post_date: formData.scheduled_post_date ? new Date(formData.scheduled_post_date).toISOString() : null,
        live_date: formData.live_date ? new Date(formData.live_date).toISOString() : null
      };

      if (data.image && typeof data.image === 'object' && (data.image as any).id) {
        (data as any).thumbnail_image_id = (data.image as any).id;
        data.image = (data.image as any).hero_url || (data.image as any).url;
      }
      if ((data as any).hero_image && typeof (data as any).hero_image === 'object' && ((data as any).hero_image as any).id) {
        (data as any).hero_image_id = ((data as any).hero_image as any).id;
        (data as any).hero_image = ((data as any).hero_image as any).hero_url || ((data as any).hero_image as any).url;
      }
      if (data.video && typeof data.video === 'object' && (data.video as any).id) {
        (data as any).video_asset_id = (data.video as any).id;
        data.video = (data.video as any).hero_url || (data.video as any).url;
      }

      if (id) {
        await updateClass(id, data);
        showToast("Class Updated! 🎬");
      } else {
        await addClass(data);
        showToast("Class Published! 🎬");
      }
      setIsCreating(false);
    } catch (err: any) {
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

  const handleBulkUploadClasses = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          showToast(`Ingesting ${data.length} classes...`, "info");
          let successCount = 0;
          for (const item of data) {
            try {
              await addClass(item);
              successCount++;
            } catch (err) {
              // Fail silently for bulk items
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
    return <ClassStudioEditor classForm={classForm} setClassForm={setClassForm} activeSection={activeSection} setActiveSection={setActiveSection} rawText={rawText} setRawText={setRawText} handleClassSmartParse={handleClassSmartParse} handlePostClass={handlePostClass} setIsCreating={setIsCreating} settings={settings} />;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-accent rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)]">
            <Video className="text-text-1" size={32} />
          </div>
          <div>
            <h3 className="text-4xl font-black text-text-1 uppercase tracking-tighter italic leading-none">Studio Control</h3>
            <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.5em] mt-3">Production Archive • {classes.length} ACTIVE CLASSES</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <label className="group h-14 px-8 bg-base hover:bg-glass-bg border border-glass-border rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center gap-4 transition-all cursor-pointer backdrop-blur-3xl shadow-2xl text-text-1">
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
            className="h-14 px-10 bg-accent hover:bg-accent/85 text-text-1 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_15px_45px_rgba(79,70,229,0.3)] flex items-center gap-4 active:scale-95 transition-all"
          >
            <Plus size={22} /> Initiate Production
          </button>
        </div>
      </div>

      {fClasses.length === 0 ? (
        <div className="text-center py-40 bg-glass-bg border-2 border-dashed border-glass-border rounded-[4rem]">
          <Film size={60} className="mx-auto text-text-3 mb-6" />
          <p className="text-text-3 font-black uppercase tracking-widest text-sm">Studio Archive: Null</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {fClasses.map(c => {
            const tierMeta = getTierMeta(c.tier_required || c.tierRequired || 'Premium', settings);
            const classMedia = Array.isArray(media) ? media.find(m => m.id === (c.thumbnail_image_id || c.cover_image_id)) : null;
            const displayImage = classMedia?.hero_url || classMedia?.url || c.image;
            const isSelected = selectedItems.has(c.id);

            return (
              <motion.div layout key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`group relative bg-base border-2 rounded-[3rem] overflow-hidden transition-all hover:shadow-2xl ${c.status === 'draft' ? 'opacity-60' : ''} ${isSelected ? 'border-danger/50 shadow-[0_25px_60px_rgba(244,63,94,0.15)]' : 'border-glass-border hover:border-accent/40'}`}
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-surface">
                  {displayImage
                    ? <img src={displayImage} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    : <Film size={32} className="absolute inset-0 m-auto text-text-3" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-5 left-5 flex flex-col gap-2">
                    {c.isFeatured && <div className="w-9 h-9 bg-warning text-text-1 rounded-xl flex items-center justify-center shadow-xl border border-warning/50"><Star size={16} className="fill-text-1" /></div>}
                  </div>

                  {godMode && (
                    <button onClick={e => { e.stopPropagation(); toggleSelection(c.id); }} className={`absolute top-5 right-5 w-8 h-8 z-10 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-danger border-danger' : 'bg-surface/80 border-glass-border backdrop-blur-md hover:border-danger'}`}>
                      {isSelected && <CheckCircle2 size={16} className="text-text-1" />}
                    </button>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="text-sm font-black text-text-1 line-clamp-2 leading-tight group-hover:text-accent transition-colors mb-3 tracking-tight">{c.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`}>{tierMeta.label}</span>
                    <span className="text-[8px] font-black text-text-3 uppercase tracking-widest bg-glass-bg px-2 py-1 rounded-lg">{c.category || 'Class'}</span>
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
                    if (c.thumbnail_image_id && Array.isArray(media)) classToEdit.image = media.find((m: any) => m.id === c.thumbnail_image_id) || c.image;
                    setClassForm(classToEdit);
                    setIsCreating(true);
                    setActiveSection('identity');
                  }} className="flex-1 py-3 text-text-2 hover:text-text-1 bg-glass-bg hover:bg-accent/20 rounded-2xl border border-glass-border hover:border-accent transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Edit3 size={12} /> Production
                  </button>
                  <button onClick={() => requestDelete('classes', c.id, c.title)} className="w-12 h-12 text-danger/60 hover:text-text-1 hover:bg-danger bg-danger/5 rounded-2xl border border-danger/10 hover:border-danger transition-all flex items-center justify-center">
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
