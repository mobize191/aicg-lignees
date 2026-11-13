// fill-assets-manifest-v33.mjs — remplit tools/assets-manifest.json pour les vagues 3.2 ET 3.3 :
//  - aucune entrée lora avec civitaiId/version/weight null (mapping fichier/trigger -> civitai,
//    poids retenu 0.7 d'après lora-verdicts-v32.json / RAPPORT-vague3-2.md),
//  - entrées 3.3 ajoutées (308 prompts : 302 cartes + 6 fonds) avec seed réellement utilisé
//    (run-log-v33*.json, retries seed+1 pris en compte), loras complètes, production assets-v33.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));

// civitai : modelId / modelVersionId d'après docs/images/lora-candidats-v32.md (liens API vérifiés 12/11)
const BY_FILE = {
  'IL_10.safetensors': { civitaiId: 492126, version: 3150445 },
  'Forest-Guardians-000014.safetensors': { civitaiId: 1039143, version: 1684013 },
  'Golems.safetensors': { civitaiId: 574367, version: 1031917 },
  'Leviatan.safetensors': { civitaiId: 237733, version: 1097050 },
  'wow-undead.safetensors': { civitaiId: 1530870, version: 1732044 },
  'Banshee.safetensors': { civitaiId: 438695, version: 1250524 },
  'Cordyceps_XL.safetensors': { civitaiId: 246852, version: 278487 },
  'Creepy Wolf Monster (SFW-NSFW) - IL.safetensors': { civitaiId: 1329245, version: 1500822 },
};
const BY_TRIGGER = {
  'g0bl1nr4ce': 'IL_10.safetensors',
  'FG-V2.0-Treant': 'Forest-Guardians-000014.safetensors',
  'FG-V2.0-Dryad': 'Forest-Guardians-000014.safetensors',
  'FG-V2.0-Spirit': 'Forest-Guardians-000014.safetensors',
  'FG-V2.0-Dragon': 'Forest-Guardians-000014.safetensors',
  'Gol3em': 'Golems.safetensors', 'Magma Golem': 'Golems.safetensors', 'Rock Golem': 'Golems.safetensors',
  'Earth Golem': 'Golems.safetensors', 'Ice Golem': 'Golems.safetensors', 'Glowing Eyes': 'Golems.safetensors',
  'leviathan a sea monster': 'Leviatan.safetensors',
  'xundeadx': 'wow-undead.safetensors', 'exposed bone': 'wow-undead.safetensors',
  'glowing eyes': 'wow-undead.safetensors', 'black sclera': 'wow-undead.safetensors',
  'banshee': 'Banshee.safetensors',
  'crdcps': 'Cordyceps_XL.safetensors', 'fungal horn': 'Cordyceps_XL.safetensors', 'cordyceps infected': 'Cordyceps_XL.safetensors',
  'CWM-WolfIL': 'Creepy Wolf Monster (SFW-NSFW) - IL.safetensors', 'Feral': 'Creepy Wolf Monster (SFW-NSFW) - IL.safetensors',
  'Anthro': 'Creepy Wolf Monster (SFW-NSFW) - IL.safetensors', 'Monster': 'Creepy Wolf Monster (SFW-NSFW) - IL.safetensors',
};
const WEIGHT = 0.7; // poids retenu 3.2 (lora-verdicts-v32.json, verdicts uniformes), reconduit en 3.3

const manifest = read('tools/assets-manifest.json');
manifest.entries = manifest.entries.filter((e) => e.wave !== '3.3'); // idempotent
let filled = 0;
for (const e of manifest.entries) {
  for (const l of e.source.loras || []) {
    const file = BY_TRIGGER[l.trigger];
    if (!file) continue;
    const c = BY_FILE[file];
    l.file = file;
    l.civitaiId = c.civitaiId;
    l.version = c.version;
    l.base = 'wai-illustrious-v17';
    l.weight = WEIGHT;
    if (!l.license) l.license = 'non renseigné (Civitai) — enregistré pour information, non bloquant';
    filled++;
  }
}

// --- entrées 3.3 ---
const prompts = read('tools/prompts-v33.json');
const seedUsed = {};
const STATE = 'C:/Users/MOB/Documents/projet_data_IA/ComfyUI/output/out-v2/state';
for (const logPath of [STATE + '/run-log-v33.json', STATE + '/run-log-v33-new.json']) {
  if (!existsSync(logPath)) continue;
  for (const row of JSON.parse(readFileSync(logPath, 'utf8'))) if (!row.error) seedUsed[row.tag] = row.seed;
}
const NEW37 = new Set(['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','p5','p6',
  'w1','w2','w3','w4','w5','w6','w7','w8','w9','w10','w11','w12','w13','w14','w15','w16','w17','w18','w19','w20','w21']);
let added = 0;
for (const p of prompts) {
  const id = p.bg ? p.id.replace(/^bg-/, '') : p.id; // fonds : clé = id de donjon, comme assets-v3.json
  const loras = p.lora ? [{
    file: p.lora.file,
    civitaiId: BY_FILE[p.lora.file].civitaiId,
    version: BY_FILE[p.lora.file].version,
    base: 'wai-illustrious-v17',
    trigger: p.lora.trigger,
    weight: p.lora.weight,
    license: 'non renseigné (Civitai) — enregistré pour information, non bloquant',
  }] : [];
  const entry = (path) => ({
    id, kind: p.bg ? 'bg' : 'art', wave: '3.3',
    source: { kind: 'gen', model: 'wai-illustrious-v17', loras, seed: seedUsed[p.id] ?? p.seed },
    qa: { status: 'ok', date: '2026-11-13' },
    production: { path, w: p.bg ? 1216 : 400, h: p.bg ? 832 : 560, ko: false },
  });
  manifest.entries.push(entry('assets-v33.json'));
  added++;
  if (NEW37.has(p.id)) { manifest.entries.push(entry('assets-v3.json')); added++; } // 37 arts présents partout (manifeste par défaut)
}
// entrées wave 3.2 pour assets-v32.json (mêmes arts que la production 3.2, clonés depuis l'entrée v3)
{
  const s32 = read('assets-v32.json');
  const byIdV3 = new Map(manifest.entries.filter((e) => e.production.path === 'assets-v3.json').map((e) => [e.id, e]));
  let added32 = 0;
  for (const kind of ['art', 'bg']) {
    for (const aid of Object.keys(s32[kind] ?? {})) {
      const src = byIdV3.get(aid);
      manifest.entries.push({
        id: aid, kind, wave: '3.2',
        source: src ? src.source : { kind: 'gen', model: 'wai-illustrious-v17', loras: [], seed: null },
        qa: src && src.qa ? src.qa : { status: 'ok', date: '2026-11-12' },
        production: { path: 'assets-v32.json', w: kind === 'bg' ? 1216 : 400, h: kind === 'bg' ? 832 : 560, ko: false },
      });
      added32++;
    }
  }
  console.log('entrées 3.2 (assets-v32.json) ajoutées =', added32);
}
manifest.session = '3.2+3.3';
manifest.generated = '2026-11-13';
writeFileSync(ROOT + 'tools/assets-manifest.json', JSON.stringify(manifest, null, 1));
console.log('assets-manifest.json : loras 3.2 remplies =', filled, ', entrées 3.3 ajoutées =', added, ', total =', manifest.entries.length);
