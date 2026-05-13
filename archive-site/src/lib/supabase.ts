import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabasePublishableKey) &&
  !supabasePublishableKey?.includes("PASTE_");

export function getSupabaseClient() {
  if (!isSupabaseConfigured || !supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false }
  });
}

export function getStoragePublicUrl(storagePath?: string | null) {
  if (!storagePath || !supabaseUrl) return "";
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "archive-assets";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
}
