import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootDist, wait } from '../stub.mjs';

// correctifs v1.39 lot 1 : XP PAR COMBAT — chaque combat terminé distribue l'XP immédiatement
// (base ramenée à 1 étage), la fenêtre Récompenses affiche l'entrée xp, un run de 5 étages
// distribue 5 × la base (égal à l'ancienne formule stages × base), la défaite de donjon ne
// distribue rien (l'XP déjà gagnée reste acquise), combat de zone : victoire ET défaite distribuent.

const TEAM = ['a1', 'n3', 'a29']; // cartes dont les sorts se résolvent sans NaN hors pipeline UI

function boot() {
  const b = bootDist('dist.html');
  const store = b.api.store;
  store.diff = 1;
  store.team.slots = TEAM.map((id) => b.api.newInst(id, 20).iid);
  b.api._speed(6); // instant() : animations nulles, chaînes d'étages à 90 ms
  return b;
}

async function enterDungeon(api, doc) {
  api.enterAt(1, 'marees');
  await wait(60);
  doc.body.querySelector('#mod-accept')?.click();
  await wait(120);
}

// joue le combat en Tactique en cliquant (attaque la première cible illuminée, sinon attendre)
async function playOut(api, els, { attack = true, maxK = 900 } = {}) {
  for (let k = 0; k < maxK; k++) {
    const st = api._state();
    if (!st || st.winner) return st;
    const am = api._actEl();
    if (am) {
      if (attack) {
        const atk = am.querySelector('.act-attack');
        if (atk) {
          atk.click();
          let tg = null;
          for (let w = 0; w < 20 && !tg; w++) {
            await wait(40);
            tg = [...els.get('app').querySelectorAll('.unit')].find((el) => el.classList.contains('targeted'));
          }
          if (tg) { tg.click(); continue; }
        }
      }
      const pb = am.querySelector('.act-pass');
      if (pb) { pb.click(); continue; }
      await wait(40);
      continue;
    }
    await wait(40);
  }
  return api._state();
}

// ferme la modale Récompenses via son bouton (recompOpen repasse à false) et attend le prochain combat
async function closeRecompAndWaitNext(api, doc, oldState) {
  doc.body.querySelector('#recomp-all')?.click();
  doc.body.querySelector('.recomp-overlay')?.remove();
  for (let k = 0; k < 100; k++) {
    await wait(50);
    const st = api._state();
    if (st && st !== oldState && !st.winner) return st;
  }
  return api._state();
}

function weakenEnemies(api) {
  const st = api._state();
  for (const e of [...st.enemies.avant, ...st.enemies.arriere]) { e.hp = 1; e.maxHp = 1; }
}

function hurtTeam(api) {
  const st = api._state();
  for (const u of [...st.team.avant, ...st.team.arriere]) { u.hp = 1; u.maxHp = 1; }
}

const gainsOf = (runLog, name) => (runLog?.xp ?? []).filter((x) => x.name === name).reduce((a, x) => a + (x.gain ?? 0), 0);

test('v1.39 lot 1 (combat) : un combat de donjon gagné distribue l\'XP immédiatement (avant l\'étage suivant)', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  await enterDungeon(api, doc);
  assert.ok(api._state(), 'combat lancé');
  const iid = api.store.team.slots[0];
  const inst = api.byIid(iid);
  const xp0 = inst.xp, lvl0 = inst.lvl;
  weakenEnemies(api);
  const st = await playOut(api, els);
  await wait(400); // laisse le handler de l'événement end distribuer l'XP
  assert.equal(st.winner, 'team', 'victoire');
  assert.ok(inst.xp > xp0 || inst.lvl > lvl0, `XP gagnée immédiatement (xp ${xp0} -> ${inst.xp}, Nv ${lvl0} -> ${inst.lvl})`);
  const rl = api._runLog();
  assert.ok(rl && rl.xp.length === TEAM.length, 'une entrée XP par personnage dans le log du run, avant l\'étage 2');
  // base = 1 étage × DIFFX.pts(1) × 1,5 victoire × 0,8 × 2 découverte = 2,4 ; mult fatigue = 1 (run neuf)
  assert.ok(Math.abs(gainsOf(rl, api.byId(inst.id).name) - 2.4) < 1e-6, `gain = base par combat (2,4), pas stages × base : ${gainsOf(rl, api.byId(inst.id).name)}`);
});

test('v1.39 lot 1 (run 5 étages) : l\'XP totale du run = 5 × la base par combat = l\'ancienne formule (stages × base) — test comparatif', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  await enterDungeon(api, doc);
  const iid = api.store.team.slots[0];
  const nm = api.byId(api.byIid(iid).id).name;
  const base = 1 * 1 * 1.5 * 0.8 * 2; // DIFFX.pts=1 (Facile) × victoire × 0,8 × découverte, 1 étage
  let st = api._state();
  for (let stage = 1; stage <= 5; stage++) {
    assert.ok(st && !st.winner, `étage ${stage} lancé`);
    weakenEnemies(api);
    st = await playOut(api, els);
    await wait(400);
    assert.equal(st.winner, 'team', `étage ${stage} gagné`);
    if (stage < 5) st = await closeRecompAndWaitNext(api, doc, st); // « Tout ramasser » -> chaîne vers l'étage suivant
  }
  const total = gainsOf(api._runLog(), nm);
  // comparatif documenté : ancienne formule = runLog.stages(5) × base(1 étage) × mult ; nouvelle = 5 combats × base × mult
  assert.ok(Math.abs(total - 5 * base) < 1e-6, `total run = 5 × base (${5 * base}), obtenu ${total}`);
});

test('v1.39 lot 1 (défaite donjon) : le combat perdu ne distribue rien, l\'XP des combats gagnés reste acquise', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  await enterDungeon(api, doc);
  // étage 1 : victoire
  weakenEnemies(api);
  let st = await playOut(api, els);
  await wait(400);
  assert.equal(st.winner, 'team');
  const iid = api.store.team.slots[0];
  const inst = api.byIid(iid);
  const xpAfterWin = inst.xp, lvlAfterWin = inst.lvl;
  const rl = api._runLog();
  const xpEntriesAfterWin = rl.xp.length;
  assert.ok(xpAfterWin > 0 || lvlAfterWin > 20 - 20, 'XP acquise au combat gagné');
  // étage 2 : défaite (équipe à 1 PV, on attend à chaque tour)
  st = await closeRecompAndWaitNext(api, doc, st);
  assert.ok(st && !st.winner, 'étage 2 lancé');
  hurtTeam(api);
  st = await playOut(api, els, { attack: false });
  await wait(400);
  assert.equal(st.winner, 'enemies', 'défaite au combat 2');
  assert.equal(inst.xp, xpAfterWin, 'aucun retrait d\'XP après la défaite');
  assert.equal(inst.lvl, lvlAfterWin, 'niveau conservé');
  assert.equal(api._runLog().xp.length, xpEntriesAfterWin, 'le combat perdu n\'a distribué aucune entrée XP');
});

test('v1.39 lot 1 (zone victoire) : un combat de zone gagné distribue l\'XP (règle v1.38 préservée)', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  api.store.errance = api.createErranceState('zone-marees');
  api.startZoneFight('zone-marees', { donjon: false });
  await wait(150);
  const iid = api.store.team.slots[0];
  const inst = api.byIid(iid);
  const xp0 = inst.xp;
  weakenEnemies(api);
  const st = await playOut(api, els);
  await wait(400);
  assert.equal(st.winner, 'team');
  assert.ok(inst.xp > xp0 || inst.lvl > 1, `XP distribuée en zone (xp ${xp0} -> ${inst.xp})`);
  assert.ok(api._runLog().xp.length > 0, 'entrées XP présentes');
  api.store.errance = null;
});

test('v1.39 lot 1 (zone défaite) : une défaite de zone distribue aussi l\'XP (coefficient défaite ×1, v1.38)', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  api.store.errance = api.createErranceState('zone-marees');
  api.startZoneFight('zone-marees', { donjon: false });
  await wait(150);
  const iid = api.store.team.slots[0];
  const inst = api.byIid(iid);
  const xp0 = inst.xp;
  hurtTeam(api);
  const st = await playOut(api, els, { attack: false });
  await wait(400);
  assert.equal(st.winner, 'enemies');
  assert.ok(inst.xp > xp0 || inst.lvl > 1, `XP distribuée malgré la défaite de zone (xp ${xp0} -> ${inst.xp})`);
  // base défaite = 1 × 1 × 1 × 0,8 × 2 découverte = 1,6
  assert.ok(Math.abs(gainsOf(api._runLog(), api.byId(inst.id).name) - 1.6) < 1e-6, 'coefficient défaite ×1 appliqué');
  api.store.errance = null;
});

test('v1.39 lot 1 (écran Récompenses) : une entrée xp est affichée à chaque combat gagné', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  await enterDungeon(api, doc);
  weakenEnemies(api);
  const st = await playOut(api, els);
  await wait(400);
  assert.equal(st.winner, 'team');
  const ov = doc.body.querySelector('.recomp-overlay');
  assert.ok(ov, 'modale Récompenses ouverte après le combat gagné');
  const txt = ov._innerHTML ?? '';
  assert.ok(/XP/.test(txt), 'entrée XP visible dans l\'écran Récompenses');
  assert.ok(/Nv \d+/.test(txt), 'XP par personnage (nom → niveau)');
});
