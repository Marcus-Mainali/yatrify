import React, { useState, useEffect } from "react";
import { Heart, Star, MapPin, Sparkles, Navigation, ArrowUpDown, Check, Circle } from "lucide-react";
import { Destination } from "../types";
import { DESTINATIONS, getLocalFallbackImage } from "../data";

interface FavoritesScreenProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectDestination: (id: string) => void;
  onSwitchTab: (tab: "home" | "favorites" | "explore" | "chat") => void;
  visited: string[];
  onToggleVisited: (id: string) => void;
}

export default function FavoritesScreen({
  favorites,
  onToggleFavorite,
  onSelectDestination,
  onSwitchTab,
  visited,
  onToggleVisited,
}: FavoritesScreenProps) {
  const [sortBy, setSortBy] = useState<"name" | "rating">("name");

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

  const favoriteDestinations = DESTINATIONS.filter((d) => favorites.includes(d.id))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto no-scrollbar pb-10 transition-colors duration-300">
      
      <div className="w-full max-w-7xl mx-auto md:px-8 md:py-6 space-y-6">
        {/* Header */}
        <div className="px-6 md:px-0 pt-2 pb-2 flex items-center justify-between">
          <div>
            <h2 className="font-black text-2xl md:text-3xl text-zinc-900 dark:text-white tracking-tight">Your Wishlist</h2>
            <p className="text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Your pinned mountains, valleys, and lakeside camps</p>
          </div>

          {/* Top-right Order Selection option */}
          <div className="flex flex-col items-end shrink-0">
            <label className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Keep Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-extrabold text-xs py-1.5 px-3 rounded-xl border border-neutral-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-sm transition-all"
            >
              <option value="name">Alphabetical</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className={`px-6 md:px-0 flex-1 ${favoriteDestinations.length === 0 ? "flex flex-col justify-center" : ""}`}>
          {favoriteDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {favoriteDestinations.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => onSelectDestination(dest.id)}
                  className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col relative group"
                >
                  {/* Photo banner */}
                  <div className="h-36 sm:h-44 md:h-48 relative bg-zinc-100 dark:bg-zinc-700">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  
                  {/* Category overlay */}
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/95 py-1 px-3 rounded-full text-[9px] font-black tracking-widest uppercase text-rose-500 shadow-sm">
                    {dest.category}
                  </div>
 
                  {/* Rating overlay */}
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm py-1 px-2.5 rounded-full flex items-center gap-1 text-white text-[10px] font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {dest.rating}
                  </div>
 
                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-4 text-white">
                    <h3 className="font-black text-lg tracking-tight">{dest.name}</h3>
                    <p className="text-[10px] opacity-90 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" /> {dest.location}
                    </p>
                  </div>
                </div>
 
                {/* Card Details */}
                <div className="p-3 flex items-center justify-between gap-2.5 bg-white dark:bg-zinc-800">
                  {/* Visited Toggle Option */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisited(dest.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap min-w-0 flex-1 justify-center ${
                      visited.includes(dest.id)
                        ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-neutral-50 dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 text-zinc-500 hover:bg-neutral-100 dark:hover:bg-zinc-800/50 hover:text-zinc-700"
                    }`}
                  >
                    {visited.includes(dest.id) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                    )}
                    <span className="truncate">
                      {visited.includes(dest.id) ? "Already Visited" : "Mark as Visited"}
                    </span>
                  </button>
 
                  <div className="flex shrink-0">
                    {/* Unfavorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(dest.id);
                      }}
                      className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-md shadow-rose-500/10 active:scale-95 transition-all"
                    >
                      <Heart className="w-4 h-4 fill-white stroke-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-4 bg-neutral-50 dark:bg-zinc-800/30 rounded-[32px] border border-neutral-100 dark:border-zinc-800/50">
            {/* Heart broken visual icon */}
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div className="space-y-1 max-w-[240px]">
              <h3 className="font-extrabold text-sm text-zinc-800 dark:text-white">Your Wishlist is Empty</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal font-medium">Bookmark destinations by clicking on the heart icon when viewing campsites, lakes, and homestays.</p>
            </div>

            <button
              onClick={() => onSwitchTab("home")}
              className="px-5 py-2.5 bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-500/15 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Discover Destinations
            </button>
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
