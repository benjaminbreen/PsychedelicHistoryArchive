import type { ArchiveSource } from "@/lib/types";

export type BiographyProfile = {
  name: string;
  slug: string;
  years?: string;
  dek?: string;
  imagePath?: string;
  imageAlt?: string;
  imageCaption?: string;
  tags: string[];
  facts: Array<{ label: string; value: string }>;
  paragraphs: string[];
  sourceNotes?: string[];
  relatedSources?: string[];
  publications?: string[];
  collaborators?: string[];
};

type BiographyPortrait = {
  imagePath: string;
  imageAlt: string;
};

type BiographyDirectoryMetadata = {
  years: string;
  role: string;
  tags: string[];
};

const excludedBiographyNames = new Set([
  "bebreen@ucsc.edu",
  "Burroughs Wellcome & Co."
]);

const canonicalPersonNames: Record<string, string> = {
  "Edward Wheeler Scripture (1864 – 1945)": "Edward Wheeler Scripture",
  "Fitz Hugh Ludlow (1836-1870)": "Fitz Hugh Ludlow",
  "Luisa de Álvarez de Toledo (with case studies contributed by Alberto E. Fontana and Francisco Perez Morales)": "Luisa de Álvarez de Toledo",
  "Timothy Leary (1920-1996)": "Timothy Leary",
  "William James (1842-1910)": "William James"
};

const biographyDirectoryMetadata: Record<string, BiographyDirectoryMetadata> = {
  "benjamin-paul-blood": {
    years: "1832-1919",
    role: "Philosopher, Mystic",
    tags: ["Philosophy", "Mysticism"]
  },
  "claudio-naranjo": {
    years: "1932-2019",
    role: "Psychiatrist, Researcher",
    tags: ["Chile", "Ayahuasca", "Ethnopharmacology"]
  },
  "edward-wheeler-scripture": {
    years: "1864-1945",
    role: "Physician, Psychologist",
    tags: ["Psychology", "Speech Science"]
  },
  "efren-carlos-del-pozo": {
    years: "1907-1979",
    role: "Physician, Historian",
    tags: ["Pharmacology", "Mexico"]
  },
  "fitz-hugh-ludlow": {
    years: "1836-1870",
    role: "Writer, Explorer",
    tags: ["Literature", "Cannabis"]
  },
  "franz-xaver-veigl": {
    years: "1723-1798",
    role: "Jesuit, Missionary",
    tags: ["Amazonia", "Ethnobotany"]
  },
  "george-draper": {
    years: "1915-1992",
    role: "Journalist",
    tags: ["Journalism", "Counterculture"]
  },
  "humphry-davy": {
    years: "1778-1829",
    role: "Chemist, Inventor",
    tags: ["Chemistry", "Nitrous Oxide"]
  },
  "john-c-lilly": {
    years: "1915-2001",
    role: "Neuroscientist, Writer",
    tags: ["Neuroscience", "Consciousness"]
  },
  "luisa-de-alvarez-de-toledo": {
    years: "1915-1990",
    role: "Psychoanalyst, Physician",
    tags: ["Psychoanalysis", "LSD"]
  },
  "margaret-mead": {
    years: "1901-1978",
    role: "Anthropologist",
    tags: ["Anthropology", "Culture"]
  },
  "myron-stolaroff": {
    years: "1920-2013",
    role: "Engineer, Researcher",
    tags: ["Psychedelics", "Therapy"]
  },
  "sidney-cohen": {
    years: "1910-1987",
    role: "Psychiatrist, Author",
    tags: ["LSD", "Psychiatry"]
  },
  "timothy-leary": {
    years: "1920-1996",
    role: "Psychologist, Author",
    tags: ["LSD", "Counterculture"]
  },
  "william-james": {
    years: "1842-1910",
    role: "Philosopher, Psychologist",
    tags: ["Psychology", "Philosophy"]
  }
};

const biographyPortraits: Record<string, BiographyPortrait> = {
  "benjamin-paul-blood": {
    imagePath: "/images/bios/benjamin-paul-blood.webp",
    imageAlt: "Portrait of Benjamin Paul Blood"
  },
  "claudio-naranjo": {
    imagePath: "/images/bios/claudio-naranjo.jpg",
    imageAlt: "Portrait of Claudio Naranjo"
  },
  "edward-wheeler-scripture": {
    imagePath: "/images/bios/edward-wheeler-scripture.webp",
    imageAlt: "Portrait of Edward Wheeler Scripture"
  },
  "efren-carlos-del-pozo": {
    imagePath: "/images/bios/efren-carlos-del-pozo.webp",
    imageAlt: "Portrait of Efrén Carlos del Pozo"
  },
  "fitz-hugh-ludlow": {
    imagePath: "/images/bios/fitz-hugh-ludlow.webp",
    imageAlt: "Portrait of Fitz Hugh Ludlow"
  },
  "humphry-davy": {
    imagePath: "/images/bios/humphry-davy.webp",
    imageAlt: "Portrait of Humphry Davy"
  },
  "john-c-lilly": {
    imagePath: "/images/bios/john-c-lilly.webp",
    imageAlt: "Portrait of John C. Lilly"
  },
  "luisa-de-alvarez-de-toledo": {
    imagePath: "/images/bios/luisa-de-alvarez-de-toledo.webp",
    imageAlt: "Portrait of Luisa de Álvarez de Toledo"
  },
  "margaret-mead": {
    imagePath: "/images/bios/margaret-mead.webp",
    imageAlt: "Portrait of Margaret Mead"
  },
  "myron-stolaroff": {
    imagePath: "/images/bios/myron-stolaroff.webp",
    imageAlt: "Portrait of Myron Stolaroff"
  },
  "sidney-cohen": {
    imagePath: "/images/bios/sidney-cohen.webp",
    imageAlt: "Portrait of Sidney Cohen"
  },
  "timothy-leary": {
    imagePath: "/images/bios/timothy-leary.webp",
    imageAlt: "Portrait of Timothy Leary"
  },
  "william-james": {
    imagePath: "/images/bios/william-james.webp",
    imageAlt: "Portrait of William James"
  }
};

export const biographyProfiles: BiographyProfile[] = [
  {
    name: "Claudio Naranjo",
    slug: "claudio-naranjo",
    years: "1932-2019",
    dek: "Chilean psychiatrist, psychotherapist, and writer whose early psychedelic research connected South American ayahuasca traditions, harmala chemistry, and experimental psychotherapy.",
    imagePath: "/images/bios/claudio-naranjo.jpg",
    imageAlt: "Portrait of Claudio Naranjo",
    imageCaption: "Claudio Naranjo in 2007. Photograph by Alessandra Callegari, Wikimedia Commons, CC0.",
    tags: ["Chile", "Ayahuasca", "Harmala Alkaloids", "Ethnopharmacology", "Psychotherapy", "Transpersonal Psychology"],
    facts: [
      { label: "Born", value: "November 24, 1932\nValparaiso, Chile" },
      { label: "Died", value: "July 12, 2019\nBerkeley, California" },
      { label: "Occupation", value: "Psychiatrist, psychotherapist, writer" },
      { label: "Region", value: "Chile; United States" },
      { label: "Known for", value: "Harmala alkaloid research; Gestalt therapy; Enneagram of personality; transpersonal psychology" }
    ],
    paragraphs: [
      "Born in Valparaiso, Chile in 1932, Claudio Naranjo trained in medicine at the University of Chile and became part of a mid-century Chilean psychiatric and medical anthropology milieu that treated altered states as a serious object of clinical and cultural research. His early work linked psychiatry, anthropology, and psychopharmacology at a moment when LSD, mescaline, harmaline, and ayahuasca were still being studied in formal scientific settings.",
      "Naranjo's 1967 paper on the psychotropic properties of harmala alkaloids emerged from this context. Written from the Department of Anthropological Medicine at the University of Chile, it compared harmaline and related beta-carbolines with mescaline, drew on reports of Banisteriopsis use in South America, and described human experiments with volunteers. The paper is especially valuable because it places ayahuasca-related chemistry inside a Latin American research setting rather than treating the Amazon only as a distant ethnographic source for European or North American science.",
      "After leaving Chile, Naranjo became associated with the Esalen Institute and the wider human potential movement in California. His later career moved across Gestalt therapy, personality psychology, education, and transpersonal thought, but his psychedelic-era writings remain important evidence for the international networks that connected South American psychiatry, ethnobotany, and the first wave of psychedelic science.",
      "For the archive, Naranjo is useful as a bridge figure: he was not only a commentator on ayahuasca but also a clinician and experimenter who tried to describe how specific alkaloids shaped imagery, bodily feeling, introspection, and therapeutic possibility. His work helps widen the map beyond the better-known Anglo-American and European centers of psychedelic research."
    ],
    sourceNotes: [
      "Naranjo, Claudio. \"Psychotropic Properties of the Harmala Alkaloids,\" in Ethnopharmacologic Search for Psychoactive Drugs, 1967.",
      "PubMed record for \"Ayahuasca, caapi, yage. Psychotropic properties of the harmala alkaloids,\" Psychopharmacology Bulletin 4, no. 3 (December 1967): 16-17.",
      "Wikimedia Commons, \"Claudio Naranjo close-up (cropped).JPG,\" photograph by Alessandra Callegari, CC0."
    ]
  },
  {
    name: "Efrén Carlos del Pozo",
    slug: "efren-carlos-del-pozo",
    years: "1907-1979",
    dek: "Mexican physician, scientist and historian who made significant contributions to the fields of physiology, pharmacology, and the history of medicine.",
    imagePath: "/images/bios/efren-carlos-del-pozo.webp",
    imageAlt: "Portrait of Efrén Carlos del Pozo",
    imageCaption: "Del Pozo in 1941, via the Guggenheim Foundation.",
    tags: ["Physiology", "Pharmacology", "History of Medicine", "Mexico", "Indigenous Histories"],
    facts: [
      { label: "Born", value: "September 11, 1907\nSan Luis Potosí, Mexico" },
      { label: "Died", value: "May 14, 1979\nMexico City" },
      { label: "Occupation", value: "Physician, scientist, historian" },
      { label: "Region", value: "Mexico" },
      { label: "Known for", value: "Research in physiology and pharmacology; history of medicine in Mexico" }
    ],
    paragraphs: [
      "Born on September 11, 1907 in San Luis Potosí, Mexico, Efrén C. del Pozo completed his early studies at the Autonomous University of San Luis Potosí (UASLP), where he also served as a professor and secretary. He went on to earn his medical degree from the National Autonomous University of Mexico (UNAM) in 1936.",
      "Del Pozo pursued advanced studies in physiology at Harvard Medical School from 1940-1943 under the mentorship of physiologist Walter B. Cannon. He also worked as an associate researcher at the National Institute for Medical Research in London in 1947. Upon returning to Mexico, del Pozo held positions at various institutions, including the National Polytechnic Institute (IPN), UNAM, and the Ministry of Health. He was a founding member of the National School of Biological Sciences at IPN and the Mexican Society of Physiological Sciences.",
      "As a researcher, del Pozo made notable contributions to the study of human physiology and pharmacology. He conducted early experiments on the effects of ethnobotanical specimens and traditional Aztec and Mayan medicines, including psychoactive plants. In 1959, American researcher Frank Barron participated in del Pozo's trials with psilocybin mushrooms in Mexico City, observing their effects on creativity. As Timothy Leary later recalled, it was Barron's account of this experience that triggered Leary's own interest in psychedelics.",
      "Del Pozo was also a prominent historian of medicine. He played a key role in the publication of two seminal works of 16th-century Mexican medicine: the 1552 Badianus Manuscript, Libellus de Medicinalibus Indorum Herbis, in 1964, and the complete works of Francisco Hernandez, published between 1960 and 1984. These efforts helped preserve and bring attention to the rich history of Indigenous medical knowledge in Mexico.",
      "From 1953 to 1961, del Pozo served as Secretary General of UNAM, working alongside rector Nabor Carrillo. In this role, he helped establish the University City campus and modernize the institution's academic and research programs. Del Pozo was also President of the National Academy of Medicine in 1961 and Secretary General of the Union of Latin American Universities.",
      "Throughout his career, del Pozo was known as a dedicated mentor and advocate for scientific research in Mexico. Efrén C. del Pozo passed away on May 14, 1979 in Mexico City."
    ],
    sourceNotes: [
      "Del Pozo, \"Empiricism and magic in Aztec pharmacology,\" in The Ethnopharmacologic Search for Psychoactive Drugs, 1967.",
      "Benjamin Breen, Tripping on Utopia: Margaret Mead, the Cold War, and the Troubled Birth of Psychedelic Science, 2024."
    ],
    relatedSources: [
      "Del Pozo, E. C. \"Empiricism and magic in Aztec pharmacology,\" 1967.",
      "Badianus Manuscript / Libellus de Medicinalibus Indorum Herbis, 1552; edited and published with Del Pozo's involvement in 1964.",
      "Francisco Hernandez corpus on New Spain medicine, published in editions associated with Del Pozo's historical-medical work."
    ],
    publications: [
      "La historia de la medicina en Mexico.",
      "Estudios sobre fisiologia del sueno.",
      "\"Empiricism and magic in Aztec pharmacology,\" 1967."
    ],
    collaborators: [
      "Walter B. Cannon",
      "Frank Barron",
      "Nabor Carrillo",
      "National Autonomous University of Mexico (UNAM)",
      "National Polytechnic Institute (IPN)"
    ]
  },
  {
    name: "Myron Stolaroff",
    slug: "myron-stolaroff",
    years: "1920-2013",
    dek: "A pioneering electrical engineer and psychedelic researcher whose work helped legitimize the study of psychedelics as tools for therapy, self-discovery, and the exploration of human consciousness.",
    imagePath: "/images/bios/myron-stolaroff.webp",
    imageAlt: "Portrait of Myron Stolaroff",
    imageCaption: "Stolaroff in 1961, via the Museum of Magnetic Sound Recording.",
    tags: ["Engineers", "Silicon Valley", "LSD", "Psychedelic Therapy"],
    facts: [
      { label: "Born", value: "1920\nRoswell, New Mexico" },
      { label: "Died", value: "2013" },
      { label: "Occupation", value: "Electrical engineer, psychedelic researcher, author" },
      { label: "Region", value: "United States" },
      { label: "Known for", value: "International Foundation for Advanced Study; psychedelic therapy research" }
    ],
    paragraphs: [
      "Born in 1920 in Roswell, New Mexico, Stolaroff earned a Master's degree in electrical engineering from Stanford University in 1941. He then began a successful career at Ampex Corporation, where he played a key role in developing the first magnetic tape recorder. However, a profound personal experience with LSD in 1956 convinced Stolaroff that psychedelics held immense potential for psychological and spiritual growth. Believing that LSD was the most important discovery man had ever made, he left Ampex in 1960 to found the International Foundation for Advanced Study (IFAS) in Menlo Park, California.",
      "As president of IFAS from 1960 to 1970, Stolaroff oversaw groundbreaking research into the therapeutic applications of LSD and mescaline. Between 1961 and 1965, the foundation administered psychedelics to hundreds of subjects in carefully controlled clinical settings, gathering valuable data on the drugs' effects. During this period, Stolaroff collaborated with numerous figures in the field, including psychologist Willis Harman, psychiatrist Charles Savage, and philosopher Gerald Heard. In 1965, the FDA began revoking permits for psychedelic research, forcing IFAS to conclude its studies prematurely.",
      "Undeterred, Stolaroff continued to explore altered states of consciousness throughout his life. From 1978 to 1986, he conducted personal investigations with novel psychoactive compounds, documenting his experiences. He also became a prolific writer and speaker, authoring books and articles on psychedelics, creativity, problem-solving, and spirituality. His notable works include Thanatos to Eros: 35 Years of Psychedelic Exploration and The Secret Chief, a biography of underground psychedelic therapist Leo Zeff.",
      "Stolaroff's research and advocacy helped lay the groundwork for the resurgence of scientific interest in psychedelics that began in the 1990s. He served on the board of directors of the Albert Hofmann Foundation and as a consultant to the Heffter Research Institute. In his later years, Stolaroff was revered as an elder statesman of the psychedelic movement.",
      "Stolaroff died in 2013 at the age of 92, leaving behind an important archive that is in the process of being catalogued and digitized at Erowid.org."
    ],
    sourceNotes: [
      "Sherwood, John N., Myron J. Stolaroff, and Willis W. Harman. \"The psychedelic experience: a new concept in psychotherapy.\" Journal of Neuropsychiatry 4 (1962): 69-80.",
      "Stolaroff, Myron. Thanatos to Eros: 35 Years of Psychedelic Exploration, 1994.",
      "Stolaroff, Myron. \"Using Psychedelics Wisely.\" Gnosis, Winter 1993."
    ],
    relatedSources: [
      "A 1998 interview with Neal Goldsmith on Stolaroff's path from engineer to psychedelic researcher.",
      "Materials associated with the International Foundation for Advanced Study (IFAS), Menlo Park.",
      "The Erowid Vault for Myron Stolaroff."
    ],
    publications: [
      "Thanatos to Eros: 35 Years of Psychedelic Exploration, 1994.",
      "The Secret Chief, 1997.",
      "\"Using Psychedelics Wisely,\" Gnosis, Winter 1993.",
      "\"The psychedelic experience: a new concept in psychotherapy,\" with John N. Sherwood and Willis W. Harman, 1962."
    ],
    collaborators: [
      "Willis Harman",
      "Charles Savage",
      "Gerald Heard",
      "James Fadiman",
      "Leo Zeff",
      "Al Hubbard"
    ]
  }
];

export function slugifyPersonName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function canonicalizePersonName(name: string) {
  const trimmed = name.trim();
  const canonicalName = canonicalPersonNames[trimmed] ?? trimmed;
  return canonicalName.replace(/\s*\(\d{4}\s*[–-]\s*\d{4}\)\s*$/, "");
}

export function isDisplayableBiographyName(name: string) {
  const canonicalName = canonicalizePersonName(name);
  return !excludedBiographyNames.has(canonicalName) && !canonicalName.includes("@");
}

export function getBiographyPortrait(name: string) {
  return biographyPortraits[slugifyPersonName(canonicalizePersonName(name))];
}

export function getBiographyDirectoryMetadata(name: string) {
  return biographyDirectoryMetadata[slugifyPersonName(canonicalizePersonName(name))];
}

export function findBiographyProfile(slug: string) {
  return biographyProfiles.find((profile) => profile.slug === slug);
}

export function buildFallbackBiography(name: string, personSources: ArchiveSource[]): BiographyProfile {
  const canonicalName = canonicalizePersonName(name);
  const portrait = getBiographyPortrait(canonicalName);
  const directoryMetadata = getBiographyDirectoryMetadata(canonicalName);
  const years = personSources.map((source) => source.year).filter(Boolean).sort((a, b) => a - b);
  const tags = Array.from(new Set(personSources.flatMap((source) => source.tags))).slice(0, 6);
  const regions = Array.from(new Set(personSources.map((source) => source.region))).filter(Boolean);

  return {
    name: canonicalName,
    slug: slugifyPersonName(canonicalName),
    years: directoryMetadata?.years ?? (years.length ? String(years[0] === years.at(-1) ? years[0] : `${years[0]}-${years.at(-1)}`) : undefined),
    dek: `${canonicalName} appears in ${personSources.length} ${personSources.length === 1 ? "source" : "sources"} currently indexed by the archive.`,
    imagePath: portrait?.imagePath,
    imageAlt: portrait?.imageAlt ?? canonicalName,
    tags: directoryMetadata?.tags ?? tags,
    facts: [
      { label: "Linked sources", value: String(personSources.length) },
      { label: "Era", value: Array.from(new Set(personSources.map((source) => source.era))).join("\n") || "In progress" },
      { label: "Region", value: regions.join("\n") || "In progress" },
      { label: "Source types", value: Array.from(new Set(personSources.map((source) => source.type))).join("\n") || "In progress" }
    ],
    paragraphs: [
      "This biography page is generated from source metadata while a fuller editorial biography is prepared.",
      "Use the linked source records below to browse the currently indexed materials associated with this person."
    ],
    relatedSources: personSources.slice(0, 4).map((source) => `${source.title}, ${source.displayDate}`),
    publications: personSources.slice(0, 4).map((source) => source.citation || `${source.title}, ${source.displayDate}`),
    collaborators: Array.from(new Set(personSources.flatMap((source) => source.people).map(canonicalizePersonName).filter((person) => person !== canonicalName))).slice(0, 6)
  };
}
