import { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Home, ChefHat, MonitorPlay, ShoppingBag, User } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';
import { APP_COPY } from '../config/appCopy';

// -----------------------------------------------------------------------------
// GLOBAL STATE MOCK (Simulating Redux/Zustand/Context for smart badges)
// -----------------------------------------------------------------------------
const NavStateContext = createContext({
  cartCount: 0,
  unreadNotifsCount: 0,
  hasNewRecipes: false,
  setCartCount: () => {}
});

export function NavStateProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [now, setNow] = useState(Date.now());
  const { notifications } = useNotifications();
  const { publicRecipes } = useRecipes();
  const { publicClasses } = useClasses();

  // Real-time clock — drives live dot in/out at the exact moment, no refresh needed
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifsCount = useMemo(() =>
    notifications.filter(n => !n.read_status).length,
  [notifications]);

  const hasNewRecipes = useMemo(() => {
    const oneDayAgo = Date.now() - 86400000;
    return publicRecipes.some(r => new Date(r.created_at).getTime() > oneDayAgo);
  }, [publicRecipes]);

  // Checks live_date + live_duration_hours so the dot appears and disappears at the exact ms
  const isLiveOngoing = useMemo(() => {
    return publicClasses.some(c => {
      if (!c.live_date || c.status !== 'published') return false;
      const start = new Date(c.live_date).getTime();
      const durationMs = (c.live_duration_hours || 2) * 3600000;
      return now >= start && now <= start + durationMs;
    });
  }, [publicClasses, now]);

  return (
    <NavStateContext.Provider value={{ cartCount, setCartCount, unreadNotifsCount, hasNewRecipes, isLiveOngoing }}>
      {children}
    </NavStateContext.Provider>
  );
}

const useNavState = () => useContext(NavStateContext);

// -----------------------------------------------------------------------------
// CONFIGURATION & PHYSICS
// -----------------------------------------------------------------------------
const springPhysics = {
  type: 'spring',
  stiffness: 450,
  damping: 30,
  mass: 1,
};

// Base config. Dynamic state (like badges) will be injected during render.
const NAV_CONFIG = [
  { path: '/', icon: Home, label: APP_COPY.navigation.home, shortcut: '1', badgeKey: 'notifications' },
  { path: '/recipes', icon: ChefHat, label: APP_COPY.navigation.library, shortcut: '2', badgeKey: 'library' },
  { path: '/classes', icon: MonitorPlay, label: APP_COPY.navigation.classes, shortcut: '3', badgeKey: 'classes' },
  { path: '/shop', icon: ShoppingBag, label: APP_COPY.navigation.shop, shortcut: '4', badgeKey: 'cart' },
  { path: '/profile', icon: User, label: APP_COPY.navigation.profile, shortcut: '5' },
];

const shouldHideNavigation = (pathname, search, isSearchOpen) => {
  const isClassTheater = pathname === '/classes' && new URLSearchParams(search).has('id');
  const hiddenPaths = ['/notifications', '/admin'];
  const isHiddenPrefix = pathname.startsWith('/recipe/') || pathname.startsWith('/admin');
  return isClassTheater || isSearchOpen || isHiddenPrefix || hiddenPaths.includes(pathname);
};

// -----------------------------------------------------------------------------
// REFACTORED SMART BOTTOM NAV COMPONENT
// -----------------------------------------------------------------------------
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();
  
  const navState = useNavState();
  const { cartCount, unreadNotifsCount, hasNewRecipes, isLiveOngoing } = navState || { 
    cartCount: 0, 
    unreadNotifsCount: 0, 
    hasNewRecipes: false,
    isLiveOngoing: false
  };

  const [isHiddenByScroll, setIsHiddenByScroll] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);



  // 1. Scroll visibility logic (Performance optimized)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 80 && !isHiddenByScroll) setIsHiddenByScroll(true);
    else if ((latest <= previous || latest <= 80) && isHiddenByScroll) setIsHiddenByScroll(false);
  });

  // 2. Sync with external DOM events (Search overlay)
  useEffect(() => {
    const checkSearch = () => setIsSearchOpen(document.body.classList.contains('search-open'));
    checkSearch();
    const observer = new MutationObserver(checkSearch);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // 3. Smart Keyboard Shortcuts (Power user feature)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Allow Alt + [1-5] to navigate
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

  // 4. Haptic & Navigation Handler
  const triggerNav = (path) => {
    if (navigator.vibrate) navigator.vibrate(40); // Subtle haptic feedback on Android
    navigate(path);
  };

  // 5. Smart Route Resolution (Handles nested routes like /recipes/pasta)
  const resolveIsActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isRouteHidden = shouldHideNavigation(location.pathname, location.search, isSearchOpen);
  if (isRouteHidden) return null;

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
            className="pointer-events-auto flex p-2 bg-[#0A0F1C]/70 backdrop-blur-3xl 
                       rounded-[32px] md:rounded-[40px]
                       ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),_inset_0_1px_1px_rgba(255,255,255,0.1)]
                       flex-row items-center justify-between w-full
                       md:flex-col md:space-y-3 md:w-auto md:px-2.5 md:py-6"
          >
            {NAV_CONFIG.map((item) => {
              const isActive = resolveIsActive(item.path);
              const Icon = item.icon;

              // Smart Badge Resolution
              let badgeContent = null;
              if (item.badgeKey === 'cart' && cartCount > 0) badgeContent = cartCount;
              if (item.badgeKey === 'notifications' && unreadNotifsCount > 0) badgeContent = unreadNotifsCount;
              // Library/Recipe dot removed as per user request

              return (
                <motion.button
                  key={item.path}
                  onClick={() => triggerNav(item.path)}
                  aria-label={`${item.label} ${badgeContent ? '(Unread updates)' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  whileTap={{ scale: 0.85 }}
                  className="relative group flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-full outline-none tap-highlight-transparent transition-all"
                >
                  {/* Hover background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeDockIndicator"
                      className="absolute inset-0 bg-indigo-600 rounded-full z-0 ring-1 ring-white/20 shadow-lg shadow-indigo-600/20"
                      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                    />
                  )}

                  {/* Icon & Smart Badges */}
                  <motion.div
                    animate={{
                      y: isActive ? -2 : 0,
                      scale: isActive ? 1.05 : 1,
                      color: isActive ? "#FFFFFF" : "#94a3b8"
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-colors duration-300" />

                    {/* Live Indicator Dot - Only for classes when live is ongoing */}
                    {item.badgeKey === 'classes' && isLiveOngoing && !isActive && (
                      <span className="absolute top-0 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0A0F1C] animate-pulse" />
                    )}

                    {/* Dynamic State Badges */}
                    <AnimatePresence>
                      {badgeContent !== null && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className={`absolute -top-1.5 -right-1.5 flex items-center justify-center font-bold text-white shadow-xl border-2 border-[#0A0F1C] z-[20] 
                                      ${typeof badgeContent === 'number' ? 'bg-indigo-500 h-4.5 min-w-[18px] px-1 text-[10px] rounded-full' : 'bg-rose-500 h-3 w-3 rounded-full'}`}
                        >
                          {typeof badgeContent === 'number' && badgeContent}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Enhanced Tooltip with Shortcut Info */}
                  <div className="absolute left-full ml-5 px-3 py-1.5 bg-white text-slate-900 text-[11px] font-bold tracking-wider rounded-lg 
                                  opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 
                                  transition-all duration-300 pointer-events-none hidden md:flex items-center gap-2 whitespace-nowrap shadow-xl z-50">
                    <span className="uppercase">{item.label}</span>
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px]">Alt+{item.shortcut}</span>
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45 rounded-sm" />
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

// -----------------------------------------------------------------------------
// DEMO WRAPPER (To showcase state mutations & nested routing)
// -----------------------------------------------------------------------------