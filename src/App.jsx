import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChefHat, LogIn } from 'lucide-react';
import { useUser } from './hooks/useUser';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import RecipeList from './pages/RecipeList';
import RecipeView from './pages/RecipeView';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Planner from './pages/Planner';
import Classes from './pages/Classes';
import Sanctum from './pages/Sanctum';
import Shop from './pages/Shop';
import Pantry from './pages/Pantry';
import AuthCallback from './pages/AuthCallback';
import BottomNav, { NavStateProvider } from './components/BottomNav';
import InstallPWA from './components/InstallPWA';
import { OfflineSentry } from './components/PerformanceUI';
import { AppDataProvider } from './context/AppDataProvider';
import ErrorBoundary from './components/ErrorBoundary';

const EmpireCommandCenter = lazy(() => import('./pages/Admin'));

const GlobalAuthGuard = ({ children }) => {
    const { session, loading } = useUser();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    if (loading) return (
        <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
            <ChefHat size={32} className="text-white animate-pulse" />
        </div>
    );

    if (!session) {
        return (
            <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center p-6">
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                <InstallPWA />
                <div className="w-full max-w-md bg-[#0A0F1C] border border-white/5 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <div className="flex items-center justify-center mx-auto mb-8">
                        <img src="/logo-2.png" alt="CWC+" className="h-28 w-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">CWC<span className="text-indigo-400">+</span></h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-6">Culinary Archive Access</p>
                    <p className="text-sm text-slate-400 font-medium mb-10 leading-relaxed max-w-xs mx-auto">
                        A private, professional environment for the modern chef. Sign in to access your signature methods and masterclasses.
                    </p>
                    <button
                        onClick={() => setAuthModalOpen(true)}
                        className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
                    >
                        <LogIn size={18} /> Sign In to Proceed
                    </button>
                    <p className="mt-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Expertise • Planning • Method
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

function App() {
    return (
        <ErrorBoundary>
        <BrowserRouter>
            <Routes>
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/*" element={
                    <GlobalAuthGuard>
                        <AppDataProvider>
                        <NavStateProvider>
                            <div className="md:pl-28 min-h-screen">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="recipes" element={<RecipeList />} />
                                    <Route path="recipe/:id" element={<RecipeView />} />
                                    <Route path="classes" element={<Classes />} />
                                    <Route path="planner" element={<Planner />} />
                                    <Route path="notifications" element={<Notifications />} />
                                    <Route path="pantry" element={<Pantry />} />
                                    <Route path="profile" element={<Profile />} />
                                    <Route path="sanctum" element={<Sanctum />} />
                                    <Route path="admin" element={
                                        <Suspense fallback={<div className="min-h-screen bg-[#070B14] flex items-center justify-center"><ChefHat size={32} className="text-white animate-pulse" /></div>}>
                                            <EmpireCommandCenter />
                                        </Suspense>
                                    } />
                                    <Route path="shop" element={<Shop />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </div>
                            <BottomNav />
                            <InstallPWA />
                            <OfflineSentry />
                        </NavStateProvider>
                        </AppDataProvider>
                    </GlobalAuthGuard>
                } />
            </Routes>
        </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
