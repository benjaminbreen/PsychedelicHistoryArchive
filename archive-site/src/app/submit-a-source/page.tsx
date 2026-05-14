import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page/page-header";
import { PageShell } from "@/components/page/page-shell";

export const metadata: Metadata = {
  title: "Suggest a Source | The Psychedelic History Archive",
  description: "Suggest a source for inclusion in The Psychedelic History Archive."
};

export default function SubmitSourcePage() {
  return (
    <>
      <SiteHeader activeLabel="About" />
      <PageShell className="py-8">
        <PageHeader
          title="Suggest a Source"
          description={
            <p>
              Share a citation, repository link, scan, or lead for a primary source that should be represented in the archive.
            </p>
          }
        />
        <section className="mt-7 rounded-md border border-archive-line bg-archive-surface p-5">
          <form className="grid gap-4" action="mailto:bebreen@ucsc.edu" method="post" encType="text/plain">
            <label className="grid gap-2 text-sm font-semibold text-archive-ink">
              Your email
              <input className="focus-ring h-11 rounded-md border border-archive-line bg-archive-paper px-3 font-normal" name="email" type="email" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-archive-ink">
              Source title or citation
              <input className="focus-ring h-11 rounded-md border border-archive-line bg-archive-paper px-3 font-normal" name="source" required type="text" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-archive-ink">
              Link or repository information
              <input className="focus-ring h-11 rounded-md border border-archive-line bg-archive-paper px-3 font-normal" name="link" type="url" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-archive-ink">
              Notes
              <textarea className="focus-ring min-h-36 rounded-md border border-archive-line bg-archive-paper px-3 py-2 font-normal leading-6" name="notes" />
            </label>
            <button className="focus-ring inline-flex h-11 w-fit items-center rounded-md border border-archive-ink px-5 text-sm font-bold transition hover:border-archive-violet hover:text-archive-violet" type="submit">
              Send suggestion
            </button>
          </form>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}
