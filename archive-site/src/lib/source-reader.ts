import { extractMarkdownToc, markdownHeadingId } from "@/lib/markdown";
import type { ArchiveSource, SourceFile, SourcePage } from "@/lib/types";

export type ReaderTabId = "overview" | "transcript" | "translation" | "original" | "sourcePdf" | "details";

export type ReaderTab = {
  id: ReaderTabId;
  label: string;
};

export type ReaderTocItem = {
  id: string;
  label: string;
};

export type OriginalSourceMode = "audio" | "images" | "pdf" | "video";

export function buildDisplayPages(source: ArchiveSource, transcript: string[]) {
  if (source.sourceKind === "collection") return [];

  const imagePages = source.pages?.filter((page) => page.imagePath);
  if (imagePages?.length) return imagePages;
  if (source.pages?.length) return source.pages;
  if (!transcript.length && !source.imagePath) return [];

  let lineIndex = 0;
  const lines = transcript.flatMap((paragraph, paragraphIndex) =>
    wrapLine(paragraph, 82).map((text, wrappedLineIndex) => {
      lineIndex += 1;
      return {
        id: `${source.id}-fallback-${paragraphIndex}-${wrappedLineIndex}`,
        index: lineIndex,
        text,
        paragraphIndex,
      };
    })
  );

  return [
    {
      id: `${source.id}-fallback-page`,
      pageNumber: 1,
      label: "1",
      imagePath: source.imagePath,
      thumbnailPath: source.imagePath,
      language: source.language,
      transcriptionStatus: source.pages?.length ? "ingested" : "page image pending",
      ocrText: transcript.join("\n\n"),
      lines,
    },
  ];
}

export function buildReaderTabs(source: ArchiveSource, transcript: string[]): ReaderTab[] {
  if (source.sourceKind === "collection") {
    return [
      { id: "overview", label: "Overview" },
      { id: "details", label: "Details" },
    ];
  }

  if (isSiteEntry(source)) {
    return [
      { id: "transcript", label: "Overview" },
      { id: "details", label: "Details" },
    ];
  }

  const tabs: ReaderTab[] = [];
  const hasTranslation = Boolean(source.translationText?.trim());
  const hasTranscript = transcript.some((paragraph) => paragraph.trim()) || Boolean(source.transcriptSections?.length);

  if (hasTranslation) {
    tabs.push({ id: "translation", label: "Translation" });
    if (hasTranscript) {
      tabs.push({ id: "transcript", label: "Transcript" });
    }
  } else if (hasTranscript) {
    tabs.push({ id: "transcript", label: "Transcript" });
  } else {
    tabs.push({ id: "details", label: "Overview" });
  }

  tabs.push({ id: "original", label: originalTabLabel(source) });
  if (shouldShowSeparatePdfTab(source)) {
    tabs.push({ id: "sourcePdf", label: "Original PDF" });
  }

  if (!tabs.some((tab) => tab.id === "details")) {
    tabs.push({ id: "details", label: "Details" });
  }

  return tabs;
}

export function visibleReaderTab(activeTab: ReaderTabId, tabs: ReaderTab[]) {
  return tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id ?? "details";
}

export function buildReaderToc(source: ArchiveSource, activeTab: ReaderTabId, transcript: string[]): ReaderTocItem[] {
  if (activeTab === "translation" && source.translationText) {
    return extractMarkdownToc(source.translationText);
  }

  if (activeTab === "transcript") {
    if (source.transcriptSections?.length) {
      return source.transcriptSections
        .map((section) => section.heading?.trim())
        .filter(Boolean)
        .map((heading) => ({ id: readerSectionId(heading), label: heading }));
    }
    if (transcript.some((paragraph) => paragraph.trim())) {
      return [{ id: readerSectionId("Transcript"), label: "Transcript" }];
    }
  }

  return [];
}

export function readerSectionId(heading: string) {
  return markdownHeadingId(heading);
}

export function siteEvidenceLabel(source: ArchiveSource) {
  if (source.tags.includes("Material Culture") && source.tags.includes("Pharmacology")) {
    return "Archaeological assemblage and chemical residue analysis";
  }
  if (source.tags.includes("Material Culture")) return "Archaeological assemblage";
  if (source.tags.includes("Pharmacology")) return "Chemical or pharmacological evidence";
  return "Archaeological and historical evidence";
}

export function originalTabLabel(source: ArchiveSource) {
  const mode = getOriginalMode(source, source.pages ?? []);
  if (mode === "pdf") return "Original PDF";
  if (mode === "audio") return "Original Audio";
  if (mode === "video") return "Original Video";
  if (source.pages?.some((page) => page.imagePath)) return "Page Images";
  return "Original source";
}

export function getOriginalMode(source: ArchiveSource, pages: SourcePage[]): OriginalSourceMode {
  const files = source.files ?? [];
  const hasPdf = files.some(isPdfFile);
  const hasAudio = files.some(isAudioFile);
  const hasVideo = files.some(isVideoFile) || Boolean(source.mediaEmbedUrl && source.medium === "Audio/Video");
  const shouldPreferPdf =
    hasPdf &&
    (source.readerMode === "pdf" ||
      source.type === "Academic Article" ||
      source.type === "Book" ||
      !pages.some((page) => page.imagePath));

  if (hasAudio || source.readerMode === "audio") return "audio";
  if (hasVideo || source.readerMode === "video" || source.type === "Film") return "video";
  if (shouldPreferPdf) return "pdf";
  return "images";
}

export function translationNote(source: ArchiveSource) {
  const fromLanguage = source.contentLanguage || source.language || "the source language";
  const toLanguage = source.translationLanguage || "English";
  return `This ${toLanguage} translation is shown first for readability; cite or verify against the ${fromLanguage} original.`;
}

export function translationProviderLabel(provider: NonNullable<ArchiveSource["translationProvider"]>) {
  if (provider === "llm") return "generated by GPT-5.5 on May 20, 2026";
  if (provider === "human") return "Human translation";
  return "Published translation";
}

export function isPdfFile(file: SourceFile) {
  return file.kind === "original_pdf" || file.kind === "pdf" || file.mimeType === "application/pdf";
}

export function isAudioFile(file: SourceFile) {
  return file.kind === "audio" || Boolean(file.mimeType?.startsWith("audio/"));
}

export function isVideoFile(file: SourceFile) {
  return file.kind === "video" || Boolean(file.mimeType?.startsWith("video/"));
}

export function isMediaSource(source: ArchiveSource) {
  return source.medium === "Audio/Video" || source.type === "Film" || source.readerMode === "audio" || source.readerMode === "video" || Boolean(source.mediaEmbedUrl);
}

export function isSiteEntry(source: ArchiveSource) {
  return source.type === "Archaeological Site" || source.readerMode === "site_entry";
}

export function isEmbeddableUrl(url: string) {
  return /^https?:\/\//.test(url);
}

export function toEmbedUrl(url?: string) {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (parsed.hostname.endsWith("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.hostname.endsWith("vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
  } catch {
    return url;
  }

  return url;
}

export function wrapLine(text: string, maxLength: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function shouldShowSeparatePdfTab(source: ArchiveSource) {
  const files = source.files ?? [];
  const hasPdf = files.some(isPdfFile);
  if (!hasPdf) return false;
  return getOriginalMode(source, source.pages ?? []) !== "pdf";
}
