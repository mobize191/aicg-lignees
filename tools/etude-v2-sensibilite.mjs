// Sensibilité Mage v2 : l'INT est-elle le levier attendu (B1) ? Protocole v3, N en arg.
import { bootDist } from '../stub.mjs';
const file = process.argv[2] ?? 'dist.html';
const N = Number(process.argv[3] ?? '3000');
const boot = bootDist(file);
const api = boot.api;
console.log('BOOT OK');
const LVL = api.stretchLevel(12);
const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];
const GARDE = 150;
function run(label, mutate) {
  let wins = 0, marathons = 0, exceptions = 0, toursTot = 0, dec = 0;
  const wD = [0, 0, 0], nD = [0, 0, 0];
  for (let n = 0; n < N; n++) {
    const dg = DGS[n % 5]; const diff = 1 + (n % 3); nD[diff - 1]++;
    try {
      const floors = api.dungeonById(dg).floors;
      const wave = api.makeWave(n + 1, 1 + (n % floors), dg, diff);
      const mk = () => { const c = { ...api.byId('a8'), level: LVL }; return mutate ? mutate(c) : c; };
      const state = api.initCombat({ avant: [mk(), mk()], arriere: [mk()] }, wave, n + 1, {}, { difficulty: diff });
      let tours = 0;
      while (!state.winner && tours < GARDE) { api.resolveTurn(state); tours++; }
      if (state.winner === 'team') { wins++; wD[diff - 1]++; toursTot += tours; }
      else if (state.winner === 'enemies') { toursTot += tours; dec++; }
      else marathons++;
    } catch (e) { exceptions++; }
  }
  const d = (i) => (100 * wD[i] / nD[i]).toFixed(1);
  console.log(`${label} : ${(100 * wins / N).toFixed(1)} % | d1 ${d(0)} | d2 ${d(1)} | d3 ${d(2)} | marathons ${marathons} | exc ${exceptions} | tours ${(toursTot / Math.max(1, wins + dec)).toFixed(1)}`);
}
run('MAGE R 3x a8 temoin (int 11, atk 14)');
run('MAGE R 3x a8 int 14 (+27 % INT)', (c) => { c.int = 14; return c; });
run('MAGE R 3x a8 int 17 (+55 % INT)', (c) => { c.int = 17; return c; });
run('MAGE R 3x a8 int 21 (parite atk 14->26 effective, int 21)', (c) => { c.int = 21; return c; });
run('MAGE R 3x a8 atk 18 (+29 % ATQ)', (c) => { c.atk = 18; return c; });
run('MAGE R 3x a8 int 24 (parite guerrier int ~ atk eff.)', (c) => { c.int = 24; return c; });
