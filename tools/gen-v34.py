#!/usr/bin/env python3
# gen-v34.py — paquet de génération ARTS du v3.4 : 351 cartes x 3 versions = 1059 images.
# Prompts = tools/prompts-v34.json (généré par tools/build-prompts-v34.mjs, auto-vérifié 0 erreur).
# Ordre du fichier : classiques (l'UR AVANT sa L) PUIS repos PUIS obscures — les références
# IPAdapter des thèmes (le classique de la même carte) existent donc déjà dans masters-v34.
# Canon §15 inchangé : WAI-Illustrious v17, Euler a + normal, 28 steps, CFG 5.5, hires x1.25
# denoise 0.4 -> masters 1040x1520, ADetailer visage 0.32, VAE baked.
# IPAdapter 0.4 ease in-out end_at 0.85 (nommées : classique <-> thèmes ; L <-> son UR).
# LoRA via LoraLoader (Leviatan sur e31/e32 uniquement, poids 0.7). AUCUN Fx. Retries seed+1 max 2.
# Usage : python3 gen-v34.py [all|convert]
import json, os, shutil, subprocess, sys, time, urllib.request, urllib.parse

BASE = 'C:/Users/MOB/Documents/projet_data_IA'
REPO = BASE + '/aicg-lignees'
STATE = BASE + '/ComfyUI/output/out-v2/state'
MASTERS = STATE + '/masters-v34'
INPUT = BASE + '/ComfyUI/input'
SERVER = 'http://127.0.0.1:8188'
CKPT = 'WAI-Nsfw-Illustrious-17.safetensors'
OUT = REPO + '/tools/out-v2/v34'
SAMPLER, SCHEDULER = 'euler_ancestral', 'normal'
STEPS, CFG, DENOISE_HIRES, DENOISE_FACE = 28, 5.5, 0.4, 0.32
IPA_WEIGHT, IPA_END = 0.4, 0.85
MAX_RETRIES = 2  # retries seed+1, max 2


def load_prompts():
    with open(REPO + '/tools/prompts-v34.json', encoding='utf-8') as f:
        return json.load(f)


def face_box(w, h, framing):
    if framing == 'full body':
        return int(w * 0.33), int(h * 0.02), int(w * 0.34), int(h * 0.20)
    return int(w * 0.28), int(h * 0.03), int(w * 0.44), int(h * 0.37)


def workflow(item, prefix, ipa_image=None, lora=None, detailer=True):
    w = item.get('w') or 832
    h = item.get('h') or 1216
    W, H = int(w * 1.25), int(h * 1.25)
    seed = item['seed']
    model_src = ['4', 0]
    clip_src = ['4', 1]
    nodes = {
        '4': {'class_type': 'CheckpointLoaderSimple', 'inputs': {'ckpt_name': CKPT}},
        '5': {'class_type': 'EmptyLatentImage', 'inputs': {'width': w, 'height': h, 'batch_size': 1}},
        '6': {'class_type': 'CLIPTextEncode', 'inputs': {'text': item['positive'], 'clip': clip_src}},
        '7': {'class_type': 'CLIPTextEncode', 'inputs': {'text': item['negative'], 'clip': clip_src}},
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
    if lora:
        nodes['12'] = {'class_type': 'LoraLoader', 'inputs': {
            'lora_name': lora['file'], 'strength_model': lora['weight'], 'strength_clip': lora['weight'],
            'model': ['4', 0], 'clip': ['4', 1]}}
        model_src = ['12', 0]
        clip_src = ['12', 1]
        nodes['6']['inputs']['clip'] = clip_src
        nodes['7']['inputs']['clip'] = clip_src
        nodes['3']['inputs']['model'] = model_src
        nodes['11']['inputs']['model'] = model_src
    if ipa_image:
        nodes['30'] = {'class_type': 'LoadImage', 'inputs': {'image': ipa_image}}
        nodes['31'] = {'class_type': 'CLIPVisionLoader', 'inputs': {'clip_name': 'clip_vision_h.safetensors'}}
        nodes['32'] = {'class_type': 'IPAdapterModelLoader', 'inputs': {'ipadapter_file': 'ip-adapter_sdxl_vit-h.safetensors'}}
        nodes['40'] = {'class_type': 'IPAdapterAdvanced', 'inputs': {
            'model': model_src, 'ipadapter': ['32', 0], 'clip_vision': ['31', 0], 'image': ['30', 0],
            'weight': IPA_WEIGHT, 'weight_type': 'ease in-out', 'combine_embeds': 'concat',
            'start_at': 0.0, 'end_at': IPA_END, 'embeds_scaling': 'K+V'}}
        model_src = ['40', 0]
        nodes['3']['inputs']['model'] = model_src
        nodes['11']['inputs']['model'] = model_src
    if detailer and not item.get('bg'):
        bx, by, bw, bh = face_box(W, H, item.get('framing', 'demi-corps'))
        nodes['21'] = {'class_type': 'SolidMask', 'inputs': {'value': 1.0, 'width': W, 'height': H}}
        nodes['22'] = {'class_type': 'CropMask', 'inputs': {'mask': ['21', 0], 'x': bx, 'y': by, 'width': bw, 'height': bh}}
        nodes['23'] = {'class_type': 'MaskToSEGS', 'inputs': {'mask': ['22', 0], 'combined': True,
                       'crop_factor': 1.5, 'bbox_fill': False, 'drop_size': 10, 'contour_fill': False}}
        nodes['24'] = {'class_type': 'DetailerForEach', 'inputs': {'image': ['8', 0], 'segs': ['23', 0],
                       'model': model_src, 'clip': clip_src, 'vae': ['4', 2],
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
    res = post('/api/prompt', {'prompt': nodes, 'client_id': 'v34'})
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
            print('    OK ' + tag + ' seed=' + str(nodes['3']['inputs']['seed']) + ' ' + str(dt) + 's vram=' + vram() + 'MB ' + str(len(blob) // 1024) + 'Ko', flush=True)
            return blob
    raise RuntimeError('timeout ' + tag)


def resolve_ipa(ipa_id):
    # ordre : masters du gel (générés dans cette session, classiques avant thèmes) > input ComfyUI
    for d in (MASTERS, INPUT):
        p = os.path.join(d, ipa_id + '.png')
        if os.path.exists(p):
            if d != INPUT:
                shutil.copy(p, os.path.join(INPUT, ipa_id + '.png'))
            return ipa_id + '.png'
    return None


def run_jobs(jobs, log, logpath, masters_dir, detailer=True):
    done = set()
    if os.path.exists(logpath):
        with open(logpath, encoding='utf-8') as f:
            old = json.load(f)
        log.extend(old)
        done = {e['tag'] for e in old if 'error' not in e}
    os.makedirs(masters_dir, exist_ok=True)
    for item, tag, ipa_image, lora in jobs:
        if tag in done and os.path.exists(os.path.join(masters_dir, tag + '.png')):
            print('>>> skip (déjà fait)', tag, flush=True)
            continue
        ipa_file = None
        if ipa_image:
            ipa_file = resolve_ipa(ipa_image)
            if not ipa_file:
                print('>>> REF MANQUANTE pour', tag, ':', ipa_image, '(sans IPAdapter)', flush=True)
        blob = None
        attempts = 0
        while attempts <= MAX_RETRIES:
            seed = item['seed'] + attempts  # retries seed+1, max 2
            work = dict(item)
            work['seed'] = seed
            print('>>> generation', tag, 'seed', seed, ('(retry %d)' % attempts) if attempts else '',
                  'ipa=' + str(ipa_file), 'lora=' + str(lora and lora['file']), 'vram', vram(), 'MB', flush=True)
            try:
                nodes = workflow(work, 'out-v2/' + os.path.basename(masters_dir) + '/' + tag, ipa_file, lora, detailer)
                blob = queue_and_wait(nodes, tag, log)
                break
            except Exception as e:
                attempts += 1
                print('    ECHEC', tag, 'seed', seed, ':', str(e)[:300], flush=True)
                log.append({'tag': tag, 'seed': seed, 'error': str(e)[:300], 'attempt': attempts})
                with open(logpath, 'w', encoding='utf-8') as f:
                    json.dump(log, f, ensure_ascii=False, indent=1)
        if blob is None:
            continue
        with open(os.path.join(masters_dir, tag + '.png'), 'wb') as f:
            f.write(blob)
        with open(logpath, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=1)


def convert(masters_dir, out_dir):
    from PIL import Image
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(os.path.join(out_dir, 'masters'), exist_ok=True)
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
    print('conversion', out_dir, ':', n, 'fichiers', flush=True)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'all'
    data = load_prompts()
    if mode in ('all', 'classiques', 'themes'):
        sel = {'all': None, 'classiques': ('classique',), 'themes': ('repos', 'obscures')}[mode]
        filtered = [p for p in data if sel is None or p['theme'] in sel]
        # Ordre spec §3 : classiques d'abord (réfs IPAdapter), puis repos, puis obscures ; fonds ignorés
        theme_order = {'classique': 0, 'repos': 1, 'obscures': 2, 'bg': 3}
        filtered.sort(key=lambda p: (theme_order.get(p.get('theme', 'bg'), 3), p['id']))
        jobs = [(p, p['file'][:-4], p.get('ipa'), p.get('lora')) for p in filtered if not p.get('bg')]
        print('PHASE v3.4 :', len(jobs), 'jobs (classiques d\'abord, puis repos, puis obscures)', flush=True)
        run_jobs(jobs, [], STATE + '/run-log-v34.json', MASTERS)
    if mode == 'convert':
        convert(MASTERS, OUT)
    print('TERMINE', mode, flush=True)


if __name__ == '__main__':
    main()
