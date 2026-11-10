# Rapport de phase 5 : l'audit et la publication (v1.0)

## Critères d'acceptation exécutés

| Critère | Commande | Sortie réelle |
| --- | --- | --- |
| ACC-5-1 | `node tools/audit.mjs > /tmp/audit.md && diff /tmp/audit.md docs/historique/audit-sorts.md` | diff vide — l'audit est régénérable à l'identique depuis `data/` |
| ACC-5-2 | batterie E2E complète | `npm test` : `# pass 56 / # fail 0` ; `node build.mjs` : `build ok : dist.html (458930 caracteres, 18 fichiers de donnees)` ; `node --check` sur le bloc script : OK ; build déterministe (`cmp` silencieux) ; smoke `SCÉNARIOS : TOUT PASSE (121 checks)` ; migration v8 → v12 testée (4 tests de migration) ; scan EXI-MOD-4 : 0 occurrence de `http://`/`https://`/`XMLHttpRequest` |
| ACC-5-3 | `git diff --stat HEAD~1..HEAD` sur le dernier réglage | `data/grimoire.json | 2 +-` uniquement — deux réglages d'équilibrage (taux de jetons en zone, coût de Décharge Arcanique) commis en données seules, diff de code vide |

## Publication

- Entrée HISTORY « v1.0 : La refonte majeure » en tête du dist ; `VERSION: "1.0"` dans `data/engine.json`.
- `docs/historique/audit-sorts.md` régénéré par `node tools/audit.mjs` (grimoire, crans, fusion par biome).
- Plan `docs/design/plan-refonte-majeure.md` : les 25 tâches T0.1 → T5.2 sont cochées.

## Questions ouvertes pour le designer (récapitulatif)

- `fetch("assets.json")` local préexistant conservé (repli par sondage de fichiers) — EXI-MOD-4 à valider.
- Formule agi/int dérivée de l'attaque (proposition d'équilibrage) ; zone contre un boss seul ; mécanisme exact des seuils (`parCamp` vide) ; rang N des naissances non appliqué aux raretés ; écran des zones d'errance à dessiner.

VERDICT: PASS
