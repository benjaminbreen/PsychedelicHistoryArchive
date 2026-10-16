import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSupabaseClient, isAdminEnabled } from "@/lib/admin-cms";

export const localWorkspace = process.env.NODE_ENV === "development" && process.env.CMS_LOCAL_DATA === "true";
export type Editor = { id: string | null; name: string; role: "owner" | "editor" };

export async function authClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const jar = await cookies();
  return createServerClient(url, key, { cookies: {
    getAll: () => jar.getAll(),
    setAll: values => { try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* Server components cannot write; actions and the callback refresh cookies. */ } }
  } });
}

export async function getEditor(): Promise<Editor | null> {
  if (!isAdminEnabled) return null;
  const host = (await headers()).get("host") || "";
  // Development convenience is confined to loopback, never a production bypass.
  if (process.env.NODE_ENV === "development" && /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) return { id: null, name: "Local editor", role: "owner" };
  const client = await authClient();
  const admin = getAdminSupabaseClient();
  if (!client || !admin) return null;
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data } = await admin.from("editor_profiles").select("display_name, role").eq("user_id", user.id).single();
  if (!data || !["owner", "editor"].includes(data.role)) return null;
  return { id: user.id, name: data.display_name, role: data.role };
}

export async function requireEditor(): Promise<Editor> {
  const editor = await getEditor();
  if (!editor) redirect("/editor-login");
  return editor;
}
