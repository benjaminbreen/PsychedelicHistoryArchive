import Link from "next/link";
import { SourceImage } from "@/components/source-image";
import { getSourceTitleParts } from "@/lib/source-title";
import type { ArchiveSource } from "@/lib/types";

type SourceCardProps = {
  source: ArchiveSource;
  featured?: boolean;
};

export function SourceCard({ source, featured = false }: SourceCardProps) {
  const titleParts = getSourceTitleParts(source);

  return (
    <article className="group grid h-full content-start rounded-md border border-transparent p-2 transition duration-200 hover:border-archive-line/80 hover:bg-archive-surface hover:shadow-[0_12px_28px_rgb(var(--archive-shadow)/0.08)]">
      <div className={featured ? "grid gap-4 sm:grid-cols-[8rem_1fr]" : "grid gap-5"}>
        <Link href={`/archive/${source.slug}`} aria-label={`View source: ${source.title}`}>
          <SourceImage
            className={featured ? "aspect-[4/5] w-full border-0 bg-transparent transition duration-200 group-hover:shadow-[0_8px_18px_rgb(var(--archive-shadow)/0.08)]" : "aspect-[4/3] w-full border-0 bg-transparent transition duration-200 group-hover:shadow-[0_8px_18px_rgb(var(--archive-shadow)/0.08)]"}
            imageClassName={source.imageTone === "portrait" ? "object-top" : undefined}
            source={source}
          />
        </Link>
        <div className="max-w-[21rem]">
          <div className="display-label text-[0.9rem] text-archive-olive">
            {source.type}, {source.displayDate}
          </div>
          <Link href={`/archive/${source.slug}`} className="block focus-ring rounded-sm">
            <h3 className="mt-3 line-clamp-2 min-h-[3.25rem] font-display text-[1.72rem] font-normal uppercase leading-[0.94] tracking-[0.01em] text-archive-ink transition group-hover:text-archive-violet">
              {titleParts.title}
            </h3>
          </Link>
          {titleParts.subtitle && (
            <p className="mt-3 line-clamp-2 text-[1.04rem] leading-6 text-archive-ink/85">
              {titleParts.subtitle}
            </p>
          )}
          <p className="mt-2 line-clamp-3 min-h-[5.25rem] text-[1.04rem] leading-7 text-archive-ink/82">
            {source.summary}
          </p>
          <Link href={`/archive/${source.slug}`} className="mt-4 inline-flex text-[1.02rem] leading-6 text-archive-ink underline decoration-archive-ink/70 underline-offset-4 transition hover:text-archive-violet hover:decoration-archive-violet focus-ring rounded-sm">
            Read more
          </Link>
        </div>
      </div>
    </article>
  );
}
