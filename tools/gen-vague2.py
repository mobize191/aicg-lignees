#!/usr/bin/env python3
# gen-vague2.py — campagne v2, VAGUE 2 (11/11/2026) : retries vague 1 + 212 génériques + série 2 (27, IPAdapter 0.3-0.45).
# Checkpoint WAI-Illustrious v17, réglages CANON §15 : Euler a (euler_ancestral) + scheduler normal,
# 28 steps, CFG 5.5, hires fix x1.25 denoise 0.4 (la v17 auto-corrige les membres), ADetailer visage,
# VAE baked (pas de VAE externe). Négatif court canon + anti-tags ciblés (build-prompts.mjs).
# IPAdapter : poids 0.4, weight_type 'ease in-out', end_at 0.85 (charte §14, JAMAIS 0.6 linear).
# Usage : python gen-vague2.py <retries|generics|serie2|all> [--force]
# État : ComfyUI/output/out-v2/state (masters), conversion budgets v2 -> tools/out-v2/.
import json, os, shutil, subprocess, sys, time, urllib.request, urllib.parse

BASE = 'C:/Users/MOB/Documents/projet_data_IA'
REPO = BASE + '/aicg-lignees'
STATE = BASE + '/ComfyUI/output/out-v2/state'
MASTERS = STATE + '/masters'
SERVER = 'http://127.0.0.1:8188'
CKPT = 'WAI-Nsfw-Illustrious-17.safetensors'
OUT = REPO + '/tools/out-v2'
SAMPLER, SCHEDULER = 'euler_ancestral', 'normal'  # canon v17 §15.1 (Euler a), PAS dpmpp_2m_sde+karras
STEPS, CFG, DENOISE_HIRES, DENOISE_FACE = 28, 5.5, 0.4, 0.32
IPA_WEIGHT, IPA_END = 0.4, 0.85  # charte §14 : 0.3-0.45, ease in-out, end 0.8-0.9

RETRIES = ['a16', 'd6', 'f18', 'f13', 'a13', 'e22', 'a15', 'z19', 'z22']  # cartes fautives vague 1 + phénix
SERIE2 = ['q1','q2','q3','q4','q5','q6','t1','t2','t3','t4','t5','t6',
          'u1','u2','u3','u4','u5','u6','v1','v2','v3','v4','v5','v6','p1','p3','p4']
# IPAdapter série 2 : chaque ligne de famille réinjectée depuis son sommet (rareté la plus haute d'abord)
SERIE2_IPA_SRC = {'q1':'q6','q2':'q6','q3':'q6','q4':'q6','q5':'q6',
                  't1':'t6','t2':'t6','t3':'t6','t4':'t6','t5':'t6',
                  'u1':'u6','u2':'u6','u3':'u6','u4':'u6','u5':'u6',
                  'v1':'v6','v2':'v6','v3':'v6','v4':'v6','v5':'v6'}


def load_prompts():
    with open(REPO + '/tools/prompts-v2.json', encoding='utf-8') as f:
        return json.load(f)


def face_box(w, h, framing):
    if framing == 'full body':
        return int(w * 0.33), int(h * 0.02), int(w * 0.34), int(h * 0.20)
    return int(w * 0.28), int(h * 0.03), int(w * 0.44), int(h * 0.37)


def workflow(item, prefix, ipa_image=None):
    w = item.get('w') or 832
    h = item.get('h') or 1216
    W, H = int(w * 1.25), int(h * 1.25)
    seed = item['seed']
    model_src = ['4', 0]
    nodes = {
        '4': {'class_type': 'CheckpointLoaderSimple', 'inputs': {'ckpt_name': CKPT}},  # VAE baked (pas de VAE externe)
        '5': {'class_type': 'EmptyLatentImage', 'inputs': {'width': w, 'height': h, 'batch_size': 1}},
        '6': {'class_type': 'CLIPTextEncode', 'inputs': {'text': item['positive'], 'clip': ['4', 1]}},
        '7': {'class_type': 'CLIPTextEncode', 'inputs': {'text': item['negative'], 'clip': ['4', 1]}},
        '3': {'class_type': 'KSampler', 'inputs': {'seed': seed, 'steps': STEPS, 'cfg': CFG,
              'sampler_name': SAMPLER, 'scheduler': SCHEDULER, 'denoise': 1.0,
              'model': model_src, 'positive': ['6', 0], 'negative': ['7', 0], 'latent_image': ['5', 0]}},
        '10': {'class_type': 'LatentUpscale', 'inputs': {'samples': ['3', 0], 'upscale_method': 'bilinear',
              'width': W, 'height': H, 'crop': 'disabled'}},
        '11': {'class_type': 'KSampler', 'inputs': {'seed': seed, 'steps': STEPS, 'cfg': CFG,
              'sampler_name': SAMPLER, 'scheduler': SCHEDULER, 'denoise': DENOISE_HIRES,
              'model': model_src, 'positive': ['6', 0], 'negative': ['7', 0], 'latent_image': ['10', 0]}},
        '8': {'class_type': 'VAEDecode', 'inputs': {'samples': ['11', 0], 'vae': ['4', 2]}},
    }
    if ipa_image:
        nodes['30'] = {'class_type': 'LoadImage', 'inputs': {'image': ipa_image}}
        nodes['31'] = {'class_type': 'CLIPVisionLoader', 'inputs': {'clip_name': 'clip_vision_h.safetensors'}}
        nodes['32'] = {'class_type': 'IPAdapterModelLoader', 'inputs': {'ipadapter_file': 'ip-adapter_sdxl_vit-h.safetensors'}}
        nodes['40'] = {'class_type': 'IPAdapterAdvanced', 'inputs': {
            'model': ['4', 0], 'ipadapter': ['32', 0], 'clip_vision': ['31', 0], 'image': ['30', 0],
            'weight': IPA_WEIGHT, 'weight_type': 'ease in-out', 'combine_embeds': 'concat',
            'start_at': 0.0, 'end_at': IPA_END, 'embeds_scaling': 'K+V'}}
        model_src = ['40', 0]
        nodes['3']['inputs']['model'] = model_src
        nodes['11']['inputs']['model'] = model_src
    if not item.get('bg'):
        bx, by, bw, bh = face_box(W, H, item.get('framing', 'demi-corps'))
        nodes['21'] = {'class_type': 'SolidMask', 'inputs': {'value': 1.0, 'width': W, 'height': H}}
        nodes['22'] = {'class_type': 'CropMask', 'inputs': {'mask': ['21', 0], 'x': bx, 'y': by, 'width': bw, 'height': bh}}
        nodes['23'] = {'class_type': 'MaskToSEGS', 'inputs': {'mask': ['22', 0], 'combined': True,
                       'crop_factor': 1.5, 'bbox_fill': False, 'drop_size': 10, 'contour_fill': False}}
        nodes['24'] = {'class_type': 'DetailerForEach', 'inputs': {'image': ['8', 0], 'segs': ['23', 0],
                       'model': model_src, 'clip': ['4', 1], 'vae': ['4', 2],
                       'guide_size': 512, 'guide_size_for': True, 'max_size': 1024, 'seed': seed,
                       'steps': STEPS, 'cfg': CFG, 'sampler_name': SAMPLER, 'scheduler': SCHEDULER,
                       'positive': ['6', 0], 'negative': ['7', 0],
                       'denoise': DENOISE_FACE, 'feather': 32, 'noise_mask': True, 'force_inpaint': True,
                       'wildcard': '', 'cycle': 1}}
        nodes['9'] = {'class_type': 'SaveImage', 'inputs': {'images': ['24', 0], 'filename_prefix': prefix}}
    else:
        nodes['9'] = {'class_type': 'SaveImage', 'inputs': {'images': ['8', 0], 'filename_prefix': prefix}}
    return nodes


def post(path, payload):
    req = urllib.request.Request(SERVER + path, data=json.dumps(payload).encode(),
                                 headers={'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req, timeout=30))


def get(path):
    return json.load(urllib.request.urlopen(SERVER + path, timeout=30))


def vram():
    try:
        return subprocess.run(['nvidia-smi', '--query-gpu=memory.used', '--format=csv,noheader,nounits'],
                              capture_output=True, text=True, timeout=10).stdout.strip()
    except Exception:
        return '?'


def queue_and_wait(nodes, tag, log):
    t0 = time.time()
    res = post('/api/prompt', {'prompt': nodes, 'client_id': 'campaign-v2-vague2'})
    pid = res['prompt_id']
    for _ in range(3600):
        time.sleep(2)
        try:
            hist = get('/api/history/' + pid)
        except Exception:
            continue
        entry = hist.get(pid)
        if not entry:
            continue
        if entry.get('status', {}).get('status_str') == 'error':
            raise RuntimeError('erreur rendu ' + tag + ' : ' + json.dumps(entry['status'].get('messages', []))[:400])
        imgs = [im for o in entry.get('outputs', {}).values() for im in o.get('images', [])]
        if imgs:
            im = imgs[0]
            url = SERVER + '/api/view?' + urllib.parse.urlencode(
                {'filename': im['filename'], 'subfolder': im.get('subfolder', ''), 'type': im.get('type', 'output')})
            blob = urllib.request.urlopen(url, timeout=180).read()
            dt = round(time.time() - t0, 1)
            log.append({'tag': tag, 'seed': nodes['3']['inputs']['seed'], 'seconds': dt,
                        'vram_MB': vram(), 'bytes': len(blob)})
            print(f'    OK {tag} seed={nodes["3"]["inputs"]["seed"]} {dt}s vram={vram()}MB {len(blob)//1024}Ko', flush=True)
            return blob
    raise RuntimeError('timeout ' + tag)


def convert_all():
    """Budgets v2 (charte §13) : arts 400x560 JPEG q80, fonds 1216x832 JPEG q72 -> tools/out-v2/."""
    from PIL import Image
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(OUT + '/masters', exist_ok=True)
    n = 0
    for f in sorted(os.listdir(MASTERS)):
        if not f.endswith('.png') or f.endswith('.v1.png'):
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
    print('conversion v2 :', n, 'fichiers dans', OUT, flush=True)


def append_seeds(rows):
    path = REPO + '/tools/seeds-v2.csv'
    with open(path, 'a', encoding='utf-8') as f:
        for r in rows:
            f.write(','.join(str(c) for c in r) + '\n')


def run_jobs(jobs, log, force=False):
    done = set()
    logpath = STATE + '/run-log-vague2.json'
    if os.path.exists(logpath):
        with open(logpath, encoding='utf-8') as f:
            old = json.load(f)
        log.extend(old)
        done = {e['tag'] for e in old}
    for item, tag, ipa_image in jobs:
        if tag in done and not force and os.path.exists(os.path.join(MASTERS, tag + '.png')):
            print('>>> skip (déjà fait)', tag, flush=True)
            continue
        if ipa_image:
            src_png = os.path.join(MASTERS, ipa_image + '.png')
            if not os.path.exists(src_png):
                print('>>> REF MANQUANTE pour', tag, ':', ipa_image, flush=True)
                continue
            shutil.copy(src_png, BASE + '/ComfyUI/input/' + ipa_image + '.png')
        if force and os.path.exists(os.path.join(MASTERS, tag + '.png')):
            dest = os.path.join(MASTERS, tag + '.v1.png')
            if not os.path.exists(dest):
                os.rename(os.path.join(MASTERS, tag + '.png'), dest)
                print('>>> master vague 1 archivé en', tag + '.v1.png', flush=True)
            else:
                os.rename(os.path.join(MASTERS, tag + '.png'), os.path.join(MASTERS, tag + '.r1.png'))
                print('>>> master retry 1 archivé en', tag + '.r1.png', flush=True)
        print('>>> generation', tag, 'seed', item['seed'], 'ipa=' + str(ipa_image), 'vram', vram(), 'MB', flush=True)
        nodes = workflow(item, f'out-v2/masters/{tag}', ipa_image + '.png' if ipa_image else None)
        blob = queue_and_wait(nodes, tag, log)
        os.makedirs(MASTERS, exist_ok=True)
        with open(os.path.join(MASTERS, tag + '.png'), 'wb') as f:
            f.write(blob)
        with open(logpath, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=1)


def main():
    stage = sys.argv[1] if len(sys.argv) > 1 else 'all'
    force = '--force' in sys.argv
    data = load_prompts()
    byid = {p['id']: p for p in data}
    os.makedirs(MASTERS, exist_ok=True)
    log = []
    logpath = STATE + '/run-log-vague2.json'
    seed_rows = []

    if stage in ('retries', 'all'):
        only = None
        if '--only' in sys.argv:
            only = sys.argv[sys.argv.index('--only') + 1].split(',')
        jobs = []
        for rid in RETRIES:
            if only and rid not in only:
                continue
            item = dict(byid[rid])
            item['seed'] = byid[rid].get('seed') or (2126000 + list(byid).index(rid))  # seed fixe = seed vague 1
            jobs.append((item, rid, None))
        run_jobs(jobs, log, force=True)
        for item, tag, _ in jobs:
            seed_rows.append([tag + '.jpg', item['seed'], '', f'retry vague 2 {tag} ({byid[tag]["name"]}) — seed fixe vague 1'])

    if stage in ('generics', 'all'):
        jobs = []
        gi = 0
        for p in data:
            if p.get('reference') or p.get('bg') or p['id'] in SERIE2:
                continue
            item = dict(p)
            item['seed'] = 2127000 + gi
            gi += 1
            jobs.append((item, p['id'], None))
            seed_rows.append([p['id'] + '.jpg', item['seed'], '', f'générique v2 {p["name"]} ({p["species"]})'])
        run_jobs(jobs, log)
        print(f'generics : {gi} jobs', flush=True)

    if stage in ('hero', 'all'):
        # Héros de l'errance ARBITRÉ (11/11) : FEMME, cheveux blancs, cape noire — art de référence v2
        base_neg = None
        with open(REPO + '/tools/prompts-v2.json', encoding='utf-8') as f:
            any_ref = json.load(f)[0]
        hero = {
            'id': 'heros-errance', 'file': 'heros-errance.jpg', 'name': "Héroïne de l'errance",
            'rarity': 'UR', 'universe': 'naissance', 'named': True, 'bg': False,
            'species': 'human', 'gender': '1girl', 'age': 'adulte', 'framing': 'full body',
            'seed': 2129001,
            'positive': ('general, anime style, anime illustration, sharp lineart, clean lineart, vibrant colors, colorful, '
                         'bright, soft ambient light, detailed background, rim lighting, sharp focus, solo, visible face, '
                         'detailed eyes, face illuminated by soft glow, front lighting, 1girl, long white hair, black cape, '
                         'cloak, adult, mature woman, mysterious, elegant, full body, standing, centered, looking at viewer, '
                         'neutral adventurer palette, masterpiece, best quality, amazing quality'),
            'negative': (any_ref['negative'] + ', dark, muddy colors, blue skin, colored skin, inhuman skin'),
        }
        run_jobs([(hero, 'heros-errance', None)], log)
        seed_rows.append(['heros-errance.jpg', 2129001, '', "héros errance arbitré (1girl, white hair, black cape) — art ref v2"])

    if stage in ('serie2', 'all'):
        jobs = []
        for i, cid in enumerate(SERIE2):
            item = dict(byid[cid])
            item['seed'] = 2128000 + i
            src = SERIE2_IPA_SRC.get(cid)
            jobs.append((item, cid, src))
            seed_rows.append([cid + '.jpg', item['seed'], '', f'série 2 v2 {byid[cid]["name"]}' + (f' — IPAdapter depuis {src} (0.4 ease in-out end 0.85)' if src else ' — sans IPAdapter')])
        run_jobs(jobs, log)

    if seed_rows:
        append_seeds(seed_rows)
    convert_all()
    print('TERMINE stage', stage, ':', len(log), 'entrées au log', flush=True)


if __name__ == '__main__':
    main()
