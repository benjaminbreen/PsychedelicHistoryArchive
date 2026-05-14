import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page/page-header";
import { PageShell } from "@/components/page/page-shell";

export const metadata: Metadata = {
  title: "Further Reading | The Psychedelic History Archive",
  description: "Selected scholarship and reference works for psychedelic history."
};

const readings = [
  {
    title: "American Trip: Set, Setting, and the Psychedelic Experience in the Twentieth Century",
    author: "Ido Hartogsohn",
    note: "A social and cultural history of set and setting as a framework for psychedelic experience."
  },
  {
    title: "The Trials of Psychedelic Therapy",
    author: "Matthew Oram",
    note: "A history of LSD psychotherapy, regulation, and clinical research in the United States."
  },
  {
    title: "Storming Heaven: LSD and the American Dream",
    author: "Jay Stevens",
    note: "A narrative history of LSD, counterculture, and mid-century American experimentation."
  },
  {
    title: "High Priest",
    author: "Timothy Leary",
    note: "A primary-source account of early psychedelic experimentation and its mythology."
  },
  {
    title: "The Road to Eleusis",
    author: "R. Gordon Wasson, Albert Hofmann, and Carl A. P. Ruck",
    note: "An influential argument about psychoactive substances and ancient mystery religions."
  },
  {
    title: "The Hasheesh Eater",
    author: "Fitz Hugh Ludlow",
    note: "A nineteenth-century American literary account of cannabis intoxication."
  }
];

export default function FurtherReadingPage() {
  return (
    <>
      <SiteHeader activeLabel="About" />
      <PageShell className="py-8">
        <PageHeader
          title="Further Reading"
          description={
            <p>
              A working bibliography for readers who want more historical context around the archive sources.
            </p>
          }
        />
        <section className="mt-7 grid gap-3">
          {readings.map((item) => (
            <article className="rounded-md border border-archive-line bg-archive-surface p-5" key={`${item.author}-${item.title}`}>
              <h2 className="font-serif text-xl font-semibold leading-snug text-archive-ink">{item.title}</h2>
              <p className="mt-1 text-sm font-semibold text-archive-violet">{item.author}</p>
              <p className="mt-3 text-sm leading-6 text-archive-muted">{item.note}</p>
            </article>
          ))}
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}
