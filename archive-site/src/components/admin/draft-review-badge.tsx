import type { DraftReviewStatus } from "@/lib/draft-sources";

export function DraftReviewBadge({ status }: { status: DraftReviewStatus }) {
  const className =
    status === "accepted"
      ? "border-green-200 bg-green-50 text-green-800"
      : status === "rejected"
        ? "border-red-200 bg-red-50 text-red-800"
        : status === "hold"
          ? "border-yellow-200 bg-archive-warning text-yellow-900"
          : "border-archive-line bg-archive-lavender2 text-archive-muted";

  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] ${className}`}>
      {status}
    </span>
  );
}
