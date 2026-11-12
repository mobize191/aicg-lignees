# AICG : Lignées

Jeu de cartes solo 100% navigateur : collection, donjons et lignées qui montent du Novice au Légendaire. Prototype v1.30 (grand chantier arbres + sorts v1.12, boucle de jeu v2 et économie v2 clôturées le 11/11, bloc visuel v1.27 : hub-ville, Terres Sauvages, errance top-down zone Marées ; correctifs terrain v1.29 ; CI v1.30).

**Jouer en ligne : https://mobize191.github.io/aicg-lignées/**

## Jouer

Ouvrez `dist.html` dans un navigateur, ou via GitHub Pages (https://mobize191.github.io/aicg-lignees/ ; activez Pages avec « Source : GitHub Actions » dans les paramètres du repo). La CI (`.github/workflows/pages.yml`) enchaîne deux jobs à chaque push sur `main` : un job **test** (`node build.mjs && node --test`) puis le **déploiement Pages** qui publie `dist.html` en `index.html`, les manifestes `assets-v3.json` (V3.0, défaut) + `assets-v3.1.json` (V3.1, commutable via le bouton 🖼️) et les vidéos de sorts `site-assets/fx/` → `fx/`.

## Structure

- `dist.html` : le jeu complet, autonome (HTML + JS + CSS, aucune dépendance).
- `assets-v3.json` : manifeste d'illustrations par défaut depuis v1.28 (data-URI : 265 arts de cartes vague 3 + 97 assets existant uniquement en 3.1 + 8 fonds de donjons, campagne AICG V3 / WAI-Illustrious v17, ~31 Mo ASCII pur), chargé automatiquement quand le jeu est servi en ligne.
- `assets-v3.1.json` : doublon commutable de la relance 3.1 (verrous R8/R9/R10, 362 arts + 8 fonds, ~30 Mo), sélectionné via le bouton 🖼️ (choix persisté en localStorage `fondations-art-src`). Les anciens manifests (`assets.json`, `assets-wai.json`, `assets-v2.json`) sont archivés dans `archives/assets/`.
- `combat-digest.mjs` : harnas d'équilibrage (3000 combats simulés, digest SHA256 de dormance).
- `smoke-ui.mjs` : suite de fumée UI du dist publié (171 checks).
- `tools/` : les scripts de la campagne d'illustrations ComfyUI (extraction du catalogue, génération des prompts, batch API, intégration au manifeste, planches de contrôle).

## Documentation

Le dossier `docs/` est organisé par usage : commencer par `docs/00-SOMMAIRE.md` (la carte complète : où trouver quoi, où ranger quoi).

- `AGENT.md` : le guide d'entrée pour agents (règles d'or, chaîne de preuve, discipline) ; `CHANGELOG.md` : l'historique des versions.

- `docs/prompt-lancement.md` : le prompt à copier au début de chaque session agent (contexte, règles d'or, chaîne de preuve).
- `docs/roadmap.md` : l'état du prototype version par version et ce qui reste à faire.
- `docs/regles-jeu.md` : les règles actées du jeu, du combat aux donjons.
- `docs/arbitrages.md` : le journal des décisions de design, datées et statuées (ACTÉ / PISTE / PROPOSÉ).
- `docs/tables/` : les tableaux de référence (cartes, sorts, monstres, monde), générés depuis `data/*.json` par `node tools/gen-tables.mjs` : à relancer puis commiter après chaque évolution des données.
- `docs/travail-local.md` : les prompts de travail local (corrections, validation IHM par captures, campagne ComfyUI).
- `docs/validation-ihm.md` : le protocole de validation IHM locale (scénarios avec captures d'écran).
- `docs/design/` : les designs courants (spec complète, arbres d'évolution et sorts actuels, familles et races v3, guide de l'errance top-down).
- `docs/images/` : conventions graphiques et plans de campagne d'illustrations.
- `docs/historique/` : la mémoire des chantiers clos : rapports (correctifs, phases de la refonte, vérifications), prompts, et specs et plans fusionnés des grands chantiers (refonte majeure, grand chantier arbres + sorts, design des arbres v17, refonte des sorts v2, inventaire du catalogue v0.43).

## Tests

```bash
node build.mjs && node --test && node smoke-ui.mjs
node combat-digest.mjs dist.html 3000
node tools/gen-tables.mjs   # si data/ a bougé
```

Baseline courante (11/11/2026, post boucle v2 + économie v2 + bloc visuel) : digest `f72106ff403cf3f96a35532fdf8ab9abdfa273a151424f3b92e6f05e876260ba`, **1379 victoires / 3000 combats, 0 exception, 1 marathon** ; pack N = 10 000 : `3f9fe198…` 4558/10000. **141 tests** verts, smoke **269 checks** (2 échecs préexistants hors chantier, non liés). Historique des baselines dans `docs/roadmap.md` et `docs/arbitrages.md`.
