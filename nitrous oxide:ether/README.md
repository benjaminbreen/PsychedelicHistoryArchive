# Anesthetic Revelation Corpus

This repository contains a small historical text corpus about what William
James called "the anaesthetic revelation": altered states, mystical or
metaphysical insight, dream reports, and painlessness associated with nitrous
oxide, ether, chloroform, and related anesthetics before 1930.

The immediate goal is to support a historical language-model dataset. The
corpus is intentionally split into two layers:

- `texts/`: broader source texts and context works.
- `texts/first_hand/`: focused first-person or near-first-person reports.

For fine-tuning on "trip report" style material, start with
`texts/first_hand/manifest.jsonl`, not the full `texts/manifest.jsonl`.

## Directory Layout

- `texts/*.txt`: full or substantial source texts.
- `texts/manifest.jsonl`: one JSON record per broad source text.
- `texts/schema.json`: field descriptions for `texts/manifest.jsonl`.
- `texts/first_hand/*.txt`: extracted first-hand or near-first-hand reports.
- `texts/first_hand/manifest.jsonl`: one JSON record per focused report.
- `texts/first_hand/schema.json`: field descriptions for the first-hand manifest.
- `ingest_anesthetic_revelation.py`: downloads and cleans the broader corpus.
- `build_first_hand_reports.py`: extracts or assembles the first-hand subset.

## What Is In The First-Hand Subset

The first-hand subset currently has 9 records:

1. Humphry Davy's nitrous oxide trance, including "Nothing exists but thoughts."
2. Benjamin Paul Blood's core 1874 "Anaesthetic Revelation" section.
3. William James's 1882 "Subjective Effects of Nitrous Oxide."
4. The anonymous 1898 Oxford dental nitrous report published by James.
5. Xenos Clark's anaesthetic revelation letter quoted by James.
6. Ether dental-patient dream reports from Bigelow's 1846 article.
7. Horace Wells's nitrous oxide tooth-extraction report.
8. William T. G. Morton's ether self-experiment.
9. James Young Simpson's chloroform self-experiment circle.

Records are tagged with:

- `report_type`: `authored_first_person`, `quoted_first_person`,
  `reported_first_person`, or `interpretive_retrospective`.
- `state_phase`: induction, peak, coming-to, retrospective, or combinations.
- `substance_certainty`: `known`, `probable`, or `ambiguous`.
- `verification_status`: a short provenance/QA label.
- `include_for_training`: whether the item is suitable for the first-hand subset.

## Dataset Review Notes

The JSONL files and schemas have been validated for parseability and key
coverage. Each manifest record points to an existing local text file, and the
stored character counts match the current files.

Known issues and cautions:

- The Blood 1874 text comes from Internet Archive OCR and has visible OCR
  errors. It is historically central, but should be corrected before high-stakes
  quotation or publication.
- The James 1898 "Consciousness Under Nitrous Oxide" item is valuable, but its
  current transcription needs primary-page verification against *Psychological
  Review* 5(2):194-196 before treating it as authoritative. It is currently
  marked `include_for_training: false`.
- Wells, Morton, and Simpson are first-hand or near-first-hand reports quoted in
  a later public-domain history. They are useful for training, but their
  `report_type` and `verification_status` distinguish them from direct authored
  texts.
- Bigelow's patient reports are not authored by the patients. They are quoted or
  reported utterances after ether anesthesia and are tagged
  `reported_first_person`.
- The broader `texts/` layer includes philosophical and medical context works
  that are not all trip reports. Use the first-hand manifest for experiential
  material.
- Project Gutenberg boilerplate is stripped during ingestion; short source
  headers are added locally for provenance.

