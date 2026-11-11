#!/usr/bin/env python3
# gen-vague3.py — campagne v3 (spec correction-prompts-v3.md) : prompts-v3.json (271), seeds = seeds-v2.csv.
# WAI v17 canon §15 (Euler a + normal, 28 steps, CFG 5.5, hires x1.25 denoise 0.4, ADetailer visage 0.32, VAE baked).
# Ordre (pas de point d'arrêt, choix Marc-Olivier 11/11) : 6 témoins d'abord, puis 53 refs + 6 fonds,
# 212 génériques (185 nus + 27 série 2 en IPAdapter 0.4 ease in-out end 0.85), héros + 2 stills.
# Masters -> ComfyUI/output/out-v2/state/masters-v3/<id>.png ; prod -> tools/out-v2/v3/<id>.jpg (budgets §13).
import importlib.util, json, os, shutil

spec = importlib.util.spec_from_file_location('gv', 'C:/Users/MOB/Documents/projet_data_IA/aicg-lignees/tools/gen-vague2.py')
gv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gv)

BASE = 'C:/Users/MOB/Documents/projet_data_IA'
REPO = BASE + '/aicg-lignees'
STATE = BASE + '/ComfyUI/output/out-v2/state'
MASTERS = STATE + '/masters-v3'
OUT = REPO + '/tools/out-v2/v3'
TEMOINS = ['e14', 'f18', 'd6', 'z19', 'a15', 'g16']  # en tête de la planche de contrôle
SERIE2 = ['q1','q2','q3','q4','q5','q6','t1','t2','t3','t4','t5','t6',
          'u1','u2','u3','u4','u5','u6','v1','v2','v3','v4','v5','v6','p1','p3','p4']
SERIE2_IPA_SRC = {'q1':'q6','q2':'q6','q3':'q6','q4':'q6','q5':'q6',
                  't1':'t6','t2':'t6','t3':'t6','t4':'t6','t5':'t6',
                  'u1':'u6','u2':'u6','u3':'u6','u4':'u6','u5':'u6',
                  'v1':'v6','v2':'v6','v3':'v6','v4':'v6','v5':'v6'}

STYLE_V3 = ('Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, '
            'intricate background, epic fantasy splash artwork, rim lighting')
NEG_V3 = ('bad quality, worst quality, worst detail, sketch, censor, nsfw, card frame, card border, ornate border, '
          'picture frame, text, letters, watermark, signature, logo')
HERO = {
    'id': 'heros-errance', 'file': 'heros-errance.jpg', 'name': "Héroïne de l'errance",
    'rarity': 'UR', 'universe': 'naissance', 'named': True, 'bg': False, 'species': 'human', 'gender': '1girl',
    'age': 'adulte', 'framing': 'full body', 'seed': 2129001,
    'positive': ('A woman adventurer with long white hair wearing a black cape, an adult with a mysterious elegant aura, '
                 'in a neutral adventurer setting, full body, standing, centered, looking at the viewer, front lighting, visible face. ' + STYLE_V3),
    'negative': NEG_V3 + ', close-up, blue skin, helmet',
}
STILLS = {
    'bg-hub-ville': {
        'positive': ('A vast sunny medieval town square: cobblestone plaza, stone fountain in the center with gentle water, '
                     'market stalls with colorful striped awnings, bustling villagers, timber houses, warm golden daylight, birds, '
                     'cinematic wide shot, no card frame. ' + STYLE_V3),
        'negative': NEG_V3},  # hub : villageois présents (habité), juste anti-cadre/texte
    'bg-marees-combat': {
        'positive': ('A vast underwater sunken temple battlefield: ancient stone pillars and arches, crashing turquoise waves, '
                     'sea foam swirls, coral reef, shafts of filtered sunlight, drifting glowing particles, deep blue and turquoise '
                     'with coral accents, epic cinematic wide shot, no humans. ' + STYLE_V3),
        'negative': NEG_V3 + ', people, creatures, humans, character, 1girl, 1boy'},
}


def convert_all():
    from PIL import Image
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(OUT + '/masters', exist_ok=True)
    n = 0
    for f in sorted(os.listdir(MASTERS)):
        if not f.endswith('.png'):
            continue
        stem = f[:-4]
        img = Image.open(os.path.join(MASTERS, f)).convert('RGB')
        shutil.copy(os.path.join(MASTERS, f), os.path.join(OUT, 'masters', f))
        if stem.startswith('bg-'):
            img.resize((1216, 832), Image.LANCZOS).save(os.path.join(OUT, stem + '.jpg'), 'JPEG', quality=72)
        else:
            w, h = img.size
            nw = int(h * 5 / 7)
            x = (w - nw) // 2
            img.crop((x, 0, x + nw, h)).resize((400, 560), Image.LANCZOS).save(os.path.join(OUT, stem + '.jpg'), 'JPEG', quality=80)
        n += 1
    print('conversion v3 :', n, 'fichiers dans', OUT, flush=True)


def run(jobs, log):
    for item, tag, ipa_image in jobs:
        if os.path.exists(os.path.join(MASTERS, tag + '.png')):
            print('>>> skip (déjà fait)', tag, flush=True)
            continue
        if ipa_image:
            src_png = os.path.join(MASTERS, ipa_image + '.png')
            if not os.path.exists(src_png):
                print('>>> REF MANQUANTE', tag, ipa_image, flush=True)
                continue
            shutil.copy(src_png, BASE + '/ComfyUI/input/' + ipa_image + '.png')
        print('>>> v3', tag, 'seed', item['seed'], 'ipa=' + str(ipa_image), 'vram', gv.vram(), 'MB', flush=True)
        nodes = gv.workflow(item, f'out-v2/masters-v3/{tag}', ipa_image + '.png' if ipa_image else None)
        blob = gv.queue_and_wait(nodes, tag, log)
        with open(os.path.join(MASTERS, tag + '.png'), 'wb') as f:
            f.write(blob)
        with open(STATE + '/run-log-vague3.json', 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=1)


def main():
    data = json.load(open(REPO + '/tools/prompts-v3.json', encoding='utf-8'))
    byid = {p['id']: p for p in data}
    os.makedirs(MASTERS, exist_ok=True)
    logpath = STATE + '/run-log-vague3.json'
    log = json.load(open(logpath, encoding='utf-8')) if os.path.exists(logpath) else []

    # ÉTAPE 1 : les 6 témoins EN PREMIER
    run([(byid[t], t, None) for t in TEMOINS], log)
    # ÉTAPE 2 : 53 refs (témoins déjà faits) + 6 fonds
    run([(byid[p['id']], p['id'], None) for p in data if p.get('reference') and p['id'] not in TEMOINS], log)
    run([(byid[p['id']], p['id'], None) for p in data if p.get('bg')], log)
    # ÉTAPE 3 : 212 génériques (185 hors série 2)
    run([(byid[p['id']], p['id'], None) for p in data if not p.get('reference') and not p.get('bg') and p['id'] not in SERIE2], log)
    # ÉTAPE 4 : série 2 (27) avec IPAdapter depuis les sommets v3
    run([(byid[c], c, SERIE2_IPA_SRC.get(c)) for c in SERIE2], log)
    # ÉTAPE 5 : héros + stills
    run([(HERO, 'heros-errance', None)], log)
    for i, (tag, p) in enumerate(STILLS.items()):
        item = {'id': tag, 'file': tag + '.jpg', 'name': tag, 'rarity': None, 'universe': 'hub', 'named': False,
                'bg': True, 'species': None, 'gender': None, 'age': None, 'character_dna': None,
                'framing': 'background', 'w': 1280, 'h': 720, 'seed': 2130100 + i,
                'positive': p['positive'], 'negative': p['negative']}
        run([(item, tag, None)], log)
        shutil.copy(os.path.join(MASTERS, tag + '.png'), BASE + '/ComfyUI/input/' + tag + '.png')
    # héros en input pour le cycle WAN
    shutil.copy(os.path.join(MASTERS, 'heros-errance.png'), BASE + '/ComfyUI/input/heros-errance.png')
    convert_all()
    print('TERMINE vague3 :', len(log), 'entrées au log', flush=True)


if __name__ == '__main__':
    main()
