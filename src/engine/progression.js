// src/engine/progression.js : extrait du monolithe (phase 0, comportement inchange)

function nextFormOf(id) {
  const c = byId(id);
  if (!c) return null;
  if (c.family && !c.branch) {
    const fam = FAMILIES[c.family];
    const t = fam.steps.indexOf(id);
    // lot C5 : un ex-solo greffé n'est pas dans les steps de sa famille d'accueil,
    // ses solo-steps (cibles d'évolution préservées) restent actifs
    if (t >= 0) return t < fam.steps.length - 1 ? fam.steps[t + 1] : null;
  }
  if (c.dungeon && monsterNextLine(id)) return monsterNextLine(id).nextId;
  // lot C6 : les branches de forge (b1-b7, c1-c14) suivent aussi leurs solo-steps (voie UR → L)
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
    const cran = cranPctOfRace(raceOfCard(c));
    // moteur v2 : J3 plus de mods de classe, J4 cran sur les PV seulement
    return {
      atk: c.atk * mm,
      hp: c.hp * mm * (1 + cran / 100),
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
// lot 4 refonte v2 : grimoires par zone — les crans appris (zones d'errance) se resolvent en
// fiches complètes pour le combat, uniquement pour les ecoles ouvertes par l'exemplaire
function grimoireSpellsOf(inst, grimoire) {
  return (grimoire ?? [])
    .filter((g) => g && typeof g.sort === 'string' && canCastLearned(inst, grimoire, g.sort, g.cran))
    .map((g) => resolveSpellEntry(g))
    .filter(Boolean);
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
  // lot 6 (spec-fusion-v4 §2.5) : le type « regression » MEURT — refusé explicitement, plus d'entrée en data
  if (entry.type === 'regression') return { ok: false, reason: 'type regression retiré (fusion v4)' };
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

// ===== Fusion DQM v4 (lot 6, spec-fusion-v4) : deux cartes jouables -> un enfant =====
// La couche race décide du TYPE d'enfant (cycle monstre->mystique->divine->monstre, l'humain
// est le catalyseur), la table de synthèse (data/fusion-synthese.json) désigne la lignñe.
const RACE_CYCLE = { monstre: 'mystique', mystique: 'divine', divine: 'monstre' };
const BIOMES = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];

function synthesePaire(famA, famB) {
  const syn = DATA['fusion-synthese'] ?? {};
  const key = [famA ?? '', famB ?? ''].sort().join('|');
  return syn.paires?.[key] ?? syn.defaut ?? { famille: 'A', rarete: 'max' };
}
function biomeOfFamille(fam, rng) {
  const b = (FUSION_CFG.biomeParFamille ?? {})[fam];
  if (b && b !== 'hasard') return b;
  return BIOMES[Math.floor(rng() * BIOMES.length)];
}
// enfant possible pour une race + rareté : monstre du biome (ou divin), sinon carte de famille
function cardEnfantOf(raceCible, rarete, familleId, biomeCible, rng, fallbackCard = null) {
  if (raceCible === 'monstre' || raceCible === 'mystique' || raceCible === 'divine') {
    const poolBiome = biomeCible && biomeCible !== 'divin'
      ? MONSTERS.filter((m) => m.dungeon === biomeCible)
      : MONSTERS.filter((m) => m.dungeon === 'divin');
    const byRace = poolBiome.filter((m) => raceOfCard(m) === raceCible && m.rarity === rarete);
    const anyRace = poolBiome.filter((m) => m.rarity === rarete);
    const pool = byRace.length ? byRace : anyRace;
    if (pool.length) return { ...pool[Math.floor(rng() * pool.length)], kind: 'monstre' };
  }
  // lignée parentale : la famille désignée (ou celle d'un parent), au palier de la rareté
  const fam = FAMILIES[familleId] ?? null;
  if (fam) {
    const steps = fam.steps ?? [];
    const idx = Math.min(RANK[rarete] ?? 0, steps.length - 1);
    const id = steps[Math.max(0, idx)];
    const c = getCard(id);
    if (c) return { ...c, kind: 'carte' };
  }
  if (fallbackCard) return { ...fallbackCard, kind: 'carte' }; // parent sans famille : on reste sur sa carte
  return null;
}
// aperçu complet et déterministe (tous les jets sont faits ici, rejouables par seed) :
// la fenêtre de fusion montre la race cible, la famille cible (ou « ? » + candidats), le palier,
// le plafond et les sorts héritables — jamais l'identité exacte de l'enfant (mystère des lignées)
function fusionPreview(instA, instB, rng, opts = {}) {
  const F = FUSION_CFG;
  const cardA = getCard(instA.id) ?? getMonster(instA.id);
  const cardB = getCard(instB.id) ?? getMonster(instB.id);
  if (!cardA || !cardB) return { ok: false, reason: 'carte inconnue' };
  const raceA = raceOfCard(cardA), raceB = raceOfCard(cardB);
  let raceCible = null, demon = false, biomeCible = null, saut = false;
  const humain = raceA === 'humaine' ? cardA : raceB === 'humaine' ? cardB : null;
  const autre = raceA === 'humaine' ? cardB : cardA;
  const raceAutre = raceA === 'humaine' ? raceB : raceA;
  if (humain && raceAutre !== 'humaine') {
    if (rng() < (F.sautRate ?? 0)) {
      saut = true;
      if (raceAutre === 'divine') {
        if (rng() < (F.demonRate ?? 0)) { demon = true; raceCible = 'divine'; biomeCible = 'divin'; }
        else { raceCible = 'monstre'; biomeCible = biomeOfFamille(humain.family, rng); }
      } else {
        raceCible = RACE_CYCLE[raceAutre] ?? raceAutre;
        biomeCible = biomeOfFamille(humain.family, rng); // saut réussi : le biome vient de la famille humaine
      }
    } else {
      raceCible = (rng() * 2) < 1 ? raceA : raceB; // échec du saut : lignée d'un parent
    }
  } else {
    raceCible = (rng() * 2) < 1 ? raceA : raceB; // pas d'humain (ou 2 humains) : pas de saut
  }
  const syn = synthesePaire(cardA.family, cardB.family);
  let familleId = null, candidats = [];
  const famA = cardA.family ?? cardB.family ?? null;
  const famB = cardB.family ?? cardA.family ?? null;
  if (syn.famille === 'hasard') { candidats = [...new Set([famA, famB].filter(Boolean))]; familleId = candidats.length ? candidats[Math.floor(rng() * candidats.length)] : null; }
  else if (syn.famille === 'A' || syn.famille === 'B') familleId = (syn.famille === 'A' ? famA : famB);
  else familleId = syn.famille;
  const rarA = RANK[cardA.rarity] ?? 0, rarB = RANK[cardB.rarity] ?? 0;
  const rarete = syn.rarete === 'max' ? (rarA >= rarB ? cardA.rarity : cardB.rarity) : syn.rarete;
  // saut réussi avec un humain -> vrai monstre de la race cible ; sinon lignée d'un parent (carte de famille)
  const enfant = (saut && humain) ? cardEnfantOf(raceCible, rarete, familleId, biomeCible, rng, humain) : cardEnfantOf('humaine', rarete, familleId, null, rng, cardA.family ? cardA : cardB);
  if (!enfant) return { ok: false, reason: 'aucune lignée trouvée' };
  const stA = statsAt(cardA, instA.lvl ?? 1), stB = statsAt(cardB, instB.lvl ?? 1);
  const plafond = (F.plafonds ?? {})[rarete] ?? 0;
  const pct = F.statsPct ?? 0;
  const bonusAtk = Math.round(Math.min(pct * (stA.atk + stB.atk), plafond * enfant.atk));
  const bonusHp = Math.round(Math.min(pct * (stA.hp + stB.hp), plafond * enfant.hp));
  // sorts héritables : sorts des deux parents, jamais la signature de l'enfant
  const sigEnfant = enfant.soloSpell ?? null;
  const vus = new Set(); const sorts = [];
  for (const inst of [instA, instB]) {
    const base = getCard(inst.id) ?? getMonster(inst.id);
    for (const sp of [...(inst.acc ?? []), ...((base && base.spells) ?? [])]) {
      const r = resolveSpellEntry(sp);
      if (!r || !r.name) continue;
      const k = spellKeyOf(r);
      if (k && vus.has(k)) continue;
      if (sigEnfant && r.name === sigEnfant) continue;
      if (k) vus.add(k);
      sorts.push({ key: k ?? r.name, name: r.name, cost: r.cost, mult: r.mult, brut: sp });
    }
  }
  const sortsMax = (rarA >= RANK.SR && rarB >= RANK.SR) ? (F.sortsMaxSR ?? 3) : (F.sortsMax ?? 2);
  return {
    ok: true, raceCible, demon, biomeCible, saut, familleId, candidatsFamille: candidats,
    familleHasard: syn.famille === 'hasard', rarete, plafondPct: plafond,
    childId: enfant.id, childKind: enfant.kind, childName: demon ? '??' : enfant.name,
    bonusAtk, bonusHp, sorts, sortsMax,
    parentA: { iid: instA.iid, id: cardA.id, name: cardA.name }, parentB: { iid: instB.iid, id: cardB.id, name: cardB.name },
  };
}
// garde-fous + application : parents consommés, enfant niveau 1, sorts choisis, bonus de stats plafonné
function doFusion(instances, iidA, iidB, choixSorts, plan, opts = {}) {
  const teamIids = new Set(opts.teamIids ?? []);
  const instA = instances.find((i) => i.iid === iidA);
  const instB = instances.find((i) => i.iid === iidB);
  if (!instA || !instB || iidA === iidB) return { ok: false, reason: 'sélection invalide' };
  const cardA = getCard(instA.id) ?? getMonster(instA.id);
  const cardB = getCard(instB.id) ?? getMonster(instB.id);
  if (!cardA || !cardB) return { ok: false, reason: 'carte inconnue' };
  if (cardA.rarity === 'N' && cardB.rarity === 'N') return { ok: false, reason: 'deux naissances N ne fusionnent pas' };
  if (cardA.rarity === 'M' || cardB.rarity === 'M') return { ok: false, reason: 'un M ne fusionne pas' };
  if (teamIids.has(iidA) || teamIids.has(iidB)) return { ok: false, reason: 'carte en équipe active refusée' };
  if (opts.ownedOf) {
    if ((opts.ownedOf(instA.id) ?? 0) <= 1 || (opts.ownedOf(instB.id) ?? 0) <= 1) return { ok: false, reason: 'exemplaire unique de collection refusé' };
  }
  if (!plan || !plan.ok || plan.parentA.iid !== iidA || plan.parentB.iid !== iidB) return { ok: false, reason: 'aperçu invalide' };
  const dispo = new Map(plan.sorts.map((s) => [s.key, s]));
  const acc = (choixSorts ?? []).slice(0, plan.sortsMax).filter((k) => dispo.has(k)).map((k) => ({ ...dispo.get(k).brut }));
  const enfant = {
    iid: `fus-${iidA}-${iidB}`, id: plan.childId, lvl: 1, xp: 0,
    acc,
    ...(plan.bonusAtk > 0 || plan.bonusHp > 0 ? { fusionBonus: { atk: plan.bonusAtk, hp: plan.bonusHp } } : {}),
    ...(instA.voie ? { voie: instA.voie } : {}),
    isNew: true,
  };
  const reste = instances.filter((i) => i.iid !== iidA && i.iid !== iidB);
  reste.push(enfant);
  return { ok: true, enfant, instances: reste, consumed: [iidA, iidB] };
}
