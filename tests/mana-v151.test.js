import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootDist } from '../stub.mjs';

// correctifs v1.51 lot 1 (point 4) : prouver que le mana PERSISTE d'un combat de zone au suivant,
// sans passage par l'Accueil (repos ville) ni l'autel — ni 60 % (MANA_START_RATIO), ni max.

test('v1.51 lot 1 : victoire en zone -> combat suivant avec le mana restant persisté (ni 60 %, ni max)', () => {
  const { api } = bootDist('dist.html');
  api._tacPause(true); // pas de chaîne de tours dans le stub
  api.store.team.slots = [api.newInst('n1', 5).iid, api.newInst('n3', 5).iid];
  api.store.errance = api.createErranceState('zone-marees');

  // 1er combat de zone : runState inactif -> mana au démarrage = MANA_START_RATIO (60 %)
  api.startZoneFight('zone-marees', { donjon: false });
  const st1 = api._state();
  const u1 = st1.team.avant[0];
  const iid = u1.iid;
  const manaMax = u1.manaMax;
  const ratio = api.M?.MANA_START_RATIO ?? api.DATA?.engine?.moteur?.MANA_START_RATIO ?? 0.6;
  assert.equal(u1.mana, Math.min(manaMax, Math.round(manaMax * ratio)), '1er combat : mana à 60 % (création)');

  // fin de combat gagnée : on persiste un mana restant arbitraire (ni 60 %, ni max)
  const restant = Math.max(0, manaMax - 4);
  if (restant === Math.round(manaMax * ratio) || restant === manaMax) throw new Error('valeur de test invalide');
  u1.mana = restant;
  api.persistRunStateFrom(st1); // ce que fait l'UI à la fin du combat (victoire comme défaite)
  assert.equal(api.store.runState.active, true);
  assert.equal(api.store.runState.units[iid].mana, restant, 'mana persisté dans le run');

  // 2e combat de zone, SANS Accueil ni autel entre les deux
  api.store.zoneFight = null; // ce que fait la victoire en zone avant retour errance
  api.startZoneFight('zone-marees', { donjon: false });
  const st2 = api._state();
  const u2 = st2.team.avant.find((x) => x.iid === iid);
  assert.ok(u2, 'même exemplaire au 2e combat');
  assert.equal(u2.mana, restant, 'mana de départ = restant persisté (applyRunStateTo écrase les 60 %)');
  assert.notEqual(u2.mana, Math.round(manaMax * ratio), 'pas de remise à 60 % cachée');
  assert.notEqual(u2.mana, manaMax, 'pas de remise au max cachée');
});

test('v1.51 lot 1 : retour à l\'Accueil entre deux combats de zone = repos en ville voulu (pool remis à zéro)', () => {
  const { api } = bootDist('dist.html');
  api._tacPause(true);
  api.store.team.slots = [api.newInst('n1', 5).iid];
  api.store.errance = api.createErranceState('zone-marees');
  api.startZoneFight('zone-marees', { donjon: false });
  const st1 = api._state();
  const iid = st1.team.avant[0].iid;
  st1.team.avant[0].mana = 1;
  api.persistRunStateFrom(st1);
  assert.equal(api.store.runState.units[iid].mana, 1);
  api.store.zoneFight = null;
  api.go('#accueil'); // repos en ville (tranché) : healRunComplet remet le pool à zéro
  assert.equal(Object.keys(api.store.runState.units).length, 0, 'pool remis à zéro par le repos en ville');
  const cur = api.curHpManaOf(iid);
  assert.equal(cur.mana, cur.manaMax, 'hors combat : mana affiché à plein après repos ville');
});
