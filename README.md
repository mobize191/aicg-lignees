# AICG : Lignées

Jeu de cartes solo 100% navigateur : collection, donjons et lignées qui montent du Novice au Légendaire. Prototype v0.47 (le mode Tactique devient un vrai tour de RPG depuis la v0.46 : fenêtre d'action carte par carte, ciblage explicite).

**Jouer en ligne : https://mobize191.github.io/aicg-lignées/**

## Jouer

Ouvrez `dist.html` dans un navigateur, ou via GitHub Pages (workflow inclus : copie dist.html en index.html à chaque push sur main ; activez Pages avec « Source : GitHub Actions » dans les paramètres du repo).

## Structure

- `dist.html` : le jeu complet, autonome (HTML + JS + CSS, aucune dépendance).
- `assets.json` : manifeste d'illustrations (data-URI : 33 arts de cartes + 5 fonds de donjons), chargé automatiquement quand le jeu est servi en ligne.
- `combat-digest.mjs` : harnas d'équilibrage (3000 combats simulés, digest SHA256 de dormance).
- `smoke-ui.mjs` : suite de fumée UI du dist publié (121 checks).

## Documentation

Le dossier `docs/` contient la documentation de référence du jeu :

- `docs/spec-design.md` : la spec complète (design v2) : univers, règles, cartes, sorts, combats, économie.
- `docs/design-arbres.md` : le design détaillé des arbres d'évolution et de sorts (v16).
- `docs/inventaire-cartes.md` : les 238 cartes, vue d'ensemble par type (naissances, familiales, solos, graines, monstres des donjons, divines) avec voies et signatures.
- `docs/inventaire-sorts.md` : les 653 entrées de sorts du catalogue : communs, sorts de race et de classe, sorts de lignée des 7 familles, Pouvoirs, coûts et mana par palier.
- `docs/arbres-evolution.md` : les arbres d'évolution en diagrammes : voies des naissances, 7 familles avec portes et graines, mini-lignées solos, webs des 5 donjons, familles divines.
- `docs/arbres-sorts.md` : la chronologie d'acquisition : qui apprend quoi, quand ; un sort de lignée par palier, le cumul de l'exemplaire à chaque évolution, et les exceptions.
- `docs/audit-sorts.md` : l'audit de cohérence des sorts : contrôles passés, constats et recommandations.
- `docs/refonte-sorts.md` : les notes de la refonte des sorts.
- `docs/roadmap.md` : l'état du prototype version par version et ce qui reste à faire.
- `docs/validation-ihm.md` : le protocole de validation IHM locale (scénarios S1-S10 avec captures d'écran, prompt prêt à copier dans un agent local).
- `docs/images-prompt-serie1.md` : le brief de génération des illustrations, série 1.
- `docs/images-conventions.md` : les conventions graphiques des illustrations (formats, palettes, style).

## Tests

```bash
node combat-digest.mjs dist.html 3000
node smoke-ui.mjs
```

Baseline v0.47 : digest `c5ab2af1f56c23f935859e9d9944e8183dafe5788ed48f097dab412107eb0f47`, 534 victoires / 3000 combats (le moteur pas-à-pas v0.46 est strictement équivalent à l'ancien resolveTurn : dormance prouvée par le check 46 i du smoke ; le patch v0.47 ne touche que des libellés).
