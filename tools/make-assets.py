#!/usr/bin/env python3
"""make-assets.py — post-traitement ComfyUI -> assets.json

Pour chaque image de out/ (générée en 832x1216) :
  1. crop central au ratio 5:7, master 400x560 dans masters/
  2. version intégration encodée directement dans le manifeste (base64)
  3. fusion dans assets.json (structure {"art": {...}, "bg": {...}}, base64, indent 1)

Budgets v1 (historique, sans --v2) : art 300x420 JPEG <= 30 Ko, fonds 960x540 <= 110 Ko.
Budgets v2 (charte §13, ACTÉ 10/11 nuit, avec --v2) : art 400x560 JPEG q78-82 (~40-70 Ko),
fonds 1216x832 JPEG q70-75 conservés tels quels (~150-250 Ko, pas de re-crop 16:9).
La limite « dist < 1 Mo tout en base64 » est levée ; le manifeste est chargé en fetch
au lancement, jamais embarqué dans dist.html.

Usage : python3 make-assets.py [--art out] [--assets assets.json] [--v2] [--no-masters]
                              [--exclude id1,id2,prefix-*]
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
# budgets v2 (charte §13) — (largeur, hauteur, qualité, plafond de sanité en octets)
V2_ART = (400, 560, 80, 90_000)     # ~40-70 Ko attendu, alerte > 90 Ko
V2_BG = (1216, 832, 72, 300_000)    # ~150-250 Ko attendu, alerte > 300 Ko


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


def arg(flag, default=None):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default


def main():
    out_dir = Path(arg("--art", "out"))
    assets_path = Path(arg("--assets", "assets.json"))
    v2 = "--v2" in sys.argv
    no_masters = "--no-masters" in sys.argv
    exclude = set((arg("--exclude") or "").split(",")) - {""}
    masters = out_dir.parent / "masters"
    if not no_masters:
        masters.mkdir(exist_ok=True)

    assets = json.loads(assets_path.read_text())
    assets.setdefault("art", {})
    assets.setdefault("bg", {})

    def excluded(stem):
        return any(stem == e or (e.endswith("-*") and stem.startswith(e[:-1])) for e in exclude)

    report = []
    for jpg in sorted(out_dir.glob("*.jpg")):
        if excluded(jpg.stem):
            continue
        img = Image.open(jpg).convert("RGB")
        is_bg = jpg.name.startswith("bg-")
        if v2:
            if is_bg:
                w, h, q, cap = V2_BG
                web_img = img.resize((w, h), Image.LANCZOS)  # fonds v2 conservés tels quels
                key = jpg.stem[3:]
                assets["bg"][key] = "data:image/jpeg;base64," + base64.b64encode(
                    _bytes(web_img, q)).decode("ascii")
            else:
                w, h, q, cap = V2_ART
                crop = crop_center(img, RATIO_ART)
                web_img = crop.resize((w, h), Image.LANCZOS)
                key = jpg.stem
                assets["art"][key] = "data:image/jpeg;base64," + base64.b64encode(
                    _bytes(web_img, q)).decode("ascii")
                if not no_masters:
                    crop.resize((w, h), Image.LANCZOS).save(masters / jpg.name, "JPEG", quality=q, optimize=True)
            data_len = len(base64.b64decode(assets["bg" if is_bg else "art"][key].split(",", 1)[1]))
            report.append((jpg.name, key, data_len, q, cap))
        elif is_bg:
            web_img = crop_center(img, RATIO_BG).resize((960, 540), Image.LANCZOS)
            data, q = encode_under_budget(web_img, MAX_BG_BYTES)
            key = jpg.stem[3:]  # bg-marees.jpg -> marees
            assets["bg"][key] = "data:image/jpeg;base64," + base64.b64encode(data).decode("ascii")
            if not no_masters:
                web_img.save(masters / jpg.name, "JPEG", quality=80, optimize=True)
            report.append((jpg.name, key, len(data), q, MAX_BG_BYTES))
        else:
            crop = crop_center(img, RATIO_ART)
            if not no_masters:
                crop.resize((400, 560), Image.LANCZOS).save(masters / jpg.name, "JPEG", quality=80, optimize=True)
            web_img = crop.resize((300, 420), Image.LANCZOS)
            data, q = encode_under_budget(web_img, MAX_ART_BYTES)
            key = jpg.stem
            assets["art"][key] = "data:image/jpeg;base64," + base64.b64encode(data).decode("ascii")
            report.append((jpg.name, key, len(data), q, MAX_ART_BYTES))

    text = json.dumps(assets, indent=1, ensure_ascii=True)
    non_ascii = [c for c in text if ord(c) > 127]
    assert not non_ascii, "JSON non-ASCII détecté (base64 doit être pur ASCII)"
    assets_path.write_text(text)

    print(f"{len(report)} image(s) intégrée(s) dans {assets_path} ({'v2' if v2 else 'v1'})")
    heavy = 0
    for name, key, size, q, cap in report:
        flag = "" if size <= cap else "  <-- AU-DESSUS DU PLAFOND v2"
        if size > cap:
            heavy += 1
        print(f"  {name:20s} -> {key:12s} {size // 1024:4d} Ko (q{q}){flag}")
    print(f"manifeste total : {assets_path.stat().st_size // 1024} Ko")
    print(f"arts : {len(assets['art'])}  fonds : {len(assets['bg'])}  au-dessus du plafond : {heavy}")


def _bytes(img, q):
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=q, optimize=True)
    return buf.getvalue()


if __name__ == "__main__":
    main()
