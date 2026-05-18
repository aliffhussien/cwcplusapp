import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, ChefHat, Video, Activity, EyeOff, Eye, Star } from 'lucide-react';
import { getTierMeta } from '../../lib/ui';

export default function AdminOverview({ people, mrr, recipes, classes, settings, handleTabChange }: any) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Members', val: people.length, icon: Users, color: 'text-accent' },
                    { label: 'Monthly Revenue', val: `$${mrr.toLocaleString()}`, icon: DollarSign, color: 'text-accent-sec' },
                    { label: 'Total Recipes', val: recipes.length, icon: ChefHat, color: 'text-warning' },
                    { label: 'Live Studios', val: classes.length, icon: Video, color: 'text-violet-500' }
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-[30px] bg-base/40 border border-glass-border flex items-center gap-5 group hover:border-accent/20 transition-all">
                        <div className={`w-12 h-12 rounded-2xl bg-base flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon size={20} /></div>
                        <div><p className="text-xl font-black text-text-1 tracking-tight leading-none">{stat.val}</p><p className="text-[9px] font-black uppercase tracking-widest text-text-3 mt-1.5">{stat.label}</p></div>
                    </motion.div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-[40px] bg-base/40 border border-glass-border shadow-2xl">
                    <div className="flex items-center justify-between mb-8"><h3 className="text-sm font-black text-text-1 flex items-center gap-2 uppercase tracking-widest"><Users size={16} className="text-accent" /> Membership Tiers</h3><button onClick={() => handleTabChange('people')} className="text-[10px] font-black text-accent hover:text-accent-sec uppercase tracking-widest">Manage All</button></div>
                    <div className="space-y-5">
                        {['Free', ...(settings?.premiumTiers?.map((t: any) => t.name) || [])].map((tier: string) => {
                            const count = people.filter((p: any) => p.subscriptionTier === tier || p.subscription_tier === tier).length;
                            const pct = people.length ? Math.round((count / people.length) * 100) : 0;
                            const meta = getTierMeta(tier, settings);
                            return (
                                <div key={tier} className="group">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-2.5"><span className="text-text-3 group-hover:text-text-1 transition-colors">{tier}</span><span className="text-text-1">{count} ({pct}%)</span></div>
                                    <div className="w-full h-2 bg-base rounded-full overflow-hidden border border-glass-border"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className={`h-full ${tier === 'Free' ? 'bg-text-3' : 'bg-accent'}`} style={meta.customColor ? { backgroundColor: meta.customColor } : {}} /></div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="p-6 rounded-[40px] bg-base/40 border border-glass-border shadow-2xl">
                    <div className="flex items-center justify-between mb-8"><h3 className="text-sm font-black text-text-1 flex items-center gap-2 uppercase tracking-widest"><Activity size={16} className="text-accent-sec" /> Content Saturation</h3><div className="flex gap-2"><button onClick={() => handleTabChange('recipes')} className="text-[10px] font-black text-text-3 hover:text-text-1 uppercase tracking-widest">Recipes</button><button onClick={() => handleTabChange('classes')} className="text-[10px] font-black text-text-3 hover:text-text-1 uppercase tracking-widest">Studios</button></div></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-base/50 rounded-3xl border border-glass-border flex flex-col justify-center items-center text-center group hover:bg-base transition-all"><span className="text-text-3 mb-3 group-hover:scale-110 transition-transform"><EyeOff size={24} /></span><h4 className="text-3xl font-black text-text-1 leading-none">{recipes.filter((r: any) => r.status === 'draft').length + classes.filter((c: any) => c.status === 'draft').length}</h4><p className="text-[9px] font-black uppercase text-text-3 tracking-widest mt-3">Drafting Room</p></div>
                        <div className="p-6 bg-base/50 rounded-3xl border border-glass-border flex flex-col justify-center items-center text-center group hover:bg-base transition-all"><span className="text-accent mb-3 group-hover:scale-110 transition-transform"><Eye size={24} /></span><h4 className="text-3xl font-black text-text-1 leading-none">{recipes.filter((r: any) => r.status === 'published').length + classes.filter((c: any) => c.status === 'published').length}</h4><p className="text-[9px] font-black uppercase text-text-3 tracking-widest mt-3">Live Assets</p></div>
                        <div className="p-5 bg-accent/5 rounded-3xl border border-accent/10 flex items-center justify-between col-span-2 group hover:bg-accent/10 transition-all px-8"><div className="flex items-center gap-4"><span className="text-warning group-hover:rotate-12 transition-transform"><Star size={20} className="fill-warning" /></span><p className="text-[10px] font-black uppercase text-text-1 tracking-widest">Featured Selection</p></div><h4 className="text-2xl font-black text-text-1">{recipes.filter((r: any) => r.isFeatured).length + classes.filter((c: any) => c.isFeatured).length}</h4></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
