import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About | The Psychedelic History Archive",
  description:
    "Learn about the mission, scope, and current development of The Psychedelic History Archive."
};

const projectLinks = [
  {
    label: "Suggest a source",
    href: "/submit-a-source",
    description: "Texts, images, audio, biographies, and personal histories are welcome."
  },
  {
    label: "Meet the team",
    href: "/project-team",
    description: "Project team and advisory board."
  },
  {
    label: "Read the FAQ",
    href: "/faq",
    description: "Rights, reuse, submissions, and project background."
  }
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader variant="about" />
      <main className="about-page">
        <section className="about-hero" aria-labelledby="about-title">
          <img
            alt=""
            aria-hidden="true"
            className="about-hero-image"
            src="/images/hubbard.jpeg"
          />
          <div className="about-hero-shell">
            <div className="about-title-wrap">
              <p className="display-label text-[0.78rem] text-archive-ink/70">
                Mission and scope
              </p>
              <h1 id="about-title" className="about-display-title">
                About
              </h1>
            </div>

            <article className="about-panel">
              <div className="about-copy">
                <p>
                  <strong>The Psychedelic History Archive</strong> is a digital
                  collection focused on the broad and varied history of
                  psychedelic substances over the last 500 years. We document not
                  only the well-known contributions of twentieth-century
                  scientists, but also the roles of Indigenous cultures,
                  lesser-known researchers, and personal experiences submitted by
                  the public.
                </p>

                <p>
                  The Archive was founded by{" "}
                  <a href="https://benjaminpbreen.com" rel="noreferrer" target="_blank">
                    Benjamin Breen
                  </a>{" "}
                  at the University of California, Santa Cruz in 2024, then
                  developed with UCSC student contributors and collaborators.
                  In 2026, the project received a grant from the Mahindra
                  Humanities Center at Harvard. The current team and advisory
                  board are listed on the{" "}
                  <Link href="/project-team">project team page</Link>.
                </p>

                <p>
                  This project aims to provide a scholarly context for
                  psychedelics as they gain mainstream acceptance in the 2020s.
                  Our inspirations include{" "}
                  <a href="https://erowid.org" rel="noreferrer" target="_blank">
                    Erowid
                  </a>{" "}
                  and the works of scholarship included in the{" "}
                  <Link href="/further-reading">further reading section</Link>.
                </p>
              </div>

              <div className="about-actions" aria-label="Project links">
                {projectLinks.map((item) => (
                  <Link className="about-action-link focus-ring" href={item.href} key={item.href}>
                    <span>
                      <span className="about-action-title">{item.label}</span>
                      <span className="about-action-description">{item.description}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
