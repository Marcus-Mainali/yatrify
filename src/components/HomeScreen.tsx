import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Menu, User, Heart, Star, Compass, MapPin, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Destination } from "../types";
import { DESTINATIONS, getLocalFallbackImage } from "../data";
import YatrifyLogo from "./YatrifyLogo";
import { translations } from "../translations";

interface HomeScreenProps {
  onSelectDestination: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenSettings: () => void;
  onSwitchTab: (tab: "home" | "favorites" | "explore" | "chat") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: "en" | "ne";
}

export default function HomeScreen({
  onSelectDestination,
  favorites,
  onToggleFavorite,
  onOpenSettings,
  onSwitchTab,
  searchQuery,
  setSearchQuery,
  language,
}: HomeScreenProps) {
  // Carousel slide index
  const [activeSlide, setActiveSlide] = useState(0);
  // Selected category filter
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | "Trekking" | "Hiking" | "Camping" | "Mountaineering" | "Rafting" | "Safari" | "Heritage sites" | "Museum"
  >("All");
  // Quick-info side menu drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Device mode detection for layout
  const [isTablet, setIsTablet] = useState(() => {
    return localStorage.getItem("yatrify_device_mode") === "tablet";
  });

  useEffect(() => {
    const handleDeviceChange = (e: any) => {
      setIsTablet(e.detail === "tablet");
    };
    window.addEventListener("yatrify_device_mode_change", handleDeviceChange);
    return () => {
      window.removeEventListener("yatrify_device_mode_change", handleDeviceChange);
    };
  }, []);

  // Featured carousel destinations - randomly selected on mount
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // User Onboarding & Profile image states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardName, setOnboardName] = useState("");
  const [onboardEmail, setOnboardEmail] = useState("");
  const [onboardLocation, setOnboardLocation] = useState("Kathmandu, Nepal");

  useEffect(() => {
    // Select 3 random places from DESTINATIONS
    const shuffled = [...DESTINATIONS].sort(() => 0.5 - Math.random());
    setFeaturedDestinations(shuffled.slice(0, 3));

    // Load custom profile image if present
    const savedImg = localStorage.getItem("userProfileImage");
    if (savedImg) {
      setProfileImage(savedImg);
    }
  }, []);

  const handleProfileClick = () => {
    const hasSignedUp = localStorage.getItem("hasSignedUp");
    if (!hasSignedUp) {
      setShowOnboarding(true);
    } else {
      onOpenSettings();
    }
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userName", onboardName.trim());
    localStorage.setItem("userEmail", onboardEmail.trim());
    localStorage.setItem("userLocation", onboardLocation.trim());
    localStorage.setItem("hasSignedUp", "true");
    setShowOnboarding(false);
    onOpenSettings();
  };

  const handleOnboardSkip = () => {
    localStorage.setItem("userName", "");
    localStorage.setItem("userEmail", "");
    localStorage.setItem("userLocation", "");
    localStorage.setItem("hasSignedUp", "true");
    setShowOnboarding(false);
    onOpenSettings();
  };

  // 5 Popular Places that change daily based on date seeding
  const popularPlaces = useMemo(() => {
    if (!DESTINATIONS || DESTINATIONS.length === 0) return [];
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) {
      seed = (seed << 5) - seed + dateStr.charCodeAt(i);
      seed |= 0;
    }

    const seededRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const destinationsCopy = [...DESTINATIONS];
    for (let i = destinationsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [destinationsCopy[i], destinationsCopy[j]] = [destinationsCopy[j], destinationsCopy[i]];
    }

    return destinationsCopy.slice(0, 5);
  }, []);

  // References for automatic horizontal scroll
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number;
    
    const timer = setTimeout(() => {
      const container = categoryContainerRef.current;
      if (!container || hasInteractedRef.current || selectedCategory !== "All") return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      const duration = 6000; // 6 seconds for beautiful full slow scroll
      let startTime: number | null = null;

      // Cubic ease-in-out easing function
      const easeInOutCubic = (x: number): number => {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      };

      const animate = (timestamp: number) => {
        if (hasInteractedRef.current || selectedCategory !== "All" || !categoryContainerRef.current) {
          return;
        }

        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easedProgress = easeInOutCubic(progress);
        categoryContainerRef.current.scrollLeft = easedProgress * maxScroll;

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedCategory]);

  const subcategoryMap: Record<string, string> = {
    "Trekking": "Trekking",
    "Hiking": "Hiking",
    "Camping": "Camping",
    "Mountaineering": "Mountaineering/Climbing",
    "Rafting": "Rafting/Kayaking",
    "Safari": "Wildlife/Safari",
    "Heritage sites": "Heritage sites",
    "Museum": "Museum visits"
  };

  const CATEGORIES_LIST = [
    { id: "Trekking", label: "Trekking", icon: "🧗" },
    { id: "Hiking", label: "Hiking", icon: "🥾" },
    { id: "Camping", label: "Camping", icon: "⛺" },
    { id: "Mountaineering", label: "Mountaineering", icon: "🏔️" },
    { id: "Rafting", label: "Rafting", icon: "🚣" },
    { id: "Safari", label: "Safari", icon: "🦁" },
    { id: "Heritage sites", label: "Heritage sites", icon: "🛕" },
    { id: "Museum", label: "Museum", icon: "🏛️" }
  ] as const;

  const categoryTranslations: Record<string, Record<string, string>> = {
    en: {
      "Trekking": "Trekking",
      "Hiking": "Hiking",
      "Camping": "Camping",
      "Mountaineering": "Mountaineering",
      "Rafting": "Rafting",
      "Safari": "Safari",
      "Heritage sites": "Heritage Sites",
      "Museum": "Museum"
    },
    ne: {
      "Trekking": "ट्रेकिङ",
      "Hiking": "हाइकिङ",
      "Camping": "क्याम्पिङ",
      "Mountaineering": "पर्वतारोहण",
      "Rafting": "र्याफ्टिङ",
      "Safari": "सफारी",
      "Heritage sites": "सम्पदा स्थल",
      "Museum": "संग्रहालय"
    }
  };

  // Filter destinations based on category and search query
  const filteredGridDestinations = DESTINATIONS.filter((dest) => {
    // 1. Category Match
    let isCategoryMatch = true;
    if (selectedCategory !== "All") {
      const targetSub = subcategoryMap[selectedCategory] || selectedCategory;
      isCategoryMatch = dest.subcategory === targetSub;
    }

    // 2. Search Match
    const isSearchMatch = searchQuery
      ? (dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         dest.location.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    // Show full filtered search or category filtered items
    if (selectedCategory !== "All" || searchQuery) {
      return isCategoryMatch && isSearchMatch && dest.id !== "ghandruk";
    }
    
    // Curated matching the screenshot when no active filter
    return ["kuri-village", "ramaroshan", "chitwan-national-park", "badimalika"].includes(dest.id);
  });

  const displayedGridDestinations = filteredGridDestinations;

  const handleCategoryClick = (category: string) => {
    hasInteractedRef.current = true;
    if (selectedCategory === category) {
      setSelectedCategory("All"); // Toggle back to all
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto no-scrollbar select-none relative pb-10 transition-colors duration-300">
      
      {/* Drawer Side Menu */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-3/4 max-w-[280px] bg-white dark:bg-zinc-900 shadow-2xl z-50 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-zinc-800 pb-5 mb-6">
                  <div>
                    <h2 className="font-black text-xl text-rose-600 dark:text-rose-500 tracking-wider">YATRIFY</h2>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {language === "ne" ? "नेपालको अद्भूत गन्तव्यहरू" : "Discover Nepal's wonders"}
                    </p>
                  </div>
                </div>
                
                <nav className="space-y-1">
                  {[
                    { label: translations[language].explore, icon: Compass, tab: "explore" },
                    { label: translations[language].wishlist, icon: Heart, tab: "favorites" },
                    { label: translations[language].guide, icon: User, tab: "chat" }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDrawerOpen(false);
                        onSwitchTab(item.tab as any);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-800 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-rose-500" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="border-t border-neutral-100 dark:border-zinc-800 pt-4">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
                  {language === "ne" ? "यात्रीफाई नेपाल v1.2.0 • स्थानीय स्तरमा गर्व" : "Yatrify Nepal v1.2.0 • Proudly Local"}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Yatrify Top Navigation Bar */}
      <header className="px-6 pt-2 pb-3 flex md:hidden items-center justify-between sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-30 transition-colors">
        <div className="flex items-center gap-3">
          {/* Only show YATRIFY text in primary color, no logo */}
          <span className="font-black text-2xl tracking-wider text-rose-600 dark:text-rose-500 font-sans">
            YATRIFY
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Menu Button */}
          <button 
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Menu className="w-6 h-6 stroke-[2]" />
          </button>
          
          {/* Profile Button */}
          <button 
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full border border-neutral-200 dark:border-zinc-800 overflow-hidden hover:scale-105 transition-all flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm"
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 stroke-[2]" />
            )}
          </button>
        </div>
      </header>

      {/* Search Bar - Exactly matching the soft pinkish-red rounded look */}
      <div className="px-6 mt-2 mb-5 relative z-10 md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder={translations[language].searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full h-11 pl-11 pr-4 rounded-2xl bg-[#FFEBEA] dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 text-sm font-medium border border-transparent focus:border-rose-400 focus:outline-none focus:ring-0 transition-all shadow-sm"
          />
          <Search className="w-4.5 h-4.5 absolute left-4 top-3.5 text-zinc-600 dark:text-zinc-400 stroke-[2.5]" />
        </div>
      </div>

      {/* Main Content Responsive Wrapper */}
      <div className="w-full max-w-7xl mx-auto md:px-8 md:py-4 space-y-6 md:space-y-10">

        {/* Featured Slider Carousel */}
        {!searchQuery && (
          <div className="mb-4">
            {/* Mobile Touch Carousel */}
            <div className="md:hidden relative h-[210px] w-full overflow-hidden">
              <div 
                ref={carouselContainerRef}
                onScroll={(e) => {
                  const container = e.currentTarget;
                  const scrollLeft = container.scrollLeft;
                  const cardWidth = 246; // 230 card width + 16 gap
                  const index = Math.round(scrollLeft / cardWidth);
                  if (index >= 0 && index < featuredDestinations.length) {
                    setActiveSlide(index);
                  }
                }}
                className="w-full h-full flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 scroll-px-6 scroll-smooth"
              >
                {featuredDestinations.map((dest) => (
                  <div 
                    key={dest.id}
                    onClick={() => onSelectDestination(dest.id)}
                    className="w-[230px] min-w-[230px] h-full rounded-3xl overflow-hidden relative shadow-lg cursor-pointer snap-start select-none group"
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getLocalFallbackImage(dest.id);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    
                    {/* Location Badge Card Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex justify-center">
                      <div className="bg-white/40 dark:bg-black/40 border border-white/40 backdrop-blur-md py-1.5 px-6 rounded-full shadow-md text-center max-w-full">
                        <span className="text-zinc-950 dark:text-zinc-50 text-sm font-extrabold font-sans whitespace-nowrap block truncate">
                          {dest.name}
                        </span>
                      </div>
                    </div>

                    {/* Short Sub-details overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-[11px] font-medium drop-shadow-sm opacity-90 line-clamp-1 flex items-center gap-1 justify-center">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" /> {dest.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Beautiful Featured Hero Grid */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans font-black text-2xl text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#D91B5C] rounded-full inline-block" />
                  {language === "ne" ? "विशेष गन्तव्यहरू" : "Featured Destinations"}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {featuredDestinations.map((dest) => (
                  <div 
                    key={dest.id}
                    onClick={() => onSelectDestination(dest.id)}
                    className="h-[280px] rounded-[32px] overflow-hidden relative shadow-lg hover:shadow-xl cursor-pointer select-none group border border-neutral-100 dark:border-zinc-800 transition-all hover:-translate-y-1.5 duration-300"
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getLocalFallbackImage(dest.id);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                    
                    {/* Featured Badge */}
                    <div className="absolute top-4 left-4 bg-[#D91B5C] text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm z-10">
                      {language === "ne" ? "विशेष" : "FEATURED"}
                    </div>

                    {/* Location Badge Card Overlay - Elegant Glass Pill */}
                    <div className="absolute bottom-5 inset-x-5 flex flex-col items-center text-center">
                      <div className="bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-zinc-800 backdrop-blur-md p-3.5 rounded-2xl shadow-md w-full max-w-[280px]">
                        <span className="text-zinc-950 dark:text-white text-base font-black tracking-tight block truncate">
                          {dest.name}
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide mt-1 flex items-center gap-1 justify-center">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" /> {dest.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Dots Indicators - Only show on mobile */}
            <div className="flex md:hidden justify-center items-center gap-1.5 mt-3">
              {featuredDestinations.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveSlide(i);
                    if (carouselContainerRef.current) {
                      const cardWidth = 246; // 230 card width + 16 gap
                      carouselContainerRef.current.scrollTo({
                        left: i * cardWidth,
                        behavior: "smooth"
                      });
                    }
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === i ? "w-6 bg-rose-500" : "w-2.5 bg-neutral-300 dark:bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Scrolling / Flexing Filters */}
        <div className="mb-2">
          <div 
            ref={categoryContainerRef}
            onTouchStart={() => { hasInteractedRef.current = true; }}
            onMouseDown={() => { hasInteractedRef.current = true; }}
            onWheel={() => { hasInteractedRef.current = true; }}
            className="flex items-center gap-3 overflow-x-auto md:flex-wrap md:justify-start md:gap-3.5 no-scrollbar py-1 px-6 md:px-0"
          >
            {CATEGORIES_LIST.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all shadow-sm cursor-pointer hover:scale-[1.03] active:scale-95 ${
                    isActive
                      ? "bg-[#D91B5C] text-white"
                      : "bg-white dark:bg-zinc-800 border-2 border-rose-100/50 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-rose-200 dark:hover:border-zinc-600"
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {categoryTranslations[language][cat.label] || cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="px-6 md:px-0 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {displayedGridDestinations.map((dest) => {
              const isLiked = favorites.includes(dest.id);
              return (
                <motion.div
                  key={dest.id}
                  className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden border border-neutral-100 dark:border-zinc-800/80 shadow-sm relative cursor-pointer flex flex-col group h-full transition-all hover:shadow-md hover:border-neutral-200 dark:hover:border-zinc-700"
                  onClick={() => onSelectDestination(dest.id)}
                >
                  {/* Image & Favorite overlay */}
                  <div className="relative h-24 md:h-40 lg:h-44 overflow-hidden bg-neutral-100 dark:bg-zinc-700 shrink-0">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getLocalFallbackImage(dest.id);
                      }}
                    />
                    
                    {/* Star Rating Badge - Matching screenshot position */}
                    <div className="absolute top-2 left-2 bg-white/95 dark:bg-zinc-900/95 py-0.5 px-1.5 rounded-full flex items-center gap-0.5 shadow-sm backdrop-blur-sm">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      <span className="text-[9px] font-black text-zinc-800 dark:text-zinc-200">{dest.rating}</span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-2.5 md:p-4 pb-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-[12px] md:text-sm text-zinc-900 dark:text-white tracking-tight leading-tight mb-0.5 group-hover:text-rose-500 transition-colors line-clamp-1">
                        {dest.name}
                      </h3>
                      <p className="text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500 font-medium line-clamp-2 leading-tight mb-1 min-h-0">
                        {dest.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-neutral-50 dark:border-zinc-800/50">
                      {/* Duration Badge - Styled cleanly */}
                      <span className="text-zinc-500 dark:text-zinc-400 font-extrabold text-[9px] uppercase tracking-wider">
                        {dest.duration}
                      </span>

                      {/* Heart Favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(dest.id);
                        }}
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isLiked
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                            : "bg-rose-50 dark:bg-zinc-700 text-rose-500 dark:text-rose-300 hover:bg-rose-100"
                        }`}
                      >
                        <Heart className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {displayedGridDestinations.length === 0 && (
            <div className="text-center py-8 bg-neutral-50 dark:bg-zinc-800/50 rounded-2xl">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                {language === "ne" ? "यस विधामा कुनै गन्तव्य भेटिएन।" : "No destinations found in this category."}
              </p>
            </div>
          )}
        </div>

        {/* Popular Places Header */}
        <div className="px-6 md:px-0 mb-3 flex items-center justify-between">
          <h3 className="font-sans font-black text-xl text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#D91B5C] rounded-full inline-block" />
            {translations[language].popularPlaces}
          </h3>
          <button 
            onClick={() => onSwitchTab("explore")}
            className="text-zinc-400 dark:text-zinc-500 text-xs font-bold hover:text-[#D91B5C] flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            {translations[language].seeAll} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Popular Place List Items */}
        <div className="px-6 md:px-0 mb-6 flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-6">
          {popularPlaces.map((dest) => (
            <div
              key={dest.id}
              onClick={() => onSelectDestination(dest.id)}
              className="p-3 bg-white dark:bg-zinc-800 rounded-3xl border border-neutral-100 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:border-neutral-200 dark:hover:border-zinc-700 transition-all cursor-pointer flex gap-3.5 group"
            >
              {/* Round-cornered image */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-neutral-100">
                <img
                  src={dest.image}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getLocalFallbackImage(dest.id);
                  }}
                />
              </div>

              {/* Title, Subtitle & Specs */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight truncate group-hover:text-rose-500 transition-colors">
                    {dest.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5 line-clamp-1">
                    {dest.description}
                  </p>
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold truncate">
                  {dest.altitude} • {dest.subcategory || "Destination"}
                </p>
              </div>

              <div className="flex flex-col justify-between items-end shrink-0">
                <div className="flex items-center gap-0.5 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-lg">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">{dest.rating}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Onboarding Sign In & Location Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOnboarding(false)}
              className="absolute inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 rounded-[36px] shadow-2xl z-50 p-6 border border-neutral-100 dark:border-zinc-800"
            >
              <div className="flex flex-col items-center text-center">
                {/* Custom Brand Logo */}
                <div className="w-16 h-16 bg-[#FFEBEA] dark:bg-rose-950/40 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Compass className="w-8 h-8 text-[#D91B5C] dark:text-rose-400 stroke-[2.5]" />
                </div>

                <h3 className="font-sans font-black text-2xl text-zinc-900 dark:text-white tracking-tight">
                  {translations[language].welcomeTitle}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-1.5 px-2 max-w-[280px]">
                  {translations[language].onboardDesc}
                </p>

                {/* Onboarding Form */}
                <form onSubmit={handleOnboardSubmit} className="w-full mt-5 space-y-3.5 text-left">
                  {/* Name field */}
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block ml-1 mb-1">
                      {translations[language].fullName}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === "ne" ? "उदा. मार्कस मैनाली" : "e.g. Marcus Mainali"}
                      value={onboardName}
                      onChange={(e) => setOnboardName(e.target.value)}
                      className="w-full px-4 py-3 text-xs font-bold border border-neutral-100 dark:border-zinc-800/60 rounded-2xl bg-neutral-50 dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block ml-1 mb-1">
                      {translations[language].emailAddress}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. marcus@gmail.com"
                      value={onboardEmail}
                      onChange={(e) => setOnboardEmail(e.target.value)}
                      className="w-full px-4 py-3 text-xs font-bold border border-neutral-100 dark:border-zinc-800/60 rounded-2xl bg-neutral-50 dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>

                  {/* Location preference field */}
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block ml-1 mb-1">
                      {translations[language].locationPref}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === "ne" ? "उदा. काठमाडौं, नेपाल" : "e.g. Kathmandu, Nepal"}
                      value={onboardLocation}
                      onChange={(e) => setOnboardLocation(e.target.value)}
                      className="w-full px-4 py-3 text-xs font-bold border border-neutral-100 dark:border-zinc-800/60 rounded-2xl bg-neutral-50 dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                    
                    {/* Quick Location Pills */}
                    <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
                      {["Kathmandu, Nepal", "Pokhara, Nepal", "Lalitpur, Nepal"].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setOnboardLocation(loc)}
                          className={`text-[9px] font-extrabold px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                            onboardLocation === loc
                              ? "bg-[#D91B5C] border-[#D91B5C] text-white"
                              : "bg-neutral-50 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {loc.split(",")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-3">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-[#D91B5C] hover:bg-[#c0144e] text-white font-sans font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-rose-500/10 active:scale-[0.98]"
                    >
                      {translations[language].signInBtn}
                    </button>
                    <button
                      type="button"
                      onClick={handleOnboardSkip}
                      className="w-full py-3 rounded-2xl bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-all active:scale-[0.98]"
                    >
                      {translations[language].maybeLater}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
