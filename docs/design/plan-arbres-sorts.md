---
name: "plan-arbres-sorts"
title: "Plan d'implémentation : le grand chantier des arbres et des sorts (v1)"
type: "text/markdown"
---

# Plan d'implémentation : le grand chantier des arbres et des sorts (v1)

> **Pour l'agent qui exécute** : ce plan se déroule phase par phase, tâche par tâche, dans l'ordre. Une tâche = une préoccupation = un commit. Après chaque tâche, tu lances la commande de preuve et tu ne passes à la suivante que si elle passe. À la fin de chaque phase (lot), tu produis un mini-rapport : les ACC exécutés avec leur sortie, puis une dernière ligne `VERDICT: PASS` ou `VERDICT: FAIL <raison>`. Si un design bouge, tu ne devines jamais : tu appliques le document le plus récent poussé sur `main` et tu notes la question dans le rapport. **Interdits absolus** : éditer `dist.html` à la main, coder en dur une valeur de design dans `src/engine/`, sauter une migration de sauvegarde, revendiquer un succès sans la sortie de preuve.

**Goal :** livrer en une passe complète les sept lots de la spec `docs/design/spec-arbres-sorts.md` : rang N, tri des 189, ciblage par fiche type, stats RPG v0.47, mécanismes spéciaux, contenu v3, zones d'errance ; le jeu publié reste jouable à chaque commit.

**Documents normatifs** : la spec (le quoi et les ACC), `docs/design/design-arbres.md` (v17), `docs/design/refonte-sorts.md` (v2.3), `docs/arbitrages.md` (prime), `docs/design/spec-refonte-majeure.md` (les EXI transverses restent en vigueur). En cas de contradiction : l'arbitrage le plus récent gagne.

**Chaîne de preuve commune** (après toute tâche qui touche data ou moteur) :
`node build.mjs && node --test` (tout vert), `node tools/gen-tables.mjs` si des data ont bougé, `node smoke-ui.mjs` (≥ 158 checks, adapté et justifié si le nombre bouge), `node combat-digest.mjs dist.html 3000` (inchangé si le moteur de combat n'a pas bougé ; sinon nouvelle baseline documentée dans `docs/roadmap.md` avec la raison).

## Phase 0 : le prérequis et les corrections rapides

### T0.1 : le harnas de départ
Re-télécharge `main`, vérifie la chaîne complète au vert (build, 60 tests, smoke, digest `7dfab0a2…`) et note les chiffres : c'est la référence de non-régression du chantier. **Preuve : les quatre commandes, sorties collées.**

### T0.2 : le bug de ciblage (NOTÉ du 10/11)
Reproduis le sort de boost censé viser son lanceur qui ne proposait que des ennemis (smoke ou test), corrige par le lot 3 si le correctif propre appartient à la fiche type, sinon correctif ciblé immédiat. **Preuve : reproduction avant, test/échec corrigé après, digest inchangé.**

### T0.3 : le vocabulaire (NOTÉ du 10/11)
Le rôle attaque/support disparaît de la fiche et des libellés ; le champ moteur reste pour les lignes d'équipe (renommé en interne). **Preuve : smoke adapté (aucun « Attaquant »/« Soutien » affiché), digest inchangé.**

## Phase 1 : le rang N (lot 1 de la spec)

### T1.1 : les data N
`cards.json` : les 15 naissances passent `rarity: "N"`. `engine.json` : `RARITY_POWER.N` et `RANK.N` (sous C). Validateurs : aucune famille ne compte un N dans son échelle ; le rang N s'affiche en toutes lettres. **Preuve : `node --test` + regen tables.**

### T1.2 : l'éveil et la pierre
Mécanisme `eveil` typé dans le moteur (progression) : consomme 1 pierre d'éveil (défaut proposé, data `engine.json`), route N → C par `trees.json` ; la pierre est un objet droppé (donjons, rare) et donné par le défi du jour. **Preuve : test d'éveil (consommation, routage, la naissance reste jouable tant qu'elle n'est pas éveillée).**

### T1.3 : les drops et le début de jeu
Donjons : drops N à taux très bas ; au-dessus du N, communes au taux de référence puis décroissant avec la rareté (décision 8) ; 1 à 2 N offerts en début de jeu ; tirage borné par les déblocages. **Preuve : test de tirage semé (bornes attendues), digest recalibré et documenté (nouvelle baseline, la composition de l'équipe de départ bouge : attends-toi à un chiffre différent).**

## Phase 2 : la fin du tri des 189 (lot 2)

### T2.1 à T2.6 : les six étapes, une par commit
Dans l'ordre du design 14.5 : **Forge** (f1-f24, les brûlures, l'Appel des Foyers, le M Nuit de Cendres), **Bosquet** (g1-g21, la sève, les soins dryades, le M Racine-Monde), **Crypte** (k1-k30, les hurlements, les défunts, les chevaliers, la Fauchade Universelle actée), **Zénith** (z1-z30, les colonnes solaires, les hymnes, les renvois), **naissances et solos** (n1-n15 et les 21 solos), **divines** (d1-d18, les trois L Kairos/Écho/Ananké gardent leurs uniques).
Chaque commit : `fusion-map.json` du biome à 100 %, les sorts d'écoles nés dans `grimoire.json`, les uniques (base d'école + cran + delta, décision 3), les mots-clés manquants, le re-mappage des sorts connus pour les sauvegardes. **Preuve par commit : validateur 100 % sur le biome marqué trié, un monstre du biome caste son cran, tests verts.**

### T2.7 : l'homogénéité du grimoire
Contrôle automatique : aucune paire de sorts au même coût avec l'un strictement supérieur ; les communs retirés des cartes de famille (défaut proposé, le cas Pisteur du Bosquet). **Preuve : le contrôle passe sur tout le grimoire, digest recalibré si des charges de combat changent.**

## Phase 3 : le ciblage par fiche type (lot 3)

### T3.1 : la fiche type pilotante
La fenêtre d'action dérive ses cibles du champ `cible` du sort (soi, 1 allié, équipe, 1 ennemi, zone, tous) ; l'infobulle affiche rôle, école, ciblage, taux, base. **Preuve : un check smoke par ciblage ; le bug de T0.2 reste corrigé.**

## Phase 4 : les stats RPG v0.47 (lot 4) — POINT DE CALIBRATION OBLIGATOIRE

### T4.1 : la stat principale
`engine.json` : `PROFIL_STAT` par profil (guerrier/épéiste → attaque, assassin/voleur → agilité, mage/occultiste/prêtre → intelligence, gardien → vie). Le moteur résout mult × stat principale partout. **Preuve : ACC-3-1 rejoué (changer la donnée change la base, le code ne bouge pas).**

### T4.2 : l'affichage calculé
Partout (fenêtre d'action, infobulles) : le résultat prévu (mult × stat) remplace le multiplicateur seul ; décomposition en infobulle. **Preuve : smoke sur un sort en fenêtre d'action, la valeur suit la stat du lanceur.**

### T4.3 : la répartition dérivée
Règle : la stat principale du profil domine toujours la répartition ; correction des data fautives (cas relevé : l'évoluée des Rivières). **Preuve : test de dérivation sur toutes les cartes familiales, aucune carte mage avec agi > int.**

### T4.4 : l'ordre du tour et l'esquive
`beginRound` trie par agilité (équipe devant à égalité) ; l'esquive dérive de l'écart AGI, plafonnée, fusionnée au dodge de classe. **Preuve : ACC-3-4 rejoué.**

### T4.5 : le mana et les seuils
Data `engine.json` : mana max = palier + 2 × INT, recharge = palier + 1 par 2 INT (les deux plafonnés, défaut +50 % du palier) ; seuil de résistance = palier + INT/2 (défaut proposé). **Preuve : tests de plafond et de seuil ; le point de calibration avec Marc-Olivier (voir ci-dessous) valide les chiffres AVANT la publication.**

### T4.6 : la zone en combat
3 cibles contiguës de la ligne choisie (attaque par défaut, support en Tactique) ; le boss encaisse comme une seule unité. **Preuve : ACC-3-3 rejoué + un test boss.**

### T4.7 : la migration v13
Stats dérivées sur les exemplaires existants, fixture réelle v12, aucune perte. **Preuve : `node --test tests/migration.test.js`.**

### Point de calibration (AVEC Marc-Olivier, avant de publier la phase)
Le recalibrage complet du digest (3000 combats) avec les nouvelles formules ; on ajuste les data (jamais le code) jusqu'au chiffre cible convenu ensemble ; la nouvelle baseline est documentée dans la roadmap avec sa raison.

## Phase 5 : les mécanismes spéciaux (lot 5)

### T5.1 : les types d'évolution
`regression` (Éclat de régression, drop cran Difficile, palier R, 100 % sorts + 10 % stats), `chute`, `malediction`, `evenement` (Morzak, Isaure, équilibre avec la condition par défaut : posséder un ange L et un démon L), `conversion funèbre`, `fusion`, `secrete` : moteur + data, aucune valeur en dur. **Preuve : un test par type, déclenché uniquement sous sa condition, aucune carte perdue.**

### T5.2 : l'UI des flux
Confirmations (Éclat, sacrifice, fusion), notification de malédiction, scène d'événement, secrètes floutées « ?? », verrou SR en fiche. **Preuve : smoke des nouveaux flux.**

## Phase 6 : le contenu v3 (lot 6) — PRÉREQUIS BLOQUANT

### T6.0 : le document familles v3
IL EST BLOQUANT : tant que le document familles et races v3 n'est pas poussé sur `main` (le canvas d'origine est introuvable), la phase 6 ne démarre pas. Les phases 1 à 5 peuvent se dérouler avant ; si le document n'arrive pas, on reconstruit sa matière depuis les sections v3 de `docs/design/spec-design.md` et on la fait valider par Marc-Olivier.

### T6.1 à T6.x : les cartes, famille par famille
Un commit par famille (ou par lot de familles) : ~100 cartes, 10 renommages, échelles complètes, ids stables, noms verrouillés. Les renommages actés dès maintenant : « l'Écuyer Fervent » (entrée du paladin dans la Légion), « le Jeune Séraphin » (p1, ex « Ange Éveillé » ; l'id ne bouge pas, les sauvegardes intactes). **Preuve par commit : validateur, regen tables, paliers complets.**

### T6.y : les sorts des nouvelles familles
Gabarit : 6 sorts de lignée (2/3/5/9/14/20✦), un rôle-cadre, le ciblage qui s'élargit. Familles : Crépuscule, vol, zèle, école des invocations, les trois divines, anges dévoyés, lignées d'accueil des Enge. **Preuve : tests des échelles, smoke du glossaire.**

### T6.z : les images
Campagne des nouvelles cartes (le brief du document v3, section 16), intégration des 29 références au manifeste. **Preuve : planches de contrôle, manifeste ASCII ≤ 30 Ko/art, dist jouable.**

## Phase 7 : les zones d'errance (lot 7)

### T7.1 : les enseignements
Chaque zone porte ses crans II/III apprenables et ses sorts d'école neufs ; le grimoire appris persiste (migration si la forme change), survit à l'évolution. **Preuve : ACC-4-3 rejoué (un cran appris persiste et survit).**

### T7.2 : la cadence et la vérification visuelle
La chaîne zone/donjon valide (validateur) ; une session complète visuelle : le grimoire grossit à l'écran. **Preuve : ACC-4-1, ACC-4-4.**

## Phase 8 : l'audit final et la publication

1. Régénérer l'audit (`node tools/audit.mjs > docs/audit-sorts.md` s'il existe, sinon `tools/gen-tables.mjs`), régénérer les tables, mettre à jour `docs/roadmap.md` (état, historique, baselines) et `docs/arbitrages.md` (les points tranchés en cours de route, datés).
2. Chaîne de preuve complète : build, tests, smoke, digest final documenté, `node --check` du bundle.
3. Publication : push, vérifier le workflow Pages vert, vérifier le jeu en ligne (chargement d'une sauvegarde ancienne incluse).
4. Rapport final : les VERDICT des huit phases, la liste des defaults proposés confirmés ou ajustés en cours de route, les questions restées ouvertes.
