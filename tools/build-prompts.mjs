// build-prompts.mjs — assemble les prompts DreamShaper XL (LANGAGE NATUREL) de chaque carte
// depuis cards.json. Sortie : prompts-draft.json
// [{id, file, name, rarity, universe, named, positive, negative, review}]
// Les prompts sont des BROUILLONS à relire (gate de relecture du plan) ; le dictionnaire
// couvre les mots-clés courants, les cartes non reconnues tombent sur un fallback générique.
import { readFileSync, writeFileSync } from 'node:fs';

const cards = JSON.parse(readFileSync('cards.json', 'utf8'));

// Style global (DreamShaper XL : phrases naturelles, pas de listes de tags)
const STYLE = 'Painted in a painterly, semi-realistic fantasy card game illustration style, detailed shading, intricate background, epic fantasy trading card game artwork, rim lighting.';
const NEG = 'low quality, worst quality, blurry, bad anatomy, bad hands, missing fingers, extra digits, extra arms, text, letters, numbers, watermark, signature, username, error, jpeg artifacts, cropped, multiple views, monochrome, greyscale, low contrast, flat cel shading, anime screencap';

const PALETTES = {
  marees: 'in a deep blue and turquoise palette with sea foam swirls and coral accents',
  forge: 'in an ember orange and soot black palette with glowing red metal and floating embers',
  bosquet: 'in a moss green palette with golden spores and giant mushrooms',
  crypte: 'in a grey green palette with candlelight and cold mist',
  zenith: 'in a warm gold and ivory palette with radiant light',
  divin: 'in an ivory and gold palette with hourglasses, mirrors and golden threads',
};

const ELEMENT_TAGS = {
  Eau: 'water magic and turquoise glow',
  Feu: 'fire magic and ember glow',
  Terre: 'earth magic and mossy vines',
  Ombre: 'shadow magic and dark wisps',
  Lumière: 'holy light and golden glow',
  Neutre: '',
};

const CLASSES = {
  Guerrier: 'warrior in armor',
  Mage: 'mage in sorcerer robes',
  Prêtre: 'priest in holy vestments',
  Assassin: 'hooded assassin',
  Occultiste: 'occultist in dark robes',
};

// dictionnaire FR -> anglais (mots-clés des noms de cartes)
const DICO = [
  ['gobelin', 'goblin'], ['crabe', 'giant crab'], ['calamar', 'squid'], ['kalamar', 'squid'],
  ['requin', 'shark'], ['sirène', 'mermaid siren'], ['méduse', 'jellyfish'], ['huître', 'oyster'],
  ['baleine', 'whale'], ['dauphin', 'dolphin'], ['poisson', 'fish'], ['écume', 'sea foam'],
  ['leviathan', 'colossal leviathan sea serpent'], ['titan', 'colossal titan'],
  ['braise', 'fire elemental'], ['fournaise', 'furnace'], ['suie', 'soot'], ['lave', 'lava'],
  ['magma', 'magma'], ['cendre', 'ash'], ['golem', 'golem'], ['colosse', 'colossal giant'],
  ['forge', 'forge'], ['métal', 'metal'], ['fer', 'iron'],
  ['sanglier', 'giant boar'], ['mousse', 'moss'], ['arbre', 'tree guardian'], ['chêne', 'oak tree'],
  ['champignon', 'mushroom'], ['spore', 'spores'], ['dryade', 'dryad'], ['liane', 'vines'],
  ['fée', 'fairy'], ['loup', 'wolf'], ['cerf', 'stag'], ['pierre', 'stone'], ['sève', 'sap'],
  ['mort', 'death reaper'], ['faucheuse', 'death reaper'], ['squelette', 'skeleton warrior'],
  ['crâne', 'skull'], ['os', 'bone'], ['fantôme', 'ghost'], ['spectre', 'specter'],
  ['goule', 'ghoul'], ['liche', 'lich'], ['zombie', 'zombie'], ['rat', 'giant rat'],
  ['chauve', 'bat'], ['araignée', 'giant spider'], ['scarabée', 'scarab beetle'],
  ['ver', 'worm'], ['vermine', 'vermin'], ['nocturne', 'nocturnal creature'],
  ['linceul', 'shroud'], ['caveau', 'crypt'], ['tombe', 'tomb'], ['naufragé', 'drowned sailor'],
  ['drapeau', 'banner'], ['étendard', 'standard'],
  ['astre', 'celestial lord'], ['soleil', 'sun'], ['aube', 'dawn'], ['aurore', 'aurora'],
  ['chapelle', 'chapel'], ['chapelain', 'chaplain'], ['croisé', 'crusader'], ['clef', 'golden key'],
  ['clave', 'key'], ['phénix', 'phoenix'], ['aigle', 'eagle'], ['lion', 'lion'],
  ['ange', 'angel'], ['démon', 'demon'], ['miroir', 'mirror'], ['sablier', 'hourglass'],
  ['pont', 'bridge'], ['seuil', 'threshold'], ['arbitre', 'arbiter'], ['choriste', 'choir singer'],
  ['épée', 'sword'], ['lame', 'sword'], ['sabre', 'saber'], ['hache', 'axe'], ['lance', 'spear'],
  ['trident', 'trident'], ['arc', 'bow'], ['arbalète', 'crossbow'], ['dague', 'dagger'],
  ['bouclier', 'shield'], ['bannière', 'banner'], ['chevalier', 'knight'],
  ['archer', 'archer'], ['arbalétrier', 'crossbowman'], ['rémora', 'remora'],
  ['vestale', 'vestal'], ['prêtresse', 'priestess'], ['prophétesse', 'prophetess'],
  ['roi', 'king'], ['reine', 'queen'], ['empereur', 'emperor'], ['impératrice', 'empress'],
  ['prince', 'prince'], ['princesse', 'princess'], ['seigneur', 'lord'], ['dame', 'lady'],
  ['veilleur', 'watchman'], ['guetteur', 'watcher'], ['garde', 'guard'], ['sentinelle', 'sentinel'],
  ['pisteur', 'tracker'], ['braconnier', 'poacher'], ['jongleur', 'juggler'],
  ['fossoyeur', 'gravedigger'], ['veuve', 'widow'], ['orphelin', 'orphan'],
  ['meute', 'pack'], ['essaim', 'swarm'], ['cour', 'court'], ['adepte', 'adept'],
  ['servante', 'servant'], ['bergère', 'shepherdess'], ['berger', 'shepherd'],
  ['jardinier', 'gardener'], ['mineur', 'miner'], ['forgeron', 'blacksmith'],
  ['semeur', 'sower'], ['écorcheur', 'skinner'], ['pillard', 'marauder'],
  ['cracheur', 'spitter'], ['mangeur', 'devourer'], ['briseur', 'breaker'],
  ['avatar', 'avatar'], ['novice', 'novice'],
  ['bestiau', 'beastfolk'], ['enge', 'spirit child'], ['éveillé', 'awakened one'],
  ['épéiste', 'swordsman'], ['bretteur', 'swordsman'], ['spadassin', 'swordsman'],
  ['mage', 'mage'], ['prêtre', 'priest'], ['voleur', 'thief'],
  ['assassin', 'assassin'], ['occultiste', 'occultist'], ['guerrier', 'warrior'],
];

// intensité par palier (règle « tier bas = calme » de la fiche de conventions)
const TIER = {
  C: 'Calm pose, plain simple background, no energy effects',
  UC: 'Calm pose, plain simple background, no energy effects',
  R: 'Calm confident pose, discreet background, faint elemental wisps',
  SR: 'Dynamic pose, moderate magic effects, detailed background',
  UR: 'Dynamic action pose, strong magic effects, detailed background',
  L: 'Dynamic action pose, powerful aura, signature effect, intricate background',
  M: 'Epic scale, full power aura, dramatic lighting, intricate background',
};

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function subjectTags(card) {
  const n = norm(card.name);
  const tags = [];
  for (const [fr, en] of DICO) if (n.includes(norm(fr))) tags.push(en);
  if (card.classe && CLASSES[card.classe]) tags.push(CLASSES[card.classe]);
  if (card.role === 'support') tags.push('support caster');
  if (/(sirène|dame|reine|veuve|bergère|servante|prêtresse|prophétesse|vestale)/i.test(card.name)) tags.push('a young woman');
  if (tags.length === 0) tags.push('fantasy creature');
  return [...new Set(tags)].slice(0, 5);
}

const out = [];
for (const c of cards) {
  if (c.archived) continue;
  const named = c.name.includes(',');
  const pal = PALETTES[c.dungeon] || '';
  const el = ELEMENT_TAGS[c.element] || '';
  const tier = TIER[c.rarity] || TIER.C;
  const subject = subjectTags(c).join(', ');
  const framing = (c.rarity === 'C' || c.rarity === 'UC')
    ? 'Portrait framing, head and shoulders, centered'
    : 'Full body, centered';
  const sentences = [`A ${subject}${pal ? ', ' + pal : ''}${el ? ', with ' + el : ''}. ${tier}. ${framing}.`, STYLE];
  const negative = NEG + (['zenith', 'divin'].includes(c.dungeon) || c.element === 'Lumière' ? ', dark, gritty' : '');
  out.push({
    id: c.id, file: c.id + '.jpg', name: c.name, rarity: c.rarity,
    universe: c.dungeon || (c.raciale ? 'naissance' : 'famille'), named,
    positive: sentences.join(' '), negative,
    review: !named && subjectTags(c).includes('fantasy creature'),
  });
}

writeFileSync('prompts-draft.json', JSON.stringify(out, null, 1));
console.log('prompts :', out.length);
console.log('à relire (fallback générique) :', out.filter((p) => p.review).length);
console.log('nommées (référence à verrouiller) :', out.filter((p) => p.named).length);
console.log('--- exemple monstre C ---');
console.log(out.find((p) => p.id === 'e3').positive);
console.log('--- exemple L nommée ---');
console.log(out.find((p) => p.id === 'a17').positive);
