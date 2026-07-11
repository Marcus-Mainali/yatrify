import { createClient } from "@supabase/supabase-js";
import { Booking } from "../types.ts";

let supabaseClient: any = null;

// Lazy initialization of Supabase client to prevent startup crashes if keys are not set yet.
export function getSupabaseClient() {
  if (supabaseClient !== null) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ SUPABASE_URL or SUPABASE_KEY is missing. Supabase API is running in offline/in-memory mode.");
    supabaseClient = false; // Mark as disabled
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });
    console.log("✅ Supabase client successfully initialized.");
    return supabaseClient;
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error);
    supabaseClient = false;
    return null;
  }
}

// In-memory fallback database for development when Supabase is not configured
export const localDb = {
  bookings: [] as Booking[],
  favorites: [] as string[],
};

// Disable Supabase client and force local fallback mode
export function disableSupabaseClient() {
  console.info("🔌 Dynamically disabling Supabase client and falling back to in-memory local storage.");
  supabaseClient = false;
}
