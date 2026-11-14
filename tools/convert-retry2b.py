#!/usr/bin/env python3
# convert-retry2.py — convertit les 7 masters du retry ciblé (masters-v34) en jpg production :
# crop signature 4 % bas-droit sur le master, puis crop central 5/7, resize 400x560 q80,
# mêmes noms de fichiers dans tools/out-v2/v34/ (remplacement des clés existantes).
# Consigne aussi les seeds dans tools/seeds-v34.csv.
import json, os, shutil
from PIL import Image

BASE = 'C:/Users/MOB/Documents/projet_data_IA'
REPO = BASE + '/aicg-lignees'
MASTERS = BASE + '/ComfyUI/output/out-v2/state/masters-v34'
OUT = REPO + '/tools/out-v2/v34'

TAGS = ['e31-r', 'e31-o', 'e14-r']
SEEDS = {'e31': 2150086, 'e31-r': 7150090, 'e31-o': 12150090,
         's18': 2150087, 's18-r': 7150087, 's18-o': 12150087, 'e14-r': 7150090}

os.makedirs(os.path.join(OUT, 'masters'), exist_ok=True)
for tag in TAGS:
    src = os.path.join(MASTERS, tag + '.png')
    assert os.path.exists(src), 'master manquant: ' + src
    img = Image.open(src).convert('RGB')
    w, h = img.size
    cw, ch = int(w * 0.96), int(h * 0.96)          # crop signature 4 % bas-droit
    img = img.crop((0, 0, cw, ch))
    w, h = img.size
    nw = int(h * 5 / 7)                              # ratio carte 5/7, crop central
    x = (w - nw) // 2
    img.crop((x, 0, x + nw, h)).resize((400, 560), Image.LANCZOS).save(
        os.path.join(OUT, tag + '.jpg'), 'JPEG', quality=80)
    shutil.copy(src, os.path.join(OUT, 'masters', tag + '.png'))
    print('OK', tag + '.jpg', SEEDS[tag])

with open(REPO + '/tools/seeds-v34.csv', 'a', encoding='utf-8') as f:
    for tag in TAGS:
        f.write(tag + '.jpg,' + str(SEEDS[tag]) + '\n')
print('seeds consignés dans seeds-v34.csv')
