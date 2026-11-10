# Rapport de phase 3 : le mode RPG

## Critères d'acceptation exécutés

| Critère | Commande | Sortie réelle |
| --- | --- | --- |
| ACC-3-1 | `node --test --test-name-pattern "stat principale"` | `ok` : mage → ×int, guerrier → ×atk, assassin → ×agi ; profil Mage passé à `atk` en copie change la base (données, pas code) |
| ACC-3-2 | `node --test --test-name-pattern "soin"` | `ok` : soin plafonné à la vie max de la cible |
| ACC-3-3 | `node --test --test-name-pattern "zone"` | `ok` x2 : 3 contiguës sur 5, centre en auto (e1-e2-e3), choix 0/2 respectés, cible morte non remplacée, largeur du cran III = 3 en données |
| ACC-3-4 | `node --test --test-name-pattern "ordre"` | `ok` x2 : agi 20 agit avant agi 15 avant agi 10 malgré ATQ inversée ; égalité → ordre stable ; le tri ne lit plus l'attaque |
| ACC-3-5 | `node --test --test-name-pattern "seuil"` | `ok` : stun 25 %, 10 000 tirages seed 123, fréquence 0,2484 dans ±0,5 % ; seuil au palier L (0,25) bloque le stun |
| ACC-3-6 | `node --test tests/migration.test.js` | `ok` : v8 → v11, chaque exemplaire a agi/int finis ≥ 1, tokens et cartes conservés |
| ACC-1-5 rejoué | `node build.mjs && npm test` + smoke | `# pass 53 / # fail 0` ; `build ok : dist.html (452083 caracteres, 18 fichiers)` ; smoke `TOUT PASSE (121 checks)` ; `node --check` OK ; build déterministe |

## Notes d'exécution

- `data/cards.json` et `data/monsters.json` portent `agi` et `int` sur les 89 cartes et 153 monstres. Formule de dérivation (à affiner à l'équilibrage) : `agi = round(atk × 0,8)`, `int = round(atk × 0,6)` ; ratios en données (`engine.json.moteur.AGI_RATIO` / `INT_RATIO`). Les crans de race (+10/+20/+30 %) s'appliquent aussi à agi/int dans `makeUnit`.
- `engine.json` : `profils` (stat principale par classe ; **gardien → vie** reste une donnée, proposition ouverte EXI-P3-1) et `seuils.parPalier` [0, 0,05, 0,10, 0,15, 0,20, 0,25, 0,30] + `parCamp` vide.
- Moteur : `statOf(lanceur)` comme base des mults dans `castSpell` ; `pickZoneTargets(ligne, choix)` (3 contiguës, centre en auto, sans glissement) ; `beginRound` trie sur `agi` ; `seuilOf(cible)` joue les taux contre le seuil.
- `CURRENT_VERSION` = 11 ; migration v10→v11 calcule agi/int de chaque exemplaire (stat de base × bonus de niveau).

## Questions ouvertes pour le designer

- La formule agi/int dérivée de l'attaque est une proposition d'équilibrage (design : « répartition fine à l'équilibrage ») — à remplacer par les vraies valeurs par carte quand le design les fixe.
- Le comportement de la zone contre un boss seul (design 13.1-10) : actuellement la zone frappe le boss (seule cible vivante). À trancher.
- Le mécanisme exact des seuils (par palier retenu ici, `parCamp` laissé vide) : à valider.

VERDICT: PASS
