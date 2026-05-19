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
  Grid3X3,
  Headphones,
  Info,
  Link2,
  Maximize2,
  Minus,
  Play,
  Plus,
  Search,
  ZoomIn
} from "lucide-react";
import Link from "next/link";
import { MarkdownContent, SourceFigureBlock } from "@/components/markdown-content";
import type { ArchiveSource, CollectionItemSummary, SourceFile, SourceLineBox, SourcePage } from "@/lib/types";

type SourceReaderTabsProps = {
  source: ArchiveSource;
  transcript: string[];
};

type Tab = "overview" | "transcript" | "translation" | "original" | "details";

type ReaderTab = {
  id: Tab;
  label: string;
};

export function SourceReaderTabs({ source, transcript }: SourceReaderTabsProps) {
  const tabs = useMemo(() => buildReaderTabs(source, transcript), [source, transcript]);
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]?.id ?? "details");
  const pages = useMemo(() => buildDisplayPages(source, transcript), [source, transcript]);
  const translation = useMemo(() => getTranslationParagraphs(source), [source]);
  const activeTabIsVisible = tabs.some((tab) => tab.id === activeTab);
  const visibleActiveTab = activeTabIsVisible ? activeTab : tabs[0]?.id ?? "details";

  return (
    <div data-source-reader-tab={visibleActiveTab}>
      <div className="mt-5 border-b border-archive-line">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <TabButton active={visibleActiveTab === tab.id} key={tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </TabButton>
          ))}
        </div>
      </div>

      {visibleActiveTab === "overview" && (
        <CollectionOverview source={source} />
      )}

      {visibleActiveTab === "translation" && (
        <>
          <section className="mt-6 max-w-[49rem]">
            <TranslationReader source={source} paragraphs={translation} />
          </section>

          <div className="mt-8 max-w-[49rem]">
            <ReaderNotice
              icon={<BookOpen className="h-4 w-4" />}
              actionLabel={source.files?.some(isPdfFile) || source.sourceUrl !== "#" ? "View original source" : undefined}
              onAction={source.files?.some(isPdfFile) || source.sourceUrl !== "#" ? () => setActiveTab("original") : undefined}
            >
              <strong>You are reading an English translation.</strong> {source.translationNote || translationNote(source)}
            </ReaderNotice>
          </div>
        </>
      )}

      {visibleActiveTab === "transcript" && (
        <>
          <section className="mt-6 max-w-[49rem]">
            <TranscriptReader source={source} transcript={transcript} />
          </section>

          <div className="mt-8 max-w-[49rem]">
            <ReaderNotice icon={<BookOpen className="h-4 w-4" />} actionLabel="View original source" onAction={() => setActiveTab("original")}>
              <strong>You are in transcript reading mode.</strong> Looking for the source object?
            </ReaderNotice>
          </div>
        </>
      )}

      {visibleActiveTab === "original" && <OriginalSourceViewer pages={pages} source={source} transcript={transcript} />}

      {visibleActiveTab === "details" && (
        <SourceDetails source={source} pages={pages} />
      )}
    </div>
  );
}

function ReaderNotice({ actionLabel, children, icon, onAction }: { actionLabel?: string; children: React.ReactNode; icon: React.ReactNode; onAction?: () => void }) {
  return (
    <section className="mt-5 flex w-max max-w-full gap-3 rounded-md border border-archive-line bg-archive-surface/10 px-5 py-3 text-sm leading-6 shadow-[0_8px_24px_rgb(var(--archive-shadow)/0.05)]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-archive-violet/25 bg-archive-lavender2 text-archive-violet">
        {icon}
      </span>
      <p>
        {children}{" "}
        {actionLabel && onAction && (
          <button className="font-semibold text-archive-violet" type="button" onClick={onAction}>
            {actionLabel} <ExternalLink className="inline h-3.5 w-3.5" />
          </button>
        )}
      </p>
    </section>
  );
}

function TranscriptReader({ source, transcript }: { source: ArchiveSource; transcript: string[] }) {
  const sections = source.transcriptSections?.length
    ? source.transcriptSections
    : [{ heading: "Transcript", kind: "transcript" as const, paragraphs: transcript }];
  const overviewFigure = source.figures?.find((figure) => figure.position === "before_overview");

  return (
    <div className="space-y-9">
      {sections.map((section, index) => {
        const isNote = section.kind === "note";
        const isMediaTranscript = section.kind === "transcript" && isMediaSource(source);

        return (
          <section className={clsx(isNote && "source-transcript-note", isMediaTranscript && "source-media-transcript")} key={`${section.heading}-${index}`}>
            {index === 0 && overviewFigure && (
              <div className="mb-7">
                <SourceFigureBlock figure={overviewFigure} />
              </div>
            )}
            <h2 className="source-transcript-heading">{section.heading}</h2>
            {section.body && section.bodyFormat === "markdown" ? (
              <MarkdownContent className={clsx("source-transcript source-markdown mt-5 space-y-6 text-archive-ink", isNote && "source-transcript-note-body", isMediaTranscript && "source-media-transcript-body")} figures={source.figures} markdown={section.body} transcriptFormat={isMediaTranscript ? "media" : "prose"} />
            ) : (
              <div className={clsx("source-transcript mt-5 space-y-6 text-archive-ink", isNote && "source-transcript-note-body", isMediaTranscript && "source-media-transcript-body")}>
                {(section.paragraphs.length ? section.paragraphs : section.body ? [section.body] : []).map((paragraph, paragraphIndex) => (
                  isMediaTranscript ? (
                    <MediaTranscriptPlainParagraph key={`${paragraphIndex}-${paragraph.slice(0, 24)}`} text={paragraph} />
                  ) : (
                    <p key={`${paragraphIndex}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                  )
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function MediaTranscriptPlainParagraph({ text }: { text: string }) {
  const bracketCue = text.match(/^\[([^\]]+)\]$/);
  if (bracketCue) return <p className="source-media-transcript-cue source-media-transcript-cue-bracket">{bracketCue[1].trim()}</p>;

  const parentheticalCue = text.match(/^\(([^)]+)\)$/);
  if (parentheticalCue) return <p className="source-media-transcript-cue source-media-transcript-cue-parenthetical">{parentheticalCue[1].trim()}</p>;

  const speaker = text.match(/^([A-Z][^:\n]{0,47}:)\s+(.+)$/);
  if (speaker && isLikelySpeakerLabel(speaker[1])) {
    return (
      <p>
        <strong className="source-media-transcript-speaker">{speaker[1]}</strong>{" "}
        {speaker[2]}
      </p>
    );
  }

  return <p>{text}</p>;
}

function isLikelySpeakerLabel(label: string) {
  const withoutColon = label.replace(/:$/, "").trim();
  if (!withoutColon || withoutColon.length > 48) return false;
  if (/[!?()[\]{}]/.test(withoutColon)) return false;
  return /^[A-Z][\p{L}\p{M}.'’ -]*(?:\s+[A-Z][\p{L}\p{M}.'’ -]*)*$/u.test(withoutColon);
}

function isMediaSource(source: ArchiveSource) {
  return source.medium === "Audio/Video" || source.type === "Film" || source.readerMode === "audio" || source.readerMode === "video" || Boolean(source.mediaEmbedUrl);
}

function TranslationReader({ paragraphs, source }: { paragraphs: string[]; source: ArchiveSource }) {
  return (
    <div>
      <h2 className="source-transcript-heading">Translation</h2>
      {source.translationProvider && (
        <p className="mt-3 text-sm leading-6 text-archive-muted">
          Translation source: {translationProviderLabel(source.translationProvider)}
        </p>
      )}
      <div className="source-transcript mt-5 space-y-6 text-archive-ink">
        {paragraphs.map((paragraph, paragraphIndex) => (
          <p key={`${paragraphIndex}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

function CollectionOverview({ source }: { source: ArchiveSource }) {
  const items = source.collectionItems ?? [];
  const visibleItems = items.slice(0, 100);
  const overviewText = getCollectionOverviewText(source);
  const dateRange = collectionDateRange(items, source.displayDate);

  return (
    <section className="mt-2">
    

      {visibleItems.length ? (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-b border-archive-line pb-3">
            <div>
              <h3 className="font-serif text-xl font-semibold leading-tight text-archive-ink">Issue Index</h3>
              <p className="mt-1 text-sm text-archive-muted">
                {visibleItems.length.toLocaleString()} records, sorted by sequence and issue date.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {visibleItems.map((item) => (
              <CollectionItemCard item={item} key={item.id} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-archive-line bg-archive-surface p-6 text-sm leading-6 text-archive-muted">
          Item-level records have not been attached to this collection yet.
        </div>
      )}

      {items.length > visibleItems.length && (
        <p className="mt-4 text-sm text-archive-muted">
          Showing the first {visibleItems.length} items. Split this collection by year, volume, or series before exposing more than 100 parts on one page.
        </p>
      )}
    </section>
  );
}

function getCollectionOverviewText(source: ArchiveSource) {
  const overview = source.excerpt
    .split(/\n+/)
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().startsWith("overview:"))
    ?.replace(/^overview:\s*/i, "")
    .trim();

  return overview || "This compound source is organized as individual volumes, issues, or parts. Open an item below to read its transcript and inspect its source files.";
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[rgb(var(--archive-warm-line))] bg-archive-paper/70 px-3 py-2">
      <dt className="text-[0.62rem] font-bold uppercase tracking-[0.09em] text-archive-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-archive-ink">{value || "Not recorded"}</dd>
    </div>
  );
}

function CollectionItemCard({ item }: { item: CollectionItemSummary }) {
  const metadata = [item.displayDate, item.pageCount ? `${item.pageCount} pages` : ""].filter(Boolean).join(" · ");

  return (
    <Link
      className="focus-ring group overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-sm transition hover:border-archive-violet/35 hover:bg-[rgb(var(--archive-warm-hover))]"
      href={item.href || `/archive/${item.slug}`}
    >
      <span className="flex aspect-[3/4] items-center justify-center overflow-hidden border-b border-archive-line bg-archive-paper">
        {item.imagePath ? (
          <img alt={item.imageAlt || item.title} className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]" src={item.imagePath} />
        ) : (
          <Grid3X3 className="h-8 w-8 text-archive-violet/50" />
        )}
      </span>
      <span className="block p-3.5">
        <span className="flex min-h-4 items-center justify-between gap-3">
          {item.sequenceLabel ? (
            <span className="truncate text-[0.64rem] font-bold uppercase tracking-[0.08em] text-archive-violet">
              {item.sequenceLabel}
            </span>
          ) : (
            <span />
          )}
          {item.sequenceNumber !== undefined && (
            <span className="shrink-0 text-[0.68rem] font-semibold tabular-nums text-archive-muted">
              #{item.sequenceNumber}
            </span>
          )}
        </span>
        <span className="mt-2 line-clamp-2 block text-[0.95rem] font-semibold leading-5 text-archive-ink transition group-hover:text-archive-violetDark">
          {item.shortTitle || item.title}
        </span>
        {metadata && (
          <span className="mt-2 block text-xs leading-4 text-archive-muted">
            {metadata}
          </span>
        )}
        {item.tags?.length ? (
          <span className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 2).map((tag) => (
              <span className="rounded-full border border-archive-line px-2 py-0.5 text-[0.68rem] leading-4 text-archive-muted" key={tag}>
                {tag}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function collectionDateRange(items: CollectionItemSummary[], fallback: string) {
  const years = items
    .map((item) => item.displayDate?.match(/\b\d{4}\b/)?.[0])
    .filter(Boolean)
    .map(Number);
  if (!years.length) return fallback;
  const start = Math.min(...years);
  const end = Math.max(...years);
  return start === end ? String(start) : `${start}-${end}`;
}

function OriginalSourceViewer({ pages, source, transcript }: { pages: SourcePage[]; source: ArchiveSource; transcript: string[] }) {
  const originalMode = getOriginalMode(source, pages);
  const pdfFile = source.files?.find(isPdfFile);
  const mediaFile = source.files?.find((file) => isAudioFile(file) || isVideoFile(file));

  if (originalMode === "pdf" && pdfFile) {
    return <PdfSourceViewer file={pdfFile} source={source} />;
  }

  if (originalMode === "audio") {
    return <MediaSourceViewer file={mediaFile} source={source} type="audio" />;
  }

  if (originalMode === "video") {
    return <MediaSourceViewer file={mediaFile} source={source} type="video" />;
  }

  return <PageImageSourceViewer pages={pages} source={source} transcript={transcript} />;
}

function PdfSourceViewer({ file, source }: { file: SourceFile; source: ArchiveSource }) {
  return (
    <section className="mt-5 overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_12px_32px_rgb(var(--archive-shadow)/0.06)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-archive-line bg-white px-4 py-3 text-sm">
        <div>
          <h2 className="text-base font-semibold text-archive-ink">Original PDF</h2>
          <p className="mt-1 text-xs text-archive-muted">Source-language file for {source.title}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line px-3 py-2 font-medium hover:bg-archive-lavender2" href={file.url}>
            <Download className="h-4 w-4" />
            Download PDF
          </Link>
          {source.sourceUrl !== "#" && (
            <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line px-3 py-2 font-medium hover:bg-archive-lavender2" href={source.sourceUrl}>
              <ExternalLink className="h-4 w-4" />
              Source site
            </Link>
          )}
        </div>
      </div>
      <iframe className="h-[72vh] min-h-[42rem] w-full bg-archive-paper" src={file.url} title={`${source.title} PDF`} />
    </section>
  );
}

function MediaSourceViewer({ file, source, type }: { file?: SourceFile; source: ArchiveSource; type: "audio" | "video" }) {
  const embedUrl = toEmbedUrl(source.mediaEmbedUrl || (!file && source.sourceUrl !== "#" ? source.sourceUrl : undefined));
  const isVideo = type === "video";

  return (
    <section className="mt-5 rounded-md border border-archive-line bg-archive-surface p-5 shadow-[0_12px_32px_rgb(var(--archive-shadow)/0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-archive-lavender2 text-archive-violet">
          {isVideo ? <Play className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
        </span>
        <div>
          <h2 className="source-serif-heading">{isVideo ? "Original Video" : "Original Audio"}</h2>
        </div>
      </div>

      <div className="mt-5">
        {file && isVideo && <video className="aspect-video w-full rounded-md border border-archive-line bg-black" controls src={file.url} />}
        {file && !isVideo && <audio className="w-full" controls src={file.url} />}
        {!file && embedUrl && isEmbeddableUrl(embedUrl) && (
          <iframe className="aspect-video w-full rounded-md border border-archive-line bg-black" src={embedUrl} title={`${source.title} media`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        )}
        {!file && (!embedUrl || !isEmbeddableUrl(embedUrl)) && (
          <div className="rounded-md border border-dashed border-archive-line p-5 text-sm leading-6 text-archive-muted">
            Hosted media is not embedded for this source yet.
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {file && (
          <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line px-3 py-2 font-medium hover:bg-archive-lavender2" href={file.url}>
            <Download className="h-4 w-4" />
            Download source file
          </Link>
        )}
        {source.sourceUrl !== "#" && (
          <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-archive-line px-3 py-2 font-medium hover:bg-archive-lavender2" href={source.sourceUrl}>
            <ExternalLink className="h-4 w-4" />
            Source site
          </Link>
        )}
      </div>
    </section>
  );
}

function PageImageSourceViewer({ pages, source }: { pages: SourcePage[]; source: ArchiveSource; transcript: string[] }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPaulView, setIsPaulView] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(pages[0]?.lines[0]?.id);
  const currentPage = pages[pageIndex] ?? pages[0];
  const selectedLine = currentPage?.lines.find((line) => line.id === selectedLineId);
  const pdfFile = source.files?.find(isPdfFile);

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

  const imagePane = (
    <div className={clsx("relative overflow-auto bg-[#1f2024] p-5", isPaulView && "lg:order-2")}>
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
  );

  const transcriptPane = (
    <div className={clsx("flex min-h-[38rem] flex-col border-t border-archive-line bg-white lg:border-t-0", isPaulView ? "lg:order-1 lg:border-r" : "lg:border-l")}>
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
  );

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
          <button
            aria-pressed={isPaulView}
            className={clsx(
              "focus-ring inline-flex h-9 items-center rounded-md border px-3 font-medium transition",
              isPaulView ? "border-archive-violet bg-archive-lavender2 text-archive-violetDark" : "border-archive-line hover:bg-archive-lavender2"
            )}
            type="button"
            onClick={() => setIsPaulView((value) => !value)}
          >
            Paul view
          </button>
        </div>
      </div>

      <div className="grid min-h-[38rem] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.95fr)]">
        {imagePane}
        {transcriptPane}
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

function SourceDetails({ pages, source }: { pages: SourcePage[]; source: ArchiveSource }) {
  if (source.sourceKind === "collection") {
    return (
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <DetailPanel title="Collection">
          <DetailRow label="Citation" value={source.citation} />
          <DetailRow label="Archive ID" value={source.id} />
          <DetailRow label="Items" value={`${source.collectionItemCount ?? source.collectionItems?.length ?? 0}`} />
          <DetailRow label="Date range" value={source.displayDate} />
        </DetailPanel>
        <DetailPanel title="Access">
          <DetailRow label="Reader" value="Collection overview" />
          <DetailRow label="Item records" value="Open each item for transcript, original source, and item-level details." />
          <DetailRow label="Rights" value={source.rights} />
        </DetailPanel>
      </section>
    );
  }

  return (
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
        {source.sourceUrl !== "#" && (
          <Link className="focus-ring mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-archive-violet" href={source.sourceUrl}>
            Source link <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </DetailPanel>
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
  if (source.sourceKind === "collection") return [];

  const imagePages = source.pages?.filter((page) => page.imagePath);
  if (imagePages?.length) return imagePages;
  if (source.pages?.length) return source.pages;
  if (!transcript.length && !source.imagePath) return [];

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

function buildReaderTabs(source: ArchiveSource, transcript: string[]): ReaderTab[] {
  if (source.sourceKind === "collection") {
    return [
      { id: "overview", label: "Overview" },
      { id: "details", label: "Details" }
    ];
  }

  const tabs: ReaderTab[] = [];
  const hasTranslation = Boolean(source.translationText?.trim());
  const hasTranscript = transcript.some((paragraph) => paragraph.trim()) || Boolean(source.transcriptSections?.length);

  if (hasTranslation) {
    tabs.push({ id: "translation", label: "Translation" });
  } else if (hasTranscript) {
    tabs.push({ id: "transcript", label: "Transcript" });
  } else {
    tabs.push({ id: "details", label: "Overview" });
  }

  tabs.push({ id: "original", label: originalTabLabel(source) });

  if (!tabs.some((tab) => tab.id === "details")) {
    tabs.push({ id: "details", label: "Details" });
  }

  return tabs;
}

function originalTabLabel(source: ArchiveSource) {
  const mode = getOriginalMode(source, source.pages ?? []);
  if (mode === "pdf") return "Original PDF";
  if (mode === "audio") return "Original Audio";
  if (mode === "video") return "Original Video";
  if (source.pages?.some((page) => page.imagePath)) return "Page Images";
  return "Original source";
}

function getOriginalMode(source: ArchiveSource, pages: SourcePage[]) {
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

function getTranslationParagraphs(source: ArchiveSource) {
  return (source.translationText || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function translationNote(source: ArchiveSource) {
  const fromLanguage = source.contentLanguage || source.language || "the source language";
  const toLanguage = source.translationLanguage || "English";
  return `This ${toLanguage} translation is shown first for readability; cite or verify against the ${fromLanguage} original.`;
}

function translationProviderLabel(provider: NonNullable<ArchiveSource["translationProvider"]>) {
  if (provider === "llm") return "LLM-generated draft";
  if (provider === "human") return "Human translation";
  return "Published translation";
}

function isPdfFile(file: SourceFile) {
  return file.kind === "original_pdf" || file.kind === "pdf" || file.mimeType === "application/pdf";
}

function isAudioFile(file: SourceFile) {
  return file.kind === "audio" || Boolean(file.mimeType?.startsWith("audio/"));
}

function isVideoFile(file: SourceFile) {
  return file.kind === "video" || Boolean(file.mimeType?.startsWith("video/"));
}

function isEmbeddableUrl(url: string) {
  return /^https?:\/\//.test(url);
}

function toEmbedUrl(url?: string) {
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
