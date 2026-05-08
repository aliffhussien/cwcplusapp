import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ChefHat, Settings, Plus, Save, Image as ImageIcon, 
  DollarSign, Trash2, Edit3, X, Video, Users, UserPlus, 
  Search, Star, Clock, Flame, CreditCard, Mail, Zap, Puzzle, Key, Link2, Wand2,
  Package, ShoppingBag, Eye, EyeOff, PlayCircle, ShieldAlert, Book, Bell, Send, CheckCircle2, Lock, Unlock
} from 'lucide-react';

import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';
import { useAllUsers } from '../hooks/useAllUsers';
import { useAppSettings } from '../hooks/useAppSettings';
import { useUser } from '../hooks/useUser';
import { useMerch } from '../hooks/useMerch';
import { supabase } from '../lib/supabase';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import OrdersManager from '../components/admin/OrdersManager';
import ContentCurator from '../components/admin/ContentCurator';
import { TrendingUp, GripVertical } from 'lucide-react';

const ImageUploader = ({ value, onChange, label = "Image (JPG, PNG, SVG)" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('public-assets').upload(filePath, file);
    if (uploadError) {
      alert('Error uploading file! Check if RLS policies and bucket exist.');
      setIsUploading(false);
      return;
    }
    const { data } = supabase.storage.from('public-assets').getPublicUrl(filePath);
    onChange(data.publicUrl);
    setIsUploading(false);
  };
  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-black uppercase text-slate-500 ml-2">{label}</label>
      <div className="flex gap-4 items-center">
        {value && (
           <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900">
              {value.includes('.mp4') ? <video src={value} className="w-full h-full object-cover" /> : <img src={value} className="w-full h-full object-cover" />}
           </div>
        )}
        <div className="flex-1 relative">
          <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-sm md:text-lg font-bold outline-none text-white pr-[140px]" placeholder="https://... or click upload ->" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
             <label className="cursor-pointer bg-slate-800 hover:bg-indigo-600 text-white text-xs font-black uppercase px-4 py-3 rounded-full transition-colors inline-block shadow-lg whitespace-nowrap">
                {isUploading ? 'Uploading...' : 'Upload File'}
                <input type="file" accept="image/*,video/mp4,image/svg+xml" className="hidden" onChange={handleUpload} disabled={isUploading} />
             </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const AVAILABLE_PLUGINS = [
  { id: 'hitpay', name: 'HitPay Gateway', icon: CreditCard, desc: 'Process payments via PayNow, Cards, & FPX.', color: 'text-rose-400' },
  { id: 'mailchimp', name: 'Mailchimp Sync', icon: Mail, desc: 'Auto-sync new members to mailing lists.', color: 'text-yellow-400' },
  { id: 'zapier', name: 'Zapier Webhooks', icon: Zap, desc: 'Connect platform events to 5,000+ apps.', color: 'text-orange-500' }
];

const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 border-2 backdrop-blur-2xl ${
      type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-rose-500/20 border-rose-500/50 text-rose-100'
    }`}
  >
    <div className={`p-2 rounded-full ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
      {type === 'success' ? <span className="font-bold">✓</span> : <span className="font-bold">!</span>}
    </div>
    <span className="font-extrabold text-lg tracking-wide">{message}</span>
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={20}/></button>
  </motion.div>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onCancel} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700/50 rounded-[40px] p-8 md:p-10 shadow-2xl text-center">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
            <Trash2 size={40} />
          </div>
          <h3 className="text-3xl font-black text-white mb-4">{title}</h3>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onCancel} className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-3xl font-black text-lg transition-colors">Go Back</button>
            <button onClick={onConfirm} className="flex-1 px-6 py-4 bg-rose-500 hover:bg-rose-400 text-white rounded-3xl font-black text-lg transition-all shadow-[0_0_40px_rgba(244,63,94,0.4)]">Yes, Trash It</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const GenericConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", confirmColor = "bg-rose-500 hover:bg-rose-400", icon: Icon = Trash2, iconColor = "text-rose-500", iconBg = "bg-rose-500/20" }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onCancel} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700/50 rounded-[40px] p-8 md:p-10 shadow-2xl text-center">
          <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center ${iconColor} mx-auto mb-6`}>
            <Icon size={40} />
          </div>
          <h3 className="text-3xl font-black text-white mb-4">{title}</h3>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onCancel} className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-3xl font-black text-lg transition-colors">Go Back</button>
            <button onClick={onConfirm} className={`flex-1 px-6 py-4 ${confirmColor} text-white rounded-3xl font-black text-lg transition-all shadow-xl`}>{confirmText}</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function Admin() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { classes, addClass, updateClass, deleteClass } = useClasses();
  const { users: people, addUser, removeUser, updateUserTier, updateUser } = useAllUsers();
  const { settings, updateSettings } = useAppSettings();
  const { merch, addProduct, updateProduct, deleteProduct } = useMerch();

  const [isCreating, setIsCreating] = useState(false);
  const [recipeForm, setRecipeForm] = useState({ title: '', author: '', time: '', image: '', video: '', category: 'Mains', difficulty: 'Beginner', baseServings: 2, ingredients: [{name: '', amount: ''}], steps: [''], notes: '', status: 'published', isFeatured: false, volume: 'CWC Original', scheduled_post_date: '' });
  const [classForm, setClassForm] = useState({ title: '', instructor: '', duration: '', price: '15.00', image: '', video: '', status: 'published', isFeatured: false, tierRequired: settings.premiumTiers?.[0]?.name || 'Premium', ingredients: [{name: '', amount: ''}], steps: [''], notes: '', attachments: [], scheduled_post_date: '', live_date: '' });
  const [merchForm, setMerchForm] = useState({ title: '', price: '', image: '', description: '', status: 'published', stock: 10, scheduled_post_date: '' });
  const [personForm, setPersonForm] = useState({ id: null, name: '', email: '', subscriptionTier: 'Free', role: 'user', unlockedVolumes: [], unlockedClasses: [] });
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'system', attachmentType: 'none', attachmentId: '', scheduled_post_date: '' });
  const [stagingData, setStagingData] = useState({ type: null, items: [] });
  const [rawText, setRawText] = useState("");
  const [deleteContext, setDeleteContext] = useState({ isOpen: false, coll: '', id: '', title: '' });
  const [unlockContext, setUnlockContext] = useState({ isOpen: false, itemType: '', itemId: '', itemName: '', action: '' });
  const [adminBroadcasts, setAdminBroadcasts] = useState([]);

  useEffect(() => {
     if (activeTab === 'broadcasts') {
         fetchAdminBroadcasts();
         const channel = supabase.channel('admin_broadcasts_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                fetchAdminBroadcasts();
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
     }
  }, [activeTab]);

  const fetchAdminBroadcasts = async () => {
      const { data } = await supabase.from('notifications')
          .select('*')
          .is('user_id', null)
          .order('created_at', { ascending: false });
      if (data) setAdminBroadcasts(data);
  };

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  const handleSmartParse = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n');
    let ing = [];
    let stps = [];
    let mode = 'steps'; 
    lines.forEach(l => {
       const low = l.toLowerCase();
       if (low.includes('ingredient')) { mode = 'ing'; return; }
       if (low.includes('step') || low.includes('instruction') || low.includes('direction')) { mode = 'steps'; return; }
       if (!l.trim()) return;
       if (mode === 'ing') {
           const match = l.match(/^([\d\s/.\w]+?)\s+(.*)$/);
           if (match) ing.push({ amount: match[1].trim(), name: match[2].trim() });
           else ing.push({ amount: '1', name: l.trim() });
       } else {
           stps.push(l.trim().replace(/^\d+[.)]\s*/, ''));
       }
    });
    setRecipeForm({ ...recipeForm, ingredients: ing.length ? ing : recipeForm.ingredients, steps: stps.length ? stps : recipeForm.steps });
    showToast("Magic Complete! ✨");
    setRawText("");
  };

  const handleClassSmartParse = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n');
    let ing = [];
    let stps = [];
    let mode = 'steps'; 
    lines.forEach(l => {
       const low = l.toLowerCase();
       if (low.includes('ingredient')) { mode = 'ing'; return; }
       if (low.includes('step') || low.includes('instruction') || low.includes('direction')) { mode = 'steps'; return; }
       if (!l.trim()) return;
       if (mode === 'ing') {
           const match = l.match(/^([\d\s/.\w]+?)\s+(.*)$/);
           if (match) ing.push({ amount: match[1].trim(), name: match[2].trim() });
           else ing.push({ amount: '1', name: l.trim() });
       } else {
           stps.push(l.trim().replace(/^\d+[.)]\s*/, ''));
       }
    });
    setClassForm({ ...classForm, ingredients: ing.length ? ing : classForm.ingredients, steps: stps.length ? stps : classForm.steps });
    showToast("Magic Complete! ✨");
    setRawText("");
  };

  const handleBulkUploadRecipes = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          setStagingData({ type: 'recipes', items: data });
        } else {
          showToast("Invalid JSON format. Expected an array.", "error");
        }
      } catch (err) {
        showToast("Error parsing JSON file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const handleBulkUploadClasses = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          setStagingData({ type: 'classes', items: data });
        } else {
          showToast("Invalid JSON format. Expected an array.", "error");
        }
      } catch (err) {
        showToast("Error parsing JSON file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const confirmStagingUpload = async () => {
    let count = 0;
    if (stagingData.type === 'recipes') {
      for (const item of stagingData.items) { await addRecipe(item); count++; }
      showToast(`Imported ${count} recipes! 🎉`);
    } else if (stagingData.type === 'classes') {
      for (const item of stagingData.items) { await addClass(item); count++; }
      showToast(`Imported ${count} classes! 🎉`);
    }
    setStagingData({ type: null, items: [] });
  };

  const getTierMeta = (tierName) => {
    if (tierName === 'Free') return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Free Tier', hex: '#94a3b8' };
    
    const tier = settings.premiumTiers?.find(t => t.name === tierName);
    if (tier?.color) return { color: 'text-white', bg: 'bg-slate-800', border: 'border-slate-700', label: tierName, customColor: tier.color, hex: tier.color };

    const colors = [
      { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hex: '#60a5fa' },
      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hex: '#34d399' },
      { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hex: '#fbbf24' }
    ];

    const idx = settings.premiumTiers?.findIndex(t => t.name === tierName) || 0;
    const style = colors[idx % colors.length];
    return { ...style, label: tierName };
  };



  const handleSaveSettings = async () => {
    updateSettings(settings);
    showToast("Settings Saved Successfully! 🚀");
  };

  const handlePostRecipe = async (e) => {
    e.preventDefault();
    const cleanIngredients = recipeForm.ingredients.filter(i => i.name.trim() !== '');
    const cleanSteps = recipeForm.steps.filter(s => s.trim() !== '');
    const { id, ...dataToSave } = recipeForm;
    const data = { ...dataToSave, ingredients: cleanIngredients, steps: cleanSteps };
    
    if (id) updateRecipe(id, data); else addRecipe(data);
    setIsCreating(false);
    showToast(`Recipe ${data.status === 'published' ? 'Published' : 'Drafted'}! 🌍`);
  };

  const requestDelete = (coll, id, title) => setDeleteContext({ isOpen: true, coll, id, title });
  const executeDelete = async () => {
    if (deleteContext.coll === 'recipes') deleteRecipe(deleteContext.id);
    else if (deleteContext.coll === 'classes') deleteClass(deleteContext.id);
    else if (deleteContext.coll === 'people') removeUser(deleteContext.id);
    else if (deleteContext.coll === 'merch') deleteProduct(deleteContext.id);
    else if (deleteContext.coll === 'broadcasts') {
       await supabase.from('notifications').delete().eq('id', deleteContext.id);
       fetchAdminBroadcasts();
    }
    
    showToast("Deleted forever! 🗑️");
    setDeleteContext({ isOpen: false, coll: '', id: '', title: '' });
  };

  const handleConfirmUnlock = () => {
    if (unlockContext.action === 'unlock') {
        if (unlockContext.itemType === 'volume') setPersonForm(prev => ({...prev, unlockedVolumes: [...prev.unlockedVolumes, unlockContext.itemId]}));
        if (unlockContext.itemType === 'class') setPersonForm(prev => ({...prev, unlockedClasses: [...prev.unlockedClasses, unlockContext.itemId]}));
    } else {
        if (unlockContext.itemType === 'volume') setPersonForm(prev => ({...prev, unlockedVolumes: prev.unlockedVolumes.filter(id => id !== unlockContext.itemId)}));
        if (unlockContext.itemType === 'class') setPersonForm(prev => ({...prev, unlockedClasses: prev.unlockedClasses.filter(id => id !== unlockContext.itemId)}));
    }
    setUnlockContext({...unlockContext, isOpen: false});
  };

  const generateApiKey = () => {
    const key = 'cwc_live_' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
    const newKeys = [{ id: Date.now().toString(), name: 'Production API Key', key }, ...(settings.apiKeys || [])];
    updateSettings({ ...settings, apiKeys: newKeys });
    showToast("New API Key Generated! 🔑");
  };

  const removeApiKey = (id) => {
    const newKeys = (settings.apiKeys || []).filter(k => k.id !== id);
    updateSettings({ ...settings, apiKeys: newKeys });
    showToast("API Key Revoked! 🗑️");
  };

  const fRecipes = useMemo(() => recipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())), [recipes, searchQuery]);
  const fPeople = useMemo(() => people.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())), [people, searchQuery]);
  const fClasses = useMemo(() => classes.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())), [classes, searchQuery]);
  const fMerch = useMemo(() => merch.filter(m => (m.title || '').toLowerCase().includes(searchQuery.toLowerCase())), [merch, searchQuery]);
  const mrr = useMemo(() => {
     let total = 0;
     people.forEach(p => {
         const t = settings.premiumTiers?.find(tier => tier.name === p.subscriptionTier);
         if (t && t.price) {
            const basePrice = parseFloat(t.price);
            const discount = parseFloat(t.discount) || 0;
            total += basePrice * (1 - discount / 100);
         }
     });
     return total;
  }, [people, settings]);

  const renderNavItem = (id, label, Icon) => (
    <button key={id} onClick={() => { setActiveTab(id); setIsMobileOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-5 rounded-full text-lg font-black transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] scale-105' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={24} className={activeTab === id ? 'text-white' : 'text-slate-500'} /> {label}
    </button>
  );

  if (!user || (user.role !== 'admin' && user.role !== 'management')) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8 text-center">
         <ShieldAlert size={80} className="text-rose-500 mb-6" />
         <h1 className="text-4xl font-black mb-4">Access Denied</h1>
         <p className="text-xl text-slate-400 max-w-md mx-auto">You do not have the required clearance to access the CWC+ Management Console.</p>
         <button onClick={() => window.location.href = '/'} className="mt-8 px-8 py-4 bg-indigo-600 rounded-full font-black text-lg hover:scale-105 transition-all">Return to Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden font-sans selection:bg-indigo-500/30" style={{ '--accent': settings.accentColor || '#4f46e5' }}>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>
      <ConfirmModal {...deleteContext} onConfirm={executeDelete} onCancel={() => setDeleteContext({ ...deleteContext, isOpen: false })} />
      <GenericConfirmModal 
        isOpen={unlockContext.isOpen}
        title={unlockContext.action === 'unlock' ? 'Grant Access?' : 'Revoke Access?'}
        message={`Are you sure you want to ${unlockContext.action} "${unlockContext.itemName}" for ${personForm.name}?`}
        onConfirm={handleConfirmUnlock}
        onCancel={() => setUnlockContext({ ...unlockContext, isOpen: false })}
        confirmText={unlockContext.action === 'unlock' ? 'Yes, Grant Access' : 'Yes, Revoke Access'}
        confirmColor={unlockContext.action === 'unlock' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}
        icon={unlockContext.action === 'unlock' ? Unlock : Lock}
        iconColor={unlockContext.action === 'unlock' ? 'text-emerald-500' : 'text-rose-500'}
        iconBg={unlockContext.action === 'unlock' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--accent)' }}><ChefHat size={28} color="white"/></div>
             <h1 className="text-2xl font-black text-white tracking-tight">CWC<span style={{ color: 'var(--accent)' }}>+</span></h1>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-500 hover:text-white"><X size={24}/></button>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
          {renderNavItem("dashboard", "Home Base", LayoutDashboard)}
          {renderNavItem("analytics", "Analytics", TrendingUp)}
          {renderNavItem("orders", "Orders & Payments", DollarSign)}
          {renderNavItem("curation", "Curation", GripVertical)}
          {renderNavItem("recipes", "Meals & Recipes", ChefHat)}
          {renderNavItem("classes", "Masterclasses", Video)}
          {renderNavItem("merch", "Merchandise", ShoppingBag)}
          {renderNavItem("people", "Members", Users)}
          {renderNavItem("broadcasts", "Broadcasts", Bell)}
          {renderNavItem("plugins", "Plugins & APIs", Puzzle)}
          {renderNavItem("settings", "Settings", Settings)}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative custom-scrollbar">
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-3xl border-b border-slate-800 p-4 lg:p-8 flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1 max-w-3xl">
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden p-3 bg-slate-800 rounded-2xl"><LayoutDashboard size={24} /></button>
            <div className="relative flex-1">
              <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-full pl-16 pr-6 py-4 text-lg font-bold outline-none transition-all focus:border-indigo-500 placeholder:text-slate-500" style={{ '--tw-ring-color': 'var(--accent)' }} />
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4">
             <div className="px-6 py-3 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">Supabase Linked</span>
             </div>
          </div>
        </header>

        <main className="p-4 lg:p-10 w-full max-w-7xl mx-auto pb-40">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-rose-500/10 border-2 border-indigo-500/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 space-y-2 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    Welcome back to HQ,
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">{user?.name || 'Chef'}</span>
                  </h2>
                  <p className="text-lg text-indigo-200 font-medium max-w-xl">
                    Your culinary empire is growing. Here is what is happening across CWC+ today.
                  </p>
                </div>
                <div className="relative z-10 flex gap-4">
                  <button onClick={() => setActiveTab('recipes')} className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={20} /> Add Recipe
                  </button>
                </div>
              </div>

              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Recipes', val: recipes.length, icon: ChefHat, bg: 'bg-indigo-500', trend: 'Growing!' },
                  { label: 'Masterclasses', val: classes.length, icon: Video, bg: 'bg-rose-500', trend: 'Watch now' },
                  { label: 'Happy Members', val: people.length, icon: Users, bg: 'bg-emerald-500', trend: 'Joining fast' },
                  { label: 'Monthly Revenue', val: '$' + mrr.toFixed(0), icon: DollarSign, bg: 'bg-amber-500', trend: 'Real money!' },
                ].map((stat, i) => (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={stat.label} className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border-2 border-slate-800/80 flex flex-col items-center text-center group hover:border-slate-700 transition-colors shadow-lg">
                    <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-${stat.bg.split('-')[1]}-500/30 group-hover:scale-110 transition-transform -mt-2`}><stat.icon size={24} className="text-white" /></div>
                    <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{stat.val}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 {/* Membership Breakdown */}
                 <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-lg flex flex-col">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3"><Users size={24} className="text-indigo-400"/> Member Tiers</h3>
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        {['Free', ...(settings.premiumTiers?.map(t => t.name) || [])].map(tier => {
                            const count = people.filter(p => p.subscriptionTier === tier).length;
                            const pct = people.length ? Math.round((count / people.length) * 100) : 0;
                            const meta = getTierMeta(tier);
                            return (
                                <div key={tier}>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-slate-300">{tier}</span>
                                        <span className="text-white">{count} ({pct}%)</span>
                                    </div>
                                    <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full ${tier === 'Free' ? 'bg-slate-500' : 'bg-emerald-500'}`} style={meta.customColor ? {backgroundColor: meta.customColor} : {}} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 </div>

                 {/* Content Overview */}
                 <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-lg flex flex-col">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3"><ChefHat size={24} className="text-rose-400"/> Content Status</h3>
                    
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center">
                            <span className="text-emerald-400 mb-2"><Eye size={24}/></span>
                            <h4 className="text-2xl font-black text-white mb-1">{recipes.filter(r => r.status === 'published').length + classes.filter(c => c.status === 'published').length}</h4>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Published</p>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center">
                            <span className="text-slate-500 mb-2"><EyeOff size={24}/></span>
                            <h4 className="text-2xl font-black text-white mb-1">{recipes.filter(r => r.status === 'draft').length + classes.filter(c => c.status === 'draft').length}</h4>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Drafts</p>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center col-span-2 mt-2">
                            <span className="text-amber-400 mb-2"><Star size={24} className="fill-amber-400"/></span>
                            <h4 className="text-2xl font-black text-white mb-1">{recipes.filter(r => r.isFeatured).length + classes.filter(c => c.isFeatured).length}</h4>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Featured Content</p>
                        </div>
                    </div>
                 </div>
              </div>

            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'curation' && <ContentCurator />}

          {/* RECIPES */}
          {activeTab === 'recipes' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <h3 className="text-3xl md:text-4xl font-black">All Recipes</h3>
                {!isCreating && (
                   <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                     <label className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-full font-black text-lg shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all justify-center cursor-pointer">
                        <Package size={24} /> Bulk JSON
                        <input type="file" accept=".json" className="hidden" onChange={handleBulkUploadRecipes} />
                     </label>
                     <button onClick={() => { setRecipeForm({ title: '', author: '', time: '', image: '', video: '', category: 'Mains', difficulty: 'Beginner', baseServings: 2, ingredients: [{name: '', amount: ''}], steps: [''], status: 'published', isFeatured: false, tierRequired: 'Free', scheduled_post_date: '' }); setIsCreating(true); }} className="px-8 py-4 bg-indigo-600 rounded-full font-black text-lg shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"><Plus size={24} /> Create a Recipe</button>
                   </div>
                )}
              </div>

              {!isCreating && stagingData.type === 'recipes' && stagingData.items.length > 0 ? (
                <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-[40px] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-xl pointer-events-none" />
                    <Package size={64} className="mx-auto text-indigo-400 mb-6 relative z-10" />
                    <h4 className="text-3xl font-black text-white mb-4 relative z-10">Review Your Bulk Upload</h4>
                    <p className="text-slate-400 font-bold mb-8 relative z-10">You are about to upload {stagingData.items.length} recipes. Please check before confirming.</p>
                    
                    <div className="max-h-[300px] overflow-y-auto mb-8 bg-slate-950 rounded-[24px] border border-slate-800 p-4 text-left custom-scrollbar relative z-10">
                        {stagingData.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                                <div>
                                    <h5 className="font-bold text-white">{item.title || 'Untitled'}</h5>
                                    <span className="text-xs text-slate-500">{item.author || 'Unknown'} • {item.ingredients?.length || 0} ingredients</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${item.status === 'draft' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{item.status || 'published'}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 justify-center relative z-10">
                        <button onClick={() => setStagingData({ type: null, items: [] })} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black transition-all">Cancel</button>
                        <button onClick={confirmStagingUpload} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black shadow-xl hover:scale-105 active:scale-95 transition-all">Confirm Upload</button>
                    </div>
                </div>
              ) : !isCreating ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fRecipes.map(r => {
                      const tierMeta = getTierMeta(r.tierRequired || 'Free');
                      return (
                    <motion.div layout key={r.id} className={`bg-slate-900 border-2 rounded-3xl overflow-hidden group transition-colors ${r.status === 'draft' ? 'border-dashed border-slate-600 opacity-75' : 'border-slate-800 hover:border-indigo-500/50'}`}>
                      <div className="h-64 relative">
                        {r.image ? <img src={r.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><ChefHat size={48} className="text-slate-600"/></div>}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                           <button onClick={() => { setRecipeForm(r); setIsCreating(true); }} className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"><Edit3 size={28}/></button>
                           <button onClick={() => requestDelete('recipes', r.id, r.title)} className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"><Trash2 size={28}/></button>
                        </div>
                        <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`} style={tierMeta.customColor ? {backgroundColor: `${tierMeta.customColor}20`, borderColor: `${tierMeta.customColor}40`, color: tierMeta.customColor} : {}}>{tierMeta.label}</div>
                        {r.status === 'draft' && <div className="absolute top-4 right-4 px-4 py-2 bg-slate-800 rounded-full text-xs font-black uppercase text-slate-400 border border-slate-600 backdrop-blur-md"><EyeOff size={14} className="inline mr-1 -mt-0.5"/> Draft</div>}
                        {r.isFeatured && r.status !== 'draft' && <div className="absolute top-4 right-4 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg"><Star size={20} className="text-white fill-white" /></div>}
                      </div>
                      <div className="p-6">
                        <h4 className="font-black text-xl mb-2 text-white">{r.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                           <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-300">{r.volume || 'Free'}</span>
                           <span className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-bold text-slate-300">{r.category || 'Mains'}</span>
                           <span className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-bold text-slate-300">{r.difficulty || 'Beginner'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )})}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto bg-slate-900 border-2 border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
                   <div className="bg-indigo-600 p-8 md:p-10 flex justify-between items-center relative overflow-hidden" style={{ backgroundColor: 'var(--accent)' }}>
                      <Wand2 className="absolute right-10 opacity-20 w-40 h-40" />
                      <h4 className="text-3xl md:text-4xl font-black text-white relative z-10">{recipeForm.id ? 'Edit Recipe' : 'New Recipe Magic'}</h4>
                      <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center relative z-10 transition-colors"><X size={28}/></button>
                   </div>

                   <div className="p-6 md:p-10 space-y-10">
                      <div className="p-8 bg-slate-800/50 border-2 border-slate-700 rounded-[32px] text-center">
                          <Wand2 size={40} className="mx-auto text-slate-400 mb-4" />
                          <h5 className="text-2xl font-black text-white mb-2">Magic Auto-Fill!</h5>
                          <textarea rows={3} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Paste the whole recipe here..." className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-5 text-lg text-white placeholder:text-slate-600 focus:outline-none mb-4 custom-scrollbar" />
                          <button type="button" onClick={handleSmartParse} className="w-full py-5 bg-slate-800 hover:bg-slate-700 rounded-full font-black text-xl transition-all">Do The Magic ✨</button>
                      </div>

                      <form onSubmit={handlePostRecipe} className="space-y-8">
                        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-3xl border border-slate-800">
                           <span className="font-bold text-slate-400 uppercase tracking-widest pl-4 text-sm">Status</span>
                           <div className="flex bg-slate-900 rounded-2xl p-1">
                               <button type="button" onClick={() => setRecipeForm({...recipeForm, status: 'draft'})} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${recipeForm.status === 'draft' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}><EyeOff size={16} className="inline mr-2"/>Draft</button>
                               <button type="button" onClick={() => setRecipeForm({...recipeForm, status: 'published'})} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${recipeForm.status === 'published' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-white'}`}><Eye size={16} className="inline mr-2"/>Published</button>
                           </div>
                           <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Feature Banner</span>
                                <button type="button" onClick={() => setRecipeForm({...recipeForm, isFeatured: !recipeForm.isFeatured})} className={`w-14 h-8 rounded-full relative transition-colors border-2 ${recipeForm.isFeatured ? 'bg-amber-500 border-amber-500' : 'bg-slate-900 border-slate-700'}`}>
                                    <motion.div animate={{ x: recipeForm.isFeatured ? 24 : 2 }} className="w-6 h-6 bg-white rounded-full absolute top-0.5" />
                                </button>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase text-slate-500 ml-2">Name of the Dish</label>
                                <input required type="text" value={recipeForm.title} onChange={e => setRecipeForm({...recipeForm, title: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="e.g. Magic Pancakes" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase text-slate-500 ml-2">Recipe Volume</label>
                                <select value={recipeForm.volume || 'CWC Original'} onChange={e => setRecipeForm({...recipeForm, volume: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white cursor-pointer appearance-none">
                                    {(settings.volumes || []).map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                    <option value="Free">Free (No Volume)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <ImageUploader label="Cover Image (JPG, PNG)" value={recipeForm.image} onChange={(val) => setRecipeForm({...recipeForm, image: val})} />
                            </div>
                            <div className="space-y-2">
                                <ImageUploader label="Recipe Video (MP4) Optional" value={recipeForm.video} onChange={(val) => setRecipeForm({...recipeForm, video: val})} />
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <label className="text-sm font-black uppercase text-slate-500 ml-2">Notes & Tips (Optional)</label>
                                <textarea rows={3} value={recipeForm.notes || ''} onChange={e => setRecipeForm({...recipeForm, notes: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500 custom-scrollbar" placeholder="Any special tips, secrets or equipment needed?" />
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <label className="text-sm font-black uppercase text-slate-500 ml-2">Scheduled Post Date (Optional)</label>
                                <input type="datetime-local" value={recipeForm.scheduled_post_date || ''} onChange={e => setRecipeForm({...recipeForm, scheduled_post_date: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white appearance-none custom-scrollbar focus:border-indigo-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="bg-slate-950 p-6 rounded-[40px] border-2 border-slate-800">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h5 className="font-black text-xl text-white">Ingredients</h5>
                                    <button type="button" onClick={() => setRecipeForm({...recipeForm, ingredients: [...(recipeForm.ingredients || []), {name: '', amount: ''}]})} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500"><Plus size={20}/></button>
                                </div>
                                <div className="space-y-3">
                                    {(recipeForm.ingredients || []).map((ing, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input placeholder="Qty (2 cups)" value={ing.amount} onChange={e => { const n = [...recipeForm.ingredients]; n[idx].amount = e.target.value; setRecipeForm({...recipeForm, ingredients: n}); }} className="w-1/3 bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white" />
                                            <input placeholder="Item (Flour)" value={ing.name} onChange={e => { const n = [...recipeForm.ingredients]; n[idx].name = e.target.value; setRecipeForm({...recipeForm, ingredients: n}); }} className="w-2/3 bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white" />
                                            <button type="button" onClick={() => setRecipeForm({...recipeForm, ingredients: recipeForm.ingredients.filter((_, i) => i !== idx)})} className="w-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><X size={20}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950 p-6 rounded-[40px] border-2 border-slate-800">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h5 className="font-black text-xl text-white">How to make it</h5>
                                    <button type="button" onClick={() => setRecipeForm({...recipeForm, steps: [...(recipeForm.steps || []), '']})} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500"><Plus size={20}/></button>
                                </div>
                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {(recipeForm.steps || []).map((step, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-indigo-400 flex-shrink-0 mt-1">{idx+1}</div>
                                            <textarea rows={2} value={step} onChange={e => { const n = [...recipeForm.steps]; n[idx] = e.target.value; setRecipeForm({...recipeForm, steps: n}); }} className="flex-1 bg-slate-900 border-2 border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white custom-scrollbar" placeholder="Mix it all up..." />
                                            <button type="button" onClick={() => setRecipeForm({...recipeForm, steps: recipeForm.steps.filter((_, i) => i !== idx)})} className="w-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors h-14 mt-1"><X size={20}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all">
                            Save Recipe! 🍳
                        </button>
                      </form>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* CLASSES */}
          {activeTab === 'classes' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <h3 className="text-3xl md:text-4xl font-black">Masterclasses</h3>
                {!isCreating && (
                   <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                     <label className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-full font-black text-lg shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all justify-center cursor-pointer">
                        <Package size={24} /> Bulk JSON
                        <input type="file" accept=".json" className="hidden" onChange={handleBulkUploadClasses} />
                     </label>
                     <button onClick={() => { setClassForm({ title: '', instructor: '', duration: '', price: '15.00', image: '', video: '', status: 'published', tierRequired: settings.premiumTiers?.[0]?.name || 'Premium', ingredients: [{name: '', amount: ''}], steps: [''], notes: '', attachments: [], scheduled_post_date: '', live_date: '' }); setIsCreating(true); }} className="px-8 py-4 bg-indigo-600 rounded-full font-black text-lg shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"><Plus size={24} /> Add Masterclass</button>
                   </div>
                )}
              </div>

              {!isCreating && stagingData.type === 'classes' && stagingData.items.length > 0 ? (
                <div className="bg-slate-900 border-2 border-rose-500/30 rounded-[40px] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-rose-500/5 backdrop-blur-xl pointer-events-none" />
                    <Video size={64} className="mx-auto text-rose-400 mb-6 relative z-10" />
                    <h4 className="text-3xl font-black text-white mb-4 relative z-10">Review Your Bulk Upload</h4>
                    <p className="text-slate-400 font-bold mb-8 relative z-10">You are about to upload {stagingData.items.length} masterclasses. Please check before confirming.</p>
                    
                    <div className="max-h-[300px] overflow-y-auto mb-8 bg-slate-950 rounded-[24px] border border-slate-800 p-4 text-left custom-scrollbar relative z-10">
                        {stagingData.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                                <div>
                                    <h5 className="font-bold text-white">{item.title || 'Untitled'}</h5>
                                    <span className="text-xs text-slate-500">{item.instructor || 'Unknown'} • {item.duration || '0m'}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${item.status === 'draft' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{item.status || 'published'}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 justify-center relative z-10">
                        <button onClick={() => setStagingData({ type: null, items: [] })} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black transition-all">Cancel</button>
                        <button onClick={confirmStagingUpload} className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black shadow-xl hover:scale-105 active:scale-95 transition-all">Confirm Upload</button>
                    </div>
                </div>
              ) : !isCreating ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fClasses.map(c => {
                      const tierMeta = getTierMeta(c.tierRequired || 'Premium');
                      return (
                    <motion.div layout key={c.id} className={`bg-slate-900 border-2 rounded-3xl overflow-hidden group transition-colors ${c.status === 'draft' ? 'border-dashed border-slate-600 opacity-75' : 'border-slate-800 hover:border-indigo-500/50'}`}>
                      <div className="aspect-video relative">
                        {c.image ? <img src={c.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Video size={48} className="text-slate-600"/></div>}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                           <button onClick={() => { setClassForm({ ingredients: [{name: '', amount: ''}], steps: [''], attachments: [], ...c }); setIsCreating(true); }} className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"><Edit3 size={28}/></button>
                           <button onClick={() => requestDelete('classes', c.id, c.title)} className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"><Trash2 size={28}/></button>
                        </div>
                        <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`} style={tierMeta.customColor ? {backgroundColor: `${tierMeta.customColor}20`, borderColor: `${tierMeta.customColor}40`, color: tierMeta.customColor} : {}}>{tierMeta.label}+ Level</div>
                        {c.status === 'draft' && <div className="absolute top-4 right-4 px-4 py-2 bg-slate-800 rounded-full text-xs font-black uppercase text-slate-400 border border-slate-600 backdrop-blur-md"><EyeOff size={14} className="inline mr-1 -mt-0.5"/> Draft</div>}
                      </div>
                      <div className="p-6">
                        <h4 className="font-black text-xl mb-3 text-white line-clamp-1">{c.title}</h4>
                        <div className="flex items-center justify-between text-slate-500 text-sm font-black uppercase">
                           <span className="flex items-center gap-2 text-indigo-400"><Users size={16}/> {c.instructor}</span>
                        </div>
                      </div>
                    </motion.div>
                  )})}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto bg-slate-900 border-2 border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="bg-indigo-600 p-8 md:p-10 flex justify-between items-center relative overflow-hidden" style={{ backgroundColor: 'var(--accent)' }}>
                      <Video className="absolute right-10 opacity-20 w-40 h-40" />
                      <h4 className="text-3xl md:text-4xl font-black text-white relative z-10">{classForm.id ? 'Edit Class' : 'Add New Class'}</h4>
                      <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center relative z-10 transition-colors"><X size={28}/></button>
                   </div>
                   
                   <div className="px-6 md:px-10 pt-10">
                      <div className="p-8 bg-slate-800/50 border-2 border-slate-700 rounded-[32px] text-center">
                          <Wand2 size={40} className="mx-auto text-slate-400 mb-4" />
                          <h5 className="text-2xl font-black text-white mb-2">Recipe Auto-Fill Magic!</h5>
                          <p className="text-slate-400 text-sm mb-4">Paste the recipe text here, and we'll extract the ingredients and steps for this masterclass.</p>
                          <textarea rows={3} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Paste the class recipe here..." className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-5 text-lg text-white placeholder:text-slate-600 focus:outline-none mb-4 custom-scrollbar" />
                          <button type="button" onClick={handleClassSmartParse} className="w-full py-5 bg-slate-800 hover:bg-slate-700 rounded-full font-black text-xl transition-all">Extract Class Recipe ✨</button>
                      </div>
                   </div>

                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     const cleanIngredients = classForm.ingredients ? classForm.ingredients.filter(i => i.name.trim() !== '') : [];
                     const cleanSteps = classForm.steps ? classForm.steps.filter(s => s.trim() !== '') : [];
                     const { id, ...dataToSave } = classForm;
                     
                     if (!dataToSave.scheduled_post_date) dataToSave.scheduled_post_date = null;
                     if (!dataToSave.live_date) dataToSave.live_date = null;

                     const data = { ...dataToSave, ingredients: cleanIngredients, steps: cleanSteps };
                     if (id) updateClass(id, data); else addClass(data);
                     setIsCreating(false); showToast(`Class ${dataToSave.status === 'published' ? 'Published' : 'Drafted'}! 🎬`);
                   }} className="p-6 md:p-10 space-y-8">
                        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-3xl border border-slate-800">
                           <span className="font-bold text-slate-400 uppercase tracking-widest pl-4 text-sm">Status</span>
                           <div className="flex bg-slate-900 rounded-2xl p-1">
                               <button type="button" onClick={() => setClassForm({...classForm, status: 'draft'})} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${classForm.status === 'draft' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}><EyeOff size={16} className="inline mr-2"/>Draft</button>
                               <button type="button" onClick={() => setClassForm({...classForm, status: 'published'})} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${classForm.status === 'published' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-white'}`}><Eye size={16} className="inline mr-2"/>Published</button>
                           </div>
                           <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Feature Banner</span>
                                <button type="button" onClick={() => setClassForm({...classForm, isFeatured: !classForm.isFeatured})} className={`w-14 h-8 rounded-full relative transition-colors border-2 ${classForm.isFeatured ? 'bg-amber-500 border-amber-500' : 'bg-slate-900 border-slate-700'}`}>
                                    <motion.div animate={{ x: classForm.isFeatured ? 24 : 2 }} className="w-6 h-6 bg-white rounded-full absolute top-0.5" />
                                </button>
                           </div>
                        </div>

                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Video Title</label><input required type="text" value={classForm.title} onChange={e => setClassForm({...classForm, title: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Teacher Name</label><input required type="text" value={classForm.instructor} onChange={e => setClassForm({...classForm, instructor: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>
                            <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Who can watch?</label>
                                <select value={classForm.tierRequired} onChange={e => setClassForm({...classForm, tierRequired: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none cursor-pointer text-white">
                                    {(settings.premiumTiers || []).map(t => <option key={t.id} value={t.name}>{t.name} Level</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Video Link (YouTube, MP4)</label><input required type="text" placeholder="https://..." value={classForm.video} onChange={e => setClassForm({...classForm, video: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>
                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Notes & Tips (Optional)</label><textarea rows={3} placeholder="Any special tips?" value={classForm.notes || ''} onChange={e => setClassForm({...classForm, notes: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-lg font-bold outline-none text-white custom-scrollbar" /></div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between ml-2">
                                <label className="text-sm font-black uppercase text-slate-500">Attachments (PDF, IMG - Max 5)</label>
                                {(classForm.attachments || []).length < 5 && (
                                    <button type="button" onClick={() => setClassForm({...classForm, attachments: [...(classForm.attachments || []), { title: '', url: '' }]})} className="text-xs font-black text-indigo-400 flex items-center gap-1 hover:text-indigo-300 px-3 py-1 bg-indigo-500/10 rounded-full"><Plus size={14}/> Add File</button>
                                )}
                            </div>
                            {(classForm.attachments || []).map((att, idx) => (
                                <div key={idx} className="flex gap-2 relative">
                                    <input placeholder="File Name (e.g. Workbook)" value={att.title} onChange={e => { const n = [...(classForm.attachments || [])]; n[idx].title = e.target.value; setClassForm({...classForm, attachments: n}); }} className="w-1/3 bg-slate-950 border-2 border-slate-800 rounded-l-[20px] px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white" />
                                    <input placeholder="File URL (https://...)" value={att.url} onChange={e => { const n = [...(classForm.attachments || [])]; n[idx].url = e.target.value; setClassForm({...classForm, attachments: n}); }} className="flex-1 bg-slate-950 border-2 border-slate-800 border-l-0 px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white" />
                                    <button type="button" onClick={() => { const n = (classForm.attachments || []).filter((_, i) => i !== idx); setClassForm({...classForm, attachments: n}); }} className="w-16 flex-shrink-0 bg-slate-900 text-slate-500 hover:text-rose-500 border-2 border-slate-800 border-l-0 rounded-r-[20px] flex items-center justify-center transition-colors"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3"><ImageUploader label="Cover Picture (JPG, PNG, SVG)" value={classForm.image} onChange={(val) => setClassForm({...classForm, image: val})} /></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Scheduled Post Date (Optional)</label><input type="datetime-local" value={classForm.scheduled_post_date || ''} onChange={e => setClassForm({...classForm, scheduled_post_date: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[20px] px-6 py-4 text-lg font-bold outline-none text-white appearance-none custom-scrollbar" /></div>
                            <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Live Stream Date (Optional)</label><input type="datetime-local" value={classForm.live_date || ''} onChange={e => setClassForm({...classForm, live_date: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[20px] px-6 py-4 text-lg font-bold outline-none text-white appearance-none custom-scrollbar" /></div>
                        </div>

                        <div className="pt-8 border-t border-slate-800">
                          <h4 className="text-2xl font-black text-white mb-6">Attached Recipe Data</h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                              <div className="bg-slate-950 p-6 rounded-[40px] border-2 border-slate-800">
                                  <div className="flex items-center justify-between mb-6 px-2">
                                      <h5 className="font-black text-xl text-white">Ingredients</h5>
                                      <button type="button" onClick={() => setClassForm({...classForm, ingredients: [...(classForm.ingredients || []), {name: '', amount: ''}]})} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500"><Plus size={20}/></button>
                                  </div>
                                  <div className="space-y-3">
                                      {(classForm.ingredients || []).map((ing, idx) => (
                                          <div key={idx} className="flex gap-2">
                                              <input placeholder="Qty (2 cups)" value={ing.amount} onChange={e => { const n = [...(classForm.ingredients || [])]; n[idx].amount = e.target.value; setClassForm({...classForm, ingredients: n}); }} className="w-1/3 bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white" />
                                              <input placeholder="Item (Flour)" value={ing.name} onChange={e => { const n = [...(classForm.ingredients || [])]; n[idx].name = e.target.value; setClassForm({...classForm, ingredients: n}); }} className="w-2/3 bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white" />
                                              <button type="button" onClick={() => setClassForm({...classForm, ingredients: (classForm.ingredients || []).filter((_, i) => i !== idx)})} className="w-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><X size={20}/></button>
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              <div className="bg-slate-950 p-6 rounded-[40px] border-2 border-slate-800">
                                  <div className="flex items-center justify-between mb-6 px-2">
                                      <h5 className="font-black text-xl text-white">How to make it</h5>
                                      <button type="button" onClick={() => setClassForm({...classForm, steps: [...(classForm.steps || []), '']})} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500"><Plus size={20}/></button>
                                  </div>
                                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                      {(classForm.steps || []).map((step, idx) => (
                                          <div key={idx} className="flex gap-3">
                                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-indigo-400 flex-shrink-0 mt-1">{idx+1}</div>
                                              <textarea rows={2} value={step} onChange={e => { const n = [...(classForm.steps || [])]; n[idx] = e.target.value; setClassForm({...classForm, steps: n}); }} className="flex-1 bg-slate-900 border-2 border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white custom-scrollbar" placeholder="Mix it all up..." />
                                              <button type="button" onClick={() => setClassForm({...classForm, steps: (classForm.steps || []).filter((_, i) => i !== idx)})} className="w-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors h-14 mt-1"><X size={20}/></button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                        </div>

                        <button type="submit" className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all mt-4">Save Masterclass! 🎥</button>
                   </form>
                </div>
              )}
            </div>
          )}

          {/* MERCHANDISE */}
          {activeTab === 'merch' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <h3 className="text-4xl md:text-5xl font-black">Merchandise</h3>
                {!isCreating && <button onClick={() => { setMerchForm({ title: '', price: '', image: '', description: '', status: 'published', stock: 10, scheduled_post_date: '' }); setIsCreating(true); }} className="px-8 py-4 bg-indigo-600 rounded-full font-black text-lg shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"><Plus size={24} /> Add Product</button>}
              </div>

              {!isCreating ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {fMerch.map(m => (
                    <motion.div layout key={m.id} className={`bg-slate-900 border-2 rounded-[32px] overflow-hidden group transition-colors ${m.status === 'draft' ? 'border-dashed border-slate-600 opacity-75' : 'border-slate-800 hover:border-indigo-500/50'}`}>
                      <div className="aspect-square relative p-4">
                        <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                           {m.image ? <img src={m.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Package size={48} className="text-slate-600"/></div>}
                           <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                              <button onClick={() => { setMerchForm(m); setIsCreating(true); }} className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"><Edit3 size={20}/></button>
                              <button onClick={() => requestDelete('merch', m.id, m.title)} className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"><Trash2 size={20}/></button>
                           </div>
                        </div>
                        {m.status === 'draft' && <div className="absolute top-6 right-6 px-3 py-1.5 bg-slate-800 rounded-full text-[10px] font-black uppercase text-slate-400 border border-slate-600 backdrop-blur-md"><EyeOff size={12} className="inline mr-1 -mt-0.5"/> Draft</div>}
                      </div>
                      <div className="px-6 pb-6 pt-2">
                        <h4 className="font-black text-xl mb-1 text-white line-clamp-1">{m.title}</h4>
                        <div className="flex items-center justify-between mt-4">
                           <span className="text-2xl font-black text-emerald-400">${m.price}</span>
                           <span className="text-xs font-bold text-slate-500 uppercase">{m.stock} in stock</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {fMerch.length === 0 && (
                    <div className="col-span-full py-40 text-center bg-slate-900 rounded-[40px] border-4 border-dashed border-slate-800">
                      <ShoppingBag size={80} className="mx-auto text-slate-700 mb-8" />
                      <h4 className="text-3xl font-black text-slate-400 mb-4">No Merch Yet!</h4>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto bg-slate-900 border-2 border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
                    <div className="bg-indigo-600 p-8 md:p-10 flex justify-between items-center relative overflow-hidden" style={{ backgroundColor: 'var(--accent)' }}>
                      <ShoppingBag className="absolute right-10 opacity-20 w-40 h-40" />
                      <h4 className="text-3xl md:text-4xl font-black text-white relative z-10">{merchForm.id ? 'Edit Product' : 'Add Product'}</h4>
                      <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center relative z-10 transition-colors"><X size={28}/></button>
                   </div>
                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     const { id, ...dataToSave } = merchForm;
                     if (id) updateProduct(id, dataToSave); else addProduct(dataToSave);
                     setIsCreating(false); showToast(`Product Saved! 👕`);
                   }} className="p-6 md:p-10 space-y-8">
                        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-3xl border border-slate-800">
                           <span className="font-bold text-slate-400 uppercase tracking-widest pl-4 text-sm">Status</span>
                           <div className="flex bg-slate-900 rounded-2xl p-1">
                               <button type="button" onClick={() => setMerchForm({...merchForm, status: 'draft'})} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${merchForm.status === 'draft' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}><EyeOff size={16} className="inline mr-2"/>Draft</button>
                               <button type="button" onClick={() => setMerchForm({...merchForm, status: 'published'})} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${merchForm.status === 'published' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-white'}`}><Eye size={16} className="inline mr-2"/>Published</button>
                           </div>
                        </div>

                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Product Name</label><input required type="text" value={merchForm.title} onChange={e => setMerchForm({...merchForm, title: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Price ($)</label><input required type="text" value={merchForm.price} onChange={e => setMerchForm({...merchForm, price: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>
                            <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Stock Level</label><input required type="number" value={merchForm.stock} onChange={e => setMerchForm({...merchForm, stock: parseInt(e.target.value)})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>
                        </div>
                        <div className="space-y-3"><ImageUploader label="Image (JPG, PNG, SVG)" value={merchForm.image} onChange={(val) => setMerchForm({...merchForm, image: val})} /></div>
                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Description</label><textarea rows={3} value={merchForm.description} onChange={e => setMerchForm({...merchForm, description: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-lg font-bold outline-none text-white custom-scrollbar" /></div>
                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Scheduled Post Date (Optional)</label><input type="datetime-local" value={merchForm.scheduled_post_date || ''} onChange={e => setMerchForm({...merchForm, scheduled_post_date: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white appearance-none custom-scrollbar" /></div>

                        <button type="submit" className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all mt-4">Save Product! 🛍️</button>
                   </form>
                </div>
              )}
            </div>
          )}

          {/* PEOPLE */}
          {activeTab === 'people' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                 <h3 className="text-3xl md:text-4xl font-black">Members</h3>
                 {!isCreating && <button onClick={() => { setPersonForm({ id: null, name: '', email: '', subscriptionTier: 'Free', role: 'user', unlockedVolumes: [], unlockedClasses: [] }); setIsCreating(true); }} className="px-8 py-4 bg-indigo-600 rounded-full font-black text-lg shadow-xl flex items-center gap-3 hover:scale-105 transition-all w-full sm:w-auto justify-center"><UserPlus size={24}/> Add Someone</button>}
              </div>

              {!isCreating ? (
                <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                    <div className="grid grid-cols-1 divide-y divide-slate-800">
                        {fPeople.map(p => {
                            const tierMeta = getTierMeta(p.subscriptionTier || p.subscription_tier || 'Free');
                            return (
                          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-800/50 transition-colors gap-6">
                            <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl border-4 ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`} style={tierMeta.customColor ? {backgroundColor: `${tierMeta.customColor}20`, borderColor: `${tierMeta.customColor}40`, color: tierMeta.customColor} : {}}>{p.name[0]?.toUpperCase()}</div>
                              <div>
                                 <p className="text-2xl font-black text-white mb-1">{p.name}</p>
                                 <p className="text-sm text-slate-500 font-bold">{p.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                                <select value={p.subscriptionTier || p.subscription_tier || 'Free'} onChange={async (e) => {
                                    await updateUserTier(p.id, e.target.value);
                                    showToast(`${p.name} updated!`);
                                }} className={`flex-1 sm:w-48 text-sm font-black uppercase px-6 py-4 rounded-full border-2 bg-slate-950 cursor-pointer outline-none ${tierMeta.color} ${tierMeta.border}`} style={tierMeta.customColor ? {borderColor: `${tierMeta.customColor}40`, color: tierMeta.customColor} : {}}>
                                    <option value="Free">Free Level</option>
                                    {(settings.premiumTiers || []).map(t => <option key={t.id} value={t.name}>{t.name} Level</option>)}
                                </select>
                                <select value={p.role || 'user'} onChange={async (e) => {
                                    await updateUser(p.id, { role: e.target.value });
                                    showToast(`${p.name} role updated!`);
                                }} className="flex-1 sm:w-40 text-xs font-black uppercase px-4 py-3 rounded-full border-2 bg-slate-950 cursor-pointer outline-none border-slate-700 text-slate-300">
                                    <option value="user">User</option>
                                    <option value="employee">Employee</option>
                                    <option value="management">Management</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button onClick={() => { setPersonForm({id: p.id, name: p.name, email: p.email, subscriptionTier: p.subscriptionTier || p.subscription_tier || 'Free', role: p.role || 'user', unlockedVolumes: p.unlocked_volumes || [], unlockedClasses: p.unlocked_classes || []}); setIsCreating(true); }} className="w-14 h-14 flex items-center justify-center text-slate-400 bg-slate-800 hover:bg-white hover:text-slate-900 rounded-full transition-colors flex-shrink-0"><Edit3 size={24} /></button>
                                <button onClick={() => requestDelete('people', p.id, p.name)} className="w-14 h-14 flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-full transition-colors flex-shrink-0"><Trash2 size={24} /></button>
                            </div>
                          </div>
                        )})}
                        {fPeople.length === 0 && (
                            <div className="p-32 text-center">
                                <Users size={64} className="mx-auto text-slate-700 mb-6" />
                                <p className="text-2xl font-black text-slate-500">No members found!</p>
                            </div>
                        )}
                    </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                   <div className="bg-indigo-600 p-6 md:p-8 flex justify-between items-center" style={{ backgroundColor: 'var(--accent)' }}>
                      <h4 className="text-2xl md:text-3xl font-black text-white">{personForm.id ? 'Edit Member' : 'Add Member'}</h4>
                      <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"><X size={28}/></button>
                   </div>
                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     if (personForm.id) {
                         await updateUser(personForm.id, { name: personForm.name, email: personForm.email, subscription_tier: personForm.subscriptionTier, role: personForm.role, unlocked_volumes: personForm.unlockedVolumes, unlocked_classes: personForm.unlockedClasses });
                         showToast("Member Updated! ✏️");
                     } else {
                         await addUser({ name: personForm.name, email: personForm.email, subscription_tier: personForm.subscriptionTier, role: personForm.role, unlocked_volumes: personForm.unlockedVolumes, unlocked_classes: personForm.unlockedClasses, createdAt: Date.now() });
                         showToast("Welcome to the family! 👋");
                     }
                     setIsCreating(false); 
                   }} className="p-6 md:p-10 space-y-8">
                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Name</label><input required type="text" value={personForm.name} onChange={e => setPersonForm({...personForm, name: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" /></div>
                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Email Address</label><input required type="email" value={personForm.email} onChange={e => setPersonForm({...personForm, email: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" /></div>
                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Access Level</label>
                            <select value={personForm.subscriptionTier} onChange={e => setPersonForm({...personForm, subscriptionTier: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-black text-white outline-none cursor-pointer">
                                <option value="Free">Free Access</option>
                                {(settings.premiumTiers || []).map(t => <option key={t.id} value={t.name}>{t.name} Access</option>)}
                            </select>
                        </div>
                        <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">System Role</label>
                            <select value={personForm.role} onChange={e => setPersonForm({...personForm, role: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-black text-white outline-none cursor-pointer">
                                <option value="user">User</option>
                                <option value="employee">Employee</option>
                                <option value="management">Management</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {personForm.id && (
                          <div className="pt-8 border-t border-slate-800 space-y-8">
                              <div>
                                 <h4 className="text-xl font-black text-white mb-4 flex items-center gap-3"><Book size={24} className="text-indigo-400"/> Volumes Access</h4>
                                 <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                     {(settings.volumes || []).map(v => {
                                         const isUnlocked = personForm.unlockedVolumes.includes(v.name);
                                         return (
                                             <div key={v.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                                 <span className="font-bold text-slate-300">{v.name}</span>
                                                 <button type="button" onClick={() => setUnlockContext({ isOpen: true, itemType: 'volume', itemId: v.name, itemName: v.name, action: isUnlocked ? 'lock' : 'unlock' })} className={`px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2 transition-colors ${isUnlocked ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}`}>
                                                     {isUnlocked ? <><Unlock size={14}/> Unlocked</> : <><Lock size={14}/> Locked</>}
                                                 </button>
                                             </div>
                                         )
                                     })}
                                 </div>
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-white mb-4 flex items-center gap-3"><Video size={24} className="text-indigo-400"/> Masterclasses Access</h4>
                                 <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                     {classes.map(c => {
                                         const isUnlocked = personForm.unlockedClasses.includes(c.id);
                                         return (
                                             <div key={c.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                                 <span className="font-bold text-slate-300 truncate pr-4">{c.title}</span>
                                                 <button type="button" onClick={() => setUnlockContext({ isOpen: true, itemType: 'class', itemId: c.id, itemName: c.title, action: isUnlocked ? 'lock' : 'unlock' })} className={`px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2 transition-colors ${isUnlocked ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}`}>
                                                     {isUnlocked ? <><Unlock size={14}/> Unlocked</> : <><Lock size={14}/> Locked</>}
                                                 </button>
                                             </div>
                                         )
                                     })}
                                 </div>
                              </div>
                          </div>
                        )}

                        <button type="submit" className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all mt-4">{personForm.id ? 'Save Changes' : 'Add Them Now!'}</button>
                   </form>
                </div>
              )}
            </div>
          )}

          {/* BROADCASTS */}
          {activeTab === 'broadcasts' && (
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                   <h3 className="text-3xl md:text-4xl font-black mb-4 flex items-center gap-4"><Bell className="text-indigo-400" size={36}/> Push Notifications</h3>
                   <p className="text-lg text-slate-400 font-medium">Send real-time alerts to all users instantly.</p>
                </div>
                
                <div className="bg-slate-900 border-2 border-slate-800 rounded-[40px] shadow-2xl overflow-hidden">
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!broadcastForm.title || !broadcastForm.message) return;
                        
                        try {
                            const { error } = await supabase.from('notifications').insert([{
                                title: broadcastForm.title,
                                message: broadcastForm.message,
                                type: broadcastForm.type,
                                attachment_type: broadcastForm.attachmentType,
                                attachment_id: broadcastForm.attachmentId || null,
                                read_status: false,
                                user_id: null, // Global
                                scheduled_post_date: broadcastForm.scheduled_post_date ? new Date(broadcastForm.scheduled_post_date).toISOString() : null
                            }]);
                            if (error) throw error;
                            showToast("Broadcast Sent to All Users! 🚀");
                            setBroadcastForm({ title: '', message: '', type: 'system', attachmentType: 'none', attachmentId: '', scheduled_post_date: '' });
                        } catch (err) {
                            console.error("Broadcast failed:", err);
                            showToast(`Failed: ${err.message || 'Check console'}`, "error");
                        }
                    }} className="p-8 md:p-10 space-y-8">
                        <div className="space-y-3">
                            <label className="text-sm font-black uppercase text-slate-500 ml-2">Notification Title</label>
                            <input required type="text" value={broadcastForm.title} onChange={e => setBroadcastForm({...broadcastForm, title: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="e.g. New Masterclass Dropped!" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-black uppercase text-slate-500 ml-2">Message Body</label>
                            <textarea required rows={3} value={broadcastForm.message} onChange={e => setBroadcastForm({...broadcastForm, message: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-lg font-bold outline-none text-white custom-scrollbar focus:border-indigo-500" placeholder="Write your announcement here..." />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase text-slate-500 ml-2">Icon / Type</label>
                                <select value={broadcastForm.type} onChange={e => setBroadcastForm({...broadcastForm, type: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-black text-white outline-none cursor-pointer focus:border-indigo-500">
                                    <option value="system">System (Info)</option>
                                    <option value="class">Class (Star)</option>
                                    <option value="shop">Shop (Bag)</option>
                                    <option value="alert">Alert (Bell)</option>
                                    <option value="success">Success (Check)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase text-slate-500 ml-2">Attachment Type</label>
                                <select value={broadcastForm.attachmentType} onChange={e => setBroadcastForm({...broadcastForm, attachmentType: e.target.value, attachmentId: ''})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-black text-white outline-none cursor-pointer focus:border-indigo-500">
                                    <option value="none">No Attachment</option>
                                    <option value="recipe">Link a Recipe</option>
                                    <option value="class">Link a Masterclass</option>
                                </select>
                            </div>
                        </div>

                        {broadcastForm.attachmentType === 'recipe' && (
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase text-slate-500 ml-2">Select Recipe</label>
                                <select required value={broadcastForm.attachmentId} onChange={e => setBroadcastForm({...broadcastForm, attachmentId: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold text-white outline-none cursor-pointer focus:border-indigo-500">
                                    <option value="" disabled>-- Choose Recipe --</option>
                                    {recipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                </select>
                            </div>
                        )}

                        {broadcastForm.attachmentType === 'class' && (
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase text-slate-500 ml-2">Select Masterclass</label>
                                <select required value={broadcastForm.attachmentId} onChange={e => setBroadcastForm({...broadcastForm, attachmentId: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold text-white outline-none cursor-pointer focus:border-indigo-500">
                                    <option value="" disabled>-- Choose Class --</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-black uppercase text-slate-500 ml-2">Scheduled Delivery Date (Optional)</label>
                            <input type="datetime-local" value={broadcastForm.scheduled_post_date || ''} onChange={e => setBroadcastForm({...broadcastForm, scheduled_post_date: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white appearance-none custom-scrollbar focus:border-indigo-500" />
                            <p className="text-xs text-slate-500 ml-2 mt-1 font-bold">If left blank, the notification will be sent immediately.</p>
                        </div>

                        <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-3">
                            <Send size={24} /> Blast Broadcast Now!
                        </button>
                    </form>
                </div>

                <div className="mt-12 space-y-6">
                    <h3 className="text-2xl md:text-3xl font-black mb-4 flex items-center gap-3"><Clock size={32} className="text-emerald-400"/> History & Scheduled</h3>
                    <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] overflow-hidden shadow-lg">
                        <div className="grid grid-cols-1 divide-y divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {adminBroadcasts.map(b => {
                                const isDraft = b.scheduled_post_date && new Date(b.scheduled_post_date) > new Date();
                                return (
                                <div key={b.id} className="p-6 hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h5 className="font-black text-lg text-white truncate">{b.title}</h5>
                                            {isDraft ? (
                                                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded border border-amber-500/30 flex items-center gap-1"><Clock size={12}/> Scheduled</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 size={12}/> Sent</span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 font-medium text-sm line-clamp-2">{b.message}</p>
                                        <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-500">
                                            <span>Created: {new Date(b.created_at).toLocaleDateString()}</span>
                                            {b.scheduled_post_date && <span className={isDraft ? "text-amber-400" : ""}>Scheduled for: {new Date(b.scheduled_post_date).toLocaleString()}</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => requestDelete('broadcasts', b.id, b.title)} className="w-12 h-12 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"><Trash2 size={20}/></button>
                                </div>
                            )})}
                            {adminBroadcasts.length === 0 && (
                                <div className="p-10 text-center text-slate-500 font-bold">
                                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                                    No broadcasts sent or scheduled yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* PLUGINS & APIS */}
          {activeTab === 'plugins' && (
            <div className="space-y-8">
               <div>
                  <h3 className="text-3xl md:text-4xl font-black mb-4">Plugins & Automation</h3>
                  <p className="text-lg text-slate-400 font-medium">Connect your site to the rest of the world.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-lg">
                      <h4 className="text-xl font-black mb-6 flex items-center gap-3"><Puzzle size={24} className="text-indigo-400"/> App Store</h4>
                      <div className="space-y-4">
                          {AVAILABLE_PLUGINS.map(plug => (
                              <div key={plug.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-colors ${settings.plugins?.[plug.id] ? 'bg-slate-800/50 border-indigo-500/30' : 'bg-slate-950 border-slate-800'}`}>
                                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-800"><plug.icon size={28} className={plug.color}/></div>
                                  <div className="flex-1 min-w-0">
                                      <h5 className="text-xl font-black text-white mb-1">{plug.name}</h5>
                                      <p className="text-sm text-slate-400 font-medium">{plug.desc}</p>
                                  </div>
                                  <button onClick={() => {
                                      const n = {...(settings.plugins || {}), [plug.id]: !settings.plugins?.[plug.id]};
                                      updateSettings({...settings, plugins: n});
                                      showToast(n[plug.id] ? `${plug.name} Connected!` : `${plug.name} Disconnected`);
                                  }} className={`w-16 h-8 rounded-full relative transition-colors border-2 ${settings.plugins?.[plug.id] ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-900 border-slate-700'}`} style={settings.plugins?.[plug.id] ? {backgroundColor: 'var(--accent)', borderColor: 'var(--accent)'} : {}}>
                                      <motion.div animate={{ x: settings.plugins?.[plug.id] ? 32 : 2 }} className="w-6 h-6 bg-white rounded-full absolute top-0.5" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="p-10 bg-slate-900 border-2 border-slate-800 rounded-[40px] flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                          <h4 className="text-2xl font-black flex items-center gap-3"><Key size={28} className="text-emerald-400"/> API Keys</h4>
                          <button onClick={generateApiKey} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full text-sm">Generate New</button>
                      </div>
                      <div className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-[32px] p-6 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
                          {(settings.apiKeys || []).map(k => (
                              <div key={k.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                          <p className="font-bold text-white text-lg">{k.name}</p>
                                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded border border-emerald-500/20">Active</span>
                                      </div>
                                      <code className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg block truncate font-bold">{k.key}</code>
                                  </div>
                                  <button onClick={() => removeApiKey(k.id)} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl"><Trash2 size={20}/></button>
                              </div>
                          ))}
                          {(!settings.apiKeys || settings.apiKeys.length === 0) && (
                              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                  <Link2 size={48} className="text-slate-700 mb-4" />
                                  <p className="text-lg font-bold text-slate-500">No API keys yet.</p>
                                  <p className="text-sm text-slate-600">Create one to connect external tools.</p>
                              </div>
                          )}
                      </div>
                  </div>
               </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-black mb-2">Settings</h3>
                        <p className="text-xl text-slate-400 font-medium">Control the core of your app.</p>
                    </div>
                    <button onClick={handleSaveSettings} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full shadow-xl flex items-center gap-3 text-lg active:scale-95 transition-all" style={{ backgroundColor: 'var(--accent)' }}>
                        <Save size={24}/> Save Changes
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-slate-800 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <h4 className="font-black text-xl uppercase tracking-widest text-slate-500 flex items-center gap-3"><DollarSign size={24} className="text-emerald-400"/> Custom Premium Tiers</h4>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-400">Accent Color</span>
                                <input type="color" value={settings.accentColor || '#4f46e5'} onChange={e => updateSettings({...settings, accentColor: e.target.value})} className="w-10 h-10 rounded-full cursor-pointer bg-slate-900 border-none outline-none overflow-hidden" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(settings.premiumTiers || []).map((tier, idx) => {
                                const style = getTierMeta(tier.name);
                                return (
                                <div key={tier.id} className="p-6 rounded-2xl border-4 bg-slate-950" style={{ borderColor: style.customColor ? `${style.customColor}40` : style.border.replace('border-', '').replace('/20', ''), boxShadow: style.customColor ? `0 10px 40px ${style.customColor}10` : 'none' }}>
                                    <div className="mb-4 space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                            <input type="text" value={tier.name} onChange={e => {
                                                const newTiers = [...settings.premiumTiers];
                                                newTiers[idx].name = e.target.value;
                                                updateSettings({ ...settings, premiumTiers: newTiers });
                                            }} className={`w-full bg-transparent text-xl font-black uppercase tracking-widest focus:outline-none`} style={{ color: style.customColor || style.hex }} placeholder="Tier Name" />
                                            <input type="color" value={tier.color || style.hex} onChange={e => {
                                                const newTiers = [...settings.premiumTiers];
                                                newTiers[idx].color = e.target.value;
                                                updateSettings({ ...settings, premiumTiers: newTiers });
                                            }} className="w-8 h-8 rounded-full cursor-pointer bg-slate-950 border-none shrink-0" title="Tier Color" />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl text-slate-600 font-black">$</span>
                                        <input type="number" step="0.01" value={tier.price} onChange={e => {
                                            const newTiers = [...settings.premiumTiers];
                                            newTiers[idx].price = e.target.value;
                                            updateSettings({ ...settings, premiumTiers: newTiers });
                                        }} className="w-full bg-transparent border-none pl-8 text-5xl font-black text-white focus:outline-none" />
                                    </div>
                                    <div className="relative mt-2">
                                        <label className="text-[10px] font-black uppercase text-emerald-500 ml-2 mb-1 block">Discount %</label>
                                        <span className="absolute right-4 top-[22px] text-emerald-500 font-black">%</span>
                                        <input type="number" min="0" max="100" value={tier.discount || 0} onChange={e => {
                                            const newTiers = [...settings.premiumTiers];
                                            newTiers[idx].discount = parseInt(e.target.value) || 0;
                                            updateSettings({ ...settings, premiumTiers: newTiers });
                                        }} className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl pl-4 pr-8 py-2 font-bold text-emerald-400 outline-none focus:border-emerald-500 text-sm" placeholder="Discount %" />
                                    </div>
                                    <div className="mt-4">
                                        <textarea value={tier.benefits} onChange={e => {
                                            const newTiers = [...settings.premiumTiers];
                                            newTiers[idx].benefits = e.target.value;
                                            updateSettings({ ...settings, premiumTiers: newTiers });
                                        }} rows="2" className="w-full bg-slate-900 text-sm font-medium text-slate-400 p-4 rounded-2xl border border-slate-800 outline-none custom-scrollbar" placeholder="Benefits (comma separated)"></textarea>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-slate-800 space-y-6 mt-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <h4 className="font-black text-xl uppercase tracking-widest text-slate-500 flex items-center gap-3"><Book size={24} className="text-amber-400"/> Volume Management</h4>
                            <button onClick={() => updateSettings({ ...settings, volumes: [...(settings.volumes || []), { id: 'v' + Date.now(), name: 'New Volume', price: '9.99', discount: 0 }] })} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black text-sm flex items-center gap-2 transition-all"><Plus size={16}/> Add Volume</button>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                            {(settings.volumes || []).map((vol, idx) => (
                                <div key={vol.id} className="p-6 bg-slate-950 border-2 border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-4">
                                    <div className="flex-1 w-full space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-500 ml-2">Volume Name</label>
                                        <input type="text" value={vol.name} onChange={e => {
                                            const newVols = [...(settings.volumes || [])];
                                            newVols[idx].name = e.target.value;
                                            updateSettings({ ...settings, volumes: newVols });
                                        }} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 font-bold text-white outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="w-full md:w-32 space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-500 ml-2">Base Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
                                            <input type="number" step="0.01" value={vol.price} onChange={e => {
                                                const newVols = [...(settings.volumes || [])];
                                                newVols[idx].price = e.target.value;
                                                updateSettings({ ...settings, volumes: newVols });
                                            }} className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 font-bold text-white outline-none focus:border-indigo-500" />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-32 space-y-2">
                                        <label className="text-xs font-black uppercase text-emerald-500 ml-2">Discount %</label>
                                        <div className="relative">
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">%</span>
                                            <input type="number" min="0" max="100" value={vol.discount} onChange={e => {
                                                const newVols = [...(settings.volumes || [])];
                                                newVols[idx].discount = parseInt(e.target.value) || 0;
                                                updateSettings({ ...settings, volumes: newVols });
                                            }} className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl pl-4 pr-8 py-3 font-bold text-emerald-400 outline-none focus:border-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 pt-6">
                                        <button onClick={() => {
                                            const newVols = (settings.volumes || []).filter((_, i) => i !== idx);
                                            updateSettings({ ...settings, volumes: newVols });
                                        }} className="w-12 h-12 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl flex items-center justify-center transition-colors"><Trash2 size={20}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="p-8 md:p-10 rounded-[40px] bg-slate-900 border-2 border-slate-800 space-y-8">
                            <h4 className="font-black text-2xl uppercase tracking-widest text-slate-500 flex items-center gap-3"><Settings size={28} className="text-indigo-400"/> The Basics</h4>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-black uppercase text-slate-500 block mb-3 ml-2">Name of your site</label>
                                    <input type="text" value={settings.siteName} onChange={e => updateSettings({...settings, siteName: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" />
                                </div>
                                <div className="p-6 bg-rose-500/10 border-2 border-rose-500/20 rounded-[32px] flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-black text-rose-400">Lock the site?</p>
                                        <p className="text-xs text-rose-400/60 font-bold uppercase mt-1">Maintenance mode</p>
                                    </div>
                                    <button onClick={() => updateSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-16 h-8 rounded-full relative transition-colors border-2 ${settings.maintenanceMode ? 'bg-rose-500 border-rose-500' : 'bg-slate-950 border-slate-700'}`}>
                                        <motion.div animate={{ x: settings.maintenanceMode ? 32 : 2 }} className="w-6 h-6 bg-white rounded-full absolute top-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 rounded-[40px] bg-slate-900 border-2 border-slate-800 space-y-8">
                            <h4 className="font-black text-2xl uppercase tracking-widest text-slate-500 flex items-center gap-3"><ImageIcon size={28} className="text-amber-400"/> Hero Layout</h4>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-black uppercase text-slate-500 block mb-3 ml-2">Main Headline</label>
                                    <input type="text" value={settings.heroTitle} onChange={e => updateSettings({...settings, heroTitle: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-2 rounded-full border border-slate-800">
                                    <button onClick={() => updateSettings({...settings, heroMediaType: 'image'})} className={`py-3 rounded-full font-bold text-sm transition-all ${(!settings.heroMediaType || settings.heroMediaType === 'image') ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><ImageIcon size={16} className="inline mr-2"/> Image</button>
                                    <button onClick={() => updateSettings({...settings, heroMediaType: 'video'})} className={`py-3 rounded-full font-bold text-sm transition-all ${settings.heroMediaType === 'video' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><PlayCircle size={16} className="inline mr-2"/> Auto-Video</button>
                                </div>
                                <div className="space-y-2">
                                    <ImageUploader 
                                        label={settings.heroMediaType === 'video' ? "Background Video (MP4)" : "Background Image (JPG/PNG)"} 
                                        value={settings.heroMediaUrl || ''} 
                                        onChange={val => updateSettings({...settings, heroMediaUrl: val})} 
                                    />
                                    {settings.heroMediaType === 'video' && <p className="text-xs text-amber-500 font-bold mt-2 ml-4">Video will automatically play muted in the background.</p>}
                                </div>

                                <div className="p-6 bg-slate-950 border-2 border-slate-800 rounded-[32px] mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-lg font-black text-white">Top Banner</p>
                                        <button onClick={() => updateSettings({...settings, bannerEnabled: !settings.bannerEnabled})} className={`w-16 h-8 rounded-full relative transition-colors border-2 ${settings.bannerEnabled ? 'bg-amber-500 border-amber-500' : 'bg-slate-950 border-slate-700'}`}>
                                            <motion.div animate={{ x: settings.bannerEnabled ? 32 : 2 }} className="w-6 h-6 bg-white rounded-full absolute top-0.5" />
                                        </button>
                                    </div>
                                    <textarea rows={2} value={settings.bannerText} onChange={e => updateSettings({...settings, bannerText: e.target.value})} className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none text-white focus:border-indigo-500 custom-scrollbar" placeholder="Type your announcement here..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
