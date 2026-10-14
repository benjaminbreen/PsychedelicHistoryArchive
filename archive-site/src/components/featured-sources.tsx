"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { SourceImage } from "@/components/source-image";
import type { ArchiveSource } from "@/lib/types";

export type FeaturedSourceCard = Pick<ArchiveSource, "id" | "slug" | "type" | "displayDate" | "title" | "summary" | "author" | "imagePath" | "imageAlt" | "imageTone"> & {
  eraSlug: string;
};

const COUNT = 4;

// Shuffle, then prefer one pick per era so a set spans the archive's chronology.
function pickVaried(pool: FeaturedSourceCard[]) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picks: FeaturedSourceCard[] = [];
  const eras = new Set<string>();
  for (const card of shuffled) {
    if (picks.length < COUNT && !eras.has(card.eraSlug)) {
      picks.push(card);
      eras.add(card.eraSlug);
    }
  }
  for (const card of shuffled) {
    if (picks.length < COUNT && !picks.includes(card)) picks.push(card);
  }
  return picks;
}

export function FeaturedSources({ pool }: { pool: FeaturedSourceCard[] }) {
  // The server renders the first cards in pool order; the browser swaps in a random set before fading in.
  const [cards, setCards] = useState(() => pool.slice(0, COUNT));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCards(pickVaried(pool));
    setReady(true);
  }, [pool]);

  return (
    <div className={clsx("grid gap-3 transition-opacity duration-300 md:grid-cols-3 xl:grid-cols-4", ready ? "opacity-100" : "opacity-0")}>
      {cards.map((source) => (
        <Link
          className="featured-source-card focus-ring group grid min-h-[8.5rem] grid-cols-[6.25rem_minmax(0,1fr)] gap-4 rounded-md border border-[rgb(var(--archive-warm-line))] p-3 transition hover:border-archive-violet/45 hover:bg-[rgb(var(--archive-warm-hover))]"
          href={`/archive/${source.slug}`}
          key={source.id}
        >
          <SourceImage
            className="featured-source-image aspect-[4/5] h-[8rem] w-full border-[rgb(var(--archive-warm-line))] opacity-[0.94] transition group-hover:opacity-100"
            imageClassName={source.imageTone === "portrait" ? "object-top" : undefined}
            source={source}
          />
          <span className="min-w-0">
            <span className="display-label block text-[0.8rem] text-archive-olive">
              {source.type}, {source.displayDate}
            </span>
            <span className="mt-2 block font-serif text-[1.03rem] font-semibold leading-snug text-archive-ink group-hover:text-archive-violetDark">
              {source.title}
            </span>
            <span className="featured-source-summary mt-1.5 text-[0.92rem] leading-5 text-archive-muted">
              {source.summary || source.author}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
