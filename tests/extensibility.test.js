import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';

test('un monstre ajoute en donnees seules est jouable (ACC-0-4, EXI-MOD-2)', () => {
  const E = loadEngine('tests/fixtures/data-temoin');
  E.setRoll(mulberry32(1));
  const team = {
    attaque: [E.getCard('n1'), E.getCard('n4')],
    support: [E.getCard('n3')],
  };
  const temoin = E.getMonster('x-temoin');
  assert.ok(temoin, 'le monstre temoin existe dans les donnees du fixture');
  const st = E.initCombat(team, [temoin], 999, {});
  const log = E.playAuto(st, 60);
  assert.ok(log.some((e) => e.sourceId === 'e.a0'), 'le temoin a agi dans le combat');
});
