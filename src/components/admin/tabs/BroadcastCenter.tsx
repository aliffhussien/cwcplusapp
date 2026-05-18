import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Send, Clock, Trash2, CheckCircle2, Zap 
} from 'lucide-react';

interface BroadcastCenterProps {
  adminBroadcasts: any[];
  sendBroadcast: (data: any) => Promise<void>;
  people?: any[];
  godMode?: boolean;
  selectedItems?: Set<string>;
  toggleSelection?: (id: string) => void;
  showToast: (msg: string, type?: string) => void;
  requestDelete: (coll: string, id: string, title: string) => void;
}

export default function BroadcastCenter({ 
  adminBroadcasts, 
  sendBroadcast, 
  showToast,
  requestDelete
}: BroadcastCenterProps) {
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'all', scheduled_post_date: '' });

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      showToast("Please fill in title and message", "error");
      return;
    }
    try {
      await sendBroadcast(broadcastForm);
      showToast("Broadcast Initialized! 🚀");
      setBroadcastForm({ title: '', message: '', type: 'all', scheduled_post_date: '' });
    } catch (err: any) {
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
              <h3 className="text-3xl font-black text-text-1 italic tracking-tighter">Broadcast Hub</h3>
              <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.4em]">Send Global Intelligence Alerts</p>
            </div>
          </div>
          <p className="text-text-2 font-medium leading-relaxed">Push real-time alerts to all members, or schedule critical updates for specific launch windows. Every broadcast is logged and archived.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <form onSubmit={handleSendBroadcast} className="p-8 md:p-10 bg-glass-bg border border-glass-border rounded-[40px] shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-3 ml-2">Alert Title</label>
              <input required type="text" value={broadcastForm.title} onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })} className="w-full bg-surface border border-glass-border rounded-2xl px-6 py-4 text-lg font-bold text-text-1 focus:border-accent outline-none" placeholder="e.g. New Masterclass Dropping!" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-3 ml-2">Alert Message</label>
              <textarea required value={broadcastForm.message} onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })} rows={4} className="w-full bg-surface border border-glass-border rounded-2xl px-6 py-4 text-sm font-bold text-text-1 focus:border-accent outline-none" placeholder="The secret to the perfect crust has been revealed..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-3 ml-2">Schedule Blast (Optional)</label>
              <input type="datetime-local" value={broadcastForm.scheduled_post_date} onChange={e => setBroadcastForm({ ...broadcastForm, scheduled_post_date: e.target.value })} className="w-full bg-surface border border-glass-border rounded-2xl px-6 py-4 text-sm font-bold text-text-1 focus:border-accent outline-none" />
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-3xl p-6 flex items-start gap-4">
              <Zap className="text-accent shrink-0 mt-1" size={20} />
              <div className="space-y-1">
                <p className="text-sm font-black text-text-1">Native Push Orchestration</p>
                <p className="text-xs text-text-2 font-medium leading-relaxed">
                  By clicking blast, this alert will be stored and a Native Push Notification will be sent to all active devices.
                </p>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-accent hover:bg-accent/80 rounded-full font-black text-xl text-text-1 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              <Send size={24} /> Blast Broadcast Now!
            </button>
          </form>

          <div className="flex flex-col items-center justify-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-3 mb-8">Live Device Preview</h4>
            <div className="relative w-[320px] h-[640px] bg-base rounded-[3rem] border-[8px] border-glass-border shadow-2xl p-6 flex flex-col items-center overflow-hidden">
               <div className="absolute top-0 w-32 h-6 bg-surface rounded-b-2xl z-20" />
               <div className="w-full pt-12 space-y-4 relative z-10">
                  <div className="p-4 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-3xl shadow-2xl animate-in slide-in-from-top duration-700">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-text-1 font-black text-[10px]">CWC+</div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-text-1 leading-tight">CWC+ SYSTEM</p>
                           <p className="text-[8px] font-bold text-text-3 uppercase tracking-tighter">Intelligence Alert • Just Now</p>
                        </div>
                     </div>
                     <p className="text-xs font-black text-text-1 mb-1">{broadcastForm.title || "Alert Title Placeholder"}</p>
                     <p className="text-[10px] font-medium text-text-2 line-clamp-2">{broadcastForm.message || "Your alert message will appear here precisely as formatted."}</p>
                  </div>
               </div>
               <div className="mt-auto mb-8 w-1/2 h-1 bg-glass-border rounded-full" />
               <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h3 className="text-2xl md:text-3xl font-black mb-4 flex items-center gap-3"><Clock size={32} className="text-accent" /> History & Scheduled</h3>
        <div className="bg-surface border-2 border-glass-border rounded-[32px] overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-glass-border max-h-[500px] overflow-y-auto custom-scrollbar">
            {adminBroadcasts.map(b => {
              const isDraft = b.scheduled_post_date && new Date(b.scheduled_post_date) > new Date();
              return (
                <div key={b.id} className={`p-6 hover:bg-elevated transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-black text-lg text-text-1 truncate">{b.title}</h5>
                      {isDraft ? (
                        <span className="px-2 py-1 bg-warning/20 text-warning text-[10px] font-black uppercase rounded border border-warning/30 flex items-center gap-1"><Clock size={12} /> Scheduled</span>
                      ) : (
                        <span className="px-2 py-1 bg-accent/20 text-accent text-[10px] font-black uppercase rounded border border-accent/30 flex items-center gap-1"><CheckCircle2 size={12} /> Sent</span>
                      )}
                    </div>
                    <p className="text-text-2 font-medium text-sm line-clamp-2">{b.message}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-bold text-text-3">
                      <span>Created: {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => requestDelete('broadcasts', b.id, b.title)} className="w-12 h-12 bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"><Trash2 size={20} /></button>
                </div>
              )
            })}
            {adminBroadcasts.length === 0 && (
              <div className="p-10 text-center text-text-3 font-bold">No broadcasts yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
