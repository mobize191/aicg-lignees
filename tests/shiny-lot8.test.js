import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

// Lot 8 — SHINY (prompt refonte v2, tranché suites 39-40) : tirage de la version de chaque
// EXEMPLAIRE à l'obtention (taux 1/100), un seul tirage porte le drapeau ET la variance
// individuelle bornée (+3-5 % de stats) ; art "<id>-s" avec fallback classique ; fusion :
// si au moins un parent est shiny, l'enfant l'est aussi. Migration v31 -> v32 non destructive.

const E = loadEngine();
const data = loadData();
const CFG = data.engine.SHINY;

test('lot 8 : bloc SHINY en data — taux 1/100 (TRANCHÉ suite 40), bornes 3-5 %, suffixe -s', () => {
  assert.equal(CFG.taux, 0.01, 'taux shiny = 1/100, aligné sur le taux d’Exception des thèmes');
  assert.equal(CFG.bonusMin, 0.03);
  assert.equal(CFG.bonusMax, 0.05);
  assert.equal(CFG.artSuffixe, '-s', 'manifeste : fichier {id}-s.jpg, clé "<id>-s"');
  assert.ok(Number.isInteger(CFG.migrationSeed));
  assert.deepEqual(E.SHINY_CFG, CFG, 'alias SHINY_CFG exposé au moteur/UI');
  assert.equal(E.DATA.engine.CURRENT_VERSION, 33); // v33 : migration Exception (suite 61)
  assert.equal(E.DATA.engine.SAVE_VERSION, 33);
});

test('lot 8 : rollShiny — un seul tirage porte les deux (drapeau + bonus borné)', () => {
  // taux 0 : jamais shiny
  for (let s = 1; s <= 50; s++) {
    const r = E.rollShiny(E.mulberry32(s), { taux: 0, bonusMin: 0.03, bonusMax: 0.05 });
    assert.equal(r.shiny, false);
    assert.equal(r.bonus, 0);
  }
  // taux 1 : toujours shiny, bonus dans [3 %, 5 %]
  let n = 0;
  for (let s = 1; s <= 200; s++) {
    const r = E.rollShiny(E.mulberry32(s * 31), { taux: 1, bonusMin: 0.03, bonusMax: 0.05 });
    assert.equal(r.shiny, true);
    assert.ok(r.bonus >= 0.03 && r.bonus <= 0.05, `bonus borné : ${r.bonus}`);
    if (r.bonus > 0.03) n++;
  }
  assert.ok(n > 0, 'la variance varie bien dans la borne (pas figée)');
  // taux 1/100 sur 10 000 tirages seedés : compte mesurable, ~1 %, toujours dans la borne
  const rng = E.mulberry32(42);
  let shiny = 0;
  for (let i = 0; i < 10000; i++) {
    const r = E.rollShiny(rng, CFG);
    if (r.shiny) { shiny++; assert.ok(r.bonus >= CFG.bonusMin && r.bonus <= CFG.bonusMax); }
    else assert.equal(r.bonus, 0, 'non shiny = aucun bonus (couplage)');
  }
  assert.ok(shiny > 30 && shiny < 200, `taux mesuré ~1/100 : ${shiny}/10000`);
  // déterminisme : même seed, même tirage
  const a = E.rollShiny(E.mulberry32(7), CFG);
  const b = E.rollShiny(E.mulberry32(7), CFG);
  assert.deepEqual(a, b);
});

test('lot 8 : applyShinyStats — +bonus % sur les 5 stats de base, bonus 0 = identité', () => {
  const card = E.getCard('n1');
  const boosted = E.applyShinyStats(card, 0.04);
  assert.ok(Math.abs(boosted.atk - card.atk * 1.04) < 1e-9);
  assert.ok(Math.abs(boosted.hp - card.hp * 1.04) < 1e-9);
  for (const k of ['def', 'agi', 'int']) {
    if (Number.isFinite(card[k])) assert.ok(Math.abs(boosted[k] - card[k] * 1.04) < 1e-9, k);
  }
  assert.equal(E.applyShinyStats(card, 0), card, 'bonus nul = même référence (pas de copie)');
  assert.equal(card.atk, E.getCard('n1').atk, 'la fiche catalogue n’est jamais mutée');
});

test('lot 8 : makeUnit — l’exemplaire shiny entre en combat avec sa variance (+3-5 % sur les 5 stats)', () => {
  const card = E.getCard('a1');
  const plain = E.makeUnit({ ...card, level: 20 });
  const shiny = E.makeUnit(E.applyShinyStats({ ...card, level: 20, shiny: true }, 0.05), 'x', 20);
  assert.equal(shiny.shiny, true);
  const keys = ['atk', 'hp', 'maxHp', 'def', 'agi', 'int'];
  let strict = 0;
  for (const k of keys) {
    assert.ok(shiny[k] >= plain[k], `${k} jamais réduit : ${plain[k]} -> ${shiny[k]}`);
    assert.ok(shiny[k] <= Math.ceil(plain[k] * 1.06), `${k} borné : ${plain[k]} -> ${shiny[k]}`);
    if (shiny[k] > plain[k]) strict++;
  }
  assert.ok(shiny.hp > plain.hp && shiny.atk > plain.atk, 'PV et ATQ strictement boostés');
  assert.ok(strict >= 3, `${strict}/6 stats strictement boostées (l’arrondi masque le reste aux petits paliers)`);
  assert.equal(E.makeUnit({ ...card, level: 20 }).shiny, false);
});

test('lot 8 : fusion TRANCHÉE — au moins un parent shiny => enfant shiny, bonus re-tiré dans la borne', () => {
  const cards = data.cards.filter((c) => c.rarity !== 'N' && c.rarity !== 'M');
  const mk = (id, shiny, bonus) => ({ iid: `i-${id}-${shiny}`, id, lvl: 10, xp: 0, acc: [], ...(shiny ? { shiny: true, shinyBonus: bonus } : {}) });
  let fait = 0;
  for (let s = 1; s <= 40; s++) {
    const rng = E.mulberry32(s * 104729);
    const a = cards[s % cards.length];
    const b = cards[(s * 7 + 3) % cards.length];
    if (a.id === b.id) continue;
    const instA = mk(a.id, s % 2 === 0, 0.04);
    const instB = mk(b.id, false);
    const plan = E.fusionPreview(instA, instB, rng);
    if (!plan.ok) continue;
    assert.equal(plan.shinyHerite, s % 2 === 0, 'aperçu annonce l’héritage shiny');
    const res = E.doFusion([instA, instB], instA.iid, instB.iid, [], plan, { rng: E.mulberry32(s) });
    assert.ok(res.ok);
    if (s % 2 === 0) {
      assert.equal(res.enfant.shiny, true, 'un parent shiny -> enfant shiny');
      assert.ok(res.enfant.shinyBonus >= CFG.bonusMin && res.enfant.shinyBonus <= CFG.bonusMax, 'bonus re-tiré dans la borne');
      fait++;
    } else {
      assert.ok(!res.enfant.shiny, 'aucun parent shiny -> enfant normal');
      assert.equal(res.enfant.shinyBonus, undefined);
    }
  }
  assert.ok(fait >= 10, `${fait} fusions shiny testées`);
  // les deux parents shiny => enfant shiny aussi
  const a = cards[5], b = cards[9];
  const iA = mk(a.id, true, 0.05), iB = mk(b.id, true, 0.03);
  const plan = E.fusionPreview(iA, iB, E.mulberry32(1));
  if (plan.ok) {
    const res = E.doFusion([iA, iB], iA.iid, iB.iid, [], plan, { rng: E.mulberry32(2) });
    assert.ok(!res.ok || res.enfant.shiny === true);
  }
});

test('lot 8 : migration v31 -> v32 — chaque exemplaire existant tire sa version (seed en data), non destructif', () => {
  const save = {
    version: 31,
    gold: 500,
    instances: [
      { iid: 1, id: 'n1', lvl: 12, xp: 0, acc: [], isNew: false },
      { iid: 2, id: 'a1', lvl: 10, xp: 0, acc: [], isNew: false },
      { iid: 3, id: 'g9', lvl: 8, xp: 0, acc: [], isNew: false },
    ],
  };
  const out = E.migrate(JSON.parse(JSON.stringify(save)));
  assert.equal(out.version, 33);
  assert.equal(out.gold, 500, 'non destructif');
  for (const inst of out.instances) {
    assert.equal(typeof inst.shiny, 'boolean', 'drapeau posé');
    if (inst.shiny) assert.ok(inst.shinyBonus >= CFG.bonusMin && inst.shinyBonus <= CFG.bonusMax);
    else assert.equal(inst.shinyBonus, 0);
  }
  // déterministe : deux migrations identiques donnent le même résultat
  const out2 = E.migrate(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(out.instances.map((i) => [i.shiny, i.shinyBonus]), out2.instances.map((i) => [i.shiny, i.shinyBonus]));
  // idempotent : une instance déjà shinée n'est pas re-tirée
  const deja = E.migrate({ version: 32, instances: [{ iid: 1, id: 'n1', lvl: 1, shiny: true, shinyBonus: 0.05 }] });
  assert.equal(deja.instances[0].shinyBonus, 0.05, 'shiny existant conservé tel quel');
  // la chaîne v30 -> v33 passe par v31 (éclats -> or), v32 (tirage shiny), v33 (tirage Exception)
  const old = E.migrate({ version: 30, instances: [{ iid: 1, id: 'n1', lvl: 5 }], gold: 10, items: { 'eclat-regression': 2 } });
  assert.equal(old.version, 33);
  assert.equal(old.gold, 10 + 2 * data.engine.FUSION.eclatRegressionOr);
  assert.equal(typeof old.instances[0].shiny, 'boolean');
});

test('lot 8 : validateur 0 erreur (EXI-DATA-6 SHINY en data)', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});
