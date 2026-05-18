import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Home, ChefHat, MonitorPlay, ShoppingBag, User } from 'lucide-react';
import { APP_COPY } from '../config/appCopy';
import { useNavState } from '../context/NavStateContext';

const springPhysics = { type: 'spring' as const, stiffness: 450, damping: 30, mass: 1 };

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
  const { scrollY } = useScroll();
  
  const navState = useNavState();
  const { cartCount, unreadNotifsCount, isLiveOngoing } = navState || { 
    cartCount: 0, unreadNotifsCount: 0, isLiveOngoing: false
  };

  const [isHiddenByScroll, setIsHiddenByScroll] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const triggerNav = (path: string) => {
    if (navigator.vibrate) navigator.vibrate(40);
    navigate(path);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 80 && !isHiddenByScroll) setIsHiddenByScroll(true);
    else if ((latest <= previous || latest <= 80) && isHiddenByScroll) setIsHiddenByScroll(false);
  });

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
    <div className="fixed z-[60] pointer-events-none 
                    w-full max-w-[500px] px-6 bottom-8 left-1/2 -translate-x-1/2 translate-y-0
                    md:w-auto md:max-w-none md:px-0 md:bottom-auto md:top-1/2 md:left-8 md:-translate-x-0 md:-translate-y-1/2 flex justify-center">
      <AnimatePresence>
        {!isHiddenByScroll && (
          <motion.nav
            aria-label="Main Navigation"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={springPhysics}
            className="pointer-events-auto flex p-2 bg-base/80 backdrop-blur-3xl 
                       rounded-[32px] md:rounded-[40px]
                       ring-1 ring-border shadow-lg
                       flex-row items-center justify-between w-full
                       md:flex-col md:space-y-3 md:w-auto md:px-2.5 md:py-6"
          >
            {NAV_CONFIG.map((item) => {
              const isActive = resolveIsActive(item.path);
              const Icon = item.icon;

              let badgeContent: number | null = null;
              if (item.badgeKey === 'cart' && cartCount > 0) badgeContent = cartCount;
              if (item.badgeKey === 'notifications' && unreadNotifsCount > 0) badgeContent = unreadNotifsCount;

              return (
                <motion.button
                  key={item.path}
                  onClick={() => triggerNav(item.path)}
                  aria-label={`${item.label} ${badgeContent ? '(Unread updates)' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  whileTap={{ scale: 0.85 }}
                  className="relative group flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-full outline-none tap-highlight-transparent transition-all"
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-glass-bg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeDockIndicator"
                      className="absolute inset-0 bg-accent rounded-full z-0 ring-1 ring-glass-border shadow-lg shadow-accent/20"
                      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                    />
                  )}
                  <motion.div
                    animate={{
                      y: isActive ? -2 : 0,
                      scale: isActive ? 1.05 : 1,
                      color: isActive ? "var(--color-base)" : "var(--color-text-3)"
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-colors duration-300" />
                    {item.badgeKey === 'classes' && isLiveOngoing && !isActive && (
                      <span className="absolute top-0 -right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-elevated animate-pulse" />
                    )}
                    <AnimatePresence>
                      {badgeContent !== null && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className={`absolute -top-1.5 -right-1.5 flex items-center justify-center font-bold text-text-1 shadow-xl border-2 border-base z-[20] 
                                      ${badgeContent > 0 ? 'bg-accent h-4.5 min-w-[18px] px-1 text-[10px] rounded-full' : 'bg-danger h-3 w-3 rounded-full'}`}
                        >
                          {badgeContent}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <div className="absolute left-full ml-5 px-3 py-1.5 bg-surface text-text-1 text-[11px] font-bold tracking-wider rounded-lg 
                                  opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 
                                  transition-all duration-300 pointer-events-none hidden md:flex items-center gap-2 whitespace-nowrap shadow-xl z-50">
                    <span className="uppercase">{item.label}</span>
                    <span className="bg-elevated text-text-3 px-1.5 py-0.5 rounded text-[9px]">Alt+{item.shortcut}</span>
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-surface rotate-45 rounded-sm" />
                  </div>
                </motion.button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
