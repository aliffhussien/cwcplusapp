import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase exchanges the code automatically via onAuthStateChange.
        // We just need to wait for the session to be established then redirect home.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/', { replace: true });
            } else {
                // Wait for the auth state change to fire (handles code exchange)
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        subscription.unsubscribe();
                        navigate('/', { replace: true });
                    }
                });
                // Safety timeout – if nothing fires, go home anyway
                const timeout = setTimeout(() => {
                    subscription.unsubscribe();
                    navigate('/', { replace: true });
                }, 5000);
                return () => {
                    clearTimeout(timeout);
                    subscription.unsubscribe();
                };
            }
        });
    }, [navigate]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#070B14] gap-6">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-4 border-white/10 border-t-indigo-500"
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
            >
                <p className="text-white font-extrabold text-lg tracking-tight">Signing you in…</p>
                <p className="text-slate-500 text-sm font-medium mt-1">Setting up your culinary vault</p>
            </motion.div>
        </div>
    );
}
