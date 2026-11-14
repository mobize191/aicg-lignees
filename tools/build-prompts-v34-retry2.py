#!/usr/bin/env python3
# build-prompts-v34-retry2.py — paquet RETRY ciblé vague 3.4 (7 images) :
#   e31 x3 (canon 3 têtes renforcé), s18 x3 (armure noire mate), e14-r (scène de vie créature).
# Construit tools/prompts-v34-retry2.json à partir de prompts-v34.json + consignes CHANTEER.
import json

REPO = 'C:/Users/MOB/Documents/projet_data_IA/aicg-lignees'
base = json.load(open(REPO + '/tools/prompts-v34.json', encoding='utf-8'))
by_file = {p['file']: p for p in base}

NEG_BASE = ('card frame, card border, ornate border, picture frame, panel border, vignette border, '
            'text, letters, numbers, watermark, signature, logo, blood splatter, gore, open wounds, '
            'blood stains')
NEG_HUMAN = NEG_BASE + ', humans, humanoid, human face, human posture'
NEG_S18 = (NEG_BASE + ', close-up, portrait, bad quality, worst quality, '
           'white armor, silver armor, polished bright armor, shining chrome armor')

E31_POS = ('a massive multi-headed sea hydra, exactly three serpentine heads on long necks, '
           'all three heads fully visible, scaled hide, fins, coral crowns, leviathan a sea monster, '
           'a wild non-humanoid creature, no human traits, no human face, no human posture, '
           'in a deep blue and turquoise undersea setting with sea foam and coral accents, '
           'with turquoise water magic glowing around them, dynamic action pose, powerful aura, '
           'signature effect, intricate background, full body, standing, centered, looking at the viewer, '
           'Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, '
           'intricate background, epic fantasy splash artwork, rim lighting, full bleed artwork, '
           'edge to edge illustration')
E31_NEG = NEG_HUMAN + ', single head, two heads, one-headed creature'
LORA_LEVIATAN = {'file': 'Leviatan.safetensors', 'trigger': 'leviathan a sea monster', 'weight': 0.7}

S18_POS = ('an adult woman, a human, long straight black hair, a full matte black steel plate armor, '
           'blackened dark metal, only subtle gold trim, a sheathed sword at rest, unhelmeted, '
           'a warrior in armor, a grizzled veteran warrior with a mature face, with fair skin, '
           'in a stone rampart bastion at dusk with banners and warm torchlight')
S18_TAIL = ('dynamic action pose, powerful aura, signature effect, intricate background, full body, '
            'standing, centered, looking at the viewer, front lighting, face clearly visible, no hood, '
            'uncovered face, detailed eyes, Painted in a painterly, semi-realistic fantasy illustration '
            'style, detailed shading, intricate background, epic fantasy splash artwork, rim lighting, '
            'full bleed artwork, edge to edge illustration')
S18_R_SCENE = ('peaceful slice-of-life moment, calm resting pose, gentle daily activity, '
               'serene expression, no magic, no combat')
S18_O_SCENE = 'with an inverted spectral aura, colors reversed'

E14R_POS = ('a a colossal ancient armored sea monster like the Leviathan from Atlantis: The Lost Empire, '
            'massive crustacean shell carapace, glowing red eyes, tentacled maw, rows of jagged teeth, '
            'dark underwater ruins, leviathan a sea monster, a wild non-humanoid creature, no human traits, '
            'no human face, no human posture, in a deep blue and turquoise undersea setting with sea foam '
            'and coral accents, resting peacefully on the seabed, eyes half-closed in calm, small fish '
            'swimming around its massive frame, warm sunbeams filtering through the water, serene relaxed '
            'mood, no combat, no menace, full body, standing, centered, looking at the viewer, '
            'Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, '
            'intricate background, slice-of-life illustration, rim lighting, full bleed artwork, '
            'edge to edge illustration')
E14R_NEG = NEG_HUMAN + ', attacking, menacing pose, open threatening maw, dramatic confrontation'

out = []

# --- e31 x3 (seeds 2150086 / 7150086 / 12150086) ---
out.append({'file': 'e31.jpg', 'id': 'e31', 'theme': 'classique', 'seed': 2150086,
            'positive': E31_POS, 'negative': E31_NEG, 'lora': LORA_LEVIATAN, 'ipa': None,
            'framing': 'full body'})
e31r_pos = E31_POS.replace(
    'with turquoise water magic glowing around them, dynamic action pose, powerful aura, '
    'signature effect, intricate background',
    'peaceful slice-of-life moment at the heart of the reef, resting calmly among the coral, '
    'all three heads relaxed and fully visible, small fish swimming around, serene calm mood, '
    'no combat, no menace, intricate background').replace(
    'epic fantasy splash artwork', 'slice-of-life illustration')
out.append({'file': 'e31-r.jpg', 'id': 'e31', 'theme': 'repos', 'seed': 7150086,
            'positive': e31r_pos, 'negative': E31_NEG, 'lora': LORA_LEVIATAN, 'ipa': None,
            'framing': 'full body'})
e31o_pos = E31_POS.replace(
    'with turquoise water magic glowing around them, dynamic action pose, powerful aura',
    'with ember fire magic glowing around them, with an inverted spectral aura, colors reversed, '
    'ominous powerful aura, dynamic action pose')
out.append({'file': 'e31-o.jpg', 'id': 'e31', 'theme': 'obscures', 'seed': 12150086,
            'positive': e31o_pos, 'negative': E31_NEG, 'lora': LORA_LEVIATAN, 'ipa': None,
            'framing': 'full body'})

# --- s18 x3 (seeds 2150087 / 7150087 / 12150087) ---
out.append({'file': 's18.jpg', 'id': 's18', 'theme': 'classique', 'seed': 2150087,
            'positive': S18_POS + ', ' + S18_TAIL, 'negative': NEG_S18, 'lora': None, 'ipa': 's17',
            'framing': 'full body'})
out.append({'file': 's18-r.jpg', 'id': 's18', 'theme': 'repos', 'seed': 7150087,
            'positive': S18_POS + ', ' + S18_R_SCENE + ', ' + S18_TAIL,
            'negative': NEG_S18, 'lora': None, 'ipa': 's18', 'framing': 'full body'})
out.append({'file': 's18-o.jpg', 'id': 's18', 'theme': 'obscures', 'seed': 12150087,
            'positive': S18_POS + ', ' + S18_O_SCENE + ', ' + S18_TAIL,
            'negative': NEG_S18, 'lora': None, 'ipa': 's18', 'framing': 'full body'})

# --- e14-r (seed 7150088) ---
out.append({'file': 'e14-r.jpg', 'id': 'e14', 'theme': 'repos', 'seed': 7150088,
            'positive': E14R_POS, 'negative': E14R_NEG, 'lora': LORA_LEVIATAN, 'ipa': None,
            'framing': 'full body'})

with open(REPO + '/tools/prompts-v34-retry2.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print('prompts-v34-retry2.json :', len(out), 'entrées')
for p in out:
    print(' ', p['file'], p['seed'], 'lora=' + str(bool(p['lora'])), 'ipa=' + str(p['ipa']))
