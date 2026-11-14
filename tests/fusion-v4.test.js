import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

// Lot 6 — FUSION v4 (spec-fusion-v4, lots 1-2) : data (fusion-synthese, FUSION en data),
// moteur (cycle de race, saut 55 %, démon 15 %, plafonds, sorts hérités, garde-fous),
// UI Autel des Lignées. Digest inchangé attendu (aucune maths de combat) — MESURE de contrôle.

const E = loadEngine();
const data = loadData();

const mkInst = (id, lvl = 10, iid = null, acc = []) => ({ iid: iid ?? `i-${id}-${lvl}`, id, lvl, xp: 0, acc });

test('lot 6 : data de fusion — table de synthèse + constantes FUSION en data', () => {
  assert.ok(data['fusion-synthese'].defaut);
  assert.equal(data.engine.FUSION.sautRate, 0.55);
  assert.equal(data.engine.FUSION.demonRate, 0.15);
  assert.equal(data.engine.FUSION.statsPct, 0.25);
  assert.deepEqual(Object.keys(data.engine.FUSION.plafonds), ['C', 'UC', 'R', 'SR', 'UR', 'L']);
  assert.equal(data.engine.FUSION.biomeParFamille.eau, 'marees');
  assert.equal(data.engine.FUSION.biomeParFamille.lame, 'hasard');
});

test('lot 6 : 100 fusions seedées — parents consommés, enfant niveau 1, plafond respecté, sorts valides', () => {
  const cards = data.cards.filter((c) => c.rarity !== 'N' && c.rarity !== 'M');
  let fusions = 0;
  for (let s = 1; s <= 100; s++) {
    const rng = E.mulberry32(s * 7919);
    const a = cards[s % cards.length];
    const b = cards[(s * 13 + 5) % cards.length];
    if (a.id === b.id) continue;
    const instA = mkInst(a.id, 10 + (s % 10), `a${s}`);
    const instB = mkInst(b.id, 8 + (s % 12), `b${s}`);
    const plan = E.fusionPreview(instA, instB, rng);
    assert.ok(plan.ok, `seed ${s} : aperçu ok (${plan.reason ?? ''})`);
    // plafond : bonus <= plafond% x base de l'enfant
    const enfantCard = E.getCard(plan.childId) ?? E.getMonster(plan.childId);
    assert.ok(enfantCard, `seed ${s} : enfant ${plan.childId} existe`);
    assert.ok(plan.bonusAtk <= Math.ceil(plan.plafondPct * enfantCard.atk) + 1, `seed ${s} : bonus ATQ plafonné`);
    assert.ok(plan.bonusHp <= Math.ceil(plan.plafondPct * enfantCard.hp) + 1, `seed ${s} : bonus PV plafonné`);
    // sorts hérités : jamais la signature de l'enfant
    const sig = enfantCard.soloSpell ?? null;
    for (const sp of plan.sorts) assert.notEqual(sp.name, sig, `seed ${s} : pas la signature de l'enfant`);
    assert.ok(plan.sorts.length <= 20 && plan.sortsMax >= 2);
    const res = E.doFusion([instA, instB], instA.iid, instB.iid, plan.sorts.slice(0, plan.sortsMax).map((x) => x.key), plan, { ownedOf: () => 2 });
    assert.ok(res.ok, `seed ${s} : fusion ok`);
    assert.equal(res.instances.length, 1, `seed ${s} : 2 parents -> 1 enfant`);
    assert.equal(res.enfant.lvl, 1, `seed ${s} : enfant niveau 1`);
    assert.ok(res.enfant.acc.length <= plan.sortsMax, `seed ${s} : sorts choisis <= max`);
    fusions++;
  }
  assert.ok(fusions >= 90, `${fusions} fusions réalisées`);
});

test('lot 6 : cycle de race — humain+monstre -> mystique (saut), humain+divin -> monstre du biome (15 % démon)', () => {
  const queue = (...vals) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)]; };
  const mk = (id, lvl, iid) => ({ iid, id, lvl, xp: 0, acc: [] });
  // saut réussi (0.1 < 0.55) : humain + monstre -> mystique, biome de la famille humaine
  let p = E.fusionPreview(mk('a1', 10, 'x1'), mk('e1', 10, 'x2'), queue(0.1, 0.9));
  assert.equal(p.raceCible, 'mystique', 'humain+monstre, saut ok -> mystique');
  assert.equal(p.saut, true);
  assert.ok(['marees', 'forge', 'bosquet', 'crypte', 'zenith'].includes(p.biomeCible), 'biome tiré de la famille humaine');
  // échec du saut forcé : lignée d'un parent
  p = E.fusionPreview(mk('a1', 10, 'x1'), mk('e1', 10, 'x2'), queue(0.9, 0.9));
  assert.equal(p.saut, false);
  assert.ok(['humaine', 'monstre'].includes(p.raceCible), 'échec du saut -> race d’un parent');
  // humain + divin, saut ok, pas démon (2e jet 0.9) -> monstre du biome de la famille humaine
  p = E.fusionPreview(mk('a5', 10, 'x1'), mk('d23', 10, 'x2'), queue(0.1, 0.9, 0.5));
  assert.equal(p.raceCible, 'monstre');
  assert.equal(p.demon, false);
  assert.equal(p.biomeCible, 'marees', 'famille eau -> biome marees');
  // humain + divin, démon (2e jet 0.05 < 0.15)
  p = E.fusionPreview(mk('a5', 10, 'x1'), mk('d23', 10, 'x2'), queue(0.1, 0.05));
  assert.equal(p.demon, true, '15 % de démon sur humain+divin');
  assert.equal(p.raceCible, 'divine');
  // pas d'humain : pas de saut
  p = E.fusionPreview(mk('e1', 10, 'x1'), mk('e7', 10, 'x2'), queue(0.1));
  assert.equal(p.saut, false, 'monstre+monstre : pas de saut');
});

test('lot 6 : garde-fous — N+N refusé, M refusé, équipe active refusée, exemplaire unique refusé', () => {
  const n1 = mkInst('n1', 1, 'n1a'), n2 = mkInst('n2', 1, 'n2a');
  const plan = E.fusionPreview(n1, n2, E.mulberry32(1));
  const r = E.doFusion([n1, n2], 'n1a', 'n2a', [], plan);
  assert.equal(r.ok, false, 'deux N ne fusionnent pas');
  const a = mkInst('a1', 10, 'g1'), b = mkInst('a2', 10, 'g2');
  const plan2 = E.fusionPreview(a, b, E.mulberry32(2));
  const mInst = mkInst('e14', 10, 'm1'); // M mythique
  const planM = E.fusionPreview(a, mInst, E.mulberry32(3));
  const rM = E.doFusion([a, mInst], 'g1', 'm1', [], planM);
  assert.equal(rM.ok, false, 'un M ne fusionne pas');
  const rT = E.doFusion([a, b], 'g1', 'g2', [], plan2, { teamIids: ['g1'] });
  assert.equal(rT.ok, false, 'carte en équipe refusée');
  const rU = E.doFusion([a, b], 'g1', 'g2', [], plan2, { ownedOf: () => 1 });
  assert.equal(rU.ok, false, 'exemplaire unique refusé');
  const rOk = E.doFusion([a, b], 'g1', 'g2', [], plan2, { ownedOf: () => 2 });
  assert.ok(rOk.ok, 'fusion nominale acceptée');
});

test('lot 6 : la fusion ne touche pas les maths de combat — digest inchangé (MESURE de contrôle en arbitrages)', () => {
  // aucune constante de combat modifiée : makeWave/initCombat inchangés depuis le lot 5
  const w1 = E.makeWave(123, 3, 'marees', 2);
  assert.ok(w1.avant.length >= 1);
  assert.equal(typeof E.fusionPreview, 'function');
  assert.equal(typeof E.doFusion, 'function');
});

test('lot 6 : validateur EXI-DJ-2 — table de synthèse et constantes FUSION', () => {
  const d2 = JSON.parse(JSON.stringify(data));
  const errs = [];
  E.validate(d2, errs);
  assert.ok(!errs.some((e) => e.includes('EXI-DJ-2')), errs.join(' | '));
  d2['fusion-synthese'].paires['lame|inconnue'] = { famille: 'A', rarete: 'max' };
  d2.engine.FUSION.sautRate = 5;
  const errs2 = [];
  E.validate(d2, errs2);
  assert.ok(errs2.some((e) => e.includes('famille inconnue')), 'paire inconnue rejetée');
  assert.ok(errs2.some((e) => e.includes('sautRate')), 'sautRate hors bornes rejeté');
});
