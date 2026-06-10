import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SourceImage } from "@/components/source-image";
import { Chip } from "@/components/ui/chip";
import {
  ERAS,
  adjacentEras,
  archiveQueryHrefForEra,
  bannerBackground,
  getEraBySlug,
  sourceMatchesEra
} from "@/lib/eras";
import { getBibliographyForEra, itemTypeLabel, primaryUrl } from "@/lib/bibliography";
import { listArchiveSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { getSourceTitleParts } from "@/lib/source-title";
import { biographyProfiles } from "@/lib/biographies";

export const revalidate = 3600;

export async function generateStaticParams() {
  return ERAS.map((era) => ({ slug: era.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const era = getEraBySlug(slug);
  if (!era) return { title: "Era not found" };
  return {
    title: `${era.label} · ${era.eyebrow} | The Psychedelic History Archive`,
    description: era.shortDescription
  };
}

const SOURCES_PER_PAGE = 12;

export default async function EraDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const era = getEraBySlug(slug);
  if (!era) notFound();

  const allSources = await listArchiveSourceSummariesFromSupabase();
  const furtherReading = await getBibliographyForEra(era.slug, 4);
  const sources = allSources
    .filter((source) => source.year && sourceMatchesEra(source.year, era))
    .sort((a, b) => a.year - b.year);

  const peopleSet = new Set<string>();
  const collectionSet = new Set<string>();
  sources.forEach((source) => {
    source.people?.forEach((person) => peopleSet.add(person));
    if (source.parentCollectionId) collectionSet.add(source.parentCollectionId);
  });

  const visibleSources = sources.slice(0, SOURCES_PER_PAGE);
  const { previous, next } = adjacentEras(era.slug);

  const profileBySlug = new Map(biographyProfiles.map((profile) => [profile.slug, profile]));

  return (
    <>
      <SiteHeader activeLabel="Eras" />
      <section className="era-banner">
        <div
          aria-hidden="true"
          className="era-banner-image"
          style={{ background: bannerBackground(era) }}
        />
        <div className="container-page relative pb-9 pt-12">
          <nav aria-label="Breadcrumb" className="display-label inline-flex items-center gap-2 text-[0.78rem] text-archive-muted">
            <Link className="transition hover:text-archive-violetDark" href="/eras">
              Eras
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span className="text-archive-ink/80">{era.label}</span>
          </nav>
          <p className="mt-5 font-display text-[0.88rem] uppercase tracking-[0.1em] text-archive-violetDark">
            {era.eyebrow}
          </p>
          <h1 className="era-detail-title mt-1.5">{era.label}</h1>
          <p className="mt-5 max-w-[44rem] font-serif text-[1.18rem] italic leading-[1.55] text-archive-ink">
            {era.tagline}
          </p>
          <div className="mt-8 flex flex-wrap border-y border-[rgb(var(--archive-warm-line))]">
            <EraStat label="Primary sources" value={sources.length} />
            <EraStat label="People" value={peopleSet.size} />
            <EraStat label="Collections" value={collectionSet.size} />
            <EraStat label="Further reading" value={furtherReading.length} />
          </div>
        </div>
      </section>

      <main className="container-page py-10">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* LEFT: sources */}
          <section
            aria-labelledby="era-sources-heading"
            className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_10px_24px_rgb(var(--archive-shadow)/0.035)]"
          >
            <header className="flex items-baseline justify-between gap-4 border-b border-archive-line px-6 py-4">
              <h2
                className="font-display text-[1rem] font-normal uppercase tracking-[0.08em] text-archive-ink"
                id="era-sources-heading"
              >
                Sources in this era
              </h2>
              <span className="text-[0.84rem] text-archive-muted">
                {sources.length.toLocaleString()} {sources.length === 1 ? "result" : "results"}
              </span>
            </header>
            {visibleSources.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-archive-muted">
                No sources currently catalogued for this era. Check back as the archive grows.
              </div>
            ) : (
              <ul className="divide-y divide-archive-line">
                {visibleSources.map((source) => {
                  const titleParts = getSourceTitleParts(source);
                  return (
                    <li key={source.id}>
                      <Link
                        className="grid grid-cols-[3.6rem_minmax(0,1fr)_auto] gap-4 px-6 py-4 transition hover:bg-archive-lavender2/55"
                        href={`/archive/${source.slug}`}
                      >
                        <SourceImage
                          className="aspect-[3/4] h-[4.6rem] w-[3.6rem]"
                          source={source}
                        />
                        <div className="min-w-0">
                          <h3 className="font-serif text-[1.02rem] font-semibold leading-snug text-archive-ink">
                            {titleParts.title}
                          </h3>
                          {source.author && (
                            <p className="mt-0.5 text-[0.84rem] leading-5 text-archive-muted">
                              {source.author}
                              {source.type ? ` · ${source.type}` : ""}
                            </p>
                          )}
                          {source.excerpt && (
                            <p className="mt-1.5 line-clamp-2 font-serif text-[0.88rem] italic leading-[1.45] text-archive-ink/75">
                              {source.excerpt}
                            </p>
                          )}
                          {source.tags?.length ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {source.tags.slice(0, 3).map((tag) => (
                                <Chip key={tag}>{tag}</Chip>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <span className="font-display text-[0.86rem] tracking-[0.04em] text-archive-muted">
                          {source.displayDate || source.year}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {sources.length > visibleSources.length && (
              <div className="border-t border-archive-line px-6 py-4 text-center">
                <Link
                  className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-archive-violet/45 bg-archive-lavender2/60 px-3.5 py-1.5 text-[0.86rem] font-semibold text-archive-violet transition hover:border-archive-violet hover:bg-archive-lavender"
                  href={archiveQueryHrefForEra(era)}
                >
                  Browse all {sources.length.toLocaleString()} sources
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </section>

          {/* RIGHT: essay + further reading */}
          <div className="grid gap-9 self-start">
            <section
              aria-labelledby="era-essay-heading"
              className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_10px_24px_rgb(var(--archive-shadow)/0.035)]"
            >
              <header className="flex items-baseline justify-between gap-4 border-b border-archive-line px-6 py-4">
                <h2
                  className="font-display text-[1rem] font-normal uppercase tracking-[0.08em] text-archive-ink"
                  id="era-essay-heading"
                >
                  A historian&rsquo;s overview
                </h2>
                <span className="text-[0.84rem] text-archive-muted">
                  {era.essay && era.essay.length > 0 ? estimateReadTime(era.essay) : "In preparation"}
                </span>
              </header>
              <div className="px-6 py-6">
                {era.essay && era.essay.length > 0 ? (
                  <div className="era-essay-body">
                    {era.essay.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="font-serif text-[0.96rem] italic leading-6 text-archive-muted">
                    A contextual essay for this era is in preparation. In the
                    meantime, the sources at left, the key figures below, and
                    the further-reading panel offer entry points.
                  </p>
                )}

                {era.keyFigures.length > 0 && (
                  <div className="mt-7 border-t border-dashed border-archive-line pt-5">
                    <p className="font-display text-[0.78rem] uppercase tracking-[0.08em] text-archive-muted">
                      Key figures in this era
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {era.keyFigures.map((figure) => {
                        const profile = profileBySlug.get(figure.slug);
                        const initials = figure.name
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase();
                        return (
                          <Link
                            className="inline-flex items-center gap-2 rounded-full border border-archive-line bg-archive-surface py-1 pl-1 pr-3 text-[0.86rem] text-archive-ink transition hover:border-archive-violet/45 hover:bg-archive-lavender2/55"
                            href={`/biographies/${figure.slug}`}
                            key={figure.slug}
                          >
                            <span className="grid h-6 w-6 place-items-center overflow-hidden rounded-full border border-archive-warm-line bg-archive-lavender2 font-display text-[0.7rem] text-archive-muted">
                              {profile?.imagePath ? (
                                <img
                                  alt=""
                                  className="h-full w-full object-cover object-top grayscale sepia-[.18]"
                                  src={profile.imagePath}
                                />
                              ) : (
                                initials
                              )}
                            </span>
                            {figure.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section
              aria-labelledby="era-reading-heading"
              className="overflow-hidden rounded-md border border-archive-line bg-archive-surface shadow-[0_10px_24px_rgb(var(--archive-shadow)/0.035)]"
            >
              <header className="flex items-baseline justify-between gap-4 border-b border-archive-line px-6 py-4">
                <h2
                  className="font-display text-[1rem] font-normal uppercase tracking-[0.08em] text-archive-ink"
                  id="era-reading-heading"
                >
                  Further reading
                </h2>
                <span className="text-[0.84rem] text-archive-muted">Secondary sources</span>
              </header>
              <ul className="divide-y divide-archive-line px-6">
                {furtherReading.map((item) => (
                  <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4" key={item.id}>
                    <div className="min-w-0">
                      <Link className="font-serif text-[0.98rem] font-semibold leading-snug text-archive-ink hover:text-archive-violet" href={primaryUrl(item) || "/further-reading"}>
                        {item.title}
                      </Link>
                      <p className="mt-0.5 text-[0.82rem] leading-5 text-archive-muted">
                        {item.contributors.map((contributor) => contributor.displayName).join(", ")}
                        {item.publicationTitle ? ` · ${item.publicationTitle}` : ""}
                        {item.year ? `, ${item.year}` : ""}
                      </p>
                      <p className="mt-1.5 text-[0.88rem] leading-[1.45] text-archive-ink/85">
                        {item.editorialNote}
                      </p>
                    </div>
                    <span className="self-start font-display text-[0.72rem] uppercase tracking-[0.08em] text-archive-muted border border-archive-line rounded-sm bg-archive-lavender2 px-2 py-0.5">
                      {itemTypeLabel(item.itemType)}
                    </span>
                  </li>
                ))}
                {!furtherReading.length && (
                  <li className="py-6 text-sm text-archive-muted">
                    Vetted secondary sources for this era are being prepared.
                  </li>
                )}
              </ul>
              <div className="border-t border-archive-line px-6 py-3 text-right">
                <Link
                  className="focus-ring inline-flex items-center gap-1.5 text-[0.84rem] font-semibold text-archive-violet transition hover:text-archive-violetDark"
                  href="/further-reading"
                >
                  Full bibliography
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Adjacent era nav */}
        <nav aria-label="Adjacent eras" className="mt-12 grid gap-3 border-t border-archive-line pt-7 sm:grid-cols-2">
          {previous ? (
            <Link
              className="focus-ring group block rounded-md border border-archive-line bg-archive-surface px-5 py-4 transition hover:-translate-y-px hover:border-archive-violet/45 hover:bg-archive-lavender2/60"
              href={`/eras/${previous.slug}`}
            >
              <span className="inline-flex items-center gap-1.5 font-display text-[0.72rem] uppercase tracking-[0.1em] text-archive-muted">
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous era
              </span>
              <span className="mt-1 block font-display text-[1.35rem] font-normal uppercase tracking-[0.02em] text-archive-ink">
                {previous.label}
              </span>
              <span className="text-[0.84rem] text-archive-muted">{previous.eyebrow}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              className="focus-ring group block rounded-md border border-archive-line bg-archive-surface px-5 py-4 text-right transition hover:-translate-y-px hover:border-archive-violet/45 hover:bg-archive-lavender2/60"
              href={`/eras/${next.slug}`}
            >
              <span className="inline-flex items-center gap-1.5 font-display text-[0.72rem] uppercase tracking-[0.1em] text-archive-muted">
                Next era
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block font-display text-[1.35rem] font-normal uppercase tracking-[0.02em] text-archive-ink">
                {next.label}
              </span>
              <span className="text-[0.84rem] text-archive-muted">{next.eyebrow}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}

function EraStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-3 border-r border-[rgb(var(--archive-warm-line))] px-6 py-3.5 first:pl-0 last:border-r-0">
      <span className="font-display text-[1.55rem] font-medium leading-none text-archive-ink">
        {value.toLocaleString()}
      </span>
      <span className="font-display text-[0.72rem] uppercase tracking-[0.06em] text-archive-muted">
        {label}
      </span>
    </div>
  );
}

function estimateReadTime(paragraphs: string[]) {
  const words = paragraphs.reduce((total, paragraph) => total + paragraph.split(/\s+/).length, 0);
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}
