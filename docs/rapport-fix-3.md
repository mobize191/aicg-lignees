# Mini-rapport T-FIX-3 : le glossaire dit la vérité du moteur

## Commandes exécutées et sorties réelles

1. `node build.mjs && grep -c "la plus agile" dist.html` → `1` (> 0 ; « l'agilité » aussi présent via HISTORY v1.0)
2. Occurrences de « de la plus forte attaque » hors bloc HISTORY dans `dist.html` → `0` (uniquement dans l'entrée HISTORY v0.46, non réécrite)
3. `node --test` → `# pass 60 / # fail 0`
4. `node smoke-ui.mjs dist.html` → `SCÉNARIOS : TOUT PASSE (121 checks)` ; `grep -c "art-src-btn" dist.html` → `5`

## Changements

- `src/ui.js`, section mécanique du glossaire : « de la plus forte attaque à la moins forte » → « de la plus agile à la moins agile » (le moteur trie sur `b.u.agi - a.u.agi` depuis la phase 3). Entrées HISTORY inchangées.

VERDICT: PASS
