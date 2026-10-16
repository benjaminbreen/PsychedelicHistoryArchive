"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Bold, Italic, Heading2, Quote, List, Link as LinkIcon, ImagePlus, Undo, Redo, Unlink } from "lucide-react";
import { ArchiveFigure, FootnoteDefinition, editorExtensions, needsSourceMode } from "@/lib/cms/editor-extensions";
import type { Figure, Section } from "@/lib/cms/model";
import { MarkdownContent } from "@/components/markdown-content";
import { CmsModal } from "./cms-modal";

type FigureContext = { figures: Figure[]; imageUrl: (figure: Figure) => string; updateFigure: (id: string, field: string, value: string) => void };
const Images = createContext<FigureContext>({ figures: [], imageUrl: () => "", updateFigure: () => undefined });

function FigureView({ node }: NodeViewProps) {
  const { figures, imageUrl, updateFigure } = useContext(Images);
  const selected = String(node.attrs.token).split(",").map((token: string) => figures.find(f => f.token === token.trim() || f.id === token.trim()));
  return <NodeViewWrapper contentEditable={false}>{selected.map((figure, i) => figure ? <div className="cms-figure-edit" key={figure.id}>
    {/* Original scans should keep their natural proportions in the editor. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img alt={figure.alt_text || "Source image"} src={imageUrl(figure)} />
    <label>Caption<input value={figure.caption} onChange={e => updateFigure(figure.id, "caption", e.target.value)} placeholder="Identify what the image shows" /></label>
    <label>Credit<input value={figure.credit} onChange={e => updateFigure(figure.id, "credit", e.target.value)} placeholder="Holding archive, photographer, or source" /></label>
    <label>Image description<input value={figure.alt_text} onChange={e => updateFigure(figure.id, "alt_text", e.target.value)} placeholder="A short description for readers using screen readers" /></label>
  </div> : <div className="cms-error" key={i}>This image is missing. Remove this block or insert the image again.</div>)}</NodeViewWrapper>;
}
function NoteView({ node, updateAttributes }: NodeViewProps) {
  return <NodeViewWrapper contentEditable={false} className="cms-note-edit"><span>Note {node.attrs.key}</span><textarea aria-label={`Footnote ${node.attrs.key}`} value={node.attrs.text} onChange={e => updateAttributes({ text: e.target.value, raw: "" })} rows={2} /></NodeViewWrapper>;
}

export function ReadingEditor({ section, onChange, figures, imageUrl, updateFigure, uploadImage }: { section: Section; onChange: (text: string) => void; uploadImage?: (file: File) => Promise<Figure | null> } & FigureContext) {
  const [sourceMode, setSourceMode] = useState(needsSourceMode(section.body));
  const [dialog, setDialog] = useState<"link" | "note" | null>(null);
  const [value, setValue] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const current = useRef({ onChange, text: section.body }); current.current = { onChange, text: section.body };
  const [extensions] = useState(() => editorExtensions().map(extension => extension.name === "archiveFigure" ? ArchiveFigure.extend({ addNodeView: () => ReactNodeViewRenderer(FigureView) }) : extension.name === "footnoteDefinition" ? FootnoteDefinition.extend({ addNodeView: () => ReactNodeViewRenderer(NoteView) }) : extension));
  const lastBody = useRef(section.body);
  const editor = useEditor({ extensions, content: section.body, contentType: "markdown", immediatelyRender: false, editorProps: { attributes: { role: "textbox", "aria-label": section.heading || "Reading text", "aria-multiline": "true" } }, onUpdate: ({ editor }) => { lastBody.current = editor.getMarkdown(); current.current.onChange(lastBody.current); } });
  useEffect(() => { if (editor && lastBody.current !== section.body) { lastBody.current = section.body; editor.commands.setContent(section.body, { contentType: "markdown", emitUpdate: false }); if (needsSourceMode(section.body)) setSourceMode(true); } }, [editor, section.body]);
  const button = (label: string, icon: ReactNode, action: () => void, active = false) => <button type="button" aria-label={label} title={label} aria-pressed={active} onMouseDown={e => e.preventDefault()} onClick={action} disabled={!editor || sourceMode}>{icon}</button>;
  function toggleSource() {
    if (sourceMode) { if (needsSourceMode(section.body)) return; editor?.commands.setContent(section.body, { contentType: "markdown", emitUpdate: false }); }
    setSourceMode(mode => !mode);
  }
  function insertNote() {
    if (!editor || !value.trim()) return;
    let key = 1; while (section.body.includes(`[^${key}]`)) key++;
    editor.chain().focus().insertContent({ type: "footnoteReference", attrs: { key: String(key) } }).run();
    const returnTo = editor.state.selection.from;
    editor.commands.insertContentAt(editor.state.doc.content.size, { type: "footnoteDefinition", attrs: { key: String(key), text: value.trim(), raw: "" } });
    editor.commands.setTextSelection(returnTo);
    setDialog(null); setValue("");
  }
  return <Images.Provider value={{ figures, imageUrl, updateFigure }}>
    <div className="cms-toolbar" aria-label="Text formatting">
      {button("Bold", <Bold size={15} />, () => editor?.chain().focus().toggleBold().run(), editor?.isActive("bold"))}
      {button("Italic", <Italic size={15} />, () => editor?.chain().focus().toggleItalic().run(), editor?.isActive("italic"))}
      {button("Heading", <Heading2 size={16} />, () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), editor?.isActive("heading"))}
      {button("Quote", <Quote size={15} />, () => editor?.chain().focus().toggleBlockquote().run(), editor?.isActive("blockquote"))}
      {button("List", <List size={16} />, () => editor?.chain().focus().toggleBulletList().run(), editor?.isActive("bulletList"))}
      <span className="cms-toolbar-divider" />
      {button("Add link", <LinkIcon size={15} />, () => { setValue(editor?.getAttributes("link").href || ""); setDialog("link"); }, editor?.isActive("link"))}
      {editor?.isActive("link") && button("Remove link", <Unlink size={15} />, () => editor?.chain().focus().unsetLink().run())}
      {button("Add footnote", <span>Note</span>, () => { setValue(""); setDialog("note"); })}
      {uploadImage && button("Insert image", <ImagePlus size={16} />, () => input.current?.click())}
      <span className="cms-toolbar-divider" />
      {button("Undo", <Undo size={15} />, () => editor?.chain().focus().undo().run())}
      {button("Redo", <Redo size={15} />, () => editor?.chain().focus().redo().run())}
      <button type="button" className="cms-source-toggle" onClick={toggleSource} disabled={sourceMode && needsSourceMode(section.body)} title="Optional Markdown editing">{sourceMode ? "Formatted text" : "Source text"}</button>
    </div>
    {sourceMode ? <><p className="cms-field-help" style={{ padding: "10px 20px 0" }}>This text is kept in its original Markdown. Existing formatting will be preserved.</p><textarea className="cms-source-text" aria-label={`${section.heading} source text`} value={section.body} onChange={e => onChange(e.target.value)} /><details style={{ padding: "0 20px 20px" }}><summary>Reading preview</summary><div className="cms-prose"><MarkdownContent markdown={section.body} figures={figures.map(f => ({ id: f.id, imagePath: imageUrl(f), caption: f.caption, alt: f.alt_text, token: f.token, credit: f.credit }))} /></div></details></> : <EditorContent editor={editor} className="cms-prose" />}
    <input type="file" ref={input} hidden accept="image/jpeg,image/png,image/webp,image/gif" disabled={imageBusy} onChange={async e => {
      const file = e.target.files?.[0]; if (!file || !editor || !uploadImage) return;
      setImageBusy(true);
      try { const figure = await uploadImage(file); if (figure) editor.chain().focus().insertContent({ type: "archiveFigure", attrs: { token: figure.token, raw: `{{figure:${figure.token}}}` } }).run(); }
      finally { setImageBusy(false); if (input.current) input.current.value = ""; }
    }} />
    {imageBusy && <p role="status" className="cms-field-help" style={{ padding: "10px 20px" }}>Uploading image…</p>}
    {dialog && <CmsModal title={dialog === "link" ? "Add a link" : "Add a footnote"} onClose={() => setDialog(null)}>
      <label>{dialog === "link" ? "Link address" : "Footnote text"}{dialog === "link" ? <input type="url" autoFocus value={value} onChange={e => setValue(e.target.value)} placeholder="https://…" /> : <textarea autoFocus rows={4} value={value} onChange={e => setValue(e.target.value)} />}</label>
      <div className="cms-row"><button onClick={() => setDialog(null)}>Cancel</button><button className="cms-primary" disabled={!value.trim() || (dialog === "link" && !/^(https?:\/\/|mailto:)/i.test(value))} onClick={() => { if (dialog === "note") insertNote(); else { editor?.chain().focus().extendMarkRange("link").setLink({ href: value.trim() }).run(); setDialog(null); } }}>Insert {dialog === "note" ? "footnote" : "link"}</button></div>
    </CmsModal>}
  </Images.Provider>;
}
