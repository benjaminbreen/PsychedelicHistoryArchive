"""Shared helpers for the post-scan pipeline (embed, rank, screen, export).

OpenRouter calls use only the standard library. The API key is read from
OPENROUTER_API_KEY in the environment, or else from the .env.local file named
by OPENROUTER_ENV_FILE (default: ~/Code/Historical Forecasting/.env.local). It
is never printed.
"""

from __future__ import annotations

import base64
import glob
import gzip
import hashlib
import json
import os
import re
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np

EMBED_MODEL = "qwen/qwen3-embedding-8b"
EMBED_DIMS = 1024
EMBED_URL = "https://openrouter.ai/api/v1/embeddings"
CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_ENV_FILE = Path.home() / "Code" / "Historical Forecasting" / ".env.local"
MAX_EMBED_CHARS = 4000  # ~300 OCR'd words is ~2,000 chars; this only trims outliers


# ---------------------------------------------------------------------------
# Key and HTTP
# ---------------------------------------------------------------------------


def api_key() -> str:
    if os.environ.get("OPENROUTER_API_KEY"):
        return os.environ["OPENROUTER_API_KEY"]
    path = Path(os.environ.get("OPENROUTER_ENV_FILE", DEFAULT_ENV_FILE))
    if path.exists():
        for line in path.read_text().splitlines():
            if line.startswith("OPENROUTER_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit(f"OPENROUTER_API_KEY not set and not found in {path}")


class AccountError(SystemExit):
    pass


def post_json(url: str, body: dict, key: str, timeout: int = 180, tries: int = 6) -> dict:
    """POST with retries on transient errors. Raises ValueError on a non-transient 4xx."""
    data = json.dumps(body).encode()
    last = ""
    for attempt in range(tries):
        req = urllib.request.Request(url, data=data, headers={
            "Authorization": f"Bearer {key}", "Content-Type": "application/json",
            "X-Title": "Psychedelic History Archive corpus scan"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            last = f"{e.code} {e.read()[:300]!r}"
            if e.code in (401, 402, 403):
                raise AccountError(f"account error, stopping: {last}")
            if 400 <= e.code < 500 and e.code not in (408, 429):
                raise ValueError(last)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ConnectionError) as e:
            last = repr(e)[:300]
        time.sleep(min(60, 2 ** attempt))
    raise RuntimeError(f"gave up after {tries} tries: {last}")


class Ledger:
    """Running spend across invocations; stops the run at a cap."""

    def __init__(self, path: Path, cap: float):
        self.path, self.cap = path, cap
        self.spent = json.loads(path.read_text())["spent"] if path.exists() else 0.0
        self.tokens = json.loads(path.read_text()).get("tokens", 0) if path.exists() else 0

    def add(self, cost: float, tokens: int = 0) -> None:
        self.spent += cost or 0.0
        self.tokens += tokens or 0
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps({"spent": round(self.spent, 6), "tokens": self.tokens}))
        os.replace(tmp, self.path)
        if self.spent > self.cap:
            raise SystemExit(f"spend cap ${self.cap} reached (${self.spent:.4f}); stopping")


# ---------------------------------------------------------------------------
# Embeddings
# ---------------------------------------------------------------------------


def _embed_once(texts: list[str], key: str) -> tuple[np.ndarray, float, int]:
    body = {"model": EMBED_MODEL, "input": texts, "dimensions": EMBED_DIMS, "encoding_format": "base64"}
    d = post_json(EMBED_URL, body, key)
    rows = sorted(d.get("data") or [], key=lambda e: e["index"])
    if len(rows) != len(texts):
        raise RuntimeError(f"got {len(rows)}/{len(texts)} vectors")
    vecs = [np.frombuffer(base64.b64decode(e["embedding"]), dtype=np.float32) if isinstance(e["embedding"], str)
            else np.asarray(e["embedding"], dtype=np.float32) for e in rows]
    u = d.get("usage") or {}
    return np.vstack(vecs), float(u.get("cost") or 0.0), int(u.get("prompt_tokens") or u.get("total_tokens") or 0)


def embed_batch(texts: list[str], key: str) -> tuple[np.ndarray, float, int]:
    """Embed one batch. A batch the API rejects is split until the bad text is
    isolated; a single text that still fails gets a near-zero vector (logged)."""
    texts = [t[:MAX_EMBED_CHARS] or " " for t in texts]
    try:
        return _embed_once(texts, key)
    except AccountError:
        raise
    except (ValueError, RuntimeError) as e:
        if len(texts) > 1:
            print(f"  splitting batch of {len(texts)} after: {str(e)[:200]}", flush=True)
            h = len(texts) // 2
            a, ca, ta = embed_batch(texts[:h], key)
            b, cb, tb = embed_batch(texts[h:], key)
            return np.vstack([a, b]), ca + cb, ta + tb
        print(f"  zero vector for one text after: {str(e)[:200]} | {texts[0][:80]!r}", flush=True)
        v = np.zeros((1, EMBED_DIMS), dtype=np.float32)
        v[0, 0] = 1e-6
        return v, 0.0, 0


def embed_to_shards(records: list[tuple[str, str]], out_dir: Path, *, batch: int = 96, shard_size: int = 8192,
                    concurrency: int = 8, cap: float = 10.0, limit: int | None = None) -> None:
    """Embed (id, text) pairs into out_dir/shard-NNNNN.npy + .ids.txt, resumably.

    Ids already present in any finished shard are skipped, so rerunning carries
    on where it stopped. Vectors are L2-normalised and stored as float16. Each
    shard's .npy is written atomically before its .ids.txt, and a shard counts
    only once both exist.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    done = set()
    n_shards = 0
    for ids_path in sorted(out_dir.glob("shard-*.ids.txt")):
        if ids_path.with_name(ids_path.name.replace(".ids.txt", ".npy")).exists():
            done.update(ids_path.read_text().splitlines())
            n_shards = max(n_shards, int(ids_path.name[6:11]) + 1)
    todo = [r for r in records if r[0] not in done]
    if limit is not None:
        todo = todo[:limit]
    print(f"{len(todo):,} to embed ({len(done):,} already done, {len(records):,} total)", flush=True)
    if not todo:
        return
    key = api_key()
    ledger = Ledger(out_dir / "spend.json", cap)
    t0 = time.time()
    with ThreadPoolExecutor(concurrency) as pool:
        for s in range(0, len(todo), shard_size):
            part = todo[s : s + shard_size]
            batches = [part[i : i + batch] for i in range(0, len(part), batch)]
            res = list(pool.map(lambda b: embed_batch([t for _, t in b], key), batches))
            X = np.vstack([v for v, _, _ in res])
            X /= np.maximum(np.linalg.norm(X, axis=1, keepdims=True), 1e-12)
            name = f"shard-{n_shards:05d}"
            tmp = out_dir / f"{name}.tmp.npy"
            np.save(tmp, X.astype(np.float16))
            os.replace(tmp, out_dir / f"{name}.npy")
            (out_dir / f"{name}.ids.tmp").write_text("\n".join(i for i, _ in part) + "\n")
            os.replace(out_dir / f"{name}.ids.tmp", out_dir / f"{name}.ids.txt")
            n_shards += 1
            ledger.add(sum(c for _, c, _ in res), sum(t for _, _, t in res))
            print(f"  {name}: {len(part):,} vectors | {s + len(part):,}/{len(todo):,} | "
                  f"${ledger.spent:.4f} total, {ledger.tokens:,} tokens | {(time.time() - t0) / 60:.1f} min", flush=True)


def load_shards(emb_dir: Path) -> tuple[list[str], np.ndarray]:
    ids, mats = [], []
    for npy in sorted(Path(emb_dir).glob("shard-*.npy")):
        if npy.name.endswith(".tmp.npy"):
            continue
        ids_path = npy.with_name(npy.stem + ".ids.txt")
        if not ids_path.exists():
            continue
        part_ids = ids_path.read_text().splitlines()
        X = np.load(npy)
        assert len(part_ids) == len(X), f"{npy}: {len(part_ids)} ids vs {len(X)} rows"
        ids += part_ids
        mats.append(X)
    if not mats:
        return [], np.zeros((0, EMBED_DIMS), dtype=np.float16)
    return ids, np.vstack(mats)


# ---------------------------------------------------------------------------
# Hits
# ---------------------------------------------------------------------------


def hit_files(run_dir: Path) -> list[str]:
    return sorted(glob.glob(str(Path(run_dir) / "hits" / "**" / "*.jsonl.gz"), recursive=True))


def iter_hits(run_dir: Path):
    for f in hit_files(run_dir):
        with gzip.open(f, "rt", encoding="utf-8") as fh:
            for line in fh:
                if line.strip():
                    yield json.loads(line)


_WS = re.compile(r"\s+")


def dedup_key(text: str, n: int = 30) -> str:
    """Normalised hash of the first and last n words: catches reprints."""
    words = _WS.sub(" ", text.lower()).strip().split(" ")
    return hashlib.sha1((" ".join(words[:n]) + " || " + " ".join(words[-n:])).encode()).hexdigest()[:20]


def doc_key(hit: dict) -> str:
    """One key per source document (row) in the scanned dataset."""
    return f"{hit.get('dataset')}|{hit.get('source_file')}|{hit.get('row')}"


def write_jsonl(path: Path, rows, gz: bool = False) -> None:
    tmp = path.with_name(path.name + ".tmp")
    opener = gzip.open if gz else open
    with opener(tmp, "wt", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    os.replace(tmp, path)


def read_jsonl(path: Path) -> list[dict]:
    opener = gzip.open if str(path).endswith(".gz") else open
    with opener(path, "rt", encoding="utf-8") as fh:
        return [json.loads(l) for l in fh if l.strip()]
