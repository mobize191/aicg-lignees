# Mini-rapport T-FIX-1 : le switch d'images vit dans src/

## Commandes exécutées et sorties réelles

1. `node build.mjs && grep -c "art-src-btn" dist.html` → `build ok : dist.html (461153 caracteres, 18 fichiers de donnees)` puis `5` (> 0 : le bouton survit au rebuild)
2. `node build.mjs && md5sum dist.html && node build.mjs && md5sum dist.html` → `a1ad2fdb9b51ab1866fe5af6819ef282` deux fois (builds identiques)
3. `node --test` → `# pass 56 / # fail 0` (aucune régression)
4. Après commit du dist : `node build.mjs && git status --short dist.html` → `0` modification (dist committé = dist régénéré, plus jamais d'écart)

Compléments : `node --check` sur le bloc script du dist → exit 0 ; `node smoke-ui.mjs dist.html` → `SCÉNARIOS : TOUT PASSE (121 checks)`.

## Changements

- `src/shell.html` : CSS `#art-src-btn` (bloc v0.47.2) + markup du bouton 🖼️ dans le header.
- `src/ui.js` : `ART_MANIFESTS` / `ART_SRC_LABEL` / `artSrcKey` / `switchArtSrc`, listener du bouton dans `start()`, `initAssets()` lit `ART_MANIFESTS[artSrcKey()]` (clé localStorage `fondations-art-src` inchangée), entrée HISTORY v0.47.2 en tête.
- Comportement du switch inchangé ; bouton de thème v0.47.1 non restauré (décision designer).

VERDICT: PASS
