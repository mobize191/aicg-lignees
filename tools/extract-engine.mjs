// tools/extract-engine.mjs : decoupe le script du dist de reference en src/engine/*.js + src/ui.js (passe jetable)
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('dist.reference.html', 'utf8');
const open = src.indexOf('<script>') + '<script>'.length;
const close = src.indexOf('</script>');
let script = src.slice(open, close);

// extrait un bloc par nom : `function name(...) {...}` ou `const NAME = <...>;`
function grabBlock(prefix) {
  const start = script.indexOf(prefix);
  if (start < 0) throw new Error(`${prefix} introuvable`);
  let i = start + prefix.length;
  if (prefix.startsWith('function')) {
    let depth = 1, inStr = null, esc = false;
    for (; i < script.length; i++) {
      const ch = script[i];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') { depth--; if (depth === 0) { i++; break; } }
    }
    while (i < script.length && /\s/.test(script[i])) i++;
    if (script[i] !== '{') throw new Error(`${prefix} : corps introuvable`);
  } else {
    while (i < script.length && /\s/.test(script[i])) i++;
    const c = script[i];
    if (c !== '[' && c !== '{') {
      const semi = script.indexOf(';', i);
      if (semi < 0) throw new Error(`${prefix} : scalaire sans fin`);
      return script.slice(start, semi + 1);
    }
  }
  const openC = script[i];
  const closeC = openC === '{' ? '}' : ']';
  let depth = 0, inStr = null, esc = false, inLine = false, inBlock = false;
  for (; i < script.length; i++) {
    const ch = script[i], n = script[i + 1];
    if (inLine) { if (ch === '\n') inLine = false; continue; }
    if (inBlock) { if (ch === '*' && n === '/') { inBlock = false; i++; } continue; }
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '/' && n === '/') { inLine = true; i++; continue; }
    if (ch === '/' && n === '*') { inBlock = true; i++; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === openC) depth++;
    if (ch === closeC) { depth--; if (depth === 0) return script.slice(start, i + 1); }
  }
  throw new Error(`${prefix} : fin introuvable`);
}
function removeBlock(prefix) {
  const b = grabBlock(prefix);
  script = script.replace(b, '');
  return b;
}

const MODULES = {
  'src/engine/stats.js': [
    'function mulberry32(', 'function countTypes(', 'function activeTiers(', 'function tierLabel(',
    'const classeMods =', 'function raceOfCard(', 'function elementMult(', 'function elementTag(',
    'function cardPower(', 'function statsAt(', 'function monstersOf(', 'function allMonsters(',
  ],
  'src/engine/spells.js': ['function pickSpell(', 'function applySupport('],
  'src/engine/summon.js': ['function castSummon('],
  'src/engine/combat.js': [
    'function makeUnit(', 'function teamModifiers(', 'function levelFor(', 'function initCombat(',
    'function applyDamage(', 'function tickStatuses(', 'function beginRound(', 'function peekRound(',
    'function actTeamStriker(', 'function actTeamSupport(', 'function enemyPickTarget(',
    'function actEnemyStriker(', 'function actEnemySupport(', 'function stepRound(', 'function resolveTurn(',
    'function playAuto(', 'function dungeonById(', 'function difficultyById(', 'function shardMult(',
    'function shardPct(', 'function stagesOf(', 'function levelAt(', 'function levelIn(', 'function hashSeed(',
    'function wavePower(', 'function spreadAt(', 'function makeWave(', 'function makeDailyWave(',
    'function drawDailyCommon(', 'function rollRewardRarity(', 'function pickCard(', 'function stageRewards(',
    'function rollRarity(', 'function openDivineBooster(',
  ],
  'src/engine/progression.js': [
    'function nextFormOf(', 'function formsOf(', 'function evoTargetsOf(', 'function evoVoieOf(', 'function evoCostOf(',
  ],
};

const RNG_HEADER = `let rollFn = Math.random;
function setRoll(fn) { rollFn = fn; }
function roll() { return rollFn(); }
`;

for (const [file, names] of Object.entries(MODULES)) {
  const parts = names.map((p) => removeBlock(p).replace(/rng = uiRand/g, 'rng = roll'));
  const header = file.endsWith('stats.js') ? RNG_HEADER : '';
  writeFileSync(file, `// ${file} : extrait du monolithe (phase 0, comportement inchange)\n${header}\n${parts.join('\n\n')}\n`);
  console.log(`${file} : ${names.length} blocs`);
}

// les declarations de donnees pures sortent de ui.js (elles seront aliasées dans src/data.js depuis DATA)
const DATA_DECLS = [
  'const CLASSES =', 'const ELEMENTS =', 'const PALIERS =', 'const SYNERGIES =', 'const MONSTER_MANA =',
  'const RAW =', 'const COMMON_SPELLS =', 'const RACE_SPELLS =', 'const CLASS_SPELLS =', 'const SPELL_CAT_LABEL =',
  'const RARITY_POWER =', 'const MONSTERS =', 'const FAMILY_SPELLS =', 'const FAMILY_MANA =', 'const SOLO_MANA =',
  'const CATALOG =', 'const RANK =', 'const FAMILIES =', 'const SOLO_STEPS =', 'const DMG_REDUCTION_MAX =',
  'const LEVEL_BONUS =', 'const CLASSE_MODS =', 'const CLASSE_DEFAULT =', 'const BEATS =', 'const BEATEN_BY =',
  'const RACES =', 'const RACE_LABEL =', 'const RACE_MOD =', 'const RACE_DIVINE_IDS =', 'const RACE_MYSTIQUE_IDS =',
  'const RACE_HUMAINE_DUNGEON_IDS =', 'const RACE_MONSTRE_IDS =', 'const OPP_BONUS =', 'const CROSS =',
  'const DIFFICULTIES =', 'const RUN_MODS =', 'const DUNGEONS =', 'const SHARD_MAX =', 'const SHARD_BONUS =',
  'const PITY_MAX =', 'const ALL_SHARDS =', 'const REWARD_TABLE =', 'const DIVINE_LOW_SLOT =',
  'const DIVINE_MID_SLOT =', 'const DIVINE_TOP_SLOT =', 'const SAVE_VERSION =', 'const SAVE_KEY =',
  'const EVO_COST =', 'const GEM_TIERS =', 'const GEM_LABEL =', 'const BOSS_GEM =', 'const TOKEN_RAR =',
  'const NEXT_RAR =', 'const LEVEL_CAP =', 'const REG_ECLAT_RATE =', 'const EVO_TYPES =', 'const EVO_CHOICES =',
  'const TEAM_MAX =', 'const FAM_ORDER =', 'const MONSTER_FAMS =',
];
for (const d of DATA_DECLS) removeBlock(d);
console.log(`ui.js : ${DATA_DECLS.length} declarations de donnees retirees`);

writeFileSync('src/ui.js', `// src/ui.js : le bloc UI extrait (routes, rendus, sauvegarde) — le moteur est dans src/engine/\n${script.replace(/\s+$/, '\n')}`);
console.log(`src/ui.js ecrit (${script.length} caracteres restants)`);
