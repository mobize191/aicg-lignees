// build-prompts.mjs — v2 (charte graphique v2, arbitrages 10/11/2026)
// Génère tools/prompts-v2.json en TAGS DANBOORU depuis data/cards.json + data/monsters.json
// + tools/species-map.json. ÉCHOUE EXPLICITEMENT (id de carte) pour toute carte sans entrée
// d'espèce : l'espèce vient des data, jamais du nom.
// Sorties : tools/prompts-v2.json, tools/seeds-v2.csv (ouvert avec les seeds témoins 1126001→1126006).
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));

const speciesMap = read('tools/species-map.json');
const cards = read('data/cards.json');
const monsters = read('data/monsters.json');
const monsterFamilies = read('data/monster-families.json');

const cardById = {};
for (const c of [...cards, ...monsters]) cardById[c.id] = c;

// ---------------------------------------------------------------------------
// Résolution d'espèce : named > family > dungeon-family > biome. Jamais le nom.
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
for (const [dungeon, fams] of Object.entries(monsterFamilies)) {
  for (const fam of fams) {
    for (const id of [...fam.lines.flat(), ...(fam.side || []), fam.mythic || ''].filter(Boolean)) {
      monsterFamilyOf[id] = `${dungeon}|${fam.name}`;
    }
  }
}

// espèces bestiales : pas de tag de genre, antiTags.beast au négatif
const BEASTLIKE = new Set(['beast', 'beastWater', 'beastFire', 'beastWood', 'beastDark', 'seaSerpent', 'seaBehemoth', 'treant', 'magmaGolem']);
const SPECIES_ANTI = { fireLord: 'fireLord', phoenixFirebird: 'phoenixFirebird' }; // antiTags.beast pour BEASTLIKE, antiTags.<espèce> pour SPECIES_ANTI

function resolveSpecies(card) {
  const id = card.id;
  if (speciesMap.named[id]) return { species: speciesMap.named[id].species, source: 'named' };
  if (card.family && speciesMap.families[card.family]) return { species: speciesMap.families[card.family].species, source: `families.${card.family}` };
  if (monsterFamilyOf[id]) {
    const key = monsterFamilyOf[id];
    if (DUNGEON_FAMILY_SPECIES[key]) return { species: DUNGEON_FAMILY_SPECIES[key], source: `dungeonFamily.${key}` };
  }
  if (card.biome === 'recrues' || !card.biome) return { species: 'human', source: card.biome ? 'biome.recrues' : 'naissance' };
  if (card.biome === 'divin') {
    if (/démon/i.test(card.name)) return { species: 'beastDark', source: 'biome.divin.démon' };
    return { species: 'human', source: 'biome.divin', extraTags: /ange|séraphin|éveillé/i.test(card.name) ? 'angel, halo, wings' : '' };
  }
  throw new Error(`ÉCHEC MAPPING ESPÈCE : carte "${id}" (${card.name}) sans entrée species-map.json — l'espèce vient des data, jamais du nom. Ajouter l'entrée dans tools/species-map.json.`);
}

// ---------------------------------------------------------------------------
const PALETTES = {
  marees: 'deep blue and turquoise palette, sea foam, coral accents, warm rim light', // accent §14.2
  forge: 'ember orange and soot black palette, glowing red metal, floating embers',
  bosquet: 'moss green and gold palette, golden spores, giant mushrooms',
  crypte: 'grey green palette, candlelight, cold mist',
  zenith: 'warm gold and ivory palette, radiant light',
  divin: 'ivory and gold palette, mirrors, golden threads',
  naissance: 'neutral adventurer palette',
  famille: 'neutral adventurer palette',
};
const ELEMENT_TAGS = {
  Eau: 'water magic, turquoise glow', Feu: 'fire magic, ember glow', Terre: 'earth magic, vines',
  Ombre: 'shadow magic, dark wisps', Lumière: 'holy light, golden glow', Neutre: '',
};
const CLASS_TAGS = {
  Guerrier: 'warrior, armor', Mage: 'mage, robes, casting spell', Prêtre: 'priest, holy vestments',
  Assassin: 'assassin, hood, dual blades', Occultiste: 'occultist, dark robes',
};
const TIER = {
  C: 'calm pose, simple background, no energy effects',
  UC: 'calm pose, simple background, no energy effects',
  R: 'confident pose, discreet background, faint elemental wisps',
  SR: 'dynamic pose, moderate magic effects, detailed background',
  UR: 'dynamic action pose, strong magic effects, detailed background',
  L: 'dynamic action pose, powerful aura, signature effect, intricate background',
  M: 'epic scale, full power aura, dramatic lighting, intricate background',
};
// maturité par rareté (arbitrage 10/11 soir) -> mécanisme natif v17 (aged up) en TÊTE de prompt,
// et non des tags d'âge libres (charte §15.6) ; échelle humanMaturityByRarity du species-map
const AGED_UP = { C: 1.0, UC: 1.0, R: 1.2, SR: 1.4, UR: 1.6, L: 1.8, M: 2.0 };
const NAMED_AGE_TAGS = {
  'adulte': 'adult', 'adulte aguerri': 'adult man, mature face, veteran warrior',
  'adulte défunt': 'adult, ghostly', 'adulte défunte': 'adult, ghostly',
  'jeune (graine)': 'young, child, small stature', 'ancien': 'ancient, elder',
  'ancien colosse': 'ancient, colossal', 'éternel': 'ageless, divine presence', 'éternelle': 'ageless, divine presence',
  'mûre, majestueuse': 'mature woman, majestic',
};
// NÉGATIF COURT canon v17 (charte §15.3 : un négatif trop long réduit la qualité et rend flou)
// + anti-texte/zéro-cadre (charte §1, non négociable) + anti-signature + anatomie minimale + nsfw (filtre rating baked §15.5)
const BASE_NEG = 'bad quality, worst quality, worst detail, sketch, censor, nsfw, text, letters, numbers, watermark, signature, artist name, artist signature, logo, frame, border, card frame, ornament, japanese text, chinese text, title, caption, close-up, portrait, face only, headshot, bad anatomy, bad hands, missing fingers, extra digits, extra arms, poorly drawn face, poorly drawn hands';
// Correctifs §14 intégrés au négatif standard (vague 2) : visage jamais noir/encapuchonné, jamais quasi-monochrome
const NEG_FACE = 'hooded, shadowed face, covered face, black face, obscured face, dark silhouette';
const NEG_COLOR = 'monochrome, greyscale, single color palette, monochromatic background';
// Tags qualité OBLIGATOIRES en FIN de prompt (canon v17 §15.2 — l'ordre compte)
const QUALITY_TAIL = 'masterpiece, best quality, amazing quality';
const BASE_POS = 'general, anime style, anime illustration, sharp lineart, clean lineart, vibrant colors, colorful, bright, soft ambient light, detailed background, rim lighting, sharp focus, solo, visible face, detailed eyes, face illuminated by soft glow, front lighting';
// Renforts ciblés par carte (charte §14.3 Kenji, §14.5 f13)
const NAMED_EXTRA = {
  a15: { pos: 'bareheaded, beard stubble', neg: 'helmet, full helmet' },
  a17: { pos: 'bareheaded, beard stubble', neg: 'helmet, full helmet' },
  f13: { pos: 'colossal, bulky, beast-like, no humanoid proportions', neg: 'hood, slim, humanoid' },
  // retry 2 vague 2 (défauts persistants au 1er retry, seed fixe) :
  z19: { pos: 'giant bird, fully avian body, no arms, wings spread, perched', neg: 'humanoid body, arms, dress, robe, clothing, extra character, summoner, second figure' },
  z22: { pos: 'giant bird, fully avian body, no arms, wings spread, perched', neg: 'humanoid body, arms, dress, robe, clothing, extra character, summoner, second figure' },
  a16: { pos: 'hood down, face fully visible, detailed eyes', neg: 'hood up, shadowed face, covered face' },
  d6: { pos: 'detailed eyes, visible expressive face, no mask', neg: 'faceless, blank face, featureless face, mask, glowing mask' },
  a13: { pos: 'multicolored, coral accents, pink accents, gold accents', neg: 'monochrome, single color palette' },
  f18: { pos: 'face fully visible, detailed eyes, bright face lighting', neg: 'shadowed face, dark face, obscured face' },
};

const FRAMING = (r) => (['UR', 'L', 'M'].includes(r) ? { pos: 'full body, standing, centered', neg: '', label: 'full body' } : { pos: 'upper body, cowboy shot, waist up', neg: ', full body', label: 'demi-corps' });

function buildCard(card) {
  const id = card.id;
  const named = speciesMap.named[id] || null;
  const { species, extraTags } = resolveSpecies(card); // lève une erreur explicite si absent
  // beast:true dans species-map.json (ex. phénix z19/z22) = jamais de tag de genre, antiTags de l'espèce obligatoires
  const beastlike = BEASTLIKE.has(species) || (named && named.beast === true);
  const rarity = card.rarity || 'C';
  const universe = card.dungeon || card.family || card.biome || 'naissance';
  const framing = FRAMING(rarity);

  const pos = [...BASE_POS.split(', ')];
  if (named && !beastlike && !SPECIES_ANTI[species]) pos.push(named.gender); // 1girl/1boy verrouillé (pas pour les ADN monstrueux)
  pos.push(...speciesMap.speciesTags[species]);
  if (extraTags) pos.push(extraTags);
  if (named) {
    const ageTag = NAMED_AGE_TAGS[named.age] || 'adult'; // champ age prioritaire pour les nommées
    pos.push(ageTag);
  } else if (species === 'human') {
    // génériques humaines : maturité par rareté via le mécanisme natif (aged up:N) en tête de prompt (charte §15.6)
    pos.unshift(`(aged up:${AGED_UP[rarity] || 1.0})`);
  }
  if (card.classe && CLASS_TAGS[card.classe] && !(NAMED_EXTRA[id] && /hood/.test(CLASS_TAGS[card.classe]))) pos.push(CLASS_TAGS[card.classe]); // f13 : pas de 'hood' en positif
  if (species === 'human') pos.push('fair skin, human skin tone'); // peau jamais dénaturée (retour vague 1, charte §14.3)
  if (ELEMENT_TAGS[card.element]) pos.push(ELEMENT_TAGS[card.element]);
  if (PALETTES[universe]) pos.push(PALETTES[universe]);
  pos.push(TIER[rarity] || TIER.C, framing.pos, 'looking at viewer');
  if (NAMED_EXTRA[id]) pos.push(NAMED_EXTRA[id].pos);
  pos.push(QUALITY_TAIL); // tags qualité en FIN de prompt (canon v17 §15.2)

  let neg = BASE_NEG + ', ' + NEG_FACE + ', ' + NEG_COLOR; // correctifs §14.1/§14.2 intégrés au standard
  if (universe !== 'crypte') neg += ', dark, muddy colors'; // sauf univers sombres voulus
  neg += framing.neg;
  if (beastlike) neg += ', ' + speciesMap.antiTags.beast.join(', ');
  if (species === 'human') neg += ', blue skin, colored skin, inhuman skin';
  if (SPECIES_ANTI[species]) neg += ', ' + speciesMap.antiTags[SPECIES_ANTI[species]].join(', ');
  if (NAMED_EXTRA[id]) neg += ', ' + NAMED_EXTRA[id].neg;
  if (named && /veteran warrior/.test(named.note || '')) neg += ', young, teen, boy'; // Kenji : adulte aguerri à tous les paliers
  if (named && /graine/.test(named.age || '')) neg += ', adult, mature, sexual, nude'; // graines 10-14 ans, jamais sexualisées

  return {
    id, file: id + '.jpg', name: card.name, rarity, universe, named: !!named,
    species, gender: named && !beastlike && !SPECIES_ANTI[species] ? named.gender : null,
    age: named ? named.age : (species === 'human' ? speciesMap.humanMaturityByRarity[rarity] : null),
    character_dna: named ? { gender: named.gender, species, age: named.age, note: named.note || null } : null,
    framing: framing.label, positive: pos.join(', '), negative: neg,
  };
}

// ---------------------------------------------------------------------------
// Construction : 53 références nommées + tous les génériques actifs + 6 fonds
const out = [];
const refs = [];
for (const id of Object.keys(speciesMap.named)) {
  const card = cardById[id];
  if (!card) throw new Error(`ÉCHEC : nommée "${id}" de species-map.json introuvable dans les data`);
  const p = buildCard(card);
  p.reference = true;
  p.seed = 2126000 + refs.length; // seeds v2 figés, consignés dans seeds-v2.csv
  refs.push({ id, seed: p.seed, name: card.name });
  out.push(p);
}
for (const c of [...cards, ...monsters]) {
  if (c.archived || speciesMap.named[c.id]) continue;
  if (out.some((p) => p.id === c.id)) continue;
  out.push(buildCard(c));
}

// fonds de donjons (style v2 réaligné, 1216x832, pas de personnage)
const BGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith', 'divin'];
const BG_SCENERY = {
  marees: 'underwater sunken temple ruins, shafts of filtered light, coral reef, drifting sea foam, ancient stone pillars, deep blue and turquoise palette, atmospheric, volumetric light, empty foreground',
  forge: 'volcanic forge interior, lava cracks in dark stone, glowing molten metal, floating embers, soot black and ember orange palette, atmospheric, empty foreground',
  bosquet: 'enchanted forest glade, giant glowing mushrooms, floating golden spores, light rays through canopy, moss green palette, atmospheric, empty foreground',
  crypte: 'flooded crypt interior, candle lit sarcophagi, stagnant green water, cold mist, tattered shrouds, grey green palette, atmospheric, empty foreground',
  zenith: 'celestial sky sanctuary, golden clouds, warm sunlight, ivory and gold palette, atmospheric, empty foreground',
  divin: 'ivory hall of mirrors and hourglasses, golden threads of fate, soft divine light, ivory and gold palette, atmospheric, empty foreground',
};
for (const bg of BGS) {
  out.push({
    id: 'bg-' + bg, file: 'bg-' + bg + '.jpg', name: 'Fond ' + bg, rarity: null, universe: bg,
    named: false, bg: true, species: null, gender: null, age: null, character_dna: null,
    framing: 'background', w: 1216, h: 832, seed: 2126100 + BGS.indexOf(bg),
    positive: BASE_POS + ', scenery, no humans, detailed background, ' + BG_SCENERY[bg] + ', ' + QUALITY_TAIL,
    negative: BASE_NEG + ', ' + NEG_COLOR + ', people, creatures, humans, character, 1girl, 1boy, close-up, portrait',
  });
}

writeFileSync(ROOT + 'tools/prompts-v2.json', JSON.stringify(out, null, 1));

// registre seeds v2 : ouvert avec les seeds témoins du test checkpoint 1126001→1126006
const WITNESS = [
  ['meliane.jpg', 1126001], ['seigneur-cendres.jpg', 1126002], ['leviathan.jpg', 1126003],
  ['kenji.jpg', 1126004], ['yuki.jpg', 1126005], ['bg-marees.jpg', 1126006],
];
const lines = ['file,seed,prompt,note'];
for (const [f, s] of WITNESS) lines.push(`${f},${s},,"témoin test checkpoint 2026-11 (WAI v17 retenu)"`);
for (const r of refs) lines.push(`${r.id}.jpg,${r.seed},,"référence v2 ${r.name}"`);
writeFileSync(ROOT + 'tools/seeds-v2.csv', lines.join('\n') + '\n');

console.log('prompts v2 :', out.length, '(dont', refs.length, 'références nommées +', BGS.length, 'fonds)');
console.log('seeds-v2.csv ouvert avec les 6 seeds témoins +', refs.length, 'seeds de références');
console.log('--- exemple Kenji a15 ---\n', out.find((p) => p.id === 'a15').positive, '\n NEG:', out.find((p) => p.id === 'a15').negative);
console.log('--- exemple f13 ---\n', out.find((p) => p.id === 'f13').positive, '\n NEG:', out.find((p) => p.id === 'f13').negative);
console.log('--- exemple b1 (graine) ---\n', out.find((p) => p.id === 'b1').positive, '\n NEG:', out.find((p) => p.id === 'b1').negative);
