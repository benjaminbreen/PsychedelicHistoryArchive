# Repository Instructions

## Next.js Dev Server Hygiene

This repo includes `archive-site`, a Next.js app. Treat `.next` as a live dev-server artifact.

- Do not remove `archive-site/.next` while `npm run dev`, `next dev`, or `npx next dev` is running for `archive-site`.
- If a stale chunk error appears, such as `Cannot find module './611.js'`, assume the running dev server and `.next` directory are out of sync.
- To clear Next.js cache safely:
  1. Identify only the `archive-site` dev processes with `pgrep -af "next dev|npm run dev"` and confirm their command paths point to `archive-site`.
  2. Stop those `archive-site` dev processes.
  3. Remove `archive-site/.next` once the processes are stopped.
  4. Restart `npm run dev` from `archive-site`.
  5. Verify the target route with `curl -I`, for example `curl -I http://localhost:<port>/archive`.
- Do not kill unrelated `next dev` servers from other projects.
- If a dev server is already running and responding, prefer using it instead of starting another one.

## Verification

After UI changes in `archive-site`, do not run `npm run build` by default. A production build writes to `archive-site/.next`, the same artifact directory used by `next dev`, and can disrupt a dev server the user is already running.

Prefer lighter verification unless the user explicitly asks for a full build:

- For code/type confidence, use non-build checks when available, such as `npx tsc --noEmit`, lint scripts, or targeted tests.
- For visual/manual review, use the existing dev server if it is already running and responding.
- If a dev server is needed for screenshots or manual review, keep track of the port Next selects and report the current URL.
- Run `npm run build` only when explicitly requested, when release-level verification is needed, or when there is no active `archive-site` dev server and the user has not asked to avoid builds.

## Stubbed / Missing Pages Inventory

Current implemented app routes in `archive-site/src/app`:

- `/` via `src/app/page.tsx`
- `/about` via `src/app/about/page.tsx`
- `/archive` via `src/app/archive/page.tsx`
- `/archive/[slug]` via `src/app/archive/[slug]/page.tsx`

Routes linked from navigation or page content that still need real pages:

- `/people` - top-level Bios destination from the main nav and Browse by People.
- `/topics` - Browse by Topics destination from the homepage.
- `/collections` - main nav destination, archive intro "Read more" link, and featured collections links target this area.
- `/further-reading` - main nav destination and About page contextual link.
- `/submit-a-source` - About page project action.
- `/faq` - About page project action.

Routes handled as archive filters rather than standalone pages:

- `/archive?medium=Audio%2FVideo` - Audio/video nav item.
- `/archive?medium=Text` and Text dropdown era filters.
- `/archive?medium=Personal%20History` - Personal histories nav item.
- `/archive?people=...` - Bios dropdown person filters.
- `/archive?tag=...`, `/archive?era=...`, `/archive?type=...`, `/archive?medium=...` - chip, card, and filter links.

Suggested page-build priority:

1. `/people` because it is a primary nav destination and the Bios dropdown currently falls back to archive filters only.
2. `/topics` because the homepage Browse by Topics button currently points to a missing route.
3. `/collections` because it is linked from nav, archive intro, and the homepage collection section.
4. `/further-reading` because it is linked from nav and About copy.
5. `/submit-a-source` and `/faq` because they are secondary About-page actions.
