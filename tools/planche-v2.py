#!/usr/bin/env python3
"""planche-v2.py — planches de contrôle par univers (53 références nommées vague 1).
Vignette 150x210 + id + genre + nom. Sortie : final/planche-<univers>.png"""
import json, os
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
OUT = HERE / 'final'
W, H, LBL = 150, 210, 26

def main():
    prompts = {p['id']: p for p in json.load(open(HERE / 'prompts-v2.json', encoding='utf-8'))}
    refs = [p for p in prompts.values() if p.get('reference')]
    by_uni = {}
    for p in refs:
        by_uni.setdefault(p['universe'], []).append(p)
    for uni, items in sorted(by_uni.items()):
        items = sorted(items, key=lambda p: p['id'])
        cols = 6
        rows = (len(items) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * W, rows * (H + LBL)), (24, 24, 30))
        d = ImageDraw.Draw(sheet)
        for i, p in enumerate(items):
            x, y = (i % cols) * W, (i // cols) * (H + LBL)
            f = OUT / (p['id'] + '.jpg')
            if f.exists():
                t = Image.open(f).convert('RGB')
                t.thumbnail((W - 6, H - 6))
                sheet.paste(t, (x + (W - t.width) // 2, y + (H - t.height) // 2))
            g = (p.get('gender') or '-').replace('1', '')
            d.text((x + 4, y + H + 2), f"{p['id']} {g}", fill=(230, 230, 240))
            d.text((x + 4, y + H + 14), p['name'][:22], fill=(150, 150, 170))
        dst = OUT / f'planche-{uni}.png'
        sheet.save(dst, 'PNG')
        print('planche :', dst.name, '-', len(items), 'refs')

if __name__ == '__main__':
    main()
