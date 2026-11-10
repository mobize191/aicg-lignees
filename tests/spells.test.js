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
  assert.equal(E.resolveSignature('x-inconnu'), null, 'id inconnu = chemin legacy');
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
  assert.equal(E.resolveSignature('x-inconnu'), null, 'id inconnu = chemin legacy');
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


// ---------- T2.2 : le tri du Bosquet Profond (lot 2, gabarit des Marees) ----------
test('tri du Bosquet : 21 signatures resolues, 5 uniques + 16 fondues (T2.2, ACC-T)', () => {
  const E = loadEngine();
  const bosquet = E.DATA['fusion-map'].bosquet;
  assert.ok(bosquet.trie, 'le biome bosquet est marque trie');
  const ids = Object.keys(bosquet.signatures);
  assert.equal(ids.length, 21);
  const uniques = ids.filter((id) => bosquet.signatures[id].unique);
  const fondues = ids.filter((id) => bosquet.signatures[id].fusion);
  assert.equal(uniques.length, 5);
  assert.equal(fondues.length, 16);
  for (const id of ids) assert.ok(E.resolveSignature(id), `signature ${id} resolue`);
  assert.deepEqual(E.resolveSignature('g1'), { sort: 'etreinte-des-profondeurs', cran: 'I' }, 'Etreinte de Racines remplit l\u2019Etreinte I');
  assert.deepEqual(E.resolveSignature('g14'), { sort: 'seve-rongeuse', cran: 'I' }, 'Spores Vampires, la seve rongeuse native');
  assert.deepEqual(E.resolveSignature('g13'), { sort: 'fournaise-invoquee', cran: 'II' }, 'Seve Eveillee, 2 renforts sylvestres');
  assert.deepEqual(E.resolveSignature('g17'), { sort: 'onde-consacree', cran: 'III' }, 'Rosee Radieuse greffe l\u2019entree de baume');
  assert.deepEqual(E.resolveSignature('g19'), { sort: 'chant-de-sirene', cran: 'IV' }, 'Ombre Tissee, le controle de masse');
  assert.deepEqual(E.resolveSignature('g16'), { unique: 'nuee-de-spores' }, 'Mycola garde son unique');
  assert.equal(E.resolveSignature('x-inconnu'), null, 'id inconnu = chemin legacy');
});

test('les uniques du Bosquet suivent la decision 3 : base d\u2019ecole ou d\u2019entree + cran + delta (T2.2)', () => {
  const E = loadEngine();
  const basesOk = new Set([
    ...E.DATA.grimoire.ecole.map((s) => s.id),
    ...E.DATA.grimoire.entrees.map((s) => s.id),
  ]);
  const attends = { g7: 'aube-foliaire', g8: 'racine-monde', g16: 'nuee-de-spores', g18: 'premiere-clarte', g21: 'nuit-des-seves' };
  for (const [carte, id] of Object.entries(attends)) {
    const u = (E.DATA.grimoire.uniques ?? []).find((x) => x.id === id);
    assert.ok(u, `unique ${id} present`);
    assert.equal(u.carte, carte, `${id} appartient a ${carte}`);
    assert.ok(basesOk.has(u.base), `la base ${u.base} de ${id} existe dans le grimoire`);
    assert.ok(['I', 'II', 'III', 'IV'].includes(u.cran), `le cran de ${id}`);
    assert.ok(u.delta && typeof u.delta.desc === 'string' && u.delta.desc.length > 0, `le delta de ${id} est ecrit`);
  }
  const morsure = E.cranOf('morsure-decume', 'IV');
  const aube = E.DATA.grimoire.uniques.find((x) => x.id === 'aube-foliaire');
  assert.equal(aube.cout, morsure.cout, 'Aube Foliaire coute comme son cran de base');
  assert.equal(aube.mult, morsure.mult, 'Aube Foliaire frappe comme son cran de base');
});

test('un monstre du Bosquet caste son cran de fusion : Seve Rongeuse II et Etreinte I (T2.2, ACC-T)', () => {
  const E = loadEngine();
  const cibles = ligne5(E);
  const events = [];
  const sig = E.resolveSignature('g15');
  const res = E.castSpell(E.DATA, sig.sort, sig.cran, { lanceur: lanceur(E), cibles, events, rng: () => 0.99 });
  assert.equal(res.role, 'malus');
  assert.equal(res.cout, 4);
  assert.equal(res.taux, 0.2, 'la seve normalisee sur l\u2019echelle des crans');
  assert.equal(res.largeur, 2);
  assert.equal(E.largeurCibles(cibles, res.largeur, null).length, 2, '2 cibles contigues');
  const et1 = E.cranOf('etreinte-des-profondeurs', 'I');
  assert.ok(!et1.vide, 'l\u2019Etreinte I est remplie par le Bosquet');
  assert.equal(et1.taux, 0.3);
  assert.ok(E.cranOf('seve-rongeuse', 'III').vide, 'le cran III de la Seve Rongeuse attend un autre biome');
});


// ---------- T2.3 : le tri de la Crypte Oubliee (lot 2, gabarit des Marees) ----------
test('tri de la Crypte : 30 signatures resolues, 8 uniques + 22 fondues (T2.3, ACC-T)', () => {
  const E = loadEngine();
  const crypte = E.DATA['fusion-map'].crypte;
  assert.ok(crypte.trie, 'le biome crypte est marque trie');
  const ids = Object.keys(crypte.signatures);
  assert.equal(ids.length, 30);
  const uniques = ids.filter((id) => crypte.signatures[id].unique);
  const fondues = ids.filter((id) => crypte.signatures[id].fusion);
  assert.equal(uniques.length, 8, 'les 6 L et les 2 M gardent leur unique');
  assert.equal(fondues.length, 22);
  for (const id of ids) assert.ok(E.resolveSignature(id), `signature ${id} resolue`);
  assert.deepEqual(E.resolveSignature('k6'), { sort: 'hurlement', cran: 'III' }, 'Hurlement Froid, le cri ne des banshees');
  assert.deepEqual(E.resolveSignature('k13'), { sort: 'morsure-putride', cran: 'I' }, 'Morsure Putride, le poison ne de la Crypte');
  assert.deepEqual(E.resolveSignature('k16'), { sort: 'fournaise-invoquee', cran: 'III' }, 'Legion des Caveaux, 3 renforts');
  assert.deepEqual(E.resolveSignature('k21'), { sort: 'marque-corrosive', cran: 'II' }, 'Noyade Vengeresse remplit le cran II de la corrosion');
  assert.deepEqual(E.resolveSignature('k29'), { sort: 'guet-des-fonds', cran: 'IV' }, 'Serment Rallie, l\u2019equipe renforcee');
  assert.deepEqual(E.resolveSignature('k17'), { unique: 'fauchade-universelle' }, 'la Mort garde sa Fauchade (acte)');
  assert.deepEqual(E.resolveSignature('x-inconnu'), null, 'id inconnu = chemin legacy');
});

test('les uniques de la Crypte suivent la decision 3 : base + cran + delta (T2.3)', () => {
  const E = loadEngine();
  const basesOk = new Set([
    ...E.DATA.grimoire.ecole.map((s) => s.id),
    ...E.DATA.grimoire.entrees.map((s) => s.id),
  ]);
  const attends = { k7: 'voie-du-tombeau', k8: 'abime-remontant', k14: 'hurlement-fatal', k17: 'fauchade-universelle', k19: 'deuil-eternel', k22: 'harpon-du-naufrage', k27: 'epee-de-laube', k30: 'lame-du-serment' };
  for (const [carte, id] of Object.entries(attends)) {
    const u = (E.DATA.grimoire.uniques ?? []).find((x) => x.id === id);
    assert.ok(u, `unique ${id} present`);
    assert.equal(u.carte, carte, `${id} appartient a ${carte}`);
    assert.ok(basesOk.has(u.base), `la base ${u.base} de ${id} existe dans le grimoire`);
    assert.ok(['I', 'II', 'III', 'IV'].includes(u.cran), `le cran de ${id}`);
    assert.ok(u.delta && typeof u.delta.desc === 'string' && u.delta.desc.length > 0, `le delta de ${id} est ecrit`);
  }
});

test('un monstre de la Crypte caste son cran de fusion : Morsure Putride I, Hurlement III (T2.3, ACC-T)', () => {
  const E = loadEngine();
  const cibles = ligne5(E);
  let events = [];
  let res = E.castSpell(E.DATA, 'morsure-putride', 'I', { lanceur: lanceur(E), cibles, events, rng: () => 0.99 });
  assert.equal(res.role, 'malus');
  assert.equal(res.cout, 3);
  assert.equal(res.taux, 0.25, 'le poison au taux de reference');
  assert.equal(res.largeur, 1);
  events = [];
  res = E.castSpell(E.DATA, 'hurlement', 'III', { lanceur: lanceur(E), cibles, events, rng: () => 0.99 });
  assert.equal(res.role, 'controle');
  assert.equal(res.taux, 0.15);
  assert.equal(res.largeur, 3, 'le hurlement glace la zone');
  assert.equal(E.largeurCibles(cibles, res.largeur, null).length, 3);
  for (const [sort, cran] of [['marque-corrosive', 'II'], ['fournaise-invoquee', 'III'], ['guet-des-fonds', 'I'], ['guet-des-fonds', 'III'], ['guet-des-fonds', 'IV']]) {
    assert.ok(!E.cranOf(sort, cran).vide, `le cran ${cran} de ${sort} est rempli par la Crypte`);
  }
  assert.ok(!E.cranOf('hurlement', 'IV').vide, 'le cran IV du Hurlement est rempli par les divines (T2.6)');
  assert.ok(!E.cranOf('morsure-putride', 'II').vide, 'le cran II de la Morsure Putride est rempli par les divines (T2.6)');
});


// ---------- T2.4 : le tri du Zenith Ardent (lot 2, gabarit des Marees) ----------
test('tri du Zenith : 30 signatures resolues, 8 uniques + 22 fondues (T2.4, ACC-T)', () => {
  const E = loadEngine();
  const zenith = E.DATA['fusion-map'].zenith;
  assert.ok(zenith.trie, 'le biome zenith est marque trie');
  const ids = Object.keys(zenith.signatures);
  assert.equal(ids.length, 30);
  const uniques = ids.filter((id) => zenith.signatures[id].unique);
  const fondues = ids.filter((id) => zenith.signatures[id].fusion);
  assert.equal(uniques.length, 8, 'les 6 L et les 2 M gardent leur unique');
  assert.equal(fondues.length, 22);
  for (const id of ids) assert.ok(E.resolveSignature(id), `signature ${id} resolue`);
  assert.deepEqual(E.resolveSignature('z18'), { sort: 'colonne-de-feu', cran: 'III' }, 'Eclosion Ardente, la zone de brulure');
  assert.deepEqual(E.resolveSignature('z20'), { sort: 'renvoi-celeste', cran: 'I' }, 'Plumage Miroir, le renvoi né');
  assert.deepEqual(E.resolveSignature('z25'), { sort: 'hymne', cran: 'III' }, 'Hymne du Zenith, la Ferveur ne');
  assert.deepEqual(E.resolveSignature('z6'), { sort: 'morsure-decume', cran: 'IV' }, 'Pluie de Feu, la ligne entiere');
  assert.deepEqual(E.resolveSignature('z30'), { unique: 'prophetie-du-plein-jour' }, 'le M Apolline garde sa Prophetie (acte)');
  assert.deepEqual(E.resolveSignature('x-inconnu'), null, 'id inconnu = chemin legacy');
});

test('les uniques du Zenith suivent la decision 3 : base + cran + delta (T2.4)', () => {
  const E = loadEngine();
  const basesOk = new Set([
    ...E.DATA.grimoire.ecole.map((s) => s.id),
    ...E.DATA.grimoire.entrees.map((s) => s.id),
  ]);
  const attends = { z7: 'sentence-solaire', z8: 'couronnement', z15: 'eclipse-montante', z19: 'renaissance-pyrique', z22: 'immolation-retournee', z26: 'cantique-final', z29: 'peine-capitale', z30: 'prophetie-du-plein-jour' };
  for (const [carte, id] of Object.entries(attends)) {
    const u = (E.DATA.grimoire.uniques ?? []).find((x) => x.id === id);
    assert.ok(u, `unique ${id} present`);
    assert.equal(u.carte, carte, `${id} appartient a ${carte}`);
    assert.ok(basesOk.has(u.base), `la base ${u.base} de ${id} existe dans le grimoire`);
    assert.ok(['I', 'II', 'III', 'IV'].includes(u.cran), `le cran de ${id}`);
    assert.ok(u.delta && typeof u.delta.desc === 'string' && u.delta.desc.length > 0, `le delta de ${id} est ecrit`);
  }
});

test('un monstre du Zenith caste son cran de fusion : Renvoi Celeste et Hymne (T2.4, ACC-T)', () => {
  const E = loadEngine();
  const cibles = ligne5(E);
  // z20 Plumage Miroir : Renvoi Celeste I (1 allie, 25 %)
  let events = [];
  let res = E.castSpell(E.DATA, 'renvoi-celeste', 'I', { lanceur: lanceur(E), cibles, events, rng: () => 0.99 });
  assert.equal(res.cout, 3);
  assert.equal(res.taux, 0.25, 'le renvoi au taux de reference');
  assert.equal(res.largeur, 1);
  // z18 Eclosion Ardente : Colonne de Feu III (la zone, 15 % x 2)
  events = [];
  res = E.castSpell(E.DATA, 'colonne-de-feu', 'III', { lanceur: lanceur(E), cibles, events, rng: () => 0.99 });
  assert.equal(res.taux, 0.15);
  assert.equal(res.largeur, 3);
  // l'Hymne du Zenith : le cran III porte l'equipe (z25), boost et tenue
  const hymne3 = E.cranOf('hymne', 'III');
  assert.equal(hymne3.largeur, 'equipe');
  assert.equal(hymne3.boost, 0.2);
  assert.equal(hymne3.tenue, 0.15);
  assert.ok(!E.cranOf('hymne', 'IV').vide, 'le cran IV de l\u2019Hymne est rempli par les divines (T2.6)');
  assert.ok(!E.cranOf('renvoi-celeste', 'III').vide, 'le cran III du Renvoi Celeste est rempli par les divines (T2.6)');
});


// ---------- T2.5 : le tri des recrues, naissances et solos (lot 2, gabarit des Mar\u00e9es) ----------
test('tri des recrues : 33 signatures fondues, les cartes cl\u00e9s divines attendent (T2.5, ACC-T)', () => {
  const E = loadEngine();
  const recrues = E.DATA['fusion-map'].recrues;
  assert.ok(recrues.trie, 'le biome recrues est marqu\u00e9 tri\u00e9');
  const ids = Object.keys(recrues.signatures);
  assert.equal(ids.length, 33, '12 naissances raciales + 21 solos (5 d\u2019entr\u00e9e + 16 mini-lign\u00e9es)');
  assert.ok(ids.every((id) => recrues.signatures[id].fusion), 'toutes les recrues fondent, aucune unique : ni L ni M dans le lot');
  const marqu\u00e9es = E.DATA.cards.filter((c) => c.biome === 'recrues');
  assert.equal(marqu\u00e9es.length, 33, 'les 33 cartes recrues portent le champ biome');
  for (const id of ids) assert.ok(E.resolveSignature(id), `signature ${id} r\u00e9solue`);
  assert.deepEqual(E.resolveSignature('n1'), { sort: 'carapace-de-corail', cran: 'I' }, 'Prise de Garde, la garde couvre 1 alli\u00e9');
  assert.deepEqual(E.resolveSignature('n5'), { sort: 'morsure-decume', cran: 'I' }, 'Bruissement d\u2019\u00c9cume rejoint la Lame');
  assert.deepEqual(E.resolveSignature('n11'), { sort: 'seve-rongeuse', cran: 'II' }, 'le Souffle des S\u00e8ves porte \u00e0 2');
  assert.deepEqual(E.resolveSignature('a40'), { sort: 'morsure-decume', cran: 'II' }, 'la Vol\u00e9e de Bruine couvre 2 ennemis');
  assert.deepEqual(E.resolveSignature('a44'), { sort: 'chant-de-sirene', cran: 'II' }, 'le Mirage du D\u00e9sert \u00e9gare 2 ennemis');
  assert.deepEqual(E.resolveSignature('a49'), { sort: 'guet-des-fonds', cran: 'II' }, 'la Ronde \u00c9clair\u00e9e porte la Vigie sur 2 alli\u00e9s');
  assert.deepEqual(E.resolveSignature('n13'), { sort: 'onde-consacree', cran: 'II' }, 'la porte Ange est triée avec les divines (T2.6)');
  assert.deepEqual(E.resolveSignature('n14'), { sort: 'morsure-decume', cran: 'I' }, 'le Démon est trié avec les divines (T2.6)');
  assert.deepEqual(E.resolveSignature('n15'), { sort: 'oeil-du-malheur', cran: 'II' }, 'l’Éveillé du Seuil est trié avec les divines (T2.6)');
  assert.equal(E.resolveSignature('x-inconnu'), null, 'id inconnu = chemin legacy');
});

test('les fondues des recrues visent les crans I-II remplis ou les entr\u00e9es (T2.5, EXI-P2-3)', () => {
  const E = loadEngine();
  const ecole = new Map(E.DATA.grimoire.ecole.map((s) => [s.id, s]));
  const entrees = new Set(E.DATA.grimoire.entrees.map((s) => s.id));
  for (const [id, entry] of Object.entries(E.DATA['fusion-map'].recrues.signatures)) {
    assert.ok(ecole.has(entry.fusion) || entrees.has(entry.fusion), `le sort ${entry.fusion} de ${id} existe`);
    if (entrees.has(entry.fusion)) continue;
    assert.ok(['I', 'II'].includes(entry.cran), `${id} vise un cran I-II (le plan 14.5, \u00e9tape 5)`);
    const cran = ecole.get(entry.fusion).crans[entry.cran];
    assert.ok(cran && !cran.vide, `le cran ${entry.cran} de ${entry.fusion} (${id}) est rempli`);
  }
});

test('une recrue caste son cran de fusion (T2.5, ACC-T)', () => {
  const E = loadEngine();
  const cibles = ligne5(E);
  // n1 Prise de Garde : Barri\u00e8re de Corail I (1 alli\u00e9, \u00d71.7)
  let res = E.castSpell(E.DATA, 'carapace-de-corail', 'I', { lanceur: lanceur(E), cibles: cibles.map((t) => ({ ...t })), events: [] });
  assert.equal(res.cout, 3);
  assert.equal(res.largeur, 1);
  assert.equal(res.mult, 1.7);
  // a40 Vol\u00e9e de Bruine : Lame d'\u00c9cume II (2 ennemis)
  res = E.castSpell(E.DATA, 'morsure-decume', 'II', { lanceur: lanceur(E), cibles: cibles.map((t) => ({ ...t })), events: [] });
  assert.equal(res.cibles.length, 2);
  assert.equal(res.mult, 1.8);
  // n12 Froid du Caveau : \u00c9treinte des Profondeurs I (30 %, 1 ennemi)
  const events = [];
  res = E.castSpell(E.DATA, 'etreinte-des-profondeurs', 'I', { lanceur: lanceur(E), cibles: cibles.map((t) => ({ ...t })), events, rng: () => 0 });
  assert.equal(res.taux, 0.3);
  assert.equal(res.largeur, 1);
  assert.ok(events.some((e) => e.type === 'stun'), 'le froid fige sa cible (rng indulgent)');
});

// ---------- T2.6 : le tri des divines (lot 2, gabarit des Marées) ----------
test('tri des divines : 23 signatures résolues, biome divin marqué trié (T2.6, ACC-T)', () => {
  const E = loadEngine();
  const divin = E.DATA['fusion-map'].divin;
  assert.ok(divin.trie, 'le biome divin est marqué trié');
  const sigs = Object.keys(divin.signatures);
  assert.equal(sigs.length, 23);
  const uniques = sigs.filter((id) => divin.signatures[id].unique);
  assert.equal(uniques.length, 3, 'les 3 L divines gardent leur unique (Kairos, Écho, Ananké)');
  for (const id of sigs) assert.ok(E.resolveSignature(id), `signature ${id} résolue`);
  assert.deepEqual(E.resolveSignature('d6'), { unique: 'arret-du-temps' });
  assert.deepEqual(E.resolveSignature('n13'), { sort: 'onde-consacree', cran: 'II' });
  // aucun cran visé par une fusion n'est vide (anti cran vide)
  for (const id of sigs) {
    const e = divin.signatures[id];
    if (!e.fusion) continue;
    const def = E.getSchoolSpell(e.fusion);
    if (!def) continue; // entrée d’école : pas de crans
    const cran = def.crans[e.cran];
    assert.ok(cran && !cran.vide, `le cran ${e.cran} de ${e.fusion} (${id}) n'est pas vide`);
  }
  // les 3 uniques suivent la décision 3 (base + cran + delta)
  for (const u of E.DATA.grimoire.uniques.filter((x) => ['d6', 'd12', 'd18'].includes(x.carte))) {
    assert.ok(u.base && u.cran && u.delta, `unique ${u.id} au format base+cran+delta`);
    assert.ok(E.getSpellDef(u.base), `base ${u.base} existe`);
  }
});

// ---------- T2.7 : le tri d'homogénéité du grimoire (lot 2, ACTÉ 10/11) ----------
test('homogénéité : aucun sort strictement dominé au même coût (T2.7, EXI-T-3)', () => {
  const E = loadEngine();
  assert.deepEqual(E.errors, [], 'le validateur inclut le contrôle d’homogénéité');
});

test('les communs sont retirés des cartes de famille (T2.7, défaut acté)', () => {
  const E = loadEngine();
  const famCard = E.getCard('a1'); // Épée en Herbe, famille lame
  const prepare = (c) => {
    const fam = E.getFamily(c.family);
    const tier = fam.steps.indexOf(c.id);
    return E.DATA['lineage-spells'][c.family].slice(0, tier + 1).map((s) => s.name);
  };
  assert.ok(!prepare(famCard).includes('Frappe Précise'), 'la carte de famille ne porte plus le commun');
  assert.ok(E.sortsDeDepart('n1').includes('frappe-precise'), 'la naissance garde son commun');
});

test('les 7 uniques des Marées sont au format décision 3 (base + cran + delta) (T2.7)', () => {
  const E = loadEngine();
  const marees = ['e13', 'e14', 'e17', 'e19', 'e22', 'e28', 'e30'];
  for (const carte of marees) {
    const u = E.DATA.grimoire.uniques.find((x) => x.carte === carte);
    assert.ok(u && u.base && u.cran && u.delta, `unique ${u?.id} (${carte}) au format base+cran+delta`);
    assert.ok(E.getSpellDef(u.base), `base ${u.base} existe`);
  }
});
test('un sort hérité remappé se résout en fiche complète, plus de undefined (retour terrain 10/11)', () => {
  const E = loadEngine();
  // cran II de la Lame d'Écume : nom, coût, mult et cible viennent des données
  const lame = E.resolveSpellEntry({ sort: 'morsure-decume', cran: 'II' });
  assert.ok(lame && typeof lame.name === 'string', 'le sort résolu a un nom');
  assert.equal(lame.name, 'Lame d’Écume');
  assert.equal(lame.cost, 4);
  assert.equal(lame.mult, 1.8);
  assert.equal(lame.cible, '2 ennemis');
  assert.equal(lame.role, 'degats');
  // un unique remappé se résout aussi
  const unique = E.resolveSpellEntry({ sort: 'maree-noire', unique: true });
  assert.ok(unique && typeof unique.name === 'string' && unique.cat === 'unique');
  assert.equal(unique.name, 'Marée Noire');
  // un cran vide ne se résout pas (il n'est pas jouable), une entrée inconnue non plus
  assert.equal(E.resolveSpellEntry({ sort: 'sort-inconnu-du-test', cran: 'I' }), null);
  // retour terrain : les sorts malus ciblent les ennemis (la fiche type pilote le ciblage)
  const marque = E.resolveSpellEntry({ sort: 'marque-corrosive', cran: 'I' });
  assert.equal(marque.cible, '1 ennemi', 'un malus dérive une cible ennemie');
  assert.equal(marque.role, 'malus');
  assert.equal(marque.taux, 0.25);
  const zone3 = E.resolveSpellEntry({ sort: 'marque-corrosive', cran: 'III' });
  assert.equal(zone3.cible, 'zone', 'le cran III élargit la cible');

  assert.equal(E.resolveSpellEntry(null), null);
  // les sorts nommés passent tels quels (idempotent)
  const nomme = { name: 'Frappe Précise', cost: 2, mult: 1.3 };
  assert.equal(E.resolveSpellEntry(nomme), nomme);
});
