import { createClient } from "@supabase/supabase-js";

// Supabase configuration with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy initialization of Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  // Only initialize client when actually needed and when we have config
  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  if (!supabaseClient) {
    throw new Error(
      "Supabase client not initialized. Check your environment variables."
    );
  }

  return supabaseClient;
};

// Define the item type
export interface SupabaseItem {
  id?: number;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  image_url?: string;
  owner_id: string; // Using string to match Firebase user IDs
  owner_name: string;
  status: string;
  created_at?: string;
}
