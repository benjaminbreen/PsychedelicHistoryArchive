import { clsx } from "clsx";
import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
  variant?: "standard" | "directory";
};

export function PageHeader({ eyebrow, title, description, aside, className, variant = "standard" }: PageHeaderProps) {
  return (
    <header className={clsx("grid gap-6 lg:items-end", aside && "lg:grid-cols-[minmax(0,1fr)_18rem]", variant === "standard" && "border-b border-archive-line pb-7", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="display-label text-[0.78rem] text-archive-olive">{eyebrow}</p>}
        <h1
          className={clsx(
            "max-w-4xl font-display leading-[0.95] text-archive-ink",
            variant === "directory"
              ? "mt-0 text-[3.8rem] font-normal tracking-[0.01em] sm:text-[3.2rem]"
              : "mt-3 text-[2.6rem] font-semibold uppercase tracking-[0.015em] sm:text-[2.5rem]"
          )}
        >
          {title}
        </h1>
        {description && <div className="mt-4 max-w-3xl text-[0.9rem] leading-7 text-archive-muted">{description}</div>}
      </div>
      {aside && <div className="lg:justify-self-end">{aside}</div>}
    </header>
  );
}
