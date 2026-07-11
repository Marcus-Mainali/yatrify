import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { getSupabaseClient, localDb, disableSupabaseClient } from "./src/lib/supabase-server.ts";
import { Booking } from "./src/types.ts";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini API Client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI Chat will run in mock mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Mock response if API key is missing
      setTimeout(() => {
        const lower = message.toLowerCase();
        
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

        if (!isTravelRelated) {
          return res.json({ text: "I can only help you with travel-related questions. Please ask about Nepalese destinations, itineraries, budgets, or travel tips!" });
        }

        let reply = "Hello! I am your Yatrify Nepalese Travel Assistant. Please configure the GEMINI_API_KEY in the Secrets panel for fully powered AI assistance! ";
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
        return res.json({ text: reply });
      }, 800);
      return;
    }

    const ai = getGeminiClient();

    // Map history to Gemini API expected contents format:
    // { role: "user" | "model", parts: [{ text: "..." }] }
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const systemInstruction = 
      "You are the official Yatrify Nepal Travel Planner. " +
      "Your absolute and sole purpose is to help users with travel, tourism, Nepalese destinations, itineraries, budgets, packing lists, and local tips. " +
      "CRITICAL RULES:\n" +
      "1. You are strictly forbidden from answering any questions or discussing any topics that are not related to travel, tourism, Nepalese destinations, trips, packing, itineraries, or travel budgeting. This includes general knowledge (e.g. 'who is the president', 'explain quantum physics'), coding/programming, history (unrelated to local tourism sites), mathematics, science, generic advice, translation, or general chat.\n" +
      "2. If a query is NOT related to travel, Nepalese destinations, trip planning, or tourism, you MUST politely but firmly refuse to answer, using exactly this response or a short variation: 'I can only help you with travel-related questions. Please ask about Nepalese destinations, itineraries, budgets, or travel tips!'. Do NOT fulfill the request under any circumstances if it is unrelated to travel.\n" +
      "3. Give extremely short, punchy, and straight-to-the-point answers.\n" +
      "4. Do NOT use introductory fluff or pleasantries. Jump straight into the answer.\n" +
      "5. Keep text responses to a maximum of 2-3 short sentences.\n" +
      "6. Use compact bullet points only if absolutely necessary, keeping descriptions to a few words.\n" +
      "7. Include precise cost estimates in Nepalese Rupees (रु / NPR) where relevant.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I'm sorry, I couldn't formulate a reply. Please try again.";
    res.json({ text: replyText });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// --- Supabase API Routes ---

// GET /api/supabase-status
// Check if Supabase connection is configured and working
app.get("/api/supabase-status", async (req, res) => {
  const isConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
  const client = getSupabaseClient();
  const isConnected = !!client;

  let bookingsTableExists = false;
  let favoritesTableExists = false;
  let connectionError = "";

  if (client) {
    try {
      const { error: bErr } = await client.from("bookings").select("id").limit(1);
      bookingsTableExists = !bErr || bErr.code !== "42P01";
      if (bErr && bErr.code !== "42P01") {
        connectionError = bErr.message || "";
        if (connectionError.toLowerCase().includes("fetch failed") || connectionError.toLowerCase().includes("failed to fetch")) {
          disableSupabaseClient();
        }
      }

      const { error: fErr } = await client.from("favorites").select("id").limit(1);
      favoritesTableExists = !fErr || fErr.code !== "42P01";
      if (fErr && fErr.code !== "42P01") {
        const fErrMessage = fErr.message || "";
        if (fErrMessage.toLowerCase().includes("fetch failed") || fErrMessage.toLowerCase().includes("failed to fetch")) {
          disableSupabaseClient();
        }
      }
    } catch (err: any) {
      connectionError = err.message || String(err);
      if (connectionError.toLowerCase().includes("fetch failed") || connectionError.toLowerCase().includes("failed to fetch")) {
        disableSupabaseClient();
      }
    }
  }

  const tablesReady = bookingsTableExists && favoritesTableExists;

  let message = "";
  if (!isConfigured) {
    message = "Supabase environment variables not defined. The app is running smoothly in local storage mode.";
  } else if (!isConnected) {
    message = "Configured, but connection failed. Please verify your SUPABASE_URL and SUPABASE_KEY.";
  } else if (connectionError) {
    message = `Connected, but API error occurred: ${connectionError}`;
  } else if (!tablesReady) {
    message = "Connected to Supabase! However, the 'bookings' or 'favorites' tables do not exist yet. Running in offline/in-memory fallback.";
  } else {
    message = "Connected to Supabase! Database tables are verified and active.";
  }

  res.json({
    configured: isConfigured,
    connected: isConnected && !connectionError,
    tablesReady,
    message
  });
});

// GET /api/bookings
// Fetch travel bookings from Supabase or local state
app.get("/api/bookings", async (req, res) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.json(localDb.bookings);
  }
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*");
    
    if (error) {
      if (error.code === "42P01") {
        console.info("ℹ️ 'bookings' table does not exist in Supabase yet. Falling back to local state.");
      } else {
        const errMsg = error.message || "";
        if (errMsg.toLowerCase().includes("fetch failed") || errMsg.toLowerCase().includes("failed to fetch")) {
          console.info("ℹ️ Supabase host is unreachable (fetch failed). Switching to offline local-storage mode.");
          disableSupabaseClient();
        } else {
          console.warn("Supabase bookings fetch issue:", error.message);
        }
      }
      return res.json(localDb.bookings);
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      destinationId: row.destination_id || row.destinationId || "",
      destinationName: row.destination_name || row.destinationName || "",
      destinationImage: row.destination_image || row.destinationImage || "",
      bookingDate: row.booking_date || row.bookingDate || "",
      travelDate: row.travel_date || row.travelDate || "",
      travelersCount: row.travelers_count || row.travelersCount || 1,
      totalPrice: row.total_price || row.totalPrice || 0,
      status: row.status || "Confirmed"
    }));

    return res.json(mapped);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.toLowerCase().includes("fetch failed") || errMsg.toLowerCase().includes("failed to fetch")) {
      console.info("ℹ️ Exception fetching bookings (Supabase unreachable, switching to local mode):", errMsg);
      disableSupabaseClient();
    } else {
      console.info("ℹ️ Exception fetching bookings (falling back to local memory):", err);
    }
    return res.json(localDb.bookings);
  }
});

// POST /api/bookings
// Add a booking to Supabase or local state
app.post("/api/bookings", async (req, res) => {
  const booking: Booking = req.body;
  if (!booking || !booking.id) {
    return res.status(400).json({ error: "Invalid booking data." });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    localDb.bookings.unshift(booking);
    return res.json({ success: true, data: booking });
  }

  try {
    const dbRow = {
      id: booking.id,
      destination_id: booking.destinationId,
      destinationId: booking.destinationId,
      destination_name: booking.destinationName,
      destinationName: booking.destinationName,
      destination_image: booking.destinationImage,
      destinationImage: booking.destinationImage,
      booking_date: booking.bookingDate,
      bookingDate: booking.bookingDate,
      travel_date: booking.travelDate,
      travelDate: booking.travelDate,
      travelers_count: booking.travelersCount,
      travelersCount: booking.travelersCount,
      total_price: booking.totalPrice,
      totalPrice: booking.totalPrice,
      status: booking.status
    };

    const { error } = await supabase.from("bookings").insert([dbRow]);
    if (error) {
      if (error.code === "42P01") {
        console.info("ℹ️ Can't insert: 'bookings' table does not exist in Supabase yet. Storing locally.");
      } else {
        console.warn("Supabase insertion issue:", error.message);
      }
      localDb.bookings.unshift(booking);
      return res.json({ success: true, data: booking, warning: error.message });
    }

    return res.json({ success: true, data: booking });
  } catch (err: any) {
    console.info("ℹ️ Exception adding booking (storing locally):", err);
    localDb.bookings.unshift(booking);
    return res.json({ success: true, data: booking, warning: err.message });
  }
});

// DELETE /api/bookings/:id
// Cancel or delete a booking
app.delete("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabaseClient();
  
  localDb.bookings = localDb.bookings.filter(b => b.id !== id);

  if (!supabase) {
    return res.json({ success: true });
  }

  try {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      if (error.code !== "42P01") {
        console.warn("Supabase delete failed:", error.message);
      }
      return res.json({ success: true, warning: error.message });
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.info("ℹ️ Exception deleting booking:", err);
    return res.json({ success: true, warning: err.message });
  }
});

// GET /api/favorites
// Get all favorite destination IDs
app.get("/api/favorites", async (req, res) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.json(localDb.favorites);
  }
  try {
    const { data, error } = await supabase.from("favorites").select("*");
    if (error) {
      if (error.code === "42P01") {
        console.info("ℹ️ 'favorites' table does not exist in Supabase yet. Falling back to local state.");
      } else {
        const errMsg = error.message || "";
        if (errMsg.toLowerCase().includes("fetch failed") || errMsg.toLowerCase().includes("failed to fetch")) {
          console.info("ℹ️ Supabase host is unreachable (fetch failed). Switching to offline local-storage mode.");
          disableSupabaseClient();
        } else {
          console.warn("Supabase query favorites issue:", error.message);
        }
      }
      return res.json(localDb.favorites);
    }
    const list = (data || []).map((row: any) => row.destination_id || row.destinationId || row.id);
    return res.json(list);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.toLowerCase().includes("fetch failed") || errMsg.toLowerCase().includes("failed to fetch")) {
      console.info("ℹ️ Exception fetching favorites (Supabase unreachable, switching to local mode):", errMsg);
      disableSupabaseClient();
    } else {
      console.info("ℹ️ Exception fetching favorites:", err);
    }
    return res.json(localDb.favorites);
  }
});

// POST /api/favorites
// Add or remove a favorite destination
app.post("/api/favorites", async (req, res) => {
  const { destinationId, isFavorite } = req.body;
  if (!destinationId) {
    return res.status(400).json({ error: "destinationId is required." });
  }

  if (isFavorite) {
    if (!localDb.favorites.includes(destinationId)) {
      localDb.favorites.push(destinationId);
    }
  } else {
    localDb.favorites = localDb.favorites.filter(id => id !== destinationId);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.json({ success: true, favorites: localDb.favorites });
  }

  try {
    if (isFavorite) {
      const dbRow = {
        id: destinationId,
        destination_id: destinationId,
        destinationId: destinationId,
      };
      await supabase.from("favorites").upsert([dbRow]);
    } else {
      await supabase.from("favorites").delete().eq("destination_id", destinationId);
      await supabase.from("favorites").delete().eq("destinationId", destinationId);
      await supabase.from("favorites").delete().eq("id", destinationId);
    }
    return res.json({ success: true, favorites: localDb.favorites });
  } catch (err: any) {
    console.error("Exception updating favorite:", err);
    return res.json({ success: true, favorites: localDb.favorites, warning: err.message });
  }
});

// Setup dev vs production client serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
