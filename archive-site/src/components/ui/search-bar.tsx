import { Search } from "lucide-react";
import { clsx } from "clsx";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  action?: string;
  size?: "sm" | "lg";
  submitLabel?: string;
};

export function SearchBar({
  placeholder = "Search the archive...",
  className,
  defaultValue,
  action = "/search",
  size = "sm",
  submitLabel
}: SearchBarProps) {
  const hasSubmit = Boolean(submitLabel);

  return (
    <form action={action} className={clsx("relative min-w-0", className)}>
      <Search
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-archive-muted",
          size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )}
      />
      <input
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
