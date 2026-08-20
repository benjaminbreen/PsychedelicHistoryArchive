#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const importDir = path.join(root, "data", "latin-america-import");

const RUIZ_SLUG = "ololiuhqui-peyote-idolatrias-supersticiones";
const SPRUCE_SLUG = "spruce-caapi-niopo-remarkable-narcotics";
const RUIZ_ID = deterministicUuid(`document:${RUIZ_SLUG}`);
const SPRUCE_ID = deterministicUuid(`document:${SPRUCE_SLUG}`);

const people = [
  {
    id: deterministicUuid("person:pedro-ponce-de-leon"),
    slug: "pedro-ponce-de-leon",
    name: "Pedro Ponce de León",
    sort_name: "Ponce de León, Pedro",
    birth_year: 1546,
    death_year: 1628,
    bio: "Spanish secular priest in New Spain whose brief anti-idolatry treatise recorded Indigenous ritual practices, divination, and uses of ololiuhqui and peyote."
  },
  {
    id: deterministicUuid("person:hernando-ruiz-de-alarcon"),
    slug: "hernando-ruiz-de-alarcon",
    name: "Hernando Ruiz de Alarcón",
    sort_name: "Ruiz de Alarcón, Hernando",
    birth_year: null,
    death_year: null,
    bio: "Seventeenth-century Mexican ecclesiastical judge and priest whose 1629 treatise on Indigenous ritual practice includes extended passages on ololiuhqui, peyote, healing, and divination."
  },
  {
    id: deterministicUuid("person:jacinto-de-la-serna"),
    slug: "jacinto-de-la-serna",
    name: "Jacinto de la Serna",
    sort_name: "Serna, Jacinto de la",
    birth_year: null,
    death_year: null,
    bio: "Seventeenth-century Mexican priest and author of the Manual de ministros de indios, a guide for clergy that catalogued Indigenous rites, healing practices, and colonial anti-idolatry concerns."
  },
  {
    id: deterministicUuid("person:nicolas-leon"),
    slug: "nicolas-leon",
    name: "Nicolás León",
    sort_name: "León, Nicolás",
    birth_year: 1859,
    death_year: 1929,
    bio: "Mexican physician, historian, bibliographer, and editor associated with the Museo Nacional, where he published colonial anti-idolatry texts in the 1890s."
  },
  {
    id: deterministicUuid("person:richard-spruce"),
    slug: "richard-spruce",
    name: "Richard Spruce",
    sort_name: "Spruce, Richard",
    birth_year: 1817,
    death_year: 1893,
    bio: "English botanist whose Amazon and Andes fieldwork produced foundational nineteenth-century descriptions of caapi, niopo, and other Indigenous psychoactive plant preparations."
  },
  {
    id: deterministicUuid("person:alfred-russel-wallace"),
    slug: "alfred-russel-wallace",
    name: "Alfred Russel Wallace",
    sort_name: "Wallace, Alfred Russel",
    birth_year: 1823,
    death_year: 1913,
    bio: "English naturalist and editor of Richard Spruce's Notes of a Botanist on the Amazon and Andes."
  }
];

const tags = [
  tag("1800-1950", "1800-1950", "era"),
  tag("colonial-mexico", "Colonial Mexico", "topic"),
  tag("divination", "Divination", "topic"),
  tag("orinoquia", "Orinoquia", "region"),
  tag("niopo", "Niopo", "substance"),
  tag("yopo", "Yopo", "substance"),
  tag("parica", "Paricá", "substance"),
  tag("field-science", "Field science", "topic")
];

const ruizTranslation = `_These excerpts gather three Spanish colonial anti-idolatry notices on ololiuhqui and peyote from the 1892 Museo Nacional edition. The translation is prepared for the archive from the printed Spanish; spelling in the original tab is lightly normalized from the OCR and should be checked against the PDF before formal quotation._

#### Pedro Ponce de León, "To Know Lost Things and Other Things One Wishes to Know"

They drink ololiuhqui, peyote, and a seed they call tlitliltzin. These are so strong that they deprive them of their senses. They say that someone like a little black figure appears to them and tells them everything they want to know; others say that Our Lord appears to them, and others, the angels. When they do this, they enter a room, shut themselves in, and set a guard to listen to what they say. No one is to speak to them until their delirium has passed, because they become as if mad. Afterward people ask what they have said, and that is taken to be the truth.

#### Hernando Ruiz de Alarcón, "Chapter VI: On the Superstition of Ololiuhqui"

What is called ololiuhqui is a seed like lentils or vetches. When drunk, it deprives one of judgment. It is astonishing to see the faith these unfortunate Indigenous people place in this seed, for when they drink it they consult it as an oracle for everything they wish to know, even things human understanding cannot reach. They use it to learn the cause of illnesses, because almost whenever they suffer wasting illnesses, consumption, persistent diarrhea, or any other long sickness, they attribute it at once to sorcery.

To resolve that doubt, and similar doubts about stolen things and about those responsible, they consult this seed through one of their deceitful doctors. Some of these men have as their office the drinking of this seed for such consultations, and such a doctor is called a _páyni_ because of that office. They pay him very well, bribing him in their fashion with food and drink. If the doctor is not of that office, or wants to excuse himself from that torment, he advises the sick person to drink the seed himself, or to have someone else drink it for him.

Whether it is the doctor or another person who drinks the seed, or whether the drink is peyote, another small root in which they place the same faith as in the seed, the drinker shuts himself alone in a room. Usually this is his oratory, where no one is to enter while the consultation lasts. During that time the consultant is outside himself, and they believe that ololiuhqui or peyote is revealing what they wish to know. When the intoxication or deprivation of judgment has passed, he comes out recounting two thousand fables. Among them the devil sometimes mixes in a few truths, and with these he has them entirely deceived and ensnared.

They also use this drink to find things that have been stolen, lost, or whose location is unknown, and to learn who carried them off or stole them. Going to ololiuhqui as in the earlier case, they affirm as certain and evident whatever, in the time of intoxication, turns over in their imagination, or whatever the devil, father and origin of all deceit, makes them believe and understand. Even when later experience shows them the deception, it is not enough to bring them out of that blindness.

#### Jacinto de la Serna, Manual de ministros de indios

They also have great superstitions with a seed like lentils, which they call ololiuhqui, and with another, larger thing, a root they call peyote. They give these as much veneration as if they were a deity, for by drinking these plants they consult them as an oracle for whatever illnesses they seek to cure, and for whatever things they wish to know: things lost or stolen, and things beyond human knowledge, especially the origin of long and lingering illnesses that they attribute to sorcery.

They consult these plants through their deceitful doctors, who by drinking them answer all these doubts. The one who has this as his office is called _páyni_, which means one who drinks a purge or syrup. They pay such people very well. If the doctor is not very skilled in the office, or wants to excuse himself from the labor caused by drinking these beverages, he advises the sick to drink them, or advises those who wish to know about things stolen or lost, where they are, or who has them, to drink them.

They hold these seeds, and especially ololiuhqui, in such great veneration as if they were God. They light candles to them and keep them in small chests or boxes appointed for this purpose; there they place offerings, and put them on the altars of their oratories, or above their ceilings, or in other secret places in their houses, so that when people search for them they will not easily be found. The same veneration is given to peyote, and so much that it is widely accepted among them. When it must be ground for certain medicines, they say that for it to have its effect it must be ground by the hand of a maiden.`;

const ruizOriginalSpanish = `_Source: Pedro Ponce de León, Hernando Ruiz de Alarcón, and Jacinto de la Serna, in Nicolás León, ed., Idolatrías y supersticiones de los indios (Mexico: Imprenta del Museo Nacional, 1892), pp. 11, 142-147, 385-388. The transcription below is lightly normalized from the public-domain printed edition and OCR; consult the PDF for lineation and exact spelling._

#### Pedro Ponce de León, "Para saber de las cosas perdidas y otras cosas que se quieren saber"

Beben el ololiuhqui, y el peyote, una semilla que llaman tlitliltzin. Son tan fuertes que los priva de sentido y dicen se les aparece uno como negrito que les dice todo lo que quieren; otros dicen se les aparece Nuestro Señor, otros los ángeles. Y cuando hacen esto se meten en un aposento y se encierran, y ponen una guarda para que les oiga lo que dicen, y no les han de hablar hasta que se les ha quitado el desvarío, porque se hacen como locos; y luego preguntan qué han dicho y aquello es lo cierto.

#### Hernando Ruiz de Alarcón, "Capítulo VI: De la superstición del ololiuhqui"

El llamado ololiuhqui es una semilla como lentejas o hieros, la cual bebida priva del juicio. Y es de maravillar la fe que estos desdichados naturales tienen con esta semilla, pues bebiendo, como a oráculo la consultan, para todas cuantas cosas desean saber, hasta aquellas a que el conocimiento humano no puede llegar, como para saber la causa de las enfermedades, porque casi cuantos entre ellos están éticos, tísicos, con cámaras o con cualquiera otra enfermedad de las prolijas, luego lo atribuyen a hechizo.

Para salir desta duda y semejantes, como de cosas hurtadas y de los agresores, consultan esta semilla por medio de uno de sus embusteros médicos, que algunos de ellos tienen por oficio beber esta semilla para semejantes consultas, y el tal médico se llama _páyni_, por el dicho oficio. Para lo cual se lo pagan muy bien, y lo cohechan con comidas y bebidas a su modo. Si el tal médico, o no es del oficio o se quiere excusar de aquella tormenta, aconseja al enfermo que beba él aquella semilla o otro por él.

Últimamente, o sea el médico o ya otro por él, para haber de beber la dicha semilla o el peyote, que es otra raíz pequeña y con quien tienen la misma fe que con esotra semilla, se encierra solo en un aposento, que de ordinario es su oratorio, donde nadie ha de entrar en todo el tiempo que durare la consulta, que es en cuanto el consultor está fuera de sí. Entonces creen que el tal ololiuhqui o peyote les está revelando lo que desean saber. En pasándosele al tal la embriaguez o privación de juicio, sale contando dos mil patrañas, entre las cuales el demonio suele revolver algunas verdades, con que de todo punto los tiene engañados o embaucados.

También usan de esta bebida para hallar cosas hurtadas, perdidas o que no saben dónde están, y para saber quién las llevó o hurtó. Acudiendo al ololiuhqui como en el caso primero, afirman por certísimo y evidente lo que en el tiempo de la embriaguez revuelven en su imaginación, o el demonio, padre y principio de todo engaño, les hace creer y entender. Y aunque después la experiencia les muestra el engaño, no basta para que salgan de aquella ceguedad.

#### Jacinto de la Serna, Manual de ministros de indios

Tienen también grandes supersticiones con una semilla a modo de lentejas, que llaman ololiuhqui, y con otra mayor, y es una raíz, que llaman el peyote, a quienes dan tanta veneración como si fueran una deidad, pues bebiendo estas yerbas las consultan como a oráculo para cuantas enfermedades pretenden curar, y para cuantas cosas desean saber, así perdidas como hurtadas, y aquellas a que el conocimiento humano no puede llegar, para saber el origen de las enfermedades, principalmente si son prolijas y largas, y las atribuyen a hechizo.

Para salir desta duda, y para los demás efectos, consultan estas yerbas por medio de sus médicos embusteros, que bebiéndole responde a todas estas dudas. Llámase el que tiene esto por oficio _páyni_, que quiere decir el que bebe purga o jarabe. Páganles a estos tales muy bien, y si el tal médico no es muy científico en el oficio, o se quiere excusar del trabajo que causa beber estas bebidas, aconseja a los enfermos que la beban, o a los que pretendan saber de las cosas que les han hurtado, o perdídoles, y dónde están, o quién las tiene.

A estas semillas, y principalmente al ololiuhqui, tienen en tan gran veneración como si fueran Dios. Enciéndenles candelas y guárdanles en petaquillas pequeñas, o cajas deputadas para esto, y allí les ponen ofrendas, y los ponen en los altares de sus oratorios, o sobre los cielos de ellos, o en otros lugares secretos de sus casas, porque cuando los busquen no los hallen fácilmente. La misma veneración se tiene al peyote, y tanta, que es muy recibido entre todos ellos, y como para algunas medicinas es menester molerlo, dicen que para que haga este efecto ha de ser molido por mano de doncella.`;

const expertContextPlaceholder = `_This historical-context essay is open for contribution._

Are you a scholar, archivist, community knowledge holder, or subject expert with relevant expertise in this source? Please use the [source issue form](#source-issue-report) at the bottom of this page to propose a short context essay or suggest a contributor. Choose "Other concern" and include "Historical context essay" in the location field.`;

const ruizContext = expertContextPlaceholder;

const spruceTranscript = `_Source: Richard Spruce, "On Some Remarkable Narcotics of the Amazon Valley and Orinoco," in Notes of a Botanist on the Amazon & Andes, edited by Alfred Russel Wallace, vol. 2 (London: Macmillan, 1908), 413-433. This excerpt follows the public-domain printed text, with light cleanup of OCR spacing._

#### On Some Remarkable Narcotics of the Amazon Valley and Orinoco

In the accounts given by travellers of the festivities of the South American Indians, and of the incantations of their medicine-men, frequent mention is made of powerful drugs used to produce intoxication, or even temporary delirium. Some of these narcotics are absorbed in the form of smoke, others as snuff, and others as drink; but with the exception of tobacco, and of the fermented drinks prepared from the grain of maize, the fruit of plantains, and the roots of Manihot utilissima, M. aipi, and a few other plants, scarcely any of them are well made out. Having had the good fortune to see the two most famous narcotics in use, and to obtain specimens of the plants that afford them sufficiently perfect to be determined botanically, I propose to record my observations on them, made on the spot.

#### I. Banisteria Caapi, Spruce

The first of these narcotics is afforded by a climbing plant called caapi. It belongs to the family of Malpighiaceae, and I drew up the following brief description of it from living specimens in November 1853.

Habitat: on the river Uaupés, the Içanna, and other upper tributaries of the Rio Negro, where it is commonly planted in the roças or mandiocca-plots; also at the cataracts of the Orinoco, and on its tributaries, from the Meta upwards; and on the Napo and Pastasa and their affluents, about the eastern foot of the Equatorial Andes. Native names: caapi, in Brazil and Venezuela; cadana, by the Tucano Indians on the Uaupés; aya-huasca, meaning "dead man's vine," in Ecuador.

The lower part of the stem is the part used. A quantity of this is beaten in a mortar, with water, and sometimes with the addition of a small portion of the slender roots of the caapi-pinima. When sufficiently triturated, it is passed through a sieve, which separates the woody fibre, and to the residue enough water is added to render it drinkable. Thus prepared, its colour is brownish-green, and its taste bitter and disagreeable.

#### The Use and Effects of Caapi

In November 1852 I was present, by special invitation, at a Dabocuri or Feast of Gifts, held in a malloca or village-house called Urubu-coara, above the first falls of the Uaupés. We found about three hundred people assembled, and the dances at once commenced.

In the course of the night, the young men partook of caapi five or six times, in the intervals between the dances; but only a few of them at a time, and very few drank of it twice. The cup-bearer, who must be a man, for no woman can touch or taste caapi, starts at a short run from the opposite end of the house, with a small calabash containing about a teacupful of caapi in each hand. In two minutes or less after drinking it, its effects begin to be apparent. The Indian turns deadly pale, trembles in every limb, and horror is in his aspect. Suddenly contrary symptoms succeed: he bursts into a perspiration, and seems possessed with reckless fury, seizes whatever arms are at hand, and rushes to the doorway, where he inflicts violent blows on the ground or the doorposts. In about ten minutes the excitement has passed off, and the Indian grows calm, but appears exhausted.

I had gone with the full intention of experimenting the caapi on myself, but I had scarcely dispatched one cup of the nauseous beverage, which is but half a dose, when the ruler of the feast, desirous apparently that I should taste all his delicacies at once, came up with a woman bearing a large calabash of caxiri, or mandiocca-beer, of which I had to take a copious draught. Above all this, I had to drink a large cup of palm-wine, and it will readily be understood that the effect of such a complex dose was a strong inclination to vomit.

White men who have partaken of caapi in the proper way concur in the account of their sensations under its influence. They feel alternations of cold and heat, fear and boldness. The sight is disturbed, and visions pass rapidly before the eyes, wherein everything gorgeous and magnificent they have heard or read of seems combined; and presently the scene changes to things uncouth and horrible.

In May 1857, after a sojourn of two years in the north-eastern Peruvian Andes, I reached, by way of the river Pastasa, the great forest of Canelos, at the foot of the volcanoes Cotopaxi, Llanganati, and Tunguragua; and in the villages of Canelos and Puca-yacu, inhabited chiefly by tribes of Zaparos, I again saw caapi planted. It was the identical species of the Uaupés, but under a different name, in the language of the Incas, aya-huasca, or "dead man's vine."

Aya-huasca is used by the Zaparos, Anguteros, Mazanes, and other tribes precisely as I saw caapi used on the Uaupés, namely as a narcotic stimulant at their feasts. It is also drunk by the medicine-man, when called on to adjudicate in a dispute or quarrel, to give the proper answer to an embassy, to discover the plans of an enemy, to tell if strangers are coming, to ascertain if wives are unfaithful, or in the case of a sick man to tell who has bewitched him.

All who have partaken of it feel first vertigo, then as if they rose up into the air and were floating about. The Indians say they see beautiful lakes, woods laden with fruit, birds of brilliant plumage, and soon the scene changes. They see savage beasts preparing to seize them; they can no longer hold themselves up, but fall to the ground. At this crisis the Indian wakes up from his trance, and if he were not held down in his hammock by force, he would spring to his feet, seize his arms, and attack the first person who stood in his way. Then he becomes drowsy, and finally sleeps. If he is a medicine-man, when he has slept off the fumes he recalls all he saw in his trance, and thereupon deduces the prophecy, divination, or whatever is required of him.

Villavicencio says: "When I have partaken of aya-huasca, my head has immediately begun to swim, then I have seemed to enter on an aerial voyage, wherein I thought I saw the most charming landscapes, great cities, lofty towers, beautiful parks, and other delightful things. Then all at once I found myself deserted in a forest and attacked by beasts of prey, against which I tried to defend myself. Lastly, I began to come round, but with a feeling of excessive drowsiness, headache, and sometimes general malaise."

#### Niopo Snuff and the Mode of Using It

We owe our first knowledge of niopo snuff, and of the tree producing it, to Humboldt and Bonpland. In the modern niopo, as I saw it prepared by the Guahibos themselves, there is no admixture of quicklime, and that is the sole difference from Humboldt's account.

I first gathered specimens of the paricá, or niopo, tree in 1850 near Santarém, at the junction of the Tapajoz and Amazon, where it had apparently been planted. In the following year I gathered it on the little river Jauauari, one of the lower tributaries of the Rio Negro, where it was certainly wild. But I did not see the snuff actually prepared from the seeds and in use until June 1854, at the cataracts of the Orinoco. A wandering horde of Guahibo Indians, from the river Meta, was encamped on the savannas of Maypures, and on a visit to their camp I saw an old man grinding niopo seeds, and purchased of him his apparatus for making and taking the snuff, which is now in the Museum of Vegetable Products at Kew.

The seeds, being first roasted, are powdered on a wooden platter. The snuff is kept in a mull made of a bit of the leg-bone of the jaguar, closed at one end with pitch and at the other end stopped with a cork of inarima bark. For taking the snuff they use an apparatus made of the leg-bones of herons or other long-shanked birds put together in the shape of the letter Y. The lower tube being inserted in the snuff-box and the knobs in the nostrils, the snuff is forcibly inhaled, with the effect of thoroughly narcotising a novice, or indeed a practised hand, if taken in sufficient quantity; but this endures only a few minutes, and is followed by a soothing influence, which is more lasting.

The Guahibo had a bit of caapi hung from his neck, along with the snuff-box, and as he ground his niopo he every now and then tore off a strip of caapi with his teeth and chewed it with evident satisfaction. "With a chew of caapi and a pinch of niopo," said he, in his broken Spanish, "one feels so good! No hunger, no thirst, no tired!" From the same man I learnt that caapi and niopo were used by all the nations on the upper tributaries of the Orinoco, on the Guaviare, Vichada, Meta, Sipapo, and the intervening smaller rivers.

The Catauixi use niopo snuff as a narcotic stimulant, precisely as the Guahibos of Venezuela, and as the Muras and other nations of the Amazon, where it is called paricá. For absorbing paricá by the nose, a bent tube is made of a bird's shank-bone, cut in two, and the pieces joined by wrapping, at such an angle that one end being applied to the mouth, the other reaches the nostrils. A portion of snuff is then put into the tube and blown with great force up the nose. The effect of paricá, taken as snuff, is to speedily induce a sort of intoxication, resembling in its symptoms, as described to me in this instance, that produced by the fungus Amanita muscaria.

#### Medicine-Men and Their Customs

Among the native tribes of the Uaupés and of the upper tributaries of the Orinoco, niopo or paricá is the chief curative agent. When the _paye_ is called in to treat a patient, he first snuffs up his nose such a quantity of paricá as suffices to throw him into a sort of ecstasy, wherein he professes to divine the nature of the evil wish which has caused the sickness, and to gather force to counteract it. He next lights a very thick cigar of tobacco, inhales a quantity of smoke, and puffs it out over the sick man, over the hammock in which he is laid, and over everything he habitually uses, but especially over the food he is to eat.`;

const spruceContext = expertContextPlaceholder;

const spruceSourceNote = `_Spruce's chapter is one of the classic nineteenth-century field accounts of ayahuasca/caapi and yopo/niopo. This excerpt omits the later guaraná and guayusa stimulant sections so the source page stays focused on visionary Amazonian and Orinoco preparations._`;
const ruizSourceNote = `_These excerpts show how seventeenth-century clergy in New Spain described ololiuhqui and peyote as plants consulted like oracles. Their hostile anti-idolatry frame is part of the source: it preserves details of Indigenous practice while translating them into the language of superstition, demonology, and ecclesiastical discipline._`;

async function main() {
  await fs.mkdir(path.join(importDir, "translations"), { recursive: true });
  await fs.writeFile(path.join(importDir, "translations", `${RUIZ_SLUG}.md`), `${ruizTranslation}\n`, "utf8");

  const ruizPdf = `pdfs/${RUIZ_SLUG}/ololiuhqui-peyote-idolatrias-supersticiones-excerpts.pdf`;
  const sprucePdf = `pdfs/${SPRUCE_SLUG}/spruce-caapi-niopo-remarkable-narcotics-excerpt.pdf`;
  const ruizStorage = `documents/${RUIZ_ID}/pdfs/${RUIZ_SLUG}/ololiuhqui-peyote-idolatrias-supersticiones-excerpts.pdf`;
  const spruceStorage = `documents/${SPRUCE_ID}/pdfs/${SPRUCE_SLUG}/spruce-caapi-niopo-remarkable-narcotics-excerpt.pdf`;

  const documents = await readJson("documents");
  upsertBy(documents, "id", [
    {
      id: RUIZ_ID,
      slug: RUIZ_SLUG,
      title: "Ololiuhqui and Peyote in Idolatrías y supersticiones de los indios",
      subtitle: "Colonial anti-idolatry texts on divination, healing, and visionary plants",
      display_date: "1629-1656; published 1892",
      date_start: 1629,
      date_end: 1656,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "Spanish",
      content_language: "Spanish",
      translation_language: "English",
      translation_text_path: `translations/${RUIZ_SLUG}.md`,
      translation_note: "Archive translation from selected Spanish passages in the 1892 public-domain Museo Nacional edition; verify against the PDF for formal quotation.",
      reader_mode: "translation",
      region: "New Spain; Mexico",
      publication_place: "Mexico City",
      publisher: "Imprenta del Museo Nacional",
      summary: "A set of Spanish colonial anti-idolatry excerpts describing ololiuhqui and peyote as oracular substances used in healing, theft investigation, divination, and diagnosis of sorcery. The source preserves rare early descriptions of visionary plant practice while also showing how clerical authorities criminalized and demonized Indigenous ritual knowledge.",
      abstract: "A set of Spanish colonial anti-idolatry excerpts describing ololiuhqui and peyote as oracular substances used in healing, theft investigation, divination, and diagnosis of sorcery. The source preserves rare early descriptions of visionary plant practice while also showing how clerical authorities criminalized and demonized Indigenous ritual knowledge.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive scan. Excerpt PDF includes source pages 11, 142-147, and 385-388 from the 1892 edition.",
      citation: "Ponce de León, Pedro, Hernando Ruiz de Alarcón, Jacinto de la Serna, and others. Idolatrías y supersticiones de los indios. Edited by Nicolás León. Anales del Museo Nacional de México, tomo 6. Mexico: Imprenta del Museo Nacional, 1892, pp. 11, 142-147, 385-388.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive scan of the 1892 Museo Nacional edition.",
      source_url: "https://archive.org/details/idolatrasysupers00ponc",
      external_access_url: "https://archive.org/download/idolatrasysupers00ponc/idolatrasysupers00ponc.pdf",
      access_type: "hosted",
      hosting_status: "translation_transcript_pdf",
      cover_image_path: `documents/${RUIZ_ID}/pdf-thumbnails/${RUIZ_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${RUIZ_ID}/pdf-thumbnails/${RUIZ_SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    },
    {
      id: SPRUCE_ID,
      slug: SPRUCE_SLUG,
      title: "Caapi and Niopo in “On Some Remarkable Narcotics of the Amazon Valley and Orinoco”",
      subtitle: "Richard Spruce on ayahuasca, yopo/paricá, and Amazonian medicine-men",
      display_date: "c. 1870; published 1908",
      date_start: 1870,
      date_end: 1870,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "English",
      content_language: "English",
      translation_language: null,
      translation_note: null,
      reader_mode: "pdf",
      region: "Amazonia; Orinoco; Uaupés; Ecuadorian Andes",
      publication_place: "London",
      publisher: "Macmillan",
      summary: "Richard Spruce's nineteenth-century account of caapi, aya-huasca, niopo, and paricá, based on field observations in the Uaupés, Orinoco, Rio Negro, Napo, and Pastasa regions. The excerpt records plant identifications, preparation methods, visual effects, ceremonial uses, and the role of payes in curing and divination.",
      abstract: "Richard Spruce's nineteenth-century account of caapi, aya-huasca, niopo, and paricá, based on field observations in the Uaupés, Orinoco, Rio Negro, Napo, and Pastasa regions. The excerpt records plant identifications, preparation methods, visual effects, ceremonial uses, and the role of payes in curing and divination.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive scan of Notes of a Botanist on the Amazon & Andes, vol. 2. Excerpt PDF includes chapter 25 pages 413-433, covering caapi/ayahuasca and niopo/paricá before the later stimulant sections.",
      citation: "Spruce, Richard. “On Some Remarkable Narcotics of the Amazon Valley and Orinoco.” In Notes of a Botanist on the Amazon & Andes, edited by Alfred Russel Wallace, vol. 2, 413-433. London: Macmillan, 1908. Essay compiled c. 1870 from field observations made in the 1850s.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive scan of the 1908 Macmillan edition.",
      source_url: "https://archive.org/details/notesofbotanisto00spruuoft",
      external_access_url: "https://archive.org/download/notesofbotanisto00spruuoft/notesofbotanisto00spruuoft.pdf",
      access_type: "hosted",
      hosting_status: "transcript_pdf",
      cover_image_path: `documents/${SPRUCE_ID}/pdf-thumbnails/${SPRUCE_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${SPRUCE_ID}/pdf-thumbnails/${SPRUCE_SLUG}/page-001.jpg`,
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
  upsertBy(tagRows, "id", tags);
  await writeJson("tags", tagRows);

  const documentPeople = await readJson("document_people");
  upsertBy(documentPeople, ["document_id", "person_id", "role"], [
    { document_id: RUIZ_ID, person_id: personId("pedro-ponce-de-leon"), role: "author" },
    { document_id: RUIZ_ID, person_id: personId("hernando-ruiz-de-alarcon"), role: "author" },
    { document_id: RUIZ_ID, person_id: personId("jacinto-de-la-serna"), role: "author" },
    { document_id: RUIZ_ID, person_id: personId("nicolas-leon"), role: "editor" },
    { document_id: SPRUCE_ID, person_id: personId("richard-spruce"), role: "author" },
    { document_id: SPRUCE_ID, person_id: personId("alfred-russel-wallace"), role: "editor" }
  ]);
  await writeJson("document_people", documentPeople);

  const documentTags = await readJson("document_tags");
  upsertBy(documentTags, ["document_id", "tag_id"], [
    ...tagLinks(RUIZ_ID, [
      "pre-1800",
      "book-excerpt",
      "latin-america",
      "new-spain",
      "mexico",
      "colonial-mexico",
      "ololiuhqui",
      "peyote",
      "divination",
      "indigenous-knowledge",
      "ethnobotany",
      "religion",
      "medicine",
      "early-modern-medicine",
      "psychoactive-plants"
    ]),
    ...tagLinks(SPRUCE_ID, [
      "1800-1950",
      "book-excerpt",
      "latin-america",
      "south-america",
      "amazonia",
      "orinoquia",
      "vaupes",
      "ayahuasca",
      "banisteriopsis-caapi",
      "caapi",
      "yaje",
      "niopo",
      "yopo",
      "parica",
      "ethnobotany",
      "ethnography",
      "indigenous-knowledge",
      "medicine",
      "religion",
      "field-science",
      "psychoactive-plants"
    ])
  ]);
  await writeJson("document_tags", documentTags);

  const documentSections = await readJson("document_sections");
  upsertBy(documentSections, "id", [
    section(RUIZ_ID, 0, "Introduction", "source_note", ruizSourceNote),
    section(RUIZ_ID, 1, "Original Spanish", "transcript", ruizOriginalSpanish),
    section(RUIZ_ID, 2, "Historical context", "historical_context", ruizContext),
    section(SPRUCE_ID, 0, "Introduction", "source_note", spruceSourceNote),
    section(SPRUCE_ID, 1, "Transcript", "transcript", spruceTranscript),
    section(SPRUCE_ID, 2, "Historical context", "historical_context", spruceContext)
  ]);
  await writeJson("document_sections", documentSections);

  const files = await readJson("files");
  upsertBy(files, "id", [
    pdfFile(RUIZ_ID, RUIZ_SLUG, ruizPdf, ruizStorage),
    pdfFile(SPRUCE_ID, SPRUCE_SLUG, sprucePdf, spruceStorage)
  ]);
  await writeJson("files", files);

  const assets = await readJson("assets");
  upsertBy(assets, "id", [
    pdfAsset(RUIZ_ID, RUIZ_SLUG, ruizPdf, ruizStorage, "https://archive.org/download/idolatrasysupers00ponc/idolatrasysupers00ponc.pdf"),
    pdfAsset(SPRUCE_ID, SPRUCE_SLUG, sprucePdf, spruceStorage, "https://archive.org/download/notesofbotanisto00spruuoft/notesofbotanisto00spruuoft.pdf")
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

  console.log(`Staged ${RUIZ_SLUG} and ${SPRUCE_SLUG}`);
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
  const bytes = fsSyncRead(path.join(importDir, localPath));
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
  const bytes = fsSyncRead(path.join(importDir, localPath));
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

function fsSyncRead(filePath) {
  return crypto.createHash ? requireFsRead(filePath) : Buffer.from("");
}

function requireFsRead(filePath) {
  return fsSync.readFileSync(filePath);
}

function personId(slug) {
  const row = people.find((person) => person.slug === slug);
  if (!row) throw new Error(`Missing person ${slug}`);
  return row.id;
}

function tagLinks(documentId, slugs) {
  return slugs.map((slug) => ({ document_id: documentId, tag_id: tagId(slug) }));
}

function tagId(slug) {
  const existing = tagIdCache.get(slug);
  if (existing) return existing;
  throw new Error(`Missing tag ${slug}`);
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
      id: `${RUIZ_SLUG.replaceAll("-", "_")}`,
      slug: RUIZ_SLUG,
      title: "Ololiuhqui and Peyote in Idolatrías y supersticiones de los indios",
      author: "Pedro Ponce de León, Hernando Ruiz de Alarcón, and Jacinto de la Serna",
      year: 1629,
      displayDate: "1629-1656; published 1892",
      type: "Book Excerpt",
      medium: "Text",
      era: "Pre-1800",
      region: "New Spain; Mexico",
      language: "Spanish",
      tags: ["Pre-1800", "Book excerpt", "Latin America", "New Spain", "Mexico", "Ololiuhqui", "Peyote", "Divination", "Indigenous knowledge", "Ethnobotany", "Religion", "Medicine"],
      people: ["Pedro Ponce de León", "Hernando Ruiz de Alarcón", "Jacinto de la Serna"],
      substances: ["Ololiuhqui", "Peyote"],
      summary: "Spanish colonial anti-idolatry excerpts describing ololiuhqui and peyote as oracular substances used in healing, theft investigation, divination, and diagnosis of sorcery.",
      excerpt: "Beben el ololiuhqui, y el peyote, una semilla que llaman tlitliltzin.",
      citation: "Ponce de León, Pedro, Hernando Ruiz de Alarcón, Jacinto de la Serna, and others. Idolatrías y supersticiones de los indios. Edited by Nicolás León. Mexico: Imprenta del Museo Nacional, 1892.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/idolatrasysupers00ponc",
      accessType: "hosted",
      hostingStatus: "translation_transcript_pdf",
      wordCount: wordCount(ruizOriginalSpanish),
      addedDate: "2026-07-08",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${RUIZ_ID}/pdf-thumbnails/${RUIZ_SLUG}/page-001.jpg`,
      transcript: ruizOriginalSpanish,
      translation: ruizTranslation
    },
    {
      id: `${SPRUCE_SLUG.replaceAll("-", "_")}`,
      slug: SPRUCE_SLUG,
      title: "Caapi and Niopo in “On Some Remarkable Narcotics of the Amazon Valley and Orinoco”",
      author: "Richard Spruce",
      year: 1870,
      displayDate: "c. 1870; published 1908",
      type: "Book Excerpt",
      medium: "Text",
      era: "1800-1950",
      region: "Amazonia; Orinoco; Uaupés; Ecuadorian Andes",
      language: "English",
      tags: ["1800-1950", "Book excerpt", "Latin America", "South America", "Amazonia", "Orinoquia", "Ayahuasca", "Caapi", "Niopo", "Yopo", "Paricá", "Indigenous knowledge", "Ethnobotany", "Medicine"],
      people: ["Richard Spruce", "Alfred Russel Wallace"],
      substances: ["Ayahuasca", "Caapi", "Niopo", "Yopo", "Paricá"],
      summary: "Richard Spruce's nineteenth-century account of caapi, aya-huasca, niopo, and paricá, based on field observations in the Uaupés, Orinoco, Rio Negro, Napo, and Pastasa regions.",
      excerpt: "The first of these narcotics is afforded by a climbing plant called Caapi.",
      citation: "Spruce, Richard. “On Some Remarkable Narcotics of the Amazon Valley and Orinoco.” In Notes of a Botanist on the Amazon & Andes, edited by Alfred Russel Wallace, vol. 2, 413-433. London: Macmillan, 1908.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/notesofbotanisto00spruuoft",
      accessType: "hosted",
      hostingStatus: "transcript_pdf",
      wordCount: wordCount(spruceTranscript),
      addedDate: "2026-07-08",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${SPRUCE_ID}/pdf-thumbnails/${SPRUCE_SLUG}/page-001.jpg`,
      transcript: spruceTranscript
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

const fsSync = await import("node:fs");
const currentTags = await readJson("tags");
const tagIdCache = new Map(currentTags.map((row) => [row.slug, row.id]));
for (const nextTag of tags) tagIdCache.set(nextTag.slug, nextTag.id);

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
