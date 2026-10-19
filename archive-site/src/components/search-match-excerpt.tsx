import type { SearchMatchSummary } from "@/lib/search-types";

// Shows where a source matched a search: the closest sentences in bold, with a
// little surrounding context, or a plain snippet when no passage was picked.
export function SearchMatchExcerpt({ className, clampClassName, match }: { className: string; clampClassName: string; match?: SearchMatchSummary }) {
  if (!match?.passage && !match?.snippet) return null;
  const { passage } = match;
  return (
    <p className={`${className} ${passage ? "" : clampClassName} border-l-2 border-archive-violet/45 pl-3 text-archive-muted`}>
      <span className="font-semibold text-archive-violet">{match.label}:</span>{" "}
      {passage ? (
        <>
          {passage.before && <>{passage.before} </>}
          <strong className="font-semibold text-archive-ink">{passage.highlight}</strong>
          {passage.after && <> {passage.after}</>}
        </>
      ) : (
        match.snippet
      )}
    </p>
  );
}
