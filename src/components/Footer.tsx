import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Camera, Send, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import { APP_COPY } from '../config/appCopy';

export default function Footer() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-20 border-t border-border bg-base pt-20 pb-40 md:pb-20 overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-premium/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-glass-bg border border-glass-border rounded-xl flex items-center justify-center shadow-2xl">
                                <ChefHat size={20} className="text-text-1" />
                            </div>
                            <span className="text-xl font-black italic tracking-tighter text-text-1 uppercase">{APP_COPY.branding.name}</span>
                        </div>
                        <p className="text-sm text-text-3 leading-relaxed max-w-xs font-medium">
                            Your friendly digital home for the home cook. Simple recipes, fun cooking classes, and meal planning made easy.
                        </p>
                        <div className="flex items-center gap-4">
                            <button type="button" className="w-10 h-10 rounded-xl bg-glass-bg border border-glass-border flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-glass-bg transition-all"><Camera size={18}/></button>
                            <button type="button" className="w-10 h-10 rounded-xl bg-glass-bg border border-glass-border flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-glass-bg transition-all"><Send size={18}/></button>
                            <button type="button" className="w-10 h-10 rounded-xl bg-glass-bg border border-glass-border flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-glass-bg transition-all"><Mail size={18}/></button>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div>
                        <h5 className="section-label mb-8">Recipe Box</h5>
                        <ul className="space-y-4">
                            {['Recipes', 'Classes', 'Shop', 'Planner', 'Pantry'].map((item) => (
                                <li key={item}>
                                    <button 
                                        onClick={() => navigate(`/${item === 'Classes' ? 'classes' : item.toLowerCase()}`)} 
                                        className="text-sm font-bold text-text-3 hover:text-accent transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 bg-surface rounded-full group-hover:bg-accent transition-all" />
                                        {item === 'Classes' ? 'Cooking Classes' : item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community Section */}
                    <div>
                        <h5 className="section-label mb-8">Join the Kitchen</h5>
                        <ul className="space-y-4">
                            <li>
                                <button type="button" className="text-sm font-bold text-text-3 hover:text-text-1 transition-colors flex items-center justify-between group w-full">
                                    Discord Community <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            </li>
                            <li>
                                <button type="button" className="text-sm font-bold text-text-3 hover:text-text-1 transition-colors flex items-center justify-between group w-full">
                                    Member Support <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            </li>
                            <li>
                                <button type="button" className="text-sm font-bold text-text-3 hover:text-text-1 transition-colors flex items-center justify-between group w-full">
                                    Partner Portal <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Logistics Section */}
                    <div className="bg-glass-bg rounded-3xl p-8 border border-glass-border relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-text-1/5 group-hover:scale-110 transition-transform duration-700" />
                        <h5 className="section-label mb-4">Meal Planner</h5>
                        <p className="text-xs text-text-3 leading-relaxed mb-6 font-medium">
                            Your recipes and plans are safe with us. We value your privacy and keep your kitchen data secure.
                        </p>
                        <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-accent-sec transition-colors">View Privacy Policy</button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                        © {currentYear} {APP_COPY.branding.name}. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <button className="text-[10px] font-black text-text-3 hover:text-text-1 uppercase tracking-widest transition-colors">Legal</button>
                        <button className="text-[10px] font-black text-text-3 hover:text-text-1 uppercase tracking-widest transition-colors">Privacy</button>
                        <button className="text-[10px] font-black text-text-3 hover:text-text-1 uppercase tracking-widest transition-colors">Security</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
