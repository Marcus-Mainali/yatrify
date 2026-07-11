import React, { useState, useEffect } from "react";
import { Search, MapPin, Star, SlidersHorizontal, ArrowUpDown, Calendar, Navigation, CheckCircle2 } from "lucide-react";
import { Destination, Booking } from "../types";
import { DESTINATIONS, getLocalFallbackImage } from "../data";

interface ExploreScreenProps {
  onSelectDestination: (id: string) => void;
  bookings: Booking[];
}

export default function ExploreScreen({ onSelectDestination, bookings }: ExploreScreenProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Easy" | "Moderate" | "Challenging">("All");
  const [sortBy, setSortBy] = useState<"name" | "rating">("name");
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

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

  // Filter and Sort destinations
  const processedDestinations = DESTINATIONS.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                          dest.location.toLowerCase().includes(localSearchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || dest.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  // Simulated coordinate positions on a gorgeous Nepal stylized vector container
  const PINS = [
    { id: "kulekhani", x: "65%", y: "55%", name: "Kulekhani" },
    { id: "badimalika", x: "20%", y: "40%", name: "Badimalika" },
    { id: "kuri-village", x: "72%", y: "48%", name: "Kuri Village" },
    { id: "ramaroshan", x: "28%", y: "42%", name: "Ramaroshan" },
    { id: "ghandruk", x: "48%", y: "46%", name: "Ghandruk" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto no-scrollbar pb-10 transition-colors duration-300">
      
      <div className="w-full max-w-7xl mx-auto md:px-8 md:py-6 space-y-6">
        
        {/* Page Header */}
        <div className="px-6 md:px-0 pt-2 pb-2">
          <h2 className="font-black text-2xl md:text-3xl text-zinc-900 dark:text-white tracking-tight">Explore Nepal</h2>
          <p className="text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Find expeditions, trails, and cultural wonders</p>
        </div>

        {/* Advanced Filter Controls */}
        <div className="mx-6 md:mx-0 mb-4 space-y-4 bg-neutral-50/50 dark:bg-zinc-800/20 p-4 md:p-6 rounded-3xl border border-neutral-100 dark:border-zinc-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search mountains, lakes, regions..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white dark:bg-zinc-800 border border-neutral-100 dark:border-zinc-700/50 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <Search className="w-4.5 h-4.5 absolute left-4 top-3.5 text-zinc-400" />
            </div>

            {/* Quick Difficulty Filter row */}
            <div className="flex gap-2 items-center overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider hidden md:inline-block mr-2">Difficulty:</span>
              <SlidersHorizontal className="w-4 h-4 text-zinc-400 shrink-0 md:hidden" />
              {["All", "Easy", "Moderate", "Challenging"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff as any)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold whitespace-nowrap transition-all border cursor-pointer hover:scale-[1.03] active:scale-95 ${
                    selectedDifficulty === diff
                      ? "bg-[#D91B5C] border-[#D91B5C] text-white"
                      : "bg-white dark:bg-zinc-800 border-neutral-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-neutral-200"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Sort selector */}
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-100 dark:border-zinc-800/80">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort Locations
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-zinc-800 dark:text-zinc-200 font-extrabold focus:outline-none cursor-pointer border-0 py-0 pr-6 pl-0"
            >
              <option value="name" className="dark:bg-zinc-800">Alphabetical</option>
              <option value="rating" className="dark:bg-zinc-800">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Grid of Results */}
        <div className="px-6 md:px-0">
          <h3 className="font-sans font-black text-lg text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-5 bg-[#D91B5C] rounded-full inline-block" />
            Expedition Matches ({processedDestinations.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {processedDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => onSelectDestination(dest.id)}
                className="p-3 bg-white dark:bg-zinc-800 rounded-[24px] border border-neutral-100 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:border-neutral-200 dark:hover:border-zinc-700 transition-all cursor-pointer flex gap-4 group"
              >
                {/* Image thumbnail */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-50 dark:bg-zinc-700">
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
                </div>

                {/* Text info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm md:text-base text-zinc-900 dark:text-white leading-tight truncate group-hover:text-rose-500 transition-colors">
                        {dest.name}
                      </h4>
                      
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">{dest.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 mt-1">
                      {dest.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold border-t border-neutral-50 dark:border-zinc-800/30 pt-1.5 mt-1">
                    <span>{dest.altitude} • {dest.difficulty}</span>
                    <span className="text-[#D91B5C] font-black text-[10px] uppercase tracking-wider">
                      {dest.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {processedDestinations.length === 0 && (
              <div className="col-span-full text-center py-12 bg-neutral-50 dark:bg-zinc-800/30 rounded-3xl border border-dashed border-neutral-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">No expeditions match your filters.</p>
                <button
                  onClick={() => {
                    setLocalSearchQuery("");
                    setSelectedDifficulty("All");
                  }}
                  className="mt-3 text-xs text-rose-500 font-extrabold cursor-pointer hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
