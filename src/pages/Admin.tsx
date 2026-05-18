import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, TrendingUp, ShieldAlert } from 'lucide-react';

import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';
import { useAllUsers } from '../hooks/useAllUsers';
import { useAppSettings } from '../hooks/useAppSettings';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { useMedia } from '../hooks/useMedia';

import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import OrdersManager from '../components/admin/OrdersManager';
import MediaStudio from '../components/admin/MediaStudio';
import RecipeManager from '../components/admin/tabs/RecipeManager';
import ClassStudio from '../components/admin/tabs/ClassStudio';
import MemberDirectory from '../components/admin/tabs/MemberDirectory';
import PlatformSettings from '../components/admin/tabs/PlatformSettings';
import BroadcastCenter from '../components/admin/tabs/BroadcastCenter';
import RecipeImporter from '../components/admin/tabs/RecipeImporter';

import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminOverview from '../components/admin/AdminOverview';
import { Toast, ConfirmModal, UnlockModal, GenericConfirmModal } from '../components/admin/AdminModals';

export default function CWCPlusCommandCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [godMode, setGodMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [adminBroadcasts, setAdminBroadcasts] = useState<any[]>([]);
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [unlockContext, setUnlockContext] = useState<{ isOpen: boolean; itemType: string; itemId: string; itemName: string; action: string; userId: string | null }>({ isOpen: false, itemType: '', itemId: '', itemName: '', action: 'unlock', userId: null });
  const [deleteContext, setDeleteContext] = useState({ isOpen: false, coll: '', id: '', title: '' });

  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { classes, addClass, updateClass, deleteClass } = useClasses();
  const { users: people, addUser, removeUser, updateUser, updateUserTier } = useAllUsers();
  const { settings, updateSettings } = useAppSettings();
  const { media } = useMedia();
  const { user } = useUser();

  const showToast = (msg: string, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const requestDelete = (coll: string, id: string, title: string) => setDeleteContext({ isOpen: true, coll, id, title });

  const handleConfirmDelete = async () => {
    try {
      if (deleteContext.coll === 'recipes') await deleteRecipe(deleteContext.id);
      else if (deleteContext.coll === 'classes') await deleteClass(deleteContext.id);
      else if (deleteContext.coll === 'people') await removeUser(deleteContext.id);
      else if (deleteContext.coll === 'broadcasts') {
        const { error } = await supabase.from('notifications').delete().eq('id', deleteContext.id);
        if (error) throw error;
        setAdminBroadcasts(prev => prev.filter(b => b.id !== deleteContext.id));
      }
      showToast("Asset Terminated Successfully");
      setDeleteContext({ isOpen: false, coll: '', id: '', title: '' });
    } catch (err: any) { showToast("Termination failed: " + err.message, "error"); }
  };

  const handleConfirmUnlock = async () => {
    try {
      const userToUpdate = people.find((p: any) => p.id === unlockContext.userId);
      if (!userToUpdate) throw new Error("User not found");
      let updates = {};
      if (unlockContext.itemType === 'volume') {
        const current = userToUpdate.unlocked_volumes || [];
        const next = unlockContext.action === 'unlock' ? [...new Set([...current, unlockContext.itemId])] : current.filter((v: any) => v !== unlockContext.itemId);
        updates = { unlocked_volumes: next };
      } else if (unlockContext.itemType === 'class') {
        const current = userToUpdate.unlocked_classes || [];
        const next = unlockContext.action === 'unlock' ? [...new Set([...current, unlockContext.itemId])] : current.filter((c: any) => c !== unlockContext.itemId);
        updates = { unlocked_classes: next };
      }
      await updateUser(unlockContext.userId as string, updates);
      showToast(`${unlockContext.action === 'unlock' ? 'Access Granted' : 'Access Revoked'} for ${userToUpdate.name}`);
      setUnlockContext({ isOpen: false, itemType: '', itemId: '', itemName: '', action: 'unlock', userId: null });
    } catch (err: any) { showToast("Access Override Failed: " + err.message, "error"); }
  };

  const handleMediaSync = async () => {
    setIsSavingMedia(true);
    try { showToast("Media Vault Synchronized"); } 
    catch (err: any) { showToast("Sync Error: " + err.message, "error"); } 
    finally { setIsSavingMedia(false); }
  };

  const sendBroadcast = async (data: any) => {
    const payload = { ...data };
    if (!payload.scheduled_post_date) {
      delete payload.scheduled_post_date;
    } else {
      payload.scheduled_post_date = new Date(payload.scheduled_post_date).toISOString();
    }
    const { error } = await supabase.from('notifications').insert([{ ...payload, user_id: null, created_at: new Date().toISOString() }]);
    if (error) throw error;
    fetchBroadcasts();
  };

  const fetchBroadcasts = async () => {
    const { data, error } = await supabase.from('notifications').select('*').is('user_id', null).order('created_at', { ascending: false });
    if (!error) setAdminBroadcasts(data as any);
  };

  useEffect(() => { fetchBroadcasts(); }, []);

  const generateApiKey = async () => {
    const newKey = { id: Date.now(), name: 'Live Integration ' + ((settings.apiKeys?.length || 0) + 1), key: 'cwc_' + Math.random().toString(36).substring(2, 15) };
    await updateSettings({ ...settings, apiKeys: [...(settings.apiKeys || []), newKey] });
    showToast("New API Key Provisioned");
  };

  const removeApiKey = async (id: number) => {
    await updateSettings({ ...settings, apiKeys: settings.apiKeys.filter((k: any) => k.id !== id) });
    showToast("API Key Revoked");
  };

  const handleWipeAll = async () => {
    if (selectedItems.size > 0) {
      for (const id of Array.from(selectedItems)) {
        if (activeTab === 'recipes') await deleteRecipe(id as string);
        else if (activeTab === 'classes') await deleteClass(id as string);
        else if (activeTab === 'people') await removeUser(id as string);
      }
      setSelectedItems(new Set());
      showToast(`${selectedItems.size} Assets Vaporized`);
    } else { showToast("Massive Wipe Engaged", "error"); }
    setWipeConfirm(false);
  };

  const mrr = useMemo(() => people.reduce((acc: number, p: any) => {
    if (p.subscriptionTier === 'Free') return acc;
    const tier = settings?.premiumTiers?.find((t: any) => t.name === p.subscriptionTier);
    return acc + (tier ? parseFloat(tier.price) : 0);
  }, 0), [people, settings.premiumTiers]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'recipes', 'import', 'classes', 'media', 'people', 'broadcasts', 'settings', 'orders'].includes(tab)) setActiveTab(tab);
  }, []);

  return (
    <div className="flex h-screen bg-base text-text-1 font-sans selection:bg-accent/30 selection:text-text-1">
      <AdminSidebar isMobileOpen={isMobileOpen} activeTab={activeTab} handleTabChange={handleTabChange} />
      
      <div className="flex-1 flex flex-col lg:ml-72 min-w-0 bg-surface">
        <AdminHeader activeTab={activeTab} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} mrr={mrr} user={user} godMode={godMode} setGodMode={setGodMode} setSelectedItems={setSelectedItems} showToast={showToast} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar pb-24">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-black text-text-1 italic tracking-tighter uppercase leading-none">Command Center</h2>
                  <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.4em] mt-2">Platform Health & Global Intelligence</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDashboardTab('overview')} className={`h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border ${dashboardTab === 'overview' ? 'bg-accent border-accent text-text-1 shadow-xl shadow-accent/20' : 'text-text-3 border-glass-border hover:border-border hover:text-text-1'}`}><LayoutDashboard size={14} /> Intelligence Overview</button>
                  <button onClick={() => setDashboardTab('analytics')} className={`h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border ${dashboardTab === 'analytics' ? 'bg-accent border-accent text-text-1 shadow-xl shadow-accent/20' : 'text-text-3 border-glass-border hover:border-border hover:text-text-1'}`}><TrendingUp size={14} /> Global Analytics</button>
                </div>
              </div>
              {dashboardTab === 'analytics' && <div className="bg-base/50 border border-glass-border rounded-[3rem] p-12 animate-in slide-in-from-bottom duration-700">
                {/* @ts-expect-error Ignoring legacy prop mismatch from JSX component */}
                <AnalyticsDashboard recipes={recipes} classes={classes} people={people} settings={settings} mrr={mrr} />
              </div>}
              {dashboardTab === 'overview' && <AdminOverview people={people} mrr={mrr} recipes={recipes} classes={classes} settings={settings} handleTabChange={handleTabChange} />}
            </div>
          )}

          {activeTab === 'orders' && <OrdersManager searchQuery={searchQuery} />}
          {activeTab === 'media' && <MediaStudio onSync={handleMediaSync} isSyncing={isSavingMedia} />}
          {activeTab === 'recipes' && <RecipeManager recipes={recipes} addRecipe={addRecipe} updateRecipe={updateRecipe} deleteRecipe={deleteRecipe} media={media} settings={settings} requestDelete={requestDelete} showToast={showToast} godMode={godMode} selectedItems={selectedItems} toggleSelection={toggleSelection} searchQuery={searchQuery} />}
          {activeTab === 'classes' && <ClassStudio classes={classes} addClass={addClass} updateClass={updateClass} deleteClass={deleteClass} media={media} settings={settings} requestDelete={requestDelete} showToast={showToast} godMode={godMode} selectedItems={selectedItems} toggleSelection={toggleSelection} searchQuery={searchQuery} />}
          {activeTab === 'people' && <MemberDirectory people={people} addUser={addUser} updateUser={updateUser} updateUserTier={updateUserTier} removeUser={removeUser} settings={settings} classes={classes} requestDelete={requestDelete} showToast={showToast} godMode={godMode} selectedItems={selectedItems} toggleSelection={toggleSelection} searchQuery={searchQuery} setUnlockContext={setUnlockContext} />}
          {activeTab === 'broadcasts' && (
            // @ts-expect-error Ignoring legacy prop mismatch from JSX component
            <BroadcastCenter adminBroadcasts={adminBroadcasts} recipes={recipes} classes={classes} people={people} sendBroadcast={sendBroadcast} requestDelete={requestDelete} showToast={showToast} godMode={godMode} selectedItems={selectedItems} toggleSelection={toggleSelection} />
          )}
          {activeTab === 'import' && <RecipeImporter showToast={showToast} />}
          {activeTab === 'settings' && <PlatformSettings settings={settings} updateSettings={updateSettings} generateApiKey={generateApiKey} removeApiKey={removeApiKey} showToast={showToast} />}
        </main>

        <AnimatePresence>{toasts.map(t => <Toast key={t.id} message={t.msg} type={t.type} onClose={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))} />)}</AnimatePresence>
        <ConfirmModal isOpen={deleteContext.isOpen} title="Vaporize Asset?" message={`Are you sure you want to delete "${deleteContext.title}"? This cannot be undone.`} onConfirm={handleConfirmDelete} onCancel={() => setDeleteContext({ isOpen: false, coll: '', id: '', title: '' })} />
        <UnlockModal isOpen={unlockContext.isOpen} context={unlockContext} onConfirm={handleConfirmUnlock} onCancel={() => setUnlockContext({ ...unlockContext, isOpen: false })} />
        <GenericConfirmModal isOpen={wipeConfirm} title="ULTIMATE ANNIHILATION" message={`Are you absolutely sure you want to PERMANENTLY WIPE EVERYTHING in the ${activeTab} category? This action is irreversible.`} onConfirm={handleWipeAll} onCancel={() => setWipeConfirm(false)} confirmText="Yes, Wipe Everything" confirmColor="bg-danger hover:bg-danger/80" icon={ShieldAlert} />

        <AnimatePresence>
          {godMode && selectedItems.size > 0 && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-base border-2 border-danger/30 rounded-[30px] p-4 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl min-w-[400px]">
              <div className="pl-4"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Selected Payload</p><p className="text-xl font-black text-text-1">{selectedItems.size} <span className="text-danger">Assets</span></p></div>
              <div className="flex-1" />
              <div className="flex gap-2">
                <button onClick={() => setSelectedItems(new Set())} className="px-6 py-3 bg-glass-bg hover:bg-elevated rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-3 border border-glass-border">Clear</button>
                <button onClick={() => { if (confirm(`WIPE ${selectedItems.size} ASSETS FROM EXISTENCE?`)) handleWipeAll(); }} className="px-6 py-3 bg-danger hover:bg-danger/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-1 shadow-lg shadow-danger/20">Vaporize Selected</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
