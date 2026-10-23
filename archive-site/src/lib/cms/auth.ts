import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSupabaseClient, isAdminEnabled } from "@/lib/admin-cms";

export const localWorkspace = process.env.NODE_ENV === "development" && process.env.CMS_LOCAL_DATA === "true";
export type Editor = { id: string | null; name: string; role: "owner" | "editor"; via?: "password" };

// Shared-password sign-in: one workspace password (CMS_SHARED_PASSWORD, set in the
// deployment's environment, never in the repository) opens the workspace as owner.
// The session cookie is an HMAC over its issue time and a hash of the password, so
// changing the password signs out backup sessions. Named accounts use Supabase
// password sessions and keep their own names and roles.
export const PASSWORD_COOKIE = "phs_workspace";
const SESSION_DAYS = 30;
const sharedPassword = () => process.env.CMS_SHARED_PASSWORD || "";
const sessionSecret = () => process.env.CMS_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const sha = (value: string) => createHash("sha256").update(value).digest();
const signSession = (issued: string) => createHmac("sha256", sessionSecret()).update(`${issued}.${sha(sharedPassword()).toString("hex")}`).digest("base64url");

export function passwordSignInEnabled() {
  return Boolean(sharedPassword() && sessionSecret());
}

export function passwordMatches(input: string) {
  return passwordSignInEnabled() && timingSafeEqual(sha(input), sha(sharedPassword()));
}

export function newPasswordSession() {
  const issued = String(Date.now());
  return { name: PASSWORD_COOKIE, value: `${issued}.${signSession(issued)}`, maxAge: SESSION_DAYS * 86_400 };
}

async function passwordEditor(): Promise<Editor | null> {
  if (!passwordSignInEnabled()) return null;
  const [issued, mac] = ((await cookies()).get(PASSWORD_COOKIE)?.value || "").split(".");
  if (!issued || !mac || !(Date.now() - Number(issued) < SESSION_DAYS * 86_400_000)) return null;
  const expected = Buffer.from(signSession(issued));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return { id: null, name: process.env.CMS_SHARED_EDITOR_NAME || "Archive editor", role: "owner", via: "password" };
}

export async function authClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const jar = await cookies();
  return createServerClient(url, key, { cookieOptions: { secure: process.env.NODE_ENV === "production", httpOnly: true, sameSite: "lax", path: "/" }, cookies: {
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
  if (client && admin) {
    const { data: { user }, error } = await client.auth.getUser();
    if (!error && user) {
      const { data } = await admin.from("editor_profiles").select("display_name, role").eq("user_id", user.id).single();
      // A named account takes precedence over a leftover shared-owner cookie.
      // Accounts without an editor profile must not inherit backup access.
      if (!data || !["owner", "editor"].includes(data.role)) return null;
      return { id: user.id, name: data.display_name, role: data.role };
    }
  }
  return passwordEditor();
}

export async function requireEditor(): Promise<Editor> {
  const editor = await getEditor();
  if (!editor) redirect("/editor-login");
  return editor;
}
