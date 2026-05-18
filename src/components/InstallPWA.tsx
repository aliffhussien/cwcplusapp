import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstall(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setShowInstall(false);
        }
        
        setDeferredPrompt(null);
    };

    if (!showInstall) return null;

    return (
        <AnimatePresence>
            {showInstall && (
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm bg-elevated/90 backdrop-blur-xl border border-accent/30 rounded-2xl p-4 shadow-glow flex items-center gap-4"
                >
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
                        <img src="/CWC.svg" className="w-8 h-8" alt="CWC+" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-text-1 font-black text-sm">Install CWC+ App</h4>
                        <p className="text-text-3 text-xs">Add to homescreen for the best experience.</p>
                    </div>
                    <button onClick={handleInstall} className="btn-primary text-xs !min-h-0 !py-2 !px-4">
                        Install
                    </button>
                    <button onClick={() => setShowInstall(false)} className="p-1 text-text-3 hover:text-text-1 transition-colors">
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
