import Link from "next/link";
import { BookOpen, CalendarDays, FileText, ImageIcon, Mic, Newspaper, PlayCircle, ScrollText, Tag, UserRound } from "lucide-react";
import { ArchiveImage } from "@/components/ui/archive-image";
import type { FacetOption } from "@/lib/types";

type EraFacetOption = FacetOption & {
  imagePath?: string;
  subtitle?: string;
};

const icons = {
  Eras: CalendarDays,
  Media: ImageIcon,
  Topics: Tag,
  People: UserRound,
  Text: BookOpen,
  Images: ImageIcon,
  "Audio/Video": PlayCircle,
  "Academic Articles": FileText,
  Audio: Mic,
  Books: BookOpen,
  "Field Notes": ScrollText,
  Manuscripts: ScrollText,
  Newspapers: Newspaper,
  Testimony: FileText,
  Video: PlayCircle,
  Websites: ImageIcon,
  "Personal Histories": UserRound,
  Biographies: UserRound,
  "Further Reading": BookOpen,
  Sources: BookOpen
};

export function BrowsePills() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-sm">
      <span className="font-semibold text-archive-muted">Browse by:</span>
      {[
        ["Eras", "/eras"],
        ["Topics", "/topics"],
        ["People", "/people"],
        ["Sources", "/archive"]
      ].map(([label, href]) => {
        const Icon = icons[label as keyof typeof icons];
        return (
          <Link className="focus-ring group inline-flex items-center gap-2 rounded-md border border-[rgb(var(--archive-warm-line))] bg-[rgb(var(--archive-warm-surface))] px-3.5 py-2 font-semibold transition hover:border-archive-violet/50 hover:bg-[rgb(var(--archive-warm-hover))] hover:text-archive-violet" href={href} key={label}>
            <Icon className="h-4 w-4 text-archive-olive transition group-hover:text-archive-violet" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function EraBand({ facets }: { facets: EraFacetOption[] }) {
  return (
    <div className="grid gap-0 divide-y divide-[rgb(var(--archive-warm-line))] rounded-md border border-[rgb(var(--archive-warm-line))] bg-[rgb(var(--archive-warm-surface))] md:grid-cols-3 md:divide-x">
      {facets.map((facet) => (
        <Link
          className="focus-ring group relative flex items-center gap-4 px-4 py-4 transition hover:bg-[rgb(var(--archive-warm-hover))]"
          href={facet.href}
          key={facet.label}
        >
          {facet.imagePath ? (
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[rgb(var(--archive-warm-line))] bg-archive-paper shadow-[0_4px_12px_rgb(var(--archive-shadow)/0.08)]">
              <ArchiveImage
                alt=""
                className="h-full w-full"
                imageClassName="opacity-85 saturate-[0.9] transition duration-200 group-hover:scale-105 group-hover:opacity-100"
                src={facet.imagePath}
              />
            </span>
          ) : (
            <CalendarDays className="h-5 w-5 text-archive-muted group-hover:text-archive-violet" />
          )}
          <span>
            <span className="block font-semibold">
              {facet.label}
            </span>
            <span className="text-xs text-archive-muted">{facet.count.toLocaleString()} sources</span>
            {facet.subtitle && (
              <span className="mt-0.5 block text-xs leading-4 text-archive-muted/85">{facet.subtitle}</span>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function MediumTiles({ facets }: { facets: FacetOption[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
      {facets.map((facet) => {
        const Icon = icons[facet.label as keyof typeof icons] ?? BookOpen;
        return (
          <Link
            className="focus-ring group flex min-h-14 items-center gap-2 rounded-md border border-[rgb(var(--archive-warm-line))] bg-[rgb(var(--archive-warm-surface))] px-2.5 py-2 transition hover:border-archive-violet/50 hover:bg-[rgb(var(--archive-warm-hover))]"
            href={facet.href}
            key={facet.label}
          >
            <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 text-archive-olive transition group-hover:text-archive-violet" />
            <span className="min-w-0">
              <span className="block truncate text-[0.8rem] font-semibold leading-4">{facet.label}</span>
              <span className="text-[0.72rem] text-archive-muted">{facet.count.toLocaleString()}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
