import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, FileText, Plus, Users } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Chip } from "@/components/ui/chip";
import { getArchiveSourcesFromSupabase } from "@/lib/supabase-archive";
import { buildFallbackBiography, canonicalizePersonName, findBiographyProfile, isDisplayableBiographyName, slugifyPersonName } from "@/lib/biographies";
import type { BiographyProfile } from "@/lib/biographies";
import type { ArchiveSource } from "@/lib/types";

type BiographyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BiographyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = findBiographyProfile(slug);
  return {
    title: `${profile?.name ?? "Biography"} | The Psychedelic History Archive`,
    description: profile?.dek ?? "Biography in The Psychedelic History Archive."
  };
}

export default async function BiographyPage({ params }: BiographyPageProps) {
  const { slug } = await params;
  const sources = await getArchiveSourcesFromSupabase();
  const profile = resolveBiography(slug, sources);

  if (!profile) notFound();

  const relatedSources = sources.filter((source) => source.people.some((person) => slugifyPersonName(canonicalizePersonName(person)) === slug));

  return (
    <>
      <SiteHeader activeLabel="Bios" variant="bio" />
      <main className="mx-auto grid w-full max-w-[1160px] gap-12 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,680px)_320px] lg:gap-20 lg:px-10">
        <article className="min-w-0">
          <nav className="mb-7 flex flex-wrap items-center gap-2 text-[0.86rem] text-archive-muted">
            <Link className="underline underline-offset-2 hover:text-archive-violet" href="/">Home</Link>
            <span>›</span>
            <Link className="underline underline-offset-2 hover:text-archive-violet" href="/people">Bios</Link>
            <span>›</span>
            <span className="text-archive-violet">{profile.name}</span>
          </nav>

          <h1 className="max-w-[680px] font-display text-[2.75rem] font-semibold uppercase leading-[0.92] tracking-[0.005em] text-archive-ink sm:text-[3.35rem]">
            {profile.name}
          </h1>
          {profile.years && <p className="mt-2 text-[1.35rem] font-bold leading-none text-archive-violet">{profile.years}</p>}
          {profile.dek && <p className="mt-5 max-w-[680px] text-[1.04rem] font-semibold leading-7 text-archive-ink">{profile.dek}</p>}

          <div className="mt-7 h-px w-20 bg-archive-violet/45" />

          <div className="mt-7 max-w-[680px] space-y-5 text-[1.03rem] leading-[1.72] text-archive-ink">
            {profile.paragraphs.slice(0, 3).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <section className="mt-9 border-t border-archive-line pt-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="display-label text-[0.86rem] text-archive-ink">Sources in the archive</h2>
              <Link className="text-sm font-semibold text-archive-violet hover:text-archive-violetDark" href={`/archive?people=${encodeURIComponent(profile.name)}`}>
                View all sources →
              </Link>
            </div>
            <div className="grid overflow-hidden rounded-sm border border-archive-line md:grid-cols-3">
              {relatedSources.slice(0, 3).map((source) => (
                <Link className="group grid min-h-[5.5rem] grid-cols-[2.75rem_1fr] gap-3 border-b border-archive-line p-3 transition hover:bg-archive-lavender2 md:border-b-0 md:border-r md:last:border-r-0" href={`/archive/${source.slug}`} key={source.id}>
                  <span className="grid h-9 w-9 place-items-center rounded bg-archive-lavender2 text-archive-ink transition group-hover:bg-archive-violet group-hover:text-white"><FileText className="h-5 w-5" /></span>
                  <span>
                    <span className="display-label block text-[0.58rem] text-archive-muted">{source.medium}</span>
                    <span className="mt-1 line-clamp-2 block text-sm font-semibold leading-5 text-archive-ink transition group-hover:text-archive-violet">{source.title}</span>
                    <span className="mt-1 block text-xs text-archive-muted">{source.displayDate} · {source.type}</span>
                  </span>
                </Link>
              ))}
              {relatedSources.length === 0 && (
                <p className="p-4 text-sm text-archive-muted">No linked source records yet.</p>
              )}
            </div>
          </section>

          {profile.paragraphs.length > 3 && (
            <section className="mt-8 max-w-[680px] space-y-5 text-[1.03rem] leading-[1.72] text-archive-ink">
              {profile.paragraphs.slice(3).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          )}

          {profile.sourceNotes && profile.sourceNotes.length > 0 && (
            <section className="mt-8 border-t border-archive-line pt-5">
              <h2 className="display-label text-[0.86rem] text-archive-ink">Notes and references</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-archive-muted">
                {profile.sourceNotes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </section>
          )}

          <section className="mt-8 border-t border-archive-line pt-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="display-label text-[0.86rem] text-archive-ink">Further reading</h2>
              <Link className="text-sm font-semibold text-archive-violet transition hover:text-archive-violetDark" href="/further-reading">
                View reading list →
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(profile.sourceNotes?.length ? profile.sourceNotes : [`Further reading for ${profile.name} is being prepared.`]).slice(0, 4).map((item) => (
                <div className="rounded-sm border border-archive-line bg-archive-surface p-4 text-sm leading-6 text-archive-muted transition hover:border-archive-violet/40 hover:bg-archive-lavender2/55" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </section>

          {profile.tags.length > 0 && (
            <section className="mt-12 border-t border-archive-line pt-5">
              <h2 className="display-label text-[0.86rem] text-archive-ink">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          {profile.imagePath && (
            <figure>
              <div className="overflow-hidden rounded-sm border border-archive-line bg-archive-surface">
                <img className="aspect-[4/3] w-full bg-archive-lavender2 object-contain grayscale" src={profile.imagePath} alt={profile.imageAlt ?? profile.name} />
              </div>
              {profile.imageCaption && <figcaption className="mt-2 text-xs italic leading-5 text-archive-muted">{profile.imageCaption}</figcaption>}
            </figure>
          )}

          <dl className="rounded-sm border border-archive-line bg-archive-surface px-4">
            {profile.facts.map((fact) => (
              <div className="grid grid-cols-[5.25rem_1fr] gap-5 border-b border-archive-line py-3.5 last:border-b-0" key={fact.label}>
                <dt className="text-[0.68rem] font-semibold uppercase leading-4 tracking-[0.065em] text-archive-ink/80">{fact.label}</dt>
                <dd className="whitespace-pre-line text-[0.92rem] leading-5 text-archive-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="overflow-hidden rounded-sm border border-archive-line bg-archive-surface">
            <AsideDisclosure
              defaultOpen
              icon={<BookOpen className="h-5 w-5" />}
              title="Related sources"
              description="Primary and secondary materials"
              items={profile.relatedSources ?? relatedSources.map((source) => `${source.title}, ${source.displayDate}`)}
            />
            <AsideDisclosure
              icon={<FileText className="h-5 w-5" />}
              title="Publications"
              description="Books, articles, and publications"
              items={profile.publications ?? profile.sourceNotes ?? []}
            />
            <AsideDisclosure
              icon={<Users className="h-5 w-5" />}
              title="Collaborators"
              description="Colleagues and research partners"
              items={profile.collaborators ?? []}
            />
          </div>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}

function resolveBiography(slug: string, sources: ArchiveSource[]): BiographyProfile | undefined {
  const direct = findBiographyProfile(slug);
  if (direct) return direct;

  const names = Array.from(new Set(sources.flatMap((source) => source.people).filter(isDisplayableBiographyName).map(canonicalizePersonName)));
  const name = names.find((candidate) => slugifyPersonName(candidate) === slug);
  if (!name) return undefined;

  const personSources = sources.filter((source) => source.people.some((person) => canonicalizePersonName(person) === name));
  return buildFallbackBiography(name, personSources);
}

function AsideDisclosure({
  icon,
  title,
  description,
  items,
  defaultOpen = false
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
  defaultOpen?: boolean;
}) {
  const displayItems = items.length ? items : ["Information forthcoming."];

  return (
    <details className="group border-b border-archive-line last:border-b-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 text-left transition hover:bg-archive-lavender2 [&::-webkit-details-marker]:hidden">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-archive-lavender2 text-archive-ink transition group-hover:bg-archive-violet group-hover:text-white">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.72rem] font-bold uppercase leading-4 tracking-[0.075em] text-archive-ink transition group-hover:text-archive-violet">{title}</span>
          <span className="mt-0.5 block text-[0.78rem] leading-4 text-archive-muted">{description}</span>
        </span>
        <Plus className="h-4 w-4 text-archive-ink transition group-open:rotate-45 group-hover:text-archive-violet" />
      </summary>
      <ul className="space-y-2 border-t border-archive-line bg-[rgb(var(--archive-warm-surface))] px-4 py-4 text-[0.82rem] leading-5 text-archive-muted">
        {displayItems.map((item) => (
          <li className="border-l border-archive-line pl-3" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </details>
  );
}
