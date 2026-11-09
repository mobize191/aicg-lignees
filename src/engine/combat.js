// src/engine/combat.js : extrait du monolithe (phase 0, comportement inchange)

function makeUnit(card, uid = card.id, level = null) {
  
  
  const lvl = level ?? card.level ?? 1;
  const m = 1 + LEVEL_BONUS * (lvl - 1);
  const cm = classeMods(card);
  const cranPct = cranPctOfRace(raceOfCard(card));
  const u = {
    uid, cardId: card.id, name: card.name, rarity: card.rarity,
    classe: card.classe, element: card.element, role: card.role, race: raceOfCard(card),
    cranPct,
    atk: Math.max(1, Math.round(card.atk * m * (1 + cm.atkPct) * (1 + cranPct / 100))),
    hp: Math.max(1, Math.round(card.hp * m * (1 + cm.hpPct) * (1 + cranPct / 100))),
    maxHp: Math.max(1, Math.round(card.hp * m * (1 + cm.hpPct) * (1 + cranPct / 100))),
    agi: Math.max(1, Math.round((card.agi ?? Math.round(card.atk * M.AGI_RATIO)) * m * (1 + cranPct / 100))),
    int: Math.max(1, Math.round((card.int ?? Math.round(card.atk * M.INT_RATIO)) * m * (1 + cranPct / 100))),
    level: lvl,
    shield: 0, atkBuff: 0, alive: true,
    effect: card.effect ? { ...card.effect } : null,
    spells: (card.spells ?? []).map((s) => ({ ...s })),
    crossName: card.soloSpell ?? null,
    mana: Math.round((card.mana ?? SOLO_MANA.max) * M.MANA_START_RATIO),
    manaMax: card.mana ?? SOLO_MANA.max,
    manaRegen: (card.manaRegen ?? 2) + (card.gimmick === 'prestige' ? 2 : 0),
    boss: !!card.boss,
    final: !!card.final,
    gimmick: card.gimmick ?? null,
    ronde: 0,
    status: card.effect && card.effect.kind === 'copy' ? { copy: { spell: null, expiry: 0 } } : {},
    linkedTo: null,
    linkTtl: 0,
  };
  if (card.phoenix) u.status.phoenix = { ...card.phoenix };
  return u;
}

function teamModifiers(units) {
  const tiers = activeTiers(units);
  const mods = { tiers };
  for (const [type, tier] of tiers) {
    for (const [k, v] of Object.entries(SYNERGIES[type][tier])) {
      if (k === 'desc') continue;
      if (typeof v === 'boolean') mods[k] = mods[k] || v;
      else mods[k] = (mods[k] ?? 0) + v;
    }
  }
  
  const divines = units.filter((u) => u && u.race === 'divine');
  if (divines.length >= 2) {
    mods.dmgPct = (mods.dmgPct ?? 0) + M.DIVINE_PAIR_BONUS;
    mods.healPct = (mods.healPct ?? 0) + M.DIVINE_PAIR_BONUS;
  }
  return mods;
}

function levelFor(levels, id, i) {
  void i;
  const lv = levels ? levels[id] : undefined;
  return Number.isFinite(lv) && lv >= 1 ? Math.floor(lv) : 1;
}

function initCombat(teamCards, enemyCards, seed, levels = {}) {
  const team = {
    attaque: teamCards.attaque.map((c, i) => makeUnit(c, `${c.id}.a${i}`, c.level ?? levelFor(levels, c.id, i))),
    support: teamCards.support.map((c, i) => makeUnit(c, `${c.id}.s${i}`, c.level ?? levelFor(levels, c.id, i))),
  };
  const flat = Array.isArray(enemyCards)
    ? enemyCards
    : [...(enemyCards.attaque ?? []), ...(enemyCards.support ?? [])];
  const enemies = {
    attaque: flat.filter((c) => c.role !== 'support').map((c, i) => makeUnit({ ...c }, `e.a${i}`)),
    support: flat.filter((c) => c.role === 'support').map((c, i) => makeUnit({ ...c }, `e.s${i}`)),
  };
  const all = [...team.attaque, ...team.support];
  const mods = teamModifiers(all);
  if (mods.hpPct) {
    for (const u of all) {
      const bonus = Math.round(u.maxHp * mods.hpPct);
      u.maxHp += bonus;
      u.hp += bonus;
    }
  }
  if (mods.shieldPct) for (const u of all) u.shield = Math.round(u.maxHp * mods.shieldPct);
  for (const u of all) {
    if (u.gimmick === 'cale') u.shield += Math.round(u.maxHp * M.GIMMICK_CALE_SHIELD);
    if (u.gimmick === 'litiere') for (const a of all) a.shield += Math.round(a.maxHp * M.GIMMICK_LITIERE_SHIELD);
  }
  return { rng: mulberry32(seed), turn: 0, team, enemies, mods, winner: null };
}

function applyDamage(target, dmg, events, side, reviveCtx = null, isHit = false) {
  let rest = dmg;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, rest);
    target.shield -= absorbed;
    rest -= absorbed;
    
    
    
    
    if (absorbed > 0) events.push({ type: 'block', side, targetId: target.uid, amount: absorbed });
  }
  target.hp -= rest;
  events.push({ type: 'damage', side, targetId: target.uid, amount: rest });
  if (rest <= 0) return false;
  if (isHit && target.alive) {
    const shieldOnHit = classeMods(target).shieldOnHit;
    if (shieldOnHit > 0) {
      const amount = Math.round(target.maxHp * shieldOnHit);
      target.shield += amount;
      events.push({ type: 'shield', side, sourceId: target.uid, targetId: target.uid, amount, kind: 'passif' });
    }
  }
  if (target.hp <= 0) {
    target.hp = 0;
    target.alive = false;
    events.push({ type: 'ko', side, targetId: target.uid });
    const phx = target.status ? target.status.phoenix : null;
    if (reviveCtx && phx && phx.delay > 0
        && reviveCtx.allies.some((a) => a.uid !== target.uid && a.alive)) {
      target.status.reviving = phx.delay;
      events.push({ type: 'phoenix', side, targetId: target.uid, turns: phx.delay });
    }
    return true;
  }
  return false;
}

function tickStatuses(state, events) {
  const groups = [
    ['team', state.team.attaque, state.team.support],
    ['enemies', state.enemies.attaque, state.enemies.support],
  ];
  for (const [side, arrA, arrS] of groups) {
    const units = [...arrA, ...arrS];
    for (const u of units) {
      const st = u.status;
      if (!st) continue;
      const others = () => units.filter((x) => x.uid !== u.uid);
      if (st.reviving) {
        st.reviving -= 1;
        if (st.reviving <= 0) {
          delete st.reviving;
          u.hp = Math.max(1, Math.round(u.maxHp * M.PHOENIX_REVIVE_RATIO));
          u.alive = true;
          events.push({ type: 'revive', side, targetId: u.uid, amount: u.hp });
        }
      }
      if (!u.alive) continue;
      if (st.dot) {
        const d = st.dot;
        const amount = Math.max(1, Math.round(d.dmg));
        events.push({ type: 'dot', side, targetId: u.uid, amount });
        applyDamage(u, amount, events, side, { allies: others() });
        d.turns -= 1;
        if (d.turns <= 0) delete st.dot;
      }
      if (st.copy && st.copy.spell) {
        st.copy.expiry -= 1;
        if (st.copy.expiry <= 0) st.copy.spell = null;
      }
      if (st.dmgRed) {
        st.dmgRed.turns -= 1;
        if (st.dmgRed.turns <= 0) delete st.dmgRed;
      }
      if (st.reflect) {
        st.reflect.turns -= 1;
        if (st.reflect.turns <= 0) delete st.reflect;
      }
      if (st.slow) {
        st.slow -= 1;
        if (st.slow <= 0) delete st.slow;
      }
      if (st.curse) {
        st.curse.turns -= 1;
        if (st.curse.turns <= 0) delete st.curse;
      }
      if (st.ttl) {
        st.ttl -= 1;
        if (st.ttl <= 0 && u.alive) {
          u.alive = false;
          u.hp = 0;
          events.push({ type: 'expire', side, targetId: u.uid });
        }
      }
      if (u.linkTtl) {
        u.linkTtl -= 1;
        if (u.linkTtl <= 0) {
          u.linkedTo = null;
          u.linkTtl = 0;
        }
      }
    }
  }
}

function beginRound(state) {
  const events = [];
  state.turn += 1;
  events.push({ type: 'turn', n: state.turn });
  tickStatuses(state, events);
  const { team, enemies, mods } = state;
  const rage = state.turn > M.RAGE_TURN ? 1 + M.RAGE_RATE * (state.turn - M.RAGE_TURN) : 1;
  const alive = (arr) => arr.filter((u) => u.alive);
  const enemyAll = () => alive([...enemies.attaque, ...enemies.support]);
  const teamAll = () => alive([...team.attaque, ...team.support]);
  const reduction = (side) => (side === 'team' ? Math.min(DMG_REDUCTION_MAX, mods.dmgReduction || 0) : 0);
  const ctx = { state, events, rage, alive, enemyAll, teamAll, reduction, frontEmpty: false, firstAttack: true, finish: null };
  const finish = (winner) => { state.winner = winner; ctx.events.push({ type: 'end', winner }); return ctx.events; };
  ctx.finish = finish;
  if (mods.regen) {
    for (const u of teamAll()) {
      const amount = Math.min(Math.round(u.maxHp * mods.regen), u.maxHp - u.hp);
      if (amount > 0) {
        u.hp += amount;
        events.push({ type: 'heal', side: 'team', sourceId: 'regen', targetId: u.uid, amount });
      }
    }
  }
  if (teamAll().some((u) => u.gimmick === 'ronde')) {
    for (const u of teamAll()) u.ronde = (u.ronde ?? 0) + 1;
  }
  const frontEmpty = alive(team.attaque).length === 0;
  ctx.frontEmpty = frontEmpty;
  const strikers = frontEmpty ? [...team.support] : [...team.attaque];
  const eFrontEmpty = alive(enemies.attaque).length === 0;
  const eStrikers = eFrontEmpty ? [...enemies.support] : [...enemies.attaque];
  const items = [];
  strikers.forEach((u, i) => { if (u.alive) items.push({ u, side: 'team', kind: 'strike', idx: i }); });
  team.support.forEach((s, si) => { if (s.alive) items.push({ u: s, side: 'team', kind: 'support', idx: si }); });
  eStrikers.forEach((e, ei) => { if (e.alive) items.push({ u: e, side: 'enemies', kind: 'strike', idx: ei }); });
  enemies.support.forEach((es, si) => { if (es.alive) items.push({ u: es, side: 'enemies', kind: 'support', idx: si }); });
  items.sort((a, b) => (b.u.agi - a.u.agi) || (a.side === b.side ? 0 : (a.side === 'team' ? -1 : 1)));
  state.round = { items, i: 0, ctx };
  return events;
}

function peekRound(state) {
  const r = state.round;
  if (!r) return null;
  const ctx = r.ctx;
  while (r.i < r.items.length) {
    const it = r.items[r.i];
    if (!it.u.alive) { r.i += 1; continue; }
    if (it.side === 'team' && it.kind === 'strike' && !ctx.enemyAll().length) { r.i += 1; continue; }
    if (it.side === 'enemies' && it.kind === 'strike' && !ctx.teamAll().length) { r.i += 1; continue; }
    return it;
  }
  return null;
}

function actTeamStriker(u, i, ctx, step) {
  const { team, enemies, mods } = ctx.state;
  const tacAct = step && step.tacAct ? step.tacAct : null;
  const foes = ctx.enemyAll();
  if (!foes.length) return false;
  if (u.status && u.status.stun > 0) {
    ctx.events.push({ type: 'status', side: 'team', targetId: u.uid, kind: 'stun', value: u.status.stun });
    u.status.stun -= 1;
    if (u.status.stun <= 0) delete u.status.stun;
    return false;
  }
  if (tacAct && tacAct.kind === 'pass') {
    u.mana = Math.min(u.manaMax, u.mana + u.manaRegen);
    ctx.events.push({ type: 'status', side: 'team', targetId: u.uid, kind: 'tactical', value: 'attente' });
    return false;
  }
  if (tacAct && tacAct.kind === 'cross') {
    u.mana = Math.min(u.manaMax, u.mana + u.manaRegen);
    if (u.mana >= CROSS.attaque.cost) {
      u.mana -= CROSS.attaque.cost;
      const wounded2 = ctx.teamAll().filter((a) => a.hp < a.maxHp).sort((a, b) => a.hp - b.hp);
      const t = (tacAct.allyUid && wounded2.find((a) => a.uid === tacAct.allyUid)) ?? wounded2[0];
      ctx.events.push({ type: 'cast', side: 'team', sourceId: u.uid, name: CROSS.attaque.name, fx: 'heal', mana: u.mana });
      if (t) {
        const amount = Math.min(Math.round(u.atk * CROSS.yield * (1 + (mods.healPct || 0))), t.maxHp - t.hp);
        if (amount > 0) {
          t.hp += amount;
          ctx.events.push({ type: 'heal', side: 'team', sourceId: u.uid, targetId: t.uid, amount, kind: 'special' });
        }
      }
    } else {
      ctx.events.push({ type: 'status', side: 'team', targetId: u.uid, kind: 'tactical', value: 'mana' });
    }
    if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
    return false;
  }
  if (!tacAct && u.role === 'attaque') {
    const wounded = ctx.teamAll().filter((a) => a.hp < a.maxHp * CROSS.healThreshold).sort((a, b) => a.hp - b.hp);
    if (wounded.length && u.mana + u.manaRegen >= CROSS.attaque.cost) {
      u.mana = Math.min(u.manaMax, u.mana + u.manaRegen) - CROSS.attaque.cost;
      const t = wounded[0];
      ctx.events.push({ type: 'cast', side: 'team', sourceId: u.uid, name: CROSS.attaque.name, fx: 'heal', mana: u.mana });
      const amount = Math.min(Math.round(u.atk * CROSS.yield * (1 + (mods.healPct || 0))), t.maxHp - t.hp);
      if (amount > 0) {
        t.hp += amount;
        ctx.events.push({ type: 'heal', side: 'team', sourceId: u.uid, targetId: t.uid, amount, kind: 'special' });
      }
      ctx.firstAttack = false;
      return false;
    }
  }
  let spell = null;
  if (!mods.aoe || !ctx.firstAttack) {
    if (tacAct && tacAct.kind === 'spell') {
      u.mana = Math.min(u.manaMax, u.mana + u.manaRegen);
      const cand = (u.spells ?? [])[tacAct.idx ?? 0];
      if (cand && cand.cost <= u.mana) {
        spell = cand;
        u.mana -= cand.cost;
      } else {
        ctx.events.push({ type: 'status', side: 'team', targetId: u.uid, kind: 'tactical', value: 'mana' });
      }
    } else if (tacAct && tacAct.kind === 'attack') {
      u.mana = Math.min(u.manaMax, u.mana + u.manaRegen);
    } else {
      const cp = u.status ? u.status.copy : null;
      if (cp && !cp.spell && ctx.state.lastEnemySpell) {
        cp.spell = { ...ctx.state.lastEnemySpell };
        cp.expiry = 2;
        ctx.events.push({ type: 'status', side: 'team', targetId: u.uid, kind: 'copy', value: cp.spell.name });
      }
      if (cp && cp.spell) {
        spell = cp.spell;
        cp.spell = null;
      } else {
        spell = pickSpell(u);
      }
    }
  }
  if (spell) {
    ctx.events.push({ type: 'cast', side: 'team', sourceId: u.uid, name: spell.name, big: !!spell.big || spell.cost >= 5, fx: 'atk', mana: u.mana });
  }
  if (spell && u.classe === 'Invocateur' && u.effect && u.effect.kind === 'summon') {
    if (castSummon(u, team, mods, ctx.events, 'team')) {
      ctx.firstAttack = false;
      return false;
    }
  }
  const cSelf = u.status && u.status.curse ? u.status.curse.value : 0;
  let dmg = Math.max(1, Math.round(u.atk * (1 + (mods.atkPct || 0) + u.atkBuff) * (1 + (mods.dmgPct || 0)) * (spell ? spell.mult : classeMods(u).strike) * (1 - cSelf) * ctx.rage));
  u.atkBuff = 0;
  if (u.ronde) dmg = Math.max(1, Math.round(dmg * (1 + M.RONDE_RATE * Math.min(u.ronde, M.RONDE_CAP))));
  if (u.gimmick === 'belier' && !u.belierUsed) {
    dmg = Math.max(1, Math.round(dmg * M.BELIER_BOOST));
    u.belierUsed = true;
  }
  const kind = spell ? 'special' : 'basic';
  if (mods.aoe && ctx.firstAttack) {
    ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: 'all', amount: dmg, kind, mana: u.mana, elem: null, side: 'team' });
    for (const f of [...foes]) {
      applyDamage(f, Math.max(1, Math.round(dmg * mods.aoe * elementMult(u.element, f.element))), ctx.events, 'enemies');
    }
    ctx.firstAttack = false;
    if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
    return false;
  }
  if (u.gimmick === 'carrousel' && ctx.state.rng() < M.CARROUSEL_CHANCE) {
    ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: 'all', amount: dmg, kind, mana: u.mana, elem: null, side: 'team' });
    for (const f of [...foes]) applyDamage(f, Math.max(1, Math.round(dmg * M.CARROUSEL_SPLASH)), ctx.events, 'enemies');
    if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
    ctx.firstAttack = false;
    return false;
  }
  if (!spell && classeMods(u).wave) {
    ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: 'all', amount: dmg, kind, mana: u.mana, elem: null, side: 'team' });
    for (const f of [...foes]) {
      applyDamage(f, Math.max(1, Math.round(dmg * elementMult(u.element, f.element))), ctx.events, 'enemies', null, true);
    }
    if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
    ctx.firstAttack = false;
    return false;
  }
  const idx = !ctx.frontEmpty && step && step.targetIdx !== null && step.targetIdx !== undefined ? step.targetIdx : null;
  const target = idx !== null && enemies.attaque[idx]?.alive ? enemies.attaque[idx] : foes[0];
  if (mods.weakBonus && target === foes.reduce((a, b) => (a.hp <= b.hp ? a : b))) {
    dmg = Math.round(dmg * (1 + mods.weakBonus));
  }
  const cmU = classeMods(u);
  if (cmU.exec && target.hp < target.maxHp * cmU.execBelow) {
    dmg = Math.max(1, Math.round(dmg * (1 + cmU.exec)));
    ctx.events.push({ type: 'status', side: 'enemies', targetId: target.uid, kind: 'exec', value: cmU.exec });
  }
  const elem = elementTag(u.element, target.element);
  dmg = Math.max(1, Math.round(dmg * elementMult(u.element, target.element)));
  const slowed = foes.some((f) => f.status && f.status.slow > 0);
  const hits = (mods.doubleChance && ctx.state.rng() < mods.doubleChance) || slowed ? 2 : 1;
  for (let h = 0; h < hits; h++) {
    if (!target.alive) break;
    if (classeMods(target).dodge && ctx.state.rng() < classeMods(target).dodge) {
      ctx.events.push({ type: 'dodge', side: 'enemies', targetId: target.uid });
      break;
    }
    ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: target.uid, amount: dmg, kind, mana: u.mana, elem, side: 'team' });
    applyDamage(target, dmg, ctx.events, 'enemies', { allies: foes }, true);
    if (target.alive && spell && spell.dot) {
      target.status.dot = { dmg: Math.max(1, Math.round(dmg * (spell.dot.pct ?? M.DOT_DEFAULT_PCT))), turns: spell.dot.turns ?? 2 };
      ctx.events.push({ type: 'status', side: 'enemies', targetId: target.uid, kind: 'dot', value: target.status.dot.dmg });
    }
    if (target.alive && target.status && target.status.reflect && dmg > 0) {
      const back = Math.max(1, Math.round(dmg * target.status.reflect.pct));
      ctx.events.push({ type: 'attack', sourceId: target.uid, targetId: u.uid, amount: back, kind: 'special', mana: target.mana, elem: null, side: 'enemies' });
      applyDamage(u, back, ctx.events, 'team', { allies: ctx.teamAll() });
    }
  }
  if (!spell && cmU.splash) {
    const ratio = cmU.splash / cmU.strike;
    const others = ctx.enemyAll().filter((f) => f !== target && f.alive);
    for (const f of others) {
      const half = Math.max(1, Math.round(dmg * ratio));
      ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: f.uid, amount: half, kind, mana: u.mana, elem: elementTag(u.element, f.element), side: 'team' });
      applyDamage(f, Math.max(1, Math.round(half * elementMult(u.element, f.element))), ctx.events, 'enemies', null, true);
    }
  }
  if (u.gimmick === 'volee') {
    const others = ctx.enemyAll().filter((f) => f !== target && f.alive);
    if (others.length) {
      const t2 = others[0];
      const half = Math.max(1, Math.round(dmg * M.BELIER_SPLASH));
      ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: t2.uid, amount: half, kind, mana: u.mana, elem: elementTag(u.element, t2.element), side: 'team' });
      applyDamage(t2, Math.max(1, Math.round(half * elementMult(u.element, t2.element))), ctx.events, 'enemies');
    }
  }
  if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
  ctx.firstAttack = false;
  return false;
}

function actTeamSupport(s, ctx, step) {
  if (!s.alive) return;
  const supAct = step && step.tacAct ? step.tacAct : null;
  applySupport(s, ctx.state.team, ctx.state.mods, ctx.events, 'team', ctx.enemyAll(), null, supAct);
}

function enemyPickTarget(e, targets, dmgBase) {
  const score = (t) => {
    const dmg = Math.max(1, Math.round(dmgBase * elementMult(e.element, t.element)));
    let s = 0;
    if (t.hp <= dmg) s += M.TARGET_KILL_BONUS;
    if (elementTag(e.element, t.element) === 'fort') s += M.ELEMENT_ADVANTAGE_BONUS;
    return s - t.hp;
  };
  return targets.reduce((a, b) => (score(b) > score(a) ? b : a), targets[0]);
}

function actEnemyStriker(e, ctx) {
  const { team, enemies, mods } = ctx.state;
  if (e.status && e.status.stun > 0) {
    ctx.events.push({ type: 'status', side: 'enemies', targetId: e.uid, kind: 'stun', value: e.status.stun });
    e.status.stun -= 1;
    if (e.status.stun <= 0) delete e.status.stun;
    return false;
  }
  const targets = ctx.alive(team.attaque).length ? ctx.alive(team.attaque) : ctx.alive(team.support);
  if (!targets.length) return false;
  const spell = pickSpell(e);
  if (spell) {
    ctx.events.push({ type: 'cast', side: 'enemies', sourceId: e.uid, name: spell.name, big: !!spell.big, fx: 'atk', mana: e.mana });
    ctx.state.lastEnemySpell = { name: spell.name, mult: spell.mult, cost: spell.cost, big: !!spell.big };
  }
  const cmE = classeMods(e);
  if (spell && e.classe === 'Invocateur' && e.effect && e.effect.kind === 'summon') {
    if (castSummon(e, enemies, {}, ctx.events, 'enemies')) {
      return false;
    }
  }
  const belierBoost = e.gimmick === 'belier' && !e.belierUsed ? M.BELIER_BOOST : 1;
  if (belierBoost > 1) e.belierUsed = true;
  const eCurse = e.status && e.status.curse ? e.status.curse.value : 0;
  const dmgBase = Math.max(1, Math.round(e.atk * (1 - ctx.reduction('team')) * (spell ? spell.mult : cmE.strike) * (1 - eCurse) * ctx.rage * belierBoost));
  const kind = spell ? 'special' : 'basic';
  const target = enemyPickTarget(e, targets, dmgBase);
  const gRed = Math.min(DMG_REDUCTION_MAX, mods.dmgReduction || 0);
  const tRed = target.status && target.status.dmgRed ? target.status.dmgRed.pct : 0;
  const redFactor = gRed >= DMG_REDUCTION_MAX ? 1
    : Math.max(0, (1 - Math.min(DMG_REDUCTION_MAX, gRed + tRed)) / (1 - gRed));
  const dmg = Math.max(1, Math.round(dmgBase * redFactor * elementMult(e.element, target.element)));
  const eHits = targets.some((t) => t.status && t.status.slow > 0) ? 2 : 1;
  let dmgFinal = dmg;
  let died = false;
  if (!spell && cmE.wave) {
    for (const t of targets.filter((t) => t !== target)) {
      if (!t.alive) continue;
      const tRed2 = t.status && t.status.dmgRed ? t.status.dmgRed.pct : 0;
      const rf2 = gRed >= DMG_REDUCTION_MAX ? 1
        : Math.max(0, (1 - Math.min(DMG_REDUCTION_MAX, gRed + tRed2)) / (1 - gRed));
      const d2 = Math.max(1, Math.round(dmgBase * rf2 * elementMult(e.element, t.element)));
      ctx.events.push({ type: 'attack', sourceId: e.uid, targetId: t.uid, amount: d2, kind, mana: e.mana, elem: elementTag(e.element, t.element), side: 'enemies' });
      died = applyDamage(t, d2, ctx.events, 'team', { allies: ctx.teamAll() }, true) || died;
      if (t.alive && t.status && t.status.reflect && d2 > 0) {
        const back = Math.max(1, Math.round(d2 * t.status.reflect.pct));
        ctx.events.push({ type: 'attack', sourceId: t.uid, targetId: e.uid, amount: back, kind: 'special', mana: t.mana, elem: null, side: 'team' });
        applyDamage(e, back, ctx.events, 'enemies', { allies: ctx.enemyAll() });
      }
    }
  }
  if (cmE.exec && target.hp < target.maxHp * cmE.execBelow) {
    dmgFinal = Math.max(1, Math.round(dmg * (1 + cmE.exec)));
    ctx.events.push({ type: 'status', side: 'team', targetId: target.uid, kind: 'exec', value: cmE.exec });
  }
  for (let h = 0; h < eHits && target.alive; h++) {
    if (classeMods(target).dodge && ctx.state.rng() < classeMods(target).dodge) {
      ctx.events.push({ type: 'dodge', side: 'team', targetId: target.uid });
      break;
    }
    ctx.events.push({ type: 'attack', sourceId: e.uid, targetId: target.uid, amount: dmgFinal, kind, mana: e.mana, elem: elementTag(e.element, target.element), side: 'enemies' });
    if (target.gimmick === 'voile' && ctx.state.rng() < M.VOILE_CHANCE) {
      ctx.events.push({ type: 'cast', side: 'team', sourceId: target.uid, name: 'Voile de Brume', fx: 'heal', mana: target.mana });
    } else {
      const partner = target.linkedTo ? ctx.teamAll().find((a) => a.uid === target.linkedTo) : null;
      if (partner) {
        const half = Math.max(1, Math.round(dmgFinal / 2));
        ctx.events.push({ type: 'link', side: 'team', sourceId: target.uid, targetId: partner.uid, amount: half });
        died = applyDamage(target, dmgFinal - half, ctx.events, 'team', { allies: ctx.teamAll() }, true) || died;
        applyDamage(partner, half, ctx.events, 'team', { allies: ctx.teamAll() }, true);
      } else {
        died = applyDamage(target, dmgFinal, ctx.events, 'team', { allies: ctx.teamAll() }, true) || died;
      }
      if (target.alive && target.status && target.status.reflect && dmgFinal > 0) {
        const back = Math.max(1, Math.round(dmgFinal * target.status.reflect.pct));
        ctx.events.push({ type: 'attack', sourceId: target.uid, targetId: e.uid, amount: back, kind: 'special', mana: target.mana, elem: null, side: 'team' });
        applyDamage(e, back, ctx.events, 'enemies', { allies: ctx.enemyAll() });
      }
      if (target.alive && target.gimmick === 'mirage' && dmg > 0) {
        const reflet = Math.max(1, Math.round(dmg * M.REFLECT_SHARE));
        ctx.events.push({ type: 'attack', sourceId: target.uid, targetId: e.uid, amount: reflet, kind: 'basic', mana: target.mana, elem: null, side: 'team' });
        applyDamage(e, reflet, ctx.events, 'enemies');
      }
    }
  }
  if (died && target.gimmick === 'benediction') {
    for (const u of ctx.teamAll()) {
      const amount = Math.min(Math.round(u.maxHp * M.BENEDICTION_HEAL), u.maxHp - u.hp);
      if (amount > 0) {
        u.hp += amount;
        ctx.events.push({ type: 'heal', side: 'team', sourceId: target.uid, targetId: u.uid, amount, kind: 'special' });
      }
    }
  }
  if (!ctx.teamAll().length) { ctx.finish('enemies'); return true; }
  if (died && mods.vengeance) {
    for (const u of ctx.teamAll().filter((x) => x.role === 'attaque')) {
      u.atk = Math.round(u.atk * (1 + mods.vengeance));
    }
    ctx.events.push({ type: 'vengeance', value: mods.vengeance });
  }
  return false;
}

function actEnemySupport(es, ctx) {
  if (!es.alive) return;
  applySupport(es, ctx.state.enemies, {}, ctx.events, 'enemies', ctx.teamAll(), ctx.state);
}

function stepRound(state, stepChoice = null) {
  const r = state.round;
  if (!r) return { events: [], done: true };
  const ctx = r.ctx;
  const it = peekRound(state);
  if (!it) {
    const ev = [];
    if (!ctx.enemyAll().length && !state.winner) { state.winner = 'team'; ev.push({ type: 'end', winner: 'team' }); }
    else if (!ctx.teamAll().length && !state.winner) { state.winner = 'enemies'; ev.push({ type: 'end', winner: 'enemies' }); }
    state.round = null;
    return { events: ev, done: true };
  }
  r.i += 1;
  ctx.events = [];
  let tacAct = null;
  let targetIdx = null;
  if (stepChoice) {
    tacAct = { kind: stepChoice.kind, idx: stepChoice.idx, allyUid: stepChoice.allyUid };
    if (stepChoice.targetIdx !== null && stepChoice.targetIdx !== undefined) targetIdx = stepChoice.targetIdx;
    else if (stepChoice.targetUid != null) {
      const ti = state.enemies.attaque.findIndex((x) => x.uid === stepChoice.targetUid);
      if (ti >= 0) targetIdx = ti;
    }
  }
  const step = { tacAct, targetIdx };
  let done = false;
  if (it.side === 'team' && it.kind === 'strike') done = actTeamStriker(it.u, it.idx, ctx, step);
  else if (it.side === 'team' && it.kind === 'support') actTeamSupport(it.u, ctx, step);
  else if (it.side === 'enemies' && it.kind === 'strike') done = actEnemyStriker(it.u, ctx);
  else actEnemySupport(it.u, ctx);
  if (state.winner) done = true;
  if (r.i >= r.items.length) {
    done = true;
    if (!state.winner) {
      if (!ctx.enemyAll().length) { state.winner = 'team'; ctx.events.push({ type: 'end', winner: 'team' }); }
      else if (!ctx.teamAll().length) { state.winner = 'enemies'; ctx.events.push({ type: 'end', winner: 'enemies' }); }
    }
  }
  if (done) state.round = null;
  return { events: ctx.events, done };
}

function resolveTurn(state, choices = null) {
  const events = beginRound(state);
  let guard = 0;
  while (guard++ < 200) {
    const nxt = peekRound(state);
    let sc = null;
    if (choices && nxt) {
      if (nxt.side === 'team' && nxt.kind === 'strike' && choices.actions) {
        const a = choices.actions[nxt.idx] ?? null;
        const t = choices.targets ? (choices.targets[nxt.idx] ?? null) : null;
        sc = a ? { kind: a.kind, idx: a.idx, allyUid: a.allyUid, targetIdx: t } : null;
      } else if (nxt.side === 'team' && nxt.kind === 'support' && choices.support) {
        sc = choices.support[nxt.idx] ?? null;
      }
    }
    const r = stepRound(state, sc);
    events.push(...r.events);
    if (r.done) break;
  }
  state.round = null;
  return events;
}

function playAuto(state, maxTurns = M.MAX_TURNS_AUTO) {
  const log = [];
  while (!state.winner && state.turn < maxTurns) {
    log.push(...resolveTurn(state, null));
  }
  return log;
}

function dungeonById(id) {
  return DUNGEONS.find((d) => d.id === id) ?? DUNGEONS[0];
}

function difficultyById(id) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[0];
}

function shardMult(count) {
  return 1 + SHARD_BONUS * (count ?? 0);
}

function shardPct(count) {
  return Math.round(SHARD_BONUS * (count ?? 0) * 100);
}

function stagesOf(dungeonId) {
  return dungeonById(dungeonId).floors;
}

function levelAt(stage, rarity = 'C', boss = false) {
  
  return 1 + Math.floor(M.LEVEL_STAGE_RATIO * (stage - 1)) + (RANK[rarity] ?? 0) + (boss ? 2 : 0);
}

function levelIn(dungeon, stage, rarity = 'C', boss = false) {
  return levelAt(stage, rarity, boss) + Math.round(dungeon.tier * M.DUNGEON_TIER_LEVEL_MULT);
}

function hashSeed(seed, stage) {
  return (seed ^ Math.imul(stage, 0x9e3779b9)) >>> 0;
}

function wavePower(wave) {
  let p = 0;
  for (const u of [...wave.attaque, ...wave.support]) {
    p += (u.atk + u.hp) * (1 + LEVEL_BONUS * ((u.level ?? 1) - 1));
  }
  return p;
}

function spreadAt(stage) {
  if (stage <= 2) return 1;
  if (stage <= 4) return 2;
  return 3;
}

function makeWave(seed, stage, dungeonId = 'marees', diff = 1, runMod = null) {
  const rng = mulberry32(hashSeed(seed, stage));
  const dungeon = dungeonById(dungeonId);
  const DIFF = difficultyById(diff);
  const minRank = RANK[DIFF.minR];
  const capRank = Math.min(RANK[DIFF.mobCap], minRank + spreadAt(stage));
  const POOL_ATK = monstersOf(dungeon.id).attaque;
  const POOL_SUP = monstersOf(dungeon.id).support;
  const levelFor = (rarity, boss = false) => levelIn(dungeon, stage, rarity, boss);

  const poolOf = (pool, minR = minRank, maxR = capRank) => {
    const p = pool.filter((c) => RANK[c.rarity] >= minR && RANK[c.rarity] <= maxR);
    if (p.length) return p;
    const low = pool.filter((c) => RANK[c.rarity] >= minRank);
    return low.length ? low : pool;
  };
  const scaled = (pool, hpMult = 1, atkMult = 1, minR = minRank, maxR = capRank) => {
    const p = poolOf(pool, minR, maxR);
    const c = p[Math.floor(rng() * p.length)];
    const variance = M.WAVE_VAR_MIN + M.WAVE_VAR_SPAN * rng(); 
    return {
      ...c,
      level: levelFor(c.rarity),
      atk: Math.max(1, Math.round(c.atk * variance * atkMult)),
      hp: Math.max(1, Math.round(c.hp * variance * hpMult)),
    };
  };

  const isFinal = stage === dungeon.floors;
  const isBoss = DIFF.allBoss || stage % 5 === 0;
  let wave;
  if (isBoss) {
    const bossRarity = isFinal ? DIFF.boss10 : DIFF.boss5;
    const [hpMult, atkMult] = isFinal ? [M.FINAL_HP_MULT, M.FINAL_ATK_MULT] : stage % 5 === 0 ? [M.BOSS_HP_MULT, M.BOSS_ATK_MULT] : [M.ELITE_HP_MULT, M.ELITE_ATK_MULT];
    const boss = scaled(POOL_ATK, hpMult, atkMult, RANK[bossRarity], RANK[bossRarity]);
    boss.name = dungeon.bossNames?.[stage] ?? boss.name;
    boss.boss = true;
    boss.final = isFinal;
    boss.level = levelFor(boss.rarity, true);
    const minions = isFinal ? [scaled(POOL_ATK), scaled(POOL_ATK)] : [scaled(POOL_ATK)];
    const supports = isFinal ? [scaled(POOL_SUP), scaled(POOL_SUP)] : [scaled(POOL_SUP)];
    wave = { attaque: [boss, ...minions], support: supports };
  } else {
  const n = 2 + (rng() > M.WAVE_EXTRA_CHANCE ? 1 : 0);
  const supCount = stage >= 2 && rng() > M.WAVE_SUP_CHANCE ? 1 : 0;
  wave = {
    attaque: Array.from({ length: n }, () => scaled(POOL_ATK)),
    support: Array.from({ length: supCount }, () => scaled(POOL_SUP)),
  };
  }

  
  let prev = stage - 1;
  if (prev >= 1) {
    const prevP = wavePower(makeWave(seed, prev, dungeonId, diff)) * M.WAVE_POWER_GROWTH;
    let guard = 0;
    while (wavePower(wave) <= prevP && guard++ < 200) {
      for (const u of [...wave.attaque, ...wave.support]) {
        u.atk = Math.max(1, Math.round(u.atk * M.WAVE_ATK_STEP));
        u.hp = Math.max(1, Math.round(u.hp * M.WAVE_HP_STEP));
      }
    }
  }
  
  if (runMod === 'horde') {
    wave.attaque.push(scaled(POOL_ATK));
  } else if (runMod === 'muraille') {
    for (const u of [...wave.attaque, ...wave.support]) u.hp = Math.max(1, Math.round(u.hp * M.RUNMOD_MURaille_HP));
  } else if (runMod === 'rage') {
    for (const u of [...wave.attaque, ...wave.support]) u.atk = Math.max(1, Math.round(u.atk * M.RUNMOD_RAGE_ATK));
  }
  return wave;
}

function makeDailyWave(seed, lvl = M.DAILY_LEVEL_DEFAULT) {
  const rng = mulberry32(hashSeed(seed, 5));
  const pool = monstersOf('divin');
  const pickN = (list, n) => {
    const copy = [...list];
    const out = [];
    while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
    return out;
  };
  const lv = Math.max(5, Math.floor(lvl));
  const variance = () => M.DAILY_VAR_MIN + M.DAILY_VAR_SPAN * rng();
  const scaled = (c, boss = false) => ({
    ...c,
    level: lv + (boss ? 2 : 0),
    atk: Math.max(1, Math.round(c.atk * variance())),
    hp: Math.max(1, Math.round(c.hp * variance())),
    boss,
  });
  const atks = pickN(pool.attaque, 3).map((c, i) => scaled(c, i === 0));
  const sups = pickN(pool.support, 2).map((c) => scaled(c));
  return { attaque: atks, support: sups };
}

function drawDailyCommon(rng = roll) {
  const r = rng();
  const race = r < M.DAILY_RACE_HUM ? 'humaine' : r < M.DAILY_RACE_MONSTRE ? 'monstre' : r < M.DAILY_RACE_MYSTIQUE ? 'mystique' : 'divine';
  
  let pool = CATALOG.filter((c) => c.rarity === 'C' && c.raciale && raceOfCard(c) === race && cardAvailable(c)); 
  if (!pool.length) pool = CATALOG.filter((c) => c.rarity === 'C' && c.raciale && raceOfCard(c) === 'humaine' && cardAvailable(c));
  const fallback = pool.length ? pool : CATALOG.filter((c) => c.rarity === 'C' && c.raciale && cardAvailable(c));
  return fallback[Math.floor(rng() * fallback.length)];
}

function rollRewardRarity(rng) {
  const x = rng();
  let acc = 0;
  for (const [r, p] of REWARD_TABLE) {
    acc += p;
    if (x < acc) return r;
  }
  return 'C';
}

function pickCard(rng, rarity) {
  const pool = CATALOG.filter((c) => c.rarity === rarity && !forgeOnly(c) && !c.monster && !c.archived);
  const fallback = CATALOG.filter((c) => c.rarity === 'C' && !forgeOnly(c) && !c.monster && !c.archived);
  const p = pool.length ? pool : fallback;
  return p[Math.floor(rng() * p.length)].id;
}

function stageRewards(seed, stage, pity = 0, dungeonId = 'marees', diff = 1) {
  const dungeon = dungeonById(dungeonId);
  const DIFF = difficultyById(diff);
  const rng = mulberry32((seed ^ Math.imul(stage * 31 + 7, 0x85ebca6b)) >>> 0);
  
  const boss = DIFF.allBoss || stage % 5 === 0;
  
  return { cards: [], boss, guaranteed: 0, monster: null, shard: null };
}

function rollRarity(rng, table) {
  const x = rng();
  let acc = 0;
  for (const [r, p] of table) {
    acc += p;
    if (x < acc) return r;
  }
  return table[table.length - 1][0];
}

function openDivineBooster(rng) {
  const pool = monstersOf('divin');
  const all = [...pool.attaque, ...pool.support];
  const pull = (table) => {
    const rarity = rollRarity(rng, table);
    const p = all.filter((c) => c.rarity === rarity);
    const fallback = all.filter((c) => RANK[c.rarity] >= RANK[rarity]);
    const q = p.length ? p : (fallback.length ? fallback : all);
    return { ...q[Math.floor(rng() * q.length)] };
  };
  return [
    pull(DIVINE_LOW_SLOT),
    pull(DIVINE_LOW_SLOT),
    pull(DIVINE_LOW_SLOT),
    pull(DIVINE_MID_SLOT),
    pull(DIVINE_TOP_SLOT),
  ];
}

// la zone (phase 3, EXI-P3-3) : 3 cibles contiguës sur 5, centre en auto, sans glissement
function pickZoneTargets(ligne, choix = null) {
  const largeur = 3;
  const debut = choix !== null
    ? Math.max(0, Math.min(choix, ligne.length - largeur))
    : Math.floor((ligne.length - largeur) / 2);
  return ligne.slice(debut, debut + largeur).filter((u) => u.hp > 0);
}
