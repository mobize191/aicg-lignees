# Rapport de phase 1 : les arbres de race (v17)

## Critères d'acceptation exécutés

| Critère | Commande | Sortie réelle |
| --- | --- | --- |
| ACC-1-1 | `node --test tests/data.test.js` + test arbres | `ok` : 100 % des références de `trees.json` résolues (34 éveils), aucun doublon de nom de carte |
| ACC-1-2 | `node --test --test-name-pattern "Ange"` | `ok` : éveil n13 → p1 « Ange Éveillé », effet `remplace`, `disparait: p2` (Ange Gardien) ; la mauvaise volonté est une porte de l'Éveillé ; « Ange Éveillé » et « Éveillé du Seuil » coexistent |
| ACC-1-3 | `node --test --test-name-pattern "race"` | `ok` : crans 10/20/30 appliqués dans `makeUnit` depuis `trees.json` ; cran 10 → 12 en copie change l'ATQ proportionnellement |
| ACC-1-4 | `node --test tests/migration.test.js` | `ok` : v8 → v9, 6/6 exemplaires conservés, voie renseignée depuis l'arbre |
| ACC-1-5 | `node build.mjs && npm test` + smoke | `# pass 37 / # fail 0` ; `build ok : dist.html (415736 caracteres, 15 fichiers)` ; smoke `TOUT PASSE (121 checks)` ; build déterministe |

## Notes d'exécution

- `trees.json` : 4 races (humaine rang 0, monstre cran 10 %, mystique 20 %, divine 30 %), 34 éveils N → C issus des choix existants, plus l'éveil v17 de l'Ange (n13 → p1, `remplace`, `disparait: p2`, portes coloration / voie céleste / mauvaise volonté).
- Nouvelles cartes : `p1` Ange Éveillé (UC), `p2` Ange Gardien (C, `archived: true`, la † v16 — gardée en données pour que les vieilles sauvegardes restent valides), `p3` Pousse des Sèves, `p4` Fidèle du Jour (communes déléguées v17, avec leur voie).
- `zones.json` (squelette) : 5 zones d'errance (une par biome), `drops.N = 0.02` (taux très bas), `poolN` = les 15 naissances ; `DEBUT_JEU_N = 2` dans `engine.json` (les 1 à 2 N du début du jeu).
- `SAVE_VERSION` courant : 9 (`CURRENT_VERSION` dans `data/engine.json`) ; la chaîne v8 → v12 reste testée à chaque saut.
- Les crans de race s'appliquent désormais réellement aux stats en combat (`makeUnit`), conformément à EXI-P1-1 — c'est le changement de comportement acté par la phase 1 (les valeurs restent en données).

## Questions ouvertes pour le designer

- Le libellé exact du dédoublonnage « Ange Éveillé » / « Éveillé du Seuil » (design 10.1-5) : les deux noms coexistent tels quels en données ; à valider.
- `Pousse des Sèves` n'est pas rattachée à `family: bosquet` (la chaîne de lignage existante serait déplacée) : elle porte seulement sa voie. À trancher si elle doit devenir la tête de la famille du Bosquet.
- Le rang N des 15 naissances (v13/v16 : passer les naissances sous C) n'est pas appliqué aux raretés existantes — conservative, à activer quand le design le dira pour le dist.

VERDICT: PASS
