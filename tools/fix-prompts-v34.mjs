// fix-prompts-v34.mjs — corrige prompts-v34.json avec les reclassifications espèces + R11 bosquet + dryade MTG
import { readFileSync, writeFileSync } from 'node:fs';
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const s = JSON.parse(readFileSync(ROOT + 'tools/species-map.json', 'utf8'));
const prompts = JSON.parse(readFileSync(ROOT + 'tools/prompts-v34.json', 'utf8'));

const ANTI = 'card frame, card border, ornate border, picture frame, panel border, vignette border, text, letters, numbers, watermark, signature, logo';
const BLOOD = 'blood splatter, gore, open wounds, blood stains';
const BEAST_NEG = 'humans, humanoid, human face, human posture, 1girl, 1boy';

// Cartes à reconstruire complètement avec la bonne espèce
const RECLASS = ['k1','k2','k3','k5','k6','k8','k9','k10','k11','k12','k13','k15','k16','k18','k20','k21','g13'];
const R11_CARDS = ['g1','g2','g3','g4','g5','g14','g15'];
const DRYADS = prompts.filter(p => p.species === 'dryad' && !p.bg).map(p => p.id);

function buildPositive(card, speciesKey, extraDesc) {
  const tags = s.speciesTags[speciesKey];
  if (!tags) throw new Error('species manquante: ' + speciesKey);
  const named = s.named[card.id];
  const isBeast = (s.beastSpecies || []).includes(speciesKey) || (named && named.beast);
  const parts = [];
  // Espèce
  let desc = tags.join(', ');
  if (extraDesc) desc = extraDesc; // R11 concrete override
  parts.push('a ' + desc);
  if (isBeast) parts.push('a wild non-humanoid creature, no human traits, no human face, no human posture');
  // Genre pour humanoïdes non-bêtes
  if (!isBeast && named && named.gender) {
    parts.push(named.gender === '1girl' ? 'a woman, female' : 'a man, male');
  }
  // Classe
  const CLASS = { Guerrier: 'a warrior in armor', Mage: 'a mage in flowing robes', Prêtre: 'a priest in holy vestments', Assassin: 'an assassin with dual blades', Occultiste: 'an occultist in dark robes' };
  if (!isBeast && card.classe && CLASS[card.classe]) parts.push(CLASS[card.classe]);
  // Élément
  const ELEM = { Eau: 'turquoise water magic glowing around them', Feu: 'ember fire magic glowing around them', Ombre: 'dark shadow wisps', Lumière: 'golden holy light', Nature: 'green nature magic with leaves', Terre: 'earth magic with stones' };
  if (ELEM[card.element]) parts.push('with ' + ELEM[card.element]);
  // Biome
  const PAL = { bosquet: 'a moss green and gold enchanted forest with golden spores and giant mushrooms', crypte: 'a grey green flooded crypt with candlelight and cold mist', marees: 'a deep blue and turquoise undersea setting with sea foam and coral' };
  const uni = (card.dungeon || card.biome || 'bosquet').toLowerCase();
  parts.push('in ' + (PAL[uni] || PAL.bosquet));
  // Rareté
  const TIER = { C: 'calm pose, simple background', UC: 'calm pose, simple background', R: 'confident pose, discreet background, faint elemental wisps', SR: 'dynamic pose, moderate magic effects', UR: 'dynamic action pose, strong magic effects', L: 'dynamic action pose, powerful aura, signature effect, intricate background', M: 'epic scale, full power aura, dramatic lighting' };
  parts.push(TIER[card.rarity] || TIER.C);
  // Cadrage
  const full = ['UR','L','M'].includes(card.rarity);
  parts.push(full ? 'full body, standing, centered, looking at the viewer' : 'half body framing, waist up, centered, looking at the viewer');
  if (!isBeast) parts.push('front lighting, face clearly visible, no hood, detailed eyes');
  parts.push('Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, epic fantasy splash artwork, rim lighting, full bleed artwork, edge to edge illustration');
  return parts.join(', ');
}

function buildNegative(speciesKey, isBeast, framing) {
  const parts = [ANTI, BLOOD];
  if (isBeast) parts.push(BEAST_NEG);
  if (s.antiTags[speciesKey]) parts.push(s.antiTags[speciesKey].join(', '));
  if (speciesKey === 'dryad') parts.push('antlers, deer antlers, animal horns');
  if (speciesKey === 'gorgon') parts.push('jellyfish, cnidarian, no human body');
  if (framing === 'full') parts.push('close-up, portrait, half body');
  else parts.push('head and shoulders, bust, close-up, portrait');
  parts.push('bad quality, worst quality, sketch');
  return [...new Set(parts.join(', ').split(',').map(x => x.trim()).filter(Boolean))].slice(0, 20).join(', ');
}

const cards = JSON.parse(readFileSync(ROOT + 'data/cards.json', 'utf8'));
const monsters = JSON.parse(readFileSync(ROOT + 'data/monsters.json', 'utf8'));
const cardById = {};
for (const c of [...cards, ...monsters]) cardById[c.id] = c;

let fixed = 0;
for (let i = 0; i < prompts.length; i++) {
  const p = prompts[i];
  if (p.bg) continue;
  const card = cardById[p.id];
  if (!card) continue;

  // 1. Reclassifications espèces
  if (RECLASS.includes(p.id) && s.named[p.id]) {
    const speciesKey = s.named[p.id].species;
    if (p.species !== speciesKey) {
      const isBeast = (s.beastSpecies || []).includes(speciesKey) || s.named[p.id].beast;
      const framing = ['UR','L','M'].includes(p.rarity) ? 'full' : 'demi';
      p.species = speciesKey;
      p.positive = buildPositive(card, speciesKey, null);
      p.negative = buildNegative(speciesKey, isBeast, framing);
      // Retirer le LoRA Leviathan des monstres crypte non-marins
      if (p.lora && p.lora.file === 'Leviatan.safetensors' && speciesKey !== 'seaBehemoth' && speciesKey !== 'seaSerpent' && speciesKey !== 'beastWater') {
        p.lora = null;
      }
      fixed++;
    }
  }

  // 2. R11 concret pour les bêtes du bosquet
  if (R11_CARDS.includes(p.id) && s.R11_BY_CARD[p.id]) {
    const r11 = s.R11_BY_CARD[p.id];
    // Remplacer la description beastWood générique par le R11 concret
    p.positive = p.positive.replace(/a a massive hulking forest beast[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,/, 'a ' + r11 + ',');
    p.positive = p.positive.replace(/a a massive hulking forest beast of bark and thorns, moss-covered hide, branch antlers, clawed paws, fangs, no human traits,/, 'a ' + r11 + ', no human traits,');
    p.species = p.id === 'g13' ? 'treant' : 'beastWood';
    fixed++;
  }

  // 3. Dryades : retirer antlers du positif, ajouter au négatif
  if (p.species === 'dryad') {
    p.positive = p.positive.replace(/, wooden antlers/g, '').replace(/wooden antlers, /g, '').replace(/, bark skin accents, wooden antlers/, ', bark skin accents');
    p.positive = p.positive.replace(/a dryad, leaf hair, bark skin accents/, 'a dryad in the style of Magic: The Gathering, leaf hair, bark-like skin, living vines for hair');
    if (!/antlers/i.test(p.negative)) p.negative = p.negative + ', antlers, deer antlers, animal horns';
    // Dryades = toujours féminines
    if (/an adult man, 1boy, male/.test(p.positive)) {
      p.positive = p.positive.replace(/\(aged up:1\.0-2\.0\), an adult man, 1boy, male/, '(aged up:1.0-2.0), an adult woman, 1girl, female');
      p.gender = '1girl';
    }
    fixed++;
  }
}

writeFileSync(ROOT + 'tools/prompts-v34.json', JSON.stringify(prompts, null, 1));
console.log('prompts-v34.json fixed:', fixed, 'prompts corrigés');

// Vérification
const byId = {};
for (const p of prompts) { if (!p.bg) { byId[p.id] = byId[p.id] || {}; byId[p.id][p.theme] = p; } }
for (const id of ['k2','k13','k16','g3','g21','g13']) {
  const c = byId[id]?.classique;
  if (c) console.log(id, '->', c.species, '|', c.positive.slice(0, 120));
}
