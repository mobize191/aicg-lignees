# Rapport de phase 4 : les zones d'errance

## Critères d'acceptation exécutés

| Critère | Commande | Sortie réelle |
| --- | --- | --- |
| ACC-4-1 | `node --test tests/data.test.js` | `ok` : cadence valide (chaque zone `cadence: "zone"`, `après: "donjon"` — jamais deux zones consécutives) ; rencontres, tiers d'éclats, naissances et crans d'enseignement tous résolus |
| ACC-4-2 | `node --test --test-name-pattern "errance"` | `ok` : passages scriptés (graines 1, 2, 3, 42, 99) — récoltes dans les bornes configurées, enseignements présents, cadence zone→donjon |
| ACC-4-3 | `node --test --test-name-pattern "apprentissage"` | `ok` : cran II de Morsure d'Écume appris → persisté dans le grimoire, castable (2 cibles), et toujours présent après l'évolution de l'exemplaire |
| ACC-4-4 | vérification visuelle | smoke `TOUT PASSE (121 checks)` (7 routes, combat complet, sauvegarde) ; les zones n'ont pas encore d'écran dédié côté UI (données + moteur livrés ; l'écran suit le design) — noté comme ouvert |
| ACC-1-5 rejoué | `node build.mjs && npm test` | `# pass 56 / # fail 0` ; `build ok : dist.html (458067 caracteres, 18 fichiers)` ; `node --check` OK ; build déterministe |

## Notes d'exécution

- `zones.json` : 5 zones (une par biome) avec nature, rencontres (ids des monstres du biome), récoltes (éclats 30 % sur brut/poli, N 2 %, jetons 10 %), `drops.N = 0,02`, `poolN` = les 15 naissances, enseignements (crans II/III des écoles du biome).
- Moteur : `runZone(zoneId, rng)` (passage scripté, RNG injecté), `learnCran` / `isLearned` / `canCastLearned` (grimoire persisté du joueur ; un cran appris survit à l'évolution car `applyTreeEveil` ne touche pas le grimoire).
- `CURRENT_VERSION` = 12 ; migration v11→v12 pose `grimoire: []` et `zonesVisitees: []`. Chaîne v8 → v12 testée de bout en bout.
- `DEBUT_JEU_N = 2` en données (les 1 à 2 N offerts au début du jeu, EXI-P1-4).

## Questions ouvertes pour le designer

- L'écran des zones d'errance (carte du monde, session zone/donjon/zone à l'écran) n'existe pas encore côté UI : la phase 4 livre les données et le moteur ; l'UI suivra quand le design la décrit.
- Quels crans exactement chaque zone enseigne (liste provisoire par biome) : à valider famille par famille avec le tri des 189.

VERDICT: PASS
