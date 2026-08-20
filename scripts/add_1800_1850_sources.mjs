#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const importDir = path.join(root, "data", "latin-america-import");

const HUMBOLDT_SLUG = "humboldt-bonpland-niopo-otomacs";
const SPIX_SLUG = "spix-martius-parica-muras";
const LANGSDORFF_SLUG = "langsdorff-fly-agaric-koryak";

const HUMBOLDT_ID = deterministicUuid(`document:${HUMBOLDT_SLUG}`);
const SPIX_ID = deterministicUuid(`document:${SPIX_SLUG}`);
const LANGSDORFF_ID = deterministicUuid(`document:${LANGSDORFF_SLUG}`);

const expertContextPlaceholder = `_This historical-context essay is open for contribution._

Are you a scholar, archivist, community knowledge holder, or subject expert with relevant expertise in this source? Please use the [source issue form](#source-issue-report) at the bottom of this page to propose a short context essay or suggest a contributor. Choose "Other concern" and include "Historical context essay" in the location field.`;

const humboldtSourceNote = `_Humboldt and Bonpland's account of niopo among the Otomac is one of the earliest nineteenth-century printed descriptions of yopo snuff in the Orinoco region. The passage is especially useful because it links preparation, nasal apparatus, missionary vocabulary, and comparison with curupa in a source published well before the twentieth-century ethnobotanical literature._`;

const spixSourceNote = `_Spix and Martius's 1831 volume gives a German natural-history account of paricá snuff among the Mura on the Madeira-Amazon route. Its language is often hostile and sensational, but the passage is important for its early description of paricá preparation, ceremonial use, nasal insufflation, and comparison with fly agaric intoxication._`;

const langsdorffSourceNote = `_Langsdorff's Kamchatka chapter records fly agaric as an object of trade between Koryaks, Russians, and Kamchadals. The brief footnote is one of the compact early nineteenth-century German notices that identifies fly agaric as a preferred intoxicating or stupefying substance._`;

const humboldtTranscript = `_Source: Alexander von Humboldt and Aimé Bonpland, Personal Narrative of Travels to the Equinoctial Regions of the New Continent, translated by Helen Maria Williams, vol. 5, part 2 (London: Longman, Hurst, Rees, Orme, and Brown, 1821), pp. 662-665. This transcript follows the public-domain English edition with line breaks normalized._

#### Niopo among the Otomac

The Otomacs eat the earth; that is, they swallow every day during several months a very considerable quantity of earth, to appease the cravings of hunger, and to fill the stomach. But they do not eat clay as the people of other nations eat chalk, or magnesia, or cinders. The Otomacs choose a very fine unctuous clay, of a yellowish grey colour; and, after having slightly baked it, they moisten it with water and make balls of it, three or four inches in diameter. They preserve these balls in little pyramidal heaps in their huts. When they are about to eat, they set them to soak in water.

The unwholesome bread of the Otomacs is composed of little else than clay and some flour of maize or cassava. They are not, however, contented with these aliments, which appear to us so extraordinary, and with cassava and maize, and with palm wine, but they throw themselves into a peculiar state of intoxication, we might almost say of madness, by the use of the powder of _niopo_. They gather the long pods of a mimosacea, which we have made known by the name of _acacia niopo_, cut them into pieces, moisten them, and cause them to ferment. When the softened seeds begin to grow black, they are kneaded like a paste, mixed with some flour of cassava and lime procured from the shell of a helix, and the whole mass is exposed to a very brisk fire, on a grate of hard wood. The hardened paste takes the form of small cakes.

When it is to be used, it is reduced to a fine powder, and placed on a dish five or six inches wide. The Otomac holds this dish, which has a handle, in his right hand, while he inhales the _niopo_ by the nose, through a forked bone of a bird, the two extremities of which are applied to the nostrils. This bone, without which the Otomac believes that he could not take this kind of snuff, is seven inches long: it appeared to me to be the leg bone of a large sort of plover. I sent the _niopo_, and all this singular apparatus, to Mr. de Fourcroy at Paris.

The _niopo_ is so stimulating, that the smallest portions of it produce a violent sneezing in those who are not accustomed to its use. Father Gumilla says, "This diabolical powder of the Otomacs, furnished by an arborescent tobacco-plant, intoxicates them by the nostrils (_emboracha por las narices_), deprives them of reason for some hours, and renders them furious in battle."

However varied may be the family of the leguminous plants in the chemical and medical properties of their seeds, juices, and roots, we cannot believe, from what we know hitherto of the group of mimosaceae, that it is principally the pod of the _acacia niopo_ that imparts the stimulant power to the snuff of the Otomacs. This power is owing, no doubt, to the lime freshly calcined. We have shown above that the mountaineers of the Andes of Popayan, and the Guajiroes who wander between the lake of Maracaybo and the Rio la Hacha, are also fond of swallowing lime as a stimulant, to augment the secretion of the spittle and the gastric juice.

In sending to Europe the complicated apparatus, which the Otomacs employ in order to inhale the powder of _niopo_, I directed the attention of the learned to an analogous custom, which Mr. de la Condamine observed among the natives of the Upper Maragnon. The Omaguas, whose name is rendered celebrated by the expeditions attempted in search of Dorado, have the same dish, and the same hollow bone of a bird, by which they convey to their nostrils their powder of _curupa_. The seed that yields this powder is no doubt also a mimosacea; for the Otomacs, according to Father Gili, denote even now, at the distance of one hundred and sixty leagues from the Amazon, the _acacia niopo_ by the name of _curupa_.

Since the geographical researches, which I have recently made on the theatre of the exploits of Philip von Huten, and on the real situation of the province of Papamene, or of the Omaguas, the probability of an ancient communication between the Otomacs of the Oroonoko and the Omaguas of the Maragnon has become more interesting and more probable. The former came from the Meta, perhaps from the country between the Meta and the Guaviare; the latter assert that they descended in great numbers to the Maragnon by the Rio Japura, coming from the eastern declivity of the Andes of New Grenada.`;

const spixOriginalGerman = `_Source: Johann Baptist von Spix and Carl Friedrich Philipp von Martius, Reise in Brasilien, vol. 3 (Munich: bei dem Verfasser; Leipzig: in Commission bei Friedrich Fleischer, 1831), pp. 1074-1076. The transcription below preserves the nineteenth-century German text with line breaks normalized and long-s silently modernized._

#### Gebrauch des Schnupf-Tabackes Paricá

Eine höchst seltsame Sitte, welche unter die Eigentümlichkeiten des Stammes gehört, ist der Gebrauch eines Schnupf-Tabackes (_Paricá_). Das Pulver wird aus den gedörrten Samen der _Paricá-üva_, einer Art _Inga_, bereitet, und wirkt zuerst erregend, dann narkotisch. Jährlich einmal gebraucht jede Horde das _Paricá_ acht Tage lang unter anhaltendem Trinken berauschender Getränke, Tanzen und Singen. Das Fest soll (nach Ribeiro §. 58.) den Eintritt der Jünglinge in die Mannbarkeit feiern; wir hörten jedoch, dass es ohne Beziehung hierauf nach der Reife der Samen gehalten würde. In einem geräumigen offenen Hause versammelt sich die ganze Horde, und wird von den Weibern mit reichlich gespendeten Cujas des Cajiri und anderen vegetabilischen Getränken erhitzt. Die Männer reihen sich sodann nach gegenseitiger Wahl paarweise zusammen, und peitschen sich mit langen Riemen vom Leder des Tapirs oder Lamantins bis auf das Blut.

Diese seltsame Geisselung wird von ihnen nicht als ein feindseliger, sondern vielmehr als ein Act der Liebe angesehen, und nach allen uns gewordenen Nachrichten dürfte der ganze Excess als Ausdruck eines irregeleiteten Geschlechtsverhältnisses betrachtet werden. Nachdem die blutige Operation mehrere Tage lang fortgesetzt worden, blasen sich die paarweise verbundenen Gefährten das _Paricá_ mittels einer fusslangen Röhre, gewöhnlich ist es der ausgehöhlte Schenkelknochen des Tapirs, in die Nasenlöcher; und dies geschieht mit solcher Gewalt, und so unausgesetzt, dass bisweilen Einzelne, entweder erstickt von dem feinen, bis in die Stirnhöhlen hinaufgetriebenen Staube, oder überreizt von seiner narkotischen Wirkung, tot auf dem Platze bleiben.

Nichts soll der Wut gleichen, womit die Paare das _Paricá_ aus den grossen Bambus-Röhren (_Tabocas_), worin es aufbewahrt wird, vermittels eines hohlen Krokodilzahnes, der das Mass einer jedesmaligen Einblasung enthält, in den dazu bestimmten hohlen Knochen füllen, und es sich, auf den Knien genähert, einblasen und einstopfen. Eine plötzliche Exaltation, unsinniges Reden, Schreien, Singen, wildes Springen und Tanzen ist die Folge der Operation, nach der sie, zugleich von Getränken und jeder Art von Ausschweifungen betäubt, in eine viehische Trunkenheit verfallen.

Ein anderer Gebrauch des _Paricá_ ist, einen Absud davon sich selbst als Klystier zu geben, dessen Wirkung ähnlich, jedoch schwächer sein soll. Man kann nicht umhin, durch diese viehische Lustbarkeit an die ekelhafte Sitte der Ostiaken und Kamtschadalen erinnert zu werden, welche sich bekanntlich durch den Genuss des Fliegenschwammes und des Urins derjenigen, die den giftigen Absud getrunken, zu einer ähnlichen Wut erhitzen. Für den Ethnographen America’s bleibt es räthselhaft, wie feindlich gesinnte Völker sich gerade in solchen excentrischen Gewohnheiten gleichen können. So ist der Gebrauch des _Paricá_ auch den Mauhés eigen und dort von uns selbst beobachtet worden, wo er jedoch, bei höherer Bildung des ganzen Stammes, ebenfalls unter einer feineren Form erscheint. Eine ganz ähnliche Verirrung ist endlich der Gebrauch des _Ypadúpulvers_ von den Blättern des _Erythroxylon Coca_, L., den wir bei den Miranhas, und andere Reisende bei peruvianischen Völkerschaften getroffen haben.`;

const spixTranslation = `_This translation is prepared for the archive from the public-domain 1831 German volume by Spix and Martius. The original passage uses hostile and racialized nineteenth-century language; the translation keeps the descriptive content while preserving the source's judgmental tone where it affects interpretation._

#### The Use of Paricá Snuff

A highly strange custom, one of the distinctive practices of the tribe, is the use of a snuff tobacco (_Paricá_). The powder is prepared from the dried seeds of _Paricá-üva_, a kind of _Inga_, and acts first as a stimulant, then as a narcotic. Once a year each horde uses _Paricá_ for eight days amid continual drinking of intoxicating beverages, dancing, and singing. The festival is said, according to Ribeiro, to celebrate the entrance of young men into manhood; we heard, however, that it was held after the ripening of the seeds and had no relation to that. In a roomy open house the whole horde gathers, and the women heat them up with richly supplied calabashes of cajiri and other plant-based drinks. The men then pair off by mutual choice and whip one another with long straps of tapir or manatee hide until they bleed.

This strange scourging is not regarded by them as hostile, but rather as an act of love; according to all the reports we received, the whole excess may be considered the expression of a misdirected sexual relation. After the bloody operation has continued for several days, the paired companions blow the _Paricá_ into one another's nostrils by means of a tube about a foot long, usually the hollowed thighbone of a tapir. This is done with such force and so unremittingly that sometimes individuals either suffocate from the fine dust driven up into the frontal sinuses, or, overstimulated by its narcotic effect, die on the spot.

Nothing is said to equal the fury with which the pairs fill the hollow bones prepared for this purpose with _Paricá_ from the large bamboo tubes (_tabocas_) in which it is kept, using a hollow crocodile tooth that holds the measure for each blowing, and then, kneeling close together, blow and pack it into one another. A sudden exaltation, senseless speech, screaming, singing, wild jumping, and dancing follow the operation; afterward, stupefied also by drinks and every kind of excess, they fall into a bestial drunkenness.

Another use of _Paricá_ is to administer a decoction of it to oneself as a clyster, whose effect is said to be similar, though weaker. One cannot help being reminded by this bestial amusement of the disgusting custom of the Ostiaks and Kamchadals, who, as is well known, heat themselves into a similar fury by consuming fly agaric and the urine of those who have drunk the poisonous decoction. For the ethnographer of America it remains puzzling how hostile peoples can resemble one another precisely in such eccentric customs. The use of _Paricá_ is also characteristic of the Mauhés, and we observed it there ourselves, though among them, with the higher cultivation of the whole tribe, it appears in a more refined form. Finally, a very similar aberration is the use of _Ypadú_ powder from the leaves of _Erythroxylon coca_ L., which we encountered among the Miranhas, and which other travelers have encountered among Peruvian peoples.`;

const langsdorffOriginalGerman = `_Source: Georg Heinrich von Langsdorff, Bemerkungen auf einer Reise um die Welt in den Jahren 1803 bis 1807, vol. 2 (Frankfurt am Main: Friedrich Wilmans, 1812), pp. 274-276. The transcription below preserves the nineteenth-century German text with line breaks normalized and long-s silently modernized._

#### Fliegenschwämme im Tauschhandel der Koräken

Die Koräken streifen das ganze Jahr durch mit ihren unzähligen zahmen Rennthierheerden hier im Lande umher, und verkaufen den Russen und Kamtschadalen gegen Kleinigkeiten, besonders für Tabak, Branntwein, Fliegenschwämme, Kessel, Aexte und andere Geräthschaften gern deren so viele, daß sie hinreichend mit Fleisch zur Nahrung und mit den Fellen zu ihrer Kleidung versorgt werden.

Bey dem Ueberfluss ihrer Heerden treiben sie mit den benachbarten Russen und Kamtschadalen einen Tauschhandel, und erkaufen sich eiserne und kupferne Kessel und anderes Küchengeschirr, Messer, Aexte, Tabaksblätter, Branntwein, Fliegenschwämme *), Pulver und Bley, Seehundsriemen, Thran und andere Artikel, für Rennthiere ein.

*) Die Fliegenschwämme werden von den Koräken als ein betäubendes oder berauschendes Mittel, selbst dem Branntwein vorgezogen. Meine besondern hierüber gemachten Bemerkungen findet man in den Annalen der wetterauischen Gesellschaft für die gesammte Naturkunde. B. 16, 249.`;

const langsdorffTranslation = `_This translation is prepared for the archive from the public-domain 1812 German edition of Langsdorff's voyage. The excerpt is brief, but it records fly agaric not only as a pharmacological curiosity but as a traded object in the economy of Kamchatka and Koryak-Russian exchange._

#### Fly Agarics in Koryak Trade

The Koryaks wander through this country all year with their countless tame reindeer herds, and they readily sell so many of them to the Russians and Kamchadals in exchange for trifles, especially tobacco, brandy, fly agarics, kettles, axes, and other utensils, that they are sufficiently supplied with meat for food and hides for clothing.

With the abundance of their herds they conduct barter with the neighboring Russians and Kamchadals, obtaining iron and copper kettles and other kitchenware, knives, axes, tobacco leaves, brandy, fly agarics,* gunpowder and lead, sealskin straps, train oil, and other articles in exchange for reindeer.

* The fly agarics are preferred by the Koryaks, as a stupefying or intoxicating agent, even to brandy. My special observations on this subject may be found in the _Annalen der wetterauischen Gesellschaft für die gesammte Naturkunde_, vol. 16, p. 249.`;

const people = [
  person("alexander-von-humboldt", "Alexander von Humboldt", "Humboldt, Alexander von", 1769, 1859, "Prussian naturalist, geographer, and explorer whose American travel writings shaped nineteenth-century science and included early descriptions of Orinoco niopo."),
  person("aime-bonpland", "Aimé Bonpland", "Bonpland, Aimé", 1773, 1858, "French botanist and explorer who traveled with Alexander von Humboldt in Spanish America and co-authored the Personal Narrative."),
  person("helen-maria-williams", "Helen Maria Williams", "Williams, Helen Maria", 1761, 1827, "English writer, translator, and political commentator who translated Humboldt and Bonpland's Personal Narrative into English."),
  person("johann-baptist-von-spix", "Johann Baptist von Spix", "Spix, Johann Baptist von", 1781, 1826, "Bavarian zoologist and explorer who traveled in Brazil from 1817 to 1820 and co-authored Reise in Brasilien."),
  person("carl-friedrich-philipp-von-martius", "Carl Friedrich Philipp von Martius", "Martius, Carl Friedrich Philipp von", 1794, 1868, "Bavarian botanist and explorer whose Brazilian fieldwork and publications became central to nineteenth-century Amazonian natural history."),
  person("georg-heinrich-von-langsdorff", "Georg Heinrich von Langsdorff", "Langsdorff, Georg Heinrich von", 1774, 1852, "German-Russian naturalist and explorer whose voyage writings included observations from Kamchatka, Russian America, and Brazil.")
];

const newTags = [
  tag("amanita-muscaria", "Amanita muscaria", "substance"),
  tag("fly-agaric", "Fly agaric", "substance"),
  tag("kamchatka", "Kamchatka", "region"),
  tag("koryak", "Koryak", "topic"),
  tag("mura", "Mura", "topic"),
  tag("natural-history", "Natural history", "topic"),
  tag("siberia", "Siberia", "region"),
  tag("travel-writing", "Travel writing", "topic")
];

async function main() {
  await fs.mkdir(path.join(importDir, "translations"), { recursive: true });
  await fs.writeFile(path.join(importDir, "translations", `${SPIX_SLUG}.md`), `${spixTranslation}\n`, "utf8");
  await fs.writeFile(path.join(importDir, "translations", `${LANGSDORFF_SLUG}.md`), `${langsdorffTranslation}\n`, "utf8");

  const documents = await readJson("documents");
  const peopleRows = await readJson("people");
  const tagRows = await readJson("tags");
  const documentPeople = await readJson("document_people");
  const documentTags = await readJson("document_tags");
  const documentSections = await readJson("document_sections");
  const files = await readJson("files");
  const assets = await readJson("assets");
  const externalSources = await readJson("external_sources");

  upsertBy(peopleRows, "id", people);
  upsertBy(tagRows, "id", newTags);

  const tagCache = new Map(tagRows.map((row) => [row.slug, row.id]));
  for (const nextTag of newTags) tagCache.set(nextTag.slug, nextTag.id);

  const pdfs = {
    humboldt: {
      local: `pdfs/humboldt-bonpland-niopo/humboldt-bonpland-niopo-otomacs-excerpt.pdf`,
      storage: `documents/${HUMBOLDT_ID}/pdfs/${HUMBOLDT_SLUG}/humboldt-bonpland-niopo-otomacs-excerpt.pdf`,
      source: "https://archive.org/download/personalnarrati521821humb/personalnarrati521821humb.pdf"
    },
    spix: {
      local: `pdfs/spix-martius-parica/spix-martius-parica-muras-excerpt.pdf`,
      storage: `documents/${SPIX_ID}/pdfs/${SPIX_SLUG}/spix-martius-parica-muras-excerpt.pdf`,
      source: "https://archive.org/download/mobot31753000220282/mobot31753000220282.pdf"
    },
    langsdorff: {
      local: `pdfs/langsdorff-fly-agaric-kamchatka/langsdorff-fly-agaric-koryak-excerpt.pdf`,
      storage: `documents/${LANGSDORFF_ID}/pdfs/${LANGSDORFF_SLUG}/langsdorff-fly-agaric-koryak-excerpt.pdf`,
      source: "https://archive.org/download/bemerkungenaufe00langgoog/bemerkungenaufe00langgoog.pdf"
    }
  };

  upsertBy(documents, "id", [
    {
      id: HUMBOLDT_ID,
      slug: HUMBOLDT_SLUG,
      title: "Niopo among the Otomac in Humboldt and Bonpland's Personal Narrative",
      subtitle: "Orinoco snuff, Acacia niopo, and curupa in an 1821 travel narrative",
      display_date: "1821",
      date_start: 1821,
      date_end: 1821,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "English",
      content_language: "English",
      translation_language: null,
      translation_text_path: null,
      translation_provider: null,
      translation_note: null,
      reader_mode: "pdf",
      region: "Orinoco; Orinoquia; Venezuela",
      publication_place: "London",
      publisher: "Longman, Hurst, Rees, Orme, and Brown",
      summary: "Humboldt and Bonpland's Personal Narrative describes niopo snuff among the Otomac on the Orinoco, including preparation from Acacia niopo, nasal apparatus, missionary testimony, and comparison with curupa.",
      abstract: "Humboldt and Bonpland's Personal Narrative describes niopo snuff among the Otomac on the Orinoco, including preparation from Acacia niopo, nasal apparatus, missionary testimony, and comparison with curupa.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive scan. Excerpt PDF includes printed pages 662-665 of volume 5, part 2.",
      citation: "Humboldt, Alexander von, and Aimé Bonpland. Personal Narrative of Travels to the Equinoctial Regions of the New Continent, during the Years 1799-1804. Translated by Helen Maria Williams. Vol. 5, part 2. London: Longman, Hurst, Rees, Orme, and Brown, 1821, pp. 662-665.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive scan of the 1821 London edition.",
      source_url: "https://archive.org/details/personalnarrati521821humb",
      external_access_url: pdfs.humboldt.source,
      access_type: "hosted",
      hosting_status: "transcript_pdf",
      cover_image_path: `documents/${HUMBOLDT_ID}/pdf-thumbnails/${HUMBOLDT_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${HUMBOLDT_ID}/pdf-thumbnails/${HUMBOLDT_SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    },
    {
      id: SPIX_ID,
      slug: SPIX_SLUG,
      title: "Paricá among the Mura in Spix and Martius's Reise in Brasilien",
      subtitle: "A German travel account of Amazonian snuff, ceremony, and intoxication",
      display_date: "1831",
      date_start: 1831,
      date_end: 1831,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "German",
      content_language: "German",
      translation_language: "English",
      translation_text_path: `translations/${SPIX_SLUG}.md`,
      translation_provider: "archive",
      translation_note: "Archive translation from the German text in the public-domain 1831 volume.",
      reader_mode: "translation",
      region: "Brazil; Amazonia; Madeira River",
      publication_place: "Munich; Leipzig",
      publisher: "bei dem Verfasser; in Commission bei Friedrich Fleischer",
      summary: "Spix and Martius's 1831 German travel narrative describes paricá among the Mura, including preparation from dried seeds, ceremonial use, insufflation through tubes, and comparison with fly agaric intoxication.",
      abstract: "Spix and Martius's 1831 German travel narrative describes paricá among the Mura, including preparation from dried seeds, ceremonial use, insufflation through tubes, and comparison with fly agaric intoxication.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive scan. Excerpt PDF includes printed pages 1074-1076 of volume 3.",
      citation: "Spix, Johann Baptist von, and Carl Friedrich Philipp von Martius. Reise in Brasilien auf Befehl Sr. Majestät Maximilian Joseph I., Königs von Baiern, in den Jahren 1817 bis 1820 gemacht und beschrieben. Vol. 3. Munich: bei dem Verfasser; Leipzig: in Commission bei Friedrich Fleischer, 1831, pp. 1074-1076.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive scan of the 1831 Munich/Leipzig edition.",
      source_url: "https://archive.org/details/mobot31753000220282",
      external_access_url: pdfs.spix.source,
      access_type: "hosted",
      hosting_status: "translation_transcript_pdf",
      cover_image_path: `documents/${SPIX_ID}/pdf-thumbnails/${SPIX_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${SPIX_ID}/pdf-thumbnails/${SPIX_SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    },
    {
      id: LANGSDORFF_ID,
      slug: LANGSDORFF_SLUG,
      title: "Fly Agaric among the Koryaks in Langsdorff's Bemerkungen",
      subtitle: "A Kamchatka note on mushroom trade and intoxication",
      display_date: "1812",
      date_start: 1812,
      date_end: 1812,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "German",
      content_language: "German",
      translation_language: "English",
      translation_text_path: `translations/${LANGSDORFF_SLUG}.md`,
      translation_provider: "archive",
      translation_note: "Archive translation from the German text in the public-domain 1812 edition.",
      reader_mode: "translation",
      region: "Kamchatka; Siberia; Russian Empire",
      publication_place: "Frankfurt am Main",
      publisher: "Friedrich Wilmans",
      summary: "Langsdorff's 1812 German voyage account records fly agaric in Koryak trade with Russians and Kamchadals, noting in a footnote that Koryaks preferred it to brandy as a stupefying or intoxicating substance.",
      abstract: "Langsdorff's 1812 German voyage account records fly agaric in Koryak trade with Russians and Kamchadals, noting in a footnote that Koryaks preferred it to brandy as a stupefying or intoxicating substance.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive/Google Books scan. Excerpt PDF includes printed pages 274-276 of volume 2.",
      citation: "Langsdorff, Georg Heinrich von. Bemerkungen auf einer Reise um die Welt in den Jahren 1803 bis 1807. Vol. 2. Frankfurt am Main: Friedrich Wilmans, 1812, pp. 274-276.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive/Google Books scan of the 1812 Frankfurt edition.",
      source_url: "https://archive.org/details/bemerkungenaufe00langgoog",
      external_access_url: pdfs.langsdorff.source,
      access_type: "hosted",
      hosting_status: "translation_transcript_pdf",
      cover_image_path: `documents/${LANGSDORFF_ID}/pdf-thumbnails/${LANGSDORFF_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${LANGSDORFF_ID}/pdf-thumbnails/${LANGSDORFF_SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    }
  ]);

  upsertBy(documentPeople, ["document_id", "person_id", "role"], [
    { document_id: HUMBOLDT_ID, person_id: personId("alexander-von-humboldt"), role: "author" },
    { document_id: HUMBOLDT_ID, person_id: personId("aime-bonpland"), role: "author" },
    { document_id: HUMBOLDT_ID, person_id: personId("helen-maria-williams"), role: "translator" },
    { document_id: SPIX_ID, person_id: personId("johann-baptist-von-spix"), role: "author" },
    { document_id: SPIX_ID, person_id: personId("carl-friedrich-philipp-von-martius"), role: "author" },
    { document_id: LANGSDORFF_ID, person_id: personId("georg-heinrich-von-langsdorff"), role: "author" }
  ]);

  upsertBy(documentTags, ["document_id", "tag_id"], [
    ...tagLinks(HUMBOLDT_ID, [
      "1800-1950",
      "book-excerpt",
      "latin-america",
      "south-america",
      "orinoquia",
      "yopo",
      "niopo",
      "ethnobotany",
      "ethnography",
      "indigenous-knowledge",
      "field-science",
      "natural-history",
      "travel-writing",
      "psychoactive-plants"
    ], tagCache),
    ...tagLinks(SPIX_ID, [
      "1800-1950",
      "book-excerpt",
      "latin-america",
      "south-america",
      "amazonia",
      "brazil",
      "mura",
      "parica",
      "ethnobotany",
      "ethnography",
      "indigenous-knowledge",
      "field-science",
      "natural-history",
      "travel-writing",
      "psychoactive-plants"
    ], tagCache),
    ...tagLinks(LANGSDORFF_ID, [
      "1800-1950",
      "book-excerpt",
      "siberia",
      "kamchatka",
      "koryak",
      "fly-agaric",
      "amanita-muscaria",
      "mushrooms",
      "ethnography",
      "natural-history",
      "travel-writing",
      "psychoactive-plants"
    ], tagCache)
  ]);

  upsertBy(documentSections, "id", [
    section(HUMBOLDT_ID, 0, "Introduction", "source_note", humboldtSourceNote),
    section(HUMBOLDT_ID, 1, "Transcript", "transcript", humboldtTranscript),
    section(HUMBOLDT_ID, 2, "Historical context", "historical_context", expertContextPlaceholder),
    section(SPIX_ID, 0, "Introduction", "source_note", spixSourceNote),
    section(SPIX_ID, 1, "Original German", "transcript", spixOriginalGerman),
    section(SPIX_ID, 2, "Historical context", "historical_context", expertContextPlaceholder),
    section(LANGSDORFF_ID, 0, "Introduction", "source_note", langsdorffSourceNote),
    section(LANGSDORFF_ID, 1, "Original German", "transcript", langsdorffOriginalGerman),
    section(LANGSDORFF_ID, 2, "Historical context", "historical_context", expertContextPlaceholder)
  ]);

  upsertBy(files, "id", [
    pdfFile(HUMBOLDT_ID, pdfs.humboldt.local, pdfs.humboldt.storage),
    pdfFile(SPIX_ID, pdfs.spix.local, pdfs.spix.storage),
    pdfFile(LANGSDORFF_ID, pdfs.langsdorff.local, pdfs.langsdorff.storage)
  ]);

  upsertBy(assets, "id", [
    pdfAsset(HUMBOLDT_ID, HUMBOLDT_SLUG, pdfs.humboldt.local, pdfs.humboldt.storage, pdfs.humboldt.source),
    pdfAsset(SPIX_ID, SPIX_SLUG, pdfs.spix.local, pdfs.spix.storage, pdfs.spix.source),
    pdfAsset(LANGSDORFF_ID, LANGSDORFF_SLUG, pdfs.langsdorff.local, pdfs.langsdorff.storage, pdfs.langsdorff.source)
  ]);

  upsertBy(externalSources, "id", [
    externalSource(HUMBOLDT_ID, "Internet Archive", "Full source page", "https://archive.org/details/personalnarrati521821humb", "Public-domain 1821 London edition.", true),
    externalSource(HUMBOLDT_ID, "Internet Archive", "Full source PDF", pdfs.humboldt.source, "Public-domain 1821 London edition.", false),
    externalSource(SPIX_ID, "Internet Archive", "Full source page", "https://archive.org/details/mobot31753000220282", "Public-domain 1831 Munich/Leipzig edition.", true),
    externalSource(SPIX_ID, "Internet Archive", "Full source PDF", pdfs.spix.source, "Public-domain 1831 Munich/Leipzig edition.", false),
    externalSource(LANGSDORFF_ID, "Internet Archive", "Full source page", "https://archive.org/details/bemerkungenaufe00langgoog", "Public-domain 1812 Frankfurt edition, digitized by Google Books.", true),
    externalSource(LANGSDORFF_ID, "Internet Archive", "Full source PDF", pdfs.langsdorff.source, "Public-domain 1812 Frankfurt edition, digitized by Google Books.", false)
  ]);

  await writeJson("documents", documents);
  await writeJson("people", peopleRows);
  await writeJson("tags", tagRows);
  await writeJson("document_people", documentPeople);
  await writeJson("document_tags", documentTags);
  await writeJson("document_sections", documentSections);
  await writeJson("files", files);
  await writeJson("assets", assets);
  await writeJson("external_sources", externalSources);

  await updateArchiveSources();
  await updateReadmeCounts();

  await mirrorCsv("documents", documents);
  await mirrorCsv("people", peopleRows);
  await mirrorCsv("tags", tagRows);
  await mirrorCsv("document_people", documentPeople);
  await mirrorCsv("document_tags", documentTags);
  await mirrorCsv("document_sections", documentSections);
  await mirrorCsv("files", files);
  await mirrorCsv("assets", assets);
  await mirrorCsv("external_sources", externalSources);

  console.log(`Staged ${HUMBOLDT_SLUG}, ${SPIX_SLUG}, and ${LANGSDORFF_SLUG}`);
}

function person(slug, name, sort_name, birth_year, death_year, bio) {
  return {
    id: deterministicUuid(`person:${slug}`),
    slug,
    name,
    sort_name,
    birth_year,
    death_year,
    bio
  };
}

function personId(slug) {
  const row = people.find((personRow) => personRow.slug === slug);
  if (!row) throw new Error(`Missing person ${slug}`);
  return row.id;
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

function tagLinks(documentId, slugs, tagCache) {
  return slugs.map((slug) => {
    const tagId = tagCache.get(slug);
    if (!tagId) throw new Error(`Missing tag ${slug}`);
    return { document_id: documentId, tag_id: tagId };
  });
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

function pdfFile(documentId, localPath, storagePath) {
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

function externalSource(documentId, repositoryName, accessLabel, url, rightsNote, isPrimary) {
  return {
    id: deterministicUuid(`${documentId}:external:${accessLabel}:${url}`),
    document_id: documentId,
    repository_name: repositoryName,
    institution_name: "",
    url,
    access_label: accessLabel,
    stable_identifier: url,
    rights_note: rightsNote,
    is_primary: isPrimary,
    last_checked_at: null
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
      id: HUMBOLDT_SLUG.replaceAll("-", "_"),
      slug: HUMBOLDT_SLUG,
      title: "Niopo among the Otomac in Humboldt and Bonpland's Personal Narrative",
      author: "Alexander von Humboldt; Aimé Bonpland",
      year: 1821,
      displayDate: "1821",
      type: "Book Excerpt",
      medium: "Text",
      era: "1800-1950",
      region: "Orinoco; Orinoquia; Venezuela",
      language: "English",
      tags: ["1800-1950", "Book excerpt", "Latin America", "South America", "Orinoquia", "Yopo", "Niopo", "Ethnobotany", "Ethnography", "Indigenous knowledge", "Field science", "Natural history", "Travel writing", "Psychoactive Plants"],
      people: ["Alexander von Humboldt", "Aimé Bonpland", "Helen Maria Williams"],
      substances: ["Niopo", "Yopo"],
      summary: "Humboldt and Bonpland's Personal Narrative describes niopo snuff among the Otomac on the Orinoco, including preparation, nasal apparatus, missionary testimony, and comparison with curupa.",
      excerpt: "They throw themselves into a peculiar state of intoxication, we might almost say of madness, by the use of the powder of niopo.",
      citation: "Humboldt, Alexander von, and Aimé Bonpland. Personal Narrative of Travels to the Equinoctial Regions of the New Continent. Translated by Helen Maria Williams. Vol. 5, part 2. London: Longman, Hurst, Rees, Orme, and Brown, 1821.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/personalnarrati521821humb",
      accessType: "hosted",
      hostingStatus: "transcript_pdf",
      wordCount: wordCount(humboldtTranscript),
      addedDate: "2026-07-08",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${HUMBOLDT_ID}/pdf-thumbnails/${HUMBOLDT_SLUG}/page-001.jpg`,
      transcript: humboldtTranscript
    },
    {
      id: SPIX_SLUG.replaceAll("-", "_"),
      slug: SPIX_SLUG,
      title: "Paricá among the Mura in Spix and Martius's Reise in Brasilien",
      author: "Johann Baptist von Spix; Carl Friedrich Philipp von Martius",
      year: 1831,
      displayDate: "1831",
      type: "Book Excerpt",
      medium: "Text",
      era: "1800-1950",
      region: "Brazil; Amazonia; Madeira River",
      language: "German",
      tags: ["1800-1950", "Book excerpt", "Latin America", "South America", "Amazonia", "Brazil", "Mura", "Paricá", "Ethnobotany", "Ethnography", "Indigenous knowledge", "Natural history", "Travel writing"],
      people: ["Johann Baptist von Spix", "Carl Friedrich Philipp von Martius"],
      substances: ["Paricá"],
      summary: "Spix and Martius's German travel narrative describes paricá among the Mura, including preparation from dried seeds, ceremonial use, insufflation through tubes, and comparison with fly agaric intoxication.",
      excerpt: "Das Pulver wird aus den gedörrten Samen der Paricá-üva, einer Art Inga, bereitet, und wirkt zuerst erregend, dann narkotisch.",
      citation: "Spix, Johann Baptist von, and Carl Friedrich Philipp von Martius. Reise in Brasilien. Vol. 3. Munich: bei dem Verfasser; Leipzig: in Commission bei Friedrich Fleischer, 1831.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/mobot31753000220282",
      accessType: "hosted",
      hostingStatus: "translation_transcript_pdf",
      wordCount: wordCount(spixOriginalGerman),
      addedDate: "2026-07-08",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${SPIX_ID}/pdf-thumbnails/${SPIX_SLUG}/page-001.jpg`,
      transcript: spixOriginalGerman,
      translation: spixTranslation
    },
    {
      id: LANGSDORFF_SLUG.replaceAll("-", "_"),
      slug: LANGSDORFF_SLUG,
      title: "Fly Agaric among the Koryaks in Langsdorff's Bemerkungen",
      author: "Georg Heinrich von Langsdorff",
      year: 1812,
      displayDate: "1812",
      type: "Book Excerpt",
      medium: "Text",
      era: "1800-1950",
      region: "Kamchatka; Siberia; Russian Empire",
      language: "German",
      tags: ["1800-1950", "Book excerpt", "Siberia", "Kamchatka", "Koryak", "Fly agaric", "Amanita muscaria", "Mushrooms", "Ethnography", "Natural history", "Travel writing"],
      people: ["Georg Heinrich von Langsdorff"],
      substances: ["Fly agaric", "Amanita muscaria", "Mushrooms"],
      summary: "Langsdorff's 1812 German voyage account records fly agaric in Koryak trade with Russians and Kamchadals, noting that Koryaks preferred it to brandy as a stupefying or intoxicating substance.",
      excerpt: "Die Fliegenschwämme werden von den Koräken als ein betäubendes oder berauschendes Mittel, selbst dem Branntwein vorgezogen.",
      citation: "Langsdorff, Georg Heinrich von. Bemerkungen auf einer Reise um die Welt in den Jahren 1803 bis 1807. Vol. 2. Frankfurt am Main: Friedrich Wilmans, 1812.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/bemerkungenaufe00langgoog",
      accessType: "hosted",
      hostingStatus: "translation_transcript_pdf",
      wordCount: wordCount(langsdorffOriginalGerman),
      addedDate: "2026-07-08",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${LANGSDORFF_ID}/pdf-thumbnails/${LANGSDORFF_SLUG}/page-001.jpg`,
      transcript: langsdorffOriginalGerman,
      translation: langsdorffTranslation
    }
  ]);

  await fs.writeFile(archivePath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(importDir, "archive_sources.jsonl"), `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
}

async function updateReadmeCounts() {
  const readmePath = path.join(importDir, "README.md");
  const counts = {
    documents: (await readJson("documents")).length,
    pages: (await readJson("pages")).length,
    files: (await readJson("files")).length,
    assets: (await readJson("assets")).length,
    externalSources: (await readJson("external_sources")).length,
    people: (await readJson("people")).length,
    tags: (await readJson("tags")).length
  };

  let text = "";
  try {
    text = await fs.readFile(readmePath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const next = text.replace(/## Counts[\s\S]*$/m, `## Counts

- Documents: ${counts.documents}
- Pages: ${counts.pages}
- Files/assets: ${counts.files} files / ${counts.assets} assets
- External sources: ${counts.externalSources}
- People: ${counts.people}
- Tags: ${counts.tags}
`);
  await fs.writeFile(readmePath, next || `# Latin American Psychedelic Research Import Staging

## Counts

- Documents: ${counts.documents}
- Pages: ${counts.pages}
- Files/assets: ${counts.files} files / ${counts.assets} assets
- External sources: ${counts.externalSources}
- People: ${counts.people}
- Tags: ${counts.tags}
`, "utf8");
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

function unique(values) {
  return [...new Set(values)];
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
