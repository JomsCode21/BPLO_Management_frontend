// Libraries
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
// Stores
import { useAuthStore } from "@/stores/auth/auth.store";
import { useTokenStore } from "@/stores/token/token.store";
// Components
import SplashScreen from "@/components/general/SplashScreen";

const MIN_SPLASH_MS = 6500;
const SPLASH_EXIT_MS = 950;

export default function AppLayout() {
  const init = useTokenStore((s) => s.init);
  const setClearToken = useTokenStore((s) => s.setClearToken);
  const hydrateCurrentUser = useAuthStore((s) => s.hydrateCurrentUser);
  const setUser = useAuthStore((s) => s.setUser);
  const location = useLocation();
  const shellClass = location.pathname.startsWith("/home")
    ? "bg-[#0F2942] md:bg-linear-to-br md:from-slate-900 md:via-slate-800 md:to-slate-900"
    : "bg-white";

  // 1. Instant check for session storage
  const isFirstVisit = useMemo(() => {
    return !sessionStorage.getItem("splash_shown");
  }, []);

  // 2. State management
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(isFirstVisit);
  const [isSplashExiting, setIsSplashExiting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const initialize = async () => {
      const start = Date.now();
      
      // 3. FORCE THE TOKEN CHECK FIRST
      // This populates the store so the Landing Page redirect works instantly
      const hasSession = await init();
      if (hasSession) {
        const user = await hydrateCurrentUser();
        if (!user) {
          setUser(null);
          setClearToken();
        }
      } else {
        setUser(null);
      }

      if (isFirstVisit) {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
        if (remaining > 0) await sleep(remaining);

        if (cancelled) return;

        setIsReady(true);
        setIsSplashExiting(true);
        await sleep(SPLASH_EXIT_MS);
        sessionStorage.setItem("splash_shown", "true");
      } else {
        setIsReady(true);
      }

      if (cancelled) return;

      // 4. ONLY AFTER INIT/EXIT IS DONE:
      setShowSplash(false);
    };

    initialize();
    return () => {
      cancelled = true;
    };
  }, [hydrateCurrentUser, init, isFirstVisit, setClearToken, setUser]);

  if (showSplash) {
    return (
      <>
        {isReady ? (
          <Outlet />
        ) : (
          <div className={`fixed inset-0 z-40 ${shellClass}`} />
        )}
        <div className="fixed inset-0 z-50">
          <SplashScreen isExiting={isSplashExiting} />
        </div>
      </>
    );
  }

  if (!isReady) {
    // Keep the app shell mounted during token bootstrap so refreshes do not flash white.
    return <div className={`fixed inset-0 z-40 ${shellClass}`} />;
  }

  return <Outlet />;
}
