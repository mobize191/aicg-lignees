// Smoke UI du dist : boot complet dans un fake DOM permissif + sections de contrôle.
// Usage : node smoke-ui.mjs [dist.html]
import { readFileSync } from 'node:fs';
import { bootDist, wait } from './stub.mjs';

const file = process.argv[2] ?? 'dist.html';
const html = readFileSync(file, 'utf8');

const { api, doc, mem, els, errors } = bootDist(file);
const store = api.store;

let fails = 0;
let total = 0;
function check(label, ok, info = '') {
  total++;
  if (!ok) fails++;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + label + (info && !ok ? '  [' + info + ']' : ''));
}

function setup(ids, lvl) {
  store.team.slots = ids.map((id) => api.newInst(id, lvl).iid);
}

async function main() {
  await wait(150);
  check('boot : __api complet', !!api && !!store, '');
  check('boot : app rendu', (els.get('app')?._innerHTML ?? '').length > 50, String((els.get('app')?._innerHTML ?? '').length));

  // ---------- navigation 6 onglets ----------
  const routes = [['#accueil', 'Sauvegarde'], ['#equipe', 'quipe'], ['#collection', 'ollection'], ['#forge', 'orge'], ['#donjons', 'onjon'], ['#glossaire', 'lossaire']];
  for (const [r, needle] of routes) {
    api.go(r);
    await wait(30);
    check('nav ' + r + ' rend', (els.get('app')?._innerHTML ?? '').toLowerCase().includes(needle.toLowerCase()), '');
  }
  check('boot/nav : 0 exception', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

  // ---------- voies EVO_CHOICES ----------
  const expectedVoies = {
    n5: ['e3', 'e11'], n6: ['f3', 'f15', 'f24'], n7: ['g3', 'g12'], n8: ['k3', 'k12', 'k24'],
    n10: ['e24'], n11: ['g12'], n12: ['k3', 'k12', 'k24'],
    n9: ['z3', 'z16', 'z23'], n13: ['d3'], n14: ['d8'], n15: ['d14'],
  };
  for (const [id, tos] of Object.entries(expectedVoies)) {
    const got = (api.EVO_CHOICES[id] ?? []).map((x) => x.to);
    check('voies ' + id + ' -> ' + tos.join(','), got.length === tos.length && tos.every((t, i) => got[i] === t), got.join(','));
  }

  // ---------- soudures SOLO_STEPS ----------
  const expectedSteps = { n1: 'a30', n2: 'a29', n3: 's13', n4: 'a31', d3: 'd4', d9: 'd10', d15: 'd16', f3: 'f8', a3: 's14', a4: 'a32', a9: 's7', s2: 's13', s3: 'a31' };
  for (const [from, to] of Object.entries(expectedSteps)) {
    check('soudure ' + from + ' -> ' + to, api.SOLO_STEPS[from] === to, api.SOLO_STEPS[from]);
  }

  // ---------- cap 20 ----------
  mem.clear();
  const capInst = api.newInst('a1', 19);
  api.addXpI(capInst.iid, 100000);
  check('cap niveau 20 par exemplaire', capInst.lvl <= 20, String(capInst.lvl));

  // ---------- grammaire des sorts (43 A) ----------
  const sp1 = api.byId('n1').spells.map((s) => s.name);
  check('43 A n1 : commun, race, classe, signature', sp1.length === 4 && sp1[0] === 'Frappe Précise' && sp1[3] === 'Prise de Garde', sp1.join(' | '));
  const sp9 = api.byId('n9').spells.map((s) => s.name);
  check('43 A n9 : bestiau avec race+classe', sp9.includes('Instinct Sauvage') && sp9.includes('Décharge Arcanique') && sp9.includes('Rafale Céleste'), sp9.join(' | '));
  const sp3 = api.byId('n3').spells.map((s) => s.name);
  check('43 A n3 : prêtre soigneur complet', sp3.includes('Premiers Soins') && sp3.includes('Onde Consacrée') && sp3.includes('Bénédiction Modeste'), sp3.join(' | '));
  const cats1 = api.byId('n1').spells.map((s) => s.cat);
  check('43 A badges de catégorie', cats1.slice(0, 3).join(',') === 'commun,race,classe', cats1.join(','));
  const sig = api.byId('n1').spells.at(-1);
  check('43 A signature 5 mana / 1.85', sig.cost === 5 && Math.abs(sig.mult - 1.85) < 1e-9, sig.cost + '/' + sig.mult);
  const a1c = api.byId('a1');
  check('43 A a1 : commun + sort de lignée', a1c.spells.length === 2 && a1c.spells[1].name === 'Taillade du Mat' && a1c.spells[1].cat === 'lignée', a1c.spells.map((s) => s.name).join(' | '));
  const mw = api.makeWave(77, 2, 'marees', 1);
  const monsterSpells = [...mw.attaque, ...mw.support].map((u) => (u.spells ?? []).length);
  check('43 A monstre : commun + signature', monsterSpells.every((n) => n === 2), monsterSpells.join(','));

  // ---------- plateau une ligne (43 B) ----------
  mem.clear();
  setup(['a1', 'g9', 'd2', 'n3', 'a29'], 15);
  api._setAuto(true);
  api.go('#combat');
  await wait(60);
  const appEl = els.get('app');
  const tz = appEl.querySelector('#team-zone');
  const ez = appEl.querySelector('#enemy-zone');
  check('43 B zones team/enemy rendues', !!tz && !!ez, '');
  if (tz && ez) {
    check('43 B une seule rangée par camp', tz.querySelectorAll('.row').length === 1 && ez.querySelectorAll('.row').length >= 1, tz.querySelectorAll('.row').length + '/' + ez.querySelectorAll('.row').length);
    check('43 B 5 cartes posées', tz.querySelectorAll('.unit').length === 5, String(tz.querySelectorAll('.unit').length));
  }
  check('43 B plus de shift/back', !appEl._innerHTML.includes('row back'), '');

  // ---------- panneau tactique (43 C) ----------
  api._setAuto(false);
  const stC = api._state();
  check('43 C combat lancé', !!stC, '');
  if (stC) {
    stC.team.attaque[0].hp = Math.max(1, Math.round(stC.team.attaque[0].maxHp * 0.05));
    api.renderTacPanel();
    const panel = els.get('tac-panel') ?? appEl.querySelector('#tac-panel');
    const pi = panel ? panel._innerHTML : '';
    check('43 C panneau tactique rendu', pi.length > 100, String(pi.length));
    check('43 C sorts nommés (Onde Consacrée)', pi.includes('Onde Consacrée') && pi.includes('Bénédiction Modeste'), '');
    check('43 C pas de bouton ✦ Sort générique', !pi.includes('>✦ Sort<'), '');
    check('43 C souffle croisé étiqueté (apostrophe droite)', pi.includes("Action d'équipe, pas un sort"), '');
    check('43 C infobulle du sort commun', pi.includes('title="Frappe Précise'), '');
  }
  check('43 C 0 exception après panneau', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

  // ---------- victoire tactique (40) ----------
  mem.clear();
  setup(['a1', 'g9', 'd2', 'n4', 'a29'], 20);
  api._setAuto(false);
  api.go('#combat');
  await wait(60);
  let stT = api._state();
  let turns = 0;
  while (stT && !stT.winner && turns < 40) {
    const plan = api._tac();
    for (const u of [...stT.team.attaque, ...stT.team.support]) {
      if (u.alive) plan[u.uid] = { kind: 'spell', idx: 0 };
    }
    api.resolveTurn(stT, api.buildTactChoices());
    turns++;
  }
  check('40 victoire tactique 100% manuelle (Nv20, étage 1)', stT && stT.winner === 'team', `winner=${stT && stT.winner} en ${turns} tours`);
  check('40 récompense tactique intégrale', api._lastTactMult() >= 0.999, String(api._lastTactMult()));

  // ---------- modificateurs de run (42) ----------
  check('42 A ids uniques', api.RUN_MODS.length === 4 && new Set(api.RUN_MODS.map((m) => m.id)).size === 4, api.RUN_MODS.map((m) => m.id).join(','));
  const lootExp = { horde: [1.2, 1.2], sterile: [1.25, 1], muraille: [1, 1.5], rage: [1.4, 1], autre: [1, 1] };
  for (const [id, [pts, drop]] of Object.entries(lootExp)) {
    const l = api.runModLootMult(id === 'autre' ? 'nope' : id);
    check('42 A lootMult ' + id, l.pts === pts && l.drop === drop, l.pts + '/' + l.drop);
  }
  const plain = api.makeWave(31, 3, 'marees', 1);
  const plainNull = api.makeWave(31, 3, 'marees', 1, null);
  check('42 B dormance : mod null = pas de mod', JSON.stringify(plain) === JSON.stringify(plainNull), '');
  const horde = api.makeWave(31, 3, 'marees', 1, 'horde');
  check('42 B Horde : +1 ennemi', horde.attaque.length + horde.support.length === plain.attaque.length + plain.support.length + 1, `${plain.attaque.length}+${plain.support.length} vs ${horde.attaque.length}+${horde.support.length}`);
  const mur = api.makeWave(31, 3, 'marees', 1, 'muraille');
  check('42 B Muraille : PV majorés', mur.attaque.every((u, k) => u.hp >= plain.attaque[k].hp), '');
  const rage = api.makeWave(31, 3, 'marees', 1, 'rage');
  check('42 B Rage : ATQ majorée', rage.attaque.every((u, k) => u.atk >= plain.attaque[k].atk), '');

  // modale : accepter
  mem.clear();
  setup(['n1', 'n2', 'n3'], 10);
  api._setAuto(true);
  api.enterAt(1, 'marees');
  await wait(40);
  const ov = doc.body.children.at(-1);
  check('42 C enterAt tire un mod valide', ['horde', 'sterile', 'muraille', 'rage'].includes(store.runMod), String(store.runMod));
  check('42 C la modale est ouverte', ov && ov.className === 'modal-overlay' && /modificateur/i.test(ov._innerHTML ?? ''), String(ov && ov.className));
  api._setAuto(false);
  ov.querySelector('#mod-accept').click();
  await wait(40);
  check('42 C accepter ferme la modale et ouvre le combat', doc.body.children.at(-1) !== ov && store.runMod !== null, '');
  check('42 C bandeau du mod en combat', (els.get('app')?._innerHTML ?? '').includes('Modificateur du run'), '');

  // modale : entrer sans modificateur (GRATUIT)
  mem.clear();
  setup(['n1', 'n2', 'n3'], 10);
  api._setAuto(true);
  api.addGem('brut', 'Eau', 1);
  const before = (store.gems.brut && store.gems.brut.Eau) ?? 0;
  api.enterAt(1, 'marees');
  await wait(40);
  const ov2 = doc.body.children.at(-1);
  check('42 D modale à 3 choix (accepter / sans / relancer)', ov2 && ov2.className === 'modal-overlay' && /Entrer sans modificateur/.test(ov2._innerHTML ?? '') && /Relancer le tirage/.test(ov2._innerHTML ?? ''), '');
  api._setAuto(false);
  ov2.querySelector('#mod-free').click();
  await wait(40);
  const after = (store.gems.brut && store.gems.brut.Eau) ?? 0;
  check('42 D entrer sans mod est GRATUIT : mod nul, brut intact, combat ouvert', store.runMod === null && after === before && doc.body.children.at(-1) !== ov2, `brut ${before}->${after} runMod=${store.runMod}`);

  // modale : relancer le tirage (payant)
  mem.clear();
  setup(['n1', 'n2', 'n3'], 10);
  api._setAuto(true);
  api.addGem('brut', 'Eau', 1);
  const bReroll = (store.gems.brut && store.gems.brut.Eau) ?? 0;
  api.enterAt(1, 'marees');
  await wait(40);
  const ovR = doc.body.children.at(-1);
  ovR.querySelector('#mod-reroll').click();
  await wait(40);
  const aReroll = (store.gems.brut && store.gems.brut.Eau) ?? 0;
  const ovR2 = doc.body.children.at(-1);
  check('42 E relancer dépense 1 brut, retire un mod, modale rouverte', aReroll === bReroll - 1 && ['horde', 'sterile', 'muraille', 'rage'].includes(store.runMod) && ovR2 !== ovR && ovR2.className === 'modal-overlay', `brut ${bReroll}->${aReroll} mod=${store.runMod}`);
  api._setAuto(false);
  ovR2.querySelector('#mod-accept').click();
  await wait(60);
  check('42 E accepter après relance ouvre le combat', api._state() != null, '');

  // relance bloquée sans brut (le tirage reste, on peut toujours entrer)
  mem.clear();
  setup(['n1', 'n2', 'n3'], 10);
  api._setAuto(true);
  store.gems.brut = {};
  api.enterAt(1, 'marees');
  await wait(40);
  const modAvant = store.runMod;
  const ov3 = doc.body.children.at(-1);
  ov3.querySelector('#mod-reroll').click();
  await wait(40);
  check('42 E sans brut la relance échoue : mod inchangé, modale ouverte', store.runMod === modAvant && ov3.parentNode === doc.body, `mod=${store.runMod}`);
  api._setAuto(false);
  ov3.querySelector('#mod-free').click();
  await wait(40);
  check('42 E sans brut on peut toujours entrer sans mod (gratuit)', store.runMod === null, '');

  // stérile
  mem.clear();
  setup(['a1', 'g9', 'd2'], 15);
  api._setAuto(true);
  store.runMod = null;
  api.go('#combat');
  await wait(60);
  const st0 = api._state();
  const reg0 = st0 ? [...st0.team.attaque, ...st0.team.support].map((u) => u.manaRegen) : [];
  mem.clear();
  setup(['a1', 'g9', 'd2'], 15);
  api._setAuto(true);
  store.runMod = 'sterile';
  api.go('#combat');
  await wait(60);
  const st1 = api._state();
  const reg1 = st1 ? [...st1.team.attaque, ...st1.team.support].map((u) => u.manaRegen) : [];
  check('42 F Mana Stérile : régén −1 (min 1)', reg1.length === reg0.length && reg1.length > 0 && reg1.every((v, k) => v === Math.max(1, reg0[k] - 1)), `stérile=${reg1.join(',')} base=${reg0.join(',')}`);
  const proj = (en) => JSON.stringify([...(en?.attaque ?? []), ...(en?.support ?? [])].map((u) => [u.name, u.hp, u.atk, u.lvl]));
  check('42 F vague ennemie identique avec Stérile', st0 && st1 && proj(st1.enemies) === proj(st0.enemies), '');
  store.runMod = null;

  // ---------- indice de force (43 D) ----------
  const p5 = api.cardPower(api.byId('a1'), 5);
  check('43 D l\'indice monte avec le niveau', api.cardPower(api.byId('a1'), 10) > p5 && p5 > 0, String(p5));
  check('43 D l\'indice capte la rareté (a6 R > a1 C)', api.cardPower(api.byId('a6'), 5) > api.cardPower(api.byId('a1'), 5), '');
  mem.clear();
  setup(['a1', 'g9', 'd2', 'n4', 'a29'], 5);
  check('43 D teamPower sur l\'équipe posée', api.teamPower() > 0, String(Math.round(api.teamPower())));
  const rp1 = api.recommendedPower(api.dungeonById('marees'), 1);
  const rp3 = api.recommendedPower(api.dungeonById('marees'), 3);
  check('43 D recommendedPower auto-calibré (Marées, Facile)', rp1 > 0, String(rp1));
  check('43 D le seuil monte avec la difficulté', rp3 > rp1, `${rp1} -> ${rp3}`);
  api.go('#donjons');
  await wait(60);
  check('43 D l\'écran donjons affiche l\'indice (plus de niveau moyen)', (els.get('app')?._innerHTML ?? '').includes('indice') && !(els.get('app')?._innerHTML ?? '').includes('niveau moyen'), '');
  check('43 D l\'écran donjons annonce le modificateur de run', /modificateur de run est tiré/.test(els.get('app')?._innerHTML ?? ''), '');

  // ---------- correctifs terrain (43.1) ----------
  check('43.1 a plateau : largeur fixe et uniforme pour .unit', html.includes('.unit { flex: 0 0 auto; width: clamp(84px, 16vw, 112px)') && html.includes('.unit.boss { flex: 0 0 auto; width: clamp(112px, 22vw, 148px)') && !html.includes('.row.back'), '');
  check('43.1 a les anciennes surcharges de taille ont disparu', !html.includes('min-width: 104px; max-width: 172px') && !html.includes('flex: 1.8 1 0'), '');
  check('43.1 b modificateur réellement optionnel dans les textes', html.includes('entrez librement sans lui, ou relancez le tirage contre 1 éclat brut') && html.includes('Le refuser est gratuit'), '');
  check('43.1 c b1-b7 marquées archived', ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].every((id) => api.byId(id).archived === true), '');
  check('43.1 c le pool du booster exclut les archives', (html.split('function pickCard')[1] ?? '').split('function ')[0].includes('!c.archived'), '');
  mem.clear();
  setup(['n1', 'n2', 'n3'], 10);
  api.go('#collection');
  await wait(60);
  const colHtml = els.get('app')?._innerHTML ?? '';
  check('43.1 d familles : la porte (novice/greffe) figure en tête de chaîne', colHtml.includes('évolue vers'), '');
  check('43.1 d le teaser BRANCHE (v0.36) a disparu', !colHtml.includes('v0.36 · voies'), '');
  check('43.1 e sans carte archivée possédée, pas de section archives', !colHtml.includes('Les archives'), '');
  api.newInst('b1');
  api.go('#collection');
  await wait(60);
  check('43.1 f posséder une ancienne carte fait apparaître la section archives', (els.get('app')?._innerHTML ?? '').includes('Les archives — les anciennes cartes'), '');
  check('43.1 f l\'archivée possédée y est visible', (els.get('app')?._innerHTML ?? '').includes('Yuki'), '');
  check('43.1 g 0 exception après collection', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

  // ---------- v0.44 : combat plein écran + grandes cartes ----------
  check('44 a one-screen : le body devient colonne flex, #app prend le reste', html.includes('body.in-combat { overflow: hidden; height: 100dvh; display: flex; flex-direction: column; }') && html.includes('body.in-combat header, body.in-combat nav { flex: 0 0 auto; position: static; }') && html.includes('body.in-combat #app { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; overflow-y: auto;'), '');
  check('45 b rien de coupé : #app défile en interne, Tactique borné et défilable', html.includes('body.in-combat #tac-panel { flex: 0 0 auto; max-height: 40dvh; overflow-y: auto; }') && !html.includes('body.in-combat #tac-panel { flex: 0 1 auto; overflow: hidden; }'), '');
  check('45 d menu ☰ en combat : navigation en surimpression opaque', html.includes('body.in-combat nav.open { position: fixed; top: 55px;') && html.includes('background: rgba(10, 14, 22, .98);'), '');
  check('44 a one-screen : unités de combat agrandies et panneau compact', html.includes('body.in-combat .unit { width: clamp(96px, 22vw, 128px); }') && html.includes('body.in-combat .unit.boss { width: clamp(122px, 28vw, 162px); }') && html.includes('body.in-combat .tac-btn { padding: 3px 6px; font-size: .68rem; }'), '');
  check('45 c pions v0.45 : format plus carré, image pleine, surimpression', html.includes('body.in-combat .card.battle { aspect-ratio: 5 / 6; }') && html.includes('body.in-combat .card.battle .cardfoot { padding: 2px 4px 4px; font-size: .62rem; gap: 2px 5px; }') && !html.includes('clamp(84px, 17vw, 108px)'), '');
  check('44 a one-screen : journal borné et rappels clampés à 2 lignes', html.includes('body.in-combat #log { min-height: 20px; max-height: 20dvh;') && html.includes('-webkit-line-clamp: 2'), '');
  check('44 b grandes cartes : collection 186px, fiche 232px, équipe 156px, familles 118px', html.includes('repeat(auto-fill, minmax(186px, 1fr))') && !html.includes('minmax(168px, 1fr)') && html.includes('grid-template-columns: 232px 1fr') && html.includes('.slot { flex: 0 1 156px; width: min(156px, calc((100% - 32px) / 5)); }') && html.includes('.fam-card { width: 118px; }'), '');
  check('44 b la base v0.43.1 des unités reste en place (override seulement)', html.includes('.unit { flex: 0 0 auto; width: clamp(84px, 16vw, 112px)'), '');
  check('44 c la classe in-combat est posée par le routeur', html.includes("document.body.classList.toggle('in-combat', hash === '#combat')"), '');
  check('44 c changelog v0.44 écrit', html.includes('v0.44 : Le combat plein écran'), '');
  check('45 a emojis réparés : aucun code brut \\U0001F9xx, vrai 🤖 présent', !html.includes('\\U0001F9') && html.includes('🤖') && html.includes('🧭'), '');
  check('45 e sorts spéciaux : bandeau non couvrant (pas de voile plein écran)', html.includes('.special-overlay {\nposition: fixed; inset: 0; z-index: 70; pointer-events: none;\ndisplay: flex; align-items: flex-start; justify-content: center;\npadding-top: 9dvh;\nanimation: fadein .2s ease;\n}') && !html.includes('background: rgba(5, 7, 12, .72);') && html.includes('.special-txt { min-width: 0; }') && html.includes('.special-art { position: relative; flex: 0 0 92px; width: 92px; height: 116px;'), '');
  check('45 f changelog v0.45 écrit', html.includes('v0.45 : Rien de caché, des pions à voir'), '');
  mem.clear();
  setup(['a1', 'g9', 'd2', 'n3', 'a29'], 15);
  api._setAuto(true);
  api.go('#combat');
  await wait(40);
  check('44 d en combat, le body porte la classe in-combat', doc.body.classList.contains('in-combat'), String(doc.body.className));
  api.go('#equipe');
  await wait(40);
  check('44 d hors combat, la classe est retirée', !doc.body.classList.contains('in-combat'), String(doc.body.className));
  api.go('#combat');
  await wait(40);
  check('44 d retour en combat, la classe revient (toggle à force)', doc.body.classList.contains('in-combat'), String(doc.body.className));
  api._setAuto(false);

  console.log(fails === 0 ? `SCÉNARIOS : TOUT PASSE (${total} checks)` : `SCÉNARIOS : ${fails} ÉCHEC(S) / ${total}`);
  process.exit(fails === 0 ? 0 : 1);
}
main().catch((e) => { console.error('CRASH :', e && e.stack || e); process.exit(1); });
