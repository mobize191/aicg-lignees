import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  for (const m of E.allMonsters()) {
    for (const sp of m.spells ?? []) {
      if (sp.cat !== 'unique') continue;
      assert.equal(sp.role, undefined, `runtime ${m.id} : pas de role embarqué`);
      assert.equal(sp.cible, undefined, `runtime ${m.id} : pas de cible embarquée`);
      assert.equal(E.spellSideOf(sp), null, 'spellSideOf null sur l\u2019objet runtime (Auto inchangé)');
    }
  }
  // mais la métadonnée dérivée existe pour la désignation Tactique
  const ass = E.DATA.monsters.find((m) => m.classe === 'Assassin' && m.dungeon === 'marees');
  const meta = E.signatureMetaOf(ass);
  assert.ok(E.spellSideOf({ cat: 'unique', ...meta }) !== null);
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
