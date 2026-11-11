import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData, loadEngine } from './helpers/load.mjs';
test('les donnees se chargent et passent le validateur (ACC-0-3)', () => {
  const E = loadEngine();
  assert.deepEqual(E.errors, []);
});
test('les cartes connues sont presentes (e13, d18, n15)', () => {
  const data = loadData();
  assert.ok(data.monsters.find((m) => m.id === 'e13'));
  assert.ok(data.monsters.find((m) => m.id === 'd18'));
  assert.ok(data.cards.find((c) => c.id === 'n15'));
});
test('le rang N : les 12 naissances sont N, les 3 divines restent C (EXI-P1-1)', () => {
  const data = loadData();
  const naiss = data.cards.filter((c) => c.raciale);
  const idsN = naiss.filter((c) => c.rarity === 'N').map((c) => c.id).sort();
  assert.deepEqual(idsN, ['n1', 'n10', 'n11', 'n12', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9']);
  const idsC = naiss.filter((c) => c.rarity === 'C' && !c.archived).map((c) => c.id).sort();
  assert.deepEqual(idsC, ['n13', 'n14', 'n15']);
  assert.ok(naiss.every((c) => c.rarity !== 'N' || (!c.family && !c.dungeon)), 'une naissance N est hors lignee');
  assert.equal(data.cards.filter((c) => c.rarity === 'N' && !c.raciale).length, 0, 'le rang N reste reserve aux naissances');
});
test('le rang N : aucune famille de lignee ne contient une naissance (EXI-P1-1)', () => {
  const data = loadData();
  const idsN = new Set(data.cards.filter((c) => c.rarity === 'N').map((c) => c.id));
  for (const f of Object.values(data.families)) {
    for (const step of [...(f.steps ?? []), ...(f.future ?? [])]) {
      assert.ok(!idsN.has(step), `la famille ${f.name} reference la naissance ${step}`);
    }
  }
});
test('le rang N : le moteur le connait, moins fort que la commune, avec un cout d eveil (EXI-P1-1)', () => {
  const data = loadData();
  const E = data.engine;
  assert.equal(E.RARITY_LABEL.N, 'Naissance');
  assert.ok(E.RARITY_POWER.N < E.RARITY_POWER.C, 'la naissance est moins puissante que la commune');
  assert.ok(E.RANK.N < E.RANK.C, 'la naissance est un rang sous la commune');
  assert.ok(E.EVEIL_COST >= 1, 'le cout en pierres d eveil existe (EVEIL_COST)');
  assert.ok(!E.EVO_COST.N, 'le rang N ne paie plus en eclats : son eveil consomme des pierres');
});
test('le rang N : les 5 Embryons (ex-Bestiau) portent leurs nouveaux noms (renommage v15)', () => {
  const data = loadData();
  const byId = (id) => data.cards.find((c) => c.id === id);
  assert.equal(byId('n5').name, 'Embryon des Eaux');
  assert.equal(byId('n6').name, 'Embryon des Flammes');
  assert.equal(byId('n7').name, 'Embryon du Vivant');
  assert.equal(byId('n8').name, 'Embryon des Ténèbres');
  assert.equal(byId('n9').name, 'Embryon des Cieux');
});
test('contenu v3 lot C2 — Sirènes des Récifs : 13e famille de monstres, 8 cartes C→L, 2 voies, L Méliane/Thalassa, pas de M, vagues + errance', () => {
  const data = loadData();
  const ids = ['e23', 'e24', 'e25', 'e26', 'e27', 'e28', 'e29', 'e30'];
  const sirenes = ids.map((id) => data.monsters.find((m) => m.id === id));
  assert.ok(sirenes.every(Boolean), 'les 8 cartes existent');
  assert.ok(sirenes.every((m) => m.dungeon === 'marees'), 'foyer aux Marées (pool des vagues)');
  assert.deepEqual(sirenes.map((m) => m.rarity), ['C', 'UC', 'R', 'SR', 'UR', 'L', 'UR', 'L'], 'tronc C→SR puis 2 voies UR→L (Chant et Récifs)');
  const nommees = sirenes.filter((m) => (m.name ?? '').includes(',')).map((m) => m.name).sort();
  assert.deepEqual(nommees, ['Méliane, Voix du Large', 'Thalassa, Reine des Récifs'], 'L Méliane et L Thalassa');
  assert.ok(!sirenes.some((m) => m.rarity === 'M'), 'pas de M sirène');
  const fam = (data['monster-families'].marees ?? []).find((f) => f.name === 'Sirènes des Récifs');
  assert.ok(fam && [...fam.lines.flat(), ...(fam.side ?? [])].sort().join() === [...ids].sort().join(), 'famille déclarée dans le bestiaire des Marées');
  const zone = data.zones.find((z) => z.id === 'zone-marees');
  assert.ok(ids.every((id) => zone.rencontres.includes(id)), 'intégrées aux rencontres d’errance de la zone Marées');
  const sig = data['fusion-map'].marees.signatures;
  assert.ok(ids.every((id) => sig[id]), 'signatures de fusion couvertes (biome trié)');
});
test('contenu v3 lot C3 — gobelins régionaux : foyer Marées, variantes 2 cartes par région (Forge/Bosquet/Crypte/Zénith), pas de M', () => {
  const data = loadData();
  const variantes = {
    forge: ['f2', 'f24'],
    bosquet: ['g31', 'g32'],
    crypte: ['k31', 'k32'],
    zenith: ['z31', 'z32'],
  };
  for (const [dj, ids] of Object.entries(variantes)) {
    const mobs = ids.map((id) => data.monsters.find((m) => m.id === id));
    assert.ok(mobs.every(Boolean), `${dj} : variantes présentes`);
    assert.ok(mobs.every((m) => m.dungeon === dj), `${dj} : variantes du bon donjon`);
    assert.deepEqual(mobs.map((m) => m.rarity), ['C', 'UC'], `${dj} : 2 cartes C/UC`);
    assert.ok(mobs.every((m) => !(m.name ?? '').includes(',') && m.rarity !== 'M'), `${dj} : pas de nommé ni de M`);
    const zone = data.zones.find((z) => z.id === 'zone-' + dj);
    assert.ok(ids.every((id) => zone.rencontres.includes(id)), `${dj} : variantes dans l'errance`);
    const sig = data['fusion-map'][dj].signatures;
    assert.ok(ids.every((id) => sig[id] && !data.grimoire.ecole.find((s) => s.id === sig[id].fusion).crans[sig[id].cran].vide), `${dj} : signatures vers des crans pleins`);
  }
  const foyer = (data['monster-families'].marees ?? []).find((f) => f.name === 'Gobelins des Écumes');
  assert.ok(foyer && foyer.lines.flat().length === 8, 'foyer gobelin des Marées : 8 cartes');
  for (const dj of ['bosquet', 'crypte', 'zenith']) {
    assert.ok((data['monster-families'][dj] ?? []).some((f) => f.lines.flat().some((id) => variantes[dj].includes(id))), `${dj} : famille régionale déclarée`);
  }
});
test('contenu v3 lot C4 — Clergé du Plein Jour : Apolline en M (fusion Célestin + Justine), nouvelle L Justine, Zénith à 2 M', () => {
  const data = loadData();
  const zen = data.monsters.filter((m) => m.dungeon === 'zenith');
  const mythiques = zen.filter((m) => m.rarity === 'M').map((m) => m.name).sort();
  assert.deepEqual(mythiques, ['Apolline, Prophétesse du Jour', 'Astre Capiteux'], 'le Zénith porte 2 M');
  const apolline = zen.find((m) => m.id === 'z30');
  assert.equal(apolline.rarity, 'M', 'Apolline, Prophétesse du Jour en M');
  const justine = zen.find((m) => m.id === 'z29');
  assert.equal(justine.rarity, 'L', 'nouvelle L Justine, Justicière du Jour');
  assert.equal(justine.name, 'Justine, Justicière du Jour');
  assert.ok(zen.some((m) => m.id === 'z28' && m.rarity === 'UR' && m.name === 'Justicière du Jour'), 'z28 UR Justicière du Jour');
  assert.ok(zen.some((m) => m.id === 'z26' && m.rarity === 'L' && m.name === 'Célestin, Apôtre du Chant'), 'z26 L Célestin conservé');
  const fam = (data['monster-families'].zenith ?? []).find((f) => f.name === 'Clergé du Plein Jour');
  assert.ok(fam && fam.mythic === 'z30', 'famille Clergé du Plein Jour, mythique z30');
  const ids = [...fam.lines.flat(), ...(fam.side ?? [])];
  assert.deepEqual(ids.sort(), ['z11', 'z23', 'z24', 'z25', 'z26', 'z27', 'z28', 'z29', 'z9'].sort(), '10 cartes du Clergé');
});
