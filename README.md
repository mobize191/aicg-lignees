# AICG : Lignées

Jeu de cartes solo 100% navigateur : collection, donjons et lignées qui montent du Novice au Légendaire. Prototype v0.45.

## Jouer

Ouvrez `dist.html` dans un navigateur, ou via GitHub Pages (workflow inclus : copie dist.html en index.html à chaque push sur main ; activez Pages avec « Source : GitHub Actions » dans les paramètres du repo).

## Structure

- `dist.html` : le jeu complet, autonome (HTML + JS + CSS, aucune dépendance).
- `assets.json` : manifeste d'illustrations (data-URI : 19 arts de cartes + 2 fonds de donjons), chargé automatiquement quand le jeu est servi en ligne.
- `combat-digest.mjs` : harnas d'équilibrage (3000 combats simulés, digest SHA256 de dormance).
- `smoke-ui.mjs` : suite de fumée UI du dist publié (110 checks).

## Documentation

Le dossier `docs/` contient l'inventaire de référence du jeu (catalogue v0.43.1, contenu inchangé en v0.45) :

- `docs/inventaire-cartes.md` : les 238 cartes, vue d'ensemble par type (naissances, familiales, solos, graines, monstres des donjons, divines) avec voies et signatures.
- `docs/inventaire-sorts.md` : les 653 entrées de sorts du catalogue : communs, sorts de race et de classe, sorts de lignée des 7 familles, Pouvoirs, coûts et mana par palier.
- `docs/arbres-evolution.md` : les arbres d'évolution en diagrammes : voies des naissances, 7 familles avec portes et graines, mini-lignées solos, webs des 5 donjons, familles divines.
- `docs/arbres-sorts.md` : la chronologie d'acquisition : qui apprend quoi, quand ; un sort de lignée par palier, le cumul de l'exemplaire à chaque évolution, et les exceptions.
- `docs/audit-sorts.md` : l'audit de cohérence des sorts : contrôles passés, constats et recommandations.

## Tests

```bash
node combat-digest.mjs dist.html 3000
node smoke-ui.mjs
```

Baseline v0.45 : digest `4628a7995abfebc6f9b3ef6a3f92b4ca06db9016b0b5882ae1189727c3a1106e`, 642 victoires / 3000 combats (identique depuis la v0.44.0 : changements UI uniquement).
