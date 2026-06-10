import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CitationCopyButton } from "@/components/citation-copy-button";
import { formatCitation, itemTypeLabel, primaryUrl, type BibliographyItem } from "@/lib/bibliography";

export function BibliographyGroupedList({ groups }: { groups: Array<{ label: string; items: BibliographyItem[] }> }) {
  return (
    <div className="divide-y divide-archive-line border-y border-archive-line">
      {groups.map((group) => (
        <section className="py-5" key={group.label}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[0.9rem] font-normal uppercase tracking-[0.08em] text-archive-ink">{group.label}</h2>
            <span className="text-xs text-archive-muted">{group.items.length}</span>
          </div>
          <div className="divide-y divide-archive-line/80">
            {group.items.map((item) => (
              <BibliographyRow item={item} key={item.id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function BibliographyRow({ item }: { item: BibliographyItem }) {
  const url = primaryUrl(item);

  return (
    <details className="group py-3">
      <summary className="flex cursor-pointer list-none items-start gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-archive-muted">
            <span>{itemTypeLabel(item.itemType)}</span>
            {item.year && <span>{item.year}</span>}
            {item.publicationTitle && <span className="normal-case tracking-normal">{item.publicationTitle}</span>}
          </div>
          <h3 className="mt-1 font-serif text-[1.08rem] font-semibold leading-snug text-archive-ink">
            <Link className="hover:text-archive-violet" href={`/further-reading/${item.slug}`}>{item.title}</Link>
          </h3>
          <p className="mt-0.5 text-sm text-archive-muted">
            {item.contributors.map((contributor) => contributor.displayName).join(", ")}
          </p>
        </div>
        <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-archive-muted transition group-open:rotate-180" />
      </summary>

      <div className="mt-3 grid gap-3 pl-0 text-sm leading-6 text-archive-ink/85 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          {item.editorialNote && <p>{item.editorialNote}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 5).map((tag) => (
              <Link className="text-xs font-semibold text-archive-violet hover:text-archive-violetDark" href={`/further-reading?tag=${encodeURIComponent(tag.slug)}`} key={`${item.id}-${tag.slug}`}>
                {tag.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2 md:justify-end">
          {url && (
            <Link className="focus-ring inline-flex h-8 items-center gap-1.5 rounded border border-archive-line px-2.5 text-xs font-semibold hover:bg-archive-lavender2" href={url}>
              Open <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          <CitationCopyButton citation={formatCitation(item, "chicago")} label="Chicago" />
          <CitationCopyButton citation={formatCitation(item, "mla")} label="MLA" />
          <CitationCopyButton citation={formatCitation(item, "apa")} label="APA" />
          <CitationCopyButton citation={formatCitation(item, "bibtex")} label="BibTeX" />
          <CitationCopyButton citation={formatCitation(item, "ris")} label="RIS" />
        </div>
      </div>
    </details>
  );
}
