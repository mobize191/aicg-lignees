#!/usr/bin/env python3
"""make-assets.py — post-traitement ComfyUI -> assets.json

Pour chaque image de out/ (générée en 832x1216) :
  1. crop central au ratio 5:7, master 400x560 dans masters/
  2. version intégration 300x420 JPEG (qualité ajustée pour <= 30 Ko), encodée
     directement dans le manifeste
  3. fusion dans assets.json (structure {"art": {...}, "bg": {...}}, base64, indent 1)

Fonds (bg-*.jpg, générés en 1216x832) : crop central 16:9 -> 960x540 JPEG (<= 110 Ko).

Usage : python3 make-assets.py [--art out] [--assets assets.json]
Vérifie : pureté ASCII du JSON produit, poids par image et total.
"""
import base64
import io
import json
import sys
from pathlib import Path

from PIL import Image

MAX_ART_BYTES = 30_000
MAX_BG_BYTES = 110_000
RATIO_ART = 5 / 7      # 300x420
RATIO_BG = 16 / 9      # 960x540


def crop_center(img, ratio):
    w, h = img.size
    if w / h > ratio:   # trop large -> rogner la largeur
        nw = int(h * ratio)
        x = (w - nw) // 2
        return img.crop((x, 0, x + nw, h))
    nh = int(w / ratio)  # trop haut -> rogner la hauteur
    y = (h - nh) // 2
    return img.crop((0, y, w, y + nh))


def encode_under_budget(img, max_bytes):
    """JPEG en qualité décroissante jusqu'à passer sous le budget."""
    buf, q = None, None
    for q in range(72, 44, -4):
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=q, optimize=True)
        if buf.tell() <= max_bytes:
            break
    return buf.getvalue(), q


def main():
    out_dir = Path(sys.argv[sys.argv.index("--art") + 1] if "--art" in sys.argv else "out")
    assets_path = Path(sys.argv[sys.argv.index("--assets") + 1] if "--assets" in sys.argv else "assets.json")
    masters = out_dir.parent / "masters"
    masters.mkdir(exist_ok=True)

    assets = json.loads(assets_path.read_text())
    assets.setdefault("art", {})
    assets.setdefault("bg", {})

    report = []
    for jpg in sorted(out_dir.glob("*.jpg")):
        img = Image.open(jpg).convert("RGB")
        is_bg = jpg.name.startswith("bg-")
        if is_bg:
            web_img = crop_center(img, RATIO_BG).resize((960, 540), Image.LANCZOS)
            data, q = encode_under_budget(web_img, MAX_BG_BYTES)
            key = jpg.stem[3:]  # bg-marees.jpg -> marees
            assets["bg"][key] = "data:image/jpeg;base64," + base64.b64encode(data).decode("ascii")
            web_img.save(masters / jpg.name, "JPEG", quality=80, optimize=True)
        else:
            crop = crop_center(img, RATIO_ART)
            crop.resize((400, 560), Image.LANCZOS).save(masters / jpg.name, "JPEG", quality=80, optimize=True)
            web_img = crop.resize((300, 420), Image.LANCZOS)
            data, q = encode_under_budget(web_img, MAX_ART_BYTES)
            key = jpg.stem
            assets["art"][key] = "data:image/jpeg;base64," + base64.b64encode(data).decode("ascii")
        report.append((jpg.name, key, len(data), q))

    text = json.dumps(assets, indent=1, ensure_ascii=True)
    non_ascii = [c for c in text if ord(c) > 127]
    assert not non_ascii, "JSON non-ASCII détecté (base64 doit être pur ASCII)"
    assets_path.write_text(text)

    total = sum(r[2] for r in report)
    print(f"{len(report)} image(s) intégrée(s) dans {assets_path}")
    for name, key, size, q in report:
        budget = MAX_BG_BYTES if name.startswith("bg-") else MAX_ART_BYTES
        flag = "" if size <= budget else "  <-- TROP LOURD"
        print(f"  {name:20s} -> {key:12s} {size // 1024:4d} Ko (q{q}){flag}")
    print(f"manifeste total : {assets_path.stat().st_size // 1024} Ko")
    print(f"arts : {len(assets['art'])}  fonds : {len(assets['bg'])}")
    if assets_path.stat().st_size > 8 * 1024 * 1024:
        print("ATTENTION : manifeste > 8 Mo -> arrêter et demander (règle de budget du plan)")


if __name__ == "__main__":
    main()
