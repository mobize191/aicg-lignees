# AICG : Lignées

Jeu de cartes solo 100% navigateur : collection, donjons et lignées qui montent du Novice au Légendaire. Prototype v0.47 (le mode Tactique devient un vrai tour de RPG depuis la v0.46 : fenêtre d'action carte par carte, ciblage explicite).

**Jouer en ligne : https://mobize191.github.io/aicg-lignées/**

## Jouer

Ouvrez `dist.html` dans un navigateur, ou via GitHub Pages (workflow inclus : copie dist.html en index.html à chaque push sur main ; activez Pages avec « Source : GitHub Actions » dans les paramètres du repo).

## Structure

- `dist.html` : le jeu complet, autonome (HTML + JS + CSS, aucune dépendance).
- `assets.json` : manifeste d'illustrations (data-URI : 231 arts de cartes + 5 fonds de donjons, DreamShaper XL, ~7,8 Mo ASCII pur), chargé automatiquement quand le jeu est servi en ligne.
- `combat-digest.mjs` : harnas d'équilibrage (3000 combats simulés, digest SHA256 de dormance).
- `smoke-ui.mjs` : suite de fumée UI du dist publié (121 checks).
- `tools/` : les scripts de la campagne d'illustrations ComfyUI (extraction du catalogue, génération des prompts, batch API, intégration au manifeste, planches de contrôle).

## Documentation

Le dossier `docs/` est organisé par usage : commencer par `docs/00-SOMMAIRE.md` (la carte complète : où trouver quoi, où ranger quoi).

- `docs/prompt-lancement.md` : le prompt à copier au début de chaque session agent (contexte, règles d'or, chaîne de preuve).
- `docs/roadmap.md` : l'état du prototype version par version et ce qui reste à faire.
- `docs/regles-jeu.md` : les règles actées du jeu, du combat aux donjons.
- `docs/arbitrages.md` : le journal des décisions de design, datées et statuées (ACTÉ / PISTE / PROPOSÉ).
- `docs/tables/` : les tableaux de référence (cartes, sorts, monstres, monde), générés depuis `data/*.json` par `node tools/gen-tables.mjs` : à relancer puis commiter après chaque évolution des données.
- `docs/travail-local.md` : les prompts de travail local (corrections, validation IHM par captures, campagne ComfyUI).
- `docs/validation-ihm.md` : le protocole de validation IHM locale (scénarios avec captures d'écran).
- `docs/design/` : les designs normatifs (spec complète, arbres v16, refonte des sorts, inventaires du catalogue v3 : 238 cartes, 653 sorts).
- `docs/images/` : conventions graphiques et plans de campagne d'illustrations.
- `docs/historique/` : les rapports des chantiers passés (correctifs, phases 0 à 5 de la refonte, vérifications).

## Tests

```bash
node build.mjs && node --test && node smoke-ui.mjs
node combat-digest.mjs dist.html 3000
node tools/gen-tables.mjs   # si data/ a bougé
```

Baseline courante (migration d'arbitrages du 10/11/2026 : classe Invocateur retirée, Gardien-Mécanique Guerrier, Entrave ouverte Mage + Occultiste, sorts d'écolage communs renommés) : digest `7dfab0a295eaa1dab1f70e039b782e0ef06285fdd0fdf3e09d65304b966de5aa`, 476 victoires / 3000 combats, 0 exception, 0 marathon ; smoke 121 checks verts. La baisse de victoires (534 avant) vient des reclassifications de classe, à surveiller au recalibrage des caractéristiques. Historique des baselines dans `docs/roadmap.md`.
