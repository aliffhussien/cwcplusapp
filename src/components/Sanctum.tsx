import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Camera, Send, Mail, ShieldCheck, Globe, LockKeyhole as LockIcon, Shield, Award } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { APP_COPY } from '../config/appCopy';

export default function Sanctum() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-base text-text-1 pb-32">
            <Header variant="back" title="About Our Kitchen" />
            
            <main className="pt-24 px-6 md:px-12 max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
                    <div className="w-20 h-20 bg-glass-bg border border-glass-border rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3">
                        <ChefHat size={40} className="text-text-1" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">
                        {APP_COPY.branding.name}
                    </h1>
                    <p className="text-text-3 text-sm font-medium max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
                        Your friendly home for simple recipes, fun cooking classes, and easy meal planning. Made for real kitchens and real families.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <section className="bg-glass-bg border border-glass-border rounded-[40px] p-10 space-y-8">
                        <div>
                            <h2 className="section-label text-accent mb-6">Our Mission</h2>
                            <p className="text-text-3 text-sm font-medium leading-relaxed">
                                {APP_COPY.branding.shortName} is designed to make home cooking fun and accessible for everyone. We believe that delicious, healthy meals should be easy to prepare and even better when shared with the ones you love.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {['Camera', 'Send', 'Mail'].map((icon, i) => (
                                <button key={i} type="button" className="w-12 h-12 rounded-2xl bg-glass-bg border border-glass-border flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-accent transition-all">
                                    {icon === 'Camera' ? <Camera size={20}/> : icon === 'Send' ? <Send size={20}/> : <Mail size={20}/>}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-surface border border-accent/10 rounded-[40px] p-10 relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-accent/5 group-hover:scale-110 transition-transform duration-1000" />
                        <h2 className="section-label text-text-1 mb-6">Meal Planner</h2>
                        <div className="space-y-4 relative z-10">
                            {[
                                { icon: <LockIcon size={16} className="text-accent" />, label: "End-to-End Encryption" },
                                { icon: <Shield size={16} className="text-accent" />, label: "Secure Storage" },
                                { icon: <Award size={16} className="text-accent" />, label: "Verified Methods" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-glass-bg border border-glass-border rounded-2xl">
                                    {item.icon}
                                    <span className="section-label text-text-2">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-glass-border pt-20">
                    <div>
                        <h3 className="section-label text-text-1 mb-6">{APP_COPY.navigation.library}</h3>
                        <ul className="space-y-4">
                            {['Recipes', 'Classes', 'Shop', 'Pantry'].map(item => (
                                <li key={item} onClick={() => navigate(`/${item.toLowerCase()}`)} className="section-label text-text-3 hover:text-text-1 cursor-pointer transition-colors">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="section-label text-text-1 mb-6">Community</h3>
                        <ul className="space-y-4">
                            {['Support', 'Partners', 'Discord'].map(item => (
                                <li key={item} className="section-label text-text-3 hover:text-text-1 cursor-pointer transition-colors">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="section-label text-text-1 mb-6">Legal</h3>
                        <ul className="space-y-4">
                            {['Terms', 'Privacy', 'Cookies'].map(item => (
                                <li key={item} className="section-label text-text-3 hover:text-text-1 cursor-pointer transition-colors">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="section-label text-text-1 mb-6">Global</h3>
                        <div className="flex items-center gap-2 section-label text-text-3">
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
