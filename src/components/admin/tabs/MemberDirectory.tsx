import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Trash2, CheckCircle2, 
  Users, UserPlus, Unlock, 
  Mail, Calendar, Shield,
  ChevronDown
} from 'lucide-react';
import { getTierMeta } from '../../../lib/ui';
import { JankFreeButton } from '../../PerformanceUI';
import MemberDirectoryForm from './MemberDirectoryForm';

interface MemberDirectoryProps {
  people: any[];
  addUser: (data: any) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  updateUserTier: (id: string, tier: string) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  settings: any;
  classes: any[];
  searchQuery: string;
  godMode?: boolean;
  selectedItems: Set<string>;
  toggleSelection: (id: string) => void;
  showToast: (msg: string, type?: string) => void;
  requestDelete: (coll: string, id: string, title: string) => void;
  setUnlockContext: (data: any) => void;
}

export default function MemberDirectory({ 
  people, 
  addUser, 
  updateUser, 
  updateUserTier,
  settings, 
  classes,
  searchQuery,
  godMode,
  selectedItems,
  toggleSelection,
  showToast,
  requestDelete,
  setUnlockContext
}: MemberDirectoryProps) {
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

  const handlePostUser = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      showToast("Operation Failed: " + err.message, "error");
    }
  };

  if (isCreating) {
    return <MemberDirectoryForm personForm={personForm} setPersonForm={setPersonForm} isCreating={isCreating} setIsCreating={setIsCreating} handlePostUser={handlePostUser} settings={settings} classes={classes} setUnlockContext={setUnlockContext} />;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/20 rounded-[2rem] flex items-center justify-center shadow-inner border border-glass-border">
            <Users className="text-accent" size={32} />
          </div>
          <div>
            <h3 className="text-4xl font-black text-text-1 uppercase tracking-tighter italic leading-none">Personnel Intelligence</h3>
            <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.5em] mt-3">Global Registry • {people.length} IDENTIFIED USERS</p>
          </div>
        </div>
        {!isCreating && (
          <JankFreeButton 
            onClick={() => {
              setPersonForm({ id: null, name: '', email: '', subscriptionTier: 'Free', role: 'user', unlocked_volumes: [], unlocked_classes: [] }); 
              setIsCreating(true); 
            }} 
            className="h-14 px-10 bg-accent hover:bg-accent/80 text-text-1 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl flex items-center gap-4 transition-all"
          >
            <UserPlus size={20} /> Enroll Member
          </JankFreeButton>
        )}
      </div>

      {fPeople.length === 0 ? (
        <div className="p-40 text-center bg-glass-bg border-2 border-dashed border-glass-border rounded-[4rem]">
          <Users size={80} className="mx-auto text-text-3 mb-8" />
          <p className="text-2xl font-black text-text-2 uppercase tracking-widest italic">Personnel match: Null</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {fPeople.slice(0, visibleCount).map(p => {
            const tierMeta = getTierMeta(p.subscriptionTier || p.subscription_tier || 'Free', settings);
            const isSelected = selectedItems.has(p.id);
            const joinedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <motion.div layout key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`group relative bg-base/40 border-2 rounded-[3rem] p-6 transition-all hover:shadow-2xl ${isSelected ? 'border-danger/50 shadow-[0_20px_50px_rgba(244,63,94,0.1)]' : 'border-glass-border hover:border-accent/40'}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4 min-w-0">
                    {godMode && (
                      <button onClick={() => toggleSelection(p.id)} className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-danger border-danger' : 'border-glass-border bg-surface/80 hover:border-danger/50'}`}>
                        {isSelected && <CheckCircle2 size={12} className="text-text-1" />}
                      </button>
                    )}
                    <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl border-2 flex-shrink-0 shadow-xl overflow-hidden ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`}>
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : (p.name?.[0]?.toUpperCase() || '?')}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => { setPersonForm({ id: p.id, name: p.name, email: p.email, subscriptionTier: p.subscriptionTier || p.subscription_tier || 'Free', role: p.role || 'user', unlocked_volumes: p.unlocked_volumes || [], unlocked_classes: p.unlocked_classes || [] }); setIsCreating(true); }}
                      className="w-10 h-10 text-text-2 hover:text-text-1 bg-glass-bg hover:bg-accent rounded-2xl border border-glass-border flex items-center justify-center transition-all">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => requestDelete('people', p.id, p.name)} className="w-10 h-10 text-danger/60 hover:text-text-1 hover:bg-danger bg-danger/5 rounded-2xl border border-danger/10 flex items-center justify-center transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                   <h4 className="text-lg font-black text-text-1 leading-tight truncate group-hover:text-accent transition-colors">{p.name || 'Anonymous Entity'}</h4>
                   <p className="text-xs text-text-3 font-bold truncate flex items-center gap-2"><Mail size={12} className="shrink-0" /> {p.email}</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-glass-border">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-text-3" />
                        <span className="text-[10px] font-black uppercase text-text-3 tracking-widest">{p.role || 'User'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-text-3" />
                        <span className="text-[10px] font-black uppercase text-text-3 tracking-widest">{joinedDate}</span>
                      </div>
                   </div>

                    <div className="relative group/select">
                      <select value={p.subscriptionTier || p.subscription_tier || 'Free'} onChange={async (e) => {
                        await updateUserTier(p.id, e.target.value);
                        showToast(`${p.name} access level recalibrated!`);
                      }} className={`w-full bg-surface border-2 border-glass-border rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] outline-none cursor-pointer ${tierMeta.color} hover:border-accent transition-all appearance-none`}>
                        <option value="Free">Standard Free</option>
                        {(settings?.premiumTiers || []).map((t: any) => <option key={t.id} value={t.name}>{t.name} Protocol</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-3 group-hover/select:text-accent transition-colors" />
                   </div>

                   <button onClick={() => setUnlockContext({ userId: p.id, userName: p.name })} className="w-full h-11 bg-glass-bg hover:bg-accent/10 border border-glass-border hover:border-accent/30 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all text-text-2 hover:text-accent">
                      <Unlock size={14} /> Explicit Unlock
                   </button>
                </div>

                <AnimatePresence>
                   {(p.unlocked_volumes?.length > 0 || p.unlocked_classes?.length > 0) && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-dashed border-glass-border flex flex-wrap gap-1.5">
                        {[...(p.unlocked_volumes || []), ...(p.unlocked_classes || [])].slice(0, 3).map((unlock, i) => (
                           <span key={i} className="px-2 py-1 bg-accent/5 border border-accent/10 rounded-lg text-[8px] font-black text-accent uppercase tracking-widest">Explicit Access</span>
                        ))}
                        {([...(p.unlocked_volumes || []), ...(p.unlocked_classes || [])].length > 3) && (
                           <span className="text-[8px] font-black text-text-3 uppercase">+ more</span>
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
          <button onClick={() => setVisibleCount(prev => prev + 50)} className="px-20 py-4 bg-base hover:bg-glass-bg border-2 border-glass-border rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-text-3 hover:text-text-1 transition-all active:scale-95 shadow-2xl">
            Analyze Remaining Personnel
          </button>
          <p className="text-[9px] font-black uppercase tracking-widest text-text-3">Displaying {visibleCount} of {fPeople.length} Identification records</p>
        </div>
      )}
    </div>
  );
}
