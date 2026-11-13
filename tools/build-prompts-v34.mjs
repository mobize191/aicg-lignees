// build-prompts-v34.mjs — prompts vague 3.4 GEL v18 + thèmes Repos/Obscures (spec docs/images/spec-arts-v34-gel-v18.md, ARBITRÉ 15/11 suite 36).
// Base = prompts v3.3 (308 entrées) : chaque carte reçoit 3 prompts :
//   - Classique : repris tel quel de v3.3 (seed inchangé)
//   - Repos     : seed + 5 000 000, scène de vie calme du biome (thème A)
//   - Obscures  : seed + 10 000 000, inversion de la magie seule (thème C)
// R13 conservé partout. Pas de R12. Pas de Crépuscule. ÉCHEC explicite sur carte sans espèce.
// Sortie : tools/prompts-v34.json + tools/seeds-v34.csv
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));

const speciesMap = read('tools/species-map.json');
const base = read('tools/prompts-v33.json');
const cards = read('data/cards.json');
const monsters = read('data/monsters.json');
const cardById = {};
for (const c of [...cards, ...monsters]) cardById[c.id] = c;

// Activités de vie par biome (thème Repos, test-themes-exception.md §1-A)
const LIFE_BY_BIOME = {
  marees: 'repairing fishing nets, browsing a seashell market, fishing from a wooden pier',
  bosquet: 'tending a fawn, gathering wild fruits, planting a seedling in moss',
  forge: 'forging a farm tool (not a weapon), resting by the anvil, supping by the fire',
  crypte: 'tending flowers on a grave, trimming candles, keeping a peaceful vigil',
  zenith: 'evening prayer, browsing a celestial library, an astrologer at their desk',
  divin: 'a quiet moment in the hall of mirrors, polishing a silver chalice',
  seuil: 'a calm moment at the celestial gate, reading an ancient tome',
  miroir: 'a peaceful moment among the mirrors, arranging crystal shards',
  pont: 'sitting on the bridge of fate, watching the golden threads shimmer',
  naissance: 'resting at a campfire, sharing bread with companions',
  famille: 'a quiet domestic moment, preparing tea',
};

// Inversion élémentaire pour Obscures (thème C)
const ELEMENT_INVERSE = {
  Feu: 'ice', Eau: 'magma', Nature: 'decay', Ombre: 'light', Lumière: 'shadow', Terre: 'air', Neutre: null,
};
const INVERSION_NL = {
  light_corrupt: 'corrupted by shadow, dark veins of smoky wisps, dimmed halo, ominous aura, pale sickly light',
  dark_purify: 'purified by holy light, radiant golden glow dispelling the darkness, serene expression, soft dawn light',
  element_invert: 'element inverted, opposing magical energy swirling around them',
};

const ANTI_NEG = 'card frame, card border, ornate border, picture frame, panel border, vignette border, text, letters, numbers, watermark, signature, logo';
const BLOOD_NEG = 'blood splatter, gore, open wounds, blood stains';
const BEAST_NEG = 'humans, humanoid, human face, human posture, 1girl, 1boy';

const out = [];
const errors = [];
let countClassique = 0, countRepos = 0, countObscures = 0, countBg = 0;
const seedRows = ['file,seed'];
const newSeeds = [];
let nextSeed = 2150037; // suite de seeds-v3.csv (dernier = 2150036)

function addSeed(file, seed) {
  seedRows.push(file + ',' + seed);
}

for (const p of base) {
  if (p.bg) {
    // Fonds repris tels quels, pas de variantes thèmes
    out.push(p);
    countBg++;
    continue;
  }
  const card = cardById[p.id];
  if (!card) {
    errors.push(p.id + ': carte absente de data — ÉCHEC mapping espèce');
    continue;
  }
  if (!p.species || !speciesMap.speciesTags[p.species]) {
    errors.push(p.id + ': espèce "' + p.species + '" sans entrée species-map.json — ÉCHEC explicite requis par spec §1');
    continue;
  }
  const baseSeed = p.seed;
  if (baseSeed == null) {
    errors.push(p.id + ': seed manquant dans prompts-v33.json');
    continue;
  }
  const universe = (p.universe || 'naissance').toLowerCase();
  const element = card.element || 'Neutre';
  const isBeast = speciesMap.beastSpecies.includes(p.species);

  // --- 1. CLASSIQUE (repris tel quel de v3.3) ---
  const classique = { ...p, theme: 'classique', file: p.id + '.jpg' };
  out.push(classique);
  countClassique++;
  addSeed(p.id + '.jpg', baseSeed);

  // --- 2. REPOS (thème A : scène de vie calme) ---
  const reposSeed = baseSeed + 5000000;
  const lifeActivity = LIFE_BY_BIOME[universe] || LIFE_BY_BIOME.naissance;
  let reposPositive = p.positive.replace(/, (dynamic action pose|confident pose|epic scale|full power aura)[^,]*,/g, ', relaxed natural pose,');
  // Remplacer le tier par un ton calme
  reposPositive = reposPositive.replace(/, (epic scale, full power aura, dramatic lighting|dynamic action pose, powerful aura|dynamic action pose, strong magic effects|dynamic pose, moderate magic effects|confident pose, discreet background)[^,]*,/g, ', calm relaxed pose, quiet peaceful atmosphere,');
  reposPositive = reposPositive.replace(/, (epic fantasy splash artwork)/, ', slice-of-life illustration');
  // Ajouter la scène de vie
  const reposAddition = `in a quiet slice-of-life scene, ${lifeActivity}, relaxed natural pose, warm intimate mood, no combat, no magic effects`;
  // Insérer après le décor du biome
  reposPositive = reposPositive.replace(/(in [a-z].*?setting[^,]*,)/, `$1 ${reposAddition},`);
  if (!reposPositive.includes('slice-of-life')) reposPositive = reposPositive + ', ' + reposAddition;

  let reposNegative = p.negative;
  if (isBeast) reposNegative = reposNegative; // R8 conservé pour les bêtes
  const repos = {
    ...p,
    theme: 'repos',
    file: p.id + '-r.jpg',
    seed: reposSeed,
    positive: reposPositive,
    negative: reposNegative,
    lora: p.lora, // mêmes LoRAs
    ipa: p.ipa,   // IPAdapter 0.4 sur les nommées, les 3 versions
  };
  out.push(repos);
  countRepos++;
  addSeed(p.id + '-r.jpg', reposSeed);

  // --- 3. OBSCURES (thème C : inversion de la magie seule) ---
  const obscuresSeed = baseSeed + 10000000;
  let obscuresPositive = p.positive;
  let inversionDesc = '';
  if (element === 'Lumière') {
    inversionDesc = INVERSION_NL.light_corrupt;
  } else if (element === 'Ombre') {
    inversionDesc = INVERSION_NL.dark_purify;
  } else if (ELEMENT_INVERSE[element]) {
    inversionDesc = `element inverted from ${element.toLowerCase()} to ${ELEMENT_INVERSE[element]}, ` + INVERSION_NL.element_invert;
  } else {
    inversionDesc = INVERSION_NL.element_invert;
  }
  // Remplacer l'aura magique par l'inversion
  obscuresPositive = obscuresPositive.replace(/, (golden holy light|dark shadow wisps|turquoise water magic glowing around them|ember fire magic glowing around them|earth magic with vines)[^,]*,/g, `, ${inversionDesc},`);
  // Remplacer le tier par un ton menaçant/purifié
  obscuresPositive = obscuresPositive.replace(/, (epic scale, full power aura, dramatic lighting|dynamic action pose, powerful aura|dynamic action pose, strong magic effects|dynamic pose, moderate magic effects|confident pose, discreet background)[^,]*,/g, ', ominous powerful aura, dramatic chiaroscuro lighting,');
  if (!obscuresPositive.includes('corrupted') && !obscuresPositive.includes('purified') && !obscuresPositive.includes('inverted')) {
    obscuresPositive = obscuresPositive + ', ' + inversionDesc;
  }

  const obscures = {
    ...p,
    theme: 'obscures',
    file: p.id + '-o.jpg',
    seed: obscuresSeed,
    positive: obscuresPositive,
    negative: p.negative, // R13 conservé, jamais de gore ajouté
    lora: p.lora,
    ipa: p.ipa,
  };
  out.push(obscures);
  countObscures++;
  addSeed(p.id + '-o.jpg', obscuresSeed);
}

// --- Merge gel v1 (tools/prompts-gel-v1.json : 54 cartes × 3 thèmes, spec gelée suite 39) ---
// Les cartes gel remplacent les entrées existantes (p1, p5, p6, n14, z8 = re-arts) et ajoutent les nouvelles (d19-d40, p7-p8, a50-a53, s15-s18, k33-k40, g33-g39, e31-e32)
let gelPrompts = [];
try {
  gelPrompts = read('tools/prompts-gel-v1.json');
  if (!Array.isArray(gelPrompts)) gelPrompts = gelPrompts.prompts || [];
} catch (e) {
  console.log('NOTE: tools/prompts-gel-v1.json absent, gel non mergé');
}
if (gelPrompts.length) {
  const gelIds = new Set(gelPrompts.map(p => p.id.replace(/-[ro]$/, '')));
  // Retirer les anciennes entrées des cartes gel (seront remplacées)
  for (let i = out.length - 1; i >= 0; i--) {
    if (!out[i].bg && gelIds.has(out[i].id)) out.splice(i, 1);
  }
  // Ajouter les prompts gel (déjà en 3 thèmes avec seeds +5M/+10M)
  // Normaliser : id sans suffixe, theme explicite (cohérence avec le reste du fichier)
  for (const g of gelPrompts) {
    const baseId = g.id.replace(/-[ro]$/, '');
    const normalized = { ...g, id: baseId };
    out.push(normalized);
    if (g.seed != null) seedRows.push(g.file + ',' + g.seed);
    if (g.theme === 'classique') countClassique++;
    else if (g.theme === 'repos') countRepos++;
    else if (g.theme === 'obscures') countObscures++;
  }
  console.log('Gel v1 mergé :', gelPrompts.length, 'prompts (', gelIds.size, 'cartes)');
}

// --- Fix gorgon: négatif jellyfish obligatoire (spec §1.3), plafonné à 20 tags ---
for (const p of out) {
  if (p.bg) continue;
  if (p.species === 'gorgon' && !/jellyfish/i.test(p.negative)) {
    const tags = p.negative.split(',').map(s => s.trim()).filter(Boolean);
    // Priorité : garder anti-cadre, anti-sang, puis ajouter jellyfish, tronquer à 20
    const priority = tags.filter(t => /card frame|blood|gore|open wounds|watermark|signature|logo|jellyfish/i.test(t));
    const rest = tags.filter(t => !priority.includes(t));
    const newTags = [...new Set([...priority, 'jellyfish', 'cnidarian', 'no human body', ...rest])].slice(0, 20);
    p.negative = newTags.join(', ');
  }
}

writeFileSync(ROOT + 'tools/prompts-v34.json', JSON.stringify(out, null, 1));
writeFileSync(ROOT + 'tools/seeds-v34.csv', seedRows.join('\n') + '\n');

// --- Auto-vérification ---
const BEAST_SET = new Set(speciesMap.beastSpecies);
let loraCount = 0;
for (const p of out) {
  if (p.bg) continue;
  if (!p.species || !speciesMap.speciesTags[p.species]) errors.push(p.id + '-' + p.theme + ': espèce manquante');
  if (!/blood splatter, gore, open wounds, blood stains/.test(p.negative)) errors.push(p.id + '-' + p.theme + ': R13 absent');
  if (p.negative.split(',').length > 20) errors.push(p.id + '-' + p.theme + ': négatif > 20 tags');
  // R12 check only on theme-specific additions (base v3.3 already validated, "revealing clothing" inherited is not R12)
  if (p.theme !== 'classique' && /fully clothed|modest attire|modest fantasy|covered torso|bare torso|bandage wrap/i.test(p.positive)) errors.push(p.id + '-' + p.theme + ': R12 présent dans l\'ajout thème');
  if (p.theme === 'repos' && p.seed !== undefined) {
    const baseP = out.find(q => q.id === p.id && q.theme === 'classique');
    if (baseP && p.seed !== baseP.seed + 5000000) errors.push(p.id + '-r: seed != classique+5M');
  }
  if (p.theme === 'obscures' && p.seed !== undefined) {
    const baseP = out.find(q => q.id === p.id && q.theme === 'classique');
    if (baseP && p.seed !== baseP.seed + 10000000) errors.push(p.id + '-o: seed != classique+10M');
  }
  // Thème Crépuscule (B) interdit en tant que variante ; "twilight bridge" du biome pont est OK
  const twilightAsTheme = /twilight scene|at twilight,|dusk sky|nightfall|crépuscule violet|violet dusk/i;
  if (p.theme !== 'classique' && twilightAsTheme.test(p.positive)) errors.push(p.id + '-' + p.theme + ': thème Crépuscule détecté (hors périmètre)');
  if (/jellyfish/i.test(p.positive) && p.species !== 'gorgon') errors.push(p.id + ': jellyfish dans positif hors gorgon');
  if (p.species === 'gorgon' && !/jellyfish/i.test(p.negative)) errors.push(p.id + '-' + p.theme + ': négatif jellyfish obligatoire absent pour gorgon');
  if (p.lora) loraCount++;
}

console.log('=== RAPPORT BUILD v3.4 ===');
console.log('Classique :', countClassique, '| Repos :', countRepos, '| Obscures :', countObscures, '| Fonds :', countBg);
console.log('Total prompts :', out.length);
console.log('LoRAs branchés :', loraCount);
console.log('Erreurs :', errors.length);
for (const e of errors.slice(0, 30)) console.log('  -', e);

// Stats négatives
const negLens = out.filter(p => !p.bg).map(p => p.negative.split(',').length);
console.log('Longueurs négatives : min', Math.min(...negLens), 'max', Math.max(...negLens));

// Vérification "a beast" générique
let beastGeneric = 0;
for (const p of out) {
  if (p.bg) continue;
  if (/a beast, monstrous|a generic beast|just "a beast"/i.test(p.positive)) { beastGeneric++; errors.push(p.id + '-' + p.theme + ': "a beast" générique interdit'); }
}
console.log('Prompts "a beast" génériques :', beastGeneric);

// Canidés
let canid = 0;
for (const p of out) {
  if (/wolf|canine|canid|werewolf|dog-like/i.test(p.positive + ' ' + p.negative)) canid++;
}
console.log('Prompts avec mention canidé :', canid);

if (errors.length) {
  console.log('ÉCHEC :', errors.length, 'erreurs — prompts-v34.json NON généré proprement');
  process.exit(1);
} else {
  console.log('Auto-vérification : OK (0 erreur)');
}
