export type EraDefinition = {
  slug: string;
  label: string;
  eyebrow: string;
  shortDescription: string;
  longDescription: string;
  tagline: string;
  /** Inclusive lower bound (CE). Omit for the first era to mean "no lower bound". */
  yearStart?: number;
  /** Inclusive upper bound (CE). Omit for the last era to mean "no upper bound". */
  yearEnd?: number;
  icon: string;
  bannerGradient: string;
  bannerImage?: string;
  keyFigures: { name: string; slug: string }[];
  furtherReading: {
    title: string;
    byline: string;
    note: string;
    kind: "Book" | "Article" | "Chapter";
  }[];
  essay?: string[];
};

export const ERAS: EraDefinition[] = [
  {
    slug: "pre-500",
    label: "Pre-500 CE",
    eyebrow: "Archaeology & Antiquity",
    shortDescription:
      "Archaeological and early textual evidence for ritual intoxication: Tassili rock art, Chavín San Pedro, soma, Eleusis, classical pharmacology.",
    longDescription:
      "The evidence for this era is mostly material rather than textual: rock art, ceramics, plant residues, and a thin layer of canonical text from the Vedic, Greek, and Roman worlds.",
    tagline:
      "The deep prehistory and early antiquity of altered states, read mostly through material remains.",
    yearEnd: 500,
    icon: "shamanism",
    bannerGradient:
      "linear-gradient(115deg, #1f1815 0%, #3c2c20 32%, #6c4828 64%, #9a7240 100%)",
    bannerImage: "/images/eras/pre-500.jpg",
    keyFigures: [
      { name: "Herodotus", slug: "herodotus" },
      { name: "Hippocrates", slug: "hippocrates" },
      { name: "Pliny the Elder", slug: "pliny-the-elder" },
      { name: "Plutarch", slug: "plutarch" },
      { name: "Dioscorides", slug: "dioscorides" }
    ],
    furtherReading: [],
    essay: [
      "Direct evidence for psychedelic use in the deep past is thin, and the lack of evidence is itself one of the defining features of the era. A handful of well-documented archaeological cases — cannabis residue in Pazyryk burials, opium poppy capsules in Neolithic Mediterranean tombs — sit alongside a much larger body of speculative interpretation. Rock panels at Tassili n'Ajjer in the Algerian Sahara, sometimes read as depicting mushroom-using shamans, are far more ambiguous than the popular literature suggests. The San Pedro iconography at Chavín de Huántar in the Andes is on firmer ground but still tells us little about the ritual context.",
      "The textual record is similarly uncertain. The Rigveda's hymns to soma describe a divine intoxicant whose botanical identity has been argued over for two centuries, with proposed candidates ranging from Amanita muscaria to ephedra to harmal. The Eleusinian Mysteries involved the drinking of kykeon under strict secrecy; Wasson, Hofmann, and Ruck proposed in 1978 that it was an ergot preparation, but there is no direct evidence for this, and the hypothesis remains contested. What we can say more confidently is that Greek and Roman writers — Theophrastus, Pliny, Dioscorides — catalogued opium, mandrake, henbane, and hemp with practical sobriety, and that by 500 CE the visionary remains, mostly, off the page.",
      "*This is a placeholder summary. A full description will be added later.*"
    ]
  },
  {
    slug: "500-1500",
    label: "500–1500",
    eyebrow: "Medieval Worlds, Pre-Columbian Americas",
    shortDescription:
      "Mesoamerican mushroom imagery, Arab cannabis writing, and European herbals — a thousand years for which the evidence is regionally uneven and often indirect.",
    longDescription:
      "Distinct regional traditions of intoxication developed across this millennium with little contact between them. The strongest evidence comes from the Mesoamerican mushroom stones and later Mixtec codices, and from Arab pharmacological writing on hashish. Claims about European \"flying ointments\" or about pre-modern African iboga use rest on much thinner evidence, and should be treated cautiously.",
    tagline:
      "Medieval regional traditions of altered states, unevenly documented.",
    yearStart: 501,
    yearEnd: 1500,
    icon: "indigenous-knowledge",
    bannerGradient:
      "linear-gradient(115deg, #2b2018 0%, #5a4028 32%, #9c7038 64%, #c89c50 100%)",
    bannerImage: "/images/eras/500-1500.jpg",
    keyFigures: [
      { name: "Avicenna", slug: "avicenna" },
      { name: "Ibn al-Baytar", slug: "ibn-al-baytar" },
      { name: "Hildegard of Bingen", slug: "hildegard-of-bingen" },
      { name: "Marco Polo", slug: "marco-polo" },
      { name: "Moctezuma II", slug: "moctezuma-ii" }
    ],
    furtherReading: [
      {
        title: "Hashish: A Smuggler's Tale",
        byline: "Henry de Monfreid (and modern critical editions) — context: Arab Hashish Tradition",
        note: "For the medieval Islamic-world literature, see Franz Rosenthal's The Herb (1971), which translates and analyzes Arabic hashish treatises.",
        kind: "Book"
      },
      {
        title: "The Herb: Hashish versus Medieval Muslim Society",
        byline: "Franz Rosenthal · Brill, 1971",
        note: "The canonical scholarly treatment of cannabis in the medieval Islamic world.",
        kind: "Book"
      },
      {
        title: "Mushrooms, Russia and History",
        byline: "Valentina P. & R. Gordon Wasson · Pantheon, 1957",
        note: "Includes the Wassons' reconstruction of Mesoamerican mushroom ritual through colonial and pre-Columbian evidence.",
        kind: "Book"
      },
      {
        title: "Witchcraft and Drugs in Europe",
        byline: "Michael Harner, in Hallucinogens and Shamanism (1973)",
        note: "The flying-ointment hypothesis for European witch-trial evidence.",
        kind: "Chapter"
      }
    ]
  },
  {
    slug: "1500-1800",
    label: "1500–1800",
    eyebrow: "Conquest, Encounter, Pharmacopoeia",
    shortDescription:
      "Spanish chronicles of teonanácatl and peyote, the suppression of Indigenous practice, and the first European reports of ayahuasca and kava.",
    longDescription:
      "Three centuries in which the global pharmacopoeia was assembled by colonial powers and Indigenous knowledge-holders — at times collaboratively, more often by force. Sources include chronicles, Inquisition records, herbals, and ships' surgeons' journals.",
    tagline:
      "Conquest ethnography and the slow assembly of a global apothecary.",
    yearStart: 1501,
    yearEnd: 1800,
    icon: "ethnobotany",
    bannerGradient:
      "linear-gradient(115deg, #3a2a2a 0%, #6b4a3a 32%, #a87a4a 64%, #d4b27a 100%)",
    bannerImage: "/images/eras/1500-1800.jpg",
    keyFigures: [
      { name: "Bernardino de Sahagún", slug: "bernardino-de-sahagun" },
      { name: "José de Acosta", slug: "jose-de-acosta" },
      { name: "Garcilaso de la Vega", slug: "garcilaso-de-la-vega" },
      { name: "Andrés Laguna", slug: "andres-laguna" },
      { name: "Hans Sloane", slug: "hans-sloane" },
      { name: "Joseph Banks", slug: "joseph-banks" }
    ],
    furtherReading: [
      {
        title: "Plants of the Gods: Their Sacred, Healing, and Hallucinogenic Powers",
        byline: "Richard Evans Schultes, Albert Hofmann & Christian Rätsch · Healing Arts, 2001",
        note: "The canonical illustrated survey of psychoactive plants in ritual, medical, and ethnographic context.",
        kind: "Book"
      },
      {
        title: "Tripping on Utopia: Margaret Mead, the Cold War, and the Troubled Birth of Psychedelic Science",
        byline: "Benjamin Breen · Grand Central, 2024",
        note: "Opens with longue-durée early modern context — Sahagún, peyote suppression, the global apothecary — before tracing the modern story.",
        kind: "Book"
      },
      {
        title: "Drug Trade and Diplomacy: Knowledge Workers and the Construction of a Global Pharmacopeia, 1660-1740",
        byline: "Benjamin Breen · Journal of Early Modern History, 2017",
        note: "The making of the European materia medica through colonial and imperial knowledge networks.",
        kind: "Article"
      }
    ],
    essay: [
      "Between 1500 and 1800, European powers and the societies they encountered built — sometimes collaboratively, often violently — the first global pharmacopoeia. The earliest substantial European-language descriptions of substances that would later become central to the psychedelic story belong to this era: Sahagún's Mexica informants on teonanácatl and peyotl in the Florentine Codex; José de Acosta's Historia Natural; the Inquisition's prosecutions of curanderos in seventeenth-century Mexico; East India Company officers reporting on bhang, kava, and betel.",
      "These sources rarely use vocabulary we would recognize today. \"Intoxication,\" \"witchcraft,\" \"frenzy,\" \"the Devil's herb,\" and \"melancholy\" are pressed into service to describe what may have been, in their original contexts, sacramental experiences. By the eighteenth century the apparatus of Linnaean botany begins to absorb this knowledge, smoothing earlier wonder and horror into the language of natural history. The era ends with Humphry Davy at the Pneumatic Institution and the threshold of the modern laboratory.",
      "*This is a placeholder summary. A full description will be added later.*"
    ]
  },
  {
    slug: "1800-1850",
    label: "1800–1850",
    eyebrow: "Romantic Pharmacology",
    shortDescription:
      "Davy on nitrous oxide, Coleridge and De Quincey on opium, and Moreau de Tours on hashish — the first Anglophone and Francophone literature of drug self-experiment.",
    longDescription:
      "Humphry Davy's 1800 nitrous oxide experiments at the Pneumatic Institution opened a new genre: the first-person introspective drug report. Within a generation Coleridge, De Quincey, and Moreau de Tours had made opium and hashish into subjects of serious literary and clinical writing.",
    tagline:
      "Opium, nitrous oxide, and the observing self.",
    yearStart: 1801,
    yearEnd: 1850,
    icon: "nitrous-oxide",
    bannerGradient:
      "linear-gradient(115deg, #2a1f25 0%, #4a3540 30%, #806060 58%, #c2a08c 100%)",
    bannerImage: "/images/eras/1800-1850.jpg",
    keyFigures: [
      { name: "Humphry Davy", slug: "humphry-davy" },
      { name: "Samuel Taylor Coleridge", slug: "samuel-taylor-coleridge" },
      { name: "Thomas De Quincey", slug: "thomas-de-quincey" },
      { name: "Jacques-Joseph Moreau", slug: "jacques-joseph-moreau" },
      { name: "Friedrich Sertürner", slug: "friedrich-serturner" },
      { name: "Théophile Gautier", slug: "theophile-gautier" }
    ],
    furtherReading: [
      {
        title: "The Age of Wonder",
        byline: "Richard Holmes · Pantheon, 2008",
        note: "Davy's nitrous oxide experiments reconstructed in the context of Romantic-era science.",
        kind: "Book"
      },
      {
        title: "Confessions of an English Opium-Eater and Other Writings",
        byline: "Thomas De Quincey · Oxford, 1985 ed.",
        note: "The founding text of Anglophone drug literature, with critical apparatus.",
        kind: "Book"
      },
      {
        title: "Emperors of Dreams: Drugs in the Nineteenth Century",
        byline: "Mike Jay · Dedalus, 2000",
        note: "The standard cultural history of nineteenth-century drug experience in Britain.",
        kind: "Book"
      }
    ],
    essay: [
      "On April 9, 1799, Humphry Davy inhaled nitrous oxide at the Pneumatic Institution in Bristol and recorded the experience in prose that the next half-century would treat as a model. Researches, Chemical and Philosophical (1800) opens the modern Anglophone literature of self-experiment with altered states. Within a generation Coleridge would publish 'Kubla Khan,' De Quincey the Confessions of an English Opium-Eater (1821), and Théophile Gautier his sketches of the Club des Hashischins.",
      "The era's signature genre is the introspective first-person account: the experimenter is the experiment, and the experimental apparatus is the prose itself. In Paris, Jacques-Joseph Moreau de Tours, working at the Bicêtre, produced Du Hachisch et de l'Aliénation Mentale (1845) — the first sustained clinical psychiatric treatise on a hallucinogen, and arguably the first articulation of what Heffter, James, and Klüver would later develop into a full research program.",
      "*This is a placeholder summary. A full description will be added later.*"
    ]
  },
  {
    slug: "1850-1900",
    label: "1850–1900",
    eyebrow: "Psychonauts & Isolation",
    shortDescription:
      "Mitchell on mescal, Heffter isolating mescaline, William James on nitrous oxide, and Mooney's fieldwork on the Ghost Dance.",
    longDescription:
      "The plant intoxicants of earlier eras were isolated as alkaloids in this period — cocaine in 1860, mescaline by Arthur Heffter in 1897 — while ethnographers like James Mooney began to document Indigenous traditions on something closer to their own terms. The categories that would shape the twentieth century (addiction, hallucination, mystical experience) were largely in place by 1900.",
    tagline:
      "The laboratory, the clinic, and the field site converge on the modern hallucinogen.",
    yearStart: 1851,
    yearEnd: 1900,
    icon: "mescaline",
    bannerGradient:
      "linear-gradient(115deg, #25281a 0%, #4a4a30 30%, #786a4a 58%, #c2a878 100%)",
    bannerImage: "/images/eras/1850-1900.jpg",
    keyFigures: [
      { name: "Weir Mitchell", slug: "weir-mitchell" },
      { name: "Arthur Heffter", slug: "arthur-heffter" },
      { name: "William James", slug: "william-james" },
      { name: "Havelock Ellis", slug: "havelock-ellis" },
      { name: "James Mooney", slug: "james-mooney" },
      { name: "Benjamin Paul Blood", slug: "benjamin-paul-blood" }
    ],
    furtherReading: [
      {
        title: "Mescaline: A Global History of the First Psychedelic",
        byline: "Mike Jay · Yale, 2019",
        note: "The definitive cultural and scientific history of mescaline, with extensive treatment of this period.",
        kind: "Book"
      },
      {
        title: "The Varieties of Religious Experience",
        byline: "William James · Longmans, Green, 1902 (delivered 1901–02)",
        note: "James's synthesis of his anaesthetic-revelation work alongside the wider psychology of religion.",
        kind: "Book"
      },
      {
        title: "The Ghost-Dance Religion and the Sioux Outbreak of 1890",
        byline: "James Mooney · BAE Annual Report, 1896",
        note: "Mooney's pioneering ethnographic study, foundational for the anthropological treatment of indigenous visionary practice.",
        kind: "Book"
      }
    ],
    essay: [
      "If 1800 to 1850 belongs to the Romantic self-experimenter, the next half-century belongs to the institutions: the laboratory, the medical journal, the asylum, the ethnographic field site. Chemists in French and German laboratories isolate the active alkaloids of the great vegetable intoxicants — cocaine from coca leaves (1860), mescaline from peyote (Arthur Heffter, 1897) — and in doing so transform plants into molecules and cultural practices into pharmacological objects.",
      "In Philadelphia, Weir Mitchell publishes the first scientific account of mescal in 1896. In Boston, William James returns repeatedly to nitrous oxide and what Benjamin Paul Blood had named \"the anaesthetic revelation,\" eventually weaving the material into The Varieties of Religious Experience. In Washington, James Mooney's Bureau of American Ethnology fieldwork on the Ghost Dance and the Kiowa peyote ceremony produces the first serious anthropological treatment of Indigenous visionary practice. The categories that will shape the twentieth century — addiction, hallucination, mystical experience — are essentially in place by 1900.",
      "*This is a placeholder summary. A full description will be added later.*"
    ]
  },
  {
    slug: "1900-1942",
    label: "1900–1942",
    eyebrow: "Mescaline & Modernism",
    shortDescription:
      "Klüver and Beringer on mescaline, Lewin's Phantastica, the Native American Church, and the modernist literary imagination.",
    longDescription:
      "In the early twentieth century mescaline became the laboratory drug of psychiatry, anthropology, and literature. Heinrich Klüver studied its visual phenomenology at Chicago, Kurt Beringer published Der Meskalinrausch (1927), and Louis Lewin's Phantastica (1924) coined the modern category of the \"hallucinogen.\" The Native American Church incorporated in Oklahoma in 1918.",
    tagline:
      "Four decades that made mescaline the model hallucinogen.",
    yearStart: 1901,
    yearEnd: 1942,
    icon: "mescaline",
    bannerGradient:
      "linear-gradient(115deg, #2a2520 0%, #5a4530 32%, #a07a4a 64%, #d4ae7a 100%)",
    bannerImage: "/images/eras/1900-1942.jpg",
    keyFigures: [
      { name: "Heinrich Klüver", slug: "heinrich-kluver" },
      { name: "Kurt Beringer", slug: "kurt-beringer" },
      { name: "Louis Lewin", slug: "louis-lewin" },
      { name: "Walter Benjamin", slug: "walter-benjamin" },
      { name: "Aldous Huxley", slug: "aldous-huxley" },
      { name: "Quanah Parker", slug: "quanah-parker" }
    ],
    furtherReading: [
      {
        title: "Mescal and Mechanisms of Hallucinations",
        byline: "Heinrich Klüver · University of Chicago, 1966 (collected work)",
        note: "Klüver's mescaline papers from the 1920s–30s, foundational for the visual neuroscience of hallucination.",
        kind: "Book"
      },
      {
        title: "Phantastica: A Classic Survey on the Use and Abuse of Mind-Altering Plants",
        byline: "Louis Lewin · Stuttgart, 1924; English 1931",
        note: "The book that named and systematized the modern category of the hallucinogen.",
        kind: "Book"
      },
      {
        title: "The Peyote Religion among the Navaho",
        byline: "David F. Aberle · Aldine, 1966",
        note: "Anthropological history of peyote religion organizing in the early twentieth century.",
        kind: "Book"
      },
      {
        title: "On Hashish",
        byline: "Walter Benjamin · Suhrkamp, 1972; English 2006",
        note: "Benjamin's late-Weimar protocols and reflections, situating hashish within the modernist project.",
        kind: "Book"
      }
    ]
  },
  {
    slug: "1943-1962",
    label: "1943–1962",
    eyebrow: "The Discovery Decades",
    shortDescription:
      "Hofmann's bicycle day, Wasson's velada, Huxley's Doors of Perception, MKULTRA, and the first thousand clinical studies — twenty years that recast the modern category of the psychedelic.",
    longDescription:
      "April 19, 1943: Albert Hofmann ingests LSD-25 and pedals home through Basel. The two decades that follow see thousands of clinical studies, the founding of MKULTRA, Wasson's encounter with María Sabina, Huxley's Doors of Perception, and the first cracks in what is still, at this point, a scientific consensus. The era ends on the eve of the counterculture, with the apparatus of the next chapter — Harvard, Sandoz distribution, ethnographic networks — already in place.",
    tagline:
      "From Hofmann's bicycle day to the eve of the counterculture — the laboratory, the clinic, and the covert program convene around a new pharmacology of mind.",
    yearStart: 1943,
    yearEnd: 1962,
    icon: "lsd",
    bannerGradient:
      "linear-gradient(115deg, #2a223a 0%, #574272 28%, #8b6a4a 62%, #d9c08a 100%)",
    bannerImage: "/images/eras/1943-1962.jpg",
    keyFigures: [
      { name: "Albert Hofmann", slug: "albert-hofmann" },
      { name: "R. Gordon Wasson", slug: "r-gordon-wasson" },
      { name: "María Sabina", slug: "maria-sabina" },
      { name: "Aldous Huxley", slug: "aldous-huxley" },
      { name: "Humphry Osmond", slug: "humphry-osmond" },
      { name: "Sidney Gottlieb", slug: "sidney-gottlieb" },
      { name: "Harold Abramson", slug: "harold-abramson" }
    ],
    furtherReading: [
      {
        title: "Acid Dreams: The Complete Social History of LSD",
        byline: "Martin A. Lee & Bruce Shlain · Grove Press, 1985",
        note: "A narrative history of LSD from Hofmann through MKULTRA and into the counterculture.",
        kind: "Book"
      },
      {
        title: "Tripping on Utopia",
        byline: "Benjamin Breen · Grand Central, 2024",
        note: "Margaret Mead, Gregory Bateson, Harold Abramson, and the wartime origins of psychedelic science.",
        kind: "Book"
      },
      {
        title: "The Search for the Manchurian Candidate",
        byline: "John Marks · Times Books, 1979",
        note: "Foundational reconstruction of MKULTRA from declassified files.",
        kind: "Book"
      },
      {
        title: "The Doors of Perception",
        byline: "Aldous Huxley · Chatto & Windus, 1954",
        note: "The single most influential first-person account of mescaline experience in twentieth-century English.",
        kind: "Book"
      }
    ],
    essay: [
      "On April 19, 1943, the Sandoz chemist Albert Hofmann ingested 250 micrograms of a substance he had first synthesized five years earlier and shelved as uninteresting. The bicycle ride home through wartime Basel — vivid, terrifying, transformative — initiates the modern psychedelic era.",
      "What follows in the next two decades is not yet \"the sixties.\" It is, instead, the strange middle period in which LSD circulates almost exclusively through the laboratory, the psychiatric clinic, and the covert intelligence program. Sandoz distributes thousands of ampules to researchers worldwide. The U.S. Army and Central Intelligence Agency fund studies under cover names. Aldous Huxley takes mescaline in Hollywood and writes a book.",
      "By the late 1950s, ethnographers and amateur mycologists begin to bridge the gap between the laboratory and the long history of Indigenous use. R. Gordon Wasson's 1955 velada with María Sabina in Huautla de Jiménez, reported in Life two years later, opens a channel through which the postwar laboratory will encounter — and very often misunderstand — much older traditions. By 1962 the conditions are in place for the cultural rupture that the next era will deliver.",
      "*This is a placeholder summary. A full description will be added later.*"
    ]
  },
  {
    slug: "1963-1979",
    label: "1963–1979",
    eyebrow: "Counterculture & Prohibition",
    shortDescription:
      "From the Harvard Psilocybin Project's collapse to the Controlled Substances Act and the long shadow of prohibition; the years in which \"psychedelic\" became a public word.",
    longDescription:
      "Timothy Leary leaves Harvard. The Merry Pranksters travel. LSD becomes a Schedule I substance. Therapeutic research is shut down almost everywhere. Underground chemists, MAPS-precursor networks, and a growing literature of trip reports keep the practice alive even as the institutional door closes.",
    tagline:
      "Counterculture, prohibition, and the abrupt end of the first wave of clinical research — the years in which \"psychedelic\" became a public word.",
    yearStart: 1963,
    yearEnd: 1979,
    icon: "counterculture",
    bannerGradient:
      "linear-gradient(115deg, #3a224a 0%, #7a3a82 28%, #c26a4a 62%, #f0c280 100%)",
    bannerImage: "/images/eras/1963-1979.jpg",
    keyFigures: [
      { name: "Timothy Leary", slug: "timothy-leary" },
      { name: "Richard Alpert", slug: "richard-alpert" },
      { name: "Stanislav Grof", slug: "stanislav-grof" },
      { name: "Alexander Shulgin", slug: "alexander-shulgin" },
      { name: "Carlos Castaneda", slug: "carlos-castaneda" },
      { name: "Terence McKenna", slug: "terence-mckenna" }
    ],
    furtherReading: [
      {
        title: "Storming Heaven: LSD and the American Dream",
        byline: "Jay Stevens · Atlantic Monthly Press, 1987",
        note: "A literary cultural history that pairs well with Lee & Shlain's more investigative approach.",
        kind: "Book"
      },
      {
        title: "The Harvard Psychedelic Club",
        byline: "Don Lattin · HarperOne, 2010",
        note: "Leary, Alpert, Smith, and Weil at Harvard and after — the institutional rupture in narrative form.",
        kind: "Book"
      },
      {
        title: "PIHKAL: A Chemical Love Story",
        byline: "Alexander & Ann Shulgin · Transform Press, 1991",
        note: "Shulgin's autobiographical pharmacology, covering the underground chemistry of these years.",
        kind: "Book"
      }
    ]
  },
  {
    slug: "1980-present",
    label: "1980–Present",
    eyebrow: "Underground & Renaissance",
    shortDescription:
      "Decades of underground practice, the rave-era return of MDMA, the founding of MAPS, and the clinical-trial renaissance that begins in the 2000s.",
    longDescription:
      "From the Esalen workshops of the 1980s to MAPS-led MDMA-PTSD trials and the Johns Hopkins psilocybin program, the contemporary era is shaped by a long underground continuity and a new wave of FDA-regulated research — alongside an ayahuasca tourism boom, indigenous reciprocity debates, decriminalization in U.S. cities, and renewed scrutiny of historical sources.",
    tagline:
      "The long underground, the rave-era return, and the clinical-trial renaissance — psychedelic history in the present tense.",
    yearStart: 1980,
    icon: "therapy",
    bannerGradient:
      "linear-gradient(115deg, #1f2630 0%, #2f4858 30%, #7a8f9c 60%, #d4d8c8 100%)",
    bannerImage: "/images/eras/1980-present.jpg",
    keyFigures: [
      { name: "Rick Doblin", slug: "rick-doblin" },
      { name: "Roland Griffiths", slug: "roland-griffiths" },
      { name: "Ann Shulgin", slug: "ann-shulgin" },
      { name: "Kathleen Harrison", slug: "kathleen-harrison" },
      { name: "Michael Pollan", slug: "michael-pollan" }
    ],
    furtherReading: [
      {
        title: "How to Change Your Mind",
        byline: "Michael Pollan · Penguin, 2018",
        note: "The book that introduced the clinical renaissance to a general audience.",
        kind: "Book"
      },
      {
        title: "Psychedelic Medicine: The Healing Powers of LSD, MDMA, Psilocybin, and Ayahuasca",
        byline: "Richard Louis Miller (ed.) · Park Street, 2017",
        note: "Interviews with the principal investigators driving the contemporary revival.",
        kind: "Book"
      },
      {
        title: "MDMA-Assisted Therapy for Severe PTSD: Phase 3 Trial",
        byline: "Mitchell et al. · Nature Medicine, 2021",
        note: "The pivotal trial that brought psychedelic-assisted therapy to the threshold of FDA approval.",
        kind: "Article"
      }
    ]
  }
];

export function getEraBySlug(slug: string) {
  return ERAS.find((era) => era.slug === slug);
}

export function getEraForYear(year?: number | null) {
  if (!year) return undefined;
  return ERAS.find((era) => sourceMatchesEra(year, era));
}

export function eraHref(era: Pick<EraDefinition, "slug">) {
  return `/eras/${era.slug}`;
}

export function sourceMatchesEra(year: number, era: EraDefinition) {
  if (era.yearStart !== undefined && year < era.yearStart) return false;
  if (era.yearEnd !== undefined && year > era.yearEnd) return false;
  return true;
}

export function countSourcesInEra(sources: Array<{ year: number }>, era: EraDefinition) {
  return sources.filter((source) => sourceMatchesEra(source.year, era)).length;
}

export function archiveQueryHrefForEra(era: EraDefinition) {
  const params = new URLSearchParams();
  if (era.yearStart !== undefined) params.set("yearStart", String(era.yearStart));
  if (era.yearEnd !== undefined) params.set("yearEnd", String(era.yearEnd));
  return `/archive?${params.toString()}`;
}

export function bannerBackground(era: EraDefinition) {
  if (era.bannerImage) {
    return `url(${era.bannerImage}) center/cover no-repeat, ${era.bannerGradient}`;
  }
  return era.bannerGradient;
}

export function adjacentEras(slug: string) {
  const index = ERAS.findIndex((era) => era.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return {
    previous: index > 0 ? ERAS[index - 1] : undefined,
    next: index < ERAS.length - 1 ? ERAS[index + 1] : undefined
  };
}
