import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ChefHat, Settings, Plus, Save, Image as ImageIcon,
  DollarSign, Trash2, Edit3, X, Video, Users, UserPlus,
  Search, Star, Clock, Flame, CreditCard, Mail, Zap, Puzzle, Key, Link2, Wand2,
  Package, ShoppingBag, Eye, EyeOff, PlayCircle, ShieldAlert, Book, Bell, Send, CheckCircle2, LockKeyhole as LockIcon, Unlock, MessageCircle, BarChart, Smartphone, Loader2,
  ChevronDown, Layout, Film, BookOpen, Layers, Globe, Library
} from 'lucide-react';

import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';
import { useAllUsers } from '../hooks/useAllUsers';
import { useAppSettings } from '../hooks/useAppSettings';
import { useMerch } from '../hooks/useMerch';
import { useDevicePerformance } from '../hooks/useDevicePerformance';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { useMedia } from '../hooks/useMedia';
import { JankFreeButton, Skeleton, OptimizedImage } from '../components/PerformanceUI';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import OrdersManager from '../components/admin/OrdersManager';
import ContentCurator from '../components/admin/ContentCurator';
import MediaStudio from '../components/admin/MediaStudio';
import MediaPickerModal from '../components/admin/MediaPickerModal';
import { TrendingUp, GripVertical } from 'lucide-react';
import { CURRENCIES, CURRENCY_GROUPS } from '../lib/currency';

const MediaUploader = ({ value, onChange, label = "Select Media Asset" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-black uppercase text-slate-500 ml-2">{label}</label>
      <div className="flex gap-4 items-center">
        {value && (
          <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900">
            {typeof value === 'string' && value.includes('.mp4') ? <video src={value} className="w-full h-full object-cover" /> : <img src={typeof value === 'string' ? value : value?.thumb_url || value?.hero_url} className="w-full h-full object-cover" />}
          </div>
        )}
        <div className="flex-1 relative">
          <input
            type="text"
            readOnly
            value={typeof value === 'string' ? value : value?.filename || ''}
            className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-sm md:text-lg font-bold outline-none text-white pr-[160px] cursor-pointer"
            onClick={() => setIsModalOpen(true)}
            placeholder="Click to select from Library ->"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button type="button" onClick={() => setIsModalOpen(true)} className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase px-4 py-3 rounded-full transition-colors inline-block shadow-lg whitespace-nowrap">
              Open Library
            </button>
          </div>
        </div>
      </div>
      <MediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(mediaObj) => {
          onChange(mediaObj); // Pass full media object to be saved as cover_image_id
        }}
      />
    </div>
  );
};

const AVAILABLE_PLUGINS = [
  { id: 'stripe', name: 'Stripe Payments', icon: CreditCard, desc: 'Process credit cards globally.', color: 'text-indigo-400' },
  { id: 'hitpay', name: 'HitPay Gateway', icon: Smartphone, desc: 'Process payments via PayNow & FPX.', color: 'text-rose-400' },
  { id: 'whatsapp', name: 'WhatsApp Bot', icon: MessageCircle, desc: 'Send automated alerts to members.', color: 'text-indigo-400' },
  { id: 'discord', name: 'Discord Sync', icon: Zap, desc: 'Sync premium members to roles.', color: 'text-indigo-500' },
  { id: 'google_analytics', name: 'Google Analytics', icon: BarChart, desc: 'Track visitor traffic & behavior.', color: 'text-amber-500' },
  { id: 'mailchimp', name: 'Mailchimp Sync', icon: Mail, desc: 'Auto-sync members to mailing lists.', color: 'text-yellow-400' },
  { id: 'zapier', name: 'Zapier Webhooks', icon: Zap, desc: 'Connect platform events to 5,000+ apps.', color: 'text-orange-500' }
];

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 border-2 backdrop-blur-2xl ${type === 'success' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100' : 'bg-rose-500/20 border-rose-500/50 text-rose-100'
      }`}
  >
    <div className={`p-2 rounded-full ${type === 'success' ? 'bg-indigo-500' : 'bg-rose-500'} text-white`}>
      {type === 'success' ? <span className="font-bold">✓</span> : <span className="font-bold">!</span>}
    </div>
    <span className="font-extrabold text-lg tracking-wide">{message}</span>
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={20} /></button>
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
          <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{title}</h3>
          <p className="text-slate-400 font-bold mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20">Yes, Trash It</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const GenericConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", confirmColor = "bg-rose-600", icon: Icon = Trash2 }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onCancel} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700/50 rounded-[40px] p-8 md:p-10 shadow-2xl text-center">
          <div className={`w-20 h-20 ${confirmColor.includes('rose') ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-500/20 text-indigo-500'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Icon size={40} />
          </div>
          <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{title}</h3>
          <p className="text-slate-400 font-bold mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Cancel</button>
            <button onClick={onConfirm} className={`flex-1 py-4 ${confirmColor} text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl`}>{confirmText}</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);


export default function EmpireCommandCenter() {
  const { user } = useUser();
  const { isLowEnd, adaptive } = useDevicePerformance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { classes, addClass, updateClass, deleteClass } = useClasses();
  const { users: people, addUser, removeUser, updateUserTier, updateUser } = useAllUsers();
  const { settings, updateSettings } = useAppSettings();
  const { merch, addProduct, updateProduct, deleteProduct } = useMerch();
  const { media } = useMedia();

  // Sync tab with URL for refresh persistence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'recipes', 'classes', 'merch', 'users', 'broadcasts', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsCreating(false);
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  const [isCreating, setIsCreating] = useState(false);
  const [recipeForm, setRecipeForm] = useState({ title: '', author: 'Abid Nasa', time: '30 min', image: null, video: '', category: 'Mains', difficulty: 'Beginner', baseServings: 2, ingredients: [{ name: '', amount: '' }], steps: [''], notes: [''], tags: [], status: 'published', isFeatured: false, volume: 'CWC Original', scheduled_post_date: '' });
  const [classForm, setClassForm] = useState({ title: '', instructor: 'Abid Nasa', duration: '', price: '19.99', category: 'Masterclass', image: null, video: '', live_link: '', status: 'published', isFeatured: false, tierRequired: settings.premiumTiers?.[0]?.name || 'Premium', ingredients: [{ name: '', amount: '' }], steps: [''], notes: [''], tags: [], attachments: [], scheduled_post_date: '', live_date: '', live_duration_hours: 2 });
  const [merchForm, setMerchForm] = useState({ title: '', price: '', image: null, description: '', status: 'published', stock: 10, scheduled_post_date: '' });
  const [personForm, setPersonForm] = useState({ id: null, name: '', email: '', subscriptionTier: 'Free', role: 'user', unlockedVolumes: [], unlockedClasses: [] });
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'system', attachmentType: 'none', attachmentId: '', scheduled_post_date: '' });
  const [stagingData, setStagingData] = useState({ type: null, items: [] });
  const [rawText, setRawText] = useState("");
  const [deleteContext, setDeleteContext] = useState({ isOpen: false, coll: '', id: '', title: '' });
  const [unlockContext, setUnlockContext] = useState({ isOpen: false, itemType: '', itemId: '', itemName: '', action: '' });
  const [adminBroadcasts, setAdminBroadcasts] = useState([]);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [classFormSection, setClassFormSection] = useState('identity');
  const [visiblePeopleCount, setVisiblePeopleCount] = useState(20);
  const [visibleRecipesCount, setVisibleRecipesCount] = useState(20);
  const [activeVolume, setActiveVolume] = useState('All');
  const [godMode, setGodMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [attachmentPickerIdx, setAttachmentPickerIdx] = useState(null);

  const fRecipes = useMemo(() => recipes.filter(r =>
    (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeVolume === 'All' || r.volume === activeVolume)
  ), [recipes, searchQuery, activeVolume]);
  const fPeople = useMemo(() => people.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())), [people, searchQuery]);
  const fClasses = useMemo(() => classes.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())), [classes, searchQuery]);
  const fMerch = useMemo(() => merch.filter(m => (m.title || '').toLowerCase().includes(searchQuery.toLowerCase())), [merch, searchQuery]);

  const toggleSelection = (id) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const selectAll = () => {
    let currentList = [];
    if (activeTab === 'recipes') currentList = fRecipes;
    else if (activeTab === 'classes') currentList = fClasses;
    else if (activeTab === 'merch') currentList = fMerch;

    if (selectedItems.size === currentList.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentList.map(item => item.id)));
    }
  };

  const executeBulkDelete = async () => {
    const ids = Array.from(selectedItems);
    if (ids.length === 0) return;

    let table = '';
    if (activeTab === 'recipes') table = 'recipes';
    else if (activeTab === 'classes') table = 'classes';
    else if (activeTab === 'merch') table = 'merch';
    else if (activeTab === 'broadcasts') table = 'notifications';

    if (!table) return;

    try {
      const { error } = await supabase.from(table).delete().in('id', ids);
      if (error) throw error;

      showToast(`DELETED ${ids.length} ASSETS PERMANENTLY! 💀`);
      setSelectedItems(new Set());
    } catch (err) {
      showToast("Bulk deletion failed: " + err.message, "error");
    }
  };

  const executeWipeAll = async () => {
    let table = '';
    if (activeTab === 'recipes') table = 'recipes';
    else if (activeTab === 'classes') table = 'classes';
    else if (activeTab === 'merch') table = 'merch';
    else if (activeTab === 'broadcasts') table = 'notifications';

    if (!table) return;

    try {
      // Safely wipe everything
      const { error } = await supabase.from(table).delete().not('id', 'is', null);
      if (error) throw error;

      showToast(`TOTAL ANNIHILATION COMPLETE! ☢️`);
      setSelectedItems(new Set());
      setWipeConfirm(false);
    } catch (err) {
      showToast("Wipe failed: " + err.message, "error");
    }
  };

  const handleMediaSync = async (payload) => {
    setIsSavingMedia(true);
    try {
      let uploadCount = 0;
      // Upload images to Supabase storage
      for (const img of payload.images) {
        try {
          const res = await fetch(img.url);
          const blob = await res.blob();
          const file = new File([blob], img.systemFileName, { type: blob.type || 'image/webp' });
          const filePath = `uploads/${img.systemFileName}`;
          const { error } = await supabase.storage.from('public-assets').upload(filePath, file, { upsert: true });
          if (!error) {
            const { data: publicUrlData } = supabase.storage.from('public-assets').getPublicUrl(filePath);
            const publicUrl = publicUrlData.publicUrl;

            const { error: dbError } = await supabase.from('media_library').insert([{
              filename: img.displayName,
              hero_url: publicUrl,
              thumb_url: img.variants?.thumb || publicUrl,
              card_url: img.variants?.card || publicUrl,
              dominant_color: img.dominantColor,
              seo_schema: img.schemaSnippet,
              type: 'image'
            }]);

            if (dbError) throw dbError;
            uploadCount++;
          } else {
            throw error;
          }
        } catch (err) {
          console.error("Failed to upload image", err);
          showToast(`Failed to upload image: ${err.message}`, "error");
        }
      }

      // Store video metadata in media library
      for (const vid of payload.videos) {
        try {
          const { error } = await supabase.from('media_library').insert([{
            filename: vid.displayName,
            hero_url: `https://www.youtube.com/watch?v=${vid.yt_id}`,
            thumb_url: vid.thumbnail_url,
            card_url: vid.thumbnail_url,
            type: 'video'
          }]);
          if (error) throw error;
          uploadCount++;
        } catch (err) {
          console.error("Failed to save video metadata", err);
          showToast(`Failed to save video: ${err.message}`, "error");
        }
      }

      // Upload generic files (PDFs, docs) to Supabase storage
      for (const f of (payload.files || [])) {
        try {
          const res = await fetch(f.url);
          const blob = await res.blob();
          const file = new File([blob], f.systemFileName, { type: blob.type || f.mimeType });
          const filePath = `documents/${f.systemFileName}`;

          const { error: uploadError } = await supabase.storage.from('public-assets').upload(filePath, file, { upsert: true });
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from('public-assets').getPublicUrl(filePath);
          const publicUrl = publicUrlData.publicUrl;

          const { error: dbError } = await supabase.from('media_library').insert([{
            filename: f.displayName,
            hero_url: publicUrl,
            type: 'file',
            meta_data: { size: f.size, mimeType: f.mimeType }
          }]);

          if (dbError) throw dbError;
          uploadCount++;
        } catch (err) {
          console.error("Failed to upload document", err);
          showToast(`Failed to upload document: ${err.message}`, "error");
        }
      }

      if (uploadCount > 0) {
        showToast(`Synced ${uploadCount} media assets to Empire CMS! 🚀`);
      }
    } catch (err) {
      showToast("Error syncing media: " + err.message, "error");
    } finally {
      setIsSavingMedia(false);
    }
  };

  const fetchAdminBroadcasts = async () => {
    const { data } = await supabase.from('notifications')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false });
    if (data) setAdminBroadcasts(data);
  };

  useEffect(() => {
    if (activeTab === 'broadcasts') {
      fetchAdminBroadcasts();
      const channelName = 'admin_broadcasts_changes_' + Math.random().toString(36).substring(2, 9);
      const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
          fetchAdminBroadcasts();
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [activeTab]);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  const advancedMultiParse = (rawText) => {
    if (!rawText.trim()) return [];

    // Line deduplication: Clean and unique lines to prevent accidental double-pastes
    const rawLines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
    const lines = [];
    const seenLines = new Set();
    rawLines.forEach(l => {
      // Filter out page markers like "Page 1", "Page 2"
      if (l.toLowerCase().match(/^page\s*\d+$/)) return;

      // Keep subtitles even if they look similar, but deduplicate actual steps/ingredients
      if (l.endsWith(':') || (l.startsWith('---') && l.endsWith('---')) || !seenLines.has(l.toLowerCase())) {
        lines.push(l);
        if (l.length > 10) seenLines.add(l.toLowerCase()); // Only dedupe significant content
      }
    });

    const recipes = [];
    const seenTitles = new Set();
    let currentRecipe = null;
    let mode = 'desc';

    const isSubtitle = (text) => {
      const t = text.trim();
      if (!t) return false;
      if (t.endsWith(':')) return true;
      if (t.startsWith('---') && t.endsWith('---')) return true;
      // All caps short line is likely a header
      return t.length < 40 && t.length > 2 && !/[\d]/.test(t) && t === t.toUpperCase();
    };

    // Metadata extraction triggers
    const metaTriggers = {
      instructor: ['INSTRUCTOR:', 'CHEF:', 'BY:', 'GURU:', 'MAESTRO:'],
      category: ['CATEGORY:', 'TYPE:', 'KATEGORI:'],
      price: ['PRICE:', 'HARGA:', 'RM', '$'],
      tier: ['TIER:', 'ACCESS:', 'LEVEL:', 'KEAHLIAN:']
    };

    lines.forEach(l => {
      const low = l.toLowerCase();
      const upper = l.toUpperCase();

      // 1. Metadata Extraction (High Priority)
      let metaFound = false;
      for (const trigger of metaTriggers.instructor) {
        if (upper.startsWith(trigger)) {
          if (!currentRecipe) currentRecipe = { title: 'Untitled Production', ingredients: [], steps: [], notes: [], tags: [], instructor: '', category: 'Masterclass', price: '19.99', tier_required: 'Premium' };
          currentRecipe.instructor = l.substring(trigger.length).trim();
          metaFound = true; break;
        }
      }
      if (!metaFound) {
        for (const trigger of metaTriggers.category) {
          if (upper.startsWith(trigger)) {
            if (!currentRecipe) currentRecipe = { title: 'Untitled Production', ingredients: [], steps: [], notes: [], tags: [], instructor: '', category: 'Masterclass', price: '19.99', tier_required: 'Premium' };
            currentRecipe.category = l.substring(trigger.length).trim();
            metaFound = true; break;
          }
        }
      }
      if (!metaFound) {
        for (const trigger of metaTriggers.price) {
          if (upper.includes(trigger)) {
            if (!currentRecipe) currentRecipe = { title: 'Untitled Production', ingredients: [], steps: [], notes: [], tags: [], instructor: '', category: 'Masterclass', price: '19.99', tier_required: 'Premium' };
            const priceMatch = l.match(/(\d+[\.,]\d+|\d+)/);
            if (priceMatch) currentRecipe.price = priceMatch[0];
            metaFound = true; break;
          }
        }
      }
      if (!metaFound) {
        for (const trigger of metaTriggers.tier) {
          if (upper.startsWith(trigger)) {
            if (!currentRecipe) currentRecipe = { title: 'Untitled Production', ingredients: [], steps: [], notes: [], tags: [], instructor: '', category: 'Masterclass', price: '19.99', tier_required: 'Premium' };
            const tierVal = l.substring(trigger.length).trim();
            if (['Free', 'Basic', 'Plus', 'Premium', 'VIP'].includes(tierVal)) {
              currentRecipe.tier_required = tierVal;
            }
            metaFound = true; break;
          }
        }
      }
      if (metaFound) return;

      // 2. Detect Title (All Caps)
      const isTitle = l === l.toUpperCase() && l.match(/[A-Z]/) &&
        !low.includes('bahan') && !low.includes('cara') &&
        !low.includes('nota') && !low.includes('langkah') &&
        !low.includes('step') && l.length > 3;

      if (isTitle) {
        if (seenTitles.has(l)) return; // Skip duplicate recipes
        if (currentRecipe) recipes.push(currentRecipe);
        currentRecipe = {
          title: l,
          instructor: '',
          category: 'Masterclass',
          price: '19.99',
          tier_required: 'Premium',
          ingredients: [],
          steps: [],
          notes: [],
          tags: []
        };
        seenTitles.add(l);
        mode = 'desc';
        return;
      }

      // Mode Switching - Enhanced Differentiation
      const isIngTrigger = low.match(/\bbahan\b/) || low.includes('ingredient') || low.includes('ramuan');
      const isStepTrigger = low.match(/\bcara\b/) || low.match(/\blangkah\b/) || low.match(/\bstep\b/) || low.includes('instruction') || low.includes('method') || low.includes('penyediaan');
      const isNoteTrigger = low.match(/\bnota\b/) || low.match(/\btip\b/) || low.includes('extra') || low.includes('peralatan') || low.includes('equipment') || low.includes('hiasan');

      if (isIngTrigger) {
        mode = 'ing';
        if (l.includes(':') || l.length > 10) {
          currentRecipe.ingredients.push({ amount: '', name: `--- ${l.toUpperCase()} ---` });
        }
        return;
      }
      if (isStepTrigger) {
        mode = 'steps';
        if (l.includes(':') || l.length > 10) {
          currentRecipe.steps.push(`--- ${l.toUpperCase()} ---`);
        }
        return;
      }
      if (isNoteTrigger) {
        mode = 'notes';
        if (l.includes(':') || l.length > 5) {
          currentRecipe.notes.push(`--- ${l.toUpperCase()} ---`);
        }
        return;
      }

      if (mode === 'ing') {
        if (isSubtitle(l)) {
          currentRecipe.ingredients.push({ amount: '', name: `${l.replace(/:$/, '').toUpperCase()}:` });
        } else {
          const match = l.match(/^((?:[\d/.\-½¼¾]+\s*)?(?:secubit|segenggam|sejemput|setitik|sudu\s+kecil|sudu\s+besar|sudu|cawan|mangkuk|ulas|biji|hiris|potong|ekor|ikat|keping|helai|tangkai|g|gm|kg|ml|liter|tin|kotak|bungkus|peket|inci|batang|cup|tsp|tbsp)?)\s+(.*)$/i);
          if (match && match[1].trim() !== '') {
            currentRecipe.ingredients.push({ amount: match[1].trim(), name: match[2].trim() });
          } else {
            currentRecipe.ingredients.push({ amount: '', name: l.replace(/^[-*•]\s*/, '').replace(/^-+\s*|\s*-+$/g, '') });
          }
        }
      } else if (mode === 'steps') {
        if (isSubtitle(l)) {
          currentRecipe.steps.push(`${l.replace(/:$/, '').toUpperCase()}:`);
        } else {
          const cleanStep = l.replace(/^(?:Langkah\s*\d+\s*[:-]?|\d+[.)]\s*|[-*•]\s*)/i, '').trim();
          if (cleanStep) currentRecipe.steps.push(cleanStep);
        }
      } else if (mode === 'notes') {
        const cleanNote = l.replace(/^(?:[Tt]ips?\s*[:-]?|[Nn]ota\s*[:-]?|\d+[.)]\s*|[-*•]\s*)/i, '').trim();
        if (cleanNote) currentRecipe.notes.push(cleanNote);
      }
    });

    if (currentRecipe) recipes.push(currentRecipe);
    return recipes;
  };

  const handleSmartParse = () => {
    const parsedRecipes = advancedMultiParse(rawText);

    if (!parsedRecipes || parsedRecipes.length === 0) {
      if (typeof showToast === 'function') showToast("No recipes found. Check format.", "error");
      return;
    }

    if (parsedRecipes.length === 1) {
      // Single recipe, load into current form
      const parsed = parsedRecipes[0];
      setRecipeForm({
        ...recipeForm,
        title: parsed.title || recipeForm.title,
        author: parsed.instructor || recipeForm.author || 'Abid Nasa',
        category: parsed.category || recipeForm.category || 'Mains',
        tierRequired: parsed.tier_required || recipeForm.tierRequired || 'Free',
        ingredients: parsed.ingredients.length ? parsed.ingredients : recipeForm.ingredients,
        steps: parsed.steps.length ? parsed.steps : recipeForm.steps,
        notes: parsed.notes.length ? parsed.notes : recipeForm.notes
      });
      if (typeof showToast === 'function') showToast("Magic Complete! ✨");
      setRawText("");
    } else {
      // Multiple recipes detected! Send to staging area with defaults
      const formattedStaging = parsedRecipes.map(r => ({
        title: r.title,
        time: '30 min',
        author: r.instructor || 'Abid Nasa',
        category: r.category || 'Mains',
        difficulty: 'Beginner',
        base_servings: 2,
        ingredients: r.ingredients,
        steps: r.steps,
        notes: r.notes,
        tags: [],
        status: 'draft',
        tier_required: r.tier_required || 'Free',
        is_featured: false,
        volume: 'CWC Original',
        image: ''
      }));

      setStagingData({ type: 'recipes', items: formattedStaging });
      if (typeof showToast === 'function') showToast(`Wow! Detected ${parsedRecipes.length} recipes!`);
      setRawText("");
    }
  };

  const handleClassSmartParse = () => {
    const parsedRecipes = advancedMultiParse(rawText);
    if (!parsedRecipes || parsedRecipes.length === 0) {
      showToast("No classes found. Check format.", "error");
      return;
    }

    if (parsedRecipes.length === 1) {
      // Single class detected, load into form
      const parsed = parsedRecipes[0];
      setClassForm({
        ...classForm,
        title: parsed.title || classForm.title,
        instructor: parsed.instructor || classForm.instructor || 'Abid Nasa',
        category: parsed.category || classForm.category || 'Masterclass',
        price: parsed.price || classForm.price || '19.99',
        tierRequired: parsed.tier_required || classForm.tierRequired || 'Premium',
        ingredients: parsed.ingredients.length ? parsed.ingredients : classForm.ingredients,
        steps: parsed.steps.length ? parsed.steps : classForm.steps,
        notes: parsed.notes.length ? parsed.notes : classForm.notes
      });
      showToast("Magic Complete! ✨");
      setRawText("");
    } else {
      // Multiple classes detected! Send to staging area
      const formattedStaging = parsedRecipes.map(r => ({
        title: r.title,
        instructor: r.instructor || 'Abid Nasa',
        duration: '60 min',
        price: r.price || '19.99',
        category: r.category || 'Masterclass',
        ingredients: r.ingredients,
        steps: r.steps,
        notes: r.notes,
        tags: [],
        status: 'draft',
        tier_required: r.tier_required || 'Premium',
        is_featured: false,
        image: ''
      }));

      setStagingData({ type: 'classes', items: formattedStaging });
      showToast(`Wow! Detected ${parsedRecipes.length} classes!`);
      setRawText("");
    }
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
      for (const item of stagingData.items) {
        // Extract and map JSON fields to Database columns
        const combinedNotes = [
          ...(item.tips || []),
          ...(item.notes || [])
        ].filter(s => typeof s === 'string' && s.trim() !== '');

        const cleanTags = (item.tags || []).filter(t => typeof t === 'string' && t.trim() !== '').slice(0, 10);

        const recipeToSave = {
          title: item.title || 'Untitled',
          time: item.time || '',
          video: item.video_link || item.video || '',
          ingredients: item.ingredients || [],
          steps: item.instructions || item.steps || [],
          notes: JSON.stringify(combinedNotes),
          tags: cleanTags,
          author: item.author || 'Abid Nasa',
          category: item.category || 'Mains',
          difficulty: item.difficulty || 'Beginner',
          base_servings: item.base_servings || 2,
          status: item.status || 'published',
          tier_required: item.tier_required !== undefined ? item.tier_required : (item.tierRequired ?? 'Free'),
          is_featured: item.is_featured !== undefined ? item.is_featured : (item.isFeatured ?? false),
          volume: item.volume || 'CWC Original',
          image: item.image || ''
        };

        await addRecipe(recipeToSave);
        count++;
      }
      showToast(`Imported ${count} recipes! 🎉`);
    } else if (stagingData.type === 'classes') {
      for (const item of stagingData.items) {
        const cleanNotes = (item.notes || []).filter(s => typeof s === 'string' && s.trim() !== '');
        const cleanTags = (item.tags || []).filter(t => typeof t === 'string' && t.trim() !== '').slice(0, 10);

        // Ensure snake_case mapping for bulk upload
        const classToSave = {
          title: item.title || 'Untitled',
          instructor: item.instructor || 'Abid Nasa',
          duration: item.duration || '',
          price: item.price || '19.99',
          category: item.category || 'Masterclass',
          image: item.image || '',
          video: item.video || '',
          status: item.status || 'published',
          tier_required: item.tier_required !== undefined ? item.tier_required : (item.tierRequired ?? 'Premium'),
          is_featured: item.is_featured !== undefined ? item.is_featured : (item.isFeatured ?? false),
          ingredients: item.ingredients || [],
          steps: item.steps || [],
          notes: JSON.stringify(cleanNotes),
          tags: cleanTags,
          attachments: item.attachments || []
        };

        await addClass(classToSave);
        count++;
      }
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
      { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', hex: '#34d399' },
      { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hex: '#fbbf24' }
    ];

    const idx = settings.premiumTiers?.findIndex(t => t.name === tierName);
    const safeIdx = idx === -1 || idx === undefined ? 0 : idx;
    const style = colors[safeIdx % colors.length];
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
    const cleanNotes = (recipeForm.notes || []).filter(s => typeof s === 'string' && s.trim() !== '');
    const cleanTags = (recipeForm.tags || []).filter(t => t && t.trim() !== '').slice(0, 10);
    const { id, ...formData } = recipeForm;
    const data = {
      ...formData,
      ingredients: cleanIngredients,
      steps: cleanSteps,
      notes: JSON.stringify(cleanNotes),
      tags: cleanTags,
      is_featured: formData.isFeatured !== undefined ? formData.isFeatured : (formData.is_featured ?? false),
      tier_required: formData.tierRequired !== undefined ? formData.tierRequired : (formData.tier_required ?? 'Free'),
      base_servings: formData.baseServings !== undefined ? formData.baseServings : (formData.base_servings ?? 2),
      scheduled_post_date: formData.scheduled_post_date || null
    };

    // Remove all possible camelCase and redundant snake_case keys to ensure clean DB insert/update
    delete data.isFeatured;
    delete data.tierRequired;
    delete data.baseServings;
    delete data.is_featured_flag; // cleaning any potential leaks
    delete data.created_at;
    delete data.updated_at;

    if (data.image && typeof data.image === 'object' && data.image.id) {
      data.cover_image_id = data.image.id;
      data.image = data.image.hero_url || data.image.url;
    }

    if (data.hero_image && typeof data.hero_image === 'object' && data.hero_image.id) {
      data.hero_image_id = data.hero_image.id;
      data.hero_image = data.hero_image.hero_url || data.hero_image.url;
    }

    if (data.video && typeof data.video === 'object') {
      data.video = data.video.hero_url || data.video.url;
    }

    try {
      if (id) await updateRecipe(id, data); else await addRecipe(data);
      setIsCreating(false);
      showToast(`Recipe ${data.status === 'published' ? 'Published' : 'Drafted'}! 🍳`);
    } catch (err) {
      showToast("Failed to save recipe: " + err.message, "error");
    }
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
      if (unlockContext.itemType === 'volume') setPersonForm(prev => ({ ...prev, unlockedVolumes: [...prev.unlockedVolumes, unlockContext.itemId] }));
      if (unlockContext.itemType === 'class') setPersonForm(prev => ({ ...prev, unlockedClasses: [...prev.unlockedClasses, unlockContext.itemId] }));
    } else {
      if (unlockContext.itemType === 'volume') setPersonForm(prev => ({ ...prev, unlockedVolumes: prev.unlockedVolumes.filter(id => id !== unlockContext.itemId) }));
      if (unlockContext.itemType === 'class') setPersonForm(prev => ({ ...prev, unlockedClasses: prev.unlockedClasses.filter(id => id !== unlockContext.itemId) }));
    }
    setUnlockContext({ ...unlockContext, isOpen: false });
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

  const NAV_LABELS = {
    dashboard: 'HQ Dashboard', orders: 'Transaction Hub', curation: 'Content Curator',
    media: 'Media Vault', recipes: 'Recipe Library', classes: 'Masterclass Studio',
    merch: 'Empire Shop', people: 'Member Directory', broadcasts: 'Member Alerts',
    plugins: 'Automation Hub', settings: 'Platform Control',
  };

  const renderNavItem = (id, label, Icon) => (
    <button
      key={id}
      onClick={() => { handleTabChange(id); setIsMobileOpen(false); }}
      className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
        activeTab === id
          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.08)] pl-5'
          : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent'
      }`}
    >
      {activeTab === id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-400 rounded-r-full" />}
      <Icon size={16} className={activeTab === id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-300 transition-colors'} />
      <span className="truncate">{label}</span>
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
    <div className={`min-h-screen bg-slate-950 text-white flex overflow-hidden font-sans selection:bg-indigo-500/30 ${isLowEnd ? 'performance-economy' : ''}`} style={{ '--accent': settings.accentColor || '#4f46e5' }}>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>
      <ConfirmModal {...deleteContext} onConfirm={executeDelete} onCancel={() => setDeleteContext({ ...deleteContext, isOpen: false })} />
      <GenericConfirmModal
        isOpen={unlockContext.isOpen}
        title={unlockContext.action === 'unlock' ? 'Grant Access?' : 'Revoke Access?'}
        message={`Are you sure you want to ${unlockContext.action} "${unlockContext.itemName}" for ${personForm.name}?`}
        onConfirm={handleConfirmUnlock}
        onCancel={() => setUnlockContext({ ...unlockContext, isOpen: false })}
        confirmText={unlockContext.action === 'unlock' ? 'Yes, Grant Access' : 'Yes, Revoke Access'}
        confirmColor={unlockContext.action === 'unlock' ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-rose-500 hover:bg-rose-400'}
        icon={unlockContext.action === 'unlock' ? Unlock : LockIcon}
        iconColor={unlockContext.action === 'unlock' ? 'text-indigo-500' : 'text-rose-500'}
        iconBg={unlockContext.action === 'unlock' ? 'bg-indigo-500/20' : 'bg-rose-500/20'}
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#070B14] border-r border-white/5 flex flex-col transition-transform duration-300 ease-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'} shadow-2xl`}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { handleTabChange('dashboard'); setIsMobileOpen(false); }}>
            <img src="/CWC.svg" alt="CWC+" className="h-9 w-auto group-hover:scale-105 transition-transform duration-200" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Empire Command</p>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
          {renderNavItem("dashboard", "HQ Dashboard", LayoutDashboard)}
          {renderNavItem("orders", "Transaction Hub", DollarSign)}
          {renderNavItem("curation", "Content Curator", GripVertical)}
          {renderNavItem("media", "Media Vault", ImageIcon)}

          <div className="pt-5 pb-1.5 px-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Culinary Assets</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          </div>
          {renderNavItem("recipes", "Recipe Library", ChefHat)}
          {renderNavItem("classes", "Masterclass Studio", Video)}
          {renderNavItem("merch", "Empire Shop", ShoppingBag)}

          <div className="pt-5 pb-1.5 px-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Member Relations</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          </div>
          {renderNavItem("people", "Member Directory", Users)}
          {renderNavItem("broadcasts", "Member Alerts", Bell)}

          <div className="pt-5 pb-1.5 px-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">System Core</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          </div>
          {renderNavItem("plugins", "Automation Hub", Puzzle)}
          {renderNavItem("settings", "Platform Control", Settings)}

          <div className="pt-6 pb-4 px-2">
            <a href="/" className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all border border-indigo-500/10 hover:border-indigo-500/20">
              <PlayCircle size={16} /> Exit to App
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="sticky top-0 z-40 bg-[#070B14]/90 backdrop-blur-3xl border-b border-white/5 px-4 py-3 lg:px-8 lg:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden p-2.5 bg-slate-800/70 hover:bg-slate-700 rounded-xl border border-white/5 transition-all flex-shrink-0">
              <LayoutDashboard size={20} />
            </button>
            {/* Page title chip — visible on mobile where sidebar is hidden */}
            <div className="lg:hidden flex items-center gap-2 flex-shrink-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{NAV_LABELS[activeTab] || activeTab}</span>
            </div>
            <div className="relative flex-1 max-w-2xl hidden sm:block">
              <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder={`Search ${NAV_LABELS[activeTab] || activeTab}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#0F172A]/50 border border-white/10 rounded-full pl-12 pr-6 py-3 text-sm font-bold outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/[0.05] placeholder:text-slate-600" />
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-xl border border-white/5 transition-all group"
              title="Deep Sync Everything"
            >
              <Loader2 size={18} className="group-active:rotate-180 transition-transform duration-500" />
            </button>
            <div className="hidden xl:flex items-center gap-5 mr-3 pr-5 border-r border-white/5">
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-none">Empire Sync</p>
                <p className="text-xs font-bold text-indigo-400 mt-1 leading-none">Active</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-none">Global MRR</p>
                <p className="text-xs font-bold text-white mt-1 leading-none">${mrr.toFixed(0)}</p>
              </div>
            </div>
            {user?.isGod && (
              <button
                onClick={() => {
                  setGodMode(!godMode);
                  setSelectedItems(new Set());
                  if (!godMode) showToast("MANAGEMENT MODE ACTIVE ⚡", "success");
                }}
                className={`px-5 py-2 rounded-full border flex items-center gap-2 transition-all ${godMode ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'bg-slate-800/50 border-white/5 text-slate-500 hover:text-white'}`}
              >
                <ShieldAlert size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{godMode ? 'Management Active' : 'Advanced Mode'}</span>
              </button>
            )}
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">v2.0</span>
            </div>
          </div>
        </header>

        {/* Mobile search bar — shown below header on small screens */}
        <div className="sm:hidden px-4 py-2 border-b border-white/5 bg-[#070B14]/90">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder={`Search ${NAV_LABELS[activeTab] || activeTab}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#0F172A]/50 border border-white/10 rounded-full pl-10 pr-5 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/[0.05] placeholder:text-slate-600" />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar pb-24">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* HQ Dashboard Tabs */}
              <div className="flex gap-2 border-b border-white/5 pb-4 mb-6">
                <button onClick={() => setDashboardTab('overview')} className={`h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border ${dashboardTab === 'overview' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300'}`}>
                  <LayoutDashboard size={14} /> Intelligence Overview
                </button>
                <button onClick={() => setDashboardTab('analytics')} className={`h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border ${dashboardTab === 'analytics' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300'}`}>
                  <TrendingUp size={14} /> Advanced Analytics
                </button>
              </div>

              {dashboardTab === 'overview' ? (
                <div className="space-y-6">
                  {/* High-Density Welcome Hero */}
                  <div className="p-5 md:p-6 rounded-2xl bg-[#0F172A]/40 border-[0.5px] border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.03] to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-1">
                      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                        Command Deck,
                        <span className="text-indigo-400 ml-2">{user?.name || 'Chef'}</span>
                      </h2>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                        Culinary Empire v2.0 • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="relative z-10 flex gap-3">
                      <button onClick={() => handleTabChange('recipes')} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 active:scale-95">
                        <Plus size={16} /> New Recipe
                      </button>
                      <button onClick={() => setDashboardTab('analytics')} className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 border border-white/5">
                        <TrendingUp size={16} /> Insights
                      </button>
                    </div>
                  </div>

                  {/* High-Density Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Library Size', val: recipes.length, icon: ChefHat, color: 'text-indigo-400', border: 'border-indigo-500/10' },
                      { label: 'Active Classes', val: classes.length, icon: Video, color: 'text-rose-400', border: 'border-rose-500/10' },
                      { label: 'Member Count', val: people.length, icon: Users, color: 'text-indigo-400', border: 'border-indigo-500/10' },
                      { label: 'Monthly MRR', val: '$' + mrr.toFixed(0), icon: DollarSign, color: 'text-amber-400', border: 'border-amber-500/10' },
                    ].map((stat, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={stat.label} className={`p-4 rounded-xl bg-[#0F172A]/30 border-[0.5px] border-white/10 flex items-center gap-4 group hover:bg-[#0F172A]/50 transition-all cursor-pointer`}>
                        <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                          <stat.icon size={18} />
                        </div>
                        <div>
                          <p className="text-xl font-black text-white tracking-tight leading-none">{stat.val}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1.5">{stat.label}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Optimized Secondary Stats Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Membership Breakdown */}
                    <div className="p-5 rounded-2xl bg-[#0F172A]/30 border-[0.5px] border-white/10 flex flex-col shadow-xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest"><Users size={16} className="text-indigo-400" /> Member Tiers</h3>
                        <button onClick={() => handleTabChange('people')} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Manage All</button>
                      </div>
                      <div className="space-y-4 flex-1">
                        {['Free', ...(settings.premiumTiers?.map(t => t.name) || [])].map(tier => {
                          const count = people.filter(p => p.subscriptionTier === tier).length;
                          const pct = people.length ? Math.round((count / people.length) * 100) : 0;
                          const meta = getTierMeta(tier);
                          return (
                            <div key={tier} className="group">
                              <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-2">
                                <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{tier}</span>
                                <span className="text-white">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className={`h-full ${tier === 'Free' ? 'bg-slate-700' : 'bg-indigo-500'}`} style={meta.customColor ? { backgroundColor: meta.customColor } : {}} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Content Overview */}
                    <div className="p-5 rounded-2xl bg-[#0F172A]/30 border-[0.5px] border-white/10 flex flex-col shadow-xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest"><ChefHat size={16} className="text-rose-400" /> Content Pulse</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center group hover:bg-slate-950 transition-all">
                          <span className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform"><Eye size={18} /></span>
                          <h4 className="text-xl font-black text-white leading-none">{recipes.filter(r => r.status === 'published').length + classes.filter(c => c.status === 'published').length}</h4>
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2">Active</p>
                        </div>
                        <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center group hover:bg-slate-950 transition-all">
                          <span className="text-slate-600 mb-2 group-hover:scale-110 transition-transform"><EyeOff size={18} /></span>
                          <h4 className="text-xl font-black text-white leading-none">{recipes.filter(r => r.status === 'draft').length + classes.filter(c => c.status === 'draft').length}</h4>
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2">Drafts</p>
                        </div>
                        <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-center justify-between col-span-2 mt-1 group hover:bg-indigo-500/10 transition-all px-6">
                          <div className="flex items-center gap-3">
                            <span className="text-amber-400 group-hover:rotate-12 transition-transform"><Star size={18} className="fill-amber-400" /></span>
                            <p className="text-[10px] font-black uppercase text-white tracking-widest">Featured Assets</p>
                          </div>
                          <h4 className="text-xl font-black text-white">{recipes.filter(r => r.isFeatured).length + classes.filter(c => c.isFeatured).length}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AnalyticsDashboard recipes={recipes} classes={classes} people={people} settings={settings} mrr={mrr} />
              )}
            </div>
          )}

          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'curation' && <ContentCurator />}
          {activeTab === 'media' && <MediaStudio onSync={handleMediaSync} isSyncing={isSavingMedia} />}

          {/* RECIPES */}
          {activeTab === 'recipes' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Recipe Library</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Total Assets: {recipes.length}</p>
                </div>
                {!isCreating && (
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <label className="h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer">
                      <Package size={14} className="text-indigo-400" /> JSON Import
                      <input type="file" accept=".json" className="hidden" onChange={handleBulkUploadRecipes} />
                    </label>
                    <button onClick={() => { setRecipeForm({ title: '', author: 'Abid Nasa', time: '30 min', image: '', video: '', category: 'Mains', difficulty: 'Beginner', baseServings: 2, ingredients: [{ name: '', amount: '' }], steps: [''], notes: [''], tags: [], status: 'published', isFeatured: false, tierRequired: 'Free', volume: 'CWC Original', scheduled_post_date: '' }); setIsCreating(true); }} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all"><Plus size={14} /> New Recipe</button>
                  </div>
                )}
              </div>

              {/* Admin Volume Filtering Section */}
              {!isCreating && (
                <div className="relative group max-w-xs mb-6">
                  <select
                    value={activeVolume}
                    onChange={(e) => { setActiveVolume(e.target.value); setVisibleRecipesCount(20); }}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest text-indigo-400 appearance-none focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                  >
                    {["All", ...new Set([...(settings.volumes?.map(v => v.name) || []), ...recipes.map(r => r.volume).filter(Boolean)])].map(vol => (
                      <option key={vol} value={vol} className="bg-[#0F172A] text-slate-300 font-bold">{vol}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-indigo-400 transition-colors">
                    <ChevronDown size={16} />
                  </div>
                </div>
              )}

              {!isCreating ? (
                <div>
                  {fRecipes.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border-[0.5px] border-dashed border-white/10 rounded-3xl">
                      <ChefHat size={40} className="mx-auto text-slate-700 mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No matches in library</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                      {fRecipes.slice(0, visibleRecipesCount).map(r => {
                        const tierMeta = getTierMeta(r.tierRequired || 'Free');
                        const isSelected = selectedItems.has(r.id);
                        return (
                          <motion.div layout key={r.id}
                            className={`group relative bg-[#0F172A]/40 border rounded-2xl overflow-hidden transition-all hover:shadow-xl ${r.status === 'draft' ? 'opacity-60' : ''} ${isSelected ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.12)]' : 'border-white/5 hover:border-indigo-500/30'}`}
                          >
                            {/* Image */}
                            <div className="aspect-video relative bg-slate-900 overflow-hidden">
                              {r.image
                                ? <img src={r.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                : <ChefHat size={28} className="absolute inset-0 m-auto text-slate-700" />}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#070B14]/80 via-transparent to-transparent" />
                              {/* God mode checkbox */}
                              {godMode && (
                                <button onClick={() => toggleSelection(r.id)}
                                  className={`absolute top-2 left-2 w-6 h-6 rounded-lg border-2 flex items-center justify-center z-10 transition-all ${isSelected ? 'bg-rose-500 border-rose-500' : 'bg-slate-900/80 border-white/20 backdrop-blur-sm'}`}>
                                  {isSelected && <CheckCircle2 size={12} className="text-white" />}
                                </button>
                              )}
                              {/* Featured badge */}
                              {r.isFeatured && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border border-[#070B14]">
                                  <Star size={9} className="fill-slate-950 text-slate-950" />
                                </div>
                              )}
                              {/* Status dot */}
                              <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'published' ? 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]' : 'bg-amber-400'}`} />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${r.status === 'published' ? 'text-indigo-300' : 'text-amber-300'}`}>{r.status}</span>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="p-3">
                              <h4 className="text-[11px] font-black text-white leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors mb-1">{r.title}</h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`} style={tierMeta.customColor ? { borderColor: `${tierMeta.customColor}40`, color: tierMeta.customColor } : {}}>{tierMeta.label}</span>
                                {r.category && <span className="text-[8px] font-bold text-slate-500 uppercase">{r.category}</span>}
                              </div>
                              <p className="text-[8px] text-slate-600 font-bold mt-1 uppercase tracking-tight truncate">{r.volume || 'Original'} • {r.difficulty || 'Pro'}</p>
                            </div>

                            {/* Actions */}
                            <div className="px-3 pb-3 flex gap-2">
                              <button onClick={() => {
                                let parsedNotes = [''];
                                try { parsedNotes = r.notes ? JSON.parse(r.notes) : ['']; } catch (e) { parsedNotes = [r.notes]; }
                                const recipeToEdit = { ...r, notes: Array.isArray(parsedNotes) ? parsedNotes : [''] };
                                if (r.cover_image_id && Array.isArray(media)) recipeToEdit.image = media.find(m => m.id === r.cover_image_id) || r.image;
                                if (r.hero_image_id && Array.isArray(media)) recipeToEdit.hero_image = media.find(m => m.id === r.hero_image_id) || r.hero_image;
                                setRecipeForm(recipeToEdit);
                                setIsCreating(true);
                              }} className="flex-1 py-2 text-slate-400 hover:text-white bg-white/5 hover:bg-indigo-600 rounded-xl border border-white/5 hover:border-indigo-500 transition-all flex items-center justify-center gap-1 text-[10px] font-black uppercase">
                                <Edit3 size={11} /> Edit
                              </button>
                              <button onClick={() => requestDelete('recipes', r.id, r.title)}
                                className="w-9 py-2 text-rose-400/60 hover:text-white hover:bg-rose-500 bg-rose-500/5 rounded-xl border border-rose-500/10 hover:border-rose-500 transition-all flex items-center justify-center">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {fRecipes.length > visibleRecipesCount && (
                    <div className="flex justify-center pt-6">
                      <button onClick={() => setVisibleRecipesCount(prev => prev + 20)}
                        className="px-10 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all active:scale-95">
                        Load More ({fRecipes.length - visibleRecipesCount} remaining)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full bg-[#0F172A]/30 border-[0.5px] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-indigo-600 p-8 md:p-10 flex justify-between items-center relative overflow-hidden" style={{ backgroundColor: 'var(--accent)' }}>
                    <Wand2 className="absolute right-10 opacity-20 w-40 h-40" />
                    <h4 className="text-3xl md:text-4xl font-black text-white relative z-10">{recipeForm.id ? 'Edit Recipe' : 'New Recipe Magic'}</h4>
                    <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center relative z-10 transition-colors"><X size={28} /></button>
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
                          <button type="button" onClick={() => setRecipeForm({ ...recipeForm, status: 'draft' })} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${recipeForm.status === 'draft' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}><EyeOff size={16} className="inline mr-2" />Draft</button>
                          <button type="button" onClick={() => setRecipeForm({ ...recipeForm, status: 'published' })} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${recipeForm.status === 'published' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white'}`}><Eye size={16} className="inline mr-2" />Published</button>
                        </div>
                        <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
                          <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Feature Banner</span>
                          <button type="button" onClick={() => setRecipeForm({ ...recipeForm, isFeatured: !recipeForm.isFeatured })} className={`w-14 h-8 rounded-full relative transition-colors border-2 ${recipeForm.isFeatured ? 'bg-amber-500 border-amber-500' : 'bg-slate-900 border-slate-700'}`}>
                            <motion.div animate={{ x: recipeForm.isFeatured ? 24 : 2 }} className="w-6 h-6 bg-white rounded-full absolute top-0.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                          <label className="text-sm font-black uppercase text-slate-500 ml-2">Name of the Dish</label>
                          <input required type="text" value={recipeForm.title} onChange={e => setRecipeForm({ ...recipeForm, title: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="e.g. Magic Pancakes" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black uppercase text-slate-500 ml-2">Recipe Volume</label>
                          <select value={recipeForm.volume || 'CWC Original'} onChange={e => setRecipeForm({ ...recipeForm, volume: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white cursor-pointer appearance-none">
                            {(settings.volumes || []).map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                            <option value="Free">Free (No Volume)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <MediaUploader label="Cover Image (JPG, PNG)" value={recipeForm.image} onChange={(val) => setRecipeForm({ ...recipeForm, image: val })} />
                        </div>
                        <div className="space-y-2">
                          <MediaUploader label="Hero Banner (Cinematic)" value={recipeForm.hero_image} onChange={(val) => setRecipeForm({ ...recipeForm, hero_image: val })} />
                        </div>
                        <div className="space-y-2">
                          <MediaUploader label="Recipe Video (MP4) Optional" value={recipeForm.video} onChange={(val) => setRecipeForm({ ...recipeForm, video: val })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black uppercase text-slate-500 ml-2">Author / Chef</label>
                          <input type="text" value={recipeForm.author || ''} onChange={e => setRecipeForm({ ...recipeForm, author: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="e.g. Chef John" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black uppercase text-slate-500 ml-2">Time to Cook</label>
                          <input type="text" value={recipeForm.time || ''} onChange={e => setRecipeForm({ ...recipeForm, time: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="e.g. 30 min" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black uppercase text-slate-500 ml-2">Category</label>
                          <input type="text" list="recipe-categories" value={recipeForm.category || ''} onChange={e => setRecipeForm({ ...recipeForm, category: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="Type or select a category..." />
                          <datalist id="recipe-categories">
                            <option value="Mains" />
                            <option value="Breakfast" />
                            <option value="Desserts" />
                            <option value="Drinks" />
                            <option value="Appetizers" />
                          </datalist>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black uppercase text-slate-500 ml-2">Difficulty</label>
                          <select value={recipeForm.difficulty || 'Beginner'} onChange={e => setRecipeForm({ ...recipeForm, difficulty: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white cursor-pointer appearance-none focus:border-indigo-500">
                            <option value="Beginner">Beginner</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                            <option value="Pro">Pro</option>
                          </select>
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                          <label className="text-sm font-black uppercase text-slate-500 ml-2">Tags (Max 10)</label>
                          <input type="text" value={(recipeForm.tags || []).join(', ')} onChange={e => {
                            const val = e.target.value;
                            const tagsArray = val.split(',').map(t => t.trim()).filter(t => t !== '').slice(0, 10);
                            if (val.endsWith(',')) tagsArray.push(''); // Keep trailing comma for UX
                            setRecipeForm({ ...recipeForm, tags: val.split(',').map(t => t.trimStart()).slice(0, 10) });
                          }} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="e.g. Bread, Soup, Vegan (comma separated)" />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                          <div className="flex items-center justify-between mb-2 px-2">
                            <label className="text-sm font-black uppercase text-slate-500">Notes & Tips (Optional)</label>
                            <button type="button" onClick={() => setRecipeForm({ ...recipeForm, notes: [...(recipeForm.notes || []), ''] })} className="text-xs font-black text-indigo-400 flex items-center gap-1 hover:text-indigo-300 px-3 py-1 bg-indigo-500/10 rounded-full"><Plus size={14} /> Add Note</button>
                          </div>
                          <div className="space-y-3">
                            {(Array.isArray(recipeForm.notes) ? recipeForm.notes : []).map((note, idx) => (
                              <div key={idx} className="flex gap-2 relative">
                                <input value={note} onChange={e => { const n = [...(Array.isArray(recipeForm.notes) ? recipeForm.notes : [])]; n[idx] = e.target.value; setRecipeForm({ ...recipeForm, notes: n }); }} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white" placeholder="Any special tips, secrets or equipment needed?" />
                                <button type="button" onClick={() => setRecipeForm({ ...recipeForm, notes: (Array.isArray(recipeForm.notes) ? recipeForm.notes : []).filter((_, i) => i !== idx) })} className="w-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors flex-shrink-0"><Trash2 size={20} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                          <label className="text-sm font-black uppercase text-slate-500 ml-2">Scheduled Post Date (Optional)</label>
                          <input type="datetime-local" value={recipeForm.scheduled_post_date || ''} onChange={e => setRecipeForm({ ...recipeForm, scheduled_post_date: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white appearance-none custom-scrollbar focus:border-indigo-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="bg-slate-950 p-6 rounded-[40px] border-2 border-slate-800">
                          <div className="flex items-center justify-between mb-6 px-2">
                            <h5 className="font-black text-xl text-white">Ingredients</h5>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...(recipeForm.ingredients || []), { name: 'SUBTITLE:', amount: '' }] })} className="px-4 h-10 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/5 transition-all">
                                <Layers size={14} /> Add Subtitle
                              </button>
                              <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...(recipeForm.ingredients || []), { name: '', amount: '' }] })} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"><Plus size={20} /></button>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {(recipeForm.ingredients || []).map((ing, idx) => {
                              const isSub = ing.name.endsWith(':') || (ing.name.startsWith('---') && ing.name.endsWith('---')) || (!ing.amount && ing.name.length > 0 && ing.name === ing.name.toUpperCase());
                              return (
                                <div key={idx} className={`flex gap-2 p-2 rounded-2xl transition-all ${isSub ? 'bg-indigo-500/10 border border-indigo-500/20' : ''}`}>
                                  {!isSub && <input placeholder="Qty (2 cups)" value={ing.amount} onChange={e => { const n = [...(recipeForm.ingredients || [])]; n[idx] = { ...n[idx], amount: e.target.value }; setRecipeForm({ ...recipeForm, ingredients: n }); }} className="w-1/3 bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white" />}
                                  <input placeholder={isSub ? "SUBTITLE NAME (e.g. SAUCE:)" : "Item (Flour)"} value={ing.name} onChange={e => { const n = [...(recipeForm.ingredients || [])]; n[idx] = { ...n[idx], name: e.target.value }; setRecipeForm({ ...recipeForm, ingredients: n }); }} className={`${isSub ? 'w-full' : 'w-2/3'} bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 text-white ${isSub ? 'text-indigo-400 placeholder:text-indigo-400/50 uppercase tracking-widest' : ''}`} />
                                  <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: recipeForm.ingredients.filter((_, i) => i !== idx) })} className="w-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><X size={20} /></button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-slate-950 p-6 rounded-[40px] border-2 border-slate-800">
                          <div className="flex items-center justify-between mb-6 px-2">
                            <h5 className="font-black text-xl text-white">How to make it</h5>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setRecipeForm({ ...recipeForm, steps: [...(recipeForm.steps || []), 'STEP SUBTITLE:'] })} className="px-4 h-10 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/5 transition-all">
                                <Layers size={14} /> Add Subtitle
                              </button>
                              <button type="button" onClick={() => setRecipeForm({ ...recipeForm, steps: [...(recipeForm.steps || []), ''] })} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"><Plus size={20} /></button>
                            </div>
                          </div>
                          <div className="space-y-3 pr-2">
                            {(recipeForm.steps || []).map((step, idx) => {
                              const isSub = step.endsWith(':') || (step.startsWith('---') && step.endsWith('---')) || (step.length > 0 && step.length < 30 && step === step.toUpperCase());
                              return (
                                <div key={idx} className={`flex gap-3 p-3 rounded-[30px] transition-all ${isSub ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-slate-900/50 border border-white/5'}`}>
                                  {!isSub ? (
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-indigo-400 flex-shrink-0 mt-1">{idx + 1}</div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-1"><Layers size={18} /></div>
                                  )}
                                  <textarea rows={isSub ? 1 : 2} value={step} onChange={e => { const n = [...recipeForm.steps]; n[idx] = e.target.value; setRecipeForm({ ...recipeForm, steps: n }); }} className={`flex-1 bg-transparent px-2 py-3 text-sm font-bold outline-none focus:border-indigo-500 text-white custom-scrollbar ${isSub ? 'text-indigo-400 uppercase tracking-[0.2em] pt-4' : ''}`} placeholder={isSub ? "SECTION TITLE (e.g. PREPARATION:)" : "Mix it all up..."} />
                                  <button type="button" onClick={() => setRecipeForm({ ...recipeForm, steps: recipeForm.steps.filter((_, i) => i !== idx) })} className="w-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors h-14 mt-1"><X size={20} /></button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all">
                        Save Recipe! 🍳
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MASTERCLASSES */}
          {activeTab === 'classes' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              {/* Header: Production Studio Identity */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                      <Video className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Production Studio</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Management Hub • {classes.length} MASTERCLASSES</p>
                    </div>
                  </div>
                </div>
                {!isCreating && (
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <label className="group h-12 px-6 bg-[#0F172A]/80 hover:bg-white/10 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer backdrop-blur-3xl shadow-xl">
                      <Package size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span>Bulk Studio Sync</span>
                      <input type="file" accept=".json" className="hidden" onChange={handleBulkUploadClasses} />
                    </label>
                    <button
                      onClick={() => {
                        setClassForm({ title: '', instructor: 'Abid Nasa', duration: '', price: '19.99', category: 'Masterclass', image: '', video: '', live_link: '', status: 'published', isFeatured: false, tierRequired: settings.premiumTiers?.[0]?.name || 'Premium', ingredients: [{ name: '', amount: '' }], steps: [''], notes: [''], tags: [], attachments: [], scheduled_post_date: '', live_date: '', live_duration_hours: 2 });
                        setIsCreating(true);
                        setClassFormSection('identity');
                      }}
                      className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_10px_40px_rgba(79,70,229,0.3)] flex items-center gap-3 active:scale-95 transition-all"
                    >
                      <Plus size={18} /> New Production
                    </button>
                  </div>
                )}
              </div>

              {!isCreating ? (
                <div>
                  {fClasses.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border-[0.5px] border-dashed border-white/10 rounded-3xl">
                      <Film size={40} className="mx-auto text-slate-700 mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No productions in archive</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                      {fClasses.map(c => {
                        const tierMeta = getTierMeta(c.tier_required || c.tierRequired || 'Premium');
                        const classMedia = Array.isArray(media) ? media.find(m => m.id === c.thumbnail_image_id) : null;
                        const displayImage = classMedia?.thumb_url || c.image;
                        const isSelected = selectedItems.has(c.id);

                        return (
                          <motion.div layout key={c.id}
                            className={`group relative bg-[#0F172A]/40 border rounded-2xl overflow-hidden transition-all hover:shadow-xl ${c.status === 'draft' ? 'opacity-60' : ''} ${isSelected ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.12)]' : 'border-white/5 hover:border-indigo-500/30'}`}
                          >
                            {/* Thumbnail */}
                            <div className="aspect-video relative overflow-hidden bg-slate-900">
                              {displayImage
                                ? <img src={displayImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                : <Film size={28} className="absolute inset-0 m-auto text-slate-700" />}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#070B14]/80 via-transparent to-transparent" />

                              {/* God mode checkbox */}
                              {godMode && (
                                <button onClick={e => { e.stopPropagation(); toggleSelection(c.id); }}
                                  className={`absolute top-2 left-2 w-6 h-6 z-10 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-rose-500 border-rose-500' : 'bg-slate-900/80 border-white/20 backdrop-blur-sm'}`}>
                                  {isSelected && <CheckCircle2 size={12} className="text-white" />}
                                </button>
                              )}

                              {/* Featured badge */}
                              {(c.is_featured || c.isFeatured) && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border border-[#070B14]">
                                  <Star size={9} className="fill-slate-950 text-slate-950" />
                                </div>
                              )}

                              {/* Status */}
                              <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'published' ? 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]' : 'bg-amber-400'}`} />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${c.status === 'published' ? 'text-indigo-300' : 'text-amber-300'}`}>{c.status}</span>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="p-3">
                              <h4 className="text-[11px] font-black text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors mb-1">{c.title}</h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`} style={tierMeta.customColor ? { borderColor: `${tierMeta.customColor}40`, color: tierMeta.customColor } : {}}>{tierMeta.label}</span>
                                {c.category && <span className="text-[8px] font-bold text-slate-500 uppercase">{c.category}</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                {c.duration && <span className="text-[8px] text-slate-600 font-bold uppercase flex items-center gap-1"><Clock size={9} />{c.duration}</span>}
                                <span className="text-[8px] text-slate-600 font-bold uppercase flex items-center gap-1"><BookOpen size={9} />{c.steps?.length || 0} steps</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="px-3 pb-3 flex gap-2">
                              <button onClick={() => {
                                let parsedNotes = [''];
                                try { parsedNotes = c.notes ? (typeof c.notes === 'string' ? JSON.parse(c.notes) : c.notes) : ['']; } catch (e) { parsedNotes = [c.notes]; }
                                const classToEdit = {
                                  ...c,
                                  attachments: c.attachments || [],
                                  notes: Array.isArray(parsedNotes) ? parsedNotes : [parsedNotes],
                                  tierRequired: c.tier_required || c.tierRequired || 'Premium',
                                  isFeatured: c.is_featured || c.isFeatured || false,
                                  ingredients: Array.isArray(c.ingredients) ? c.ingredients : [],
                                  steps: Array.isArray(c.steps) ? c.steps : []
                                };
                                if (c.thumbnail_image_id && Array.isArray(media)) classToEdit.image = media.find(m => m.id === c.thumbnail_image_id) || c.image;
                                if (c.hero_image_id && Array.isArray(media)) classToEdit.hero_image = media.find(m => m.id === c.hero_image_id) || c.hero_image;
                                setClassForm(classToEdit);
                                setIsCreating(true);
                                setClassFormSection('identity');
                              }} className="flex-1 py-2 text-slate-400 hover:text-white bg-white/5 hover:bg-indigo-600 rounded-xl border border-white/5 hover:border-indigo-500 transition-all flex items-center justify-center gap-1 text-[10px] font-black uppercase">
                                <Edit3 size={11} /> Edit
                              </button>
                              <button onClick={() => requestDelete('classes', c.id, c.title)}
                                className="w-9 py-2 text-rose-400/60 hover:text-white hover:bg-rose-500 bg-rose-500/5 rounded-xl border border-rose-500/10 hover:border-rose-500 transition-all flex items-center justify-center">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full bg-[#0F172A]/60 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
                  {/* Multi-Section Form Header */}
                  <div className="bg-slate-900/50 border-b border-white/5 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                        <Video size={32} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-4xl font-black text-white tracking-tighter italic">{classForm.id ? 'Refining Production' : 'New Production Deck'}</h4>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                          Studio Pipeline Active
                        </div>
                      </div>
                    </div>

                    {/* Section Navigator */}
                    <div className="flex bg-slate-950/50 p-1.5 rounded-3xl border border-white/5 backdrop-blur-md">
                      {[
                        { id: 'identity', label: 'Identity', icon: Layout },
                        { id: 'media', label: 'Media', icon: Film },
                        { id: 'production', label: 'Studio', icon: Globe },
                        { id: 'curriculum', label: 'Curriculum', icon: BookOpen }
                      ].map(sec => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setClassFormSection(sec.id)}
                          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${classFormSection === sec.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <sec.icon size={14} /> {sec.label}
                        </button>
                      ))}
                    </div>

                    <button onClick={() => setIsCreating(false)} className="w-14 h-14 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white rounded-full flex items-center justify-center transition-all border border-white/10"><X size={28} /></button>
                  </div>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const cleanIngredients = (classForm.ingredients || []).filter(i => i.name && i.name.trim() !== '');
                    const cleanSteps = (classForm.steps || []).filter(s => s && s.trim() !== '');
                    const cleanNotes = (classForm.notes || []).filter(s => typeof s === 'string' && s.trim() !== '');
                    const cleanTags = (classForm.tags || []).filter(t => t && t.trim() !== '').slice(0, 10);
                    const { id, ...formData } = classForm;

                    const data = {
                      ...formData,
                      ingredients: cleanIngredients,
                      steps: cleanSteps,
                      notes: JSON.stringify(cleanNotes),
                      tags: cleanTags,
                      is_featured: formData.isFeatured !== undefined ? formData.isFeatured : (formData.is_featured ?? false),
                      tier_required: formData.tierRequired !== undefined ? formData.tierRequired : (formData.tier_required ?? 'Premium'),
                      scheduled_post_date: formData.scheduled_post_date ? new Date(formData.scheduled_post_date).toISOString() : null,
                      live_date: formData.live_date ? new Date(formData.live_date).toISOString() : null,
                      live_duration_hours: formData.live_duration_hours || 2
                    };

                    // Deep clean keys to prevent persistence of old values or incorrect schema
                    delete data.isFeatured;
                    delete data.tierRequired;
                    delete data.created_at;
                    delete data.updated_at;

                    if (data.image && typeof data.image === 'object' && data.image.id) {
                      data.thumbnail_image_id = data.image.id;
                      data.image = data.image.hero_url || data.image.url;
                    }
                    if (data.hero_image && typeof data.hero_image === 'object' && data.hero_image.id) {
                      data.hero_image_id = data.hero_image.id;
                      data.hero_image = data.hero_image.hero_url || data.hero_image.url;
                    }
                    if (data.video && typeof data.video === 'object') {
                      data.video = data.video.hero_url || data.video.url;
                    }

                    try {
                      if (id) await updateClass(id, data); else await addClass(data);
                      setIsCreating(false);
                      showToast(`Class ${data.status === 'published' ? 'Published' : 'Drafted'}! 🎬`);
                    } catch (err) {
                      showToast("Failed to save class: " + err.message, "error");
                    }
                  }}>

                    <div className="p-8 md:p-16">
                      <AnimatePresence mode="wait">
                        {/* SECTION: IDENTITY */}
                        {classFormSection === 'identity' && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Class Production Name</label>
                                <input required type="text" value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-xl font-black outline-none text-white focus:border-indigo-500/50 transition-all placeholder:text-slate-800" placeholder="Enter Masterclass Title..." />
                              </div>
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Lead Instructor / Talent</label>
                                <input required type="text" value={classForm.instructor} onChange={e => setClassForm({ ...classForm, instructor: e.target.value })} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-xl font-black outline-none text-white focus:border-indigo-500/50 transition-all placeholder:text-slate-800" placeholder="e.g. Abid Nasa" />
                              </div>
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Studio Category</label>
                                <div className="relative">
                                  <select value={classForm.category || 'Masterclass'} onChange={e => setClassForm({ ...classForm, category: e.target.value })} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-xl font-black outline-none text-white appearance-none cursor-pointer focus:border-indigo-500/50 transition-all">
                                    <option value="Masterclass">Masterclass</option>
                                    <option value="Live Event">Live Production</option>
                                    <option value="Workshop">Technical Workshop</option>
                                    <option value="CWC Original">CWC+ Original</option>
                                  </select>
                                  <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500" />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Market Price ($)</label>
                                <input type="text" value={classForm.price} onChange={e => setClassForm({ ...classForm, price: e.target.value })} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-xl font-black outline-none text-white focus:border-indigo-500/50 transition-all" placeholder="19.99" />
                              </div>
                              <div className="space-y-4 md:col-span-2">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Required Membership Tier</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {['Free', ...(settings.premiumTiers?.map(t => t.name) || [])].map(tier => (
                                    <button
                                      key={tier}
                                      type="button"
                                      onClick={() => setClassForm({ ...classForm, tierRequired: tier })}
                                      className={`p-5 rounded-3xl border-2 font-black text-xs uppercase tracking-widest transition-all ${classForm.tierRequired === tier ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                      {tier}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="pt-8 flex justify-end">
                              <button type="button" onClick={() => setClassFormSection('media')} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">Continue to Media <Plus size={20} /></button>
                            </div>
                          </motion.div>
                        )}

                        {/* SECTION: MEDIA */}
                        {classFormSection === 'media' && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-2">
                                <MediaUploader label="Production Poster (16:9)" value={classForm.image} onChange={(val) => setClassForm({ ...classForm, image: val })} />
                              </div>
                              <div className="space-y-2">
                                <MediaUploader label="Cinematic Backdrop" value={classForm.hero_image} onChange={(val) => setClassForm({ ...classForm, hero_image: val })} />
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <MediaUploader label="Masterclass Video File (YouTube/MP4)" value={classForm.video} onChange={(val) => setClassForm({ ...classForm, video: val })} />
                              </div>
                              <div className="md:col-span-2 space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Live Stream Source (Zoom / YT Live)</label>
                                <input type="text" value={classForm.live_link || ''} onChange={e => setClassForm({ ...classForm, live_link: e.target.value })} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg font-bold outline-none text-white focus:border-indigo-500/50 transition-all placeholder:text-slate-800" placeholder="https://youtube.com/live/..." />
                              </div>
                            </div>
                            <div className="pt-8 flex justify-between">
                              <button type="button" onClick={() => setClassFormSection('identity')} className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black text-sm uppercase tracking-widest active:scale-95 transition-all">Back to Identity</button>
                              <button type="button" onClick={() => setClassFormSection('production')} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">Continue to Studio <Plus size={20} /></button>
                            </div>
                          </motion.div>
                        )}

                        {/* SECTION: PRODUCTION */}
                        {classFormSection === 'production' && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Production Status</label>
                                <div className="flex bg-slate-950/50 p-2 rounded-[2.5rem] border-2 border-slate-800">
                                  <button type="button" onClick={() => setClassForm({ ...classForm, status: 'draft' })} className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${classForm.status === 'draft' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-400'}`}>Draft Mode</button>
                                  <button type="button" onClick={() => setClassForm({ ...classForm, status: 'published' })} className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${classForm.status === 'published' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-600 hover:text-slate-400'}`}>Published Live</button>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Featured Spotlight</label>
                                <button type="button" onClick={() => setClassForm({ ...classForm, isFeatured: !classForm.isFeatured })} className={`w-full p-5 rounded-[2.5rem] border-2 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-between px-8 ${classForm.isFeatured ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                                  <span>Show on Front Page</span>
                                  {classForm.isFeatured ? <CheckCircle2 size={24} /> : <div className="w-6 h-6 border-2 border-slate-700 rounded-full" />}
                                </button>
                              </div>
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Scheduled Release</label>
                                <input type="datetime-local" value={classForm.scheduled_post_date || ''} onChange={e => setClassForm({ ...classForm, scheduled_post_date: e.target.value })} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg font-bold outline-none text-white focus:border-indigo-500/50 transition-all" />
                              </div>
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Live Stream Date</label>
                                <input type="datetime-local" value={classForm.live_date || ''} onChange={e => setClassForm({ ...classForm, live_date: e.target.value })} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg font-bold outline-none text-white focus:border-indigo-500/50 transition-all" />
                                <p className="text-[10px] font-bold text-amber-400/80 ml-4">Your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone} — time will be saved correctly for all users</p>
                              </div>
                              <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Live Session Duration</label>
                                <div className="relative">
                                  <select value={classForm.live_duration_hours || 2} onChange={e => setClassForm({ ...classForm, live_duration_hours: parseInt(e.target.value) })} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg font-bold outline-none text-white appearance-none cursor-pointer focus:border-indigo-500/50 transition-all">
                                    {[1,2,3,4,6,8].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>
                              </div>
                              <div className="md:col-span-2 space-y-4">
                                <label className="text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">Search Tags (Production Metadata)</label>
                                <input type="text" value={(classForm.tags || []).join(', ')} onChange={e => {
                                  const val = e.target.value;
                                  setClassForm({ ...classForm, tags: val.split(',').map(t => t.trimStart()).slice(0, 10) });
                                }} className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg font-bold outline-none text-white focus:border-indigo-500/50 transition-all placeholder:text-slate-800" placeholder="e.g. Italian, Masterclass, Pro Secrets..." />
                              </div>
                            </div>
                            <div className="pt-8 flex justify-between">
                              <button type="button" onClick={() => setClassFormSection('media')} className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black text-sm uppercase tracking-widest active:scale-95 transition-all">Back to Media</button>
                              <button type="button" onClick={() => setClassFormSection('curriculum')} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3">Continue to Curriculum <Plus size={20} /></button>
                            </div>
                          </motion.div>
                        )}

                        {/* SECTION: CURRICULUM */}
                        {classFormSection === 'curriculum' && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                            {/* Magic Extracter for Curriculum */}
                            <div className="p-10 bg-indigo-500/5 border-2 border-indigo-500/10 rounded-[3rem] relative overflow-hidden group">
                              <Wand2 size={120} className="absolute -right-10 -bottom-10 text-indigo-500/5 group-hover:scale-110 transition-transform duration-700" />
                              <div className="relative z-10 text-center max-w-2xl mx-auto">
                                <h5 className="text-3xl font-black text-white mb-3 italic tracking-tighter">Magic Curriculum Extracter</h5>
                                <p className="text-slate-400 text-sm font-bold mb-8 uppercase tracking-widest leading-relaxed">Paste your raw recipe or class structure below and we'll intelligently map out the curriculum for you.</p>
                                <textarea rows={3} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Paste raw text content here..." className="w-full bg-slate-950 border-2 border-indigo-500/10 rounded-[2rem] px-8 py-6 text-lg text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/30 transition-all custom-scrollbar mb-6 shadow-2xl" />
                                <button type="button" onClick={handleClassSmartParse} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-[0_10px_40px_rgba(79,70,229,0.4)] transition-all active:scale-95">Extract Curriculum ✨</button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                              {/* Ingredients */}
                              <div className="space-y-6">
                                <div className="flex items-center justify-between px-4">
                                  <h5 className="font-black text-xl text-white uppercase tracking-tighter italic">Ingredient Deck</h5>
                                  <button type="button" onClick={() => setClassForm({ ...classForm, ingredients: [...(classForm.ingredients || []), { name: '', amount: '' }] })} className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-500 shadow-lg transition-colors"><Plus size={20} /></button>
                                </div>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                  {(classForm.ingredients || []).map((ing, idx) => (
                                    <div key={idx} className="flex gap-3 group">
                                      <input placeholder="Qty" value={ing.amount} onChange={e => { const n = [...(classForm.ingredients || [])]; n[idx] = { ...n[idx], amount: e.target.value }; setClassForm({ ...classForm, ingredients: n }); }} className="w-1/3 bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 text-white transition-all" />
                                      <input placeholder="Ingredient Name" value={ing.name} onChange={e => { const n = [...(classForm.ingredients || [])]; n[idx] = { ...n[idx], name: e.target.value }; setClassForm({ ...classForm, ingredients: n }); }} className="w-2/3 bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 text-white transition-all" />
                                      <button type="button" onClick={() => setClassForm({ ...classForm, ingredients: (classForm.ingredients || []).filter((_, i) => i !== idx) })} className="w-14 bg-rose-500/5 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Instructions */}
                              <div className="space-y-6">
                                <div className="flex items-center justify-between px-4">
                                  <h5 className="font-black text-xl text-white uppercase tracking-tighter italic">Production Steps</h5>
                                  <button type="button" onClick={() => setClassForm({ ...classForm, steps: [...(classForm.steps || []), ''] })} className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-500 shadow-lg transition-colors"><Plus size={20} /></button>
                                </div>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                  {(classForm.steps || []).map((step, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                      <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 flex-shrink-0 mt-1 shadow-lg text-xs">{idx + 1}</div>
                                      <textarea rows={2} value={step} onChange={e => { const n = [...(classForm.steps || [])]; n[idx] = e.target.value; setClassForm({ ...classForm, steps: n }); }} className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 text-white custom-scrollbar transition-all" placeholder="Enter instructional step..." />
                                      <button type="button" onClick={() => setClassForm({ ...classForm, steps: (classForm.steps || []).filter((_, i) => i !== idx) })} className="w-14 bg-rose-500/5 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all h-14 mt-1 opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Notes & Attachments */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                              <div className="space-y-6">
                                <div className="flex items-center justify-between px-4">
                                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">Studio Notes & Tips</h5>
                                  <button type="button" onClick={() => setClassForm({ ...classForm, notes: [...(classForm.notes || []), ''] })} className="text-[10px] font-black text-indigo-400 flex items-center gap-1 hover:text-indigo-300 px-4 py-2 bg-indigo-500/10 rounded-full transition-all border border-indigo-500/10">Add Secret Tip</button>
                                </div>
                                <div className="space-y-4">
                                  {(Array.isArray(classForm.notes) ? classForm.notes : []).map((note, idx) => (
                                    <div key={idx} className="flex gap-3 group">
                                      <input value={note} onChange={e => { const n = [...(Array.isArray(classForm.notes) ? classForm.notes : [])]; n[idx] = e.target.value; setClassForm({ ...classForm, notes: n }); }} className="w-full bg-slate-950 border border-white/5 rounded-[1.5rem] px-8 py-5 text-sm font-bold outline-none text-white focus:border-indigo-500/50 transition-all" placeholder="Special Chef's Tip..." />
                                      <button type="button" onClick={() => setClassForm({ ...classForm, notes: (Array.isArray(classForm.notes) ? classForm.notes : []).filter((_, i) => i !== idx) })} className="w-14 bg-rose-500/5 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-6">
                                <div className="flex items-center justify-between px-4">
                                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">Resource Attachments</h5>
                                  {(classForm.attachments || []).length < 5 && (
                                    <button type="button" onClick={() => setClassForm({ ...classForm, attachments: [...(classForm.attachments || []), { title: '', url: '' }] })} className="text-[10px] font-black text-indigo-400 flex items-center gap-1 hover:text-indigo-300 px-4 py-2 bg-indigo-500/10 rounded-full transition-all border border-indigo-500/10">Attach Resource</button>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  {(classForm.attachments || []).map((att, idx) => (
                                    <div key={idx} className="flex gap-2 group items-center">
                                      <input placeholder="Resource Title" value={att.title} onChange={e => { const n = [...(classForm.attachments || [])]; n[idx] = { ...n[idx], title: e.target.value }; setClassForm({ ...classForm, attachments: n }); }} className="w-1/3 bg-slate-950 border border-white/5 rounded-l-2xl px-6 py-5 text-xs font-bold outline-none focus:border-indigo-500/50 text-white transition-all" />
                                      <div className="flex-1 relative flex items-center">
                                        <input placeholder="Resource Link (URL)" value={att.url} onChange={e => { const n = [...(classForm.attachments || [])]; n[idx] = { ...n[idx], url: e.target.value }; setClassForm({ ...classForm, attachments: n }); }} className="w-full bg-slate-950 border border-white/5 px-6 py-5 text-xs font-bold outline-none focus:border-indigo-500/50 text-white transition-all pr-12" />
                                        <button type="button" onClick={() => setAttachmentPickerIdx(idx)} className="absolute right-2 p-2 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg text-white transition-all shadow-lg">
                                          <Library size={14} />
                                        </button>
                                      </div>
                                      <button type="button" onClick={() => { const n = (classForm.attachments || []).filter((_, i) => i !== idx); setClassForm({ ...classForm, attachments: n }); }} className="w-14 flex-shrink-0 bg-slate-950 text-slate-500 hover:text-rose-400 border border-white/5 border-l-0 rounded-r-2xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                                    </div>
                                  ))}
                                </div>
                                <MediaPickerModal
                                  isOpen={attachmentPickerIdx !== null}
                                  onClose={() => setAttachmentPickerIdx(null)}
                                  onSelect={(media) => {
                                    const n = [...(classForm.attachments || [])];
                                    n[attachmentPickerIdx] = {
                                      ...n[attachmentPickerIdx],
                                      title: n[attachmentPickerIdx].title || media.filename,
                                      url: media.hero_url || media.url
                                    };
                                    setClassForm({ ...classForm, attachments: n });
                                    setAttachmentPickerIdx(null);
                                  }}
                                />
                              </div>
                            </div>

                            <div className="pt-12 flex justify-between items-center">
                              <button type="button" onClick={() => setClassFormSection('production')} className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black text-sm uppercase tracking-widest active:scale-95 transition-all">Back to Studio</button>
                              <button type="submit" className="px-16 py-6 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 rounded-full font-black text-2xl text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 transition-all italic tracking-tighter">
                                Finalize Production! 🎬
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
          {activeTab === 'merch' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Merch Inventory</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Active SKUs: {merch.length}</p>
                </div>
                {!isCreating && <button onClick={() => { setMerchForm({ title: '', price: '', image: '', description: '', status: 'published', stock: 10, scheduled_post_date: '' }); setIsCreating(true); }} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all"><Plus size={14} /> New Product</button>}
              </div>

              {!isCreating ? (
                <div>
                  {fMerch.length === 0 ? (
                    <div className="py-20 text-center bg-white/5 border-[0.5px] border-dashed border-white/10 rounded-3xl">
                      <ShoppingBag size={40} className="mx-auto text-slate-700 mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No inventory logged</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                      {fMerch.map(m => {
                        const isSelected = selectedItems.has(m.id);
                        return (
                          <motion.div layout key={m.id}
                            className={`group relative bg-[#0F172A]/40 border rounded-2xl overflow-hidden transition-all hover:shadow-xl ${m.status === 'draft' ? 'opacity-60' : ''} ${isSelected ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.12)]' : 'border-white/5 hover:border-indigo-500/30'}`}
                          >
                            {/* Image */}
                            <div className="aspect-square relative bg-slate-900 overflow-hidden">
                              {m.image
                                ? <img src={m.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                : <ShoppingBag size={28} className="absolute inset-0 m-auto text-slate-700" />}
                              {/* God mode checkbox */}
                              {godMode && (
                                <button onClick={() => toggleSelection(m.id)}
                                  className={`absolute top-2 left-2 w-6 h-6 rounded-lg border-2 flex items-center justify-center z-10 transition-all ${isSelected ? 'bg-rose-500 border-rose-500' : 'bg-slate-900/80 border-white/20 backdrop-blur-sm'}`}>
                                  {isSelected && <CheckCircle2 size={12} className="text-white" />}
                                </button>
                              )}
                              {/* Low stock badge */}
                              {m.stock <= 5 && (
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500 rounded-full text-[8px] font-black text-white uppercase tracking-widest">Low</div>
                              )}
                              {/* Status */}
                              <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'published' ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                                <span className={`text-[8px] font-black uppercase ${m.status === 'published' ? 'text-indigo-300' : 'text-amber-300'}`}>{m.status}</span>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="p-3">
                              <h4 className="text-[11px] font-black text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors mb-1">{m.title}</h4>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-indigo-400">${m.price}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${m.stock <= 5 ? 'text-rose-400' : 'text-slate-500'}`}>{m.stock} units</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="px-3 pb-3 flex gap-2">
                              <button onClick={() => {
                                const merchToEdit = { ...m };
                                if (m.media_id && Array.isArray(media)) merchToEdit.image = media.find(asset => asset.id === m.media_id) || m.image;
                                setMerchForm(merchToEdit);
                                setIsCreating(true);
                              }} className="flex-1 py-2 text-slate-400 hover:text-white bg-white/5 hover:bg-indigo-600 rounded-xl border border-white/5 hover:border-indigo-500 transition-all flex items-center justify-center gap-1 text-[10px] font-black uppercase">
                                <Edit3 size={11} /> Edit
                              </button>
                              <button onClick={() => requestDelete('merch', m.id, m.title)}
                                className="w-9 py-2 text-rose-400/60 hover:text-white hover:bg-rose-500 bg-rose-500/5 rounded-xl border border-rose-500/10 hover:border-rose-500 transition-all flex items-center justify-center">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full bg-[#0F172A]/30 border-[0.5px] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-indigo-600 p-8 md:p-10 flex justify-between items-center relative overflow-hidden" style={{ backgroundColor: 'var(--accent)' }}>
                    <ShoppingBag className="absolute right-10 opacity-20 w-40 h-40" />
                    <h4 className="text-3xl md:text-4xl font-black text-white relative z-10">{merchForm.id ? 'Edit Product' : 'Add Product'}</h4>
                    <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center relative z-10 transition-colors"><X size={28} /></button>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const { id, ...formData } = merchForm;
                    const data = {
                      ...formData,
                      name: formData.title,
                      scheduled_post_date: formData.scheduled_post_date || null
                    };
                    delete data.title;

                    if (data.image && typeof data.image === 'object' && data.image.id) {
                      data.media_id = data.image.id;
                      data.image = data.image.hero_url || data.image.url;
                    }

                    if (id) updateProduct(id, data); else addProduct(data);
                    setIsCreating(false); showToast(`Product Saved! 👕`);
                  }} className="p-6 md:p-10 space-y-8">
                    <div className="flex items-center justify-between bg-slate-950 p-4 rounded-3xl border border-slate-800">
                      <span className="font-bold text-slate-400 uppercase tracking-widest pl-4 text-sm">Status</span>
                      <div className="flex bg-slate-900 rounded-2xl p-1">
                        <button type="button" onClick={() => setMerchForm({ ...merchForm, status: 'draft' })} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${merchForm.status === 'draft' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}><EyeOff size={16} className="inline mr-2" />Draft</button>
                        <button type="button" onClick={() => setMerchForm({ ...merchForm, status: 'published' })} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${merchForm.status === 'published' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white'}`}><Eye size={16} className="inline mr-2" />Published</button>
                      </div>
                    </div>

                    <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Product Name</label><input required type="text" value={merchForm.title} onChange={e => setMerchForm({ ...merchForm, title: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Price ($)</label><input required type="text" value={merchForm.price} onChange={e => setMerchForm({ ...merchForm, price: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>
                      <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Stock Level</label><input required type="number" value={merchForm.stock} onChange={e => setMerchForm({ ...merchForm, stock: parseInt(e.target.value) })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white" /></div>
                    </div>
                    <div className="space-y-3"><MediaUploader label="Image (JPG, PNG, SVG)" value={merchForm.image} onChange={(val) => setMerchForm({ ...merchForm, image: val })} /></div>
                    <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Description</label><textarea rows={3} value={merchForm.description} onChange={e => setMerchForm({ ...merchForm, description: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-lg font-bold outline-none text-white custom-scrollbar" /></div>
                    <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Scheduled Post Date (Optional)</label><input type="datetime-local" value={merchForm.scheduled_post_date || ''} onChange={e => setMerchForm({ ...merchForm, scheduled_post_date: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white appearance-none custom-scrollbar" /></div>

                    <button type="submit" className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all mt-4">Save Product! 🛍️</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* PEOPLE */}
          {activeTab === 'people' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Member Intelligence</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Total Users: {people.length}</p>
                </div>
                {!isCreating && <JankFreeButton onClick={() => { setPersonForm({ id: null, name: '', email: '', subscriptionTier: 'Free', role: 'user', unlockedVolumes: [], unlockedClasses: [] }); setIsCreating(true); }} className="h-10 px-6"><UserPlus size={16} className="mr-2" /> Add Member</JankFreeButton>}
              </div>

              {!isCreating ? (
                <div>
                  {fPeople.length === 0 ? (
                    <div className="p-32 text-center bg-white/5 border-[0.5px] border-dashed border-white/10 rounded-3xl">
                      <Users size={64} className="mx-auto text-slate-700 mb-6" />
                      <p className="text-xl font-black text-slate-500 uppercase tracking-widest">No members found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                      {fPeople.slice(0, visiblePeopleCount).map(p => {
                        const tierMeta = getTierMeta(p.subscriptionTier || p.subscription_tier || 'Free');
                        const isSelected = selectedItems.has(p.id);
                        return (
                          <motion.div layout key={p.id}
                            className={`group relative bg-[#0F172A]/40 border rounded-2xl p-3 transition-all hover:shadow-lg ${isSelected ? 'border-rose-500/50' : 'border-white/5 hover:border-indigo-500/30'}`}
                          >
                            {/* Header: avatar + god mode */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {godMode && (
                                  <button onClick={() => toggleSelection(p.id)}
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-rose-500 border-rose-500' : 'border-slate-700 bg-slate-900/50'}`}>
                                    {isSelected && <CheckCircle2 size={10} className="text-white" />}
                                  </button>
                                )}
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border flex-shrink-0 ${tierMeta.bg} ${tierMeta.color} ${tierMeta.border}`}
                                  style={tierMeta.customColor ? { backgroundColor: `${tierMeta.customColor}15`, borderColor: `${tierMeta.customColor}35`, color: tierMeta.customColor } : {}}>
                                  {p.name?.[0]?.toUpperCase() || '?'}
                                </div>
                              </div>
                              {/* Quick actions */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setPersonForm({ id: p.id, name: p.name, email: p.email, subscriptionTier: p.subscriptionTier || p.subscription_tier || 'Free', role: p.role || 'user', unlockedVolumes: p.unlocked_volumes || [], unlockedClasses: p.unlocked_classes || [] }); setIsCreating(true); }}
                                  className="w-7 h-7 text-slate-400 hover:text-white bg-white/5 hover:bg-indigo-600 rounded-lg border border-white/5 flex items-center justify-center transition-all">
                                  <Edit3 size={11} />
                                </button>
                                <button onClick={() => requestDelete('people', p.id, p.name)}
                                  className="w-7 h-7 text-rose-400/60 hover:text-white hover:bg-rose-500 bg-rose-500/5 rounded-lg border border-rose-500/10 flex items-center justify-center transition-all">
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>

                            {/* Identity */}
                            <h4 className="text-[11px] font-black text-white leading-tight group-hover:text-indigo-300 transition-colors truncate">{p.name || 'Anonymous'}</h4>
                            <p className="text-[9px] text-slate-500 font-bold truncate mt-0.5 mb-3">{p.email}</p>

                            {/* Inline controls */}
                            <div className="space-y-1.5 border-t border-white/5 pt-2">
                              <select value={p.subscriptionTier || p.subscription_tier || 'Free'} onChange={async (e) => {
                                await updateUserTier(p.id, e.target.value);
                                showToast(`${p.name} tier updated!`);
                              }} className={`w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer ${tierMeta.color} hover:bg-white/10 transition-colors`}>
                                <option value="Free">Free</option>
                                {(settings.premiumTiers || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                              </select>
                              <select value={p.role || 'user'} onChange={async (e) => {
                                await updateUser(p.id, { role: e.target.value });
                                showToast(`${p.name} role updated!`);
                              }} className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-400 hover:bg-white/10 transition-colors">
                                <option value="user">User</option>
                                <option value="employee">Staff</option>
                                <option value="management">Management</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {fPeople.length > visiblePeopleCount && (
                    <div className="flex flex-col items-center gap-2 pt-6">
                      <button onClick={() => setVisiblePeopleCount(prev => prev + 50)}
                        className="px-10 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all active:scale-95">
                        Load {Math.min(50, fPeople.length - visiblePeopleCount)} More Members
                      </button>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Showing {visiblePeopleCount} of {fPeople.length}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-2xl mx-auto bg-[#0F172A] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <div className="bg-indigo-600 p-6 md:p-8 flex justify-between items-center" style={{ backgroundColor: 'var(--accent)' }}>
                    <h4 className="text-2xl md:text-3xl font-black text-white">{personForm.id ? 'Edit Member' : 'Add Member'}</h4>
                    <button onClick={() => setIsCreating(false)} className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"><X size={28} /></button>
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
                    <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Name</label><input required type="text" value={personForm.name} onChange={e => setPersonForm({ ...personForm, name: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" /></div>
                    <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Email Address</label><input required type="email" value={personForm.email} onChange={e => setPersonForm({ ...personForm, email: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" /></div>
                    <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">Access Level</label>
                      <select value={personForm.subscriptionTier} onChange={e => setPersonForm({ ...personForm, subscriptionTier: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-black text-white outline-none cursor-pointer">
                        <option value="Free">Free Access</option>
                        {(settings.premiumTiers || []).map(t => <option key={t.id} value={t.name}>{t.name} Access</option>)}
                      </select>
                    </div>
                    <div className="space-y-3"><label className="text-sm font-black uppercase text-slate-500 ml-2">System Role</label>
                      <select value={personForm.role} onChange={e => setPersonForm({ ...personForm, role: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-black text-white outline-none cursor-pointer">
                        <option value="user">User</option>
                        <option value="employee">Employee</option>
                        <option value="management">Management</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    {personForm.id && (
                      <div className="pt-8 border-t border-slate-800 space-y-8">
                        <div>
                          <h4 className="text-xl font-black text-white mb-4 flex items-center gap-3"><Book size={24} className="text-indigo-400" /> Volumes Access</h4>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {(settings.volumes || []).map(v => {
                              const isUnlocked = personForm.unlockedVolumes.includes(v.name);
                              return (
                                <div key={v.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                  <span className="font-bold text-slate-300">{v.name}</span>
                                  <button type="button" onClick={() => setUnlockContext({ isOpen: true, itemType: 'volume', itemId: v.name, itemName: v.name, action: isUnlocked ? 'lock' : 'unlock' })} className={`px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2 transition-colors ${isUnlocked ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}`}>
                                    {isUnlocked ? <><Unlock size={14} /> Unlocked</> : <><LockIcon size={14} /> Locked</>}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white mb-4 flex items-center gap-3"><Video size={24} className="text-indigo-400" /> Masterclasses Access</h4>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {classes.map(c => {
                              const isUnlocked = personForm.unlockedClasses.includes(c.id);
                              return (
                                <div key={c.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                  <span className="font-bold text-slate-300 truncate pr-4">{c.title}</span>
                                  <button type="button" onClick={() => setUnlockContext({ isOpen: true, itemType: 'class', itemId: c.id, itemName: c.title, action: isUnlocked ? 'lock' : 'unlock' })} className={`px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2 transition-colors ${isUnlocked ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}`}>
                                    {isUnlocked ? <><Unlock size={14} /> Unlocked</> : <><LockIcon size={14} /> Locked</>}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <button type="submit" className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 rounded-full font-black text-xl text-white shadow-xl active:scale-95 transition-all mt-4">{personForm.id ? 'Save Changes' : 'Add Them Now!'}</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* BROADCASTS */}
          {activeTab === 'broadcasts' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Member Alerts</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Native Push Orchestration Engine</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-[#0F172A]/30 px-4 py-2 rounded-xl border border-white/5">
                    <Smartphone className="text-indigo-400" size={14} />
                    <p className="text-sm font-black text-white">
                      {people?.filter(p => p.push_subscription || p.pushSubscription).length || 0}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 border-l border-white/10 pl-3">Linked Devices</span>
                  </div>
                  <button onClick={() => window.location.reload()} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 transition-all"><Loader2 size={16} /></button>
                </div>
              </div>

              <div className="bg-[#0F172A]/30 border-[0.5px] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
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
                    fetchAdminBroadcasts();
                  } catch (err) {
                    console.error("Broadcast failed:", err);
                    showToast(`Failed: ${err.message || 'Check console'}`, "error");
                  }
                }} className="p-8 md:p-10 space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase text-slate-500 ml-2">Notification Title</label>
                    <input required type="text" value={broadcastForm.title} onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="e.g. New Masterclass Dropped!" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase text-slate-500 ml-2">Message Body</label>
                    <textarea required rows={3} value={broadcastForm.message} onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-lg font-bold outline-none text-white custom-scrollbar focus:border-indigo-500" placeholder="Write your announcement here..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase text-slate-500 ml-2">Icon / Type</label>
                      <select value={broadcastForm.type} onChange={e => setBroadcastForm({ ...broadcastForm, type: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-black text-white outline-none cursor-pointer focus:border-indigo-500">
                        <option value="system">System (Info)</option>
                        <option value="class">Class (Star)</option>
                        <option value="shop">Shop (Bag)</option>
                        <option value="alert">Alert (Bell)</option>
                        <option value="success">Success (Check)</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase text-slate-500 ml-2">Attachment Type</label>
                      <select value={broadcastForm.attachmentType} onChange={e => setBroadcastForm({ ...broadcastForm, attachmentType: e.target.value, attachmentId: '' })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-black text-white outline-none cursor-pointer focus:border-indigo-500">
                        <option value="none">No Attachment</option>
                        <option value="recipe">Link a Recipe</option>
                        <option value="class">Link a Masterclass</option>
                      </select>
                    </div>
                  </div>

                  {broadcastForm.attachmentType === 'recipe' && (
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase text-slate-500 ml-2">Select Recipe</label>
                      <select required value={broadcastForm.attachmentId} onChange={e => setBroadcastForm({ ...broadcastForm, attachmentId: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold text-white outline-none cursor-pointer focus:border-indigo-500">
                        <option value="" disabled>-- Choose Recipe --</option>
                        {recipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </select>
                    </div>
                  )}

                  {broadcastForm.attachmentType === 'class' && (
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase text-slate-500 ml-2">Select Masterclass</label>
                      <select required value={broadcastForm.attachmentId} onChange={e => setBroadcastForm({ ...broadcastForm, attachmentId: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold text-white outline-none cursor-pointer focus:border-indigo-500">
                        <option value="" disabled>-- Choose Class --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase text-slate-500 ml-2">Scheduled Delivery Date (Optional)</label>
                    <input type="datetime-local" value={broadcastForm.scheduled_post_date || ''} onChange={e => setBroadcastForm({ ...broadcastForm, scheduled_post_date: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white appearance-none custom-scrollbar focus:border-indigo-500" />
                    <p className="text-xs text-slate-500 ml-2 mt-1 font-bold">If left blank, the notification will be sent immediately.</p>
                  </div>

                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Zap className="text-indigo-400" size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-white">Native Push Orchestration</p>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        By clicking blast, this alert will be stored in the member's history and a <span className="font-black text-white">Native Push Notification</span> will be sent to all <span className="font-black text-indigo-400">{people.filter(p => p.push_subscription || p.pushSubscription).length}</span> linked devices.
                      </p>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black text-xl text-white shadow-[0_8px_32px_rgba(79,70,229,0.4)] active:scale-95 transition-all mt-4 flex items-center justify-center gap-3">
                    <Send size={24} /> Blast Broadcast Now!
                  </button>
                </form>
              </div>

              <div className="mt-12 space-y-6">
                <h3 className="text-2xl md:text-3xl font-black mb-4 flex items-center gap-3"><Clock size={32} className="text-indigo-400" /> History & Scheduled</h3>
                <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] overflow-hidden shadow-lg">
                  <div className="grid grid-cols-1 divide-y divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {adminBroadcasts.map(b => {
                      const isDraft = b.scheduled_post_date && new Date(b.scheduled_post_date) > new Date();
                      return (
                        <div key={b.id} className={`p-6 hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${selectedItems.has(b.id) ? 'bg-rose-500/5 border-rose-500/20' : ''}`}>
                          <div className="flex-1 min-w-0 flex items-center gap-4">
                            {godMode && (
                              <button
                                onClick={() => toggleSelection(b.id)}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedItems.has(b.id) ? 'bg-rose-500 border-rose-500' : 'border-slate-700 bg-slate-900/50'}`}
                              >
                                {selectedItems.has(b.id) && <CheckCircle2 size={14} className="text-white" />}
                              </button>
                            )}
                            <div className="flex-1 min-w-0">

                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-black text-lg text-white truncate">{b.title}</h5>
                                {isDraft ? (
                                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded border border-amber-500/30 flex items-center gap-1"><Clock size={12} /> Scheduled</span>
                                ) : (
                                  <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase rounded border border-indigo-500/30 flex items-center gap-1"><CheckCircle2 size={12} /> Sent</span>
                                )}
                              </div>
                              <p className="text-slate-400 font-medium text-sm line-clamp-2">{b.message}</p>
                              <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-500">
                                <span>Created: {new Date(b.created_at).toLocaleDateString()}</span>
                                {b.scheduled_post_date && <span className={isDraft ? "text-amber-400" : ""}>Scheduled for: {new Date(b.scheduled_post_date).toLocaleString()}</span>}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => requestDelete('broadcasts', b.id, b.title)} className="w-12 h-12 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"><Trash2 size={20} /></button>
                        </div>
                      )
                    })}
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
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Automation Hub</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Plugins, Integrations & API Keys</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* App Store */}
                <div className="p-6 md:p-8 bg-[#0F172A]/30 border-[0.5px] border-white/10 rounded-2xl shadow-2xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 mb-4"><Puzzle size={14} className="text-indigo-400" /> App Store</h4>
                  <div className="space-y-2">
                    {AVAILABLE_PLUGINS.map(plug => (
                      <div key={plug.id} className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${settings.plugins?.[plug.id] ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                          <plug.icon size={18} className={plug.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-black text-white leading-tight">{plug.name}</h5>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5 truncate">{plug.desc}</p>
                        </div>
                        <button onClick={() => {
                          const n = { ...(settings.plugins || {}), [plug.id]: !settings.plugins?.[plug.id] };
                          updateSettings({ ...settings, plugins: n });
                          showToast(n[plug.id] ? `${plug.name} Connected!` : `${plug.name} Disconnected`);
                        }} className={`w-12 h-6 rounded-full relative transition-all border flex-shrink-0 ${settings.plugins?.[plug.id] ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-900 border-slate-700'}`} style={settings.plugins?.[plug.id] ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}>
                          <motion.div animate={{ x: settings.plugins?.[plug.id] ? 22 : 2 }} className="w-4 h-4 bg-white rounded-full absolute top-0.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Keys */}
                <div className="p-6 md:p-8 bg-[#0F172A]/30 border-[0.5px] border-white/10 rounded-2xl shadow-2xl flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2"><Key size={14} className="text-indigo-400" /> API Keys</h4>
                    <button onClick={generateApiKey} className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95">Generate New</button>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {(settings.apiKeys || []).map(k => (
                      <div key={k.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-4 hover:border-white/10 transition-all group">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-black text-white">{k.name}</p>
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase rounded border border-indigo-500/20">Active</span>
                          </div>
                          <code className="text-[10px] text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg block truncate font-bold">{k.key}</code>
                        </div>
                        <button onClick={() => removeApiKey(k.id)} className="p-2 text-rose-500/60 hover:text-rose-400 bg-rose-500/5 rounded-lg border border-rose-500/10 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    {(!settings.apiKeys || settings.apiKeys.length === 0) && (
                      <div className="py-16 flex flex-col items-center justify-center text-center bg-white/5 border-[0.5px] border-dashed border-white/10 rounded-xl">
                        <Link2 size={32} className="text-slate-700 mb-3" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No API keys yet</p>
                        <p className="text-[10px] text-slate-600 font-bold mt-1">Generate one to connect external tools</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Core Configuration</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Platform Rules & Design System</p>
                </div>
                <button onClick={handleSaveSettings} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-xl flex items-center gap-3 text-xs uppercase tracking-widest active:scale-95 transition-all" style={{ backgroundColor: 'var(--accent)' }}>
                  <Save size={18} /> Commit Changes
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 md:p-8 rounded-2xl bg-[#0F172A]/30 border-[0.5px] border-white/10 space-y-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h4 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3"><DollarSign size={16} className="text-indigo-400" /> Membership Tiers</h4>
                    <div className="flex items-center gap-6 flex-wrap">
                      {/* Currency selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-500">Currency</span>
                        <select
                          value={settings.currency || 'MYR'}
                          onChange={e => updateSettings({ ...settings, currency: e.target.value })}
                          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-white outline-none cursor-pointer focus:border-indigo-500 transition-all"
                        >
                          {Object.entries(CURRENCY_GROUPS).map(([region, list]) => (
                            <optgroup key={region} label={region}>
                              {list.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      {/* Accent colour */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-500">Accent</span>
                        <input type="color" value={settings.accentColor || '#4f46e5'} onChange={e => updateSettings({ ...settings, accentColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer bg-slate-900 border-none outline-none overflow-hidden" />
                      </div>
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
                            <label className="text-[10px] font-black uppercase text-indigo-500 ml-2 mb-1 block">Discount %</label>
                            <span className="absolute right-4 top-[22px] text-indigo-500 font-black">%</span>
                            <input type="number" min="0" max="100" value={tier.discount || 0} onChange={e => {
                              const newTiers = [...settings.premiumTiers];
                              newTiers[idx].discount = parseInt(e.target.value) || 0;
                              updateSettings({ ...settings, premiumTiers: newTiers });
                            }} className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-2xl pl-4 pr-8 py-2 font-bold text-indigo-400 outline-none focus:border-indigo-500 text-sm" placeholder="Discount %" />
                          </div>
                          <div className="mt-4">
                            <textarea value={tier.benefits} onChange={e => {
                              const newTiers = [...settings.premiumTiers];
                              newTiers[idx].benefits = e.target.value;
                              updateSettings({ ...settings, premiumTiers: newTiers });
                            }} rows="2" className="w-full bg-slate-900 text-sm font-medium text-slate-400 p-4 rounded-2xl border border-slate-800 outline-none custom-scrollbar" placeholder="Benefits (comma separated)"></textarea>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* VOLUME & COLLECTION MANAGER */}
                <div className="bg-[#0F172A]/30 border-2 border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                      <div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Recipe Collections</h3>
                        <p className="text-slate-400 font-bold max-w-lg">Manage premium volumes, pricing, and specialized content tiers.</p>
                      </div>
                      <button
                        onClick={() => {
                          const newId = 'v' + Date.now();
                          const newVols = [...(settings.volumes || []), { id: newId, name: 'New Volume', price: '9.99', discount: 0 }];
                          updateSettings({ ...settings, volumes: newVols });
                        }}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                      >
                        <Plus size={18} /> Add New Volume
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {(settings.volumes || []).map((vol, idx) => (
                        <div key={vol.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col md:flex-row items-end gap-6 hover:bg-white/[0.04] transition-all">
                          <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Volume Name</label>
                            <input
                              type="text"
                              value={vol.name}
                              onChange={e => {
                                const newVols = [...(settings.volumes || [])];
                                newVols[idx].name = e.target.value;
                                updateSettings({ ...settings, volumes: newVols });
                              }}
                              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all"
                            />
                          </div>
                          <div className="w-full md:w-32 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Price (USD)</label>
                            <input
                              type="text"
                              value={vol.price}
                              onChange={e => {
                                const newVols = [...(settings.volumes || [])];
                                newVols[idx].price = e.target.value;
                                updateSettings({ ...settings, volumes: newVols });
                              }}
                              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all"
                            />
                          </div>
                          <div className="w-full md:w-32 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Discount %</label>
                            <input
                              type="number"
                              value={vol.discount}
                              onChange={e => {
                                const newVols = [...(settings.volumes || [])];
                                newVols[idx].discount = parseInt(e.target.value) || 0;
                                updateSettings({ ...settings, volumes: newVols });
                              }}
                              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${vol.name}" from the system?`)) {
                                const newVols = settings.volumes.filter(v => v.id !== vol.id);
                                updateSettings({ ...settings, volumes: newVols });
                              }
                            }}
                            className="p-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                      {(settings.volumes || []).length === 0 && (
                        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500 font-bold">
                          No custom volumes created yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-8 md:p-10 rounded-[40px] bg-slate-900 border-2 border-slate-800 space-y-8">
                    <h4 className="font-black text-2xl uppercase tracking-widest text-slate-500 flex items-center gap-3"><Settings size={28} className="text-indigo-400" /> The Basics</h4>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-black uppercase text-slate-500 block mb-3 ml-2">Name of your site</label>
                        <input type="text" value={settings.siteName} onChange={e => updateSettings({ ...settings, siteName: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" />
                      </div>
                      <div className="p-6 bg-rose-500/10 border-2 border-rose-500/20 rounded-[32px] flex items-center justify-between">
                        <div>
                          <p className="text-lg font-black text-rose-400">Lock the site?</p>
                          <p className="text-xs text-rose-400/60 font-bold uppercase mt-1">Maintenance mode</p>
                        </div>
                        <button onClick={() => updateSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })} className={`w-16 h-8 rounded-full relative transition-colors border-2 ${settings.maintenanceMode ? 'bg-rose-500 border-rose-500' : 'bg-slate-950 border-slate-700'}`}>
                          <motion.div animate={{ x: settings.maintenanceMode ? 32 : 2 }} className="w-6 h-6 bg-white rounded-full absolute top-0.5" />
                        </button>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-6">
                        <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2"><Zap size={14} className="text-indigo-400" /> Live Stream Sync</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">YouTube Live URL</label>
                            <input type="text" value={settings.youtubeLiveUrl || ''} onChange={e => updateSettings({ ...settings, youtubeLiveUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold outline-none text-white focus:border-indigo-500" placeholder="https://youtube.com/live/..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">TikTok Live URL</label>
                            <input type="text" value={settings.tiktokLiveUrl || ''} onChange={e => updateSettings({ ...settings, tiktokLiveUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold outline-none text-white focus:border-indigo-500" placeholder="https://tiktok.com/@user/live" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-10 rounded-[40px] bg-slate-900 border-2 border-slate-800 space-y-8">
                    <h4 className="font-black text-2xl uppercase tracking-widest text-slate-500 flex items-center gap-3"><ImageIcon size={28} className="text-amber-400" /> Hero Layout</h4>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-black uppercase text-slate-500 block mb-3 ml-2">Main Headline</label>
                        <input type="text" value={settings.heroTitle} onChange={e => updateSettings({ ...settings, heroTitle: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-slate-950 p-2 rounded-full border border-slate-800">
                        <button onClick={() => updateSettings({ ...settings, heroMediaType: 'image' })} className={`py-3 rounded-full font-bold text-sm transition-all ${(!settings.heroMediaType || settings.heroMediaType === 'image') ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><ImageIcon size={16} className="inline mr-2" /> Image</button>
                        <button onClick={() => updateSettings({ ...settings, heroMediaType: 'video' })} className={`py-3 rounded-full font-bold text-sm transition-all ${settings.heroMediaType === 'video' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><PlayCircle size={16} className="inline mr-2" /> Auto-Video</button>
                      </div>
                      <div className="space-y-2">
                        <MediaUploader
                          label={settings.heroMediaType === 'video' ? "Background Video (MP4)" : "Background Image (JPG/PNG)"}
                          value={settings.heroMediaUrl || ''}
                          onChange={val => updateSettings({ ...settings, heroMediaUrl: val?.hero_url || val?.url || val })}
                        />
                        {settings.heroMediaType === 'video' && <p className="text-xs text-amber-500 font-bold mt-2 ml-4">Video will automatically play muted in the background.</p>}
                      </div>

                      <div className="p-6 bg-slate-950 border-2 border-slate-800 rounded-[32px] mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-lg font-black text-white">Top Banner</p>
                          <button onClick={() => updateSettings({ ...settings, bannerEnabled: !settings.bannerEnabled })} className={`w-16 h-8 rounded-full relative transition-colors border-2 ${settings.bannerEnabled ? 'bg-amber-500 border-amber-500' : 'bg-slate-950 border-slate-700'}`}>
                            <motion.div animate={{ x: settings.bannerEnabled ? 32 : 2 }} className="w-6 h-6 bg-white rounded-full absolute top-0.5" />
                          </button>
                        </div>
                        <textarea rows={2} value={settings.bannerText} onChange={e => updateSettings({ ...settings, bannerText: e.target.value })} className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none text-white focus:border-indigo-500 custom-scrollbar" placeholder="Type your announcement here..." />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-10 rounded-[40px] bg-slate-900 border-2 border-slate-800 space-y-8">
                    <h4 className="font-black text-2xl uppercase tracking-widest text-slate-500 flex items-center gap-3"><Video size={28} className="text-rose-400" /> Classes Hero</h4>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-black uppercase text-slate-500 block mb-3 ml-2">Select Featured Class</label>
                        <div className="relative">
                          <select value={settings.classesHeroClassId || ''} onChange={e => updateSettings({ ...settings, classesHeroClassId: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white appearance-none cursor-pointer focus:border-indigo-500">
                            <option value="">-- Use Default (Featured Toggle) --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                          </select>
                          <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <MediaUploader
                          label="Custom Hero Backdrop (Optional)"
                          value={settings.classesHeroImageUrl || ''}
                          onChange={val => updateSettings({ ...settings, classesHeroImageUrl: val?.hero_url || val?.url || val })}
                        />
                        <div>
                          <label className="text-sm font-black uppercase text-slate-500 block mb-3 ml-2">Custom Title (Optional)</label>
                          <input type="text" value={settings.classesHeroTitle || ''} onChange={e => updateSettings({ ...settings, classesHeroTitle: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-lg font-bold outline-none text-white focus:border-indigo-500" placeholder="Overrides class title..." />
                        </div>
                        <div>
                          <label className="text-sm font-black uppercase text-slate-500 block mb-3 ml-2">Custom Subtitle / Desc</label>
                          <textarea rows={2} value={settings.classesHeroDesc || ''} onChange={e => updateSettings({ ...settings, classesHeroDesc: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] px-6 py-4 text-sm font-bold outline-none text-white focus:border-indigo-500 custom-scrollbar" placeholder="Overrides class description..." />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {stagingData.items.length > 0 && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0F172A] border-2 border-indigo-500/30 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.3)]">
                <div className="p-10 border-b border-white/5 bg-indigo-600 flex justify-between items-center" style={{ backgroundColor: 'var(--accent)' }}>
                  <div>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase">Bulk Pipeline Active</h4>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.4em] mt-2">Ready to ingest {stagingData.items.length} {stagingData.type} into production database</p>
                  </div>
                  <button onClick={() => setStagingData({ type: null, items: [] })} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/20"><X size={24} /></button>
                </div>
                <div className="p-10 space-y-8">
                  <div className="bg-slate-950/50 rounded-3xl p-8 border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase text-slate-500 border-b border-white/5">
                          <th className="pb-4 tracking-widest">Identification</th>
                          <th className="pb-4 tracking-widest text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {stagingData.items.map((it, idx) => (
                          <tr key={idx} className="text-sm">
                            <td className="py-4 font-bold text-white">{it.title || it.name}</td>
                            <td className="py-4 text-[10px] font-black uppercase text-indigo-400 text-right">
                              <span className="flex items-center justify-end gap-2">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" /> Validated
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setStagingData({ type: null, items: [] })} className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-full font-black text-xs uppercase tracking-widest text-slate-400 transition-all">Abort Sync</button>
                    <button onClick={confirmStagingUpload} className="flex-[2] px-12 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black text-xs uppercase tracking-widest text-white shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all">Confirm Master Sync 🚀</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </main>

        <AnimatePresence>
          {godMode && selectedItems.size > 0 && (
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#070B14] border-2 border-rose-500/30 rounded-[30px] p-4 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl min-w-[400px]"
            >
              <div className="pl-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Selected Payload</p>
                <p className="text-xl font-black text-white">{selectedItems.size} <span className="text-rose-500">Assets</span></p>
              </div>
              <div className="flex-1" />
              <div className="flex gap-2">
                <button onClick={selectAll} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">Select All</button>
                <button
                  onClick={() => {
                    if (confirm(`WIPE ${selectedItems.size} ASSETS FROM EXISTENCE?`)) executeBulkDelete();
                  }}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20"
                >
                  Vaporize Selected
                </button>
                <button
                  onClick={() => setWipeConfirm(true)}
                  className="px-6 py-3 bg-slate-950 hover:bg-black rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 border border-rose-500/20"
                >
                  Wipe Library
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <GenericConfirmModal
          isOpen={wipeConfirm}
          title="ULTIMATE ANNIHILATION"
          message={`Are you absolutely sure you want to PERMANENTLY WIPE EVERYTHING in the ${activeTab} category? This action is irreversible and will delete ALL assets from the database.`}
          onConfirm={executeWipeAll}
          onCancel={() => setWipeConfirm(false)}
          confirmText="Yes, Wipe Everything"
          confirmColor="bg-rose-600 hover:bg-rose-500"
          icon={ShieldAlert}
        />
      </div>
    </div>
  );
}