import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { SourceImage } from "@/components/source-image";
import type { ArchiveSource } from "@/lib/types";

type SourceCardProps = {
  source: ArchiveSource;
  featured?: boolean;
};

export function SourceCard({ source, featured = false }: SourceCardProps) {
  return (
    <article className="group grid h-full gap-4 rounded-lg border border-archive-line bg-white p-4 transition hover:border-archive-violet hover:bg-archive-lavender2/35">
      <div className={featured ? "grid gap-4 sm:grid-cols-[8rem_1fr]" : "grid gap-4"}>
        <Link href={`/archive/${source.slug}`} aria-label={`View source: ${source.title}`}>
          <SourceImage
            className={featured ? "aspect-[4/5] w-full" : "aspect-[4/3] w-full"}
            imageClassName={source.imageTone === "portrait" ? "object-top" : undefined}
            source={source}
          />
        </Link>
        <div>
          <div className="display-label text-[0.82rem] text-archive-olive">
            {source.type}, {source.displayDate}
          </div>
          <Link href={`/archive/${source.slug}`} className="block focus-ring rounded-sm">
            <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-archive-ink transition group-hover:text-archive-violet">
              {source.title}
            </h3>
          </Link>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-archive-muted">
            {source.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {source.tags.slice(0, featured ? 3 : 2).map((tag, index) => (
              <Chip href={`/archive?tag=${encodeURIComponent(tag)}`} key={tag} tone={index === 2 ? "lavender" : "neutral"}>
                {tag}
              </Chip>
            ))}
          </div>
          <Link href={`/archive/${source.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-archive-violet focus-ring rounded-sm">
            View source <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
