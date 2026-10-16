# Common Corpus full scan: runbook

Goal: find new candidate sources for the archive by scanning historical Common
Corpus collections in full, using a multilingual term filter. The output is
~300-word excerpts around each hit. These are then ranked by embedding
similarity to archive passages, screened by a cheap LLM, and reviewed by hand.

A random 0.2% sample is the wrong frame for rare material like this, so the
plan is a full scan. It runs on a CPU-only cloud machine close to Hugging
Face, because the home connection (~1.3 MB/s) would need about 40 days.

Files:

| Path | What it is |
|---|---|
| `scripts/corpus_scan/terms.toml` | Term list: strong, weak and context tiers; multilingual; OCR-tolerant |
| `scripts/corpus_scan/scan_parquet.py` | Scanner: DuckDB/RE2 prefilter, exact matching, excerpt windows; resumable |
| `scripts/corpus_scan/summarize_hits.py` | Counts per term, collection and decade, plus a random sample for review |
| `scripts/corpus_scan/run_cloud.sh` | One-command cloud run with pinned dataset SHAs, results tarball and auto-shutdown |
| `scripts/corpus_scan/requirements.txt` | Pinned Python dependencies |
| `docs/corpus-scan/local-test-2026-10-16-sample.md` | Local test tables and 50 random hits |

---

## 1. How the filter works

- **Strong terms** always count as a hit. Examples: peyote/peyotl/Anhalonium,
  mescaline, haschisch/hachisch/hasheesh, dawamesk, cannabis indica/chanvre
  indien, bhang, ayahuasca/yagé/caapi, harmaline, cohoba/yopo, teonanácatl,
  psilocybin, fly agaric/Fliegenpilz, ololiuqui, LSD/lysergic, psychotomimetic,
  MKULTRA, ibogaine, kava-kava/yangona, Jimson weed/toloache, haoma,
  "anaesthetic revelation", éthéromanie, and Davy-style phrasing such as
  "breathed the nitrous oxide".
- **Weak terms** count only when a strong or context term appears within about
  60 words. Examples: ether, opium/laudanum, nitrous oxide and laughing gas on
  their own (mostly dental adverts), datura (often the Latin participle),
  generic mushroom, hemp, soma, ergot.
  - Weak terms marked `needs = "strong"` are rescued only by a strong term. These
    are intoxication/ivresse/Rausch, chloroform, belladonna/henbane,
    cocaine and snuff, all of which are usually metaphorical or routine medicine.
- **Context terms** never count on their own. They cover visionary-experience
  language: visions, hallucination, ecstasy/extase/Verzückung, ineffable,
  cosmic consciousness, depersonalisation, dreams/rêves/Träume, exhilaration.
- **Date guards.** `min_year` and `require_year` stop modern coinages from
  matching older homographs:
  - LSD and psychedelic before 1940
  - mescaline before 1890; earlier hits are OCR for "Muscatine"
  - "L.S.D." meaning pounds, shillings and pence
- **Windows.** Each hit gets a window of about 300 words. Nearby hits merge into
  one window, and each document keeps at most 25 windows, strong ones first.
- **Fields on each hit:**
  - identifier, collection, date/year, title, creator, language
  - page and edition where the schema has them
  - dataset, source file and pinned revision
  - strong, weak and context terms, with the surface forms matched
  - a simple `score`
  - `digit_frac`, which is high for indexes, price lists and tables, so ranking
    can demote them
- **Speed.** DuckDB runs an RE2 prefilter: strong OR (weak AND context). Then
  google-re2 finds candidates and Python's `re` checks each one, which keeps
  Unicode word boundaries and lookaheads. On a 300-text check the matches were
  identical to pure-Python matching, about 100× faster.
- **Resuming.** Finished input files are listed in `<out>/done.txt`, and outputs
  are written atomically, so rerunning the same command carries on where it
  stopped. `--delete-after` removes each downloaded parquet file once its
  outputs are safe.

Vocabulary seeds came from the archive's own texts: `nitrous oxide:ether/`,
`latin-american-psychedelic-research/` (yajé, harmaline, bangue, virola,
paricá) and `data/squarespace-import/body-text/`.

## 2. Local test (2026-10-16, free)

**Input.** `~/Code/CommonCorpusSample/culture/*.parquet`: 20 random Common
Corpus shards, Open Culture rows only. That is 248,596 documents, 1.18 B words,
2.8 GB of parquet. Nothing in that folder was modified.

**Speed.** 21 s wall clock with 6 workers, about 111 CPU-seconds, or roughly
25 MB of parquet per CPU-second. The RE2 path was essential: Python `re` alone
took 93 s on a single shard.

**Tuning rounds:**

| Round | Windows | Useful in random 50 | Main junk |
|---|---:|---:|---|
| 1 (first draft) | 5,759 | ~6 (12%) | Kiev = "Kief", French *hachis* (minced meat), Latin *datura eras*, "datum line", dental nitrous-oxide adverts, "vision" (optics), "traum" matching "traumatic", "intoxicated with prosperity" |
| 2 | 1,306 | ~14 (28%) | "eter-nity" hyphenation, poetic *Äther*, *Harmina* as a ship's name, Nizami of Ganja, Mariguana Island, Spanish *sueño* (sleep) |
| 3 (final) | 1,139 | ~18 clearly useful + ~10 marginal (35% / 55%) | back-of-book indexes and materia medica lists; silk "messaline" (excluded by lookahead) |

The final run produced 1,139 windows from 921 documents. About 68% contain a
strong term. The mean window is 297 words, and the gzipped hits take 1.1 MB.

**Hits by collection:**

| Collection | Windows |
|---|---:|
| English-PD | 406 |
| US-PD-Newspapers | 185 |
| US-PD-Books | 146 |
| French-PD-Newspapers | 91 |
| French-PD-diverse | 79 |
| German-PD | 52 |
| French-PD-Books | 39 |
| LoC-PD-Books | 25 |
| Spanish-PD-Books | 22 |
| others | <15 each |

**Hits by decade.** 433 hits are undated. The dated hits peak in the 1870s–1910s
(70–95 per decade). Coverage thins after 1930 because most of these collections
are public domain.

**Top terms (windows):**

| Term | Windows |
|---|---:|
| opium (weak) | 325 |
| cannabis indica | 191 |
| hashish | 177 |
| ether (weak) | 168 |
| marijuana | 97 |
| bhang/ganja | 60 |
| soma/haoma | 46 |
| datura | 35 |
| fly agaric | 34 |
| peyote | 30 |
| anaesthetic revelation | 19 |
| mescaline | 18 |
| DMT/tryptamine snuffs | 16 |

**Sample useful hits.** Full text is in
`local-test-2026-10-16-sample.md` and the earlier review rounds.

- Bayard Taylor's hashish account, reprinted as "Drug of Marvelous Power" in a
  1920 US paper (US-PD-Newspapers).
- Zitkala-Ša (Gertrude Bonnin) lecturing in 1918 on peyote use among the Sioux,
  and 1928 Department of Agriculture testimony on peyote (*Evening Star*, DC).
- James Mooney's unfinished "Study of the Peyote and Its Accompanying Religious
  Cult", noted in a Smithsonian report.
- *Niopo* snuff on the Orinoco, in a 1785 *Allgemeine Literatur-Zeitung* review.
- A Congolese *fumeurs de hachisch* religious confraternity (*Revue des deux
  mondes*).
- *Éthéromanie* as "sister of morphinomania" (French newspaper).
- "Laughing Gas for Poets": Humphry Davy's experiments retold in a 1908 US
  paper. Also Horace Wells and the first use of anaesthetics, in a 1907
  Vermont reader.
- An 1873 Luxembourg report of a vendor at the Vienna exhibition selling
  *Hachich, um sich in Träume zu rauchen*.
- A Fijian *yangona* preparation described in an 1868 New Zealand paper.
- Congressional Record items on marihuana law and on "psychedelic addicts" from
  the 1960s–70s. These are inside English-PD, so mid-century government
  material is not limited to common_corpus Open Government rows.

**Extrapolation.** The sample yields about 1 window per million words. Set A
(below) should give roughly 0.5–1 M windows, about 0.5–1 GB gzipped. That is
plenty to embed, and the embedding stage, not the regex, will rank them.

## 3. What to scan

### Set A: the 12 per-collection PleIAs repos (2024 releases), ~1.78 TB

The main SHAs below were checked on 2026-10-16. Sizes are the total size of
the parquet files. Every sampled file is a single row group.

| Repo | Pinned SHA | Files | GB | Schema (text column in bold) |
|---|---|---:|---:|---|
| PleIAs/US-PD-Newspapers | `39dc0a2a0113609fdcc2f865a25a6d8bafd1f5e6` | 2657 | 409.9 | id, date, edition, page, file_name, **text**, word_count |
| PleIAs/English-PD | `0d451478c7d517a72298431f47bf57aa9c4e0e1e` | 812 | 362.3 | identifier, creator, title, language, language_code, **text**, publication_date (int32), word_count, character_count |
| PleIAs/French-PD-Newspapers | `b1ce8d95cb66432879a34cdedfda9a0dad478204` | 320 | 287.3 | file_id, ocr (quality score, not text), title, date, author, **complete_text**, page_count, word_count, character_count |
| PleIAs/German-PD | `c0bff201d12fd47d4ac05737a394481680dfee21` | 275 | 186.6 | as English-PD |
| PleIAs/French-PD-diverse | `fca59daf897dd2c4f7979b8de6936cb48dec95ef` | 201 | 178.7 | identifier, file, title, creator, language, **complete_text**, word_count, character_count |
| PleIAs/Latin-PD | `954f5ab3bb9b79972ebd810e426bc691a0895ba8` | 118 | 88.6 | as English-PD |
| PleIAs/French-PD-Books | `21abfb3f646a0f1846175c63709913a51abc9bcb` | 145 | 60.5 | as French-PD-Newspapers |
| PleIAs/Italian-PD | `4dc027b568a20d8cb25a4d78ee9653fd5ff01d66` | 107 | 56.7 | as English-PD |
| PleIAs/Spanish-PD-Books | `001eaf13681f483069361dd82195ce279e12ed63` | 129 | 52.1 | as English-PD |
| PleIAs/Spanish-PD-Newspapers | `17509f22d33a5f82def051e853899b8b65d7a9e2` | 2097 | 48.6 | id, file_name, start_date, end_date, edition, **text**, word_count |
| PleIAs/NewZealand-PD-Newspapers | `79712e200e16ee2b0712d162904b315acd0b2f0a` | 1982 | 41.6 | identifier, **text**, word_count; the date is in the identifier and file name (`ODT_1901`) |
| PleIAs/Portuguese-PD | `d8d45f37105a975b84ad8fe49a0d574a552178c8` | 7 | 3.3 | as English-PD |

US-PD-Newspapers is now 410 GB, not the ~152 GB we had assumed. The scanner
maps all of these schemas automatically: identifier/id/file_id,
date/publication_date/start_date, text/complete_text, page, edition. This was
tested with synthetic parquet files in each schema, and with a live
three-file pinned download from NewZealand-PD-Newspapers.

### Set B: PleIAs/common_corpus, Open Government plus the Open Culture collections not in A

- **Repo and size.** `PleIAs/common_corpus` at
  `307910e4c5d040d6f318e6edf2a2b97849155771`: 10,000 files in
  `common_corpus_{1..10}/subset_*_*.parquet`, about 4.49 TB.
- **Finding government rows.** Use `open_type = 'Open Government'`, with a
  space. US federal collections include:
  - `govinfo`, `fr` (Federal Register), `ecfr`, `usc`, `fdlp`
  - `dotgov`, `reg_docs`, `dockets`
  - `Court Listener`, `Caselaw Access Project`, `SEC`, `USPTO`
- **Why this matters.** These rows cover the 1950s–70s LSD/MKULTRA period
  (hearings, Federal Register notices, court cases) at any date.
- **The `--where` filter in `run_cloud.sh`** adds the Open Culture collections
  that Set A misses: US-PD-Books, LoC-PD-Books, Europeana, Deutsches
  Zeitungsportal, German-PD-Newspapers, Gutenberg, Wikisource, BLBooks, Anno,
  BNL, Dutch/Polish/Greek-PD and others.
- **Cost.** No shard map exists, and the text column is ~98% of every file, so
  Set B means downloading all 4.5 TB. The filter only saves CPU.
- **Splitting.** `B1` and `B2` split it by folder (1–5, 6–10) across two
  machines.

## 4. Machine

Prices below are on-demand, us-east-1, as of October 2026. Sources:
instances.vantage.sh, aws.amazon.com, huggingface.co/docs/hub/jobs-pricing.

| Option | Spec | Price | Notes |
|---|---|---|---|
| **AWS c8g.4xlarge (recommended)** | 16 vCPU Graviton4, 32 GiB | $0.638/h; spot ≈ $0.32/h | arm64; all dependencies have aarch64 wheels (fallback below) |
| AWS c7i.4xlarge | 16 vCPU Intel, 32 GiB | $0.714/h; spot ≈ $0.30/h | x86 fallback |
| AWS c7a.4xlarge | 16 vCPU AMD, 32 GiB | $0.821/h | |
| Disk: gp3 200 GB, 1000 MiB/s, 6000 IOPS | | ≈ $0.09/h prorated | The default 125 MiB/s would throttle downloads |
| Hetzner CCX43 | 16 vCPU, 64 GB | ≈ $0.45/h | Prices doubled in June 2026; stock is patchy; EU/Ashburn. Not worth it |
| HF Jobs `cpu-xl` | 16 vCPU, 124 GB, 1 TB disk | $1.00/h | Next to the data; needs a positive credit balance and `--timeout 12h`; results must go to an HF bucket or repo |

Downloading from Hugging Face into AWS is free. Copying 1–5 GB of results out
falls inside AWS's free 100 GB per month.

**Expected time and cost:**

| Set | Machines | Time | Cost (on-demand) | Limiting factor |
|---|---|---|---|---|
| A | 1 | ~3–5 h | ~$2–4 | Download of 1.78 TB at 150–300 MB/s, overlapped with ~100k CPU-seconds of scanning |
| B | 1 | ~5–8 h | ~$4–6 | Download of 4.5 TB |
| B1 + B2 | 2 | ~3–4 h each | similar total | |
| All three in parallel | 3 | ~4–5 h wall clock | ~$6–8 on-demand, ~$3–4 spot | |

Running A alone, which is the core of the job, fits the original budget of
4–8 h and ~$3–6.

## 5. Running it

### 5.1 Launch (from the laptop; needs the AWS CLI and an SSH key pair)

```bash
aws ec2 run-instances --region us-east-1 \
  --instance-type c8g.4xlarge \
  --image-id resolve:ssm:/aws/service/canonical/ubuntu/server/24.04/stable/current/arm64/hvm/ebs-gp3/ami-id \
  --key-name YOUR_KEY --security-group-ids YOUR_SG_WITH_SSH \
  --instance-initiated-shutdown-behavior stop \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":200,"VolumeType":"gp3","Throughput":1000,"Iops":6000,"DeleteOnTermination":true}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=corpus-scan-A}]'
```

- **Shutdown behaviour.** The shutdown behaviour is `stop`, so the disk and
  results survive the automatic power-off. A stopped instance costs only the
  disk, about $0.50 a day.
- **Spot.** To use spot, add
  `--instance-market-options '{"MarketType":"spot","SpotOptions":{"SpotInstanceType":"persistent","InstanceInterruptionBehavior":"stop"}}'`.
  The scan resumes from `done.txt` if the instance is interrupted.

### 5.2 Set up (about 3 minutes)

```bash
IP=$(aws ec2 describe-instances --filters Name=tag:Name,Values=corpus-scan-A Name=instance-state-name,Values=running --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
scp -r scripts/corpus_scan ubuntu@$IP:~/
ssh ubuntu@$IP
```

On the machine:

```bash
sudo apt-get update -qq && sudo apt-get install -y -qq tmux python3-venv
sudo mkdir -p /data && sudo chown ubuntu /data
cd ~/corpus_scan && python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt
.venv/bin/python -c "import re2, duckdb; print('ok')"
```

If `google-re2` has no wheel for the platform, either install `libre2-dev` and
build it with `sudo apt-get install -y libre2-dev pybind11-dev`, or launch the
x86 `c7i.4xlarge` instead. Without re2 the scanner still works, but it is
about 20× slower.

### 5.3 Run (the one command)

```bash
tmux new -s scan
export HF_TOKEN=hf_...            # read token; avoids anonymous Hub rate limits
export AUTO_SHUTDOWN=1 WORK=/data WORKERS=15
bash ~/corpus_scan/run_cloud.sh A          # machine 2: B1, machine 3: B2 (or "A B" on one machine)
```

Detach with `Ctrl-b d` and reattach with `tmux attach -t scan`.

- **Monitoring.** Run `tail -f /data/scan.log`. Each line shows the files done,
  rows, windows and elapsed minutes.
- **Memory.** In the first 10 minutes, check `free -g`. English-PD rows are
  whole books. If free memory drops below ~4 GB, stop with `Ctrl-c`, set
  `WORKERS=10` and rerun the same command; it resumes.
- **Errors.** Failed files go to `/data/runs/<dataset>/errors.txt` and are not
  marked done. Rerun the same command to retry them.
- **Dead-man switch (optional).** Run `sudo shutdown -h +900` before starting,
  so the machine powers off after 15 h whatever happens.
- **When finished.** `run_cloud.sh` writes `summary.md` for each dataset, packs
  `/data/corpus-scan-results.tgz`, optionally copies it to `RESULTS_S3`, and
  powers off two minutes later.

### 5.4 Copy the results back

```bash
aws ec2 start-instances --instance-ids i-...   # only if it already powered off
scp ubuntu@$IP:/data/corpus-scan-results.tgz data/corpus-scan/
tar -C data/corpus-scan -xzf data/corpus-scan/corpus-scan-results.tgz
aws ec2 terminate-instances --instance-ids i-...   # once the copy is verified
```

`data/corpus-scan/` is git-ignored.

### 5.5 Pre-flight check on the cloud machine (optional, about 2 minutes)

```bash
~/corpus_scan/.venv/bin/python ~/corpus_scan/scan_parquet.py --out /data/runs/smoke \
  --hf-repo PleIAs/English-PD --revision 0d451478c7d517a72298431f47bf57aa9c4e0e1e \
  --download-dir /data/dl/smoke --delete-after --limit 2
```

## 6. After the scan

### 6.1 Embed the hits

- **Model.** `qwen/qwen3-embedding-8b` via OpenRouter, at
  `POST https://openrouter.ai/api/v1/embeddings`. Send
  `{"model": "qwen/qwen3-embedding-8b", "input": [...], "dimensions": 1024, "encoding_format": "base64"}`.
  The key is `OPENROUTER_API_KEY` in `~/Code/Historical Forecasting/.env.local`.
- **Batching and dedup.** Send 64–128 windows per request. Deduplicate exact
  and near-exact windows first, since newspapers reprint the same story
  widely. Normalising whitespace and hashing the first and last 30 words is
  enough for a first pass.
- **Cost.** Assuming 0.5–1 M windows × ~400 tokens = 200–400 M tokens. At about
  $0.01 per million tokens that is **~$2–4**. It runs from home: the upload is
  text only, roughly 1 GB.
- **Storage.** Keep the vectors in float16 `.npy` shards with a parallel
  `hit_id` list.

### 6.2 Rank against archive seed passages

- **Seed set.** Build one from:
  - the archive's curated `document_sections`
  - `nitrous oxide:ether/texts/first_hand/`
  - `latin-american-psychedelic-research/texts/`
  - the Squarespace body texts

  Chunk them to about 300 words, giving a few thousand seeds. Embed them with
  the same model.
- **Score.** For each hit, take the mean of its top-5 cosine similarities to
  the seeds. Add a small bonus for each distinct strong term. Subtract a
  penalty when `digit_frac > 0.12`, which marks indexes and price lists.
- **Keep the best window per document,** then look at the score histogram.
  Expect about 3,000–5,000 candidates above the knee.
- **Thin categories.** Use separate seed subsets for experience reports,
  ethnography, policy/government and pharmacology, and take the top-k of each.
  This stops medicine from swamping first-person accounts.

### 6.3 Screen the top few thousand with `openai/gpt-6-luna`

- **Settings.** Run via OpenRouter with reasoning off and a structured-output
  JSON schema.
- **Schema fields:**
  - `relevant` (bool)
  - `kind`: one of first_person_experience, ethnographic_observation,
    medical_or_scientific, legal_or_policy, literary,
    commercial_or_advertisement, reference_or_index, other
  - `substances` (list)
  - `summary`: one sentence
  - `why_notable`: one sentence
  - `archive_fit`: 1–5
  - `ocr_quality`: good / fair / poor
- **Prompt.** Give the archive's scope in two sentences and the excerpt with
  its metadata. 5,000 items × ~600 input and ~120 output tokens is about 3 M
  input tokens. Check the current Luna price; at cheap-model rates this is
  roughly a dollar.
- **Quality check.** Spot-check 50 Luna verdicts by hand before trusting the
  rest.

### 6.4 Human review

Export everything rated `archive_fit ≥ 4` to a sortable sheet or HTML page.
Include the excerpt, a source link (Internet Archive, Gallica or Chronicling
America from the identifier), the date and Luna's summary. That sheet goes to
Ben, Rebecca Lemov, Anne Harrington and Paul Gillis-Smith. Accepted items
enter the normal draft workflow: `data/draft-sources/` →
`scripts/build_draft_import.mjs`.

## 7. Tuning the term list later

- Edit `terms.toml`, then rerun the free local test. It takes about 20 s:

  ```bash
  python scripts/corpus_scan/scan_parquet.py --out /tmp/cs-local --workers 6 ~/Code/CommonCorpusSample/culture/*.parquet
  python scripts/corpus_scan/summarize_hits.py /tmp/cs-local --sample 50 --seed 5 > /tmp/cs-local/summary.md
  ```

- To demote a noisy term, move it to `tier = "weak"` and add an unambiguous
  compound form to the strong entry. Kava, datura and nitrous oxide all work
  this way now.
- Prefer a negative lookahead for known homographs, such as "mescaline silk"
  and "Mariguana Island", over deleting the term.
- `--where` must only reference columns that exist in that dataset. A file
  missing the column is logged to `errors.txt` and skipped.
