// build-prompts-v32.mjs — prompts vague 3.2 (verrous R11/R12/R13, spec §6 correction-prompts-v3.md).
// Hérite de build-prompts-v31.mjs (R1-R10) + :
//  R11 descriptions d'espèce concrètes (species-map.json v2, canon MTG/LotR/Atlantide) + LoRA si verdict GARDÉ,
//  R12 tenues correctes (positif fully clothed + négatif revealing) sur tous les humanoïdes,
//  R13 négatif blood/gore GLOBAL (aucune whitelist en 3.2),
//  R14 = règle de QA uniquement (verrou visage lisible maintenu sur nommées/héros),
//  b3 = retry full body (correctif résiduel v3.1),
//  + les 37 cartes manquantes (c1-c14, p5, p6, w1-w21), seeds 2150000+, IPAdapter compagnons/Kairos/Ananké.
// Mêmes seeds que prompts-v3.json pour les 271 ; sortie : tools/prompts-v32.json + tools/lora-tests-v32.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));

const speciesMap = read('tools/species-map.json');
const cards = read('data/cards.json');
const monsters = read('data/monsters.json');
const monsterFamilies = read('data/monster-families.json');
const oldPrompts = read('tools/prompts-v3.json');
const oldById = {};
for (const p of oldPrompts) oldById[p.id] = p;

const cardById = {};
for (const c of [...cards, ...monsters]) cardById[c.id] = c;

// DUNGEON_FAMILY_SPECIES v3.2 : gobelins -> espèce goblin (beast, R11) au lieu de shaman
const DUNGEON_FAMILY_SPECIES = {
  'marees|Gobelins des Écumes': 'goblin', 'marees|Ab/maux': 'beastWater',
  'marees|Sirènes des Récifs': 'mermaid',
  'forge|Cendrels': 'fireElemental', 'forge|Enfants de la Braise': 'fireElemental', 'forge|Gobelin des Fumées': 'goblin',
  'bosquet|Bêtes du Fougeron': 'beastWood', 'bosquet|Gens des Sèves': 'dryad',
  'crypte|Spectres des Caveaux': 'beastDark', 'crypte|Les Naufragés': 'beastWater', 'crypte|Chevalerie Défunte': 'undeadKnightF',
  'zenith|Légion Solaire': 'herald', 'zenith|Phénix Célestes': 'phoenixFirebird', 'zenith|Clergé du Plein Jour': 'apostle',
  'divin|Arbitres du Seuil': 'celestialJudge', 'divin|Chœur Miroir': 'echoSpirit', 'divin|Tisseuses du Pont': 'fateWeaver',
};
const monsterFamilyOf = {};
for (const [dungeon, fams] of Object.entries(monsterFamilies))
  for (const fam of fams)
    for (const id of [...fam.lines.flat(), ...(fam.side || []), fam.mythic || ''].filter(Boolean))
      monsterFamilyOf[id] = dungeon + '|' + fam.name;

const BEASTLIKE = new Set(speciesMap.beastSpecies || []);
const SPECIES_ANTI = { fireLord: 'fireLord', phoenixFirebird: 'phoenixFirebird' };

function resolveSpecies(card) {
  const id = card.id;
  if (speciesMap.named[id]) return { species: speciesMap.named[id].species, source: 'named', extra: speciesMap.named[id].extra || null };
  if (card.family && speciesMap.families[card.family]) return { species: speciesMap.families[card.family].species, source: 'families.' + card.family };
  if (monsterFamilyOf[id] && DUNGEON_FAMILY_SPECIES[monsterFamilyOf[id]])
    return { species: DUNGEON_FAMILY_SPECIES[monsterFamilyOf[id]], source: 'dungeonFamily.' + monsterFamilyOf[id] };
  if (card.biome === 'recrues' || !card.biome) return { species: 'human', source: card.biome ? 'biome.recrues' : 'naissance' };
  if (card.biome === 'divin') {
    if (/démon/i.test(card.name)) return { species: 'beastDark', source: 'biome.divin.démon' };
    return { species: 'human', source: 'biome.divin', extra: /ange|séraphin|éveillé/i.test(card.name) ? 'a divine angelic being with halo and wings' : '' };
  }
  throw new Error('ÉCHEC MAPPING ESPÈCE : carte "' + id + '" (' + card.name + ') sans entrée species-map.json.');
}

const STYLE_V3 = 'Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, intricate background, epic fantasy splash artwork, rim lighting';
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
  seuil: 'a warm gold and ivory celestial gate setting with radiant light',
  miroir: 'an ivory and silver hall of mirrors with cool reflected light and mirror shards',
  pont: 'a twilight bridge of golden threads over ivory mist, warm gold and pearl tones',
  naissance: 'a neutral adventurer setting', famille: 'a neutral adventurer setting',
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
  L: 'a legendary veteran, over 50, with an aura of experience', M: 'an ageless mythical figure',
};
const NAMED_AGE_NL = {
  'adulte': 'an adult', 'adulte aguerri': 'a grizzled veteran warrior with a mature face',
  'adulte défunt': 'an adult with a ghostly aura', 'adulte défunte': 'an adult with a ghostly aura',
  'jeune (graine)': 'a young child, 10-14 years old', 'ancien': 'an ancient elder',
  'ancien colosse': 'an ancient colossus', 'éternel': 'an ageless divine presence', 'éternelle': 'an ageless divine presence',
  'mûre, majestueuse': 'a mature majestic woman', 'force de l’âge légendaire': 'a legendary veteran, over 50, with an aura of experience',
};
const GENDER_NL = { '1girl': 'an adult woman', '1boy': 'an adult man' };
const genderByFile = {};
function hashStr(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; }
function genericGender(id) { return hashStr('aicg-v31:' + id) % 2 === 0 ? '1girl' : '1boy'; }

const FRAMING_NL = (r) => (['UR', 'L', 'M'].includes(r)
  ? { pos: 'full body, standing, centered', neg: 'close-up, portrait', label: 'full body' }
  : { pos: 'half body framing, waist up, centered, full chest visible', neg: 'head and shoulders, bust, close-up, portrait', label: 'demi-corps' });

const ANTI_NEG = 'card frame, ornate border, picture frame, text, watermark, signature';
const BLOOD_NEG = 'blood, gore, open wounds, blood stains'; // R13 global
const BEAST_NEG = 'humans, humanoid, human face, human posture, 1girl, 1boy'; // R8
const CLOTH_NEG = 'revealing clothing, exposed chest, cleavage, bare torso, bandage wrap'; // R12
const FACE_POS = 'front lighting, face clearly visible, no hood, uncovered face, detailed eyes';
const FACE_NEG = 'dark face, hood covering face, shadowed face, blue skin, grey skin'; // retour 12/11 : visages noirs + peau bleue
const CLOTH_POS = 'fully clothed, practical adventurer outfit, modest fantasy attire, covered torso'; // R12
const NAMED_EXTRA_V3 = {
  f13: { pos: 'colossal, bulky, beast-like, no humanoid proportions', neg: '' },
  z19: { pos: 'a giant firebird, fully avian body, no arms, wings spread, perched alone', neg: BEAST_NEG },
  z22: { pos: 'a giant firebird alone, fully avian body, no arms, wings spread, no other figure', neg: 'human, humanoid figure, second figure, summoner' },
  a16: { pos: FACE_POS + ', no hood', neg: FACE_NEG },
  d6: { pos: FACE_POS + ', no hood, no mask, expressive face', neg: FACE_NEG + ', faceless, mask' },
  f18: { pos: FACE_POS + ', no hood', neg: FACE_NEG },
  a15: { pos: 'a man, bareheaded, beard stubble', neg: 'helmet, full helmet' },
  a17: { pos: 'a man, bareheaded, beard stubble', neg: 'helmet, full helmet' },
  b3: { pos: 'full body framing, standing pose, entire figure visible from head to feet', neg: 'close-up, portrait, half body' },
};

let loraVerdicts = {};
if (existsSync(ROOT + 'tools/lora-verdicts-v32.json')) loraVerdicts = read('tools/lora-verdicts-v32.json');

function buildCard(card) {
  const id = card.id;
  const named = speciesMap.named[id] || null;
  const resolved = resolveSpecies(card);
  const species = resolved.species;
  const extra = resolved.extra;
  const beastlike = BEASTLIKE.has(species) || (named && named.beast === true);
  const rarity = card.rarity || 'C';
  const universe = (card.dungeon || card.family || card.biome || 'naissance').toLowerCase();
  const framing = (id === 'b3')
    ? { pos: 'full body framing, standing pose, entire figure visible from head to feet, centered', neg: 'close-up, portrait, half body', label: 'full body' }
    : FRAMING_NL(rarity);

  const parts = [];
  const genderWord = named && !beastlike && !SPECIES_ANTI[species] ? (GENDER_NL[named.gender] || null) : null;
  const genGender = !named && !beastlike && !SPECIES_ANTI[species] ? genericGender(id) : null;
  if (genGender) { genderByFile[id + '.jpg'] = genGender; parts.push('(aged up:1.0-2.0)'); parts.push(GENDER_NL[genGender]); parts.push(genGender + (genGender === '1girl' ? ', female' : ', male')); }
  let speciesDesc = species === 'human' ? (genderWord || genGender ? '' : 'human') : speciesMap.speciesTags[species].join(', ');
  // R11 : descriptions v2 déjà curatées (les négations « no human … » sont voulues dans le positif)
  const lv = loraVerdicts[species];
  const lora = (lv && lv.kept) ? { file: lv.file, trigger: lv.trigger, weight: lv.weight } : null;
  if (lora) speciesDesc = speciesDesc + ', ' + lora.trigger;
  if (genderWord) parts.push(genderWord);
  if (speciesDesc) parts.push('a ' + speciesDesc);
  if (extra) parts.push(extra);
  if (!beastlike && card.classe && CLASS_NL[card.classe]) parts.push(CLASS_NL[card.classe]);
  if (!beastlike) parts.push(CLOTH_POS);
  if (beastlike) parts.push('a wild non-humanoid creature, no human traits, no human face, no human posture');
  if (!beastlike) {
    if (named) parts.push(NAMED_AGE_NL[named.age] || 'an adult');
    else if (species === 'human') parts.push(AGE_NL[rarity]);
  }
  if (!beastlike && !['reaper','lich','undeadCaptain','widowGhost','banshee'].includes(species)) parts.push('with fair skin'); // retour 12/11 : anti peau bleue
  if (ELEMENT_NL[card.element]) parts.push('with ' + ELEMENT_NL[card.element]);
  parts.push('in ' + (PALETTES_NL[universe] || PALETTES_NL.naissance));
  parts.push(TIER_NL[rarity] || TIER_NL.C);
  parts.push(framing.pos + ', looking at the viewer');
  if (!beastlike) parts.push(FACE_POS);
  if (NAMED_EXTRA_V3[id]) parts.push(NAMED_EXTRA_V3[id].pos);
  parts.push(STYLE_V3);
  parts.push('full bleed artwork, edge to edge illustration');
  const positive = parts.join(', ');

  const targeted = [BLOOD_NEG];
  if (beastlike) targeted.push(BEAST_NEG);
  else { targeted.push(CLOTH_NEG); if (SPECIES_ANTI[species]) targeted.push('human, humanoid figure, girl with wings'); }
  if (NAMED_EXTRA_V3[id] && NAMED_EXTRA_V3[id].neg) targeted.push(NAMED_EXTRA_V3[id].neg);
  else if (!beastlike && ['reaper', 'lich', 'banshee', 'widowGhost', 'undeadCaptain', 'assassin', 'shaman'].includes(species)) targeted.push(FACE_NEG);
  if (named && /graine/.test(named.age || '')) targeted.push('adult, sexual, nude');
  if (!beastlike) targeted.push('blue skin, grey skin, dark face'); // retour 12/11
  const negParts = [ANTI_NEG, ...targeted, framing.neg, FACE_NEG, 'bad quality, worst quality'];
  const neg = [...new Set(negParts.join(', ').split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 22).join(', '); // plafond ~20-22 tags (canon §15 ~20)

  return {
    id, file: id + '.jpg', name: card.name, rarity, universe, named: !!named,
    species, gender: named && !beastlike && !SPECIES_ANTI[species] ? named.gender : (genGender || null),
    age: named ? named.age : (species === 'human' ? speciesMap.humanMaturityByRarity[rarity] : null),
    character_dna: named ? { gender: named.gender, species, age: named.age, note: named.note || null, ipa: named.ipa || null } : null,
    framing: framing.label, seed: oldById[id] ? oldById[id].seed : null, lora, ipa: named && named.ipa ? named.ipa : null,
    positive, negative: neg,
  };
}

const NEW37 = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','p5','p6',
  'w1','w2','w3','w4','w5','w6','w7','w8','w9','w10','w11','w12','w13','w14','w15','w16','w17','w18','w19','w20','w21'];
const out = [];
for (const old of oldPrompts) {
  if (old.bg) { out.push(old); continue; }
  const card = cardById[old.id];
  if (!card) { console.log('NOTE: id', old.id, 'sans carte data — repris tel quel'); out.push(old); continue; }
  out.push(buildCard(card));
}
for (let i = 0; i < NEW37.length; i++) {
  const id = NEW37[i];
  const card = cardById[id];
  if (!card) throw new Error('ÉCHEC : carte manquante ' + id + ' absente de data/cards.json');
  const p = buildCard(card);
  p.seed = 2150000 + i;
  p.reference = ['c1','c2','c3','c4','c5','c6','c7','w6','w18','p5'].includes(id);
  out.push(p);
}

{
  const rows = ['file,seed'];
  for (const p of out) if (p.seed != null) rows.push(p.file + ',' + p.seed);
  writeFileSync(ROOT + 'tools/seeds-v32.csv', rows.join('\n') + '\n');
}
{
  const rows = ['file,gender'];
  for (const p of out) if (p.gender) rows.push(p.file + ',' + p.gender);
  writeFileSync(ROOT + 'tools/gender-map-v32.csv', rows.join('\n') + '\n');
}

// Manifeste des tests LoRA (Phase 0) : 8 LoRAs x 6 témoins, poids 0.6/0.7/0.8 (2 images par poids)
{
  const bySpecies = {};
  for (const p of out) { if (p.bg || !p.species) continue; (bySpecies[p.species] = bySpecies[p.species] || []).push(p.seed); }
  const tests = [];
  const seenFile = new Set();
  for (const [species, lora] of Object.entries(speciesMap.loraBySpecies)) {
    if (seenFile.has(lora.file)) continue;
    seenFile.add(lora.file);
    const seeds = [...new Set(bySpecies[species] || [])];
    while (seeds.length < 6) seeds.push(seeds.length ? seeds[seeds.length - 1] + 1 : 2150900);
    const six = seeds.slice(0, 6);
    const weights = [0.6, 0.6, 0.7, 0.7, 0.8, 0.8];
    const slug = lora.file.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
    for (let i = 0; i < 6; i++) {
      const desc = (speciesMap.speciesTags[species] || ['monstrous beast']).join(', ');
      tests.push({
        tag: 'lora-' + slug + '-w' + weights[i] + '-' + i, lora: lora.file, trigger: lora.trigger, weight: weights[i],
        species, seed: six[i],
        positive: 'a ' + desc + ', ' + lora.trigger + ', a wild non-humanoid creature, no human traits, no human face, no human posture, in a dark fantasy setting, full body, centered, ' + STYLE_V3 + ', full bleed artwork, edge to edge illustration',
        negative: [ANTI_NEG, BLOOD_NEG, BEAST_NEG, 'bad quality, worst quality'].join(', '),
      });
    }
  }
  writeFileSync(ROOT + 'tools/lora-tests-v32.json', JSON.stringify(tests, null, 1));
  console.log('tests LoRA :', tests.length, '(8 LoRAs x 6)');
}

writeFileSync(ROOT + 'tools/prompts-v32.json', JSON.stringify(out, null, 1));

// Auto-vérification vague 3.2
let errors = [];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const BEAST_SET = new Set([...BEASTLIKE, 'goblin', 'gorgon']);
for (const p of out) {
  if (p.bg) continue;
  if (/\bcard\b|trading card/i.test(p.positive)) errors.push(p.id + ': mot "card" dans le positif');
  const ALLOW = new Set(['mage', 'forge', 'spores', 'ember', 'legion', 'ange', 'lame', 'foi', 'or', 'mer', 'roi', 'eau', 'feu', 'miroir', 'pont', 'seuil']);
  const posN = norm(p.positive);
  for (const w of norm(p.name).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !ALLOW.has(w))) {
    if (new RegExp('\\b' + w + '\\b').test(posN)) errors.push(p.id + ': fragment du nom "' + w + '" dans le positif');
  }
  const negTags = p.negative.split(',').map((s) => s.trim()).filter(Boolean);
  if (negTags.length > 22) errors.push(p.id + ': négatif ' + negTags.length + ' tags > 22');
  if (!/blood/.test(p.negative)) errors.push(p.id + ': R13 négatif sang absent');
  const full = ['UR', 'L', 'M'].includes(p.rarity) || p.id === 'b3';
  if (full && p.framing !== 'full body') errors.push(p.id + ': rareté ' + p.rarity + ' sans full body');
  if (!full && p.framing !== 'demi-corps') errors.push(p.id + ': rareté ' + p.rarity + ' sans demi-corps');
  if (p.id === 'a15' || p.id === 'a17') { if (!/a man/.test(p.positive)) errors.push(p.id + ': genre non verrouillé 1boy'); }
  if (['z19','z22','z2','z6','z16','z17','z18','z20','z21'].includes(p.id)) {
    if (p.species !== 'phoenixFirebird') errors.push(p.id + ': espèce != phoenixFirebird');
    if (/a woman|a man|1girl|1boy/.test(p.positive)) errors.push(p.id + ': figure humaine sur un phénix');
  }
  if (p.seed == null) errors.push(p.id + ': seed manquant');
  const beast = BEAST_SET.has(p.species) || (p.character_dna && p.character_dna.beast);
  if (beast) {
    if (/warrior|mage|priest|knight| in robes|assassin|occultist/.test(p.positive.toLowerCase())) errors.push(p.id + ': terme de rôle humain sur une bête (R8)');
    if (!/humans, humanoid/.test(p.negative)) errors.push(p.id + ': négatif bête incomplet (R8)');
  } else {
    if (!/fully clothed/.test(p.positive)) errors.push(p.id + ': R12 positif tenues absent');
    if (!/revealing clothing/.test(p.negative)) errors.push(p.id + ': R12 négatif revealing absent');
  }
  if (!p.named && !beast && !SPECIES_ANTI[p.species] && !p.gender) errors.push(p.id + ': genre non assigné (R10)');
}
const nNew = out.filter((p) => NEW37.includes(p.id)).length;
console.log('prompts v3.2 :', out.length, '(271 existants +', nNew, 'nouvelles + 6 fonds)');
console.log('auto-vérification :', errors.length === 0 ? 'OK (0 erreur)' : errors.length + ' ERREUR(S)');
for (const e of errors.slice(0, 30)) console.log('  -', e);
if (errors.length) process.exit(1);
{
  const g = out.filter((p) => p.gender && !p.bg);
  const f = g.filter((p) => p.gender === '1girl').length;
  console.log('R10 parité :', f + ' F /', (g.length - f) + ' M sur', g.length, 'humanoïdes genrés');
}
console.log('--- exemple e14 (léviathan R11) ---\n', out.find((p) => p.id === 'e14').positive, '\n NEG:', out.find((p) => p.id === 'e14').negative);
console.log('--- exemple a15 (R12) ---\n', out.find((p) => p.id === 'a15').positive, '\n NEG:', out.find((p) => p.id === 'a15').negative);
const c8 = out.find((p) => p.id === 'c8');
console.log('--- exemple c8 ---', JSON.stringify({ ipa: c8.ipa, seed: c8.seed, framing: c8.framing }));
console.log('--- exemple w21 (gorgonne) ---\n', out.find((p) => p.id === 'w21').positive);
