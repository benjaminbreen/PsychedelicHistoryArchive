import type { ArchiveSource, FacetOption } from "@/lib/types";

export const sources: ArchiveSource[] = [
  {
    id: "james_1882_subjective_effects_nitrous_oxide",
    slug: "william-james-subjective-effects-nitrous-oxide",
    title: "Subjective Effects of Nitrous Oxide",
    author: "William James",
    year: 1882,
    displayDate: "1882",
    type: "Academic Article",
    medium: "Text",
    era: "1800-1950",
    region: "United States",
    language: "English",
    tags: ["Nitrous Oxide", "Psychology", "Altered States"],
    people: ["William James"],
    substances: ["nitrous oxide"],
    summary:
      "James's direct report of nitrous oxide intoxication and the classic formulation of metaphysical illumination.",
    excerpt:
      "The keynote of the experience is the tremendously exciting sense of an intense metaphysical illumination.",
    citation:
      "James, William. \"Subjective Effects of Nitrous Oxide.\" 1882.",
    publicationTitle: "The Popular Science Monthly",
    rights: "Pre-1930 public-domain text; web transcription.",
    sourceUrl: "https://www.cs.cmu.edu/~ehn/release/nitrous.html",
    accessType: "hosted",
    hostingStatus: "transcript_only",
    wordCount: 1355,
    addedDate: "May 13, 2026",
    featured: true,
    imageTone: "paper",
    imagePath: "/images/sources/william-james-self-portrait.jpg",
    imageAlt: "William James self-portrait"
  },
  {
    id: "james_1898_consciousness_under_nitrous_oxide",
    slug: "consciousness-under-nitrous-oxide",
    title: "Consciousness Under Nitrous Oxide",
    author: "Anonymous English correspondent, introduced by William James",
    year: 1898,
    displayDate: "1898",
    type: "Academic Article",
    medium: "Text",
    era: "1800-1950",
    region: "United Kingdom",
    language: "English",
    tags: ["Nitrous Oxide", "Consciousness", "Altered States"],
    people: ["William James", "Anonymous Oxford correspondent"],
    substances: ["nitrous oxide"],
    summary:
      "A Victorian first-person report of dental nitrous oxide intoxication, intellectual ecstasy, moral ecstasy, and lost insight.",
    excerpt:
      "I knew everything! A vast inrush of obvious and absolutely satisfying solutions to all possible problems overwhelmed my entire being.",
    citation:
      "James, William, ed. \"Consciousness Under Nitrous Oxide.\" Psychological Review 5, no. 2 (1898): 194-196.",
    publicationTitle: "Psychological Review",
    rights: "Needs primary page verification before authoritative quotation.",
    sourceUrl: "Psychological Review 5(2):194-196",
    accessType: "hosted",
    hostingStatus: "transcript_only",
    wordCount: 910,
    addedDate: "May 13, 2026",
    imageTone: "clinical",
    imagePath: "/images/sources/william-james-young.jpg",
    imageAlt: "Portrait of William James by John La Farge"
  },
  {
    id: "blood_1874_anaesthetic_revelation",
    slug: "anaesthetic-revelation-gist-of-philosophy",
    title: "The Anaesthetic Revelation and the Gist of Philosophy",
    author: "Benjamin Paul Blood",
    year: 1874,
    displayDate: "1874",
    type: "Book",
    medium: "Text",
    era: "1800-1950",
    region: "United States",
    language: "English",
    tags: ["Anaesthetics", "Mysticism", "Philosophy"],
    people: ["Benjamin Paul Blood", "William James"],
    substances: ["nitrous oxide", "ether", "anaesthetics"],
    summary:
      "The text that gave James the phrase and problem of anesthesia as an incommunicable metaphysical revelation.",
    excerpt:
      "A discovery unutterable by any, yet accessible to all, and of singular interest if not of novel instance.",
    citation:
      "Blood, Benjamin Paul. The Anaesthetic Revelation and the Gist of Philosophy. Amsterdam, New York, 1874.",
    rights: "Public domain scan/OCR via Internet Archive.",
    sourceUrl:
      "https://archive.org/download/anstheticrevela00bloogoog/anstheticrevela00bloogoog_djvu.txt",
    accessType: "external",
    hostingStatus: "external_link",
    wordCount: 13056,
    addedDate: "May 12, 2026",
    imageTone: "letter",
    imagePath: "/images/sources/anaesthetic-revelation.jpg",
    imageAlt: "Internet Archive thumbnail for The Anaesthetic Revelation and the Gist of Philosophy"
  },
  {
    id: "davy_1800_researches_nitrous_oxide",
    slug: "researches-chemical-philosophical-nitrous-oxide",
    title: "Researches, Chemical and Philosophical; Chiefly Concerning Nitrous Oxide",
    author: "Humphry Davy",
    year: 1800,
    displayDate: "1800",
    type: "Book",
    medium: "Text",
    era: "1800-1950",
    region: "United Kingdom",
    language: "English",
    tags: ["Nitrous Oxide", "Chemistry", "Self-Experiment"],
    people: ["Humphry Davy"],
    substances: ["nitrous oxide"],
    summary:
      "Foundational first-person and observer reports of nitrous oxide intoxication, euphoria, analgesia, and metaphysical-seeming insight.",
    excerpt:
      "Nothing exists but thoughts! The universe is composed of impressions, ideas, pleasures and pains.",
    citation:
      "Davy, Humphry. Researches, Chemical and Philosophical; Chiefly Concerning Nitrous Oxide. London, 1800.",
    rights: "Public domain in the United States; Project Gutenberg text.",
    sourceUrl: "https://www.gutenberg.org/ebooks/66955",
    accessType: "external",
    hostingStatus: "external_link",
    wordCount: 96723,
    addedDate: "May 12, 2026",
    imageTone: "paper",
    imagePath: "/images/sources/humphry-davy.jpg",
    imageAlt: "Portrait of Humphry Davy"
  },
  {
    id: "james_1874_review_blood",
    slug: "william-james-review-anaesthetic-revelation",
    title: "Review of The Anaesthetic Revelation and the Gist of Philosophy",
    author: "William James",
    year: 1874,
    displayDate: "1874",
    type: "Essay",
    medium: "Text",
    era: "1800-1950",
    region: "United States",
    language: "English",
    tags: ["Anaesthetics", "Philosophy", "Review Essay"],
    people: ["William James", "Benjamin Paul Blood"],
    substances: ["nitrous oxide", "anaesthetics"],
    summary:
      "James's first published encounter with Blood's anesthetic mysticism, before James's own nitrous experiments.",
    excerpt:
      "What we are, we are; and the present has its terms and boundaries, however fluent these may seem.",
    citation:
      "James, William. Review of The Anaesthetic Revelation and the Gist of Philosophy. 1874.",
    rights: "Original Atlantic Monthly text is public domain; web transcription.",
    sourceUrl:
      "https://selfdefinition.org/psychology/articles/james-review-anaesthetic-revelation-gist-of-philosophy.htm",
    accessType: "external",
    hostingStatus: "external_link",
    wordCount: 1138,
    addedDate: "May 11, 2026",
    imageTone: "portrait"
  },
  {
    id: "bigelow_1846_ether_patient_dream_reports",
    slug: "ether-patient-dream-reports",
    title: "Patient Dream Reports Under Ether",
    author: "Dental patients reported by Henry J. Bigelow",
    year: 1846,
    displayDate: "1846",
    type: "Patient Report",
    medium: "Text",
    era: "1800-1950",
    region: "United States",
    language: "English",
    tags: ["Ether", "Dreams", "Medicine"],
    people: ["Henry J. Bigelow"],
    substances: ["sulphuric ether"],
    summary:
      "Reported utterances about dreams, altered time, pleasure, and painless extraction under ether anesthesia.",
    excerpt:
      "Contains direct patient utterances about dreams, pleasure, altered time, and painless extraction.",
    citation:
      "Bigelow, Henry J. \"Insensibility During Surgical Operations Produced by Inhalation.\" 1846.",
    rights: "Manually entered from public source.",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10424980/",
    accessType: "external",
    hostingStatus: "external_link",
    wordCount: 439,
    addedDate: "May 10, 2026",
    imageTone: "clinical"
  },
  {
    id: "simpson_1847_chloroform_self_experiment",
    slug: "simpson-chloroform-self-experiment",
    title: "Chloroform Self-Experiment Circle",
    author: "James Young Simpson",
    year: 1847,
    displayDate: "1847",
    type: "Medical Report",
    medium: "Text",
    era: "1800-1950",
    region: "United Kingdom",
    language: "English",
    tags: ["Chloroform", "Self-Experiment", "Medicine"],
    people: ["James Young Simpson"],
    substances: ["chloroform"],
    summary:
      "A report of early chloroform self-experimentation and the domestic testing circle around Simpson.",
    excerpt:
      "The first trials of chloroform were conducted in a setting that blurred medicine, domestic experiment, and revelation.",
    citation:
      "Simpson, James Young. Chloroform self-experiment report. 1847.",
    rights: "Public domain historical medical source.",
    sourceUrl: "texts/first_hand/09_simpson_1847_chloroform_self_experiment.txt",
    accessType: "hosted",
    hostingStatus: "transcript_only",
    wordCount: 650,
    addedDate: "May 9, 2026",
    imageTone: "letter"
  }
];

export const eraFacets: FacetOption[] = [
  { label: "Pre-1800", count: 841, href: "/archive?era=Pre-1800" },
  { label: "1800-1950", count: 3305, href: "/archive?era=1800-1950" },
  { label: "1950-1970", count: 2189, href: "/archive?era=1950-1970" },
  { label: "1970-2000", count: 1742, href: "/archive?era=1970-2000" },
  { label: "2000-Present", count: 912, href: "/archive?era=2000-Present" }
];

export const mediumFacets: FacetOption[] = [
  { label: "Text", count: 12482, href: "/archive?medium=Text" },
  { label: "Images", count: 6231, href: "/archive?medium=Image" },
  { label: "Audio/Video", count: 1286, href: "/archive?medium=Audio%2FVideo" },
  { label: "Personal Histories", count: 2187, href: "/archive?medium=Personal%20History" },
  { label: "Biographies", count: 1134, href: "/people" },
  { label: "Further Reading", count: 2345, href: "/further-reading" }
];

export const featuredCollections = [
  {
    title: "William James and Altered States",
    description:
      "Writings and correspondence on psychology, religion, and altered consciousness.",
    href: "/collections/william-james-altered-states",
    imageTone: "portrait" as const
  },
  {
    title: "The Anaesthetic Revelation",
    description:
      "Nitrous oxide, ether, chloroform, and the problem of incommunicable insight.",
    href: "/collections/anaesthetic-revelation",
    imageTone: "paper" as const
  },
  {
    title: "Clinical Reports and Self-Experiment",
    description:
      "Medical reports, dental anesthesia, patient dreams, and early physiological observation.",
    href: "/collections/clinical-reports",
    imageTone: "clinical" as const
  },
  {
    title: "Philosophy After Intoxication",
    description:
      "Texts connecting anesthetic states to metaphysics, pluralism, and religious experience.",
    href: "/collections/philosophy-after-intoxication",
    imageTone: "letter" as const
  }
];
