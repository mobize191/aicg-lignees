// src/data.js : acces unique aux donnees + validation au chargement (EXI-P0-3)
const errors = [];
validate(DATA, errors);
if (errors.length && typeof document !== 'undefined') {
  document.body.insertAdjacentHTML('beforeend',
    `<pre style="color:#f88;padding:12px">DONNEES INVALIDES :\n${errors.join('\n')}</pre>`);
}
const index = (arr) => Object.fromEntries((arr ?? []).map((x) => [x.id ?? x.key, x]));
const IDX = {
  cards: index(DATA.cards), monsters: index(DATA.monsters),
  families: Object.fromEntries(Object.entries(DATA.families ?? {})),
  schools: Object.fromEntries(Object.entries(DATA.schools ?? {})), grimoire: index(DATA.grimoire?.spells),
  trees: Object.fromEntries(Object.entries(DATA.trees ?? {})), zones: index(DATA.zones),
};
const getCard = (id) => IDX.cards[id];
const getMonster = (id) => IDX.monsters[id];
const getSpell = (id) => IDX.grimoire[id];
const getSchool = (id) => IDX.schools[id];
const getFamily = (id) => IDX.families[id];
const getTree = (id) => IDX.trees[id];
const getZone = (id) => IDX.zones[id];

// alias des constantes extraites : le moteur et l'UI lisent DATA, jamais de valeur en dur
const E = DATA.engine;
const M = E.moteur;
const CLASSES = E.CLASSES;
const ELEMENTS = E.ELEMENTS;
const PALIERS = E.PALIERS;
const SYNERGIES = DATA.synergies;
const MONSTER_MANA = E.MONSTER_MANA;
const RAW = DATA.monsters;
const legacySpell = (s, cat) => ({ name: s.nom, cost: s.cout, mult: s.mult, cat, desc: s.desc, ...(s.ecole ? { ecole: s.ecole } : {}), ...(s.role ? { role: s.role } : {}), ...(s.cible ? { cible: s.cible } : {}) });
const COMMON_SPELLS = Object.fromEntries((DATA.grimoire.communs ?? [])
  .map((s) => [s.role === 'soin' ? 'support' : 'attaque', legacySpell(s, 'commun')]));
const RACE_SPELLS = Object.fromEntries((DATA.grimoire.race ?? []).map((s) => [s.race, legacySpell(s, 'race')]));
const CLASS_SPELLS = Object.fromEntries((DATA.grimoire.entrees ?? []).filter((s) => s.classe).map((s) => [s.classe, legacySpell(s, 'classe')]));
const SCHOOLS = DATA.schools ?? {};
const KEYWORDS = DATA.keywords ?? {};
const FUSION_MAP = DATA['fusion-map'] ?? {};
const SPELL_CAT_LABEL = E.SPELL_CAT_LABEL;
const SPELL_ROLE_LABEL = E.SPELL_ROLE_LABEL;
const RARITY_LABEL = E.RARITY_LABEL;
const RARITY_POWER = E.RARITY_POWER;
const FAMILY_SPELLS = DATA['lineage-spells'];
const FAMILY_MANA = E.FAMILY_MANA;
const SOLO_MANA = E.SOLO_MANA;
const CATALOG = DATA.cards;
const RANK = E.RANK;
const FAMILIES = DATA.families;
const SOLO_STEPS = DATA['solo-steps'];
const DMG_REDUCTION_MAX = E.DMG_REDUCTION_MAX;
const LEVEL_BONUS = E.LEVEL_BONUS;
const CLASSE_MODS = E.CLASSE_MODS;
const CLASSE_DEFAULT = E.CLASSE_DEFAULT;
const BEATS = E.BEATS;
const BEATEN_BY = E.BEATEN_BY;
const RACES = E.RACES;
const RACE_LABEL = E.RACE_LABEL;
const RACE_MOD = E.RACE_MOD;
const RACE_DIVINE_IDS = new Set(E.RACE_DIVINE_IDS);
const RACE_MYSTIQUE_IDS = new Set(E.RACE_MYSTIQUE_IDS);
const RACE_HUMAINE_DUNGEON_IDS = new Set(E.RACE_HUMAINE_DUNGEON_IDS);
const RACE_MONSTRE_IDS = new Set(E.RACE_MONSTRE_IDS);
const OPP_BONUS = E.OPP_BONUS;
const CROSS = E.CROSS;
const DIFFICULTIES = DATA.difficulties;
const RUN_MODS = DATA['run-mods'];
const DUNGEONS = DATA.dungeons;
const SHARD_MAX = E.SHARD_MAX;
const SHARD_BONUS = E.SHARD_BONUS;
const PITY_MAX = E.PITY_MAX;
const ALL_SHARDS = E.ALL_SHARDS;
const REWARD_TABLE = E.REWARD_TABLE;
const DIVINE_LOW_SLOT = E.DIVINE_LOW_SLOT;
const DIVINE_MID_SLOT = E.DIVINE_MID_SLOT;
const DIVINE_TOP_SLOT = E.DIVINE_TOP_SLOT;
const SAVE_VERSION = E.SAVE_VERSION;
const CURRENT_VERSION = E.CURRENT_VERSION;
const SAVE_KEY = E.SAVE_KEY;
const EVO_COST = E.EVO_COST;
const GEM_TIERS = E.GEM_TIERS;
const GEM_LABEL = E.GEM_LABEL;
const BOSS_GEM = E.BOSS_GEM;
const TOKEN_RAR = E.TOKEN_RAR;
const NEXT_RAR = E.NEXT_RAR;
const LEVEL_CAP = E.LEVEL_CAP;
const REG_ECLAT_RATE = E.REG_ECLAT_RATE;
const EVO_TYPES = E.EVO_TYPES;
const EVO_CHOICES = DATA.evolutions;
const TEAM_MAX = E.TEAM_MAX;
const FAM_ORDER = E.FAM_ORDER;
const MONSTER_FAMS = DATA['monster-families'];

const MONSTERS = RAW.map((m) => ({
  ...m,
  spells: [ { ...COMMON_SPELLS[m.role === 'support' ? 'support' : 'attaque'] }, { name: m.soloSpell, cost: m.soloCost ?? 3, mult: m.soloMult ?? 1.5, ...(m.soloDot ? { dot: m.soloDot } : {}), cat: 'unique', desc: 'Le geste signature de ce monstre.' } ],
  mana: MONSTER_MANA.max,
  manaRegen: MONSTER_MANA.regen,
}));
