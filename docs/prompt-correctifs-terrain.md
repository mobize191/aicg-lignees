# Prompt — correctifs terrain : CSS mobile + fluidité de l'errance (couloir 1)

> À lancer tel quel au couloir 1. Sources de vérité : `docs/design/errance-topdown.md` (errance), `docs/arbitrages.md` (entrée « retours terrain mobile » du 11/11 soir, ACTÉ), `data/*.json`. Commits, messages et consignes en français.

## Contexte

Le bloc visuel v1.27 est livré et conforme (boucle v2, économie v2, hub-ville, Terres Sauvages, errance zone Marées). Les tests téléphone de Marc-Olivier ont remonté deux bugs, diagnostiqués et consignés dans arbitrages. Ce chantier les corrige **dans cet ordre, en deux commits distincts** (une tâche = un commit).

## Correctif 1 — CSS rendu en texte brut sur mobile (bloquant, prioritaire)

**Cause diagnostiquée** : dans `src/shell.html` (recopié tel quel dans `dist.html` par le build), le bloc CSS des écrans récents — `.sort-badge.b-objet`, `.shop-row`, `.recomp-list`, `.recomp-row`, `.chip.r-C` à `.chip.r-M`, `.equip-slots`, `.row-lab`, `.fx-video-overlay`, `.fx-video` — est collé **après la balise `</html>`**, hors de tout `<style>`. Le navigateur l'affiche comme du texte en bas de page (c'est exactement ce que montre la capture de Marc-Olivier).

**À faire** :
1. Déplacer ce bloc tel quel dans l'élément `<style>` du `<head>` de `src/shell.html` (avant `</style>`), supprimer la copie résiduelle après `</html>`. Ne rien changer au CSS lui-même.
2. Régénérer `dist.html` (build habituel).
3. Vérifier : plus aucun contenu après `</html>` ni `</body>` dans `src/shell.html` et `dist.html` ; tout le CSS vit dans des éléments `<style>` ; les écrans Récompenses, Boutique, Inventaire/équipement et les FX v0.48 ont bien leurs styles appliqués.

## Correctif 2 — fluidité de l'errance (conformité au guide `docs/design/errance-topdown.md`)

**Le socle est CONFORME et ne doit pas bouger** : A* 8 directions + heuristique octile + anti coupe-de-corner, string pulling, rencontres au pas dans les hautes herbes avec grâce (2 pas, autel +5), jarres/autel, carte déterministe LCG seed, persistance looted/broken, `dt` déjà borné `Math.min(0.05, …)` dans la boucle, `touch-action: none` déjà en place.

**Ce qui manque (cause du ressenti raide), à implémenter en conformité littérale du guide** :
1. **§5 Pilotage inertiel** (`src/errance.js`, `stepErrance`) : remplacer l'avance en ligne droite à vitesse constante par un vrai pilotage — vecteur vitesse persistant, virage limité (`turn = maxV*5*dt`), freinage progressif à l'approche du waypoint (`want = min(maxV, d/.22)`), test « waypoint dépassé » par produit scalaire (aucune orbite), collision par axe via `solidAt`, inclinaison (tilt) proportionnelle au virage.
2. **§6 Caméra** (`src/ui.js`, `renderErrance`) : remplacer le lerp à facteur fixe `* 0.12` par un lerp indépendant du framerate (`Math.min(1, k*dt)`) ; look-ahead de 0,12 s sur la vitesse du héros ; zoom 1,05 → 1,7 selon la vitesse ; canvas en résolution native avec `devicePixelRatio` plafonné à 2 (rendu net sur mobile).
3. **§3 Pré-rendu du décor** (`src/ui.js`, `draw`) : peindre le décor une fois sur un canvas offscreen (et à chaque redimensionnement) puis un seul `drawImage` par frame — fini le `fillRect` tuile par tuile à chaque frame.
4. **Vérifier aussi** : §4 (mémo A* `lastTx`/`lastTy` au pointermove) et §10 (pointerup écouté sur `window` pour iOS) — appliquer si le guide les demande et qu'ils manquent.

Ne pas toucher : rencontres, grâce, autels/jarres, persistance, données de zones, maths de combat.

## Règles de chantier

- Une tâche = un commit en français ; re-fetch de chaque fichier avant édition (d'autres couloirs poussent aussi) ; vérifier l'unicité des ancres avant tout remplacement.
- `data/*.json` source de vérité ; toute décision vit dans `docs/arbitrages.md`.
- Aucune maths de combat touchée : digest **attendu inchangé** `f72106ff…` 1379/3000 (pack 3000) et baseline N = 10 000 `3f9fe198…` 4558/10000.
- Preuves à fournir : build déterministe, **≥ 139 tests verts** (ajouter des tests si le pilotage inertiel s'y prête : waypoint dépassé, freinage, collision par axe), **≥ 269 smoke checks**, digest inchangé.
- Clôture : consigner une entrée **MESURE** en tête de `docs/arbitrages.md` (même format que « MESURE — bloc visuel H1/H2/H3 livré »), marquer les deux puces du point 1 de la roadmap (correctifs terrain) comme FAITES avec preuves, régénérer les tables si concernées.

## Critères d'acceptation

- **Correctif 1** : sur téléphone, plus aucun caractère CSS visible nulle part ; les styles des écrans récents s'appliquent.
- **Correctif 2** : le héros accélère, tourne et freine avec inertie ; jamais d'orbite autour d'un point ; la caméra suit sans à-coup quel que soit le framerate ; rendu net sur écran haute densité ; la carte ne se redessine plus tuile par tuile à chaque frame.
- Validation finale par Marc-Olivier sur téléphone (il rejoue et tranche).
