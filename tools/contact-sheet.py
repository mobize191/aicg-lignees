#!/usr/bin/env python3
"""contact-sheet.py — planche de contrôle par univers (grille de vignettes annotées).

Usage : python3 contact-sheet.py <dossier_out> <sortie.png> [--cols 6]
Chaque vignette : image 150x210 + nom de fichier sous l'image.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

W, H, LBL = 150, 210, 16


def main():
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    cols = int(sys.argv[sys.argv.index("--cols") + 1]) if "--cols" in sys.argv else 6
    files = sorted(src.glob("*.jpg"))
    if not files:
        print("aucun jpg dans", src)
        sys.exit(1)
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * W, rows * (H + LBL)), (24, 24, 30))
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(files):
        x, y = (i % cols) * W, (i // cols) * (H + LBL)
        thumb = Image.open(f).convert("RGB")
        thumb.thumbnail((W - 6, H - 6))
        sheet.paste(thumb, (x + (W - thumb.width) // 2, y + (H - thumb.height) // 2))
        d.text((x + 4, y + H + 2), f.stem, fill=(230, 230, 240))
    sheet.save(dst, "PNG")
    print("planche :", dst, "-", len(files), "vignettes")


if __name__ == "__main__":
    main()
