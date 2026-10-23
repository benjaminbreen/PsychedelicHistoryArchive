import { redirect } from "next/navigation";
import { requireEditor, localWorkspace } from "@/lib/cms/auth";
import { getAdminSupabaseClient } from "@/lib/admin-cms";
import { resetEditorPassword } from "./actions";

export default async function Team({ searchParams }: { searchParams: Promise<{ reset?: string; error?: string }> }) {
  const editor = await requireEditor();
  if (editor.role !== "owner") redirect("/admin/sources");
  const params = await searchParams;
  const client = !localWorkspace && getAdminSupabaseClient();
  const { data, error } = client ? await client.from("editor_profiles").select("user_id, display_name, role").order("display_name") : { data: [], error: null };
  if (error) throw new Error("The account list could not be loaded.");
  const people = await Promise.all((data || []).map(async profile => {
    const user = client && await client.auth.admin.getUserById(profile.user_id);
    return { ...profile, email: user && user.data.user?.email };
  }));
  const messages: Record<string, string> = {
    account: "That editor account could not be found.",
    owner: "Use My account to change your own password.",
    length: "Use a password between 12 and 128 characters.",
    match: "The new passwords do not match.",
    save: "The password could not be reset. Please try again."
  };
  return <div style={{ maxWidth: 760 }}>
    <div className="cms-heading"><div><h1>Editors & access</h1><p>Each person signs in with their email address and password.</p></div></div>
    {params.reset && <p className="cms-success" role="status">Password reset. Share the new password privately with that person.</p>}
    {params.error && <p className="cms-error" role="alert">{messages[params.error] || messages.save}</p>}
    <div className="cms-card">
      {people.map(person => <div key={person.user_id} style={{ padding: "16px 0" }}>
        <div className="cms-person">{person.display_name}<span className="cms-badge">{person.role}</span></div>
        <p className="cms-field-help">{person.email}</p>
        {client && (person.role === "editor" || editor.via === "password") && <details>
          <summary>Reset password for {person.display_name}</summary>
          <form action={resetEditorPassword} style={{ marginTop: 16 }}>
            <input type="hidden" name="user_id" value={person.user_id} />
            <label>New password for {person.display_name}<input name="new_password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
            <label>Confirm password for {person.display_name}<input name="confirm_password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
            <button>Reset password</button>
          </form>
        </details>}
      </div>)}
      {!client && <p>Account management is available on the shared archive.</p>}
    </div>
  </div>;
}
