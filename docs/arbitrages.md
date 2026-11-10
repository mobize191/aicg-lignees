# Journal des arbitrages et décisions

> Règle : toute décision de design vit ici avec sa **date** et son **statut** (`ACTÉ` = s'applique aux data et au jeu ; `PISTE` = exploré, pas codé ; `PROPOSÉ` = en attente de Marc-Olivier). On ne contredit jamais un arbitrage ACTÉ : on propose une révision datée en dessous.

## 2026-11-10 : ACTÉ — le tri du Bosquet Profond (T2.2 du grand chantier)

- **21 signatures résolues : 5 uniques + 16 fondues** (gabarit des Marées, 14.5 étape 2). Le biome `bosquet` est marqué `trie` dans `fusion-map.json`, le validateur couvre 100 % de ses signatures, le test T2.1-b interdit toute fusion vers un cran vide.
- **Une ligne d'école naît du Bosquet** : `Sève Rongeuse` (le Mauvais Œil, malus, mot-clé sève déjà présent dans keywords.json ; taux normalisés sur l'échelle des crans 25/20 % × 2 tours, crans I-II ; la zone et le rang tous attendent un autre biome ou la zone d'errance). L'Étreinte des Profondeurs I n'est plus vide (30 %, 1 ennemi : Étreinte de Racines g1).
- **Les 5 uniques suivent la décision 3** (base d'école + cran + delta) : Aube Foliaire (g7, base Lame d'Écume IV + la lumière rend au lanceur 15 % des dégâts ; le vol de vie se câble en Phase 5), Racine-Monde (g8, le M, base Lame d'Écume IV + sève 15 % × 2 tours), Nuée de Spores (g16, base Sève Rongeuse IV + la sève ronge 3 tours), Première Clarté (g18, base Onde Consacrée III + rend à la lumière l'âme tombée la plus grande, 60 % de ses PV), Nuit des Sèves (g21, base Lame d'Écume III + sève 15 % × 2 tours). Première unique à base d'entrée d'école (Onde Consacrée, le geste le plus évocateur des dryades) : le test T2.2 admet école et entrées comme bases.
- **Affectation des fondues** (règle 3, la largeur native décide) : la Lame prend g2 (I), g3/g4 (II), g5/g6/g20 (III, le prisme divise le rayon, le poing du colosse et les lames de branchage fauchent la zone) ; l'Étreinte g1 (I) ; la Barrière g12 (I, 1 allié) et g11 (III, la voûte couvre l'équipe) ; le Baume d'entrée g9 (I) et g17 (III) ; l'Appel g10 (I, 1 renfort) et g13 (II, 2 renforts sylvestres) ; la Sève Rongeuse g14 (I) et g15 (II) ; le Chant g19 (IV, le slow d'Ombre Tissée porte à toute la ligne, contrôle de masse, précédents e27/f17).
- **Migration v14** (EXI-T-4) : le mécanisme de re-mappage est factorisé (`triRemap` dans migrate.js) et rejoué à chaque biome qui passe trié ; une save v13 avec des sorts Bosquet legacy les re-mappe sur les crans, la Crypte non triée garde son chemin legacy (testé).
- Preuve : 80/80 tests (4 neufs : tri du Bosquet, uniques décision 3, cast des crans, migration v13 -> v14 ; le test anti cran vide couvre le nouveau biome), smoke 164 checks, digest `7dfab0a2…` **inchangé** (couche data et sauvegarde, aucune maths de combat).

## 2026-11-10 : ACTÉ — le tri de la Forge Cendrée (T2.1 du grand chantier)

- **24 signatures résolues : 5 uniques + 19 fondues** (gabarit des Marées, 14.5 étape 1). Le biome `forge` est marqué `trie` dans `fusion-map.json`, le validateur couvre 100 % de ses signatures.
- **Deux lignes d'école naissent de la Forge** : `Colonne de Feu` (le Mauvais Œil, malus, mot-clé brûlure ; taux normalisés sur l'échelle des crans 25/20/15 % × 2 tours, zone au cran III, le IV attend un autre biome) et `Fournaise Invoquée` (l'Appel, invocation ; la largeur compte les renforts : 1 au cran I avec f5, 2 au cran II avec f23).
- **Les 5 uniques suivent la décision 3** (base d'école + cran + delta) : Nuit de Cendres (f13, le M, base Lame d'Écume IV + brûlure 15 % × 2 tours), Fournaise Éternelle (f12, base Fournaise Invoquée II + renaissance sans limite), Linceul de Suie (f18, base Étreinte des Profondeurs IV + la ligne entière figée), Fournaise de Calcine (f21, base Colonne de Feu III + la brûlure dure 3 tours), Colère de Vulcain (f22, base Lame d'Écume III + brûlure 15 % × 2 tours). Les 7 uniques des Marées (format antérieur) seront resynchronisées sur ce format au T2.7 (contrôle d'homogénéité du grimoire).
- **Affectation des fondues aux crans** (règle 3) : la largeur native décide, le palier règle les litiges. f1/f2/f14 (C) et f3/f24 (UC) sur la Lame I-II ; f4/f8/f11 (R) au cran II ; f6 Éruption (UR, zone) au cran III ; f17 Tissage Ensorcelé (UR étroit, 6✦ ×2) monte au cran IV de Mélodie envoûtante (précédent e27) ; f16 Filet de Suie au cran II de l'Étreinte (2 ennemis) ; f7 Onguent de Suie greffe le cran I d'Onde Consacrée ; f9 Peau de Lave au cran I de la Barrière (1 allié), f10 Cendre Protectrice au cran II (2 alliés) ; f15/f19/f20 sur les crans I/II/III de Colonne de Feu.
- **Migration v13** (EXI-T-4) : les sorts connus d'un biome nouvellement trié se re-mappent sur les crans de fusion (mécanisme v10 réutilisé, générique par biome) ; les biomes non triés gardent leur chemin legacy (testé sur le Bosquet).
- Preuve : 75/75 tests (5 neufs : tri, uniques décision 3, cast du cran, migration v13, allowlist), smoke 164 checks, digest `7dfab0a2…` **inchangé** (couche data et sauvegarde, aucune maths de combat).
- **Suivi (T2.1-b, même date)** : les crans que la Forge remplit ne sont plus marqués vides. Étreinte des Profondeurs II reprend l'échelle 14.3 (25 % × 1 tour, 2 ennemis, Filet de Suie f16) et Barrière de Corail II aussi (×1.5, 2 alliés, Cendre Protectrice f10). Un test interdit désormais toute fusion vers un cran vide ou absent (EXI-P2-3) ; les entrées d'école sans crans restent tolérées (recâblage Phase 3, noté).

## 2026-11-10 : ACTÉ — le rôle attaque/support sort de l'affichage (T0.3 du grand chantier)

- La grille identité de la fiche passe à **Classe / Élément / Rareté** : le fstat « Rôle » disparaît. Le bloc des sorts croisés change de libellés : titre « Sorts croisés » (plus « (rôle opposé) ») et prose en gestes (panse les blessés, frappe au poing), plus de camps attaquants/supports.
- Le champ moteur `role` **reste** : il trie les lignes d'équipe (`team.attaque` / `team.support`), alimente le Souffle Croisé et le soin croisé. Il est désormais purement interne : aucune interface ne l'affiche. Le renommage du champ en base a été jugé inutile (churn data + moteur sans aucun gain visible, risque digest) ; le vocabulaire d'affichage est le seul concerné.
- Aucune mécanique ne change : preuve par le digest **inchangé** (`7dfab0a2…`, 476/3000, 0 exception), 71 tests, smoke 164 checks (grille à 3 fstats, aucun « Attaquant »/« Soutien » affiché).

## 2026-11-10 : ACTÉ — le boost vise son camp (T0.2 du grand chantier)

- Le bug NOTÉ (sort de boost qui ne proposait que des ennemis) est corrigé au plus près : la fenêtre d'action dérive le camp de ciblage du champ `cible` du sort (`soi`, `1 allié`, `l'équipe`, `1 ennemi`, `zone`), pas du rôle de l'unité. Les sorts sans fiche de ciblage gardent le comportement historique (attaquant : ennemis, support : alliés).
- `Discipline de Ligne` (soi) : aucune liste de cibles, le sort se pose sur son lanceur. `Ferveur Céleste` (1 allié) : la fenêtre propose vos cartes (le Démon n14, attaquant divin, en est le cas réel).
- Côté moteur, un cast **tactique** de sort à camp allié applique `atkBuff += mult - 1` (le multiplicateur du sort devient le bonus : 1,5 -> +50 % ATK sur la prochaine frappe), au lanceur ou à l'allié désigné. Le coût de mana est bien dépensé, un événement `buff` animé est émis.
- **Le chemin Auto (IA et digest) ne bouge pas** : sans pas tactique, le sort reste un coup sur l'ennemi. Le lot 3 (fiche type complète) étendra la sémantique à tous les rôles et recâblera l'Auto proprement, avec recalibrage du digest à ce moment-là.
- Preuve : repro avant (2 tests rouges), 71/71 tests, smoke 162 checks (section 51 neuve), digest `7dfab0a2…` inchangé (476/3000, 0 exception).

## 2026-11-10 : ACTÉ — l'acquisition du rang N (T1.3 du grand chantier)

EXI-N-4 posé. Trois décisions d'application :

1. **Naissances sauvages (défaut proposé, calibrable)** : chaque étage de donjon vaincu offre `N_DROP_RATE = 0.02` (2 %) de chance qu'une naissance se joigne directement au joueur ; le tirage (`drawNaissance` moteur, filtre `cardAvailable` côté UI) reste borné par les déblocages et n'exclut jamais la porte divine (n13-n15 en C). Multiplié par le facteur tactique et le butin comme les autres drops.
2. **La table du jeton de génération passe en data et devient CONFORME à la décision 8** (`JETON_RARITY`) : à chaque palier de donjons bouclés, la commune garde le taux de référence (50 %) et le taux décroît avec la rareté. **Changement assumé** : les anciens taux codés en dur favorisaient la peu commune aux paliers hauts (palier 3 : 45/50/5, palier 5 : 30/60/10 en C/UC/R) ; ils deviennent 50/45/5 et 50/40/10. L'économie des jetons sera revue plus tard (décision 8, caveat acté).
3. **Départ : 2 N offerts (défaut proposé)** : l'Épéiste Novice (n1) et le Prêtre Novice (n3) rejoignent la collection au premier lancement, jouables immédiatement, en plus des 5 jetons.
4. **Preuve** : 68 tests (tirage semé : pool de naissances, bornes de la table du jeton sur 1000 tirages, décroissance par palier, `N_DROP_RATE` < 5 %), smoke 158, digest `7dfab0a2…` **inchangé** : les équipes du digest sont fixes et les maths du combat ne bougent pas ; la nouvelle baseline attendue au plan T1.3 ne s'applique pas (aucune équipe de départ simulée par le digest).

## 2026-11-10 : ACTÉ — la pierre d'éveil (T1.2 du grand chantier)

L'éveil d'une naissance (rang N) consomme des **pierres d'éveil**, plus des éclats. Le coût interim `EVO_COST.N` (éclats bruts) est retiré : `evoCostOf` retourne un coût TYPÉ `['pierre', EVEIL_COST]` pour le rang N, les autres rangs gardent leurs éclats.

1. **Coût** : `EVEIL_COST = 1` pierre par éveil (le défaut proposé de la spec, calibrable). Hors éléments : la naissance neutre paie sans élément.
2. **Sources** : chaque boss d'étage (étages 5, 10, final) lâche une pierre à `PIERRE_DROP_RATE = 0.15` (donjons, rare) ; le défi du jour en donne **une par victoire**. La Forge affiche la réserve.
3. **Portée** : la voie choisie, l'Ascendance et les sorts accumulés ne changent pas ; le routage N → C passe par `trees.json` (inchangé) ; les communes divines (Ange, Démon, Éveillé du Seuil, rang C) continuent de payer en éclats.
4. **Preuve** : 66 tests (dont éveil : coût typé, routage par les arbres, la naissance reste jouable sans être éveillée), smoke 158, digest `7dfab0a2…` inchangé (aucune maths de combat touchée).

## 2026-11-10 : ACTÉ — le rang N migré (T1.1 du grand chantier)

Lot 1 du grand chantier, appliqué aux data et au dist. Les 12 naissances humaines, monstres et mystiques passent au rang **N** (sous C) ; les 5 Bestiau deviennent les 5 **Embryons** (renommage acté v15, ids inchangés n5-n9).

1. **Périmètre N** : n1-n12 passent `rarity: "N"` ; **n13-n15 restent C** (Ange, Démon, Éveillé du Seuil : communes divines, cibles d'éveil du futur Esprit Divin N du lot contenu).
2. **Tables moteur** : `RARITY_LABEL.N = "Naissance"`, `RARITY_POWER.N = 0.9` (calibrable), `RANK.N = -1`, `EVO_COST.N = ["brut", 3]` (interim identique à C ; la pierre d'éveil remplace ce coût en T1.2).
3. **Portée de `RARITY_POWER` confirmée** : elle nourrit l'INDICE de force (recommandé vs équipe), pas les mathématiques du combat. Les stats brutes des naissances ne changent pas : le rang N est une étiquette de progression et un poids d'indice, pas un nerf. Le **digest reste `7dfab0a2…`** (476/3000, 0 exception) : les combats sont identiques au bit près.
4. **Acquisition** : les jetons de naissance (humain, race, monstre, mystique, divine) et le défi du jour tirent la naissance de la race (N ; C pour la porte divine tant que l'Esprit Divin n'existe pas), jamais d'autres communes. Les cartes archivées (Ange Gardien, ex-p2) sont exclues des tirages du défi et de la Forge (correctif au passage).
5. **Affichage** : chip et carte `r-N` (gris bleuté), glossaire des raretés ouvert sur le rang N, textes courants passés de « tous communs » à « naissances », changelog v1.1.
6. **Preuve** : build OK, 64 tests (4 nouveaux rang N), smoke 158 checks, digest inchangé, tables regénérées.

## 2026-11-10 (grand chantier, les neuf ouvertes) : ACTÉ — les décisions ouvertes du lot 8 sont tranchées

Réponses de Marc-Olivier aux neuf points ouverts ; la spec et le plan du grand chantier les intègrent (`docs/design/spec-arbres-sorts.md` et `plan-arbres-sorts.md`).

1. **Sort L d'Argus : « Mur Éternel »** (remplace la proposition « Assise Éternelle » ; la règle v0.47 s'applique : le sort L ne répète plus le nom de sa carte).
2. **Sort L de Maïa : le clin d'oeil reste** (« Maïa : Cœur du Bosquet » garde son nom malgré la M du Vivant).
3. **Les uniques des L et M : une base d'école + une particularité** — chaque L/M garde un sort unique, mais il dérive d'une base commune d'école (un cran de largeur et de puissance) enrichi d'un delta (taux, effet additionnel, cible particulière). Le geste se reconnaît d'une carte à l'autre, la particularité est la récompense du nom.
4. **Les invocations de l'Appel (ACTÉ)** : 3 invocations maximum par invocateur ; les PV du renfort sont plafonnés à 20 % des PV max de l'invocateur ; pas de durée maximale ; si l'invocateur tombe, ses invocations tombent avec lui ; les renforts apparaissent en mini-cartes sur le plateau de jeu.
5. **La zone : la ligne au choix (ACTÉ), le triangle en piste** — la zone frappe 3 cibles contiguës de la ligne choisie (attaque par défaut, support en Tactique) ; le triangle qui touche la ligne avant et la ligne arrière est une PISTE pour plus tard. Le boss encaisse la zone comme une seule unité (pas de multi-slot pour l'instant) : pas de multiplication des dégâts.
6. **Le maillon du paladin dans la Légion Solaire : « l'Écuyer Fervent »** (proposition de Marc-Olivier, avis favorable de l'agent : l'échelle Écuyer → Croisée de l'Aube → Aurorine, Lance de l'Aube est régulière, la ferveur porte le zèle). Palier exact à poser au lot contenu.
7. **Le dédoublonnage divin : « le Jeune Séraphin »** — la carte p1 « Ange Éveillé » est renommée « Jeune Séraphin » (voie de l'éveil du service) ; l'Éveillé du Seuil (n15) garde son nom.
8. **Les drops au-dessus du rang N (ACTÉ)** : les communes tombent à un taux de référence, le taux décroît à mesure que la rareté monte (UC, R, SR, UR de plus en plus rares) ; cette économie sera revue plus tard à mesure que le jeu évolue.
9. **Le mana de l'intelligence (ACTÉ)** : +2 points de mana max par point d'intelligence ; +1 point de mana rechargé par tour tous les 2 points d'intelligence. Plafonds à calibrer au lot v0.47 (défaut proposé : bonus plafonnés à +50 % du palier, pour éviter que les L cumulent le mana de palier et le bonus d'intelligence sans limite).

**Défauts proposés dans la spec, à confirmer au fil des lots (pas bloquants)** : le coût de l'éveil N → C (1 pierre d'éveil) ; le seuil de résistance (palier de la cible + moitié de son intelligence) ; la stat principale du gardien (la vie, proposition maintenue) ; les noms des sorts de race (Instinct Sauvage, Ferveur Céleste conservés) ; la condition de l'événement d'équilibre (posséder un ange L et un démon L) ; les communs retirés des cartes de famille (le cas Pisteur du Bosquet).

## 2026-11-10 (retours du grand chantier arbres + sorts) : ACTÉS et NOTÉS

Retours de Marc-Olivier, consolidés avec l'audit du grand chantier (roadmap). Statuts : deux décisions ACTÉES, trois points NOTÉS à corriger pendant le chantier.

**ACTÉ — le mana total monte avec l'intelligence**, en plus de la montée naturelle par palier (familiales 8/11/14/22/30/40, autres 10). Révision datée du « le mana par palier reste » (design sorts v2.3, section 10) : l'intelligence devient le second levier du mage et du prêtre, au-delà des mults. Formule exacte à calibrer au v0.47 (par tranche d'intelligence et plafonné, pour ne pas gonfler les combats longs) ; le digest sera recalibré.

**ACTÉ — l'affichage des sorts montre le résultat calculé** (dégâts ou soin prévus selon les stats du lanceur) plutôt que le multiplicateur seul ; la décomposition (mult × stat principale) reste accessible en infobulle. Dépend du câblage de la stat principale (v0.47) : câbler la base d'abord, l'affichage suit.

**ACTÉ le principe du tri d'homogénéité** : aucun sort strictement dominé au même coût ne reste au grimoire (cas relevé : Pisteur du Bosquet porte Frappe Précise 2✦ ×1.3 et Trait d'Épine 2✦ ×1.4, le second domine le premier gratuitement). La règle précise (retirer les communs des cartes de famille, ou fondre le commun comme cran I de la ligne d'école) se tranche dans le tri des 189, biome par biome.

**NOTÉ — le rôle attaque/support ne s'affiche plus** : restant d'affichage (fiche, libellés) alors que la distinction a été retirée du vocabulaire joueur il y a plusieurs versions. Le champ moteur reste utilisé pour les lignes d'équipe (attaque/support) et la composition des combats ; à renommer/redéfinir en interne (emplacement), à retirer de la fiche et de l'UI.

**NOTÉ — bug de ciblage** : un sort de boost censé viser son lanceur ne proposait que des ennemis et infligeait des dégâts. Symptôme : la fenêtre d'action ne lit pas la fiche type du sort (rôle, école, ciblage, taux). La fiche type doit piloter la résolution ET l'UI ; à reproduire puis corriger avec le chantier sorts.

**NOTÉ — répartition agi/int des lignées** : une évoluée de lignée mage affiche plus d'agilité que d'intelligence (cas relevé : l'évoluée des Rivières depuis Mage Novice) alors que tout son parcours est celui d'un mage. La répartition doit dériver du profil (la stat principale domine toujours) ; correction de data + règle de dérivation au v0.47.

## 2026-11-10 (revue de cohérence) : ACTÉ — l'Ange (n13) s'éveille en Ange Éveillé (p1), pas en Huissier

Décision de Marc-Olivier : à sa première évolution, **l'Ange devient l'Ange Éveillé** (`p1`, effet `remplace` de `trees.json`), conformément au rework des arbres v17 — et non l'Huissier de l'Entre-Deux (`d3`) que portait encore `evolutions.json`.

- `data/evolutions.json` : `n13` → `p1` (voie « l'éveil du service — l'Ange Éveillé ») ; la cible `d3` disparaît des choix de l'Ange. Le Démon (n14 → d8) et l'Éveillé du Seuil (n15 → d14) entrent toujours dans les webs divins au palier UC.
- `data/engine.json` : `RACE_DIVINE_IDS` reçoit `p1` et `p2` (l'Ange Éveillé et l'Ange Gardien archivé étaient classés « monstre » par `raceOfCard` — cran 10 % au lieu du cran divine 30 %).
- L'Ange Gardien (`p2`, archivé) reste en données pour les vieilles sauvegardes ; il disparaît de l'équipe à l'éveil (`disparait`).
- Les trois portes de l'Ange Éveillé (coloration, voie céleste, mauvaise volonté) sont posées dans `trees.json` ; leurs maillons restent à dessiner (futur contenu).
- Baselines après migration : digest inchangé (`7dfab0a2…`, 476 victoires), smoke 158 checks, 60 tests.

## 2026-11-10 (retours terrain) : ACTÉ — combat v2.1 : rail d'ordre, auto-run en Tactique, actions détaillées, fiche complète

Quatre retours de Marc-Olivier après la v2, corrigés en présentation uniquement (`src/ui.js`, `src/shell.html`, `src/data.js`, `data/engine.json` pour le vocabulaire d'affichage) — le moteur, l'équilibrage et le digest ne bougent pas (`7dfab0a2…`, 476 victoires ; smoke 158 checks ; 60 tests).

- **Rail d'ordre du tour** : au-dessus du plateau, tout le monde dans l'ordre d'action du moteur (agilité décroissante, équipe d'abord à égalité) ; lueur sur vos cartes, acteur en cours doré, tombés grisés. En Auto comme en Tactique, le rail suit chaque acteur (le mode Auto passe par le même pas-à-pas `beginRound`/`stepRound` que `resolveTurn`, événements identiques).
- **Combat auto en Tactique** : le combat démarre seul, la fenêtre d'action surgit au tour de vos cartes, le tour se joue, le suivant repart seul ; bouton ⏸ Pause (fige entre les tours) / ▶ Lancer le tour. Les tours tactiques comptent toujours au prorata intégral (`combatTally.manual`). Anti-runs fantômes conservés : chaque chaîne est capturée par `combatGen` et coupée au re-rendu.
- **Actions détaillées au tour du joueur** : chaque action porte son badge de type (Dégâts, Soin, Bouclier, Invocation, Contrôle, Malus, Boost, Manip — libellés dans `data/engine.json` `SPELL_ROLE_LABEL`, rôle venant de `data/schools.json`), son coût, sa ligne méta « école · ×puissance · zone/cible » et le texte du sort. Le grimoire (`data/grimoire.json`) porte désormais école/rôle/cible jusqu'à l'UI (`src/data.js` `legacySpell`).
- **Fiche complète** : le doublon de statline est corrigé ; la fiche montre la statline vivante (ATQ, PV, bouclier, mana, AGI, INT), la grille identité (classe, élément, rareté en toutes lettres `RARITY_LABEL`, rôle), les oppositions (ou « ⚪ Neutre » pour les naissances), et le grimoire complet en sort détaillés.

### ACTÉ : les naissances restent jouables en combat ; le rang N est une migration data à part

Précision demandée par Marc-Olivier : les Novices s'affichent « C » alors que le rework a acté un **rang N des naissances (sous C, hors lignée, hors drops, s'éveille en la commune C)**. Décision : (1) le rang N est confirmé ACTÉ (il est dans le design du rework, jamais migré dans les data — les naissances ont encore `rarity: "C"`) ; (2) les naissances restent **jouables en combat** — ce sont les cartes de départ du jeu, les interdire casserait le premier donjon ; « hors lignée, hors drops » ne veut pas dire « hors combat » ; (3) la migration (rareté `N`, `RARITY_POWER`/`RANK`, éveil N→C, exclusions des drops) est un chantier data à part qui fera bouger le digest — documenté dans `docs/roadmap.md`.

## 2026-11-10 : ACTÉ — mise à jour UI du combat v2 (implémentée dans src/, dist régénéré)

Le design cible de `docs/regles-jeu.md` §7 (maquettes combat/fiches) passe en **implémenté**, uniquement en présentation (`src/ui.js`, `src/shell.html`) — le moteur, les data et l'équilibrage ne bougent pas (digest 3000 combats inchangé : `7dfab0a2…`, 476 victoires ; smoke 142 checks ; 60 tests).

- **Ciblage interactif v2** : au choix d'une action, les cibles éligibles s'illuminent sur le plateau (contour doré pulsant, pastille, curseur de visée) ; un clic désigne et résout ; la zone de 2 (carte + voisine contiguë) suit le survol ; bouton **Annuler** ramène à la fenêtre d'action ; coût mana et zone restent visibles pendant la désignation ; un clic hors cible ne fait rien.
- **Pied de stats** sur chaque pion de combat : PV, ATQ, mana en actuel/total, plus icône par état actif (bonus vert, malus rouge, bouclier bleu) ; carte tombée grisée.
- **Fiche plein cadre** : l'illustration couvre la carte verticale (bord doré arrondi), voile dégradé sombre en bas, nom, sous-titre « classe · élément · rareté », stats en bas (PV rouge, mana violet) ; stats détaillées et sorts dessous.
- **Hors périmètre (inchangé)** : la Garde du Gardien (PISTE v1.1) et le grimoire élémentaire (PISTE v2) restent des pistes.
- Accessibilité : `prefers-reduced-motion: reduce` coupe le pulse ; cibles de tap >= 44px.

## 2026-11-10 : arbitrages de la session design (PUSHÉS dans les data)

### ACTÉ : la classe Invocateur disparaît

- L'`Invocateur de Fournaise` (a21) devient **Mage** : les invocations passent par l'école de l'Appel (déjà ouverte Mage + Occultiste).
- Les 8 monstres `Invocateur` sont reclassés : `f5` Invocateur des Foyers, `f12` Gardien des Foyers, `f23` Maître des Foyers, `g13` Semeur Sylvestre, `g10` Druidesse des Sèves deviennent **Mage** ; `k7` Archiliche des Caveaux, `k15` Éveillé des Caveaux, `k16` Liche des Caveaux deviennent **Occultiste** (nécromancie).
- Le registre `engine.CLASSES` garde `Invocateur` en réserve (aucune carte ne la porte ; synergie `Invocateur` dormante). Le retrait complet du registre attend la v3.

### ACTÉ : le Gardien-Mécanique devient Guerrier

- `s4` passe de Prêtre à **Guerrier** ; le Rempart s'ouvre au **profil Guerrier** (`schools.rempart.ouvrePar.profils` : `["Guerrier"]`).
- La synergie Guerrier s'applique donc à la carte qui protège le mieux : cohérent avec son rôle.

### ACTÉ : l'Entrave s'ouvre au Mage ET à l'Occultiste

- `schools.entrave.ouvrePar.profils` : `["Mage", "Occultiste"]`. Le contrôle devient une affaire de lanceurs, pas une exclusive d'ombre.

### ACTÉ : sorts d'écolage communs renommés (noms de métier, pas de monstre)

- `Morsure d'Écume` → **Lame d'Écume**, `Chant de Sirène` → **Mélodie envoûtante**, `Carapace de Corail` → **Barrière de Corail**, `Guet des Fonds` → **Vigie des Flots**.
- Appliqué dans `grimoire.json` (4 sorts) et `monsters.json` (soloSpell de e8 et e20). **Les ids restent inchangés** (`morsure-decume`, `chant-de-sirene`...) : les sauvegardes et les fusions (`fusion-map.json`) sont préservées.

### ACTÉ : règles de rang au combat

- La protection de l'arrière ne couvre **pas** les attaques de zone (attaques et sorts ciblés seulement).
- La formation (3 devant + 2 derrière ou 2 + 3) est **figée au départ** du combat ; l'action de repli reste une piste v1.1.
- Les monstres suivent les mêmes règles de rang (leurs classes existent dans les données).

### PISTE v1.1 : la Garde du Gardien

- Tant que le Gardien tient à l'avant, l'adversaire ne peut pas viser la ligne arrière. À calibrer avant actage (risque : verrouillage de partie).

### PISTE v2 : le grimoire élémentaire (l'élément porte le sort, pas la carte)

- Idée : `Barrière de Corail` resterait un sort **Eau** même joué par une carte Feu ; choisir une voie débloquerait les sorts de l'élément de cette voie ; la carte garderait son élément de naissance comme **affinité** (bonus léger quand le sort joué partage son élément).
- Pour : cohérence du lore, liberté de build, le grimoire devient le pivot de progression, l'interaction élémentaire se calcule sur le sort.
- Contre : l'identité de carte s'amenuise, équilibrage par élément × rôle à refaire (chaque voie doit couvrir dégâts, soin, contrôle, bouclier).
- Statut : piste ouverte, notée dans les maquettes de la page fiches et du combat. **Pas de décision actée.**

### Impact d'équilibrage constaté

- Baseline digest **3000 combats : `7dfab0a295eaa1dab1f70e039b782e0ef06285fdd0fdf3e09d65304b966de5aa`** (476 victoires, 0 exception, 0 marathon), à comparer à la précédente `c5ab2af1…` (534 victoires). La baisse vient des reclassifications (esquives et frappes de l'arrière par classe). À surveiller au recalibrage des caractéristiques v0.47 : c'est une mesure, pas une régression de conformité (tests et smoke verts).

## Décisions antérieures

Voir `docs/historique/` (rapports des phases de la refonte) et `docs/design/` (specs normatives). En bref : moteur pas-à-pas v0.46, refonte majeure exécutée (phases 0 à 5), campagne d'illustrations DreamShaper XL livrée (231 arts + 5 fonds), caractéristiques (FOR/VIE/AGI/INT) actées pour la v0.47 avec formules à calibrer avec Marc-Olivier.
