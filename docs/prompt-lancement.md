# Prompt de lancement : AICG, Lignées

> À copier tel quel au début d'une session agent (Vibe, Claude Code, Cursor, OpenCode...). Il installe le contexte, les règles d'or et la discipline du projet.

---

Tu travailles sur **AICG : Lignées** (repo GitHub `mobize191/aicg-lignees`, branche `main`), un jeu de cartes solo 100 % navigateur : collection, errance, donjons, lignées. Le jeu embarqué est `dist.html`, généré par `node build.mjs` depuis `src/` + `data/`.

## Ordre de lecture (avant toute ligne de code)

1. `docs/00-SOMMAIRE.md` : la carte de la documentation, où trouver quoi et où ranger quoi.
2. `docs/roadmap.md` : l'état courant du jeu et le reste à faire dans l'ordre.
3. `docs/regles-jeu.md` : les règles actées ; `docs/arbitrages.md` : le journal des décisions datées et statuées (`ACTÉ`, `PISTE`, `PROPOSÉ`). Ne contredis jamais un arbitrage `ACTÉ` : propose une révision datée.
4. Pour toute donnée du jeu : `data/*.json` est la source de vérité. Les tableaux `docs/tables/` sont générés, jamais édités à la main.

## Règles d'or

- **Jamais de valeur de design dans `src/`** : chaque taux, multiplicateur, coût, nom, id vit dans `data/*.json`. Le test allowlist (`tests/allowlist.test.js`) le vérifie.
- **`dist.html` n'est jamais édité à la main** : on modifie `src/` ou `data/`, puis `node build.mjs`.
- **Zéro dépendance** : pas de `npm install`. Node 18+, tests natifs.
- **Les ids de sorts et de cartes ne changent pas** : les sauvegardes et les fusions les référencent. Un renommage ne touche que le libellé.
- On ne devine jamais un design ambigu : on note la question dans `docs/arbitrages.md` (statut `PROPOSÉ`) et on prend en attendant l'option la plus conservatrice.

## Chaîne de preuve (à chaque changement)

1. `node build.mjs` → dist régénéré.
2. `node --test` → 60 tests verts.
3. `node smoke-ui.mjs` → 121 checks verts.
4. `node combat-digest.mjs dist.html 3000` → digest et victoires notés dans `docs/roadmap.md` si le gameplay bouge.
5. Si `data/` a bougé : `node tools/gen-tables.mjs` puis commit des tableaux.

## Discipline

- Une tâche = une préoccupation = un commit, message court à l'impératif.
- Une décision de design prise en session → consignée dans `docs/arbitrages.md` avec sa date et son statut.
- Un chantier terminé → son rapport va dans `docs/historique/`.
- Ne revendique jamais un succès sans la sortie de la preuve qui l'établit.

## Collaboration

- Réponds en français, itérations courtes : on montre vite, on corrige vite.
- Le propriétaire du jeu (Marc-Olivier) tranche les arbitrages ; tout le reste est de l'exécution autonome.
