# Drafting tools (first batch, 2026-10-17)

These are the one-off tools used to turn the first 17 scan nominations into near-final drafts in the shared workspace.

- `build_drafts.py` reads a spec (`specs/<slug>.json`) plus the full OCR context (`full/<slug>.txt`) and writes `built/<slug>.json`. A spec gives:
  - the start and end markers of the passage
  - OCR corrections, running heads to remove, and paragraph breaks
  - an editorial note, the translation, the metadata fields and the author
- `push_drafts.py` loads each built draft into its proposal's working copy through `cms_save_draft`. It skips any draft edited since the expected version.

The built drafts are kept in `docs/corpus-scan/drafts-2026-10-17/` as a backup. Everyday editing happens in the workspace (Sources → Proposals). The working directories (`specs/`, `full/`, `built/`) lived in a scratch folder and are not part of the repository.
