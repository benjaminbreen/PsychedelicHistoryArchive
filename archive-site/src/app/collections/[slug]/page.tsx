import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SourceImage } from "@/components/source-image";
import { SourceReaderTabs } from "@/components/source-reader-tabs";
import { Chip } from "@/components/ui/chip";
import { JsonLd, SITE_NAME, buildBreadcrumbJsonLd, buildCollectionJsonLd, canonicalPath, seoDescription, sourceImageMetadata } from "@/lib/seo";
import { getCollectionSourceDetailFromSupabase } from "@/lib/supabase-archive";
import type { ArchiveSource } from "@/lib/types";

export const dynamic = "force-dynamic";

const legacyCollectionArchiveTargets: Record<string, string> = {
  "william-james-altered-states": "/archive?people=William%20James",
  "anaesthetic-revelation": "/archive?tag=Anesthesia",
  "clinical-reports": "/archive?tag=Clinical",
  "philosophy-after-intoxication": "/archive?tag=Philosophy"
};

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const source = await getCollectionSourceDetailFromSupabase(slug);

  if (!source) {
    return {
      title: `Collection not found | ${SITE_NAME}`,
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const title = source.subtitle ? `${source.title}: ${source.subtitle}` : source.title;
  const description = seoDescription(source.summary, "A curated collection in The Psychedelic History Archive.");
  const canonical = canonicalPath(`/collections/${source.slug}`);
  const images = sourceImageMetadata(source);

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images,
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images
    }
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const source = await getCollectionSourceDetailFromSupabase(slug);

  if (!source) {
    const legacyTarget = legacyCollectionArchiveTargets[slug];
    if (legacyTarget) redirect(legacyTarget);
    notFound();
  }

  return <CollectionSourcePage source={source} />;
}

function CollectionSourcePage({ source }: { source: ArchiveSource }) {
  const collectionNotes = parseCollectionNotes(source.excerpt, source.summary);
  const structuredData = [
    buildCollectionJsonLd(source),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Collections", path: "/collections" },
      { name: source.title, path: `/collections/${source.slug}` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader activeLabel="Collections" variant="source" />
      <main className="container-page py-6">
        <Link className="focus-ring mb-5 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-archive-muted hover:text-archive-violet" href="/collections">
          <ArrowLeft className="h-4 w-4" />
          Back to collections
        </Link>

        <div className="source-page-grid grid gap-7 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            <div className="mb-5 flex items-center gap-3 text-sm text-archive-muted">
              <Link className="font-semibold text-archive-violet" href="/collections">
                Collections
              </Link>
              <span>/</span>
              <span>{source.displayDate}</span>
            </div>

            <h1 className="text-archive-ink">
              <span className="source-display-title">{source.title}</span>
            </h1>
            {source.subtitle && (
              <p className="mt-2 max-w-3xl font-serif text-[1.28rem] italic leading-7 text-archive-ink/80">
                {source.subtitle}
              </p>
            )}
            <p className="mt-3 max-w-3xl text-[15px] leading-6 text-archive-muted">
              {source.summary || "A compound archival source organized into issue- or volume-level records."}
            </p>

            <div className="mt-5 flex flex-wrap items-start text-sm">
              <MetaCell label="Date range" value={source.displayDate} />
              <MetaCell label="Items" value={`${source.collectionItemCount ?? 0}`} />
              <MetaCell label="Type" value="Collection" />
              <MetaCell label="Access" value="Issue-level records" />
            </div>

            <SourceReaderTabs source={source} transcript={[]} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-[rgb(var(--archive-warm-line))] bg-[rgb(var(--archive-warm-surface))] p-4 shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.05)]">
              <div className="grid grid-cols-[7rem_1fr] gap-4">
                <SourceImage className="aspect-[4/5] w-full shadow-[0_8px_18px_rgb(var(--archive-shadow)/0.08)]" source={source} />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-archive-olive">
                    Collection
                  </div>
                  <p className="mt-2 font-semibold">Compound source</p>
                  <p className="mt-2 text-sm text-archive-muted">{source.displayDate}</p>
                  <p className="mt-3 text-sm font-semibold text-archive-ink">{source.collectionItemCount ?? 0} item-level records</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-archive-line bg-archive-surface p-4 shadow-[0_10px_28px_rgb(var(--archive-shadow)/0.04)]">
              <h2 className="source-serif-heading">Collection details</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <Detail label="Archive ID" value={source.id} />
                <Detail label="Items" value={`${source.collectionItemCount ?? 0}`} />
                {collectionNotes.provenance && <Detail label="Provenance" value={collectionNotes.provenance} />}
                {collectionNotes.digitization && <Detail label="Digitization" value={<CollectionNoteValue value={collectionNotes.digitization} />} />}
                <Detail label="Rights" value={source.rights} />
                <Detail label="Citation" value={source.citation} />
              </dl>
              {source.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {source.tags.map((tag) => (
                    <Chip href={`/archive?tag=${encodeURIComponent(tag)}`} key={tag}>
                      {tag}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-archive-line pr-5 pl-5 first:border-l-0 first:pl-0">
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.09em] text-archive-muted">{label}</div>
      <div className="mt-1 text-[13px] font-medium">{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.4rem_1fr] gap-3 border-b border-archive-line/80 pb-3 last:border-b-0">
      <dt className="text-[13px] font-semibold text-archive-ink">{label}</dt>
      <dd className="text-[13px] leading-5 text-archive-muted">{value || "Not recorded"}</dd>
    </div>
  );
}

function CollectionNoteValue({ value }: { value: string }) {
  if (!value.includes("Paul Gillis-Smith")) return value;
  const [before, after] = value.split("Paul Gillis-Smith");

  return (
    <>
      {before}
      <Link className="font-semibold text-archive-violet hover:text-archive-violetDark" href="/project-team#paul-gillis-smith">
        Paul Gillis-Smith
      </Link>
      {after}
    </>
  );
}

function parseCollectionNotes(notes: string, summary: string) {
  if (!notes || notes === summary) return {};

  return notes.split(/\n+/).reduce<{ provenance?: string; digitization?: string }>((accumulator, line) => {
    const [rawLabel, ...rest] = line.split(":");
    const label = rawLabel.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!value) return accumulator;
    if (label === "provenance") accumulator.provenance = value;
    if (label === "digitization") accumulator.digitization = value;
    return accumulator;
  }, {});
}
