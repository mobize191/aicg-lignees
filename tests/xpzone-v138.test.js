import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// correctifs v1.39 lot 1 : l'XP est distribuée à CHAQUE combat terminé — la condition de fin de run
// (!won || finalClear || zoneFight) + runLog.stages a disparu ; victoire de donjon, victoire de zone
// ET défaite de zone distribuent (règle v1.38 préservée pour la zone), défaite de donjon ne distribue rien.

test('v1.39 lot 1 (a) : le bloc XP est par combat — condition (won || zoneFight), plus de runLog.stages dans la condition ni la base', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  const m = src.match(/if \(!store\.defiActive && runLog && \(([^)]+)\)\)/);
  assert.ok(m, 'bloc XP trouvé');
  assert.ok(m[1].includes('won'), 'victoire : XP distribuée immédiatement');
  assert.ok(m[1].includes('store.zoneFight'), 'combat de zone : victoire comme défaite (v1.38 préservée)');
  assert.ok(!m[1].includes('finalClear') && !m[1].includes('!won'), 'plus de condition de fin de run');
  assert.ok(!/runLog\.stages > 0/.test(src), 'plus de garde runLog.stages > 0');
  const b = src.match(/const baseXp = ([^;]+);/);
  assert.ok(b, 'baseXp trouvée');
  assert.ok(!b[1].includes('runLog.stages'), 'la base est ramenée à UN étage (plus de runLog.stages ×)');
  assert.ok(/^1 \* DIFFX\.pts/.test(b[1]), 'base = 1 étage × DIFFX.pts × …');
});

test('v1.39 lot 1 (b) : la fenêtre Récompenses reçoit une entrée xp à chaque combat (pushRecomp xp dans le bloc par combat)', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/pushRecomp\('xp',/.test(src), 'entrée xp poussée dans recomp');
  assert.ok(/pushRecomp\('xp'[\s\S]*?xpParts\.join/.test(src), 'détail XP par personnage (nom → niveau, % si mult < 1)');
});

test('v1.39 lot 1 (c) : le récap de fin de donjon n\'est plus qu\'un affichage (xpRecapOf, aucune distribution dans runEndModal)', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/function xpRecapOf\(/.test(src), 'helper de récap agrégé');
  const m = src.match(/function runEndModal\(\) \{([\s\S]*?)\n\}/);
  assert.ok(m, 'runEndModal trouvé');
  assert.ok(!/addXpI|registerXpRun/.test(m[1]), 'runEndModal ne distribue plus rien');
});
