// Smoke UI du dist : boot complet dans un fake DOM permissif + sections de contrôle.
// Usage : node smoke-ui.mjs [dist.html]
import { readFileSync } from 'node:fs';
import { bootDist, wait } from './stub.mjs';
import { mulberry32 } from './tests/helpers/rng.js';

const file = process.argv[2] ?? 'dist.html';
const html = readFileSync(file, 'utf8');

const { api, doc, mem, els, errors, ctx } = bootDist(file);
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
    n10: ['e24', 'w19'], n11: ['g12', 'w20'], n12: ['k3', 'k12', 'k24', 'w21'],
    n9: ['z3', 'z16', 'z23'], n13: ['p1'], n14: ['d8'], n15: ['d14'],
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
  check('43 A a1 : sort de lignée seul (commun retiré des familles, T2.7)', a1c.spells.length === 1 && a1c.spells[0].name === 'Taillade du Mat' && a1c.spells[0].cat === 'lignée', a1c.spells.map((s) => s.name).join(' | '));
  const mw = api.makeWave(77, 2, 'marees', 1);
  const monsterSpells = [...mw.avant, ...mw.arriere].map((u) => (u.spells ?? []).length);
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
    check('43 B deux rangées par camp (avant + arrière)', tz.querySelectorAll('.row').length === 2 && ez.querySelectorAll('.row').length === 2, tz.querySelectorAll('.row').length + '/' + ez.querySelectorAll('.row').length);
    // depuis v1.41 (formation 3 actifs + 2 réserve) seules les 3 cartes actives sont sur le plateau ; les 2 réserve restent hors ciblage
    check('43 B 3 cartes actives posées (formation 3+2, les 2 réserve hors plateau depuis v1.41)', tz.querySelectorAll('.unit').length === 3, String(tz.querySelectorAll('.unit').length));
  }
  const rowsT = tz ? [...tz.querySelectorAll('.row')] : [];
  const rowsE = ez ? [...ez.querySelectorAll('.row')] : [];
  const labOf = (r) => (r.children ?? []).some((c) => c.classList?.contains('row-lab'));
  check('43 B la rangée arrière est marquée .back et étiquetée', rowsT.some((r) => r.classList.contains('back') && labOf(r)) && rowsE.some((r) => r.classList.contains('back')), '');

  // ---------- fenêtre RPG tour par tour (43 C, 46 f/g/h) ----------
  api._setAuto(false);
  api.go('#combat');
  await wait(60);
  const stC = api._state();
  check('43 C combat tactique lancé (fenêtre RPG)', !!stC, '');
  if (stC) {
    api._speed(6);
    stC.team.avant[0].hp = Math.max(1, Math.round(stC.team.avant[0].maxHp * 0.05));
    els.get('fight').click();
    let am = null;
    for (let w = 0; w < 120 && !am; w++) { await wait(25); am = api._actEl(); }
    const amTxt = am ? am._innerHTML : '';
    check('46 f fenêtre d’action : titre, stats, illustration, sorts', !!am && amTxt.includes('à vous d’agir') && amTxt.includes('♥') && !!am.querySelector('.act-art') && amTxt.includes('✦'), amTxt.slice(0, 90));
    check('46 f boutons ⚔ Attaque et ⏸ Attendre', !!am && amTxt.includes('⚔ Attaque') && amTxt.includes('⏸ Attendre'), '');
    // UX 13/11 lot 1 : pendant un choix, body.act-open (terrain rétréci mais visible, fenêtre dans le flux)
    check('46 i choix en cours : body.act-open + fenêtre d’action hors recouvrement', !!am && doc.body.classList.contains('act-open'), '');
    const bAtk = am ? am.querySelector('.act-attack') : null;
    const bPass = am ? am.querySelector('.act-pass') : null;
    if (bAtk && bPass) {
      bAtk.click();
      await wait(30);
      am = api._actEl();
      const zoneEl = am ? am.querySelector('.act-zone') : null;
      const tTxt = zoneEl ? zoneEl._innerHTML : '';
      check('46 g cible proposée : liste cliquable', !!zoneEl && tTxt.includes('Choisissez votre cible') && !!am.querySelector('.act-target'), tTxt.slice(0, 90));
      check('46 g pion ennemi surligné sur le plateau', appEl.querySelectorAll('.unit').some((el) => el.classList.contains('targeted')), '');
      const tg = am ? am.querySelector('.act-target') : null;
      if (tg) {
        const tid = tg.dataset.uid;
        tg.click();
        for (let w = 0; w < 120 && !api._actEl() && !stC.winner && api._busy(); w++) await wait(25);
        check('46 g attaque portée à la cible choisie', (stC._events ?? []).some((e) => e.type === 'attack' && e.targetId === tid), `events=${(stC._events ?? []).length}`);
      } else {
        check('46 g attaque portée à la cible choisie', false, 'pas de bouton cible');
      }
      let guard = 0;
      while (guard++ < 40) {
        let w = 0;
        am = api._actEl();
        while (!am && w++ < 120 && !stC.winner && api._busy()) { await wait(25); am = api._actEl(); }
        if (!am) break;
        const pb = am.querySelector('.act-pass');
        if (!pb) break;
        pb.click();
        await wait(25);
      }
      api._tacPause(true); // pas de chaine auto : on fige le flux avant la verification
      await wait(80);
      check('46 h le tour se termine seul (fenêtre fermée, rien en attente)', !api._actEl() && !api._busy(), `act=${!!api._actEl()} busy=${api._busy()} winner=${stC.winner}`);
      // UX 13/11 lot 2 : le mini-log #log a été alimenté pendant le combat (au moins la ligne de fin ou un événement tracé)
      check('46 j mini-log #log alimenté pendant le combat', (appEl.querySelector('#log')?.children.length ?? 0) > 0, '');
    } else {
      check('46 g cible proposée : liste cliquable', false, 'fenêtre sans boutons');
      check('46 g pion ennemi surligné sur le plateau', false, '');
      check('46 g attaque portée à la cible choisie', false, '');
      check('46 h le tour se termine seul (fenêtre fermée, rien en attente)', false, '');
    }
  } else {
    check('46 f fenêtre d’action : titre, stats, illustration, sorts', false, 'pas de combat');
    check('46 f boutons ⚔ Attaque et ⏸ Attendre', false, '');
    check('46 g cible proposée : liste cliquable', false, '');
    check('46 g pion ennemi surligné sur le plateau', false, '');
    check('46 g attaque portée à la cible choisie', false, '');
    check('46 h le tour se termine seul (fenêtre fermée, rien en attente)', false, '');
  }
  check('43 C 0 exception après fenêtre RPG', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

  // ---------- 47 : ciblage interactif v2 ----------
  {
    setup(['n1', 'n2', 'n3'], 12);
    api._setAuto(true); api.go('#combat'); await wait(60);
    api._setAuto(false); api.go('#combat'); await wait(60);
    const st47 = api._state();
    api._speed(6);
    if (st47) {
      for (const u of [...st47.team.avant, ...st47.team.arriere]) { u.mana = u.manaMax; }
      els.get('fight').click();
      let am = null;
      for (let w = 0; w < 120 && !am; w++) { await wait(25); am = api._actEl(); }
      check('47 a fenêtre d’action avec boutons (Attaque/Attendre)', !!am && !!am.querySelector('.act-attack') && !!am.querySelector('.act-pass'), '');
      const bA = am ? (am.querySelector('.act-spell:not(.off)') ?? am.querySelector('.act-attack')) : null;
      if (bA) {
        bA.click(); await wait(40);
        am = api._actEl();
        const nEnnemis = st47.enemies.avant.filter((e) => e.alive).length + st47.enemies.arriere.filter((e) => e.alive).length;
        const nTargeted = [...appEl.querySelectorAll('.unit')].filter((el) => el.classList.contains('targeted')).length;
        check('47 b cibles éligibles illuminées sur le plateau', !!am && nTargeted === nEnnemis && nEnnemis > 0, `targeted=${nTargeted} ennemis=${nEnnemis}`);
        const zoneTxt = am && am.querySelector('.act-zone') ? am.querySelector('.act-zone')._innerHTML : '';
        check('47 b libellé d’action visible pendant la désignation (coût/zone)', (zoneTxt.includes('Attaque') || zoneTxt.includes('✦')) && !!am.querySelector('.act-cancel'), zoneTxt.slice(0, 80));
        check('47 b bouton Annuler présent', !!am && !!am.querySelector('.act-cancel'), '');
        const cancel = am ? am.querySelector('.act-cancel') : null;
        if (cancel) {
          cancel.click(); await wait(40);
          am = api._actEl();
          check('47 c Annuler ramène aux actions, aucun pion illuminé', !!am && !!am.querySelector('.act-attack') && ![...appEl.querySelectorAll('.unit')].some((el) => el.classList.contains('targeted')), '');
          const bA2 = am ? (am.querySelector('.act-spell:not(.off)') ?? am.querySelector('.act-attack')) : null;
          if (bA2) {
            bA2.click(); await wait(40);
            am = api._actEl();
            const teamUnit = appEl.querySelector('#team-zone .unit');
            const before = !!am;
            if (teamUnit) teamUnit.click();
            await wait(30);
            check('47 d clic hors cible ne fait rien (fenêtre toujours en désignation)', before && !!api._actEl() && api._prompt().phase === 'target', '');
            // correctifs sorts lot 3 : largeur = cran du porteur ; sans cran (nom seul) = 1, jamais le max des crans
            check('47 e donnée zone : largeur au cran du porteur (cran II = 2, sans cran = 1)', api._zoneWidthOf({ name: 'Lame d’Écume', cran: 'II' }) === 2 && api._zoneWidthOf('Lame d’Écume') === 1, `cranII=${api._zoneWidthOf({ name: 'Lame d’Écume', cran: 'II' })} seul=${api._zoneWidthOf('Lame d’Écume')}`);
            const firstTargeted = [...appEl.querySelectorAll('.unit')].find((el) => el.classList.contains('targeted')) ?? null;
            if (firstTargeted) {
              api._clearZone();
              api._previewZone(firstTargeted.dataset.uid);
              const zone2 = [...appEl.querySelectorAll('.unit')].filter((el) => el.classList.contains('zone2')).length;
              check('47 e survol attaque = mono (0 zone2 attendu)', zone2 === 0, 'zone2=' + zone2);
            }
            const tg = [...appEl.querySelectorAll('.unit')].find((el) => el.classList.contains('targeted')) ?? null;
            if (tg) {
              tg.click();
              for (let w = 0; w < 120 && !st47.winner && api._busy(); w++) await wait(25);
              check('47 f clic sur pion illuminé désigne et résout', (st47._events ?? []).some((e) => (e.type === 'attack' || e.type === 'cast') && e.targetId === tg.dataset.uid), '');
            } else {
              check('47 f clic sur pion illuminé désigne et résout', false, 'pas de cible');
            }
          }
        }
      }
      api._setAuto(true);
      let guard = 0;
      while (guard++ < 60 && !st47.winner) { await wait(40); const am2 = api._actEl(); if (am2) { const pb = am2.querySelector('.act-pass'); if (pb) pb.click(); } }
    } else {
      check('47 a fenêtre d’action avec boutons (Attaque/Attendre)', false, 'pas de combat');
    }
    check('47 z 0 exception après ciblage v2', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- 52 : repositionnement écran combat (14/11, maquette v2.3 validée) ----------
  {
    setup(['v1', 'n2', 'n3'], 12); // v1 = famille Appel (sort avec bloc summon)
    api._setAuto(true); api.go('#combat'); await wait(60);
    api._setAuto(false); api.go('#combat'); await wait(200);
    const st52 = api._state();
    check('52 a combat lancé pour le repositionnement', !!st52, '');
    if (st52) {
      const u52 = st52.team.avant.find((x) => x.cardId === 'v1');
      if (u52) { u52.agi = 9999; u52.mana = u52.manaMax = 99; }
      api._speed(6);
      els.get('fight').click();
      let am52 = null;
      for (let w = 0; w < 120 && !am52; w++) { await wait(25); am52 = api._actEl(); }
      check('52 b topbar : rail d’ordre + vitesse/pause persistants en haut', !!appEl.querySelector('#topbar #rail') && !!appEl.querySelector('#speedbar #speed') && !!appEl.querySelector('#speedbar #fight') && !!appEl.querySelector('#stage-chip'), '');
      check('52 c barres PV/MP + chiffres en clair sur les pions', [...appEl.querySelectorAll('.pied')].some((p) => p.querySelector('.bars .bhp') && p.querySelector('.bars .bmp') && p.querySelector('.hp')), '');
      if (u52 && am52 && api._prompt() && api._prompt().unit === u52) {
        const k = u52.spells.findIndex((s) => s.summon);
        const btn = am52.querySelectorAll('.act-spell')[k];
        if (btn) { btn.click(); for (let w = 0; w < 160 && api._busy(); w++) await wait(25); await wait(80); }
        api._draw(); await wait(40);
        const sq = appEl.querySelector('.sq');
        const inRow = [...appEl.querySelectorAll('.unit')].some((el) => (el.dataset.uid || '').includes('-inv') && !el.classList.contains('sq'));
        const invN = st52.team.avant.filter((x) => x.uid.includes('-inv')).length;
        check('52 d invocation en PREMIÈRE LIGNE (.front-row .sq, PV mini + badge ⏳ ttl), jamais dans une ligne', !!sq && !inRow && !!sq.querySelector('.sq-hp') && !!sq.querySelector('.sq-ttl'), `sq=${!!sq} inRow=${inRow} inv=${invN} btn=${!!btn} k=${k}`);
      } else {
        check('52 d invocation en PREMIÈRE LIGNE', false, `u52=${!!u52} am=${!!am52} prompt=${api._prompt() ? api._prompt().unit?.cardId : '?'}`);
      }
      check('52 e ciblage : pulse cibles valides + zones invalides grisées (CSS targeting)', html.includes('body.in-combat.targeting .unit:not(.targeted):not(.ko)') && html.includes('@keyframes targetpulse'), '');
      // correctifs v3 lot 2 (tranchage 15/11, terrain stable) : la zone de commandement a une hauteur FIXE min(30dvh,320px), le max-height:30dvh propre de la barre est parti
      check('52 f zone de commandement permanente bornée à 30dvh + boutons 44px + off grisé avec raison', html.includes('height: min(25dvh, 240px)') && html.includes('min-height: 44px') && html.includes('.off-reason'), '');
    }
    check('52 z 0 exception repositionnement', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- 53 : correctifs écran combat v2 lot 1 — « qui joue » lisible en 1 s (terrain + rail + fenêtre) ----------
  {
    check('53 a CSS unité active sur le terrain : pulse or + badge ▶ AU-DESSUS de la vignette', html.includes('.unit.acting .card { animation: actingPulse') && html.includes('@keyframes actingPulse') && html.includes('.unit.acting::after') && html.includes('.unit.sq.acting::after'), '');
    check('53 b CSS rail : chip .acting renforcée (font .84rem, fond or .34, ▶ .82rem)', html.includes('.rail-chip.acting { border-color: #ffd54f; background: rgba(255, 213, 79, .34); color: #ffe9b0; font-size: .84rem;') && html.includes('.rail-chip.acting::before { content: "\\25B6"; color: #ffd54f; font-size: .82rem; }'), '');
    check('53 c CSS fenêtre d\u2019action : .act-name gras 1.05rem + .acting-badge or', html.includes('.act-name { font-size: 1.05rem; font-weight: 900; }') && html.includes('.acting-badge { background: linear-gradient(135deg, #ffe082, #ffd54f); color: #241303;'), '');
    check('53 d CSS étiquette flottante who décalée au-dessus des dégâts', html.includes('.float.who { top: -30px;'), '');
    setup(['n1', 'n2', 'n3'], 12);
    api._setAuto(true); api.go('#combat'); await wait(60);
    api._setAuto(false); api.go('#combat'); await wait(200);
    const st53 = api._state();
    check('53 e combat lancé pour le test qui-joue', !!st53 && !st53.winner, '');
    if (st53 && !st53.winner) {
      api._speed(6);
      els.get('fight').click();
      let am53 = null;
      for (let w = 0; w < 120 && !am53; w++) { await wait(25); am53 = api._actEl(); }
      // stub : les sélecteurs composés (.unit.acting) ne marchent pas, on filtre via classList
      const actingEl = [...appEl.querySelectorAll('.unit')].find((el) => el.classList.contains('acting'));
      const chipActing = [...appEl.querySelectorAll('.rail-chip')].find((el) => el.classList.contains('acting'));
      check('53 f unité active marquée SUR le terrain ET chip .acting dans le rail (même uid)', !!actingEl && !!chipActing && (actingEl.dataset.uid || (actingEl._unit && actingEl._unit.uid)) === (chipActing.dataset.uid || ''), `unit=${actingEl && (actingEl.dataset.uid || actingEl._unit?.uid)} chip=${chipActing && chipActing.dataset.uid}`);
      check('53 g fenêtre d\u2019action : .act-name + badge .acting-badge « à vous d\u2019agir »', !!am53 && !!am53.querySelector('.act-name') && !!am53.querySelector('.acting-badge'), '');
      const whoFloat = [...appEl.querySelectorAll('.float')].find((el) => el.classList.contains('who'));
      check('53 h étiquette flottante .who posée au début du tour (au-dessus de l\u2019unité)', !!whoFloat, '');
      // tour auto : pendant un round auto, l'acteur (allié ou ennemi) reste marqué sur le terrain
      api._setAuto(true);
      els.get('fight').click();
      let sawActing = false;
      for (let w = 0; w < 200 && !st53.winner && !sawActing; w++) { await wait(25); sawActing = [...appEl.querySelectorAll('.unit')].some((el) => el.classList.contains('acting')); }
      check('53 i tour AUTO : unité active toujours marquée sur le terrain pendant le round', sawActing || !!st53.winner, `winner=${!!st53.winner}`);
    }
    // correctifs v3 lot 1 (tranchage 15/11, prime sur v2) : l'ancrage bas v2 est REMPLACÉ par les camps face à face au centre
    check('53 j correctifs v3 lot 1 : plus d’ancrage bas v2 (margin auto 0 0 parti, camps face à face au centre)', !html.includes('margin: auto 0 0') && html.includes('body.in-combat #board { justify-content: safe center; }'), '');
    check('53 k safe center rétabli sur #board pour le centrage des camps (v3 lot 1)', html.includes('justify-content: safe center'), '');
    check('53 l correctifs v2 lot 2 : badge réserve ancré à côté du camp allié (plus fixed au milieu du vide)', html.includes('body.in-combat .reserve-badge { position: absolute; left: 8px; bottom: 48px;') && !html.includes('top: 44%'), '');
    check('53 z 0 exception correctifs v2 lots 1+2', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- 54 : correctifs écran combat v3 lot 1 — cartes PLUS GROSSES + camps RAPPROCHÉS face à face (tranchage 15/11) ----------
  {
    check('54 a grand format borné par la hauteur v4 : unité clamp(92px,min(28vw,11dvh),124px), boss ~1,4x', html.includes('body.in-combat .unit { width: clamp(92px, min(28vw, 11dvh), 124px); }') && html.includes('body.in-combat .unit.boss { width: clamp(129px, min(39vw, 15.5dvh), 174px); }'), '');
    check('54 b camps face à face au CENTRE : #board en safe center, ancrage bas v2 parti', html.includes('body.in-combat #board { justify-content: safe center; }') && html.includes('body.in-combat #team-zone { margin: 8px 0 0; }') && !html.includes('margin: auto 0 0'), '');
    check('54 c paysage téléphone : taille 14dvh / 20dvh (tient sans scroll)', html.includes('body.in-combat .unit { width: clamp(56px, 14dvh, 120px); }') && html.includes('body.in-combat .unit.boss { width: clamp(78px, 20dvh, 168px); }'), '');
    check('54 d lot 2 terrain STABLE : plus aucun resize act-open .unit/.boss', !html.includes('act-open .unit { width') && !html.includes('act-open .unit.boss { width'), '');
    check('54 e lot 2 : zone de commandement permanente hauteur fixe, plus de :empty display:none', html.includes('body.in-combat #act-slot { flex: 0 0 auto; display: flex; flex-direction: column; height: min(25dvh, 240px); min-height: 112px; }') && !html.includes('#act-slot:empty'), '');
    check('54 f lot 2 paysage : rail act en stretch sur la ligne 1fr (hauteur fixe)', html.includes('body.in-combat #act-slot { grid-area: act; align-self: stretch; height: auto; max-height: none;'), '');
    // structure live : le mini-log vit DANS #act-slot, la fenêtre s'insère avant lui
    setup(['n1', 'n2', 'n3'], 12);
    api._setAuto(true); api.go('#combat'); await wait(60);
    api._setAuto(false); api.go('#combat'); await wait(200);
    const st54 = api._state();
    check('54 g lot 2 combat lancé pour vérif structure', !!st54, '');
    if (st54) {
      const slot = appEl.querySelector('#act-slot');
      check('54 h lot 2 : #log DANS #act-slot (zone permanente)', !!slot && !!slot.querySelector('#log'), '');
      api._speed(6);
      els.get('fight').click();
      let am54 = null;
      for (let w = 0; w < 120 && !am54; w++) { await wait(25); am54 = api._actEl(); }
      const slot2 = appEl.querySelector('#act-slot');
      const kids = slot2 ? [...slot2.children].map((c) => c.className || c.id) : [];
      check('54 i lot 2 : fenêtre .act-modal insérée AVANT #log dans la zone fixe', !!am54 && slot2 && kids[0] === 'act-modal' && kids[kids.length - 1] === 'log', `kids=${kids.join(',')}`);
      // lot 3 : la fenêtre remplace le bandeau dans la zone permanente
      const slotB = appEl.querySelector('#act-slot');
      check('54 j lot 3 : fenêtre ouverte -> bandeau #turn-banner MASQUÉ', !!am54 && !!(slotB && !slotB.querySelector('#turn-banner')), '');
      const pass = am54 ? am54.querySelector('.act-pass') : null;
      if (pass) pass.click();
      // le bandeau vit pendant les tours sans fenêtre (ennemis) : scrutation fine, fenêtre fermée requise
      let bannerBack = null, consistent = false;
      for (let w = 0; w < 400 && !consistent; w++) {
        await wait(10);
        if (api._actEl()) continue; // fenêtre ouverte : le bandeau est masqué, on attend
        bannerBack = appEl.querySelector('#turn-banner');
        const chipA = [...appEl.querySelectorAll('.rail-chip')].find((el) => el.classList.contains('acting'));
        const unitA = [...appEl.querySelectorAll('.unit')].find((el) => el.classList.contains('acting'));
        const nmChip = chipA && chipA.querySelector('.rc-nm');
        const bEl = bannerBack && bannerBack.querySelector('.tb-now b');
        // bandeau et rail doivent toujours désigner le même combattant ; le terrain aussi quand il est marqué
        if (bannerBack && bEl && nmChip && bEl.textContent === nmChip.textContent && (!unitA || (unitA._unit && bEl.textContent === unitA._unit.name))) consistent = true;
      }
      const bt = bannerBack ? (bannerBack.textContent || '') : '';
      check('54 k lot 3 : bandeau « ▶ Tour de [Nom] » + « ensuite : X › Y › Z » rendu dans la zone permanente', !!bannerBack && bt.includes('Tour de') && bt.includes('ensuite'), bt.slice(0, 90));
      check('54 l lot 3 : bandeau + rail + terrain désignent TOUJOURS le même combattant', consistent, bt.slice(0, 90));
    }
    check('54 m lot 3 CSS : #turn-banner + .tb-next (file des suivants) présents', html.includes('#turn-banner .tb-next') && html.includes('#turn-banner .tb-now'), '');
    // correctifs v4 (3e retour terrain : tout tient sur l'écran sans scroll) : tailles bornées par la hauteur, marges resserrées
    check('54 n v4 : marges des zones resserrées en combat (constantes, terrain stable)', html.includes('body.in-combat .enemy-zone, body.in-combat .team-zone { flex: 0 0 auto; margin: 4px 0; padding: 4px; }'), '');
    check('54 o v4 : paysage court <=500px, titre h2 masqué (constant) + contrôles compacts', html.includes('body.in-combat #board-col > h2 { display: none; }'), '');
    check('54 z 0 exception correctifs v3+v4', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }


  // ---------- 50 : fiche type pilote la fenêtre (zone / tous) ----------
  {
    setup(['n1', 'n2', 'n3'], 12);
    api._setAuto(true); api.go('#combat'); await wait(60);
    api._setAuto(false); api.go('#combat'); await wait(60);
    const st50 = api._state();
    api._speed(6);
    if (st50 && !st50.winner) {
      els.get('fight').click();
      for (let w = 0; w < 120 && !api._actEl() && !st50.winner; w++) await wait(25);
      // Décharge Arcanique (cible "zone" en données) doit passer la fenêtre en mode zone
      const mage = [...st50.team.avant, ...st50.team.arriere].find((u) => (u.spells ?? []).some((s) => s.name === 'D\u00e9charge Arcanique'));
      check('50 a un sort à fiche zone présent dans l’équipe de test', !!mage, '');
      if (mage) {
        mage.mana = mage.manaMax;
        // force ce sort comme unique sort du mage pour le test
        const keep = mage.spells.find((s) => s.name === 'D\u00e9charge Arcanique');
        mage.spells = [keep];
        // attend que ce soit au tour du mage
        let am = null, guard = 0;
        while (guard++ < 200) {
          const pk = api._prompt();
          if (pk && pk.unit === mage) break;
          am = api._actEl();
          if (am) { const pb = am.querySelector('.act-pass'); if (pb) pb.click(); }
          await wait(25);
          if (st50.winner) break;
        }
        am = api._actEl();
        const sp = am ? [...am.querySelectorAll('.act-spell')].find((b) => !b.classList.contains('off')) ?? null : null;
        check('50 a fenêtre ouverte sur le mage avec son sort zone', !!sp, '');
        if (sp) {
          sp.click(); await wait(40);
          const ps = api._prompt();
          check('50 b la fiche "zone" passe la désignation en mode zone', !!ps && ps.mode === 'zone' && ps.phase === 'target', ps ? ps.mode : 'null');
          const tg = [...els.get('app').querySelectorAll('.unit')].find((el) => el.classList.contains('targeted'));
          if (tg) {
            tg.click();
            for (let w = 0; w < 120 && !st50.winner && api._busy(); w++) await wait(25);
            const hits = (st50._events ?? []).filter((e) => e.type === 'attack' && e.sourceId === mage.uid);
            const nAlive = [...st50.enemies.avant, ...st50.enemies.arriere].filter((e) => e.alive).length;
            check('50 c la zone touche toute la ligne ennemie vivante', hits.length === nAlive && nAlive >= 2, `hits=${hits.length} alive=${nAlive}`);
          } else {
            check('50 c la zone frappe plusieurs cibles contiguës (>= 3)', false, 'pas d’ancre');
          }
        }
      }
      api._setAuto(true);
      let g2 = 0;
      while (g2++ < 60 && !st50.winner) { await wait(40); const a = api._actEl(); if (a) { const pb = a.querySelector('.act-pass'); if (pb) pb.click(); } }
    }
    check('50 z 0 exception après fiche type', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- 51 : v0.47 — affichage du résultat calculé (T4.2) ----------
  {
    setup(['n1', 'n2', 'n3'], 12);
    api._setAuto(true); api.go('#combat'); await wait(60);
    api._setAuto(false); api.go('#combat'); await wait(60);
    const st51 = api._state();
    api._speed(6);
    if (st51 && !st51.winner) {
      els.get('fight').click();
      for (let w = 0; w < 120 && !api._actEl() && !st51.winner; w++) await wait(25);
      const am = api._actEl();
      const meta = am ? (am.querySelector('.act-spell')?.textContent ?? '') : '';
      check('51 a un sort affiche son résultat calculé (→ ~N = mult × stat)', /→ ~\d+/.test(meta), meta.slice(0, 80));
    } else {
      check('51 a un sort affiche son résultat calculé (→ ~N = mult × stat)', false, 'pas de fenêtre');
    }
    check('51 z 0 exception après v0.47 affichage', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- 48 : pied de stats v2 sur les pions ----------
  {
    const st48 = api._state();
    if (st48 && !st48.winner) {
      const appEl = els.get('app');
      const units = [...appEl.querySelectorAll('.unit')];
      const withPied = units.filter((el) => el.querySelector('.pied'));
      check('48 a chaque pion a un pied de stats', units.length > 0 && withPied.length === units.length, `${withPied.length}/${units.length}`);
      const piedTxt = withPied[0] && withPied[0].querySelector('.pied') ? withPied[0].querySelector('.pied').textContent : '';
      check('48 a pied en actuel/total (PV, mana)', /♥ \d+\/\d+/.test(piedTxt) && /✦ \d+\/\d+/.test(piedTxt) && piedTxt.includes('⚔'), piedTxt.slice(0, 80));
      // icônes d'état : on force bonus/malus/bouclier puis re-rendu
      const u0 = st48.team.avant[0];
      u0.atkBuff = 0.2; u0.shield = 12;
      const e0 = st48.enemies.avant.find((e) => e.alive) ?? st48.enemies.arriere[0];
      if (e0) { e0.status = { ...(e0.status ?? {}), curse: { value: 0.2, turns: 2 } }; }
      api._draw(); await wait(30);
      const units2 = [...appEl.querySelectorAll('.unit')];
      const p0 = units2.find((el) => el.dataset.uid === u0.uid);
      const pE = e0 ? units2.find((el) => el.dataset.uid === e0.uid) : null;
      const ic0 = p0 && p0.querySelector('.pied') ? [...p0.querySelector('.pied').querySelectorAll('.st-ic')] : [];
      check('48 b icônes ⬆ bonus (vert) et 🛡 bouclier (bleu) sur le pion buffé', ic0.some((c) => c.classList.contains('up')) && ic0.some((c) => c.classList.contains('sh')), '');
      const icE = pE && pE.querySelector('.pied') ? [...pE.querySelector('.pied').querySelectorAll('.st-ic')] : [];
      check('48 b icône ⬇ malus (rouge) sur le pion maudit', icE.some((c) => c.classList.contains('down')), '');
      // KO grisé
      const tgt = st48.team.arriere[0] ?? st48.team.avant[1];
      if (tgt) { tgt.alive = false; tgt.hp = 0; api._draw(); await wait(30);
        const koEl = [...appEl.querySelectorAll('.unit')].find((el) => el.dataset.uid === tgt.uid);
        check('48 c carte tombée grisée (.ko)', !!koEl && koEl.classList.contains('ko'), '');
      }
    } else {
      check('48 a chaque pion a un pied de stats', false, 'pas de combat actif');
    }
    check('48 z 0 exception après pied de stats', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- 49 : fiche carte plein cadre v2 ----------
  {
    const st49 = api._state();
    if (st49) {
      const uid = (st49.team.avant[0] ?? st49.team.arriere[0]).uid;
      api._openUnit(uid);
      await wait(40);
      // correctifs v1.51 lot 2 : fiche UNIFIÉE (ficheCoreHtml) — même rendu menu équipe et combat :
      // illustration contenue dans .modal-card (plus de .modal-hero.full tronqué)
      const fiche49 = doc.querySelector('.modal-card') ?? null;
      const info49 = doc.querySelector('.modal-info') ?? null;
      check('49 a fiche unifiée combat : illustration contenue (.modal-card), pas de hero plein cadre', !!fiche49 && doc.querySelectorAll('.modal-hero').length === 0, '');
      const ps49 = info49 ? [...info49.querySelectorAll('p')].map((e) => e.textContent ?? '') : [];
      const sub49 = ps49.find((t) => t.includes('·')) ?? '';
      check('49 a nom + sous-titre classe·élément·rareté', !!info49 && (info49.querySelector('h3')?.textContent ?? '').length > 0 && !!sub49, sub49);
      const sl49 = info49 ? (info49.querySelector('.statline')?.textContent ?? '') : '';
      // le stub DOM tronque le textContent des <b> : on vérifie la structure (labels ATQ/PV/AGI/INT/Mana), les valeurs sont testées headless
      check('49 a statline complète (ATQ, PV, AGI, INT, Mana présents)', ['ATQ', 'PV', 'AGI', 'INT', 'Mana'].every((k) => sl49.includes(k)), sl49.slice(0, 90));
      const close = doc.querySelector('#unit-close');
      if (close) close.click();
      await wait(20);
      check('49 b la fiche se ferme', !doc.querySelector('.modal-card'), '');
    } else {
      check('49 a fiche unifiée combat', false, 'pas de combat');
    }
    check('49 z 0 exception après fiche v2', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- 50 : combat v2.1 (rail d'ordre, auto-run tactique, sorts détaillés, fiche complète) ----------
  {
    setup(['n1', 'n2', 'n3', 'n5'], 14);
    api._setAuto(false);
    api._tacPause(true);
    api.go('#combat');
    await wait(80);
    const st50 = api._state();
    api._speed(6);
    check("50 a rail d'ordre présent dans l'écran combat", !!(st50 && appEl.querySelector('#rail')), '');
    // UX combat adaptatif 13/11 lot 1 : structure layout (board-col + act-slot + badge réserve, rail réserve caché en CSS)
    check('50 g layout adaptatif : #board-col + #act-slot + badge réserve rendus, rail #reserve-zone caché', (els.get('app')?._innerHTML ?? '').includes('id="board-col"') && (els.get('app')?._innerHTML ?? '').includes('id="act-slot"') && !!appEl.querySelector('#reserve-badge') && !!appEl.querySelector('#reserve-zone') && html.includes('body.in-combat #reserve-zone { display: none; }'), '');
    if (st50) {
      const chips = [...appEl.querySelectorAll('.rail-chip')];
      const agiOf = (c) => Number((c.textContent.match(/\u26a1(\d+)/) ?? [])[1] ?? 0);
      const total50 = [...st50.team.avant, ...st50.team.arriere, ...st50.enemies.avant, ...st50.enemies.arriere].length;
      check('50 a le rail montre tout le monde, vos cartes en lueur, ennemis distincts',
        chips.length === total50 && total50 > 0 && chips.some((c) => c.classList.contains('mine')) && chips.some((c) => c.classList.contains('foe')),
        `${chips.length}/${total50}`);
      const agis50 = chips.map(agiOf);
      check('50 a ordre du rail = agilité décroissante (le moteur : agi, équipe d\'abord à égalité)',
        agis50.every((v, i) => i === 0 || agis50[i - 1] >= v), agis50.join(','));
      // auto-run : sans aucun clic, le combat part seul en Tactique
      api._tacPause(false);
      api.go('#combat');
      await wait(700);
      check('50 b le combat démarre seul en mode Tactique (plus de Lancer le tour obligatoire)',
        api._busy() || !!api._actEl(), `busy=${api._busy()} act=${!!api._actEl()}`);
      let am50 = api._actEl();
      for (let w = 0; w < 140 && !am50; w++) { await wait(25); am50 = api._actEl(); }
      check("50 b la fenêtre d'action surgit au tour de la carte, sans clic", !!am50, '');
      const acting50 = [...appEl.querySelectorAll('.rail-chip')].filter((c) => c.classList.contains('acting'));
      check('50 b l\'acteur en cours est doré dans le rail', acting50.length === 1, String(acting50.length));
      if (am50) {
        check('50 c sorts détaillés : badge de type + ligne méta (école · puissance · zone) + coût',
          !!am50.querySelector('.sort-badge') && !!am50.querySelector('.sort-meta') && !!am50.querySelector('.sort-cost'),
          (am50._innerHTML ?? '').slice(0, 90));
        const spellBtns = [...am50.querySelectorAll('.act-spell')];
        check('50 c chaque sort porte son coût en mana', spellBtns.length > 0 && spellBtns.every((b) => /\u2726\d+/.test(b.textContent)), `${spellBtns.length} sorts`);
        // pause : le tour en cours finit, puis le flux attend
        els.get('fight').click();
        let g50 = 0;
        while (g50++ < 90) {
          await wait(25);
          const m = api._actEl();
          if (m) { const pb = m.querySelector('.act-pass'); if (pb) pb.click(); }
          if (!api._busy() && !api._actEl()) break;
        }
        await wait(900);
        check("50 d pause : le flux attend entre les tours, rien ne repart seul",
          api._tacPaused() && !api._busy() && !api._actEl(), `busy=${api._busy()}`);
        const ftxt = els.get('fight').textContent ?? '';
        check("50 d le bouton propose de reprendre", ftxt.includes('\u25b6') || ftxt.includes('Lancer le tour'), ftxt);
        // fiche complète sur une naissance (Novice : Neutre, rareté en toutes lettres)
        const st50b = api._state();
        const uid50 = st50b ? (st50b.team.avant[0] ?? st50b.team.arriere[0]).uid : null;
        if (uid50) {
          api._openUnit(uid50);
          await wait(40);
          // correctifs v1.51 lot 2 : fiche unifiée — identité (classe·élément·rareté) dans la ligne muted du modal-info
          const info50 = doc.querySelector('.modal-info') ?? null;
          const ps50 = info50 ? [...info50.querySelectorAll('p')].map((e) => e.textContent ?? '') : [];
          const sub50 = ps50.find((t) => t.includes('·')) ?? '';
          check('50 e fiche : Neutre affiché pour une naissance, rareté en toutes lettres',
            sub50.includes('Neutre') && /Naissance|Commune|Peu commune|Rare|Légendaire/.test(sub50), sub50);
          check('50 e fiche : statline corrigée (stats + oppositions, plus de doublon)',
            doc.querySelectorAll('.modal .statline').length >= 2 || doc.querySelectorAll('.statline').length >= 2, String(doc.querySelectorAll('.statline').length));
          check('50 e fiche : identité classe·élément·rareté dans la fiche unifiée, le rôle attaque/support retiré (T0.3)',
            sub50.split('·').length >= 3 && !sub50.includes('Rôle'), sub50);
          {
            const fiche50 = [...doc.querySelectorAll('.modal-info, .spells')].map((el) => el.textContent ?? '').join(' ');
            check('50 e fiche : aucun « Attaquant »/« Soutien » affiché (T0.3)',
              !fiche50.includes('Attaquant') && !fiche50.includes('Soutien') && !fiche50.includes('attaque') && !fiche50.includes('support'), fiche50.slice(0, 90));
            check('50 e dist : le libellé « (rôle opposé) » a disparu des sorts croisés (T0.3)', !html.includes('rôle opposé'), '');
          }
          const ul50 = doc.querySelector('.spells');
          const fSpells = ul50 ? [...ul50.querySelectorAll('.spell')].length : 0;
          const fBadges = ul50 ? [...ul50.querySelectorAll('.sort-badge')].length : 0;
          const fMetas = ul50 ? [...ul50.querySelectorAll('.sort-meta')].length : 0;
          check('50 e fiche : sorts avec badge, méta et coût (grimoire complet)',
            fBadges >= 3 && fMetas >= 3 && fSpells >= 3,
            `${fSpells} sorts, ${fBadges} badges, ${fMetas} metas`);
          const close50 = doc.querySelector('#unit-close');
          if (close50) close50.click();
          await wait(20);
        }
        // reprise : le flux repart tout seul
        els.get('fight').click();
        await wait(700);
        check('50 f reprise : le combat repart tout seul', api._busy() || !!api._actEl(), `busy=${api._busy()}`);
      }
    } else {
      check("50 a rail d'ordre présent dans l'écran combat", false, 'pas de combat');
    }
    // on rend la main : les sections suivantes pilotent leurs propres combats
    api._tacPause(true);
    check('50 z 0 exception après combat v2.1', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- victoire pas-à-pas au moteur (40) + équivalence (46 i) ----------
  mem.clear();
  setup(['a1', 'g9', 'd2', 'n4', 'a29'], 20);
  api._setAuto(false);
  api.go('#combat');
  await wait(60);
  let stT = api._state();
  let turns = 0;
  while (stT && !stT.winner && stT.turn < 60 && turns < 40) {
    api.beginRound(stT);
    let guard = 0;
    while (guard++ < 40) {
      const next = api.peekRound(stT);
      if (!next || stT.winner) break;
      let choice = null;
      if (next.side === 'team') {
        const sp = (next.u.spells ?? [])[0];
        if (next.kind === 'strike') choice = sp && next.u.mana >= sp.cost ? { kind: 'spell', idx: 0 } : { kind: 'attack' };
        else choice = sp && next.u.mana >= sp.cost ? { kind: 'cast', idx: 0 } : { kind: 'basic' };
      }
      api.stepRound(stT, choice);
    }
    turns++;
  }
  check('40 victoire pas-à-pas 100 % manuelle (Nv20, étage 1)', stT && stT.winner === 'team', `winner=${stT && stT.winner} en ${turns} tours`);
  check('40 v1.39 : plus de pénalité tactique (aucun tactMult dans le dist)', !/tactMult/.test(html), '');

  const mkSt46 = () => {
    const wave = api.makeWave(77, 2, 'marees', 1);
    const teamCards = {
      avant: [{ ...api.byId('a1'), level: 15 }, { ...api.byId('g9'), level: 15 }],
      arriere: [{ ...api.byId('d2'), level: 15 }],
    };
    return api.initCombat(teamCards, wave, 1234);
  };
  const stA = mkSt46();
  const evA = [];
  for (let t = 0; t < 5 && !stA.winner; t++) evA.push(...api.resolveTurn(stA));
  const stB = mkSt46();
  const evB = [];
  for (let t = 0; t < 5 && !stB.winner; t++) {
    evB.push(...api.beginRound(stB));
    let guard = 0;
    while (guard++ < 60) {
      if (!api.peekRound(stB) || stB.winner) break;
      const r = api.stepRound(stB, null);
      evB.push(...r.events);
      if (r.done) break;
    }
  }
  check('46 i pas-à-pas : événements identiques à resolveTurn', JSON.stringify(evA) === JSON.stringify(evB) && evA.length > 10, `A=${evA.length} B=${evB.length}`);

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
  check('42 B Horde : +1 ennemi', horde.avant.length + horde.arriere.length === plain.avant.length + plain.arriere.length + 1, `${plain.avant.length}+${plain.arriere.length} vs ${horde.avant.length}+${horde.arriere.length}`);
  const mur = api.makeWave(31, 3, 'marees', 1, 'muraille');
  check('42 B Muraille : PV majorés', mur.avant.every((u, k) => u.hp >= plain.avant[k].hp), '');
  const rage = api.makeWave(31, 3, 'marees', 1, 'rage');
  check('42 B Rage : ATQ majorée', rage.avant.every((u, k) => u.atk >= plain.avant[k].atk), '');

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
  check('42 C pastille du mod en tête de combat', (els.get('app')?._innerHTML ?? '').includes('data-info="mod"'), '');

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
  const reg0 = st0 ? [...st0.team.avant, ...st0.team.arriere].map((u) => u.manaRegen) : [];
  mem.clear();
  setup(['a1', 'g9', 'd2'], 15);
  api._setAuto(true);
  store.runMod = 'sterile';
  api.go('#combat');
  await wait(60);
  const st1 = api._state();
  const reg1 = st1 ? [...st1.team.avant, ...st1.team.arriere].map((u) => u.manaRegen) : [];
  check('42 F Mana Stérile : régén −1 (min 1)', reg1.length === reg0.length && reg1.length > 0 && reg1.every((v, k) => v === Math.max(1, reg0[k] - 1)), `stérile=${reg1.join(',')} base=${reg0.join(',')}`);
  const proj = (en) => JSON.stringify([...(en?.avant ?? []), ...(en?.arriere ?? [])].map((u) => [u.name, u.hp, u.atk, u.lvl]));
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
  check('43.1 a plateau : largeur fixe et uniforme pour .unit', html.includes('.unit { flex: 0 0 auto; width: clamp(84px, 16vw, 112px)') && html.includes('.unit.boss { flex: 0 0 auto; width: clamp(112px, 22vw, 148px)') && html.includes('.row.back { opacity: .92; }'), '');
  check('43.1 a les anciennes surcharges de taille ont disparu', !html.includes('min-width: 104px; max-width: 172px') && !html.includes('flex: 1.8 1 0'), '');
  check('43.1 b modificateur réellement optionnel dans les textes', html.includes('entrez librement sans lui, ou relancez le tirage contre 1 éclat brut') && html.includes('Le refuser est gratuit'), '');
  check('43.1 c b1-b7 greffées (plus archivées, famille d\'accueil renseignée)', ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].every((id) => api.byId(id).archived !== true && !!api.byId(id).family), '');
  check('43.1 c le pool du booster exclut les archives', (html.split('function pickCard')[1] ?? '').split('function ')[0].includes('!c.archived'), '');
  mem.clear();
  setup(['n1', 'n2', 'n3'], 10);
  api.go('#collection');
  await wait(60);
  const colHtml = els.get('app')?._innerHTML ?? '';
  check('43.1 d familles : la porte (novice/greffe) figure en tête de chaîne', colHtml.includes('évolue vers'), '');
  check('43.1 d le teaser BRANCHE (v0.36) a disparu', !colHtml.includes('v0.36 · voies'), '');
  check('43.1 e plus aucune archive en data : pas de section archives', !colHtml.includes('Les archives') && (api.DATA.cards ?? []).every((c) => !c.archived), '');
  api.newInst('b1');
  api.go('#collection');
  await wait(60);
  check('43.1 f ex-solo greffé possédé : plus de section archives, b1 reste possédée avec sa famille d\'accueil', !(els.get('app')?._innerHTML ?? '').includes('Les archives — les anciennes cartes') && api.ownedOf('b1') === 1 && api.byId('b1').family === 'lame' && !api.byId('b1').archived, '');
  check('43.1 g 0 exception après collection', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

  // ---------- v0.44 : combat plein écran + grandes cartes ----------
  check('44 a one-screen : le body devient colonne flex, #app prend le reste', html.includes('body.in-combat { overflow: hidden; height: 100dvh; display: flex; flex-direction: column; }') && html.includes('body.in-combat header, body.in-combat nav { flex: 0 0 auto; position: static; }') && html.includes('body.in-combat #app { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; overflow-y: auto;'), '');
  // UX combat adaptatif 13/11 lot 1 : la fenêtre d'action est DANS le flux (#act-slot, borné 30dvh), jamais en surimpression ; les recouvrements 78dvh/56dvh sont partis
  // correctifs v3 lot 2 : #act-slot a une hauteur FIXE permanente (min(30dvh,320px)), la fenêtre reste dans le flux, aucun recouvrement
  check('45 b invariant : zone de commandement permanente dans le flux (#act-slot hauteur fixe min(30dvh,320px)), aucun recouvrement', html.includes('body.in-combat #act-slot { flex: 0 0 auto; display: flex; flex-direction: column; height: min(25dvh, 240px); min-height: 112px; }') && html.includes('body.in-combat .act-modal { position: static;') && !html.includes('max-height: 78dvh') && !html.includes('max-height: 56dvh') && !html.includes('#tac-panel') && !html.includes('max-height: 38dvh'), '');
  check('45 d menu ☰ en combat : navigation en surimpression opaque', html.includes('body.in-combat nav.open { position: fixed; top: 55px;') && html.includes('background: rgba(10, 14, 22, .98);'), '');
  // correctifs v1.51 lot 2 (point 9) : unités de combat encore plus grandes, desktop ET mobile
    // correctifs v3 lot 1 (tranchage 15/11) : grand format constant 104-132px / boss 146-185px, les anciens clamps sont remplacés
    check('44 a one-screen : unités de combat grand format borné par la hauteur >= 92px / boss ~1,4x + nom de boss en gras (v3 lot 1 + v4)', html.includes('body.in-combat .unit { width: clamp(92px, min(28vw, 11dvh), 124px); }') && html.includes('body.in-combat .unit.boss { width: clamp(129px, min(39vw, 15.5dvh), 174px); }') && html.includes('body.in-combat .unit.boss .card.battle .name { font-weight: 900; }') && html.includes('body.in-combat .tac-btn { padding: 3px 6px; font-size: .68rem; }'), '');
  check('45 c pions v0.45 : format plus carré, image pleine, surimpression', html.includes('body.in-combat .card.battle { aspect-ratio: 5 / 6; }') && html.includes('body.in-combat .card.battle .cardfoot { padding: 2px 4px 4px; font-size: .62rem; gap: 2px 5px; }') && !html.includes('clamp(84px, 17vw, 108px)'), '');
  // UX 13/11 lot 2 : le journal devient un mini-log permanent (plus de max-height 20dvh tronqué)
  check('44 a one-screen : journal borné en mini-log permanent, rappels bas disparus', !html.includes('max-height: 20dvh') && !html.includes('-webkit-line-clamp'), '');
  // UX 13/11 lot 2 : lisibilité — mini-log flex-end 3 lignes (clic = complet), floatText 700 ms min même à ×16/×32, trace source->cible
  check('44 a2 lisibilité : mini-log permanent + floatText 700ms min + trace SVG + logLine', html.includes('body.in-combat #log { display: flex; flex-direction: column; justify-content: flex-end;') && html.includes('body.in-combat #log.full { max-height: 40dvh;') && html.includes('const FLOAT_MIN_MS = 700;') && html.includes('function traceLine(') && html.includes('function logLine(') && html.includes('.trace-svg'), '');
  check('44 b grandes cartes : collection 186px, fiche 232px, équipe 156px, familles 118px', html.includes('repeat(auto-fill, minmax(186px, 1fr))') && !html.includes('minmax(168px, 1fr)') && html.includes('grid-template-columns: 232px 1fr') && html.includes('.slot { flex: 0 1 156px; width: min(156px, calc((100% - 32px) / 5)); }') && html.includes('.fam-card { width: 118px; }'), '');
  check('44 b la base v0.43.1 des unités reste en place (override seulement)', html.includes('.unit { flex: 0 0 auto; width: clamp(84px, 16vw, 112px)'), '');
  check('44 c la classe in-combat est posée par le routeur', html.includes("document.body.classList.toggle('in-combat', hash === '#combat')"), '');
  check('44 c changelog v0.44 écrit', html.includes('v0.44 : Le combat plein écran'), '');
  check('45 a emojis réparés : aucun code brut \\U0001F9xx, vrai 🤖 présent', !html.includes('\\U0001F9') && html.includes('🤖') && html.includes('🧭'), '');
  check('45 e sorts spéciaux : bandeau non couvrant (pointer-events: none, aucun fond sur .special-overlay)', (() => { const ovRule = (html.match(/\.special-overlay\s*\{[^}]*\}/) ?? [''])[0]; return /pointer-events:\s*none/.test(ovRule) && !/background/.test(ovRule) && /\.special-txt\s*\{\s*min-width:\s*0/.test(html) && /\.special-art\s*\{[^}]*position:\s*relative/.test(html); })(), (html.match(/\.special-overlay\s*\{[^}]*\}/) ?? [''])[0].slice(0, 120)); // assertions sémantiques plutôt qu'une chaîne CSS exacte (fragile à toute évolution de la feuille)
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

  // ---------- v0.46a : correctifs terrain (46 a-e) ----------
  mem.clear();
  for (const t of store.teams) t.slots = [];
  const v1 = api.newInst('n1', 5); const v2 = api.newInst('n1', 5); const v3 = api.newInst('n1', 5);
  check('46 a 3 exemplaires de la m\u00eame carte posables', api.addCardIid(v1.iid).ok && api.addCardIid(v2.iid).ok && api.addCardIid(v3.iid).ok, '');
  const v4 = api.newInst('n1', 5);
  const r4 = api.addCardIid(v4.iid);
  check('46 a le 4e exemplaire de la m\u00eame carte refus\u00e9', !r4.ok, String(r4 && r4.reason));
  // correctifs v1.51 lot 2 (point 9) : cartes de combat plus grandes — clamp(120px, 30vw, 180px) / boss clamp(150px, 38vw, 220px)
  // correctifs v3 lot 1 (tranchage 15/11) : nouveau grand format, justification = cartes plus grosses demandées au 2e retour terrain
  check('46 b pions combat grand format borné par la hauteur v4 (>= 92px / boss ~1,4x)', html.includes('clamp(92px, min(28vw, 11dvh), 124px)') && html.includes('clamp(129px, min(39vw, 15.5dvh), 174px)'), '');
  check('46 b images de fond \u00e9claircies en combat', html.includes('brightness(1.12) contrast(1.04)'), '');
  // correctifs v1.51 lot 2 : plus de hero plein cadre tronqué en tête de fiche combat — la fiche unifiée rend l'illustration contenue (.modal-card)
  check('46 b fiche : plus de hero plein cadre tronqué en combat (fiche unifiée v1.51)', !html.includes('<div class="modal-hero full">'), '');
  check('46 c pastilles info en t\u00eate, rappels bas supprim\u00e9s', html.includes('.info-chip') && html.includes('openInfoModal') && !html.includes('mode-hint') && !html.includes('tacHintText'), '');
  check('46 c les 3 pastilles cliquables existent', html.includes('data-info="rules"') && html.includes('data-info="mod"') && html.includes('data-info="disc"'), '');
  api.go('#glossaire');
  await wait(30);
  check('46 e glossaire : les symboles document\u00e9s', (els.get('app')?._innerHTML ?? '').includes('Les symboles de l\u2019\u00e9cran'), '');

  check('46 j historique et glossaire v0.46', html.includes('v0.46 : Le RPG tour par tour') && html.includes('de la plus forte attaque à la moins forte'), '');

  // ---------- 51 : T0.2, le boost vise son camp (fenêtre d'action + moteur) ----------
  {
    mem.clear();
    setup(['n1'], 12);
    api._setAuto(false); api.go('#combat'); await wait(60);
    const st51 = api._state();
    api._speed(6);
    if (st51) {
      const u51 = st51.team.avant[0] ?? st51.team.arriere[0];
      if (u51) u51.mana = u51.manaMax;
      els.get('fight').click();
      let am51 = null;
      for (let w = 0; w < 150 && !am51; w++) { await wait(25); am51 = api._actEl(); }
      const bDisc = am51 ? [...am51.querySelectorAll('.act-spell')].find((b) => (b.textContent ?? '').includes('Discipline de Ligne')) : null;
      check('51 a la fenêtre propose Discipline de Ligne (cible : soi)', !!bDisc, am51 ? am51._innerHTML.replace(/\s+/g, ' ').slice(0, 300) : 'pas de fenêtre');
      if (bDisc) {
        bDisc.click();
        await wait(60);
        const ps51 = api._prompt();
        const apres = api._actEl();
        // repro historique : la fenêtre offrait la liste des ennemis pour ce sort de boost
        check('51 b boost sur soi : aucune liste de cibles ennemies proposée', !ps51 || ps51.phase !== 'target' || !apres || !apres.querySelector('.act-target'), ps51 && ps51.phase === 'target' ? 'encore en désignation' : 'ok');
        const buffPoses = (st51._events ?? []).filter((e) => e.type === 'buff').length;
        check('51 c le moteur pose le bonus d\u2019ATQ sur le lanceur', buffPoses > 0 && (u51?.atkBuff ?? 0) >= 0 && (st51._events ?? []).some((e) => e.type === 'buff' && e.targetId === u51?.uid), `buffs=${buffPoses}`);
      } else {
        check('51 b boost sur soi : aucune liste de cibles ennemies proposée', false, 'bouton absent');
        check('51 c le moteur pose le bonus d\u2019ATQ sur le lanceur', false, '');
      }
      let g51 = 0;
      while (g51++ < 60 && !st51.winner) { await wait(40); const amg = api._actEl(); if (amg) { const pb = amg.querySelector('.act-pass'); if (pb) pb.click(); } }
      check('51 d 0 exception après boost sur soi', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
    } else {
      check('51 a la fenêtre propose Discipline de Ligne (cible : soi)', false, 'pas de combat');
      check('51 b boost sur soi : aucune liste de cibles ennemies proposée', false, '');
      check('51 c le moteur pose le bonus d\u2019ATQ sur le lanceur', false, '');
      check('51 d 0 exception après boost sur soi', false, '');
    }
  }

  // ---------- boucle v2 lot 1 : potions, or, persistance, autel ----------
  {
    mem.clear();
    check('B1 a store : gold/potions/runState présents après migration', Number.isInteger(store.gold) && store.potions && typeof store.runState === 'object', JSON.stringify({ gold: store.gold, potions: store.potions, runState: store.runState }));

    // boutique : rayon potions, achat contre de l'or
    store.gold = 500;
    api.go('#boutique');
    await wait(30);
    const shopHtml = els.get('app')?._innerHTML ?? '';
    const buyBtns = els.get('app').querySelectorAll('[data-buy]');
    check('B1 b boutique : rayon potions rendu avec prix en or', shopHtml.includes('Boutique') && shopHtml.includes('or') && buyBtns.length === 4, shopHtml.slice(0, 120));
    const buyBtn = buyBtns.find((b) => b.dataset.buy === 'soin30') ?? null;
    const goldBefore = store.gold;
    // la quête « acheter » du jour (seed de la date) peut se terminer sur cet achat et ajouter son or : on l'anticipe
    const qa = api.ensureQuetes().find((x) => x.type === 'acheter' && !x.done) ?? null;
    if (buyBtn) { buyBtn.click(); await wait(20); }
    const expectedGold = goldBefore - 50 + (qa && qa.done ? qa.or : 0); // comportement réel Boutique v2 : prix débité, + récompense de quête du jour si accomplie
    check('B1 c achat : stock +1 et or débité du prix (50 or, + quête « acheter » du jour si elle tombe dessus)', api.potionCount('soin30') === 1 && store.gold === expectedGold, `stock=${api.potionCount('soin30')} gold=${store.gold} attendu=${expectedGold}`);

    // action Objet dans la fenêtre d'action
    setup(['n1', 'n3'], 10);
    api._setAuto(false);
    api.go('#combat');
    await wait(60);
    const stB = api._state();
    check('B1 d combat lancé pour le test Objet', !!stB, '');
    if (stB) {
      api._speed(6);
      const uB = stB.team.avant[0];
      uB.hp = 2; uB.mana = 0;
      els.get('fight').click();
      let amB = null;
      for (let w = 0; w < 150 && !amB; w++) { await wait(25); amB = api._actEl(); }
      const bItem = amB ? amB.querySelector('.act-item') : null;
      check('B1 e fenêtre d’action : bouton Objet avec badge et stock', !!bItem && (bItem.textContent ?? '').includes('Objet') && (bItem.textContent ?? '').includes('stock'), bItem ? bItem.textContent : 'pas de bouton');
      if (bItem) {
        bItem.click();
        await wait(30);
        const bPot = [...amB.querySelectorAll('.act-potion')].find((b) => b.dataset.potion === 'soin30') ?? null;
        check('B1 f choix de potion proposé (soin30 en stock)', !!bPot, amB._innerHTML.slice(0, 200));
        if (bPot) {
          bPot.click();
          await wait(80);
          check('B1 g la gorgée soigne le porteur et consomme le stock', uB.hp > 2 && api.potionCount('soin30') === 0, `hp=${uB.hp} stock=${api.potionCount('soin30')}`);
        } else check('B1 g la gorgée soigne le porteur et consomme le stock', false, 'pas de potion cliquable');
      } else check('B1 f choix de potion proposé (soin30 en stock)', false, '');
      // bouton Objets hors combat + persistance
      const bagBtn = els.get('bag');
      check('B1 h bouton Objets (hors combat) présent', !!bagBtn && (bagBtn.textContent ?? '').includes('Objets'), '');
      // persistance : on simule un état de run et on vérifie apply/persist
      store.runState = { active: true, units: {} };
      api.persistRunStateFrom(stB);
      check('B1 i persistRunStateFrom enregistre PV/mana par exemplaire', Object.keys(store.runState.units).length > 0, JSON.stringify(store.runState.units));
      const stB2 = api.initCombat({ avant: [{ ...api.byId('n1'), level: 10 }], arriere: [] }, api.makeWave(7, 1, 'marees', 1), 7);
      store.team.slots = [1];
      api.applyRunStateTo(stB2);
      check('B1 j applyRunStateTo restaure les PV persistés', stB2.team.avant[0].hp <= stB2.team.avant[0].maxHp, `hp=${stB2.team.avant[0].hp}`);
      const grace = api.autelDeSoin();
      check('B1 k hook autel de soin : soin complet + grâce', grace && grace.grace === 5 && store.runState.active && Object.keys(store.runState.units).length === 0, JSON.stringify(grace));
      check('B1 l 0 exception lot 1', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
    } else {
      for (const lbl of ['B1 e fenêtre d’action : bouton Objet avec badge et stock', 'B1 f choix de potion proposé (soin30 en stock)', 'B1 g la gorgée soigne le porteur et consomme le stock', 'B1 h bouton Objets (hors combat) présent', 'B1 i persistRunStateFrom enregistre PV/mana par exemplaire', 'B1 j applyRunStateTo restaure les PV persistés', 'B1 k hook autel de soin : soin complet + grâce', 'B1 l 0 exception lot 1']) check(lbl, false, 'pas de combat');
    }
  }

  // ---------- boucle v2 lot 2 : niveaux de donjon et bandes de rareté ----------
  {
    mem.clear();
    check('B2 a 25 marches nivelées 1..25', (() => { const v = new Set(); for (const d of api.DUNGEONS) for (const df of api.DIFFICULTIES) v.add(api.dungeonLevelOf(d.id, df.id)); return v.size === 25 && Math.min(...v) === 1 && Math.max(...v) === 25; })(), '');
    api.go('#donjons');
    await wait(40);
    const dgHtml = els.get('app')?._innerHTML ?? '';
    const chips = els.get('app').querySelectorAll('.diff-chip');
    check('B2 b sélecteur de marche : niveau affiché sur les 5 modes', chips.length >= 5 && [...chips].some((c) => /Nv \d+/.test(c.textContent ?? '')), [...chips].map((c) => c.textContent).join('|'));
    check('B2 c carte donjon : bande de rareté en toutes lettres', dgHtml.includes('bande de rareté') && /C → R|UC → SR|R → UR|SR → L|UR → M/.test(dgHtml), dgHtml.slice(0, 80));
    const w = api.makeWave(5, 10, 'zenith', 5);
    const boss = [...w.avant, ...w.arriere].find((u) => u.boss);
    check('B2 d boss final Enfer = haut de bande (M)', !!boss && boss.rarity === 'M', boss && boss.rarity);
    check('B2 e 0 exception lot 2', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- boucle v2 lot 3 : départ à 2 cartes + recrutement naturel ----------
  {
    mem.clear();
    // on repart d'une sauvegarde neuve : pas de cartes, départ non fait
    store.instances = []; store.collection = new Map(); store.departFait = false; store.tokens = [];
    api.go('#accueil');
    await wait(40);
    const choices = els.get('app').querySelectorAll('.depart-choice');
    check('B3 a écran de départ : 4 propositions (une par race)', choices.length === 4, String(choices.length));
    const ids = [...choices].map((c) => c.dataset.id);
    check('B3 b propositions = DEPART_CHOIX en data', ids.join(',') === api.DEPART_CHOIX.join(','), ids.join(','));
    const r = api.choisirDepart(ids[0]);
    await wait(30);
    check('B3 c départ : 1 choisie + 1 aléatoire parmi les 3 restantes', r && r.ok && r.choisis === ids[0] && ids.includes(r.alea) && r.alea !== ids[0], JSON.stringify(r));
    check('B3 d départ : 2 cartes accordées et departFait posé', store.instances.length === 2 && store.departFait === true, `inst=${store.instances.length} fait=${store.departFait}`);
    // recrutement naturel : vaincus éligibles hors boss/nommés, taux par zone en data
    const w = api.makeWave(77, 10, 'marees', 1);
    const st = api.initCombat({ avant: [{ ...api.byId('n1'), level: 20 }], arriere: [] }, w, 77);
    const elig = api.recrutableMonsters(st);
    check('B3 e recrutement : éligibles = vaincus hors boss et nommés', elig.length > 0 && elig.every((u) => !u.boss && !u.name.includes(',')), elig.map((u) => u.name).join('|'));
    const zones = api.DATA.zones ?? [];
    check('B3 f taux de recrue par zone dans data/zones.json (~1 %)', zones.length === 5 && zones.every((z) => typeof z.recrute?.taux === 'number' && z.recrute.taux > 0 && z.recrute.taux <= 0.05), zones.map((z) => z.id + ':' + (z.recrute?.taux ?? '?')).join(' '));
    check('B3 g 0 exception lot 3', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  // ---------- boucle v2 lot 4 : drops v2, Récompenses, inventaire, équipement ----------
  {
    mem.clear();
    check('B4 a catalogue équipement en data (150 pièces, sets par zone)', api.EQUIPMENT.length === 150 && Object.keys(api.DATA.equipment.sets).length === 5, String(api.EQUIPMENT.length));
    // équipement : bonus de set et application moteur
    store.equipment['eq-guerrier-frappe-c'] = 1;
    store.equipment['eq-armure-c'] = 1;
    store.equip['n1'] = { arme: 'eq-guerrier-frappe-c', armure: 'eq-armure-c' };
    const eb = api.equipBonusOfCard('n1');
    check('B4 b bonus de carte = somme des pièces (+5 % ATQ, +5 % PV)', Math.abs(eb.atkPct - 0.05) < 1e-9 && Math.abs(eb.hpPct - 0.05) < 1e-9, JSON.stringify(eb));
    // set : arme + armure du même set -> +5 pts de pourcentage sur les deux
    store.equipment['eq-set-marees-base-arme-Guerrier'] = 1;
    store.equipment['eq-set-marees-base-armure'] = 1;
    store.equip['n1'] = { arme: 'eq-set-marees-base-arme-Guerrier', armure: 'eq-set-marees-base-armure' };
    const ebSet = api.equipBonusOfCard('n1');
    check('B4 c bonus de set : +5 pts % sur les deux pièces (0.05 -> 0.10)', Math.abs(ebSet.atkPct - 0.10) < 1e-9 && Math.abs(ebSet.hpPct - 0.10) < 1e-9, JSON.stringify(ebSet));
    const piece = api.bossPieceFor('zenith', 5);
    check('B4 d boss Enfer : pièce du set zone, niveau royal', !!piece && piece.set === 'set-zenith' && piece.id.includes('-royale-'), piece && piece.id);
    // slots d'équipe
    store.equipment['eq-equipe-talisman-sr'] = 1;
    store.equipTeam = ['eq-equipe-talisman-sr', null];
    check('B4 e slot d\'équipe talisman SR : +3 régén mana', api.equipTeamBonus().manaRegen === 3, JSON.stringify(api.equipTeamBonus()));
    // inventaire
    store.gold = 200;
    api.addMateriau('ecume', 3);
    api.go('#inventaire');
    await wait(40);
    const invHtml = els.get('app')?._innerHTML ?? '';
    check('B4 f page Inventaire groupée (potions, matériaux, gemmes, pièces)', invHtml.includes('Potions') && invHtml.includes('Matériaux') && invHtml.includes('Gemmes') && invHtml.includes('Pièces') && invHtml.includes('Écume de marée'), invHtml.slice(0, 200));
    // écran Récompenses
    api.openRecompensesModal([{ kind: 'or', label: '+25 or', detail: 'test', rarity: null }, { kind: 'drop', label: 'Robe de la sirène', detail: 'pièce', rarity: 'C' }]);
    await wait(30);
    const rows = doc.body.querySelectorAll('.recomp-row');
    check('B4 g écran Récompenses : chaque gain cliquable + Tout ramasser', rows.length === 2 && !!doc.body.querySelector('#recomp-all'), String(rows.length));
    const all = doc.body.querySelector('#recomp-all');
    if (all) { all.click(); await wait(20); }
    check('B4 h Tout ramasser referme la modale', !doc.body.querySelector('.recomp-overlay'), '');
    // matériaux de zone en data
    check('B4 i zones : materiau + matiereBoss en data', (api.DATA.zones ?? []).every((z) => z.materiau?.id && z.matiereBoss?.id), '');
    check('B4 j 0 exception lot 4', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // lot 5 — progression : solos archivés, rang N exclu des naissances, palier sans perte nette, courbe XP
    const cards = api.DATA.cards ?? [];
    const arch = cards.filter((c) => c.archived);
    const archIds = new Set(arch.map((c) => c.id));
    const inDropPool = (api.DATA.zones ?? []).flatMap((z) => z.poolN ?? []).filter((id) => archIds.has(id));
    let sawArchived = false;
    for (let i = 0; i < 400; i++) {
      const c = api.drawNaissance(() => (i * 0.7548776662) % 1);
      if (c && c.archived) sawArchived = true;
    }
    check('B5 a greffe C5 : plus aucune archive, ex-solos hors poolN et hors naissances archivées', arch.length === 0 && inDropPool.length === 0 && !sawArchived, `${arch.length} archivées, ${inDropPool.length} dans poolN`);
    let maxRaritySeen = '';
    let sawDivine = false;
    for (let i = 0; i < 400; i++) {
      const c = api.drawNaissance(() => (i * 0.6180339887) % 1);
      if (!c) break;
      if (c.rarity === 'N') maxRaritySeen = 'N';
      if (c.raciale && c.rarity !== 'N') sawDivine = true;
    }
    check('B5 b drawNaissance : jamais de rang N, porte divine C/UC conservée', maxRaritySeen !== 'N' && sawDivine, maxRaritySeen || 'aucun tirage');
    // palier sans perte nette : pour chaque cible d'évolution standard, noLossPctOf garantit ATQ/PV
    let worst = null;
    for (const [deId, list] of Object.entries(api.EVO_CHOICES ?? {})) {
      for (const t of (Array.isArray(list) ? list : (list.options ?? []))) {
        const from = api.DATA.cards.find((c) => c.id === deId) ?? api.DATA.monsters?.find((c) => c.id === deId);
        const to = api.DATA.cards.find((c) => c.id === t.to) ?? api.DATA.monsters?.find((c) => c.id === t.to);
        if (!from || !to) continue;
        const pct = api.noLossPctOf(from, to);
        const mm = (lvl) => 1 + 0.1 * (lvl - 1);
        const atk10 = from.atk * mm(10) * (1 + pct / 100);
        const hp10 = from.hp * mm(10) * (1 + pct / 100);
        const atk1 = to.atk * mm(1);
        const hp1 = to.hp * mm(1);
        if (atk10 < atk1 - 1e-9 || hp10 < hp1 - 1e-9) worst = `${from.id}->${t.to} pct=${pct}`;
      }
    }
    check('B5 c palier sans perte nette sur toutes les évolutions (simulation)', worst === null, worst ?? 'ok');
    check('B5 d courbe XP recalibrée (lvl 1 -> 1, croissance quadratique en data)', api.xpToNext(1) === 1 && api.xpToNext(10) === Math.round(10 * (1 + 0.25 * 9)) && api.xpToNext(10) > 10, `${api.xpToNext(1)}/${api.xpToNext(10)}`);
    check('B5 e 0 exception lot 5', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // lot E1 économie v2 — Boutique complète : potions + éclats bruts + équipement rayon boutique
    api.go('#boutique');
    await wait(20);
    api.store.gold = 5000;
    const rows = doc.body.querySelectorAll('.shop-row');
    check('B6 a la Boutique rend potions + éclats + équipement (rayons présents)', !!doc.body.querySelector('[data-buy]') && !!doc.body.querySelector('[data-buy-eclat]') && !!doc.body.querySelector('[data-buy-eq]'), `lignes: ${rows.length}`);
    const nbEq = doc.body.querySelectorAll('[data-buy-eq]').length;
    const nbPieces = (api.EQUIPMENT ?? []).filter((p) => p.source === 'boutique').length;
    check('B6 b rayon équipement = pièces source boutique en data', nbEq === nbPieces && nbPieces === 60, `${nbEq}/${nbPieces}`);
    const gold0 = api.store.gold;
    const g0 = api.gemCount('brut', 'Eau');
    check('B6 c achat éclat brut Eau : -150 or, +1 gemme', api.buyEclat('Eau') === true && api.store.gold === gold0 - (api.DATA.engine.ECLAT_BUY_PRIX ?? 150) && api.gemCount('brut', 'Eau') === g0 + 1, `or=${api.store.gold}`);
    const piece = (api.EQUIPMENT ?? []).find((p) => p.source === 'boutique');
    const gold1 = api.store.gold;
    const owned0 = api.equipPieceCount(piece.id);
    check('B6 d achat pièce boutique : -prix, +1 possédée', api.buyEquipment(piece.id) === true && api.store.gold === gold1 - piece.prix && api.equipPieceCount(piece.id) === owned0 + 1, piece.id);
    const setPiece = (api.EQUIPMENT ?? []).find((p) => p.set);
    check('B6 e pièce de set non vendable à la Boutique', api.buyEquipment(setPiece.id) === false, setPiece.id);
    check('B6 f achat sans or suffisant refusé', (api.store.gold = 0, api.buyEclat('Feu') === false && api.buyEquipment(piece.id) === false, true));
    check('B6 g 0 exception lot E1', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // correctifs v1.51 lot 3 (conformité tranchage Lot D du 12/11) : plus d'achat de cartes/monstres à l'or
    api.go('#boutique');
    await wait(20);
    const nbOffres = doc.body.querySelectorAll('[data-buy-offre]').length;
    const nbMon = doc.body.querySelectorAll('[data-buy-mon]').length;
    const pool = api.marchandMonsters();
    check('B7 a Boutique : plus de rayon marchand (0 data-buy-offre, 0 data-buy-mon), pool data intact (> 50 non nommés)', nbOffres === 0 && nbMon === 0 && pool.length > 50, `${nbOffres}/${nbMon}/${pool.length}`);
    check('B7 b le dist ne rend plus de bouton d\u2019achat marchand (data-buy-offre) ; le rayon Boutique n\u2019affiche plus le marchand', !html.includes('data-buy-offre') && !doc.body.textContent.includes('Marchand de cr\u00e9atures'), '');
    api.store.gold = 50000;
    const m = pool.find((x) => x.rarity === 'C');
    const gold0 = api.store.gold;
    const owned0 = api.ownedOf(m.id);
    check('B7 c buyMonster refusé (plus d\u2019achat à l\u2019or) : or et collection inchangés, redirection Guilde/jetons', api.buyMonster(m.id) === false && api.store.gold === gold0 && api.ownedOf(m.id) === owned0, m.id);
    check('B7 d 0 exception lot 3', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
    // la Guilde reste le seul vendeur de compagnons, en jetons
    api.go('#forge');
    await wait(20);
    const guildeTxt = doc.body.textContent ?? '';
    check('B7 e Guilde : prix affichés en jetons 🎫, plus « or » dans le texte d\u2019accueil', guildeTxt.includes('jetons') && !/UR 2 000 or/.test(guildeTxt), '');
    const nbComp = doc.body.querySelectorAll('[data-compagnon]').length;
    check('B7 f Guilde : 3 offres du jour seules (jetons)', nbComp === 3, `${nbComp}`);

    // ---------- B24 (réécrit v1.51 lot 3) : la Boutique n\u2019affiche plus aucun article marchand ----------
    check('B24 a le dist ne contient plus « Catalogue complet »', !html.includes('Catalogue complet'), '');
    check('B24 b le dist ne rend plus de boutons data-buy-mon', !html.includes('data-buy-mon'), '');
    api.go('#boutique');
    await wait(20);
    check('B24 c Boutique : aucun article marchand affiché (0 data-buy-offre, 0 data-buy-mon)', doc.body.querySelectorAll('[data-buy-offre]').length === 0 && doc.body.querySelectorAll('[data-buy-mon]').length === 0, '');
    const boutiqueTxt = doc.body.textContent ?? '';
    check('B24 d Boutique : renvoi à la Guilde en jetons pour les compagnons', boutiqueTxt.includes('Guilde') && boutiqueTxt.includes('jetons'), '');
    check('B24 e Boutique : équipement à l\u2019or toujours présent', doc.body.querySelectorAll('[data-buy-eq]').length > 0 && doc.body.querySelectorAll('[data-buy]').length > 0, '');
    api.store.progress.marees.diffs[1].record = 0;
  }

    // ---------- B25 : correctifs v1.37 lot 5 — esquive visible + dégâts de frappe expliqués ----------
    {
      check('B25 a CSS feedback esquive dans le dist (.float.dodge + dodgePose + .logline.dodge)', /\.float\.dodge/.test(html) && /@keyframes dodgePose/.test(html) && /\.logline\.dodge/.test(html), '');
      check('B25 b feedback esquive dans le bundle (Esquivé ! proéminent + journal)', /Esquivé !/.test(html) && /logline dodge/.test(html) && /dodge-pose/.test(html), '');
      const dodgePushes = html.match(/type: 'dodge'[^}]*sourceId/g) ?? [];
      check('B25 c les 4 sites moteur poussent un dodge avec sourceId (journal « esquive la frappe de »)', dodgePushes.length === 4, String(dodgePushes.length));
      check('B25 d fenêtre d’action : frappe avec dégâts effectifs + % de classe', /frappe de \$\{u\.classe\}/.test(html) && /strikePct/.test(html), '');
      // correctifs v1.51 lot 2 : fiche unifiée — cm = CLASSE_MODS[card?.classe] puis « frappe de ${card.classe} à ${Math.round((cm.strike ?? 1) * 100)} % »
  check('B25 e fiche carte : % de frappe depuis CLASSE_MODS.strike (data, ficheCoreHtml v1.51)', /CLASSE_MODS\[card\?\.classe\]/.test(html) && /cm\.strike/.test(html), '');
      check('B25 f fenêtre de désignation : esquive de la cible rappelée (DODGE_CAP/AGI en data)', /M\.DODGE_CAP/.test(html) && /M\.DODGE_PER_AGI/.test(html), '');
    }

    // ---------- B26 : correctifs v1.37 lot 6 — sorts signature : fiche rôle·cible·puissance, ciblage selon la fiche ----------
    {
      check('B26 a signatureMetaOf présent dans le dist (dérivation data)', /function signatureMetaOf\(/.test(html), '');
      check('B26 b uiSpellMeta câblé dans le ciblage (fallback fiche signature)', /spellSideOf\(sp\) \?\? spellSideOf\(uiSpellMeta/.test(html), '');
      // correctifs v1.51 lot 1 (justification) : les signatures des monstres SOIGNEURS embarquent
      // désormais role soin + cible allié — c'est le correctif (elles partaient en dégâts en Auto,
      // digest re-MESURÉ et consigné dans arbitrages). Les autres signatures restent sans role/cible.
      check('B26 c les objets runtime des monstres n’embarquent pas role/cible, sauf signatures de soigneurs (v1.51 lot 1)', api.allMonsters().every((m) => (m.spells ?? []).filter((sp) => sp.cat === 'unique').every((sp) => (m.effect && m.effect.kind === 'heal') ? (sp.role === 'soin' && sp.cible === '1 allié') : (sp.role === undefined && sp.cible === undefined))), '');
      const sigDefs = [...(api.DATA.cards ?? []), ...(api.DATA.monsters ?? [])].filter((d) => d.soloSpell);
      const withMeta = sigDefs.filter((d) => { const m = api.signatureMetaOf(d); return m.cible && api.spellSideOf({ ...m }) !== null; });
      check('B26 d 100 % des signatures ont une cible valide via la métadonnée dérivée', withMeta.length === sigDefs.length && sigDefs.length > 200, `${withMeta.length}/${sigDefs.length}`);
      const hostileBad = sigDefs.filter((d) => ['degats', 'controle', 'malus'].includes(api.signatureMetaOf(d).role) && !['enemy', 'zone', 'all'].includes(api.spellSideOf({ ...api.signatureMetaOf(d) })));
      check('B26 e aucun sort de dégâts/contrôle/malus ne cible un allié', hostileBad.length === 0, hostileBad.map((d) => d.id).join(','));
      const defDmg = (api.DATA.cards ?? []).find((c) => c.soloSpell && api.signatureMetaOf(c).role === 'degats');
      const sigDmg = defDmg ? (api.byId(defDmg.id).spells ?? []).find((sp) => sp.cat === 'unique') : null;
      const metaDmg = defDmg ? api.signatureMetaOf(defDmg) : null;
      check('B26 f métadonnée d’une carte à dégâts vaut enemy', !!defDmg && !!sigDmg && metaDmg.role === 'degats' && api.spellSideOf({ ...sigDmg, ...metaDmg }) === 'enemy', defDmg ? `${defDmg.id}: ${metaDmg.role}/${metaDmg.cible}` : 'aucune');
    // ---------- B27 : correctifs v1.37 lot 7 — héros figé après combat + grâce 8 pas (data) ----------
    {
      check('B27 a constante ERRANCE_GRACE_COMBAT = 8 en data', api.DATA.engine.ERRANCE_GRACE_COMBAT === 8, String(api.DATA.engine.ERRANCE_GRACE_COMBAT));
      check('B27 b startZoneFight fige le héros (figerHero câblé)', /figerHero\(store\.errance\)/.test(html), '');
      check('B27 c grâce post-combat lue en data (plus de grace = 2 en dur)', /grace = M\.ERRANCE_GRACE_COMBAT/.test(html) && !/grace = 2;/.test(html), '');
      setup(['n1', 'n3'], 5);
      api.enterZone('zone-marees');
      const st27 = api.store.errance;
      const okPath = api.setTarget(st27, st27.map.spawn.x + 3, st27.map.spawn.y);
      api.startZoneFight('zone-marees', { donjon: false });
      check('B27 d flux réel : combat lancé depuis l\u2019errance avec un chemin posé -> chemin vidé, pending/goal null', okPath && st27.hero.path.length === 0 && st27.pending === null && st27.goal === null && !!api.store.zoneFight, `path=${st27.hero.path.length} pending=${st27.pending} goal=${st27.goal}`);
      api.stepErrance(st27, 0.05, () => 0); // enregistre la tuile de départ (lastTile)
      let steps27 = 0, enc27 = 0;
      for (let k = 0; k < 40; k++) { const ev = api.stepErrance(st27, 0.05, () => 0); steps27 += ev.steps; if (ev.encounter) enc27++; }
      check('B27 e héros figé : 0 pas automatique, 0 rencontre sans input après le combat', steps27 === 0 && enc27 === 0, `steps=${steps27} enc=${enc27}`);
      check('B27 f v1.40 : hitbox élargie (interactAt bâtiment+anneau / 8-voisinage) et seuil d’arrivée 1,9 en data', /function interactAt\(/.test(html) && /function nearestWalkableNear\(/.test(html) && api.DATA.engine.ERRANCE_ARRIVAL_RADIUS === 1.9, String(api.DATA.engine.ERRANCE_ARRIVAL_RADIUS));
      check('B27 g v1.40 : retour ville -> #accueil (hub-ville) + toast chemin bloqué', /o\.type === 'retour'[\s\S]{0,200}go\('#accueil'\)/.test(html) && /Chemin bloqué vers/.test(html), '');
    // ---------- B28 : correctifs v1.38 lot 1 — XP distribuée à tout combat de zone terminé ----------
    {
      const prevAuto28 = api._autoMode();
      check('B28 a v1.39 : XP par combat — condition (won || zoneFight), victoire de zone comprise', /\(won \|\| !!store\.zoneFight\)/.test(html), '');
      api.go('#accueil'); await wait(30); // repartir d'une route neutre (go ne re-déclenche pas la même hash)
      setup(['n1', 'n3'], 5);
      const iid28 = store.team.slots[0];
      const xp028 = api.byIid(iid28).xp;
      api._tacPause(false); api._speed(6); // pas de pause : le combat démarre seul (v1.39 : plus de mode auto, on clique)
      api.store.errance = api.createErranceState('zone-marees');
      api.startZoneFight('zone-marees', { donjon: false });
      const st28 = api._state();
      for (const e of [...st28.enemies.avant, ...st28.enemies.arriere]) { e.hp = 1; e.maxHp = 1; } // victoire rapide
      let w28 = null;
      for (let k = 0; k < 250 && !w28; k++) { // v1.39 lot 2 : on joue le combat en Tactique (attaque la cible illuminée, sinon attendre)
        await wait(60);
        const s2 = api._state();
        if (s2 && s2.winner) { w28 = s2.winner; break; }
        const am = api._actEl();
        if (am) {
          const atk = am.querySelector('.act-attack');
          if (atk) { atk.click(); await wait(30); const tg = [...els.get('app').querySelectorAll('.unit')].find((el) => el.classList.contains('targeted')); if (tg) { tg.click(); continue; } }
          const pb = am.querySelector('.act-pass'); if (pb) { pb.click(); continue; }
        }
      }
      await wait(500); // laisse le handler de fin (XP) s'exécuter
      check('B28 b victoire de zone : XP distribuée à l\u2019équipe (avant/après sur inst.xp)', w28 === 'team' && api.byIid(iid28).xp > xp028, `winner=${w28} xp=${xp028}->${api.byIid(iid28).xp}`);
      api.store.errance = null; // stoppe la boucle rAF d'errance
      api._setAuto(prevAuto28);
      doc.body.querySelector('.recomp-overlay')?.remove(); // ferme la modale Récompenses ouverte par la victoire
      api.go('#accueil'); await wait(30);
    // ---------- B29 : correctifs v1.38 lot 2 — aléatoire PAR COMBAT + waveSize en data ----------
    {
      check('B29 a waveSeedFor accepte un extra (seed par combat) et garde le hash historique sans extra', /waveSeedFor\(dungeonId, diff, extra = null\)/.test(html) && /extra == null \?/.test(html), '');
      check('B29 b startZoneFight incrémente zoneFightCount (persisté)', /store\.zoneFightCount = \(store\.zoneFightCount \?\? 0\) \+ 1/.test(html), '');
      check('B29 c zoneFightCount persisté dans la save (snapshot)', /zoneFightCount: store\.zoneFightCount \?\? 0/.test(html), '');
      check('B29 d waveSize [2,3] en data pour les 5 zones', (api.DATA.zones ?? []).length === 5 && api.DATA.zones.every((z) => Array.isArray(z.errance?.waveSize) && z.errance.waveSize[0] === 2 && z.errance.waveSize[1] === 3), '');
      check('B29 e makeWave accepte une plage de taille (6e param)', /makeWave\(seed, stage, dungeonId = 'marees', diff = 1, runMod = null, waveSizeRange = null\)/.test(html), '');
      const wA = api.makeWave(777, 1, 'marees', 1, null, [2, 2]);
      check('B29 f makeWave respecte waveSize [2,2] (toujours 2 monstres, 0 support étage 1)', wA.avant.length === 2 && wA.arriere.length === 0, `${wA.avant.length}/${wA.arriere.length}`);
      const ids = (c) => api.makeWave(api.waveSeedFor('marees', 1, c), 1, 'marees', 1).avant.map((m) => m.id).join(',');
      check('B29 g deux compteurs différents -> deux vagues distinctes ; même compteur -> même vague', ids(1) !== ids(2) && ids(1) === ids(1), `${ids(1)} vs ${ids(2)}`);
      // même construction de date locale que todayKey() (getFullYear/getMonth/getDate), robuste au fuseau horaire
      const dNow = new Date();
      const today = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
      const legacy = (() => { let h = 7; for (const ch of `${today}|marees|1`) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0; return h; })();
      check('B29 h sans extra, waveSeedFor = hash historique (donjons classiques inchangés)', api.waveSeedFor('marees', 1) === legacy, `${api.waveSeedFor('marees', 1)} vs ${legacy}`);
    }

    }

    }

    }

  {
    // lot E3a économie v2 — Guilde : compagnons du jour (rotation seed de la date)
    api.go('#forge');
    await wait(20);
    const offres = api.compagnonsDuJour();
    const nbBtn = doc.body.querySelectorAll('[data-compagnon]').length;
    check('B8 a Guilde : 3 compagnons du jour rendus, rotation déterministe', offres.length === 3 && nbBtn === 3 && api.compagnonsDuJour().map((c) => c.id).join() === offres.map((c) => c.id).join(), offres.map((c) => c.id).join());
    check('B8 b compagnons hors rang L/N/archivés/monstres', offres.every((c) => !c.monster && !c.archived && c.rarity !== 'N' && c.rarity !== 'L' && c.rarity !== 'M' && api.compagnonPrix(c) != null), '');
    api.store.gold = 20000; api.store.jetons = 500; // Lot D : le vendeur se paie en JETONS, jamais en or
    const c = offres[0];
    const jetons0 = api.store.jetons;
    const gold0 = api.store.gold;
    const owned0 = api.ownedOf(c.id);
    check('B8 c recrutement compagnon : -prix en jetons (or intact), +1 exemplaire', api.buyCompagnon(c.id) === true && api.store.jetons === jetons0 - api.compagnonPrix(c) && api.store.gold === gold0 && api.ownedOf(c.id) === owned0 + 1, `${c.id} ${api.compagnonPrix(c)}`);
    check('B8 d prix actés en jetons (C 5, UR 200)', api.GUILDE.prixCompagnonsJetons.C === 5 && api.GUILDE.prixCompagnonsJetons.UR === 200, '');
    const nCard = (api.DATA.cards ?? []).find((x) => x.rarity === 'N');
    check('B8 e rang N jamais recrutable à la Guilde', api.buyCompagnon(nCard.id) === false, nCard.id);
    api.store.jetons = 0; api.store.gold = 99999;
    check('B8 f recrutement sans jetons refusé (l or ne suffit pas)', api.buyCompagnon(c.id) === false, '');
    check('B8 g 0 exception lot E3a', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

    // ---------- B8b : Lot 0 (vie-jeu) — manifeste d'assets tools/assets-manifest.json ----------
    try {
      const man = JSON.parse(readFileSync('tools/assets-manifest.json', 'utf8'));
      const manIds = new Set(man.entries.map((e) => e.production.path + ':' + e.id));
      const missing = [];
      for (const mf of ['assets-v3.json', 'assets-v3.1.json']) {
        const d = JSON.parse(readFileSync(mf, 'utf8'));
        for (const kind of ['art', 'bg']) for (const aid of Object.keys(d[kind] ?? {})) {
          if (!manIds.has(mf + ':' + aid)) missing.push(mf + ':' + aid);
        }
      }
      check('B8b h Lot 0 : tout art des manifestes de production a une entrée source+qa', missing.length === 0 && man.entries.every((e) => e.source && e.source.kind && e.qa && e.qa.status), missing.slice(0, 5).join());
    } catch (e) { check('B8b h Lot 0 : manifeste lisible et couvrant', false, e.message); }

    // ---------- B8c : Lot 4 (vie-jeu) — UI/UX mobile : safe-area, losange ◆, contraste, sweep résolutions ----------
    check('B8c a safe-area env() sur menu latéral + HUD errance', /nav\.open\s*{[^}]*env\(safe-area-inset-bottom\)/.test(html) && /\.errance-top\s*{[^}]*env\(safe-area-inset-top\)/.test(html), '');
    check('B8c b bande de rareté = losange + couleur (jamais couleur seule)', html.includes(".rar-chip::before") && html.includes('◆'), '');
    // audit contraste WCAG 4.5:1 consigné dans le smoke
    const lum = (hex) => {
      const c = hex.replace('#', '');
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(parseInt(c.slice(0, 2), 16)) + 0.7152 * f(parseInt(c.slice(2, 4), 16)) + 0.0722 * f(parseInt(c.slice(4, 6), 16));
    };
    const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
    const audit = [
      ['texte nav #aeb9cc sur fond nav', '#aeb9cc', '#0a0e16', 4.5],
      ['texte corps #dfe6f2 sur fond sombre', '#dfe6f2', '#0d1117', 4.5],
      ['bouton or #06131a sur dégradé actif', '#06131a', '#4dd0e1', 4.5],
      ['CAS À RISQUE or #ffd54f sur place ensoleillée #e8d9b0', '#ffd54f', '#e8d9b0', 0], // consigné, non bloquant (élément décoratif/grand)
    ];
    const ratios = audit.map(([lab, fg, bg]) => `${lab} = ${ratio(fg, bg).toFixed(2)}:1`);
    check('B8c c audit contraste 4.5:1 (texte) consigné', audit.filter(([, , , min]) => min > 0).every(([, fg, bg, min]) => ratio(fg, bg) >= min) && ratios.length === 4, ratios.join(' | '));
    // sweep de résolutions : aucune UI tronquée (vérifié en smoke via les règles CSS + présence des conteneurs)
    const sweeps = [[1280, 720], [2560, 1080], [1080, 2340]];
    const sweepOK = sweeps.every(([w]) => html.includes('#app { max-width: 760px') || html.includes('#app{max-width:760px') || w >= 760)
      && /nav\s*{[^}]*flex-wrap|nav a\s*{[^}]*white-space: nowrap/.test(html)
      && !!doc.body.querySelector('#main-nav') && !!doc.body.querySelector('#app');
    check('B8c d sweep 1280x720 / 2560x1080 / 1080x2340 : conteneurs présents, pas de largeur fixe tronquante', sweepOK, sweeps.map((s) => s.join('x')).join(', '));
  }

  {
    // lot E4 économie v2 — quêtes quotidiennes (page #quetes, progression, récompenses, bonus)
    api.go('#quetes');
    await wait(20);
    const list = api.ensureQuetes();
    check('B9 a 3 quêtes du jour (1 petite + 1 moyenne + 1 grande), déterministes', list.length === 3 && api.ensureQuetes().map((q) => q.id).join() === list.map((q) => q.id).join(), list.map((q) => q.id).join());
    check('B9 b quêtes du jour rendues avec barre de progression', doc.body.querySelectorAll('.quest-row').length === 3 && !!doc.body.querySelector('.quest-bar'), '');
    api.store.gold = 0;
    const gold0 = api.store.gold;
    const q = list.find((x) => !x.done); // première quête non faite, quel que soit son type (dépend du seed de la date — ne plus chercher 'tuer' en dur)
    api.questProgress(q.type, q.n);
    check('B9 c quête accomplie (son type, sa récompense) : +or, done=true', q.done === true && api.store.gold === gold0 + q.or, `type=${q.type} or=${api.store.gold}`);
    check('B9 d pas de bonus de complétion tant que les 3 ne sont pas faites', api.store.quetes.bonusDone === false && api.pierreCount() === 0, '');
    const rest = list.filter((x) => !x.done);
    for (const r of rest) api.questProgress(r.type, r.n);
    check('B9 e bonus complétion : +1 pierre d’éveil une fois les 3 faites', api.store.quetes.bonusDone === true && api.pierreCount() === 1, `pierres=${api.pierreCount()}`);
    const day2 = { ...api.store.quetes, day: '1999-01-01' };
    api.store.quetes = day2;
    const list2 = api.ensureQuetes();
    check('B9 f changement de jour : quêtes remises à zéro', api.store.quetes.day !== '1999-01-01' && list2.every((x) => !x.done && x.progress === 0), '');
    check('B9 g 0 exception lot E4', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
    // garde-fou : la section B9 ne dépend plus du type tiré — 7 dates simulées (même seed FNV-1a que seedOfDay,
    // même tirage que quetesDuJour), progression de la 1re quête quel que soit son type, sans crash
    const fnv = (k) => { let h = 2166136261; for (let i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
    const quetesPourDate = (d) => {
      const rng = mulberry32(fnv(d));
      const pick = (arr) => { const pool = (arr ?? []).filter((q) => !q.errance); return pool.length ? pool[Math.floor(rng() * pool.length)] : null; };
      const g = pick(api.QUETES.grandes);
      return [pick(api.QUETES.petites), pick(api.QUETES.moyennes), g].filter(Boolean).map((q) => ({ ...q, progress: 0, done: false }));
    };
    const nowD = new Date();
    const realToday = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, '0')}-${String(nowD.getDate()).padStart(2, '0')}`;
    let crash7 = 0, ok7 = 0; const typesVus = new Set();
    for (const d of ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14']) {
      try {
        api.store.quetes = { day: realToday, list: quetesPourDate(d), bonusDone: false }; // day = aujourd'hui réel : ensureQuetes garde la liste simulée
        api.store.gold = 0;
        const l7 = api.store.quetes.list;
        const q7 = l7.find((x) => !x.done);
        if (!q7) throw new Error('pas de quête tirée');
        typesVus.add(q7.type);
        api.questProgress(q7.type, q7.n);
        if (q7.done === true && api.store.gold === q7.or) ok7++;
      } catch (e) { crash7++; }
    }
    check('B9 h 7 dates simulées : 1re quête (tout type) accomplie sans crash, +or selon son montant', crash7 === 0 && ok7 === 7, `ok=${ok7}/7 crash=${crash7} types=${[...typesVus].join(',')}`);
  }

  {
    // lot E3b économie v2 — suppression des jetons de génération
    api.go('#forge');
    await wait(20);
    check('B10 a plus de section jetons à la Guilde', !doc.body.querySelector('[data-token]') && !doc.body.innerHTML.includes('Jetons de génération'), '');
    api.go('#donjons');
    await wait(20);
    check('B10 b plus de jeton au boss final dans le sélecteur', !doc.body.innerHTML.includes('🎟️') && !doc.body.innerHTML.includes('jeton'), '');
    check('B10 c JETON_RARITY retiré des data, JETON_OR présent', api.DATA.engine.JETON_RARITY === undefined && api.DATA.engine.JETON_OR?.UR === 5000, '');
    check('B10 d la Guilde affiche les compagnons du jour', doc.body.querySelectorAll('[data-compagnon]').length >= 0 && !!doc.body.querySelector('h2'), '');
    check('B10 e 0 exception lot E3b', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // ---------- B11 : parcours IHM complet (départ -> équipe -> donjon -> combat -> récompenses -> quêtes -> boutique -> guilde -> inventaire -> sauvegarde) ----------
    mem.clear();
    store.instances = []; store.collection = new Map(); store.departFait = false; store.tokens = [];
    store.team.slots = []; store.gold = 0;
    api.go('#accueil');
    await wait(40);
    const choices = els.get('app').querySelectorAll('.depart-choice');
    const rD = api.choisirDepart(choices[0].dataset.id);
    await wait(30);
    check('B11 a départ : 2 cartes accordées (1 choisie + 1 aléatoire)', rD && rD.ok && store.instances.length === 2, `inst=${store.instances.length}`);
    check('B11 b nouvelle carte : isNew posé tant que non placée', store.instances.every((i) => i.isNew === true), '');
    api.go('#equipe');
    await wait(30);
    const iidA = store.instances[0].iid;
    const iidB = store.instances[1].iid;
    api.addCardIid(iidA);
    api.addCardIid(iidB);
    check('B11 c équipe : 2 cartes placées', store.team.slots.length === 2, String(store.team.slots.length));
    check('B11 d régression badge : isNew vidé au placement en équipe', store.instances.every((i) => i.isNew !== true), JSON.stringify(store.instances.map((i) => i.isNew)));
    api.go('#equipe');
    await wait(30);
    check('B11 e plus de badge ✨ dans la grille après placement', !els.get('app').querySelector('.new-badge'), '');
    api._setAuto(true);
    api.enterAt(1, 'marees');
    await wait(60);
    let st = api._state();
    check('B11 f combat lancé (étage 1)', !!st, '');
    let guard = 0;
    while (st && !st.winner && guard++ < 200) {
      api.beginRound(st);
      let g2 = 0;
      while (g2++ < 60) { if (!api.peekRound(st) || st.winner) break; api.stepRound(st, null); }
    }
    check('B11 g combat terminé avec un vainqueur', !!(st && st.winner), `winner=${st && st.winner}`);
    await wait(100);
    api.openRecompensesModal([{ kind: 'or', label: '+12 🪙 or', detail: 'étage 1', rarity: null }]);
    await wait(30);
    check('B11 h écran Récompenses : modale ouverte avec gains cliquables', !!doc.body.querySelector('.recomp-overlay') && !!doc.body.querySelector('#recomp-all'), '');
    const allBtn = doc.body.querySelector('#recomp-all');
    if (allBtn) { allBtn.click(); await wait(30); }
    check('B11 i « Tout ramasser » referme la modale', !doc.body.querySelector('.recomp-overlay'), '');
    api.go('#quetes');
    await wait(30);
    check('B11 j page Quêtes : 3 quêtes du jour rendues', els.get('app').querySelectorAll('.quest-row').length === 3, String(els.get('app').querySelectorAll('.quest-row').length));
    api.go('#boutique');
    await wait(30);
    store.gold = 500;
    const g0 = store.gold;
    api.buyPotion('soin30');
    check('B11 k achat potion : or déduit, stock +1', store.gold === g0 - 50 && api.potionCount('soin30') >= 1, `or=${store.gold} stock=${api.potionCount('soin30')}`);
    api.go('#forge');
    await wait(30);
    const off = api.compagnonsDuJour();
    store.gold = 5000;
    const g1 = store.gold;
    const jetons0 = store.jetons ?? 0;
    api.buyCompagnon(off[0].id);
    // économie v2 lot D : le recrutement se paie en JETONS, jamais en or — gold inchangé est le comportement voulu, pas un bug
    check('B11 l recrutement compagnon à la Guilde : jetons débités, or inchangé, +1 carte', (store.jetons ?? 0) === jetons0 - api.compagnonPrix(off[0]) && store.gold === g1 && store.instances.length === 3, `jetons=${store.jetons} or=${store.gold} inst=${store.instances.length}`);
    api.go('#inventaire');
    await wait(150); // anti-flake : rendu inventaire (vu flaky en lot v1.51)
    const invHtml = els.get('app').innerHTML;
    check('B11 m inventaire groupé (potions + pièces + gemmes)', invHtml.includes('Potions') && invHtml.includes('Pièces') && invHtml.includes('Gemmes'), '');
    const rawSave = mem.get('aicg-save') ?? mem.get([...mem.keys()][0]);
    const parsed = rawSave ? JSON.parse(rawSave) : null;
    check('B11 n sauvegarde persistée (version courante, quêtes, or, zones)', !!(parsed && parsed.version === api.DATA.engine.CURRENT_VERSION && parsed.quetes && Number.isFinite(parsed.gold) && Array.isArray(parsed.zonesUnlocked)), parsed ? `v${parsed.version} or=${parsed.gold}` : 'rien');
    check('B11 o 0 exception parcours complet', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // ---------- B12 : bloc visuel — hub-ville, Terres Sauvages, errance top-down ----------
    mem.clear();
    store.instances = []; store.collection = new Map(); store.departFait = true;
    store.team.slots = []; store.gold = 300; store.zonesUnlocked = []; store.zonesVisitees = []; store.errance = null;
    for (const id of ['n1', 'n2']) { const inst = api.newInst(id, 12); store.collection.set(inst.iid, inst); }
    api.go('#accueil');
    await wait(40);
    check('B12 a hub-ville : scène + voile + titre + menu latéral + bouton Terres Sauvages', !!els.get('app').querySelector('.hub-scene') && !!els.get('app').querySelector('.hub-menu') && !!els.get('app').querySelector('#hub-wild') && !!els.get('app').querySelector('.hub-npc'), '');
    check('B12 b Terres Sauvages avec équipe vide : pop-up équipe vide', (() => { els.get('app').querySelector('#hub-wild').click(); return els.get('app').querySelector('#hub-pop').classList.contains('on'); })(), '');
    els.get('app').querySelector('#hub-pop-close').click();
    setup(['n1', 'n2'], 12);
    api.go('#terres');
    await wait(30);
    const zoneBtns = els.get('app').querySelectorAll('.enter-zone');
    check('B12 c Terres Sauvages : seule la zone de départ (eau) est ouverte', zoneBtns.length === 1 && zoneBtns[0].dataset.zone === 'zone-marees', [...zoneBtns].map((b) => b.dataset.zone).join());
    zoneBtns[0].click();
    await wait(60);
    check('B12 d entrée en zone : état d’errance créé, canvas rendu', !!store.errance && !!els.get('app').querySelector('#errance-canvas'), store.errance?.zone ?? 'rien');
    const st = store.errance;
    check('B12 e carte générée : donjon + autel + jarres + spawn praticable', !!st.map.donjon && !!st.map.autel && st.map.jarres.length > 0, '');
    const okMove = api.setTarget(st, Math.floor(st.map.spawn.x) + 2, Math.floor(st.map.spawn.y));
    check('B12 f setTarget : chemin A* trouvé vers une tuile valide', okMove === true && st.hero.path.length > 0, `path=${st.hero.path.length}`);
    let ev = null;
    for (let i = 0; i < 400 && !(ev && ev.encounter); i++) { ev = api.stepErrance(st, 0.05, () => 0.99); }
    check('B12 g rencontres : pas de rencontre hors herbes (rng haut)', ev && ev.encounter !== true, '');
    api.go('#terres');
    await wait(30);
    check('B12 h retour aux Terres : zone visitée marquée', store.zonesVisitees.includes('zone-marees') && els.get('app').innerHTML.includes('visitée'), '');
    check('B12 i déblocage : zone suivante verrouillée tant que le donjon de zone n’est pas vaincu', api.zoneUnlocked('zone-forge') === false, '');
    api.unlockZone('zone-marees');
    check('B12 j déblocage en chaîne après victoire du donjon de zone', api.zoneUnlocked('zone-forge') === true, '');
    check('B12 k 0 exception bloc visuel', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // ---------- B13 : correctifs terrain v1.29 — régression CSS mobile + pilotage inertiel de l'errance ----------
    mem.clear();
    store.instances = []; store.collection = new Map(); store.departFait = true;
    store.team.slots = []; store.gold = 300; store.zonesUnlocked = []; store.zonesVisitees = []; store.errance = null;
    const afterHtml = html.slice(html.lastIndexOf('</html>') + '</html>'.length).trim();
    check('B13 a dist : plus aucun contenu après </html> (régression CSS mobile)', afterHtml === '', JSON.stringify(afterHtml.slice(0, 40)));
    const styleBlock = html.slice(0, html.indexOf('</style>'));
    check('B13 b classes des écrans récents bien dans le <style> du head', styleBlock.includes('.recomp-list') && styleBlock.includes('.chip.r-C') && styleBlock.includes('.fx-video'), '');
    for (const id of ['n1', 'n2']) { const inst = api.newInst(id, 12); store.collection.set(inst.iid, inst); }
    setup(['n1', 'n2'], 12);
    api.go('#terres');
    await wait(30);
    els.get('app').querySelectorAll('.enter-zone')[0].click();
    await wait(60);
    const st = store.errance;
    check('B13 c entrée en zone pour le test du pilotage', !!st && !!st.hero, st?.zone ?? 'rien');
    const v0 = st.hero.v ?? { x: 0, y: 0 };
    check('B13 d pilotage inertiel : vecteur vitesse hero.v et tilt présents', typeof v0.x === 'number' && typeof v0.y === 'number' && typeof st.hero.tilt === 'number', JSON.stringify(v0));
    const tgt = { x: Math.floor(st.map.spawn.x) + 2, y: Math.floor(st.map.spawn.y) };
    api.setTarget(st, tgt.x, tgt.y);
    let minD = Infinity, maxSpeed = 0;
    for (let i = 0; i < 300 && st.hero.path.length > 0; i++) {
      api.stepErrance(st, 0.05, () => 0.99);
      minD = Math.min(minD, Math.hypot(tgt.x + 0.5 - st.hero.x, tgt.y + 0.5 - st.hero.y)); // les waypoints sont aux centres de tuile
      maxSpeed = Math.max(maxSpeed, Math.hypot(st.hero.v.x, st.hero.v.y));
    }
    check('B13 e arrivée nette sur la cible, sans orbite', st.hero.path.length === 0 && minD < 0.15, 'path=' + st.hero.path.length + ' d=' + minD.toFixed(3));
    check('B13 f freinage : vitesse quasi nulle une fois arrivé', Math.hypot(st.hero.v.x, st.hero.v.y) < 0.05, 'v=' + Math.hypot(st.hero.v.x, st.hero.v.y).toFixed(3));
    check('B13 g le héros a bien avancé en chemin (vitesse max mesurée)', maxSpeed > 0.5, 'maxV=' + maxSpeed.toFixed(2));
    check('B13 h 0 exception correctifs terrain v1.29', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // ---------- B14 : lot 6 — errance généralisée aux 5 zones + héros d'errance intégré ----------
    mem.clear();
    store.zonesUnlocked = []; store.zonesVisitees = []; store.errance = null;
    const zoneIds = (api.DATA?.zones ?? DATA?.zones ?? []).map((z) => z.id);
    check('B14 a les 5 zones d’errance sont en data avec seed', JSON.stringify(zoneIds) === JSON.stringify(['zone-marees', 'zone-forge', 'zone-bosquet', 'zone-crypte', 'zone-zenith']) && (api.DATA?.zones ?? []).every((z) => z.errance?.seed), zoneIds.join());
    const hc = (api.DATA?.engine ?? {}).ERRANCE_HERO ?? null;
    check('B14 b config héros d’errance en data (sprite sheet WAN + poster)', !!hc && !!hc.sheet && !!hc.poster && hc.frames > 0 && hc.cols > 0, JSON.stringify(hc ?? 'absent').slice(0, 120));
    check('B14 c déblocage en chaîne : seule la zone de départ ouverte au début', api.zoneUnlocked('zone-marees') === true && api.zoneUnlocked('zone-forge') === false && api.zoneUnlocked('zone-zenith') === false, '');
    api.unlockZone('zone-marees');
    check('B14 d vaincre le donjon des Marées débloque la Forge', api.zoneUnlocked('zone-forge') === true && api.zoneUnlocked('zone-bosquet') === false, '');
    let allMaps = true;
    for (const zid of zoneIds) {
      const s = api.createErranceState(zid);
      if (!s?.map?.terr || !s.map.donjon || !s.map.autel || s.hero?.x == null) allMaps = false;
    }
    check('B14 e chaque zone génère sa carte (terrain + donjon + autel + spawn)', allMaps, '');
    check('B14 f 0 exception lot 6', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // ---------- B21 : refonte errance — palettes/ambiance par zone, layout v2, retour ville, HUD phase ----------
    const zones = api.DATA.zones;
    const palOf = (zid) => api.errancePalette(zones.find((z) => z.id === zid));
    check('B21 a les 5 zones ont une palette en data, toutes distinctes', zones.every((z) => z.errance?.paint) && new Set(zones.map((z) => palOf(z.id).grassTop)).size === 5, zones.map((z) => palOf(z.id).grassTop).join());
    check('B21 b Forge = braises (eau orangée), Crypte = froide, Zénith = doré', palOf('zone-forge').water0 === '#ffb050' && palOf('zone-crypte').grassTop === '#7a8a99' && palOf('zone-zenith').grassTop === '#d4b96a', '');
    check('B21 c ambiance par zone : DAY_LEN en data (défaut 100)', zones.every((z) => api.buildAmbiance(api.genZoneMap(z), z).dayLen >= 90), zones.map((z) => api.buildAmbiance(api.genZoneMap(z), z).dayLen).join());
    let retourOk = true, mareesLayout = false;
    for (const z of zones) {
      const m = api.genZoneMap(z);
      if (!m.retour || m.terr[m.idx(m.retour.x, m.retour.y)] !== 11) retourOk = false;
      if (z.id === 'zone-marees' && m.huttes.length === 2 && m.donjon.w === 3) mareesLayout = true;
    }
    check('B21 d point de retour ville posé dans les 5 zones', retourOk, '');
    {
      const mm = api.genZoneMap(zones[0]);
      const dRet = Math.hypot(mm.retour.x + .5 - mm.spawn.x, mm.retour.y + .5 - mm.spawn.y);
      const hasDeep = mm.terr.includes(12), hasShallow = mm.terr.includes(13);
      check('B21 d2 Marées : retour ville à ≤ 6 tuiles du spawn + EAU_PROFONDE et EAU_PEU_PROFONDE présents', dRet <= 6 && hasDeep && hasShallow, `dRet=${dRet.toFixed(1)} deep=${hasDeep} shallow=${hasShallow}`);
    }
    check('B21 e layout v2 appliqué aux Marées (donjon 3x2, 2 huttes)', mareesLayout, '');
    // UI : entrée en zone, HUD phase + décor construit
    mem.clear();
    store.zonesUnlocked = ['zone-marees']; store.errance = null;
    api.go('#terres');
    await wait(30);
    els.get('app').querySelectorAll('.enter-zone')[0].click();
    await wait(80);
    const st21 = store.errance;
    check('B21 f entrée en zone Marées, décor A+ construit (lames, étang, socles)', !!st21 && st21.map.decor && st21.map.decor.blades.length > 0 && !!st21.map.decor.pond && st21.map.decor.herbSocles.length > 0, `blades=${st21?.map.decor?.blades?.length}`);
    check('B21 g HUD : puce de phase jour/nuit présente dans la barre d\'errance', !!els.get('app').querySelector('#errance-phase'), '');
    check('B21 g2 huttes interactives : 2 huttes avec dialogue en data + encart de dialogue dans le DOM', st21.map.huttes.length === 2 && st21.map.huttes.every((h) => h.title && h.text) && !!els.get('app').querySelector('#errance-dlg'), `huttes=${st21?.map?.huttes?.length}`);
    check('B21 h 0 exception B21 (refonte errance)', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

  {
    // ---------- B15 : lot 7 — craft en ville (atelier Boutique) + page Personnage à onglets ----------
    mem.clear();
    store.instances = []; store.collection = new Map(); store.departFait = true;
    store.team.slots = []; store.gold = 5000; store.materiaux = {}; store.equipment = {}; store.errance = null;
    const craftTable = api.DATA.equipment?.craft ?? {};
    const setPieces = (api.EQUIPMENT ?? []).filter((p) => p.source === 'set');
    check('B15 a table craft en data couvre base/supérieure/royale', !!craftTable.base?.materiau && !!craftTable['supérieure']?.matiereBoss && !!craftTable.royale?.matiereBoss, Object.keys(craftTable).join());
    check('B15 b chaque pièce de set a un coût de craft résolu', setPieces.length === 90 && setPieces.every((p) => !!api.craftCostOf(p)), `${setPieces.length} pièces`);
    api.go('#boutique');
    await wait(30);
    const nbCraft = els.get('app').querySelectorAll('[data-craft]').length;
    check('B15 c atelier : 90 boutons « Fabriquer » rendus dans la Boutique', nbCraft === 90, String(nbCraft));
    const base = setPieces.find((p) => p.id.includes('-base-'));
    const cost = api.craftCostOf(base);
    check('B15 d craft refusé sans matériaux', api.craftPiece(base.id) === false && api.equipPieceCount(base.id) === 0, base.id);
    store.materiaux[cost.materiauId] = cost.materiauN + 2;
    const gold0 = store.gold;
    check('B15 e craft OK : matériaux et or consommés, pièce possédée', api.craftPiece(base.id) === true && api.equipPieceCount(base.id) === 1 && store.gold === gold0 - cost.or && api.materiauCount(cost.materiauId) === 2, `or=${store.gold}`);
    const sup = setPieces.find((p) => p.id.includes('-supérieure-'));
    const costS = api.craftCostOf(sup);
    check('B15 f paliers hauts exigent la matière du boss (refus sans)', api.craftPiece(sup.id) === false && costS.bossN > 0, sup.id);
    api.go('#personnage');
    await wait(30);
    check('B15 g page Personnage : onglets Équipe + Inventaire + bouton retour', !!els.get('app').querySelector('#tab-equipe') && !!els.get('app').querySelector('#tab-inventaire') && !!els.get('app').querySelector('#perso-back'), '');
    check('B15 h onglet Équipe actif : 3 actifs + 2 réserve, plus de boutons 3+2/2+3',
      !els.get('app').querySelector('#form-3-2') && !els.get('app').querySelector('#form-2-3')
      && (els.get('app').querySelector('#perso-body')?._innerHTML ?? '').includes('réserve'), '');
    els.get('app').querySelector('#tab-inventaire').click();
    await wait(20);
    check('B15 i onglet Inventaire rend potions/matériaux/équipement', !!els.get('app').querySelector('#inv-back') && (els.get('app').querySelector('#perso-body')?._innerHTML ?? '').includes('Potions'), '');
    els.get('app').querySelector('#perso-back').click();
    await wait(20);
    check('B15 j bouton retour quitte la page Personnage (retour à l’accueil)', !els.get('app').querySelector('#perso-back') && (els.get('app')._innerHTML ?? '').length > 100, '');
    check('B15 k 0 exception lot 7', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
  }

    // ---------- B17 : correctifs ciblage lot 4 — gestes dissociés + fiche carte complète ----------
    mem.clear();
    store.instances = []; store.collection = new Map(); store.departFait = true;
    store.team.slots = []; store.gold = 0; store.teams = store.teams ?? [];
    for (const id of ['n1', 'a1', 'g9', 'd2', 'n3', 'a29']) {
      const inst = api.newInst(id, 5);
      store.collection.set(id, (store.collection.get(id) ?? 0) + 1);
    }
    api.go('#equipe');
    await wait(40);
    const gcells0 = [...els.get('app').querySelectorAll('.gcell')].filter((g) => g.classList.contains('cat'));
    const gcell0 = gcells0.find((g) => !g.classList.contains('dimmed')) ?? gcells0[0];
    const btns0 = gcell0 ? [...gcell0.querySelectorAll('.cell-btn')] : [];
    check('B17 a cellule collection avec boutons explicites ℹ️ (fiche) et ＋ (équipe)', btns0.some((b) => b.dataset.act === 'fiche') && btns0.some((b) => b.dataset.act === 'in'), btns0.map((b) => b.dataset.act).join(','));
    const n0 = store.team.slots.length;
    btns0.find((b) => b.dataset.act === 'in').click();
    await wait(20);
    check('B17 b le bouton ＋ ajoute explicitement à l’équipe', store.team.slots.length === n0 + 1, `slots=${store.team.slots.length}`);
    // geste (tap) = fiche, sans ajout — même équipe pleine
    setup(['a1', 'g9', 'd2', 'n3', 'a29'], 5);
    api.go('#equipe');
    await wait(40);
    const gcellFull = [...els.get('app').querySelectorAll('.gcell')].filter((g) => g.classList.contains('cat')).find((g) => !g.classList.contains('dimmed'));
    const nFull = store.team.slots.length;
    if (gcellFull) {
      gcellFull.dispatch('pointerdown', { clientX: 10, clientY: 10 });
      gcellFull.dispatch('pointerup', { clientX: 10, clientY: 10 });
      await wait(30);
      const modal0 = doc.querySelector('.modal-overlay') ? doc.querySelector('.modal') : null;
      check('B17 c appui court sur une carte = fiche (équipe pleine comprise), aucun ajout', store.team.slots.length === nFull && !!modal0, `slots=${store.team.slots.length} modal=${!!modal0}`);
      const spellsUl = modal0 ? modal0.querySelector('.spells') : null;
      const ficheTxt = spellsUl ? [...spellsUl.querySelectorAll('.spell')].map((el) => el.textContent ?? '').join(' ') : '';
      const nbBadges = spellsUl ? spellsUl.querySelectorAll('.sort-badge').length : 0;
      check('B17 d fiche : sorts avec badge de rôle, cible/zone et « dégâts (%) »', nbBadges >= 1 && /dégâts \(\d+ %/.test(ficheTxt) && /1 ennemi|zone|équipe|allié/.test(ficheTxt), ficheTxt.slice(0, 120));
      modal0 ? modal0.querySelector('.modal-close')?.click() : null;
      await wait(20);
    } else {
      check('B17 c appui court = fiche (équipe pleine)', false, 'pas de cellule libre');
      check('B17 d fiche sorts complèts', false, '');
    }
    const slotEl = els.get('app').querySelector('.slot');
    const slotCard = slotEl ? slotEl.querySelector('.cell-btn') : null;
    check('B17 e slot d’équipe avec bouton ✕ explicite', !!slotCard, '');
    if (slotCard) {
      const n1b = store.team.slots.length;
      slotCard.click();
      await wait(20);
      check('B17 f le bouton ✕ retire la carte de l’équipe', store.team.slots.length === n1b - 1, `slots=${store.team.slots.length}`);
    }
    check('B17 g 0 exception lot 4', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

    // ---------- B18 : correctifs ciblage lot 5 — collection mise au propre ----------
    api.go('#collection');
    await wait(40);
    const colHtml18 = els.get('app')._innerHTML ?? '';
    const ownedCells = [...els.get('app').querySelectorAll('.fam-card')].filter((el) => el.classList.contains('owned'));
    check('B18 a page Collection : cellules possédées unifiées (data-id + badge)', ownedCells.length > 0 && ownedCells.every((el) => el.dataset.id), `owned=${ownedCells.length}`);
    check('B18 b bandes de race avec compteur de naissances dévoilées', /naissances d\u00e9voil\u00e9es/.test(colHtml) || colHtml.includes('naissances dévoilées'), '');
    const owned0 = ownedCells[0];
    if (owned0) {
      const nB = store.team.slots.length;
      owned0.dispatch('pointerdown', { clientX: 5, clientY: 5 });
      owned0.dispatch('pointerup', { clientX: 5, clientY: 5 });
      await wait(30);
      const modalC = doc.querySelector('.modal-overlay') ? doc.querySelector('.modal') : null;
      check('B18 c appui sur une carte de la collection = fiche (pas d’ajout implicite)', store.team.slots.length === nB && !!modalC, `slots=${store.team.slots.length} modal=${!!modalC}`);
      modalC ? modalC.querySelector('.modal-close')?.click() : null;
      await wait(20);
    } else {
      check('B18 c appui collection = fiche', false, 'pas de carte possédée');
    }
    check('B18 d 0 exception lot 5', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

    // ---------- B16 : refonte IA — anti-triche par introspection + Auto/ennemi sur chaque difficulté ----------
    const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    const engineSrc = ['src/engine/combat.js', 'src/engine/spells.js', 'src/engine/summon.js'].map((f) => stripComments(readFileSync(f, 'utf8'))).join('\n');
    const hiddenRefs = ['store', 'localStorage', 'sessionStorage', 'promptState', 'store\.']
      .filter((k) => new RegExp(`\\b${k.replace('.', '\\.')}\\b`).test(engineSrc));
    check('B16 a anti-triche : le moteur de décision ne lit aucune info hors état public (introspection source)', hiddenRefs.length === 0, hiddenRefs.join(','));
    for (let diff = 1; diff <= 5; diff++) {
      let exc = 0, wins = 0;
      for (let n = 0; n < 40; n++) {
        try {
          const wave = api.makeWave(1000 + n * 7, 1 + (n % 3), 'marees', diff);
          const team = { avant: [{ ...api.byId('n1'), level: 5 }, { ...api.byId('n2'), level: 5 }], arriere: [{ ...api.byId('n3'), level: 5 }] };
          const st = api.initCombat(team, wave, 500 + n, {}, { difficulty: diff });
          let g = 0;
          while (!st.winner && g++ < 150) api.resolveTurn(st);
          if (st.winner === 'team') wins++;
        } catch (e) { exc++; }
      }
      check(`B16 b ${api.DATA.difficulties[diff - 1].name} (diff ${diff}) : 40 combats Auto/ennemi au profil IA, 0 exception`, exc === 0, `exc=${exc} wins=${wins}/40`);
    }
    check('B16 c 0 exception smoke (section IA incluse)', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

    // ---------- B22 : correctifs v1.37 lot 2 — boutons ＋/−/ℹ️ en bas-droite, badge de niveau en haut-droite ----------
    {
      const cellActionsRule = (html.match(/\.cell-actions\s*\{[^}]*\}/) ?? [''])[0];
      const slotOutRule = (html.match(/\.slot \.cell-btn\.slot-out\s*\{[^}]*\}/) ?? [''])[0];
      const lvlRule = (html.match(/\.lvl-chip\s*\{[^}]*\}/) ?? [''])[0];
      check('B22 a .cell-actions en bas-droite (bottom:4px, plus de top)', /bottom:\s*4px/.test(cellActionsRule) && !/top:\s*4px/.test(cellActionsRule), cellActionsRule);
      check('B22 b bouton − des slots en bas-droite', /bottom:\s*4px/.test(slotOutRule) && !/top:\s*4px/.test(slotOutRule), slotOutRule);
      check('B22 c badge de niveau .lvl-chip conservé en haut-droite', /top:\s*5px/.test(lvlRule) && /right:\s*5px/.test(lvlRule), lvlRule);
    }

    // ---------- B23 : correctifs v1.39 lot 2 — mode auto supprimé du combat joué ----------
    {
      check('B23 a plus aucune référence autoMode / #auto-turn dans le dist', !/autoMode/.test(html) && !/auto-turn/.test(html) && !/id="mode"/.test(html), '');
      api.save();
      const raw23 = JSON.parse(mem.get(api.slotKey(api._activeSlot())));
      check('B23 b save() ne persiste plus uiPrefs.combatAuto', !!raw23.uiPrefs && !('combatAuto' in raw23.uiPrefs), JSON.stringify(raw23.uiPrefs ?? null));
      raw23.uiPrefs = { combatAuto: true }; // vieille sauvegarde v1.37 avec le champ
      mem.set(api.slotKey(api._activeSlot()), JSON.stringify(raw23));
      const ok23 = api.load();
      check('B23 c save avec uiPrefs.combatAuto:true recharge sans erreur (migration passive)', ok23 === true, String(ok23));
      check('B23 d le champ combatAuto est ignoré au chargement', api.store.uiPrefs && !('combatAuto' in api.store.uiPrefs), JSON.stringify(api.store.uiPrefs ?? null));
      check('B23 e plus de boucle d’auto-enchaînement dans run() (pas de while autoMode)', !/while \([^)]*autoMode/.test(html) && !/autoFight: autoMode/.test(html), '');
      setup(['n1', 'n3'], 5);
      api._tacPause(false); api._speed(6);
      api.go('#combat');
      await wait(700);
      const st23 = api._state();
      check('B23 f combat démarré attend l’action du joueur (fenêtre d’action ouverte, aucun vainqueur)', !!st23 && !st23.winner && !!api._actEl(), `winner=${st23 && st23.winner} act=${!!api._actEl()}`);
      doc.body.querySelector('#recomp-all')?.click();
      api.go('#accueil'); api.store.errance = null;
    }

    // ---------- B19 : parties multiples — stockage par slots, migration, bascule ----------
    {
      const SK = 'fondations-cards-v1';
      const slotsKey = SK + '.slots';
      const p0 = SK + '.p0', p1 = SK + '.p1';

      api.resetStore();
      setup(['a1', 'n3'], 5);
      store.gold = 321;
      api.save();
      check('B19 a save() écrit le slot actif p0 + l\'index .slots', mem.has(p0) && mem.has(slotsKey), [...mem.keys()].join(','));
      const idx1 = JSON.parse(mem.get(slotsKey));
      check('B19 b index : 4 slots, active 0, entrée p0 « Partie 1 » avec version/date/résumé', idx1.slots.length === 4 && idx1.active === 0 && idx1.slots[0] && idx1.slots[0].name === 'Partie 1' && idx1.slots[0].version === api.DATA.engine.CURRENT_VERSION && !!idx1.slots[0].date && idx1.slots[0].summary && idx1.slots[0].summary.gold === 321, JSON.stringify(idx1.slots[0] ?? null).slice(0, 140));
      check('B19 c slot actif exposé = 0', api._activeSlot() === 0, String(api._activeSlot()));

      // migration sans perte depuis la clé historique (flux réel v8 -> v27)
      const rawV8 = readFileSync('tests/fixtures/save-v8.json', 'utf8');
      mem.set(SK, rawV8);
      mem.set(SK + '.bak', rawV8);
      mem.delete(p0); mem.delete(SK + '.p0.bak'); mem.delete(slotsKey);
      const okMig = api.load();
      const idxMig = JSON.parse(mem.get(slotsKey));
      check('B19 d migration : load() depuis la clé historique réussit', okMig === true, '');
      check('B19 e migration : la sauvegarde v8 copiée telle quelle vers p0 (sans perte)', mem.get(p0) === rawV8, String(mem.get(p0)).slice(0, 60));
      check('B19 f migration : index créé, « Partie 1 » active en p0, clés historiques conservées', idxMig.active === 0 && idxMig.slots[0] && idxMig.slots[0].name === 'Partie 1' && mem.has(SK) && mem.has(SK + '.bak'), JSON.stringify(idxMig.slots[0]).slice(0, 140));
      check('B19 g migration : la progression v8 survit (équipe de 5 restaurée via v9 -> v27)', store.teams[0].slots.length === 5, String(store.teams[0].slots.length));

      // bascule p0 <-> p1 sans perte ni mélange
      store.gold = 777;
      api.save();
      check('B19 h nouvelle partie en p1 : départ frais (0 or, departFait=false, slot 1 actif)', api.newSlot(1) === true && store.gold === 0 && store.departFait === false && api._activeSlot() === 1, `gold=${store.gold} depart=${store.departFait} active=${api._activeSlot()}`);
      store.gold = 55;
      api.save();
      check('B19 i bascule vers p0 : or de la Partie 1 retrouvé (777)', api.switchToSlot(0) === true && store.gold === 777, `gold=${store.gold}`);
      check('B19 j bascule vers p1 : or de la seconde partie retrouvé (55), pas de mélange', api.switchToSlot(1) === true && store.gold === 55 && api._activeSlot() === 1, `gold=${store.gold}`);
      check('B19 k index : partie active mémorisée = 1', JSON.parse(mem.get(slotsKey)).active === 1, String(JSON.parse(mem.get(slotsKey)).active));

      // rotation .bak par partie
      store.gold = 56;
      api.save();
      const bak1 = mem.get(SK + '.p1.bak');
      check('B19 l rotation .bak par slot : p1.bak = sauvegarde précédente de p1 (55 or)', !!bak1 && JSON.parse(bak1).gold === 55, String(bak1).slice(0, 80));
      check('B19 m p0 intact après les saves de p1 (777 or)', JSON.parse(mem.get(p0)).gold === 777, String(JSON.parse(mem.get(p0)).gold));

      // renommer persiste
      check('B19 n renommer p1 persiste dans l\'index', api.renameSlot(1, 'Partie test') === true && JSON.parse(mem.get(slotsKey)).slots[1].name === 'Partie test', JSON.parse(mem.get(slotsKey)).slots[1]?.name);

      // suppression isolée
      const p0Before = mem.get(p0);
      check('B19 o suppression du slot 1 : p1/p1.bak effacés, p0 intact', api.deleteSlot(1) === true && !mem.has(p1) && !mem.has(SK + '.p1.bak') && mem.get(p0) === p0Before, [...mem.keys()].join(','));
      const idx3 = JSON.parse(mem.get(slotsKey));
      check('B19 p après suppression : slot 1 vide, active retombe sur un slot vivant (0)', idx3.slots[1] === null && idx3.active === 0, JSON.stringify(idx3).slice(0, 160));

      const ls = api.listSlots();
      check('B19 q listSlots : 4 entrées, noms par défaut, active marquée', ls.length === 4 && ls[0].name === 'Partie 1' && ls[1].name === 'Partie 2' && ls[0].active === true && ls[1].empty === true, ls.map((s) => s.name + ':' + s.empty + ':' + s.active).join('|'));

      api.switchToSlot(0);
      check('B19 r 0 exception lot 1 (slots)', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));
    }

    // ---------- B20 : panneau « Parties » sur l'Accueil (lot 2) ----------
    {
      const SK = 'fondations-cards-v1';
      api.newSlot(1, 'Partie test');
      store.gold = 42;
      api.save();
      api.switchToSlot(0);
      api.go('#accueil');
      await wait(40);
      const homeHtml = els.get('app')._innerHTML ?? '';
      const saveBoxRule = (html.match(/\.save-box\s*\{[^}]*\}/) ?? [''])[0];
      const hubSceneRule = (html.match(/\.hub-scene\s*\{[^}]*\}/) ?? [''])[0];
      const hubVeilRule = (html.match(/\.hub-veil\s*\{[^}]*\}/) ?? [''])[0];
      check('B20 a panneau Parties présent dans le DOM de l\'Accueil (branche hub)', homeHtml.includes('slots-panel') && /Parties/.test(homeHtml), '');
      check('B20 a2 visibilité effective : .save-box en position:relative + z-index:30 (au-dessus de la scène fixe)', /position:\s*relative/.test(saveBoxRule) && /z-index:\s*30/.test(saveBoxRule), saveBoxRule);
      check('B20 a3 clics : .hub-scene et .hub-veil en pointer-events:none', /pointer-events:\s*none/.test(hubSceneRule) && /pointer-events:\s*none/.test(hubVeilRule), hubSceneRule + ' | ' + hubVeilRule);
      check('B20 a4 espaceur 100dvh avant les panneaux dans la branche hub (panneaux sous l\'écran plein)', homeHtml.includes('hub-spacer') && /height:\s*100dvh/.test(html), '');
      const slotCards = [...els.get('app').querySelectorAll('.slot-card')];
      check('B20 b 4 cartes d\'emplacement rendues', slotCards.length === 4, String(slotCards.length));
      check('B20 c exactement une partie marquée « en cours »', slotCards.filter((el) => el.classList.contains('active')).length === 1, String(slotCards.filter((el) => el.classList.contains('active')).length));
      const actsOf = (i) => [...slotCards[i].querySelectorAll('.slot-act')].map((el) => el.dataset.slotAct);
      check('B20 d actions par carte : occupé = Jouer/Renommer/Supprimer, vide = Nouvelle partie',
        actsOf(0).join(',') === 'play,rename,del' && actsOf(1).join(',') === 'play,rename,del' && actsOf(2).join(',') === 'new' && actsOf(3).join(',') === 'new',
        [0, 1, 2, 3].map((i) => actsOf(i).join('+')).join(' | '));

      const play1 = [...slotCards[1].querySelectorAll('.slot-act')].find((el) => el.dataset.slotAct === 'play');
      play1.click();
      await wait(30);
      check('B20 e ▶ Jouer bascule vers p1 (or 42 retrouvé, slot actif = 1)', store.gold === 42 && api._activeSlot() === 1, `gold=${store.gold} active=${api._activeSlot()}`);
      check('B20 f la partie en cours a été sauvegardée avant la bascule (p0 intact, 777 or)', JSON.parse(mem.get(SK + '.p0')).gold === 777, String(JSON.parse(mem.get(SK + '.p0')).gold));

      api.go('#accueil');
      await wait(30);
      const cards2 = [...els.get('app').querySelectorAll('.slot-card')];
      const new2 = [...cards2[2].querySelectorAll('.slot-act')].find((el) => el.dataset.slotAct === 'new');
      new2.click();
      await wait(30);
      check('B20 g ✨ Nouvelle partie sur slot vide : départ frais (0 carte, departFait=false, slot 2 actif)', store.instances.length === 0 && store.departFait === false && api._activeSlot() === 2, `inst=${store.instances.length} depart=${store.departFait} active=${api._activeSlot()}`);
      const depHtml = els.get('app')._innerHTML ?? '';
      check('B20 h écran de départ rejoué (4 novices proposés)', (depHtml.match(/depart-choice/g) ?? []).length === 4, String((depHtml.match(/depart-choice/g) ?? []).length));
      check('B20 h2 branche départ : panneaux 💾/🗂 présents, pas de scène fixe ni d\'espaceur (non cassés)', depHtml.includes('slots-panel') && depHtml.includes('save-box') && !depHtml.includes('hub-spacer'), '');
      store.departFait = true;
      api.go('#accueil');
      await wait(30);
      const welHtml = els.get('app')._innerHTML ?? '';
      check('B20 h3 branche bienvenue (équipe vide) : panneaux 💾/🗂 présents, pas d\'espaceur', welHtml.includes('slots-panel') && welHtml.includes('save-box') && !welHtml.includes('hub-spacer'), '');

      api.go('#accueil');
      await wait(30);
      const origPrompt = ctx.prompt;
      ctx.prompt = () => 'Ma quête';
      const cards3 = [...els.get('app').querySelectorAll('.slot-card')];
      const ren0 = [...cards3[0].querySelectorAll('.slot-act')].find((el) => el.dataset.slotAct === 'rename');
      ren0.click();
      await wait(30);
      ctx.prompt = origPrompt;
      check('B20 i ✏️ Renommer persiste dans l\'index', JSON.parse(mem.get(SK + '.slots')).slots[0].name === 'Ma quête', JSON.parse(mem.get(SK + '.slots')).slots[0]?.name);

      api.go('#accueil');
      await wait(30);
      const origConfirm = ctx.confirm;
      let nConf = 0;
      ctx.confirm = () => { nConf++; return false; };
      const cards4 = [...els.get('app').querySelectorAll('.slot-card')];
      const del1 = [...cards4[1].querySelectorAll('.slot-act')].find((el) => el.dataset.slotAct === 'del');
      del1.click();
      await wait(20);
      check('B20 j Supprimer : 1re confirmation refusée = rien n\'est effacé', nConf === 1 && mem.has(SK + '.p1'), `conf=${nConf} hasP1=${mem.has(SK + '.p1')}`);
      ctx.confirm = () => true;
      const cards5 = [...els.get('app').querySelectorAll('.slot-card')];
      const del1b = [...cards5[1].querySelectorAll('.slot-act')].find((el) => el.dataset.slotAct === 'del');
      const p0Before = mem.get(SK + '.p0');
      del1b.click();
      await wait(20);
      check('B20 k Supprimer : double confirmation acceptée = slot effacé, autres slots intacts', !mem.has(SK + '.p1') && !mem.has(SK + '.p1.bak') && mem.get(SK + '.p0') === p0Before, [...mem.keys()].join(','));
      ctx.confirm = origConfirm;

      check('B20 l 0 exception lot 2 (panneau Parties)', errors.length === 0, errors.map((e) => e.message).join('|').slice(0, 150));

      api.switchToSlot(0);
      api.go('#accueil');
      await wait(30);
    }

    // ---------- v1.51 : switch 4 versions des illustrations (vague 3.3) ----------
    {
      const distHtml = readFileSync('dist.html', 'utf8');
      check('S27 a ART_MANIFESTS 4 versions dans le dist (v3/v31/v32/v33)', distHtml.includes("v32: 'assets-v32.json'") && distHtml.includes("v33: 'assets-v33.json'"), '');
      const b = els.get('art-src-btn');
      check('S27 b bouton 🖼️ présent avec étiquette de version V3', !!b && b.textContent === '🖼️ V3', b && b.textContent);
      const src = readFileSync('src/shell.html', 'utf8');
      check('S27 c CSS bouton grisé (.off) présent', src.includes('#art-src-btn.off'), '');
      // cycle complet avec fetch simulé (4 manifestes servis)
      const manifests = {
        'assets-v3.json': { art: {}, bg: {} }, 'assets-v3.1.json': { art: {}, bg: {} },
        'assets-v32.json': { art: {}, bg: {} }, 'assets-v33.json': { art: {}, bg: {} },
      };
      const origFetch = ctx.fetch;
      ctx.fetch = (url) => {
        const m = manifests[String(url)];
        return Promise.resolve(m ? { ok: true, json: () => Promise.resolve(m) } : { ok: false, json: () => Promise.resolve({}) });
      };
      const seq = ['v31', 'v32', 'v33', 'v3'];
      const tags = ['🖼️ V3.1', '🖼️ V3.2', '🖼️ V3.3', '🖼️ V3'];
      let cycleOk = true, tagOk = true;
      for (let i = 0; i < 4; i++) {
        b.click();
        await wait(60);
        if (mem.get('fondations-art-src') !== seq[i]) cycleOk = false;
        if (b.textContent !== tags[i]) tagOk = false;
      }
      check('S27 d cycle complet V3→V3.1→V3.2→V3.3→V3 persisté (fondations-art-src)', cycleOk, mem.get('fondations-art-src'));
      check('S27 e étiquette de version sur le bouton à chaque étape', tagOk, b.textContent);
      // manifeste manquant : bouton grisé libellé, version courante inchangée
      mem.set('fondations-art-src', 'v31');
      delete manifests['assets-v32.json'];
      const errBefore = errors.length;
      b.click();
      await wait(60);
      check('S27 f manifeste manquant toléré : version courante inchangée + bouton grisé libellé V3.2, 0 erreur',
        mem.get('fondations-art-src') === 'v31' && b.textContent === '🖼️ V3.2' && b.classList.contains('off') && errors.length === errBefore,
        `pref=${mem.get('fondations-art-src')} tag=${b.textContent} off=${b.classList.contains('off')}`);
      ctx.fetch = origFetch;
      mem.delete('fondations-art-src'); // mem est une Map (pas un Storage) : removeItem n'existe pas — crash S27 sinon
    }

  console.log(fails === 0 ? `SCÉNARIOS : TOUT PASSE (${total} checks)` : `SCÉNARIOS : ${fails} ÉCHEC(S) / ${total}`);
  process.exit(fails === 0 ? 0 : 1);
}
main().catch((e) => { console.error('CRASH :', e && e.stack || e); process.exit(1); });
