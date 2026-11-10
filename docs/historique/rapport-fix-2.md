# Mini-rapport T-FIX-2 : la migration v8 -> v12 branchée dans le flux réel

## Commandes exécutées et sorties réelles

1. `node --test` → `# pass 60 / # fail 0` (56 + 4 nouveaux tests de flux dans `tests/migration-flux.test.js`)
2. `node tools/smoke-migration.mjs dist.html` (scénario réel : fixture v8 injectée dans le stockage, `load()` du dist, `save()`, relecture) → 9/9 PASS, `SMOKE MIGRATION : TOUT PASSE` : `load()` accepte la v8, sauvegarde relue `version === 12`, instances/tokens conservés, agi/int présents, `grimoire`/`zonesVisitees` persistés, 0 erreur console
3. `node smoke-ui.mjs dist.html` → `SCÉNARIOS : TOUT PASSE (121 checks)`
4. `grep -c "art-src-btn" dist.html` → `5` (le switch 🖼️ survit au rebuild)
5. Après commit : `node build.mjs && git status --short dist.html` → `0` (dist committé = dist régénéré)

## Changements

- `data/engine.json` : `SAVE_VERSION: 12` (= `CURRENT_VERSION`, invariant testé).
- `src/data.js` : alias `CURRENT_VERSION`.
- `src/ui.js` : `load()` applique `migrate(JSON.parse(raw))` avant `restore()` ; `restore()` accepte les versions 1..`CURRENT_VERSION` et relit `grimoire`, `zonesVisitees`, `voie`, `agi`, `int` (sorts re-mappés `sort`/`cran` acceptés) ; `snapshot()` persiste `grimoire` et `zonesVisitees` ; `store` initialisé avec les deux champs.
- `tests/migration-flux.test.js` : flux réel (a) fixture v8 → v12 complète, (b) assertions structurelles sur la source (`restore(migrate(`, version 12 acceptée, `snapshot()` persistante, `SAVE_VERSION=12`), (c) fixture v12 rechargée sans rejet (idempotence), + invariant `SAVE_VERSION === CURRENT_VERSION`.
- Migrations existantes non réécrites ; aucun champ existant touché.

VERDICT: PASS
