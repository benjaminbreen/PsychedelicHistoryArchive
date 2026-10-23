# Editorial workspace (CMS)

The workspace lives at `/admin`. Editors add a source, edit it, preview it in the real reader, and click Publish. Edits to a published source stay private until they publish again.

## Try it locally (no database needed)

```bash
cd archive-site
CMS_LOCAL_DATA=true npm run dev
```

Open http://localhost:3000/admin. The workspace loads the staged sources from `data/*-import/`, and saves to `.cms-local/` (gitignored). Nothing reaches Supabase or the public site. Delete `.cms-local/sources.json` to start over.

## Connect the shared archive

1. Apply `scripts/supabase_cms_workspace.sql` (already included in the project's migrations). It adds private working copies, save/publish functions, and a private `archive-drafts` bucket. It publishes nothing.
2. Set the server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_LOCAL_ENABLED=true` in Vercel Production. The browser also needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Set `NEXT_PUBLIC_SITE_URL=https://www.psychedelicarchive.com` so sitemap, canonical, and social URLs use the public domain.
4. Create an individual Supabase Auth user with an email address and password, using the admin API or Authentication → Users → Create user. Confirm the email administratively; do not use Send invitation. Add an `editor_profiles` row with that user's ID, display name, and role (`owner` or `editor`). Public signup never grants editor access.

## Individual password sign-in

Editors sign in at `/editor-login` using their email address and password. No email delivery service, Resend account, or `CMS_SITE_URL` variable is required. Supabase stores the password hashes; the repository never stores account passwords.

- **My account:** each person can change their password by providing their current password and confirming a new password of 12–128 characters.
- **Editors & access:** only the owner can view the account list and reset a collaborator's password. Share reset passwords privately. Editors cannot reset anyone else's password.
- **Forgotten owner password:** use the owner backup login to reset the named owner account under Editors & access.
- **Roles:** editors can prepare drafts, preview, review, and publish. Owners also manage account passwords.
- **Attribution:** an individual account takes precedence over an old shared-password cookie, so edits retain the person's name and role.

Starter credentials are saved in owner-only, Git-ignored `.env.cms-*` files on the owner's computer. Share only the relevant person's credentials, then have them change the starter password under My account. These local files are not updated when someone changes their password.

## Owner backup password

Keep `CMS_SHARED_PASSWORD` and an independent, long random `CMS_SESSION_SECRET` in Vercel Production for owner recovery. The backup form is collapsed under **Owner backup password** on the login page. Give this password only to the owner. Changing it signs out existing backup sessions. Signing in with it signs out the individual session on that browser only.

Never expose service-role credentials or password variables with a `NEXT_PUBLIC_` prefix. On loopback in development, the local workspace remains available without signing in.

## Proposals

A proposal is a private draft marked for the team to review. It appears under **Sources → Proposals** for every editor and never on the public site until someone publishes it.

- **Propose by hand:** tick "Propose this source for the team to review" in **Add source** and say why it belongs.
- **From the Common Corpus scan:** after reviewing finds in **Candidates**, press **Send … to the workspace**. Each add or maybe becomes a proposal with its excerpt, the link to the original, and the scan's provenance. On Vercel, batches, decisions, and sent nominations live in private Supabase tables; repeated sends return the existing draft. Development continues to use local scan files.
- **Reviewing:** each proposal opens with a panel saying who proposed it and why. **Accept and start editing** turns it into an ordinary draft. **Decline** keeps the record but takes it off the list, with an optional note.

Apply the shared queue migration with `supabase db push`, then seed batches with `node scripts/sync_corpus_review.mjs`. The script uses the local environment file, imports existing decision history only when the shared history is empty, and links already-created nominations. It never publishes sources. Run it before opening the shared queue to collaborators; subsequent scans can be synced without overwriting their reviews.

## For collaborators

The in-app guide (**How to contribute** in the sidebar) is the whole workflow. Decide what to add however you like (a Zoom call, a shared Google Doc). The workspace handles only adding, editing, previewing, and publishing.

## Database changes (Supabase CLI)

This repo is linked to the Supabase project with the CLI (`supabase/` folder). Schema changes go in `supabase/migrations/` as timestamped SQL files and are applied with:

```bash
supabase db push
```

Quick read-only checks against the live database: `supabase db query --linked "select ..."`. Without `--linked` the CLI looks for a local Docker database.
