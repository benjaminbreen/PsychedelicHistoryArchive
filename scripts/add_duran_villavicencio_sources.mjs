#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const importDir = path.join(root, "data", "latin-america-import");

const DURAN_SLUG = "duran-hongos-monteses-teonanacatl";
const VILLAVICENCIO_SLUG = "villavicencio-ayahuasca-geografia-ecuador";
const DURAN_ID = deterministicUuid(`document:${DURAN_SLUG}`);
const VILLAVICENCIO_ID = deterministicUuid(`document:${VILLAVICENCIO_SLUG}`);

const duranTranslation = `_These excerpts from Diego Durán's chronicle gather three sixteenth-century passages on raw "mountain mushrooms" used in Mexica royal festivals. The translation is prepared for the archive from the public-domain 1867 Spanish edition edited by José F. Ramírez; spelling in the Spanish tab is lightly normalized from the printed text and OCR._

#### Tízoc's Coronation Feast

The next day, before dawn, Tlacaelel rose and went to the king's chamber. Waking him, he had him dressed as on the day before, and the two of them went out to dance with several lords. He told the king that his days were now few and that he wished to spend them in his contentment and joy, since in the other world he would no longer dance or sing or enjoy the fragrance of roses and scented flowers, from which the lords who had already passed on were deprived.

As soon as they came out, the great men of the court arrived with rich roses, most finely worked, and garlands of roses and splendid gilded bouquets, and they gave them to the two kings of the two provinces. All the lords and great men of the provinces rose, and to make the feast more solemn they all ate some mountain mushrooms, which they say cause the loss of one's senses. Thus they went out, fully adorned, to the dance. After they had danced for a time, the king again clothed all the lords and gave them rich mantles and jewels, in the same manner already described. This dance and feast and meal, and the distribution of mantles and jewels to all those named above, lasted four days.

#### Ahuitzotl's Coronation: Durán's Note on Mushrooms and Intoxication

I have noted one thing throughout this whole history: it never mentions that they drank wine of any kind in order to become intoxicated, but only mountain mushrooms. They ate these raw, and with them, the history says, they made themselves merry and rejoiced and went somewhat out of their senses. It never mentions wine except for sacrifices or funerals; it only mentions the abundance of cacao that was drunk at these solemnities.

#### Motecuhzoma's Feast of Revelations

When the sacrifice was finished, and the temple steps and courtyard were bathed in human blood, from there they all went to eat raw mushrooms. With that food they all went out of their judgment and became worse than if they had drunk a great deal of wine: so intoxicated and out of their senses that many of them killed themselves with their own hands. Through the force of those mushrooms, they saw visions and had revelations of the future, the devil speaking to them in that intoxication.

After all this was finished and they had returned to themselves, the lords of Tlaxcala, Huexotzinco, Cholula, and Tliliuhquitepec asked royal permission to leave, which was immediately granted. They were given jewels and rich things, each lord receiving weapons and shields with their devices made of rich feathers.

From that day, the history says, Motecuhzoma invited the enemy kings and lords three times a year and made them a great feast. One was at the feast they called the Feast of the Lords; another at the great feast of the banners; and another when they all ate mushrooms, which they called the Feast of Revelations.`;

const duranOriginalSpanish = `#### Fiesta de coronación de Tízoc

Otro día, antes que amaneciese, se levantó Tlacaelel y fuese al aposento del rey y despertándole lo hizo aderezar como el día antes, y ambos a dos salieron a bailar con algunos señores, diciéndole que ya sus días eran pocos y que los quería emplear en su contento y alegría, pues en el otro mundo ya no había de bailar ni cantar ni gozar del olor de las rosas y humazos, de lo cual estaban privados los señores que ya habían pasado.

Luego en saliendo, vinieron los grandes de la corte con ricas rosas muy galanamente obradas y sartas de rosas y humazos galanos y dorados, y dióronlos a los dos reyes de las dos provincias, y todos los señores y grandes de las provincias se levantaron, y para más solemnizar la fiesta comieron todos de unos hongos monteses, que dicen que hacen perder el sentido, y así salieron todos muy aderezados al baile. Después de haber un rato bailado, tornó el rey a vestir a todos los señores y a darles ricas mantas y joyas, a la misma manera que queda dicho, el cual baile y fiesta y comida, y el repartir mantas y joyas a todos los arriba dichos, duró cuatro días.

#### Coronación de Ahuitzotl: nota de Durán sobre hongos y embriaguez

Y he notado una cosa en toda esta historia, que jamás hace memoria de que bebiesen vino de ningún género, para embriagarse, sino solo los hongos monteses, que los comían así crudos, con los cuales, dice la historia, que se alegraban y se regocijaban y salían algo de su sentido, y del vino nunca hace memoria, sino es para los sacrificios o mortuorios; solo hace memoria de la abundancia de cacao que se bebía en estas solemnidades.

#### Fiesta de las revelaciones de Motecuhzoma

Acabado el sacrificio, y quedando las gradas del templo y patio bañadas de sangre humana, de allí iban todos a comer hongos crudos, con la cual comida salían todos de juicio y quedaban peores que si hubieran bebido mucho vino; tan embriagados y fuera de sentido que muchos de ellos se mataban con propia mano, y con la fuerza de aquellos hongos veían visiones y tenían revelaciones de lo porvenir, hablándoles el demonio en aquella embriaguez.

Todo lo cual acabado y ellos vueltos en sí, los señores de Tlaxcala y de Huexotzinco y de Cholula y de Tliliuhquitepec pidieron el beneplácito real para irse, lo cual les fue luego concedido, y les fueron dadas algunas joyas y cosas ricas a cada señor y unas armas y rodelas con sus divisas en ellas de ricas plumas.

Desde este día, cuenta la historia, que tres veces en el año convidaba Motecuhzoma a los reyes y señores enemigos y les hacía gran fiesta; la una era en la fiesta que ellos llamaban de los Señores, y la otra en la gran fiesta de las banderas, y la otra cuando comían todos hongos, que le llamaban la fiesta de las revelaciones.`;

const expertContextPlaceholder = `_This historical-context essay is open for contribution._

Are you a scholar, archivist, community knowledge holder, or subject expert with relevant expertise in this source? Please use the [source issue form](#source-issue-report) at the bottom of this page to propose a short context essay or suggest a contributor. Choose "Other concern" and include "Historical context essay" in the location field.`;

const duranContext = expertContextPlaceholder;

const duranSourceNote = `_Durán's chronicle is one of the clearest early Spanish accounts of mushroom intoxication in central Mexico. These selections bring together a royal coronation mushroom scene, Durán's note on raw mushrooms in the Ahuitzotl coronation chapter, and the later Motecuhzoma passage that calls the mushroom rite a "feast of revelations."_`;

const villavicencioTranslation = `_Manuel Villavicencio's 1858 geography includes one of the most vivid nineteenth-century Spanish descriptions of ayahuasca in Ecuador. The translation is prepared for the archive from the public-domain New York edition; the Spanish transcript preserves the source's period vocabulary while silently correcting a few obvious OCR errors._

#### Ayahuasca in Eastern Ecuador

We will not pass over in silence one of the things that, in our view, will attract attention: a vine used by the Záparos, Santa Marías, Mazanes, and Anguteros to divine, foresee, and answer correctly in difficult cases. They use it to give fitting replies to ambassadors from other tribes when war is being discussed; to discover the enemy's plans by means of this magical drink and take appropriate measures for attack and defense; in the case of a relative's illness, to learn which sorcerer has put him in that state; for making a friendly visit to other tribes; when foreign people arrive, such as travelers; and, finally, to make sure of the love of their women.

The operation is as follows: they take a vine called aya huasca, "vine of the dead or of souls," from which they make a light decoction. The Indigenous man who must give the answers or arrange the plans drinks it, and often all the men who form the council drink it. This beverage is narcotic, as one should suppose, and within a few moments it begins to produce the strangest phenomena. Its action seems directed toward exciting the nervous system: all the senses grow sharper and all the faculties awaken. They feel dizziness and spinning in the head, then the sensation of rising into the air and beginning an aerial voyage.

At first the possessed person begins to see the most delightful images, according to his ideas and knowledge. Indigenous people say they see delightful lakes, forests covered with fruit, beautiful birds that communicate what they wish to know that is pleasant and favorable, and other beauties related to their forest life. After this moment they begin to see terrible beasts ready to tear them apart; their flight fails and they descend to earth to fight with the beasts, who tell them all the misfortunes and disasters that await them.

At that moment the Indigenous drinker, who had been as if in a stupor, rises and tries to seize weapons, insulting his closest friends, who restrain him by force inside the hammock until he falls asleep, which does not take long. As for myself, I can say that when I have taken ayahuasca I have felt dizziness and spinning in the head, then an aerial voyage in which I remember perceiving the most delightful perspectives, great cities, high towers, beautiful parks, and other most beautiful objects. Then I imagined myself abandoned in a forest and attacked by beasts, from which I defended myself. Afterward I had a strong sensation of sleep, from which I remember waking with pain and heaviness in the head and sometimes general malaise.

The Indigenous drinker takes ayahuasca many times for pleasure, but strong people must be nearby to hold him firmly in a hammock, because if he were left at liberty and seized any weapon, perhaps none of the bystanders would escape with their lives. Such are the fury and the boasts that he speaks to the malignant specters. After the final sleep has passed, he gathers the memories he had when he saw the visions and, according to his superstitions, arranges the decisions he must take. Ayahuasca is not allowed to the very young or to women. The effects of this beverage are not inferior to those produced by the opium composition used by Orientals in Asia to immerse themselves in agreeable illusions.`;

const villavicencioOriginalSpanish = `#### Ayahuasca en el Oriente ecuatoriano

No pasaremos en silencio una de las cosas que a nuestro modo de ver llamará la atención, y es un bejuco del cual hacen uso los Záparos, Santa Marías, Mazanes y Anguteros para adivinar, prever y contestar con acierto en los casos difíciles, ya sea para dar respuestas oportunas a los embajadores de las otras tribus cuando se trata de hacer la guerra, ya para descubrir los planes del enemigo por medio de esta mágica bebida y tomar las disposiciones convenientes para el ataque y defensa, ya en caso de enfermedad de un pariente para averiguar cuál brujo lo tiene en ese estado, ya para hacer una visita amistosa a otras tribus, ya cuando les llega gente extraña como viajeros, ya, en fin, para cerciorarse del amor de sus mujeres.

La operación consiste en lo siguiente: toman un bejuco llamado aya huasca (bejuco de muerto o almas) del cual hacen un ligero cocimiento y lo bebe el indio que debe dar las respuestas o arreglar los planes, y muchas veces lo beben todos los indios que forman el congreso. Esta bebida es narcótica, como debe suponerse, y a pocos momentos empieza a producir los más raros fenómenos. Su acción parece dirigirse a excitar el sistema nervioso; todos los sentidos se avivan y todas las facultades se despiertan; sienten vahídos y rodeos de cabeza, luego la sensación de elevarse al aire y comenzar un viaje aéreo.

El poseído empieza a ver en los primeros momentos las imágenes más deliciosas, conforme a sus ideas y conocimientos: los salvajes dicen que ven lagos deliciosos, bosques cubiertos de frutas, aves lindísimas que les comunican lo que ellos desean saber de agradable y favorable, y otras bellezas relativas a su vida salvaje. Pasado este momento empiezan a ver fieras terribles dispuestas a desgarrarlos, les falta el vuelo y bajan a tierra a combatir con las fieras, quienes les comunican todas las desgracias y desventuras que les aguardan.

En este momento se levanta el salvaje que estaba como en estupor y procura tomar las armas, insulta a sus mayores amigos que lo contienen a la fuerza dentro de la hamaca, hasta que se duerma, lo que no tarda mucho en suceder. Yo, por mí, sé decir que cuando he tomado el Ayahuasca he sentido rodeos de cabeza, luego un viaje aéreo en el que recuerdo percibía las perspectivas más deliciosas, grandes ciudades, elevadas torres, hermosos parques y otros objetos bellísimos; luego me figuraba abandonado en un bosque y acometido de algunas fieras, de las que me defendía; en seguida tenía sensación fuerte de sueño, del que recordaba con dolor y pesadez de cabeza y algunas veces malestar general.

El salvaje toma el Ayahuasca muchas veces por placer, pero necesita de personas robustas que estén cerca para sujetarlo fuertemente en una hamaca; porque si se le dejara en libertad y se apoderara de cualquiera arma, tal vez no escaparía con vida ninguno de los circunstantes: tales son la furia y las bravatas que dice a los espectros malignos. Pasado el último sueño recoge los recuerdos que tuvo cuando veía las visiones, y según sus supersticiones arregla las determinaciones que debe tomar. El Ayahuasca no se permite a los muy jóvenes ni a las mujeres: los efectos de esta bebida no son inferiores a los que hace la composición de opio, de la cual se sirven los orientales en Asia para engolfarse en agradables ilusiones.`;

const villavicencioContext = expertContextPlaceholder;

const villavicencioSourceNote = `_Villavicencio's ayahuasca passage is valuable for the archive because it combines ethnographic description, divinatory use, and first-person experience in Spanish in 1858. Although slightly later than the underfilled 1800-1850 bucket, it belongs to the same mid-nineteenth-century scientific and geographic prose world and helps shift the archive away from twentieth-century English-language sources._`;

const people = [
  {
    id: deterministicUuid("person:diego-duran"),
    slug: "diego-duran",
    name: "Diego Durán",
    sort_name: "Durán, Diego",
    birth_year: 1537,
    death_year: 1588,
    bio: "Dominican friar and historian of New Spain whose Historia de las Indias de Nueva España preserved Nahua historical traditions, ritual descriptions, and colonial interpretations of Mexica ceremonial life."
  },
  {
    id: deterministicUuid("person:jose-fernando-ramirez"),
    slug: "jose-fernando-ramirez",
    name: "José F. Ramírez",
    sort_name: "Ramírez, José F.",
    birth_year: 1804,
    death_year: 1871,
    bio: "Mexican historian, bibliographer, and editor who prepared the 1867 publication of Diego Durán's Historia with notes and illustrations."
  },
  {
    id: deterministicUuid("person:manuel-villavicencio"),
    slug: "manuel-villavicencio",
    name: "Manuel Villavicencio",
    sort_name: "Villavicencio, Manuel",
    birth_year: null,
    death_year: null,
    bio: "Ecuadorian physician and geographer whose 1858 Geografía de la República del Ecuador includes a notable Spanish account of ayahuasca use in eastern Ecuador and a first-person description of its effects."
  }
];

const newTags = [
  tag("coronation", "Coronation", "topic"),
  tag("ecuador", "Ecuador", "region"),
  tag("geography", "Geography", "topic"),
  tag("mushrooms", "Mushrooms", "substance"),
  tag("ritual", "Ritual", "topic"),
  tag("visionary-experience", "Visionary experience", "topic")
];

async function main() {
  await fs.mkdir(path.join(importDir, "translations"), { recursive: true });
  await fs.writeFile(path.join(importDir, "translations", `${DURAN_SLUG}.md`), `${duranTranslation}\n`, "utf8");
  await fs.writeFile(path.join(importDir, "translations", `${VILLAVICENCIO_SLUG}.md`), `${villavicencioTranslation}\n`, "utf8");

  const duranPdf = `pdfs/${DURAN_SLUG}/duran-hongos-monteses-teonanacatl-excerpts.pdf`;
  const villavicencioPdf = `pdfs/${VILLAVICENCIO_SLUG}/villavicencio-ayahuasca-geografia-ecuador-excerpt.pdf`;
  const duranStorage = `documents/${DURAN_ID}/pdfs/${DURAN_SLUG}/duran-hongos-monteses-teonanacatl-excerpts.pdf`;
  const villavicencioStorage = `documents/${VILLAVICENCIO_ID}/pdfs/${VILLAVICENCIO_SLUG}/villavicencio-ayahuasca-geografia-ecuador-excerpt.pdf`;

  const documents = await readJson("documents");
  upsertBy(documents, "id", [
    {
      id: DURAN_ID,
      slug: DURAN_SLUG,
      title: "Hongos monteses in Durán's Historia de las Indias de Nueva España",
      subtitle: "Mushrooms, coronations, and the feast of revelations",
      display_date: "c. 1581; published 1867",
      date_start: 1581,
      date_end: 1581,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "Spanish",
      content_language: "Spanish",
      translation_language: "English",
      translation_text_path: `translations/${DURAN_SLUG}.md`,
      translation_provider: "archive",
      translation_note: "Archive translation from selected Spanish passages in the public-domain 1867 edition.",
      reader_mode: "translation",
      region: "New Spain; Mexico; Tenochtitlan",
      publication_place: "Mexico City",
      publisher: "Imprenta de J. M. Andrade y F. Escalante",
      summary: "Three passages from Diego Durán's Historia describing raw mountain mushrooms in Mexica royal ceremonial life: a coronation feast, Durán's note that mushrooms rather than wine appear as the chronicle's intoxicant, and Motecuhzoma's feast of revelations.",
      abstract: "Three passages from Diego Durán's Historia describing raw mountain mushrooms in Mexica royal ceremonial life: a coronation feast, Durán's note that mushrooms rather than wine appear as the chronicle's intoxicant, and Motecuhzoma's feast of revelations.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive scan. Excerpt PDF includes volume 1 pages 319-322, 336-338, and 429-432 from the 1867 edition.",
      citation: "Durán, Diego. Historia de las Indias de Nueva España y islas de Tierra Firme. Published with notes and illustrations by José F. Ramírez. Vol. 1. Mexico City: Imprenta de J. M. Andrade y F. Escalante, 1867, pp. 319-322, 336-338, 429-432.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive scan of the 1867 Mexico City edition.",
      source_url: "https://archive.org/details/historiadelasind01dur",
      external_access_url: "https://archive.org/download/historiadelasind01dur/historiadelasind01dur.pdf",
      access_type: "hosted",
      hosting_status: "translation_transcript_pdf",
      cover_image_path: `documents/${DURAN_ID}/pdf-thumbnails/${DURAN_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${DURAN_ID}/pdf-thumbnails/${DURAN_SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    },
    {
      id: VILLAVICENCIO_ID,
      slug: VILLAVICENCIO_SLUG,
      title: "Ayahuasca in Villavicencio's Geografía de la República del Ecuador",
      subtitle: "An 1858 Ecuadorian account of ayahuasca visions and divination",
      display_date: "1858",
      date_start: 1858,
      date_end: 1858,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "Spanish",
      content_language: "Spanish",
      translation_language: "English",
      translation_text_path: `translations/${VILLAVICENCIO_SLUG}.md`,
      translation_provider: "archive",
      translation_note: "Archive translation from selected Spanish passages in the public-domain 1858 edition.",
      reader_mode: "translation",
      region: "Ecuador; Amazonia; Napo-Pastaza",
      publication_place: "New York",
      publisher: "Imprenta de Robert Craighead",
      summary: "Manuel Villavicencio's 1858 geography gives an early Spanish account of ayahuasca among Indigenous groups of eastern Ecuador, including divination, warfare, illness diagnosis, visionary effects, and a first-person report of his own experience.",
      abstract: "Manuel Villavicencio's 1858 geography gives an early Spanish account of ayahuasca among Indigenous groups of eastern Ecuador, including divination, warfare, illness diagnosis, visionary effects, and a first-person report of his own experience.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive/Google Books scan. Excerpt PDF includes pages 371-373 of the 1858 edition.",
      citation: "Villavicencio, Manuel. Geografía de la República del Ecuador. New York: Imprenta de Robert Craighead, 1858, pp. 371-373.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive/Google Books scan of the 1858 New York edition.",
      source_url: "https://archive.org/details/geografiadelare00villgoog",
      external_access_url: "https://archive.org/download/geografiadelare00villgoog/geografiadelare00villgoog_text.pdf",
      access_type: "hosted",
      hosting_status: "translation_transcript_pdf",
      cover_image_path: `documents/${VILLAVICENCIO_ID}/pdf-thumbnails/${VILLAVICENCIO_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${VILLAVICENCIO_ID}/pdf-thumbnails/${VILLAVICENCIO_SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    }
  ]);
  await writeJson("documents", documents);

  const peopleRows = await readJson("people");
  upsertBy(peopleRows, "id", people);
  await writeJson("people", peopleRows);

  const tagRows = await readJson("tags");
  upsertBy(tagRows, "id", newTags);
  await writeJson("tags", tagRows);

  const tagCache = new Map(tagRows.map((row) => [row.slug, row.id]));
  for (const nextTag of newTags) tagCache.set(nextTag.slug, nextTag.id);

  const documentPeople = await readJson("document_people");
  upsertBy(documentPeople, ["document_id", "person_id", "role"], [
    { document_id: DURAN_ID, person_id: personId("diego-duran"), role: "author" },
    { document_id: DURAN_ID, person_id: personId("jose-fernando-ramirez"), role: "editor" },
    { document_id: VILLAVICENCIO_ID, person_id: personId("manuel-villavicencio"), role: "author" }
  ]);
  await writeJson("document_people", documentPeople);

  const documentTags = await readJson("document_tags");
  upsertBy(documentTags, ["document_id", "tag_id"], [
    ...tagLinks(DURAN_ID, [
      "pre-1800",
      "book-excerpt",
      "latin-america",
      "new-spain",
      "mexico",
      "colonial-mexico",
      "teonanacatl",
      "psilocybin",
      "mushrooms",
      "coronation",
      "ritual",
      "religion",
      "indigenous-knowledge",
      "ethnobotany",
      "visionary-experience",
      "psychoactive-plants"
    ], tagCache),
    ...tagLinks(VILLAVICENCIO_ID, [
      "1800-1950",
      "book-excerpt",
      "latin-america",
      "south-america",
      "amazonia",
      "ecuador",
      "ayahuasca",
      "ethnobotany",
      "ethnography",
      "indigenous-knowledge",
      "medicine",
      "geography",
      "field-science",
      "visionary-experience",
      "psychoactive-plants"
    ], tagCache)
  ]);
  await writeJson("document_tags", documentTags);

  const documentSections = await readJson("document_sections");
  upsertBy(documentSections, "id", [
    section(DURAN_ID, 0, "Introduction", "source_note", duranSourceNote),
    section(DURAN_ID, 1, "Original Spanish", "transcript", duranOriginalSpanish),
    section(DURAN_ID, 2, "Historical context", "historical_context", duranContext),
    section(VILLAVICENCIO_ID, 0, "Introduction", "source_note", villavicencioSourceNote),
    section(VILLAVICENCIO_ID, 1, "Original Spanish", "transcript", villavicencioOriginalSpanish),
    section(VILLAVICENCIO_ID, 2, "Historical context", "historical_context", villavicencioContext)
  ]);
  await writeJson("document_sections", documentSections);

  const files = await readJson("files");
  upsertBy(files, "id", [
    pdfFile(DURAN_ID, DURAN_SLUG, duranPdf, duranStorage),
    pdfFile(VILLAVICENCIO_ID, VILLAVICENCIO_SLUG, villavicencioPdf, villavicencioStorage)
  ]);
  await writeJson("files", files);

  const assets = await readJson("assets");
  upsertBy(assets, "id", [
    pdfAsset(DURAN_ID, DURAN_SLUG, duranPdf, duranStorage, "https://archive.org/download/historiadelasind01dur/historiadelasind01dur.pdf"),
    pdfAsset(VILLAVICENCIO_ID, VILLAVICENCIO_SLUG, villavicencioPdf, villavicencioStorage, "https://archive.org/download/geografiadelare00villgoog/geografiadelare00villgoog_text.pdf")
  ]);
  await writeJson("assets", assets);

  await updateArchiveSources();
  await mirrorCsv("documents", documents);
  await mirrorCsv("people", peopleRows);
  await mirrorCsv("tags", tagRows);
  await mirrorCsv("document_people", documentPeople);
  await mirrorCsv("document_tags", documentTags);
  await mirrorCsv("files", files);
  await mirrorCsv("assets", assets);

  console.log(`Staged ${DURAN_SLUG} and ${VILLAVICENCIO_SLUG}`);
}

function personId(slug) {
  const row = people.find((person) => person.slug === slug);
  if (!row) throw new Error(`Missing person ${slug}`);
  return row.id;
}

function tagLinks(documentId, slugs, tagCache) {
  return slugs.map((slug) => {
    const tagId = tagCache.get(slug);
    if (!tagId) throw new Error(`Missing tag ${slug}`);
    return { document_id: documentId, tag_id: tagId };
  });
}

function tag(slug, name, tag_type) {
  return {
    id: deterministicUuid(`tag:${slug}`),
    slug,
    name,
    description: "",
    tag_type
  };
}

function section(documentId, position, heading, sectionType, body) {
  return {
    id: deterministicUuid(`${documentId}:section:${position}:${heading}`),
    document_id: documentId,
    position,
    heading,
    section_type: sectionType,
    body,
    body_format: "markdown"
  };
}

function pdfFile(documentId, slug, localPath, storagePath) {
  const bytes = fsSync.readFileSync(path.join(importDir, localPath));
  return {
    id: deterministicUuid(`${documentId}:original-pdf`),
    document_id: documentId,
    page_id: null,
    kind: "original_pdf",
    storage_path: storagePath,
    mime_type: "application/pdf",
    byte_size: bytes.length,
    width: null,
    height: null,
    checksum: sha256(bytes)
  };
}

function pdfAsset(documentId, slug, localPath, storagePath, sourceUrl) {
  const bytes = fsSync.readFileSync(path.join(importDir, localPath));
  return {
    id: deterministicUuid(`${documentId}:original-pdf`),
    document_id: documentId,
    document_slug: slug,
    source_url: sourceUrl,
    local_path: localPath,
    storage_path: storagePath,
    kind: "original_pdf",
    mime_type: "application/pdf",
    downloaded: true,
    sha256: sha256(bytes),
    byte_size: bytes.length,
    width: null,
    height: null
  };
}

async function updateArchiveSources() {
  const archivePath = path.join(importDir, "archive_sources.json");
  let rows = [];
  try {
    rows = JSON.parse(await fs.readFile(archivePath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  upsertBy(rows, "slug", [
    {
      id: DURAN_SLUG.replaceAll("-", "_"),
      slug: DURAN_SLUG,
      title: "Hongos monteses in Durán's Historia de las Indias de Nueva España",
      author: "Diego Durán",
      year: 1581,
      displayDate: "c. 1581; published 1867",
      type: "Book Excerpt",
      medium: "Text",
      era: "Pre-1800",
      region: "New Spain; Mexico; Tenochtitlan",
      language: "Spanish",
      tags: ["Pre-1800", "Book excerpt", "Latin America", "New Spain", "Mexico", "Teonanácatl", "Psilocybin", "Mushrooms", "Coronation", "Ritual", "Religion", "Ethnobotany"],
      people: ["Diego Durán", "José F. Ramírez"],
      substances: ["Teonanácatl", "Mushrooms"],
      summary: "Three passages from Diego Durán's Historia describing raw mountain mushrooms in Mexica royal ceremonial life, including a coronation feast and the feast of revelations.",
      excerpt: "Comieron todos de unos hongos monteses, que dicen que hacen perder el sentido.",
      citation: "Durán, Diego. Historia de las Indias de Nueva España y islas de Tierra Firme. Vol. 1. Mexico City: Imprenta de J. M. Andrade y F. Escalante, 1867.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/historiadelasind01dur",
      accessType: "hosted",
      hostingStatus: "translation_transcript_pdf",
      wordCount: wordCount(duranOriginalSpanish),
      addedDate: "2026-07-08",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${DURAN_ID}/pdf-thumbnails/${DURAN_SLUG}/page-001.jpg`,
      transcript: duranOriginalSpanish,
      translation: duranTranslation
    },
    {
      id: VILLAVICENCIO_SLUG.replaceAll("-", "_"),
      slug: VILLAVICENCIO_SLUG,
      title: "Ayahuasca in Villavicencio's Geografía de la República del Ecuador",
      author: "Manuel Villavicencio",
      year: 1858,
      displayDate: "1858",
      type: "Book Excerpt",
      medium: "Text",
      era: "1800-1950",
      region: "Ecuador; Amazonia; Napo-Pastaza",
      language: "Spanish",
      tags: ["1800-1950", "Book excerpt", "Latin America", "South America", "Amazonia", "Ecuador", "Ayahuasca", "Ethnobotany", "Ethnography", "Indigenous knowledge", "Medicine", "Geography"],
      people: ["Manuel Villavicencio"],
      substances: ["Ayahuasca"],
      summary: "Manuel Villavicencio's 1858 geography gives an early Spanish account of ayahuasca among Indigenous groups of eastern Ecuador, including divination, warfare, illness diagnosis, visionary effects, and a first-person report.",
      excerpt: "Toman un bejuco llamado aya huasca (bejuco de muerto o almas).",
      citation: "Villavicencio, Manuel. Geografía de la República del Ecuador. New York: Imprenta de Robert Craighead, 1858.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/geografiadelare00villgoog",
      accessType: "hosted",
      hostingStatus: "translation_transcript_pdf",
      wordCount: wordCount(villavicencioOriginalSpanish),
      addedDate: "2026-07-08",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${VILLAVICENCIO_ID}/pdf-thumbnails/${VILLAVICENCIO_SLUG}/page-001.jpg`,
      transcript: villavicencioOriginalSpanish,
      translation: villavicencioTranslation
    }
  ]);

  await fs.writeFile(archivePath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(importDir, "archive_sources.jsonl"), `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
}

function upsertBy(rows, key, nextRows) {
  for (const next of nextRows) {
    const index = rows.findIndex((row) => conflictValue(row, key) === conflictValue(next, key));
    if (index === -1) rows.push(next);
    else rows[index] = { ...rows[index], ...next };
  }
}

function conflictValue(row, key) {
  if (Array.isArray(key)) return key.map((item) => String(row[item] ?? "")).join("\u0001");
  return String(row[key] ?? "");
}

async function readJson(name) {
  const filePath = path.join(importDir, `${name}.json`);
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function writeJson(name, value) {
  await fs.writeFile(path.join(importDir, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function mirrorCsv(name, rows) {
  const csvPath = path.join(importDir, `${name}.csv`);
  try {
    await fs.access(csvPath);
  } catch {
    return;
  }

  const existing = await fs.readFile(csvPath, "utf8");
  const newline = existing.includes("\r\n") ? "\r\n" : "\n";
  const existingColumns = existing.split(/\r?\n/, 1)[0].split(",");
  const extraColumns = unique(rows.flatMap((row) => Object.keys(row))).filter((column) => !existingColumns.includes(column));
  const columns = [...existingColumns, ...extraColumns];
  const body = rows.map((row) => columns.map((column) => csvValue(row[column])).join(",")).join(newline);
  await fs.writeFile(csvPath, `${columns.join(",")}${newline}${body}${newline}`, "utf8");
}

function csvValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "True" : "False";
  const stringValue = String(value);
  if (/[",\r\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

function deterministicUuid(value) {
  const hash = crypto.createHash("sha1").update(value).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function unique(values) {
  return [...new Set(values)];
}

function wordCount(text) {
  return text.match(/\b\w+\b/g)?.length ?? 0;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
