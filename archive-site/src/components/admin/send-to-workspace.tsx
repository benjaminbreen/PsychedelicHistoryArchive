"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendToWorkspace } from "@/app/admin/candidates/actions";
import type { PendingNomination } from "@/lib/corpus-nominations";

// Turns reviewed finds (add / maybe) into proposals in the shared workspace.
export function SendToWorkspace({ pending }: { pending: PendingNomination[] }) {
  const [result, setResult] = useState<{ sent: number; failed: string[] } | null>(null);
  const [busy, start] = useTransition();
  const router = useRouter();
  if (!pending.length && !result) return null;
  return <div className="cms-card cms-send">
    {result ? <p className={result.failed.length ? "cms-error" : "cms-success"} role="status">
      {result.sent} {result.sent === 1 ? "proposal" : "proposals"} sent. <Link href="/admin/sources">Open Sources → Proposals</Link>
      {result.failed.length > 0 && <> · {result.failed.length} failed: {result.failed.slice(0, 3).join("; ")}</>}
    </p> : <>
      <div><strong>{pending.length} reviewed {pending.length === 1 ? "find is" : "finds are"} ready to propose.</strong> <span className="cms-field-help">Each becomes a private draft under Sources → Proposals, where every editor can see it. Nothing is public until someone publishes it.</span></div>
      <details><summary>Which ones</summary><ul>{pending.map(n => <li key={n.candidateId}>{n.title}{n.year ? ` (${n.year})` : ""}{n.decision === "maybe" ? " · maybe" : ""}</li>)}</ul></details>
      <button className="cms-primary" disabled={busy} onClick={() => start(async () => { setResult(await sendToWorkspace()); router.refresh(); })}>{busy ? "Sending…" : `Send ${pending.length} to the workspace`}</button>
    </>}
  </div>;
}
