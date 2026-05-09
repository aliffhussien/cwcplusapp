import { motion } from 'framer-motion';
import { ChevronRight, PlayCircle, BookOpen, Calendar as CalendarIcon, ChefHat, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';
import { useUser } from '../hooks/useUser';
import { useMedia } from '../hooks/useMedia';
import { APP_COPY } from '../config/appCopy';
import { getMediaAssetUrl } from '../lib/mediaUtils';

const BentoCard = ({ title, subtitle, icon: Icon, image, delay, onClick }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay, duration: 0.4 }}
        onClick={onClick}
        className="cwc-card cursor-pointer group flex flex-col justify-between min-h-[180px]"
    >
        <div className="absolute inset-0 z-0">
            {image && (
                <img src={image} alt={title} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] to-transparent" />
        </div>
        <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-[#070B14] transition-all">
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-tight mb-1">{title}</h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{subtitle}</p>
        </div>
        <div className="relative z-10 flex justify-end mt-4">
            <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                <ChevronRight size={16} />
            </div>
        </div>
    </motion.div>
);

const SignatureCard = ({ recipe, index, onClick, mediaList }) => {
    const cardImage = getMediaAssetUrl(recipe.cover_image_id, mediaList, recipe.image);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="cwc-card group cursor-pointer"
        >
            <div className="aspect-video w-full rounded-lg overflow-hidden mb-3">
                {cardImage ? (
                    <img src={cardImage} alt={recipe.title} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center"><ChefHat className="text-slate-700" size={24}/></div>
                )}
            </div>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{recipe.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{recipe.category || 'SIGNATURE'}</p>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <p className="text-[10px] text-indigo-500/80 font-bold uppercase tracking-widest">{recipe.volume || 'Original'}</p>
                    </div>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{recipe.time || '45m'}</div>
            </div>
        </motion.div>
    );
};

export default function Home() {
    const navigate = useNavigate();
    const { publicRecipes } = useRecipes();
    const { publicClasses } = useClasses();
    const { media } = useMedia();
    const { user } = useUser();

    const userName = user?.name && user.name !== 'Chef' ? user.name : 'Author';

    return (
        <div className="min-h-screen bg-[#070B14] text-white pb-32">
            <Header variant="home" />

            <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto space-y-12 md:space-y-20">
                
                {/* Pure Lean Greeting */}
                <section className="py-8 md:py-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 text-white leading-none">
                            Welcome, <span className="text-indigo-500">{userName}</span>
                        </h1>
                        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-[0.3em] opacity-70">
                            {APP_COPY.hero.subtitle}
                        </p>
                    </motion.div>
                </section>

                {/* Tactical Navigation - Fluid Grid */}
                <section className="fluid-grid !px-0">
                    <BentoCard 
                        title={APP_COPY.bentoGrid.recipes.title} 
                        subtitle={APP_COPY.bentoGrid.recipes.subtitle} 
                        icon={BookOpen}
                        image="/library_hero.png"
                        delay={0.1}
                        onClick={() => navigate('/recipes')}
                    />
                    <BentoCard 
                        title={APP_COPY.bentoGrid.masterclasses.title} 
                        subtitle={APP_COPY.bentoGrid.masterclasses.subtitle} 
                        icon={PlayCircle}
                        image="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800"
                        delay={0.2}
                        onClick={() => navigate('/classes')}
                    />
                    <BentoCard 
                        title={APP_COPY.bentoGrid.logistics.title} 
                        subtitle={APP_COPY.bentoGrid.logistics.subtitle} 
                        icon={CalendarIcon}
                        image="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800"
                        delay={0.3}
                        onClick={() => navigate('/planner')}
                    />
                </section>

                {/* Signature Selection - Compact Grid */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{APP_COPY.trending.title}</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">{APP_COPY.trending.subtitle}</p>
                        </div>
                        <button onClick={() => navigate('/recipes')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group">
                            {APP_COPY.trending.cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="fluid-grid !px-0">
                        {publicRecipes.slice(0, 5).map((recipe, index) => (
                            <SignatureCard 
                                key={recipe.id} 
                                recipe={recipe} 
                                index={index} 
                                onClick={() => navigate(`/recipe/${recipe.id}`)} 
                                mediaList={media}
                            />
                        ))}
                    </div>
                </section>

                {/* Masterclass Selection - Compact Grid */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Masterclass Selection</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">Professional technique sessions from the vault</p>
                        </div>
                        <button onClick={() => navigate('/classes')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group">
                            Explore All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="fluid-grid !px-0">
                        {publicClasses.slice(0, 5).map((cls, index) => (
                            <motion.div 
                                key={cls.id} 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ delay: index * 0.05 }}
                                onClick={() => navigate(`/classes?id=${cls.id}`)}
                                className="cwc-card group cursor-pointer"
                            >
                                <div className="aspect-video w-full rounded-lg overflow-hidden mb-3 relative">
                                    {cls.image ? (
                                        <img src={cls.image} alt={cls.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center"><PlayCircle className="text-slate-700" size={24}/></div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                                        <PlayCircle size={12} className="text-white fill-white" />
                                    </div>
                                </div>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{cls.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{cls.instructor || 'CWC+ Expert'}</p>
                                    </div>
                                    <div className="text-[10px] text-indigo-400 font-bold">$19.99</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}
