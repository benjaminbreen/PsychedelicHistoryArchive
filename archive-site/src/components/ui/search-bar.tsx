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
  action = "/archive",
  size = "sm",
  submitLabel
}: SearchBarProps) {
  return (
    <form action={action} className={clsx("relative", className)}>
      <Search
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-archive-muted",
          size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )}
      />
      <input
        className={clsx(
          "focus-ring w-full rounded-md border border-archive-line bg-white text-archive-ink shadow-sm transition placeholder:text-archive-muted",
          submitLabel && "rounded-r-none",
          size === "lg"
            ? submitLabel
              ? "h-12 pl-11 pr-24 text-[0.98rem] sm:h-[3.35rem]"
              : "h-16 pl-12 pr-5 text-base"
            : "h-11 pl-11 pr-4 text-sm"
        )}
        defaultValue={defaultValue}
        name="q"
        placeholder={placeholder}
        type="search"
      />
      {submitLabel && (
        <button
          className="focus-ring absolute right-0 top-0 h-full rounded-r-md border border-archive-ink/60 bg-[#F4EDF8] px-5 text-sm font-semibold transition hover:bg-[#EEE0F8]"
          type="submit"
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}
