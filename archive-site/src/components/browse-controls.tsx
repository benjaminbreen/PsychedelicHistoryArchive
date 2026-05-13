import Link from "next/link";
import { BookOpen, CalendarDays, ImageIcon, PlayCircle, Tag, UserRound } from "lucide-react";
import type { FacetOption } from "@/lib/types";

const icons = {
  Eras: CalendarDays,
  Media: ImageIcon,
  Topics: Tag,
  People: UserRound,
  Text: BookOpen,
  Images: ImageIcon,
  "Audio/Video": PlayCircle,
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
        ["Eras", "/archive"],
        ["Topics", "/topics"],
        ["People", "/people"],
        ["Sources", "/archive"]
      ].map(([label, href]) => {
        const Icon = icons[label as keyof typeof icons];
        return (
          <Link className="focus-ring group inline-flex items-center gap-2 rounded-md border border-[#D8C8A9] bg-[#FFFDF8] px-3.5 py-2 font-semibold transition hover:border-[#A88D62] hover:bg-[#FCF6EA] hover:text-archive-violet" href={href} key={label}>
            <Icon className="h-4 w-4 text-[#7B7351] transition group-hover:text-archive-violet" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function EraBand({ facets }: { facets: FacetOption[] }) {
  return (
    <div className="grid gap-0 divide-y divide-[#DED2BD] rounded-md border border-[#DED2BD] bg-[#FFFDF8] md:grid-cols-5 md:divide-x md:divide-y-0">
      {facets.map((facet, index) => (
        <Link
          className="focus-ring group relative flex items-center gap-3 px-4 py-4 transition hover:bg-[#FCF6EA]"
          href={facet.href}
          key={facet.label}
        >
          <CalendarDays className={index === 1 ? "h-5 w-5 text-archive-violet" : "h-5 w-5 text-archive-muted group-hover:text-archive-violet"} />
          <span>
            <span className={index === 1 ? "block font-semibold text-archive-violet" : "block font-semibold"}>
              {facet.label}
            </span>
            <span className="text-xs text-archive-muted">{facet.count.toLocaleString()} sources</span>
          </span>
          {index === 1 && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[#6F4BC2]" />}
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
            className="focus-ring group flex min-h-20 items-center gap-3 rounded-md border border-[#DED2BD] bg-[#FFFDF8] px-4 py-3 transition hover:border-[#A88D62] hover:bg-[#FCF6EA]"
            href={facet.href}
            key={facet.label}
          >
            <Icon className="h-6 w-6 shrink-0 text-[#7B7351] transition group-hover:text-archive-violet" />
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
