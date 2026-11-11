import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEngine } from './helpers/load.mjs';

test('v8 traverse la chaine sans perte (ACC-0-5, EXI-SAVE-1)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.instances.length, save.instances.length);
  assert.equal(out.tokens.length, save.tokens.length);
  assert.deepEqual(out.collection, save.collection);
  assert.deepEqual(out.instances.map((i) => [i.id, i.lvl, i.xp]), save.instances.map((i) => [i.id, i.lvl, i.xp]));
});

test('v8 -> v9 -> v10 : aucune carte perdue, chaque exemplaire garde ou re-choisit sa voie (ACC-1-4)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.instances.length, save.instances.length);
  assert.deepEqual(out.instances.map((i) => i.id), save.instances.map((i) => i.id));
  for (const inst of out.instances) {
    if (E.eveilsOf(inst.id).length) assert.ok(inst.voie, `l'exemplaire ${inst.id} a une voie`);
  }
});

test('v8 -> v9 -> v10 : les sorts connus survivent au re-mappage (ACC-2-7)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  save.instances[0].acc = [{ name: 'Jet d’Écume' }, { name: 'Marée Noire' }, { name: 'Frappe Pratics' }];
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  const sorts = out.instances[0].sorts;
  assert.equal(sorts.length, 3, 'aucun sort appris perdu');
  assert.deepEqual(sorts[0], { sort: 'morsure-decume', cran: 'I' });
  assert.deepEqual(sorts[1], { sort: 'maree-noire', unique: true });
  assert.deepEqual(sorts[2], { nom: 'Frappe Pratics', legacy: true });
});

test('v8 -> v11 : chaque exemplaire reçoit agilité et intelligence, aucune régression (ACC-3-6)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.instances.length, save.instances.length);
  for (const inst of out.instances) {
    assert.ok(Number.isFinite(inst.agi) && inst.agi >= 1, `${inst.id} a une agilité`);
    assert.ok(Number.isFinite(inst.int) && inst.int >= 1, `${inst.id} a une intelligence`);
  }
  assert.deepEqual(out.tokens.length, save.tokens.length);
});

test('v8 -> v12 : grimoire appris et zones visitées présents, chaîne complète (EXI-SAVE-1)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.ok(Array.isArray(out.grimoire));
  assert.ok(Array.isArray(out.zonesVisitees));
  assert.equal(out.instances.length, save.instances.length);
});

test('v12 -> v13 : les sorts connus d\u2019un biome trie se re-mappent, les autres restent (EXI-T-4)', () => {
  const E = loadEngine();
  const s = {
    version: 12,
    instances: [{ iid: 'i1', id: 'f1', sorts: [{ name: 'Poing de Cendre' }, { sort: 'morsure-decume', cran: 'I' }], acc: [{ name: 'Colonne de Feu' }] }],
    grimoire: [{ sort: 'morsure-decume', cran: 'I' }],
  };
  const out = E.migrate(s);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.deepEqual(out.instances[0].sorts[0], { sort: 'morsure-decume', cran: 'I' }, 'Poing de Cendre fonde au cran I');
  assert.deepEqual(out.instances[0].sorts[1], { sort: 'morsure-decume', cran: 'I' }, 'un sort deja remappe reste intact');
  assert.deepEqual(out.instances[0].acc[0], { sort: 'colonne-de-feu', cran: 'III' }, 'la signature de f20 fond vers son cran');
  assert.deepEqual(out.grimoire[0], { sort: 'morsure-decume', cran: 'I' }, 'le grimoire appris ne bouge pas');
  const s2 = { version: 12, instances: [{ iid: 'i2', id: 'd1', sorts: [{ name: 'Interdiction' }] }] };
  const out2 = E.migrate(s2);
  assert.deepEqual(out2.instances[0].sorts[0], { sort: 'hurlement', cran: 'I' }, 'les divines triées (T2.6) re-mappent aussi');
});

test('v13 -> v14 : le Bosquet nouvellement tri\u00e9 remappe ses sorts legacy (EXI-T-4, T2.2)', () => {
  const E = loadEngine();
  const s = {
    version: 13,
    instances: [{ iid: 'i1', id: 'g14', sorts: [{ name: 'Spores Vampires' }, { sort: 'morsure-decume', cran: 'I' }], acc: [{ name: 'S\u00e8ve \u00c9veill\u00e9e' }] }],
    grimoire: [{ name: 'Ros\u00e9e Radieuse' }],
  };
  const out = E.migrate(s);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.deepEqual(out.instances[0].sorts[0], { sort: 'seve-rongeuse', cran: 'I' }, 'Spores Vampires fonde au cran I de la S\u00e8ve Rongeuse');
  assert.deepEqual(out.instances[0].sorts[1], { sort: 'morsure-decume', cran: 'I' }, 'un sort deja remappe reste intact');
  assert.deepEqual(out.instances[0].acc[0], { sort: 'fournaise-invoquee', cran: 'II' }, 'S\u00e8ve \u00c9veill\u00e9e (g13) fonde vers 2 renforts');
  assert.deepEqual(out.grimoire[0], { sort: 'onde-consacree', cran: 'III' }, 'Ros\u00e9e Radieuse (g17) greffe le cran III de l\u2019entr\u00e9e de baume');
  const s2 = { version: 13, instances: [{ iid: 'i2', id: 'd2', sorts: [{ name: 'Sable Glissant' }] }] };
  const out2 = E.migrate(s2);
  assert.deepEqual(out2.instances[0].sorts[0], { sort: 'hurlement', cran: 'II' }, 'les divines triées (T2.6) re-mappent aussi');
});

test('v14 -> v15 : la Crypte nouvellement tri\u00e9e remappe ses sorts legacy (EXI-T-4, T2.3)', () => {
  const E = loadEngine();
  const s = {
    version: 14,
    instances: [{ iid: 'i1', id: 'k13', sorts: [{ name: 'Morsure Putride' }, { sort: 'seve-rongeuse', cran: 'I' }], acc: [{ name: 'L\u00e9gion des Caveaux' }] }],
    grimoire: [{ name: 'Hurlement Froid' }],
  };
  const out = E.migrate(s);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.deepEqual(out.instances[0].sorts[0], { sort: 'morsure-putride', cran: 'I' }, 'Morsure Putride fonde au cran I de son propre sort d\u2019\u00e9cole');
  assert.deepEqual(out.instances[0].sorts[1], { sort: 'seve-rongeuse', cran: 'I' }, 'un sort deja remappe reste intact');
  assert.deepEqual(out.instances[0].acc[0], { sort: 'fournaise-invoquee', cran: 'III' }, 'L\u00e9gion des Caveaux (k16) fonde vers 3 renforts');
  assert.deepEqual(out.grimoire[0], { sort: 'hurlement', cran: 'III' }, 'Hurlement Froid (k6) fonde vers le cran III ne des banshees');
  const s2 = { version: 14, instances: [{ iid: 'i2', id: 'd1', sorts: [{ name: 'Interdiction' }] }] };
  const out2 = E.migrate(s2);
  assert.deepEqual(out2.instances[0].sorts[0], { sort: 'hurlement', cran: 'I' }, 'les divines triées (T2.6) re-mappent aussi');
});

test('v15 -> v16 : le Z\u00e9nith nouvellement tri\u00e9 remappe ses sorts legacy (EXI-T-4, T2.4)', () => {
  const E = loadEngine();
  const s = {
    version: 15,
    instances: [{ iid: 'i1', id: 'z18', sorts: [{ name: '\u00c9closion Ardente' }, { sort: 'morsure-putride', cran: 'I' }], acc: [{ name: 'Plumage Miroir' }] }],
    grimoire: [{ name: 'Hymne du Z\u00e9nith' }],
  };
  const out = E.migrate(s);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.deepEqual(out.instances[0].sorts[0], { sort: 'colonne-de-feu', cran: 'III' }, '\u00c9closion Ardente fonde au cran III de la Colonne de Feu');
  assert.deepEqual(out.instances[0].sorts[1], { sort: 'morsure-putride', cran: 'I' }, 'un sort deja remappe reste intact');
  assert.deepEqual(out.instances[0].acc[0], { sort: 'renvoi-celeste', cran: 'I' }, 'Plumage Miroir (z20) fonde vers le renvoi a 1 allie');
  assert.deepEqual(out.grimoire[0], { sort: 'hymne', cran: 'III' }, 'Hymne du Z\u00e9nith (z25) fonde vers le cran III de l\u2019Hymne');
  const s2 = { version: 15, instances: [{ iid: 'i2', id: 'd2', sorts: [{ name: 'Sable Glissant' }] }] };
  const out2 = E.migrate(s2);
  assert.deepEqual(out2.instances[0].sorts[0], { sort: 'hurlement', cran: 'II' }, 'les divines triées (T2.6) re-mappent aussi');
});


test('v16 -> v17 : les recrues nouvellement tri\u00e9es remappent leurs sorts legacy (EXI-T-4, T2.5)', () => {
  const E = loadEngine();
  const s = {
    version: 16,
    instances: [{ iid: 'i1', id: 'a3', sorts: [{ name: 'Prise de Garde', cost: 5, mult: 1.85, cat: 'unique' }, { sort: 'renvoi-celeste', cran: 'I' }], acc: [{ name: 'Ronde \u00c9clair\u00e9e' }] }],
    grimoire: [{ name: 'Carrousel de Lames' }],
  };
  const out = E.migrate(s);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.deepEqual(out.instances[0].sorts[0], { sort: 'carapace-de-corail', cran: 'I' }, 'Prise de Garde (n1) fonde au cran I du Rempart');
  assert.deepEqual(out.instances[0].sorts[1], { sort: 'renvoi-celeste', cran: 'I' }, 'un sort deja remappe reste intact');
  assert.deepEqual(out.instances[0].acc[0], { sort: 'guet-des-fonds', cran: 'II' }, 'Ronde \u00c9clair\u00e9e (a49) fonde vers la Vigie, 2 alli\u00e9s');
  assert.deepEqual(out.grimoire[0], { sort: 'morsure-decume', cran: 'II' }, 'Carrousel de Lames (a46) fauche 2 ennemis');
  const s2 = { version: 16, instances: [{ iid: 'i2', id: 'n13', sorts: [{ name: '\u00c9clat d\u2019Aube' }, { name: 'Sable Glissant' }] }] };
  const out2 = E.migrate(s2);
  assert.deepEqual(out2.instances[0].sorts[0], { sort: 'onde-consacree', cran: 'II' }, 'Éclat d’Aube (n13) fonde au cran II de l’Onde Consacrée (T2.6)');
  assert.deepEqual(out2.instances[0].sorts[1], { sort: 'hurlement', cran: 'II' }, 'Sable Glissant (d2) fonde au cran II du Hurlement (T2.6)');
});

test('v17 -> v18 : les divines nouvellement triées remappent leurs sorts legacy (EXI-T-4, T2.6)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  save.instances[0].acc = [{ name: 'Arrêt du Temps' }, { name: 'Interdiction' }, { name: 'Éclat d’Aube' }];
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  const sorts = out.instances[0].sorts;
  assert.equal(sorts.length, 3, 'aucun sort perdu');
  assert.deepEqual(sorts[0], { sort: 'arret-du-temps', unique: true });
  assert.deepEqual(sorts[1], { sort: 'hurlement', cran: 'I' });
  assert.deepEqual(sorts[2], { sort: 'onde-consacree', cran: 'II' });
});

test('v18 -> v19 : agi/int recalculées depuis les ratios de profil (T4.7)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  const R = E.DATA.engine.moteur.STAT_RATIOS;
  for (const inst of out.instances) {
    const c = E.getCard(inst.id) ?? E.getMonster(inst.id);
    const r = R[c.classe] ?? R.Guerrier;
    assert.ok(Number.isFinite(inst.agi) && inst.agi >= 1);
    assert.ok(inst.int >= (['Mage', 'Occultiste', 'Prêtre'].includes(c.classe) ? inst.agi : 0) || !['Mage', 'Occultiste', 'Prêtre'].includes(c.classe), 'mage : int domine');
  }
});

test('v20 -> v21 (boucle v2 lot 1) : points convertis en or (1 ⚡ = 1 or), potions et état de run initialisés, non destructif', () => {
  const E = loadEngine();
  const s = {
    version: 20,
    points: 137,
    instances: [{ iid: 'i1', id: 'n1', lvl: 3, xp: 0, acc: [] }],
    tokens: [{ kind: 'race', rar: 'C' }],
    teams: [{ slots: ['i1'], formation: '3-2' }, { slots: [] }, { slots: [] }],
  };
  const out = E.migrate(s);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.gold, 137, 'conversion 1 ⚡ = 1 or');
  assert.equal(out.points, undefined, 'le champ points est remplacé par gold');
  for (const pid of Object.keys(E.DATA.potions)) assert.equal(out.potions[pid], 0, `stock ${pid} initialisé`);
  assert.deepEqual(out.runState, { active: false, units: {} });
  assert.equal(out.instances.length, 1, 'aucune carte perdue');
  assert.equal(out.tokens.length, 1, 'aucun jeton perdu');
  // idempotence : rejouer sur une v21 ne casse rien
  const again = E.migrate(structuredClone(out));
  assert.equal(again.gold, 137);
  assert.deepEqual(again.runState, { active: false, units: {} });
});

test('v21 -> v22 (boucle v2 lot 3) : departFait posé selon la présence de cartes, non destructif', () => {
  const E = loadEngine();
  const avec = { version: 21, instances: [{ iid: 'i1', id: 'n1', lvl: 1, xp: 0, acc: [] }], gold: 10, potions: {}, runState: { active: false, units: {} } };
  const out = E.migrate(structuredClone(avec));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.departFait, true, 'sauvegarde déjà commencée : l’écran de départ est sauté');
  assert.equal(out.gold, 10);
  const neuve = { version: 21, instances: [], gold: 0, potions: {}, runState: { active: false, units: {} } };
  const out2 = E.migrate(structuredClone(neuve));
  assert.equal(out2.departFait, false, 'nouvelle partie : écran de départ à venir');
});

test('v22 -> v23 (boucle v2 lot 4) : matériaux, équipement, slots d\'équipement initialisés, non destructif', () => {
  const E = loadEngine();
  const s = { version: 22, instances: [{ iid: 'i1', id: 'n1', lvl: 5, xp: 0, acc: [] }], gold: 42, departFait: true, potions: { soin30: 2 }, runState: { active: true, units: { i1: { hp: 30, mana: 4 } } } };
  const out = E.migrate(structuredClone(s));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.deepEqual(out.materiaux, {});
  assert.deepEqual(out.equipment, {});
  assert.deepEqual(out.equip, {});
  assert.deepEqual(out.equipTeam, [null, null]);
  assert.equal(out.gold, 42);
  assert.deepEqual(out.potions, { soin30: 2 });
  assert.deepEqual(out.runState, { active: true, units: { i1: { hp: 30, mana: 4 } } }, 'état de run conservé');
});
