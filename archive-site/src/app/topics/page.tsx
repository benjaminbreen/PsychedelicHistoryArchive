import type { Metadata } from "next";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/page/page-shell";
import { getFacetCounts } from "@/lib/archive-query";
import { isCoreTopicSlug } from "@/lib/core-topics";
import { topicHref, topicSlug } from "@/lib/internal-links";
import { listArchiveSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { listPublicTopics, type PublicTopicListItem } from "@/lib/topics";
import type { ArchiveSource } from "@/lib/types";
import { TopicsBrowser } from "./topics-browser";

export const metadata: Metadata = {
  title: "Topics | The Psychedelic History Archive",
  description: "Browse topics represented in The Psychedelic History Archive."
};

export const revalidate = 3600;

const TOPIC_ICON_DIR = path.join(process.cwd(), "public", "ui", "topic-icons");

type TopicCard = {
  title: string;
  icon: string;
  description: string;
  tags: string[];
};

type TagCloudItem = {
  title: string;
  count: number;
  href: string;
};

export type VisibleTopic = TopicCard & {
  count: number;
  href: string;
  slug: string;
  sources: Array<{
    title: string;
    href: string;
    displayDate: string;
    type: string;
  }>;
};

const TOPIC_METADATA: TopicCard[] = [
  {
    title: "Ayahuasca",
    icon: "ethnobotany",
    description: "The Amazonian brew, its ceremonial use, and its reception abroad.",
    tags: ["Shamanism", "Indigenous Knowledge"]
  },
  {
    title: "Kava",
    icon: "ethnobotany",
    description: "Kava in the Pacific, from village preparation to pharmacology lab.",
    tags: ["Ethnobotany", "Pharmacology"]
  },
  {
    title: "Psilocybin",
    icon: "psilocybin",
    description: "Psilocybin mushrooms in ritual, laboratory, and clinical use.",
    tags: ["Pharmacology", "Consciousness"]
  },
  {
    title: "Nitrous Oxide",
    icon: "nitrous-oxide",
    description: "Laughing gas as fairground spectacle, surgical anesthetic, and mystical prompt.",
    tags: ["Chemistry", "Medicine"]
  },
  {
    title: "Mescaline",
    icon: "mescaline",
    description: "Peyote and related cacti, from Indigenous ritual to laboratory isolation.",
    tags: ["Ethnobotany", "Religion"]
  },
  {
    title: "Mysticism",
    icon: "mysticism",
    description: "Accounts of mystical experience and the writers who interpreted them.",
    tags: ["Religion", "Consciousness"]
  },
  {
    title: "Psychiatry",
    icon: "psychiatry",
    description: "Psychedelics in psychiatric clinics and mental health research.",
    tags: ["Medicine", "Therapy"]
  },
  {
    title: "Shamanism",
    icon: "shamanism",
    description: "Healing and ecstatic practices, and the people who studied them.",
    tags: ["Indigenous Knowledge", "Ritual"]
  },
  {
    title: "Religious Experience",
    icon: "religious-experience",
    description: "Visions, ecstatic states, and entheogenic religion across cultures.",
    tags: ["Religion", "Consciousness"]
  },
  {
    title: "Ethnobotany",
    icon: "ethnobotany",
    description: "Plants and fungi in their cultural settings.",
    tags: ["Botany", "Indigenous Knowledge"]
  },
  {
    title: "Cannabis",
    icon: "cannabis",
    description: "Cannabis sativa in medicine, culture, and law.",
    tags: ["Pharmacology", "Law"]
  },
  {
    title: "Pharmacology",
    icon: "pharmacology",
    description: "How drugs act on the body — the science and its history.",
    tags: ["Chemistry", "Research"]
  },
  {
    title: "Chemistry",
    icon: "pharmacology",
    description: "Synthesis and structure of psychoactive compounds.",
    tags: ["Pharmacology", "Research"]
  },
  {
    title: "Clinical",
    icon: "clinical",
    description: "Hospital case notes and medical trial records.",
    tags: ["Medicine", "Research"]
  },
  {
    title: "Indigenous Knowledge",
    icon: "indigenous-knowledge",
    description: "Traditional knowledge and oral histories.",
    tags: ["Culture", "Oral History"]
  },
  {
    title: "Anthropology",
    icon: "indigenous-knowledge",
    description: "Ethnographic fieldwork and the encounter between cultures.",
    tags: ["Culture", "Research"]
  },
  {
    title: "Visionary Art",
    icon: "visionary-art",
    description: "Art and visual culture inspired by altered states.",
    tags: ["Art", "Culture"]
  },
  {
    title: "Consciousness",
    icon: "consciousness",
    description: "Writing on the mind and its altered states.",
    tags: ["Philosophy", "Neuroscience"]
  },
  {
    title: "Psychology",
    icon: "psychiatry",
    description: "Psychological research on perception, emotion, and drug effects.",
    tags: ["Consciousness", "Research"]
  },
  {
    title: "Addiction",
    icon: "addiction",
    description: "Dependence, recovery, and harm reduction in context.",
    tags: ["Medicine", "Public Health"]
  },
  {
    title: "Ritual",
    icon: "religion",
    description: "Ceremony and symbolic practice across cultures.",
    tags: ["Ritual", "Culture"]
  },
  { title: "LSD", icon: "lsd", description: "Lysergic acid diethylamide after Hofmann's 1943 discovery.", tags: ["Chemistry", "Therapy"] },
  { title: "MDMA", icon: "therapy", description: "MDMA in therapy and in the underground research networks of the 1970s and 80s.", tags: ["Therapy", "Networks"] },
  { title: "DMT", icon: "pharmacology", description: "DMT in plants, synthesis, and the human body.", tags: ["Chemistry", "Consciousness"] },
  { title: "Ibogaine", icon: "addiction", description: "Ibogaine, Bwiti ritual, and the addiction-treatment literature.", tags: ["Addiction", "Pharmacology"] },
  { title: "Anesthesia", icon: "anesthesia", description: "Ether, chloroform, and the history of surgical unconsciousness.", tags: ["Medicine", "Consciousness"] },
  { title: "Animal Research", icon: "clinical", description: "Laboratory studies on nonhuman subjects.", tags: ["Research", "Medicine"] },
  { title: "Psychotherapy", icon: "therapy", description: "Therapy sessions, methods, and case reports.", tags: ["Therapy", "Psychiatry"] },
  { title: "Therapy", icon: "therapy", description: "Clinical use of psychedelics in treatment.", tags: ["Psychiatry", "Medicine"] },
  { title: "Counterculture", icon: "counterculture", description: "Media, scenes, and alternative institutions of the 1960s and 70s.", tags: ["Culture", "Politics"] },
  { title: "Law & Prohibition", icon: "law", description: "Drug control, criminalization, and the politics of policy change.", tags: ["Law", "Policy"] },
  { title: "Law", icon: "law", description: "Trials, testimony, and the regulation of psychoactive substances.", tags: ["Policy", "Public Record"] },
  { title: "Prohibition", icon: "prohibition", description: "Enforcement and restriction of drug use.", tags: ["Law", "Policy"] },
  { title: "Military & Intelligence", icon: "intelligence", description: "Cold War state research and covert drug programs.", tags: ["Military", "Intelligence"] },
  { title: "Military", icon: "military", description: "Military research and medicine in Cold War settings.", tags: ["Government", "Research"] },
  { title: "Intelligence", icon: "intelligence", description: "Intelligence agencies and the behavioral research they funded.", tags: ["Government", "Research"] },
  { title: "Government Research", icon: "intelligence", description: "State-sponsored studies and laboratory programs.", tags: ["Government", "Research"] },
  { title: "MKULTRA", icon: "intelligence", description: "The CIA's mind-control research program and its funding trails.", tags: ["Intelligence", "Government"] },
  { title: "Literature", icon: "literature", description: "Poetry, fiction, and essays written under the influence.", tags: ["Art", "Culture"] },
  { title: "Psychoanalysis", icon: "psychosis", description: "The unconscious, clinical interpretation, and drug-assisted therapy.", tags: ["Therapy", "Psychiatry"] },
  { title: "PTSD", icon: "therapy", description: "Trauma treatment and postwar clinical practice.", tags: ["Therapy", "Medicine"] },
  { title: "ESP", icon: "mysticism", description: "Parapsychology and research on anomalous experience.", tags: ["Consciousness", "Research"] },
  { title: "Human Potential", icon: "networks", description: "Growth movements, institutes, and the people who built them.", tags: ["Networks", "Therapy"] },
  { title: "Botany", icon: "ethnobotany", description: "Plant taxonomy and the global trade in botanical specimens.", tags: ["Ethnobotany", "Research"] },
  { title: "Self-Experiment", icon: "self-experiment", description: "First-person drug trials kept as research records.", tags: ["Experience", "Research"] },
  { title: "Trip Reports", icon: "trip-reports", description: "First-person accounts of visions, insight, and disturbance.", tags: ["Experience", "Consciousness"] },
  { title: "Oral History", icon: "oral-history", description: "Interviews and recorded recollections.", tags: ["Memory", "Culture"] },
  { title: "Set & Setting", icon: "clinical", description: "How context shapes the drug experience.", tags: ["Therapy", "Experience"] },
  { title: "Harm Reduction", icon: "medicine", description: "Public health approaches to drug use.", tags: ["Public Health", "Policy"] },
  { title: "Cybernetics", icon: "networks", description: "Systems theory, feedback, and the experimental communities it shaped.", tags: ["Networks", "Science"] }
];

export default async function TopicsPage() {
  const [sources, curatedTopics] = await Promise.all([
    listArchiveSourceSummariesFromSupabase(),
    listPublicTopics()
  ]);
  const facetCounts = getFacetCounts(sources);
  const visibleTopics = buildVisibleTopics(facetCounts.tags, sources, curatedTopics);
  const tagCloud = buildTagCloud(facetCounts.tags, visibleTopics);

  return (
    <>
      <SiteHeader activeLabel="Topics" />
      <PageShell width="wide" className="py-8">
        <header className="grid gap-5 lg:grid-cols-[minmax(14rem,16rem)_minmax(20rem,36rem)] lg:items-center xl:grid-cols-[minmax(16rem,19rem)_minmax(24rem,40rem)]">
          <h1 className="font-display text-[2.2rem] font-normal leading-none tracking-[-0.00em] text-archive-ink sm:text-[3.5rem]">
            Topics
          </h1>
          <p className="max-w-[32rem] text-[.9rem] leading-7 text-archive-muted">
            Themes, substances, practices, and intellectual traditions across the archive.
          </p>
        </header>

        <TopicsBrowser topics={visibleTopics} />
        <TagCloud tags={tagCloud} />
      </PageShell>
      <SiteFooter />
    </>
  );
}

function buildVisibleTopics(counts: Record<string, number>, sources: ArchiveSource[], curatedTopics: PublicTopicListItem[]): VisibleTopic[] {
  const metadataByKey = new Map(TOPIC_METADATA.map((topic) => [normalizeTopicKey(topic.title), topic]));
  const curatedBySlug = new Map(curatedTopics.map((topic) => [topic.slug, topic]));
  const entries = new Map<string, { count: number; title: string }>();

  Object.entries(counts)
    .filter(([title, count]) => count > 0 && isCoreTopicSlug(topicSlug(title)))
    .forEach(([title, count]) => {
      entries.set(topicSlug(title), { count, title });
    });

  curatedTopics.forEach((topic) => {
    if (!isCoreTopicSlug(topic.slug)) return;
    const existing = entries.get(topic.slug);
    entries.set(topic.slug, {
      count: topic.documentCount || existing?.count || 0,
      title: topic.name
    });
  });

  return [...entries.entries()]
    .filter(([, entry]) => entry.count > 0)
    .sort(([, a], [, b]) => a.title.localeCompare(b.title))
    .map(([slug, entry]) => {
      const curated = curatedBySlug.get(slug);
      const title = curated?.name ?? entry.title;
      const metadata = metadataByKey.get(normalizeTopicKey(title));
      const curatedIds = new Set(curated?.documentIds ?? []);
      const topicSources = (curatedIds.size
        ? sources.filter((source) => curatedIds.has(source.id))
        : sources.filter((source) => source.tags.some((tag) => normalizeTopicKey(tag) === normalizeTopicKey(title)))
      )
        .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))
        .slice(0, 3);
      return {
        title,
        slug,
        href: `/topics/${slug}`,
        icon: iconForTopic(title, curated?.icon || metadata?.icon),
        description: curated?.dek ?? metadata?.description ?? descriptionForTopic(title),
        tags: metadata?.tags ?? fallbackTagsForTopic(title),
        sources: topicSources.map((source) => ({
          title: source.title,
          href: `/archive/${source.slug}`,
          displayDate: source.displayDate,
          type: source.type
        })),
        count: entry.count
      };
    });
}

function buildTagCloud(counts: Record<string, number>, visibleTopics: VisibleTopic[]): TagCloudItem[] {
  const visibleSlugs = new Set(visibleTopics.map((topic) => topic.slug));

  return Object.entries(counts)
    .filter(([title, count]) => count > 0 && shouldShowTagCloudTag(title) && !visibleSlugs.has(topicSlug(title)))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 80)
    .map(([title, count]) => ({
      title,
      count,
      href: topicHref(title)
    }));
}

function shouldShowTagCloudTag(title: string) {
  const normalized = title.trim();
  if (!normalized) return false;
  if (/^\d{3,4}$/.test(normalized)) return false;
  if (/^\d{4}s$/.test(normalized)) return false;
  if (/^ca\.?\s*\d+/i.test(normalized)) return false;
  return true;
}

function TagCloud({ tags }: { tags: TagCloudItem[] }) {
  if (!tags.length) return null;

  return (
    <section className="mt-10 border-t border-archive-line pt-7">
      <div className="grid gap-5 lg:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)]">
        <div>
          <h2 className="source-serif-heading">Specific Tags</h2>
          <p className="mt-2 text-sm leading-6 text-archive-muted">
            Additional labels used on source records. These pages are generated from current tags and list matching sources without implying a curated editorial topic.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <a className="focus-ring inline-flex min-h-8 items-center rounded-full border border-archive-line bg-archive-surface px-3 py-1 text-xs font-semibold text-archive-muted transition hover:border-archive-violet/35 hover:bg-archive-lavender2 hover:text-archive-violetDark" href={tag.href} key={tag.title}>
              {tag.title}
              <span className="ml-2 rounded-full bg-archive-paper px-1.5 py-0.5 font-mono text-[0.65rem] text-archive-muted">{tag.count}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function normalizeTopicKey(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function iconForTopic(topic: string, fallbackIcon?: string) {
  const key = normalizeTopicKey(topic);
  const exactIcons = getTopicIconKeys();

  if (exactIcons.has(key)) return key;
  if (fallbackIcon && exactIcons.has(fallbackIcon)) return fallbackIcon;
  if (/(ayahuasca|botany|plant|kava|virola|piper|caapi|ethno)/.test(key)) return "ethnobotany";
  if (/(dmt|harmala|harmaline|kavalactone|chem|pharma)/.test(key)) return "pharmacology";
  if (/(indigenous|tukano|yaje|yomane|ritual|shaman)/.test(key)) return "indigenous-knowledge";
  if (/(psychoanalysis|psychology|psychiatry)/.test(key)) return "psychiatry";
  if (/(religion|mystic|spiritual)/.test(key)) return "religious-experience";
  if (/(military|mkultra|government|intelligence)/.test(key)) return "intelligence";
  if (/(law|trial|prohibition|policy)/.test(key)) return "law";
  if (/(art|visual|vision)/.test(key)) return "visual-culture";
  if (/(oral|interview|recording)/.test(key)) return "oral-history";
  return "networks";
}

function getTopicIconKeys() {
  if (!existsSync(TOPIC_ICON_DIR)) return new Set<string>();

  return new Set(
    readdirSync(TOPIC_ICON_DIR)
      .filter((file) => file.toLowerCase().endsWith(".png"))
      .map((file) => normalizeTopicKey(file.replace(/\.png$/i, "")))
  );
}

function descriptionForTopic(topic: string) {
  return `Sources connected to ${topic.toLowerCase()} across the archive.`;
}

function fallbackTagsForTopic(topic: string) {
  const key = normalizeTopicKey(topic);
  if (/(ayahuasca|cannabis|dmt|kava|mescal|nitrous|psilocybin|virola)/.test(key)) return ["Substance", "Research"];
  if (/(brazil|chile|colombia|goa|india|melanesia|micronesia|polynesia|south-america|vaupes)/.test(key)) return ["Region", "Context"];
  if (/(james|leary|mead|cohen|lilly|abramson|fabing)/.test(key)) return ["People", "Networks"];
  return ["Topic"];
}
