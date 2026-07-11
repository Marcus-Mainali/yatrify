import React, { useState, useEffect, useRef } from "react";
import { Home, Heart, Compass, MessageCircle, Settings, Loader2, WifiOff, Sun, Moon, User, Search } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import HomeScreen from "./components/HomeScreen";
import ExploreScreen from "./components/ExploreScreen";
import FavoritesScreen from "./components/FavoritesScreen";
import ChatScreen from "./components/ChatScreen";
import SettingsScreen from "./components/SettingsScreen";
import DetailsScreen from "./components/DetailsScreen";
import YatrifyLogo from "./components/YatrifyLogo";
import { Destination, Booking, UserPreferences } from "./types";
import { DESTINATIONS } from "./data";
import { translations } from "./translations";

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("yatrify_splash_shown");
  });

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Preload all destination images in the background in a staggered, prioritized queue
  useEffect(() => {
    const highPriority = [
      "/src/assets/images/kulekhani_lake_1782535367089.jpg",
      "/src/assets/images/badimalika_hills_1782535383514.jpg",
      "/src/assets/images/kuri_village_1782535399687.jpg",
      "/src/assets/images/ramaroshan_lake_1782535414672.jpg",
      "/src/assets/images/ghandruk_village_1782535430740.jpg",
      "https://images.unsplash.com/photo-1520111007886-f43fdbe022a4?auto=format&fit=crop&w=1200&q=80", // Chitwan
      ...DESTINATIONS.slice(0, 15).map(d => d.image)
    ].filter(Boolean);

    const lowPriority = DESTINATIONS.slice(15).map(d => d.image).filter(Boolean);

    const uniqueHigh = Array.from(new Set(highPriority));
    const uniqueLow = Array.from(new Set(lowPriority)).filter(url => !uniqueHigh.includes(url));

    // Preload high-priority images immediately
    uniqueHigh.forEach(url => {
      const img = new Image();
      img.src = url;
    });

    // Stagger low-priority images in small batches so they don't saturate network connections
    let index = 0;
    const batchSize = 6;
    const intervalMs = 250;

    const intervalId = setInterval(() => {
      if (index >= uniqueLow.length) {
        clearInterval(intervalId);
        return;
      }
      const end = Math.min(index + batchSize, uniqueLow.length);
      for (let i = index; i < end; i++) {
        const img = new Image();
        img.src = uniqueLow[i];
      }
      index = end;
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, []);

  // Internet connection status states
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("yatrify_splash_shown", "true");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Monitor internet connection on load and every 10 seconds
  useEffect(() => {
    // Initial check on mount
    const checkConnection = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (!online) {
        setShowOfflineAlert(true);
      }
    };

    checkConnection();

    // Event listeners for instant live feedback
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Polling connection check every 10 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleCheckConnection = () => {
    const online = navigator.onLine;
    setIsOnline(online);
    if (online) {
      setShowOfflineAlert(false);
    } else {
      // Provide visual indicator (shake or quick flash) if still offline
      const dialog = document.getElementById("offline-dialog");
      if (dialog) {
        dialog.classList.add("animate-shake");
        setTimeout(() => dialog.classList.remove("animate-shake"), 500);
      }
    }
  };

  // Localization State
  const [language, setLanguage] = useState<"en" | "ne">(() => {
    return (localStorage.getItem("language") as "en" | "ne") || "en";
  });

  const handleLanguageChange = (lang: "en" | "ne") => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Navigation State
  const [currentTab, setCurrentTab] = useState<"home" | "favorites" | "explore" | "chat">("home");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);

  // Flag to check if state changes are triggered by popstate (browser back/forward)
  const isPopStateRef = useRef(false);

  // Synchronize browser history with App navigation state
  useEffect(() => {
    // Check if there is an existing history state on mount, otherwise initialize it
    if (!window.history.state) {
      window.history.replaceState(
        { currentTab, selectedDestinationId, showSettings },
        ""
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        isPopStateRef.current = true;
        setCurrentTab(state.currentTab || "home");
        setSelectedDestinationId(state.selectedDestinationId || null);
        setShowSettings(!!state.showSettings);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Sync state changes to browser history
  useEffect(() => {
    if (isPopStateRef.current) {
      // Clear flag as the popped state was already applied
      isPopStateRef.current = false;
      return;
    }

    const currentHistoryState = window.history.state;
    const isSame =
      currentHistoryState &&
      currentHistoryState.currentTab === currentTab &&
      currentHistoryState.selectedDestinationId === selectedDestinationId &&
      currentHistoryState.showSettings === showSettings;

    if (!isSame) {
      window.history.pushState(
        { currentTab, selectedDestinationId, showSettings },
        ""
      );
    }
  }, [currentTab, selectedDestinationId, showSettings]);

  // Unified, history-aware back/dismiss logic
  const handleBackNavigation = () => {
    const state = window.history.state;
    // If we have history indicating we are in an overlay state, trigger browser back
    if (state && (state.selectedDestinationId || state.showSettings)) {
      window.history.back();
    } else {
      // Fallback if browser state is somehow not synchronized
      setSelectedDestinationId(null);
      setShowSettings(false);
    }
  };

  // Screen Refresh State
  const [refreshKeys, setRefreshKeys] = useState({
    home: 0,
    favorites: 0,
    explore: 0,
    chat: 0,
    details: 0,
    settings: 0,
  });

  const handleRefresh = async () => {
    // Re-fetch all data on pull down gesture refresh
    await Promise.all([
      fetchFavorites(),
      fetchBookings(),
      checkSupabaseStatus()
    ]).catch(err => console.error("Error updating on refresh gesture:", err));

    if (showSettings) {
      setRefreshKeys((prev) => ({ ...prev, settings: prev.settings + 1 }));
    } else if (selectedDestinationId) {
      setRefreshKeys((prev) => ({ ...prev, details: prev.details + 1 }));
    } else {
      setRefreshKeys((prev) => ({ ...prev, [currentTab]: prev[currentTab] + 1 }));
    }
  };

  // Global State
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Supabase Status State
  const [supabaseStatus, setSupabaseStatus] = useState({
    configured: false,
    connected: false,
    message: "Checking database status..."
  });

  // Fetching handlers from API
  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const checkSupabaseStatus = async () => {
    try {
      const res = await fetch("/api/supabase-status");
      if (res.ok) {
        const status = await res.json();
        setSupabaseStatus(status);
      }
    } catch (err) {
      console.error("Failed to check Supabase status:", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFavorites();
    fetchBookings();
    checkSupabaseStatus();
  }, []);

  // Sync dark mode class on local elements
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const handleToggleFavorite = async (id: string) => {
    const isNowFavorite = !favorites.includes(id);
    
    // Optimistic update
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId: id, isFavorite: isNowFavorite }),
      });
    } catch (err) {
      console.error("Failed to sync favorite update to Supabase:", err);
    }
  };

  const handleToggleVisited = (id: string) => {
    setVisited((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddBooking = async (newBooking: Booking) => {
    // Optimistic update
    setBookings((prev) => [newBooking, ...prev]);

    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });
    } catch (err) {
      console.error("Failed to sync new booking to Supabase:", err);
    }
  };

  const handleCancelBooking = async (id: string) => {
    // Optimistic update
    setBookings((prev) => prev.filter((b) => b.id !== id));

    try {
      await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    }
  };

  const handleSelectDestination = (id: string) => {
    setSelectedDestinationId(id);
  };

  const activeDestination = DESTINATIONS.find((d) => d.id === selectedDestinationId);

  // Render the current active tab
  const renderTabContent = () => {
    switch (currentTab) {
      case "home":
        return (
          <HomeScreen
            onSelectDestination={handleSelectDestination}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenSettings={() => setShowSettings(true)}
            onSwitchTab={(tab) => setCurrentTab(tab)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            language={language}
          />
        );
      case "favorites":
        return (
          <FavoritesScreen
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectDestination={handleSelectDestination}
            onSwitchTab={(tab) => setCurrentTab(tab)}
            visited={visited}
            onToggleVisited={handleToggleVisited}
          />
        );
      case "explore":
        return (
          <ExploreScreen
            onSelectDestination={handleSelectDestination}
            bookings={bookings}
          />
        );
      case "chat":
        return <ChatScreen />;
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden bg-white dark:bg-zinc-900 transition-colors ${darkMode ? "dark" : ""}`}>
      {/* Persistent Desktop Header */}
      <header className="hidden md:flex h-20 border-b border-neutral-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-40 px-6 select-none transition-colors duration-300 shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div 
              onClick={() => {
                setCurrentTab("home");
                setShowSettings(false);
                setSelectedDestinationId(null);
              }}
              className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
            >
              {/* Only show logo when not on the home screen */}
              {!(currentTab === "home" && !showSettings && !selectedDestinationId) && (
                <YatrifyLogo className="w-10 h-10 shadow-md shadow-rose-500/10" />
              )}
              <span className={`font-black text-2xl tracking-wider font-sans transition-colors ${
                currentTab === "home" && !showSettings && !selectedDestinationId
                  ? "text-rose-600 dark:text-rose-500"
                  : "text-zinc-900 dark:text-white"
              }`}>
                YATRIFY
              </span>
            </div>

            <nav className="flex items-center gap-1 bg-neutral-50 dark:bg-zinc-800/40 p-1.5 rounded-2xl border border-neutral-100/50 dark:border-zinc-800/50">
              {/* Tab 1: Home */}
              <button
                onClick={() => {
                  setCurrentTab("home");
                  setShowSettings(false);
                  setSelectedDestinationId(null);
                }}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentTab === "home" && !showSettings && !selectedDestinationId
                    ? "text-rose-600 dark:text-rose-400 bg-[#FFEBEA] dark:bg-rose-950/40 border border-rose-500/10 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Home className="w-4 h-4 stroke-[2.5]" />
                <span>{translations[language].home}</span>
              </button>

              {/* Tab 2: Favorites (Wishlist) */}
              <button
                onClick={() => {
                  setCurrentTab("favorites");
                  setShowSettings(false);
                  setSelectedDestinationId(null);
                }}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentTab === "favorites" && !showSettings && !selectedDestinationId
                    ? "text-rose-600 dark:text-rose-400 bg-[#FFEBEA] dark:bg-rose-950/40 border border-rose-500/10 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Heart className={`w-4 h-4 stroke-[2.5] ${currentTab === "favorites" && !showSettings && !selectedDestinationId ? "fill-rose-600 dark:fill-rose-400" : ""}`} />
                <span>{translations[language].wishlist}</span>
                {favorites.length > 0 && (currentTab !== "favorites" || showSettings || selectedDestinationId) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {/* Tab 3: Explore */}
              <button
                onClick={() => {
                  setCurrentTab("explore");
                  setShowSettings(false);
                  setSelectedDestinationId(null);
                }}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentTab === "explore" && !showSettings && !selectedDestinationId
                    ? "text-rose-600 dark:text-rose-400 bg-[#FFEBEA] dark:bg-rose-950/40 border border-rose-500/10 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Compass className="w-4 h-4 stroke-[2.5]" />
                <span>{translations[language].explore}</span>
              </button>

              {/* Tab 4: Chat */}
              <button
                onClick={() => {
                  setCurrentTab("chat");
                  setShowSettings(false);
                  setSelectedDestinationId(null);
                }}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentTab === "chat" && !showSettings && !selectedDestinationId
                    ? "text-rose-600 dark:text-rose-400 bg-[#FFEBEA] dark:bg-rose-950/40 border border-rose-500/10 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                <span>{translations[language].guide}</span>
              </button>
            </nav>

            <div className="flex items-center gap-4">
              {/* Global Search Input */}
              <div className="relative w-60">
                <input
                  type="text"
                  placeholder={translations[language].searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val && currentTab !== "home") {
                      setCurrentTab("home");
                    }
                  }}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 text-xs font-semibold border border-neutral-200/60 dark:border-zinc-800/60 focus:border-rose-400 dark:focus:border-rose-500 focus:outline-none focus:ring-0 transition-all shadow-sm"
                />
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500 stroke-[2.5]" />
              </div>

              {/* Language Switch Button */}
              <button
                onClick={() => handleLanguageChange(language === "en" ? "ne" : "en")}
                className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-zinc-800/60 text-[11px] font-black tracking-wide text-zinc-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors border border-neutral-100 dark:border-zinc-800 cursor-pointer"
              >
                {language === "en" ? "नेपाली" : "English"}
              </button>

              {/* Dark Mode Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-xl bg-neutral-50 dark:bg-zinc-800/60 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all border border-neutral-100 dark:border-zinc-800 cursor-pointer"
                title="Toggle Dark Mode"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-700 stroke-[2.5]" />
                )}
              </button>

              {/* Profile / Settings Button */}
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setSelectedDestinationId(null);
                }}
                className={`relative w-10 h-10 rounded-xl overflow-hidden border transition-all flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm cursor-pointer ${
                  showSettings 
                    ? "border-rose-500 ring-2 ring-rose-500/20" 
                    : "border-neutral-200 dark:border-zinc-800 hover:scale-105"
                }`}
              >
                {localStorage.getItem("userProfileImage") ? (
                  <img src={localStorage.getItem("userProfileImage")!} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 stroke-[2]" />
                )}
              </button>
            </div>
          </div>
        </header>

      {/* Main Content Area (displays active screen tab) */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-zinc-900 transition-colors">
          
          {/* Splash Screen Overlay */}
          <AnimatePresence>
            {showSplash && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col items-center justify-between py-24 z-[200] transition-colors"
              >
                {/* Spacer to push things down slightly */}
                <div />

                {/* Logo and App Title */}
                <div className="flex flex-col items-center select-none">
                  <motion.h1
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.5, type: "spring" }}
                    className="text-4xl md:text-5xl font-black tracking-[0.25em] text-rose-600 dark:text-rose-500 font-sans"
                  >
                    YATRIFY
                  </motion.h1>
                </div>

                {/* Elegant Minimal Spinner */}
                <div className="flex flex-col items-center">
                  <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!showSettings && !selectedDestinationId && (
              <motion.div
                key={`${currentTab}-${refreshKeys[currentTab]}`}
                initial={isDesktop ? { opacity: 0 } : { opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={isDesktop ? { opacity: 0 } : { opacity: 0, x: -15 }}
                transition={isDesktop ? { duration: 0.18, ease: "linear" } : { duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {renderTabContent()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Details Screen Sliding Overlay */}
          <AnimatePresence>
            {selectedDestinationId && activeDestination && (
              <React.Fragment key={`details-wrapper-${selectedDestinationId}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={handleBackNavigation}
                  className="hidden md:block absolute inset-0 bg-black/45 z-40 backdrop-blur-sm cursor-pointer"
                />
                <motion.div
                  key={`details-${selectedDestinationId}-${refreshKeys.details}`}
                  initial={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : { x: "100%" }}
                  animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { x: 0 }}
                  exit={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : { x: "100%" }}
                  transition={isDesktop ? { duration: 0.3, ease: [0.16, 1, 0.3, 1] } : { type: "spring", damping: 28, stiffness: 240 }}
                  className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col"
                >
                  <DetailsScreen
                    destination={activeDestination}
                    onBack={handleBackNavigation}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onAddBooking={handleAddBooking}
                    language={language}
                  />
                </motion.div>
              </React.Fragment>
            )}
          </AnimatePresence>

          {/* Settings Screen Sliding Overlay */}
          <AnimatePresence>
            {showSettings && (
              <React.Fragment key="settings-wrapper">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleBackNavigation}
                  className="fixed inset-0 bg-black/45 dark:bg-black/65 z-[100] backdrop-blur-md cursor-pointer"
                />
                <motion.div
                  key={`settings-${refreshKeys.settings}`}
                  initial={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : { opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={isDesktop ? { opacity: 0, scale: 0.98, y: 8 } : { opacity: 0, scale: 0.96, y: 16 }}
                  transition={isDesktop ? { duration: 0.3, ease: [0.16, 1, 0.3, 1] } : { type: "spring", damping: 26, stiffness: 220 }}
                  className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] bg-white dark:bg-zinc-900 flex flex-col w-full h-full md:max-w-xl md:h-[82vh] md:max-h-[700px] md:rounded-[36px] md:shadow-2xl md:border md:border-neutral-100 dark:md:border-zinc-800/80 overflow-hidden"
                >
                  <SettingsScreen
                    darkMode={darkMode}
                    onToggleDarkMode={() => setDarkMode(!darkMode)}
                    bookings={bookings}
                    supabaseStatus={supabaseStatus}
                    onCancelBooking={handleCancelBooking}
                    onBackToHome={handleBackNavigation}
                    language={language}
                    onChangeLanguage={handleLanguageChange}
                  />
                </motion.div>
              </React.Fragment>
            )}
          </AnimatePresence>
        </div>

        {/* Replicated Bottom Mobile Navigation Tab Bar */}
        {!selectedDestinationId && !showSettings && (
          <nav className="h-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-l border-r border-neutral-100/80 dark:border-zinc-800/80 rounded-t-3xl shadow-[0_-12px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_-12px_32px_rgba(0,0,0,0.45)] px-6 flex md:hidden items-center justify-between shrink-0 z-40 relative mt-[-16px] transition-all duration-300 transform-gpu">
            <LayoutGroup id="bottomNav">
              
              {/* Tab 1: Home */}
              <motion.button
                layout="position"
                transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                onClick={() => setCurrentTab("home")}
                className={`relative flex items-center gap-2 rounded-2xl focus:outline-none transform-gpu will-change-transform ${
                  currentTab === "home" ? "px-4 py-2.5" : "p-3"
                }`}
              >
                {currentTab === "home" && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#FFEBEA] dark:bg-rose-950/40 rounded-2xl -z-10 border border-rose-500/10 transform-gpu will-change-transform"
                    transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                  />
                )}
                <Home className={`stroke-[2.5] transition-colors duration-200 ${
                  currentTab === "home"
                    ? "w-4 h-4 text-rose-600 dark:text-rose-400"
                    : "w-5 h-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`} />
                {currentTab === "home" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="font-black text-[11px] tracking-tight text-rose-600 dark:text-rose-400 select-none whitespace-nowrap"
                  >
                    {translations[language].home}
                  </motion.span>
                )}
              </motion.button>
   
              {/* Tab 2: Favorites (Wishlist) */}
              <motion.button
                layout="position"
                transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                onClick={() => setCurrentTab("favorites")}
                className={`relative flex items-center gap-2 rounded-2xl focus:outline-none transform-gpu will-change-transform ${
                  currentTab === "favorites" ? "px-4 py-2.5" : "p-3"
                }`}
              >
                {currentTab === "favorites" && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#FFEBEA] dark:bg-rose-950/40 rounded-2xl -z-10 border border-rose-500/10 transform-gpu will-change-transform"
                    transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                  />
                )}
                <Heart className={`stroke-[2.5] transition-colors duration-200 ${
                  currentTab === "favorites"
                    ? "w-4 h-4 text-rose-600 dark:text-rose-400 fill-rose-600"
                    : "w-5 h-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`} />
                {favorites.length > 0 && currentTab !== "favorites" && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
                {currentTab === "favorites" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="font-black text-[11px] tracking-tight text-rose-600 dark:text-rose-400 select-none whitespace-nowrap"
                  >
                    {translations[language].wishlist}
                  </motion.span>
                )}
              </motion.button>
   
              {/* Tab 3: Explore */}
              <motion.button
                layout="position"
                transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                onClick={() => setCurrentTab("explore")}
                className={`relative flex items-center gap-2 rounded-2xl focus:outline-none transform-gpu will-change-transform ${
                  currentTab === "explore" ? "px-4 py-2.5" : "p-3"
                }`}
              >
                {currentTab === "explore" && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#FFEBEA] dark:bg-rose-950/40 rounded-2xl -z-10 border border-rose-500/10 transform-gpu will-change-transform"
                    transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                  />
                )}
                <Compass className={`stroke-[2.5] transition-colors duration-200 ${
                  currentTab === "explore"
                    ? "w-4 h-4 text-rose-600 dark:text-rose-400"
                    : "w-5 h-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`} />
                {currentTab === "explore" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="font-black text-[11px] tracking-tight text-rose-600 dark:text-rose-400 select-none whitespace-nowrap"
                  >
                    {translations[language].explore}
                  </motion.span>
                )}
              </motion.button>
   
              {/* Tab 4: Chat */}
              <motion.button
                layout="position"
                transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                onClick={() => setCurrentTab("chat")}
                className={`relative flex items-center gap-2 rounded-2xl focus:outline-none transform-gpu will-change-transform ${
                  currentTab === "chat" ? "px-4 py-2.5" : "p-3"
                }`}
              >
                {currentTab === "chat" && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#FFEBEA] dark:bg-rose-950/40 rounded-2xl -z-10 border border-rose-500/10 transform-gpu will-change-transform"
                    transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                  />
                )}
                <MessageCircle className={`stroke-[2.5] transition-colors duration-200 ${
                  currentTab === "chat"
                    ? "w-4 h-4 text-rose-600 dark:text-rose-400"
                    : "w-5 h-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`} />
                {currentTab !== "chat" && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
                {currentTab === "chat" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="font-black text-[11px] tracking-tight text-rose-600 dark:text-rose-400 select-none whitespace-nowrap"
                  >
                    {translations[language].guide}
                  </motion.span>
                )}
              </motion.button>
   
            </LayoutGroup>
          </nav>
        )}

      {/* Offline Connectivity Dialog Popup */}
      <AnimatePresence>
        {showOfflineAlert && (
          <div className="fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              id="offline-dialog"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <WifiOff className="w-8 h-8 text-rose-500" />
              </div>
              
              <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                {translations[language].noInternetTitle}
              </h3>
              
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                {translations[language].noInternetDesc}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleCheckConnection}
                  className="w-full py-3 px-5 bg-rose-500 text-white font-bold rounded-2xl active:scale-95 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 text-sm flex items-center justify-center gap-2"
                >
                  {translations[language].retryBtn}
                </button>
                
                <button
                  onClick={() => setShowOfflineAlert(false)}
                  className="w-full py-2.5 px-5 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl active:scale-95 transition-all text-sm"
                >
                  {translations[language].close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
