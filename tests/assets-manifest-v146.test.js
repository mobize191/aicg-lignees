import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Spec vie du jeu — Lot 0 : tools/assets-manifest.json, une entrée par art de production,
// schéma { id, kind, source{kind, model, loras[], seed}, qa{status, date}, production{path, w, h, ko} }.
// Licences LoRAs enregistrées pour information, NON bloquantes.

test('Lot 0 : le manifeste couvre tous les arts des manifestes de production avec source+qa', () => {
  assert.ok(existsSync('tools/assets-manifest.json'));
  const man = JSON.parse(readFileSync('tools/assets-manifest.json', 'utf8'));
  assert.ok(Array.isArray(man.entries) && man.entries.length > 0);
  const byKey = new Map(man.entries.map((e) => [e.production.path + ':' + e.id, e]));
  for (const mf of ['assets-v3.json', 'assets-v3.1.json']) {
    const d = JSON.parse(readFileSync(mf, 'utf8'));
    for (const kind of ['art', 'bg']) {
      for (const aid of Object.keys(d[kind] ?? {})) {
        const e = byKey.get(mf + ':' + aid);
        assert.ok(e, `entrée manquante ${mf}:${aid}`);
        assert.equal(e.kind, kind);
        assert.ok(e.source && e.source.kind === 'gen' && e.source.model, 'source gen + modèle');
        assert.ok(Array.isArray(e.source.loras), 'loras en liste');
        assert.ok(e.qa && e.qa.status && e.qa.date, 'qa status+date');
        assert.ok(e.production && e.production.path === mf && Number.isInteger(e.production.w) && e.production.w > 0, 'production path + dimensions');
      }
    }
  }
});

test('Lot 0 : seeds et LoRAs de la session 3.2 remontés, licences enregistrées pour information', () => {
  const man = JSON.parse(readFileSync('tools/assets-manifest.json', 'utf8'));
  const withSeed = man.entries.filter((e) => Number.isInteger(e.source.seed));
  const withLora = man.entries.filter((e) => e.source.loras.length > 0);
  assert.ok(withSeed.length > 400, `${withSeed.length} seeds remontés`);
  assert.ok(withLora.length > 50, `${withLora.length} entrées avec LoRA`);
  for (const e of withLora) {
    for (const l of e.source.loras) {
      assert.ok('license' in l, 'licence enregistrée (non bloquante)');
      assert.ok(l.trigger, 'trigger renseigné');
    }
  }
});
