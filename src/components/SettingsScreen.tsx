import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sun, Moon, Globe, Info, AlertTriangle, Database, Calendar, Users, CreditCard, XCircle, CheckCircle2, Laptop, Terminal, Download, HelpCircle, Share } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import YatrifyLogo from "./YatrifyLogo";
import { translations } from "../translations";

interface SettingsScreenProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  bookings: any[];
  onBackToHome: () => void;
  language: "en" | "ne";
  onChangeLanguage: (lang: "en" | "ne") => void;
  supabaseStatus?: { configured: boolean; connected: boolean; message: string };
  onCancelBooking?: (id: string) => void;
}

export default function SettingsScreen({
  darkMode,
  onToggleDarkMode,
  bookings = [],
  onBackToHome,
  language,
  onChangeLanguage,
  supabaseStatus = { configured: false, connected: false, message: "Offline Mode" },
  onCancelBooking,
}: SettingsScreenProps) {
  // Navigation within settings: "settings" or "profile" or "desktop"
  const [view, setView] = useState<"settings" | "profile" | "desktop">("settings");
  
  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallSuccessToast, setShowInstallSuccessToast] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallSuccessToast(true);
      setTimeout(() => setShowInstallSuccessToast(false), 4000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if running in standalone mode (already installed)
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      // Guide fallback toast
      setShowInstallGuideToast(true);
      setTimeout(() => setShowInstallGuideToast(false), 6000);
    }
  };

  const [showInstallGuideToast, setShowInstallGuideToast] = useState(false);
  
  // User profile state loaded from localStorage
  const [userName, setUserName] = useState(() => {
    const hasSignedUp = localStorage.getItem("hasSignedUp");
    if (hasSignedUp !== "true") return "";
    return localStorage.getItem("userName") || "";
  });
  const [userLocation, setUserLocation] = useState(() => {
    const hasSignedUp = localStorage.getItem("hasSignedUp");
    if (hasSignedUp !== "true") return "";
    return localStorage.getItem("userLocation") || "";
  });
  const [userEmail, setUserEmail] = useState(() => {
    const hasSignedUp = localStorage.getItem("hasSignedUp");
    if (hasSignedUp !== "true") return "";
    return localStorage.getItem("userEmail") || "";
  });
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem("userProfileImage") || "");
  const [isEditing, setIsEditing] = useState(false);

  // Profile Edit fields
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleConfirmLogOut = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userLocation");
    localStorage.removeItem("userProfileImage");
    localStorage.removeItem("hasSignedUp");

    setUserName("");
    setUserEmail("");
    setUserLocation("");
    setProfileImage("");
    setEditName("");
    setEditEmail("");
    setEditLocation("");

    setShowConfirmLogout(false);
    onBackToHome();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem("userProfileImage", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setUserName(editName);
    setUserLocation(editLocation);
    setUserEmail(editEmail);
    localStorage.setItem("userName", editName);
    localStorage.setItem("userLocation", editLocation);
    localStorage.setItem("userEmail", editEmail);
    localStorage.setItem("hasSignedUp", "true");
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(userName);
    setEditLocation(userLocation);
    setEditEmail(userEmail);
    setIsEditing(false);
  };

  if (view === "profile") {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto no-scrollbar relative transition-colors duration-300">
        {/* Background Travel Doodle Decorator */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#FFEBEA]/15 to-transparent dark:from-rose-950/5 dark:to-transparent pointer-events-none" />

        {/* Profile Header */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-start relative z-10">
          {/* Light Pink Back Button */}
          <button
            onClick={() => {
              if (isEditing) {
                handleCancelEdit();
              } else {
                setView("settings");
              }
            }}
            id="profile-back-btn"
            className="w-11 h-11 bg-[#FFEBEA] dark:bg-rose-950/40 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-[#D91B5C] dark:text-rose-400 focus:outline-none shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Title */}
        <div className="px-6 pt-2 pb-6 relative z-10">
          <h2 className="font-sans font-black text-4xl text-zinc-900 dark:text-white tracking-tight">
            {translations[language].profile}
          </h2>
        </div>

        {/* Profile Avatar Center Module */}
        <div className="flex flex-col items-center justify-center mb-8 relative z-10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {/* Outer Pink Circle border */}
            <div className="w-28 h-28 rounded-full border-4 border-[#FFE6E8] dark:border-rose-950/30 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 shadow-md overflow-hidden relative">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                /* Silhouette Avatar */
                <svg 
                  className="w-24 h-24 text-zinc-300 dark:text-zinc-600" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                {translations[language].updateImage}
              </div>
            </div>

            {/* floating red Edit pencil icon */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute bottom-0 right-1 w-8 h-8 bg-[#D91B5C] rounded-full flex items-center justify-center text-white border-2 border-white dark:border-zinc-900 hover:scale-110 active:scale-95 transition-all shadow-md"
            >
              <svg 
                className="w-4 h-4 fill-none stroke-current stroke-[2.5]" 
                viewBox="0 0 24 24"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
              </svg>
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Personal Info Title */}
        <div className="px-6 mb-4">
          <h3 className="font-sans font-black text-lg text-zinc-900 dark:text-white">
            {language === "ne" ? "व्यक्तिगत जानकारी" : "Personal Info"}
          </h3>
        </div>

        {/* Forms & Inputs to match exact layout */}
        <div className="px-6 space-y-4 flex-1">
          {isEditing ? (
            <div className="space-y-4">
              {/* Editable form fields */}
              <div className="bg-neutral-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-zinc-800 space-y-3">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    {translations[language].yourName}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold border border-neutral-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    {translations[language].location}
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold border border-neutral-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    {translations[language].email}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold border border-neutral-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Edit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 px-4 rounded-3xl bg-neutral-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold text-sm hover:bg-neutral-200 transition-all"
                >
                  {translations[language].cancel}
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 px-4 rounded-3xl bg-[#D91B5C] text-white font-extrabold text-sm hover:opacity-90 transition-all"
                >
                  {translations[language].save}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Static display Card 1 - Name */}
              <div className="bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-100 dark:border-zinc-800/60 p-4 rounded-3xl flex justify-between items-center shadow-sm">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  {translations[language].yourName}
                </span>
                <span className="text-xs font-black text-zinc-800 dark:text-white text-right">
                  {userName || "—"}
                </span>
              </div>

              {/* Static display Card 2 - Location & Email */}
              <div className="bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-100 dark:border-zinc-800/60 p-4 rounded-3xl space-y-4 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                    {translations[language].location}
                  </span>
                  <span className="text-xs font-black text-zinc-800 dark:text-white text-right max-w-[180px]">
                    {userLocation || "—"}
                  </span>
                </div>
                <div className="h-px bg-neutral-200/50 dark:bg-zinc-700/50" />
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                    {translations[language].email}
                  </span>
                  <span className="text-xs font-black text-zinc-800 dark:text-white text-right truncate">
                    {userEmail || "—"}
                  </span>
                </div>
              </div>

              {/* Giant Red Button "Edit" at the bottom */}
              <div className="pt-6">
                <button
                  onClick={() => {
                    setEditName(userName);
                    setEditLocation(userLocation);
                    setEditEmail(userEmail);
                    setIsEditing(true);
                  }}
                  className="w-full py-4 rounded-[28px] bg-[#D91B5C] hover:bg-[#c0144e] text-white font-sans font-extrabold text-lg transition-all shadow-md shadow-rose-500/10 active:scale-95"
                >
                  {translations[language].edit}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "desktop") {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto no-scrollbar relative transition-colors duration-300 pb-12">
        {/* Background Travel Doodle Decorator */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#FFEBEA]/15 to-transparent dark:from-rose-950/5 dark:to-transparent pointer-events-none" />

        {/* Settings Header */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-start relative z-10">
          {/* Light Pink Back Button */}
          <button
            onClick={() => setView("settings")}
            className="w-11 h-11 bg-[#FFEBEA] dark:bg-rose-950/40 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-[#D91B5C] dark:text-rose-400 focus:outline-none shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Title */}
        <div className="px-6 pt-2 pb-4 relative z-10">
          <h2 className="font-sans font-black text-4xl text-zinc-900 dark:text-white tracking-tight">
            {language === "ne" ? "डेस्कटप एप हब" : "Desktop Hub"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-1">
            {language === "ne" 
              ? "यस एप्लिकेसनलाई आफ्नो कम्प्युटर वा म्याकबुकमा नेटिभ एपको रूपमा चलाउनुहोस्।" 
              : "Install and run Yatrify as a standalone, lightweight native application."}
          </p>
        </div>

        <div className="px-6 space-y-6 relative z-10">
          {/* Card 1: PWA Installation Banner */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-[32px] p-6 text-white shadow-lg shadow-rose-500/15 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <Laptop className="w-40 h-40" />
            </div>
            
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black tracking-widest uppercase">
                {language === "ne" ? "सिफारिस गरिएको" : "RECOMMENDED"}
              </span>
              
              <h3 className="font-sans font-black text-2xl mt-3 tracking-tight">
                {language === "ne" ? "सिधै कम्प्युटरमा इन्स्टल गर्नुहोस्" : "Instant Desktop Install"}
              </h3>
              
              <p className="text-xs text-white/80 font-medium mt-1 leading-relaxed max-w-[280px]">
                {language === "ne" 
                  ? "ब्राउजर बिना नै म्याक वा विन्डोजको होम स्क्रिनमा एप्लिकेसन थप्नुहोस् र सहजै चलाउनुहोस्।" 
                  : "Add Yatrify directly to your macOS Dock or Windows Desktop with a single click. Quick and light!"}
              </p>

              <div className="mt-6">
                {isInstalled ? (
                  <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-3 rounded-2xl border border-white/30 backdrop-blur-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span className="text-xs font-black tracking-wide">
                      {language === "ne" ? "Standalone एप सक्रिय छ" : "Standalone App Active"}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-2 bg-white text-rose-600 hover:bg-zinc-50 active:scale-95 transition-all font-black text-xs tracking-wider uppercase px-6 py-3.5 rounded-2xl shadow-md cursor-pointer"
                  >
                    <Laptop className="w-4.5 h-4.5 stroke-[2.5]" />
                    {language === "ne" ? "एप इन्स्टल गर्नुहोस्" : "Install Standalone App"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: VS Code & Local Running Guide */}
          <div className="bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-100 dark:border-zinc-800/60 p-5 rounded-[32px] space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFEBEA] dark:bg-rose-950/40 flex items-center justify-center text-[#D91B5C] dark:text-rose-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-black text-base text-zinc-800 dark:text-white leading-tight">
                  {language === "ne" ? "VS Code र स्थानीय पिसीमा चलाउनुहोस्" : "Run in VS Code & Locally"}
                </h3>
                <span className="text-[10px] font-black tracking-widest text-[#D91B5C] dark:text-rose-400 uppercase">
                  {language === "ne" ? "विकासकर्ताहरूको लागि" : "DEVELOPER GUIDE"}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
              {language === "ne" 
                ? "यस एप्लिकेसनलाई आफ्नो स्थानीय कोडिङ वातावरणमा कसरी चलाउने र टेस्ट गर्ने भनेर यहाँ सिकाइएको छ:" 
                : "You can download this entire repository and run it locally on your machine with VS Code. We have built 1-click execution scripts for you:"}
            </p>

            <div className="space-y-4 pt-2">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500 dark:text-zinc-400 shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-white leading-tight">
                    {language === "ne" ? "प्रोजेक्ट एक्सपोर्ट गर्नुहोस्" : "Export the Project ZIP"}
                  </h4>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 leading-relaxed">
                    {language === "ne" 
                      ? "दायाँ मेनुबाट 'Export to ZIP' मा क्लिक गर्नुहोस् र डाउनलोड गर्नुहोस्।" 
                      : "From the options menu, export the app as a ZIP file, or link it with your GitHub account."}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500 dark:text-zinc-400 shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-white leading-tight">
                    {language === "ne" ? "VS Code मा फोल्डर खोल्नुहोस्" : "Open Workspace in VS Code"}
                  </h4>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 leading-relaxed">
                    {language === "ne" 
                      ? "ZIP फाइललाई अनजिप गर्नुहोस् र त्यो फोल्डरलाई VS Code मा सिधै तान्नुहोस्।" 
                      : "Extract the downloaded ZIP and open the directory in your VS Code workspace."}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500 dark:text-zinc-400 shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-white leading-tight">
                    {language === "ne" ? "१-क्लिकमा सिधै सुरु गर्नुहोस्" : "Run in 1-Click with Custom Launchers"}
                  </h4>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 leading-relaxed">
                    {language === "ne" 
                      ? "विन्डोजको लागि 'start-desktop.bat' मा डबल-क्लिक गर्नुहोस् वा म्याकको लागि टर्मिनलमा 'sh start-desktop.sh' रन गर्नुहोस्।" 
                      : "Double-click 'start-desktop.bat' (Windows) or run 'sh start-desktop.sh' (macOS/Linux) to automatically install NPM dependencies and start the local server on http://localhost:3000!"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Manual Guide */}
          <div className="bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-100 dark:border-zinc-800/60 p-5 rounded-[32px] space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-black text-base text-zinc-800 dark:text-white leading-tight">
                  {language === "ne" ? "म्यानुअल ब्राउजर इन्स्टलेशन निर्देशन" : "Manual Browser Installation"}
                </h3>
                <span className="text-[10px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                  {language === "ne" ? "वैकल्पिक विधि" : "ALTERNATIVE METHOD"}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* Chrome/Edge */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800/50">
                <h4 className="text-xs font-black text-zinc-800 dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Google Chrome & Edge
                </h4>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold leading-relaxed">
                  {language === "ne" 
                    ? "सर्च बारको दायाँपट्टि रहेको 'Install Yatrify' आइकनमा क्लिक गर्नुहोस्।" 
                    : "Click the monitor icon with a down arrow located at the right-hand end of your Google Chrome or Microsoft Edge address bar."}
                </p>
              </div>

              {/* Safari macOS */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800/50">
                <h4 className="text-xs font-black text-zinc-800 dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Safari (macOS Sonoma or later)
                </h4>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold leading-relaxed">
                  {language === "ne" 
                    ? "शीर्ष मेनु बारमा 'File' > 'Add to Dock...' मा क्लिक गर्नुहोस्।" 
                    : "Go to the browser top menu bar, select 'File', and click 'Add to Dock...' to create a native dock application for Safari."}
                </p>
              </div>

              {/* Mobile Share */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800/50">
                <h4 className="text-xs font-black text-zinc-800 dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Safari iOS (iPhone / iPad)
                </h4>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold leading-relaxed">
                  {language === "ne" 
                    ? "ब्राउजरको 'Share' बटन थिच्नुहोस् र त्यसपछि 'Add to Home Screen' रोज्नुहोस्।" 
                    : "Tap Safari's 'Share' button at the bottom navigation bar and select 'Add to Home Screen' from the options."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Toast Elements */}
        <AnimatePresence>
          {showInstallGuideToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-6 inset-x-6 z-[120] p-4 bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 text-white rounded-2xl shadow-xl flex items-start gap-3"
            >
              <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black">
                  {language === "ne" ? "ब्राउजरमा थप्नुहोस्" : "How to Install App"}
                </h4>
                <p className="text-[11px] text-zinc-400 font-semibold mt-0.5 leading-relaxed">
                  {language === "ne" 
                    ? "तपाईंको ब्राउजरको सर्च बारको दायाँ कुनामा वा ब्राउजरको 'मेनु/शेयर' विकल्पमा गएर 'Add to Home Screen' वा 'Install' रोज्नुहोस्।" 
                    : "Simply open your browser's menu (or click the address bar install icon) and click 'Install Yatrify' or 'Add to Dock' to launch standalone!"}
                </p>
              </div>
            </motion.div>
          )}

          {showInstallSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-6 inset-x-6 z-[120] p-4 bg-emerald-950/90 border border-emerald-800 text-white rounded-2xl shadow-xl flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-black">
                  {language === "ne" ? "एप सफलतापूर्वक थपियो!" : "Standalone App Active!"}
                </h4>
                <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                  {language === "ne" ? "Yatrify अब तपाईंको होमस्क्रिन वा डस्कटपमा उपलब्ध छ।" : "Yatrify has been added successfully to your desktop workspace."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Otherwise, default Settings view
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto no-scrollbar relative transition-colors duration-300">
      {/* Background Travel Doodle Decorator */}
      <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#FFEBEA]/15 to-transparent dark:from-rose-950/5 dark:to-transparent pointer-events-none" />

      {/* Settings Header */}
      <div className="px-6 pt-5 pb-2 flex items-center justify-between relative z-10">
        {/* Light Pink Back Button */}
        <button
          onClick={onBackToHome}
          id="settings-back-btn"
          className="w-11 h-11 bg-[#FFEBEA] dark:bg-rose-950/40 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-[#D91B5C] dark:text-rose-400 focus:outline-none shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-2 pb-6 relative z-10">
        <h2 className="font-sans font-black text-4xl text-zinc-900 dark:text-white tracking-tight">
          {language === "ne" ? "सेटिङहरू" : "Settings"}
        </h2>
      </div>

      {/* Settings Options List */}
      <div className="px-6 space-y-6 flex-1 relative z-10">
        
        {/* Section 1: Personal */}
        <div>
          <h3 className="font-sans font-black text-lg text-zinc-900 dark:text-white mb-3">
            {translations[language].personal}
          </h3>
          
          <div className="space-y-3">
            {/* Profile Row Button */}
            <button
              onClick={() => setView("profile")}
              className="w-full p-4 bg-neutral-50 dark:bg-zinc-800/40 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-3xl border border-neutral-100 dark:border-zinc-800/60 flex items-center justify-between transition-colors shadow-sm focus:outline-none text-left"
            >
              <span className="text-sm font-extrabold text-zinc-800 dark:text-white">
                {translations[language].profile}
              </span>
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>

            {/* Theme Row Button (with Moon/Sun dark toggle) */}
            <button
              onClick={onToggleDarkMode}
              className="w-full p-4 bg-neutral-50 dark:bg-zinc-800/40 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-3xl border border-neutral-100 dark:border-zinc-800/60 flex items-center justify-between transition-colors shadow-sm focus:outline-none text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-zinc-800 dark:text-white">
                  {translations[language].theme}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500">
                  {language === "ne" ? (darkMode ? "डार्क" : "लाइट") : (darkMode ? "Dark" : "Light")}
                </span>
                {/* Contrast circle icon */}
                <div className="w-6 h-6 rounded-full border-2 border-[#D91B5C] dark:border-rose-400 flex items-center overflow-hidden">
                  <div className="w-3 h-full bg-[#D91B5C] dark:bg-rose-400" />
                  <div className="w-3 h-full bg-transparent" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: Account */}
        <div>
          <h3 className="font-sans font-black text-lg text-zinc-900 dark:text-white mb-3">
            {translations[language].account}
          </h3>
          
          <div className="space-y-3">
            {/* Language Row */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="w-full p-4 bg-neutral-50 dark:bg-zinc-800/40 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-3xl border border-neutral-100 dark:border-zinc-800/60 flex items-center justify-between transition-colors shadow-sm focus:outline-none text-left"
            >
              <span className="text-sm font-extrabold text-zinc-800 dark:text-white">
                {translations[language].language}
              </span>
              <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                <span className="text-xs font-bold mr-1">
                  {language === "en" ? "English" : "नेपाली"}
                </span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>

            {/* About YATRIFY Row */}
            <button
              onClick={() => setShowAboutModal(true)}
              className="w-full p-4 bg-neutral-50 dark:bg-zinc-800/40 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-3xl border border-neutral-100 dark:border-zinc-800/60 flex items-center justify-between transition-colors shadow-sm focus:outline-none text-left cursor-pointer"
            >
              <span className="text-sm font-extrabold text-zinc-800 dark:text-white">
                {translations[language].aboutYatrify}
              </span>
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Action Button: Log Out */}
        <div className="pt-4">
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="w-full py-4 rounded-[28px] bg-[#D91B5C] hover:bg-[#c0144e] text-white font-sans font-extrabold text-lg transition-all shadow-md shadow-rose-500/10 active:scale-95"
          >
            {translations[language].logOut}
          </button>
        </div>



        {/* YATRIFY Footer Section */}
        <div className="text-center pt-2 pb-6">
          <h4 className="font-sans font-black text-zinc-900 dark:text-white tracking-wider text-xl">
            YATRIFY
          </h4>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold tracking-widest mt-0.5">
            Version 1.0
          </p>
        </div>

      </div>

      {/* Log Out Confirmation Modal */}
      <AnimatePresence>
        {showConfirmLogout && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmLogout(false)}
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
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <AlertTriangle className="w-8 h-8 text-[#D91B5C] dark:text-rose-400 stroke-[2.5]" />
                </div>

                <h3 className="font-sans font-black text-2xl text-zinc-900 dark:text-white tracking-tight">
                  {translations[language].logoutTitle}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-1.5 px-2 max-w-[280px]">
                  {translations[language].logoutDesc}
                </p>

                {/* Buttons */}
                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={handleConfirmLogOut}
                    className="w-full py-3.5 rounded-2xl bg-[#D91B5C] hover:bg-[#c0144e] text-white font-sans font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-rose-500/10 active:scale-[0.98]"
                  >
                    {translations[language].yesLogOut}
                  </button>
                  <button
                    onClick={() => setShowConfirmLogout(false)}
                    className="w-full py-3 rounded-2xl bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-all active:scale-[0.98]"
                  >
                    {translations[language].cancel}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* About Yatrify ("Meet the Team") Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAboutModal(false)}
              className="absolute inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-[36px] shadow-2xl z-50 p-6 border border-neutral-100 dark:border-zinc-800"
            >
              <div className="flex flex-col items-start text-left">
                {/* Title */}
                <h3 className="font-sans font-black text-2xl text-zinc-900 dark:text-white tracking-tight mb-4">
                  {translations[language].meetTeam}
                </h3>

                {/* Inner card supporting both light and dark mode */}
                <div className="w-full space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                  {/* Marcus Mainali - Co-developer and Founder */}
                  <div className="bg-neutral-50/85 dark:bg-zinc-800/40 rounded-3xl p-5 flex flex-col items-center text-center justify-center border border-neutral-100 dark:border-zinc-800/60 shadow-inner">
                    <span className="text-[9px] font-black tracking-widest text-[#D91B5C] dark:text-rose-400 uppercase">
                      {language === "ne" ? "सह-विकासकर्ता र संस्थापक" : "Co-developer & Founder"}
                    </span>
                    <h4 className="font-sans font-black text-xl text-zinc-800 dark:text-white tracking-tight mt-1 mb-2">
                      Marcus Mainali
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed max-w-[240px]">
                      {translations[language].founderDesc}
                    </p>
                  </div>

                  {/* Co-developers list/grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Chhiring Tamang */}
                    <div className="bg-neutral-50/60 dark:bg-zinc-800/20 rounded-2xl p-4 flex flex-col items-center text-center justify-center border border-neutral-100/80 dark:border-zinc-800/40 shadow-sm">
                      <span className="text-[8px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                        {language === "ne" ? "सह-विकासकर्ता" : "Co-developer"}
                      </span>
                      <h5 className="font-sans font-black text-sm text-zinc-800 dark:text-white tracking-tight mt-1">
                        Chhiring Tamang
                      </h5>
                    </div>

                    {/* Samrat Jung Hamal */}
                    <div className="bg-neutral-50/60 dark:bg-zinc-800/20 rounded-2xl p-4 flex flex-col items-center text-center justify-center border border-neutral-100/80 dark:border-zinc-800/40 shadow-sm">
                      <span className="text-[8px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                        {language === "ne" ? "सह-विकासकर्ता" : "Co-developer"}
                      </span>
                      <h5 className="font-sans font-black text-sm text-zinc-800 dark:text-white tracking-tight mt-1 font-sans">
                        Samrat Jung Hamal
                      </h5>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowAboutModal(false)}
                  className="w-full mt-6 py-3.5 rounded-2xl bg-[#D91B5C] hover:bg-[#c0144e] text-white font-sans font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-rose-500/10 active:scale-[0.98]"
                >
                  {translations[language].close}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageModal(false)}
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
              <div className="flex flex-col">
                <h3 className="font-sans font-black text-2xl text-zinc-900 dark:text-white tracking-tight mb-4 text-center">
                  {translations[language].language}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {/* English option */}
                  <button
                    onClick={() => {
                      onChangeLanguage("en");
                      setShowLanguageModal(false);
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      language === "en"
                        ? "border-[#D91B5C] bg-rose-50/50 dark:bg-rose-950/20 text-[#D91B5C] dark:text-rose-400"
                        : "border-neutral-100 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <span className="font-extrabold text-sm">English</span>
                    {language === "en" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D91B5C] dark:bg-rose-400" />
                    )}
                  </button>

                  {/* Nepali option */}
                  <button
                    onClick={() => {
                      onChangeLanguage("ne");
                      setShowLanguageModal(false);
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      language === "ne"
                        ? "border-[#D91B5C] bg-rose-50/50 dark:bg-rose-950/20 text-[#D91B5C] dark:text-rose-400"
                        : "border-neutral-100 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <span className="font-extrabold text-sm">नेपाली (Nepali)</span>
                    {language === "ne" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D91B5C] dark:bg-rose-400" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="w-full mt-6 py-3 rounded-2xl bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-all"
                >
                  {translations[language].cancel}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
