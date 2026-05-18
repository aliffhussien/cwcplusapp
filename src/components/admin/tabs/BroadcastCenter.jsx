import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Send, Clock, Trash2, CheckCircle2, Zap 
} from 'lucide-react';

export default function BroadcastCenter({ 
  adminBroadcasts, 
  sendBroadcast, 
  people,
  godMode,
  selectedItems,
  toggleSelection,
  showToast,
  requestDelete
}) {
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'all', scheduled_post_date: '' });

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      showToast("Please fill in title and message", "error");
      return;
    }
    try {
      await sendBroadcast(broadcastForm);
      showToast("Broadcast Initialized! 🚀");
      setBroadcastForm({ title: '', message: '', type: 'all', scheduled_post_date: '' });
    } catch (err) {
      showToast("Broadcast failed: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center">
              <Bell className="text-accent" size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white italic tracking-tighter">Broadcast Hub</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Send Global Intelligence Alerts</p>
            </div>
          </div>
          <p className="text-slate-400 font-medium leading-relaxed">Push real-time alerts to all members, or schedule critical updates for specific launch windows. Every broadcast is logged and archived.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <form onSubmit={handleSendBroadcast} className="p-8 md:p-10 bg-slate-900/50 border border-white/5 rounded-[40px] shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Alert Title</label>
              <input required type="text" value={broadcastForm.title} onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-lg font-bold text-white focus:border-accent outline-none" placeholder="e.g. New Masterclass Dropping!" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Alert Message</label>
              <textarea required value={broadcastForm.message} onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })} rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent outline-none" placeholder="The secret to the perfect crust has been revealed..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Schedule Blast (Optional)</label>
              <input type="datetime-local" value={broadcastForm.scheduled_post_date} onChange={e => setBroadcastForm({ ...broadcastForm, scheduled_post_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent outline-none" />
            </div>

            <div className="bg-accent-500/5 border border-accent/20 rounded-3xl p-6 flex items-start gap-4">
              <Zap className="text-accent shrink-0 mt-1" size={20} />
              <div className="space-y-1">
                <p className="text-sm font-black text-white">Native Push Orchestration</p>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  By clicking blast, this alert will be stored and a Native Push Notification will be sent to all active devices.
                </p>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-accent hover:bg-accent-500 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              <Send size={24} /> Blast Broadcast Now!
            </button>
          </form>

          <div className="flex flex-col items-center justify-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Live Device Preview</h4>
            <div className="relative w-[320px] h-[640px] bg-[#020617] rounded-[3rem] border-[8px] border-slate-800 shadow-2xl p-6 flex flex-col items-center overflow-hidden">
               <div className="absolute top-0 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
               <div className="w-full pt-12 space-y-4 relative z-10">
                  <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-in slide-in-from-top duration-700">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-black text-[10px]">CWC+</div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-white/90 leading-tight">CWC+ SYSTEM</p>
                           <p className="text-[8px] font-bold text-white/50 uppercase tracking-tighter">Intelligence Alert • Just Now</p>
                        </div>
                     </div>
                     <p className="text-xs font-black text-white mb-1">{broadcastForm.title || "Alert Title Placeholder"}</p>
                     <p className="text-[10px] font-medium text-white/70 line-clamp-2">{broadcastForm.message || "Your alert message will appear here precisely as formatted."}</p>
                  </div>
               </div>
               <div className="mt-auto mb-8 w-1/2 h-1 bg-white/20 rounded-full" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h3 className="text-2xl md:text-3xl font-black mb-4 flex items-center gap-3"><Clock size={32} className="text-accent" /> History & Scheduled</h3>
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
            {adminBroadcasts.map(b => {
              const isDraft = b.scheduled_post_date && new Date(b.scheduled_post_date) > new Date();
              return (
                <div key={b.id} className={`p-6 hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-black text-lg text-white truncate">{b.title}</h5>
                      {isDraft ? (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded border border-amber-500/30 flex items-center gap-1"><Clock size={12} /> Scheduled</span>
                      ) : (
                        <span className="px-2 py-1 bg-accent/20 text-accent text-[10px] font-black uppercase rounded border border-accent-500/30 flex items-center gap-1"><CheckCircle2 size={12} /> Sent</span>
                      )}
                    </div>
                    <p className="text-slate-400 font-medium text-sm line-clamp-2">{b.message}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-500">
                      <span>Created: {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => requestDelete('broadcasts', b.id, b.title)} className="w-12 h-12 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors"><Trash2 size={20} /></button>
                </div>
              )
            })}
            {adminBroadcasts.length === 0 && (
              <div className="p-10 text-center text-slate-500 font-bold">No broadcasts yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
