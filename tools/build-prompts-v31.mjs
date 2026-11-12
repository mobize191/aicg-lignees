// build-prompts-v3.mjs — prompts v3 (spec docs/images/correction-prompts-v3.md, règles R1-R7).
// Socle : langage NATUREL painterly (comme les prompts WAI d'origine), corrigé :
//  R1 sujet UNIQUEMENT depuis species-map.json + character_dna (jamais depuis le nom FR),
//  R2 style painterly NL SANS aucun mot "card"/"trading card" + négatif anti-cadre,
//  R3 cadrage par rareté (demi-corps C/UC/R/SR, full body M/L/UR), fonds paysage sans humains,
//  R4 négatif COURT (<= 20 tags) canon §15 + anti-cadre R2 + ciblés §14/R5,
//  R5 z22/a16/d6/f18 : éclairage frontal, visage dégagé, no hood ; z22 oiseau de feu seul,
//  R6 seeds = seeds-v2.csv (inchangés), mapping échoue explicitement sans entrée d'espèce.
// Sortie : tools/prompts-v3.json (271 prompts).
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));

const speciesMap = read('tools/species-map.json');
const cards = read('data/cards.json');
const monsters = read('data/monsters.json');
const monsterFamilies = read('data/monster-families.json');

const cardById = {};
for (const c of [...cards, ...monsters]) cardById[c.id] = c;

// seeds : repris de seeds-v2.csv (R6) — file -> seed, première occurrence
const seedByFile = {};
for (const line of readFileSync(ROOT + 'tools/seeds-v2.csv', 'utf8').split('\n').slice(1)) {
  const m = line.match(/^([^,]+),(\d+),/);
  if (m && !(m[1] in seedByFile)) seedByFile[m[1]] = parseInt(m[2], 10);
}
const seedOf = (id) => seedByFile[id + '.jpg'] ?? null;

// ---------------------------------------------------------------------------
// Résolution d'espèce identique à v2 : named > family > dungeon-family > biome. Jamais le nom.
const DUNGEON_FAMILY_SPECIES = {
  'marees|Gobelins des Écumes': 'shaman', 'marees|Ab/maux': 'beastWater',
  'marees|Sirènes des Récifs': 'mermaid',
  'forge|Cendrels': 'fireElemental', 'forge|Enfants de la Braise': 'fireElemental', 'forge|Gobelin des Fumées': 'shaman',
  'bosquet|Bêtes du Fougeron': 'beastWood', 'bosquet|Gens des Sèves': 'dryad',
  'crypte|Spectres des Caveaux': 'beastDark', 'crypte|Les Naufragés': 'beastWater', 'crypte|Chevalerie Défunte': 'undeadKnightF',
  'zenith|Légion Solaire': 'herald', 'zenith|Phénix Célestes': 'phoenixFirebird', 'zenith|Clergé du Plein Jour': 'apostle',
  'divin|Arbitres du Seuil': 'celestialJudge', 'divin|Chœur Miroir': 'echoSpirit', 'divin|Tisseuses du Pont': 'fateWeaver',
};
const monsterFamilyOf = {};
for (const [dungeon, fams] of Object.entries(monsterFamilies))
  for (const fam of fams)
    for (const id of [...fam.lines.flat(), ...(fam.side || []), fam.mythic || ''].filter(Boolean))
      monsterFamilyOf[id] = `${dungeon}|${fam.name}`;

// R8 v3.1 : espèces beast:true selon la fiche projet (fireElemental incluse, malgré son tag « humanoid » hérité)
const BEASTLIKE = new Set(['beast', 'beastWater', 'beastFire', 'beastWood', 'beastDark', 'seaSerpent', 'seaBehemoth', 'treant', 'magmaGolem', 'fireElemental', 'phoenixFirebird']);
const SPECIES_ANTI = { fireLord: 'fireLord', phoenixFirebird: 'phoenixFirebird' };

function resolveSpecies(card) {
  const id = card.id;
  if (speciesMap.named[id]) return { species: speciesMap.named[id].species, source: 'named' };
  if (card.family && speciesMap.families[card.family]) return { species: speciesMap.families[card.family].species, source: `families.${card.family}` };
  if (monsterFamilyOf[id] && DUNGEON_FAMILY_SPECIES[monsterFamilyOf[id]])
    return { species: DUNGEON_FAMILY_SPECIES[monsterFamilyOf[id]], source: `dungeonFamily.${monsterFamilyOf[id]}` };
  if (card.biome === 'recrues' || !card.biome) return { species: 'human', source: card.biome ? 'biome.recrues' : 'naissance' };
  if (card.biome === 'divin') {
    if (/démon/i.test(card.name)) return { species: 'beastDark', source: 'biome.divin.démon' };
    return { species: 'human', source: 'biome.divin', extra: /ange|séraphin|éveillé/i.test(card.name) ? 'a divine angelic being with halo and wings' : '' };
  }
  throw new Error(`ÉCHEC MAPPING ESPÈCE : carte "${id}" (${card.name}) sans entrée species-map.json — l'espèce vient des data, jamais du nom.`);
}

// ---------------------------------------------------------------------------
// Grammaire NL painterly v3 (R1/R2). Le style vient de STYLE_V3, jamais du nom de la carte.
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
// maturité par rareté (humanMaturityByRarity) en langage naturel (R1)
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
  'mûre, majestueuse': 'a mature majestic woman',
};
const GENDER_NL = { '1girl': 'an adult woman', '1boy': 'an adult man' };
// R10 (v3.1) : assignation déterministe (hash de l'id) pour parité ~50/50 sur les génériques humanoïdes
const genderByFile = {};
function hashStr(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; }
function genericGender(id) { return hashStr('aicg-v31:' + id) % 2 === 0 ? '1girl' : '1boy'; }

// R9 (v3.1) : demi-corps = « half body framing, waist up » — plancher : poitrine complète visible ;
// « head and shoulders »/« bust »/« close-up »/« portrait » au NÉGATIF. M/L/UR = full body.
const FRAMING_NL = (r) => (['UR', 'L', 'M'].includes(r)
  ? { pos: 'full body, standing, centered', neg: 'close-up, portrait', label: 'full body' }
  : { pos: 'half body framing, waist up, centered, full chest visible', neg: 'head and shoulders, bust, close-up, portrait', label: 'demi-corps' });

// R4 : négatif court canon §15 (15 tags) + anti-cadre R2 — aucun mot "card" dans le POSITIF (le négatif anti-cadre est intentionnel)
const ANTI_NEG = 'card frame, card border, ornate border, picture frame, panel border, vignette border, text, letters, numbers, watermark, signature, logo'; // anti-cadre/anti-texte renforcés v3.1 (12)
const BASE_NEG = ANTI_NEG + ', bad quality, worst quality, sketch';
// R5/R4 ciblés : visage dégagé pour les sujets à capuche/ombre ; renforts f13/phénix
const FACE_POS = 'front lighting, face clearly visible, no hood, uncovered face, detailed eyes'; // v3.1
const FACE_NEG = 'dark face, hood covering face';
const BEAST_NEG = 'humans, humanoid, 1girl, 1boy, man, woman, human face, human posture'; // R8 v3.1
const NAMED_EXTRA_V3 = {
  f13: { pos: 'colossal, bulky, beast-like, no humanoid proportions', neg: '' },
  z19: { pos: 'a giant firebird, fully avian body, no arms, wings spread, perched alone', neg: BEAST_NEG },
  z22: { pos: 'a giant firebird alone, fully avian body, no arms, wings spread, no other figure', neg: 'human, humanoid figure, second figure, summoner' },
  a16: { pos: FACE_POS + ', no hood', neg: FACE_NEG },
  d6: { pos: FACE_POS + ', no hood, no mask, expressive face', neg: FACE_NEG + ', faceless, mask' },
  f18: { pos: FACE_POS + ', no hood', neg: FACE_NEG },
  a15: { pos: 'a man, bareheaded, beard stubble', neg: 'helmet, full helmet' },
  a17: { pos: 'a man, bareheaded, beard stubble', neg: 'helmet, full helmet' },
};

function buildCard(card) {
  const id = card.id;
  const named = speciesMap.named[id] || null;
  const { species, extra } = resolveSpecies(card);
  const beastlike = BEASTLIKE.has(species) || (named && named.beast === true);
  const rarity = card.rarity || 'C';
  const universe = card.dungeon || card.family || card.biome || 'naissance';
  const framing = FRAMING_NL(rarity);

  const parts = [];
  // R1 : sujet depuis l'espèce (description fixe), jamais depuis le nom
  const genderWord = named && !beastlike && !SPECIES_ANTI[species] ? (GENDER_NL[named.gender] || null) : null;
  // R10 (v3.1) : génériques humanoïdes = genre explicite, parité ~50/50 déterministe (hash de l'id)
  const genGender = !named && !beastlike && !SPECIES_ANTI[species] ? genericGender(id) : null; // R10 : tout générique humanoïde (humain, shaman, dryad, mermaid…)
  if (genGender) { genderByFile[id + '.jpg'] = genGender; parts.push('(aged up:1.0-2.0)'); parts.push(GENDER_NL[genGender]); parts.push(genGender + (genGender === '1girl' ? ', female' : ', male')); }
  let speciesDesc = species === 'human' ? (genderWord || genGender ? '' : 'human') : speciesMap.speciesTags[species].join(', ');
  if (beastlike) speciesDesc = speciesMap.speciesTags[species].filter((t) => !/humanoid|female|male|girl|boy|woman|man|human/i.test(t)).join(', '); // R8 : aucun terme humanisant sur une bête
  if (genderWord) parts.push(genderWord);
  if (speciesDesc) parts.push('a ' + speciesDesc);
  if (extra) parts.push(extra);
  if (!beastlike && card.classe && CLASS_NL[card.classe]) parts.push(CLASS_NL[card.classe]); // jamais de rôle humanoïde sur une bête
  if (beastlike) parts.push('a wild non-humanoid creature, no human traits, no human face, no human posture'); // R8 v3.1
  if (!beastlike) { // jamais d'âge/genre humain sur une bête
    if (named) parts.push(NAMED_AGE_NL[named.age] || 'an adult');       // champ age prioritaire (nommées)
    else if (species === 'human') parts.push(AGE_NL[rarity]);            // génériques humaines : maturité par rareté
  }
  if (species === 'human') parts.push('with fair skin');
  if (ELEMENT_NL[card.element]) parts.push('with ' + ELEMENT_NL[card.element]);
  parts.push('in ' + (PALETTES_NL[universe] || PALETTES_NL.naissance));
  parts.push(TIER_NL[rarity] || TIER_NL.C);
  parts.push(framing.pos + ', looking at the viewer');
  if (!beastlike) parts.push(FACE_POS); // v3.1 : visage frontal dégagé partout
  if (NAMED_EXTRA_V3[id]) parts.push(NAMED_EXTRA_V3[id].pos);
  parts.push(STYLE_V3); // R2 : style painterly NL, en fin de prompt
  parts.push('full bleed artwork, edge to edge illustration'); // anti-cadre renforcé v3.1
  const positive = parts.join(', ');

  // R4 : négatif court, dédupliqué, plafonné à 20 tags (base 15 + cadrage + ciblés)
  const targeted = [];
  if (beastlike) targeted.push(BEAST_NEG); // R8 v3.1 : jamais de figure humaine sur une bête
  else if (SPECIES_ANTI[species]) targeted.push('human, humanoid figure, girl with wings');
  if (NAMED_EXTRA_V3[id] && NAMED_EXTRA_V3[id].neg) targeted.push(NAMED_EXTRA_V3[id].neg);
  else if (!beastlike && ['reaper', 'lich', 'banshee', 'widowGhost', 'undeadCaptain', 'assassin', 'shaman'].includes(species))
    targeted.push(FACE_NEG); // sujets à capuche/ombre : visage toujours dégagé (R5/R4)
  if (named && /graine/.test(named.age || '')) targeted.push('adult, sexual, nude'); // graines 10-14 ans, jamais sexualisées
  // ordre de priorité : anti-cadre/texte > ciblés (R8/R5) > cadrage > qualité ; plafond 20 tags
  const negParts = [ANTI_NEG, ...targeted, framing.neg, 'bad quality, worst quality, sketch'];
  const neg = [...new Set(negParts.join(', ').split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 20).join(', ');

  return {
    id, file: id + '.jpg', name: card.name, rarity, universe, named: !!named,
    species, gender: named && !beastlike && !SPECIES_ANTI[species] ? named.gender : (genGender || null),
    age: named ? named.age : (species === 'human' ? speciesMap.humanMaturityByRarity[rarity] : null),
    character_dna: named ? { gender: named.gender, species, age: named.age, note: named.note || null } : null,
    framing: framing.label, seed: seedOf(id), positive, negative: neg,
  };
}

// ---------------------------------------------------------------------------
// Périmètre = les 271 ids de la campagne v2 (prompts-v2.json), seeds identiques (R6)
const v2 = read('tools/prompts-v2.json');
const v2ById = {};
for (const p of v2) v2ById[p.id] = p;

const out = [];
const refs = [];
for (const id of Object.keys(speciesMap.named)) {
  const card = cardById[id];
  if (!card) throw new Error(`ÉCHEC : nommée "${id}" de species-map.json introuvable dans les data`);
  const p = buildCard(card);
  p.reference = true;
  p.seed = seedOf(id) ?? v2ById[id]?.seed ?? (2126000 + refs.length);
  refs.push({ id, seed: p.seed, name: card.name });
  out.push(p);
}
for (const c of [...cards, ...monsters]) {
  if (speciesMap.named[c.id]) continue;
  if (out.some((p) => p.id === c.id)) continue;
  if (!v2ById[c.id]) continue; // périmètre v2 uniquement ; archivées depuis = non régénérées
  const p = buildCard(c);
  p.seed = seedOf(c.id) ?? v2ById[c.id]?.seed;
  out.push(p);
}
// les ids v2 sans carte active (archivées depuis) : reprendre le prompt v2 tel quel n'est pas possible
// (R1 impose data+species-map) ; elles sont exclues et signalées.
const missing = v2.filter((p) => !p.bg && !out.some((q) => q.id === p.id)).map((p) => p.id);
if (missing.length) console.log('NOTE: ids v2 hors périmètre data actuel (archivées):', missing.length, missing.slice(0, 8).join(','), '…');

const BGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith', 'divin'];
const BG_SCENERY_NL = {
  marees: 'an underwater sunken temple with shafts of filtered light, coral reef, drifting sea foam and ancient stone pillars, in deep blue and turquoise tones',
  forge: 'a volcanic forge interior with lava cracks in dark stone, glowing molten metal and floating embers, in soot black and ember orange tones',
  bosquet: 'an enchanted forest glade with giant glowing mushrooms, floating golden spores and light rays through the canopy, in moss green tones',
  crypte: 'a flooded crypt interior with candlelit sarcophagi, stagnant green water, cold mist and tattered shrouds, in grey green tones',
  zenith: 'a celestial sky sanctuary with golden clouds and warm sunlight, in ivory and gold tones',
  divin: 'an ivory hall of mirrors and hourglasses with golden threads of fate, in ivory and gold tones',
};
for (const bg of BGS) {
  out.push({
    id: 'bg-' + bg, file: 'bg-' + bg + '.jpg', name: 'Fond ' + bg, rarity: null, universe: bg,
    named: false, bg: true, species: null, gender: null, age: null, character_dna: null,
    framing: 'background', w: 1216, h: 832, seed: seedOf('bg-' + bg) ?? (2126100 + BGS.indexOf(bg)),
    positive: 'A vast landscape: ' + BG_SCENERY_NL[bg] + ', atmospheric volumetric light, empty foreground, no humans, no characters. ' + STYLE_V3,
    negative: [...new Set((BASE_NEG + ', people, creatures, humans, character, 1girl, 1boy, close-up, portrait').split(',').map((s) => s.trim()))].slice(0, 20).join(', '),
  });
}

writeFileSync(ROOT + 'tools/prompts-v3.json', JSON.stringify(out, null, 1));
// R10 : consignation du genre (file,gender) — génériques humanoïdes en parité ~50/50 déterministe
{
  const rows = ['file,gender'];
  for (const p of out) if (p.gender) rows.push(p.file + ',' + p.gender);
  writeFileSync(ROOT + 'tools/gender-map-v3.csv', rows.join(String.fromCharCode(10)) + String.fromCharCode(10));
}
// seeds consignés v3 (témoins 1126001+, refs 2126000+, génériques 2127000+, fonds, héros…)
{
  const rows = ['file,seed'];
  for (const p of out) rows.push(p.file + ',' + p.seed);
  writeFileSync(ROOT + 'tools/seeds-v3.csv', rows.join(String.fromCharCode(10)) + String.fromCharCode(10));
}

// ---------------------------------------------------------------------------
// Auto-vérification (brief vague 3) avant lancement
let errors = [];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
for (const p of out) {
  if (/\bcard\b|trading card/i.test(p.positive)) errors.push(`${p.id}: mot "card" dans le positif`);
  // 0 fragment issu du nom français dans le positif (mot entier, hors vocabulaire anglais légitime du prompt)
  const ALLOW = new Set(['mage', 'forge', 'spores', 'ember', 'legion', 'ange', 'lame', 'foi', 'or', 'mer', 'roi', 'eau', 'feu']);
  const posN = norm(p.positive);
  for (const w of norm(p.name).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !ALLOW.has(w))) {
    if (new RegExp('\\b' + w + '\\b').test(posN)) errors.push(`${p.id}: fragment du nom "${w}" dans le positif`);
  }
  const negTags = p.negative.split(',').map((s) => s.trim()).filter(Boolean);
  if (negTags.length > 20) errors.push(`${p.id}: négatif ${negTags.length} tags > 20`);
  if (!p.bg) {
    const full = ['UR', 'L', 'M'].includes(p.rarity);
    if (full && p.framing !== 'full body') errors.push(`${p.id}: rareté ${p.rarity} sans full body`);
    if (!full && p.framing !== 'demi-corps') errors.push(`${p.id}: rareté ${p.rarity} sans demi-corps`);
  }
  if (p.id === 'a15' || p.id === 'a17') { if (!/a man/.test(p.positive)) errors.push(`${p.id}: genre non verrouillé 1boy`); }
  if (['z19', 'z22', 'z2', 'z6', 'z16', 'z17', 'z18', 'z20', 'z21'].includes(p.id)) {
    if (p.species !== 'phoenixFirebird') errors.push(`${p.id}: espèce ${p.species} != phoenixFirebird`);
    if (/a woman|a man|1girl|1boy/.test(p.positive)) errors.push(`${p.id}: figure humaine sur un phénix`);
  }
  if (p.seed == null) errors.push(`${p.id}: seed manquant`);
  // R8 v3.1 : aucun terme de rôle humain dans le positif d'une bête
  if (['fireElemental','beastWood','beastWater','beastDark','phoenixFirebird','seaBehemoth','seaSerpent','treant','magmaGolem'].includes(p.species) || (p.character_dna && p.character_dna.beast)) {
    if (/warrior|mage|priest|knight| in robes|assassin|occultist/.test(p.positive.toLowerCase())) errors.push(`${p.id}: terme de rôle humain sur une bête (R8)`);
    if (!/humans, humanoid/.test(p.negative)) errors.push(`${p.id}: négatif bête incomplet (R8)`);
  }
  // R9 v3.1 : C/UC/R/SR = half body framing
  if (!p.bg && !['UR','L','M'].includes(p.rarity) && !/half body framing, waist up/.test(p.positive)) errors.push(`${p.id}: cadrage demi-corps non conforme (R9)`);
  // R10 v3.1 : générique humanoïde = genre explicite
  if (!p.bg && !p.named && !['fireElemental','beastWood','beastWater','beastDark','beastFire','beast','phoenixFirebird','seaBehemoth','seaSerpent','treant','magmaGolem','fireLord'].includes(p.species) && !p.gender) errors.push(`${p.id}: genre non assigné sur un générique humanoïde (R10)`);
}
console.log('prompts v3 :', out.length, '(dont', refs.length, 'références +', BGS.length, 'fonds)');
console.log('auto-vérification :', errors.length === 0 ? 'OK (0 erreur)' : errors.length + ' ERREUR(S)');
for (const e of errors.slice(0, 30)) console.log('  -', e);
if (errors.length) process.exit(1);
{
  const g = out.filter((p) => p.gender);
  const f = g.filter((p) => p.gender === '1girl').length;
  console.log('R10 parité :', f + ' F /', (g.length - f) + ' M sur', g.length, 'humanoïdes genrés');
}
console.log('--- exemple a15 ---\n', out.find((p) => p.id === 'a15').positive, '\n NEG:', out.find((p) => p.id === 'a15').negative);
console.log('--- exemple z19 ---\n', out.find((p) => p.id === 'z19').positive, '\n NEG:', out.find((p) => p.id === 'z19').negative);
console.log('--- exemple e5 (générique) ---\n', out.find((p) => p.id === 'e5').positive, '\n NEG:', out.find((p) => p.id === 'e5').negative);
