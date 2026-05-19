import { topicSlug } from "@/lib/internal-links";

export const CORE_TOPIC_NAMES = [
  "Ayahuasca",
  "Kava",
  "Psilocybin",
  "Nitrous Oxide",
  "Mescaline",
  "Mysticism",
  "Ethnobotany",
  "Cannabis",
  "Pharmacology",
  "Chemistry",
  "Clinical",
  "Indigenous Knowledge",
  "Anthropology",
  "Consciousness",
  "Psychology",
  "Addiction",
  "LSD",
  "DMT",
  "Anesthesia",
  "Therapy",
  "Counterculture",
  "Law",
  "Military",
  "Intelligence",
  "Government Research",
  "MKULTRA",
  "Literature",
  "Psychoanalysis",
  "PTSD",
  "Oral History"
];

export const CORE_TOPIC_SLUGS = new Set(CORE_TOPIC_NAMES.map((name) => topicSlug(name)));

export function isCoreTopicSlug(slug: string) {
  return CORE_TOPIC_SLUGS.has(slug);
}
