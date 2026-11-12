// build-prompts-eq3.mjs — série 3, vague 2 : 90 arts d'équipement (5 sets x 6 pièces x 3 paliers).
// Gabarit spec-arts-serie3.md : objet SEUL (pas de porteur/main/silhouette), composition constante
// entre paliers, escalade sobre -> runique -> auréolé, signature visuelle par set, palette par donjon.
// Seeds 2140000+. Sortie : tools/prompts-eq-serie3.json + append seeds-v3.csv.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (p) => JSON.parse(readFileSync(ROOT + p, 'utf8'));

const eq = read('data/equipment.json');
const sets = eq.sets;
const pieces = eq.pieces.filter((p) => p.source === 'set');

const STYLE_V3 = 'Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, epic fantasy splash artwork, rim lighting';
const ANTI_NEG = 'card frame, card border, ornate border, picture frame, panel border, vignette border, text, letters, numbers, watermark, signature, logo';
const OBJ_NEG = 'humans, humanoid, hands, character, 1girl, 1boy, person, wielder, wearer, silhouette';

// signature visuelle + palette par set/donjon (constantes sur les 6 pièces du set)
const SET_SIGNATURE = {
  'set-marees': { sig: 'pearl inlays, mother-of-pearl sheen, small coral branch motif, turquoise accents', palette: 'deep blue, turquoise and pearl white' },
  'set-forge': { sig: 'dark steel with ember-orange rivets, small flame glyph, soot-blackened metal', palette: 'soot black, ember orange and forged steel grey' },
  'set-bosquet': { sig: 'living wood with moss inlays, tiny golden spore dots, leaf motif', palette: 'moss green, gold and bark brown' },
  'set-crypte': { sig: 'aged bone-white material with grey-green verdigris veins, small shroud-knot motif', palette: 'grey green, bone white and candle gold' },
  'set-zenith': { sig: 'gilded ivory metal with radiant sun-ray motif, warm gold inlays', palette: 'ivory, warm gold and sky blue' },
};
// nom court de la pièce pour le prompt (sans le nom du set, la signature visuelle le porte)
const PIECE_DESC = {
  arme: { Guerrier: 'a broadsword', Mage: 'an ornate wooden staff', Prêtre: 'a holy scepter', Assassin: 'a pair of daggers', Occultiste: 'a dark focus orb on a short chain' },
  armure: { '': 'a ceremonial robe' },
};
const TIER_DESC = {
  C: 'plain sober version, simple well-crafted materials, no glow',
  R: 'enchanted version with discreet glowing runes and a faint magical aura',
  SR: 'royal version, precious materials, bright aura, strong magical effect radiating',
};

const out = [];
let i = 0;
let errors = [];
for (const [setId, set] of Object.entries(sets)) {
  const sig = SET_SIGNATURE[setId];
  const setPieces = pieces.filter((p) => p.set === setId);
  // 6 pièces : 5 armes (une par classe) + 1 armure — groupées par (slot, classe)
  const groups = {};
  for (const p of setPieces) {
    const key = p.slot + '|' + (p.classe || '');
    (groups[key] = groups[key] || {})[p.rarity] = p;
  }
  for (const [key, paliers] of Object.entries(groups)) {
    const [slot, classe] = key.split('|');
    const pieceWord = ((PIECE_DESC[slot] || {})[classe] || 'a piece of equipment').replace(/^an? /, '');
    for (const rarity of ['C', 'R', 'SR']) {
      const p = paliers[rarity];
      if (!p) { errors.push(setId + ' ' + key + ' sans palier ' + rarity); continue; }
      const tier = TIER_DESC[rarity];
      const positive = [
        `A single ${pieceWord}, ${tier}, ${sig.sig} as its set signature,`,
        `materials and details: ${pieceWord === 'a ceremonial robe' ? 'flowing embroidered fabric, clasp, hem pattern' : 'blade or head, guard or shaft, craftsmanship details'},`,
        `presented alone, centered on a plain neutral surface, soft ambient light, detailed shading,`,
        `color palette: ${sig.palette}, colorful accents.`,
        STYLE_V3 + ',',
        'full bleed artwork, edge to edge illustration',
      ].join(' ');
      const negative = [...new Set((ANTI_NEG + ', ' + OBJ_NEG + ', bad quality, worst quality, sketch, multiple objects, duplicates')
        .split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 20).join(', ');
      out.push({
        id: p.id, file: p.id + '.jpg', name: p.nom, set: setId, slot, classe: classe || null,
        palier: rarity, seed: 2140000 + i, ipaFrom: rarity === 'C' ? null : paliers.C.id,
        positive, negative,
      });
      i++;
    }
  }
}

writeFileSync(ROOT + 'tools/prompts-eq-serie3.json', JSON.stringify(out, null, 1));
appendFileSync(ROOT + 'tools/seeds-v3.csv', out.map((p) => p.file + ',' + p.seed).join('\n') + '\n');
console.log('équipement série 3 :', out.length, 'objets (5 sets x 6 pièces x 3 paliers attendu = 90)');
console.log('auto-vérification :', errors.length === 0 ? 'OK (0 erreur)' : errors.join(' | '));
console.log('exemple C :', out[0].positive.slice(0, 200));
console.log('exemple SR :', out[2].positive.slice(0, 200));
