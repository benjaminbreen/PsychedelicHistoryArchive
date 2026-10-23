import type { Metadata } from "next";
import Link from "next/link";
import { passwordSignInEnabled } from "@/lib/cms/auth";
import { signInEditor, signInWithPassword } from "./actions";
import "@/app/admin/cms.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editor sign in", robots: { index: false, follow: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const messages: Record<string, string> = {
    setup: "Editor sign-in is not available yet. Ask the project owner for help.",
    credentials: "The email or password isn’t right.",
    access: "This account does not have editor access. Ask the project owner for access.",
    expired: "Your sign-in has expired. Please sign in again.",
    password: "That password isn’t right.",
    nopassword: "Password sign-in isn’t switched on for this site."
  };
  const password = passwordSignInEnabled();

  return <main className="cms-shell" style={{ padding: 25 }}><div className="cms-card cms-login">
    <Link className="cms-brand" href="/">Psychedelic History Archive</Link>
    <h1>Editor sign in</h1>
        <p>Sign in with your editor account.</p>
        <form action={signInEditor}>
          <label>Email address<input autoFocus required type="email" name="email" autoComplete="email" /></label>
          <label>Password<input required type="password" name="password" autoComplete="current-password" /></label>
          <button className="cms-primary">Sign in</button>
        </form>
        <p className="cms-field-help" style={{ marginTop: 16 }}>Forgot your password? Ask Benjamin Breen to reset it.</p>
      {password && <details style={{ marginTop: 26 }}>
        <summary>Owner backup password</summary>
        <form action={signInWithPassword} style={{ marginTop: 16 }}>
          <label>Workspace password<input required type="password" name="password" autoComplete="current-password" /></label>
          <button>Sign in with backup password</button>
        </form>
      </details>}
    {params.error && <p className="cms-error" role="alert">{messages[params.error] || messages.expired}</p>}
    <Link className="cms-field-help" style={{ marginTop: 25 }} href="/archive">Return to the public archive →</Link>
  </div></main>;
}
