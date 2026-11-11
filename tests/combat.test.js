import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';
import { rmSync, cpSync, writeFileSync, readFileSync } from 'node:fs';

const ligne5 = () => [0, 1, 2, 3, 4].map((i) => ({ uid: `e${i}`, hp: 100, maxHp: 100, alive: true, shield: 0, status: {} }));

test('la zone frappe exactement 3 cibles contiguës sur 5, le centre en auto (ACC-3-3)', () => {
  const E = loadEngine();
  const ligne = ligne5();
  const auto = E.pickZoneTargets(ligne, null);
  assert.deepEqual(auto.map((u) => u.uid), ['e1', 'e2', 'e3']);
  const choix0 = E.pickZoneTargets(ligne, 0);
  assert.deepEqual(choix0.map((u) => u.uid), ['e0', 'e1', 'e2']);
  const choix2 = E.pickZoneTargets(ligne, 2);
  assert.deepEqual(choix2.map((u) => u.uid), ['e2', 'e3', 'e4']);
});

test('la zone ne remplace pas une cible morte avant l\u2019impact (ACC-3-3)', () => {
  const E = loadEngine();
  const ligne = ligne5();
  ligne[2].hp = 0;
  const res = E.pickZoneTargets(ligne, null);
  assert.deepEqual(res.map((u) => u.uid), ['e1', 'e3'], 'pas de glissement vers e4');
});

test('la largeur vient des données : le cran III vaut 3 (ACC-3-3)', () => {
  const E = loadEngine();
  assert.equal(E.cranOf('morsure-decume', 'III').largeur, 3);
  const cibles = ligne5();
  const res = E.castSpell(E.DATA, 'morsure-decume', 'III', { lanceur: { uid: 'x', atk: 10, classe: 'Guerrier' }, cibles, events: [] });
  assert.equal(res.cibles.length, 3);
});

test('l\u2019ordre du tour suit l\u2019agilité, stable à égalité (ACC-3-4)', () => {
  const E = loadEngine();
  const mk = (uid, agi) => ({ uid, agi, atk: 999 - agi, alive: true, hp: 10, maxHp: 10, status: {}, spells: [] });
  const st = {
    turn: 0, winner: null, rng: mulberry32(1),
    team: { avant: [mk('a', 10), mk('b', 20)], arriere: [] },
    enemies: { avant: [mk('c', 15)], arriere: [] },
    mods: {},
  };
  E.beginRound(st);
  assert.deepEqual(st.round.items.map((i) => i.u.uid), ['b', 'c', 'a'], 'le plus agile agit avant, l\u2019attaque ne compte plus');
  const st2 = {
    turn: 0, winner: null, rng: mulberry32(1),
    team: { avant: [mk('a', 10), mk('b', 10)], arriere: [] },
    enemies: { avant: [], arriere: [] }, mods: {},
  };
  E.beginRound(st2);
  assert.deepEqual(st2.round.items.map((i) => i.u.uid), ['a', 'b'], 'à égalité l\u2019ordre reste stable');
});

// ---------- T0.2 : le ciblage vient de la fiche du sort, pas du rôle de l'unite ----------
const raceSpellOf = (E, nom) => {
  const s = E.DATA.grimoire.race.find((x) => x.nom === nom);
  return { name: s.nom, cost: s.cout, mult: s.mult, cat: 'race', ecole: s.ecole, role: s.role, cible: s.cible };
};
const boostUnit = (E, cardId, nom, uid) => E.makeUnit({ ...E.getCard(cardId), spells: [raceSpellOf(E, nom)] }, uid, 1);
const boostFoe = (E) => E.makeUnit(E.getCard('a1'), 'f1', 1);
const boostState = (team) => ({
  turn: 0, winner: null, rng: mulberry32(1),
  team: { avant: team, arriere: [] },
  enemies: { avant: [boostFoe(globalThis.__E)], arriere: [] },
  mods: {},
});

test('T0.2 repro : Discipline de Ligne (soi) aiguille le lanceur, pas un ennemi', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const disc = raceSpellOf(E, 'Discipline de Ligne');
  assert.equal(E.spellSideOf(disc), 'self', 'la fiche du sort dit "soi"');
  const u1 = boostUnit(E, 'n1', 'Discipline de Ligne', 'u1');
  const st = boostState([u1]);
  u1.mana = u1.manaMax = 10;
  E.beginRound(st);
  const foeHpBefore = st.enemies.avant[0].hp;
  const manaBefore = u1.mana;
  const r = E.stepRound(st, { kind: 'spell', idx: 0 });
  assert.ok((u1.atkBuff ?? 0) > 0, 'le lanceur reçoit le bonus');
  assert.equal(st.enemies.avant[0].hp, foeHpBefore, 'aucun dégât porté à l\u2019ennemi');
  assert.ok(u1.mana < manaBefore, 'le coût du sort est bien dépensé');
  assert.ok(r.events.some((e) => e.type === 'buff' && e.targetId === 'u1'), 'un événement buff est émis');
});

test('T0.2 : Ferveur Céleste (1 allié) aiguille l\u2019allié désigné par la fenêtre', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const ferveur = raceSpellOf(E, 'Ferveur Céleste');
  assert.equal(E.spellSideOf(ferveur), 'ally');
  const u1 = boostUnit(E, 'n14', 'Ferveur Céleste', 'u1');
  const u2 = boostUnit(E, 'n1', 'Discipline de Ligne', 'u2');
  const st = boostState([u1, u2]);
  u1.mana = u1.manaMax = 10; u2.mana = u2.manaMax = 10;
  u1.agi = 20; u2.agi = 10; // l'ordre du tour est maîtrisé : le Démon agit le premier
  E.beginRound(st);
  const foeHpBefore = st.enemies.avant[0].hp;
  const r = E.stepRound(st, { kind: 'spell', idx: 0, allyUid: 'u2' });
  assert.ok((u2.atkBuff ?? 0) > 0, 'l\u2019allié désigné reçoit le bonus');
  assert.equal(u1.atkBuff ?? 0, 0, 'le lanceur ne se buffe pas si l\u2019allié est désigné');
  assert.equal(st.enemies.avant[0].hp, foeHpBefore, 'aucun dégât en sneak');
  assert.ok(r.events.some((e) => e.type === 'buff' && e.targetId === 'u2'), 'un événement buff vers l\u2019allié');
});

test('T0.2 : en auto (sans pas tactique) le sort reste un coup sur l\u2019ennemi, digest inchangé', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const u1 = boostUnit(E, 'n1', 'Discipline de Ligne', 'u1');
  const st = boostState([u1]);
  u1.mana = 3; // juste assez pour le sort (3), pas pour une signature (5)
  E.beginRound(st);
  const foeHpBefore = st.enemies.avant[0].hp;
  E.stepRound(st, null);
  assert.ok(st.enemies.avant[0].hp < foeHpBefore, 'en auto le sort frappe l\u2019ennemi (chemin historique intact)');
  assert.equal(u1.atkBuff, 0, 'aucun buff posé en auto');
});

test('lot 3 : un sort tactique à fiche "zone" frappe 3 cibles contiguës autour de l’ancrage (ACC-C)', () => {
  // copie des données où la Lame d'Écume n'a que ses crans I et III remplis (max = 3)
    const dir = 'tests/fixtures/data-zone';
  rmSync(dir, { recursive: true, force: true });
  cpSync('data', dir, { recursive: true });
  const gri = JSON.parse(readFileSync(`${dir}/grimoire.json`, 'utf8'));
  const lame = gri.ecole.find((s) => s.id === 'morsure-decume');
  lame.crans.II.vide = true; lame.crans.II.raison = 'test'; lame.crans.IV.vide = true; lame.crans.IV.raison = 'test';
  writeFileSync(`${dir}/grimoire.json`, JSON.stringify(gri, null, 1) + '\n');
  const E = loadEngine(dir);
  E.setRoll(mulberry32(9));
  const team = { avant: [E.getCard('n1')], arriere: [E.getCard('n3')] };
  const foes = E.DATA.monsters.filter((m) => m.dungeon === 'marees').slice(0, 5);
  const st = E.initCombat(team, foes, 777, {});
  const u = st.team.avant[0];
  u.spells = [{ name: 'Lame d\u2019\u00c9cume', cost: 3, mult: 1.5 }];
  u.mana = 10; u.manaMax = 10; u.manaRegen = 2; u.agi = 999;
  assert.equal(E.largeurOfSpellName('Lame d\u2019\u00c9cume'), 3);
  const pre = E.beginRound(st);
  st._events = [...pre];
  const r = E.stepRound(st, { kind: 'spell', idx: 0, targetUid: 'e.a2' });
  const hits = r.events.filter((e) => (e.type === 'attack' || e.type === 'dodge') && typeof e.targetId === 'string' && e.targetId.startsWith('e.'));
  assert.equal(hits.length, 3, 'la zone touche 3 cibles contiguës');
  assert.deepEqual(hits.map((h) => h.targetId).sort(), ['e.a0', 'e.a1', 'e.a2'], 'zone de 3 dans la ligne avant (ancre e.a2)');
  rmSync(dir, { recursive: true, force: true });
});

test('lot 3 : un sort à fiche "tous" touche toute la ligne sans désignation (ACC-C)', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(9));
  const team = { avant: [E.getCard('n1')], arriere: [] };
  const foes = E.DATA.monsters.filter((m) => m.dungeon === 'marees' && m.classe !== 'Assassin').slice(0, 4);
  const st = E.initCombat(team, foes, 778, {});
  const u = st.team.avant[0];
  u.spells = [{ name: 'Hurlement', cost: 3, mult: 1.5 }]; // cran IV = tous (5)
  u.mana = 10; u.manaMax = 10; u.manaRegen = 2; u.agi = 999;
  assert.equal(E.largeurOfSpellName('Hurlement'), 5);
  E.beginRound(st);
  const r = E.stepRound(st, { kind: 'spell', idx: 0 }); // aucune cible désignée
  const hits = r.events.filter((e) => (e.type === 'attack' || e.type === 'dodge') && typeof e.targetId === 'string' && e.targetId.startsWith('e.'));
  assert.equal(hits.length, 4, 'toute la ligne est touchée');
});

// ---------- retour terrain (10/11) : la ligne support frappe aussi ----------
const foeUnit = (E, uid = 'f1') => E.makeUnit(E.getCard('a1'), uid, 1);
const supportUnit = (E, cardId, spells, uid = 's1') => E.makeUnit({ ...E.getCard(cardId), spells }, uid, 1);
const supportState = (sup, allies, foes) => ({
  turn: 0, winner: null, rng: mulberry32(1),
  team: { avant: allies, arriere: [sup] },
  enemies: { avant: foes, arriere: [] },
  mods: {},
});
const raceFiche = (E, nom) => {
  const s = E.DATA.grimoire.race.find((x) => x.nom === nom);
  return { name: s.nom, cost: s.cout, mult: s.mult, cat: 'race', role: s.role, cible: s.cible };
};

test("retour terrain : la frappe simple d'un support désigne et frappe l'ennemi choisi", () => {
  const E = loadEngine();
  globalThis.__E = E;
  const sup = supportUnit(E, 's2', []);
  const ally = E.makeUnit(E.getCard('a1'), 'ally1', 1);
  const foe = foeUnit(E);
  sup.agi = 99; ally.agi = 1; foe.agi = 50; // le support agit le premier, pas d'esquive possible
  const st = supportState(sup, [ally], [foe]);
  E.beginRound(st);
  const hpAvant = foe.hp;
  const r = E.stepRound(st, { kind: 'attack', targetUid: 'f1' });
  assert.ok(foe.hp < hpAvant, "l'ennemi désigné encaisse la frappe simple du support");
  assert.ok(r.events.some((e) => e.type === 'attack' && e.targetId === 'f1' && e.kind === 'basic'), 'un événement attaque basique est émis');
});

test('retour terrain : sans désignation, la frappe simple du support vise le plus faible', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const sup = supportUnit(E, 's2', []);
  const ally = E.makeUnit(E.getCard('a1'), 'ally1', 1);
  const f1 = foeUnit(E, 'f1');
  const f2 = foeUnit(E, 'f2');
  f2.hp = 10; // le plus faible
  sup.agi = 99; ally.agi = 1; f1.agi = 50; f2.agi = 50;
  const st = supportState(sup, [ally], [f1, f2]);
  E.beginRound(st);
  const hp1 = f1.hp; const hp2 = f2.hp;
  E.stepRound(st, { kind: 'attack' });
  assert.ok(f2.hp < hp2, 'le plus faible encaisse la frappe');
  assert.equal(f1.hp, hp1, "le fort n'est pas touché sans désignation");
});

test("retour terrain : Instinct Sauvage lancé depuis la ligne support frappe l'ennemi (tactique)", () => {
  const E = loadEngine();
  globalThis.__E = E;
  const instinct = raceFiche(E, 'Instinct Sauvage');
  assert.equal(E.spellSideOf(instinct), 'enemy', 'la fiche du sort dit ennemi');
  assert.ok(E.foeFacingSpell(instinct), 'foeFacingSpell le reconnaît');
  const sup = supportUnit(E, 's2', [instinct]);
  sup.mana = sup.manaMax = 10;
  const ally = E.makeUnit(E.getCard('a1'), 'ally1', 1);
  const foe = foeUnit(E);
  sup.agi = 99; ally.agi = 1; foe.agi = 50;
  const st = supportState(sup, [ally], [foe]);
  E.beginRound(st);
  const hpAvant = foe.hp;
  const r = E.stepRound(st, { kind: 'cast', idx: 0, targetUid: 'f1' });
  assert.ok(foe.hp < hpAvant, "le sort de dégâts frappe l'ennemi depuis la ligne support");
  assert.equal(sup.mana, 10 - instinct.cost, 'le coût du sort est dépensé');
  assert.ok(r.events.some((e) => e.type === 'cast' && e.name === 'Instinct Sauvage'), 'un événement cast est émis');
  assert.ok(r.events.some((e) => e.type === 'attack' && e.targetId === 'f1' && e.kind === 'special'), 'un événement attaque du sort est émis');
});

test('retour terrain : en auto, le sort hostile du support frappe aussi (fin des soins fantômes)', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const sup = supportUnit(E, 's2', [raceFiche(E, 'Instinct Sauvage')]);
  sup.mana = sup.manaMax = 10;
  const ally = E.makeUnit(E.getCard('a1'), 'ally1', 1);
  const foe = foeUnit(E);
  sup.agi = 99; ally.agi = 1; foe.agi = 50;
  const st = supportState(sup, [ally], [foe]);
  E.beginRound(st);
  const hpAvant = foe.hp;
  const hpAlly = ally.hp;
  E.stepRound(st, null);
  assert.ok(foe.hp < hpAvant, 'en auto le sort hostile frappe l’ennemi');
  assert.equal(ally.hp, hpAlly, 'plus de soin fantôme via l’effet de carte');
});

test('retour terrain : en auto, un sort allié du support soigne toujours (chemin allié intact)', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const onde = {
    name: 'Onde Consacrée', cost: 3, mult: 1.3, cat: 'classe',
    role: 'soin', cible: 'l\u2019\u00e9quipe',
  };
  assert.ok(!E.foeFacingSpell(onde), 'un sort de soin reste allié');
  const sup = supportUnit(E, 's2', [onde]);
  sup.mana = sup.manaMax = 10;
  const ally = E.makeUnit(E.getCard('a1'), 'ally1', 1);
  ally.hp = 5;
  const foe = foeUnit(E);
  sup.agi = 99; ally.agi = 1; foe.agi = 50;
  const st = supportState(sup, [ally], [foe]);
  E.beginRound(st);
  const hpFoe = foe.hp;
  E.stepRound(st, null);
  assert.ok(ally.hp > 5, 'l’allié blessé est soigné');
  assert.equal(foe.hp, hpFoe, 'aucun dégât au sort de soin');
});

test('retour terrain : castFoeSpell applique les dégâts puis le stun de la fiche (taux contre seuil)', () => {
  const E = loadEngine();
  const sup = supportUnit(E, 's2', []);
  const foe = foeUnit(E);
  foe.int = 0; foe.agi = 99; foe.rarity = 'C'; // seuil réduit au palier, pas d'esquive
  const events = [];
  const st = { turn: 1, winner: null, rng: mulberry32(7), team: { avant: [], arriere: [sup] }, enemies: { avant: [foe], arriere: [] }, mods: {} };
  E.castFoeSpell(sup, { name: 'Mélodie envoûtante', cost: 3, mult: 1.2, taux: 0.25, tours: 1, role: 'controle', cible: '1 ennemi', largeur: 1 }, [foe], {}, events, 'team', st, null);
  assert.ok(foe.hp < foe.maxHp, 'les dégâts de la fiche passent');
  assert.ok((foe.status.stun ?? 0) >= 1, 'le stun passe quand le taux dépasse le seuil');
  assert.ok(events.some((e) => e.type === 'status' && e.kind === 'stun'), 'un événement stun est émis');
});

test('boucle v2 lot 1 : drinkPotion soigne (PV %) et recharge (mana %), plafonné au max', () => {
  const E = loadEngine();
  const u = E.makeUnit(E.getCard('n1'), 'u1', 5);
  u.hp = 3;
  u.mana = 0;
  const soin = E.DATA.potions.soin30;
  const mana = E.DATA.potions.mana40;
  const ev1 = E.drinkPotion(u, soin);
  assert.equal(u.hp, Math.min(u.maxHp, 3 + Math.max(1, Math.round(u.maxHp * soin.pct))), 'soin = 30 % des PV max');
  assert.ok(ev1.some((e) => e.type === 'heal' && e.potion === 'soin30'));
  const ev2 = E.drinkPotion(u, mana);
  assert.equal(u.mana, Math.max(1, Math.round(u.manaMax * mana.pct)), 'mana = 40 % du mana max');
  assert.ok(ev2.some((e) => e.type === 'buff' && e.value === 'mana'));
  // plafonds : boire quand presque plein ne dépasse pas le max
  u.hp = u.maxHp - 1;
  u.mana = u.manaMax - 1;
  E.drinkPotion(u, soin);
  E.drinkPotion(u, mana);
  assert.equal(u.hp, u.maxHp);
  assert.equal(u.mana, u.manaMax);
  // unité KO ou potion nulle : aucun effet
  u.alive = false;
  assert.deepEqual(E.drinkPotion(u, soin), []);
  assert.deepEqual(E.drinkPotion(E.makeUnit(E.getCard('n1'), 'u2', 1), null), []);
});

test('boucle v2 lot 1 : action Objet en combat — la gorgée coûte le tour (strike et support)', () => {
  const E = loadEngine();
  const mk = (id, lvl) => ({ ...E.getCard(id), level: lvl });
  const team = { avant: [mk('n1', 5)], arriere: [mk('n3', 5)] };
  const wave = E.makeWave(42, 1, 'marees', 1);
  const st = E.initCombat(team, wave, 42);
  const u = st.team.avant[0];
  u.hp = 2;
  u.status = {};
  E.beginRound(st);
  // on force l'acteur courant sur notre unité
  while (E.peekRound(st) && E.peekRound(st).u.uid !== u.uid) E.stepRound(st, null);
  const potion = E.DATA.potions.soin60;
  const r = E.stepRound(st, { kind: 'item', potion });
  assert.ok(r.events.some((e) => e.type === 'heal' && e.potion === 'soin60'), 'événement de soin émis');
  assert.ok(u.hp > 2, 'l’unité a bu et regagné des PV');
  assert.ok(!r.done || st.winner, 'le tour est consommé comme une action');
});

test('boucle v2 lot 2 : niveaux de donjon 1 → 25, un par marche (donjon × mode)', () => {
  const E = loadEngine();
  const seen = new Set();
  for (const d of E.DATA.dungeons) {
    for (const df of E.DATA.difficulties) {
      const lv = E.dungeonLevelOf(d.id, df.id);
      assert.ok(lv >= 1 && lv <= 25, `niveau ${lv} dans 1..25`);
      assert.ok(!seen.has(lv), `niveau ${lv} unique (marche ${d.id} × ${df.name})`);
      seen.add(lv);
    }
  }
  assert.equal(seen.size, 25, '25 marches');
  assert.equal(E.dungeonLevelOf('marees', 1), 1);
  assert.equal(E.dungeonLevelOf('zenith', 5), 25);
});

test('boucle v2 lot 2 : les vagues suivent la bande de rareté de la marche, boss haut de bande', () => {
  const E = loadEngine();
  const R = E.DATA.engine.RANK;
  for (const df of E.DATA.difficulties) {
    const [b0, b1] = E.bandOf(df.id);
    for (const stage of [1, 3, 7]) {
      const w = E.makeWave(1234, stage, 'zenith', df.id);
      for (const u of [...w.avant, ...w.arriere]) {
        if (u.boss) continue;
        assert.ok(R[u.rarity] >= R[b0] - 0, `monstre ${u.id} ${u.rarity} >= ${b0} (diff ${df.id})`);
        assert.ok(R[u.rarity] <= R[b1] + 1, `monstre ${u.id} ${u.rarity} <= ${b1} (diff ${df.id})`);
      }
    }
    const w5 = E.makeWave(99, 5, 'marees', df.id);
    const boss5 = w5.avant.find((u) => u.boss);
    assert.equal(boss5.rarity, df.boss5, `boss5 = ${df.boss5} en diff ${df.id}`);
    const w10 = E.makeWave(99, 10, 'marees', df.id);
    const boss10 = w10.avant.find((u) => u.boss);
    assert.equal(boss10.rarity, df.boss10, `boss10 = haut de bande ${df.boss10} en diff ${df.id}`);
  }
});

test('boucle v2 lot 3 : recrutableMonsters exclut boss et nommés (nom « prénom, titre »)', () => {
  const E = loadEngine();
  const w = E.makeWave(77, 10, 'marees', 1); // étage 10 = boss final
  const st = E.initCombat({ avant: [{ ...E.getCard('n1'), level: 20 }], arriere: [] }, w, 77);
  const elig = E.recrutableMonsters(st);
  assert.ok(elig.length > 0, 'des vaincus sont éligibles');
  assert.ok(elig.every((u) => !u.boss), 'aucun boss éligible');
  assert.ok(elig.every((u) => !u.name.includes(',')), 'aucun nommé éligible');
  // un nommé présent dans la vague n'est pas éligible
  const w2 = { avant: [{ ...E.getMonster('e13') }], arriere: [] };
  const st2 = E.initCombat({ avant: [{ ...E.getCard('n1'), level: 20 }], arriere: [] }, w2, 5);
  assert.equal(E.recrutableMonsters(st2).length, 0, 'e13 (nommé) exclu');
});

test('boucle v2 lot 4 : makeUnit applique les bonus d\'équipement en % (stats de base) + régén mana', () => {
  const E = loadEngine();
  const base = E.makeUnit(E.getCard('n1'), 'u1', 10);
  const withEq = E.makeUnit({ ...E.getCard('n1'), level: 10, equip: { atkPct: 0.15, hpPct: 0.25, agiPct: 0.10, intPct: 0, manaRegen: 2 } }, 'u2', 10);
  assert.ok(withEq.atk > base.atk, 'ATQ boostée');
  assert.ok(withEq.maxHp > base.maxHp, 'PV boostés');
  assert.ok(withEq.agi > base.agi, 'AGI boostée');
  assert.equal(withEq.manaRegen, base.manaRegen + 2, 'régén mana du talisman ajoutée');
  assert.equal(Math.round(base.atk * 1.15), withEq.atk, 'bonus appliqué sur la stat de base (arrondi)');
});

test('boucle v2 lot 5 : courbe XP échelle longue — xpToNext croît avec le niveau (données XP_GROWTH)', () => {
  const E = loadEngine();
  const g = E.DATA.engine.moteur.XP_GROWTH;
  assert.ok(g > 0, 'XP_GROWTH en data');
  const xp = (lvl) => Math.max(1, Math.round(lvl * (1 + g * (lvl - 1))));
  assert.equal(xp(1), 1);
  assert.ok(xp(10) > xp(5) && xp(5) > xp(2) && xp(2) > xp(1), 'strictement croissante');
  assert.ok(xp(19) >= 4 * 19, 'les hauts niveaux demandent bien plus (échelle longue 25 marches)');
});
