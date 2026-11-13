// build-prompts-gel-v1.mjs — paquet de génération ARTS du gel v1 (spec docs/design/spec-gel-v1.md §5,
// spec docs/images/spec-arts-v34-gel-v18.md §1, arbitrage suite 36 « on va tout lancer d'un coup »).
// 54 cartes (49 nouvelles du gel + 5 re-arts canon v3.4) x 3 versions (Classique + Repos -r + Obscures -o).
// Conventions v3.3 reprises à l'identique (build-prompts-v33.mjs) : anti-cadre 12 tags, R13 anti-sang seul
// (PAS de R12), négatif <= 20 tags, cadrage par rareté (UR/L/M = full body), FACE_POS sur les humanoïdes,
// LoRA uniquement les 3 existants (ici : Leviatan sur hydra/merSovereign), style v3, AUCUN Fx.
// Les cartes ne sont PAS encore dans le data (les lots A-F les posent) : la table ci-dessous est le
// FIGEMENT de la spec (ids gel v1) ; le builder v34 fusionnera ces prompts par id quand le data existera.
// Sorties : tools/prompts-gel-v1.json (162) + tools/seeds-v3.csv (49 graines ajoutées) +
//           tools/seeds-gel-v1.csv + tools/gender-map-gel-v1.csv.
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));

const speciesMap = read('tools/species-map.json');
const SPECIES_TAGS = speciesMap.speciesTags;
const NAMED_MAP = speciesMap.named;
const BEAST_SET = new Set(speciesMap.beastSpecies);

// --- grammaire v3.3 (identique) -------------------------------------------
const STYLE_V3 = 'Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, intricate background, epic fantasy splash artwork, rim lighting';
const CLASS_NL = {
  Guerrier: 'a warrior in armor', Mage: 'a mage in flowing robes casting a spell', Prêtre: 'a priest in holy vestments',
  Assassin: 'an assassin with dual blades', Occultiste: 'an occultist in dark robes',
};
const ELEMENT_NL = {
  Eau: 'turquoise water magic glowing around them', Feu: 'ember fire magic glowing around them',
  Nature: 'verdant nature magic with drifting golden spores', Ombre: 'dark shadow wisps',
  Lumière: 'golden holy light', Neutre: '',
};
// Obscures (test-themes-exception.md §1-C) : l'élément s'échange, l'espèce et la pose NON (proposition spec §5.5)
const INVERSION_NL = {
  Lumière: 'corrupted dark shadow veiling the light, black flame wisps',
  Ombre: 'a golden purification light piercing the dark',
  Feu: 'spectral ice crystal magic, frozen blue glow',
  Eau: 'ember fire magic glowing around them',
  Nature: 'pale spectral frost magic, withered leaves swirling',
  Neutre: 'an inverted spectral aura, colors reversed',
};
const PALETTES_GEL = {
  enfer: 'a dark obsidian and crimson infernal setting with smoldering rifts and drifting embers',
  zenithDechu: 'an eclipse-dark celestial setting with a black sun, fading golden light and cold stars',
  zenith: 'a warm gold and ivory celestial setting with radiant light',
  ecueils: 'a wet sea-cave lair setting with tidal pools, barnacled rocks and pale green water light',
  aube: 'a radiant dawn bastion setting with warm gold and ivory light',
  rempart: 'a stone rampart bastion at dusk with banners and warm torchlight',
  bosquet: 'a moss green and gold enchanted forest setting with golden spores and giant mushrooms',
  marees: 'a deep blue and turquoise undersea setting with sea foam and coral accents',
  seuil: 'a warm gold and ivory celestial gate setting with radiant light',
};
const TIER_NL = {
  C: 'calm pose, simple background, no energy effects', UC: 'calm pose, simple background, no energy effects',
  R: 'confident pose, discreet background, faint elemental wisps',
  SR: 'dynamic pose, moderate magic effects, detailed background',
  UR: 'dynamic action pose, strong magic effects, detailed background',
  L: 'dynamic action pose, powerful aura, signature effect, intricate background',
  M: 'epic scale, full power aura, dramatic lighting, intricate background',
};
const REPOS_TIER = 'calm resting pose, gentle daily activity, serene expression, no magic, no combat';
const AGE_NL = {
  C: 'a teenager, 14-17 years old', UC: 'a young adult, 18-22 years old', R: 'an adult, 23-30 years old',
  SR: 'a seasoned adult, 30-38 years old', UR: 'a mature battle-hardened adult, 40-50 years old',
  L: 'a legendary veteran, over 50, with an aura of experience', M: 'an ageless mythical figure',
};
const NAMED_AGE_NL = {
  'adulte': 'an adult', 'adulte aguerri': 'a grizzled veteran warrior with a mature face',
  'jeune (graine)': 'a young child, 10-14 years old',
  'éternel': 'an ageless divine presence', 'éternelle': 'an ageless divine presence',
  'mûre, majestueuse': 'a mature majestic woman',
};
const GENDER_NL = { '1girl': 'an adult woman', '1boy': 'an adult man' };
const FRAMING_NL = (r) => (['UR', 'L', 'M'].includes(r)
  ? { pos: 'full body, standing, centered', neg: 'close-up, portrait', label: 'full body' }
  : { pos: 'half body framing, waist up, centered, full chest visible', neg: 'head and shoulders, bust, close-up, portrait', label: 'demi-corps' });
const ANTI_NEG = 'card frame, card border, ornate border, picture frame, panel border, vignette border, text, letters, numbers, watermark, signature, logo';
const BLOOD_NEG = 'blood splatter, gore, open wounds, blood stains';
const BEAST_NEG = 'humans, humanoid, human face, human posture, 1girl, 1boy';
const FACE_POS = 'front lighting, face clearly visible, no hood, uncovered face, detailed eyes';
const LORA_GEL = {
  hydra:        { file: 'Leviatan.safetensors', trigger: 'leviathan a sea monster', weight: 0.7 },
  merSovereign: { file: 'Leviatan.safetensors', trigger: 'leviathan a sea monster', weight: 0.7 },
};

// --- le FIGEMENT : les 54 cartes (spec-gel-v1 §1 ; ids FIGÉS, les arts les attendent) ---
// seeds : nouvelles = suite de seeds-v3.csv (2150037+) ; re-arts = seed v3.3 conservé (spec §5.2).
const NEW_SEED_BASE = 2150037;
const CARDS = [
  // §1.1 camp démon — la chair (école le Vice)
  { id: 'd19', name: 'Démon du Désir', rarity: 'UC', universe: 'enfer', classe: 'Assassin', element: 'Ombre', species: 'demonDesire', gender: '1boy' },
  { id: 'd20', name: 'Succube', rarity: 'R', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'succubus', gender: '1girl' },
  { id: 'd21', name: 'Grande Succube', rarity: 'SR', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'succubusGreater', gender: '1girl' },
  { id: 'd22', name: 'Dame du Désir', rarity: 'UR', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'ladyOfDesire', gender: '1girl' },
  { id: 'd23', name: 'Asmodia, Reine du Désir', rarity: 'L', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'asmodia', gender: '1girl', named: true, age: 'mûre, majestueuse', ipa: 'd22', note: 'L de la chair — ref d22 (Dame du Désir)' },
  { id: 'd29', name: 'Gouffre des Vices', rarity: 'R', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'viceMaw' },
  { id: 'd30', name: 'Grand Gouffre', rarity: 'SR', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'viceMawGreater' },
  { id: 'd31', name: 'Gueule de l\'Abîme', rarity: 'UR', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'abyssMaw' },
  { id: 'd32', name: 'Famine', rarity: 'L', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'famine', named: true, beast: true, note: 'L bestiale de la trappe (suite 26/33) — PAS de figure humanoïde, nouvelle identité' },
  // §1.1 camp démon — la puissance (école la Fureur)
  { id: 'd24', name: 'Démon des Fosses', rarity: 'UC', universe: 'enfer', classe: 'Guerrier', element: 'Ombre', species: 'demonPit', gender: '1boy' },
  { id: 'd25', name: 'Démon Majeur', rarity: 'R', universe: 'enfer', classe: 'Guerrier', element: 'Ombre', species: 'demonGreater', gender: '1boy' },
  { id: 'd26', name: 'Seigneur Démon', rarity: 'SR', universe: 'enfer', classe: 'Guerrier', element: 'Ombre', species: 'demonLord', gender: '1boy' },
  { id: 'd27', name: 'Prince Démon', rarity: 'UR', universe: 'enfer', classe: 'Guerrier', element: 'Ombre', species: 'demonPrince', gender: '1boy' },
  { id: 'd28', name: 'Belzébuth, Roi des Démons', rarity: 'L', universe: 'enfer', classe: 'Guerrier', element: 'Ombre', species: 'belzebuth', gender: '1boy', named: true, age: 'éternel', ipa: 'd27', note: 'L de la puissance, roi seul au sommet (suite 31/33) — ref d27 (Prince Démon)' },
  { id: 'd33', name: 'Fléau Démoniaque', rarity: 'R', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'plagueDemon', gender: '1boy' },
  { id: 'd34', name: 'Grand Fléau', rarity: 'SR', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'plagueDemonGreater', gender: '1boy' },
  { id: 'd35', name: 'Porte-Peste', rarity: 'UR', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'plagueBearer', gender: '1boy' },
  { id: 'd36', name: 'Peste, Mère des Fléaux', rarity: 'L', universe: 'enfer', classe: 'Occultiste', element: 'Ombre', species: 'peste', gender: '1girl', named: true, age: 'éternelle', note: 'L de la trappe du Fléau — nouvelle identité (d35 Porte-Peste ≠ Peste)' },
  // §1.2 anges dévoyés (école l'Orgueil)
  { id: 'd37', name: 'Ange Ardent', rarity: 'R', universe: 'zenithDechu', classe: 'Guerrier', element: 'Feu', species: 'fallenAngelArdent', gender: '1boy' },
  { id: 'd38', name: 'Ange du Zénith', rarity: 'SR', universe: 'zenithDechu', classe: 'Guerrier', element: 'Lumière', species: 'fallenAngelZenith', gender: '1boy' },
  { id: 'd39', name: 'Astre Vaillant', rarity: 'UR', universe: 'zenithDechu', classe: 'Guerrier', element: 'Lumière', species: 'fallenStar', gender: '1boy' },
  { id: 'd40', name: 'Astre Rayonnant', rarity: 'L', universe: 'zenithDechu', classe: 'Prêtre', element: 'Lumière', species: 'darkSun', gender: '1boy', named: true, age: 'éternel', ipa: 'd39', note: 'L des dévoyés, signature Lumière Noire — ref d39 (Astre Vaillant)' },
  // §1.3 chaîne céleste (nouvelles + re-arts)
  { id: 'p7', name: 'Ange de Lumière', rarity: 'SR', universe: 'seuil', classe: 'Guerrier', element: 'Lumière', species: 'angelLight', gender: '1boy' },
  { id: 'p8', name: 'Archange', rarity: 'UR', universe: 'seuil', classe: 'Guerrier', element: 'Lumière', species: 'archangel', gender: '1boy' },
  { id: 'p1', name: 'Jeune Séraphin', rarity: 'UC', universe: 'seuil', classe: 'Prêtre', element: 'Lumière', species: 'seraphYoung', gender: '1boy', named: true, age: 'jeune (graine)', seed: 2128024, note: 're-art v3.4 : canon ange enfant D&D' },
  { id: 'p5', name: 'Séraphin, Porteur de Lumière', rarity: 'R', universe: 'seuil', classe: 'Guerrier', element: 'Lumière', species: 'seraphBearer', gender: '1boy', named: true, age: 'éternel', seed: 2150014, note: 're-palieré UR → R ; re-art v3.4' },
  { id: 'p6', name: 'Séraphin, Archange Ultime', rarity: 'L', universe: 'seuil', classe: 'Prêtre', element: 'Lumière', species: 'seraphUltimate', gender: '1boy', named: true, age: 'éternel', seed: 2150015, note: 'RENOMMÉE suite 33 (ex Chérubin Éveillé) ; re-art v3.4, canon séraphin/solar six ailes' },
  // §1.4 paladin (aube) et chevalier (rempart)
  { id: 'a50', name: 'Paladin', rarity: 'R', universe: 'aube', classe: 'Guerrier', element: 'Lumière', species: 'human', gender: '1boy' },
  { id: 'a51', name: 'Paladin Sacré', rarity: 'SR', universe: 'aube', classe: 'Guerrier', element: 'Lumière', species: 'human', gender: '1boy' },
  { id: 'a52', name: 'Paladine Sacrée', rarity: 'UR', universe: 'aube', classe: 'Guerrier', element: 'Lumière', species: 'human', gender: '1girl' },
  { id: 'a53', name: 'Isaure, Égide de l\'Aube', rarity: 'L', universe: 'aube', classe: 'Guerrier', element: 'Lumière', species: 'human', gender: '1girl', named: true, age: 'adulte aguerri', ipa: 'a52', extra: 'radiant white-gold paladin armor, a dawn aegis shield, a solar tabard', note: 'L du paladin — ref a52 (Paladine Sacrée)' },
  { id: 's15', name: 'Chevalier', rarity: 'R', universe: 'rempart', classe: 'Guerrier', element: 'Neutre', species: 'human', gender: '1boy' },
  { id: 's16', name: 'Chevalière du Rempart', rarity: 'SR', universe: 'rempart', classe: 'Guerrier', element: 'Neutre', species: 'human', gender: '1girl' },
  { id: 's17', name: 'Gardienne du Rempart', rarity: 'UR', universe: 'rempart', classe: 'Guerrier', element: 'Neutre', species: 'human', gender: '1girl' },
  { id: 's18', name: 'Kiri l\'Invincible', rarity: 'L', universe: 'rempart', classe: 'Guerrier', element: 'Neutre', species: 'human', gender: '1girl', named: true, age: 'adulte aguerri', ipa: 's17', extra: 'long straight black hair, a full black plate armor, a sheathed sword at rest, unhelmeted', note: 'L du chevalier (NOMMÉE suite 24) — ref s17 ; art alternatif « robe blanche immaculée » = sa version Exception' },
  // §1.5 gorgones (les Écueils, depuis w21) et fées (le Bosquet, depuis w20)
  { id: 'k33', name: 'Serpent des Récifs', rarity: 'UC', universe: 'ecueils', classe: 'Assassin', element: 'Neutre', species: 'gorgon', gender: '1girl' },
  { id: 'k34', name: 'Fileuse du Regard', rarity: 'R', universe: 'ecueils', classe: 'Assassin', element: 'Neutre', species: 'gorgon', gender: '1girl' },
  { id: 'k35', name: 'Pétrifiante des Écueils', rarity: 'SR', universe: 'ecueils', classe: 'Assassin', element: 'Neutre', species: 'gorgon', gender: '1girl' },
  { id: 'k36', name: 'Gorgonne Immaculée', rarity: 'UR', universe: 'ecueils', classe: 'Assassin', element: 'Neutre', species: 'gorgon', gender: '1girl' },
  { id: 'k37', name: 'Méduse, Reine des Écueils', rarity: 'L', universe: 'ecueils', classe: 'Assassin', element: 'Neutre', species: 'gorgon', gender: '1girl', named: true, age: 'mûre, majestueuse', ipa: 'k36', note: 'L du regard — ref k36 (Gorgonne Immaculée)' },
  { id: 'k38', name: 'Mère des Serpents', rarity: 'SR', universe: 'ecueils', classe: 'Occultiste', element: 'Neutre', species: 'gorgonSerpen', gender: '1girl' },
  { id: 'k39', name: 'Grande Serpentine', rarity: 'UR', universe: 'ecueils', classe: 'Occultiste', element: 'Neutre', species: 'gorgonSerpen', gender: '1girl' },
  { id: 'k40', name: 'Euryale, Nourrice des Serpents', rarity: 'L', universe: 'ecueils', classe: 'Occultiste', element: 'Neutre', species: 'gorgonSerpen', gender: '1girl', named: true, age: 'mûre, majestueuse', ipa: 'k39', note: 'L des serpents, canon Theros — ref k39 (Grande Serpentine)' },
  { id: 'g33', name: 'Fée des Groves', rarity: 'R', universe: 'bosquet', classe: 'Occultiste', element: 'Nature', species: 'faerie', gender: '1girl' },
  { id: 'g34', name: 'Fée des Jeux', rarity: 'SR', universe: 'bosquet', classe: 'Occultiste', element: 'Nature', species: 'faerie', gender: '1girl' },
  { id: 'g35', name: 'Souveraine des Jeux', rarity: 'UR', universe: 'bosquet', classe: 'Occultiste', element: 'Nature', species: 'faerieQueen', gender: '1girl' },
  { id: 'g36', name: 'Mab, Souveraine des Jeux', rarity: 'L', universe: 'bosquet', classe: 'Occultiste', element: 'Nature', species: 'faerieQueen', gender: '1girl', named: true, age: 'mûre, majestueuse', ipa: 'g35', note: 'L des jeux — ref g35 (Souveraine des Jeux)' },
  { id: 'g37', name: 'Fée des Ronces', rarity: 'SR', universe: 'bosquet', classe: 'Occultiste', element: 'Nature', species: 'faerie', gender: '1girl' },
  { id: 'g38', name: 'Reine des Ronces', rarity: 'UR', universe: 'bosquet', classe: 'Occultiste', element: 'Nature', species: 'thornQueen', gender: '1girl' },
  { id: 'g39', name: 'Aubépine, Reine des Ronces', rarity: 'L', universe: 'bosquet', classe: 'Occultiste', element: 'Nature', species: 'thornQueen', gender: '1girl', named: true, age: 'mûre, majestueuse', ipa: 'g38', note: 'L des ronces — ref g38 (Reine des Ronces)' },
  // §1.6 lignée des boss des Marées (Abîmaux, avec le fix boss non aléatoire, lot I)
  { id: 'e31', name: 'Hydre des Marées', rarity: 'L', universe: 'marees', classe: 'Assassin', element: 'Eau', species: 'hydra' },
  { id: 'e32', name: 'Souverain des Marées', rarity: 'L', universe: 'marees', classe: 'Guerrier', element: 'Eau', species: 'merSovereign' },
  // §1.7 re-arts canon v3.4 (seeds v3.3 conservés)
  { id: 'n14', name: 'Diablotin', rarity: 'C', universe: 'enfer', classe: 'Assassin', element: 'Ombre', species: 'imp', gender: '1boy', named: true, seed: 2127013, note: 'RENOMMÉ (suite 30) ; ex beastDark : un diable humanoïde, PAS une bête' },
  { id: 'z8', name: 'Astre Capiteux', rarity: 'M', universe: 'zenith', classe: 'Prêtre', element: 'Lumière', species: 'solarDeity', gender: '1boy', named: true, age: 'éternel', seed: 2126024, note: 're-race divine camp ange (suite 31) ; re-art v3.4 : + large radiant feathered wings (canon D&D solar)' },
];

// seeds des nouvelles : suite de seeds-v3.csv, ordre du figement (spec §5.2)
let nextSeed = NEW_SEED_BASE;
for (const c of CARDS) if (c.seed == null) c.seed = nextSeed++;
if (nextSeed - 1 !== 2150085) throw new Error('ÉCHEC seeds : dernière graine ' + (nextSeed - 1) + ' != 2150085 attendu (49 nouvelles)');

// --- assemblage --------------------------------------------------------------
function isBeast(c) { return c.beast === true || BEAST_SET.has(c.species); }

function buildPositive(c, theme) {
  const beast = isBeast(c);
  const parts = [];
  if (!c.named && !beast) { parts.push('(aged up:1.0-2.0)'); parts.push(GENDER_NL[c.gender]); parts.push(c.gender + (c.gender === '1girl' ? ', female' : ', male')); }
  else if (!beast && c.gender) parts.push(GENDER_NL[c.gender]);
  let speciesDesc = SPECIES_TAGS[c.species].join(', ');
  const lora = LORA_GEL[c.species] || null;
  if (lora) speciesDesc += ', ' + lora.trigger;
  parts.push((/^an? /.test(speciesDesc) ? '' : 'a ') + speciesDesc);
  if (c.extra) parts.push(c.extra);
  if (!beast && CLASS_NL[c.classe]) parts.push(CLASS_NL[c.classe]);
  if (beast) parts.push('a wild non-humanoid creature, no human traits, no human face, no human posture');
  if (!beast) {
    if (c.named) parts.push(NAMED_AGE_NL[c.age] || 'an adult');
    else if (c.species === 'human') parts.push(AGE_NL[c.rarity]);
  }
  if (c.species === 'human') parts.push('with fair skin');
  if (theme === 'repos') parts.push('in ' + PALETTES_GEL[c.universe] + ', peaceful slice-of-life moment');
  else parts.push('in ' + PALETTES_GEL[c.universe]);
  if (theme === 'repos') parts.push(REPOS_TIER);
  else {
    if (theme === 'obscures') { if (INVERSION_NL[c.element]) parts.push('with ' + INVERSION_NL[c.element]); }
    else if (ELEMENT_NL[c.element]) parts.push('with ' + ELEMENT_NL[c.element]);
    parts.push(TIER_NL[c.rarity] || TIER_NL.C);
  }
  const framing = FRAMING_NL(c.rarity);
  parts.push(framing.pos + ', looking at the viewer');
  if (!beast) parts.push(FACE_POS);
  parts.push(STYLE_V3);
  parts.push('full bleed artwork, edge to edge illustration');
  return parts.join(', ');
}

function buildNegative(c) {
  const beast = isBeast(c);
  const targeted = [BLOOD_NEG];
  if (c.species === 'gorgon' || c.species === 'gorgonSerpen') targeted.push('jellyfish, jellyfish tentacles');
  if (c.species === 'faerie' || c.species === 'faerieQueen' || c.species === 'thornQueen') targeted.push('giant, colossal');
  if (beast) targeted.push(BEAST_NEG);
  const framing = FRAMING_NL(c.rarity);
  const negParts = [ANTI_NEG, ...targeted, framing.neg, 'bad quality, worst quality, sketch'];
  return [...new Set(negParts.join(', ').split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 20).join(', ');
}

function entry(c, theme) {
  const suffix = theme === 'repos' ? '-r' : theme === 'obscures' ? '-o' : '';
  const seed = c.seed + (theme === 'repos' ? 5000000 : theme === 'obscures' ? 10000000 : 0);
  const ipa = theme === 'repos' || theme === 'obscures'
    ? (c.named ? c.id : null)   // thèmes : identité depuis le classique de la même carte (nommées uniquement)
    : (c.ipa || null);          // classique : la L hérite de son UR (spec §5.4)
  return {
    id: c.id + suffix, file: c.id + suffix + '.jpg', name: c.name, rarity: c.rarity,
    universe: c.universe, named: !!c.named, theme: theme === 'repos' ? 'repos' : theme === 'obscures' ? 'obscures' : 'classique',
    species: c.species, gender: (!isBeast(c) && c.gender) || null,
    age: c.named ? (c.age || null) : (c.species === 'human' ? 'auto:' + c.rarity : null),
    character_dna: c.named ? { gender: c.gender, species: c.species, age: c.age || null, note: c.note || null, ipa: c.ipa || null, beast: isBeast(c) || undefined } : null,
    framing: FRAMING_NL(c.rarity).label, seed,
    lora: LORA_GEL[c.species] || null, ipa,
    positive: buildPositive(c, theme), negative: buildNegative(c),
    reference: !!c.ipa || (theme !== 'classique' && !!c.named),
  };
}

// ordre du fichier : classiques par chaîne (l'UR AVANT sa L), puis repos, puis obscures (spec §5.4)
const out = [];
for (const c of CARDS) out.push(entry(c, 'classique'));
for (const c of CARDS) out.push(entry(c, 'repos'));
for (const c of CARDS) out.push(entry(c, 'obscures'));
writeFileSync(ROOT + 'tools/prompts-gel-v1.json', JSON.stringify(out, null, 1));

// seeds-v3.csv : ajout des 49 graines classiques (convention : suite 2150037+, jamais de bloc inventé)
{
  const lines = readFileSync(ROOT + 'tools/seeds-v3.csv', 'utf8').split('\n').filter(Boolean);
  const have = new Map(lines.map((l) => [l.split(',')[0], Number(l.split(',')[1])]));
  const rows = [];
  for (const c of CARDS) {
    if (c.seed < NEW_SEED_BASE) continue; // re-arts : déjà consignés (seed v3.3 conservé)
    const key = c.id + '.jpg';
    if (have.has(key)) {
      if (have.get(key) !== c.seed) throw new Error('ÉCHEC : ' + key + ' consigné avec seed ' + have.get(key) + ' != ' + c.seed);
      continue; // déjà consigné par un passage précédent du builder : idempotent
    }
    rows.push(key + ',' + c.seed);
  }
  if (rows.length) writeFileSync(ROOT + 'tools/seeds-v3.csv', lines.concat(rows).join('\n') + '\n');
}
// registres du paquet
{
  const rows = ['file,seed'];
  for (const p of out) rows.push(p.file + ',' + p.seed);
  writeFileSync(ROOT + 'tools/seeds-gel-v1.csv', rows.join('\n') + '\n');
}
{
  const rows = ['file,gender'];
  for (const p of out) if (p.gender) rows.push(p.file + ',' + p.gender);
  writeFileSync(ROOT + 'tools/gender-map-gel-v1.csv', rows.join('\n') + '\n');
}

// --- auto-vérification (v3.3 reprise + règles du gel) -------------------------
const errors = [];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// 'demon' = grammaire MTG obligatoire (comme 'leviathan' trigger e13) ; 'serpent/serpentine' = anatomie gorgone
const ALLOW = new Set(['mage', 'forge', 'spores', 'ember', 'legion', 'ange', 'lame', 'foi', 'or', 'mer', 'roi', 'eau', 'feu', 'miroir', 'pont', 'seuil', 'leviathan', 'demon', 'serpent', 'serpentine', 'la', 'des', 'du', 'de']);
const LORA_FILES_OK = new Set(['Leviatan.safetensors', 'Golems.safetensors', 'Forest-Guardians-000014.safetensors']);
const seen = new Set();
for (const p of out) {
  if (seen.has(p.id)) errors.push(p.id + ': id dupliqué');
  seen.add(p.id);
  if (/\bcard\b|trading card/i.test(p.positive)) errors.push(p.id + ': mot "card" dans le positif');
  const posN = norm(p.positive);
  for (const w of norm(p.name).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !ALLOW.has(w))) {
    if (new RegExp('\\b' + w + '\\b').test(posN)) errors.push(p.id + ': fragment du nom "' + w + '" dans le positif');
  }
  const negTags = p.negative.split(',').map((s) => s.trim()).filter(Boolean);
  if (negTags.length > 20) errors.push(p.id + ': négatif ' + negTags.length + ' tags > 20');
  if (!/blood splatter, gore, open wounds, blood stains/.test(p.negative)) errors.push(p.id + ': R13 anti-sang absent');
  if (p.lora) {
    if (!LORA_FILES_OK.has(p.lora.file)) errors.push(p.id + ': LoRA hors des 3 autorisés');
    if (!p.positive.includes(p.lora.trigger)) errors.push(p.id + ': trigger LoRA absent du positif');
    if (p.lora.weight >= 1.0) errors.push(p.id + ': poids LoRA >= 1.0');
  }
  const beast = isBeast({ species: p.species, beast: p.character_dna && p.character_dna.beast });
  if (beast) {
    if (/warrior|mage|priest|knight| in robes|assassin|occultist/.test(p.positive.toLowerCase())) errors.push(p.id + ': terme de rôle humain sur une bête (R8)');
    if (!/humans, humanoid/.test(p.negative)) errors.push(p.id + ': négatif bête incomplet (R8)');
    if (/\b(woman|man)\b/.test(p.positive)) errors.push(p.id + ': figure humaine sur une bête');
  }
  const full = ['UR', 'L', 'M'].includes(p.rarity);
  if (full && p.framing !== 'full body') errors.push(p.id + ': rareté ' + p.rarity + ' sans full body');
  if (!full && p.framing !== 'demi-corps') errors.push(p.id + ': rareté ' + p.rarity + ' sans demi-corps');
  if (!p.named && !beast && !p.gender) errors.push(p.id + ': genre non assigné (R10)');
  if (p.seed == null) errors.push(p.id + ': seed manquant');
  if (p.theme === 'repos' && !/no magic, no combat/.test(p.positive)) errors.push(p.id + ': thème Repos sans "no magic, no combat"');
  if (p.theme === 'obscures' && p.theme === 'repos') errors.push(p.id + ': thème incohérent');
  if (p.ipa && p.theme === 'classique' && !CARDS.find((c) => c.id === p.ipa)) errors.push(p.id + ': référence IPAdapter inconnue ' + p.ipa);
  if ((p.theme === 'repos' || p.theme === 'obscures') && p.ipa && p.ipa !== p.id.slice(0, -2)) {
    if (p.named) errors.push(p.id + ': thème IPAdapter != classique de la même carte');
  }
  if (p.character_dna && !p.character_dna.note) errors.push(p.id + ': nommée sans note character_dna');
}
// seeds : nouvelles = 2150037..2150085 dans l'ordre du figement ; thèmes = ±5M/10M exactement
const newCards = CARDS.filter((c) => c.seed >= NEW_SEED_BASE);
if (newCards.length !== 49) errors.push('nouvelles : ' + newCards.length + ' != 49');
for (const c of newCards) {
  const cl = out.find((p) => p.id === c.id);
  if (cl.seed !== c.seed) errors.push(c.id + ': seed classique ' + cl.seed);
  const r = out.find((p) => p.id === c.id + '-r');
  if (r.seed !== c.seed + 5000000) errors.push(c.id + '-r: seed ' + r.seed);
  const o = out.find((p) => p.id === c.id + '-o');
  if (o.seed !== c.seed + 10000000) errors.push(c.id + '-o: seed ' + o.seed);
}
for (const c of CARDS.filter((x) => x.seed < NEW_SEED_BASE)) {
  const cl = out.find((p) => p.id === c.id);
  if (cl.seed !== c.seed) errors.push(c.id + ': seed re-art non conservé (' + cl.seed + ' != ' + c.seed + ')');
}
const nClassique = out.filter((p) => p.theme === 'classique').length;
const nRepos = out.filter((p) => p.theme === 'repos').length;
const nObscures = out.filter((p) => p.theme === 'obscures').length;
const beasts = out.filter((p) => isBeast({ species: p.species, beast: p.character_dna && p.character_dna.beast })).map((p) => p.id);
const negLens = out.map((p) => p.negative.split(',').length);
console.log('prompts gel v1 :', out.length, '(' + nClassique + ' classiques + ' + nRepos + ' repos + ' + nObscures + ' obscures, 54 cartes)');
console.log('nouvelles graines : 2150037-2150085 (49), re-arts seed conservé : n14, p1, p5, p6, z8');
console.log('bêtes (R8) :', beasts.filter((x) => !x.includes('-')).join(', '));
console.log('longueurs négatives : min', Math.min(...negLens), 'max', Math.max(...negLens));
console.log('auto-vérification :', errors.length === 0 ? 'OK (0 erreur)' : errors.length + ' ERREUR(S)');
for (const e of errors.slice(0, 40)) console.log('  -', e);
if (errors.length) process.exit(1);
console.log('--- exemple d28 (Belzébuth, nommé, L) ---\n', out.find((p) => p.id === 'd28').positive, '\n NEG:', out.find((p) => p.id === 'd28').negative);
console.log('--- exemple d32-r (Famine Repos, bête) ---\n', out.find((p) => p.id === 'd32-r').positive);
console.log('--- exemple k33-o (gorgone Obscures) ---\n', out.find((p) => p.id === 'k33-o').positive);
