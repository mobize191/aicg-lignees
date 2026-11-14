// Pretres monstres recrutables via le chemin canonique byId (signature + commun + Boule de Feu).
import { bootDist } from '../stub.mjs';
const file = process.argv[2] ?? 'dist.html';
const N = Number(process.argv[3] ?? '3000');
const api = bootDist(file).api;
console.log('BOOT OK');
const LVL = api.stretchLevel(12);
const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];
const GARDE = 150;
function run(label, id) {
  let wins = 0, marathons = 0, exceptions = 0, toursTot = 0, dec = 0;
  for (let n = 0; n < N; n++) {
    const dg = DGS[n % 5]; const diff = 1 + (n % 3);
    try {
      const floors = api.dungeonById(dg).floors;
      const wave = api.makeWave(n + 1, 1 + (n % floors), dg, diff);
      const mk = () => ({ ...api.byId(id), level: LVL });
      const state = api.initCombat({ avant: [mk(), mk()], arriere: [mk()] }, wave, n + 1, {}, { difficulty: diff });
      let tours = 0;
      while (!state.winner && tours < GARDE) { api.resolveTurn(state); tours++; }
      if (state.winner === 'team') { wins++; toursTot += tours; }
      else if (state.winner === 'enemies') { toursTot += tours; dec++; }
      else marathons++;
    } catch (e) { exceptions++; }
  }
  console.log(`${label} : ${(100 * wins / N).toFixed(1)} % | marathons ${marathons} | exc ${exceptions} | tours ${(toursTot / Math.max(1, wins + dec)).toFixed(1)}`);
}
run('MONSTRE R Pretre 3x e8 Matriarche des Recifs (byId)', 'e8');
run('MONSTRE R Pretre 3x d9 Prisme du Choeur (byId)', 'd9');
run('MONSTRE R Occultiste 3x e25 Voix du Large (byId, controle)', 'e25');
