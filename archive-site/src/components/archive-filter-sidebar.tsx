import Link from "next/link";
import { BookOpen, ChevronDown, Clock3, ExternalLink, Tag, UserRound, Globe2, X } from "lucide-react";
import { clsx } from "clsx";
import type { ArchiveSource } from "@/lib/types";

type ArchiveFilterSidebarProps = {
  active?: {
    era?: string;
    medium?: string;
    tag?: string;
    access?: string;
    region?: string;
    people?: string;
  };
  sources: ArchiveSource[];
};

export function ArchiveFilterSidebar({ active = {}, sources }: ArchiveFilterSidebarProps) {
  const activeEra = active.era ?? "";
  const activeMedium = active.medium ?? "";
  const facetCounts = getFacetCounts(sources);
  const topTags = Object.entries(facetCounts.tags).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const regions = Object.entries(facetCounts.regions).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <aside className="hidden w-[17.5rem] shrink-0 border-r border-archive-line pr-6 lg:block">
      <div className="sticky top-24 text-[0.82rem]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-archive-ink">Filters</h2>
          <Link href="/archive" className="text-sm font-medium text-archive-violet transition hover:text-archive-violetDark">
            Clear all
          </Link>
        </div>
        <FacetGroup icon={<Clock3 className="h-4 w-4" />} title="Era">
          {activeEra && <ActivePill href="/archive" label={activeEra} />}
          {Object.entries(facetCounts.eras).map(([label, count]) => (
            <FacetCheckbox active={activeEra === label} count={count} href={`/archive?era=${encodeURIComponent(label)}`} key={label} label={label} />
          ))}
        </FacetGroup>
        <FacetGroup icon={<BookOpen className="h-4 w-4" />} title="Medium">
          {Object.entries(facetCounts.mediums).map(([label, count]) => (
            <FacetCheckbox active={activeMedium === label} count={count} href={`/archive?medium=${encodeURIComponent(label)}`} key={label} label={formatMedium(label)} />
          ))}
        </FacetGroup>
        <FacetGroup icon={<Tag className="h-4 w-4" />} title="Category">
          <SelectLike label="All Categories" />
        </FacetGroup>
        <FacetGroup icon={<Tag className="h-4 w-4" />} title="Tags">
          <SearchLike placeholder="Search tags..." />
          <div className="mt-2 space-y-1">
            {topTags.map(([label, count]) => (
              <FacetCheckbox active={active.tag === label} count={count} href={`/archive?tag=${encodeURIComponent(label)}`} key={label} label={label} />
            ))}
          </div>
        </FacetGroup>
        <FacetGroup icon={<UserRound className="h-4 w-4" />} title="People">
          <form action="/archive">
            <input
              className="focus-ring h-8 w-full rounded border border-archive-line bg-white px-3 text-sm text-archive-ink placeholder:text-archive-muted/75"
              defaultValue={active.people}
              name="people"
              placeholder="Search people..."
              type="search"
            />
          </form>
        </FacetGroup>
        <FacetGroup icon={<Globe2 className="h-4 w-4" />} title="Region">
          <form action="/archive">
            <select
              className="focus-ring h-8 w-full rounded border border-archive-line bg-white px-3 text-sm text-archive-muted"
              defaultValue={active.region ?? ""}
              name="region"
            >
              <option value="">All Regions</option>
              {regions.map(([label]) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </form>
        </FacetGroup>
        <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-archive-violet transition hover:text-archive-violetDark" href="/archive?access=external">
          Browse non-hosted sources <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}

function FacetGroup({
  children,
  icon,
  title
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="border-b border-archive-line py-3.5">
      <h3 className="mb-2.5 flex items-center justify-between gap-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-archive-ink">
        <span className="flex items-center gap-2">
        {icon}
        {title}
        </span>
        <ChevronDown className="h-3.5 w-3.5" />
      </h3>
      <div>{children}</div>
    </section>
  );
}

function FacetCheckbox({
  active,
  count,
  href,
  label
}: {
  active?: boolean;
  count: number;
  href: string;
  label: string;
}) {
  return (
    <Link
      className="flex min-h-6 items-center gap-2 rounded px-2 py-1 text-[0.78rem] text-archive-ink transition hover:bg-archive-lavender2"
      href={href}
    >
      <span className={clsx("h-3 w-3 rounded-[3px] border border-archive-line bg-white", active && "border-archive-violet bg-archive-lavender shadow-[inset_0_0_0_2px_white]")} />
      <span>{label}</span>
      <span className="ml-auto text-archive-muted">({count.toLocaleString()})</span>
    </Link>
  );
}

function ActivePill({ href, label }: { href: string; label: string }) {
  return (
    <Link className="mb-2 inline-flex h-7 items-center gap-2 rounded-full bg-archive-lavender px-3 text-[0.8rem] text-archive-ink" href={href}>
      {label}
      <X className="h-3.5 w-3.5 text-archive-violet" />
    </Link>
  );
}

function SelectLike({ label }: { label: string }) {
  return (
    <button className="focus-ring flex h-8 w-full items-center justify-between rounded border border-archive-line bg-white px-3 text-left text-sm text-archive-muted" type="button">
      {label}
      <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}

function SearchLike({ placeholder }: { placeholder: string }) {
  return (
    <input
      className="focus-ring h-8 w-full rounded border border-archive-line bg-white px-3 text-sm text-archive-ink placeholder:text-archive-muted/75"
      placeholder={placeholder}
      type="search"
    />
  );
}

function formatMedium(label: string) {
  const plural: Record<string, string> = {
    Text: "Text",
    Image: "Photos & Images"
  };
  return plural[label] ?? label;
}

function getFacetCounts(items: ArchiveSource[]) {
  return {
    eras: countBy(items, (item) => item.era),
    mediums: countBy(items, (item) => item.medium),
    regions: countBy(items, (item) => item.region),
    tags: countByMany(items, (item) => item.tags)
  };
}

function countBy<T extends string>(items: ArchiveSource[], fn: (item: ArchiveSource) => T) {
  return items.reduce<Record<T, number>>((acc, item) => {
    const key = fn(item);
    if (!key) return acc;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function countByMany<T extends string>(items: ArchiveSource[], fn: (item: ArchiveSource) => T[]) {
  return items.reduce<Record<T, number>>((acc, item) => {
    fn(item).forEach((key) => {
      if (!key) return;
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {} as Record<T, number>);
}
