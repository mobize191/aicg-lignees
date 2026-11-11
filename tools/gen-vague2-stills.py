#!/usr/bin/env python3
# gen-vague2-stills.py — key frames 1280x720 (WAI v17, canon) servant de start_image aux vidéos d'ambiance WAN i2v.
# Le t2v 720p pur est hors distribution du modèle 480p -> on passe par une image fixe + i2v.
import importlib.util, json, os, sys

spec = importlib.util.spec_from_file_location('gv', 'C:/Users/MOB/Documents/projet_data_IA/aicg-lignees/tools/gen-vague2.py')
gv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gv)

BASE_POS = ('general, anime style, anime illustration, sharp lineart, clean lineart, vibrant colors, colorful, bright, '
            'soft ambient light, detailed background, rim lighting, sharp focus, scenery, masterpiece, best quality, amazing quality')
NEG = ('bad quality, worst quality, worst detail, sketch, censor, nsfw, text, letters, numbers, watermark, signature, '
       'artist name, artist signature, logo, frame, border, japanese text, chinese text, title, caption, '
       'monochrome, greyscale, single color palette, bad anatomy, bad hands, poorly drawn face, poorly drawn hands, '
       'dark, muddy colors')

STILLS = {
    'bg-hub-ville': {
        'positive': (BASE_POS + ', sunny medieval town square, cobblestone plaza, stone fountain in the center with gentle water, '
                     'market stalls with colorful striped awnings, bustling villagers, timber houses, warm golden daylight, birds in the sky, '
                     'warm palette, cinematic composition, wide shot'),
        'negative': NEG,
    },
    'bg-marees-combat': {
        'positive': (BASE_POS + ', underwater sunken temple battlefield, ancient stone pillars and arches, crashing turquoise waves, '
                     'sea foam swirls, coral reef, shafts of filtered sunlight, drifting glowing particles, deep blue and turquoise palette, '
                     'coral accents, epic dramatic lighting, cinematic wide shot'),
        'negative': NEG + ', people, characters, 1girl, 1boy',
    },
}


def main():
    os.makedirs(gv.MASTERS, exist_ok=True)
    log = []
    for i, (tag, p) in enumerate(STILLS.items()):
        item = {'id': tag, 'file': tag + '.jpg', 'name': tag, 'rarity': None, 'universe': 'hub',
                'named': False, 'bg': True, 'species': None, 'gender': None, 'age': None,
                'character_dna': None, 'framing': 'background', 'w': 1280, 'h': 720, 'seed': 2130100 + i,
                'positive': p['positive'], 'negative': p['negative']}
        if os.path.exists(os.path.join(gv.MASTERS, tag + '.png')):
            print('>>> skip', tag)
            continue
        print('>>> still', tag, flush=True)
        nodes = gv.workflow(item, f'out-v2/masters/{tag}')
        blob = gv.queue_and_wait(nodes, tag, log)
        with open(os.path.join(gv.MASTERS, tag + '.png'), 'wb') as f:
            f.write(blob)
        import shutil
        shutil.copy(os.path.join(gv.MASTERS, tag + '.png'), 'C:/Users/MOB/Documents/projet_data_IA/ComfyUI/input/' + tag + '.png')
        print('    copié dans ComfyUI/input/', flush=True)
    print('TERMINE stills')


if __name__ == '__main__':
    main()
