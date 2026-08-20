export type Footnote = {
  key: string;
  number: number;
  text: string;
};

export type MarkdownBlock =
  | { type: "blockquote"; lines: string[] }
  | { type: "code"; language?: string; text: string }
  | { type: "figure"; token: string }
  | { type: "figure-row"; tokens: string[] }
  | { type: "footnotes" }
  | { type: "heading"; depth: number; id: string; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string };

export type ParsedMarkdown = {
  blocks: MarkdownBlock[];
  footnotes: Footnote[];
  footnoteMap: Map<string, Footnote>;
};

export type MarkdownTocItem = {
  id: string;
  label: string;
};

export function parseMarkdown(markdown: string): ParsedMarkdown {
  const { text, footnotes } = extractFootnoteDefinitions(markdown);
  return {
    blocks: parseBlocks(text),
    footnotes,
    footnoteMap: new Map(footnotes.map((footnote) => [footnote.key, footnote])),
  };
}

export function parseBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  const headingCounts = new Map<string, number>();
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
        tokens: figureRow[1].split(",").map((token) => token.trim()).filter(Boolean),
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

    if (/^{{\s*footnotes\s*}}$/i.test(trimmed)) {
      blocks.push({ type: "footnotes" });
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const text = heading[2].trim();
      blocks.push({ type: "heading", depth: heading[1].length, id: uniqueHeadingId(text, headingCounts), text });
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
      if (/^```/.test(currentTrimmed) || /^#{1,6}\s+/.test(currentTrimmed) || /^>\s?/.test(currentTrimmed)) break;
      if (/^{{\s*(?:figure|figure-row|figures|gallery|footnotes)(?::|\s*}})/i.test(currentTrimmed)) break;
      if (/^[-*]\s+/.test(currentTrimmed) || /^\d+\.\s+/.test(currentTrimmed)) break;
      paragraphLines.push(currentTrimmed);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

export function extractFootnoteDefinitions(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const contentLines: string[] = [];
  const footnotes: Footnote[] = [];
  let index = 0;
  let insertedFootnotesBlock = false;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const definition = line.match(/^\[\^([^\]]+)]:\s*(.*)$/);
    if (!definition) {
      contentLines.push(line);
      index += 1;
      continue;
    }

    const key = definition[1].trim();
    if (!insertedFootnotesBlock) {
      contentLines.push("{{footnotes}}");
      insertedFootnotesBlock = true;
    }
    const noteLines = [definition[2].trim()];
    index += 1;
    while (index < lines.length) {
      const continuation = lines[index] ?? "";
      if (/^\s{2,}\S/.test(continuation)) {
        noteLines.push(continuation.trim());
        index += 1;
        continue;
      }
      break;
    }
    footnotes.push({
      key,
      number: footnotes.length + 1,
      text: noteLines.join(" ").trim(),
    });
  }

  return { text: contentLines.join("\n"), footnotes };
}

export function extractMarkdownToc(markdown: string): MarkdownTocItem[] {
  const headingCounts = new Map<string, number>();
  const toc: MarkdownTocItem[] = [];

  for (const match of markdown.matchAll(/^(#{2,6})\s+(.+)$/gm)) {
    const label = stripInlineMarkdown(match[2].trim());
    if (!label) continue;
    toc.push({ id: uniqueHeadingId(label, headingCounts), label });
  }

  if (/^\[\^[^\]]+]:\s+/m.test(markdown)) {
    toc.push({ id: markdownHeadingId("Notes"), label: "Notes" });
  }

  return toc;
}

export function markdownHeadingId(text: string) {
  const normalized = text
    .replace(/[*_`]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `section-${normalized || "untitled"}`;
}

function uniqueHeadingId(text: string, counts: Map<string, number>) {
  const base = markdownHeadingId(text);
  const count = counts.get(base) ?? 0;
  counts.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function stripInlineMarkdown(value: string) {
  return value
    .replace(/[*_`]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}
