import { getSupabaseClient } from "@/lib/supabase";

export type BibliographyItemType = "book" | "article" | "chapter" | "dissertation" | "edited_volume" | "report";
export type RecommendationStatus = "recommended" | "contextual" | "archived" | "exclude";
export type CitationStyle = "chicago" | "mla" | "apa" | "bibtex" | "ris";

export type BibliographyContributor = {
  id?: string;
  displayName: string;
  familyName?: string;
  givenName?: string;
  role?: string;
  position?: number;
};

export type BibliographyTag = {
  id?: string;
  name: string;
  slug: string;
  tagType?: string;
};

export type BibliographyItem = {
  id: string;
  slug: string;
  itemType: BibliographyItemType;
  title: string;
  subtitle?: string;
  publicationTitle?: string;
  publisher?: string;
  publicationPlace?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  oclc?: string;
  jstorUrl?: string;
  publisherUrl?: string;
  googleBooksUrl?: string;
  worldcatUrl?: string;
  openAccessUrl?: string;
  pdfUrl?: string;
  abstract?: string;
  editorialNote?: string;
  reliabilityNote?: string;
  recommendationStatus: RecommendationStatus;
  status: "draft" | "published" | "archived";
  contributors: BibliographyContributor[];
  tags: BibliographyTag[];
  eras: string[];
  documentSlugs?: string[];
};

export type BibliographyFilters = {
  q?: string;
  era?: string;
  tag?: string;
  type?: string;
  recommendation?: RecommendationStatus | "all";
  sort?: string;
};

const FALLBACK_BIBLIOGRAPHY: BibliographyItem[] = [
  {
    id: "49df236b-25e1-5eda-9972-b6214e7dc599",
    slug: "burger-2011-chavin-hallucinogenic-snuff",
    itemType: "article",
    title: "What Kind of Hallucinogenic Snuff Was Used at Chavin de Huantar? An Iconographic Identification",
    publicationTitle: "Nawpa Pacha",
    year: 2011,
    volume: "31",
    issue: "2",
    pages: "123-140",
    doi: "10.1179/naw.2011.31.2.123",
    publisherUrl: "https://www.tandfonline.com/doi/abs/10.1179/naw.2011.31.2.123",
    editorialNote: "The core scholarly source for the archive's Chavin vilca-snuff entry.",
    reliabilityNote: "Peer-reviewed Andean archaeology article; useful because it makes a specific iconographic and material-culture argument rather than a broad speculative claim.",
    recommendationStatus: "recommended",
    status: "published",
    contributors: [{ displayName: "Richard L. Burger", familyName: "Burger", givenName: "Richard L.", role: "author", position: 1 }],
    tags: [
      { name: "Archaeology", slug: "archaeology", tagType: "topic" },
      { name: "Iconography", slug: "iconography", tagType: "topic" },
      { name: "Anadenanthera", slug: "anadenanthera", tagType: "substance" },
      { name: "Vilca", slug: "vilca", tagType: "substance" },
      { name: "Chavin de Huantar", slug: "chavin-de-huantar", tagType: "place" }
    ],
    eras: ["pre-500"],
    documentSlugs: ["chavin-de-huantar"]
  },
  {
    id: "d71665a5-14e4-5a33-a31d-604032494a77",
    slug: "sharon-2019-sacred-sanpedro-ethnoarchaeological-context",
    itemType: "article",
    title: "Sacred Sanpedro in Ethnoarchaeological Context",
    publicationTitle: "Nawpa Pacha",
    year: 2019,
    volume: "39",
    issue: "1",
    pages: "113-147",
    doi: "10.1080/00776297.2019.1574959",
    publisherUrl: "https://www.tandfonline.com/doi/abs/10.1080/00776297.2019.1574959",
    editorialNote: "Useful for San Pedro cactus in Andean archaeological and ethnographic context, especially when separated from unsupported claims about other ancient mystery traditions.",
    reliabilityNote: "Peer-reviewed article in an Andean archaeology journal; recommended with attention to the limits of ethnoarchaeological analogy.",
    recommendationStatus: "recommended",
    status: "published",
    contributors: [
      { displayName: "Douglas Sharon", familyName: "Sharon", givenName: "Douglas", role: "author", position: 1 },
      { displayName: "Bonnie Glass-Coffin", familyName: "Glass-Coffin", givenName: "Bonnie", role: "author", position: 2 }
    ],
    tags: [
      { name: "Archaeology", slug: "archaeology", tagType: "topic" },
      { name: "San Pedro", slug: "san-pedro", tagType: "substance" },
      { name: "Andes", slug: "andes", tagType: "region" },
      { name: "Material Culture", slug: "material-culture", tagType: "topic" }
    ],
    eras: ["pre-500"]
  },
  {
    id: "8167daf0-629e-58d2-a4e7-c89d65422683",
    slug: "torres-repke-2006-anadenanthera",
    itemType: "book",
    title: "Anadenanthera: Visionary Plant of Ancient South America",
    publisher: "Haworth Press",
    publicationPlace: "Binghamton, NY",
    year: 2006,
    isbn: "9780789026422",
    googleBooksUrl: "https://books.google.com/books/about/Anadenanthera.html?id=cMSFT5K3C9wC",
    editorialNote: "Specialized synthesis on Anadenanthera archaeology, ethnobotany, chemistry, and iconography.",
    reliabilityNote: "Specialist monograph; use for Anadenanthera specifically, not as blanket evidence for loosely defined psychedelic prehistory.",
    recommendationStatus: "recommended",
    status: "published",
    contributors: [
      { displayName: "Constantino Manuel Torres", familyName: "Torres", givenName: "Constantino Manuel", role: "author", position: 1 },
      { displayName: "David B. Repke", familyName: "Repke", givenName: "David B.", role: "author", position: 2 }
    ],
    tags: [
      { name: "Anadenanthera", slug: "anadenanthera", tagType: "substance" },
      { name: "Archaeology", slug: "archaeology", tagType: "topic" },
      { name: "Ethnobotany", slug: "ethnobotany", tagType: "topic" },
      { name: "South America", slug: "south-america", tagType: "region" }
    ],
    eras: ["pre-500", "500-1500"]
  }
];

type BibliographyRow = {
  id: string;
  slug: string;
  item_type: BibliographyItemType;
  title: string;
  subtitle: string | null;
  publication_title: string | null;
  publisher: string | null;
  publication_place: string | null;
  year: number | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  isbn: string | null;
  oclc: string | null;
  jstor_url: string | null;
  publisher_url: string | null;
  google_books_url: string | null;
  worldcat_url: string | null;
  open_access_url: string | null;
  pdf_url: string | null;
  abstract: string | null;
  editorial_note: string | null;
  reliability_note: string | null;
  recommendation_status: RecommendationStatus | null;
  status: "draft" | "published" | "archived" | null;
  bibliography_item_contributors?: Array<{
    role: string | null;
    position: number | null;
    contributor: BibliographyContributorRow | BibliographyContributorRow[] | null;
  }>;
  bibliography_item_tags?: Array<{ tag: BibliographyTagRow | BibliographyTagRow[] | null }>;
  bibliography_item_eras?: Array<{ era_slug: string | null; position: number | null }>;
  bibliography_item_documents?: Array<{ document: { slug: string | null } | Array<{ slug: string | null }> | null }>;
};

type BibliographyContributorRow = {
  id: string;
  display_name: string;
  family_name: string | null;
  given_name: string | null;
};

type BibliographyTagRow = {
  id: string;
  name: string | null;
  slug: string | null;
  tag_type: string | null;
};

const BIBLIOGRAPHY_SELECT = `
  id,
  slug,
  item_type,
  title,
  subtitle,
  publication_title,
  publisher,
  publication_place,
  year,
  volume,
  issue,
  pages,
  doi,
  isbn,
  oclc,
  jstor_url,
  publisher_url,
  google_books_url,
  worldcat_url,
  open_access_url,
  pdf_url,
  abstract,
  editorial_note,
  reliability_note,
  recommendation_status,
  status,
  bibliography_item_contributors(role, position, contributor:bibliography_contributors(id, display_name, family_name, given_name)),
  bibliography_item_tags(tag:tags(id, name, slug, tag_type)),
  bibliography_item_eras(era_slug, position),
  bibliography_item_documents(document:documents(slug))
`;

export async function getBibliographyItems(filters: BibliographyFilters = {}) {
  const supabase = getSupabaseClient();
  let items = FALLBACK_BIBLIOGRAPHY;

  if (supabase) {
    const { data, error } = await withTimeout(
      supabase
        .from("bibliography_items")
        .select(BIBLIOGRAPHY_SELECT)
        .eq("status", "published")
        .neq("recommendation_status", "exclude")
        .order("year", { ascending: false }),
      2500
    );

    if (!error && data) items = (data as BibliographyRow[]).map(rowToBibliographyItem);
  }

  return filterBibliographyItems(items, filters);
}

export async function getBibliographyForEra(eraSlug: string, limit = 4) {
  const items = await getBibliographyItems({ era: eraSlug, recommendation: "recommended", sort: "author" });
  return items.slice(0, limit);
}

export async function getBibliographyItemBySlug(slug: string) {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await withTimeout(
      supabase
        .from("bibliography_items")
        .select(BIBLIOGRAPHY_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .neq("recommendation_status", "exclude")
        .maybeSingle(),
      2500
    );

    if (!error && data) return rowToBibliographyItem(data as BibliographyRow);
  }

  return FALLBACK_BIBLIOGRAPHY.find((item) => item.slug === slug);
}

export function filterBibliographyItems(items: BibliographyItem[], filters: BibliographyFilters = {}) {
  const q = normalize(filters.q);
  const era = normalize(filters.era);
  const tag = normalize(filters.tag);
  const type = normalize(filters.type);
  const recommendation = filters.recommendation || "recommended";

  return [...items]
    .filter((item) => {
      const haystack = normalize([
        item.title,
        item.subtitle,
        item.publicationTitle,
        item.publisher,
        item.editorialNote,
        item.reliabilityNote,
        ...item.contributors.map((contributor) => contributor.displayName),
        ...item.tags.map((itemTag) => itemTag.name)
      ].join(" "));
      return (
        (!q || haystack.includes(q)) &&
        (!era || item.eras.some((value) => normalize(value) === era)) &&
        (!tag || item.tags.some((value) => normalize(value.slug) === tag || normalize(value.name) === tag)) &&
        (!type || normalize(item.itemType) === type) &&
        (recommendation === "all" || item.recommendationStatus === recommendation)
      );
    })
    .sort((a, b) => sortBibliography(a, b, filters.sort));
}

export function formatCitation(item: BibliographyItem, style: CitationStyle) {
  if (style === "bibtex") return formatBibtex(item);
  if (style === "ris") return formatRis(item);
  if (style === "apa") return formatApa(item);
  if (style === "mla") return formatMla(item);
  return formatChicago(item);
}

export function itemTypeLabel(type: string) {
  return type.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function primaryUrl(item: BibliographyItem) {
  return item.openAccessUrl || item.pdfUrl || doiUrl(item.doi) || item.publisherUrl || item.googleBooksUrl || item.worldcatUrl || item.jstorUrl || "";
}

function rowToBibliographyItem(row: BibliographyRow): BibliographyItem {
  const contributors = (row.bibliography_item_contributors ?? [])
    .map((entry) => {
      const contributor = firstRelated(entry.contributor);
      if (!contributor) return undefined;
      return {
        id: contributor.id,
        displayName: contributor.display_name,
        familyName: contributor.family_name || undefined,
        givenName: contributor.given_name || undefined,
        role: entry.role || "author",
        position: entry.position ?? 1
      };
    })
    .filter(Boolean) as BibliographyContributor[];

  return {
    id: row.id,
    slug: row.slug,
    itemType: row.item_type,
    title: row.title,
    subtitle: row.subtitle || undefined,
    publicationTitle: row.publication_title || undefined,
    publisher: row.publisher || undefined,
    publicationPlace: row.publication_place || undefined,
    year: row.year || undefined,
    volume: row.volume || undefined,
    issue: row.issue || undefined,
    pages: row.pages || undefined,
    doi: row.doi || undefined,
    isbn: row.isbn || undefined,
    oclc: row.oclc || undefined,
    jstorUrl: row.jstor_url || undefined,
    publisherUrl: row.publisher_url || undefined,
    googleBooksUrl: row.google_books_url || undefined,
    worldcatUrl: row.worldcat_url || undefined,
    openAccessUrl: row.open_access_url || undefined,
    pdfUrl: row.pdf_url || undefined,
    abstract: row.abstract || undefined,
    editorialNote: row.editorial_note || undefined,
    reliabilityNote: row.reliability_note || undefined,
    recommendationStatus: row.recommendation_status || "recommended",
    status: row.status || "draft",
    contributors,
    tags: (row.bibliography_item_tags ?? []).map((entry) => firstRelated(entry.tag)).filter(Boolean).map((tag) => ({
      id: tag!.id,
      name: tag!.name || "",
      slug: tag!.slug || "",
      tagType: tag!.tag_type || undefined
    })),
    eras: (row.bibliography_item_eras ?? []).map((entry) => entry.era_slug).filter(Boolean) as string[],
    documentSlugs: (row.bibliography_item_documents ?? []).map((entry) => firstRelated(entry.document)?.slug).filter(Boolean) as string[]
  };
}

function sortBibliography(a: BibliographyItem, b: BibliographyItem, sort = "author") {
  if (sort === "newest") return (b.year ?? 0) - (a.year ?? 0);
  if (sort === "oldest") return (a.year ?? 0) - (b.year ?? 0);
  if (sort === "title") return a.title.localeCompare(b.title);
  return contributorSortName(a).localeCompare(contributorSortName(b)) || (a.year ?? 0) - (b.year ?? 0);
}

function formatChicago(item: BibliographyItem) {
  const authors = formatContributorList(item.contributors, "chicago");
  const title = item.itemType === "article" || item.itemType === "chapter" ? `"${fullTitle(item)}."` : `${fullTitle(item)}.`;
  const container = item.publicationTitle ? ` ${item.publicationTitle}` : "";
  const volumeIssue = item.volume ? ` ${item.volume}${item.issue ? `, no. ${item.issue}` : ""}` : "";
  const year = item.year ? ` (${item.year})` : "";
  const pages = item.pages ? `: ${item.pages}` : "";
  const publisher = item.publisher ? `${item.publicationPlace ? `${item.publicationPlace}: ` : ""}${item.publisher}${item.year ? `, ${item.year}` : ""}.` : "";
  const doi = item.doi ? ` https://doi.org/${item.doi}.` : "";
  if (item.itemType === "article") return compact(`${authors}. ${title}${container}${volumeIssue}${year}${pages}.${doi}`);
  return compact(`${authors}. ${title} ${publisher}${doi}`);
}

function formatMla(item: BibliographyItem) {
  const authors = formatContributorList(item.contributors, "mla");
  const title = item.itemType === "article" || item.itemType === "chapter" ? `"${fullTitle(item)}."` : `${fullTitle(item)}.`;
  const container = item.publicationTitle ? ` ${item.publicationTitle},` : "";
  const volume = item.volume ? ` vol. ${item.volume},` : "";
  const issue = item.issue ? ` no. ${item.issue},` : "";
  const year = item.year ? ` ${item.year},` : "";
  const pages = item.pages ? ` pp. ${item.pages}.` : ".";
  const publisher = item.publisher ? ` ${item.publisher}, ${item.year || "n.d."}.` : "";
  if (item.itemType === "article") return compact(`${authors}. ${title}${container}${volume}${issue}${year}${pages}`);
  return compact(`${authors}. ${title}${publisher}`);
}

function formatApa(item: BibliographyItem) {
  const authors = formatContributorList(item.contributors, "apa");
  const year = item.year ? `(${item.year}).` : "(n.d.).";
  const title = item.itemType === "article" ? sentenceCase(fullTitle(item)) : fullTitle(item);
  const container = item.publicationTitle ? ` ${item.publicationTitle}` : "";
  const volume = item.volume ? `, ${item.volume}${item.issue ? `(${item.issue})` : ""}` : "";
  const pages = item.pages ? `, ${item.pages}` : "";
  const doi = item.doi ? ` https://doi.org/${item.doi}` : "";
  if (item.itemType === "article") return compact(`${authors} ${year} ${title}. ${container}${volume}${pages}.${doi}`);
  return compact(`${authors} ${year} ${title}. ${item.publisher || ""}.${doi}`);
}

function formatBibtex(item: BibliographyItem) {
  const type = item.itemType === "article" ? "article" : item.itemType === "chapter" ? "incollection" : "book";
  const key = `${item.contributors[0]?.familyName || item.contributors[0]?.displayName || "source"}${item.year || "nd"}`.replace(/[^A-Za-z0-9]/g, "");
  const fields = [
    ["title", fullTitle(item)],
    ["author", item.contributors.map((contributor) => contributor.displayName).join(" and ")],
    ["year", item.year?.toString()],
    ["journal", item.itemType === "article" ? item.publicationTitle : undefined],
    ["booktitle", item.itemType === "chapter" ? item.publicationTitle : undefined],
    ["publisher", item.publisher],
    ["volume", item.volume],
    ["number", item.issue],
    ["pages", item.pages],
    ["doi", item.doi],
    ["isbn", item.isbn],
    ["url", primaryUrl(item)]
  ].filter(([, value]) => value);
  return `@${type}{${key},\n${fields.map(([name, value]) => `  ${name} = {${value}}`).join(",\n")}\n}`;
}

function formatRis(item: BibliographyItem) {
  const ty = item.itemType === "article" ? "JOUR" : item.itemType === "chapter" ? "CHAP" : "BOOK";
  const lines = [`TY  - ${ty}`];
  item.contributors.forEach((contributor) => lines.push(`AU  - ${contributor.displayName}`));
  lines.push(`TI  - ${fullTitle(item)}`);
  if (item.publicationTitle) lines.push(`T2  - ${item.publicationTitle}`);
  if (item.year) lines.push(`PY  - ${item.year}`);
  if (item.publisher) lines.push(`PB  - ${item.publisher}`);
  if (item.pages) lines.push(`SP  - ${item.pages}`);
  if (item.doi) lines.push(`DO  - ${item.doi}`);
  if (primaryUrl(item)) lines.push(`UR  - ${primaryUrl(item)}`);
  lines.push("ER  -");
  return lines.join("\n");
}

function formatContributorList(contributors: BibliographyContributor[], style: "chicago" | "mla" | "apa") {
  const authors = contributors.filter((contributor) => !contributor.role || contributor.role === "author");
  if (!authors.length) return "Unknown author";
  if (style === "apa") {
    return authors.map((author) => author.familyName && author.givenName ? `${author.familyName}, ${initials(author.givenName)}` : author.displayName).join(", ");
  }
  if (authors.length === 1) return invertedName(authors[0]);
  if (authors.length === 2) return `${invertedName(authors[0])}, and ${authors[1].displayName}`;
  return `${invertedName(authors[0])}, ${authors.slice(1, -1).map((author) => author.displayName).join(", ")}, and ${authors.at(-1)?.displayName}`;
}

function fullTitle(item: BibliographyItem) {
  return item.subtitle ? `${item.title}: ${item.subtitle}` : item.title;
}

function contributorSortName(item: BibliographyItem) {
  return item.contributors[0]?.familyName || item.contributors[0]?.displayName || item.title;
}

function invertedName(contributor: BibliographyContributor) {
  return contributor.familyName && contributor.givenName ? `${contributor.familyName}, ${contributor.givenName}` : contributor.displayName;
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).map((part) => `${part[0]}.`).join(" ");
}

function sentenceCase(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function doiUrl(doi?: string) {
  return doi ? `https://doi.org/${doi}` : "";
}

function normalize(value?: string) {
  return decodeURIComponent(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function compact(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+\./g, ".").trim();
}

function firstRelated<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | { data: null; error: Error }> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<{ data: null; error: Error }>((resolve) => {
        timeout = setTimeout(() => resolve({ data: null, error: new Error("Bibliography query timed out") }), ms);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
