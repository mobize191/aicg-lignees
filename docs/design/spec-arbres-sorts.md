---
name: "spec-arbres-sorts"
title: "Spec : le grand chantier des arbres d'évolution et des sorts (v1)"
type: "text/markdown"
---

# Spec : le grand chantier des arbres d'évolution et des sorts (v1)

**Date :** 10/11/2026. **Statut :** validée par Marc-Olivier. **Décideur :** Marc-Olivier BIZE.

Cette spec couvre la fin de l'implémentation des arbres d'évolution v17 et de la refonte des sorts v2.3, en une passe complète : la migration du rang N, la fin du tri des 189 signatures, le ciblage par fiche type, les stats RPG v0.47, les mécanismes spéciaux d'évolution, le contenu v3 et les zones d'errance. Elle dit **quoi** et **comment on le prouve** ; le **comment détaillé** est dans le plan.

## 1. Sources normatives et priorité

| Le document | Son rôle | Priorité |
| --- | --- | --- |
| `docs/design/design-arbres.md` (v17) | la référence des arbres : races, éveils, voies, rang N, mécanismes | normative pour les arbres |
| `docs/design/refonte-sorts.md` (v2.3) | la référence des sorts : écoles, crans, fusion, acquisition | normative pour les sorts |
| `docs/design/inventaire-sorts.md`, `inventaire-cartes.md` | l'existant embarqué (les 189 signatures, le catalogue) | normatif pour l'existant |
| `docs/design/spec-refonte-majeure.md` et `plan-refonte-majeure.md` | l'architecture (data/ + src/ + build), les EXI/ACC transverses | normatif pour la structure, restent en vigueur |
| `docs/arbitrages.md` | les décisions datées, dont les neuf tranchées du 10/11 | prime sur tout en cas de contradiction |
| le document familles et races v3 | la référence du contenu v3 (~100 cartes, brief images section 16) | **PRÉREQUIS MANQUANT : à repousser sur main avant le lot 6** (le canvas d'origine n'est plus accessible) |

En cas de contradiction : l'arbitrage ACTÉ le plus récent gagne, puis le design le plus récent poussé sur main. Aucune exigence ne demande de coder en dur une valeur de design dans `src/engine/`.

## 2. L'état de départ (audit du 10/11)

**Câblé et prouvé :** les 4 arbres de race (éveils, crans 0/10/20/30 %, effet « remplace » de l'Ange et ses trois portes), les 8 écoles ouvertes par profil ou par voie, le grimoire (2 communs, 4 sorts de race, 5 entrées, 42 sorts de lignée, 6 sorts d'école à crans, 7 uniques), la fusion des Marées (30/30 dans `fusion-map.json`), les mots-clés (brûlure, corrosion, poison, sève), la résolution par crans avec largeurs, 5 zones d'errance squelettes (rencontres + récoltes), agi/int sur les cartes, migrations de sauvegarde v8 → v12.

**Manquant :** le rang N (rareté des naissances, échelles, éveil, drops), le tri des ~159 signatures restantes (Forge, Bosquet, Crypte, Zénith, naissances, solos, divines), les enseignements des zones, la stat principale des mults, la zone en combat, les mécanismes spéciaux (régression, chute, malédiction, événements, conversion funèbre, fusion, secrets, verrous), le contenu v3, et les bugs notés du 10/11 (ciblage du boost, rôle attaque/support encore affiché, répartition agi/int des lignées mage).

## 3. Les décisions tranchées (10/11, ACTÉES)

1. **Sort L d'Argus : « Mur Éternel »** (le sort L ne répète plus le nom de sa carte).
2. **Sort L de Maïa : « Maïa : Cœur du Bosquet » garde son nom** (le clin d'oeil avec la M du Vivant reste).
3. **Les uniques L/M : une base d'école + une particularité.** Chaque L et M garde un sort unique, construit sur une base d'école (un cran de largeur et de puissance du design) enrichi d'un delta : un taux, un effet additionnel ou une cible particulière. Structure de donnée : `uniques[]` porte `base` (le sort d'école), `cran` et `delta` ; la fiche affiche le nom unique, la mécanique lit la base plus le delta. Le geste se reconnaît d'une carte à l'autre, la particularité est la récompense du nom.
4. **Les invocations de l'Appel :** 3 maximum par invocateur ; PV du renfort plafonnés à 20 % des PV max de l'invocateur ; pas de durée maximale ; les invocations tombent avec leur invocateur ; les renforts apparaissent en mini-cartes sur le plateau.
5. **La zone :** elle frappe 3 cibles contiguës de la **ligne choisie** (attaque par défaut, support au choix en Tactique) ; le boss encaisse la zone comme une **seule unité** (pas de multi-slot) ; le triangle avant/arrière est une PISTE pour plus tard.
6. **L'Écuyer Fervent :** le maillon d'entrée du paladin dans la Légion Solaire (palier exact posé au lot contenu).
7. **Le Jeune Séraphin :** la carte p1 « Ange Éveillé » est renommée « Jeune Séraphin » ; l'Éveillé du Seuil garde son nom.
8. **Les drops au-dessus du rang N :** les communes tombent au taux de référence, le taux décroît à mesure que la rareté monte ; économie revue plus tard.
9. **Le mana de l'intelligence :** +2 mana max par point d'intelligence ; +1 mana rechargé par tour tous les 2 points d'intelligence.

**Défauts proposés par la spec, à confirmer au fil des lots (aucun ne bloque) :** le coût de l'éveil N → C (1 pierre d'éveil, drop rare de donjon + défi du jour) ; le seuil de résistance (palier de la cible + moitié de son intelligence) ; la stat principale du gardien (la vie) ; les noms des sorts de race (Instinct Sauvage, Ferveur Céleste conservés) ; la condition de l'événement d'équilibre (posséder un ange L et un démon L) ; les communs retirés des cartes de famille (une carte de famille connaît ses sorts de lignée, pas les communs ; les communs restent aux naissances et aux solos).

## 4. Les exigences par lot

Chaque lot est livré avec sa chaîne de preuve : `node build.mjs`, `node --test` au vert complet, regénération des tables (`node tools/gen-tables.mjs`), smoke adapté, digest recalibré et documenté si les data de combat bougent. Les critères ACC sont les commandes ou tests qui prouvent ; une exigence sans commande est un mensonge de spec.

### Lot 1 : le rang N

- **EXI-N-1** : les 15 naissances passent `rarity: "N"` dans `cards.json` ; `RARITY_POWER` et `RANK` de `engine.json` reçoivent le rang N (sous C, hors lignée) ; aucune famille ne compte un N dans son échelle (validateur).
- **EXI-N-2** : les naissances restent jouables en combat (équipe de départ inchangée en composition).
- **EXI-N-3** : l'éveil N → C est un mécanisme typé (consomme la pierre d'éveil, défaut proposé), porté par `trees.json` ; l'éveil est un préalable, pas un choix de progression.
- **EXI-N-4** : l'acquisition : drops N à taux très bas dans les donjons, taux de la nature dans les zones d'errance (déjà posé), 1 à 2 N offerts en début de jeu ; au-dessus du N, les communes au taux de référence puis décroissant avec la rareté (décision 8) ; le tirage reste borné par les déblocages.
- **EXI-N-5** : pas de migration de sauvegarde obligatoire (la rareté vient des data, pas de la sauvegarde) ; le digest bouge : nouvelle baseline documentée dans la roadmap.
- **ACC-N** : un test prouve qu'une naissance N s'éveille en la commune C de la famille choisie et consomme la pierre ; le validateur refuse un N dans une échelle de famille ; le digest recalibré est documenté ; la fiche affiche le rang N en toutes lettres.

### Lot 2 : la fin du tri des 189

- **EXI-T-1** : la fusion couvre les six étapes du design 14.5 dans l'ordre : Forge, Bosquet, Crypte, Zénith, naissances et solos, divines. Chaque biome marqué `trie` couvre 100 % de ses signatures (validateur, `fusion-map.json`).
- **EXI-T-2** : les uniques suivent la décision 3 : base d'école + cran + delta ; les 36 cartes nommées (29 L + 7 M) gardent leur unique, dont « Mur Éternel » (Argus) et « Maïa : Cœur du Bosquet » inchangé.
- **EXI-T-3** : le tri d'homogénéité (arbitrages du 10/11) : aucun sort strictement dominé au même coût ne reste ; les communs sont retirés des cartes de famille (défaut proposé) ; un contrôle automatique du grimoire l'avertit.
- **EXI-T-4** : les biomes non triés restent jouables par leur chemin legacy ; le re-mappage des sorts connus s'étend aux sauvegardes à chaque biome trié (le mécanisme de migration v10, réutilisé).
- **ACC-T** : `fusion-map.json` à 100 % par biome trié (test) ; un monstre de chaque biome trié caste son cran de fusion (test) ; aucune paire de sorts au même coût avec l'un strictement supérieur (contrôle) ; le glossaire in-game reflète le grimoire.

### Lot 3 : le ciblage par fiche type

- **EXI-C-1** : la fiche type (rôle, école, ciblage, taux, base) pilote la résolution ET la fenêtre d'action : un sort « soi » ne propose que soi, un sort « 1 allié » que les alliés, etc. Le bug noté du boost qui ciblait les ennemis est reproduit puis corrigé par ce câblage.
- **EXI-C-2** : le rôle attaque/support disparaît de l'affichage (fiche, libellés, sous-titres) ; le champ moteur reste pour les lignes d'équipe, renommé en interne (emplacement).
- **ACC-C** : un test moteur + un check smoke par ciblage (soi, 1 allié, équipe, 1 ennemi, zone, tous) ; la fiche n'affiche plus « Attaquant » ni « Soutien ».

### Lot 4 : les stats RPG (v0.47)

- **EXI-S-1** : la stat principale par profil vit dans `engine.json` (guerrier/épéiste → attaque ; assassin/voleur → agilité ; mage/occultiste/prêtre → intelligence ; gardien → vie, proposition maintenue) ; tous les mults tirent dessus.
- **EXI-S-2** : l'affichage montre le **résultat calculé** (dégâts ou soin prévus = mult × stat principale) partout (fenêtre d'action, infobulles) ; la décomposition reste en infobulle (décision du 10/11).
- **EXI-S-3** : la répartition agi/int dérive du profil (la stat principale domine toujours) ; les data fautives corrigées (cas relevé : l'évoluée des Rivières depuis Mage Novice).
- **EXI-S-4** : l'ordre du tour se calcule sur l'agilité ; l'esquive dérive de l'écart AGI attaquant/défenseur, plafonnée (~25-30 %), fusionnée avec le dodge de classe.
- **EXI-S-5** : le mana total = palier + 2 × INT (plafonné, défaut +50 % du palier) ; la recharge = palier + 1 par 2 INT (plafonné pareillement) ; les seuils de résistance (défaut : palier + INT/2 de la cible) ; le tout en data `engine.json`.
- **EXI-S-6** : la zone en combat : 3 cibles contiguës de la ligne choisie (attaque par défaut, support en Tactique) ; le boss encaisse comme une seule unité.
- **EXI-S-7** : migration de sauvegarde (v13) : les exemplaires existants reçoivent les stats dérivées, rien n'est perdu.
- **ACC-S** : les tests ACC-3-x de la spec majeure rejoués (stat principale, soin plafonné, zone, ordre du tour, seuil, migration) ; le recalibrage du digest se fait AVEC Marc-Olivier (point de calibration obligatoire du plan) ; l'affichage calculé vérifié au smoke.

### Lot 5 : les mécanismes spéciaux

- **EXI-M-1** : les types d'évolution du plan races : `regression` (Éclat de régression, nouvelle carte au palier R, 100 % des sorts + 10 % des stats, drop à partir du cran Difficile), `chute` (régression descendante), `malediction` (transformation, verrouillage, sans interaction), `evenement` (triomphe Morzak, échec Isaure, équilibre), `conversion funèbre` (le sacrifice, sans retour), `fusion` (les deux Maïa consommées en la Déesse des Sèves), `secrete` (floutée « ?? »).
- **EXI-M-2** : le verrou SR en fiche (état bloqué, condition) ; les données d'événement en `trees.json`/`evolutions.json` avec leurs conditions, jamais de code par carte.
- **EXI-M-3** : l'UI des nouveaux flux : confirmation de l'Éclat, notification de malédiction, confirmation du sacrifice et de la fusion, scène de récompense d'événement, évolutions secrètes floutées.
- **ACC-M** : un test par mécanisme (déclenché uniquement sous sa condition exacte, aucune carte perdue, l'événement crée il ne remplace pas) ; le smoke couvre le verrou en fiche et une secrète floutée.

### Lot 6 : le contenu v3

- **EXI-V-1** : PRÉREQUIS : le document familles et races v3 repoussé sur main. Ensuite seulement : ~100 cartes, 10 renommages, les échelles complètes (C → UC → R → SR → UR → L, puis M), les ids nouveaux stables dès la création, les noms verrouillés intacts.
- **EXI-V-2** : les renommages actés : « l'Écuyer Fervent » (entrée du paladin dans la Légion Solaire), « le Jeune Séraphin » (p1, ex « Ange Éveillé », voie et arbres mis à jour, sauvegardes intactes : l'id ne bouge pas).
- **EXI-V-3** : les sorts des nouvelles familles sur le gabarit (6 sorts de lignée, 2/3/5/9/14/20✦, un rôle-cadre, le ciblage qui s'élargit) : Crépuscule, vol, zèle, école des invocations, familles divines (Arbitres, Chœur Miroir, Tisseuses), anges dévoyés, lignées d'accueil des Enge.
- **EXI-V-4** : les images : campagne pour les nouvelles cartes (le brief du document v3), intégration des 29 références rendues au manifeste.
- **ACC-V** : validateur vert sur toutes les nouvelles références croisées ; le catalogue complet reste jouable (aucune carte v0.47 perdue) ; les tests de paliers (aucun saut dans les échelles) ; regénération des tables et de l'audit.

### Lot 7 : les zones d'errance

- **EXI-Z-1** : chaque zone porte ses enseignements : crans supérieurs (II, III) des écoles ouvertes et sorts d'école neufs, aux rythmes calibrés ; le grimoire appris persiste en sauvegarde (v13/v14 selon la forme) et survit à l'évolution.
- **EXI-Z-2** : la cadence vérifiée (zone, donjon, zone, donjon ; jamais deux consécutifs du même type hors événement) ; les récoltes déjà posées (éclats, N à taux très bas, jetons) restent.
- **ACC-Z** : un cran appris en zone est persisté, castable et survit à l'évolution (test) ; la cadence valide sur toute la chaîne (validateur) ; une session complète visuelle (zone, donjon, zone) montre le grimoire grossir.

## 5. Les règles transverses (rappels)

Zéro dépendance ; `dist.html` généré ; aucune valeur de design dans `src/engine/` (allowlist) ; data en apostrophe typographique, docs sans tiret long ; les migrations de sauvegarde chaînées sans saut (v12 → v13 → v14, fixtures réelles) ; le build déterministe ; ids stables ; une tâche = une préoccupation = un commit ; jamais revendiquer un succès sans la sortie de preuve.

## 6. Non-goals

La séparation mono/multi des lignes d'écoles (notée pour une future méta) ; le triangle de zone avant/arrière (PISTE) ; le multi-slot des boss ; les paliers H (HUC, HSR) ; le méta P-Hub ; le découpage de l'UI en modules ; l'équilibrage fin au-delà des valeurs des documents de design et des calibrages actés.
