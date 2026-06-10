import type { Metadata } from "next";
import { CalendarDays, Search, SlidersHorizontal, Tag } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DirectoryGrid, type DirectoryItem } from "@/components/page/directory-grid";
import { PageHeader } from "@/components/page/page-header";
import { PageShell } from "@/components/page/page-shell";
import { listArchiveSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { biographyProfiles, canonicalizePersonName, getBiographyDirectoryMetadata, getBiographyPortrait, isDisplayableBiographyName, slugifyPersonName } from "@/lib/biographies";
import type { ArchiveSource } from "@/lib/types";

export const metadata: Metadata = {
  title: "People | The Psychedelic History Archive",
  description: "Browse people represented in The Psychedelic History Archive."
};

export const revalidate = 3600;
const PEOPLE_PAGE_SIZE = 40;

type PersonEntry = {
  name: string;
  sources: ArchiveSource[];
  eras: string[];
  regions: string[];
  tags: string[];
};

type PeoplePageProps = {
  searchParams: Promise<{
    domain?: string;
    era?: string;
    q?: string;
    region?: string;
    sort?: string;
    tag?: string;
  }>;
};

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const params = await searchParams;
  const sources = await listArchiveSourceSummariesFromSupabase();
  const people = buildPeopleDirectory(sources);
  const profileOnlyPeople = biographyProfiles
    .filter((profile) => isDisplayableBiographyName(profile.name) && !people.some((person) => slugifyPersonName(person.name) === profile.slug))
    .map<PersonEntry>((profile) => ({
      name: profile.name,
      sources: [],
      eras: [],
      regions: [],
      tags: profile.tags
    }));
  const allPeople = [...people, ...profileOnlyPeople].sort((a, b) => a.name.localeCompare(b.name));
  const visiblePeople = filterPeople(allPeople, params);
  const facetOptions = getPeopleFacetOptions(allPeople);
  const directoryItems: DirectoryItem[] = visiblePeople.map((person) => {
    const slug = slugifyPersonName(person.name);
    const profile = biographyProfiles.find((item) => item.slug === slug);
    const portrait = getBiographyPortrait(person.name);
    const directoryMetadata = getBiographyDirectoryMetadata(person.name);
    const chips = profile
      ? directoryMetadata?.tags ?? profile.tags
      : ["Metadata stub", ...(directoryMetadata?.tags ?? person.tags)];

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
      chips: chips.slice(0, 2),
      group: getPersonGroup(person.name)
    };
  });

  return (
    <>
      <SiteHeader activeLabel="People" />
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

        <PeopleFilters facetOptions={facetOptions} params={params} />

        <section className="mt-4">
          <DirectoryGrid items={directoryItems.slice(0, PEOPLE_PAGE_SIZE)} variant="cards" />
          <div className="mt-5 flex items-center justify-between border-t border-archive-line pt-5 text-sm text-archive-muted">
            <span>Showing 1-{Math.min(PEOPLE_PAGE_SIZE, directoryItems.length)} of {directoryItems.length} figures</span>
            {directoryItems.length > PEOPLE_PAGE_SIZE && (
              <span>{directoryItems.length - PEOPLE_PAGE_SIZE} more figures available through search and filters</span>
            )}
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}

function PeopleFilters({
  facetOptions,
  params
}: {
  facetOptions: {
    eras: string[];
    regions: string[];
    tags: string[];
  };
  params: Awaited<PeoplePageProps["searchParams"]>;
}) {
  return (
    <section className="mt-5 rounded-md border border-archive-line bg-archive-surface/60 p-3">
      <form action="/people" className="grid gap-3 xl:grid-cols-[minmax(18rem,1fr)_10.25rem_10.25rem_10.25rem_10.25rem_6.5rem]">
        {params.domain && <input name="domain" type="hidden" value={params.domain} />}
        <label className="flex min-h-10 items-center gap-3 rounded-md border border-archive-line bg-archive-surface px-3.5 text-[0.82rem] text-archive-muted">
          <Search className="h-3.5 w-3.5" />
          <span className="sr-only">Search people</span>
          <input className="min-w-0 flex-1 bg-transparent text-archive-ink outline-none placeholder:text-archive-muted" defaultValue={params.q ?? ""} name="q" placeholder="Search people by name, field, or keyword" type="search" />
        </label>
        <SelectFilter icon={<SlidersHorizontal className="h-3.5 w-3.5" />} label="Sort" name="sort" options={[
          { label: "A-Z", value: "az" },
          { label: "Z-A", value: "za" },
          { label: "Most sources", value: "sources" }
        ]} value={params.sort ?? "az"} />
        <SelectFilter icon={<CalendarDays className="h-3.5 w-3.5" />} label="Era" name="era" options={facetOptions.eras.map((value) => ({ label: value, value }))} value={params.era ?? ""} />
        <SelectFilter label="Region" name="region" options={facetOptions.regions.map((value) => ({ label: value, value }))} value={params.region ?? ""} />
        <SelectFilter icon={<Tag className="h-3.5 w-3.5" />} label="Tag" name="tag" options={facetOptions.tags.map((value) => ({ label: value, value }))} value={params.tag ?? ""} />
        <button className="focus-ring h-10 rounded-md bg-archive-violet px-3 text-[0.8rem] font-semibold text-white transition hover:bg-archive-violetDark" type="submit">
          Apply
        </button>
      </form>
    </section>
  );
}

function SelectFilter({
  icon,
  label,
  name,
  options,
  value
}: {
  icon?: React.ReactNode;
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="focus-within:ring-2 focus-within:ring-archive-violet/40 flex min-h-10 items-center gap-2 rounded-md border border-archive-line bg-archive-surface px-3 text-[0.8rem] font-semibold text-archive-ink">
      {icon && <span className="text-archive-violet">{icon}</span>}
      <span className="sr-only">{label}</span>
      <select className="min-w-0 flex-1 bg-transparent outline-none" defaultValue={value} name={name}>
        <option value="">{label}: All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {label === "Sort" ? option.label : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function buildPeopleDirectory(sources: ArchiveSource[]) {
  const people = new Map<string, PersonEntry>();

  sources.forEach((source) => {
    source.people.forEach((name) => {
      if (!isDisplayableBiographyName(name)) return;

      const canonicalName = canonicalizePersonName(name);
      const entry = people.get(canonicalName) ?? { name: canonicalName, sources: [], eras: [], regions: [], tags: [] };
      entry.sources.push(source);
      entry.eras = Array.from(new Set([...entry.eras, source.era])).sort();
      entry.regions = Array.from(new Set([...entry.regions, source.region].filter(Boolean))).sort();
      entry.tags = Array.from(new Set([...entry.tags, ...source.tags])).sort();
      people.set(canonicalName, entry);
    });
  });

  return Array.from(people.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function filterPeople(people: PersonEntry[], params: Awaited<PeoplePageProps["searchParams"]>) {
  const query = normalizeDomainText(params.q ?? "");
  const visiblePeople = people.filter((person) => {
    const profile = biographyProfiles.find((item) => item.slug === slugifyPersonName(person.name));
    const directoryMetadata = getBiographyDirectoryMetadata(person.name);
    const haystack = normalizeDomainText([
      person.name,
      directoryMetadata?.role,
      profile?.dek,
      profile?.years,
      ...(profile?.tags ?? []),
      ...person.eras,
      ...person.regions,
      ...person.tags
    ].filter(Boolean).join(" "));

    return (
      (!params.domain || getPersonDomain(person) === params.domain) &&
      (!query || haystack.includes(query)) &&
      (!params.era || person.eras.includes(params.era)) &&
      (!params.region || person.regions.includes(params.region)) &&
      (!params.tag || person.tags.includes(params.tag) || profile?.tags.includes(params.tag))
    );
  });

  return visiblePeople.sort((a, b) => {
    if (params.sort === "za") return b.name.localeCompare(a.name);
    if (params.sort === "sources") return b.sources.length - a.sources.length || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
}

function getPeopleFacetOptions(people: PersonEntry[]) {
  return {
    eras: sortedUnique(people.flatMap((person) => person.eras)),
    regions: sortedUnique(people.flatMap((person) => person.regions)),
    tags: sortedUnique(people.flatMap((person) => person.tags)).slice(0, 40)
  };
}

function sortedUnique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function getPersonGroup(name: string) {
  const lastToken = name.trim().split(/\s+/).at(-1) ?? name;
  return lastToken.charAt(0).toUpperCase();
}

function getPersonDomain(person: PersonEntry) {
  const text = normalizeDomainText([person.name, ...person.tags].join(" "));

  if (/(indigenous|amazonian|tukano|yoman|aztec|maya|nahua|native|shaman)/.test(text)) {
    return "indigenous-traditions";
  }

  if (/(artist|writer|literature|poetry|poet|novelist|visual|film|music|composer)/.test(text)) {
    return "arts-literature";
  }

  if (/(spiritual|mysticism|religion|teacher|guide|ceremon|practice)/.test(text)) {
    return "spiritual-practice";
  }

  if (/(counterculture|activist|organizer|politic|law|prohibition|publisher|editor)/.test(text)) {
    return "politics-counterculture";
  }

  return "science-medicine";
}

function normalizeDomainText(value: string) {
  return value.toLowerCase().replace(/&/g, "and");
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
