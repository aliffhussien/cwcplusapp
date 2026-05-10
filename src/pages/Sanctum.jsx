import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Camera, Send, Mail, ShieldCheck, Globe, LockKeyhole as LockIcon, Shield, Award } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { APP_COPY } from '../config/appCopy';

export default function Sanctum() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#070B14] text-white pb-32">
            <Header variant="back" title="Sanctum Intelligence" />
            
            <main className="pt-24 px-6 md:px-12 max-w-5xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3">
                        <ChefHat size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">
                        {APP_COPY.branding.name}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
                        The private digital sanctuary for the modern culinary enthusiast. Preserving methods, masterclasses, and planning for the pro-sumer kitchen.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <section className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8">
                        <div>
                            <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Mission Protocol</h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                CWC+ is more than a platform; it's an authoritative vault for professional techniques. We bridge the gap between amateur passion and professional precision, providing the infrastructure for culinary mastery.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all"><Camera size={20}/></a>
                            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all"><Send size={20}/></a>
                            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all"><Mail size={20}/></a>
                        </div>
                    </section>

                    <section className="bg-[#0F172A]/40 border border-indigo-500/10 rounded-[40px] p-10 relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-indigo-500/5 group-hover:scale-110 transition-transform duration-1000" />
                        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6">Meal Planner</h2>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <LockIcon size={16} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">End-to-End Encryption</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <Shield size={16} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Vault Security Protocol</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <Award size={16} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Verified Methods</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-20">
                    <div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Recipe Vault</h3>
                        <ul className="space-y-4">
                            {['Recipes', 'Masterclasses', 'Shop', 'Pantry'].map(item => (
                                <li key={item} onClick={() => navigate(`/${item.toLowerCase()}`)} className="text-xs font-bold text-slate-500 hover:text-white cursor-pointer transition-colors uppercase tracking-widest">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Sanctum</h3>
                        <ul className="space-y-4">
                            {['Support', 'Partners', 'Discord'].map(item => (
                                <li key={item} className="text-xs font-bold text-slate-500 hover:text-white cursor-pointer transition-colors uppercase tracking-widest">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Legal</h3>
                        <ul className="space-y-4">
                            {['Terms', 'Privacy', 'Cookies'].map(item => (
                                <li key={item} className="text-xs font-bold text-slate-500 hover:text-white cursor-pointer transition-colors uppercase tracking-widest">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Global</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <Globe size={14} />
                            <span>Worldwide Access</span>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
