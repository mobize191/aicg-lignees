import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootDist, wait } from '../stub.mjs';

// correctifs ui-v1.53 : non-régression des 2 bugs UI trouvés par le harnas bot-ui.mjs
// (bots qui ne pilotent QUE le DOM : 70 bots → 0 exception ; contrôle négatif sur le dist
// d'origine : fusion par l'UI impossible + héros qui continue de marcher en coulisse après
// le retour à la ville). Chaque test protège UN correctif, PAR CLICS RÉELS sur le DOM :
//   (a) Autel des Lignées : dataset.autelIid est une CHAÎNE, les iids sont des NOMBRES —
//       Number() à la lecture, sinon la sélection ne s'affiche jamais, l'aperçu reste
//       « indisponible » et la fusion ne peut jamais aboutir.
//   (b) #errance-back : store.errance = null, sinon la boucle rAF continue de faire vivre
//       la zone en coulisse (le héros marche, les rencontres déclenchent des combats
//       depuis un autre écran).

// l'écran de départ est cliqué pour obtenir un store jouable
async function passeLeDepart(app, ctx) {
  for (let k = 0; k < 400 && !app.children.length; k++) await wait(10);
  const choix = app.querySelector('.depart-choice');
  if (choix) { choix.click(); await wait(20); }
  assert.ok(ctx.location.hash, 'le jeu a démarré');
}

test('ui-v1.53 (a) : fusion par l\'Autel des Lignées PAR CLICS — sélection visible, aperçu, enfant né', async () => {
  const { api, ctx, els, errors } = bootDist('dist.html');
  const app = els.get('app');
  await passeLeDepart(app, ctx);
  const store = api.store;
  // deux exemplaires d'une carte C, hors équipe (le vrai chemin : newInst)
  const pa = api.newInst('a1', 3);
  const pb = api.newInst('a1', 3);
  assert.ok(Number.isInteger(pa.iid) && pa.iid !== pb.iid, 'iids entiers distincts');
  // l'autel par le hub (délégation document-level)
  const nav = [...ctx.document.body.querySelectorAll('nav a')].find((x) => x.getAttribute('href') === '#accueil');
  nav.click(); await wait(10);
  const ancre = [...app.querySelectorAll('a')].find((x) => x.getAttribute('href') === '#autel');
  assert.ok(ancre, 'ancre de l\'autel présente sur le hub');
  ancre.click(); await wait(20);
  assert.equal(ctx.location.hash, '#autel', 'navigation vers l\'autel');
  // sélection des 2 parents PAR CLIC : la classe .sel doit apparaître (nombre === nombre)
  const lignes = () => [...app.querySelectorAll('.autel-row')];
  const lA = lignes().find((r) => r.dataset.autelIid === String(pa.iid));
  assert.ok(lA, '1er parent listé à l\'autel');
  lA.click(); await wait(10);
  // le clic re-rend le panneau : on re-querie les lignes (l'ancien élément est détaché)
  assert.ok(lignes().some((r) => r.dataset.autelIid === String(pa.iid) && r.classList.contains('sel')), '1er parent sélectionné (.sel visible)');
  const lB2 = lignes().find((r) => r.dataset.autelIid === String(pb.iid));
  assert.ok(lB2, '2e parent listé à l\'autel');
  lB2.click(); await wait(10);
  assert.ok(lignes().some((r) => r.dataset.autelIid === String(pb.iid) && r.classList.contains('sel')), '2e parent sélectionné (.sel visible)');
  const texte = app.textContent ?? '';
  assert.ok(texte.includes('Aperçu'), `l'aperçu de fusion est rendu (reçu : ${texte.slice(0, 80)}…)`);
  // double confirmation, PAR CLICS
  const c1 = app.querySelector('#autel-confirm');
  assert.ok(c1, 'bouton « Fusionner » présent');
  c1.click(); await wait(10);
  const c2 = app.querySelector('#autel-confirm');
  assert.ok(c2 && /Confirmer/.test(c2.textContent ?? ''), '2e clic demandé (garde anti-clics)');
  c2.click(); await wait(15);
  const n = store.instances.length;
  assert.equal(n, 3, `2 parents consommés + 1 enfant = 3 instances (reçu : ${n})`);
  const enfant = store.instances.find((i) => i.iid !== pa.iid && i.iid !== pb.iid);
  assert.ok(enfant, 'l\'enfant de fusion existe');
  assert.ok(Number.isInteger(enfant.iid), `iid enfant ENTIER (reçu : ${JSON.stringify(enfant.iid)})`);
  assert.equal(errors.length, 0, 'aucune erreur non capturée');
});

test('ui-v1.53 (b) : #errance-back ARRÊTE le monde — store.errance null, héros figé, aucun combat en coulisse', async () => {
  const { api, ctx, els, errors } = bootDist('dist.html');
  const app = els.get('app');
  await passeLeDepart(app, ctx);
  const store = api.store;
  // une petite équipe pour que l'errance soit jouable
  api.newInst('a1', 3);
  api.addCardIid(store.instances[1].iid);
  // entrée en zone PAR CLICS (#terres → .enter-zone)
  const navTerres = [...ctx.document.body.querySelectorAll('nav a')].find((x) => x.getAttribute('href') === '#terres');
  navTerres.click(); await wait(10);
  const zBtn = [...app.querySelectorAll('.enter-zone')].find((x) => !x.disabled && !x.classList.contains('disabled'));
  assert.ok(zBtn, 'une zone déverrouillée est proposée');
  zBtn.click(); await wait(15);
  assert.equal(ctx.location.hash, '#errance', 'entrée dans la zone d\'errance');
  const st = store.errance;
  assert.ok(st, 'store.errance vivant');
  // on pose un chemin vers un POI lointain (miroir du pointerdown du canvas)
  const cible = st.map.donjon
    ? { x: st.map.donjon.x + 1, y: st.map.donjon.y + 3 }
    : { x: st.map.autel.x, y: st.map.autel.y };
  const offsets = [[0, 0]];
  for (let r = 1; r <= 3; r++) for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++)
    if (Math.max(Math.abs(dx), Math.abs(dy)) === r) offsets.push([dx, dy]);
  let pose = false;
  for (const [dx, dy] of offsets) if (api.setTarget(st, cible.x + dx, cible.y + dy)) { pose = true; break; }
  assert.ok(pose, 'chemin posable vers la cible');
  await wait(150); // la boucle rAF de l'UI démarre la marche
  const xAvant = st.hero.x, yAvant = st.hero.y;
  // RETOUR À LA VILLE PENDANT LA MARCHE, PAR CLIC
  const back = app.querySelector('#errance-back');
  assert.ok(back, 'bouton de retour présent');
  back.click(); await wait(30);
  assert.equal(ctx.location.hash, '#accueil', 'retour au hub-ville');
  assert.equal(store.errance, null, 'store.errance remis à null (plus de monde en coulisse)');
  // 1,5 s de boucle rAF : le héros ne doit plus avancer d'un pixel
  await wait(1500);
  const bouge = Math.hypot(st.hero.x - xAvant, st.hero.y - yAvant);
  assert.ok(bouge < 0.05, `héros figé après le retour (déplacement mesuré : ${bouge.toFixed(3)})`);
  assert.equal(ctx.location.hash, '#accueil', 'aucune navigation forcée (combat surpris)');
  assert.ok(!store.zoneFight, 'aucun combat de zone déclenché en coulisse');
  assert.equal(errors.length, 0, 'aucune erreur non capturée');
});
