// src/engine/summon.js : extrait du monolithe (phase 0, comportement inchange)

function castSummon(s, allies, mods, events, side) {
  if ((s.summonBudget ?? 3) <= 0) return null;
  const pool = allies.attaque;
  if (pool.filter((u) => u.uid.includes('-inv') && u.alive).length >= 2) return null;
  s.summonBudget = (s.summonBudget ?? 3) - 1;
  const nb = pool.filter((u) => u.uid.includes('-inv')).length + 1;
  const hpBonus = side === 'team' ? (mods && mods.summonHp) || 0 : 0;
  const atkBonus = side === 'team' ? (mods && mods.summonAtk) || 0 : 0;
  const inv = makeUnit({
    id: `${s.cardId}-inv`, name: s.effect.summonName ?? 'Invocation',
    rarity: 'C', classe: s.classe, element: s.element, role: 'attaque',
    atk: Math.max(1, Math.round(s.atk * (s.effect.value ?? M.SUMMON_ATK_DEFAULT) * (1 + atkBonus))),
    hp: Math.max(1, Math.round(s.maxHp * (s.effect.hpPct ?? M.SUMMON_HP_DEFAULT) * (1 + hpBonus))),
  }, `${s.uid}-inv${nb}`);
  inv.spells = [{ ...M.SUMMON_SPELL }];
  inv.mana = 6; inv.manaMax = 6; inv.manaRegen = 2;
  inv.status.ttl = s.effect.ttl ?? 3;
  pool.push(inv);
  events.push({ type: 'summon', side, sourceId: s.uid, targetId: inv.uid, name: inv.name });
  return inv;
}
