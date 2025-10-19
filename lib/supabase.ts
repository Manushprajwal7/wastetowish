import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
