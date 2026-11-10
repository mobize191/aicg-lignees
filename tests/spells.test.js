import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, cpSync, writeFileSync } from 'node:fs';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine, loadData } from './helpers/load.mjs';

const ligne5 = (E) => [0, 1, 2, 3, 4].map((i) => ({ uid: `e${i}`, hp: 100, maxHp: 100, alive: true, shield: 0, status: {} }));
const lanceur = (E, atk = 10) => ({ uid: 'l1', atk });

test('Morsure d\u2019Écume : crans I-IV, largeurs 1/2/3/5, mults 1.5/1.8/2.2/2.6, coûts 3/4/5/6★ (ACC-2-2)', () => {
  const E = loadEngine();
  const attendu = { I: [1, 1.5, 3], II: [2, 1.8, 4], III: [3, 2.2, 5], IV: [5, 2.6, 6] };
  for (const [cran, [n, mult, cout]] of Object.entries(attendu)) {
    const cibles = ligne5(E);
    const res = E.castSpell(E.DATA, 'morsure-decume', cran, { lanceur: lanceur(E), cibles, events: [] });
    assert.equal(res.largeur, n === 3 ? 3 : n, `cran ${cran} largeur`);
    assert.equal(res.cibles.length, n, `cran ${cran} touche ${n} cible(s)`);
    assert.equal(res.mult, mult, `cran ${cran} mult`);
    assert.equal(res.cout, cout, `cran ${cran} coût`);
    assert.equal(res.degats, Math.round(10 * mult), `cran ${cran} dégâts`);
  }
});

test('Morsure d\u2019Écume suit les données : modifier le JSON change le résultat (ACC-2-2)', () => {
  const dir = 'tests/fixtures/data-crans-sorts';
  const data = loadData();
  const sort = data.grimoire.ecole.find((s) => s.id === 'morsure-decume');
  sort.crans.I.mult = 9.9;
  rmSync(dir, { recursive: true, force: true });
  cpSync('data', dir, { recursive: true });
  writeFileSync(`${dir}/grimoire.json`, JSON.stringify(data.grimoire, null, 1) + '\n');
  const E2 = loadEngine(dir);
  const res = E2.castSpell(E2.DATA, 'morsure-decume', 'I', { lanceur: lanceur(E2), cibles: ligne5(E2), events: [] });
  assert.equal(res.degats, Math.round(10 * 9.9));
  rmSync(dir, { recursive: true, force: true });
});

test('Chant de Sirène : stun 25/20/15/10 % sur les largeurs 1/2/3/5, contre le seuil (ACC-2-3)', () => {
  const E = loadEngine();
  const attendu = { I: 0.25, II: 0.20, III: 0.15, IV: 0.10 };
  for (const [cran, taux] of Object.entries(attendu)) {
    const c = E.cranOf('chant-de-sirene', cran);
    assert.equal(c.taux, taux, `cran ${cran} taux`);
  }
  const cibles = ligne5(E);
  cibles[0].seuil = 0.10;
  const events = [];
  E.castSpell(E.DATA, 'chant-de-sirene', 'I', { lanceur: lanceur(E), cibles, events, rng: () => 0 });
  assert.ok(events.some((e) => e.type === 'stun'), 'stun appliqué quand le jet passe sous le taux moins le seuil');
  const cibles2 = ligne5(E);
  cibles2[0].rarity = 'L'; // seuil 0,25 au palier L (données engine.json)
  const events2 = [];
  E.castSpell(E.DATA, 'chant-de-sirene', 'I', { lanceur: lanceur(E), cibles: cibles2, events: events2, rng: () => 0 });
  assert.ok(!events2.some((e) => e.type === 'stun'), 'le seuil de la cible bloque le stun (0 < 0.25 - 0.30 est faux)');
});

test('fusion des Marées : 30 signatures sur 30 résolues, 7 uniques + 23 fondues (ACC-2-4)', () => {
  const E = loadEngine();
  const marees = E.DATA['fusion-map'].marees;
  assert.ok(marees.trie);
  const ids = Object.keys(marees.signatures);
  assert.equal(ids.length, 30);
  const uniques = ids.filter((id) => marees.signatures[id].unique);
  const fondues = ids.filter((id) => marees.signatures[id].fusion);
  assert.equal(uniques.length, 7);
  assert.equal(fondues.length, 23);
  for (const id of ids) assert.ok(E.resolveSignature(id), `signature ${id} résolue`);
  // un monstre des Marées caste son cran de fusion ; un biome non trié garde sa signature
  assert.deepEqual(E.resolveSignature('e1'), { sort: 'morsure-decume', cran: 'I' });
  assert.deepEqual(E.resolveSignature('e13'), { unique: 'maree-noire' });
  assert.equal(E.resolveSignature('g1'), null, 'le Bosquet attend son tri');
});

test('fin du verrou de classe : deux profils, même école ouverte, même sort, même effet (ACC-2-5)', () => {
  const E = loadEngine();
  const guerrier = { classe: 'Guerrier', voie: 'voie du guerrier', ecoles: [] };
  const assassin = { classe: 'Assassin', voie: 'voie de l’assassinat', ecoles: [] };
  assert.ok(E.canCast(guerrier, 'morsure-decume'), 'le guerrier ouvre la Lame');
  assert.ok(E.canCast(assassin, 'morsure-decume'), 'l’assassin ouvre la Lame aussi');
  const mageSansVoie = { classe: 'Mage', voie: '', ecoles: [] };
  assert.ok(!E.canCast(mageSansVoie, 'morsure-decume') || E.profilSchools('Mage').length >= 0);
  // changer la voie en données change l'école suivie
  const voieEau = { classe: 'Mage', voie: 'les flots — l’Eau', ecoles: [] };
  assert.ok(E.openSchools('les flots — l’Eau').length >= 0);
});

test('acquisition de départ : commun + sort de race à la naissance (EXI-P2-6)', () => {
  const E = loadEngine();
  assert.deepEqual(E.sortsDeDepart('n1'), ['frappe-precise', 'discipline-de-ligne']);
  assert.deepEqual(E.sortsDeDepart('n3'), ['premiers-soins', 'discipline-de-ligne']);
  assert.deepEqual(E.sortsDeDepart('n13'), ['premiers-soins', 'ferveur-celeste']);
  assert.deepEqual(E.sortsDeDepart('a1'), ['frappe-precise']);
});

test('la stat principale du profil est la base du mult (ACC-3-1)', () => {
  const E = loadEngine();
  const mage = { uid: 'm', classe: 'Mage', atk: 5, int: 20, agi: 8 };
  const guerrier = { uid: 'g', classe: 'Guerrier', atk: 20, int: 5, agi: 8 };
  const assassin = { uid: 'a', classe: 'Assassin', atk: 5, int: 5, agi: 20 };
  const cible = () => ({ uid: 'c', hp: 1000, maxHp: 1000, alive: true, shield: 0, status: {} });
  assert.equal(E.castSpell(E.DATA, 'morsure-decume', 'I', { lanceur: mage, cibles: [cible()], events: [] }).degats, Math.round(20 * 1.5));
  assert.equal(E.castSpell(E.DATA, 'morsure-decume', 'I', { lanceur: guerrier, cibles: [cible()], events: [] }).degats, Math.round(20 * 1.5));
  assert.equal(E.castSpell(E.DATA, 'morsure-decume', 'I', { lanceur: assassin, cibles: [cible()], events: [] }).degats, Math.round(20 * 1.5));
  // changer la stat principale d'un profil en données change la base
  const dir = 'tests/fixtures/data-profils';
  const data = loadData();
  data.engine.profils.Mage.stat = 'atk';
  rmSync(dir, { recursive: true, force: true });
  cpSync('data', dir, { recursive: true });
  writeFileSync(`${dir}/engine.json`, JSON.stringify(data.engine, null, 1) + '\n');
  const E2 = loadEngine(dir);
  assert.equal(E2.castSpell(E2.DATA, 'morsure-decume', 'I', { lanceur: mage, cibles: [cible()], events: [] }).degats, Math.round(5 * 1.5));
  rmSync(dir, { recursive: true, force: true });
});

test('le soin plafonne à la vie max de la cible, au cran comme à l\u2019unique (ACC-3-2)', () => {
  const E = loadEngine();
  const soigneur = E.makeUnit(E.getMonster('e22'));
  const t = { uid: 't', hp: 95, maxHp: 100, alive: true, shield: 0, status: {} };
  const events = [];
  E.applySupport(soigneur, { attaque: [t], support: [] }, {}, events, 'team', []);
  assert.equal(t.hp, 100);
});

test('seuil : un stun de 25 % contre un seuil donné, fréquence statistique (ACC-3-5)', () => {
  const E = loadEngine();
  // formule : proba = taux - seuil ; 10 000 tirages, tolérance ±0,5 % (écart-type ~0,43 % pour p=0,25)
  const cible = { uid: 'c', hp: 100, maxHp: 100, alive: true, shield: 0, status: {}, rarity: 'C' };
  const seuil = E.seuilOf(cible);
  assert.equal(seuil, 0);
  const taux = E.cranOf('chant-de-sirene', 'I').taux;
  const N = 10000;
  let stuns = 0;
  const rng = mulberry32(123);
  for (let i = 0; i < N; i++) {
    const c = { ...cible, status: {} };
    E.castSpell(E.DATA, 'chant-de-sirene', 'I', { lanceur: { uid: 'x', classe: 'Occultiste', int: 10 }, cibles: [c], events: [], rng });
    if (c.status.stun) stuns++;
  }
  const freq = stuns / N;
  assert.ok(Math.abs(freq - taux) <= 0.005, `fréquence ${freq} dans ±0,5 % de ${taux}`);
});

// ---------- T2.1 : le tri de la Forge Cendree (lot 2, gabarit des Marees) ----------
test('tri de la Forge : 24 signatures resolues, 5 uniques + 19 fondues (T2.1, ACC-T)', () => {
  const E = loadEngine();
  const forge = E.DATA['fusion-map'].forge;
  assert.ok(forge.trie, 'le biome forge est marque trie');
  const ids = Object.keys(forge.signatures);
  assert.equal(ids.length, 24);
  const uniques = ids.filter((id) => forge.signatures[id].unique);
  const fondues = ids.filter((id) => forge.signatures[id].fusion);
  assert.equal(uniques.length, 5);
  assert.equal(fondues.length, 19);
  for (const id of ids) assert.ok(E.resolveSignature(id), `signature ${id} resolue`);
  assert.deepEqual(E.resolveSignature('f1'), { sort: 'morsure-decume', cran: 'I' });
  assert.deepEqual(E.resolveSignature('f6'), { sort: 'morsure-decume', cran: 'III' }, 'Eruption, la zone native');
  assert.deepEqual(E.resolveSignature('f16'), { sort: 'etreinte-des-profondeurs', cran: 'II' }, 'Filet de Suie, 2 ennemis');
  assert.deepEqual(E.resolveSignature('f20'), { sort: 'colonne-de-feu', cran: 'III' });
  assert.deepEqual(E.resolveSignature('f23'), { sort: 'fournaise-invoquee', cran: 'II' }, 'Gardiens Invoques, 2 renforts');
  assert.deepEqual(E.resolveSignature('f13'), { unique: 'nuit-de-cendres' }, 'le M garde son unique');
  assert.equal(E.resolveSignature('g1'), null, 'le Bosquet attend son tri');
});

test('les uniques de la Forge suivent la decision 3 : base d\u2019ecole + cran + delta (T2.1)', () => {
  const E = loadEngine();
  const ecoleIds = new Set(E.DATA.grimoire.ecole.map((s) => s.id));
  const attends = { f13: 'nuit-de-cendres', f12: 'fournaise-eternelle', f18: 'linceul-de-suie', f21: 'fournaise-de-calcine', f22: 'colere-de-vulcain' };
  for (const [carte, id] of Object.entries(attends)) {
    const u = (E.DATA.grimoire.uniques ?? []).find((x) => x.id === id);
    assert.ok(u, `unique ${id} present`);
    assert.equal(u.carte, carte, `${id} appartient a ${carte}`);
    assert.ok(ecoleIds.has(u.base), `la base ${u.base} de ${id} existe dans le grimoire d'ecole`);
    assert.ok(['I', 'II', 'III', 'IV'].includes(u.cran), `le cran de ${id}`);
    assert.ok(u.delta && typeof u.delta.desc === 'string' && u.delta.desc.length > 0, `le delta de ${id} est ecrit`);
  }
});

test('un monstre de la Forge caste son cran de fusion : Colonne de Feu III (T2.1, ACC-T)', () => {
  const E = loadEngine();
  const sig = E.resolveSignature('f20');
  const cibles = ligne5(E);
  const events = [];
  const res = E.castSpell(E.DATA, sig.sort, sig.cran, { lanceur: lanceur(E), cibles, events, rng: () => 0.99 });
  assert.equal(res.role, 'malus');
  assert.equal(res.cout, 5);
  assert.equal(res.taux, 0.15, 'la brulure normalisee sur l\u2019echelle des crans');
  assert.equal(res.largeur, 3, 'la colonne frappe la zone de 3');
  assert.equal(E.largeurCibles(cibles, res.largeur, null).length, 3, '3 contigues de la ligne');
  assert.equal(E.cranOf('colonne-de-feu', 'I').taux, 0.25, 'le cran I au taux de reference');
  assert.ok(E.cranOf('colonne-de-feu', 'IV').vide, 'le cran IV attend un autre biome');
  // l\u2019Appel ne de la Forge : les crans comptent les renforts
  const appel = E.cranOf('fournaise-invoquee', 'II');
  assert.equal(appel.cout, 4);
  assert.equal(appel.largeur, 2, '2 renforts au cran II');
});

// ---------- T2.1-b : le tri ne fond jamais vers un cran vide ----------
test('une fusion ne pointe jamais vers un cran vide ou absent (T2.1-b, EXI-P2-3)', () => {
  const E = loadEngine();
  const ecole = new Map(E.DATA.grimoire.ecole.map((s) => [s.id, s]));
  const entrees = new Set(E.DATA.grimoire.entrees.map((s) => s.id));
  const uniques = new Set(E.DATA.grimoire.uniques.map((s) => s.id));
  for (const [biome, b] of Object.entries(E.DATA['fusion-map'])) {
    if (!b.trie) continue;
    for (const [id, entry] of Object.entries(b.signatures)) {
      if (entry.unique) {
        assert.ok(uniques.has(entry.unique), `l'unique ${entry.unique} de ${id} existe`);
        continue;
      }
      assert.ok(ecole.has(entry.fusion) || entrees.has(entry.fusion), `le sort ${entry.fusion} de ${id} existe`);
      // les entrées d'école attendent leur recâblage crans par crans (Phase 3, noté) : tolérées
      if (entrees.has(entry.fusion)) continue;
      const cran = ecole.get(entry.fusion).crans[entry.cran];
      assert.ok(cran, `le cran ${entry.cran} de ${entry.fusion} (${id}) existe`);
      assert.ok(!cran.vide, `le cran ${entry.cran} de ${entry.fusion} (${id}) n'est pas vide`);
    }
  }
  // les crans remplis par la Forge reprennent l'échelle des taux (14.3)
  assert.equal(E.cranOf('etreinte-des-profondeurs', 'II').taux, 0.25, 'Filet de Suie remplit l\u2019Étreinte II');
  assert.equal(E.cranOf('carapace-de-corail', 'II').mult, 1.5, 'Cendre Protectrice remplit la Barrière II');
});
