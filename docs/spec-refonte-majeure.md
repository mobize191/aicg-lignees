---
name: spec-refonte-majeure
title: "Spec : la refonte majeure, la modularité et les critères d'acceptation (v1)"
type: text/markdown
---

# Spec : la refonte majeure, la modularité et les critères d'acceptation (v1)

Cette spec couvre l'ensemble des changements actés : **les arbres de race** (éveils, voies, drops), **le rework des sorts** (écoles, grimoire à crans, fusion des 189), **le mode RPG** (les nouvelles caractéristiques : agilité et intelligence, la base des mults, les ciblages, l'ordre du tour, les seuils) et **les zones d'errance** (cadence, récoltes, apprentissage). Elle dit **quoi** et **comment on prouve que c'est fait** ; le **comment détaillé** est dans le plan (`docs/plan-refonte-majeure.md`).

**Le point de vigilance du projet (ta demande)** : les arbres de sorts et de personnages **risquent encore de bouger**. La structure doit être **modulaire** : les arbres, les écoles, les sorts et leurs crans sont des **données** (JSON), jamais du code ; le moteur lit les données, il ne les connaît pas. Changer un arbre ou déplacer un cran = éditer un fichier de données, relancer les tests et le build. Aucune exigence de cette spec ne demande de coder en dur une valeur de design.

## 1. Sources normatives et ordre de lecture

| Le document | Son rôle | Priorité |
| --- | --- | --- |
| `docs/refonte-sorts.md` (v2.3) | le design cible des sorts : écoles, crans I-IV, largeurs, fusion des Marées | normatif pour les sorts |
| `docs/design-arbres.md` (v17) | le design cible des races : éveils, voies, drops N, communes déléguées | normatif pour les arbres |
| `docs/inventaire-sorts.md` | l'état embarqué : les 189 signatures, les textes de référence | normatif pour l'existant |
| `docs/arbres-sorts.md`, `docs/audit-sorts.md` | l'état embarqué des arbres et de l'audit | référence |
| cette spec (`docs/spec-refonte-majeure.md`) | les exigences et les critères d'acceptation | normatif pour la structure |
| `docs/plan-refonte-majeure.md` | les tâches, l'ordre, le code de départ | exécution |

En cas de contradiction entre la spec et un document de design : **le design le plus récent gagne** (le canvas poussé le plus récemment sur `main`), et le design reste la source des valeurs. La spec ne réécrit jamais une valeur de design ; elle exige qu'elle vive dans les données.

**Constat de mobilité assumé** : le tri des 189 est en cours (les Marées sont fondues, la Forge, le Bosquet, la Crypte, le Zénith, les naissances, les solos et les divines attendent). La spec ne verrouille rien là-dessus : le moteur doit marcher avec un tri partiel, chaque biome trié passe le validateur, les biomes non triés restent sur leur chemin actuel.

## 2. L'état actuel (le point de départ)

`dist.html` = **un seul fichier**, 373 777 caractères, 6 617 lignes, un seul bloc `<script>` (lignes 884 à 6614), environ 223 fonctions de premier niveau. Toutes les données sont inline :

| L'ancrage (ligne au moment de la spec) | Son contenu |
| --- | --- |
| 897-950 | CLASSES, ELEMENTS, SYNERGIES, MONSTER_MANA |
| 952 | RAW (les monstres, par biome) |
| 1113-1137 | COMMON_SPELLS, RACE_SPELLS, CLASS_SPELLS |
| 1163 | MONSTERS (dérivé de RAW) |
| 1185-1254 | FAMILY_SPELLS, FAMILY_MANA, SOLO_MANA |
| 1256 | CATALOG (les cartes) |
| 1369-1379 | FAMILIES, SOLO_STEPS |
| 1470-1509 | constants moteur, CLASSE_MODS, BEATS, RACES, RACE_MOD, CROSS |
| 1638-2319 | le moteur : applyDamage, castSummon, applySupport, resolveTurn |
| 2342-2366 | DIFFICULTIES, RUN_MODS, DUNGEONS |
| 2692-2732 | SAVE_VERSION 8, SAVE_KEY, EVO_COST, GEM_TIERS |
| 3299-3301 | EVO_TYPES, EVO_CHOICES |
| 4336-4610 | TEAM_MAX, FAM_ORDER, MONSTER_FAMS |
| 5031 | FX_DOC |
| 6317 | RARITIES |

Autres faits d'état : sauvegarde `localStorage` (clé `fondations-cards-v1`, `SAVE_VERSION` 8), routes par hash (`#accueil`, `#equipe`, `#collection`, `#forge`, `#donjons`, `#combat`, `#glossaire`), l'ordre du tour se calcule aujourd'hui sur l'attaque, les ciblages actuels ne connaissent pas la zone de 3.

**Règle pour les ancres** : les numéros de ligne dérivent dès le premier commit ; ils servent d'orientation. L'extraction se fait sur des **motifs** (le nom des déclarations), jamais sur des numéros de ligne.

## 3. L'architecture cible

```
/
├─ dist.html                  GÉNÉRÉ (interdit de l'éditer à la main)
├─ build.mjs                  build node pur : src/ + data/ → dist.html
├─ package.json               {"scripts": {"test": "node --test", "build": "node build.mjs"}}
├─ data/
│  ├─ engine.json             profils, stats principales, seuils, mana, échelles de coûts
│  ├─ cards.json              familiales, naissances, solos, divines (+ agilité, intelligence)
│  ├─ monsters.json           les monstres (ex-RAW), par biome
│  ├─ families.json           les familles, le mana par palier
│  ├─ lineage-spells.json     les sorts de lignée (6 par famille, C à L)
│  ├─ schools.json            les 8 écoles, les profils/voies qui les ouvrent
│  ├─ grimoire.json           communs, race, entrées, sorts d'école à crans I-IV, uniques
│  ├─ fusion-map.json         la table de fusion (signature → cran), le tri des 189 en cours
│  ├─ keywords.json           brûlure, corrosion, poison, sève, contrôles
│  └─ zones.json              zones d'errance : cadence, récoltes, apprentissage, drops N
├─ src/
│  ├─ engine/                 modules purs, testables, zéro DOM
│  │  ├─ stats.js             profils, stats, niveaux, évolutions
│  │  ├─ spells.js            résolution d'un sort : rôle, école, ciblage, crans, taux
│  │  ├─ combat.js            dégâts, boucle, ordre du tour, ciblage 1-2-3-5
│  │  ├─ summon.js            l'Appel, les renforts
│  │  └─ progression.js       éveils, voies, paliers, acquisition
│  ├─ data.js                 le chargeur : données injectées par le build, accès typé
│  ├─ validate.js             le validateur du contrat de données (section 4)
│  └─ ui.js                   le bloc UI extrait (routes, rendus, sauvegarde)
├─ tests/
│  ├─ engine.test.js          le moteur pur
│  ├─ data.test.js            le contrat de données
│  ├─ extensibility.test.js   la preuve de modularité
│  ├─ migration.test.js       les sauvegardes (fixtures v8)
│  └─ fixtures/save-v8.json   une sauvegarde réelle anonymisée
```

L'UI reste un bloc unique (`src/ui.js`) pendant toute la refonte : la modularité exigée porte sur **les données et le moteur** ; le découpage de l'UI est un non-goal.

## 4. Le contrat de données

Chaque fichier de `data/` est validé au chargement (dans le dist) et au test (dans node). Le validateur (`src/validate.js`) produit des erreurs en clair, en français, une par violation, et **liste la référence de l'exigence** (ex. `EXI-P2-4`). Le contrat :

1. **Références croisées** : tout sort référence une école existante ; toute école référencée par une voie existe ; tout noeud d'arbre référence des cibles existantes ; tout cran d'un sort à crans porte les quatre marches ou est marqué `vide: true` avec sa raison (un autre biome ou la zone d'errance le remplira).
2. **Échelles vérifiées** : coût des crans d'école 3, 4, 5, 6✦ strictement croissant ; coûts de lignée 2, 3, 5, 9, 14, 20✦ ; mana des familiales 8, 11, 14, 22, 30, 40 (+2, +3, +3, +5, +6, +8) ; largeur des frappes 1, 2, 3 (zone), 5 (tous) ; largeur des soutiens 1, 2, l'équipe, l'équipe renforcée.
3. **Unicité** : aucun doublon de nom de sort, de nom de carte à vérifier selon les règles du design (le dédoublonnage Éveillé du Seuil / Ange Éveillé est traité en phase 1).
4. **Taux cohérents** : pour un même sort, les taux baissent quand la largeur monte ; la puissance totale monte ; le soin est plafonné par la vie max de la cible (règle du moteur).
5. **Trace de la fusion** : `fusion-map.json` recense, par biome trié, chaque signature : soit `unique` (avec sa carte), soit `fusionnee` (vers le sort d'école et le cran) ; un biome trié couvre 100 % de ses signatures.

## 5. Les exigences transverses (non négociables)

- **EXI-MOD-1** : aucun identifiant de carte, de sort, d'école, de famille, de biome, aucun taux, coût ou multiplicateur de design n'est codé en dur dans `src/engine/`. Preuve : un test qui balaie `src/engine/*.js` et échoue s'il trouve un littéral correspondant à un ID connu (`e5`, `Morsure d'Écume`, `25`, non ; les nombres autorisés sont documentés dans `tests/allowlist.txt`, par exemple la largeur 5 de la ligne ennemie).
- **EXI-MOD-2** : ajouter une école, un sort à crans, une voie, un monstre ou un arbre se fait en éditant uniquement `data/`. Preuve : `tests/extensibility.test.js` injecte dans une copie des données une école fictive « l'Éclipse », un sort à crans « Trait d'Éclipse » (4 largeurs, 4 coûts) et un monstre qui le lance ; le moteur caste le sort sur les quatre largeurs sans qu'aucun fichier de `src/` ne soit modifié.
- **EXI-MOD-3** : le build est déterministe : `node build.mjs` deux fois de suite produit un `dist.html` identique octet par octet. Preuve : la commande de l'ACC-0-8.
- **EXI-MOD-4** : `dist.html` reste autonome : aucune ressource réseau, aucun `fetch`, aucune dépendance externe ; le jeu s'ouvre en local par double-clic. Preuve : le test balaie `dist.html` et échoue sur `fetch(`, `XMLHttpRequest`, `http://`, `https://` (sauf dans les commentaires d'origine du HISTORY).
- **EXI-DEP-1** : zéro dépendance. Node 18 ou plus pour le build et les tests (`node --test`, `node build.mjs`), rien d'autre ; pas de `node_modules`.
- **EXI-LANG-1** : tout est en français (UI, données, messages du validateur, noms de tests). Les chaînes de données du dist utilisent l'apostrophe typographique (codepoint U+2019) comme l'existant ; l'extracteur la préserve. Les docs suivent la convention des docs existants : pas de tiret long, guillemets « ».
- **EXI-SAVE-1** : chaque phase qui change la forme de la sauvegarde incrémente `SAVE_VERSION` et fournit une migration du format précédent ; une sauvegarde v8 de référence doit traverser toutes les migrations sans perte (cartes possédées, niveaux, éclats, jetons).
- **EXI-VER-1** : une phase n'est terminée que si **tous** ses critères d'acceptation passent, et les phases précédentes restent vertes : `node --test` complet à chaque commit de fin de tâche.

## 6. Phase 0 : le socle modulaire

**Objectif** : extraire le monolithe en `src/` + `data/` + `build.mjs` + `tests/`, **sans changer aucun comportement**. Le dist d'aujourd'hui et le dist regénéré se jouent pareil.

- **EXI-P0-1** : toutes les données inline de la section 2 vivent dans `data/*.json`, à l'identique (mêmes valeurs, mêmes textes).
- **EXI-P0-2** : le moteur extrait (`src/engine/`) ne touche pas au DOM ; il s'importe en node pour les tests.
- **EXI-P0-3** : `src/data.js` expose un accès unique aux données (`getCard(id)`, `getSpell(id)`, `getSchool(id)`, `getTree(id)`...) et exécute le validateur au chargement ; le dist refuse de démarrer sur des données invalides (message d'erreur en clair, à l'écran).
- **EXI-P0-4** : `SAVE_VERSION` ne bouge pas en phase 0 ; le harnais de migration est posé (fixture v8 + test de no-op migration).

**Critères d'acceptation (commandes qui prouvent)** :

1. **ACC-0-1** : `node --test` → `# pass` ≥ 30, `# fail` 0.
2. **ACC-0-2** : `node build.mjs` → `dist.html` écrit, exit 0 ; `node --check` sur le script extrait du dist (le bloc `<script>`) → pas d'erreur de syntaxe.
3. **ACC-0-3** : `node --test tests/data.test.js` → toutes les références croisées des données extraites se résolvent (aucune carte du CATALOG sans entrée, aucun sort référencé manquant).
4. **ACC-0-4** : `node --test tests/extensibility.test.js` → l'ajout d'un monstre test en données seules est casté par le moteur.
5. **ACC-0-5** : `node --test tests/migration.test.js` → la fixture v8 se charge, la migration no-op préserve 100 % des champs.
6. **ACC-0-6** : `node --test tests/engine.test.js` → au moins : les dégâts avec bouclier, le bonus d'opposition (BEATS/CROSS), la résolution d'un tour, un soin ne dépassant pas la vie max, l'ordre du tour actuel (attaque).
7. **ACC-0-7** : vérification visuelle (liste manuelle dans le plan) : dist regénéré ouvert en local, les 7 routes rendent, un combat complet se joue, une sauvegarde existante se charge, zéro erreur console.
8. **ACC-0-8** : `node build.mjs && cp dist.html /tmp/d1 && node build.mjs && cmp /tmp/d1 dist.html` → identiques.
9. **ACC-0-9** : `git diff --stat` ne montre que des fichiers prévus par le plan ; `dist.html` porte la mention `GÉNÉRÉ, ne pas éditer` en tête de fichier.

## 7. Phase 1 : les arbres de race

**Objectif** : câbler le design des arbres v17 (`docs/design-arbres.md`, normatif) : éveils, voies, drops N, communes déléguées. Les arbres deviennent des données (`trees.json`), le moteur les parcourt sans les connaître.

- **EXI-P1-1** : `trees.json` porte chaque race, ses éveils et ses voies au format du plan ; le validateur vérifie que tout chemin d'évolution mène à une carte existante et que les crans de race (+10, +20, +30 %) sont attachés aux bons noeuds.
- **EXI-P1-2** : l'Ange Éveillé est câblé : à l'éveil, l'Ange Gardien meurt (l'exemplaire disparaît), la mauvaise volonté part de l'Ange Éveillé ; le nom est dédoublonné de l'Éveillé du Seuil (le libellé exact suit le design v17, point 10.1-5).
- **EXI-P1-3** : les communes déléguées (Pousse des Sèves, Fidèle du Jour) existent dans les données et sont obtenues selon le design v17.
- **EXI-P1-4** : les drops N : `zones.json` (créé ici en squelette) porte les taux très bas des donjons, la nature des zones d'errance, et les 1 à 2 N du début du jeu.
- **EXI-P1-5** : le renvoi de l'item 23 (le design d'arbres renvoie à la refonte des sorts) est honoré : rien n'est figé côté sorts, l'arbre référence les écoles par identifiant de `schools.json`.
- **EXI-P1-6** : `SAVE_VERSION` passe à 9 avec migration : un exemplaire évolué d'une sauvegarde v8 reste jouable dans le nouvel arbre.

**Critères d'acceptation** :

1. **ACC-1-1** : `node --test tests/data.test.js` → `trees.json` : 100 % des références se résolvent, aucun doublon de nom (le test le prouve par parcours complet).
2. **ACC-1-2** : `node --test --test-name-pattern "Ange"` → l'éveil de l'Ange Éveillé retire l'Ange Gardien, la mauvaise volonté est portée par l'Éveillé, les deux noms coexistent sans collision.
3. **ACC-1-3** : `node --test --test-name-pattern "race"` → les crans +10/+20/+30 s'appliquent aux stats de race, par données uniquement (modifier le taux dans `trees.json` change le résultat du test proportionnellement).
4. **ACC-1-4** : `node --test tests/migration.test.js` → v8 → v9 : aucune carte possédée perdue, chaque exemplaire rechoisit sa voie si le design l'exige (la règle de re-choix suit le design v17).
5. **ACC-1-5** : `node build.mjs && node --test` → tout vert ; la vérification visuelle de l'ACC-0-7 rejouée.

## 8. Phase 2 : le rework des sorts

**Objectif** : câbler le design v2.3 (`docs/refonte-sorts.md`, normatif) : les 8 écoles, le grimoire à crans I-IV, la fusion (les Marées d'abord), les uniques, la fin du verrou de classe.

- **EXI-P2-1** : `schools.json` porte les 8 écoles (la Lame, le Baume, le Rempart, l'Appel, l'Entrave, le Mauvais Œil, la Ferveur, la Ruse) et les profils/voies qui les ouvrent ; un sort ne dépend plus d'une classe, il dépend de son école.
- **EXI-P2-2** : `grimoire.json` porte les communs, les sorts de race, les entrées d'école, les sorts de lignée (référencés depuis `lineage-spells.json`) et les sorts d'école à crans ; chaque cran porte sa largeur (frappes : 1, 2, la zone de 3, tous ; soutiens : 1, 2, l'équipe, l'équipe renforcée), son coût (3, 4, 5, 6✦) et ses taux du design.
- **EXI-P2-3** : les Marées sont la première fusion livrée : les 7 uniques (Léviathan : Marée Noire ; Titan : Abîme Absolu ; Zikka, Griknir, Pontos, Méliane, Thalassa) et les 23 fondues vers les 6 sorts nés et les 3 crans d'entrées, **à l'identique de la table 14.2 du design** ; `fusion-map.json` couvre 30 signatures sur 30.
- **EXI-P2-4** : les biomes non triés restent jouables via leur signature actuelle (le chemin legacy) ; le validateur exige seulement que les biomes **marqués triés** dans `fusion-map.json` soient couverts à 100 %. Le tri continue ensuite en éditant des données, sans retour sur le code (EXI-MOD-2).
- **EXI-P2-5** : `keywords.json` porte les effets persistants par élément : brûlure (Forge), corrosion (Marées), poison (Ombre), sève rongeuse (Bosquet) ; même règle de jeu, pourcentage par tour contre le seuil de la cible.
- **EXI-P2-6** : une carte naît avec son commun (+ son sort de race si c'est une naissance) ; les sorts d'école s'acquièrent par les voies ; le reste s'apprend (la table d'acquisition complète arrive en phase 4).
- **EXI-P2-7** : `SAVE_VERSION` passe à 10 avec migration : les sorts connus d'une sauvegarde v9 sont re-mappés (signature → cran ou unique selon la fusion-map) ; aucun sort connu n'est perdu.

**Critères d'acceptation** :

1. **ACC-2-1** : `node --test tests/data.test.js` → chaque sort référence une école existante ; chaque cran porte ses quatre marches ou son `vide: true` motivé ; coût strictement croissant ; les taux baissent quand la largeur monte.
2. **ACC-2-2** : `node --test --test-name-pattern "Morsure d'Écume"` → le cran I touche 1 ennemi, le II en touche 2, le III la zone de 3, le IV tous les 5 ; les mults ×1.5/×1.8/×2.2/×2.6 et les coûts 3/4/5/6✦ viennent des données (le test modifie le JSON et voit le résultat suivre).
3. **ACC-2-3** : `node --test --test-name-pattern "Chant de Sirène"` → stun 25/20/15/10 % sur les largeurs 1/2/3/5, joué contre le seuil de la cible.
4. **ACC-2-4** : `node --test --test-name-pattern "fusion"` → Marées : 30 signatures sur 30 résolues (7 uniques + 23 fondues) ; un monstre des Marées caste son cran de fusion, un monstre d'un biome non trié caste sa signature actuelle.
5. **ACC-2-5** : `node --test --test-name-pattern "école"` → deux profils différents qui ont ouvert la même école castent le même sort avec le même effet (fin du verrou de classe, prouvable en changeant la voie dans les données).
6. **ACC-2-6** : `node --test tests/extensibility.test.js` → l'école fictive « l'Éclipse » de l'EXI-MOD-2 caste sur les quatre largeurs.
7. **ACC-2-7** : `node --test tests/migration.test.js` → v8 → v9 → v10 : les sorts connus survivent au re-mappage, le compte des sorts appris est conservé.

## 9. Phase 3 : le mode RPG (les nouvelles caractéristiques)

**Objectif** : agilité et intelligence deviennent des stats de premier niveau ; le mult tire sur la stat principale ; la zone existe ; l'ordre du tour suit l'agilité ; les taux se jouent contre des seuils.

- **EXI-P3-1** : `cards.json` et `monsters.json` portent agilité et intelligence par carte, réparties selon les crans actés (+10, +20, +30 %) ; `engine.json` porte la stat principale par profil : guerrier/épéiste → attaque, assassin/voleur → agilité, mage/occultiste/prêtre → intelligence, gardien/voie du Bouclier → vie (**proposition encore ouverte, donc une donnée de `engine.json`, jamais du code** : changer la décision = changer la donnée).
- **EXI-P3-2** : toutes les puissances tirent sur la stat principale du lanceur ; le soin du prêtre reste plafonné à la vie max de la cible ; l'agilité porte en plus l'initiative et l'esquive.
- **EXI-P3-3** : la zone frappe 3 cibles contiguës sur les 5 (positions 1-2-3, 2-3-4 ou 3-4-5) ; en auto, le jeu frappe le centre (2, 3, 4) ; en Tactique, le joueur pose le trio ; une cible tombée avant l'impact n'est pas remplacée (pas de glissement).
- **EXI-P3-4** : l'ordre du tour se calcule sur l'agilité (le mode Tactique), l'attaque n'entre plus dans l'initiative.
- **EXI-P3-5** : les seuils de résistance vivent dans `engine.json` (par palier et par camp, selon le mécanisme retenu au design) ; tout taux (stun, brûlure, poison, malus) se joue contre le seuil de la cible.
- **EXI-P3-6** : `SAVE_VERSION` passe à 11 : migration qui pose agilité et intelligence sur les exemplaires existants (dérivées des stats et du palier, la formule dans le plan).

**Critères d'acceptation** :

1. **ACC-3-1** : `node --test --test-name-pattern "stat principale"` → un sort de dégâts casté par un mage vaut mult × intelligence, par un guerrier mult × attaque, par un assassin mult × agilité ; changer la stat principale d'un profil dans `engine.json` change la base du calcul (données, pas code).
2. **ACC-3-2** : `node --test --test-name-pattern "soin"` → le soin plafonne à la vie max de la cible, au cran comme à l'unique.
3. **ACC-3-3** : `node --test --test-name-pattern "zone"` → exactement 3 cibles contiguës touchées sur 5 ; le centre en auto ; une cible morte avant l'impact n'est pas remplacée ; la largeur vient des données (le cran III du sort test vaut 3).
4. **ACC-3-4** : `node --test --test-name-pattern "ordre"` → à agilité égale l'ordre reste stable, à agilité supérieure l'agent agit avant ; le tri ne lit plus l'attaque.
5. **ACC-3-5** : `node --test --test-name-pattern "seuil"` → un stun de 25 % contre un seuil donné produit la probabilité attendue (RNG semé, tolérance statistique documentée dans le plan).
6. **ACC-3-6** : `node --test tests/migration.test.js` → v8 → v11 : chaque exemplaire reçoit ses deux stats, aucune régression des champs.

## 10. Phase 4 : les zones d'errance

**Objectif** : les zones d'errance deviennent le poumon du jeu (design v17 et v2.3) : cadence zone, donjon, zone, donjon, zone, donjon ; récoltes ; apprentissage des crans.

- **EXI-P4-1** : `zones.json` porte chaque zone : sa nature (biome, thème), ses rencontres, ses récoltes (éclats, N à taux très bas, jetons) et ses enseignements (crans supérieurs des écoles ouvertes, sorts d'école neufs).
- **EXI-P4-2** : la cadence est vérifiée par le validateur : après un donjon, une zone ; après une zone, un donjon ; jamais deux zones ni deux donjons consécutifs hors événement.
- **EXI-P4-3** : apprendre un cran dans une zone l'ajoute au grimoire du joueur (persisté en sauvegarde) ; un cran appris reste acquis à l'évolution.
- **EXI-P4-4** : les drops N respectent le design : taux très bas dans les donjons, nature des zones d'errance, 1 à 2 N disponibles en début de jeu.
- **EXI-P4-5** : `SAVE_VERSION` passe à 12 si la forme change (grimoire appris, zones visitées).

**Critères d'acceptation** :

1. **ACC-4-1** : `node --test tests/data.test.js` → `zones.json` : cadence valide sur toute la chaîne, chaque récolte référence un objet existant, chaque enseignement référence un cran existant.
2. **ACC-4-2** : `node --test --test-name-pattern "errance"` → un passage scripté de zone (RNG semé) délivre les récoltes configurées dans les bornes attendues ; la cadence alterne bien zone et donjon.
3. **ACC-4-3** : `node --test --test-name-pattern "apprentissage"` → un cran II appris en zone est persisté, castable, et survit à l'évolution de l'exemplaire.
4. **ACC-4-4** : vérification visuelle : une session complète (zone, donjon, zone) se joue, le grimoire du joueur grossit, l'écran le montre.

## 11. Phase 5 : l'audit et l'équilibrage

**Objectif** : fermer la boucle : l'audit régénéré depuis les données, l'équilibrage en données seulement, la mise à jour publiée.

- **EXI-P5-1** : `docs/audit-sorts.md` est régénéré depuis `data/` (le décompte : sorts d'école, crans remplis, uniques, couverture de fusion par biome) par une commande `node tools/audit.mjs > docs/audit-sorts.md`.
- **EXI-P5-2** : le HISTORY du dist porte l'entrée de la mise à jour ; la version du jeu passe à v1.0.
- **EXI-P5-3** : tout réglage d'équilibrage (taux, coûts, mults) se fait en `data/` uniquement ; le diff de code est vide entre deux réglages.

**Critères d'acceptation** :

1. **ACC-5-1** : `node tools/audit.mjs > /tmp/audit.md && diff /tmp/audit.md docs/audit-sorts.md` → vide (l'audit est régénérable à l'identique).
2. **ACC-5-2** : `node --test` complet vert, toutes phases ; `node build.mjs` ; vérification visuelle E2E complète (la liste du plan).
3. **ACC-5-3** : `git diff --stat` entre le dernier réglage d'équilibrage et son parent ne touche que `data/` et `docs/`.

## 12. La migration des sauvegardes (récapitulatif)

v8 (aujourd'hui) → 9 (arbres) → 10 (sorts, re-mappage fusion) → 11 (stats RPG) → 12 (grimoire appris, zones). Chaque saut : migration pure, testée, une fixture réelle par version intermédiaire. Interdiction de sauter un palier : une sauvegarde v8 charge dans un dist final en traversant toutes les migrations dans l'ordre.

## 13. Le récapitulatif des commandes (le langage des critères)

| La preuve | La commande |
| --- | --- |
| tous les tests | `node --test` |
| un critère précis | `node --test --test-name-pattern "<motif>"` |
| le build | `node build.mjs` |
| le déterminisme | `node build.mjs && cp dist.html /tmp/d1 && node build.mjs && cmp /tmp/d1 dist.html` |
| l'audit régénéré | `node tools/audit.mjs` |
| la syntaxe du dist | extraction du bloc script puis `node --check` |

Un critère d'acceptation n'existe que s'il se prouve par une commande ; toute exigence sans commande est un mensonge de spec.

## 14. Les risques et les garde-fous

| Le risque | Le garde-fou |
| --- | --- |
| la régression pendant l'extraction du monolithe (374 Ko) | phase 0 sans changement de comportement, invariants testés avant/après, liste visuelle du plan, build déterministe |
| les designs bougent encore (arbres, tri des 189, gardien sur la vie, seuils) | tout point non-acté vit en données (`engine.json`, `fusion-map.json`, `vide: true` motivé) ; changer la décision = changer la donnée |
| le tri des 189 partiel | les biomes non triés restent sur le chemin legacy ; le validateur n'exige la couverture que des biomes marqués triés |
| la sauvegarde casse | migrations chaînées v8 → v12, fixtures réelles, ACC par phase |
| le dist cesse d'être autonome | EXI-MOD-4 balaie le dist à chaque build |
| un agent édite dist.html à la main | le bâtisseur écrase ; le fichier porte la mention GÉNÉRÉ ; le plan l'interdit |

## 15. Hors périmètre (non-goals)

Le découpage de l'UI en modules ; toute nouvelle fonctionnalité non écrite dans les deux documents de design ; la séparation mono/multi des lignes de sorts (notée au design pour une future méta, pas dans cette mise à jour) ; l'équilibrage fin des zones au-delà des valeurs des documents de design.
