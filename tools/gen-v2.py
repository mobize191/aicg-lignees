#!/usr/bin/env python3
# gen-v2.py — campagne v2, vague 1 : 53 références nommées + 6 fonds + test IPAdapter via ComfyUI (WAI v17).
# État de travail dans ComfyUI/output/out-v2/state (zone sûre) ; conversion finale dans tools/out-v2/.
# Paramètres charte v2 : 832x1216 (fonds 1216x832), 28 steps, CFG 5.5, dpmpp_2m_sde + karras,
# hires fix x1.25 denoise 0.4, ADetailer visage denoise 0.32. Seeds figés (tools/seeds-v2.csv).
import json, os, subprocess, sys, time, urllib.request, urllib.parse

BASE = 'C:/Users/MOB/Documents/projet_data_IA'  # python Windows accepte les / dans les chemins
REPO = BASE + '/aicg-lignees'
STATE = BASE + '/ComfyUI/output/out-v2/state'
MASTERS = STATE + '/masters'
SERVER = 'http://127.0.0.1:8188'
CKPT = 'WAI-Nsfw-Illustrious-17.safetensors'
OUT = REPO + '/tools/out-v2'

def load_prompts():
    for p in (STATE + '/prompts-v2.json', REPO + '/tools/prompts-v2.json'):
        if os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    raise SystemExit('prompts-v2.json introuvable')

def face_box(w, h, framing):
    if framing == 'full body':
        return int(w * 0.33), int(h * 0.02), int(w * 0.34), int(h * 0.20)
    return int(w * 0.28), int(h * 0.03), int(w * 0.44), int(h * 0.37)

def workflow(item, prefix, ipa_image=None, ipa_weight=0.6):
    w = item.get('w') or 832
    h = item.get('h') or 1216
    W, H = int(w * 1.25), int(h * 1.25)
    seed = item['seed']
    model_src = ['4', 0]
    nodes = {
        '4': {'class_type': 'CheckpointLoaderSimple', 'inputs': {'ckpt_name': CKPT}},
        '5': {'class_type': 'EmptyLatentImage', 'inputs': {'width': w, 'height': h, 'batch_size': 1}},
        '6': {'class_type': 'CLIPTextEncode', 'inputs': {'text': item['positive'], 'clip': ['4', 1]}},
        '7': {'class_type': 'CLIPTextEncode', 'inputs': {'text': item['negative'], 'clip': ['4', 1]}},
        '3': {'class_type': 'KSampler', 'inputs': {'seed': seed, 'steps': 28, 'cfg': 5.5,
              'sampler_name': 'dpmpp_2m_sde', 'scheduler': 'karras', 'denoise': 1.0,
              'model': model_src, 'positive': ['6', 0], 'negative': ['7', 0], 'latent_image': ['5', 0]}},
        '10': {'class_type': 'LatentUpscale', 'inputs': {'samples': ['3', 0], 'upscale_method': 'bilinear',
              'width': W, 'height': H, 'crop': 'disabled'}},
        '11': {'class_type': 'KSampler', 'inputs': {'seed': seed, 'steps': 28, 'cfg': 5.5,
              'sampler_name': 'dpmpp_2m_sde', 'scheduler': 'karras', 'denoise': 0.4,
              'model': model_src, 'positive': ['6', 0], 'negative': ['7', 0], 'latent_image': ['10', 0]}},
        '8': {'class_type': 'VAEDecode', 'inputs': {'samples': ['11', 0], 'vae': ['4', 2]}},
    }
    if ipa_image:
        nodes['30'] = {'class_type': 'LoadImage', 'inputs': {'image': ipa_image}}
        nodes['31'] = {'class_type': 'CLIPVisionLoader', 'inputs': {'clip_name': 'clip_vision_h.safetensors'}}
        nodes['32'] = {'class_type': 'IPAdapterModelLoader', 'inputs': {'ipadapter_file': 'ip-adapter_sdxl_vit-h.safetensors'}}
        nodes['40'] = {'class_type': 'IPAdapterAdvanced', 'inputs': {
            'model': ['4', 0], 'ipadapter': ['32', 0], 'clip_vision': ['31', 0], 'image': ['30', 0],
            'weight': ipa_weight, 'weight_type': 'linear', 'combine_embeds': 'concat',
            'start_at': 0.0, 'end_at': 1.0, 'embeds_scaling': 'K+V'}}
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
                       'steps': 28, 'cfg': 5.5, 'sampler_name': 'dpmpp_2m_sde', 'scheduler': 'karras',
                       'positive': ['6', 0], 'negative': ['7', 0],
                       'denoise': 0.32, 'feather': 32, 'noise_mask': True, 'force_inpaint': True,
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
    res = post('/api/prompt', {'prompt': nodes, 'client_id': 'campaign-v2'})
    pid = res['prompt_id']
    for _ in range(2400):
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
            blob = urllib.request.urlopen(url, timeout=120).read()
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
        if not f.endswith('.png'):
            continue
        stem = f[:-4]
        img = Image.open(os.path.join(MASTERS, f)).convert('RGB')
        shutil_copy = os.path.join(OUT, 'masters', f)
        import shutil
        shutil.copy(os.path.join(MASTERS, f), shutil_copy)
        if stem.startswith('bg-'):
            img.resize((1216, 832), Image.LANCZOS).save(os.path.join(OUT, stem + '.jpg'), 'JPEG', quality=72)
        else:
            w, h = img.size
            nw = int(h * 5 / 7)
            x = (w - nw) // 2
            img.crop((x, 0, x + nw, h)).resize((400, 560), Image.LANCZOS).save(os.path.join(OUT, stem + '.jpg'), 'JPEG', quality=80)
        n += 1
    print('conversion v2 :', n, 'fichiers dans', OUT)

def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None  # "refs" | "bgs" | "ipa" | None
    data = load_prompts()
    os.makedirs(MASTERS, exist_ok=True)
    logpath = STATE + '/run-log.json'
    log = json.load(open(logpath, encoding='utf-8')) if os.path.exists(logpath) else []
    done = {e['tag'] for e in log if os.path.exists(os.path.join(MASTERS, e['tag'] + '.png'))}

    jobs = []
    if only in (None, 'refs'):
        jobs += [(p, f'out-v2/masters/{p["id"]}', None, 0.6) for p in data if p.get('reference')]
    if only in (None, 'bgs'):
        jobs += [(p, f'out-v2/masters/{p["id"]}', None, 0.6) for p in data if p.get('bg')]
    if only in (None, 'ipa'):
        byid = {p['id']: p for p in data}
        ipa_jobs = [('a17', None), ('a15', 'a17'), ('a10', 'b1'), ('e27', 'e28')]
        for i, (cid, src) in enumerate(ipa_jobs):
            item = dict(byid[cid])
            item['seed'] = 2126200 + i
            jobs.append((item, f'out-v2/masters/ipa-{cid}', (src + '.png') if src else None, 0.6))

    for item, prefix, ipa_image, ipa_weight in jobs:
        tag = item['id'] + ('-ipa' if ipa_image else '')
        if tag in done:
            print('>>> skip (déjà fait)', tag, flush=True)
            continue
        if ipa_image:
            src_png = os.path.join(MASTERS, ipa_image)
            if not os.path.exists(src_png):
                print('>>> REF MANQUANTE pour', tag, ':', ipa_image, flush=True)
                continue
            import shutil
            shutil.copy(src_png, BASE + '/ComfyUI/input/' + ipa_image)
        print('>>> generation', tag, 'seed', item['seed'], 'vram', vram(), 'MB', flush=True)
        nodes = workflow(item, prefix, ipa_image, ipa_weight)
        blob = queue_and_wait(nodes, tag, log)
        os.makedirs(MASTERS, exist_ok=True)
        with open(os.path.join(MASTERS, tag + '.png'), 'wb') as f:
            f.write(blob)
        with open(logpath, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=1)
    if only in (None, 'bgs'):
        convert_all()
    print('TERMINE :', len(log), 'images')

if __name__ == '__main__':
    main()
