#!/usr/bin/env node
// bots-boucle.mjs — harnas de simulation : des bots jouent des PARTIES COMPLÈTES du jeu
// (définit la spécification validée le 15/11 par le harnas de la session « correctifs bots-v1.52 »).
//
// Chaque bot : dotation de départ (compte revenant : or + jetons), équipe formée par le vrai
// chemin (newInst + addCardIid), puis ~60 actions pondérées : donjons JOUÉS COMME UN JOUEUR
// (enterAt → modale du modificateur → go('#combat') → rounds moteur → victoire → écran
// Récompenses avec captures DQM → chaîne d'étage), errance top-down (autels, jarres, porte de
// donjon, combats de zone, déblocage de zone), économie réelle (boutique, guilde en jetons,
// forge, équipement), fusion à l'Autel des Lignées (iid enfant ENTIER — correctif bots-v1.52),
// navigation IHM, puis save → load comparé champ par champ.
//
// Invariants vérifiés après CHAQUE action : or entier ≥ 0, iids entiers, niveaux bornés,
// équipe ≤ 5 sans doublon ni slot orphelin, PV/mana du pool de run bornés par le VRAI max de
// combat (miroir de makeUnit : cran + shiny + fusion + équipement + INT), potions entières.
//
// Usage :
//   node bots-boucle.mjs dist.html <N> <graine>           un lot de N bots (rester ≤ ~60)
//   node bots-boucle.mjs dist.html <N> <graine> --essaim  N bots en essaim : vagues de 5
//                                                         processus de ~50 bots, rapports agrégés
//   node bots-boucle.mjs dist.html <N> <graine> --lot     usage interne de l'essaim (1 JSON en sortie)
//
// Au-delà de ~50-60 bots par processus : OOM (chaque bot boote un contexte VM ~1 Mo retenu par
// les timers UI en attente) → le mode essaim découpe en lots de 50 avec des graines distinctes.

import { spawn } from 'node:child_process';
import { bootDist } from './stub.mjs';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// PRNG déterministe (les bots doivent être rejouables)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// ---------------------------------------------------------------------------
// Un bot = une partie complète
// ---------------------------------------------------------------------------
async function runBot(distPath, seed, log = () => {}) {
  const rng = mulberry32(seed || 1);
  const b = bootDist(distPath);
  const { api, doc, mem, errors } = b;
  const store = api.store;
  const rep = {
    seed, actions: 0, combats: 0, wins: 0, draws: 0, losses: 0, fusions: 0, achats: 0,
    captures: 0, unlocked: 0, anomalies: [], exceptions: [],
  };
  const anom = (m) => rep.anomalies.push(m);
  api._speed(6); // replay instantané (le bot ne regarde pas les animations)

  // --- helpers sûrs : toute exception moteur est comptée, jamais fatale au harnas ---
  const safe = async (label, fn) => {
    try {
      await fn();
      return true;
    } catch (e) {
      rep.exceptions.push(`${label}: ${e && e.message}`);
      return false;
    }
  };

  // --- miroir de combatMaxOf (correctif bots-v1.52) : vrai plafond PV/mana d'un exemplaire ---
  const combatMax = (inst) => {
    const raw = api.CATALOG.find((c) => c.id === inst.id);
    if (!raw) return null;
    const famN = raw.family ? (store.shards?.[raw.family] ?? 0) : 0;
    if (famN > 0) return null; // éclats de famille : bonus non exposé par l'API, on ne borne pas (pas de faux positif)
    let base = { ...raw, shiny: !!inst.shiny };
    base = api.applyShinyStats(base, inst.shiny ? (inst.shinyBonus ?? 0) : 0);
    if (inst.fusionBonus) base = { ...base, atk: base.atk + (inst.fusionBonus.atk ?? 0), hp: base.hp + (inst.fusionBonus.hp ?? 0) };
    const eb = api.equipBonusOfCard(inst.id);
    const tb = api.equipTeamBonus();
    const u = api.makeUnit({
      ...base,
      level: inst.lvl,
      atk: Math.max(1, Math.round(base.atk)),
      hp: Math.max(1, Math.round(base.hp)),
      noLossPct: inst.noLoss ?? 0,
      equip: {
        atkPct: eb.atkPct + tb.atkPct,
        hpPct: eb.hpPct + tb.hpPct,
        agiPct: eb.agiPct + tb.agiPct,
        intPct: eb.intPct + tb.intPct,
        manaRegen: eb.manaRegen + tb.manaRegen,
      },
    }, 'botmax', inst.lvl);
    return { hp: u.maxHp, mana: u.manaMax };
  };

  // --- invariants après CHAQUE action ---
  const checkStore = (label) => {
    if (!Number.isInteger(store.gold) || store.gold < 0) anom(`or non entier/négatif (${store.gold}) @${label}`);
    for (const inst of store.instances) {
      if (!Number.isInteger(inst.iid) || inst.iid <= 0) anom(`iid non entier ${JSON.stringify(inst.iid)} @${label}`);
      if (!Number.isInteger(inst.lvl) || inst.lvl < 1 || inst.lvl > 100) anom(`niveau invalide ${inst.id}:${inst.lvl} @${label}`);
      if (!Number.isFinite(inst.xp) || inst.xp < 0) anom(`xp invalide ${inst.id}:${inst.xp} @${label}`);
      if (!api.CATALOG.some((c) => c.id === inst.id)) anom(`carte inconnue en collection ${inst.id} @${label}`);
    }
    const slots = (store.team.slots ?? []).filter(Boolean);
    if (slots.length > 5) anom(`équipe de ${slots.length} slots @${label}`);
    const vus = new Set();
    const parId = new Map();
    for (const iid of slots) {
      if (vus.has(iid)) anom(`doublon d'iid ${iid} en équipe @${label}`);
      vus.add(iid);
      const inst = api.byIid(iid);
      if (!inst) { anom(`slot orphelin ${iid} (aucune instance) @${label}`); continue; }
      parId.set(inst.id, (parId.get(inst.id) ?? 0) + 1);
    }
    for (const [id, n] of parId) if (n > 3) anom(`${n} exemplaires de ${id} en équipe (max 3) @${label}`);
    if (store.runState.active) {
      for (const [k, u] of Object.entries(store.runState.units ?? {})) {
        const inst = api.byIid(Number(k));
        if (!inst || !u) continue;
        const mx = combatMax(inst);
        if (mx) {
          if (u.hp > mx.hp + 0.51) anom(`PV pool ${u.hp} > max combat ${mx.hp} (${inst.id}) @${label}`);
          if (u.mana > mx.mana + 0.51) anom(`mana pool ${u.mana} > max combat ${mx.mana} (${inst.id}) @${label}`);
        }
        if (u.hp < 0) anom(`PV négatifs ${u.hp} (${inst.id}) @${label}`);
      }
    }
    for (const [k, v] of Object.entries(store.potions ?? {})) {
      if (!Number.isInteger(v) || v < 0) anom(`potion ${k} = ${v} @${label}`);
    }
  };

  // --- étiquette d'action courante pour les rapports d'anomalie ---
  let label = 'init';

  // -----------------------------------------------------------------------
  // combat : attend l'état FRAIS puis boucle moteur (1 round par resolveTurn)
  // tour 60 = ÉGALITÉ « Fureur du donjon » — issue LÉGITIME sans winner (comme run() dans l'UI)
  // fraîcheur : _state() retourne l'ANCIEN état si le combat n'a pas démarré — on traque
  // l'identité du dernier état vu par CE bot (renderCombat crée un objet état NOUVEAU à chaque fois)
  // -----------------------------------------------------------------------
  let dernierEtat = null;
  const playCombat = async () => {
    let st = null;
    for (let k = 0; k < 24; k++) {
      st = api._state();
      if (st && st !== dernierEtat) break;
      await wait(25);
    }
    if (!st || st === dernierEtat) return { st: null, frais: false };
    dernierEtat = st;
    let guard = 0;
    while (!st.winner && st.turn < 60 && guard++ < 200) {
      api.resolveTurn(st);
      await wait(0); // on laisse respirer la boucle d'événements (timers UI)
    }
    return { st, frais: true, draw: !st.winner && st.turn >= 60, marathon: !st.winner && st.turn < 60 };
  };

  // -----------------------------------------------------------------------
  // miroir du gestionnaire de victoire (src/ui.js, cas 'end' du replay) :
  // quêtes, or, record, drops, capture DQM via le VRAI écran Récompenses, XP, fatigue, pool
  // -----------------------------------------------------------------------
  const applyVictoire = async (st, won, zone) => {
    const dg = api.dungeonById(store.dungeon);
    const stage = store.stage;
    const DIFF = api.DIFFICULTIES[store.diff - 1] ?? api.DIFFICULTIES[0];
    const loot = api.runModLootMult(store.runMod);
    const boss = stage % 5 === 0 || stage === dg.floors;
    const finalClear = won && !zone && stage >= dg.floors;
    const nbEnnemis = [...(st.enemies?.avant ?? []), ...(st.enemies?.arriere ?? [])].filter((u) => u && u.hp <= 0).length;

    if (won) {
      if (nbEnnemis > 0) api.questProgress('tuer', nbEnnemis);
      if (boss) api.questProgress('boss');
      if (finalClear) api.questProgress('finirDonjon');
      if (zone) api.questProgress('gagnerErrance');
    }
    // or + record (comme la victoire ; une défaite de zone ne donne rien)
    const pts = won ? Math.round((15 + 5 * stage) * (boss ? 2 : 1) * DIFF.pts * loot.pts) : 0;
    if (won) {
      api.addGold(pts);
      store.record = Math.max(store.record, stage);
      // naissance (N drop, miroir du tirage réel)
      if (rng() < 0.15 * loot.drop) {
        const oeuf = api.drawNaissance(rng, () => true);
        if (oeuf) api.grantCards([oeuf.id]);
      }
      // pièce du boss
      if (boss && !zone) {
        const piece = api.bossPieceFor(store.dungeon, store.diff);
        if (piece) api.addEquipmentPiece(piece.id, 1);
      }
    }
    // XP du combat (formule exacte du gestionnaire : base × fatigue × réserve, découverte ×2)
    if (won || zone) {
      const discOn = store.diff === 1 && dg.tier === 0 && ((store.progress[store.dungeon]?.diffs?.[1]?.record) ?? 0) < 10;
      const baseXp = 1 * DIFF.pts * (won ? 1.5 : 1) * 0.8 * (discOn ? 2 : 1);
      const slotsNow = (store.team.slots ?? []).filter(Boolean);
      const iids = [...new Set(slotsNow)];
      for (const iid of iids) {
        const inst = api.byIid(iid);
        if (!inst) continue;
        const isReserve = slotsNow.indexOf(iid) >= 3;
        const fatig = Math.max(0.25, 1 - 0.1 * (store.fatigue.runs[iid] ?? 0));
        const mult = fatig * (isReserve ? (api.DATA.engine.reserveXpMult ?? 0.5) : 1);
        const gain = api.xpFracOfLevel(inst.lvl) * api.xpToNext(inst.lvl) * baseXp;
        api.addXpI(iid, gain * mult);
      }
      if (finalClear || !won || zone) {
        for (const iid of iids) store.fatigue.runs[iid] = (store.fatigue.runs[iid] ?? 0) + 1;
      }
    }
    // pool PV/mana persistant (Lot A/C) puis sauvegarde
    api.persistRunStateFrom(st);
    api.save();

    // écran Récompenses : le VRAI openRecompensesModal, captures DQM cliquées comme un joueur
    if (won) {
      const recomp = [{ kind: 'or', label: `+${pts} 🪙 or`, detail: zone ? 'combat de zone' : `étage ${stage}`, rarity: null }];
      const actifs = (st.team?.avant ?? []).filter((u) => u && u.alive);
      const moyLvl = actifs.length ? actifs.reduce((a, u) => a + (u.level ?? 1), 0) / actifs.length : 1;
      for (const m of api.recrutableMonsters(st)) {
        const force = Math.min(3, Math.max(0.5, moyLvl / Math.max(1, m.level ?? 1)));
        const pct = Math.min(0.95, (api.RECRUTE_TAUX ?? 0.3) * force);
        recomp.push({
          kind: 'capture', label: `🐾 Tenter la capture — ${Math.round(pct * 100)} %`,
          detail: `${m.name} (Nv ${m.level ?? '?'})`, rarity: 'C',
          monster: m.cardId ?? m.id, mname: m.name, pct,
        });
      }
      api.openRecompensesModal(recomp);
      await wait(10);
      for (const row of [...doc.body.querySelectorAll('.recomp-row')]) {
        if (row.textContent.includes('capture') && rng() < 0.5) { row.click(); rep.captures++; await wait(5); }
      }
      const all = doc.body.querySelector('#recomp-all');
      if (all) all.click();
      await wait(10);
    }
    // déblocage de zone après victoire sur le donjon de zone
    if (won && zone) {
      if (store.zoneFight?.donjon) { api.unlockZone(store.zoneFight.zone); rep.unlocked++; }
      if (store.errance) store.errance.grace = api.DATA.engine.ERRANCE_GRACE_COMBAT ?? 8;
      store.zoneFight = null;
      api.save();
    }
    return { pts, finalClear };
  };

  // -----------------------------------------------------------------------
  // UN RUN DE DONJON, joué comme un joueur : modale → étage 1 → victoires →
  // « Tout ramasser » → la chaîne avance l'étage (store.stage + go('#combat')) → …
  // -----------------------------------------------------------------------
  const runDonjon = async () => {
    label = 'donjon';
    const dgId = store.dungeon ?? 'marees';
    const dg = api.dungeonById(dgId);
    const depart = Math.min(dg.floors, Math.max(1, (store.record ?? 0) ? Math.min((store.record ?? 0) + 1, dg.floors) : 1));
    api.enterAt(depart, dgId);
    await wait(30);
    const mod = doc.body.querySelector('#mod-accept') ?? doc.body.querySelector('#mod-free');
    if (!mod) return; // donjon verrouillé / équipe invalide : entrée refusée (légal)
    mod.click(); // accepter le modificateur (ou entrer sans) → go('#combat') crée l'état
    await wait(40);
    for (let etage = 0; etage < dg.floors + 2; etage++) {
      const { st, frais, draw, marathon } = await playCombat();
      if (!frais) { anom(`combat non démarré (état non rafraîchi) @${label}`); break; }
      rep.combats++;
      if (marathon) { anom(`combat sans issue après ${st.turn} tours @${label}`); break; }
      if (draw) { rep.draws++; break; } // ÉGALITÉ : la Fureur du donjon écrase tout le monde
      const won = st.winner === 'team';
      if (won) rep.wins++; else rep.losses++;
      const { finalClear } = await applyVictoire(st, won, false);
      if (!won || finalClear) break; // défaite ou donjon bouclé : fin du run
      // la chaîne auto du jeu avance l'étage APRÈS « Tout ramasser » — on la suit
      store.stage += 1;
      api.save();
      api.go('#combat');
      await wait(30);
    }
    api.go('#accueil'); // retour ville : repos complet (légal, comme un joueur)
    await wait(30);
  };

  // -----------------------------------------------------------------------
  // ERRANCE top-down : cible POI (autel/jarre/porte), pas-à-pas, rencontres,
  // combats de zone via startZoneFight, autel de soin, jarres → éclats bruts
  // -----------------------------------------------------------------------
  const runErrance = async () => {
    label = 'errance';
    const zones = (api.DATA.zones ?? []).map((z) => z.id).filter((z) => api.zoneUnlocked(z));
    if (!zones.length) return;
    const zone = pick(rng, zones);
    if (!await safe('enterZone', () => api.enterZone(zone))) return;
    const st = store.errance;
    if (!st) return;
    const map = st.map;
    const d = map.donjon;
    const cibles = [
      ...(map.autel ? [{ type: 'autel', x: map.autel.x, y: map.autel.y }] : []),
      ...(d ? [{ type: 'porte', x: d.x + Math.floor((d.w ?? 3) / 2), y: d.y + (d.h ?? 3) }] : []),
      ...(map.jarres ?? []).slice(0, 3).map((j) => ({ type: 'jarre', x: j.x, y: j.y })),
    ];
    if (!cibles.length) return;
    const cible = pick(rng, cibles);
    if (!api.setTarget(st, cible.x, cible.y)) return;
    st.pending = cible; // comme le clic joueur : l'arrivée déclenche l'interaction
    for (let k = 0; k < 500; k++) {
      const ev = api.stepErrance(st, 0.05, rng);
      if (ev.encounter) {
        // rencontre : combat de zone via le VRAI startZoneFight
        if (!await safe('startZoneFight', () => api.startZoneFight(zone, { donjon: false }))) break;
        await wait(40);
        const { st: zst, frais } = await playCombat();
        if (!frais) { anom(`combat de zone non démarré @${label}`); break; }
        rep.combats++;
        const won = zst.winner === 'team';
        if (won) rep.wins++; else rep.losses++;
        if (!zst.winner && zst.turn >= 60) rep.draws++;
        await applyVictoire(zst, won, true);
        if (store.errance) { store.errance = null; store.erranceSavedPos = null; api.save(); }
        break;
      }
      if (ev.arrived) {
        const o = ev.arrived;
        if (o.type === 'autel') {
          api.interactAutel(st);
          api.autelDeSoin();
        } else if (o.type === 'jarre') {
          const loot = api.interactJarre(st, `jarre-${o.x}-${o.y}`);
          if (loot) api.addGem('brut', pick(rng, api.DATA.engine.ELEMENTS));
        } else if (o.type === 'porte') {
          // porte du donjon de zone : victoire → déblocage de la zone suivante
          if (!await safe('startZoneFight(donjon)', () => api.startZoneFight(zone, { donjon: true }))) break;
          await wait(40);
          const { st: zst, frais } = await playCombat();
          if (!frais) { anom(`combat de porte non démarré @${label}`); break; }
          rep.combats++;
          const won = zst.winner === 'team';
          if (won) rep.wins++; else rep.losses++;
          if (!zst.winner && zst.turn >= 60) rep.draws++;
          await applyVictoire(zst, won, true);
          if (store.errance) { store.errance = null; store.erranceSavedPos = null; api.save(); }
        }
        break;
      }
      if (ev.abandoned || (!st.hero.path.length && !st.pending)) break;
      if (k % 40 === 0) await wait(0);
    }
    api.go('#accueil');
    await wait(20);
  };

  // -----------------------------------------------------------------------
  // ÉCONOMIE : boutique (or), guilde (jetons), forge, équipement
  // -----------------------------------------------------------------------
  const runEconomie = async () => {
    const r = rng();
    if (r < 0.3) {
      label = 'boutique';
      const ids = Object.keys(api.POTIONS ?? {});
      if (ids.length) api.buyPotion(pick(rng, ids));
      if (rng() < 0.3) api.buyEclat(pick(rng, api.DATA.engine.ELEMENTS));
      const rayon = (api.EQUIPMENT ?? []).filter((p) => p.source === 'boutique' && store.gold >= (p.prix ?? 0));
      if (rayon.length && rng() < 0.5) api.buyEquipment(pick(rng, rayon).id);
    } else if (r < 0.55) {
      label = 'guilde';
      const offres = api.compagnonsDuJour() ?? [];
      for (const c of offres) {
        if (api.buyCompagnon(c.id)) rep.achats++;
      }
      // correctif bots-v1.52 : un id inconnu doit être refusé gracieusement (false, jamais une levée)
      if (api.buyCompagnon('id-inconnu-bot') !== false) anom(`buyCompagnon(id inconnu) ≠ false @${label}`);
    } else if (r < 0.8) {
      label = 'forge';
      const sets = (api.EQUIPMENT ?? []).filter((p) => p.source === 'set');
      if (sets.length) api.craftPiece(pick(rng, sets).id); // échoue proprement sans matériaux
      // équiper une pièce POSSÉDÉE sur une carte de l'équipe
      const possedees = Object.entries(store.equipment ?? {}).filter(([, n]) => n > 0);
      if (possedees.length) {
        const inst = api.byIid((store.team.slots ?? []).find(Boolean) ?? -1);
        if (inst) api.equipPiece(inst.id, rng() < 0.5 ? 'arme' : 'armure', pick(rng, possedees)[0]);
      }
    } else {
      label = 'equipe';
      // placer/retirer des exemplaires par le vrai chemin addCardIid
      const teamIids = new Set((store.team.slots ?? []).filter(Boolean));
      if (rng() < 0.5) {
        const libre = store.instances.find((i) => !teamIids.has(i.iid));
        if (libre) api.addCardIid(libre.iid);
      } else if ((store.team.slots ?? []).length > 1) {
        api.removeCard(store.team.slots.length - 1); // vrai chemin : splice, pas de rembourrage null
      }
    }
    await wait(10);
  };

  // -----------------------------------------------------------------------
  // AUTEL DES LIGNÉES : fusion via l'API comme l'UI, iid enfant ENTIER attendu
  // -----------------------------------------------------------------------
  const runFusion = async () => {
    label = 'autel';
    const teamIids = new Set((store.team.slots ?? []).filter(Boolean));
    const libres = store.instances.filter((i) => !teamIids.has(i.iid) && i.id && api.CATALOG.some((c) => c.id === i.id));
    const parId = new Map();
    for (const i of libres) {
      if (!parId.has(i.id)) parId.set(i.id, []);
      parId.get(i.id).push(i);
    }
    let pa = null, pb = null;
    for (const [, list] of parId) {
      if (list.length >= 2 && list[0] && (api.CATALOG.find((c) => c.id === list[0].id)?.rarity ?? 'N') !== 'N') { pa = list[0]; pb = list[1]; break; }
    }
    if (!pa) return;
    const plan = api.fusionPreview(pa, pb, rng);
    if (!plan.ok) return;
    const res = api.doFusion(store.instances, pa.iid, pb.iid, [], plan, {
      teamIids: [...teamIids],
      ownedOf: (id) => store.instances.filter((x) => x.id === id).length,
      rng,
      childIid: store.instanceSeq++, // correctif bots-v1.52 : iid entier dès la naissance
    });
    if (!res.ok) return;
    if (!Number.isInteger(res.enfant.iid)) anom(`enfant de fusion avec iid non entier : ${JSON.stringify(res.enfant.iid)} @${label}`);
    store.instances = res.instances;
    rep.fusions++;
    api.save();
    await wait(10);
  };

  // navigation IHM périodique : chaque page doit se rendre sans erreur
  const ROUTES = ['#accueil', '#equipe', '#collection', '#forge', '#donjons', '#glossaire'];
  const runNav = async () => {
    label = 'nav';
    api.go(pick(rng, ROUTES));
    await wait(15);
    // nettoyer les modales restées ouvertes (comme un joueur qui referme tout)
    for (const ov of [...doc.body.querySelectorAll('.modal-overlay')]) ov.remove?.();
  };

  // -----------------------------------------------------------------------
  // partie du bot
  // -----------------------------------------------------------------------
  // dotation « compte revenant » : or + jetons pour exercer boutique et guilde
  api.addGold(500 + Math.floor(rng() * 500));
  store.jetons = (store.jetons ?? 0) + 120 + Math.floor(rng() * 120);

  // équipe de départ : 3-4 cartes non-N par le vrai chemin (newInst + addCardIid)
  const pool = api.CATALOG.filter((c) => !c.monster && !c.dungeon && c.rarity !== 'N' && c.rarity !== 'M').map((c) => c.id);
  const counts = new Map();
  for (let k = 0, n = 3 + (rng() < 0.5 ? 1 : 0); k < n; k++) {
    const id = pick(rng, pool);
    if ((counts.get(id) ?? 0) >= 3) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
    const inst = api.newInst(id, 1 + Math.floor(rng() * 3));
    api.addCardIid(inst.iid);
  }
  // parfois une carte de départ hors équipe : candidat libre pour l'Autel
  if (rng() < 0.6) {
    const id = pick(rng, pool);
    if ((counts.get(id) ?? 0) < 3) api.newInst(id, 1);
  }
  checkStore('depart');

  const errAvant = errors.length;
  const nActions = 50 + Math.floor(rng() * 20);
  for (let a = 0; a < nActions; a++) {
    rep.actions++;
    const moy = (() => {
      const slots = (store.team.slots ?? []).filter(Boolean);
      if (!slots.length) return 1;
      return slots.reduce((s, iid) => s + (api.byIid(iid)?.lvl ?? 1), 0) / slots.length;
    })();
    // stratégie adaptative : tant que l'équipe est bas niveau, on grind (donjons + errance)
    const grind = moy < 9;
    const r = rng();
    if (grind ? r < 0.42 : r < 0.25) await safe('donjon', () => runDonjon());
    else if (grind ? r < 0.65 : r < 0.42) await safe('errance', () => runErrance());
    else if (r < 0.8) await safe('economie', () => runEconomie());
    else if (r < 0.9) await safe('fusion', () => runFusion());
    else await safe('nav', () => runNav());
    checkStore(`action ${a}`);
  }

  // save → load : la partie doit survivre au rechargement champ par champ
  label = 'save/load';
  await safe('save', () => api.save());
  const snap = () => JSON.stringify({
    gold: store.gold,
    jetons: store.jetons,
    inst: store.instances.map((i) => `${i.iid}:${i.id}:${i.lvl}:${Math.round((i.xp ?? 0) * 10) / 10}`).sort(),
    slots: (store.team.slots ?? []).slice(),
    units: store.runState.units,
    potions: { ...store.potions },
    coll: [...store.collection.entries()].sort((x, y) => String(x[0]).localeCompare(String(y[0]))),
    record: store.record,
    equip: store.equip,
  });
  const avant = snap();
  const okLoad = await safe('load', () => api.load());
  if (okLoad) {
    const apres = snap();
    if (avant !== apres) anom(`save/load divergent :\n  avant=${avant.slice(0, 300)}\n  apres=${apres.slice(0, 300)}`);
  }

  // erreurs non capturées pendant la partie du bot (rejets de promesses du pipeline UI)
  if (errors.length > errAvant) {
    for (const e of errors.slice(errAvant)) rep.exceptions.push(`non capturée: ${e && e.message}`);
  }
  // le bac à sable ne doit rien fuir vers l'extérieur
  void mem;
  log(`bot ${seed}: ${rep.combats} combats, ${rep.wins} victoires, ${rep.fusions} fusions, ${rep.achats} achats, ${rep.anomalies.length} anomalies`);
  return rep;
}

// ---------------------------------------------------------------------------
// lot de bots (un processus) — les bots tournent séquentiellement dans ce processus
// ---------------------------------------------------------------------------
async function runLot(distPath, n, seed, verbose) {
  const ag = { bots: 0, actions: 0, combats: 0, wins: 0, draws: 0, losses: 0, fusions: 0, achats: 0, captures: 0, unlocked: 0, anomalies: [], exceptions: [] };
  for (let i = 0; i < n; i++) {
    const rep = await runBot(distPath, seed + i, verbose ? ((...a) => console.error(...a)) : () => {});
    ag.bots++; ag.actions += rep.actions; ag.combats += rep.combats; ag.wins += rep.wins;
    ag.draws += rep.draws; ag.losses += rep.losses; ag.fusions += rep.fusions; ag.achats += rep.achats;
    ag.captures += rep.captures; ag.unlocked += rep.unlocked;
    ag.anomalies.push(...rep.anomalies); ag.exceptions.push(...rep.exceptions);
  }
  return ag;
}

// ---------------------------------------------------------------------------
// point d'entrée
// ---------------------------------------------------------------------------
const [distPath, nArg, seedArg, mode] = [process.argv[2], Number(process.argv[3] || 50), Number(process.argv[4] || 1), process.argv[5] ?? ''];
const N = Number.isFinite(nArg) ? nArg : 50;

if (mode === '--lot') {
  const ag = await runLot(distPath, N, seedArg, false);
  console.log('JSON-REPORT:' + JSON.stringify(ag));
  process.exit(ag.anomalies.length + ag.exceptions.length > 0 ? 1 : 0);
} else if (mode === '--essaim' || N > 60) {
  // essaim : vagues de 5 processus de ~50 bots (au-delà d'un lot, un processus OOM)
  const TAILLE = 50, PARALLELE = 5;
  const lots = [];
  for (let i = 0; i < N; i += TAILLE) lots.push({ n: Math.min(TAILLE, N - i), seed: 100 + Math.floor(i / TAILLE) * 1000 + seedArg });
  const total = { bots: 0, actions: 0, combats: 0, wins: 0, draws: 0, losses: 0, fusions: 0, achats: 0, captures: 0, unlocked: 0, anomalies: [], exceptions: [] };
  for (let v = 0; v < lots.length; v += PARALLELE) {
    const vague = lots.slice(v, v + PARALLELE);
    const proms = vague.map((lot) => new Promise((res) => {
      const child = spawn(process.execPath, [import.meta.url.replace('file://', ''), distPath, String(lot.n), String(lot.seed), '--lot'], { stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '';
      child.stdout.on('data', (d) => { out += String(d); });
      child.stderr.on('data', (d) => { process.stderr.write(String(d)); });
      child.on('close', () => {
        const line = out.split('\n').find((l) => l.startsWith('JSON-REPORT:'));
        try { res(JSON.parse(line.slice('JSON-REPORT:'.length))); } catch { res({ bots: 0, anomalies: ['lot ' + lot.seed + ' sans rapport'], exceptions: [] }); }
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
  console.log('=== ESSAIM ===');
  console.log(`bots=${total.bots} actions=${total.actions} combats=${total.combats} victoires=${total.wins} défaites=${total.losses} égalités=${total.draws} (Fureur du donjon)`);
  console.log(`fusions=${total.fusions} achats=${total.achats} captures=${total.captures} zonesDébloquées=${total.unlocked}`);
  console.log(`ANOMALIES=${total.anomalies.length} EXCEPTIONS=${total.exceptions.length}`);
  for (const a of total.anomalies.slice(0, 30)) console.log('  ANOMALIE: ' + a);
  for (const e of total.exceptions.slice(0, 30)) console.log('  EXCEPTION: ' + e);
  process.exit(total.anomalies.length + total.exceptions.length > 0 ? 1 : 0);
} else {
  const ag = await runLot(distPath, N, seedArg, true);
  console.log('=== LOT ===');
  console.log(`bots=${ag.bots} actions=${ag.actions} combats=${ag.combats} victoires=${ag.wins} défaites=${ag.losses} égalités=${ag.draws} (Fureur du donjon)`);
  console.log(`fusions=${ag.fusions} achats=${ag.achats} captures=${ag.captures} zonesDébloquées=${ag.unlocked}`);
  console.log(`ANOMALIES=${ag.anomalies.length} EXCEPTIONS=${ag.exceptions.length}`);
  for (const a of ag.anomalies.slice(0, 30)) console.log('  ANOMALIE: ' + a);
  for (const e of ag.exceptions.slice(0, 30)) console.log('  EXCEPTION: ' + e);
  process.exit(ag.anomalies.length + ag.exceptions.length > 0 ? 1 : 0);
}
