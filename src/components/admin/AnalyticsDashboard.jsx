import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const revenueData = [
  { name: 'Jan', revenue: 4000, subs: 120 },
  { name: 'Feb', revenue: 5500, subs: 150 },
  { name: 'Mar', revenue: 7200, subs: 200 },
  { name: 'Apr', revenue: 8100, subs: 220 },
  { name: 'May', revenue: 10500, subs: 280 },
];

const contentData = [
  { name: 'Pasta Master', views: 4500 },
  { name: 'Steak 101', views: 3200 },
  { name: 'Knife Skills', views: 2800 },
  { name: 'Bread Baking', views: 5100 },
];

export default function AnalyticsDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <TrendingUp className="text-indigo-400" size={32} />
                        Analytics Engine
                    </h2>
                    <p className="text-slate-400">Deep insights into your CWC+ platform's performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] p-6 lg:p-8 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <DollarSign className="text-emerald-400" /> Revenue Growth (2026)
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
                <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-900/40 border-2 border-indigo-500/30 rounded-[32px] p-8 flex flex-col justify-center text-center">
                    <Users size={32} className="mx-auto text-indigo-400 mb-2" />
                    <span className="text-4xl font-black text-white">280</span>
                    <span className="text-indigo-300 font-bold tracking-widest uppercase text-xs mt-1">Active Subscribers</span>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border-2 border-emerald-500/30 rounded-[32px] p-8 flex flex-col justify-center text-center">
                    <DollarSign size={32} className="mx-auto text-emerald-400 mb-2" />
                    <span className="text-4xl font-black text-white">$10.5k</span>
                    <span className="text-emerald-300 font-bold tracking-widest uppercase text-xs mt-1">Monthly Recurring</span>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/40 border-2 border-amber-500/30 rounded-[32px] p-8 flex flex-col justify-center text-center">
                    <Activity size={32} className="mx-auto text-amber-400 mb-2" />
                    <span className="text-4xl font-black text-white">4.8%</span>
                    <span className="text-amber-300 font-bold tracking-widest uppercase text-xs mt-1">Conversion Rate</span>
                </div>
            </div>
        </div>
    );
}
