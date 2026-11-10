# Journal des arbitrages et décisions

> Règle : toute décision de design vit ici avec sa **date** et son **statut** (`ACTÉ` = s'applique aux data et au jeu ; `PISTE` = exploré, pas codé ; `PROPOSÉ` = en attente de Marc-Olivier). On ne contredit jamais un arbitrage ACTÉ : on propose une révision datée en dessous.

## 2026-11-10 (soir) : ACTÉ — lignes avant/arrière et fin du rôle attaque/support (retour de Marc-Olivier)

- **La règle de rang existait en doc (`docs/regles-jeu.md`) mais pas dans le moteur** ; elle est reconfirmée et complétée :
  - Formation : 5 cartes max, 3 devant + 2 derrière ou 2 + 3, choisie avant le combat, **figée** pendant le combat.
  - L'arrière encaisse **50 % des dégâts** tant qu'un allié tient à l'avant ; l'avant tombe : la protection saute pour tous ; la protection de l'arrière ne couvre **pas** les attaques de zone.
  - Un **Guerrier ou un Assassin** en arrière frappe à moitié tant que l'avant tient ; les autres profils (Mage, Prêtre, Occultiste) frappent à plein.
  - **Complément acté ce jour : les soins ne sont JAMAIS affectés par la position** (seuls les dégâts).
- **Le rôle `attaque`/`support` est supprimé** : plus de distinction support/attaquant nulle part ; le champ `role` disparaît des data (113 cartes, 153 monstres), du moteur (lignes d'init, vagues ennemies, Souffle/Frappe Croisée) et de l'UI. Toute carte se place librement à l'avant ou à l'arrière ; son comportement suit sa classe et sa position, plus son rôle.
- Implémentation : chantier dédié « lignes avant/arrière » dans `docs/roadmap.md`, avant le contenu v3 restant (les nouvelles cartes naîtront sans `role`) et avant le calibrage du digest. Le moteur actuel n'a aucune notion d'avant/arrière (`src/engine/combat.js` : lignes par rôle uniquement).

## 2026-11-10 (soir) : PROPOSÉ — révision datée : règle de rang arrière, -50 % (doc) ou non-ciblable (moteur) ?

- Constat des tests IHM : la doc actée dit que l'arrière **encaisse 50 % des dégâts** tant que l'avant tient ; le moteur actuel rend l'arrière **non ciblable** tant que l'avant tient (`enemyPickTarget` vise l'avant vivant d'abord), puis l'arrière encaisse des dégâts pleins. Les deux lectures ne coexistent pas ; à trancher avant le chantier lignes :
  - **Option A (doc actée)** : l'arrière est ciblable et encaisse -50 % tant que l'avant tient.
  - **Option B (moteur actuel)** : l'arrière n'est pas ciblable tant que l'avant tient, puis encaisse des dégâts pleins.
  - **Option C (hybride)** : l'arrière n'est ciblable que par les sorts et la zone tant que l'avant tient, à -50 %.
- Statut : **PROPOSÉ, en attente de Marc-Olivier** ; le chantier lignes avant/arrière attend ce tranchage.

## 2026-11-10 : ACTÉ — maturité par rareté pour toute carte de race humaine (suite des arbitrages de lancement)

- **Généralisation de la règle Yuki** (Marc-Olivier, 10/11 soir) : plus une carte de **race humaine** est rare, plus le personnage est mature — c'est général, pas réservé aux nommées évolutives. Échelle actée dans `tools/species-map.json` (`humanMaturityByRarity`) : **C = adolescent·e (14-17) ; UC = jeune adulte (18-22) ; R = adulte (23-30) ; SR = adulte confirmé·e (30-38) ; UR = mature·aguerri·e (40-50) ; L = force de l'âge légendaire, aura de vétéran (50+) ; M = figure mythique d'âge indéterminé**.
- **Priorités** : le champ `age` d'une nommée (ex. Kenji adulte aguerri à tous les paliers, graines = jeunes) reste prioritaire sur l'échelle ; pour les génériques humaines, `build-prompts.mjs` dérive l'âge apparent de la rareté via cette échelle.
- Lecture de progression : la collection raconte la montée en puissance visuellement — un novice C est un adolescent, une L est un vétéran légendaire.

## 2026-11-10 : ACTÉ — arbitrages de lancement de la campagne charte v2 (retour de Marc-Olivier)

- **Full body dès UR** : les raretés UR, L et M passent en full body ; C/UC/R/SR restent en demi-corps (charte v2 §1 et §12).
- **`tools/species-map.json` créé (v1)** : tableau genre + espèce + âge par palier des 53 références nommées (35 monstres, 7 compagnons, 7 graines, 4 sommets v3 : Vesperine, Gadianton, Lémion, Archimage de l'Appel) + les 11 familles (Crépuscule, Vol, Zèle, École des Invocations = **humaines**) + règles génériques pour les 231 arts. `build-prompts.mjs` doit échouer explicitement pour toute carte sans entrée (espèce depuis les data, jamais depuis le nom).
- **Genres tranchés sur les cas ambigus** : La Mort F, Archiliche M, Fjalar M, Kairos M, **Ember F** (graine b6), Sylve F, **Archimage de l'Appel F** (v6, vieille sage majestueuse). Les 7 compagnons/graines masculins initialement proposés sont confirmés (Kenji, Argus, Solen, Onyx, Roc).
- **Équilibre des genres : PAS de quota strict** (Marc-Olivier) : les nommées finissent ~30 F / 23 M ; l'équilibre se vérifie globalement sur la planche de contrôle, aucune case 50/50 à remplir.
- **Vidéos FX : AUCUNE avant la v2 complète** : pas de mini-vidéos alimentées par les arts v1 ; le chantier WAN (vidéos + cycles de marche errance) démarre après la campagne d'arts v2 validée.
- **Sort des 231 arts DreamShaper XL : archivés en repli** : remplacés carte par carte par la campagne v2, supprimés seulement sur accord explicite de Marc-Olivier après validation v2.
- **Conséquence : tous les points bloquants de la charte v2 (§8) sont levés sauf la liste mini-LoRA + validation IPAdapter**, non bloquants pour la première vague (tester IPAdapter sur 2-3 nommées à lignée longue suffit). La campagne de génération v2 est DÉBLOQUÉE.

## 2026-11-10 : ACTÉ — test aveugle checkpoint (charte v2) : WAI v17 retenu, NoobAI-XL écarté

- **Protocole** : test aveugle local ComfyUI, 6 cartes témoins × 2 checkpoints (WAI-Illustrious v17 vs NoobAI-XL), paramètres identiques, seeds figés 1126001→1126006 (meliane, seigneur-cendres, leviathan, kenji, yuki, bg-marees). Révélation après évaluation de Marc-Olivier.
- **Verdict : WAI v17 6 — NoobAI-XL 0**, appréciation d'ensemble « de très très loin ». **WAI-Illustrious v17 est le checkpoint de référence de la charte v2 ; NoobAI-XL écarté.** Premier point bloquant de la charte v2 levé (§4 et §11 de `docs/images/charte-graphique-v2.md`).
- **Correction 1 — âge verrouillé dans l'ADN** : Kenji rendu en gamin parce que l'ADN data ne portait pas d'âge. Désormais le bloc `character_dna` fixe l'âge attendu (ex. Kenji : `1boy, adult man, mature face, veteran warrior`, négatif `young, teen, boy`) : plus d'invention du modèle sur l'âge.
- **Correction 2 — Seigneur des Cendres (`f13`) rendu en chevalier** : c'est la dérive que le §3 de la charte v2 dénonce. ADN monstrueux requis (`colossal fire lord, beast-like, molten slag body, crown of embers, glowing ember eyes`, négatif `knight, human, armor, humanoid`).
- **Correction 3 — âge apparent par palier de rareté** : pour toute nommée évolutive, le `character_dna` inclut un âge par palier (graine = jeune → évolutions plus matures/grandes). La cohérence de lignée inclut la maturation. Valide le rendu « gamine » de Yuki pour la graine b1.
- **Conséquence seeds** : les seeds v1 restent obsolètes (changement de checkpoint) ; le registre v2 (`seeds.csv`) peut s'ouvrir avec les seeds témoins 1126001→1126006.

## 2026-11-10 : ACTÉ — charte des nommées (retour de Marc-Olivier) : doublon Aurorine tranché, règle générique/nommé explicitée

- **Le doublon Aurorine tranché** : deux cartes portaient le même nom complet « Aurorine, Lance de l'Aube » : `z15` (monstre L de la Légion Solaire du Zénith, Assassin) et `u6` (L de la famille du Zèle, Prêtre, créée au lot 6). La charte « une nommée = un même personnage sur toute sa lignée » est intenable sur deux personnages distincts. **`z15` reste Aurorine** : c'est le sommet acté de la Légion Solaire du Zénith (design-arbres v15), son sort Éclipse Montante le raconte. **`u6` devient « Lémion, Chef de la Légion Solaire »**, le nom acté au document de référence v3 pour le sommet du Zèle (parallèle à `t6` Gadianton, Chef des Brigands) : le lot 6 avait réutilisé Aurorine par erreur. Renommage d'affichage seul : id, stats, sorts et sauvegardes inchangés.
- **La règle des L sans prénom est explicite** : Héraut du Zénith (`z7`), Gardien des Foyers (`f12`), Patriarche du Bosquet (`g7`), Archiliche des Caveaux (`k7`), Grande Prêtresse de l'Ombre (`q5`) et Archimage de l'Appel (`v6`) gardent le statut **futur nommé** (art de référence verrouillé dès la série 1), PAS générique libre : un éventuel prénom sera un renommage d'affichage seul, l'art reste le même personnage.
- **Garde du validateur (`EXI-DATA-3`)** : deux nommées ne peuvent plus partager le même nom complet « prénom, titre ». Les prénoms répétés à titres différents (Kenji, Kira, Alix, Léna, Argus, Solen, Maïa : deux branches d'une même lignée) restent légaux ; les titres génériques sans prénom (Chapelain du Jour, Arbalétrier Doré : miroir voulu Zèle/Zénith) restent hors règle.
- Preuve : renommage d'affichage seul, digest `833a6d2c…` inchangé (518/3000, 0 exception), smoke 171 checks, 115 tests.

## 2026-11-10 : ACTÉ — retours terrain : fin des sorts undefined, la ligne support frappe aussi (v1.11 + v1.12)

- **Sorts undefined (v1.11)** : un sort hérité remappé par le tri vit en sauvegarde comme `école + cran` sans nom ni coût ; il se résout désormais en fiche complète (école + cran, unique, fiche) au moment de l'affichage et du lancer (`resolveSpellEntry`). Sauvegardes inchangées, résolution sans perte.
- **La frappe simple est universelle (v1.12)** : ⚔ Attaque (gratuite, désignation d'ennemi) est la première action de TOUTE carte, la ligne support comprise. Le support frappe à sa stat principale au rendement de sa classe, avec esquive AGI et opposition d'élément comme la ligne d'attaque.
- **Un sort est un sort (v1.12)** : un sort hostile (rôle dégâts/contrôle/malus, ou cible ennemi/zone/tous) lancé depuis la ligne support se résout sur les ennemis selon sa fiche (largeur, mult, taux, tours) : dégâts à la stat principale, zone 3 contiguës ancrée, largeur 5 = tous, taux contre le seuil de résistance, malus = malédiction. Les sorts alliés gardent leur chemin historique (soin/bouclier/boost par effet de carte). Les sorts malus dérivent désormais une cible ennemie dans les fiches résolues.
- **Le chemin Auto ne bouge pas** : le digest reste `833a6d2c…` **518/3000 (0 exception, 1 marathon)** — en auto les supports du digest lancent leur signature ou des sorts alliés, jamais un sort hostile, donc aucune bascule d'équilibrage à recalibrer. Preuve : 114 tests, smoke 171 checks.

## 2026-11-10 : ACTÉ — clôture du grand chantier arbres + sorts (lots 2 à 7 faits ce jour)

- Lot 2 (tri des 189) terminé : T2.6 divines (23 signatures, 14 crans remplis, 3 uniques décision 3, migration v18) + T2.7 homogénéité (contrôle automatique dans le validateur, communs retirés des familles, uniques Marées resynchronisées). Baseline intermédiaire `eb701919…` 479/3000.
- Lot 3 (fiche type) : la fenêtre d'action pilote tous les ciblages depuis les données (soi/1 allié/équipe/1 ennemi/zone/tous) ; zone = 3 contiguës autour de l'ancrage en Tactique, tous = ligne entière. Chemin Auto inchangé.
- Lot 4 (v0.47) : répartition agi/int par profil, esquive AGI plafonnée 30 %, mana +2/INT (recharge +INT/2, plafond +50 %), seuils palier + INT/2, affichage du résultat calculé, migration v19. **Baseline finale : `833a6d2c60131fbd21b021c701daa90f308275961e03c479500c032eb5b98a24`, 518/3000 (0 exception, 1 marathon).** Point de calibration avec Marc-Olivier : ce chiffre est la mesure de référence, à affiner sur le terrain.
- Lot 5 : mécanismes spéciaux en données (régression/Éclat, fusion, malédiction, événement équilibre, secrètes « ?? »), testés un par un.
- Lot 6 (v3) : doc familles v3 reconstruit (`docs/design/familles-races-v3.md`), renommages actés (Jeune Séraphin, Écuyer Fervent), 4 nouvelles familles C→L + sorts de lignée.
- Lot 7 : zones complètes, cadence validée, grimoire appris persisté.
- Preuve finale : 107 tests, smoke 171 checks, audit régénérable à l'identique, build déterministe, digest `833a6d2c…` 518/3000.

## 2026-11-10 : ACTÉ — lot 4, les stats RPG v0.47 (T4.1-T4.7)

- **T4.3** : répartition agi/int dérivée du profil (`engine.json moteurr.STAT_RATIOS`), la stat principale domine toujours ; 222 cartes/monstres recalculés (le bug relevé — lignées mage plus agiles qu'intelligentes — est clos : test sur toutes les cartes).
- **T4.4** : esquive = dodge de classe + écart AGI × 0,01, plafonné à 30 % (`DODGE_PER_AGI`/`DODGE_CAP` en données).
- **T4.5** : mana max = palier + 2×INT, recharge = palier + INT/2, plafonnés à +50 % du palier ; seuil de résistance = palier + INT/2 (toutes les formules en données `moteur`).
- **T4.2** : la fenêtre d'action affiche le résultat calculé (→ ~N = mult × stat principale) à côté de chaque sort.
- **T4.6** : la zone en combat (3 contiguës, ligne choisie) câblée en Tactique via la fiche type (T3.1) ; le boss encaisse comme une unité.
- **T4.7** : migration v19, agi/int recalculées sur les exemplaires existants depuis les ratios de profil.
- **Nouvelle baseline digest** : `833a6d2c60131fbd21b021c701daa90f308275961e03c479500c032eb5b98a24`, **518/3000** (0 exception, 1 marathon), contre `eb701919…` 479/3000. La hausse vient de l'esquive AGI (moins de dégâts subis par les équipes rapides) et du mana INT. Point de calibration avec Marc-Olivier : ce chiffre est la mesure, à affiner sur le terrain. 103 tests, smoke 171 checks.

## 2026-11-10 : ACTÉ — le tri d'homogénéité du grimoire (T2.7, fin du lot 2)

- **Contrôle automatique** (dans le validateur, donc testé à chaque chargement) : aucun sort strictement dominé au même coût, même école + même rôle, sans particularité (effet/delta), même base de comparaison (mult ou taux). Une seule paire réelle signalée : Décharge Arcanique vs Lame d'Écume III — la Décharge porte désormais son effet propre en données (base : l'intelligence), ce qui l'exclut de la domination stricte.
- **Communs retirés des cartes de famille** (défaut confirmé) : une carte de famille ne porte que ses sorts de lignée (le cas Pisteur du Bosquet / Frappe Précise vs Trait d'Épine est clos). Les naissances et solos gardent leur commun.
- **Les 7 uniques des Marées sont resynchronisées au format décision 3** (base d'école + cran + delta), comme celles de la Forge, du Bosquet, de la Crypte, du Zénith et des divines.
- **Nouvelle baseline digest** : `eb701919d4cb8a1ce4b7c31f5585fbcd4d40ae373e5a513167520f6b6f5e588d`, **479/3000** (0 exception, 0 marathon), contre `7dfab0a2…` 476/3000. +3 victoires : les cartes de famille n'ont plus de commun à dépenser en fin de mana. 97 tests, smoke 164 checks.

## 2026-11-10 : ACTÉ — le tri des recrues, naissances et solos (T2.5 du grand chantier)

- **33 signatures résolues, toutes fondues** (14.5 étape 5). Le lot : les 12 naissances raciales (n1-n12), les 5 solos d’entrée (Garde-Promesse, Étincelle Vive, Pilier Mécanique, Médecin de Camp, Veilleur d’Acier) et les 16 cartes des mini-lignées (quais, fête, routes, dunes, berges, guet). Ni L ni M dans le lot : aucune unique, tout le monde rend son geste au pot commun. Le biome `recrues` est marqué `trie` dans fusion-map.json ; les 33 cartes portent le champ `biome` (le validateur exige 100 % de couverture, comme les biomes à monstres).
- **Les trois portes divines sont les cartes clés (règle 6, acté)** : l’Ange (Éclat d’Aube), le Démon (Trait de Vice) et l’Éveillé du Seuil (Regard du Seuil) gardent leur geste legacy. Leurs signatures sont partagées avec les cartes divines (p1, p2) et dessinent les trois familles divines (Arbitres, Chœur Miroir, Tisseuses) : leur tri appartient au lot des divines (T2.6), « Pouvoirs d’abord, sorts ensuite » (section 12). Les p1/p2 attendent au même endroit.
- **Affectation des fondues** (règles 1 et 3, le geste décide, les crans I-II du plan 14.5) : le Rempart prend la Prise de Garde (n1), le Voile de Brume (n10), le Serment Protecteur (a3) au cran I de la Barrière de Corail, puis le Rideau de Brume (a41) et la Rampe de Lancement (a48, l’ouvrage du maître charpentier abrite ses ouvriers) au cran II ; la Lame d’Écume prend le Bruissement d’Écume (n5), la Charge Hydraulique (a9), la Flèche de Brume (a34), le Coup de Rame (a38) et le Coup d’Étrave (a47) au cran I, la Volée de Bruine (a40) et le Carrousel de Lames (a46) au cran II ; le Mauvais Œil prend le Souffle de Braise (n6) et le Trait Incandescent (a4) au cran I de la Colonne de Feu, la Sève Voleuse (n7) au cran I de la Sève Rongeuse et le Souffle des Sèves (n11) au cran II (le souffle porte à 2), les Griffes Noires (n8) au cran I de la Morsure Putride ; l’Entrave prend la Rafale Céleste (n9, la rafale déstabilise) et le Froid du Caveau (n12, le froid fige) au cran I de l’Étreinte des Profondeurs, et le Mirage du Désert (a44) au cran II de la Mélodie envoûtante ; la Ferveur prend la Lanterne du Guet (a39) au cran I de la Vigie des Flots et la Ronde Éclairée (a49) au cran II ; les entrées d’école reçoivent les gestes génériques (règle 5) : l’Étincelle d’Étude (n2) rejoint la Décharge Arcanique, la Bénédiction Modeste (n3), le Baume Apaisant (s2), la Litière Douce (a35) et la Selle Réconfortante (a42) l’Onde Consacrée (la Bénédiction du Chemin, a43, au cran II), le Larcin Rapide (n4), le Pas de Sable (a36) et les Bottes Cachées (a37) la Frappe dans le Dos (le Daguenaud, a45, au cran II), l’Œil du Stratège (s3) l’Œil du Malheur.
- **Mécanisme étendu aux cartes** : `resolveSignature` et `triRemap` lisent désormais les cartes porteuses du champ `biome` en plus des monstres ; les sorts hérités au nom d’une signature de recrue (l’héritage d’évolution pousse la signature synthétisée 5✦ ×1.85) se re-mappent sur les crans. Migration v17 (EXI-T-4) : une save v16 avec « Prise de Garde » la fonde au cran I de la Barrière ; « Éclat d’Aube » reste legacy jusqu’au tri des divines (testé).
- **Le combat ne change pas** : les cartes gardent leur signature synthétisée en combat (5✦ ×1.85), comme les monstres gardent leur soloSpell legacy ; le tri est une couche données + sauvegarde.
- Preuve : 92/92 tests (4 neufs : tri des recrues, fondues vers crans remplis, cast des crans, migration v16 -> v17), smoke 164 checks, digest `7dfab0a2…` **inchangé** (aucune maths de combat).

## 2026-11-10 : ACTÉ — le tri du Zénith Ardent (T2.4 du grand chantier)

- **30 signatures résolues : 8 uniques + 22 fondues** (gabarit des Marées, 14.5 étape 4). Le biome `zenith` est marqué `trie`, le validateur couvre 100 % de ses signatures.
- **Deux lignes d’école naissent du Zénith** : `Renvoi Céleste` (le Rempart, renvoi ; la lumière des phénix renvoie les coups, 25/20 % × 2 tours, crans I-II remplis, l’équipe au cran III et l’équipe renforcée au IV attendent) et `Hymne` (la Ferveur, boost ; le boost et la tenue montent ensemble, le cran III porte l’équipe entière, rempli par z25 Hymne du Zénith, les crans I, II et IV attendent leur cantique). Trois crans se remplissent : Renvoi Céleste I (z20 Plumage Miroir, 1 allié) et II (z21 Renvoi Céleste, 2 alliés), Hymne III (équipe, boost 20 %, tenue 15 %).
- **Les 8 uniques suivent la décision 3** (base d’école + cran + delta) : Sentence Solaire (z7, base Lame d’Écume IV + le jugement pèse sur la ligne ennemie), Couronnement (z8, l’Astre Capiteux, le M, base Colonne de Feu IV + brûlure 10 % × 2 tours), Éclipse Montante (z15, base Lame d’Écume III + l’éclipse dérobe la précision), Renaissance Pyrique (z19, base Lame d’Écume III + brûlure 15 % × 2 tours + Pyrrha renaît une fois par combat), Immolation Retournée (z22, base Renvoi Céleste III + le renvoi monte à 35 % pendant 3 tours sur l’équipe), Cantique Final (z26, base Hymne IV + le chant ne s’éteint pas tant que Célestin vit), Peine Capitale (z29, base Lame d’Écume IV + la lame ignore les boucliers), Prophétie du Plein Jour (z30, Apolline, le M, base Lame d’Écume IV + brûlure 15 % × 2 tours + les dégâts amplifiés de 20 %). Les deltas nouveaux (jugement, aveugle, renaissance, renvoi, persiste, perce, amplifie) sont des métadonnées jusqu’au câblage de la Phase 5.
- **Affectation des fondues** (règle 3, la largeur native décide) : la Lame d’Écume prend z1/z2 (I : Estoc Brillant, Étincelle), z3/z4 (II : Carreau Doré, Lance Héliale), z5/z13/z14/z28 (III : Falaise de Lumière, Colonne Solaire, Perce-Aube, Verdict Solaire, les frappes lourdes montent à la zone) et z6 Pluie de Feu au cran IV ; la Colonne de Feu prend z16 (I : Envol Incandescent), z17 (II : Rafale de Braise), z18 (III : Éclosion Ardente, la zone de brûlure) ; la Barrière de Corail prend z12/z23 (I : Rempart Ardent, Aube Bénie) ; le Renvoi Céleste prend z20 (I) et z21 (II) ; l’Onde Consacrée prend z9 (I : Hymne du Matin), z10/z24 (II : Aile du Matin, Office du Matin), z11 (III : Bénédiction Solaire) ; l’Hymne prend z25 (III) ; l’Œil du Malheur d’entrée prend z27 Colonne de Purge au cran II (la purge aveugle la ligne).
- **Migration v16** (EXI-T-4) : `triRemap` rejoué pour le Zénith ; une save v15 avec des sorts du Zénith legacy les re-mappe sur les crans, les divines non triées gardent leur chemin legacy (testé). Quatre des cinq biomes à monstres sont triés ; restent les solos/naissances et les divines.
- Preuve : 88/88 tests (4 neufs : tri du Zénith, uniques décision 3, cast des crans, migration v15 -> v16), smoke 164 checks, digest `7dfab0a2…` **inchangé** (couche data et sauvegarde, aucune maths de combat).

## 2026-11-10 : ACTÉ — le tri de la Crypte Oubliée (T2.3 du grand chantier)

- **30 signatures résolues : 8 uniques + 22 fondues** (gabarit des Marées, 14.5 étape 3). Le biome `crypte` est marqué `trie`, le validateur couvre 100 % de ses signatures.
- **Deux lignes d'école naissent de la Crypte** : `Hurlement` (l'Entrave, contrôle ; le cri des banshees, 25/20/15/10 % × 1 tour, la zone au cran III remplie par k6, les crans I, II et IV attendent) et `Morsure Putride` (le Mauvais Œil, malus, mot-clé poison déjà présent dans keywords.json ; cran I rempli par k13 la Goule, les autres attendent). Cinq crans vides se remplissent : Marque Corrosive II (k21 Noyade Vengeresse, l'Eau croupie rejoint la corrosion des Marées), Fournaise Invoquée III (k16 Légion des Caveaux, 3 renforts), Vigie des Flots I/III/IV (k10 Deuil Martial, k24 Étendard Funèbre, k29 Serment Rallié : la Ferveur est pleine).
- **Les 8 uniques suivent la décision 3** : Voie du Tombeau (k7, base Fournaise II + la légion se relève), Abîme Remontant (k8, le M des Naufragés, base Lame d'Écume IV + l'abîme ralentit), Hurlement Fatal (k14, base Hurlement III + poison 15 % × 2 tours, l'inventaire la portait à 35 % recalés), Fauchade Universelle (k17, la Mort, ACTÉ dès le départ : base Lame d'Écume IV + les ennemis sous 20 % de vie tombent), Deuil Éternel (k19, base Hurlement IV + la malédiction du deuil), Harpon du Naufrage (k22, base Lame d'Écume III + corrosion 15 % × 2 tours), Épée de l'Aube (k27, base Lame d'Écume IV + purifie la ligne alliée), Lame du Serment (k30, base Lame d'Écume IV + poison 10 % × 2 tours). Les deltas nouveaux (fauche, purifie, engloutit, malédiction, renait) sont des métadonnées jusqu'au câblage de la Phase 5.
- **Affectation des fondues** (règle 3) : la Lame prend k1/k2/k23 (I), k3/k4 (II), k5/k20/k28 (III, les frappes lourdes × 1,6 montent à la zone) ; le Baume k9 (I) et k11 (II) ; le Rempart k12 (I), k25 (II), k26 (III) ; l'Appel k15 (I) et k16 (III) ; le Mauvais Œil d'entrée k18 Chagrin Noyé (Œil du Malheur IV, la malédiction porte à toute la ligne).
- **Migration v15** (EXI-T-4) : `triRemap` rejoué pour la Crypte ; une save v14 avec des sorts de Crypte legacy les re-mappe, le Zénith non trié garde son chemin legacy (testé).
- Preuve : 84/84 tests (4 neufs : tri de la Crypte, uniques décision 3, cast des crans, migration v14 -> v15), smoke 164 checks, digest `7dfab0a2…` **inchangé** (couche data et sauvegarde, aucune maths de combat).

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

Réponses de Marc-Olivier aux neuf points ouverts ; la spec et le plan du grand chantier les intègrent (archivées dans `docs/historique/grand-chantier-arbres-sorts.md`).

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


