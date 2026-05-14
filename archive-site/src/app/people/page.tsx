import type { Metadata } from "next";
import { CalendarDays, Search, SlidersHorizontal, Tag } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DirectoryGrid, type DirectoryItem } from "@/components/page/directory-grid";
import { PageHeader } from "@/components/page/page-header";
import { PageShell } from "@/components/page/page-shell";
import { getArchiveSourcesFromSupabase } from "@/lib/supabase-archive";
import { biographyProfiles, canonicalizePersonName, getBiographyDirectoryMetadata, getBiographyPortrait, isDisplayableBiographyName, slugifyPersonName } from "@/lib/biographies";
import type { ArchiveSource } from "@/lib/types";

export const metadata: Metadata = {
  title: "People | The Psychedelic History Archive",
  description: "Browse people represented in The Psychedelic History Archive."
};

export const dynamic = "force-dynamic";

type PersonEntry = {
  name: string;
  sources: ArchiveSource[];
  eras: string[];
  tags: string[];
};

export default async function PeoplePage() {
  const sources = await getArchiveSourcesFromSupabase();
  const people = buildPeopleDirectory(sources);
  const profileOnlyPeople = biographyProfiles
    .filter((profile) => isDisplayableBiographyName(profile.name) && !people.some((person) => slugifyPersonName(person.name) === profile.slug))
    .map<PersonEntry>((profile) => ({
      name: profile.name,
      sources: [],
      eras: [],
      tags: profile.tags
    }));
  const allPeople = [...people, ...profileOnlyPeople].sort((a, b) => a.name.localeCompare(b.name));
  const directoryItems: DirectoryItem[] = allPeople.map((person) => {
    const slug = slugifyPersonName(person.name);
    const profile = biographyProfiles.find((item) => item.slug === slug);
    const portrait = getBiographyPortrait(person.name);
    const directoryMetadata = getBiographyDirectoryMetadata(person.name);

    return {
      label: person.name,
      href: `/biographies/${slug}`,
      subtitle: directoryMetadata?.years ?? profile?.years ?? describePersonDate(person),
      meta: directoryMetadata?.role ?? profile?.facts.find((fact) => fact.label === "Occupation")?.value ?? describePersonRole(person),
      image: profile?.imagePath || portrait ? (
        <img className="h-full w-full object-cover object-top grayscale sepia-[.18]" src={profile?.imagePath ?? portrait?.imagePath} alt={profile?.imageAlt ?? portrait?.imageAlt ?? person.name} />
      ) : (
        <span className="grid h-full w-full place-items-center bg-archive-lavender2 font-display text-3xl text-archive-muted">
          {person.name.charAt(0)}
        </span>
      ),
      chips: (directoryMetadata?.tags ?? profile?.tags ?? person.tags).slice(0, 2),
      group: getPersonGroup(person.name)
    };
  });

  return (
    <>
      <SiteHeader activeLabel="Bios" />
      <PageShell width="wide" className="py-7">
        <PageHeader
          title="Biographies"
          variant="directory"
          description={
            <p>
              Writers, researchers, clinicians, and other figures connected to the history of psychedelics and altered states.
            </p>
          }
        />

        <section className="mt-5 rounded-md border border-[#E1DCE7] bg-white/60 p-3">
          <div className="grid gap-3 xl:grid-cols-[minmax(18rem,1fr)_10.25rem_10.25rem_10.25rem_10.25rem]">
            <div className="flex min-h-10 items-center gap-3 rounded-md border border-[#E1DCE7] bg-white px-3.5 text-[0.82rem] text-archive-muted">
              <Search className="h-3.5 w-3.5" />
              <span>Search people by name, field, or keyword...</span>
              <button className="ml-auto hidden rounded bg-archive-violet px-4 py-1.5 text-[0.78rem] font-semibold text-white sm:block" type="button">
                Search
              </button>
            </div>
            <FilterButton icon={<SlidersHorizontal className="h-3.5 w-3.5" />} label="Sort by: A-Z" />
            <FilterButton icon={<CalendarDays className="h-3.5 w-3.5" />} label="Era: All" />
            <FilterButton label="Region: All" />
            <FilterButton icon={<Tag className="h-3.5 w-3.5" />} label="Tags: All" />
          </div>
        </section>

        <section className="mt-4">
          <DirectoryGrid items={directoryItems.slice(0, 16)} variant="cards" />
          <div className="mt-5 flex items-center justify-between border-t border-archive-line pt-5 text-sm text-archive-muted">
            <span>Showing 1-{Math.min(16, directoryItems.length)} of {directoryItems.length} figures</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((page) => (
                <span className={page === 1 ? "grid h-9 w-9 place-items-center rounded border border-archive-violet text-archive-violet" : "grid h-9 w-9 place-items-center rounded border border-archive-line text-archive-ink"} key={page}>
                  {page}
                </span>
              ))}
            </div>
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}

function FilterButton({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#E1DCE7] bg-white px-3 text-[0.8rem] font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-[#FDFBFF]" type="button">
      {icon && <span className="text-archive-violet">{icon}</span>}
      {label}
    </button>
  );
}

function buildPeopleDirectory(sources: ArchiveSource[]) {
  const people = new Map<string, PersonEntry>();

  sources.forEach((source) => {
    source.people.forEach((name) => {
      if (!isDisplayableBiographyName(name)) return;

      const canonicalName = canonicalizePersonName(name);
      const entry = people.get(canonicalName) ?? { name: canonicalName, sources: [], eras: [], tags: [] };
      entry.sources.push(source);
      entry.eras = Array.from(new Set([...entry.eras, source.era])).sort();
      entry.tags = Array.from(new Set([...entry.tags, ...source.tags])).sort();
      people.set(canonicalName, entry);
    });
  });

  return Array.from(people.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function getPersonGroup(name: string) {
  const lastToken = name.trim().split(/\s+/).at(-1) ?? name;
  return lastToken.charAt(0).toUpperCase();
}

function describePersonDate(person: PersonEntry) {
  const years = person.sources.map((source) => source.year).filter(Boolean).sort();
  const first = years[0];
  const last = years.at(-1);

  if (first && last && first !== last) return `${first}-${last}`;
  if (first) return String(first);
  return person.eras.slice(0, 2).join(", ");
}

function describePersonRole(person: PersonEntry) {
  return person.tags.slice(0, 2).join(", ") || `${person.sources.length} linked ${person.sources.length === 1 ? "source" : "sources"}`;
}
