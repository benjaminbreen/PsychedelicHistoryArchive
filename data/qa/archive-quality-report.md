# Archive Source QA Report

- Total issues: 7921
- High: 0
- Medium: 7801
- Low: 120

## Tracks
- `editorial_cleanup`: 7507
- `metadata_review`: 414

## Top Issue Kinds
- `text_stray_ocr_punctuation`: 3458
- `text_broken_hyphen`: 3331
- `text_digit_letter_noise`: 347
- `text_mixed_case_word`: 231
- `text_page_without_ocr`: 140
- `abrupt_truncation`: 131
- `long_transcript_without_speaker_labels`: 81
- `section_position_gap`: 68
- `placeholder_or_review_note`: 63
- `missing_region`: 23
- `hosted_source_has_search_text_only`: 13
- `oversized_single_transcript_section`: 10
- `reader_mode_mismatch`: 7
- `transcript_source_needs_sections`: 7
- `not_published`: 4
- `missing_required_metadata`: 4
- `pdf_source_sections_optional`: 3

## Top Sources
- `project-mkultra-behavioral-modification-hearing`: 2840
- `church-committee-foreign-military-intelligence-book-one`: 1959
- `rockefeller-commission-cia-drug-experiments`: 1517
- `pluriverse-an-essay-in-the-philosophy-of-pluralism`: 753
- `the-anaesthetic-revelation-and-the-gist-of-philosophy`: 82
- `isbell-studies-lsd25-tolerance-1956`: 59
- `researches-chemical-and-philosophical-chiefly-concerning-nitrous-oxide`: 45
- `the-varieties-of-religious-experience`: 37
- `fbi-timothy-leary-escape-interview-1974`: 25
- `the-narcotic-pepper-the-chemistry-and-pharmacology-of-piper-methysticum-and-related-species`: 24
- `spruce-caapi-niopo-remarkable-narcotics`: 22
- `rinkel-experimental-schizophrenia-1952`: 21
- `a-pluralistic-universe`: 20
- `anaesthetics-antient-and-modern-an-historical-sketch-of-anaesthesia`: 17
- `ketchum-human-assessment-ea1729-inhalation-1964`: 16
- `the-will-to-believe-and-other-essays-in-popular-philosophy`: 16
- `nida-monograph-146-hallucinogens-update-1994`: 14
- `moreau-hachisch-alienation-mentale`: 14
- `ololiuhqui-peyote-idolatrias-supersticiones`: 13
- `merck-patent-de274350-mdma-1912`: 12

## Issues

### MEDIUM

#### `lsd-lettvin-vs-leary` / `placeholder_or_review_note`

- Import: `data/aapb-lettvin-leary-import`
- Field: `rights_statement`
- Title: LSD: Lettvin vs Leary
- Excerpt: AAPB online access provided by GBH and the Library of Congress. Transcript PDF rights status pending review; contact the archive before republication.

#### `chavin-de-huantar` / `text_digit_letter_noise`

- Import: `data/chavin-import`
- Field: `document_sections[Sources]`
- Title: Chavin de Huantar
- Excerpt: - UNESCO World Heritage Centre, : e2425125122. : 123-140. : 113-147. [doi:10.1080/00776297.2019.1574959]( - Kolar, Miriam A., John W. Rick, and collaborators. Research on Chavin pututus and archaeoacoustics, including "Sensing Sonically at Andean Formative Chavin de Huantar, Peru" and "Ancient Pututus Contextualized."
- Suggestion: Review OCR/transcription around this passage.

#### `cueva-del-chileno` / `text_broken_hyphen`

- Import: `data/cueva-del-chileno-import`
- Field: `document_sections[Mobility, Knowledge, And Ritual Authority]`
- Title: Cueva del Chileno
- Excerpt: The plants implied by the chemical profile do not fit the immediate highland environment. Coca, *Anadenanthera*, and harmine- or DMT-bearing plants point toward lower-elevation and tropical ecological zones. Penn State quoted Melanie Miller on this point: "None of the psychoactive compounds we found" came from plants growing in the local Andes.
- Suggestion: Review OCR/transcription around this passage.

#### `cueva-del-chileno` / `text_mixed_case_word`

- Import: `data/cueva-del-chileno-import`
- Field: `document_sections[Sources]`
- Title: Cueva del Chileno
- Excerpt: - Miller, Melanie J., Juan Albarracin-Jordan, Christine Moore, and Jose M. Capriles. "Chemical evidence for the use of multiple psychotropic plants in a 1,000-year-old ritual bundle from South America." *Proceedings of the National Academy of Sciences* 116, no. 23 (2019): 11207-11212. [doi:10.1073/pnas.1902174116]( PubMed: [PMID 31061128]( PMCID: PMC6561276...
- Suggestion: Review OCR/transcription around this passage.

#### `airfa-amendments-1994-public-law-103-344` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: American Indian Religious Freedom Act Amendments of 1994 (Public Law 103-344)
- Excerpt: [10, 20]

#### `airfa-amendments-1994-public-law-103-344` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: American Indian Religious Freedom Act Amendments of 1994 (Public Law 103-344)
- Excerpt: _Transcribed for the archive from govinfo.gov. One reading is doubtful in the scan and is marked in the text._
- Suggestion: Review OCR/transcription around this passage.

#### `airfa-amendments-1994-public-law-103-344` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: American Indian Religious Freedom Act Amendments of 1994 (Public Law 103-344)
- Excerpt: transportation, including, but not limited to, denial of otherwise applicable benefits under public assistance programs. "(2) This section does not prohibit such reasonable regulation and registration by the Drug Enforcement Administration of those persons who cultivate, harvest, or distribute peyote as may be consistent with the purposes of this Act. "(3)...
- Suggestion: Review OCR/transcription around this passage.

#### `army-ig-report-lsd-volunteers-1976` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Use of Volunteers in Chemical Agent Research
- Excerpt: [10, 20]

#### `army-ig-report-lsd-volunteers-1976` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Use of Volunteers in Chemical Agent Research
- Excerpt: All available evidence indicated that with one exception, which will be discussed under the chapter on intelligence testing, only volunteer subjects were used for the chemical drug or agent experiments by Army investigators. Moreover, the great majority of the volunteers signed formal volunteer agreements, prior to participation in experiments. These facts...
- Suggestion: Review OCR/transcription around this passage.

#### `blas-pablo-reko-nombres-botanicos-aztecas-1919` / `placeholder_or_review_note`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: De los nombres botánicos aztecas
- Excerpt: _[El México Antiguo published this piece as an excerpt from Reko's then-unpublished dictionary "Sinonimia vulgar y científica de la flora oaxaqueña." The full article runs some forty-five pages: a general essay on Nahuatl plant-name etymology, then an alphabetical catalogue of several hundred entries.]_ _[Reproduced below: the opening of that essay, a short...

#### `blas-pablo-reko-nombres-botanicos-aztecas-1919` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: De los nombres botánicos aztecas
- Excerpt: [10, 20]

#### `blas-pablo-reko-nombres-botanicos-aztecas-1919` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: De los nombres botánicos aztecas
- Excerpt: _Transcribed for the archive from books.google.com._
- Suggestion: Review OCR/transcription around this passage.

#### `blas-pablo-reko-nombres-botanicos-aztecas-1919` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: De los nombres botánicos aztecas
- Excerpt: Entre las lenguas indígenas es sin duda la más importante la mexicana (nahuatl). Ninguna otra lengua del Continente puede compararse con ella en riqueza de nombres botánicos conservados hasta nuestros tiempos. En muchos respectos, pero principalmente por su eufonía, se asemeja a la lengua helénica, y en facilidad de componer nuevas palabras por simple yuxta...
- Suggestion: Review OCR/transcription around this passage.

#### `blas-pablo-reko-nombres-botanicos-aztecas-1919` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: De los nombres botánicos aztecas
- Excerpt: Narcóticos, yautli (cosa nauseosa, narcótica): yau-tli: Tagetes lucida, cuau-yautli: Piper longum? pi-yotli (pi-yautli, yautli, pequeño) peyote, Anhalonium spec. div., piule, Ipomoea sidaefolia. yetl (cosa nauseosa) tabaco, Nicotiana spec. div. cuau-yetl: Wigandia caracasana? tla-patli (etimología obscura): Datura spec. div. quimich-patli (remedio contra ra...
- Suggestion: Review OCR/transcription around this passage.

#### `blas-pablo-reko-nombres-botanicos-aztecas-1919` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: De los nombres botánicos aztecas
- Excerpt: _[Narcotics, yautli ("nauseating thing," narcotic): yautli, Tagetes lucida... piyotli, peyote, Anhalonium species, and piule, Ipomoea sidaefolia... yetl, tobacco... tlapatli, Datura species... ololiuqui ("round thing"), seeds of Ipomoea sidaefolia... tlapatli, Datura stramonium.]_
- Suggestion: Review OCR/transcription around this passage.

#### `blas-pablo-reko-nombres-botanicos-aztecas-1919` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: De los nombres botánicos aztecas
- Excerpt: NANACATE ..... nana-catl (na-natl, carne, catl, caño, caña: caña de carne, hongo). Div. géneros de hongos, especialmente un hongo negro que crece sobre estiércol y produce efectos narcóticos.
- Suggestion: Review OCR/transcription around this passage.

#### `blas-pablo-reko-nombres-botanicos-aztecas-1919` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: De los nombres botánicos aztecas
- Excerpt: _[NANACATE — nanacatl (na-natl, "flesh," catl, "tube, cane": flesh-cane, mushroom). Various genera of mushrooms, especially a black mushroom that grows on dung and produces narcotic effects.]_
- Suggestion: Review OCR/transcription around this passage.

#### `bogoras-chukchee-fly-agaric` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Chukchee: Religion — Intoxicants
- Excerpt: [10, 20]

#### `bogoras-chukchee-fly-agaric` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: The Chukchee: Religion — Intoxicants
- Excerpt: _Transcribed for the archive from az.lib.ru. The 'Intoxicants' section of the chapter on food and stimulants, plus the fly-agaric passage from the chapter on animism in part two._
- Suggestion: Review OCR/transcription around this passage.

#### `bogoras-chukchee-fly-agaric` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Chukchee: Religion — Intoxicants
- Excerpt: Thus, for instance, the intoxicating mushrooms of the species fly-agaric are a "separate tribe" (ya'nřa-va'rat). They are very strong, and when growing up they lift upon their soft heads the heavy trunks of trees, and split them in two. A mushroom of this species grows through the heart of a stone and breaks it into minute fragments. Mushrooms appear to int...
- Suggestion: Review OCR/transcription around this passage.

#### `bogoras-koryak-texts-fly-agaric-song` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Koryak Texts
- Excerpt: [10, 20]

#### `bogoras-koryak-texts-fly-agaric-song` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Koryak Texts
- Excerpt: _[Technical discussion of dialect boundaries, twenty pages of linguistic notes, and a full roster of narrators are omitted. Named narrators include: Basile (Maritime Koryak, Pallan), Nicholas Vilkhin (Jochelson's interpreter, Kamenskoye), Anne (Koryak woman, Kamenskoye), Aqan'kau' (Maritime Chukchee, Anadyr mouth), Maria (Koryak woman, Qare'nm), Andrew (Mar...
- Suggestion: Review OCR/transcription around this passage.

#### `bogoras-koryak-texts-fly-agaric-song` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Koryak Texts
- Excerpt: _[Two further songs, not part of the numbered tale-collection, are appended.]_ These two songs were written down from the phonographic records of Mr. Jochelson (No. 2 and No. 7 on his list). The first is in Koryak of Kamenskoye; the second is Chukchee in grammar and phonetics, and Koryak in vocabulary. It was obtained from an old Reindeer Chukchee of Parapo...
- Suggestion: Review OCR/transcription around this passage.

#### `bogoras-koryak-texts-fly-agaric-song` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Koryak Texts
- Excerpt: I shall recover my senses, I shall have rest. Simply with fly-agaric (I have stunned myself). I shall recover my senses, then I will simply run to my sweetheart. I will sing of my bad children.
- Suggestion: Review OCR/transcription around this passage.

#### `church-of-the-holy-light-of-the-queen-v-mukasey-2009` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: Church of the Holy Light of the Queen v. Mukasey
- Excerpt: 5319 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `church-of-the-holy-light-of-the-queen-v-mukasey-2009` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Church of the Holy Light of the Queen v. Mukasey
- Excerpt: [10, 20]

#### `church-of-the-holy-light-of-the-queen-v-mukasey-2009` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Church of the Holy Light of the Queen v. Mukasey
- Excerpt: _Image: Apollo (Flickr user brindle95), via Wikimedia Commons, CC BY 2.0._
- Suggestion: Review OCR/transcription around this passage.

#### `church-of-the-holy-light-of-the-queen-v-mukasey-2009` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Church of the Holy Light of the Queen v. Mukasey
- Excerpt: FINDINGS OF FACT AND CONCLUSIONS OF LAW PANNER, District Judge. The issue is whether plaintiffs, who are followers of the Brazilian Santo Daime religion, are entitled to an exemption from the Controlled Substances Act to import and drink their sacrament, Daime tea. Because Daime tea contains the hallucinogen DMT, which is a Schedule I controlled substance,...
- Suggestion: Review OCR/transcription around this passage.

#### `cia-gottlieb-ssci-testimony-1975` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Testimony of Sidney Gottlieb before the Senate Select Committee on Intelligence Activities
- Excerpt: [10, 20]

#### `cia-gottlieb-ssci-testimony-1975` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Testimony of Sidney Gottlieb before the Senate Select Committee on Intelligence Activities
- Excerpt: Mr. Maxwell. ...in the Agency, or throughout the [DDP], how were people told that they could participate?
- Suggestion: Review OCR/transcription around this passage.

#### `cia-gottlieb-ssci-testimony-1975` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Testimony of Sidney Gottlieb before the Senate Select Committee on Intelligence Activities
- Excerpt: ...Do you recall in a general sense in regard to human experimentation at that time whether there was a policy on the part of TSS in regard to the forms of consent obtained or the notification to those people who are involved in projects that have been contracted out, experiments that have been contracted out?
- Suggestion: Review OCR/transcription around this passage.

#### `cia-ig-report-mkultra-1963` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Report of Inspection of MKULTRA
- Excerpt: [10, 20]

#### `cia-ig-report-mkultra-1963` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Report of Inspection of MKULTRA
- Excerpt: 5. MKULTRA was authorized by the then Director of Central Intelligence, Mr. Allen W. Dulles, in 1953. TSD was assigned responsibility thereby to employ a portion of its budget, eventually set at 20%, for research in behavioral materials under purely internal and compartmented controls (further details are provided in paragraphs 3-4 of the attached report)....
- Suggestion: Review OCR/transcription around this passage.

#### `cia-ig-report-mkultra-1963` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Report of Inspection of MKULTRA
- Excerpt: 11. ...with certain cleared and witting individuals in the Bureau of Narcotics in 1955 which provided for the release of MKULTRA materials for such testing as those individuals deemed desirable and feasible. The initial arrangement obtained the services of a senior representative of the Bureau and one of his assistants on the West Coast. A parallel arrangem...
- Suggestion: Review OCR/transcription around this passage.

#### `cia-rd-testing-behavioral-drugs-1975-memo` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: CIA R&D and Testing of Behavioral Drugs
- Excerpt: [10, 20]

#### `cia-rd-testing-behavioral-drugs-1975-memo` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: CIA R&D and Testing of Behavioral Drugs
- Excerpt: 5. During this period there was an informal Agency group known as the ARTICHOKE Committee, with representation from the Offices of Scientific Intelligence (OSI) and Medical Services (OMS), and the predecessor organizations of the Offices of Security and Technical Services (OTS). There are no records indicating the details of the exchanges in this committee,...
- Suggestion: Review OCR/transcription around this passage.

#### `cia-rd-testing-behavioral-drugs-1975-memo` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: CIA R&D and Testing of Behavioral Drugs
- Excerpt: 7. On 29 October 1952 a formal policy was established by the Deputy Director of Plans (as then styled, now Deputy Director for Operations) for the use of biochemicals in clandestine operations (MKDELTA). This was brought under a special funding procedure established on 3 April 1953 for special research purposes (MKULTRA). The program considered various poss...
- Suggestion: Review OCR/transcription around this passage.

#### `clement-alexandria-exhortation-eleusinian-mysteries` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Exhortation to the Greeks (Chapter II, on the Eleusinian and Related Mysteries)
- Excerpt: [10, 20]

#### `clement-alexandria-exhortation-eleusinian-mysteries` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Exhortation to the Greeks (Chapter II, on the Eleusinian and Related Mysteries)
- Excerpt: alluding, as I believe, under the name of the herdsman’s ox-goad, to the reed wielded by bacchanals. Do you wish me to go into the story of Persephatta’s gathering of flowers, her basket, and her seizure by Pluto (Aidoneus), and the rent in the earth, and the swine of Eubouleus that were swallowed up with the two goddesses; for which reason, in the Thesmoph...
- Suggestion: Review OCR/transcription around this passage.

#### `cohen-lsd-side-effects-complications-1960` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: Lysergic Acid Diethylamide: Side Effects and Complications
- Excerpt: 5660 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `cohen-lsd-side-effects-complications-1960` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Lysergic Acid Diethylamide: Side Effects and Complications
- Excerpt: [10, 20]

#### `cohen-lsd-side-effects-complications-1960` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Lysergic Acid Diethylamide: Side Effects and Complications
- Excerpt: A physician who had habitually inhaled nitrous oxide for many years was given 150 mcg. of LSD. Six months afterwards he was found dead in his room with the N2O mask on his face. The respondent (Janiger) does not consider that this suicide was the result of LSD administration, rather the occurrence was mentioned "for the record." From the circumstances it ma...
- Suggestion: Review OCR/transcription around this passage.

#### `commissioner-indian-affairs-peyote-reports-1913-1916` / `not_published`

- Import: `data/draft-import`
- Field: `status`
- Title: Peyote in the Annual Reports of the Commissioner of Indian Affairs, 1913-1916
- Excerpt: draft

#### `commissioner-indian-affairs-peyote-reports-1913-1916` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Peyote in the Annual Reports of the Commissioner of Indian Affairs, 1913-1916
- Excerpt: [10, 20]

#### `cooke-seven-sisters-sleep-amanita` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Seven Sisters of Sleep: Popular History of the Seven Prevailing Narcotics of the World
- Excerpt: [10, 20]

#### `dixon-anhalonium-lewinii-alkaloids-1899` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Physiological Action of the Alkaloids Derived from Anhalonium Lewinii
- Excerpt: [10, 20]

#### `dixon-anhalonium-lewinii-alkaloids-1899` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Physiological Action of the Alkaloids Derived from Anhalonium Lewinii
- Excerpt: By Walter E. Dixon, M.D., B.Sc. Lond., Salters' Company Research Fellow at St Thomas's Hospital
- Suggestion: Review OCR/transcription around this passage.

#### `dixon-anhalonium-lewinii-alkaloids-1899` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Physiological Action of the Alkaloids Derived from Anhalonium Lewinii
- Excerpt: ...of external objects appears particularly vivid, and some scent sprinkled on a handkerchief seemed at times peculiarly strong and penetrating. Pupils well dilated and act sluggishly to light. Feel a strong desire to lie down.
- Suggestion: Review OCR/transcription around this passage.

#### `ellis-mescal-divine-plant-1902` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Mescal: A Study of a Divine Plant
- Excerpt: [10, 20]

#### `ellis-mescal-divine-plant-1902` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Mescal: A Study of a Divine Plant
- Excerpt: "The most noteworthy, almost immediate, result of the first dose was that a headache which for some hours had shown a tendency to aggravation was somewhat relieved. At 3 began to feel drowsy. At 3:30 took another third of the infusion. My headache was speedily still further lightened, and I now felt a certain consciousness of energy and intellectual power....
- Suggestion: Review OCR/transcription around this passage.

#### `ellis-mescal-divine-plant-1902` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Mescal: A Study of a Divine Plant
- Excerpt: "8:30. [Written with pencil.] Pulse now much higher (72 in sitting position). Muscular incoordination is so considerable that it is very difficult to use a pen, but still easy to write with a pencil.
- Suggestion: Review OCR/transcription around this passage.

#### `ellis-mescal-divine-plant-1902` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Mescal: A Study of a Divine Plant
- Excerpt: "Meanwhile the visions continued with but little diminution of brilliancy, and the same perpetual novelty. Some new kind of effect was perpetually appearing in the field of vision; sometimes there was swift movement, sometimes dull somber richness of color, sometimes glitter and sparkle, once a startling rush of flashes that seemed to approach me. Usually t...
- Suggestion: Review OCR/transcription around this passage.

#### `employment-division-v-smith-1990` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: Employment Division, Department of Human Resources of Oregon v. Smith
- Excerpt: 6053 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `employment-division-v-smith-1990` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Employment Division, Department of Human Resources of Oregon v. Smith
- Excerpt: [10, 20]

#### `employment-division-v-smith-1990` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Employment Division, Department of Human Resources of Oregon v. Smith
- Excerpt: Justice Scalia delivered the opinion of the Court. This case requires us to decide whether the Free Exercise Clause of the First Amendment permits the State of Oregon to include religiously inspired peyote use within the reach of its general criminal prohibition on use of that drug, and thus permits the State to deny unemployment benefits to persons dismiss...
- Suggestion: Review OCR/transcription around this passage.

#### `employment-division-v-smith-1990` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Employment Division, Department of Human Resources of Oregon v. Smith
- Excerpt: Justice Blackmun, with whom Justice Brennan and Justice Marshall join, dissenting. This Court over the years painstakingly has developed a consistent and exacting standard to test the constitutionality of a state statute that burdens the free exercise of religion. Such a statute may stand only if the law in general, and the State’s refusal to allow a religi...
- Suggestion: Review OCR/transcription around this passage.

#### `employment-division-v-smith-1990` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Employment Division, Department of Human Resources of Oregon v. Smith
- Excerpt: The State proclaims an interest in protecting the health and safety of its citizens from the dangers of unlawful drugs. It offers, however, no evidence that the religious use of peyote has ever harmed anyone. The factual findings of other courts cast doubt on the State’s assumption that religious use of peyote is harmful. See State v. Whittingham, 19 Ariz....
- Suggestion: Review OCR/transcription around this passage.

#### `employment-division-v-smith-1990` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Employment Division, Department of Human Resources of Oregon v. Smith
- Excerpt: Indeed, Oregon’s attitude toward respondents’ religious peyote use harkens back to the repressive federal policies pursued a century ago: “In the government’s view, traditional practices were not only morally degrading, but unhealthy. ‘Indians are fond of gatherings of every description,’ a 1913 public health study complained, advocating the restriction of...
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: [10, 20]

#### `fbi-timothy-leary-escape-interview-1974` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: LEARY explained he is tellinger ROSEMARY that BELLINGER flew out to New York from the coast. LEARY describes him as solid and competent and that they are very lucky to have him take over. LEARY states BELLINGER made it very clear that he was available to do anything and if necessary every- thing regarding the escape, however, LEARY stated he prefers that MI...
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: TIMOTHY FRANCIS LEARY, JR. was interviewed at the office of the California Department of Corrections, 3415 Fletcher Avenue, Suite 201, Also present at the beginning of the interview was a Special Agent of the b6 California Department of Corrections. b7C
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: Interviewing Agent personnel had in their possession considerable papers, documents, correspondence and other memorabilia beldénging to LEARY which had been obtained on July 16, LO74, from personnel of the Drug Enforcement Administration (DEA), Los Angeles, California.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: Another communication located among the LEARY documents is a cablegram bearing a dated stamp of "Central Telegraphique Alger" with the numbers "2-2- 1971." The text of the cablegram went to LEARY under the name of Mr. and Mrs, WILLIAM MC NELLIS CHEZ, Ait Kacimi 6th Etage, Apartment A/B7, Rue Lafayette Algiers (Algeria) is as follows:
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: be b7Cc LEARY identified the cablegram as being directed to him and identified[___Jas a dope dealer from Orange County and San Francisco. The "MICHAEL" mentioned in the cablegram, according to LEARY, is MICHAEL KENNEDY.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: #22, Letter from ROSEMARY LEARY to TIMOTHY LEARY, dated July 13, 1970, LEARY advised that his wife, ROSEMARY, disclosed that she and MICHAEL RANDALL intended to meet with MICHAEL and ELEANOR KENNEDY, time unknown. ROSEMARY further disclosed b7C that she had met with JOSEPH RHINE and MICHAEL KENNEDY and was reassured by them that everything would be alright....
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: #35. Letter from TIMOTHY LEARY to ROSEMARY LEARY, dated August10, 1970. LEARY advised that in this letter he is discussing the roles of ROSEMARY, BELLINGER and himself regarding the escape. LEARY stated he is attempting to allay the fears and suspicions of ROSEMARY as she is soon to meet BELLINGER. LEARY advised that the letter was written in coded form and...
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: #45. One letter from ROSEMARY LEARY to[___} b6é LEARY advised is a dope dealer in Orange County, b7c Galifornia, and was involved in the Brotherhood of Internal Love. It is noted that this letter was address as follows:
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: c/o KENNEDY RHINE, ET AL b6 bic San Francisco, California USA i
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: #46. One letter from ROSEMARY LEARY to the Weatherman fugitives, no date. LEARY advised the letter b6 was written after his escape. LEARY advised the letter bie was written 'C eaeerenes LEARY stated ROSEMARY LEARY thanking the Weathermen for their help in the escape.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: : Subsequentto LEARY's arrival in Switzerland and to the best of hi gledge in September 1971, and his wife » visited with he and ROSEMARY when LEARY was Living in the village of Villars, Switzerland. As best as he could recall thePoe were on vacation and visited LEARY on that trip. LEARY has no_recollection of any specific discussions he had with thel___ ]r...
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: #4. 'Letter "from: ROSEMARY -LEARY -to "TIMOTHY iLEARY, @ated JIuly .1, :I970.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: #25. iLetter "from "ROSEMARY LEARY <to TEIMOTHY LLEARY, dated july /3, E970.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: #47. Two rough draft copies of a letter from ROSEMARY LEARY directed to the Weathermen fugitiv: b6 epecir sally 6 fee fend bre pS Tetanetng them for their help in the escape.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: LEARY advised that his wife, ROSEMARY, had spoken to MICHAEL STANDARD that morning and they discussed his visit with him (LEARY). #7, Western Union telegram from JOSEPH RHINE to TIMOTHY LEARY, dated Jume 1, 1970.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: #12. Letter .from ROSEMARY: LEARY: to7TIMOTHY-LEARY, dated. June .15, .1970.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: LEARY 'advised that his' wife,.ROSEMARY, iindicated:she was to meet MICHAEL :and.ELEANOR - KENNEDY -in:San: Francisco that day.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: DEARY advised that his:wife, "ROSEMARY, indicated she had spent an 'evening 'with'MICHAEL cand "ELEANOR /KENNEDY. ROSEMARY xeported that 'the news was -all :good:and<disclosed they had called MICHAEL STANDARD -that evening.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: WEARY cadvised that His-wife, "ROSEMARY, 'ividicated _ she 'mtends to .call .MICHAEL -STANDARD, "JOSEPH RAINE carid /MICHAEL KENNEDY that evening.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: DEARY cadvissed "that irs wife, ROSEMARY, liridicated She jimtended -vo «call "ELEANOR :KENNEDY creat cday.
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: 4A... 'Letssex "from 7ROSEMARY -LEARY cto "FEMOTHY "LEARY, dated Duly @, 970. WEARY -advissed that His. wife, ROSEMARY, <desctiibed ca brief meeitiimg with 'MICHAEL 'KENNEDY «and JIOSEPHIRHINE. ROSEMARY @iisciosed she -and 'MIKE :RANDALL will saecompany ther
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: SUBJECT: TIMOTHY FRANCIS LEARY, JR., aka ET AL PASSPORT FRAUD ~ CONSPIRACY 00: Chicago
- Suggestion: Review OCR/transcription around this passage.

#### `fbi-timothy-leary-escape-interview-1974` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: FBI Interview of Timothy Leary on His 1970 Prison Escape and the Brotherhood of Eternal Love
- Excerpt: Re Los Angeles airtel to Chicago, dated 8/6/74, : Enclosed for Chicago are various photographs, documents and.personal memoribilia of TIMOTHY FRANCIS LEARY, JR. Also enclosed for Chicago are two copies of an FD-302 setting forth a brief explanation of each of the enclosed items.
- Suggestion: Review OCR/transcription around this passage.

#### `fda-guidance-psychedelic-drugs-clinical-investigations-2026` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Psychedelic Drugs: Considerations for Clinical Investigations (Guidance for Industry)
- Excerpt: [10, 20]

#### `fda-guidance-psychedelic-drugs-clinical-investigations-2026` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Psychedelic Drugs: Considerations for Clinical Investigations (Guidance for Industry)
- Excerpt: _Transcribed for the archive from fda.gov._
- Suggestion: Review OCR/transcription around this passage.

#### `fda-guidance-psychedelic-drugs-clinical-investigations-2026` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Psychedelic Drugs: Considerations for Clinical Investigations (Guidance for Industry)
- Excerpt: The U.S. Food and Drug Administration (FDA or Agency) is issuing this guidance to provide general considerations to sponsors developing psychedelic drugs for the treatment of medical conditions (e.g., psychiatric disorders, substance use disorders). For the purposes of this guidance, the term psychedelic drug is used as shorthand to include classic psychede...
- Suggestion: Review OCR/transcription around this passage.

#### `fischer-cardenas-yage-thesis-1923` / `placeholder_or_review_note`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Estudio sobre el principio activo del Yagé
- Excerpt: ### Introducción Los Indios salvajes de las llanuras del Caquetá y el Putumayo, hacia el Sur de la República, toman, para procurarse un estado de embriaguez particular, la decocción y la maceración de una planta denominada el Yagé, a la cual atribuyen propiedades maravillosas confirmadas por la tradición de distintas tribus. Relaciones de personas serias e...

#### `fischer-cardenas-yage-thesis-1923` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Estudio sobre el principio activo del Yagé
- Excerpt: [10, 20]

#### `fischer-cardenas-yage-thesis-1923` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Estudio sobre el principio activo del Yagé
- Excerpt: _Transcribed for the archive from samorini.it._
- Suggestion: Review OCR/transcription around this passage.

#### `fischer-cardenas-yage-thesis-1923` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Estudio sobre el principio activo del Yagé
- Excerpt: _[El autor agradece aquí a su director de tesis, el doctor Eduardo Lleras Codazzi. Se omiten, por no referirse directamente a la droga, los siguientes capítulos I a III: una exposición general sobre alcaloides y su acción fisiológica (Capítulo I), el relato detallado del procedimiento químico de extracción del alcaloide del yagé (Capítulo II), y los experim...
- Suggestion: Review OCR/transcription around this passage.

#### `francisco-hernandez-ximenez-ololiuhqui-1615` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: De la yerva que llaman Ololiuhqui
- Excerpt: [10, 20]

#### `gonzales-v-o-centro-2006` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: Gonzales v. O Centro Espirita Beneficente Uniao do Vegetal
- Excerpt: 5414 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `gonzales-v-o-centro-2006` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Gonzales v. O Centro Espirita Beneficente Uniao do Vegetal
- Excerpt: [10, 20]

#### `gonzales-v-o-centro-2006` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Gonzales v. O Centro Espirita Beneficente Uniao do Vegetal
- Excerpt: _Image: Apollo (Flickr user brindle95), via Wikimedia Commons, CC BY 2.0._
- Suggestion: Review OCR/transcription around this passage.

#### `gonzales-v-o-centro-2006` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Gonzales v. O Centro Espirita Beneficente Uniao do Vegetal
- Excerpt: Chief Justice Roberts delivered the opinion of the Court. A religious sect with origins in the Amazon Rainforest receives communion by drinking a sacramental tea, brewed from plants unique to the region, that contains a hallucinogen regulated under the Controlled Substances Act by the Federal Government. The Government concedes that this practice is a since...
- Suggestion: Review OCR/transcription around this passage.

#### `griffon-du-bellay-le-gabon-iboga-1865` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Le Gabon (Deuxième partie)
- Excerpt: [10, 20]

#### `griffon-du-bellay-le-gabon-iboga-1865` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Le Gabon (Deuxième partie)
- Excerpt: Sensuel comme les Orientaux, le Gabonais prétend comme eux posséder des remèdes contre les défaillances physiques. L'aphrodisiaque le plus en renom est la racine de l'ibôga (taberna-ventricosa, famille des apocynées). C'est tout au moins un excitant général qui pourrait remplacer le café ; les indigènes s'en servent dans les longues excursions en pirogue, p...
- Suggestion: Review OCR/transcription around this passage.

#### `grinspoon-v-dea-1987` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Grinspoon v. Drug Enforcement Administration
- Excerpt: [10, 20]

#### `grinspoon-v-dea-1987` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Grinspoon v. Drug Enforcement Administration
- Excerpt: _Image: Erick Vélez Sánchez / iNaturalist, via Wikimedia Commons, CC BY 4.0._
- Suggestion: Review OCR/transcription around this passage.

#### `grinspoon-v-dea-1987` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Grinspoon v. Drug Enforcement Administration
- Excerpt: COFFIN, Circuit Judge. On November 13, 1986, the Administrator of the Drug Enforcement Administration ("DEA") issued a final rule placing the substance 3,4-methylenedioxymethamphe-tamine ("MDMA") into Schedule I of the Controlled Substances Act ("CSA"), 21 U.S.C. §§ 811, 812 (1987). 51 Fed.Reg. 36,552 (1986). In reaching this decision, the Administrator fou...
- Suggestion: Review OCR/transcription around this passage.

#### `grinspoon-v-dea-1987` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Grinspoon v. Drug Enforcement Administration
- Excerpt: F. Conclusion. For the reasons listed above, we conclude that the Administrator erroneously applied an interpretation of the "accepted medical use in treatment in the United States" and "accepted safety for use ... under medical supervision" criteria of section 812(b)(1) that directly conflicts with congressional intent. We therefore vacate the Administrato...
- Suggestion: Review OCR/transcription around this passage.

#### `grinspoon-v-dea-1987` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Grinspoon v. Drug Enforcement Administration
- Excerpt: III. Challenges Based on "Arbitrary and Capricious" Standard. Although a remand is necessary due to our above holding, we nonetheless feel compelled to address the other issues raised in Dr. Grinspoon's petition because they are likely to arise again when the Administrator reconsiders the rule. A. "High" Potential For Abuse. In addition to the "accepted med...
- Suggestion: Review OCR/transcription around this passage.

#### `grinspoon-v-dea-1987` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Grinspoon v. Drug Enforcement Administration
- Excerpt: B. Impact Of Scheduling On Research. Dr. Grinspoon also takes issue with the Administrator's alleged failure to consider evidence tending to show that placement of MDMA in Schedule I would strongly discourage medical research on the drug. Grinspoon contends that failure to consider the impact of a scheduling decision on legitimate research amounts to arbitr...
- Suggestion: Review OCR/transcription around this passage.

#### `harvard-crimson-psilocybin-1963` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Psilocybin, Senate Race Highlight Harvard Year
- Excerpt: [10, 20]

#### `harvard-crimson-psilocybin-1963` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Psilocybin, Senate Race Highlight Harvard Year
- Excerpt: The opening of the academic year saw a new Dean of the Faculty in University Hall. Franklin L. Ford, professor of History, had been appointed by President Pusey in June to replace McGeorge Bundy.
- Suggestion: Review OCR/transcription around this passage.

#### `harvard-crimson-psilocybin-1963` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Psilocybin, Senate Race Highlight Harvard Year
- Excerpt: _Transcribed for the archive from thecrimson.com. One reading is doubtful in the scan and is marked in the text._
- Suggestion: Review OCR/transcription around this passage.

#### `homeric-hymn-to-demeter-evelyn-white-1914` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: The Homeric Hymn to Demeter
- Excerpt: 5153 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `homeric-hymn-to-demeter-evelyn-white-1914` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Homeric Hymn to Demeter
- Excerpt: [10, 20]

#### `homeric-hymn-to-demeter-evelyn-white-1914` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: The Homeric Hymn to Demeter
- Excerpt: _Image: Marie-Lan Nguyen (User:Jastrow) / Wikimedia Commons. Original fragments in the National Archaeological Museum, Athens; cast at the Metropolitan Museum of Art (14.130.9)., CC BY 2.5._
- Suggestion: Review OCR/transcription around this passage.

#### `homeric-hymn-to-demeter-evelyn-white-1914` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Homeric Hymn to Demeter
- Excerpt: (ll. 33-39) And so long as she, the goddess, yet beheld earth and starry heaven and the strong-flowing sea where fishes shoal, and the rays of the sun, and still hoped to see her dear mother and the tribes of the eternal gods, so long hope calmed her great heart for all her trouble.... ((LACUNA))....and the heights of the mountains and the depths of the sea...
- Suggestion: Review OCR/transcription around this passage.

#### `human-drug-testing-by-the-cia-1977-hearing` / `not_published`

- Import: `data/draft-import`
- Field: `status`
- Title: Human Drug Testing by the CIA, 1977
- Excerpt: draft

#### `human-drug-testing-by-the-cia-1977-hearing` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Human Drug Testing by the CIA, 1977
- Excerpt: [10, 20]

#### `human-drug-testing-by-the-cia-1977-hearing` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Human Drug Testing by the CIA, 1977
- Excerpt: Senator Kennedy. Well, the description of you then is completely inaccurate as being-
- Suggestion: Review OCR/transcription around this passage.

#### `human-drug-testing-by-the-cia-1977-hearing` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Human Drug Testing by the CIA, 1977
- Excerpt: Mr. Siragusa. We set up this apartment on 13th Street off of Sixth Avenue, and the understanding was that we were to use this apartment for our own purposes. That is, my office in New York City would use the apartment to interview informants, to debrief informants, to work undercover operations.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: 4303 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `isbell-studies-lsd25-tolerance-1956` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: [10, 20]

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: The striking mental changes induced by the diethylamide of lysergic acid (hereafter referred to as LSD) have been studied ex- tensively in Europe,* Great Britain,+ and the United States.t In minute doses (20y to 120y) LSD induces a peculiar mental state characterized by anxiety, signs of au- tonomic dysfunction, perceptual distortion (chietly visual), alter...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Various interpretations have been placed on the mental state produced by LSD. Some European authors refer to it as a "toxic psychosis of the exogenous reaction type" or a "diencephalosis,'§ presumably because the autonomic signs suggest effects on the hypothalamus. The resemblance of some of the psychic manifestations which follow LSD to symptoms of the maj...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: action has been referred to as schizophrenia" or "experimental psychia- try." Because some of the symptoms in-
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: duced by LSD also occur in schizophrenia, it has been suggested that schizophrenia may be due to a toxin,?! to a deficiency of some metabolite necessary for brain function, or to some metabolic tissue disturbance.+ A defect in the degradation of epinephrine involving either adrenochrome** or ad- renoxine *® has been postulated. Another hypothesis, based on...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: All of these theories are based on re- semblances between the LSD reaction and the major psychoses. The effects of LSD last only a few hours, and practically all experiments with the drug have been "acute"; i. e., single doses of LSD were given at intervals of days or weeks. The
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: chronic experiments that have been done involved administration of the drug to psy- chotic patients in whom the LSD response was difficult to assess. It, therefore, seemed desirable to determine whether resemblance of the LSD reaction to the major psychoses, which are chronic diseases, would become more or less prominent when the drug was administered chron...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: The patients who volunteered for the experi- ments were male drug addicts who had been absti- nent from opiates for three months or more when the studies were carried out. None of these patients was psychotic; all had either character disorders or inadequate personalities, and the majority were Negroes. Because of the great differences in economic and ethni...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Methods.—The experiments were conducted in a closed ward devoted to research. The subjects were observed in individual rooms but were free to leave between observations and to mingle with other patients in a common dayroom. The drug was always given orally, and the subjects were fasting. Doses of LSD varied from 20y to 300y (total dose), or approximately 0....
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: approximately two, four, and six hours after ad- ministration of the drug. Pupillary diameter was determined once hourly, as follows: The patient
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Doses of 3y/kg. or more induced a reac- tion which was too severe to be tolerated
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: on more than one occasion by most patients. A dosage range of ly to 2y per kilogram was adopted for most work, and the de- scriptions below are based on doses of this order.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: The only consistent neurological changes were dilatation of the pupils and accentua- tion of the deep tendon reflexes. Occasion- ally, twitching of the muscles and tremors involving muscle clonus occurred in patients Waves of goose flesh were noted in some patients.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: depression, difficulty in concentration, feel- ings of strangeness, anxiety, nervousness, and dream-like states were reported. Motor activity varied. Some patients were con- stantly active; others became very quiet and withdrawn.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Symptoms which might be classed as "depersonalization" included the changes in the appearance of the extremities described above, "feelings" of being outside one's own body, and difficulty in recognizing oneself in a mirror. Patients also mentioned diffi- culties in deciding whether a thought re- ferred to a real event or object or was merely a thought. Suc...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Marked quantitative variations in the de- gree of reaction of different subjects to the drug were noted. A dose of 2y/kg. might induce only nervousness in one subject, while another subject might experience per- ceptual distortion and true hallucinations with loss of insight on the same dose. The same subject, however, responded each time to the same degree...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Psychological Tests: In a preliminary ex- ploratory experiment, six Negro males were given a_ battery of psychological tests ( Wechsler-Bellevue Intelligence Scale, Gold- stein-Scheerer Cube and Color-Form Sort- ing Test, the test, and the Minnesota Multiphasic Personality Inven- tory [MMPI]) while receiving no drug and again at the height of the LSD reacti...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: on all performance tests, except the digit symbol, increased slightly, but the increases were less than those expected from the prac- tice effects. When corrected for the ex- pected practice effects, all subtest scores
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: the intelligence quotients after LSD were corrected for the expected practice effect, the verbal I. Q. decreased 8.63 points, the performance I. Q. 6.07 points, and the full- scale I. Q. 7.43 points. Although the num- ber of subjects is small, these decreases probably represent a substantial impairment of intellectual function.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: No loss of conceptual or abstract ability was found on repetition of the Goldstein- Scheerer Cube and Color-lForm tests during LSD intoxication. ap- parent that patients exerted a great deal of effort in order to complete the tasks. Much of the effort took the form of acquiring a "set," i. e., making bodily adjustments in-
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: dicating an attitude of attention. Possibly, this effort was related to difficulty in con- centrating.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: When responses on the Rorschach test before and after LSD administration were compared, some variation in several of the scoring categories was observed in each pa- tient. However, the basic pattern of the test responses remained the same. When the Rorschach tests of all six patients were an- alyzed as a group, changes were noted in several factors under LS...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Such striking changes were observed in the MMPI profiles after LSD in the orig- inal six subjects that it appeared the MMPI might be more sensitive than other psy- chological measuring the LSD response. A separate study, which is being
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: reported in detail elsewhere,{ was therefore undertaken. Briefly, 24 subjects were tested in random balanced order under no drug, placebo, and LSD (50y-130y) conditions. The MMPI was given one and one-half hours after administration of placebo or LSD. Statistically significant elevations were found in the Psychasthenia (P<0.01), Schiz- ophrenia (P<0.01), Pa...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: On the basis of the preliminary work described above, methods for measuring both the "mental" and the "nonmental" aspects of the reaction were developed. Pupillary diameter, systolic blood pres- sure, and change in patellar reflexes were chosen as objective and measurable signs of the LSD reaction. Systolic blood pressure was measured after 10 minutes' rest...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Response elicitable only with rein-
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Grade 2: Response elicitable without reinforce-
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Grade 3: Response elicitable with light tap; ex- cursion greater than 6-in. arc
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Grade 4: Response very quick, forceful, and repetitive; almost complete extension of leg These measurements were made at hourly inter-
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: summarizing the data for each particular measure- ment in one figure. The average of the pre-drug measurements was used as the base line in each case.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Mental effects induced by LSD were assessed in two ways: 1, The questionnaire devised by Abramson and associates" was administered hourly for two hours before and for eight hours after LSD. The number of positive responses on the questionnaire was counted over the entire eight- hour period after administration of LSD, but answers to questions which were als...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: t Belleville, R. E.: MMPI Score Changes In- duced by Lysergic Reid Dithylamide (LSD-25), to be published.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: confused," This ques-
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: as "I am trembling inside," "I am "Things seem near or far away," etc. tionnaire has several disadvantages—it may sug- gest symptoms; few positive responses are given to many of the questions, and it does not cover all the mental phenomena observed after LSD. The questionnaire, however, has the advantage that a systematic record of certain symptoms is obtai...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: 2. The degree of mental effect was also assessed by conducting a short psychiatric examination be- tween the second and fourth hour after admin- istration of the drug. In carrying out this exami- special attention was given to anxiety, nervousness, perceptual distortion, presence or absence of hallucinations, and _ insight, "grade" was assigned to the react...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Grade 1: Anxiety and nervousness, without per- ceptual distortion or hallucinations
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Grade 2: Anxiety, nervousness, and visual per- ceptual distortion without "true" hallucinations
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Grade 3: Anxiety, nervousness, perceptual distor- tion, and "true" hallucinations, but with insight maintained
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: reproducibility of the reaction in the same sub- jects.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Response to Varying Doses.—Eight non- tolerant Negro males were used in this ex- periment. They were given, under "blind" conditions and in randomized order at weekly intervals, a placebo and 0.25y, 0.5y, 0.75y, ly, 1.5y, and 2y per kilogram of body weight of LSD. Two of the patients, who were very sensitive to LSD, did not receive the 2y dose, and one did...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Although the number of patients used was small, the results showed that the degree of effect was related to the dose and _ that methods were useful in assessing the in- tensity of the LSD response.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: in four patients and of 22 days of chronic intoxi- cation in one patient, LSD was discontinued without the patients' knowledge, water being given in its place. Five patients were tested with a single dose of 120y to 130y two to six days after discontinua- tion of LSD.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: are protrayed On the left, in individual blocks, are shown the mean re- sponses of the six patients to the three doses of LSD and to placebo prior to chronic intoxication. The results on patellar reflex, pupillary size, and systolic blood pressure are expressed in terms of the area under the time action curves (see 'Methods
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: of Measurement"). Degree of mental ef- fect and number of positive answers were assessed as described above. The mean re- sponses to LSD during chronic administra- tion are shown on the right, in the large block. In reading the Figure, it is necessary to remember that one patient withdrew after the ninth day and that the measure- ments obtained during only...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: The development of tolerance can best be illustrated by comparing the reaction of one patient to a dose of 180y before and during chronic intoxication. When this dose was given prior to chronic intoxication, the pa- tient became extremely anxious and felt that he was being shocked with electricity. His body seemed to shrink and enlarge. His hands appeared t...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: pressure was knee jerks were very hyperactive; spon- taneous tremors of large muscle groups were observed, and ankle clonus could be elicited. After recovery from this severe reaction, the patient wished to drop out of the ex- periment but, after considerable persuasion, agreed to continue. He was started on 50y of LSD once daily, and this dose was in-
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: life history, personality patterns, and the environment in which testing with LSD was carried out. This fact indicates that the LSD reaction is, to some extent, independ- ent of these variables. The LSD reaction appears to be a specific toxic psychosis which is mimicked only by intoxication with mescaline. It differs in its clinical features from the toxic...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Under the conditions of these experi- ments, the LSD reaction, when viewed in toto, had only a superficial resemblance to the chronic forms of any of the major psychoses. Symptoms suggesting schizo- phrenia which occurred in various patients included depersonalization, derealization, confusion, withdrawal from other persons, and changes in response to psych...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: If it had been possible to maintain the original degree of effect throughout the experiment, the resemblance of the LSD psychosis to schizophrenia might have be- come more pronounced. It is conceivable that schizophrenia is associated with some chronic perceptual disorder and that a per- son who is having peculiar sensory experi- ences may develop peculiar...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: In former opiate addicts, the diethylamide of lysergic acid (LSD-25) induced anxiety, mood changes, feelings of unreality, visual perceptual distortion, optical hallucinations, depersonalization, and derealization. Con- comitantly, resting blood pressure was ele- vated, pupils were dilated, and the tendon reflexes accentuated. Characteristics of the LSD rea...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: same in former opiate addicts and in non- addicts.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: The degree of both the "mental" and the "nonmental" changes increased with the dose of LSD. The intensity of the reaction induced by LSD remained the same when the same dose was repeated after an in- terval of a week or more.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: When LSD was given daily, tolerance was evident after administration for only three days. After tolerance was well de- veloped, administration of as much as four times the standard dose of LSD did not re- store the original intensity of the reaction. On discontinuation of LSD, tolerance was lost as rapidly as it was developed.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Results —Response to Various Doses: Reactions to zero dosage (placebo) were generally negligible. Doses of LSD of less than ly/kg. of body weight induced only mild effects. Autonomic changes were slight. Mental effects consisted chiefly of anxiety and mood changes, primarily in the "euphoric" Perceptual distortion was rare, and no hallucinations were re- po...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: Various alterations in all sensory modali- ties were described: acute or dull hearing, "sandpaper" feel of clothes, metallic tastes, bad odors, sensations of the body being light or heavy, and a great variety of visual changes. Actually, alteration in vision was the only sensory change reported by all pa- tients. The subjective visual phenomena included blu...
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: t Expressed as mean area under curve (square inches). § See text for method.
- Suggestion: Review OCR/transcription around this passage.

#### `isbell-studies-lsd25-tolerance-1956` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Studies on Lysergic Acid Diethylamide (LSD-25): I. Effects in Former Morphine Addicts and Development of Tolerance During Chronic Intoxication
- Excerpt: EXPERIMENT 3.—Six Negro males served as subjects for this experiment. Five of these had been diagnosed as having character disorders and one as having an inadequate personality. No evidence of psychosis was found on _ psychiatric examination of any of these patients. Intelligence quotients ranged from 84 to 125. Prior to chronic intoxication, patients were...
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: [10, 20]

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: 10. He then prayed directly to God, saying »King of-
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: saints, that is, on the intercession principle. »San-
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: 13. More prayers, much as above, but comparatively short. 2nd throw- »Still confused, but a little clearer».
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: 3rd throw-»Possible hope».
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: 4th throw-»Death. I can see the funeral. The spirits are not with me, but hope is not entirely lacking».
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: 5th throw- »If you believe and have faith, there is hope ».
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: 6th throw-»She is already much better, but you must have faith in me».
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: 7th throw- »She is now well, and you can send a telegram to prove it!»
- Suggestion: Review OCR/transcription around this passage.

#### `jean-bassett-johnson-elements-mazatec-witchcraft-1939` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: The Elements of Mazatec Witchcraft
- Excerpt: _Image: Alan Rockefeller, via iNaturalist and Wikimedia Commons, CC BY 4.0._
- Suggestion: Review OCR/transcription around this passage.

#### `karsten-natema-jibaro-1923` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Blood Revenge, War, and Victory Feasts among the Jibaro Indians of Eastern Ecuador
- Excerpt: [10, 20]

#### `karsten-natema-jibaro-1923` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Blood Revenge, War, and Victory Feasts among the Jibaro Indians of Eastern Ecuador
- Excerpt: At about 8 o'clock the principal ceremony of the second day, the drinking of the sacred drink natéma, takes place. This important narcotic is prepared from a vine specially cultivated by the Jibaros, the scientific name of which is Banisteria caapi (of the Malpighiaceae family). When the drink is prepared for the feast the slayer himself has to assist in or...
- Suggestion: Review OCR/transcription around this passage.

#### `karsten-natema-jibaro-1923` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Blood Revenge, War, and Victory Feasts among the Jibaro Indians of Eastern Ecuador
- Excerpt: In the drinking of the natéma at the tsantsa feast both men and women, even half-grown children, take part, all "who want to dream" being allowed to drink of the narcotic. Even the slayer, as well as his wife and daughter, drink natéma. The drinking has throughout a ceremonial character. A number of beautifully ornamented clay dishes are placed on the groun...
- Suggestion: Review OCR/transcription around this passage.

#### `kennan-tent-life-siberia-fly-agaric` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Tent Life in Siberia
- Excerpt: [10, 20]

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `not_published`

- Import: `data/draft-import`
- Field: `status`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: draft

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: [10, 20]

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: (IJ) LSD25 has been well known to pharmacologists for more than 2u years
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: (U) Larger doses (1 to 2pg/kg, orally) cause more profound effects,
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: were assigned a variety of team missions to be carried out after the ingestion of 150 pg/man of LSD25, These tasks included reporting of meteorological information, fire direction control, artillery control surveying, and antiaircraft tracking. In these cases, the dose given resulted in loss of effectiveness suffi¬ cient to constitute failure in the mission...
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: clinical studies of the effectiveness of LSD25, the author concluded that inca¬ pacitation by the oral route could be achieved with doses as low as ) pg/kg.
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: (C) In 1963, a variety of preliminary studies on LSD25 (including the
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: _[Sections on the pharmacology and prior animal and human studies of LSD25, and the rationale for testing the aerosol route specifically, are omitted.]_
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: The safety factor for an incapacitating agent has been defined as the ratio between the LD1 and the ED50. Since no direct information is available concerning the lethality of the compound in man, it is difficult to assume a value for the LD50 and, of course, the LDl is unknown.
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: None of the comparisons made in this study reveal any distinct differences between the two forms of LSD25 as far as potency is concerned.
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: The ED50 for EA 1729 by the inhalation route is 5.8 (2. 5 to 13. 5) (ig/kg retained dose. The ECT50 is 55 (34 to 90) mg min/cu m, calculated at a minute volume of 10 liters. The ED50 and ECT50 for the maleate salt would be 1 / 3 greater on a formula weight basis, i. e. , 7. 7 (ig/kg and 73 mg min/cu m, respectively.
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: The safety factor in man cannot be stated with certainty. If man resembles most other animals in his toxicological response, the ratio of lethal to effective do3e would be very high; however, there is no direct infor¬ mation about lethality in man.
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: Psychopharmacology Branch of the Clinical P.esearch Division into the aerosol effectiveness of EA 1729 and EA 3528, the free base and maleate forms, respec¬ tively, of d-lysergic acid diethylamide (LSD25).
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: Arrangements were made for the members of the group to be assigned to the same set of squad rooms, and a senior Master Sergeant with extensive neuropsychiatric training and experience was assigned a room in the same r.rea. Each individual was also assigned a specific partner from among his roommates with whom he would always be scheduled on any test he was...
- Suggestion: Review OCR/transcription around this passage.

#### `ketchum-human-assessment-ea1729-inhalation-1964` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Human Assessment of EA 1729 and EA 3528 by the Inhalation Route
- Excerpt: dose related whereas the secondary phenomena are not.* The primary effects included an essential difficulty in directing the train of thought (i.e. , in concentrating) and a distortion of visual perception (e.g. , shifting, rolling or undulating appearance to the walls of the room). Bodily sensations of tension, tingling, trembling, and hypersensitivity, as...
- Suggestion: Review OCR/transcription around this passage.

#### `kleps-boo-hoo-bible-guide-session-1971` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: How to Guide a Session (from The Boo Hoo Bible)
- Excerpt: [10, 20]

#### `kleps-boo-hoo-bible-guide-session-1971` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: How to Guide a Session (from The Boo Hoo Bible)
- Excerpt: If mechanical techniques are not used, however, it is essential that the guide be of very superior intelligence, very well read and experienced in the ways of the world. The gods themselves are helpless before stupidity. I would personally draw the line between the sheep and the goats somewhere in the vicinity of the 95th percentile in verbal intelligence a...
- Suggestion: Review OCR/transcription around this passage.

#### `kleps-boo-hoo-bible-guide-session-1971` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: How to Guide a Session (from The Boo Hoo Bible)
- Excerpt: There are a variety of requirements to assure the success of a guided session, but chief among them is the conspicuous presence in the session room of a copy of Popular Mechanics (in the case of women, a magazine such as Cosmopolitan should be substituted). All statues of people with three or more arms should be removed, as well as all dogs, goats, blackbir...
- Suggestion: Review OCR/transcription around this passage.

#### `kleps-boo-hoo-bible-guide-session-1971` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: How to Guide a Session (from The Boo Hoo Bible)
- Excerpt: People setting out to guide other people through the labyrinthine ways of the personal unconscious really ought to have some kind of experience with non-psychedelic methods, or at least be reasonably well read in the field, for Christ's sake, before taking on this kind of work. There are too many nitwits floating around, copies of Kahlil Gibran and Meyer Ba...
- Suggestion: Review OCR/transcription around this passage.

#### `knauer-maloney-psychic-action-mescalin-1913` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: A Preliminary Note on the Psychic Action of Mescalin, with Special Reference to the Mechanism of Visual Hallucinations
- Excerpt: [10, 20]

#### `knauer-maloney-psychic-action-mescalin-1913` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: A Preliminary Note on the Psychic Action of Mescalin, with Special Reference to the Mechanism of Visual Hallucinations
- Excerpt: By Alwyn Knauer, M.D., formerly Assistant of Professor Kraepelin, Professor of Experimental Medicine, Fordham University, New York, and William J. M. A. Maloney, M.D., ChB., F.R.S.Edin., formerly Crichton Research Fellow in Clinical Neurology and Psychiatry; Adjunct Professor of Neurology, New York Post Graduate Medical School; Attending Neurologist, Neurol...
- Suggestion: Review OCR/transcription around this passage.

#### `krasheninnikov-kamtschatka-fly-agaric` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The History of Kamtschatka, and the Kurilski Islands, with the Countries Adjacent
- Excerpt: [10, 20]

#### `leary-metzner-alpert-psychedelic-experience-1964` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Psychedelic Experience: A Manual Based on the Tibetan Book of the Dead
- Excerpt: [10, 20]

#### `leary-metzner-alpert-psychedelic-experience-1964` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Psychedelic Experience: A Manual Based on the Tibetan Book of the Dead
- Excerpt: Reading books about mystical experience is a standard orientation procedure. Reading the accounts of others' experiences is another possibility (Aldous Huxley, Alan Watts, and Gordon Wasson have written powerful accounts).
- Suggestion: Review OCR/transcription around this passage.

#### `lewin-banisterine-1928` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Sur une substance enivrante, la banistérine, extraite de Banisteria Caapi
- Excerpt: [10, 20]

#### `lewin-banisterine-1928` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Sur une substance enivrante, la banistérine, extraite de Banisteria Caapi
- Excerpt: _Transcribed for the archive from samorini.it. Full text of the note (Comptes Rendus 186, pp. 469-471), as reproduced in a clean PDF transcription hosted by the Samorini Network drug-history archive. One reading is doubtful in the scan and is marked in the text._
- Suggestion: Review OCR/transcription around this passage.

#### `mdma-scheduling-young-opinion-1986` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: [10, 20]

#### `mdma-scheduling-young-opinion-1986` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: I.) Alternatively the judge recommended, based upon court decisions inter-
- Suggestion: Review OCR/transcription around this passage.

#### `mdma-scheduling-young-opinion-1986` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: At the commencement of this proceeding in July 1984 MDMA was not listed in any schedule. At that time DEA published in the Federal Register4 a notice of proposed rulemaking to place the substance in Schedule I. A number of persons filed comments and objections and requested a hearing. This administrative law judge was requested by the then-Deputy Administra...
- Suggestion: Review OCR/transcription around this passage.

#### `mdma-scheduling-young-opinion-1986` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: _[Similar testimony from three more members of Dr. Greer's peer-review committee (Drs. MacHendrie, Wolfson, and Downing) and from psychiatrist Robert Lynch, all to the same effect, is omitted.]_
- Suggestion: Review OCR/transcription around this passage.

#### `mdma-scheduling-young-opinion-1986` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: _Transcribed for the archive from maps.org. 2 readings are doubtful in the scan and are marked in the text._
- Suggestion: Review OCR/transcription around this passage.

#### `mdma-scheduling-young-opinion-1986` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: 1 p.L. 91-513, 84 Stat. 1242, 21 U.S.C. §§ 801, et seq. 2 21 U.S.C. § 811(a).
- Suggestion: Review OCR/transcription around this passage.

#### `mdma-scheduling-young-opinion-1986` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: Dr. Rick J. Strassman is Assistant Professor of Psychiatry, University of New Mexico School of Medicine, in Albuquerque. He is medical director and principal investigator of a program in which marihuana or THC is being used to combat cancer chemotherapy-induced nausea and vomiting. This project is funded by the State of New Mexico with approval of FDA and t...
- Suggestion: Review OCR/transcription around this passage.

#### `mdma-scheduling-young-opinion-1986` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: As a member of [Dr. Greer's] peer review board in New Mexico, I have reviewed his inclusionary and exclusionary criteria for entrance into the protocol, informed consent forms, protocol for administration of MDMA... ., the setting in which sessions occur, his results of follow-up, etc. In my opinion, he has included appropriate safeguards and has not experi...
- Suggestion: Review OCR/transcription around this passage.

#### `mdma-scheduling-young-opinion-1986` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Opinion and Recommended Ruling, Findings of Fact, Conclusions of Law, and Decision of Administrative Law Judge (MDMA Scheduling)
- Excerpt: 21 U.S.C. § 811(b). That was done. After HHS responded to the request, DEA initiated this proceeding. The statutory scheme clearly contemplates that at that point opportunity will be provided, in open hearings pursuant to the Administrative Procedure Act, for the presentation of further "data" or evidence on all issues. The Administrator is then to make the...
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: [10, 20]

#### `merck-patent-de274350-mdma-1912` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: Verfahren zur Darstellung von Alkyloxyaryl-, Dialkyloxyaryl- und Alkylendioxyarylaminopropanen bzw. deren am Stickstoff monoalkylierten Derivaten.
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: Die entstandenen Halogenwasserstoffadditionsprodukte sind schwere, schwach gefärbte Öle. Sie sind verhältnismäßig unbeständig und lassen sich, selbst im Vakuum, nicht unzersetzt destillieren. Trotzdem lassen sie sich wider Erwarten glatt mit Ammoniak und primären aliphatischen Aminen umsetzen, wobei die entsprechenden Alkyloxy-, Dialkyloxy- oder Alkylendiox...
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: Diese Reaktion war um so weniger zu erwarten, als die Gefahr vorlag, daß durch Abspaltung von Halogenwasserstoffsäure ausschließlich die die ungesättigte Seitenkette enthaltenden Ausgangsstoffe zurückgebildet werden würden. Tatsächlich verläuft die Reaktion auch teilweise in der letzten Richtung; das ist aber für das Endergebnis ohne Belang, da die zurückge...
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: Das Reaktionsprodukt wird mit der vier- bis fünffachen Menge starken wässerigen Ammoniaks mehrere Stunden auf 120° erhitzt und die entstandene Base auf bekannte Weise gewonnen.
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: Der so erhaltene rohe Bromkörper wird mit der vier- bis fünffachen Menge gesättigten alkoholischen Ammoniaks 2 Stunden auf 100° erhitzt. Ammoniak und Alkohol werden im Vakuum entfernt und aus dem Rückstand die Base durch Zugabe von überschüssiger Lauge gewonnen.
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: _Transcribed for the archive from upload.wikimedia.org. Complete specification (3 pages: description, five worked examples, and the patent claim), OCRed page by page from the scanned facsimile on Wikimedia Commons. 2 readings are doubtful in the scan and are marked in the text._
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: In der Literatur ist die Anlagerung zweier Atome Brom an Arylpropylene der allgemeinen Formeln R·CH₂·CH:CH₂ und R·CH:CH·CH₃, in welchen R einen ätherifizierten Arylrest bedeutet, schon des öfteren beschrieben, dagegen ist die Anlagerung von Bromwasserstoffsäure an diese Doppelbindungen noch niemals durchgeführt worden. Es wurde nunmehr die unerwartete Beoba...
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: Die Anlagerung des Halogenwasserstoffs erfolgt dabei so, daß das Halogen an das dem Benzolkern näher stehende Kohlenstoffatom tritt. Die Derivate des Allylbenzols, z. B. Methyleugenol, Safrol, Apiol, liefern dabei also in β-Stellung substituierte (arylierte) Isopropylhalogenide: (Ar)·CH₂·CH:CH₂ + HBr = (Ar)·CH₂·CH(Br)·CH₃.
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: Die Abkömmlinge des Propenylbenzols, z. B. Anethol, Isosafrol, addieren Halogenwasserstoff unter Bildung von α-substituierten (arylierten) n-Propylhalogeniden: CH₃O·C₆H₄·CH:CH·CH₃ + HBr = CH₃O·C₆H₄·CH(Br)·CH₂·CH₃.
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: 4. 50 g des nach der in Beispiel 3 beschriebenen Methode gewonnenen rohen Bromdihydrosafrols werden mit der fünffachen Menge starker alkoholischer Methylaminlösung 2 Stunden auf 130° erhitzt. Nach dem Entfernen der Hauptmenge des Methylamins wird der Rückstand auf bekannte Weise aufgearbeitet. Die neue sekundäre Base von der Formel CH₂O₂:C₆H₃·CH₂·CH(CH₃):NH...
- Suggestion: Review OCR/transcription around this passage.

#### `merck-patent-de274350-mdma-1912` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: German Reich Patent No. 274350: Process for the Preparation of Alkyloxyaryl-, Dialkyloxyaryl- and Alkylenedioxyarylaminopropanes (Firm E. Merck, Darmstadt)
- Excerpt: Verfahren zur Darstellung von Alkyloxyaryl-, Dialkyloxyaryl- und Alkylendioxyarylaminopropanen bzw. deren am Stickstoff monoalkylierten Derivaten, darin bestehend, daß man die entsprechenden ungesättigten Propylenverbindungen der allgemeinen Formeln R·CH₂·CH:CH₂ und R·CH:CH·CH₃ (R = Alkoxyaryl, Dialkoxyaryl oder Alkylendioxyaryl) mit Halogenwasserstoffsäure...
- Suggestion: Review OCR/transcription around this passage.

#### `mooney-mescal-plant-and-ceremony-1896` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Mescal Plant and Ceremony
- Excerpt: [10, 20]

#### `motolinia-teonanacatl-historia-indios-1541` / `placeholder_or_review_note`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: On Teonanácatl, the "Flesh of God"
- Excerpt: Tenían otra manera de embriaguez que los hacía más crueles: era con unos hongos o setas pequeñas, que en esta tierra los hay como en Castilla; mas los de esta tierra son de tal calidad, que comidos crudos, y por ser amargos, beben tras ellos, o comen con ellos, un poco de miel de abejas; y de allí a poco rato veían mil visiones, en especial culebras, y como...

#### `motolinia-teonanacatl-historia-indios-1541` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: On Teonanácatl, the "Flesh of God"
- Excerpt: [10, 20]

#### `native-american-church-articles-incorporation-1918` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Articles of Incorporation of the Native American Church
- Excerpt: [10, 20]

#### `native-american-church-articles-incorporation-1918` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Articles of Incorporation of the Native American Church
- Excerpt: The principal churches shall be governed by trustees, the same to be called "The General Council of the Church" to consist of two members to be elected by the local Church established in each Indian tribe in the State of Oklahoma that may desire to become affiliated with this church and for the time being, shall consist of Mack Haag, and Sidney White Crane...
- Suggestion: Review OCR/transcription around this passage.

#### `native-american-church-articles-incorporation-1918` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Articles of Incorporation of the Native American Church
- Excerpt: _Transcribed for the archive from jameswfemooney.com. One reading is doubtful in the scan and is marked in the text._
- Suggestion: Review OCR/transcription around this passage.

#### `native-american-church-v-navajo-tribal-council-1959` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Native American Church of North America v. Navajo Tribal Council
- Excerpt: [10, 20]

#### `native-american-church-v-navajo-tribal-council-1959` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Native American Church of North America v. Navajo Tribal Council
- Excerpt: HUXMAN, Circuit Judge. This action was filed in the United States District Court for the District of New Mexico by the Native American Church of North America, a corporation, William Peter Tsosie, Shorty Duncan, and Frank Hanna, Jr., a minor, by and through Frank Hanna, Sr., his next friend, against the Navajo Tribal Council, Paul Jones, individually and as...
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: [10, 20]

#### `nida-monograph-146-hallucinogens-update-1994` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: with whole animals as well as electrophysiological and neurochemical studies' exploring receptors, second messenger systems, and structure- function relationships of the 5-hydroxytryptamine, (5-HT 2 ) receptor at the molecular level. It might be noted, as an aside, that progress in serotonin research has been moving at a rapid pace. Since this technical rev...
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: The IRB is responsible for the protection of human subjects involved in any clinical research. Although the IRB is concerned primarily with risk- to-benefit ratios, it also may offer suggestions regarding the scientific quality of the proposed study. This latter function usually is subsumed by the Scientific Advisory Committee of the General Clinical Resear...
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: The issues of confidentiality and anonymity also were of concern, since admitting to the use of Schedule I drugs is a crime, and a relatively high- functioning group was expected to volunteer for the study based on the socioeconomic status of the initial interviewees. Meetings with the university hospital counsel, directors of medical records and hospital a...
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: Despite a general trend of declining substance abuse by high school seniors and college students in the United States from 1985 to 1991, the most recent (1992) National Institute on Drug Abuse (NIDA) National High School Senior Survey (currently known as Monitoring the Future) has found that annual prevalence of lysergic acid diethylamide (LSD) use has rise...
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: The meeting covered qualitative and quantitative studies in both animals and humans on a wide range of classical hallucinogens, including investigational new drug (IND) clinical studies on N,N-dimethyl- tryptamine (DMT). Presentations addressed behavioral, drug discrimination (DD), and operant conditioning experiments performed
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: Applications of autoradiography, position emission tomography (PET) scanning, and other imaging techniques for identifying anatomic loci of action also were presented at the review. Other topics addressed structure-activity relationships (SAR) of ergolines, use of molecular graphic models of 5-HT 2 receptors for elucidating the action of hallucinogens (i.e....
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: _[The volume's fourteen other chapters, on receptor pharmacology, structure-activity relationships, and animal models of hallucinogen action, are omitted, as is the remainder of Strassman's own chapter (its Introduction, Epidemiology, Clinical Issues, Scientific Issues, and Summary sections).]_
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: The first step in the application process for use of DMT was to submit a protocol to the Human Research Review Committee of the University of New Mexico School of Medicine's Institutional Review Board (IRB).
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: The IRB places great emphasis on the nature of the informed consent document and, at first, was inclined to have this document state that DMT "had no known medical use," one of the criteria for placement into Schedule I. However, the suggestion was made that, if FDA approval were subsequently obtained, this would not be the case, as DMT would have been appr...
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: Interviews had previously been conducted with 19 experienced DMT free-base smokers in order to draft a new rating scale for this study (see below). Thus, a relatively balanced account of the subjective effects of DMT could be provided without going into too much detail. The subjects interviewed spoke most frequently of positively charged effects, so these p...
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: The application process to the DEA was complicated by requests for DMT for two separate reasons, possibly from two different sources, and of two different grades. DMT was required for the development of a laboratory assay for DMT in human blood and could be purchased from one of several chemical supply houses. However, laboratory grade DMT could not be used...
- Suggestion: Review OCR/transcription around this passage.

#### `nida-monograph-146-hallucinogens-update-1994` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Hallucinogens: An Update (NIDA Research Monograph 146)
- Excerpt: The next major effort involved finding a source of DMT approved by the FDA. The FDA required a pedigree of the DMT if it were to be administered parenterally, the only way DMT alone is active. The pedigree is a description of all precursors, intermediates, and impurities in these compounds, en route to the final synthesis of the DMT. A detailed chemical ana...
- Suggestion: Review OCR/transcription around this passage.

#### `nimh-adverse-reactions-hallucinogenic-drugs-1969` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Adverse Reactions to Hallucinogenic Drugs: Proceedings of a Conference Held at the National Institute of Mental Health
- Excerpt: [10, 20]

#### `nimh-adverse-reactions-hallucinogenic-drugs-1969` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Adverse Reactions to Hallucinogenic Drugs: Proceedings of a Conference Held at the National Institute of Mental Health
- Excerpt: gram that could include phenothiazines and/or the use of sedative drugs and psychological support. Several clinicians present noted that "bad" trips are seen almost exclusively among persons in the 15 to 25-year age group. One postulated that this relationship might represent the potentiation, by LSD, of adolescent adju3tment problems into severe acute cris...
- Suggestion: Review OCR/transcription around this passage.

#### `nimh-adverse-reactions-hallucinogenic-drugs-1969` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Adverse Reactions to Hallucinogenic Drugs: Proceedings of a Conference Held at the National Institute of Mental Health
- Excerpt: _Transcribed for the archive from files.eric.ed.gov. 6 readings are doubtful in the scan and are marked in the text._
- Suggestion: Review OCR/transcription around this passage.

#### `nimh-adverse-reactions-hallucinogenic-drugs-1969` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Adverse Reactions to Hallucinogenic Drugs: Proceedings of a Conference Held at the National Institute of Mental Health
- Excerpt: The extent and characteristics of hallucinogenic drug abuse among middle class young adults is at this time unknown. Preliminary reports of grant-supported surveys in the spring of 1967 indicated that 15 to 20 percent of the college population had used marihuana and approximately u to 8 percent of this same population had used LSD (and/or other hallucinogen...
- Suggestion: Review OCR/transcription around this passage.

#### `nimh-adverse-reactions-hallucinogenic-drugs-1969` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Adverse Reactions to Hallucinogenic Drugs: Proceedings of a Conference Held at the National Institute of Mental Health
- Excerpt: Evidence of pert:sti-;:i psychological damage from chronic LSD a;.12.aiiiisirk-Con was minimal. This negative finding may be "real" or may reflect a lack of sophistication in out measuring instruments. While some psychological tests done on persons who have used LSD many times suggest borderline evidence of organicity, electroencephalographic findings subse...
- Suggestion: Review OCR/transcription around this passage.

#### `nimh-adverse-reactions-hallucinogenic-drugs-1969` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Adverse Reactions to Hallucinogenic Drugs: Proceedings of a Conference Held at the National Institute of Mental Health
- Excerpt: ing the circulating lymphocytes of some hippies in the Philadelphia area but failed to confirm Dr. Cohen's findings. On the other hand, Dr. Hermann Lisco of Harvard University observed similar chromosomal changes in persons who had been given psilocybin in a psychological experiment. Persons attending this meeting were unclear as to the ultimate significanc...
- Suggestion: Review OCR/transcription around this passage.

#### `oregon-measure-109-psilocybin-services-act-2020` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Oregon Psilocybin Services Act (Ballot Measure 109)
- Excerpt: [10, 20]

#### `oregon-measure-109-psilocybin-services-act-2020` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Oregon Psilocybin Services Act (Ballot Measure 109)
- Excerpt: _Transcribed for the archive from oregonlegislature.gov._
- Suggestion: Review OCR/transcription around this passage.

#### `osmond-review-psychotomimetic-agents-1957` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: A Review of the Clinical Effects of Psychotomimetic Agents
- Excerpt: [10, 20]

#### `osmond-smythies-schizophrenia-new-approach-1952` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Schizophrenia: A New Approach
- Excerpt: [10, 20]

#### `osmond-smythies-schizophrenia-new-approach-1952` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Schizophrenia: A New Approach
- Excerpt: It is just possible that a pathological disordering of its transmethylation mechanism might lead to methylation of one or both of its phenolic hydroxyl groups instead of its amino group, leading to the formation of (III) and (IV). Methylation of phenolic hydroxyl groups in the animal body is of rare occurrence, but a significant case has been reported recen...
- Suggestion: Review OCR/transcription around this passage.

#### `osmond-smythies-schizophrenia-new-approach-1952` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Schizophrenia: A New Approach
- Excerpt: We therefore suggest that schizophrenia is due to a specific disorder of the adrenals in which a failure of metabolism occurs and a mescaline-like compound or compounds are produced, which for convenience we shall refer to as "M substance." The striking implications of the relationship between the bizarre Mexican cactus drug and the common hormone have, so...
- Suggestion: Review OCR/transcription around this passage.

#### `people-v-woody-1964` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: People v. Woody
- Excerpt: 4634 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `people-v-woody-1964` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: People v. Woody
- Excerpt: [10, 20]

#### `people-v-woody-1964` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: People v. Woody
- Excerpt: TOBRINER, J. On April 28, 1962, a group of Navajos met in an Indian hogan in the desert near Needles, California, to perform a religious ceremony which included the use of peyote. Police officers, who had observed part of the ceremony, arrested defendants, who were among the Indians present. Defendants were later convicted of violating section 11500 of the...
- Suggestion: Review OCR/transcription around this passage.

#### `people-v-woody-1964` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: People v. Woody
- Excerpt: Defendants also rely upon Cal. Const., art. I, section 4, which provides: “The free exercise and enjoyment of religious profession and worship, without discrimination or preference, shall forever be guaranteed in this State; and no person shall be rendered incompetent to be a witness or juror on account of his opinions on matters of religious belief; but th...
- Suggestion: Review OCR/transcription around this passage.

#### `peyote-hr2614-house-hearings-1918` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: Peyote: Hearings Before a Subcommittee of the Committee on Indian Affairs, House of Representatives, on H.R. 2614
- Excerpt: 7049 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `peyote-hr2614-house-hearings-1918` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Peyote: Hearings Before a Subcommittee of the Committee on Indian Affairs, House of Representatives, on H.R. 2614
- Excerpt: [10, 20]

#### `peyote-hr2614-house-hearings-1918` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Peyote: Hearings Before a Subcommittee of the Committee on Indian Affairs, House of Representatives, on H.R. 2614
- Excerpt: I do not know about the medicinal qualities of the peyote, whether it can cure consumption or any other disease that the human flesh is subject to, but there is one disease it has cured — the disease of drunk-
- Suggestion: Review OCR/transcription around this passage.

#### `peyote-hr2614-house-hearings-1918` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Peyote: Hearings Before a Subcommittee of the Committee on Indian Affairs, House of Representatives, on H.R. 2614
- Excerpt: this girl. Upon inquiry I found out she had accidentally swallowed a couple of pins. One of them she said she vomited up; the other was in her throat. The physician, under the direction of the superintendent, was instructed to look after the girl. They had tried every way to obtain a means of getting it out by examination, but they' failed to do it. They ha...
- Suggestion: Review OCR/transcription around this passage.

#### `prentiss-morgan-anhalonium-lewinii-1895` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Anhalonium Lewinii (Mescal Buttons): A Study of the Drug, with Especial Reference to its Physiological Action upon Man, with Report of Experiments
- Excerpt: [10, 20]

#### `psychedelic-review-1963-vol1no1` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Psychedelic Review, Vol. I, No. 1
- Excerpt: [10, 20]

#### `psychedelic-review-1963-vol1no1` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Psychedelic Review, Vol. I, No. 1
- Excerpt: In the lives and work of artists and writers and in the aesthetic sphere in general, visionary experience has often played a significant role. In the 19th Century French Symbolist movement, for example, the consumption of hashish was pervasive and influential. Many individual artists from Thomas De Quincey to William Burroughs have used drugs in one way or...
- Suggestion: Review OCR/transcription around this passage.

#### `psychedelic-review-1963-vol1no1` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: The Psychedelic Review, Vol. I, No. 1
- Excerpt: _Transcribed for the archive from maps.org._
- Suggestion: Review OCR/transcription around this passage.

#### `r-gordon-wasson-seeking-magic-mushroom-life-1957` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Seeking the Magic Mushroom
- Excerpt: [10, 20]

#### `r-gordon-wasson-seeking-magic-mushroom-life-1957` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Seeking the Magic Mushroom
- Excerpt: _Image: Alan Rockefeller, via iNaturalist and Wikimedia Commons, CC BY 4.0._
- Suggestion: Review OCR/transcription around this passage.

#### `r-gordon-wasson-seeking-magic-mushroom-life-1957` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Seeking the Magic Mushroom
- Excerpt: _No transcript hosted (text postdates 1930 and is not a US Government work). Excerpt below verified against the Internet Archive scan of Life, vol. 42, no. 19 (May 13, 1957)._
- Suggestion: Review OCR/transcription around this passage.

#### `reinburg-ayahuasca-experiment-1921` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Contribution à l'étude des boissons toxiques des Indiens du Nord-Ouest de l'Amazone : l'ayahuasca, le yajé, le huánto
- Excerpt: [10, 20]

#### `reinburg-ayahuasca-experiment-1921` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Contribution à l'étude des boissons toxiques des Indiens du Nord-Ouest de l'Amazone : l'ayahuasca, le yajé, le huánto
- Excerpt: **1re partie. Introduction**
- Suggestion: Review OCR/transcription around this passage.

#### `reinburg-ayahuasca-experiment-1921` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Contribution à l'étude des boissons toxiques des Indiens du Nord-Ouest de l'Amazone : l'ayahuasca, le yajé, le huánto
- Excerpt: *1er mai 1913.* — Dans une marmite de terre (kíčua : *manga*), où jamais l'on n'a fait cuire quoi que ce soit avec du sel, Teofilo mit un litre et demi d'eau, quatre morceaux de 30 centimètres de long d'ayahuasca, pilés et hachés, et cinq à six feuilles de yajé.
- Suggestion: Review OCR/transcription around this passage.

#### `reinburg-ayahuasca-experiment-1921` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Contribution à l'étude des boissons toxiques des Indiens du Nord-Ouest de l'Amazone : l'ayahuasca, le yajé, le huánto
- Excerpt: _Transcribed for the archive from Persée. Pages 25-32 of the article, retrieved page by page from Persée's paginated article viewer (jsa_0037-9174_1921_num_13_1_2903, pageId parameters T1_26 through T1_32) and transcribed in full. One reading is doubtful in the scan and is marked in the text._
- Suggestion: Review OCR/transcription around this passage.

#### `reinburg-ayahuasca-experiment-1921` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Contribution à l'étude des boissons toxiques des Indiens du Nord-Ouest de l'Amazone : l'ayahuasca, le yajé, le huánto
- Excerpt: Vers 3 heures, en moins d'une demi-heure, j'urine quatre fois très abondamment (au moins deux litres et demi à trois litres). La vue persiste aussi aiguë, la parole est moins saccadée, l'état général s'améliore. J'ai encore besoin de respirer de l'éther de temps en temps, lorsque la respiration tend à s'arrêter. Je prends alors une dernière tasse de café fo...
- Suggestion: Review OCR/transcription around this passage.

#### `reinburg-ayahuasca-experiment-1921` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Contribution à l'étude des boissons toxiques des Indiens du Nord-Ouest de l'Amazone : l'ayahuasca, le yajé, le huánto
- Excerpt: Les sorciers : *brujos* (espagnol), *tapia* (kíčua), font un usage fréquent de cette boisson additionnée de yajé, notamment ceux qui se livrent à des pratiques de sorcellerie médicale. Lorsqu'un sorcier záparo se rend auprès d'un malade, ce qui a toujours lieu la nuit, il ne manque pas de prendre la boisson préparée comme je l'ai décrit plus haut, mais à do...
- Suggestion: Review OCR/transcription around this passage.

#### `richard-evans-schultes-rivea-corymbosa-ololiuqui-1941` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: A Contribution to Our Knowledge of Rivea Corymbosa: The Narcotic Ololiuqui of the Aztecs
- Excerpt: [10, 20]

#### `richard-evans-schultes-rivea-corymbosa-ololiuqui-1941` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: A Contribution to Our Knowledge of Rivea Corymbosa: The Narcotic Ololiuqui of the Aztecs
- Excerpt: _Transcribed for the archive from samorini.it._
- Suggestion: Review OCR/transcription around this passage.

#### `richard-evans-schultes-rivea-corymbosa-ololiuqui-1941` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: A Contribution to Our Knowledge of Rivea Corymbosa: The Narcotic Ololiuqui of the Aztecs
- Excerpt: The Aztecs, in pre-hispanic Mexico, from their own experiences and from association with conquered or friendly tribes, had acquired a knowledge of many narcotic and poisonous plants. The most important of these were the cactus, peyotl (Lophophora Williamsii (Lem.) Coulter); the mushroom, teonanacatl (Paneolus campanulatus L. var. sphinctrinus (Fr.) Bresadol...
- Suggestion: Review OCR/transcription around this passage.

#### `richard-evans-schultes-rivea-corymbosa-ololiuqui-1941` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: A Contribution to Our Knowledge of Rivea Corymbosa: The Narcotic Ololiuqui of the Aztecs
- Excerpt: "...ololiuqui is a kind of seed like the lentil which is produced by a species of ivy of this land; when it is drunk, this seed deprives of his senses him who has taken it, for it is very powerful."
- Suggestion: Review OCR/transcription around this passage.

#### `richard-evans-schultes-rivea-corymbosa-ololiuqui-1941` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: A Contribution to Our Knowledge of Rivea Corymbosa: The Narcotic Ololiuqui of the Aztecs
- Excerpt: In 1897, Doctor Manuel Urbina identified ololiuqui as Rivea corymbosa (Ipomoea sidaifolia (HBK.) Choisy). This identification was published in a more detailed form in 1903 in an article entitled: El peyote y el ololiuqui, which was reprinted in 1912.
- Suggestion: Review OCR/transcription around this passage.

#### `richard-evans-schultes-rivea-corymbosa-ololiuqui-1941` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: A Contribution to Our Knowledge of Rivea Corymbosa: The Narcotic Ololiuqui of the Aztecs
- Excerpt: An excellent summary of the uses of ololiuqui among the ancient Aztecs is provided by Simeon's definition of the name in his Dictionnaire de la langue Nahuatl ou Mexicaine: "Ololiuhqui — a medicinal plant whose seed is round, also called coaxiutl, herb of the serpent (Hernandez). It served to cure venereal disease and entered into a preparation with which a...
- Suggestion: Review OCR/transcription around this passage.

#### `richard-evans-schultes-teonanacatl-1940` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Teonanacatl: The Narcotic Mushroom of the Aztecs
- Excerpt: [10, 20]

#### `richard-evans-schultes-teonanacatl-1940` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Teonanacatl: The Narcotic Mushroom of the Aztecs
- Excerpt: _No transcript hosted (text postdates 1930 and is not a US Government work). Excerpt below verified against the Internet Archive scan (JSTOR stable URL 663232)._
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: [10, 20]

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: The nature and cause of the major psychoses are still unknown. Repeated attempts have been made to reproduce experimentally psychotic symptoms in the hope to uncover their psycho-physiological relationship. In 1886, Schmiedeberg succeeded in producing cataleptic phenomena in rabbits by the use of ethyl-urethan. In 1904, Peters(11) discovered the cataleptic...
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: sycl latry Of xperimentally at present alkaloid known in its crude form as peyote for hun-
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: 1. Disturbances of Thought and Speech. The most prominent psychological changes observed were those in thinking and speech. They were present in all our experiments. There was no cloudiness of consciousness, no intellectual weakness, but most frequently we observed difficulty in the power of expression. The subjects became more and more slowed down, poverty...
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: administration of L.S.D. In general, the ef-
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: of indifference and unreality with disturb-
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: ances in body image Che subjects experienced hostilit nd resentment, and on rare occasions ambivalence. The phenomena occurred about 15 minutes after the adminis-
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: illusion. None of the subjects, however, had the feeling of seeing si inething of extraor-
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: IV. Hallucinations and Delusions.—Disturbarices in perception, in a complex way, often lead to hallucinations and delusions. A vivid phantasy, a pseudohallucination or illusion, in the process of mental dissociation, may ultimately appear as a real object outside the subject and thus constitute a real hallucination. By a similar process, changes in auditory...
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: A. Rorschach.—Controlled Rorschach tests were given to 5 subjects at the height of L..5.D. reaction. All tests given during L..5.D. reaction showed abnormalities prin-
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: Many authors assume that chemical endogenous substances are the cause of schizophrenic psychosis. We must bear in mind that, in addition to d-lysergic acid, a great variety of seemingly unrelated chemical substances are capable of producing transi-
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: 1 Read at the 107th annual meeting of The American Psychiatric Association, Cincinnati, Ohio, May 7-11, 1981.
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: Aided by a grant from the McCurdy Company, Rochester, New York.
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: , which stands for the German LyDidthylamid, is the abbreviation
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: tration of L.S.D.; feelings of indifference and blunting tended to be protracted; suspiciousness, hostility, and resentment were always more transient. Changes in mood were twofold: euphoria and depression, which occurred in about equal number. Euphoria was either of the shallow elation type with silliness, as seen in the hebephrenic, or, in a cyclothymic s...
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: We mention the similarities of the experimental phenomena to actual psychotic states in order to caution against fallacies that may occur in the interpretation of experimental psychotic disturbances. The same caution that is warranted in the application of an animal experiment to a pathological condition in man is needed in the application of the psychiatri...
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Source note]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: _Transcribed for the archive from api.crossref.org. The article complete, less its bibliography._
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: : \ \ | paper is ncerned H \ \ C—E ( CH; HC N—CH H¢ N—CH C——-CH CH Cc CH, ( CH, HC H¢ ( CH CH NH S72
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: spontaneity, irrelevance, pedantic imitation, and subjectively aut tic speech. In one in stance, we had the impression of the forma tio neologism .cceleration of thought with fligl t of idea ciated with rhyming and punning; garrulity and loquacity of the hypomat type were seen in a cyclothymik
- Suggestion: Review OCR/transcription around this passage.

#### `rinkel-experimental-schizophrenia-1952` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Experimental Schizophrenia-Like Symptoms
- Excerpt: IX. were taken in 9 experiments at about the height of L.S.D. reaction, and compared with the I.EG of the same subject in his normal state. In general, the EEG changes were only
- Suggestion: Review OCR/transcription around this passage.

#### `rouhier-documents-yage-1926` / `placeholder_or_review_note`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Documents pour servir à l'étude du yagé
- Excerpt: ### Documents pour servir à l'étude du yagé VARIÉTÉS En 1903, un naturaliste colombien, le Rafael Zerda Bayón, revenant d'une mission scientifique d'exploration à travers les territoires mal connus de la Caquetá colombienne et du Putumayo, rapportait, avec une riche moisson de documents et de matières premières d'origine végétale, une liane, auréolée d'une...

#### `rouhier-documents-yage-1926` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Documents pour servir à l'étude du yagé
- Excerpt: [10, 20]

#### `rouhier-documents-yage-1926` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Documents pour servir à l'étude du yagé
- Excerpt: _[Suit dans l'original une description détaillée de la méthode d'extraction chimique, des propriétés physiques et cristallographiques de la yagéine, un tableau de solubilité, l'analyse élémentaire et la formule proposée (C₁₂H₈N₂O), les réactions colorées avec divers réactifs alcaloïdiques, et un tableau de doses léthales sur le cobaye (de 0 gr. 10, mortel e...
- Suggestion: Review OCR/transcription around this passage.

#### `rouhier-documents-yage-1926` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Documents pour servir à l'étude du yagé
- Excerpt: Nous avons eu à examiner une préparation indienne liquide de yagé, préparée par une tribu de Jivaros des environs de Macas (Pérou).
- Suggestion: Review OCR/transcription around this passage.

#### `safford-aztec-narcotic-1915` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: An Aztec Narcotic (Lophophora williamsii)
- Excerpt: [10, 20]

#### `safford-aztec-narcotic-1915` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: An Aztec Narcotic (Lophophora williamsii)
- Excerpt: Dr. Morgan gave to the court an account of his experiments bearing upon the physiological action of the drug administered in his presence to several young men who had volunteered for the purpose. The chief effect noticed was the production of visions of various kinds: of moving objects, constantly changing designs and figures of landscapes, friezes, balls o...
- Suggestion: Review OCR/transcription around this passage.

#### `sf-oracle-houseboat-summit-1967` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: The Houseboat Summit
- Excerpt: [10, 20]

#### `sf-oracle-houseboat-summit-1967` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Houseboat Summit
- Excerpt: ALAN WATTS: ...Look then, we're going to discuss where it's going... the whole problem of whether to drop out or take over.
- Suggestion: Review OCR/transcription around this passage.

#### `sf-oracle-houseboat-summit-1967` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: The Houseboat Summit
- Excerpt: SNYDER: ...but historically it arrives from a utopian and essentially religious drive. The early revolutionary political movements in Europe have this utopian strain in them.
- Suggestion: Review OCR/transcription around this passage.

#### `sim-clinical-investigation-ea1729-1961` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Clinical Investigation of EA 1729
- Excerpt: [10, 20]

#### `sim-clinical-investigation-ea1729-1961` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Clinical Investigation of EA 1729
- Excerpt: (C) A double- blind procedure was used on all tests; EA 1729 in water
- Suggestion: Review OCR/transcription around this passage.

#### `sim-clinical-investigation-ea1729-1961` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Clinical Investigation of EA 1729
- Excerpt: The mission of this section is to furnish necessary weather data*'* that will affect artillery projectiles or rockets in flight and will furnish winds- aloft data for prediction of fallout after an atomic burst.
- Suggestion: Review OCR/transcription around this passage.

#### `sim-clinical-investigation-ea1729-1961` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Clinical Investigation of EA 1729
- Excerpt: (S) The ability of EA 1729 (lysergic acid diethylamide, LSD25) to
- Suggestion: Review OCR/transcription around this passage.

#### `sim-clinical-investigation-ea1729-1961` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Clinical Investigation of EA 1729
- Excerpt: on military units. If LSD25, used as outlined in the experiment, should fail to produce disorganizing and disrupting effects on the military unit, it would be evident that there is no military promise in this field.
- Suggestion: Review OCR/transcription around this passage.

#### `sim-clinical-investigation-ea1729-1961` / `text_mixed_case_word`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Clinical Investigation of EA 1729
- Excerpt: _[Dose-response pharmacology, physiological measurement tables (blood pressure, pupillary size, nausea/vomiting incidence), tracking and self-rating test results, personality and body-image studies, and the account of the demonstration to Chemical Corps School personnel at Fort McClellan are omitted.]_
- Suggestion: Review OCR/transcription around this passage.

#### `sim-clinical-investigation-ea1729-1961` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Clinical Investigation of EA 1729
- Excerpt: II. (C): HUMAN STUDIES.
- Suggestion: Review OCR/transcription around this passage.

#### `sim-clinical-investigation-ea1729-1961` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Clinical Investigation of EA 1729
- Excerpt: Both sections were assigned the mission of making weather balloon. releases at 0830, 0930, and 1030 hours and reporting weather data gained from the releases. The section which received placebo disseminated completed messages at 0900, 1000, and 1100 hours. The drugged section disseminated a completed message at 0900 hours, but* was unable to produce any par...
- Suggestion: Review OCR/transcription around this passage.

#### `state-v-big-sheep-1926` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: State v. Big Sheep
- Excerpt: [10, 20]

#### `united-states-v-kuch-1968` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: United States v. Kuch
- Excerpt: 5857 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `united-states-v-kuch-1968` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: United States v. Kuch
- Excerpt: [10, 20]

#### `united-states-v-kuch-1968` / `text_stray_ocr_punctuation`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: United States v. Kuch
- Excerpt: OPINION GESELL, District Judge. - Judith H. Kuch, who avers she is an “ordained minister of the Neo-American Church”, stands indicted in a seven-count indictment for unlawfully obtaining and transferring marihuana and for the unlawful sale, delivery and possession of LSD. She moves to dismiss on several grounds. Counts 1, 2 and 7 of the indictment are broug...
- Suggestion: Review OCR/transcription around this passage.

#### `wasson-new-mexican-psychotropic-drug-mint-family-1962` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: A New Mexican Psychotropic Drug from the Mint Family
- Excerpt: [10, 20]

#### `wasson-new-mexican-psychotropic-drug-mint-family-1962` / `text_broken_hyphen`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: A New Mexican Psychotropic Drug from the Mint Family
- Excerpt: divinorum is known as la hembra, "the female." El macho, or "the male," is Coleus pumila, of European origin. Then there is elnene, "the child," and el ahijado, "the godson," which are both forms of Coleus Blumei. Some Indians insist that these others are likewise psychotropic, but we have not tried them ; others say these are merely medicinal. We have foun...
- Suggestion: Review OCR/transcription around this passage.

#### `weir-mitchell-anhelonium-lewinii-1896` / `oversized_single_transcript_section`

- Import: `data/draft-import`
- Field: `document_sections`
- Title: Remarks on the Effects of Anhelonium Lewinii (the Mescal Button)
- Excerpt: 4201 words in one section
- Suggestion: Split into reader sections so the table of contents is useful.

#### `weir-mitchell-anhelonium-lewinii-1896` / `section_position_gap`

- Import: `data/draft-import`
- Field: `document_sections.position`
- Title: Remarks on the Effects of Anhelonium Lewinii (the Mescal Button)
- Excerpt: [10, 20]

#### `weir-mitchell-anhelonium-lewinii-1896` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Remarks on the Effects of Anhelonium Lewinii (the Mescal Button)
- Excerpt: The history of the use of mescal by the Indians of New Mexico is very well known in the United States, and especially through the valuable papers of Dr. Prentiss, of Washington, D.C. These so interested me that I asked him to favour me with some of the extract. Profiting by his kindness, I made a trial of the drug on May 24th, 1896, by taking it as I shall...
- Suggestion: Review OCR/transcription around this passage.

#### `weir-mitchell-anhelonium-lewinii-1896` / `text_digit_letter_noise`

- Import: `data/draft-import`
- Field: `document_sections[Transcript]`
- Title: Remarks on the Effects of Anhelonium Lewinii (the Mescal Button)
- Excerpt: On May 30th, at 3.50 p.m., with a pulse of 78, I took a fluid drachm. At 4.25 p.m. my pulse was 73, and I took another fluid drachm. At 4.45 my pulse was 65, and I took a third fluid drachm. At 5 p.m., with a pulse of 61, I took 40 minims, all of the preparation I had left. At 5.15 my pulse was 59; at 5.30, 64; and at 6.30, 65.
- Suggestion: Review OCR/transcription around this passage.

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 10].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 11].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 1].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 2].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 3].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 4].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 5].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 6].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 7].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 8].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `bibra-fliegenschwamm-haschisch-genussmittel` / `text_page_without_ocr`

- Import: `data/latin-america-import`
- Field: `pages[Page 9].ocr_text`
- Title: Fly Agaric and Hashish in Die narkotischen Genussmittel
- Excerpt: (blank)

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 111].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 99 activities? What accounts for the continued dominance of the clan- destine component within the Agency ? How have individual Directors of Central Intelligence defined their roles and what impact have their definitions had on the direction of the Agency? What impact did technological developments have on the Agency and on the Agency's relationship with th...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 116].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 104 obstacles posed by the Departments prevented the DCI and the Agency from carrying out coordination of the activities of the depart- mental intelligence components. These problems appeared more stark following the outbreak of the Korean War in June 1950. Officials in the Executive branch and members of Congress criticized the Agency for its failure to pr...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 122].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: no Washington policymakers regarded the Central Intelligence Agency as a primary means of defense against Communism. By 1953, the Agency was an established element of government. Its contributions in the areas of political action and paramilitary warfare were recog- nized and respected. It alone could perform many of the kinds of activities seemingly requir...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 125].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 113 proclaiming a "missile gap" between the United States and the Soviet Union. A final element contributed to the Agency's estimative capaJbility : material supplied by Oleg Penkovsky. Well-placed in Soviet military circles, Penkovsky turned over a number of classified documents relat- ing t/O Soviet strategic planning and capabilities. These three factors...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 128].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 116 The most significant development for the Agency in this period was the impact of technological capabilities on intelligence produc- tion. These advances resulted in internal changes and forced increased attention to coordination of the intelligence community. The costs, quality of intelligence and competition for deployment generated by technical collec...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 130].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 118 arrano;ement recooriized the DCI's authority avs head of the commu- nity to establish collection requirements in consultation with USIB; it also gave him responsibility for processing and utilizing data gen- erated byoverhead reconnaissance. In the event that he did not agree with a decision made by the Secretary of Defense, the DCI was given the right...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 131].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 119 arrangements insured constant interchanges between the Directorate and the scientific and industrial communities. First, since all research and development for technical systems was done through contracting, the DDS&T could draw on and benefit from the most advanced tech- nical systems nationwide. Second, to attract high-quality professionals from the i...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 134].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 122 By the start of the decade broad changes had evolved in American foreign policy. Dissension over Vietnam, the Congress' more assertive role in foreign policy, and shifts in the international power structure had eroded the assumptions on which U.S. foreign policy had been based. The consensus that had existed among the press, the informed public, the Con...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 135].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 123 decision inherently limited the DCI's ability to exert control over the intelligence components. Thus, the DCI was once again left to arbitrate as one among equals. Second, the implementation of the directive was less energetic and decisive than it might have been. Helms did not at- tempt to make recommendations on budgetary allocations and instead, pre...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 18].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 6 (3) Where broad programs were closely reviewed (for example, the CIA's covert action programs) , the Committee sought to examine successes as well as apparent failures. (4) Programs were examined from Franklin Roosevelt's administration to the present. This was done in order to present the historical context within which intelligence ac- tivities have dev...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 192].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 180 afford to foreoo the clandestine use of our universities, our media, and our religious groups in competing- with our adversaries. In exploring this problem the Committee has given special atten- tion to the CIA's past clandestine relationships with American institu- tions. The Committee has examined the past to illuminate the attitudes and perceptions t...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 19].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: totality of government ejfforts against dissenters over the past thirty years can one weigh the extent to which such an emphasis may "chill" legitimate free expression and assembly. The Select Committee has conducted the only thorough investigation ever made of United States intelligence and its post World War II emergence as a complex, sophisticated system...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 206].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 194 ' in the United States, and to selected newspapers and magazine editors both in the United States and abroad. (2) A book about a student from a developing country who had studied in a communist country "was developed by [two area divisions of the CIA] and produced by the Domestic Operations Division . . . and has had a high impact in the U.S. as well as...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 24].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 12 information obtained by clandestine means and available only to the executive branch. Until very recently, the Congress has not shared in this process. The cautions expressed by the Founding Fathers and the constitutional checks designed to assure that policymaking not be- come the province of one man or a few men have been avoided on nota- ble recent oc...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 255].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 243 reflected in book values, but on the earning power of the assets adjusted to "present vakie"' and the current resale value for all assets. On August 23, 1972, the former owner was advised that the asking price for SAT was $5.9 million; $2.7 million for the acquisition of stock and $3.2 million for payment of debt to Air America. A deadline date of Octob...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 256].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 244 tion of control of SAT by the former owner was filed with the CAB under Docket No. 252-64. It was anticipated that CAB approval would be forthcoming within 60 days. Subsequent to the agreement for sale and application to CAB, sev- eral supplemental carriers generated a great deal of pressure to pre- -vent SAT from being sold to the former owner and to p...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 259].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 247 If. Possible Confyict of Interest In the SAT divestiture, the Agency took precautions to avoid con- flict of interest. A retired staff agent who had been the IVIanaging Director of Air America, Inc., made several offers to acquire SAT. In early 1972 he and some other members of Air America management made an informal offer to buy SAT. On August 7, 1972,...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 263].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 2151 in CIA intelligence collection and covert action, these activities have not been reflected in the CIA budget submission. A policy review of the budget requires programmatic judgments of the necessity and appropriate use of proprietaries in overseas areas. The Contingency Reserve Fund is an example of why such clear budgetary information is necessary. R...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 273].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 261 sibility of the Department of Defense. But the "bomber gap" and later the "missile gap" controvereies gave CIA a role in foreign military research, an involvement which has continued and expanded. In 1960 the DDI created an ad hoc Guided Missiles Task Force to foster the collection of information on Soviet guided missiles and to produce in- telligence o...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 29].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 17 B. The Scope of the Select Committee's Inquiry into Foreign and MiiiiTAKY Intelligence Operations The operations of the United States Government in the field of intelligence involve the activities of hundreds of thousands of individ- uals and the expenditure of billions of dollars. They are carried out by a complex "community" of organizations whose func...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 30].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 18 of —information Those who needed. use intelligence, the "consumers," indicate the kind — These needs are translated into concrete "requirements" by senior intelligence managers. — The requirements are used to allocate resources to the "collectors" and serve to guide their efforts. — The collectors obtain the required information or "raw intelligence." —...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 326].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 314 made in Washington. AVashington is where the problem arises. No one outside the CIA, unless it be the President liimself, is responsible for directing and supervising CIA clandestine intelligence operations or is autliorized access to t]ie information necessary to do so. A logical corollary to 22 U.S. 2680a would, thus, be to assign to a Washington auth...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 332].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 320 of intelligence to the major objectives of U.S. military forces, and the history and evolution of intelligence organizations, this report addresses these specific Defense intelligence issues in turn. The con- cluding section assesses the future requirements for Defense intelli- gence, particularly as they are affected by technological developments. A. O...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 345].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 333 to foster the intelligence comnmnity's responsiveness to policymakers and promote management efficiency, was "an enhanced leadership role" for the DCI. Yet the DCI was not given direct authority over the community's budget, nor granted the means by which to control the shape of that budget until the announcement of President Ford's Executive Order of Fe...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 358].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 346 Similarly, the Defense Intelligence Agency, the arm of the Defense Department charged with the prime responsibility for intelligence analysis and production, concluded in a 1973 report : The great disparity in the relative national investment in collection systems versus intelligence processing, exploita- tion, production and support systems has now rea...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 367].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 355 and the Secretary of Defense with guidance for the coming year's activities. These requirements are usually stated in terms of general areas of intelligence interest, but are supplemented by "amplifying requirements," which are time-sensitive and are expressed directly to NSA by the requesting agency. NSA exercises discretion in respond- ing to these re...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 36].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 24 Major structural changes in tlie intelligence community were brouo^ht about by the consolidation of cryptanalysis and ce related func- tions? Codebreaking is a vital part of tpchnical intelligen collection and has had an important role in the history of U.S. intelligence efforts The American "Black Chamber" responsible for breaking German codes in WAVI w...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 377].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 365 and embarrassments which followed the North Korean seizure of the Pueblo and downing of the EC-121. Both a reduction in risk and an increase in cost-effectiveness could be possible if improved technology results in substantial manpower reductions. Technology is interactive. Availability of new techniques for moni- toring or verification may provoke enem...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 3].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: GOVERNMENT DOCUMENTS DEPARTMENT BOSTON PUBLIC UBRARY *'' .,.'*.*^'!T'S*t»»>->'*^?S «'.i>t«»ii»»«>'»»**^*»"«*"'i""^'*'"* BOSTON PUBLIC R > 1 1^ w k-A i i ■■■^-■■ m-^--<^ .— j(3-^ *-»ixn -jijY r;* jr < » .^■^ /T.^.'-'i St M'-'tM.-

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 412].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 400 "observe the behavior of unwitting persons being questioned after having been given a drug." ^° There is no evidence that Subproject Number 3 was terminated even though these officers were unequivo- cally aware of the dangers of the surreptitious administration of LSD and the necessity of obtaining informed consent and providing medical safeguards. Subp...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 440].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 428 pr(>blem is aggravated by the fact that the 40 Committee has had vir- tually no staff, with only a single officer from the Clandestine Services acting as executive secretary. — The process of review and approval has been, at times, only gen- eral in nature. It sometimes has become 'pro forma^ conducted over the telephone by subordinates. — The President...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 457].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 445 3. Covert Action aiid Paramilitary Oferations Covert action is the attempt to influence the internal affairs of other nations in support of United States foreign policy in a manner that conceals the participation of the United States Government. Covert action includes political and economic action, propaganda and para- military activities. The basic uni...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 480].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 468 The Committee found evidence that CIA Station Chiefs abroad do not always coordinate their intelligence reporting on local develop- ments with their Ambassadors. The Committee does not believe that Ambassadors should be able to block CIA field reports. However, it found that there was no standard practice for Ambassadors to review and comment on intelli...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 484].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 472 of the General Counsel, the Inspector General, and the Audit Staff — from exercising adequate supervision of the program. The waiver had the paradoxical effect of providing looser administrative controls and less effective internal review of this controversial and highly sensitive project than existed for normal Agency activities. The Committee found th...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 488].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 476 It examines the procedures by which tlie President and the Congress have delegated power to the NSC and the CIA and the effect of those procedures. It illuminates the way the executive branch has inter- preted undefined provisions of law. It raises questions about congres- sional oversight of covert action and particularly the ability of Con- gress, in...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 520].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 508 Proponents of this interpretation of the amendment can argue that a measure designed to gather infoiTnation about an activity camiot be construed as congressional ratification of that activity. If it were. Con- gress would be powerless to seek regular reports about a controversial subject on which it had been ill-informed without such action being cited...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 541].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 529 The chief purpose of these "specialists" has been monitor " the activities of their KGB counterparts. Informed "presence. to (though not necessarily unbiased) sources report that "detente" has brought no abatement of KGB activity in Europe, Japan or the less developed countries. This "KGB matching and monitoring" function should probably be at the core...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 547].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 535 wound up briefly in the State Department, while the secret operations fended for themselves. In 1947 the two were brought back together under the umbrella of the Central Intelligence Agency, established by law in the summer of 1947, a marriage of covert and overt that persists to this day. Those engaged in secret espionage operations found their main ta...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 551].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 539 across the spectrum of public and private elites: politicians of the Center and the Right as well as the Left, labor leaders of all political complexions, key editors and journalists of all hues, and prominent members of the business and banking communities. These Soviet contacts can be loosely called agents, but not spies. They are "agents of influence...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 556].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 544 The lethargy and timidity normal to a civil service bureaucracy exact a particularly heavy cost in an intelligence service where taking chances based on personal judgment is its main business. A Service is as good as its agents, and its agents are as good as the competence and initiative of the case-officer on the spot. Faced with a hypercautious, if no...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 557].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 545 resentative. He would, in any event, act as the Ambassador's overall assistant for intelligence matters. However quixotic on the surface, a small American secret service separate from the federal bureaucracy is not at all impractical — given the will in high places. The concept of such a service is not too far removed from the Soviet system of illegals:...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 560].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 548 The first thing this scene reveals is the sheer power that Dulles and his agency had. Only a man with extraordinary power could make a mistake involving a great many of the taxpayers' dollars and not have to explain it. Allen Dulles had extraordinary power. Power flowed to him and, through him, to the CIA, partly because his brother was Secretary of Sta...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 56].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 44 £: The NSO and Intelligence The 1947 National Security Act established the CIA as well as the NSC. The Act provided that the CIA was "established under the National Security Council" and was to carry out its prescribed func- tions "under the direction of the National Security Council." Five broad functions were assi^ed to the CIA : (1) to advise the Nati...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 570].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 558 directly and the GRU through the General Staff of the Ministry of Defense. It appears that the role of the Council of Ministers in over- seeing these organizations is limited to administrative control, while the actual control of operations is a Party function. Both organizations report indirectly and directly to the CPSU leadership through their respec...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 576].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 564 The CIA points to a catch-all phrase contained in the 1947 Act as a rationalization for its operational prerogatives. A clause in the statute permits the Agency "to perform such other functions and duties related to intelligence affecting the national security as the National Security Council may, from time to time, direct." These vague and seeming- ly...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 580].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 568 significant policy issues involved. The discussion of the role of U.S. academics in the CIA's clandestine activities has been so diluted that its scope and impact on the American academic institutions is no longer clear. The description of the CIA's clandestine activities within the United States, as well as the extent to which CIA uses its ostensibly o...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 586].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 574 telligence operations and provides for constant review and oversight, is termed "ambiguous." Yet the Committee's recommended statutory changes would [in addition to duplication and multiplication of deci- sions]add , little except to insure that the existing functions set up by the President's program were "explicitly empowered," "reaffirmed" or provide...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 598].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 586 CoTnment: Only a small segment of American public opinion has ever had any doubts in the integrity of our Nation's intelligence agencies. In general, the American people fully support our intelligence services and recognize them as the Nation's front line of defense. Accordingly, the use of the word "restore" is misleading. Committee Report: ... At the...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 60].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 48 among agencies and types of collection ? NSCIC was a structural re- sponse to these issues as well as part of the general tendency at that time to centralize a greater measure of control in the White House for national security affairs. NSCIC's mission was to give direction and policy guidance to the intelligence community. It was not, and was not intend...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 624].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 612 would there be advantages to expressing directly what we and all other nations do, expressing also the hope that through negotiation be- tween nations many activities could be stopped on a mutually accepta- ble basis ? In response to the question of whether we should express openly what we now do secretly in the world of intelligence, many have an- swer...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 631].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 619 Code : A system of commimication in which arbitrary groups of sym- bols represent units of plain text. Codes may be used for brevity or for security. Code word : A word which has been assigned a classification and a classified meaning to safeguard intentions and information re- garding aplanned operation. Collation : The assembly of facts to determine t...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 651].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 639 4 1 (2) The oondnrt of domestic' iulolHg('iK*e or eoiin- 2 teriiitclligcneo (►pora.lioiis against United States citizens 3 by the Eedeml Bureau of Investigation or any other 4 Federal agency. 5 (3) The origin and disposition of the so-called Hus- g ton Plan to apply United States intelligence agency 7 capaibdlities against individuals or organizations w...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 658].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 646 11 1 Sec. 5. The select committee shall make a final report 2 of the results of the iiives'tigation and study conducted by 3 it i)ursuant to this resolution, together with its findings and 4 its recommendations as to new congressional legislation it 5 deems necessary or desirable, to the Senate at the earliest 6 practicable date, but no later than Septe...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 70].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 58 As stated, procedural arrangements for considering and approv- ing covert operations have been formalized and tightened over the years. NSC-4-A of 1947 established no formal procedures for co- ordinating or approving operations; the DCI, in liaison with State and Defense, was to ensure that operations were consistent with United States policy. Over time,...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 82].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 70 a regular and timely scriitinv of all proposed covert action and other sensitive intelligence projects. OMB's review will, therefore, no longer be confined to a postdecision review of those projects requiring Con- tingency Reserve Fund financing. Another likely effect is to strengthen the substantive mandate of OMB's inquiry into CIA projects of all kind...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 90].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 78 separation from the launch vehicle.^* According to testimony by three Board members, at the time they saw nothing improper in a White House request to redraft the estimate to inchide more evidence. How- ever, in this case, they interj^reted tlie White House request as a subtle and indirect effort to alter the DCI's national intelligence judgment.^^ On th...

#### `church-committee-foreign-military-intelligence-book-one` / `abrupt_truncation`

- Import: `data/latin-america-import`
- Field: `pages[Page 95].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 83 only if tliey are used. In the cases of the SS-9 and Cambodia, Helms took the decisions without consulting with the Board collectively. B. Coordinator of Intelligence Activities 1. The Intelligence Process In theory, the intelliafence process works as follows. The President and members of the NSC — as the major consumers of forei^ intel- ligence— define...

#### `church-committee-foreign-military-intelligence-book-one` / `placeholder_or_review_note`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 251-300]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ##### Page 251 239 Our study revealed that during the mdicated period, a large num- ber- of proprietaries were dissolved, sold, or otherwise disposed of, thus substantiating the Agency's claim that it had moved decisively to extricate itself from this area of activity. In a very real sense, it is nearly impossible to evaluate w^hether a ''link" still exists...

#### `church-committee-foreign-military-intelligence-book-one` / `placeholder_or_review_note`

- Import: `data/latin-america-import`
- Field: `pages[Page 264].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 252 run airlines in remote areas or on commercially unattractive routes. Would private enterprise do any or all of these things ? It is true that private contracts with the Government include highly sensitive con- tracts with the CIA for technical intelligence collection, research, and development. Would the abandonment of CIA proprietaries and the cooperat...

#### `church-committee-foreign-military-intelligence-book-one` / `placeholder_or_review_note`

- Import: `data/latin-america-import`
- Field: `pages[Page 272].ocr_text`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 260 which was in the Intelligence Directorate until 1966, when it became a staff under the direction of the Director of Central Intelligence. This move was made, in part, to emphasize that the NIEs were the product of the entire intelligence community rather than a single agency. ONE was abolished in 1973 and its responsibilities were trans- ferred to the n...

#### `church-committee-foreign-military-intelligence-book-one` / `section_position_gap`

- Import: `data/latin-america-import`
- Field: `document_sections.position`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: [10, 20, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750]

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: On January 27, 1975, the Senate established a Select Committee to conduct an investigation and study of the intelligence activities of the United States. After 15 months of intensive work, I am pleased to submit to the Senate this volume of the Final Report of the Com- mittee relating to foreign and military intelligence. The inquiry arises out of allegatio...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The Committee's Final Keport has been reviewed and declassi- fied by the appropriate executive agencies. These agencies submitted comments to the Committee on security and factual aspects of each chapter. On the basis of these comments, the Committee and staff conferred with representatives of the agencies to determine which parts of the report should remai...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: I. INTRODUCTION 1 A. The Mandate of the Committee's Inquiry 2 B. The Purpose tions of the Committee's Findings and Recommenda- 4 C. The Focusstacles andEncountered Scope of the Committee's Inquiry and Ob- 5 D. The Historical Context of the Inquiry 8 E. The Dilemma of Secrecy and Open Constitutional Govern- ment 11 II. THE FOREIGN AND MILITARY INTELLIGENCE O...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: VIII. COVERT ACTION 141 A. Evolution of Covert Action 143 B. Congressional Oversight 149 C. Findings and Conclusions 152 IX. COUNTERINTELLIGENCE 163 A. Counterintelligence: An Introduction 163 B. Current Issues in Counterintelligence 171 C. Conclusions 177 X. THE DOMESTIC IMPACT OF FOREIGN CLANDESTINE OPERATIONS: THE CIA AND ACADEMIC INSTITUTIONS, THE MEDIA...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: VII XVI. DISCLOSURE OF BUDGET INFORMATION ON THE IN- Page TELLIGENCE COMMUNITY 367 A. The Present Budgetary Process for Intelligence Community Agencies and Its Consequences 367 B. The Constitutional Requirement 369 C. Alternatives to Concealing Intelligence Budgets from Congress and the PubHc 374 D. The Effect Upon National Security of Varying Levels of Bud...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The Senate Select Committee on Intelligence Activities has con- ducted afifteen month long inquiry, the first major inquiry into intelli- gence sinbe World War II. The inquiry arose out of allegations of substantial, even massive wrong-doin^ within the "national intelli- gence" system.^ This final report provides a history of the evolution of intelligence,...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: manent and necessary component of our government. The system's value to the country has been proven and it will be needed for the foreseeable future. But a major conclusion of this inquiry is that con- gressional oversight is necessary to assure that in the future our intelligence community functions effectively, within the framework of the Constitution. Th...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: A. The Mandate of the Committee's Inquiry On January 27, 1975, Senate Resolution 21 established a select com- mittee "to conduct an investigation and study of governmental opera- tions with respect to intelligence activities and of the extent, if any, to which illegal, improper, or unethical activities were engaged in by any agency of the Federal Government...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: that the agency shall have no police, subpena, law enforce- ment powers, or internal security functions. . . ." ^ (7) The nature and extent of executive branch oversight of all United States intelligence activities. (8) The need for specific legislative authority to govern the operations of any intelligence agencies of the Federal Government now existing wi...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: "Memorandum from CIA General Council Lawrence Houston to DCI Hillen- koetter, 9/25/47.
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ... to perform such other functions and duties related to intelligence affecting the national security as the National Security Council may from time to time direct.'** Secret Executive Orders issued by the NSC to carry out covert action programs were not subject to congressional review. Indeed, until re- cent years, except for a few members, Congress was n...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The inquiry mandated in S. Res. 21 falls into two main categories. The first concerns allegations of wrong-doing. The nature of the Com- mittee's inquiry into these matters tends, quite properly, to be akin to the investigations conducted by Senate and Congressional committees in the past. We decided from the outset, however, that this committee is neither...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: (3) Where broad programs were closely reviewed (for example, the CIA's covert action programs) , the Committee sought to examine successes as well as apparent failures. (4) Programs were examined from Franklin Roosevelt's administration to the present. This was done in order to present the historical context within which intelligence ac- tivities have devel...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: totality of government ejfforts against dissenters over the past thirty years can one weigh the extent to which such an emphasis may "chill" legitimate free expression and assembly. The Select Committee has conducted the only thorough investigation ever made of United States intelligence and its post World War II emergence as a complex, sophisticated system...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: vestigation, the Committee has been refused access to files or docu- ments. These involve, among others, the arrangements and agreements made between the intelligence agencies and their informers and sources, including other intelligence agencies and governments. The Committee has agreed that in general, the names of agents, and their methods of conducting...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Of necessity, this country's intelligence agencies have played an important role in the diplomacy and military activities of the Jnited States during the last three decades. Intelligence infomiation has helped shape policy, and intelligence resources nave been used to carry out those policies. The fear of war, and its attendant uncertainties and doubts, has...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 11 Throughout its investigation, the Committee has carefully inquired into the role of presidents and their advisors with respect to particular intelligence programs. On occasion, intelligence agencies concealed their programs from those in higher authority, more frequently it was the senior officials themselves who, through pressure for results, created th...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ment that details about military activities, technology, sources of information and particular intelligence methods are secrets that should be carefully protected. It is most important that a process be devised for agreeing on what national secrets are, so that the reasons for nec- essary secrecy are understood by all three branches of government and the pu...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The Select Committee has scrupulously adhered to this agreement. The Interim Report on Alleged Assassination Plots Involving Foreign Leaders, the report on CIA activities in Chile, the report on illegal NSA surveillances, and the disclosures of illegal activities on the part of FBI COINTELPRO, the FBI's harassment of Dr. Martin Luther King, Jr., and other m...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Permanent institutions for the conduct of secret foreign and mili- tary intelligence activities are a relatively new feature of American government. Secure behind two oceans and preoccupied with the set- tlement ofa continent, America had no pennanent foreign intelligence establishment for more than a century and a half. In times of crisis, Americans improv...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: These organizations, and some of their offshoots, constitute the United States intelligence community. In theory at least, their opera- tions can be described in simple terms by the following cycle :
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: — These needs are translated into concrete "requirements" by senior intelligence managers. — The requirements are used to allocate resources to the "collectors" and serve to guide their efforts. — The collectors obtain the required information or "raw intelligence." — The "raw intelligence" is collated and turned into "finished in- telligence" bythe "analys...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: where in the Government, try to defend themselves against uncer- tainties in ways which militate against efficient management and accountability. Beyond this is the fact that the organizations of the intelligence community must operate in peace but be prepared for war. This has an enormous impact on the kind of intelligence that is sought, the way resources...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The evolution of the United States intelligence community since World War II is part of the larger history of America's effort to come to grips with the spread of communism and the growing power of the Soviet Union. As the war ended, Americans were torn by hopes for peace and fear for the future. The determination to return the nation promptly to normal was...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: We got on the outskirts of Berlin and yelled out "Ameri- kanski," and were highly welcomed. And as we went over the Autobahn the first basic impression I got, since I had known
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Germany well before the war, was a lon^ walking 2^oiip of German males under 16 and over 60 who were being shep- herded to the east by four-foot-ten, five-foot Mongolian sol- diers with straw shoes. The Russians also had been looting. With horses and farm wagons they were taking away mattresses, wall fixtures, plumbing fixtures, anything other than the fram...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: E. The Origins of the Postwar Intelligence Community * With the experiences of World War II and particularly Pearl Har- bor still vivid, there was a recognition within the government that, notwithstandino- demobilization, it was essential to create a central- ized body to collate and coordinate intelligence information. There was also a need to eliminate fr...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: — Nuclear weapons. The advent of nu'clear weapons and the Soviet potential in this field led to efforts to ascertain the status of the Soviet Union's nuclear program. By the time of the Soviet's first atomic explo- sion in 1949, the U.S. Air Force and Navy had begun a peripheral reconnaissance program to monitor other aspects of Soviet nuclear development a...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: mation of the intelligence community. As the 1950s gave way to the 1960s, large budgets for the development and operation of technical collection systems created intense competition among the military services and the CIA and major problems in management and condensation. To support the Director of Central Intelligence's task of coordinat- ing the activitie...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: While the United States' technical, military and intelligence capa- bilities advanced, concern intensified over the vulnerability of the newly independent nations of Africa and Asia to communist sub- version. And in the Western Hemisphere the establishment of a com- munist Cuba by Fidel Castro was seen as presaging a major incursion of revolutionary communi...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: medium and intermediate-range ballistic missile sites capable of han- dlino; nuclear weapons that could strike targets throughout significant areas of tlie T^nited States. As the United States moved towards a confrontation with the So- viet Union, U.S. intelligence played a significant role at every turn. Overhead reconnaissance of the Soviet strategic post...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: During the 1960s the U.S. intelligence community was dominated by two developments: First, the enormous exnlosion in the volume of technical intelligence as the research and development efforts of the previous period came to fruition; second, the ever-growing involve- ment of the United States in the war in Vietnam. The increase in the quantity and quality...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: dployments wliile tending to overestimate the qualitative aspects of Soviet weapons systems. Previously, intelligence analysts had to build up their picture of Soviet capability from fragmentary information, inference and speculation, particularly as to Soviet purposes. Con- fronted with the challenge to exploit the new sources of intelligence on Soviet pro...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Together, the advent of increased technical capabilities and the Viet- nam War brought to a climax concerns within the Government over the centralized management of intelligence resources. This coincided with increased dissatisfaction in tlie Nixon Administration over the quality of intelligence produced on the war and on Soviet strategic developments. In t...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The American intelligence community has changed markedly from the early postwar days, yet some of the major problems of that period persist. The intelligence community is still highly decentralized; the problem of maintaining careful command and control over risky secret activities is still great. There is a continuing difficulty in draw- ing a line between...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: As one attempts to analyze the difficulty and hopefully offer constructive suggestions for improvement, he finds much con- fusion existing within the system. It is clear that lines of autliority and responsibility have become blurred and indis- tinct. The National Security Council under the Act of 1947 is given the responsibility of directing our country's...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: that the characteristics of the Presidency — unity, secrecy, decision, dispatch — were especially suited to the conduct of diplomacy,^- As a consequence, historical development saw the President take charge of the daily conduct of foreign affairs, including the formulation of much of the nation's for-eign policy. But "sole organ" as to communications with f...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The executive branch relies in lar^e part on the President's own constitutional powers for authority to conduct such covert action.-*^ After the failure of the Bay of Pigs operation in 1961, the CIA asked the Justice Department for an analysis of the legal authority for covert actions. In its response, the Justice Department's Office of Legislative Council...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: of Pigs — illustrates the serious constitutional questions which arise. In that operation, the President in effect authorized the CIA to secretly direct and finance the military invasion of a foreign coinitry. This action approaclied, and may have constituted, an act of war. At the least, it seriously risked placing the United States in a state of war vis-d...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 1-50]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Prior to the 1047 National Security Act, Congress did not seek to ex])ressly authorize or regulate foreign intelligence activity by statute. Congress' decision not to act, however, did not reduce or eliminate its constitutional power to do so in the future. The Necessary and Proper Clause and its power to "make rules for the government and regula- tion" of...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: DCI's letter to the President occurred so late in the Defense Depart- ment budget cycle that the DCI had little opportunity to effect any sionificant changes. Thus, the DCI's national budget recommendations were for the most part the aggregate figures proposed by the vai-ious Defense agencies. The DCI did not proAade an independent calculated evalua- tion o...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ^^ In FY 1975, there were 69 KIQs. drafted by the DCI's National Intelligence Officers in consultation with the NSC Intelligence Committee working group. Approximately one-third of the KIQs dealt with Soviet foreign policy motivations and military technology. The other KIQs dealt with such issues as the negoti- ating position of the Arabs and Israelis, the...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Second, Colby's management scheme has met strong resistance from the collection and the production agencies. After one year it is difficult to identify many intelligence activities that have changed because of tlie IviQs. llie IviQ, K^trategy Keports were issued nine months after tlie IviQs and tended to list collection and production ac- tivities already u...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ^ DIA, "KIQ Collection Performance Report," 8/18/75. °^ In FY 1975, only 7 percent of DIA's attache reports responded to KIQs. Out of 2,111 attache reports against the KIQs only 34 of the 69 were covered. According to DIA, military attaches have access to particular types of information and it would be unfair to assume they had the capability to respond to...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: independent review of how well the community had answered the questions. Furthermore, NIOs did not base their evaluations on any specific kinds of information, such as all production reports or all raw intelligence collected on a particular KIQ. They commented on how well the agencies had carried out their commitments in the Strategy Reports without asking...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: "For example, DIA begins with the assumption that 60 percent of the De- fense attache budget goes for collection. This figure is then multiplied by the percentage of attache reports which responded to KIQs and the total cost ex- pended against the KIQs was calculated to be $1.3 million. In contrast, DDO calculates cost according to the IC Staff's recommende...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 95 assets in a balanced way ... as long as the DCI has special responsibility for the management of clandestine activities, that it tends to affect and to some extent contaminate his ability to be a spokesman of the commimity as a whole in- volving intelligence operations which are regarded as reason- ably innocent from the purview of American life. Compone...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Introduction ^ The current political climate and the mystique of secrecy surround- ing the intelligence profession have created misperceptions about the Central Intelligence Agency. The CIA has come to be viewed as an unfettered monolith, defining and determining its activities independ- ent of other elements of government and of the direction of American f...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: tional components reassigned to other government agencies, the exist- ence of OSS was important to the CIA, First, OSS provided an orga- nizational precedent for the CIA ; like OSS, the CIA included clandes- tine collection and operations and intelligence analysis. Second, many OSS personnel later joined the CIA; in 1947, the year of the CIA's establishment...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: activities? What accounts for the continued dominance of the clan- destine component within the Agency ? How have individual Directors of Central Intelligence defined their roles and what impact have their definitions had on the direction of the Agency? What impact did technological developments have on the Agency and on the Agency's relationship with the d...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The years 1946 to 1952 were perhaps the most crucial in deter- mining the functions of the central intelligence organization. The period marked a dramatic transformation in the mission, size and structure of the new entity. In 1946 the Central Intelligence Group (CIG), the CIA's predecessor, was conceived and established as an intelligence coordinating body...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ^ Requirements constitute the informational objectives of intelligence collec- tion, e.g., in 1947 determining Soviet troop strengths in iJastern Europe.
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: obstacles posed by the Departments prevented the DCI and the Agency from carrying out coordination of the activities of the depart- mental intelligence components. These problems appeared more stark following the outbreak of the Korean War in June 1950. Officials in the Executive branch and members of Congress criticized the Agency for its failure to predic...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: total personnel strength was 302 ; in 1952 it was 2,812 plus 3,142 over- seas contract personnel. In 1949 OPC's budget figure was $4,700,000 ; in 1952 it was $82,000,000. In 1949 OPC had personnel assigned to seven overseas stations; in 1952 OPC had personnel at forty-seven stations.* Apart from the impetus provided by the Korean War several other factors c...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: By 1953 the Agency had achieved the basic structure and scale it retained for the next twenty years. The Korean War, United States foreign policy objectives, and the Agency's internal organizational arrangements had combined to produce an enormous impetus for growth. The CIA was six times the size it had been in 1947. Three Directorates had been established...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Allen W. Dulles' impact on the Central Intelligence Agency was perhaps greater than that of any other single individual. The source of his influence extended well beyond his personal qualities and in- clinations. The composition of the United States Government, inter- national events, and senior policymakers' perception of the role the Agency could play in...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ^This did not include DDA budgetary allocations in support of DDP opera- tions.
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Washington policymakers regarded the Central Intelligence Agency as a primary means of defense against Communism. By 1953, the Agency was an established element of government. Its contributions in the areas of political action and paramilitary warfare were recog- nized and respected. It alone could perform many of the kinds of activities seemingly required...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: No one was more convinced that the Aarency could make a special contribution to the advancement of Ignited States foreign policy goals than Allen Dulles. Dulles came to the post of DCI in February 1953 with an extensive background in foreign affairs and foreign espionage, dating back to World War I. By the time of his appontment, his view of the CIA had bee...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: die of the decade the Agency was in the forefront of technological innovation and had developed a strong record on military estimates. Conceivably, Dulles could have used these advances as bureaucratic leverage in exerting some control over the community. He did not. Much of the reason was a matter of personal temperament. Jolly, gregarious, and extroverted...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Second, the DDP commanded the major portion of resources in the Agency. Between 1953 and 1961 clandestine collection and covert ac- tion absorbed an average of 54 percent of the Agency's total annual budget.*' Although this represented a reduction from the period of the Korean War, DDP allocations still constituted the majority of the Agency's expenditures....
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: proclaiming a "missile gap" between the United States and the Soviet Union. A final element contributed to the Agency's estimative capaJbility : material supplied by Oleg Penkovsky. Well-placed in Soviet military circles, Penkovsky turned over a number of classified documents relat- ing t/O Soviet strategic planning and capabilities. These three factors — t...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: From 1953 to 1961 a single Presidential administration and con- sistent American policy objectives which had wide public and govern- mental support contributed to a period of stability in the Agency's history. The internal patterns that had begun to emerge at the close of the Korean War solidified. The problems remained much the same. The inherent instituti...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The most significant development for the Agency in this period was the impact of technological capabilities on intelligence produc- tion. These advances resulted in internal changes and forced increased attention to coordination of the intelligence community. The costs, quality of intelligence and competition for deployment generated by technical collection...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ministraiton.^ The arrangement did not free the DCI from continuing involvement in Agency-related matters, particularly those concerning the Clandestine Service. The nature of clandestine operations, the fact that they involved and continue to involve people in sensitive, com- plicated situations, demanded that the Agency's senior officer assume responsibil...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ences of theactivities. clandestine Executive branch dictated the Agency's emphasis in Evidence of Communist guerrilla activities in Southeast Asia and Africa convinced Kennedy and his closest advisers of the need for the United States to develop an unconventional warfare capability. "Counterinsurgency," as the U. S. effort was designated, aimed at preventi...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: leadership group within the Agency. By 1970, the first generation of Agency careerists was beginning to reach retirement age and vacancies were opening in senior-level positions. In poth the DDP and the DDI, many of those positions were filled by individuals who had distin- guished themselves in Southeast Asia-related activities. In the Clande- stine Servic...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: D. The Recent Past: 1971-1975 The years 1971 to 1975 were a period of transition and abrupt change for the CIA. The scale of covert operations declined, and in the Execu- tive branch and at the senior level of the Agency growing concern developed over the quality of the intelligence product and the manage- ment of the intelligence community's resources. How...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: and international economic movements. The real impetus for this change came in August 1971 with the U.S. balance of payments crisis. Since that time, and with subsequent international energy problems, the demands for international economic intelligence have escalated dramatically. The Agency's technological capabilities have made a sustained con- tribution...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: — Growth in the range of American foreicrn policy interests and the DDI's response to additional requirements have resulted in an increased scale of collection and analysis. Rather than rectifying the problem of duplication the Agency has contributed to it by becoming yet another source of intelligence production. The DDI's size and the administrative proce...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Authority for covert action cannot be found in the National Secu- rity Act. The Committee finds that the executive branch should have approached Congress for authority for the CIA to engage in such activities, particularly where they involved the use of force. At the same time, Congress should have acted in response to well-publicized instances of covert ac...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: While the National Security Act of 1947 authorizes correlation, evaluation, and dissemination of national security intelligence by the CIA, nowhere does it specify that the Agency is authorized to engage in the direct collection of intelligence. As its authority to engage in direct collection, the CIA has relied upon Section 102(d) (4) and (5) of the Act,^^...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ^* Memorandum from the CIA General Counsel to the Director. 5/7/48 : memo- randum from the CIA General Counsel to the Deputy Chief for Foreign Intelli- gence, 4/14/61.
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: witnesses.^ General Hoyt S. Vandenberg, then Director of Central Intelligence, suggested centralized collection to the Senate Committee on the Armed Services,^ and other executive branch personnel who participated in the preparation of the Act have stated that the Senate committee discussed the proposal.* In addition, a 1961 memorandum by CIA General Counse...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ^ Transcript. House Committee on Expenditures in the Executive Departments, Hearings on H.R. 2319, 6/27/47 (liereinafter cited as House transcript), pp. 10-19, 53-55. 79^86. 111-112, 118-125, 134-135. 159-164. "Testimony of General Hoyt S. Vandenberg, Director of Central Intelligence (unsanitized, now declassitfied ) , Senate Armed Services Committee, Heari...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Little more was said in public. Diirino; the House floor debates. Rep. Biisbey, a member of the Committee on Expenditures, expressed ob- jection to clandestine collection bv the CIA and said he hoped the bill would be amended to prohibit snch activity.^" No such amendment was adopted, however, and Rep. Holifield, another member of the com- mittee, later rem...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Thegence." remarks of Representatives Bnsbey and Holifield indicate that it was anticipated that the authority conveyed bv the bill extended to clandestine collection by the CIA. Still later in the floor debate, how- ever. Rep. Patterson stated that while he clearly wanted "an inde- pendent intelligence agency, working without direction by our armed service...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: Covert action is defined as clandestine activity designed to influence foreign governments, events, organizations or persons in support of U.S. foreign policy conducted in such a way that the involvement of the U.S. Government is not apparent. In its attempts directly to influence events it is distinguishable from clandestine intelligence gathering — often...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: ods, and yields an intelligence product. It must be noted, however, that the chief purpose of these operations is not to gather intelligence, and that many covert actions, such as the invasion of the Bay of Pigs, have only the most limited relationship to "intelligence affecting the national Given security." the fact that some of the actions which the CIA h...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: propaganda ; economic warfare ; preventive direct action, in- cluding sabotage, anti-sabotage, demolition and evacuation measures; subversion against hostile states, including assist- ance to guerrilla and refugee liberation groups, and support of indigenous anti-Communist elements in the threatened countries of the free world.^^ Under the authority of 50 U...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: All of this occurred prior to enactment of the Central Intelligence Agency Act in 1949. As noted previously, the CIA Act included pro- visions the clear purpose of which was to protect the security of secret operations. What is not clear is whether these operations were meant by the Congress to include covert action as we now understand the term. By 1948 th...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: 48.'^ Vandenberg, House Armed Services Committee Hearings on H.R. 5871, 4/8/ "* It was remarked in the House debates, however, in the context of a discus- sion of intelligence gathering that "in spite of all our wealth and power and might we have been extremely weak in psychological warfare, notwithstanding the fact that an idea is perhaps the most powerful...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: to a few members of a few committees of Congress. Small subcom- mittees ofthe Armed Services and Appropriations Committees in each House were briefed to some extent on these activities until 1974, when the Foreign Assistance Act was amended to require that six com- mittees of Congress be informed with respect to those foreign activ- ities of the CIA which a...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The Huo;]ies-Ryan Amendment was cited by the Special Counsel to the Director of the Central Intelligence Ao^ency when he appeared before the House Select Committee on Intelligence to argue that Con- gress has "both acknowledged and ratified the authority of the CIA to plan and conduct covert action." He said that the provision "clearly implies that the CIA...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: The record shows that the CIA has engaged in a variety of clandes- tine collection programs directed at the activities of Americans within the United States. Some of these activities have raised constitutional
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: questions related to the rights of Americans to engage in political activity free from government surveillance. But they have also raised questions about (1) the authority of the CIA, under its charter, to collect and use information about Americans, and (2) the extent to which the specific statutory prohibition on police and internal security functions by...
- Suggestion: Review OCR/transcription around this passage.

#### `church-committee-foreign-military-intelligence-book-one` / `text_broken_hyphen`

- Import: `data/latin-america-import`
- Field: `document_sections[Transcript, pages 101-150]`
- Title: Foreign and Military Intelligence: Church Committee Final Report, Book I
- Excerpt: have no "police power or anything else within the confines of this coun- try," ^^ and that it was "supposed to operate only abroad." ^^ This view was reiterated in the legislative history of the Central Intelligence Agency Act of 1949. The following exchange took place between Kep. Holifield and Rep. Sasscer of the House Committee on the Armed Services, whi...
- Suggestion: Review OCR/transcription around this passage.

_Report truncated to first 500 issues; full data is in `archive-quality-report.json`._
