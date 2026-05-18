import React from 'react';
import { Plus, UserPlus, X, Book, Unlock, LockKeyhole as LockIcon, Video, Save } from 'lucide-react';

interface MemberDirectoryFormProps {
  personForm: any;
  setPersonForm: (data: any) => void;
  isCreating: boolean;
  setIsCreating: (state: boolean) => void;
  handlePostUser: (e: React.FormEvent) => Promise<void>;
  settings: any;
  classes: any[];
  setUnlockContext: (data: any) => void;
}

export default function MemberDirectoryForm({
  personForm,
  setPersonForm,
  setIsCreating,
  handlePostUser,
  settings,
  classes,
  setUnlockContext
}: MemberDirectoryFormProps) {
  return (
    <div className="max-w-4xl mx-auto bg-base/90 border border-glass-border rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl pb-20">
      <div className="bg-accent p-8 md:p-12 flex justify-between items-center">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-glass-bg rounded-3xl flex items-center justify-center">
              <UserPlus size={32} className="text-text-1" />
           </div>
           <div>
             <h4 className="text-3xl md:text-5xl font-black text-text-1 tracking-tighter italic">{personForm.id ? 'Edit Personnel' : 'Enroll Personnel'}</h4>
             <p className="text-xs font-black text-text-1/50 uppercase tracking-[0.4em] mt-2 ml-1">Platform Intelligence Access</p>
           </div>
        </div>
        <button onClick={() => setIsCreating(false)} className="w-14 h-14 md:w-16 md:h-16 bg-glass-bg hover:bg-glass-bg rounded-full flex items-center justify-center transition-all border border-glass-border"><X size={32} className="text-text-1" /></button>
      </div>
      
      <form onSubmit={handlePostUser} className="p-8 md:p-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-text-3 ml-4">Full Name</label>
            <input required type="text" value={personForm.name} onChange={e => setPersonForm({ ...personForm, name: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-xl font-black text-text-1 focus:border-accent outline-none" placeholder="John Doe" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-text-3 ml-4">Email Intelligence</label>
            <input required type="email" value={personForm.email} onChange={e => setPersonForm({ ...personForm, email: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" placeholder="john@example.com" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-text-3 ml-4">Subscription Protocol</label>
            <select value={personForm.subscriptionTier || personForm.subscription_tier} onChange={e => setPersonForm({ ...personForm, subscriptionTier: e.target.value, subscription_tier: e.target.value })} className="w-full h-[68px] bg-surface border-2 border-glass-border rounded-3xl px-8 text-sm font-black uppercase tracking-widest text-text-1 outline-none cursor-pointer appearance-none focus:border-accent">
              <option value="Free">Free Access</option>
              {(settings?.premiumTiers || []).map((t: any) => <option key={t.id} value={t.name}>{t.name} Protocol</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-text-3 ml-4">System Role</label>
            <select value={personForm.role} onChange={e => setPersonForm({ ...personForm, role: e.target.value })} className="w-full h-[68px] bg-surface border-2 border-glass-border rounded-3xl px-8 text-sm font-black uppercase tracking-widest text-text-1 outline-none cursor-pointer appearance-none focus:border-accent">
              {['user', 'employee', 'management', 'admin'].map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        {personForm.id && (
          <div className="pt-12 border-t border-glass-border space-y-10">
            <div>
              <h4 className="text-2xl font-black text-text-1 mb-6 flex items-center gap-4"><Book size={28} className="text-accent" /> Explicit Volume Unlocks</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(settings?.volumes || []).map((v: any) => {
                  const isUnlocked = personForm.unlocked_volumes?.includes(v.name);
                  return (
                    <div key={v.id} className="flex items-center justify-between bg-base/50 p-6 rounded-[2rem] border border-glass-border group hover:border-accent/20 transition-all">
                      <span className="font-bold text-text-2 tracking-tight">{v.name}</span>
                      <button type="button" onClick={() => setUnlockContext({ isOpen: true, itemType: 'volume', itemId: v.name, itemName: v.name, action: isUnlocked ? 'lock' : 'unlock', userId: personForm.id })} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isUnlocked ? 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-text-1' : 'bg-surface text-text-3 border border-glass-border hover:bg-elevated hover:text-text-1'}`}>
                        {isUnlocked ? <Unlock size={14} /> : <LockIcon size={14} />}
                        {isUnlocked ? 'Revoke' : 'Unlock'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h4 className="text-2xl font-black text-text-1 mb-6 flex items-center gap-4"><Video size={28} className="text-accent" /> Explicit Class Unlocks</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(classes || []).slice(0, 10).map((c: any) => {
                  const isUnlocked = personForm.unlocked_classes?.includes(c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between bg-base/50 p-6 rounded-[2rem] border border-glass-border group hover:border-accent/20 transition-all">
                      <span className="font-bold text-text-2 tracking-tight truncate flex-1 mr-4">{c.title}</span>
                      <button type="button" onClick={() => setUnlockContext({ isOpen: true, itemType: 'class', itemId: c.id, itemName: c.title, action: isUnlocked ? 'lock' : 'unlock', userId: personForm.id })} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isUnlocked ? 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-text-1' : 'bg-surface text-text-3 border border-glass-border hover:bg-elevated hover:text-text-1'}`}>
                        {isUnlocked ? <Unlock size={14} /> : <LockIcon size={14} />}
                        {isUnlocked ? 'Revoke' : 'Unlock'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-8">
           <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-6 bg-surface hover:bg-elevated text-text-1 rounded-full font-black text-xl uppercase tracking-widest transition-all">Discard</button>
           <button type="submit" className="flex-[2] py-6 bg-accent hover:bg-accent/80 text-text-1 rounded-full font-black text-xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3">
              <Save size={28} /> {personForm.id ? 'Confirm Intelligence Update' : 'Initialize Personnel Enrollment'}
           </button>
        </div>
      </form>
    </div>
  );
}
