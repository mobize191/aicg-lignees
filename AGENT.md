# AGENT.md — guide d'entrée pour agents

> À lire en premier dans toute session (Vibe, Claude Code, Cursor, OpenCode…). Ce fichier est le point d'entrée ; le prompt complet d'installation de session vit dans `docs/prompt-lancement.md` et la carte de la documentation dans `docs/00-SOMMAIRE.md`. Si les trois se contredisent, `docs/arbitrages.md` (journal daté des décisions) tranche.

## Le projet en une phrase

**AICG : Lignées** (repo GitHub `mobize191/aicg-lignees`, branche `main`) : un jeu de cartes solo 100 % navigateur — collection, errance, donjons et lignées, du Novice au Légendaire. Le jeu embarqué est `dist.html`, généré par `node build.mjs` depuis `src/` + `data/`.

## Ordre de lecture (avant toute ligne de code)

1. `docs/00-SOMMAIRE.md` : la carte de la documentation, où trouver quoi et où ranger quoi.
2. `docs/roadmap.md` : l'état courant du jeu et le reste à faire dans l'ordre.
3. `docs/regles-jeu.md` (les règles actées) et `docs/arbitrages.md` (le journal des décisions datées, statut `ACTÉ` / `PISTE` / `PROPOSÉ`). Ne contredis jamais un arbitre `ACTÉ` : propose une révision datée.
4. Pour toute donnée du jeu : `data/*.json` est la source de vérité. Les tableaux `docs/tables/` sont générés, jamais édités à la main.

## Règles d'or

- **Jamais de valeur de design dans `src/`** : chaque taux, multiplicateur, coût, nom, id vit dans `data/*.json`. Le test allowlist (`tests/allowlist.test.js`) le vérifie.
- **`dist.html` n'est jamais édité à la main** : on modifie `src/` ou `data/`, puis `node build.mjs`.
- **Zéro dépendance** : pas de `npm install`. Node 18+, tests natifs (`node --test`).
- **Les ids de sorts et de cartes ne changent pas** : les sauvegardes et les fusions les référencent. Un renommage ne touche que le libellé.
- **On ne devine jamais un design ambigu** : on note la question dans `docs/arbitrages.md` (statut `PROPOSÉ`) et on prend en attendant l'option la plus conservatrice.

## Chaîne de preuve (à chaque changement)

1. `node build.mjs` → dist régénéré (le build est déterministe : deux builds sans changement donnent le même fichier).
2. `node --test` → tous les tests verts (381 à ce jour).
3. `node smoke-ui.mjs dist.html` → tous les checks verts (498 à ce jour).
4. `node combat-digest.mjs dist.html 3000` → digest et victoires comparés à la baseline ; notés dans `docs/roadmap.md` si le gameplay bouge.
5. Si `data/` a bougé : `node tools/gen-tables.mjs` puis commit des tableaux.

Baseline VERROUILLÉE par Marc-Olivier (suite 60, 15/11/2026) : `d630d83e…` 419/3000 / `584f5d16…` 1419/10000 (0 exception, 0 marathon). Historique des baselines : `docs/roadmap.md` et `docs/arbitrages.md`.

## Discipline

- Une tâche = une préoccupation = un commit, message court à l'impératif, en français.
- Une décision de design prise en session → consignée dans `docs/arbitrages.md` avec sa date et son statut.
- Un chantier terminé → son rapport va dans `docs/historique/` (les specs et plans des chantiers clos y sont archivés et fusionnés).
- Ne revendique jamais un succès sans la sortie de la preuve qui l'établit.
- Les changements de version du jeu vont dans l'historique en jeu (`HISTORY` dans `src/ui.js`), dans `CHANGELOG.md` et dans `docs/roadmap.md` — ensemble.

## Collaboration

- Réponds en français, itérations courtes : on montre vite, on corrige vite.
- Le propriétaire du jeu (Marc-Olivier) tranche les arbitrages ; tout le reste est de l'exécution autonome.
