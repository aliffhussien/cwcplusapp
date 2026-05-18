import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { PlayCircle, BookOpen, Calendar as CalendarIcon, ChefHat, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';
import { useUser } from '../hooks/useUser';
import { useMedia } from '../hooks/useMedia';
import { useAppSettings } from '../hooks/useAppSettings';
import { getMediaAssetUrl } from '../lib/mediaUtils';

interface BentoCardProps { title: string; subtitle: string; icon: any; delay: number; onClick: () => void; }
const BentoCard = ({ title, subtitle, icon: Icon, delay, onClick }: BentoCardProps) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }} onClick={onClick} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-glass-bg border border-glass-border group active:scale-95 transition-transform cursor-pointer">
        <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-text-1 transition-all shrink-0"><Icon size={15} /></div>
        <div className="min-w-0">
            <p className="text-[8px] text-text-3 font-black uppercase tracking-widest leading-none mb-0.5">{subtitle}</p>
            <h3 className="text-[11px] font-black uppercase italic tracking-tighter text-text-1 leading-none truncate">{title}</h3>
        </div>
    </motion.div>
);

interface SignatureCardProps { recipe: any; index: number; onClick: () => void; mediaList: any[]; }
const SignatureCard = ({ recipe, index, onClick, mediaList }: SignatureCardProps) => {
    const cardImage = getMediaAssetUrl(recipe.cover_image_id, mediaList, recipe.image);
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} onClick={onClick} className="flex-shrink-0 w-[44vw] max-w-[200px] snap-start cursor-pointer">
            <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-glass-border shadow-xl">
                {cardImage ? <img src={cardImage} alt={recipe.title} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-glass-bg flex items-center justify-center"><ChefHat className="text-text-3" size={28} /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-base via-base/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-accent mb-1 truncate">{recipe.category || 'SIGNATURE'}</p>
                    <h4 className="text-sm font-black uppercase italic tracking-tight text-text-1 leading-tight line-clamp-2">{recipe.title}</h4>
                </div>
            </div>
        </motion.div>
    );
};

export default function Home() {
    const navigate = useNavigate();
    const { publicRecipes } = useRecipes();
    const { publicClasses } = useClasses();
    const { media } = useMedia();
    const { settings } = useAppSettings();
    const { user } = useUser();

    const [showHeader, setShowHeader] = useState(true);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest: number) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 100) setShowHeader(false);
        else setShowHeader(true);
    });

    const userName = user?.name && user.name !== 'Chef' ? user.name.split(' ')[0] : 'Chef';
    const heroGreeting = settings.heroTitle ? settings.heroTitle.split(',')[0] : 'HELLO';
    const heroMedia = settings.heroMediaUrl || '/library_hero.png';

    return (
        <div className="min-h-screen bg-base text-text-1 selection:bg-accent/30 overflow-x-hidden pb-28">
            <motion.div animate={{ y: showHeader ? 0 : -110 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="fixed top-0 left-0 right-0 z-[100] pt-[env(safe-area-inset-top,0px)] bg-base/90 backdrop-blur-2xl border-b border-glass-border">
                <Header variant="home" isStatic />
            </motion.div>

            <section className="relative h-[38vh] min-h-[220px] flex items-end px-5 pb-8 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={heroMedia} alt="Hero" className="w-full h-full object-cover opacity-50 grayscale-[0.3]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/30 to-transparent" />
                </div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-px bg-accent/50" />
                        <p className="text-accent text-[8px] font-black uppercase tracking-[0.4em]">{settings.siteName || 'CWC+'} PLATFORM</p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-text-1 leading-[0.88] mb-3">{heroGreeting},<br /><span className="text-accent">{userName}</span></h1>
                    <div className="flex gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-glass-bg border border-glass-border rounded-full text-[8px] font-black uppercase tracking-widest text-text-3">{(publicRecipes || []).length} Recipes</span>
                        <span className="px-2.5 py-1 bg-glass-bg border border-glass-border rounded-full text-[8px] font-black uppercase tracking-widest text-text-3">{(publicClasses || []).length} Classes</span>
                    </div>
                </motion.div>
            </section>

            <main className="px-5 mt-6 space-y-10">
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <BentoCard title="LIBRARY" subtitle="Recipes" icon={BookOpen} delay={0.05} onClick={() => navigate('/recipes')} />
                        <BentoCard title="ACADEMY" subtitle="Classes" icon={PlayCircle} delay={0.10} onClick={() => navigate('/classes')} />
                        <BentoCard title="PLANNER" subtitle="Schedule" icon={CalendarIcon} delay={0.15} onClick={() => navigate('/planner')} />
                        <BentoCard title="EQUIP" subtitle="Shop" icon={ShoppingBag} delay={0.20} onClick={() => navigate('/shop')} />
                    </div>
                </section>

                {(publicRecipes || []).length > 0 && (
                    <section>
                        <div className="flex items-baseline justify-between mb-4">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Signatures</h2>
                            <button onClick={() => navigate('/recipes')} className="text-[9px] font-black uppercase tracking-widest text-accent">See All</button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 snap-x snap-mandatory">
                            {(publicRecipes || []).slice(0, 8).map((recipe: any, index: number) => (
                                <SignatureCard key={recipe.id} recipe={recipe} index={index} onClick={() => navigate(`/recipe/${recipe.id}`)} mediaList={media} />
                            ))}
                        </div>
                    </section>
                )}

                {(publicClasses || []).length > 0 && (
                    <section className="pb-4">
                        <div className="flex items-baseline justify-between mb-4">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">Masterclasses</h2>
                            <button onClick={() => navigate('/classes')} className="text-[9px] font-black uppercase tracking-widest text-accent">See All</button>
                        </div>
                        <div className="space-y-4">
                            {(publicClasses || []).slice(0, 3).map((cls: any) => (
                                <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onClick={() => navigate(`/classes?id=${cls.id}`)} className="relative aspect-video w-full rounded-[1.75rem] overflow-hidden border border-glass-border group shadow-xl cursor-pointer">
                                    {cls.image ? <img src={cls.image} alt={cls.title} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" /> : <div className="w-full h-full bg-glass-bg flex items-center justify-center"><ChefHat size={32} className="text-text-3" /></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/20 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-accent/90 backdrop-blur-md flex items-center justify-center border border-glass-border shadow-xl"><PlayCircle size={20} className="text-text-1 fill-text-1" /></div>
                                    </div>
                                    <div className="absolute bottom-4 left-5 right-5">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-accent mb-1 truncate">{cls.instructor || 'CWC+ INSTRUCTOR'}</p>
                                        <h4 className="text-base font-black uppercase italic tracking-tight text-text-1 line-clamp-1">{cls.title}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
