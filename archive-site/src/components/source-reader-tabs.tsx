"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Info,
  Link2,
  Maximize2,
  Minus,
  Plus,
  Search,
  ZoomIn
} from "lucide-react";
import Link from "next/link";
import type { ArchiveSource, SourceFigure, SourceLineBox, SourcePage, TranscriptSection } from "@/lib/types";

type SourceReaderTabsProps = {
  source: ArchiveSource;
  transcript: string[];
};

type Tab = "transcript" | "original" | "details";

export function SourceReaderTabs({ source, transcript }: SourceReaderTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("transcript");
  const pages = useMemo(() => buildDisplayPages(source, transcript), [source, transcript]);

  return (
    <>
      <div className="mt-5 border-b border-archive-line">
        <div className="flex gap-8">
          <TabButton active={activeTab === "transcript"} onClick={() => setActiveTab("transcript")}>
            Transcript
          </TabButton>
          <TabButton active={activeTab === "original"} onClick={() => setActiveTab("original")}>
            Original source
          </TabButton>
          <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>
            Details
          </TabButton>
        </div>
      </div>

      {activeTab === "transcript" && (
        <>
          <section className="mt-5 flex gap-4 rounded-md border border-archive-line bg-archive-surface px-5 py-3.5 text-sm leading-6 shadow-[0_8px_24px_rgb(var(--archive-shadow)/0.05)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-archive-violet/25 bg-archive-lavender2 text-archive-violet">
              <BookOpen className="h-4 w-4" />
            </span>
            <div>
              <p>
                <strong>You are in transcript reading mode.</strong> This is a text-only version of the source for easier reading and search.
              </p>
              <p className="mt-1">
                Looking for the scanned original?{" "}
                <button className="font-semibold text-archive-violet" type="button" onClick={() => setActiveTab("original")}>
                  View original source <ExternalLink className="inline h-3.5 w-3.5" />
                </button>
              </p>
            </div>
          </section>

          <section className="mt-6 max-w-[49rem]">
            <TranscriptReader source={source} transcript={transcript} />
          </section>
        </>
      )}

      {activeTab === "original" && <OriginalSourceViewer pages={pages} source={source} />}

      {activeTab === "details" && (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <DetailPanel title="Citation">
            <DetailRow label="Citation" value={source.citation} />
            <DetailRow label="Archive ID" value={source.id} />
            <DetailRow label="Rights" value={source.rights} />
            <DetailRow label="Language" value={source.language} />
          </DetailPanel>
          <DetailPanel title="Original Files">
            <DetailRow label="Hosting" value={source.hostingStatus.replaceAll("_", " ")} />
            <DetailRow label="Pages" value={pages.length ? `${pages.length} page${pages.length === 1 ? "" : "s"}` : "Not ingested"} />
            <DetailRow label="Line OCR" value={pages.some((page) => page.lines.length) ? "Available" : "Pending"} />
            <Link className="focus-ring mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-archive-violet" href={source.sourceUrl}>
              Source link <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </DetailPanel>
        </section>
      )}
    </>
  );
}

function TranscriptReader({ source, transcript }: { source: ArchiveSource; transcript: string[] }) {
  const sections = source.transcriptSections?.length
    ? source.transcriptSections
    : [{ heading: "Transcript", kind: "transcript" as const, paragraphs: transcript }];
  const overviewFigure = source.figures?.find((figure) => figure.position === "before_overview") ?? source.figures?.[0];

  return (
    <div className="space-y-9">
      {sections.map((section, index) => (
        <section key={`${section.heading}-${index}`}>
          {index === 0 && overviewFigure && <SourceFigureBlock figure={overviewFigure} />}
          <h2 className="source-transcript-heading">{section.heading}</h2>
          <div className="source-transcript mt-5 space-y-6 text-archive-ink">
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={`${paragraphIndex}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SourceFigureBlock({ figure }: { figure: SourceFigure }) {
  return (
    <figure className="mb-7 overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.05)]">
      {figure.imagePath && (
        <img
          alt={figure.alt || figure.caption}
          className="max-h-[32rem] w-full object-cover"
          src={figure.imagePath}
        />
      )}
      <figcaption className="border-t border-archive-line px-4 py-3 text-sm italic leading-6 text-archive-muted">
        {figure.caption}
      </figcaption>
    </figure>
  );
}

function OriginalSourceViewer({ pages, source }: { pages: SourcePage[]; source: ArchiveSource }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(pages[0]?.lines[0]?.id);
  const currentPage = pages[pageIndex] ?? pages[0];
  const selectedLine = currentPage?.lines.find((line) => line.id === selectedLineId);
  const pdfFile = source.files?.find((file) => file.kind === "original_pdf" || file.mimeType === "application/pdf");

  if (!currentPage) {
    return (
      <section className="mt-6 rounded-md border border-archive-line bg-archive-surface p-6 text-sm text-archive-muted">
        Original page images have not been ingested for this source yet.
      </section>
    );
  }

  function movePage(direction: -1 | 1) {
    const nextIndex = Math.min(Math.max(pageIndex + direction, 0), pages.length - 1);
    setPageIndex(nextIndex);
    setSelectedLineId(pages[nextIndex]?.lines[0]?.id);
  }

  return (
    <section className="mt-5 overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_12px_32px_rgb(var(--archive-shadow)/0.06)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-archive-line bg-white px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-archive-muted">Page</span>
          <select
            className="focus-ring h-9 rounded-md border border-archive-line bg-white px-3 text-sm"
            value={pageIndex}
            onChange={(event) => {
              const nextIndex = Number(event.target.value);
              setPageIndex(nextIndex);
              setSelectedLineId(pages[nextIndex]?.lines[0]?.id);
            }}
          >
            {pages.map((page, index) => (
              <option key={page.id} value={index}>
                {page.label}
              </option>
            ))}
          </select>
          <span className="text-archive-muted">of {pages.length}</span>
          <IconButton label="Previous page" disabled={pageIndex === 0} onClick={() => movePage(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton label="Next page" disabled={pageIndex === pages.length - 1} onClick={() => movePage(1)}>
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <IconButton label="Zoom out" onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))}>
            <Minus className="h-4 w-4" />
          </IconButton>
          <span className="min-w-14 text-center text-xs font-medium">{Math.round(zoom * 100)}%</span>
          <IconButton label="Zoom in" onClick={() => setZoom((value) => Math.min(1.8, value + 0.1))}>
            <Plus className="h-4 w-4" />
          </IconButton>
          <button className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-archive-line px-3 font-medium hover:bg-archive-lavender2" type="button" onClick={() => setZoom(1)}>
            <Maximize2 className="h-4 w-4" />
            Fit width
          </button>
        </div>
      </div>

      <div className="grid min-h-[38rem] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.95fr)]">
        <div className="relative overflow-auto bg-[#1f2024] p-5">
          <div className="absolute left-4 top-4 z-10 hidden overflow-hidden rounded-md border border-white/15 bg-white shadow md:block">
            {[FileText, Search, ZoomIn].map((Icon, index) => (
              <button className="block border-b border-archive-line p-2.5 last:border-b-0 hover:bg-archive-lavender2" type="button" key={index}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="mx-auto flex min-h-[34rem] items-center justify-center">
            <div className="relative origin-top transition-transform" style={{ transform: `scale(${zoom})` }}>
              {currentPage.imagePath ? (
                <img
                  alt={`${source.title}, page ${currentPage.label}`}
                  className="max-h-[58rem] w-auto max-w-full border border-black/20 bg-archive-paper shadow-2xl"
                  src={currentPage.imagePath}
                />
              ) : (
                <div className="flex aspect-[3/4] w-[26rem] max-w-full items-center justify-center border border-archive-line bg-archive-paper p-8 text-center text-sm text-archive-muted shadow-2xl">
                  Page image pending for page {currentPage.label}
                </div>
              )}
              {selectedLine?.box && <LineOverlay box={selectedLine.box} page={currentPage} />}
            </div>
          </div>
        </div>

        <div className="flex min-h-[38rem] flex-col border-t border-archive-line bg-white lg:border-l lg:border-t-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-archive-line px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-archive-ink">Line-by-line transcript</h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-archive-muted">
                <Link2 className="h-3.5 w-3.5" />
                Linked to page {currentPage.label}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs text-archive-muted">
              <span>Transcript language: {currentPage.language || source.language}</span>
              <button className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md border border-archive-line px-2.5 text-archive-ink hover:bg-archive-lavender2" type="button">
                <Info className="h-3.5 w-3.5" />
                Details & citation
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-4 font-mono text-[12.5px] leading-6">
            {currentPage.lines.length ? (
              currentPage.lines.map((line) => (
                <button
                  className={clsx(
                    "grid w-full grid-cols-[2.25rem_1fr] gap-3 rounded-sm px-2 text-left transition",
                    selectedLineId === line.id ? "bg-archive-lavender2 text-archive-violetDark ring-1 ring-archive-violet/20" : "hover:bg-archive-paper"
                  )}
                  key={line.id}
                  type="button"
                  onClick={() => setSelectedLineId(line.id)}
                >
                  <span className="select-none text-right text-archive-muted">{line.index}</span>
                  <span>{line.text}</span>
                </button>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-archive-line p-4 font-sans text-sm text-archive-muted">
                Line-level transcription is pending for this page.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-archive-line bg-white px-4 py-3 text-sm">
        <span className="text-archive-muted">
          {currentPage.transcriptionStatus || "Transcription status pending"}
        </span>
        <div className="ml-auto flex gap-2">
          {pdfFile && (
            <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line px-3 py-2 font-medium hover:bg-archive-lavender2" href={pdfFile.url}>
              <Download className="h-4 w-4" />
              Download PDF
            </Link>
          )}
          <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line px-3 py-2 font-medium hover:bg-archive-lavender2" href={source.sourceUrl}>
            <ExternalLink className="h-4 w-4" />
            Source site
          </Link>
        </div>
      </div>
    </section>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={clsx(
        "px-1 py-2.5 text-sm font-semibold transition",
        active ? "border-b-2 border-archive-violet text-archive-violet" : "text-archive-muted hover:text-archive-ink"
      )}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function IconButton({ children, disabled, label, onClick }: { children: React.ReactNode; disabled?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-archive-line text-archive-ink transition hover:bg-archive-lavender2 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function LineOverlay({ box, page }: { box: SourceLineBox; page: SourcePage }) {
  const left = normalizedDimension(box.x, page.imageWidth);
  const top = normalizedDimension(box.y, page.imageHeight);
  const width = normalizedDimension(box.width, page.imageWidth);
  const height = normalizedDimension(box.height, page.imageHeight);

  return (
    <div
      className="pointer-events-none absolute border-l-4 border-archive-violet bg-archive-violet/14 ring-1 ring-archive-violet/40"
      style={{
        left: `${left * 100}%`,
        top: `${top * 100}%`,
        width: `${width * 100}%`,
        height: `${Math.max(height, 0.012) * 100}%`
      }}
    />
  );
}

function normalizedDimension(value: number, total?: number) {
  if (value <= 1) return value;
  if (!total || total <= 0) return 0;
  return value / total;
}

function DetailPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-5">
      <h2 className="source-serif-heading">{title}</h2>
      <dl className="mt-4 space-y-3">{children}</dl>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3 border-b border-archive-line/80 pb-3 text-sm last:border-b-0">
      <dt className="font-semibold text-archive-ink">{label}</dt>
      <dd className="leading-5 text-archive-muted">{value || "Not recorded"}</dd>
    </div>
  );
}

function buildDisplayPages(source: ArchiveSource, transcript: string[]) {
  if (source.pages?.length) return source.pages;

  const lines = transcript.flatMap((paragraph, paragraphIndex) =>
    wrapLine(paragraph, 82).map((text, index) => ({
      id: `${source.id}-fallback-${paragraphIndex}-${index}`,
      index: index + 1,
      text,
      paragraphIndex
    }))
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
      lines
    }
  ];
}

function wrapLine(text: string, maxLength: number): string[] {
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
