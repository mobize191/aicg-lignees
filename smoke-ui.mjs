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

  // ---------- fenêtre RPG tour par tour (43 C, 46 f/g/h) ----------
  api._setAuto(false);
  api.go('#combat');
  await wait(60);
  const stC = api._state();
  check('43 C combat tactique lancé (fenêtre RPG)', !!stC, '');
  if (stC) {
    api._speed(6);
    stC.team.attaque[0].hp = Math.max(1, Math.round(stC.team.attaque[0].maxHp * 0.05));
    els.get('fight').click();
    let am = null;
    for (let w = 0; w < 120 && !am; w++) { await wait(25); am = api._actEl(); }
    const amTxt = am ? am._innerHTML : '';
    check('46 f fenêtre d’action : titre, stats, illustration, sorts', !!am && amTxt.includes('à vous d’agir') && amTxt.includes('♥') && !!am.querySelector('.act-art') && amTxt.includes('✦'), amTxt.slice(0, 90));
    check('46 f boutons ⚔ Attaque et ⏸ Attendre', !!am && amTxt.includes('⚔ Attaque') && amTxt.includes('⏸ Attendre'), '');
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
      for (const u of [...st47.team.attaque, ...st47.team.support]) { u.mana = u.manaMax; }
      els.get('fight').click();
      let am = null;
      for (let w = 0; w < 120 && !am; w++) { await wait(25); am = api._actEl(); }
      check('47 a fenêtre d’action avec boutons (Attaque/Attendre)', !!am && !!am.querySelector('.act-attack') && !!am.querySelector('.act-pass'), '');
      const bA = am ? (am.querySelector('.act-spell:not(.off)') ?? am.querySelector('.act-attack')) : null;
      if (bA) {
        bA.click(); await wait(40);
        am = api._actEl();
        const nEnnemis = st47.enemies.attaque.filter((e) => e.alive).length + st47.enemies.support.filter((e) => e.alive).length;
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
            check('47 e donnée zone : Lame d’Écume vaut largeur 2', api._zoneWidthOf('Lame d’Écume') === 2, String(api._zoneWidthOf('Lame d’Écume')));
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
      const mage = [...st50.team.attaque, ...st50.team.support].find((u) => (u.spells ?? []).some((s) => s.name === 'D\u00e9charge Arcanique'));
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
            const nAlive = [...st50.enemies.attaque, ...st50.enemies.support].filter((e) => e.alive).length;
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
      const u0 = st48.team.attaque[0];
      u0.atkBuff = 0.2; u0.shield = 12;
      const e0 = st48.enemies.attaque.find((e) => e.alive) ?? st48.enemies.support[0];
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
      const tgt = st48.team.support[0] ?? st48.team.attaque[1];
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
      const uid = (st49.team.attaque[0] ?? st49.team.support[0]).uid;
      api._openUnit(uid);
      await wait(40);
      const hero = [...doc.querySelectorAll('.modal-hero')].find((el) => el.classList.contains('full')) ?? null;
      check('49 a hero plein cadre (.modal-hero.full)', !!hero, '');
      check('49 a voile dégradé + nom + sous-titre classe·élément·rareté', !!hero && !!hero.querySelector('.hero-veil') && !!hero.querySelector('.hero-name') && (hero.querySelector('.hero-sub')?.textContent ?? '').includes('·'), hero ? (hero.querySelector('.hero-sub')?.textContent ?? '') : '');
      const hs = hero ? hero.querySelector('.hero-stats') : null;
      const hsTxt = hs ? hs.textContent : '';
      check('49 a stats en bas du hero (PV rouge, mana violet, actuel/total)', !!hs && /♥ \d+\/\d+/.test(hsTxt) && /✦ \d+\/\d+/.test(hsTxt), hsTxt.slice(0, 60));
      const close = doc.querySelector('#unit-close');
      if (close) close.click();
      await wait(20);
      check('49 b la fiche se ferme', ![...doc.querySelectorAll('.modal-hero')].some((el) => el.classList.contains('full')), '');
    } else {
      check('49 a hero plein cadre (.modal-hero.full)', false, 'pas de combat');
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
    if (st50) {
      const chips = [...appEl.querySelectorAll('.rail-chip')];
      const agiOf = (c) => Number((c.textContent.match(/\u26a1(\d+)/) ?? [])[1] ?? 0);
      const total50 = [...st50.team.attaque, ...st50.team.support, ...st50.enemies.attaque, ...st50.enemies.support].length;
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
        const uid50 = st50b ? (st50b.team.attaque[0] ?? st50b.team.support[0]).uid : null;
        if (uid50) {
          api._openUnit(uid50);
          await wait(40);
          const hero50 = [...doc.querySelectorAll('.modal-hero')].find((el) => el.classList.contains('full')) ?? null;
          const sub50 = hero50 ? (hero50.querySelector('.hero-sub')?.textContent ?? '') : '';
          check('50 e fiche : Neutre affiché pour une naissance, rareté en toutes lettres',
            sub50.includes('Neutre') && /Naissance|Commune|Peu commune|Rare|Légendaire/.test(sub50), sub50);
          check('50 e fiche : statline corrigée (stats + oppositions, plus de doublon)',
            [...doc.querySelectorAll('.statline')].length === 2, String([...doc.querySelectorAll('.statline')].length));
          const fstats50 = [...doc.querySelectorAll('.fstat')].map((el) => el.textContent ?? '');
          check('50 e fiche : grille identité (classe, élément, rareté), le rôle attaque/support retiré (T0.3)',
            fstats50.length === 3 && fstats50.some((t) => t.includes('Classe')) && fstats50.some((t) => t.includes('Élément')) && fstats50.some((t) => t.includes('Rareté'))
            && !fstats50.some((t) => t.includes('Rôle')), fstats50.join(' | '));
          {
            const fiche50 = [...doc.querySelectorAll('.modal-hero, .fstats, .spells')].map((el) => el.textContent ?? '').join(' ');
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
  check('40 récompense tactique intégrale', api._lastTactMult() >= 0.999, String(api._lastTactMult()));

  const mkSt46 = () => {
    const wave = api.makeWave(77, 2, 'marees', 1);
    const teamCards = {
      attaque: [{ ...api.byId('a1'), level: 15 }, { ...api.byId('g9'), level: 15 }],
      support: [{ ...api.byId('d2'), level: 15 }],
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
  check('45 b rien de coupé : #app défile en interne, fenêtre d’action bornée et défilable', html.includes('body.in-combat .act-modal { max-height: 56dvh; overflow-y: auto; }') && !html.includes('#tac-panel'), '');
  check('45 d menu ☰ en combat : navigation en surimpression opaque', html.includes('body.in-combat nav.open { position: fixed; top: 55px;') && html.includes('background: rgba(10, 14, 22, .98);'), '');
  check('44 a one-screen : unités de combat agrandies et panneau compact', html.includes('body.in-combat .unit { width: clamp(96px, 22vw, 128px); }') && html.includes('body.in-combat .unit.boss { width: clamp(122px, 28vw, 162px); }') && html.includes('body.in-combat .tac-btn { padding: 3px 6px; font-size: .68rem; }'), '');
  check('45 c pions v0.45 : format plus carré, image pleine, surimpression', html.includes('body.in-combat .card.battle { aspect-ratio: 5 / 6; }') && html.includes('body.in-combat .card.battle .cardfoot { padding: 2px 4px 4px; font-size: .62rem; gap: 2px 5px; }') && !html.includes('clamp(84px, 17vw, 108px)'), '');
  check('44 a one-screen : journal borné, rappels bas disparus', html.includes('body.in-combat #log { min-height: 20px; max-height: 20dvh;') && !html.includes('-webkit-line-clamp'), '');
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

  // ---------- v0.46a : correctifs terrain (46 a-e) ----------
  mem.clear();
  for (const t of store.teams) t.slots = [];
  const v1 = api.newInst('n1', 5); const v2 = api.newInst('n1', 5); const v3 = api.newInst('n1', 5);
  check('46 a 3 exemplaires de la m\u00eame carte posables', api.addCardIid(v1.iid).ok && api.addCardIid(v2.iid).ok && api.addCardIid(v3.iid).ok, '');
  const v4 = api.newInst('n1', 5);
  const r4 = api.addCardIid(v4.iid);
  check('46 a le 4e exemplaire de la m\u00eame carte refus\u00e9', !r4.ok, String(r4 && r4.reason));
  check('46 b pions mobiles 26vw (media 600)', html.includes('clamp(104px, 26vw, 136px)') && html.includes('clamp(130px, 32vw, 172px)'), '');
  check('46 b images de fond \u00e9claircies en combat', html.includes('brightness(1.12) contrast(1.04)'), '');
  check('46 b fiche : h\u00e9ro plein cadre en t\u00eate de fiche', html.includes('.modal-hero.full') && html.includes('<div class="modal-hero full">'), '');
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
      const u51 = st51.team.attaque[0] ?? st51.team.support[0];
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

  console.log(fails === 0 ? `SCÉNARIOS : TOUT PASSE (${total} checks)` : `SCÉNARIOS : ${fails} ÉCHEC(S) / ${total}`);
  process.exit(fails === 0 ? 0 : 1);
}
main().catch((e) => { console.error('CRASH :', e && e.stack || e); process.exit(1); });
