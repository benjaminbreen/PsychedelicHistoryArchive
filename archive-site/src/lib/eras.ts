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
      "Archaeological and earliest textual evidence for ritual intoxication and visionary practice — Tassili rock art, Chavín San Pedro, soma, Eleusis, classical pharmacology.",
    longDescription:
      "From Tassili n'Ajjer mushroom-figure panels to Chavín de Huántar's San Pedro iconography, from soma in the Rigveda to Greek discussions of kykeon and the Eleusinian Mysteries, the era's evidence is overwhelmingly material: rock art, ceramics, mummified plants, and a thin layer of canonical text. Reading it requires its own interpretive apparatus, and the questions it sustains — what did they take, how, with what meaning — remain genuinely open.",
    tagline:
      "Rock art, ritual ceramics, sacred grains: the deep prehistory and early antiquity of altered states, read mostly through material remains.",
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
    furtherReading: [
      {
        title: "The Road to Eleusis: Unveiling the Secret of the Mysteries",
        byline: "R. Gordon Wasson, Albert Hofmann & Carl A. P. Ruck · Harcourt Brace, 1978",
        note: "The ergot-kykeon hypothesis that reframed scholarship on the Eleusinian Mysteries.",
        kind: "Book"
      },
      {
        title: "Soma: Divine Mushroom of Immortality",
        byline: "R. Gordon Wasson · Harcourt Brace, 1968",
        note: "The Amanita-soma argument; contested, generative, still cited.",
        kind: "Book"
      },
      {
        title: "Hallucinogens and Shamanism in Native South American Religions",
        byline: "Michael J. Harner (ed.) · Oxford, 1973",
        note: "Foundational essays on Andean and Amazonian visionary traditions extending into deep prehistory.",
        kind: "Book"
      }
    ],
    essay: [
      "The evidence for human engagement with psychoactive substances in the deep past is overwhelmingly material rather than textual. Rock panels at Tassili n'Ajjer in the Algerian Sahara, dated to the seventh millennium BCE, show bee-headed dancers cradling what may be mushrooms; at Chavín de Huántar in the central Peruvian Andes, ceramic vessels and carved stones from the first millennium BCE depict the San Pedro cactus alongside fanged transformative figures. Across Eurasia, the discovery of cannabis residue in Pazyryk burials, opium poppy capsules in late Neolithic Mediterranean tombs, and amanita-fungus depictions on bronze-age objects all testify to ritual lives we can glimpse only in their material traces.",
      "By the first millennium BCE, the textual record begins to thicken. The Rigveda's hymns to soma — composed in northwestern India between roughly 1500 and 1000 BCE — preserve liturgical detail about a divine intoxicant whose botanical identity has been argued over for two centuries. The Eleusinian Mysteries, observed annually at Eleusis from at least the seventh century BCE until their suppression in 392 CE, involved the drinking of kykeon under conditions of strict secrecy that classical authors honored. Greek and Roman natural-philosophical writing — Theophrastus, Pliny, Dioscorides — catalogues opium, mandrake, henbane, and hemp with practical sobriety. By 500 CE the apparatus of medical writing has stabilized; the visionary remains, mostly, off the page.",
      "The archive's holdings for this era therefore lean heavily on iconography, archaeological description, and a small set of canonical texts. Reading them requires a double awareness: of what the maker or writer intended, and of what their object or word may have indexed in practices the historical record does not preserve."
    ]
  },
  {
    slug: "500-1500",
    label: "500–1500",
    eyebrow: "Medieval Worlds, Pre-Columbian Americas",
    shortDescription:
      "Mexica and Maya mushroom cults, Sufi cannabis treatises, European flying ointments, Bwiti origins, Vedic ritual continuities — a thousand years of regional traditions that barely speak to one another.",
    longDescription:
      "The medieval millennium is, for this archive, the era in which distinct regional traditions of intoxication and vision develop in near-isolation. Mexica and Maya classic-period mushroom cults produce the Mixtec codices and the carved mushroom stones of highland Guatemala. Sufi poets and Arab botanists — Ibn al-Baytar most influentially — assemble a sophisticated literature of hashish. European witchcraft trial records and herbals record the use of solanaceous \"flying ointments.\" Bwiti and iboga emerge in West Central Africa. Each tradition has its own evidentiary culture; the archive's job is to keep them legible together.",
    tagline:
      "A thousand-year bridge era in which Mesoamerican, Islamic, European, African, and Vedic traditions of altered states develop in near-isolation.",
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
      "Spanish chronicles of teonanácatl and peyote, suppression and survival of indigenous practice, first European reports of ayahuasca and kava, the global apothecary of the long Enlightenment.",
    longDescription:
      "From Sahagún's compilations of Mexica testimony in the Florentine Codex to José de Acosta's natural histories, from the Inquisition's pursuit of peyote to Hans Sloane's collecting in the Caribbean and Joseph Banks's Pacific voyages, the three centuries of the long early modern see the global pharmacopoeia assembled — and indigenous practice both suppressed and resilient. The era's sources are chronicles, inquisitorial trial records, herbals, ships' surgeons' journals, and the first sustained European reports of substances that would only later become central to Western pharmacology.",
    tagline:
      "Conquest ethnography, colonial pharmacology, and the slow assembly of a global apothecary — three centuries that set the terms for what followed.",
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
      "Between 1500 and 1800, European powers and the societies they encountered, conquered, and traded with built — sometimes collaboratively, sometimes violently — the first global pharmacopoeia. The earliest substantial European-language descriptions of substances that would later become central to the psychedelic story belong to this era: Sahagún's Mexica informants on teonanácatl and peyotl in the Florentine Codex; José de Acosta's Historia Natural; the Inquisition's prosecutions of curanderos in seventeenth-century Mexico; the East India Company's officers reporting on bhang, kava, and betel from the Indian Ocean rim.",
      "These sources rarely use the conceptual vocabulary we would recognize today. \"Intoxication,\" \"witchcraft,\" \"frenzy,\" \"the Devil's herb,\" \"sleep,\" and \"melancholy\" are pressed into service to describe what may have been, in their original contexts, sacramental experiences. Reading them requires a double attention: to what the writer believed was happening, and to the practices being described that exceeded their conceptual frame.",
      "By the eighteenth century, the apparatus of Linnaean botany and the medical-collegiate medical journal begins to absorb this knowledge, smoothing earlier wonder and horror into the language of systematic natural history. The era ends with Humphry Davy at the Pneumatic Institution and the threshold of the modern laboratory."
    ]
  },
  {
    slug: "1800-1850",
    label: "1800–1850",
    eyebrow: "Romantic Pharmacology",
    shortDescription:
      "Davy's nitrous oxide, Coleridge and De Quincey, Moreau de Tours's Du Hachisch — the first sustained Anglophone and Francophone literature of self-experiment with altered states.",
    longDescription:
      "Humphry Davy inhales nitrous oxide at the Pneumatic Institution in 1800 and writes the first widely circulated account of an induced altered state in English. Within a generation Coleridge and De Quincey have made opium a literary subject; Jacques-Joseph Moreau de Tours, working at the Bicêtre, will publish Du Hachisch et de l'Aliénation Mentale (1845), the first major clinical psychiatric work on a hallucinogen. The era invents the genre of the first-person introspective drug report.",
    tagline:
      "Self-experiment as Romantic vocation: the first half-century in which the Anglophone and Francophone worlds learned to write seriously about altered states.",
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
      "On April 9, 1799, Humphry Davy inhaled nitrous oxide at the Pneumatic Institution in Bristol and recorded the experience in prose that the next half-century would treat as a model. Researches, Chemical and Philosophical (1800) opens the modern Anglophone literature of self-experiment with altered states. Within a generation Coleridge would publish 'Kubla Khan,' De Quincey the Confessions of an English Opium-Eater (1821), and Théophile Gautier, in Paris, his sketches of the Club des Hashischins.",
      "The era's signature genre is the introspective first-person account: the experimenter is the experiment, and the experimental apparatus is the prose itself. The Romantic conviction that subjective experience is itself a form of knowledge — defensible against the encroachments of mechanistic science — gives these documents their argumentative force. They are, simultaneously, scientific reports and literary objects.",
      "In Paris, Jacques-Joseph Moreau de Tours, working at the Bicêtre with patients and on himself, produces Du Hachisch et de l'Aliénation Mentale (1845) — the first sustained clinical psychiatric treatise on a hallucinogen, and arguably the first articulation of what Heffter, James, and Klüver will later develop into a full research program."
    ]
  },
  {
    slug: "1850-1900",
    label: "1850–1900",
    eyebrow: "Psychonauts & Isolation",
    shortDescription:
      "Mitchell on mescal, Heffter isolating mescaline, William James's anaesthetic revelation, Mooney's Ghost Dance fieldwork — the lab, the clinic, and the ethnographic field site emerge.",
    longDescription:
      "Across the second half of the nineteenth century, the substances of the previous era are isolated, named, and absorbed into laboratory pharmacology — cocaine in 1860, mescaline by Arthur Heffter in 1897 — while ethnographers like James Mooney begin to document indigenous traditions in their own terms. Weir Mitchell publishes the first scientific account of mescal in 1896; William James lectures on the anaesthetic revelation; Havelock Ellis writes for the Contemporary Review on his mescaline experiment. The categories that will shape the next century — addiction, intoxication, hallucination, mystical experience — are essentially in place by 1900.",
    tagline:
      "The half-century in which the laboratory, the clinic, and the ethnographic field site converge on the modern category of the hallucinogen.",
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
      "If 1800 to 1850 belongs to the Romantic self-experimenter, the next half-century belongs to the institutions: the laboratory, the medical journal, the asylum, the ethnographic field site, the natural-history museum. Chemists working in French and German laboratories isolate the active alkaloids of the great vegetable intoxicants — cocaine from coca leaves (1860), mescaline from peyote (Arthur Heffter, 1897) — and in doing so transform plants into molecules and cultural practices into pharmacological objects.",
      "In Philadelphia, Weir Mitchell publishes the first scientific account of mescal in 1896; in Boston, William James returns repeatedly to nitrous oxide and what Benjamin Paul Blood had named \"the anaesthetic revelation,\" eventually weaving the material into The Varieties of Religious Experience. In Washington, James Mooney's Bureau of American Ethnology fieldwork on the Ghost Dance and the Kiowa peyote ceremony produces the first serious anthropological treatment of indigenous visionary practice. Havelock Ellis in London writes A New Artificial Paradise for the Contemporary Review.",
      "The categories that will shape the twentieth century — addiction, intoxication, hallucination, mystical experience, ethnographic ritual — are essentially in place by 1900. So is the institutional structure that will carry them forward: the laboratory, the asylum, the journal, the museum."
    ]
  },
  {
    slug: "1900-1942",
    label: "1900–1942",
    eyebrow: "Mescaline & Modernism",
    shortDescription:
      "Klüver and Beringer study mescal visions, Lewin publishes Phantastica, the Native American Church organizes, and a modernist literary imagination takes shape around the laboratory drug.",
    longDescription:
      "The early twentieth century makes mescaline the laboratory drug of psychiatry, anthropology, and modernist literature. Heinrich Klüver studies its visual phenomenology at Chicago; Kurt Beringer publishes Der Meskalinrausch (1927); Louis Lewin's Phantastica (1924) inaugurates the modern category of \"hallucinogen.\" The Native American Church incorporates in Oklahoma in 1918. Walter Benjamin writes his hashish protocols. By the eve of World War II, the conceptual and institutional ground is prepared for what 1943 will bring.",
    tagline:
      "Four decades that make mescaline the model hallucinogen of laboratory psychiatry, anthropology, and the modernist imagination.",
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
        note: "Still the most comprehensive narrative history of LSD from Hofmann through MKULTRA into the counterculture.",
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
      "By the late 1950s, ethnographers and amateur mycologists begin to bridge the gap between the laboratory and the long history of indigenous use. R. Gordon Wasson's 1955 velada with María Sabina in Huautla de Jiménez, reported in Life two years later, opens a channel through which the postwar laboratory will encounter — and very often misunderstand — much older traditions. By 1962 the conditions are in place for the cultural rupture that the next era will deliver."
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
