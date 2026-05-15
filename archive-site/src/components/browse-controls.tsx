import Link from "next/link";
import { BookOpen, CalendarDays, FileText, ImageIcon, Mic, Newspaper, PlayCircle, ScrollText, Tag, UserRound } from "lucide-react";
import type { FacetOption } from "@/lib/types";

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

export function EraBand({ facets }: { facets: FacetOption[] }) {
  return (
    <div className="grid gap-0 divide-y divide-[rgb(var(--archive-warm-line))] rounded-md border border-[rgb(var(--archive-warm-line))] bg-[rgb(var(--archive-warm-surface))] md:grid-cols-3 md:divide-x">
      {facets.map((facet) => (
        <Link
          className="focus-ring group relative flex items-center gap-3 px-4 py-4 transition hover:bg-[rgb(var(--archive-warm-hover))]"
          href={facet.href}
          key={facet.label}
        >
          <CalendarDays className="h-5 w-5 text-archive-muted group-hover:text-archive-violet" />
          <span>
            <span className="block font-semibold">
              {facet.label}
            </span>
            <span className="text-xs text-archive-muted">{facet.count.toLocaleString()} sources</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function MediumTiles({ facets }: { facets: FacetOption[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {facets.map((facet) => {
        const Icon = icons[facet.label as keyof typeof icons] ?? BookOpen;
        return (
          <Link
            className="focus-ring group flex min-h-20 items-center gap-3 rounded-md border border-[rgb(var(--archive-warm-line))] bg-[rgb(var(--archive-warm-surface))] px-4 py-3 transition hover:border-archive-violet/50 hover:bg-[rgb(var(--archive-warm-hover))]"
            href={facet.href}
            key={facet.label}
          >
            <Icon className="h-6 w-6 shrink-0 text-archive-olive transition group-hover:text-archive-violet" />
            <span>
              <span className="block text-sm font-semibold">{facet.label}</span>
              <span className="text-xs text-archive-muted">{facet.count.toLocaleString()}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
