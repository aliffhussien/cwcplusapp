import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useRecipes } from '../hooks/useRecipes';
import { useClasses } from '../hooks/useClasses';

const NavStateContext = createContext({
  cartCount: 0,
  unreadNotifsCount: 0,
  hasNewRecipes: false,
  isLiveOngoing: false,
  setCartCount: () => {}
});

export function NavStateProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [now, setNow] = useState(() => Date.now());
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
    const oneDayAgo = now - 86400000;
    return publicRecipes.some(r => new Date(r.created_at).getTime() > oneDayAgo);
  }, [publicRecipes, now]);

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

export const useNavState = () => useContext(NavStateContext);
