import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminEnabled } from "@/lib/admin-cms";
import { requireEditor, localWorkspace } from "@/lib/cms/auth";
import { CmsNav } from "@/components/admin/cms-nav";
import { signOutEditor } from "@/app/editor-login/actions";
import "./cms.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editorial workspace | Psychedelic History Archive", robots: { index: false, follow: false, nocache: true } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminEnabled) notFound();
  const editor = await requireEditor();
  return <div className="cms-shell"><aside className="cms-sidebar"><div><Link href="/admin/sources" className="cms-brand">Psychedelic<br />History Archive</Link><span className="cms-kicker">Editorial workspace</span></div><CmsNav /><div className="cms-sidebar-footer"><Link href="/admin/guide">How to contribute</Link><Link href="/archive" target="_blank">Visit public archive ↗</Link><details><summary>Maintenance</summary><Link href="/admin/workbench">Import reports</Link><Link href="/admin/qa">Source checks</Link></details><div className="cms-user">{editor.name}{editor.role === "owner" && <Link href="/admin/team">Editors & access</Link>}{(editor.id || editor.via === "password") && <form action={signOutEditor}><button className="cms-quiet">Sign out</button></form>}</div></div></aside><main className="cms-main">{localWorkspace && <div className="cms-local-notice"><strong>Local workspace.</strong> Using the repository’s staged sources. Saves and publishing stay on this computer; the public archive is unchanged.</div>}{children}</main></div>;
}
