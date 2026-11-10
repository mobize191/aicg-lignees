// tools/smoke-migration.mjs : scénario réel T-FIX-2 — une sauvegarde v8 injectée dans
// le stockage est chargée par le flux réel du dist (load -> migrate -> restore), puis
// re-sauvegardée : la sauvegarde relue doit être en version courante (12).
// Usage : node tools/smoke-migration.mjs [dist.html]
import { readFileSync } from 'node:fs';
import { bootDist, wait } from '../stub.mjs';

const file = process.argv[2] ?? 'dist.html';
const fixture = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));

const { api, mem, errors } = bootDist(file, {
  load: 'load', save: 'save', SAVE_KEY: 'SAVE_KEY', migrate: 'migrate', CURRENT_VERSION: 'DATA.engine.CURRENT_VERSION',
});
await wait(200);

let fails = 0;
const check = (label, ok, info = '') => {
  if (!ok) fails++;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + label + (info && !ok ? '  [' + info + ']' : ''));
};

// 1) injecte la fixture v8 dans le stockage, puis charge via le flux réel
mem.set(api.SAVE_KEY, JSON.stringify(fixture));
const loaded = api.load();
check('load() accepte la sauvegarde v8 et la migre', loaded === true);
check('version courante lue dans le store', api.CURRENT_VERSION === 12, String(api.CURRENT_VERSION));

// 2) le jeu sauvegarde (flux réel de save) et on relit le stockage
api.save();
const raw = mem.get(api.SAVE_KEY);
const back = JSON.parse(raw);
check('sauvegarde relue en version 12', back.version === 12, 'version=' + back.version);
check('instances conservées', back.instances.length === fixture.instances.length,
  back.instances.length + '/' + fixture.instances.length);
check('exemplaires avec agi/int après migration', back.instances.every((i) => Number.isFinite(i.agi) && Number.isFinite(i.int)));
check('grimoire persisté', Array.isArray(back.grimoire));
check('zonesVisitees persisté', Array.isArray(back.zonesVisitees));
check('tokens conservés', back.tokens.length === fixture.tokens.length);
check('0 erreur console au boot', errors.length === 0, errors.join(' | ').slice(0, 200));

console.log(fails === 0 ? 'SMOKE MIGRATION : TOUT PASSE' : `SMOKE MIGRATION : ${fails} ECHEC(S)`);
process.exit(fails === 0 ? 0 : 1);
