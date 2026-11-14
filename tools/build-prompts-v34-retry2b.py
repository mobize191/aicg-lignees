#!/usr/bin/env python3
# build-prompts-v34-retry2b.py — seconde passe sur e31-r, e31-o, e14-r (canon non tenu au 1er essai).
# Seeds 2150090 / 7150090 / 12150090 (le set 2150089 est réservé au lot optionnel d28).
import json

REPO = 'C:/Users/MOB/Documents/projet_data_IA/aicg-lignees'
src = json.load(open(REPO + '/tools/prompts-v34-retry2.json', encoding='utf-8'))
by_file = {p['file']: p for p in src}

HEADS = ('exactly three serpentine heads on long separate necks, all three heads fully visible '
         'and clearly distinct from each other')
NEG_HEADS = ', single head, two heads, one-headed creature, two-headed creature, hidden heads'

out = []

# e31-r : 3 têtes + scène calme
p = dict(by_file['e31-r.jpg'])
p['seed'] = 7150090
p['positive'] = p['positive'].replace(
    'exactly three serpentine heads on long necks, all three heads fully visible',
    HEADS)
p['positive'] = p['positive'].replace(
    'resting calmly among the coral',
    'resting calmly on the seabed among the coral, all three necks curved gently')
p['negative'] = p['negative'] + NEG_HEADS
out.append(p)

# e31-o : 3 têtes + aura spectrale
p = dict(by_file['e31-o.jpg'])
p['seed'] = 12150090
p['positive'] = p['positive'].replace(
    'exactly three serpentine heads on long necks, all three heads fully visible',
    HEADS)
p['negative'] = p['negative'] + NEG_HEADS
out.append(p)

# e14-r : posevraiment calme, gueule fermée
p = dict(by_file['e14-r.jpg'])
p['seed'] = 7150090 + 5000000 - 5000000  # 7150090
p['seed'] = 7150090
p['positive'] = p['positive'].replace(
    'resting peacefully on the seabed, eyes half-closed in calm',
    'lying down sleeping peacefully on the seabed, eyes gently closed, mouth closed, completely relaxed')
p['negative'] = p['negative'].replace(
    'attacking, menacing pose, open threatening maw, dramatic confrontation',
    'attacking, menacing pose, open mouth, bared teeth, glaring eyes, dramatic confrontation, '
    'roaring, lunging')
out.append(p)

with open(REPO + '/tools/prompts-v34-retry2b.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print('prompts-v34-retry2b.json :', len(out), 'entrées')
for p in out:
    print(' ', p['file'], p['seed'])
