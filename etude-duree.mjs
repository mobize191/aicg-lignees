// Étude de durée des combats (couloir pilotage, 13/11) : matchs miroirs ÉQUILIBRÉS.
// Équipes : cartes jouables, niveaux de base ±3 par carte, raretés dans ±1 rang.
// Usage : node etude-duree.mjs dist.html 2000 [v0|atk125|atk150|hp80|hp70|mixte]
import { bootDist } from './stub.mjs';

const file = process.argv[2] ?? 'dist.html';
const N = Number(process.argv[3] ?? '2000');
const MODE = process.argv[4] ?? 'v0';
const GARDE = 150;

const boot = bootDist(file);
const api = boot.api;
if (!api) { console.error('BOOT KO'); process.exit(1); }

const RANK = { C: 0, UC: 1, R: 2, SR: 3, UR: 4, L: 5 };
const RANKS = Object.keys(RANK);

// mulberry32 : RNG seedé pour reproductibilité
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// cartes jouables (exclut boss/final)
const pool = (api.DATA?.cards ?? []).filter((c) => !c.boss && !c.final && RANK[c.rarity] != null && !c.id.startsWith('k') && !c.id.startsWith('z')); // k*/z* = monstres ennemis, pas de cartes joueur
if (!pool.length) { console.error('POOL KO'); process.exit(1); }

// modificateurs de variante (appliqués aux cartes AVANT initCombat)
function mod(cards) {
  for (const c of cards) {
    if (MODE === 'atk125') c.atk = Math.max(1, Math.round(c.atk * 1.25));
    if (MODE === 'atk150') c.atk = Math.max(1, Math.round(c.atk * 1.5));
    if (MODE === 'hp80') c.hp = Math.max(1, Math.round(c.hp * 0.8));
    if (MODE === 'hp70') c.hp = Math.max(1, Math.round(c.hp * 0.7));
    if (MODE === 'mixte') { c.atk = Math.max(1, Math.round(c.atk * 1.25)); c.hp = Math.max(1, Math.round(c.hp * 0.85)); }
  }
  return cards;
}

// tire une équipe : 3 avant + 2 (réserve pour le joueur, arrière pour l'ennemi)
function drawTeam(rng, baseLvl, rank) {
  const pick = () => {
    const rMin = Math.max(0, rank - 1), rMax = Math.min(5, rank + 1);
    const cand = pool.filter((c) => RANK[c.rarity] >= rMin && RANK[c.rarity] <= rMax);
    const c = cand[Math.floor(rng() * cand.length)];
    const lvl = Math.max(1, baseLvl + Math.floor(rng() * 7) - 3);
    return { ...api.byId(c.id), level: lvl };
  };
  const avant = [pick(), pick(), pick()];
  const dos = [pick(), pick()];
  return { avant, dos };
}

const LEVELS = [5, 10, 15, 20];
const stats = { turns: [], wins: 0, losses: 0, marathons: 0, exceptions: 0 };
const byLvl = {};
for (let n = 0; n < N; n++) {
  const rng = mulberry32(n + 1);
  const baseLvl = LEVELS[n % 4];
  const rank = (n % 3 === 0) ? 2 : (n % 3 === 1 ? 1 : 3); // R, UC, SR équitables
  let tours = 0, res = '?';
  try {
    const A = drawTeam(rng, baseLvl, rank);
    const B = drawTeam(rng, baseLvl, rank);
    const teamCards = { avant: mod(A.avant.slice()), reserve: mod(A.dos.slice()) };
    const enemyCards = [...mod(B.avant.slice()), ...mod(B.dos.slice())];
    const state = api.initCombat(teamCards, enemyCards, n + 1, {}, {});
    while (!state.winner && tours < GARDE) { api.resolveTurn(state); tours++; }
    if (state.winner === 'team') { res = 'W'; stats.wins++; }
    else if (state.winner === 'enemies') { res = 'L'; stats.losses++; }
    else { res = '?'; stats.marathons++; }
  } catch (e) { stats.exceptions++; res = 'E'; }
  stats.turns.push(tours);
  const k = 'N' + baseLvl;
  byLvl[k] = byLvl[k] ?? [];
  byLvl[k].push(tours);
}

const sorted = [...stats.turns].sort((a, b) => a - b);
const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
const avg = (a) => (a.reduce((s, x) => s + x, 0) / a.length);
console.log(`MODE ${MODE} | N=${N} | moyenne ${avg(stats.turns).toFixed(1)} tours | médiane ${q(0.5)} | p75 ${q(0.75)} | p90 ${q(0.9)} | p95 ${q(0.95)} | marathons(>=${GARDE}) ${stats.marathons} | W ${stats.wins} / L ${stats.losses} | exceptions ${stats.exceptions}`);
for (const [k, v] of Object.entries(byLvl)) {
  const s = [...v].sort((a, b) => a - b);
  console.log(`  ${k} : moyenne ${avg(v).toFixed(1)} | médiane ${s[Math.floor(s.length / 2)]} | p90 ${s[Math.floor(s.length * 0.9)]} | max ${s[s.length - 1]}`);
}
