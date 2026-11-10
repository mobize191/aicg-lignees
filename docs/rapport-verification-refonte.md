# Rapport de vérification indépendant : la refonte majeure v1.0

Vérifié le 10/11/2026 sur `main` (commit 57f95c9e), après le merge de la PR #1 (61da6b9f) et les deux commits d'en-tête v0.47.1 (605f3d14) et v0.47.2 (57f95c9e).

Méthode : clone du repo, exécution réelle de `node --test`, régénération par `node build.mjs`, diff octet par octet du dist committé contre le dist régénéré, puis inspection des branchements réels entre `src/engine/` et `src/ui.js` (quelles fonctions du moteur sont réellement appelées par l'UI et par le flux de sauvegarde).

## 1. Vérifié et tenu

| Vérification | Preuve exécutée | Résultat |
| --- | --- | --- |
| Batterie de tests | `node --test` | 56/56 passent |
| Build modulaire | `node build.mjs` | dist.html régénéré depuis src/ + data/, 18 fichiers de données |
| Validateur de données | `node src/validate.js` | exit 0 |
| Audit régénérable | `node tools/audit.mjs` | identique à docs/audit-sorts.md |
| Modulaire, données pilotant le moteur | `data/*.json` (écoles, grimoire à crans, fusion-map, arbres, zones, profils) | aucune valeur de design codée en dur relevée dans src/engine/ |
| État embarqué cohérent | `dist.html` committé | HISTORY v1.0 en tête, fusion Marées, écoles, arbres v17 présents dans les données |

La refonte est réellement en place côté données et moteur. Le ressenti « l'UI n'a pas changé » vient de deux causes : d'abord, la spec fait de l'habillage un non-goal (l'UI reste un bloc unique, les phases 0 à 3 changent le moteur et les valeurs, pas l'écran) ; ensuite, trois branchements réels manquent, détaillés ci-dessous.

## 2. Constats d'écart (avec preuves reproductibles)

### C1. Le dist committé n'est pas le dist régénéré, et le bouton de thème de v0.47.1 a été effacé

Preuve : `node build.mjs` produit 458 930 caractères ; le `dist.html` committé en fait 465 130. Les 6 200 caractères de différence sont exactement les lignes v0.47.2 (bouton `#art-src-btn`, `ART_MANIFESTS`, `switchArtSrc`, entrée HISTORY) : elles n'existent que dans `dist.html`, pas dans `src/`. Conséquence immédiate : le prochain rebuild effacera le switch d'images.

De plus, le bouton de thème clair/sombre de v0.47.1 (commit 605f3d14) vit `grep -c "theme-btn" dist.html` = 5 dans ce commit, mais = 0 sur main : v0.47.2 a regénéré le dist depuis src/ et a silencieusement effacé la feature de thème.

Décision du designer (10/11/2026) : le bouton de thème n'est PAS restauré. Sa disparition reste documentée ici pour l'historique ; seul le switch d'images 🖼️ est rapatrié dans la source.

Cause racine : v0.47.1 et v0.47.2 ont été édités directement dans `dist.html`. Depuis la refonte, `dist.html` est un artefact généré : toute édition manuelle sera perdue au prochain build.

### C2. La migration des sauvegardes n'est pas branchée dans le flux réel

Preuves (dans src/ui.js) :
- `migrate()` (défini dans src/engine/migrate.js, testé en isolation) n'est appelé nulle part ; `load()` appelle `restore()` directement.
- `restore()` rejette toute version hors `[1..8]` : `![1, 2, 3, 4, 5, 6, 7, 8].includes(data.version)` retourne false.
- `data/engine.json` porte `SAVE_VERSION: 8` alors que `CURRENT_VERSION: 12`.
- `snapshot()` ne persiste ni `grimoire` ni `zonesVisitees` (les champs introduits par la migration v12).

Conséquence : une vieille sauvegarde v8 se charge (version 8 acceptée) mais ne reçoit ni les voies des arbres (v9), ni le re-mappage des sorts fusionnés (v10), ni agi/int sur les exemplaires (v11), et le grimoire appris ne survivrait pas à un rechargement. EXI-SAVE-1 (« une sauvegarde v8 traverse toutes les migrations ») n'est tenue qu'en test unitaire, pas dans le jeu réel. Les tests 56/56 passent parce qu'ils appellent `E.migrate` directement.

### C3. Les zones d'errance ne sont pas branchées dans l'UI

Preuve : `runZone`, `learnCran`, `canCastLearned` (src/engine/progression.js) ne sont appelés nulle part dans `src/ui.js` ; aucune route, aucun bouton, aucun écran ne mentionne les zones d'errance. Le rapport de phase 4 le note (« les zones n'ont pas encore d'écran dédié côté UI ») tout en closant ACC-4-4 (« l'écran le montre ») par PASS. C'est le seul écart entre les VERDICT de phase et la spec.

### C4. Le glossaire contredit le moteur

Preuve : la section mécanique de l'écran décrit encore « les cartes des deux camps agissent une par une, de la plus forte attaque à la moins forte », alors que src/engine/combat.js trie maintenant sur `b.u.agi - a.u.agi`. L'entrée HISTORY v0.46 reste telle quelle (c'est de l'histoire), seule la description courante est fausse.

## 3. Tickets correctifs

Ordre d'exécution : T-FIX-1, T-FIX-2, T-FIX-3. T-ZONES-1 reste en draft : bloqué sur un design d'écran à écrire avec le designer. Un ticket = une préoccupation = un commit. Chaque ticket se prouve par ses commandes.

### T-FIX-1. Le switch d'images vit dans src/, chaque build le régénère

Problème : C1. Le bouton 🖼️ (switch d'images v0.47.2) et tout son code (`ART_MANIFESTS`, `artSrcKey`, `switchArtSrc`) n'existent que dans `dist.html` : le prochain rebuild les effacera.

Action :
- Rapatrier la feature côté source : le markup du bouton dans `src/shell.html` (header), le CSS (`#art-src-btn`), le JS (`ART_MANIFESTS`, `ART_SRC_LABEL`, `artSrcKey`, `switchArtSrc`, le listener) et l'entrée HISTORY v0.47.2 dans `src/ui.js`, en conservant le comportement à l'identique (clé localStorage `fondations-art-src`, fichiers `assets.json` / `assets-wai.json`, aucune valeur de design ne quitte les données).
- Regénérer : `node build.mjs`.

Critères (commandes qui prouvent) :
1. `node build.mjs && grep -c "art-src-btn" dist.html` > 0 (le bouton survit au rebuild)
2. `node build.mjs && md5sum dist.html && node build.mjs && md5sum dist.html` : deux builds identiques
3. `node --test` : 56 passes + aucune régression
4. Le dist committé après le ticket est le dist régénéré : plus jamais d'écart entre rebuild et commit.

Interdits : ne pas modifier le comportement du switch d'images (localStorage, manifestes, re-render) ; ne pas éditer `dist.html` à la main ; ne pas restaurer le bouton de thème (décision du designer).

### T-FIX-2. La migration v8 -> v12 branchée dans le flux réel

Problème : C2. `migrate()` est du code mort, `restore()` bloque les versions 9 à 12, la sauvegarde ne persiste pas les nouveaux champs.

Action :
- `data/engine.json` : `SAVE_VERSION: 12` (les deux versions du fichier doivent être égales ; ajout éventuel d'un test d'invariant `SAVE_VERSION === CURRENT_VERSION`).
- `src/ui.js` : `restore()` accepte les versions 1 à 12 ; `load()` applique `migrate(data)` avant toute restauration (une sauvegarde v8 traverse v9 -> v12 au chargement réel) ; `snapshot()` persiste `store.grimoire` et `store.zonesVisitees`, `restore()` les relit.
- Nouveau test `tests/migration-flux.test.js` qui vérifie le flux réel, pas la fonction isolée : (a) la fixture v8 traversée par `E.migrate` ressort en version 12 avec voies posées, sorts re-mappés, agi/int présents, grimoire et zonesVisitees initialisés ; (b) assertions structurelles sur la source : `src/ui.js` contient l'appel à `migrate(`, `restore` accepte `12`, `snapshot()` contient `grimoire` et `zonesVisitees` ; `data/engine.json` a SAVE_VERSION = 12.
- Scénario smoke local (Playwright, comme le rapport-validation v0.46.1) : injecter la fixture v8 dans localStorage, charger le dist, laisser le jeu sauvegarder, relire la sauvegarde : `JSON.parse(localStorage['fondations-cards-v1']).version === 12`.

Critères : `node --test` tout vert (56 + nouveaux) ; le scénario smoke passe sur desktop et mobile ; une sauvegarde déjà en version 12 se recharge sans être rejetée (test avec fixture v12).

Interdits : ne pas réécrire les migrations (elles sont bonnes) ; ne pas toucher au format des champs existants ; aucune perte de données d'une v8 réelle (cartes, niveaux, éclats, jetons).

### T-FIX-3. Le glossaire dit la vérité du moteur

Problème : C4. L'ordre du tour est décrit sur l'attaque, le moteur trie sur l'agilité.

Action : dans `src/ui.js`, mettre à jour la description courante de l'ordre du tour (section mécanique du glossaire et tout texte d'écran actif décrivant l'ordre). Les entrées HISTORY passées ne se réécrivent pas.

Critères : `node build.mjs && grep -c "l'agilité" dist.html` > 0 ; la phrase « de la plus forte attaque à la moins forte » n'apparaît plus dans les textes courants (uniquement dans HISTORY) ; `node --test` vert.

### T-ZONES-1 (draft, ne pas exécuter). L'écran des zones d'errance

ACC-4-4 initial non tenu : l'écran n'existe pas. Blocage : le design de l'écran (où il vit dans la nav, cadence zone/donjon/zone, rendu des récoltes et du grimoire) doit être écrit et validé par le designer avant toute ligne de code. Le moteur (`runZone`, `learnCran`, `canCastLearned`) et les données (`data/zones.json`) sont prêts et testés : l'écran s'y branchera sans nouveau moteur.

## 4. Règles réaffirmées

1. `dist.html` est un artefact généré par `node build.mjs`. Il ne s'édite jamais à la main ; une feature qui n'existe que dans le dist n'existe pas.
2. Le bouton 🖼️ (switch d'images DreamShaper XL / WAI-Illustrious) est une feature en production : chaque ticket qui rebuild le dist doit prouver qu'il survit (`grep -c "art-src-btn" dist.html` > 0). Le bouton de thème de v0.47.1 n'est pas restauré (décision du designer, voir C1).
3. Un VERDICT de phase ne se rend que si tous les ACC de la phase sont tenus, y compris les vérifications visuelles ; une question ouverte sur un ACC non tenu vaut FAIL, pas PASS.
4. Une preuve qui teste la fonction isolée ne prouve pas le branchement : le critère doit exercer le flux réel (chargement de sauvegarde, appel depuis l'UI), sinon le vert des tests cache du code mort.
