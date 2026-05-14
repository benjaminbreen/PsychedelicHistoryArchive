import Link from "next/link";
import type { ReactNode } from "react";

export type DirectoryItem = {
  label: string;
  href: string;
  meta?: string;
  subtitle?: string;
  image?: ReactNode;
  chips?: string[];
  description?: ReactNode;
  group?: string;
};

type DirectoryGridProps = {
  items: DirectoryItem[];
  emptyLabel?: string;
  variant?: "grouped" | "cards";
};

export function DirectoryGrid({ items, emptyLabel = "No entries found.", variant = "grouped" }: DirectoryGridProps) {
  if (items.length === 0) {
    return <p className="rounded-md border border-archive-line bg-white p-6 text-archive-muted">{emptyLabel}</p>;
  }

  if (variant === "cards") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            className="focus-ring group grid min-h-[6.75rem] grid-cols-[5.25rem_1fr] gap-3 rounded-md border border-[#E1DCE7] bg-white p-3 transition hover:border-archive-violet/40 hover:bg-[#FDFBFF]"
            href={item.href}
            key={item.href}
          >
            <span className="h-[5.25rem] w-[5.25rem] overflow-hidden rounded-sm border border-archive-line bg-archive-sand">
              {item.image}
            </span>
            <span className="min-w-0">
              <span className="block text-[0.94rem] font-semibold leading-tight text-archive-ink group-hover:text-archive-violet">
                {item.label}
              </span>
              {item.subtitle && <span className="mt-0.5 block text-[0.78rem] leading-4 text-archive-muted">{item.subtitle}</span>}
              {item.meta && <span className="block text-[0.78rem] leading-4 text-archive-muted">{item.meta}</span>}
              {item.chips && item.chips.length > 0 && (
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {item.chips.slice(0, 2).map((chip) => (
                    <span className="rounded border border-[#E5E0EA] bg-[#F7F5F9] px-1.5 py-0.5 text-[0.68rem] font-medium leading-4 text-[#625E6B]" key={chip}>
                      {chip}
                    </span>
                  ))}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  const grouped = items.reduce<Record<string, DirectoryItem[]>>((acc, item) => {
    const group = item.group ?? item.label.charAt(0).toUpperCase();
    acc[group] = acc[group] ?? [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-7">
      {Object.entries(grouped).map(([group, groupItems]) => (
        <section className="grid gap-4 border-t border-archive-line pt-4 md:grid-cols-[4rem_1fr]" key={group}>
          <h2 className="font-display text-3xl font-semibold uppercase leading-none tracking-[0.02em] text-archive-ink/80">
            {group}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {groupItems.map((item) => (
              <Link
                className="focus-ring group flex min-h-[8.25rem] flex-col justify-between rounded-md border border-[#DED2BD] bg-[#FFFDF8] p-4 transition hover:border-[#A88D62] hover:bg-[#FCF6EA]"
                href={item.href}
                key={item.href}
              >
                <span>
                  <span className="block font-serif text-[1.1rem] font-semibold leading-snug text-archive-ink group-hover:text-[#4F3E25]">
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="mt-2 line-clamp-2 block text-sm leading-5 text-archive-muted">
                      {item.description}
                    </span>
                  )}
                </span>
                <span className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold text-archive-muted">
                  <span>{item.meta}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
