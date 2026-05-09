import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, Lock, Clock, Download, FileText, ChevronRight, ShoppingBag, Calendar, ListChecks, PlayCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { useClasses } from '../hooks/useClasses';
import { useUser } from '../hooks/useUser';
import { useMedia } from '../hooks/useMedia';
import { useAppSettings } from '../hooks/useAppSettings';
import { createStripeCheckout } from '../lib/stripe';
import { APP_COPY } from '../config/appCopy';
import { formatPrice } from '../lib/currency';
import { supabase } from '../lib/supabase';

// Parses "2h", "90m", "1h 30m", "120" → milliseconds
function parseDurationMs(dur, fallbackHours = 2) {
    if (!dur && !fallbackHours) return fallbackHours * 3600000;
    if (typeof dur === 'number') return dur * 3600000; // treat as hours
    const h = String(dur).match(/(\d+)\s*h/i);
    const m = String(dur).match(/(\d+)\s*m/i);
    const total = (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
    return (total || fallbackHours * 60) * 60000;
}

const ClassCard = ({ cls, onClick, mediaList, now }) => {
    const mediaAsset = (cls.thumbnail_image_id && Array.isArray(mediaList)) ? mediaList.find(m => m.id === cls.thumbnail_image_id) : null;
    const cardImage = mediaAsset ? (mediaAsset.card_url || mediaAsset.thumb_url || mediaAsset.hero_url || mediaAsset.url) : (cls.image || null);

    const liveDate = cls.live_date ? new Date(cls.live_date) : null;
    const liveDurationMs = parseDurationMs(cls.live_duration_hours || 2);
    const isLive = liveDate && now >= liveDate && now <= new Date(liveDate.getTime() + liveDurationMs);
    const isUpcoming = liveDate && now < liveDate;

    return (
        <motion.div
            onClick={() => onClick(cls)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group cursor-pointer flex flex-col relative rounded-xl overflow-hidden bg-[#0F1423] border border-white/5 shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 h-full"
        >
            <div className="aspect-video w-full relative overflow-hidden bg-[#0a0f1d] shrink-0">
                {cardImage ? (
                    <img src={cardImage} alt={cls.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center"><Play size={24} className="text-slate-700" /></div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1423] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                {isLive ? (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-rose-600 rounded-md shadow-lg">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <span className="text-[9px] font-black uppercase text-white tracking-widest">LIVE</span>
                    </div>
                ) : isUpcoming ? (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-indigo-600/90 backdrop-blur-sm rounded-md shadow-lg">
                        <Clock size={10} className="text-white" />
                        <span className="text-[9px] font-black uppercase text-white tracking-widest">UPCOMING</span>
                    </div>
                ) : null}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/30 transition-transform group-hover:scale-110">
                        <Play size={24} className="text-white fill-white ml-1" />
                    </div>
                </div>
            </div>

            <div className="p-5 z-10 relative bg-gradient-to-t from-[#0F1423] via-[#0F1423] to-transparent -mt-8 flex-1 flex flex-col justify-end">
                <h4 className="text-base md:text-lg font-black text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-tight drop-shadow-md">{cls.title}</h4>
                <div className="flex items-center justify-between mt-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate mr-2">{cls.instructor}</p>
                    <span className="text-[11px] font-black text-white bg-white/10 px-2.5 py-1 rounded-md shrink-0 border border-white/5">{formatPrice(cls.price || '29.99', settings.currency || 'MYR')}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default function Classes() {
    const navigate = useNavigate();
    const { publicClasses, fetchClassContent } = useClasses();
    const { user, loading: userLoading, hasAccessToClass, refreshUserFromDB } = useUser();
    const { settings } = useAppSettings();
    const { media } = useMedia();

    const [selectedClass, setSelectedClass] = useState(null);
    const [activeTab, setActiveTab] = useState('video');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isFetchingContent, setIsFetchingContent] = useState(false);

    const hasLoadedInitialUrl = useRef(false);
    const userHasAccess = selectedClass ? hasAccessToClass(selectedClass) : false;

    // Real-time clock — updates every second so LIVE/UPCOMING status flips without a refresh
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Verify payment server-side using the Stripe session_id in the redirect URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const classId = urlParams.get('classId');
        if (!sessionId || !classId || !user?.id) return;

        window.history.replaceState({}, document.title, window.location.pathname);

        (async () => {
            try {
                const { data, error } = await supabase.functions.invoke('verify-payment', {
                    body: { session_id: sessionId, type: 'class', item_id: classId, user_id: user.id },
                });
                if (error || !data?.success) throw new Error(error?.message || 'Verification failed');
                await refreshUserFromDB();
            } catch (err) {
                console.error('Payment verification failed:', err);
            }
        })();
    }, [user?.id]);

    // Handle Deep Link / Auto-open
    useEffect(() => {
        if (hasLoadedInitialUrl.current || publicClasses.length === 0) return;

        const urlParams = new URLSearchParams(window.location.search);
        const directId = urlParams.get('id');

        if (directId) {
            const baseClass = publicClasses.find(c => c.id.toString() === directId || c.id === parseInt(directId));
            if (baseClass) {
                setSelectedClass(baseClass);
                setActiveTab('video');
            }
        }
        hasLoadedInitialUrl.current = true;
    }, [publicClasses]);

    // Declarative Hydration Effect for Theater View
    useEffect(() => {
        if (!selectedClass || !userHasAccess || selectedClass._hasFullContent) return;

        let isMounted = true;

        const loadDetails = async () => {
            setIsFetchingContent(true);
            try {
                const content = await fetchClassContent(selectedClass.id);
                if (isMounted) {
                    setSelectedClass(prev => prev?.id === selectedClass.id ? { ...prev, ...content, _hasFullContent: true } : prev);
                }
            } catch (error) {
                console.error("Failed to fetch class content:", error);
                if (isMounted) {
                    setSelectedClass(prev => prev?.id === selectedClass.id ? { ...prev, _hasFullContent: true } : prev);
                }
            } finally {
                if (isMounted) {
                    setIsFetchingContent(false);
                }
            }
        };

        loadDetails();
        return () => { isMounted = false; };
    }, [selectedClass?.id, userHasAccess, fetchClassContent]);

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setActiveTab('video');
        navigate(`/classes?id=${cls.id}`, { replace: true });
    };

    const handleBackClick = () => {
        setSelectedClass(null);
        navigate('/classes', { replace: true });
    };

    const handleUnlockClass = async () => {
        setIsUnlocking(true);
        try {
            const currency = settings.currency || 'MYR';
            const successUrl = `${window.location.origin}/classes?session_id={CHECKOUT_SESSION_ID}&classId=${selectedClass.id}`;
            const checkoutUrl = await createStripeCheckout(
                selectedClass.price || '29.99',
                currency,
                `CLASS-${selectedClass.id}-${Date.now()}`,
                successUrl,
                `${selectedClass.title} — CWC+`
            );
            if (checkoutUrl) window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Payment failed', error);
        } finally {
            setIsUnlocking(false);
        }
    };

    // --- Netflix Catalogue Logic ---

    // 1. Use the actually-featured class for the billboard; fall back to first
    const featuredClass = publicClasses.find(c => c.is_featured || c.isFeatured) || publicClasses[0] || null;
    const featuredMediaAsset = (featuredClass?.thumbnail_image_id && Array.isArray(media)) ? media.find(m => m.id === featuredClass.thumbnail_image_id) : null;
    const featuredHeroImage = featuredMediaAsset ? (featuredMediaAsset.hero_url || featuredMediaAsset.url) : (featuredClass?.image || null);

    // 2. Group ALL classes by Category for horizontal rows
    const groupedClasses = useMemo(() => {
        const groups = {};
        // Note: We are no longer filtering out the featured class so small databases don't look empty.
        publicClasses.forEach(cls => {
            const cat = cls.category || 'Masterclass';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(cls);
        });
        return groups;
    }, [publicClasses]);

    // Hero resolution for selected class theater view
    const selectedMediaAsset = (selectedClass?.thumbnail_image_id && Array.isArray(media)) ? media.find(m => m.id === selectedClass.thumbnail_image_id) : null;
    const heroImage = selectedMediaAsset ? (selectedMediaAsset.hero_url || selectedMediaAsset.url) : (selectedClass?.image || null);

    const liveDate = selectedClass?.live_date ? new Date(selectedClass.live_date) : null;
    const liveDurationMs = parseDurationMs(selectedClass?.live_duration_hours || 2);
    const isLive = liveDate && now >= liveDate && now <= new Date(liveDate.getTime() + liveDurationMs);
    const isUpcoming = liveDate && now < liveDate;

    return (
        <div className="min-h-screen bg-[#070B14] text-white pb-32 overflow-x-hidden">
            <Header variant="transparent" />

            <AnimatePresence mode="wait">
                {!selectedClass ? (
                    <motion.main
                        key="catalogue"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="relative pb-24"
                    >
                        {/* THE BILLBOARD (Edge-to-Edge Hero) */}
                        {featuredClass && (
                            <div className="relative w-full h-[75vh] min-h-[600px] max-h-[850px] flex items-center mb-8">
                                <div className="absolute inset-0 w-full h-full">
                                    {featuredHeroImage ? (
                                        <img
                                            src={featuredHeroImage}
                                            alt={featuredClass.title}
                                            className="w-full h-full object-cover object-center opacity-70"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#0a0f1d] flex items-center justify-center">
                                            <PlayCircle size={64} className="text-slate-800" />
                                        </div>
                                    )}
                                </div>

                                <div className="absolute inset-0 w-full md:w-3/4 bg-gradient-to-r from-[#070B14] via-[#070B14]/80 to-transparent" />
                                <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#070B14] via-[#070B14]/80 to-transparent" />

                                <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-12 pt-32">
                                    <div className="max-w-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="w-10 h-10 bg-rose-600/20 rounded-full flex items-center justify-center border border-rose-500/30">
                                                <Star size={18} className="text-rose-500 fill-rose-500" />
                                            </span>
                                            <span className="text-[10px] font-black uppercase text-rose-500 tracking-[0.3em]">Featured Premiere</span>
                                        </div>

                                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white italic tracking-tighter mb-4 leading-none uppercase drop-shadow-2xl">
                                            {featuredClass.title}
                                        </h1>

                                        <div className="flex items-center gap-4 mb-6 text-slate-300">
                                            <span className="text-sm font-bold uppercase tracking-widest text-white">{featuredClass.instructor}</span>
                                            <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                            <span className="text-sm font-medium">{featuredClass.duration || 'Full Curriculum'}</span>
                                            <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                            <span className="text-[10px] font-black tracking-widest uppercase border border-slate-500 rounded px-1.5 py-0.5">{featuredClass.category || 'Masterclass'}</span>
                                        </div>

                                        <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-10 max-w-xl font-medium drop-shadow-md line-clamp-3">
                                            Join {featuredClass.instructor} in this highly anticipated culinary masterclass. Learn the secrets, techniques, and philosophies that define elite culinary execution.
                                        </p>

                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <button
                                                onClick={() => handleClassClick(featuredClass)}
                                                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-lg font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
                                            >
                                                <Play size={20} className="fill-black" /> Play Curriculum
                                            </button>
                                            <button
                                                onClick={() => handleClassClick(featuredClass)}
                                                className="w-full sm:w-auto px-8 py-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md rounded-lg font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/10"
                                            >
                                                <Info size={20} /> Class Info
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* THE CATALOGUE (Categorized Rows, Centered & Beautifully Positioned) */}
                        <div className="relative z-20 max-w-[1400px] mx-auto -mt-16 md:-mt-24 space-y-12 md:space-y-16">
                            {publicClasses.length === 0 ? (
                                <div className="py-32 mx-6 md:mx-12 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl">
                                    <PlayCircle size={48} className="text-slate-700 mb-4" />
                                    <p className="text-slate-400 font-medium text-sm">No masterclasses available in the vault yet.</p>
                                </div>
                            ) : (
                                Object.entries(groupedClasses).map(([category, classes]) => (
                                    <div key={category} className="w-full">
                                        <div className="px-6 md:px-12 mb-4 flex items-center justify-between group cursor-pointer">
                                            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                                {category}
                                                <ChevronRight size={20} className="text-rose-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                            </h2>
                                        </div>

                                        {/* Horizontal Scrolling Row */}
                                        <div className="flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 pb-6 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                            {classes.map((cls) => (
                                                <div key={cls.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                                                    <ClassCard cls={cls} onClick={handleClassClick} mediaList={media} now={now} />
                                                </div>
                                            ))}
                                            <div className="w-4 md:w-8 shrink-0" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.main>
                ) : (
                    <motion.div
                        key="theater"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen relative flex flex-col bg-[#070B14]"
                    >
                        {/* THEATER HERO: Player / Locked Billboard */}
                        <div className="relative w-full aspect-video sm:h-[60vh] md:h-[70vh] lg:h-[80vh] max-h-[800px] bg-black">
                            <div className="absolute top-24 left-4 md:left-8 z-50">
                                <button
                                    onClick={handleBackClick}
                                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all group"
                                >
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {userLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                </div>
                            ) : !userHasAccess ? (
                                <div className="absolute inset-0 overflow-hidden">
                                    {heroImage && (
                                        <img src={heroImage} alt={selectedClass.title} className="w-full h-full object-cover opacity-40 blur-md scale-105" />
                                    )}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${isLive ? 'from-[#070B14] via-rose-950/40 to-rose-950/20' : 'from-[#070B14] via-[#070B14]/60 to-transparent'} transition-colors duration-1000`} />

                                    {/* Live urgency banner for non-members */}
                                    {isLive && (
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-5 py-2.5 bg-rose-600 rounded-full shadow-[0_0_40px_rgba(225,29,72,0.6)] animate-pulse">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                            <span className="text-white text-xs font-black uppercase tracking-widest">Happening Right Now</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
                                        <div className="max-w-md w-full flex flex-col items-center text-center">
                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center border mb-6 backdrop-blur-md ${isLive ? 'bg-rose-600/40 border-rose-500/60 shadow-[0_0_60px_rgba(225,29,72,0.4)]' : 'bg-rose-600/20 border-rose-500/30'}`}>
                                                <Lock size={32} className="text-white" />
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">{selectedClass.title}</h2>
                                            <p className="text-slate-300 text-sm font-medium mb-2 leading-relaxed max-w-sm">
                                                {isLive
                                                    ? <><span className="text-rose-400 font-bold">This class is LIVE right now.</span> Unlock instantly to join the session.</>
                                                    : <>This class curriculum is secured for <span className="text-rose-400 font-bold">{selectedClass.tier_required || 'Elite'}</span> members.</>
                                                }
                                            </p>
                                            {isLive && isUpcoming === false && (
                                                <p className="text-rose-400/70 text-[10px] font-black uppercase tracking-widest mb-6">
                                                    Don't miss it — class ends soon
                                                </p>
                                            )}
                                            {!isLive && <div className="mb-6" />}

                                            <button
                                                disabled={isUnlocking}
                                                onClick={handleUnlockClass}
                                                className={`w-full py-4 rounded-lg font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 ${isLive ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_60px_rgba(225,29,72,0.5)] hover:scale-105' : 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105'}`}
                                            >
                                                <Lock size={18} /> {isUnlocking ? 'Authorizing...' : isLive ? `Join Live Now — ${formatPrice(selectedClass.price || '29.99', settings.currency || 'MYR')}` : `Unlock for ${formatPrice(selectedClass.price || '29.99', settings.currency || 'MYR')}`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 w-full h-full">
                                    {isLive && !selectedClass.live_link ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                                            <div className="w-4 h-4 bg-rose-500 rounded-full animate-pulse mb-4" />
                                            <p className="text-sm font-black text-white uppercase tracking-widest">Class is Live</p>
                                            <p className="text-xs text-slate-400 font-bold mt-2">Stream link coming shortly...</p>
                                        </div>
                                    ) : isLive && selectedClass.live_link ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: heroImage ? `url(${heroImage})` : 'none' }}>
                                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                                            <div className="relative z-10 text-center flex flex-col items-center">
                                                <div className="w-24 h-24 bg-rose-600 rounded-full flex items-center justify-center animate-pulse mb-6 shadow-[0_0_60px_rgba(225,29,72,0.6)]">
                                                    <Play size={40} className="text-white fill-white ml-2" />
                                                </div>
                                                <h4 className="text-5xl font-black text-white italic tracking-tighter mb-2 uppercase">Live Kitchen</h4>
                                                <p className="text-slate-300 text-sm font-bold uppercase tracking-[0.3em] mb-10">Class in session</p>
                                                <a
                                                    href={selectedClass.live_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-10 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3"
                                                >
                                                    Join Live Kitchen <ChevronRight size={20} />
                                                </a>
                                            </div>
                                        </div>
                                    ) : isUpcoming ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: heroImage ? `url(${heroImage})` : 'none' }}>
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                                            <div className="relative z-10 text-center flex flex-col items-center px-6">
                                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 mb-6 backdrop-blur-xl">
                                                    <Clock size={36} className="text-white" />
                                                </div>
                                                <h4 className="text-4xl font-black text-white italic tracking-tighter mb-3 uppercase">Upcoming Class</h4>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">{liveDate.toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                {/* Live countdown */}
                                                {(() => {
                                                    const diff = liveDate - now;
                                                    const d = Math.floor(diff / 86400000);
                                                    const h = Math.floor((diff % 86400000) / 3600000);
                                                    const m = Math.floor((diff % 3600000) / 60000);
                                                    const s = Math.floor((diff % 60000) / 1000);
                                                    return (
                                                        <div className="flex items-center gap-3 mb-10">
                                                            {d > 0 && <div className="text-center"><p className="text-4xl font-black text-white">{d}</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Days</p></div>}
                                                            {d > 0 && <p className="text-2xl font-black text-slate-600">:</p>}
                                                            <div className="text-center"><p className="text-4xl font-black text-white">{String(h).padStart(2,'0')}</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hrs</p></div>
                                                            <p className="text-2xl font-black text-slate-600">:</p>
                                                            <div className="text-center"><p className="text-4xl font-black text-white">{String(m).padStart(2,'0')}</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Min</p></div>
                                                            <p className="text-2xl font-black text-slate-600">:</p>
                                                            <div className="text-center"><p className="text-4xl font-black text-indigo-400">{String(s).padStart(2,'0')}</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sec</p></div>
                                                        </div>
                                                    );
                                                })()}
                                                <button
                                                    onClick={() => {
                                                        const title = encodeURIComponent(`Masterclass: ${selectedClass.title}`);
                                                        const start = liveDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
                                                        const endMs = liveDate.getTime() + liveDurationMs;
                                                        const end = new Date(endMs).toISOString().replace(/-|:|\.\d\d\d/g, "");
                                                        const details = encodeURIComponent(`Join via CWC+ Dashboard\nInstructor: ${selectedClass.instructor || ''}`);
                                                        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`, '_blank');
                                                    }}
                                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 backdrop-blur-md"
                                                >
                                                    <Calendar size={18} /> Add to Calendar
                                                </button>
                                            </div>
                                        </div>
                                    ) : isFetchingContent ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070B14]">
                                            <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-6" />
                                            <p className="text-xs font-black text-rose-400 uppercase tracking-widest animate-pulse">Preparing Kitchen...</p>
                                        </div>
                                    ) : selectedClass.video ? (
                                        <iframe
                                            src={selectedClass.video.includes('http') ? selectedClass.video : `https://www.youtube.com/embed/${selectedClass.video}?autoplay=1&modestbranding=1&rel=0`}
                                            className="w-full h-full relative z-10"
                                            frameBorder="0"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070B14]">
                                            <PlayCircle size={64} className="text-slate-800 mb-4" />
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Video Pending</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-[#070B14] to-transparent z-20 pointer-events-none" />
                        </div>

                        {/* THEATER DETAILS */}
                        <div className="relative z-30 max-w-[1400px] w-full mx-auto px-6 md:px-12 -mt-16 md:-mt-24 pb-32">

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                <div className="max-w-3xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/10 px-2 py-1 rounded-sm border border-indigo-500/20">{selectedClass.category || 'Masterclass'}</span>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedClass.duration || 'Pro Curriculum'}</span>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white italic tracking-tighter mb-4 leading-none uppercase drop-shadow-2xl">{selectedClass.title}</h1>
                                    <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                                        Join <span className="text-white font-bold">{selectedClass.instructor}</span> in this exclusive masterclass as we dive deep into the professional techniques that define modern high-end culinary arts.
                                    </p>
                                </div>
                                <div className="flex shrink-0">
                                    <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/10 transition-all group">
                                        <Star size={20} className="text-white group-hover:text-yellow-400 transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {userHasAccess && (
                            <div className="border-b border-white/10 mb-8 flex gap-8 overflow-x-auto custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {[
                                    { id: 'video', label: 'Class Resources' },
                                    { id: 'ingredients', label: 'Ingredients & Tools' },
                                    { id: 'steps', label: 'Recipe Steps' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`pb-4 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-rose-600 rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            )}

                            {userHasAccess && <div className="min-h-[400px]">
                                {activeTab === 'video' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                                        <div className="lg:col-span-2 space-y-6">
                                            <h3 className="text-xl font-black text-white italic tracking-tight uppercase mb-4">Chef's Notes</h3>
                                            {selectedClass.notes ? (
                                                <div className="space-y-4">
                                                    {(() => {
                                                        let notes = [];
                                                        try {
                                                            notes = typeof selectedClass.notes === 'string' ? JSON.parse(selectedClass.notes) : selectedClass.notes;
                                                        } catch (e) {
                                                            notes = [selectedClass.notes];
                                                        }
                                                        return Array.isArray(notes) ? notes.map((note, i) => (
                                                            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 flex gap-4">
                                                                <Info size={24} className="text-slate-400 shrink-0" />
                                                                <p className="text-sm text-slate-300 leading-relaxed">{note}</p>
                                                            </div>
                                                        )) : null;
                                                    })()}
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 text-sm">No class notes available.</p>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-white italic tracking-tight uppercase mb-4">Attachments</h3>
                                            <div className="space-y-3">
                                                {(selectedClass.attachments || []).map((att, i) => (
                                                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-[#141A29] rounded-xl border border-white/5 hover:border-indigo-500/50 hover:bg-[#1A2235] transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-indigo-500/20 rounded-full text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                                {att.url.toLowerCase().endsWith('.pdf') ? <FileText size={18} /> : <Download size={18} />}
                                                            </div>
                                                            <span className="text-sm font-bold text-white tracking-tight">{att.title}</span>
                                                        </div>
                                                        <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                    </a>
                                                ))}
                                                {(!selectedClass.attachments || selectedClass.attachments.length === 0) && (
                                                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-xl">
                                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Digital Resources</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ingredients' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {selectedClass.ingredients && selectedClass.ingredients.length > 0 ? (
                                            selectedClass.ingredients.map((ing, i) => (
                                                <div key={i} className="bg-[#141A29] p-5 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-indigo-500/30 transition-all h-24">
                                                    <span className="text-xs font-black text-indigo-400 px-2 py-1 bg-indigo-500/10 rounded-md self-start">{ing.amount}</span>
                                                    <span className="text-sm font-bold text-white tracking-tight mt-auto">{ing.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 text-center flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-xl">
                                                <ShoppingBag size={32} className="text-slate-600 mb-3" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Ingredients Documented</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'steps' && (
                                    <div className="max-w-4xl space-y-4">
                                        {selectedClass.steps && selectedClass.steps.length > 0 ? (
                                            selectedClass.steps.map((step, i) => (
                                                <div key={i} className="flex gap-6 p-6 bg-[#141A29] rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                                                    <div className="text-3xl font-black text-slate-700 italic group-hover:text-indigo-500 transition-colors shrink-0 leading-none">
                                                        {(i + 1).toString().padStart(2, '0')}
                                                    </div>
                                                    <p className="text-base text-slate-300 leading-relaxed font-medium">{step}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-xl">
                                                <ListChecks size={32} className="text-slate-600 mb-3" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recipe Pending</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}