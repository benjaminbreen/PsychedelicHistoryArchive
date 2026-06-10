#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


DEFAULT_PROMPT = (
    "Historical public television transcript. Preserve proper names and technical terms: "
    "NET Journal; LSD: Lettvin vs Leary; Timothy Leary; Jerome Lettvin; Austin Hoyt; "
    "League for Spiritual Discovery; MIT; Harvard; LSD; lysergic acid diethylamide; "
    "marijuana; psilocybin; sacrament; consciousness; temporal lobe epilepsy; "
    "Wilder Penfield; Herbert Jasper; Ravi Shankar; Jonas Mekas."
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Whisper over audio chunks with resumable per-chunk outputs.")
    parser.add_argument("chunks_dir", type=Path, help="Directory containing chunk audio files.")
    parser.add_argument("output_dir", type=Path, help="Directory for per-chunk Whisper outputs.")
    parser.add_argument("--model", default="small", help="Whisper model name. Defaults to cached small model.")
    parser.add_argument("--language", default="English")
    parser.add_argument("--prompt", default=DEFAULT_PROMPT)
    parser.add_argument("--fake-numba-path", type=Path, default=Path("tools/fake_numba"))
    parser.add_argument("--force", action="store_true", help="Retranscribe chunks even if JSON output exists.")
    return parser.parse_args()


def chunk_key(path: Path) -> str:
    return path.stem


def main() -> int:
    args = parse_args()
    chunks = sorted(args.chunks_dir.glob("*.wav"))
    if not chunks:
        print(f"No .wav chunks found in {args.chunks_dir}", file=sys.stderr)
        return 1

    args.output_dir.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    fake_numba = str(args.fake_numba_path.resolve())
    env["PYTHONPATH"] = fake_numba if not env.get("PYTHONPATH") else f"{fake_numba}:{env['PYTHONPATH']}"

    manifest = []
    for index, chunk in enumerate(chunks, start=1):
        out_base = args.output_dir / chunk_key(chunk)
        out_json = out_base.with_suffix(".json")
        out_txt = out_base.with_suffix(".txt")
        if out_json.exists() and out_txt.exists() and not args.force:
            print(f"[{index}/{len(chunks)}] skip {chunk.name} (already transcribed)")
            status = "skipped"
        else:
            print(f"[{index}/{len(chunks)}] transcribe {chunk.name}", flush=True)
            cmd = [
                "whisper",
                str(chunk),
                "--model",
                args.model,
                "--language",
                args.language,
                "--task",
                "transcribe",
                "--output_dir",
                str(args.output_dir),
                "--output_format",
                "all",
                "--fp16",
                "False",
                "--initial_prompt",
                args.prompt,
            ]
            subprocess.run(cmd, check=True, env=env)
            status = "transcribed"

        manifest.append(
            {
                "chunk": chunk.name,
                "json": out_json.name,
                "txt": out_txt.name,
                "status": status,
            }
        )
        (args.output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
