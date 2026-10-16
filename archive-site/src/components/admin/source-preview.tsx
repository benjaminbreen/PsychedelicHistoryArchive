"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SourceReader } from "@/components/reader/source-reader";
import { transcriptParagraphs } from "@/lib/reader-model";
import { publishSource } from "@/app/admin/cms-actions";
import { publicationProblems, type SourceRecord } from "@/lib/cms/model";
import { CmsModal } from "./cms-modal";
export function SourcePreview({ source, local }: { source: SourceRecord; local: boolean }) {
  const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const router = useRouter();
  const problems = publicationProblems(source.model);
  return <div className="cms-preview"><div className="cms-editor-bar"><Link className="cms-back" href={`/admin/sources/${source.id}`}><ArrowLeft size={15} /> Back to editing</Link><div className="cms-row"><span className="cms-badge">Private preview</span><button className="cms-primary" onClick={() => setConfirm(true)}>{local ? "Publish locally" : source.status === "published" ? "Publish changes" : "Publish"}</button></div></div><p className="cms-field-help">Only editors can see this preview. It uses the same reader as the public archive.</p><div className="cms-preview-reader"><SourceReader source={source.reader} transcript={transcriptParagraphs(source.reader)} stickyTop="71px" /></div>{error && <p className="cms-error" role="alert">{error}</p>}{confirm && <CmsModal title="Publish this version?" onClose={() => !busy && setConfirm(false)}><p>{local ? "Publication stays in the local workspace. The public archive is unchanged." : "Readers will see the version you’ve just reviewed."}</p>{!!problems.length && <div className="cms-error"><ul style={{ listStyle: "disc", paddingLeft: 20 }}>{problems.map(p => <li key={p}>{p}</li>)}</ul></div>}<div className="cms-row"><button onClick={() => setConfirm(false)} disabled={busy}>Keep editing</button><button className="cms-primary" disabled={busy || !!problems.length} onClick={async () => { setBusy(true); const result = await publishSource(source.id, source.version); if ("error" in result) { setError(result.error); setBusy(false); setConfirm(false); } else router.push(`/admin/sources/${source.id}?published=1`); }}>{busy ? "Publishing…" : local ? "Publish locally" : "Publish"}</button></div></CmsModal>}</div>;
}
