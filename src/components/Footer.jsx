import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Camera, Send, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import { APP_COPY } from '../config/appCopy';

export default function Footer() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-20 border-t border-white/5 bg-[#070B14] pt-20 pb-40 md:pb-20 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-2xl">
                                <ChefHat size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-black italic tracking-tighter text-white uppercase">{APP_COPY.branding.name}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-xs font-medium">
                            The private digital sanctuary for the modern culinary enthusiast. Preserving methods, masterclasses, and planning for the pro-sumer kitchen.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Camera size={18}/></a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Send size={18}/></a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Mail size={18}/></a>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Recipe Vault</h5>
                        <ul className="space-y-4">
                            {['Recipes', 'Masterclasses', 'Shop', 'Planner', 'Pantry'].map((item) => (
                                <li key={item}>
                                    <button 
                                        onClick={() => navigate(`/${item.toLowerCase()}`)} 
                                        className="text-sm font-bold text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 bg-slate-800 rounded-full group-hover:bg-indigo-500 transition-all" />
                                        {item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community Section */}
                    <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Join the Sanctum</h5>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center justify-between group">
                                    Discord Community <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center justify-between group">
                                    Member Support <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center justify-between group">
                                    Partner Portal <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Logistics Section */}
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                        <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">Meal Planner</h5>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                            Protected by CWC+ Cryptographic Methods. Your data and signature recipes are secured in your private vault.
                        </p>
                        <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Review Privacy Protocols</button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        © {currentYear} {APP_COPY.branding.name}. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <button className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Legal</button>
                        <button className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Privacy</button>
                        <button className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Security</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
