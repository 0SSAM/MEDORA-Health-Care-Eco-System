#!/usr/bin/env python3
"""Prepare per-chunk audit inputs: concatenate each chunk's files into a single text file."""
import os, sys

repo = "/home/ubuntu/MEDORA-Integrated-Health-System"

def chunk_files(chunk: str) -> list[str]:
    path = f"/tmp/audit_chunk_{chunk}"
    return [l.strip() for l in open(path) if l.strip()]

if __name__ == "__main__":
    for chunk in ["00", "01", "02", "03", "04"]:
        files = chunk_files(chunk)
        out_path = f"/tmp/audit_input_{chunk}.md"
        with open(out_path, "w") as out:
            out.write(f"# Audit input for chunk {chunk} ({len(files)} files)\n\n")
            for rel in files:
                full = os.path.join(repo, rel)
                if not os.path.exists(full):
                    out.write(f"\n\n---\n\n## FILE NOT FOUND IN WORKING TREE: {rel}\n\n")
                    continue
                try:
                    data = open(full, "rb").read()
                    # handle images
                    if rel.endswith((".png", ".svg")):
                        out.write(f"\n\n---\n\n## {rel} [binary, size={len(data)} bytes] — verify it renders and is referenced correctly\n\n")
                        continue
                    text = data.decode("utf-8", errors="replace")
                except Exception as e:
                    out.write(f"\n\n---\n\n## {rel} [read error: {e}]\n\n")
                    continue
                out.write(f"\n\n---\n\n# FILE: {rel} (size {len(text)} chars)\n\n```\n{text}\n```\n")
        print(f"wrote {out_path}: {sum(os.path.getsize(os.path.join(repo,f)) for f in files if os.path.exists(os.path.join(repo,f)))} bytes")
