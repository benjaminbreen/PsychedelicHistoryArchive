import Link from "next/link";
import { ChevronDown, Grid2X2, List, Rows4, SlidersHorizontal } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

type ArchiveToolbarProps = {
  count: number;
  currentView: string;
  sort?: string;
  queryString: string;
};

export function ArchiveToolbar({ count, currentView, queryString, sort }: ArchiveToolbarProps) {
  const join = queryString ? `${queryString}&` : "";
  const currentSort = sort ?? "oldest";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <details className="group relative">
          <summary className="focus-ring inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded border border-archive-line bg-archive-surface px-3 text-sm text-archive-ink [&::-webkit-details-marker]:hidden">
            <span className="text-archive-muted">Sort by</span>
            <span>{sortLabel(currentSort)}</span>
            <ChevronDown className="h-3.5 w-3.5 text-archive-muted transition group-open:rotate-180" />
          </summary>
          <div className="absolute right-0 z-20 mt-2 min-w-40 rounded-md border border-archive-line bg-archive-surface p-1 shadow-[0_10px_24px_rgb(var(--archive-shadow)/0.12)]">
            {(["oldest", "newest", "title"] as const).map((option) => (
              <Link
                className={option === currentSort ? "block rounded px-3 py-2 text-sm font-semibold text-archive-violet" : "block rounded px-3 py-2 text-sm text-archive-ink hover:bg-archive-lavender2"}
                href={archiveToolbarHref(queryString, { sort: option })}
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
            href={`/archive?${join}view=grid`}
          >
            <Grid2X2 className="h-4 w-4" />
            Grid
          </Link>
          <Link
            className={currentView === "list" ? "inline-flex h-9 items-center gap-2 border-l border-archive-line bg-archive-lavender px-4 text-sm font-semibold text-archive-ink" : "inline-flex h-9 items-center gap-2 border-l border-archive-line px-4 text-sm font-semibold text-archive-muted hover:bg-archive-lavender2"}
            href={`/archive?${join}view=list`}
          >
            <List className="h-4 w-4" />
            List
          </Link>
          <Link
            className={currentView === "compact" ? "inline-flex h-9 items-center gap-2 border-l border-archive-line bg-archive-lavender px-4 text-sm font-semibold text-archive-ink" : "inline-flex h-9 items-center gap-2 border-l border-archive-line px-4 text-sm font-semibold text-archive-muted hover:bg-archive-lavender2"}
            href={`/archive?${join}view=compact`}
          >
            <Rows4 className="h-4 w-4" />
            Compact
          </Link>
        </div>
        <span className="hidden h-8 w-px bg-archive-line md:block" />
        <div className="font-medium">{count.toLocaleString()} results</div>
        <ButtonLink className="lg:hidden" href="#filters" variant="subtle">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </ButtonLink>
      </div>
    </div>
  );
}

function archiveToolbarHref(queryString: string, updates: Record<string, string>) {
  const params = new URLSearchParams(queryString);
  Object.entries(updates).forEach(([key, value]) => {
    params.set(key, value);
  });
  const nextQuery = params.toString();
  return nextQuery ? `/archive?${nextQuery}` : "/archive";
}

function sortLabel(sort: string) {
  if (sort === "newest") return "Newest first";
  if (sort === "title") return "Title";
  return "Oldest first";
}
