 _____ _   _ _____   ____  ______   ______  _   _ ____  _____ ____  _____ _     ___ ____ 
|_   _| | | | ____| |  _ \|  _ \ \ / / ___|| | | |  _ \| ____|  _ \| ____| |   |_ _/ ___|
  | | | |_| |  _|   | |_) | |_) \ V /\___ \| |_| | | | |  _| | | | |  _| | |    | | |    
  | | |  _  | |___  |  __/|  __/ | |  ___) |  _  | |_| | |___| |_| | |___| |___ | | |___ 
  |_| |_| |_|_____| |_|   |_|    |_| |____/|_| |_|____/|_____|____/|_____|_____|___\____|
          THE PSYCHDEDELIC HISTORY ARCHIVE

# The Psychedelic History Archive

A prototype scholarly archive for historical sources related to psychedelics,
altered states, psychopharmacology, religion, medicine, literature,
anthropology, and related fields.

This repository currently includes:

- `archive-site/`: the Next.js public archive prototype.
- `nitrous oxide:ether/`: a local text corpus for nitrous oxide, ether,
  anaesthetics, and William James/Benjamin Paul Blood materials.
- `scripts/`: migration scripts for importing Squarespace and local corpus
  records into Supabase.
- `data/`: generated Supabase staging data and local import assets.
- `psychedelic-history-archive-design-plan.md`: architecture and design notes.

## Local Development

```bash
cd archive-site
npm install
npm run dev
```

Create `archive-site/.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yqcvybdabpnxyapnrjlp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=archive-assets
```

Do not commit `.env.local` or any Supabase secret/service keys.

## Supabase Import

The schema lives at:

```txt
scripts/supabase_schema.sql
```

Upload generated staging data with:

```bash
SUPABASE_URL="https://yqcvybdabpnxyapnrjlp.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_secret_key" \
node scripts/upload_squarespace_to_supabase.mjs --import-dir data/squarespace-import
```

For the local nitrous oxide/ether corpus:

```bash
SUPABASE_URL="https://yqcvybdabpnxyapnrjlp.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_secret_key" \
node scripts/upload_squarespace_to_supabase.mjs --import-dir data/nitrous-ether-import
```
