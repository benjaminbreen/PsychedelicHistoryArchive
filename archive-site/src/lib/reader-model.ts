import { getOriginalMode, isPdfFile, isSiteEntry, translationProviderLabel } from "@/lib/source-reader";
import type { ArchiveSource, SourcePage, TranscriptSection } from "@/lib/types";

// What the source reader shows for a given source. Kept pure so the public page and the CMS preview agree.

export type TextViewId = "overview" | "translation" | "transcript";
export type OriginalKind = "images" | "pdf" | "audio" | "video" | "external" | "none";
export type ReaderView = TextViewId | "compare" | "original";

export type LineatedLine = { n: number | null; text: string; indent: number; kind: "line" | "head" | "insert" };
export type LineatedPage = { number: number; lines: LineatedLine[] };

export type ReaderModel = {
  textViews: { id: TextViewId; label: string }[];
  original: { kind: OriginalKind; label: string };
  canCompare: boolean;
  pages: SourcePage[];
  lineated: LineatedPage[] | null;
  introSection?: TranscriptSection;
  commentary: TranscriptSection[];
};

const NO_TRANSCRIPT = "No transcript text is available yet";

export function transcriptParagraphs(source: ArchiveSource): string[] {
  if (!source.transcript) return [];
  const cleaned = stripImportedTranscriptMetadata(source.transcript);
  const paragraphs = cleaned.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const onlySingleBreaks = paragraphs.length <= 1 && /\n/.test(cleaned);
  return (onlySingleBreaks && !isLineated(cleaned) ? cleaned.split(/\n+/) : paragraphs).map(p => p.trim()).filter(Boolean);
}

export function stripImportedTranscriptMetadata(transcript: string) {
  const lines = transcript.split(/\r?\n/);
  const markerIndex = lines.findIndex(line => /^(transcription|complete transcription|partial transcript|partial translation)$/i.test(line.trim()));
  if (markerIndex !== -1) return lines.slice(markerIndex + 1).join("\n").trim();
  while (lines.length && (!lines[0].trim() || /^(authors?|date|source)\s*:/i.test(lines[0].trim()))) lines.shift();
  return lines.join("\n").trim();
}

function isLineated(text: string) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const numbered = lines.filter(l => /^\s*\d+\s+\S/.test(l)).length;
  return lines.length >= 6 && numbered / lines.length >= 0.6;
}

// Typescripts with their own line numbers (e.g. Mead's memo) keep those numbers, page breaks and indentation.
export function parseLineatedPages(paragraphs: string[]): LineatedPage[] | null {
  const text = paragraphs.join("\n\n");
  if (!isLineated(text)) return null;
  return text.split(/\n?\[end of page \d+\]\n?/i).map(chunk => chunk.trim()).filter(Boolean).map((chunk, index) => {
    const lines: LineatedLine[] = [];
    let seenNumber = false;
    for (const raw of chunk.split("\n")) {
      const trimmed = raw.trim();
      if (!trimmed || /^\d+$/.test(trimmed)) continue;
      const match = trimmed.match(/^(\d+)(\s+)(.*)$/);
      if (match && !/^\d{4}/.test(trimmed)) {
        seenNumber = true;
        const gap = match[2].length;
        lines.push({ n: Number(match[1]), text: match[3], indent: gap >= 8 ? 2 : gap >= 4 ? 1 : 0, kind: "line" });
      } else {
        // Unnumbered text before the first numbered line is the page heading; after it, an interlinear insertion.
        lines.push({ n: null, text: trimmed, indent: 2, kind: seenNumber ? "insert" : "head" });
      }
    }
    return { number: index + 1, lines };
  });
}

export function readerPages(source: ArchiveSource) {
  return (source.pages ?? []).filter(p => p.imagePath || p.thumbnailPath).sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0));
}

export function buildReaderModel(source: ArchiveSource, transcript: string[]): ReaderModel {
  const sections = source.transcriptSections ?? [];
  const commentary = sections.filter(s => s.kind === "historical_context");
  // The summary is the editor's description; a short source note stands in only when there is no summary.
  const sourceNote = sections.find(s => s.kind === "source_note");
  const introSection = !source.summary?.trim() && sourceNote && sectionText(sourceNote).length <= 700 ? sourceNote : undefined;
  const pages = readerPages(source);

  if (source.sourceKind === "collection") {
    return { textViews: [{ id: "overview", label: "Overview" }], original: { kind: "none", label: "" }, canCompare: false, pages: [], lineated: null, introSection, commentary };
  }

  const realTranscript = transcript.filter(p => !p.startsWith(NO_TRANSCRIPT));
  const hasTranscriptSections = sections.some(s => s.kind === "transcript" || s.kind === "note");
  const hasTranscript = hasTranscriptSections || realTranscript.length > 0;
  const lineated = hasTranscriptSections ? null : parseLineatedPages(realTranscript);
  const textViews: ReaderModel["textViews"] = [];

  if (source.translationText?.trim()) {
    textViews.push({ id: "translation", label: "Translation" });
    if (hasTranscript) textViews.push({ id: "transcript", label: originalLanguageLabel(source) });
  } else if (hasTranscript) {
    textViews.push({ id: "transcript", label: isSiteEntry(source) ? "Overview" : "Transcript" });
  } else {
    textViews.push({ id: "overview", label: "Overview" });
  }

  const original = originalFor(source, pages);
  const canCompare = textViews[0].id !== "overview" && (original.kind === "images" || original.kind === "pdf");
  return { textViews, original, canCompare, pages, lineated, introSection, commentary };
}

function originalFor(source: ArchiveSource, pages: SourcePage[]): ReaderModel["original"] {
  if (isSiteEntry(source)) return { kind: "none", label: "" };
  const mode = getOriginalMode(source, pages);
  const hasPdf = source.files?.some(isPdfFile);
  if (mode === "audio") return { kind: "audio", label: "Audio" };
  if (mode === "video") return { kind: "video", label: "Video" };
  if (pages.some(p => p.imagePath) && mode === "images") return { kind: "images", label: "Scans" };
  if (hasPdf) return { kind: "pdf", label: "Original PDF" };
  if (source.sourceUrl && source.sourceUrl !== "#") return { kind: "external", label: "Original" };
  return { kind: "none", label: "" };
}

function originalLanguageLabel(source: ArchiveSource) {
  const language = (source.contentLanguage || source.language || "").trim();
  return language && !/^english$/i.test(language) ? `Original ${language}` : "Original text";
}

export function sectionText(section: TranscriptSection) {
  return (section.body || section.paragraphs.join("\n\n")).trim();
}

// One plain sentence on what the reading text is and how it was prepared.
export function textStatus(source: ArchiveSource, model: ReaderModel) {
  const pageCount = model.lineated?.length || model.pages.length;
  const pages = pageCount > 1 ? ` of ${pageCount} pages` : "";
  if (source.sourceKind === "collection") return { label: "Collection", detail: `${source.collectionItemCount || source.collectionItems?.length || 0} items, each with its own reader.` };
  if (model.textViews[0].id === "translation") {
    const provider = source.translationProvider ? translationProviderLabel(source.translationProvider) : "";
    return { label: `${source.translationLanguage || "English"} translation`, detail: [provider && `${provider}.`, "Check quotations against the original."].filter(Boolean).join(" ") };
  }
  if (model.textViews[0].id === "overview") {
    return { label: "Catalogue record", detail: source.accessType === "external" ? "The original is held elsewhere; follow the link to read it." : "No transcript yet." };
  }
  const reviewed = source.pages?.some(p => p.transcriptionStatus === "reviewed");
  const kind = model.lineated ? "Transcript" : "Reading text";
  const detail = reviewed ? `${kind}${pages}, checked against the original.` : `${kind}${pages}.`;
  return { label: reviewed ? "Reviewed transcript" : kind, detail: model.lineated ? `${detail} Original spelling and line numbers are kept.` : detail };
}

export function sourceUrl(source: ArchiveSource, origin = "https://www.psychedelicarchive.com") {
  return `${origin}/archive/${source.slug}`;
}

export function creatorLabel(source: ArchiveSource) {
  const names = source.creators?.length ? source.creators.filter(c => !/editor|translator/i.test(c.role)).map(c => c.name) : [];
  return (names.length ? names : [source.author]).filter(Boolean).join(", ");
}

export function sourceCitation(source: ArchiveSource, where?: { page: number; a?: number; b?: number }, origin?: string) {
  const location = where ? `, p. ${where.page}${where.a ? `, ${where.a === where.b ? `line ${where.a}` : `lines ${where.a}–${where.b}`}` : ""}` : "";
  const holding = source.citation?.trim().replace(/\.$/, "");
  const head = `${creatorLabel(source)}, “${source.title},” ${source.displayDate}${location}`;
  return `${head}${holding && !holding.includes(source.title) ? `, ${holding}` : ""}; The Psychedelic History Archive, ${sourceUrl(source, origin)}.`;
}
