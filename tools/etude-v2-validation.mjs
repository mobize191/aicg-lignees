// Validation v2 (Marc-Olivier, 14/11) : mesure des axes de l'étude de rééquilibrage
// sur le moteur v2 : I1 (monstre recruté ≈ carte humaine), J4 (cran allégé PV),
// D (coût de slot support), J7/J8 (trios hétérogènes au même plateau).
// Même protocole v3 que tools/etude-paliers.mjs (seeds n+1, 5 donjons, étages,
// difficultés 1-3, garde 150 tours, N = 3000).
// Usage : node tools/etude-v2-validation.mjs dist.html 3000
import { bootDist } from '../stub.mjs';

const file = process.argv[2] ?? 'dist.html';
const N = Number(process.argv[3] ?? '3000');

const boot = bootDist(file);
const api = boot.api;
if (!api) { console.error('BOOT KO'); process.exit(1); }
console.log('BOOT OK');

const LVL = api.stretchLevel ? api.stretchLevel(12) : 12;
const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];
const GARDE = 150;
const mons = Array.isArray(api.DATA.monsters) ? api.DATA.monsters : api.allMonsters();
const monById = new Map(mons.map(m => [m.id, m]));
const card = (id) => ({ ...(api.byId(id) ?? monById.get(id)), level: LVL });

function run(label, ids) {
  let wins = 0, marathons = 0, exceptions = 0, toursTot = 0, nWin = 0;
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
      const mk = (id) => ({ ...card(id), level: LVL });
      const teamCards = { avant: ids.avant.map(mk), arriere: ids.arriere.map(mk) };
      const state = api.initCombat(teamCards, wave, seed, {}, { difficulty: diff });
      let tours = 0;
      while (!state.winner && tours < GARDE) { api.resolveTurn(state); tours++; }
      if (state.winner === 'team') { wins++; winsDiff[diff - 1]++; toursTot += tours; nWin++; }
      else if (state.winner === 'enemies') { toursTot += tours; }
      else marathons++;
    } catch (e) { exceptions++; }
  }
  const rate = (100 * wins / N).toFixed(1);
  const d = (i) => (100 * winsDiff[i] / nDiff[i]).toFixed(1);
  const avg = nWin + (N - wins - marathons - exceptions) > 0 ? (toursTot / Math.max(1, wins + (N - wins - marathons - exceptions))).toFixed(1) : '-';
  console.log(`${label} : ${rate} % | d1 ${d(0)} | d2 ${d(1)} | d3 ${d(2)} | marathons ${marathons} | exc ${exceptions} | tours ${avg}`);
}

const M3 = (id) => ({ avant: [id, id], arriere: [id] });

// --- I1 : mono-classe monstres recrutables (3× meilleur monstre R de la classe) ---
run('MONSTRE R Guerrier 3x k4 Chevalier Defunt (mystique)', M3('k4'));
run('MONSTRE R Assassin 3x f11 Traqueur de Suie (monstre)', M3('f11'));
run('MONSTRE R Assassin 3x d15 Brodeuse des Liens (divine)', M3('d15'));
run('MONSTRE R Mage 3x z17 Oiseau de Feu (monstre, Feu)', M3('z17'));
run('MONSTRE R Pretre 3x z24 Diacre du Plein Jour (humaine)', M3('z24'));
run('MONSTRE R Occultiste 3x e25 Voix du Large (mystique)', M3('e25'));

// --- J4 : paires quasi jumelles, cran de race allégé (PV seuls, attendu +1 a 3 pts/palier) ---
run('PAIRE R z4 Lancier Solaire (humaine, Feu)', M3('z4'));
run('PAIRE R f4 Chevalier de Braise (monstre, Feu)', M3('f4'));
run('PAIRE R f11 Traqueur de Suie (monstre, Ombre)', M3('f11'));
run('PAIRE R k13 Goule des Caveaux (mystique, Ombre)', M3('k13'));
run('PAIRE R z17 Oiseau de Feu (monstre, Feu)', M3('z17'));
run('PAIRE R d4 Juge des Heures (divine, Lumiere)', M3('d4'));

// --- D : cout de slot support (reference : 3x a48 = ligne R Guerrier de etude-paliers) ---
run('SLOT R 2xa48 + s5 Pretresse de l Aube (soigneur)', { avant: ['a48', 'a48'], arriere: ['s5'] });
run('SLOT R 2xa48 + s6 Sentinelle d Acier (tank)', { avant: ['a48', 'a48'], arriere: ['s6'] });
run('SLOT R 2xa48 + p5 Seraphin (meilleur Pretre R)', { avant: ['a48', 'a48'], arriere: ['p5'] });

// --- J7/J8 : trios heterogenes au meme plateau (sorts de trio en premiere ligne) ---
run('TRIO R G/A/P a48+a41+p5 (avant, Harmonie)', { avant: ['a48', 'a41', 'p5'], arriere: [] });
run('TRIO R M/A/P a8+a41+p5 (avant, Eclipse)', { avant: ['a8', 'a41', 'p5'], arriere: [] });
run('TRIO R G/M/O a48+a8+q3 (avant, Harmonie)', { avant: ['a48', 'a8', 'q3'], arriere: [] });
run('TRIO R M/P/O a8+p5+q3 (avant, Harmonie)', { avant: ['a8', 'p5', 'q3'], arriere: [] });
run('TRIO R G/A/P a48+a41 avant + p5 arriere (pas de sort de trio)', { avant: ['a48', 'a41'], arriere: ['p5'] });
