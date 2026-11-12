// src/engine/spells.js : extrait du monolithe (phase 0, comportement inchange)

// refonte IA lot 2 : avec un contexte (état public : alliés, ennemis), le choix de sort lit la situation
// (soin si un allié est sous le seuil, contrôle/malus sur la menace, burst si un kill est possible,
// sinon le plus efficace au coût) avec hystérésis anti flip-flop. Sans contexte : chemin historique.
function pickSpell(u, ctx = null) {
  u.mana = Math.min(u.manaMax, u.mana + u.manaRegen);
  const affordable = (u.spells ?? []).filter((s) => s.cost <= u.mana);
  if (!affordable.length) return null;
  if (!ctx) {
    let best = null;
    for (const s of affordable) if (!best || s.cost > best.cost) best = s;
    if (u.spells.length > 1) {
      const top = u.spells[u.spells.length - 1];
      if (top.cost > u.mana && top.cost <= u.manaMax && top.cost <= u.mana + 2 * u.manaRegen) {
        return null;
      }
    }
    u.mana -= best.cost;
    return best;
  }
  const foes = (ctx.foes ?? []).filter((f) => f && f.alive);
  const allies = [...((ctx.allies ?? {}).avant ?? []), ...((ctx.allies ?? {}).arriere ?? [])].filter((x) => x && x.alive);
  const stat = statOf(u);
  const seuil = M.SPELL_HEAL_THRESHOLD;
  const hurtAlly = allies.some((a) => a.hp < a.maxHp * seuil);
  const killable = (s) => !!s.mult && foes.some((f) => f.hp <= Math.max(1, Math.round(stat * s.mult)));
  const score = (s) => {
    let sc = ((s.mult ?? 1) / s.cost) * 100;
    if (s.role === 'soin' && hurtAlly) sc += M.SPELL_HEAL_BONUS;
    if ((s.role === 'controle' || s.role === 'malus') && foes.length) sc += M.SPELL_CONTROL_BONUS;
    if (killable(s)) sc += M.SPELL_KILL_BONUS;
    return sc;
  };
  const ranked = affordable
    .map((s) => ({ item: s, score: score(s) }))
    .sort((a, b) => b.score - a.score);
  let best = ranked[0].item;
  const bestScore = ranked[0].score;
  const st = ctx.state ?? null;
  if (st) {
    const last = st.lastSpell ? st.lastSpell[u.uid] : null;
    const prev = last ? affordable.find((s) => s.name === last) : null;
    if (prev && score(prev) >= bestScore - M.SPELL_HYSTERESIS) best = prev;
    // lot 3 : profil de difficulté — une part des choix est volontairement sous-optimale
    const sub = st.iaProfile ? st.iaProfile.suboptimal ?? 0 : 0;
    if (sub > 0 && st.iaRng && ranked.length > 1 && st.iaRng() < sub) {
      best = ranked[1].item;
    }
    st.lastSpell = st.lastSpell ?? {};
    st.lastSpell[u.uid] = best.name;
  }
  if (u.spells.length > 1) {
    const top = u.spells[u.spells.length - 1];
    if (top.cost > u.mana && top.cost <= u.manaMax && top.cost <= u.mana + 2 * u.manaRegen) {
      return null;
    }
  }
  u.mana -= best.cost;
  return best;
}

// retour terrain (10/11) : un sort hostile (role degats/controle/malus ou cible ennemi/zone/tous)
// se resout sur les ennemis, meme lance depuis la ligne support : un sort est un sort
function foeFacingSpell(spell) {
  const sd = spellSideOf(spell);
  return sd === 'enemy' || sd === 'zone' || sd === 'all'
    || spell.role === 'degats' || spell.role === 'controle' || spell.role === 'malus';
}
// la frappe simple de la ligne support : stat principale au rendement de la classe,
// esquive derivee de l'ecart d'agilite et opposition d'element, comme la ligne d'attaque
function strikeFoe(s, foes, mods, events, side, st, targetUid = null) {
  const vivantes = foes.filter((f) => f.alive);
  const t = targetUid != null
    ? (vivantes.find((f) => f.uid === targetUid) ?? vivantes[0])
    : vivantes.reduce((a, b) => (a.hp <= b.hp ? a : b), vivantes[0]);
  if (!t) return;
  const foeSide = side === 'team' ? 'enemies' : 'team';
  const curse = s.status && s.status.curse ? s.status.curse.value : 0;
  const rage = st && st.turn > M.RAGE_TURN ? 1 + M.RAGE_RATE * (st.turn - M.RAGE_TURN) : 1;
  const dodgeT = Math.min(M.DODGE_CAP, (classeMods(t).dodge || 0) + Math.max(0, (s.agi - t.agi)) * M.DODGE_PER_AGI);
  if (st && st.rng && dodgeT > 0 && st.rng() < dodgeT) {
    events.push({ type: 'dodge', side: foeSide, sourceId: s.uid, targetId: t.uid });
    return;
  }
  const base = Math.max(1, Math.round(statOf(s) * (1 + (side === 'team' ? mods.atkPct || 0 : 0) + s.atkBuff)
    * (1 + (side === 'team' ? mods.dmgPct || 0 : 0)) * classeMods(s).strike * (1 - curse) * rage * rangAtkMult(st, side, s)));
  const crit = rollCrit(s, t, st && st.rng); // Lot 1 : apres l'esquive, frappe physique
  const dmg = Math.max(1, Math.round(base * elementMult(s.element, t.element) * (crit ? M.CRIT_MULT : 1)));
  events.push({ type: 'attack', sourceId: s.uid, targetId: t.uid, amount: dmg, kind: 'basic', mana: s.mana, elem: elementTag(s.element, t.element), side, ...(crit ? { crit: true } : {}) });
  applyDamage(t, dmg, events, foeSide, null, true, { state: st, crit });
  s.atkBuff = 0;
}
// le sort hostile lance depuis une ligne support : la fiche du sort (largeur, mult,
// taux, tours) pilote la resolution ; la stat principale du lanceur fait les degats
function castFoeSpell(s, spell, foes, mods, events, side, st, action = null) {
  const foeSide = side === 'team' ? 'enemies' : 'team';
  const foeLines = st ? (side === 'team' ? st.enemies : st.team) : null;
  const larg = Number(spell.largeur ?? largeurOfSpellName(spell.name)) || 1;
  const anchorUid = action && action.targetUid != null ? action.targetUid : null;
  const vivantes = foes.filter((f) => f.alive);
  const anchor = anchorUid != null
    ? (vivantes.find((f) => f.uid === anchorUid) ?? vivantes[0])
    : vivantes.reduce((a, b) => (a.hp <= b.hp ? a : b), vivantes[0]);
  if (!anchor) return;
  let hitList;
  if (larg >= 5) hitList = [...vivantes];
  else if (larg === 3) {
    let choix = null;
    if (anchorUid != null && st) {
      const ligne = foeLines ? (anchor && anchor.rang === 'arriere' ? foeLines.arriere : foeLines.avant) : [];
      const ai = ligne.findIndex((u) => u.uid === anchorUid);
      if (ai >= 0) choix = ai;
    }
    hitList = st && foeLines ? pickZoneTargets(anchor && anchor.rang === 'arriere' ? foeLines.arriere : foeLines.avant, choix) : [anchor];
  } else {
    hitList = [anchor];
    if (larg >= 2) hitList.push(...vivantes.filter((f) => f !== anchor).slice(0, larg - 1));
  }
  const curse = s.status && s.status.curse ? s.status.curse.value : 0;
  const rage = st && st.turn > M.RAGE_TURN ? 1 + M.RAGE_RATE * (st.turn - M.RAGE_TURN) : 1;
  for (const t of hitList) {
    if (!t.alive) continue;
    const dodgeT = Math.min(M.DODGE_CAP, (classeMods(t).dodge || 0) + Math.max(0, (s.agi - t.agi)) * M.DODGE_PER_AGI);
    if (st && st.rng && dodgeT > 0 && st.rng() < dodgeT) {
      events.push({ type: 'dodge', side: foeSide, sourceId: s.uid, targetId: t.uid });
      continue;
    }
    if (spell.mult) {
      const elSort = schoolElementOf(spell); // Lot B : opposition = école du sort contre élément inné de la cible
      const dmg = Math.max(1, Math.round(statOf(s) * spell.mult * (1 + (side === 'team' ? mods.dmgPct || 0 : 0)) * (1 - curse) * rage * rangAtkMult(st, side, s) * elementMult(elSort, t.element)));
      events.push({ type: 'attack', sourceId: s.uid, targetId: t.uid, amount: dmg, kind: 'special', mana: s.mana, elem: elementTag(elSort, t.element), side });
      applyDamage(t, dmg, events, foeSide, null, true, { state: st, zone: larg >= 3 });
      if (t.alive && t.status && t.status.reflect && dmg > 0) {
        const back = Math.max(1, Math.round(dmg * t.status.reflect.pct));
        events.push({ type: 'attack', sourceId: t.uid, targetId: s.uid, amount: back, kind: 'special', mana: t.mana, elem: null, side: foeSide });
        applyDamage(s, back, events, side, null, false, { state: st });
      }
    }
    if (spell.taux != null && t.alive && st && st.rng) {
      const seuil = seuilOf(t);
      if (st.rng() < spell.taux - seuil) {
        if (spell.role === 'malus') {
          const value = (s.effect && s.effect.kind === 'curse' ? (s.effect.value ?? M.CURSE_DEFAULT) : M.CURSE_DEFAULT);
          t.status.curse = { value, turns: spell.tours ?? 2 };
          events.push({ type: 'status', side, sourceId: s.uid, targetId: t.uid, kind: 'curse', value: Math.round(value * 100) / 100 });
        } else {
          t.status.stun = (t.status.stun ?? 0) + (spell.tours ?? 1);
          events.push({ type: 'status', side, sourceId: s.uid, targetId: t.uid, kind: 'stun', value: spell.tours ?? 1 });
        }
      }
    }
  }
}

function applySupport(s, allies, mods, events, side, foes = [], st = null, action = null) {
  
  let spell = null;
  if (action && action.kind === 'pass') {
    s.mana = Math.min(s.manaMax, s.mana + s.manaRegen);
    events.push({ type: 'status', side, targetId: s.uid, kind: 'tactical', value: 'attente' });
    return;
  } else if (action && action.kind === 'attack' && foes.length) {
    // retour terrain : la ligne support frappe aussi (frappe simple, ennemi designe ou plus faible)
    s.mana = Math.min(s.manaMax, s.mana + s.manaRegen);
    strikeFoe(s, foes, mods, events, side, st, action.targetUid ?? null);
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
    spell = pickSpell(s, { state: st, allies, foes, side });
  }
  if (st && spell && side === 'enemies') st.lastEnemySpell = { name: spell.name, mult: spell.mult, cost: spell.cost, big: !!spell.big };
  // correctifs v1.37 lot 6 : sort signature (cat 'unique') — en Tactique (action avec désignation),
  // la métadonnée dérivée des data pilote le camp ; en Auto (pas d'action) le comportement historique est conservé
  const sigMeta = (spell && spell.cat === 'unique' && action) ? signatureMetaOfUnit(s) : null;
  const sigSide = sigMeta && sigMeta.cible ? spellSideOf({ ...spell, ...sigMeta }) : null;
  const sigRole = sigMeta && sigMeta.role ? sigMeta.role : null;
  const hostileSig = sigSide === 'enemy' || sigSide === 'zone' || sigSide === 'all' || sigRole === 'degats' || sigRole === 'controle' || sigRole === 'malus';
  // retour terrain : un sort hostile se resout sur les ennemis, quelle que soit la ligne qui le lance
  if (spell && foes.length && (foeFacingSpell(spell) || (hostileSig && action.targetUid != null))) {
    events.push({ type: 'cast', side, sourceId: s.uid, name: spell.name, big: !!spell.big || spell.cost >= 5, fx: 'atk', mana: s.mana });
    castFoeSpell(s, spell, foes, mods, events, side, st, action);
    return;
  }
  // correctifs ciblage lot 3 + refonte IA lot 0 : un sort allié de lignée (soin/boost/bouclier)
  // depuis une carte sans effet se résout par son rôle, comme le T0.2 côté avant — en Tactique
  // (action présent, allié désigné) comme en Auto (soigne le plus blessé, buffer/bouclier l'avant).
  if (spell && !s.effect && !foeFacingSpell(spell) && !hostileSig) {
    const sd = spellSideOf(spell) ?? sigSide;
    const role = spell.role ?? sigRole;
    if ((sd === 'self' || sd === 'ally' || sd === 'team') && (role === 'soin' || role === 'boost' || role === 'bouclier')) {
      const alliesAlive = [...allies.avant, ...allies.arriere].filter((u) => u.alive);
      let t = s;
      if (sd === 'self') t = s;
      else if (action && action.allyUid) t = alliesAlive.find((x) => x.uid === action.allyUid) ?? t;
      else if (role === 'soin') t = [...alliesAlive].sort((a, b) => a.hp - b.hp)[0] ?? s;
      else t = allies.avant.filter((u) => u.alive)[0] ?? alliesAlive[0] ?? s;
      const big = !!spell.big || spell.cost >= 5;
      if (role === 'soin') {
        const amount = Math.min(Math.max(1, Math.round(statOf(s) * (spell.mult ?? 1))), Math.max(0, t.maxHp - t.hp));
        events.push({ type: 'cast', side, sourceId: s.uid, name: spell.name, big, fx: 'heal', mana: s.mana });
        if (amount > 0) {
          t.hp += amount;
          events.push({ type: 'heal', side, sourceId: s.uid, targetId: t.uid, amount, kind: 'special' });
        }
      } else if (role === 'bouclier') {
        const amount = Math.min(Math.round(statOf(s) * (spell.mult ?? 1)), Math.round(t.maxHp * M.HEAL_CAP_RATIO));
        events.push({ type: 'cast', side, sourceId: s.uid, name: spell.name, big, fx: 'atk', mana: s.mana });
        t.shield += amount;
        events.push({ type: 'shield', side, sourceId: s.uid, targetId: t.uid, amount, kind: 'special' });
      } else {
        const value = Math.max(0, (spell.mult ?? 1) - 1);
        events.push({ type: 'cast', side, sourceId: s.uid, name: spell.name, big, fx: 'atk', mana: s.mana });
        t.atkBuff = (t.atkBuff ?? 0) + value;
        events.push({ type: 'buff', side, sourceId: s.uid, targetId: t.uid, kind: 'atk', value, kindTag: 'special' });
      }
      return;
    }
  }
  const fx = s.effect ? s.effect.kind : 'heal';
  if (spell) {
    events.push({ type: 'cast', side, sourceId: s.uid, name: spell.name, big: !!spell.big || spell.cost >= 5, fx, mana: s.mana });
  }
  const mult = spell ? spell.mult : 1;
  const kind = spell ? 'special' : 'basic';
  const aliveAllies = [...allies.avant, ...allies.arriere].filter((u) => u.alive);
  const hurt = aliveAllies.filter((u) => u.hp < u.maxHp).sort((a, b) => a.hp - b.hp);
  if (action && action.allyUid) {
    const k = hurt.findIndex((u) => u.uid === action.allyUid);
    if (k > 0) hurt.unshift(hurt.splice(k, 1)[0]);
  }
  const n = side === 'team' && mods.dualSupport ? 2 : 1;
  
  
  
  
  
  
  const cap = (t) => Math.round(t.maxHp * M.HEAL_CAP_RATIO);
  const effKind = s.effect ? s.effect.kind : null;
  if (effKind === 'heal') {
    const value = Math.round(s.effect.value * (1 + (side === 'team' ? mods.healPct || 0 : 0)) * mult);
    for (const t of hurt.slice(0, n)) {
      const amount = Math.min(value, t.maxHp - t.hp);
      if (amount > 0) {
        t.hp += amount;
        events.push({ type: 'heal', side, sourceId: s.uid, targetId: t.uid, amount, kind });
        const p = t.linkedTo ? aliveAllies.find((a) => a.uid === t.linkedTo) : null;
        if (p) {
          const share = Math.min(Math.round(amount * M.LINK_SHARE), p.maxHp - p.hp);
          if (share > 0) {
            p.hp += share;
            events.push({ type: 'heal', side, sourceId: s.uid, targetId: p.uid, amount: share, kind: 'link' });
          }
        }
      }
    }
  } else if (effKind === 'atkBuff') {
    const value = s.effect.value * mult;
    for (const t of allies.avant.filter((u) => u.alive).slice(0, n)) {
      t.atkBuff += value;
      events.push({ type: 'buff', side, sourceId: s.uid, targetId: t.uid, kind: 'atk', value, kindTag: kind });
      const p = t.linkedTo ? aliveAllies.find((a) => a.uid === t.linkedTo) : null;
      if (p) {
        p.atkBuff += value * M.LINK_BUFF_SHARE;
        events.push({ type: 'buff', side, sourceId: s.uid, targetId: p.uid, kind: 'atk', value: value * M.LINK_BUFF_SHARE, kindTag: 'link' });
      }
    }
  } else if (effKind === 'shield') {
    const value = Math.round(s.effect.value * mult);
    for (const t of allies.avant.filter((u) => u.alive).slice(0, n)) {
      const amount = Math.min(value, cap(t));
      t.shield += amount;
      events.push({ type: 'shield', side, sourceId: s.uid, targetId: t.uid, amount, kind });
    }
  } else if (effKind === 'stun') {
    if (!spell) return;
    const count = s.effect.count ?? 1;
    for (const t of [...foes].sort((a, b) => b.atk - a.atk).slice(0, count)) {
      t.status.stun = (t.status.stun ?? 0) + 1;
      events.push({ type: 'status', side, sourceId: s.uid, targetId: t.uid, kind: 'stun', value: 1 });
    }
  } else if (effKind === 'slow') {
    if (!spell) return;
    for (const f of foes) {
      f.status.slow = Math.max(f.status.slow ?? 0, 2);
      events.push({ type: 'status', side, sourceId: s.uid, targetId: f.uid, kind: 'slow', value: 2 });
    }
  } else if (effKind === 'dot') {
    if (!spell) return;
    for (const f of foes) {
      f.status.dot = {
        dmg: Math.max(1, Math.round(s.atk * (s.effect.pct ?? M.DOT_EFFECT_DEFAULT) * mult)),
        turns: s.effect.turns ?? 2,
      };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: f.uid, kind: 'dot', value: f.status.dot.dmg });
    }
  } else if (effKind === 'reflect') {
    if (!spell) return;
    for (const t of aliveAllies) {
      t.status.reflect = { pct: s.effect.value ?? M.REFLECT_DEFAULT_PCT, turns: s.effect.turns ?? 2 };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: t.uid, kind: 'reflect', value: t.status.reflect.pct });
    }
  } else if (effKind === 'warcry') {
    if (!spell) return;
    const value = s.effect.value ?? M.WARCRY_DEFAULT;
    for (const t of allies.avant.filter((u) => u.alive)) {
      t.atkBuff += value;
      t.status.dmgRed = { pct: s.effect.red ?? M.DMGRED_DEFAULT, turns: 1 };
      events.push({ type: 'buff', side, sourceId: s.uid, targetId: t.uid, kind: 'atk', value, kindTag: kind });
    }
  } else if (effKind === 'summon') {
    if (!spell) return;
    castSummon(s, allies, mods, events, side);
  } else if (effKind === 'curse') {
    if (!spell) return;
    for (const f of foes) {
      const value = (s.effect.value ?? M.CURSE_DEFAULT) * (1 + (side === 'team' ? mods.cursePct || 0 : 0)) * (f.boss ? M.CURSE_BOSS_FACTOR : 1);
      f.status.curse = { value, turns: s.effect.turns ?? 2 };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: f.uid, kind: 'curse', value: Math.round(value * 100) / 100 });
    }
  } else if (effKind === 'revive') {
    if (!spell) return;
    const dead = [...allies.avant, ...allies.arriere].filter((u) => !u.alive && !(u.status && u.status.reviving));
    if (dead.length) {
      const t = dead.sort((a, b) => b.maxHp - a.maxHp)[0];
      t.hp = Math.max(1, Math.round(t.maxHp * (s.effect.value ?? M.REVIVE_DEFAULT)));
      t.alive = true;
      events.push({ type: 'revive', side, sourceId: s.uid, targetId: t.uid, amount: t.hp });
    }
  } else if (effKind === 'link') {
    if (!spell) return;
    for (const u of allies.avant.filter((u) => u.alive && u.linkedTo)) u.linkTtl = 2;
    const cands = allies.avant.filter((u) => u.alive && !u.linkedTo);
    if (cands.length >= 2) {
      const [a, b] = cands;
      a.linkedTo = b.uid; a.linkTtl = 2;
      b.linkedTo = a.uid; b.linkTtl = 2;
      events.push({ type: 'status', side, sourceId: s.uid, targetId: a.uid, kind: 'link', value: b.uid });
    }
  }
}

// grimoire à crans (phase 2) : la résolution lit les données, jamais de sort en dur
function getSchoolSpell(spellId) {
  return (DATA.grimoire?.ecole ?? []).find((s) => s.id === spellId) ?? null;
}
function getEntree(spellId) {
  return (DATA.grimoire?.entrees ?? []).find((s) => s.id === spellId) ?? null;
}
function getSpellDef(spellId) {
  return getSchoolSpell(spellId) ?? getEntree(spellId)
    ?? (DATA.grimoire?.communs ?? []).find((s) => s.id === spellId)
    ?? (DATA.grimoire?.race ?? []).find((s) => s.id === spellId)
    ?? (DATA.grimoire?.uniques ?? []).find((s) => s.id === spellId) ?? null;
}
function cranOf(spellId, cran) {
  const s = getSchoolSpell(spellId);
  return s?.crans?.[cran] ?? null;
}
// retour terrain (10/11) : un sort h\u00e9rit\u00e9 remapp\u00e9 par le tri vit en sauvegarde comme {sort, cran}
// ou {sort, unique} ; il se r\u00e9sout ici en fiche compl\u00e8te (nom, co\u00fbt, mult, taux, cible) pour l'affichage
// et le moteur. L'entr\u00e9e brute reste en sauvegarde : la r\u00e9solution est sans perte et idempotente.
function resolveSpellEntry(sp) {
  if (!sp) return null;
  if (typeof sp.name === 'string') return sp;
  if (typeof sp.sort !== 'string') return null;
  const def = getSpellDef(sp.sort);
  if (!def) return null;
  const c = def.crans
    ? (sp.cran != null ? (def.crans[sp.cran] ?? null) : (Object.values(def.crans).find((x) => !x.vide) ?? null))
    : def;
  if (!c || c.vide) return null;
  const larg = c.largeur ?? def.largeur ?? 1;
  const cible = typeof def.cible === 'string' && def.cible
    ? def.cible
    : (def.role === 'degats' || def.role === 'controle' || def.role === 'malus')
      ? (Number(larg) === 5 ? 'tous les ennemis' : Number(larg) === 3 ? 'zone' : Number(larg) === 2 ? '2 ennemis' : '1 ennemi')
      : (larg === 'equipe' || larg === 'equipe-renforcee' ? 'l\u2019\u00e9quipe' : '1 alli\u00e9');
  return {
    name: def.nom,
    cost: c.cout ?? def.cout ?? 1,
    mult: c.mult ?? def.mult ?? null,
    taux: c.taux ?? def.taux ?? null,
    tours: c.tours ?? def.tours ?? null,
    role: def.role,
    ecole: def.ecole,
    cible,
    desc: c.desc ?? def.desc ?? '',
    cat: sp.unique ? 'unique' : 'ecole',
    sort: sp.sort,
    ...(sp.cran != null ? { cran: sp.cran } : {}),
    ...(larg != null ? { largeur: larg } : {}),
  };
}
// cle d'unicite d'un sort pour dédoublonner : nom résolu, sinon id de sort + cran
function spellKeyOf(sp) {
  if (!sp) return null;
  if (typeof sp.name === 'string') return 'n:' + sp.name;
  if (typeof sp.sort === 'string') return 's:' + sp.sort + ':' + (sp.cran ?? '');
  return null;
}

// correctif terrain : on ne cumule dans acc que les sorts inconnus de la nouvelle forme
// (et pas déjà présents dans acc) — sinon la fusion acc + sorts de la forme ferait des doublons
function unknownSpellsOf(oldSpells, newFormSpells, acc) {
  const known = new Set((newFormSpells ?? []).map(spellKeyOf).filter(Boolean));
  for (const sp of acc ?? []) { const k = spellKeyOf(sp); if (k) known.add(k); }
  return (oldSpells ?? []).filter((sp) => { const k = spellKeyOf(sp); return k != null && !known.has(k); });
}

function largeurCibles(ligne, largeur, choix = null) {
  const n = (largeur === 'equipe' || largeur === 'equipe-renforcee') ? ligne.length : Number(largeur) || 1;
  const vivantes = ligne.filter((u) => u.hp > 0);
  if (n >= vivantes.length) return vivantes;
  if (n === 3) return pickZoneTargets(vivantes, choix);
  return vivantes.slice(0, n);
}
// castSpell(data, spellId, cran, contexte) : résout largeur, coût, mult, taux depuis les données
function castSpell(data, spellId, cran, contexte = {}) {
  void data;
  const def = getSpellDef(spellId);
  if (!def) throw new Error(`sort inconnu : ${spellId}`);
  const c = def.crans ? def.crans[cran] : def;
  if (!c || c.vide) return null;
  const { lanceur = null, cibles = [], events = [], side = 'enemies' } = contexte;
  const res = { sort: spellId, cran, ecole: def.ecole, role: def.role, cout: c.cout, largeur: c.largeur, mult: c.mult ?? null, taux: c.taux ?? null };
  if (def.role === 'degats' && c.mult) {
    const base = lanceur ? statOf(lanceur) : 1;
    const targets = largeurCibles(cibles, c.largeur, contexte.choix ?? null);
    const dmg = Math.max(1, Math.round(base * c.mult));
    for (const t of targets) {
      events.push({ type: 'attack', sourceId: lanceur?.uid ?? null, targetId: t.uid, amount: dmg, sort: spellId, cran });
      applyDamage(t, dmg, events, side);
    }
    res.cibles = targets.map((t) => t.uid);
    res.degats = dmg;
  }
  if (c.taux !== undefined && typeof contexte.rng === 'function') {
    const targets = largeurCibles(cibles, c.largeur, contexte.choix ?? null);
    for (const t of targets) {
      const seuil = seuilOf(t);
      if (contexte.rng() < c.taux - seuil) {
        t.status = t.status ?? {};
        t.status.stun = { tours: c.tours ?? 1 };
        events.push({ type: 'stun', sourceId: lanceur?.uid ?? null, targetId: t.uid, sort: spellId, cran, taux: c.taux });
      }
    }
    res.tauxApplique = true;
  }
  return res;
}
// la fusion (phase 2) : une signature de monstre se résout en cran ou unique selon fusion-map
function resolveSignature(ownerId) {
  const mon = (DATA.monsters ?? []).find((m) => m.id === ownerId);
  const biome = mon ? mon.dungeon : (DATA.cards ?? []).find((c) => c.id === ownerId)?.biome ?? null;
  const entry = FUSION_MAP[biome]?.signatures?.[ownerId];
  if (!entry) return null;
  return entry.unique ? { unique: entry.unique } : { sort: entry.fusion, cran: entry.cran };
}

// lot 3 (fiche type) : la largeur max remplie d'un sort d'école, retrouvée par nom
function largeurOfSpellName(name) {
  const entrees = [...(DATA.grimoire?.entrees ?? []), ...(DATA.grimoire?.communs ?? []), ...(DATA.grimoire?.race ?? [])];
  const entree = entrees.find((s) => s.nom === name);
  if (entree) {
    if (entree.cible === 'zone') return 3;
    if (entree.cible === 'tous' || String(entree.cible).includes('tous')) return 5;
    if (String(entree.cible).includes('quipe')) return 4;
    return 1;
  }
  const def = (DATA.grimoire?.ecole ?? []).find((s) => s.nom === name);
  if (!def) return 1;
  const vals = Object.values(def.crans ?? {}).filter((c) => !c.vide).map((c) => c.largeur);
  if (!vals.length) return 1;
  return Math.max(...vals.map((l) => (l === 'equipe' || l === 'equipe-renforcee' ? 4 : Number(l) || 1)));
}
