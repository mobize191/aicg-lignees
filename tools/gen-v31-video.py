#!/usr/bin/env python3
# gen-v31-video.py — phase 4 vidéos WAN 2.1 14B (i2v 480p GGUF dispo ; ambiances 1280x720 i2v depuis
# keyframes WAI comme vague 2, sprites 832x480 i2v depuis heros-errance). Mode submit: poste sans attendre.
# Mode poll: attend la fin des jobs soumis et copie les vidéos vers tools/out-v2/video/.
# Usage : python3 gen-v31-video.py submit <hub|marees|sprites|all> | poll
import importlib.util, json, os, shutil, sys, time

BASE = 'C:/Users/MOB/Documents/projet_data_IA'
REPO = BASE + '/aicg-lignees'
OUTDIR = BASE + '/ComfyUI/output/out-v2/video'
DEST = REPO + '/tools/out-v2/video'
PIDS = REPO + '/tools/video-pids-v31.json'

spec = importlib.util.spec_from_file_location('gvv', REPO + '/tools/gen-vague2-video.py')
gvv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gvv)


def submit(name):
    job = gvv.JOBS[name]
    prefix = 'out-v2/video/v31-' + name
    nodes = gvv.workflow(job, prefix)
    res = gvv.post('/api/prompt', {'prompt': nodes, 'client_id': 'campaign-v31-video'})
    pid = res['prompt_id']
    pids = {}
    if os.path.exists(PIDS):
        pids = json.load(open(PIDS, encoding='utf-8'))
    pids[name] = pid
    json.dump(pids, open(PIDS, 'w', encoding='utf-8'), indent=1)
    print('submitted', name, pid, job['w'], 'x', job['h'], 'x', job['length'], 'f', flush=True)


def poll():
    if not os.path.exists(PIDS):
        print('aucun job soumis'); return
    pids = json.load(open(PIDS, encoding='utf-8'))
    os.makedirs(DEST, exist_ok=True)
    for name, pid in list(pids.items()):
        try:
            hist = gvv.get('/api/history/' + pid)
        except Exception:
            continue
        entry = hist.get(pid)
        if not entry:
            print(name, 'en cours...', flush=True); continue
        st = entry.get('status', {})
        if st.get('status_str') == 'error':
            print(name, 'ERREUR', json.dumps(st.get('messages', []))[:300], flush=True); continue
        if st.get('completed'):
            copied = None
            for f in sorted(os.listdir(OUTDIR), reverse=True):
                if f.startswith('v31-' + name):
                    shutil.copy(os.path.join(OUTDIR, f), os.path.join(DEST, f))
                    copied = f
                    break
            print(name, 'TERMINE', copied, flush=True)
            pids.pop(name)
    json.dump(pids, open(PIDS, 'w', encoding='utf-8'), indent=1)
    print('restants:', list(pids), flush=True)


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'poll'
    if mode == 'submit':
        which = sys.argv[2] if len(sys.argv) > 2 else 'all'
        for name in (list(gvv.JOBS) if which == 'all' else [which]):
            submit(name)
    else:
        poll()
