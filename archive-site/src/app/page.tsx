import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { Chip } from "@/components/ui/chip";
import { SourceImage } from "@/components/source-image";
import { BrowsePills, EraBand, MediumTiles } from "@/components/browse-controls";
import { HomeHeroImage } from "@/components/home-hero-image";
import { SectionHeading } from "@/components/section-heading";
import { getFacetCounts } from "@/lib/archive-query";
import { ERAS, countSourcesInEra, eraHref } from "@/lib/eras";
import { getArchiveSourcesFromSupabase, getCollectionSourcesFromSupabase } from "@/lib/supabase-archive";
import { getSourceTitleParts } from "@/lib/source-title";
import type { FacetOption } from "@/lib/types";

export const revalidate = 3600;

export default async function HomePage() {
  const [sources, collections] = await Promise.all([
    getArchiveSourcesFromSupabase(),
    getCollectionSourcesFromSupabase()
  ]);
  const facetCounts = getFacetCounts(sources);
  const eraFacets = eraRangeFacets(sources);
  const mediumFacets = browseTypeFacets(facetCounts.types);
  const featuredCollectionSources = collections.slice(0, 4);
  const featured = sources.find((source) => source.slug === "mead-lsd-memo") ?? sources.find((source) => source.featured) ?? sources[0];
  const supportingSources = sources.filter((source) => source.id !== featured.id).slice(0, 4);
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
                    placeholder="Search people, topics, sources, and more..."
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
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
              {[featured, ...supportingSources.slice(0, 3)].map((source, index) => (
                <Link
                  className="featured-source-card focus-ring group grid min-h-[8.5rem] grid-cols-[6.25rem_1fr] gap-4 rounded-md border border-[rgb(var(--archive-warm-line))] p-3 transition hover:border-archive-violet/45 hover:bg-[rgb(var(--archive-warm-hover))]"
                  href={`/archive/${source.slug}`}
                  key={source.id}
                >
                  <SourceImage
                    className="featured-source-image aspect-[4/5] h-[8rem] w-full border-[rgb(var(--archive-warm-line))] opacity-[0.94] transition group-hover:opacity-100"
                    imageClassName={source.imageTone === "portrait" ? "object-top" : undefined}
                    source={source}
                  />
                  <span className="min-w-0">
                    <span className="display-label block text-[0.8rem] text-archive-olive">
                      {source.type}, {source.displayDate}
                    </span>
                    <span className="mt-2 block font-serif text-[1.03rem] font-semibold leading-snug text-archive-ink group-hover:text-archive-violetDark">
                      {getSourceTitleParts(source).title}
                    </span>
                    <span className="featured-source-summary mt-1.5 text-[0.92rem] leading-5 text-archive-muted">
                      {index === 0 ? source.summary : source.author}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
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
                  className="focus-ring group grid grid-cols-[10rem_1fr] gap-5 border-r border-archive-line py-2 pr-5 transition duration-200 hover:border-archive-violet/45 hover:bg-archive-lavender2/55"
                  href={`/collections/${collection.slug}`}
                  key={collection.id}
                >
                  <SourceImage className="aspect-[5/4] w-full transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_18px_rgba(57,45,31,0.12)]" source={collection} />
                  <span>
                    <span className="block font-serif text-lg font-semibold leading-snug text-archive-ink transition group-hover:text-archive-violetDark">
                      {collection.title}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-archive-muted">
                      {collection.summary || collection.subtitle || "Curated collection from the archive."}
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
                className="grid gap-3 border-b border-archive-line px-3 py-3 text-sm transition last:border-b-0 hover:bg-archive-lavender2/55 md:grid-cols-[1.4fr_8rem_10rem_1fr_1fr_9rem_2rem] md:items-center"
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
                <span>{source.displayDate}</span>
                <span>{source.type}</span>
                <span className="flex flex-wrap gap-1">
                  {source.tags.slice(0, 2).map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </span>
                <span>{source.people[0]}</span>
                <span>{source.addedDate}</span>
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

function eraRangeFacets(sources: Array<{ year: number }>): FacetOption[] {
  return ERAS.map((era) => ({
    label: era.label,
    count: countSourcesInEra(sources, era),
    href: eraHref(era),
    imagePath: era.bannerImage,
    subtitle: era.eyebrow
  }));
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
