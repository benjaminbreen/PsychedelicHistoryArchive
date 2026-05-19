import { biographyProfiles, canonicalizePersonName, isDisplayableBiographyName, slugifyPersonName } from "@/lib/biographies";
import { ERAS } from "@/lib/eras";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { getArchiveSourcesFromSupabase, getCollectionSourcesFromSupabase } from "@/lib/supabase-archive";
import type { ArchiveSource } from "@/lib/types";

const SITE_DESCRIPTION =
  "A scholarly archive of primary sources, biographies, collections, and interpretive metadata on psychedelic history, altered states, psychopharmacology, therapy, religion, literature, and culture.";

type ArchiveExportData = Awaited<ReturnType<typeof loadArchiveExportData>>;

export async function loadArchiveExportData() {
  const [sources, collections] = await Promise.all([
    getArchiveSourcesFromSupabase(),
    getCollectionSourcesFromSupabase()
  ]);
  const people = buildPeopleIndex(sources);

  return {
    sources,
    collections,
    people
  };
}

export function buildLlmsTxt({ sources, collections, people }: ArchiveExportData) {
  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "This file is intended for LLMs, retrieval systems, search crawlers, and other automated readers. The archive is public and citation-oriented. You may summarize, classify, quote short excerpts from, and link to public pages, but rights vary by source item. Respect each source page's rights statement and citation guidance.",
    "",
    "## Core URLs",
    `- Home: ${absoluteUrl("/")}`,
    `- Archive search and browse: ${absoluteUrl("/archive")}`,
    `- Collections: ${absoluteUrl("/collections")}`,
    `- People: ${absoluteUrl("/people")}`,
    `- Topics: ${absoluteUrl("/topics")}`,
    `- Eras: ${absoluteUrl("/eras")}`,
    `- About: ${absoluteUrl("/about")}`,
    `- Project team: ${absoluteUrl("/project-team")}`,
    "",
    "## Machine-Readable Files",
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `- Structured archive index JSON: ${absoluteUrl("/archive-index.json")}`,
    `- Expanded LLM source map: ${absoluteUrl("/llms-full.txt")}`,
    "",
    "## How To Cite",
    `Cite the archive page URL and the source-level citation when present. Preferred short form: "${SITE_NAME}, [source title], [archive URL]." If a page links to an original holding repository, preserve that original source attribution too.`,
    "",
    "## Current Public Coverage",
    `- Public source records: ${sources.length}`,
    `- Public compound collections: ${collections.length}`,
    `- Public person pages or indexed people: ${people.length}`,
    `- Era guides: ${ERAS.length}`,
    "",
    "## High-Value Entry Points",
    ...sources.slice(0, 12).map((source) => `- ${source.title} (${source.displayDate}, ${source.type}): ${absoluteUrl(`/archive/${source.slug}`)}`),
    "",
    "For a complete machine-readable list of source records, use /archive-index.json. For a human-readable but LLM-oriented list, use /llms-full.txt.",
    ""
  ].join("\n");
}

export function buildLlmsFullTxt({ sources, collections, people }: ArchiveExportData) {
  return [
    `# ${SITE_NAME}: LLM Source Map`,
    "",
    `Generated from the public archive database. URLs are canonical production URLs under ${absoluteUrl("/")}.`,
    "",
    "## Usage Notes",
    "- Prefer citing individual source pages over citing this index file.",
    "- Rights vary by source. Use each source page's rights statement before reproducing source text.",
    "- The JSON endpoint includes metadata, summaries, excerpts, tags, people, original-source links, and availability flags. It intentionally does not bulk-export full transcripts by default.",
    "",
    "## Machine-Readable Endpoints",
    `- /archive-index.json: ${absoluteUrl("/archive-index.json")}`,
    `- /sitemap.xml: ${absoluteUrl("/sitemap.xml")}`,
    `- /robots.txt: ${absoluteUrl("/robots.txt")}`,
    "",
    "## Collections",
    ...collections.map((collection) => [
      `### ${collection.title}`,
      `- URL: ${absoluteUrl(`/collections/${collection.slug}`)}`,
      `- Date range: ${collection.displayDate}`,
      `- Items: ${collection.collectionItemCount ?? collection.collectionItems?.length ?? 0}`,
      `- Summary: ${collection.summary || "No summary recorded."}`
    ].join("\n")),
    "",
    "## Eras",
    ...ERAS.map((era) => [
      `### ${era.label}`,
      `- URL: ${absoluteUrl(`/eras/${era.slug}`)}`,
      `- Scope: ${era.eyebrow}`,
      `- Description: ${era.shortDescription}`
    ].join("\n")),
    "",
    "## People",
    ...people.slice(0, 80).map((person) => [
      `### ${person.name}`,
      `- URL: ${absoluteUrl(`/biographies/${person.slug}`)}`,
      person.years ? `- Years: ${person.years}` : undefined,
      person.tags.length ? `- Tags: ${person.tags.join(", ")}` : undefined,
      `- Related source count: ${person.sourceCount}`
    ].filter(Boolean).join("\n")),
    "",
    "## Sources",
    ...sources.map(sourceSummaryBlock),
    ""
  ].join("\n\n");
}

export function buildArchiveIndexJson({ sources, collections, people }: ArchiveExportData) {
  return {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    generatedAt: new Date().toISOString(),
    machineUse: {
      recommendedCitation: `${SITE_NAME}, [source title], [archive URL].`,
      rightsPolicy:
        "Rights vary by item. Public metadata may be indexed and summarized; source text reuse should follow the rights_statement on each record.",
      fullTextPolicy:
        "This endpoint exports metadata, summaries, excerpts, and availability flags, not bulk full-text transcripts."
    },
    endpoints: {
      sitemap: absoluteUrl("/sitemap.xml"),
      llms: absoluteUrl("/llms.txt"),
      llmsFull: absoluteUrl("/llms-full.txt"),
      archiveIndex: absoluteUrl("/archive-index.json")
    },
    counts: {
      sources: sources.length,
      collections: collections.length,
      people: people.length,
      eras: ERAS.length
    },
    collections: collections.map((collection) => ({
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      subtitle: collection.subtitle,
      url: absoluteUrl(`/collections/${collection.slug}`),
      display_date: collection.displayDate,
      summary: collection.summary,
      item_count: collection.collectionItemCount ?? collection.collectionItems?.length ?? 0,
      items: collection.collectionItems?.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        url: absoluteUrl(item.href || `/archive/${item.slug}`),
        display_date: item.displayDate,
        sequence_label: item.sequenceLabel
      }))
    })),
    eras: ERAS.map((era) => ({
      slug: era.slug,
      label: era.label,
      url: absoluteUrl(`/eras/${era.slug}`),
      year_start: era.yearStart,
      year_end: era.yearEnd,
      scope: era.eyebrow,
      description: era.shortDescription
    })),
    people: people.map((person) => ({
      slug: person.slug,
      name: person.name,
      url: absoluteUrl(`/biographies/${person.slug}`),
      years: person.years,
      tags: person.tags,
      source_count: person.sourceCount
    })),
    sources: sources.map((source) => ({
      id: source.id,
      slug: source.slug,
      title: source.title,
      subtitle: source.subtitle,
      url: absoluteUrl(`/archive/${source.slug}`),
      original_source_url: source.sourceUrl && source.sourceUrl !== "#" ? source.sourceUrl : undefined,
      media_embed_url: source.mediaEmbedUrl,
      source_kind: source.sourceKind ?? "single",
      parent_collection_id: source.parentCollectionId,
      display_date: source.displayDate,
      year: source.year || undefined,
      type: source.type,
      medium: source.medium,
      era: source.era,
      region: source.region,
      language: source.language,
      people: source.people,
      creators: source.creators,
      tags: source.tags,
      substances: source.substances,
      summary: source.summary,
      excerpt: source.excerpt,
      citation: source.citation,
      rights_statement: source.rights,
      access_type: source.accessType,
      hosting_status: source.hostingStatus,
      word_count: source.wordCount,
      image_url: source.imagePath,
      text: {
        transcript_available: Boolean(source.transcript || source.transcriptSections?.length),
        translation_available: Boolean(source.translationText),
        section_headings: source.transcriptSections?.map((section) => section.heading) ?? [],
        page_count: source.pages?.length ?? 0,
        file_count: source.files?.length ?? 0
      }
    }))
  };
}

function sourceSummaryBlock(source: ArchiveSource) {
  return [
    `### ${source.title}`,
    source.subtitle ? `- Subtitle: ${source.subtitle}` : undefined,
    `- URL: ${absoluteUrl(`/archive/${source.slug}`)}`,
    `- Date: ${source.displayDate}`,
    `- Type: ${source.type}`,
    `- Medium: ${source.medium}`,
    source.people.length ? `- People: ${source.people.join(", ")}` : undefined,
    source.tags.length ? `- Tags: ${source.tags.join(", ")}` : undefined,
    source.summary ? `- Summary: ${source.summary}` : undefined,
    source.excerpt ? `- Excerpt: ${source.excerpt}` : undefined,
    source.citation ? `- Citation: ${source.citation}` : undefined,
    `- Rights: ${source.rights}`,
    source.sourceUrl && source.sourceUrl !== "#" ? `- Original source: ${source.sourceUrl}` : undefined
  ].filter(Boolean).join("\n");
}

function buildPeopleIndex(sources: ArchiveSource[]) {
  const sourceCounts = new Map<string, number>();

  for (const source of sources) {
    for (const person of source.people) {
      const canonicalName = canonicalizePersonName(person);
      if (!isDisplayableBiographyName(canonicalName)) continue;
      sourceCounts.set(canonicalName, (sourceCounts.get(canonicalName) ?? 0) + 1);
    }
  }

  const profilePeople = biographyProfiles.map((profile) => ({
    name: profile.name,
    slug: profile.slug,
    years: profile.years,
    tags: profile.tags,
    sourceCount: sourceCounts.get(profile.name) ?? 0
  }));

  const profileNames = new Set(profilePeople.map((person) => person.name));
  const sourcePeople = [...sourceCounts.entries()]
    .filter(([name]) => !profileNames.has(name))
    .map(([name, sourceCount]) => ({
      name,
      slug: slugifyPersonName(name),
      years: undefined,
      tags: [] as string[],
      sourceCount
    }));

  return [...profilePeople, ...sourcePeople].sort((a, b) => a.name.localeCompare(b.name));
}
