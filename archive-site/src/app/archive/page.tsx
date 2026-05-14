import { ArchiveFilterSidebar } from "@/components/archive-filter-sidebar";
import { ArchiveGridCard } from "@/components/archive-grid-card";
import { ArchiveResultRow } from "@/components/archive-result-row";
import { ArchiveToolbar } from "@/components/archive-toolbar";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { SourceImage } from "@/components/source-image";
import { filterArchiveSources, type ArchiveSearchParams } from "@/lib/archive-query";
import { getArchiveSourcesFromSupabase } from "@/lib/supabase-archive";
import { getSourceTitleParts } from "@/lib/source-title";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ArchiveSource } from "@/lib/types";

export const revalidate = 3600;

const pageSize = 50;

type ArchivePageProps = {
  searchParams: Promise<ArchiveSearchParams>;
};

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const sources = await getArchiveSourcesFromSupabase();
  const results = filterArchiveSources(sources, params);
  const currentPage = parsePage(params.page);
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const pagedResults = results.slice((safePage - 1) * pageSize, safePage * pageSize);
  const view = params.view === "grid" ? "grid" : "list";
  const queryString = toQueryString(params, ["view", "page"]);
  const featured = shouldShowFeaturedSource(params) ? getContextualFeaturedSource(results) : undefined;
  const pageEra = params.era ?? "All eras";
  const pageIntro = params.era
    ? "Browse sources for this era using the filters, search controls, and sort options below."
    : "Browse all imported sources from the archive database, then narrow by era, medium, category, people, tags, or region.";

  return (
    <>
      <SiteHeader variant="source" showSourceSettings={false} />
      <main className="w-full px-6 py-6 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[17.5rem_1fr]">
          <ArchiveFilterSidebar
            active={{
              access: params.access,
              era: params.era,
              medium: params.medium,
              tag: params.tag,
              region: params.region,
              people: params.people
            }}
            sources={sources}
          />
          <div>
            <section className={`grid gap-6 border-b border-archive-line pb-6 ${featured ? "xl:grid-cols-[1fr_30rem]" : ""}`}>
              <div className="pt-2">
                <h1 className="font-display text-4xl font-semibold uppercase leading-none tracking-[0.01em] sm:text-5xl">
                  {pageEra}
                </h1>
                <p className="mt-4 max-w-4xl text-[0.98rem] leading-7 text-archive-ink">
                  {pageIntro}{" "}
                  <Link className="font-medium text-archive-violet" href="/collections">
                    Read more
                  </Link>
                </p>
              </div>
              {featured && <FeaturedArchiveSource source={featured} />}
            </section>

            <section className="pt-5">
              <ArchiveToolbar
                count={results.length}
                currentView={view}
                params={params}
                queryString={queryString}
                sort={params.sort}
              />

              {view === "grid" ? (
                <div className="grid gap-5 py-6 md:grid-cols-2 xl:grid-cols-3">
                  {pagedResults.map((source) => (
                    <ArchiveGridCard key={source.id} source={source} />
                  ))}
                </div>
              ) : (
                <div>
                  <div className="hidden grid-cols-[minmax(24rem,1.45fr)_6rem_8rem_minmax(12rem,1fr)_minmax(10rem,0.8fr)_2rem] gap-4 border-b border-archive-line py-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-archive-ink/70 md:grid">
                    <div>Title & source</div>
                    <div>Date ↓</div>
                    <div>Type</div>
                    <div>Tags</div>
                    <div>People</div>
                    <div />
                  </div>
                  {pagedResults.map((source) => (
                    <ArchiveResultRow key={source.id} source={source} />
                  ))}
                </div>
              )}

              {results.length > pageSize && (
                <ArchivePagination
                  currentPage={safePage}
                  pageCount={pageCount}
                  params={params}
                  resultCount={results.length}
                />
              )}

              {results.length === 0 && (
                <div className="rounded-lg border border-archive-line bg-archive-surface p-8 text-center">
                  <SectionHeading title="No sources found" />
                  <p className="text-archive-muted">Try clearing filters or searching a broader term.</p>
                  <ButtonLink className="mt-5" href="/archive" variant="outline">
                    Clear archive filters
                  </ButtonLink>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function ArchivePagination({
  currentPage,
  pageCount,
  params,
  resultCount
}: {
  currentPage: number;
  pageCount: number;
  params: ArchiveSearchParams;
  resultCount: number;
}) {
  const firstResult = (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, resultCount);

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-archive-line pt-5 text-sm" aria-label="Archive pagination">
      <span className="text-archive-muted">
        Showing {firstResult}-{lastResult} of {resultCount}
      </span>
      <div className="flex items-center gap-2">
        <PaginationLink disabled={currentPage <= 1} href={archivePageHref(params, currentPage - 1)}>
          Previous
        </PaginationLink>
        <span className="px-2 font-medium text-archive-ink">
          Page {currentPage} of {pageCount}
        </span>
        <PaginationLink disabled={currentPage >= pageCount} href={archivePageHref(params, currentPage + 1)}>
          Next
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({ children, disabled, href }: { children: ReactNode; disabled?: boolean; href: string }) {
  if (disabled) {
    return (
      <span className="inline-flex h-9 items-center rounded-md border border-archive-line px-3 font-semibold text-archive-muted/60">
        {children}
      </span>
    );
  }

  return (
    <Link className="focus-ring inline-flex h-9 items-center rounded-md border border-archive-line px-3 font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2" href={href}>
      {children}
    </Link>
  );
}

function archivePageHref(params: ArchiveSearchParams, page: number) {
  const query = toQueryString({ ...params, page: page > 1 ? String(page) : undefined });
  return query ? `/archive?${query}` : "/archive";
}

function parsePage(value?: string) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function shouldShowFeaturedSource(params: ArchiveSearchParams) {
  return Boolean(params.era && params.medium);
}

function getContextualFeaturedSource(results: ArchiveSource[]) {
  const featured = results.find((source) => source.featured);
  if (featured) return featured;

  return [...results].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))[0];
}

function FeaturedArchiveSource({ source }: { source: ArchiveSource }) {
  const titleParts = getSourceTitleParts(source);

  return (
    <aside className="rounded-md border border-archive-line bg-archive-lavender2 p-5 shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.08)]">
      <article className="grid min-h-[9.5rem] items-start gap-5 sm:grid-cols-[1fr_12.25rem]">
        <div className="min-w-0">
          <div className="mb-4 font-display text-[0.83rem] font-semibold uppercase leading-none tracking-[0.18em] text-archive-violet">
            Featured
          </div>
          <Link href={`/archive/${source.slug}`} className="block focus-ring rounded-sm">
            <h2 className="[font-family:var(--font-source-serif),Georgia,serif] text-[1.22rem] font-semibold leading-[1.08] text-archive-ink transition hover:text-archive-violet">
              {titleParts.title}
            </h2>
          </Link>
          {titleParts.subtitle && (
            <p className="mt-1 line-clamp-2 font-serif text-[0.9rem] italic leading-5 text-archive-ink/80">
              {titleParts.subtitle}
            </p>
          )}
          <div className="mt-2 text-[0.84rem] font-medium text-archive-ink">
            {source.displayDate} <span className="px-1 text-archive-muted">•</span> {formatFeaturedType(source.type)}
          </div>
          <p className="mt-5 line-clamp-3 max-w-[18rem] text-[0.9rem] leading-6 text-archive-ink">
            {source.summary}
          </p>
        </div>
        <Link className="mt-1 block" href={`/archive/${source.slug}`} aria-label={`View source: ${source.title}`}>
          <SourceImage
            className="aspect-[4/3] w-full rounded-sm"
            imageClassName={source.imageTone === "portrait" ? "object-cover object-top" : undefined}
            source={source}
          />
        </Link>
      </article>
    </aside>
  );
}

function formatFeaturedType(type: string) {
  if (type === "Book") return "Printed Book";
  return type;
}

function toQueryString(params: ArchiveSearchParams, omit: string[] = []) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (!value || omit.includes(key)) return;
    searchParams.set(key, value);
  });
  return searchParams.toString();
}
