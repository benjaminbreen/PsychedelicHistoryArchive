import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArchiveResultRow } from "@/components/archive-result-row";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Chip } from "@/components/ui/chip";
import { canonicalizePersonName, slugifyPersonName } from "@/lib/biographies";
import { eraHref, getEraForYear } from "@/lib/eras";
import { findTopicBySlug, getTopicSources, topicHref, topicSlug } from "@/lib/internal-links";
import { JsonLd, SITE_NAME, buildBreadcrumbJsonLd, canonicalPath, seoDescription } from "@/lib/seo";
import { listArchiveSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { getPublicTopicBundle, listPublicTopics } from "@/lib/topics";
import type { ArchiveSource } from "@/lib/types";

export const revalidate = 3600;

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [sources, curatedBundle] = await Promise.all([
    listArchiveSourceSummariesFromSupabase(),
    getPublicTopicBundle(slug)
  ]);
  const topic = curatedBundle?.topic.name ?? findTopicBySlug(sources, slug);

  if (!topic) {
    return {
      title: `Topic not found | ${SITE_NAME}`,
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const topicSources = getDisplayTopicSources(sources, topic, curatedBundle?.documentLinks);
  const description = seoDescription(curatedBundle?.topic.seoDescription || curatedBundle?.topic.dek ||
    `${topicSources.length} primary ${topicSources.length === 1 ? "source" : "sources"} connected to ${topic} in The Psychedelic History Archive.`
  );

  return {
    title: curatedBundle?.topic.seoTitle || `${topic} | Topics | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: canonicalPath(topicHref(topic))
    },
    openGraph: {
      title: `${topic} | Topics`,
      description,
      url: canonicalPath(topicHref(topic)),
      siteName: SITE_NAME,
      type: "website"
    }
  };
}

export async function generateStaticParams() {
  const [sources, curatedTopics] = await Promise.all([
    listArchiveSourceSummariesFromSupabase(),
    listPublicTopics()
  ]);
  return Array.from(new Set([
    ...sources.flatMap((source) => source.tags).map((tag) => topicSlug(tag)),
    ...curatedTopics.map((topic) => topic.slug)
  ]))
    .sort()
    .map((slug) => ({ slug }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const [sources, curatedBundle] = await Promise.all([
    listArchiveSourceSummariesFromSupabase(),
    getPublicTopicBundle(slug)
  ]);
  const topic = curatedBundle?.topic.name ?? findTopicBySlug(sources, slug);

  if (!topic) notFound();

  const topicSources = getDisplayTopicSources(sources, topic, curatedBundle?.documentLinks);
  const featuredSources = getFeaturedSources(topicSources, curatedBundle?.documentLinks);
  const people = topValues(topicSources.flatMap((source) => source.people), biographySlug);
  const eras = topEras(topicSources);
  const relatedTopics = curatedBundle?.relatedTopics.length
    ? curatedBundle.relatedTopics.map((related) => ({ name: related.name, slug: related.slug, count: 0 }))
    : topValues(topicSources.flatMap((source) => source.tags).filter((tag) => topicSlug(tag) !== topicSlug(topic)));
  const structuredData = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Topics", path: "/topics" },
    { name: topic, path: topicHref(topic) }
  ]);

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader activeLabel="Topics" />
      <main className="container-page py-8">
        <Link className="focus-ring inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-archive-muted hover:text-archive-violet" href="/topics">
          <ArrowLeft className="h-4 w-4" />
          Back to topics
        </Link>

        <header className="mt-8 grid gap-6 border-b border-archive-line pb-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <p className="display-label text-[0.78rem] text-archive-muted">Topic</p>
            <h1 className="mt-2 font-display text-[2.5rem] font-normal uppercase leading-none tracking-normal text-archive-ink sm:text-[3.75rem]">
              {topic}
            </h1>
            <p className="mt-4 max-w-3xl text-[1rem] leading-7 text-archive-muted">
              {curatedBundle?.topic.dek ?? `Browse primary sources, people, eras, and related themes connected to ${topic.toLowerCase()}.`}
            </p>
          </div>
          <div className="grid grid-cols-3 rounded-md border border-archive-line bg-archive-surface text-center shadow-sm">
            <TopicStat label="Sources" value={topicSources.length} />
            <TopicStat label="People" value={people.length} />
            <TopicStat label="Eras" value={eras.length} />
          </div>
        </header>

        <div className="grid gap-8 py-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section>
            {curatedBundle?.topic.bodyMarkdown && (
              <div className="mb-7 rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
                <MarkdownContent className="source-markdown space-y-5 text-archive-ink" markdown={curatedBundle.topic.bodyMarkdown} />
              </div>
            )}
            {featuredSources.length > 0 && (
              <div className="mb-7 rounded-md border border-archive-line bg-archive-surface p-5 shadow-sm">
                <h2 className="source-serif-heading">Featured Sources</h2>
                <div className="mt-4 border-y border-archive-line">
                  {featuredSources.map((source) => (
                    <ArchiveResultRow key={source.id} source={source} />
                  ))}
                </div>
              </div>
            )}
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="source-serif-heading">Sources</h2>
              <Link className="focus-ring inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-archive-violet hover:text-archive-violetDark" href={`/archive?tag=${encodeURIComponent(topic)}`}>
                Open archive filter <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="border-y border-archive-line">
              {topicSources.map((source) => (
                <ArchiveResultRow key={source.id} source={source} />
              ))}
            </div>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <FacetCard title="Related Topics">
              {relatedTopics.slice(0, 12).map((tag) => (
                <Chip href={topicHref(tag.name)} key={tag.slug}>
                  {tag.name}
                </Chip>
              ))}
            </FacetCard>
            <FacetCard title="People">
              {people.slice(0, 10).map((person) => (
                <Link className="focus-ring rounded-sm text-sm font-semibold text-archive-ink hover:text-archive-violet" href={`/biographies/${person.slug}`} key={person.slug}>
                  {person.name}
                </Link>
              ))}
            </FacetCard>
            <FacetCard title="Eras">
              {eras.map((era) => (
                <Link className="focus-ring rounded-sm text-sm font-semibold text-archive-ink hover:text-archive-violet" href={eraHref(era)} key={era.slug}>
                  {era.name}
                </Link>
              ))}
            </FacetCard>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function TopicStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-archive-line px-4 py-3 last:border-r-0">
      <div className="font-display text-2xl font-semibold leading-none text-archive-ink">{value}</div>
      <div className="mt-1 text-[0.64rem] font-bold uppercase tracking-[0.09em] text-archive-muted">{label}</div>
    </div>
  );
}

function FacetCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm">
      <h2 className="text-[0.76rem] font-bold uppercase tracking-[0.09em] text-archive-muted">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {children}
      </div>
    </section>
  );
}

function topValues(values: string[], slugger = topicSlug) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    if (!value) return acc;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({
      name,
      slug: slugger(name),
      count
    }));
}

function biographySlug(name: string) {
  return slugifyPersonName(canonicalizePersonName(name));
}

function getDisplayTopicSources(
  sources: ArchiveSource[],
  topic: string,
  documentLinks: Array<{ documentId: string; position?: number | null }> = []
) {
  if (!documentLinks.length) return getTopicSources(sources, topic);

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const positionById = new Map(documentLinks.map((link, index) => [link.documentId, link.position ?? index + 1]));

  return documentLinks
    .map((link) => sourceById.get(link.documentId))
    .filter((source): source is ArchiveSource => Boolean(source))
    .sort((a, b) => (positionById.get(a.id) ?? 0) - (positionById.get(b.id) ?? 0) || a.year - b.year || a.title.localeCompare(b.title));
}

function getFeaturedSources(sources: ArchiveSource[], documentLinks: Array<{ documentId: string; featured: boolean }> = []) {
  const featuredIds = new Set(documentLinks.filter((link) => link.featured).map((link) => link.documentId));
  if (!featuredIds.size) return [];
  return sources.filter((source) => featuredIds.has(source.id)).slice(0, 4);
}

function topEras(sources: Array<{ year: number }>) {
  const counts = sources.reduce<Record<string, { count: number; name: string; slug: string }>>((acc, source) => {
    const era = getEraForYear(source.year);
    if (!era) return acc;
    acc[era.slug] = {
      count: (acc[era.slug]?.count ?? 0) + 1,
      name: era.label,
      slug: era.slug
    };
    return acc;
  }, {});

  return Object.values(counts).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
