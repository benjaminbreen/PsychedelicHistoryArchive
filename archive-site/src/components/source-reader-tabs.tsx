"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Grid3X3,
  Headphones,
  Info,
  Link2,
  Maximize2,
  Minus,
  Play,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { MarkdownContent, SourceFigureBlock } from "@/components/markdown-content";
import { ArchiveImage } from "@/components/ui/archive-image";
import {
  buildDisplayPages,
  buildReaderTabs,
  buildReaderToc,
  getOriginalMode,
  isAudioFile,
  isEmbeddableUrl,
  isMediaSource,
  isPdfFile,
  isSiteEntry,
  isVideoFile,
  readerSectionId,
  siteEvidenceLabel,
  toEmbedUrl,
  translationNote,
  translationProviderLabel,
  visibleReaderTab,
  type ReaderTab,
  type ReaderTabId,
  type ReaderTocItem,
} from "@/lib/source-reader";
import type { ArchiveSource, CollectionItemSummary, SourceFile, SourceLineBox, SourcePage, SourcePageLine } from "@/lib/types";

type SourceReaderTabsProps = {
  source: ArchiveSource;
  transcript: string[];
};

export function SourceReaderTabs({ source, transcript }: SourceReaderTabsProps) {
  const tabs = useMemo(() => buildReaderTabs(source, transcript), [source, transcript]);
  const [activeTab, setActiveTab] = useState<ReaderTabId>(tabs[0]?.id ?? "details");
  const pages = useMemo(() => buildDisplayPages(source, transcript), [source, transcript]);
  const toc = useMemo(() => buildReaderToc(source, visibleReaderTab(activeTab, tabs), transcript), [activeTab, source, tabs, transcript]);
  const activeTabIsVisible = tabs.some((tab) => tab.id === activeTab);
  const visibleActiveTab = activeTabIsVisible ? activeTab : tabs[0]?.id ?? "details";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if ((params.has("page") || params.has("line")) && tabs.some((tab) => tab.id === "original")) {
      setActiveTab("original");
    }
  }, [tabs]);

  return (
    <div data-source-reader-tab={visibleActiveTab}>
      <ReaderTabNav activeTab={visibleActiveTab} onTabChange={setActiveTab} tabs={tabs} toc={toc} />

      {visibleActiveTab === "overview" && (
        <CollectionOverview source={source} />
      )}

      {visibleActiveTab === "translation" && (
        <>
          <section className="mt-6 max-w-[49rem]">
            <TranslationReader source={source} />
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

          {!isSiteEntry(source) && (
            <div className="mt-8 max-w-[49rem]">
              <ReaderNotice icon={<BookOpen className="h-4 w-4" />} actionLabel="View original source" onAction={() => setActiveTab("original")}>
                <strong>You are in transcript reading mode.</strong> Looking for the source object?
              </ReaderNotice>
            </div>
          )}
        </>
      )}

      {visibleActiveTab === "original" && <OriginalSourceViewer pages={pages} source={source} transcript={transcript} />}
      {visibleActiveTab === "sourcePdf" && <OriginalPdfSourceViewer source={source} />}

      {visibleActiveTab === "details" && (
        <SourceDetails source={source} pages={pages} />
      )}
    </div>
  );
}

function ReaderTabNav({ activeTab, onTabChange, tabs, toc }: { activeTab: ReaderTabId; onTabChange: (tab: ReaderTabId) => void; tabs: ReaderTab[]; toc: ReaderTocItem[] }) {
  const [tocOpen, setTocOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(toc[0]?.id ?? "");
  const activeSection = toc.find((item) => item.id === activeSectionId) ?? toc[0];

  useEffect(() => {
    setTocOpen(false);
    setActiveSectionId(toc[0]?.id ?? "");
  }, [activeTab, toc]);

  useEffect(() => {
    if (typeof window === "undefined" || toc.length < 2) return;

    const elements = toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visibleEntry?.target.id) {
          setActiveSectionId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-116px 0px -68% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <div className="source-reader-tab-bar">
      <div className="grid min-w-0 gap-2 border-b border-archive-line sm:flex sm:items-end sm:justify-between sm:gap-5">
        <div className="flex min-w-0 gap-6 overflow-x-auto sm:gap-8">
          {tabs.map((tab) => (
            <TabButton active={activeTab === tab.id} key={tab.id} onClick={() => onTabChange(tab.id)}>
              {tab.label}
            </TabButton>
          ))}
        </div>

        {toc.length > 1 && activeSection && (
          <div className="relative mb-2 shrink-0">
            <button
              aria-expanded={tocOpen}
              className="source-reader-toc-button"
              onClick={() => setTocOpen((open) => !open)}
              type="button"
            >
              <span className="source-reader-toc-kicker">Section</span>
              <span className="max-w-[13rem] truncate">{activeSection.label}</span>
              <ChevronDown className={clsx("h-4 w-4 transition", tocOpen && "rotate-180")} />
            </button>

            {tocOpen && (
              <div className="source-reader-toc-menu">
                {toc.map((item) => (
                  <a
                    className={clsx("source-reader-toc-item", item.id === activeSection.id && "source-reader-toc-item-active")}
                    href={`#${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setActiveSectionId(item.id);
                      setTocOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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
            <h2 className="source-transcript-heading" id={readerSectionId(section.heading)}>{section.heading}</h2>
            {section.body && section.bodyFormat === "markdown" ? (
              <MarkdownContent citationLinks={source.citationLinks} className={clsx("source-transcript source-markdown mt-5 space-y-6 text-archive-ink", isNote && "source-transcript-note-body", isMediaTranscript && "source-media-transcript-body")} figures={source.figures} markdown={section.body} transcriptFormat={isMediaTranscript ? "media" : "prose"} />
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

function TranslationReader({ source }: { source: ArchiveSource }) {
  const translation = source.translationText?.trim() || "";

  return (
    <div>
      <h2 className="source-transcript-heading">Translation</h2>
      {source.translationProvider && (
        <p className="mt-3 text-sm leading-6 text-archive-muted">
          Translation source: {translationProviderLabel(source.translationProvider)}
        </p>
      )}
      <MarkdownContent citationLinks={source.citationLinks} className="source-transcript source-markdown mt-5 space-y-6 text-archive-ink" figures={source.figures} markdown={translation} transcriptFormat="prose" />
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
      <div className="grid gap-4 rounded-md border border-archive-line bg-archive-surface p-5 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <h2 className="source-serif-heading">Collection Overview</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-archive-ink">
            {overviewText}
          </p>
        </div>
        <dl className="grid gap-2 text-sm">
          <OverviewStat label="Items" value={`${items.length || source.collectionItemCount || 0}`} />
          <OverviewStat label="Date range" value={dateRange} />
        </dl>
      </div>

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
          <ArchiveImage
            alt={item.imageAlt || item.title}
            className="h-full w-full"
            imageClassName="transition duration-200 group-hover:scale-[1.02]"
            src={item.imagePath}
          />
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

function OriginalPdfSourceViewer({ source }: { source: ArchiveSource }) {
  const pdfFile = source.files?.find(isPdfFile);
  if (!pdfFile) return null;
  return <PdfSourceViewer file={pdfFile} source={source} />;
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
      <iframe className="h-[72vh] min-h-[26rem] w-full bg-archive-paper sm:min-h-[42rem]" src={file.url} title={`${source.title} PDF`} />
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
  const [isFitWidth, setIsFitWidth] = useState(false);
  const [fitWidthPx, setFitWidthPx] = useState<number>();
  const [arePanesSwapped, setArePanesSwapped] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(pages[0]?.lines[0]?.id);
  const [isCitationPanelOpen, setIsCitationPanelOpen] = useState(false);
  const imagePaneRef = useRef<HTMLDivElement>(null);
  const currentPage = pages[pageIndex] ?? pages[0];
  const selectedLine = currentPage?.lines.find((line) => line.id === selectedLineId);
  const pdfFile = source.files?.find(isPdfFile);
  const updateFitWidth = useCallback(() => {
    const pane = imagePaneRef.current;
    if (!pane || typeof window === "undefined") return;

    const style = window.getComputedStyle(pane);
    const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
    setFitWidthPx(Math.max(280, Math.floor(pane.clientWidth - horizontalPadding)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const pageAnchor = params.get("page");
    const lineAnchor = params.get("line");
    if (!pageAnchor && !lineAnchor) return;

    const nextPageIndex = resolvePageIndex(pages, pageAnchor) ?? 0;
    const nextPage = pages[nextPageIndex];
    if (!nextPage) return;

    const nextLine = resolveLineAnchor(nextPage, lineAnchor) ?? nextPage.lines[0];
    setPageIndex(nextPageIndex);
    setSelectedLineId(nextLine?.id);
    setIsCitationPanelOpen(Boolean(lineAnchor));
  }, [pages]);

  useEffect(() => {
    if (!isFitWidth) return;
    updateFitWidth();

    const pane = imagePaneRef.current;
    if (!pane || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateFitWidth);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [currentPage?.imagePath, isFitWidth, updateFitWidth]);

  if (!currentPage) {
    return (
      <section className="mt-6 rounded-md border border-archive-line bg-archive-surface p-6 text-sm text-archive-muted">
        Original page images have not been ingested for this source yet.
      </section>
    );
  }

  function movePage(direction: -1 | 1) {
    const nextIndex = Math.min(Math.max(pageIndex + direction, 0), pages.length - 1);
    selectPage(nextIndex);
  }

  function selectPage(nextIndex: number) {
    const nextLine = pages[nextIndex]?.lines[0];
    setPageIndex(nextIndex);
    setSelectedLineId(nextLine?.id);
    updateLineAnchorUrl(pages[nextIndex], nextLine);
  }

  function selectLine(line: SourcePageLine) {
    setSelectedLineId(line.id);
    updateLineAnchorUrl(currentPage, line);
  }

  function changeZoom(nextZoom: (value: number) => number) {
    setIsFitWidth(false);
    setFitWidthPx(undefined);
    setZoom(nextZoom);
  }

  function fitPageToWidth() {
    setIsFitWidth(true);
    setZoom(1);
    updateFitWidth();
  }

  const imagePane = (
    <div className={clsx("relative overflow-auto bg-[#1f2024] p-5", arePanesSwapped && "lg:order-2")} ref={imagePaneRef}>
      <div className="mx-auto flex min-h-[24rem] items-center justify-center sm:min-h-[34rem]">
        <div className="relative origin-top transition-transform" style={{ transform: `scale(${zoom})` }}>
          {currentPage.imagePath ? (
            <img
              alt={`${source.title}, page ${currentPage.label}`}
              className={clsx(
                "border border-black/20 bg-archive-paper shadow-2xl",
                isFitWidth ? "h-auto max-w-none" : "max-h-[58rem] w-auto max-w-full"
              )}
              src={currentPage.imagePath}
              style={isFitWidth && fitWidthPx ? { width: `${fitWidthPx}px` } : undefined}
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
    <div className={clsx("flex min-h-[24rem] flex-col border-t border-archive-line bg-white sm:min-h-[38rem] lg:border-t-0", arePanesSwapped ? "lg:order-1 lg:border-r" : "lg:border-l")}>
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
          <button
            aria-controls="line-citation-panel"
            aria-expanded={isCitationPanelOpen}
            className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md border border-archive-line px-2.5 text-archive-ink hover:bg-archive-lavender2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedLine}
            type="button"
            onClick={() => setIsCitationPanelOpen((value) => !value)}
          >
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
              onClick={() => selectLine(line)}
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
              selectPage(nextIndex);
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

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <IconButton label="Zoom out" onClick={() => changeZoom((value) => Math.max(0.7, value - 0.1))}>
            <Minus className="h-4 w-4" />
          </IconButton>
          <span className="min-w-14 text-center text-xs font-medium">{Math.round(zoom * 100)}%</span>
          <IconButton label="Zoom in" onClick={() => changeZoom((value) => Math.min(1.8, value + 0.1))}>
            <Plus className="h-4 w-4" />
          </IconButton>
          <button
            aria-pressed={isFitWidth}
            className={clsx(
              "focus-ring inline-flex h-9 items-center gap-2 rounded-md border px-3 font-medium transition",
              isFitWidth ? "border-archive-violet bg-archive-lavender2 text-archive-violetDark" : "border-archive-line hover:bg-archive-lavender2"
            )}
            type="button"
            onClick={fitPageToWidth}
          >
            <Maximize2 className="h-4 w-4" />
            <span className="hidden sm:inline">Fit width</span>
          </button>
          <button
            aria-pressed={arePanesSwapped}
            className={clsx(
              "focus-ring hidden h-9 items-center rounded-md border px-3 font-medium transition lg:inline-flex",
              arePanesSwapped ? "border-archive-violet bg-archive-lavender2 text-archive-violetDark" : "border-archive-line hover:bg-archive-lavender2"
            )}
            type="button"
            onClick={() => setArePanesSwapped((value) => !value)}
          >
            Swap panes
          </button>
        </div>
      </div>

      <div className="grid min-h-[24rem] sm:min-h-[38rem] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.95fr)]">
        {imagePane}
        {transcriptPane}
      </div>

      {isCitationPanelOpen && selectedLine && (
        <LineCitationPanel
          line={selectedLine}
          page={currentPage}
          source={source}
          onClose={() => setIsCitationPanelOpen(false)}
        />
      )}

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

function LineCitationPanel({
  line,
  onClose,
  page,
  source
}: {
  line: SourcePageLine;
  onClose: () => void;
  page: SourcePage;
  source: ArchiveSource;
}) {
  const shareUrl = buildLineShareUrl(source, page, line);
  const archiveCitation = buildArchiveLineCitation(source, page, line, shareUrl);
  const chicagoCitation = buildChicagoLineCitation(source, page, line, shareUrl);
  const mlaCitation = buildMlaLineCitation(source, page, line, shareUrl);
  const status = line.transcriptionStatus || page.transcriptionStatus || "Not recorded";
  const reviewer = line.reviewedBy || page.transcriptionReviewedBy || "Not recorded";
  const reviewedAt = line.reviewedAt || page.transcriptionReviewedAt;

  return (
    <aside className="border-t border-archive-line bg-archive-lavender2/35 px-5 py-5" id="line-citation-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-semibold leading-tight text-archive-ink">Line Details & Citation</h3>
          <p className="mt-1 text-sm text-archive-muted">
            Stable reference for page {page.label}, line {line.index}.
          </p>
        </div>
        <button className="focus-ring rounded-md border border-archive-line bg-white px-3 py-1.5 text-xs font-semibold text-archive-ink hover:bg-archive-surface" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <blockquote className="mt-4 border-l-4 border-archive-violet bg-white px-4 py-3 font-mono text-[13px] leading-6 text-archive-ink">
        {line.text}
      </blockquote>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <div className="rounded-md border border-archive-line bg-white p-4">
          <h4 className="text-sm font-semibold text-archive-ink">Citation</h4>
          <p className="mt-2 text-sm leading-6 text-archive-muted">{archiveCitation}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyValueButton label="Copy line" value={line.text} />
            <CopyValueButton label="Copy link" value={shareUrl} />
            <CopyValueButton label="Copy citation" value={archiveCitation} />
            <CopyValueButton label="Copy Chicago" value={chicagoCitation} />
            <CopyValueButton label="Copy MLA" value={mlaCitation} />
          </div>
        </div>

        <dl className="rounded-md border border-archive-line bg-white p-4 text-sm">
          <LineDetail label="Source" value={source.title} />
          <LineDetail label="Page" value={page.label} />
          <LineDetail label="Line" value={`${line.index}`} />
          <LineDetail label="Status" value={formatStatus(status)} />
          <LineDetail label="Reviewed by" value={reviewer} />
          {reviewedAt && <LineDetail label="Reviewed" value={formatDateLabel(reviewedAt)} />}
          <LineDetail label="OCR confidence" value={formatConfidence(line.confidence ?? page.ocrConfidence)} />
          <LineDetail label="Image anchor" value={line.box ? "Bounding box recorded" : "No bounding box"} />
          {page.transcriptionNote && <LineDetail label="Note" value={page.transcriptionNote} />}
        </dl>
      </div>
    </aside>
  );
}

function CopyValueButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md border border-archive-line bg-archive-surface px-2.5 text-xs font-semibold text-archive-ink hover:border-archive-violet/40 hover:bg-archive-lavender2"
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function LineDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-archive-line/80 py-2 first:pt-0 last:border-b-0 last:pb-0">
      <dt className="font-semibold text-archive-ink">{label}</dt>
      <dd className="leading-5 text-archive-muted">{value || "Not recorded"}</dd>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={clsx(
        "whitespace-nowrap px-1 py-2.5 text-sm font-semibold transition",
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

function resolvePageIndex(pages: SourcePage[], pageAnchor: string | null) {
  if (!pageAnchor) return undefined;
  const decoded = decodeURIComponent(pageAnchor).trim();
  const index = pages.findIndex((page) =>
    page.id === decoded ||
    String(page.pageNumber) === decoded ||
    page.label === decoded
  );
  return index >= 0 ? index : undefined;
}

function resolveLineAnchor(page: SourcePage, lineAnchor: string | null) {
  if (!lineAnchor) return undefined;
  const decoded = decodeURIComponent(lineAnchor).trim();
  return page.lines.find((line) => line.id === decoded || String(line.index) === decoded);
}

function updateLineAnchorUrl(page?: SourcePage, line?: SourcePageLine) {
  if (typeof window === "undefined" || !page) return;
  const url = new URL(window.location.href);
  url.searchParams.set("page", pageAnchorValue(page));
  if (line) {
    url.searchParams.set("line", lineAnchorValue(line));
  } else {
    url.searchParams.delete("line");
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function buildLineShareUrl(source: ArchiveSource, page: SourcePage, line: SourcePageLine) {
  const path = `/archive/${source.slug}?page=${encodeURIComponent(pageAnchorValue(page))}&line=${encodeURIComponent(lineAnchorValue(line))}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function pageAnchorValue(page: SourcePage) {
  return String(page.pageNumber || page.label || page.id);
}

function lineAnchorValue(line: SourcePageLine) {
  return String(line.index || line.id);
}

function buildArchiveLineCitation(source: ArchiveSource, page: SourcePage, line: SourcePageLine, shareUrl: string) {
  return `${source.title}, ${source.displayDate}. ${source.citation}. Page ${page.label}, line ${line.index}. The Psychedelic History Archive. ${shareUrl}`;
}

function buildChicagoLineCitation(source: ArchiveSource, page: SourcePage, line: SourcePageLine, shareUrl: string) {
  return `${source.author || source.title}. "${source.title}." ${source.displayDate}. The Psychedelic History Archive, page ${page.label}, line ${line.index}. ${shareUrl}.`;
}

function buildMlaLineCitation(source: ArchiveSource, page: SourcePage, line: SourcePageLine, shareUrl: string) {
  return `${source.author || source.title}. "${source.title}." The Psychedelic History Archive, ${source.displayDate}, p. ${page.label}, line ${line.index}. ${shareUrl}.`;
}

function formatConfidence(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return "Not recorded";
  const percentage = value <= 1 ? value * 100 : value;
  return `${Math.round(percentage)}%`;
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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

  if (isSiteEntry(source)) {
    return (
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <DetailPanel title="Site Entry">
          <DetailRow label="Citation" value={source.citation} />
          <DetailRow label="Archive ID" value={source.id} />
          <DetailRow label="Date range" value={source.displayDate} />
          <DetailRow label="Region" value={source.region} />
        </DetailPanel>
        <DetailPanel title="Evidence">
          <DetailRow label="Entry type" value="Project-authored archaeological site writeup" />
          <DetailRow label="Evidence" value={siteEvidenceLabel(source)} />
          <DetailRow label="Substances" value={source.substances?.length ? source.substances.join(", ") : "See entry text"} />
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
