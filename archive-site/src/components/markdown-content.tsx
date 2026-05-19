"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { SourceFigure } from "@/lib/types";

type MarkdownContentProps = {
  className?: string;
  figures?: SourceFigure[];
  markdown: string;
  transcriptFormat?: "media" | "prose";
};

type Block =
  | { type: "blockquote"; lines: string[] }
  | { type: "code"; language?: string; text: string }
  | { type: "figure"; token: string }
  | { type: "figure-row"; tokens: string[] }
  | { type: "heading"; depth: number; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string };

export function MarkdownContent({ className, figures = [], markdown, transcriptFormat = "prose" }: MarkdownContentProps) {
  const blocks = parseBlocks(markdown);

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MarkdownBlock block={block} figures={figures} key={`${block.type}-${index}`} transcriptFormat={transcriptFormat} />
      ))}
    </div>
  );
}

function MarkdownBlock({ block, figures, transcriptFormat }: { block: Block; figures: SourceFigure[]; transcriptFormat: "media" | "prose" }) {
  if (block.type === "heading") {
    const content = parseInline(block.text);
    if (block.depth <= 2) return <h3 className="source-markdown-heading">{content}</h3>;
    return <h4 className="source-markdown-subheading">{content}</h4>;
  }

  if (block.type === "blockquote") {
    return (
      <blockquote className="border-l-2 border-archive-violet/60 pl-5 text-archive-ink/90">
        {block.lines.map((line, index) => (
          <p key={`${index}-${line.slice(0, 16)}`}>{parseInline(line)}</p>
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

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag className={block.ordered ? "list-decimal space-y-2 pl-7" : "list-disc space-y-2 pl-7"}>
        {block.items.map((item, index) => (
          <li key={`${index}-${item.slice(0, 16)}`}>{parseInline(item)}</li>
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
    return <MediaTranscriptParagraph text={block.text} />;
  }

  return <p>{parseInline(block.text)}</p>;
}

function MediaTranscriptParagraph({ text }: { text: string }) {
  const bracketCue = text.match(/^\[([^\]]+)\]$/);
  if (bracketCue) {
    return <p className="source-media-transcript-cue source-media-transcript-cue-bracket">{parseInline(bracketCue[1].trim())}</p>;
  }

  const parentheticalCue = text.match(/^\(([^)]+)\)$/);
  if (parentheticalCue) {
    return <p className="source-media-transcript-cue source-media-transcript-cue-parenthetical">{parseInline(parentheticalCue[1].trim())}</p>;
  }

  const speaker = text.match(/^([A-Z][^:\n]{0,47}:)\s+(.+)$/);
  if (speaker && isLikelySpeakerLabel(speaker[1])) {
    return (
      <p>
        <strong className="source-media-transcript-speaker">{speaker[1]}</strong>{" "}
        {parseInline(speaker[2])}
      </p>
    );
  }

  return <p>{parseInline(text)}</p>;
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

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const fence = trimmed.match(/^```(\w+)?\s*$/);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index]?.trim() ?? "")) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", language: fence[1], text: codeLines.join("\n") });
      continue;
    }

    const figureRow = trimmed.match(/^{{\s*(?:figure-row|figures|gallery):([^}]+)\s*}}$/i);
    if (figureRow) {
      blocks.push({
        type: "figure-row",
        tokens: figureRow[1].split(",").map((token) => token.trim()).filter(Boolean)
      });
      index += 1;
      continue;
    }

    const figure = trimmed.match(/^{{\s*figure:([^}]+)\s*}}$/i);
    if (figure) {
      blocks.push({ type: "figure", token: figure[1].trim() });
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", depth: heading[1].length, text: heading[2].trim() });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index]?.trim() ?? "")) {
        quoteLines.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "blockquote", lines: quoteLines.filter(Boolean) });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index]?.trim() ?? "";
        const match = ordered ? current.match(/^\d+\.\s+(.+)$/) : current.match(/^[-*]\s+(.+)$/);
        if (!match) break;
        items.push(match[1].trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? "";
      const currentTrimmed = current.trim();
      if (!currentTrimmed) break;
      if (/^```/.test(currentTrimmed) || /^#{1,4}\s+/.test(currentTrimmed) || /^>\s?/.test(currentTrimmed) || /^{{\s*(?:figure|figure-row|figures|gallery):/.test(currentTrimmed)) break;
      if (/^[-*]\s+/.test(currentTrimmed) || /^\d+\.\s+/.test(currentTrimmed)) break;
      paragraphLines.push(currentTrimmed);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(([^)\s]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${index}-${match.index}`;

    if (token.startsWith("`")) {
      nodes.push(<code className="rounded bg-archive-paper px-1 py-0.5 font-mono text-[0.9em]" key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{parseInline(token.slice(2, -2))}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{parseInline(token.slice(1, -1))}</em>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      const href = link?.[2] ?? "";
      if (link && isSafeHref(href)) {
        nodes.push(
          <Link className="font-semibold text-archive-violet underline-offset-4 hover:underline" href={href} key={key}>
            {parseInline(link[1])}
          </Link>
        );
      } else {
        nodes.push(token);
      }
    }

    lastIndex = pattern.lastIndex;
    index += 1;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
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
