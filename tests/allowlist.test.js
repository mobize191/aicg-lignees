// EXI-MOD-1 : aucun identifiant ou valeur de design code en dur dans src/engine/
// Regle retenue (documentee au rapport de phase 0) : on signale les decimaux, les entiers >= 10
// hors allowlist, et toute chaine egale a un id ou un nom connu des donnees.
// Les petits entiers 0-9 sont structurels (index, bornes de boucle).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { loadData } from './helpers/load.mjs';

const stripComments = (code) => code
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const allowlist = () => new Set(
  readFileSync('tests/allowlist.txt', 'utf8').split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => l.trim().split(/\s+/)[0])
);

test('src/engine/ ne contient aucune valeur de design en dur (EXI-MOD-1)', () => {
  const allowed = allowlist();
  const data = loadData();
  const knownIds = new Set([...(data.cards ?? []), ...(data.monsters ?? [])].map((c) => c.id));
  const knownNames = new Set();
  for (const arr of [data.cards, data.monsters]) for (const c of arr ?? []) if (c.name) knownNames.add(c.name);
  for (const fam of Object.values(data['lineage-spells'] ?? {})) for (const s of fam ?? []) knownNames.add(s.name);
  for (const g of Object.values(data.grimoire ?? {})) for (const s of Object.values(g ?? {})) if (s.name) knownNames.add(s.name);

  const coupables = [];
  for (const f of readdirSync('src/engine').filter((f) => f.endsWith('.js'))) {
    const code = stripComments(readFileSync(`src/engine/${f}`, 'utf8'));
    for (const m of code.matchAll(/\b\d+(\.\d+)?\b/g)) {
      const n = m[0];
      const isDecimal = n.includes('.');
      if ((isDecimal || Number(n) >= 10) && !allowed.has(n)) coupables.push(`${f}: nombre ${n}`);
    }
    for (const m of code.matchAll(/'([^'\\]{1,60})'|"([^"\\]{1,60})"/g)) {
      const s = m[1] ?? m[2];
      if (knownIds.has(s) || knownNames.has(s)) coupables.push(`${f}: chaine de design "${s}"`);
    }
  }
  assert.deepEqual(coupables, []);
});
