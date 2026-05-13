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

After UI changes in `archive-site`, run `npm run build` for type/build verification. If a dev server is needed for screenshots or manual review, keep track of the port Next selects and report the current URL.
