import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootDist, wait } from '../stub.mjs';

// Refonte direction — Lot C (TRANCHÉ 12/11) : points de repos.
// Persistance HP/MP partout (donjon + errance), AUCUN soin automatique (REGEN_BOSS_STAGE supprimé,
// plus de reset entre runs), K.O. persistants, restauration gratuite en ville (retour accueil + toast)
// et à l'autel (comportement existant conservé : l'autel relève aussi les K.O.), potions en donjon.

const TEAM = ['a1', 'n3', 'a29'];

function boot() {
  const b = bootDist('dist.html');
  const store = b.api.store;
  store.diff = 1;
  store.team.slots = TEAM.map((id) => b.api.newInst(id, 20).iid);
  b.api._speed(6);
  return b;
}

async function enterDungeon(api, doc) {
  api.enterAt(1, 'marees');
  await wait(60);
  doc.body.querySelector('#mod-accept')?.click();
  await wait(120);
}

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

function weakenEnemies(api) {
  const st = api._state();
  for (const e of [...st.enemies.avant, ...st.enemies.arriere]) { e.hp = 1; e.maxHp = 1; }
}

test('Lot C : victoire d\u2019étage -> aucun reset auto du pool (PV/mana conservés dans le run)', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  const iid = api.store.team.slots[0];
  // blesse la carte AVANT le combat : le pool doit persister (pose avant enterAt, plus de reset au nouveau run)
  api.store.runState = { active: true, kind: 'donjon', units: { [iid]: { hp: 5, mana: 0 } } };
  await enterDungeon(api, doc);
  api.store.runMod = null; // pas de mod de regeneration pour ce test
  weakenEnemies(api);
  const st = await playOut(api, els);
  await wait(400);
  assert.equal(st.winner, 'team');
  const mem = api.store.runState.units[iid];
  assert.ok(api.store.runState.active, 'runState toujours actif après victoire');
  assert.ok(mem && mem.hp <= 5, `PV persistés (<= 5), pas de régénération : hp=${mem && mem.hp}`);
  assert.ok(Number.isFinite(mem.mana), 'mana persisté (regen de combat normale incluse)');
});

test('Lot C : retour à l\u2019accueil (ville) -> restauration complète + toast, K.O. relevé', async (t) => {
  const { api, doc } = boot();
  t.after(() => { api.go('#accueil'); api.store.errance = null; });
  const iid = api.store.team.slots[0];
  api.store.runState = { active: true, kind: 'zone', units: { [iid]: { hp: 0, mana: 0 } } };
  api.save();
  await wait(30);
  api.go('#terres'); // quitte l'accueil
  await wait(30);
  api.go('#accueil'); // retour ville
  await wait(30);
  const st = api.statsAt ? null : null;
  const c = api.byId(api.byIid(iid).id);
  const full = api.curHpManaOf(iid);
  assert.ok(full.hp === full.maxHp && full.hp > 0, `PV restaurés à plein (${full.hp}/${full.maxHp})`);
  assert.ok(full.mana === full.manaMax, 'mana restauré à plein');
  assert.ok(!api.store.runState.active || Object.keys(api.store.runState.units).length === 0, 'pool remis à zéro (repos)');
});

test('Lot C : un K.O. persiste entre deux combats (carte à 0 PV reste K.O. hors soin)', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  await enterDungeon(api, doc);
  const iid = api.store.team.slots[0];
  const st0 = api._state();
  st0.team.avant[0].hp = 0; st0.team.avant[0].alive = false; // K.O. simulé en combat
  weakenEnemies(api);
  const st = await playOut(api, els);
  await wait(400);
  assert.equal(st.winner, 'team');
  const mem = api.store.runState.units[iid];
  assert.ok(mem && mem.hp === 0, `K.O. persisté dans le run (hp=${mem && mem.hp})`);
  const cur = api.curHpManaOf(iid);
  assert.equal(cur.hp, 0, 'hors combat la carte reste à 0 PV (K.O. persistant)');
});

test('Lot C : la constante REGEN_BOSS_STAGE est supprimée des data et du code', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  for (const f of readdirSync('data').filter((f) => f.endsWith('.json'))) {
    assert.ok(!readFileSync('data/' + f, 'utf8').includes('REGEN_BOSS_STAGE'), f);
  }
  assert.ok(!readFileSync('src/ui.js', 'utf8').includes('REGEN_BOSS_STAGE'));
  assert.ok(!readFileSync('src/data.js', 'utf8').includes('REGEN_BOSS_STAGE'));
});
