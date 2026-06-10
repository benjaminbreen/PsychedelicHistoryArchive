import fs from "node:fs";
import path from "node:path";
import {
  canonicalizePersonName,
  findBiographyProfile,
  getBiographyDirectoryMetadata,
  getBiographyPortrait,
  isDisplayableBiographyName,
  slugifyPersonName,
} from "@/lib/biographies";
import type { BibliographyItem } from "@/lib/bibliography";
import type { ArchiveSource } from "@/lib/types";

export type WorkbenchSeverity = "high" | "medium" | "low";
export type WorkbenchTrack = "biographies" | "bibliography" | "citations" | "source_qa";

export type WorkbenchTask = {
  id: string;
  title: string;
  description: string;
  severity: WorkbenchSeverity;
  track: WorkbenchTrack;
  href: string;
  secondaryHref?: string;
  meta: Array<{ label: string; value: string }>;
};

export type BiographyStubCandidate = {
  name: string;
  slug: string;
  status: "full_profile" | "metadata_stub";
  priority: WorkbenchSeverity;
  sourceCount: number;
  years: string;
  eras: string[];
  regions: string[];
  tags: string[];
  sourceSlugs: string[];
  sourceTitles: string[];
  hasDirectoryMetadata: boolean;
  hasFullProfile: boolean;
  hasPortrait: boolean;
  needs: string[];
  wikipediaSearchUrl: string;
  wikidataSearchUrl: string;
};

type QaIssue = {
  severity: WorkbenchSeverity;
  kind: string;
  track: string;
  slug: string;
  title: string;
  field: string;
  excerpt: string;
  suggestion?: string;
};

type QaReport = {
  issues_total: number;
  issues_by_severity: Record<WorkbenchSeverity, number>;
  issues?: QaIssue[];
};

type CitationReport = {
  source_slug: string;
  inline_citation_count: number;
  auto_linked_count: number;
  unresolved_count: number;
  unresolved: Array<{ text: string; reason: string }>;
};

const ROOT = path.resolve(process.cwd(), "..");

export async function getAdminWorkbenchData() {
  const [{ listArchiveSourceSummariesFromSupabase }, { getBibliographyItems }] = await Promise.all([
    import("@/lib/supabase-archive"),
    import("@/lib/bibliography"),
  ]);
  const [sources, bibliographyItems] = await Promise.all([
    listArchiveSourceSummariesFromSupabase(),
    getBibliographyItems({ recommendation: "all" }),
  ]);
  const biographyCandidates = buildBiographyStubCandidates(sources);
  const qualityReport = readJson<QaReport>(["data", "qa", "archive-quality-report.json"]);
  const actionableReport = readJson<QaReport>(["data", "qa", "archive-actionable-report.json"]);
  const citationReport = readJson<CitationReport>(["data", "qa", "citation-link-report.json"]);

  const tasks = [
    ...buildBiographyTasks(biographyCandidates),
    ...buildBibliographyTasks(bibliographyItems),
    ...buildCitationTasks(citationReport),
    ...buildSourceQaTasks(actionableReport),
  ].sort(sortTasks);

  return {
    biographyCandidates,
    bibliographyItems,
    citationReport,
    qualityReport,
    tasks,
    metrics: {
      totalTasks: tasks.length,
      highTasks: tasks.filter((task) => task.severity === "high").length,
      biographyStubs: biographyCandidates.filter((candidate) => candidate.status === "metadata_stub").length,
      bibliographyNeedsReview: buildBibliographyTasks(bibliographyItems).length,
      qaIssues: qualityReport?.issues_total ?? 0,
      unresolvedCitations: citationReport?.unresolved_count ?? 0,
    },
  };
}

export function buildBiographyStubCandidates(sources: ArchiveSource[]): BiographyStubCandidate[] {
  const people = new Map<string, ArchiveSource[]>();

  sources.forEach((source) => {
    source.people.forEach((rawName) => {
      if (!isDisplayableBiographyName(rawName)) return;
      const name = canonicalizePersonName(rawName);
      people.set(name, [...(people.get(name) ?? []), source]);
    });
  });

  return [...people.entries()].map(([name, personSources]) => {
    const slug = slugifyPersonName(name);
    const profile = findBiographyProfile(slug);
    const directoryMetadata = getBiographyDirectoryMetadata(name);
    const portrait = getBiographyPortrait(name);
    const years = sourceYearRange(personSources);
    const needs = [
      !profile ? "Full editorial biography" : "",
      !directoryMetadata ? "Dates and role metadata" : "",
      !portrait ? "Portrait and rights review" : "",
      profile && !profile.sourceNotes?.length ? "Reference notes" : "",
    ].filter(Boolean);

    return {
      name,
      slug,
      status: profile ? "full_profile" as const : "metadata_stub" as const,
      priority: biographyPriority(personSources, profile ? needs : ["Full editorial biography", ...needs]),
      sourceCount: personSources.length,
      years,
      eras: sortedUnique(personSources.map((source) => source.era)),
      regions: sortedUnique(personSources.map((source) => source.region)),
      tags: sortedUnique(personSources.flatMap((source) => source.tags)).slice(0, 8),
      sourceSlugs: personSources.map((source) => source.slug),
      sourceTitles: personSources.map((source) => source.title),
      hasDirectoryMetadata: Boolean(directoryMetadata),
      hasFullProfile: Boolean(profile),
      hasPortrait: Boolean(portrait || profile?.imagePath),
      needs,
      wikipediaSearchUrl: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(name)}`,
      wikidataSearchUrl: `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(name)}`,
    };
  }).sort((a, b) => {
    if (a.status !== b.status) return a.status === "metadata_stub" ? -1 : 1;
    return severityRank(a.priority) - severityRank(b.priority) || b.sourceCount - a.sourceCount || a.name.localeCompare(b.name);
  });
}

export function buildBiographyTasks(candidates: BiographyStubCandidate[]): WorkbenchTask[] {
  return candidates
    .filter((candidate) => candidate.status === "metadata_stub" || candidate.needs.length > 0)
    .map((candidate) => ({
      id: `bio:${candidate.slug}`,
      title: candidate.status === "metadata_stub" ? `Create biography for ${candidate.name}` : `Polish biography metadata for ${candidate.name}`,
      description: candidate.status === "metadata_stub"
        ? "A public metadata stub can be generated from linked source records, but this person still needs editorial review."
        : "This biography exists, but the profile is missing at least one reviewable editorial field.",
      severity: candidate.priority,
      track: "biographies",
      href: `/biographies/${candidate.slug}`,
      secondaryHref: `/archive?people=${encodeURIComponent(candidate.name)}`,
      meta: [
        { label: "Sources", value: String(candidate.sourceCount) },
        { label: "Years", value: candidate.years },
        { label: "Needs", value: candidate.needs.join(", ") || "Review" },
      ],
    }));
}

export function buildBibliographyTasks(items: BibliographyItem[]): WorkbenchTask[] {
  return items.flatMap((item) => {
    const needs = [
      !item.contributors.length ? "contributors" : "",
      !item.tags.length ? "tags" : "",
      !item.eras.length ? "eras" : "",
      !item.editorialNote ? "editorial note" : "",
      !item.reliabilityNote ? "reliability note" : "",
      !item.documentSlugs?.length ? "source links" : "",
    ].filter(Boolean);

    if (!needs.length) return [];

    return [{
      id: `bib:${item.slug}`,
      title: `Review bibliography item: ${item.title}`,
      description: "This further-reading record is visible enough to benefit from fuller metadata, source links, and an editorial/reliability note.",
      severity: needs.includes("contributors") || needs.includes("editorial note") ? "medium" : "low",
      track: "bibliography" as const,
      href: `/further-reading/${item.slug}`,
      meta: [
        { label: "Year", value: item.year ? String(item.year) : "n.d." },
        { label: "Type", value: item.itemType.replaceAll("_", " ") },
        { label: "Needs", value: needs.join(", ") },
      ],
    }];
  });
}

function buildCitationTasks(report: CitationReport | null): WorkbenchTask[] {
  if (!report || report.unresolved_count === 0) return [];

  return [{
    id: `citations:${report.source_slug}`,
    title: "Resolve inline citation links",
    description: "The citation-linking QA pass found unresolved citation candidates that need manual matching or rejection.",
    severity: report.unresolved_count > 5 ? "high" : "medium",
    track: "citations",
    href: `/archive/${report.source_slug}`,
    secondaryHref: "/admin/qa",
    meta: [
      { label: "Found", value: String(report.inline_citation_count) },
      { label: "Linked", value: String(report.auto_linked_count) },
      { label: "Unresolved", value: String(report.unresolved_count) },
    ],
  }];
}

function buildSourceQaTasks(report: QaReport | null): WorkbenchTask[] {
  return (report?.issues ?? []).slice(0, 12).map((issue, index) => ({
    id: `qa:${issue.slug}:${issue.kind}:${index}`,
    title: issue.title || issue.slug,
    description: issue.suggestion || issue.excerpt || "Source QA issue needs review.",
    severity: issue.severity,
    track: "source_qa",
    href: `/archive/${issue.slug}`,
    secondaryHref: "/admin/qa",
    meta: [
      { label: "Kind", value: issue.kind.replaceAll("_", " ") },
      { label: "Field", value: issue.field || "record" },
      { label: "Track", value: issue.track.replaceAll("_", " ") },
    ],
  }));
}

function biographyPriority(sources: ArchiveSource[], needs: string[]): WorkbenchSeverity {
  if (sources.length >= 3 || needs.includes("Full editorial biography")) return "high";
  if (sources.length === 2 || needs.length > 1) return "medium";
  return "low";
}

function sourceYearRange(sources: ArchiveSource[]) {
  const years = sources.map((source) => source.year).filter(Boolean).sort((a, b) => a - b);
  if (!years.length) return "n.d.";
  const first = years[0];
  const last = years.at(-1);
  return first === last ? String(first) : `${first}-${last}`;
}

function sortedUnique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function sortTasks(a: WorkbenchTask, b: WorkbenchTask) {
  return severityRank(a.severity) - severityRank(b.severity) || trackRank(a.track) - trackRank(b.track) || a.title.localeCompare(b.title);
}

function severityRank(severity: WorkbenchSeverity) {
  if (severity === "high") return 0;
  if (severity === "medium") return 1;
  return 2;
}

function trackRank(track: WorkbenchTrack) {
  return ["biographies", "source_qa", "citations", "bibliography"].indexOf(track);
}

function readJson<T>(parts: string[]): T | null {
  const filePath = path.join(ROOT, ...parts);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}
