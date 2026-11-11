// src/engine/progression.js : extrait du monolithe (phase 0, comportement inchange)

function nextFormOf(id) {
  const c = byId(id);
  if (!c || c.branch) return null;
  if (c.family) {
    const fam = FAMILIES[c.family];
    const t = fam.steps.indexOf(id);
    return t >= 0 && t < fam.steps.length - 1 ? fam.steps[t + 1] : null;
  }
  if (c.dungeon && monsterNextLine(id)) return monsterNextLine(id).nextId;
  return SOLO_STEPS[id] ?? null;
}

function formsOf(id) {
  const ch = EVO_CHOICES[id];
  if (ch?.length) return ch.map((x) => ({ type: 'standard', to: x.to, voie: x.voie, condition: '' }));
  const next = nextFormOf(id);
  return next ? [{ type: 'standard', to: next, condition: '' }] : [];
}

function evoTargetsOf(id) {
  return formsOf(id).map((f) => f.to);
}

function evoVoieOf(id, to) {
  return formsOf(id).find((f) => f.to === to)?.voie ?? '';
}

function evoCostOf(id) {
  const c = byId(id);
  if (!c) return null;
  // T1.2 : l'eveil d'une naissance (rang N) consomme des pierres d'eveil, pas des eclats
  if (c.rarity === 'N') return ['pierre', DATA.engine.EVEIL_COST ?? 1];
  return EVO_COST[c.rarity] ?? null;
}

// arbres de race (phase 1) : le moteur parcourt trees.json, il ne le connaît pas
function treeOfRace(race) {
  return (DATA.trees ?? {})[race] ?? null;
}
function cranPctOfRace(race) {
  const t = treeOfRace(race);
  if (!t) return 0;
  return Number((t.crans ?? {})[String(t.rang)] ?? 0);
}
function eveilsOf(cardId) {
  const out = [];
  for (const tree of Object.values(DATA.trees ?? {})) {
    for (const ev of tree.eveils ?? []) if (ev.de === cardId) out.push(ev);
  }
  return out;
}
function eveilOf(de, vers) {
  return eveilsOf(de).find((ev) => ev.vers === vers) ?? null;
}
// boucle v2 lot 5 : palier d'évolution sans perte nette — la forme suivante au niveau 1 reste
// au moins aussi forte que la forme précédente au niveau 10 (ATQ et PV) ; le pourcentage est
// calculé depuis les données, vérifié par simulation (test), jamais deviné à la main.
function noLossPctOf(fromCard, toCard) {
  // calcul sur les valeurs non arrondies (les classes ont des atkPct négatifs), +1 pt de marge d'arrondi
  const raw = (c, lvl) => {
    const mm = 1 + LEVEL_BONUS * (lvl - 1);
    const cm = classeMods(c);
    const cran = cranPctOfRace(raceOfCard(c));
    return {
      atk: c.atk * mm * (1 + cm.atkPct) * (1 + cran / 100),
      hp: c.hp * mm * (1 + cm.hpPct) * (1 + cran / 100),
    };
  };
  const a = raw(fromCard, 10);
  const b = raw(toCard, 1);
  const need = Math.max(a.atk / Math.max(1, b.atk), a.hp / Math.max(1, b.hp)) - 1;
  return need <= 0 ? 0 : Math.ceil(need * 100) + 1;
}

// applique un éveil depuis les données : id, cran de race sur les stats de base, voie
function applyTreeEveil(inst, eveil) {
  const to = getCard(eveil.vers) ?? getMonster(eveil.vers);
  if (!to) throw new Error(`éveil vers une carte inconnue : ${eveil.vers}`);
  const from = getCard(inst.id) ?? getMonster(inst.id) ?? {};
  inst.noLoss = noLossPctOf(from, to);
  const pct = cranPctOfRace(raceOfCard(to));
  const oldSpells = unknownSpellsOf((from.spells ?? []).map((sp) => ({ ...sp })), to.spells, inst.acc);
  if (oldSpells.length) inst.acc = [...(inst.acc ?? []), ...oldSpells];
  inst.id = eveil.vers;
  inst.voie = eveil.voie;
  inst.cranPct = pct;
  inst.baseAtk = Math.max(1, Math.round((to.atk ?? 1) * (1 + pct / 100)));
  inst.baseHp = Math.max(1, Math.round((to.hp ?? 1) * (1 + pct / 100)));
  inst.lvl = 1;
  inst.xp = 0;
  return inst;
}
// règle "remplace" (EXI-P1-2) : l'exemplaire ciblé disparaît, ses pouvoirs passent à l'éveillé
function applyRemplace(instances, eveil, targetIid) {
  if (eveil.effet !== 'remplace' || !eveil.disparait) return [];
  const retires = [];
  for (const inst of instances) {
    if (inst.id === eveil.disparait) {
      const cible = instances.find((i) => i.iid === targetIid);
      if (cible) {
        const pouvoirs = unknownSpellsOf([...(inst.acc ?? []), ...(getCard(inst.id)?.spells ?? []).map((s) => ({ ...s }))], getCard(cible.id)?.spells, cible.acc);
        cible.acc = [...(cible.acc ?? []), ...pouvoirs];
      }
      retires.push(inst.iid);
    }
  }
  return retires;
}

// écoles (phase 2) : un sort dépend de son école ouverte, jamais d'une classe (EXI-P2-1)
function profilSchools(classe) {
  const out = [];
  for (const [id, ecole] of Object.entries(DATA.schools ?? {})) {
    if ((ecole.ouvrePar?.profils ?? []).includes(classe)) out.push(id);
  }
  return out;
}
function openSchools(voie) {
  const out = [];
  const v = String(voie ?? '').toLowerCase();
  for (const [id, ecole] of Object.entries(DATA.schools ?? {})) {
    if ((ecole.ouvrePar?.voies ?? []).some((x) => v.includes(String(x).toLowerCase()))) out.push(id);
  }
  return out;
}
function ecolesOfInstance(inst) {
  return new Set([...(inst.ecoles ?? []), ...profilSchools(inst.classe ?? ''), ...(inst.voie ? openSchools(inst.voie) : [])]);
}
function canCast(inst, spellId) {
  const def = getSpellDef(spellId);
  if (!def || !def.ecole) return true;
  return ecolesOfInstance(inst).has(def.ecole);
}
// acquisition de départ (EXI-P2-6) : une naissance naît avec son commun + son sort de race
function raceOfNaissance(c) {
  if (!c.raciale) return null;
  if (c.dungeon === 'divin') return 'divine';
  const n = Number(String(c.id).replace(/\D/g, ''));
  if (n <= 4) return 'humaine';
  if (n <= 9) return 'bestiau';
  return 'enge';
}
function sortsDeDepart(cardId) {
  const c = getCard(cardId);
  if (!c) return [];
  const commun = (DATA.grimoire.communs ?? []).find((s) => !!(c.effect && c.effect.kind === 'heal') === (s.role === 'soin'));
  const out = commun ? [commun.id] : [];
  const race = raceOfNaissance(c);
  const raceSpell = race ? (DATA.grimoire.race ?? []).find((s) => s.race === race) : null;
  if (raceSpell) out.push(raceSpell.id);
  return out;
}

// zones d'errance (phase 4) : passage scripté, récoltes et enseignements depuis les données
function runZone(zoneId, rng, opts = {}) {
  const z = getZone(zoneId);
  if (!z) throw new Error(`zone inconnue : ${zoneId}`);
  const recoltes = [];
  const rEclats = z.recoltes?.eclats;
  if (rEclats && rng() < rEclats.taux) {
    const tiers = rEclats.tiers?.length ? rEclats.tiers : ['brut'];
    recoltes.push({ type: 'eclat', tier: tiers[Math.floor(rng() * tiers.length)] });
  }
  if (rng() < (z.drops?.N ?? 0)) {
    // boucle v2 lot 5 : le rang N est exclu des drops — seules les communes divines (C) restent
    const pool = (z.poolN ?? []).filter((id) => (byId(id)?.rarity ?? 'N') !== 'N');
    recoltes.push({ type: 'N', carte: pool.length ? pool[Math.floor(rng() * pool.length)] : null });
  }
  if (z.recoltes?.jetons && rng() < z.recoltes.jetons.taux) recoltes.push({ type: 'jeton' });
  return { zone: zoneId, recoltes, enseignements: [...(z.ecolages ?? [])], opts };
}
// apprentissage (EXI-P4-3) : un cran appris rejoint le grimoire persisté du joueur
function learnCran(grimoire, spellId, cran) {
  if (!Array.isArray(grimoire)) grimoire = [];
  if (!grimoire.some((g) => g.sort === spellId && g.cran === cran)) grimoire.push({ sort: spellId, cran });
  return grimoire;
}
function isLearned(grimoire, spellId, cran) {
  return (grimoire ?? []).some((g) => g.sort === spellId && g.cran === cran);
}
function canCastLearned(inst, grimoire, spellId, cran) {
  return isLearned(grimoire, spellId, cran) && canCast(inst, spellId);
}

// lot 5 : types d'évolution spéciaux, pilotés par les données (evolutions.json / trees.json)
function evoEntryOf(from, to) {
  // evolutions.json d'abord : c'est là que vivent les types spéciaux et leurs conditions
  const c = ((DATA.evolutions ?? {})[from] ?? []).find((x) => x.to === to);
  if (c) return { type: c.type ?? 'standard', to, voie: c.voie, condition: c.condition ?? null };
  for (const tree of Object.values(DATA.trees ?? {})) {
    for (const ev of tree.eveils ?? []) {
      if (ev.de === from && ev.vers === to) return { ...ev, type: ev.type ?? 'standard', condition: ev.condition ?? null };
    }
  }
  return null;
}
function conditionOk(cond, ctx) {
  if (!cond) return true;
  const items = ctx?.items ?? {};
  const owned = ctx?.owned ?? [];
  const events = ctx?.events ?? [];
  if (cond.kind === 'item') return (items[cond.id] ?? 0) >= (cond.n ?? 1);
  if (cond.kind === 'owns') return owned.filter((id) => id === cond.id).length >= (cond.n ?? 1);
  if (cond.kind === 'event') return events.includes(cond.id);
  if (cond.kind === 'all') return (cond.of ?? []).every((c) => conditionOk(c, ctx));
  return true;
}
// applique une évolution spéciale ; retourne { ok, spawned?, consumed? } ou null si standard
function applySpecialEvo(inst, entry, ctx = {}) {
  if (!entry || entry.type === 'standard') return null;
  if (!conditionOk(entry.condition, ctx)) return { ok: false, reason: 'condition non remplie' };
  if (entry.type === 'regression') {
    if (ctx.items && entry.condition?.kind === 'item') ctx.items[entry.condition.id] -= (entry.condition.n ?? 1);
    const to = getCard(entry.to) ?? getMonster(entry.to);
    const spawned = { ...inst, iid: `${inst.iid}-reg`, id: entry.to, lvl: 1, xp: 0, asc: (inst.asc ?? 0) * (1 + M.REG_STATS_BONUS), acc: [...(inst.acc ?? [])] };
    return { ok: true, spawned, type: 'regression' };
  }
  if (entry.type === 'fusion') {
    return { ok: true, consumed: (entry.condition?.n ?? 2), type: 'fusion', to: entry.to };
  }
  if (entry.type === 'malediction') {
    inst.id = entry.to;
    inst.locked = true;
    return { ok: true, type: 'malediction' };
  }
  if (entry.type === 'evenement') {
    return { ok: true, spawned: { ...inst, iid: `${inst.iid}-evt`, id: entry.to }, type: 'evenement' };
  }
  if (entry.type === 'secrete' || entry.type === 'chute') {
    return { ok: true, type: entry.type, to: entry.to };
  }
  return { ok: true, type: entry.type };
}

// lot 5 UI : une évolution secrète s'affiche floutée « ?? » (le moteur garde la vraie cible)
function evoLabelOf(from, to) {
  const e = evoEntryOf(from, to);
  return e && e.type === 'secrete' ? '??' : (e?.voie || to);
}
