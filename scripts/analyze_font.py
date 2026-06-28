import sys
import os
from fontTools.ttLib import TTFont

if len(sys.argv) < 2:
    print(f"Usage: python {sys.argv[0]} <path/to/font.ttf>")
    sys.exit(1)

input_path = sys.argv[1]
if not os.path.isfile(input_path):
    print(f"File not found: {input_path}")
    sys.exit(1)

font = TTFont(input_path)

print(f"=== Font: {input_path} ===\n")

# File size
size = os.path.getsize(input_path)
print(f"File size: {size:,} bytes ({size / 1024:.1f} KB)")

# Number of glyphs
print(f"Number of glyphs: {len(font.getGlyphOrder())}")

# Tables
print(f"\nTables ({len(font.keys())}):")
for tag in sorted(font.keys()):
    print(f"  {tag}")

# Name table
if "name" in font:
    print(f"\nName table entries:")
    for record in font["name"].names:
        try:
            string = record.toUnicode()
        except:
            string = repr(record.string)
        print(
            f"  nameID={record.nameID} platformID={record.platformID} langID={record.langID}: {string[:120]}"
        )

# OS/2 table
if "OS/2" in font:
    os2 = font["OS/2"]
    print(f"\nOS/2:")
    print(f"  weightClass: {os2.usWeightClass}")
    print(f"  widthClass: {os2.usWidthClass}")
    print(f"  fsType: {os2.fsType}")
    print(f"  panose: {os2.panose}")

# cmap - list all mapped characters
if "cmap" in font:
    cmap = font.getBestCmap()
    if cmap:
        print(f"\nCharacter map ({len(cmap)} entries):")
        chars = sorted(cmap.keys())
        # Group: ASCII printable, ASCII extended, CJK, other
        ascii_print = [c for c in chars if 0x20 <= c <= 0x7E]
        ascii_ext = [c for c in chars if 0x80 <= c <= 0xFF]
        cjk = [c for c in chars if 0x4E00 <= c <= 0x9FFF]
        other = [c for c in chars if c > 0xFF and not (0x4E00 <= c <= 0x9FFF)]

        if ascii_print:
            print(
                f"  ASCII printable ({len(ascii_print)}): "
                + "".join(chr(c) if 0x20 <= c <= 0x7E else "?" for c in ascii_print)
            )
        if ascii_ext:
            print(
                f"  Latin-1 Supplement ({len(ascii_ext)}): "
                + " ".join(f"U+{c:04X}" for c in ascii_ext[:20])
            )
        if cjk:
            print(
                f"  CJK Unified Ideographs ({len(cjk)}): first 10: "
                + " ".join(f"U+{c:04X}" for c in cjk[:10])
            )
        if other:
            print(
                f"  Other ({len(other)}): first 20: "
                + " ".join(f"U+{c:04X}" for c in other[:20])
            )

        # Check for space
        if 0x20 in chars:
            print(f"\n  ✅ Space character (U+0020) present")
        else:
            print(f"\n  ❌ Space character (U+0020) MISSING!")

        # Check for hyphen
        if 0x2D in chars:
            print(f"  ✅ Hyphen (U+002D) present")
        else:
            print(f"  ⚠️  Hyphen (U+002D) MISSING")

        # Check period
        if 0x2E in chars:
            print(f"  ✅ Period (U+002E) present")
        else:
            print(f"  ⚠️  Period (U+002E) MISSING")

# head table - check unitsPerEm
if "head" in font:
    head = font["head"]
    print(f"\nhead:")
    print(f"  unitsPerEm: {head.unitsPerEm}")
    print(f"  macStyle: {head.macStyle}")
    print(f"  flags: {head.flags}")

# Check if font is likely valid for web use
has_cmap = "cmap" in font
has_glyf = "glyf" in font or "CFF " in font or "CFF2" in font
has_head = "head" in font
has_hhea = "hhea" in font
has_hmtx = "hmtx" in font
has_maxp = "maxp" in font
has_name = "name" in font
has_os2 = "OS/2" in font
has_post = "post" in font

required = {
    "cmap": has_cmap,
    "glyf/CFF": has_glyf,
    "head": has_head,
    "hhea": has_hhea,
    "hmtx": has_hmtx,
    "maxp": has_maxp,
    "name": has_name,
    "OS/2": has_os2,
    "post": has_post,
}
missing = [k for k, v in required.items() if not v]
if missing:
    print(f"\n⚠️  Missing required tables: {', '.join(missing)}")
else:
    print(f"\n✅ All required tables present")

font.close()
