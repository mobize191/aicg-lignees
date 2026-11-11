# Changelog

## [1.15] — 2026-11-11 — Boucle de jeu v2, lot 3 : départ à 2 cartes et recrutement naturel

**Départ de partie à 2 cartes** : à la première partie, 4 novices sont proposés (un par race — humain, bestial, mystique, divin) ; vous en choisissez un, un second est tiré au hasard parmi les trois restantes. Plus d'équipe complète de départ. **Recrutement naturel** : après une victoire, chaque vaincu (hors boss et nommés) a ~1 % de chance de demander à rejoindre votre collection — taux calibré par zone dans `data/zones.json`, toast de recrue, limite de 3 exemplaires par carte. Migration v22 non destructive (les sauvegardes commencées sautent l'écran de départ). Digest inchangé `f72106ff…` 1379/3000. 122 tests, smoke 195 checks (7 nouveaux verts).


## [1.14] — 2026-11-11 — Boucle de jeu v2, lot 2 : niveaux de donjon 1→25 et bandes de rareté

Chaque marche (donjon × mode) porte désormais un **niveau de donjon 1→25** et une **bande de rareté** affichés dans le sélecteur (Facile C→R, Normal UC→SR, Difficile R→UR, Très difficile SR→L, Enfer UR→M ; boss final en haut de bande, boss intermédiaire un cran sous). Le bestiaire de chaque vague est pioché dans la bande de la marche : la difficulté monte, les créatures montent avec elle. `data/difficulties.json` porte les bandes (`bande`), le validateur vérifie leur cohérence. Digest recalibré et consigné : `f72106ff…` 1379/3000, 0 exception, 1 marathon. 120 tests, smoke 188 checks (5 nouveaux verts).


## [1.13] — 2026-11-11 — Boucle de jeu v2, lot 1 : potions, or et persistance

L’économie de survie entre en jeu (lot 1 de la boucle v2, `docs/design/boucle-v2-spec-plan.md`). L’énergie ⚡ devient de **l’or** (1 ⚡ = 1 or, conversion non destructive en sauvegarde v21). Nouvelle action **🧪 Objet** dans la fenêtre d’action : potions de soin (30/60 % des PV max) et de mana (40/80 %), chaque gorgée **coûte son tour**, utilisables aussi hors combat entre les étages (bouton 🧪 Objets). Point d’achat minimal : le rayon potions de la **Boutique** (50/120/60/140 or, `data/potions.json`). **Plus de régénération entre les combats d’un même run** : PV et mana persistent d’étage en étage, effets temporaires dissous entre combats, régénération complète après le premier boss (étage 5), soins complets entre deux runs distincts. Hook « autel de soin » posé pour l’errance (soin complet + 5 pas de grâce, `errance-topdown.md` §8). Preuve : digest inchangé `aed250f9…` (1274/3000, 0 exception — combats isolés à PV pleins), 118 tests, smoke 183 checks (12 nouveaux verts).


Toutes les versions notables d'AICG : Lignées. Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) ; les numéros suivent le prototype (pas de SemVer). Les entrées reprennent l'historique en jeu (menu ⚙ → Historique) : les versions v1.0 à v1.12 et le baptême rétroactif v0.47.3 datent du 10/11/2026 (journée de la refonte majeure et du grand chantier arbres + sorts) ; les versions antérieures n'ont pas de date archivée.

## [1.12] — 2026-11-10 — La ligne support frappe aussi

RETOUR TERRAIN. Deux manques corrigés d’un même geste. Un : le Garde du Rempart et tous les supports n’avaient que le bouton de soin — désormais la frappe simple (⚔, gratuite) est la première action de TOUTE carte : on désigne l’ennemi, elle frappe. Deux : un sort de dégâts, de contrôle ou de malus lancé depuis la ligne support se résout enfin sur les ennemis selon sa fiche (largeur, puissance, taux, tours) — fini le soin fantâme quand un Embryon tapait avec Instinct Sauvage. La stat principale du lanceur fait les dégâts, l’esquive et l’élément comptent comme pour la ligne d’attaque, et les sorts alliés gardent leur chemin. Les sorts malus ciblent désormais les ennemis dans les fiches résolues. Le digest bouge (documenté) : les supports mixtes frappent.

## [1.11] — 2026-11-10 — Fin des sorts undefined

RETOUR TERRAIN. Les sorts hérités d’une carte évoluée étaient stockés en sauvegarde sous leur forme remappée par le tri (école + cran), sans nom ni coût : la fenêtre d’action et la fiche affichaient des lignes « ✦ undefined », et le sort ne se lançait pas. Désormais chaque entrée se résout en fiche complète depuis le grimoire : nom, coût, puissance, taux, cible et description. Les uniques remappés se résolvent aussi ; les crans vides et les sorts inconnus disparaissent proprement de la liste. Les sauvegardes ne changent pas : la résolution se fait à l’usage, sans perte.

## [1.10] — 2026-11-10 — Le tri des recrues

LES NAISSANCES ET LES SOLOS RENDENT LEUR GESTE AU GRIMOIRE. Les 33 signatures du lot (les 12 naissances raciales, les 5 solos d’entrée, les 16 cartes des quais, de la fête, des routes, des dunes, des berges et du guet) fondent en crans I-II des écoles existantes : la prise de garde protège (le Rempart), le bruissement d’éume frappe (la Lame), le froid du caveau fige (l’Entrave), la lanterne du guet éclaire (la Ferveur). Les trois portes divines (l’Ange, le Démon, l’Éveillé du Seuil) gardent leur geste : les familles divines le dessineront. Les sauvegardes passent en v17 : les sorts hérités d’une recrue se re-mapent sur leurs crans. Le combat ne change pas : le digest reste le même.

## [1.9] — 2026-11-10 — Le tri du Zénith

LE ZÉNITH ARDENT FOND SES 30 SIGNATURES EN 22 CRANS D’ÉCOLE ET 8 UNIQUES. Le renvoi des phénix devient une ligne du Rempart (25/20 % × 2 tours, les ailes couvrent 1 puis 2 alliés), l’Hymne porte la Ferveur à l’équipe entière (boost 20 %, tenue 15 %), et les cartes nommées gardent leur geste : Sentence Solaire, Couronnement (l’Astre Capiteux), Éclipse Montante, Renaissance Pyrique, Immolation Retournée, Cantique Final, Peine Capitale, Prophétie du Plein Jour. Les sauvegardes passent en v16 : le Zénith trié re-mappe ses sorts connus. Le combat ne change pas : le digest reste le même.

## [1.8] — 2026-11-10 — Le tri de la Crypte

LA CRYPTE OUBLIÉE FOND SES 30 SIGNATURES EN 22 CRANS D’ÉCOLE ET 8 UNIQUES. Le hurlement des banshees devient un sort de l’Entrée (la zone au cran III), la morsure putride ouvre le poison du Mauvais Œil, la légion des caveaux rejoint l’Appel (3 renforts) et la Ferveur se remplit (deuil martial, étendard funèbre, serment rallié). Les cartes nommées gardent leur geste : Voie du Tombeau, Abîme Remontant, Hurlement Fatal, Fauchade Universelle (la Mort), Deuil Éternel, Harpon du Naufrage, Épée de l’Aube, Lame du Serment. Les sauvegardes passent en v15 : la Crypte triée re-mappe ses sorts connus. Le combat ne change pas : le digest reste le même.

## [1.7] — 2026-11-10 — Le tri du Bosquet

LE BOSQUET PROFOND FOND SES 21 SIGNATURES EN 16 CRANS D’ÉCOLE ET 5 UNIQUES. La sève rongeuse devient un sort du Mauvais Œil (25/20 % × 2 tours), les soins des dryades greffent l’entrée Onde Consacrée, la Sève Éveillée rejoint l’Appel (2 renforts sylvestres), et les cartes nommées gardent leur geste : Aube Foliaire, Racine-Monde, Nuée de Spores, Première Clarté, Nuit des Sèves. Les sauvegardes passent en v14 : le Bosquet trié re-mappe ses sorts connus. Le combat ne change pas : le digest reste le même.

## [1.6] — 2026-11-10 — Le tri de la Forge

LE GABARIT DES MARÉES S’ÉTEND À LA FORGE CENDRÉE. Les 24 signatures du biome fondent en 19 crans d’école et 5 uniques : la brûlure devient Colonne de Feu (le Mauvais Œil, taux normalisés 25/20/15 %), les invocations deviennent Fournaise Invoquée (l’Appel, la largeur compte les renforts), et les cartes nommées gardent leur geste sur une base d’école : Nuit de Cendres, Fournaise Éternelle, Linceul de Suie, Fournaise de Calcine, Colère de Vulcain. Les sauvegardes passent en v13 : les sorts connus d’un biome trié se re-mappent sur leurs crans. Le combat ne change pas : le digest reste le même.

## [1.5] — 2026-11-10 — Le rôle sort de l’affichage

LE RÔLE ATTAQUE/SUPPORT DISPARAÎT DE LA FICHE ET DES LIBELLÉS. La grille identité de la fiche garde Classe, Élément et Rareté ; le bloc des sorts croisés parle de gestes (panser, frapper), plus de camps. Le champ moteur reste purement interne : il trie les lignes d’équipe, il ne décrit plus la carte. Aucune mécanique ne change, le combat reste exactement le même (digest inchangé).

## [1.4] — 2026-11-10 — Le boost vise son camp

LE BUG DE CIBLAGE DU SORT DE BOOST EST CORRIGÉ. La fenêtre d’action ne décide plus du camp selon le rôle de la carte : elle lit la fiche du sort. Discipline de Ligne (soi) se pose sur son lanceur, sans liste de cibles ; Ferveur Céleste (1 allié) propose vos cartes ; et le moteur applique un vrai bonus d’ATQ pour la prochaine frappe au lieu de frapper l’ennemi. En mode Auto, le chemin historique ne bouge pas : le combat automatique reste exactement le même (indice de force et digest inchangés).

## [1.3] — 2026-11-10 — Les naissances dans la nature

TOUT CE QUI ENTRE AU ROYAUME DES NAISSANCES. (1) DEUX NAISSANCES OFFERTES au départ : l’Épéiste Novice et le Prêtre Novice rejoignent la collection, jouables immédiatement. (2) NAISSANCES SAUVAGES : chaque étage de donjon vaincu offre 2 % de chance qu’une naissance se joigne à vous, toujours bornée par vos déblocages. (3) LA TABLE DES JETONS PASSE EN DONNÉES ET DEVIENT CONFORME à la décision 8 : à chaque palier de donjons bouclés, la commune reste au taux de référence (50 %) et le taux décroî avec la rareté (palier 3 : 50/45/5, palier 5 : 50/40/10) — les paliers précédents favorisaient la peu commune, corrigé. Le moteur gagne les tirages purs : une naissance, une rareté de jeton.

## [1.2] — 2026-11-10 — La pierre d’éveil

L’ÉVEIL TROUVE SA MONNAIE. Une naissance (rang N) ne paie plus ses éclats pour s’ouvrir : son éveil consomme une PIERRE D’ÉVEIL, hors éléments. Les boss des donjons en lâchent rarement, le défi du jour en offre une chaque victoire, et la Forge affiche la réserve. Les autres rangs gardent leurs éclats ; la voie choisie, l’Ascendance et les sorts accumulés ne changent pas.

## [1.1] — 2026-11-10 — Le rang Naissance

LES NAISSANCES QUITTENT LA COMMUNE. Les 12 naissances raciales (les 4 Novices, les 5 Embryons — ex-Bestiaux — et les 3 Enge) passent au rang N, un cran sous la commune : elles n’ont encore rien choisi, on les amène où l’on veut. Le jeton et le défi du jour tirent désormais des naissances, jamais d’autres communes ; les cartes divines (Ange, Démon, Éveillé du Seuil) restent la porte du camp divin jusqu’à l’Esprit Divin. La puissance du rang N est calibrée 10 % sous la commune, et le glossaire s’ouvre sur le nouveau rang.

## [1.0] — 2026-11-10 — La refonte majeure

LE MONOLITHE DEVIENT MODULAIRE. Les donnees vivent desormais dans data/ (cartes, monstres, ecoles, grimoire a crans, arbres de race, zones), le moteur dans src/engine/ en modules purs, et dist.html est regenere par build.mjs. LES ARBRES DE RACE (v17) : crans +10/+20/+30 % en donnees, l’Ange Eveille remplace l’Ange Gardien, communes deleguees (Pousse des Seves, Fidele du Jour). LES SORTS (v2.3) : 8 ecoles, grimoire a crans I-IV, fusion des Marees (30 signatures -> 7 uniques + 23 fondues), fin du verrou de classe. LE MODE RPG : agilite et intelligence, mult sur la stat principale, la zone de 3, l’ordre du tour sur l’agilite, les taux contre les seuils. LES ZONES D’ERRANCE : cadence zone/donjon, recoltes, apprentissage des crans. Sauvegardes migrees de v8 a v12 sans perte.

## [0.47.3] — 2026-11-10 — Combat v2.1

LE CHANTIER DE PRÉSENTATION DU COMBAT, BAPTISÉ RÉTROACTIVEMENT. Rail d'ordre du tour (tout le monde dans l'ordre d'agilité, acteur doré, lueur sur vos cartes, KO grisés), combat AUTO en mode Tactique (démarre seul, bouton Pause / Lancer le tour), actions détaillées au tour du joueur (badge d'école, coût, méta école · ×puissance · zone, texte du sort), fiche complète (grille identité classe/élément/rareté, oppositions, sorts détaillés). Moteur et équilibrage inchangés.

## [0.47.2] — Source d’images au choix

Un bouton 🖼️ dans l’en-tête bascule les illustrations des cartes entre DreamShaper XL (assets.json, par défaut) et WAI-Illustrious v17 (assets-wai.json, campagne comparative), mémorisé entre les visites. Aucun impact sur le moteur.

## [0.47] — Tranche-Monde et Nuit Éternelle

LES SORTS SIGNATURE NE RÉPÈTENT PLUS LE NOM DE LEUR CARTE. Le sort L du Sabre (« Kenji : Sabre Céleste ») devient Tranche-Monde ; le sort L de l’Ombre (« Kira : Nuit Sans Fin ») devient Nuit Éternelle. « Kenji : Zénith Tranchant » reste ; l’Aube garde son exception assumée : Aube Éternelle, le plus fort sort de l’aube porte le nom de sa carte (Léna).

## [0.46] — Le RPG tour par tour

LE CHANTIER PROMIS. Le mode 🧭 Tactique devient un vrai tour de RPG : plus de panneau à remplir en bas de page. Chaque tour, les cartes des deux camps agissent une par une, de la plus forte attaque à la moins forte (la vôtre d’abord à égalité). Quand vient le tour d’une de vos cartes, une fenêtre s’ouvre pour elle : illustration, points de vie, attaque, mana — puis ses choix : ⚔ Attaque, sorts ✦ avec leur coût (atténués si le mana manque), ➕ Souffle Croisé pour les attaquants, ⏸ Attendre pour économiser le mana. Désignez ensuite la cible : ennemie à frapper ou allié à soigner, dans une liste cliquable — et le pion correspondant s’illumine sur le plateau. L’action s’exécute aussitôt, animée, puis la carte suivante joue, et les ennemis agissent de la même façon sous vos yeux. Le ciblage des ennemis, demandé au retour du terrain, est enfin explicite.

## [0.45] — Rien de caché, des pions à voir

SIX RETOURS DU TERRAIN CORRIGÉS. (1) Le code brut à la place de l’emoji disparaît : le bouton 🤖 « Auto ce tour », l’en-tête du panneau Tactique et les récompenses affichent enfin leurs pictogrammes. (2) Le menu ☰ reste joignable EN COMBAT : la navigation s’ouvre par-dessus l’écran, opaque et déroulante. (3) Le panneau Tactique n’est plus jamais coupé : il défile à l’intérieur de sa zone. (4) Les pions de combat grandissent (128 px, boss 162 px) et deviennent plus carrés : l’illustration occupe presque toute la carte, nom et stats en surimpression. (5) L’écran de combat ne coupe PLUS rien : si l’écran est trop petit, le contenu défile à l’intérieur de l’écran. (6) Les sorts spéciaux n’assombrissent plus le plateau : une bande compacte (illustration du lanceur + nom du sort) passe au-dessus sans rien masquer.

## [0.44] — Le combat plein écran

DEUX DEMANDES DE TERRAIN APPLIQUÉES. (1) Le combat tient sur UN SEUL ÉCRAN : en exploration la page ne scrolle plus, ni en bas ni sur les côtés — titre, boutons, plateau, panneau Tactique et journal se partagent la hauteur de l’écran, et les rappels restent compacts. (2) Les cartes s’agrandissent partout où l’image a sa place : collection, familles, équipe et fiche — les futures illustrations s’y liront ; en combat, chaque carte reste un pion lisible et l’image se loge en fond de carte.

## [0.43.1] — Correctifs terrain

QUATRE RETOURS DU TERRAIN APPLIQUÉS. (1) Le plateau applique une TAILLE UNIFORME : chaque carte garde la même largeur dans les deux camps, quel que soit le nombre de voisines — seul le boss garde sa prestance. (2) Le modificateur de run redevient réellement OPTIONNEL : l’accepter est gratuit (butin majoré), entrer sans lui aussi — seul le REMPLACEMENT du tirage coûte 1 éclat brut. Plus aucune obligation d’éclat pour refuser. (3) La collection montre la PORTE de chaque famille : le novice (ou la greffe) qui y entre figure en tête de chaîne. (4) Les anciennes branches SR (Yuki, Onyx, Naïa…) sont ARCHIVÉES : hors des tirages et des arbres, visibles seulement dans la section archives si vous en possédez.

## [0.43] — La grammaire des sorts, le plateau en ligne et l’indice de force

PLUS DE FAUX JUMEAUX, PLUS DE NIVEAUX VIDES. Chaque carte connaît désormais ses sorts par couches : le COMMUN (2✦), le sort DE RACE (3✦), le sort DE CLASSE (4✦) et sa SIGNATURE (5✦). L’Épéiste Novice et le Bestiau des Cieux ne partagent plus que le commun, et le Prêtre Novice a enfin son grimoire complet : des soins gradués, du pansement à la bénédiction. Le panneau Tactique détaille nom, coût et infobulle de chaque sort — y compris pour les soigneurs — et le Souffle Croisé est étiqueté pour ce qu’il est : une action d’équipe, pas un sort. Le plateau passe à une seule ligne par camp : fini la ligne support repoussée à l’arrière. Et la force conseillée des donjons devient un INDICE pondéré (ATQ, PV, rareté, nombre de sorts), auto-calibré sur le boss final réel — un niveau moyen ne veut rien dire : une équipe de SR niveau 5 n’est pas une équipe de communes niveau 5.

## [0.42] — Les modificateurs de run

CHAQUE EXPLORATION A SON TARIF. En entrant dans un donjon, un modificateur est tiré et montré AVANT le combat : 🐗 la Horde (+1 ennemi par vague, butin +20 %), 🕯 le Mana Stérile (régénération −1 pendant le combat, points +25 %), 🛡 la Muraille (ennemis +25 % PV, éclats +50 %), ⚔ la Rage Partagée (ennemis +15 % ATQ, points +40 %). La face rude paie la face compense : les points, les chances d’éclats d’évolution et de régression suivent le modificateur accepté. Le refuser coûte 1 éclat brut et le run se joue sans modificateur ; sans brut, on entre avec le tirage. Le moteur de vague reçoit le modificateur en paramètre OPTIONNEL — sans modificateur, le digest de 3000 combats reste IDENTIQUE (dormance prouvée).

## [0.41] — Les nouvelles lignées (patch 3.3)

LE RACCORDEMENT COMPLET, ZÉRO NOUVELLE CARTE. (1) Le Bestiau des Cieux (n9) ouvre ses trois voies vers le Zénith : la Légion Solaire (Arbalétrier Doré), les Phénix Célestes (Essor de Flammes), le Clergé du Plein Jour (Chapelain du Jour) — des chaînes qui montent jusqu’à SR/UR. (2) Les naissances divines entrent dans les lignées du Seuil : l’Ange (n13) rejoint les Arbitres, le Démon (n14) le Chœur Miroir, l’Éveillé du Seuil (n15) les Tisseuses du Pont ; les maillons de soudure (d3→d4, d9→d10, d15→d16) relient les lignes secondaires du web divin : les trois chaînes courent du C au L (Kairos, Écho, Ananké). (3) La voie de la suie poursuit : f3 évolue vers sa rare (f8). (4) AUDIT DES VIEILLES CARTES FERMÉ : les 5 solos d’origine deviennent des naissances raccourcies vers les chaînes humaines (Garde-Promesse → la garde, Étincelle Vive → la braise, Médecin de Camp → l’aube, Veilleur d’Acier → l’ombre, Pilier Mécanique → le bouclier) ; les jetons continuent de ne donner que les naissances raciales ; il ne reste hors architecture QUE les 7 branches SR (b1-b7), dormantes par design pour les futurs choix de palier.

## [0.40] — Le Mode Tactique

LE JOUEUR PREND LES COMMANDES : à chaque tour, en mode Tactique, chaque carte de la ligne choisit son action — attaque simple, un de ses sorts (soins et invocations sont des sorts comme les autres), le soin croisé des attaquants, ou attendre pour économiser le mana — et sa cible (ennemi pour frapper, allié pour soigner). « Lancer le tour » résout, « Auto ce tour » laisse l’IA jouer un tour. Le moteur ne change PAS : le plan remplace l’IA au point d’injection, le chemin auto reste au digest identique. ET les récompenses suivent le prorata des tours tactiques : tout en Tactique = intégrales, tout en auto = ÷ 2 (pts, éclats, XP).

## [0.39] — Les jalons dans l’architecture

CORRECTIF (retour terrain v0.38) : les jalons (premier donjon terminé, première Difficile) proposaient une carte Rare / Super Rare AU CHOIX parmi… les vieilles cartes de familles (c.family), hors architecture. Désormais les 3 propositions sont toujours des MAILLONS DES VOIES humaines (Paladin, Chevalier, Bretteur, Sorcière des Rivières…), sur les arbres définis. Avec la v0.38, il ne reste plus AUCUN chemin qui donne une carte hors architecture : jetons, défi du jour et jalons ne distribuent que des naissances raciales, des maillons de voie ou des naissances locales de biome.

## [0.38] — Les naissances raciales

CORRECTIF (retour terrain) : les jetons de génération donnaient les vieilles cartes de familles (Étincelle Vive, Rôdeur des Ombres, Servante de l’Ombre…) au lieu des naissances de la nouvelle architecture. Désormais un jeton ne donne QUE la naissance, au hasard — les 4 Novices, les 5 Bestiau, les 3 Enge, Ange / Démon / Éveillé du Seuil ; le jeton humain raffiné entre au maillon d’une voie (UC, 15 % R) ; le jeton d’évolution, au palier indiqué d’une voie raciale ; le défi du jour tire lui aussi une naissance raciale. Les vieilles cartes restent au catalogue (autel, futurs raccourcis). Et l’élément NEUTRE s’affiche enfin : ⚪ sur la carte, « ⚪ Neutre — hors oppositions » sur la fiche, au glossaire et à la collection — les naissances raciales naissent neutres, l’élément arrive avec la voie.

## [0.37] — Le correctif des invocations, les voies des races

CORRECTIF (retour terrain, boss final de la Forge) : les invocations (Golem de Fournaise du Seigneur des Cendres, Familier des Foyers...) faisaient PLANTER le combat — l’animation cherchait leur carte au catalogue et l’exception gelait la partie sans fin (combat bloqué, défaite sans explication). Elles s’affichent désormais : nom du sbire, arrivée visible 🕯, fiche au clic, et le combat se termine toujours. Patch 3.2 : les communes raciales ouvrent leurs VOIES vers les nœuds existants des webs — Bestiau des Eaux (pillage des récifs, berges), des Flammes (suie, fournaise, goblin), du Vivant (mousse, sèves), des Ténèbres (gouffre, deuil marin, devoir brisé), Enge des Brumes (la forme Sirène), des Bois (la forme Dryade), des Caveaux (les trois formes de la mort) ; le Bestiau des Cieux et les naissances divines (Ange, Démon, Éveillé) attendent leurs nœuds du patch 3.3 — trappes visibles, pas de trous cachés.

## [0.36] — Les choix de voie

Le premier choix du joueur arrive : à la première évolution, chaque Novice ouvre ses VOIES — l’épéiste (guerrier, protection, sylvestre), le mage (Eau, Feu, Sylvains, ou la lumière : l’élue rejoint la lignée du prêtre), le prêtre (la foi ou la garde), le voleur (assassinat, quais, fête) ; la Forge et la fiche affichent un bouton par voie et le choix est définitif pour l’exemplaire. Éclats GARANTIS en donjon (retour terrain) : 1 éclat brut par boss d’étage, 2 au boss final, plus la gemme de difficulté ; la fausse ligne « carte bonus du donjon » disparaît. Premier donjon recalibré : bonus de découverte renforcé (−30 % étages 1-5, −20 % 6-9, −55 % au boss final) et XP de run doublée jusqu’au premier bouclage — l’équipe de départ boucle l’Antre des Marées en ~3 runs (simulation : médiane 3, max 5). La collection est réorganisée par RACE (humaine et ses arbres, monstre et ses webs, mystique et ses familles d’accueil, divine) ; les textes obsolètes (éclats, v0.34) sont retirés. La fiche fusionne le Pouvoir dans la liste des sorts et chaque sort affiche ses dégâts concrets au niveau courant.

## [0.35] — La grande réparation

Les donjons ne droppent plus de cartes : le boss final lâche un JETON de génération, 1 par jour et par donjon (rareté selon les donjons bouclés), la première victoire finale d’un donjon offre un jeton bonus de son biome, et les jalons distribuent des jetons (humain raffiné, race, évolution). Les cartes naissent à la Forge. Jetons typés avec inventaire groupé : humain, humain raffiné (PC garantie, 15 % Rare), race, monstre, mystique, divine, évolution, biome. Captures et jauge de boss supprimées ; les monstres ne se capturent plus. La mécanique support/attaque disparaît des interfaces : les cartes font tout. Le mode manuel devient un vrai tour par tour (défaite seulement au tour 60). Courbes de donjons corrigées : la puissance grimpe de façon strictement croissante, boss compris (plus de salle plus dure que la suivante), niveaux conseillés abaissés (étage 10 du premier donjon : équipe de niveau ~17, salle 4 visée dès 10-12). L’Éclat de régression ne tombe plus qu’à partir de Difficile (1,2 %), puis Cauchemar (2,5 %) et Enfer (5 %). Départ à 5 jetons (2 humains, 1 humain raffiné, 2 races). 15 communes raciales : les 4 Novices (qui évoluent vers leur discipline), les 5 Bestiau, les 3 Enge, Ange, Démon et Éveillé du Seuil — le premier choix n’est pas au joueur, il est dans la carte. Cartes et textes agrandis sur téléphone, emplacements d’équipe sur deux lignes. Glossaire, donjons et onboarding mis à jour.

## [0.34] — Le rework des races

La race devient une donnée de fiche : Humaine (la référence), Monstre (+10 % de stats de base), Mystique (+20 %), Divine (+30 %) — la régression comble l’écart en entrant dans la race plus forte. L’élément Divin disparaît : les 18 cartes du Seuil prennent un vrai élément (Arbitres Lumière, Chœur Miroir Eau, Tisseuses du Pont Terre), l’Astre Capiteux devient divine, et le bonus des divines passe sur la race. Le défi du jour débloque une commune de n’importe quelle race (50 % humaine, 30 % monstre, 15 % mystique, 5 % divine) plus un éclat brut de son élément. Départ : 3 jetons de génération (l’humain garanti, les 4 races au tirage, une race non humaine au tirage — tous communs). L’Éclat de régression apparaît : il tombe dans tous les donjons (taux selon la difficulté) et ouvrira la régression — nouvelle carte au palier R, 100 % des sorts, 10 % des stats. Le modèle d’évolutions typées (standard, partage, convergence, régression, chute, malédiction, événement, secrète) et le verrou en fiche sont posés. Migration des sauvegardes : les gemmes de l’élément Divin deviennent des gemmes de Lumière.

## [0.33.2] — Deuxième retour terrain

Jetons : aléa propre à la page (plus de doublon identique après rechargement) et révélation face cachée retournée d’un appui (jeton, autel, évolution, halo selon la rareté). Départ à 5 jetons pour une première équipe complète. Bonus de découverte : les premiers étages du premier donjon sont affaiblis en Facile tant que l’étage 3 n’a jamais été vaincu. Après une défaite, relance immédiate de l’exploration. Le combat se lance tout seul dès l’entrée du donjon (sauf en mode manuel). Vitesse ×32 réellement instantanée (plateau seul), ×16 garde un léger rythme. Fiche : un sort de soin indique son soin (plus de « puissance ×1,5 » trompeur), un attaquant indique sa frappe en % d’ATQ, le Pouvoir est daté et expliqué, et l’appui court sur une carte déjà en équipe ouvre sa fiche.

## [0.33.1] — Retours terrain

Fiche lisible : stats réelles par niveau affichées, pouvoir documenté sur chaque carte, effets actifs (avec source) au clic en combat, étage verrouillé, vitesses ×16/×32 réelles (animations coupées), cartes plus grandes. Acquisition sans boutique : les boosters disparaissent — donjons (jauge de boss, captures), jetons, autel, jalons, défi divin. Plus de nourrir ni de sacrifice : les niveaux viennent de l’XP de donjon, les doublons passent par l’autel. Éclats bruts aussi aux étages intermédiaires.

## [0.33] — Méta de l’Ascension

Niveaux 1-20 par exemplaire individuel (niveau, Ascendance et nom propres), évolution dès le niveau 10 avec des éclats (jamais d’or), sorts cumulés à l’évolution, Ascendance +0,5 % par niveau d’attente, autel 5-pour-1, jetons de fin de donjon, boosters reworkés sans Légendaire au prix progressif quotidien ×1,5, XP de run avec fatigue quotidienne par carte.

## [0.32] — retours de terrain

La sauvegarde survit aux pages intégrées (stockage de secours en mémoire) et s’exporte en code depuis l’accueil. Le bouclier passif des Guerriers cesse de se doubler ; les vagues d’un étage sont fixes pour la journée ; le booster du défi passe à des slots déterministes (Légendaire : 5 % par booster) ; les monstres et cartes divines évoluent à la Forge le long de leur ligne de famille ; vitesses ×0,5 à ×32, lots ×20/×50, récapitulatif de fin de donjon, filtre par rareté, statuts visibles en combat et fiches détaillées.

## [0.31] — défi du jour et familles divines

Chaque jour, un défi divin : cinq cartes hors opposition tirées des trois familles divines — Arbitres du Seuil (contrôle du temps), Chœur Miroir (copie et renvoi de sorts), Tisseuses du Pont (liens chaînés). La victoire offre un booster du défi, seule source de ces cartes. Une par famille en équipe, trois maximum, +10 % dégâts et soins dès deux.

## [0.30] — tous les donjons en familles

Le Bosquet, la Crypte et le Zénith se rangent en familles : Bêtes du Fougeron, Gens des Sèves, Spectres des Caveaux, Naufragés, Chevalerie Défunte, Légion Solaire, Phénix Célestes, Clergé du Plein Jour. 45 nouvelles cartes, dont les Mythiques La Mort et Apolline ; le Phénix renaît de ses cendres.

## [0.29] — Forge en familles, glossaire

La Forge Cendrée se range en 3 familles (Cendrels, Enfants de la Braise, Gobelin des Fumées) et cette page naît pour documenter tout le jeu. Les monstres croisés en donjon comptent désormais comme découverts.

## [0.28] — six classes

Occultiste 🔮 et Invocateur 🕯️ rejoignent les 4 classes d’origine : malédictions (−ATQ temporaire, les boss résistent) et invocations de sbires temporaires. Une grande partie des monstres des Marées change de classe.

## [0.27] — illustrations

Un chargeur d’assets habille les cartes au premier lancement, le jeu reste léger à charger.

## [0.26] — familles et contrôle encadré

Les Marées s’affichent en grandes familles à la collection. Le contrôle passe sous embargo : un sort de contrôle (étourdissement, poison, malédiction…) ne s’applique que si son sort est lancé, côté joueur comme côté ennemis.

## [0.25] — statuts et effets

Le moteur apprend 10 effets : poison, renvoi, invocations, ranimation, liens, cri de guerre…

## [0.24] — équipes libres

Les postes attaque/support fixes deviennent 5 emplacements libres, et les niveaux se gagnent par carte (plus par exemplaire), conservés à l’évolution.

