#!/usr/bin/env python3
# crop-signatures-v33.py — vague 3.3 : crop 4 % du coin bas-droit sur TOUTE la production
# 400x560 (tools/out-v2/v33/*.jpg, hors sous-dossier masters/) pour éliminer les signatures
# d'artiste. Vérification des bordures sombres (liseré = cadre généré) : signalées, crop identique.
import sys
from pathlib import Path
from PIL import Image
import numpy as np

REPO = Path('C:/Users/MOB/Documents/projet_data_IA/aicg-lignees/tools/out-v2')
DIRS = [REPO / 'v33']


def main():
    total = 0
    dark_border = []
    for d in DIRS:
        if not d.exists():
            continue
        for f in sorted(d.glob('*.jpg')):
            img = Image.open(f).convert('RGB')
            a = np.asarray(img, dtype=np.int16)
            h, w = a.shape[:2]
            edge = a[:, -3:].mean()
            mid = a[:, w // 2 - 2: w // 2 + 2].mean()
            if edge < mid - 12:
                dark_border.append(str(f))
            cw, ch = int(w * 0.96), int(h * 0.96)
            img.crop((0, 0, cw, ch)).save(f, 'JPEG', quality=88)
            total += 1
    print('crop 4% appliqué sur', total, 'images')
    print('bordures sombres détectées :', len(dark_border))
    for b in dark_border[:40]:
        print('  ', b)


if __name__ == '__main__':
    main()
