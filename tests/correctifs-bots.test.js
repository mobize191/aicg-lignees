import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootDist } from '../stub.mjs';

// correctifs bots-v1.52 : non-régression des 4 bugs trouvés par le harnas bots-boucle.mjs
// (500 bots en essaim : 0 exception, 0 anomalie — contre 285 anomalies et 73 exceptions sur
// le dist d'origine). Chaque test protège UN correctif :
//   (a) enfant de fusion avec iid ENTIER (plus jamais « fus-A-B »)
//   (b) le slot de l'enfant survit au save → load
//   (c) une VIEILLE sauvegarde avec un iid « fus-A-B » est auto-réparée (iid remappé, slot réparé)
//   (d) 3 exemplaires d'une même carte en équipe survivent au rechargement
//   (e) cran de race : le plafond PV affiché hors combat = le VRAI plafond de combat (88, pas 84)
//   (f) mana enrichi par l'INT : le plafond mana affiché = celui de makeUnit (15, pas 10)
//   (g) buyCompagnon refuse gracieusement un id inconnu (false, jamais d'exception)

const carte = (api, id) => api.CATALOG.find((c) => c.id === id);

test('bots-v1.52 (a) : fusion via l\'Autel — l\'enfant naît avec un iid ENTIER', () => {
  const { api, errors } = bootDist('dist.html');
  api._tacPause(true);
  const pool = api.CATALOG.filter((c) => !c.monster && !c.dungeon && c.rarity !== 'N' && c.rarity !== 'M');
  const idA = pool.find((c) => c.rarity === 'R').id;
  const idB = pool.find((c) => c.rarity === 'SR' && c.id !== idA).id;
  const a = api.newInst(idA, 2); api.newInst(idA, 1); // 2 exemplaires de A (ownedOf > 1)
  const b = api.newInst(idB, 2); api.newInst(idB, 1); // 2 exemplaires de B
  const rng = api.mulberry32(7);
  const plan = api.fusionPreview(a, b, rng);
  assert.equal(plan.ok, true, 'aperçu de fusion disponible');
  const res = api.doFusion(api.store.instances, a.iid, b.iid, [], plan, {
    teamIids: [...api.store.team.slots].filter(Boolean),
    ownedOf: (id) => api.store.instances.filter((x) => x.id === id).length,
    rng,
    childIid: api.store.instanceSeq++, // le chemin de l'UI (renderAutel)
  });
  assert.equal(res.ok, true, 'fusion consommée');
  assert.ok(Number.isInteger(res.enfant.iid), `iid enfant ENTIER, reçu : ${JSON.stringify(res.enfant.iid)}`);
  assert.ok(res.enfant.iid > 0, 'iid enfant positif');
  assert.equal(errors.length, 0, 'aucune erreur non capturée');
});

test('bots-v1.52 (b) : l\'enfant de fusion en équipe survit au save → load', () => {
  const { api, mem } = bootDist('dist.html');
  api._tacPause(true);
  const pool = api.CATALOG.filter((c) => !c.monster && !c.dungeon && c.rarity !== 'N' && c.rarity !== 'M');
  const idA = pool.find((c) => c.rarity === 'R').id;
  const idB = pool.find((c) => c.rarity === 'SR' && c.id !== idA).id;
  const a = api.newInst(idA, 2); api.newInst(idA, 1);
  const b = api.newInst(idB, 2); api.newInst(idB, 1);
  const rng = api.mulberry32(11);
  const plan = api.fusionPreview(a, b, rng);
  const res = api.doFusion(api.store.instances, a.iid, b.iid, [], plan, {
    teamIids: [...api.store.team.slots].filter(Boolean),
    ownedOf: (id) => api.store.instances.filter((x) => x.id === id).length,
    rng,
    childIid: api.store.instanceSeq++,
  });
  assert.equal(res.ok, true, 'fusion consommée');
  api.store.instances = res.instances;
  api.addCardIid(res.enfant.iid); // l'enfant rejoint l'équipe par le vrai chemin
  assert.ok(api.store.team.slots.includes(res.enfant.iid), 'enfant placé en équipe');
  api.save();
  assert.equal(api.load(), true, 'sauvegarde relue');
  assert.ok(api.store.team.slots.includes(res.enfant.iid), 'le slot de l\'enfant est préservé au rechargement');
  assert.ok(api.byIid(res.enfant.iid), 'l\'enfant est toujours résolvable par iid');
});

test('bots-v1.52 (c) : une vieille sauvegarde « fus-A-B » est auto-réparée (iid entier + slot réparé)', () => {
  const { api, mem } = bootDist('dist.html');
  api._tacPause(true);
  const pool = api.CATALOG.filter((c) => !c.monster && !c.dungeon && c.rarity !== 'N' && c.rarity !== 'M');
  const idA = pool.find((c) => c.rarity === 'R').id;
  const idB = pool.find((c) => c.rarity === 'SR' && c.id !== idA).id;
  const a = api.newInst(idA, 2); api.newInst(idA, 1);
  const b = api.newInst(idB, 2); api.newInst(idB, 1);
  const rng = api.mulberry32(13);
  const plan = api.fusionPreview(a, b, rng);
  const res = api.doFusion(api.store.instances, a.iid, b.iid, [], plan, {
    teamIids: [...api.store.team.slots].filter(Boolean),
    ownedOf: (id) => api.store.instances.filter((x) => x.id === id).length,
    rng,
    childIid: api.store.instanceSeq++,
  });
  assert.equal(res.ok, true, 'fusion consommée');
  api.store.instances = res.instances;
  const childId = res.enfant.id;
  const vieuxIid = `fus-${a.iid}-${b.iid}`; // la clé non entière des sauvegardes v1.52-
  api.store.team.slots = [res.enfant.iid];
  api.save();
  // forger une sauvegarde LEGACY : l'instance ET le slot portent la vieille clé « fus-A-B »
  const key = api.slotKey(api._activeSlot());
  const raw = JSON.parse(mem.get(key));
  const rawEnfant = raw.instances.find((i) => i.id === childId);
  assert.ok(rawEnfant, 'l\'enfant est dans la sauvegarde');
  rawEnfant.iid = vieuxIid;
  raw.teams[0].slots = raw.teams[0].slots.map((x) => (x === res.enfant.iid ? vieuxIid : x));
  mem.set(key, JSON.stringify(raw));
  assert.equal(api.load(), true, 'sauvegarde legacy acceptée');
  const slots = api.store.team.slots.filter(Boolean);
  assert.equal(slots.length, 1, 'le slot de l\'enfant n\'a pas été perdu');
  const enfant = api.byIid(slots[0]);
  assert.ok(enfant, 'le slot remappé résout une instance');
  assert.ok(Number.isInteger(slots[0]), `iid remappé ENTIER, reçu : ${JSON.stringify(slots[0])}`);
  assert.equal(enfant.id, childId, 'le slot pointe bien l\'enfant de fusion');
  assert.ok(api.store.instances.every((i) => Number.isInteger(i.iid)), 'plus aucun iid non entier en collection');
});

test('bots-v1.52 (d) : 3 exemplaires d\'une même carte en équipe survivent au rechargement', () => {
  const { api } = bootDist('dist.html');
  api._tacPause(true);
  const pool = api.CATALOG.filter((c) => !c.monster && !c.dungeon && c.rarity !== 'N' && c.rarity !== 'M');
  const id = pool.find((c) => c.rarity === 'C').id;
  const i1 = api.newInst(id, 1), i2 = api.newInst(id, 1), i3 = api.newInst(id, 1);
  api.store.team.slots = [i1.iid, i2.iid, i3.iid]; // 3 exemplaires : légal (cap addCardIid = 3)
  assert.equal(api.store.team.slots.length, 3, '3 exemplaires placés');
  api.save();
  assert.equal(api.load(), true, 'sauvegarde relue');
  assert.equal(api.store.team.slots.filter(Boolean).length, 3,
    `3 exemplaires conservés (le cap sanitizeTeams est 3, aligné sur addCardIid), reçus : ${JSON.stringify(api.store.team.slots)}`);
  assert.ok(api.store.team.slots.every((x) => api.byIid(x)), 'chaque slot résout une instance');
});

test('bots-v1.52 (e) : cran de race — le plafond PV hors combat est le VRAI plafond de combat', () => {
  const { api } = bootDist('dist.html');
  api._tacPause(true);
  const inst = api.newInst('e4', 1); // Sergent des Brumes, Guerrier R : cran de race +5 % PV
  const cur = api.curHpManaOf(inst.iid);
  const st = api.statsAt(carte(api, 'e4'), 1);
  const u = api.makeUnit({ ...carte(api, 'e4'), level: 1, equip: { atkPct: 0, hpPct: 0, agiPct: 0, intPct: 0, manaRegen: 0 } }, 'e4', 1);
  assert.equal(cur.maxHp, u.maxHp, 'le plafond affiché = le plafond de makeUnit (miroir de renderCombat)');
  assert.equal(cur.maxHp, 88, `cran +5 % compté : 88, reçu : ${cur.maxHp}`);
  assert.notEqual(cur.maxHp, st.hp, `statsAt seul (${st.hp}) ignorait le cran de race`);
  assert.equal(cur.hp, cur.maxHp, 'à plein hors run actif');
});

test('bots-v1.52 (f) : mana enrichi par l\'INT — le plafond mana affiché est celui de combat', () => {
  const { api } = bootDist('dist.html');
  api._tacPause(true);
  const inst = api.newInst('e4', 1); // mana base 10, INT 7 → makeUnit enrichit manaMax
  const cur = api.curHpManaOf(inst.iid);
  const u = api.makeUnit({ ...carte(api, 'e4'), level: 1, equip: { atkPct: 0, hpPct: 0, agiPct: 0, intPct: 0, manaRegen: 0 } }, 'e4', 1);
  assert.equal(cur.manaMax, u.manaMax, 'le plafond mana affiché = celui de makeUnit');
  assert.equal(cur.manaMax, 15, `mana enrichi par l'INT : 15, reçu : ${cur.manaMax}`);
  assert.notEqual(cur.manaMax, carte(api, 'e4').mana, 'la base nue (10) sous-estimait le plafond de combat');
  assert.equal(cur.mana, cur.manaMax, 'à plein hors run actif');
});

test('bots-v1.52 (g) : buyCompagnon refuse gracieusement un id inconnu (false, aucune exception)', () => {
  const { api, errors } = bootDist('dist.html');
  api._tacPause(true);
  let retour = null;
  assert.doesNotThrow(() => { retour = api.buyCompagnon('id-inconnu-bot'); },
    'un id inconnu ne doit JAMAIS lever « Carte inconnue »');
  assert.equal(retour, false, 'refus gracieux : false, pas une levée');
  assert.equal(errors.length, 0, 'aucune erreur non capturée côté harnas');
});
