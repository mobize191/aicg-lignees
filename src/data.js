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
const EVEIL_COST = E.EVEIL_COST;
const PIERRE_DROP_RATE = E.PIERRE_DROP_RATE;
const N_DROP_RATE = E.N_DROP_RATE;
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

// boucle v2 lot 1 : potions (data/potions.json), or (conversion 1 ⚡ = 1 or), hook autel de soin, régén après le premier boss
const POTIONS = DATA.potions ?? {};

const OR_PER_POINT = E.OR_PER_POINT;

const AUTEL_SOIN_GRACE = E.AUTEL_SOIN_GRACE;

const REGEN_BOSS_STAGE = E.REGEN_BOSS_STAGE;

// boucle v2 lot 3 : départ à 2 cartes (4 propositions, une par race) + recrutement naturel (taux par zone)
const DEPART_CHOIX = E.DEPART_CHOIX ?? [];

const RECRUTE_TAUX = E.RECRUTE_TAUX;

// boucle v2 lot 4 : équipement (data/equipment.json), drops v2, inventaire
const EQUIPMENT = DATA.equipment?.pieces ?? [];

const EQUIP_BY_ID = Object.fromEntries(EQUIPMENT.map((p) => [p.id, p]));

const EQUIP_SETS = DATA.equipment?.sets ?? {};

// économie v2 lot E2 : marchand de créatures (data/marchand.json)
const MARCHAND = DATA.marchand ?? { prixParRarete: {}, raretesVendues: [], maxExemplaires: 3 };

const EQUIP_DROP_RATE = E.EQUIP_DROP_RATE;

const GEM_BRUT_PRIX = E.GEM_BRUT_PRIX;

const SET_BONUS_PCT = E.SET_BONUS_PCT;

const BOSS_SET_TIER = E.BOSS_SET_TIER ?? {};

// recâblage famille → école : la clé d'école réelle d'une famille (seules lame et appel coïncident)

const FAM_SCHOOL = E.FAM_SCHOOL;

// v0.48 : sort signature -> vidéo fx (webm rendus dans site-assets/fx/, jamais en base64)
const FX_SPELLS = E.FX_SPELLS;
const MONSTER_FAMS = DATA['monster-families'];

// T0.2 : le camp de ciblage d'un sort vient de sa fiche (cible en donnees) ; sans fiche,
// null = la fenetre garde le comportement historique selon le role de l'unite (fiche type au lot 3)
function spellSideOf(sp) {
  const c = (sp && typeof sp.cible === 'string') ? sp.cible : '';
  if (c === 'soi') return 'self';
  if (c.includes('alli')) return 'ally';
  if (c.includes('quipe')) return 'team';
  if (c === 'zone') return 'zone';       // lot 3 : la zone désigne un ancrage sur la ligne
  if (c === 'tous' || c.includes('tous')) return 'all'; // lot 3 : aucune désignation
  if (c.includes('ennemi')) return 'enemy';
  return null;
}

const MONSTERS = RAW.map((m) => ({
  ...m,
  spells: [ { ...COMMON_SPELLS[!!(m.effect && m.effect.kind === 'heal') ? 'support' : 'attaque'] }, { name: m.soloSpell, cost: m.soloCost ?? 3, mult: m.soloMult ?? 1.5, ...(m.soloDot ? { dot: m.soloDot } : {}), cat: 'unique', desc: 'Le geste signature de ce monstre.' } ],
  mana: MONSTER_MANA.max,
  manaRegen: MONSTER_MANA.regen,
}));
