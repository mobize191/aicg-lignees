// src/engine/summon.js : extrait du monolithe (phase 0, comportement inchange)

function castSummon(s, allies, mods, events, side, opts = null) {
  const pool = allies.avant;
  const eff = s.effect ?? {};
  // opts (sort de lignée avec summon en data) : hpPct/ttl du sort, ATQ = stat lanceur × mult × 0,5,
  // un esprit actif MAX par lanceur (relancer remplace l'ancien), pas de budget
  if (opts) {
    for (const old of pool.filter((x) => x.uid.startsWith(`${s.uid}-inv`) && x.alive)) {
      old.alive = false; old.hp = 0;
      events.push({ type: 'expire', side, targetId: old.uid });
    }
    if (pool.filter((u) => u.uid.includes('-inv') && u.alive).length >= 2) return null;
  } else {
    if ((s.summonBudget ?? 3) <= 0) return null;
    if (pool.filter((u) => u.uid.includes('-inv') && u.alive).length >= 2) return null;
    s.summonBudget = (s.summonBudget ?? 3) - 1;
  }
  const nb = pool.filter((u) => u.uid.includes('-inv')).length + 1;
  const hpBonus = side === 'team' ? (mods && mods.summonHp) || 0 : 0;
  const atkBonus = side === 'team' ? (mods && mods.summonAtk) || 0 : 0;
  const atk = opts && opts.mult != null
    ? Math.max(1, Math.round(statOf(s) * opts.mult * M.SUMMON_SPELL_ATK_RATIO * (1 + atkBonus)))
    : Math.max(1, Math.round(s.atk * (eff.value ?? M.SUMMON_ATK_DEFAULT) * (1 + atkBonus)));
  const inv = makeUnit({
    id: `${s.cardId}-inv`, name: opts?.name ?? eff.summonName ?? 'Invocation',
    rarity: 'C', classe: s.classe, element: s.element,
    atk,
    hp: Math.max(1, Math.round(s.maxHp * (opts?.hpPct ?? eff.hpPct ?? M.SUMMON_HP_DEFAULT) * (1 + hpBonus))),
  }, `${s.uid}-inv${nb}`);
  inv.spells = [{ ...M.SUMMON_SPELL }];
  inv.mana = 6; inv.manaMax = 6; inv.manaRegen = 2;
  inv.status.ttl = opts?.ttl ?? eff.ttl ?? 3;
  pool.push(inv);
  events.push({ type: 'summon', side, sourceId: s.uid, targetId: inv.uid, name: inv.name });
  return inv;
}
