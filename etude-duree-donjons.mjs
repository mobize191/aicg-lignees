// Distribution de durée des combats RÉELS (protocole du digest : équipes fixes × donjons × étages × difficultés).
// Base : combat-digest.mjs, sans digest, avec stats de tours. Usage : node etude-duree-donjons.mjs dist.html 2000
import { bootDist } from './stub.mjs';

const file = process.argv[2] ?? 'dist.html';
const N = Number(process.argv[3] ?? '2000');
const GARDE = 150;

const boot = bootDist(file);
const api = boot.api;
if (!api) { console.error('BOOT KO'); process.exit(1); }

const TEAMS = [
  { name: 'novices-niv5', avant: [['n1', 5], ['n2', 5]], arriere: [['n3', 5]] },
  { name: 'divines-niv12', avant: [['n14', 12], ['n15', 12]], arriere: [['n13', 12]] },
  { name: 'familiales-niv15', avant: [['a1', 15], ['g9', 15]], arriere: [['d2', 15]] },
  { name: 'mixte-niv8-20', avant: [['n9', 8], ['a30', 20], ['n4', 8]], arriere: [['n7', 8]] },
];
const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];

let wins = 0, marathons = 0, exceptions = 0;
const turns = [], byDg = {}, byDiff = {};
for (let n = 0; n < N; n++) {
  const team = TEAMS[n % 4];
  const dg = DGS[n % 5];
  let stage, diff, tours = 0;
  try {
    const floors = api.dungeonById(dg).floors;
    stage = 1 + (n % floors);
    diff = 1 + (n % 3);
    const wave = api.makeWave(n + 1, stage, dg, diff);
    const teamCards = {
      avant: team.avant.map(([id, lvl]) => ({ ...api.byId(id), level: lvl })),
      arriere: team.arriere.map(([id, lvl]) => ({ ...api.byId(id), level: lvl })),
    };
    const state = api.initCombat(teamCards, wave, n + 1, {}, { difficulty: diff });
    while (!state.winner && tours < GARDE) { api.resolveTurn(state); tours++; }
    if (state.winner === 'team') wins++;
    else if (!state.winner) marathons++;
  } catch (e) { exceptions++; tours = -1; }
  turns.push(tours);
  (byDg[dg] = byDg[dg] ?? []).push(tours);
  (byDiff[diff] = byDiff[diff] ?? []).push(tours);
}
const s = [...turns].sort((a, b) => a - b);
const q = (arr, p) => arr[Math.min(arr.length - 1, Math.floor(p * arr.length))];
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
console.log(`DONJONS N=${N} | moyenne ${avg(turns).toFixed(1)} tours | médiane ${q(s, 0.5)} | p75 ${q(s, 0.75)} | p90 ${q(s, 0.9)} | p95 ${q(s, 0.95)} | p99 ${q(s, 0.99)} | max ${s[s.length - 1]} | marathons ${marathons} | W ${wins} | exceptions ${exceptions}`);
for (const [k, v] of Object.entries(byDg)) { const t = [...v].sort((a, b) => a - b); console.log(`  ${k} : moy ${avg(v).toFixed(1)} | méd ${q(t, 0.5)} | p90 ${q(t, 0.9)} | p95 ${q(t, 0.95)}`); }
for (const [k, v] of Object.entries(byDiff)) { const t = [...v].sort((a, b) => a - b); console.log(`  diff ${k} : moy ${avg(v).toFixed(1)} | méd ${q(t, 0.5)} | p90 ${q(t, 0.9)} | p95 ${q(t, 0.95)}`); }
