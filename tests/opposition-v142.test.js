import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { loadEngine } from './helpers/load.mjs';

// Refonte direction — Lot B (TRANCHÉ 12/11) : oppositions au SORT (élément de l’école du sort
// contre élément inné de la cible), frappe simple = élément de la carte, humains Neutres,
// « Terre » renommé « Nature » (topologie inchangée). SCHOOL_ELEMENT en data [À TRANCHER : mapping proposé].

test('Lot B : SCHOOL_ELEMENT couvre toutes les écoles et retombe sur les éléments du cercle', () => {
  const E = loadEngine();
  const schools = Object.keys(E.DATA.schools ?? {});
  assert.ok(schools.length >= 8, 'au moins les 8 ecoles historiques');
  for (const sc of schools) {
    const el = E.schoolElementOf({ ecole: sc });
    assert.ok(el, 'école ' + sc + ' a un élément');
    assert.ok(['Neutre', ...E.DATA.engine.ELEMENTS].includes(el), el + ' est un élément connu');
  }
  assert.equal(E.schoolElementOf({ ecole: 'ruse' }), 'Eau');
  assert.equal(E.schoolElementOf({ ecole: 'entrave' }), 'Ombre');
  assert.equal(E.schoolElementOf(null), null);
  assert.equal(E.schoolElementOf({}), null);
});

test('Lot B : opposition sort -> cible : école Eau (ruse) vs cible Feu = +25 %, vs Neutre = neutre', () => {
  const E = loadEngine();
  assert.equal(E.DATA.engine.BEATS.Eau, 'Feu');
  assert.equal(E.elementMult(E.schoolElementOf({ ecole: 'ruse' }), 'Feu'), 1.25);
  assert.equal(E.elementTag(E.schoolElementOf({ ecole: 'ruse' }), 'Feu'), 'fort');
  assert.equal(E.elementMult(E.schoolElementOf({ ecole: 'ruse' }), 'Neutre'), 1, 'cible Neutre : jamais de bonus');
  assert.equal(E.elementMult(E.schoolElementOf({ ecole: 'lame' }), 'Feu'), 1, 'école lame = Neutre');
  // topologie inchangée : Nature hérite des liens de l’ancien Terre
  assert.equal(E.DATA.engine.BEATS.Nature, 'Eau');
  assert.equal(E.DATA.engine.BEATS.Feu, 'Nature');
  assert.equal(E.DATA.engine.BEATEN_BY.Nature, 'Feu');
});

test('Lot B : frappe simple = élément de la carte ; un humain (Neutre) ne fait jamais de bonus d’opposition', () => {
  const E = loadEngine();
  const hum = E.makeUnit({ ...E.getCard('n1'), level: 10 });
  assert.equal(hum.element, 'Neutre', 'carte humaine = Neutre');
  for (const defEl of [...E.DATA.engine.ELEMENTS, 'Neutre']) {
    assert.equal(E.atkElementOf(hum, null), 'Neutre');
    assert.equal(E.elementMult(E.atkElementOf(hum, null), defEl), 1, 'humain vs ' + defEl);
  }
  // un sort porté par un humain utilise l’élément de l’école, pas Neutre
  assert.equal(E.atkElementOf(hum, { ecole: 'ruse' }), 'Eau');
  // monstre : élément inné conservé pour la frappe simple
  const mon = E.makeUnit({ ...E.getMonster('e1') });
  assert.ok(E.DATA.engine.ELEMENTS.includes(mon.element), 'monstre garde son élément inné : ' + mon.element);
  assert.equal(E.atkElementOf(mon, null), mon.element);
});

test('Lot B : renommage exhaustif — plus aucun élément « Terre » dans data/ (hors changelog in-game)', () => {
  for (const f of readdirSync('data').filter((f) => f.endsWith('.json'))) {
    const txt = readFileSync('data/' + f, 'utf8');
    assert.ok(!/\bTerre(?!s)\b/.test(txt), f + ' contient encore « Terre »');
  }
  const E = loadEngine();
  assert.ok(!('Terre' in E.DATA.engine.BEATS));
  assert.ok(!E.DATA.engine.ELEMENTS.includes('Terre'));
  assert.ok(E.DATA.engine.ELEMENTS.includes('Nature'));
});

test('Lot B : toutes les cartes humaines sont Neutres en data', () => {
  const E = loadEngine();
  const div = new Set(E.DATA.engine.RACE_DIVINE_IDS), mys = new Set(E.DATA.engine.RACE_MYSTIQUE_IDS);
  const mon = new Set(E.DATA.engine.RACE_MONSTRE_IDS), humDg = new Set(E.DATA.engine.RACE_HUMAINE_DUNGEON_IDS);
  const raceOf = (c) => div.has(c.id) ? 'divine' : mys.has(c.id) ? 'mystique' : mon.has(c.id) ? 'monstre'
    : !c.dungeon ? 'humaine' : humDg.has(c.id) ? 'humaine' : 'monstre';
  for (const c of E.DATA.cards) {
    if (raceOf(c) === 'humaine') assert.equal(c.element, 'Neutre', c.id + ' humaine non Neutre');
  }
});
