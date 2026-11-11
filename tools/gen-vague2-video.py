#!/usr/bin/env python3
# gen-vague2-video.py — vidéos vague 2 (WAN 2.1 14B, arbitré 11/11).
# Modèles installés : wan2.1-i2v-14b-480p-Q4_K_M.gguf (GGUF Q4_K_M faute de fp8 safetensors sur le disque ;
# même famille 14B, encore plus léger en VRAM que fp8 sur RTX 5070 12 Go). umt5_xxl_fp8_e4m3fn_scaled,
# wan_2.1_vae, clip_vision_h. ~20 steps, CFG 5, flow shift 7, prompting en langage NATUREL (umT5),
# static camera pour les cycles, 60-81 frames. Sorties : ComfyUI/output/out-v2/video/ -> tools/out-v2/video/.
# Usage : python3 tools/gen-vague2-video.py <hub|marees|sprites|all>
import json, os, shutil, subprocess, sys, time, urllib.request, urllib.parse

BASE = 'C:/Users/MOB/Documents/projet_data_IA'
REPO = BASE + '/aicg-lignees'
SERVER = 'http://127.0.0.1:8188'
OUTDIR = BASE + '/ComfyUI/output/out-v2/video'
DEST = REPO + '/tools/out-v2/video'
UNET = 'wan2.1-i2v-14b-480p-Q4_K_M.gguf'
UMT5 = 'umt5_xxl_fp8_e4m3fn_scaled.safetensors'
VAE = 'wan_2.1_vae.safetensors'
CLIPV = 'clip_vision_h.safetensors'
STEPS, CFG, SHIFT, FPS = 20, 5.0, 7.0, 16

NEG = ('blurry, low quality, worst quality, artifacts, watermark, text, subtitles, signature, logo, '
       'distorted, deformed, extra limbs, mutated, static image, still frame, oversaturated, underexposed')

JOBS = {
    # ambiances 720p : i2v depuis une key frame WAI 1280x720 (le t2v 720p pur est hors distribution du modèle 480p)
    'hub': {'mode': 'i2v', 'w': 1280, 'h': 720, 'length': 81, 'seed': 2130001, 'image': 'bg-hub-ville.png',
            'prompt': 'sunny medieval town square, stone fountain in the center with gentle water movement, market stalls, bustling villagers walking around, warm daylight, birds flying, static camera, slow ambient motion only, cinematic'},
    'marees': {'mode': 'i2v', 'w': 1280, 'h': 720, 'length': 81, 'seed': 2130002, 'image': 'bg-marees-combat.png',
                'prompt': 'underwater sunken temple battlefield, crashing turquoise waves and sea foam swirls, coral reef, shafts of filtered sunlight, drifting glowing particles, deep blue and turquoise water, slow cinematic ambient motion, static camera'},
    # cycles de marche du héros (i2v 480p depuis l'art de référence), 4 directions, 81 frames
    'sprites': {'mode': 'i2v', 'w': 832, 'h': 480, 'length': 81, 'seed': 2130010,
                'image': 'heros-errance.png',
                'prompt': 'top-down three-quarter view of a female adventurer with long white hair and a black cape, walking in place, seamless walk cycle, 8-directional game sprite motion, plain neutral background, static camera, smooth looping movement'},
}


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


def workflow(job, prefix):
    nodes = {
        '38': {'class_type': 'CLIPLoader', 'inputs': {'clip_name': UMT5, 'type': 'wan'}},
        '39': {'class_type': 'VAELoader', 'inputs': {'vae_name': VAE}},
        '58': {'class_type': 'UnetLoaderGGUF', 'inputs': {'unet_name': UNET}},
        '54': {'class_type': 'ModelSamplingSD3', 'inputs': {'model': ['58', 0], 'shift': SHIFT}},
        '6': {'class_type': 'CLIPTextEncode', 'inputs': {'text': job['prompt'], 'clip': ['38', 0]}},
        '7': {'class_type': 'CLIPTextEncode', 'inputs': {'text': NEG, 'clip': ['38', 0]}},
        '3': {'class_type': 'KSampler', 'inputs': {'seed': job['seed'], 'steps': STEPS, 'cfg': CFG,
              'sampler_name': 'euler', 'scheduler': 'simple', 'denoise': 1.0,
              'model': ['54', 0], 'positive': ['50', 0], 'negative': ['50', 1], 'latent_image': ['50', 2]}},
        '8': {'class_type': 'VAEDecode', 'inputs': {'samples': ['3', 0], 'vae': ['39', 0]}},
        '55': {'class_type': 'CreateVideo', 'inputs': {'images': ['8', 0], 'fps': FPS,
              'bit_depth': 'auto', 'color_space': 'sRGB', 'chroma_subsampling': 'auto', 'codec': 'none'}},
        '56': {'class_type': 'SaveVideo', 'inputs': {'video': ['55', 0], 'filename_prefix': prefix,
              'format': 'auto', 'format.codec': 'auto', 'codec': 'auto'}},
    }
    if job['mode'] == 'i2v':
        nodes['49'] = {'class_type': 'CLIPVisionLoader', 'inputs': {'clip_name': CLIPV}}
        nodes['52'] = {'class_type': 'LoadImage', 'inputs': {'image': job['image']}}
        nodes['51'] = {'class_type': 'CLIPVisionEncode', 'inputs': {'clip_vision': ['49', 0], 'image': ['52', 0], 'crop': 'none'}}
        nodes['50'] = {'class_type': 'WanImageToVideo', 'inputs': {'width': job['w'], 'height': job['h'],
                      'length': job['length'], 'batch_size': 1, 'positive': ['6', 0], 'negative': ['7', 0],
                      'vae': ['39', 0], 'clip_vision_output': ['51', 0], 'start_image': ['52', 0]}}
    else:
        # t2v natif : WanImageToVideo SANS start_image ni clip_vision (start_image est optionnel)
        nodes['50'] = {'class_type': 'WanImageToVideo', 'inputs': {'width': job['w'], 'height': job['h'],
                      'length': job['length'], 'batch_size': 1, 'positive': ['6', 0], 'negative': ['7', 0], 'vae': ['39', 0]}}
    return nodes


def run(job_name, job):
    os.makedirs(OUTDIR, exist_ok=True)
    prefix = 'out-v2/video/' + job_name
    print('>>> video', job_name, job['mode'], f"{job['w']}x{job['h']}x{job['length']}f seed={job['seed']} vram={vram()}MB", flush=True)
    t0 = time.time()
    res = post('/api/prompt', {'prompt': workflow(job, prefix), 'client_id': 'campaign-v2-vague2-video'})
    pid = res['prompt_id']
    for _ in range(7200):
        time.sleep(5)
        try:
            hist = get('/api/history/' + pid)
        except Exception:
            continue
        entry = hist.get(pid)
        if not entry:
            continue
        st = entry.get('status', {})
        if st.get('status_str') == 'error':
            raise RuntimeError('erreur video ' + job_name + ' : ' + json.dumps(st.get('messages', []))[:500])
        if st.get('completed'):
            print(f'    OK {job_name} en {round(time.time()-t0,1)}s vram={vram()}MB', flush=True)
            return pid
    raise RuntimeError('timeout video ' + job_name)


def collect(job_name):
    """SaveVideo écrit dans output ; on retrouve le fichier via /view et on le copie dans tools/out-v2/video/."""
    os.makedirs(DEST, exist_ok=True)
    # lister les sorties récentes via l'API history n'est pas fiable pour la vidéo ; scan du dossier via le disque local
    for f in sorted(os.listdir(OUTDIR), reverse=True):
        if f.startswith(job_name):
            shutil.copy(os.path.join(OUTDIR, f), os.path.join(DEST, f))
            print('    copié ->', DEST + '/' + f, flush=True)
            return f
    return None


def main():
    stage = sys.argv[1] if len(sys.argv) > 1 else 'all'
    names = list(JOBS) if stage == 'all' else [stage]
    for name in names:
        if name not in JOBS:
            print('job inconnu:', name); continue
        run(name, JOBS[name])
        collect(name)
    print('TERMINE videos', flush=True)


if __name__ == '__main__':
    main()
