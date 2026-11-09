# AICG : Lignées

Jeu de cartes solo 100% navigateur : collection, donjons et lignées qui montent du Novice au Légendaire. Prototype v0.44.1.

## Jouer

Ouvrez `dist.html` dans un navigateur, ou via GitHub Pages (workflow inclus : copie dist.html en index.html à chaque push sur main ; activez Pages avec « Source : GitHub Actions » dans les paramètres du repo).

## Structure

- `dist.html` : le jeu complet, autonome (HTML + JS + CSS, aucune dépendance).
- `assets.json` : manifeste d'illustrations (data-URI : 19 arts de cartes + 2 fonds de donjons), chargé automatiquement quand le jeu est servi en ligne.
- `combat-digest.mjs` : harnas d'équilibrage (3000 combats simulés, digest SHA256 de dormance).
- `smoke-ui.mjs` : suite de fumée UI du dist publié (104 checks).

## Tests

```bash
node combat-digest.mjs dist.html 3000
node smoke-ui.mjs
```

Baseline v0.44.1 : digest `4628a7995abfebc6f9b3ef6a3f92b4ca06db9016b0b5882ae1189727c3a1106e`, 642 victoires / 3000 combats (identique depuis la v0.44.0 : changements UI uniquement).
