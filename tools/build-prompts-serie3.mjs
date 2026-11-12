// build-prompts-serie3.mjs — série 3, vague 1 (cartes) : delta du manifeste = ids data absents de
// prompts-v3.json (g31, g32, k31, k32, p2, z31, z32). Verrous 3.1 identiques à build-prompts-v31.mjs.
// Seeds série 3 : 2132000+. Sortie : tools/prompts-serie3.json + append seeds-v3.csv.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));

const speciesMap = read('tools/species-map.json');
const cards = read('data/cards.json');
const monsters = read('data/monsters.json');
const cardById = {};
for (const c of [...cards, ...monsters]) cardById[c.id] = c;
const v3 = read('tools/prompts-v3.json');
const v3Ids = new Set(v3.map((p) => p.id));
const DELTA = Object.keys(cardById).filter((id) => !v3Ids.has(id));

const STYLE_V3 = 'Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, intricate background, epic fantasy splash artwork, rim lighting';
const ANTI_NEG = 'card frame, card border, ornate border, picture frame, panel border, vignette border, text, letters, numbers, watermark, signature, logo';
const FACE_POS = 'front lighting, face clearly visible, no hood, uncovered face, detailed eyes';
// R10 + maturité par rareté : le mot de genre suit l'âge (C = ado, UC = jeune adulte, sinon adulte)
const GENDER_NL = {
  C:      { '1girl': 'a teenage girl, 14-17 years old', '1boy': 'a teenage boy, 14-17 years old' },
  UC:     { '1girl': 'a young woman, 18-22 years old',    '1boy': 'a young man, 18-22 years old' },
  default:{ '1girl': 'an adult woman',                     '1boy': 'an adult man' },
};
const genderWord = (g, rarity) => (GENDER_NL[rarity] || GENDER_NL.default)[g];
function hashStr(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; }
const genericGender = (id) => (hashStr('aicg-v31:' + id) % 2 === 0 ? '1girl' : '1boy');

// espèce série 3 : gobelins = shaman (humanoïde assumé, cf. DUNGEON_FAMILY_SPECIES), ange divin = human ailé
function resolveSpecies3(card) {
  const id = card.id;
  if (speciesMap.named[id]) return { species: speciesMap.named[id].species, named: speciesMap.named[id] };
  if (/gobelin/i.test(card.name)) return { species: 'shaman', named: null };
  if (card.biome === 'divin') return { species: 'human', named: null, extra: /ange|séraphin|éveillé/i.test(card.name) ? 'a divine angelic being with halo and wings' : '' };
  if (card.family && speciesMap.families[card.family]) return { species: speciesMap.families[card.family].species, named: null };
  return { species: 'human', named: null };
}

const CLASS_NL = {
  Guerrier: 'a warrior in armor', Mage: 'a mage in flowing robes casting a spell', Prêtre: 'a priest in holy vestments',
  Assassin: 'an assassin with dual blades', Occultiste: 'an occultist in dark robes',
};
const ELEMENT_NL = {
  Eau: 'turquoise water magic glowing around them', Feu: 'ember fire magic glowing around them', Terre: 'earth magic with vines',
  Ombre: 'dark shadow wisps', Lumière: 'golden holy light', Neutre: '',
};
const PALETTES_NL = {
  marees: 'a deep blue and turquoise undersea setting with sea foam and coral accents',
  forge: 'an ember orange and soot black volcanic setting with glowing red metal and floating embers',
  bosquet: 'a moss green and gold enchanted forest setting with golden spores and giant mushrooms',
  crypte: 'a grey green flooded crypt setting with candlelight and cold mist',
  zenith: 'a warm gold and ivory celestial setting with radiant light',
  divin: 'an ivory and gold hall of mirrors with golden threads of fate',
  naissance: 'a neutral adventurer setting',
};
const TIER_NL = {
  C: 'calm pose, simple background, no energy effects', UC: 'calm pose, simple background, no energy effects',
  R: 'confident pose, discreet background, faint elemental wisps',
  SR: 'dynamic pose, moderate magic effects, detailed background',
  UR: 'dynamic action pose, strong magic effects, detailed background',
  L: 'dynamic action pose, powerful aura, signature effect, intricate background',
  M: 'epic scale, full power aura, dramatic lighting, intricate background',
};
const AGE_NL = {
  C: 'a teenager, 14-17 years old', UC: 'a young adult, 18-22 years old', R: 'an adult, 23-30 years old',
  SR: 'a seasoned adult, 30-38 years old', UR: 'a mature battle-hardened adult, 40-50 years old',
};
// donjon d'appartenance des gobelins régionaux (préfixe d'id) pour la palette
const DUNGEON_OF = { g: 'bosquet', k: 'crypte', z: 'zenith', p: 'divin', e: 'marees', f: 'forge' };

let errors = [];
const out = [];
DELTA.forEach((id, i) => {
  const card = cardById[id];
  const { species, named, extra } = resolveSpecies3(card);
  const rarity = card.rarity || 'C';
  const universe = card.dungeon || card.biome || DUNGEON_OF[id[0]] || 'naissance';
  const beastlike = false; // aucun beast:true dans le delta vague 1
  const genGender = genericGender(id);
  const full = ['UR', 'L', 'M'].includes(rarity);
  const framingPos = full ? 'full body, standing, centered' : 'half body framing, waist up, centered, full chest visible';
  const framingNeg = full ? 'close-up, portrait' : 'head and shoulders, bust, close-up, portrait';
  const parts = [];
  parts.push('(aged up:1.0-2.0)');
  parts.push(genderWord(genGender, rarity));
  parts.push(genGender + (genGender === '1girl' ? ', female' : ', male'));
  const speciesDesc = species === 'human' ? '' : speciesMap.speciesTags[species].join(', ');
  if (speciesDesc) parts.push('a ' + speciesDesc);
  if (extra) parts.push(extra);
  if (card.classe && CLASS_NL[card.classe]) parts.push(CLASS_NL[card.classe]);
  if (species === 'human') parts.push('with fair skin');
  if (ELEMENT_NL[card.element]) parts.push('with ' + ELEMENT_NL[card.element]);
  parts.push('in ' + (PALETTES_NL[universe] || PALETTES_NL.naissance));
  parts.push(TIER_NL[rarity] || TIER_NL.C);
  parts.push(framingPos + ', looking at the viewer');
  parts.push(FACE_POS);
  parts.push(STYLE_V3);
  parts.push('full bleed artwork, edge to edge illustration');
  const positive = parts.join(', ');
  const neg = [...new Set((ANTI_NEG + ', ' + framingNeg + ', dark face, hood covering face, bad quality, worst quality, sketch')
    .split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 20).join(', ');
  const seed = 2132000 + i;
  out.push({
    id, file: id + '.jpg', name: card.name, rarity, universe, named: false, bg: false,
    species, gender: genGender, age: speciesMap.humanMaturityByRarity[rarity],
    character_dna: null, framing: full ? 'full body' : 'demi-corps', seed, positive, negative: neg, serie3: true,
  });
  if (/\bcard\b|trading card/i.test(positive)) errors.push(id + ': mot card dans le positif');
  if (neg.split(',').length > 20) errors.push(id + ': négatif > 20 tags');
});

writeFileSync(ROOT + 'tools/prompts-serie3.json', JSON.stringify(out, null, 1));
appendFileSync(ROOT + 'tools/seeds-v3.csv', out.map((p) => p.file + ',' + p.seed).join('\n') + '\n');
console.log('série 3 vague 1 :', out.length, 'cartes ->', out.map((p) => p.id).join(','));
console.log('auto-vérification :', errors.length === 0 ? 'OK (0 erreur)' : errors.join(' | '));
for (const p of out) console.log('---', p.id, p.species, p.gender, '\n', p.positive.slice(0, 150), '\n NEG:', p.negative);
