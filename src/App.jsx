import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, LockKeyhole, LogIn } from 'lucide-react';
import { useUser } from './hooks/useUser';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import RecipeList from './pages/RecipeList';
import RecipeView from './pages/RecipeView';
import PlaceholderPage from './pages/PlaceholderPage';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Planner from './pages/Planner';
import Classes from './pages/Classes';
import Admin from './pages/Admin';
import Shop from './pages/Shop';
import Pantry from './pages/Pantry';
import AuthCallback from './pages/AuthCallback';
import BottomNav from './components/BottomNav';

const GlobalAuthGuard = ({ children }) => {
    const { session, loading } = useUser();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    if (loading) return <div className="min-h-screen bg-[#070B14] flex items-center justify-center"><ChefHat size={48} className="text-indigo-500 animate-pulse" /></div>;

    if (!session) {
        return (
            <div className="relative min-h-screen bg-[#070B14] text-white selection:bg-indigo-500/30 flex items-center justify-center p-6 overflow-hidden">
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.2, 0.15] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-600 blur-[120px]" />
                    <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-rose-600 blur-[140px]" />
                </div>

                <div className="w-full max-w-xl relative z-10 bg-[#0F172A]/80 backdrop-blur-xl border border-indigo-500/30 rounded-[32px] p-8 md:p-16 shadow-2xl text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/5 pointer-events-none rounded-[32px]" />
                    <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        <LockKeyhole size={48} className="text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">CWC<span className="text-indigo-400">+</span></h1>
                    <h2 className="text-2xl font-bold text-white mb-4">Your Kitchen Awaits</h2>
                    <p className="text-slate-400 text-base font-medium mb-10 leading-relaxed max-w-md mx-auto">
                        This is a private culinary platform. You must be signed in to access premium masterclasses, recipes, and your smart pantry.
                    </p>
                    <button 
                        onClick={() => setAuthModalOpen(true)}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-black text-xl shadow-[0_8px_20px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <LogIn size={24} /> Sign In to Access
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={
          <GlobalAuthGuard>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipes" element={<RecipeList />} />
              <Route path="/recipe/:id" element={<RecipeView />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/pantry" element={<Pantry />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/shop" element={<Shop />} />
            </Routes>
            <BottomNav />
          </GlobalAuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
