import sys
import os
from fontTools.subset import Subsetter, Options

if len(sys.argv) < 2:
    print(f"Usage: python {sys.argv[0]} <path/to/font.ttf>")
    sys.exit(1)

input_path = sys.argv[1]
if not os.path.isfile(input_path):
    print(f"File not found: {input_path}")
    sys.exit(1)

from fontTools.ttLib import TTFont

font = TTFont(input_path)

chars = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-."
unicodes = [ord(c) for c in chars]

opts = Options()
opts.notdef_outline = True
opts.layout_features = "*"
opts.name_IDs = "*"
opts.name_legacy = True
opts.drop_tables = []
subsetter = Subsetter(options=opts)
subsetter.populate(unicodes=unicodes)
subsetter.subset(font)

base = os.path.splitext(input_path)[0]
if base.endswith(".sub"):
    base = base[:-4]
output_path = base + ".sub.ttf"
font.save(output_path)
print(f"Saved subset font: {output_path}")
