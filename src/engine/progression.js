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
  return EVO_COST[byId(id).rarity] ?? null;
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
// applique un éveil depuis les données : id, cran de race sur les stats de base, voie
function applyTreeEveil(inst, eveil) {
  const to = getCard(eveil.vers) ?? getMonster(eveil.vers);
  if (!to) throw new Error(`éveil vers une carte inconnue : ${eveil.vers}`);
  const pct = cranPctOfRace(raceOfCard(to));
  const from = getCard(inst.id) ?? getMonster(inst.id) ?? {};
  const oldSpells = (from.spells ?? []).map((sp) => ({ ...sp }));
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
        const pouvoirs = [...(inst.acc ?? []), ...(getCard(inst.id)?.spells ?? []).map((s) => ({ ...s }))];
        cible.acc = [...(cible.acc ?? []), ...pouvoirs];
      }
      retires.push(inst.iid);
    }
  }
  return retires;
}
