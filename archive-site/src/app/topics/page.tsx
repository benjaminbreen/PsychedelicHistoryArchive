import type { Metadata } from "next";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/page/page-shell";
import { getFacetCounts } from "@/lib/archive-query";
import { getArchiveSourcesFromSupabase } from "@/lib/supabase-archive";
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

export type VisibleTopic = TopicCard & {
  count: number;
};

const TOPIC_METADATA: TopicCard[] = [
  {
    title: "Ayahuasca",
    icon: "ethnobotany",
    description: "Amazonian brew traditions, ceremony, and cross-cultural studies.",
    tags: ["Shamanism", "Indigenous Knowledge"]
  },
  {
    title: "Kava",
    icon: "ethnobotany",
    description: "Pacific kava traditions, preparation, chemistry, and pharmacology.",
    tags: ["Ethnobotany", "Pharmacology"]
  },
  {
    title: "Psilocybin",
    icon: "psilocybin",
    description: "Psilocybin mushrooms, effects, history, and contemporary research.",
    tags: ["Pharmacology", "Consciousness"]
  },
  {
    title: "Nitrous Oxide",
    icon: "nitrous-oxide",
    description: "Recreational, medical, and philosophical uses of laughing gas.",
    tags: ["Chemistry", "Medicine"]
  },
  {
    title: "Mescaline",
    icon: "mescaline",
    description: "Peyote and related cacti in ritual, religion, and research contexts.",
    tags: ["Ethnobotany", "Religion"]
  },
  {
    title: "Mysticism",
    icon: "mysticism",
    description: "Mystical experience, imagination, and the quest for ultimate meaning.",
    tags: ["Religion", "Consciousness"]
  },
  {
    title: "Psychiatry",
    icon: "psychiatry",
    description: "Psychedelics in clinical practice, therapy, and mental health research.",
    tags: ["Medicine", "Therapy"]
  },
  {
    title: "Shamanism",
    icon: "shamanism",
    description: "Shamanic traditions, altered states, and healing practices worldwide.",
    tags: ["Indigenous Knowledge", "Ritual"]
  },
  {
    title: "Religious Experience",
    icon: "religious-experience",
    description: "Sacred visions, ecstasy, and entheogenic perspectives across traditions.",
    tags: ["Religion", "Consciousness"]
  },
  {
    title: "Ethnobotany",
    icon: "ethnobotany",
    description: "Plants, fungi, and their cultural contexts across human societies.",
    tags: ["Botany", "Indigenous Knowledge"]
  },
  {
    title: "Cannabis",
    icon: "cannabis",
    description: "History, culture, medicine, and policy of Cannabis sativa.",
    tags: ["Pharmacology", "Law"]
  },
  {
    title: "Pharmacology",
    icon: "pharmacology",
    description: "Chemical compounds, drug action, and pharmacological research.",
    tags: ["Chemistry", "Research"]
  },
  {
    title: "Chemistry",
    icon: "pharmacology",
    description: "Synthesis, analysis, isolation, and structure of psychoactive compounds.",
    tags: ["Pharmacology", "Research"]
  },
  {
    title: "Clinical",
    icon: "clinical",
    description: "Clinical reports, hospital settings, patient observation, and medical trials.",
    tags: ["Medicine", "Research"]
  },
  {
    title: "Indigenous Knowledge",
    icon: "indigenous-knowledge",
    description: "Traditional knowledge systems, oral histories, and cultural heritage.",
    tags: ["Culture", "Oral History"]
  },
  {
    title: "Anthropology",
    icon: "indigenous-knowledge",
    description: "Ethnographic fieldwork, cultural interpretation, and cross-cultural encounter.",
    tags: ["Culture", "Research"]
  },
  {
    title: "Visionary Art",
    icon: "visionary-art",
    description: "Art, aesthetics, and visual cultures of altered states.",
    tags: ["Art", "Culture"]
  },
  {
    title: "Consciousness",
    icon: "consciousness",
    description: "The nature of mind, perception, and states of consciousness.",
    tags: ["Philosophy", "Neuroscience"]
  },
  {
    title: "Psychology",
    icon: "psychiatry",
    description: "Perception, emotion, behavior, and subjective effects in psychological research.",
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
    description: "Ceremony, rites, and symbolic practice across cultures.",
    tags: ["Ritual", "Culture"]
  },
  { title: "LSD", icon: "lsd", description: "Discovery, research, therapy, counterculture, and policy after 1943.", tags: ["Chemistry", "Therapy"] },
  { title: "MDMA", icon: "therapy", description: "Therapy, underground practice, research networks, and revival.", tags: ["Therapy", "Networks"] },
  { title: "DMT", icon: "pharmacology", description: "Plant, synthetic, and endogenous debates around visionary experience.", tags: ["Chemistry", "Consciousness"] },
  { title: "Ibogaine", icon: "addiction", description: "Treatment claims, ritual contexts, and addiction research.", tags: ["Addiction", "Pharmacology"] },
  { title: "Anesthesia", icon: "anesthesia", description: "Ether, chloroform, nitrous oxide, and altered consciousness.", tags: ["Medicine", "Consciousness"] },
  { title: "Animal Research", icon: "clinical", description: "Laboratory studies involving nonhuman subjects and behavioral observation.", tags: ["Research", "Medicine"] },
  { title: "Psychotherapy", icon: "therapy", description: "Therapeutic method, clinical settings, and session reports.", tags: ["Therapy", "Psychiatry"] },
  { title: "Therapy", icon: "therapy", description: "Therapeutic use, treatment claims, clinical practice, and session reports.", tags: ["Psychiatry", "Medicine"] },
  { title: "Counterculture", icon: "counterculture", description: "Media, scenes, politics, and alternative institutions.", tags: ["Culture", "Politics"] },
  { title: "Law & Prohibition", icon: "law", description: "Drug control, criminalization, trials, and policy change.", tags: ["Law", "Policy"] },
  { title: "Law", icon: "law", description: "Trials, testimony, regulation, criminalization, and legal conflict.", tags: ["Policy", "Public Record"] },
  { title: "Prohibition", icon: "prohibition", description: "Drug control, enforcement, restriction, and policy change.", tags: ["Law", "Policy"] },
  { title: "Military & Intelligence", icon: "intelligence", description: "Cold War research, state projects, and covert programs.", tags: ["Military", "Intelligence"] },
  { title: "Military", icon: "military", description: "Military research, medicine, testing, and Cold War institutional settings.", tags: ["Government", "Research"] },
  { title: "Intelligence", icon: "intelligence", description: "Intelligence agencies, covert programs, and behavioral research networks.", tags: ["Government", "Research"] },
  { title: "Government Research", icon: "intelligence", description: "State-sponsored studies, laboratories, programs, and institutional oversight.", tags: ["Government", "Research"] },
  { title: "MKULTRA", icon: "intelligence", description: "CIA-linked mind-control research, funding trails, and covert experiments.", tags: ["Intelligence", "Government"] },
  { title: "Literature", icon: "literature", description: "Poetry, fiction, essays, and altered-state writing.", tags: ["Art", "Culture"] },
  { title: "Psychoanalysis", icon: "psychosis", description: "Unconscious life, clinical interpretation, and drug-assisted therapy.", tags: ["Therapy", "Psychiatry"] },
  { title: "PTSD", icon: "therapy", description: "Trauma treatment, narcosynthesis, and postwar clinical practice.", tags: ["Therapy", "Medicine"] },
  { title: "ESP", icon: "mysticism", description: "Parapsychology, extrasensory perception, and anomalous experience research.", tags: ["Consciousness", "Research"] },
  { title: "Human Potential", icon: "networks", description: "Growth movements, institutes, experiments, and networks.", tags: ["Networks", "Therapy"] },
  { title: "Botany", icon: "ethnobotany", description: "Plant taxonomy, collection, identification, and botanical exchange.", tags: ["Ethnobotany", "Research"] },
  { title: "Self-Experiment", icon: "self-experiment", description: "First-person trials, observations, and embodied research practices.", tags: ["Experience", "Research"] },
  { title: "Trip Reports", icon: "trip-reports", description: "Subjective accounts of visions, insight, fear, and transformation.", tags: ["Experience", "Consciousness"] },
  { title: "Oral History", icon: "oral-history", description: "Interviews, recollections, testimony, and remembered experience.", tags: ["Memory", "Culture"] },
  { title: "Set & Setting", icon: "clinical", description: "Context, expectation, environment, and social framing of experience.", tags: ["Therapy", "Experience"] },
  { title: "Harm Reduction", icon: "medicine", description: "Safety, education, care, and public health approaches.", tags: ["Public Health", "Policy"] },
  { title: "Cybernetics", icon: "networks", description: "Systems theory, feedback, mind, and experimental communities.", tags: ["Networks", "Science"] }
];

export default async function TopicsPage() {
  const sources = await getArchiveSourcesFromSupabase();
  const facetCounts = getFacetCounts(sources);
  const visibleTopics = buildVisibleTopics(facetCounts.tags);

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
      </PageShell>
      <SiteFooter />
    </>
  );
}

function buildVisibleTopics(counts: Record<string, number>): VisibleTopic[] {
  const metadataByKey = new Map(TOPIC_METADATA.map((topic) => [normalizeTopicKey(topic.title), topic]));

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, count]) => {
      const metadata = metadataByKey.get(normalizeTopicKey(title));
      return {
        title,
        icon: iconForTopic(title, metadata?.icon),
        description: metadata?.description ?? descriptionForTopic(title),
        tags: metadata?.tags ?? fallbackTagsForTopic(title),
        count
      };
    });
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
