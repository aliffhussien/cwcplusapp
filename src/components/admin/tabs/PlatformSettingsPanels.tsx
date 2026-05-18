import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ShieldCheck, Image as ImageIcon, Palette, DollarSign, Plus, Trash2, BookOpen, Puzzle, Key, Link2 } from 'lucide-react';
import { AVAILABLE_PLUGINS } from '../../../lib/constants';

export const GeneralTab = ({ settings, updateSettings }: any) => (
  <motion.div key="general" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
    <div className="p-10 rounded-[3.5rem] bg-glass-bg border border-glass-border space-y-8 shadow-2xl">
      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-3 flex items-center gap-3"><Globe size={16} className="text-accent" /> Platform Identity</h4>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-text-3 ml-4">Entity Name</label>
          <input type="text" value={settings.siteName} onChange={e => updateSettings({ ...settings, siteName: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-xl font-black text-text-1 focus:border-accent outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-text-3 ml-4">Support Contact (Email)</label>
          <input type="text" value={settings.supportEmail || ''} onChange={e => updateSettings({ ...settings, supportEmail: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-bold text-text-1 focus:border-accent outline-none" />
        </div>
      </div>
    </div>
    <div className="p-10 rounded-[3.5rem] bg-glass-bg border border-glass-border space-y-8 shadow-2xl">
      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-3 flex items-center gap-3"><ShieldCheck size={16} className="text-accent" /> System Protocols</h4>
      <div className="space-y-4">
          {[
            { id: 'maintenanceMode', label: 'Protocol: Maintenance Mode', desc: 'Seal the platform for deep maintenance.' },
            { id: 'allowSignups', label: 'Protocol: Open Enrollment', desc: 'Allow new personnel to register identities.' },
            { id: 'debugLogs', label: 'Protocol: Verbose Intelligence', desc: 'Record detailed technical telemetry.' }
          ].map(pro => (
            <div key={pro.id} className="flex items-center justify-between p-6 bg-surface rounded-[2rem] border border-glass-border">
              <div className="space-y-1">
                  <p className="text-sm font-black text-text-1">{pro.label}</p>
                  <p className="text-[9px] text-text-3 font-bold uppercase tracking-widest">{pro.desc}</p>
              </div>
              <button onClick={() => updateSettings({ ...settings, [pro.id]: !settings[pro.id] })} className={`w-12 h-6 rounded-full relative transition-all border flex-shrink-0 ${settings[pro.id] ? 'bg-accent border-accent' : 'bg-base border-glass-border'}`}>
                <motion.div animate={{ x: settings[pro.id] ? 22 : 2 }} className="w-4 h-4 bg-text-1 rounded-full absolute top-0.5 shadow-lg" />
              </button>
            </div>
          ))}
      </div>
    </div>
  </motion.div>
);

export const BrandTab = ({ settings, updateSettings }: any) => (
  <motion.div key="brand" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="p-10 rounded-[3.5rem] bg-glass-bg border border-glass-border space-y-8 shadow-2xl">
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-3 flex items-center gap-3"><ImageIcon size={16} className="text-accent" /> Visual Assets</h4>
        <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-3 ml-4">Primary Platform Logo (URL)</label>
              <input type="text" value={settings.logoUrl || ''} onChange={e => updateSettings({ ...settings, logoUrl: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-sm font-bold text-text-1 focus:border-accent outline-none" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-text-3 ml-4">Global Accent Color</label>
              <div className="flex gap-4">
                  <div className="flex-1 relative group">
                    <input type="text" value={settings.accentColor || '#10b981'} onChange={e => updateSettings({ ...settings, accentColor: e.target.value })} className="w-full bg-surface border-2 border-glass-border rounded-3xl px-8 py-5 text-lg font-black text-text-1 focus:border-accent outline-none" />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-glass-border pointer-events-none" style={{ backgroundColor: settings.accentColor || '#10b981' }} />
                  </div>
                  <div className="relative overflow-hidden w-20 h-[68px] rounded-3xl border-2 border-glass-border shadow-xl cursor-pointer hover:border-accent transition-all group">
                    <input type="color" value={settings.accentColor || '#10b981'} onChange={e => updateSettings({ ...settings, accentColor: e.target.value })} className="absolute inset-0 scale-[3] cursor-pointer opacity-0" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-base group-hover:bg-elevated transition-colors">
                        <Palette size={24} className="text-text-1" />
                    </div>
                  </div>
              </div>
            </div>
        </div>
      </div>
      <div className="p-10 rounded-[3.5rem] bg-glass-bg border border-glass-border space-y-8 shadow-2xl">
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-3 flex items-center gap-3"><Palette size={16} className="text-accent" /> Aesthetics</h4>
        <div className="space-y-4">
            {[
              { id: 'dark_mode_forced', label: 'Forced Obsidian Vision', desc: 'Enforce high-contrast dark mode globally.' },
              { id: 'glassmorphism_enabled', label: 'Hyper-Translucency', desc: 'Enable advanced backdrop-blur effects.' },
              { id: 'haptic_feedback', label: 'Sensory Orchestration', desc: 'Enable haptic feedback on interactive elements.' }
            ].map(aes => (
              <div key={aes.id} className="flex items-center justify-between p-6 bg-surface rounded-[2rem] border border-glass-border">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-text-1">{aes.label}</p>
                    <p className="text-[9px] text-text-3 font-bold uppercase tracking-widest">{aes.desc}</p>
                  </div>
                  <button onClick={() => updateSettings({ ...settings, branding: { ...(settings.branding || {}), [aes.id]: !settings.branding?.[aes.id] } })} className={`w-12 h-6 rounded-full relative transition-all border flex-shrink-0 ${settings.branding?.[aes.id] ? 'bg-accent border-accent' : 'bg-base border-glass-border'}`}>
                    <motion.div animate={{ x: settings.branding?.[aes.id] ? 22 : 2 }} className="w-4 h-4 bg-text-1 rounded-full absolute top-0.5 shadow-lg" />
                  </button>
              </div>
            ))}
        </div>
      </div>
  </motion.div>
);

export const PricingTab = ({ settings, updateSettings }: any) => (
  <motion.div key="pricing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
      <div className="p-10 rounded-[3.5rem] bg-glass-bg border border-glass-border space-y-10 shadow-2xl">
        <div className="flex items-center justify-between px-4">
            <h4 className="text-2xl font-black text-text-1 flex items-center gap-4 uppercase tracking-tighter italic"><DollarSign className="text-accent" /> Premium Access Protocols</h4>
            <button onClick={() => updateSettings({ ...settings, premiumTiers: [...(settings.premiumTiers || []), { id: Date.now(), name: 'New Tier', price: '19.99', features: [], color: '#10b981' }] })} className="h-12 px-8 bg-accent text-text-1 font-black rounded-2xl flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-accent/20 transition-all hover:scale-105"><Plus size={18} /> New Protocol</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(settings.premiumTiers || []).map((tier: any, i: number) => (
              <div key={tier.id} className="bg-surface p-8 rounded-[3rem] border border-glass-border group hover:border-accent/30 transition-all shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck size={80} className="text-text-1" /></div>
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl border-2 border-glass-border flex items-center justify-center shadow-xl" style={{ backgroundColor: tier.color + '20', borderColor: tier.color + '40' }}>
                        <DollarSign size={24} style={{ color: tier.color }} />
                    </div>
                    <div className="flex-1">
                        <input type="text" value={tier.name} onChange={e => { const n = [...settings.premiumTiers]; n[i].name = e.target.value; updateSettings({ ...settings, premiumTiers: n }); }} className="bg-transparent border-none text-2xl font-black text-text-1 outline-none w-full mb-1" placeholder="Tier Name" />
                        <input type="text" value={tier.price} onChange={e => { const n = [...settings.premiumTiers]; n[i].price = e.target.value; updateSettings({ ...settings, premiumTiers: n }); }} className="bg-transparent border-none text-xs font-black text-text-3 uppercase tracking-[0.3em] outline-none w-full" placeholder="Price (e.g. 19.99)" />
                    </div>
                    <button onClick={() => updateSettings({ ...settings, premiumTiers: settings.premiumTiers.filter((t: any) => t.id !== tier.id) })} className="w-12 h-12 bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-full flex items-center justify-center transition-all"><Trash2 size={20} /></button>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <input type="text" value={tier.color || '#10b981'} onChange={e => { const n = [...settings.premiumTiers]; n[i].color = e.target.value; updateSettings({ ...settings, premiumTiers: n }); }} className="w-full bg-base border border-glass-border rounded-2xl px-6 py-4 text-xs font-black text-text-1 outline-none focus:border-accent" placeholder="Accent Hex" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-glass-border pointer-events-none" style={{ backgroundColor: tier.color || '#10b981' }} />
                        </div>
                        <div className="relative w-14 h-14 rounded-2xl border border-glass-border overflow-hidden cursor-pointer group">
                          <input type="color" value={tier.color || '#10b981'} onChange={e => { const n = [...settings.premiumTiers]; n[i].color = e.target.value; updateSettings({ ...settings, premiumTiers: n }); }} className="absolute inset-0 scale-[3] cursor-pointer opacity-0" />
                          <div className="absolute inset-0 pointer-events-none bg-elevated flex items-center justify-center">
                              <Palette size={20} className="text-text-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                    </div>
                  </div>
              </div>
            ))}
        </div>
      </div>
  </motion.div>
);

export const VolumesTab = ({ settings, updateSettings }: any) => (
  <motion.div key="volumes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
      <div className="p-10 rounded-[3.5rem] bg-glass-bg border border-glass-border space-y-10 shadow-2xl">
        <div className="flex items-center justify-between px-4">
            <h4 className="text-2xl font-black text-text-1 flex items-center gap-4 uppercase tracking-tighter italic"><BookOpen className="text-accent" /> Library Collection Meta</h4>
            <button onClick={() => updateSettings({ ...settings, volumes: [...(settings.volumes || []), { id: Date.now(), name: 'Volume X', description: 'Fresh culinary intelligence.' }] })} className="h-12 px-8 bg-accent text-text-1 font-black rounded-2xl flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-accent/20 transition-all hover:scale-105"><Plus size={18} /> New Collection</button>
        </div>
        <div className="space-y-4">
            {(settings.volumes || []).map((vol: any, i: number) => (
              <div key={vol.id} className="bg-surface p-6 rounded-[2.5rem] border border-glass-border flex items-center gap-8 group hover:border-accent/30 transition-all">
                  <div className="w-16 h-16 bg-glass-bg rounded-2xl flex items-center justify-center font-black text-xl text-text-3 group-hover:text-accent group-hover:bg-accent/10 transition-all">{vol.name?.[0] || 'V'}</div>
                  <div className="flex-1">
                    <input type="text" value={vol.name} onChange={e => { const n = [...settings.volumes]; n[i].name = e.target.value; updateSettings({ ...settings, volumes: n }); }} className="bg-transparent border-none text-xl font-black text-text-1 outline-none w-full mb-1" placeholder="Volume Name" />
                    <input type="text" value={vol.description} onChange={e => { const n = [...settings.volumes]; n[i].description = e.target.value; updateSettings({ ...settings, volumes: n }); }} className="bg-transparent border-none text-[10px] font-black text-text-3 uppercase tracking-widest outline-none w-full" placeholder="Collection Description" />
                  </div>
                  <button onClick={() => updateSettings({ ...settings, volumes: settings.volumes.filter((v: any) => v.id !== vol.id) })} className="w-12 h-12 bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
              </div>
            ))}
        </div>
      </div>
  </motion.div>
);

export const AutomationTab = ({ settings, updateSettings, showToast, generateApiKey, removeApiKey }: any) => (
  <motion.div key="automation" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
    <div className="p-10 rounded-[3.5rem] bg-glass-bg border border-glass-border space-y-10 shadow-2xl">
      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-3 flex items-center gap-3"><Puzzle size={16} className="text-accent" /> Intelligence Integrations</h4>
      <div className="space-y-3">
        {AVAILABLE_PLUGINS.map(plug => (
          <div key={plug.id} className={`p-6 rounded-[2rem] border-2 flex items-center justify-between gap-6 transition-all ${settings.plugins?.[plug.id] ? 'bg-accent/5 border-accent/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-surface/50 border-glass-border hover:border-glass-border/80'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${settings.plugins?.[plug.id] ? 'bg-accent text-text-1 border-accent' : 'bg-base border-glass-border'}`}>
              <plug.icon size={22} className={!settings.plugins?.[plug.id] ? plug.color : 'text-text-1'} />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-lg font-black text-text-1 leading-tight">{plug.name}</h5>
              <p className="text-[10px] text-text-3 font-bold mt-1 uppercase tracking-widest truncate">{plug.desc}</p>
            </div>
            <button onClick={() => {
              const n = { ...(settings.plugins || {}), [plug.id]: !settings.plugins?.[plug.id] };
              updateSettings({ ...settings, plugins: n });
              showToast(n[plug.id] ? `${plug.name} Synced!` : `${plug.name} Detached`);
            }} className={`w-14 h-7 rounded-full relative transition-all border-2 flex-shrink-0 ${settings.plugins?.[plug.id] ? 'bg-accent border-accent' : 'bg-base border-glass-border'}`}>
              <motion.div animate={{ x: settings.plugins?.[plug.id] ? 28 : 2 }} className="w-5 h-5 bg-text-1 rounded-full absolute top-0.5 shadow-xl" />
            </button>
          </div>
        ))}
      </div>
    </div>
    <div className="p-10 rounded-[3.5rem] bg-glass-bg border border-glass-border space-y-10 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-3 flex items-center gap-3"><Key size={16} className="text-accent" /> API Gateway Keys</h4>
          <button onClick={generateApiKey} className="h-10 px-6 bg-accent hover:bg-accent/80 text-text-1 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg">Provision New Key</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-4">
          {(settings.apiKeys || []).map((k: any) => (
            <div key={k.id} className="p-6 bg-surface rounded-[2rem] border border-glass-border group hover:border-accent/30 transition-all flex items-center justify-between gap-6 shadow-xl">
              <div className="w-12 h-12 bg-glass-bg rounded-2xl flex items-center justify-center text-text-3 group-hover:text-accent transition-colors"><Link2 size={20} /></div>
              <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-black text-text-1 truncate">{k.name}</h5>
                  <p className="text-[10px] font-mono text-text-3 mt-1 uppercase tracking-widest">{k.key.substring(0, 8)}••••••••••••</p>
              </div>
              <button onClick={() => removeApiKey(k.id)} className="w-10 h-10 bg-danger/10 text-danger hover:bg-danger hover:text-text-1 rounded-xl flex items-center justify-center transition-all"><Trash2 size={16} /></button>
            </div>
          ))}
          {(settings.apiKeys || []).length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-glass-bg rounded-[2rem] border border-dashed border-glass-border">
              <Key size={40} className="text-text-2 mb-4" />
              <p className="text-xs font-black text-text-2 uppercase tracking-widest">No keys provisioned</p>
            </div>
          )}
        </div>
    </div>
  </motion.div>
);
