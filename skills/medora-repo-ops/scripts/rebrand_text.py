#!/usr/bin/env python3
"""Safely replace brand text in an explicit set of text files.

Usage:
  rebrand_text.py --old MEDORA --new MEDORA --files README.md docs/overview.md
  rebrand_text.py --old MEDORA --new MEDORA --files README.md --write

The default mode is dry-run. Binary files are rejected by extension and by a NUL-byte check.
"""
from __future__ import annotations

import argparse
from pathlib import Path

BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".gz",
    ".woff", ".woff2", ".ttf", ".otf", ".mp3", ".mp4", ".mov", ".sqlite", ".db",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Dry-run or apply a deterministic text replacement.")
    parser.add_argument("--old", required=True)
    parser.add_argument("--new", required=True)
    parser.add_argument("--files", nargs="+", required=True)
    parser.add_argument("--write", action="store_true", help="write changes; otherwise print a dry-run")
    args = parser.parse_args()

    changed = 0
    for raw_path in args.files:
        path = Path(raw_path)
        if path.suffix.lower() in BINARY_EXTENSIONS:
            raise SystemExit(f"Refusing binary-looking file: {path}")
        data = path.read_bytes()
        if b"\x00" in data:
            raise SystemExit(f"Refusing binary file: {path}")
        text = data.decode("utf-8")
        count = text.count(args.old)
        if not count:
            continue
        changed += count
        print(f"{path}: {count} replacement(s)")
        if args.write:
            path.write_text(text.replace(args.old, args.new), encoding="utf-8")

    print(f"Total replacements: {changed}; mode={'write' if args.write else 'dry-run'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
