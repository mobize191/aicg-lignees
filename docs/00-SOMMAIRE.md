# Sommaire de la documentation

> Principe du projet : **rien ne vit dans le jeu si ce n'est pas documenté**. Les valeurs chiffrées vivent dans `data/*.json` (source de vérité unique), les tableaux de référence sont générés depuis elles, et chaque décision de design vit dans le journal des arbitrages.

## Pour commencer

- `AGENT.md` (à la racine du repo) : le guide d'entrée pour agents — règles d'or, chaîne de preuve, discipline.
- `CHANGELOG.md` (à la racine du repo) : l'historique des versions du jeu.
- `docs/prompt-lancement.md` : le prompt à copier au début de chaque session agent (contexte, règles d'or, discipline).
- `docs/roadmap.md` : état du jeu, historique des versions, reste à faire dans l'ordre.
- `docs/00-SOMMAIRE.md` : cette carte (où trouver quoi, où ranger quoi).

## Référence du jeu (mise à jour à chaque évolution)

- `docs/regles-jeu.md` : les règles actées, du combat aux donjons, avec le design cible (maquettes) séparé de l'état actuel.
- `docs/arbitrages.md` : le journal des décisions, avec statut (`ACTÉ` / `PISTE` / `PROPOSÉ`) et date. On ne contredit jamais un arbitrage ACTÉ : on propose une révision datée.
- `docs/tables/` : tableaux de référence **générés** par `node tools/gen-tables.mjs`, à relancer puis commiter après chaque changement de `data/` :
  - `tables/cartes.md` : les cartes jouables par classe, familles de lignée, évolutions.
  - `tables/sorts.md` : les six catégories de sorts, crans, écoles, fusions de monstres.
  - `tables/monstres.md` : le bestiaire par donjon, lignées de monstres.
  - `tables/monde.md` : constantes du moteur, donjons, difficultés, mods, mots-clés, zones, arbres d'éveil, synergies.

## Chantiers et protocoles

- `docs/validation-ihm.md` : protocole de validation locale avec captures d'écran.
- `docs/prompt-maj-combat-v2.md` : le prompt de lancement de la mise à jour UI du combat (ciblage interactif, pied de stats, fiche plein cadre).
- `docs/travail-local.md` : prompts spécialisés prêts à copier (corrections terrain, validation navigateur, campagne d'illustrations).
- `docs/design/` : les designs courants : spec complète (`spec-design.md`), arbres d'évolution et sorts actuels (`arbres-evolution.md`, `arbres-sorts.md`), familles et races v3 (`familles-races-v3.md`), guide de l'errance top-down (`errance-topdown.md`). Les specs et plans des chantiers clos sont archivés dans `docs/historique/`.
- `docs/images/` : conventions graphiques, charte graphique v2 (proposée) et plans de campagne d'illustrations.
- `docs/campagne-planches/`, `docs/captures-validation/` : planches de contrôle et captures.

## Archives

- `docs/historique/` : la mémoire des chantiers clos : rapports (correctifs, phases 0 à 5 de la refonte, vérifications), prompts de chantiers clos, et specs et plans fusionnés des grands chantiers (refonte majeure, grand chantier arbres + sorts, design des arbres v17, refonte des sorts v2, inventaire du catalogue v0.43). Rien à y lire pour coder : l'état courant vit dans les sections ci-dessus.

## Où ranger quoi (le guide)

- Une nouvelle règle du jeu → `docs/regles-jeu.md` (et dans `data/` si elle est chiffrée).
- Une décision, un arbitrage, une question tranchée → `docs/arbitrages.md` avec date et statut.
- Une nouvelle carte, un monstre, un sort, une constante → le bon `data/*.json`, puis `node tools/gen-tables.mjs`, puis commit des tableaux.
- Un rapport de chantier terminé → `docs/historique/`.
- Une question ouverte de design → `docs/arbitrages.md`, section Pistes (jamais dans le code, jamais perdue dans une conversation).
