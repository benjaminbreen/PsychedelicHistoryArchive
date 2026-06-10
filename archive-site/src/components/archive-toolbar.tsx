import Link from "next/link";
import { ChevronDown, Grid2X2, List, Rows4, SlidersHorizontal } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { archiveHref } from "@/lib/archive-url";
import type { ArchiveSearchParams } from "@/lib/archive-query";

type ArchiveToolbarProps = {
  count: number;
  currentView: string;
  filterHref?: string;
  params: ArchiveSearchParams;
  sort?: string;
};

export function ArchiveToolbar({ count, currentView, filterHref = "#filters", params, sort }: ArchiveToolbarProps) {
  const currentSort = sort ?? "oldest";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <details className="group relative">
          <summary className="focus-ring inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded border border-archive-line bg-archive-surface px-3 text-sm text-archive-ink [&::-webkit-details-marker]:hidden">
            <span className="text-archive-muted">Sort by</span>
            <span>{sortLabel(currentSort)}</span>
            <ChevronDown className="h-3.5 w-3.5 text-archive-muted transition group-open:rotate-180" />
          </summary>
          <div className="absolute left-0 z-20 mt-2 min-w-40 rounded-md border border-archive-line bg-archive-surface p-1 shadow-[0_10px_24px_rgb(var(--archive-shadow)/0.12)] sm:left-auto sm:right-0">
            {(["oldest", "newest", "title"] as const).map((option) => (
              <Link
                className={option === currentSort ? "block rounded px-3 py-2 text-sm font-semibold text-archive-violet" : "block rounded px-3 py-2 text-sm text-archive-ink hover:bg-archive-lavender2"}
                href={archiveHref(params, { sort: option })}
                key={option}
              >
                {sortLabel(option)}
              </Link>
            ))}
          </div>
        </details>
        <div className="inline-flex overflow-hidden rounded border border-archive-line bg-archive-surface">
          <Link
            className={currentView === "grid" ? "inline-flex h-9 items-center gap-2 bg-archive-lavender px-4 text-sm font-semibold text-archive-ink" : "inline-flex h-9 items-center gap-2 px-4 text-sm font-semibold text-archive-muted hover:bg-archive-lavender2"}
            href={archiveHref(params, { view: "grid" })}
            aria-label="Grid view"
            title="Grid view"
          >
            <Grid2X2 className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Link>
          <Link
            className={currentView === "list" ? "inline-flex h-9 items-center gap-2 border-l border-archive-line bg-archive-lavender px-4 text-sm font-semibold text-archive-ink" : "inline-flex h-9 items-center gap-2 border-l border-archive-line px-4 text-sm font-semibold text-archive-muted hover:bg-archive-lavender2"}
            href={archiveHref(params, { view: "list" })}
            aria-label="List view"
            title="List view"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </Link>
          <Link
            className={currentView === "compact" ? "inline-flex h-9 items-center gap-2 border-l border-archive-line bg-archive-lavender px-4 text-sm font-semibold text-archive-ink" : "inline-flex h-9 items-center gap-2 border-l border-archive-line px-4 text-sm font-semibold text-archive-muted hover:bg-archive-lavender2"}
            href={archiveHref(params, { view: "compact" })}
            aria-label="Compact view"
            title="Compact view"
          >
            <Rows4 className="h-4 w-4" />
            <span className="hidden sm:inline">Compact</span>
          </Link>
        </div>
        <span className="hidden h-8 w-px bg-archive-line md:block" />
        <div className="font-medium">{count.toLocaleString()} results</div>
        <ButtonLink className="lg:hidden" href={filterHref} variant="subtle">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </ButtonLink>
      </div>
    </div>
  );
}

function sortLabel(sort: string) {
  if (sort === "newest") return "Newest first";
  if (sort === "title") return "Title";
  return "Oldest first";
}
