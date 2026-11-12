#!/usr/bin/env python3
# gen-retry-v31.py — retries QA vague 3.1 / série 3 (max 2 par asset, diff de seed, négatif ajusté
# selon la classe de défaut). Usage : python3 gen-retry-v31.py <classe> [--max N]
# Classes : beast-humanoid | dark-face | signature | framing-ur | eq-human
import importlib.util, json, os, sys

BASE = 'C:/Users/MOB/Documents/projet_data_IA'
REPO = BASE + '/aicg-lignees'
STATE = BASE + '/ComfyUI/output/out-v2/state'

spec = importlib.util.spec_from_file_location('gv31', REPO + '/tools/gen-v31.py')
gv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gv)

RETRIES = {
    # (id, source) — source: v31 (cartes vague 3.1) ou s3 (série 3)
    'beast-humanoid': [('e14', 'v31'), ('e13', 'v31'), ('f13', 'v31')],
    'dark-face':      [('f18', 'v31'), ('d6', 'v31'), ('g16', 'v31'), ('k14', 'v31'), ('z8', 'v31'), ('n7', 'v31')],
    'signature':      [('z19', 'v31'), ('z22', 'v31'), ('g7', 'v31'), ('k14', 'v31'), ('g16', 'v31')],
    'framing-ur':     [('b3', 'v31')],
    'eq-human':       [('eq-set-bosquet-base-armure', 's3')],
}
BOOST = {
    'beast-humanoid': ('quadruped or serpentine body, no arms, no humanoid torso, no legs standing upright',
                       'humanoid, human, arms, bipedal, human posture, armor, clothes'),
    'dark-face': ('bright front lighting, face fully visible and illuminated, eyes clearly visible, bareheaded',
                  'hood, dark face, face in shadow, shadow over face, mask, covered face'),
    'signature': ('', 'artist signature, signed, name in corner, cropped signature, watermark'),
    'framing-ur': ('full body, entire figure visible head to feet, standing', 'half body, waist up, bust, close-up, portrait'),
    'eq-human': ('floating alone on a plain neutral background, product illustration, no wearer',
                 'person, wearer, model, mannequin, hands, humanoid, character, figure'),
}


def main():
    classe = sys.argv[1]
    maxn = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 99
    items = RETRIES[classe][:maxn]
    p3 = json.load(open(REPO + '/tools/prompts-v3.json', encoding='utf-8'))
    ps3 = json.load(open(REPO + '/tools/prompts-serie3.json', encoding='utf-8'))
    peq = json.load(open(REPO + '/tools/prompts-eq-serie3.json', encoding='utf-8'))
    srcs = {'v31': {p['id']: p for p in p3}, 's3': {**{p['id']: p for p in ps3}, **{p['id']: p for p in peq}}}
    log = []
    logpath = STATE + '/run-log-retry-v31.json'
    if os.path.exists(logpath):
        log = json.load(open(logpath, encoding='utf-8'))
    done = {e['tag'] for e in log if e.get('classe') == classe}
    pos_b, neg_b = BOOST[classe]
    for rid, src in items:
        if rid in done:
            print('>>> skip (retry déjà fait)', rid, flush=True)
            continue
        item = dict(srcs[src][rid])
        item['positive'] = (pos_b + ', ' if pos_b else '') + item['positive']
        negs = [t.strip() for t in item['negative'].split(',') if t.strip()]
        for t in [x.strip() for x in neg_b.split(',') if x.strip()]:
            if t not in negs:
                negs.append(t)
        item['negative'] = ', '.join(negs[:20])
        item['seed'] = item['seed'] + 1  # diff de seed (retry 1)
        masters = STATE + ('/masters-v31' if src == 'v31' else '/masters-s3')
        os.makedirs(masters, exist_ok=True)
        print('>>> retry', classe, rid, 'seed', item['seed'], flush=True)
        try:
            nodes = gv.workflow(item, f'out-v2/{"masters-v31" if src == "v31" else "masters-s3"}/{rid}-r1', None)
            blob = gv.queue_and_wait(nodes, rid + '-r1', log)
        except Exception as e:
            print('    ECHEC', rid, str(e)[:200], flush=True)
            log.append({'tag': rid + '-r1', 'classe': classe, 'seed': item['seed'], 'error': str(e)[:200]})
            json.dump(log, open(logpath, 'w', encoding='utf-8'), indent=1)
            continue
        with open(os.path.join(masters, rid + '.png'), 'wb') as f:
            f.write(blob)
        log.append({'tag': rid + '-r1', 'classe': classe, 'seed': item['seed'], 'ok': True})
        json.dump(log, open(logpath, 'w', encoding='utf-8'), indent=1)
    print('TERMINE retry', classe, flush=True)


if __name__ == '__main__':
    main()
