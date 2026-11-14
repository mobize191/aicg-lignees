// src/engine/combat.js : extrait du monolithe (phase 0, comportement inchange)

function makeUnit(card, uid = card.id, level = null) {
  
  
  const lvl = level ?? card.level ?? 1;
  const m = 1 + LEVEL_BONUS * (lvl - 1);
  const cm = classeMods(card);
  const cranPct = cranPctOfRace(raceOfCard(card));
  // boucle v2 lot 4 : bonus d'équipement en % sur les stats de base (posés par l'UI depuis data/equipment.json)
  const eq = card.equip ?? null;
  const u = {
    uid, cardId: card.id, name: card.name, rarity: card.rarity,
    classe: card.classe, element: card.element, race: raceOfCard(card),
    cranPct,
    // moteur v2 (J1-J4) : 5 stats ; J3 les mods atkPct/hpPct de classe ne s'appliquent plus (data lisible) ;
    // J4 le cran de race ne porte plus que sur les PV
    atk: Math.max(1, Math.round(card.atk * m * (1 + (eq?.atkPct ?? 0)) * (1 + (card.noLossPct ?? 0) / 100))),
    hp: Math.max(1, Math.round(card.hp * m * (1 + cranPct / 100) * (1 + (eq?.hpPct ?? 0)) * (1 + (card.noLossPct ?? 0) / 100))),
    maxHp: Math.max(1, Math.round(card.hp * m * (1 + cranPct / 100) * (1 + (eq?.hpPct ?? 0)) * (1 + (card.noLossPct ?? 0) / 100))),
    def: Math.max(1, Math.round((card.def ?? Math.max(1, Math.round(card.atk * ((M.DEF_RATIOS ?? {})[card.classe] ?? 0)))) * m * (1 + (eq?.defPct ?? 0)))),
    agi: Math.max(1, Math.round((card.agi ?? Math.round(card.atk * M.AGI_RATIO)) * m * (1 + (eq?.agiPct ?? 0)))),
    int: Math.max(1, Math.round((card.int ?? Math.round(card.atk * M.INT_RATIO)) * m * (1 + (eq?.intPct ?? 0)))),
    level: lvl,
    shield: 0, atkBuff: 0, alive: true,
    effect: card.effect ? { ...card.effect } : null,
    spells: (card.spells ?? []).map((s) => applySchoolMod({ ...s })),
    crossName: card.soloSpell ?? null,
    manaMax: 0,
    manaRegen: 0,
    boss: !!card.boss,
    final: !!card.final,
    shiny: !!card.shiny, // lot 8 suite 40 : l'exemplaire shiny porte sa variance (+3-5 % de stats) dans ses stats de combat
    gimmick: card.gimmick ?? null,
    ronde: 0,
    status: card.effect && card.effect.kind === 'copy' ? { copy: { spell: null, expiry: 0 } } : {},
    linkedTo: null,
    linkTtl: 0,
  };
  // J5 (moteur v2) : attaque magique de base « boule de feu » pour les profils lanceurs, sur l'INT (en data)
  if (statPrincipaleOf(card.classe) === 'int' && M.BASE_SPELL) {
    u.spells.push({ name: M.BASE_SPELL.name, cost: M.BASE_SPELL.cost, mult: M.BASE_SPELL.mult, cat: 'commun', role: 'degats', cible: '1 ennemi', desc: 'L’attaque magique de base, portée par l’INT.' });
  }
  if (card.phoenix) u.status.phoenix = { ...card.phoenix };
  // T4.5 : le mana monte avec l'intelligence (formules en données, plafonnées à +50 % du palier)
  const manaBase = card.mana ?? SOLO_MANA.max;
  const regenBase = card.manaRegen ?? SOLO_MANA.regen;
  u.manaMax = Math.round(manaBase * (1 + Math.min(M.MANA_CAP_RATIO, (u.int * M.MANA_PER_INT) / manaBase)));
  u.manaRegen = Math.round(regenBase * (1 + Math.min(M.MANA_CAP_RATIO, (u.int * M.MANA_REGEN_PER_INT) / regenBase))) + (card.gimmick === 'prestige' ? 2 : 0) + (eq?.manaRegen ?? 0);
  u.mana = Math.min(u.manaMax, Math.round(u.manaMax * M.MANA_START_RATIO));
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
  
  // J7 (moteur v2) : les synergies « 2 exemplaires » sont supprimées (data/synergies.json vidé),
  // y compris le bonus de paire divine — remplacé plus tard par les sorts de trio (lot 4)
  return mods;
}

function levelFor(levels, id, i) {
  void i;
  const lv = levels ? levels[id] : undefined;
  return Number.isFinite(lv) && lv >= 1 ? Math.floor(lv) : 1;
}

// opts.difficulty : profil IA de la difficulté (data/difficulties.json, champ ia) — lot 3 refonte IA
function initCombat(teamCards, enemyCards, seed, levels = {}, opts = {}) {
  const iaProfile = (opts.difficulty != null ? difficultyById(opts.difficulty) : null)?.ia ?? { suboptimal: 0 };
  // Lot A (refonte direction, TRANCHÉ 12/11) : 3 actifs + 2 réserve — l'arrière joueur disparaît du plateau,
  // les slots 3-4 partent en state.reserve (hors ciblage, hors dégâts de zone, ne jouent pas)
  const mkUnit = (c, i, tag) => {
    const u = makeUnit(c, `${c.id}.${tag}${i}`, c.level ?? levelFor(levels, c.id, i));
    u.iid = c.iid ?? null;
    // lot 4 refonte v2 (J6/J11) : sorts debloques au fil du niveau (grimoire de l'ecole de la
    // famille) + hybrides soin+degats des soigneurs — equipe joueur seule, les vagues gardent leur fiche
    for (const sn of [...sortsNiveauOf(c, u.level), ...hybridesNiveauOf(c, u.level)]) {
      const sp = resolveSpellEntry(sn);
      if (!sp) continue;
      const k = spellKeyOf(sp);
      if (k && u.spells.some((x) => spellKeyOf(x) === k)) continue;
      u.spells.push(applySchoolMod(sp));
    }
    return u;
  };
  const team = {
    avant: (teamCards.avant ?? []).map((c, i) => mkUnit(c, i, 'a')),
    arriere: [],
  };
  const reserve = (teamCards.reserve ?? teamCards.arriere ?? []).map((c, i) => mkUnit(c, i, 'r'));
  const flat = Array.isArray(enemyCards)
    ? enemyCards
    : [...(enemyCards.avant ?? enemyCards.avant ?? []), ...(enemyCards.arriere ?? enemyCards.arriere ?? [])];
  const enemies = {
    avant: flat.slice(0, Math.min(3, flat.length)).map((c, i) => makeUnit({ ...c }, `e.a${i}`)),
    arriere: flat.slice(Math.min(3, flat.length)).map((c, i) => makeUnit({ ...c }, `e.s${i}`)),
  };
  // chantier lignes (Option A) : chaque unité porte son rang — avant = ligne attaque, arrière = ligne support
  // tant que le champ role existe (supprimé au lot B) ; les monstres suivent les mêmes règles
  for (const u of team.avant) u.rang = 'avant';
  for (const u of team.arriere) u.rang = 'arriere';
  for (const u of reserve) u.rang = 'reserve';
  for (const u of enemies.avant) u.rang = 'avant';
  for (const u of enemies.arriere) u.rang = 'arriere';
  // lot 4 refonte v2 (J7) : sorts de trio — la composition de la premiere ligne debloque un sort d'equipe
  const trioClasses = [...new Set(team.avant.map((u) => u.classe))];
  for (const tr of SORTS_TRIO) {
    const cond = tr.condition ?? {};
    const ok = (cond.distinct != null ? trioClasses.length >= cond.distinct : true)
      && (cond.classes ? cond.classes.every((cl) => trioClasses.includes(cl)) : true);
    if (!ok) continue;
    for (const u of team.avant) {
      u.spells.push({ name: tr.nom, cost: tr.cout, mult: tr.mult, largeur: tr.largeur, cible: tr.cible, role: 'degats', cat: 'trio', desc: tr.desc });
    }
  }
  const all = [...team.avant]; // synergies de combat calculées sur les actifs seuls (réserve hors combat) [À TRANCHER si synergies sur les 5]
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
  return { rng: mulberry32(seed), iaRng: mulberry32((Math.imul(seed >>> 0, 31) ^ 7) >>> 0), iaProfile, turn: 0, team, enemies, reserve, mods, winner: null };
}

// chantier lignes (Option A) : l'avant tient = au moins un vivant dans la ligne avant du camp
function frontHolds(state, side) {
  return ((state[side] ?? {}).avant ?? []).some((u) => u.alive);
}
// l'arrière est ciblable mais encaisse -50 % tant que l'avant tient ; les attaques de zone ignorent cette protection
function backProtected(state, side, target, zone) {
  return !!state && !zone && target.rang === 'arriere' && frontHolds(state, side);
}
// Guerrier/Assassin en arrière frappent à moitié tant que l'avant tient ; les autres profils frappent à plein
function rangAtkMult(state, side, u) {
  if (!state) return 1;
  return (u.rang === 'arriere' && frontHolds(state, side) && (M.RANG_BACK_CLASSES ?? []).includes(u.classe))
    ? M.RANG_BACK_ATK_PCT
    : 1;
}

function applyDamage(target, dmg, events, side, reviveCtx = null, isHit = false, opts = null) {
  // moteur v2 (J2) : défense ratio dmg × K/(K+def), jamais d'immunité (K en data)
  const defK = M.DEF_K ?? 10;
  if (target.def > 0) dmg = Math.max(1, Math.round(dmg * defK / (defK + target.def)));
  if (opts && opts.state && backProtected(opts.state, side, target, !!opts.zone)) {
    dmg = Math.max(1, Math.round(dmg * M.RANG_BACK_DMG_PCT));
  }
  let rest = dmg;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, rest);
    target.shield -= absorbed;
    rest -= absorbed;
    
    
    
    
    if (absorbed > 0) events.push({ type: 'block', side, targetId: target.uid, amount: absorbed });
  }
  target.hp -= rest;
  events.push({ type: 'damage', side, targetId: target.uid, amount: rest, ...(opts && opts.crit ? { crit: true } : {}) }); // Lot 1 : flag crit sur l'event damage
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
    ['team', state.team.avant, state.team.arriere],
    ['enemies', state.enemies.avant, state.enemies.arriere],
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
        applyDamage(u, amount, events, side, { allies: others() }, false, { state });
        d.turns -= 1;
        if (d.turns <= 0) delete st.dot;
      }
      if (st.taunt) {
        st.taunt.turns -= 1;
        if (st.taunt.turns <= 0 || st.taunt.charges <= 0) delete st.taunt;
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
  const enemyAll = () => alive([...enemies.avant, ...enemies.arriere]);
  const teamAll = () => alive([...team.avant, ...team.arriere]);
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
  const frontEmpty = alive(team.avant).length === 0;
  ctx.frontEmpty = frontEmpty;
  const strikers = frontEmpty ? [...team.arriere] : [...team.avant];
  const eFrontEmpty = alive(enemies.avant).length === 0;
  const eStrikers = eFrontEmpty ? [...enemies.arriere] : [...enemies.avant];
  const items = [];
  strikers.forEach((u, i) => { if (u.alive) items.push({ u, side: 'team', kind: 'strike', idx: i }); });
  team.arriere.forEach((s, si) => { if (s.alive) items.push({ u: s, side: 'team', kind: 'support', idx: si }); });
  eStrikers.forEach((e, ei) => { if (e.alive) items.push({ u: e, side: 'enemies', kind: 'strike', idx: ei }); });
  enemies.arriere.forEach((es, si) => { if (es.alive) items.push({ u: es, side: 'enemies', kind: 'support', idx: si }); });
  items.sort((a, b) => (b.u.agi - a.u.agi) || (a.side === b.side ? 0 : (a.side === 'team' ? -1 : 1)));
  state.round = { items, i: 0, ctx };
  replaceKoTeam(state, ctx); // Lot A : K.O. -> remplaçant automatique (hors items de ce tour : il ne jouera qu'au suivant)
  return events;
}

// Lot A : remplacement automatique sur K.O. — la première réserve vivante entre GRATUITEMENT dans la place du K.O.
// L'entrant n'est pas dans les items du tour courant : il ne joue qu'au tour suivant. Sans réserve, le combat continue.
function replaceKoTeam(state, ctx) {
  const team = state.team;
  if (!team || !Array.isArray(team.avant)) return;
  const reserve = state.reserve ?? (state.reserve = []);
  for (let i = 0; i < team.avant.length; i++) {
    const u = team.avant[i];
    if (!u || u.alive) continue;
    const ri = reserve.findIndex((r) => r && r.alive);
    if (ri < 0) continue;
    const r = reserve[ri];
    reserve.splice(ri, 1);
    team.avant[i] = r;
    r.rang = 'avant';
    r.benched = false;
    u.rang = 'reserve';
    reserve.push(u);
    if (ctx) ctx.events.push({ type: 'swap', out: u.uid, in: r.uid, outName: u.name, inName: r.name, voluntary: false });
  }
}

function peekRound(state) {
  const r = state.round;
  if (!r) return null;
  const ctx = r.ctx;
  while (r.i < r.items.length) {
    const it = r.items[r.i];
    if (!it.u.alive || it.u.benched) { r.i += 1; continue; } // v1.40 Lot A : une carte échangée en cours de tour ne joue plus
    if (it.side === 'team' && it.kind === 'strike' && !ctx.enemyAll().length) { r.i += 1; continue; }
    if (it.side === 'enemies' && it.kind === 'strike' && !ctx.teamAll().length) { r.i += 1; continue; }
    return it;
  }
  return null;
}

// boucle v2 lot 1 : action Objet — une gorgée applique son effet au porteur (soin PV ou recharge mana)
function drinkPotion(u, potion) {
  if (!u || !u.alive || !potion) return [];
  const pct = Number(potion.pct) || 0;
  if (potion.genre === 'mana') {
    const amt = Math.max(1, Math.round(u.manaMax * pct));
    const real = Math.min(amt, Math.max(0, u.manaMax - u.mana));
    u.mana += real;
    return [{ type: 'buff', side: 'team', sourceId: u.uid, targetId: u.uid, kind: 'tactical', value: 'mana', amount: real, potion: potion.id }];
  }
  const amt = Math.max(1, Math.round(u.maxHp * pct));
  const real = Math.min(amt, Math.max(0, u.maxHp - u.hp));
  u.hp = Math.min(u.maxHp, u.hp + real);
  return [{ type: 'heal', side: 'team', sourceId: u.uid, targetId: u.uid, amount: real, potion: potion.id, objet: true }];
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
  if (tacAct && tacAct.kind === 'item') {
    // chaque gorgée coûte le tour, même si la cible est déjà à plein
    ctx.events.push(...drinkPotion(u, tacAct.potion));
    return false;
  }
  if (tacAct && tacAct.kind === 'pass') {
    u.mana = Math.min(u.manaMax, u.mana + u.manaRegen);
    ctx.events.push({ type: 'status', side: 'team', targetId: u.uid, kind: 'tactical', value: 'attente' });
    return false;
  }
  let spell = null;
  if (!mods.aoe || !ctx.firstAttack) {
    if (tacAct && tacAct.kind === 'spell') {
      u.mana = Math.min(u.manaMax, u.mana + u.manaRegen);
      const cand = (u.spells ?? [])[tacAct.idx ?? 0];
      if (cand && cand.cost <= u.mana) {
        u.mana -= cand.cost;
        // correctifs sorts lot 2 (TRANCHÉ 14/11) : une SIGNATURE (cat 'unique') se résout par la métadonnée de sa
        // fiche (signatureMetaOfUnit, le même switch qu'applySupport côté ennemi) : TOUS les rôles en Tactique
        const sigMeta = cand.cat === 'unique' ? signatureMetaOfUnit(u) : null;
        const role = cand.role ?? sigMeta?.role ?? null;
        const side = spellSideOf({ ...cand, ...(sigMeta?.cible ? { cible: sigMeta.cible } : {}) });
        if (side === 'self' || side === 'ally' || side === 'team') {
          const t = side === 'ally' && tacAct.allyUid
            ? (ctx.teamAll().find((a) => a.uid === tacAct.allyUid && a.alive) ?? u)
            : side === 'team'
              ? (ctx.teamAll().filter((a) => a.rang === 'avant' && a.alive)[0] ?? ctx.teamAll()[0] ?? u)
              : u;
          const effKind = u.effect ? u.effect.kind : null;
          const big = !!cand.big || cand.cost >= 5;
          const castEv = (fx) => ctx.events.push({ type: 'cast', side: 'team', sourceId: u.uid, name: cand.name, big, fx, mana: u.mana });
          if (role === 'invocation') {
            spell = cand; // résolu par le bloc invocation partagé (castSummon) ci-dessous
          } else if (role === 'soin' && effKind === 'revive') {
            // signature résurrection : relève le premier K.O. de l'équipe à effect.value, sinon soin
            const dead = ctx.teamAll().filter((a) => !a.alive && !(a.status && a.status.reviving));
            if (dead.length) {
              const dt = dead.sort((a, b) => b.maxHp - a.maxHp)[0];
              dt.hp = Math.max(1, Math.round(dt.maxHp * (u.effect.value ?? M.REVIVE_DEFAULT)));
              dt.alive = true;
              castEv('heal');
              ctx.events.push({ type: 'revive', side: 'team', sourceId: u.uid, targetId: dt.uid, amount: dt.hp });
            } else {
              const cible = tacAct.allyUid
                ? (ctx.teamAll().find((a) => a.uid === tacAct.allyUid && a.alive) ?? t)
                : [...ctx.teamAll()].sort((a, b) => a.hp - b.hp)[0] ?? u;
              const amount = Math.min(Math.max(1, Math.round(statOf(u) * (cand.mult ?? 1))), Math.max(0, cible.maxHp - cible.hp));
              castEv('heal');
              if (amount > 0) { cible.hp += amount; ctx.events.push({ type: 'heal', side: 'team', sourceId: u.uid, targetId: cible.uid, amount, kind: 'special' }); }
            }
          } else if (role === 'soin') {
            const cible = tacAct.allyUid
              ? (ctx.teamAll().find((a) => a.uid === tacAct.allyUid && a.alive) ?? t)
              : [...ctx.teamAll()].sort((a, b) => a.hp - b.hp)[0] ?? u;
            const amount = Math.min(Math.max(1, Math.round(statOf(u) * (cand.mult ?? 1))), Math.max(0, cible.maxHp - cible.hp));
            castEv('heal');
            if (amount > 0) {
              cible.hp += amount;
              ctx.events.push({ type: 'heal', side: 'team', sourceId: u.uid, targetId: cible.uid, amount, kind: 'special' });
            }
          } else if (role === 'bouclier') {
            const amount = Math.min(Math.round(statOf(u) * (cand.mult ?? 1)), Math.round(t.maxHp * M.SHIELD_CAP_RATIO));
            castEv('atk');
            t.shield += amount;
            ctx.events.push({ type: 'shield', side: 'team', sourceId: u.uid, targetId: t.uid, amount, kind: 'special' });
          } else if (role === 'manip' && effKind === 'link') {
            castEv('atk');
            const libres = ctx.state.team.avant.filter((a) => a.alive && !a.linkedTo);
            if (libres.length >= 2) {
              const [a, b] = libres;
              a.linkedTo = b.uid; a.linkTtl = 2; b.linkedTo = a.uid; b.linkTtl = 2;
              ctx.events.push({ type: 'status', side: 'team', sourceId: u.uid, targetId: a.uid, kind: 'link', value: b.uid });
            } else {
              const value = Math.max(0, (cand.mult ?? 1) - 1);
              t.atkBuff = (t.atkBuff ?? 0) + value;
              ctx.events.push({ type: 'buff', side: 'team', sourceId: u.uid, targetId: t.uid, kind: 'atk', value, kindTag: 'special' });
            }
          } else if (role === 'manip' && effKind === 'copy') {
            castEv('atk');
            if (ctx.state.lastEnemySpell) {
              u.status.copy = { spell: { ...ctx.state.lastEnemySpell }, expiry: 2 };
              ctx.events.push({ type: 'status', side: 'team', targetId: u.uid, kind: 'copy', value: u.status.copy.spell.name });
            } else {
              const value = Math.max(0, (cand.mult ?? 1) - 1); // aucun sort ennemi à copier : buff de repli
              t.atkBuff = (t.atkBuff ?? 0) + value;
              ctx.events.push({ type: 'buff', side: 'team', sourceId: u.uid, targetId: t.uid, kind: 'atk', value, kindTag: 'special' });
            }
          } else {
            const value = Math.max(0, (cand.mult ?? 1) - 1);
            t.atkBuff = (t.atkBuff ?? 0) + value;
            castEv('atk');
            ctx.events.push({ type: 'buff', side: 'team', sourceId: u.uid, targetId: t.uid, kind: 'atk', value, kindTag: 'special' });
          }
          if (role !== 'invocation') { ctx.firstAttack = false; return false; }
        }
        spell = cand;
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
        spell = pickSpell(u, { state: ctx.state, allies: team, foes, side: 'team' });
      }
    }
  }
  // correctifs v1.51 lot 1 : en Auto, la SIGNATURE (cat 'unique') alliée (soin/boost/bouclier) de la
  // ligne d'attaque se résout par son rôle (soigne le plus blessé, buff/bouclier l'avant) ;
  // T0.2 inchangé : les autres sorts (commun/race/classe/lignée) restent des coups en Auto
  if (spell && spell.cat === 'unique') {
    const sd = spellSideOf(spell);
    const role = spell.role ?? null;
    if ((sd === 'self' || sd === 'ally' || sd === 'team') && (role === 'soin' || role === 'boost' || role === 'bouclier')) {
      const alliesAlive = ctx.teamAll().filter((a) => a.alive);
      let t = u;
      if (sd === 'self') t = u;
      else if (role === 'soin') t = [...alliesAlive].sort((a, b) => a.hp - b.hp)[0] ?? u;
      else t = alliesAlive.filter((a) => a.rang === 'avant')[0] ?? alliesAlive[0] ?? u;
      const big = !!spell.big || spell.cost >= 5;
      if (role === 'soin') {
        const amount = Math.min(Math.max(1, Math.round(statOf(u) * (spell.mult ?? 1))), Math.max(0, t.maxHp - t.hp));
        ctx.events.push({ type: 'cast', side: 'team', sourceId: u.uid, name: spell.name, big, fx: 'heal', mana: u.mana });
        if (amount > 0) { t.hp += amount; ctx.events.push({ type: 'heal', side: 'team', sourceId: u.uid, targetId: t.uid, amount, kind: 'special' }); }
      } else if (role === 'bouclier') {
        const amount = Math.min(Math.round(statOf(u) * (spell.mult ?? 1)), Math.round(t.maxHp * M.SHIELD_CAP_RATIO));
        ctx.events.push({ type: 'cast', side: 'team', sourceId: u.uid, name: spell.name, big, fx: 'atk', mana: u.mana });
        t.shield += amount;
        ctx.events.push({ type: 'shield', side: 'team', sourceId: u.uid, targetId: t.uid, amount, kind: 'special' });
      } else {
        const value = Math.max(0, (spell.mult ?? 1) - 1);
        ctx.events.push({ type: 'cast', side: 'team', sourceId: u.uid, name: spell.name, big, fx: 'atk', mana: u.mana });
        t.atkBuff = (t.atkBuff ?? 0) + value;
        ctx.events.push({ type: 'buff', side: 'team', sourceId: u.uid, targetId: t.uid, kind: 'atk', value, kindTag: 'special' });
      }
      ctx.firstAttack = false;
      return false;
    }
  }
  if (spell) {
    ctx.events.push({ type: 'cast', side: 'team', sourceId: u.uid, name: spell.name, big: !!spell.big || spell.cost >= 5, fx: 'atk', mana: u.mana });
    // J9 (moteur v2) : provocation à charges — le lanceur attire les coups ennemis
    if (spell.taunt) {
      const n = typeof spell.taunt === 'number' ? spell.taunt : (M.TAUNT_CHARGES ?? 2);
      u.status.taunt = { charges: (u.status.taunt?.charges ?? 0) + n, turns: M.TAUNT_TURNS ?? 3 };
      ctx.events.push({ type: 'status', side: 'team', sourceId: u.uid, targetId: u.uid, kind: 'taunt', value: u.status.taunt.charges });
    }
  }
  // correctifs sorts lots 2+4 : un sort d'invocation déclenche castSummon. Lot 4 (14/11) : les sorts
  // Appel/Pont (spell.summon en data, rôle invocation) invoquent VRAIMENT en Tactique ET en Auto
  // (cohérence des chemins -> digest MESURÉ) ; les signatures de recrues (cat 'unique') restent
  // réservées au Tactique (garde-fou tacAct) comme au lot 2.
  const sigRole = spell && spell.cat === 'unique' ? (signatureMetaOfUnit(u)?.role ?? null) : null;
  if (spell && ((u.classe === 'Invocateur' && u.effect && u.effect.kind === 'summon') || spell.summon || spell.role === 'invocation' || (tacAct && sigRole === 'invocation'))) {
    if (castSummon(u, team, mods, ctx.events, 'team', spell.summon ? { ...spell.summon, mult: spell.mult ?? 1 } : null)) {
      ctx.firstAttack = false;
      return false;
    }
  }
  const cSelf = u.status && u.status.curse ? u.status.curse.value : 0;
  // J1 (moteur v2) : l'INT pilote les sorts des profils lanceurs, l'ATQ la frappe simple
  const baseAtk = spell && statPrincipaleOf(u.classe) === 'int' ? u.int : u.atk;
  let dmg = Math.max(1, Math.round(baseAtk * (1 + (mods.atkPct || 0) + u.atkBuff) * (1 + (mods.dmgPct || 0)) * (spell ? spell.mult : classeMods(u).strike) * (1 - cSelf) * ctx.rage * rangAtkMult(ctx.state, 'team', u)));
  u.atkBuff = 0;
  if (u.ronde) dmg = Math.max(1, Math.round(dmg * (1 + M.RONDE_RATE * Math.min(u.ronde, M.RONDE_CAP))));
  if (u.gimmick === 'belier' && !u.belierUsed) {
    dmg = Math.max(1, Math.round(dmg * M.BELIER_BOOST));
    u.belierUsed = true;
  }
  const kind = spell ? 'special' : 'basic';
  const atkEl = atkElementOf(u, spell); // Lot B : sort = élément de l'école, frappe simple = élément de la carte
  if (mods.aoe && ctx.firstAttack) {
    ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: 'all', amount: dmg, kind, mana: u.mana, elem: null, side: 'team' });
    for (const f of [...foes]) {
      const crit = !spell && rollCrit(u, f, ctx.state.rng); // Lot 1 : crit d'agilite, frappes physiques seules
      const baseF = Math.max(1, Math.round(dmg * mods.aoe * elementMult(atkEl, f.element)));
      const dC = crit ? Math.max(1, Math.round(baseF * M.CRIT_MULT)) : baseF;
      if (crit) ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: f.uid, amount: dC, kind, mana: u.mana, elem: null, side: 'team', crit: true });
      applyDamage(f, dC, ctx.events, 'enemies', null, false, { state: ctx.state, zone: true, crit });
    }
    ctx.firstAttack = false;
    if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
    return false;
  }
  if (u.gimmick === 'carrousel' && ctx.state.rng() < M.CARROUSEL_CHANCE) {
    ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: 'all', amount: dmg, kind, mana: u.mana, elem: null, side: 'team' });
    for (const f of [...foes]) applyDamage(f, Math.max(1, Math.round(dmg * M.CARROUSEL_SPLASH)), ctx.events, 'enemies', null, false, { state: ctx.state, zone: true });
    if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
    ctx.firstAttack = false;
    return false;
  }
  if (!spell && classeMods(u).wave) {
    ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: 'all', amount: dmg, kind, mana: u.mana, elem: null, side: 'team' });
    for (const f of [...foes]) {
      const crit = rollCrit(u, f, ctx.state.rng); // Lot 1 (branche basic uniquement)
      const baseF = Math.max(1, Math.round(dmg * elementMult(atkEl, f.element)));
      const dC = crit ? Math.max(1, Math.round(baseF * M.CRIT_MULT)) : baseF;
      if (crit) ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: f.uid, amount: dC, kind, mana: u.mana, elem: null, side: 'team', crit: true });
      applyDamage(f, dC, ctx.events, 'enemies', null, true, { state: ctx.state, zone: true, crit });
    }
    if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
    ctx.firstAttack = false;
    return false;
  }
  const idx = !ctx.frontEmpty && step && step.targetIdx !== null && step.targetIdx !== undefined ? step.targetIdx : null;
  const foeLineOf = (t) => (t && t.rang === 'arriere' ? enemies.arriere : enemies.avant);
  // refonte IA lot 1 : en Auto sans désignation, même utilité de ciblage que l'IA ennemie (avec hystérésis)
  const target = idx !== null && [...enemies.avant, ...enemies.arriere][idx]?.alive ? [...enemies.avant, ...enemies.arriere][idx] : pickTargetByUtility(u, foes, dmg, ctx.state, 'team', atkEl);
  // lot 3 : en Tactique, la fiche du sort (largeur) élargit la frappe ; le chemin Auto ne bouge pas
  let hitList = [target];
  if (tacAct && tacAct.kind === 'spell' && spell) {
    const larg = largeurOfSpell(spell); // lot 3 correctifs sorts : cran du porteur, jamais le max
    if (larg === 5) hitList = ctx.enemyAll();
    else if (larg === 3 && idx !== null) { const fl = foeLineOf(target); hitList = pickZoneTargets(fl, Math.max(0, fl.findIndex((x) => x.uid === target.uid))); }
  }
  if (mods.weakBonus && target === foes.reduce((a, b) => (a.hp <= b.hp ? a : b))) {
    dmg = Math.round(dmg * (1 + mods.weakBonus));
  }
  const cmU = classeMods(u);
  if (cmU.exec && target.hp < target.maxHp * cmU.execBelow) {
    dmg = Math.max(1, Math.round(dmg * (1 + cmU.exec)));
    ctx.events.push({ type: 'status', side: 'enemies', targetId: target.uid, kind: 'exec', value: cmU.exec });
  }
  const elem = elementTag(atkEl, target.element);
  const dmgBase = dmg;
  dmg = Math.max(1, Math.round(dmg * elementMult(atkEl, target.element)));
  const slowed = foes.some((f) => f.status && f.status.slow > 0);
  const hits = (mods.doubleChance && ctx.state.rng() < mods.doubleChance) || slowed ? 2 : 1;
  let dealt = 0; // lot 4 (J11) : total des degats reels, base du soin des sorts hybrides
  for (let h = 0; h < hits; h++) {
    let dodged = false;
    for (const tgt of hitList) {
      if (!tgt.alive) continue;
      const elemT = elementTag(atkEl, tgt.element);
      const dmgT = Math.max(1, Math.round(dmgBase * elementMult(atkEl, tgt.element)));
      const dodgeT = Math.min(M.DODGE_CAP, (classeMods(tgt).dodge || 0) + Math.max(0, (u.agi - tgt.agi)) * M.DODGE_PER_AGI);
      if (dodgeT > 0 && ctx.state.rng() < dodgeT) {
        ctx.events.push({ type: 'dodge', side: 'enemies', sourceId: u.uid, targetId: tgt.uid });
        if (tgt === target && hitList.length === 1) { dodged = true; break; }
        continue;
      }
      const crit = !spell && rollCrit(u, tgt, ctx.state.rng); // Lot 1 : apres l'esquive, frappes physiques seules
      const dmgC = crit ? Math.max(1, Math.round(dmgT * M.CRIT_MULT)) : dmgT;
      ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: tgt.uid, amount: dmgC, kind, mana: u.mana, elem: elemT, side: 'team', ...(crit ? { crit: true } : {}) });
      applyDamage(tgt, dmgC, ctx.events, 'enemies', { allies: foes }, true, { state: ctx.state, zone: hitList.length > 1, crit });
      dealt += dmgC;
      if (tgt.alive && spell && spell.dot) {
        tgt.status.dot = { dmg: Math.max(1, Math.round(dmgT * (spell.dot.pct ?? M.DOT_DEFAULT_PCT))), turns: spell.dot.turns ?? 2 };
        ctx.events.push({ type: 'status', side: 'enemies', targetId: tgt.uid, kind: 'dot', value: tgt.status.dot.dmg });
      }
      // correctifs sorts lot 2 : signature hostile (cat 'unique') en Tactique -> le statut de la fiche
      // (stun/slow/dot/curse de l'effet data) s'applique sur l'ennemi touché, EN PLUS des dégâts
      if (tacAct && tacAct.kind === 'spell' && spell && spell.cat === 'unique' && tgt.alive && u.effect) {
        const ek = u.effect.kind;
        if (ek === 'stun') { tgt.status.stun = (tgt.status.stun ?? 0) + (u.effect.turns ?? 1); ctx.events.push({ type: 'status', side: 'enemies', sourceId: u.uid, targetId: tgt.uid, kind: 'stun', value: u.effect.turns ?? 1 }); }
        else if (ek === 'slow') { tgt.status.slow = Math.max(tgt.status.slow ?? 0, u.effect.turns ?? 2); ctx.events.push({ type: 'status', side: 'enemies', sourceId: u.uid, targetId: tgt.uid, kind: 'slow', value: u.effect.turns ?? 2 }); }
        else if (ek === 'dot') { tgt.status.dot = { dmg: Math.max(1, Math.round(u.atk * (u.effect.pct ?? M.DOT_EFFECT_DEFAULT) * (spell.mult ?? 1))), turns: u.effect.turns ?? 2 }; ctx.events.push({ type: 'status', side: 'enemies', sourceId: u.uid, targetId: tgt.uid, kind: 'dot', value: tgt.status.dot.dmg }); }
        else if (ek === 'curse') { const v = (u.effect.value ?? M.CURSE_DEFAULT) * (tgt.boss ? M.CURSE_BOSS_FACTOR : 1); tgt.status.curse = { value: v, turns: u.effect.turns ?? 2 }; ctx.events.push({ type: 'status', side: 'enemies', sourceId: u.uid, targetId: tgt.uid, kind: 'curse', value: Math.round(v * 100) / 100 }); }
      }
      // correctifs sorts lot 5 (TRANCHÉ 14/11) : badge contrôle/malus = le statut est posé EN PLUS des
      // dégâts, en Tactique ET en Auto (jet de taux ; malus = curse de la valeur du sort, boss réduit de moitié)
      if (spell && spell.taux != null && tgt.alive && ctx.state.rng() < spell.taux) {
        if (spell.role === 'malus') {
          const v = (spell.curse ?? M.CURSE_DEFAULT) * (tgt.boss ? M.CURSE_BOSS_FACTOR : 1);
          tgt.status.curse = { value: v, turns: spell.tours ?? 2 };
          ctx.events.push({ type: 'status', side: 'enemies', sourceId: u.uid, targetId: tgt.uid, kind: 'curse', value: Math.round(v * 100) / 100 });
        } else {
          tgt.status.stun = (tgt.status.stun ?? 0) + (spell.tours ?? 1);
          ctx.events.push({ type: 'status', side: 'enemies', sourceId: u.uid, targetId: tgt.uid, kind: 'stun', value: spell.tours ?? 1 });
        }
      }
      if (tgt.alive && tgt.status && tgt.status.reflect && dmgT > 0) {
        const back = Math.max(1, Math.round(dmgT * tgt.status.reflect.pct));
        ctx.events.push({ type: 'attack', sourceId: tgt.uid, targetId: u.uid, amount: back, kind: 'special', mana: tgt.mana, elem: null, side: 'enemies' });
        applyDamage(u, back, ctx.events, 'team', { allies: ctx.teamAll() }, false, { state: ctx.state });
      }
    }
    if (dodged || !target.alive) break;
  }
  // lot 4 refonte v2 (J11) : sort hybride soin+degats — rend soinPct des degats a l'allie le plus blesse
  if (spell && spell.soinPct && dealt > 0) {
    const hurt = ctx.teamAll().filter((a) => a.alive && a.hp < a.maxHp).sort((a, b) => a.hp - b.hp)[0];
    if (hurt) {
      const amount = Math.min(Math.max(1, Math.round(dealt * spell.soinPct)), Math.max(0, hurt.maxHp - hurt.hp));
      if (amount > 0) { hurt.hp += amount; ctx.events.push({ type: 'heal', side: 'team', sourceId: u.uid, targetId: hurt.uid, amount, kind: 'special' }); }
    }
  }
  if (!spell && cmU.splash) {
    const ratio = cmU.splash / cmU.strike;
    const others = ctx.enemyAll().filter((f) => f !== target && f.alive);
    for (const f of others) {
      const half = Math.max(1, Math.round(dmg * ratio));
      const crit = rollCrit(u, f, ctx.state.rng); // Lot 1
      const halfC = crit ? Math.max(1, Math.round(half * elementMult(atkEl, f.element) * M.CRIT_MULT)) : Math.max(1, Math.round(half * elementMult(atkEl, f.element)));
      ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: f.uid, amount: halfC, kind, mana: u.mana, elem: elementTag(atkEl, f.element), side: 'team', ...(crit ? { crit: true } : {}) });
      applyDamage(f, halfC, ctx.events, 'enemies', null, true, { state: ctx.state, crit });
    }
  }
  if (u.gimmick === 'volee') {
    const others = ctx.enemyAll().filter((f) => f !== target && f.alive);
    if (others.length) {
      const t2 = others[0];
      const half = Math.max(1, Math.round(dmg * M.BELIER_SPLASH));
      const crit = rollCrit(u, t2, ctx.state.rng); // Lot 1
      const halfC = crit ? Math.max(1, Math.round(half * elementMult(atkEl, t2.element) * M.CRIT_MULT)) : Math.max(1, Math.round(half * elementMult(atkEl, t2.element)));
      ctx.events.push({ type: 'attack', sourceId: u.uid, targetId: t2.uid, amount: halfC, kind, mana: u.mana, elem: elementTag(atkEl, t2.element), side: 'team', ...(crit ? { crit: true } : {}) });
      applyDamage(t2, halfC, ctx.events, 'enemies', null, false, { state: ctx.state, crit });
    }
  }
  if (!ctx.enemyAll().length) { ctx.finish('team'); return true; }
  ctx.firstAttack = false;
  return false;
}

function actTeamSupport(s, ctx, step) {
  if (!s.alive) return;
  const supAct = step && step.tacAct ? step.tacAct : null;
  // boucle v2 lot 1 : la ligne support peut aussi boire une potion (coûte son tour)
  if (supAct && supAct.kind === 'item') {
    ctx.events.push(...drinkPotion(s, supAct.potion));
    return;
  }
  // retour terrain : l'etat voyage jusqu'au support (esquive, zone, fureur, sorts hostils)
  applySupport(s, ctx.state.team, ctx.state.mods, ctx.events, 'team', ctx.enemyAll(), ctx.state, supAct);
}

// refonte IA lot 1 : score d'utilité de ciblage partagé IA ennemie / Auto joueur
// (kill possible, opposition d'élément, menace, ligne arrière protégée, fragilité) — poids en data
function targetUtilityScore(attacker, t, dmgBase, st, side, atkEl = attacker.element) {
  const dmg = Math.max(1, Math.round(dmgBase * elementMult(atkEl, t.element)));
  let s = 0;
  if (t.hp <= dmg) s += M.TARGET_KILL_BONUS;
  if (elementTag(atkEl, t.element) === 'fort') s += M.ELEMENT_ADVANTAGE_BONUS;
  s += M.TARGET_THREAT_WEIGHT * (t.atk ?? 0);
  if (st && backProtected(st, side, t, false)) s -= M.TARGET_BACK_PENALTY;
  return s - t.hp;
}

// sélection argmax + hystérésis anti flip-flop : la cible en cours est conservée si elle
// reste vivante et dans la marge TARGET_HYSTERESIS du meilleur score (skill utility-ai : inertie)
function pickTargetByUtility(attacker, targets, dmgBase, st, side, atkEl = attacker.element) {
  if (!targets.length) return null;
  // J9 (moteur v2) : provocation à charges — un défenseur qui provoque est visé d'abord
  const provoked = targets.filter((t) => t.alive && t.status && t.status.taunt && t.status.taunt.charges > 0);
  if (provoked.length) {
    const t = provoked.sort((a, b) => b.status.taunt.charges - a.status.taunt.charges)[0];
    t.status.taunt.charges -= 1;
    if (st) { st.lastTarget = st.lastTarget ?? {}; st.lastTarget[side] = t.uid; }
    return t;
  }
  const ranked = targets
    .map((t) => ({ item: t, score: targetUtilityScore(attacker, t, dmgBase, st, side, atkEl) }))
    .sort((a, b) => b.score - a.score);
  let best = ranked[0].item;
  const bestScore = ranked[0].score;
  if (st) {
    const last = st.lastTarget ? st.lastTarget[side] : null;
    const prev = last ? targets.find((t) => t.uid === last) : null;
    if (prev && targetUtilityScore(attacker, prev, dmgBase, st, side, atkEl) >= bestScore - M.TARGET_HYSTERESIS) {
      best = prev;
    }
    // lot 3 : profil de difficulté — une part des choix est volontairement sous-optimale
    // (graine IA dédiée, déterministe, jamais le RNG de combat)
    const sub = st.iaProfile ? st.iaProfile.suboptimal ?? 0 : 0;
    if (sub > 0 && st.iaRng && ranked.length > 1 && st.iaRng() < sub) {
      best = ranked[1].item;
    }
    st.lastTarget = st.lastTarget ?? {};
    st.lastTarget[side] = best.uid;
  }
  return best;
}

function enemyPickTarget(e, targets, dmgBase, st = null, atkEl = e.element) {
  if (st) return pickTargetByUtility(e, targets, dmgBase, st, 'enemies', atkEl);
  const score = (t) => {
    const dmg = Math.max(1, Math.round(dmgBase * elementMult(atkEl, t.element)));
    let s = 0;
    if (t.hp <= dmg) s += M.TARGET_KILL_BONUS;
    if (elementTag(atkEl, t.element) === 'fort') s += M.ELEMENT_ADVANTAGE_BONUS;
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
  const targets = ctx.teamAll(); // Option A : l'arrière est ciblable tant que des cibles vivent
  if (!targets.length) return false;
  const spell = pickSpell(e, { state: ctx.state, allies: enemies, foes: targets, side: 'enemies' });
  // correctifs v1.51 lot 1 : symétrie — la SIGNATURE (cat 'unique') alliée de la ligne d'attaque
  // ennemie se résout par son rôle (soigne le plus blessé de son camp, buff/bouclier l'avant)
  if (spell && spell.cat === 'unique') {
    const eSd = spellSideOf(spell);
    const eRole = spell.role ?? null;
    if ((eSd === 'self' || eSd === 'ally' || eSd === 'team') && (eRole === 'soin' || eRole === 'boost' || eRole === 'bouclier')) {
      const eAllies = ctx.enemyAll().filter((x) => x.alive);
      let t = e;
      if (eRole === 'soin') t = [...eAllies].sort((a, b) => a.hp - b.hp)[0] ?? e;
      else t = eAllies.filter((x) => x.rang === 'avant')[0] ?? eAllies[0] ?? e;
      const big = !!spell.big || spell.cost >= 5;
      if (eRole === 'soin') {
        const amount = Math.min(Math.max(1, Math.round(statOf(e) * (spell.mult ?? 1))), Math.max(0, t.maxHp - t.hp));
        ctx.events.push({ type: 'cast', side: 'enemies', sourceId: e.uid, name: spell.name, big, fx: 'heal', mana: e.mana });
        if (amount > 0) { t.hp += amount; ctx.events.push({ type: 'heal', side: 'enemies', sourceId: e.uid, targetId: t.uid, amount, kind: 'special' }); }
      } else if (eRole === 'bouclier') {
        const amount = Math.min(Math.round(statOf(e) * (spell.mult ?? 1)), Math.max(0, t.maxHp - t.hp));
        ctx.events.push({ type: 'cast', side: 'enemies', sourceId: e.uid, name: spell.name, big, fx: 'atk', mana: e.mana });
        t.shield += amount;
        ctx.events.push({ type: 'shield', side: 'enemies', sourceId: e.uid, targetId: t.uid, amount, kind: 'special' });
      } else {
        const value = Math.max(0, (spell.mult ?? 1) - 1);
        ctx.events.push({ type: 'cast', side: 'enemies', sourceId: e.uid, name: spell.name, big, fx: 'atk', mana: e.mana });
        t.atkBuff = (t.atkBuff ?? 0) + value;
        ctx.events.push({ type: 'buff', side: 'enemies', sourceId: e.uid, targetId: t.uid, kind: 'atk', value, kindTag: 'special' });
      }
      return false;
    }
  }
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
  const eBaseAtk = spell && statPrincipaleOf(e.classe) === 'int' ? e.int : e.atk;
  const dmgBase = Math.max(1, Math.round(eBaseAtk * (1 - ctx.reduction('team')) * (spell ? spell.mult : cmE.strike) * (1 - eCurse) * ctx.rage * belierBoost * rangAtkMult(ctx.state, 'enemies', e)));
  const kind = spell ? 'special' : 'basic';
  const eAtkEl = atkElementOf(e, spell); // Lot B : idem côté ennemis
  const target = enemyPickTarget(e, targets, dmgBase, ctx.state, eAtkEl);
  const gRed = Math.min(DMG_REDUCTION_MAX, mods.dmgReduction || 0);
  const tRed = target.status && target.status.dmgRed ? target.status.dmgRed.pct : 0;
  const redFactor = gRed >= DMG_REDUCTION_MAX ? 1
    : Math.max(0, (1 - Math.min(DMG_REDUCTION_MAX, gRed + tRed)) / (1 - gRed));
  const dmg = Math.max(1, Math.round(dmgBase * redFactor * elementMult(eAtkEl, target.element)));
  const eHits = targets.some((t) => t.status && t.status.slow > 0) ? 2 : 1;
  let dmgFinal = dmg;
  let died = false;
  if (!spell && cmE.wave) {
    for (const t of targets.filter((t) => t !== target)) {
      if (!t.alive) continue;
      const tRed2 = t.status && t.status.dmgRed ? t.status.dmgRed.pct : 0;
      const rf2 = gRed >= DMG_REDUCTION_MAX ? 1
        : Math.max(0, (1 - Math.min(DMG_REDUCTION_MAX, gRed + tRed2)) / (1 - gRed));
      const critW = rollCrit(e, t, ctx.state.rng); // Lot 1 (branche basic)
      const d2 = Math.max(1, Math.round(dmgBase * rf2 * elementMult(eAtkEl, t.element) * (critW ? M.CRIT_MULT : 1)));
      ctx.events.push({ type: 'attack', sourceId: e.uid, targetId: t.uid, amount: d2, kind, mana: e.mana, elem: elementTag(eAtkEl, t.element), side: 'enemies', ...(critW ? { crit: true } : {}) });
      died = applyDamage(t, d2, ctx.events, 'team', { allies: ctx.teamAll() }, true, { state: ctx.state, crit: critW }) || died;
      if (t.alive && t.status && t.status.reflect && d2 > 0) {
        const back = Math.max(1, Math.round(d2 * t.status.reflect.pct));
        ctx.events.push({ type: 'attack', sourceId: t.uid, targetId: e.uid, amount: back, kind: 'special', mana: t.mana, elem: null, side: 'team' });
        applyDamage(e, back, ctx.events, 'enemies', { allies: ctx.enemyAll() }, false, { state: ctx.state });
      }
    }
  }
  if (cmE.exec && target.hp < target.maxHp * cmE.execBelow) {
    dmgFinal = Math.max(1, Math.round(dmg * (1 + cmE.exec)));
    ctx.events.push({ type: 'status', side: 'team', targetId: target.uid, kind: 'exec', value: cmE.exec });
  }
  for (let h = 0; h < eHits && target.alive; h++) {
    const dodgeT2 = Math.min(M.DODGE_CAP, (classeMods(target).dodge || 0) + Math.max(0, (e.agi - target.agi)) * M.DODGE_PER_AGI);
    if (dodgeT2 > 0 && ctx.state.rng() < dodgeT2) {
      ctx.events.push({ type: 'dodge', side: 'team', sourceId: e.uid, targetId: target.uid });
      break;
    }
    const crit = !spell && rollCrit(e, target, ctx.state.rng); // Lot 1 : apres l'esquive, frappes physiques seules
    if (crit) dmgFinal = Math.max(1, Math.round(dmgFinal * M.CRIT_MULT));
    ctx.events.push({ type: 'attack', sourceId: e.uid, targetId: target.uid, amount: dmgFinal, kind, mana: e.mana, elem: elementTag(eAtkEl, target.element), side: 'enemies', ...(crit ? { crit: true } : {}) });
    if (target.gimmick === 'voile' && ctx.state.rng() < M.VOILE_CHANCE) {
      ctx.events.push({ type: 'cast', side: 'team', sourceId: target.uid, name: 'Voile de Brume', fx: 'heal', mana: target.mana });
    } else {
      const partner = target.linkedTo ? ctx.teamAll().find((a) => a.uid === target.linkedTo) : null;
      if (partner) {
        const half = Math.max(1, Math.round(dmgFinal / 2));
        ctx.events.push({ type: 'link', side: 'team', sourceId: target.uid, targetId: partner.uid, amount: half });
        died = applyDamage(target, dmgFinal - half, ctx.events, 'team', { allies: ctx.teamAll() }, true, { state: ctx.state }) || died;
        applyDamage(partner, half, ctx.events, 'team', { allies: ctx.teamAll() }, true, { state: ctx.state });
      } else {
        died = applyDamage(target, dmgFinal, ctx.events, 'team', { allies: ctx.teamAll() }, true, { state: ctx.state, crit }) || died;
      }
      if (target.alive && target.status && target.status.reflect && dmgFinal > 0) {
        const back = Math.max(1, Math.round(dmgFinal * target.status.reflect.pct));
        ctx.events.push({ type: 'attack', sourceId: target.uid, targetId: e.uid, amount: back, kind: 'special', mana: target.mana, elem: null, side: 'team' });
        applyDamage(e, back, ctx.events, 'enemies', { allies: ctx.enemyAll() }, false, { state: ctx.state });
      }
      if (target.alive && target.gimmick === 'mirage' && dmg > 0) {
        const reflet = Math.max(1, Math.round(dmg * M.REFLECT_SHARE));
        ctx.events.push({ type: 'attack', sourceId: target.uid, targetId: e.uid, amount: reflet, kind: 'basic', mana: target.mana, elem: null, side: 'team' });
        applyDamage(e, reflet, ctx.events, 'enemies', null, false, { state: ctx.state });
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
    for (const u of ctx.teamAll().filter((x) => x.rang === 'avant')) {
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
    // retour terrain : la designation d'ennemi voyage jusqu'a la resolution (frappe et sorts hostils des supports)
    tacAct = { kind: stepChoice.kind, idx: stepChoice.idx, allyUid: stepChoice.allyUid, targetUid: stepChoice.targetUid ?? null, potion: stepChoice.potion ?? null, reserveIdx: stepChoice.reserveIdx ?? null };
    if (stepChoice.targetIdx !== null && stepChoice.targetIdx !== undefined) targetIdx = stepChoice.targetIdx;
    else if (stepChoice.targetUid != null) {
      const ti = [...state.enemies.avant, ...state.enemies.arriere].findIndex((x) => x.uid === stepChoice.targetUid);
      if (ti >= 0) targetIdx = ti;
    }
  }
  const step = { tacAct, targetIdx };
  let done = false;
  // Lot A : switch volontaire « Échanger » — l'entrant dépense le tour (le sortant est benché, l'entrant n'est pas dans items)
  if (tacAct && tacAct.kind === 'swap' && it.side === 'team') {
    const ri = tacAct.reserveIdx ?? 0;
    const r = (state.reserve ?? [])[ri];
    if (r && r.alive) {
      const out = it.u;
      state.team.avant[it.idx] = r;
      r.rang = 'avant';
      out.rang = 'reserve';
      out.benched = true;
      state.reserve[ri] = out;
      ctx.events.push({ type: 'swap', out: out.uid, in: r.uid, outName: out.name, inName: r.name, voluntary: true });
    }
  } else if (it.side === 'team' && it.kind === 'strike') done = actTeamStriker(it.u, it.idx, ctx, step);
  else if (it.side === 'team' && it.kind === 'support') actTeamSupport(it.u, ctx, step);
  else if (it.side === 'enemies' && it.kind === 'strike') done = actEnemyStriker(it.u, ctx);
  else actEnemySupport(it.u, ctx);
  replaceKoTeam(state, ctx); // Lot A : remplacement automatique des K.O. du camp joueur, sans consommer de tour
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
      } else if (nxt.side === 'team' && nxt.kind === 'support' && choices.arriere) {
        sc = choices.arriere[nxt.idx] ?? null;
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
  // lot 5 donjons : la difficulté Royale = Normale + ROYALE_LEVEL_BONUS niveaux, boss royal
  if (id === 'royale') { const base = DIFFICULTIES[1] ?? DIFFICULTIES[0]; return { ...base, id: 'royale', name: 'Royale', royale: true }; }
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[0];
}

// boucle v2 lot 2 : niveau de donjon de chaque marche (donjon × mode), 1 → 25
// (dungeon.tier * nombre de modes + id du mode : 5 donjons × 5 modes = 25 marches)
function dungeonLevelOf(dungeonId, diff = 1) {
  const d = dungeonById(dungeonId);
  const n = DIFFICULTIES.length;
  // lot 5 : les donjons de famille ont leur palier propre (hors grille 25 marches des majeurs)
  if (!d.majeur && d.palier != null) {
    return stretchLevel(d.palier) + (diff === 'royale' ? (M.ROYALE_LEVEL_BONUS ?? 10) : 0);
  }
  const base = (d.tier ?? 0) * n + Math.max(1, Math.min(n, Number(diff) || 1));
  // lot 9 : la grille des majeurs est étirée sur la grille v1 (1-100) via stretchLevel
  return diff === 'royale' ? stretchLevel(base) + (M.ROYALE_LEVEL_BONUS ?? 10) : stretchLevel(base);
}

// bande de rareté d'une marche, en données (bande[0] → bande[1])
function bandOf(diff) {
  const D = difficultyById(diff);
  return D.bande ?? [D.minR, D.mobCap];
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

// lot 9 XP 1-100 : niveaux de donjon étirés sur la grille v1 — les marches historiques (<= LEGACY_LEVEL_CAP)
// sont projetées affine 1+(l-1)*STRETCH ; les paliers déjà posés sur la grille v1 (divins 95-100) restent tels quels
function stretchLevel(lvl) {
  const l = Math.max(1, lvl ?? 1);
  const cap = M.LEGACY_LEVEL_CAP ?? 25;
  if (l > cap) return l;
  const s = M.DUNGEON_LEVEL_STRETCH ?? 1;
  return 1 + Math.round((l - 1) * s);
}

function levelIn(dungeon, stage, rarity = 'C', boss = false) {
  return stretchLevel(levelAt(stage, rarity, boss) + Math.round(dungeon.tier * M.DUNGEON_TIER_LEVEL_MULT));
}

function hashSeed(seed, stage) {
  return (seed ^ Math.imul(stage, 0x9e3779b9)) >>> 0;
}

function wavePower(wave) {
  let p = 0;
  for (const u of [...wave.avant, ...wave.arriere]) {
    p += (u.atk + u.hp) * (1 + LEVEL_BONUS * ((u.level ?? 1) - 1));
  }
  return p;
}

function spreadAt(stage) {
  if (stage <= 2) return 1;
  if (stage <= 4) return 2;
  return 3;
}

// v3.4 lot bug bosses (suite 16, livré avec la 3.4) : mapping boss -> carte dédiée (plus de renommage aléatoire)
// v3.4 : carte de boss dédiée par donjon x étage — lue dans les données (dungeons.bossCards), jamais en dur (EXI-MOD-1)
const BOSS_CARD_MAP = Object.fromEntries(DUNGEONS.map((d) => [d.id, d.bossCards ?? {}]));

function makeWave(seed, stage, dungeonId = 'marees', diff = 1, runMod = null, waveSizeRange = null) { // v1.38 lot 2 : waveSizeRange = [min,max] en data (combats de zone)
  const rng = mulberry32(hashSeed(seed, stage));
  const dungeon = dungeonById(dungeonId);
  const DIFF = difficultyById(diff);
  const royale = diff === 'royale'; // lot 5 : Royale = +ROYALE_LEVEL_BONUS niveaux, boss royal du donjon
  // boucle v2 lot 2 : la bande de rareté de la marche pilote le bestiaire (thématique, croissant par mode)
  const [bandMin, bandMax] = bandOf(diff);
  const minRank = RANK[bandMin] ?? RANK[DIFF.minR];
  const capRank = Math.min(RANK[bandMax] ?? RANK[DIFF.mobCap], minRank + spreadAt(stage));
  const POOL = monstersOf(dungeon.id);
  const levelFor = (rarity, boss = false) => levelIn(dungeon, stage, rarity, boss) + (royale ? (M.ROYALE_LEVEL_BONUS ?? 10) : 0);

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
  const isBoss = isFinal || DIFF.allBoss || stage % 5 === 0; // lot 5 : étage final d'un donjon de famille (floors 3) est toujours un boss
  let wave;
  if (isBoss) {
    const bossRarity = isFinal ? DIFF.boss10 : DIFF.boss5;
    const [hpMult, atkMult] = isFinal ? [M.FINAL_HP_MULT, M.FINAL_ATK_MULT] : stage % 5 === 0 ? [M.BOSS_HP_MULT, M.BOSS_ATK_MULT] : [M.ELITE_HP_MULT, M.ELITE_ATK_MULT];
    // gel lot I (suite 16) + lot 5 : escalier de boss (bossPaliers), boss de la Royale quand present
    // v3.4 : BOSS_CARD_MAP (carte dédiée donjon x étage) prioritaire hors Royale, fallback bossPaliers/bossCards
    const bossCardId = (royale && dungeon.royale?.boss) ? dungeon.royale.boss
      : (BOSS_CARD_MAP[dungeonId]?.[stage] ?? dungeon.bossPaliers?.find((bp) => bp.floor === stage)?.ref ?? dungeon.bossCards?.[String(stage)]);
    const bossCard = bossCardId ? (MONSTERS.find((m) => m.id === bossCardId) ?? POOL.find((c) => c.id === bossCardId)) : null;
    const boss = bossCard
      ? { ...bossCard, level: levelFor(bossCard.rarity, true), atk: Math.max(1, Math.round(bossCard.atk * (M.WAVE_VAR_MIN + M.WAVE_VAR_SPAN * rng()) * atkMult)), hp: Math.max(1, Math.round(bossCard.hp * (M.WAVE_VAR_MIN + M.WAVE_VAR_SPAN * rng()) * hpMult)) }
      : scaled(POOL, hpMult, atkMult, RANK[bossRarity], RANK[bossRarity]);
    boss.name = dungeon.bossNames?.[stage] ?? boss.name;
    boss.boss = true;
    boss.final = isFinal;
    boss.level = levelFor(boss.rarity, true);
    const minions = isFinal ? [scaled(POOL), scaled(POOL)] : [scaled(POOL)];
    const supports = isFinal ? [scaled(POOL), scaled(POOL)] : [scaled(POOL)];
    wave = { avant: [boss, ...minions], arriere: supports };
  } else {
  const n = waveSizeRange ? Math.max(1, Math.min(waveSizeRange[1], waveSizeRange[0] + Math.floor(rng() * (waveSizeRange[1] - waveSizeRange[0] + 1)))) : 2 + (rng() > M.WAVE_EXTRA_CHANCE ? 1 : 0);
  const supCount = stage >= 2 && rng() > M.WAVE_SUP_CHANCE ? 1 : 0;
  wave = {
    avant: Array.from({ length: n }, () => scaled(POOL)),
    arriere: Array.from({ length: supCount }, () => scaled(POOL)),
  };
  }

  
  let prev = stage - 1;
  if (prev >= 1) {
    const prevP = wavePower(makeWave(seed, prev, dungeonId, diff)) * M.WAVE_POWER_GROWTH;
    let guard = 0;
    while (wavePower(wave) <= prevP && guard++ < 200) {
      for (const u of [...wave.avant, ...wave.arriere]) {
        u.atk = Math.max(1, Math.round(u.atk * M.WAVE_ATK_STEP));
        u.hp = Math.max(1, Math.round(u.hp * M.WAVE_HP_STEP));
      }
    }
  }
  
  if (runMod === 'horde') {
    wave.avant.push(scaled(POOL));
  } else if (runMod === 'muraille') {
    for (const u of [...wave.avant, ...wave.arriere]) u.hp = Math.max(1, Math.round(u.hp * M.RUNMOD_MURaille_HP));
  } else if (runMod === 'rage') {
    for (const u of [...wave.avant, ...wave.arriere]) u.atk = Math.max(1, Math.round(u.atk * M.RUNMOD_RAGE_ATK));
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
  const atks = pickN(pool, 3).map((c, i) => scaled(c, i === 0));
  const sups = pickN(pool, 2).map((c) => scaled(c));
  return { avant: atks, arriere: sups };
}

function drawDailyCommon(rng = roll) {
  const r = rng();
  const race = r < M.DAILY_RACE_HUM ? 'humaine' : r < M.DAILY_RACE_MONSTRE ? 'monstre' : r < M.DAILY_RACE_MYSTIQUE ? 'mystique' : 'divine';
  // rang N (phase 1) : le tirage donne la naissance de la race ; les communes divines restent la porte divine
  const naissRar = (rc) => (rc === 'divine' ? 'C' : 'N');
  const poolFor = (rc) => CATALOG.filter((c) => c.raciale && c.rarity === naissRar(raceOfCard(c)) && raceOfCard(c) === rc && cardAvailable(c) && !c.archived);
  let pool = poolFor(race);
  if (!pool.length) pool = poolFor('humaine');
  const fallback = pool.length ? pool : CATALOG.filter((c) => c.raciale && c.rarity === naissRar(raceOfCard(c)) && cardAvailable(c) && !c.archived);
  return fallback[Math.floor(rng() * fallback.length)];
}

// T1.3 : tirage pur d'une naissance. Boucle v2 lot 5 : le rang N est exclu des drops et du
// recrutement (il vient de l'écran de départ et de la Guilde) — seules les communes divines
// (n13-n15, rang C) restent la porte divine des drops.
function drawNaissance(rng = roll, keep = () => true) {
  const pool = CATALOG.filter((c) => c.raciale && !c.archived && c.rarity !== 'N' && keep(c));
  return pool.length ? pool[Math.floor(rng() * pool.length)] : null;
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
  const all = [...pool];
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

// boucle v2 lot 3 : vaincus éligibles au recrutement naturel (hors boss et nommés — un nommé
// porte un nom complet « prénom, titre » avec virgule)
function recrutableMonsters(state) {
  return [...(state.enemies?.avant ?? []), ...(state.enemies?.arriere ?? [])]
    .filter((u) => u && !u.boss && !(u.name ?? '').includes(','));
}

// la zone (phase 3, EXI-P3-3) : 3 cibles contiguës sur 5, centre en auto, sans glissement
function pickZoneTargets(ligne, choix = null) {
  const largeur = 3;
  const debut = choix !== null
    ? Math.max(0, Math.min(choix, ligne.length - largeur))
    : Math.floor((ligne.length - largeur) / 2);
  return ligne.slice(debut, debut + largeur).filter((u) => u.hp > 0);
}
