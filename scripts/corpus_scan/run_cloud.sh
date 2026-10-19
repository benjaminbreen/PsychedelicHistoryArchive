#!/usr/bin/env bash
# Full term-filtered scan of historical Common Corpus collections on a cloud machine.
# See docs/common-corpus-scan-runbook.md. Usage (inside tmux):
#
#   bash run_cloud.sh A        # the 12 per-collection PleIAs repos (~1.78 TB)
#   bash run_cloud.sh B        # common_corpus: Open Government + Open Culture collections not in A (~4.5 TB read)
#   bash run_cloud.sh B1 / B2  # B split in halves (common_corpus_1-5 / 6-10) for two machines
#   bash run_cloud.sh A B      # both, one after the other
#
# Environment:
#   WORK=/data            scratch root (downloads + results)
#   WORKERS=15            scanner processes
#   AUTO_SHUTDOWN=1       power off when finished or failed (instance shutdown behaviour should be "stop")
#   RESULTS_S3=s3://...   optional: also copy the results tarball there
#   HF_TOKEN=...          strongly recommended (higher Hub rate limits)
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-/data}"
WORKERS="${WORKERS:-$(( $(nproc) - 1 ))}"
PY="${PY:-$HERE/.venv/bin/python}"
RUNS="$WORK/runs"
DL="$WORK/dl"
LOG="$WORK/scan.log"
mkdir -p "$RUNS" "$DL"

export HF_XET_HIGH_PERFORMANCE=1
export HF_XET_CHUNK_CACHE_SIZE_BYTES=0   # no local chunk cache; files are deleted after scanning
export HF_HUB_DISABLE_PROGRESS_BARS=1

finish() {
  status=$?
  echo "$(date -u +%FT%TZ) exit status $status" | tee -a "$LOG"
  tar -C "$WORK" -czf "$WORK/corpus-scan-results.tgz" runs scan.log 2>/dev/null
  if [[ -n "${RESULTS_S3:-}" ]]; then
    aws s3 cp "$WORK/corpus-scan-results.tgz" "$RESULTS_S3/corpus-scan-results-$(date -u +%Y%m%dT%H%M).tgz" | tee -a "$LOG"
  fi
  if [[ "${AUTO_SHUTDOWN:-0}" == "1" ]]; then
    sudo shutdown -h +2 "corpus scan finished"
  fi
}
trap finish EXIT

# repo | pinned commit | output name (main SHAs checked 2026-10-16)
SET_A=(
  "PleIAs/US-PD-Newspapers|39dc0a2a0113609fdcc2f865a25a6d8bafd1f5e6|US-PD-Newspapers"
  "PleIAs/English-PD|0d451478c7d517a72298431f47bf57aa9c4e0e1e|English-PD"
  "PleIAs/French-PD-Newspapers|b1ce8d95cb66432879a34cdedfda9a0dad478204|French-PD-Newspapers"
  "PleIAs/German-PD|c0bff201d12fd47d4ac05737a394481680dfee21|German-PD"
  "PleIAs/French-PD-Books|21abfb3f646a0f1846175c63709913a51abc9bcb|French-PD-Books"
  "PleIAs/French-PD-diverse|fca59daf897dd2c4f7979b8de6936cb48dec95ef|French-PD-diverse"
  "PleIAs/Spanish-PD-Books|001eaf13681f483069361dd82195ce279e12ed63|Spanish-PD-Books"
  "PleIAs/Spanish-PD-Newspapers|17509f22d33a5f82def051e853899b8b65d7a9e2|Spanish-PD-Newspapers"
  "PleIAs/Italian-PD|4dc027b568a20d8cb25a4d78ee9653fd5ff01d66|Italian-PD"
  "PleIAs/NewZealand-PD-Newspapers|79712e200e16ee2b0712d162904b315acd0b2f0a|NewZealand-PD-Newspapers"
  "PleIAs/Portuguese-PD|d8d45f37105a975b84ad8fe49a0d574a552178c8|Portuguese-PD"
  "PleIAs/Latin-PD|954f5ab3bb9b79972ebd810e426bc691a0895ba8|Latin-PD"
)
CC_REPO="PleIAs/common_corpus"
CC_SHA="307910e4c5d040d6f318e6edf2a2b97849155771"
# Open Government rows (any date; US federal: govinfo, fr, ecfr, usc, fdlp, dotgov, reg_docs,
# dockets, Court Listener, Caselaw Access Project, SEC, USPTO), plus Open Culture collections
# that are not already covered by set A.
CC_WHERE="open_type = 'Open Government' OR (open_type = 'Open Culture' AND collection NOT IN ('US-PD-Newspapers','English-PD','French-PD-Newspapers','German-PD','French-PD-Books','French-PD-diverse','Spanish-PD-Books','Spanish-PD-Newspapers','Italian-PD','NewZealand-PD-Newspapers','Portuguese-PD','Latin-PD'))"

scan() {  # repo sha name [extra args...]
  local repo="$1" sha="$2" name="$3"; shift 3
  echo "$(date -u +%FT%TZ) start $repo@$sha -> $name" | tee -a "$LOG"
  "$PY" "$HERE/scan_parquet.py" --out "$RUNS/$name" --hf-repo "$repo" --revision "$sha" --dataset "$name" \
    --download-dir "$DL/$name" --delete-after --workers "$WORKERS" --duck-threads 1 --prefetch 6 "$@" 2>&1 | tee -a "$LOG"
  echo "$(date -u +%FT%TZ) end $name (errors: $(wc -l < "$RUNS/$name/errors.txt" 2>/dev/null || echo 0))" | tee -a "$LOG"
}

[[ $# -ge 1 ]] || { echo "usage: $0 A|B|B1|B2 [...]"; exit 2; }
for set in "$@"; do
  case "$set" in
    A)  for row in "${SET_A[@]}"; do IFS='|' read -r repo sha name <<<"$row"; scan "$repo" "$sha" "$name"; done ;;
    B)  scan "$CC_REPO" "$CC_SHA" common_corpus --where "$CC_WHERE" ;;
    B1) scan "$CC_REPO" "$CC_SHA" common_corpus --where "$CC_WHERE" \
          --include 'common_corpus_1/*' --include 'common_corpus_2/*' --include 'common_corpus_3/*' \
          --include 'common_corpus_4/*' --include 'common_corpus_5/*' ;;
    B2) scan "$CC_REPO" "$CC_SHA" common_corpus --where "$CC_WHERE" \
          --include 'common_corpus_6/*' --include 'common_corpus_7/*' --include 'common_corpus_8/*' \
          --include 'common_corpus_9/*' --include 'common_corpus_10/*' ;;
    *)  echo "unknown set $set"; exit 2 ;;
  esac
done
for d in "$RUNS"/*/; do "$PY" "$HERE/summarize_hits.py" "$d" --sample 50 > "$d/summary.md" 2>>"$LOG"; done
