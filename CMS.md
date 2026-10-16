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

## For collaborators

The in-app guide (**How to contribute** in the sidebar) is the whole workflow. Decide what to add however you like (a Zoom call, a shared Google Doc). The workspace handles only adding, editing, previewing, and publishing.

## Database changes (Supabase CLI)

This repo is linked to the Supabase project with the CLI (`supabase/` folder). Schema changes go in `supabase/migrations/` as timestamped SQL files and are applied with:

```bash
supabase db push
```

Quick read-only checks against the live database: `supabase db query --linked "select ..."`. Without `--linked` the CLI looks for a local Docker database.
