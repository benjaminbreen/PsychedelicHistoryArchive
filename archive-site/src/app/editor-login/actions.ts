"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authClient, newPasswordSession, PASSWORD_COOKIE, passwordMatches, passwordSignInEnabled } from "@/lib/cms/auth";
import { getAdminSupabaseClient } from "@/lib/admin-cms";

export async function signInEditor(form: FormData) {
  const client = await authClient();
  const admin = getAdminSupabaseClient();
  if (!client || !admin) redirect("/editor-login?error=setup");
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email || !password) redirect("/editor-login?error=credentials");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    redirect("/editor-login?error=credentials");
  }
  const { data: profile, error: profileError } = await admin.from("editor_profiles").select("role").eq("user_id", data.user.id).single();
  if (profileError || !profile || !["owner", "editor"].includes(profile.role)) {
    await client.auth.signOut({ scope: "local" });
    redirect("/editor-login?error=access");
  }
  (await cookies()).delete(PASSWORD_COOKIE);
  redirect("/admin/sources");
}
export async function signInWithPassword(form: FormData) {
  if (!passwordSignInEnabled()) redirect("/editor-login?error=nopassword");
  if (!passwordMatches(String(form.get("password") || ""))) {
    await new Promise(resolve => setTimeout(resolve, 1200)); // slow down guessing
    redirect("/editor-login?error=password");
  }
  const client = await authClient();
  if (client) await client.auth.signOut({ scope: "local" });
  const session = newPasswordSession();
  (await cookies()).set(session.name, session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: session.maxAge });
  redirect("/admin/sources");
}
export async function signOutEditor() {
  (await cookies()).delete(PASSWORD_COOKIE);
  const client = await authClient(); if (client) await client.auth.signOut();
  redirect("/editor-login");
}
