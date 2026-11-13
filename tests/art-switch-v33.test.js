import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bootDist, wait } from '../stub.mjs';

// v1.51 (vague 3.3) : switch 4 versions des illustrations — cycle V3 → V3.1 → V3.2 → V3.3,
// étiquette de version sur le bouton 🖼️, préférence persistée (fondations-art-src),
// manifeste manquant = bouton grisé libellé, jamais d'erreur, version courante inchangée.

const uiSrc = () => readFileSync('src/ui.js', 'utf8');
const distSrc = () => readFileSync('dist.html', 'utf8');

const MANIFESTS = {
  'assets-v3.json': { art: { a1: 'data:image/jpeg;base64,AAA' }, bg: {} },
  'assets-v3.1.json': { art: { a1: 'data:image/jpeg;base64,BBB' }, bg: {} },
  'assets-v32.json': { art: { a1: 'data:image/jpeg;base64,CCC' }, bg: {} },
  'assets-v33.json': { art: { a1: 'data:image/jpeg;base64,DDD' }, bg: {} },
};

function bootWithFetch(manifests) {
  const r = bootDist('dist.html');
  r.ctx.fetch = (url) => {
    const m = manifests[String(url)];
    return Promise.resolve(m ? { ok: true, json: () => Promise.resolve(m) } : { ok: false, json: () => Promise.resolve({}) });
  };
  return r;
}

test('v1.51 (a) : ART_MANIFESTS = 4 versions dans l’ordre du cycle, étiquettes de bouton', () => {
  const src = uiSrc();
  assert.ok(src.includes("const ART_MANIFESTS = { v3: 'assets-v3.json', v31: 'assets-v3.1.json', v32: 'assets-v32.json', v33: 'assets-v33.json' };"), '4 manifestes');
  assert.ok(src.includes("const ART_SRC_TAG = { v3: 'V3', v31: 'V3.1', v32: 'V3.2', v33: 'V3.3' };"), 'étiquettes V3/V3.1/V3.2/V3.3');
  const d = distSrc();
  assert.ok(d.includes("v32: 'assets-v32.json'") && d.includes("v33: 'assets-v33.json'"), 'dist à jour');
});

test('v1.51 (b) : cycle complet V3 → V3.1 → V3.2 → V3.3 → V3, préférence persistée, étiquette sur le bouton', async () => {
  const { doc, mem } = bootWithFetch(MANIFESTS);
  await wait(120); // laisser start() attacher le listener du bouton
  const btn = doc.getElementById('art-src-btn');
  assert.ok(btn, 'bouton présent');
  const seq = ['v31', 'v32', 'v33', 'v3'];
  const tags = ['🖼️ V3.1', '🖼️ V3.2', '🖼️ V3.3', '🖼️ V3'];
  for (let i = 0; i < 4; i++) {
    btn.click();
    await wait(60);
    assert.equal(mem.get('fondations-art-src'), seq[i], 'préférence persistée ' + seq[i]);
    assert.equal(btn.textContent, tags[i], 'étiquette bouton ' + tags[i]);
    assert.ok(!btn.classList.contains('off'), 'bouton non grisé sur manifeste présent');
  }
});

test('v1.51 (c) : préférence persistée relue au boot (v33 rechargée = V3.3)', async () => {
  const { doc, mem } = bootWithFetch(MANIFESTS);
  await wait(120);
  mem.set('fondations-art-src', 'v33');
  const btn = doc.getElementById('art-src-btn');
  btn.click(); // v33 -> v3 (cycle reboucle)
  await wait(60);
  assert.equal(mem.get('fondations-art-src'), 'v3', 'cycle depuis v33 reboucle sur v3');
  assert.equal(btn.textContent, '🖼️ V3');
});

test('v1.51 (d) : manifeste manquant toléré — bouton grisé libellé, version courante inchangée, aucune erreur', async () => {
  const partial = { ...MANIFESTS };
  delete partial['assets-v32.json']; // v3.2 indisponible
  const { doc, mem, errors } = bootWithFetch(partial);
  await wait(120);
  const btn = doc.getElementById('art-src-btn');
  const errBefore = errors.length;
  mem.set('fondations-art-src', 'v31');
  btn.click(); // tente v32 -> manquant
  await wait(60);
  assert.equal(mem.get('fondations-art-src'), 'v31', 'version courante inchangée');
  assert.equal(btn.textContent, '🖼️ V3.2', 'bouton libellé avec la version manquante');
  assert.ok(btn.classList.contains('off'), 'bouton grisé');
  assert.equal(errors.length, errBefore, 'aucune erreur non gérée');
  btn.click(); // v31 -> v33 (v32 sauté car la préférence n'a pas bougé : cycle depuis v31 tente v32 à chaque clic)
  await wait(60);
  // le cycle repart de la version courante (v31) : le clic suivant retombe sur v32 manquant
  assert.equal(mem.get('fondations-art-src'), 'v31', 'toujours v31 tant que v32 est manquant');
});
