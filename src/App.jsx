import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChefHat, LogIn } from 'lucide-react';
import { useUser } from './hooks/useUser';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import RecipeList from './components/RecipeList';
import RecipeView from './pages/RecipeView';
import RecipePrint from './components/RecipePrint';
import Notifications from './components/Notifications';
import Profile from './pages/Profile';
import Planner from './components/Planner';
import Classes from './components/Classes';
import Sanctum from './components/Sanctum';
import Shop from './components/Shop';
import Pantry from './components/Pantry';
import AuthCallback from './components/AuthCallback';
import BottomNav from './components/BottomNav';
import { NavStateProvider } from './context/NavStateContext';
import InstallPWA from './components/InstallPWA';
import { OfflineSentry } from './components/PerformanceUI';
import { AppDataProvider } from './context/AppDataProvider';
import ErrorBoundary from './components/ErrorBoundary';

const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });

const CWCPlusCommandCenter = lazyWithRetry(() => import('./pages/Admin'));

const AdminGuard = ({ children }) => {
    const { isGod, loading } = useUser();
    if (loading) return <div className="min-h-screen bg-base flex items-center justify-center"><ChefHat size={32} className="text-accent animate-pulse" /></div>;
    if (!isGod) return <Navigate to="/" replace />;
    return children;
};

const GlobalAuthGuard = ({ children }) => {
    const { loading } = useUser();

    if (loading) return (
        <div className="min-h-screen bg-base flex items-center justify-center">
            <ChefHat size={32} className="text-accent animate-pulse" />
        </div>
    );

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
                                    <Route path="recipe/:id/print" element={<RecipePrint />} />
                                    <Route path="classes" element={<Classes />} />
                                    <Route path="planner" element={<Planner />} />
                                    <Route path="notifications" element={<Notifications />} />
                                    <Route path="pantry" element={<Pantry />} />
                                    <Route path="profile" element={<Profile />} />
                                    <Route path="sanctum" element={<Sanctum />} />
                                    <Route path="admin" element={
                                        <Suspense fallback={<div className="min-h-screen bg-base flex items-center justify-center"><ChefHat size={32} className="text-accent animate-pulse" /></div>}>
                                            <AdminGuard>
                                                <CWCPlusCommandCenter />
                                            </AdminGuard>
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
