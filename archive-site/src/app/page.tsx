import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { Chip } from "@/components/ui/chip";
import { SourceImage } from "@/components/source-image";
import { FeaturedSources, type FeaturedSourceCard } from "@/components/featured-sources";
import { BrowsePills, EraBand, MediumTiles } from "@/components/browse-controls";
import { HomeHeroImage } from "@/components/home-hero-image";
import { SectionHeading } from "@/components/section-heading";
import { getFacetCounts } from "@/lib/archive-query";
import { ERAS, countSourcesInEra, eraHref, getEraForYear } from "@/lib/eras";
import { listArchiveSourceSummariesFromSupabase, listCollectionSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { getSourceTitleParts } from "@/lib/source-title";
import { markdownToPlainText } from "@/lib/markdown";
import type { ArchiveSource, FacetOption } from "@/lib/types";

export const revalidate = 3600;

export default async function HomePage() {
  const [sources, collections] = await Promise.all([
    listArchiveSourceSummariesFromSupabase(),
    listCollectionSourceSummariesFromSupabase()
  ]);
  const facetCounts = getFacetCounts(sources);
  const eraFacets = eraRangeFacets(sources);
  const mediumFacets = browseTypeFacets(facetCounts.types);
  const featuredCollectionSources = collections.slice(0, 4);
  const featuredPool = featuredSourcePool(sources);
  const recentSources = [...sources].sort((a, b) => b.year - a.year).slice(0, 5);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b-2 border-archive-lavender">
          <div className="home-hero min-h-[24rem] sm:min-h-[27rem]">
            <HomeHeroImage />
            <div className="container-page relative flex min-h-[24rem] items-center justify-center py-8 sm:min-h-[27rem]">
              <div className="home-hero-panel w-full max-w-[50rem] rounded-lg border border-[rgb(var(--archive-warm-line))] px-7 py-6 sm:px-9 sm:py-7">
                <h1 className="home-hero-title max-w-[42rem] text-archive-ink">
                  A scholarly archive of psychedelic history, broadly construed
                </h1>
                <div className="mt-4 grid gap-4 text-[0.96rem] leading-[1.64] text-archive-ink/85 md:grid-cols-2 md:gap-7">
                  <p>
                    The Psychedelic History Archive is an educational platform
                    to collect some of the most significant public domain
                    historical sources relating to the history and culture of
                    psychedelics from the early modern period to the present.
                  </p>
                  <p>
                    Our goal is to create a free, objective, non-profit resource
                    for students, researchers, patients, and others who want to
                    access historical primary sources and learn about
                    understudied aspects of psychedelic history.
                  </p>
                </div>
                <div className="mt-5">
                  <SearchBar
                    className="home-hero-search"
                    mode="best"
                    placeholder="Search people, topics, sources, and more..."
                    showModeOptions
                    size="lg"
                    submitLabel="Search"
                  />
                </div>
                <div className="mt-4">
                  <BrowsePills />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page pb-5 pt-8">
          <div className="border-b border-archive-line pb-6">
            <SectionHeading eyebrow="Featured sources" actionHref="/archive" actionLabel="View all sources" />
            <FeaturedSources pool={featuredPool} />
          </div>
        </section>

        <section className="container-page grid gap-9 py-2">
          <div>
            <SectionHeading eyebrow="Browse by era" actionHref="/eras" actionLabel="View all eras" />
            <EraBand facets={eraFacets} />
          </div>
          <div>
            <SectionHeading eyebrow="Browse by medium" />
            <MediumTiles facets={mediumFacets} />
          </div>
        </section>

        {featuredCollectionSources.length > 0 && (
          <section className="container-page py-8">
            <SectionHeading eyebrow="Featured collections" actionHref="/collections" actionLabel="View all collections" />
            <div className="grid gap-5 lg:grid-cols-2">
              {featuredCollectionSources.map((collection) => (
                <Link
                  className="focus-ring group grid grid-cols-[6rem_minmax(0,1fr)] gap-3 border-r border-archive-line py-2 pr-3 transition duration-200 hover:border-archive-violet/45 hover:bg-archive-lavender2/55 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5 sm:pr-5"
                  href={`/collections/${collection.slug}`}
                  key={collection.id}
                >
                  <SourceImage className="aspect-[5/4] w-full transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_18px_rgba(57,45,31,0.12)]" source={collection} />
                  <span className="min-w-0">
                    <span className="block font-serif text-lg font-semibold leading-snug text-archive-ink transition group-hover:text-archive-violetDark">
                      {collection.title}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-archive-muted">
                      {markdownToPlainText(collection.summary) || collection.subtitle || "Curated collection from the archive."}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-archive-violet transition group-hover:text-archive-violetDark">
                      {collection.collectionItemCount ?? 0} sources <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="container-page py-8">
          <SectionHeading eyebrow="Recent additions" actionHref="/archive?sort=newest" actionLabel="View all recent additions" />
          <div className="overflow-hidden border-y border-archive-line">
            <div className="hidden grid-cols-[1.4fr_8rem_10rem_1fr_1fr_9rem_2rem] gap-4 border-b border-archive-line px-3 py-3 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-archive-muted md:grid">
              <div>Title & source</div>
              <div>Date</div>
              <div>Type</div>
              <div>Tags</div>
              <div>People</div>
              <div>Added</div>
              <div />
            </div>
            {recentSources.map((source) => (
              <Link
                className="grid gap-2 border-b border-archive-line px-3 py-3 text-sm transition last:border-b-0 hover:bg-archive-lavender2/55 md:grid-cols-[1.4fr_8rem_10rem_1fr_1fr_9rem_2rem] md:items-center"
                href={`/archive/${source.slug}`}
                key={source.id}
              >
                <span className="flex items-start gap-2">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-archive-muted" />
                  <span>
                    <span className="block font-medium">{getSourceTitleParts(source).title}</span>
                    <span className="block text-xs text-archive-muted">{source.author}</span>
                  </span>
                </span>
                <span className="text-xs text-archive-muted md:text-sm md:text-archive-ink">{source.displayDate}</span>
                <span className="text-xs font-semibold text-archive-muted md:text-sm md:font-normal md:text-archive-ink">{source.type}</span>
                <span className="flex flex-wrap gap-1">
                  {source.tags.slice(0, 2).map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </span>
                <span className="text-xs text-archive-muted md:text-sm md:text-archive-ink">{source.people[0]}</span>
                <span className="text-xs text-archive-muted md:text-sm md:text-archive-ink">{source.addedDate}</span>
                <ExternalLink className="hidden h-4 w-4 text-archive-muted md:block" />
              </Link>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <ButtonLink href="/archive" variant="outline">
              Browse the full archive
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

// Eras without commissioned art borrow a scan from one of their own sources, preferring editor picks.
function eraRangeFacets(sources: ArchiveSource[]): FacetOption[] {
  return ERAS.map((era) => {
    const withImages = sources.filter((source) => source.imagePath && getEraForYear(source.year)?.slug === era.slug);
    const fallback = withImages.find((source) => source.featured) ?? withImages[0];
    return {
      label: era.label,
      count: countSourcesInEra(sources, era),
      href: eraHref(era),
      imagePath: era.bannerThumbnail ?? era.bannerImage ?? fallback?.thumbnailPath ?? fallback?.imagePath,
      subtitle: era.eyebrow
    };
  });
}

function browseTypeFacets(counts: Record<string, number>): FacetOption[] {
  return [
    { label: "Newspapers", types: ["Newspaper Article"], href: "/archive?medium=Text&type=Newspaper%20Article" },
    { label: "Books", types: ["Book"], href: "/archive?medium=Text&type=Book" },
    { label: "Manuscripts", types: ["Manuscript"], href: "/archive?medium=Text&type=Manuscript" },
    { label: "Academic Articles", types: ["Academic Article"], href: "/archive?medium=Text&type=Academic%20Article" },
    { label: "Audio", types: ["Audio/Video"], href: "/archive?medium=Audio%2FVideo&type=Audio%2FVideo" },
    { label: "Video", types: ["Film"], href: "/archive?medium=Audio%2FVideo&type=Film" },
    { label: "Testimony", types: ["Testimony"], href: "/archive?medium=Text&type=Testimony" },
    { label: "Field Notes", types: ["Field Notes"], href: "/archive?medium=Text&type=Field%20Notes" },
    { label: "Websites", types: ["Source"], href: "/archive?type=Source" }
  ]
    .map((bucket) => ({
      label: bucket.label,
      count: bucket.types.reduce((total, type) => total + (counts[type] ?? 0), 0),
      href: bucket.href
    }))
    .filter((facet) => facet.count > 0);
}

// Editors flag home page picks in the CMS; until there are enough, top up with sources that have images.
function featuredSourcePool(sources: ArchiveSource[]): FeaturedSourceCard[] {
  const picks = sources.filter((source) => source.featured);
  const pool = picks.length >= 4 ? picks : [...picks, ...sources.filter((source) => !source.featured && source.imagePath)].slice(0, 20);
  return pool.map((source) => ({
    id: source.id,
    slug: source.slug,
    type: source.type,
    displayDate: source.displayDate,
    title: getSourceTitleParts(source).title,
    summary: markdownToPlainText(source.summary),
    author: source.author,
    imagePath: source.imagePath,
    thumbnailPath: source.thumbnailPath,
    imageAlt: source.imageAlt,
    imageTone: source.imageTone,
    eraSlug: getEraForYear(source.year)?.slug ?? "undated"
  }));
}
