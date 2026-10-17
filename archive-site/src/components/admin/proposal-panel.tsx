"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { Proposal } from "@/lib/cms/model";

// Shown at the top of a draft that was proposed for the archive. Editors read why it
// was proposed, then accept it (it becomes an ordinary draft to work on) or decline it.
export function ProposalPanel({ proposal, sourceUrl, onChange }: { proposal: Proposal; sourceUrl: string; onChange: (proposal: Proposal) => void }) {
  const [declining, setDeclining] = useState(false);
  const [note, setNote] = useState("");
  const by = [proposal.proposedBy && `Proposed by ${proposal.proposedBy}`, proposal.proposedOn].filter(Boolean).join(" · ");
  const found = proposal.origin === "corpus-scan" ? "Found by the Common Corpus scan" : null;
  const prov = proposal.provenance || {};
  const decide = (status: Proposal["status"], decisionNote = "") => onChange({ ...proposal, status, decisionNote, decidedBy: undefined, decidedOn: undefined });

  if (proposal.status === "accepted") {
    return <details className="cms-proposal accepted"><summary>Accepted proposal{proposal.decidedBy ? ` · ${proposal.decidedBy}` : ""}{proposal.decidedOn ? `, ${proposal.decidedOn}` : ""}</summary><Body /></details>;
  }
  return <section className={`cms-proposal ${proposal.status}`} aria-label="Proposal">
    <div className="cms-proposal-head">
      <span className={`cms-badge ${proposal.status === "proposed" ? "proposed" : ""}`}>{proposal.status === "proposed" ? "Proposed" : "Declined"}</span>
      <span>{[by, found].filter(Boolean).join(" · ")}</span>
    </div>
    <Body />
    {proposal.status === "declined" && <p className="cms-proposal-decision">Declined{proposal.decidedBy ? ` by ${proposal.decidedBy}` : ""}{proposal.decidedOn ? ` on ${proposal.decidedOn}` : ""}{proposal.decisionNote ? `: ${proposal.decisionNote}` : "."}</p>}
    <div className="cms-row" style={{ marginTop: 14 }}>
      {proposal.status === "proposed" && !declining && <>
        <button className="cms-primary" onClick={() => decide("accepted")}>Accept and start editing</button>
        <button onClick={() => setDeclining(true)}>Decline…</button>
        <span className="cms-field-help">Accepting keeps it as a private draft for the team to fill out. Declining keeps the record but takes it off the Proposals list.</span>
      </>}
      {declining && <div style={{ width: "100%" }}>
        <label>Why not? <span className="cms-field-help">Optional; helps the next person, and the scan</span><textarea autoFocus rows={2} value={note} onChange={e => setNote(e.target.value)} /></label>
        <div className="cms-row"><button className="cms-primary" onClick={() => { decide("declined", note.trim()); setDeclining(false); }}>Decline proposal</button><button className="cms-quiet" onClick={() => setDeclining(false)}>Cancel</button></div>
      </div>}
      {proposal.status === "declined" && <button onClick={() => decide("proposed")}>Reopen proposal</button>}
    </div>
  </section>;

  function Body() {
    return <>
      {proposal.rationale && <p className="cms-proposal-why">{proposal.rationale}</p>}
      {proposal.excerpt && <blockquote className="cms-proposal-excerpt">{proposal.excerpt}</blockquote>}
      {(sourceUrl || prov.collection) && <p className="cms-proposal-meta">
        {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">Open the original <ExternalLink size={12} /></a>}
        {prov.collection && <span>{[prov.collection, prov.identifier, prov.archive_fit && `screen rating ${prov.archive_fit}/5`].filter(Boolean).join(" · ")}</span>}
      </p>}
    </>;
  }
}
