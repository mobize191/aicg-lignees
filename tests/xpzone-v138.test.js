import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// correctifs v1.38 lot 1 : tout combat de zone terminé (victoire OU défaite) distribue l'XP de run,
// formule inchangée ; un étage de donjon classique non final ne distribue toujours rien.

test('v1.38 lot 1 (b) : défaite de zone -> XP aussi (la condition couvre !won, inchangé)', () => {
  // la branche !won distribuait déjà l'XP avant v1.38 ; le garde-fou vérifie qu'elle est toujours là
  const src = readFileSync('src/ui.js', 'utf8');
  const m = src.match(/if \(!store\.defiActive && runLog && \(([^)]+)\) && runLog\.stages > 0\)/);
  assert.ok(m, 'bloc XP trouvé');
  const cond = m[1];
  assert.ok(cond.includes('!won'), 'défaite : XP (branche historique conservée)');
  assert.ok(cond.includes('finalClear'), 'fin de run donjon : XP (branche historique conservée)');
  assert.ok(cond.includes('store.zoneFight'), 'combat de zone : XP ajoutée (v1.38)');
});

test('v1.38 lot 1 (d) : la condition source couvre bien le combat de zone', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/\(!won \|\| finalClear \|\| !!store\.zoneFight\)/.test(src), 'condition XP : victoire de zone incluse');
});
