import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CitationCopyButton } from "@/components/citation-copy-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatCitation, getBibliographyItemBySlug, itemTypeLabel, primaryUrl } from "@/lib/bibliography";

type BibliographyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BibliographyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getBibliographyItemBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.title} | Further Reading | The Psychedelic History Archive`,
    description: item.abstract || item.editorialNote || `Bibliography record for ${item.title}.`
  };
}

export default async function BibliographyDetailPage({ params }: BibliographyDetailPageProps) {
  const { slug } = await params;
  const item = await getBibliographyItemBySlug(slug);
  if (!item) notFound();

  const url = primaryUrl(item);

  return (
    <>
      <SiteHeader activeLabel="About" />
      <main className="container-page py-8">
        <Link className="focus-ring inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-archive-violet hover:text-archive-violetDark" href="/further-reading">
          <ArrowLeft className="h-4 w-4" />
          Further reading
        </Link>

        <article className="mt-7 max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-[0.1em] text-archive-muted">
            {itemTypeLabel(item.itemType)}{item.year ? ` · ${item.year}` : ""}
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-archive-ink md:text-5xl">
            {item.title}
          </h1>
          {item.subtitle && <p className="mt-3 text-xl leading-8 text-archive-muted">{item.subtitle}</p>}
          <p className="mt-4 text-base text-archive-muted">
            {item.contributors.map((contributor) => contributor.displayName).join(", ") || "Unknown author"}
          </p>

          <dl className="mt-8 grid gap-4 border-y border-archive-line py-5 text-sm md:grid-cols-2">
            {item.publicationTitle && <Detail label="Publication" value={item.publicationTitle} />}
            {item.publisher && <Detail label="Publisher" value={[item.publicationPlace, item.publisher].filter(Boolean).join(": ")} />}
            {item.volume && <Detail label="Volume" value={item.issue ? `${item.volume}, no. ${item.issue}` : item.volume} />}
            {item.pages && <Detail label="Pages" value={item.pages} />}
            {item.doi && <Detail label="DOI" value={item.doi} />}
            {item.isbn && <Detail label="ISBN" value={item.isbn} />}
          </dl>

          {item.abstract && <p className="mt-6 max-w-3xl text-base leading-7 text-archive-ink">{item.abstract}</p>}
          {item.editorialNote && <p className="mt-5 max-w-3xl text-base leading-7 text-archive-ink">{item.editorialNote}</p>}
          {item.reliabilityNote && <p className="mt-5 max-w-3xl text-sm leading-6 text-archive-muted">{item.reliabilityNote}</p>}

          <section className="mt-8 rounded-md border border-archive-line bg-archive-surface p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-archive-muted">Citation</h2>
            <p className="mt-3 text-sm leading-6 text-archive-ink">{formatCitation(item, "chicago")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {url && (
                <Link className="focus-ring inline-flex h-9 items-center gap-1.5 rounded border border-archive-line px-3 text-xs font-semibold hover:bg-archive-lavender2" href={url}>
                  Open source <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
              <CitationCopyButton citation={formatCitation(item, "chicago")} label="Chicago" />
              <CitationCopyButton citation={formatCitation(item, "mla")} label="MLA" />
              <CitationCopyButton citation={formatCitation(item, "apa")} label="APA" />
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-archive-ink">{label}</dt>
      <dd className="mt-1 text-archive-muted">{value}</dd>
    </div>
  );
}
