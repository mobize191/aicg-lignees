import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot B (spec-gel-v1 §3 lot B, option (d) TRANCHÉE suite 31) : l'accès au Chœur Miroir
// passe par n15 Éveillé du Seuil (source des trois familles divines) ; n14 → d8 est retiré
// (garde-fou levé : le nouvel accès est posé) ; chaînes Chœur/Pont recâblées sans d8/d14.

const E = loadEngine();

function monsterNext(id) {
  for (const fams of Object.values(E.DATA['monster-families'])) {
    for (const fam of fams) for (const line of fam.lines ?? []) {
      const i = line.indexOf(id);
      if (i >= 0 && i < line.length - 1) return line[i + 1];
    }
  }
  return (E.DATA['solo-steps'] ?? {})[id] ?? null;
}

function chainOf(id) {
  const out = [id];
  let cur = id;
  const choices = (E.DATA.evolutions ?? {})[cur] ?? [];
  while (cur && out.length < 10) {
    const ch = (E.DATA.evolutions ?? {})[cur] ?? [];
    const next = ch.length ? ch[0].to : monsterNext(cur);
    if (!next || out.includes(next)) break;
    out.push(next);
    cur = next;
  }
  return out;
}

test('lot B gel : n15 ouvre les trois familles divines (d1 Seuil, d7 Chœur, d13 Pont)', () => {
  assert.deepEqual(E.eveilsOf('n15').map((e) => e.vers).sort(), ['d1', 'd13', 'd7']);
  assert.deepEqual(E.DATA.evolutions.n15.map((c) => c.to).sort(), ['d1', 'd13', 'd7']);
});

test('lot B gel : le garde-fou est levé — n14 → d8 retiré des éveils et évolutions', () => {
  assert.deepEqual(E.eveilsOf('n14').map((e) => e.vers).sort(), ['d19', 'd24']);
  assert.ok(!E.DATA.evolutions.n14.some((c) => c.to === 'd8'));
});

test('lot B gel : le Chœur reste jouable — chaîne d7 → d9 → d10 → d11 → d12 sans trou (d8 retiré)', () => {
  assert.deepEqual(chainOf('d7'), ['d7', 'd9', 'd10', 'd11', 'd12']);
  assert.equal(E.getMonster('d12').name, 'Écho, Voix Miroir');
  // Pont sans d14
  assert.deepEqual(chainOf('d13'), ['d13', 'd15', 'd16', 'd17', 'd18']);
  // Seuil inchangé
  assert.deepEqual(chainOf('d1'), ['d1', 'd2', 'd3', 'd4', 'd5', 'd6']);
});

test('lot B gel : d8/d14 retirés des ids divins joueur (restent des monstres du biome divin)', () => {
  assert.ok(!E.DATA.engine.RACE_DIVINE_IDS.includes('d8'));
  assert.ok(!E.DATA.engine.RACE_DIVINE_IDS.includes('d14'));
  assert.equal(E.raceOfCard(E.getMonster('d8')), 'monstre');
  assert.equal(E.raceOfCard(E.getMonster('d7')), 'divine');
  assert.ok(E.getMonster('d8') && E.getMonster('d14'), 'cartes conservées en data (sauvegardes)');
});

test('lot B gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});
