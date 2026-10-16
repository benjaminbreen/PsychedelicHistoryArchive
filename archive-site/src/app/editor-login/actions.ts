"use server";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/cms/auth";
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
  const client = await authClient(); if (client) await client.auth.signOut();
  redirect("/editor-login");
}
