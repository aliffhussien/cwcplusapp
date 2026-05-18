import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Layout, DollarSign, BookOpen, 
  Save, CheckCircle2, Puzzle, Key, Trash2, Link2,
  Image as ImageIcon, Palette, Globe, Plus, Minus,
  Smartphone, CreditCard, ShieldCheck
} from 'lucide-react';
import { AVAILABLE_PLUGINS } from '../../../lib/constants';

export default function PlatformSettings({ 
  settings, 
  updateSettings, 
  generateApiKey, 
  removeApiKey,
  showToast 
}) {
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    await updateSettings(settings);
    showToast("System Configuration Saved! 🚀");
  };

  return (
    <div className="space-y-10 pb-40 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-accent rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <Settings size={32} className="text-white" />
           </div>
           <div>
             <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Engine Configuration</h3>
             <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-3 ml-1">Platform Rules & Core Design System</p>
           </div>
        </div>
        <button onClick={handleSave} className="h-14 px-12 bg-accent hover:bg-accent-sec text-white font-black rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-4 text-sm uppercase tracking-widest active:scale-95 transition-all group">
          <Save size={22} className="group-hover:rotate-12 transition-transform" /> Commit Core Changes
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-slate-900/80 border border-white/10 rounded-[2.5rem] w-fit backdrop-blur-3xl shadow-2xl">
        {[
          { id: 'general', label: 'Identity', icon: ShieldCheck },
          { id: 'brand', label: 'Brand Kit', icon: Palette },
          { id: 'pricing', label: 'Pricing Protocols', icon: DollarSign },
          { id: 'volumes', label: 'Library Collections', icon: BookOpen },
          { id: 'automation', label: 'Intelligence Sync', icon: Puzzle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.div key="general" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-10 rounded-[3.5rem] bg-[#0F172A]/50 border border-white/5 space-y-8 shadow-2xl">
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3"><Globe size={16} className="text-accent" /> Platform Identity</h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Entity Name</label>
                    <input type="text" value={settings.siteName} onChange={e => updateSettings({ ...settings, siteName: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-xl font-black text-white focus:border-accent outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Support Contact (Email)</label>
                    <input type="text" value={settings.supportEmail || ''} onChange={e => updateSettings({ ...settings, supportEmail: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-bold text-white focus:border-accent outline-none" />
                  </div>
                </div>
              </div>

              <div className="p-10 rounded-[3.5rem] bg-[#0F172A]/50 border border-white/5 space-y-8 shadow-2xl">
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3"><ShieldCheck size={16} className="text-violet-500" /> System Protocols</h4>
                <div className="space-y-4">
                   {[
                     { id: 'maintenanceMode', label: 'Protocol: Maintenance Mode', desc: 'Seal the platform for deep maintenance.' },
                     { id: 'allowSignups', label: 'Protocol: Open Enrollment', desc: 'Allow new personnel to register identities.' },
                     { id: 'debugLogs', label: 'Protocol: Verbose Intelligence', desc: 'Record detailed technical telemetry.' }
                   ].map(pro => (
                     <div key={pro.id} className="flex items-center justify-between p-6 bg-slate-950 rounded-[2rem] border border-white/5">
                        <div className="space-y-1">
                           <p className="text-sm font-black text-white">{pro.label}</p>
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{pro.desc}</p>
                        </div>
                        <button onClick={() => updateSettings({ ...settings, [pro.id]: !settings[pro.id] })} className={`w-12 h-6 rounded-full relative transition-all border flex-shrink-0 ${settings[pro.id] ? 'bg-accent border-accent' : 'bg-slate-900 border-slate-700'}`}>
                          <motion.div animate={{ x: settings[pro.id] ? 22 : 2 }} className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-lg" />
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'brand' && (
            <motion.div key="brand" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="p-10 rounded-[3.5rem] bg-[#0F172A]/50 border border-white/5 space-y-8 shadow-2xl">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3"><ImageIcon size={16} className="text-accent" /> Visual Assets</h4>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Primary Platform Logo (URL)</label>
                        <input type="text" value={settings.logoUrl || ''} onChange={e => updateSettings({ ...settings, logoUrl: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm font-bold text-white focus:border-accent outline-none" placeholder="https://..." />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Global Accent Color</label>
                        <div className="flex gap-4">
                           <div className="flex-1 relative group">
                              <input type="text" value={settings.accentColor || '#10b981'} onChange={e => updateSettings({ ...settings, accentColor: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-lg font-black text-white focus:border-accent outline-none" />
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/10 pointer-events-none" style={{ backgroundColor: settings.accentColor || '#10b981' }} />
                           </div>
                           <div className="relative overflow-hidden w-20 h-[68px] rounded-3xl border-2 border-slate-800 shadow-xl cursor-pointer hover:border-accent transition-all group">
                              <input type="color" value={settings.accentColor || '#10b981'} onChange={e => updateSettings({ ...settings, accentColor: e.target.value })} className="absolute inset-0 scale-[3] cursor-pointer opacity-0" />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-900 group-hover:bg-slate-800 transition-colors">
                                 <Palette size={24} className="text-white" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="p-10 rounded-[3.5rem] bg-[#0F172A]/50 border border-white/5 space-y-8 shadow-2xl">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3"><Palette size={16} className="text-violet-500" /> Aesthetics</h4>
                  <div className="space-y-4">
                     {[
                        { id: 'dark_mode_forced', label: 'Forced Obsidian Vision', desc: 'Enforce high-contrast dark mode globally.' },
                        { id: 'glassmorphism_enabled', label: 'Hyper-Translucency', desc: 'Enable advanced backdrop-blur effects.' },
                        { id: 'haptic_feedback', label: 'Sensory Orchestration', desc: 'Enable haptic feedback on interactive elements.' }
                     ].map(aes => (
                        <div key={aes.id} className="flex items-center justify-between p-6 bg-slate-950 rounded-[2rem] border border-white/5">
                           <div className="space-y-1">
                              <p className="text-sm font-black text-white">{aes.label}</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{aes.desc}</p>
                           </div>
                           <button onClick={() => updateSettings({ ...settings, branding: { ...(settings.branding || {}), [aes.id]: !settings.branding?.[aes.id] } })} className={`w-12 h-6 rounded-full relative transition-all border flex-shrink-0 ${settings.branding?.[aes.id] ? 'bg-violet-600 border-violet-500' : 'bg-slate-900 border-slate-700'}`}>
                             <motion.div animate={{ x: settings.branding?.[aes.id] ? 22 : 2 }} className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-lg" />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'pricing' && (
            <motion.div key="pricing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
               <div className="p-10 rounded-[3.5rem] bg-[#0F172A]/50 border border-white/5 space-y-10 shadow-2xl">
                  <div className="flex items-center justify-between px-4">
                     <h4 className="text-2xl font-black text-white flex items-center gap-4 uppercase tracking-tighter italic"><DollarSign className="text-accent" /> Premium Access Protocols</h4>
                     <button onClick={() => updateSettings({ ...settings, premiumTiers: [...(settings.premiumTiers || []), { id: Date.now(), name: 'New Tier', price: '19.99', features: [], color: '#10b981' }] })} className="h-12 px-8 bg-accent text-white font-black rounded-2xl flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-accent/20 transition-all hover:scale-105"><Plus size={18} /> New Protocol</button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {(settings.premiumTiers || []).map((tier, i) => (
                        <div key={tier.id} className="bg-slate-950 p-8 rounded-[3rem] border border-white/10 group hover:border-accent/30 transition-all shadow-2xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck size={80} /></div>
                           <div className="flex items-center gap-6 mb-8 relative z-10">
                              <div className="w-14 h-14 rounded-2xl border-2 border-white/10 flex items-center justify-center shadow-xl" style={{ backgroundColor: tier.color + '20', borderColor: tier.color + '40' }}>
                                 <DollarSign size={24} style={{ color: tier.color }} />
                              </div>
                              <div className="flex-1">
                                 <input type="text" value={tier.name} onChange={e => { const n = [...settings.premiumTiers]; n[i].name = e.target.value; updateSettings({ ...settings, premiumTiers: n }); }} className="bg-transparent border-none text-2xl font-black text-white outline-none w-full mb-1" placeholder="Tier Name" />
                                 <input type="text" value={tier.price} onChange={e => { const n = [...settings.premiumTiers]; n[i].price = e.target.value; updateSettings({ ...settings, premiumTiers: n }); }} className="bg-transparent border-none text-xs font-black text-slate-500 uppercase tracking-[0.3em] outline-none w-full" placeholder="Price (e.g. 19.99)" />
                              </div>
                              <button onClick={() => updateSettings({ ...settings, premiumTiers: settings.premiumTiers.filter(t => t.id !== tier.id) })} className="w-12 h-12 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-all"><Trash2 size={20} /></button>
                           </div>
                           <div className="space-y-4 relative z-10">
                              <div className="flex gap-4">
                                 <div className="flex-1 relative">
                                    <input type="text" value={tier.color || '#10b981'} onChange={e => { const n = [...settings.premiumTiers]; n[i].color = e.target.value; updateSettings({ ...settings, premiumTiers: n }); }} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black text-white outline-none focus:border-accent" placeholder="Accent Hex" />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-white/10 pointer-events-none" style={{ backgroundColor: tier.color || '#10b981' }} />
                                 </div>
                                 <div className="relative w-14 h-14 rounded-2xl border border-white/10 overflow-hidden cursor-pointer group">
                                    <input type="color" value={tier.color || '#10b981'} onChange={e => { const n = [...settings.premiumTiers]; n[i].color = e.target.value; updateSettings({ ...settings, premiumTiers: n }); }} className="absolute inset-0 scale-[3] cursor-pointer opacity-0" />
                                    <div className="absolute inset-0 pointer-events-none bg-slate-800 flex items-center justify-center">
                                       <Palette size={20} className="text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'volumes' && (
            <motion.div key="volumes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
               <div className="p-10 rounded-[3.5rem] bg-[#0F172A]/50 border border-white/5 space-y-10 shadow-2xl">
                  <div className="flex items-center justify-between px-4">
                     <h4 className="text-2xl font-black text-white flex items-center gap-4 uppercase tracking-tighter italic"><BookOpen className="text-accent" /> Library Collection Meta</h4>
                     <button onClick={() => updateSettings({ ...settings, volumes: [...(settings.volumes || []), { id: Date.now(), name: 'Volume X', description: 'Fresh culinary intelligence.' }] })} className="h-12 px-8 bg-accent text-white font-black rounded-2xl flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-accent/20 transition-all hover:scale-105"><Plus size={18} /> New Collection</button>
                  </div>

                  <div className="space-y-4">
                     {(settings.volumes || []).map((vol, i) => (
                        <div key={vol.id} className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-8 group hover:border-accent/30 transition-all">
                           <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400 group-hover:text-accent group-hover:bg-accent/10 transition-all">{vol.name?.[0] || 'V'}</div>
                           <div className="flex-1">
                              <input type="text" value={vol.name} onChange={e => { const n = [...settings.volumes]; n[i].name = e.target.value; updateSettings({ ...settings, volumes: n }); }} className="bg-transparent border-none text-xl font-black text-white outline-none w-full mb-1" placeholder="Volume Name" />
                              <input type="text" value={vol.description} onChange={e => { const n = [...settings.volumes]; n[i].description = e.target.value; updateSettings({ ...settings, volumes: n }); }} className="bg-transparent border-none text-[10px] font-black text-slate-500 uppercase tracking-widest outline-none w-full" placeholder="Collection Description" />
                           </div>
                           <button onClick={() => updateSettings({ ...settings, volumes: settings.volumes.filter(v => v.id !== vol.id) })} className="w-12 h-12 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'automation' && (
            <motion.div key="automation" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="p-10 rounded-[3.5rem] bg-[#0F172A]/50 border border-white/5 space-y-10 shadow-2xl">
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3"><Puzzle size={16} className="text-accent" /> Intelligence Integrations</h4>
                <div className="space-y-3">
                  {AVAILABLE_PLUGINS.map(plug => (
                    <div key={plug.id} className={`p-6 rounded-[2rem] border-2 flex items-center justify-between gap-6 transition-all ${settings.plugins?.[plug.id] ? 'bg-accent/5 border-accent/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-slate-950/50 border-white/5 hover:border-white/10'}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${settings.plugins?.[plug.id] ? 'bg-accent text-white border-accent' : 'bg-slate-900 border-slate-800'}`}>
                        <plug.icon size={22} className={!settings.plugins?.[plug.id] ? plug.color : ''} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-lg font-black text-white leading-tight">{plug.name}</h5>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest truncate">{plug.desc}</p>
                      </div>
                      <button onClick={() => {
                        const n = { ...(settings.plugins || {}), [plug.id]: !settings.plugins?.[plug.id] };
                        updateSettings({ ...settings, plugins: n });
                        showToast(n[plug.id] ? `${plug.name} Synced!` : `${plug.name} Detached`);
                      }} className={`w-14 h-7 rounded-full relative transition-all border-2 flex-shrink-0 ${settings.plugins?.[plug.id] ? 'bg-accent border-accent' : 'bg-slate-900 border-slate-800'}`}>
                        <motion.div animate={{ x: settings.plugins?.[plug.id] ? 28 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-xl" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 rounded-[3.5rem] bg-[#0F172A]/50 border border-white/5 space-y-10 shadow-2xl flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3"><Key size={16} className="text-accent" /> API Gateway Keys</h4>
                   <button onClick={generateApiKey} className="h-10 px-6 bg-accent hover:bg-accent-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg">Provision New Key</button>
                 </div>
                 <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-4">
                   {(settings.apiKeys || []).map(k => (
                     <div key={k.id} className="p-6 bg-slate-950 rounded-[2rem] border border-white/10 group hover:border-accent/30 transition-all flex items-center justify-between gap-6 shadow-xl">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-accent transition-colors"><Link2 size={20} /></div>
                        <div className="flex-1 min-w-0">
                           <h5 className="text-sm font-black text-white truncate">{k.name}</h5>
                           <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">{k.key.substring(0, 8)}••••••••••••</p>
                        </div>
                        <button onClick={() => removeApiKey(k.id)} className="w-10 h-10 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all"><Trash2 size={16} /></button>
                     </div>
                   ))}
                   {(settings.apiKeys || []).length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                        <Key size={40} className="text-slate-800 mb-4" />
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No keys provisioned</p>
                     </div>
                   )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
