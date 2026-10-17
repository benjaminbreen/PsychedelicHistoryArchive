import json, uuid, httpx, pathlib, sys
S = pathlib.Path(__file__).parent
env = dict(l.split("=", 1) for l in pathlib.Path("archive-site/.env.local").read_text().splitlines() if "=" in l and not l.startswith("#"))
url, key = env["SUPABASE_URL"].strip().strip('"'), env["SUPABASE_SERVICE_ROLE_KEY"].strip().strip('"')
h = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
def doc_id(slug):
    head = (S / "full" / f"{slug}.txt").read_text().split("\n\n", 1)[0]
    return next(l.split(" ", 1)[1] for l in head.splitlines() if l.startswith("DOC "))
def get(did):
    return httpx.get(f"{url}/rest/v1/source_working_copies", params={"document_id": f"eq.{did}", "select": "version,payload"}, headers=h).json()[0]
def save(did, payload, version):
    r = httpx.post(f"{url}/rest/v1/rpc/cms_save_draft", json={"source_id": did, "edit_payload": payload, "expected_version": version, "actor_id": None}, headers=h)
    r.raise_for_status()
EXPECTED = 3
done, skipped = [], []
for f in sorted((S / "built").glob("*.json")):
    b = json.loads(f.read_text()); did = doc_id(b["slug"]); wc = get(did); p = wc["payload"]
    if wc["version"] != EXPECTED or (p.get("proposal") or {}).get("status") != "proposed":
        skipped.append((b["slug"], wc["version"], (p.get("proposal") or {}).get("status"))); continue
    doc = {**p["document"], **b["fields"]}
    if b.get("translation"):
        doc["translation_text"] = b["translation"]
    p["document"] = doc
    p["sections"] = [{"id": str(uuid.uuid4()), "heading": "Reading text", "section_type": "transcript", "body": b["transcript"], "body_format": "markdown", "position": 10}]
    if b.get("author"):
        p["people"] = [{"name": b["author"], "role": "author"}]
    p["editorNotes"] = (b.get("editor_notes", "") + "\n\n---\n\n" + (p.get("editorNotes") or "")).strip()
    save(did, p, wc["version"]); done.append((b["slug"], b["transcript_words"], b.get("translation_words", 0)))
# merged duplicate: the Echo de Paris advert
did = doc_id("l-echo-paris"); wc = get(did); p = wc["payload"]
if wc["version"] == EXPECTED and p["proposal"]["status"] == "proposed":
    p["proposal"].update(status="declined", decidedBy="Merged during drafting", decisionNote="Merged into the Peyote-Tramni record (L'Écho de Paris 1933 + Le Petit Journal 1934).")
    save(did, p, wc["version"]); done.append(("l-echo-paris (declined: merged)", 0, 0))
else:
    skipped.append(("l-echo-paris", wc["version"], p["proposal"]["status"]))
for d in done: print("updated", d)
for s in skipped: print("SKIPPED (changed since)", s)
