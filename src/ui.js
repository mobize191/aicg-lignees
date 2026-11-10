// src/ui.js : le bloc UI extrait (routes, rendus, sauvegarde) — le moteur est dans src/engine/
;


;

;
;
; 


;


;

;


;
;
;
function racialRaceOf(c) {
  if (!c.raciale) return null;
  if (c.dungeon === 'divin') return 'divine';
  const n = Number(String(c.id).replace(/\D/g, ''));
  if (n <= 4) return 'humaine';
  if (n <= 9) return 'bestiau';
  return 'enge';
}
;


;

function teamPower() {
  return [...store.team.slots].filter(Boolean).reduce((a, iid) => {
    const inst = byIid(iid);
    return a + (inst ? cardPower(byId(inst.id), inst.lvl) : 0);
  }, 0);
}
function recommendedPower(d, diff) {
  let sum = 0;
  for (let k = 0; k < 8; k++) {
    const wave = makeWave(1000 + k * 77, d.floors, d.id, diff);
    const units = [...wave.attaque, ...wave.support];
    sum += units.reduce((a, m) => a + cardPower(m, m.lvl ?? 1), 0);
  }
  return Math.round((sum / 8) * 1.15);
}






;



;

;
;

;

;

;

;


for (const c of CATALOG) {
  if (c.family) {
    const fam = FAMILIES[c.family];
    const t = fam.steps.indexOf(c.id);
    
    
    const tier = c.branch ? 3 : t;
    const famSchool = SCHOOLS[c.family] ?? {};
    c.spells = [ { ...COMMON_SPELLS[c.role === 'support' ? 'support' : 'attaque'] }, ...FAMILY_SPELLS[c.family].slice(0, tier + 1).map((sp) => ({ ...sp, cat: 'lignée', ecole: c.family, ...(famSchool.role ? { role: famSchool.role } : {}) })) ];
    c.mana = FAMILY_MANA[tier].max;
    c.manaRegen = FAMILY_MANA[tier].regen;
  } else {
    const raceSpell = c.raciale ? RACE_SPELLS[racialRaceOf(c)] : null;
    const classSpell = c.classe && CLASS_SPELLS[c.classe] ? CLASS_SPELLS[c.classe] : null;
    c.spells = [
      { ...COMMON_SPELLS[c.role === 'support' ? 'support' : 'attaque'] },
      ...(raceSpell ? [{ ...raceSpell }] : []),
      ...(classSpell ? [{ ...classSpell }] : []),
      { name: c.soloSpell, cost: c.soloCost ?? 5, mult: c.soloMult ?? 1.85, ...(c.soloDot ? { dot: c.soloDot } : {}), cat: 'unique', desc: 'La signature de cette carte — son geste à elle.' },
    ];
    c.mana = SOLO_MANA.max;
    c.manaRegen = SOLO_MANA.regen;
  }
}

for (const m of allMonsters()) {
  CATALOG.push({ ...m, monster: true });
}


function byIdSoft(id) { return CATALOG.find((c) => c.id === id) ?? null; }

function familyOf(card) {
  return card.family ? FAMILIES[card.family] : null;
}
;








;






;
;


;
;


;
;
const RACE_GLYPH = { humaine: '🧍', monstre: '🦃', mystique: '🧚', divine: '🌟' };
;









;









































;


;
function runModById(id) { return RUN_MODS.find((m) => m.id === id) ?? null; }
function runModLootMult(id) {
  if (id === 'horde') return { pts: 1.2, drop: 1.2 };
  if (id === 'sterile') return { pts: 1.25, drop: 1 };
  if (id === 'muraille') return { pts: 1, drop: 1.5 };
  if (id === 'rage') return { pts: 1.4, drop: 1 };
  return { pts: 1, drop: 1 };
}

;




;




 




;





















;





;

;






;




;






;
;
;


;





const BAK_KEY = SAVE_KEY + '.bak';

function makeSafeStorage() {
  const mem = new Map();
  let real = null;
  try {
    const probe = '__fc__probe';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    real = window.localStorage;
  } catch (e) { real = null; }
  return {
    persistent: () => real !== null,
    getItem: (k) => {
      if (real) { try { return real.getItem(k); } catch (e) { } }
      return mem.has(k) ? mem.get(k) : null;
    },
    setItem: (k, v) => {
      const s = String(v);
      mem.set(k, s);
      if (real) { try { real.setItem(k, s); } catch (e) { } }
    },
    removeItem: (k) => {
      mem.delete(k);
      if (real) { try { real.removeItem(k); } catch (e) { } }
    },
  };
}
const storage = makeSafeStorage();



const xpToNext = (lvl) => lvl;
;
;
;
;
;
;
const freshGems = () => ({ brut: {}, poli: {}, grave: {}, eternel: {} });

let uiSeq = (Date.now() & 0x7fffffff) >>> 0;
function uiRand() {
  return roll();
}

function byIid(iid) {
  return store.instances.find((i) => i.iid === iid) ?? null;
}
function instsOf(id) {
  return store.instances.filter((i) => i.id === id);
}
function syncCount(id) {
  const n = instsOf(id).length;
  if (n > 0) store.collection.set(id, n);
  else store.collection.delete(id);
}
function newInst(id, lvl = 1, xp = 0) {
  const inst = { iid: store.instanceSeq++, id, lvl, xp, asc: 0, name: '', acc: [], isNew: true };
  store.instances.push(inst);
  syncCount(id);
  return inst;
}
function bestInstOf(id) {
  const list = instsOf(id);
  if (!list.length) return null;
  return list.reduce((a, b) => (b.lvl > a.lvl || (b.lvl === a.lvl && b.asc > a.asc) ? b : a));
}
function addXpI(iid, gain) {
  const inst = byIid(iid);
  if (!inst || !(gain > 0)) return { levels: 0, level: inst ? inst.lvl : 1 };
  let levels = 0;
  inst.xp += gain;
  while (inst.lvl < LEVEL_CAP && inst.xp >= xpToNext(inst.lvl)) {
    inst.xp -= xpToNext(inst.lvl);
    inst.lvl += 1;
    levels += 1;
  }
  if (inst.lvl >= LEVEL_CAP) inst.xp = Math.min(inst.xp, xpToNext(LEVEL_CAP) - 0.001);
  return { levels, level: inst.lvl };
}
function ensureDayBuckets() {
  const t = todayKey();
  if (store.fatigue.day !== t) store.fatigue = { day: t, runs: {} };
  if (store.dropFat.day !== t) store.dropFat = { day: t, dg: {} };
}
function xpMultFor(iid) {
  ensureDayBuckets();
  const n = store.fatigue.runs[iid] ?? 0;
  return Math.max(0.25, 1 - 0.1 * n);
}
function registerXpRun(iids) {
  ensureDayBuckets();
  for (const iid of iids) store.fatigue.runs[iid] = (store.fatigue.runs[iid] ?? 0) + 1;
}
function dropChance(dungeonId) {
  ensureDayBuckets();
  return Math.max(0.1, Math.pow(0.5, store.dropFat.dg[dungeonId] ?? 0));
}
function registerDrop(dungeonId) {
  ensureDayBuckets();
  store.dropFat.dg[dungeonId] = (store.dropFat.dg[dungeonId] ?? 0) + 1;
}
function addGem(tier, element, n = 1) {
  if (!GEM_TIERS.includes(tier)) return;
  store.gems[tier][element] = (store.gems[tier][element] ?? 0) + n;
}
function gemCount(tier, element) {
  return store.gems[tier]?.[element] ?? 0;
}
function spendGems(tier, element, n) {
  const have = gemCount(tier, element);
  if (have < n) return false;
  store.gems[tier][element] = have - n;
  return true;
}
function pierreCount() {
  return store.pierres ?? 0;
}
function addPierres(n = 1) {
  store.pierres = pierreCount() + n;
}
function grantToken(rar, cat) {
  store.tokens.push({ rar, cat });
}

function grantKindToken(kind, rar = 'C') {
  store.tokens.push({ rar, kind });
}


function cardAvailable(c) {
  if (!c.dungeon) return true;
  if (c.dungeon === 'divin') return dungeonUnlocked(dungeonById('zenith'));
  return dungeonUnlocked(dungeonById(c.dungeon));
}


function tokenTypeKey(t) {
  if (t.kind) return t.kind + ':' + (t.rar ?? 'C');
  if (t.cat === 'pers') return 'humain:' + (t.rar ?? 'C');
  return 'biome:' + t.cat + ':' + (t.rar ?? 'C');
}


function bossTokenFor(dungeonId) {
  // T1.3 : la table de rarete du jeton vit dans les data (decision 8 : communes au taux de reference, decroissant avec la rarete)
  const cleared = DUNGEONS.filter((d) => bestRecord(d.id) >= d.floors).length;
  return { kind: 'biome', cat: dungeonId, rar: jetonRarityFor(uiRand, cleared) };
}

function tokenLabel(t) {
  if (!t) return 'jeton';
  const rar = t.rar ?? 'C';
  if (t.kind === 'humain') return 'naissance humaine au hasard (rang N)';
  if (t.kind === 'humain-riche') return 'humain raffin\u00e9 (maillon d\u2019une voie, 15 % R)';
  if (t.kind === 'race') return 'les 4 races au tirage (naissance)';
  if (t.kind === 'monstre' || t.kind === 'mystique' || t.kind === 'divine') return `race ${t.kind} au tirage (naissance)`;
  if (t.kind === 'evolution') return `raccourci : palier ${rar} d\u2019une voie raciale`;
  if (t.kind === 'biome') return `biome ${dungeonById(t.cat)?.name ?? t.cat} (${rar})`;
  if (t.kind === 'non-humain') return 'race non humaine au tirage (naissance)';
  return t.cat === 'pers' ? `personnages humains (${rar})` : `biome ${dungeonById(t.cat)?.name ?? t.cat} (${rar})`;
}

; 
function maybeDropRegEclat(rng = uiRand, mult = 1) {
  if (rng() < (REG_ECLAT_RATE[store.diff - 1] ?? REG_ECLAT_RATE[0]) * mult) {
    store.regEclats = (store.regEclats ?? 0) + 1;
    return true;
  }
  return false;
}

const freshDiff = () => ({ stage: 1, record: 0, pity: {} });
const freshProg = () => ({ diff: 1, diffs: { 1: freshDiff(), 2: freshDiff(), 3: freshDiff(), 4: freshDiff(), 5: freshDiff() } });

const store = {
  teams: [
    { slots: [] }, 
    { slots: [] },
    { slots: [] },
  ],
  activeTeam: 0,
  grimoire: [],
  zonesVisitees: [],
  get team() {
    return this.teams[this.activeTeam];
  },
  dungeon: 'marees', 
  runMod: null, 
  progress: Object.fromEntries(DUNGEONS.map((d) => [d.id, freshProg()])),
  get diff() {
    return this.progress[this.dungeon].diff;
  },
  set diff(v) {
    const n = Math.max(1, Math.min(5, Number(v) || 1));
    this.progress[this.dungeon].diff = n;
  },
  get stage() {
    return this.progress[this.dungeon].diffs[this.diff].stage;
  },
  set stage(v) {
    this.progress[this.dungeon].diffs[this.diff].stage = v;
  },
  get record() {
    return this.progress[this.dungeon].diffs[this.diff].record;
  },
  set record(v) {
    this.progress[this.dungeon].diffs[this.diff].record = v;
  },
  get pity() {
    return this.progress[this.dungeon].diffs[this.diff].pity;
  },
  set pity(v) {
    this.progress[this.dungeon].diffs[this.diff].pity = v;
  },
  seed: 42,
  points: 0, 
  collection: new Map(), 
  instances: [], 
  instanceSeq: 1, 
  gems: freshGems(), 
  tokens: [], 
  fatigue: { day: '', runs: {} }, 
  dropFat: { day: '', dg: {} }, 
  milestones: { clear1: false, boss5: false, diff3: false }, 
  seen: [], 
  shards: {}, 
  saveBroken: false, 
  dailyDone: '', 
  dailyLevel: null, 
  defiActive: false, 
  regEclats: 0, 
  pierres: 0, 
};

function progOf(dungeonId, diff = 0) {
  const p = store.progress[dungeonId];
  return p.diffs[diff >= 1 && diff <= 5 ? diff : p.diff];
}

function bestRecord(dungeonId) {
  const p = store.progress[dungeonId];
  return Math.max(...Object.values(p.diffs).map((x) => x.record ?? 0));
}

function diffUnlocked(dungeonId, diff) {
  if (diff <= 1) return true;
  return progOf(dungeonId, diff - 1).record >= dungeonById(dungeonId).floors;
}

function dungeonUnlocked(d) {
  return !d.req || bestRecord(d.req) >= dungeonById(d.req).floors;
}

function premiumUnlocked() {
  return DUNGEONS.some((d) => bestRecord(d.id) >= d.floors);
}

function levelOf(id) {
  const b = bestInstOf(id);
  return b ? Math.min(LEVEL_CAP, Math.max(1, b.lvl)) : 1;
}

function xpOf(id) {
  const b = bestInstOf(id);
  if (!b) return 0;
  const lv = Math.min(b.lvl, LEVEL_CAP);
  return Math.max(0, Math.min(0.999, b.xp / xpToNext(lv)));
}

function addXp(id, gain) {
  const target = bestInstOf(id);
  if (!target || !(gain > 0)) return levelOf(id);
  const r = addXpI(target.iid, gain * xpToNext(Math.min(target.lvl, LEVEL_CAP)));
  save();
  return r.level;
}

function seenCard(id) {
  return store.seen.includes(id);
}

function markSeen(id) {
  if (!seenCard(id)) store.seen.push(id);
}

function snapshot() {
  return {
    version: SAVE_VERSION,
    teams: store.teams,
    activeTeam: store.activeTeam,
    dungeon: store.dungeon,
    progress: store.progress,
    seed: store.seed,
    points: store.points,
    collection: [...store.collection.entries()],
    instances: store.instances.map((i) => ({ ...i, acc: (i.acc ?? []).map((sp) => ({ ...sp })) })),
    instanceSeq: store.instanceSeq,
    gems: store.gems,
    tokens: store.tokens.map((t) => ({ ...t })),
    regEclats: store.regEclats,
    pierres: store.pierres ?? 0,
    fatigue: store.fatigue,
    dropFat: store.dropFat,
    milestones: { ...store.milestones },
    tokenDays: { ...(store.tokenDays ?? {}) },
    firstClearTokens: { ...(store.firstClearTokens ?? {}) },
    seen: [...store.seen],
    shards: store.shards,
    dailyDone: store.dailyDone,
    dailyLevel: store.dailyLevel,
    runMod: store.runMod ?? null,
    grimoire: [...(store.grimoire ?? [])],
    zonesVisitees: [...(store.zonesVisitees ?? [])],
  };
}

function restore(data) {
  if (!data || typeof data !== 'object' || !Number.isInteger(data.version) || data.version < 1 || data.version > CURRENT_VERSION) return false;
  if (!Array.isArray(data.teams) || data.teams.length !== 3) return false;
  store.teams = data.teams.map((t) => ({
    slots: Array.isArray(t?.slots)
      ? t.slots.filter((x) => typeof x === 'string' || Number.isInteger(x))
      : Array.isArray(t?.attaque) && Array.isArray(t?.support)
        ? [...t.attaque, ...t.support].filter((x) => typeof x === 'string')
        : [],
  }));
  if (!Array.isArray(data.collection)) return false;
  
  store.activeTeam = Number.isInteger(data.activeTeam) && data.activeTeam >= 0 && data.activeTeam < 3
    ? data.activeTeam : 0;
  store.seed = Number.isInteger(data.seed) ? data.seed : 42;
  store.collection = new Map(data.collection);
  store.dungeon = DUNGEONS.some((d) => d.id === data.dungeon) ? data.dungeon : 'marees';
  store.progress = Object.fromEntries(DUNGEONS.map((d) => [d.id, freshProg()]));
  if (data.version >= 4 && data.progress && typeof data.progress === 'object') {
    for (const d of DUNGEONS) {
      const p = data.progress[d.id];
      if (!p || typeof p !== 'object') continue;
      const tgt = store.progress[d.id];
      tgt.diff = Number.isInteger(p.diff) && p.diff >= 1 && p.diff <= 5 ? p.diff : 1;
      if (p.diffs && typeof p.diffs === 'object') {
        for (let n = 1; n <= 5; n++) {
          const q = p.diffs[n];
          if (!q || typeof q !== 'object') continue;
          tgt.diffs[n].stage = Number.isInteger(q.stage) ? Math.min(d.floors, Math.max(1, q.stage)) : 1;
          tgt.diffs[n].record = Number.isInteger(q.record) ? Math.min(d.floors, Math.max(0, q.record)) : 0;
          tgt.diffs[n].pity = typeof q.pity === 'object' && q.pity ? { ...q.pity } : {};
        }
      } else {
        tgt.diffs[1].stage = Number.isInteger(p.stage) ? Math.min(d.floors, Math.max(1, p.stage)) : 1;
        tgt.diffs[1].record = Number.isInteger(p.record) ? Math.min(d.floors, Math.max(0, p.record)) : 0;
        tgt.diffs[1].pity = typeof p.pity === 'object' && p.pity ? { ...p.pity } : {};
      }
    }
  } else if (data.progress && typeof data.progress === 'object') {
    for (const d of DUNGEONS) {
      const p = data.progress[d.id];
      if (!p || typeof p !== 'object') continue;
      const tgt = store.progress[d.id].diffs[1];
      tgt.stage = Number.isInteger(p.stage) ? Math.min(d.floors, Math.max(1, p.stage)) : 1;
      tgt.record = Number.isInteger(p.record) ? Math.min(d.floors, Math.max(0, p.record)) : 0;
      tgt.pity = typeof p.pity === 'object' && p.pity ? { ...p.pity } : {};
    }
  } else {
    const m = store.progress.marees.diffs[1];
    m.stage = Number.isInteger(data.stage) && data.stage >= 1 ? Math.min(10, data.stage) : 1;
    m.record = Number.isInteger(data.record) && data.record >= 0 ? Math.min(10, data.record) : 0;
    m.pity = typeof data.pity === 'object' && data.pity ? data.pity : {};
  }
  
  store.shards = {};
  if (typeof data.shards === 'object' && data.shards) {
    for (const k of Object.keys(FAMILIES)) {
      const v = Number(data.shards[k]);
      if (Number.isInteger(v) && v > 0) store.shards[k] = Math.min(SHARD_MAX, v);
    }
  }
  
  store.instances = [];
  store.instanceSeq = 1;
  store.gems = freshGems();
  store.tokens = [];
  store.fatigue = { day: '', runs: {} };
  store.dropFat = { day: '', dg: {} };
  store.milestones = { clear1: false, boss5: false, diff3: false };
  store.runMod = typeof data.runMod === 'string' && runModById(data.runMod) ? data.runMod : null;
  store.grimoire = Array.isArray(data.grimoire) ? data.grimoire.filter((g) => g && typeof g.sort === 'string') : [];
  store.zonesVisitees = Array.isArray(data.zonesVisitees) ? data.zonesVisitees.filter((z) => typeof z === 'string') : [];
  if (data.version >= 6 && Array.isArray(data.instances)) {
    for (const raw of data.instances) {
      if (!raw || typeof raw.id !== 'string' || !byId(raw.id)) continue;
      const inst = {
        iid: Number.isInteger(raw.iid) && raw.iid > 0 ? raw.iid : store.instanceSeq,
        id: raw.id,
        lvl: Math.min(LEVEL_CAP, Math.max(1, Number.isInteger(raw.lvl) ? raw.lvl : 1)),
        xp: Number.isFinite(raw.xp) ? Math.max(0, raw.xp) : 0,
        asc: Number.isFinite(raw.asc) ? Math.max(0, raw.asc) : 0,
        name: typeof raw.name === 'string' ? raw.name.slice(0, 24) : '',
        acc: Array.isArray(raw.acc) ? raw.acc.filter((sp) => sp && (typeof sp.name === 'string' || typeof sp.sort === 'string')) : [],
        voie: typeof raw.voie === 'string' ? raw.voie : undefined,
        agi: Number.isFinite(raw.agi) ? raw.agi : undefined,
        int: Number.isFinite(raw.int) ? raw.int : undefined,
        isNew: raw.isNew === true,
      };
      store.instanceSeq = Math.max(store.instanceSeq, inst.iid + 1);
      store.instances.push(inst);
    }
    if (data.gems && typeof data.gems === 'object') {
      for (const tier of GEM_TIERS) {
        const src = data.gems[tier];
        if (src && typeof src === 'object') {
          for (const [el, n] of Object.entries(src)) {
            const v = Number(n);
            if (Number.isInteger(v) && v > 0) store.gems[tier][el] = v;
          }
        }
      }
    }
    
    if (data.version < 8) {
      for (const tier of GEM_TIERS) {
        const g = store.gems[tier] ?? {};
        const d = g['Divin'] ?? 0;
        if (d > 0) {
          delete g['Divin'];
          g['Lumière'] = (g['Lumière'] ?? 0) + d;
        }
      }
    }
    store.regEclats = Number.isInteger(data.regEclats) ? Math.max(0, data.regEclats) : 0;
    store.pierres = Number.isInteger(data.pierres) ? Math.max(0, data.pierres) : 0;
    if (Array.isArray(data.tokens)) {
      for (const t of data.tokens) {
        if (t && typeof t === 'object' && typeof t.kind === 'string') store.tokens.push({ rar: t.rar ?? 'C', kind: t.kind });
        else if (t && typeof t === 'object' && typeof t.cat === 'string') store.tokens.push({ rar: t.rar ?? 'C', cat: t.cat });
      }
    }
    for (const [k, subKey] of [['fatigue', 'runs'], ['dropFat', 'dg']]) {
      const src = data[k];
      if (src && typeof src === 'object' && src.day && typeof src.day === 'string') {
        store[k] = { day: src.day };
        const sub = src[subKey];
        store[k][subKey] = {};
        if (sub && typeof sub === 'object') {
          for (const [kk, vv] of Object.entries(sub)) {
            const v = Number(vv);
            if (Number.isFinite(v) && v >= 0) store[k][subKey][kk] = v;
          }
        }
      }
    }
    if (data.milestones && typeof data.milestones === 'object') {
      for (const k of Object.keys(store.milestones)) store.milestones[k] = data.milestones[k] === true;
    }
    
    store.tokenDays = data.tokenDays && typeof data.tokenDays === 'object' ? { ...data.tokenDays } : {};
    store.firstClearTokens = data.firstClearTokens && typeof data.firstClearTokens === 'object' ? { ...data.firstClearTokens } : {};
  } else {
    
    for (const [id, n] of store.collection) {
      if (n <= 0 || !byId(id)) continue;
      let lv = 1;
      if (data.version === 1) {
        lv = 1 + (Number(data.levels?.[id]) || 0);
      } else if (data.version === 2) {
        const arr = data.copies?.[id];
        lv = Array.isArray(arr) && arr.length ? Math.max(1, Math.max(...arr)) : 1;
      } else {
        lv = Number.isInteger(data.levels?.[id]) && data.levels[id] >= 1 ? data.levels[id] : 1;
      }
      lv = Math.min(LEVEL_CAP, lv);
      for (let k = 0; k < n; k += 1) {
        const inst = newInst(id, k === 0 ? lv : 1);
        if (k === 0 && data.version >= 4) {
          const x = Number(data.xp?.[id]);
          if (Number.isFinite(x) && x > 0) inst.xp = Math.min(0.999, x) * xpToNext(lv);
        }
      }
    }
    store.milestones = { clear1: premiumUnlocked(), boss5: false, diff3: false };
  }
  
  {
    const assigned = new Set();
    for (const t of store.teams) {
      const kept = [];
      for (const x of t.slots) {
        if (Number.isInteger(x)) {
          if (byIid(x)) kept.push(x);
          continue;
        }
        const inst = instsOf(x).find((i) => !assigned.has(i.iid));
        if (inst) {
          assigned.add(inst.iid);
          kept.push(inst.iid);
        }
      }
      t.slots = kept;
    }
  }
  
  store.seen = Array.isArray(data.seen) ? [...new Set(data.seen)] : [];
  for (const id of store.collection.keys()) markSeen(id);
  
  if (Number.isInteger(data.points) && data.points >= 0) store.points = data.points;
  else store.points = 25 * Math.max(0, (data.stage ?? 1) - 1);
  store.dailyDone = typeof data.dailyDone === 'string' ? data.dailyDone : '';
  store.dailyLevel = data.dailyLevel && typeof data.dailyLevel === 'object' && Number.isFinite(data.dailyLevel.lvl)
    ? { day: String(data.dailyLevel.day ?? ''), lvl: Math.max(1, Math.round(data.dailyLevel.lvl)) }
    : null;
  store.defiActive = false;
  sanitizeTeams();
  return true;
}

function sanitizeTeams() {
  for (const t of store.teams) {
    const kept = [];
    const perId = new Map();
    const divFams = new Set();
    for (const x of t.slots) {
      if (kept.length >= 5) break;
      const inst = byIid(x);
      if (!inst) continue;
      const n = perId.get(inst.id) ?? 0;
      const owned = store.collection.get(inst.id) ?? 0;
      if (n >= Math.min(2, owned)) continue;
      const c = byId(inst.id);
      if (c && c.dungeon === 'divin') {
        if (divFams.has(c.fam) || divFams.size >= 3) continue;
        divFams.add(c.fam);
      }
      kept.push(x);
      perId.set(inst.id, n + 1);
    }
    t.slots = kept;
  }
}

function save() {
  try {
    const prev = storage.getItem(SAVE_KEY);
    const raw = JSON.stringify(snapshot());
    if (prev && prev !== raw) {
      try { storage.setItem(BAK_KEY, prev); } catch (e2) {  }
    }
    storage.setItem(SAVE_KEY, raw);
    store.saveBroken = false;
  } catch (e) {
    
    store.saveBroken = true;
  }
}

function load() {
  for (const key of [SAVE_KEY, BAK_KEY]) {
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      // flux reel : une sauvegarde v8 traverse les migrations v9 -> v12 avant restauration (EXI-SAVE-1)
      if (restore(migrate(JSON.parse(raw)))) return true;
    } catch (e) {
      
    }
  }
  return false;
}

function usedInTeam(id) {
  let n = 0;
  for (const t of store.teams) {
    for (const x of t.slots) {
      const inst = byIid(x);
      if (inst && inst.id === id) n += 1;
    }
  }
  return n;
}

function iidInTeam(iid) {
  for (const t of store.teams) {
    if (t.slots.includes(iid)) return true;
  }
  return false;
}

function freeCopies(id) {
  let n = 0;
  for (const inst of instsOf(id)) {
    if (!iidInTeam(inst.iid)) n += 1;
  }
  return n;
}

function grantCards(ids) {
  for (const id of ids) {
    if (!byId(id)) continue;
    newInst(id);
    markSeen(id);
  }
  save();
}




;

;






function evolveInstance(iid, targetId = null) {
  const inst = byIid(iid);
  if (!inst) return { ok: false, reason: 'Exemplaire introuvable.' };
  const cur = byId(inst.id);
  const targets = evoTargetsOf(inst.id);
  if (targetId && !targets.includes(targetId)) return { ok: false, reason: 'Cette voie d\u2019\u00e9volution n\u2019est pas ouverte pour cette carte.' };
  const nextId = targetId ?? targets[0] ?? null;
  if (!nextId) {
    return { ok: false, reason: cur.branch ? 'Une branche ne fait pas partie d’une chaîne d’évolution.' : 'Ce maillon est le sommet de sa lignée.' };
  }
  if (inst.lvl < 10) {
    return { ok: false, reason: `L’évolution exige le niveau 10 (celui-ci est niveau ${inst.lvl}) — l’XP vient des étages franchis en donjon.` };
  }
  const cost = evoCostOf(inst.id);
  if (!cost) return { ok: false, reason: 'Coût d’évolution inconnu pour cette rareté.' };
  const [tier, n] = cost;
  const isEveil = tier === 'pierre';
  const elt = cur.element ?? byId(nextId).element; 
  if (isEveil) {
    if (pierreCount() < n) {
      return { ok: false, reason: `Il faut ${n} pierre${n > 1 ? 's' : ''} d’éveil (vous en avez ${pierreCount()}) — les boss des donjons en lâchent rarement, le défi du jour en donne une.` };
    }
    store.pierres = pierreCount() - n;
  } else if (gemCount(tier, elt) < n) {
    return { ok: false, reason: `Il faut ${n} éclat${n > 1 ? 's' : ''} ${GEM_LABEL[tier]} d’élément ${elt} (vous en avez ${gemCount(tier, elt)}) — les boss des étages 5 et 10 en lâchent.` };
  }
  if (!isEveil) spendGems(tier, elt, n);
  const waitBonus = Math.round((inst.lvl - 10) * 5) / 10;
  inst.asc = Math.round((inst.asc + waitBonus) * 10) / 10;
  const oldSpells = (cur.spells ?? []).map((sp) => ({ ...sp }));
  if (oldSpells.length) inst.acc = [...(inst.acc ?? []), ...oldSpells];
  const prevId = inst.id;
  const eveil = eveilOf(prevId, nextId);
  if (eveil) applyTreeEveil(inst, eveil);
  else {
    inst.id = nextId;
    inst.lvl = 1;
    inst.xp = 0;
  }
  if (eveil && eveil.effet === 'remplace') {
    const retires = applyRemplace(store.instances, eveil, inst.iid);
    for (const iid of retires) {
      for (const t of store.teams) t.slots = (t.slots ?? []).filter((x) => x !== iid);
      store.instances = store.instances.filter((i) => i.iid !== iid);
    }
  }
  if (eveil && !inst.voie) inst.voie = eveil.voie;
  syncCount(prevId);
  syncCount(nextId);
  markSeen(nextId);
  save();
  return { ok: true, nextId, asc: inst.asc, inherited: inst.acc.length };
}

function useToken(idx) {
  const t = store.tokens[idx];
  if (!t) return { ok: false, reason: 'Jeton introuvable.' };
  const rar = t.rar ?? 'C';
  const inKind = (c) => cardAvailable(c) && !forgeOnly(c);
  
  const racialePool = (race, r) => CATALOG.filter((c) => c.raciale && c.rarity === r && raceOfCard(c) === race && inKind(c) && !c.archived);
  // rang N (phase 1) : un jeton de naissance tire le rang de la naissance de la race ;
  // les communes divines (Ange, Démon, Éveillé du Seuil) restent la porte divine jusqu'à l'Esprit Divin
  const naissRar = (race) => (race === 'divine' ? 'C' : 'N');
  
  const raccourciPool = (race, r) => {
    const set = new Set();
    for (const n of CATALOG.filter((c) => c.raciale && raceOfCard(c) === race)) {
      for (const f of formsOf(n.id)) set.add(f.to);
      for (const f of formsOf(n.id)) for (const f2 of formsOf(f.to)) set.add(f2.to);
      for (const f of formsOf(n.id)) for (const f2 of formsOf(f.to)) for (const f3 of formsOf(f2.to)) set.add(f3.to);
    }
    return [...set].map(byIdSoft).filter((c) => c && c.rarity === r && inKind(c) && raceOfCard(c) === race);
  };
  let pool = [];
  if (t.kind === 'humain' || (!t.kind && t.cat === 'pers')) {
    pool = racialePool('humaine', naissRar('humaine'));
  } else if (t.kind === 'humain-riche') {
    const drawRar = uiRand() < 0.15 ? 'R' : 'UC';
    pool = raccourciPool('humaine', drawRar);
  } else if (t.kind === 'race' || t.kind === 'non-humain') {
    const races = t.kind === 'race' ? RACES : ['monstre', 'mystique', 'divine'];
    const race = races[Math.floor(uiRand() * races.length)];
    pool = racialePool(race, naissRar(race));
    if (!pool.length) pool = raccourciPool(race, naissRar(race));
    if (!pool.length) pool = races.flatMap((r2) => racialePool(r2, naissRar(r2)));
  } else if (t.kind === 'monstre' || t.kind === 'mystique' || t.kind === 'divine') {
    pool = racialePool(t.kind, naissRar(t.kind));
    if (!pool.length) pool = raccourciPool(t.kind, naissRar(t.kind));
  } else if (t.kind === 'evolution') {
    pool = RACES.flatMap((r2) => raccourciPool(r2, rar));
    if (!pool.length) pool = RACES.flatMap((r2) => racialePool(r2, naissRar(r2)));
  } else {
    const dg = t.cat;
    pool = CATALOG.filter((c) => c.rarity === rar && c.dungeon === dg && inKind(c));
  }
  if (!pool.length) return { ok: false, reason: 'Aucune carte disponible pour ce jeton (biome verrouill\u00e9 ?).' };
  const chosen = pool[Math.floor(uiRand() * pool.length)];
  store.tokens.splice(idx, 1);
  grantCards([chosen.id]);
  return { ok: true, id: chosen.id };
}

function runAltar(rar, cat) {
  const nextRar = NEXT_RAR[rar];
  if (!nextRar) return { ok: false, reason: 'Les Légendaires sont le sommet de l’autel.' };
  const pool = store.instances.filter((i) => {
    if (iidInTeam(i.iid)) return false;
    const c = byId(i.id);
    if (!c || c.rarity !== rar) return false;
    return cat === 'pers' ? (!c.dungeon && c.family) : !!c.dungeon;
  });
  if (pool.length < 5) return { ok: false, reason: `Il faut 5 exemplaires libres de catégorie ${cat === 'pers' ? 'personnages' : 'monstres'} en ${rar}.` };
  pool.sort((a, b) => (a.lvl - b.lvl) || (a.iid - b.iid));
  const victims = pool.slice(0, 5);
  const weights = new Map();
  for (const v of victims) {
    const el = byId(v.id).element;
    weights.set(el, (weights.get(el) ?? 0) + 1);
  }
  const targets = cat === 'pers'
    ? CATALOG.filter((c) => c.rarity === nextRar && !c.dungeon && !c.branch && c.family)
    : CATALOG.filter((c) => c.rarity === nextRar && c.dungeon);
  if (!targets.length) return { ok: false, reason: 'Aucune carte de rareté supérieure dans cette catégorie.' };
  const total = [...weights.values()].reduce((a, b) => a + b, 0);
  let x = uiRand() * total;
  let elt = weights.keys().next().value;
  for (const [el, w] of weights) {
    x -= w;
    if (x <= 0) {
      elt = el;
      break;
    }
  }
  const favored = targets.filter((c) => c.element === elt);
  const src = favored.length ? favored : targets;
  const chosen = src[Math.floor(uiRand() * src.length)];
  for (const v of victims) {
    store.instances = store.instances.filter((i) => i.iid !== v.iid);
    syncCount(v.id);
  }
  grantCards([chosen.id]);
  return { ok: true, id: chosen.id, element: elt, nextRar };
}

function altarPoolCount(rar, cat) {
  let n = 0;
  for (const inst of store.instances) {
    if (iidInTeam(inst.iid)) continue;
    const c = byId(inst.id);
    if (!c || c.rarity !== rar) continue;
    if (cat === 'pers' ? (!c.dungeon && c.family) : !!c.dungeon) n += 1;
  }
  return n;
}

function addPoints(n) {
  store.points = Math.max(0, store.points + n);
  save();
  return store.points;
}


function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dailySeed() {
  const k = todayKey();
  let h = 7;
  for (const ch of k) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0;
  return h;
}

function waveSeedFor(dungeonId, diff) {
  const k = `${todayKey()}|${dungeonId}|${diff}`;
  let h = 7;
  for (const ch of k) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0;
  return h;
}
;



const routes = {};

function registerRoute(hash, fn) {
  routes[hash] = fn;
}

let suppressHash = false; 

function go(hash) {
  (routes[hash] || routes['#accueil'])(document.getElementById('app'));
  document.body.classList.toggle('in-combat', hash === '#combat');
  if (hash !== '#combat') closeActModal();
  updatePtsBadge();
  const nv = document.getElementById('main-nav');
  if (nv) nv.classList.remove('open');
  const mb = document.getElementById('menu-btn');
  if (mb) mb.textContent = '☰';
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('on', a.getAttribute('href') === hash);
  });
  try {
    if (location.hash !== hash) {
      suppressHash = true;
      location.hash = hash;
    }
  } catch (e) {
    
  }
}

function start() {
  document.querySelectorAll('nav a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      go(a.getAttribute('href'));
    });
  });
  const artSrcBtn = document.getElementById('art-src-btn');
  if (artSrcBtn) {
    artSrcBtn.title = 'Source des images : ' + ART_SRC_LABEL[artSrcKey()];
    artSrcBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchArtSrc();
    });
  }
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nv = document.getElementById('main-nav');
      if (!nv) return;
      const open = nv.classList.toggle('open');
      menuBtn.textContent = open ? '✕' : '☰';
    });
  }
  document.addEventListener('click', (e) => {
    const nv = document.getElementById('main-nav');
    if (nv && nv.classList.contains('open') && !e.target.closest('header') && !e.target.closest('nav')) {
      nv.classList.remove('open');
      if (menuBtn) menuBtn.textContent = '☰';
    }
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    go(a.getAttribute('href'));
  });
  window.addEventListener('hashchange', () => {
    if (suppressHash) {
      suppressHash = false;
      return;
    }
    go(location.hash);
  });
  go(location.hash || '#accueil');
}
;



const GLYPH = { Guerrier: '⚔', Mage: '✦', Prêtre: '✚', Assassin: '🗡', Occultiste: '🔮', Invocateur: '🕯️' };
const EL_GLYPH = { Neutre: '⚪', Feu: '🔥', Eau: '💧', Terre: '⛰', Ombre: '🌑', Lumière: '✨', Divin: '🌟' }
;



function onTap(el, { tap = null, long = null } = {}) {
  let timer = null;
  let startX = 0;
  let startY = 0;
  let moved = false;
  let done = false;
  el.addEventListener('pointerdown', (e) => {
    done = false;
    moved = false;
    startX = e.clientX ?? 0;
    startY = e.clientY ?? 0;
    if (long) {
      timer = setTimeout(() => {
        timer = null;
        done = true;
        long(e);
      }, 450);
    }
  });
  el.addEventListener('pointermove', (e) => {
    if (timer && (Math.abs((e.clientX ?? 0) - startX) > 12 || Math.abs((e.clientY ?? 0) - startY) > 12)) {
      clearTimeout(timer);
      timer = null;
      moved = true;
    }
  });
  const end = (e) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!done && !moved && tap) tap(e);
    done = false;
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    done = false;
  });
  
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

function toast(msg, cls = '') {
  let host = document.querySelector('.toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const t = document.createElement('div');
  t.className = `toast ${cls}`;
  t.textContent = msg;
  host.appendChild(t);
  setTimeout(() => t.classList.add('out'), 1500);
  setTimeout(() => t.remove(), 1950);
}

let saveWarnShown = false;
function updatePtsBadge() {
  const el = document.getElementById('pts');
  if (!el) return;
  if (storage.persistent && !storage.persistent()) {
    el.textContent = `💾 ⚡ ${store.points}`;
    el.title = 'Sauvegarde de session : la page ne peut pas écrire sur l\u2019appareil — exportez votre progression depuis l\u2019accueil pour la conserver.';
    if (!saveWarnShown) {
      saveWarnShown = true;
      toast('💾 Sauvegarde de session : cette page ne peut pas écrire sur l\u2019appareil. La progression tient pour la session — exportez un code de sauvegarde depuis l\u2019accueil pour la garder.', 'warn');
    }
  } else if (store.saveBroken) {
    el.textContent = `⚠️ ⚡ ${store.points}`;
    el.title = 'Sauvegarde impossible : la progression de cette session risque de ne pas être conservée.';
    if (!saveWarnShown) {
      saveWarnShown = true;
      toast('⚠️ Sauvegarde impossible — ta progression de cette session ne sera pas conservée si tu recharges la page.', 'warn');
    }
  } else {
    el.textContent = `⚡ ${store.points}`;
    el.title = '';
  }
}
;



const ART = {};

// v0.47.2 : deux sources d'illustrations au choix (manifeste DreamShaper XL ou WAI)
const ART_MANIFESTS = { dreamshaper: 'assets.json', wai: 'assets-wai.json' };
const ART_SRC_LABEL = { dreamshaper: 'DreamShaper XL', wai: 'WAI-Illustrious v17' };
function artSrcKey() {
  try {
    const k = storage.getItem('fondations-art-src');
    return ART_MANIFESTS[k] ? k : 'dreamshaper';
  } catch (e) { return 'dreamshaper'; }
}




function anyNewOf(id) {
  return instsOf(id).some((i) => i.isNew === true);
}

function clearNewOf(id) {
  for (const i of instsOf(id)) i.isNew = false;
}

function artOf(c) {
  const id = c ? (c.cardId ?? c.id) : null;
  if (id && ART[id]) return `<img class="art-img" src="${ART[id]}" alt="${c.name}" loading="lazy">`;
  return `<div class="glyph">${GLYPH[c.classe] ?? '★'}</div>`;
}

function hasArt(c) {
  const id = c ? (c.cardId ?? c.id) : null;
  return !!(id && ART[id]);
}

function setArt(id, url) {
  ART[id] = url;
}

function roleChip(role) {
  
  return '';
}

function cardFront(c, { badge = '', badgeClass = '', extraClass = '', locked = false } = {}) {
  const mana = c.manaMax !== undefined ? `<span class="mana">✦ ${c.mana}/${c.manaMax}</span>` : '';
  const maxHp = c.maxHp !== undefined ? `/${c.maxHp}` : '';
  const shield = c.shield > 0 ? `<span class="sh">🛡 ${c.shield}</span>` : '';
  const battle = extraClass.includes('battle');
  // pied de stats v2 (pions de combat) : PV, ATQ, mana en actuel/total + icônes d'état
  const st = c.status || {};
  const icons = [];
  if ((c.atkBuff ?? 0) > 0) icons.push('<span class="st-ic up">⬆</span>');
  if (st.curse || st.stun > 0 || st.slow > 0 || st.dmgRed) icons.push('<span class="st-ic down">⬇</span>');
  if (c.shield > 0) icons.push('<span class="st-ic sh">🛡</span>');
  const foot = battle
    ? `<div class="pied"><span class="hp">♥ ${c.hp}${maxHp}</span><span class="atk">⚔ ${c.atk}</span>${mana}${icons.join('')}</div>`
    : `<div class="cardfoot"><span>⚔ ${c.atk}</span>${shield}<span class="hp">♥ ${c.hp}${maxHp}</span>${mana}</div>`;
  return `<div class="card r-${c.rarity} t-${c.classe} ${c.element ? 'o-' + c.element : 'o-nul'} ${extraClass}${locked ? ' locked' : ''}">
    <div class="art">${artOf(c)}</div>
    <div class="rar-chip">${c.rarity}</div>
    ${c.level ? `<div class="lvl-chip">Nv ${c.level}</div>` : ''}
    ${badge ? `<div class="badge ${badgeClass}">${badge}</div>` : ''}
    <div class="cardbody">
      <div class="name">${c.name}</div>
      <div class="meta"><span>${GLYPH[c.classe] ?? ''} ${c.classe}</span>${c.element ? `<span>${EL_GLYPH[c.element] ?? ''} ${c.element}</span>` : '<span>⚪ Neutre</span>'}</div>
    </div>
    ${foot}
  </div>`;
}
;





const EXT = ["jpg", "png"];
const VID_EXT = ["mp4", "webm"];
const fxFound = {};

function slug(name) {
  return String(name).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function probeImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function probeVideo(url) {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadeddata = () => resolve(url);
    v.onerror = () => resolve(null);
    v.src = url;
  });
}

function applyManifest(m) {
  for (const [id, url] of Object.entries(m.art ?? {})) setArt(id, url);
  for (const d of DUNGEONS) {
    if (m.bg && m.bg[d.id]) d.art = m.bg[d.id];
  }
  for (const [s, url] of Object.entries(m.fx ?? {})) fxFound[s] = url;
}

async function probeCardArt(c) {
  for (const ext of EXT) {
    const url = await probeImage(`art/${c.id}.${ext}`);
    if (url) {
      setArt(c.id, url);
      return;
    }
  }
}

async function probeDungeonBg(d) {
  for (const ext of EXT) {
    const url = await probeImage(`bg/${d.id}.${ext}`);
    if (url) {
      d.art = url;
      return;
    }
  }
}

async function initAssets() {
  try {
    const res = await fetch(ART_MANIFESTS[artSrcKey()]);
    if (res.ok) {
      applyManifest(await res.json());
      return;
    }
  } catch (e) {
    
  }
  await Promise.all([...CATALOG.map(probeCardArt), ...DUNGEONS.map(probeDungeonBg)]);
}

// v0.47.2 : bascule la source d'images et re-rend la page courante
async function switchArtSrc() {
  const next = artSrcKey() === 'dreamshaper' ? 'wai' : 'dreamshaper';
  try { storage.setItem('fondations-art-src', next); } catch (e) { }
  for (const k of Object.keys(ART)) delete ART[k];
  for (const d of DUNGEONS) d.art = null;
  for (const k of Object.keys(fxFound)) delete fxFound[k];
  await initAssets();
  const b = document.getElementById('art-src-btn');
  if (b) {
    b.title = 'Source des images : ' + ART_SRC_LABEL[artSrcKey()];
    b.textContent = '🖼️';
  }
  go(location.hash || '#accueil');
  toast('🖼️ Illustrations : ' + ART_SRC_LABEL[artSrcKey()]);
}

async function probeFx(name) {
  const s = slug(name);
  if (fxFound[s]) return fxFound[s];
  for (const ext of VID_EXT) {
    const url = await probeVideo(`fx/${s}.${ext}`);
    if (url) {
      fxFound[s] = url;
      return url;
    }
  }
  return null;
}
;



function effetDesc(effect) {
  if (effect.kind === 'heal') return `Soigne ${effect.value} PV (la cible la plus bless\u00e9e).`;
  if (effect.kind === 'atkBuff') return `+${Math.round(effect.value * 100)} % ATK \u00e0 un attaquant pour 1 tour.`;
  if (effect.kind === 'shield') return `Ajoute ${effect.value} points de bouclier \u00e0 un attaquant.`;
  if (effect.kind === 'stun') return `\u00c9tourdit ${effect.count ?? 1} ennemi${(effect.count ?? 1) > 1 ? 's' : ''} parmi les plus dangereux pour 1 tour.`;
  if (effect.kind === 'slow') return `Ralentit toute l\u2019\u00e9quipe adverse : elle subit des frappes doubles pendant ${effect.turns ?? 1} tour(s).`;
  if (effect.kind === 'dot') return `Br\u00fble toute l\u2019\u00e9quipe adverse : ${Math.round((effect.pct ?? 0.4) * 100)} % de l\u2019ATQ du lanceur par tour pendant ${effect.turns ?? 2} tours.`;
  if (effect.kind === 'reflect') return `Toute l\u2019\u00e9quipe renvoie ${Math.round((effect.value ?? 0.25) * 100)} % des d\u00e9g\u00e2ts subis pendant ${effect.turns ?? 2} tours.`;
  if (effect.kind === 'warcry') return `Cri de guerre : vos attaquants gagnent de l\u2019ATQ et encaissent mieux pendant 1 tour.`;
  if (effect.kind === 'summon') return `Invoque ${effect.summonName ?? 'un sbire'} : ${Math.round((effect.value ?? 0.6) * 100)} % de l\u2019ATQ, ${Math.round((effect.hpPct ?? 0.5) * 100)} % des PV, ${effect.ttl ?? 3} tours de vie.`;
  if (effect.kind === 'revive') return `Ranime l\u2019alli\u00e9 tomb\u00e9 avec ${Math.round((effect.value ?? 0.5) * 100)} % de ses PV.`;
  if (effect.kind === 'link') return `Lie deux attaquants : soins et bonus partag\u00e9s \u00e0 moiti\u00e9.`;
  if (effect.kind === 'copy') return `Capture le dernier sort adverse jou\u00e9 dans un slot libre, puis le rejoue gratuitement.`;
  if (effect.kind === 'curse') return `Mal\u00e9diction : \u2212${Math.round(effect.value * 100)} % d\u2019ATQ \u00e0 l\u2019\u00e9quipe adverse pendant ${effect.turns ?? 2} tours (les boss r\u00e9sistent : effet r\u00e9duit de moiti\u00e9).`;
  return '';
}


function spellPowerLine(effect, mult) {
  const v = effect.value ?? 0;
  if (effect.kind === 'heal') return `soin \u00d7${mult} (base ${v} PV \u2192 ${Math.round(v * mult)} PV par lanc\u00e9)`;
  if (effect.kind === 'shield') return `bouclier \u00d7${mult} (base ${v} \u2192 ${Math.round(v * mult)} points)`;
  if (effect.kind === 'atkBuff') return `bonus \u00d7${mult} (base +${Math.round(v * 100)} % ATK \u2192 +${Math.round(v * mult * 100)} %)`;
  if (effect.kind === 'dot') return `br\u00fblure \u00d7${mult} : ${Math.round((effect.pct ?? 0.4) * 100)} % de l\u2019ATQ par tour, port\u00e9e \u00d7${mult}`;
  return `effet de rang \u00d7${mult} (la force de cet effet ne d\u00e9pend pas du rang)`;
}
function closeCardModal() {
  document.querySelector('.modal-overlay')?.remove();
  document.querySelector('.modal-close.floating')?.remove();
}

// v0.46.1 : le ✕ est épinglé au body (hors de .modal-overlay dont le backdrop-filter
// ferait bloc conteneur d'un position:fixed) — il reste visible même après défilement.
function pinModalClose(overlay) {
  document.querySelector('.modal-close.floating')?.remove();
  const mc = overlay.querySelector('.modal-close');
  if (mc) { mc.classList.add('floating'); document.body.appendChild(mc); }
}


function openRevealModal(cardIds, { title = 'Carte g\u00e9n\u00e9r\u00e9e !', note = 'Touchez la carte pour la r\u00e9v\u00e9ler.', subtitle = '', cta = 'Continuer', keepModal = false } = {}) {
  if (!keepModal) closeCardModal();
  const ids = (cardIds ?? []).filter((id) => byId(id));
  if (!ids.length) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal reveal-modal';
  box.innerHTML = `<h3>${title}</h3>${subtitle ? `<p class="muted">${subtitle}</p>` : ''}<p class="muted reveal-note">${note}</p><div class="reveal-stage"></div><div class="actions reveal-actions"></div>`;
  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  const stage = box.querySelector('.reveal-stage');
  const actions = box.querySelector('.reveal-actions');
  let revealed = 0;
  for (const id of ids) {
    const c = byId(id);
    const wrap = document.createElement('div');
    wrap.className = 'reveal-card';
    wrap.innerHTML = `<div class="reveal-inner"><div class="reveal-face reveal-back"><div class="reveal-sigil">✦</div><div class="reveal-backlabel">?</div></div><div class="reveal-face reveal-front">${cardFront(c, { extraClass: hasArt(c) ? 'unit-art' : '' })}</div></div>`;
    stage.appendChild(wrap);
    wrap.addEventListener('click', () => {
      if (wrap.classList.contains('flipped')) return;
      wrap.classList.add('flipped', `r-${c.rarity}`);
      revealed += 1;
      if (revealed >= ids.length) {
        const btn = document.createElement('button');
        btn.className = 'btn gold';
        btn.textContent = cta;
        btn.onclick = () => overlay.remove();
        actions.appendChild(btn);
        const nte = box.querySelector('.reveal-note');
        if (nte) nte.textContent = `${ids.map((i) => byId(i).name).join(' \u00b7 ')} \u2014 bien re\u00e7u !`;
      }
    });
  }
}

function spellList(card) {
  const level = levelOf(card.id);
  const xp = xpOf(card.id);
  if (!card.spells?.length) {
    const cross = card.role === 'support' ? CROSS.support : CROSS.attaque;
    const crossName = card.role === 'support' ? (card.soloSpell ?? cross.name) : cross.name;
    const crossRows = [
      `<li class="spell"><b>${crossName}</b>
        <span class="muted">\u2726 ${cross.cost} mana \u00b7 rendement ${Math.round(CROSS.yield * 100)} %</span>
        <span class="muted spell-desc">${cross.desc}</span></li>`,
    ];
    if (card.gimmickName) {
      crossRows.push(`<li class="spell"><b>\u2726 ${card.gimmickName}</b>
        <span class="muted">mécanisme exclusif</span>
        <span class="muted spell-desc">${card.gimmickDesc}</span></li>`);
    }
    return `<h4>Sorts croisés (rôle opposé)</h4>
    <ul class="spells">${crossRows.join('')}</ul>
    <p class="muted">Chaque compagnon porte aussi des sorts du rôle opposé, à rendement réduit : les attaquants veillent sur les blessés, les supports frappent quand personne n’a besoin de soins. Les compagnons supérieurs ajoutent un mécanisme exclusif.</p>
    <p class="statline">Niveau ${level} : +${(level - 1) * 8} % ATK et PV \u00b7 prochain niveau : <span class="xpbar"><span style="width: ${Math.round(xp * 100)}%"></span></span> ${Math.round(xp * 100)} %</p>`;
  }

  
  const stq = statsAt(card, level, 0);
  const rows = (card.effect
    ? [`<li class="spell"><b>\u2726 ${effetDesc(card.effect) || 'Effet sp\u00e9cial : voir le glossaire une fois cette carte rencontr\u00e9e.'}</b>
        <span class="muted">Pouvoir \u2014 automatique \u00e0 chaque action de la carte, sans mana</span></li>`]
    : [])
    .concat(card.spells
    .map(
      (s) => {
        const powerLine = card.role === 'support' && card.effect
          ? spellPowerLine(card.effect, s.mult)
          : `frappe \u00e0 ${Math.round(s.mult * 100)} % de l\u2019ATQ (\u2248 ${Math.max(1, Math.round(stq.atk * s.mult))} d\u00e9g\u00e2ts \u00e0 ce niveau)`;
        return `<li class="spell"><b>${s.name}</b>${s.cat ? ` <span class="spell-cat">${SPELL_CAT_LABEL[s.cat] ?? s.cat}</span>` : ''}
        <span class="muted">\u2726 ${s.cost} mana \u00b7 ${powerLine}</span>
        <span class="muted spell-desc">${s.desc}</span></li>`;
      },
    ))
    .join('');
  return `<h4>Sorts et pouvoir</h4>
    <p class="muted">Quand joue cette carte : \u00e0 chaque action, elle r\u00e9g\u00e9n\u00e8re son mana \u2726 puis lance automatiquement le sort le plus cher qu'elle peut payer (elle \u00e9pargne si son gros sort est proche). Le \u00ab rang \u00d7N \u00bb ci-dessous renforce l'effet du sort : ses d\u00e9g\u00e2ts s'il frappe, son soin s'il soigne. Le <b>Pouvoir</b> (marqu\u00e9 \u2726) est \u00e0 part : automatique \u00e0 chaque action, sans mana.</p>
    <ul class="spells">${rows}</ul>
    <p class="muted">R\u00e9serve : \u2726 ${card.mana} mana max, +${card.manaRegen} par action. Un maillon sup\u00e9rieur conna\u00eet les sorts des maillons pr\u00e9c\u00e9dents plus un sort puissant \u2014 mais chaque incantation vide la r\u00e9serve, et s\u2019il sent son gros sort proche, il \u00e9pargne son mana.</p>
    <p class="statline">Niveau ${level} : +${(level - 1) * 8} % ATK et PV \u00b7 prochain niveau : <span class="xpbar"><span style="width: ${Math.round(xp * 100)}%"></span></span> ${Math.round(xp * 100)} %</p>`;
}

function addStatus(id) {
  if (store.team.slots.length >= 5) return { ok: false, label: 'équipe pleine (5/5)' };
  const copies = usedInTeam(id);
  const owned = store.collection.get(id) ?? 0;
  if (copies >= 3) return { ok: false, label: 'déjà 3 exemplaires placés' };
  if (copies >= owned) return { ok: false, label: 'pas d\u2019autre exemplaire libre' };
  return { ok: true, label: `${store.team.slots.length}/5 dans l\u2019équipe` };
}

function evoStep(c, current) {
  const owned = store.collection.get(c.id) ?? 0;
  const known = owned > 0 || seenCard(c.id);
  if (known) {
    return `<button type="button" class="evo-step ${current ? 'current' : ''}" data-evo="${c.id}" title="Voir la fiche de ${c.name}">
      <span class="evo-art">${artOf(c)}</span>
      <span class="evo-rar">${c.rarity}</span>
      <span class="evo-name">${c.name}</span>
    </button>`;
  }
  return `<button type="button" class="evo-step mystery" data-evo="${c.id}" title="Encore \u00e0 d\u00e9voiler">
      <span class="evo-art locked-art">${GLYPH[c.classe] ?? '\u2754'}</span>
      <span class="evo-rar">${c.rarity}</span>
      <span class="evo-name">${c.name}</span>
    </button>`;
}

function openCardModal(card, { onAdd = null, onRemove = null, onChange = null, level = null } = {}) {
  closeCardModal();
  if (card && card.id && byId(card.id) && anyNewOf(card.id)) {
    clearNewOf(card.id);
    save();
    document.querySelectorAll(`[data-id="${card.id}"] .new-badge, [data-open="${card.id}"] .new-badge`).forEach((b) => b.remove());
  }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCardModal();
  });
  document.body.appendChild(overlay);
  renderCardModal(overlay, card, { onAdd, onRemove, onChange, level });
}

function renderCardModal(overlay, card, opts, feedbackText = '') {
  const { onAdd = null, onRemove = null, onChange = null, level: forcedLevel = null } = opts;
  const prevModal = overlay.querySelector('.modal');
  const scrollTop = prevModal ? prevModal.scrollTop : 0;
  const owned = store.collection.get(card.id) ?? 0;
  const wasSeen = seenCard(card.id);
  const level = forcedLevel ?? levelOf(card.id);
  const asc = bestInstOf(card.id)?.asc ?? 0;
  const mystery = owned === 0 && !wasSeen;
  const fam = familyOf(card);
  let evo = '';
  if (fam) {
    const topOwned = store.collection.get(fam.steps[fam.steps.length - 1]) > 0;
    const steps = fam.steps
      .map((id) => evoStep(byId(id), id === card.id))
      .join('<span class="evo-arrow">\u2192</span>');
    const future = (fam.future ?? []).length && topOwned
      ? `<span class="evo-arrow">\u2192</span>${fam.future.map((f) => `<span class="evo-step locked"><span class="evo-art locked-art">\ud83d\udd12</span><span class="evo-name">${f}</span></span>`).join('')}`
      : (fam.future ?? []).length
        ? `<span class="evo-arrow">\u2192</span>${fam.future.map(() => `<span class="evo-step locked"><span class="evo-art locked-art">\ud83d\udd12</span><span class="evo-name">???</span></span>`).join('')}`
        : '';
    evo = `<h4>${fam.name} \u2014 ligne d\u2019\u00e9volution</h4>
      <p class="evo">${steps}${future}</p>
      <p class="muted">L\u2019art d\u2019un maillon ne se r\u00e9v\u00e8le qu\u2019\u00e0 sa possession.</p>`;
  }
  const placed = usedInTeam(card.id) > 0;
  const free = freeCopies(card.id);
  let fusionBlock = '';
  
  if (owned > 0) {
    const targets = evoTargetsOf(card.id);
    if (targets.length) {
      const multi = targets.length > 1;
      const evolveBtns = instsOf(card.id).filter((inst) => inst.lvl >= 10).map((inst) => {
        const cost = evoCostOf(card.id);
        const [tier, nG] = cost ?? ['?', 0];
        const isEveil = tier === 'pierre';
        const gain = Math.max(0, Math.round((inst.lvl - 10) * 5) / 10);
        return targets.map((tid) => {
          const tgt = byId(tid);
          const elt = card.element ?? tgt.element; 
          const have = tier === '?' ? 0 : (isEveil ? pierreCount() : gemCount(tier, elt));
          const voie = evoVoieOf(card.id, tid);
          const costTxt = isEveil ? `${nG} pierre${nG > 1 ? 's' : ''} d\u2019\u00e9veil (${have}/${nG})` : `${nG} \u00e9clats ${GEM_LABEL[tier]} ${elt} (${have}/${nG})`;
          return `<button type="button" class="btn small ${have >= nG ? 'gold' : ''}" data-evolve-iid="${inst.iid}" data-evolve-to="${tid}">${isEveil ? '\u00c9veiller' : '\u00c9voluer'} l\u2019exemplaire Nv ${inst.lvl} \u2192 ${tgt.name}${voie ? ` (${voie})` : ''} : +${gain} % Ascendance \u00b7 ${costTxt}</button>`;
        }).join('');
      }).join('');
      fusionBlock = `<h4>${multi ? '\u00c9volution \u2014 le choix de la voie' : '\u00c9volution'}</h4>
      <div class="fusion-list">
        ${evolveBtns || `<button type="button" class="btn small" disabled>\u00c9voluer : niveau 10 requis + \u00e9clats d\u2019\u00e9volution \u2014 le dilemme de l\u2019Ascendance se joue \u00e0 la Forge</button>`}
      </div>
      ${multi ? `<p class="muted">Plusieurs voies s\u2019ouvrent \u2014 chaque bouton est une discipline diff\u00e9rente. Le choix est d\u00e9finitif pour CET exemplaire (une autre copie pourra prendre une autre voie) ; le novice sans \u00e9l\u00e9ment paie dans l\u2019\u00e9l\u00e9ment de la voie choisie.</p>` : ''}`;
    }
  }
  
  const st = onAdd ? addStatus(card.id) : null;
  const eclatBlock = ''; 
  let exemplairesBlock = '';
  if (owned > 0) {
    const rows = instsOf(card.id).map((inst) => {
      const pct = inst.lvl >= LEVEL_CAP ? 100 : Math.min(100, Math.round((inst.xp / xpToNext(inst.lvl)) * 100));
      return `<div class="inst-row">
        <span class="inst-lvl">Nv ${inst.lvl}${inst.lvl >= LEVEL_CAP ? ' MAX' : ` \u00b7 ${pct} %`}</span>
        ${inst.asc ? `<span class="chip">Asc +${inst.asc} %</span>` : ''}
        ${(inst.acc?.length ?? 0) ? `<span class="chip">\u2726 ${inst.acc.length} h\u00e9rit\u00e9${inst.acc.length > 1 ? 's' : ''}</span>` : ''}
        ${iidInTeam(inst.iid) ? '<span class="chip on">en \u00e9quipe</span>' : ''}
      </div>`;
    }).join('');
    exemplairesBlock = `<h4>Exemplaires (${instsOf(card.id).length})</h4>
      <p class="muted">Chaque exemplaire monte SES propres niveaux (1 \u00e0 20) en donjon : \u00e9tages franchis \u00d7 difficult\u00e9 \u00d7 1,5 si victoire, fatigue quotidienne par carte (plancher 25 %). L\u2019Ascendance se grave \u00e0 l\u2019\u00e9volution : +0,5 % de stats de base par niveau d\u2019attente au-dessus de 10, cumul\u00e9e \u00e0 chaque \u00e9volution. Chaque forme garde son nom de carte : l\u2019identit\u00e9 reste lisible.</p>
      <div class="inst-list">${rows}</div>`;
  }

  
  const bigCard = mystery
    ? `<div class="modal-card">${cardFront({ ...card, id: '?' + card.id, atk: '?', hp: '?' }, { extraClass: 'big mystery' })}</div>`
    : `<div class="modal-card">${cardFront({ ...card, level, ...statsAt(card, level, asc) }, { extraClass: 'big' + (hasArt(card) ? ' unit-art' : '') })}</div>`;
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" aria-label="Fermer">\u2716</button>
      ${bigCard}
      <div class="modal-info">
        <h3>${card.name}${!mystery ? ` <span class="lvl-chip">Nv ${level}</span>` : ''}</h3>
        <p class="muted">${card.rarity} \u00b7 ${card.classe} \u00b7 ${card.element ?? 'Neutre'}${owned ? ` \u00b7 poss\u00e9d\u00e9e \u00d7${owned}${placed ? ` (${usedInTeam(card.id)} en \u00e9quipe)` : ''}` : wasSeen ? ' \u00b7 plus poss\u00e9d\u00e9e' : ' \u00b7 pas encore d\u00e9voil\u00e9e'}</p>
        ${mystery
          ? `<p class="muted">Carte \u00e0 d\u00e9voiler : gagnez-la en donjon, \u00e0 l\u2019autel ou par un jeton pour r\u00e9v\u00e9ler son illustration, ses stats et ses sorts.</p>`
          : `<p class="statline">\u2694 Attaque <b>${statsAt(card, level, asc).atk}</b> &nbsp; \u2665 PV <b>${statsAt(card, level, asc).hp}</b>${level > 1 || asc ? ` <span class="muted">(base ${card.atk}/${card.hp} \u00b7 Nv ${level} : +${(level - 1) * 8} %${asc ? ` \u00b7 Ascendance +${asc} %` : ''})</span>` : ''}</p>
        <p class="statline">${RACE_GLYPH[raceOfCard(card)]} Race <b>${RACE_LABEL[raceOfCard(card)]}</b>${raceOfCard(card) === 'divine' ? ' \u2014 stats de base <b>+30 %</b> \u00b7 bonus d\u2019\u00e9quipe : d\u00e8s 2 divines en \u00e9quipe, +10 % d\u00e9g\u00e2ts et +10 % soins' : raceOfCard(card) === 'humaine' ? ' \u2014 la r\u00e9f\u00e9rence du jeu' : ` \u2014 stats de base <b>+${Math.round(RACE_MOD[raceOfCard(card)] * 100)} %</b> (r\u00e8gle de la race pour les nouvelles cartes et la r\u00e9gression)`}</p>
        ${card.verrou?.actif ? `<p class="statline">\u{1F512} Verrouill\u00e9e \u2014 ${card.verrou.condition ?? 'condition \u00e0 d\u00e9couvrir'}</p>` : ''}
        ${card.element ? `<p class="statline">Opposition : <b>${card.element} domine ${BEATS[card.element]}</b> et est dominé par <b>${BEATEN_BY[card.element]}</b> — frapper ce qu'on domine donne <b>+25 %</b> de dégâts (l'ennemi en profite aussi).</p>` : `<p class="statline">⚪ Neutre — hors oppositions : ni bonus ni malus. Les naissances raciales (Novices, Embryons, Enge, Éveillés du Seuil) naissent neutres ; l'élément arrive avec la voie choisie à l'évolution.</p>`}
        ${exemplairesBlock}
        ${spellList(card)}`}
        ${evo}
        ${fusionBlock}
        ${eclatBlock}
        ${mystery ? '' : `<div class="modal-actions">
          ${onAdd ? `<button class="btn ${st.ok ? '' : 'off'}" id="modal-add" ${st.ok ? '' : 'disabled'}>Ajouter \u00e0 l\u2019\u00e9quipe${st.ok ? '' : ` \u2014 ${st.label}`}</button>` : ''}
          ${onRemove && placed ? `<button class="btn" id="modal-rem">Retirer de l\u2019\u00e9quipe</button>` : ''}
        </div>`}
        <p class="modal-feedback" id="modal-feedback"></p>
      </div>
    </div>`;
  overlay.querySelector('.modal').scrollTop = scrollTop;
  overlay.querySelector('.modal-close').onclick = closeCardModal;
  pinModalClose(overlay);
  
  const refresh = (id, msg) => {
    renderCardModal(overlay, byId(id), opts, msg);
    onChange?.();
  };
  overlay.querySelectorAll('[data-evo]').forEach((el) => {
    el.onclick = () => refresh(el.dataset.evo, '');
  });
  const feedback = overlay.querySelector('#modal-feedback');
  if (feedbackText) feedback.textContent = feedbackText;
  overlay.querySelectorAll('[data-evolve-iid]').forEach((el) => {
    el.onclick = () => {
      const r = evolveInstance(Number(el.dataset.evolveIid), el.dataset.evolveTo ?? null);
      if (r.ok) {
        refresh(r.nextId, `\u2713 \u00c9volution : ${byId(r.nextId).name} ! Ascendance totale +${r.asc} %${r.inherited ? `, ${r.inherited} sort${r.inherited > 1 ? 's' : ''} h\u00e9rit\u00e9${r.inherited > 1 ? 's' : ''}` : ''}.`);
        openRevealModal([r.nextId], { title: '⭐ ÉVOLUTION !', subtitle: `Ascendance grav\u00e9e : +${r.asc} % de stats de base.`, note: 'Touchez la carte pour d\u00e9couvrir sa nouvelle forme.', cta: 'Continuer', keepModal: true });
      } else if (r.reason) {
        feedback.textContent = `\u2717 ${r.reason}`;
      }
    };
  });
  const addBtn = onAdd ? overlay.querySelector('#modal-add') : null;
  if (addBtn) {
    addBtn.onclick = () => {
      const res = onAdd();
      if (res?.ok) {
        feedback.textContent = '\u2713 Ajout\u00e9e \u00e0 l\u2019\u00e9quipe !';
        onChange?.();
        setTimeout(() => closeCardModal(), 550);
      } else if (res?.reason) {
        feedback.textContent = `\u2717 ${res.reason}`;
      }
    };
  }
  const rem = overlay.querySelector('#modal-rem');
  if (rem) {
    rem.onclick = () => {
      const res = onRemove();
      if (res?.ok) {
        feedback.textContent = '\u2713 Retir\u00e9e de l\u2019\u00e9quipe.';
        onChange?.();
        setTimeout(() => closeCardModal(), 450);
      } else if (res?.reason) {
        feedback.textContent = `\u2717 ${res.reason}`;
      }
    };
  }
}

function openSynergyModal() {
  closeCardModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const list = (types) =>
    types
      .map((t) => {
        const s = SYNERGIES[t];
        return `<div class="syn t1"><b>${t}</b><br>
          <span class="muted">Palier 1 (2 cartes) :</span> ${s[1].desc}<br>
          <span class="muted">Palier 2 (4 cartes) :</span> ${s[2].desc}</div>`;
      })
      .join('');
  overlay.innerHTML = `
    <div class="modal modal-syn">
      <button class="modal-close" aria-label="Fermer">\u2716</button>
      <div class="modal-info" style="grid-column: 1 / -1;">
        <h3>Synergies \u2014 comment \u00e7a marche ?</h3>
        <p><b>ATQ de l\u2019\u00e9quipe</b> (Guerrier, Eau, Lumi\u00e8re) augmente la <b>stat \u2694</b> affich\u00e9e sur vos cartes : c\u2019est le bonus le plus fr\u00e9quent. <b>D\u00e9g\u00e2ts finaux</b> (Mage, Ombre) s\u2019appliquent APR\u00c8S, sur chaque coup : ils multiplient tout, sorts compris. Les deux se cumulent en se multipliant : +10 % ATQ et +10 % d\u00e9g\u00e2ts = \u00d71,21 sur chaque attaque. Les soins, boucliers et r\u00e9ductions de d\u00e9g\u00e2ts fonctionnent \u00e0 part.</p>
        <p><b>Oppositions d\u2019\u00e9l\u00e9ments</b> (v0.20) : un <b>cercle</b> \u2014 le <b>Feu</b> domine la <b>Terre</b>, qui domine l\u2019<b>Eau</b>, qui domine le <b>Feu</b> ; la <b>Lumi\u00e8re</b> et l\u2019<b>Ombre</b> se dominent mutuellement. Celui qui frappe ce qu\u2019il domine gagne <b>+25 %</b> de d\u00e9g\u00e2ts \u2014 et l\u2019ennemi en profite autant que vous : regardez les \u00e9l\u00e9ments de la vague avant de composer. En combat, \u25b2 marque vos coups dominants sur l\u2019ennemi, \u25bc les coups ennemis qui dominent vos cartes.</p>
        <p>Chaque carte porte une <b>classe</b> et un <b>\u00e9l\u00e9ment</b>. Pour chaque type, on compte les cartes <b>uniques</b> de l\u2019\u00e9quipe : ${PALIERS[0]} cartes \u2192 palier 1, ${PALIERS[1]} cartes \u2192 palier 2. Deux exemplaires d\u2019une m\u00eame carte ne comptent qu\u2019une fois, mais les deux b\u00e9n\u00e9ficient des bonus.</p>
        <h4>Classes</h4>
        ${list(CLASSES)}
