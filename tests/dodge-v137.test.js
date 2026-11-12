import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEngine } from './helpers/load.mjs';

// correctifs v1.37 lot 5 : esquive visible (événement dodge avec sourceId) + dégâts de frappe expliqués (CLASSE_MODS.strike en data)

test('v1.37 lot 5 (a) : attaque déterministe contre un Assassin -> événement dodge + 0 dégât, avec sourceId', () => {
  const E = loadEngine();
  const team = { avant: [E.getCard('n1')], arriere: [] };
  const assassin = E.DATA.monsters.find((m) => m.classe === 'Assassin' && m.dungeon === 'marees');
  assert.ok(assassin, 'un monstre Assassin existe dans les Marées');
  const st = E.initCombat(team, [assassin], 424242, {});
  st.rng = () => 0; // seed fixe : tout jet < seuil réussit -> esquive forcée
  const u = st.team.avant[0];
  u.agi = 999; // l'attaquant joue en premier
  const tgt = [...st.enemies.avant, ...st.enemies.arriere].find((e) => e.alive);
  const hp0 = tgt.hp;
  E.beginRound(st);
  const r = E.stepRound(st, { kind: 'attack', targetUid: tgt.uid });
  const dodges = r.events.filter((e) => e.type === 'dodge');
  const atks = r.events.filter((e) => e.type === 'attack' && e.targetId === tgt.uid);
  assert.equal(dodges.length, 1, 'un événement dodge (déterministe)');
  assert.equal(dodges[0].side, 'enemies', 'esquive d\u2019un ennemi par l\u2019équipe');
  assert.equal(dodges[0].sourceId, u.uid, 'l\u2019événement dodge porte l\u2019attaquant (pour le journal)');
  assert.equal(dodges[0].targetId, tgt.uid);
  assert.equal(atks.length, 0, 'aucun événement attack sur la cible');
  assert.equal(tgt.hp, hp0, '0 dégât : PV inchangés');
});

test('v1.37 lot 5 (b) : CLASSE_MODS.strike existe pour toutes les classes en data (0 < strike <= 1)', () => {
  const E = loadEngine();
  const classes = E.DATA.engine.CLASSES;
  assert.ok(Array.isArray(classes) && classes.length >= 5, 'liste des classes en data');
  for (const c of classes) {
    const m = E.DATA.engine.CLASSE_MODS[c];
    assert.ok(m && Number.isFinite(m.strike), `strike défini pour ${c}`);
    assert.ok(m.strike > 0 && m.strike <= 1, `strike dans ]0,1] pour ${c} (${m.strike})`);
  }
  // toutes les classes réellement utilisées (cartes + monstres) ont un strike
  const used = new Set([
    ...(E.DATA.cards ?? E.CATALOG ?? []).map((c) => c.classe),
    ...(E.DATA.monsters ?? []).map((m) => m.classe),
  ]);
  for (const c of used) {
    assert.ok(c && Number.isFinite(E.DATA.engine.CLASSE_MODS[c]?.strike), `classe utilisée ${c} couverte par CLASSE_MODS.strike`);
  }
  // le cas terrain : Prêtre frappe à 70 %
  assert.equal(E.DATA.engine.CLASSE_MODS['Prêtre'].strike, 0.7, 'Prêtre = 0,7 (cas « 5 au lieu de 7 » du 8e tour)');
});

test('v1.37 lot 5 (c) : la source UI affiche le feedback esquive (floatText + journal + pose) et la frappe expliquée', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/floatText\(el, '[^']*Esquivé !', 'dodge fx-special'\)/.test(src), 'floatText « Esquivé ! » proéminent');
  assert.ok(/logline dodge/.test(src) && /esquive/.test(src), 'ligne de journal à l\u2019esquive');
  assert.ok(/dodge-pose/.test(src), 'pose d\u2019esquive du pion');
  assert.ok(/frappe de \$\{u\.classe\} (?:\\u00e0|à) \$\{strikePct\} %/.test(src), 'fenêtre d\u2019action : dégâts effectifs + % de frappe de classe');
  assert.ok(/frappe de \$\{card\.classe\} (?:\\u00e0|à) \$\{Math\.round\(\(CLASSE_MODS\[card\.classe\]\?\.strike/.test(src), 'fiche carte : % de frappe de la classe');
  const shell = readFileSync('src/shell.html', 'utf8');
  assert.ok(/\.float\.dodge/.test(shell) && /@keyframes dodgePose/.test(shell), 'CSS du feedback esquive présent dans le dist');
});
