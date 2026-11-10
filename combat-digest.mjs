// Harnas d'équilibrage : N combats simulés sur les donjons réels, digest SHA256 de dormance.
// Protocole v3 : 4 équipes (toutes <= Nv20) x 5 donjons x étages x difficultés, sans modificateur.
// Usage : node combat-digest.mjs dist.html 3000
import { createHash } from 'node:crypto';
import { bootDist } from './stub.mjs';

const file = process.argv[2] ?? 'dist.html';
const N = Number(process.argv[3] ?? '3000');

const boot = bootDist(file);
const api = boot.api;
if (!api) { console.error('BOOT KO : __api absent'); process.exit(1); }
console.log('BOOT OK');

const TEAMS = [
  { name: 'novices-niv5', avant: [['n1', 5], ['n2', 5]], arriere: [['n3', 5]] },
  { name: 'divines-niv12', avant: [['n14', 12], ['n15', 12]], arriere: [['n13', 12]] },
  { name: 'familiales-niv15', avant: [['a1', 15], ['g9', 15]], arriere: [['d2', 15]] },
  { name: 'mixte-niv8-20', avant: [['n9', 8], ['a30', 20], ['n4', 8]], arriere: [['n7', 8]] },
];
const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];
const GARDE = 150;

const lines = [];
let wins = 0, marathons = 0, exceptions = 0;
for (let n = 0; n < N; n++) {
  const team = TEAMS[n % 4];
  const dg = DGS[n % 5];
  let stage, diff, seed, res = '?', tours = 0;
  try {
    const floors = api.dungeonById(dg).floors;
    stage = 1 + (n % floors);
    diff = 1 + (n % 3);
    seed = n + 1;
    const wave = api.makeWave(seed, stage, dg, diff);
    const teamCards = {
      avant: team.avant.map(([id, lvl]) => ({ ...api.byId(id), level: lvl })),
      arriere: team.arriere.map(([id, lvl]) => ({ ...api.byId(id), level: lvl })),
    };
    const state = api.initCombat(teamCards, wave, seed);
    while (!state.winner && tours < GARDE) { api.resolveTurn(state); tours++; }
    if (state.winner === 'team') { res = 'W'; wins++; }
    else if (state.winner === 'enemies') res = 'L';
    else { res = '?'; marathons++; }
  } catch (e) {
    exceptions++;
    res = 'E';
  }
  lines.push(`${n}|${team.name}|${dg}|${stage}|${diff}|${res}|${tours}`);
}

const journal = lines.join('\n');
const digest = createHash('sha256').update(journal).digest('hex');
console.log('digest sha256 :', digest);
console.log(`victoires : ${wins} / ${N} (${exceptions} exceptions, ${marathons} marathons)`);
