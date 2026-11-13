#!/usr/bin/env node
// audit-sorts.mjs : passe EXHAUSTIVE sur tous les sorts jouables en combat (lignées, communs, race,
// classe, signatures des cartes ET des monstres), chaque sort REJOUÉ en combat réel (moteur du dist,
// tour du lanceur isolé via beginRound/stepRound), effets observés comparés à la fiche que la
// fenêtre d'action affiche (role, cible, zone affichée, mult).
// Sortie : audit-sorts-resultat.json + résumé console.
import { writeFileSync } from 'node:fs';
import { bootDist } from './stub.mjs';

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const { api } = bootDist('dist.html');
const spellSideOf = api.spellSideOf;
const signatureMetaOf = api.signatureMetaOf;
const zoneWidthOf = api._zoneWidthOf;

const foeCard = (id) => ({ id, name: 'Mannequin', rarity: 'C', classe: 'Témoin', element: 'Neutre', atk: 1, hp: 500000, agi: 999, int: 999, spells: [] });

// fiche telle que la fenêtre d'action la lit (ui.js bindActionButtons + spellMetaHtml/spellBadgeHtml)
function ficheDe(sp, card) {
  let role = sp.role ?? null;
  let cible = sp.cible ?? null;
  if (sp.cat === 'unique' && (!role || !cible)) {
    const m = signatureMetaOf(card);
    role = role ?? m.role; cible = cible ?? m.cible;
  }
  const side = spellSideOf({ ...sp, role, cible });
  return { role, cible, side, zoneAffichee: zoneWidthOf(sp.name) };
}

function jouerTour(card, k, seed) {
  const ally = { ...api.byId('n1'), id: 'ally', name: 'Témoin' };
  const state = api.initCombat({ avant: [{ ...card }, ally], arriere: [] }, [foeCard('foe1'), foeCard('foe2'), foeCard('foe3')], seed);
  const u0 = state.team.avant[0];
  const u1 = state.team.avant[1];
  u0.mana = 99999; u0.manaMax = 99999;
  u1.hp = Math.max(1, Math.floor(u1.maxHp / 2));
  api.beginRound(state);
  let evs = [];
  let guard = 0;
  let atk = 1;
  while (guard++ < 60) {
    const it = api.peekRound(state);
    if (!it) break;
    if (it.side === 'team' && it.u && it.u.uid === u0.uid) {
      atk = u0.atk;
      evs = api.stepRound(state, { kind: 'spell', idx: k, targetIdx: 0, allyUid: u1.uid }).events;
      break;
    }
    api.stepRound(state, null);
  }
  state.round = null;
  const foesApres = [...state.enemies.avant, ...state.enemies.arriere];
  return { events: evs, atk, u1, foesApres, reserve: (state.reserve ?? []).length };
}

function auditer(card, k, porteur) {
  const sp = card.spells[k];
  const f = ficheDe(sp, card);
  const res = {
    porteur, carteId: card.id, monstre: !!card.monster, famille: card.family ?? null, gimmick: card.gimmick ?? null,
    k, sort: sp.name ?? null, cat: sp.cat ?? null, cost: sp.cost ?? null,
    cibleData: sp.cible ?? null, roleData: sp.role ?? null, mult: sp.mult ?? null, dotData: sp.dot ?? null,
    desc: sp.desc ?? null,
    roleFenetre: f.role, cibleFenetre: f.cible, sideFenetre: f.side, zoneAffichee: f.zoneAffichee,
  };
  const agg = {
    runs: 0, cast: 0, atkTotal: 0, dmg: 0, dmgParCibleMax: 0, foesTouchesMax: 0,
    heal: 0, buff: 0, buffValeur: 0, shield: 0, stun: 0, dot: 0, slow: 0, curse: 0,
    reserve: 0, statusAutres: {}, divers: {},
  };
  for (const seed of SEEDS) {
    const r = jouerTour(card, k, seed);
    if (!r.events.length && agg.runs > 0) { /* skip */ }
    agg.runs++;
    agg.atk = r.atk;
    const lanceur = `${card.id}.a0`;
    let dmgRun = 0;
    const foesT = new Set();
    for (const e of r.events) {
      if (e.type === 'cast') agg.cast++;
      else if (e.type === 'attack' && e.sourceId === lanceur) {
        dmgRun += e.amount;
        if (e.targetId && e.targetId !== 'all') foesT.add(e.targetId);
      } else if (e.type === 'attack' && e.targetId === lanceur) { /* renvoi/reflect : ignorer */ }
      else if (e.type === 'heal' && e.sourceId === lanceur) agg.heal += e.amount;
      else if (e.type === 'buff' && e.sourceId === lanceur) { agg.buff++; agg.buffValeur = e.value; }
      else if (e.type === 'shield' && e.sourceId === lanceur && e.kind === 'special') agg.shield += e.amount;
      else if (e.type === 'status') {
        if (e.kind === 'stun') agg.stun++;
        else if (e.kind === 'dot') agg.dot++;
        else if (e.kind === 'slow') agg.slow++;
        else if (e.kind === 'curse') agg.curse++;
        else if (e.kind !== 'tactical') agg.statusAutres[e.kind] = (agg.statusAutres[e.kind] ?? 0) + 1;
      } else if (e.type !== 'damage' && e.type !== 'dodge' && e.type !== 'block') {
        agg.divers[e.type] = (agg.divers[e.type] ?? 0) + 1;
      }
    }
    // dégâts par cible : les cibles 'all' (aoe/carrousel) touchent tout le monde
    const nT = Math.max(1, foesT.size);
    agg.dmg = Math.max(agg.dmg, dmgRun);
    agg.dmgParCibleMax = Math.max(agg.dmgParCibleMax, dmgRun / nT);
    agg.foesTouchesMax = Math.max(agg.foesTouchesMax, foesT.size);
    agg.reserve = Math.max(agg.reserve, r.reserve);
    // heal/buff/shield observés une fois suffisent (agrégat en booléens)
  }
  Object.assign(res, {
    runs: agg.runs, casts: agg.cast, atkLanceur: agg.atk,
    dmgMaxTour: agg.dmg, dmgParCibleMax: agg.dmgParCibleMax, foesTouchesMax: agg.foesTouchesMax,
    healTotal: agg.heal, buffs: agg.buff, buffValeur: agg.buffValeur, shieldTotal: agg.shield,
    stun: agg.stun, dot: agg.dot, slow: agg.slow, curse: agg.curse, reserveApres: agg.reserve,
    statusAutres: agg.statusAutres, divers: agg.divers,
  });
  res.ratioPuissance = res.mult && res.dmgParCibleMax ? Math.round((res.dmgParCibleMax / (res.atkLanceur * res.mult)) * 100) / 100 : null;
  return res;
}

// ---- verdict : fiche affichée vs effet observé ----
function verdict(r) {
  const side = r.sideFenetre;
  const role = r.roleFenetre;
  const hostileFiche = side === 'enemy' || side === 'zone' || side === 'all';
  const allyFiche = side === 'ally' || side === 'self' || side === 'team';
  const dmg = r.dmgMaxTour > 0;
  const statutPose = r.dot + r.stun + r.slow + r.curse > 0 || Object.keys(r.statusAutres).length > 0;
  r.effets = [
    dmg ? 'degats' : null, r.healTotal > 0 ? 'soin' : null, r.buffs > 0 ? 'buff-atk' : null,
    r.shieldTotal > 0 ? 'bouclier' : null, r.dot > 0 ? 'dot' : null, r.stun > 0 ? 'stun' : null,
    r.slow > 0 ? 'slow' : null, r.curse > 0 ? 'curse' : null,
    r.reserveApres > 0 ? 'renforts' : null, ...Object.keys(r.statusAutres), ...Object.keys(r.divers),
  ].filter(Boolean);
  if (r.sort == null) return 'SORT_UNDEFINED (nom absent)';
  if (r.runs === 0) return 'NON_JOUE';
  // --- côté hostile ---
  if (hostileFiche) {
    if (!dmg && !statutPose) return 'HOSTILE_MUET (rien ne se passe)';
    if (dmg && role === 'soin') return 'FICHE_SOIN_EFFET_HOSTILE';
    // fiche contrôle/malus mais AUCUN statut posé : le badge ment (frappe seule)
    if ((role === 'controle' || role === 'malus') && !r.stun && !r.slow && !r.dot && !r.curse && !Object.keys(r.statusAutres).length) {
      return `FICHE_${role === 'controle' ? 'CONTROLE' : 'MALUS'}_SANS_EFFET (badge affiché, frappe seule)`;
    }
    const cibleZone = typeof r.cibleFenetre === 'string' && (r.cibleFenetre.includes('zone') || r.cibleFenetre.includes('tous'));
    if (!cibleZone && r.foesTouchesMax > 1) return 'ZONE_INATTENDUE (fiche monocible, frappe multiple)';
    if (cibleZone && r.zoneAffichee > 1 && r.foesTouchesMax > r.zoneAffichee + 1) return 'ZONE_PLUS_LARGE_QUE_FICHE';
    const ratioMax = r.gimmick === 'belier' ? 1.75 : 1.6;
    if (dmg && r.ratioPuissance != null && (r.ratioPuissance < 0.5 || r.ratioPuissance > ratioMax)) return 'PUISSANCE_INATTENDUE';
    if (!dmg && statutPose) return 'HOSTILE_OK (contrôle/malus, pas de dégâts)';
    return 'HOSTILE_OK';
  }
  // --- côté allié ---
  if (allyFiche) {
    if (dmg && !r.healTotal && !r.buffs && !r.shieldTotal) {
      if (role === 'soin') return 'FICHE_SOIN_EFFET_HOSTILE (soin affiché, frappe réelle)';
      if (role === 'bouclier') return 'FICHE_BOUCLIER_EFFET_HOSTILE (bouclier affiché, frappe réelle)';
      if (role === 'invocation') return 'FICHE_INVOC_EFFET_HOSTILE (invocation affichée, frappe réelle)';
      return 'FICHE_ALLIEE_EFFET_HOSTILE';
    }
    if (r.healTotal > 0 || r.shieldTotal > 0) return 'ALLIE_OK';
    if (r.reserveApres > 0 || (r.divers.summon ?? 0) > 0) return 'ALLIE_OK (renfort)'; // un esprit rejoint la ligne avant (event summon), pas la réserve
    if (r.buffs > 0) {
      if (role === 'invocation') return 'INVOC_RESOLUE_EN_BUFF_ATK';
      if (role === 'manip' && r.cat === 'lignée') return `ATTAQUE_RESOLUE_EN_BUFF_ATK (lignée d'attaque, cible allié)`; // une signature manip (copy/lien) avec buff de repli est conforme
      if (r.cat === 'lignée' && (r.mult ?? 1) > 1.05 && role !== 'boost') return 'LIGNEE_MULT_RESOLUE_EN_BUFF_ATK';
      return 'ALLIE_BUFF_OK';
    }
    if (statutPose) return 'ALLIE_OK (statut)';
    return 'ALLIE_MUET (rien ne se passe)';
  }
  return 'SIDE_NULL';
}

// ---- périmètre ----
const CAT = api.CATALOG;
const lignee = [];
for (const [fam] of Object.entries(api.FAMILIES ?? {})) {
  const steps = api.FAMILIES[fam].steps;
  let porteuse = null;
  for (const sid of [...steps].reverse()) {
    const c = CAT.find((x) => x.id === sid && !x.monster);
    if (c && c.spells?.length) { porteuse = c; break; }
  }
  if (!porteuse) { lignee.push({ famille: fam, erreur: 'pas de porteuse' }); continue; }
  for (let k = 0; k < porteuse.spells.length; k++) lignee.push(auditer(porteuse, k, `${porteuse.name} (${porteuse.id})`));
}
const solo = [];
for (const c of CAT) {
  if (c.monster || c.family || !c.spells?.length) continue;
  for (let k = 0; k < c.spells.length; k++) solo.push(auditer(c, k, `${c.name} (${c.id})`));
}
const monstres = [];
const vus = new Set();
for (const c of CAT) {
  if (!c.monster || !c.spells?.length) continue;
  for (let k = 0; k < c.spells.length; k++) {
    const sp = c.spells[k];
    const key = `${sp.name}|${sp.mult}|${sp.cible}|${sp.role}|${sp.cat}|${sp.cost}`;
    if (vus.has(key)) continue;
    vus.add(key);
    monstres.push(auditer(c, k, `${c.name} (${c.id})`));
  }
}

const tout = [...lignee.filter((x) => !x.erreur), ...solo, ...monstres];
for (const r of tout) r.verdict = verdict(r);
const repart = {};
for (const r of tout) repart[r.verdict] = (repart[r.verdict] ?? 0) + 1;

writeFileSync('audit-sorts-resultat.json', JSON.stringify({
  genere: new Date().toISOString(), seeds: SEEDS, total: tout.length,
  lignee: lignee.filter((x) => !x.erreur), famillesSansPorteuse: lignee.filter((x) => x.erreur),
  solo, monstres, repartition: repart,
}, null, 1));

console.log('=== AUDIT SORTS : répartition des verdicts ===');
for (const [v, n] of Object.entries(repart).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(4), v);
console.log('\n--- Anomalies ---');
for (const r of tout) {
  if (/OK/.test(r.verdict)) continue;
  console.log(`[${r.verdict}] ${r.porteur} | « ${r.sort} » cat=${r.cat} roleFenetre=${r.roleFenetre} cibleFenetre=${r.cibleFenetre} mult=${r.mult} zoneAffichee=${r.zoneAffichee} foesTouchesMax=${r.foesTouchesMax} dmg/cible=${Math.round(r.dmgParCibleMax)} ratio=${r.ratioPuissance}`);
}
console.log(`\nTotal audité : ${tout.length} sorts uniques (${lignee.filter((x) => !x.erreur).length} lignée + ${solo.length} cartes solo + ${monstres.length} signatures monstres dédupliquées)`);
