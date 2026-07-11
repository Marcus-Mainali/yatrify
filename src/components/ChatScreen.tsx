import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertCircle, Bot, User, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Message } from "../types";

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Namaste! 🙏 I am your Yatrify Travel Planner. I can help you draft customized itineraries, estimate travel budgets in NPR, list packing lists, or give local custom tips for Kulekhani, Badimalika, Kuri, Ramaroshan, and Ghandruk! What are we planning today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10) // Pass last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response. Please try again.");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      console.error("Chat Error:", error);
      setErrorMessage("Could not connect to Gemini Travel Server. Running in offline fallback...");
      
      // Fallback response
      setTimeout(() => {
        const lower = textToSend.toLowerCase();

        // Check if query is travel/tourism/Nepal related
        const travelKeywords = [
          "travel", "trip", "tour", "visit", "destination", "itinerary", "budget", 
          "npr", "cost", "pack", "hotel", "stay", "flight", "bus", "trek", "hike", 
          "mountain", "lake", "temple", "stupa", "nepal", "pokhara", "kathmandu", 
          "kulekhani", "kuri", "kalinchowk", "ghandruk", "badimalika", "ramaroshan", 
          "where", "how", "when", "route", "weather", "season", "safari", "scenic", 
          "view", "monastery", "national park", "lumbini", "durbar"
        ];
        
        const isTravelRelated = travelKeywords.some(keyword => lower.includes(keyword));

        let reply = "";
        if (!isTravelRelated) {
          reply = "I can only help you with travel-related questions. Please ask about Nepalese destinations, itineraries, budgets, or travel tips!";
        } else {
          reply = "Hello! Running in offline mode. Please define the GEMINI_API_KEY inside the Secrets panel. ";
          if (lower.includes("kulekhani")) {
            reply += "Kulekhani is famous for Indra Sarobar lake, boating, and fresh local fish. It's an easy 1-2 day trip!";
          } else if (lower.includes("kuri") || lower.includes("kalinchowk")) {
            reply += "Kuri Village is beautiful, especially in winter for snow. You can take the cable car up to Kalinchowk Bhagwati temple.";
          } else if (lower.includes("ghandruk")) {
            reply += "Ghandruk offers spectacular views of Annapurna and Machhapuchhre. The local Gurung culture and organic food are amazing.";
          } else if (lower.includes("badimalika")) {
            reply += "Badimalika trek is challenging but absolutely mystical with endless green rolling pastures at 4,200m altitude.";
          } else if (lower.includes("ramaroshan")) {
            reply += "Ramaroshan in Achham features 12 highland lakes and 18 lush meadows. Excellent for off-the-beaten-path camping.";
          } else {
            reply += "Nepal offers beautiful destinations like Ghandruk, Kuri Village, Kulekhani, Ramaroshan, and Badimalika! What are you planning next?";
          }
        }

        const fallbackMsg: Message = {
          id: Math.random().toString(36).substr(2, 9),
          sender: "assistant",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Sample prompt chips to guide users
  const SUGGESTIONS = [
    "Draft a 2-day itinerary for Kulekhani",
    "What is the best season for Badimalika?",
    "Local tips & customs for Ghandruk",
    "List packing list for Kalinchowk"
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden transition-colors duration-300 relative">
      
      {/* Header Panel */}
      <div className="px-6 pt-2 pb-3.5 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div>
            <h2 className="font-black text-sm text-[#D91B5C] dark:text-rose-400 tracking-tight leading-none">Yatrify Travel Guide</h2>
          </div>
        </div>
      </div>

      {/* Main content wrapper with blur overlay */}
      <div className="flex-1 flex flex-col overflow-hidden filter blur-[4px] pointer-events-none select-none opacity-45">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? "self-start" : "self-end ml-auto flex-row-reverse"}`}
              >
                {/* Profile Bubble Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-sm ${
                  isAI ? "bg-rose-500 text-white" : "bg-neutral-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                }`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Chat Bubble Text */}
                <div className={`p-4 rounded-[22px] text-[11px] leading-relaxed shadow-sm font-medium ${
                  isAI 
                    ? "bg-neutral-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm whitespace-pre-wrap" 
                    : "bg-rose-500 text-white rounded-tr-sm"
                }`}>
                  {msg.text}
                  <p className={`text-[8px] font-bold mt-1.5 text-right ${isAI ? "text-zinc-400 dark:text-zinc-500" : "text-white/60"}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing bubble */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] self-start">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-[22px] rounded-tl-sm bg-neutral-50 dark:bg-zinc-800 flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Error notification banner */}
          {errorMessage && (
            <div className="flex gap-2 items-center bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-[10px] font-bold text-amber-800 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Anchor point to auto-scroll */}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggested chips panel (only shows when user is starting or idle) */}
        <div className="px-6 py-2 border-t border-neutral-50 dark:border-zinc-800/30 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex gap-2 whitespace-nowrap">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                className="px-3.5 py-1.5 bg-neutral-50 dark:bg-zinc-800 rounded-full border border-neutral-100 dark:border-zinc-800 text-[9px] font-extrabold text-zinc-600 dark:text-zinc-300 flex items-center gap-1"
              >
                {sug}
                <ArrowRight className="w-2.5 h-2.5 text-rose-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Form input bar */}
        <div className="p-4 bg-white/95 dark:bg-zinc-900/95 border-t border-neutral-100 dark:border-zinc-800/80 flex items-center gap-2.5 shrink-0">
          <input
            type="text"
            placeholder="Ask Yatrify Guide anything..."
            disabled
            className="flex-1 h-11 px-4 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-100 dark:border-zinc-800 text-[11px] font-semibold text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            disabled
            className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/10"
          >
            <Send className="w-4 h-4 fill-white stroke-white" />
          </button>
        </div>
      </div>

      {/* Premium Coming Soon Overlay Dialogue */}
      <div className="absolute inset-0 top-[53px] z-50 flex items-center justify-center p-6 bg-transparent">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border border-neutral-100 dark:border-zinc-800/80 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center overflow-hidden flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
            <Sparkles className="w-7 h-7 fill-rose-500" />
          </div>
          
          <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black tracking-widest rounded-full uppercase mb-3">
            Preview Coming Soon
          </span>
          
          <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight mb-2">
            Yatrify Travel Planner
          </h3>
          
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
            Our smart travel companion is cooking!
          </p>
        </motion.div>
      </div>

    </div>
  );
}
