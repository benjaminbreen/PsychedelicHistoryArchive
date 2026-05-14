import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page/page-header";
import { PageShell } from "@/components/page/page-shell";

export const metadata: Metadata = {
  title: "FAQ | The Psychedelic History Archive",
  description: "Frequently asked questions about The Psychedelic History Archive."
};

const questions = [
  {
    question: "What kinds of sources are included?",
    answer:
      "The archive focuses on public-domain, openly available, or clearly attributable historical materials: texts, images, audio/video records, biographies, and contextual metadata."
  },
  {
    question: "Can I reuse archive materials?",
    answer:
      "Reuse depends on the rights statement attached to each source. Public-domain and externally hosted items should still be checked against the holding repository or cited source."
  },
  {
    question: "Why do some records link out instead of hosting files?",
    answer:
      "Some records are metadata-only or externally hosted because the archive has not completed rights review, file ingest, or page-level OCR for that source."
  },
  {
    question: "How can I suggest a source?",
    answer:
      "Use the source suggestion page to send a citation, repository link, or description. Priority goes to historically significant material with clear provenance."
  }
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader activeLabel="About" />
      <PageShell className="py-8">
        <PageHeader
          title="FAQ"
          description={<p>Answers to common questions about scope, access, rights, and submissions.</p>}
        />
        <section className="mt-7 divide-y divide-archive-line rounded-md border border-archive-line bg-archive-surface">
          {questions.map((item) => (
            <article className="p-5" key={item.question}>
              <h2 className="font-serif text-xl font-semibold text-archive-ink">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-archive-muted">{item.answer}</p>
            </article>
          ))}
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}
