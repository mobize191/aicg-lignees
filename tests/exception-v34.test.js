import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEngine, loadData } from './helpers/load.mjs';
import { bootDist, wait } from '../stub.mjs';

// v3.4 — mécanique Exception (prompt docs/prompt-exception-v34.md, lot E1, bloquant B1 de la revue
// suite 57, consignation suite 61) : tirage unique à l'obtention au patron du lot 8 SHINY
// (taux 1/100 en data EXCEPTION.taux, thème 50/50 r/o), drapeau porté par l'exemplaire,
// coexistence shiny/Exception, art chaîné shiny > exception > classique, apposition seedée,
// persistance save/restore + migration v32 -> v33 idempotente, héritage fusion miroir du shiny,
// collection (compteur + filtre). Cosmétique pure : le digest ne bouge pas.

const E = loadEngine();
const data = loadData();
const CFG = data.engine.EXCEPTION;

test('E1 : bloc EXCEPTION en data + versions 33 (EXI-DATA-9, EXI-SAVE-1)', () => {
  assert.equal(CFG.taux, 0.01, 'taux = 1/100, aligné sur le shiny');
  assert.equal(CFG.themeR, 0.5, 'thème 50/50 r/o');
  assert.ok(Number.isInteger(CFG.migrationSeed));
  assert.deepEqual(E.EXCEPTION_CFG, CFG, 'alias EXCEPTION_CFG exposé au moteur/UI');
  assert.equal(E.DATA.engine.CURRENT_VERSION, 33);
  assert.equal(E.DATA.engine.SAVE_VERSION, 33);
});

test('E1 : rollException — taux 0 jamais, taux 1 toujours, 1/100 mesurable sur 10 000 seeds, déterministe', () => {
  for (let s = 1; s <= 50; s++) assert.equal(E.rollException(E.mulberry32(s), { taux: 0 }), false);
  for (let s = 1; s <= 50; s++) assert.equal(E.rollException(E.mulberry32(s), { taux: 1 }), true);
  const rng = E.mulberry32(4242);
  let n = 0;
  for (let i = 0; i < 10000; i++) if (E.rollException(rng, CFG)) n++;
  assert.ok(n > 30 && n < 200, `taux mesuré ~1/100 : ${n}/10000`);
  assert.equal(E.rollException(E.mulberry32(7), CFG), E.rollException(E.mulberry32(7), CFG), 'déterministe');
});

test('E1 : exceptionTheme — uniquement r/o, 50/50 sur 10 000 seeds, déterministe', () => {
  const rng = E.mulberry32(99);
  let r = 0, o = 0;
  for (let i = 0; i < 10000; i++) {
    const t = E.exceptionTheme(rng, CFG);
    assert.ok(t === 'r' || t === 'o');
    if (t === 'r') r++; else o++;
  }
  assert.ok(r > 4000 && r < 6000 && o > 4000 && o < 6000, `50/50 : r=${r} o=${o}`);
  assert.equal(E.exceptionTheme(E.mulberry32(3), CFG), E.exceptionTheme(E.mulberry32(3), CFG));
});

test('E1 : migration v32 -> v33 — tirage seedé, non destructif, idempotent (flag existant gagne)', () => {
  const save = {
    version: 32, gold: 500,
    instances: [
      { iid: 1, id: 'n1', lvl: 12, xp: 0, acc: [], shiny: false, shinyBonus: 0 },
      { iid: 2, id: 'a1', lvl: 10, xp: 0, acc: [], shiny: true, shinyBonus: 0.04 },
      { iid: 3, id: 'g9', lvl: 8, xp: 0, acc: [] },
      { iid: 4, id: 'e7', lvl: 5, xp: 0, acc: [], exception: 'o' }, // flag existant : conservé tel quel
    ],
  };
  const out = E.migrate(JSON.parse(JSON.stringify(save)));
  assert.equal(out.version, 33);
  assert.equal(out.gold, 500, 'non destructif');
  assert.equal(out.instances[3].exception, 'o', 'flag existant gagne (pas de double tirage)');
  for (const inst of out.instances) {
    assert.ok(inst.exception === null || inst.exception === 'r' || inst.exception === 'o', 'exception posée sur chaque exemplaire');
  }
  const out2 = E.migrate(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(out.instances.map((i) => i.exception), out2.instances.map((i) => i.exception), 'déterministe / idempotent (2 passes)');
  const out3 = E.migrate(JSON.parse(JSON.stringify(out)));
  assert.deepEqual(out3.instances.map((i) => i.exception), out.instances.map((i) => i.exception), 'rejouer sur le résultat = aucun re-tirage');
  // chaîne v31 -> v33 : shiny (v32) puis Exception (v33)
  const old = E.migrate({ version: 31, instances: [{ iid: 1, id: 'n1', lvl: 5 }], gold: 10 });
  assert.equal(old.version, 33);
  assert.equal(typeof old.instances[0].shiny, 'boolean');
  assert.ok(old.instances[0].exception === null || ['r', 'o'].includes(old.instances[0].exception));
});

test('E1 : fusion — 4 combinaisons shiny/Exception, héritage miroir indépendant (cumul possible)', () => {
  const cards = data.cards.filter((c) => c.rarity !== 'N' && c.rarity !== 'M');
  const mk = (id, tag, opts = {}) => ({ iid: `i-${tag}-${id}`, id, lvl: 10, xp: 0, acc: [], ...opts });
  let teste = 0;
  for (let s = 1; s <= 60; s++) {
    const a = cards[s % cards.length];
    const b = cards[(s * 5 + 1) % cards.length];
    if (a.id === b.id) continue;
    const combos = [
      [{}, {}, false, false],
      [{ shiny: true, shinyBonus: 0.04 }, {}, true, false],
      [{}, { exception: 'r' }, false, true],
      [{ shiny: true, shinyBonus: 0.03 }, { exception: 'o' }, true, true],
    ];
    combos.forEach(([oa, ob, wantShiny, wantEx], k) => {
      const iA = mk(a.id, `${s}-${k}`, oa);
      const iB = mk(b.id, `${s}-${k}`, ob);
      const plan = E.fusionPreview(iA, iB, E.mulberry32(s));
      if (!plan.ok) return;
      assert.equal(plan.shinyHerite, wantShiny, 'héritage shiny inchangé');
      assert.equal(plan.exceptionHerite, wantEx, 'aperçu annonce l’héritage Exception');
      const res = E.doFusion([iA, iB], iA.iid, iB.iid, [], plan, { rng: E.mulberry32(s * 13 + k) });
      assert.ok(res.ok);
      assert.ok(!!res.enfant.shiny === wantShiny, 'héritage shiny indépendant de l’Exception');
      if (wantEx) assert.ok(res.enfant.exception === 'r' || res.enfant.exception === 'o', 'enfant Exception, thème re-tiré 50/50');
      else assert.equal(res.enfant.exception, undefined, 'pas d’héritage sans parent Exception');
      teste++;
    });
  }
  assert.ok(teste >= 40, `${teste} fusions testées sur les 4 combinaisons`);
});

test('E1 : validateur 0 erreur (EXI-DATA-9 EXCEPTION en data)', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

// ---------- niveau UI (dist réel via stub) ----------

test('E1 UI : newInst pose exception, instCard propage, artKeyOf chaîné, badge cardFront, apposition seedée', async () => {
  const { api } = bootDist('dist.html');
  await wait(120);
  const n0 = api.store.instances.length;
  const inst = api.newInst('n1', 1);
  assert.equal(api.store.instances.length, n0 + 1);
  assert.ok(inst.exception === null || inst.exception === 'r' || inst.exception === 'o', 'tirage à l’obtention (un seul tirage)');
  // propagation instCard
  inst.exception = 'o';
  assert.equal(api.instCard(api.byId('n1'), inst).exception, 'o');
  assert.equal(api.instCard(api.byId('n1'), { ...inst, exception: null }).exception, null);
  assert.equal(api.instCard(api.byId('n1'), { ...inst, exception: 'x' }).exception, null, 'valeur invalide -> null');
  // chaînage art : shiny > exception > classique
  api.setArt('n1', 'art-classic.jpg');
  api.setArt('n1-s', 'art-shiny.jpg');
  api.setArt('n1-r', 'art-repos.jpg');
  assert.equal(api.artKeyOf({ id: 'n1' }), 'n1');
  assert.equal(api.artKeyOf({ id: 'n1', exception: 'r' }), 'n1-r');
  assert.equal(api.artKeyOf({ id: 'n1', exception: 'o' }), 'n1', 'fallback propre : pas de -o au manifeste -> classique (jamais de glyph cassé)');
  assert.equal(api.artKeyOf({ id: 'n1', exception: 'r', shiny: true }), 'n1-s', 'shiny prioritaire sur exception');
  const artEx = api.artOf({ id: 'n1', name: 'x', classe: 'Mage', exception: 'r' });
  const artExO = api.artOf({ id: 'n1', name: 'x', classe: 'Mage', exception: 'o' });
  assert.ok(artEx.includes('art-repos.jpg') && /class="art-img exception exception-r"/.test(artEx), 'art -r + marqueur par thème exception-r');
  assert.ok(/class="art-img exception exception-o"/.test(artExO), 'marqueur par thème exception-o (fallback art classique)');
  // badge cardFront par thème (coexiste avec le shiny)
  const front = api.cardFront({ ...api.byId('n1'), level: 3, exception: 'r' });
  assert.ok(front.includes('✦ Repos') && /badge exception exception-r/.test(front));
  const frontO = api.cardFront({ ...api.byId('n1'), level: 3, exception: 'o' });
  assert.ok(frontO.includes('✧ Obscure') && /badge exception exception-o/.test(frontO));
  const frontBoth = api.cardFront({ ...api.byId('n1'), level: 3, exception: 'o', shiny: true });
  assert.ok(frontBoth.includes('✧ Obscure') && frontBoth.includes('✨ Shiny'), 'coexistence shiny + Exception');
  const frontPlain = api.cardFront({ ...api.byId('n1'), level: 3 });
  assert.ok(!frontPlain.includes('✦') && !frontPlain.includes('✧'));
  // CSS par thème embarquée dans le dist (B2)
  const dist = readFileSync('dist.html', 'utf8');
  assert.ok(dist.includes('.art-img.exception-o') && dist.includes('box-shadow: inset 0 0 0 2px rgba(140, 20, 32, .55)') && dist.includes('@keyframes exception-sheen-o') && dist.includes('.art-img.exception-r') && dist.includes('prefers-reduced-motion: no-preference'), 'marqueurs CSS par thème dans le dist');
  // apposition seedée : même seed -> même texte, préfixe « — », texte de la table
  const a1 = api.exceptionApposition('n1', 'r', 'marees', api.mulberry32(5));
  const a2 = api.exceptionApposition('n1', 'r', 'marees', api.mulberry32(5));
  assert.equal(a1, a2, 'seedé (exit Math.random())');
  assert.ok(a1.startsWith(' — ') && a1.length > 4, a1);
  assert.notEqual(api.exceptionApposition('n1', 'r', 'marees', api.mulberry32(6)), undefined);
  // universeOfCard : donjon des monstres, biome divin, sinon default
  const monstre = data.monsters.find((m) => m.dungeon === 'crypte');
  assert.equal(api.universeOfCard(monstre), 'crypte');
  assert.equal(api.universeOfCard(api.byId('n1')), 'default');
});

test('E1 UI : persistance save/restore — snapshot propage exception, restore le relit (r/o conservé, invalide -> null)', async () => {
  const { api, mem } = bootDist('dist.html');
  await wait(120);
  const inst = api.newInst('a1', 7);
  inst.exception = 'r';
  api.save();
  const key = api.slotKey(api._activeSlot());
  const raw = JSON.parse(mem.get(key));
  assert.equal(raw.version, 33, 'snapshot en v33');
  const saved = raw.instances.find((i) => i.iid === inst.iid);
  assert.equal(saved.exception, 'r', 'snapshot propage exception');
  // restore : valeur valide conservée
  const rawO = JSON.parse(JSON.stringify(raw));
  rawO.instances.find((i) => i.iid === inst.iid).exception = 'o';
  assert.equal(api.restore(rawO), true);
  assert.equal(api.store.instances.find((i) => i.iid === inst.iid).exception, 'o');
  // restore : valeur invalide -> null
  const rawX = JSON.parse(JSON.stringify(raw));
  rawX.instances.find((i) => i.iid === inst.iid).exception = 'x';
  assert.equal(api.restore(rawX), true);
  assert.equal(api.store.instances.find((i) => i.iid === inst.iid).exception, null);
  // restore d'une vieille save v32 sans le champ : migration v33 le pose via tryRestoreKey (flux réel migrate+restore)
  const raw32 = JSON.parse(JSON.stringify(raw));
  raw32.version = 32;
  for (const i of raw32.instances) delete i.exception;
  const mig = api.migrate(JSON.parse(JSON.stringify(raw32)));
  assert.equal(mig.version, 33);
  assert.ok(mig.instances.every((i) => i.exception === null || i.exception === 'r' || i.exception === 'o'), 'migration v32 -> v33 pose exception sur tous les exemplaires');
  assert.equal(api.restore(mig), true);
  assert.ok(api.store.instances.find((i) => i.iid === inst.iid).exception !== undefined, 'champ présent après restore migré');
});
