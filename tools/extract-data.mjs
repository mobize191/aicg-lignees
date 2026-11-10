// tools/extract-data.mjs : extrait les donnees inline du dist de reference (passe jetable)
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('dist.reference.html', 'utf8');

// extrait le littéral d'une déclaration `const NAME = <littéral>` par équilibrage des délimiteurs
function grab(name) {
  const start = src.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`${name} introuvable`);
  let i = start + `const ${name} =`.length;
  while (i < src.length && /\s/.test(src[i])) i++;
  const open = src[i];
  if (open !== '[' && open !== '{') {
    const semi = src.indexOf(';', i);
    if (semi < 0) throw new Error(`${name} : scalaire sans fin`);
    return src.slice(start, semi);
  }
  const close = open === '[' ? ']' : '}';
  let depth = 0, inStr = null, esc = false, inLine = false, inBlock = false;
  for (; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '/' && n === '/') { inLine = true; i++; continue; }
    if (c === '/' && n === '*') { inBlock = true; i++; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === open) depth++;
    if (c === close) { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error(`${name} : fin introuvable`);
}
const evalData = (code) => (0, eval)('(' + code.replace(/^const [A-Z_]+ =/, '') + ')');
const write = (file, value) => writeFileSync(`data/${file}`, JSON.stringify(value, null, 1) + '\n');

write('cards.json', evalData(grab('CATALOG')));
write('monsters.json', evalData(grab('RAW')));
write('families.json', evalData(grab('FAMILIES')));
write('lineage-spells.json', evalData(grab('FAMILY_SPELLS')));
write('dungeons.json', evalData(grab('DUNGEONS')));
write('difficulties.json', evalData(grab('DIFFICULTIES')));
write('evolutions.json', evalData(grab('EVO_CHOICES')));
write('synergies.json', evalData(grab('SYNERGIES')));
write('solo-steps.json', evalData(grab('SOLO_STEPS')));
write('monster-families.json', evalData(grab('MONSTER_FAMS')));
write('run-mods.json', evalData(grab('RUN_MODS')));
write('grimoire.json', {
  communs: evalData(grab('COMMON_SPELLS')),
  race: evalData(grab('RACE_SPELLS')),
  classe: evalData(grab('CLASS_SPELLS')),
});
write('engine.json', {
  CLASSES: evalData(grab('CLASSES')),
  ELEMENTS: evalData(grab('ELEMENTS')),
  PALIERS: evalData(grab('PALIERS')),
  SPELL_CAT_LABEL: evalData(grab('SPELL_CAT_LABEL')),
  RARITY_POWER: evalData(grab('RARITY_POWER')),
  RANK: evalData(grab('RANK')),
  BEATS: evalData(grab('BEATS')),
  BEATEN_BY: evalData(grab('BEATEN_BY')),
  RACES: evalData(grab('RACES')),
  RACE_LABEL: evalData(grab('RACE_LABEL')),
  RACE_MOD: evalData(grab('RACE_MOD')),
  CLASSE_MODS: evalData(grab('CLASSE_MODS')),
  CLASSE_DEFAULT: evalData(grab('CLASSE_DEFAULT')),
  MONSTER_MANA: evalData(grab('MONSTER_MANA')),
  FAMILY_MANA: evalData(grab('FAMILY_MANA')),
  SOLO_MANA: evalData(grab('SOLO_MANA')),
  EVO_COST: evalData(grab('EVO_COST')),
  GEM_TIERS: evalData(grab('GEM_TIERS')),
  GEM_LABEL: evalData(grab('GEM_LABEL')),
  BOSS_GEM: evalData(grab('BOSS_GEM')),
  TOKEN_RAR: evalData(grab('TOKEN_RAR')),
  NEXT_RAR: evalData(grab('NEXT_RAR')),
  SHARD_MAX: evalData(grab('SHARD_MAX')),
  SHARD_BONUS: evalData(grab('SHARD_BONUS')),
  PITY_MAX: evalData(grab('PITY_MAX')),
  ALL_SHARDS: evalData(grab('ALL_SHARDS')),
  REWARD_TABLE: evalData(grab('REWARD_TABLE')),
  DIVINE_LOW_SLOT: evalData(grab('DIVINE_LOW_SLOT')),
  DIVINE_MID_SLOT: evalData(grab('DIVINE_MID_SLOT')),
  DIVINE_TOP_SLOT: evalData(grab('DIVINE_TOP_SLOT')),
  REG_ECLAT_RATE: evalData(grab('REG_ECLAT_RATE')),
  TEAM_MAX: evalData(grab('TEAM_MAX')),
  OPP_BONUS: evalData(grab('OPP_BONUS')),
  LEVEL_BONUS: evalData(grab('LEVEL_BONUS')),
  LEVEL_CAP: evalData(grab('LEVEL_CAP')),
  DMG_REDUCTION_MAX: evalData(grab('DMG_REDUCTION_MAX')),
  SAVE_VERSION: evalData(grab('SAVE_VERSION')),
  SAVE_KEY: evalData(grab('SAVE_KEY')),
  CURRENT_VERSION: evalData(grab('SAVE_VERSION')),
});
console.log('extraction ok');
