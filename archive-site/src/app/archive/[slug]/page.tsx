import type { Metadata as NextMetadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen, ChevronDown, MessageSquareWarning } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { canonicalizePersonName, isDisplayableBiographyName, slugifyPersonName } from "@/lib/biographies";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CitationCopyControl, SourceActions } from "@/components/source-actions";
import { SourceImage } from "@/components/source-image";
import { SourceReaderTabs } from "@/components/source-reader-tabs";
import { Chip } from "@/components/ui/chip";
import { eraHref, getEraForYear } from "@/lib/eras";
import { getRelatedSources, topicHref, type RelatedSource } from "@/lib/internal-links";
import { JsonLd, SITE_NAME, buildBreadcrumbJsonLd, buildSourceJsonLd, canonicalPath, seoDescription, sourceImageMetadata } from "@/lib/seo";
import { SOURCE_ISSUE_TYPE_OPTIONS } from "@/lib/source-issue-reports";
import { getArchiveSourceDetailFromSupabase, listArchiveSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { isPdfFile, isSiteEntry, siteEvidenceLabel } from "@/lib/source-reader";
import { getSourceTitleParts } from "@/lib/source-title";
import type { ArchiveSource } from "@/lib/types";
import { submitSourceIssueReport } from "./actions";

export const dynamic = "force-dynamic";

type SourcePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ report?: string }>;
};

export async function generateMetadata({ params }: SourcePageProps): Promise<NextMetadata> {
  const { slug } = await params;
  const source = await getArchiveSourceDetailFromSupabase(slug);

  if (!source) {
    return {
      title: `Source not found | ${SITE_NAME}`,
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const titleParts = getSourceTitleParts(source);
  const title = titleParts.subtitle ? `${titleParts.title}: ${titleParts.subtitle}` : titleParts.title;
  const description = seoDescription(source.summary || source.excerpt);
  const canonical = canonicalPath(`/archive/${source.slug}`);
  const images = sourceImageMetadata(source);

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical
    },
    keywords: [...source.tags, ...source.people, source.type, source.medium].filter(Boolean),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images,
      locale: "en_US",
      type: "article",
      publishedTime: source.addedDate || undefined,
      authors: source.creators?.length ? source.creators.map((creator) => creator.name) : [source.author]
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images
    }
  };
}

export default async function SourcePage({ params, searchParams }: SourcePageProps) {
  const { slug } = await params;
  const paramsValue = await searchParams;
  const reportStatus = normalizeReportStatus(paramsValue?.report);
  if (slug === "chavin-de-huantar-vilca-snuff") redirect("/archive/chavin-de-huantar");
  const [source, sources] = await Promise.all([
    getArchiveSourceDetailFromSupabase(slug),
    listArchiveSourceSummariesFromSupabase()
  ]);

  if (!source) notFound();

  const isExternal = source.accessType === "external";
  const titleParts = getSourceTitleParts(source);
  const relatedSources = getRelatedSources(source, sources);
  const pdfFile = getPdfFile(source);
  const structuredData = [
    buildSourceJsonLd(source),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Archive", path: "/archive" },
      { name: titleParts.title, path: `/archive/${source.slug}` }
    ])
  ];

  if (!isExternal) {
    return (
      <>
        <JsonLd data={structuredData} />
        <HostedSourcePage relatedSources={relatedSources} reportStatus={reportStatus} source={source} />
      </>
    );
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader variant="source" />
      <main className="container-page py-8">
        <Link className="focus-ring mb-8 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-archive-muted hover:text-archive-violet" href="/archive">
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_23rem] xl:grid-cols-[1fr_26rem]">
          <div>
            <div className="display-label text-sm text-archive-muted">
              {source.type}, {source.era}
            </div>
            <h1 className="mt-8 max-w-4xl text-archive-ink">
              <span className="display-title text-[2.4rem] sm:text-[2.7rem]">
                {titleParts.title}
              </span>
            </h1>
            {titleParts.subtitle && (
              <p className="mt-3 max-w-3xl font-serif text-[1.35rem] italic leading-7 text-archive-ink/80">
                {titleParts.subtitle}
              </p>
            )}

            <div className="mt-6 grid gap-4 border-y border-archive-line py-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <Metadata label="Date" value={source.displayDate} />
              <Metadata label="Type" value={source.type} />
              <Metadata label="Region" value={source.region} />
              <Metadata label="Language" value={source.language} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {source.tags.map((tag, index) => (
                <Chip href={topicHref(tag)} key={tag} tone={index === 2 ? "lavender" : "neutral"}>
                  {tag}
                </Chip>
              ))}
            </div>

            <div className="mt-9 border-b border-archive-line">
              <div className="flex gap-8">
                <span className="border-b-2 border-archive-violet px-1 py-3 text-sm font-semibold text-archive-violet">
                  {isExternal ? "Overview" : "Transcript"}
                </span>
                <span className="px-1 py-3 text-sm font-medium text-archive-muted">
                  {isExternal ? "Details" : "Original source"}
                </span>
                {!isExternal && <span className="px-1 py-3 text-sm font-medium text-archive-muted">Details</span>}
              </div>
            </div>

            <section className="mt-6 rounded-md border border-archive-line bg-archive-surface p-5 text-sm leading-6 shadow-[0_8px_24px_rgb(var(--archive-shadow)/0.05)]">
              <strong>{isExternal ? "Externally hosted source." : "You are in transcript reading mode."}</strong>{" "}
              {isExternal
                ? "The archive records this source and links to the holding repository for access."
                : "This is a text-only version of the source for easier reading and search."}{" "}
              <Link className="font-semibold text-archive-violet" href={source.sourceUrl}>
                {isExternal ? "View at source site" : "View original source"}
              </Link>
            </section>

            <section className="mt-8 max-w-[49rem]">
              <h2 className="font-serif text-3xl font-semibold">
                {isExternal ? "Selected excerpt" : "Transcript"}
              </h2>
              <blockquote className="mt-5 border-l-2 border-archive-violet pl-5 font-serif text-2xl leading-[1.65] text-archive-ink">
                “{source.excerpt}”
              </blockquote>
              <p className="mt-6 font-serif text-xl leading-[1.8] text-archive-ink">
                This record preserves the source metadata and citation context while directing readers to the holding repository for access to the original object.
              </p>
            </section>
            <SourceIssueReportPanel reportStatus={reportStatus} source={source} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-[rgb(var(--archive-warm-line))] bg-[rgb(var(--archive-warm-surface))] p-5 shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.05)]">
              <div className="grid grid-cols-[6rem_1fr] gap-4">
                <SourceImage className="aspect-[4/5] w-full" source={source} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.1em] text-archive-olive">
                    {source.type}
                  </div>
                  <p className="mt-2 font-semibold">Published in</p>
                  <p className="mt-2 italic text-archive-muted">{source.author}</p>
                  <p className="mt-2 text-sm text-archive-muted">{source.displayDate}</p>
                </div>
              </div>
            </div>

            <SourceDetailsCard
              primaryDetails={[
                { label: "Citation", value: source.citation, action: <CitationCopyControl citation={source.citation} source={source} /> },
                { label: "Access", value: isExternal ? "Hosted externally" : "Hosted by archive" }
              ]}
              secondaryDetails={[
                { label: "Archive ID", value: source.id },
                { label: "Rights", value: source.rights }
              ]}
              title="Source info"
            >
              <SourceActions
                citation={source.citation}
                pdfUrl={pdfFile?.url}
                shareTitle={titleParts.subtitle ? `${titleParts.title}: ${titleParts.subtitle}` : titleParts.title}
                source={source}
                sourceUrl={source.sourceUrl}
                viewLabel="View external source"
              />
            </SourceDetailsCard>
            <RelatedSourcesCard sources={relatedSources} />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function HostedSourcePage({ relatedSources, reportStatus, source }: { relatedSources: RelatedSource[]; reportStatus: ReportStatus; source: ArchiveSource }) {
  const transcript = getTranscriptPreview(source);
  const titleParts = getSourceTitleParts(source);
  const pdfFile = getPdfFile(source);
  const era = getEraForYear(source.year);
  const siteEntry = isSiteEntry(source);

  return (
    <>
      <SiteHeader variant="source" />
      <main className="source-page-fade">
        <div className="source-page-layout container-page py-6">
          <div className="source-page-breadcrumb mb-3 flex items-center gap-3 text-sm text-archive-muted">
            <Link className="font-semibold text-archive-violet" href={siteEntry ? `/archive?type=${encodeURIComponent(source.type)}` : "/archive?medium=Text"}>
              {siteEntry ? "Archaeological Sites" : "Text"}
            </Link>
            <span>/</span>
            {era ? <Link href={eraHref(era)}>{era.label}</Link> : <span>{source.era}</span>}
            {!siteEntry && (
              <>
                <span>/</span>
                <Link href={`/archive?type=${encodeURIComponent(source.type)}`}>{source.type}s</Link>
              </>
            )}
          </div>

          <div className="source-page-grid grid gap-7 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div>
            <div className="grid gap-6">
              <div>
                <h1 className="text-archive-ink">
                  <span className="source-display-title">
                    {titleParts.title}
                  </span>
                </h1>
                {titleParts.subtitle && (
                  <p className="mt-2 max-w-3xl font-serif text-[1.28rem] italic leading-7 text-archive-ink/80">
                    {titleParts.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-start text-sm">
              <MetaCell label="Date" value={source.displayDate} />
              <MetaCell label="Type" value={source.type} />
              {siteEntry ? (
                <>
                  <MetaCell label="Region" value={siteRegionLabel(source)} />
                  <MetaCell label="Evidence" value={siteEvidenceLabel(source)} />
                </>
              ) : (
                <PeopleMetaCell source={source} />
              )}
              <div className="border-l border-archive-line pl-5">
                <div className="text-[0.62rem] font-bold uppercase tracking-[0.09em] text-archive-muted">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {source.tags.map((tag) => (
                    <Chip href={topicHref(tag)} key={tag} tone={tagTone(tag)}>
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <SourceReaderTabs source={source} transcript={transcript} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-[rgb(var(--archive-warm-line))] bg-[rgb(var(--archive-warm-surface))] p-3.5 shadow-[0_8px_22px_rgb(var(--archive-shadow)/0.04)]">
              <div className="grid grid-cols-[4.5rem_1fr] gap-3.5">
                <SourceImage className="aspect-[4/5] w-full" source={source} />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-archive-olive">
                    {source.type}
                  </div>
                  <p className="mt-2 font-semibold">{siteEntry ? "Archive entry" : "Published in"}</p>
                  <p className={siteEntry ? "mt-2 text-sm leading-5 text-archive-muted" : "mt-2 font-serif italic text-archive-ink"}>
                    {siteEntry ? siteRegionLabel(source) : publicationLabel(source)}
                  </p>
                  <p className="mt-2 text-sm text-archive-muted">{source.displayDate}</p>
                </div>
              </div>
            </div>

            <SourceDetailsCard
              primaryDetails={[
                { label: siteEntry ? "Entry author" : "Creators", value: siteEntry ? entryAuthorLabel(source) : formatCreators(source) },
                { label: "Citation", value: source.citation, action: <CitationCopyControl citation={source.citation} source={source} /> }
              ]}
              secondaryDetails={[
                { label: "Archive ID", value: `T-1800-1950-${source.id.slice(0, 3).toUpperCase()}` },
                { label: "Language", value: source.language },
                ...(siteEntry ? [{ label: "Region", value: source.region }] : []),
                ...(siteEntry ? [{ label: "Evidence", value: siteEvidenceLabel(source) }] : []),
                ...(siteEntry && source.substances?.length > 0 ? [{ label: "Substances", value: source.substances.join(", ") }] : []),
                { label: "Rights", value: source.rights },
                { label: "Abstract", value: source.summary }
              ]}
              title={siteEntry ? "Entry info" : "Source info"}
            >
              <SourceActions
                citation={source.citation}
                pdfUrl={pdfFile?.url}
                shareTitle={titleParts.subtitle ? `${titleParts.title}: ${titleParts.subtitle}` : titleParts.title}
                source={source}
                sourceUrl={siteEntry ? undefined : source.sourceUrl}
              />
            </SourceDetailsCard>
            <RelatedSourcesCard sources={relatedSources} />
          </aside>
        </div>
        <SourceIssueReportPanel reportStatus={reportStatus} source={source} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function getPdfFile(source: ArchiveSource) {
  return source.files?.find(isPdfFile);
}

type ReportStatus = "submitted" | "invalid" | "unavailable" | "not-found" | "error" | null;

function SourceIssueReportPanel({ reportStatus, source }: { reportStatus: ReportStatus; source: ArchiveSource }) {
  const shouldOpen = Boolean(reportStatus);

  return (
    <section className="mt-8 rounded-md border border-archive-line bg-archive-surface p-4 shadow-[0_8px_22px_rgb(var(--archive-shadow)/0.04)]" id="source-issue-report">
      <details open={shouldOpen}>
        <summary className="focus-ring flex cursor-pointer list-none items-start gap-3 rounded-sm text-left [&::-webkit-details-marker]:hidden">
          <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-archive-violet" />
          <span>
            <span className="block font-semibold">Spotted a typo, factual error, broken link, or other concern?</span>
            <span className="mt-1 block text-sm leading-6 text-archive-muted">
              Report an issue with this source. Reports go to the archive QA dashboard for editorial review.
            </span>
          </span>
          <ChevronDown className="ml-auto mt-1 h-4 w-4 shrink-0 text-archive-muted" />
        </summary>
        <div className="mt-4 border-t border-archive-line pt-4">
          <ReportStatusMessage status={reportStatus} />
          <form action={submitSourceIssueReport} className="grid gap-4 text-sm">
            <input name="source_id" type="hidden" defaultValue={source.id} />
            <input name="source_slug" type="hidden" defaultValue={source.slug} />
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input autoComplete="off" name="website" tabIndex={-1} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
              <label className="grid gap-1.5">
                <span className="font-semibold">Issue type</span>
                <select className="focus-ring rounded-md border border-archive-line bg-archive-paper px-3 py-2" name="issue_type">
                  {SOURCE_ISSUE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="font-semibold">Location</span>
                <input
                  className="focus-ring rounded-md border border-archive-line bg-archive-paper px-3 py-2"
                  maxLength={300}
                  name="location"
                  placeholder="Page, section, timestamp, or short quote"
                />
              </label>
            </div>
            <label className="grid gap-1.5">
              <span className="font-semibold">What should we review?</span>
              <textarea
                className="focus-ring min-h-28 rounded-md border border-archive-line bg-archive-paper px-3 py-2 leading-6"
                maxLength={4000}
                name="description"
                placeholder="Describe the typo, factual issue, missing context, broken link, or other concern."
                required
              />
            </label>
            <label className="grid gap-1.5">
              <span className="font-semibold">Suggested correction <span className="font-normal text-archive-muted">(optional)</span></span>
              <textarea
                className="focus-ring min-h-20 rounded-md border border-archive-line bg-archive-paper px-3 py-2 leading-6"
                maxLength={1500}
                name="suggested_fix"
                placeholder="If you know the correction, add it here."
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="font-semibold">Name <span className="font-normal text-archive-muted">(optional)</span></span>
                <input className="focus-ring rounded-md border border-archive-line bg-archive-paper px-3 py-2" maxLength={120} name="reporter_name" />
              </label>
              <label className="grid gap-1.5">
                <span className="font-semibold">Email <span className="font-normal text-archive-muted">(optional)</span></span>
                <input className="focus-ring rounded-md border border-archive-line bg-archive-paper px-3 py-2" maxLength={180} name="reporter_email" type="email" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="focus-ring rounded-md border border-archive-violet bg-archive-violet px-4 py-2 font-semibold text-white hover:bg-archive-violetDark" type="submit">
                Submit report
              </button>
              <p className="text-xs leading-5 text-archive-muted">
                We use your email only if follow-up would help resolve the issue.
              </p>
            </div>
          </form>
        </div>
      </details>
    </section>
  );
}

function ReportStatusMessage({ status }: { status: ReportStatus }) {
  if (!status) return null;

  const messages: Record<Exclude<ReportStatus, null>, string> = {
    submitted: "Thanks. Your report has been sent to the archive QA queue.",
    invalid: "Please include a little more detail before submitting the report.",
    unavailable: "Issue reporting is not fully configured yet. Try again after the source issue report schema has been applied.",
    "not-found": "We could not verify this source before saving the report.",
    error: "Something went wrong while saving the report.",
  };

  return (
    <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${
      status === "submitted"
        ? "border-green-200 bg-green-50 text-green-800"
        : "border-amber-200 bg-amber-50 text-amber-900"
    }`}>
      {messages[status]}
    </div>
  );
}

function normalizeReportStatus(value: string | undefined): ReportStatus {
  if (value === "submitted" || value === "invalid" || value === "unavailable" || value === "not-found" || value === "error") return value;
  return null;
}

function siteRegionLabel(source: ArchiveSource) {
  return source.region.split(";").map((part) => part.trim()).filter(Boolean).slice(0, 2).join(", ") || source.region;
}

function entryAuthorLabel(source: ArchiveSource) {
  const citationAuthor = source.citation.match(/^([^,]+),\s+The Psychedelic History Archive\./)?.[1]?.trim();
  return citationAuthor || source.author;
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="pr-5 border-l border-archive-line pl-5 first:border-l-0 first:pl-0">
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.09em] text-archive-muted">{label}</div>
      <div className="mt-1 text-[13px] font-medium">{value}</div>
    </div>
  );
}

function PeopleMetaCell({ source }: { source: ArchiveSource }) {
  const people = source.people.length ? source.people : [source.author];

  return (
    <div className="pr-5 border-l border-archive-line pl-5 first:border-l-0 first:pl-0">
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.09em] text-archive-muted">People</div>
      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-medium">
        {people.map((person, index) => {
          const canonicalName = canonicalizePersonName(person);
          const content = (
            <>
              {canonicalName}
              {index < people.length - 1 && <span className="text-archive-muted">,</span>}
            </>
          );

          if (!isDisplayableBiographyName(canonicalName)) {
            return <span key={`${person}-${index}`}>{content}</span>;
          }

          return (
            <Link className="focus-ring rounded-sm text-archive-ink hover:text-archive-violet" href={`/biographies/${slugifyPersonName(canonicalName)}`} key={`${person}-${index}`}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const TAG_TONES: Record<string, "lavender" | "olive" | "sand" | "rose" | "neutral"> = {
  "Nitrous Oxide": "lavender",
  "Consciousness": "olive",
  "Altered States": "sand",
  "Psychology": "rose",
  "Mysticism": "lavender",
  "William James": "olive"
};

function tagTone(tag: string) {
  return TAG_TONES[tag] ?? "neutral";
}

type DetailItem = {
  label: string;
  action?: ReactNode;
  value: string;
};

function SourceDetailsCard({
  children,
  primaryDetails,
  secondaryDetails,
  title
}: {
  children: ReactNode;
  primaryDetails: DetailItem[];
  secondaryDetails: DetailItem[];
  title: string;
}) {
  const visibleSecondaryDetails = secondaryDetails.filter((detail) => detail.value);
  const detailsToggleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-full-details`;

  return (
    <div className="rounded-lg border border-archive-line bg-archive-surface shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.04)]">
      <div className="p-4 pb-3">
        {visibleSecondaryDetails.length > 0 ? (
          <div className="grid gap-3">
            <input className="peer sr-only" id={detailsToggleId} type="checkbox" />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 peer-checked:[&_svg]:rotate-180">
              <h2 className="source-serif-heading">{title}</h2>
              <label className="focus-ring flex cursor-pointer items-center gap-1.5 rounded-sm py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-archive-violet transition hover:text-archive-violetDark" htmlFor={detailsToggleId}>
                <span>Full details</span>
                <ChevronDown className="h-4 w-4 transition-transform" />
              </label>
            </div>
            <dl className="space-y-2.5 text-sm">
              {primaryDetails.map((detail) => (
                <Detail action={detail.action} label={detail.label} value={detail.value} key={detail.label} />
              ))}
            </dl>
            <dl className="-mt-1 hidden space-y-2.5 border-t border-archive-line/80 pt-2.5 text-sm peer-checked:block">
              {visibleSecondaryDetails.map((detail) => (
                <Detail action={detail.action} label={detail.label} value={detail.value} key={detail.label} />
              ))}
            </dl>
          </div>
        ) : (
          <>
            <h2 className="source-serif-heading">{title}</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              {primaryDetails.map((detail) => (
                <Detail action={detail.action} label={detail.label} value={detail.value} key={detail.label} />
              ))}
            </dl>
          </>
        )}
      </div>
      {children}
    </div>
  );
}

function Detail({ action, label, value }: { action?: ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5.4rem_minmax(0,1fr)] gap-3 border-b border-archive-line/80 pb-2.5 last:border-b-0">
      <dt className="text-[13px] font-semibold text-archive-ink">{label}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere] text-[13px] leading-5 text-archive-muted">
        {value}
        {action}
      </dd>
    </div>
  );
}

function RelatedSourcesCard({ sources }: { sources: RelatedSource[] }) {
  if (!sources.length) return null;

  return (
    <section className="rounded-lg border border-archive-line bg-archive-surface p-4 shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.04)]">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-archive-violet" />
        <h2 className="source-serif-heading">Related sources</h2>
      </div>
      <div className="mt-4 divide-y divide-archive-line">
        {sources.map((source) => {
          const titleParts = getSourceTitleParts(source);

          return (
            <Link className="focus-ring block rounded-sm py-3 first:pt-0 last:pb-0 hover:text-archive-violet" href={`/archive/${source.slug}`} key={source.id}>
              <span className="block text-[0.64rem] font-bold uppercase tracking-[0.09em] text-archive-muted">
                {source.type} · {source.displayDate}
              </span>
              <span className="mt-1 block text-sm font-semibold leading-5 text-archive-ink">
                {titleParts.subtitle ? `${titleParts.title}: ${titleParts.subtitle}` : titleParts.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-archive-muted">
                {source.relatedReason}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function publicationLabel(source: ArchiveSource) {
  if (source.publicationTitle) {
    return source.publicationTitle;
  }

  const quotedTitleParts = source.citation.split("\"");
  const citationAfterTitle = quotedTitleParts.length > 2 ? quotedTitleParts.at(-1) ?? "" : "";
  const publication = citationAfterTitle
    .replace(/^[\s.,:]+/, "")
    .match(/^(.+?)(?:\s+\d|,\s*\d|\s*\()/)?.[1]
    ?.trim();

  if (publication) return publication;

  return source.author;
}

function formatCreators(source: ArchiveSource) {
  if (!source.creators?.length) return source.author;
  return source.creators
    .map((creator) => `${creator.name} (${creator.role})`)
    .join("; ");
}

function getTranscriptPreview(source: ArchiveSource) {
  if (source.transcript) {
    const cleaned = stripImportedTranscriptMetadata(source.transcript);
    const paragraphs = cleaned.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
    const hasOnlyLegacySingleBreaks = paragraphs.length <= 1 && /\n/.test(cleaned);

    return (hasOnlyLegacySingleBreaks ? cleaned.split(/\n+/) : paragraphs)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  const sourceId = source.id;

  if (sourceId.includes("-")) {
    return [
      "No transcript text is available yet for this source. Check the source details and original source link for current access."
    ];
  }

  if (sourceId === "james_1882_subjective_effects_nitrous_oxide") {
    return [
      "Some observations of the effects of nitrous-oxide-gas-intoxication which I was prompted to make by reading the pamphlet called The anaesthetic revelation and the gist of philosophy, have made me understand better than ever before both the strength and the weakness of Hegel's philosophy.",
      "With me, as with every other person of whom I have heard, the keynote of the experience is the tremendously exciting sense of an intense metaphysical illumination. Truth lies open to the view in depth beneath depth of almost blinding evidence.",
      "The mind sees all the logical relations of being with an apparent subtlety and instantaneity to which its normal consciousness offers no parallel; only as sobriety returns, the feeling of insight fades.",
      "The immense emotional sense of reconciliation which characterizes the maudlin stage of alcoholic drunkenness is well-known. The centre and periphery of things seem to come together. The ego and its objects, the meum and the tuum, are one."
    ];
  }

  if (sourceId === "james_1898_consciousness_under_nitrous_oxide") {
    return [
      "An English correspondent sends me the following account of his subjective experiences during nitrous-oxide intoxication. I place it, with his permission, on record in the Psychological Review.",
      "One morning in June, 1895, or certainly not later than the end of May, I went round to a dentist's opposite Balliol College, to have a tooth out. I had never taken gas before, and never have since.",
      "The next experience I became aware of, who shall relate! my God! I knew everything! A vast inrush of obvious and absolutely satisfying solutions to all possible problems overwhelmed my entire being.",
      "The truth had evaporated, like a forgotten dream, and left me with half-formed phrases on my lips and an ashen-gray delight in my heart."
    ];
  }

  return [
    sourceId,
    "This hosted source has a local transcript in the project corpus. The production reader will load the complete text with page anchors, OCR snippets, and links to scanned source images where available."
  ];
}

function stripImportedTranscriptMetadata(transcript: string) {
  const lines = transcript.split(/\r?\n/);
  const markerIndex = lines.findIndex((line) =>
    /^(transcription|complete transcription|partial transcript|partial translation)$/i.test(line.trim())
  );

  if (markerIndex !== -1) {
    return lines.slice(markerIndex + 1).join("\n").trim();
  }

  while (lines.length && (!lines[0].trim() || /^(authors?|date|source)\s*:/i.test(lines[0].trim()))) {
    lines.shift();
  }

  return lines.join("\n").trim();
}
