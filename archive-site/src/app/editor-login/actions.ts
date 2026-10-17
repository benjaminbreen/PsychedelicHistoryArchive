"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authClient, newPasswordSession, PASSWORD_COOKIE, passwordMatches, passwordSignInEnabled } from "@/lib/cms/auth";
export async function signInWithPassword(form: FormData) {
  if (!passwordSignInEnabled()) redirect("/editor-login?error=nopassword");
  if (!passwordMatches(String(form.get("password") || ""))) {
    await new Promise(resolve => setTimeout(resolve, 1200)); // slow down guessing
    redirect("/editor-login?error=password");
  }
  const session = newPasswordSession();
  (await cookies()).set(session.name, session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: session.maxAge });
  redirect("/admin/sources");
}
export async function requestEditorLink(form: FormData) {
  const client = await authClient();
  const origin = process.env.CMS_SITE_URL;
  if (!client || !origin) redirect("/editor-login?error=setup");
  const email = String(form.get("email") || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/editor-login?error=email");
  const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${origin.replace(/\/$/, "")}/auth/editor` } });
  if (error) redirect("/editor-login?error=send");
  redirect("/editor-login?sent=1");
}
export async function signOutEditor() {
  (await cookies()).delete(PASSWORD_COOKIE);
  const client = await authClient(); if (client) await client.auth.signOut();
  redirect("/editor-login");
}
