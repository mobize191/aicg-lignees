import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

// Lot 4 refonte v2 — SORTS AU NIVEAU + GRIMOIRES + TRIO (phase C, J6/J11/J7) :
// J6 sorts débloqués au fil des niveaux (grimoire de l'école de la famille),
// grimoires par zone (crans appris -> store.grimoire -> combat), J11 hybrides soin+dégâts
// des soigneurs dès le bas niveau, J7 sorts de trio (remplacement des synergies).

const E = loadEngine();
const data = loadData();

test('lot 4 (J6) : SORTS_NIVEAU en data, niveaux -> crans I-IV', () => {
  assert.deepEqual(data.engine.SORTS_NIVEAU, { '2': 'I', '5': 'II', '9': 'III', '14': 'IV' });
  const a1 = E.getCard('a1'); // famille lame -> école lame -> morsure-decume
  assert.deepEqual(E.sortsNiveauOf(a1, 1), []);
  assert.deepEqual(E.sortsNiveauOf(a1, 2), [{ sort: 'morsure-decume', cran: 'I' }]);
  assert.deepEqual(E.sortsNiveauOf(a1, 9), [
    { sort: 'morsure-decume', cran: 'I' },
    { sort: 'morsure-decume', cran: 'II' },
    { sort: 'morsure-decume', cran: 'III' },
  ]);
  assert.equal(E.sortsNiveauOf(a1, 20).length, 4, 'crans I-IV à niveau 14+');
  // carte sans famille : écoles du profil de classe
  const n1 = E.getCard('n1'); // recrue, pas de famille
  assert.ok(Array.isArray(E.sortsNiveauOf(n1, 5)));
});

test('lot 4 (J6) : les sorts de niveau entrent dans u.spells côté équipe joueur uniquement', () => {
  const card = { ...E.getCard('a1'), level: 10 };
  const st = E.initCombat({ avant: [card, { ...E.getCard('a1'), level: 10 }, { ...E.getCard('a1'), level: 10 }], reserve: [] }, [{ ...E.getMonster('e1') }], 5, {}, { difficulty: 1 });
  const u = st.team.avant[0];
  const noms = u.spells.map((s) => s.name);
  assert.ok(noms.includes('Lame d\u2019Écume'), 'cran III de morsure-decume appris au niveau 9+');
  assert.ok(!st.enemies.avant[0].spells.some((s) => s.cat === 'ecole' && s.sort), 'les ennemis ne gagnent pas les sorts de niveau');
});

test('lot 4 : grimoires par zone — runZone retourne les enseignements, learnCran les consigne', () => {
  const res = E.runZone('zone-marees', E.mulberry32(1));
  assert.equal(res.enseignements.length, 3, 'zone-marees enseigne 3 crans');
  const grimoire = [];
  for (const e of res.enseignements) E.learnCran(grimoire, e.sort, e.cran);
  assert.ok(E.isLearned(grimoire, 'morsure-decume', 'II'));
  assert.ok(E.isLearned(grimoire, 'carapace-de-corail', 'III'));
  // canCast : école ouverte par le profil Guerrier (rempart oui, entrave non)
  const inst = { id: 'a1', classe: 'Guerrier', ecoles: [], voie: '' };
  assert.ok(E.canCastLearned(inst, grimoire, 'carapace-de-corail', 'III'), 'rempart ouvert au Guerrier');
  assert.ok(!E.canCastLearned(inst, grimoire, 'chant-de-sirene', 'II'), 'entrave non ouverte au Guerrier seul');
  const fiches = E.grimoireSpellsOf(inst, grimoire);
  assert.ok(fiches.some((f) => f.name === 'Barrière de Corail'), 'fiche résolue pour le combat');
  assert.ok(!fiches.some((f) => f.name.includes('Mélodie')), 'sort d\u2019école fermée exclu');
});

test('lot 4 (J11) : hybrides soin+dégâts des Prêtres dès le niveau 2, soin = soinPct des dégâts', () => {
  assert.deepEqual(data.engine.HYBRIDES_NIVEAU, { '2': ['nova-vivifiante', 'balayage-regenere'] });
  const s5 = E.getCard('s5'); // Prêtresse de l'Aube
  assert.deepEqual(E.hybridesNiveauOf(s5, 1), []);
  assert.equal(E.hybridesNiveauOf(s5, 2).length, 2);
  assert.equal(E.hybridesNiveauOf(E.getCard('a1'), 10).length, 0, 'hybrides réservés aux Prêtres');
  const nova = E.resolveSpellEntry({ sort: 'nova-vivifiante' });
  assert.equal(nova.soinPct, 0.5, 'soinPct porté par la fiche résolue');
  assert.equal(nova.role, 'degats');
  // combat : un Prêtre niveau 5 porte l'hybride et le soin hybride soigne l'allié le plus blessé
  const pretre = { ...E.getCard('s5'), level: 5 };
  const tank = { ...E.getCard('a1'), level: 5 };
  const st = E.initCombat({ avant: [pretre, tank, { ...E.getCard('a1'), level: 5 }], reserve: [] }, [{ ...E.getMonster('e1') }, { ...E.getMonster('e2') }, { ...E.getMonster('e3') }], 11, {}, { difficulty: 1 });
  const u = st.team.avant[0];
  assert.ok(u.spells.some((s) => s.name === 'Nova Vivifiante'), 'hybride présent dans u.spells');
  u.spells = [{ name: 'Nova Vivifiante', cost: 3, mult: 1.2, soinPct: 0.5, role: 'degats', cible: '1 ennemi' }];
  u.mana = 99; u.manaMax = 99;
  st.team.avant[1].hp = 5; st.team.avant[1].maxHp = 200; // allié très blessé
  for (const e of [...st.enemies.avant, ...st.enemies.arriere]) { e.hp = 1000; e.maxHp = 1000; e.agi = 0; e.def = 0; }
  const log = E.playAuto(st, 30);
  const atk = log.find((e) => e.type === 'attack' && e.sourceId === u.uid);
  const heal = log.find((e) => e.type === 'heal' && e.sourceId === u.uid && e.side === 'team');
  assert.ok(atk, 'dégâts de l\u2019hybride');
  assert.ok(heal, 'soin hybride rendu à l\u2019allié le plus blessé');
  assert.ok(heal.amount >= 1 && Math.abs(heal.amount - Math.round(atk.amount * 0.5)) <= 1, 'soin = 50 % des dégâts');
});

test('lot 4 (J7) : sorts de trio — 3 classes distinctes débloquent Harmonie, Mage+Assassin+Prêtre débloque Éclipse', () => {
  assert.equal(data.engine.SORTS_TRIO.length, 2);
  const mk = (id, lvl) => ({ ...E.getCard(id), level: lvl });
  // trio mixte : a1 Guerrier + a40 Assassin + s5 Prêtre
  const st = E.initCombat({ avant: [mk('a1', 12), mk('a40', 12), mk('s5', 12)], reserve: [] }, [{ ...E.getMonster('e1') }], 3, {}, { difficulty: 1 });
  const sorts = st.team.avant[0].spells.filter((s) => s.cat === 'trio').map((s) => s.name);
  assert.ok(sorts.includes('Harmonie du Trio'), '3 classes distinctes -> Harmonie du Trio');
  assert.ok(sorts.includes('Éclipse du Trio') === false, 'pas Mage+Assassin+Prêtre -> pas d\u2019Éclipse');
  // Mage + Assassin + Prêtre
  const st2 = E.initCombat({ avant: [mk('a8', 12), mk('a40', 12), mk('s5', 12)], reserve: [] }, [{ ...E.getMonster('e1') }], 3, {}, { difficulty: 1 });
  const sorts2 = st2.team.avant[0].spells.filter((s) => s.cat === 'trio').map((s) => s.name);
  assert.ok(sorts2.includes('Éclipse du Trio'), 'Mage+Assassin+Prêtre -> Éclipse du Trio');
  // mono-classe : aucun sort de trio
  const st3 = E.initCombat({ avant: [mk('a1', 12), mk('a1', 12), mk('a1', 12)], reserve: [] }, [{ ...E.getMonster('e1') }], 3, {}, { difficulty: 1 });
  assert.equal(st3.team.avant[0].spells.filter((s) => s.cat === 'trio').length, 0, 'mono-classe -> pas de sort de trio');
  // ennemis : pas de sort de trio
  assert.ok(!st.team.avant.every(() => true) || !st.enemies.avant[0].spells.some((s) => s.cat === 'trio'), 'ennemis sans sort de trio');
});

test('lot 4 : validateur accepte les nouvelles tables et rejette un cran invalide', () => {
  const d2 = JSON.parse(JSON.stringify(data));
  const errors = [];
  E.validate(d2, errors);
  assert.ok(!errors.some((e) => e.includes('SORTS_NIVEAU') || e.includes('HYBRIDES') || e.includes('SORTS_TRIO')), errors.join(' | '));
  d2.engine.SORTS_NIVEAU = { '3': 'V' };
  d2.engine.HYBRIDES_NIVEAU = { '2': ['sort-inconnu'] };
  const errors2 = [];
  E.validate(d2, errors2);
  assert.ok(errors2.some((e) => e.includes('SORTS_NIVEAU')), 'cran V rejeté');
  assert.ok(errors2.some((e) => e.includes('sort-inconnu')), 'hybride inconnu rejeté');
});
