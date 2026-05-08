import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, DollarSign, ExternalLink, RefreshCw, CheckCircle2, XCircle, Truck, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const mockOrders = [
    { id: 'ORD-8923', customer: 'Alice Wong', email: 'alice@example.com', phone: '+60 12-345 6789', address: '123 Jalan Ampang, 50450 Kuala Lumpur', product: 'Chef Knife Pro', amount: 120.00, status: 'paid', fulfillment: 'pending', date: '2026-05-08' },
    { id: 'ORD-8924', customer: 'John Doe', email: 'john@example.com', phone: '+60 19-876 5432', address: '45 Jalan Bangsar, 59100 Kuala Lumpur', product: 'CWC Apron', amount: 45.00, status: 'paid', fulfillment: 'shipped', date: '2026-05-07' },
    { id: 'ORD-8925', customer: 'Sarah Miller', email: 'sarah@example.com', phone: '+1 555-0198', address: 'Digital Delivery', product: 'Premium Subscription (1 yr)', amount: 150.00, status: 'refunded', fulfillment: 'fulfilled', date: '2026-05-05' },
    { id: 'ORD-8926', customer: 'Michael Chen', email: 'mike@example.com', phone: '+60 11-2345 6789', address: '88 Taman Tun Dr Ismail, 60000 KL', product: 'Ceramic Pan Set', amount: 200.00, status: 'paid', fulfillment: 'delivered', date: '2026-05-01' },
];

export default function OrdersManager() {
    const [orders, setOrders] = useState(mockOrders);
    const [search, setSearch] = useState('');
    const [loadingId, setLoadingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const handleAction = (id, actionType) => {
        setLoadingId(id);
        setTimeout(() => {
            setOrders(orders.map(o => {
                if (o.id === id) {
                    if (actionType === 'refund') return { ...o, status: 'refunded' };
                    if (actionType === 'ship') return { ...o, fulfillment: 'shipped' };
                    if (actionType === 'deliver') return { ...o, fulfillment: 'delivered' };
                }
                return o;
            }));
            setLoadingId(null);
        }, 800);
    };

    const filtered = orders.filter(o => o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase()));

    const getStatusColor = (status) => {
        switch(status) {
            case 'paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'refunded': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            default: return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    const getFulfillmentColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'delivered': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <DollarSign className="text-emerald-400" size={32} />
                        Payments & Orders
                    </h2>
                    <p className="text-slate-400">Manage Stripe payments, issue refunds, and track shipments.</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search orders, emails..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-80 bg-slate-900 border-2 border-slate-800 rounded-full pl-12 pr-6 py-3 text-white font-bold outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-950/50 border-b-2 border-slate-800">
                                <th className="px-6 py-5 text-sm font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-400 uppercase tracking-widest">Product & Amount</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-400 uppercase tracking-widest">Payment</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-400 uppercase tracking-widest">Fulfillment</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filtered.map(order => (
                                <React.Fragment key={order.id}>
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`transition-colors ${expandedId === order.id ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}>
                                        <td className="px-6 py-5 font-bold text-white whitespace-nowrap">
                                            {order.id}
                                            <div className="text-xs text-slate-500 font-normal mt-1">{order.date}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-white">{order.customer}</div>
                                            <div className="text-xs text-slate-400">{order.email}</div>
                                            <button 
                                                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-2 hover:text-indigo-300 transition-colors"
                                            >
                                                {expandedId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                {expandedId === order.id ? 'Hide Details' : 'Show Details'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-indigo-400 line-clamp-1">{order.product}</div>
                                            <div className="text-sm font-black text-white">${order.amount.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase border ${getFulfillmentColor(order.fulfillment)}`}>
                                                {order.fulfillment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                {order.status === 'paid' && (
                                                    <button 
                                                        onClick={() => handleAction(order.id, 'refund')}
                                                        disabled={loadingId === order.id}
                                                        className="p-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors disabled:opacity-50"
                                                        title="Issue Full Refund"
                                                    >
                                                        {loadingId === order.id ? <RefreshCw size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                    </button>
                                                )}
                                                {order.fulfillment === 'pending' && order.status === 'paid' && (
                                                    <button 
                                                        onClick={() => handleAction(order.id, 'ship')}
                                                        disabled={loadingId === order.id}
                                                        className="p-2 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors disabled:opacity-50"
                                                        title="Mark as Shipped"
                                                    >
                                                        {loadingId === order.id ? <RefreshCw size={18} className="animate-spin" /> : <Truck size={18} />}
                                                    </button>
                                                )}
                                                {order.fulfillment === 'shipped' && (
                                                    <button 
                                                        onClick={() => handleAction(order.id, 'deliver')}
                                                        disabled={loadingId === order.id}
                                                        className="p-2 bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors disabled:opacity-50"
                                                        title="Mark as Delivered"
                                                    >
                                                        {loadingId === order.id ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                    </button>
                                                )}
                                                <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors" title="View in Stripe">
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                    <AnimatePresence>
                                        {expandedId === order.id && (
                                            <motion.tr 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-slate-900/50"
                                            >
                                                <td colSpan="6" className="px-6 py-4 border-b border-slate-800/50">
                                                    <div className="flex flex-col md:flex-row gap-8 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                                                        <div className="space-y-2">
                                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Phone</div>
                                                            <div className="flex items-center gap-2 text-sm font-bold text-white">
                                                                <Phone size={16} className="text-indigo-400" />
                                                                {order.phone}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Shipping Address (Alamat)</div>
                                                            <div className="flex items-start gap-2 text-sm font-bold text-white max-w-sm">
                                                                <MapPin size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                                                                {order.address}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-slate-500 font-bold">
                            No orders found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
