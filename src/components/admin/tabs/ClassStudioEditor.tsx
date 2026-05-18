import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, X, Layout, Film, Globe, BookOpen, Wand2, Star, List, Plus, Minus, AlignLeft, Save } from 'lucide-react';
import MediaUploader from '../MediaUploader';

interface ClassStudioEditorProps {
  classForm: any;
  setClassForm: (data: any) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  rawText: string;
  setRawText: (txt: string) => void;
  handleClassSmartParse: () => void;
  handlePostClass: (e: React.FormEvent) => Promise<void>;
  setIsCreating: (state: boolean) => void;
  settings: any;
}

export default function ClassStudioEditor({
  classForm,
  setClassForm,
  activeSection,
  setActiveSection,
  rawText,
  setRawText,
  handleClassSmartParse,
  handlePostClass,
  setIsCreating,
  settings
}: ClassStudioEditorProps) {
  return (
    <div className="w-full bg-base/80 border border-glass-border rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl pb-20">
      <div className="bg-base/85 border-b border-glass-border p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <Video size={40} className="text-text-1" />
          </div>
          <div>
            <h4 className="text-4xl md:text-6xl font-black text-text-1 tracking-tighter italic leading-none">{classForm.id ? 'Studio Refinement' : 'New Studio Production'}</h4>
            <p className="text-xs font-black text-text-3 uppercase tracking-[0.4em] mt-3 ml-1">V2.0 Production Interface</p>
          </div>
        </div>
        <div className="flex bg-surface/85 p-2 rounded-[2.5rem] border border-glass-border backdrop-blur-md shadow-2xl">
          {[
            { id: 'identity', label: 'Identity', icon: Layout },
            { id: 'media', label: 'Media', icon: Film },
            { id: 'studio', label: 'Studio', icon: Globe },
            { id: 'content', label: 'Content', icon: BookOpen }
          ].map(sec => (
            <button key={sec.id} type="button" onClick={() => setActiveSection(sec.id)} className={`px-8 py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${activeSection === sec.id ? 'bg-accent text-text-1 shadow-xl shadow-accent/20' : 'text-text-3 hover:text-text-2'}`}>
              <sec.icon size={16} /> {sec.label}
            </button>
          ))}
        </div>
        <button onClick={() => setIsCreating(false)} className="w-16 h-16 bg-glass-bg hover:bg-danger/20 hover:text-danger text-text-1 rounded-full flex items-center justify-center transition-all border border-glass-border"><X size={32} /></button>
      </div>

      <form onSubmit={handlePostClass} className="p-8 md:p-14 space-y-16">
          <AnimatePresence mode="wait">
             {activeSection === 'identity' && (
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                  <div className="p-10 bg-base/50 border-2 border-glass-border rounded-[3rem] shadow-2xl">
                    <h5 className="text-2xl font-black text-text-1 mb-6 flex items-center gap-3"><Wand2 className="text-accent" /> Magic Auto-Fill</h5>
                    <textarea rows={3} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Paste the class details here to auto-populate form..." className="w-full bg-surface border-2 border-glass-border rounded-[2rem] px-8 py-6 text-lg text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent transition-all mb-6 custom-scrollbar" />
                    <button type="button" onClick={handleClassSmartParse} className="w-full py-5 bg-base hover:bg-elevated rounded-full font-black text-lg text-text-1 transition-all shadow-xl active:scale-95">Perform Extraction ✨</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Class Title</label>
                       <input required type="text" value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-xl font-black text-text-1 focus:border-accent outline-none" placeholder="Mastering the French Omelette" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Instructor</label>
                       <input type="text" value={classForm.instructor || ''} onChange={e => setClassForm({ ...classForm, instructor: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Category</label>
                       <input type="text" value={classForm.category} onChange={e => setClassForm({ ...classForm, category: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Duration</label>
                       <input type="text" value={classForm.duration} onChange={e => setClassForm({ ...classForm, duration: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" placeholder="45 min" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Access Tier</label>
                       <select value={classForm.tierRequired} onChange={e => setClassForm({ ...classForm, tierRequired: e.target.value })} className="w-full h-16 bg-surface border-2 border-glass-border rounded-3xl px-8 text-sm font-black uppercase tracking-widest text-accent outline-none focus:border-accent appearance-none cursor-pointer shadow-lg">
                         {(settings?.premiumTiers || []).map((t: any) => <option key={t.id} value={t.name}>{t.name} Exclusive</option>)}
                         <option value="Free">Free / Public</option>
                       </select>
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Production Status</label>
                       <div className="flex bg-surface rounded-3xl p-1.5 border-2 border-glass-border">
                         <button type="button" onClick={() => setClassForm({ ...classForm, status: 'draft' })} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${classForm.status === 'draft' ? 'bg-glass-bg text-text-1' : 'text-text-3 hover:text-text-2'}`}>Draft Mode</button>
                         <button type="button" onClick={() => setClassForm({ ...classForm, status: 'published' })} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${classForm.status === 'published' ? 'bg-accent text-text-1 shadow-xl' : 'text-text-3 hover:text-text-2'}`}>Live Production</button>
                       </div>
                     </div>
                  </div>
               </motion.div>
             )}

             {activeSection === 'media' && (
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <MediaUploader label="Class Thumbnail (Library)" value={classForm.image} onChange={(val: any) => setClassForm({ ...classForm, image: val })} contentId={classForm.id} contentType="class" />
                  <MediaUploader label="Cinema Hero (Widescreen)" value={classForm.hero_image} onChange={(val: any) => setClassForm({ ...classForm, hero_image: val })} contentId={classForm.id} contentType="class" />
                  <MediaUploader label="Full Production Video" value={classForm.video} onChange={(val: any) => setClassForm({ ...classForm, video: val })} contentId={classForm.id} contentType="class" />
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-text-3 ml-4">Live Link Override</label>
                     <input type="text" value={classForm.live_link} onChange={e => setClassForm({ ...classForm, live_link: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-sm font-bold text-text-1 focus:border-accent outline-none" placeholder="https://youtube.com/live/..." />
                  </div>
               </motion.div>
             )}

             {activeSection === 'studio' && (
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Scheduled Release</label>
                       <input type="datetime-local" value={classForm.scheduled_post_date} onChange={e => setClassForm({ ...classForm, scheduled_post_date: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-sm font-bold text-text-1 focus:border-accent outline-none" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Live Session Date</label>
                       <input type="datetime-local" value={classForm.live_date} onChange={e => setClassForm({ ...classForm, live_date: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-sm font-bold text-text-1 focus:border-accent outline-none" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Live Duration (Hours)</label>
                       <input type="number" value={classForm.live_duration_hours || 2} onChange={e => setClassForm({ ...classForm, live_duration_hours: parseInt(e.target.value) })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-text-3 ml-4">Featured Status</label>
                       <button type="button" onClick={() => setClassForm({ ...classForm, isFeatured: !classForm.isFeatured })} className={`w-full h-[68px] border-2 rounded-3xl flex items-center justify-center gap-4 transition-all ${classForm.isFeatured ? 'bg-warning/10 border-warning text-warning shadow-xl shadow-warning/10' : 'bg-surface border-glass-border text-text-3'}`}>
                         <Star size={20} className={classForm.isFeatured ? 'fill-warning text-warning' : ''} />
                         <span className="text-[11px] font-black uppercase tracking-widest">Pin to Home Spotlight</span>
                       </button>
                     </div>
                  </div>
               </motion.div>
             )}

             {activeSection === 'content' && (
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-16">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-6">
                       <h5 className="text-2xl font-black text-text-1 flex items-center gap-4"><List className="text-accent" /> Essential Assets <span className="text-xs text-text-3 uppercase tracking-widest">(Ingredients)</span></h5>
                       <button type="button" onClick={() => setClassForm({ ...classForm, ingredients: [...classForm.ingredients, { name: '', amount: '' }] })} className="w-12 h-12 bg-accent text-text-1 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><Plus size={24} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {classForm.ingredients.map((ing: any, i: number) => (
                          <div key={i} className="flex gap-4 bg-base/50 p-5 rounded-3xl border border-glass-border hover:border-accent/20 transition-all group">
                            <input type="text" value={ing.amount} onChange={e => { const n = [...classForm.ingredients]; n[i].amount = e.target.value; setClassForm({ ...classForm, ingredients: n }); }} className="w-24 bg-glass-bg border border-glass-border rounded-2xl px-5 py-3 text-sm font-bold text-accent outline-none focus:border-accent" placeholder="Amt" />
                            <input type="text" value={ing.name} onChange={e => { const n = [...classForm.ingredients]; n[i].name = e.target.value; setClassForm({ ...classForm, ingredients: n }); }} className="flex-1 bg-glass-bg border border-glass-border rounded-2xl px-5 py-3 text-sm font-bold text-text-1 outline-none focus:border-accent" placeholder="Item name..." />
                            <button type="button" onClick={() => setClassForm({ ...classForm, ingredients: classForm.ingredients.filter((_: any, idx: number) => idx !== i) })} className="w-10 h-10 text-danger hover:bg-danger/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Minus size={18} /></button>
                          </div>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-6">
                       <h5 className="text-2xl font-black text-text-1 flex items-center gap-4"><AlignLeft className="text-accent" /> Production Flow <span className="text-xs text-text-3 uppercase tracking-widest">(Steps)</span></h5>
                       <button type="button" onClick={() => setClassForm({ ...classForm, steps: [...classForm.steps, ''] })} className="w-12 h-12 bg-accent text-text-1 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><Plus size={24} /></button>
                    </div>
                    <div className="space-y-4">
                       {classForm.steps.map((step: string, i: number) => (
                          <div key={i} className="flex gap-6 bg-base/50 p-8 rounded-[2.5rem] border border-glass-border hover:border-accent/20 transition-all group">
                            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center font-black flex-shrink-0 text-lg border border-accent/10 shadow-inner">{i + 1}</div>
                            <textarea value={step} onChange={e => { const n = [...classForm.steps]; n[i] = e.target.value; setClassForm({ ...classForm, steps: n }); }} className="flex-1 bg-transparent border-none text-text-1 text-xl font-medium outline-none placeholder:text-text-3 custom-scrollbar resize-none" rows={2} placeholder="Explain this production phase..." />
                            <button type="button" onClick={() => setClassForm({ ...classForm, steps: classForm.steps.filter((_: any, idx: number) => idx !== i) })} className="w-12 h-12 text-danger hover:bg-danger/10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity self-start"><Minus size={22} /></button>
                          </div>
                       ))}
                    </div>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>

          <div className="flex justify-center pt-20 border-t border-glass-border">
              <button type="submit" className="px-16 py-7 bg-accent hover:bg-accent/80 text-text-1 rounded-full font-black text-2xl shadow-[0_30px_70px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center gap-4 group">
                  <Save size={32} className="group-hover:rotate-12 transition-transform" /> {classForm.id ? 'Authorize Production Update' : 'Launch New Masterclass'}
              </button>
          </div>
      </form>
    </div>
  );
}
