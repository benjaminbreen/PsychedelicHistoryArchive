import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { BibliographyGroupedList } from "@/components/bibliography-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page/page-header";
import { PageShell } from "@/components/page/page-shell";
import { getBibliographyItems, itemTypeLabel, type BibliographyItem, type RecommendationStatus } from "@/lib/bibliography";

export const metadata: Metadata = {
  title: "Further Reading | The Psychedelic History Archive",
  description: "Vetted scholarly bibliography for psychedelic history."
};

type FurtherReadingPageProps = {
  searchParams: Promise<{
    q?: string;
    era?: string;
    tag?: string;
    type?: string;
    recommendation?: RecommendationStatus | "all";
    sort?: string;
  }>;
};

export default async function FurtherReadingPage({ searchParams }: FurtherReadingPageProps) {
  const params = await searchParams;
  const items = await getBibliographyItems(params);
  const allItems = await getBibliographyItems({ recommendation: "all" });
  const types = Array.from(new Set(allItems.map((item) => item.itemType))).sort();
  const eras = Array.from(new Set(allItems.flatMap((item) => item.eras))).sort();
  const tags = Array.from(new Map(allItems.flatMap((item) => item.tags).map((tag) => [tag.slug, tag])).values()).sort((a, b) => a.name.localeCompare(b.name));
  const groups = groupBibliography(items, params.tag);

  return (
    <>
      <SiteHeader activeLabel="About" />
      <PageShell className="py-8">
        <PageHeader
          title="Further Reading"
          description={
            <p>
              A compact bibliography of vetted scholarship. Speculative classics are not included as recommendations.
            </p>
          }
        />

        <form action="/further-reading" className="mt-7 border-y border-archive-line py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search bibliography</span>
              <input className="focus-ring h-11 w-full rounded-md border border-archive-line bg-archive-surface px-3 text-sm" defaultValue={params.q ?? ""} name="q" placeholder="Search author, title, topic..." />
            </label>
            <button className="focus-ring h-11 rounded-md bg-archive-violet px-4 text-sm font-semibold text-white" type="submit">
              Search
            </button>
            <details className="group relative">
              <summary className="focus-ring inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-archive-line px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-[min(34rem,calc(100vw-2rem))] rounded-md border border-archive-line bg-archive-surface p-4 shadow-xl">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectFilter label="Era" name="era" options={eras.map((era) => ({ label: era, value: era }))} value={params.era} />
                  <SelectFilter label="Type" name="type" options={types.map((type) => ({ label: itemTypeLabel(type), value: type }))} value={params.type} />
                  <SelectFilter label="Tag" name="tag" options={tags.map((tag) => ({ label: tag.name, value: tag.slug }))} value={params.tag} />
                  <SelectFilter
                    label="Sort"
                    name="sort"
                    options={[
                      { label: "Author", value: "author" },
                      { label: "Newest", value: "newest" },
                      { label: "Oldest", value: "oldest" },
                      { label: "Title", value: "title" }
                    ]}
                    value={params.sort}
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="focus-ring h-9 rounded-md bg-archive-violet px-3 text-xs font-semibold text-white" type="submit">
                    Apply
                  </button>
                  <Link className="focus-ring inline-flex h-9 items-center rounded-md border border-archive-line px-3 text-xs font-semibold" href="/further-reading">
                    Reset
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm text-archive-muted">
          <span>{items.length.toLocaleString()} {items.length === 1 ? "source" : "sources"}</span>
        </div>

        <section className="mt-3">
          {groups.length ? (
            <BibliographyGroupedList groups={groups} />
          ) : (
            <div className="border-y border-archive-line py-10 text-center text-sm text-archive-muted">
              No bibliography items match these filters.
            </div>
          )}
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}

function groupBibliography(items: BibliographyItem[], activeTag?: string) {
  const tagSlug = activeTag ? decodeURIComponent(activeTag) : "";
  const groups = new Map<string, BibliographyItem[]>();

  items.forEach((item) => {
    const matchingTag = tagSlug ? item.tags.find((tag) => tag.slug === tagSlug) : undefined;
    const label = matchingTag?.name || primarySubject(item);
    groups.set(label, [...(groups.get(label) ?? []), item]);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, groupItems]) => ({ label, items: groupItems }));
}

function primarySubject(item: BibliographyItem) {
  const preferred = item.tags.find((tag) => tag.tagType === "topic" || tag.tagType === "substance" || tag.tagType === "place");
  return preferred?.name || "General";
}

function SelectFilter({
  label,
  name,
  options,
  value
}: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  value?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">{label}</span>
      <select className="focus-ring mt-1 h-9 w-full rounded-md border border-archive-line bg-archive-paper px-3 text-sm" defaultValue={value ?? ""} name={name}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
