import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';

// correctifs v1.37 lot 6 : sorts signature (cat 'unique') — rôle/cible dérivés des data,
// couverture 100 % ; le ciblage suit la fiche ; le comportement Auto (digest) est inchangé.

const HOSTILE = new Set(['degats', 'controle', 'malus']);

function allSignatureDefs(E) {
  const cards = (E.DATA.cards ?? []).filter((c) => c.soloSpell);
  const mons = (E.DATA.monsters ?? []).filter((m) => m.soloSpell);
  return [...cards, ...mons];
}

test('v1.37 lot 6 (a) : 100 % des sorts signature (cartes + monstres) ont spellSideOf(sort) != null', () => {
  const E = loadEngine();
  const defs = allSignatureDefs(E);
  assert.ok(defs.length > 200, `au moins 200 signatures en data (${defs.length})`);
  for (const def of defs) {
    const meta = E.signatureMetaOf(def);
    const sort = { name: def.soloSpell, cost: def.soloCost ?? 3, mult: def.soloMult ?? 1.5, ...(def.soloDot ? { dot: def.soloDot } : {}), ...meta, cat: 'unique' };
    const side = E.spellSideOf(sort);
    assert.notEqual(side, null, `signature de ${def.id} (${def.soloSpell}) : cible=${meta.cible} role=${meta.role}`);
    assert.ok(meta.role, `signature de ${def.id} : rôle dérivé présent`);
  }
});

test('v1.37 lot 6 (b) : un sort de rôle dégâts/contrôle/malus ne propose jamais de cible alliée (assertion structurelle)', () => {
  const E = loadEngine();
  for (const def of allSignatureDefs(E)) {
    const meta = E.signatureMetaOf(def);
    if (!HOSTILE.has(meta.role)) continue;
    const side = E.spellSideOf({ ...meta });
    assert.ok(side === 'enemy' || side === 'zone' || side === 'all', `${def.id} (${meta.role}) -> camp ${side}`);
  }
});

test('v1.37 lot 6 (c) : le comportement Auto est inchangé — objets runtime sans rôle/cible, métadonnée réservée à la désignation', () => {
  const E = loadEngine();
  // les objets construits pour le moteur ne portent PAS role/cible (sinon le digest bougerait)
  // EXCEPTION consignée (correctifs v1.51 lot 1, digest re-MESURÉ et consigné dans arbitrages) :
  // les signatures des monstres SOIGNEURS portent role soin + cible allié — c'est précisément
  // le correctif (la signature partait en dégâts par défaut en Auto).
  for (const m of E.allMonsters()) {
    for (const sp of m.spells ?? []) {
      if (sp.cat !== 'unique') continue;
      if (m.effect && m.effect.kind === 'heal') {
        assert.equal(sp.role, 'soin', `runtime ${m.id} : signature de soigneur = soin`);
        assert.equal(sp.cible, '1 allié');
        continue;
      }
      assert.equal(sp.role, undefined, `runtime ${m.id} : pas de role embarqué`);
      assert.equal(sp.cible, undefined, `runtime ${m.id} : pas de cible embarquée`);
      assert.equal(E.spellSideOf(sp), null, 'spellSideOf null sur l\u2019objet runtime (Auto inchangé hors soigneurs)');
    }
  }
  // mais la métadonnée dérivée existe pour la désignation Tactique
  const ass = E.DATA.monsters.find((m) => m.classe === 'Assassin' && m.dungeon === 'marees');
  const meta = E.signatureMetaOf(ass);
  assert.ok(E.spellSideOf({ cat: 'unique', ...meta }) !== null);
});

// ---------- correctifs v1.51 lot 1 : les signatures des cartes/monstres SOIGNEURS sont des soins ----------
test('v1.51 lot 1 (a) : signatureMetaOf d\u2019une carte soigeuse = soin/1 allié, même avec soloMult', () => {
  const E = loadEngine();
  const healDefs = E.DATA.cards.filter((c) => c.soloSpell && c.effect && c.effect.kind === 'heal');
  assert.ok(healDefs.length >= 14, `${healDefs.length} cartes soigeuses avec signature`);
  const avecMult = healDefs.filter((c) => c.soloMult != null);
  assert.ok(avecMult.length > 0, 'au moins une carte soigeuse a un soloMult (cas piège du défaut dégâts)');
  for (const def of healDefs) {
    const meta = E.signatureMetaOf(def);
    assert.equal(meta.role, 'soin', `${def.id} (${def.soloSpell}) : rôle soin`);
    assert.equal(meta.cible, '1 allié');
    assert.equal(E.spellSideOf({ cat: 'unique', ...meta }), 'ally');
  }
});

test('v1.51 lot 1 (b) : les monstres soigneurs embarquent role soin sur leur signature runtime', () => {
  const E = loadEngine();
  const healMons = E.allMonsters().filter((m) => m.effect && m.effect.kind === 'heal' && m.soloSpell);
  assert.ok(healMons.length >= 14, `${healMons.length} monstres soigneurs`);
  for (const m of healMons) {
    const sig = (m.spells ?? []).find((sp) => sp.cat === 'unique');
    assert.equal(sig.role, 'soin', `${m.id} : signature runtime = soin`);
    assert.equal(E.spellSideOf(sig), 'ally');
  }
});

test('v1.51 lot 1 (c) : en Auto, la signature de soin d\u2019une carte soigneuse soigne le plus blessé (plus d\u2019attaque)', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(3));
  const healer = E.makeUnit({ ...E.getCard('n3'), spells: [{ name: 'Bénédiction Modeste', cost: 2, mult: 1.85, role: 'soin', cible: '1 allié', cat: 'unique' }] }, 'u1', 1);
  healer.mana = healer.manaMax = 10; healer.manaRegen = 0;
  const mate = E.makeUnit(E.getCard('n1'), 'u2', 1);
  const team = { avant: [healer, mate], arriere: [] };
  const foes = E.DATA.monsters.filter((m) => m.dungeon === 'marees').slice(0, 2);
  const st = E.initCombat(team, foes, 99, {});
  for (const f of [...st.enemies.avant, ...st.enemies.arriere]) { f.atk = 0; f.int = 0; f.spells = []; } // ennemis inoffensifs (correctifs-eq v2 lot 1 : les sorts des Mages montent avec l'INT)
  st.team.avant[1].hp = Math.max(1, Math.round(st.team.avant[1].maxHp * 0.2));
  const log = E.playAuto(st, 1);
  const heals = log.filter((e) => e.type === 'heal' && e.sourceId === st.team.avant[0].uid && e.targetId === st.team.avant[1].uid);
  assert.ok(heals.length > 0 && heals[0].amount >= 1, 'événement heal de la signature sur l\u2019allié le plus blessé');
  assert.equal(log.find((e) => e.type === 'attack' && e.sourceId === st.team.avant[0].uid), undefined, 'la signature ne produit aucune attaque');
});

test('v1.51 lot 1 (d) : symétrie — un monstre soigneur ennemi en ligne avant soigne son camp en Auto', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(4));
  const team = { avant: [E.makeUnit(E.getCard('n1'), 'u1', 1)], arriere: [] };
  const foes = [E.DATA.monsters.find((m) => m.id === 'e7')];
  const st = E.initCombat(team, foes, 100, {});
  const foe = st.enemies.avant[0];
  foe.spells = [{ name: foe.spells.find((s) => s.cat === 'unique')?.name ?? 'Signature', cost: 2, mult: 1.5, role: 'soin', cible: '1 allié', cat: 'unique' }];
  foe.mana = foe.manaMax = 10; foe.manaRegen = 0;
  foe.hp = Math.max(1, Math.round(foe.maxHp * 0.2));
  const log = E.playAuto(st, 1);
  const heals = log.filter((e) => e.type === 'heal' && e.side === 'enemies' && e.sourceId === foe.uid && e.targetId === foe.uid);
  assert.ok(heals.length > 0 && heals[0].amount >= 1, 'l\u2019ennemi soigneur produit un heal sur lui-même (le plus blessé de son camp)');
  assert.equal(log.find((e) => e.type === 'attack' && e.sourceId === foe.uid && e.side === 'enemies'), undefined, 'pas d\u2019attaque de la signature ennemie');
  // en Auto (pas d'action), applySupport ne route pas la signature vers les ennemis : source vérifiée
  const src = readFileSync('src/engine/spells.js', 'utf8');
  assert.ok(/spell\.cat === 'unique' && action/.test(src), 'la branche signature n\u2019est active qu\u2019avec une action (Tactique)');
});

test('v1.37 lot 6 (d) : la source UI fait suivre le ciblage à la fiche dérivée (plus de liste d\u2019alliés pour un sort de dégâts)', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/spellSideOf\(sp\) \?\? spellSideOf\(uiSpellMeta\(sp, byIdSoft\(u\.cardId\)\)\)/.test(src), 'bindActionButtons : camp depuis la fiche signature');
  assert.ok(/function uiSpellMeta\(sp, ownerDef\)/.test(src), 'helper uiSpellMeta présent');
  assert.ok((src.match(/uiSpellMeta\(/g) ?? []).length >= 5, 'uiSpellMeta utilisé dans les fiches et la fenêtre d\u2019action');
});
