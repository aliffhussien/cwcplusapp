import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock as LockIcon, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Google SVG Icon
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <path d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5 16.25 5 12C5 7.9 8.2 4.73 12.2 4.73C15.29 4.73 17.1 6.7 17.1 6.7L19 4.72C19 4.72 16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12C2.03 17.05 6.16 22 12.25 22C17.6 22 21.5 18.33 21.5 12.91C21.5 11.76 21.35 11.1 21.35 11.1Z" fill="#4285F4"/>
            <path d="M3.98 7.34L6.14 9C6.14 9 7.28 6 12.1 6C14.03 6 15.6 6.93 16.48 7.72L18.45 5.73C17.14 4.49 15.1 3 12.1 3C8.1 3 4.89 5.05 3.98 7.34Z" fill="#EA4335"/>
            <path d="M12.1 22C14.97 22 17.6 20.97 19.46 19.2L17.35 17.35C16.18 18.31 14.56 19 12.1 19C8.14 19 5.02 16.34 4.07 12.78L1.97 14.47C3.33 18.38 7.34 22 12.1 22Z" fill="#34A853"/>
            <path d="M21.35 11.1H12.18V13.83H18.69C18.53 14.8 18.1 15.65 17.35 16.35L19.46 18.2C20.83 16.93 21.5 15.1 21.5 12.91C21.5 11.76 21.35 11.1 21.35 11.1Z" fill="#FBBC05"/>
        </g>
    </svg>
);

export default function AuthModal({ isOpen, onClose }) {
    // mode: 'login' | 'signup' | 'forgot'
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const reset = () => { setEmail(''); setPassword(''); setError(null); setSuccess(null); };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) { setError(error.message); setGoogleLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
            } else if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccess('Account created! Check your email to confirm.');
            } else if (mode === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
                });
                if (error) throw error;
                setSuccess('Reset link sent! Check your inbox and click the link to set a new password.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => { reset(); setMode('login'); onClose(); };

    const switchMode = (next) => { reset(); setMode(next); };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#070B14]/85 backdrop-blur-md" onClick={handleClose} />

                    <motion.div
                        initial={{ scale: 0.93, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.93, opacity: 0, y: 24 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="relative w-full max-w-md card-3d-base rounded-[36px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.9)] border border-white/10"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1/2 card-3d-glare pointer-events-none z-10" />
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/30 blur-[60px] pointer-events-none" />

                        <button onClick={handleClose}
                            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors z-20 border border-white/10">
                            <X size={18} />
                        </button>

                        <div className="relative z-10 p-8 pt-10">
                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-white mb-1.5 tracking-tight">
                                    {mode === 'login' ? 'Welcome back 👋' : mode === 'signup' ? 'Join CWC+ 🍳' : 'Reset Password 🔑'}
                                </h2>
                                <p className="text-sm font-medium text-slate-400">
                                    {mode === 'login' ? 'Sign in to access your culinary vault.'
                                        : mode === 'signup' ? 'Create your account and start cooking smarter.'
                                        : "Enter your email and we'll send you a reset link."}
                                </p>
                            </div>

                            {/* Google OAuth — only for login/signup */}
                            {mode !== 'forgot' && (
                                <>
                                    <button onClick={handleGoogleSignIn} disabled={googleLoading}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-black text-sm transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed border border-white/20 mb-6">
                                        {googleLoading ? <Loader2 size={20} className="animate-spin text-gray-500" /> : <><GoogleIcon />Continue with Google</>}
                                    </button>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex-1 h-px bg-white/10" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">or</span>
                                        <div className="flex-1 h-px bg-white/10" />
                                    </div>
                                </>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                                            placeholder="chef@gmail.com" />
                                    </div>
                                </div>

                                {mode !== 'forgot' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                            {mode === 'login' && (
                                                <button type="button" onClick={() => switchMode('forgot')}
                                                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <LockIcon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                                className="w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
                                        {success}
                                    </motion.div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full py-4 rounded-2xl btn-3d-active flex items-center justify-center gap-2 text-white font-black tracking-wide shadow-[0_8px_20px_rgba(99,102,241,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed mt-2">
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                        <>{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}<ArrowRight size={18} /></>
                                    )}
                                </button>
                            </form>

                            {/* Footer links */}
                            <div className="mt-6 text-center space-y-2">
                                {mode === 'login' && (
                                    <button onClick={() => switchMode('signup')} className="block w-full text-xs font-bold text-slate-500 hover:text-slate-200 transition-colors">
                                        Don't have an account? Sign up
                                    </button>
                                )}
                                {mode === 'signup' && (
                                    <button onClick={() => switchMode('login')} className="block w-full text-xs font-bold text-slate-500 hover:text-slate-200 transition-colors">
                                        Already have an account? Sign in
                                    </button>
                                )}
                                {mode === 'forgot' && (
                                    <button onClick={() => switchMode('login')} className="block w-full text-xs font-bold text-slate-500 hover:text-slate-200 transition-colors">
                                        ← Back to sign in
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
