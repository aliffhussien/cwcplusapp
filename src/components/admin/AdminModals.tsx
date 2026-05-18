import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Unlock, Lock, ShieldAlert } from 'lucide-react';

export const Toast = ({ message, type, onClose }: any) => (
  <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 border border-glass-border backdrop-blur-2xl ${type === 'success' ? 'bg-accent/20 text-text-1' : 'bg-danger/20 text-danger'}`}>
    <div className={`p-2 rounded-full ${type === 'success' ? 'bg-accent' : 'bg-danger'} text-text-1`}>{type === 'success' ? <span className="font-bold">✓</span> : <span className="font-bold">!</span>}</div>
    <span className="font-extrabold text-lg tracking-wide">{message}</span>
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={20} /></button>
  </motion.div>
);

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-base/80 backdrop-blur-md" onClick={onCancel} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-md bg-surface border border-glass-border rounded-[40px] p-8 md:p-10 shadow-2xl text-center">
          <div className="w-20 h-20 bg-danger/20 rounded-full flex items-center justify-center text-danger mx-auto mb-6"><Trash2 size={40} /></div>
          <h3 className="text-3xl font-black text-text-1 mb-4 tracking-tight">{title}</h3>
          <p className="text-text-3 font-bold mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-4 bg-elevated hover:bg-glass-bg text-text-1 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-4 bg-danger hover:bg-danger/80 text-text-1 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-danger/20">Yes, Trash It</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const UnlockModal = ({ isOpen, context, onConfirm, onCancel }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-base/80 backdrop-blur-md" onClick={onCancel} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-md bg-surface border border-glass-border rounded-[40px] p-8 md:p-10 shadow-2xl text-center">
          <div className={`w-20 h-20 ${context.action === 'unlock' ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'} rounded-full flex items-center justify-center mx-auto mb-6`}>{context.action === 'unlock' ? <Unlock size={40} /> : <Lock size={40} />}</div>
          <h3 className="text-3xl font-black text-text-1 mb-4 tracking-tight">{context.action === 'unlock' ? 'Unlock Content?' : 'Restrict Access?'}</h3>
          <p className="text-text-3 font-bold mb-8 leading-relaxed">{context.action === 'unlock' ? `You are about to give this member explicit access to "${context.itemName}".` : `You are about to revoke explicit access to "${context.itemName}".`}</p>
          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-4 bg-elevated hover:bg-glass-bg text-text-1 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Cancel</button>
            <button onClick={onConfirm} className={`flex-1 py-4 ${context.action === 'unlock' ? 'bg-accent hover:bg-accent-dim' : 'bg-danger hover:bg-danger/80'} text-text-1 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl`}>{context.action === 'unlock' ? 'Confirm Unlock' : 'Confirm Lock'}</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const GenericConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", confirmColor = "bg-danger", icon: Icon = Trash2 }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-base/80 backdrop-blur-md" onClick={onCancel} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-md bg-surface border border-glass-border rounded-[40px] p-8 md:p-10 shadow-2xl text-center">
          <div className={`w-20 h-20 ${confirmColor.includes('danger') ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'} rounded-full flex items-center justify-center mx-auto mb-6`}><Icon size={40} /></div>
          <h3 className="text-3xl font-black text-text-1 mb-4 tracking-tight">{title}</h3>
          <p className="text-text-3 font-bold mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-4 bg-elevated hover:bg-glass-bg text-text-1 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Cancel</button>
            <button onClick={onConfirm} className={`flex-1 py-4 ${confirmColor} text-text-1 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl`}>{confirmText}</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
