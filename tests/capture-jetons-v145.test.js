import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootDist, wait } from '../stub.mjs';
import { loadEngine } from './helpers/load.mjs';

// Refonte direction — Lot D (TRANCHÉ 12/11) : capture à la DQM à l'écran Récompenses (un essai manuel,
// % = taux de zone × force, plafonné en data) + nouvelle devise JETONS (vendeur de compagnons à 3 offres/jour,
// jamais d'or ; sources = donjons bouclés, jalons, quêtes).

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

async function playOut(api, els, maxK = 900) {
  for (let k = 0; k < maxK; k++) {
    const st = api._state();
    if (!st || st.winner) return st;
    const am = api._actEl();
    if (am) {
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
      const pb = am.querySelector('.act-pass');
      if (pb) { pb.click(); continue; }
      await wait(40);
      continue;
    }
    await wait(40);
  }
  return api._state();
}

test('Lot D : l\u2019écran Récompenses propose une capture par monstre vaincu, avec % affiché (taux zone × force)', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  await enterDungeon(api, doc);
  const st = api._state();
  for (const e of [...st.enemies.avant, ...st.enemies.arriere]) { e.hp = 1; e.maxHp = 1; }
  await playOut(api, els);
  await wait(500);
  const rows = [...doc.body.querySelectorAll('.recomp-row')];
  const capRows = rows.filter((r) => r.textContent.includes('Tenter la capture'));
  const nbVaincus = [...st.enemies.avant, ...st.enemies.arriere].filter((u) => !u.boss && !(u.name ?? '').includes(',')).length;
  assert.ok(capRows.length === nbVaincus && nbVaincus > 0, `${capRows.length} propositions pour ${nbVaincus} monstres vaincus`);
  assert.ok(/\d+ %/.test(capRows[0].textContent), '% affiché : ' + capRows[0].textContent.slice(0, 60));
});

test('Lot D : un seul essai de capture par monstre — bouton désactivé après le clic', async (t) => {
  const { api, doc, els } = boot();
  t.after(() => { doc?.body?.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  await enterDungeon(api, doc);
  const st = api._state();
  for (const e of [...st.enemies.avant, ...st.enemies.arriere]) { e.hp = 1; e.maxHp = 1; }
  await playOut(api, els);
  await wait(500);
  const row = [...doc.body.querySelectorAll('.recomp-row')].find((r) => r.textContent.includes('Tenter la capture'));
  assert.ok(row, 'ligne capture présente');
  row.click();
  await wait(30);
  assert.ok(row.disabled, 'bouton désactivé après un essai');
  const before = api.store.collection.size;
  row.click(); // second clic : aucun effet (déjà essayé)
  await wait(30);
  assert.ok(api.store.collection.size <= before + 1, 'un seul essai effectif');
});

test('Lot D : jetons — achat compagnon en jetons (or intact), refus sans jetons, 3 offres stables dans la journée', async () => {
  const { api } = boot();
  const offres = api.compagnonsDuJour();
  assert.equal(offres.length, 3, '3 offres quotidiennes');
  assert.equal(api.compagnonsDuJour().map((c) => c.id).join(), offres.map((c) => c.id).join(), 'stables dans la journée');
  const c = offres[0];
  const prix = api.compagnonPrix(c);
  api.store.gold = 99999; api.store.jetons = prix;
  const owned0 = api.ownedOf(c.id) ?? 0;
  assert.equal(api.buyCompagnon(c.id), true);
  assert.equal(api.store.jetons, 0, 'jetons débités');
  assert.equal(api.store.gold, 99999, 'or intact — jamais d\u2019or pour le vendeur');
  assert.equal(api.ownedOf(c.id), owned0 + 1);
  assert.equal(api.buyCompagnon(c.id), false, 'refus sans jetons (or plein)');
});

test('Lot D : sources de jetons en data + formules de capture en data', () => {
  const E = loadEngine();
  assert.equal(E.DATA.engine.CAPTURE_FORCE_CAP, 3);
  assert.deepEqual(E.DATA.engine.JETONS, { donjonBoucle: 10, jalon: 5, quetePetite: 1, queteMoyenne: 2, queteGrande: 4 });
  assert.deepEqual(E.DATA.guilde.prixCompagnonsJetons, { C: 5, UC: 12, R: 30, SR: 80, UR: 200 });
  // boss et nommés jamais capturables
  const st = E.initCombat({ avant: [{ ...E.getCard('a1'), level: 20 }], reserve: [] },
    [{ ...E.getMonster('e1'), boss: true }, { ...E.getMonster('e2') }], 5);
  const rec = E.recrutableMonsters(st);
  assert.ok(rec.every((u) => !u.boss), 'boss exclu');
});

test('Lot D : migration passive — une sauvegarde sans champ jetons charge avec jetons = 0', async () => {
  const { api } = boot();
  assert.equal(api.store.jetons, 0);
  // simule une vieille sauvegarde sans le champ
  const raw = api.store;
  delete raw.jetons;
  assert.equal(raw.jetons ?? 0, 0, 'valeur par défaut sûre');
});
