import Link from "next/link";
import { Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { ArchiveSearchParams } from "@/lib/archive-query";

type ArchiveToolbarProps = {
  count: number;
  currentView: string;
  params: ArchiveSearchParams;
  sort?: string;
  queryString: string;
};

export function ArchiveToolbar({ count, currentView, params, queryString, sort }: ArchiveToolbarProps) {
  const join = queryString ? `${queryString}&` : "";
  const hiddenSearchParams = getHiddenSearchParams(params, ["q", "page"]);

  return (
    <div className="border-b border-archive-line pb-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(18rem,1fr)_auto] xl:items-center">
        <form action="/archive" className="flex min-w-0 flex-col gap-3 sm:flex-row">
          {hiddenSearchParams.map(([key, value]) => (
            <input key={key} name={key} type="hidden" value={value} />
          ))}
          <label className="relative min-w-0 flex-1" htmlFor="archive-search">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-archive-muted"
            />
            <input
              className="focus-ring h-10 w-full rounded-md border border-archive-line bg-archive-surface pl-10 pr-3 text-sm text-archive-ink shadow-sm transition placeholder:text-archive-muted"
              defaultValue={params.q ?? ""}
              id="archive-search"
              name="q"
              placeholder="Search titles, people, topics, sources..."
              type="search"
            />
          </label>
          <button
            className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-archive-line bg-archive-lavender px-4 text-sm font-semibold text-archive-ink transition hover:bg-archive-violet hover:text-white"
            type="submit"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4">
          <div className="font-medium">{count.toLocaleString()} results</div>
          <span className="hidden h-8 w-px bg-archive-line md:block" />
          <ButtonLink className="lg:hidden" href="#filters" variant="subtle">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </ButtonLink>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="-mr-2 text-sm text-archive-muted" htmlFor="sort">
          Sort by
        </label>
        <select
          className="focus-ring h-9 min-w-[9.25rem] rounded border border-archive-line bg-archive-surface px-3 text-sm text-archive-ink"
          defaultValue={sort ?? "oldest"}
          id="sort"
          name="sort"
        >
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
          <option value="title">Title</option>
        </select>
        <div className="inline-flex overflow-hidden rounded border border-archive-line bg-archive-surface">
          <Link
            className={currentView === "grid" ? "inline-flex h-9 items-center gap-2 bg-archive-lavender px-4 text-sm font-semibold text-archive-ink" : "inline-flex h-9 items-center gap-2 px-4 text-sm font-semibold text-archive-muted hover:bg-archive-lavender2"}
            href={`/archive?${join}view=grid`}
          >
            <Grid2X2 className="h-4 w-4" />
            Grid
          </Link>
          <Link
            className="inline-flex h-9 items-center gap-2 border-l border-archive-line px-4 text-sm font-semibold text-archive-muted hover:bg-archive-lavender2"
            href={`/archive?${join}view=list`}
          >
            <Grid2X2 className="h-4 w-4" />
            Compact
          </Link>
          <Link
            className={currentView !== "grid" ? "inline-flex h-9 items-center gap-2 border-l border-archive-line bg-archive-lavender px-4 text-sm font-semibold text-archive-ink" : "inline-flex h-9 items-center gap-2 border-l border-archive-line px-4 text-sm font-semibold text-archive-muted hover:bg-archive-lavender2"}
            href={`/archive?${join}view=list`}
          >
            <List className="h-4 w-4" />
            List
          </Link>
        </div>
        <label className="-mr-2 text-sm text-archive-muted" htmlFor="density">
          Density
        </label>
        <select
          className="focus-ring h-9 min-w-[9rem] rounded border border-archive-line bg-archive-surface px-3 text-sm text-archive-ink"
          defaultValue="comfortable"
          id="density"
          name="density"
        >
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
          <option value="roomy">Roomy</option>
        </select>
        <span className="hidden h-8 w-px bg-archive-line xl:block" />
        <label className="inline-flex items-center gap-2 text-sm text-archive-ink">
          <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-archive-violet/70 p-0.5">
            <span className="h-4 w-4 rounded-full bg-archive-surface shadow-sm" />
          </span>
          With images only
        </label>
      </div>
    </div>
  );
}

function getHiddenSearchParams(params: ArchiveSearchParams, omit: string[] = []) {
  return Object.entries(params).filter((entry): entry is [string, string] => {
    const [key, value] = entry;
    return Boolean(value) && !omit.includes(key);
  });
}
