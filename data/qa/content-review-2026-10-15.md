# Content review: machine-voice prose, incomplete records, collection gaps

Reviewed 15 October 2026 against the live Supabase database: 116 documents (112 published), 4 biographies, 1 collection, 141 topics. Every summary, abstract, editorial note and non-transcript section was read by hand, about 20,000 words in all. Transcript bodies were spot-checked, not proofread.

Document `editorial_note` is **not** rendered on public source pages; only the bibliography, era and biography pages show their own notes. The production-log language in those notes ("haiku-corrected," "the agent's own," script names) is therefore internal. It is a low priority, but it should be cleaned before any public "notes" tab is added. Summaries, abstracts and `document_sections` (source notes, introductions, context essays) **are** public, and those are the focus below.

---

## 1. Highest-priority fixes

| Record | Problem |
|---|---|
| `ketchum-human-assessment-ea1729-inhalation-1964` (draft) | Summary belongs to a different record. It describes Judge Young's 1986 MDMA ruling, not the 1964 Edgewood inhalation report. |
| `veigl-ayahuasca-jyhs5-m8ty7` (*The Hasheesh Eater*) | Summary has a factual error typical of machine text: it says the book is compared to De Quincey "due to its detailed depiction of the author's opium addiction." Ludlow's book is about cannabis; the opium addiction is De Quincey's. |
| `mead-lsd-memo`, Historical Context essay | Says the Macy "Problems of Consciousness" conferences were ones "which Mead chaired." As far as I know, Abramson chaired and edited that series, and Mead took part; please verify. The essay also merges that series with the separate Macy cybernetics conferences (1946–53). There is a typo, "were the one of the crucibles." Abramson links to `/topics/harold-abramson` here and in the source note, but the summary uses `/biographies/harold-abramson`. |
| 5 of 7 audio/video records | No player and no media file. Their only `source_url` and external link point back to the old Squarespace site (`psychedelicarchive.com/archive/...`), so they will dead-end when that site goes away. Affected: Ginsberg/Adams 1965, both Sidney Cohen UCLA talks, Peter the dolphin, MER-17/Frenquel film. |
| `villavicencio-ayahuasca-geografia-ecuador`, public Introduction | Internal collection-planning language visible to readers: "Although slightly later than the underfilled 1800-1850 bucket… helps shift the archive away from twentieth-century English-language sources." |
| `jean-bassett-johnson-…-1939`, `osmond-smythies-…-1952`, `leary-metzner-alpert-…-1964`, `sf-oracle-houseboat-summit-1967`, `kleps-boo-hoo-bible-…-1971` | The public source note says "The text of this source stays with its publisher; this record describes and links to it," but each summary says "Hosted here is a fair-use excerpt," and each record does host one. One of the two statements is wrong on every page. |
| Boilerplate "One reading is doubtful **in the scan**" | Appears on records that have no scan: Native American Church articles (copied from a web page), the Harvard Crimson (site data), and external-link-only records. The template needs a non-scan variant. |

---

## 2. AI-voice ("slop") prose on public pages

A lexical scan for the usual markers (delve, tapestry, testament, pivotal, nuanced, "offers a window," and so on) found few hits. The machine voice in this archive shows up in a few recurring forms instead.

### 2a. Squarespace-era summaries (needs a rewrite pass)
These pages look unfinished because the summary is a pasted transcript opening, a generic "Background:" paragraph, or a stub:

- **Pasted transcript openings used as the summary:** `veigl-ayahuasca` (starts mid-passage, "They usually strive for the rank of Curácam…"), `veigl-ayahuasca-jyhs5` (James, opens with "NOTE — Since the manuscript…"), `veigl-ayahuasca-jyhs5-m8ty7-hemp9` (1893 cannabis, ends with a colon), both Sidney Cohen talks.
- **Generic AI background paragraph:** `leary1969`: "an especially charged moment," "emblematic of the clash between the establishment and the counterculture," "circus-like spectacle." It says nothing about Leary's testimony itself.
- **Promotional adjective:** `lettherebelight`, "a groundbreaking 1946 documentary"; it also has stray spaces in "“ narcosynthesis ”".
- **Fragment stubs:** `drugfilledchalice` ("Complete title: …"), `psychoanalysis1957` ("Originally published in Spanish as…"), `blog-post-title-one-t2tym` ("The Orlando Sentinel (September 17, 1962), no author attributed").
- `1966-sidney-cohens-ucla-speech-on-psychedelics-59kzr`: the quoted summary reads "permits us to experience **anesthesias**." This is almost certainly *synesthesias*, a transcription error.
- `1965-allen-ginsberg-…`: typo "recored." Title casing reads "Allen Ginsberg DIScusses lsd with dr. Joe K. Adams."

### 2b. Nitrous oxide/ether corpus (10 records): internal planning voice
These summaries read like notes from a research manifest, not reader-facing description:

- "James's mature pluralism, downstream of the nitrous oxide/Blood problem and **useful for modeling the philosophical uptake**." (`a-pluralistic-universe`)
- "**completing the arc** from anesthetic revelation to pluralistic mysticism" (`a-pluralistic-mystic`)
- "**Compact historical frame** for nitrous oxide, ether, chloroform… before 1930" (`anaesthetics-antient-and-modern…`)
- "The text that gave James the phrase and problem" (`the-anaesthetic-revelation…`)

All 10 are published, but their own notes say "metadata needs review before publication." All lack a region. Several host entire books as a single page of OCR: *Varieties of Religious Experience* is about 1.09M characters, Davy's *Researches* about 574k. The summaries point to specific lectures or passages, so these should be cut to the relevant excerpt, with the full scan linked.

### 2c. July 2026 staged "Introduction" notes (14 records): mild template voice
The prose is serviceable, but it shares one evaluative template that departs from the house style ("identify, contextualize, clarify"):

- "one of the earliest / clearest / classic … accounts" appears in nearly every note.
- "The passage is **especially useful because** it links preparation, nasal apparatus, missionary vocabulary, and comparison with curupa" (Humboldt), with a stacked noun list each time.
- "valuable for the archive because…" (Villavicencio)

Suggested fix: replace the self-evaluation with the one fact the reader needs. For example, "Humboldt observed niopo among the Otomac at Uruana in 1800; this is the source later ethnobotanists cite for…" works better than "one of the earliest… especially useful because…"

The same 14 records also show the "historical-context essay is open for contribution" placeholder. That is fine as a design choice, but 14 identical calls for contributors make the archive look unfinished. Consider hiding the empty section and keeping the invitation in the issue form.

### 2d. Light machine cadence in otherwise good entries
- `chavin-de-huantar`: "The site is **not simply** a temple building: it is…"; "Its psychedelic dimensions are **not based on** speculative ancient-mystery literature: they rest on…"; "This combination matters historically because…". Two "not X but Y" turns in a short entry. Trim one.
- `mead-lsd-memo` essay (under your byline, so your call): "brilliant cultural anthropologist," "challenges the conventional chronology," "To understand this document, one must look beyond…," "this striking, evocative, and complex document also **stands as a testament to**…," "**captures** Margaret Mead at the height of her powers." These are the densest AI markers on the site.
- `cueva-del-chileno` abstract: stray space in "specialized ritual pharmacology ."

---

## 3. Errors and inconsistencies found while reading

- **Slugs that don't match the record:** *The Hasheesh Eater*, the James nitrous note and the 1893 cannabis article all sit under `veigl-ayahuasca-*` slugs. Others: `blog-post-title-one-t2tym`. `recording-of-the-dolphin-peter-after-being-given-lsd-1965-april-19` is dated March 2, 1966; "April 19, 1965" looks copied from the Cohen talk. `1966-sidney-cohens-ucla-speech-on-psychedelics` is dated 1965. Renaming these needs redirects.
- **Duplicate-looking Cohen records:** two UCLA talks (Feb 24 and Apr 19, 1965), one titled "on ESP" under a slug saying "on-psychedelics." Confirm these are two separate events.
- `lsd-lettvin-vs-leary`: display date is November 20, 1967, but the summary and overview say the debate was in May 1967. If November 20 is the NET broadcast date, say so in the display date.
- `sim-clinical-investigation-ea1729-1961`: the summary dates the Fort Bragg field tests to September 1958, but the internal note says the report prints "9 September 1959." Check this against the report.
- **Document types:** CIA IG report, CIA IG memo and Army IG report are typed "Testimony"; the *Psychedelic Review* issue is typed "Academic Article"; Commissioner of Indian Affairs annual reports are typed "Field Notes." All court cases and statutes are typed "Source"; separate "Legal/Court decision" and "Government report" types would help filtering.
- **Biographies:** `allen-ginsberg` is a draft whose dek is "test" and whose body is "he was a poet"; delete it or write it. There is an unused `final biography entry_ Dr. Salvador Roquet (1).pdf` in the repo root, and Roquet is central to the Latin America material.
- `1600-test-yEWgi` (draft): test record, delete it.

---

## 4. Records missing key components (published only, n = 112)

| Gap | Count | Notes |
|---|---|---|
| No topic links | **81** | Topics exist (141) but most sources aren't attached to any, including nearly all pre-1970 material. The biggest structural gap. |
| Own note says "needs metadata review" | 24 | All 14 Squarespace imports plus all 10 nitrous-corpus records. |
| Summary missing or under 20 words | 16 | The nitrous corpus, Squarespace stubs and all three PIB issues. |
| Historical-context placeholder only | 14 | July 2026 staged batch plus the three federal MKULTRA/Church/Rockefeller reports. |
| No region | 22 | The nitrous corpus and Squarespace imports. |
| Audio/video without playable media | 5 of 7 | See §1. |
| No thumbnail | 3 | 1893 cannabis article, dolphin recording, Cohen (Apr 1965). |
| No citation | 2 | `lettherebelight`, `blog-post-title-one-t2tym`. |
| PIB issues (32–34) | 3 | No tags, no people (not even Lisa Bieberman), no OCR text pages, one-line summaries. |

People: 148 person records but only 3 published biographies, all from the Mead memo. Bibliography: 20 items. Collections: 1.

---

## 5. Suggested sources to add

These come from my own knowledge, not a search, so check citations before staging. Rights flags: **PD** = US public domain (federal works, or published before 1931); **©** = likely in copyright, so make it a describe-and-link record or use a short excerpt; **?** = needs a renewal check.

The current spread is heavy on the US (about 40 records), English (87 of 112) and 1890–1970. It is thin on the 1980s–2010s (7 records), Africa (1), Asia outside Siberia (2), women's voices, and Indigenous people speaking for themselves.

### Early modern and pre-modern (strengthen the 1500–1800 run, 8 records now)
1. **Edict of the Mexican Inquisition against peyote, 1620.** The foundational prohibition text, and a natural pair with Ruiz de Alarcón. PD.
2. **Pablo José de Arriaga, *Extirpación de la idolatría del Pirú* (1621)**: Andean vilca and huaca practices; the Andean counterpart to the New Spain anti-idolatry material. PD.
3. **Bernabé Cobo, *Historia del Nuevo Mundo* (1653; publ. 1890–95)**: vilca/cebil snuff and Andean plants. PD.
4. **Philip Johan von Strahlenberg, *Das Nord- und Ostliche Theil von Europa und Asia* (1730; Eng. 1736)**: the first Western report of fly-agaric urine-drinking, and the source Krasheninnikov and Goldsmith build on. PD.
5. **Oliver Goldsmith, *The Citizen of the World*, Letter 32 (1762)**: the "Tartars of Koraki" mushroom-urine satire; shows Siberian reports reaching English literature. PD.
6. **Linnaeus (resp. Alstrin), *Inebriantia* (1762)**: the first systematic botanical classification of intoxicants. Latin, PD; fits the Bibra/Cooke comparative line.
7. **Shennong Bencao Jing** on *mafen* (cannabis fruit/flowers) "makes one see demons," with a later commentary. Fills the China gap. PD (translation needed).
8. ***Konjaku monogatari shū* (c. 1120), the tale of the dancing nuns and the "laughing mushroom."** Japan's best-known premodern mushroom-intoxication story. PD text; translation needed.

### Nineteenth century
9. **Silvestre de Sacy, "Mémoire sur la dynastie des Assassins" (1809)**: the source of the hashish/assassin etymology, ripe for a contextual note. PD.
10. **Théophile Gautier, "Le Club des Hachichins" (*Revue des Deux Mondes*, 1846)**: pairs with Moreau, since the club met under Moreau's sponsorship. PD.
11. **Charles Baudelaire, *Les Paradis artificiels* (1860)**: the hashish half. PD.
12. **Louis Lewin, "Ueber Anhalonium Lewinii" (1888)** and **Arthur Heffter, "Ueber Pellote" (1898)**: the pharmacological discovery of peyote and the isolation of mescaline. Both cited in existing records; neither present. PD.
13. ***Report of the Indian Hemp Drugs Commission* (1893–94)**: a huge colonial inquiry with witness testimony across South Asia. Excerpt the religious-use and "insanity" evidence. PD.
14. **Carl Lumholtz, *Unknown Mexico* (1902)**: Rarámuri (Tarahumara) and Wixárika (Huichol) peyote. Rebalances the Plains-centered peyote material. PD.

### Africa (1 record now)
15. **Dybowski & Landrin, iboga alkaloid isolation, *Comptes rendus* (1901)**, the follow-up to Griffon du Bellay. PD.
16. **Howard Lotsof, US Patent 4,499,096 (1985), ibogaine for opioid withdrawal**: links iboga to the 1980s–2020s addiction story. PD.
17. A **Bwiti ethnography** excerpt from an early twentieth-century French source, or a record pointing to James Fernandez, *Bwiti* (1982) (©).

### Indigenous voices and women's voices
18. **Zitkala-Ša (Gertrude Bonnin): testimony at the 1918 H.R. 2614 hearings, plus her 1916 anti-peyote writing.** She testified, but the current hearings excerpt leaves her out. She was a Yankton Dakota woman who opposed peyote, which complicates the archive's otherwise pro-NAC narrative. PD.
19. **Ruth Shonle, "Peyote, the Giver of Visions," *American Anthropologist* (1925)**: an early woman anthropologist's synthesis of peyote diffusion. PD.
20. **Valentina Pavlovna Wasson, "I Ate the Sacred Mushroom," *This Week* (May 19, 1957)**: the companion to R. Gordon Wasson's *Life* article, already in the archive. ?
21. **Eunice Pike & Florence Cowan, "Mushroom Ritual versus Christianity," *Practical Anthropology* (1959)**: the Summer Institute of Linguistics missionaries in Huautla before and after Wasson. ?
22. **María Sabina.** A describe-and-link record for Álvaro Estrada, *Vida de María Sabina* (1977) (©), and/or Folkways' *Mushroom Ceremony of the Mazatec Indians of Mexico* (1957 LP). The archive currently has no Mazatec voice.
23. **Thelma Moss ("Constance Newland"), *My Self and I* (1962)** or **Adelle Davis ("Jane Dunlap"), *Exploring Inner Space* (1961)**: women's LSD-therapy memoirs from the Los Angeles scene. © (describe-and-link).

### Clinical research, 1950–1970 (thin outside the US and the military)
24. **Busch & Johnson, "L.S.D. 25 as an Aid in Psychotherapy" (1950)**: the first American LSD therapy paper. ?
25. **Sandison, Spencer & Whitelaw (Powick Hospital), *J. Mental Science* (1954)**: the start of British LSD psychotherapy. ©
26. **Colin Smith / Hoffer & Osmond, Saskatchewan LSD alcoholism trials (1958–59)**: Weyburn is a major gap. ?
27. **Stephen Szára, DMT self-experiments, *Experientia* (1956)**: Budapest, the first DMT psychopharmacology, and an Eastern Bloc entry point. ©
28. **D. Ewen Cameron, "Psychic Driving," *Am. J. Psychiatry* (1956)**: the Allan Memorial and MKULTRA Subproject 68 Canadian story. ?
29. **Walter Pahnke, *Drugs and Mysticism* (Harvard PhD, 1963)**: the Good Friday Experiment. ?
30. **Leary et al., "A New Behavior Change Program Using Psilocybin" (1965)**: the Concord Prison Experiment, to pair with the Crimson article. ©
31. **Christopher Mayhew, "An Excursion out of Time," *The Observer* (1956)** and the unbroadcast 1955 BBC *Panorama* mescaline film. ©

### Policy and law, 1965–1990
32. **1966 Senate hearings.** Leary's (May 13, 1966) and Ginsberg's (June 14, 1966) testimony before Dodd's special Judiciary subcommittee, printed in *The Narcotic Rehabilitation Act of 1966*. Correction: the senator who questioned Leary was Edward M. Kennedy, not Robert. This would be the archive's best single federal-hearings addition and pairs with the existing Ginsberg audio. PD.
33. **Drug Abuse Control Amendments (1965), the Controlled Substances Act (1970)** and the **UN Convention on Psychotropic Substances (1971)**: the legal backbone the existing court cases depend on. PD (UN text freely available).
34. **Leary v. United States (1969)** and **United States v. Stanley (1987)**: the second is a soldier secretly given LSD at Edgewood who sued, a good fit for the military material. Both PD.
35. **DEA emergency scheduling of MDMA, 50 Fed. Reg. 23118 (1985)**: completes the Young opinion → *Grinspoon* sequence. PD.
36. **Canada's Le Dain Commission, *Interim Report* (1970)**, ?, and **Nixon's "public enemy number one" remarks (June 17, 1971)**, PD.

### 1990–2026 (7 records now)
37. **Peru, Resolución Directoral Nacional 836/INC (2008)**, declaring traditional ayahuasca knowledge national cultural heritage, and **Brazil, CONAD Resolução 1/2010** on religious ayahuasca use. These pair with *O Centro* and *Santo Daime*. Government texts.
38. **Denver Initiative 301 (2019)** and the **Oakland City Council decriminalization resolution (2019)**: the municipal wave between *O Centro* and Oregon. Public.
39. **FDA Psychopharmacologic Drugs Advisory Committee, MDMA/Lykos meeting (June 4, 2024)**: transcript and briefing documents, the hinge between the Oregon and 2026 FDA records. PD.
40. **Australia TGA rescheduling decision (Feb. 2023)**: the first national medical-psilocybin/MDMA authorization. Public.
41. Describe-and-link records for **Griffiths et al. 2006 (Hopkins psilocybin)**, ©, and **Carhart-Harris et al. 2016 (*Lancet Psychiatry*)**, open access CC BY. The "renaissance" literature is currently absent.

### Latin American and archive-internal
42. **Salvador Roquet biography** (the draft PDF in the repo root) and a source record for his psychosynthesis work.
43. **Rafael Zerda Bayón's "telepatina" writings (c. 1905–15; verify exact title)**: cited in two existing records but not present. PD.

---

## Suggested order of work
1. §1 fixes, about an hour of CMS edits.
2. Rewrite the 14 Squarespace summaries and the 10 nitrous-corpus summaries, then clear their "needs review" notes.
3. Bulk-attach topics to the 81 unlinked sources. This is probably scriptable from existing tags, as `topics:seed` did.
4. Fix or embed media for the 5 audio/video records before the Squarespace site is retired.
5. Start additions with the PD federal and pre-1931 items (1–6, 9–14, 18–19, 32–35, 39), which can be hosted in full.

---

## Changes applied (15–16 October 2026)

Every database edit was logged to `content_revisions` with a change note, keeping the before-data where a row was modified.

- **Nitrous oxide/ether corpus.** These records had been loaded from a language-model training corpus: each held a whole raw book file (including library stamps and Gutenberg boilerplate) and used corpus notes as summaries. Seven records now host focused excerpts, saved in `data/nitrous-ether-import/excerpts/`, with real summaries, citations, publishers, regions, and scan links. Blood's 1874 pamphlet and *Pluriverse* were hand-corrected from noisy OCR. Three records were unpublished and redirected: two duplicates of the 1882 James note, and *A Pluralistic Universe*, which contains no nitrous material.
- **Squarespace imports (13 records).** Each was reviewed against its hosted text, and its "needs metadata review" note was cleared. They now have new summaries, citations, regions, and readable slugs. Fixes along the way: Ludlow's opium error, the generic background paragraph on the Leary testimony, "Background: TK," and *anesthesias* → *synesthesias*. The Cohen 1966 lecture and the Lilly dolphin tape had swapped dates, now corrected from UCLA's and Stanford's catalog records.
- **People.** The `bebreen@ucsc.edu` person was removed from five records and replaced with real people (Huston, Ginsberg, Adams, Orlovsky, Fabing, Lilly). The two Timothy Leary entries were merged, and names that included birth and death years were cleaned up.
- **Audio/video.** Embeds added for both Cohen lectures (UCLA Drasnin Archive on YouTube), the MER-17 film (National Archives via the Internet Archive), and the dolphin tape (Stanford SDR). Still missing: the Ginsberg–Adams tape, which has no public audio URL.
- **Edgewood report.** Wrong summary replaced; Ketchum and Aghajanian linked as authors.
- **July 2026 batch.** All 14 introductions rewritten in plainer language; Sahagún summary simplified.
- **PIB issues 32–34.** Summaries written from the PDFs; Bieberman, Osmond, Huxley, Cohen, and McGlothlin linked; tags added.
- **Topics.** 18 curated topics created or published, with real descriptions written for the existing 17. All 109 published sources now link to at least one published topic (35 published topics in all).
- **Slugs.** 16 legacy slugs now 308-redirect via `archive-site/src/lib/legacy-slugs.ts`. The hardcoded Ginsberg title override in `supabase-archive.ts` was removed.
- **Biography.** Salvador Roquet published from the team's draft PDF, with prose tightened and footnotes repaired.
- **New sources (9).** Added from reviewed drafts in `data/draft-sources/`:
  - The 1620 Inquisition edict against peyote
  - Strahlenberg on Koryak fly-agaric use (1736)
  - Lewin, "Ueber Anhalonium Lewinii" (1888)
  - Heffter, "Ueber Pellote" (1898)
  - Zitkála-Šá's 1918 peyote testimony
  - Leary's and Ginsberg's 1966 Senate testimony
  - The DEA's 1985 emergency scheduling of MDMA
  - The FDA advisory committee's 2024 MDMA votes

  The three translations, of the edict, Lewin, and Heffter, were drafted with AI and are labeled "Machine translation" pending human review. The Indian Hemp Drugs Commission was skipped under the draft-sources scope rule, which excludes cannabis-only sources. Valentina Wasson's 1957 article is not done, because its copyright status is unverified.
