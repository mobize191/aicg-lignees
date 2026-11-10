# Rapport de phase 2 : le rework des sorts (v2.3)

## Critères d'acceptation exécutés

| Critère | Commande | Sortie réelle |
| --- | --- | --- |
| ACC-2-1 | `node --test tests/data.test.js` | `ok` : chaque sort référence une école existante ; 4 marches ou `vide: true` motivé ; coûts 3/4/5/6★ strictement croissants ; taux décroissants quand la largeur monte |
| ACC-2-2 | `node --test --test-name-pattern "Morsure d'Écume"` | `ok` x2 : largeurs 1/2/3/5, mults ×1.5/1.8/2.2/2.6, coûts 3/4/5/6★ ; test en copie modifiée (mult 9.9) voit le résultat suivre |
| ACC-2-3 | `node --test --test-name-pattern "Chant de Sirène"` | `ok` : stun 25/20/15/10 % sur 1/2/3/5 ; le seuil de la cible bloque le stun |
| ACC-2-4 | `node --test --test-name-pattern "fusion"` | `ok` : Marées 30/30 (7 uniques + 23 fondues) ; biome non trié (Forge) garde sa signature legacy |
| ACC-2-5 | `node --test --test-name-pattern "école"` | `ok` : guerrier et assassin castent la même école ; la voie en données ouvre l'école |
| ACC-2-6 | `node --test tests/extensibility.test.js` | `ok` : école fictive « l'Éclipse » + « Trait d'Éclipse » en données seules, casté sur les 4 largeurs sans toucher `src/` |
| ACC-2-7 | `node --test tests/migration.test.js` | `ok` : v8 → v9 → v10, sorts re-mappés (Jet d'Écume → morsure-decume I, Marée Noire → unique), aucun perdu |
| ACC-1-5 rejoué | `node build.mjs && npm test` + smoke | `# pass 45 / # fail 0` ; `build ok : dist.html (443744 caracteres, 18 fichiers)` ; smoke `TOUT PASSE (121 checks)` ; build déterministe |

## Notes d'exécution

- `schools.json` : les 8 écoles (la Lame, le Baume, le Rempart, l'Appel, l'Entrave, le Mauvais Œil, la Ferveur, la Ruse) avec les profils/voies qui les ouvrent. `keywords.json` : brûlure, corrosion, poison, sève rongeuse.
- `grimoire.json` restructuré : `communs` (2), `race` (4), `entrees` (5 anciens sorts de classe), `lignee` (42 = 7 familles × 6 paliers, référencés depuis `lineage-spells.json`), `ecole` (6 sorts à crans I-IV), `uniques` (7). Les alias legacy (`COMMON_SPELLS`, `RACE_SPELLS`, `CLASS_SPELLS`) sont reconstruits dans `src/data.js` : le dist se comporte comme avant.
- `fusion-map.json` : table 14.2 à l'identique (30 signatures des Marées) ; `forge`, `bosquet`, `crypte`, `zenith`, `divin` marqués `trie: false` (chemin legacy).
- Moteur : `castSpell(data, spellId, cran, contexte)` résout largeur/coût/mult/taux depuis les données ; `resolveSignature(monstreId)` lit la fusion-map ; `openSchools(voie)` / `canCast` remplacent le verrou de classe ; `sortsDeDepart` (commun + race à la naissance).
- `CURRENT_VERSION` = 10. La chaîne v8 → v12 testée à chaque saut.

## Questions ouvertes pour le designer

- Les entrées d'école (Brise-Garde, Œil du Malheur, Onde Consacrée) n'ont pour l'instant que leur cran II de renseigné via la fusion ; leurs fiches complètes à 4 crans sont attendues « à la grosse mise à jour » (design 14.2) — à câbler quand le design les détaille.
- La séparation mono/multi des lignes de sorts (notée v2.3, section 12) reste un non-goal de cette mise à jour.

VERDICT: PASS
