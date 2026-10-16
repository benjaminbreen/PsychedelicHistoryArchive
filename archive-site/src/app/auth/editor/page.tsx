"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect } from "react";
import "@/app/admin/cms.css";
export default function EditorCallback() {
  useEffect(() => {
    async function finish() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) { location.replace("/editor-login?error=setup"); return; }
      const client = createBrowserClient(url, key);
      const query = new URLSearchParams(location.search); const hash = new URLSearchParams(location.hash.slice(1));
      let error;
      if (query.get("code")) ({ error } = await client.auth.exchangeCodeForSession(query.get("code")!));
      else if (query.get("token_hash")) ({ error } = await client.auth.verifyOtp({ token_hash: query.get("token_hash")!, type: query.get("type") === "invite" ? "invite" : "email" }));
      else if (hash.get("access_token") && hash.get("refresh_token")) ({ error } = await client.auth.setSession({ access_token: hash.get("access_token")!, refresh_token: hash.get("refresh_token")! }));
      else error = new Error("Missing sign-in token.");
      if (error) { location.replace("/editor-login?error=expired"); return; }
      const { data: { user } } = await client.auth.getUser();
      const profile = user && await client.from("editor_profiles").select("role").eq("user_id",user.id).maybeSingle();
      location.replace(profile && profile.data && ["owner","editor"].includes(profile.data.role) ? "/admin/sources" : "/editor-login?error=access");
    }
    void finish();
  }, []);
  return <main className="cms-shell" style={{ padding: 40 }}><p role="status">Signing you in…</p></main>;
}
