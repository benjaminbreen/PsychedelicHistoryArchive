import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/page/page-shell";
import { listContributionsByAuthor } from "@/lib/contributors";
import { listProjectPeople } from "@/lib/project-team";
import { canonicalPath } from "@/lib/seo";

type ContributorPageProps = { params: Promise<{ slug: string }> };

async function getContributor(slug: string) {
  const [people, contributions] = await Promise.all([listProjectPeople(), listContributionsByAuthor()]);
  const person = people.find((candidate) => candidate.slug === slug);
  return person ? { person, contributions: contributions.get(slug) ?? [] } : null;
}

export async function generateMetadata({ params }: ContributorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const contributor = await getContributor(slug);
  if (!contributor) return { title: "Contributor not found | The Psychedelic History Archive" };
  return {
    title: `${contributor.person.name} | The Psychedelic History Archive`,
    description: contributor.person.bio || `${contributor.person.name}, ${contributor.person.roleTitle}, The Psychedelic History Archive.`,
    alternates: { canonical: canonicalPath(`/contributors/${slug}`) }
  };
}

export default async function ContributorPage({ params }: ContributorPageProps) {
  const { slug } = await params;
  const contributor = await getContributor(slug);
  if (!contributor) notFound();
  const { person, contributions } = contributor;

  return (
    <>
      <SiteHeader activeLabel="About" />
      <PageShell width="narrow" className="py-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-archive-muted">
          <Link className="underline underline-offset-2 hover:text-archive-violet" href="/project-team">Project Team</Link>
          <span>›</span>
          <span className="text-archive-violet">{person.name}</span>
        </nav>

        <header className="mt-6 grid gap-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start">
          {person.portraitPath ? (
            <img alt={person.portraitAlt || person.name} className="aspect-[4/5] w-36 rounded-sm border border-archive-line object-cover grayscale" src={person.portraitPath} />
          ) : (
            <span className="grid aspect-[4/5] w-36 place-items-center rounded-sm border border-archive-line bg-[linear-gradient(135deg,#F8F1DF,#D1BE91_48%,#7F7055)] font-display text-4xl uppercase text-white/80">
              {person.name.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("")}
            </span>
          )}
          <div>
            <h1 className="font-display text-[2.6rem] font-normal leading-none text-archive-ink sm:text-[3.4rem]">{person.name}</h1>
            <p className="mt-3 text-sm font-semibold text-archive-violet">{person.roleTitle}</p>
            {person.affiliation && <p className="mt-1 text-sm text-archive-muted">{person.affiliation}</p>}
            {person.profileUrl && (
              <a className="mt-2 inline-block text-sm text-archive-ink underline underline-offset-2 hover:text-archive-violet" href={person.profileUrl} rel="noreferrer" target="_blank">
                Personal website
              </a>
            )}
          </div>
        </header>

        {person.bio.trim() && <p className="mt-8 max-w-[680px] text-[1.03rem] leading-[1.72] text-archive-ink">{person.bio}</p>}

        {contributions.length > 0 && (
          <section className="mt-10 border-t border-archive-line pt-6" aria-labelledby="contributions-heading">
            <h2 id="contributions-heading" className="source-serif-heading">Writing in the archive</h2>
            <ul className="mt-4 divide-y divide-archive-line border-y border-archive-line">
              {contributions.map((item) => (
                <li className="flex flex-wrap items-baseline justify-between gap-3 py-3" key={item.href}>
                  <Link className="font-semibold text-archive-ink hover:text-archive-violet hover:underline" href={item.href}>{item.title}</Link>
                  <span className="text-xs font-semibold uppercase tracking-[0.06em] text-archive-muted">{item.kind}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageShell>
      <SiteFooter />
    </>
  );
}
