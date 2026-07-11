import React, { useState, useEffect } from "react";
import { ArrowLeft, Heart, Star, Calendar, Users, MapPin, Shield, Info, Check, Sparkles, Navigation, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Destination, Booking } from "../types";
import { translations } from "../translations";
import { getLocalFallbackImage } from "../data";

interface DetailsScreenProps {
  destination: Destination;
  onBack: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddBooking: (booking: Booking) => void;
  language: "en" | "ne";
}

export default function DetailsScreen({
  destination,
  onBack,
  favorites,
  onToggleFavorite,
  onAddBooking,
  language,
}: DetailsScreenProps) {
  const [activeTab, setActiveTab] = useState<"about" | "features">("about");
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

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [travelDate, setTravelDate] = useState("2026-07-15");
  const [travelers, setTravelers] = useState(1);
  const [isBookedSuccess, setIsBookedSuccess] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight > 0) {
      const progress = (target.scrollTop / totalHeight) * 100;
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
  };

  const isLiked = favorites.includes(destination.id);

  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const handleShare = async () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ", " + destination.location)}`;
    const shareData = {
      title: destination.name,
      text: `Check out ${destination.name} on Google Maps via Yatrify!`,
      url: mapsUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing destination:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(mapsUrl);
        setShowCopiedAlert(true);
        setTimeout(() => setShowCopiedAlert(false), 2000);
      } catch (err) {
        console.error("Clipboard write failed:", err);
      }
    }
  };

  // Auto-calculated prices based on travelers
  const totalPrice = travelers * destination.price;

  const handleConfirmBooking = () => {
    setIsBookedSuccess(true);
    setTimeout(() => {
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        destinationId: destination.id,
        destinationName: destination.name,
        destinationImage: destination.image,
        bookingDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        travelDate: new Date(travelDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        travelersCount: travelers,
        totalPrice: totalPrice,
        status: "Confirmed"
      };
      onAddBooking(newBooking);
      setIsBookingModalOpen(false);
      setIsBookedSuccess(false);
    }, 2000); // 2 seconds animation
  };

  // Content for tabs
  const getTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            <p className="leading-relaxed">{destination.detailedDescription}</p>
          </div>
        );
      case "features":
        return (
          <div className="space-y-4">
            <div className="bg-rose-50/40 dark:bg-zinc-800/30 rounded-2xl p-5 border border-rose-100/20 dark:border-zinc-700/20">
              <h4 className="font-extrabold text-zinc-800 dark:text-zinc-200 text-sm mb-3.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D91B5C]" />
                {translations[language].highlightsTab}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {destination.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D91B5C] shrink-0 mt-1.5" />
                    <span className="break-words leading-normal">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white dark:bg-zinc-900 select-none relative transition-colors duration-300 overflow-hidden">
      
      {/* Subtle Scroll Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-neutral-100/30 dark:bg-zinc-800/20 z-[60]">
        <div
          className="h-full bg-[#D91B5C] transition-all duration-75 ease-out rounded-r-full"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* LEFT SIDE: Immersive Hero Image & Title Overlay (Cover on Desktop, Top Banner on Mobile) */}
      <div className="w-full md:w-[45%] lg:w-[50%] h-[340px] md:h-full shrink-0 relative overflow-hidden">
        {/* Header Controls (Back and favorite overlay) - Fixed at top with pointer-events protection */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center text-zinc-950 dark:text-white shadow-md active:scale-90 transition-transform pointer-events-auto cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center text-zinc-950 dark:text-white shadow-md active:scale-90 transition-transform relative cursor-pointer"
              title="Share destination"
            >
              <Share2 className="w-[18px] h-[18px] stroke-[2.5]" />
              <AnimatePresence>
                {showCopiedAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute top-12 right-0 bg-zinc-950/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-zinc-950 text-[9px] font-extrabold py-1.5 px-3 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-50 border border-white/10 dark:border-zinc-950/10"
                  >
                    Copied Link!
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => onToggleFavorite(destination.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer ${
                isLiked
                  ? "bg-rose-500 text-white"
                  : "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-rose-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>

        <img
          src={destination.image}
          alt={destination.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getLocalFallbackImage(destination.id);
          }}
        />
        {/* Deep vignette gradient for high text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        {/* Place Title details over Image bottom */}
        <div className="absolute bottom-8 left-8 right-8 text-white space-y-3">
          <div className="flex items-center gap-1 bg-rose-500 text-white text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-full w-fit">
            <Sparkles className="w-2.5 h-2.5" />
            {destination.category}
          </div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-sans font-black tracking-tight leading-tight drop-shadow-sm">
            {destination.name}
          </h1>
          <p className="text-xs md:text-sm font-semibold opacity-90 flex items-center gap-1.5 drop-shadow-sm">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" /> {destination.location}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Independent Scrolling Details Section */}
      <div
        onScroll={handleScroll}
        className="flex-1 h-full overflow-y-auto no-scrollbar bg-white dark:bg-zinc-900"
      >
        <div className="p-6 md:p-10 lg:p-12 xl:p-14 space-y-6 md:space-y-8 pb-24 max-w-2xl mx-auto">
          
          {/* Info Badges Strip */}
          <div className="grid grid-cols-4 gap-2 bg-neutral-50/70 dark:bg-zinc-800/40 py-5 px-3 rounded-[28px] border border-neutral-100 dark:border-zinc-800/60 shadow-sm">
            {[
              { label: "Altitude", val: destination.altitude },
              { label: "Best Season", val: destination.bestSeason },
              { label: "Duration", val: destination.duration },
              { label: "Rating", val: destination.rating }
            ].map((b, i) => (
              <div key={i} className="text-center px-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{b.label}</p>
                <p className="text-[10px] md:text-xs font-black text-zinc-800 dark:text-zinc-200 mt-1 leading-tight whitespace-normal break-words">{b.val}</p>
              </div>
            ))}
          </div>

          {/* Explore Button */}
          <div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ", " + destination.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-4 rounded-3xl bg-[#D91B5C] hover:bg-[#c0144e] text-white font-sans font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/10 active:scale-[0.98] text-center cursor-pointer hover:shadow-lg hover:shadow-rose-500/20"
            >
              <Navigation className="w-4 h-4 text-white animate-pulse" />
              {translations[language].exploreMaps}
            </a>
          </div>

          {/* Content Tabs Header */}
          <div className="space-y-5">
            <div className="flex items-center gap-6 border-b border-neutral-100 dark:border-zinc-800 pb-2.5">
              {[
                { id: "about", label: translations[language].overviewTab },
                { id: "features", label: translations[language].highlightsTab }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`text-xs font-extrabold tracking-tight pb-2 relative transition-all cursor-pointer ${
                    activeTab === t.id
                      ? "text-[#D91B5C] scale-105"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  {t.label}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#D91B5C] transition-all duration-300 transform origin-center ${
                      activeTab === t.id ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Render Tab Content */}
            <div className="min-h-[140px] px-1 pt-1">
              {getTabContent()}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
