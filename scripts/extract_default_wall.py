from __future__ import annotations

import base64
import pathlib
import re
import sys


def main() -> int:
    if len(sys.argv) != 2:
      print("Usage: python extract_default_wall.py <path-to-skinview3d.bundle.js>", file=sys.stderr)
      return 1

    js_path = pathlib.Path(sys.argv[1]).expanduser().resolve()
    if not js_path.is_file():
      print(f"JS file not found: {js_path}", file=sys.stderr)
      return 1

    js_text = js_path.read_text(encoding="utf-8", errors="ignore")
    match = re.search(r"var MC_RENDER_WALL = `data:image/jpeg;base64,([^`]+)`;", js_text, re.S)
    if not match:
      print("Could not find MC_RENDER_WALL in the provided JS file.", file=sys.stderr)
      return 1

    output_dir = pathlib.Path(__file__).resolve().parent.parent / "assets" / "image"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "default-wall.jpg"

    raw = base64.b64decode(match.group(1))
    output_path.write_bytes(raw)
    print(f"Wrote: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
