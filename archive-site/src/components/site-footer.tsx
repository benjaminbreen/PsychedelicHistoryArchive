import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-archive-line bg-archive-lavender2">
      <div className="container-page grid gap-8 py-8 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div>
          <div className="font-display text-2xl font-normal uppercase tracking-[0.01em]">
            The Psychedelic History Archive
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-archive-muted">
            An open access digital archive preserving the history of psychedelics,
            altered states, and consciousness research.
          </p>
        </div>
        {[
          ["About the archive", "Mission and scope", "Editorial policy", "How to contribute"],
          ["Help", "Research guide", "Using the archive", "Citation guide"],
          ["Connect", "Newsletter", "Bluesky", "Contact"],
          ["Legal", "Terms of use", "Privacy policy", "Accessibility"]
        ].map((group) => (
          <div key={group[0]}>
            <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-archive-muted">
              {group[0]}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {group.slice(1).map((item) => (
                <li key={item}>
                  <Link className="transition hover:text-archive-violet" href="#">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
