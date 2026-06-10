import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/page/page-shell";
import { listArchiveSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { ERAS, bannerBackground, countSourcesInEra } from "@/lib/eras";
import { ErasBrowser, type ErasBrowserCard } from "./eras-browser";

export const metadata: Metadata = {
  title: "Eras | The Psychedelic History Archive",
  description:
    "Browse the archive chronologically through six historical eras, each introduced with a contextual essay, key figures, and further reading."
};

export const revalidate = 3600;

export default async function ErasPage() {
  const sources = await listArchiveSourceSummariesFromSupabase();
  const cards: ErasBrowserCard[] = ERAS.map((era) => ({
    slug: era.slug,
    label: era.label,
    eyebrow: era.eyebrow,
    shortDescription: era.shortDescription,
    longDescription: era.longDescription,
    icon: era.icon,
    banner: bannerBackground(era),
    count: countSourcesInEra(sources, era)
  }));

  return (
    <>
      <SiteHeader activeLabel="Eras" />
      <PageShell width="wide" className="py-8">
        <header className="grid gap-5 lg:grid-cols-[minmax(14rem,18rem)_minmax(20rem,38rem)] lg:items-end xl:grid-cols-[minmax(16rem,22rem)_minmax(24rem,42rem)]">
          <h1 className="font-display text-[2.2rem] font-normal leading-none tracking-[-0.00em] text-archive-ink sm:text-[3.5rem]">
            Eras
          </h1>
          <p className="max-w-[36rem] text-[.9rem] leading-7 text-archive-muted">
          Click any era to enter
            its page, or tap the info button on a card for a longer
            description.
          </p>
        </header>

        <ErasBrowser cards={cards} />
      </PageShell>
      <SiteFooter />
    </>
  );
}
