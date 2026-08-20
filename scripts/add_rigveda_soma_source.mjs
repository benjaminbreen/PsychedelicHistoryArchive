#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const importDir = path.join(root, "data", "latin-america-import");

const SLUG = "rigveda-soma-hymns";
const DOCUMENT_ID = deterministicUuid(`document:${SLUG}`);

const expertContextPlaceholder = `_This historical-context essay is open for contribution._

Are you a scholar, archivist, community knowledge holder, or subject expert with relevant expertise in this source? Please use the [source issue form](#source-issue-report) at the bottom of this page to propose a short context essay or suggest a contributor. Choose "Other concern" and include "Historical context essay" in the location field.`;

const sourceNote = `_These selected Rigvedic Soma hymns are among the oldest textual witnesses to a ritual drink described as intoxicating, divine, and immortality-giving. They are included here as evidence for soma's ritual and visionary language, not as a claim that soma can be securely identified with any modern plant, fungus, or preparation._`;

const originalSanskrit = `_Source: Rigveda 8.48 and 9.113. The Devanagari text is ancient and public domain; this transcription was checked against Sanskrit Wikisource's pages for these hymns, available under CC BY-SA 4.0. The Sayana commentary included on Wikisource is omitted here._

#### Rigveda 8.48, Soma

स्वादोरभक्षि वयसः सुमेधाः स्वाध्यो वरिवोवित्तरस्य ।
विश्वे यं देवा उत मर्त्यासो मधु ब्रुवन्तो अभि संचरन्ति ॥१॥

अन्तश्च प्रागा अदितिर्भवास्यवयाता हरसो दैव्यस्य ।
इन्दविन्द्रस्य सख्यं जुषाणः श्रौष्टीव धुरमनु राय ऋध्याः ॥२॥

अपाम सोमममृता अभूमागन्म ज्योतिरविदाम देवान् ।
किं नूनमस्मान्कृणवदरातिः किमु धूर्तिरमृत मर्त्यस्य ॥३॥

शं नो भव हृद आ पीत इन्दो पितेव सोम सूनवे सुशेवः ।
सखेव सख्य उरुशंस धीरः प्र ण आयुर्जीवसे सोम तारीः ॥४॥

इमे मा पीता यशस उरुष्यवो रथं न गावः समनाह पर्वसु ।
ते मा रक्षन्तु विस्रसश्चरित्रादुत मा स्रामाद्यवयन्त्विन्दवः ॥५॥

अग्निं न मा मथितं सं दिदीपः प्र चक्षय कृणुहि वस्यसो नः ।
अथा हि ते मद आ सोम मन्ये रेवाँ इव प्र चरा पुष्टिमच्छ ॥६॥

इषिरेण ते मनसा सुतस्य भक्षीमहि पित्र्यस्येव रायः ।
सोम राजन्प्र ण आयूंषि तारीरहानीव सूर्यो वासराणि ॥७॥

सोम राजन्मृळया नः स्वस्ति तव स्मसि व्रत्यास्तस्य विद्धि ।
अलर्ति दक्ष उत मन्युरिन्दो मा नो अर्यो अनुकामं परा दाः ॥८॥

त्वं हि नस्तन्वः सोम गोपा गात्रेगात्रे निषसत्था नृचक्षाः ।
यत्ते वयं प्रमिनाम व्रतानि स नो मृळ सुषखा देव वस्यः ॥९॥

ऋदूदरेण सख्या सचेय यो मा न रिष्येद्धर्यश्व पीतः ।
अयं यः सोमो न्यधाय्यस्मे तस्मा इन्द्रं प्रतिरमेम्यायुः ॥१०॥

अप त्या अस्थुरनिरा अमीवा निरत्रसन्तमिषीचीरभैषुः ।
आ सोमो अस्माँ अरुहद्विहाया अगन्म यत्र प्रतिरन्त आयुः ॥११॥

यो न इन्दुः पितरो हृत्सु पीतोऽमर्त्यो मर्त्याँ आविवेश ।
तस्मै सोमाय हविषा विधेम मृळीके अस्य सुमतौ स्याम ॥१२॥

त्वं सोम पितृभिः संविदानोऽनु द्यावापृथिवी आ ततन्थ ।
तस्मै त इन्दो हविषा विधेम वयं स्याम पतयो रयीणाम् ॥१३॥

त्रातारो देवा अधि वोचता नो मा नो निद्रा ईशत मोत जल्पिः ।
वयं सोमस्य विश्वह प्रियासः सुवीरासो विदथमा वदेम ॥१४॥

त्वं नः सोम विश्वतो वयोधास्त्वं स्वर्विदा विशा नृचक्षाः ।
त्वं न इन्द ऊतिभिः सजोषाः पाहि पश्चातादुत वा पुरस्तात् ॥१५॥

#### Rigveda 9.113, Soma Pavamana

शर्यणावति सोममिन्द्रः पिबतु वृत्रहा ।
बलं दधान आत्मनि करिष्यन्वीर्यं महदिन्द्रायेन्दो परि स्रव ॥१॥

आ पवस्व दिशां पत आर्जीकात्सोम मीढ्वः ।
ऋतवाकेन सत्येन श्रद्धया तपसा सुत इन्द्रायेन्दो परि स्रव ॥२॥

पर्जन्यवृद्धं महिषं तं सूर्यस्य दुहिताभरत् ।
तं गन्धर्वाः प्रत्यगृभ्णन्तं सोमे रसमादधुरिन्द्रायेन्दो परि स्रव ॥३॥

ऋतं वदन्नृतद्युम्न सत्यं वदन्सत्यकर्मन् ।
श्रद्धां वदन्सोम राजन्धात्रा सोम परिष्कृत इन्द्रायेन्दो परि स्रव ॥४॥

सत्यमुग्रस्य बृहतः सं स्रवन्ति संस्रवाः ।
सं यन्ति रसिनो रसाः पुनानो ब्रह्मणा हर इन्द्रायेन्दो परि स्रव ॥५॥

यत्र ब्रह्मा पवमान छन्दस्यां वाचं वदन् ।
ग्राव्णा सोमे महीयते सोमेनानन्दं जनयन्निन्द्रायेन्दो परि स्रव ॥६॥

यत्र ज्योतिरजस्रं यस्मिँल्लोके स्वर्हितम् ।
तस्मिन्मां धेहि पवमानामृते लोके अक्षित इन्द्रायेन्दो परि स्रव ॥७॥

यत्र राजा वैवस्वतो यत्रावरोधनं दिवः ।
यत्रामूर्यह्वतीरापस्तत्र माममृतं कृधीन्द्रायेन्दो परि स्रव ॥८॥

यत्रानुकामं चरणं त्रिनाके त्रिदिवे दिवः ।
लोका यत्र ज्योतिष्मन्तस्तत्र माममृतं कृधीन्द्रायेन्दो परि स्रव ॥९॥

यत्र कामा निकामाश्च यत्र ब्रध्नस्य विष्टपम् ।
स्वधा च यत्र तृप्तिश्च तत्र माममृतं कृधीन्द्रायेन्दो परि स्रव ॥१०॥

यत्रानन्दाश्च मोदाश्च मुदः प्रमुद आसते ।
कामस्य यत्राप्ताः कामास्तत्र माममृतं कृधीन्द्रायेन्दो परि स्रव ॥११॥`;

const griffithTranslation = `_Public-domain English translation by Ralph T. H. Griffith from The Hymns of the Rigveda, 2nd ed., vol. 2 (Benares: E. J. Lazarus and Co., 1897), pp. 198-199 and 381-382. The lineation is lightly normalized from the printed scan._

#### Rigveda 8.48, Soma

1. Wisely have I enjoyed the savoury viand, religious-thoughted, best to find out treasure. The food to which all Deities and mortals, calling it meath, gather themselves together.

2. Thou shalt be Aditi as thou hast entered within, appeaser of celestial anger. Indu, enjoying Indra's friendship, bring us - as a swift steed the car - forward to riches.

3. We have drunk Soma and become immortal; we have attained the light, the Gods discovered. Now what may foeman's malice do to harm us? What, O Immortal, mortal man's deception?

4. Absorbed into the heart, be sweet, O Indu, as a kind father to his son, O Soma, as a wise Friend to friend: do thou, wide-ruler, O Soma, lengthen out our days for living.

5. These glorious drops that give me freedom have I drunk. Closely they knit my joints as straps secure a car. Let them protect my foot from slipping on the way: yea, let the drops I drink preserve me from disease.

6. Make me shine bright like fire produced by friction: give us a clearer sight and make us better. For in carouse I think of thee, O Soma, Shall I, as a rich man, attain to comfort?

7. May we enjoy with an enlivened spirit the juice thou givest, like ancestral riches. O Soma, King, prolong thou our existence as Surya makes the shining days grow longer.

8. King Soma, favour us and make us prosper: we are thy devotees; of this be mindful. Spirit and power are fresh in us, O Indu: give us not up unto our foeman's pleasure.

9. For thou hast settled in each joint, O Soma, aim of men's eyes and guardian of our bodies. When we offend against thine holy statutes, as a kind Friend, God, best of all, be gracious.

10. May I be with the Friend whose heart is tender, who, Lord of Bays! when quaffed will never harm me - this Soma now deposited within me. For this, I pray for longer life to Indra.

11. Our maladies have lost their strength and vanished: they feared, and passed away into the darkness. Soma hath risen in us, exceeding mighty, and we are come where men prolong existence.

12. Fathers, that Indu which our hearts have drunken, Immortal in himself, hath entered mortals. So let us serve this Soma with oblation, and rest securely in his grace and favour.

13. Associate with the Fathers thou, O Soma, hast spread thyself abroad through earth and heaven. So with oblation let us serve thee, Indu, and so let us become the lords of riches.

14. Give us your blessing, O ye Gods, preservers. Never may sleep or idle talk control us. But evermore may we, as friends of Soma, speak to the synod with brave sons around us.

15. On all sides, Soma, thou art our life-giver: aim of all eyes, light-finder, come within us. Indu, of one accord with thy protections both from behind and from before preserve us.

#### Rigveda 9.113, Soma Pavamana

1. Let Vritra-slaying Indra drink Soma by Saryanavan's side, storing up vigour in his heart, prepared to do heroic deeds. Flow, Indu, flow for Indra's sake.

2. Lord of the Quarters, flow thou on, boon Soma, from Arjika land, effused with ardour and with faith, and the true hymn of sacrifice. Flow, Indu, flow for Indra's sake.

3. Hither hath Surya's Daughter brought the wild Steer whom Parjanya nursed. Gandharvas have seized hold of him, and in the Soma laid the juice. Flow, Indu, flow for Indra's sake.

4. Splendid by Law! declaring Law, truth-speaking, truthful in thy works, enouncing faith, King Soma! thou, O Soma, whom thy maker decks. Flow, Indu, flow for Indra's sake.

5. Together flow the meeting streams of him the Great and truly Strong. The juices of the juicy meet. Made pure by prayer, O Golden-hued, flow, Indu, flow for Indra's sake.

6. O Pavamana, where the priest, as he recites the rhythmic prayer, lords it o'er Soma with the stone, with Soma bringing forth delight, flow, Indu, flow for Indra's sake.

7. O Pavamana, place me in that deathless, undecaying world wherein the light of heaven is set, and everlasting lustre shines. Flow, Indu, flow for Indra's sake.

8. Make me immortal in that realm where dwells the King, Vivasvan's Son, where is the secret shrine of heaven, where are those waters young and fresh. Flow, Indu, flow for Indra's sake.

9. Make me immortal in that realm where they move even as they list, in the third sphere of inmost heaven where lucid worlds are full of light. Flow, Indu, flow for Indra's sake.

10. Make me immortal in that realm of eager wish and strong desire, the region of the radiant Moon, where food and full delight are found. Flow, Indu, flow for Indra's sake.

11. Make me immortal in that realm where happiness and transports, where joys and felicities combine, and longing wishes are fulfilled. Flow, Indu, flow for Indra's sake.`;

const people = [
  {
    id: deterministicUuid("person:ralph-t-h-griffith"),
    slug: "ralph-t-h-griffith",
    name: "Ralph T. H. Griffith",
    sort_name: "Griffith, Ralph T. H.",
    birth_year: 1826,
    death_year: 1906,
    bio: "British Indologist, educator, and translator whose late nineteenth-century English renderings of the Vedas made Sanskrit texts widely available to Anglophone readers."
  }
];

const newTags = [
  tag("pre-500", "Pre-500 CE", "era"),
  tag("soma", "Soma", "substance"),
  tag("ancient-india", "Ancient India", "region"),
  tag("south-asia", "South Asia", "region"),
  tag("vedic-ritual", "Vedic ritual", "topic"),
  tag("vedic-texts", "Vedic texts", "topic"),
  tag("sanskrit", "Sanskrit", "topic"),
  tag("contested-identification", "Contested identification", "topic")
];

async function main() {
  await fs.mkdir(path.join(importDir, "translations"), { recursive: true });
  await fs.writeFile(path.join(importDir, "translations", `${SLUG}.md`), `${griffithTranslation}\n`, "utf8");

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

  const pdfLocalPath = `pdfs/${SLUG}/rigveda-soma-hymns-excerpts.pdf`;
  const pdfStoragePath = `documents/${DOCUMENT_ID}/pdfs/${SLUG}/rigveda-soma-hymns-excerpts.pdf`;
  const pdfSourceUrl = "https://archive.org/download/hymnsrigveda00unkngoog/hymnsrigveda00unkngoog.pdf";

  upsertBy(documents, "id", [
    {
      id: DOCUMENT_ID,
      slug: SLUG,
      title: "Soma Hymns in the Rigveda",
      subtitle: "RV 8.48 and 9.113 on soma, immortality, and light",
      display_date: "c. 1500-1000 BCE; translation 1897",
      date_start: -1500,
      date_end: -1000,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "Sanskrit",
      content_language: "Sanskrit",
      translation_language: "English",
      translation_text_path: `translations/${SLUG}.md`,
      translation_provider: "published",
      translation_note: "Published English translation by Ralph T. H. Griffith from the public-domain 1897 Benares edition; line breaks lightly normalized.",
      reader_mode: "translation",
      region: "Ancient India; South Asia",
      publication_place: "Benares",
      publisher: "E. J. Lazarus and Co.",
      summary: "Two selected Rigvedic hymns to Soma: RV 8.48, the famous hymn of drinking soma and becoming immortal, and RV 9.113, a Soma Pavamana hymn asking to be placed in deathless worlds of light, delight, and fulfilled desire.",
      abstract: "Two selected Rigvedic hymns to Soma: RV 8.48, the famous hymn of drinking soma and becoming immortal, and RV 9.113, a Soma Pavamana hymn asking to be placed in deathless worlds of light, delight, and fulfilled desire.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive/Google Books scan of Griffith's 1897 volume. Excerpt PDF includes printed pages 198-199 and 381-382 of volume 2.",
      citation: "Rigveda 8.48 and 9.113. In The Hymns of the Rigveda, translated with a popular commentary by Ralph T. H. Griffith, 2nd ed., vol. 2. Benares: E. J. Lazarus and Co., 1897, pp. 198-199, 381-382. Sanskrit Devanagari text checked against Sanskrit Wikisource.",
      rights_statement: "Rigvedic Sanskrit text is public domain. Griffith's 1897 English translation and the excerpted scan pages are public domain in the United States. Devanagari transcription checked against Sanskrit Wikisource, available under CC BY-SA 4.0.",
      source_url: "https://archive.org/details/hymnsrigveda00unkngoog",
      external_access_url: pdfSourceUrl,
      access_type: "hosted",
      hosting_status: "translation_transcript_pdf",
      cover_image_path: `documents/${DOCUMENT_ID}/pdf-thumbnails/${SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${DOCUMENT_ID}/pdf-thumbnails/${SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    }
  ]);

  upsertBy(documentPeople, ["document_id", "person_id", "role"], [
    { document_id: DOCUMENT_ID, person_id: personId("ralph-t-h-griffith"), role: "translator" }
  ]);

  upsertBy(documentTags, ["document_id", "tag_id"], [
    ...tagLinks(DOCUMENT_ID, [
      "pre-500",
      "book-excerpt",
      "soma",
      "ancient-india",
      "india",
      "south-asia",
      "religion",
      "ritual",
      "vedic-ritual",
      "vedic-texts",
      "sanskrit",
      "visionary-experience",
      "contested-identification",
      "psychoactive-plants"
    ], tagCache)
  ]);

  upsertBy(documentSections, "id", [
    section(DOCUMENT_ID, 0, "Introduction", "source_note", sourceNote),
    section(DOCUMENT_ID, 1, "Original Sanskrit", "transcript", originalSanskrit),
    section(DOCUMENT_ID, 2, "Historical context", "historical_context", expertContextPlaceholder)
  ]);

  upsertBy(files, "id", [
    pdfFile(DOCUMENT_ID, pdfLocalPath, pdfStoragePath)
  ]);

  upsertBy(assets, "id", [
    pdfAsset(DOCUMENT_ID, SLUG, pdfLocalPath, pdfStoragePath, pdfSourceUrl)
  ]);

  upsertBy(externalSources, "id", [
    externalSource(DOCUMENT_ID, "Internet Archive", "Full source page", "https://archive.org/details/hymnsrigveda00unkngoog", "Public-domain 1897 Benares edition, digitized by Google Books.", true),
    externalSource(DOCUMENT_ID, "Internet Archive", "Full source PDF", pdfSourceUrl, "Public-domain 1897 Benares edition, digitized by Google Books.", false),
    externalSource(DOCUMENT_ID, "Sanskrit Wikisource", "Rigveda 8.48 Sanskrit text", "https://sa.wikisource.org/wiki/ऋग्वेदः_सूक्तं_८.४८", "Ancient Sanskrit text; online page text available under CC BY-SA 4.0.", false),
    externalSource(DOCUMENT_ID, "Sanskrit Wikisource", "Rigveda 9.113 Sanskrit text", "https://sa.wikisource.org/wiki/ऋग्वेदः_सूक्तं_९.११३", "Ancient Sanskrit text; online page text available under CC BY-SA 4.0.", false)
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

  console.log(`Staged ${SLUG}`);
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
      id: SLUG.replaceAll("-", "_"),
      slug: SLUG,
      title: "Soma Hymns in the Rigveda",
      author: "Rigveda; Ralph T. H. Griffith (translator)",
      year: -1500,
      displayDate: "c. 1500-1000 BCE; translation 1897",
      type: "Book Excerpt",
      medium: "Text",
      era: "pre-500",
      region: "Ancient India; South Asia",
      language: "Sanskrit",
      tags: ["Pre-500 CE", "Book excerpt", "Soma", "Ancient India", "India", "South Asia", "Religion", "Ritual", "Vedic ritual", "Vedic texts", "Sanskrit", "Visionary experience", "Contested identification", "Psychoactive Plants"],
      people: ["Ralph T. H. Griffith"],
      substances: ["Soma"],
      summary: "Two selected Rigvedic hymns to Soma: RV 8.48, the famous hymn of drinking soma and becoming immortal, and RV 9.113, a Soma Pavamana hymn asking to be placed in deathless worlds of light, delight, and fulfilled desire.",
      excerpt: "We have drunk Soma and become immortal; we have attained the light, the Gods discovered.",
      citation: "Rigveda 8.48 and 9.113. In The Hymns of the Rigveda, translated with a popular commentary by Ralph T. H. Griffith, 2nd ed., vol. 2. Benares: E. J. Lazarus and Co., 1897.",
      rights: "Public domain, with Sanskrit Wikisource transcription witness attributed under CC BY-SA 4.0.",
      sourceUrl: "https://archive.org/details/hymnsrigveda00unkngoog",
      accessType: "hosted",
      hostingStatus: "translation_transcript_pdf",
      wordCount: wordCount(`${originalSanskrit}\n\n${griffithTranslation}`),
      addedDate: "2026-07-09",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${DOCUMENT_ID}/pdf-thumbnails/${SLUG}/page-001.jpg`,
      transcript: originalSanskrit,
      translation: griffithTranslation
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
