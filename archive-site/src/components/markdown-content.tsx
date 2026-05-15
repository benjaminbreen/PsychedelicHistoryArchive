import Link from "next/link";
import type React from "react";
import type { SourceFigure } from "@/lib/types";

type MarkdownContentProps = {
  className?: string;
  figures?: SourceFigure[];
  markdown: string;
};

type Block =
  | { type: "blockquote"; lines: string[] }
  | { type: "code"; language?: string; text: string }
  | { type: "figure"; token: string }
  | { type: "heading"; depth: number; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string };

export function MarkdownContent({ className, figures = [], markdown }: MarkdownContentProps) {
  const blocks = parseBlocks(markdown);

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MarkdownBlock block={block} figures={figures} key={`${block.type}-${index}`} />
      ))}
    </div>
  );
}

function MarkdownBlock({ block, figures }: { block: Block; figures: SourceFigure[] }) {
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

  return <p>{parseInline(block.text)}</p>;
}

export function SourceFigureBlock({ figure }: { figure: SourceFigure }) {
  return (
    <figure className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.05)]">
      {figure.imagePath && (
        <img
          alt={figure.alt || figure.caption}
          className="max-h-[32rem] w-full object-cover"
          src={figure.imagePath}
        />
      )}
      {(figure.caption || figure.credit) && (
        <figcaption className="border-t border-archive-line px-4 py-3 text-sm italic leading-6 text-archive-muted">
          {figure.caption}
          {figure.credit && <span className="not-italic"> Credit: {figure.credit}</span>}
        </figcaption>
      )}
    </figure>
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
      if (/^```/.test(currentTrimmed) || /^#{1,4}\s+/.test(currentTrimmed) || /^>\s?/.test(currentTrimmed) || /^{{\s*figure:/.test(currentTrimmed)) break;
      if (/^[-*]\s+/.test(currentTrimmed) || /^\d+\.\s+/.test(currentTrimmed)) break;
      paragraphLines.push(currentTrimmed);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
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

function isSafeHref(href: string) {
  return /^(https?:\/\/|mailto:|\/)/i.test(href);
}
