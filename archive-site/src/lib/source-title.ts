import type { ArchiveSource } from "@/lib/types";

export type SourceTitleParts = {
  title: string;
  subtitle: string;
  fullTitle: string;
};

export function getSourceTitleParts(source: Pick<ArchiveSource, "title" | "displayDate" | "shortTitle" | "subtitle">): SourceTitleParts {
  const fullTitle = stripLeadingDate(source.title, source.displayDate);
  const [derivedTitle, derivedSubtitle = ""] = splitLongTitle(fullTitle);
  const title = source.shortTitle?.trim() || derivedTitle;
  const subtitle = source.subtitle?.trim() || derivedSubtitle;

  return {
    title,
    subtitle,
    fullTitle
  };
}

function stripLeadingDate(title: string, displayDate: string) {
  const compactDate = escapeRegExp(displayDate.trim());
  const withoutExactDate = compactDate
    ? title.replace(new RegExp(`^\\s*${compactDate}\\s*[:\\-–—]\\s*`, "i"), "")
    : title;

  return withoutExactDate.replace(/^\s*(?:1[5-9]\d{2}|20\d{2})\s*[:\-–—]\s*/, "").trim();
}

function splitLongTitle(title: string) {
  const separators = [/:\s+/, /\s+[–—]\s+/, /\s+-\s+/];

  for (const separator of separators) {
    const match = separator.exec(title);
    if (!match?.index) continue;

    const lead = title.slice(0, match.index).trim();
    const rest = title.slice(match.index + match[0].length).trim();

    if (lead.length >= 4 && lead.length <= 72 && rest.length >= 12) {
      return [lead, sentenceCase(rest)];
    }
  }

  return [title.trim(), ""];
}

function sentenceCase(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
