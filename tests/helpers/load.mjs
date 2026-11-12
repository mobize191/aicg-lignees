// charge les modules du moteur comme le build le fait, pour les tests (pas de DOM, pas de build)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
export function loadData(dataDir = 'data') {
  return Object.fromEntries(
    readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort()
      .map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(`${dataDir}/${f}`, 'utf8'))])
  );
}
const NAMES = ['DATA', 'errors', 'validate', 'getCard', 'getMonster', 'getSpell', 'getSchool',
  'getFamily', 'getTree', 'getZone', 'applyDamage', 'resolveTurn', 'applySupport', 'castSummon',
  'setRoll', 'roll', 'migrate', 'statsAt', 'castSpell', 'pickZoneTargets', 'evolve', 'openSchools',
  'mulberry32', 'elementMult', 'elementTag', 'makeUnit', 'initCombat', 'beginRound', 'peekRound', 'stepRound', 'playAuto', 'spellSideOf',
  'teamModifiers', 'pickSpell', 'tickStatuses', 'resolveTurn', 'evoTargetsOf', 'evoVoieOf', 'evoCostOf',
  'nextFormOf', 'formsOf', 'makeWave', 'monstersOf', 'allMonsters', 'cardPower', 'dungeonById', 'dungeonLevelOf', 'bandOf',
  'difficultyById', 'stageRewards', 'openDivineBooster', 'pickCard', 'drawDailyCommon', 'drawNaissance',
  'treeOfRace', 'cranPctOfRace', 'noLossPctOf', 'eveilsOf', 'eveilOf', 'applyTreeEveil', 'applyRemplace', 'raceOfCard', 'classeMods',
  'getSpellDef', 'getSchoolSpell', 'getEntree', 'cranOf', 'castSpell', 'largeurCibles', 'resolveSignature',
  'profilSchools', 'openSchools', 'canCast', 'sortsDeDepart', 'ecolesOfInstance',
  'resolveSpellEntry', 'drinkPotion', 'recrutableMonsters', 'foeFacingSpell', 'strikeFoe', 'castFoeSpell', 'pickTargetByUtility', 'targetUtilityScore', 'enemyPickTarget', 'statPrincipaleOf', 'statOf', 'seuilOf', 'pickZoneTargets', 'largeurOfSpellName', 'runZone', 'learnCran', 'isLearned', 'canCastLearned', 'evoEntryOf', 'conditionOk', 'applySpecialEvo', 'evoLabelOf', 'genZoneMap', 'astar', 'smoothPath', 'createErranceState', 'setTarget', 'stepErrance', 'interactAutel', 'interactJarre', 'zoneUnlocked', 'unlockZone', 'spellKeyOf', 'unknownSpellsOf', 'ET', 'rescueHeroPos', 'errancePalette', 'decorOrders', 'buildAmbiance', 'paintZoneBase', 'paintTileGround', 'equipeFormee', 'gardeEquipe', 'genreRun', 'combatZoneEnCours', 'initRun', 'quitterCombat', 'signatureMetaOf', 'signatureMetaOfUnit'];
export function loadEngine(dataDir = 'data') {
  const data = loadData(dataDir);
  const files = ['src/validate.js', 'src/data.js', 'src/engine/stats.js', 'src/engine/spells.js',
    'src/engine/combat.js', 'src/engine/summon.js', 'src/engine/progression.js', 'src/errance.js', 'src/errance-paint.js', 'src/engine/zoneflow.js', 'src/engine/migrate.js'];
  const body = files.filter((f) => existsSync(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  const code = `const DATA = ${JSON.stringify(data)};\n${body}\n`
    + `const out = {};\nfor (const n of ${JSON.stringify(NAMES)}) { try { out[n] = eval(n); } catch {} }\nreturn out;`;
  return (new Function(code))();
}
