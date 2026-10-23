import Link from "next/link";
import { requireEditor } from "@/lib/cms/auth";
import { changePassword } from "./actions";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const editor = await requireEditor();
  const params = await searchParams;
  const messages: Record<string, string> = {
    named: "Sign in with your individual account to change its password.",
    length: "Use a password between 12 and 128 characters.",
    match: "The new passwords do not match.",
    current: "Your current password isn’t right.",
    save: "The password could not be changed. Try again, or ask Benjamin Breen for a reset."
  };
  return <div style={{ maxWidth: 600 }}>
    <div className="cms-heading"><div><h1>My account</h1><p>{editor.name}</p></div></div>
    <div className="cms-card">
      {params.saved && <p className="cms-success" role="status">Your password has been changed.</p>}
      {params.error && <p className="cms-error" role="alert">{messages[params.error] || messages.save}</p>}
      {editor.id ? <form action={changePassword}>
        <h2>Change password</h2>
        <label>Current password<input name="current_password" type="password" autoComplete="current-password" required /></label>
        <label>New password<input name="new_password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
        <label>Confirm new password<input name="confirm_password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
        <p className="cms-field-help">Use at least 12 characters. A few unrelated words make a good password.</p>
        <button className="cms-primary">Change password</button>
      </form> : <p>You’re using the owner backup. <Link href="/editor-login">Sign in with your individual account</Link> to change its password.</p>}
    </div>
  </div>;
}
