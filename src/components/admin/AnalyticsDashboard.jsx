import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function AnalyticsDashboard({ recipes = [], classes = [], people = [], settings = {}, mrr = 0 }) {
    
    const revenueData = useMemo(() => {
        // Simple MRR growth simulation based on user join dates over the last 5 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dataMap = {};
        
        // Initialize last 5 months including current
        const now = new Date();
        for (let i = 4; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().substring(2)}`;
            dataMap[key] = { name: key, revenue: 0, subs: 0 };
        }

        // We calculate cumulative revenue. Since we don't have churn data, we just add revenue up to that month.
        const keys = Object.keys(dataMap);
        
        let cumulativeSubs = 0;
        let cumulativeRev = 0;

        // Group people by month joined
        keys.forEach(key => {
            const [month, yearStr] = key.split(" '");
            const mIndex = monthNames.indexOf(month);
            const yIndex = 2000 + parseInt(yearStr);
            
            // Find users joined in or before this month
            const joinedUsers = people.filter(p => {
               if (!p.created_at) return true; // Assume old users joined early
               const pd = new Date(p.created_at);
               return pd.getFullYear() < yIndex || (pd.getFullYear() === yIndex && pd.getMonth() <= mIndex);
            });

            let rev = 0;
            let subs = 0;
            joinedUsers.forEach(p => {
                 if (p.subscriptionTier && p.subscriptionTier !== 'Free') {
                     subs++;
                     const t = settings.premiumTiers?.find(tier => tier.name === p.subscriptionTier);
                     if (t && t.price) {
                         const basePrice = parseFloat(t.price);
                         const discount = parseFloat(t.discount) || 0;
                         rev += basePrice * (1 - discount / 100);
                     }
                 }
            });

            dataMap[key].revenue = Math.round(rev);
            dataMap[key].subs = subs;
        });

        return Object.values(dataMap);
    }, [people, settings]);

    const contentData = useMemo(() => {
        const topRecipes = recipes.map(r => ({ name: r.title, views: r.views || 0 }));
        const topClasses = classes.map(c => ({ name: c.title, views: c.views || 0 }));
        return [...topRecipes, ...topClasses]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
            .map(c => ({ ...c, name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name }));
    }, [recipes, classes]);

    const activeSubs = people.filter(p => p.subscriptionTier && p.subscriptionTier !== 'Free').length;
    const conversionRate = people.length > 0 ? ((activeSubs / people.length) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <TrendingUp className="text-accent" size={32} />
                        Analytics Engine
                    </h2>
                    <p className="text-slate-400">Deep insights into your CWC+ platform's performance based on real-time data.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] p-6 lg:p-8 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <DollarSign className="text-emerald-400" /> MRR Growth
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', fontWeight: 'bold', color: 'white' }}
                                    itemStyle={{ color: '#34d399' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={4} dot={{ r: 6, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 8, fill: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement Chart */}
                <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] p-6 lg:p-8 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Activity className="text-rose-400" /> Top Content Views
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', fontWeight: 'bold', color: 'white' }}
                                    itemStyle={{ color: '#fb7185' }}
                                    cursor={{ fill: '#1e293b' }}
                                />
                                <Bar dataKey="views" fill="#fb7185" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-gradient-to-br from-accent/20 to-slate-900/40 border-2 border-accent/30 rounded-[32px] p-8 flex flex-col justify-center text-center">
                    <Users size={32} className="mx-auto text-accent mb-2" />
                    <h3 className="text-4xl font-black text-white leading-none">{activeSubs}</h3>
                    <span className="text-accent/70 font-bold tracking-widest uppercase text-xs mt-1">Active Subscribers</span>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border-2 border-emerald-500/30 rounded-[32px] p-8 flex flex-col justify-center text-center">
                    <DollarSign size={32} className="mx-auto text-emerald-400 mb-2" />
                    <span className="text-4xl font-black text-white">${Math.round(mrr)}</span>
                    <span className="text-emerald-300 font-bold tracking-widest uppercase text-xs mt-1">Monthly Recurring</span>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/40 border-2 border-amber-500/30 rounded-[32px] p-8 flex flex-col justify-center text-center">
                    <Activity size={32} className="mx-auto text-amber-400 mb-2" />
                    <span className="text-4xl font-black text-white">{conversionRate}%</span>
                    <span className="text-amber-300 font-bold tracking-widest uppercase text-xs mt-1">Conversion Rate</span>
                </div>
            </div>
        </div>
    );
}
