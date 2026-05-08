import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600 blur-[100px]"
        />
    </div>
);

export default function PlaceholderPage({ title }) {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30">
            <AnimatedBackground />
            <Header variant="back" title={title} />

            <main className="relative z-10 pt-24 pb-16 px-4 md:px-10 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
                <div className="text-center p-8 md:p-12 card-3d-base rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
                        {title}
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base mb-6 max-w-md mx-auto">
                        This page is structurally ready and waiting for your design implementation. The routing is fully wired up!
                    </p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-[12px] btn-3d-active text-white text-sm font-extrabold shadow-[0_4px_12px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-transform">
                        Go Back
                    </button>
                </div>
            </main>
        </div>
    );
}
