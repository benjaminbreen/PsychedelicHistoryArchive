import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/page/page-shell";
import { listProjectPeople, type ProjectPerson, type ProjectPersonGroup } from "@/lib/project-team";

export const metadata: Metadata = {
  title: "Project Team | The Psychedelic History Archive",
  description: "Project team and advisory board for The Psychedelic History Archive."
};

const groupLabels: Record<ProjectPersonGroup, string> = {
  team: "Project Team",
  advisory_board: "Advisory Board",
  past_contributor: "Past Project Contributors"
};

export default async function ProjectTeamPage() {
  const people = await listProjectPeople();
  const team = people.filter((person) => person.group === "team");
  const advisoryBoard = people.filter((person) => person.group === "advisory_board");
  const pastContributors = people.filter((person) => person.group === "past_contributor");

  return (
    <>
      <SiteHeader activeLabel="About" />
      <PageShell width="wide" className="py-10">
        <header className="max-w-4xl">
          <p className="display-label text-[0.78rem] text-archive-violet">Team members</p>
          <h1 className="mt-3 font-display text-[2.8rem] font-normal leading-none text-archive-ink sm:text-[4.6rem]">
            Project Team
          </h1>
          <p className="mt-4 max-w-3xl text-[1.05rem] leading-7 text-archive-muted">
            People currently associated with The Psychedelic History Archive.
          </p>
        </header>

        <TeamSection people={team} title={groupLabels.team} />
        <TeamSection people={advisoryBoard} title={groupLabels.advisory_board} compact />
        <PastContributors people={pastContributors} title={groupLabels.past_contributor} />
      </PageShell>
      <SiteFooter />
    </>
  );
}

function TeamSection({ compact = false, people, title }: { compact?: boolean; people: ProjectPerson[]; title: string }) {
  if (!people.length) return null;

  return (
    <section className="mt-10 border-t border-archive-line pt-7" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, "-")}-heading`}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 id={`${title.toLowerCase().replace(/\s+/g, "-")}-heading`} className="source-serif-heading">
          {title}
        </h2>
      </div>
      <div className={compact ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "grid gap-4 md:grid-cols-2"}>
        {people.map((person) => (
          <PersonCard key={person.slug} person={person} />
        ))}
      </div>
    </section>
  );
}

function PastContributors({ people, title }: { people: ProjectPerson[]; title: string }) {
  if (!people.length) return null;

  return (
    <section className="mt-10 border-t border-archive-line pt-7" aria-labelledby="past-project-contributors-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="past-project-contributors-heading" className="source-serif-heading">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-archive-muted">
            UCSC student interns who worked on the project in 2024.
          </p>
        </div>
      </div>
      <ul className="grid gap-x-8 gap-y-2 rounded-md border border-archive-line bg-archive-surface p-5 text-sm sm:grid-cols-2">
        {people.map((person) => (
          <li className="project-contributor-row scroll-mt-28 rounded-sm border-b border-archive-line/70 p-2 transition last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0" id={person.slug} key={person.slug}>
            <span className="font-semibold text-archive-ink">{person.name}</span>
            <span className="ml-2 text-xs font-semibold text-archive-muted">{person.roleTitle}</span>
            {shouldShowBio(person.bio) && <p className="project-contributor-bio mt-2 hidden text-sm leading-6 text-archive-muted">{person.bio}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PersonCard({ person }: { person: ProjectPerson }) {
  const content = (
    <>
      <span className="block overflow-hidden rounded-sm border border-archive-line bg-archive-paper transition duration-200 group-hover:border-archive-violet">
        {person.portraitPath ? (
          <span className="relative block h-[9.375rem] overflow-hidden bg-archive-lavender2">
            <PortraitImage alt={person.portraitAlt || person.name} src={person.portraitPath} />
            <span className="pointer-events-none absolute inset-0 bg-archive-lavender/35 mix-blend-color transition-opacity duration-500 group-hover:opacity-0" />
            <span className="pointer-events-none absolute inset-0 bg-archive-violet/12 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-0" />
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_45%_18%,rgba(255,255,255,.30),transparent_42%),linear-gradient(180deg,transparent,rgba(104,80,145,.12))] mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-0" />
            {person.portraitHoverPath && (
              <img alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" src={person.portraitHoverPath} />
            )}
          </span>
        ) : (
          <span className="grid h-[9.375rem] place-items-center bg-[linear-gradient(135deg,#F8F1DF,#D1BE91_48%,#7F7055)] px-4 text-center font-display text-4xl uppercase text-white/80">
            {initials(person.name)}
          </span>
        )}
      </span>
      <span className="block min-w-0">
        <span className="flex items-start gap-2">
          <span className="block text-xl font-semibold leading-6 text-archive-ink">{person.name}</span>
          {person.profileUrl && <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-archive-violet" aria-hidden="true" />}
        </span>
        <span className="mt-1 block text-sm font-semibold text-archive-violet">{person.roleTitle}</span>
        {person.affiliation && <span className="mt-1 block text-sm text-archive-muted">{person.affiliation}</span>}
        {shouldShowBio(person.bio) && <span className="mt-4 block text-sm leading-6 text-archive-muted">{person.bio}</span>}
      </span>
    </>
  );

  const className = "project-person-card focus-ring group grid scroll-mt-28 gap-4 rounded-md border border-archive-line bg-archive-surface p-4 shadow-sm transition hover:border-archive-violet/35 sm:grid-cols-[8.25rem_minmax(0,1fr)]";

  if (person.profileUrl) {
    return (
      <a className={className} href={person.profileUrl} id={person.slug} rel="noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return (
    <article className={className} id={person.slug}>
      {content}
    </article>
  );
}

function PortraitImage({ alt, ariaHidden = false, className = "", src }: { alt: string; ariaHidden?: boolean; className?: string; src: string }) {
  return (
    <img
      alt={alt}
      aria-hidden={ariaHidden}
      className={`absolute inset-0 h-full w-full object-cover grayscale contrast-[1.08] sepia-[0.16] saturate-[0.9] mix-blend-multiply ${className}`}
      src={src}
    />
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

function shouldShowBio(value: string) {
  return Boolean(value.trim()) && !/brief bio forthcoming/i.test(value);
}
