# Session questions-réponses — la direction du jeu (préparée le 11/11, tranchages du 12/11 intégrés)

> Objet : la grosse session de tranchage du 12/11. Chaque point se lit : **ACTÉ aujourd'hui** (arbitrages + data) → **proposition de Marc-Olivier** (retours du 11/11 soir, 2e tour) → **questions à trancher** → **mon avis**. Convention posée par Marc-Olivier : un tranchage récent prime sur un ACTÉ antérieur ; tout ce qui n'est pas tranché ici reste PROPOSÉ. Les points 1 à 3 conditionnent tous les autres : les trancher en premier. **Section 0 (10e-11e tours)** : tableau de bord consolidé des tranchages de Marc-Olivier, avec l'étude de recherche demandée dans `docs/design/recherche-direction-2026-11-12.md`.

## 0. État de la session du 12/11 — ce qui est VALIDÉ, ce qui RESTE À TRANCHER

> Demandé par Marc-Olivier (11e tour) : séparer clairement le validé du reste. Rien de la colonne « reste à trancher » ne bouge sans décision explicite.

### ✔ VALIDÉ / TRANCHÉ (décisions de Marc-Olivier, session du 12/11)

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

Suite de la session (10e-11e tours, même soir) :

15. **Taille d'équipe : 3 actifs + 2 en réserve** (recommandation de l'étude acceptée ; switch en combat coûtant le tour du nouveau venu, réserve à XP réduite).
16. **But du jeu : Le Lieur** (« l'unité des quatre races », les quatre verbes de recrutement : allégeance, pacte, énigme, consécration) retenu comme colonne vertébrale ; les propositions Échiquier (multi-fins) et Silence du Zénith (reconnaissance par donjon) restent puisables pour la fin et le nommage.
17. **Type « terre » renommé Nature.**
18. **HP/MP : persistance partout** (errance comprise) ; **restauration gratuite en ville et à l'autel, objets en donjon** ; **aucun soin automatique post-combat** (régénération après victoire refusée).
19. **XP PAR COMBAT** : chaque combat distribue l'XP immédiatement (formule par étage inchangée, donjons compris — fin du modèle « XP de run » cumulée en fin de run) ; la fenêtre de fin de combat affiche **l'XP gagnée par chaque personnage, les objets trouvés et l'or gagné**. → chantier v1.39 lancé (`docs/prompt-correctifs-v1.39.md`, couloir 1).
20. **Mode auto SUPPRIMÉ** du combat joué : boutons « Mode : Auto » et « 🤖 Auto ce tour », préférence `combatAuto`, pénalité de récompenses des tours auto — tout disparaît ; l'auto-résolution interne du moteur reste pour le futur mode « missions spéciales » (expéditions), qui ne s'appellera pas « auto ». → chantier v1.39.

Suite de la session (12e tour) :

21. **Fusion, forme exacte TRANCHÉE** : enfant **niveau 1** ; **25 % des stats cumulées des parents, plafonné par la rareté de l'enfant** (le bonus d'héritage ne peut pas dépasser un pourcentage max de la base de l'enfant, défini par rareté — une commune fusionnée à fond reste utile mais ne dépasse pas objectivement une légendaire de même niveau, la rareté garde son sens de potentiel) ; **2-3 sorts hérités** (dont sorts de famille, jamais le signature de l'enfant) ; rareté de l'enfant par **table de synthèse** en `data/`. Pourcentages exacts du plafond : en data au moment de la spec fusion.
22. **Carte du monde TRANCHÉE : 3-4 cartes régionales FIXES multibiomes** (recommandation de l'étude acceptée) — attachement au lieu, gating lisible, coût maîtrisé ; errance intérieure et profondeurs générées par seed comme aujourd'hui.
23. **Expéditions TRANCHÉES : temps réel plafonné** (style DQ Treasures / Poké Jobs) — missions 4/8/12/24 h résolues par l'auto-résolution interne du moteur, drops exclusifs + XP, plafond de durée à définir en spec.
24. **Fin du jeu TRANCHÉE : fins multiples à l'Échiquier des Quatre** — Le Lieur reste la colonne vertébrale (les quatre verbes de recrutement), l'Échiquier fournit les fins : imposer une race, l'équilibre, ou soi-même, selon la race liée en priorité. Post-fin et endgame après la dernière chaîne royale : à designer.

Suite de la session (12e tour, fin — tranchages oraux de Marc-Olivier) :

25. **Carte du monde AFFINÉE : 4 cartes multibiomes** (le « 3-4 » est tranché à 4), régionales fixes.
26. **Remplacement sur K.O. TRANCHÉ** : switch volontaire = le tour de l'entrante est consommé (inchangé) ; par contre quand un personnage meurt, le remplaçant entre SANS consommer de tour — il arrive automatiquement et ne joue qu'à partir du tour suivant. Intégré au Lot A (`docs/prompt-refonte-direction.md`).
27. **Donjons divins TRANCHÉS : 3 donjons**, chacun avec sa chaîne de difficulté et une progression sous-bosses → boss final — **Démons** : sous-bosses (ex. la succube) puis le **roi des démons** ; **Anges** : anges élémentaires puis le **grand ange de lumière** ; **Équilibre** : sous-bosses puis **Ananke** dans sa version supérieure.
28. **Mécanique des fins TRANCHÉE** : fins multiples (Échiquier, point 24) ; la fin finale dépend (a) des **choix faits à chaque chaîne de donjon : LIER la race ou la RENIER**, (b) du **nombre de créatures liées par race** dans la collection. Nos choix déterminent où l'on finit. Lore à écrire (surcoût assumé).
29. **Élément des sorts TRANCHÉ : libre par carte + grimoires**, avec tout de même **2-3 sorts spécifiques par famille** (signatures : sirènes, monstres…), quelques sorts spécifiques par race, et un gros palier de sorts libres/uniques. Piste ouverte à étudier : **des sorts par biome** plutôt que par race (à statuer en spec contenu).
30. **Équipement TRANCHÉ : 6-8 emplacements par carte** (proposition validée) ; **panoplies par famille × classe, SÉLECTIVES** (pas toutes les familles × toutes les classes) : ex. panoplie des sirènes → magiciens, monstres marins → guerriers/prêtres, gobelins → chamanes, le roi → guerriers, la sirène → assassins ; répartition par biome/donjon à faire en spec.
31. **Fusion × familles TRANCHÉE (en principe, oral Marc-Olivier)** : la **famille est conservée** ; le palier n'est pas automatiquement lié à la fusion (la table désigne l'enfant et sa rareté). **Table de synthèse de familles à la DQM** : certaines paires → l'une des deux familles **au hasard** ; d'autres paires → **automatiquement une TROISIÈME famille désignée** : humain + monstre aquatique → **sirène** ; humain + ent/arbre → **dryade** ; humain + ange → **demi-ange** (n'existe pas encore : à incarner via les **éveillés**, race divine à part, ou des créatures intermédiaires/maléfiques à créer). Les hybrides naissent donc DANS la fusion (table), pas comme un système séparé.
32. **Lignées exclusives initiales : DIRECTION ACTÉE EN PRINCIPE (à préciser en spec, Marc-Olivier hésite encore sur la forme exacte)** : choix initial parmi **3-4 familles uniques spéciales** (une par race, façon starter : novice, bestiole, ange, démon…), **prédominantes** : la fusion y reste (on ne sort pas de la famille par fusion) ; les non-choisies rencontrables **très tard dans le jeu** (précédent Pokémon : starters non choisis récupérables en fin de jeu), capture très difficile ou au-delà de la moitié du jeu, ou éventuellement incapturables. Restent à définir : 3 ou 4, composition exacte, sort final des non-choisies, moment du choix.
33. **Baseline digest TRANCHÉE (13/11, « verrouiller maintenant »)** : la mesure du grand lancement **`9faff1b9…` 838/3000 / `6103e7b0…` 2795/10000 est VERROUILLÉE** comme baseline de référence (remplace la v1.34 `c62fcbd1…`/`5059e683…`). Aucun digest codé en dur dans le moteur ; toute dérive future est MESURÉE contre cette baseline avant nouveau verrouillage.
34. **Ascendance RETIRÉE (rappel du tranchage oral, 13/11)** : plus de bonus « +X % Ascendance » gravé à l'évolution ; mécanique et affichages supprimés, évolutions conservées, migration des saves. Voir `docs/prompt-correctifs-v1.51.md` lot 1 et `docs/arbitrages.md` (suite 6).
35. **Signatures des soigneurs TRANCHÉES (13/11)** : le sort signature d'une carte à effet de soin SOIGNE (allié le plus blessé), n'attaque plus — corrige les 15 Prêtres dont l'Ange « Éclat d'Aube » ; MESURE digest contre la baseline 33.
36. **Splash Mage : fiche explicite TRANCHÉE (13/11)** — la fiche unifiée dit « cible + éclats à 50 % sur les autres » (aucun changement de maths) ; le retrait ÉVENTUEL du splash (calibrage) est DIFFÉRÉ au point « reste à trancher » n°3.

### ⏳ RESTE À TRANCHER (rien ne bouge sans décision explicite)

1. **Ops en attente** (Marc-Olivier : « on regardera ça plus tard », DIFFÉRÉ) : ~~verrouillage de la baseline~~ **FAIT 13/11 : nouvelle baseline VERROUILLÉE** (`9faff1b9…`/`6103e7b0…`, point 33) ; restent les échecs smoke préexistants (43 B, 45 e, B1 c, B29 h — correctif lot 1 en cours), validations téléphone ET PC (S24/S25 à rejouer, S26 à faire), maquette habillage boucle v2 (couloir design).
2. **Forme finale des lignées exclusives initiales** : le point 32 est acté en principe ; la composition exacte (3 ou 4 familles, sort des non-choisies, moment du choix) se statuera avec la spec contenu v4 et le lore Le Lieur.
3. **Splash des Mages (différé, décision de Marc-Olivier 13/11)** : la fiche l'explicite dès v1.51 (cible + 50 % sur les autres, voulu) ; faut-il GARDER ce splash ou le retirer ? Le retirer change le calibrage (digest à re-mesurer) — à trancher plus tard, rien ne bouge avant.
4. **Variance individuelle des stats (différé, question de Marc-Olivier 13/11)** : les stats des monstres sont FIXES par carte + niveau, SANS aléa individuel (pas d'IV/nature Pokémon — formule `makeUnit`, réponse détaillée `docs/historique/revue-v1.51.md` §5) ; les variations observées viennent de l'adoucissement des premiers combats, de l'étage et du cran de race. Faut-il INTRODUIRE une variance individuelle « à la Pokémon » ? Ce serait un tranchage de design à part (impact digest : MESURE obligatoire). Statut actuel : déterministe.
5. **Temps réel des combats — PARTIELLEMENT TRANCHÉ (13/11, étude + diagnostic UX de Marc-Olivier)** : le jeu est DANS la norme du genre en tours (10,1 en miroir équilibré vs 8-10 VGC doubles ; 6,8 en flux donjon — étude `docs/design/etude-duree-combats-2026-11-13.md`). **TRANCHÉ** : layout ADAPTATIF avec invariant « la fenêtre d'action ne recouvre jamais le terrain » + paquet lisibilité complet (impacts ~600-800 ms, trace source→cible, pause avant fenêtre suivante, mini-log permanent, fiches flottantes) — chantier `docs/prompt-ux-combat-adaptatif.md`. **RESTE À TRANCHER** : vitesses par contexte (errance rapide / donjon réfléchi — Marc-Olivier teste d'abord, réglage manuel en attendant) ; et si raccourcissement de tours voulu malgré tout : ATK×1,25+HP×0,85 = −26 % (recalibrage, nouvelle baseline).
6. **Guerriers de la lignée « rempart » (différé, constat de Marc-Olivier 13/11)** : Gardien-Mécanique (C, atk 2) et Argus (UR, atk 6) sont des Guerriers quasi inoffensifs. Options : A) ATK remontée (s4 → 6 ; s11 → 12-14, MESURE digest) ; B) gimmick riposte/provocation (tank actif) ; C) statu quo. Rien ne bouge sans tranchage.

## 1. Identité du jeu — recherche demandée (DQM Joker vs Pokémon vs Final Fantasy)

**Demande explicite** : « ce n'est pas une question, c'est une demande. Il faut faire une recherche là-dessus. »

**Ce que font ces jeux** (recherche du 11/11 : Dragon Quest Wiki (Fandom) — scouting, synthesis ; guide GameFAQs DQM:Joker ; RPGamer, test de Joker 3) :

- **Dragon Quest Monsters: Joker** : équipes de **3 monstres** ; recrutement au combat par « scout attack » (démonstration de force, pourcentage de réussite affiché) ; **synthèse** : deux monstres fusionnés en un monstre supérieur (dans Joker 3, choix de l'enfant parmi plusieurs possibilités), héritage d'une part des stats et des compétences des parents ; les monstres inactifs gagnent un peu d'XP ; la collection est large mais le jeu pousse une équipe courte et fusionnée.
- **Pokémon** : équipe de 6, collection massive, chaque créature garde son identité ; progression par zones débloquées et badges.
- **Final Fantasy (tour par tour)** : groupe fixe et petit (≈ 4-10), chaque personnage a une mécanique très creusée ; pas de collection.

**Où en est Lignées** : ~330 cartes jouables potentielles (150 personnages + 180 monstres env.), familles C→L avec paliers d'évolution et fusion, recrutement naturel ~1 %, formation 3+2 / 2+3 (5 cartes), marchand + acquisitions à la boutique. Structurellement, on est **déjà plus proche de DQM** (collection large + fusion + équipe courte) que de FF.

**TRANCHÉ (12/11)** : le modèle **DQM-like est ASSUMÉ** ; FF est écarté comme référence de feeling (« pas beaucoup joué, pas nostalgique ») mais reste utile en comparaison de systèmes ; la collection vise ~330 cartes jouables (150 persos + 180 monstres env.), la question « large vs profondeur » est reportée.

**Question restante (étude livrée le 12/11)** : taille de l'équipe — garder 5 (3+2 / 2+3) ou resserrer vers 3 (DQM) ? L'étude comparative demandée est dans `recherche-direction-2026-11-12.md` section 4 : **aucun jeu à grande collection ne met 5 actifs** (DQM 3+3 réserve, Monster Sanctuary 3, Clair Obscur 3 sur 6, FFX 3 sur 7, Suikoden 6 sur 108 = l'exception à combats plats) ; recommandation : **3 actifs + 2 en réserve** (switch coûtant un tour, réserve à XP réduite), combats ~2× plus rapides. **Nombre d'équipes : 3, TRANCHÉ. Taille d'équipe TRANCHÉE (12/11, fin de session) : 3 actifs + 2 en réserve** — à spec moteur (la formation 3+2/2+3 actuelle évolue vers cette structure).

## 2. Lore et but du jeu — « le jeu manque énormément de lore »

**ACTÉ aujourd'hui** : rien de formel. Des matériaux existent : l'Ascendance, les Enge, le Jeune Séraphin, les trois familles divines (seuil / miroir / pont), les oppositions d'éléments, les cinq donjons (Marées, Forge, Bosquet, Crypte, Zénith). **TRANCHÉ (12/11)** : le lore se bâtit sur les **quatre races** (humains, monstres, mystiques, divins), d'autres races possibles plus tard. Nostalgie revendiquée : Dofus (monstres dehors, donjons par famille), DQM, Pokémon. Ce qui est exclu : « tuer le grand méchant démon » (cliché), gérant de compagnie/marchand d'esclaves (trop gestion, malaisant) ; « dominer le monde » assumé comme **plus classe** mais à habiller. Aucune carte ne représente le joueur aujourd'hui — l'identité du joueur est à définir.

**Recherche livrée (12/11)** : quatre propositions de but, basées sur les quatre races, dans `recherche-direction-2026-11-12.md` section 13 —

1. **Le Lieur** (« l'unité retrouvée ») : le joueur lie les quatre races (allégeance, pacte, énigme, consécration), retisse le Serment, rouvre l'Ascendance. Le recrutement EST le lore.
2. **L'Échiquier des Quatre** (domination, multi-fins) : les quatre races jouent l'âge du monde ; le joueur est la pièce inclassable ; fins : imposer une race, l'équilibre, ou soi-même.
3. **Le Silence du Zénith** : les divins se sont tus ; chaque donjon bouclé au palier royal fait d'une race une alliée reconnue ; but : être reconnu des quatre et rouvrir le Zénith.
4. **La Charte** (domination douce) : le dernier habilité à lier toute race ; but : faire de sa maison l'autorité reconnue des Quatre.

**Mon avis** : la 1 et la 2 se combinent (Lieur en prémisses, Échiquier en fins) ; la 3 est la plus économe en contenu neuf.

**Questions à trancher** :

1. **Le BUT du jeu** : **TRANCHÉ (12/11, fin de session) : Le Lieur** (« l'unité des quatre races »).
2. **Fin et post-fin** : **TRANCHÉ (12/11, 12e tour) : fins multiples à l'Échiquier des Quatre** — selon la race liée en priorité (imposer une race, l'équilibre, ou soi-même) ; Le Lieur reste la colonne vertébrale, l'Échiquier fournit les fins. Post-fin/endgame après la dernière chaîne royale : à designer.
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

**Question posée le 12/11** : une seule carte géante (auto-générée ?) vs une carte par biome vs multibiomes ? L'étude (recherche section 12) recommandait **3-4 cartes régionales FIXES de 4-5 biomes** (multibiomes assumés), errance intérieure et profondeurs générées par seed comme aujourd'hui : attachement au lieu, gating lisible, coût maîtrisé. **TRANCHÉ (12/11, 12e tour) : 3-4 cartes régionales fixes multibiomes.**

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

**Questions restantes** : (1) **Nature TRANCHÉ (12/11, fin de session)** ; (2) l'élément d'un sort vient-il de la famille ou est-il libre par carte (proposition : lié à la famille + grimoires pour sortir du schéma) ? ; (3) migration de sauvegarde et digest (les maths de résistance changent → re-mesure documentée).

## 5. Progression des cartes : niveaux 1→100 + fusions (challenge demandé)

**ACTÉ aujourd'hui** : paliers de famille (C→UC→R→SR→UR→L), fusion C + matériaux, XP par niveau déjà en place (XP_GROWTH 0.25), montée d'évolution sans perte nette.

**TRANCHÉ (12/11)** : niveaux **1→100 ACTÉS**. La rareté = le point de départ ; une commune montant 1→100 sans fusion, avec un des meilleurs équipements du jeu, doit **rivaliser avec une légendaire** ; les légendaires commencent elles aussi **niveau 1** — l'équilibre : chaque carte gagnée se monte, aucune n'est « déjà forte ». La montée des lignées/évolutions est conservée. **XP PAR COMBAT TRANCHÉE (12/11, 11e tour)** : chaque combat distribue l'XP immédiatement (formule par étage inchangée, donjons compris — fin du modèle « XP de run »), la fenêtre de fin de combat affiche l'XP par personnage, les objets et l'or ; chantier v1.39 (`docs/prompt-correctifs-v1.39.md`, couloir 1).

**Fusion (ADORÉE — forme TRANCHÉE le 12/11, 12e tour)** — l'étude DQM est dans `recherche-direction-2026-11-12.md` section 7 :

- **DQM The Dark Prince** : parents consommés, enfant **niveau 1**, hérite **1/4 des stats cumulées** des parents, jusqu'à 3 talents (moitié des points investis conservés), rang par table de synthèse, bonus « + » selon le niveau des parents.
- **Forme TRANCHÉE pour Lignées** : enfant **niveau 1** toujours ; **25 % des stats cumulées des parents, plafonné par la rareté de l'enfant** (le bonus d'héritage est borné : il ne peut pas dépasser un % max de la base de l'enfant, défini par rareté en `data/` — deux parents très montés ne donnent pas à une commune des stats de légendaire, la rareté reste le potentiel max) ; **2-3 sorts hérités** (dont sorts de famille, jamais le signature de l'enfant) ; rareté par **table de synthèse** en `data/` ; le **mystère préservé** (collection : on voit la carte, pas la descendance — ACTÉ en principe).
- La question posée par Marc-Olivier (« est-ce que l'enfant revient niveau 1 ou récupère des stats des parents ? ») a une réponse dans les précédents : **les deux** — niveau 1 ET héritage partiel.

**Cohabitation avec les familles/paliers** (mon challenge initial, toujours ouvert) : (a) recommandé — niveau + famille conservés, la fusion fait grimper le palier ET garde le niveau 1, la L de famille reste un but ; (b) niveau seul, familles cosmétiques. Borner le grind : bonus de fusion = accélérateurs, pas multiplicateurs ouverts.

**Drops et acquisitions rares (TRANCHÉ en principe le 12/11)** : en errance, drops R/SR à taux très faible (pas de L en farm libre) ; événements qui débloquent ponctuellement des rares ; **un cadeau rare tôt dans le jeu** (précédent gacha : première rare offerte pour accrocher, « oh, j'ai une super-rare alors que je n'ai que des communes ») ; **lignées uniques au choix initial** parmi quelques familles (exclusives, choix définitif).

**Questions à trancher** : (1) valider la forme de fusion recommandée : **TRANCHÉE (12/11, 12e tour) — validée telle quelle** ; (2) cohabitation avec familles/paliers (a ou b) ; (3) forme du bonus de fusion précoce ; (4) le choix initial de lignée exclusive : combien de familles proposées, quand, irréversible ? ; (5) impact digest accepté (re-mesure documentée).

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
7. **Interactions d'errance cassées (signalé le 12/11, 12e tour, diagnostiqué par le couloir pilotage) : la porte du donjon et le retour à la ville ne réagissent pas au clic/tap — obligé de passer par le menu**. Causes vérifiées dans le code : (a) `src/ui.js` ne pose `st.pending` QUE si la tuile cliquée est exactement la tuile porte/retour/autel alors que les bâtiments sont peints plus larges (`src/errance-paint.js`) → la plupart des clics ne font rien ; (b) le déclenchement exige ensuite `Math.hypot(hero − centre) < 1,6` et une tuile praticable dans un carré ±2 → une cible à ~2 tuiles de la praticable la plus proche ne se déclenche jamais ; (c) si A* abandonne (`ev.abandoned`), silence total ; (d) le retour envoie vers `go('#terres')` alors que le toast annonce « Retour à la ville » → doit aller vers `#accueil` (hub-ville, ACTÉ 11/11). **Correctif v1.40 lancé** : `docs/prompt-correctifs-v1.40.md` (hitbox bâtiment + anneau 8-voisinage, toast de confirmation au clic, praticable au 8-voisinage prioritaire, déclenchement immédiat si déjà à portée, seuil recalé ~1,9, toast « chemin bloqué », retour → `#accueil`, garde-fous tests génératifs sur les 5 zones).

## 10. Nouvelles mécaniques issues de la session (12/11) — à trancher puis à spec

1. **Équipe de réserve/repli** (l'idée « switch quand l'équipe principale meurt/est affaiblie ») : étude section 5 de la recherche — recommandation **3 actifs + 2 en réserve** intégrée à l'équipe, switch coûtant un tour ; l'équipe de repli entière à réserver au mode exploration. Précéder le calibrage du niveau max (Suikoden 108 étoiles = 6 actifs : la contre-référence).
2. **HP/MP limités entre combats** (pour forcer le choix des sorts) : recherche APPROFONDIE le 12/11 soir, après challenge de Marc-Olivier (« la majorité des jeux ne reset pas la vie entre chaque combat, à la limite le mana ») — **il a raison** : la convention du genre (DQ XI, Pokémon, SMT V, FF classiques) est que **HP et MP persistent entre les combats**, restaurés en ville (auberge/feu de camp/autel) et via objets ; le reset complet après chaque combat est l'exception (Monster Sanctuary, système décrit comme « unique » par la presse ; DQM Joker probable, à confirmer). Recommandation révisée : **persistance partout, errance comprise**, points de repos en ville + consommables + sorts de soin coûteux en MP. **TRANCHÉ (12/11, fin de session) : restauration gratuite en ville et à l'autel, objets en donjon ; aucun soin automatique post-combat.**
3. **Expéditions/patrouilles** (envoyer des cartes en quêtes 4/8/12/24 h, drops exclusifs + XP) : validée par les précédents (DQ Treasures, Poké Jobs) ; à trancher : temps réel vs temps de jeu ; recommandation temps réel plafonné. **Note 11e tour** : le mode auto du combat (supprimé en v1.39) servira CE mode — l'auto-résolution interne du moteur reste disponible pour résoudre les missions spéciales, qui ne s'appelleront pas « auto ». **TRANCHÉ (12/11, 12e tour) : temps réel plafonné.**
4. **Pierre d'évolution divine** (2-3 par partie, humains → divins, etc.) : ACTÉE en principe, spec à écrire ; l'inverse (divin → humain) à envisager.
5. **Choix forcés** : lignées exclusives initiales, branches verrouillées, pierres limitées — ACTÉ en principe, répartition exacte à définir.

## 11. Ordre des chantiers proposés après la session

1. **LANCÉ (12/11, 12e tour) : chantier v1.40** (couloir 1) — bugs d'interactions d'errance (point 9.7) : `docs/prompt-correctifs-v1.40.md`, un lot unique, à exécuter après v1.39.
2. **LIVRÉ (12/11, grand lancement, clôture) : GRAND LANCEMENT unifié** — 11 étapes en un commit FR chacune (v1.40 → v1.50), 252 tests verts, smoke nouveaux checks B8b/B8c, digests MESURÉS étapes 2-4 (`5bdb0c6d…`/`1122225c…` → `daef2bca…`/`883c1c18…` → `9faff1b9…`/`6103e7b0…`), baseline PROPOSÉE en clôture d'arbitrages (jamais appliquée sans tranchage), validation IHM S26 ajoutée (téléphone+PC). Voir `docs/arbitrages.md` (entrées v1.41-v1.50). Avant : **LANCÉ (12/11, 12e tour)** : `docs/prompt-grand-lancement.md` — fusion de la refonte direction (4 lots A-D de `docs/prompt-refonte-direction.md`) et de la vie du jeu (6 lots 0-5 de `docs/design/spec-vie-jeu-v1.md`), exécution d'une traite, un commit FR par lot, clôture unique (rapport + validation IHM téléphone ET PC + scénarios + docs + push + CI). Ordre : v1.40 → A → B → crits (maths, MESURE) → C → D → 0 → 2 → 3 → 4 → 5. **Lot A : formation 3 actifs + 2 réserve** (switch volontaire = tour de l'entrante ; **remplacement sur K.O. automatique et GRATUIT, l'entrante joue au tour suivant**, réserve à 50 % d'XP, pas de bump de save) ; **Lot B : oppositions calculées SORT contre CIBLE** (école du sort vs élément inné de la cible, humains Neutres, frappe simple = élément de la carte, renommage Terre → Nature, topologie inchangée) ; **Lot C : persistance HP/MP partout** (suppression de la régénération post-boss et des soins entre runs, restauration gratuite ville + autel, objets en donjon, K.O. persistants) ; **Lot D : capture à la DQM à l'écran Récompenses** (% affiché = taux de zone × démonstration de force, pas les boss/nommés) + **vendeur unique à 3 offres quotidiennes en JETONS** (donjons bouclés, jalons, quêtes ; jamais d'or ; compagnons/jour à l'or supprimés). Lots A, B et crits : digests CHANGENT → MESURE par lot + UNE nouvelle baseline PROPOSÉE en clôture, verrouillage par Marc-Olivier ; épreuve de recrutement humains/mystiques HORS périmètre (viendra avec le lore Le Lieur).
3. **Bugs rapides** (couloir 1, dès la fin de la session) : le point 9 (hors 9.7,pris en charge par v1.40), rien de contestable.
4. **Specs des ACTÉS de ce soir** : sets d'équipement/panoplies, navigation/hub, Boutique + Inventaire onglets, gating des acquisitions, retour ville + état des donjons, décor d'errance au niveau maquette (formation 3+2, oppositions au sort, restauration HP/MP et capture/jetons : couverts par la refonte direction ci-dessus).
5. **Tranchages restants** (avant tout spec moteur, voir section 0 « reste à trancher ») : carte régionale vs géante, forme de la fusion, expéditions, équipe de repli, choix initial de lignée exclusive, fin du Lieur.
6. **Selon tranchage** : architecture errance × donjons (« 25 donjons » en chaînes), niveaux 1→100 + fusion, chaîne des donjons divins — gros chantiers, avant tout contenu v4.
7. **En parallèle (couloir design)** : arts série 3 (en cours), maquette habillage boucle v2 (en attente de validation), héros d'errance propre.
8. **Attendent** : redesign de l'IA de combat (après errance et calibrage ; guidé par le skill `docs/skills/game-ai/`) ; calibrage (MESURE après chaque changement de maths, jamais de recalibrage sauf tranchage) ; systèmes HUR/HSR et hybrides « H » (différés après 1→100).

**Validations en attente de Marc-Olivier** : v1.50 (grand lancement, scénario IHM S26) sur téléphone ET PC (baseline digest VERROUILLÉE le 13/11, point 33) ; v1.32 sur téléphone ET PC ; maquette habillage boucle v2 (couloir design) ; lots visuels v1.37 (S24/S25 du protocole IHM) sur téléphone ET PC.
