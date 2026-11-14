import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot G (spec-gel-v1 §3 lot G, §1.8) : retrait des scories p2 Ange Gardien et p4 Fidèle du Jour
// (mortes suites 28/30) : plus dans les data, plus de référence (familles, éveil remplace, fusion, ids divins).

const E = loadEngine();

test('lot G gel : p2 et p4 retirés des data et de toutes les références', () => {
  assert.equal(E.getCard('p2'), undefined);
  assert.equal(E.getCard('p4'), undefined);
  const ev = E.eveilOf('n13', 'p1');
  assert.equal(ev.effet, 'standard', 'plus de remplace (p2 parti)');
  assert.equal(ev.disparait, undefined);
  assert.ok(!E.DATA.engine.RACE_DIVINE_IDS.includes('p2'));
  assert.ok(!Object.values(E.DATA.families).some((f) => [...(f.steps ?? []), ...(f.future ?? [])].includes('p2')));
  assert.ok(!Object.values(E.DATA.families).some((f) => [...(f.steps ?? []), ...(f.future ?? [])].includes('p4')));
  assert.ok(!E.DATA['fusion-map'].divin.signatures.p2);
  const allText = JSON.stringify(E.DATA);
  assert.ok(!allText.includes('"p2"') && !allText.includes('"p4"'), 'aucune référence id p2/p4 dans data/');
});

test('lot G gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});
