import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, CheckCircle2, 
  Users, UserPlus, X, Book, Unlock, 
  LockKeyhole as LockIcon, Video, Mail, Calendar, Shield, ExternalLink,
  ChevronDown
} from 'lucide-react';
import { getTierMeta } from '../../../lib/ui';
import { JankFreeButton } from '../../PerformanceUI';

export default function MemberDirectory({ 
  people, 
  addUser, 
  updateUser, 
  updateUserTier,
  removeUser, 
  settings, 
  classes,
  searchQuery,
  godMode,
  selectedItems,
  toggleSelection,
  showToast,
  requestDelete,
  setUnlockContext
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  
  const [personForm, setPersonForm] = useState({ 
    id: null, name: '', email: '', subscriptionTier: 'Free', 
    role: 'user', unlocked_volumes: [], unlocked_classes: [] 
  });

  const fPeople = useMemo(() => people.filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [people, searchQuery]);

  const handlePostUser = async (e) => {
    e.preventDefault();
    try {
      if (personForm.id) {
        await updateUser(personForm.id, { 
          name: personForm.name, email: personForm.email, 
          subscription_tier: personForm.subscriptionTier, role: personForm.role, 
          unlocked_volumes: personForm.unlocked_volumes, 
          unlocked_classes: personForm.unlocked_classes 
        });
        showToast("Member Intelligence Updated! ✏️");
      } else {
        await addUser({ 
          name: personForm.name, email: personForm.email, 
          subscription_tier: personForm.subscriptionTier, role: personForm.role, 
          unlocked_volumes: personForm.unlocked_volumes, 
          unlocked_classes: personForm.unlocked_classes, 
          createdAt: new Date().toISOString()
        });
        showToast("Member Registered Successfully! 👋");
      }
      setIsCreating(false);
    } catch (err) {
      showToast("Operation Failed: " + err.message, "error");
    }
  };

  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto bg-[#0F172A]/90 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl pb-20">
        <div className="bg-accent p-8 md:p-12 flex justify-between items-center">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                <UserPlus size={32} className="text-white" />
             </div>
             <div>
               <h4 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic">{personForm.id ? 'Edit Personnel' : 'Enroll Personnel'}</h4>
               <p className="text-xs font-black text-white/50 uppercase tracking-[0.4em] mt-2 ml-1">Platform Intelligence Access</p>
             </div>
          </div>
          <button onClick={() => setIsCreating(false)} className="w-14 h-14 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/20"><X size={32} /></button>
        </div>
        
        <form onSubmit={handlePostUser} className="p-8 md:p-14 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Full Name</label>
              <input required type="text" value={personForm.name} onChange={e => setPersonForm({ ...personForm, name: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-xl font-black text-white focus:border-accent outline-none" placeholder="John Doe" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Email Intelligence</label>
              <input required type="email" value={personForm.email} onChange={e => setPersonForm({ ...personForm, email: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" placeholder="john@example.com" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Subscription Protocol</label>
              <select value={personForm.subscriptionTier || personForm.subscription_tier} onChange={e => setPersonForm({ ...personForm, subscriptionTier: e.target.value, subscription_tier: e.target.value })} className="w-full h-[68px] bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 text-sm font-black uppercase tracking-widest text-white outline-none cursor-pointer appearance-none focus:border-accent">
                <option value="Free">Free Access</option>
                {(settings?.premiumTiers || []).map(t => <option key={t.id} value={t.name}>{t.name} Protocol</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4">System Role</label>
              <select value={personForm.role} onChange={e => setPersonForm({ ...personForm, role: e.target.value })} className="w-full h-[68px] bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 text-sm font-black uppercase tracking-widest text-white outline-none cursor-pointer appearance-none focus:border-accent">
                {['user', 'employee', 'management', 'admin'].map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          {personForm.id && (
            <div className="pt-12 border-t border-white/5 space-y-10">
              <div>
                <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-4"><Book size={28} className="text-accent" /> Explicit Volume Unlocks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(settings.volumes || []).map(v => {
                    const isUnlocked = personForm.unlocked_volumes?.includes(v.name);
                    return (
                      <div key={v.id} className="flex items-center justify-between bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 group hover:border-accent/20 transition-all">
                        <span className="font-bold text-slate-300 tracking-tight">{v.name}</span>
                        <button type="button" onClick={() => setUnlockContext({ isOpen: true, itemType: 'volume', itemId: v.name, itemName: v.name, action: isUnlocked ? 'lock' : 'unlock', userId: personForm.id })} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isUnlocked ? 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white' : 'bg-slate-800 text-slate-500 border border-white/5 hover:bg-slate-700 hover:text-white'}`}>
                          {isUnlocked ? <Unlock size={14} /> : <LockIcon size={14} />}
                          {isUnlocked ? 'Revoke' : 'Unlock'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-4"><Video size={28} className="text-violet-500" /> Explicit Class Unlocks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(classes || []).slice(0, 10).map(c => {
                    const isUnlocked = personForm.unlocked_classes?.includes(c.id);
                    return (
                      <div key={c.id} className="flex items-center justify-between bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 group hover:border-violet-500/20 transition-all">
                        <span className="font-bold text-slate-300 tracking-tight truncate flex-1 mr-4">{c.title}</span>
                        <button type="button" onClick={() => setUnlockContext({ isOpen: true, itemType: 'class', itemId: c.id, itemName: c.title, action: isUnlocked ? 'lock' : 'unlock', userId: personForm.id })} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isUnlocked ? 'bg-violet-600/10 text-violet-500 border border-violet-500/20 hover:bg-violet-600 hover:text-white' : 'bg-slate-800 text-slate-500 border border-white/5 hover:bg-slate-700 hover:text-white'}`}>
                          {isUnlocked ? <Unlock size={14} /> : <LockIcon size={14} />}
                          {isUnlocked ? 'Revoke' : 'Unlock'}
                        </button>
                      </div>
                    )
                  })}
                  {(classes || []).length > 10 && (
                     <div className="col-span-full text-center pt-4">
                        <button type="button" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Search All Classes to Unlock...</button>
                     </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-8">
             <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black text-xl uppercase tracking-widest transition-all">Discard</button>
             <button type="submit" className="flex-[2] py-6 bg-accent hover:bg-accent-sec text-white rounded-full font-black text-xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3">
                <Save size={28} /> {personForm.id ? 'Confirm Intelligence Update' : 'Initialize Personnel Enrollment'}
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
          <div className="w-16 h-16 bg-accent/20 rounded-[2rem] flex items-center justify-center shadow-inner border border-white/5">
            <Users className="text-accent" size={32} />
          </div>
          <div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Personnel Intelligence</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-3">Global Registry • {people.length} IDENTIFIED USERS</p>
          </div>
        </div>
        {!isCreating && (
          <JankFreeButton 
            onClick={() => {
              setPersonForm({ 
                id: null, name: '', email: '', subscriptionTier: 'Free', 
                role: 'user', unlocked_volumes: [], unlocked_classes: [] 
              }); 
              setIsCreating(true); 
            }} 
            className="h-14 px-10 bg-accent hover:bg-accent-sec text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl flex items-center gap-4 transition-all"
          >
            <UserPlus size={20} /> Enroll Member
          </JankFreeButton>
        )}
      </div>

      {fPeople.length === 0 ? (
        <div className="p-40 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[4rem]">
          <Users size={80} className="mx-auto text-slate-800 mb-8" />
          <p className="text-2xl font-black text-slate-600 uppercase tracking-widest italic">Personnel match: Null</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {fPeople.slice(0, visibleCount).map(p => {
            const tierMeta = getTierMeta(p.subscriptionTier || p.subscription_tier || 'Free', settings);
            const isSelected = selectedItems.has(p.id);
            const joinedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <motion.div layout key={p.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`group relative bg-[#0F172A]/40 border-2 rounded-[3rem] p-6 transition-all hover:shadow-2xl ${isSelected ? 'border-rose-500/50 shadow-[0_20px_50px_rgba(244,63,94,0.1)]' : 'border-white/5 hover:border-accent/40'}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4 min-w-0">
                    {godMode && (
                      <button onClick={() => toggleSelection(p.id)}
                        className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-rose-500 border-rose-500' : 'border-slate-800 bg-slate-950/80 hover:border-rose-500/50'}`}>
                        {isSelected && <CheckCircle2 size={12} className="text-white" />}
                      </button>
                    )}
                    <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl border-2 flex-shrink-0 shadow-xl overflow-hidden ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`}>
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : (p.name?.[0]?.toUpperCase() || '?')}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => { setPersonForm({ id: p.id, name: p.name, email: p.email, subscriptionTier: p.subscriptionTier || p.subscription_tier || 'Free', role: p.role || 'user', unlocked_volumes: p.unlocked_volumes || [], unlocked_classes: p.unlocked_classes || [] }); setIsCreating(true); }}
                      className="w-10 h-10 text-slate-400 hover:text-white bg-white/5 hover:bg-accent rounded-2xl border border-white/10 flex items-center justify-center transition-all">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => requestDelete('people', p.id, p.name)}
                      className="w-10 h-10 text-rose-500/60 hover:text-white hover:bg-rose-500 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex items-center justify-center transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                   <h4 className="text-lg font-black text-white leading-tight truncate group-hover:text-accent transition-colors">{p.name || 'Anonymous Entity'}</h4>
                   <p className="text-xs text-slate-500 font-bold truncate flex items-center gap-2"><Mail size={12} className="shrink-0" /> {p.email}</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-slate-600" />
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{p.role || 'User'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-600" />
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{joinedDate}</span>
                      </div>
                   </div>

                    <div className="relative group/select">
                      <select value={p.subscriptionTier || p.subscription_tier || 'Free'} onChange={async (e) => {
                        await updateUserTier(p.id, e.target.value);
                        showToast(`${p.name} access level recalibrated!`);
                      }} className={`w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] outline-none cursor-pointer ${tierMeta.color} hover:border-accent transition-all appearance-none`}>
                        <option value="Free">Standard Free</option>
                        {(settings.premiumTiers || []).map(t => <option key={t.id} value={t.name}>{t.name} Protocol</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover/select:text-accent transition-colors" />
                   </div>

                   <button onClick={() => setUnlockContext({ userId: p.id, userName: p.name })} className="w-full h-11 bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-accent">
                      <Unlock size={14} /> Explicit Unlock
                   </button>
                </div>

                <AnimatePresence>
                   {(p.unlocked_volumes?.length > 0 || p.unlocked_classes?.length > 0) && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-dashed border-white/5 flex flex-wrap gap-1.5">
                        {[...(p.unlocked_volumes || []), ...(p.unlocked_classes || [])].slice(0, 3).map((unlock, i) => (
                           <span key={i} className="px-2 py-1 bg-accent/5 border border-accent/10 rounded-lg text-[8px] font-black text-accent uppercase tracking-widest">Explicit Access</span>
                        ))}
                        {([...(p.unlocked_volumes || []), ...(p.unlocked_classes || [])].length > 3) && (
                           <span className="text-[8px] font-black text-slate-600 uppercase">+ more</span>
                        )}
                     </motion.div>
                   )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {fPeople.length > visibleCount && (
        <div className="flex flex-col items-center gap-4 pt-12">
          <button onClick={() => setVisibleCount(prev => prev + 50)}
            className="px-20 py-4 bg-slate-900 hover:bg-white/5 border-2 border-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all active:scale-95 shadow-2xl">
            Analyze Remaining Personnel
          </button>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-700">Displaying {visibleCount} of {fPeople.length} Identification records</p>
        </div>
      )}
    </div>
  );
}
