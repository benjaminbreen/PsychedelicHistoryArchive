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
    label: "Read the FAQ",
    href: "/faq",
    description: "Rights, reuse, submissions, and project background."
  }
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
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
                  The Archive is currently a work in progress, having soft
                  launched in the summer of 2024. The project is directed by{" "}
                  <a href="https://benjaminpbreen.com" rel="noreferrer" target="_blank">
                    Benjamin Breen
                  </a>{" "}
                  (Associate Professor of History, University of California,
                  Santa Cruz) and was initially supported by a grant from{" "}
                  <a href="https://thi.ucsc.edu" rel="noreferrer" target="_blank">
                    The Humanities Institute
                  </a>{" "}
                  at UCSC. We are currently seeking continuing funding to
                  greatly expand the range of resources available.
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
