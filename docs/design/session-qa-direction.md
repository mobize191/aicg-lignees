# Session questions-réponses — la direction du jeu (préparée le 11/11, tranchages du 12/11 intégrés)

> Objet : la grosse session de tranchage du 12/11. Chaque point se lit : **ACTÉ aujourd'hui** (arbitrages + data) → **proposition de Marc-Olivier** (retours du 11/11 soir, 2e tour) → **questions à trancher** → **mon avis**. Convention posée par Marc-Olivier : un tranchage récent prime sur un ACTÉ antérieur ; tout ce qui n'est pas tranché ici reste PROPOSÉ. Les points 1 à 3 conditionnent tous les autres : les trancher en premier. **Section 0 ajoutée le 12/11 soir (10e tour)** : les tranchages oraux de Marc-Olivier, consignés, avec l'étude de recherche demandée dans `docs/design/recherche-direction-2026-11-12.md`.

## 0. Tranchages de la session du 12/11 (10e tour) — l'état du jeu après les réponses de Marc-Olivier

**TRANCHÉ / ACTÉ ce jour** :

1. **Identité DQM-like ASSUMÉE** (Dragon Quest Monsters: Joker comme référence première ; Pokémon et FF en comparaison, FF moins nostalgique). 3D exclue : « si déjà on a des animations, ce serait déjà pas mal ».
2. **Nombre d'équipes : 3 conservé** (« au pire c'est 3, on verra plus tard »).
3. **Éléments : on ne retire PAS l'élément des cartes.** Un monstre aquatique reste aquatique, un golem de feu reste feu, un démon reste démon, un ange reste ange. **Les humains sont Neutres** (précédent Dofus : l'élément Neutre existe). **Les sorts sont typés AUSSI** (oppositions calculées au sort) : une sirène a surtout des sorts d'eau, un humain peut apprendre le feu. **Renommer « terre »** — candidats : Nature (recommandé) ou Plante, à choisir.
4. **Grimoires en zones ouvertes ACTÉS en principe** : déblocage de sorts par palier via l'errance ; les sorts se débloquent aussi **par niveau de la carte** selon sa classe et sa famille (les niveaux 1-4 de sorts actuels sont conservés).
5. **Progression 1→100 : POUR.** Rareté = puissance de départ ; une commune niveau 100 bien équipée (sans fusion) doit pouvoir rivaliser avec une légendaire ; les légendaires commencent elles aussi niveau 1. La montée des lignées/évolutions est conservée.
6. **Fusion DQM-style : ADORÉE, ACTÉE en principe.** Forme exacte à trancher (l'étude recommande : enfant niveau 1, 25 % des stats cumulées des parents plafonné par rareté, 2-3 sorts hérités, rareté par table de synthèse).
7. **Collection : mystère des lignées ACTÉ en principe** — on voit la carte, pas toute sa famille ; la fusion garde une part de surprise.
8. **Chaînes de donjons à la Dofus ACTÉES en principe** : donjon X → version « royale » ~10 niveaux au-dessus ; chaque boss droppe des ressources **uniques** servant au **craft des panoplies** (7-8 pièces, bonus de panoplie) ; ~un donjon tous les 5 niveaux ; **deux difficultés** par donjon (normal / royal).
9. **Équipement : panoplies complètes ACTÉES en principe** — au-delà d'arme/armure (amulette, bottes, bracelets…), « raisonnable » ; **sets assignables conservés** (un set mage de feu s'attribue à la carte jouée, sans tout rééquiper) ; bonus de set à paliers.
10. **Capture en errance ACTÉE en principe** (monstres) + recrutement humains/mystiques par épreuve (pas de « capture » au sens esclavagiste) ; **UN vendeur** gardé : offres quotidiennes exceptionnelles achetées en **jetons déblocables par la progression** (pas en or).
11. **Base de lore : les quatre races** (humains, monstres, mystiques, divins) — le lore se construit dessus ; d'autres races possibles plus tard.
12. **Évolutions divines limitées ACTÉES en principe** : 2-3 « pierres d'évolution divine » dans tout le jeu pour faire passer un humain en divin (etc.) ; à terme aussi l'inverse ; le but : à la fin du jeu, les choix restent limités, on ne transforme pas tout le monde.
13. **Donjons divins à ajouter** : aucun donjon divin aujourd'hui (hors Zénith/phénix) — une chaîne Démons, une chaîne Anges, un donjon de l'Équilibre (Ananke) à designer.
14. **Drops rares en errance** (R/SR à taux très faible, jamais L en farm libre) + événements + **un cadeau rare tôt dans le jeu** (précédent gacha : première rare/super-rare offerte pour accrocher) ; **lignées exclusives au choix initial** (choisir parmi des familles uniques, choix irréversible à creuser).

**DIFFÉRÉ** : systèmes HUR/HSR et hybrides « H » (shiny ou hybrides de fusion) — « on va déjà essayer de faire 100, sinon on va vite se perdre ». Y revenir après.

**À TRANCHER EN SUITE** (recherche livrée, questions posées) : taille d'équipe (3+2 recommandé vs garder 5), but du jeu (4 propositions), Nature vs Plante, carte régionale vs géante, persistance HP/MP, expéditions (validées par précédents, calibrage à trancher), équipe de repli.

## 1. Identité du jeu — recherche demandée (DQM Joker vs Pokémon vs Final Fantasy)

**Demande explicite** : « ce n'est pas une question, c'est une demande. Il faut faire une recherche là-dessus. »

**Ce que font ces jeux** (recherche du 11/11 : Dragon Quest Wiki (Fandom) — scouting, synthesis ; guide GameFAQs DQM:Joker ; RPGamer, test de Joker 3) :

- **Dragon Quest Monsters: Joker** : équipes de **3 monstres** ; recrutement au combat par « scout attack » (démonstration de force, pourcentage de réussite affiché) ; **synthèse** : deux monstres fusionnés en un monstre supérieur (dans Joker 3, choix de l'enfant parmi plusieurs possibilités), héritage d'une part des stats et des compétences des parents ; les monstres inactifs gagnent un peu d'XP ; la collection est large mais le jeu pousse une équipe courte et fusionnée.
- **Pokémon** : équipe de 6, collection massive, chaque créature garde son identité ; progression par zones débloquées et badges.
- **Final Fantasy (tour par tour)** : groupe fixe et petit (≈ 4-10), chaque personnage a une mécanique très creusée ; pas de collection.

**Où en est Lignées** : ~330 cartes jouables potentielles (150 personnages + 180 monstres env.), familles C→L avec paliers d'évolution et fusion, recrutement naturel ~1 %, formation 3+2 / 2+3 (5 cartes), marchand + acquisitions à la boutique. Structurellement, on est **déjà plus proche de DQM** (collection large + fusion + équipe courte) que de FF.

**TRANCHÉ (12/11)** : le modèle **DQM-like est ASSUMÉ** ; FF est écarté comme référence de feeling (« pas beaucoup joué, pas nostalgique ») mais reste utile en comparaison de systèmes ; la collection vise ~330 cartes jouables (150 persos + 180 monstres env.), la question « large vs profondeur » est reportée.

**Question restante (étude livrée le 12/11)** : taille de l'équipe — garder 5 (3+2 / 2+3) ou resserrer vers 3 (DQM) ? L'étude comparative demandée est dans `recherche-direction-2026-11-12.md` section 4 : **aucun jeu à grande collection ne met 5 actifs** (DQM 3+3 réserve, Monster Sanctuary 3, Clair Obscur 3 sur 6, FFX 3 sur 7, Suikoden 6 sur 108 = l'exception à combats plats) ; recommandation : **3 actifs + 2 en réserve** (switch coûtant un tour, réserve à XP réduite), combats ~2× plus rapides. **Nombre d'équipes : 3, TRANCHÉ.**

## 2. Lore et but du jeu — « le jeu manque énormément de lore »

**ACTÉ aujourd'hui** : rien de formel. Des matériaux existent : l'Ascendance, les Enge, le Jeune Séraphin, les trois familles divines (seuil / miroir / pont), les oppositions d'éléments, les cinq donjons (Marées, Forge, Bosquet, Crypte, Zénith). **TRANCHÉ (12/11)** : le lore se bâtit sur les **quatre races** (humains, monstres, mystiques, divins), d'autres races possibles plus tard. Nostalgie revendiquée : Dofus (monstres dehors, donjons par famille), DQM, Pokémon. Ce qui est exclu : « tuer le grand méchant démon » (cliché), gérant de compagnie/marchand d'esclaves (trop gestion, malaisant) ; « dominer le monde » assumé comme **plus classe** mais à habiller. Aucune carte ne représente le joueur aujourd'hui — l'identité du joueur est à définir.

**Recherche livrée (12/11)** : quatre propositions de but, basées sur les quatre races, dans `recherche-direction-2026-11-12.md` section 13 —

1. **Le Lieur** (« l'unité retrouvée ») : le joueur lie les quatre races (allégeance, pacte, énigme, consécration), retisse le Serment, rouvre l'Ascendance. Le recrutement EST le lore.
2. **L'Échiquier des Quatre** (domination, multi-fins) : les quatre races jouent l'âge du monde ; le joueur est la pièce inclassable ; fins : imposer une race, l'équilibre, ou soi-même.
3. **Le Silence du Zénith** : les divins se sont tus ; chaque donjon bouclé au palier royal fait d'une race une alliée reconnue ; but : être reconnu des quatre et rouvrir le Zénith.
4. **La Charte** (domination douce) : le dernier habilité à lier toute race ; but : faire de sa maison l'autorité reconnue des Quatre.

**Mon avis** : la 1 et la 2 se combinent (Lieur en prémisses, Échiquier en fins) ; la 3 est la plus économe en contenu neuf.

**Questions à trancher** :

1. **Le BUT du jeu** : quelle proposition (ou quelle combinaison) ?
2. **Fin et post-fin** : multi-fins ? nouveau cycle ? endgame après la dernière chaîne royale ?
3. **Une histoire écrite** : oui/non ; si oui, sous quelle forme (un doc lore court, intros de zones, PNJ de l'errance) ?
4. **Nommage lore des 5 paliers** (Facile → Enfer aujourd'hui ; étages 1→5 demain) : noms thématiques à définir.
5. **Récompenses des donjons au-delà du drop** : TRANCHÉ en principe le 12/11 — les drops uniques du boss servent au craft des panoplies ; restent à définir : déblocages de zones, morceaux d'histoire par donjon.
6. **Forcer les choix du joueur** : TRANCHÉ en principe le 12/11 — lignées exclusives au départ (choix parmi des familles uniques, irréversible), pierres d'évolution divine en nombre limité (2-3 par partie), branches d'arbres qui se verrouillent après choix ; à préciser par système.
7. **L'avatar du joueur** : le joueur a-t-il une carte/un rôle qui le représente (le Lieur, la pièce inclassable…) ?

## 3. Architecture donjons × errance — l'idée « 25 donjons » (challenge demandé)

**L'idée de Marc-Olivier telle que je l'ai comprise** (à valider mot à mot en session) :

- Chaque donjon a **5 étages** : étage 1 facile → étage 5 ultra difficile (les 5 modes actuels deviennent des étages internes).
- Boucler l'étage N **débloque une zone d'errance intérieure** : l'étage vaincu devient visitable comme un vrai biome d'errance (pas un couloir à murs), avec découvertes, labyrinthes, interactions.
- Les Terres Sauvages du biome offrent des **profondeurs** : surface / profondeur 1 / 2 / 3, correspondant aux étages du donjon.
- **Une seule grande carte continue** : on marche de biome en biome, animations de blocage tant que le donjon précédent n'est pas bouclé. Ressenti total : « 25 donjons ».

**Ce que ça a de fort** : une seule carte à construire au lieu de N écrans ; récompense visible et originale (l'étage vaincu devient espace de jeu) ; progression lisible par étage ; cohérent avec le faux-monde-ouvert à la Pokémon (zones révélées à mesure qu'on avance).

**TRANCHÉ (12/11, en principe)** : la logique Dofus des **chaînes de donjons par famille** est actée — donjon des Gobelins des Marées bouclé → donjon des Gobelins Royaux (~10 niveaux au-dessus, mêmes lieux environ), le boss royal droppe des ressources **uniques** → craft de panoplie ; **deux difficultés par donjon** (précédent Wakfu Stasis : difficulté choisie à l'entrée, meilleur loot) ; « un donjon tous les 5 niveaux » sur 1→100 ≈ 20-25 donjons, l'intuition tient ; **des donjons divins à ajouter** (chaîne Démons, chaîne Anges, donjon de l'Équilibre/Ananke — aujourd'hui aucun donjon divin hors Zénith/phénix).

**Question posée le 12/11** : une seule carte géante (auto-générée ?) vs une carte par biome vs multibiomes ? L'étude (recherche section 12) recommande **3-4 cartes régionales FIXES de 4-5 biomes** (multibiomes assumés), errance intérieure et profondeurs générées par seed comme aujourd'hui : attachement au lieu, gating lisible, coût maîtrisé. **À trancher.**

**Points de vigilance (mon challenge)** :

1. **Coût de production** : 5 biomes × 4 profondeurs ≈ jusqu'à 20 décors distincts. Recommandation : les profondeurs = variations de palette/densité du biome, pas des zones entièrement nouvelles.
2. **Répétitivité** : errer dans un donjon déjà vaincu doit servir (récoltes rares, énigmes, PNJ cachés, spawns exclusifs), sinon c'est un couloir de plus.
3. **Gating** : définir ce qui bloque (étage bouclé ? palier global ?) et ce que voient les zones verrouillées (brume, barrière animée).
4. **Deux modes par étage ?** : la porte du donjon = mode « course » (combats enchaînés, l'actuel) ; l'errance intérieure = mode « exploration ». À confirmer.
5. **Ordre des donjons** : le digest mesure le **Bosquet plus dur que la Forge** (46,5 % vs 58,1 % de victoires) — l'intuition de Marc-Olivier dit l'inverse. L'ordre proposé (Marées → Bosquet → Forge pour l'étage 1, puis par étage) demande soit re-mesure, soit échange des deux positions.

**Questions à trancher** : (1) valider le modèle étages × errance intérieure ; (2) profondeurs = variations ou vraies zones ; (3) ce qui bloque la grande carte ; (4) récompenses de l'errance intérieure ; (5) l'ordre des 5 donjons par étage (et le point Bosquet/Forge) ; (6) le calendrier des chaînes ajoutées (gobelins → royaux, sirènes → grande sirène, bêtes marines…) et des donjons divins ; (7) carte régionale vs géante (recommandation : régionale).

## 4. Cartes : l'élément — TRANCHÉ (12/11) : on garde l'élément des cartes ET les sorts sont typés

**ACTÉ aujourd'hui** : chaque carte porte un élément (7 biomes), oppositions dans le moteur, familles élémentaires, affichage classe · élément · rareté.

**La proposition initiale** (retirer l'élément des cartes, élément porté par les sorts) est **REMPLACÉE par le tranchage du 12/11** :

- **Les monstres gardent leur élément inné permanent** (un ent est nature, un golem de feu est feu, un démon est démon, un ange est ange) — « ils ont toujours tous leurs éléments ».
- **Les humains sont Neutres** (précédent Dofus : l'élément Neutre existe à côté de Terre/Eau/Air/Feu).
- **Les sorts sont typés AUSSI** : les oppositions se calculent au sort. Une sirène a surtout des sorts d'eau (et lumière/ténèbres possibles, peu de nature/feu) ; un humain neutre peut apprendre des sorts de n'importe quel élément via grimoires.
- **Renommer « terre »** : candidats **Nature** (recommandé — couvre ent, champignons, spores) ou **Plante** (canonique Pokémon). À choisir en session.
- **Grimoires en zones ouvertes ACTÉS** : déblocage de sorts par palier dans l'errance + sorts débloqués par niveau de la carte selon classe et famille (niveaux 1-4 conservés).

**Impact** : le moteur d'oppositions doit calculer au sort (plus au porteur) ; l'affichage carte montre l'élément inné (monstres) ou Neutre (humains) ; l'affichage sort montre l'élément du sort. La migration reste un chantier moteur, mais moins destructeur que le retrait total (les familles élémentaires restent valables).

**Questions restantes** : (1) Nature ou Plante ? ; (2) l'élément d'un sort vient-il de la famille ou est-il libre par carte (proposition : lié à la famille + grimoires pour sortir du schéma) ? ; (3) migration de sauvegarde et digest (les maths de résistance changent → re-mesure documentée).

## 5. Progression des cartes : niveaux 1→100 + fusions (challenge demandé)

**ACTÉ aujourd'hui** : paliers de famille (C→UC→R→SR→UR→L), fusion C + matériaux, XP par niveau déjà en place (XP_GROWTH 0.25), montée d'évolution sans perte nette.

**TRANCHÉ (12/11)** : niveaux **1→100 ACTÉS**. La rareté = le point de départ ; une commune montant 1→100 sans fusion, avec un des meilleurs équipements du jeu, doit **rivaliser avec une légendaire** ; les légendaires commencent elles aussi **niveau 1** — l'équilibre : chaque carte gagnée se monte, aucune n'est « déjà forte ». La montée des lignées/évolutions est conservée.

**Fusion (ADORÉE, ACTÉE en principe, forme à trancher)** — l'étude DQM est dans `recherche-direction-2026-11-12.md` section 7 :

- **DQM The Dark Prince** : parents consommés, enfant **niveau 1**, hérite **1/4 des stats cumulées** des parents, jusqu'à 3 talents (moitié des points investis conservés), rang par table de synthèse, bonus « + » selon le niveau des parents.
- **Recommandation pour Lignées** : enfant niveau 1 toujours ; 25 % des stats cumulées des parents **plafonné par la rareté de l'enfant** ; 2-3 sorts hérités (dont sorts de famille, jamais le signature de l'enfant) ; rareté par table de synthèse en `data/` ; le **mystère préservé** (collection : on voit la carte, pas la descendance — ACTÉ en principe).
- La question posée par Marc-Olivier (« est-ce que l'enfant revient niveau 1 ou récupère des stats des parents ? ») a une réponse dans les précédents : **les deux** — niveau 1 ET héritage partiel.

**Cohabitation avec les familles/paliers** (mon challenge initial, toujours ouvert) : (a) recommandé — niveau + famille conservés, la fusion fait grimper le palier ET garde le niveau 1, la L de famille reste un but ; (b) niveau seul, familles cosmétiques. Borner le grind : bonus de fusion = accélérateurs, pas multiplicateurs ouverts.

**Drops et acquisitions rares (TRANCHÉ en principe le 12/11)** : en errance, drops R/SR à taux très faible (pas de L en farm libre) ; événements qui débloquent ponctuellement des rares ; **un cadeau rare tôt dans le jeu** (précédent gacha : première rare offerte pour accrocher, « oh, j'ai une super-rare alors que je n'ai que des communes ») ; **lignées uniques au choix initial** parmi quelques familles (exclusives, choix définitif).

**Questions à trancher** : (1) valider la forme de fusion recommandée ; (2) cohabitation avec familles/paliers (a ou b) ; (3) forme du bonus de fusion précoce ; (4) le choix initial de lignée exclusive : combien de familles proposées, quand, irréversible ? ; (5) impact digest accepté (re-mesure documentée).

## 6. Équipement : sets assignables + panoplies complètes (ACTÉ ce soir — spec à écrire)

**ACTÉ ce soir** : ~7 sets nommés (set assassin, set prêtre…) à affinités/capacités ; un set s'assigne à une carte, y reste jusqu'à désassignation (1 set = 1 carte à la fois) ; sets par famille/biome façon panoplies Dofus/Wakfu (gobelin → gobelin royal → sauvage) ; rareté d'équipement bornée par la rareté de la carte (N ≈ C ; C → C/UC ; UC → +R ; R → +SR ; extrémités hautes à préciser).

**TRANCHÉ (12/11, en principe)** : mode RPG complet, **panoplies à la Dofus/Wakfu** — plus que arme/armure : amulette, bottes, bracelets…, « raisonnable » ; les **sets assignables sont conservés** (un set mage de feu s'attribue automatiquement à la carte jouée : on change d'équipe sans tout rééquiper) ; bonus de panoplie par palier de pièces ; les **boss royaux droppent les ressources uniques** qui servent au craft des pièces (lien donjon → équipement → progression 1→100).

**Questions de spec** : (1) nombre exact de sets au lancement et pièces par set ; (2) les ~90 arts d'équipement (ACTÉ du 11/11 soir) deviennent-ils des pièces de sets ; (3) panoplies par famille (13 familles ?) ou par biome × classe ; (4) bonus de set (2 pièces / complet) ; (5) où vit l'assignation (page Personnage) ; (6) nombre max d'emplacements par carte (raisonnable : proposition 6-8).

## 7. Navigation et hub (ACTÉ ce soir — spec à écrire)

**ACTÉ ce soir** : menu du haut supprimé, menu latéral seul ; l'Accueil = page par défaut, toujours en fond ; chaque page a son fond propre ; petites interactions depuis l'Accueil.

**Questions de spec** : (1) transitions entre pages (fond animé commun ?) ; (2) point de retour ville dans CHAQUE zone d'errance ; (3) état des donjons affiché dans les Terres Sauvages (paliers bouclés, extraits) ; (4) l'écran d'entrée du donjon (paliers accessibles) ; (5) bouton retour partout.

## 8. Économie : gating, onglets, compagnons — capture en errance (ACTÉ ce soir + 12/11)

**ACTÉ ce soir** : hôtel de génération (compagnons) supprimé de la Guilde ; compagnons actuels jugés pas assez chers et trop forts tôt ; **gating global des acquisitions par la progression** ; Boutique en onglets (potions / éclats / armes / armures / talismans) ; Inventaire en onglets par type (cases symbole + nombre + description au clic).

**TRANCHÉ (12/11, en principe)** : les compagnons ne s'achètent plus en rayon — **ils se capturent/recrutent dans le monde** (monstres : capture à la DQM, % affiché ; humains/mystiques : épreuve de recrutement à la SMT, dialogue + condition, jamais de l'esclavage) ; **UN vendeur spécialisé subsiste** : offres quotidiennes exceptionnelles (raretés ciblées, cartes recherchées), achetées en **jetons déblocables par la progression** et non en or (protège l'économie, sert le scouting).

**Questions** : (1) la clé du gating (donjon bouclé ? étage ? zone d'errance ?) — la même pour tous les rayons ? ; (2) recalibrage des prix : Marc-Olivier va recommencer une partie à zéro pour juger (106 000 or en poche sur la partie de test : l'or se dilue) → re-mesure ensuite ; (3) le jeton : nom, sources (dungeons bouclés ? paliers royaux ?), plafond ; (4) inventaire : réutilisation en combat.

## 9. Bugs et nettoyage (à corriger directement)

1. Voir les détails d'une carte ne marche pas si l'équipe est pleine (double-clic / appui long).
2. Le double-clic / appui long ajoute la carte à l'équipe alors qu'on voulait voir ses stats.
3. Fiche carte : tous les sorts avec leur rôle (grimoire), zone vs monocible, frappe en « N (X %) » ; détails pas toujours affichés.
4. Collections : mise au propre générale.
5. Héros d'errance plus propre.
6. Décor d'errance refait au niveau de la maquette `docs/design/maquettes/errance-demo-jouable.html` (prairie peinte à variations organiques, chemin de terre, étang vivant, arbres en couches, rochers moussus, donjon à porte lumineuse, maisons fumantes, autel, hautes herbes animées, lucioles, ombres de nuages, feuilles au vent, marqueur de destination — plancher de qualité, les arts viendront par-dessus).

## 10. Nouvelles mécaniques issues de la session (12/11) — à trancher puis à spec

1. **Équipe de réserve/repli** (l'idée « switch quand l'équipe principale meurt/est affaiblie ») : étude section 5 de la recherche — recommandation **3 actifs + 2 en réserve** intégrée à l'équipe, switch coûtant un tour ; l'équipe de repli entière à réserver au mode exploration. Précéder le calibrage du niveau max (Suikoden 108 étoiles = 6 actifs : la contre-référence).
2. **HP/MP limités entre combats** (à la DQM/DQ, pour forcer le choix des sorts) : recommandation — **persistance dans le run de donjon uniquement** (Etrian Odyssey : chaque sortie est un budget), récupération hors combat en errance. À trancher.
3. **Expéditions/patrouilles** (envoyer des cartes en quêtes 4/8/12/24 h, drops exclusifs + XP) : validée par les précédents (DQ Treasures, Poké Jobs) ; à trancher : temps réel vs temps de jeu ; recommandation temps réel plafonné.
4. **Pierre d'évolution divine** (2-3 par partie, humains → divins, etc.) : ACTÉE en principe, spec à écrire ; l'inverse (divin → humain) à envisager.
5. **Choix forcés** : lignées exclusives initiales, branches verrouillées, pierres limitées — ACTÉ en principe, répartition exacte à définir.

## 11. Ordre des chantiers proposés après la session

1. **Bugs rapides** (couloir 1, dès la fin de la session) : le point 9, rien de contestable.
2. **Specs des ACTÉS de ce soir** : sets d'équipement/panoplies, navigation/hub, Boutique + Inventaire onglets, gating des acquisitions, retour ville + état des donjons, décor d'errance au niveau maquette.
3. **Tranchages restants de la session** (avant tout spec moteur) : taille d'équipe (3+2 recommandé), but du jeu (propositions 1-4), Nature vs Plante, carte régionale vs géante, HP/MP en donjon, forme de la fusion, expéditions, choix initial de lignée exclusive.
4. **Selon tranchage** : architecture errance × donjons (« 25 donjons » en chaînes), oppositions au sort, niveaux 1→100 + fusion, chaîne des donjons divins — gros chantiers, avant tout contenu v4.
5. **En parallèle (couloir design)** : arts série 3 (en cours), maquette habillage boucle v2 (en attente de validation), héros d'errance propre.
6. **Attendent** : redesign de l'IA de combat (après errance et calibrage ; guidé par le skill `docs/skills/game-ai/`) ; calibrage (MESURE après chaque changement de maths, jamais de recalibrage sauf tranchage) ; systèmes HUR/HSR et hybrides « H » (différés après 1→100).

**Validations en attente de Marc-Olivier** : v1.32 sur téléphone ET PC ; maquette habillage boucle v2 (couloir design) ; lots visuels v1.37 (S24/S25 du protocole IHM) sur téléphone ET PC.
