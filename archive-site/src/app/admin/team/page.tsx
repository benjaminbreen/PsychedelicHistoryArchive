import { requireEditor, localWorkspace } from "@/lib/cms/auth";
import { getAdminSupabaseClient } from "@/lib/admin-cms";
import { inviteEditor } from "./actions";
export default async function Team({ searchParams }: { searchParams: Promise<{ invited?: string; error?: string }> }) {
  const editor = await requireEditor(); const params = await searchParams;
  const client = !localWorkspace && getAdminSupabaseClient();
  const { data } = client ? await client.from("editor_profiles").select("display_name, role").order("display_name") : { data: [] };
  return <div style={{ maxWidth: 760 }}><div className="cms-heading"><div><h1>Editors & access</h1><p>Invited editors can prepare drafts, preview, and publish sources.</p></div></div><div className="cms-card">{data?.map((p, i) => <div key={i} className="cms-person">{p.display_name}<span className="cms-badge">{p.role}</span></div>)}{!client && <p>Connect Supabase to invite collaborators. The local workspace is available on this computer.</p>}{params.invited && <p className="cms-success" role="status">Invitation sent. Your colleague can sign in from the email link.</p>}{params.error && <p className="cms-error" role="alert">{params.error === "profile" ? "The invitation was sent, but editor access could not be saved. Add their user ID to editor_profiles before they sign in." : "The invitation could not be completed. Check the email, Supabase email settings, and CMS_SITE_URL."}</p>}{editor.role === "owner" && client && <form action={inviteEditor} style={{ marginTop: 24 }}><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><button className="cms-primary">Invite editor</button></form>}</div></div>;
}
