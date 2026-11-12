#!/usr/bin/env python3
# gen-serie3-eq.py — série 3 : vague 1 (7 cartes, seeds 2132000+) puis vague 2 (90 équipements,
# seeds 2140000+, IPAdapter 0.4 ease in-out end 0.85 depuis l'art palier C pour les paliers R/SR).
# Attend la fin de gen-v31.py (TERMINE v31 dans le log) avant de soumettre, pour ne pas saturer le GPU.
# Masters -> state/masters-s3 ; prod -> tools/out-v2/s3/ (cartes 400x560 q80, objets 400x560 q80).
import json, os, shutil, sys, time

BASE = 'C:/Users/MOB/Documents/projet_data_IA'
REPO = BASE + '/aicg-lignees'
STATE = BASE + '/ComfyUI/output/out-v2/state'
MASTERS = STATE + '/masters-s3'
OUT = REPO + '/tools/out-v2/s3'
LOG31 = REPO + '/tools/out-v2-run-v31.log'

import importlib.util
spec = importlib.util.spec_from_file_location('gv31', REPO + '/tools/gen-v31.py')
gv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gv)


def wait_v31():
    print('attente fin de la phase 1 (271 jobs au log)...', flush=True)
    while True:
        try:
            with open(STATE + '/run-log-v31.json', encoding='utf-8') as f:
                n = len(json.load(f))
            if n >= 271:
                break
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        time.sleep(30)
    print('phase 1 terminée (271 jobs), lancement série 3', flush=True)


def convert(masters_dir, out_dir):
    from PIL import Image
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(out_dir + '/masters', exist_ok=True)
    n = 0
    for f in sorted(os.listdir(masters_dir)):
        if not f.endswith('.png'):
            continue
        stem = f[:-4]
        img = Image.open(os.path.join(masters_dir, f)).convert('RGB')
        shutil.copy(os.path.join(masters_dir, f), os.path.join(out_dir, 'masters', f))
        w, h = img.size
        nw = int(h * 5 / 7)
        x = (w - nw) // 2
        img.crop((x, 0, x + nw, h)).resize((400, 560), Image.LANCZOS).save(os.path.join(out_dir, stem + '.jpg'), 'JPEG', quality=80)
        n += 1
    print('conversion s3 :', n, 'fichiers dans', out_dir, flush=True)


def run_list(items, log, ipa_map=None, adetailer=True):
    os.makedirs(MASTERS, exist_ok=True)
    logpath = STATE + '/run-log-s3.json'
    done = set()
    if os.path.exists(logpath):
        with open(logpath, encoding='utf-8') as f:
            log.extend(json.load(f))
        done = {e['tag'] for e in log}
    for item in items:
        tag = item['id']
        if tag in done and os.path.exists(os.path.join(MASTERS, tag + '.png')):
            print('>>> skip', tag, flush=True)
            continue
        ipa_image = None
        if ipa_map and item['id'] in ipa_map:
            src_png = os.path.join(MASTERS, ipa_map[item['id']] + '.png')
            if os.path.exists(src_png):
                ipa_image = ipa_map[item['id']] + '.png'
                shutil.copy(src_png, BASE + '/ComfyUI/input/' + ipa_image)
            else:
                print('>>> REF IPA manquante pour', tag, flush=True)
        # objets seuls : pas d'ADetailer visage
        item2 = dict(item)
        item2['bg'] = item.get('bg', not adetailer)
        print('>>> generation', tag, 'seed', item['seed'], 'ipa=' + str(ipa_image), flush=True)
        try:
            nodes = gv.workflow(item2, f'out-v2/masters-s3/{tag}', ipa_image)
            blob = gv.queue_and_wait(nodes, tag, log)
        except Exception as e:
            print('    ECHEC', tag, ':', str(e)[:300], flush=True)
            log.append({'tag': tag, 'seed': item['seed'], 'error': str(e)[:300]})
            with open(logpath, 'w', encoding='utf-8') as f:
                json.dump(log, f, ensure_ascii=False, indent=1)
            continue
        with open(os.path.join(MASTERS, tag + '.png'), 'wb') as f:
            f.write(blob)
        with open(logpath, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=1)


def main():
    maxn = None
    if '--max' in sys.argv:
        maxn = int(sys.argv[sys.argv.index('--max') + 1])
        print('mode --max', maxn, flush=True)
    wait_v31()
    log = []
    with open(REPO + '/tools/prompts-serie3.json', encoding='utf-8') as f:
        s3 = json.load(f)
    print('=== série 3 vague 1 :', len(s3), 'cartes', flush=True)
    run_list(s3, log, adetailer=True)
    with open(REPO + '/tools/prompts-eq-serie3.json', encoding='utf-8') as f:
        eq = json.load(f)
    print('=== série 3 vague 2 :', len(eq), 'équipements', flush=True)
    # paliers C d'abord (sans IPA), puis R/SR avec IPAdapter depuis le palier C de la même pièce
    ipa_map = {p['id']: p['ipaFrom'] for p in eq if p.get('ipaFrom')}
    order = [p for p in eq if p['palier'] == 'C'] + [p for p in eq if p['palier'] != 'C']
    if maxn:
        logpath = STATE + '/run-log-s3.json'
        done = set()
        if os.path.exists(logpath):
            with open(logpath, encoding='utf-8') as f:
                done = {e['tag'] for e in json.load(f)}
        todo = [p for p in s3 if p['id'] not in done] + [p for p in order if p['id'] not in done]
        todo = todo[:maxn]
        ipa_m = dict(ipa_map)
        run_list(todo, log, ipa_map=ipa_m, adetailer=True)
        print('CHUNK DONE --max', maxn, flush=True)
        return
    run_list(order, log, ipa_map=ipa_map, adetailer=False)
    convert(MASTERS, OUT)
    print('TERMINE s3 :', len(log), 'entrées au log', flush=True)


if __name__ == '__main__':
    main()
