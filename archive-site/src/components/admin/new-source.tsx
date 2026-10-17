"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import { addSource, saveSource } from "@/app/admin/cms-actions";
import { uploadFile, attachOriginal } from "./upload";
export function NewSource() {
  const [title, setTitle] = useState(""); const [url, setUrl] = useState(""); const [file, setFile] = useState<File | null>(null);
  const [propose, setPropose] = useState(false); const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [createdId, setCreatedId] = useState("");
  const input = useRef<HTMLInputElement>(null); const router = useRouter();
  return <div style={{ maxWidth: 710, margin: "auto" }}><Link className="cms-back" href="/admin/sources"><ArrowLeft size={15} /> Sources</Link><div className="cms-heading" style={{ marginTop: 25 }}><div><h1>Add a source</h1><p>Start with a title and a link or file. Everything else can come later.</p></div></div><form className="cms-card" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const result = await addSource(title.trim(), url.trim()); if ("error" in result) { setError(result.error || "The source could not be added."); return; }
      setCreatedId(result.id);
      let model = result.model;
      if (file) model = attachOriginal(model, await uploadFile(result.id, file));
      if (propose) model = { ...model, proposal: { status: "proposed", rationale: why.trim(), origin: "manual" } };
      if (file || propose) { const saved = await saveSource(result.id, model, result.version); if ("error" in saved) throw new Error(saved.error); }
      router.push(`/admin/sources/${result.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "The source could not be added."); }
    finally { setBusy(false); }
  }}><label>Title<input autoFocus required maxLength={600} value={title} onChange={e => setTitle(e.target.value)} placeholder="A title you’ll recognize in the source list" /></label><label>Original source link <span className="cms-field-help">Optional if you’re uploading a file</span><input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></label><div className="cms-dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0] || null); }}><Upload size={23} style={{ margin: "auto auto 12px", color: "rgb(var(--archive-violet))" }} />{file ? <div className="cms-row" style={{ justifyContent: "center" }}>{file.name}<button type="button" aria-label="Remove selected file" onClick={() => setFile(null)}><X size={14} /></button></div> : <><p>Drop a PDF or scan here</p><button type="button" style={{ marginTop: 10 }} onClick={() => input.current?.click()}>Choose a file</button></>}<input ref={input} type="file" hidden accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" onChange={e => setFile(e.target.files?.[0] || null)} /><p className="cms-field-help" style={{ marginTop: 10 }}>PDF, JPG, PNG, GIF, or WebP · Up to 50 MB</p></div><label className="cms-propose"><span><input type="checkbox" checked={propose} onChange={e => setPropose(e.target.checked)} /> Propose this source for the team to review</span><span className="cms-field-help">It appears under Proposals for every editor. Nothing is public until someone publishes it.</span></label>{propose && <label>Why it belongs in the archive<textarea rows={3} value={why} onChange={e => setWhy(e.target.value)} placeholder="What it is, and what makes it worth adding" /></label>}<p className="cms-field-help">This creates a private draft. You can paste reading text on the next screen.</p>{error && <p role="alert" className="cms-error">{error}</p>}<div className="cms-row" style={{ justifyContent: "flex-end", marginTop: 23 }}><Link className="cms-button" href="/admin/sources">Cancel</Link>{createdId ? <Link className="cms-button cms-primary" href={`/admin/sources/${createdId}`}>Open the created draft</Link> : <button className="cms-primary" disabled={busy || !title.trim()}>{busy ? "Creating draft…" : "Create draft"}</button>}</div></form></div>;
}
