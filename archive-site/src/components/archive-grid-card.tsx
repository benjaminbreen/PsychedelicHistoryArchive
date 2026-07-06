import { SourceCard } from "@/components/source-card";
import type { SearchMatchSummary } from "@/lib/search-types";
import type { ArchiveSource } from "@/lib/types";

export function ArchiveGridCard({ match, source }: { match?: SearchMatchSummary; source: ArchiveSource }) {
  return <SourceCard match={match} source={source} />;
}
