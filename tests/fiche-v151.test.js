import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// correctifs v1.51 lot 2 (UI) : fiche unifiée, badge élément réparé, splash Mage explicite, cartes combat plus grandes

test('v1.51 lot 2 (a) : une seule fonction de rendu de fiche (ficheCoreHtml) utilisée menu équipe ET combat', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/function ficheCoreHtml\(card,/.test(src), 'ficheCoreHtml présente');
  const iModal = src.indexOf('function renderCardModal');
  const iUnit = src.indexOf('function openUnitModal');
  assert.ok(iModal > 0 && iUnit > 0);
  assert.ok(src.slice(iModal, iUnit).includes('ficheCoreHtml(card,'), 'renderCardModal (menu équipe) passe par ficheCoreHtml');
  assert.ok(src.slice(iUnit).includes('ficheCoreHtml(card,'), 'openUnitModal (combat) passe par ficheCoreHtml');
  // plus de hero plein cadre tronqué en combat (illustration contenue, même rendu que le menu)
  assert.ok(!src.slice(iUnit).includes('modal-hero full'), 'openUnitModal : plus de .modal-hero.full');
});

test('v1.51 lot 2 (b) : badge élément des sorts interpolé (${EL_GLYPH[el] ?? \'\'})', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(src.includes('${EL_GLYPH[el] ?? \'\'}'), 'badge élément interpolé');
  assert.ok(!src.includes('(EL_GLYPH[el] ?? \'\') ${el}'), 'plus de chaîne hors interpolation');
});

test('v1.51 lot 2 (c) : la fiche unifiée explicite la frappe de classe (splash Mage, wave Occultiste)', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/cm\.splash/.test(src) && /éclats à/.test(src), 'splash Mage : cible + éclats en % sur les autres');
  assert.ok(/cm\.wave/.test(src) && /toute la ligne/.test(src), 'wave Occultiste : frappe de zone explicitée');
  assert.ok(/CLASSE_MODS\[card\?\.classe\]/.test(src), 'stats de classe depuis la data');
});

test('v1.51 lot 2 (d) : cartes de combat plus grandes (point 9) dans le shell', () => {
  const shell = readFileSync('src/shell.html', 'utf8');
  // correctifs v4 (3e retour terrain : tout tient sur l'écran) : grand format borné par min(largeur, hauteur), boss ~1,4x
  assert.ok(shell.includes('clamp(92px, min(28vw, 11dvh), 124px)'), 'unités combat >= 92px, bornées par la hauteur');
  assert.ok(shell.includes('clamp(129px, min(39vw, 15.5dvh), 174px)'), 'boss combat ~1,4x, borné par la hauteur');
});
