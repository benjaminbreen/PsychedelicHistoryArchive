"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { markdownHeadingId, parseMarkdown, type Footnote, type MarkdownBlock as ParsedMarkdownBlock } from "@/lib/markdown";
import type { SourceCitationLink, SourceFigure } from "@/lib/types";

type MarkdownContentProps = {
  className?: string;
  figures?: SourceFigure[];
  markdown: string;
  transcriptFormat?: "media" | "prose";
  citationLinks?: SourceCitationLink[];
};

type InlineParseOptions = {
  sidenotes?: Footnote[];
  citationLinks?: SourceCitationLink[];
};

type WikipediaPreview = {
  title: string;
  extract: string;
  thumbnail?: string;
};

type PreviewPosition = {
  left: number;
  top: number;
  transform?: string;
};

const wikipediaPreviewCache = new Map<string, Promise<WikipediaPreview | null>>();

export function MarkdownContent({ citationLinks = [], className, figures = [], markdown, transcriptFormat = "prose" }: MarkdownContentProps) {
  const parsed = parseMarkdown(markdown);
  const hasFootnotesBlock = parsed.blocks.some((block) => block.type === "footnotes");
  const inlineOptions = { citationLinks };

  return (
    <div className={className}>
      {parsed.blocks.map((block, index) => (
        <MarkdownBlock block={block} figures={figures} footnoteMap={parsed.footnoteMap} inlineOptions={inlineOptions} key={`${block.type}-${index}`} transcriptFormat={transcriptFormat} />
      ))}
      {parsed.footnotes.length > 0 && !hasFootnotesBlock && <Footnotes footnotes={parsed.footnotes} />}
    </div>
  );
}

function MarkdownBlock({ block, figures, footnoteMap, inlineOptions, transcriptFormat }: { block: ParsedMarkdownBlock; figures: SourceFigure[]; footnoteMap: Map<string, Footnote>; inlineOptions: InlineParseOptions; transcriptFormat: "media" | "prose" }) {
  if (block.type === "heading") {
    const content = parseInline(block.text, footnoteMap);
    if (block.depth <= 2) return <h3 className="source-markdown-heading" id={block.id}>{content}</h3>;
    return <h4 className="source-markdown-subheading" id={block.id}>{content}</h4>;
  }

  if (block.type === "blockquote") {
    return (
      <blockquote className="border-l-2 border-archive-violet/60 pl-5 text-archive-ink/90">
        {block.lines.map((line, index) => (
          <MarkdownParagraph footnoteMap={footnoteMap} inlineOptions={inlineOptions} key={`${index}-${line.slice(0, 16)}`} text={line} />
        ))}
      </blockquote>
    );
  }

  if (block.type === "code") {
    return (
      <pre className="overflow-auto rounded-md border border-archive-line bg-archive-paper p-4 font-mono text-sm leading-6">
        <code>{block.text}</code>
      </pre>
    );
  }

  if (block.type === "footnotes") {
    return <Footnotes footnotes={[...footnoteMap.values()]} />;
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag className={block.ordered ? "list-decimal space-y-2 pl-7" : "list-disc space-y-2 pl-7"}>
        {block.items.map((item, index) => (
          <li key={`${index}-${item.slice(0, 16)}`}>
            <MarkdownInlineWithSidenotes footnoteMap={footnoteMap} inlineOptions={inlineOptions} text={item} />
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "figure") {
    const figure = figures.find((item) => item.token === block.token || item.id === block.token);
    if (!figure) {
      return (
        <p className="rounded-md border border-dashed border-archive-line p-3 font-mono text-sm text-archive-muted">
          {`{{figure:${block.token}}}`}
        </p>
      );
    }
    return <SourceFigureBlock figure={figure} />;
  }

  if (block.type === "figure-row") {
    const rowFigures = block.tokens
      .map((token) => figures.find((item) => item.token === token || item.id === token))
      .filter(Boolean) as SourceFigure[];
    const missingTokens = block.tokens.filter((token) => !figures.some((item) => item.token === token || item.id === token));
    return <SourceFigureRow figures={rowFigures} missingTokens={missingTokens} />;
  }

  if (transcriptFormat === "media") {
    return <MediaTranscriptParagraph footnoteMap={footnoteMap} inlineOptions={inlineOptions} text={block.text} />;
  }

  return <MarkdownParagraph footnoteMap={footnoteMap} inlineOptions={inlineOptions} text={block.text} />;
}

function MarkdownParagraph({ footnoteMap, inlineOptions, text }: { footnoteMap: Map<string, Footnote>; inlineOptions?: InlineParseOptions; text: string }) {
  const sidenotes: Footnote[] = [];
  return (
    <p>
      {parseInline(text, footnoteMap, { ...inlineOptions, sidenotes })}
      <SidenoteStack footnotes={sidenotes} />
    </p>
  );
}

function MarkdownInlineWithSidenotes({ footnoteMap, inlineOptions, text }: { footnoteMap: Map<string, Footnote>; inlineOptions?: InlineParseOptions; text: string }) {
  const sidenotes: Footnote[] = [];
  return (
    <>
      {parseInline(text, footnoteMap, { ...inlineOptions, sidenotes })}
      <SidenoteStack footnotes={sidenotes} />
    </>
  );
}

function SidenoteStack({ footnotes }: { footnotes: Footnote[] }) {
  if (footnotes.length === 0) return null;

  return (
    <span aria-hidden="true" className="source-sidenote-stack">
      {footnotes.map((footnote) => (
        <span className="source-sidenote" key={footnote.key}>
          <span className="source-sidenote-number">{footnote.number}</span>
          {parseInline(footnote.text)}
        </span>
      ))}
    </span>
  );
}

function Footnotes({ footnotes }: { footnotes: Footnote[] }) {
  return (
    <section aria-label="Notes" className="source-footnotes">
      <h3 className="source-footnotes-heading" id={markdownHeadingId("Notes")}>Notes</h3>
      <ol className="source-footnotes-list">
        {footnotes.map((footnote) => (
          <li id={footnoteId(footnote.key)} key={footnote.key}>
            <span>
              {parseInline(footnote.text)}{" "}
              <a aria-label={`Return to note ${footnote.number} reference`} className="source-footnote-backlink" href={`#${footnoteRefId(footnote.key)}`}>
                ↩
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MediaTranscriptParagraph({ footnoteMap, inlineOptions, text }: { footnoteMap: Map<string, Footnote>; inlineOptions?: InlineParseOptions; text: string }) {
  const bracketCue = text.match(/^\[([^\]]+)\]$/);
  if (bracketCue) {
    return (
      <p className="source-media-transcript-cue source-media-transcript-cue-bracket">
        <MarkdownInlineWithSidenotes footnoteMap={footnoteMap} inlineOptions={inlineOptions} text={bracketCue[1].trim()} />
      </p>
    );
  }

  const parentheticalCue = text.match(/^\(([^)]+)\)$/);
  if (parentheticalCue) {
    return (
      <p className="source-media-transcript-cue source-media-transcript-cue-parenthetical">
        <MarkdownInlineWithSidenotes footnoteMap={footnoteMap} inlineOptions={inlineOptions} text={parentheticalCue[1].trim()} />
      </p>
    );
  }

  const speaker = text.match(/^([A-Z][^:\n]{0,47}:)\s+(.+)$/);
  if (speaker && isLikelySpeakerLabel(speaker[1])) {
    return (
      <p>
        <strong className="source-media-transcript-speaker">{speaker[1]}</strong>{" "}
        <MarkdownInlineWithSidenotes footnoteMap={footnoteMap} inlineOptions={inlineOptions} text={speaker[2]} />
      </p>
    );
  }

  return <MarkdownParagraph footnoteMap={footnoteMap} inlineOptions={inlineOptions} text={text} />;
}

export function SourceFigureBlock({ figure }: { figure: SourceFigure }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FigureFrame figure={figure} onOpen={() => setOpen(true)} />
      {open && (
        <FigureLightbox figures={[figure]} initialIndex={0} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export function SourceFigureRow({ figures, missingTokens = [] }: { figures: SourceFigure[]; missingTokens?: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {figures.map((figure, index) => (
          <FigureFrame compact figure={figure} key={figure.id} onOpen={() => setOpenIndex(index)} />
        ))}
        {missingTokens.map((token) => (
          <p className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-archive-line p-3 text-center font-mono text-xs text-archive-muted" key={token}>
            {`{{figure:${token}}}`}
          </p>
        ))}
      </div>
      {openIndex !== null && figures[openIndex] && (
        <FigureLightbox figures={figures} initialIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}

function FigureFrame({ compact = false, figure, onOpen }: { compact?: boolean; figure: SourceFigure; onOpen: () => void }) {
  return (
    <figure className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.05)]">
      {figure.imagePath ? (
        <button
          aria-label={`Open ${figure.caption || figure.alt || "archive figure"}`}
          className="group block w-full bg-black text-left"
          onClick={onOpen}
          type="button"
        >
          <img
            alt={figure.alt || figure.caption}
            className={compact ? "aspect-[4/3] w-full object-cover transition duration-200 group-hover:scale-[1.02]" : "max-h-[32rem] w-full object-cover transition duration-200 group-hover:scale-[1.01]"}
            src={figure.imagePath}
          />
        </button>
      ) : (
        <div className={compact ? "aspect-[4/3] bg-archive-paper" : "h-48 bg-archive-paper"} />
      )}
      {!compact && (figure.caption || figure.credit) && (
        <figcaption className="border-t border-archive-line px-4 py-3 text-sm italic leading-6 text-archive-muted">
          {figure.caption}
          {figure.credit && <span className="not-italic"> Credit: {figure.credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function FigureLightbox({ figures, initialIndex, onClose }: { figures: SourceFigure[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const figure = figures[index] ?? figures[0];
  const hasMultiple = figures.length > 1;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMultiple) setIndex((current) => (current - 1 + figures.length) % figures.length);
      if (event.key === "ArrowRight" && hasMultiple) setIndex((current) => (current + 1) % figures.length);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [figures.length, hasMultiple, onClose]);

  if (!figure) return null;

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 bg-black/95 px-4 py-5 text-white" role="dialog">
      <button aria-label="Close image viewer" className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-white/10" onClick={onClose} type="button">
        <X className="h-5 w-5" />
      </button>
      <div className="mx-auto flex h-full max-w-7xl flex-col">
        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          {hasMultiple && (
            <button aria-label="Previous image" className="absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white hover:bg-white/10" onClick={() => setIndex((current) => (current - 1 + figures.length) % figures.length)} type="button">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <img alt={figure.alt || figure.caption} className="max-h-full max-w-full object-contain" src={figure.imagePath} />
          {hasMultiple && (
            <button aria-label="Next image" className="absolute right-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white hover:bg-white/10" onClick={() => setIndex((current) => (current + 1) % figures.length)} type="button">
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
        {(figure.caption || figure.credit || hasMultiple) && (
          <div className="mx-auto mt-4 max-w-4xl border-t border-white/15 pt-4 font-mono text-[0.78rem] leading-6 text-white/78">
            {hasMultiple && <p className="mb-2 text-white/45">{index + 1} / {figures.length}</p>}
            {figure.caption && <p>{figure.caption}</p>}
            {figure.credit && <p className="mt-1 text-white/50">Credit: {figure.credit}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function parseInline(text: string, footnoteMap = new Map<string, Footnote>(), options: InlineParseOptions = {}): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[\^([^\]]+)\]|\[[^\]]+\]\(([^)\s]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(...linkCitationText(text.slice(lastIndex, match.index), options, `${index}-plain-${lastIndex}`));
    }
    const token = match[0];
    const key = `${index}-${match.index}`;

    if (token.startsWith("`")) {
      nodes.push(<code className="rounded bg-archive-paper px-1 py-0.5 font-mono text-[0.9em]" key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{parseInline(token.slice(2, -2), footnoteMap, options)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{parseInline(token.slice(1, -1), footnoteMap, options)}</em>);
    } else if (token.startsWith("[^")) {
      const footnoteKey = token.slice(2, -1).trim();
      const footnote = footnoteMap.get(footnoteKey);
      if (footnote) {
        if (options.sidenotes && !options.sidenotes.some((note) => note.key === footnote.key)) {
          options.sidenotes.push(footnote);
        }
        nodes.push(<FootnoteReference footnote={footnote} key={key} />);
      } else {
        nodes.push(token);
      }
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      const href = link?.[2] ?? "";
      if (link && isSafeHref(href)) {
        nodes.push(
          <PreviewLink href={href} key={key}>
            {parseInline(link[1], footnoteMap, options)}
          </PreviewLink>
        );
      } else {
        nodes.push(token);
      }
    }

    lastIndex = pattern.lastIndex;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(...linkCitationText(text.slice(lastIndex), options, `${index}-plain-${lastIndex}`));
  }
  return nodes;
}

function linkCitationText(text: string, options: InlineParseOptions, keyPrefix: string): ReactNode[] {
  const links = [...(options.citationLinks ?? [])]
    .filter((link) => link.citationText && link.url)
    .sort((a, b) => b.citationText.length - a.citationText.length);
  if (!links.length || !text) return [text];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let keyIndex = 0;

  while (cursor < text.length) {
    let best: { link: SourceCitationLink; index: number } | undefined;
    for (const link of links) {
      const matchIndex = text.indexOf(link.citationText, cursor);
      if (matchIndex === -1 || !citationBoundaryOk(text, matchIndex, link.citationText.length)) continue;
      if (!best || matchIndex < best.index || (matchIndex === best.index && link.citationText.length > best.link.citationText.length)) {
        best = { link, index: matchIndex };
      }
    }

    if (!best) {
      nodes.push(text.slice(cursor));
      break;
    }

    if (best.index > cursor) nodes.push(text.slice(cursor, best.index));
    nodes.push(
      <PreviewLink href={best.link.url} key={`${keyPrefix}-${keyIndex}`} title={best.link.title || best.link.bibliographyTitle}>
        {best.link.citationText}
      </PreviewLink>
    );
    cursor = best.index + best.link.citationText.length;
    keyIndex += 1;
  }

  return nodes.length ? nodes : [text];
}

function citationBoundaryOk(text: string, index: number, length: number) {
  const before = index > 0 ? text[index - 1] : "";
  const after = index + length < text.length ? text[index + length] : "";
  return !isWordChar(before) && !isWordChar(after);
}

function isWordChar(value: string) {
  return /[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]/.test(value);
}

function PreviewLink({ children, href, title }: { children: ReactNode; href: string; title?: string }) {
  const previewTarget = wikipediaPreviewTarget(href);
  const linkWrapRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<WikipediaPreview | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [canPortal, setCanPortal] = useState(false);
  const [position, setPosition] = useState<PreviewPosition | null>(null);

  useEffect(() => {
    setCanPortal(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const linkWrap = linkWrapRef.current;
      if (!linkWrap) return;

      const rect = linkWrap.getBoundingClientRect();
      const cardWidth = Math.min(336, window.innerWidth - 24);
      const cardHeightEstimate = preview?.thumbnail ? 430 : 290;
      const gap = 10;
      const margin = 12;
      const centeredLeft = rect.left + rect.width / 2 - cardWidth / 2;
      const left = clamp(centeredLeft, margin, window.innerWidth - cardWidth - margin);
      const hasRoomBelow = rect.bottom + gap + cardHeightEstimate < window.innerHeight - margin;
      const top = hasRoomBelow ? rect.bottom + gap : Math.max(margin, rect.top - gap);

      setPosition({
        left,
        top,
        transform: hasRoomBelow ? undefined : "translateY(-100%)",
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, preview?.thumbnail]);

  function loadPreview() {
    if (!previewTarget || hasLoaded) return;
    setHasLoaded(true);
    fetchWikipediaPreview(previewTarget)
      .then((result) => setPreview(result))
      .catch(() => setPreview(null));
  }

  if (!previewTarget) {
    return (
      <Link className="font-semibold text-archive-violet underline-offset-4 hover:underline" href={href} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <span
      className="source-preview-link-wrap"
      data-wikipedia-preview=""
      ref={linkWrapRef}
      onBlur={() => setIsOpen(false)}
      onFocus={() => {
        setIsOpen(true);
        loadPreview();
      }}
      onPointerEnter={() => {
        setIsOpen(true);
        loadPreview();
      }}
      onPointerLeave={() => setIsOpen(false)}
    >
      <Link className="font-semibold text-archive-violet underline-offset-4 hover:underline" href={href} title={title}>
        {children}
      </Link>
      {isOpen && canPortal && createPortal(
        <WikipediaPreviewCard position={position} preview={preview} title={previewTarget.title} />,
        document.body
      )}
    </span>
  );
}

function WikipediaPreviewCard({ position, preview, title }: { position: PreviewPosition | null; preview: WikipediaPreview | null; title: string }) {
  return (
    <span className="source-link-preview" role="tooltip" style={previewStyle(position)}>
      {preview ? (
        <>
          {preview.thumbnail && <img alt="" className="source-link-preview-image" src={preview.thumbnail} />}
          <span className="source-link-preview-body">
            <span className="source-link-preview-kicker">Wikipedia</span>
            <span className="source-link-preview-title">{preview.title}</span>
            <span className="source-link-preview-extract">{preview.extract}</span>
          </span>
        </>
      ) : (
        <span className="source-link-preview-body">
          <span className="source-link-preview-kicker">Wikipedia</span>
          <span className="source-link-preview-title">{title.replace(/_/g, " ")}</span>
          <span className="source-link-preview-extract">Loading summary...</span>
        </span>
      )}
    </span>
  );
}

function previewStyle(position: PreviewPosition | null): CSSProperties {
  if (!position) {
    return {
      left: 12,
      top: 12,
      visibility: "hidden",
    };
  }

  return {
    left: position.left,
    top: position.top,
    transform: position.transform,
  };
}

function FootnoteReference({ footnote }: { footnote: Footnote }) {
  return (
    <span className="source-footnote-ref-wrap">
      <a className="source-footnote-ref" href={`#${footnoteId(footnote.key)}`} id={footnoteRefId(footnote.key)}>
        <sup>{footnote.number}</sup>
      </a>
    </span>
  );
}

function wikipediaPreviewTarget(href: string) {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!host.endsWith(".wikipedia.org") || !url.pathname.startsWith("/wiki/")) return null;
  if (url.pathname.includes(":")) return null;

  const title = decodeURIComponent(url.pathname.replace(/^\/wiki\//, ""));
  if (!title) return null;
  return { host, title };
}

function fetchWikipediaPreview(target: { host: string; title: string }) {
  const cacheKey = `${target.host}/wiki/${target.title}`;
  const cached = wikipediaPreviewCache.get(cacheKey);
  if (cached) return cached;

  const encodedTitle = encodeURIComponent(target.title.replace(/ /g, "_"));
  const request = fetch(`https://${target.host}/api/rest_v1/page/summary/${encodedTitle}`)
    .then(async (response) => {
      if (!response.ok) return null;
      const data = await response.json();
      if (data.type === "disambiguation" || typeof data.extract !== "string" || !data.extract.trim()) return null;
      return {
        title: typeof data.title === "string" ? data.title : target.title.replace(/_/g, " "),
        extract: data.extract,
        thumbnail: typeof data.thumbnail?.source === "string" ? data.thumbnail.source : undefined,
      };
    })
    .catch(() => null);

  wikipediaPreviewCache.set(cacheKey, request);
  return request;
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function footnoteId(key: string) {
  return `fn-${slugifyFootnoteKey(key)}`;
}

function footnoteRefId(key: string) {
  return `fnref-${slugifyFootnoteKey(key)}`;
}

function slugifyFootnoteKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
}

function isLikelySpeakerLabel(label: string) {
  const withoutColon = label.replace(/:$/, "").trim();
  if (!withoutColon || withoutColon.length > 48) return false;
  if (/[!?()[\]{}]/.test(withoutColon)) return false;
  return /^[A-Z][\p{L}\p{M}.'’ -]*(?:\s+[A-Z][\p{L}\p{M}.'’ -]*)*$/u.test(withoutColon);
}

function isSafeHref(href: string) {
  return /^(https?:\/\/|mailto:|\/)/i.test(href);
}
