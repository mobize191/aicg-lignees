// src/engine/spells.js : extrait du monolithe (phase 0, comportement inchange)

function pickSpell(u) {
  u.mana = Math.min(u.manaMax, u.mana + u.manaRegen);
  let best = null;
  for (const s of u.spells) {
    if (s.cost <= u.mana && (!best || s.cost > best.cost)) best = s;
  }
  if (!best) return null;
  if (u.spells.length > 1) {
    const top = u.spells[u.spells.length - 1];
    if (top.cost > u.mana && top.cost <= u.manaMax && top.cost <= u.mana + 2 * u.manaRegen) {
      return null; 
    }
  }
  u.mana -= best.cost;
  return best;
}

function applySupport(s, allies, mods, events, side, foes = [], st = null, action = null) {
  
  let spell = null;
  if (action && action.kind === 'pass') {
    s.mana = Math.min(s.manaMax, s.mana + s.manaRegen);
    events.push({ type: 'status', side, targetId: s.uid, kind: 'tactical', value: 'attente' });
    return;
  } else if (action && action.kind === 'basic') {
    s.mana = Math.min(s.manaMax, s.mana + s.manaRegen);
  } else if (action && action.kind === 'cast') {
    s.mana = Math.min(s.manaMax, s.mana + s.manaRegen);
    const cand = (s.spells ?? [])[action.idx ?? 0];
    if (cand && cand.cost <= s.mana) {
      spell = cand;
      s.mana -= cand.cost;
    }
  } else {
    spell = pickSpell(s);
  }
  if (st && spell) st.lastEnemySpell = { name: spell.name, mult: spell.mult, cost: spell.cost, big: !!spell.big };
  const fx = s.effect ? s.effect.kind : 'heal';
  if (spell) {
    events.push({ type: 'cast', side, sourceId: s.uid, name: spell.name, big: !!spell.big || spell.cost >= 5, fx, mana: s.mana });
  }
  const mult = spell ? spell.mult : 1;
  const kind = spell ? 'special' : 'basic';
  const aliveAllies = [...allies.attaque, ...allies.support].filter((u) => u.alive);
  const hurt = aliveAllies.filter((u) => u.hp < u.maxHp).sort((a, b) => a.hp - b.hp);
  if (action && action.allyUid) {
    const k = hurt.findIndex((u) => u.uid === action.allyUid);
    if (k > 0) hurt.unshift(hurt.splice(k, 1)[0]);
  }
  const n = side === 'team' && mods.dualSupport ? 2 : 1;
  if (side === 'team' && s.effect.kind === 'heal' && hurt.length === 0
      && s.mana >= CROSS.support.cost && foes.length) {
    const t = foes.reduce((a, b) => (a.hp <= b.hp ? a : b));
    s.mana -= CROSS.support.cost;
    events.push({ type: 'cast', side, sourceId: s.uid, name: s.crossName ?? CROSS.support.name, fx: 'atk', mana: s.mana });
    const dmg = Math.max(1, Math.round(s.atk * CROSS.support.base * CROSS.yield * classeMods(s).strike * elementMult(s.element, t.element)));
    events.push({ type: 'attack', sourceId: s.uid, targetId: t.uid, amount: dmg, kind: 'special', mana: s.mana, elem: elementTag(s.element, t.element), side: 'team' });
    applyDamage(t, dmg, events, 'enemies');
    return;
  }
  
  
  
  
  
  
  const cap = (t) => Math.round(t.maxHp * 0.35);
  if (s.effect.kind === 'heal') {
    const value = Math.round(s.effect.value * (1 + (side === 'team' ? mods.healPct || 0 : 0)) * mult);
    for (const t of hurt.slice(0, n)) {
      const amount = Math.min(value, t.maxHp - t.hp);
      if (amount > 0) {
        t.hp += amount;
        events.push({ type: 'heal', side, sourceId: s.uid, targetId: t.uid, amount, kind });
        const p = t.linkedTo ? aliveAllies.find((a) => a.uid === t.linkedTo) : null;
        if (p) {
          const share = Math.min(Math.round(amount * 0.5), p.maxHp - p.hp);
          if (share > 0) {
            p.hp += share;
            events.push({ type: 'heal', side, sourceId: s.uid, targetId: p.uid, amount: share, kind: 'link' });
          }
        }
      }
    }
  } else if (s.effect.kind === 'atkBuff') {
    const value = s.effect.value * mult;
    for (const t of allies.attaque.filter((u) => u.alive).slice(0, n)) {
      t.atkBuff += value;
      events.push({ type: 'buff', side, sourceId: s.uid, targetId: t.uid, kind: 'atk', value, kindTag: kind });
      const p = t.linkedTo ? aliveAllies.find((a) => a.uid === t.linkedTo) : null;
      if (p) {
        p.atkBuff += value * 0.5;
        events.push({ type: 'buff', side, sourceId: s.uid, targetId: p.uid, kind: 'atk', value: value * 0.5, kindTag: 'link' });
      }
    }
  } else if (s.effect.kind === 'shield') {
    const value = Math.round(s.effect.value * mult);
    for (const t of allies.attaque.filter((u) => u.alive).slice(0, n)) {
      const amount = Math.min(value, cap(t));
      t.shield += amount;
      events.push({ type: 'shield', side, sourceId: s.uid, targetId: t.uid, amount, kind });
    }
  } else if (s.effect.kind === 'stun') {
    if (!spell) return;
    const count = s.effect.count ?? 1;
    for (const t of [...foes].sort((a, b) => b.atk - a.atk).slice(0, count)) {
      t.status.stun = (t.status.stun ?? 0) + 1;
      events.push({ type: 'status', side, sourceId: s.uid, targetId: t.uid, kind: 'stun', value: 1 });
    }
  } else if (s.effect.kind === 'slow') {
    if (!spell) return;
    for (const f of foes) {
      f.status.slow = Math.max(f.status.slow ?? 0, 2);
      events.push({ type: 'status', side, sourceId: s.uid, targetId: f.uid, kind: 'slow', value: 2 });
    }
  } else if (s.effect.kind === 'dot') {
    if (!spell) return;
    for (const f of foes) {
      f.status.dot = {
        dmg: Math.max(1, Math.round(s.atk * (s.effect.pct ?? 0.4) * mult)),
        turns: s.effect.turns ?? 2,
      };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: f.uid, kind: 'dot', value: f.status.dot.dmg });
    }
  } else if (s.effect.kind === 'reflect') {
    if (!spell) return;
    for (const t of aliveAllies) {
      t.status.reflect = { pct: s.effect.value ?? 0.25, turns: s.effect.turns ?? 2 };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: t.uid, kind: 'reflect', value: t.status.reflect.pct });
    }
  } else if (s.effect.kind === 'warcry') {
    if (!spell) return;
    const value = s.effect.value ?? 0.25;
    for (const t of allies.attaque.filter((u) => u.alive)) {
      t.atkBuff += value;
      t.status.dmgRed = { pct: s.effect.red ?? 0.2, turns: 1 };
      events.push({ type: 'buff', side, sourceId: s.uid, targetId: t.uid, kind: 'atk', value, kindTag: kind });
    }
  } else if (s.effect.kind === 'summon') {
    if (!spell) return;
    castSummon(s, allies, mods, events, side);
  } else if (s.effect.kind === 'curse') {
    if (!spell) return;
    for (const f of foes) {
      const value = (s.effect.value ?? 0.2) * (1 + (side === 'team' ? mods.cursePct || 0 : 0)) * (f.boss ? 0.5 : 1);
      f.status.curse = { value, turns: s.effect.turns ?? 2 };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: f.uid, kind: 'curse', value: Math.round(value * 100) / 100 });
    }
  } else if (s.effect.kind === 'revive') {
    if (!spell) return;
    const dead = [...allies.attaque, ...allies.support].filter((u) => !u.alive && !(u.status && u.status.reviving));
    if (dead.length) {
      const t = dead.sort((a, b) => b.maxHp - a.maxHp)[0];
      t.hp = Math.max(1, Math.round(t.maxHp * (s.effect.value ?? 0.5)));
      t.alive = true;
      events.push({ type: 'revive', side, sourceId: s.uid, targetId: t.uid, amount: t.hp });
    }
  } else if (s.effect.kind === 'link') {
    if (!spell) return;
    for (const u of allies.attaque.filter((u) => u.alive && u.linkedTo)) u.linkTtl = 2;
    const cands = allies.attaque.filter((u) => u.alive && !u.linkedTo);
    if (cands.length >= 2) {
      const [a, b] = cands;
      a.linkedTo = b.uid; a.linkTtl = 2;
      b.linkedTo = a.uid; b.linkTtl = 2;
      events.push({ type: 'status', side, sourceId: s.uid, targetId: a.uid, kind: 'link', value: b.uid });
    }
  }
}
