import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';

// correctifs sorts (TRANCH\u00c9 14/11, prompt docs/prompt-correctifs-sorts.md)
// lot 1 : lign\u00e9e du Vol = attaques (cible "1 ennemi" en data) — Tactique frappe l'ennemi
// lot 2 : signatures des recrues r\u00e9solues par leur fiche (signatureMetaOfUnit) EN TACTIQUE seule ;
//         le chemin Auto reste une frappe -> digest inchang\u00e9 (mesur\u00e9).

const foesOf = (E, n = 3) => E.DATA.monsters.filter((m) => m.dungeon === 'marees').slice(0, n);
const ligneeSpell = (E, fam, nom) => {
  const sp = E.DATA['lineage-spells'][fam].find((x) => x.name === nom);
  const role = (E.DATA.schools[E.DATA.engine.FAM_SCHOOL[fam]] ?? {}).role;
  return { ...sp, cat: 'lign\u00e9e', ecole: E.DATA.engine.FAM_SCHOOL[fam], role };
};
const monsterUnit = (E, id) => E.allMonsters().find((m) => m.id === id);

test('lot 1 : sort de la lign\u00e9e du Vol -> camp ennemi (fiche) et frappe l\u2019ennemi d\u00e9sign\u00e9 en Tactique', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(3));
  const sp = ligneeSpell(E, 'vol', 'Larcin Agile');
  assert.equal(sp.cible, '1 ennemi', 'data : cible 1 ennemi (TRANCH\u00c9 14/11)');
  assert.equal(E.spellSideOf(sp), 'enemy', 'la fen\u00eatre propose les ennemis');
  const st = E.initCombat({ avant: [{ ...E.getCard('t6'), spells: [sp] }], arriere: [] }, foesOf(E), 42, {});
  const u = st.team.avant[0];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  E.beginRound(st);
  const foe = st.enemies.avant[0];
  const hpBefore = foe.hp;
  const r = E.stepRound(st, { kind: 'spell', idx: 0, targetUid: foe.uid });
  assert.ok(r.events.some((e) => e.type === 'attack' && e.sourceId === u.uid && e.targetId === foe.uid), 'frappe sur l\u2019ennemi d\u00e9sign\u00e9');
  assert.ok(foe.hp < hpBefore, 'd\u00e9g\u00e2ts r\u00e9els');
  assert.ok(!r.events.some((e) => e.type === 'buff'), 'plus de buff ATQ alli\u00e9 (bug Tactique corrig\u00e9)');
});

test('lot 2 : recrue e8 Matriarche des R\u00e9cifs pose sa Barri\u00e8re de Corail sur son camp en Tactique', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(4));
  const e8 = monsterUnit(E, 'e8');
  assert.equal(e8.effect.kind, 'shield');
  const sig = e8.spells.find((s) => s.cat === 'unique');
  assert.ok(sig, 'signature pr\u00e9sente');
  const st = E.initCombat({ avant: [e8, { ...E.getCard('n1') }], arriere: [] }, foesOf(E), 43, {});
  const u = st.team.avant[0];
  const ally = st.team.avant[1];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  E.beginRound(st);
  const foeHp = st.enemies.avant[0].hp;
  const r = E.stepRound(st, { kind: 'spell', idx: e8.spells.indexOf(sig) });
  const sh = r.events.find((e) => e.type === 'shield');
  assert.ok(sh && sh.amount > 0, 'bouclier pos\u00e9 (event shield)');
  assert.ok((st.team.avant.find((x) => x.uid === sh.targetId)?.shield ?? 0) >= sh.amount, 'le bouclier est sur un alli\u00e9 du camp');
  assert.equal(st.enemies.avant[0].hp, foeHp, 'aucun d\u00e9g\u00e2t ennemi : la fiche bouclier ne frappe pas');
});

test('lot 2 : recrue e25 Chant Paralysant (stun) -> d\u00e9g\u00e2ts + statut stun sur l\u2019ennemi d\u00e9sign\u00e9 en Tactique', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(5));
  const e25 = monsterUnit(E, 'e25');
  assert.equal(e25.effect.kind, 'stun');
  const sig = e25.spells.find((s) => s.cat === 'unique');
  const st = E.initCombat({ avant: [e25], arriere: [] }, foesOf(E), 44, {});
  const u = st.team.avant[0];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  E.beginRound(st);
  const foe = st.enemies.avant[1];
  const r = E.stepRound(st, { kind: 'spell', idx: e25.spells.indexOf(sig), targetUid: foe.uid });
  assert.ok(r.events.some((e) => e.type === 'attack' && e.targetId === foe.uid), 'le sort garde ses d\u00e9g\u00e2ts');
  assert.ok(r.events.some((e) => e.type === 'status' && e.kind === 'stun' && e.targetId === foe.uid), 'statut stun pos\u00e9 sur l\u2019ennemi d\u00e9sign\u00e9');
  assert.ok((foe.status.stun ?? 0) > 0, 'stun effectif sur la cible');
});

test('lot 2 : recrue f5 Invocateur des Foyers (summon) -> un esprit rejoint la ligne avant en Tactique', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(6));
  const f5 = monsterUnit(E, 'f5');
  assert.equal(f5.effect.kind, 'summon');
  const sig = f5.spells.find((s) => s.cat === 'unique');
  const st = E.initCombat({ avant: [f5], arriere: [] }, foesOf(E), 45, {});
  const u = st.team.avant[0];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  E.beginRound(st);
  const avantAvant = st.team.avant.length;
  const r = E.stepRound(st, { kind: 'spell', idx: f5.spells.indexOf(sig) });
  assert.ok(r.events.some((e) => e.type === 'summon' && e.sourceId === u.uid), 'event summon \u00e9mis');
  assert.ok(st.team.avant.length > avantAvant && st.team.avant.some((x) => x.uid.includes('-inv')), 'esprit pr\u00e9sent dans la ligne avant');
});

test('lot 2 : en Auto, la signature bouclier d\u2019une recrue reste une frappe (chemin Auto inchang\u00e9 -> digest inchang\u00e9)', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(7));
  const e8 = monsterUnit(E, 'e8');
  const st = E.initCombat({ avant: [e8], arriere: [] }, foesOf(E), 46, {});
  const u = st.team.avant[0];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  E.beginRound(st);
  const r = E.stepRound(st, null); // Auto : aucun pas tactique
  assert.ok(r.events.some((e) => e.type === 'attack' || e.type === 'dodge'), 'Auto = frappe tent\u00e9e (comportement historique conserv\u00e9)');
  assert.ok(!r.events.some((e) => e.type === 'shield'), 'pas de bouclier en Auto');
});

// lot 5 : badges contrôle/malus = le statut est posé EN PLUS des dégâts (taux/tours en data),
//         en Tactique ET en Auto ; Œil du Malheur (classe) passe taux/tours/curse via legacySpell

const tanky = (st) => { for (const f of [...st.enemies.avant, ...st.enemies.arriere]) { f.hp = f.maxHp = 100000; } };

test('lot 5 : sort Entrave (bosquet, taux 0,25 tours 1) -> dégâts + stun sur l’ennemi désigné en Tactique', () => {
  const E = loadEngine();
  const sp = ligneeSpell(E, 'bosquet', 'Trait d’Épine');
  assert.equal(sp.taux, 0.25, 'taux en data (palier C)');
  assert.equal(sp.tours, 1, 'tours en data');
  assert.equal(sp.role, 'controle');
  const st = E.initCombat({ avant: [{ ...E.getCard('t6'), spells: [sp] }], arriere: [] }, foesOf(E), 1, {});
  const u = st.team.avant[0];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  tanky(st);
  E.beginRound(st);
  const foe = st.enemies.avant[0];
  const hpBefore = foe.hp;
  const r = E.stepRound(st, { kind: 'spell', idx: 0, targetUid: foe.uid });
  assert.ok(r.events.some((e) => e.type === 'attack' && e.targetId === foe.uid), 'le sort garde ses dégâts');
  assert.ok(foe.hp < hpBefore, 'dégâts réels');
  assert.ok(r.events.some((e) => e.type === 'status' && e.kind === 'stun' && e.targetId === foe.uid), 'event stun émis');
  assert.ok((foe.status.stun ?? 0) >= 1, 'stun effectif sur la cible');
});

test('lot 5 : sort Mauvais-Œil (braise, curse 0,15 × 2 tours) -> dégâts + curse de la valeur du sort', () => {
  const E = loadEngine();
  const sp = ligneeSpell(E, 'braise', 'Étincelle Filante');
  assert.equal(sp.taux, 0.25);
  assert.equal(sp.tours, 2);
  assert.equal(sp.curse, 0.15, 'valeur curse en data (palier C)');
  assert.equal(sp.role, 'malus');
  const st = E.initCombat({ avant: [{ ...E.getCard('t6'), spells: [sp] }], arriere: [] }, foesOf(E), 1, {});
  const u = st.team.avant[0];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  tanky(st);
  E.beginRound(st);
  const foe = st.enemies.avant[0];
  const r = E.stepRound(st, { kind: 'spell', idx: 0, targetUid: foe.uid });
  assert.ok(r.events.some((e) => e.type === 'attack' && e.targetId === foe.uid), 'le sort garde ses dégâts');
  const ev = r.events.find((e) => e.type === 'status' && e.kind === 'curse' && e.targetId === foe.uid);
  assert.ok(ev, 'event curse émis');
  assert.equal(ev.value, 0.15, 'valeur curse = celle du sort');
  assert.deepEqual(foe.status.curse, { value: 0.15, turns: 2 }, 'curse posée 2 tours');
});

test('lot 5 : en Auto, un sort à taux pose aussi le statut (cohérence des chemins Tactique/Auto)', () => {
  const E = loadEngine();
  const sp = ligneeSpell(E, 'seuil', 'Sablier I');
  const st = E.initCombat({ avant: [{ ...E.getCard('t6'), spells: [sp] }], arriere: [] }, foesOf(E), 1, {});
  const u = st.team.avant[0];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  tanky(st);
  E.beginRound(st);
  const r = E.stepRound(st, null); // Auto
  assert.ok(r.events.some((e) => e.type === 'cast'), 'le sort est lancé en Auto');
  assert.ok(r.events.some((e) => e.type === 'status' && e.kind === 'stun'), 'stun posé en Auto aussi');
});

test('lot 5 : Œil du Malheur (classe Occultiste) -> taux 1, tours 2, curse 0,2 en data, curse posée en combat', () => {
  const E = loadEngine();
  const def = E.DATA.grimoire.entrees.find((s) => s.id === 'oeil-du-malheur');
  assert.equal(def.taux, 1);
  assert.equal(def.tours, 2);
  assert.equal(def.curse, 0.2);
  assert.ok(def.desc.includes('dégâts'), 'desc reformulée (−20 % de dégâts × 2 tours)');
  const sp = { name: def.nom, cost: def.cout, mult: def.mult, cat: 'classe', role: def.role, cible: def.cible, taux: def.taux, tours: def.tours, curse: def.curse };
  const st = E.initCombat({ avant: [{ ...E.getCard('n12'), spells: [sp] }], arriere: [] }, foesOf(E), 47, {});
  const u = st.team.avant[0];
  u.mana = u.manaMax = 20; u.manaRegen = 5; u.agi = 999;
  tanky(st);
  E.beginRound(st);
  const foe = st.enemies.avant[0];
  const r = E.stepRound(st, { kind: 'spell', idx: 0, targetUid: foe.uid });
  assert.ok(r.events.some((e) => e.type === 'attack' && e.targetId === foe.uid), 'dégâts conservés');
  assert.deepEqual(foe.status.curse, { value: 0.2, turns: 2 }, 'curse −20 % × 2 tours posée (taux 1)');
});
