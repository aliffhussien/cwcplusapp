import React from 'react';
import { LockKeyhole as LockIcon, ArrowLeft, Play, PlayCircle, Clock, Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import { formatPrice } from '../lib/currency';
import { APP_COPY } from '../config/appCopy';
import { parseDurationMs } from './ClassCard';

interface ClassPlayerProps {
    selectedClass: any;
    userLoading: boolean;
    userHasAccess: boolean;
    isLive: boolean;
    isUpcoming: boolean;
    now: Date;
    heroImage: string | null;
    paymentError: string | null;
    isUnlocking: boolean;
    isFetchingContent: boolean;
    handleBackClick: () => void;
    handleUnlockClass: () => void;
    settings: any;
}

export default function ClassPlayer({ selectedClass, userLoading, userHasAccess, isLive, isUpcoming, now, heroImage, paymentError, isUnlocking, isFetchingContent, handleBackClick, handleUnlockClass, settings }: ClassPlayerProps) {
    const liveDate = selectedClass.live_date ? new Date(selectedClass.live_date) : null;
    const liveDurationMs = parseDurationMs(selectedClass.live_duration_hours || 2);

    return (
        <div className="relative w-full aspect-video sm:h-[60vh] md:h-[70vh] lg:h-[80vh] max-h-[800px] bg-base">
            <div className="absolute top-24 left-4 md:left-8 z-50">
                <button onClick={handleBackClick} className="w-10 h-10 rounded-full bg-base/40 backdrop-blur-md border border-glass-border flex items-center justify-center text-text-1 hover:bg-glass-bg transition-all group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            {userLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                </div>
            ) : !userHasAccess ? (
                <div className="absolute inset-0 overflow-hidden">
                    {heroImage && <img src={heroImage} alt={selectedClass.title} className="w-full h-full object-cover opacity-40 blur-md scale-105" />}
                    <div className={`absolute inset-0 bg-gradient-to-t ${isLive ? 'from-base via-danger/40 to-danger/20' : 'from-base via-base/60 to-transparent'} transition-colors duration-1000`} />
                    {isLive && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-5 py-2.5 bg-danger rounded-full shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse">
                            <div className="w-2 h-2 bg-text-1 rounded-full" />
                            <span className="text-text-1 text-xs font-black uppercase tracking-widest">Happening Right Now</span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
                        <div className="max-w-md w-full flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center border mb-6 backdrop-blur-md ${isLive ? 'bg-danger/40 border-danger/60 shadow-[0_0_60px_rgba(244,63,94,0.4)]' : 'bg-danger/20 border-danger/30'}`}>
                                <LockIcon size={32} className="text-text-1" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-text-1 italic tracking-tighter uppercase mb-4 leading-none">{selectedClass.title}</h2>
                            <p className="text-text-2 text-sm font-medium mb-2 leading-relaxed max-w-sm">
                                {isLive ? <><span className="text-danger font-bold">This class is LIVE right now.</span> Join us in the kitchen for a fun session!</> : <>This cooking class is exclusive to our <span className="text-danger font-bold">{selectedClass.tier_required || 'Plus'}</span> members.</>}
                            </p>
                            {isLive && isUpcoming === false && <p className="text-danger/70 text-[10px] font-black uppercase tracking-widest mb-6">Don't miss it — class ends soon</p>}
                            {!isLive && <div className="mb-6" />}
                            {paymentError && (
                                <div className="flex items-center gap-2 px-4 py-2 mb-3 bg-danger/10 border border-danger/20 rounded-lg w-full">
                                    <AlertCircle size={14} className="text-danger shrink-0" />
                                    <p className="text-xs text-danger font-bold">{paymentError}</p>
                                </div>
                            )}
                            <button
                                disabled={isUnlocking}
                                onClick={handleUnlockClass}
                                className={`w-full py-4 rounded-lg font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 ${isLive ? 'bg-danger hover:opacity-80 text-text-1 shadow-[0_0_60px_rgba(244,63,94,0.5)] hover:scale-105' : 'bg-text-1 text-base shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105'}`}
                            >
                                <LockIcon size={18} /> {isUnlocking ? 'Authorizing...' : isLive ? `Join Live Now — ${formatPrice(selectedClass.price || '29.99', settings.currency || 'MYR')}` : `Unlock for ${formatPrice(selectedClass.price || '29.99', settings.currency || 'MYR')}`}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0 w-full h-full">
                    {isLive && !selectedClass.live_link ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base/80">
                            <div className="w-4 h-4 bg-danger rounded-full animate-pulse mb-4" />
                            <p className="text-sm font-black text-text-1 uppercase tracking-widest">Class is Live</p>
                            <p className="text-xs text-text-3 font-bold mt-2">Stream link coming shortly...</p>
                        </div>
                    ) : isLive && selectedClass.live_link ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: heroImage ? `url(${heroImage})` : 'none' }}>
                            <div className="absolute inset-0 bg-base/70 backdrop-blur-sm" />
                            <div className="relative z-10 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-danger rounded-full flex items-center justify-center animate-pulse mb-6 shadow-[0_0_60px_rgba(244,63,94,0.6)]">
                                    <Play size={40} className="text-text-1 fill-text-1 ml-2" />
                                </div>
                                <h4 className="text-5xl font-black text-text-1 italic tracking-tighter mb-2 uppercase">Live Kitchen</h4>
                                <p className="text-text-2 text-sm font-bold uppercase tracking-[0.3em] mb-10">Class in session</p>
                                <a href={selectedClass.live_link} target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-danger hover:opacity-80 text-text-1 rounded-lg font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3">
                                    Join Live Kitchen <ChevronRight size={20} />
                                </a>
                            </div>
                        </div>
                    ) : isUpcoming && liveDate ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: heroImage ? `url(${heroImage})` : 'none' }}>
                            <div className="absolute inset-0 bg-base/80 backdrop-blur-md" />
                            <div className="relative z-10 text-center flex flex-col items-center px-6">
                                <div className="w-20 h-20 bg-glass-bg rounded-full flex items-center justify-center border border-glass-border mb-6 backdrop-blur-xl"><Clock size={36} className="text-text-1" /></div>
                                <h4 className="text-4xl font-black text-text-1 italic tracking-tighter mb-3 uppercase">Upcoming Class</h4>
                                <p className="text-text-3 text-xs font-bold uppercase tracking-widest mb-4">{liveDate.toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                {(() => {
                                    const diff = liveDate.getTime() - now.getTime();
                                    const d = Math.floor(diff / 86400000);
                                    const h = Math.floor((diff % 86400000) / 3600000);
                                    const m = Math.floor((diff % 3600000) / 60000);
                                    const s = Math.floor((diff % 60000) / 1000);
                                    return (
                                        <div className="flex items-center gap-3 mb-10">
                                            {d > 0 && <div className="text-center"><p className="text-4xl font-black text-text-1">{d}</p><p className="text-[9px] font-black uppercase tracking-widest text-text-3">Days</p></div>}
                                            {d > 0 && <p className="text-2xl font-black text-text-3">:</p>}
                                            <div className="text-center"><p className="text-4xl font-black text-text-1">{String(h).padStart(2,'0')}</p><p className="text-[9px] font-black uppercase tracking-widest text-text-3">Hrs</p></div>
                                            <p className="text-2xl font-black text-text-3">:</p>
                                            <div className="text-center"><p className="text-4xl font-black text-text-1">{String(m).padStart(2,'0')}</p><p className="text-[9px] font-black uppercase tracking-widest text-text-3">Min</p></div>
                                            <p className="text-2xl font-black text-text-3">:</p>
                                            <div className="text-center"><p className="text-4xl font-black text-accent">{String(s).padStart(2,'0')}</p><p className="text-[9px] font-black uppercase tracking-widest text-text-3">Sec</p></div>
                                        </div>
                                    );
                                })()}
                                <button
                                    onClick={() => {
                                        const title = encodeURIComponent(`${APP_COPY.classesPage.badge}: ${selectedClass.title}`);
                                        const start = liveDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
                                        const endMs = liveDate.getTime() + liveDurationMs;
                                        const end = new Date(endMs).toISOString().replace(/-|:|\.\d\d\d/g, "");
                                        const details = encodeURIComponent(`Join via CWC+ Dashboard\nInstructor: ${selectedClass.instructor || ''}`);
                                        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`, '_blank');
                                    }}
                                    className="px-8 py-4 bg-glass-bg hover:bg-elevated text-text-1 border border-glass-border rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 backdrop-blur-md"
                                >
                                    <Calendar size={18} /> Add to Calendar
                                </button>
                            </div>
                        </div>
                    ) : isFetchingContent ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base">
                            <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6" />
                            <p className="text-xs font-black text-accent-sec uppercase tracking-widest animate-pulse">Setting Up the Kitchen...</p>
                        </div>
                    ) : selectedClass.video ? (
                        <iframe src={selectedClass.video.includes('http') ? selectedClass.video : `https://www.youtube.com/embed/${selectedClass.video}?autoplay=1&modestbranding=1&rel=0`} className="w-full h-full relative z-10" style={{ border: 'none' }} allowFullScreen></iframe>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base">
                            <PlayCircle size={64} className="text-text-3/20 mb-4" />
                            <p className="text-xs font-black text-text-3 uppercase tracking-widest">Video Pending</p>
                        </div>
                    )}
                </div>
            )}
            <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-base to-transparent z-20 pointer-events-none" />
        </div>
    );
}
