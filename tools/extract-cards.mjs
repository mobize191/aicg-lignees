// extract-cards.mjs — extrait le catalogue complet du dist via le harnas
// Sortie : cards.json (238 cartes, champs : id, name, rarity, classe, role, element,
// dungeon, soloSpell, spells, mana, monster, raciale, archived...)
import { writeFileSync } from 'node:fs';
import { bootDist } from './stub.mjs';

const { api } = bootDist('dist.html');
const cards = api.CATALOG;
writeFileSync('cards.json', JSON.stringify(cards, null, 1));
console.log('cartes :', cards.length);
const byRar = {};
for (const c of cards) byRar[c.rarity] = (byRar[c.rarity] || 0) + 1;
console.log('par rareté :', JSON.stringify(byRar));
