import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Correctifs d'équilibre v2 — lot 2 (docs/prompt-correctifs-equilibre-v2.md) :
// les signatures de soin pur des monstres (effect.kind === 'heal') deviennent HYBRIDES :
// frappe (role degats, cible 1 ennemi) + soinPct (soin = ~moitié des dégâts, SIGNATURE_SOIN_PCT en data).
// Branchement mineur documenté : bloc soinPct symétrique côté ennemis (combat.js) et support (spells.js).
// Les cartes soigeuses gardent leur signature de soin pure ; le commun soin des monstres est conservé.

const E = loadEngine();

test('lot 2 eq v2 : les 14 monstres soigneurs ont une signature hybride (degats + soinPct), le commun soin reste', () => {
  const pct = E.DATA.engine.moteur.SIGNATURE_SOIN_PCT;
  assert.ok(pct > 0 && pct < 1, 'SIGNATURE_SOIN_PCT en data, bornes ]0-1[');
  const healMons = E.allMonsters().filter((m) => m.effect && m.effect.kind === 'heal' && m.soloSpell);
  assert.ok(healMons.length >= 14, `${healMons.length} monstres soigneurs`);
  for (const m of healMons) {
    const sig = (m.spells ?? []).find((sp) => sp.cat === 'unique');
    assert.equal(sig.role, 'degats', `${m.id} : signature = degats`);
    assert.equal(sig.cible, '1 ennemi', `${m.id} : cible ennemie`);
    assert.equal(sig.soinPct, pct, `${m.id} : soinPct = SIGNATURE_SOIN_PCT`);
    assert.equal(E.spellSideOf(sig), 'enemy');
    assert.equal((m.spells ?? [])[0].role, 'soin', `${m.id} : le commun reste un soin (identité soigneur)`);
    const meta = E.signatureMetaOf(m);
    assert.equal(meta.role, 'degats', `${m.id} : métadonnée cohérente`);
  }
  // les monstres non-soigneurs (ex. e8/d9 bouclier) ne portent pas de soinPct
  for (const id of ['e8', 'd9']) {
    const m = E.allMonsters().find((x) => x.id === id);
    const sig = (m.spells ?? []).find((sp) => sp.cat === 'unique');
    assert.ok(!sig.soinPct, `${id} : pas de soinPct (hors profil soin)`);
  }
  // les cartes soigeuses gardent une signature de soin pure
  const healCards = E.DATA.cards.filter((c) => c.soloSpell && c.effect && c.effect.kind === 'heal');
  assert.ok(healCards.length >= 14);
  for (const c of healCards) {
    const meta = E.signatureMetaOf(c);
    assert.equal(meta.role, 'soin', `${c.id} : carte soigeuse = soin (inchangé)`);
    assert.equal(meta.cible, '1 allié');
  }
});

test('lot 2 eq v2 : la signature hybride d’un monstre soigneur frappe l’ennemi ET soigne l’allié le plus blessé', () => {
  const z24 = E.allMonsters().find((m) => m.id === 'z24');
  const sigIdx = z24.spells.findIndex((s) => s.cat === 'unique');
  assert.ok(sigIdx >= 0 && z24.spells[sigIdx].soinPct > 0);
  const foeDef = E.allMonsters().find((m) => m.id === 'e1');
  const st = E.initCombat(
    { avant: [{ ...z24, level: 10 }, { ...E.getCard('n1'), level: 10 }], arriere: [] },
    [{ ...foeDef }], 42, {}
  );
  const healer = st.team.avant[0];
  const mate = st.team.avant[1];
  mate.hp = Math.max(1, Math.round(mate.maxHp * 0.3)); // allié blessé = cible du soin
  const foeUid = st.enemies.avant[0].uid;
  E.beginRound(st);
  let r = null;
  for (let guard = 0; guard < 20 && r == null; guard++) {
    const it = E.peekRound(st);
    if (!it) break;
    if (it.side === 'team' && it.u.uid === healer.uid) r = E.stepRound(st, { kind: 'spell', idx: sigIdx, targetUid: foeUid });
    else E.stepRound(st, it.side === 'team' ? { kind: 'attack', targetUid: foeUid } : null);
  }
  assert.ok(r, 'le soigneur a joué sa signature');
  const atk = r.events.find((e) => e.type === 'attack' && e.sourceId === healer.uid);
  const heal = r.events.find((e) => e.type === 'heal' && e.sourceId === healer.uid && e.targetId === mate.uid);
  assert.ok(atk && atk.amount > 0, 'la signature hybride produit une attaque sur l’ennemi');
  assert.ok(heal && heal.amount >= 1, 'la signature hybride soigne l’allié le plus blessé (soinPct × dégâts)');
  assert.ok(Math.abs(heal.amount - Math.round(atk.amount * E.DATA.engine.moteur.SIGNATURE_SOIN_PCT)) <= 1, 'soin = soinPct × dégâts encaissés');
});

test('lot 2 eq v2 : non-régression marathon — 3× chaque Prêtre monstre R/SR soigneur, garde 150 tours', () => {
  const LVL = E.stretchLevel(12);
  const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];
  const healPretres = E.allMonsters().filter((m) => m.classe === 'Prêtre' && m.effect?.kind === 'heal' && ['R', 'SR'].includes(m.rarity));
  assert.deepEqual(healPretres.map((m) => m.id).sort(), ['e9', 'k11', 'z10', 'z11', 'z24']);
  for (const m of healPretres) {
    for (let n = 0; n < 3; n++) {
      const dg = DGS[n % 5];
      const diff = 1 + (n % 3);
      const floors = E.dungeonById(dg).floors;
      const wave = E.makeWave(n + 1, 1 + (n % floors), dg, diff);
      const mk = () => ({ ...m, level: LVL });
      const st = E.initCombat({ avant: [mk(), mk()], arriere: [mk()] }, wave, n + 1, {}, { difficulty: diff });
      let t = 0;
      while (!st.winner && t < 150) { E.resolveTurn(st); t++; }
      assert.ok(st.winner, `${m.id} seed ${n + 1} (${dg} diff ${diff}) : combat tranché en ${t} tours, pas de marathon`);
    }
  }
});
