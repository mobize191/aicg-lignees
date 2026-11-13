// Étude de polyvalence (retour terrain n°19, Marc-Olivier, 13/11) :
// « je suis sûr qu'une équipe full dégâts va beaucoup plus loin qu'une équipe
//  avec du soin et du support et peu de dégâts » — mesure sur le moteur réel.
// Trois archétypes au même palier (R, niveau 12), protocole v3 du harnais
// (mêmes seeds, mêmes donjons/étages/difficultés que combat-digest.mjs).
// Usage : node tools/etude-polyvalence.mjs dist.html 3000
import { bootDist } from '../stub.mjs';

const file = process.argv[2] ?? 'dist.html';
const N = Number(process.argv[3] ?? '3000');

const boot = bootDist(file);
const api = boot.api;
if (!api) { console.error('BOOT KO : __api absent'); process.exit(1); }
console.log('BOOT OK');

// a6 Épéiste Errant (R, Guerrier, atk 12) ; a7 Faucheur des Ombres (R, Assassin, atk 15) ;
// a20 Mage de la Fournaise (R, Mage, atk 14) ; s5 Prêtresse de l'Aube (R, Prêtre, atk 3, soigne) ;
// s6 Sentinelle d'Acier (R, Guerrier tank, atk 4, hp 62).
const TEAMS = [
  { name: 'full-degats', avant: [['a6', 12], ['a7', 12]], arriere: [['a20', 12]] },
  { name: 'mixte', avant: [['a6', 12], ['a20', 12]], arriere: [['s5', 12]] },
  { name: 'soin-support', avant: [['a6', 12], ['s5', 12]], arriere: [['s6', 12]] },
];
const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];
const GARDE = 150;

const results = [];
for (const team of TEAMS) {
  let wins = 0, losses = 0, marathons = 0, exceptions = 0, toursTot = 0;
  for (let n = 0; n < N; n++) {
    const dg = DGS[n % 5];
    try {
      const floors = api.dungeonById(dg).floors;
      const stage = 1 + (n % floors);
      const diff = 1 + (n % 3);
      const seed = n + 1;
      const wave = api.makeWave(seed, stage, dg, diff);
      const teamCards = {
        avant: team.avant.map(([id, lvl]) => ({ ...api.byId(id), level: lvl })),
        arriere: team.arriere.map(([id, lvl]) => ({ ...api.byId(id), level: lvl })),
      };
      const state = api.initCombat(teamCards, wave, seed, {}, { difficulty: diff });
      let tours = 0;
      while (!state.winner && tours < GARDE) { api.resolveTurn(state); tours++; }
      if (state.winner === 'team') { wins++; toursTot += tours; }
      else if (state.winner === 'enemies') { losses++; toursTot += tours; }
      else marathons++;
    } catch (e) { exceptions++; }
  }
  results.push({
    team: team.name, wins, losses, marathons, exceptions,
    rate: (100 * wins / N).toFixed(1),
    avgTours: (wins + losses > 0 ? (toursTot / (wins + losses)).toFixed(1) : '-'),
  });
}
for (const r of results) {
  console.log(`${r.team} : victoires ${r.wins}/${N} (${r.rate} %) | marathons ${r.marathons} | exceptions ${r.exceptions} | tours moyens ${r.avgTours}`);
}
