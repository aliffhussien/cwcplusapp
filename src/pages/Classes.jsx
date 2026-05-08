import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Star, X, Lock, Clock, Download, FileText } from 'lucide-react';
import Header from '../components/Header';
import { useClasses } from '../hooks/useClasses';
import { useUser } from '../hooks/useUser';
import { createStripeCheckout } from '../lib/stripe';

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#070B14]">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] -right-[20%] w-[80vw] h-[80vw] rounded-full bg-rose-600 blur-[150px]" />
    </div>
);

const CinematicHero = () => (
    <div className="relative w-full h-[60vh] md:h-[70vh] mb-8">
        <div className="absolute inset-0">
            <img src="/live_masterclass_hero.png" alt="Masterclass Hero" className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070B14]/80 to-transparent" />
        </div>
        
        <div className="absolute bottom-10 left-4 md:left-10 z-20 max-w-lg">
            <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-rose-500 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse">Live Now</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Masterclass</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mb-2">The Art of Plating</h1>
            <p className="text-sm text-slate-300 drop-shadow-md mb-6 line-clamp-2">Join Michelin-star Chef Thomas Keller as he reveals the secrets to visually stunning culinary presentations.</p>
            
            <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-white text-black rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-[0_4px_16px_rgba(255,255,255,0.3)]">
                    <Play size={16} className="fill-black" /> Join Stream
                </button>
                <button className="px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-colors">
                    <Info size={16} /> Details
                </button>
            </div>
        </div>
    </div>
);

const getClassStatus = (cls) => {
    if (cls.live_date) {
        const liveDate = new Date(cls.live_date);
        const now = new Date();
        const diffHours = (now - liveDate) / (1000 * 60 * 60);
        
        if (diffHours < 0) {
            return { text: `Live ${liveDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}`, isLiveNow: false, isRating: false };
        } else if (diffHours >= 0 && diffHours < 4) {
            return { text: "Live Now", isLiveNow: true, isRating: false };
        }
    }
    if (cls.scheduled_post_date) {
        const postDate = new Date(cls.scheduled_post_date);
        if (postDate > new Date()) {
            return { text: `Drops ${postDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}`, isLiveNow: false, isRating: false };
        }
    }
    return { text: "5.0", isLiveNow: false, isRating: true };
};

const ClassCard = ({ cls, onClick }) => {
    const status = getClassStatus(cls);
    return (
    <div onClick={() => onClick(cls)} className="min-w-[140px] md:min-w-[200px] cursor-pointer group snap-start relative">
        <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.4)] bg-black">
            <img src={cls.image} alt={cls.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
            
            <div className={`absolute top-2 right-2 px-1.5 py-0.5 backdrop-blur-md rounded border flex items-center gap-1 ${status.isLiveNow ? 'bg-rose-600/90 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse' : 'bg-black/60 border-white/10'}`}>
                {status.isRating && <Star size={8} className="text-amber-400 fill-amber-400" />}
                {!status.isRating && !status.isLiveNow && <Clock size={8} className="text-indigo-400" />}
                <span className={`text-[9px] font-bold text-white ${status.isLiveNow ? 'uppercase tracking-wider' : ''}`}>{status.text}</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-xs md:text-sm font-bold text-white leading-tight mb-0.5 drop-shadow-md line-clamp-2">{cls.title}</h4>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{cls.instructor}</p>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm bg-black/20">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-[0_0_16px_rgba(255,255,255,0.2)]">
                    <Play size={16} className="text-white fill-white ml-0.5" />
                </div>
            </div>
        </div>
    </div>
)};

export default function Classes() {
    const { publicClasses } = useClasses();
    const { user, hasAccessToClass, unlockClass } = useUser();
    const [selectedClass, setSelectedClass] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('video');
    const [isUnlocking, setIsUnlocking] = React.useState(false);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success' || urlParams.get('status') === 'success') {
            const classId = urlParams.get('classId');
            if (classId) {
                unlockClass(classId);
                alert('Payment successful! Masterclass unlocked.');
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [unlockClass]);

    const handleUnlockClass = async () => {
        setIsUnlocking(true);
        try {
            const checkoutUrl = await createStripeCheckout(
                selectedClass.price || '19.99',
                'USD',
                `CLASS-${selectedClass.id}-${Date.now()}`,
                `${window.location.origin}/classes?payment=success&classId=${selectedClass.id}`
            );
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                unlockClass(selectedClass.id);
                alert("Class Unlocked!");
            }
        } catch (error) {
            console.error("Payment failed", error);
            alert("Unable to initiate payment. Please try again.");
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setActiveTab('video');
    };

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-rose-500/30 pb-32">
            <AnimatedBackground />
            <Header variant="home" transparentOverride={true} />

            <CinematicHero />

            <main className="relative z-10 pl-4 md:pl-10 max-w-7xl mx-auto overflow-hidden">
                <div className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-white mb-4 drop-shadow-md">Available Masterclasses</h2>
                    {publicClasses.length === 0 ? (
                        <p className="text-slate-400 text-sm">No classes available yet.</p>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x pr-4 md:pr-10">
                            {publicClasses.map((cls) => <ClassCard key={cls.id} cls={cls} onClick={handleClassClick} />)}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal for Class / Paywall */}
            {selectedClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0F1C] border border-white/10 rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar relative shadow-2xl">
                        <button onClick={() => setSelectedClass(null)} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg z-10"><X size={16}/></button>
                        
                        {!hasAccessToClass(selectedClass.id) ? (
                            <div className="text-center pt-4 pb-2">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                                    <Lock size={28} className="text-rose-400" />
                                </div>
                                <h3 className="text-xl font-extrabold text-white mb-2">Premium Class</h3>
                                <p className="text-sm text-slate-400 mb-6">Unlock "{selectedClass.title}" to start watching instantly.</p>
                                
                                <button disabled={isUnlocking} onClick={handleUnlockClass} className="w-full py-3 mb-3 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl text-sm shadow-[0_4px_16px_rgba(244,63,94,0.4)] transition-all disabled:opacity-50">
                                    {isUnlocking ? 'Processing...' : `Unlock for $${selectedClass.price || '19.99'}`}
                                </button>
                                <button onClick={() => setSelectedClass(null)} className="text-xs text-slate-400 font-bold hover:text-white uppercase tracking-widest">Maybe Later</button>
                            </div>
                        ) : (
                            <div className="pt-2 flex flex-col gap-6">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 leading-tight">{selectedClass.title}</h3>
                                    <p className="text-sm text-indigo-400 font-medium">{selectedClass.instructor}</p>
                                </div>
                                
                                <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-full overflow-hidden flex-wrap">
                                    <button onClick={() => setActiveTab('video')} className={`flex-1 py-2 px-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === 'video' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Video</button>
                                    {selectedClass.ingredients?.length > 0 && <button onClick={() => setActiveTab('ingredients')} className={`flex-1 py-2 px-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === 'ingredients' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Ingredients</button>}
                                    {selectedClass.steps?.length > 0 && <button onClick={() => setActiveTab('steps')} className={`flex-1 py-2 px-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === 'steps' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Steps</button>}
                                    {selectedClass.attachments?.length > 0 && <button onClick={() => setActiveTab('materials')} className={`flex-1 py-2 px-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === 'materials' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Materials</button>}
                                </div>

                                {activeTab === 'video' && (
                                    <div className="w-full aspect-video bg-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                        {selectedClass.video ? (
                                            <iframe src={selectedClass.video} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                                        ) : (
                                            <>
                                                <img src={selectedClass.image} className="w-full h-full object-cover opacity-50"/>
                                                <Play size={40} className="absolute text-white/50" />
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'ingredients' && selectedClass.ingredients?.length > 0 && (
                                    <div className="animate-fade-in">
                                        <ul className="grid grid-cols-1 gap-2">
                                            {selectedClass.ingredients.map((ing, i) => (
                                                <li key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-200">{ing.name}</span>
                                                    <span className="text-xs font-bold text-indigo-300">{ing.amount}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {activeTab === 'steps' && selectedClass.steps?.length > 0 && (
                                    <div className="animate-fade-in space-y-3">
                                        {selectedClass.steps.map((step, i) => (
                                            <div key={i} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                                <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold border border-indigo-500/30">{i + 1}</div>
                                                <p className="text-sm text-slate-300 leading-relaxed pt-1">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'materials' && selectedClass.attachments?.length > 0 && (
                                    <div className="animate-fade-in space-y-3">
                                        <p className="text-sm text-slate-400 font-medium mb-4">Download the companion materials for this masterclass.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedClass.attachments.map((att, i) => (
                                                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white/5 hover:bg-indigo-500/10 p-4 rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all group">
                                                    <div className="w-10 h-10 shrink-0 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-white truncate">{att.title || 'Attachment Document'}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1 flex items-center gap-1"><Download size={10} /> Download</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}


                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
