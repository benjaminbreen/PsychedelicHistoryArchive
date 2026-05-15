"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, RotateCcw } from "lucide-react";

export type ErasBrowserCard = {
  slug: string;
  label: string;
  eyebrow: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  banner: string;
  count: number;
};

export function ErasBrowser({ cards }: { cards: ErasBrowserCard[] }) {
  const [flippedSlug, setFlippedSlug] = useState<string | null>(null);

  return (
    <section className="mt-8 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <EraCard
          card={card}
          flipped={flippedSlug === card.slug}
          key={card.slug}
          onFlip={() => setFlippedSlug((current) => (current === card.slug ? null : card.slug))}
          onUnflip={() => setFlippedSlug(null)}
        />
      ))}
    </section>
  );
}

type EraCardProps = {
  card: ErasBrowserCard;
  flipped: boolean;
  onFlip: () => void;
  onUnflip: () => void;
};

function EraCard({ card, flipped, onFlip, onUnflip }: EraCardProps) {
  const router = useRouter();
  const href = `/eras/${card.slug}`;

  function navigate() {
    if (flipped) return;
    router.push(href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (flipped) return;
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(href);
    }
  }

  return (
    <article className="era-card" data-flipped={flipped}>
      <div className="era-card-inner">
        {/* FRONT */}
        <div
          aria-hidden={flipped}
          aria-label={`${card.label} — open era`}
          className="era-card-face front focus-ring cursor-pointer"
          onClick={navigate}
          onKeyDown={handleKeyDown}
          role="link"
          tabIndex={flipped ? -1 : 0}
        >
          <div className="era-card-banner" style={{ background: card.banner }}>
            <button
              aria-expanded={flipped}
              aria-label={`More about ${card.label}`}
              className="focus-ring absolute right-2.5 top-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-archive-line/70 bg-archive-surface/85 text-archive-ink/80 backdrop-blur transition hover:bg-archive-surface hover:text-archive-violetDark"
              onClick={(event) => {
                event.stopPropagation();
                onFlip();
              }}
              type="button"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-[3.4rem_1fr] gap-4 px-5 pb-2 pt-4">
            <span className="grid aspect-square place-items-center self-start rounded-sm border border-archive-line bg-archive-paper">
              <img
                aria-hidden="true"
                alt=""
                className="topic-icon h-[2.6rem] w-[2.6rem] object-contain opacity-[0.84] mix-blend-multiply"
                src={`/ui/topic-icons/${card.icon}.png`}
              />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[0.78rem] uppercase tracking-[0.1em] text-archive-violetDark">
                {card.eyebrow}
              </p>
              <h2 className="mt-0.5 font-display text-[1.6rem] font-normal uppercase leading-none tracking-[0.01em] text-archive-ink">
                {card.label}
              </h2>
            </div>
          </div>
          <div className="px-5 pb-4">
            <p className="text-[0.92rem] leading-6 text-archive-ink/85">
              {card.shortDescription}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-archive-line px-5 py-3 text-sm">
            <span className="font-medium text-archive-ink">
              {card.count.toLocaleString()} {card.count === 1 ? "source" : "sources"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-archive-violet">
              Enter the era
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* BACK */}
        <div aria-hidden={!flipped} className="era-card-face back">
          <div className="flex items-start justify-between gap-4 border-b border-archive-line px-5 py-4">
            <div>
              <p className="font-display text-[0.78rem] uppercase tracking-[0.1em] text-archive-violetDark">
                {card.eyebrow}
              </p>
              <h2 className="font-display text-[1.45rem] font-normal uppercase leading-none tracking-[0.01em] text-archive-ink">
                {card.label}
              </h2>
            </div>
            <button
              aria-label="Back to card"
              className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-archive-line bg-archive-surface text-archive-ink/70 transition hover:text-archive-violetDark"
              onClick={onUnflip}
              tabIndex={flipped ? 0 : -1}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-5 py-4">
            <p className="font-serif text-[0.96rem] leading-6 text-archive-ink/90">
              {card.longDescription}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-archive-line px-5 py-3">
            <span className="text-sm font-medium text-archive-ink">
              {card.count.toLocaleString()} sources
            </span>
            <Link
              className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-archive-violet/45 bg-archive-lavender2/60 px-3 py-1.5 text-[0.82rem] font-semibold text-archive-violet transition hover:border-archive-violet hover:bg-archive-lavender"
              href={`/eras/${card.slug}`}
              tabIndex={flipped ? 0 : -1}
            >
              Click for more
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
