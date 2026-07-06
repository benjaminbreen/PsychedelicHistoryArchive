import { Search } from "lucide-react";
import { clsx } from "clsx";
import type { SearchMode } from "@/lib/search-types";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  action?: string;
  hiddenFields?: Record<string, string | undefined>;
  mode?: SearchMode;
  size?: "sm" | "lg";
  showModeOptions?: boolean;
  submitLabel?: string;
};

const searchModeOptions: Array<{ id: SearchMode; label: string; value: string }> = [
  { id: "best", label: "Hybrid", value: "best" },
  { id: "keyword", label: "Word", value: "keyword" },
  { id: "semantic", label: "Semantic", value: "semantic" },
];

export function SearchBar({
  placeholder = "Search the archive...",
  className,
  defaultValue,
  action = "/search",
  hiddenFields,
  mode = "best",
  size = "sm",
  showModeOptions = false,
  submitLabel
}: SearchBarProps) {
  const hasSubmit = Boolean(submitLabel);

  return (
    <form action={action} className={clsx("group/search relative min-w-0", className)}>
      <Search
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-archive-muted",
          size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )}
      />
      <input
        autoComplete="off"
        className={clsx(
          "focus-ring w-full rounded-md border border-archive-line bg-archive-surface text-archive-ink shadow-sm transition placeholder:text-archive-muted",
          hasSubmit && "sm:rounded-r-none",
          size === "lg"
            ? hasSubmit
              ? "h-12 pl-11 pr-4 text-[0.98rem] sm:h-[3.35rem] sm:pr-24"
              : "h-16 pl-12 pr-5 text-base"
            : hasSubmit
              ? "h-11 pl-11 pr-4 text-sm sm:pr-24"
              : "h-11 pl-11 pr-4 text-sm"
        )}
        defaultValue={defaultValue}
        name="q"
        placeholder={placeholder}
        type="search"
      />
      {Object.entries(hiddenFields ?? {}).filter(([name]) => !(showModeOptions && name === "mode")).map(([name, value]) => (
        value ? <input key={name} name={name} type="hidden" value={value} /> : null
      ))}
      {showModeOptions && (
        <fieldset className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-full translate-y-1 rounded-md border border-archive-line bg-archive-surface p-2 text-xs opacity-0 shadow-[0_12px_30px_rgb(var(--archive-shadow)/0.14)] transition duration-150 group-focus-within/search:pointer-events-auto group-focus-within/search:translate-y-0 group-focus-within/search:opacity-100">
          <legend className="sr-only">Search mode</legend>
          <div className="grid grid-cols-3 gap-1">
            {searchModeOptions.map((option) => (
              <label className="relative block cursor-pointer" key={option.id}>
                <input
                  className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  defaultChecked={mode === option.id}
                  name="mode"
                  type="radio"
                  value={option.value}
                />
                <span className="flex h-9 items-center justify-center rounded border border-transparent px-2 font-semibold text-archive-muted transition peer-checked:border-archive-violet/35 peer-checked:bg-archive-lavender peer-checked:text-archive-ink peer-focus-visible:border-archive-violet peer-focus-visible:ring-2 peer-focus-visible:ring-archive-violet/35 hover:bg-archive-lavender2 hover:text-archive-ink">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {submitLabel && (
        <button
          className="focus-ring mt-2 inline-flex h-11 w-full items-center justify-center rounded-md border border-archive-line bg-archive-lavender px-5 text-sm font-semibold text-archive-ink transition hover:bg-archive-violet hover:text-white sm:absolute sm:right-0 sm:top-0 sm:mt-0 sm:h-full sm:w-auto sm:rounded-l-none sm:rounded-r-md"
          type="submit"
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}
