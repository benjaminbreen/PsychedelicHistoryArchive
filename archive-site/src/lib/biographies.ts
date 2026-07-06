import type { ArchiveSource } from "@/lib/types";
import type { BibliographyItem } from "@/lib/bibliography";

export type BiographyBibliographyLink = {
  relationshipType: string;
  editorialNote?: string;
  item: BibliographyItem;
};

export type BiographyProfile = {
  name: string;
  slug: string;
  years?: string;
  dek?: string;
  bodyMarkdown?: string;
  birthDate?: string;
  birthYear?: number;
  birthPlace?: string;
  deathDate?: string;
  deathYear?: number;
  deathPlace?: string;
  occupations?: string[];
  regions?: string[];
  knownFor?: string[];
  affiliations?: string[];
  imagePath?: string;
  imageAlt?: string;
  imageCaption?: string;
  tags: string[];
  facts: Array<{ label: string; value: string }>;
  paragraphs: string[];
  sourceNotes?: string[];
  relatedSources?: string[];
  publications?: string[];
  bibliographyLinks?: BiographyBibliographyLink[];
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
  "Burroughs Wellcome & Co.",
  "The Psychedelic History Archive"
]);

const canonicalPersonNames: Record<string, string> = {
  "Edward Wheeler Scripture (1864 – 1945)": "Edward Wheeler Scripture",
  "Fitz Hugh Ludlow (1836-1870)": "Fitz Hugh Ludlow",
  "Luisa de Álvarez de Toledo (with case studies contributed by Alberto E. Fontana and Francisco Perez Morales)": "Luisa de Álvarez de Toledo",
  "Timothy Leary (1920-1996)": "Timothy Leary",
  "William James (1842-1910)": "William James"
};

const biographyDirectoryMetadata: Record<string, BiographyDirectoryMetadata> = {
  "alexander-shulgin": {
    years: "1925-2014",
    role: "Chemist, Psychopharmacologist",
    tags: ["Chemistry", "Psychopharmacology"]
  },
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
  "garcia-de-orta": {
    years: "1501-1568",
    role: "Physician, Naturalist",
    tags: ["Goa", "Materia Medica", "Cannabis"]
  },
  "gerardo-reichel-dolmatoff": {
    years: "1912-1994",
    role: "Anthropologist, Archaeologist",
    tags: ["Colombia", "Amazonia", "Ethnography"]
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
  "j-g-soares-maia": {
    years: "20th-21st c.",
    role: "Natural-Products Chemist",
    tags: ["Brazil", "Amazonia", "Phytochemistry"]
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
  "salvador-roquet": {
    years: "1920-1995",
    role: "Psychiatrist, Psychotherapist",
    tags: ["Mexico", "Psychedelic Therapy"]
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
  },
  "william-antonio-rodrigues": {
    years: "1928-",
    role: "Botanist",
    tags: ["Brazil", "Amazonia", "Virola"]
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
  "salvador-roquet": {
    imagePath: "/images/bios/salvador-roquet.webp",
    imageAlt: "Portrait of Salvador Roquet"
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
    name: "Alexander Shulgin",
    slug: "alexander-shulgin",
    years: "1925-2014",
    dek: "American chemist and psychopharmacologist whose work moved between industrial chemistry, psychedelic synthesis, self-experimentation, and the ethnobotanical pharmacology of psychoactive plants.",
    tags: ["Chemistry", "Psychopharmacology", "Kava", "MDMA", "Phenethylamines", "Tryptamines"],
    facts: [
      { label: "Born", value: "June 17, 1925\nBerkeley, California" },
      { label: "Died", value: "June 2, 2014\nLafayette, California" },
      { label: "Occupation", value: "Chemist, psychopharmacologist, author" },
      { label: "Region", value: "United States; Oceania as research subject" },
      { label: "Known for", value: "MDMA research; PiHKAL and TiHKAL; psychoactive phenethylamines and tryptamines" }
    ],
    paragraphs: [
      "Alexander Theodore Shulgin was born in Berkeley, California in 1925 and trained in chemistry after service in the U.S. Navy. He worked at Dow Chemical, where he developed the first biodegradable pesticide, then built an independent career around the synthesis, classification, and phenomenological study of psychoactive compounds.",
      "Shulgin is best known for his later work with MDMA and for the books PiHKAL and TiHKAL, co-authored with Ann Shulgin. Those works made him a central figure in late twentieth-century psychedelic chemistry, but his published record also included more conventional reviews of plant chemistry and pharmacology.",
      "The 1973 article on Piper methysticum belongs to that broader side of Shulgin's work. Written for the Bulletin on Narcotics, it places kava in a comparative frame that includes Pacific preparation practices, uncertain pharmacological classification, and the chemistry of kavalactones and related Piper species.",
      "For the archive, Shulgin's kava article is useful because it moves away from LSD and psilocybin while showing how a chemist associated with synthetic psychedelics also engaged global plant intoxicants and the technical vocabulary of international drug-control science."
    ],
    sourceNotes: [
      "Shulgin, Alexander T. \"The Narcotic Pepper: The Chemistry and Pharmacology of Piper methysticum and Related Species.\" Bulletin on Narcotics 25, no. 2 (1973): 59-74.",
      "Shulgin, Alexander, and Ann Shulgin. PiHKAL: A Chemical Love Story, 1991.",
      "Washington Post and Los Angeles Times obituaries of Alexander Shulgin, June 2014."
    ]
  },
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
    name: "Gerardo Reichel-Dolmatoff",
    slug: "gerardo-reichel-dolmatoff",
    years: "1912-1994",
    dek: "Austrian-born Colombian anthropologist and archaeologist whose work on Tukano cosmology, yaje, and Indigenous knowledge shaped the anthropology of Amazonian altered states.",
    tags: ["Colombia", "Amazonia", "Tukano", "Yaje", "Ethnography", "Archaeology"],
    facts: [
      { label: "Born", value: "March 6, 1912\nSalzburg, Austria-Hungary" },
      { label: "Died", value: "May 17, 1994\nBogota, Colombia" },
      { label: "Occupation", value: "Anthropologist, archaeologist, ethnographer" },
      { label: "Region", value: "Colombia; Northwest Amazon" },
      { label: "Known for", value: "Colombian anthropology and archaeology; Tukano ethnography; writing on yaje and Amazonian cosmology" }
    ],
    paragraphs: [
      "Gerardo Reichel-Dolmatoff was born in Salzburg in 1912 and moved to Colombia in 1939, becoming a Colombian citizen in the early 1940s. Over the next decades he became one of the most visible figures in Colombian anthropology and archaeology, carrying out fieldwork among Indigenous and rural communities across the Caribbean coast, the Sierra Nevada de Santa Marta, the Pacific coast, the Llanos Orientales, and the Amazon.",
      "His psychedelic-historical importance lies especially in his writing on Tukano-speaking peoples of the Vaupes and the cultural place of yaje, or caapi. In the 1969 article staged here, Reichel-Dolmatoff argued that Banisteriopsis caapi could not be understood only through botany, chemistry, or psychology. Its effects, he suggested, had to be read within a wider system of mythology, ritual performance, visual symbolism, social memory, and techniques for managing perception.",
      "That argument made the article a useful counterpoint to laboratory accounts of harmaline and ayahuasca chemistry. Reichel-Dolmatoff treated the visionary experience as a culturally organized event rather than a simple pharmacological episode, and his account helped place Indigenous Amazonian knowledge at the center of debates about psychedelic experience.",
      "Reichel-Dolmatoff's legacy is also contested. Later scholarship and journalism have examined evidence concerning his political activities in Austria before his migration to Colombia, including allegations of involvement with Nazi organizations. That history complicates any simple celebration of his career, while not eliminating the importance of reading his ethnographic work critically within the history of Colombian anthropology.",
      "For the archive, his caapi article is valuable because it widens the collection from clinical psychedelic research toward the Indigenous, Colombian, and Amazonian contexts that made substances such as ayahuasca historically intelligible."
    ],
    sourceNotes: [
      "Reichel-Dolmatoff, Gerardo. \"El contexto cultural de un alucinogeno aborigen: Banisteriopsis caapi.\" Revista de la Academia Colombiana de Ciencias Exactas, Fisicas y Naturales 13, no. 51 (1969): 327-345.",
      "Banco de la Republica, Enciclopedia Banrepcultural, \"Gerardo Reichel-Dolmatoff.\"",
      "Malcolm Deas, \"Obituary: Gerardo Reichel-Dolmatoff,\" The Independent, May 23, 1994.",
      "Augusto Oyuela-Caycedo, later biographical research on Reichel-Dolmatoff's early life in Austria."
    ]
  },
  {
    name: "Garcia de Orta",
    slug: "garcia-de-orta",
    years: "1501-1568",
    dek: "Portuguese physician and naturalist in Goa whose Colloquies recorded South Asian materia medica through direct observation, dialogue, commerce, and medical practice.",
    tags: ["Goa", "India", "Cannabis", "Materia Medica", "Portuguese Empire", "Early Modern Medicine"],
    facts: [
      { label: "Born", value: "1501\nCastelo de Vide, Portugal" },
      { label: "Died", value: "1568\nGoa, Portuguese India" },
      { label: "Occupation", value: "Physician, naturalist, herbalist" },
      { label: "Region", value: "Portugal; Goa; Indian Ocean" },
      { label: "Known for", value: "Colóquios dos simples e drogas da India; early European descriptions of South Asian drugs and medicinal plants" }
    ],
    paragraphs: [
      "Garcia de Orta was born in Portugal in 1501 into a converso family and trained as a physician before moving to Portuguese India in the 1530s. He lived and worked chiefly in Goa, where he practiced medicine, traded, and gathered information from physicians, merchants, patients, servants, and local specialists.",
      "His Colóquios dos simples e drogas da India, printed in Goa in 1563, is one of the earliest European books based substantially on direct observation of South Asian medicinal plants, spices, and drugs. Its dialogue form stages medical knowledge as a conversation rather than as a simple compilation from classical authorities.",
      "The short colloquy on bangue is important for the history of cannabis because it records bhang as a South Asian preparation with bodily, social, and imaginative effects. Orta connects it with appetite, laughter, sleep, pleasure, opium, nutmeg, mace, and stories of elite use, while also marking his own distance from the practice.",
      "For the archive, Orta helps anchor psychoactive plant history in the Indian Ocean and early modern Portuguese empire rather than in the familiar twentieth-century psychedelic canon."
    ],
    sourceNotes: [
      "Garcia de Orta, Colóquios dos simples e drogas da India, Goa, 1563.",
      "Garcia de Orta, Colloquies on the Simples and Drugs of India, translated by Clements Markham, London, 1913.",
      "Rice University Galileo Project entry on Garcia de Orta."
    ]
  },
  {
    name: "J. G. Soares Maia",
    slug: "j-g-soares-maia",
    years: "20th-21st century",
    dek: "Brazilian natural-products chemist associated with Amazonian phytochemistry, including early chemical work on Virola theiodora at the Instituto Nacional de Pesquisas da Amazônia.",
    tags: ["Brazil", "Amazonia", "Phytochemistry", "Virola", "INPA"],
    facts: [
      { label: "Occupation", value: "Natural-products chemist" },
      { label: "Region", value: "Brazil; Amazonia" },
      { label: "Institution", value: "Instituto Nacional de Pesquisas da Amazônia; Universidade Federal do Pará" },
      { label: "Known for", value: "Amazonian plant chemistry; aromatic and medicinal plants; Virola theiodora" }
    ],
    paragraphs: [
      "J. G. Soares Maia, also cited as José Guilherme Soares Maia, is a Brazilian chemist whose work belongs to the development of natural-products chemistry in Amazonian research institutions. In the 1970s he was affiliated with the Instituto Nacional de Pesquisas da Amazônia, where chemistry, botany, and ethnobotanical collection increasingly overlapped.",
      "The 1974 article co-authored with William Antônio Rodrigues is short but useful: it connects herbarium comparison, chromatography, infrared spectroscopy, and ultraviolet spectroscopy to Indigenous Yomanê preparations from the Tototobi River region. Its focus is not visionary narrative but the chemical confirmation of Virola theiodora as both hallucinogenic snuff and arrow poison.",
      "For the archive, Maia's work helps represent a Brazilian scientific literature on Amazonian psychoactive plants, distinct from the better-known North American and European ethnobotanical writings that often cite the same materials from afar."
    ],
    sourceNotes: [
      "Maia, J. G. Soares, and William Antônio Rodrigues. \"Virola theiodora como alucinógena e tóxica.\" Acta Amazonica 4, no. 1 (1974): 21-23.",
      "Maia, J. G. Soares. \"A pesquisa em Química no INPA.\" Acta Amazonica 11, no. 1, suplemento (1981)."
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
      "Del Pozo was also a prominent historian of medicine. He played a key role in the publication of two seminal works of 16th-century Mexican medicine: the 1552 Badianus Manuscript, Libellus de Medicinalibus Indorum Herbis, in 1964, and the complete works of Francisco Hernandez, published between 1960 and 1984. This work brought sixteenth-century records of Indigenous medical knowledge in Mexico into wider scholarly circulation.",
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
    name: "William Antônio Rodrigues",
    slug: "william-antonio-rodrigues",
    years: "1928-",
    dek: "Brazilian botanist associated with INPA whose taxonomic work on Amazonian plants included the genus Virola, a major source of Indigenous psychoactive snuffs.",
    tags: ["Brazil", "Amazonia", "Botany", "Virola", "Myristicaceae"],
    facts: [
      { label: "Born", value: "1928\nSão João del Rei, Brazil" },
      { label: "Occupation", value: "Botanist" },
      { label: "Region", value: "Brazil; Amazonia" },
      { label: "Institution", value: "Instituto Nacional de Pesquisas da Amazônia" },
      { label: "Known for", value: "Taxonomic work on Amazonian plants, including Virola" }
    ],
    paragraphs: [
      "William Antônio Rodrigues is a Brazilian botanist born in São João del Rei in 1928. His work is closely associated with Amazonian botany and the Instituto Nacional de Pesquisas da Amazônia, where botanical taxonomy, herbarium collections, and natural-products chemistry supplied a shared infrastructure for studying tropical plants.",
      "Rodrigues's contribution to the 1974 Virola theiodora article reflects that botanical context. The paper depends on comparing Yomanê snuff and arrow-poison materials with herbarium specimens of Virola, including V. theiodora and related species.",
      "For psychedelic history, Rodrigues matters less as a public psychedelic figure than as part of the scientific apparatus that made Amazonian psychoactive plants legible to chemistry, taxonomy, and pharmacology in Brazil."
    ],
    sourceNotes: [
      "Maia, J. G. Soares, and William Antônio Rodrigues. \"Virola theiodora como alucinógena e tóxica.\" Acta Amazonica 4, no. 1 (1974): 21-23.",
      "Rodrigues, William Antônio. \"Revisão taxonômica das espécies de Virola Aublet (Myristicaceae) do Brasil.\" Acta Amazonica 10, no. 1, suplemento (1980)."
    ]
  },
  {
    name: "Salvador Roquet",
    slug: "salvador-roquet",
    years: "1920-1995",
    dek: "Mexican psychiatrist and psychotherapist whose controversial psychedelic sessions joined Indigenous Mazatec influences, psychodrama, sensory overload, ketamine, and group psychotherapy.",
    imagePath: "/images/bios/salvador-roquet.webp",
    imageAlt: "Portrait of Salvador Roquet",
    imageCaption: "Salvador Roquet. Image via Asociación Española de Axiología.",
    tags: ["Mexico", "Mazatec Traditions", "Psilocybin", "LSD", "Peyote", "Ketamine", "Psychedelic Therapy", "Psychosynthesis", "War on Drugs"],
    facts: [
      { label: "Born", value: "1920\nTierra Blanca, Veracruz, Mexico" },
      { label: "Died", value: "1995" },
      { label: "Occupation", value: "Psychiatrist, psychotherapist, public-health physician" },
      { label: "Region", value: "Mexico; Oaxaca; United States" },
      { label: "Institution", value: "Instituto de Psicosíntesis; Albert Schweitzer Cultural Organization" },
      { label: "Known for", value: "Convivial psychedelic psychotherapy; sensory-overload sessions; collaboration with María Sabína; Los Alucinógenos de la Concepción Indígena a una Nueva Psicoterapia" }
    ],
    paragraphs: [
      "Born in Tierra Blanca, Veracruz, in 1920, Salvador Roquet was a Mexican physician and psychiatrist whose career moved from public health into one of the most ambitious, controversial, and ethically fraught psychedelic-therapy programs in Latin America.",
      "By his mid-thirties, Roquet had earned a master's degree in public health with a specialization in malariology and later specialized in neurology at Gea González Hospital. From 1951 to 1955 he held senior posts in national campaigns against malaria and tuberculosis before a political setback pushed him toward psychiatry and altered states of consciousness.",
      "In the 1960s, Roquet founded the Instituto de Psicosíntesis in Mexico City, where he combined group psychotherapy, psychodrama, audiovisual stimulation, and hallucinogenic drugs including LSD, psilocybin mushrooms, mescaline, peyote, datura, and ketamine. He also directed the Albert Schweitzer Cultural Organization, which supported a humanistic school for patients' children, and he helped establish a hospital in the mountains of Oaxaca."
    ],
    bodyMarkdown: `Born in Tierra Blanca, Veracruz, in 1920, Salvador Roquet was a Mexican physician and psychiatrist whose career moved from public health into one of the most ambitious, controversial, and ethically fraught psychedelic-therapy programs in Latin America. His work joined clinical psychiatry, Indigenous Mazatec healing practices, psychodrama, sensory overload, and the language of humanistic psychotherapy.

By his mid-thirties, Roquet had earned a master's degree in public health with a specialization in malariology and later specialized in neurology at Gea González Hospital. From 1951 to 1955 he held senior posts in national campaigns against malaria and tuberculosis. After a political setback, he turned more fully toward psychiatry and began to focus on altered states of consciousness as a therapeutic resource.

In the 1960s, Roquet founded the Instituto de Psicosíntesis in Mexico City. There he integrated hallucinogenic substances such as LSD, psilocybin, mescaline, peyote, datura, and ketamine into psychotherapy. He also directed the Albert Schweitzer Cultural Organization, which supported a humanistic school for patients' children, and he helped establish a hospital in the mountains of Oaxaca, extending his work into a more explicitly social and community-oriented frame.

Roquet's best-known Indigenous connection was with María Sabína, the Mazatec curandera of Huautla de Jiménez whose mushroom ceremonies became internationally famous in the decades after R. Gordon Wasson's 1950s reporting. Roquet treated Sabína's knowledge of sacred mushrooms as central to his effort to bridge Indigenous healing and modern psychotherapy. That relationship also remains ethically charged: later scholars have emphasized the risks of appropriation, romanticization, and unequal exchange in the countercultural traffic around Mazatec practices.

Roquet's sessions were designed as immersive, often destabilizing events. Patients were given psychedelic drugs and then exposed to music, lights, films, images, and other intense stimuli intended to provoke emotional responses. He used ketamine hydrochloride as an adjunct, especially as other psychedelic effects waned, and he drew on the night-time structure of Mazatec mushroom ceremonies. His goal was to reach subconscious material that he believed ordinary psychotherapy could not easily access.

The method was deliberately intense. Roquet argued that modern life suppressed a deep current of instinct and feeling, and that therapy should help patients confront fear, grief, aggression, desire, and wonder rather than keep them at the surface of ordinary consciousness. Later commentators described him as a "master of bad trips," a phrase that captures both the confrontational character of the sessions and the unease they produced among critics.

Roquet called his group model "convivial" psychotherapy. A typical session lasted roughly twenty-two hours and used what he and Pierre Louis Favreau called psychodysleptics as therapeutic aids. About eight days later, patients returned for an approximately eight-hour drug-free group session in which the earlier experiences were narrated and confronted. In the following weeks they usually continued with individual interviews, observed other sessions, or joined the later stages of another group's work.

In 1972, Roquet traveled to the Maryland Psychiatric Research Center to demonstrate his group-therapy methods for American clinicians interested in psychedelic psychotherapy. The visit occurred as psychedelic research in the United States was being reshaped by prohibition: LSD possession had been outlawed in 1968, and President Richard Nixon's 1971 declaration of a war on drugs brought new legal and political scrutiny to psychedelic work.

Mexico's own drug policy also tightened. In 1974, reforms to the Mexican penal code increased penalties for possession of LSD, peyote, and psilocybin mushrooms. On November 21, 1974, police raided Roquet's clinic. About twenty-five patients, doctors, and staff members were arrested, and Roquet, Favreau, and Rubén Ocaña Soler were detained the next morning. Authorities cited psychedelic substances, clinic fees, and the presence of films they labeled pornographic as evidence for charges involving dangerous drugs, trafficking, and moral turpitude.

The patients were released quickly, but Roquet and Favreau were imprisoned for several weeks. Former patients, including influential Mexicans, organized in his defense, and several American psychiatrists testified to the seriousness of his methods. Roquet and Favreau were eventually cleared and allowed to reopen the institute, but after the raid Roquet increasingly emphasized simulated sessions using lights, sound, and other stimuli without drugs. As Stanley Krippner later quoted Roquet, he came to describe psychedelics as "the launching pad" rather than the sole active force in the therapy.

Roquet's legacy is further complicated by evidence that he collaborated with Mexico's Dirección Federal de Seguridad during a period of state repression. According to Alexander S. Dawson, Roquet used his knowledge of psychedelics in interrogations of student activists and defended the practice in language of civic reform. That collaboration raises serious questions about the use of psychiatric expertise in coercive state settings and prevents any simple celebration of his clinical innovation.

At the same time, Roquet's patients and defenders described the therapy as transformative. Accounts by former patients such as Angélica Parragot Gronillet and Rosa María credited his sessions with helping them move through suicidal depression, substance dependence, and other crises. Those testimonies help explain why his former patients mobilized so quickly after the 1974 raid, even as historians continue to scrutinize the power relations and risks built into his methods.

Roquet died in 1995. His historical importance lies in the difficulty of the archive he left behind: a Mexican psychedelic psychotherapy that was inventive, transnational, and clinically influential, but also entangled with Indigenous extraction, state power, sensational media campaigns, and the punitive politics of the war on drugs.`,
    sourceNotes: [
      "Rodiles, Janine. \"Psicoterapia Prohibida del Doctor Roquet.\" Liberaddictus AC, November 1, 1996.",
      "Villoldo, Alberto. \"An Introduction to the Psychedelic Psychotherapy of Salvador Roquet.\" Journal of Humanistic Psychology 17, no. 4 (1977): 45-58.",
      "Dawson, Alexander S. \"Salvador Roquet, María Sabína, and the Trouble with Jipis.\" Hispanic American Historical Review 95, no. 1 (2015): 103-133.",
      "Dawson, Alexander S. \"Peyote Outlawed in Mexico.\" In The Peyote Effect: From the Inquisition to the War on Drugs, 121-133. University of California Press, 2018.",
      "Wolfson, Philip E. \"Psychedelic Experiential Pharmacology: Pioneering Clinical Explorations with Salvador Roquet: An Interview with Richard Yensen.\" International Journal of Transpersonal Studies 33, no. 2 (2014): 160-174.",
      "Macmillan, Alexander. \"The 'Convivial' Psychotherapy Process of Dr. Salvador Roquet.\" PhD diss., University of Massachusetts Amherst, 1987.",
      "Roquet, Salvador, and Pierre L. Favreau. Los Alucinógenos de la Concepción Indígena a una Nueva Psicoterapia. Mexico City: Ediciones Prisma, 1981.",
      "Krippner, Stanley. \"Salvador Roquet Remembered: An Innovative Psychedelic Therapist in 1960s Mexico.\" Chacruna Institute, March 1, 2017.",
      "Clark, Walter Houston. \"BAD TRIPS may be the BEST TRIPS.\" FATE Magazine, April 1976.",
      "Lee, Martin A., and Bruce Shlain. Acid Dreams: The Complete Social History of LSD: The CIA, the Sixties, and Beyond. Grove Press, 1994.",
      "Witt, Emily. \"Ketamine Therapy Is Going Mainstream. Are We Ready?\" The New Yorker, December 29, 2021.",
      "Goldhill, Olivia. \"What a Bad Trip Can Teach You.\" The Cut, December 8, 2021."
    ],
    relatedSources: [
      "Salvador Roquet and Pierre Louis Favreau, Los Alucinógenos de la Concepción Indígena a una Nueva Psicoterapia, 1981.",
      "Alberto Villoldo, \"An Introduction to the Psychedelic Psychotherapy of Salvador Roquet,\" 1977.",
      "Alexander S. Dawson, \"Salvador Roquet, María Sabína, and the Trouble with Jipis,\" 2015.",
      "Alexander Macmillan, \"The 'Convivial' Psychotherapy Process of Dr. Salvador Roquet,\" 1987."
    ],
    publications: [
      "Los Alucinógenos de la Concepción Indígena a una Nueva Psicoterapia, with Pierre Louis Favreau, 1981."
    ],
    collaborators: [
      "María Sabína",
      "Pierre Louis Favreau",
      "Rubén Ocaña Soler",
      "Abraham Sussman",
      "Richard Yensen",
      "Stanislav Grof"
    ]
  },
  {
    name: "Myron Stolaroff",
    slug: "myron-stolaroff",
    years: "1920-2013",
    dek: "Electrical engineer who left Ampex in 1960 to fund and direct one of the first sustained clinical studies of LSD therapy in the United States.",
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
      "Born in 1920 in Roswell, New Mexico, Stolaroff earned a Master's degree in electrical engineering from Stanford in 1941 and joined Ampex Corporation, where he worked on the first magnetic tape recorder. He took LSD for the first time in 1956 and afterwards described it as the most important discovery he had encountered. In 1960 he left Ampex to found the International Foundation for Advanced Study (IFAS) in Menlo Park.",
      "As president of IFAS from 1960 to 1970, Stolaroff ran clinical studies of LSD and mescaline. Between 1961 and 1965 the foundation administered psychedelics to several hundred subjects under controlled conditions. His collaborators included the engineer Willis Harman, the psychiatrist Charles Savage, and the philosopher Gerald Heard. In 1965 the FDA began revoking research permits, and IFAS wound down its studies.",
      "From 1978 to 1986 Stolaroff conducted private sessions with novel psychoactive compounds and kept detailed records of the results. He later wrote Thanatos to Eros: 35 Years of Psychedelic Exploration and The Secret Chief, a portrait of the underground therapist Leo Zeff.",
      "Stolaroff served on the board of the Albert Hofmann Foundation and as a consultant to the Heffter Research Institute, and was an active figure in the renewed clinical research of the 1990s and 2000s.",
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
