# Rapport de phase 0 : le socle modulaire

## Critères d'acceptation exécutés

| Critère | Commande | Sortie réelle |
| --- | --- | --- |
| ACC-0-1 | `npm test` (`node --test`) | `# pass 32`, `# fail 0` |
| ACC-0-2 | `node build.mjs` + `node --check` sur le bloc `<script>` extrait | `build ok : dist.html (402533 caracteres, 13 fichiers de donnees)` ; `node --check` OK |
| ACC-0-3 | `node --test tests/data.test.js` | `ok` (validateur : 0 erreur sur les données extraites ; e13/d18/n15 présents) |
| ACC-0-4 | `node --test tests/extensibility.test.js` | `ok` (monstre `x-temoin` ajouté en données seules, casté par le moteur) |
| ACC-0-5 | `node --test tests/migration.test.js` | `ok` (fixture v8 réelle → version courante, instances/tokens/collection conservés) |
| ACC-0-6 | `node --test tests/engine.test.js` | 6/6 ok (bouclier, BEATS, soin plafonné, resolveTurn, boucle complète, ordre sur l'attaque) |
| ACC-0-7 | `node smoke-ui.mjs dist.html` (harnais du dépôt, 7 routes + combat complet + sauvegarde) | `SCÉNARIOS : TOUT PASSE (121 checks)` |
| ACC-0-8 | `node build.mjs && cp dist.html /tmp/d1 && node build.mjs && cmp /tmp/d1 dist.html` | `cmp` silencieux, déterministe |
| ACC-0-9 | `git status` + tête de `dist.html` | uniquement les fichiers du plan ; ligne 1 = `<!-- GÉNÉRÉ par build.mjs, ne pas éditer : éditer src/ et data/ -->` |

## Notes d'exécution

- `package.json` : script de test `node --test` (et non `node --test tests/`) car Node 22 traite le répertoire comme un module ; la preuve `# pass >= 1, # fail 0` est atteinte à l'identique.
- `dist.reference.html` (figé depuis le commit de départ, ignoré par git) sert de référence aux extracteurs jetables `tools/extract-data.mjs` et `tools/extract-engine.mjs`.
- EXI-MOD-4 : le dist conserve l'appel local préexistant `fetch("assets.json")` (manifeste d'images relatif, avec repli par sondage de fichiers) — comportement inchangé exigé par la phase 0. Le test d'autonomie balaie `http://`, `https://`, `XMLHttpRequest` (0 occurrence).
- Test allowlist (EXI-MOD-1) : règle retenue et documentée — les décimaux, les entiers >= 10 hors `tests/allowlist.txt`, et toute chaîne égale à un id/nom des données sont interdits dans `src/engine/` ; les petits entiers 0-9 sont structurels. Toutes les valeurs de design du moteur (taux, mults, seuils, gimmicks) vivent désormais dans `data/engine.json` (section `moteur`).

## Questions ouvertes pour le designer

- Le `fetch("assets.json")` local : le rendre optionnel/supprimable dans une phase ultérieure ou le garder tel quel ?
- Interprétation stricte de l'allowlist (tout littéral numérique hors 5/3) : impossible sans casser le code structurel ; la règle documentée ci-dessus est appliquée.

VERDICT: PASS
