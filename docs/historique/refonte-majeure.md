# La refonte majeure — spec et plan (chantier TERMINÉ, phases 0 à 5 le 10/11/2026)

> **Archive** : fusion de `spec-refonte-majeure.md` et `plan-refonte-majeure.md` (ex-`docs/design/`), rangés ici à la clôture de la refonte (rapports d'exécution : `rapport-phase-0.md` à `rapport-phase-5.md`, `rapport-verification-refonte.md`). Contenu conservé tel quel : les chemins internes sont ceux du moment de la rédaction.

## Partie 1 — Spec (v1)

Cette spec couvre l'ensemble des changements actés : **les arbres de race** (éveils, voies, drops), **le rework des sorts** (écoles, grimoire à crans, fusion des 189), **le mode RPG** (les nouvelles caractéristiques : agilité et intelligence, la base des mults, les ciblages, l'ordre du tour, les seuils) et **les zones d'errance** (cadence, récoltes, apprentissage). Elle dit **quoi** et **comment on prouve que c'est fait** ; le **comment détaillé** est dans le plan (`docs/design/plan-refonte-majeure.md`).

**Le point de vigilance du projet (ta demande)** : les arbres de sorts et de personnages **risquent encore de bouger**. La structure doit être **modulaire** : les arbres, les écoles, les sorts et leurs crans sont des **données** (JSON), jamais du code ; le moteur lit les données, il ne les connaît pas. Changer un arbre ou déplacer un cran = éditer un fichier de données, relancer les tests et le build. Aucune exigence de cette spec ne demande de coder en dur une valeur de design.

## 1. Sources normatives et ordre de lecture

| Le document | Son rôle | Priorité |
| --- | --- | --- |
| `docs/design/refonte-sorts.md` (v2.3) | le design cible des sorts : écoles, crans I-IV, largeurs, fusion des Marées | normatif pour les sorts |
| `docs/design/design-arbres.md` (v17) | le design cible des races : éveils, voies, drops N, communes déléguées | normatif pour les arbres |
| `docs/design/inventaire-sorts.md` | l'état embarqué : les 189 signatures, les textes de référence | normatif pour l'existant |
| `docs/design/arbres-sorts.md`, `docs/historique/audit-sorts.md` | l'état embarqué des arbres et de l'audit | référence |
| cette spec (`docs/design/spec-refonte-majeure.md`) | les exigences et les critères d'acceptation | normatif pour la structure |
| `docs/design/plan-refonte-majeure.md` | les tâches, l'ordre, le code de départ | exécution |

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

**Objectif** : câbler le design des arbres v17 (`docs/design/design-arbres.md`, normatif) : éveils, voies, drops N, communes déléguées. Les arbres deviennent des données (`trees.json`), le moteur les parcourt sans les connaître.

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

**Objectif** : câbler le design v2.3 (`docs/design/refonte-sorts.md`, normatif) : les 8 écoles, le grimoire à crans I-IV, la fusion (les Marées d'abord), les uniques, la fin du verrou de classe.

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

- **EXI-P5-1** : `docs/historique/audit-sorts.md` est régénéré depuis `data/` (le décompte : sorts d'école, crans remplis, uniques, couverture de fusion par biome) par une commande `node tools/audit.mjs > docs/historique/audit-sorts.md`.
- **EXI-P5-2** : le HISTORY du dist porte l'entrée de la mise à jour ; la version du jeu passe à v1.0.
- **EXI-P5-3** : tout réglage d'équilibrage (taux, coûts, mults) se fait en `data/` uniquement ; le diff de code est vide entre deux réglages.

**Critères d'acceptation** :

1. **ACC-5-1** : `node tools/audit.mjs > /tmp/audit.md && diff /tmp/audit.md docs/historique/audit-sorts.md` → vide (l'audit est régénérable à l'identique).
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

## Partie 2 — Plan d'implémentation (v1)

> **Pour l'agent qui exécute** : ce plan se déroule tâche par tâche, dans l'ordre. Une tâche = une préoccupation = un commit. Après chaque étape, tu lances la commande de preuve indiquée et tu ne passes à la suivante que si elle passe. Coche les cases (`- [ ]`) au fur et à mesure. À la fin de chaque phase, tu produis un mini-rapport : les critères ACC exécutés avec leur sortie, puis une dernière ligne `VERDICT: PASS` ou `VERDICT: FAIL <raison>`. Si un design bouge (les arbres et les sorts peuvent encore évoluer), tu ne devines jamais : tu appliques le document de design le plus récent poussé sur `main` et tu notes la question dans le rapport. **Interdits absolus** : éditer `dist.html` à la main, coder en dur une valeur de design dans `src/engine/`, sauter une migration de sauvegarde.

**Goal :** extraire le monolithe `dist.html` (374 Ko, un seul bloc script) en `src/` modulaire + `data/` JSON + `build.mjs`, puis câbler les quatre chantiers actés (arbres de race v17, sorts v2.3, mode RPG, zones d'errance), chaque phase prouvée par des commandes.

**Architecture :** les données (cartes, monstres, écoles, grimoire, arbres, zones) vivent en JSON dans `data/`, le moteur (`src/engine/`, modules purs sans DOM) les lit par `src/data.js` qui exécute le validateur, `build.mjs` assemble tout en un `dist.html` unique et autonome. Les tests tournent en node (`node --test`) sur les modules purs ; le dist reste jouable en double-clic.

**Tech stack :** JavaScript pur (ES modules côté node, bundle IIFE côté dist), Node 18+, `node --test`, zéro dépendance, pas de `node_modules`.

**Documents normatifs** : `docs/design/spec-refonte-majeure.md` (les exigences EXI et les critères ACC cités dans ce plan), `docs/design/refonte-sorts.md` (design des sorts), `docs/design/design-arbres.md` (design des arbres), `docs/design/inventaire-sorts.md` (l'existant). En cas de contradiction, le design le plus récent gagne.

## Contraintes globales (chaque tâche les inclut implicitement)

- Zéro dépendance ; Node 18+ ; pas de `node_modules` (EXI-DEP-1).
- `dist.html` est GÉNÉRÉ ; ne jamais l'éditer à la main (ACC-0-9).
- Aucun ID de carte, nom de sort, école, taux, coût ou mult de design dans `src/engine/` (EXI-MOD-1) ; les nombres autorisés sont dans `tests/allowlist.txt`.
- Coûts de lignée : 2, 3, 5, 9, 14, 20✦ ; crans d'école : 3, 4, 5, 6✦ ; largeurs des frappes : 1, 2, 3 (zone), 5 (tous) ; soutiens : 1, 2, l'équipe, l'équipe renforcée ; mana familiales : 8, 11, 14, 22, 30, 40 (+2, +3, +3, +5, +6, +8), autres : 10 (+2) ; puissances lignée : mono ×1.4 à 1.9, double ×1.9 à 2.2, zone ×2.6 à 3.2, tous ×3.4 à 4.4, éventail ×4.5 à 6. Ces valeurs viennent des documents de design : elles vivent dans `data/`, jamais dans le code.
- Tout en français ; données du dist avec apostrophe typographique (U+2019) préservée par l'extracteur ; docs sans tiret long, guillemets « » (EXI-LANG-1).
- Le RNG du moteur s'injecte (un paramètre) pour que les tests soient semés ; le jeu passe `Math.random`, les tests passent `mulberry32(graine)`.
- Les sauvegardes : `SAVE_VERSION` 8 aujourd'hui ; v9 (arbres), v10 (sorts), v11 (stats RPG), v12 (grimoire/zones) ; chaque migration testée, chaînage v8 → courant interdit à sauter (EXI-SAVE-1).

---

## Phase 0 : le socle modulaire

### Tâche T0.1 : le socle de repo

**Fichiers :** Créer `package.json`, `.gitignore`, `tests/allowlist.txt`, `tests/helpers/rng.js`, `tests/smoke.test.js`
**Interfaces :** Produit `mulberry32(seed)` (function → () => number), utilisé par toutes les tâches de test.

- [x] **Étape 1 : écrire `package.json`**

```json
{
  "name": "aicg-lignees",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/",
    "build": "node build.mjs"
  }
}
```

- [x] **Étape 2 : écrire `.gitignore`**

```
node_modules/
/tmp/
*.bak
```

- [x] **Étape 3 : écrire `tests/allowlist.txt`** (les seuls littéraux numériques tolérés dans `src/engine/`, motif puis raison, un par ligne) :

```
# EXI-MOD-1 : nombres autorisés dans le moteur (structure du champ, pas design)
5   # largeur de la ligne ennemie (structure du champ)
3   # largeur de la zone (structure du champ)
```

- [x] **Étape 4 : écrire `tests/helpers/rng.js`**

```js
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [x] **Étape 5 : écrire `tests/smoke.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
test('le harnais tourne', () => { assert.equal(1 + 1, 2); });
```

- [x] **Étape 6 : vérifier et committer**

Run: `npm test`
Expected: `# pass` ≥ 1, `# fail` 0.

```bash
git add package.json .gitignore tests/
git commit -m "chore : socle de repo (package.json, tests, rng seme)"
```

### Tâche T0.2 : le build

**Fichiers :** Créer `build.mjs`, `src/shell.html`, `src/data.js` (coquille), `src/validate.js` (coquille), `src/engine/*.js` (coquilles vides), `src/ui.js` (coquille vide)
**Interfaces :** Produit la commande `node build.mjs` (exit 0, écrit `dist.html`) ; consomme `data/*.json` (T0.3 les remplit) et `src/*.js` dans un ordre fixe.

- [x] **Étape 1 : écrire `src/shell.html`** : copier le `dist.html` actuel, remplacer tout le contenu du bloc `<script>...</script>` par la ligne `<!--SCRIPT-->` exactement, et ajouter en première ligne du fichier le commentaire `<!-- GÉNÉRÉ par build.mjs, ne pas éditer : éditer src/ et data/ -->`.

- [x] **Étape 2 : écrire `build.mjs`**

```js
#!/usr/bin/env node
// build.mjs : assemble src/ + data/ -> dist.html unique, deterministe (EXI-MOD-3, ACC-0-8)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const ENGINE_ORDER = [
  'src/engine/stats.js',
  'src/engine/spells.js',
  'src/engine/combat.js',
  'src/engine/summon.js',
  'src/engine/progression.js',
];

const read = (p) => {
  if (!existsSync(p)) return `/* ${p} : pas encore extrait */\n`;
  return readFileSync(p, 'utf8').replace(/\s+$/, '\n');
};

const dataNames = readdirSync('data').filter((f) => f.endsWith('.json')).sort();
const data = Object.fromEntries(
  dataNames.map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(`data/${f}`, 'utf8'))])
);

const script = [
  '/* GÉNÉRÉ par build.mjs : ne pas éditer */',
  `const DATA = ${JSON.stringify(data, null, 1)};`,
  read('src/data.js'),
  read('src/validate.js'),
  ...ENGINE_ORDER.map(read),
  read('src/ui.js'),
].join('\n');

const shell = read('src/shell.html');
const out = shell.replace('<!--SCRIPT-->', () => script);
writeFileSync('dist.html', out);
console.log(`build ok : dist.html (${out.length} caracteres, ${dataNames.length} fichiers de donnees)`);
```

- [x] **Étape 3 : coquilles vides** : `src/data.js` = `const D = DATA;`, `src/validate.js` = `export function validate() {}`, `src/ui.js` = `/* extrait en T0.5 */`, `src/engine/*.js` vides, `data/` avec au moins un fichier (`engine.json` vide `{}`). À ce stade le build tourne mais le dist n'est pas jouable : c'est le point de départ, pas un livrable.

- [x] **Étape 4 : vérifier le déterminisme**

Run: `node build.mjs && cp dist.html /tmp/d1.html && node build.mjs && cmp /tmp/d1.html dist.html`
Expected: exit 0, `build ok` deux fois, cmp silencieux (ACC-0-8).

- [x] **Étape 5 : committer**

```bash
git add build.mjs src/ data/
git commit -m "feat : build.mjs deterministe (src/ + data/ -> dist.html)"
```

### Tâche T0.3 : l'extraction des données

**Fichiers :** Créer `tools/extract-data.mjs`, `data/*.json`, `src/data.js` (final), `src/validate.js` (noyau), `tests/data.test.js`
**Interfaces :** Produit `getCard(id)`, `getMonster(id)`, `getSpell(id)`, `getSchool(id)`, `getFamily(id)`, `getTree(id)`, `getZone(id)` ; `validate(data, errors)` pousse les violations dans `errors`, format `<message> (<référence EXI>)`.

- [x] **Étape 1 : écrire `tools/extract-data.mjs`** (une passe, jetable : elle lit le dist d'origine comme référence) :

```js
// tools/extract-data.mjs : extrait les donnees inline du dist de reference
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('dist.reference.html', 'utf8');
const grab = (name, kind) => {
  const start = src.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`${name} introuvable`);
  const end = kind === 'array' ? src.indexOf('];', start) : src.indexOf('};', start);
  return src.slice(start, end + 2);
};
const evalData = (code) => (0, eval)(code.replace(/^const [A-Z_]+ =/, ''));
const write = (file, value) => writeFileSync(`data/${file}`, JSON.stringify(value, null, 1) + '\n');
write('cards.json', evalData(grab('CATALOG', 'array')));
write('monsters.json', evalData(grab('RAW', 'array')));
write('families.json', evalData(grab('FAMILIES', 'object')));
write('lineage-spells.json', evalData(grab('FAMILY_SPELLS', 'object')));
write('dungeons.json', evalData(grab('DUNGEONS', 'array')));
write('difficulties.json', evalData(grab('DIFFICULTIES', 'array')));
write('evolutions.json', evalData(grab('EVO_CHOICES', 'object')));
write('synergies.json', evalData(grab('SYNERGIES', 'object')));
console.log('extraction ok');
```

Préparation : `git show <commit-de-depart>:dist.html > dist.reference.html` (le dist d'origine au commit où commence la phase 0), puis `node tools/extract-data.mjs`. Vérifier à la main que les fichiers produits contiennent les cartes connues (`e13`, `d18`, `n15`...) et les familles (`eau`, `aube`, `lame`...). Les déclarations qui ne se prêtent pas au grab (chaine interrompue, template) sont copiées à la main, une par une, avec relecture.

- [x] **Étape 2 : compléter `data/engine.json`** : y ranger les constantes moteur non couvertes par le grab (`CLASSES`, `ELEMENTS`, `BEATS`, `BEATEN_BY`, `RACES`, `RACE_MOD`, `CLASSE_MODS`, `CLASSE_DEFAULT`, `MONSTER_MANA`, `SOLO_MANA`, `FAMILY_MANA`, `EVO_COST`, `GEM_TIERS`, `BOSS_GEM`, `NEXT_RAR`, `RARITY_POWER`, `RANK`, `TEAM_MAX`, `OPP_BONUS`, `LEVEL_BONUS`, `LEVEL_CAP`, `DMG_REDUCTION_MAX`). Règle : une valeur de design va en `engine.json` ; une structure du champ (la largeur 5) reste au code avec le motif autorisé.

- [x] **Étape 3 : écrire `src/data.js`** (en node, la garde `typeof document !== 'undefined'` protège le bloc d'affichage) :

```js
// src/data.js : acces unique aux donnees + validation au chargement (EXI-P0-3)
const errors = [];
validate(DATA, errors);
if (errors.length && typeof document !== 'undefined') {
  document.body.insertAdjacentHTML('beforeend',
    `<pre style="color:#f88;padding:12px">DONNEES INVALIDES :\n${errors.join('\n')}</pre>`);
}
const index = (arr) => Object.fromEntries((arr ?? []).map((x) => [x.id ?? x.key, x]));
const IDX = {
  cards: index(DATA.cards), monsters: index(DATA.monsters),
  families: index(DATA.families), schools: index(DATA.schools),
  grimoire: index(DATA.grimoire?.spells), trees: index(DATA.trees), zones: index(DATA.zones),
};
const getCard = (id) => IDX.cards[id];
const getMonster = (id) => IDX.monsters[id];
const getSpell = (id) => IDX.grimoire[id];
const getSchool = (id) => IDX.schools[id];
const getFamily = (id) => IDX.families[id];
const getTree = (id) => IDX.trees[id];
const getZone = (id) => IDX.zones[id];
```

(les fichiers `schools`, `grimoire`, `trees`, `zones` naissent vides (`{}` ou `[]`) et se remplissent aux phases 1 et 2 ; le chargement ne doit pas échouer sur leur absence.)

- [x] **Étape 4 : écrire `src/validate.js`** (le noyau, il grossit à chaque phase) :

```js
// src/validate.js : le contrat de donnees (spec section 4)
function validate(data, errors) {
  const push = (msg, ref) => errors.push(`${msg} (${ref})`);
  const cards = [...(data.cards ?? []), ...(data.monsters ?? [])];
  const ids = cards.map((c) => c.id);
  if (new Set(ids).size !== ids.length) push('des cartes partagent le meme id', 'EXI-DATA-3');
  for (const m of data.monsters ?? []) {
    for (const s of m.spells ?? []) {
      if (!s.nom && !s.name) push(`le monstre ${m.id} porte un sort sans nom`, 'EXI-DATA-1');
    }
  }
  return errors;
}
```

- [x] **Étape 5 : écrire `tests/data.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
const load = () => Object.fromEntries(
  readdirSync('data').filter((f) => f.endsWith('.json')).sort()
    .map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(`data/${f}`, 'utf8'))])
);
test('les donnees se chargent et passent le validateur (ACC-0-3)', async () => {
  const errors = [];
  const { validate } = await import('../src/validate.js');
  validate(load(), errors);
  assert.deepEqual(errors, []);
});
```

- [x] **Étape 6 : vérifier et committer**

Run: `npm test`
Expected: `# fail` 0.
Run: `node build.mjs`
Expected: `build ok`, toutes les données citées par la spec section 2 présentes dans `data/`.

```bash
git add tools/ data/ src/data.js src/validate.js tests/data.test.js
git commit -m "data : extraction des donnees inline vers data/*.json + validateur"
```

### Tâche T0.4 : l'extraction du moteur

**Fichiers :** Créer `src/engine/stats.js`, `src/engine/combat.js`, `src/engine/spells.js`, `src/engine/summon.js`, `src/engine/progression.js`, `src/engine/migrate.js`, `tests/engine.test.js`
**Interfaces :** Les fonctions extraites gardent leurs noms et signatures actuels (`applyDamage(target, dmg, events, side, reviveCtx, isHit)`, `resolveTurn(state, choices)`...) ; le bundle du dist est une seule portée, les modules ne font ni `import` ni `export` (le build concatène dans l'ordre ENGINE_ORDER) ; en node, les tests chargent les modules par un chargeur maison (`tests/helpers/load.mjs` qui concatène `src/validate.js`, `src/data.js` fictif, `src/engine/*.js` puis `eval` et retourne les fonctions).

- [x] **Étape 1 : écrire `tests/helpers/load.mjs`**

```js
// charge les modules du moteur comme le build le fait, pour les tests
import { readFileSync } from 'node:fs';
export function loadEngine(dataDir = 'data') {
  const data = Object.fromEntries(
    readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort()
      .map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(`${dataDir}/${f}`, 'utf8'))])
  );
  const files = ['src/validate.js', 'src/engine/stats.js', 'src/engine/spells.js',
    'src/engine/combat.js', 'src/engine/summon.js', 'src/engine/progression.js'];
  const code = `const DATA = ${JSON.stringify(data)};\n` + files.map((f) => readFileSync(f, 'utf8')).join('\n')
    + `\nreturn { DATA, validate, applyDamage, resolveTurn, applySupport, castSummon, setRoll, roll: () => roll() };`;
  return (new Function(code))();
}
```

(le retour exact s'aligne sur les fonctions réellement extraites ; ce chargeur est la pièce qui prouve que le moteur ne dépend ni du DOM ni du build.)

- [x] **Étape 2 : lister et découper le moteur.** Dans `dist.reference.html`, repérer par motif (`function applyDamage`, `castSummon`, `applySupport`, `resolveTurn`, `applyManifest`, etc.) et leurs appelés en chaîne (grep des appels, une passe itérative). Découpe : dégâts/boucle/ciblage → `combat.js` ; sorts et supports → `spells.js` ; invocations → `summon.js` ; niveaux/stats → `stats.js` ; éveils/acquisition → `progression.js`.
- [x] **Étape 3 : la règle de découplage** : le moteur ne touche ni `document`, ni `window`, ni `localStorage` ; le rendu passe par des événements/callbacks consommés par `src/ui.js`. Preuve : `grep -n "document\.\|window\.\|localStorage" src/engine/*.js` → vide.
- [x] **Étape 4 : le RNG injecté** : le moteur expose `setRoll(fn)` et une `roll()` interne ; `ui.js` appelle `setRoll(Math.random)` au chargement ; les tests passent `setRoll(mulberry32(graine))`.
- [x] **Étape 5 : écrire `tests/engine.test.js`** (invariants du comportement ACTUEL ; les noms s'alignent sur le code extrait) :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';

test('applyDamage respecte le bouclier puis la vie (ACC-0-6)', () => {
  const E = loadEngine();
  const t = { hp: 100, shield: 30 };
  E.applyDamage(t, 50, [], 'ally');
  assert.equal(t.shield, 0); assert.equal(t.hp, 80);
});
test('un soin plafonne a la vie max (ACC-0-6)', () => {
  const E = loadEngine();
  const t = { hp: 90, maxHp: 100 };
  E.applySupport({ mult: 6, role: 'soin', cost: 3 }, [t], {}, [], 'ally');
  assert.equal(t.hp, 100);
});
test('resolveTurn tourne et produit des evenements (ACC-0-6)', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(42));
  const st = fixtureCombat(E);
  const events = E.resolveTurn(st, null);
  assert.ok(Array.isArray(events) && events.length > 0);
});
```

(`fixtureCombat` : un état minimal 5 contre 5 construit dans le test depuis `DATA.monsters`.)

- [x] **Étape 6 : vérifier et committer**

Run: `npm test`
Expected: `# fail` 0, les invariants tiennent en node.

```bash
git add src/engine/ tests/helpers/load.mjs tests/engine.test.js
git commit -m "feat : moteur extrait en modules purs (stats, spells, combat, summon, progression)"
```

### Tâche T0.5 : l'UI et l'assemblage final

**Fichiers :** Créer `src/ui.js` (tout le reste du script), modifier `src/data.js` (les fonctions d'accès restent globales), `build.mjs` (le pied du script : le bloc `load(); if (store...)...` de fin de fichier d'origine recopié à la fin de `src/ui.js`)
**Interfaces :** Le dist regénéré se comporte comme l'original.

- [x] **Étape 1 :** déplacer tout le script restant (routes, rendus, sauvegarde, glossaire, HISTORY, FX, le pied `load(); registerRoute(...)`) dans `src/ui.js`, en remplaçant les lectures inline (`CARDS`, `MONSTERS`...) par les accès de `src/data.js`.
- [x] **Étape 2 :** `node build.mjs` ; ouvrir `dist.html` en local et dérouler la liste visuelle : les 7 routes rendent, un combat complet se joue (victoire et défaite), une sauvegarde existante se charge, zéro erreur console (ACC-0-7, ACC-0-2).
- [x] **Étape 3 :** extraire le bloc script du dist (`sed -n '/<script>/,/<\/script>/p' dist.html | sed '1d;$d' > /tmp/bundle.js`) puis `node --check /tmp/bundle.js` → pas d'erreur de syntaxe (ACC-0-2).
- [x] **Étape 4 :** `grep -n "fetch(\|XMLHttpRequest" dist.html` → vide (EXI-MOD-4).
- [x] **Étape 5 : committer**

```bash
git add src/ui.js src/data.js build.mjs dist.html
git commit -m "feat : UI extraite, dist regenere depuis src/ + data/"
```

### Tâche T0.6 : le harnais de migration

**Fichiers :** Créer `tests/fixtures/save-v8.json`, `src/engine/migrate.js`, `tests/migration.test.js`
**Interfaces :** `migrate(save)` enchaîne `v8to9`, `v9to10`, `v10to11`, `v11to12` (des no-ops jusqu'à leur phase) ; `CURRENT_VERSION` vit dans `data/engine.json`.

- [x] **Étape 1 :** produire `tests/fixtures/save-v8.json` : depuis un navigateur avec une vraie partie, extraire `localStorage['fondations-cards-v1']` et committer (le jeu ne stocke aucune donnée personnelle).
- [x] **Étape 2 : écrire `tests/migration.test.js`**

```js
test('v8 traverse la chaine sans perte (ACC-0-5, EXI-SAVE-1)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.instances.length, save.instances.length);
  assert.equal(out.tokens.length, save.tokens.length);
});
```

- [x] **Étape 3 :** `npm test` → vert ; commit `feat : harnais de migration (fixture v8, chaine v8 a v12)`.

### Tâche T0.7 : la preuve de modularité (phase 0)

**Fichiers :** Créer `tests/extensibility.test.js`, `tests/allowlist.test.js`
**Interfaces :** Prouve EXI-MOD-1 et EXI-MOD-2 au niveau de la phase 0 (l'ajout d'un monstre en données seules).

- [x] **Étape 1 : écrire `tests/extensibility.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';

test('un monstre ajoute en donnees seules est jouable (ACC-0-4, EXI-MOD-2)', () => {
  const E = loadEngine('tests/fixtures/data-temoin');
  E.setRoll(mulberry32(1));
  const st = fixtureCombatAvec(E, ['x-temoin']);
  const events = E.resolveTurn(st, null);
  assert.ok(events.some((e) => e.source === 'x-temoin'));
});
```

Le fixture `tests/fixtures/data-temoin/` est une copie de `data/` augmentée du monstre `x-temoin` (écrit en JSON, sans toucher `src/`).

- [x] **Étape 2 : écrire `tests/allowlist.test.js`** : balaie `src/engine/*.js`, extrait les littéraux numériques hors commentaires (regex `/\b\d+(\.\d+)?\b/`), échoue avec la liste des coupables hors allowlist et la référence EXI-MOD-1.
- [x] **Étape 3 :** `npm test` → vert ; commit `test : preuve de modularite (monstre en donnees seules, allowlist EXI-MOD-1)`.
- [x] **Étape 4 : rapport de phase 0** : exécuter ACC-0-1 à ACC-0-9, coller les sorties, `VERDICT: PASS`.

---

## Phase 1 : les arbres de race

Source normative : `docs/design/design-arbres.md` (v17). Chaque valeur vient du document, aucune n'est inventée.

### Tâche T1.1 : le schéma des arbres + validateur

**Fichiers :** Créer `data/trees.json`, étendre `src/validate.js`, `tests/data.test.js`
**Interfaces :** `trees.json` : `{ "<race>": { "crans": { "1": 10, "2": 20, "3": 30 }, "eveils": [{ "de": "<id>", "vers": "<id>", "voie": "<id voie>", "effet": "standard" }] } }` ; les voies dans `data/schools.json` (nées en T2.1, la colonne écoles y est vide jusqu'à la phase 2, avertissement toléré).

- [x] **Étape 1 :** poser le schéma ; le validateur vérifie : chaque `de`/`vers` existe dans les cartes ; les crans valent 10/20/30 ; les noms d'éveils uniques sans collision (le dédoublonnage Éveillé du Seuil / Ange Éveillé se vérifie ici, EXI-P1-2) ; l'effet `remplace` exige `disparait: "<id>"`.
- [x] **Étape 2 :** `node --test --test-name-pattern "trees"` → vert.
- [x] **Étape 3 :** commit `data : schema des arbres de race + validateur (EXI-P1-1)`.

### Tâche T1.2 : les arbres v17 en données

**Fichiers :** Remplir `data/trees.json`, `data/cards.json` depuis `docs/design/design-arbres.md`

- [x] **Étape 1 :** lire le design section par section ; pour chaque éveil/voie, créer l'entrée. Règle : une entrée par ligne du design, aucune interprétation libre ; ce qui est ambigu est noté au rapport, jamais deviné.
- [x] **Étape 2 :** les communes déléguées (Pousse des Sèves, Fidèle du Jour) entrent dans `cards.json` avec leur voie d'obtention (EXI-P1-3).
- [x] **Étape 3 :** `npm test` → 100 % des références résolues (ACC-1-1) ; commit `data : les arbres v17 en donnees (eves, voies, communes deleguees)`.

### Tâche T1.3 : la progression par les arbres

**Fichiers :** Étendre `src/engine/progression.js`, créer `tests/progression.test.js`
**Interfaces :** `evolve(instance, tree)` applique l'éveil (id, stats, crans +10/+20/+30 %, sort de lignée du palier) ; l'évolution traverse `trees.json`, plus aucune table codée.

- [x] **Étape 1 :** brancher l'évolution existante sur `trees.json` (EVO_CHOICES reste en données, la traversée devient générique).
- [x] **Étape 2 :** test (ACC-1-3) : un éveil applique les crans depuis les données ; passer +10 à +12 dans la copie du test change le résultat d'autant.
- [x] **Étape 3 :** commit `feat : progression cablee sur trees.json`.

### Tâche T1.4 : les règles d'éveil spéciales

**Fichiers :** Étendre `src/engine/progression.js`, `tests/progression.test.js`
**Interfaces :** L'entrée `"effet": "remplace", "disparait": "<id>"` : à l'éveil, l'exemplaire ciblé disparaît, ses pouvoirs passent à l'éveillé (EXI-P1-2 : l'Ange Éveillé, l'Ange Gardien meurt, la mauvaise volonté suit).

- [x] **Étape 1 :** coder la règle générique en données (EXI-MOD-2) ; l'entrée de l'Ange Éveillé dans `trees.json` porte le `disparait`.
- [x] **Étape 2 :** test (ACC-1-2) : `node --test --test-name-pattern "Ange"` → l'éveil retire l'Ange Gardien, la mauvaise volonté est portée par l'Éveillé, les deux noms coexistent.
- [x] **Étape 3 :** commit `feat : regle d'eveil remplace (Ange Eveille) en donnees`.

### Tâche T1.5 : le squelette des zones (drops N)

**Fichiers :** Créer `data/zones.json` (squelette), étendre `src/validate.js`
**Interfaces :** `zones.json` : `[{ "id": "...", "nature": "...", "cadence": "zone", "drops": { "N": <taux> }, "ecolages": [] }]` ; les taux viennent du design v17 (EXI-P1-4).

- [x] **Étape 1 :** poser les entrées de drop du design ; le validateur vérifie que chaque drop référence une carte existante.
- [x] **Étape 2 :** `npm test` vert ; commit `data : squelette zones.json (drops N du design v17)`.

### Tâche T1.6 : la migration v9

**Fichiers :** Étendre `src/engine/migrate.js`, `tests/migration.test.js`
**Interfaces :** `v8to9(save)` : les exemplaires évolués restent jouables dans le nouvel arbre ; la règle de re-choix de voie suit le design v17 (EXI-P1-6).

- [x] **Étape 1 :** coder + tester (ACC-1-4) ; `CURRENT_VERSION` = 9 ; commit `feat : migration v9 (arbre, voies)`.
- [x] **Étape 2 :** `node build.mjs`, vérification visuelle (l'écran d'équipe montre les voies), rapport de phase 1, `VERDICT: PASS`.

---

## Phase 2 : le rework des sorts

Source normative : `docs/design/refonte-sorts.md` (v2.3). La table 14.2 se reporte à l'identique dans `data/fusion-map.json`.

### Tâche T2.1 : les écoles et les mots-clés

**Fichiers :** Créer `data/schools.json`, `data/keywords.json`, étendre `src/validate.js`
**Interfaces :** `schools.json` : `{ "lame": { "nom": "la Lame", "role": "degats" }, ... }` les 8 écoles du design ; `keywords.json` : brûlure (feu), corrosion (eau), poison (ombre), sève (vivant) (EXI-P2-5).

- [x] **Étape 1 :** les 8 écoles (la Lame, le Baume, le Rempart, l'Appel, l'Entrave, le Mauvais Œil, la Ferveur, la Ruse) ; le validateur : écoles uniques, noms français avec article, chaque école ouverte par au moins un profil ou une voie (exigé en fin de phase).
- [x] **Étape 2 :** `npm test` vert ; commit `data : les 8 ecoles et les mots-cles par element`.

### Tâche T2.2 : le grimoire (communs, race, entrées, lignées)

**Fichiers :** Créer `data/grimoire.json`, étendre `tests/data.test.js`
**Interfaces :** `grimoire.json` : `{ "communs": [...], "race": [...], "entrees": [...], "lignee": [...], "ecole": [...], "uniques": [...] }` ; un sort d'école : `{ "id": "morsure-decume", "ecole": "lame", "role": "degats", "crans": { "I": { "cout": 3, "largeur": 1, "mult": 1.5 }, "II": { "cout": 4, "largeur": 2, "mult": 1.8 }, "III": { "cout": 5, "largeur": 3, "mult": 2.2 }, "IV": { "cout": 6, "largeur": 5, "mult": 2.6 } } }` ; un cran vide : `{ "vide": true, "raison": "attend un autre biome ou la zone d'errance" }`.

- [x] **Étape 1 :** y ranger depuis le design et l'inventaire : les communs (Frappe Précise, Premiers Soins), les sorts de race (Discipline de Ligne, Instinct Sauvage, Vol en Rase-Mottes, Ferveur Céleste), les entrées (Brise-Garde, Décharge Arcanique, Onde Consacrée, Frappe dans le Dos, Œil du Malheur), les lignées (référencées depuis `lineage-spells.json`, 6 par famille, C à L).
- [x] **Étape 2 :** le validateur (ACC-2-1) : chaque sort référence une école existante ; coût strictement croissant ; 4 marches ou `vide: true` motivé ; taux décroissants quand la largeur monte.
- [x] **Étape 3 :** commit `data : le grimoire (communs, race, entrees, lignees)`.

### Tâche T2.3 : la fusion des Marées

**Fichiers :** Créer `data/fusion-map.json`, étendre `src/engine/spells.js`, `tests/spells.test.js`
**Interfaces :** `fusion-map.json` : `{ "marees": { "trie": true, "signatures": { "e1": { "fusion": "morsure-decume", "cran": "I" }, "e13": { "unique": "maree-noire" } } }, "forge": { "trie": false } }` (le `trie: false` garde le chemin legacy, EXI-P2-4).

- [x] **Étape 1 :** reporter la table 14.2 à l'identique : les 7 uniques (Léviathan : Marée Noire ; Titan : Abîme Absolu ; Zikka : Songe des Profondeurs ; Griknir : Couronne des Écumes ; Pontos : Bénédiction des Berges ; Méliane : Chant du Naufrage ; Thalassa : Colère des Récifs) et les 23 fondues (Morsure d'Écume I-IV, Chant de Sirène I-IV, Étreinte des Profondeurs III, Carapace de Corail I/III/IV, Marque Corrosive III, Guet des Fonds II, et les crans des entrées : Brise-Garde II, Œil du Malheur II, Onde Consacrée II). Les taux du design (14.3) vont dans les crans.
- [x] **Étape 2 :** test de couverture (ACC-2-4) : 30 signatures sur 30 résolues pour les Marées ; un monstre des Marées caste son cran de fusion ; un monstre d'un biome non trié caste sa signature actuelle.
- [x] **Étape 3 :** commit `data : fusion des Marees (7 uniques + 23 fondues, table 14.2 a l'identique)`.

### Tâche T2.4 : la résolution par crans

**Fichiers :** Étendre `src/engine/spells.js`, `tests/spells.test.js`
**Interfaces :** `castSpell(data, spellId, cran, contexte)` : résout largeur, coût, mult, taux contre le seuil ; le ciblage vient du cran (frappes 1/2/3/5 ; soutiens 1/2/équipe/équipe renforcée, le cran IV renforce) ; aucune référence à un sort en dur.

- [x] **Étape 1 :** coder la résolution générique.
- [x] **Étape 2 :** tests (ACC-2-2, ACC-2-3) : Morsure d'Écume touche 1/2/3/5 aux mults 1.5/1.8/2.2/2.6 et coûts 3/4/5/6✦ ; Chant de Sirène stun 25/20/15/10 % ; les deux tests modifient le JSON en copie et voient le résultat suivre.
- [x] **Étape 3 :** commit `feat : resolution des sorts a crans (largeur, cout, mult, taux vs seuil)`.

### Tâche T2.5 : la fin du verrou de classe

**Fichiers :** Étendre `src/engine/progression.js`, `tests/spells.test.js`
**Interfaces :** `openSchools(voie)` alimente le casting : un sort exige son école ouverte, jamais une classe (EXI-P2-1).

- [x] **Étape 1 :** test (ACC-2-5) : deux profils avec la même école ouverte castent le même sort, même effet ; changer la voie en données change l'école suivie.
- [x] **Étape 2 :** l'extensibilité complète (ACC-2-6) : l'école fictive « l'Éclipse » + son sort à crans, en données seules, castent sur les quatre largeurs.
- [x] **Étape 3 :** commit `feat : le sort depend de son ecole, plus de la classe`.

### Tâche T2.6 : l'acquisition de départ

**Fichiers :** Étendre `src/engine/progression.js`, `tests/progression.test.js`

- [x] **Étape 1 :** coder + tester (EXI-P2-6) : une naissance N possède son commun et son sort de race à l'obtention, rien d'autre ; l'éveil ouvre les écoles de la voie.
- [x] **Étape 2 :** commit `feat : acquisition de depart (commun + race a la naissance)`.

### Tâche T2.7 : la migration v10

**Fichiers :** Étendre `src/engine/migrate.js`, `tests/migration.test.js`
**Interfaces :** `v9to10(save)` : les sorts connus sont re-mappés selon `fusion-map.json` (signature → cran ou unique) ; aucun sort appris perdu (EXI-P2-7).

- [x] **Étape 1 :** coder + tester (ACC-2-7) ; `CURRENT_VERSION` = 10 ; commit `feat : migration v10 (re-mappage des sorts par la fusion-map)`.
- [x] **Étape 2 :** `node build.mjs`, vérification visuelle (le glossaire montre le grimoire), rapport de phase 2, `VERDICT: PASS`.

---

## Phase 3 : le mode RPG

### Tâche T3.1 : les stats et les profils

**Fichiers :** Étendre `data/engine.json`, `data/cards.json`, `data/monsters.json`, `src/engine/stats.js`, `src/engine/migrate.js`
**Interfaces :** `engine.json` : `"profils": { "guerrier": { "stat": "atk" }, "assassin": { "stat": "agi" }, "mage": { "stat": "int" }, "occultiste": { "stat": "int" }, "pretre": { "stat": "int" }, "gardien": { "stat": "hp" } }` (le gardien : proposition ouverte, donc une donnée, EXI-P3-1) ; chaque carte porte `agi` et `int`, réparties par les crans +10/+20/+30 %.

- [x] **Étape 1 :** poser `agi`/`int` sur toutes les cartes (dérivation par palier et rareté selon la répartition du design ; la formule est notée au rapport de phase).
- [x] **Étape 2 :** `v10to11(save)` : chaque exemplaire reçoit ses deux stats (ACC-3-6) ; `CURRENT_VERSION` = 11.
- [x] **Étape 3 :** commit `data+feat : agilite et intelligence, profils par stat principale`.

### Tâche T3.2 : la base des mults

**Fichiers :** Étendre `src/engine/spells.js`, `tests/spells.test.js`
**Interfaces :** `castSpell` calcule `mult × statPrincipale(lanceur)` ; le soin plafonne à la vie max de la cible (EXI-P3-2).

- [x] **Étape 1 :** tests (ACC-3-1, ACC-3-2) : mage → intelligence, guerrier → attaque, assassin → agilité ; changer `"stat"` du profil dans `engine.json` (en copie) change la base ; le soin plafonne.
- [x] **Étape 2 :** commit `feat : le mult tire sur la stat principale du profil`.

### Tâche T3.3 : la zone

**Fichiers :** Étendre `src/engine/combat.js`, `tests/combat.test.js`
**Interfaces :** `pickZoneTargets(ligne, choix)` : 3 cibles contiguës sur 5 ; `choix === null` → le centre ; une cible morte avant l'impact n'est pas remplacée (EXI-P3-3).

```js
function pickZoneTargets(ligne, choix = null) {
  const largeur = 3;
  const debut = choix !== null
    ? Math.max(0, Math.min(choix, ligne.length - largeur))
    : Math.floor((ligne.length - largeur) / 2);
  return ligne.slice(debut, debut + largeur).filter((u) => u.hp > 0);
}
```

- [x] **Étape 1 :** coder + tests (ACC-3-3) : exactement 3 contiguës sur 5 ; le centre en auto ; pas de remplacement ; la largeur vient du cran (données).
- [x] **Étape 2 :** commit `feat : la zone, 3 cibles contigues sur 5, sans glissement`.

### Tâche T3.4 : l'ordre du tour

**Fichiers :** Étendre `src/engine/combat.js`, `tests/combat.test.js`

- [x] **Étape 1 :** l'ordre se calcule sur l'agilité, tri stable à égalité (EXI-P3-4) ; test (ACC-3-4) : plus d'agilité agit avant, à égalité l'ordre ne bouge pas ; `grep -n "atk" src/engine/combat.js` ne montre plus l'initiative sur l'attaque.
- [x] **Étape 2 :** commit `feat : l'ordre du tour suit l'agilite`.

### Tâche T3.5 : les seuils

**Fichiers :** Étendre `data/engine.json`, `src/engine/spells.js`, `tests/spells.test.js`
**Interfaces :** `engine.json` : `"seuils": { "parPalier": [...], "parCamp": {} }` selon le mécanisme retenu au design (EXI-P3-5) ; tout taux se joue contre le seuil de la cible.

- [x] **Étape 1 :** test statistique (ACC-3-5) : un stun 25 % contre un seuil donné, RNG semé, 10 000 tirages, fréquence observée dans ±0,5 % de l'attendu ; formule et tolérance documentées dans le test.
- [x] **Étape 2 :** commit `feat : les taux se jouent contre les seuils (donnees)`.
- [x] **Étape 3 :** `node build.mjs`, vérification visuelle (un combat Tactique), rapport de phase 3, `VERDICT: PASS`.

---

## Phase 4 : les zones d'errance

### Tâche T4.1 : le plein des zones

**Fichiers :** Remplir `data/zones.json`, étendre `src/validate.js`, `tests/data.test.js`

- [x] **Étape 1 :** remplir depuis les designs (v17 et v2.3 section 10) : nature, rencontres, récoltes (éclats, N à taux très bas, jetons), enseignements (crans, sorts d'école) ; le validateur vérifie la cadence (jamais deux zones ni deux donjons consécutifs), les références (cartes, crans), les bornes des taux (EXI-P4-1, EXI-P4-2, ACC-4-1).
- [x] **Étape 2 :** commit `data : les zones d'errance completes (cadence, recoltes, ecolages)`.

### Tâche T4.2 : l'apprentissage en zone

**Fichiers :** Étendre `src/engine/progression.js`, `src/engine/migrate.js`, `tests/progression.test.js`

- [x] **Étape 1 :** apprendre un cran en zone l'ajoute au grimoire du joueur (persisté) ; un cran appris survit à l'évolution (EXI-P4-3) ; `v11to12` si la forme change (EXI-P4-5). Tests : ACC-4-2 (récoltes scriptées, RNG semé, bornes respectées), ACC-4-3 (cran II appris : persisté, castable, survit à l'évolution).
- [x] **Étape 2 :** commit `feat : l'apprentissage des crans en zone d'errance`.
- [x] **Étape 3 :** vérification visuelle (une session zone, donjon, zone : le grimoire grossit à l'écran, ACC-4-4), rapport de phase 4, `VERDICT: PASS`.

---

## Phase 5 : l'audit et l'équilibrage

### Tâche T5.1 : l'audit régénéré

**Fichiers :** Créer `tools/audit.mjs`, régénérer `docs/historique/audit-sorts.md`
**Interfaces :** `node tools/audit.mjs > docs/historique/audit-sorts.md` : décompte des sorts d'école, crans remplis, uniques, couverture de fusion par biome, mults et taux (EXI-P5-1).

```js
// tools/audit.mjs : l'audit se genere depuis les donnees (ACC-5-1)
import { readFileSync } from 'node:fs';
const load = (f) => JSON.parse(readFileSync(`data/${f}.json`, 'utf8'));
const grimoire = load('grimoire'), fusion = load('fusion-map');
const out = ['# Audit des sorts (genere)', ''];
out.push(`Sorts d'ecole : ${grimoire.ecole.length}, uniques : ${grimoire.uniques.length}`);
for (const [biome, b] of Object.entries(fusion)) {
  const sigs = Object.values(b.signatures ?? {});
  out.push(`- ${biome} : ${b.trie ? sigs.length + ' signatures resolues' : 'non trie (legacy)'}`);
}
console.log(out.join('\n'));
```

- [x] **Étape 1 :** coder, régénérer deux fois, diff vide (ACC-5-1) ; commit `feat : audit regenere depuis les donnees`.

### Tâche T5.2 : la publication

**Fichiers :** `src/ui.js` (HISTORY), `data/engine.json` (version), `docs/`

- [x] **Étape 1 :** l'entrée HISTORY de la mise à jour (style des entrées existantes), version v1.0 en données (EXI-P5-2).
- [x] **Étape 2 :** la vérification E2E : toutes les commandes ACC-0-1 à ACC-5-2 passent ; liste visuelle complète (7 routes, un combat, une errance, une sauvegarde v8 migrée jusqu'à la version courante) (ACC-5-2).
- [x] **Étape 3 :** deux réglages d'équilibrage en données seules (un taux, un coût), diff de code vide entre les deux (ACC-5-3, EXI-P5-3).
- [x] **Étape 4 :** commit final `feat : la refonte majeure v1.0 (arbres, sorts, mode RPG, zones d'errance)` ; rapport de phase 5, `VERDICT: PASS`.

---

## La revue du plan (self-review)

- **Couverture de la spec** : EXI-MOD-1 à 4 (T0.2, T0.7), EXI-DEP-1 (T0.1), EXI-LANG-1 (contraintes globales), EXI-SAVE-1 (T0.6, T1.6, T2.7, T3.1, T4.2), phases 0 à 5 (T0.1 à T5.2) ; chaque ACC de la spec est cité dans la tâche qui le prouve.
- **Types cohérents** : `castSpell(data, spellId, cran, contexte)` et `pickZoneTargets(ligne, choix)` sont les deux signatures traversantes, citées à l'identique partout.
- **Points ouverts assumés** (le design tranche, le plan suit) : le gardien sur la vie (T3.1, donnée modifiable), la saveur des dénominations de crans (T2.4, chaînes de données), le mécanisme exact des seuils (T3.5), la zone contre un boss seul (T3.3, à noter au rapport).
- **Découpage** : chaque phase se termine par un dist jouable et des tests verts ; un relecteur peut rejeter une tâche sans rejeter sa voisine.
