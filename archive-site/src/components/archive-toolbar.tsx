import Link from "next/link";
import { Grid2X2, List, SlidersHorizontal } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

type ArchiveToolbarProps = {
  count: number;
  currentView: string;
  sort?: string;
  queryString: string;
};

export function ArchiveToolbar({ count, currentView, queryString, sort }: ArchiveToolbarProps) {
  const join = queryString ? `${queryString}&` : "";

  return (
    <div className="flex flex-col gap-4 border-b border-archive-line pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="font-medium">{count.toLocaleString()} results</div>
        <span className="hidden h-8 w-px bg-archive-line md:block" />
        <ButtonLink className="lg:hidden" href="#filters" variant="subtle">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </ButtonLink>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="-mr-2 text-sm text-archive-muted" htmlFor="sort">
          Sort by
        </label>
        <select
          className="focus-ring h-9 min-w-[9.25rem] rounded border border-archive-line bg-white px-3 text-sm"
          defaultValue={sort ?? "oldest"}
          id="sort"
          name="sort"
        >
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
          <option value="title">Title</option>
        </select>
        <div className="inline-flex overflow-hidden rounded border border-archive-line bg-white">
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
          className="focus-ring h-9 min-w-[9rem] rounded border border-archive-line bg-white px-3 text-sm"
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
            <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
          </span>
          With images only
        </label>
      </div>
    </div>
  );
}
