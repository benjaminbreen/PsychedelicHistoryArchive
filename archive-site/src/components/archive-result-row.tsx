import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { SourceImage } from "@/components/source-image";
import { getSourceTitleParts } from "@/lib/source-title";
import type { ArchiveSource } from "@/lib/types";

export function ArchiveResultRow({ source }: { source: ArchiveSource }) {
  const titleParts = getSourceTitleParts(source);

  return (
    <article className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-archive-line py-3 md:grid-cols-[minmax(24rem,1.45fr)_6rem_8rem_minmax(12rem,1fr)_minmax(10rem,0.8fr)] md:items-center">
      <Link className="contents" href={`/archive/${source.slug}`}>
        <div className="flex gap-4 md:min-w-0">
          <SourceImage className="aspect-[3/2] w-[4.5rem] shrink-0 md:w-[5.25rem]" source={source} />
          <div className="min-w-0">
            <h3 className="font-serif text-[1.02rem] font-semibold leading-tight transition hover:text-archive-violet">
              {titleParts.title}
            </h3>
            {titleParts.subtitle && (
              <p className="mt-0.5 line-clamp-1 max-w-[32rem] text-[0.8rem] font-medium leading-5 text-archive-ink/80">
                {titleParts.subtitle}
              </p>
            )}
            <p className="mt-1 line-clamp-2 max-w-[32rem] text-[0.82rem] leading-5 text-archive-ink">
              {source.summary}
            </p>
            {source.accessType === "external" && (
              <span className="sr-only">
                <ExternalLink className="h-3 w-3" /> External source
              </span>
            )}
          </div>
        </div>
        <div className="hidden text-sm md:block">{source.displayDate}</div>
        <div className="hidden text-sm md:block">{source.type}</div>
        <div className="hidden flex-wrap gap-2 md:flex">
          {source.tags.slice(0, 3).map((tag, index) => (
            <Chip key={tag} tone={index === 2 ? "lavender" : "neutral"}>
              {tag}
            </Chip>
          ))}
        </div>
        <div className="hidden text-sm md:block">{source.people[0]}</div>
      </Link>
    </article>
  );
}

export function ArchiveCompactRow({ source }: { source: ArchiveSource }) {
  const titleParts = getSourceTitleParts(source);

  return (
    <Link
      className="grid min-h-12 grid-cols-[2.75rem_minmax(12rem,1fr)] items-center gap-3 border-b border-archive-line px-2 py-1.5 text-[0.82rem] transition hover:bg-archive-lavender2 md:grid-cols-[2.75rem_minmax(18rem,1.5fr)_6rem_8rem_minmax(10rem,0.9fr)_minmax(10rem,0.9fr)]"
      href={`/archive/${source.slug}`}
    >
      <SourceImage
        className="aspect-square w-11 border-0 bg-transparent"
        imageClassName={source.imageTone === "portrait" ? "object-top" : undefined}
        source={source}
      />
      <div className="min-w-0">
        <div className="truncate font-semibold leading-5 text-archive-ink">
          {titleParts.title}
        </div>
        {titleParts.subtitle && (
          <div className="truncate text-[0.76rem] leading-4 text-archive-muted md:hidden">
            {titleParts.subtitle}
          </div>
        )}
      </div>
      <div className="hidden truncate text-archive-muted md:block">{source.displayDate}</div>
      <div className="hidden truncate text-archive-muted md:block">{source.type}</div>
      <div className="hidden truncate text-archive-muted md:block">{source.people[0] ?? "Unknown"}</div>
      <div className="hidden truncate text-archive-muted md:block">{source.tags.slice(0, 2).join(", ")}</div>
    </Link>
  );
}
