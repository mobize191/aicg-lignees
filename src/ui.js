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
    const units = [...wave.avant, ...wave.arriere];
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
  // lot C5 : les ex-solos greffés (dans le "future" d'une famille, hors steps) gardent
  // leur fiche de solo (soloSpell, mana solo) ; seules les cartes des steps/branch prennent
  // les sorts de lignée de la famille
  const fam = c.family ? FAMILIES[c.family] : null;
  const inSteps = !!fam && (c.branch || fam.steps.includes(c.id));
  if (inSteps) {
    const t = fam.steps.indexOf(c.id);


    const tier = c.branch ? 3 : t;
    // recâblage famille → école : les sorts de lignée portent la clé d'école réelle de la famille
    const famSchoolKey = FAM_SCHOOL[c.family] ?? c.family;
    const famSchool = SCHOOLS[famSchoolKey] ?? {};
    // T2.7 (défaut acté) : une carte de famille connaît ses sorts de lignée, pas les communs
    c.spells = FAMILY_SPELLS[c.family].slice(0, tier + 1).map((sp) => ({ ...sp, cat: 'lignée', ecole: famSchoolKey, ...(famSchool.role ? { role: famSchool.role } : {}) }));
    c.mana = FAMILY_MANA[tier].max;
    c.manaRegen = FAMILY_MANA[tier].regen;
  } else {
    const raceSpell = c.raciale ? RACE_SPELLS[racialRaceOf(c)] : null;
    const classSpell = c.classe && CLASS_SPELLS[c.classe] ? CLASS_SPELLS[c.classe] : null;
    c.spells = [
      { ...COMMON_SPELLS[!!(c.effect && c.effect.kind === 'heal') ? 'support' : 'attaque'] },
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
const SLOTS_KEY = SAVE_KEY + '.slots';
const slotKey = (i) => SAVE_KEY + '.p' + i;
const slotBak = (i) => slotKey(i) + '.bak';
let slotsIndex = null;
let activeSlot = 0;

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



// boucle v2 lot 5 : courbe d'XP recalibrée sur l'échelle longue (25 marches) — croissance
// par niveau en données (XP_GROWTH), simulée au digest ; pas de gel à paliers (refusé)
const xpToNext = (lvl) => Math.max(1, Math.round(lvl * (1 + (M.XP_GROWTH ?? 0) * (lvl - 1))));
;
;
;
;
;
;
const freshGems = () => ({ brut: {}, poli: {}, grave: {}, eternel: {} });

// boucle v2 lot 4 : matériaux de zone, pièces d'équipement, bonus d'équipement (données equipment.json)
function addMateriau(id, n = 1) {
  store.materiaux[id] = (store.materiaux[id] ?? 0) + n;
}

function materiauCount(id) {
  return store.materiaux[id] ?? 0;
}

function addEquipmentPiece(id, n = 1) {
  if (!EQUIP_BY_ID[id]) return;
  store.equipment[id] = (store.equipment[id] ?? 0) + n;
}

function equipPieceCount(id) {
  return store.equipment[id] ?? 0;
}

// libellé d'un bonus de pièce d'équipement (data/equipment.json)
function bonusLabelOf(bonus) {
  if (!bonus?.stat) return '';
  if (bonus.stat === 'manaRegen') return `+${bonus.n ?? 0} régén mana`;
  const label = { atkPct: 'ATQ', hpPct: 'PV', agiPct: 'AGI', intPct: 'INT' }[bonus.stat] ?? bonus.stat;
  return `+${Math.round((bonus.pct ?? 0) * 100)} % ${label}`;
}

// bonus cumulé d'une carte équipée (arme + armure, bonus de set si même set) — à plat sur card.equip
function equipBonusOfCard(cardId) {
  const out = { atkPct: 0, hpPct: 0, agiPct: 0, intPct: 0, manaRegen: 0 };
  const eq = store.equip[cardId] ?? {};
  const pieces = [eq.arme, eq.armure].map((id) => EQUIP_BY_ID[id]).filter(Boolean);
  const sameSet = pieces.length === 2 && !!pieces[0].set && pieces[0].set === pieces[1].set;
  for (const p of pieces) {
    const pct = (p.bonus?.pct ?? 0) + (sameSet ? (SET_BONUS_PCT ?? 0) / 100 : 0);
    if (p.bonus?.stat === 'manaRegen') out.manaRegen += p.bonus.n ?? 0;
    else if (p.bonus?.stat) out[p.bonus.stat] = (out[p.bonus.stat] ?? 0) + pct;
  }
  return out;
}

// bonus des 2 slots d'équipe, appliqués à toute l'équipe
function equipTeamBonus() {
  const out = { atkPct: 0, hpPct: 0, agiPct: 0, intPct: 0, manaRegen: 0 };
  for (const id of store.equipTeam ?? []) {
    const p = EQUIP_BY_ID[id];
    if (!p) continue;
    if (p.bonus?.stat === 'manaRegen') out.manaRegen += p.bonus.n ?? 0;
    else if (p.bonus?.stat) out[p.bonus.stat] = (out[p.bonus.stat] ?? 0) + (p.bonus.pct ?? 0);
  }
  return out;
}

// pièces éligibles pour un slot donné d'une carte (possédées, non équipées ailleurs ici)
function eligiblePiecesFor(card, slot) {
  return EQUIPMENT.filter((p) => {
    if (p.slot !== slot) return false;
    if (slot === 'arme' && p.classe !== card.classe) return false;
    return equipPieceCount(p.id) > 0;
  });
}

function equipPiece(cardId, slot, pieceId) {
  const eq = store.equip[cardId] ?? (store.equip[cardId] = { arme: null, armure: null });
  if (pieceId && !EQUIP_BY_ID[pieceId]) return false;
  eq[slot] = pieceId;
  save();
  return true;
}

// tirage d'une pièce de set de zone pour un boss (niveau selon la difficulté, en données)
function bossPieceFor(dungeonId, diff) {
  const zone = getZone(`zone-${dungeonId}`);
  const tierIdx = BOSS_SET_TIER[String(diff)] ?? 0;
  const setId = `set-${dungeonId}`;
  const pool = EQUIPMENT.filter((p) => p.set === setId);
  if (!pool.length) return null;
  const niveaux = ['base', 'supérieure', 'royale'];
  const niv = niveaux[Math.min(tierIdx, niveaux.length - 1)];
  const tierPool = pool.filter((p) => p.id.includes(`-${niv}-`));
  const finalPool = tierPool.length ? tierPool : pool;
  return finalPool[Math.floor(uiRand() * finalPool.length)] ?? null;
}

// boucle v2 lot 1 : stock de potions et état de run (PV/mana persistants au sein d'un run)
const freshPotions = () => Object.fromEntries(Object.keys(POTIONS).map((k) => [k, 0]));

const freshRunState = () => ({ active: false, units: {} });

const potionCount = (id) => Math.max(0, store.potions[id] ?? 0);

const totalPotions = () => Object.keys(POTIONS).reduce((a, k) => a + potionCount(k), 0);

function addPotion(id, n = 1) {
  if (!POTIONS[id]) return;
  store.potions[id] = potionCount(id) + n;
}

function usePotionStock(id, n = 1) {
  if (potionCount(id) < n) return false;
  store.potions[id] = potionCount(id) - n;
  return true;
}

function buyPotion(id) {
  const p = POTIONS[id];
  if (!p) return false;
  if (store.gold < p.prix) { toast(`✗ Il faut ${p.prix} or pour ${p.nom}.`, 'warn'); return false; }
  store.gold -= p.prix;
  addPotion(id, 1);
  questProgress('acheter');
  save();
  updatePtsBadge();
  return true;
}

// économie v2 : achat d'un éclat brut d'élément choisi (calibrage v0 en data)
function buyEclat(element) {
  const prix = M.ECLAT_BUY_PRIX ?? 150;
  if (!ELEMENTS.includes(element)) return false;
  if (store.gold < prix) { toast(`✗ Il faut ${prix} or pour un éclat brut (${element}).`, 'warn'); return false; }
  store.gold -= prix;
  addGem('brut', element, 1);
  questProgress('acheter');
  save();
  updatePtsBadge();
  return true;
}

// économie v2 : achat d'une pièce d'équipement du rayon Boutique (source 'boutique' en data)
function buyEquipment(id) {
  const piece = EQUIP_BY_ID[id];
  if (!piece || piece.source !== 'boutique') return false;
  if (store.gold < piece.prix) { toast(`✗ Il faut ${piece.prix} or pour ${piece.nom}.`, 'warn'); return false; }
  store.gold -= piece.prix;
  addEquipmentPiece(id, 1);
  questProgress('acheter');
  save();
  updatePtsBadge();
  return true;
}

// reste code lot 7 : craft en ville — coût d'une pièce de set (table `craft` de data/equipment.json,
// matériaux de la zone + matière du boss pour les paliers hauts, or) ; null si pas craftable
function craftCostOf(piece) {
  if (!piece?.set || piece.source !== 'set') return null;
  const niveau = piece.id.split('-')[3];
  const c = DATA.equipment?.craft?.[niveau];
  if (!c) return null;
  const zone = (DATA.zones ?? []).find((z) => z.id === piece.zone);
  return {
    niveau,
    materiauId: zone?.materiau?.id, materiauNom: zone?.materiau?.nom, materiauN: c.materiau ?? 0,
    bossId: zone?.matiereBoss?.id, bossNom: zone?.matiereBoss?.nom, bossN: c.matiereBoss ?? 0,
    or: c.or ?? 0,
  };
}

function craftPiece(id) {
  const piece = EQUIP_BY_ID[id];
  const cost = craftCostOf(piece);
  if (!piece || !cost) return false;
  if (materiauCount(cost.materiauId) < cost.materiauN) { toast(`✗ Il faut ${cost.materiauN}× ${cost.materiauNom} (zone ${piece.zone.replace('zone-', '')}).`, 'warn'); return false; }
  if (cost.bossN > 0 && materiauCount(cost.bossId) < cost.bossN) { toast(`✗ Il faut ${cost.bossN}× ${cost.bossNom} (matière du boss du donjon de la zone).`, 'warn'); return false; }
  if (store.gold < cost.or) { toast(`✗ Il faut ${cost.or} or pour fabriquer ${piece.nom}.`, 'warn'); return false; }
  store.materiaux[cost.materiauId] -= cost.materiauN;
  if (cost.bossN > 0) store.materiaux[cost.bossId] -= cost.bossN;
  store.gold -= cost.or;
  addEquipmentPiece(id, 1);
  questProgress('craft');
  save();
  updatePtsBadge();
  return true;
}

// économie v2 lot E3 : Guilde — compagnons du jour (rotation déterministe, seed de la date)
function seedOfDay() {
  const k = todayKey();
  let h = 2166136261;
  for (let i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function compagnonPool() {
  const prix = GUILDE.prixCompagnons ?? {};
  return CATALOG.filter((c) => !c.monster && !c.archived && prix[c.rarity] != null);
}

function compagnonsDuJour() {
  const rng = mulberry32(seedOfDay());
  const pool = compagnonPool();
  const n = Math.min(GUILDE.nbOffresJour ?? 3, pool.length);
  const out = [];
  const used = new Set();
  while (out.length < n && used.size < pool.length) {
    const c = pool[Math.floor(rng() * pool.length)];
    if (used.has(c.id)) continue;
    used.add(c.id);
    out.push(c);
  }
  return out;
}

function compagnonPrix(card) {
  return GUILDE.prixCompagnons?.[card.rarity] ?? null;
}

function buyCompagnon(id) {
  const c = byId(id);
  const prix = c ? compagnonPrix(c) : null;
  if (!c || c.monster || prix == null) return false;
  const max = GUILDE.maxExemplaires ?? 3;
  if ((ownedOf(id) ?? 0) >= max) { toast(`✗ Déjà ${max} exemplaires de ${c.name}.`, 'warn'); return false; }
  if (store.gold < prix) { toast(`✗ Il faut ${prix} or pour recruter ${c.name}.`, 'warn'); return false; }
  store.gold -= prix;
  newInst(id, 1, 0);
  save();
  updatePtsBadge();
  return true;
}

// économie v2 lot E4 : quêtes quotidiennes (1 petite + 1 moyenne + 1 grande, seed de la date)
function quetesDuJour() {
  const rng = mulberry32(seedOfDay());
  const pick = (arr) => {
    const pool = (arr ?? []).filter((q) => !q.errance);
    return pool.length ? pool[Math.floor(rng() * pool.length)] : null;
  };
  const g = pick(QUETES.grandes);
  const bonusN = !!g && (seedOfDay() % (QUETES.grandeBonusN?.unJourSur ?? 3)) === 0;
  return [pick(QUETES.petites), pick(QUETES.moyennes), g].filter(Boolean)
    .map((q) => ({ ...q, progress: 0, done: false, bonusN: q === g && bonusN }));
}

function ensureQuetes() {
  if (store.quetes.day !== todayKey()) {
    store.quetes = { day: todayKey(), list: quetesDuJour(), bonusDone: false };
  }
  return store.quetes.list;
}

function questProgress(type, n = 1) {
  ensureQuetes();
  let changed = false;
  for (const q of store.quetes.list) {
    if (q.done || q.type !== type) continue;
    q.progress = Math.min(q.n, (q.progress ?? 0) + n);
    if (q.progress >= q.n) {
      q.done = true;
      changed = true;
      addGold(q.or ?? 0);
      let extra = `+${q.or ?? 0} 🪙 or`;
      if (q.eclat) { const el = ELEMENTS[Math.floor(uiRand() * ELEMENTS.length)]; addGem('brut', el, 1); extra += ` · +1 éclat brut (${el})`; }
      if (q.bonusN) { const c = drawDailyCommon(); grantCards([c.id]); extra += ` · ${RACE_GLYPH[raceOfCard(c)] ?? '🎴'} ${c.name} rejoint la collection`; }
      toast(`✓ Quête accomplie : ${q.label} — ${extra}`);
    }
  }
  if (changed) {
    const all = store.quetes.list.length > 0 && store.quetes.list.every((q) => q.done);
    if (all && !store.quetes.bonusDone) {
      store.quetes.bonusDone = true;
      const np = QUETES.bonusCompletion?.pierre ?? 1;
      addPierres(np);
      toast(`🏆 Toutes les quêtes du jour accomplies : +${np} pierre d'éveil !`);
    }
    save();
    updatePtsBadge();
  }
}

// économie v2 lot E2 : marchand de créatures — monstres non nommés, raretés vendues en data
function marchandMonsters() {
  const vendues = new Set(MARCHAND.raretesVendues ?? []);
  return allMonsters().filter((m) => vendues.has(m.rarity) && !(m.name ?? '').includes(','));
}

// contenu v3 lot C1 : marchand v2 (ACTÉ 11/11) — raretés débloquées par difficulté de donjon bouclée
function maxDiffBouclee() {
  let max = 0;
  for (const d of DUNGEONS) {
    for (const [k, p] of Object.entries(store.progress?.[d.id]?.diffs ?? {})) {
      if ((p.record ?? 0) >= d.floors) max = Math.max(max, Number(k) || 0);
    }
  }
  return max;
}

function marchandRareteDebloquee(rar) {
  const table = MARCHAND.debloqueParDiff ?? { C: 0 };
  return (table[rar] ?? 99) <= maxDiffBouclee();
}

function raretesMarchandDebloquees() {
  return (MARCHAND.raretesVendues ?? []).filter((r) => marchandRareteDebloquee(r));
}

// 3 offres du jour : rotation quotidienne déterministe (seedOfDay, comme la Guilde),
// tirées parmi les raretés débloquées
function offresMarchandDuJour() {
  const rng = mulberry32(seedOfDay());
  const debloquees = new Set(raretesMarchandDebloquees());
  const pool = marchandMonsters().filter((m) => debloquees.has(m.rarity));
  const n = Math.min(MARCHAND.nbOffresJour ?? 3, pool.length);
  const out = [];
  const used = new Set();
  while (out.length < n && used.size < pool.length) {
    const m = pool[Math.floor(rng() * pool.length)];
    if (used.has(m.id)) continue;
    used.add(m.id);
    out.push(m);
  }
  return out;
}

function marchandPrix(monstre) {
  return MARCHAND.prixParRarete?.[monstre.rarity] ?? null;
}

function buyMonster(id) {
  const m = allMonsters().find((x) => x.id === id);
  const prix = m ? marchandPrix(m) : null;
  if (!m || prix == null) return false;
  if (!marchandRareteDebloquee(m.rarity)) { toast(`🔒 ${m.rarity} verrouillée au marchand : bouclez un donjon dans la difficulté requise.`, 'warn'); return false; }
  const max = MARCHAND.maxExemplaires ?? 3;
  if ((ownedOf(id) ?? 0) >= max) { toast(`✗ Déjà ${max} exemplaires de ${m.name}.`, 'warn'); return false; }
  if (store.gold < prix) { toast(`✗ Il faut ${prix} or pour ${m.name}.`, 'warn'); return false; }
  store.gold -= prix;
  newInst(id, 1, 0);
  questProgress('recruter');
  save();
  updatePtsBadge();
  return true;
}

// PV/mana courants d'un exemplaire hors combat : persistés dans le run, à plein sinon
function curHpManaOf(iid) {
  const inst = byIid(iid);
  if (!inst) return null;
  const c = byId(inst.id);
  const st = statsAt(c, inst.lvl, inst.asc ?? 0);
  const mem = store.runState.active ? store.runState.units[iid] : null;
  return {
    hp: mem && Number.isFinite(mem.hp) ? Math.max(1, Math.min(st.hp, Math.round(mem.hp))) : st.hp,
    maxHp: st.hp,
    mana: mem && Number.isFinite(mem.mana) ? Math.max(0, Math.round(mem.mana)) : (c.mana ?? SOLO_MANA.max),
    manaMax: c.mana ?? SOLO_MANA.max,
  };
}

// soins complets : toute l'équipe repart à plein (entre deux runs, et hook autel de soin)
function healRunComplet() {
  store.runState = freshRunState();
  store.runState.active = true;
  save();
}

// hook « autel de soin » (errance-topdown §8) : soin complet + pas de grâce ; branché aux autels des zones quand l'errance arrive
function autelDeSoin() {
  healRunComplet();
  return { grace: AUTEL_SOIN_GRACE };
}

// applique l'état de run persisté aux unités du combat (PV/mana conservés d'un étage à l'autre)
function applyRunStateTo(state) {
  if (!store.runState.active) return;
  const iids = [...store.team.slots].filter(Boolean);
  const units = [...state.team.avant, ...state.team.arriere];
  iids.forEach((iid, k) => {
    const u = units[k];
    const mem = store.runState.units[iid];
    if (!u || !mem) return;
    if (Number.isFinite(mem.hp)) u.hp = Math.max(1, Math.min(u.maxHp, Math.round(mem.hp)));
    if (Number.isFinite(mem.mana)) u.mana = Math.max(0, Math.min(u.manaMax, Math.round(mem.mana)));
  });
}

// persiste les PV/mana restants à la fin d'un combat gagné (effets temporaires dissous au passage)
function persistRunStateFrom(state) {
  store.runState.active = true;
  const iids = [...store.team.slots].filter(Boolean);
  const units = [...state.team.avant, ...state.team.arriere];
  iids.forEach((iid, k) => {
    const u = units[k];
    if (!u) return;
    store.runState.units[iid] = { hp: u.hp, mana: u.mana };
  });
}

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
function cardAvailable(c) {
  if (!c.dungeon) return true;
  if (c.dungeon === 'divin') return dungeonUnlocked(dungeonById('zenith'));
  return dungeonUnlocked(dungeonById(c.dungeon));
}


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
    { slots: [], formation: '3-2' },
    { slots: [], formation: '3-2' },
    { slots: [], formation: '3-2' },
  ],
  activeTeam: 0,
  grimoire: [],
  zonesVisitees: [],
  zonesUnlocked: [],
  errance: null,
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
  gold: 0,
  potions: freshPotions(),
  runState: freshRunState(),
  departFait: false,
  materiaux: {},
  equipment: {},
  equip: {},
  equipTeam: [null, null],
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
  quetes: { day: '', list: [], bonusDone: false },
  dailyLevel: null, 
  defiActive: false, 
  regEclats: 0, 
  pierres: 0, 
};

function resetStore() {
  store.teams = [
    { slots: [], formation: '3-2' },
    { slots: [], formation: '3-2' },
    { slots: [], formation: '3-2' },
  ];
  store.activeTeam = 0;
  store.grimoire = [];
  store.zonesVisitees = [];
  store.zonesUnlocked = [];
  store.errance = null;
  store.dungeon = 'marees';
  store.runMod = null;
  store.progress = Object.fromEntries(DUNGEONS.map((d) => [d.id, freshProg()]));
  store.seed = 42;
  store.gold = 0;
  store.potions = freshPotions();
  store.runState = freshRunState();
  store.departFait = false;
  store.materiaux = {};
  store.equipment = {};
  store.equip = {};
  store.equipTeam = [null, null];
  store.collection = new Map();
  store.instances = [];
  store.instanceSeq = 1;
  store.gems = freshGems();
  store.tokens = [];
  store.fatigue = { day: '', runs: {} };
  store.dropFat = { day: '', dg: {} };
  store.milestones = { clear1: false, boss5: false, diff3: false };
  store.seen = [];
  store.shards = {};
  store.saveBroken = false;
  store.dailyDone = '';
  store.quetes = { day: '', list: [], bonusDone: false };
  store.dailyLevel = null;
  store.defiActive = false;
  store.regEclats = 0;
  store.pierres = 0;
}

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
    gold: store.gold,
    potions: { ...store.potions },
    runState: { active: !!store.runState.active, units: { ...(store.runState.units ?? {}) } },
    departFait: !!store.departFait,
    materiaux: { ...(store.materiaux ?? {}) },
    equipment: { ...(store.equipment ?? {}) },
    equip: JSON.parse(JSON.stringify(store.equip ?? {})),
    equipTeam: [...(store.equipTeam ?? [null, null])],
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
    quetes: { day: store.quetes?.day ?? '', list: (store.quetes?.list ?? []).map((q) => ({ ...q })), bonusDone: !!store.quetes?.bonusDone },
    dailyLevel: store.dailyLevel,
    runMod: store.runMod ?? null,
    grimoire: [...(store.grimoire ?? [])],
    zonesVisitees: [...(store.zonesVisitees ?? [])],
    zonesUnlocked: [...(store.zonesUnlocked ?? [])],
    errance: store.errance ? { zone: store.errance.zone, x: store.errance.hero?.x, y: store.errance.hero?.y, grace: store.errance.grace, steps: store.errance.steps, looted: [...(store.errance.looted ?? [])], broken: [...(store.errance.broken ?? [])] } : null,
  };
}

function restore(data) {
  if (!data || typeof data !== 'object' || !Number.isInteger(data.version) || data.version < 1 || data.version > CURRENT_VERSION) return false;
  if (!Array.isArray(data.teams) || data.teams.length !== 3) return false;
  store.teams = data.teams.map((t) => ({
    slots: Array.isArray(t?.slots)
      ? t.slots.filter((x) => typeof x === 'string' || Number.isInteger(x))
      : Array.isArray(t?.avant) && Array.isArray(t?.arriere)
        ? [...t.avant, ...t.arriere].filter((x) => typeof x === 'string')
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

  store.zonesUnlocked = Array.isArray(data.zonesUnlocked) ? data.zonesUnlocked.filter((z) => typeof z === 'string') : [];

  store.errance = null; // reconstruit à l'entrée de la zone (la carte est régénérée depuis le seed)
  // refonte errance lot 3 : position héros persistée rechargée (secourue à l'entrée de zone si besoin)
  store.erranceSavedPos = (data.errance && typeof data.errance === 'object' && typeof data.errance.zone === 'string'
    && Number.isFinite(data.errance.x) && Number.isFinite(data.errance.y))
    ? { zone: data.errance.zone, x: data.errance.x, y: data.errance.y } : null;

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
  
  if (Number.isInteger(data.gold) && data.gold >= 0) store.gold = data.gold;
  else if (Number.isInteger(data.points) && data.points >= 0) store.gold = data.points * OR_PER_POINT;
  else store.gold = 25 * Math.max(0, (data.stage ?? 1) - 1);
  store.potions = freshPotions();
  if (data.potions && typeof data.potions === 'object') {
    for (const k of Object.keys(POTIONS)) {
      if (Number.isInteger(data.potions[k]) && data.potions[k] >= 0) store.potions[k] = data.potions[k];
    }
  }
  store.runState = freshRunState();
  if (data.runState && typeof data.runState === 'object') {
    store.runState.active = !!data.runState.active;
    if (data.runState.units && typeof data.runState.units === 'object') store.runState.units = { ...data.runState.units };
  }
  store.departFait = !!data.departFait;
  store.materiaux = (data.materiaux && typeof data.materiaux === 'object') ? { ...data.materiaux } : {};
  store.equipment = (data.equipment && typeof data.equipment === 'object') ? { ...data.equipment } : {};
  store.equip = (data.equip && typeof data.equip === 'object') ? { ...data.equip } : {};
  store.equipTeam = Array.isArray(data.equipTeam) && data.equipTeam.length === 2 ? [...data.equipTeam] : [null, null];
  store.dailyDone = typeof data.dailyDone === 'string' ? data.dailyDone : '';
  store.quetes = (data.quetes && typeof data.quetes === 'object')
    ? { day: String(data.quetes.day ?? ''), list: Array.isArray(data.quetes.list) ? data.quetes.list.filter((q) => q && q.id).map((q) => ({ ...q })) : [], bonusDone: !!data.quetes.bonusDone }
    : { day: '', list: [], bonusDone: false };
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

function defaultSlotName(i) {
  return 'Partie ' + (i + 1);
}

function freshSlotsIndex(active) {
  return { active, slots: Array.from({ length: SAVE_SLOTS }, () => null) };
}

function readSlotsIndex() {
  try {
    const raw = storage.getItem(SLOTS_KEY);
    if (!raw) return null;
    const idx = JSON.parse(raw);
    if (!idx || typeof idx !== 'object' || !Array.isArray(idx.slots) || idx.slots.length !== SAVE_SLOTS) return null;
    idx.slots = idx.slots.map((s) => (s && typeof s === 'object' ? s : null));
    idx.active = Number.isInteger(idx.active) && idx.active >= 0 && idx.active < SAVE_SLOTS ? idx.active : 0;
    return idx;
  } catch (e) {
    return null;
  }
}

function writeSlotsIndex() {
  try { storage.setItem(SLOTS_KEY, JSON.stringify(slotsIndex)); } catch (e) {  }
}

function ensureSlotsIndex() {
  if (!slotsIndex) slotsIndex = readSlotsIndex() || freshSlotsIndex(activeSlot);
  if (!Number.isInteger(activeSlot) || activeSlot < 0 || activeSlot >= SAVE_SLOTS) activeSlot = 0;
}

function slotSummary() {
  let lvl = 0;
  try { lvl = teamLevel(); } catch (e) {  }
  return { gold: store.gold | 0, dungeon: store.dungeon, stage: store.stage, teamLevel: lvl };
}

function updateSlotEntry(i) {
  const prev = slotsIndex.slots[i];
  slotsIndex.slots[i] = {
    name: (prev && prev.name) || defaultSlotName(i),
    version: SAVE_VERSION,
    date: new Date().toISOString(),
    summary: slotSummary(),
  };
}

function save() {
  try {
    ensureSlotsIndex();
    const key = slotKey(activeSlot);
    const prev = storage.getItem(key);
    const raw = JSON.stringify(snapshot());
    if (prev && prev !== raw) {
      try { storage.setItem(slotBak(activeSlot), prev); } catch (e2) {  }
    }
    storage.setItem(key, raw);
    updateSlotEntry(activeSlot);
    writeSlotsIndex();
    store.saveBroken = false;
  } catch (e) {
    store.saveBroken = true;
  }
}

function tryRestoreKey(key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return false;
    // flux reel : une sauvegarde v8 traverse les migrations v9 -> v12 avant restauration (EXI-SAVE-1)
    return restore(migrate(JSON.parse(raw)));
  } catch (e) {
    return false;
  }
}

function load() {
  const idx = readSlotsIndex();
  if (idx) {
    slotsIndex = idx;
    activeSlot = idx.active;
    const order = [idx.active];
    for (let i = 0; i < SAVE_SLOTS; i++) if (i !== idx.active) order.push(i);
    for (const i of order) {
      if (tryRestoreKey(slotKey(i)) || tryRestoreKey(slotBak(i))) {
        activeSlot = i;
        slotsIndex.active = i;
        writeSlotsIndex();
        return true;
      }
    }
    // repli securite : index present mais aucun slot lisible -> cles historiques
    if (tryRestoreKey(SAVE_KEY) || tryRestoreKey(BAK_KEY)) {
      writeSlotsIndex();
      return true;
    }
    return false;
  }
  // migration sans perte : pas d'index + cle historique -> la sauvegarde actuelle devient la Partie 1 (p0)
  for (const key of [SAVE_KEY, BAK_KEY]) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    if (!tryRestoreKey(key)) continue;
    activeSlot = 0;
    slotsIndex = freshSlotsIndex(0);
    storage.setItem(slotKey(0), raw);
    const bakRaw = storage.getItem(BAK_KEY);
    if (bakRaw && bakRaw !== raw) {
      try { storage.setItem(slotBak(0), bakRaw); } catch (e2) {  }
    }
    updateSlotEntry(0);
    slotsIndex.slots[0].name = 'Partie 1';
    writeSlotsIndex();
    return true;
  }
  slotsIndex = freshSlotsIndex(0);
  activeSlot = 0;
  writeSlotsIndex();
  return false;
}

function listSlots() {
  ensureSlotsIndex();
  return slotsIndex.slots.map((s, i) => ({
    index: i,
    active: i === activeSlot,
    empty: !s,
    name: (s && s.name) || defaultSlotName(i),
    version: s ? s.version ?? null : null,
    date: s ? s.date ?? null : null,
    summary: s ? s.summary ?? null : null,
  }));
}

function switchToSlot(i) {
  if (!Number.isInteger(i) || i < 0 || i >= SAVE_SLOTS) return false;
  save();
  ensureSlotsIndex();
  if (!tryRestoreKey(slotKey(i)) && !tryRestoreKey(slotBak(i))) return false;
  activeSlot = i;
  slotsIndex.active = i;
  writeSlotsIndex();
  return true;
}

function newSlot(i, name) {
  if (!Number.isInteger(i) || i < 0 || i >= SAVE_SLOTS) return false;
  save();
  ensureSlotsIndex();
  activeSlot = i;
  slotsIndex.active = i;
  slotsIndex.slots[i] = { name: String(name ?? '').trim().slice(0, 24) || defaultSlotName(i) };
  writeSlotsIndex();
  resetStore();
  store.departFait = false;
  save();
  return true;
}

function renameSlot(i, name) {
  ensureSlotsIndex();
  if (!Number.isInteger(i) || i < 0 || i >= SAVE_SLOTS || !slotsIndex.slots[i]) return false;
  const n = String(name ?? '').trim().slice(0, 24);
  if (!n) return false;
  slotsIndex.slots[i].name = n;
  writeSlotsIndex();
  return true;
}

function deleteSlot(i) {
  ensureSlotsIndex();
  if (!Number.isInteger(i) || i < 0 || i >= SAVE_SLOTS) return false;
  const wasActive = slotsIndex.active === i;
  storage.removeItem(slotKey(i));
  storage.removeItem(slotBak(i));
  slotsIndex.slots[i] = null;
  if (wasActive) {
    const next = slotsIndex.slots.findIndex((s) => !!s);
    activeSlot = next >= 0 ? next : 0;
    slotsIndex.active = activeSlot;
    if (next >= 0) {
      if (!tryRestoreKey(slotKey(next)) && !tryRestoreKey(slotBak(next))) {
        resetStore();
        store.departFait = false;
      }
    } else {
      resetStore();
      store.departFait = false;
    }
  }
  writeSlotsIndex();
  return true;
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
      return { ok: false, reason: `Il faut ${n} pierre${n > 1 ? 's' : ''} d’éveil (vous en avez ${pierreCount()}) — les boss des donjons en lâchent rarement, les quêtes quotidiennes en donnent.` };
    }
    store.pierres = pierreCount() - n;
  } else if (gemCount(tier, elt) < n) {
    return { ok: false, reason: `Il faut ${n} éclat${n > 1 ? 's' : ''} ${GEM_LABEL[tier]} d’élément ${elt} (vous en avez ${gemCount(tier, elt)}) — les boss des étages 5 et 10 en lâchent.` };
  }
  if (!isEveil) spendGems(tier, elt, n);
  const waitBonus = Math.round((inst.lvl - 10) * 5) / 10;
  inst.asc = Math.round((inst.asc + waitBonus) * 10) / 10;
  const oldSpells = unknownSpellsOf((cur.spells ?? []).map((sp) => ({ ...sp })), byId(nextId)?.spells, inst.acc);
  if (oldSpells.length) inst.acc = [...(inst.acc ?? []), ...oldSpells];
  const prevId = inst.id;
  const eveil = eveilOf(prevId, nextId);
  if (eveil) applyTreeEveil(inst, eveil);
  else {
    // boucle v2 lot 5 : palier sans perte nette — bonus calculé depuis les données
    inst.noLoss = noLossPctOf(cur, byId(nextId));
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

function addGold(n) {
  store.gold = Math.max(0, store.gold + Math.round(n * OR_PER_POINT));
  save();
  return store.gold;
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
    el.textContent = `💾 🪙 ${store.gold} or`;
    el.title = 'Sauvegarde de session : la page ne peut pas écrire sur l\u2019appareil — exportez votre progression depuis l\u2019accueil pour la conserver.';
    if (!saveWarnShown) {
      saveWarnShown = true;
      toast('💾 Sauvegarde de session : cette page ne peut pas écrire sur l\u2019appareil. La progression tient pour la session — exportez un code de sauvegarde depuis l\u2019accueil pour la garder.', 'warn');
    }
  } else if (store.saveBroken) {
    el.textContent = `⚠️ 🪙 ${store.gold} or`;
    el.title = 'Sauvegarde impossible : la progression de cette session risque de ne pas être conservée.';
    if (!saveWarnShown) {
      saveWarnShown = true;
      toast('⚠️ Sauvegarde impossible — ta progression de cette session ne sera pas conservée si tu recharges la page.', 'warn');
    }
  } else {
    el.textContent = `🪙 ${store.gold} or`;
    el.title = '';
  }
}
;



const ART = {};

// v1.28 : campagne AICG V3 (WAI-Illustrious v17, vague 3) = source par défaut (v3.0).
// v1.33 : la relance 3.1 (verrous R8/R9/R10) est ajoutée en doublon commutable via le bouton 🖼️ (v3.1).
// Les anciens manifests (DreamShaper XL, WAI v2) sont archivés dans archives/assets/.
// Les assets existant uniquement en 3.1 (7 cartes série 3 + 90 équipements) sont aussi dans v3.0 : par défaut partout.
const ART_MANIFESTS = { v3: 'assets-v3.json', v31: 'assets-v3.1.json' };
const ART_SRC_LABEL = { v3: 'AICG Lignées V3.0 (WAI-Illustrious v17 — vague 3)', v31: 'AICG Lignées V3.1 (verrous 3.1 — relance complète)' };
function artSrcKey() {
  try {
    const k = storage.getItem('fondations-art-src');
    return ART_MANIFESTS[k] ? k : 'v3';
  } catch (e) { return 'v3'; }
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
  const keys = Object.keys(ART_MANIFESTS);
  const next = keys[(keys.indexOf(artSrcKey()) + 1) % keys.length];
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

// v0.48 : sonde par id de fx (fx-*.webm rendus dans site-assets/fx/) ; mise en cache
async function probeFxId(fxId) {
  if (fxFound[fxId]) return fxFound[fxId];
  const url = await probeVideo(`fx/${fxId}.webm`);
  if (url) fxFound[fxId] = url;
  return url;
}

function fxOn() {
  try { return storage.getItem('aicg-fx') !== 'off'; } catch (e) { return true; }
}

// v0.48 : joue la vidéo du sort signature au-dessus du plateau ; fallback = le bandeau image existant
// une seule vidéo décodée à la fois, pause hors écran, prefers-reduced-motion -> pas de vidéo
let fxMotionOK = null;
function motionOK() {
  if (fxMotionOK == null) {
    try { fxMotionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { fxMotionOK = true; }
  }
  return fxMotionOK;
}
document.addEventListener('visibilitychange', () => {
  const v = document.querySelector('.fx-video-overlay video');
  if (!v) return;
  if (document.hidden) v.pause(); else v.play().catch(() => {});
});
async function playFxVideo(ev) {
  if (!fxOn() || speedIdx >= 5 || !combatApp || !motionOK()) return;
  const fxId = FX_SPELLS[ev.name];
  if (!fxId) return;
  const url = await probeFxId(fxId);
  if (!url || !combatApp) return;
  combatApp.querySelector('.fx-video-overlay')?.remove(); // une seule vidéo décodée à la fois
  const ov = document.createElement('div');
  ov.className = 'fx-video-overlay';
  const v = document.createElement('video');
  v.src = url; v.muted = true; v.autoplay = true; v.playsInline = true;
  v.playbackRate = Math.max(1, Math.min(4, 1200 / (SPEEDS[speedIdx] ?? 1200))); // toggle de vitesse du combat suivi par la vidéo
  v.className = 'fx-video';
  ov.appendChild(v);
  combatApp.appendChild(ov);
  const kill = () => ov.remove();
  v.onended = kill;
  v.onerror = kill;
  setTimeout(kill, 2500);
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
    const rows = [];
    if (card.soloSpell) rows.push(`<li class="spell"><b>✦ ${card.soloSpell}</b> <span class="muted">sort signature</span></li>`);
    if (card.gimmickName) {
      rows.push(`<li class="spell"><b>✦ ${card.gimmickName}</b>
        <span class="muted">mécanisme exclusif</span>
        <span class="muted spell-desc">${card.gimmickDesc}</span></li>`);
    }
    return `<h4>Sorts et pouvoir</h4>
    <ul class="spells">${rows.join('')}</ul>
    <p class="statline">Niveau ${level} : +${(level - 1) * 8} % ATK et PV · prochain niveau : <span class="xpbar"><span style="width: ${Math.round(xp * 100)}%"></span></span> ${Math.round(xp * 100)} %</p>`;
  }

  
  const stq = statsAt(card, level, 0);
  const rows = (card.effect
    ? [`<li class="spell"><b>✦ ${effetDesc(card.effect) || 'Effet spécial : voir le glossaire une fois cette carte rencontrée.'}</b>
        <span class="muted">Pouvoir — automatique à chaque action de la carte, sans mana</span></li>`]
    : [])
    .concat(card.spells
    .map(
      (sp) => {
        // correctifs lot 4 : fiche complète — rôle (grimoire), zone vs monocible, frappe en « dégâts (%) »
        const zone = zoneLabelOf(sp);
        const cibleLab = zone || (sp.cible ? String(sp.cible) : '1 ennemi');
        const pct = Math.round((sp.mult ?? 1) * 100);
        const powerLine = card.effect && card.effect.kind === 'heal'
          ? spellPowerLine(card.effect, sp.mult)
          : `dégâts (${pct} % ≈ ${Math.max(1, Math.round(stq.atk * (sp.mult ?? 1)))})`;
        const roleLab = sp.role ? (SPELL_ROLE_LABEL[sp.role] ?? sp.role) : (SPELL_CAT_LABEL[sp.cat] ?? '');
        return `<li class="spell"><span class="sort-top"><b>✦ ${sp.name}</b>${spellBadgeHtml(sp)}<span class="sort-cost">✦ ${sp.cost}</span></span>
        <span class="muted sort-meta">${[roleLab, cibleLab, powerLine].filter(Boolean).join(' · ')}</span>
        ${sp.desc ? `<span class="muted spell-desc">${sp.desc}</span>` : ''}</li>`;
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

// boucle v2 lot 4 : bloc équipement de la fiche — 2 slots (arme typée + armure), pièces éligibles au clic
function equipBlockHtml(card) {
  const eq = store.equip[card.id] ?? { arme: null, armure: null };
  const slotBtn = (slot, label) => {
    const p = eq[slot] ? EQUIP_BY_ID[eq[slot]] : null;
    return `<button type="button" class="btn small equip-slot" data-slot="${slot}" data-card="${card.id}">
      ${p ? `⚔ <b>${p.nom}</b> <span class="chip r-${p.rarity}">${RARITY_LABEL[p.rarity]}</span> <span class="muted">${pieceBonusText(p)}</span>` : `${label} — vide`}
    </button>`;
  };
  const eb = equipBonusOfCard(card.id);
  const bonusTxt = ['atkPct', 'hpPct', 'agiPct', 'intPct'].filter((k) => eb[k] > 0).map((k) => `+${Math.round(eb[k] * 100)} % ${({ atkPct: 'ATQ', hpPct: 'PV', agiPct: 'AGI', intPct: 'INT' })[k]}`).join(' · ');
  return `<h4>Équipement</h4>
    <div class="equip-slots">${slotBtn('arme', 'Arme (' + (card.classe ?? '') + ')')}${slotBtn('armure', 'Armure')}</div>
    ${bonusTxt ? `<p class="muted">Bonus actuel : <b>${bonusTxt}</b>${eb.manaRegen ? ` · +${eb.manaRegen} régén mana` : ''}</p>` : '<p class="muted">Aucun bonus d’équipement.</p>'}}`;
}

// boucle v2 lot 4 : liste des pièces éligibles pour un slot, au clic sur le slot de la fiche
function openEquipPicker(card, slot) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const eq = store.equip[card.id] ?? { arme: null, armure: null };
  const list = eligiblePiecesFor(card, slot);
  const rows = list.map((p) => `<button type="button" class="btn tac-btn equip-pick r-${p.rarity}" data-piece="${p.id}"><b>${p.nom}</b> <span class="chip r-${p.rarity}">${RARITY_LABEL[p.rarity]}</span> <span class="muted">${pieceBonusText(p)}${p.set ? ` · set ${EQUIP_SETS[p.set]?.nom ?? ''}` : ''} ×${equipPieceCount(p.id)}</span></button>`).join('');
  overlay.innerHTML = `<div class="modal-box">
    <h3>${slot === 'arme' ? `Arme (${card.classe})` : 'Armure'} — ${card.name}</h3>
    <p class="muted">Pièces possédées éligibles. Actuellement : <b>${eq[slot] ? EQUIP_BY_ID[eq[slot]].nom : 'rien'}</b>.</p>
    <div class="recomp-list">${rows || '<p class="muted">Aucune pièce éligible possédée.</p>'}
      <button type="button" class="btn tac-btn" data-piece="">Déséquiper</button></div>
    <div class="modal-actions"><button class="btn" id="equip-close">Fermer</button></div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#equip-close').onclick = () => overlay.remove();
  overlay.querySelectorAll('.equip-pick').forEach((b) => {
    b.onclick = () => {
      equipPiece(card.id, slot, b.dataset.piece || null);
      overlay.remove();
      closeCardModal();
      openCardModal(byId(card.id), { onChange: () => renderEquipe(equipeRoot || document.getElementById('app')) });
      toast(b.dataset.piece ? `✓ ${EQUIP_BY_ID[b.dataset.piece].nom} équipée.` : '✓ Slot déséquipé.');
    };
  });
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
        ${evolveBtns || `<button type="button" class="btn small" disabled>\u00c9voluer : niveau 10 requis + \u00e9clats d\u2019\u00e9volution \u2014 le dilemme de l’Ascendance se joue à la Guilde</button>`}
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
          ? `<p class="muted">Carte \u00e0 d\u00e9voiler : gagnez-la en donjon, \u00e0 l\u2019autel, au marchand ou \u00e0 la Guilde pour r\u00e9v\u00e9ler son illustration, ses stats et ses sorts.</p>`
          : `<p class="statline">\u2694 Attaque <b>${statsAt(card, level, asc).atk}</b> &nbsp; \u2665 PV <b>${statsAt(card, level, asc).hp}</b>${level > 1 || asc ? ` <span class="muted">(base ${card.atk}/${card.hp} \u00b7 Nv ${level} : +${(level - 1) * 8} %${asc ? ` \u00b7 Ascendance +${asc} %` : ''})</span>` : ''}</p>
        ${owned > 0 ? equipBlockHtml(card) : ''}
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
  // boucle v2 lot 4 : clic sur un slot d'équipement de la fiche
  overlay.querySelectorAll('.equip-slot').forEach((el) => {
    el.onclick = () => openEquipPicker(byId(el.dataset.card), el.dataset.slot);
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
        <h4>\u00c9l\u00e9ments</h4>
        ${list(ELEMENTS)}
      </div>
    </div>`;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCardModal();
  });
  overlay.querySelector('.modal-close').onclick = closeCardModal;
  pinModalClose(overlay);
  document.body.appendChild(overlay);
}
;



// boucle v2 lot 3 : écran de départ à 2 cartes — 4 propositions (une par race), 1 choisie + 1 aléatoire
function renderDepart(root) {
  const props = DEPART_CHOIX.map((id) => byId(id)).filter(Boolean);
  root.innerHTML = `
    <div class="hero">
      <div class="hero-inner">
        <div class="hero-glyph">⚔</div>
        <h2>Bienvenue à AICG : Lignées !</h2>
        <p>Choisissez votre <b>première carte</b> parmi ces 4 novices (un par race) — une <b>seconde</b>, tirée au hasard parmi les trois restantes, vous rejoint aussitôt. L'équipe se remplira ensuite par recrutement, quêtes et Guilde.</p>
        <div class="grid depart-grid">
          ${props.map((c) => `<div class="gcell cat depart-choice" data-id="${c.id}" title="Choisir ${c.name}">${cardFront({ ...c, level: 1 }, { extraClass: hasArt(c) ? 'unit-art' : '' })}<span class="chip">${RACE_LABEL[raceOfCard(c)] ?? ''}</span></div>`).join('')}
        </div>
      </div>
    </div>
    ${saveBoxHtml()}
    ${slotsPanelHtml()}`;
  wireSaveBox(root);
  wireSlotsPanel(root);
  root.querySelectorAll('.depart-choice').forEach((el) => {
    el.onclick = () => choisirDepart(el.dataset.id);
  });
}

// boucle v2 lot 3 : le joueur choisit une proposition, la seconde est aléatoire parmi les 3 restantes
function choisirDepart(id) {
  if (store.departFait) return { ok: false, reason: 'Départ déjà effectué.' };
  const props = DEPART_CHOIX.filter((x) => byId(x));
  if (!props.includes(id)) return { ok: false, reason: 'Proposition inconnue.' };
  const rest = props.filter((x) => x !== id);
  const second = rest[Math.floor(uiRand() * rest.length)];
  grantCards([id, second]);
  store.departFait = true;
  save();
  openRevealModal([id, second], {
    title: '🎴 Votre départ !',
    subtitle: `${byId(id).name} (votre choix) + ${byId(second).name} (au hasard parmi les trois restantes).`,
    note: 'Touchez une carte pour la révéler.',
    cta: 'Composer mon équipe',
  });
  renderHome(document.getElementById('app'));
  return { ok: true, choisis: id, alea: second };
}

// ---------- bloc visuel : errance top-down + Les Terres Sauvages ----------
function dungeonOfZone(zoneId) {
  return String(zoneId).replace(/^zone-/, '');
}

function startZoneFight(zoneId, { donjon = false } = {}) {
  store.zoneFight = { zone: zoneId, donjon };
  store.dungeon = dungeonOfZone(zoneId);
  store.stage = 1;
  store.runState = freshRunState();
  store.runState.active = true;
  store.runMod = null;
  save();
  updatePtsBadge();
  go('#combat');
}

function enterZone(zoneId) {
  if (!zoneUnlocked(zoneId)) { toast('✗ Zone verrouillée — vainquez le donjon de la zone précédente.', 'warn'); return; }
  store.errance = createErranceState(zoneId);
  if (store.erranceSavedPos && store.erranceSavedPos.zone === zoneId) {
    // sûreté des saves (lot 3) : position secourue vers le spawn si le layout a rendu la tuile solide
    const p = rescueHeroPos(store.errance.map, store.erranceSavedPos.x, store.erranceSavedPos.y);
    store.errance.hero.x = p.x;
    store.errance.hero.y = p.y;
  }
  if (!store.zonesVisitees.includes(zoneId)) store.zonesVisitees.push(zoneId);
  save();
  go('#errance');
}

function persistErrancePos() {
  if (store.errance) {
    store.erranceSavedPos = { zone: store.errance.zone, x: store.errance.hero.x, y: store.errance.hero.y };
  }
}

function renderTerres(root) {
  const zones = DATA.zones ?? [];
  const cards = zones.map((z) => {
    const open = zoneUnlocked(z.id);
    const visited = (store.zonesVisitees ?? []).includes(z.id);
    const dg = dungeonById(dungeonOfZone(z.id));
    return `<div class="dungeon-card ${open ? '' : 'locked'}" style="--dcolor: ${dg?.accent ?? '#4dd0e1'}">
      <div class="dungeon-body">
        <h3>${z.nature} ${visited ? '<span class="chip on">visitée</span>' : ''}</h3>
        <p class="muted">${z.rencontres?.length ?? 0} créatures · rencontres dans les hautes herbes (${Math.round((z.errance?.encRate ?? 0.16) * 100)} %/pas) · un autel de soin, des jarres, et <b>le donjon</b> qui ouvre la zone suivante.</p>
        <div class="dungeon-actions">${open
          ? `<span class="btn big enter-zone" data-zone="${z.id}">Entrer</span>`
          : `<span class="btn big" disabled>🔒 Vainquez le donjon de la zone précédente</span>`}</div>
      </div>
    </div>`;
  }).join('');
  root.innerHTML = `
    <h2>🌿 Les Terres Sauvages</h2>
    <p class="muted">Choisissez une zone d'errance (départ : les berges des Marées, zone de l'eau). Chaque zone porte monstres, collectables, un autel de soin et un bâtiment donjon — le vaincre débloque la zone suivante. On y gagne or et XP.</p>
    <div class="dungeon-grid">${cards}</div>`;
  root.querySelectorAll('.enter-zone').forEach((el) => {
    el.onclick = () => enterZone(el.dataset.zone);
  });
}

let erranceRAF = null;
function renderErrance(root) {
  if (erranceRAF) cancelAnimationFrame(erranceRAF);
  const st = store.errance;
  if (!st) { go('#terres'); return; }
  const zone = getZone(st.zone);
  root.innerHTML = `
    <div class="errance-wrap">
      <div class="top errance-top">
        <span class="chip">🌿 ${zone?.nature ?? st.zone}</span>
        <span class="chip">🪙 ${store.gold} or</span>
        <span class="chip">🛡️ grâce ${st.grace}</span>
        <span class="chip" id="errance-phase">☀️ Jour</span>
        <span class="spacer"></span>
        <button type="button" class="back" id="errance-back" title="Retour aux Terres Sauvages">←</button>
      </div>
      <canvas id="errance-canvas"></canvas>
      <div class="pop" id="errance-dlg">
        <div class="card">
          <h3 id="errance-dlg-title"></h3>
          <p id="errance-dlg-text" style="white-space:pre-line"></p>
          <div class="row"><button type="button" class="btn ok" id="errance-dlg-close">Compris</button></div>
        </div>
      </div>
      <p class="muted errance-hint">Toucher la carte : s'y rendre · toucher le héros : frapper (casse les jarres) · hautes herbes : rencontres · autel : soin complet (+5 pas de grâce) · porte du donjon : combat de zone.</p>
    </div>`;
  const canvas = root.querySelector('#errance-canvas');
  const ctx = canvas.getContext('2d');
  // correctif v1.36.1 lot 3 : dialogue des huttes + feedbacks d'interaction (fx)
  const dlg = root.querySelector('#errance-dlg');
  const showHutteDialog = (h) => {
    if (!dlg) return;
    root.querySelector('#errance-dlg-title').textContent = h.title ?? 'Hutte';
    root.querySelector('#errance-dlg-text').textContent = h.text ?? '';
    dlg.classList.add('on');
  };
  root.querySelector('#errance-dlg-close')?.addEventListener('click', () => dlg?.classList.remove('on'));
  const fxList = []; // halos pulsés (autel au soin, retour ville au passage)
  const T = st.map.t;
  let dpr = 1, vw = 360, vh = 480;
  const fit = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1); // §9 : jamais de DPR > 2
    vw = Math.max(320, canvas.clientWidth || 360);
    vh = Math.max(320, canvas.clientHeight || 480);
    canvas.width = Math.round(vw * dpr); // résolution native => rendu net sur mobile
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
  };
  fit();
  // §3 pré-rendu du décor : peint UNE FOIS sur un canvas offscreen (world-space), puis 1 drawImage/frame
  const base = document.createElement('canvas');
  base.width = st.map.w * T;
  base.height = st.map.h * T;
  // refonte errance lot 1 : peinture style A+ en pré-rendu unique (src/errance-paint.js, palette en data) ;
  // jarres et objets cassables restent dessinés par frame (jamais cuits dans le pré-rendu, guide §8)
  paintZoneBase(base.getContext('2d'), st.map, zone);
  const repaintTile = (x, y) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) paintTileGround(base.getContext('2d'), st.map, zone, x + dx, y + dy);
  };
  // refonte errance lot 2 : couche d'ambiance §9bis (cycle jour/nuit, faune, traces, lames animées)
  const pal = errancePalette(zone);
  const amb = buildAmbiance(st.map, zone);
  const decor = st.map.decor;
  const cloudCv = document.createElement('canvas');
  cloudCv.width = 520; cloudCv.height = 340;
  {
    const cc = cloudCv.getContext('2d');
    const crnd = lcg((st.map.seed ^ 0x77aa11) >>> 0);
    for (let i = 0; i < 5; i++) {
      const x2 = 60 + crnd() * 400, y2 = 60 + crnd() * 220, r = 55 + crnd() * 75;
      const g = cc.createRadialGradient(x2, y2, r * .15, x2, y2, r);
      g.addColorStop(0, 'rgba(10,25,15,.17)'); g.addColorStop(1, 'rgba(10,25,15,0)');
      cc.fillStyle = g; cc.beginPath(); cc.arc(x2, y2, r, 0, 7); cc.fill();
    }
  }
  let time = 0, atk = 0, lastPhase = '', smokeAcc = 0;
  const smoke = [];
  // héros d'errance dédié (art livré vague 3) : sprite sheet extraite du cycle de marche WAN,
  // servie en ligne (site-assets/errance/) ; repli = poster jpg, puis dessin procédural hors ligne
  const heroCfg = E.ERRANCE_HERO ?? null;
  let heroSheet = null, heroPoster = null;
  if (heroCfg) {
    (async () => {
      const [sh, po] = await Promise.all([probeImage(heroCfg.sheet), probeImage(heroCfg.poster)]);
      if (sh) { const im = new Image(); im.onload = () => { heroSheet = im; }; im.src = sh; }
      if (po) { const im = new Image(); im.onload = () => { heroPoster = im; }; im.src = po; }
    })();
  }
  const cam = { x: st.hero.x * T, y: st.hero.y * T, z: 1.05 };
  const draw = (dtA) => {
    const animT = motionOK() ? time : 0; // prefers-reduced-motion : animations décoratives gelées (frame fixe), comme le héros
    const cyc = ((animT + 30) % amb.dayLen) / amb.dayLen;
    const dark = cyc < .55 ? 0 : cyc < .70 ? (cyc - .55) / .15 : cyc < .90 ? 1 : 1 - (cyc - .90) / .10;
    const duskAmt = dark * (1 - dark) * 4;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, 0, vw, vh);
    ctx.save();
    ctx.translate(vw / 2, vh / 2);
    ctx.scale(cam.z, cam.z);
    ctx.translate(-cam.x, -cam.y);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(base, 0, 0); // 1 appel : plus de fillRect tuile par tuile
    const vx0 = cam.x - vw / 2 / cam.z - 40, vx1 = cam.x + vw / 2 / cam.z + 40;
    const vy0 = cam.y - vh / 2 / cam.z - 40, vy1 = cam.y + vh / 2 / cam.z + 40;
    // ombres de nuages dérivantes
    for (const c of amb.clouds) ctx.drawImage(cloudCv, c.x - 260 * c.s, c.y - 170 * c.s, 520 * c.s, 340 * c.s);
    // traces de pas sur le chemin (fondu 5 s)
    for (let i = amb.prints.length - 1; i >= 0; i--) {
      const p = amb.prints[i]; p.life -= dtA;
      if (p.life <= 0) { amb.prints.splice(i, 1); continue; }
      if (p.x < vx0 || p.x > vx1 || p.y < vy0 || p.y > vy1) continue;
      const al = Math.min(1, p.life / 5) * .28;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.wet ? 'rgba(200,235,255,' + al.toFixed(3) + ')' : 'rgba(70,55,35,' + al.toFixed(3) + ')';
      ctx.beginPath(); ctx.ellipse(0, 0, 2.6, 4.6, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-4.2, 1.5, 1.7, 2.6, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3.6, -1.8, 1.7, 2.6, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    // reflets animés + écume de l'étang
    if (decor.pond) {
      const pd = decor.pond;
      for (let i = 0; i < 9; i++) {
        const a = .5 + .5 * Math.sin(animT * 1.4 + i * 1.7);
        ctx.strokeStyle = 'rgba(255,255,255,' + (.22 * a).toFixed(2) + ')';
        ctx.lineWidth = 1.8; ctx.lineCap = 'round';
        const ox = pd.cx - 70 + (i * 23) % 140, oy = pd.cy - 64 + ((i * 37) % 118);
        ctx.beginPath(); ctx.moveTo(ox, oy + 3 * a); ctx.quadraticCurveTo(ox + 12, oy - 2, ox + 26, oy + 3 * a); ctx.stroke();
      }
      const br = pd.rx * .98 + Math.sin(animT * .8) * 3, kEl = pd.ry / pd.rx;
      ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      for (let i = 0; i < 26; i++) {
        const a = i / 26 * 6.283 + animT * .25;
        const al = Math.max(0, .10 + .16 * Math.sin(animT * 1.6 + i * 1.3));
        ctx.strokeStyle = 'rgba(255,255,255,' + al.toFixed(2) + ')';
        const rr = br + 2 + Math.sin(animT + i) * 1.5;
        ctx.beginPath();
        ctx.moveTo(pd.cx + Math.cos(a) * rr, pd.cy + Math.sin(a) * rr * kEl);
        ctx.lineTo(pd.cx + Math.cos(a + .09) * (rr + 2.5), pd.cy + Math.sin(a + .09) * (rr + 2.5) * kEl);
        ctx.stroke();
      }
    }
    // lames de hautes herbes animées : 2 tracés groupés par couleur, rafale dépendante de la position, écart au passage du héros (culling viewport)
    const hpx0 = st.hero.x * T, hpy0 = st.hero.y * T;
    ctx.lineCap = 'round'; ctx.lineWidth = 2.4;
    for (const col of [pal.bladeA, pal.bladeB]) {
      ctx.strokeStyle = col; ctx.beginPath();
      for (const b of decor.blades) {
        if (b.c !== col || b.x < vx0 || b.x > vx1 || b.y < vy0 || b.y > vy1) continue;
        const sw = Math.sin(animT * 2 + b.ph) * 3.5 * (1 + .5 * Math.sin(animT * .6 + b.x * .01 + b.y * .006));
        const hd = Math.hypot(b.x - hpx0, b.y - hpy0);
        const push = hd < 42 ? (1 - hd / 42) * 7 : 0;
        const pdx = hd > .1 ? (b.x - hpx0) / hd : 0, pdy = hd > .1 ? (b.y - hpy0) / hd : 0;
        ctx.moveTo(b.x, b.y);
        ctx.quadraticCurveTo(b.x + (sw + push * pdx) * .5, b.y - b.h * .6, b.x + sw + push * pdx, b.y - b.h + push * pdy * .4);
      }
      ctx.stroke();
    }
    for (const j of st.map.jarres) {
      const jid = `jarre-${j.x}-${j.y}`;
      const cx2 = j.x * T + T / 2, cy2 = j.y * T + T / 2;
      if (cx2 < vx0 || cx2 > vx1 || cy2 < vy0 || cy2 > vy1) continue;
      if (st.broken.includes(jid)) {
        ctx.fillStyle = pal.shard;
        ctx.beginPath(); ctx.ellipse(cx2 - 8, cy2 + 6, 7, 3, .2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx2 + 8, cy2 + 4, 5, 2.5, -.3, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx2 + 2, cy2 + 9, 6, 2.6, .1, 0, 7); ctx.fill();
        continue;
      }
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx2 + 2, cy2 + 11, 12, 4.5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = pal.potBody; ctx.beginPath(); ctx.ellipse(cx2, cy2, 11, 13, 0, 0, 7); ctx.fill();
      ctx.fillStyle = pal.potLight; ctx.beginPath(); ctx.ellipse(cx2 - 3, cy2 - 3, 7, 9, 0, 0, 7); ctx.fill();
      ctx.fillStyle = pal.potDark; ctx.beginPath(); ctx.ellipse(cx2, cy2 - 11, 6.5, 3, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = pal.potLine; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx2, cy2, 11, 13, 0, 0, 7); ctx.stroke();
    }
    // feedbacks d'interaction visibles (correctif v1.36.1 lot 3) : halo pulsé de l'autel au soin, du retour ville et de la porte au passage
    for (let i = fxList.length - 1; i >= 0; i--) {
      const f = fxList[i]; f.t -= dtA;
      if (f.t <= 0) { fxList.splice(i, 1); continue; }
      const pr = 1 - f.t / 2;
      ctx.strokeStyle = 'rgba(140,220,255,' + (.8 * (1 - pr)).toFixed(2) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(f.x, f.y - 6, 10 + pr * 26, 0, 7); ctx.stroke();
    }
    if (st.map.retour && Math.hypot(st.hero.x - (st.map.retour.x + .5), st.hero.y - (st.map.retour.y + .5)) < 3.5) {
      const pu = .5 + .5 * Math.sin(animT * 4);
      ctx.strokeStyle = 'rgba(160,235,255,' + (.35 + .4 * pu).toFixed(2) + ')';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(st.map.retour.x * T + T / 2, st.map.retour.y * T + T / 2, 14 + pu * 6, 0, 7); ctx.stroke();
    }
    const porteT = { x: st.map.donjon.x + Math.floor(st.map.donjon.w / 2), y: st.map.donjon.y + st.map.donjon.h };
    if (Math.hypot(st.hero.x - (porteT.x + .5), st.hero.y - (porteT.y + .5)) < 4) {
      const pu = .5 + .5 * Math.sin(animT * 4);
      ctx.strokeStyle = 'rgba(255,215,110,' + (.3 + .4 * pu).toFixed(2) + ')';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc((porteT.x + .5) * T, (porteT.y + .5) * T, 12 + pu * 5, 0, 7); ctx.stroke();
    }
    const hx = st.hero.x * T, hy = st.hero.y * T;
    // ombre portée du héros, étirée avec l'obscurité + halo nocturne
    const shL = 1 + dark * 1.1;
    ctx.fillStyle = 'rgba(0,0,0,' + Math.max(.12, .3 - dark * .12).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(hx + 7 * shL, hy + 10 + 2 * shL, 12 * shL, 4.5, .35, 0, 7); ctx.fill();
    if (dark > .15) {
      const hg = ctx.createRadialGradient(hx, hy - 8, 4, hx, hy - 8, 46);
      hg.addColorStop(0, 'rgba(255,224,150,' + (.35 * dark).toFixed(2) + ')');
      hg.addColorStop(1, 'rgba(255,224,150,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy - 8, 46, 0, 7); ctx.fill();
    }
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(st.hero.tilt ?? 0); // balancement dans les virages (§5)
    const hv = st.hero.v ?? { x: 0, y: 0 };
    const hsp = Math.hypot(hv.x, hv.y);
    if (heroSheet && heroCfg) {
      // cycle de marche : frame selon le temps, dos si le héros monte, miroir si déplacement à gauche
      const moving = hsp > 0.15 && motionOK();
      const back = hv.y < -0.05;
      const cyc = heroCfg.cycle ?? 40;
      const fi = moving ? Math.floor(performance.now() / 1000 * (heroCfg.fps ?? 16)) % cyc : 0;
      const idx = (back ? (heroCfg.backFrom ?? 40) : 0) + fi;
      const sx = (idx % heroCfg.cols) * heroCfg.frameW;
      const sy = Math.floor(idx / heroCfg.cols) * heroCfg.frameH;
      const dw = T * 0.66, dh = dw * heroCfg.frameH / heroCfg.frameW;
      ctx.save();
      if (hv.x < -0.05) ctx.scale(-1, 1);
      ctx.drawImage(heroSheet, sx, sy, heroCfg.frameW, heroCfg.frameH, -dw / 2, -dh + T * 0.3, dw, dh);
      ctx.restore();
    } else if (heroPoster) {
      const dw = T * 0.66, dh = dw * 560 / 400;
      ctx.drawImage(heroPoster, -dw / 2, -dh + T * 0.3, dw, dh);
    } else {
      ctx.fillStyle = '#171522';
      ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill();
      ctx.fillStyle = '#f4f1ea';
      ctx.beginPath(); ctx.arc(0, -4, 6, 0, 7); ctx.fill();
    }
    ctx.restore();
    // arc de frappe doré (feedback §8, 0,35 s)
    if (atk > 0) {
      const pr = 1 - atk / .35;
      const hm = Math.hypot(hv.x, hv.y);
      const base2 = hm > .1 ? Math.atan2(hv.y, hv.x) : 0;
      const a = base2 - 1.2 + pr * 2.4;
      ctx.strokeStyle = 'rgba(255,250,220,' + (.75 * (1 - pr)).toFixed(2) + ')';
      ctx.lineWidth = 6 * (1 - pr * .5); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(hx, hy, T * 1.15, a - .5, a + .5); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,215,110,' + (.5 * (1 - pr)).toFixed(2) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, hy, T * 1.24, a - .4, a + .4); ctx.stroke();
    }
    // fumée des cheminées
    for (let i = smoke.length - 1; i >= 0; i--) {
      const sm = smoke[i];
      sm.life -= dtA; sm.y -= 13 * dtA; sm.x += Math.sin(animT * 1.5 + sm.ph) * 9 * dtA; sm.r += 7 * dtA;
      if (sm.life <= 0) { smoke.splice(i, 1); continue; }
      ctx.fillStyle = 'rgba(232,230,222,' + (.15 * Math.min(1, sm.life / 1.6)).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(sm.x, sm.y, sm.r, 0, 7); ctx.fill();
    }
    // feuilles au vent
    for (const l of amb.leaves) {
      const lx2 = l.x + Math.sin(animT * 2 + l.ph) * 7;
      if (lx2 < vx0 || lx2 > vx1 || l.y < vy0 || l.y > vy1) continue;
      ctx.save(); ctx.translate(lx2, l.y); ctx.rotate(l.rot);
      ctx.fillStyle = ['#c9a24e', '#b46b3c', '#8ea84e'][Math.floor(l.ph * 10) % 3];
      ctx.beginPath(); ctx.ellipse(0, 0, 4, 2.2, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    // étincelles (jarres brisées)
    for (let i = amb.sparkles.length - 1; i >= 0; i--) {
      const sp = amb.sparkles[i];
      sp.life -= dtA; sp.x += sp.vx * dtA; sp.y += sp.vy * dtA; sp.vy += 50 * dtA;
      if (sp.life <= 0) { amb.sparkles.splice(i, 1); continue; }
      ctx.fillStyle = (sp.c || 'rgba(190,255,200,') + Math.min(1, sp.life).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(sp.x, sp.y, 2.2, 0, 7); ctx.fill();
    }
    // lucioles (montent avec l'obscurité)
    for (const f of amb.flies) {
      const fx = f.x + Math.cos(animT * f.sp + f.ph) * 8, fy = f.y + Math.sin(animT * f.sp * 1.3 + f.ph) * 7;
      if (fx < vx0 || fx > vx1 || fy < vy0 || fy > vy1) continue;
      const a = (.45 + .45 * Math.sin(animT * 2 + f.ph)) * (.2 + .8 * dark);
      if (dark > .3) {
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.r * 5);
        fg.addColorStop(0, 'rgba(255,233,168,' + (.30 * dark).toFixed(2) + ')');
        fg.addColorStop(1, 'rgba(255,233,168,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fx, fy, f.r * 5, 0, 7); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,233,168,' + a.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(fx, fy, f.r, 0, 7); ctx.fill();
    }
    // papillons de jour (s'estompent à la nuit)
    if (dark < .8) for (const bf of amb.butterflies) {
      const bfx = bf.x + Math.cos(animT * bf.sp + bf.ph) * 10, bfy = bf.y + Math.sin(animT * bf.sp * 1.7 + bf.ph) * 8;
      if (bfx < vx0 || bfx > vx1 || bfy < vy0 || bfy > vy1) continue;
      const flap = Math.abs(Math.sin(animT * 14 + bf.fl));
      ctx.save(); ctx.translate(bfx, bfy); ctx.rotate(Math.sin(animT + bf.ph) * .3);
      ctx.globalAlpha = Math.min(1, (0.8 - dark) * 2.5);
      ctx.fillStyle = bf.col;
      ctx.beginPath(); ctx.ellipse(-2.6, 0, 2.6, 1.6 + 2.2 * flap, .5, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(2.6, 0, 2.6, 1.6 + 2.2 * flap, -.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#3a2a20'; ctx.beginPath(); ctx.ellipse(0, 0, .8, 1.8, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = 1; ctx.restore();
    }
    // graines de pissenlit portées par le vent
    for (const sd of amb.seeds) {
      if (sd.x < vx0 || sd.x > vx1 || sd.y < vy0 || sd.y > vy1) continue;
      ctx.save(); ctx.translate(sd.x, sd.y);
      ctx.strokeStyle = 'rgba(240,240,225,.6)'; ctx.lineWidth = .8;
      for (let k = 0; k < 6; k++) { const ka = k / 6 * 6.283; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ka) * 3.6, Math.sin(ka) * 3.6); ctx.stroke(); }
      ctx.fillStyle = 'rgba(205,195,165,.8)'; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // overlays plein écran semi-transparents (jamais opaques : les tuiles restent lisibles la nuit)
    ctx.fillStyle = 'rgba(255,241,205,' + (.05 * (1 - dark)).toFixed(3) + ')';
    ctx.fillRect(0, 0, vw, vh);
    if (duskAmt > .02) { ctx.fillStyle = 'rgba(255,140,60,' + (.16 * duskAmt).toFixed(3) + ')'; ctx.fillRect(0, 0, vw, vh); }
    if (dark > .02) { ctx.fillStyle = 'rgba(14,22,58,' + (.42 * dark).toFixed(3) + ')'; ctx.fillRect(0, 0, vw, vh); }
    // marqueur de destination (espace écran)
    if (st.hero.path.length) {
      const n = st.hero.path[st.hero.path.length - 1];
      const mpx = (n.x * T - cam.x) * cam.z + vw / 2, mpy = (n.y * T - cam.y) * cam.z + vh / 2;
      const pulse = 6 + Math.sin(animT * 6) * 2.5;
      ctx.strokeStyle = 'rgba(255,215,110,.9)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(mpx, mpy, pulse, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,215,110,.4)';
      ctx.beginPath(); ctx.arc(mpx, mpy, pulse + 6, 0, 7); ctx.stroke();
    }
    // HUD phase (throttle : écrit seulement si le libellé change)
    const ph = cyc < .55 ? '☀️ Jour' : cyc < .70 ? '🌇 Soir' : cyc < .90 ? '🌙 Nuit' : '🌅 Aube';
    if (ph !== lastPhase) { lastPhase = ph; const el = document.getElementById('errance-phase'); if (el) el.textContent = ph; }
  };
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!store.errance || store.errance !== st) return;
    const ev = stepErrance(st, dt);
    time += dt;
    if (atk > 0) atk -= dt;
    const dtA = motionOK() ? dt : 0; // décor gelé si prefers-reduced-motion
    const WW = st.map.w * T, WH = st.map.h * T;
    for (const c of amb.clouds) { c.x += c.v * dtA; if (c.x - 300 * c.s > WW + 120) { c.x = -320 * c.s; c.y = Math.random() * WH; } }
    for (const l of amb.leaves) {
      l.x += l.sp * 14 * dtA; l.y += l.sp * 9 * dtA; l.rot += l.rs * dtA;
      if (l.x > WW + 20) { l.x = -20; l.y = Math.random() * WH; }
      if (l.y > WH + 20) { l.y = -20; l.x = Math.random() * WW; }
    }
    const gustV = .5 + .5 * Math.sin(time * .6);
    for (const sd of amb.seeds) { sd.x += (14 + gustV * 26) * dtA; sd.y += Math.sin(time * .9 + sd.ph) * .5 * dtA - 1.5 * dtA; if (sd.x > WW + 15) { sd.x = -15; sd.y = Math.random() * WH; } }
    smokeAcc += dtA;
    if (smokeAcc > .4) { smokeAcc = 0; for (const ch of amb.chimneys) smoke.push({ x: ch.x, y: ch.y, life: 2.6 + Math.random(), ph: Math.random() * 7, r: 3 }); }
    // traces de pas sur le chemin de terre (pied gauche/droit alternés)
    if (ev.steps) {
      const vv = st.hero.v ?? { x: 0, y: 0 };
      const vm = Math.hypot(vv.x, vv.y);
      const tileNow = st.map.terr[st.map.idx(Math.floor(st.hero.x), Math.floor(st.hero.y))];
      if (vm > 0.5 && (tileNow === ET.CHEMIN || tileNow === ET.EAU_PEU_PROFONDE)) { // éclaboussures en eau peu profonde (praticable)
        amb.prints.push({ x: st.hero.x * T + (-vv.y / vm) * (st.steps % 2 ? 4.5 : -4.5), y: st.hero.y * T + (vv.x / vm) * (st.steps % 2 ? 4.5 : -4.5) + 8, a: Math.atan2(vv.y, vv.x), life: 5, wet: tileNow === ET.EAU_PEU_PROFONDE });
        if (amb.prints.length > 40) amb.prints.shift();
      }
    }
    if (ev.encounter && !store.zoneFight) {
      persistErrancePos(); save();
      startZoneFight(st.zone, { donjon: false });
      return;
    }
    if (ev.arrived) {
      const o = ev.arrived;
      if (o.type === 'autel') {
        interactAutel(st);
        autelDeSoin();
        fxList.push({ type: 'autel', x: st.map.autel.x * T + T / 2, y: st.map.autel.y * T, t: 2 });
        toast('⛲ Autel de soin : PV et mana restaurés, +5 pas de grâce.');
        save();
      } else if (o.type === 'maison') {
        showHutteDialog(o.hutte ?? { title: 'Hutte', text: '' });
        save();
      } else if (o.type === 'porte') {
        persistErrancePos(); save();
        startZoneFight(st.zone, { donjon: true });
        return;
      } else if (o.type === 'retour') {
        persistErrancePos(); save();
        toast('✨ Retour à la ville.');
        go('#terres');
        return;
      } else if (o.type === 'jarre') {
        const jid = `jarre-${o.x}-${o.y}`;
        const r = interactJarre(st, jid);
        atk = 0.35; // arc de frappe doré (feedback §8)
        for (let k = 0; k < 16; k++) amb.sparkles.push({ x: (o.x + .5) * T, y: (o.y + .5) * T, vx: (Math.random() - .5) * 160, vy: -40 - Math.random() * 120, life: .6 + Math.random() * .4, c: 'rgba(214,164,110,' });
        if (r?.loot === 'eclat') { const el = ELEMENTS[Math.floor(uiRand() * ELEMENTS.length)]; addGem('brut', el, 1); questProgress('recolter'); toast(`🫙 Jarre brisée : +1 éclat brut (${el}).`); repaintTile(o.x, o.y); }
        save();
      }
    }
    // §6 caméra : zoom selon la distance parcourue, look-ahead de 0,12 s sur la vitesse, lerp indépendant du framerate
    const v = st.hero.v ?? { x: 0, y: 0 };
    const moving = Math.hypot(v.x, v.y) > 0.05;
    const dist = Math.hypot(st.hero.x - st.map.spawn.x, st.hero.y - st.map.spawn.y);
    let zT = 1.05 + Math.min(1, dist / 26) * 0.6 - (moving ? 0.1 : 0);
    zT = Math.max(1.0, Math.min(1.7, zT));
    cam.z += (zT - cam.z) * Math.min(1, 3.5 * dt);
    const cxT = st.hero.x * T + v.x * T * 0.12;
    const cyT = st.hero.y * T + v.y * T * 0.12;
    cam.x += (cxT - cam.x) * Math.min(1, 4.5 * dt);
    cam.y += (cyT - cam.y) * Math.min(1, 4.5 * dt);
    draw(dtA);
    erranceRAF = requestAnimationFrame(loop);
  };
  erranceRAF = requestAnimationFrame(loop);
  let dragging = false, lastTx = -1, lastTy = -1;
  const toWorld = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: cam.x + (e.clientX - r.left - vw / 2) / cam.z, y: cam.y + (e.clientY - r.top - vh / 2) / cam.z };
  };
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    const wpos = toWorld(e);
    const px = wpos.x, py = wpos.y;
    const hx = st.hero.x * T, hy = st.hero.y * T;
    if (Math.hypot(px - hx, py - hy) < T) {
      const fx = Math.floor(st.hero.x), fy = Math.floor(st.hero.y + 1);
      const j = st.map.jarres.find((jj) => jj.x === fx && jj.y === fy && !st.broken.includes(`jarre-${jj.x}-${jj.y}`));
      if (j) {
        const r2 = interactJarre(st, `jarre-${j.x}-${j.y}`);
        atk = 0.35;
        for (let k = 0; k < 16; k++) amb.sparkles.push({ x: (j.x + .5) * T, y: (j.y + .5) * T, vx: (Math.random() - .5) * 160, vy: -40 - Math.random() * 120, life: .6 + Math.random() * .4, c: 'rgba(214,164,110,' });
        if (r2?.loot === 'eclat') { const el = ELEMENTS[Math.floor(uiRand() * ELEMENTS.length)]; addGem('brut', el, 1); questProgress('recolter'); toast(`🫙 Jarre brisée : +1 éclat brut (${el}).`); repaintTile(j.x, j.y); save(); }
      }
      return;
    }
    const tx = Math.floor(px / T), ty = Math.floor(py / T);
    const m = st.map;
    if (tx === m.autel.x && ty === m.autel.y) { st.pending = { type: 'autel', x: m.autel.x, y: m.autel.y }; }
    else if (tx >= m.donjon.x && tx < m.donjon.x + m.donjon.w && ty === m.donjon.y + m.donjon.h) { st.pending = { type: 'porte', x: tx, y: ty }; }
    else if (m.retour && tx === m.retour.x && ty === m.retour.y) { st.pending = { type: 'retour', x: m.retour.x, y: m.retour.y }; }
    else {
      const hu = (m.huttes ?? []).find((h) => h.x === tx && h.y === ty);
      if (hu) st.pending = { type: 'maison', x: hu.x, y: hu.y, hutte: hu };
      else {
        const j = m.jarres.find((jj) => jj.x === tx && jj.y === ty && !st.broken.includes(`jarre-${jj.x}-${jj.y}`));
        if (j) st.pending = { type: 'jarre', x: j.x, y: j.y };
      }
    }
    if (st.pending) {
      const o = st.pending;
      let best = null, bd = 1e9;
      for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
        const cx = o.x + dx, cy = o.y + dy;
        if (!m.inb(cx, cy)) continue;
        const tt = m.terr[m.idx(cx, cy)];
        if ([2, 3, 4, 7, 8, 9, 10].includes(tt)) continue;
        const d = Math.hypot(cx + 0.5 - st.hero.x, cy + 0.5 - st.hero.y);
        if (d < bd) { bd = d; best = { x: cx, y: cy }; }
      }
      if (best) setTarget(st, best.x, best.y);
    } else {
      setTarget(st, tx, ty);
    }
    lastTx = Math.floor(px / T); lastTy = Math.floor(py / T);
  });
  // §4 : au drag, A* seulement si la tuile cible a changé (mémo lastTx/lastTy)
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging || st.pending) return;
    const wpos = toWorld(e);
    const tx = Math.floor(wpos.x / T), ty = Math.floor(wpos.y / T);
    if (tx !== lastTx || ty !== lastTy) { lastTx = tx; lastTy = ty; setTarget(st, tx, ty); }
  });
  // §10 iOS : pointerup/pointercancel écoutés sur window, pas sur le canvas
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointercancel', () => { dragging = false; });
  root.querySelector('#errance-back').onclick = () => { persistErrancePos(); save(); go('#terres'); };
}

function renderHome(root) {
  const owned = [...store.collection.entries()].filter(([id, n]) => n > 0 && byId(id)).length;
  const team = [...store.team.slots].filter(Boolean);
  const chips = team
    .map((iid) => {
      const inst = byIid(iid);
      if (!inst) return '';
      const c = byId(inst.id);
      return `<span class="chip">${artGlyph(c)} ${c.name}</span>`;
    })
    .join('');
  const d = dungeonById(store.dungeon);
  const nextBoss = Math.min(d.floors, Math.ceil(store.stage / 5) * 5);
  // boucle v2 lot 3 : tant que le départ n'est pas fait, l'accueil propose les 4 novices
  if (owned === 0 && !store.departFait) { renderDepart(root); return; }
  if (owned === 0) {
    root.innerHTML = `
      <div class="hero">
        <div class="hero-inner">
          <div class="hero-glyph">⚔</div>
          <h2>Bienvenue à AICG : Lignées !</h2>
          <p>Collectionnez des cartes, forgez des lignées, explorez le donjon des Marées. Voici comment démarrer :</p>
          <ol class="steps">
            <li><b>G\u00e9n\u00e9rez vos premi\u00e8res cartes</b> \u2014 deux naissances vous sont offertes (choisissez l\u2019une d\u2019elles, une seconde au hasard), jouables imm\u00e9diatement.</li>
            <li><b>Composez votre \u00e9quipe</b> : 5 emplacements libres, des synergies de classe et d\u2019\u00e9l\u00e9ment.</li>
            <li><b>Explorez le donjon</b> : chaque \u00e9tage vaincu rapporte de l\u2019or et de l\u2019XP ; les boss lâchent gemmes, éclats et parfois une pierre d\u2019\u00e9veil.</li>
            <li><b>Montez vos cartes</b> : au niveau 10, chacune \u00e9volue avec des \u00e9clats \u2014 et garde son identit\u00e9.</li>
          </ol>
          <a href="#forge" class="btn btn-hero">\u2694 G\u00e9n\u00e9rer mes premi\u00e8res cartes</a>
        </div>
      </div>
      ${saveBoxHtml()}
      ${slotsPanelHtml()}`;
    wireSaveBox(root);
    wireSlotsPanel(root);
    return;
  }
  
  
  const exploreBtn = team.length === 0
    ? '<a href="#equipe" class="btn btn-hero">⚔ Composer mon équipe</a>'
    : '<a href="#donjons" class="btn btn-hero">⚔ Explorer le donjon (étage 1)</a>';
  const nbBrut = Object.values(store.gems?.brut ?? {}).reduce((a, b) => a + b, 0);
  const quetes = ensureQuetes();
  const quetesDone = quetes.filter((q) => q.done).length;
  root.innerHTML = `
    <div class="hub-scene" aria-hidden="true">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice">
        <circle cx="70" cy="110" r="60" fill="#ffe9a8" opacity=".4"/>
        <circle cx="70" cy="110" r="32" fill="#fff3c9"/>
        <g fill="#ffffff" opacity=".85">
          <ellipse cx="255" cy="92" rx="42" ry="13"/><ellipse cx="285" cy="82" rx="26" ry="10"/>
          <ellipse cx="125" cy="178" rx="30" ry="9" opacity=".6"/>
        </g>
        <path d="M0 432 Q80 402 160 434 T390 424 V844 H0 Z" fill="#b9c98f"/>
        <g>
          <rect x="-4" y="432" width="84" height="88" fill="#e7d6b3"/><path d="M-10 432 L38 400 L86 432 Z" fill="#b0603f"/>
          <rect x="86" y="448" width="64" height="72" fill="#efdfbf"/><path d="M82 448 L118 420 L154 448 Z" fill="#a85a3c"/>
          <rect x="248" y="438" width="70" height="82" fill="#e3cfa8"/><path d="M244 438 L283 406 L322 438 Z" fill="#b0603f"/>
          <rect x="322" y="454" width="72" height="66" fill="#ead9b6"/><path d="M318 454 L358 428 L398 454 Z" fill="#a85a3c"/>
        </g>
        <path d="M0 540 Q195 514 390 542 V844 H0 Z" fill="#d9c9a4"/>
        <g stroke="#c0ae86" stroke-width="1" opacity=".55" fill="none">
          <path d="M30 572 L370 598 M0 612 L390 638 M0 662 L390 688 M0 716 L390 742 M0 776 L390 802"/>
          <path d="M60 548 L20 844 M150 538 L128 844 M250 540 L262 844 M340 550 L368 844"/>
        </g>
        <g>
          <ellipse cx="195" cy="714" rx="68" ry="18" fill="#b8a67e"/>
          <ellipse cx="195" cy="710" rx="60" ry="15" fill="#9ecfe8"/>
          <rect x="187" y="662" width="16" height="44" fill="#cabb96"/>
          <circle cx="195" cy="642" r="8" fill="#d6c8a4"/>
          <g stroke="#bfe6f7" stroke-width="3" stroke-linecap="round" fill="none" opacity=".95">
            <path d="M195 646 Q185 670 175 702"/><path d="M195 646 Q205 670 215 702"/><path d="M195 646 Q195 674 195 706"/>
          </g>
        </g>
        <g fill="#5b4632">
          <g><circle cx="120" cy="668" r="5"/><path d="M114 674 Q112 694 114 704 L126 704 Q128 694 126 674 Z"/></g>
          <g><circle cx="272" cy="672" r="5"/><path d="M266 678 Q264 698 266 708 L278 708 Q280 698 278 678 Z"/></g>
          <g><circle cx="86" cy="700" r="4.5"/><path d="M81 706 Q79 724 81 732 L91 732 Q93 724 91 706 Z"/></g>
          <g><circle cx="300" cy="704" r="4.5"/><path d="M295 710 Q293 728 295 736 L305 736 Q307 728 305 710 Z"/></g>
        </g>
      </svg>
    </div>
    <div class="hub-veil"></div>
    <div class="hub-title"><h1>AICG · LIGNÉES</h1><small>Port des Brumes</small></div>
    <header class="top hub-top">
      <span class="chip">🪙 ${store.gold}</span>
      <span class="chip">🔷 ${nbBrut} éclats</span>
      <span class="spacer"></span>
      <button type="button" class="back" id="hub-back" title="Retour">←</button>
    </header>
    <svg class="hub-npc" id="hub-npc" viewBox="0 0 104 210" role="button" aria-label="Personnage de référence — cliquer pour dialoguer">
      <path d="M30 62 Q22 130 26 196 L78 196 Q82 130 74 62 Z" fill="#171522"/>
      <path d="M36 96 Q32 150 40 196 L64 196 Q72 150 68 96 Z" fill="#26233a"/>
      <ellipse cx="52" cy="44" rx="15" ry="17" fill="#e9d9c8"/>
      <path d="M35 44 Q33 16 52 14 Q71 16 69 42 L71 62 Q64 50 52 52 Q40 50 33 62 Z" fill="#f4f1ea"/>
      <path d="M35 44 Q30 78 34 92 L44 90 Q38 70 37 50 Z" fill="#f4f1ea"/>
      <path d="M69 44 Q74 78 70 92 L60 90 Q66 70 67 50 Z" fill="#f4f1ea"/>
      <circle cx="46" cy="44" r="2.2" fill="#2c2c34"/><circle cx="58" cy="44" r="2.2" fill="#2c2c34"/>
    </svg>
    <div class="hub-bubble" id="hub-bubble"><b>L'Errante</b><span>Bienvenue au Port des Brumes. Les Terres Sauvages vous attendent — composez d'abord une équipe.</span></div>
    <nav class="hub-menu">
      <a class="btn gold-frame" href="#donjons"><span class="ic">⛰️</span>Donjons</a>
      <a class="btn gold-frame" href="#terres"><span class="ic">🌿</span>Terres Sauvages</a>
      <a class="btn gold-frame" href="#boutique"><span class="ic">🛒</span>Boutique</a>
      <a class="btn gold-frame" href="#forge"><span class="ic">🛡️</span>Guilde</a>
      <a class="btn gold-frame" href="#quetes"><span class="ic">📜</span>Quêtes</a>
      <a class="btn gold-frame" href="#personnage"><span class="ic">🧝</span>Personnage</a>
      <a class="btn gold-frame" href="#collection"><span class="ic">🎴</span>Collection</a>
      <a class="btn gold-frame" href="#glossaire"><span class="ic">📖</span>Glossaire</a>
    </nav>
    <div class="hub-bottom">
      <a class="hub-daily" href="#quetes">
        <span class="ic">📜</span>
        <span><b>Quêtes du jour</b><small>${quetesDone}/${quetes.length} accomplies — bonus pierre d'éveil</small></span>
        <span class="eta">voir →</span>
      </a>
      <span class="btn big hub-wild" id="hub-wild"><span class="ic">🌿</span>LES TERRES SAUVAGES</span>
    </div>
    <div class="pop" id="hub-pop">
      <div class="card">
        <h3>Équipe vide</h3>
        <p>Composez d'abord une équipe (5 cartes max) avant de partir dans les Terres Sauvages.</p>
        <div class="row"><a class="btn ok" href="#equipe">Composer mon équipe</a><button type="button" class="btn ghost" id="hub-pop-close">Plus tard</button></div>
      </div>
    </div>
    <div class="hub-spacer" aria-hidden="true"></div>
    ${saveBoxHtml()}
    ${slotsPanelHtml()}`;
  wireSaveBox(root);
  wireSlotsPanel(root);
  const npc = root.querySelector('#hub-npc');
  const bubble = root.querySelector('#hub-bubble');
  if (npc && bubble) npc.onclick = () => bubble.classList.toggle('on');
  const back = root.querySelector('#hub-back');
  if (back) back.onclick = () => { if (history.length > 1) history.back(); else go('#accueil'); };
  const wild = root.querySelector('#hub-wild');
  const pop = root.querySelector('#hub-pop');
  if (wild) wild.onclick = () => {
    if (team.length === 0) { pop?.classList.add('on'); return; }
    go('#terres');
  };
  root.querySelector('#hub-pop-close')?.addEventListener('click', () => pop?.classList.remove('on'));
}

function saveBoxHtml() {
  return `<div class="save-box">
    <h3>💾 Sauvegarde</h3>
    <p class="muted">Le jeu sauvegarde automatiquement dans ce navigateur. Vous pouvez aussi exporter un code de sauvegarde à garder de côté, ou en restaurer un ici.</p>
    <div class="actions">
      <button class="btn" id="btn-export-save">📤 Exporter ma sauvegarde</button>
      <button class="btn" id="btn-import-save">📥 Restaurer une sauvegarde</button>
    </div>
  </div>`;
}

function buildSaveCode() {
  return 'FCSAVE1 ' + JSON.stringify(snapshot());
}

function applySaveCode(text) {
  try {
    const t = String(text ?? '').trim();
    const json = t.startsWith('FCSAVE1') ? t.slice(8).trim() : t;
    if (!json) return { ok: false, reason: 'Collez d\u2019abord un code de sauvegarde.' };
    if (!restore(JSON.parse(json))) return { ok: false, reason: 'Code de sauvegarde invalide.' };
    save();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'Code illisible : collez le code complet, sans le tronquer.' };
  }
}

function openSaveModal(mode) {
  closeCardModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal end-modal';
  if (mode === 'export') {
    box.innerHTML = `<h3>📤 Exporter ma sauvegarde</h3>
      <p class="muted">Copiez ce code et gardez-le de côté : il contient toute votre progression. Après un rechargement ou sur un autre appareil, restaurez-le depuis l\u2019accueil.</p>
      <textarea id="save-code" readonly></textarea>
      <div class="actions"><button class="btn" id="save-copy">📋 Copier</button><button class="btn" id="save-close">Fermer</button></div>`;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const ta = box.querySelector('#save-code');
    ta.value = buildSaveCode();
    box.querySelector('#save-copy').onclick = async () => {
      ta.select();
      let copied = false;
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(ta.value);
          copied = true;
        }
      } catch (e) { copied = false; }
      if (!copied && typeof document.execCommand === 'function') {
        try { document.execCommand('copy'); copied = true; } catch (e) { }
      }
      toast(copied ? '✓ Sauvegarde copiée !' : 'Code sélectionné : copiez-le (Ctrl+C ou appui long).', copied ? '' : 'warn');
    };
  } else {
    box.innerHTML = `<h3>📥 Restaurer une sauvegarde</h3>
      <p class="muted">Collez ici un code de sauvegarde exporté depuis le jeu, puis validez. ATTENTION : la progression actuelle sera remplacée.</p>
      <textarea id="save-code"></textarea>
      <div class="actions"><button class="btn gold" id="save-apply">Restaurer</button><button class="btn" id="save-close">Fermer</button></div>`;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    box.querySelector('#save-apply').onclick = () => {
      const r = applySaveCode(box.querySelector('#save-code').value);
      if (r.ok) { overlay.remove(); toast('✓ Sauvegarde restaurée !'); renderHome(document.getElementById('app')); }
      else toast(`✗ ${r.reason}`, 'warn');
    };
  }
  const closer = box.querySelector('#save-close');
  if (closer) closer.onclick = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function wireSaveBox(root) {
  const ex = root.querySelector('#btn-export-save');
  if (ex) ex.onclick = () => openSaveModal('export');
  const im = root.querySelector('#btn-import-save');
  if (im) im.onclick = () => openSaveModal('import');
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slotsPanelHtml() {
  const cards = listSlots().map((s) => {
    const sum = s.summary;
    const dName = sum ? (dungeonById(sum.dungeon)?.name ?? sum.dungeon) : '';
    const sumTxt = sum
      ? `${sum.gold} or · ${dName} étage ${sum.stage} · niv. ${sum.teamLevel}`
      : 'Emplacement vide';
    const dateTxt = s.date ? ' · ' + new Date(s.date).toLocaleDateString('fr-FR') : '';
    const activeBadge = s.active ? ' <span class="badge">en cours</span>' : '';
    const actions = s.empty
      ? `<button type="button" class="btn slot-act" data-slot-act="new" data-slot="${s.index}">✨ Nouvelle partie</button>`
      : `<button type="button" class="btn gold slot-act" data-slot-act="play" data-slot="${s.index}">▶ Jouer</button>
         <button type="button" class="btn slot-act" data-slot-act="rename" data-slot="${s.index}">✏️ Renommer</button>
         <button type="button" class="btn slot-act" data-slot-act="del" data-slot="${s.index}">🗑 Supprimer</button>`;
    return `<div class="slot-card${s.active ? ' active' : ''}${s.empty ? ' empty' : ''}">
      <h4>${escHtml(s.name)}${activeBadge}</h4>
      <p class="muted">${escHtml(sumTxt)}${escHtml(dateTxt)}</p>
      <div class="actions">${actions}</div>
    </div>`;
  }).join('');
  return `<div class="save-box slots-panel">
    <h3>🗂 Parties</h3>
    <p class="muted">${SAVE_SLOTS} parties peuvent coexister dans ce navigateur. La partie en cours est sauvegardée avant toute bascule ; l'export FCSAVE1 s'applique à la partie active.</p>
    <div class="slots-grid">${cards}</div>
  </div>`;
}

function wireSlotsPanel(root) {
  root.querySelectorAll('.slot-act').forEach((el) => {
    el.onclick = () => {
      const i = Number(el.dataset.slot);
      const act = el.dataset.slotAct;
      const nameOf = (k) => listSlots()[k]?.name ?? defaultSlotName(k);
      if (act === 'play') {
        if (i === activeSlot) { toast('Vous jouez déjà cette partie.'); return; }
        if (switchToSlot(i)) { toast('▶ ' + nameOf(i) + ' chargée.'); renderHome(document.getElementById('app')); }
        else toast('✗ Impossible de charger cette partie.', 'warn');
      } else if (act === 'new') {
        if (newSlot(i)) { toast('✨ ' + nameOf(i) + ' : nouvelle partie.'); renderHome(document.getElementById('app')); }
        else toast('✗ Impossible de créer cette partie.', 'warn');
      } else if (act === 'rename') {
        const name = prompt('Nouveau nom de la partie :', nameOf(i));
        if (name != null && renameSlot(i, name)) { toast('✏️ Partie renommée en « ' + nameOf(i) + ' ».'); renderHome(document.getElementById('app')); }
      } else if (act === 'del') {
        if (!confirm('Supprimer la partie « ' + nameOf(i) + ' » ?\nCartes, or et progression de cette partie seront perdus.')) return;
        if (!confirm('Vraiment supprimer « ' + nameOf(i) + ' » ? Cette action est définitive.')) return;
        deleteSlot(i);
        toast('🗑 Partie supprimée.');
        renderHome(document.getElementById('app'));
      }
    };
  });
}

function artGlyph(c) {
  return GLYPH[c.classe] ?? EL_GLYPH[c.element] ?? '🎴';
}
;





let filters = { classe: null, element: null, niv: null, rar: null }; 

function addCardIid(iid) {
  const inst = byIid(iid);
  if (!inst) return { ok: false, reason: 'Exemplaire introuvable.' };
  if (iidInTeam(iid)) return { ok: false, reason: 'Cet exemplaire est d\u00e9j\u00e0 en \u00e9quipe.' };
  if (store.team.slots.length >= TEAM_MAX) {
    return { ok: false, reason: '\u00c9quipe pleine (5 emplacements).' };
  }
  const card = byId(inst.id);
  if (card.dungeon === 'divin') {
    const fams = new Set();
    let divineCount = 0;
    for (const x of store.team.slots) {
      const xi = byIid(x);
      if (!xi) continue;
      const c = byId(xi.id);
      if (c.dungeon === 'divin') {
        divineCount += 1;
        fams.add(c.fam);
      }
    }
    if (fams.has(card.fam)) return { ok: false, reason: 'Une seule carte par famille divine.' };
    if (divineCount >= 3) return { ok: false, reason: 'Trois cartes divines maximum (une par famille).' };
  }
  const copies = usedInTeam(inst.id);
  const owned = store.collection.get(inst.id) ?? 0;
  if (copies >= 3) return { ok: false, reason: 'D\u00e9j\u00e0 3 exemplaires de cette carte plac\u00e9s.' };
  if (copies >= owned) return { ok: false, reason: 'Vous ne poss\u00e9dez pas d\u2019autre exemplaire libre.' };
  store.team.slots.push(iid);
  clearNewOf(inst.id); // carte placée en équipe : le badge « nouvelle carte » ✨ est retiré
  save();
  return { ok: true };
}

function addCard(id) {
  const free = instsOf(id).filter((i) => !iidInTeam(i.iid));
  free.sort((a, b) => (b.lvl - a.lvl) || (a.iid - b.iid));
  if (!free.length) {
    const any = instsOf(id)[0];
    if (!any) return { ok: false, reason: 'Vous ne poss\u00e9dez pas cette carte.' };
    return { ok: false, reason: iidInTeam(any.iid) ? 'Cet exemplaire est d\u00e9j\u00e0 en \u00e9quipe.' : 'Aucun exemplaire libre.' };
  }
  return addCardIid(free[0].iid);
}

function removeCard(idx) {
  const [id] = store.team.slots.splice(idx, 1);
  save();
  return id;
}

function dropCard(idx, data) {
  const srcIdx = Number(data);
  if (Number.isInteger(srcIdx) && srcIdx !== idx) {
    const [moved] = store.team.slots.splice(srcIdx, 1);
    store.team.slots.splice(Math.min(idx, store.team.slots.length), 0, moved);
    save();
  }
  renderEquipe(equipeRoot || document.getElementById('app'));
}

function switchTeam(dir) {
  store.activeTeam = (store.activeTeam + dir + store.teams.length) % store.teams.length;
  save();
  renderEquipe(equipeRoot || document.getElementById('app'));
}

function slotsHtml() {
  const ids = store.team.slots;
  const nAvant = (store.team.formation === '2-3') ? 2 : 3;
  const cell = (i) => {
    const iid = ids[i];
    const inst = iid ? byIid(iid) : null;
    if (inst) {
      const c = byId(inst.id);
      return `<div class="slot" data-idx="${i}" title="Fiche : appui court, appui long ou ℹ️ · Retirer : bouton ✕">${cardFront({ ...c, level: inst.lvl, ...statsAt(c, inst.lvl, inst.asc) }, { extraClass: hasArt(c) ? 'unit-art' : '' })}<button type="button" class="cell-btn slot-out" data-act="out" title="Retirer de l’équipe">✕</button>${inst.asc ? `<span class="owned-badge">+${inst.asc} %</span>` : ''}</div>`;
    }
    return `<div class="slot empty" data-idx="${i}"></div>`;
  };
  const rowCells = (from, to) => Array.from({ length: Math.max(0, to - from) }, (_, k) => cell(from + k)).join('');
  return `<div class="line team"><h3>\u00c9quipe (${ids.length}/${TEAM_MAX}) \u2014 formation ${store.team.formation === '2-3' ? '2 avant \u00b7 3 arri\u00e8re' : '3 avant \u00b7 2 arri\u00e8re'}</h3>
    <div class="row-lab">avant</div><div class="row">${rowCells(0, nAvant)}</div>
    <div class="row-lab">arri\u00e8re</div><div class="row back">${rowCells(nAvant, TEAM_MAX)}</div></div>`;
}

function synPanel() {
  const team = [...store.team.slots].filter(Boolean);
  const units = team
    .map((iid) => {
      const inst = byIid(iid);
      return inst ? { ...byId(inst.id), cardId: inst.id } : null;
    })
    .filter(Boolean);
  const active = activeTiers(units);
  const entries = [...active.entries()];
  const help = '<button class="btn-link" id="syn-help">d\u00e9tails ?</button>';
  if (!entries.length) {
    return `<div class="syn-panel"><h3>Synergies ${help}</h3><p class="muted">Aucune synergie active \u2014 m\u00e9langez classes et \u00e9l\u00e9ments.</p></div>`;
  }
  const items = entries
    .map(([type, tier]) => `<div class="syn t${tier}"><b>${type}</b> ${tierLabel(tier)} \u2014 ${SYNERGIES[type][tier].desc}</div>`)
    .join('');
  const divCount = units.filter((u) => u.race === 'divine').length;
  const divineLine = divCount >= 2
    ? `<div class="syn t1"><b>\ud83c\udf1f Divin</b> \u2014 ${divCount} cartes divines : +10 % d\u00e9g\u00e2ts ET +10 % soins en combat.</div>`
    : '';
  return `<div class="syn-panel"><h3>Synergies ${help}</h3>${items}${divineLine}</div>`;
}

function activeFilterCount() {
  let n = 0;
  for (const k of Object.keys(filters)) if (filters[k] !== null) n += 1;
  return n;
}

function filtersMenuHtml(draft) {
  const chip = (key, value, label) =>
    `<button type="button" class="chip ${String(draft[key]) === String(value) && value !== null ? 'on' : ''}" data-fkey="${key}" data-fvalue="${value ?? ''}">${label}</button>`;
  const uniq = (key) => [...new Set(CATALOG.map((c) => c[key]))];
  return `<h3>⚙️ Filtres de la collection</h3>
  <div class="filters">
    <div class="fgroup">${chip('classe', null, 'Toutes classes')}${uniq('classe').map((v) => chip('classe', v, v)).join('')}</div>
    <div class="fgroup">${chip('element', null, 'Tous éléments')}${uniq('element').map((v) => chip('element', v, v)).join('')}</div>
    <div class="fgroup">${chip('niv', null, 'Tous niveaux')}${chip('niv', 2, 'Nv ≥ 2')}${chip('niv', 3, 'Nv ≥ 3')}${chip('niv', 5, 'Nv ≥ 5')}</div>
    <div class="fgroup">${chip('rar', null, 'Toutes raretés')}${['C', 'UC', 'R', 'SR', 'UR', 'L', 'M'].map((v) => chip('rar', v, v)).join('')}</div>
  </div>
  <p class="muted">Sélectionnez vos filtres, puis validez : ils s'appliquent à la grille. Appuyez en dehors pour fermer sans rien changer.</p>`;
}

function openFiltersModal(root) {
  const draft = { ...filters };
  closeCardModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal filters-box';
  const wire = () => {
    box.querySelectorAll('.chip[data-fkey]').forEach((el) => {
      el.onclick = () => {
        const key = el.dataset.fkey;
        const value = el.dataset.fvalue || null;
        draft[key] = draft[key] === value ? null : value;
        render();
      };
    });
    box.querySelector('#filt-apply').onclick = () => {
      filters = draft;
      overlay.remove();
      renderEquipe(root);
    };
  };
  const render = () => {
    box.innerHTML = `${filtersMenuHtml(draft)}
    <div class="actions"><button type="button" class="btn" id="filt-apply">Valider</button></div>`;
    wire();
  };
  render();
  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function ownedCards() {
  return CATALOG.filter((c) => (store.collection.get(c.id) ?? 0) > 0)
    .filter((c) => (!filters.classe || c.classe === filters.classe))
    .filter((c) => (!filters.element || c.element === filters.element))
    .filter((c) => (!filters.niv || levelOf(c.id) >= Number(filters.niv)))
    .filter((c) => (!filters.rar || c.rarity === filters.rar))
    .sort((a, b) => RANK[a.rarity] - RANK[b.rarity] || a.name.localeCompare(b.name));
}

function openTeamModal(card) {
  openCardModal(card, {
    onChange: () => renderEquipe(equipeRoot || document.getElementById('app')),
    onAdd: () => addCard(card.id),
    onRemove: () => {
      const idx = store.team.slots.findIndex((x) => (byIid(x)?.id ?? null) === card.id);
      if (idx === -1) return { ok: false, reason: 'Pas dans l\u2019équipe.' };
      removeCard(idx);
      toast(`${card.name} retirée de l\u2019équipe`);
      return { ok: true };
    },
  });
}

// boucle v2 lot 4 : 2 slots d'équipe (effet sur toute l'équipe), éditables depuis la page Équipe
function teamEquipHtml() {
  const tb = equipTeamBonus();
  const slotBtn = (idx) => {
    const id = store.equipTeam[idx];
    const p = id ? EQUIP_BY_ID[id] : null;
    const label = p
      ? '🚩 <b>' + p.nom + '</b> <span class="chip r-' + p.rarity + '">' + (RARITY_LABEL[p.rarity] ?? p.rarity) + '</span> <span class="muted">' + pieceBonusText(p) + '</span>'
      : 'Slot d’équipe ' + (idx + 1) + ' — vide';
    return '<button type="button" class="btn small equip-slot" data-team-slot="' + idx + '">' + label + '</button>';
  };
  const stats = [['atkPct', 'ATQ'], ['hpPct', 'PV'], ['agiPct', 'AGI'], ['intPct', 'INT']];
  const bonusTxt = stats.filter(([k]) => tb[k] > 0).map(([k, nm]) => '+' + Math.round(tb[k] * 100) + ' % ' + nm + ' équipe').join(' · ');
  const bonusLine = bonusTxt
    ? '<p class="muted">Bonus d’équipe actuel : <b>' + bonusTxt + '</b>' + (tb.manaRegen ? ' · +' + tb.manaRegen + ' régén mana' : '') + '</p>'
    : '<p class="muted">Aucun bonus d’équipe.</p>';
  return '<h3>Équipement d’équipe</h3> <div class="equip-slots">' + slotBtn(0) + slotBtn(1) + '</div> ' + bonusLine;
}
function openTeamEquipPicker(idx) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const list = EQUIPMENT.filter((p) => p.slot === 'equipe' && equipPieceCount(p.id) > 0);
  const rows = list.map((p) => `<button type="button" class="btn tac-btn equip-pick r-${p.rarity}" data-piece="${p.id}"><b>${p.nom}</b> <span class="chip r-${p.rarity}">${RARITY_LABEL[p.rarity]}</span> <span class="muted">${pieceBonusText(p)} ×${equipPieceCount(p.id)}</span></button>`).join('');
  overlay.innerHTML = `<div class="modal-box">
    <h3>Slot d'équipe ${idx + 1}</h3>
    <p class="muted">Pièces d'équipe possédées. Actuellement : <b>${store.equipTeam[idx] ? EQUIP_BY_ID[store.equipTeam[idx]].nom : 'rien'}</b>.</p>
    <div class="recomp-list">${rows || '<p class="muted">Aucune pièce d\'équipe possédée.</p>'}
      <button type="button" class="btn tac-btn" data-piece="">Déséquiper</button></div>
    <div class="modal-actions"><button class="btn" id="equip-close">Fermer</button></div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#equip-close').onclick = () => overlay.remove();
  overlay.querySelectorAll('.equip-pick').forEach((b) => {
    b.onclick = () => {
      store.equipTeam[idx] = b.dataset.piece || null;
      save();
      overlay.remove();
      renderEquipe(equipeRoot || document.getElementById('app'));
      toast(b.dataset.piece ? `✓ ${EQUIP_BY_ID[b.dataset.piece].nom} équipé (équipe).` : '✓ Slot d\'équipe déséquipé.');
    };
  });
}

// reste code lot 7 : page Personnage à onglets (Équipe + Inventaire + équipement), bouton retour
let persoTab = 'equipe';
function renderPersonnage(root) {
  root.innerHTML = `
    <div class="top"><h2>🧝 Personnage</h2><span class="spacer"></span><button type="button" class="back" id="perso-back" title="Retour à l'accueil">←</button></div>
    <div class="tabs" style="display:flex;gap:8px;margin:4px 0 12px">
      <button type="button" class="btn${persoTab === 'equipe' ? ' gold' : ''}" id="tab-equipe">🛡️ Équipe</button>
      <button type="button" class="btn${persoTab === 'inventaire' ? ' gold' : ''}" id="tab-inventaire">🎒 Inventaire</button>
    </div>
    <div id="perso-body"></div>`;
  const body = root.querySelector('#perso-body');
  root.querySelector('#perso-back').onclick = () => go('#accueil');
  root.querySelector('#tab-equipe').onclick = () => { persoTab = 'equipe'; renderPersonnage(root); };
  root.querySelector('#tab-inventaire').onclick = () => { persoTab = 'inventaire'; renderPersonnage(root); };
  (persoTab === 'inventaire' ? renderInventaire : renderEquipe)(body);
}

// reste code lot 7 : la page Personnage embarque Équipe et Inventaire — leurs re-rendus internes
// doivent cibler le conteneur courant, pas forcément #app
let equipeRoot = null;
function renderEquipe(root) {
  equipeRoot = root;
  const owned = CATALOG.filter((c) => (store.collection.get(c.id) ?? 0) > 0);
  const visible = ownedCards();
  const nFiltered = owned.length - visible.length;
  const cells = visible
    .map((c) => instsOf(c.id)
      .map((inst) => {
        const inTeam = iidInTeam(inst.iid);
        return `<div class="gcell cat ${inTeam ? 'dimmed' : ''}" data-iid="${inst.iid}" data-id="${c.id}" title="Fiche : appui court, appui long ou ℹ️ · ${inTeam ? 'Retirer de l’équipe : bouton −' : 'Ajouter à l’équipe : bouton ＋'}">${cardFront({ ...c, level: inst.lvl, ...statsAt(c, inst.lvl, inst.asc) }, { extraClass: hasArt(c) ? 'unit-art' : '' })}<span class="cell-actions"><button type="button" class="cell-btn" data-act="fiche" title="Voir la fiche">ℹ️</button><button type="button" class="cell-btn" data-act="${inTeam ? 'out' : 'in'}" title="${inTeam ? 'Retirer de l’équipe' : 'Ajouter à l’équipe'}">${inTeam ? '−' : '＋'}</button></span>${inTeam ? `<span class="in-team">en équipe</span>` : ''}${inst.asc ? `<span class="owned-badge">+${inst.asc} %</span>` : ''}${anyNewOf(c.id) ? `<span class="new-badge" title="Nouvelle carte !">✨</span>` : ''}</div>`;
      })
      .join(''))
    .join('');
  root.innerHTML = `
    <h2><button type="button" class="back" id="equipe-back" title="Retour à l'accueil">←</button> Mon équipe <span class="team-switch"><button type="button" class="btn" id="team-prev" title="Équipe précédente">◀</button><span class="muted">(Équipe ${store.activeTeam + 1}/3)</span><button type="button" class="btn" id="team-next" title="Équipe suivante">▶</button></span></h2>
    <p class="muted"><b>Fiche</b> : appui court, appui long ou ℹ️ sur une carte (fonctionne même équipe pleine). <b>Ajouter / retirer</b> : boutons ＋ / − explicites — plus d’ajout au double-clic. 5 emplacements libres, dans n'importe quel ordre : les cartes font tout (frapper et soigner selon leurs sorts). Les cartes non possédées restent à dévoiler : voir l'onglet Collection.</p>
    <p class="muted">Formation (figée pendant le combat) : <button type="button" class="btn small${store.team.formation === '2-3' ? '' : ' gold'}" id="form-3-2">3 avant \u00b7 2 arri\u00e8re</button> <button type="button" class="btn small${store.team.formation === '2-3' ? ' gold' : ''}" id="form-2-3">2 avant \u00b7 3 arri\u00e8re</button></p>
    ${slotsHtml()}
    ${teamEquipHtml()}
    ${synPanel()}
    ${owned.length === 0
      ? '<p class="empty-collection muted">Votre collection est vide — recrutez à la Guilde, au marchand de la Boutique, ou en quêtes !</p>'
      : `<h3>Ma collection (${owned.length} carte${owned.length > 1 ? 's' : ''} possédée${owned.length > 1 ? 's' : ''}${nFiltered ? `, ${visible.length} affichée${visible.length > 1 ? 's' : ''} après filtres` : ''})</h3><button type="button" class="btn small" id="open-filters">⚙️ Filtres${activeFilterCount() ? ` (${activeFilterCount()})` : ''}</button>${visible.length === 0
        ? `<p class="empty-collection">Aucune carte ne correspond aux filtres actifs (${owned.length} possédée${owned.length > 1 ? 's' : ''}). <button class="btn" id="reset-filters">Réinitialiser les filtres</button></p>`
        : `<div class="grid">${cells}</div>`}`}`;

  root.querySelector('#equipe-back')?.addEventListener('click', () => go('#accueil'));
  root.querySelector('#syn-help')?.addEventListener('click', openSynergyModal);
  root.querySelectorAll('.equip-slot[data-team-slot]').forEach((el) => {
    el.onclick = () => openTeamEquipPicker(Number(el.dataset.teamSlot));
  });
  root.querySelector('#team-prev')?.addEventListener('click', () => switchTeam(-1));
  root.querySelector('#team-next')?.addEventListener('click', () => switchTeam(1));
  root.querySelector('#form-3-2')?.addEventListener('click', () => { store.team.formation = '3-2'; save(); renderEquipe(root); });
  root.querySelector('#form-2-3')?.addEventListener('click', () => { store.team.formation = '2-3'; save(); renderEquipe(root); });
  root.querySelector('#reset-filters')?.addEventListener('click', () => {
    filters = { classe: null, element: null, niv: null, rar: null };
    renderEquipe(root);
  });
  const filtBtn = root.querySelector('#open-filters');
  if (filtBtn) filtBtn.onclick = () => openFiltersModal(root);
  root.querySelectorAll('.slot').forEach((slot) => {
    if (slot.dataset.idx === undefined) return;
    const idx = Number(slot.dataset.idx);
    slot.addEventListener('dragover', (e) => e.preventDefault());
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('text/plain');
      if (data) dropCard(idx, data);
    });
    const card = slot.querySelector('.card');
    if (card) {
      // correctifs lot 4 : les gestes ouvrent la fiche ; le retrait passe par le bouton ✕ explicite
      onTap(card, {
        tap: (e) => {
          if (e.target.closest('.cell-btn')) return;
          const iid2 = store.team.slots[idx];
          const inst2 = byIid(iid2);
          if (inst2) openTeamModal(byId(inst2.id));
        },
        long: (e) => {
          if (e.target.closest('.cell-btn')) return;
          const iid2 = store.team.slots[idx];
          const inst2 = byIid(iid2);
          if (inst2) openTeamModal(byId(inst2.id));
        },
      });
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', String(idx));
        card.classList.add('dragged');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragged'));
    }
    const outBtn = [...slot.querySelectorAll('.cell-btn')].find((b) => b.dataset.act === 'out') ?? null;
    if (outBtn) {
      outBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      outBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const iid2 = store.team.slots[idx];
        const inst2 = byIid(iid2);
        removeCard(idx);
        toast(`${inst2 ? byId(inst2.id).name : 'Carte'} retirée de l’équipe`);
        renderEquipe(root);
      });
    }
  });
  root.querySelectorAll('.gcell').forEach((el) => {
    if (!el.classList.contains('cat')) return;
    const iid = Number(el.dataset.iid);
    const fiche = () => { const inst = byIid(iid); if (inst) openTeamModal(byId(inst.id)); };
    // correctifs lot 4 : les gestes ouvrent la fiche (même équipe pleine) ; l'ajout/retrait passe par les boutons explicites
    onTap(el, {
      tap: (e) => { if (!e.target.closest('.cell-btn')) fiche(); },
      long: (e) => { if (!e.target.closest('.cell-btn')) fiche(); },
    });
    el.querySelectorAll('.cell-btn').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const inst = byIid(iid);
        if (!inst) { toast('Exemplaire introuvable.', 'warn'); return; }
        if (b.dataset.act === 'fiche') { fiche(); return; }
        if (b.dataset.act === 'in') {
          const r = addCardIid(iid);
          if (r.ok) {
            toast(`${inst.name || byId(inst.id).name} rejoint l’équipe (${store.team.slots.length}/${TEAM_MAX})`);
            renderEquipe(root);
          } else {
            toast(`✗ ${r.reason}`, 'warn');
          }
        } else {
          const idx = store.team.slots.indexOf(inst.iid);
          if (idx >= 0) {
            removeCard(idx);
            toast(`${byId(inst.id).name} retirée de l’équipe`);
            renderEquipe(root);
          }
        }
      });
    });
  });
}
;



;

;

function ownedOf(id) {
  return store.collection.get(id) ?? 0;
}

// correctifs lot 5 : cellule possédée unique pour toute la page Collection
function ownedCell(id, title = 'Voir la fiche') {
  const c = byId(id);
  const n = ownedOf(id);
  return `<div class="fam-card owned" data-id="${id}" title="${title}">
    ${cardFront({ ...c, level: levelOf(id) }, { extraClass: hasArt(c) ? 'unit-art' : '' })}
    ${n > 1 ? `<span class="owned-badge">×${n}</span>` : ''}
  </div>`;
}

function seenCell(id) {
  const c = byId(id);
  const badge = c.dungeon === 'divin' ? 'vue au défi' : c.dungeon ? 'vue en donjon' : 'plus possédée';
  return `<div class="fam-card seen" data-id="${id}" title="Déjà dévoilée — ${badge}">
    ${cardFront({ ...c, level: levelOf(id) }, { extraClass: hasArt(c) ? 'unit-art' : '' })}
    <span class="seen-badge">${badge}</span>
  </div>`;
}

function mysteryCell(id) {
  const c = byId(id);
  return `<div class="fam-card mystery" title="Encore à dévoiler">
    <div class="mystery-glyph">${GLYPH[c.classe] ?? '❔'}</div>
    <div class="mystery-rar">${c.rarity}</div>
    <div class="mystery-name">${c.name}</div>
  </div>`;
}

function secretCell(name) {
  return `<div class="fam-card mystery secret" title="Le sommet de la lignée…">
    <div class="mystery-glyph">🔒</div>
    <div class="mystery-rar">L</div>
    <div class="mystery-name">${name ?? '???'}</div>
  </div>`;
}

function famSection(famKey) {
  const fam = FAMILIES[famKey];
  const known = fam.steps.some((id) => ownedOf(id) > 0);
  const hasTop = ownedOf(fam.steps[fam.steps.length - 1]) > 0;
  const count = fam.steps.filter((id) => ownedOf(id) > 0).length;
  const gates = Object.entries(SOLO_STEPS).filter(([from, to]) => fam.steps.includes(to) && byIdSoft(from)).map(([from, to]) => ({ from, to }));
  const gateRow = gates.map((g) => `${ownedOf(g.from) > 0 ? ownedCell(g.from) : seenCard(g.from) ? seenCell(g.from) : mysteryCell(g.from)}<span class="evo-arrow" title="${byId(g.from).name} évolue vers ${byId(g.to).name}">→</span>`).join('');
  if (!known) {
    
    
    const silhouettes = fam.steps.map(() => `<div class="fam-card mystery"><div class="mystery-glyph">❔</div><div class="mystery-rar">?</div><div class="mystery-name">???</div></div>`).join('<span class="evo-arrow">→</span>');
    return `<div class="fam">
      <h3>${fam.name} <span class="muted">0/${fam.steps.length} — à découvrir</span></h3>
      <p class="muted fam-hint">Le premier maillon de cette lignée révèle toute la chaîne.</p>
      <div class="fam-chain">${gateRow}${silhouettes}</div>
    </div>`;
  }
  const cells = fam.steps
    .map((id) => (ownedOf(id) > 0 ? ownedCell(id) : seenCard(id) ? seenCell(id) : mysteryCell(id)))
    .join('<span class="evo-arrow">→</span>');
  const future = (fam.future ?? []).length && hasTop
    ? `<span class="evo-arrow">→</span>${fam.future.map((f) => secretCell(f)).join('')}`
    : '';
  const sh = store.shards[famKey] ?? 0;
  
  
  
  return `<div class="fam">
    <h3>${fam.name} <span class="muted">${count}/${fam.steps.length}${future ? ' · sommet en vue !' : ''}${sh ? ` · ✦ ${sh}/${SHARD_MAX} éclats fondus (+${shardPct(sh)} %)` : ''}</span></h3>
    <div class="fam-chain">${gateRow}${cells}${future}</div>
  </div>`;
}

function monsterCell(id) {
  if (ownedOf(id) > 0) return ownedCell(id);
  if (seenCard(id)) return seenCell(id);
  return mysteryCell(id);
}

function monsterFamSection(fam) {
  const all = [...fam.lines.flat(), ...(fam.side ?? []), ...(fam.mythic ? [fam.mythic] : [])];
  const known = all.some((id) => ownedOf(id) > 0 || seenCard(id));
  if (!known) {
    const silhouettes = all.map(() => `<div class="fam-card mystery"><div class="mystery-glyph">❔</div><div class="mystery-rar">?</div><div class="mystery-name">???</div></div>`).join('');
    return `<div class="fam">
      <h3>${fam.name} <span class="muted">0/${all.length} — à découvrir</span></h3>
      <div class="fam-chain">${silhouettes}</div>
    </div>`;
  }
  const chains = fam.lines
    .map((line, li) => `${li > 0 ? '<span class="evo-arrow">↳</span>' : ''}${line.map(monsterCell).join('<span class="evo-arrow">→</span>')}`)
    .join(' ');
  const side = fam.side && fam.side.length
    ? `<div class="fam-chain"><span class="muted fam-hint">Cousins</span>${fam.side.map(monsterCell).join('')}</div>`
    : '';
  const mythic = fam.mythic
    ? `<div class="fam-chain"><span class="evo-arrow">✦</span>${monsterCell(fam.mythic)}</div>`
    : '';
  const count = all.filter((id) => ownedOf(id) > 0).length;
  return `<div class="fam">
    <h3>${fam.name} <span class="muted">${count}/${all.length}</span></h3>
    <div class="fam-chain">${chains}</div>
    ${side}${mythic}
  </div>`;
}

function renderCollection(root) {
  const discovered = CATALOG.filter((c) => ownedOf(c.id) > 0).length;
  
  const raciales = CATALOG.filter((c) => c.raciale);
  const raceGroup = (race) => raciales.filter((c) => raceOfCard(c) === race);
  const racCells = (ids) => ids
    .map((c) => {
      const n = ownedOf(c.id);
      const tg = evoTargetsOf(c.id);
      if (n === 0 && !seenCard(c.id)) return '';
      if (n === 0) return seenCell(c.id);
      const titre = `${RACE_GLYPH[raceOfCard(c)]} ${RACE_LABEL[raceOfCard(c)]}${tg.length ? ` — ${tg.length > 1 ? 'évolue au choix en ' : 'évolue en '}${tg.map((t) => byId(t).name).join(' · ')}` : ''} · Voir la fiche`;
      return ownedCell(c.id, titre);
    })
    .join('');
  const raceGrid = (race) => {
    const grp = raceGroup(race);
    const cells = racCells(grp);
    return cells ? `<div class="fam-chain">${cells}</div>` : `<p class="muted fam-hint">Aucune pour l\u2019instant — les naissances viennent du départ, des quêtes et de la Guilde.</p>`;
  };
  
  const dungeonFamsOfRace = (race) => {
    const out = [];
    for (const [dgKey, fams] of Object.entries(MONSTER_FAMS)) {
      if (dgKey === 'divin') continue;
      for (const fam of fams) {
        const firstId = fam.lines.flat()[0] ?? fam.side?.[0];
        if (firstId && raceOfCard(byId(firstId)) === race) out.push(fam);
      }
    }
    return out;
  };
  
  const solos = CATALOG.filter((c) => !c.family && !c.dungeon && !c.raciale);
  const solosOwned = solos.filter((c) => ownedOf(c.id) > 0);
  const solosSeen = solos.filter((c) => ownedOf(c.id) === 0 && seenCard(c.id));
  const solosHidden = solos.length - solosOwned.length - solosSeen.length;
  const soloCells = solosOwned
    .map((c) => {
      const level = levelOf(c.id);
      const n = ownedOf(c.id);
      const titre = `${SOLO_STEPS[c.id] ? `Évolue en ${byId(SOLO_STEPS[c.id]).name} (niveau 10 + éclats à la Guilde)` : 'Voir la fiche'}`;
      return ownedCell(c.id, titre);
    })
    .join('') + solosSeen.map((c) => seenCell(c.id)).join('');
  root.innerHTML = `
    <h2>Collection <span class="muted">${discovered}/${CATALOG.length} dévoilées</span></h2>
    <p class="muted">Le catalogue est organis\u00e9 comme la hi\u00e9rarchie des races : l\u2019humaine (la base), la monstre (+10 % de stats), la mystique (+20 %), la divine (+30 %). Chaque maillon se d\u00e9voile quand vous le poss\u00e9dez ; le sommet d\u2019une lign\u00e9e reste un myst\u00e8re jusqu\u2019\u00e0 son UR.</p>
    <h3 class="race-band">${RACE_GLYPH.humaine} Race humaine — la base <span class="muted">${solosOwned.length + raceGroup('humaine').filter((c) => ownedOf(c.id) > 0).length} portes d\u2019entr\u00e9e</span></h3>
    <div class="fam">
      <h4>Les 4 Novices — la naissance au hasard</h4>
      <p class="muted fam-hint">Le novice est tiré au hasard au d\u00e9part ; le PREMIER CHOIX DU JOUEUR arrive \u00e0 la premi\u00e8re \u00e9volution : chaque Novice ouvre ses voies (l\u2019\u00e9p\u00e9e va du guerrier \u00e0 la sylvestre, le mage choisit son \u00e9l\u00e9ment ou la lumi\u00e8re, le pr\u00eatre la foi ou la garde, le voleur l\u2019assassinat ou les quais).</p>
      ${raceGrid('humaine')}
    </div>
    ${FAM_ORDER.map(famSection).join('')}
    <div class="fam">
      <h4>Les mini-lign\u00e9es — greffes et raccourcis</h4>
      <p class="muted fam-hint">Fête et Quais se greffent sur le voleur, Routes sur la voie du chevalier, Dunes sur la voie sylvestre ; Berges et Guet restent des lign\u00e9es ind\u00e9pendantes. Une mini-lign\u00e9e monte jusqu\u2019\u00e0 sa R par \u00e9volution normale.</p>
      ${solosOwned.length ? `<div class="fam-chain">${soloCells}</div>` : '<p class="muted fam-hint">Aucune pour l\u2019instant.</p>'}
      ${solosHidden > 0 ? `<p class="muted fam-hint">Et ${solosHidden} autre${solosHidden > 1 ? 's' : ''} encore cach\u00e9${solosHidden > 1 ? 's' : ''} quelque part…</p>` : ''}
    </div>
    ${(() => { const arch = CATALOG.filter((c) => c.archived && ownedOf(c.id) > 0); return arch.length ? `<div class="fam"><h4>Les archives — les anciennes cartes</h4><p class="muted fam-hint">Ces cartes d’anciennes familles ne se tirent plus : elles restent jouables mais n’entrent dans aucun arbre ni aucune évolution.</p><div class="fam-chain">${arch.map((c) => ownedCell(c.id)).join('')}</div></div>` : ''; })()}
    ${dungeonFamsOfRace('humaine').length ? `<h3 class="race-band">— formes humaines du Z\u00e9nith —</h3>${dungeonFamsOfRace('humaine').map(monsterFamSection).join('')}` : ''}
    <h3 class="race-band">${RACE_GLYPH.monstre} Race monstre — le bestial <span class="muted">${raceGroup('monstre').filter((c) => ownedOf(c.id) > 0).length}/${raceGroup('monstre').length} naissances d\u00e9voil\u00e9es \u00b7 stats de base +10 %</span></h3>
    <div class="fam">
      <h4>Les 5 Embryons — les affinit\u00e9s</h4>
      <p class="muted fam-hint">Eaux, Flammes, Vivant, T\u00e9n\u00e8bres, Cieux : l\u2019affinit\u00e9 est tir\u00e9e \u00e0 la naissance, sans \u00e9l\u00e9ment. Leurs webs de biome s\u2019ouvriront avec les choix multi-voies (prochain patch).</p>
      ${raceGrid('monstre')}
    </div>
    ${dungeonFamsOfRace('monstre').map(monsterFamSection).join('')}
    <h3 class="race-band">${RACE_GLYPH.mystique} Race mystique — la sup\u00e9rieure <span class="muted">${raceGroup('mystique').filter((c) => ownedOf(c.id) > 0).length}/${raceGroup('mystique').length} naissances d\u00e9voil\u00e9es \u00b7 stats de base +20 %</span></h3>
    <div class="fam">
      <h4>Les 3 Enge — les essences</h4>
      <p class="muted fam-hint">Brumes, Bois, Caveaux : l\u2019essence est tir\u00e9e \u00e0 la naissance. Les familles d\u2019accueil (Sir\u00e8nes, Gens des S\u00e8ves, lign\u00e9es de la Crypte) les re\u00e7oivent \u00e0 leur premi\u00e8re \u00e9volution.</p>
      ${raceGrid('mystique')}
    </div>
    ${dungeonFamsOfRace('mystique').map(monsterFamSection).join('')}
    <h3 class="race-band">${RACE_GLYPH.divine} Race divine — la noble <span class="muted">${raceGroup('divine').filter((c) => ownedOf(c.id) > 0).length}/${raceGroup('divine').length} naissances d\u00e9voil\u00e9es \u00b7 stats de base +30 % \u00b7 bonus d\u2019\u00e9quipe</span></h3>
    <div class="fam">
      <h4>Ange, D\u00e9mon, \u00c9veill\u00e9 du Seuil — les trois naissances</h4>
      <p class="muted fam-hint">Le tirage divin (5 % du d\u00e9fi du jour) tire le camp au hasard. L\u2019\u00c9veill\u00e9 du Seuil ne choisit pas de camp : hors oppositions, comme toute carte sans \u00e9l\u00e9ment.</p>
      ${raceGrid('divine')}
    </div>
    ${MONSTER_FAMS.divin.map(monsterFamSection).join('')}`;
  root.querySelectorAll('.fam-card').forEach((el) => {
    if (!el.classList.contains('seen')) return;
    onTap(el, {
      tap: () => openCardModal(byId(el.dataset.id)),
      long: () => openCardModal(byId(el.dataset.id)),
    });
  });
  root.querySelectorAll('.fam-card').forEach((el) => {
    if (!el.classList.contains('owned')) return;
    // correctifs lot 4 : les gestes ouvrent la fiche ; l'ajout à l'équipe passe par le bouton ＋ de la fiche
    onTap(el, {
      tap: () => openCardModal(byId(el.dataset.id), { onAdd: () => addCard(el.dataset.id) }),
      long: () => openCardModal(byId(el.dataset.id), { onAdd: () => addCard(el.dataset.id) }),
    });
  });
}
;



const SPEEDS = [1200, 600, 300, 150, 75, 38, 19];
const SPEED_LABELS = ['\u00d70,5', '\u00d71', '\u00d72', '\u00d74', '\u00d78', '\u00d716', '\u00d732'];
let combatApp = null;
let state = null;
let speedIdx = 1;
let autoMode = true;
let busy = false;
let chainTimer = null;
let recompOpen = false; // boucle v2 lot 4 : l'écran Récompenses bloque la chaîne d'étages jusqu'à « Tout ramasser »
let reduceFlashes = false; 

let combatTally = { auto: 0, manual: 0 };
let lastTactMult = 1;

let runLog = null;
function freshRunLog() { return { points: 0, cards: [], monsters: [], shards: [], stages: 0, guaranteed: 0, xp: [], tokens: [], gems: [], xpBase: 0 }; }

let actBox = null;
let promptState = null;
const ACT_ABORT = Symbol('act-abort');
let combatGen = 0;
let tacPaused = false;
let tacChainTimer = null;

// rail d'ordre du tour : tout le monde dans l'ordre d'action (moteur : agilite decroissante, equipe d'abord a egalite)
function railItems() {
  if (!state) return [];
  if (state.round && state.round.items) return state.round.items;
  const items = [];
  [...(state.team.avant ?? []), ...(state.team.arriere ?? [])].forEach((u) => { if (u.alive) items.push({ u, side: 'team' }); });
  [...(state.enemies.avant ?? []), ...(state.enemies.arriere ?? [])].forEach((u) => { if (u.alive) items.push({ u, side: 'enemies' }); });
  items.sort((a, b) => (b.u.agi - a.u.agi) || (a.side === b.side ? 0 : (a.side === 'team' ? -1 : 1)));
  return items;
}
function renderRail(actorUid = null) {
  if (!combatApp) return;
  const railEl = combatApp.querySelector('#rail');
  if (!railEl) return;
  railEl.innerHTML = railItems().map((it) => {
    const u = it.u;
    const cls = ['rail-chip', it.side === 'team' ? 'mine' : 'foe', actorUid && u.uid === actorUid ? 'acting' : '', u.alive ? '' : 'ko']
      .filter(Boolean).join(' ');
    return `<div class="${cls}" data-uid="${u.uid}"><span class="rc-nm">${u.name}</span><span class="rc-agi">\u26a1${u.agi}</span></div>`;
  }).join('');
}

function fightLabel() {
  if (autoMode) return 'Combattre';
  return tacPaused ? '\u25b6 Lancer le tour' : '\u23f8 Pause';
}
function syncFightBtn() {
  const fb = combatApp ? combatApp.querySelector('#fight') : null;
  if (fb) fb.textContent = fightLabel();
}

function clearActHighlights() {
  if (!combatApp) return;
  for (const el of combatApp.querySelectorAll('.unit')) el.classList.remove('targeted', 'zone2');
}

// --- ciblage v2 : libellés d'action (coût mana + zone) depuis les données ---
function spellDefOfName(name) {
  return (DATA.grimoire?.ecole ?? []).find((s) => s.nom === name) ?? null;
}
function zoneLabelOf(sp) {
  const def = spellDefOfName(sp?.name);
  const cran = def?.crans?.II ?? def?.crans?.I;
  const l = cran?.largeur;
  if (l === 2) return 'zone de 2';
  if (l === 3) return 'zone de 3';
  if (l === 5) return 'tous les ennemis';
  if (l === 'equipe') return "l'équipe";
  return '';
}
function zoneWidthOf(sp) {
  const def = spellDefOfName(sp?.name);
  const cran = def?.crans?.II ?? def?.crans?.I;
  const l = Number(cran?.largeur);
  return Number.isFinite(l) && l >= 2 ? Math.min(l, 5) : 1;
}

// detail d'un sort : badge de type (le libelle vient du role d'ecole, data/engine.json)
function spellBadgeHtml(sp) {
  const role = sp?.role ?? null;
  if (role) return `<span class="sort-badge b-${role}">${SPELL_ROLE_LABEL[role] ?? role}</span>`;
  if (sp?.cat) return `<span class="sort-badge b-cat">sort ${SPELL_CAT_LABEL[sp.cat] ?? sp.cat}</span>`;
  return '';
}
// meta d'un sort : ecole · categorie · puissance · cible/zone (tout vient des data)
function spellMetaHtml(sp) {
  const bits = [];
  const school = sp?.ecole ? (SCHOOLS[sp.ecole] ?? null) : null;
  if (school) bits.push(school.nom);
  const roleLab = sp?.role ? (DATA.engine.SPELL_ROLE_LABEL?.[sp.role] ?? sp.role) : null;
  if (roleLab) bits.push(roleLab);
  if (sp?.cat) bits.push('sort ' + (SPELL_CAT_LABEL[sp.cat] ?? sp.cat));
  if (sp?.mult) bits.push('\u00d7' + String(sp.mult).replace('.', ',') + ' ATQ');
  if (sp?.taux) bits.push(Math.round(sp.taux * 100) + ' %');
  const zone = zoneLabelOf(sp);
  if (zone) bits.push(zone);
  else if (sp?.cible) bits.push(sp.cible);
  return bits.join(' \u00b7 ');
}
function pendingLabel(mode, pending, u) {
  if (pending.kind === 'attack') return '⚔ Attaque';
  if (pending.kind === 'basic') return '✚ Soin de base';
  if (pending.kind === 'pass') return '⏸ Attendre';
  if (pending.kind === 'spell' || pending.kind === 'cast') {
    const sp = (u.spells ?? [])[pending.idx ?? 0];
    if (!sp) return '✦ Sort';
    const zone = zoneLabelOf(sp);
    return `✦ ${sp.name} <span class="muted">— ✦${sp.cost} mana${zone ? ' · ' + zone : ''}</span>`;
  }
  return '';
}

// --- zone de 2 au survol : la carte survolée + sa voisine contiguë s'allument ---
function clearZonePreview() {
  if (!combatApp) return;
  for (const el of combatApp.querySelectorAll('.unit.zone2')) el.classList.remove('zone2');
}
function previewZone(el) {
  clearZonePreview();
  const ps = promptState;
  if (!ps || ps.phase !== 'target' || !el) return;
  const pending = ps.pending ?? {};
  let largeur = 1;
  if (pending.kind === 'spell' || pending.kind === 'cast') {
    const sp = (ps.unit.spells ?? [])[pending.idx ?? 0];
    if (sp) largeur = zoneWidthOf(sp);
  }
  if (largeur < 2) return;
  const row = el.closest('.row');
  if (!row) return;
  const units = [...row.querySelectorAll('.unit')];
  const i = units.indexOf(el);
  if (i < 0) return;
  el.classList.add('zone2');
  let n = 1;
  while (n < largeur && i + n < units.length) {
    const nx = units[i + n];
    if (nx._unit && nx._unit.alive && nx.classList.contains('targeted')) { nx.classList.add('zone2'); n++; }
    else break;
  }
}
function bindTargetHover() {
  if (!combatApp) return;
  for (const el of combatApp.querySelectorAll('.unit.targeted')) {
    el.onmouseenter = () => previewZone(el);
    el.onmouseleave = () => clearZonePreview();
  }
}

function closeActModal() {
  if (actBox) { actBox.remove(); actBox = null; }
  clearActHighlights();
  const ps = promptState;
  promptState = null;
  if (ps && ps.pick) ps.pick(ACT_ABORT);
}

function renderActModal(u, zoneHtml) {
  closeCardModal();
  if (actBox) { actBox.remove(); actBox = null; }
  const card = byIdSoft(u.cardId) ?? { id: u.cardId, name: u.name, spells: u.spells ?? [] };
  actBox = document.createElement('div');
  actBox.className = 'act-modal';
  actBox.innerHTML = `
    <div class="act-head">
      <div class="act-art">${artOf(card)}</div>
      <div class="act-title"><b>${u.name}</b> <span class="muted">— à vous d’agir</span><br>
      <span class="act-stats">♥ ${u.hp}/${u.maxHp} · ⚔ ${Math.max(0, Math.round(u.atk * (1 + u.atkBuff)))} · ✦ ${u.mana}/${u.manaMax}</span></div>
      <button type="button" class="btn ctrl act-reduce" title="Réduire ou rouvrir la fenêtre d’action">▾ réduire</button>
    </div>
    <div class="act-zone">${zoneHtml}</div>`;
  document.body.appendChild(actBox);
  const redBtn = actBox.querySelector('.act-reduce');
  if (redBtn) redBtn.onclick = () => {
    actBox.classList.toggle('reduced');
    redBtn.textContent = actBox.classList.contains('reduced') ? '▴ ouvrir' : '▾ réduire';
  };
}

function askActTarget(mode, pending) {
  if (!promptState) return;
  promptState.phase = 'target';
  promptState.mode = mode;
  promptState.pending = pending;
  const list = (mode === 'enemy' || mode === 'zone')
    ? [...state.enemies.avant, ...state.enemies.arriere].filter((e) => e.alive)
    : [...state.team.avant, ...state.team.arriere].filter((a) => a.alive);
  if (!list.length) {
    if (mode === 'enemy') promptState.pick({ ...promptState.pending });
    return;
  }
  clearActHighlights();
  for (const t of list) {
    const el = elOf(t.uid);
    if (el) el.classList.add('targeted');
  }
  bindTargetHover();
  if (!actBox) return;
  const zoneEl = actBox.querySelector('.act-zone');
  if (!zoneEl) return;
  const lab = pendingLabel(mode, pending, promptState.unit ?? {});
  const hint = mode === 'zone' ? 'posez le centre de la zone sur un ennemi' : 'ou touchez un pion illumin\u00e9';
  zoneEl.innerHTML = `<div class="act-targetbar"><p class="act-lab">Choisissez votre cible — ${lab} <span class="muted">(${hint})</span></p>`
    + `<button type="button" class="btn tac-btn act-cancel">\u21a9 Annuler</button></div>`
    + list.map((t) => `<button type="button" class="btn tac-btn act-target" data-uid="${t.uid}"><b>${t.name}</b> <span class="muted">\u2665 ${t.hp}/${t.maxHp}</span></button>`).join(' ');
  const cancelBtn = zoneEl.querySelector('.act-cancel');
  if (cancelBtn) cancelBtn.onclick = () => { if (promptState && promptState.showActions) promptState.showActions(); };
  zoneEl.querySelectorAll('.act-target').forEach((b) => {
    b.onclick = () => {
      if (!promptState || promptState.phase !== 'target') return;
      const uid = b.dataset.uid;
      const choice = (mode === 'enemy' || mode === 'zone') ? { ...promptState.pending, targetUid: uid } : { ...promptState.pending, allyUid: uid };
      promptState.pick(choice);
    };
  });
}

// boucle v2 lot 1 : utiliser une potion hors combat, entre les étages (gratuit, hors combat)
function openBagModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const render = () => {
    const iids = [...store.team.slots].filter(Boolean);
    const rows = iids.length ? iids.map((iid) => {
      const inst = byIid(iid);
      if (!inst) return '';
      const c = byId(inst.id);
      const cur = curHpManaOf(iid) ?? { hp: 1, maxHp: 1, mana: 0, manaMax: 1 };
      const btns = Object.values(POTIONS).map((p) => {
        const n = potionCount(p.id);
        const full = p.genre === 'soin' ? cur.hp >= cur.maxHp : cur.mana >= cur.manaMax;
        return `<button type="button" class="btn small act-potion-out" data-iid="${iid}" data-potion="${p.id}" ${n <= 0 || full ? 'disabled' : ''} title="${p.nom}">${p.glyph} ×${n}</button>`;
      }).join(' ');
      return `<div class="shop-row"><span>${artGlyph(c)} <b>${c.name}</b> <span class="muted">♥ ${cur.hp}/${cur.maxHp} · ✦ ${cur.mana}/${cur.manaMax}</span></span><span>${btns}</span></div>`;
    }).join('') : '<p class="muted">Aucune carte en équipe.</p>';
    overlay.innerHTML = `<div class="modal-box">
      <h3>🧪 Objets — entre les étages</h3>
      <p class="muted">Hors combat, boire une potion est gratuit (pas de tour consommé). En combat, chaque gorgée coûte le tour via l'action 🧪 Objet. Stock : ${totalPotions()} potion${totalPotions() > 1 ? 's' : ''}.</p>
      ${rows}
      <div class="modal-actions"><button class="btn" id="bag-close">Fermer</button></div>
    </div>`;
    overlay.querySelector('#bag-close').onclick = () => overlay.remove();
    overlay.querySelectorAll('.act-potion-out').forEach((b) => {
      b.onclick = () => {
        const iid = Number(b.dataset.iid);
        const pid = b.dataset.potion;
        const cur = curHpManaOf(iid);
        if (!cur || !usePotionStock(pid)) return;
        const p = POTIONS[pid];
        if (p.genre === 'soin') cur.hp = Math.min(cur.maxHp, cur.hp + Math.max(1, Math.round(cur.maxHp * p.pct)));
        else cur.mana = Math.min(cur.manaMax, cur.mana + Math.max(1, Math.round(cur.manaMax * p.pct)));
        if (!store.runState.active) { store.runState.active = true; }
        store.runState.units[iid] = { hp: cur.hp, mana: cur.mana };
        save();
        toast(`✓ ${p.nom} bue.`);
        render();
      };
    });
  };
  render();
  document.body.appendChild(overlay);
}

// boucle v2 lot 1 : choix d'une potion dans la fenêtre d'action (la gorgée coûte le tour)
function askPotionChoice(u) {
  if (!promptState || !actBox) return;
  promptState.phase = 'item';
  const zoneEl = actBox.querySelector('.act-zone');
  if (!zoneEl) return;
  const stunned = !!(u.status && u.status.stun > 0);
  const rows = Object.values(POTIONS)
    .filter((p) => potionCount(p.id) > 0)
    .map((p) => `<button type="button" class="btn tac-btn act-potion" data-potion="${p.id}">${p.glyph} <b>${p.nom}</b> <span class="muted">×${potionCount(p.id)} — ${p.genre === 'soin' ? `+${Math.round(p.pct * 100)} % PV` : `+${Math.round(p.pct * 100)} % mana`} sur ${u.name}</span></button>`)
    .join(' ');
  zoneEl.innerHTML = `<div class="act-targetbar"><p class="act-lab">Quelle potion boire ? <span class="muted">(chaque gorgée coûte le tour)</span></p>`
    + `<button type="button" class="btn tac-btn act-cancel">\\u21a9 Annuler</button></div>`
    + (rows || '<p class="muted">Aucune potion en stock — achetez-en à la Boutique (🛒).</p>');
  const cancelBtn = zoneEl.querySelector('.act-cancel');
  if (cancelBtn) cancelBtn.onclick = () => { if (promptState && promptState.showActions) promptState.showActions(); };
  zoneEl.querySelectorAll('.act-potion').forEach((b) => {
    b.onclick = () => {
      if (!promptState || promptState.phase !== 'item') return;
      const pid = b.dataset.potion;
      if (stunned) { promptState.pick({ kind: 'item', potion: null }); return; }
      if (!usePotionStock(pid)) return;
      save();
      promptState.pick({ kind: 'item', potion: POTIONS[pid] });
    };
  });
}

function actionButtonsHtml(u, kind) {
  const isStrike = kind === 'strike';
  const row = (inner, cls, extra = '') => `<button type="button" class="btn tac-btn act-row ${cls}"${extra}>${inner}</button>`;
  const top = (nm, badge, cost) => `<span class="sort-top"><span class="sort-nm">${nm}</span>${badge ?? ''}<span class="sort-cost">${cost}</span></span>`;
  const parts = [];
  // retour terrain : la frappe simple (gratuite) est la premiere action de TOUTE carte, support compris
  parts.push(row(
    top('\u2694 Attaque',
      `<span class="sort-badge b-degats">D\u00e9g\u00e2ts</span>`, 'gratuit')
    + `<span class="sort-meta">la frappe simple de la carte : d\u00e9g\u00e2ts normaux sur 1 ennemi, sans mana</span>`,
    'act-attack'));
  // boucle v2 lot 1 : action Objet — boire une potion (soin/mana), chaque gorgée coûte le tour
  const potN = totalPotions();
  parts.push(row(
    top('🧪 Objet',
      `<span class="sort-badge b-objet">Objet</span>`, `${potN} en stock`)
    + `<span class="sort-meta">boire une potion sur soi : soin (PV) ou mana — chaque gorgée coûte le tour</span>`,
    'act-item' + (potN <= 0 ? ' off' : '')));
  (u.spells ?? []).forEach((sp, k) => {
    const off = sp.cost > u.mana + u.manaRegen;
    // T4.2 : le résultat calculé (mult × stat principale) affiché avec le sort
    const prevu = sp.mult ? ` \u2192 ~${Math.round(sp.mult * statOf(u))}` : '';
    parts.push(row(
      top('\u2726 ' + sp.name, spellBadgeHtml(sp), '\u2726' + sp.cost)
      + `<span class="sort-meta">${spellMetaHtml(sp)}${prevu}</span>`
      + (sp.desc ? `<span class="sort-desc">${sp.desc}</span>` : ''),
      'act-spell' + (off ? ' off' : ''), ` data-k="${k}"`));
  });
  parts.push(row(
    top('\u23f8 Attendre', '', 'gratuit')
    + `<span class="sort-meta">la carte passe son tour et garde son mana</span>`,
    'act-pass'));
  return parts.join(' ');
}

function bindActionButtons(box, u, kind) {
  const isStrike = kind === 'strike';
  box.querySelector('.act-pass').onclick = () => { if (promptState) promptState.pick({ kind: 'pass' }); };
  const bAtk = box.querySelector('.act-attack');
  if (bAtk) {
    bAtk.onclick = () => {
      if (!promptState) return;
      askActTarget('enemy', { kind: 'attack' });
    };
  }
  const bItem = box.querySelector('.act-item');
  if (bItem) {
    bItem.onclick = () => {
      if (!promptState || bItem.classList.contains('off')) return;
      askPotionChoice(u);
    };
  }
  box.querySelectorAll('.act-spell').forEach((b) => {
    b.onclick = () => {
      if (!promptState || b.classList.contains('off')) return;
      const k = Number(b.dataset.k);
      const sp = (u.spells ?? [])[k];
      const side = spellSideOf(sp);
      const kind = isStrike ? 'spell' : 'cast';
      // T0.2 + correctifs ciblage lot 2 : le camp vient de la fiche du sort, jamais de la ligne ;
      // filet de securite si camp null : role hostile -> 'enemy', sinon 'ally' (la frappe simple reste 'enemy')
      if (side === 'self' || side === 'team' || side === 'all') { promptState.pick({ kind, idx: k }); return; }
      const mode = side === 'ally' ? 'ally' : side === 'zone' ? 'zone' : side === 'enemy' ? 'enemy'
        : ((sp.role === 'degats' || sp.role === 'controle' || sp.role === 'malus') ? 'enemy' : 'ally');
      askActTarget(mode, { kind, idx: k });
    };
  });
}

function promptUnitAction(u, kind) {
  renderActModal(u, actionButtonsHtml(u, kind));
  return new Promise((resolve) => {
    promptState = {
      phase: 'action', unit: u, kind, mode: null, pending: null,
      pick: (choice) => {
        promptState = null;
        clearActHighlights();
        if (actBox) { actBox.remove(); actBox = null; }
        resolve(choice);
      },
    };
    // le bouton Annuler ramène à la fenêtre d'action sans rien perdre
    promptState.showActions = () => {
      if (!promptState) return;
      promptState.phase = 'action';
      promptState.mode = null;
      promptState.pending = null;
      clearActHighlights();
      const zoneEl = actBox ? actBox.querySelector('.act-zone') : null;
      if (zoneEl && actBox) {
        actBox.classList.remove('reduced');
        const redBtn = actBox.querySelector('.act-reduce');
        if (redBtn) redBtn.textContent = '▾ réduire';
        zoneEl.innerHTML = actionButtonsHtml(u, kind);
        bindActionButtons(actBox, u, kind);
      }
    };
    if (actBox) bindActionButtons(actBox, u, kind);
  });
}

async function runTacTurn() {
  const myState = state;
  const myGen = combatGen;
  const pre = beginRound(state);
  state._events = [...(state._events ?? []), ...pre];
  await animate(pre, SPEEDS[speedIdx], myGen);
  renderRail();
  while (true) {
    if (state !== myState || myGen !== combatGen || !document.body.classList.contains('in-combat')) { closeActModal(); return; }
    const next = peekRound(state);
    if (!next || state.winner) break;
    renderRail(next.u.uid);
    let choice = null;
    if (next.side === 'team') choice = await promptUnitAction(next.u, next.kind);
    if (choice === ACT_ABORT) { tacPaused = true; syncFightBtn(); renderRail(); return; }
    if (state !== myState || myGen !== combatGen) { closeActModal(); return; }
    const r = stepRound(state, choice);
    state._events = [...(state._events ?? []), ...r.events];
    await animate(r.events, SPEEDS[speedIdx], myGen);
    if (r.done) break;
  }
  closeActModal();
  renderRail();
}



const hpShown = new Map();


const fxLog = new Map();
let curCast = null;
function logFx(uid, kind, value) {
  if (!uid || !kind) return;
  const by = curCast ? (curCast.cardName || '') : '';
  const spell = curCast ? (curCast.spell || '') : '';
  let arr = fxLog.get(uid);
  if (!arr) { arr = []; fxLog.set(uid, arr); }
  const last = arr[arr.length - 1];
  if (last && last.kind === kind && last.by === by && last.spell === spell) return;
  arr.push({ kind, value, by, spell });
  if (arr.length > 14) arr.shift();
}
const FX_DOC = {
  shield: (v) => `\ud83d\udee1 Bouclier : <b>${v} points</b> \u2014 absorbe les d\u00e9g\u00e2ts avant les PV.`,
  atkBuff: (v) => `\u2694 Bonus d\u2019ATQ : <b>+${Math.round(v * 100)} %</b> pour ce tour.`,
  stun: (v) => `\ud83d\ude35 \u00c9tourdissement : passe son tour (${v} restant${v > 1 ? 's' : ''}).`,
  slow: (v) => `\ud83d\udc0c Lenteur : subit des frappes doubles (${v} tour${v > 1 ? 's' : ''} restant${v > 1 ? 's' : ''}).`,
  curse: (v) => `\ud83d\udd2e Mal\u00e9diction : \u2212<b>${Math.round((v?.value ?? 0) * 100)} % d\u2019ATQ</b> (${v?.turns} tour${(v?.turns ?? 0) > 1 ? 's' : ''} restant${(v?.turns ?? 0) > 1 ? 's' : ''}) \u2014 les boss r\u00e9sistent \u00e0 moiti\u00e9.`,
  reflect: (v) => `\u21a9\ufe0f Renvoi : <b>${Math.round((v?.pct ?? 0) * 100)} % des d\u00e9g\u00e2ts subis</b> renvoy\u00e9s (${v?.turns} restant).`,
  dot: (v) => `\u2620 Br\u00fblure/poison : <b>${Math.round((v?.pct ?? 0.4) * 100)} % de l\u2019ATQ du lanceur</b> par tour (${v?.turns} restant).`,
  dmgRed: (v) => `\ud83d\udee1 Encaissement : <b>\u2212${Math.round((v?.pct ?? 0) * 100)} % de d\u00e9g\u00e2ts subis</b> (${v?.turns} restant).`,
  copy: (v) => `\u29c9 Copie : ${v?.spell?.name ? `\u00ab ${v.spell.name} \u00bb captur\u00e9, sera rejou\u00e9 gratuitement` : 'slot de copie pr\u00eat'}.`,
  link: () => `\ud83d\udd17 Lien : soins et bonus partag\u00e9s \u00e0 moiti\u00e9 avec l\u2019alli\u00e9 li\u00e9.`,
  revive: () => `\u2728 Renaissance : reviendra avec la moiti\u00e9 de ses PV en tombant.`,
  phoenix: () => `\ud83d\udd25 Ph\u00e9nix : cette unit\u00e9 rena\u00eet de ses cendres une fois tomb\u00e9e.`,
};

function openInfoModal(title, html) {
  closeCardModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal end-modal';
  box.innerHTML = `<h3>${title}</h3>${html}<div class="actions"><button type="button" class="btn" id="info-close">Fermer</button></div>`;
  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  box.querySelector('#info-close').onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

function openUnitModal(u) {
  closeCardModal();
  const card = byIdSoft(u.cardId) ?? { id: u.cardId, name: u.name, spells: u.spells ?? [], effect: null };
  const st = u.status || {};
  const log = fxLog.get(u.uid) ?? [];
  const srcOf = (kind) => {
    const src = [...log].reverse().find((l) => l.kind === kind);
    if (!src || (!src.by && !src.spell)) return '';
    return ` <span class="muted">\u2014 pos\u00e9 par ${src.by || '?'}${src.spell ? ` (${src.spell})` : ''}</span>`;
  };
  const effRows = [];
  if (u.shield > 0) effRows.push(FX_DOC.shield(u.shield) + srcOf('shield'));
  if (u.atkBuff) effRows.push(FX_DOC.atkBuff(u.atkBuff) + srcOf('atkBuff'));
  if (st.stun > 0) effRows.push(FX_DOC.stun(st.stun) + srcOf('stun'));
  if (st.slow > 0) effRows.push(FX_DOC.slow(st.slow) + srcOf('slow'));
  if (st.curse) effRows.push(FX_DOC.curse(st.curse) + srcOf('curse'));
  if (st.reflect) effRows.push(FX_DOC.reflect(st.reflect) + srcOf('reflect'));
  if (st.dot) effRows.push(FX_DOC.dot(st.dot) + srcOf('dot'));
  if (st.dmgRed) effRows.push(FX_DOC.dmgRed(st.dmgRed) + srcOf('dmgRed'));
  if (st.copy && st.copy.spell) effRows.push(FX_DOC.copy(st.copy) + srcOf('copy'));
  if (st.phoenix) effRows.push(FX_DOC.phoenix());
  if (u.linkedTo) effRows.push(FX_DOC.link());
  if (st.reviving > 0) effRows.push(FX_DOC.revive());
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal end-modal';
    const sub = [card?.classe, card?.element ?? 'Neutre', card?.rarity ? (RARITY_LABEL[card.rarity] ?? card.rarity) : null].filter(Boolean).join(' · ');
  box.innerHTML = `<div class="modal-hero full">${artOf(card)}<div class="hero-veil"></div>
    <div class="hero-text">
      <div class="hero-name">${card ? card.name : 'Unité'} <span class="chip">Nv ${u.level}</span>${u.boss ? ' <span class="chip">BOSS</span>' : ''}</div>
      <div class="hero-sub">${sub}</div>
      <div class="hero-stats"><span class="hp">♥ ${u.hp}/${u.maxHp}</span><span class="atk">⚔ ${Math.max(0, Math.round(u.atk * (1 + u.atkBuff)))}</span><span class="mana">✦ ${u.mana}/${u.manaMax}</span></div>
    </div>
  </div>
    <p class="statline">\u2694 ATQ <b>${Math.max(0, Math.round(u.atk * (1 + u.atkBuff)))}</b>${u.atkBuff ? ` <span class="muted">(+${Math.round(u.atkBuff * 100)} % ce tour)</span>` : ''} \u00b7 \u2665 PV <b>${u.hp}/${u.maxHp}</b> \u00b7 \ud83d\udee1 <b>${u.shield}</b> \u00b7 \u2726 Mana <b>${u.mana}/${u.manaMax}</b> \u00b7 \u26a1 AGI <b>${u.agi ?? '—'}</b> \u00b7 \ud83e\udde0 INT <b>${u.int ?? '—'}</b></p>
    <div class="fstats">
      <span class="fstat"><b>Classe</b>${card?.classe ?? '—'}</span>
      <span class="fstat"><b>Élément</b>${card?.element ?? 'Neutre'}</span>
      <span class="fstat"><b>Rareté</b>${card?.rarity ? (RARITY_LABEL[card.rarity] ?? card.rarity) : '—'}</span>
    </div>
    ${card?.element ? `<p class="statline">Opposition : <b>${card.element} domine ${BEATS[card.element]}</b> et est dominé par <b>${BEATEN_BY[card.element]}</b> — frapper ce qu'on domine donne <b>+25 %</b> de dégâts (l'ennemi en profite aussi).</p>` : `<p class="statline">⚪ Neutre — hors oppositions : ni bonus ni malus. L'élément arrive avec la voie choisie à l'évolution.</p>`}
    <h4>Effets actifs sur cette carte</h4>
    ${effRows.length ? `<ul class="glo-list">${effRows.map((l) => `<li>${l}</li>`).join('')}</ul>` : '<p class="muted">Aucun effet actif : cette carte joue avec ses stats de base.</p>'}
    ${(card?.spells ?? []).length || card?.effect ? `<h4>Sorts et pouvoir</h4><ul class="spells">${card?.effect ? `<li class="spell"><b>\u2726 ${effetDesc(card.effect)}</b> <span class="muted">Pouvoir \u2014 automatique à chaque action, sans mana</span></li>` : ''}${(card?.spells ?? []).map((sp) => `<li class="spell"><span class="sort-top"><b>\u2726 ${sp.name}</b>${spellBadgeHtml(sp)}<span class="sort-cost">\u2726 ${sp.cost}</span></span><span class="muted sort-meta">${spellMetaHtml(sp)}</span>${sp.desc ? `<span class="muted spell-desc">${sp.desc}</span>` : ''}</li>`).join('')}</ul>` : ''}
    <div class="actions"><button type="button" class="btn" id="unit-close">Fermer</button></div>`;
  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  box.querySelector('#unit-close').onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

function statusChipsHtml(u) {
  const st = u.status || {};
  const out = [];
  if (st.stun > 0) out.push(`<span class="chip st">\ud83d\ude35 ${st.stun}</span>`);
  if (st.slow > 0) out.push(`<span class="chip st">\ud83d\udc0c ${st.slow}</span>`);
  if (st.curse) out.push(`<span class="chip st">\ud83d\udd2e \u2212${Math.round((st.curse.value ?? 0) * 100)} % (${st.curse.turns})</span>`);
  if (st.reflect) out.push(`<span class="chip st">\u21a9\ufe0f ${Math.round((st.reflect.pct ?? 0) * 100)} % (${st.reflect.turns})</span>`);
  if (st.dot) out.push(`<span class="chip st">\u2620 ${st.dot.turns}</span>`);
  if (st.dmgRed) out.push(`<span class="chip st">\ud83d\udee1 \u2212${Math.round((st.dmgRed.pct ?? 0) * 100)} % (${st.dmgRed.turns})</span>`);
  if (st.copy && st.copy.spell) out.push(`<span class="chip st">\u29c9 ${st.copy.spell.name ?? 'copi\u00e9'}</span>`);
  if (u.linkedTo) out.push(`<span class="chip st">\ud83d\udd17 ${u.linkTtl || ''}</span>`);
  if (st.reviving > 0) out.push(`<span class="chip st">\u2728 ${st.reviving}</span>`);
  return out.join('');
}

function unitEl(u) {
  const el = document.createElement('div');
  el.className = 'unit' + (u.boss ? ' boss' : '');
  el.dataset.uid = u.uid;
  el.setAttribute('data-uid', u.uid);
  
  
  el.innerHTML = cardFront(
    {
      ...u,
      atk: Math.max(0, Math.round(u.atk * (1 + u.atkBuff))),
      hp: u.hp,
    },
    u.boss
      ? { badge: '👑 BOSS', badgeClass: 'boss', extraClass: (hasArt(u) ? 'unit-art ' : '') + 'battle' }
      : { extraClass: (hasArt(u) ? 'unit-art ' : '') + 'battle' },
  );
  el._unit = u;
  const chips = statusChipsHtml(u);
  if (chips) {
    const sc = document.createElement('div');
    sc.className = 'statchips';
    sc.innerHTML = chips;
    el.appendChild(sc);
  }
  
  
  el.onclick = () => {
    if (state && !state.winner && promptState && promptState.phase === 'target') {
      // phase de désignation : un clic hors cible ne fait rien (pas de fiche ouverte)
      if (!u.alive) return;
      const isEnemy = state.enemies.avant.includes(u) || state.enemies.arriere.includes(u);
      if ((promptState.mode === 'enemy' || promptState.mode === 'zone') && isEnemy) { promptState.pick({ ...promptState.pending, targetUid: u.uid }); return; }
      if (promptState.mode === 'ally' && !isEnemy) { promptState.pick({ ...promptState.pending, allyUid: u.uid }); return; }
      return;
    }
    openUnitModal(u);
  };
  return el;
}

function drawBoard() {
  const enemyZone = combatApp.querySelector('#enemy-zone');
  const teamZone = combatApp.querySelector('#team-zone');
  enemyZone.innerHTML = '';
  teamZone.innerHTML = '';
  hpShown.clear();
  
  const line = (el, units, lab) => {
    const row = document.createElement('div');
    row.className = 'row' + (lab === 'arrière' ? ' back' : '');
    if (lab) {
      const labEl = document.createElement('div');
      labEl.className = 'row-lab';
      labEl.textContent = lab;
      row.appendChild(labEl);
    }
    for (const u of units) {
      const c = unitEl(u);
      if (!u.alive) c.classList.add('ko');
      hpShown.set(u.uid, u.hp);
      row.appendChild(c);
    }
    el.appendChild(row);
  };
  
  
  
  line(enemyZone, [...state.enemies.avant], 'avant');
  line(enemyZone, [...state.enemies.arriere], 'arrière');
  line(teamZone, [...state.team.avant], 'avant');
  line(teamZone, [...state.team.arriere], 'arrière');
  
  
  if (promptState && promptState.phase === 'target') {
    const list = (promptState.mode === 'enemy' || promptState.mode === 'zone')
      ? [...state.enemies.avant, ...state.enemies.arriere].filter((e) => e.alive)
      : [...state.team.avant, ...state.team.arriere].filter((a) => a.alive);
    for (const t of list) {
      const el = elOf(t.uid);
      if (el) el.classList.add('targeted');
    }
    bindTargetHover();
  }
}

const turbo = () => speedIdx >= 5;
const instant = () => speedIdx >= 6; 
function sleep(ms) {
  if (instant()) return Promise.resolve();
  if (turbo()) return new Promise((r) => setTimeout(r, Math.max(0, Math.round(ms / 4))));
  return new Promise((r) => setTimeout(r, Math.max(60, Math.round(ms))));
}

function elOf(uid) {
  if (!combatApp) return null;
  // correctif terrain : le pion (.unit) prime sur les autres éléments data-uid (ex. les jetons du rail d'ordre)
  const el = combatApp.querySelector(`.unit[data-uid="${uid}"]`);
  if (el) return el;
  for (const u of combatApp.querySelectorAll('.unit')) {
    if (u._unit && u._unit.uid === uid) return u;
  }
  return combatApp.querySelector(`[data-uid="${uid}"]`);
}

function findUnit(uid) {
  for (const u of [...state.team.avant, ...state.team.arriere, ...state.enemies.avant, ...state.enemies.arriere]) {
    if (u.uid === uid) return u;
  }
  return null;
}

function updateHp(uid, delta) {
  const u = findUnit(uid);
  if (!u) return;
  const shown = Math.max(0, Math.min(u.maxHp, (hpShown.get(uid) ?? u.hp) + delta));
  hpShown.set(uid, shown);
  const el = elOf(uid);
  const hpEl = el?.querySelector('.pied .hp') ?? el?.querySelector('.cardfoot .hp');
  if (hpEl) hpEl.textContent = `♥ ${shown}/${u.maxHp}`;
}

// boucle v2 lot 4 : écran « Récompenses » après chaque combat — chaque gain cliquable, « Tout ramasser » referme
function openRecompensesModal(recomp) {
  recompOpen = true;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay recomp-overlay';
  const rows = recomp.map((r, i) => `<button type="button" class="btn tac-btn recomp-row r-${r.rarity ?? 'C'}" data-i="${i}">
    <b>${r.label}</b>${r.rarity ? ` <span class="chip r-${r.rarity}">${RARITY_LABEL[r.rarity] ?? r.rarity}</span>` : ''}
    <span class="muted">${r.detail ?? ''}</span></button>`).join('');
  overlay.innerHTML = `<div class="modal-box recomp-box">
    <h3>🎁 Récompenses du combat</h3>
    <p class="muted">Chaque gain est détaillé au toucher. « Tout ramasser » referme et rend la main.</p>
    <div class="recomp-list">${rows || '<p class="muted">Rien à ramasser.</p>'}</div>
    <div class="modal-actions"><button class="btn big gold" id="recomp-all">Tout ramasser</button></div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.querySelectorAll('.recomp-row').forEach((b) => {
    b.onclick = () => {
      const r = recomp[Number(b.dataset.i)];
      if (r) toast(`${r.label} — ${r.detail ?? ''}`, '');
    };
  });
  const close = () => { recompOpen = false; overlay.remove(); };
  overlay.querySelector('#recomp-all').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

function endModal(title, message) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal end-modal';
  box.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
  const again = document.createElement('button');
  again.className = 'btn end-action';
  again.textContent = '↻ Relancer l’exploration (étage 1)';
  again.onclick = () => { overlay.remove(); enterAt(1, store.dungeon); };
  box.appendChild(again);
  const back = document.createElement('button');
  back.className = 'btn end-action';
  back.textContent = '↩ Retour au donjon';
  back.onclick = () => { overlay.remove(); go('#donjons'); };
  box.appendChild(back);
  overlay.appendChild(box);
  combatApp.appendChild(overlay);
}

function milestonePool(kind) {
  const rar = kind === 'diff3' ? 'SR' : 'R';
  
  const set = new Set();
  for (const n of CATALOG.filter((c) => c.raciale && raceOfCard(c) === 'humaine')) {
    for (const f of formsOf(n.id)) {
      set.add(f.to);
      for (const f2 of formsOf(f.to)) {
        set.add(f2.to);
        for (const f3 of formsOf(f2.to)) set.add(f3.to);
      }
    }
  }
  const pool = [...set].map(byIdSoft).filter((c) => c && c.rarity === rar && raceOfCard(c) === 'humaine' && cardAvailable(c) && !forgeOnly(c));
  const picks = [];
  const used = new Set();
  let guard = 0;
  while (picks.length < 3 && picks.length < pool.length && guard < 60) {
    guard += 1;
    const c = pool[Math.floor(uiRand() * pool.length)];
    if (!used.has(c.id)) {
      used.add(c.id);
      picks.push(c);
    }
  }
  return picks;
}

function openMilestoneModal(kind) {
  const picks = milestonePool(kind);
  if (!picks.length) return;
  closeCardModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal';
  const rarName = kind === 'diff3' ? 'Super Rare' : 'Rare';
  box.innerHTML = `<h3>🎁 JALON ATTEINT !</h3>
    <p>${kind === 'diff3' ? 'Première Difficile terminée' : 'Premier donjon terminé'} — la progression du compte offre une carte ${rarName} <b>au choix parmi 3</b> :</p>
    <div class="mstone-grid">${picks.map((c) => `<button type="button" class="mstone-pick" data-pick="${c.id}">${cardFront(c, { extraClass: hasArt(c) ? 'unit-art' : '' })}</button>`).join('')}</div>`;
  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  box.querySelectorAll('[data-pick]').forEach((el) => {
    el.onclick = () => {
      grantCards([el.dataset.pick]);
      save();
      overlay.remove();
      toast(`🎁 ${byId(el.dataset.pick).name} rejoint votre collection !`);
    };
  });
  document.body.appendChild(overlay);
}

function runEndModal() {
  const r = runLog ?? freshRunLog();
  const d = dungeonById(store.dungeon);
  const curDiff = store.diff;
  const DIFF = DIFFICULTIES[curDiff - 1] ?? DIFFICULTIES[0];
  const nextDiff = curDiff < 5 && diffUnlocked(d.id, curDiff + 1) ? curDiff + 1 : null;
  const lines = [
    `\u26a1 Points gagn\u00e9s : <b>${r.points}</b>`,
    r.stages ? `\ud83e\uddf1 \u00c9tages vaincus : <b>${r.stages}</b>` : '',
    r.xp.length ? `\u2b50 XP d'\u00e9quipe (run) : <b>${r.xp.map((x) => `${x.name} \u2192 Nv ${x.level}${x.mult < 1 ? ` (${Math.round(x.mult * 100)} %)` : ''}`).join(' \u00b7 ')}</b>` : '',
    r.gems.length ? `\ud83d\udce0 \u00c9clats d'\u00e9volution : <b>${r.gems.join(', ')}</b>` : '',
  ].filter(Boolean);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal end-modal';
  box.innerHTML = `<h3>DONJON TERMIN\u00c9 !</h3><p>${d.name} vaincu de haut en bas en ${DIFF.name} \u2014 r\u00e9capitulatif de la run :</p><ul class="run-recap">${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`;
  const actions = document.createElement('div');
  actions.className = 'actions';
  const again = document.createElement('button');
  again.className = 'btn end-action';
  again.textContent = '\u21bb Rejouer ce donjon';
  again.onclick = () => { overlay.remove(); enterAt(1, store.dungeon); };
  actions.appendChild(again);
  if (nextDiff) {
    const harder = document.createElement('button');
    harder.className = 'btn end-action';
    harder.textContent = `\u2b06 Rejouer en ${DIFFICULTIES[nextDiff - 1].name}`;
    harder.onclick = () => { overlay.remove(); store.diff = nextDiff; enterAt(1, d.id); };
    actions.appendChild(harder);
  }
  const back = document.createElement('button');
  back.className = 'btn end-action';
  back.textContent = '\u21a9 Retour aux donjons';
  back.onclick = () => { overlay.remove(); go('#donjons'); };
  actions.appendChild(back);
  box.appendChild(actions);
  overlay.appendChild(box);
  combatApp.appendChild(overlay);
}

function updateShield(uid) {
  const u = findUnit(uid);
  if (!u) return;
  const el = elOf(uid);
  if (!el) return;
  let chip = el.querySelector('.cardfoot .sh');
  if (u.shield > 0) {
    if (!chip) {
      chip = document.createElement('span');
      chip.className = 'sh';
      const foot = el.querySelector('.cardfoot');
      const hpEl = foot?.querySelector('.hp');
      if (foot) foot.insertBefore(chip, hpEl ?? null);
    }
    chip.textContent = `🛡 ${u.shield}`;
  } else if (chip) {
    chip.remove();
  }
}

function updateMana(uid, value) {
  const u = findUnit(uid);
  if (!u || value === undefined) return;
  const el = elOf(uid);
  const mEl = el?.querySelector('.cardfoot .mana');
  if (mEl) mEl.textContent = `✦ ${value}/${u.manaMax}`;
}

function shownAlive(units) {
  return units.filter((u) => (hpShown.get(u.uid) ?? u.hp) > 0);
}

function dash(srcEl, dstEl, ms) {
  if (turbo() || !srcEl || !dstEl) return Promise.resolve();
  const a = srcEl.getBoundingClientRect();
  const b = dstEl.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const dist = Math.hypot(dx, dy);
  const reach = Math.min(0.72, 90 / Math.max(1, dist)); 
  const anim = srcEl.animate(
    [
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${dx * reach}px, ${dy * reach}px) scale(1.06)`, offset: 0.45 },
      { transform: 'translate(0,0) scale(1)' },
    ],
    { duration: ms, easing: 'cubic-bezier(.2,.8,.3,1)' },
  );
  return anim.finished.catch(() => {});
}

const FLOAT_MS = 1500;

function floatText(el, text, cls) {
  if (!el || turbo()) return;
  const f = document.createElement('div');
  f.className = `float ${cls}`;
  f.textContent = text;
  el.appendChild(f);
  setTimeout(() => f.remove(), FLOAT_MS);
}

function shake(el, big) {
  if (!el || turbo()) return;
  el.classList.add(big ? 'shake-big' : 'shake');
  setTimeout(() => el.classList.remove(big ? 'shake-big' : 'shake'), big ? 380 : 260);
}

function hitStop(ms) {
  if (reduceFlashes || speedIdx >= 2) return Promise.resolve();
  return sleep(100);
}

function burst(el) {
  if (!el || reduceFlashes || turbo()) return;
  const b = document.createElement('div');
  b.className = 'burst';
  el.appendChild(b);
  setTimeout(() => b.remove(), 700);
}

function flashZone(side) {
  if (reduceFlashes || turbo()) return;
  const zone = combatApp.querySelector(side === 'enemies' ? '#enemy-zone' : '#team-zone');
  if (!zone) return;
  zone.classList.remove('zone-flash');
  void zone.offsetWidth;
  zone.classList.add('zone-flash');
  setTimeout(() => zone.classList.remove('zone-flash'), 650);
}

async function castSpecial(ev, ms) {
  const el = elOf(ev.sourceId);
  const u = findUnit(ev.sourceId);
  const card = u ? (byIdSoft(u.cardId) ?? { id: u.cardId, name: u.name, classe: u.classe, element: u.element }) : null;
  flashZone(ev.side === 'enemies' ? 'team' : 'enemies');
  const ov = document.createElement('div');
  ov.className = 'special-overlay';
  const title = ev.fx === 'heal' ? 'SOIN SPÉCIAL' : ev.fx === 'atk' ? 'ATTAQUE SPÉCIALE' : 'SPÉCIALE DE SUPPORT';
  ov.innerHTML = `
    <div class="special-flash"></div>
    <div class="special-card t-${card?.classe} o-${card?.element}">
      <div class="special-art">${card ? artOf({ ...card, cardId: card.id }) : '✦'}</div>
      <div class="special-txt">
        <div class="special-title">${title}</div>
        <div class="special-name">« ${ev.name} »</div>
        <div class="special-owner">${card ? card.name : ''}</div>
      </div>
    </div>`;
  combatApp.appendChild(ov);
  if (el) el.classList.add('casting');
  playFxVideo(ev);
  await sleep(Math.max(700, ms * 1.1));
  ov.classList.add('out');
  if (el) el.classList.remove('casting');
  setTimeout(() => ov.remove(), 350);
}

async function castInline(ev, ms) {
  const el = elOf(ev.sourceId);
  floatText(el, `✦ ${ev.name}`, 'cast fx-special');
  if (el && !instant()) {
    el.classList.add('casting');
    const tag = document.createElement('div');
    tag.className = 'cast-tag';
    tag.textContent = `✦ ${ev.name}`;
    el.appendChild(tag);
    setTimeout(() => tag.remove(), 950);
    setTimeout(() => el.classList.remove('casting'), 450);
  }
  await sleep(340);
}

function pickTargets() {
  const foes = [...state.enemies.avant, ...state.enemies.arriere].filter((e) => e.alive);
  const attacker = state.team.avant.find((u) => u.alive);
  if (!foes.length || !attacker) return [];
  return foes.map((f) => ({ uid: f.uid }));
}

async function animate(events, ms, gen = null) {
  let lastSingle = null; 
  for (const ev of events) {
    if (gen !== null && gen !== combatGen) return;
    if (!document.body.classList.contains('in-combat')) return;
    switch (ev.type) {
      case 'turn':
        break;
      case 'cast': {
        updateMana(ev.sourceId, ev.mana);
        const su = findUnit(ev.sourceId);
        curCast = su ? { cardName: (byIdSoft(su.cardId)?.name ?? su.name ?? ''), spell: ev.name ?? '' } : null;
        if (ev.big && !reduceFlashes && speedIdx < 3) await castSpecial(ev, ms);
        else await castInline(ev);
        break;
      }
      case 'summon': {
        drawBoard();
        const sEl = elOf(ev.targetId);
        if (sEl) floatText(sEl, `🕯 ${ev.name ?? 'Invocation'}`, 'buff');
        break;
      }
      case 'attack': {
        const special = ev.kind === 'special';
        
        
        
        const tag = ev.elem === 'fort' ? (ev.side === 'enemies' ? ' ▼' : ' ▲') : '';
        const srcEl = elOf(ev.sourceId);
        let dstEl = elOf(ev.targetId);
        if (ev.targetId === 'all') {
          const foes = [...state.enemies.avant, ...state.enemies.arriere];
          const first = shownAlive(foes)[0] ?? foes[0];
          dstEl = first ? elOf(first.uid) : null;
        }
        await dash(srcEl, dstEl, special ? Math.min(460, ms) : Math.min(340, ms));
        updateMana(ev.sourceId, ev.mana);
        if (ev.targetId !== 'all' && dstEl) {
          lastSingle = ev;
          shake(dstEl, special);
          if (special) burst(dstEl);
          floatText(dstEl, `-${ev.amount}${tag}${special ? ' !' : ''}`, special ? 'dmg fx-special' : 'dmg');
          if (special) await hitStop();
        } else if (ev.targetId === 'all') {
          
          if (special) await hitStop();
        }
        await sleep(special ? ms * 0.7 : ms * 0.5);
        break;
      }
      case 'damage': {
        updateHp(ev.targetId, -ev.amount);
        const el = elOf(ev.targetId);
        const fromSingle = lastSingle && lastSingle.targetId === ev.targetId;
        if (!fromSingle) {
          
          floatText(el, `-${ev.amount}`, 'dmg');
          shake(el, false);
        }
        break;
      }
      case 'heal': {
        updateHp(ev.targetId, ev.amount);
        const el = elOf(ev.targetId);
        if (el) {
          const special = ev.kind === 'special';
          floatText(el, `+${ev.amount}${special ? ' ✨' : ''}`, special ? 'heal fx-special' : 'heal');
        }
        await sleep(ms * 0.3);
        break;
      }
      case 'buff': {
        logFx(ev.targetId, 'atkBuff', ev.value);
        const el = elOf(ev.targetId);
        if (el) {
          const special = ev.kindTag === 'special';
          if (special) burst(el);
          floatText(el, `ATK +${Math.round(ev.value * 100)} %${special ? ' ✨' : ''}`, special ? 'buff fx-special' : 'buff');
        }
        await sleep(ms * 0.2);
        break;
      }
      case 'shield': {
        updateShield(ev.targetId);
        logFx(ev.targetId, 'shield', ev.amount);
        const el = elOf(ev.targetId);
        if (el) {
          const special = ev.kind === 'special';
          if (special) burst(el);
          floatText(el, `🛡${ev.kind === 'passif' ? ' passif' : ''} +${ev.amount}${special ? ' ✨' : ''}`, special ? 'shield fx-special' : 'shield');
        }
        await sleep(ms * 0.2);
        break;
      }
      case 'block': {
        
        
        
        updateShield(ev.targetId);
        const el = elOf(ev.targetId);
        if (el) {
          floatText(el, `🛡 −${ev.amount}`, 'block');
          shake(el, false);
        }
        break;
      }
      case 'ko': {
        const el = elOf(ev.targetId);
        if (el) {
          el.classList.add('ko');
          floatText(el, 'KO', 'dmg');
        }
        await hitStop();
        await sleep(ms * 0.4);
        break;
      }
      case 'vengeance': {
        floatText(combatApp.querySelector('#team-zone'), 'Vengeance !', 'buff');
        await sleep(ms * 0.4);
        break;
      }
      case 'end': {
        const won = ev.winner === 'team';
        
        const tactTotal = combatTally.auto + combatTally.manual;
        const tactMult = tactTotal ? 1 - 0.5 * (combatTally.auto / tactTotal) : 1;
        lastTactMult = tactMult;
        const loot = runModLootMult(store.defiActive ? null : store.runMod);
        if (runLog) {
          runLog.autoTurns = (runLog.autoTurns ?? 0) + combatTally.auto;
          runLog.tactTurns = (runLog.tactTurns ?? 0) + tactTotal;
        }
        const finalClear = won && !store.defiActive && store.stage >= dungeonById(store.dungeon).floors;
        let rewardLine = '';
        let pts = 0;
        let rewards = null;
        // boucle v2 lot 4 : récompenses structurées pour l'écran « Récompenses » (chaque gain cliquable)
        const recomp = [];
        const pushRecomp = (kind, label, detail = '', rarity = null) => recomp.push({ kind, label, detail, rarity });
        if (won) {
          // économie v2 lot E4 : quêtes quotidiennes — monstres vaincus, boss, donjon fini
          const nbEnnemis = [...(state.enemies?.avant ?? []), ...(state.enemies?.arriere ?? [])].filter((u) => u && u.hp <= 0).length;
          if (nbEnnemis > 0) questProgress('tuer', nbEnnemis);
          const lastRewards = stageRewards(store.seed, store.stage, 0, store.dungeon, store.diff);
          if (lastRewards?.boss) questProgress('boss');
          if (finalClear) questProgress('finirDonjon');
          // bloc visuel : combat de zone (errance) — grâce au retour, déblocage si donjon de zone
          if (store.zoneFight) {
            questProgress('gagnerErrance');
            if (store.errance) store.errance.grace = 2;
            if (store.zoneFight.donjon) {
              unlockZone(store.zoneFight.zone);
              toast(`✓ Donjon de la zone vaincu — une nouvelle zone s'ouvre dans Les Terres Sauvages !`);
            }
          }
          
          
          
          
          const stage = store.stage;
          const DIFF = DIFFICULTIES[store.diff - 1] ?? DIFFICULTIES[0];
          rewards = stageRewards(store.seed, stage, 0, store.dungeon, store.diff);
          pts = Math.round((15 + 5 * stage) * (rewards.boss ? 2 : 1) * DIFF.pts * tactMult * loot.pts);
          addGold(pts);
          pushRecomp('or', `+${pts} 🪙 or`, `étage ${stage} × mode ${DIFF.name} × tactique ×${Math.round(tactMult * 100) / 100}`);
          store.record = Math.max(store.record, stage);
          save();
          updatePtsBadge();
          rewardLine = `+${pts} 🪙 or — les cartes naissent à la Guilde (compagnons, autel), au marchand et en quêtes`;
          if (maybeDropRegEclat(uiRand, tactMult * loot.drop)) {
            pushRecomp('drop', '🌀 Éclat de régression', 'réserve de la Forge', 'SR');
            rewardLine += ' · 🌀 Éclat de régression trouvé ! (réserve de la Forge)';
            if (runLog) runLog.gems.push('Éclat de régression');
          }
          
          const dg = dungeonById(store.dungeon);
          const rollGem = (tier) => {
            if (uiRand() < dropChance(dg.id) * tactMult * loot.drop) {
              const best = monstersOf(dg.id);
              const pool = [...(best?.avant ?? []), ...(best?.arriere ?? [])];
              const elt = pool.length ? pool[Math.floor(uiRand() * pool.length)].element : 'Eau';
              addGem(tier, elt);
              registerDrop(dg.id);
              if (runLog) runLog.gems.push(`${GEM_LABEL[tier]} ${elt}`);
            }
          };
          if (stage !== 5 && stage !== dg.floors && uiRand() < dropChance(dg.id + ':stg') * 0.35 * tactMult * loot.drop) {
            const best = monstersOf(dg.id);
            const pool = [...(best?.avant ?? []), ...(best?.arriere ?? [])];
            const elt = pool.length ? pool[Math.floor(uiRand() * pool.length)].element : 'Eau';
            addGem('brut', elt);
            registerDrop(dg.id + ':stg');
            if (runLog) runLog.gems.push(`bruts ${elt}`);
            pushRecomp('drop', `\ud83d\udce0 \u00c9clat brut (${elt})`, `gemme brute ${elt}, vendable`, 'C');
            rewardLine += ` \u00b7 \ud83d\udce0 \u00c9clat brut (${elt}) trouv\u00e9 !`;
          }
          
          const bossElt = () => {
            const pool = dg.types?.length ? dg.types : [monstersOf(dg.id).avant[0]?.element ?? 'Eau'];
            return pool[Math.floor(uiRand() * pool.length)];
          };
          const grantBrut = (nB) => {
            for (let i = 0; i < nB; i++) {
              const e = bossElt();
              addGem('brut', e);
              if (runLog) runLog.gems.push(`bruts ${e}`);
              rewardLine += ` · 📠 Éclat brut (${e}) !`;
            }
          };
          if (stage % 5 === 0 && uiRand() < PIERRE_DROP_RATE * tactMult * loot.drop) {
            addPierres(1);
            pushRecomp('drop', '💎 Pierre d’éveil', 'éveille une naissance (rang N → C)', 'SR');
            rewardLine += ` · 💎 Pierre d’éveil !`;
          }
          if (uiRand() < N_DROP_RATE * tactMult * loot.drop) {
            const oeuf = drawNaissance(uiRand, cardAvailable);
            if (oeuf) {
              grantCards([oeuf.id]);
              if (runLog) runLog.cards.push(oeuf.name);
              pushRecomp('recrue', `🐥 ${oeuf.name}`, `naissance ${RACE_LABEL[raceOfCard(oeuf)].toLowerCase()}`, oeuf.rarity);
              rewardLine += ` · 🐥 ${oeuf.name} (naissance ${RACE_LABEL[raceOfCard(oeuf)].toLowerCase()}) se joint à vous !`;
            }
          }
          // boucle v2 lot 3 : recrutement naturel — ~1 % par vaincu (hors boss et nommés), taux calibré par zone
          const zoneRec = getZone(`zone-${store.dungeon}`);
          const tauxRec = zoneRec?.recrute?.taux ?? RECRUTE_TAUX;
          for (const m of recrutableMonsters(state)) {
            if (uiRand() >= tauxRec * tactMult * loot.drop) continue;
            if (instsOf(m.cardId).length >= 3) continue; // limite de 3 exemplaires par carte
            newInst(m.cardId);
            markSeen(m.cardId);
            if (runLog) runLog.cards.push(m.name);
            pushRecomp('recrue', `🐾 ${m.name}`, 'vaincu qui rejoint la collection', 'C');
            rewardLine += ` · 🐾 ${m.name} rejoint votre collection !`;
            toast(`🐾 ${m.name} vaincu rejoint votre collection !`);
          }
          // boucle v2 lot 4 : drops v2 — matériau de la zone sur chaque monstre vaincu
          const zoneMat = getZone(`zone-${store.dungeon}`);
          if (zoneMat?.materiau) {
            for (const m of [...state.enemies.avant, ...state.enemies.arriere]) {
              if (uiRand() < (zoneMat.materiau.taux ?? 0) * tactMult * loot.drop) {
                addMateriau(zoneMat.materiau.id, 1);
                pushRecomp('drop', `🧪 ${zoneMat.materiau.nom}`, `matériau de ${dungeonById(store.dungeon).name}`, 'C');
                rewardLine += ` · 🧪 ${zoneMat.materiau.nom}`;
              }
            }
          }
          // boss : pièce d'équipement du set de la zone + matière du boss, garanties
          if (stage % 5 === 0) {
            const piece = bossPieceFor(store.dungeon, store.diff);
            if (piece) {
              addEquipmentPiece(piece.id, 1);
              pushRecomp('drop', `⚔ ${piece.nom}`, `pièce d'équipement (${piece.rarity})${piece.set ? ` — set ${EQUIP_SETS[piece.set]?.nom ?? ''}` : ''}, posée sur la fiche`, piece.rarity);
              rewardLine += ` · ⚔ ${piece.nom} (${piece.rarity}) !`;
            }
            if (zoneMat?.matiereBoss) {
              addMateriau(zoneMat.matiereBoss.id, 1);
              pushRecomp('drop', `💠 ${zoneMat.matiereBoss.nom}`, 'matière du boss — craft des paliers hauts', 'SR');
              rewardLine += ` · 💠 ${zoneMat.matiereBoss.nom} !`;
            }
          }
          // équipement à taux très faible partout ailleurs
          if (uiRand() < EQUIP_DROP_RATE * tactMult * loot.drop) {
            const pool = EQUIPMENT.filter((p) => p.source === 'boutique');
            const piece = pool[Math.floor(uiRand() * pool.length)];
            if (piece) {
              addEquipmentPiece(piece.id, 1);
              pushRecomp('drop', `⚔ ${piece.nom}`, `pièce d'équipement (${piece.rarity}), posée sur la fiche`, piece.rarity);
              rewardLine += ` · ⚔ ${piece.nom} (${piece.rarity}) !`;
            }
          }
          if (stage === REGEN_BOSS_STAGE) rewardLine += ' · ⛲ Régénération complète après le premier boss !';
          if (stage === 5) {
            rollGem(BOSS_GEM[store.diff][0]);
            grantBrut(1);
            if (!store.milestones.boss5) store.milestones.boss5 = true;
          }
          if (stage === dg.floors) {
            rollGem(BOSS_GEM[store.diff][1]);
            grantBrut(2); 
            
            store.firstClearTokens ??= {};
            if (!store.firstClearTokens[store.dungeon]) {
              store.firstClearTokens[store.dungeon] = true;
              rewardLine += ` · 🎁 Première victoire finale sur ${dg.name} !`;
            }
            if (!store.milestones.clear1) {
              store.milestones.clear1 = true;
              rewardLine += '· 🎁 Jalon : premier donjon terminé ! ';
            }
            if (store.diff >= 3 && !store.milestones.diff3) {
              store.milestones.diff3 = true;
              rewardLine += '· 🎁 Jalon : première Difficile terminée ! ';
            }
          }
          save();
        }
        if (runLog) {
          runLog.points += pts;
          runLog.stages += 1;
          if (rewards && rewards.guaranteed) runLog.guaranteed += 1;
        }
        
        let xpLine = '';
        if (!store.defiActive && runLog && (!won || finalClear) && runLog.stages > 0) {
          const DIFFX = DIFFICULTIES[store.diff - 1] ?? DIFFICULTIES[0];
          
          const discOn = store.diff === 1 && dungeonById(store.dungeon).tier === 0 && (store.progress[store.dungeon]?.diffs?.[1]?.record ?? 0) < 10;
          const tactXpMult = runLog.tactTurns ? 1 - 0.5 * ((runLog.autoTurns ?? 0) / runLog.tactTurns) : 1;
          const baseXp = runLog.stages * DIFFX.pts * (won ? 1.5 : 1) * 0.8 * (discOn ? 2 : 1) * tactXpMult;
          const iids = [...new Set(store.team.slots.filter(Boolean))];
          const xpParts = [];
          for (const iid of iids) {
            const inst = byIid(iid);
            if (!inst) continue;
            const mult = xpMultFor(iid);
            const r = addXpI(iid, baseXp * mult);
            const nm = byId(inst.id).name;
            xpParts.push(`${nm} → Nv ${r.level}${mult < 1 ? ` (${Math.round(mult * 100)} % XP)` : ''}`);
            runLog.xp.push({ name: nm, level: r.level, mult });
          }
          runLog.xpBase = Math.round(baseXp * 10) / 10;
          registerXpRun(iids);
          save();
          xpLine = `⭐ XP de run (${runLog.stages} étage${runLog.stages > 1 ? 's' : ''} × ×${DIFFX.pts}) : ${xpParts.join(' · ')}${tactXpMult < 0.999 ? ` \u00b7 🧭 XP \u00d7${Math.round(tactXpMult * 100) / 100}` : ''}`;
          pushRecomp('xp', 'XP de run — ' + runLog.stages + ' étage(s)', xpParts.join(' | '));
        }
        if (won && tactMult < 0.999) rewardLine += ` \u00b7 🧭 \u00d7${tactMult.toFixed(2)} \u2014 tours jou\u00e9s en auto : pts, \u00e9clats et XP r\u00e9duits`;
        else if (won) rewardLine += ' \u00b7 🧭 Tactique : r\u00e9compenses int\u00e9grales';
        if (won && (loot.pts > 1 || loot.drop > 1)) rewardLine += ` \u00b7 🎰 ${runModById(store.defiActive ? null : store.runMod)?.name ?? ''} : butin major\u00e9`;
        drawBoard();
        const banner = document.createElement('div');
        banner.className = `banner ${won ? 'win' : 'lose'} bannerin`;
        banner.textContent = finalClear ? 'DONJON TERMINÉ !' : won ? 'VICTOIRE !' : 'DÉFAITE';
        combatApp.appendChild(banner);
        const log = combatApp.querySelector('#log');
        if (won && rewardLine) {
          banner.textContent = finalClear ? `DONJON TERMINÉ ! ${rewardLine}` : `VICTOIRE ! ${rewardLine}`;
          if (log) {
            log.innerHTML = `<p class="logline win">🎁 ${rewardLine}</p>`;
          }
        } else if (log) {
          log.innerHTML = '<p class="logline lose">La prochaine exploration repart de l\u2019étage 1 — farmez les étages, montez vos cartes, puis revenez.</p>';
        }
        
        
        
        if (!won) {
          endModal(
            'DÉFAITE',
            'La prochaine exploration repart de l\u2019étage 1 — farmez les étages, montez vos cartes, puis revenez.' + (xpLine ? `<br><b>${xpLine}</b>` : ''),
          );
        } else if (finalClear) {
          runEndModal();
        }
        setTimeout(() => banner.classList.add('out'), 2600);
        setTimeout(() => banner.remove(), 3400);
        
        // boucle v2 lot 1 : persistance — PV/mana conservés d'un combat à l'autre dans le run
        if (!store.defiActive) {
          if (won) {
            persistRunStateFrom(state);
            if (store.stage === REGEN_BOSS_STAGE) store.runState.units = {}; // régén complète après le premier boss
            if (finalClear) store.runState.active = false; // run terminé : le prochain repart à plein
          } else {
            store.runState.active = false; // défaite : la prochaine exploration est un nouveau run
          }
          save();
        }
        // boucle v2 lot 4 : écran « Récompenses » après chaque combat gagné (chaque gain cliquable)
        if (won && recomp.length) openRecompensesModal(recomp);
        if (won && store.defiActive) {
          store.defiActive = false;
          save();
        }
        if (won && store.zoneFight) {
          const zf = store.zoneFight;
          store.zoneFight = null;
          const back = () => {
            if (recompOpen) { setTimeout(back, 400); return; }
            save();
            go('#errance');
          };
          setTimeout(back, instant() ? 150 : 1400);
        } else if (won && !store.defiActive && store.stage < dungeonById(store.dungeon).floors) {
          const chainNext = () => {
            chainTimer = null;
            if (recompOpen) { chainTimer = setTimeout(chainNext, 400); return; } // on attend « Tout ramasser »
            if (!document.body.classList.contains('in-combat')) return;
            store.stage += 1;
            save();
            renderCombat(combatApp, { autoFight: autoMode });
          };
          chainTimer = setTimeout(chainNext, instant() ? 90 : turbo() ? 250 : 2100);
        } else {
          save();
        }
        break;
      }
      default: {
        if (ev.type === 'summon') {
          const src = elOf(ev.sourceId);
          if (src) {
            floatText(src, `✚ ${ev.name}`, 'buff');
            await sleep(ms * 0.3);
          }
          drawBoard();
          const invEl = elOf(ev.targetId);
          if (invEl) {
            burst(invEl);
            floatText(invEl, '🕯️', 'buff');
          }
          break;
        }
        const el = ev.targetId ? elOf(ev.targetId) : null;
        if (!el) break;
        if (ev.type === 'status') {
          if (ev.targetId) logFx(ev.targetId, ev.kind, ev.value);
          const label = ev.kind === 'tactical' ? (ev.value === 'mana' ? '🧸 mana' : '⏸') : ev.kind === 'stun' ? '😵' : ev.kind === 'slow' ? '🐌' : ev.kind === 'dot' ? '☠'
            : ev.kind === 'reflect' ? '↩️' : ev.kind === 'link' ? '🔗' : ev.kind === 'copy' ? `⧉ ${ev.value}`
            : ev.kind === 'curse' ? `🔮 −${Math.round((ev.value ?? 0) * 100)} %` : ev.kind === 'exec' ? '🗡️ Exécution' : null;
          if (label) {
            floatText(el, label, 'buff');
            await sleep(ms * 0.15);
          }
        } else if (ev.type === 'revive') {
          updateHp(ev.targetId, ev.amount);
          el.classList.remove('ko');
          floatText(el, '✨ Résurrection', 'heal fx-special');
          await sleep(ms * 0.4);
        } else if (ev.type === 'phoenix') {
          floatText(el, `🔥 ${ev.turns}`, 'buff');
        } else if (ev.type === 'expire') {
          el.classList.add('ko');
          floatText(el, '⌛', 'dmg');
        } else if (ev.type === 'dodge') {
          floatText(el, '💨 Esquive', 'buff');
          await sleep(ms * 0.15);
        } else if (ev.type === 'link') {
          floatText(el, `🔗 ${ev.amount}`, 'buff');
        }
        break;
      }
    }
  }
  drawBoard();
}

async function run(autoTurn = false) {
  if (busy || !state || state.winner) return;
  busy = true;
  const myGen = combatGen;
  // un tour de jeu, pas a pas : le rail d'ordre suit chaque acteur (chemin evenementiel identique a resolveTurn)
  const runOneTurn = async () => {
    const myState = state;
    const pre = beginRound(state);
    state._events = [...(state._events ?? []), ...pre];
    await animate(pre, SPEEDS[speedIdx], myGen);
    renderRail();
    let guard = 0;
    while (guard++ < 200) {
      if (state !== myState || myGen !== combatGen || !document.body.classList.contains('in-combat')) return false;
      const nxt = peekRound(state);
      renderRail(nxt ? nxt.u.uid : null);
      const r = stepRound(state, null);
      state._events = [...(state._events ?? []), ...r.events];
      await animate(r.events, SPEEDS[speedIdx], myGen);
      if (r.done) break;
    }
    if (state === myState && state.round) state.round = null;
    renderRail();
    return true;
  };
  if (autoMode) {
    while (!state.winner && state.turn < 60 && autoMode && myGen === combatGen && document.body.classList.contains('in-combat')) {
      combatTally.auto += 1;
      const ok = await runOneTurn();
      if (!ok) break;
    }
  } else {
    if (autoTurn) {
      combatTally.auto += 1;
      await runOneTurn();
    } else {
      combatTally.manual += 1;
      await runTacTurn();
    }
  }
  if (myGen !== combatGen) { closeActModal(); return; }
  
  
  if (!state.winner && state.turn >= 60) {
    const banner = document.createElement('div');
    banner.className = 'banner lose bannerin';
    banner.textContent = 'ÉGALITÉ — la Fureur du donjon vous écrase, la prochaine exploration repart de l\u2019étage 1.';
    combatApp.appendChild(banner);
    endModal('ÉGALITÉ', 'La Fureur du donjon vous écrase, la prochaine exploration repart de l\u2019étage 1.');
    setTimeout(() => banner.classList.add('out'), 2600);
    setTimeout(() => banner.remove(), 3400);
  }
  busy = false;
  // en mode Tactique le flux repart tout seul : le prochain tour se lance apres une courte pause (sauf pause demandee)
  if (myGen === combatGen && !autoMode && !tacPaused && state && !state.winner && state.turn < 60
      && document.body.classList.contains('in-combat') && !actBox) {
    if (tacChainTimer) clearTimeout(tacChainTimer);
    const tg = combatGen;
    tacChainTimer = setTimeout(() => {
      tacChainTimer = null;
      if (tg === combatGen && !autoMode && !tacPaused && !busy) run();
    }, instant() ? 120 : 450);
  }
}

function renderCombat(root, opts = {}) {
  combatApp = root;
  if (chainTimer) {
    clearTimeout(chainTimer);
    chainTimer = null;
  }
  if (tacChainTimer) {
    clearTimeout(tacChainTimer);
    tacChainTimer = null;
  }
  busy = false;
  combatGen += 1;
  closeActModal();
  combatTally = { auto: 0, manual: 0 };
  lastTactMult = 1;
  const defi = !!store.defiActive;
  if (defi) runLog = null;
  else if (store.stage === 1) runLog = freshRunLog();
  const d = defi ? { name: 'Défi du jour', floors: 1 } : dungeonById(store.dungeon);
  const wseed = defi ? dailySeed() : waveSeedFor(store.dungeon, store.diff);
  const defiLvl = store.dailyLevel && store.dailyLevel.day === todayKey() ? store.dailyLevel.lvl : teamLevel();
  const wave = defi ? makeDailyWave(wseed, defiLvl) : makeWave(wseed, store.stage, store.dungeon, store.diff, defi ? null : store.runMod);
  
  let discovery = '';
  if (!defi && store.diff === 1 && dungeonById(store.dungeon).tier === 0
      && (store.progress[store.dungeon]?.diffs?.[1]?.record ?? 0) < 10) {
    const soften = store.stage <= 4 ? 0.7 : store.stage === 5 ? 0.7 : store.stage <= 9 ? 0.8 : store.stage === 10 ? 0.45 : 1; 
    if (soften < 1) {
      for (const u of [...wave.avant, ...wave.arriere]) {
        u.atk = Math.max(1, Math.round(u.atk * soften));
        u.hp = Math.max(1, Math.round(u.hp * soften));
      }
      discovery = `🌱 Bonus de découverte (premier donjon, Facile, jusqu'au premier donjon complet) : ennemis affaiblis de ${Math.round((1 - soften) * 100)} % — le temps de former votre première équipe.`;
    }
  }
  const newSeen = [...wave.avant, ...wave.arriere].filter((c) => c.dungeon && !seenCard(c.id));
  if (newSeen.length) {
    for (const c of newSeen) markSeen(c.id);
    save();
  }
  
  
  
  const withShards = (card) => {
    const n = card.family ? (store.shards[card.family] ?? 0) : 0;
    if (n <= 0) return card;
    const m = shardMult(n);
    return { ...card, atk: Math.max(1, Math.round(card.atk * m)), hp: Math.max(1, Math.round(card.hp * m)) };
  };
  // boucle v2 lot 4 : bonus d'équipement (2 slots par carte + 2 slots d'équipe) appliqués au moteur
  const teamBonus = equipTeamBonus();
  const cards = store.team.slots.filter(Boolean).map((iid) => {
    const inst = byIid(iid);
    if (!inst) return null;
    const base = withShards(byId(inst.id));
    const eb = equipBonusOfCard(inst.id);
    const equip = {
      atkPct: eb.atkPct + teamBonus.atkPct,
      hpPct: eb.hpPct + teamBonus.hpPct,
      agiPct: eb.agiPct + teamBonus.agiPct,
      intPct: eb.intPct + teamBonus.intPct,
      manaRegen: eb.manaRegen + teamBonus.manaRegen,
    };
    const ascM = 1 + (inst.asc ?? 0) / 100;
    // retour terrain : les sorts h\u00e9rit\u00e9s remapp\u00e9s ({sort, cran}) se r\u00e9solvent en fiches compl\u00e8tes
    // correctif terrain : la fusion acc + sorts de la forme est dédoublonnée (clé = nom, sinon id + cran)
    const spellKeys = new Set();
    const instSpells = [];
    for (const sp of [...(inst.acc ?? []), ...(base.spells ?? [])].map(resolveSpellEntry).filter(Boolean)) {
      const k = spellKeyOf(sp);
      if (k) { if (spellKeys.has(k)) continue; spellKeys.add(k); }
      instSpells.push(sp);
    }
    return {
      ...base,
      level: inst.lvl,
      atk: Math.max(1, Math.round(base.atk * ascM)),
      hp: Math.max(1, Math.round(base.hp * ascM)),
      noLossPct: inst.noLoss ?? 0,
      equip,
      ...(instSpells.length ? { spells: instSpells } : {}),
    };
  }).filter(Boolean);
  const nAvant = (store.team.formation === '2-3') ? 2 : 3;
  state = initCombat(
    {
      avant: cards.slice(0, nAvant),
      arriere: cards.slice(nAvant),
    },
    wave,
    wseed ^ (store.stage * 2654435761),
    {},
    { difficulty: store.diff }, // refonte IA lot 3 : profil IA de la difficulté
  );
  const teamEmpty = state.team.avant.length === 0 && state.team.arriere.length === 0;
  
  if (!defi && store.runMod === 'sterile') {
    for (const u of [...state.team.avant, ...state.team.arriere]) u.manaRegen = Math.max(1, u.manaRegen - 1);
  }
  // boucle v2 lot 1 : persistance — PV/mana du run repris tels quels (pas de régén entre combats)
  if (!defi) applyRunStateTo(state);
  const isBossFloor = store.stage % 5 === 0;
  const runModDef = (!defi && runModById(store.runMod)) || null;
  const rulesHtml = `<p class="muted">${defi ? 'Un défi divin : les 18 cartes du Seuil, race Divine (éléments Lumière, Eau ou Terre selon leur famille), et dès que vous posez deux divines, vos dégâts ET vos soins gagnent +10 %. Récompense unique par jour : +40 🪙 or, 1 naissance raciale de n’importe quelle race (50 % humaine, 30 % monstre, 15 % mystique, 5 % divine) et 1 éclat brut de son élément, plus 1 pierre d’éveil.' : `Chaque unité régénère du mana (✦) à chaque action et lance le sort le plus cher qu\u2019elle peut payer — s\u2019il sent son gros sort proche, il épargne. Cliquez une carte pour voir sa fiche et TOUS ses effets actifs.`}</p>`;
  const infoChips = [`<button type="button" class="info-chip" data-info="rules" title="Comment joue une carte ?">ℹ️</button>`]
    .concat(runModDef ? [`<button type="button" class="info-chip" data-info="mod" title="Modificateur du run">🎰 ${runModDef.name}</button>`] : [])
    .concat(discovery ? [`<button type="button" class="info-chip" data-info="disc" title="Bonus de découverte">🌱</button>`] : [])
    .join(' ');
  combatApp.innerHTML = `
    <h2>${defi ? `🌟 ${d.name}` : `${d.name} — étage ${store.stage}/${d.floors}${isBossFloor ? ' 👑 BOSS' : ''} <span class="chip">${(DIFFICULTIES[store.diff - 1] ?? DIFFICULTIES[0]).name}</span>`} <span class="muted">(Équipe ${store.activeTeam + 1})</span> ${infoChips}</h2>
    <div id="controls">
      ${defi ? '' : `<span class="chip">Étage ${store.stage}/${d.floors}</span>`}
      <button class="btn ctrl" id="mode">${autoMode ? 'Mode : Auto' : 'Mode : Tactique'}</button>
      <button class="btn ctrl" id="speed">Vitesse : ${SPEED_LABELS[speedIdx]}</button>
      <button class="btn ctrl" id="flash" title="Sans éclats plein écran ni hit-stop">${reduceFlashes ? 'Flashs : réduits' : 'Flashs : complets'}</button>
      <button class="btn ctrl" id="fx-toggle" title="Vidéos des sorts signature (webm)">🎬 FX : ${fxOn() ? 'on' : 'off'}</button>
      <button class="btn ctrl" id="auto-turn">🤖 Auto ce tour</button>
      <button class="btn ctrl" id="bag" title="Boire une potion hors combat (entre les étages)">🧪 Objets (${totalPotions()})</button>
      <button class="btn big" id="fight">${fightLabel()}</button>
    </div>
    <div class="rail-wrap"><div class="rail" id="rail"></div></div>
    <div class="enemy-zone" id="enemy-zone"></div>
    <div class="team-zone" id="team-zone"></div>
    <div id="log"></div>
    ${teamEmpty ? '<div class="banner lose bannerin">Placez d\u2019abord des cartes dans votre équipe !</div><p><a class="btn" href="#equipe">Composer mon équipe →</a></p>' : ''}
  `;
  combatApp.style.background = d.art
    ? `linear-gradient(rgba(12,12,20,.85), rgba(12,12,20,.92)), url("${d.art}") center/cover no-repeat`
    : '';
  combatApp.querySelectorAll('.info-chip').forEach((chipEl) => {
    chipEl.onclick = () => {
      const kind = chipEl.dataset.info;
      if (kind === 'rules') openInfoModal('Comment joue une carte ?', rulesHtml);
      else if (kind === 'mod' && runModDef) openInfoModal(`Modificateur du run : ${runModDef.name}`, `<p class="muted">🎰 <b>${runModDef.glyph} ${runModDef.name}</b> — ${runModDef.desc}</p>`);
      else if (kind === 'disc') openInfoModal('Bonus de découverte', `<p class="muted">${discovery}</p>`);
    };
  });
  combatApp.querySelector('#mode').onclick = (e) => {
    autoMode = !autoMode;
    e.target.textContent = autoMode ? 'Mode : Auto' : 'Mode : Tactique';
    if (autoMode) closeActModal();
    else tacPaused = false; // retour en Tactique : le flux repart tout seul
    syncFightBtn();
    if (autoMode && !busy && state && !state.winner) { const tg = combatGen; setTimeout(() => { if (tg === combatGen) run(); }, 120); }
  };
  combatApp.querySelector('#speed').onclick = (e) => {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    e.target.textContent = `Vitesse : ${SPEED_LABELS[speedIdx]}`;
  };
  combatApp.querySelector('#flash').onclick = (e) => {
    reduceFlashes = !reduceFlashes;
    e.target.textContent = reduceFlashes ? 'Flashs : réduits' : 'Flashs : complets';
  };
  const fxBtn = combatApp.querySelector('#fx-toggle');
  if (fxBtn) fxBtn.onclick = (e) => {
    const on = !fxOn();
    try { storage.setItem('aicg-fx', on ? 'on' : 'off'); } catch (err) { }
    e.target.textContent = `🎬 FX : ${on ? 'on' : 'off'}`;
  };
  combatApp.querySelector('#fight').onclick = () => {
    if (!autoMode) {
      if (!tacPaused && busy) { tacPaused = true; syncFightBtn(); return; } // pause : le tour en cours finit, le suivant attend
      tacPaused = false;
    }
    run();
  };
  combatApp.querySelector('#auto-turn').onclick = () => run(true);
  combatApp.querySelector('#bag').onclick = () => openBagModal();
  drawBoard();
  renderRail();
  if (!teamEmpty && state && !state.winner && (autoMode || !tacPaused)) {
    const tg = combatGen;
    setTimeout(() => { if (tg === combatGen) run(); }, instant() ? 120 : 450);
  }
}
;



function recommendedLevel(d, diff) {
  const DIFF = DIFFICULTIES[diff - 1] ?? DIFFICULTIES[0];
  const bossFinal = levelIn(d, d.floors, DIFF.boss10, true);
  // boucle v2 lot 2 : la force conseillée s'ancre sur le niveau de la marche (1 → 25)
  return Math.max(1, Math.round(Math.max(bossFinal * 0.3, dungeonLevelOf(d.id ?? d, diff) * (M.RECO_LEVEL_RATIO ?? 0.8))));
}

function teamLevel() {
  const iids = [...store.team.slots].filter(Boolean);
  if (!iids.length) return 0;
  return Math.round(iids.reduce((a, iid) => a + (byIid(iid)?.lvl ?? 1), 0) / iids.length);
}

function enterAt(stage, dungeonId) {
  store.defiActive = false;
  const d = DUNGEONS.find((x) => x.id === dungeonId) ?? DUNGEONS[0];
  if (!dungeonUnlocked(d)) {
    const req = DUNGEONS.find((x) => x.id === d.req);
    toast(`✗ Terminez d’abord ${req ? req.name : 'le donjon précédent'}.`, 'warn');
    return;
  }
  store.dungeon = d.id;
  store.stage = Math.min(d.floors, Math.max(1, stage));
  // boucle v2 lot 1 : un nouveau run repart à plein (soins complets entre deux runs distincts)
  store.runState = freshRunState();
  store.runState.active = true;
  store.runMod = RUN_MODS[Math.floor(uiRand() * RUN_MODS.length)].id;
  save();
  updatePtsBadge();
  showRunModModal();
}

function showRunModModal() {
  const mod = runModById(store.runMod);
  if (!mod) { go('#combat'); return; }
  let brutElt = null;
  for (const el of Object.keys(store.gems.brut ?? {})) {
    if ((store.gems.brut[el] ?? 0) > 0) { brutElt = el; break; }
  }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal-box">
    <h3>🎰 Le modificateur de ce run</h3>
    <div class="run-mod-card">
      <div class="run-mod-glyph">${mod.glyph}</div>
      <div><b>${mod.name}</b><p class="muted">${mod.desc}</p></div>
    </div>
    <p class="muted">Chaque exploration tire son modificateur : la face rude paie, la face compense. Entrer avec lui est gratuit — entrer sans lui aussi : seul le changement de tirage se paie. Il tient jusqu'à la fin du run.</p>
    <div class="modal-actions">
      <button class="btn big" id="mod-accept">Accepter — explorer avec</button>
      <button class="btn" id="mod-free">Entrer sans modificateur</button>
      <button class="btn" id="mod-reroll">Relancer le tirage (${brutElt ? `1 éclat brut ${brutElt.toLowerCase()}` : 'aucun éclat brut'})</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#mod-accept').onclick = () => { overlay.remove(); go('#combat'); };
  overlay.querySelector('#mod-free').onclick = () => { store.runMod = null; save(); overlay.remove(); go('#combat'); };
  overlay.querySelector('#mod-reroll').onclick = () => {
    if (!brutElt) { toast('✘ Il faut 1 éclat brut pour relancer le tirage.', 'warn'); return; }
    spendGems('brut', brutElt, 1);
    store.runMod = RUN_MODS[Math.floor(uiRand() * RUN_MODS.length)].id;
    save();
    overlay.remove();
    showRunModModal();
  };
}

function unlocked(d) {
  return dungeonUnlocked(d);
}

function selectDiff(d, diff) {
  if (!diffUnlocked(d.id, diff)) {
    const prev = DIFFICULTIES[diff - 2];
    toast(`✗ Vainquez d’abord le boss final en ${prev.name} de ce donjon.`, 'warn');
    return;
  }
  store.progress[d.id].diff = diff;
  save();
  renderDonjons(document.getElementById('app'));
}

// boucle v2 lot 4 : page Inventaire groupée (potions, matériaux par zone, gemmes, pièces possédées)
function renderInventaire(root) {
  const potRows = Object.values(POTIONS).map((p) => `<div class="shop-row"><span>${p.glyph} <b>${p.nom}</b> <span class="muted">×${potionCount(p.id)}</span></span><span class="muted">${p.prix} or à la Boutique</span></div>`).join('') || '<p class="muted">Aucune potion.</p>';
  const zones = (DATA.zones ?? []);
  const matRows = zones.map((z) => {
    const m = z.materiau;
    if (!m) return '';
    const n = materiauCount(m.id);
    const b = z.matiereBoss;
    return `<div class="shop-row"><span>🧪 <b>${m.nom}</b> <span class="muted">(${z.nature ?? z.id}) ×${n}</span></span><span class="muted">💠 ${b.nom} ×${materiauCount(b.id)} (boss)</span></div>`;
  }).join('') || '<p class="muted">Aucun matériau.</p>';
  const gemRows = GEM_TIERS.map((tier) => {
    const elts = Object.entries(store.gems[tier] ?? {}).filter(([, n]) => n > 0);
    const sell = tier === 'brut' ? `<span class="muted">vendable ${GEM_BRUT_PRIX} or / unité</span>` : '';
    return `<div class="shop-row"><span>💎 Éclats ${GEM_LABEL[tier]}${elts.length ? ' : ' + elts.map(([e, n]) => `${e} ×${n}`).join(' · ') : ' : aucun'}</span>${sell}${tier === 'brut' && elts.length ? `<button type="button" class="btn small" id="sell-brut">Vendre tout (${elts.reduce((a, [, n]) => a + n, 0) * GEM_BRUT_PRIX} or)</button>` : ''}</div>`;
  }).join('');
  const eqRows = Object.entries(store.equipment).filter(([, n]) => n > 0).map(([id, n]) => {
    const p = EQUIP_BY_ID[id];
    return `<div class="shop-row"><span class="r-${p.rarity}">⚔ <b>${p.nom}</b> <span class="chip r-${p.rarity}">${RARITY_LABEL[p.rarity]}</span> ×${n}</span><span class="muted">${pieceBonusText(p)}${p.set ? ` · set ${EQUIP_SETS[p.set]?.nom ?? ''}` : ''}</span></div>`;
  }).join('') || '<p class="muted">Aucune pièce d’équipement — les boss en garantissent une, le reste tombe à taux très faible.</p>';
  root.innerHTML = `
    <h2><button type="button" class="back" id="inv-back" title="Retour à l'accueil">←</button> 🎒 Inventaire</h2>
    <p class="muted">Solde : <b>🪙 ${store.gold} or</b> · 🧪 potions <b>${totalPotions()}</b> · 💎 pierres d’éveil <b>${pierreCount()}</b></p>
    <h3>🧪 Potions</h3>${potRows}
    <h3>🧪 Matériaux par zone</h3>${matRows}
    <h3>💎 Gemmes (éclats)</h3>${gemRows}
    <h3>⚔️ Pièces d’équipement possédées</h3>${eqRows}
    <p class="muted">Poser une pièce : fiche de la carte (2 slots : arme typée + armure) · 2 slots d'équipe sur la page Équipe (onglet Équipe de la page Personnage). Fabriquer une pièce de set : atelier de la 🛒 Boutique.</p>`;
  root.querySelector('#inv-back')?.addEventListener('click', () => go('#accueil'));
  const sellBtn = root.querySelector('#sell-brut');
  if (sellBtn) sellBtn.onclick = () => {
    let n = 0;
    for (const [e, c] of Object.entries(store.gems.brut ?? {})) { n += c; store.gems.brut[e] = 0; }
    if (n > 0) {
      addGold(n * GEM_BRUT_PRIX);
      save();
      toast(`✓ ${n} éclats bruts vendus contre ${n * GEM_BRUT_PRIX} or.`);
      renderInventaire(root);
    }
  };
}

function pieceBonusText(p) {
  if (p.bonus?.stat === 'manaRegen') return `+${p.bonus.n} régén mana d'équipe`;
  const stat = { atkPct: 'ATQ', hpPct: 'PV', agiPct: 'AGI', intPct: 'INT' }[p.bonus?.stat] ?? p.bonus?.stat;
  return `+${Math.round((p.bonus?.pct ?? 0) * 100)} % ${stat}`;
}

// boucle v2 lot 1 : point d'achat minimal — le rayon potions (le reste de la Boutique arrive avec l'économie v2)
function renderBoutique(root) {
  const rows = Object.values(POTIONS).map((p) => `<div class="shop-row">
    <span>${p.glyph} <b>${p.nom}</b> <span class="muted">${p.genre === 'soin' ? `soigne +${Math.round(p.pct * 100)} % des PV max` : `recharge +${Math.round(p.pct * 100)} % du mana max`} — en combat chaque gorgée coûte le tour, utilisable aussi entre les étages · stock : <b>${potionCount(p.id)}</b></span></span>
    <button type="button" class="btn small gold" data-buy="${p.id}" ${store.gold < p.prix ? 'disabled' : ''}>Acheter — ${p.prix} or</button>
  </div>`).join('');
  const eclatPrix = M.ECLAT_BUY_PRIX ?? 150;
  const eclatRows = ELEMENTS.map((el) => `<div class="shop-row">
    <span>💎 <b>Éclat brut (${el})</b> <span class="muted">gemme brute, vendable ${GEM_BRUT_PRIX} or · stock : <b>${gemCount('brut', el)}</b></span></span>
    <button type="button" class="btn small gold" data-buy-eclat="${el}" ${store.gold < eclatPrix ? 'disabled' : ''}>Acheter — ${eclatPrix} or</button>
  </div>`).join('');
  const boutiquePieces = EQUIPMENT.filter((p) => p.source === 'boutique');
  const debloquees = new Set(raretesMarchandDebloquees());
  const offres = offresMarchandDuJour();
  const offreRows = offres.map((m) => {
    const prix = marchandPrix(m) ?? 0;
    return `<div class="shop-row">
      <span>🐾 <b>${m.name}</b> <span class="muted">${m.classe} · ${m.element} · ${RARITY_LABEL[m.rarity] ?? m.rarity} · possédée : <b>${ownedOf(m.id)}</b>/${MARCHAND.maxExemplaires ?? 3}</span></span>
      <button type="button" class="btn small gold" data-buy-offre="${m.id}" ${store.gold < prix || (ownedOf(m.id) ?? 0) >= (MARCHAND.maxExemplaires ?? 3) ? 'disabled' : ''}>Acheter — ${prix} or</button>
    </div>`;
  }).join('');
  const marchandRows = (MARCHAND.raretesVendues ?? []).map((rar) => {
    const list = marchandMonsters().filter((m) => m.rarity === rar);
    const prix = MARCHAND.prixParRarete?.[rar] ?? 0;
    if (!list.length) return '';
    const verrou = !debloquees.has(rar);
    const diffRequise = (DIFFICULTIES[(MARCHAND.debloqueParDiff?.[rar] ?? 1) - 1]?.name) ?? '';
    return `<h4 class="shop-sub">${RARITY_LABEL[rar] ?? rar} — ${prix} or${verrou ? ` 🔒 <span class="muted">(déblocage : donjon bouclé en ${diffRequise})</span>` : ''}</h4>` + list.map((m) => `<div class="shop-row">
      <span>🐾 <b>${m.name}</b> <span class="muted">${m.classe} · ${m.element} · possédée : <b>${ownedOf(m.id)}</b>/${MARCHAND.maxExemplaires ?? 3}${verrou ? ' · 🔒 verrouillée' : ''}</span></span>
      <button type="button" class="btn small gold" data-buy-mon="${m.id}" ${verrou || store.gold < prix || (ownedOf(m.id) ?? 0) >= (MARCHAND.maxExemplaires ?? 3) ? 'disabled' : ''}>Acheter — ${prix} or</button>
    </div>`).join('');
  }).join('');
  const eqRows = boutiquePieces.map((p) => `<div class="shop-row">
    <span>${p.slot === 'arme' ? '🗡️' : p.slot === 'armure' ? '🛡️' : '📿'} <b>${p.nom}</b> <span class="muted">${p.slot}${p.classe ? ` · ${p.classe}` : ''} · ${RARITY_LABEL[p.rarity] ?? p.rarity} · ${bonusLabelOf(p.bonus)} · possédée : <b>${equipPieceCount(p.id)}</b></span></span>
    <button type="button" class="btn small gold" data-buy-eq="${p.id}" ${store.gold < p.prix ? 'disabled' : ''}>Acheter — ${p.prix} or</button>
  </div>`).join('');
  // reste code lot 7 : atelier de craft en ville — pièces de set (matériaux de zone + matière du boss)
  const setPieces = EQUIPMENT.filter((p) => p.source === 'set');
  const atelierRows = (DATA.zones ?? []).map((z) => {
    const pieces = setPieces.filter((p) => p.zone === z.id);
    if (!pieces.length) return '';
    const setKey = 'set-' + z.id.replace('zone-', '');
    const rowsZ = pieces.map((p) => {
      const c = craftCostOf(p);
      const costTxt = c
        ? `${c.materiauN}× ${c.materiauNom} (×${materiauCount(c.materiauId)})${c.bossN ? ` + ${c.bossN}× ${c.bossNom} (×${materiauCount(c.bossId)})` : ''} + ${c.or} or`
        : 'non craftable';
      const can = !!c && materiauCount(c.materiauId) >= c.materiauN && (c.bossN === 0 || materiauCount(c.bossId) >= c.bossN) && store.gold >= c.or;
      return `<div class="shop-row"><span>🔨 <b>${p.nom}</b> <span class="muted">${p.slot}${p.classe ? ` · ${p.classe}` : ''} · ${RARITY_LABEL[p.rarity] ?? p.rarity} · ${bonusLabelOf(p.bonus)} · possédée ×${equipPieceCount(p.id)}</span></span><span class="muted">${costTxt}</span><button type="button" class="btn small gold" data-craft="${p.id}" ${can ? '' : 'disabled'}>Fabriquer</button></div>`;
    }).join('');
    return `<h4 class="shop-sub">${z.nature ?? z.id} — set ${EQUIP_SETS[setKey]?.nom ?? ''}</h4>${rowsZ}`;
  }).join('');
  root.innerHTML = `
    <h2>🛒 Boutique</h2>
    <p class="muted">Solde : <b>🪙 ${store.gold} or</b> — conversion : <b>1 ⚡ = 1 or</b>. Catalogue fixe : potions (en combat, action 🧪 Objet, chaque gorgée coûte le tour ; entre les étages, gratuit), éclats bruts, équipement du bas de gamme. Les pièces de set et le haut de gamme se lootent en donjon ou se craftent à l'atelier ci-dessous.</p>
    <h3>🧪 Potions</h3>
    ${rows}
    <h3>💎 Éclats bruts</h3>
    ${eclatRows}
    <h3>🗡️ Équipement (rayon Boutique)</h3>
    ${eqRows}
    <h3>🐾 Marchand de créatures</h3>
    <p class="muted">Monstres non nommés (fusion, enseignements), limite ${MARCHAND.maxExemplaires ?? 3} exemplaires — échelle C 200 → UR 10 000 or. <b>Offres du jour</b> : rotation quotidienne de ${MARCHAND.nbOffresJour ?? 3} offres (seed du jour), tirées parmi les raretés débloquées ; une rareté se débloque en bouclant un donjon dans la difficulté requise (C dès le départ, puis UC Facile, R Normal, SR Difficile, UR Très difficile).</p>
    <h4 class="shop-sub">✨ Offres du jour (${offres.length})</h4>
    ${offreRows || '<p class="muted fam-hint">Plus d’offre aujourd’hui.</p>'}
    <h4 class="shop-sub">Catalogue complet</h4>
    ${marchandRows}
    <h3>🔨 Atelier — craft en ville (pièces de set)</h3>
    <p class="muted">Les sets se fabriquent ici : la base demande des matériaux de la zone ; la supérieure et la royale exigent en plus la matière du boss du donjon de la zone (elle ne s'achète pas). Coûts en data (table « craft » de data/equipment.json).</p>
    ${atelierRows}`;
  root.querySelectorAll('[data-buy]').forEach((b) => {
    b.onclick = () => {
      if (buyPotion(b.dataset.buy)) {
        toast(`✓ ${POTIONS[b.dataset.buy].nom} achetée (${POTIONS[b.dataset.buy].prix} or).`);
        renderBoutique(root);
      }
    };
  });
  root.querySelectorAll('[data-buy-eclat]').forEach((b) => {
    b.onclick = () => {
      if (buyEclat(b.dataset.buyEclat)) {
        toast(`✓ Éclat brut (${b.dataset.buyEclat}) acheté (${eclatPrix} or).`);
        renderBoutique(root);
      }
    };
  });
  root.querySelectorAll('[data-buy-eq]').forEach((b) => {
    b.onclick = () => {
      const piece = EQUIP_BY_ID[b.dataset.buyEq];
      if (buyEquipment(b.dataset.buyEq)) {
        toast(`✓ ${piece.nom} achetée (${piece.prix} or) — elle rejoint l'inventaire, à équiper depuis la fiche.`);
        renderBoutique(root);
      }
    };
  });
  root.querySelectorAll('[data-buy-mon]').forEach((b) => {
    b.onclick = () => {
      const m = allMonsters().find((x) => x.id === b.dataset.buyMon);
      if (buyMonster(b.dataset.buyMon)) {
        toast(`✓ ${m.name} rejoint la collection (${marchandPrix(m)} or).`);
        renderBoutique(root);
      }
    };
  });
  root.querySelectorAll('[data-buy-offre]').forEach((b) => {
    b.onclick = () => {
      const m = allMonsters().find((x) => x.id === b.dataset.buyOffre);
      if (buyMonster(b.dataset.buyOffre)) {
        toast(`✓ ${m.name} rejoint la collection (${marchandPrix(m)} or).`);
        renderBoutique(root);
      }
    };
  });
  root.querySelectorAll('[data-craft]').forEach((b) => {
    b.onclick = () => {
      const piece = EQUIP_BY_ID[b.dataset.craft];
      if (craftPiece(b.dataset.craft)) {
        toast(`✓ ${piece.nom} fabriquée à l'atelier — elle rejoint l'inventaire, à équiper depuis la fiche.`);
        renderBoutique(root);
      }
    };
  });
}

// économie v2 lot E4 : page Quêtes quotidiennes
function renderQuetes(root) {
  const list = ensureQuetes();
  const taille = (id) => (QUETES.petites ?? []).some((q) => q.id === id) ? 'Petite' : (QUETES.moyennes ?? []).some((q) => q.id === id) ? 'Moyenne' : 'Grande';
  const rows = list.map((q) => {
    const pct = Math.min(100, Math.round(((q.progress ?? 0) / q.n) * 100));
    return `<div class="shop-row quest-row ${q.done ? 'done' : ''}">
      <span>📜 <b>${q.label}</b> <span class="muted">${taille(q.id)} · ${q.progress ?? 0}/${q.n} · récompense : ${q.or} 🪙 or${q.eclat ? ' + 1 éclat brut' : ''}${q.bonusN ? ' + 1 naissance (carte N)' : ''}</span>
        <div class="quest-bar"><div class="quest-fill" style="width:${pct}%"></div></div>
      </span>
      <span class="chip ${q.done ? 'on' : ''}">${q.done ? 'Accomplie' : `${pct} %`}</span>
    </div>`;
  }).join('');
  const allDone = list.length > 0 && list.every((q) => q.done);
  root.innerHTML = `
    <h2>📜 Quêtes du jour</h2>
    <p class="muted">3 quêtes en rotation quotidienne (seed du ${todayKey()}) — 1 petite, 1 moyenne, 1 grande. Progression persistée, remise à zéro chaque nuit. Solde : <b>🪙 ${store.gold} or</b> · pierres d’éveil : <b>💎 ${pierreCount()}</b>.</p>
    ${rows || '<p class="muted fam-hint">Aucune quête aujourd’hui.</p>'}
    <p class="muted">${allDone
      ? `🏆 Toutes les quêtes sont accomplies — bonus de complétion : +${QUETES.bonusCompletion?.pierre ?? 1} pierre d’éveil ${store.quetes.bonusDone ? 'reçu' : ''}.`
      : `Bonus de complétion : +${QUETES.bonusCompletion?.pierre ?? 1} pierre d’éveil si les 3 quêtes sont accomplies aujourd’hui.`}</p>`;
}

function renderDonjons(root) {
  root.innerHTML = `
    <h2>Donjons</h2>
    <p class="muted">Cinq régions à déverrouiller en chaîne, dix étages chacune, cinq difficultés : plus la difficulté monte, plus les créatures sont rares, les récompenses abondantes. Chaque entrée repart de l’étage 1 — une défaite ne bloque jamais.</p>
    <div class="defi-card">
      <h3>📜 Quêtes quotidiennes</h3>
      <p class="muted">Le défi du jour est remplacé par 3 quêtes en rotation quotidienne (1 petite + 1 moyenne + 1 grande) : or, parfois une naissance, et 1 pierre d’éveil si les trois sont accomplies.</p>
      <div class="dungeon-actions"><a class="btn big" href="#quetes">Voir les quêtes du jour</a></div>
    </div>
    <div class="dungeon-grid">
      ${DUNGEONS.map((d) => {
        const open = dungeonUnlocked(d);
        const curDiff = store.progress[d.id].diff;
        const prog = progOf(d.id, curDiff);
        const nextBoss = Math.min(d.floors, Math.ceil(prog.stage / 5) * 5);
        const cp = Math.floor(prog.record / 5) * 5 + 1;
        const hasCp = cp > 1 && cp <= d.floors;
        const DIFF = DIFFICULTIES[curDiff - 1];
        const rec = recommendedPower(d, curDiff); 
        const tl = teamLevel();
        const active = store.dungeon === d.id;
        const reqD = d.req ? DUNGEONS.find((x) => x.id === d.req) : null;
        return `
        <div class="dungeon-card ${open ? '' : 'locked'}" style="--dcolor: ${d.accent}">
          <div class="dungeon-art ${d.art ? '' : 'noimg'}" ${d.art ? '' : `style="background: linear-gradient(160deg, ${d.accent}44, #14141c)"`}>
            ${d.art ? `<img src="${d.art}" alt="${d.name}" loading="lazy">` : `<span class="dungeon-icon">${d.icon}</span>`}
          </div>
          <div class="dungeon-body">
            <h3>${d.name}${active ? ' <span class="chip on">actif</span>' : ''}</h3>
            <p class="muted">${d.desc}</p>
            <p><b>${d.floors}</b> étages · boss aux étages 5 et 10</p>
            <div class="diff-row">
              ${DIFFICULTIES.map((D) => {
                const ok = diffUnlocked(d.id, D.id);
                return `<button type="button" class="diff-chip ${D.id === curDiff ? 'sel' : ''} ${ok ? '' : 'lock'}" data-dungeon="${d.id}" data-diff="${D.id}" title="${ok ? `Nv ${dungeonLevelOf(d.id, D.id)} · bande ${bandOf(D.id).join('→')} — ${D.name}` : 'Vainquez le boss final en ' + DIFFICULTIES[D.id - 2].name + ' d’abord'}">${ok ? `${D.name} · Nv ${dungeonLevelOf(d.id, D.id)}` : '🔒 ' + D.name}</button>`;
              }).join('')}
            </div>
            <p class="muted">Marche Nv <b>${dungeonLevelOf(d.id, curDiff)}</b> · bande de rareté <b>${bandOf(curDiff).join(' → ')}</b> · créatures ${DIFF.minR} minimum · boss mi-course ${DIFF.boss5}, boss final ${DIFF.boss10}${DIFF.allBoss ? ' — un boss à CHAQUE étage' : ''} · points ×${DIFF.pts}.</p>
            <p class="muted">Conseil : les créatures ${d.types.join(' / ')} sont dominées par ${[...new Set(d.types.map((t) => BEATEN_BY[t]))].join(' / ')} (+25 % de dégâts pour qui les frappe).</p>
            <p class="rec-line">Force conseillée : indice d'équipe <b>≥ ${rec}</b> pour finir — ATQ, PV, rareté et sorts pondérés · votre équipe : <b>indice ${Math.round(teamPower())}</b>${teamPower() >= rec ? ' ✅' : ' ⚠️'}</p>
            <p class="muted">Record (${DIFF.name}) : étage ${prog.record || 0}/${d.floors} vaincu${prog.record > 1 ? 's' : ''} · meilleur : ${bestRecord(d.id)}/${d.floors}</p>
            <p class="muted">Éclat de régression : uniquement à partir de la difficulté Difficile (${Math.round(REG_ECLAT_RATE[2] * 100)} %), puis ${Math.round(REG_ECLAT_RATE[3] * 100)} % en Cauchemar et ${Math.round(REG_ECLAT_RATE[4] * 100)} % en Enfer. Éclats bruts : chaque boss d\u2019\u00e9tage en garantit 1, le boss final 2 (\u00e9l\u00e9ments du donjon : ${(d.types ?? []).join('/') || 'variable'}). Pierre d\u2019\u00e9veil : ${Math.round(PIERRE_DROP_RATE * 100)} % par boss d\u2019\u00e9tage. Naissance sauvage : ${Math.round(N_DROP_RATE * 100)} % par \u00e9tage vaincu, une naissance born\u00e9e par vos d\u00e9blocages se joint \u00e0 vous.</p>
            <div class="dungeon-actions">
              ${open
                ? `<span class="btn big enter-btn" data-dungeon="${d.id}">Entrer — étage 1</span>
                   ${hasCp ? `<span class="btn checkpoint-btn" data-dungeon="${d.id}" data-stage="${cp}">Reprendre au checkpoint (étage ${cp})</span>` : ''}`
                : `<span class="btn big" disabled>🔒 Terminez ${reqD ? reqD.name : 'le donjon précédent'} pour ouvrir</span>`}
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <p class="muted">🎰 À l'entrée de chaque exploration, un modificateur de run est tiré — acceptez-le (butin majoré), entrez librement sans lui, ou relancez le tirage contre 1 éclat brut.</p>
    <p class="vspace"></p>
    <p class="muted">Chaque donjon a son bestiaire : les monstres vaincus ne se capturent plus — les cartes naissent à la Guilde (compagnons, autel), au marchand de la Boutique, en quêtes et en donjon ; elles montent en niveau par l’XP de donjon.</p>`;
  root.querySelectorAll('.enter-btn').forEach((el) => {
    el.onclick = () => enterAt(1, el.dataset.dungeon);
  });
  root.querySelectorAll('.checkpoint-btn').forEach((el) => {
    el.onclick = () => enterAt(Number(el.dataset.stage), el.dataset.dungeon);
  });
  root.querySelectorAll('.diff-chip').forEach((el) => {
    el.onclick = () => selectDiff(dungeonById(el.dataset.dungeon), Number(el.dataset.diff));
  });
}
;




function forgeEvolve(iid, to = null) {
  const r = evolveInstance(Number(iid), to);
  if (!r.ok) {
    toast(`\u2717 ${r.reason}`, 'warn');
    return;
  }
  questProgress('evoluer');
  toast(`\u2713 \u00c9volution : ${byId(r.nextId).name} \u2014 Ascendance +${r.asc} % grav\u00e9e${r.inherited ? `, ${r.inherited} sort${r.inherited > 1 ? 's' : ''} h\u00e9rit\u00e9${r.inherited > 1 ? 's' : ''}` : ''} !`);
  openRevealModal([r.nextId], { title: '⭐ ÉVOLUTION !', subtitle: `Ascendance grav\u00e9e : +${r.asc} % de stats de base${r.inherited ? ` \u00b7 ${r.inherited} sort${r.inherited > 1 ? 's' : ''} h\u00e9rit\u00e9${r.inherited > 1 ? 's' : ''}` : ''}.`, note: 'Touchez la carte pour d\u00e9couvrir sa nouvelle forme.', cta: 'Continuer' });
}

function renderForge(root) {
  
  const evoRows = [];
  for (const inst of store.instances) {
    
    const targets = evoTargetsOf(inst.id);
    if (!targets.length) continue;
    const card = byId(inst.id);
    const cost = evoCostOf(inst.id);
    const [tier, n] = cost ?? ['?', 0];
    const isEveil = tier === 'pierre';
    const gainNow = Math.max(0, Math.round((inst.lvl - 10) * 5) / 10);
    const st = statsAt(card, inst.lvl, inst.asc ?? 0);
    const nextNames = targets.map((tid) => {
      const voie = evoVoieOf(inst.id, tid);
      return `${byId(tid).name}${voie ? ` (${voie})` : ''}`;
    }).join(' ou ');
    const btns = targets.map((tid) => {
      const next = byId(tid);
      const elt = card.element ?? next.element; 
      const have = tier === '?' ? 0 : (isEveil ? pierreCount() : gemCount(tier, elt));
      const ready = inst.lvl >= 10 && have >= n;
      const voie = evoVoieOf(inst.id, tid);
      return ready
        ? `<button class="btn small gold" data-evolve="${inst.iid}" data-evolve-to="${tid}">${isEveil ? '\u00c9veiller' : '\u00c9voluer'} \u2192 ${next.name}${voie ? ` (${voie})` : ''} (+${gainNow} % Ascendance)</button>`
        : `<button class="btn small" disabled>${inst.lvl < 10 ? `Niveau ${inst.lvl}/10 requis \u2014 l\u2019XP vient des donjons` : (isEveil ? `${have}/${n} pierre${n > 1 ? 's' : ''} d\u2019\u00e9veil` : `${have}/${n} \u00e9clats ${GEM_LABEL[tier]} d\u2019\u00e9l\u00e9ment ${elt}`)}</button>`;
    }).join(' ');
    evoRows.push(`<div class="forge-row">
    <div class="forge-card" data-open="${inst.id}">${cardFront({ ...card, level: inst.lvl, atk: st.atk, hp: st.hp }, { extraClass: hasArt(card) ? 'unit-art' : '' })}${anyNewOf(card.id) ? `<span class="new-badge" title="Nouvelle carte !">\u2728</span>` : ''}</div>
    <div class="forge-acts">
      <p class="muted">${card.name} \u2014 <b>Nv ${inst.lvl}/20</b> \u00b7 Ascendance +${inst.asc ?? 0} % de base \u00b7 ATQ ${st.atk} / PV ${st.hp}</p>
      <p class="muted">${isEveil ? `\u00c9veiller` : `\u00c9voluer`} en <b>${nextNames}</b> : niveau 10 atteint + ${isEveil ? `${n} pierre${n > 1 ? 's' : ''} d\u2019\u00e9veil` : `${n} \u00e9clat${n > 1 ? 's' : ''} ${GEM_LABEL[tier]} dans l\u2019\u00e9l\u00e9ment de la forme choisie`} \u2014 la nouvelle forme repart niveau 1 et GARDE les sorts accumul\u00e9s.</p>
      <p class="muted">Dilemme de l\u2019Ascendance : \u00e9voluer maintenant grave <b>+${gainNow} %</b>${inst.lvl >= 20 ? ' (maximum atteint)' : ` \u00b7 attendre le niveau 20 graverait <b>+5 %</b>`} \u2014 le bonus se CUMULE \u00e0 chaque \u00e9volution.</p>
      ${btns}
    </div>
  </div>`);
  }

  
  const altarBtns = [];
  for (const [cat, catLabel] of [['pers', 'personnages'], ['monstres', 'monstres']]) {
    for (const rar of Object.keys(NEXT_RAR)) {
      const cnt = altarPoolCount(rar, cat);
      altarBtns.push(`<button class="btn small ${cnt >= 5 ? 'gold' : ''}" data-altar="${rar}|${cat}" ${cnt >= 5 ? '' : 'disabled'}>5 \u00d7 ${rar} (${catLabel}) \u2192 1 \u00d7 ${NEXT_RAR[rar]} \u2014 ${cnt}/5 libres</button>`);
    }
  }
  const gemList = GEM_TIERS.map((t) => {
    const els = Object.entries(store.gems[t] ?? {}).filter(([, v]) => v > 0);
    return els.length ? `<b>${GEM_LABEL[t]}</b> : ${els.map(([el, v]) => `${v} ${el}`).join(', ')}` : '';
  }).filter(Boolean).join(' \u00b7 ');

  
  const guildeRows = compagnonsDuJour().map((c) => {
    const prix = compagnonPrix(c);
    const owned = ownedOf(c.id) ?? 0;
    const max = GUILDE.maxExemplaires ?? 3;
    return `<div class="shop-row">
      <span>🤝 <b>${c.name}</b> <span class="muted">${RARITY_LABEL[c.rarity] ?? c.rarity} · ${c.classe} · ${c.element} · possédée : <b>${owned}</b>/${max}</span></span>
      <button type="button" class="btn small gold" data-compagnon="${c.id}" ${store.gold < prix || owned >= max ? 'disabled' : ''}>Recruter — ${prix} or</button>
    </div>`;
  });

  root.innerHTML = `
    <h2>🛡️ La Guilde <span class="muted">— évolutions, autel, compagnons</span></h2>
    <p class="muted">Depuis v0.33.1, chaque exemplaire est une carte individuelle : son niveau (1-20) et son Ascendance propres. Les cartes naissent à la Forge (jetons typés, autel, défi du jour) : plus de boutique, plus de captures. L\u2019\u00e9volution exige un exemplaire de niveau 10 + des \u00e9clats : l\u2019or n\u2019ach\u00e8te jamais la puissance. La carte DEVIENT sa nouvelle forme, repart niveau 1 et garde ses sorts accumul\u00e9s.</p>
    <h3>\u00c9volutions ${evoRows.length ? `(${evoRows.length})` : ''}</h3>
    ${evoRows.length ? evoRows.join('') : '<p class="muted fam-hint">Aucune \u00e9volution disponible : recrutez des cartes (Guilde, marchand, quêtes, donjon) et montez-les au niveau 10 en donjon.</p>'}
    <h3>\u00c9clats d\u2019\u00e9volution en r\u00e9serve</h3>
    <p class="muted">${gemList || 'Aucun \u00e9clat pour l\u2019instant : les boss des \u00e9tages 5 et 10 en l\u00e2chent (tier selon la difficult\u00e9), et chaque \u00e9tage interm\u00e9diaire a une chance d\u2019\u00e9clat brut \u2014 fatigue quotidienne par donjon (premier drop garanti, puis 50 %, 25 %, 12,5 %\u2026 plancher 10 %, remise \u00e0 z\u00e9ro chaque nuit).'}</p>
    <h3>💎 Pierres d’éveil en réserve : ${store.pierres ?? 0}</h3>
    <p class="muted">La pierre d’éveil réveille une NAISSANCE (rang N) : elle ouvre sa voie (niveau 10 requis) et remplace les éclats pour ce rang et seulement lui. Les boss des donjons en lâchent rarement (${Math.round(PIERRE_DROP_RATE * 100)} % par boss d’étage vaincu), les quêtes quotidiennes en donnent. Les autres rangs gardent leurs éclats.</p>
    <h3>\u{1F300} Éclats de régression en réserve : ${store.regEclats ?? 0}</h3>
    <p class="muted">L\u2019\u00c9clat de r\u00e9gression ne tombe qu\u2019\u00e0 partir de la difficult\u00e9 DIFFICILE, jamais avant (sauf m\u00e9canismes secrets \u00e0 venir) : 1,2 % par victoire en Difficile, 2,5 % en Cauchemar, 5 % en Enfer. Il ouvrira la r\u00e9gression : depuis un point de blocage, une NOUVELLE carte au palier R d\u2019une race sup\u00e9rieure, qui garde 100 % des sorts et 10 % des stats gagn\u00e9es \u2014 l\u2019ancienne reste. Les premi\u00e8res cibles arrivent avec les nouveaux arbres : la r\u00e9serve se remplit d\u00e8s maintenant.</p>
    <h3>Autel de g\u00e9n\u00e9ration ${'\u2014'} 5 pour 1</h3>
    <p class="muted fam-hint">Sacrifiez 5 exemplaires LIBRES d\u2019une m\u00eame cat\u00e9gorie (personnages OU monstres, jamais m\u00e9lang\u00e9s) pour g\u00e9n\u00e9rer 1 carte de raret\u00e9 sup\u00e9rieure, m\u00eame cat\u00e9gorie, \u00e9l\u00e9ment pond\u00e9r\u00e9 par les cartes sacrifi\u00e9es. Cha\u00eene compl\u00e8te : 5 C = 1 UC \u00b7 5 UC = 1 R \u00b7 5 R = 1 SR \u00b7 5 SR = 1 UR \u00b7 5 UR = 1 <b>L</b>. La L\u00e9gendaire est un PROJET, jamais un tirage : elle se construit (1 L = 25 SR = 125 R = 625 UC = 3125 communes, ou l\u2019\u00e9quivalent en jetons).</p>
    <div class="fusion-list">${altarBtns.join('')}</div>
    <h3>🤝 Compagnons du jour ${guildeRows.length ? `(${guildeRows.length})` : ''}</h3>
    <p class="muted fam-hint">La Guilde (ex-Forge) recrute des compagnons contre de l'or : rotation quotidienne de ${GUILDE.nbOffresJour ?? 3} offres (seed du jour), prix selon le rang (C 500 → UR 2 000 or), limite ${GUILDE.maxExemplaires ?? 3} exemplaires — le rang L se construit à l'autel, jamais au recrutement.</p>
    <div class="fusion-list">${guildeRows.join('') || '<p class="muted fam-hint">Plus d’offre aujourd’hui.</p>'}</div>
  `;
  root.querySelectorAll('[data-open]').forEach((el) => {
    el.addEventListener('click', () => openCardModal(byId(el.dataset.open)));
  });
  const act = (fn) => {
    const y = window.scrollY ?? 0;
    fn();
    renderForge(root);
    window.scrollTo(0, y);
  };
  root.querySelectorAll('[data-evolve]').forEach((el) => {
    el.addEventListener('click', () => act(() => forgeEvolve(el.dataset.evolve, el.dataset.evolveTo ?? null)));
  });
  root.querySelectorAll('[data-compagnon]').forEach((el) => {
    el.addEventListener('click', () => act(() => {
      const c = byId(el.dataset.compagnon);
      if (buyCompagnon(el.dataset.compagnon)) {
        toast(`✓ ${c.name} rejoint la collection (${compagnonPrix(c)} or).`);
        openRevealModal([c.id], { title: '🤝 Nouveau compagnon', subtitle: 'La carte rejoint déjà votre collection.', note: 'Touchez la carte pour la révéler.', cta: 'Bien reçu !' });
      }
    }));
  });
  root.querySelectorAll('[data-altar]').forEach((el) => {
    el.addEventListener('click', () => act(() => {
      const [rar, cat] = el.dataset.altar.split('|');
      const r = runAltar(rar, cat);
      if (r.ok) {
        questProgress('fusionner');
        toast(`\u2713 L\u2019autel absorbe 5 ${rar} (${cat === 'pers' ? 'personnages' : 'monstres'}) \u2014 ${byId(r.id).name} (${r.nextRar}, \u00e9l\u00e9ment ${r.element}) na\u00eet !`);
        openRevealModal([r.id], { title: '🕯️ L\u2019autel de génération', subtitle: `5 ${rar} absorb\u00e9es \u2014 \u00e9l\u00e9ment ${r.element} pond\u00e9r\u00e9. La carte rejoint d\u00e9j\u00e0 votre collection.`, note: 'Touchez la carte pour la révéler.', cta: 'Bien reçu !' });
      }
      else toast(`\u2717 ${r.reason}`, 'warn');
    }));
  });
}
;



const gloOwned = (id) => store.collection.get(id) ?? 0;
const isKnown = (id) => gloOwned(id) > 0 || seenCard(id);

const RARITIES = [
  ['N', 'Naissance', 'Le rang des d\u00e9buts, sous la commune : une carte qui n\u2019a encore rien choisi, \u00e0 amener o\u00f9 l\u2019on veut.'],
  ['C', 'Commune', 'Le quotidien des donjons : discret mais fiable.'],
  ['UC', 'Peu commune', 'Un cran au-dessus, souvent le premier vrai compagnon.'],
  ['R', 'Rare', 'Le socle des familles, chaque lignée s’appuie dessus.'],
  ['SR', 'Super Rare', 'Le cœur des équipes : à cette rareté, les voies des familles se dévoilent.'],
  ['UR', 'Ultra Rare', 'L’avant-sommet : capacités marquantes, stats solides.'],
  ['L', 'Légendaire', 'Le sommet des familles, couronné par les boss des difficultés hautes.'],
  ['M', 'Mythique', 'Un seul par donjon, le roi caché. Ne sort jamais en pack : seul le boss final en Très difficile ou Enfer peut le céder.'],
];

const CLASS_DOC = {
  Guerrier: { stats: '+10 % ATQ, +15 % PV', desc: 'Frappe à 100 %. Bouclier passif : chaque coup encaissé en vie lui donne 5 % de ses PV max en bouclier.' },
  Assassin: { stats: '+5 % ATQ, −10 % PV', desc: 'Frappe à 100 %. 15 % d’esquive. Exécution : +25 % de dégâts quand la cible est sous 35 % de ses PV.' },
  Mage: { stats: '+5 % ATQ, −5 % PV', desc: 'Sans sort, frappe à 80 % sur sa cible et 40 % en zone sur le reste de la vague.' },
  Prêtre: { stats: '−15 % ATQ, PV neutres', desc: 'Frappe à 70 % : ses sorts soignent et protègent aussi bien qu’ils frappent.' },
  Occultiste: { stats: '−20 % ATQ, PV neutres', desc: 'Sans sort, frappe à 60 % mais sur TOUTE la vague ennemie. Les malédictions sont son rayon.' },
  Invocateur: { stats: '−10 % ATQ, −10 % PV', desc: 'Frappe à 80 %. Son sort n’attaque pas : il invoque un sbire temporaire qui frappe à sa place.' },
};

const STATUS_DOC = [
  ['☠', 'Poison / brûlure', 'Dégâts à chaque tour pendant quelques tours (les sorts marqués « laisse une brûlure » en appliquent une).'],
  ['😵', 'Étourdissement', 'L’unité passe son tour.'],
  ['🐌', 'Lenteur', 'Une équipe ralentie subit des frappes doubles de la part de l’adversaire.'],
  ['↩️', 'Renvoi', 'L’unité renvoie une part des dégâts subis à l’attaquant.'],
  ['🔮', 'Malédiction', '−X % d’ATQ pendant X tours. Les boss y résistent : effet réduit de moitié sur eux.'],
  ['🔗', 'Lien', 'Deux alliés liés partagent soins et bonus de moitié.'],
  ['🕯️', 'Invocation', 'Un sbire temporaire rejoint la ligne : 2 sbires vivants maximum, 3 invocations par carte et par combat, durée 3 tours.'],
  ['✨', 'Renaissance', 'L’unité tombe puis revient avec la moitié de ses PV.'],
];

const HISTORY = [
  ['v1.36 : Refonte visuelle de l’errance (maquette A+)', 'Peinture organique en pré-rendu unique (étang, chemin texturé, arbres en couches, donjon peint), ambiance jour/nuit avec faune et lames animées, layout v2 des Marées + point de retour ville dans chaque zone, palettes des 5 zones en data. 175 tests, smoke 355 checks, digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000.'],
  ['v1.35 : Parties multiples (4 slots de sauvegarde)', 'Jusqu’à 4 parties coexistent dans le navigateur (clés `fondations-cards-v1.p0`…`.p3` + index `.slots`, `.bak` par partie). Migration sans perte : l’ancienne sauvegarde devient la Partie 1. Panneau « Parties » sur l’Accueil : ▶ Jouer / ✨ Nouvelle partie / ✏️ Renommer / 🗑 Supprimer (double confirmation) ; la partie en cours est sauvegardée avant toute bascule, la partie active est mémorisée. Export FCSAVE1 inchangé (partie active). 171 tests, smoke 347 checks (B19/B20), digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000.'],
  ['v1.34 : Refonte de l’IA de combat', 'Ciblage par utilité (kill, menace, ligne, élément) avec hystérésis, sorts contextuels (soin/contrôle/burst), profils IA par difficulté (Facile sous-optimal → Enfer complet), sorts alliés de lignée actifs en mode Auto, garde-fous anti-blocage de l’errance. 171 tests, smoke 306 checks, digest final c62fcbd1… 1281/3000 et 5059e683… 4236/10000 (MESURES, aucune maths joueur touchée).'],
  ['v1.33 : Illustrations V3.1 en doublon commutable (bouton 🖼️)', 'Relance 3.1 complète (271 cartes, verrous R8/R9/R10 + anti-cadre renforcé) publiée en second manifeste `assets-v3.1.json`, switchable avec V3.0 via le bouton 🖼️ pour comparer les cartes. Les assets existant uniquement en 3.1 (7 cartes série 3 + 90 arts d’équipement) sont ajoutés au manifeste par défaut `assets-v3.json` : présents partout. 150 tests, smoke 299 checks, digest inchangé `f8a9f0bb…` 1359/3000.'],
  ['v1.32 : Chantier « contenu v3 » — marchand v2, gobelins régionaux, greffe des solos, familles compagnons, divines joueur', 'Marchand v2 : 3 offres du jour, prix actés, raretés débloquées en bouclant des donjons. Gobelins régionaux au Bosquet, à la Crypte et au Zénith. Les 31 anciennes cartes solos sont greffées à des familles. Sept voies de compagnons (Yuki, Onyx, Naïa, Aïna, Roc, Ember, Sylve) mènent chacune à une UR et une L. Familles divines jouables (Arbitres du Seuil, Chœur Miroir, Tisseuses du Pont), maillons du Jeune Séraphin et lignées des Enge (Sirène, Fée, Gorgonne Nouvelles). Digest re-mesuré sans recalibrage : f8a9f0bb… 1359/3000.'],
  ['v1.31 : Chantier « reste code » — correctifs, rangs, errance 5 zones, craft, page Personnage', 'Sauvegardes réparées (migration v27 : plus aucun sort en doublon après évolution). Rangs avant/arrière actifs : l’arrière encaisse -50 % tant que l’avant tient, Guerrier/Assassin en arrière frappent à moitié, soins jamais affectés. Plus de rôle attaque/support : formation 3+2 ou 2+3 choisie avant le combat. Vidéos FX : une seule à la fois, pause hors écran, image fixe si mouvement réduit. Errance sur les 5 zones avec le héros dédié (sprite sheet du cycle de marche). Craft en ville à l’atelier de la Boutique (matériaux de zone + matière du boss), et page Personnage à onglets : Équipe + Inventaire.'],
  ['v1.29 : Correctifs terrain — CSS mobile + fluidité de l’errance', 'Le bloc CSS des écrans récents n’est plus affiché en texte brut sur téléphone (remonté dans le <style> du head). Errance : pilotage inertiel avec virages en arc et freinage (plus d’orbite), caméra fluide indépendante du framerate avec look-ahead et zoom, décor pré-rendu en un seul drawImage par frame, rendu net en haute densité (DPR ≤ 2), drag avec mémo de cible et pointerup sur window pour iOS.'],
  ['v1.27 : Bloc visuel — hub-ville, Terres Sauvages, errance (Marées)', 'L’accueil devient un hub-ville (scène procédurale, héroïne cliquable, quêtes du jour) avec le bouton « LES TERRES SAUVAGES ». Nouvelle page de sélection des zones (départ : la zone de l’eau, déblocage en chaîne par le donjon de zone) et errance top-down dans la zone témoin Marées : carte canvas déterministe, déplacement au clic (A* + lissage), rencontres dans les hautes herbes, autel de soin, combats en chaîne. Migration v26.'],
  ['v1.26 : Correctif — le badge « nouvelle carte » quitte l’équipe', 'Une carte placée en équipe perd enfin son badge ✨ (il n’était vidé que dans la fiche). Le test IHM couvre désormais un parcours complet : départ, équipe, donjon, combat, récompenses, quêtes, boutique, guilde, inventaire, sauvegarde.'],

  ['v1.25 : Économie v2 clôturée', 'Boutique complète (potions, éclats, équipement), marchand de créatures, Guilde et compagnons du jour, jetons supprimés (convertis en or, migration v25), quêtes quotidiennes (migration v24). Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.24 : Économie v2 lot E3b — les jetons disparaissent', 'Les jetons de génération sont supprimés : les naissances passent par le départ, les quêtes, la Guilde (compagnons) et le marchand. Migration v25 : les jetons restants sont convertis en or. Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.23 : Économie v2 lot E4 — quêtes quotidiennes', 'Le défi du jour laisse place à 3 quêtes par jour (1 petite + 1 moyenne + 1 grande, rotation du jour) : or, parfois une naissance un jour sur trois, et 1 pierre d’éveil si les trois sont faites. Migration v24. Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.22 : Économie v2 lot E3a — la Guilde recrute des compagnons', 'La Forge devient la Guilde. Compagnons du jour : 3 offres en rotation quotidienne (seed du jour), rangs C à UR, 500 à 2 000 or, limite 3 exemplaires — le rang L ne se recrute jamais. Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.21 : Économie v2 lot E2 — marchand de créatures', 'Nouveau rayon 🐾 à la Boutique : monstres non nommés, raretés C à UR, 200 à 10 000 or (échelle en données), limite 3 exemplaires — pour la fusion et les enseignements. Les jetons disparaîtront au rework Forge → Guilde. Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.20 : Économie v2 lot E1 — Boutique complète', 'La Boutique couvre le catalogue fixe : potions, éclats bruts des 5 éléments (150 or, revendables 100 or) et rayon équipement (60 pièces, 200 à 1 600 or — armes typées, armures, slots d’équipe). Les pièces de set restent hors Boutique. Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.18 : Boucle v2 lot 6 — baseline finale, chantier clos', 'Nouvelle baseline digest au pack N = 10 000 : 3f9fe198… 4558/10000 (45,6 %), 0 exception, 1 marathon (pack 3000 inchangé : f72106ff… 1379/3000). 128 tests, smoke 210 checks. Rapport de clôture dans docs/historique/rapport-boucle-v2.md. Les 6 lots de la boucle v2 sont livrés.'],

  ['v1.17 : Boucle v2 lot 5 — progression', 'Courbe d’XP recalibrée sur l’échelle longue (XP_GROWTH en données). Palier d’évolution sans perte nette : la forme suivante au niv. 1 reste au moins aussi forte (ATQ/PV) que l’ancienne au niv. 10 — vérifié par simulation, appliqué au moteur. 31 cartes solos archivées (hors drops et naissances, toujours jouables). Rang N exclu des drops et du recrutement ; éveil N→C par la pierre d’éveil. Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.16 : Boucle v2 lot 4 — Récompenses, inventaire, équipement', 'Écran Récompenses après chaque combat (chaque gain cliquable, Tout ramasser). Matériaux de zone, pièce + matière garanties sur les boss, gemmes brutes vendables. Page Inventaire groupée. Équipement : 2 slots par carte + 2 slots d’équipe, bonus de set +5 pts %. Migration v22. Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.15 : Boucle v2 lot 3 — départ à 2 cartes, recrutement naturel', 'Au premier lancement, choisissez un novice parmi 4 (une par race) : un second, tiré au hasard, vous rejoint. Après chaque victoire, un vaincu (hors boss et nommés) peut rejoindre votre collection (~1 % par zone). Migration v22. Digest inchangé : f72106ff… 1379/3000.'],

  ['v1.14 : Boucle v2 lot 2 — niveaux de donjon 1→25', 'Chaque marche (donjon × mode) porte un niveau 1→25 et une bande de rareté affichés dans le sélecteur : Facile C→R, Normal UC→SR, Difficile R→UR, Très difficile SR→L, Enfer UR→M. Le bestiaire de chaque vague est pioché dans la bande de la marche. Digest : f72106ff… 1379/3000.'],

  ['v1.13 : Boucle v2 lot 1 — potions, or et persistance', 'L’économie de survie entre en jeu. L’énergie ⚡ devient de l’or (1 ⚡ = 1 or, conversion en sauvegarde v21). Nouvelle action 🧪 Objet dans la fenêtre d’action : potions de soin (30/60 % PV) et de mana (40/80 %), chaque gorgée coûte le tour, utilisables aussi entre les étages (bouton 🧪 Objets). Achat au rayon potions de la Boutique. Plus de régénération entre les combats d’un run : PV et mana persistent d’étage en étage, régénération complète après le premier boss, soins complets entre deux runs. Hook autel de soin posé pour l’errance. Digest inchangé (combats isolés) : aed250f9… 1274/3000.'],

  ['v1.12 : La ligne support frappe aussi', 'RETOUR TERRAIN. Deux manques corrig\u00e9s d\u2019un m\u00eame geste. Un : le Garde du Rempart et tous les supports n\u2019avaient que le bouton de soin \u2014 d\u00e9sormais la frappe simple (\u2694, gratuite) est la premi\u00e8re action de TOUTE carte : on d\u00e9signe l\u2019ennemi, elle frappe. Deux : un sort de d\u00e9g\u00e2ts, de contr\u00f4le ou de malus lanc\u00e9 depuis la ligne support se r\u00e9sout enfin sur les ennemis selon sa fiche (largeur, puissance, taux, tours) \u2014 fini le soin fant\u00e2me quand un Embryon tapait avec Instinct Sauvage. La stat principale du lanceur fait les d\u00e9g\u00e2ts, l\u2019esquive et l\u2019\u00e9l\u00e9ment comptent comme pour la ligne d\u2019attaque, et les sorts alli\u00e9s gardent leur chemin. Les sorts malus ciblent d\u00e9sormais les ennemis dans les fiches r\u00e9solues. Le digest bouge (document\u00e9) : les supports mixtes frappent.'],
  ['v1.11 : Fin des sorts undefined', 'RETOUR TERRAIN. Les sorts h\u00e9rit\u00e9s d\u2019une carte \u00e9volu\u00e9e \u00e9taient stock\u00e9s en sauvegarde sous leur forme remapp\u00e9e par le tri (\u00e9cole + cran), sans nom ni co\u00fbt : la fen\u00eatre d\u2019action et la fiche affichaient des lignes \u00ab \u2726 undefined \u00bb, et le sort ne se lan\u00e7ait pas. D\u00e9sormais chaque entr\u00e9e se r\u00e9sout en fiche compl\u00e8te depuis le grimoire : nom, co\u00fbt, puissance, taux, cible et description. Les uniques remapp\u00e9s se r\u00e9solvent aussi ; les crans vides et les sorts inconnus disparaissent proprement de la liste. Les sauvegardes ne changent pas : la r\u00e9solution se fait \u00e0 l\u2019usage, sans perte.'],
  ['v1.10 : Le tri des recrues', 'LES NAISSANCES ET LES SOLOS RENDENT LEUR GESTE AU GRIMOIRE. Les 33 signatures du lot (les 12 naissances raciales, les 5 solos d\u2019entr\u00e9e, les 16 cartes des quais, de la f\u00eate, des routes, des dunes, des berges et du guet) fondent en crans I-II des \u00e9coles existantes : la prise de garde prot\u00e8ge (le Rempart), le bruissement d\u2019\u00e9ume frappe (la Lame), le froid du caveau fige (l\u2019Entrave), la lanterne du guet \u00e9claire (la Ferveur). Les trois portes divines (l\u2019Ange, le D\u00e9mon, l\u2019\u00c9veill\u00e9 du Seuil) gardent leur geste : les familles divines le dessineront. Les sauvegardes passent en v17 : les sorts h\u00e9rit\u00e9s d\u2019une recrue se re-mapent sur leurs crans. Le combat ne change pas : le digest reste le m\u00eame.'],
  ['v1.9 : Le tri du Z\u00e9nith', 'LE Z\u00c9NITH ARDENT FOND SES 30 SIGNATURES EN 22 CRANS D\u2019\u00c9COLE ET 8 UNIQUES. Le renvoi des ph\u00e9nix devient une ligne du Rempart (25/20 % \u00d7 2 tours, les ailes couvrent 1 puis 2 alli\u00e9s), l\u2019Hymne porte la Ferveur \u00e0 l\u2019\u00e9quipe enti\u00e8re (boost 20 %, tenue 15 %), et les cartes nomm\u00e9es gardent leur geste : Sentence Solaire, Couronnement (l\u2019Astre Capiteux), \u00c9clipse Montante, Renaissance Pyrique, Immolation Retourn\u00e9e, Cantique Final, Peine Capitale, Proph\u00e9tie du Plein Jour. Les sauvegardes passent en v16 : le Z\u00e9nith tri\u00e9 re-mappe ses sorts connus. Le combat ne change pas : le digest reste le m\u00eame.'],
  ['v1.8 : Le tri de la Crypte', 'LA CRYPTE OUBLIÉE FOND SES 30 SIGNATURES EN 22 CRANS D\u2019ÉCOLE ET 8 UNIQUES. Le hurlement des banshees devient un sort de l\u2019Entrée (la zone au cran III), la morsure putride ouvre le poison du Mauvais Œil, la légion des caveaux rejoint l\u2019Appel (3 renforts) et la Ferveur se remplit (deuil martial, étendard funèbre, serment rallié). Les cartes nommées gardent leur geste : Voie du Tombeau, Abîme Remontant, Hurlement Fatal, Fauchade Universelle (la Mort), Deuil Éternel, Harpon du Naufrage, Épée de l\u2019Aube, Lame du Serment. Les sauvegardes passent en v15 : la Crypte triée re-mappe ses sorts connus. Le combat ne change pas : le digest reste le même.'],
  ['v1.7 : Le tri du Bosquet', 'LE BOSQUET PROFOND FOND SES 21 SIGNATURES EN 16 CRANS D\u2019ÉCOLE ET 5 UNIQUES. La sève rongeuse devient un sort du Mauvais Œil (25/20 % \u00d7 2 tours), les soins des dryades greffent l\u2019entrée Onde Consacrée, la Sève Éveillée rejoint l\u2019Appel (2 renforts sylvestres), et les cartes nommées gardent leur geste : Aube Foliaire, Racine-Monde, Nuée de Spores, Première Clarté, Nuit des Sèves. Les sauvegardes passent en v14 : le Bosquet trié re-mappe ses sorts connus. Le combat ne change pas : le digest reste le même.'],
  ['v1.6 : Le tri de la Forge', 'LE GABARIT DES MARÉES S’ÉTEND À LA FORGE CENDRÉE. Les 24 signatures du biome fondent en 19 crans d’école et 5 uniques : la brûlure devient Colonne de Feu (le Mauvais Œil, taux normalisés 25/20/15 %), les invocations deviennent Fournaise Invoquée (l’Appel, la largeur compte les renforts), et les cartes nommées gardent leur geste sur une base d’école : Nuit de Cendres, Fournaise Éternelle, Linceul de Suie, Fournaise de Calcine, Colère de Vulcain. Les sauvegardes passent en v13 : les sorts connus d’un biome trié se re-mappent sur leurs crans. Le combat ne change pas : le digest reste le même.'],
  ['v1.5 : Le rôle sort de l’affichage', 'LE RÔLE ATTAQUE/SUPPORT DISPARAÎT DE LA FICHE ET DES LIBELLÉS. La grille identité de la fiche garde Classe, Élément et Rareté ; le bloc des sorts croisés parle de gestes (panser, frapper), plus de camps. Le champ moteur reste purement interne : il trie les lignes d’équipe, il ne décrit plus la carte. Aucune mécanique ne change, le combat reste exactement le même (digest inchangé).'],
  ['v1.4 : Le boost vise son camp', 'LE BUG DE CIBLAGE DU SORT DE BOOST EST CORRIGÉ. La fenêtre d’action ne décide plus du camp selon le rôle de la carte : elle lit la fiche du sort. Discipline de Ligne (soi) se pose sur son lanceur, sans liste de cibles ; Ferveur Céleste (1 allié) propose vos cartes ; et le moteur applique un vrai bonus d’ATQ pour la prochaine frappe au lieu de frapper l’ennemi. En mode Auto, le chemin historique ne bouge pas : le combat automatique reste exactement le même (indice de force et digest inchangés).'],
  ['v1.3 : Les naissances dans la nature', 'TOUT CE QUI ENTRE AU ROYAUME DES NAISSANCES. (1) DEUX NAISSANCES OFFERTES au d\u00e9part : l\u2019\u00c9p\u00e9iste Novice et le Pr\u00eatre Novice rejoignent la collection, jouables imm\u00e9diatement. (2) NAISSANCES SAUVAGES : chaque \u00e9tage de donjon vaincu offre 2 % de chance qu\u2019une naissance se joigne \u00e0 vous, toujours born\u00e9e par vos d\u00e9blocages. (3) LA TABLE DES JETONS PASSE EN DONN\u00c9ES ET DEVIENT CONFORME \u00e0 la d\u00e9cision 8 : \u00e0 chaque palier de donjons boucl\u00e9s, la commune reste au taux de r\u00e9f\u00e9rence (50 %) et le taux d\u00e9cro\u00ee avec la raret\u00e9 (palier 3 : 50/45/5, palier 5 : 50/40/10) \u2014 les paliers pr\u00e9c\u00e9dents favorisaient la peu commune, corrig\u00e9. Le moteur gagne les tirages purs : une naissance, une raret\u00e9 de jeton.'],
  ['v1.2 : La pierre d’éveil', 'L’ÉVEIL TROUVE SA MONNAIE. Une naissance (rang N) ne paie plus ses éclats pour s’ouvrir : son éveil consomme une PIERRE D’ÉVEIL, hors éléments. Les boss des donjons en lâchent rarement, le défi du jour en offre une chaque victoire, et la Forge affiche la réserve. Les autres rangs gardent leurs éclats ; la voie choisie, l’Ascendance et les sorts accumulés ne changent pas.'],
  ['v1.1 : Le rang Naissance', 'LES NAISSANCES QUITTENT LA COMMUNE. Les 12 naissances raciales (les 4 Novices, les 5 Embryons \u2014 ex-Bestiaux \u2014 et les 3 Enge) passent au rang N, un cran sous la commune : elles n\u2019ont encore rien choisi, on les am\u00e8ne o\u00f9 l\u2019on veut. Le jeton et le d\u00e9fi du jour tirent d\u00e9sormais des naissances, jamais d\u2019autres communes ; les cartes divines (Ange, D\u00e9mon, \u00c9veill\u00e9 du Seuil) restent la porte du camp divin jusqu\u2019\u00e0 l\u2019Esprit Divin. La puissance du rang N est calibr\u00e9e 10 % sous la commune, et le glossaire s\u2019ouvre sur le nouveau rang.'],
  ['v0.47.2 : Source d’images au choix', 'Un bouton 🖼️ dans l’en-tête bascule les illustrations des cartes entre DreamShaper XL (assets.json, par défaut) et WAI-Illustrious v17 (assets-wai.json, campagne comparative), mémorisé entre les visites. Aucun impact sur le moteur.'],
  ['v1.0 : La refonte majeure', 'LE MONOLITHE DEVIENT MODULAIRE. Les donnees vivent desormais dans data/ (cartes, monstres, ecoles, grimoire a crans, arbres de race, zones), le moteur dans src/engine/ en modules purs, et dist.html est regenere par build.mjs. LES ARBRES DE RACE (v17) : crans +10/+20/+30 % en donnees, l\u2019Ange Eveille remplace l\u2019Ange Gardien, communes deleguees (Pousse des Seves, Fidele du Jour). LES SORTS (v2.3) : 8 ecoles, grimoire a crans I-IV, fusion des Marees (30 signatures -> 7 uniques + 23 fondues), fin du verrou de classe. LE MODE RPG : agilite et intelligence, mult sur la stat principale, la zone de 3, l\u2019ordre du tour sur l\u2019agilite, les taux contre les seuils. LES ZONES D\u2019ERRANCE : cadence zone/donjon, recoltes, apprentissage des crans. Sauvegardes migrees de v8 a v12 sans perte.'],
  ['v0.47 : Tranche-Monde et Nuit Éternelle', 'LES SORTS SIGNATURE NE RÉPÈTENT PLUS LE NOM DE LEUR CARTE. Le sort L du Sabre (« Kenji : Sabre Céleste ») devient Tranche-Monde ; le sort L de l’Ombre (« Kira : Nuit Sans Fin ») devient Nuit Éternelle. « Kenji : Zénith Tranchant » reste ; l’Aube garde son exception assumée : Aube Éternelle, le plus fort sort de l’aube porte le nom de sa carte (Léna).'],
  ['v0.46 : Le RPG tour par tour', 'LE CHANTIER PROMIS. Le mode 🧭 Tactique devient un vrai tour de RPG : plus de panneau à remplir en bas de page. Chaque tour, les cartes des deux camps agissent une par une, de la plus forte attaque à la moins forte (la vôtre d’abord à égalité). Quand vient le tour d’une de vos cartes, une fenêtre s’ouvre pour elle : illustration, points de vie, attaque, mana — puis ses choix : ⚔ Attaque, sorts ✦ avec leur coût (atténués si le mana manque), ➕ Souffle Croisé pour les attaquants, ⏸ Attendre pour économiser le mana. Désignez ensuite la cible : ennemie à frapper ou allié à soigner, dans une liste cliquable — et le pion correspondant s’illumine sur le plateau. L’action s’exécute aussitôt, animée, puis la carte suivante joue, et les ennemis agissent de la même façon sous vos yeux. Le ciblage des ennemis, demandé au retour du terrain, est enfin explicite.'],
  ['v0.45 : Rien de caché, des pions à voir', 'SIX RETOURS DU TERRAIN CORRIGÉS. (1) Le code brut à la place de l’emoji disparaît : le bouton 🤖 « Auto ce tour », l’en-tête du panneau Tactique et les récompenses affichent enfin leurs pictogrammes. (2) Le menu ☰ reste joignable EN COMBAT : la navigation s’ouvre par-dessus l’écran, opaque et déroulante. (3) Le panneau Tactique n’est plus jamais coupé : il défile à l’intérieur de sa zone. (4) Les pions de combat grandissent (128 px, boss 162 px) et deviennent plus carrés : l’illustration occupe presque toute la carte, nom et stats en surimpression. (5) L’écran de combat ne coupe PLUS rien : si l’écran est trop petit, le contenu défile à l’intérieur de l’écran. (6) Les sorts spéciaux n’assombrissent plus le plateau : une bande compacte (illustration du lanceur + nom du sort) passe au-dessus sans rien masquer.'],
  ['v0.44 : Le combat plein écran', 'DEUX DEMANDES DE TERRAIN APPLIQUÉES. (1) Le combat tient sur UN SEUL ÉCRAN : en exploration la page ne scrolle plus, ni en bas ni sur les côtés — titre, boutons, plateau, panneau Tactique et journal se partagent la hauteur de l’écran, et les rappels restent compacts. (2) Les cartes s’agrandissent partout où l’image a sa place : collection, familles, équipe et fiche — les futures illustrations s’y liront ; en combat, chaque carte reste un pion lisible et l’image se loge en fond de carte.'],
  ['v0.43.1 : Correctifs terrain', 'QUATRE RETOURS DU TERRAIN APPLIQUÉS. (1) Le plateau applique une TAILLE UNIFORME : chaque carte garde la même largeur dans les deux camps, quel que soit le nombre de voisines — seul le boss garde sa prestance. (2) Le modificateur de run redevient réellement OPTIONNEL : l’accepter est gratuit (butin majoré), entrer sans lui aussi — seul le REMPLACEMENT du tirage coûte 1 éclat brut. Plus aucune obligation d’éclat pour refuser. (3) La collection montre la PORTE de chaque famille : le novice (ou la greffe) qui y entre figure en tête de chaîne. (4) Les anciennes branches SR (Yuki, Onyx, Naïa…) sont ARCHIVÉES : hors des tirages et des arbres, visibles seulement dans la section archives si vous en possédez.'],
  ['v0.43 : La grammaire des sorts, le plateau en ligne et l’indice de force', 'PLUS DE FAUX JUMEAUX, PLUS DE NIVEAUX VIDES. Chaque carte connaît désormais ses sorts par couches : le COMMUN (2✦), le sort DE RACE (3✦), le sort DE CLASSE (4✦) et sa SIGNATURE (5✦). L’Épéiste Novice et le Bestiau des Cieux ne partagent plus que le commun, et le Prêtre Novice a enfin son grimoire complet : des soins gradués, du pansement à la bénédiction. Le panneau Tactique détaille nom, coût et infobulle de chaque sort — y compris pour les soigneurs — et le Souffle Croisé est étiqueté pour ce qu’il est : une action d’équipe, pas un sort. Le plateau passe à une seule ligne par camp : fini la ligne support repoussée à l’arrière. Et la force conseillée des donjons devient un INDICE pondéré (ATQ, PV, rareté, nombre de sorts), auto-calibré sur le boss final réel — un niveau moyen ne veut rien dire : une équipe de SR niveau 5 n’est pas une équipe de communes niveau 5.'],
  ['v0.42 : Les modificateurs de run', 'CHAQUE EXPLORATION A SON TARIF. En entrant dans un donjon, un modificateur est tiré et montré AVANT le combat : 🐗 la Horde (+1 ennemi par vague, butin +20 %), 🕯 le Mana Stérile (régénération −1 pendant le combat, points +25 %), 🛡 la Muraille (ennemis +25 % PV, éclats +50 %), ⚔ la Rage Partagée (ennemis +15 % ATQ, points +40 %). La face rude paie la face compense : les points, les chances d’éclats d’évolution et de régression suivent le modificateur accepté. Le refuser coûte 1 éclat brut et le run se joue sans modificateur ; sans brut, on entre avec le tirage. Le moteur de vague reçoit le modificateur en paramètre OPTIONNEL — sans modificateur, le digest de 3000 combats reste IDENTIQUE (dormance prouvée).'],
  ['v0.41 : Les nouvelles lignées (patch 3.3)', 'LE RACCORDEMENT COMPLET, ZÉRO NOUVELLE CARTE. (1) Le Bestiau des Cieux (n9) ouvre ses trois voies vers le Zénith : la Légion Solaire (Arbalétrier Doré), les Phénix Célestes (Essor de Flammes), le Clergé du Plein Jour (Chapelain du Jour) — des chaînes qui montent jusqu’à SR/UR. (2) Les naissances divines entrent dans les lignées du Seuil : l’Ange (n13) rejoint les Arbitres, le Démon (n14) le Chœur Miroir, l’Éveillé du Seuil (n15) les Tisseuses du Pont ; les maillons de soudure (d3→d4, d9→d10, d15→d16) relient les lignes secondaires du web divin : les trois chaînes courent du C au L (Kairos, Écho, Ananké). (3) La voie de la suie poursuit : f3 évolue vers sa rare (f8). (4) AUDIT DES VIEILLES CARTES FERMÉ : les 5 solos d’origine deviennent des naissances raccourcies vers les chaînes humaines (Garde-Promesse → la garde, Étincelle Vive → la braise, Médecin de Camp → l’aube, Veilleur d’Acier → l’ombre, Pilier Mécanique → le bouclier) ; les jetons continuent de ne donner que les naissances raciales ; il ne reste hors architecture QUE les 7 branches SR (b1-b7), dormantes par design pour les futurs choix de palier.'],
  ['v0.40 : Le Mode Tactique', 'LE JOUEUR PREND LES COMMANDES : à chaque tour, en mode Tactique, chaque carte de la ligne choisit son action — attaque simple, un de ses sorts (soins et invocations sont des sorts comme les autres), le soin croisé des attaquants, ou attendre pour économiser le mana — et sa cible (ennemi pour frapper, allié pour soigner). « Lancer le tour » résout, « Auto ce tour » laisse l\u2019IA jouer un tour. Le moteur ne change PAS : le plan remplace l\u2019IA au point d\u2019injection, le chemin auto reste au digest identique. ET les récompenses suivent le prorata des tours tactiques : tout en Tactique = intégrales, tout en auto = ÷ 2 (pts, éclats, XP).'],
  ['v0.39 : Les jalons dans l\u2019architecture', 'CORRECTIF (retour terrain v0.38) : les jalons (premier donjon termin\u00e9, premi\u00e8re Difficile) proposaient une carte Rare / Super Rare AU CHOIX parmi\u2026 les vieilles cartes de familles (c.family), hors architecture. D\u00e9sormais les 3 propositions sont toujours des MAILLONS DES VOIES humaines (Paladin, Chevalier, Bretteur, Sorci\u00e8re des Rivi\u00e8res\u2026), sur les arbres d\u00e9finis. Avec la v0.38, il ne reste plus AUCUN chemin qui donne une carte hors architecture : jetons, d\u00e9fi du jour et jalons ne distribuent que des naissances raciales, des maillons de voie ou des naissances locales de biome.'],
  ['v0.38 : Les naissances raciales', 'CORRECTIF (retour terrain) : les jetons de génération donnaient les vieilles cartes de familles (Étincelle Vive, Rôdeur des Ombres, Servante de l’Ombre…) au lieu des naissances de la nouvelle architecture. Désormais un jeton ne donne QUE la naissance, au hasard — les 4 Novices, les 5 Bestiau, les 3 Enge, Ange / Démon / Éveillé du Seuil ; le jeton humain raffiné entre au maillon d’une voie (UC, 15 % R) ; le jeton d’évolution, au palier indiqué d’une voie raciale ; le défi du jour tire lui aussi une naissance raciale. Les vieilles cartes restent au catalogue (autel, futurs raccourcis). Et l’élément NEUTRE s’affiche enfin : ⚪ sur la carte, « ⚪ Neutre — hors oppositions » sur la fiche, au glossaire et à la collection — les naissances raciales naissent neutres, l’élément arrive avec la voie.'],
  ['v0.37 : Le correctif des invocations, les voies des races', 'CORRECTIF (retour terrain, boss final de la Forge) : les invocations (Golem de Fournaise du Seigneur des Cendres, Familier des Foyers...) faisaient PLANTER le combat — l\u2019animation cherchait leur carte au catalogue et l\u2019exception gelait la partie sans fin (combat bloqué, défaite sans explication). Elles s\u2019affichent désormais : nom du sbire, arrivée visible 🕯, fiche au clic, et le combat se termine toujours. Patch 3.2 : les communes raciales ouvrent leurs VOIES vers les nœuds existants des webs — Bestiau des Eaux (pillage des récifs, berges), des Flammes (suie, fournaise, goblin), du Vivant (mousse, sèves), des Ténèbres (gouffre, deuil marin, devoir brisé), Enge des Brumes (la forme Sirène), des Bois (la forme Dryade), des Caveaux (les trois formes de la mort) ; le Bestiau des Cieux et les naissances divines (Ange, Démon, Éveillé) attendent leurs nœuds du patch 3.3 — trappes visibles, pas de trous cachés.'],
  ['v0.36 : Les choix de voie', 'Le premier choix du joueur arrive : à la première évolution, chaque Novice ouvre ses VOIES — l\u2019épéiste (guerrier, protection, sylvestre), le mage (Eau, Feu, Sylvains, ou la lumière : l\u2019élue rejoint la lignée du prêtre), le prêtre (la foi ou la garde), le voleur (assassinat, quais, fête) ; la Forge et la fiche affichent un bouton par voie et le choix est définitif pour l\u2019exemplaire. Éclats GARANTIS en donjon (retour terrain) : 1 éclat brut par boss d\u2019étage, 2 au boss final, plus la gemme de difficulté ; la fausse ligne « carte bonus du donjon » disparaît. Premier donjon recalibré : bonus de découverte renforcé (−30 % étages 1-5, −20 % 6-9, −55 % au boss final) et XP de run doublée jusqu\u2019au premier bouclage — l\u2019équipe de départ boucle l\u2019Antre des Marées en ~3 runs (simulation : médiane 3, max 5). La collection est réorganisée par RACE (humaine et ses arbres, monstre et ses webs, mystique et ses familles d\u2019accueil, divine) ; les textes obsolètes (éclats, v0.34) sont retirés. La fiche fusionne le Pouvoir dans la liste des sorts et chaque sort affiche ses dégâts concrets au niveau courant.'],
  ['v0.35 : La grande réparation', 'Les donjons ne droppent plus de cartes : le boss final lâche un JETON de génération, 1 par jour et par donjon (rareté selon les donjons bouclés), la première victoire finale d\u2019un donjon offre un jeton bonus de son biome, et les jalons distribuent des jetons (humain raffiné, race, évolution). Les cartes naissent à la Forge. Jetons typés avec inventaire groupé : humain, humain raffiné (PC garantie, 15 % Rare), race, monstre, mystique, divine, évolution, biome. Captures et jauge de boss supprimées ; les monstres ne se capturent plus. La mécanique support/attaque disparaît des interfaces : les cartes font tout. Le mode manuel devient un vrai tour par tour (défaite seulement au tour 60). Courbes de donjons corrigées : la puissance grimpe de façon strictement croissante, boss compris (plus de salle plus dure que la suivante), niveaux conseillés abaissés (étage 10 du premier donjon : équipe de niveau ~17, salle 4 visée dès 10-12). L\u2019Éclat de régression ne tombe plus qu\u2019à partir de Difficile (1,2 %), puis Cauchemar (2,5 %) et Enfer (5 %). Départ à 5 jetons (2 humains, 1 humain raffiné, 2 races). 15 communes raciales : les 4 Novices (qui évoluent vers leur discipline), les 5 Bestiau, les 3 Enge, Ange, Démon et Éveillé du Seuil — le premier choix n\u2019est pas au joueur, il est dans la carte. Cartes et textes agrandis sur téléphone, emplacements d\u2019équipe sur deux lignes. Glossaire, donjons et onboarding mis à jour.'],
  ['v0.34 : Le rework des races', 'La race devient une donnée de fiche : Humaine (la référence), Monstre (+10 % de stats de base), Mystique (+20 %), Divine (+30 %) — la régression comble l’écart en entrant dans la race plus forte. L’élément Divin disparaît : les 18 cartes du Seuil prennent un vrai élément (Arbitres Lumière, Chœur Miroir Eau, Tisseuses du Pont Terre), l’Astre Capiteux devient divine, et le bonus des divines passe sur la race. Le défi du jour débloque une commune de n’importe quelle race (50 % humaine, 30 % monstre, 15 % mystique, 5 % divine) plus un éclat brut de son élément. Départ : 3 jetons de génération (l’humain garanti, les 4 races au tirage, une race non humaine au tirage — tous communs). L’Éclat de régression apparaît : il tombe dans tous les donjons (taux selon la difficulté) et ouvrira la régression — nouvelle carte au palier R, 100 % des sorts, 10 % des stats. Le modèle d’évolutions typées (standard, partage, convergence, régression, chute, malédiction, événement, secrète) et le verrou en fiche sont posés. Migration des sauvegardes : les gemmes de l’élément Divin deviennent des gemmes de Lumière.'],
  ['v0.33.2 : Deuxième retour terrain', 'Jetons : aléa propre à la page (plus de doublon identique après rechargement) et révélation face cachée retournée d\u2019un appui (jeton, autel, évolution, halo selon la rareté). Départ à 5 jetons pour une première équipe complète. Bonus de découverte : les premiers étages du premier donjon sont affaiblis en Facile tant que l\u2019étage 3 n\u2019a jamais été vaincu. Après une défaite, relance immédiate de l\u2019exploration. Le combat se lance tout seul dès l\u2019entrée du donjon (sauf en mode manuel). Vitesse ×32 réellement instantanée (plateau seul), ×16 garde un léger rythme. Fiche : un sort de soin indique son soin (plus de « puissance ×1,5 » trompeur), un attaquant indique sa frappe en % d\u2019ATQ, le Pouvoir est daté et expliqué, et l\u2019appui court sur une carte déjà en équipe ouvre sa fiche.'],
  ['v0.33.1 : Retours terrain', 'Fiche lisible : stats r\u00e9elles par niveau affich\u00e9es, pouvoir document\u00e9 sur chaque carte, effets actifs (avec source) au clic en combat, \u00e9tage verrouill\u00e9, vitesses \u00d716/\u00d732 r\u00e9elles (animations coup\u00e9es), cartes plus grandes. Acquisition sans boutique : les boosters disparaissent \u2014 donjons (jauge de boss, captures), jetons, autel, jalons, d\u00e9fi divin. Plus de nourrir ni de sacrifice : les niveaux viennent de l\u2019XP de donjon, les doublons passent par l\u2019autel. \u00c9clats bruts aussi aux \u00e9tages interm\u00e9diaires.'],
  ['v0.33 : Méta de l’Ascension', 'Niveaux 1-20 par exemplaire individuel (niveau, Ascendance et nom propres), évolution dès le niveau 10 avec des éclats (jamais d’or), sorts cumulés à l’évolution, Ascendance +0,5 % par niveau d’attente, autel 5-pour-1, jetons de fin de donjon, boosters reworkés sans Légendaire au prix progressif quotidien ×1,5, XP de run avec fatigue quotidienne par carte.'],
  ['v0.32 : retours de terrain', 'La sauvegarde survit aux pages intégrées (stockage de secours en mémoire) et s\u2019exporte en code depuis l\u2019accueil. Le bouclier passif des Guerriers cesse de se doubler ; les vagues d\u2019un étage sont fixes pour la journée ; le booster du défi passe à des slots déterministes (Légendaire : 5 % par booster) ; les monstres et cartes divines évoluent à la Forge le long de leur ligne de famille ; vitesses ×0,5 à ×32, lots ×20/×50, récapitulatif de fin de donjon, filtre par rareté, statuts visibles en combat et fiches détaillées.'],
  ['v0.31 : défi du jour et familles divines', 'Chaque jour, un défi divin : cinq cartes hors opposition tirées des trois familles divines — Arbitres du Seuil (contrôle du temps), Chœur Miroir (copie et renvoi de sorts), Tisseuses du Pont (liens chaînés). La victoire offre un booster du défi, seule source de ces cartes. Une par famille en équipe, trois maximum, +10 % dégâts et soins dès deux.'],
  ['v0.30 : tous les donjons en familles', 'Le Bosquet, la Crypte et le Zénith se rangent en familles : Bêtes du Fougeron, Gens des Sèves, Spectres des Caveaux, Naufragés, Chevalerie Défunte, Légion Solaire, Phénix Célestes, Clergé du Plein Jour. 45 nouvelles cartes, dont les Mythiques La Mort et Apolline ; le Phénix renaît de ses cendres.'],
  ['v0.29 : Forge en familles, glossaire', 'La Forge Cendrée se range en 3 familles (Cendrels, Enfants de la Braise, Gobelin des Fumées) et cette page naît pour documenter tout le jeu. Les monstres croisés en donjon comptent désormais comme découverts.'],
  ['v0.28 : six classes', 'Occultiste 🔮 et Invocateur 🕯️ rejoignent les 4 classes d’origine : malédictions (−ATQ temporaire, les boss résistent) et invocations de sbires temporaires. Une grande partie des monstres des Marées change de classe.'],
  ['v0.27 : illustrations', 'Un chargeur d’assets habille les cartes au premier lancement, le jeu reste léger à charger.'],
  ['v0.26 : familles et contrôle encadré', 'Les Marées s’affichent en grandes familles à la collection. Le contrôle passe sous embargo : un sort de contrôle (étourdissement, poison, malédiction…) ne s’applique que si son sort est lancé, côté joueur comme côté ennemis.'],
  ['v0.25 : statuts et effets', 'Le moteur apprend 10 effets : poison, renvoi, invocations, ranimation, liens, cri de guerre…'],
  ['v0.24 : équipes libres', 'Les postes attaque/support fixes deviennent 5 emplacements libres, et les niveaux se gagnent par carte (plus par exemplaire), conservés à l’évolution.'],
];

const GONE_DOC = [
  ['Boosters et boutique (v0.31 \u00e0 v0.33)', 'La boutique a disparu : les cartes se gagnent en donjon (jauge de boss, captures), par jetons, \u00e0 l\u2019autel et par les jalons ; le d\u00e9fi divin tire ses 5 cartes sur-le-champ.'],
  ['Nourrir et sacrifier (v0.24 \u00e0 v0.33)', 'Les doublons ne nourrissent plus : les niveaux viennent uniquement de l\u2019XP de donjon ; les doublons s\u2019\u00e9changent \u00e0 l\u2019autel (5 pour 1).'],
  ['Niveau unique (v0.24 à v0.32)', 'Une carte n’avait qu’un seul niveau partagé par tous ses exemplaires ; depuis v0.33, chaque exemplaire vit ses propres niveaux, son nom, son Ascendance et ses sorts hérités.'],
  ['Postes fixes', 'Avant, l’équipe avait des emplacements attaque et support dédiés ; désormais 5 emplacements libres, la carte joue son rôle où qu’elle soit.'],
  ['Seuil du soin croisé', 'Le Souffle Croisé se déclenchait sous 35 % des PV de l’allié ; le seuil est passé à 20 %.'],
];

function effectDesc(c) {
  const e = c.effect;
  if (!e) return '';
  switch (e.kind) {
    case 'heal': return `Soigne l’allié le plus blessé (${e.value} PV de base, multipliés par le sort lancé).`;
    case 'shield': return `Bouclier de ${e.value} PV sur vos attaquants (plafonné à 35 % des PV max).`;
    case 'atkBuff': return `+${Math.round(e.value * 100)} % d’ATQ à vos attaquants pour le tour.`;
    case 'stun': return `Contrôle : étourdit ${e.count ?? 1} ennemi${(e.count ?? 1) > 1 ? 's' : ''} parmi les plus dangereux.`;
    case 'slow': return 'Contrôle : ralentit toute l’équipe adverse, qui subit des frappes doubles.';
    case 'dot': return `Contrôle : brûle toute l’équipe adverse (${Math.round((e.pct ?? 0.4) * 100)} % de l’ATQ du lanceur par tour).`;
    case 'reflect': return `Contrôle : toute l’équipe renvoie ${Math.round((e.value ?? 0.25) * 100)} % des dégâts subis.`;
    case 'warcry': return 'Contrôle : cri de guerre, vos attaquants gagnent de l’ATQ et encaissent mieux un tour.';
    case 'summon': return `Invocation : ${e.summonName} (${Math.round(e.value * 100)} % de l’ATQ, ${Math.round(e.hpPct * 100)} % des PV, ${e.ttl} tours).`;
    case 'revive': return `Contrôle : ranime l’allié tombé le plus solide avec ${Math.round((e.value ?? 0.5) * 100)} % de ses PV.`;
    case 'link': return 'Contrôle : lie deux attaquants, soins et bonus partagés à moitié.';
    case 'copy': return 'Contrôle : un slot de sort libre capture le dernier sort adverse joué, puis le rejoue gratuitement.';
    case 'curse': return `Malédiction : −${Math.round(e.value * 100)} % d’ATQ à toute l’équipe adverse pendant ${e.turns ?? 2} tours (les boss résistent : effet réduit de moitié).`;
    default: return '';
  }
}

function spellCard(c) {
  const lvl = levelOf(c.id);
  const spells = (c.spells ?? []).map((s) => `
    <div class="glo-spell"><b>${s.name}</b> <span class="muted">✦${s.cost} · ×${s.mult}</span>${s.desc ? `<div class="muted">${s.desc}</div>` : ''}</div>`).join('');
  const fx = effectDesc(c) ? `<div class="glo-fx">${effectDesc(c)}</div>` : '';
  const burn = c.soloDot ? `<div class="glo-fx">Son sort laisse une brûlure : ${Math.round(c.soloDot.pct * 100)} % des dégâts pendant ${c.soloDot.turns} tours.</div>` : '';
  const gimmick = c.gimmickDesc ? `<div class="glo-fx">🎁 ${c.gimmickName} : ${c.gimmickDesc}</div>` : '';
  return `<div class="glo-entry">
    <div class="glo-head"><b>${c.name}</b> <span class="chip rar r-${c.rarity}">${c.rarity}</span> <span class="chip">${GLYPH[c.classe] ?? '❔'} ${c.classe}</span>${c.element ? ` <span class="chip">${EL_GLYPH[c.element] ?? ''} ${c.element}</span>` : ' <span class="chip">⚪ Neutre</span>'}${lvl > 1 ? ` <span class="muted">Nv ${lvl}</span>` : ''}</div>
    ${spells}${fx}${burn}${gimmick}
  </div>`;
}

function groupSection(title, cards, intro = '') {
  const known = cards.filter((c) => isKnown(c.id));
  if (!known.length) {
    return `<h3>${title} <span class="muted">0/${cards.length} découvertes</span></h3>
    <p class="muted">${intro || 'Rien encore : croisez ces cartes en donjon ou obtenez-les pour les documenter ici.'}</p>`;
  }
  return `<h3>${title} <span class="muted">${known.length}/${cards.length} documentées</span></h3>
    ${intro ? `<p class="muted">${intro}</p>` : ''}
    <div class="glo-grid">${known.map(spellCard).join('')}</div>
    ${known.length < cards.length ? `<p class="muted">Et ${cards.length - known.length} encore inconnue${cards.length - known.length > 1 ? 's' : ''}… à découvrir en jeu.</p>` : ''}`;
}

function renderGlossaire(root) {
  const companions = Object.entries(FAMILIES).flatMap(([key, fam]) => {
    const steps = fam.steps.map(byId);
    return groupSection(`${fam.name}`, [...steps], 'Les sorts se débloquent palier après palier : chaque maillon ne connaît que les sorts de son rang et des rangs précédents.');
  });
  const solos = CATALOG.filter((c) => !c.family && !c.dungeon && !c.raciale);
  const raciales = CATALOG.filter((c) => c.raciale);
  const monsters = DUNGEONS.map((d) => {
    const mobs = CATALOG.filter((c) => c.dungeon === d.id);
    return groupSection(`${d.icon} ${d.name}`, mobs);
  });
  const synRows = [...CLASSES, ...ELEMENTS].map((t) => {
    const icon = GLYPH[t] ?? EL_GLYPH[t] ?? '';
    return `<tr><td>${icon} ${t}</td><td>${SYNERGIES[t][1].desc}</td><td>${SYNERGIES[t][2].desc}</td></tr>`;
  }).join('');
  const classRows = CLASSES.map((cl) => `<tr><td>${GLYPH[cl]} ${cl}</td><td>${CLASS_DOC[cl].stats}</td><td>${CLASS_DOC[cl].desc}</td></tr>`).join('');
  const diffRows = DIFFICULTIES.map((D) => `<tr><td>${D.name}</td><td>${D.minR}+</td><td>${D.boss5} / ${D.boss10}</td><td>×${D.pts}</td><td>${GEM_LABEL[BOSS_GEM[D.id][0]]} (+1 brut)</td><td>${GEM_LABEL[BOSS_GEM[D.id][1]]} (+2 bruts)</td><td>${Math.round((REG_ECLAT_RATE[D.id] || 0) * 100)} %</td></tr>`).join('');
  const evoSentence = Object.keys(EVO_COST).map((r) => `${r} → ${r === 'L' ? 'M' : NEXT_RAR[r]} : ${EVO_COST[r][1]} éclats ${GEM_LABEL[EVO_COST[r][0]]} de l’élément de la carte`).join(' ; ');
  const gemRows = DIFFICULTIES.map((D) => `<tr><td>${D.name}</td><td>${GEM_LABEL[BOSS_GEM[D.id][0]]}</td><td>${GEM_LABEL[BOSS_GEM[D.id][1]]}</td></tr>`).join('');
  root.innerHTML = `
    <h2>📖 Glossaire <span class="muted">les règles du jeu, par écrit</span></h2>
    <p class="muted">Cette page documente tout ce qui est en place : mécaniques, raretés, synergies, sorts découverts, éclats et difficultés. Les sorts n’apparaissent qu’à mesure que vous les rencontrez : en obtenant la carte, ou en croisant le monstre en donjon.</p>

    <details open class="glo-sec">
      <summary>⚔️ Mécaniques du jeu</summary>
      <h3>Le combat</h3>
      <ul class="glo-list">
        <li><b>Tour par tour</b> : les cartes des deux camps agissent une par une, de la plus agile à la moins agile (la vôtre d’abord à égalité), jusqu’au KO d’un camp. En Tactique, une fenêtre d’action s’ouvre pour chacune de vos cartes.</li>
        <li><b>Mana et sorts</b> : chaque unité régénère du mana (✦) à chaque action et lance le sort le plus cher qu’elle peut payer ; si son gros sort arrive bientôt, elle épargne un tour.</li>
        <li><b>Contrôle sous embargo</b> : les effets de contrôle (étourdissement, lenteur, poison, renvoi, malédiction, invocation…) ne s’appliquent que si le sort est lancé. Un sort qui coûte 6 part environ tous les 3 tours. Les ennemis suivent la même règle.</li>
        <li><b>Frappe sans sort</b> : sans mana pour son sort, chaque classe frappe à son rendement (voir le tableau des classes). Tant qu’un sort part, il frappe au multiplicateur du sort.</li>
        <li><b>Fureur</b> : passé le tour 15, tous les dégâts montent de 8 % par tour supplémentaire, des deux côtés : les combats ne s’éternisent jamais.</li>
        <li><b>Vitesse</b> : de \u00d70,5 \u00e0 \u00d732 \u2014 \u00e0 \u00d716 les animations sont coup\u00e9es mais le rythme reste visible ; \u00e0 \u00d732 le combat est quasi instantan\u00e9 (seul le plateau se redessine tour par tour). Le combat se lance tout seul \u00e0 l\u2019entr\u00e9e du donjon et \u00e0 chaque \u00e9tage, sauf en mode manuel.</li>
        <li><b>Rangs avant/arrière</b> : 3 cartes devant + 2 derrière (ou 2 + 3), choisi avant le combat et figé. L’arrière est ciblable et encaisse -50 % de dégâts tant qu’un allié tient à l’avant ; un Guerrier ou un Assassin en arrière frappe à moitié ; les soins ne sont jamais affectés ; les attaques de zone ignorent la protection de l’arrière.</li>
        <li><b>Éléments</b> : ${Object.entries(BEATS).map(([a, b]) => `${EL_GLYPH[a] ?? ''} ${a} bat ${b}`).join(', ')} ; domination = +25 % de dégâts ; ⚪ Neutre = hors oppositions (ni bonus ni malus : les naissances raciales avant leur voie).</li>
        <li><b>Races</b> : chaque carte porte une race — Humaine (la référence), Monstre (+10 % de stats de base), Mystique (+20 %), Divine (+30 %) ; la régression comble l’écart en entrant dans la race plus forte. L’élément Divin n’existe plus : les divines ont un vrai élément, et leur bonus d’équipe (+10 % dégâts et +10 % soins dès 2 en équipe) est porté par la race.</li>
        <li><b>Régression</b> : depuis un point de blocage (l’UR d’une lignée scellée), un Éclat de régression ouvre une NOUVELLE carte au palier R d’une race supérieure — 100 % des sorts, 10 % des stats gagnées, l’ancienne reste. L’Éclat tombe dans tous les donjons, de 0,3 % (Facile) à 5 % (Enfer) par victoire. Les monstres n’y ont pas accès.</li>
        <li><b>Verrou</b> : une carte verrouillée porte son cadenas et sa condition en fiche ; le standard sera le SR des nouvelles lignées, jamais après L.</li>
        <li><b>Évolutions typées</b> : chaque maillon exposera ses options d’évolution — standard, partagée (plusieurs parents), convergence, régression, chute, malédiction, événement de héros, secrète (floutée « ?? ») ; les arbres des novices les ouvriront.</li>
        <li><b>Statuts</b> : voir la liste plus bas dans cette section.</li>
      </ul>
      <h3>Les symboles de l’écran</h3>
      <ul class="glo-list">
        <li><b>ℹ️ 🎰 🌱</b> : les pastilles en haut de l’écran de combat. ℹ️ rappelle comment joue une carte, 🎰 le modificateur du run tiré à l’entrée du donjon, 🌱 le bonus de découverte du premier donjon. Touchez-les pour relire le texte à tout moment.</li>
        <li><b>⚡ ✦ ♥ 🛡 ⚔</b> : points de la Forge, mana, PV, bouclier (absorbe les dégâts avant les PV), attaque.</li>
      </ul>
      <h3>Les six classes</h3>
      <table class="glo-table"><tr><th>Classe</th><th>Stats</th><th>Comportement</th></tr>${classRows}</table>
      <h3>Statuts et effets</h3>
      <ul class="glo-list">${STATUS_DOC.map(([i, n, d]) => `<li><b>${i} ${n}</b> : ${d}</li>`).join('')}</ul>
      <h3>Niveaux et progression</h3>
      <ul class="glo-list">
        <li><b>Niveaux par exemplaire</b> : chaque exemplaire vit SES propres niveaux, de 1 à 20 (+8 % d’ATQ et de PV par niveau), plus son nom personnel, son Ascendance et ses sorts. L’XP vient des donjons (voir la section Ascension).</li>
        <li><b>Doublons</b> : ils ne nourrissent plus — 5 exemplaires libres d’une même rareté s’échangent à l’autel contre 1 carte de rareté supérieure.</li>
        <li><b>Évoluer</b> : dès le niveau 10, avec des éclats d’évolution de l’élément de la carte (jamais d’or), depuis la fiche ou la Forge. Monstres et cartes divines suivent la même règle le long de leur ligne de famille.</li>
      </ul>
    </details>

    <details class="glo-sec">
      <summary>🎴 Raretés et acquisition</summary>
      <table class="glo-table"><tr><th>Rareté</th><th>Nom</th><th>Rôle</th></tr>
        ${RARITIES.map(([r, n, d]) => `<tr><td><span class="chip rar r-${r}">${r}</span></td><td>${n}</td><td class="muted">${d}</td></tr>`).join('')}</table>
      <h3>Comment les cartes arrivent (plus de boutique)</h3>
      <ul class="glo-list">
        <li><b>Un début quasi uniquement en communes</b> : le rythme est volontairement lent ; les raretés montent avec les donjons débloqués et les difficultés.</li>
        <li><b>Pierres d’éveil</b> : l’éveil d’une naissance (rang N) exige 1 pierre d’éveil ; les boss des donjons en lâchent rarement, les quêtes quotidiennes en donnent. Les autres rangs paient leurs évolutions en éclats.</li>
        <li><b>Naissances sauvages</b> : chaque étage de donjon vaincu offre une très faible chance (${Math.round(N_DROP_RATE * 100)} %) qu’une naissance se joigne directement à vous ; le tirage reste borné par vos déblocages, et la rareté des jetons suit la table des data (communes au taux de référence, décroissant avec la rareté).</li>
        <li><b>Jetons de génération</b> : le boss final de chaque donjon en lâche un, 1 par jour et par donjon (rareté selon les donjons bouclés) ; la première victoire finale d’un donjon offre un jeton bonus de son biome.</li>
        <li><b>Naissances raciales</b> : un jeton ne donne QUE la naissance, au hasard — les 4 Novices (humaine), les 5 Embryons (monstre), les 3 Enge (mystique), Ange / Démon / Éveillé du Seuil (divine). Le jeton humain raffiné entre au maillon d’une voie (UC, 15 % R) ; le jeton d’évolution, au palier indiqué. Jamais les vieilles cartes hors architecture ; le tirage reste borné par les déblocages.</li>
        <li><b>Autel 5-pour-1</b> : la chaîne mène à la Légendaire (5 UR = 1 L) ; la M ne passe jamais par l’autel.</li>
        <li><b>Jalons</b> : premier donjon terminé = jeton humain raffiné + jeton de race ; premier boss d’étage 5 = jeton humain raffiné ; première Difficile = jeton d’évolution (Super Rare).</li>
        <li><b>Jetons de départ</b> : 5 jetons communs offerts au premier lancement — 2 humains, 1 humain raffiné (Peu commune garantie), et 2 races au tirage.</li>
        <li><b>Mode Tactique</b> : en combat, basculez en Tactique — le combat démarre et s'enchaîne tout seul, et quand vient le tour d'une de vos cartes, sa fenêtre d'action surgit : ⚔ attaque simple (gratuite), ✦ un de ses sorts avec son type, son coût et sa zone (le mana décide, soins et invocations compris : un sort est un sort), ➕ le soin croisé des attaquants, ou ⏸ attendre pour économiser le mana. Désignez la cible sur le plateau (les cibles s'illuminent, le bouton Annuler ramène à la fenêtre). Le rail au-dessus du plateau montre l'ordre du tour (agilité) ; ⏸ Pause fige le flux, ▶ Lancer le tour le relance. « Auto ce tour » laisse l'IA jouer un tour. Les récompenses suivent le prorata : tout en Tactique = intégrales, tout en auto = ÷ 2 (pts, éclats et XP), au fil des tours entre les deux.</li>
        <li><b>Modificateurs de run (v0.42)</b> : chaque exploration tire un modificateur, montré AVANT d'entrer — 🐗 la Horde (+1 ennemi par vague, butin +20 %), 🕯 le Mana Stérile (régénération de mana −1 pendant chaque combat, points +25 %), 🛡 la Muraille (ennemis +25 % PV, chances d'éclats +50 %), ⚔ la Rage Partagée (ennemis +15 % ATQ, points +40 %). La face rude paie la face compense : accepter le modificateur majore le butin du run. Le refuser est gratuit — le run se joue alors sans modificateur ; seul le relancement du tirage coûte 1 éclat brut. Il tient du premier étage jusqu'à la fin du run (défaite ou donjon bouclé).</li>
        <li><b>La grammaire des sorts (v0.43)</b> : chaque carte connaît ses sorts par couches, du plus universel au plus personnel — un sort COMMUN (Frappe Précise / Premiers Soins, 2✦), un sort DE RACE (Discipline de Ligne, Instinct Sauvage, Vol en Rase-Mottes, Ferveur Céleste), un sort DE CLASSE (Brise-Garde, Décharge Arcanique, Onde Consacrée, Frappe dans le Dos, Œil du Malheur) et sa SIGNATURE (le geste unique de la carte, 5✦). Les maillons des familles empilent le commun et les sorts de leur LIGNÉE, tier après tier. Côté soigneurs, le rang du sort décide du soin : plus le sort est cher, plus il soigne. Le Souffle Croisé, lui, n'est pas un sort : c'est l'action d'équipe des attaquants (voir Soins croisés).</li>
        <li><b>L'indice de force (v0.43)</b> : le niveau moyen ne dit pas si une équipe est faite de légendaires ou de communes. L'indice pondère l'ATQ et les PV au niveau courant (le cœur), la rareté (multiplicateur : elle capte la qualité des stats et la profondeur du grimoire) et le nombre de sorts (versatilité). Le seuil conseillé d'un donjon est calculé sur le boss final RÉEL de la difficulté courante : l'indice compare votre équipe à ce qu'elle affrontera.</li>
        <li><b>Défi du jour</b> : une victoire par jour rapporte +40 🪙 or, une naissance raciale de n’importe quelle race (50 % humaine, 30 % monstre, 15 % mystique, 5 % divine) et 1 éclat brut de son élément, plus 1 pierre d’éveil — la seule source régulière des cartes divines.</li>
        <li><b>Mythiques</b> : jamais lâchées par un donjon — elles viendront des événements de héros et des sommets des nouveaux arbres.</li>
      </ul>
    </details>

    <details class="glo-sec">
      <summary>🔗 Synergies</summary>    </details>

    <details class="glo-sec">
      <summary>🔗 Synergies</summary>
      <p class="muted">Paliers à 2 et 4 cartes différentes de la même classe ou du même élément. Les cartes comptent pour leurs deux facettes (classe ET élément).</p>
      <table class="glo-table"><tr><th>Type</th><th>Palier 2 cartes</th><th>Palier 4 cartes</th></tr>${synRows}</table>
    </details>

    <details class="glo-sec">
      <summary>✨ Sorts découverts</summary>
      ${companions.join('')}
      ${groupSection('Communes raciales', raciales, 'Les portes des quatre races : novices, bestiaux, enges et naissances divines. Neutre = hors oppositions.')}
      ${groupSection('Éclats et évolués', solos)}
      ${monsters.join('')}
    </details>

    <details class="glo-sec">
      <summary>✦ Éclats : fonctionnement</summary>
      <ul class="glo-list">
        <li><b>Qu’est-ce qu’un éclat ?</b> Un compagnon isolé, sans lignée : ${Object.keys(SOLO_STEPS).filter((id) => !byId(id).evolved && !byId(id).raciale).length} éclats de base.</li>
        <li><b>Fonte retirée (v0.33.1)</b> : les éclats ne se fondent plus dans les familles ; les bonus déjà fondus restent actifs en combat.</li>
        <li><b>Toujours jouables</b> : un exemplaire d’éclat monte en niveau comme les autres cartes et évolue au niveau 10 (avec des éclats d’évolution) en un compagnon supérieur doté d’une capacité spéciale. Il repart niveau 1 et cumule ses sorts.</li>
        <li><b>Plus acquérables</b> : les éclats ne s’obtiennent plus (ils sortaient des boosters) ; en v0.34, les compagnons isolés reviennent comme branches de l’évolution en racines.</li>
      </ul>
    </details>

    <details class="glo-sec">
      <summary>⭐ Ascension, autel et fatigue (v0.33)</summary>      </ul>
    </details>

    <details class="glo-sec">
      <summary>⭐ Ascension, autel et fatigue (v0.33)</summary>
      <ul class="glo-list">
        <li><b>Niveaux 1 à 20 par exemplaire</b> : +8 % d’ATQ et de PV par niveau. L’XP vient des donjons : étages franchis × multiplicateur de difficulté (×1 Facile … ×${DIFFICULTIES[4].pts} Enfer) ×1,5 si victoire, créditée à chaque exemplaire de l’équipe.</li>
        <li><b>Fatigue quotidienne par carte</b> : chaque run baisse l’XP d’un exemplaire de 10 % (100 %, 90 %, 80 %… plancher 25 %). Reset la nuit.</li>
        <li><b>Évolution dès le niveau 10</b> : le coût se paie en éclats d’évolution de l’élément de la carte, jamais en or : ${evoSentence}. L’exemplaire repart niveau 1 dans sa forme supérieure, garde son nom et cumule les sorts de ses formes passées.</li>
        <li><b>Le choix de la voie (v0.36)</b> : à la première évolution, chaque Novice choisit sa discipline — l’épéiste ouvre le guerrier, la protection ou la sylvestre ; le mage choisit son élément (ou la lumière : l’élue rejoint la lignée du prêtre) ; le prêtre choisit la foi ou la garde ; le voleur l’assassinat, les quais ou la fête. Un choix est définitif pour l’exemplaire, une autre copie peut prendre une autre voie. Le novice sans élément paie dans l’élément de la voie choisie.</li>
        <li><b>Les nouvelles lignées (v0.41)</b> : le Bestiau des Cieux ouvre à son évolution les trois voies du Zénith — la Légion Solaire, les Phénix Célestes, le Clergé du Plein Jour. Les naissances divines rejoignent les lignées du Seuil : l’Ange les Arbitres, le Démon le Chœur Miroir, l’Éveillé du Seuil les Tisseuses du Pont, trois chaînes qui courent désormais jusqu’à leurs Légendaires (Kairos, Écho, Ananké). Et l’audit des vieilles cartes est fermé : les 5 solos d’origine sont rattachés aux chaînes (Garde-Promesse rejoint la garde, Étincelle Vive la braise, Médecin de Camp l’aube, Veilleur d’Acier l’ombre, Pilier Mécanique le bouclier) — toute copie possédée évolue dans l’architecture ; seules les 7 branches SR des familles restent dormantes, pour les choix à venir.</li>
        <li><b>Ascendance</b> : évoluer au niveau 10 ne grave rien ; chaque niveau d’attente au-delà grave +0,5 % de stats de base (jusqu’à +5 % au niveau 20), pour toujours, cumulée à chaque évolution. Évoluer vite ou attendre fort : le dilemme.</li>
        <li><b>Éclats d’évolution</b> : les boss des étages 5 et 10 en lâchent (tier de la difficulté ci-dessous), et chaque étage intermédiaire offre une chance d’éclat brut :</li>
        <li><b>Couleur des éclats</b> : l’élément d’un éclat est tiré des monstres du donjon courant, et chaque donjon concentre deux éléments (Marées : Eau et Terre · Forge : Feu et Ombre · Bosquet : Terre et Lumière · Crypte : Ombre et Eau · Zénith : Lumière et Feu). Pour évoluer une carte Eau, farmez les donjons où l’Eau coule ; le rang (brut, poli, gravé, éternel) dépend de la difficulté.</li>
      </ul>
      <table class="glo-table"><tr><th>Difficulté</th><th>Boss étage 5</th><th>Boss étage 10</th></tr>${gemRows}</table>
      <ul class="glo-list">
        <li><b>Autel 5-pour-1</b> : 5 cartes libres de même catégorie (personnages ou monstres) et de même rareté = 1 carte de la rareté supérieure, d’un élément tiré des sacrifiées. La chaîne mène à la Légendaire (5 UR = 1 L) ; la Mythique ne passe jamais par l’autel.</li>
        <li><b>Jetons de génération</b> : vaincre le boss final offre un jeton, <b>1 par jour et par donjon</b>, à dépenser à la Forge ; sa rareté monte avec les donjons déjà bouclés (Commune au début, Peu commune puis Rare au fil des victoires finales). La première victoire finale sur un donjon offre en plus un jeton bonus de son biome. Jalons : premier donjon terminé = jeton humain raffiné + jeton de race ; premier boss d’étage 5 = jeton humain raffiné ; première Difficile = jeton d’évolution (Super Rare).</li>
        <li><b>Fatigue de butin</b> : par donjon, chaque victoire finale divise par 2 la chance d’éclats et de gemmes (100 %, 50 %, 25 %… plancher 10 %). Reset la nuit.</li>
      </ul>
    </details>

    <details class="glo-sec">
      <summary>⛰️ Difficultés et défis de donjons</summary>
      <p class="muted">Cinq donjons en chaîne, dix étages chacun, boss aux étages 5 et 10. Vaincre l’étage 10 d’un donjon (à n’importe quelle difficulté) ouvre le suivant ; vaincre le boss final en difficulté N déverrouille la difficulté N+1 du même donjon. Un checkpoint permet de reprendre à l’étage multiple de 5 le plus loin atteint.</p>
      <table class="glo-table"><tr><th>Difficulté</th><th>Créatures</th><th>Boss 5 / 10</th><th>Points</th><th>Éclats du boss 5</th><th>Éclats du boss final</th><th>Éclat de régression</th></tr>${diffRows}</table>
      <ul class="glo-list">
        <li><b>Créatures</b> : rareté minimale des monstres rencontrés ; en Enfer, chaque étage garde un minimum Rarissime.</li>
        <li><b>Enfer</b> : un boss à CHAQUE étage, points ×${DIFFICULTIES[4].pts}.</li>
                <li><b>Vagues du jour</b> : la composition d'un étage est fixe pour la journée — une défaite se retente sur les mêmes monstres, tout change le lendemain.</li>
        <li><b>Bonus de découverte (recalibré v0.36)</b> : dans l'Antre des Marées, en Facile, tant que le donjon n'a jamais été bouclé, les ennemis sont affaiblis (−30 % étages 1 à 5, −20 % étages 6 à 9, −55 % au boss final) et l'XP de run est DOUBLÉE : l'équipe de départ (5 cartes) boucle son premier donjon en environ 3 runs. Il s'éteint dès le premier donjon bouclé.</li>
        <li><b>Défaite</b> : l'écran de fin propose « Relancer l'exploration » — retour immédiat à l'étage 1, sans repasser par la carte du donjon.</li>
      </ul>
      <h3>Défi du jour 🌟</h3>
      <ul class="glo-list">
        <li><b>Une équipe divine par jour</b> : cinq cartes tirées des familles divines, au niveau de votre équipe au premier lancement du jour (figé ensuite, +2 pour leur chef, marqué boss). Pas d’étage, pas de difficulté — un combat, autant de tentatives que vous voulez.</li>
        <li><b>Récompense</b> : +40 🪙 or, 1 naissance raciale de n’importe quelle race (50 % humaine, 30 % monstre, 15 % mystique, 5 % divine, tirée au hasard : le joueur ne choisit pas sa naissance) et 1 éclat brut de son élément, plus 1 pierre d’éveil.</li>
        <li><b>Règles divines</b> : le camp remplace l’élément (ange = Lumière, démon = Ombre) ; une seule carte par famille divine en équipe, trois au maximum ; dès deux cartes divines posées, vos dégâts ET vos soins gagnent +10 %.</li>
        <li><b>Sommets</b> : Kairos, Arbitre du Seuil (étourdissement double), Écho, Voix Miroir (copie des sorts adverses) et Ananké, Tisseuse du Pont (liens chaînés) — les L des trois familles ne tombent qu’ici.</li>
      </ul>
    </details>

    <details class="glo-sec">
      <summary>📜 Historique des mécaniques</summary>
      ${HISTORY.map(([t, d]) => `<p><b>${t}</b><br><span class="muted">${d}</span></p>`).join('')}
      <h3>Mécaniques disparues</h3>
      <ul class="glo-list">${GONE_DOC.map(([t, d]) => `<li><b>${t}</b> : ${d}</li>`).join('')}</ul>
    </details>
    <p class="vspace"></p>`;
}
;



load();

if (store.instances.length === 0 && !store.departFait) {
  // boucle v2 lot 3 : départ à 2 cartes — l'écran de départ (renderDepart) s'affiche à l'accueil
  store.departFait = false;
  save();
}
updatePtsBadge();

registerRoute('#accueil', renderHome);
registerRoute('#equipe', renderEquipe);
registerRoute('#personnage', renderPersonnage);
registerRoute('#collection', renderCollection);
registerRoute('#forge', renderForge);
registerRoute('#donjons', renderDonjons);
registerRoute('#quetes', renderQuetes);
registerRoute('#terres', renderTerres);
registerRoute('#errance', renderErrance);
registerRoute('#boutique', renderBoutique);
registerRoute('#inventaire', renderInventaire);
registerRoute('#combat', renderCombat);
registerRoute('#glossaire', renderGlossaire);

setRoll(Math.random);
initAssets().then(() => start());
