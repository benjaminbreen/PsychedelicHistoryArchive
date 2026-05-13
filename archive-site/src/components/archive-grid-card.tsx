import { SourceCard } from "@/components/source-card";
import type { ArchiveSource } from "@/lib/types";

export function ArchiveGridCard({ source }: { source: ArchiveSource }) {
  return <SourceCard source={source} />;
}
