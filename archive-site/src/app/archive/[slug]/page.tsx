import type { Metadata as NextMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronDown, MessageSquareWarning } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SourceReader } from "@/components/reader/source-reader";
import { getRelatedSources } from "@/lib/internal-links";
import { JsonLd, SITE_NAME, buildBreadcrumbJsonLd, buildSourceJsonLd, canonicalPath, seoDescription, sourceImageMetadata } from "@/lib/seo";
import { transcriptParagraphs } from "@/lib/reader-model";
import { SOURCE_ISSUE_TYPE_OPTIONS } from "@/lib/source-issue-reports";
import { getArchiveSourceDetailFromSupabase, listArchiveSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { listPublishedBiographySlugs } from "@/lib/supabase-biographies";
import { biographyHrefsFor } from "@/lib/biographies";
import { LEGACY_SOURCE_SLUGS } from "@/lib/legacy-slugs";
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
  if (LEGACY_SOURCE_SLUGS[slug]) permanentRedirect(`/archive/${LEGACY_SOURCE_SLUGS[slug]}`);
  const [source, sources, publishedBiographySlugs] = await Promise.all([
    getArchiveSourceDetailFromSupabase(slug),
    listArchiveSourceSummariesFromSupabase(),
    listPublishedBiographySlugs()
  ]);

  if (!source) notFound();

  const titleParts = getSourceTitleParts(source);
  const relatedSources = getRelatedSources(source, sources);
  const structuredData = [
    buildSourceJsonLd(source),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Archive", path: "/archive" },
      { name: titleParts.title, path: `/archive/${source.slug}` }
    ])
  ];

  const biographyHrefs = biographyHrefsFor([...(source.creators ?? []).map((creator) => creator.name), source.author, ...source.people], publishedBiographySlugs);
  const related = relatedSources.map(r => ({ id: r.id, slug: r.slug, title: getSourceTitleParts(r).title, type: r.type, displayDate: r.displayDate, relatedReason: r.relatedReason }));

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader variant="source" />
      <main>
        <SourceReader biographyHrefs={biographyHrefs} related={related} source={source} transcript={transcriptParagraphs(source)}>
          <SourceIssueReportPanel reportStatus={reportStatus} source={source} />
        </SourceReader>
      </main>
      <SiteFooter />
    </>
  );
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

