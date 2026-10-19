"""Build complete draft content from specs/<slug>.json + full/<slug>.txt -> built/<slug>.json."""
import json, re, sys
from pathlib import Path

S = Path(__file__).parent
(S / "built").mkdir(exist_ok=True)
only = set(sys.argv[1:])
for spec_path in sorted((S / "specs").glob("*.json")):
    spec = json.loads(spec_path.read_text())
    slug = spec["slug"]
    if only and slug not in only:
        continue
    if spec.get("transcript_text"):  # hand-reconstructed where the OCR is unusable
        out = {**spec, "transcript": (spec.get("note", "") + "\n\n" + spec["transcript_text"]).strip(),
               "transcript_words": len(spec["transcript_text"].split()), "translation_words": len(spec.get("translation", "").split())}
        (S / "built" / f"{slug}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
        print(f"{slug}: hand transcript {out['transcript_words']} words, translation {out['translation_words']} words")
        continue
    raw = (S / "full" / f"{slug}.txt").read_text().split("\n\n", 1)[1]
    raw = " ".join(raw.split())
    parts = []
    for seg in spec.get("segments") or [{"start": spec["start"], "end_before": spec.get("end_before"), "end_after": spec.get("end_after")}]:
        a = raw.find(seg["start"])
        if a < 0:
            sys.exit(f"{slug}: start marker not found: {seg['start'][:60]}")
        if seg.get("end_before"):
            b = raw.find(seg["end_before"], a + len(seg["start"]))
        elif seg.get("end_after"):
            b = raw.find(seg["end_after"], a)
            b = b + len(seg["end_after"]) if b >= 0 else -1
        else:
            b = len(raw)
        if b < 0:
            sys.exit(f"{slug}: end marker not found")
        parts.append((seg.get("join", "\n\n[…]\n\n"), raw[a:b].strip()))
    body = "".join(j + t for j, t in parts).removeprefix(parts[0][0])
    missing = []
    for junk in spec.get("remove", []):
        if junk in body:
            body = body.replace(junk, " ")
        else:
            missing.append("remove: " + junk[:40])
    for pattern in spec.get("remove_regex", []):
        body, n = re.subn(pattern, " ", body)
        if not n:
            missing.append("remove_regex: " + pattern[:40])
    if spec.get("dehyphenate"):
        body = re.sub(r"(\w)[-¬\u00ad] (\w)", r"\1\2", body)
    body = re.sub(r"  +", " ", body)
    for pattern, repl in spec.get("regex_fixes", []):
        body = re.sub(pattern, repl, body)
    for old, new in spec.get("fixes", []):
        if old in body:
            body = body.replace(old, new)
        else:
            missing.append(old[:50])
    for marker in spec.get("breaks", []):
        if marker in body:
            body = body.replace(marker, "\n\n" + marker, 1)
        else:
            missing.append("break: " + marker[:40])
    body = re.sub(r"\n[ \t]+", "\n", re.sub(r"\n{3,}", "\n\n", body)).strip()
    transcript = (spec.get("note", "") + "\n\n" + body).strip()
    out = {**spec, "transcript": transcript, "transcript_words": len(body.split()),
           "translation_words": len(spec.get("translation", "").split())}
    (S / "built" / f"{slug}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"{slug}: transcript {out['transcript_words']} words, translation {out['translation_words']} words" + (f" | NOT APPLIED: {missing}" if missing else ""))
