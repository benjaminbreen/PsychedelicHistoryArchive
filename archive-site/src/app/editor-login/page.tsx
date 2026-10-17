import type { Metadata } from "next";
import Link from "next/link";
import { passwordSignInEnabled } from "@/lib/cms/auth";
import { requestEditorLink, signInWithPassword } from "./actions";
import "@/app/admin/cms.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editor sign in", robots: { index: false, follow: false } };
export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams;
  const messages: Record<string, string> = { setup: "Editor sign-in has not been configured yet. Ask the project owner to connect Supabase and set CMS_SITE_URL.", email: "Enter a valid email address.", send: "The sign-in link couldn’t be sent. Check that this email has been invited, then try again.", access: "This account does not have editor access. Ask the project owner to invite you.", expired: "This link has expired. Request a new sign-in link.", password: "That password isn’t right.", nopassword: "Password sign-in isn’t switched on for this site." };
  const password = passwordSignInEnabled();
  const emailLinks = Boolean(process.env.CMS_SITE_URL);
  return <main className="cms-shell" style={{ padding: 25 }}><div className="cms-card cms-login"><Link className="cms-brand" href="/">Psychedelic History Archive</Link><h1>Editor sign in</h1>{params.sent ? <p className="cms-success">Check your email for a sign-in link. Open it in this browser to continue.</p> : <>
    {password && <form action={signInWithPassword}><label>Workspace password<input autoFocus required type="password" name="password" autoComplete="current-password" /></label><button className="cms-primary">Sign in</button></form>}
    {(emailLinks || !password) && <>{password && <p className="cms-field-help" style={{ margin: "26px 0 12px" }}>Invited editors can sign in with an email link instead.</p>}{!password && <p>Use your invited email address. We’ll send you a link; there’s no password to remember.</p>}<form action={requestEditorLink}><label>Email address<input autoFocus={!password} required type="email" name="email" autoComplete="email" /></label><button className={password ? "" : "cms-primary"}>Send sign-in link</button></form></>}
  </>}{params.error && <p className="cms-error" role="alert">{messages[params.error] || messages.expired}</p>}<Link className="cms-field-help" style={{ marginTop: 25 }} href="/archive">Return to the public archive →</Link></div></main>;
}
