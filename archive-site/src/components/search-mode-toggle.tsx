import Link from "next/link";
import { clsx } from "clsx";
import type { SearchMode } from "@/lib/search-types";

type SearchModeToggleProps = {
  currentMode: SearchMode;
  hrefForMode: (mode: SearchMode) => string;
};

const searchModes: Array<{ id: SearchMode; label: string; title: string }> = [
  { id: "best", label: "Hybrid", title: "Blend word and semantic matches" },
  { id: "keyword", label: "Word", title: "Prioritize exact words, names, titles, and citations" },
  { id: "semantic", label: "Semantic", title: "Find conceptually related sources" },
];

export function SearchModeToggle({ currentMode, hrefForMode }: SearchModeToggleProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-archive-line bg-archive-surface text-sm" aria-label="Search mode">
      {searchModes.map((mode) => (
        <Link
          aria-current={currentMode === mode.id ? "page" : undefined}
          className={clsx(
            "focus-ring inline-flex h-9 items-center border-l border-archive-line px-3 font-semibold first:border-l-0",
            currentMode === mode.id
              ? "bg-archive-lavender text-archive-ink"
              : "text-archive-muted hover:bg-archive-lavender2 hover:text-archive-ink"
          )}
          href={hrefForMode(mode.id)}
          key={mode.id}
          title={mode.title}
        >
          {mode.label}
        </Link>
      ))}
    </div>
  );
}
