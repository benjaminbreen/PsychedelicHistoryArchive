import Link from "next/link";
import { BookOpen, ChevronDown, Clock3, Globe2, Search, Tag, UserRound, X } from "lucide-react";
import { clsx } from "clsx";
import { archiveClearFiltersHref, archiveHref } from "@/lib/archive-url";
import type { ArchiveSearchParams } from "@/lib/archive-query";
import type { ArchiveSource } from "@/lib/types";

type ArchiveFilterSidebarProps = {
  active?: {
    era?: string;
    medium?: string;
    tag?: string;
    access?: string;
    region?: string;
    people?: string;
    type?: string;
  };
  baseParams?: ArchiveSearchParams;
  sources: ArchiveSource[];
  variant?: "desktop" | "mobile";
};

type ArchiveFilterKey = keyof NonNullable<ArchiveFilterSidebarProps["active"]>;

export function ArchiveFilterSidebar({ active = {}, baseParams = {}, sources, variant = "desktop" }: ArchiveFilterSidebarProps) {
  const activeEra = active.era ?? "";
  const activeMedium = active.medium ?? "";
  const facetCounts = getFacetCounts(sources);
  const topTags = Object.entries(facetCounts.tags).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const regions = Object.entries(facetCounts.regions).sort((a, b) => a[0].localeCompare(b[0]));
  const types = Object.entries(facetCounts.types).sort((a, b) => a[0].localeCompare(b[0]));
  const activeFilters = activeFilterEntries(active);
  const asideClassName = variant === "desktop"
    ? "hidden w-[17.5rem] shrink-0 pr-6 lg:block"
    : "block w-full";

  return (
    <aside className={asideClassName} id={variant === "desktop" ? "filters" : undefined}>
      <div className={clsx("text-[0.82rem]", variant === "desktop" && "sticky top-24")}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-normal text-archive-ink">Filters</h2>
          <Link href={archiveClearFiltersHref(baseParams)} className="text-sm font-medium text-archive-violet transition hover:text-archive-violetDark">
            Clear all
          </Link>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 border-b border-archive-line pb-3">
            {activeFilters.map(([key, value]) => (
              <ActivePill href={archiveHref(baseParams, { [key]: undefined })} key={key} label={activeFilterLabel(key, value)} />
            ))}
          </div>
        )}

        <FacetGroup active={Boolean(activeEra)} icon={<Clock3 className="h-4 w-4" />} title="Era">
          {Object.entries(facetCounts.eras).map(([label, count]) => (
            <FacetCheckbox active={activeEra === label} count={count} href={facetHref(baseParams, "era", label, activeEra)} key={label} label={label} />
          ))}
        </FacetGroup>
        <FacetGroup active={Boolean(activeMedium)} icon={<BookOpen className="h-4 w-4" />} title="Medium">
          {Object.entries(facetCounts.mediums).map(([label, count]) => (
            <FacetCheckbox active={activeMedium === label} count={count} href={facetHref(baseParams, "medium", label, activeMedium)} key={label} label={formatMedium(label)} />
          ))}
        </FacetGroup>
        <FacetGroup active={Boolean(active.type)} icon={<Tag className="h-4 w-4" />} title="Category">
          <form action="/archive" className="grid gap-2">
            <HiddenArchiveInputs omit={["page", "type"]} params={baseParams} />
            <select
              className="focus-ring h-8 w-full rounded border border-archive-line bg-archive-surface px-3 text-sm text-archive-muted"
              defaultValue={active.type ?? ""}
              name="type"
            >
              <option value="">All Categories</option>
              {types.map(([label, count]) => (
                <option key={label} value={label}>{label} ({count.toLocaleString()})</option>
              ))}
            </select>
            <button className="focus-ring h-8 rounded border border-archive-line bg-archive-surface px-3 text-xs font-semibold text-archive-ink hover:bg-archive-lavender2" type="submit">
              Apply category
            </button>
          </form>
        </FacetGroup>
        <FacetGroup active={Boolean(active.tag)} icon={<Tag className="h-4 w-4" />} title="Tags">
          <form action="/archive" className="grid gap-2">
            <HiddenArchiveInputs omit={["page", "tag"]} params={baseParams} />
            <input
              className="focus-ring h-8 w-full rounded border border-archive-line bg-archive-surface px-3 text-sm text-archive-ink placeholder:text-archive-muted/75"
              defaultValue={active.tag}
              name="tag"
              placeholder="Search tags..."
              type="search"
            />
            <button className="focus-ring h-8 rounded border border-archive-line bg-archive-surface px-3 text-xs font-semibold text-archive-ink hover:bg-archive-lavender2" type="submit">
              Search tags
            </button>
          </form>
          <div className="mt-2 space-y-1">
            {topTags.map(([label, count]) => (
              <FacetCheckbox active={active.tag === label} count={count} href={facetHref(baseParams, "tag", label, active.tag)} key={label} label={label} />
            ))}
          </div>
        </FacetGroup>
        <FacetGroup active={Boolean(active.people)} icon={<UserRound className="h-4 w-4" />} title="People">
          <form action="/archive" className="grid gap-2">
            <HiddenArchiveInputs omit={["page", "people"]} params={baseParams} />
            <input
              className="focus-ring h-8 w-full rounded border border-archive-line bg-archive-surface px-3 text-sm text-archive-ink placeholder:text-archive-muted/75"
              defaultValue={active.people}
              name="people"
              placeholder="Search people..."
              type="search"
            />
            <button className="focus-ring h-8 rounded border border-archive-line bg-archive-surface px-3 text-xs font-semibold text-archive-ink hover:bg-archive-lavender2" type="submit">
              Search people
            </button>
          </form>
        </FacetGroup>
        <FacetGroup active={Boolean(active.region)} icon={<Globe2 className="h-4 w-4" />} title="Region">
          <form action="/archive" className="grid gap-2">
            <HiddenArchiveInputs omit={["page", "region"]} params={baseParams} />
            <select
              className="focus-ring h-8 w-full rounded border border-archive-line bg-archive-surface px-3 text-sm text-archive-muted"
              defaultValue={active.region ?? ""}
              name="region"
            >
              <option value="">All Regions</option>
              {regions.map(([label]) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            <button className="focus-ring h-8 rounded border border-archive-line bg-archive-surface px-3 text-xs font-semibold text-archive-ink hover:bg-archive-lavender2" type="submit">
              Apply region
            </button>
          </form>
        </FacetGroup>
      </div>
    </aside>
  );
}

function FacetGroup({
  active,
  children,
  icon,
  title
}: {
  active?: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <details className="group border-b border-archive-line py-3.5" open={active ? true : undefined}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[0.7rem] font-normal uppercase tracking-[0.1em] text-archive-ink [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
      </summary>
      <div className="pt-2.5">{children}</div>
    </details>
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
      <span className={clsx("h-3 w-3 rounded-[3px] border border-archive-line bg-archive-surface", active && "border-archive-violet bg-archive-lavender shadow-[inset_0_0_0_2px_rgb(var(--archive-surface))]")} />
      <span>{label}</span>
      <span className="ml-auto text-archive-muted">({count.toLocaleString()})</span>
    </Link>
  );
}

function ActivePill({ href, label }: { href: string; label: React.ReactNode }) {
  return (
    <Link className="mb-2 inline-flex h-7 items-center gap-2 rounded-full bg-archive-lavender px-3 text-[0.8rem] text-archive-ink" href={href}>
      {label}
      <X className="h-3.5 w-3.5 text-archive-violet" />
    </Link>
  );
}

function HiddenArchiveInputs({ omit, params }: { omit: (keyof ArchiveSearchParams)[]; params: ArchiveSearchParams }) {
  const omitted = new Set(omit);
  return (
    <>
      {Object.entries(params).map(([key, value]) => {
        const paramKey = key as keyof ArchiveSearchParams;
        if (!value || omitted.has(paramKey)) return null;
        return <input key={key} name={key} type="hidden" value={value} />;
      })}
    </>
  );
}

function facetHref(params: ArchiveSearchParams, key: ArchiveFilterKey, value: string, activeValue?: string) {
  return archiveHref(params, { [key]: activeValue === value ? undefined : value });
}

function activeFilterEntries(active: NonNullable<ArchiveFilterSidebarProps["active"]>) {
  return (Object.entries(active) as [ArchiveFilterKey, string | undefined][])
    .filter((entry): entry is [ArchiveFilterKey, string] => Boolean(entry[1]));
}

function activeFilterLabel(key: ArchiveFilterKey, value: string) {
  if (key === "people") return `Person: ${value}`;
  if (key === "type") return `Category: ${value}`;
  if (key === "tag") return (
    <span className="inline-flex items-center gap-1">
      <Search className="h-3 w-3" />
      {value}
    </span>
  );
  return value;
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
    types: countBy(items, (item) => item.type),
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
