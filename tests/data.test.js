import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData, loadEngine } from './helpers/load.mjs';
test('les donnees se chargent et passent le validateur (ACC-0-3)', () => {
  const E = loadEngine();
  assert.deepEqual(E.errors, []);
});
test('les cartes connues sont presentes (e13, d18, n15)', () => {
  const data = loadData();
  assert.ok(data.monsters.find((m) => m.id === 'e13'));
  assert.ok(data.monsters.find((m) => m.id === 'd18'));
  assert.ok(data.cards.find((c) => c.id === 'n15'));
});
test('le rang N : les 12 naissances sont N, les 3 divines restent C (EXI-P1-1)', () => {
  const data = loadData();
  const naiss = data.cards.filter((c) => c.raciale);
  const idsN = naiss.filter((c) => c.rarity === 'N').map((c) => c.id).sort();
  assert.deepEqual(idsN, ['n1', 'n10', 'n11', 'n12', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9']);
  const idsC = naiss.filter((c) => c.rarity === 'C' && !c.archived).map((c) => c.id).sort();
  assert.deepEqual(idsC, ['n13', 'n14', 'n15']);
  assert.ok(naiss.every((c) => c.rarity !== 'N' || (!c.family && !c.dungeon)), 'une naissance N est hors lignee');
  assert.equal(data.cards.filter((c) => c.rarity === 'N' && !c.raciale).length, 0, 'le rang N reste reserve aux naissances');
});
test('le rang N : aucune famille de lignee ne contient une naissance (EXI-P1-1)', () => {
  const data = loadData();
  const idsN = new Set(data.cards.filter((c) => c.rarity === 'N').map((c) => c.id));
  for (const f of Object.values(data.families)) {
    for (const step of [...(f.steps ?? []), ...(f.future ?? [])]) {
      assert.ok(!idsN.has(step), `la famille ${f.name} reference la naissance ${step}`);
    }
  }
});
test('le rang N : le moteur le connait, moins fort que la commune, avec un cout d eveil (EXI-P1-1)', () => {
  const data = loadData();
  const E = data.engine;
  assert.equal(E.RARITY_LABEL.N, 'Naissance');
  assert.ok(E.RARITY_POWER.N < E.RARITY_POWER.C, 'la naissance est moins puissante que la commune');
  assert.ok(E.RANK.N < E.RANK.C, 'la naissance est un rang sous la commune');
  assert.ok(E.EVEIL_COST >= 1, 'le cout en pierres d eveil existe (EVEIL_COST)');
  assert.ok(!E.EVO_COST.N, 'le rang N ne paie plus en eclats : son eveil consomme des pierres');
});
test('le rang N : les 5 Embryons (ex-Bestiau) portent leurs nouveaux noms (renommage v15)', () => {
  const data = loadData();
  const byId = (id) => data.cards.find((c) => c.id === id);
  assert.equal(byId('n5').name, 'Embryon des Eaux');
  assert.equal(byId('n6').name, 'Embryon des Flammes');
  assert.equal(byId('n7').name, 'Embryon du Vivant');
  assert.equal(byId('n8').name, 'Embryon des Ténèbres');
  assert.equal(byId('n9').name, 'Embryon des Cieux');
});
