import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-4 border-archive-lavender bg-archive-lavender/20">
      <div className="container-page grid gap-8 py-9 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.9fr)_minmax(18rem,0.95fr)] lg:items-start">
        <div className="max-w-xl">
          <div className="font-display text-2xl font-normal uppercase tracking-[0.01em] text-archive-ink">
          </div>
          <p className="mt-3 max-w-md text-md leading-6 text-archive-muted">
            An open access digital archive preserving the history of psychedelics,
            altered states, and consciousness research.
          </p>
          <p className="mt-5 max-w-md text-[0.78rem] font-light uppercase leading-5 tracking-[0.16em] text-archive-muted">
            Sponsored by the Humanities Institute, UC Santa Cruz,
            and the Mahindra Humanities Center, Harvard University
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-6 sm:grid-cols-[repeat(2,minmax(8rem,1fr))]" aria-label="Footer">
          {[
            {
              title: "Explore",
              links: [
                ["Archive", "/archive"],
                ["People", "/people"],
                ["Topics", "/topics"],
                ["Collections", "/collections"]
              ]
            },
            {
              title: "Project",
              links: [
                ["About", "/about"],
                ["Further Reading", "/further-reading"],
                ["FAQ", "/faq"],
                ["Suggest a Source", "/submit-a-source"]
              ]
            }
          ].map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-archive-muted">
                {group.title}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link className="transition hover:text-archive-violet" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <form className="max-w-md" action="#" aria-label="Newsletter sign up">
          <label className="block max-w-sm text-sm leading-snug text-archive-ink" htmlFor="footer-email">
            <span className="underline decoration-archive-ink/60 underline-offset-4">
              Sign up for our newsletter
            </span>{" "}
            for occasional updates.
          </label>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              className="focus-ring h-12 min-w-0 flex-1 rounded-sm border border-archive-line bg-archive-surface px-4 text-sm text-archive-ink placeholder:text-archive-faint"
              id="footer-email"
              name="email"
              placeholder="Email address"
              type="email"
            />
            <button
              className="focus-ring inline-flex h-12 items-center justify-center rounded-sm border-2 border-archive-ink px-5 text-sm font-bold transition hover:border-archive-violet hover:text-archive-violet"
              type="submit"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>

      <div className="bg-black text-archive-lavender/70">
        <div className="container-page grid min-h-28 items-center gap-5 py-5 text-center md:grid-cols-[1fr_auto_1fr] md:text-left">
          <div className="font-display text-lg uppercase tracking-[0.12em]">
            The Psychedelic History Archive
          </div>
          <Image
            alt=""
            aria-hidden="true"
            className="footer-fish-mark mx-auto h-20 w-auto"
            height={334}
            priority={false}
            src="/images/footer-fish-mark.png"
            width={292}
          />
          <div className="font-display text-xs uppercase tracking-[0.12em] md:text-right">
            Copyright 2026 &bull; Made in Santa Cruz, California
          </div>
        </div>
      </div>
    </footer>
  );
}
