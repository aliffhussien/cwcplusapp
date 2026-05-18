import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Settings, DollarSign, BookOpen, 
  Save, Palette, ShieldCheck, Puzzle
} from 'lucide-react';
import { GeneralTab, BrandTab, PricingTab, VolumesTab, AutomationTab } from './PlatformSettingsPanels';

interface PlatformSettingsProps {
  settings: any;
  updateSettings: (data: any) => Promise<void>;
  generateApiKey: () => void;
  removeApiKey: (id: number) => Promise<void>;
  showToast: (msg: string, type?: string) => void;
}

export default function PlatformSettings({ 
  settings, 
  updateSettings, 
  generateApiKey, 
  removeApiKey,
  showToast 
}: PlatformSettingsProps) {
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
              <Settings size={32} className="text-text-1" />
           </div>
           <div>
             <h3 className="text-4xl font-black text-text-1 uppercase tracking-tighter italic leading-none">Engine Configuration</h3>
             <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.5em] mt-3 ml-1">Platform Rules & Core Design System</p>
           </div>
        </div>
        <button onClick={handleSave} className="h-14 px-12 bg-accent hover:bg-accent/80 text-text-1 font-black rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-4 text-sm uppercase tracking-widest active:scale-95 transition-all group">
          <Save size={22} className="group-hover:rotate-12 transition-transform" /> Commit Core Changes
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-base/80 border border-glass-border rounded-[2.5rem] w-fit backdrop-blur-3xl shadow-2xl">
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
            className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-accent text-text-1 shadow-xl shadow-accent/20' : 'text-text-3 hover:text-text-2'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && <GeneralTab settings={settings} updateSettings={updateSettings} />}
          {activeTab === 'brand' && <BrandTab settings={settings} updateSettings={updateSettings} />}
          {activeTab === 'pricing' && <PricingTab settings={settings} updateSettings={updateSettings} />}
          {activeTab === 'volumes' && <VolumesTab settings={settings} updateSettings={updateSettings} />}
          {activeTab === 'automation' && <AutomationTab settings={settings} updateSettings={updateSettings} generateApiKey={generateApiKey} removeApiKey={removeApiKey} showToast={showToast} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
