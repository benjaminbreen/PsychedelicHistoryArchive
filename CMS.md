# Editorial workspace (CMS)

The workspace lives at `/admin`. Editors add a source, edit it, preview it in the real reader, and click Publish. Edits to a published source stay private until they publish again.

## Try it locally (no database needed)

```bash
cd archive-site
CMS_LOCAL_DATA=true npm run dev
```

Open http://localhost:3000/admin. The workspace loads the staged sources from `data/*-import/`, and saves to `.cms-local/` (gitignored). Nothing reaches Supabase or the public site. Delete `.cms-local/sources.json` to start over.

## Connect the shared archive (one-time setup)

1. In the Supabase SQL editor, run `scripts/supabase_cms_workspace.sql`. It adds private working copies, the save/publish functions, and a private `archive-drafts` storage bucket. It publishes nothing.
2. In `archive-site/.env.local`, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CMS_SITE_URL` (the site's public address, used in invitation emails). On the deployed site, also set `ADMIN_LOCAL_ENABLED=true`.
3. In Supabase → Authentication → URL configuration, add `<CMS_SITE_URL>/auth/editor` as a redirect URL.
4. Make yourself the first owner: in Supabase → Authentication → Users, invite your own email, copy your user ID, then in the SQL editor run
   `insert into editor_profiles (user_id, display_name, role) values ('<your auth user id>', 'Your Name', 'owner');`
5. Invite collaborators from **Editors & access** in the workspace sidebar. They get an email link and land in Sources.

## Sign in with a shared workspace password

The simplest way to open the deployed workspace: one shared password, set in the deployment's environment, never in the repository (it is public).

1. In Vercel → Project → Settings → Environment Variables (Production), add:
   - `CMS_SHARED_PASSWORD`: the workspace password. Changing it later signs everyone out.
   - `CMS_SESSION_SECRET`: an independent long random secret used to sign sessions.
   - `CMS_SHARED_EDITOR_NAME`: the name shown on edits and proposals made with it, for example `Ben Breen`.
   - `ADMIN_LOCAL_ENABLED`: `true`, which turns the workspace on outside development.
   - Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are also set there. Saving and publishing need them.
2. Redeploy. Then open `<site>/admin` and enter the password.

Set `NEXT_PUBLIC_SITE_URL=https://www.psychedelicarchive.com` in Production so sitemap, canonical, and social URLs use the public domain. Keep service-role credentials and password variables server-only; never prefix them with `NEXT_PUBLIC_`.

The password signs you in as the workspace owner for 30 days on that browser. On `localhost` in development no sign-in is needed.

## Proposals

A proposal is a private draft marked for the team to review. It appears under **Sources → Proposals** for every editor and never on the public site until someone publishes it.

- **Propose by hand:** tick "Propose this source for the team to review" in **Add source** and say why it belongs.
- **From the Common Corpus scan:** after reviewing finds in **Candidates**, press **Send … to the workspace**. Each add or maybe becomes a proposal with its excerpt, the link to the original, and the scan's provenance. On Vercel, batches, decisions, and sent nominations live in private Supabase tables; repeated sends return the existing draft. Development continues to use local scan files.
- **Reviewing:** each proposal opens with a panel saying who proposed it and why. **Accept and start editing** turns it into an ordinary draft. **Decline** keeps the record but takes it off the list, with an optional note.

Apply the shared queue migration with `supabase db push`, then seed batches with `node scripts/sync_corpus_review.mjs`. The script uses the local environment file, imports existing decision history only when the shared history is empty, and links already-created nominations. It never publishes sources. Run it before opening the shared queue to collaborators; subsequent scans can be synced without overwriting their reviews.

## Inviting editors later

Shared-password users are owners, so **Editors & access** offers the invite form. Email invitations also need the one-time setup below: `CMS_SITE_URL`, plus the redirect URL in Supabase. Invited editors sign in with an email link. The password keeps working alongside.

## For collaborators

The in-app guide (**How to contribute** in the sidebar) is the whole workflow. Decide what to add however you like (a Zoom call, a shared Google Doc). The workspace handles only adding, editing, previewing, and publishing.

## Database changes (Supabase CLI)

This repo is linked to the Supabase project with the CLI (`supabase/` folder). Schema changes go in `supabase/migrations/` as timestamped SQL files and are applied with:

```bash
supabase db push
```

Quick read-only checks against the live database: `supabase db query --linked "select ..."`. Without `--linked` the CLI looks for a local Docker database.
