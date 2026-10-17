"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, ArrowDown, Eye, Plus, X, FileText, Upload, Check } from "lucide-react";
import { saveSource, publishSource, moveSourceToDrafts, featureSource } from "@/app/admin/cms-actions";
import { publicationProblems, type SourceRecord, type SourceEditModel, type Choices, type Figure, type Section } from "@/lib/cms/model";
import { getStoragePublicUrl } from "@/lib/supabase";
import { ReadingEditor } from "./reading-editor";
import { CmsModal } from "./cms-modal";
import { ProposalPanel } from "./proposal-panel";
import { uploadFile, attachOriginal } from "./upload";

export function SourceEditor({ source, choices, local }: { source: SourceRecord; choices: Choices; local: boolean }) {
  const router = useRouter();
  const [model, setModel] = useState(source.model);
  const [recoveredCopy, setRecoveredCopy] = useState<SourceEditModel | null>(null);
  const [status, setStatus] = useState(source.status);
  const [featured, setFeatured] = useState(source.featured);
  const [saveState, setSaveState] = useState("Saved");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialog, setDialog] = useState<"publish" | "unpublish" | "remove" | null>(null);
  const [removeId, setRemoveId] = useState("");
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("author");
  const [tagQuery, setTagQuery] = useState("");
  const [temporaryImages, setTemporaryImages] = useState<Record<string, string>>({});
  const originalInput = useRef<HTMLInputElement>(null);
  const modelRef = useRef(model);
  const versionRef = useRef(source.version);
  const dirty = useRef(false);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const recoveryKey = `archive-draft:${source.id}`;

  const change = useCallback((update: (current: SourceEditModel) => SourceEditModel) => {
    const next = update(modelRef.current);
    modelRef.current = next; dirty.current = true;
    setModel(next); setSaveState("Unsaved changes"); setError(""); setNotice("");
    try { sessionStorage.setItem(recoveryKey, JSON.stringify({ version: versionRef.current, model: next })); } catch { /* Saving to the server still works if browser storage is full. */ }
  }, [recoveryKey]);

  const save = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) { if (!await inFlight.current) return false; return dirty.current ? save() : true; }
    if (!dirty.current && versionRef.current > 0) return true;
    const operation = (async () => {
      do {
        const snapshot = modelRef.current;
        const serialized = JSON.stringify(snapshot);
        setSaveState("Saving…");
        const result = await saveSource(source.id, snapshot, versionRef.current);
        if ("error" in result) { setError(result.error); setSaveState("Couldn’t save"); return false; }
        versionRef.current = result.version;
        dirty.current = serialized !== JSON.stringify(modelRef.current);
        if (!dirty.current) { setSaveState("Saved"); setError(""); sessionStorage.removeItem(recoveryKey); }
        else { try { sessionStorage.setItem(recoveryKey, JSON.stringify({ version: result.version, model: modelRef.current })); } catch { /* Best effort recovery. */ } }
      } while (dirty.current);
      return true;
    })();
    inFlight.current = operation;
    try { return await operation; }
    catch { setSaveState("Couldn’t save"); setError("The connection was interrupted. Your text is still here. Try saving again."); return false; }
    finally { inFlight.current = null; }
  }, [source.id, recoveryKey]);

  useEffect(() => {
    if (!dirty.current) return;
    const timer = setTimeout(() => { void save(); }, 900);
    return () => clearTimeout(timer);
  }, [model, save]);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(recoveryKey);
      if (stored) {
        const backup = JSON.parse(stored);
        if (backup.version === source.version && JSON.stringify(backup.model) !== JSON.stringify(source.model)) { change(() => backup.model); setNotice("Recovered your unsaved text from this tab."); }
        else if (backup.version !== source.version) setRecoveredCopy(backup.model);
      }
    } catch { /* Invalid recovery data is ignored. */ }
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current || inFlight.current) { e.preventDefault(); } };
    const navigate = async (e: MouseEvent) => {
      const link = (e.target as Element).closest?.("a");
      if (!link || link.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !dirty.current || link.origin !== location.origin || !link.pathname.startsWith("/admin")) return;
      e.preventDefault(); e.stopPropagation();
      if (await save()) router.push(link.pathname + link.search);
    };
    window.addEventListener("beforeunload", warn); document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", navigate, true); };
  }, [source.version, source.model, recoveryKey, change, save, router]);

  const field = (name: string, value: string) => change(m => ({ ...m, document: { ...m.document, [name]: value } }));
  const textField = (name: string, label: string, help?: string, multiline = false) => <label>{label}{multiline ? <textarea rows={3} value={String(model.document[name] ?? "")} onChange={e => field(name, e.target.value)} /> : <input value={String(model.document[name] ?? "")} onChange={e => field(name, e.target.value)} />}{help && <span className="cms-field-help">{help}</span>}</label>;
  const selectField = (name: string, label: string, values: [string, string][]) => <label>{label}<select value={String(model.document[name] || "")} onChange={e => field(name, e.target.value)}>{!values.some(([v]) => v === model.document[name]) && <option value={String(model.document[name] || "")}>{model.document[name] || "Automatic"}</option>}{values.map(([v, label]) => <option value={v} key={v}>{label}</option>)}</select></label>;
  const updateSection = (id: string, update: Partial<Section>) => change(m => ({ ...m, sections: m.sections.map(s => s.id === id ? { ...s, ...update } : s) }));
  const updateFigure = (id: string, key: string, value: string) => change(m => ({ ...m, figures: m.figures.map(f => f.id === id ? { ...f, [key]: value } : f) }));
  const imageUrl = (figure: Figure) => {
    if (temporaryImages[figure.id]) return temporaryImages[figure.id];
    const file = model.files.find(f => f.storage_path === figure.image_path);
    return file ? `/admin/media/${source.id}/${file.id}` : source.reader.figures?.find(f => f.id === figure.id)?.imagePath || getStoragePublicUrl(figure.image_path);
  };
  async function uploadImage(file: File) {
    setUploading(true); setError("");
    try {
      const asset = await uploadFile(source.id, file);
      const id = crypto.randomUUID();
      const figure: Figure = { id, image_path: asset.storage_path, caption: "", credit: "", alt_text: "", token: id, position: (modelRef.current.figures.length + 1) * 10, placement: "inline" };
      setTemporaryImages(urls => ({ ...urls, [id]: URL.createObjectURL(file) }));
      change(m => ({ ...m, files: [...m.files, asset], figures: [...m.figures, figure], document: { ...m.document, access_type: "hosted", hosting_status: m.document.hosting_status === "metadata_only" ? "transcript_only" : m.document.hosting_status } }));
      return figure;
    } catch (e) { setError(e instanceof Error ? e.message : "The image could not be uploaded."); return null; }
    finally { setUploading(false); }
  }
  async function toggleFeatured(next: boolean) {
    setFeatured(next); setError("");
    const result = await featureSource(source.id, next);
    if ("error" in result) { setFeatured(!next); setError(result.error ?? ""); }
  }
  async function navigate(path: string) { if (await save()) router.push(path); }
  async function publish() {
    setBusy(true);
    try {
      if (!await save()) return;
      const result = await publishSource(source.id, versionRef.current);
      if ("error" in result) { setError(result.error); return; }
      versionRef.current = result.version; setStatus("published"); setNotice(local ? "Published in this local workspace. The public archive is unchanged." : "Published. Readers can now see this version."); setDialog(null); router.refresh();
    } finally { setBusy(false); }
  }
  useEffect(() => { if (!dirty.current && source.version >= versionRef.current) { versionRef.current = source.version; modelRef.current = source.model; setModel(source.model); setStatus(source.status); } }, [source.version, source.model, source.status]);
  const problems = publicationProblems(model);
  return <>
    <div className="cms-editor-bar"><button className="cms-quiet cms-back" onClick={() => navigate("/admin/sources")}><ArrowLeft size={15} /> Sources</button><div className="cms-row"><span className="cms-save-status" role="status" aria-live="polite">{saveState === "Saved" && <Check size={12} style={{ display: "inline", marginRight: 5 }} />}{saveState}</span>{saveState === "Couldn’t save" && <button onClick={() => save()}>Try saving again</button>}<button disabled={busy || uploading} onClick={() => navigate(`/admin/sources/${source.id}/preview`)}><Eye size={15} /> Preview</button><button className="cms-primary" disabled={busy || uploading} onClick={() => setDialog("publish")}>{local ? "Publish locally" : status === "published" ? "Publish changes" : "Publish"}</button></div></div>
    {error && <div className="cms-error" role="alert">{error}{/Another editor|another tab|changed since/.test(error) && <button style={{ marginLeft: 12 }} onClick={() => location.reload()}>Load latest version</button>}</div>}{notice && <p role="status" className="cms-success" style={{ marginBottom: 20 }}>{notice}</p>}
    {recoveredCopy && <div className="cms-card" style={{ marginBottom: 20 }}><p>Another editor has saved since your last edit. Your unsaved text from this tab is still available.</p><div className="cms-row" style={{ marginTop: 12 }}><button onClick={() => { const url = URL.createObjectURL(new Blob([JSON.stringify(recoveredCopy,null,2)], { type: "application/json" })); const a = document.createElement("a"); a.href=url; a.download=`${source.slug}-unsaved.json`; a.click(); URL.revokeObjectURL(url); }}>Download my unsaved copy</button><button onClick={() => { setRecoveredCopy(null); sessionStorage.removeItem(recoveryKey); }}>Keep the latest version</button><button onClick={() => { change(() => recoveredCopy); setRecoveredCopy(null); }}>Use my copy as the working draft</button></div><p className="cms-field-help">Using your copy replaces the current private draft. The published source remains unchanged.</p></div>}
    {model.proposal && <ProposalPanel proposal={model.proposal} sourceUrl={String(model.document.source_url || "")} onChange={proposal => change(m => ({ ...m, proposal }))} />}
    <div className="cms-editor-grid"><div className="cms-editor-main">
      <label style={{ marginBottom: 10 }}>Title<textarea rows={2} ref={node => { if (node) { node.style.height = "auto"; node.style.height = `${node.scrollHeight}px`; } }} className="cms-title-input" aria-label="Source title" value={String(model.document.title || "")} onChange={e => field("title", e.target.value)} placeholder="Untitled source" /></label>
      <div className="cms-intro"><label>Introduction <span className="cms-field-help">A short description for readers. Leave blank until you have something useful to say.</span><textarea rows={3} value={String(model.document.summary || "")} onChange={e => change(m => ({ ...m, document: { ...m.document, summary: e.target.value, ...(!e.target.value.trim() ? { abstract: null } : {}) } }))} placeholder="What is this source, and what should readers know about it?" /></label></div>
      {(model.document.translation_text || model.document.translation_language) && <div style={{ marginBottom: 28 }}><h2>Translation{model.document.translation_language ? ` (${model.document.translation_language})` : ""}</h2><p className="cms-field-help">Keep the translation’s attribution and review note in More details.</p><div className="cms-text-part"><ReadingEditor section={{ id: source.id, heading: "Translation", section_type: "translation", body: String(model.document.translation_text || ""), body_format: "markdown", position: 0 }} figures={model.figures} imageUrl={imageUrl} updateFigure={updateFigure} uploadImage={uploadImage} onChange={body => field("translation_text", body)} /></div></div>}
      <h2>{model.document.translation_language ? "Original language text" : "Reading text"}</h2><p className="cms-field-help">Paste or edit the transcript here. Keep editorial notes separate from the source’s words.</p>
      {model.sections.map((section, index) => <div className={`cms-text-part ${["note", "source_note", "overview"].includes(section.section_type) ? "cms-note-part" : ""}`} key={section.id}><div className="cms-part-header"><input aria-label={`Part ${index + 1} title`} value={section.heading} onChange={e => updateSection(section.id, { heading: e.target.value })} /><div className="cms-row"><button title="Move up" aria-label="Move part up" disabled={!index} onClick={() => change(m => { const sections = [...m.sections]; [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]]; return { ...m, sections }; })}><ArrowUp size={13} /></button><button title="Move down" aria-label="Move part down" disabled={index === model.sections.length - 1} onClick={() => change(m => { const sections = [...m.sections]; [sections[index + 1], sections[index]] = [sections[index], sections[index + 1]]; return { ...m, sections }; })}><ArrowDown size={13} /></button><button title="Remove part" aria-label="Remove part" onClick={() => { setRemoveId(section.id); setDialog("remove"); }}><X size={14} /></button></div></div>
        <ReadingEditor section={section} figures={model.figures} imageUrl={imageUrl} updateFigure={updateFigure} uploadImage={uploadImage} onChange={body => updateSection(section.id, { body, body_format: "markdown" })} />
        <details style={{ padding: "8px 16px", borderTop: "1px solid var(--cms-border)" }}><summary className="cms-field-help" style={{ cursor: "pointer" }}>Text purpose: {section.section_type === "transcript" ? "source text" : section.section_type.replace(/_/g, " ")}</summary><label style={{ marginTop: 10 }}>This part contains<select value={section.section_type} onChange={e => updateSection(section.id, { section_type: e.target.value })}>{!["transcript", "translation", "overview", "source_note", "note"].includes(section.section_type) && <option>{section.section_type}</option>}<option value="transcript">Source text / transcript</option><option value="overview">Introduction / overview</option><option value="source_note">Note about the source</option><option value="note">Editorial note</option></select></label></details>
      </div>)}
      {!model.sections.length && <div className="cms-empty cms-card" style={{ padding: 30, marginTop: 20 }}><FileText size={24} style={{ margin: "auto" }} /><p style={{ margin: "15px 0" }}>Add reading text, or attach the original PDF below.</p></div>}
      <button onClick={() => change(m => ({ ...m, sections: [...m.sections, { id: crypto.randomUUID(), heading: m.sections.length ? "New part" : "Reading text", section_type: "transcript", body: "", body_format: "markdown", position: (m.sections.length + 1) * 10 }] }))}><Plus size={15} />{model.sections.length ? "Add another part" : "Add reading text"}</button>
      <div style={{ marginTop: 34 }}><h2>Original files</h2><p className="cms-field-help">PDFs and scans stay with the source. New files stay private until publication.</p>{model.files.map(file => <div className="cms-original-file" key={file.id}><FileText size={16} /><a href={`/admin/media/${source.id}/${file.id}`} target="_blank" rel="noreferrer">{file.name || file.storage_path.split("/").pop()} ↗</a><span className="cms-field-help">{Math.round(file.byte_size / 1024)} KB</span>{!model.figures.some(f => f.image_path === file.storage_path) && <button title="Detach file" aria-label={`Detach ${file.name || "file"}`} onClick={() => change(m => ({ ...m, files: m.files.filter(f => f.id !== file.id) }))}><X size={14} /></button>}</div>)}<button style={{ marginTop: 15 }} disabled={uploading} onClick={() => originalInput.current?.click()}><Upload size={15} />{uploading ? "Uploading…" : "Attach original file"}</button><input ref={originalInput} type="file" hidden accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { const asset = await uploadFile(source.id, file); change(m => attachOriginal(m, asset)); } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); } finally { setUploading(false); if (originalInput.current) originalInput.current.value = ""; } }} /></div>
      {!model.document.translation_language && <button className="cms-quiet" style={{ marginTop: 20 }} onClick={() => change(m => ({ ...m, document: { ...m.document, translation_language: "English", translation_text: "" } }))}>Add a translation</button>}
    </div><aside className="cms-details"><h2>Source details</h2><p className="cms-field-help" style={{ marginBottom: 20 }}>Fill in what you know. You can come back to the rest.</p>
      <label className="cms-field" style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16 }}><input type="checkbox" checked={featured} onChange={e => toggleFeatured(e.target.checked)} /><span>Home page pick <span className="cms-field-help" style={{ display: "block" }}>Published picks rotate through the home page’s featured sources. Takes effect immediately.</span></span></label>
      {textField("display_date", "Date", "For example: 1963, c. 1820, or 12 May 1974")}
      <div className="cms-field">Creator / speaker{model.people.map((p, i) => <div key={`${p.id || p.name}-${p.role}-${i}`} className="cms-person"><span>{p.name}<small className="cms-field-help">{p.role}</small></span><button aria-label={`Remove ${p.name}`} onClick={() => change(m => ({ ...m, people: m.people.filter((_, index) => index !== i) }))}><X size={13} /></button></div>)}<input aria-label="Creator name" list="cms-people" value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Add a person…" /><datalist id="cms-people">{choices.people.map(p => <option key={p.id} value={p.name} />)}</datalist><select aria-label="Person role" value={personRole} onChange={e => setPersonRole(e.target.value)}><option value="author">Author</option><option value="speaker">Speaker</option><option value="editor">Editor</option><option value="translator">Translator</option><option value="subject">Subject</option><option value="recordist">Recordist</option></select><button style={{ marginTop: 7 }} disabled={!personName.trim()} onClick={() => { const name = personName.trim(); const known = choices.people.find(p => p.name.toLowerCase() === name.toLowerCase()); if (!model.people.some(p => p.name.toLowerCase() === name.toLowerCase() && p.role === personRole)) change(m => ({ ...m, people: [...m.people, { id: known?.id, name, role: personRole }] })); setPersonName(""); }}>Add person</button></div>
      {selectField("medium", "Format", [["Text", "Text"], ["Image", "Image"], ["Audio/Video", "Audio / video"], ["Personal History", "Personal history"], ["Biography", "Biography"]])}
      {textField("source_url", "Original source link", "The holding archive, catalogue, or original publication")}
      {textField("citation", "Citation", undefined, true)}
      <hr /><details><summary>Topics & collections</summary><input type="search" aria-label="Find a topic" placeholder="Find a topic…" value={tagQuery} onChange={e => setTagQuery(e.target.value)} /><div className="cms-checkbox-list">{choices.tags.filter(t => t.name.toLowerCase().includes(tagQuery.toLowerCase())).map(t => <label key={t.id}><input type="checkbox" checked={model.tagIds.includes(t.id)} onChange={e => change(m => ({ ...m, tagIds: e.target.checked ? [...m.tagIds, t.id] : m.tagIds.filter(id => id !== t.id) }))} />{t.name}</label>)}</div><p className="cms-field">Collections</p><div className="cms-checkbox-list">{choices.collections.map(c => <label key={c.id}><input type="checkbox" checked={model.collections.some(m => m.collection_id === c.id)} onChange={e => change(m => ({ ...m, collections: e.target.checked ? [...m.collections, { collection_id: c.id, position: null, sequence_number: null, sequence_label: null, issue_date: null, editorial_caption: null }] : m.collections.filter(item => item.collection_id !== c.id) }))} />{c.title}</label>)}</div>{textField("sequence_label", "Issue / volume label")}{textField("sequence_number", "Issue order")}{textField("issue_date", "Issue date")}</details>
      <details><summary>Rights & attribution</summary>{textField("rights_statement", "Rights note", "What can we share, and who should be credited?", true)}{textField("publisher", "Publisher / holding archive")}{textField("publication_title", "Publication title")}{textField("language", "Language")}{textField("region", "Place / region")}</details>
      <details><summary>More details</summary>{textField("short_title", "Short title")}{textField("subtitle", "Subtitle")}{textField("date_start", "Start year", "Used for chronological browsing")}{textField("date_end", "End year")}{selectField("document_type", "Source type", ["Source", "Book", "Academic Article", "Letter", "Manuscript", "Field Notes", "Audio/Video", "Film", "Essay", "Testimony", "Patient Report", "Medical Report", "Government Report", "Ancient Text", "Iconography", "Material Artifact", "Newspaper Article", "Archaeological Site", "Architectural Site"].map(v => [v, v]))}{selectField("source_kind", "Structure", [["single", "One source"], ["collection_item", "Issue or part of a series"], ["collection", "Complete series / collection"]])}{selectField("reader_mode", "First reader tab", [["", "Automatic"], ["transcript", "Transcript"], ["translation", "Translation"], ["pdf", "Original PDF"], ["images", "Original scans"], ["audio", "Original audio"], ["video", "Original video"], ["overview", "Overview"]])}{textField("media_embed_url", "Audio / video link", "YouTube or another supported player link")}{selectField("access_type", "Reader access", [["hosted", "Read here"], ["external", "Read at the original archive"], ["metadata_only", "Catalogue entry"]])}{textField("translation_language", "Translation language")}{selectField("translation_provider", "Translation prepared by", [["", "Not specified"], ["human", "A person"], ["published", "Published translation"], ["llm", "Machine translation (needs review)"]])}{textField("translation_note", "Translation note", undefined, true)}</details>
      <details><summary>Private notes for editors</summary><textarea aria-label="Private notes for editors" rows={5} value={model.editorNotes || ""} onChange={e => change(m => ({ ...m, editorNotes: e.target.value }))} /><p className="cms-field-help">Research leads, questions, or a link to your shared working document. These notes never appear in the reader.</p></details><hr /><p className="cms-field-help">{status === "published" ? "Published. All edits here stay private until you publish changes." : "Private draft. Only editors can see it."}</p>{status === "published" && <button className="cms-quiet cms-danger" style={{ marginTop: 10 }} onClick={() => setDialog("unpublish")}>Move to drafts</button>}
      <details style={{ marginTop: 12 }}><summary>History & recovery</summary>{!source.revisions.length && <p className="cms-field-help">Published versions will appear here.</p>}{source.revisions.map(r => <div key={r.id} style={{ marginBottom: 15 }}><p className="cms-field-help">{new Date(r.created_at).toLocaleString()} · {r.change_note}</p>{r.after_data?.document && <button onClick={() => { change(() => structuredClone(r.after_data!)); setNotice("Previous version restored as a private draft. Preview before publishing."); }}>Restore as draft</button>}</div>)}<button onClick={() => { const blob = new Blob([JSON.stringify(modelRef.current, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${source.slug}-draft.json`; link.click(); URL.revokeObjectURL(url); }}>Download draft</button></details>
    </aside></div>
    {dialog === "publish" && <CmsModal title={status === "published" ? "Publish these changes?" : "Ready to publish?"} onClose={() => !busy && setDialog(null)}><p>{local ? "This publishes only in the local workspace. The public archive will stay unchanged." : "Readers will see the title, text, images, and source details in this version."}</p>{!!problems.length && <div className="cms-error"><p style={{ margin: 0 }}>Before publishing:</p><ul style={{ paddingLeft: 18, listStyle: "disc" }}>{problems.map(p => <li key={p}>{p}</li>)}</ul></div>}<div className="cms-row"><button disabled={busy} onClick={() => setDialog(null)}>Keep editing</button><button className="cms-primary" disabled={busy || !!problems.length} onClick={publish}>{busy ? "Publishing…" : local ? "Publish locally" : "Publish"}</button></div></CmsModal>}
    {dialog === "unpublish" && <CmsModal title="Move this source to drafts?" onClose={() => !busy && setDialog(null)}><p>{local ? "It will leave the local published list." : "Readers will no longer see this source. Your text and files will remain here for editors."}</p><div className="cms-row"><button onClick={() => setDialog(null)} disabled={busy}>Cancel</button><button className="cms-primary" disabled={busy} onClick={async () => { setBusy(true); try { if (!await save()) return; const result = await moveSourceToDrafts(source.id, versionRef.current); if ("error" in result) setError(result.error); else { versionRef.current = result.version; setStatus("draft"); setDialog(null); setNotice("Moved to drafts."); router.refresh(); } } finally { setBusy(false); } }}>Move to drafts</button></div></CmsModal>}
    {dialog === "remove" && <CmsModal title="Remove this text part?" onClose={() => setDialog(null)}><p>This removes it from your private draft. The published source stays as it is until you publish changes.</p><div className="cms-row"><button onClick={() => setDialog(null)}>Keep part</button><button className="cms-danger" onClick={() => { change(m => ({ ...m, sections: m.sections.filter(s => s.id !== removeId) })); setDialog(null); }}>Remove part</button></div></CmsModal>}
  </>;
}
