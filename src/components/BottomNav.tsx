import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ChefHat, MonitorPlay, ShoppingBag, User } from 'lucide-react';
import { APP_COPY } from '../config/appCopy';
import { useNavState } from '../context/NavStateContext';

const NAV_CONFIG = [
  { path: '/', icon: Home, label: APP_COPY.navigation.home, shortcut: '1', badgeKey: 'notifications' },
  { path: '/recipes', icon: ChefHat, label: APP_COPY.navigation.library, shortcut: '2', badgeKey: 'library' },
  { path: '/classes', icon: MonitorPlay, label: APP_COPY.navigation.classes, shortcut: '3', badgeKey: 'classes' },
  { path: '/shop', icon: ShoppingBag, label: APP_COPY.navigation.shop, shortcut: '4', badgeKey: 'cart' },
  { path: '/profile', icon: User, label: APP_COPY.navigation.profile, shortcut: '5' },
];

const shouldHideNavigation = (pathname: string, search: string, isSearchOpen: boolean) => {
  const isClassTheater = pathname === '/classes' && new URLSearchParams(search).has('id');
  const hiddenPaths = ['/notifications', '/admin'];
  const isHiddenPrefix = pathname.startsWith('/recipe/') || pathname.startsWith('/admin');
  return isClassTheater || isSearchOpen || isHiddenPrefix || hiddenPaths.includes(pathname);
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navState = useNavState();
  const { cartCount, unreadNotifsCount, isLiveOngoing } = navState || { 
    cartCount: 0, unreadNotifsCount: 0, isLiveOngoing: false
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const triggerNav = (path: string) => {
    if (navigator.vibrate) navigator.vibrate(40);
    navigate(path);
  };

  useEffect(() => {
    const checkSearch = () => setIsSearchOpen(document.body.classList.contains('search-open'));
    checkSearch();
    const observer = new MutationObserver(checkSearch);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const item = NAV_CONFIG.find(nav => nav.shortcut === e.key);
        if (item) {
          e.preventDefault();
          triggerNav(item.path);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resolveIsActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (shouldHideNavigation(location.pathname, location.search, isSearchOpen)) return null;

  return (
    <nav className="fixed z-[60] bottom-0 left-0 w-full bg-base/95 backdrop-blur-md border-t border-border/30 
                    md:top-0 md:bottom-auto md:w-20 md:h-screen md:border-t-0 md:border-r md:flex md:flex-col md:justify-center">
      <div className="flex flex-row justify-around items-center h-[72px] px-2 pb-[env(safe-area-inset-bottom)]
                      md:flex-col md:h-auto md:space-y-8 md:px-0 md:pb-0">
        {NAV_CONFIG.map((item) => {
          const isActive = resolveIsActive(item.path);
          const Icon = item.icon;

          let badgeContent: number | null = null;
          if (item.badgeKey === 'cart' && cartCount > 0) badgeContent = cartCount;
          if (item.badgeKey === 'notifications' && unreadNotifsCount > 0) badgeContent = unreadNotifsCount;

          return (
            <button
              key={item.path}
              onClick={() => triggerNav(item.path)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors duration-200 outline-none
                         ${isActive ? 'text-accent' : 'text-text-3 hover:text-text-1'} 
                         md:w-12 md:h-12 md:hover:bg-surface`}
            >
              <div className="relative flex flex-col items-center gap-1">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-0 md:opacity-0'} transition-opacity`}>
                  {item.label}
                </span>
                
                {/* Badges */}
                {item.badgeKey === 'classes' && isLiveOngoing && !isActive && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-danger rounded-full animate-pulse" />
                )}
                <AnimatePresence>
                  {badgeContent !== null && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-3 min-w-[16px] h-[16px] flex items-center justify-center bg-danger text-white text-[9px] font-bold rounded-full px-1"
                    >
                      {badgeContent}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Minimalist dot indicator for active state (desktop mainly, or small dot on mobile) */}
              {isActive && (
                <motion.div 
                  layoutId="minimalActiveDot"
                  className="absolute top-1/2 -translate-y-1/2 -left-3 w-1.5 h-1.5 bg-accent rounded-full hidden md:block" 
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
