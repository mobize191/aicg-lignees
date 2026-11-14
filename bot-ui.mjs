#!/usr/bin/env node
// bot-ui.mjs — harnas UI : des bots jouent UNIQUEMENT PAR L'IHM (clics sur le DOM rendu).
//
// Différence avec bots-boucle.mjs (qui pilotait l'API moteur) : ici le bot ne touche PAS aux
// fonctions moteur pour jouer. Il clique ce qu'un joueur voit : liens de navigation, cartes de
// départ, boutons d'équipe, donjons (.enter-btn, .diff-chip), modale du modificateur (#mod-accept),
// la fenêtre d'action tactique (.act-attack / .act-item / .act-spell / .act-swap / .act-pass,
// cibles .act-target, potions .act-potion, échange .act-swap-pick), l'écran Récompenses
// (.recomp-row, #recomp-all), les modales de fin (.end-action), la Boutique ([data-buy]…),
// la Guilde ([data-compagnon], [data-evolve], [data-altar]), l'Autel des Lignées (.autel-row,
// #autel-confirm), la Collection (.fam-card), l'Inventaire (#sell-brut) et les Terres Sauvages
// (.enter-zone, dialogues d'errance, porte de donjon #dj-normale/#dj-royale).
// Le déplacement d'errance reste inertiel/canvas : le bot pose la cible comme le handler
// pointerdown du canvas (setTarget + pending) et LAISSE la boucle rAF de l'UI déplacer le héros,
// déclencher les rencontres et gérer les arrivées — interactions et combats se jouent par clics.
//
// Détecteurs (outre les invariants bots-boucle rejoués après CHAQUE action) :
//  - exception dans un handler de clic (un joueur la voit comme un bouton mort + console) ;
//  - écran vide / hash non changé après un clic de navigation ;
//  - fenêtre d'action sans boutons, aucune cible proposée après Attaque, cible absente ;
//  - victoire sans écran Récompenses, écran Récompenses qui ne se referme pas ;
//  - chaîne d'étages qui n'avance pas après « Tout ramasser » ;
//  - bouton d'action activé sans effet observable (or/jetons/exemplaires/équipe inchangés) ;
//  - aperçu de fusion absent après sélection de 2 parents, fusion sans effet ;
//  - modale d'entrée (modificateur) absente, passage au combat absent ;
//  - porte de donjon de zone vaincue sans déblocage de la zone suivante ;
//  - erreurs non capturées (rejets du pipeline UI) + save → load comparé.
//
// Usage :
//   node bot-ui.mjs dist.html <N> <graine>            un lot de N bots (rester ≤ ~30)
//   node bot-ui.mjs dist.html <N> <graine> --essaim   essaim : vagues de lots parallèles
//   node bot-ui.mjs dist.html <N> <graine> --lot      usage interne de l'essaim (1 JSON en sortie)
//   BOT_UI_SCALE=0.15 (délais UI compressés, ordre conservé) BOT_UI_BUDGET=90 (s/bot)
//
// Le bac à sable n'a pas de vrai canvas : getBoundingClientRect est absent des éléments du stub,
// le bot le fournit avant de simuler des pointeurs (comme le navigateur le fait).

import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { bootDist } from './stub.mjs';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

const SCALE = Number(process.env.BOT_UI_SCALE ?? '0.15'); // compression des délais UI (ordre conservé)
const BOT_BUDGET = Number(process.env.BOT_UI_BUDGET ?? '90') * 1000; // budget mur par bot
const COMBAT_BUDGET = Number(process.env.BOT_UI_COMBAT_BUDGET ?? '25') * 1000; // ms par combat
const ERRANCE_BUDGET = 14_000; // ms par excursion d'errance (marche accélérée par la fausse horloge)

// ---------------------------------------------------------------------------
// Un bot = une partie complète jouée par CLICS
// ---------------------------------------------------------------------------
async function runBot(distPath, seed, log = () => {}) {
  const rng = mulberry32(seed || 1);
  const b = bootDist(distPath);
  const { api, doc, els, errors } = b;
  const ctx = b.ctx;
  const store = api.store;
  const rep = {
    seed, actions: 0, clicks: 0, combats: 0, wins: 0, draws: 0, losses: 0, fusions: 0,
    achats: 0, captures: 0, unlocked: 0, timeouts: 0, anomalies: [], exceptions: [], refus: [],
  };
  const anom = (m) => rep.anomalies.push(m);
  const refu = (m) => rep.refus.push(m);
  let label = 'init';
  const tBot = Date.now();
  const outOfTime = () => Date.now() - tBot > BOT_BUDGET;

  api._speed(6); // replay instantané : le bot ne regarde pas les animations

  // horloge de jeu accélérée : la boucle d'errance (rAF) mesure le temps réel via performance.now ;
  // on l'avance K× pour que la marche du héros ne prenne pas des secondes réelles par excursion.
  const tClock = Date.now();
  const K_CLOCK = Math.max(1, Math.round(1 / Math.max(0.01, SCALE)));
  ctx.performance = { now: () => tClock + (Date.now() - tClock) * K_CLOCK };

  // compression des délais UI (l'horloge du jeu va vite, l'ordre des timers est conservé)
  const realSetTimeout = ctx.setTimeout;
  if (typeof realSetTimeout === 'function') {
    ctx.setTimeout = (fn, ms, ...a) => realSetTimeout(fn, Math.max(0, Math.round((Number(ms) || 0) * SCALE)), ...a);
    const realSetInterval = ctx.setInterval;
    if (typeof realSetInterval === 'function') {
      ctx.setInterval = (fn, ms, ...a) => realSetInterval(fn, Math.max(1, Math.round((Number(ms) || 1) * SCALE)), ...a);
    }
  }

  // --- petits helpers DOM (le stub expose des objets JS : on peut lire les attrs) ---
  // NB : le stub ne sait PAS découper les sélecteurs composés (.a.b, #x.on) — toujours
  // une classe/id par token, puis filtrage par classList en JS.
  const body = doc.body;
  const app = els.get('app');
  const qall = (sel, root = body) => [...root.querySelectorAll(sel)];
  const q1 = (sel, root = body) => root.querySelector(sel) ?? null;
  const hasCls = (el, ...cs) => !!el && cs.every((c) => el.classList.contains(c));
  const enabled = (el) => !!el && el.getAttribute('disabled') === null
    && !el.classList.contains('off') && !el.classList.contains('lock');
  const click = async (el, what = 'clic') => {
    if (!el) return false;
    rep.clicks++;
    try {
      el.click();
      return true;
    } catch (e) {
      rep.exceptions.push(`${what} @${label}: ${e && e.message} | ${e && e.stack ? e.stack.split('\n')[1]?.trim() : ''}`);
      return false;
    }
  };
  const tap = async (el, what = 'tap') => {
    if (!el) return false;
    rep.clicks++;
    try {
      el.dispatch('pointerdown', { clientX: 10, clientY: 10 });
      el.dispatch('pointerup', { clientX: 10, clientY: 10 });
      return true;
    } catch (e) {
      rep.exceptions.push(`${what} @${label}: ${e && e.message}`);
      return false;
    }
  };
  const waitFor = async (fn, ms, step = 8) => {
    const t0 = Date.now();
    for (;;) {
      const v = fn();
      if (v) return v;
      if (Date.now() - t0 > ms) return null;
      await wait(step);
    }
  };
  const toastsNow = () => qall('.toast').length;
  const inCombat = () => body.classList.contains('in-combat');
  const teamLen = () => (store.team?.slots ?? []).filter(Boolean).length;
  const nInstances = () => store.instances.length;

  // le stub n'a pas getBoundingClientRect : le canvas d'errance en a besoin
  const patchRect = (el) => {
    if (el && typeof el.getBoundingClientRect !== 'function') {
      el.getBoundingClientRect = () => ({ left: 0, top: 0, width: el.width || 360, height: el.height || 480 });
    }
  };

  // --- invariants (repris de bots-boucle.mjs, correctifs bots-v1.52) ---
  const combatMax = (inst) => {
    const raw = api.CATALOG.find((c) => c.id === inst.id);
    if (!raw) return null;
    const famN = raw.family ? (store.shards?.[raw.family] ?? 0) : 0;
    if (famN > 0) return null; // bonus d'éclats de famille non exposé : pas de faux positif
    let base = { ...raw, shiny: !!inst.shiny };
    base = api.applyShinyStats(base, inst.shiny ? (inst.shinyBonus ?? 0) : 0);
    if (inst.fusionBonus) base = { ...base, atk: base.atk + (inst.fusionBonus.atk ?? 0), hp: base.hp + (inst.fusionBonus.hp ?? 0) };
    const eb = api.equipBonusOfCard(inst.id);
    const tb = api.equipTeamBonus();
    const u = api.makeUnit({
      ...base, level: inst.lvl,
      atk: Math.max(1, Math.round(base.atk)), hp: Math.max(1, Math.round(base.hp)),
      noLossPct: inst.noLoss ?? 0,
      equip: {
        atkPct: eb.atkPct + tb.atkPct, hpPct: eb.hpPct + tb.hpPct, agiPct: eb.agiPct + tb.agiPct,
        intPct: eb.intPct + tb.intPct, manaRegen: eb.manaRegen + tb.manaRegen,
      },
    }, 'botmax', inst.lvl);
    return { hp: u.maxHp, mana: u.manaMax };
  };
  const checkStore = (where) => {
    if (!Number.isInteger(store.gold) || store.gold < 0) anom(`or non entier/négatif (${store.gold}) @${where}`);
    for (const inst of store.instances) {
      if (!Number.isInteger(inst.iid) || inst.iid <= 0) anom(`iid non entier ${JSON.stringify(inst.iid)} @${where}`);
      if (!Number.isInteger(inst.lvl) || inst.lvl < 1 || inst.lvl > 100) anom(`niveau invalide ${inst.id}:${inst.lvl} @${where}`);
      if (!Number.isFinite(inst.xp) || inst.xp < 0) anom(`xp invalide ${inst.id}:${inst.xp} @${where}`);
    }
    const slots = (store.team.slots ?? []).filter(Boolean);
    if (slots.length > 5) anom(`équipe de ${slots.length} slots @${where}`);
    const vus = new Set();
    for (const iid of slots) {
      if (vus.has(iid)) anom(`doublon d'iid ${iid} en équipe @${where}`);
      vus.add(iid);
      if (!api.byIid(iid)) anom(`slot orphelin ${iid} @${where}`);
    }
    if (store.runState.active) {
      for (const [k, u] of Object.entries(store.runState.units ?? {})) {
        const inst = api.byIid(Number(k));
        if (!inst || !u) continue;
        const mx = combatMax(inst);
        if (mx) {
          if (u.hp > mx.hp + 0.51) anom(`PV pool ${u.hp} > max combat ${mx.hp} (${inst.id}) @${where}`);
          if (u.mana > mx.mana + 0.51) anom(`mana pool ${u.mana} > max combat ${mx.mana} (${inst.id}) @${where}`);
        }
        if (u.hp < 0) anom(`PV négatifs ${u.hp} (${inst.id}) @${where}`);
      }
    }
    for (const [k, v] of Object.entries(store.potions ?? {})) {
      if (!Number.isInteger(v) || v < 0) anom(`potion ${k} = ${v} @${where}`);
    }
  };

  // --- refermer tout ce qu'un joueur refermerait avant de naviguer ---
  const sweepModals = async () => {
    for (let k = 0; k < 8; k++) {
      let acted = false;
      const rec = q1('.recomp-overlay');
      if (rec) { const all = q1('#recomp-all', rec); if (all) { await click(all, 'tout-ramasser'); acted = true; } else rec.remove(); }
      const fl = qall('.modal-close').find((x) => x.parentNode === body) ?? null; // ✕ épinglé au body (pinModalClose)
      if (fl) { await click(fl, 'fermer-fiche'); acted = true; }
      for (const id of ['#info-close', '#unit-close', '#equip-close', '#recomp-close']) {
        const x = q1(id);
        if (x) { await click(x, 'fermer-modale'); acted = true; }
      }
      for (const c of [...qall('.reveal-card')]) { await click(c, 'révéler'); acted = true; }
      const cta = [...qall('.reveal-actions .btn')].at(-1) ?? null;
      if (cta) { await click(cta, 'cta-révélation'); acted = true; }
      const modAcc = q1('#mod-accept') ?? q1('#mod-free');
      if (modAcc) { await click(modAcc, 'modificateur'); acted = true; } // modale d'entrée laissée ouverte : on entre
      const djN = q1('#dj-normale');
      if (djN) { await click(djN, 'donjon-zone-normale'); acted = true; }
      const dlg = q1('#errance-dlg', app);
      if (dlg && hasCls(dlg, 'on')) { const c = q1('#errance-dlg-close', app); if (c) { await click(c, 'dialogue-errance'); acted = true; } }
      const hubPop = q1('#hub-pop-close', app);
      if (hubPop && hasCls(q1('#hub-pop', app), 'on')) { await click(hubPop, 'pop-hub'); acted = true; }
      const ea = [...qall('.end-action', app)];
      if (ea.length) { await click(ea[ea.length - 1], 'fin-de-run'); acted = true; }
      if (!acted) break;
      await wait(6);
    }
    // restes : backdrop des modales qui le ferment (comme un joueur)
    for (const ov of [...qall('.modal-overlay')]) {
      if (hasCls(ov, 'recomp-overlay')) continue;
      ov.dispatch('click', { target: ov });
    }
  };

  // --- navigation PAR CLIC : lien de nav, ou ancre du hub (délégation document-level) ---
  const findLink = (hash) => qall('nav a').find((x) => x.getAttribute('href') === hash)
      ?? qall('a', app).find((x) => x.getAttribute('href') === hash)
      ?? null;
  const navTo = async (hash) => {
    await sweepModals();
    let a = findLink(hash);
    if (!a && ctx.location.hash !== '#accueil') {
      // les ancres du hub (Autel, Terres…) ne vivent que sur l'accueil : on y passe d'abord
      const home = findLink('#accueil');
      if (home) { await click(home, 'nav #accueil'); await wait(10); }
      a = findLink(hash);
    }
    if (!a) { anom(`aucun lien vers ${hash} à l'écran @${label}`); return false; }
    if (!(await click(a, `nav ${hash}`))) return false;
    await wait(10);
    if (ctx.location.hash !== hash) { anom(`navigation ${hash} : le hash ne suit pas (${ctx.location.hash}) @${label}`); return false; }
    if (!app.children.length || (app.textContent ?? '').trim().length < 20) { anom(`écran vide après navigation ${hash} @${label}`); return false; }
    return true;
  };

  // -------------------------------------------------------------------------
  // COMBAT TACTIQUE : uniquement des clics dans la fenêtre d'action
  // -------------------------------------------------------------------------
  const playCombatUI = async () => {
    const t0 = Date.now();
    let st = api._state();
    let fenetres = 0;
    while (Date.now() - t0 < COMBAT_BUDGET) {
      st = api._state();
      if (st && st.winner) break;
      if (st && st.turn >= 60 && !api._busy() && !api._actEl()) break; // égalité : Fureur du donjon
      const am = api._actEl();
      if (am) {
        fenetres++;
        const bAtk = q1('.act-attack', am);
        const bPass = q1('.act-pass', am);
        if (!bAtk || !bPass) { anom(`fenêtre d'action sans boutons (tour ${st?.turn}) @${label}`); return { st, dead: true }; }
        const spells = qall('.act-spell', am).filter(enabled);
        const bItem = q1('.act-item', am);
        const bSwap = q1('.act-swap', am);
        const opts = [];
        if (enabled(bAtk)) opts.push('atk');
        if (spells.length) opts.push('spell');
        if (enabled(bItem)) opts.push('item');
        if (enabled(bSwap) && rng() < 0.4) opts.push('swap');
        const choix = opts.length && rng() < 0.85 ? pick(rng, opts) : 'pass';
        if (choix === 'atk') {
          await click(bAtk, 'attaque');
          const tg = await waitFor(() => q1('.act-target', am), 1500);
          if (!tg) {
            const alive = [...(st?.enemies?.avant ?? []), ...(st?.enemies?.arriere ?? [])].filter((e) => e && e.alive).length;
            if (alive > 0) anom(`aucune cible proposée après Attaque (${alive} ennemis vivants) @${label}`);
            const ca = q1('.act-cancel', am);
            if (ca) await click(ca, 'annuler-cible');
          } else {
            await click(pick(rng, qall('.act-target', am)), 'cible');
          }
        } else if (choix === 'spell') {
          const sp = pick(rng, spells);
          await click(sp, 'sort');
          // soit une cible est demandée, soit le sort se résout directement
          const tg = await waitFor(() => (api._actEl() !== am ? 'resolu' : q1('.act-target', am)), 1500);
          if (tg !== 'resolu') {
            if (tg) await click(pick(rng, qall('.act-target', am)), 'cible-sort');
            else {
              const ca = q1('.act-cancel', am);
              if (ca) await click(ca, 'annuler-sort');
              else anom(`sort sans cible ni annulation @${label}`);
            }
          }
        } else if (choix === 'item') {
          await click(bItem, 'objet');
          const po = await waitFor(() => q1('.act-potion', am), 1500);
          if (po) await click(pick(rng, qall('.act-potion', am)), 'potion');
          else {
            const ca = q1('.act-cancel', am);
            if (ca) await click(ca, 'annuler-objet');
            else anom(`aucune potion proposée (potion en stock pourtant) @${label}`);
          }
        } else if (choix === 'swap') {
          await click(bSwap, 'échanger');
          const sw = await waitFor(() => q1('.act-swap-pick', am), 1500);
          if (sw) await click(pick(rng, qall('.act-swap-pick', am)), 'réserve');
          else {
            const ca = q1('.act-cancel', am);
            if (ca) await click(ca, 'annuler-échange');
            else anom(`échange sans réserve proposée @${label}`);
          }
        } else {
          await click(bPass, 'attendre');
        }
        await wait(8);
      } else if (api._busy()) {
        await wait(12);
      } else {
        // rien en attente : le combat doit se lancer / relancer tout seul, sinon on clique #fight
        const fb = q1('#fight', app);
        if (fb) { await click(fb, 'fight'); }
        await wait(15);
      }
    }
    const draw = !!(st && !st.winner && st.turn >= 60);
    const timeout = !(st && (st.winner || st.turn >= 60));
    if (timeout) anom(`combat sans issue (budget dépassé, tour ${st?.turn}, fenêtres ${fenetres}, busy ${api._busy() ? 1 : 0}, actEl ${api._actEl() ? 1 : 0}, inCombat ${inCombat() ? 1 : 0}, hash ${ctx.location.hash}) @${label}`);
    return { st, draw, timeout, fenetres };
  };

  // écran Récompenses : chaque gain cliquable, puis « Tout ramasser » referme
  const handleRecompenses = async () => {
    const ov = await waitFor(() => q1('.recomp-overlay'), 4000);
    if (!ov) { anom(`victoire sans écran Récompenses @${label}`); return false; }
    for (const r of [...qall('.recomp-row', ov)]) {
      if (enabled(r)) {
        const avant = toastsNow();
        await click(r, 'récompense');
        if (r.textContent.includes('capture')) rep.captures++;
        await wait(4);
        if (r.textContent.includes('capture') && enabled(r)) anom(`capture toujours cliquable après essai @${label}`);
        void avant;
      }
    }
    const all = q1('#recomp-all', ov);
    if (!all) { anom(`bouton « Tout ramasser » absent @${label}`); return false; }
    await click(all, 'tout-ramasser');
    await wait(10);
    if (q1('.recomp-overlay')) { anom(`l'écran Récompenses ne se referme pas après « Tout ramasser » @${label}`); return false; }
    return true;
  };

  // modale de fin (défaite / égalité / donjon terminé) : on rentre au port
  const closeEndModal = async () => {
    const ea = await waitFor(() => qall('.end-action', app), 3000);
    if (!ea.length) return;
    await click(ea[ea.length - 1], 'fin-de-run');
    await wait(10);
    if (qall('.end-action', app).length) anom(`modale de fin non refermée @${label}`);
  };

  // -------------------------------------------------------------------------
  // UN RUN DE DONJON par clics : nav → difficulté → entrée → modificateur →
  // combats tactiques → Récompenses → la chaîne avance l'étage → …
  // -------------------------------------------------------------------------
  const runDonjonUI = async () => {
    label = 'donjon';
    if (!(await navTo('#donjons'))) return;
    const chips = qall('.diff-chip', app).filter(enabled);
    if (chips.length && rng() < 0.25) { await click(pick(rng, chips), 'difficulté'); await wait(8); }
    const btns = qall('.enter-btn', app).filter(enabled);
    if (!btns.length) { refu('aucun donjon ouvert'); return; }
    const dgBtn = pick(rng, btns);
    await click(dgBtn, 'entrer-donjon');
    await wait(15);
    const acc = await waitFor(() => q1('#mod-accept') ?? q1('#mod-free'), 2000);
    if (!acc) {
      // garde équipe du jeu (enterAt) : équipe vide => toast + go('#equipe'), pas de modale — refus légitime, pas un bug
      if (ctx.location.hash === '#equipe') { refu('équipe vide : le donjon refuse'); return; }
      anom(`entrée de donjon sans modale du modificateur @${label}`); return;
    }
    await click(rng() < 0.8 ? acc : (q1('#mod-free') ?? acc), 'modificateur');
    await wait(15);
    if (!inCombat()) { anom(`pas de passage au combat après le modificateur @${label}`); return; }
    rep.combats++;
    for (let etage = 0; etage < 40; etage++) {
      const { st, draw, timeout } = await playCombatUI();
      if (timeout) break;
      if (draw) { rep.draws++; await closeEndModal(); break; }
      const won = st.winner === 'team';
      rep.combats = etage === 0 ? rep.combats : rep.combats + 1;
      if (won) {
        rep.wins++;
        if (!(await handleRecompenses())) break;
        // entre les étages, boire une potion hors combat est gratuit (action #bag)
        if ((api.totalPotions?.() ?? 0) > 0 && rng() < 0.5) {
          const bag = q1('#bag', app);
          if (bag) {
            await click(bag, 'sac');
            const po = await waitFor(() => qall('.act-potion-out').find(enabled), 1200);
            if (po) {
              await click(po, 'potion-hors-combat');
              await wait(6);
            }
            const bc = q1('#bag-close');
            if (bc) await click(bc, 'fermer-sac');
          }
        }
        // la chaîne doit avancer l'étage (nouveau combat) OU terminer le donjon OU sortir
        let next = null;
        const t1 = Date.now();
        while (Date.now() - t1 < 4000) {
          if (!inCombat()) { next = 'out'; break; }
          const s2 = api._state();
          if (s2 && s2 !== st && !s2.winner) { next = 'stage'; break; }
          if (qall('.end-action', app).length) { next = 'fini'; break; }
          await wait(10);
        }
        if (next === 'stage') continue;
        if (next === 'fini') { await closeEndModal(); break; }
        if (next === 'out') break;
        anom(`la chaîne d'étages n'avance pas après « Tout ramasser » @${label}`);
        break;
      }
      rep.losses++;
      await closeEndModal();
      break;
    }
    await navTo('#accueil'); // retour ville : repos gratuit (comme un joueur)
  };

  // -------------------------------------------------------------------------
  // ERRANCE par clics : hub → Terres → .enter-zone → cible posée comme le
  // pointerdown du canvas → la boucle UI marche / rencontre / arrive toute seule
  // -------------------------------------------------------------------------
  const runErranceUI = async () => {
    label = 'errance';
    const wild = q1('#hub-wild', app);
    if (ctx.location.hash !== '#accueil' || !wild) { if (!(await navTo('#accueil'))) return; }
    const w2 = q1('#hub-wild', app);
    if (!w2) { refu('pas de bouton Terres'); return; }
    if (teamLen() === 0) { refu('équipe vide : le hub refuse'); return; }
    await click(w2, 'hub-terres');
    await wait(10);
    if (ctx.location.hash !== '#terres' && !(await navTo('#terres'))) return;
    const zones = qall('.enter-zone', app).filter(enabled);
    if (!zones.length) { refu('aucune zone déverrouillée'); return; }
    const zBtn = pick(rng, zones);
    const zoneId = zBtn.dataset.zone;
    await click(zBtn, 'entrer-zone');
    await wait(12);
    if (ctx.location.hash !== '#errance') { anom(`entrée de zone ${zoneId} sans passage à l'errance (${ctx.location.hash}) @${label}`); return; }
    const st = store.errance;
    if (!st) { anom(`store.errance absent après l'entrée dans ${zoneId} @${label}`); return; }
    const canvas = q1('#errance-canvas', app);
    patchRect(canvas);

    for (let trip = 0; trip < 2; trip++) {
      // cible : le POI le plus proche du héros (autel, jarre, porte du donjon)
      const map = st.map;
      const hero = st.hero;
      const d2 = (x, y) => Math.hypot((x - hero.x), (y - hero.y));
      const cibles = [
        ...(map.autel ? [{ type: 'autel', x: map.autel.x, y: map.autel.y }] : []),
        ...((map.jarres ?? []).slice(0, 3).map((j) => ({ type: 'jarre', x: j.x, y: j.y }))),
        ...(map.donjon ? [{ type: 'porte', x: map.donjon.x + Math.floor((map.donjon.w ?? 3) / 2), y: map.donjon.y + (map.donjon.h ?? 3) }] : []),
      ].sort((a, c) => d2(a.x, a.y) - d2(c.x, c.y));
      if (!cibles.length) break;
      const cible = cibles[0];
      const etaitPorte = cible.type === 'porte';
      const zonesOuvertesAvant = (api.DATA.zones ?? []).filter((z) => api.zoneUnlocked(z.id)).length;
      // miroir du handler pointerdown du canvas : tuile praticable autour du POI (anneaux 0,1,2
      // comme nearestWalkableNear) puis setTarget, le pending posé APRÈS setTarget
      const offsets = [[0, 0]];
      for (let r = 1; r <= 2; r++) {
        for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) === r) offsets.push([dx, dy]);
        }
      }
      let pose = false;
      for (const [dx, dy] of offsets) {
        if (api.setTarget(st, cible.x + dx, cible.y + dy)) { pose = true; break; }
      }
      if (!pose) { refu('chemin bloqué vers la cible'); break; }
      st.pending = { ...cible, label: cible.type };

      // la boucle UI marche toute seule : on guette combat / dialogue / arrivée
      const t0 = Date.now();
      let outcome = null;
      while (Date.now() - t0 < ERRANCE_BUDGET) {
        if (inCombat()) { outcome = 'combat'; break; }
        const djN = q1('#dj-normale');
        if (djN) { outcome = 'porte-royale'; break; }
        const dlg = q1('#errance-dlg', app);
        const dlgOn = dlg && hasCls(dlg, 'on');
        if (dlgOn) { const c = q1('#errance-dlg-close', app); if (c) await click(c, 'dialogue-errance'); }
        if (ctx.location.hash !== '#errance') { outcome = 'sortie'; break; } // retour ville atteint
        if (store.errance !== st) { outcome = 'sortie'; break; }
        if (!st.pending && !(st.hero.path ?? []).length && !(st.hero.goal)) { outcome = 'arrivé'; break; }
        await wait(25);
      }
      if (!outcome) { rep.timeouts++; break; } // excursion non terminée : on ne crée pas de faux positif
      if (outcome === 'porte-royale') {
        const choix = rng() < 0.25 ? (q1('#dj-royale') ?? q1('#dj-normale')) : (q1('#dj-normale') ?? q1('#dj-royale'));
        await click(choix, 'difficulté-porte');
        await wait(12);
        if (!inCombat()) { anom(`porte royale : pas de passage au combat @${label}`); break; }
      }
      if (inCombat()) {
        // combat de zone (rencontre ou porte) joué par clics
        const { st: zst, draw, timeout } = await playCombatUI();
        rep.combats++;
        if (timeout) break;
        const won = zst && zst.winner === 'team';
        if (draw) rep.draws++;
        else if (won) rep.wins++;
        else rep.losses++;
        if (won) {
          if (!(await handleRecompenses())) break;
          if (etaitPorte) {
            const apres = (api.DATA.zones ?? []).filter((z) => api.zoneUnlocked(z.id)).length;
            if (apres > zonesOuvertesAvant) rep.unlocked++;
            else anom(`porte de donjon vaincue sans déblocage de la zone suivante (${zoneId}) @${label}`);
          }
          // retour auto à l'errance (le jeu y revient seul)
          await waitFor(() => ctx.location.hash === '#errance' && !inCombat(), 4000);
          if (inCombat()) { anom(`toujours en combat après la victoire de zone @${label}`); break; }
        } else {
          await closeEndModal(); // défaite de zone : retour à la ville
          await waitFor(() => !inCombat(), 3000);
          break;
        }
      } else if (outcome === 'arrivé') {
        // autel / jarre : la boucle UI a traité l'arrivée (soin, éclat, toast)
        await wait(10);
      } else if (outcome === 'sortie') {
        break;
      }
      if (outOfTime()) break;
    }
    // figer le héros comme le fait le jeu avant de sortir (aucun pas fantôme ensuite)
    st.pending = null;
    st.hero.path = [];
    if (st.hero.v) { st.hero.v.x = 0; st.hero.v.y = 0; }
    const back = q1('#errance-back', app);
    if (back) { await click(back, 'retour-errance'); await wait(8); }
    await navTo('#accueil');
  };

  // -------------------------------------------------------------------------
  // ÉCONOMIE par clics : Boutique (or), Guilde (jetons), Inventaire (vente)
  // -------------------------------------------------------------------------
  const runEconomieUI = async () => {
    const r = rng();
    if (r < 0.45) {
      label = 'boutique';
      if (!(await navTo('#boutique'))) return;
      for (const sel of ['[data-buy]', '[data-buy-eclat]', '[data-buy-eq]', '[data-craft]']) {
        if (rng() > 0.5) continue;
        const sig0 = () => JSON.stringify([store.gold, store.potions, store.gems, store.equipment, store.equip]);
        const avant = sig0();
        const toasts0 = toastsNow();
        const btns = qall(sel, app).filter(enabled);
        if (!btns.length) continue;
        await click(pick(rng, btns), sel);
        await wait(8);
        if (sig0() !== avant || toastsNow() !== toasts0) rep.achats++;
        else anom(`boutique : ${sel} activé sans aucun effet ni refus affiché @${label}`);
        await sweepModals();
      }
    } else if (r < 0.8) {
      label = 'guilde';
      if (!(await navTo('#forge'))) return;
      const comp = qall('[data-compagnon]', app).filter(enabled);
      if (comp.length && rng() < 0.8) {
        const el = pick(rng, comp);
        const n0 = nInstances();
        const toasts0 = toastsNow();
        await click(el, 'recruter-compagnon');
        await wait(10);
        if (nInstances() !== n0) rep.achats++;
        else if (toastsNow() === toasts0) anom(`bouton « Recruter » actif sans effet NI refus affiché (jetons ${store.jetons}) @${label}`);
        else refu('recrutement refusé (toast ✗)');
        // modale de révélation du compagnon : révéler puis fermer
        for (const c of [...qall('.reveal-card')]) await click(c, 'révéler');
        const cta = [...qall('.reveal-actions .btn')].at(-1);
        if (cta) await click(cta, 'cta-compagnon');
        await sweepModals();
      }
      const evo = qall('[data-evolve]', app).filter(enabled);
      if (evo.length && rng() < 0.3) {
        await click(pick(rng, evo), 'évoluer');
        await wait(10);
        for (const c of [...qall('.reveal-card')]) await click(c, 'révéler');
        const cta = [...qall('.reveal-actions .btn')].at(-1);
        if (cta) await click(cta, 'cta-évolution');
        await sweepModals();
      }
      const altar = qall('[data-altar]', app).filter(enabled);
      if (altar.length && rng() < 0.2) {
        const n0 = nInstances();
        await click(pick(rng, altar), 'autel-de-génération');
        await wait(10);
        if (nInstances() !== n0) anom(`autel de génération : nombre d'exemplaires inchangé @${label}`);
        for (const c of [...qall('.reveal-card')]) await click(c, 'révéler');
        const cta = [...qall('.reveal-actions .btn')].at(-1);
        if (cta) await click(cta, 'cta-autel');
        await sweepModals();
      }
    } else {
      label = 'inventaire';
      if (!(await navTo('#inventaire'))) return;
      const sell = q1('#sell-brut', app);
      if (sell && enabled(sell) && rng() < 0.5) {
        const g0 = store.gold;
        await click(sell, 'vendre-éclats');
        await wait(8);
        if (store.gold === g0) anom(`vente d'éclats bruts sans effet @${label}`);
      }
      // pages restantes : la collection ouvre les fiches au tap
      if (rng() < 0.6 && (await navTo('#collection'))) {
        const cards = qall('.fam-card', app).filter((c) => c.classList.contains('owned') || c.classList.contains('seen'));
        if (cards.length) {
          await tap(pick(rng, cards), 'fiche-collection');
          await wait(8);
          const ov = q1('.modal-overlay');
          if (!ov) anom(`tap sur une carte de collection sans fiche ouverte @${label}`);
          await sweepModals();
        }
      }
    }
  };

  // -------------------------------------------------------------------------
  // AUTEL DES LIGNÉES par clics : 2 parents → aperçu → double confirmation
  // -------------------------------------------------------------------------
  const runFusionUI = async () => {
    label = 'autel';
    if (!(await navTo('#autel'))) return;
    // une paire plausible : même carte, ≥ 2 exemplaires libres, ni N ni M
    const teamIids = new Set((store.team.slots ?? []).filter(Boolean));
    const libres = store.instances.filter((i) => !teamIids.has(i.iid));
    const parId = new Map();
    for (const i of libres) {
      if (!parId.has(i.id)) parId.set(i.id, []);
      parId.get(i.id).push(i);
    }
    let pa = null, pb = null;
    for (const [, list] of parId) {
      if (list.length >= 2) {
        const rar = api.CATALOG.find((c) => c.id === list[0].id)?.rarity ?? 'N';
        if (rar !== 'N' && rar !== 'M') { pa = list[0]; pb = list[1]; break; }
      }
    }
    if (!pa) { refu('pas de paire de fusion plausible'); return; }
    const rowA = qall('.autel-row', app).find((r) => r.dataset.autelIid === String(pa.iid));
    if (!rowA) { refu('ligne du premier parent introuvable'); return; }
    await click(rowA, 'sélection-parent-A');
    await wait(8);
    if (!qall('.autel-row', app).some((r) => hasCls(r, 'sel'))) { anom(`sélection du parent A non répercutée à l'écran @${label}`); return; }
    const rowB = qall('.autel-row', app).find((r) => r.dataset.autelIid === String(pb.iid) && !r.classList.contains('sel'));
    if (!rowB) { refu('ligne du second parent introuvable'); return; }
    await click(rowB, 'sélection-parent-B');
    await wait(8);
    const nSel = qall('.autel-row', app).filter((r) => hasCls(r, 'sel')).length;
    if (nSel !== 2) { anom(`sélection de 2 parents non affichée (${nSel}/2) @${label}`); return; }
    const txt = (app.textContent ?? '');
    if (!txt.includes('Aperçu de la fusion')) {
      anom(`aperçu de fusion absent après sélection de 2 parents (${pa.id}) — l'écran dit : « ${txt.includes('aperçu indisponible') ? 'aperçu indisponible' : txt.slice(0, 60)} » @${label}`);
      const rst = q1('#autel-reset', app);
      if (rst) await click(rst, 'réinitialiser-autel');
      return;
    }
    const n0 = nInstances();
    const c1 = q1('#autel-confirm', app);
    if (!c1) { anom(`bouton « Fusionner » absent avec 2 parents sélectionnés @${label}`); return; }
    await click(c1, 'fusionner-1');
    await wait(8);
    const c2 = q1('#autel-confirm', app);
    if (!c2) { anom(`double confirmation : le bouton Fusionner disparaît au 1er clic @${label}`); return; }
    if (!(c2.textContent ?? '').includes('Confirmer')) { anom(`le 1er clic de confirmation n'arme pas la double confirmation @${label}`); }
    await click(c2, 'fusionner-2');
    await wait(10);
    if (nInstances() !== n0 - 1) { anom(`fusion par l'UI sans effet : ${n0} → ${nInstances()} exemplaires @${label}`); return; }
    rep.fusions++;
    const enfant = store.instances.find((i) => !libres.some((l) => l.iid === i.iid));
    if (enfant && !Number.isInteger(enfant.iid)) anom(`enfant de fusion avec iid non entier : ${JSON.stringify(enfant.iid)} @${label}`);
  };

  // -------------------------------------------------------------------------
  // ÉQUIPE par clics : ajouter/retirer via les boutons ＋ / ✕ des cellules
  // -------------------------------------------------------------------------
  const runEquipeUI = async () => {
    label = 'équipe';
    if (!(await navTo('#equipe'))) return;
    const cells = qall('.gcell', app).filter((x) => hasCls(x, 'cat'));
    if (!cells.length) { refu('aucune carte possédée à l’écran Équipe'); return; }
    // fiche au tap (comme un joueur qui inspecte)
    if (rng() < 0.5) {
      await tap(pick(rng, cells), 'fiche-équipe');
      await wait(8);
      if (!q1('.modal-overlay')) anom(`tap sur une carte de l'équipe sans fiche ouverte @${label}`);
      await sweepModals();
    }
    const r = rng();
    if (r < 0.5) {
      // ajouter : le bouton ＋ d'une carte hors équipe (uniquement si l'équipe n'est pas pleine)
      if (teamLen() >= 5) { refu('équipe pleine'); return; }
      const btns = qall('.cell-btn', app).filter((x) => x.dataset.act === 'in');
      const libres = btns.filter(enabled);
      if (!libres.length) { refu('aucun bouton d’ajout actif'); return; }
      const n0 = teamLen();
      await click(pick(rng, libres), 'ajouter-équipe');
      await wait(8);
      if (teamLen() === n0) anom(`bouton d'ajout à l'équipe actif sans effet (${n0} cartes) @${label}`);
    } else {
      // retirer : le ✕ d'un slot occupé
      const outs = qall('.cell-btn', app).filter((x) => x.dataset.act === 'out');
      if (!outs.length) { refu('aucun bouton de retrait'); return; }
      const n0 = teamLen();
      await click(pick(rng, outs), 'retirer-équipe');
      await wait(8);
      if (teamLen() === n0) anom(`bouton de retrait de l'équipe sans effet (${n0} cartes) @${label}`);
    }
  };

  // -------------------------------------------------------------------------
  // DÉPART du jeu : 4 novices → révélation → CTA
  // -------------------------------------------------------------------------
  const doDepart = async () => {
    label = 'départ';
    const choix = qall('.depart-choice', app);
    if (!choix.length) { anom('écran de départ absent au boot (aucune .depart-choice)'); return; }
    await click(pick(rng, choix), 'carte-de-départ');
    await wait(10);
    if (!store.departFait) { anom('le clic sur une novice n\'effectue pas le départ'); return; }
    for (const c of [...qall('.reveal-card')]) { await click(c, 'révéler-départ'); await wait(4); }
    const cta = [...qall('.reveal-actions .btn')].at(-1);
    if (!cta) { anom('modale de révélation du départ sans bouton Continuer'); return; }
    await click(cta, 'cta-départ');
    await wait(8);
    if (nInstances() < 2) anom(`le départ n'accorde que ${nInstances()} carte(s) (2 attendues)`);
  };

  // -------------------------------------------------------------------------
  // partie du bot
  // -------------------------------------------------------------------------
  // attendre que l'UI ait démarré (initAssets puis start → go('#accueil'))
  await waitFor(() => app && app.children.length > 0, 4000, 10);
  if (!app.children.length) { anom("l'UI ne démarre pas (écran vide au boot)"); return rep; }

  if (!store.departFait) await doDepart();

  // composer l'équipe initiale par l'UI (le départ n'en met aucune)
  await navTo('#equipe');
  for (const c of qall('.gcell', app).filter((x) => hasCls(x, 'cat'))) {
    const btn = [...c.querySelectorAll('.cell-btn')].find((x) => x.dataset.act === 'in');
    if (btn && enabled(btn) && teamLen() < 4) { await click(btn, 'équipe-initiale'); await wait(5); }
  }
  if (teamLen() < 1) anom(`équipe vide après composition initiale (${nInstances()} cartes possédées)`);

  // dotation « compte revenant » (convention du harnas précédent, pour exercer boutique/guilde)
  api.addGold(500 + Math.floor(rng() * 500));
  store.jetons = (store.jetons ?? 0) + 120 + Math.floor(rng() * 120);
  api.save();

  // comme un joueur : compléter l'équipe en recrutant à la Guilde (clics sur « Recruter »)
  for (let k = 0; k < 3 && teamLen() < 5; k++) {
    if (!(await navTo('#forge'))) break;
    const offres = qall('[data-compagnon]', app).filter(enabled);
    if (!offres.length) break;
    for (let j = 0; j < offres.length; j++) {
      if (teamLen() >= 5) break;
      const o = qall('[data-compagnon]', app).filter(enabled)[j]; // re-requête : la page se re-render après chaque achat
      if (!o) break;
      const n0 = nInstances();
      const toasts0 = toastsNow();
      await click(o, 'recruter-compagnon');
      await wait(10);
      if (nInstances() !== n0) rep.achats++;
      else if (toastsNow() === toasts0) anom(`bouton « Recruter » actif sans effet NI refus affiché (jetons ${store.jetons}) @guilde`);
      else refu('recrutement refusé (toast ✗)');
      for (const c of [...qall('.reveal-card')]) await click(c, 'révéler');
      const cta = [...qall('.reveal-actions .btn')].at(-1);
      if (cta) await click(cta, 'cta-compagnon');
      await sweepModals();
    }
    // les recrues rejoignent l'équipe par l'UI
    if (await navTo('#equipe')) {
      for (const c of qall('.gcell', app).filter((x) => hasCls(x, 'cat'))) {
        if (teamLen() >= 5) break;
        const btn = [...c.querySelectorAll('.cell-btn')].find((x) => x.dataset.act === 'in');
        if (btn && enabled(btn)) { await click(btn, 'équipe-recrue'); await wait(5); }
      }
    }
  }
  checkStore('départ');

  const errAvant = errors.length;
  const nActions = 12 + Math.floor(rng() * 8);
  for (let a = 0; a < nActions && !outOfTime(); a++) {
    rep.actions++;
    const moy = (() => {
      const slots = (store.team.slots ?? []).filter(Boolean);
      if (!slots.length) return 1;
      return slots.reduce((s, iid) => s + (api.byIid(iid)?.lvl ?? 1), 0) / slots.length;
    })();
    const grind = moy < 9;
    const r = rng();
    if (grind ? r < 0.42 : r < 0.30) await runDonjonUI();
    else if (grind ? r < 0.70 : r < 0.50) await runErranceUI();
    else if (r < 0.72) await runEconomieUI();
    else if (r < 0.84) await runFusionUI();
    else if (r < 0.94) await runEquipeUI();
    else {
      // balayage de navigation : chaque page doit se rendre
      label = 'navigation';
      const routes = ['#accueil', '#collection', '#forge', '#donjons', '#quetes', '#boutique', '#inventaire', '#glossaire'];
      const h = pick(rng, routes);
      await navTo(h);
    }
    checkStore(`action ${a}`);
    await sweepModals();
  }
  if (outOfTime()) rep.timeouts++;

  // sorties propres : plus d'errance en arrière-plan (la boucle rAF s'arrête toute seule)
  if (store.errance) { store.errance = null; api.save(); }

  // save → load : la partie doit survivre au rechargement champ par champ
  label = 'save/load';
  await sweepModals();
  api.save();
  const snap = () => JSON.stringify({
    gold: store.gold, jetons: store.jetons,
    inst: store.instances.map((i) => `${i.iid}:${i.id}:${i.lvl}:${Math.round((i.xp ?? 0) * 10) / 10}`).sort(),
    slots: (store.team.slots ?? []).slice(),
    potions: { ...store.potions },
    record: store.record, equip: store.equip,
  });
  const avant = snap();
  try { api.load(); } catch (e) { rep.exceptions.push(`load: ${e && e.message}`); }
  const apres = snap();
  if (avant !== apres) anom(`save/load divergent :\n  avant=${avant.slice(0, 300)}\n  apres=${apres.slice(0, 300)}`);

  if (errors.length > errAvant) {
    for (const e of errors.slice(errAvant)) rep.exceptions.push(`non capturée: ${e && e.message} | ${e && e.stack ? e.stack.split('\n').slice(1, 3).map((l) => l.trim()).join(' < ') : ''}`);
  }
  log(`bot ${seed} : ${rep.actions} actions, ${rep.clicks} clics, ${rep.combats} combats (${rep.wins}V/${rep.losses}D/${rep.draws}N), ${rep.fusions} fusions, ${rep.anomalies.length} anomalies`);
  return rep;
}

// ---------------------------------------------------------------------------
// lot de bots (un processus) — bots séquentiels, chacun son contexte VM
// ---------------------------------------------------------------------------
async function runLot(distPath, n, seed, verbose) {
  const ag = {
    bots: 0, actions: 0, clicks: 0, combats: 0, wins: 0, draws: 0, losses: 0, fusions: 0,
    achats: 0, captures: 0, unlocked: 0, timeouts: 0, anomalies: [], exceptions: [], refus: [],
  };
  for (let i = 0; i < n; i++) {
    let rep = null;
    try {
      rep = await runBot(distPath, seed + i, verbose ? ((...a) => console.error(...a)) : () => {});
    } catch (e) {
      rep = { anomalies: [], exceptions: [`bot ${seed + i} fatal : ${e && e.stack && e.stack.split('\n').slice(0, 3).join(' | ')}`], refus: [] };
    }
    ag.bots++; ag.actions += rep.actions ?? 0; ag.clicks += rep.clicks ?? 0; ag.combats += rep.combats ?? 0;
    ag.wins += rep.wins ?? 0; ag.draws += rep.draws ?? 0; ag.losses += rep.losses ?? 0; ag.fusions += rep.fusions ?? 0;
    ag.achats += rep.achats ?? 0; ag.captures += rep.captures ?? 0; ag.unlocked += rep.unlocked ?? 0; ag.timeouts += rep.timeouts ?? 0;
    ag.anomalies.push(...(rep.anomalies ?? [])); ag.exceptions.push(...(rep.exceptions ?? [])); ag.refus.push(...(rep.refus ?? []));
  }
  return ag;
}

// ---------------------------------------------------------------------------
// point d'entrée
// ---------------------------------------------------------------------------
const [distPath, nArg, seedArg, mode] = [process.argv[2], Number(process.argv[3] || 20), Number(process.argv[4] || 1), process.argv[5] ?? ''];
const N = Number.isFinite(nArg) ? nArg : 20;

if (mode === '--lot') {
  const ag = await runLot(distPath, N, seedArg, false);
  // persistance par lot : un essaim interrompu (reset du bac à sable) garde ses rapports
  if (process.env.BOT_UI_LOTS_FILE) {
    try { appendFileSync(process.env.BOT_UI_LOTS_FILE, JSON.stringify({ seed: seedArg, n: N, ...ag }) + '\n'); } catch {}
  }
  console.log('JSON-REPORT:' + JSON.stringify(ag));
  process.exit(ag.anomalies.length + ag.exceptions.length > 0 ? 1 : 0);
} else if (mode === '--essaim' || N > 30) {
  const TAILLE = Number(process.env.BOT_UI_LOT ?? '25'), PARALLELE = Number(process.env.BOT_UI_PAR ?? '5');
  const lots = [];
  for (let i = 0; i < N; i += TAILLE) lots.push({ n: Math.min(TAILLE, N - i), seed: 100 + Math.floor(i / TAILLE) * 1000 + seedArg });
  const total = {
    bots: 0, actions: 0, clicks: 0, combats: 0, wins: 0, draws: 0, losses: 0, fusions: 0,
    achats: 0, captures: 0, unlocked: 0, timeouts: 0, anomalies: [], exceptions: [], refus: [],
  };
  for (let v = 0; v < lots.length; v += PARALLELE) {
    const vague = lots.slice(v, v + PARALLELE);
    const proms = vague.map((lot) => new Promise((res) => {
      const child = spawn(process.execPath, [import.meta.url.replace('file://', ''), distPath, String(lot.n), String(lot.seed), '--lot'], { stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '';
      child.stdout.on('data', (d) => { out += String(d); });
      child.stderr.on('data', (d) => { process.stderr.write(String(d)); });
      child.on('close', () => {
        const line = out.split('\n').find((l) => l.startsWith('JSON-REPORT:'));
        try { res(JSON.parse(line.slice('JSON-REPORT:'.length))); } catch { res({ bots: 0, anomalies: ['lot ' + lot.seed + ' sans rapport'], exceptions: [], refus: [] }); }
      });
    }));
    const reps = await Promise.all(proms);
    for (const r of reps) {
      for (const k of Object.keys(total)) {
        if (Array.isArray(total[k])) total[k].push(...(r[k] ?? []));
        else total[k] += r[k] ?? 0;
      }
    }
    console.error(`essaim : ${Math.min(v + PARALLELE, lots.length)}/${lots.length} lots`);
  }
  console.log('=== ESSAIM UI ===');
  console.log(`bots=${total.bots} actions=${total.actions} clics=${total.clicks} combats=${total.combats} victoires=${total.wins} défaites=${total.losses} égalités=${total.draws}`);
  console.log(`fusions=${total.fusions} achats=${total.achats} captures=${total.captures} zonesDébloquées=${total.unlocked} excursionsTimeout=${total.timeouts}`);
  const refusCount = new Map();
  for (const r of total.refus) refusCount.set(r, (refusCount.get(r) ?? 0) + 1);
  console.log(`REFUS(info)=${total.refus.length} : ${[...refusCount.entries()].map(([k, c]) => `${k}×${c}`).join(' · ') || 'aucun'}`);
  console.log(`ANOMALIES=${total.anomalies.length} EXCEPTIONS=${total.exceptions.length}`);
  for (const a of total.anomalies.slice(0, 40)) console.log('  ANOMALIE: ' + a);
  for (const e of total.exceptions.slice(0, 40)) console.log('  EXCEPTION: ' + e);
  process.exit(total.anomalies.length + total.exceptions.length > 0 ? 1 : 0);
} else {
  const ag = await runLot(distPath, N, seedArg, true);
  console.log('=== LOT UI ===');
  console.log(`bots=${ag.bots} actions=${ag.actions} clics=${ag.clicks} combats=${ag.combats} victoires=${ag.wins} défaites=${ag.losses} égalités=${ag.draws}`);
  console.log(`fusions=${ag.fusions} achats=${ag.achats} captures=${ag.captures} zonesDébloquées=${ag.unlocked} excursionsTimeout=${ag.timeouts}`);
  const refusCount = new Map();
  for (const r of ag.refus) refusCount.set(r, (refusCount.get(r) ?? 0) + 1);
  console.log(`REFUS(info)=${ag.refus.length} : ${[...refusCount.entries()].map(([k, c]) => `${k}×${c}`).join(' · ') || 'aucun'}`);
  console.log(`ANOMALIES=${ag.anomalies.length} EXCEPTIONS=${ag.exceptions.length}`);
  for (const a of ag.anomalies.slice(0, 40)) console.log('  ANOMALIE: ' + a);
  for (const e of ag.exceptions.slice(0, 40)) console.log('  EXCEPTION: ' + e);
  process.exit(ag.anomalies.length + ag.exceptions.length > 0 ? 1 : 0);
}
