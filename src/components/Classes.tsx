import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, PlayCircle, ChevronRight } from 'lucide-react';
import Header from './Header';
import ClassCard, { parseDurationMs } from './ClassCard';
import ClassPlayer from './ClassPlayer';
import ClassDetails from './ClassDetails';
import { useClasses } from '../hooks/useClasses';
import { useUser } from '../hooks/useUser';
import { useMedia } from '../hooks/useMedia';
import { useAppSettings } from '../hooks/useAppSettings';
import { createStripeCheckout } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { APP_COPY } from '../config/appCopy';

export default function Classes() {
    const navigate = useNavigate();
    const { publicClasses, fetchClassContent, isLoading } = useClasses();
    const { user, loading: userLoading, hasAccessToClass, refreshUserFromDB } = useUser();
    const { settings } = useAppSettings();
    const { media } = useMedia();

    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('video');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isFetchingContent, setIsFetchingContent] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const hasLoadedInitialUrl = useRef(false);
    const userHasAccess = selectedClass ? hasAccessToClass(selectedClass) : false;

    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const classId = urlParams.get('classId');
        if (!sessionId || !classId || !user?.id) return;
        window.history.replaceState({}, document.title, window.location.pathname);
        (async () => {
            try {
                const { data, error } = await supabase.functions.invoke('verify-payment', { body: { session_id: sessionId, type: 'class', item_id: classId, user_id: user.id } });
                if (error || !data?.success) throw new Error(error?.message || 'Verification failed');
                await refreshUserFromDB();
            } catch (err) { console.error('Payment verification failed:', err); }
        })();
    }, [user?.id]);

    useEffect(() => {
        if (hasLoadedInitialUrl.current || publicClasses.length === 0) return;
        const urlParams = new URLSearchParams(window.location.search);
        const directId = urlParams.get('id');
        if (directId) {
            const baseClass = publicClasses.find((c: any) => c.id.toString() === directId || c.id === parseInt(directId));
            if (baseClass) { setSelectedClass(baseClass); setActiveTab('video'); }
        }
        hasLoadedInitialUrl.current = true;
    }, [publicClasses]);

    useEffect(() => {
        if (!selectedClass || !userHasAccess || selectedClass._hasFullContent) return;
        let isMounted = true;
        const loadDetails = async () => {
            setIsFetchingContent(true);
            try {
                const content = await fetchClassContent(selectedClass.id);
                if (isMounted) setSelectedClass((prev: any) => prev?.id === selectedClass.id ? { ...prev, ...content, _hasFullContent: true } : prev);
            } catch (error) {
                if (isMounted) setSelectedClass((prev: any) => prev?.id === selectedClass.id ? { ...prev, _hasFullContent: true } : prev);
            } finally {
                if (isMounted) setIsFetchingContent(false);
            }
        };
        loadDetails();
        return () => { isMounted = false; };
    }, [selectedClass?.id, userHasAccess, fetchClassContent]);

    const handleUnlockClass = async () => {
        setIsUnlocking(true); setPaymentError(null);
        try {
            const currency = settings.currency || 'MYR';
            const successUrl = `${window.location.origin}/classes?session_id={CHECKOUT_SESSION_ID}&classId=${selectedClass.id}`;
            const checkoutUrl = await createStripeCheckout(selectedClass.price || '29.99', currency, `CLASS-${selectedClass.id}-${Date.now()}`, successUrl, `${selectedClass.title} — CWC+`);
            if (checkoutUrl) window.location.href = checkoutUrl;
            else setPaymentError('Checkout unavailable. Please try again.');
        } catch (error) { setPaymentError('Payment failed. Please try again.'); } 
        finally { setIsUnlocking(false); }
    };

    const featuredClass = publicClasses.find((c: any) => c.is_featured || c.isFeatured) || publicClasses[0] || null;
    const featuredMediaAsset = (featuredClass?.thumbnail_image_id && Array.isArray(media)) ? media.find((m: any) => m.id === featuredClass.thumbnail_image_id) : null;
    const featuredHeroImage = featuredMediaAsset ? (featuredMediaAsset.hero_url || featuredMediaAsset.url) : (featuredClass?.image || null);

    const groupedClasses = useMemo(() => {
        const groups: any = {};
        publicClasses.forEach((cls: any) => {
            let cat = cls.category || 'Cooking Class';
            if (cat === 'Masterclass') cat = 'Cooking Class';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(cls);
        });
        return groups;
    }, [publicClasses]);

    const selectedMediaAsset = (selectedClass?.thumbnail_image_id && Array.isArray(media)) ? media.find((m: any) => m.id === selectedClass.thumbnail_image_id) : null;
    const heroImage = selectedMediaAsset ? (selectedMediaAsset.hero_url || selectedMediaAsset.url) : (selectedClass?.image || null);
    const liveDate = selectedClass?.live_date ? new Date(selectedClass.live_date) : null;
    const liveDurationMs = parseDurationMs(selectedClass?.live_duration_hours || 2);
    const isLive = liveDate ? now >= liveDate && now <= new Date(liveDate.getTime() + liveDurationMs) : false;
    const isUpcoming = liveDate ? now < liveDate : false;

    return (
        <div className="min-h-screen bg-base text-text-1 pb-32 overflow-x-hidden">
            <Header variant={featuredClass && !selectedClass ? 'transparent' : 'home'} />
            <AnimatePresence mode="wait">
                {!selectedClass ? (
                    <motion.main key="catalogue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative pb-24">
                        {featuredClass && (
                            <div className="relative w-full h-[75vh] min-h-[600px] max-h-[850px] flex items-center mb-8">
                                <div className="absolute inset-0 w-full h-full">
                                    {featuredHeroImage ? <img src={featuredHeroImage} alt={featuredClass.title} className="w-full h-full object-cover object-center opacity-70" /> : <div className="w-full h-full bg-base flex items-center justify-center"><PlayCircle size={64} className="text-text-3" /></div>}
                                </div>
                                <div className="absolute inset-0 w-full md:w-3/4 bg-gradient-to-r from-base via-base/80 to-transparent" />
                                <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-base via-base/80 to-transparent" />
                                <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-12 pt-32">
                                    <div className="max-w-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="w-10 h-10 bg-danger/20 rounded-full flex items-center justify-center border border-danger/30"><Star size={18} className="text-danger fill-danger" /></span>
                                            <span className="text-[10px] font-black uppercase text-danger tracking-[0.3em]">New Class</span>
                                        </div>
                                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-text-1 italic tracking-tighter mb-4 leading-none uppercase drop-shadow-2xl">{featuredClass.title}</h1>
                                        <div className="flex items-center gap-4 mb-6 text-text-2">
                                            <span className="text-sm font-bold uppercase tracking-widest text-text-1">{featuredClass.instructor}</span><span className="w-1 h-1 bg-text-3 rounded-full" />
                                            <span className="text-sm font-medium">{featuredClass.duration || 'Join Us'}</span><span className="w-1 h-1 bg-text-3 rounded-full" />
                                            <span className="section-label border border-text-3 rounded px-1.5 py-0.5">{featuredClass.category || APP_COPY.classesPage.badge}</span>
                                        </div>
                                        <p className="text-text-2 text-base md:text-lg leading-relaxed mb-10 max-w-xl font-medium drop-shadow-md line-clamp-3">{APP_COPY.classesPage.subtitle}</p>
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <button onClick={() => { setSelectedClass(featuredClass); setActiveTab('video'); navigate(`/classes?id=${featuredClass.id}`, { replace: true }); }} className="w-full sm:w-auto px-8 py-4 bg-text-1 hover:bg-elevated text-base rounded-lg font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"><Play size={20} className="fill-base" /> {APP_COPY.classesPage.ctaPrimary}</button>
                                            <button onClick={() => { setSelectedClass(featuredClass); setActiveTab('video'); navigate(`/classes?id=${featuredClass.id}`, { replace: true }); }} className="w-full sm:w-auto px-8 py-4 bg-elevated hover:bg-glass-bg text-text-1 backdrop-blur-md rounded-lg font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-glass-border"><Info size={20} /> {APP_COPY.classesPage.ctaSecondary || 'About Class'}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className={`relative z-20 max-w-[1400px] mx-auto space-y-12 md:space-y-16 ${featuredClass ? '-mt-16 md:-mt-24' : 'pt-24 md:pt-32'}`}>
                            {isLoading ? (
                                <div className="py-40 flex flex-col items-center justify-center space-y-6"><div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" /><p className="section-label text-accent animate-pulse">Heating up the stove...</p></div>
                            ) : publicClasses.length === 0 ? (
                                <div className="py-32 mx-6 md:mx-12 flex flex-col items-center justify-center text-center bg-glass-bg border border-glass-border rounded-2xl">
                                    <PlayCircle size={48} className="text-text-3 mb-4" /><p className="text-text-1 font-bold text-lg mb-2">The Kitchen is Quiet</p>
                                    <p className="text-text-3 font-medium text-sm max-w-xs">{user?.isGod ? "You haven't shared any cooking classes yet. Head to the Command Center to add your first lesson!" : "Our cooking classes will be appearing here soon!"}</p>
                                    {user?.isGod && <button onClick={() => navigate('/admin?tab=classes')} className="mt-6 px-6 py-2 bg-accent text-text-1 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-accent-sec transition-colors">Command Center</button>}
                                </div>
                            ) : Object.entries(groupedClasses).map(([category, classes]: any) => (
                                <div key={category} className="w-full">
                                    <div className="px-6 md:px-12 mb-4 flex items-center justify-between group cursor-pointer"><h2 className="text-xl md:text-2xl font-bold text-text-1 flex items-center gap-2">{category} <ChevronRight size={20} className="text-danger opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></h2></div>
                                    <div className="flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 pb-6 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        {classes.map((cls: any) => <div key={cls.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start"><ClassCard cls={cls} onClick={(c) => { setSelectedClass(c); setActiveTab('video'); navigate(`/classes?id=${c.id}`, { replace: true }); }} mediaList={media} now={now} currency={settings.currency} /></div>)}<div className="w-4 md:w-8 shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.main>
                ) : (
                    <motion.div key="theater" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen relative flex flex-col bg-base">
                        <ClassPlayer selectedClass={selectedClass} userLoading={userLoading} userHasAccess={userHasAccess} isLive={isLive} isUpcoming={isUpcoming} now={now} heroImage={heroImage} paymentError={paymentError} isUnlocking={isUnlocking} isFetchingContent={isFetchingContent} handleBackClick={() => { setSelectedClass(null); navigate('/classes', { replace: true }); }} handleUnlockClass={handleUnlockClass} settings={settings} />
                        <ClassDetails selectedClass={selectedClass} userHasAccess={userHasAccess} activeTab={activeTab} setActiveTab={setActiveTab} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
