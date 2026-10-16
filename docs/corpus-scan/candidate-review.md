# Candidate review: from scan hits to archive nominations

The scan (`runbook.md`) produces excerpt windows. This stage turns them into a
ranked queue of **documents** for Ben to review in `/admin/candidates`. Each
"add" becomes a nomination for the normal draft workflow. Each "no" carries a
reason, which retrains the ranker and tunes the term list.

```
hits/*.jsonl.gz ──► group by document ──► cluster reprints ──► features + scores
      (scan)          (one card each)       (keep earliest)     relevance · kind · novelty · feasibility
                                                                      │
   decisions.jsonl ◄── /admin/candidates ◄── candidates.jsonl ◄── priority + 20% exploration
         │                (Ben)                (one batch)
         └──► retrain ranker each ~50 decisions · tune terms.toml from reject reasons
         └──► "add" → nominations → data/draft-sources (completion)
```

Defaults agreed on 2026-10-16. Each can be changed later.

- **Where review happens:** a local, file-backed CMS route, `/admin/candidates`.
- **Canonical texts** (De Quincey, Baudelaire, Moreau, Ludlow, Taylor and so on):
  shown, but demoted.
- **Passing mentions:** kept, but scored lower. Ben's `passing_mention`
  rejections teach the ranker where the line is.

## 1. Unit of review: the document

- **Grouping.** All windows from one `(dataset, source_file, row)` form one
  candidate. The card shows the best window first, and the others are expandable.
- **Reprint clustering.** Newspaper candidates whose best windows are
  near-duplicates are merged into one cluster: MinHash over 5-word shingles,
  Jaccard ≥ 0.5. The earliest-dated member (then the longest) is the
  representative. `reprint_count` and the member identifiers are kept,
  because a story's spread is itself evidence.
- **Book duplicates.** Several scans of the same book usually share
  title+creator, so these are merged the same way.

## 2. Scores (each 0–1, all stored, so ranking can be re-weighted without recomputing)

| Score | What it measures | Bootstrap (no paid calls) | Full pipeline |
|---|---|---|---|
| `relevance` | Is this about psychedelics/altered states in the archive's sense? | Distinct strong terms, presence of context terms, penalty for `digit_frac` | Mean top-5 cosine to archive seed passages, minus cosine to junk seeds (indexes, materia medica lists, adverts) |
| `kind` | How likely it is to be a substantive primary account rather than a passing mention | Heuristics: first-person density, window count, ad and index cues | Luna label → weight (first-person experience 1.0, ethnographic 0.9, policy/legal 0.8, clinical 0.7, literary 0.6, passing mention 0.2, reference/index 0.05, advert 0.05) |
| `novelty` | Not already in the archive and not a famous canonical text | Fuzzy title/creator match against archive documents, drafts and bibliography; canonical list | Same, plus embedding similarity to existing archive documents |
| `feasibility` | Can it actually be completed? | Has a resolvable source link; public domain; adequate length | Plus Luna `ocr_quality` |

```
priority = relevance^1.0 × kind^0.7 × novelty^0.5 × feasibility^0.3
```

This formula is used until about 100 decisions exist. After that, `model_p`
takes over: a logistic regression on the embedding plus the score features,
trained on Ben's decisions, where add = 1, maybe = 0.5 and no = 0. It is
retrained after every ~50 new decisions:

```
priority = model_p × novelty^0.5
```

Novelty stays outside the model, so that "already known" can never be learned
as "good".

## 3. Queue composition

Each batch of about 50 cards is built as follows:

- **80% exploit:** the highest `priority` cards not yet decided.
- **20% explore:** cards drawn at random from the middle of the ranking,
  stratified by language × decade × substance group. Under-reviewed strata are
  preferred, along with cards where the model is least certain
  (`model_p` ≈ 0.5).

Each card records its lane (`exploit` or `explore`) and why it was picked.
Explore cards keep the ranker from collapsing onto one genre, and they give
unbiased estimates of the hit rate.

## 4. Decisions, with informative "no"s

Each decision is **add**, **maybe** or **no**, with zero or more reasons and
an optional note.

| Reason | Meaning | Feeds |
|---|---|---|
| `off_topic` | Term matched, but the passage is about something else (OCR homograph, metaphor) | Term list: candidate for a weak tier or a negative lookahead |
| `passing_mention` | On topic, but only a sentence in passing | Ranker (`kind`) |
| `already_in_archive` | We have it | Novelty matcher (missed a match) |
| `too_well_known` | Canonical, covered elsewhere | Canonical list |
| `bad_ocr` | Unreadable or too garbled to transcribe | Feasibility |
| `fragment` | Too short or too incomplete to stand alone | Feasibility |
| `reference_or_index` | Index, dictionary or price list | Junk seeds, `digit_frac` |
| `advertisement` | Advert or notice | Junk seeds |
| `duplicate` | Same text as an earlier card | Reprint clustering |
| `secondary` | Later scholarship about a source rather than the source itself | Ranker; may point to a bibliography item instead |
| `other` | See the note | |

**Metadata corrections are separate from the decision.** A wrong catalogue
date is not a reason to reject. Press **D** ("Date wrong") and optionally type
the correct year. This is stored as `corrections: {date_wrong, year}` on the
decision line. Training, stratification and nominations should prefer
`corrections.year` over `snapshot.year`. The `date_wrong` rate per collection
also tells us whose catalogue dates not to trust: the first card in the local
batch was a Ladies' Home Journal issue listed as 1889 that is really from the
1960s–70s.

`add` and `maybe` take optional **why** tags: `first_person`, `ethnographic`,
`policy`, `clinical`, `literary`, `visual`, `unusual_language`,
`unusual_period`. These tell us which kinds of source are worth targeting next.

## 5. Files (the contract)

All of these live under `data/corpus-scan/`, which is git-ignored.

```
data/corpus-scan/
  candidates/<batch>/candidates.jsonl   one candidate per line, rank order (written by ranking scripts)
  candidates/<batch>/batch.json         {batch, created_at, source_runs[], scoring:"bootstrap"|"model", n, notes}
  decisions.jsonl                       append-only, all batches; latest line per candidate_id wins
```

An undo in the queue appends `"decision": "clear"`, which returns the card to
the queue. Readers take the latest line per `candidate_id` and drop cleared
ones.

**Candidate line:**

```json
{
  "candidate_id": "english-pd:dequinceysconfes00dequ",       // stable: dataset slug + document identifier (scan suffix like _14 stripped)
  "batch": "local-test-2026-10-16",
  "rank": 1, "lane": "exploit", "lane_reason": "top priority",
  "dataset": "English-PD", "collection": "English-PD", "revision": "0d45…",
  "identifier": "dequinceysconfes00dequ_14", "source_file": "…", "row": 533,
  "title": "…", "creator": "…", "year": 1896, "date": "1896", "language": "English",
  "page": null, "edition": null, "doc_words": 42000,
  "source_url": "https://archive.org/details/dequinceysconfes00dequ",
  "reprints": {"count": 1, "members": [{"identifier": "…", "year": 1896, "collection": "…"}]},
  "terms": {"strong": ["opium"], "weak": [], "context": ["visions/hallucinations"]},
  "excerpts": [{"hit_id": "…", "text": "…", "highlights": ["laudanum"], "digit_frac": 0.01}],
  "novelty_flags": [{"type": "canonical", "match": "De Quincey, Confessions of an English Opium-Eater"}],
  "scores": {"relevance": 0.8, "kind": 0.6, "novelty": 0.3, "feasibility": 0.9, "model_p": null, "priority": 0.41},
  "llm": null    // or {"kind": "first_person_experience", "pitch": "…", "substances": [], "ocr_quality": "good", "archive_fit": 4}
}
```

**Decision line:**

```json
{
  "candidate_id": "…", "batch": "…", "decision": "add" | "maybe" | "no",
  "reasons": ["passing_mention"], "why": ["first_person"], "note": "…",
  "decided_at": "2026-10-17T15:02:11Z", "editor": "Local editor", "lane": "explore", "rank": 37,
  "snapshot": {"title": "…", "year": 1896, "collection": "…", "identifier": "…", "source_url": "…",
               "terms": {…}, "scores": {…}, "best_excerpt": "…"}
}
```

The snapshot makes decisions self-contained training data. They survive
re-scans, re-ranking and deleted batches.

## 6. Scripts

| Script | Status | Role |
|---|---|---|
| `scripts/corpus_scan/candidates.py` | here | Shared helpers: document grouping, reprint MinHash, source-URL resolver (Internet Archive, Gallica, Chronicling America, Europeana/Wikisource URLs), novelty matcher, canonical list, bootstrap scores, queue builder, JSONL writer |
| `scripts/corpus_scan/bootstrap_candidates.py` | here | No-cost candidates from a scan run (`--scoring bootstrap`); used for the calibration batch |
| `embed_hits.py`, `build_seeds.py` | side session | Qwen3 embeddings of hits and archive seeds |
| `rank_hits.py` | side session | Embedding `relevance`, junk-seed contrast; writes `candidates.jsonl` via `candidates.py` |
| `screen_hits.py` | side session | Luna labels → `llm` and the `kind` score, for the top few thousand documents |
| `train_ranker.py` | side session | Fits `model_p` from `decisions.jsonl`; reports held-out AUC and add-rate by lane; re-ranks the next batch |
| `/admin/candidates` | here | Review queue: keyboard-driven, appends to `decisions.jsonl` |
| `nominate.py` | later | Turns `add` decisions into `data/draft-sources/sources/<slug>.json` stubs (`draft.status: "proposed"`, `proposedBy: "corpus-scan"`, `rationale` from the note and pitch), ready for completion |

## 7. Calibration before the cloud run

1. Run `bootstrap_candidates.py` on the local test, which has 1,139 windows and
   about 900 documents.
2. Ben reviews about 100 cards in `/admin/candidates`.
3. Check the results:
   - Does the bootstrap `priority` separate add from no? (Add-rate in the top
     half against the bottom half, and exploit against explore.)
   - Which reject reasons dominate? Fix the term list, the clustering or the
     novelty checks accordingly.
4. Those ~100 decisions become the first training set for `train_ranker.py`
   once the embeddings exist.
