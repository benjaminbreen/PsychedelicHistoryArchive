# Draft sources

Staging area for proposed archive additions. Nothing here is in Supabase or on the
public site. Review at `/admin/drafts` (local dev server only).

- `sources/<slug>.json` — one proposed source per file.
- `raw/` — raw text downloaded from the host (Gutenberg, Internet Archive djvu.txt,
  Wikisource, CIA CREST, HathiTrust). Kept so any transcript can be diffed against
  what was actually fetched.

Validate with:

```
node scripts/validate_draft_sources.mjs
```

## Scope rule

Every draft must involve an actual psychedelic or related consciousness-altering
substance in the archive's sense: peyote/mescaline, psilocybin mushrooms, LSD, DMT
and ayahuasca, iboga, Amanita muscaria, ololiuhqui/morning glory seeds, yopo/cohoba,
salvia, ketamine, MDMA, nitrous oxide and ether (the archive's anaesthetic-revelation
track), harmala alkaloids, soma. **Not** cannabis, laudanum, opium, coca/cocaine,
alcohol, or tobacco on their own. A source that mentions cannabis in passing is fine
if its subject is a psychedelic.

## Field reference

```jsonc
{
  "slug": "kebab-case-unique",
  "title": "Full title as it should display",
  "shortTitle": "optional",
  "author": "Primary author, or 'Various'",
  "creators": [{ "name": "…", "role": "author|translator|editor|interviewer" }],
  "year": 1897,                       // integer, negative for BCE
  "displayDate": "1897",              // human string
  "type": "Book|Academic Article|Essay|Letter|Newspaper Article|Manuscript|Field Notes|Patient Report|Medical Report|Testimony|Ancient Text|Audio/Video|Film|Iconography|Material Artifact|Source",
  "medium": "Text|Image|Audio/Video|Personal History|Biography",
  "era": "Pre-1800|1800-1950|1950-1970|1970-2000|2000-Present",
  "region": "e.g. United States, Mexico, Amazonia, Britain, Siberia",
  "language": "English",
  "contentLanguage": "optional, if transcript is not English",
  "substances": ["Mescaline"],
  "people": ["Names of historical figures central to the source"],
  "tags": ["kebab-case-topic-tags"],
  "summary": "2-4 sentences. What it is, why it matters.",
  "excerpt": "One vivid quoted sentence or two from the text.",
  "citation": "Chicago-style citation.",
  "rights": "Public domain (published <1930) | US Government work, public domain | …",
  "sourceUrl": "canonical landing page",
  "accessType": "hosted|external|metadata_only",
  "hostingStatus": "transcript_only|external_link|metadata_only|pdf",
  "readerMode": "transcript|overview|pdf|audio|video",
  "transcript": "Markdown full text. Headings with ###. Editorial notes italicised.",
  "wordCount": 3200,

  "draft": {
    "status": "proposed|verified|needs-work|rejected",
    "proposedBy": "research agent label",
    "proposedOn": "2026-08-15",
    "rationale": "Why this belongs in the archive, 1-3 sentences.",
    "textSource": {
      "url": "exact URL the text was fetched from",
      "kind": "gutenberg|internet-archive-djvu|wikisource|crest|hathitrust|nih|other",
      "fetchedOn": "2026-08-15",
      "rawFile": "raw/<file>.txt",
      "scope": "which pages/columns of the original were transcribed"
    },
    "textQuality": {
      "ocrPass": "none|haiku-corrected|hand-checked",
      "confidence": "high|medium|low",
      "notes": "What was corrected; anything still uncertain.",
      "uncertainReadings": ["word or phrase still in doubt"]
    },
    "duplicateCheck": "Confirmed absent from the 51 live archive records as of 2026-08-15.",
    "reviewStatus": "unreviewed|accepted|rejected|hold",   // set from the UI
    "reviewNote": ""
  }
}
```

Copyright: only host a full transcript when the text is public domain (US
publication before 1930, or a US Government work). For anything later, set
`accessType: "external"`, keep `transcript` empty or limited to a short quoted
excerpt, and put the finding information in `summary` and `citation`.
