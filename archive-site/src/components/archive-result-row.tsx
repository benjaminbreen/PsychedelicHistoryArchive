import Link from "next/link";
import { Bookmark, ExternalLink } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { SourceImage } from "@/components/source-image";
import { getSourceTitleParts } from "@/lib/source-title";
import type { ArchiveSource } from "@/lib/types";

export function ArchiveResultRow({ source }: { source: ArchiveSource }) {
  const titleParts = getSourceTitleParts(source);

  return (
    <article className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-archive-line py-3 md:grid-cols-[minmax(24rem,1.45fr)_6rem_8rem_minmax(12rem,1fr)_minmax(10rem,0.8fr)_2rem] md:items-center">
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
      <button className="focus-ring hidden h-8 w-8 items-center justify-center rounded text-archive-ink hover:bg-archive-lavender2 md:inline-flex" type="button" aria-label={`Save ${source.title}`}>
        <Bookmark className="h-5 w-5" />
      </button>
    </article>
  );
}
