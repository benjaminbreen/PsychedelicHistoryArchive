"use client";

import { useState } from "react";
import Link from "next/link";
import { BookMarked, Check, ChevronDown, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import type { ReactNode } from "react";
import type { ArchiveSource } from "@/lib/types";

type SourceActionsProps = {
  citation: string;
  pdfUrl?: string;
  shareTitle: string;
  source?: ArchiveSource;
  sourceUrl?: string;
  viewLabel?: string;
};

type CopyState = "citation" | "link" | null;
type CitationStyle = "chicago" | "mla" | "apa" | "bibtex";

const citationStyles: Array<{ id: CitationStyle; label: string }> = [
  { id: "chicago", label: "Chicago" },
  { id: "mla", label: "MLA" },
  { id: "apa", label: "APA" },
  { id: "bibtex", label: "BibTeX" }
];

export function SourceActions({
  citation,
  pdfUrl,
  shareTitle,
  sourceUrl,
  viewLabel = "View original source"
}: SourceActionsProps) {
  const [copied, setCopied] = useState<CopyState>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const hasSourceUrl = sourceUrl && sourceUrl !== "#";

  async function copyValue(value: string, state: CopyState) {
    await navigator.clipboard.writeText(value);
    setCopied(state);
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function shareSource(url = currentViewUrl()) {
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: citation,
        url
      });
      return;
    }

    await copyValue(url, "link");
  }

  return (
    <div className="overflow-hidden rounded-b-lg border-t border-archive-line">
      {hasSourceUrl && (
        <ActionLink href={sourceUrl} icon={<ExternalLink className="h-5 w-5" />} label={viewLabel} />
      )}
      {pdfUrl && (
        <ActionLink href={pdfUrl} icon={<Download className="h-5 w-5" />} label="Download PDF" meta="PDF" />
      )}
      <ActionButton
        icon={copied === "link" ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
        label={copied === "link" ? "Link copied" : "Share"}
        meta={shareMenuOpen ? "Link" : undefined}
        onClick={() => {
          setShareMenuOpen((open) => !open);
        }}
        unbordered
      />
      {shareMenuOpen && (
        <div className="grid gap-1 px-5 pb-4">
          <button
            className="focus-ring rounded border border-archive-line bg-archive-surface px-3 py-2 text-left text-xs font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2"
            onClick={() => {
              void shareSource(currentViewUrl()).then(() => setShareMenuOpen(false)).catch(() => undefined);
            }}
            type="button"
          >
            Share current view
          </button>
          <button
            className="focus-ring rounded border border-archive-line bg-archive-surface px-3 py-2 text-left text-xs font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2"
            onClick={() => {
              void copyValue(sourcePageUrl(), "link").then(() => setShareMenuOpen(false)).catch(() => undefined);
            }}
            type="button"
          >
            Copy source page link
          </button>
        </div>
      )}
    </div>
  );
}

export function CitationCopyControl({ citation, source }: { citation: string; source?: ArchiveSource }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  async function copyCitation(style: CitationStyle) {
    const formatted = source ? formatSourceCitation(source, style, window.location.href, citation) : citation;
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setOpen(false);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function saveToZotero() {
    if (!source) return;
    const ris = formatSourceRis(source, window.location.href);
    const blob = new Blob([ris], { type: "application/x-research-info-systems;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${source.slug || "archive-source"}.ris`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setSaved(true);
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      setSaved(false);
    }, 1600);
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          className="focus-ring inline-flex h-7 items-center gap-1.5 rounded border border-archive-line bg-archive-surface px-2 text-[11px] font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
          <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {source && (
          <button
            className="focus-ring inline-flex h-7 items-center gap-1.5 rounded border border-archive-line bg-archive-surface px-2 text-[11px] font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2"
            onClick={saveToZotero}
            type="button"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <BookMarked className="h-3.5 w-3.5" />}
            {saved ? "Saved" : "Zotero"}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-1">
          {citationStyles.map((style) => (
            <button
              className="focus-ring rounded border border-archive-line bg-archive-surface px-2 py-1.5 text-left text-[11px] font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2"
              key={style.id}
              onClick={() => {
                void copyCitation(style.id).catch(() => undefined);
              }}
              type="button"
            >
              {style.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionLink({ href, icon, label, meta }: { href: string; icon: ReactNode; label: string; meta?: string }) {
  return (
    <Link className="focus-ring flex w-full items-center justify-between border-b border-archive-line px-5 py-3.5 text-left transition last:border-b-0 hover:bg-archive-paper" href={href}>
      <span className="flex items-center gap-3 text-archive-ink">
        {icon}
        <span className="font-medium">{label}</span>
      </span>
      {meta && <span className="text-xs text-archive-muted">{meta}</span>}
    </Link>
  );
}

function ActionButton({
  icon,
  label,
  meta,
  onClick,
  unbordered = false
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  onClick: () => void;
  unbordered?: boolean;
}) {
  return (
    <button className={`focus-ring flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-archive-paper ${unbordered ? "" : "border-b border-archive-line last:border-b-0"}`} type="button" onClick={onClick}>
      <span className="flex items-center gap-3 text-archive-ink">
        {icon}
        <span className="font-medium">{label}</span>
      </span>
      {meta && <span className="text-xs text-archive-muted">{meta}</span>}
    </button>
  );
}

function formatSourceCitation(source: ArchiveSource, style: CitationStyle, archiveUrl: string, fallback: string) {
  if (style === "bibtex") return formatSourceBibtex(source, archiveUrl);
  const title = sourceTitle(source);
  const authors = sourceAuthors(source);
  const authorText = authors.join(", ") || "The Psychedelic History Archive";
  const year = source.year || "n.d.";

  if (style === "apa") {
    return compact(`${authorText}. (${year}). ${title}. The Psychedelic History Archive. ${archiveUrl}`);
  }

  if (style === "mla") {
    return compact(`${authorText}. "${title}." The Psychedelic History Archive, ${year}, ${archiveUrl}.`);
  }

  return fallback || compact(`${authorText}. "${title}." The Psychedelic History Archive, ${year}. ${archiveUrl}.`);
}

function formatSourceRis(source: ArchiveSource, archiveUrl: string) {
  const lines = [`TY  - ${risType(source)}`];
  sourceAuthors(source).forEach((author) => lines.push(`AU  - ${author}`));
  lines.push(`TI  - ${sourceTitle(source)}`);
  if (source.publicationTitle) lines.push(`T2  - ${source.publicationTitle}`);
  if (source.year) lines.push(`PY  - ${source.year}`);
  if (source.displayDate) lines.push(`DA  - ${source.displayDate}`);
  if (source.language) lines.push(`LA  - ${source.language}`);
  if (source.summary) lines.push(`AB  - ${source.summary}`);
  source.tags.forEach((tag) => lines.push(`KW  - ${tag}`));
  if (source.sourceUrl && source.sourceUrl !== "#") lines.push(`L2  - ${source.sourceUrl}`);
  lines.push(`UR  - ${archiveUrl}`);
  lines.push("PB  - The Psychedelic History Archive");
  lines.push("ER  -");
  return lines.join("\n");
}

function formatSourceBibtex(source: ArchiveSource, archiveUrl: string) {
  const key = `${sourceAuthors(source)[0] || "Archive"}${source.year || "nd"}${source.slug}`.replace(/[^A-Za-z0-9]/g, "");
  const fields = [
    ["title", sourceTitle(source)],
    ["author", sourceAuthors(source).join(" and ")],
    ["year", source.year?.toString()],
    ["publisher", "The Psychedelic History Archive"],
    ["url", archiveUrl],
    ["note", source.sourceUrl && source.sourceUrl !== "#" ? `Original source: ${source.sourceUrl}` : undefined]
  ].filter(([, value]) => value);

  return `@misc{${key},\n${fields.map(([name, value]) => `  ${name} = {${value}}`).join(",\n")}\n}`;
}

function sourceTitle(source: ArchiveSource) {
  return source.subtitle ? `${source.title}: ${source.subtitle}` : source.title;
}

function sourceAuthors(source: ArchiveSource) {
  const creators = source.creators?.filter((creator) => !creator.role || /author|creator|artist|editor/i.test(creator.role)).map((creator) => creator.name);
  if (creators?.length) return creators;
  return source.author ? [source.author] : [];
}

function risType(source: ArchiveSource) {
  if (source.type === "Academic Article" || source.type === "Newspaper Article") return "JOUR";
  if (source.type === "Book" || source.type === "Ancient Text") return "BOOK";
  if (source.medium === "Audio/Video" || source.type === "Film") return "VIDEO";
  return "GEN";
}

function compact(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+\./g, ".").trim();
}

function currentViewUrl() {
  const url = new URL(window.location.href);
  const activeReader = document.querySelector<HTMLElement>("[data-source-reader-tab]")?.dataset.sourceReaderTab;
  if (activeReader && !url.searchParams.has("view")) {
    url.searchParams.set("view", activeReader);
  }
  return url.toString();
}

function sourcePageUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("view");
  url.searchParams.delete("page");
  url.searchParams.delete("line");
  url.hash = "";
  return url.toString();
}
