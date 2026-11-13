// Étude multi-paliers (Marc-Olivier, 13/11) : la hiérarchie de classes mesurée au
// palier R se corrige-t-elle aux paliers UC/SR/UR ? Même protocole v3 du harnais
// que tools/etude-polyvalence.mjs (mêmes seeds n+1, 5 donjons, étages 1-10,
// difficultés 1-3, garde 150 tours).
// Équipe : 3× la meilleure carte JOUEUR de la classe au palier P (critère cardPower
// niveau 12, catalogue joueur uniquement : data/cards.json, les monstres recrutables
// sont exclus), 2 avant + 1 arrière, niveau 12.
// Sortie : taux global + décomposition par difficulté + marathons + exceptions par ligne.
// Usage : node tools/etude-paliers.mjs dist.html 3000 UC,R,SR,UR
import { bootDist } from '../stub.mjs';
import { readFileSync } from 'fs';

const file = process.argv[2] ?? 'dist.html';
const N = Number(process.argv[3] ?? '3000');
const PALIERS = (process.argv[4] ?? 'UC').split(',');

const boot = bootDist(file);
const api = boot.api;
if (!api) { console.error('BOOT KO : __api absent'); process.exit(1); }
console.log('BOOT OK');

const playerIds = new Set(JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8')).map(c => c.id));
const classes = ['Guerrier', 'Assassin', 'Mage', 'Prêtre', 'Occultiste'];
const LVL = 12;
const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];
const GARDE = 150;

function bestCard(cl, palier) {
  const pool = api.DATA.cards.filter(c => playerIds.has(c.id) && c.classe === cl && c.rarity === palier);
  if (!pool.length) return null;
  return pool.reduce((a, b) => (api.cardPower(b, LVL) > api.cardPower(a, LVL) ? b : a));
}

for (const palier of PALIERS) {
  for (const cl of classes) {
    const card = bestCard(cl, palier);
    if (!card) { console.log(`${palier} ${cl} : aucune carte joueur`); continue; }
    let wins = 0, losses = 0, marathons = 0, exceptions = 0, toursTot = 0;
    const winsDiff = [0, 0, 0], nDiff = [0, 0, 0];
    for (let n = 0; n < N; n++) {
      const dg = DGS[n % 5];
      const diff = 1 + (n % 3);
      nDiff[diff - 1]++;
      try {
        const floors = api.dungeonById(dg).floors;
        const stage = 1 + (n % floors);
        const seed = n + 1;
        const wave = api.makeWave(seed, stage, dg, diff);
        const mk = () => ({ ...card, level: LVL });
        const teamCards = { avant: [mk(), mk()], arriere: [mk()] };
        const state = api.initCombat(teamCards, wave, seed, {}, { difficulty: diff });
        let tours = 0;
        while (!state.winner && tours < GARDE) { api.resolveTurn(state); tours++; }
        if (state.winner === 'team') { wins++; winsDiff[diff - 1]++; toursTot += tours; }
        else if (state.winner === 'enemies') { losses++; toursTot += tours; }
        else marathons++;
      } catch (e) { exceptions++; }
    }
    const rate = (100 * wins / N).toFixed(1);
    const d1 = (100 * winsDiff[0] / nDiff[0]).toFixed(1);
    const d2 = (100 * winsDiff[1] / nDiff[1]).toFixed(1);
    const d3 = (100 * winsDiff[2] / nDiff[2]).toFixed(1);
    const avgTours = wins + losses > 0 ? (toursTot / (wins + losses)).toFixed(1) : '-';
    console.log(`${palier} ${cl} (${card.id} ${card.name}) : ${rate} % | d1 ${d1} | d2 ${d2} | d3 ${d3} | marathons ${marathons} | exc ${exceptions} | tours ${avgTours}`);
  }
}
