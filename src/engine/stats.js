// src/engine/stats.js : extrait du monolithe (phase 0, comportement inchange)
let rollFn = Math.random;
function setRoll(fn) { rollFn = fn; }
function roll() { return rollFn(); }

function mulberry32(seed) {
let state = seed | 0;
return function () {
state = (state + 0x6d2b79f5) | 0;
let t = Math.imul(state ^ (state >>> 15), 1 | state);
t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
}

function countTypes(units) {
  const byType = new Map();
  for (const u of units) {
    for (const t of [u.classe, u.element]) {
      if (!byType.has(t)) byType.set(t, new Set());
      byType.get(t).add(u.cardId);
    }
  }
  return byType;
}

function activeTiers(units) {
  const tiers = new Map();
  for (const [type, ids] of countTypes(units)) {
    const n = ids.size;
    if (!SYNERGIES[type]) continue;
    if (n >= PALIERS[1]) tiers.set(type, 2);
    else if (n >= PALIERS[0]) tiers.set(type, 1);
  }
  return tiers;
}

function tierLabel(tier) {
  return tier === 2 ? 'Palier 2' : tier === 1 ? 'Palier 1' : '';
}

const classeMods = (u) => CLASSE_MODS[u && u.classe] || CLASSE_DEFAULT;

function raceOfCard(c) {
  if (!c) return 'humaine';
  if (RACE_DIVINE_IDS.has(c.id)) return 'divine';
  if (RACE_MYSTIQUE_IDS.has(c.id)) return 'mystique';
  if (RACE_MONSTRE_IDS.has(c.id)) return 'monstre';
  if (!c.dungeon) return 'humaine';
  if (RACE_HUMAINE_DUNGEON_IDS.has(c.id)) return 'humaine';
  return 'monstre';
}

function elementMult(atkEl, defEl) {
  if (!atkEl || !defEl) return 1;
  return BEATS[atkEl] === defEl ? 1 + OPP_BONUS : 1;
}

function elementTag(atkEl, defEl) {
  if (!atkEl || !defEl) return null;
  return BEATS[atkEl] === defEl ? 'fort' : null;
}
// Lot B (refonte direction, TRANCHE 12/11) : l'element d'un SORT = element de son ECOLE (data SCHOOL_ELEMENT),
// pas celui de la carte lanceuse ; la frappe simple garde l'element de la carte. Neutre = hors oppositions.
function schoolElementOf(spell) {
  if (!spell || !spell.ecole) return null;
  return (E.SCHOOL_ELEMENT ?? {})[spell.ecole] ?? null;
}
function atkElementOf(u, spell) { return spell ? (schoolElementOf(spell) ?? u.element) : u.element; }
// Lot 1 (vie du jeu, TRANCHE 12/11) : coup critique d'agilite — frappes physiques seules (sorts exclus en v1),
// l'esquive se resout d'abord ; chance = CRIT_BASE + CRIT_PER_AGI x avantage d'agi positif, plafonnee CRIT_CAP ; degats x CRIT_MULT.
function critChanceOf(attacker, target) {
  const adv = Math.max(0, (attacker?.agi ?? 0) - (target?.agi ?? 0));
  return Math.min(M.CRIT_CAP, M.CRIT_BASE + adv * M.CRIT_PER_AGI);
}
function rollCrit(attacker, target, rng) {
  const c = critChanceOf(attacker, target);
  return !!(rng && c > 0 && rng() < c);
}

function cardPower(card, lvl) {
  const st = statsAt(card, lvl, 0);
  const spellsN = (card.spells ?? []).length;
  return (st.atk * M.POWER_ATK_WEIGHT + st.hp * M.POWER_HP_WEIGHT) * (RARITY_POWER[card.rarity] ?? 1) * (1 + M.POWER_SPELL_STEP * Math.max(0, spellsN - 1));
}

function statsAt(card, lvl) {
  const m = 1 + LEVEL_BONUS * ((lvl ?? 1) - 1);
  return { atk: Math.max(1, Math.round(card.atk * m)), hp: Math.max(1, Math.round(card.hp * m)) };
}

function monstersOf(dungeonId) {
  // lot 5 donjons par famille : un donjon peut declarer son pool (familles porteuses) ;
  // sinon pool historique = tous les monstres du biome. Les horsPool (boss dédiés) restent exclus
  const d = DUNGEONS.find((x) => x.id === dungeonId);
  if (d?.pool?.length) return MONSTERS.filter((m) => d.pool.includes(m.id) && !m.horsPool);
  return MONSTERS.filter((m) => m.dungeon === dungeonId && !m.horsPool);
}

function allMonsters() {
  return MONSTERS;
}

function forgeOnly(c) {
  return !!(c.branch || c.evolved);
}

function byId(id) {
  const c = CATALOG.find((c) => c.id === id);
  if (!c) throw new Error(`Carte inconnue : ${id}`);
  return c;
}

function monsterNextLine(id) {
  for (const dk of Object.keys(MONSTER_FAMS)) {
    for (const fam of MONSTER_FAMS[dk]) {
      for (const line of fam.lines) {
        const i = line.indexOf(id);
        if (i >= 0 && i < line.length - 1) return { nextId: line[i + 1], famName: fam.name };
      }
    }
  }
  return null;
}

// mode RPG (phase 3) : stat principale par profil et seuils, en données (EXI-P3-1, EXI-P3-5)
function statPrincipaleOf(classe) {
  return (DATA.engine.profils ?? {})[classe]?.stat ?? 'atk';
}
function statOf(u) {
  const s = statPrincipaleOf(u.classe);
  return u[s] ?? u.atk ?? 1;
}
function seuilOf(u) {
  const s = DATA.engine.seuils ?? {};
  const palier = RANK[u.rarity] ?? 0;
  // T4.5 : seuil de résistance = palier de la cible + moitié de son intelligence (données)
  return (s.parPalier?.[palier] ?? 0) + (s.parCamp?.[u.race] ?? 0) + (u.int ?? 0) * M.SEUIL_PER_INT;
}
