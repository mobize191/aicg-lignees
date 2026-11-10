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
  
  
  
  
  
  
  const cap = (t) => Math.round(t.maxHp * M.HEAL_CAP_RATIO);
  if (s.effect.kind === 'heal') {
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
  } else if (s.effect.kind === 'atkBuff') {
    const value = s.effect.value * mult;
    for (const t of allies.attaque.filter((u) => u.alive).slice(0, n)) {
      t.atkBuff += value;
      events.push({ type: 'buff', side, sourceId: s.uid, targetId: t.uid, kind: 'atk', value, kindTag: kind });
      const p = t.linkedTo ? aliveAllies.find((a) => a.uid === t.linkedTo) : null;
      if (p) {
        p.atkBuff += value * M.LINK_BUFF_SHARE;
        events.push({ type: 'buff', side, sourceId: s.uid, targetId: p.uid, kind: 'atk', value: value * M.LINK_BUFF_SHARE, kindTag: 'link' });
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
        dmg: Math.max(1, Math.round(s.atk * (s.effect.pct ?? M.DOT_EFFECT_DEFAULT) * mult)),
        turns: s.effect.turns ?? 2,
      };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: f.uid, kind: 'dot', value: f.status.dot.dmg });
    }
  } else if (s.effect.kind === 'reflect') {
    if (!spell) return;
    for (const t of aliveAllies) {
      t.status.reflect = { pct: s.effect.value ?? M.REFLECT_DEFAULT_PCT, turns: s.effect.turns ?? 2 };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: t.uid, kind: 'reflect', value: t.status.reflect.pct });
    }
  } else if (s.effect.kind === 'warcry') {
    if (!spell) return;
    const value = s.effect.value ?? M.WARCRY_DEFAULT;
    for (const t of allies.attaque.filter((u) => u.alive)) {
      t.atkBuff += value;
      t.status.dmgRed = { pct: s.effect.red ?? M.DMGRED_DEFAULT, turns: 1 };
      events.push({ type: 'buff', side, sourceId: s.uid, targetId: t.uid, kind: 'atk', value, kindTag: kind });
    }
  } else if (s.effect.kind === 'summon') {
    if (!spell) return;
    castSummon(s, allies, mods, events, side);
  } else if (s.effect.kind === 'curse') {
    if (!spell) return;
    for (const f of foes) {
      const value = (s.effect.value ?? M.CURSE_DEFAULT) * (1 + (side === 'team' ? mods.cursePct || 0 : 0)) * (f.boss ? M.CURSE_BOSS_FACTOR : 1);
      f.status.curse = { value, turns: s.effect.turns ?? 2 };
      events.push({ type: 'status', side, sourceId: s.uid, targetId: f.uid, kind: 'curse', value: Math.round(value * 100) / 100 });
    }
  } else if (s.effect.kind === 'revive') {
    if (!spell) return;
    const dead = [...allies.attaque, ...allies.support].filter((u) => !u.alive && !(u.status && u.status.reviving));
    if (dead.length) {
      const t = dead.sort((a, b) => b.maxHp - a.maxHp)[0];
      t.hp = Math.max(1, Math.round(t.maxHp * (s.effect.value ?? M.REVIVE_DEFAULT)));
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
