import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";

export const ArchiveFigure = Node.create({
  name: "archiveFigure", group: "block", atom: true,
  addAttributes() { return { token: { default: "" }, raw: { default: "" } }; },
  parseHTML() { return [{ tag: "div[data-archive-figure]" }]; },
  renderHTML({ HTMLAttributes }) { return ["div", mergeAttributes(HTMLAttributes, { "data-archive-figure": "true" }), "Image"]; },
  markdownTokenizer: {
    name: "archiveFigure", level: "block",
    start: src => src.search(/^{{\s*(?:figure|figure-row|figures|gallery):/m),
    tokenize(src) {
      const match = src.match(/^{{\s*(?:figure|figure-row|figures|gallery):([^}]+)}}[^\S\n]*(?:\n|$)/);
      return match ? { type: "archiveFigure", raw: match[0], token: match[1].trim() } : undefined;
    }
  },
  parseMarkdown(token, helpers) { return helpers.createNode("archiveFigure", { token: token.token, raw: token.raw?.trim() || "" }); },
  renderMarkdown(node) { return node.attrs?.raw || `{{figure:${node.attrs?.token}}}`; }
});

export const FootnoteReference = Node.create({
  name: "footnoteReference", group: "inline", inline: true, atom: true,
  addAttributes() { return { key: { default: "1" } }; },
  parseHTML() { return [{ tag: "sup[data-footnote]" }]; },
  renderHTML({ node, HTMLAttributes }) { return ["sup", mergeAttributes(HTMLAttributes, { "data-footnote": "true" }), node.attrs.key]; },
  markdownTokenizer: { name: "footnoteReference", level: "inline", start: src => src.indexOf("[^"), tokenize(src) { const m = src.match(/^\[\^([^\]]+)\]/); return m ? { type: "footnoteReference", raw: m[0], key: m[1] } : undefined; } },
  parseMarkdown(token, h) { return h.createNode("footnoteReference", { key: token.key }); },
  renderMarkdown(node) { return `[^${node.attrs?.key}]`; }
});

export const FootnoteDefinition = Node.create({
  name: "footnoteDefinition", group: "block", atom: true,
  addAttributes() { return { key: { default: "1" }, text: { default: "" }, raw: { default: "" } }; },
  parseHTML() { return [{ tag: "div[data-footnote-definition]" }]; },
  renderHTML({ node, HTMLAttributes }) { return ["div", mergeAttributes(HTMLAttributes, { "data-footnote-definition": "true" }), `${node.attrs.key}. ${node.attrs.text}`]; },
  markdownTokenizer: {
    name: "footnoteDefinition", level: "block", start: src => src.search(/^\[\^[^\]]+]:/m),
    tokenize(src) { const m = src.match(/^\[\^([^\]]+)]:[^\S\n]*(.*)(?:\n[ \t]{2,}\S[^\n]*)*(?:\n|$)/); return m ? { type: "footnoteDefinition", raw: m[0], key: m[1], text: m[0].replace(/^\[\^[^\]]+]:\s*/, "").trim() } : undefined; }
  },
  parseMarkdown(token, h) { return h.createNode("footnoteDefinition", { key: token.key, text: token.text, raw: token.raw?.trimEnd() || "" }); },
  renderMarkdown(node) { return node.attrs?.raw || `[^${node.attrs?.key}]: ${node.attrs?.text}`; }
});

export const FootnotesPlacement = Node.create({
  name: "footnotesPlacement", group: "block", atom: true,
  parseHTML() { return [{ tag: "div[data-footnotes-placement]" }]; },
  renderHTML() { return ["div", { "data-footnotes-placement": "true" }, "Notes appear here"]; },
  markdownTokenizer: { name: "footnotesPlacement", level: "block", start: src => src.indexOf("{{footnotes}}"), tokenize(src) { const m = src.match(/^{{\s*footnotes\s*}}(?:\n|$)/); return m ? { type: "footnotesPlacement", raw: m[0] } : undefined; } },
  parseMarkdown(_token, h) { return h.createNode("footnotesPlacement"); },
  renderMarkdown() { return "{{footnotes}}"; }
});

export function editorExtensions() {
  return [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, protocols: ["http", "https", "mailto"], defaultProtocol: "https" }, underline: false, strike: false }), ArchiveFigure, FootnoteReference, FootnoteDefinition, FootnotesPlacement, Markdown.configure({ markedOptions: { gfm: false } })];
}

// Preserve constructs the formatted editor cannot represent. Never silently drop them.
export function needsSourceMode(text: string) { return /<\/?[a-z][^>]*>|^\s*\|.*\|\s*$|!\[[^\]]*\]\(|^#{1}\s|^#{4,6}\s/m.test(text); }
