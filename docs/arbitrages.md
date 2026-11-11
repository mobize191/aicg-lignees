# Journal des arbitrages et décisions

> Règle : toute décision de design vit ici avec sa **date** et son **statut** (`ACTÉ` = s'applique aux data et au jeu ; `PISTE` = exploré, pas codé ; `PROPOSÉ` = en attente de Marc-Olivier). On ne contredit jamais un arbitrage ACTÉ : on propose une révision datée en dessous.

## 2026-11-11 : MESURE — boucle v2 lot 6 livré, chantier clos : baseline finale au digest N = 10 000

- **Livré** : digest final au pack **N = 10 000** : **`3f9fe198…` — 4558 victoires / 10000 (45,6 %), 0 exception, 1 marathon**, cohérent avec le pack 3000 (`f72106ff…` 1379/3000, 46,0 %). Nouvelle **baseline** consignée ici et dans `docs/roadmap.md`. Preuve finale : build ok, **128 tests** verts, smoke **210 checks** (2 échecs préexistants hors chantier), tableaux `docs/tables/` régénérés. `docs/regles-jeu.md` à jour (règles des 6 lots en IMPLÉMENTÉ). Rapport de clôture : `docs/historique/rapport-boucle-v2.md`. **Aucun ajustement de maths** : le digest est une mesure — les arbitrages d'équilibre (Zénith, taux global, prix des potions) restent ouverts jusqu'à la re-mesure finale après l'économie v2.

## 2026-11-11 : MESURE — boucle v2 lot 5 livré (progression : XP recalibrée, palier sans perte nette, solos archivés, rang N hors drops/recrutement)

- **Livré** : **courbe d'XP recalibrée sur l'échelle longue** (`moteur.XP_GROWTH = 0.25` dans `data/engine.json` : `xpToNext(lvl) = round(lvl × (1 + 0.25 × (lvl-1)))`) ; **palier d'évolution sans perte nette** : `noLossPctOf(from, to)` calcule depuis les données le bonus % garantissant que la forme suivante au niveau 1 reste au moins aussi forte (ATQ et PV) que la forme précédente au niveau 10 — calcul sur valeurs non arrondies + 1 pt de marge d'arrondi, **vérifié par simulation** (test sur toutes les cibles d'évolution + check smoke B5 c), appliqué via `inst.noLoss` dans `evolveInstance`/`applyTreeEveil` et transmis au moteur (`makeUnit`) ; **solos archivés** : 31 cartes solo marquées `archived: true` dans `data/cards.json`, exclues des tirages (`drawNaissance`, pools de naissances, `runZone`) mais toujours jouables et affichées dans « Les archives » ; **rang N achevé** : `drawNaissance` et `runZone` excluent la rareté N (les naissances viennent de l'écran de départ, des quêtes et de la Guilde ; seules les communes divines C restent la porte divine des drops), éveil N→C par la pierre d'éveil inchangé (T1.2), les naissances N restent jouables en combat. Bonus d'équipement (`card.equip`) et `noLossPct` appliqués dans `makeUnit`.
- **Preuve** : build ok, **128 tests** verts (simulation sans perte nette sur toutes les évolutions, drawNaissance jamais N, solos archivés, courbe XP), smoke **210 checks** (5 nouveaux B5 verts ; 2 échecs préexistants hors chantier), digest **inchangé `f72106ff…` 1379/3000** (le lot 5 ne touche pas les maths de combat du digest — mesure consignée, pas d'ajustement).

## 2026-11-11 : PROPOSÉ — solos archivés encore cibles d'évolution ; défi du jour tire encore du rang N

- Les 31 cartes archivées restent référencées comme cibles d'évolution (`evolutions.json` / `solo-steps.json`) : une carte qui évolue vers un solo atterrit dans les archives. PROPOSÉ : greffer les solos à des familles (roadmap contenu v3) plutôt que de casser les évolutions existantes. Le défi du jour (`drawDailyCommon`) peut encore tirer du rang N : laissé tel quel, conforme à l'arbitrage (source de N hors drops).

## 2026-11-11 : ACTÉ — maquette n°1 Accueil/hub-ville validée + révision DA (retour de Marc-Olivier)

- **La maquette n°1 (Accueil / hub-ville) est VALIDÉE** : `docs/design/maquettes/accueil-hub-ville.html` (scène hub-ville, voile, menu latéral droit Boutique/Guilde/Quêtes/Personnage/Paramètres, défi du jour, bouton Les Terres Sauvages avec pop-up équipe vide, héroïne cheveux blancs/cape noire cliquable, bouton retour, annotations DA). Elle passe au couloir 1 dans l'ordre acté ; la prochaine maquette du couloir design est l'habillage boucle v2.
- **Révision DA du hub actée** (retour de Marc-Olivier) : (1) **cadres médiévaux dorés** — double liseré or (bord or sombre + filet clair interne), petits losanges ◆ en coins sur les boutons du menu — sur TOUS les contrôles de l'app : le cadre or médiéval devient le standard des boutons v2 ; (2) **place de village ensoleillée** — lumière chaude de jour, place pavée, **fontaine centrale**, étals de marché, villageois, oiseaux. La vidéo d'ambiance WAN 2.1 14B suivra cette DA : prompting naturel « sunny medieval town square, stone fountain, bustling villagers, warm daylight, static camera » (720p_14B, réglages WAN actés en tête de journal).
- La charte graphique v2 hérite : lumière chaude de jour pour les écrans de ville, or médiéval pour les cadres de contrôles.

## 2026-11-11 : MESURE — boucle v2 lot 4 livré (drops v2, écran Récompenses, inventaire minimal, équipement sur la fiche)

- **Livré** : drops v2 — matériau de la saveur de chaque zone sur les monstres (`zones.json` `materiau.taux`), **pièce d'équipement du set de la zone + matière du boss garanties sur les boss** (étages 5/10), équipement à taux très faible (`EQUIP_DROP_RATE` = 2 %) partout ailleurs, gemmes brutes vendables (`GEM_BRUT_PRIX` = 100 or, bouton dans l'inventaire). **Écran « Récompenses »** après chaque combat gagné : or, XP, drops aux couleurs de rareté, recrues — chaque élément cliquable, « Tout ramasser » referme et rend la main (la chaîne d'étages attend la fermeture). **Inventaire minimal** (page 🎒 groupée : potions, matériaux par zone, gemmes, pièces possédées). **Équipement sur la fiche** : 2 slots par carte (arme typée par classe + armure générique) + 2 slots d'équipe, pièces éligibles au clic, stats base + bonus % appliqués au moteur (`makeUnit`), **bonus de set +5 pts %** quand arme + armure du même set (`SET_BONUS_PCT`). Catalogue en data : `data/equipment.json` (150 pièces : ligne boutique C→SR + 5 sets de zone × 3 niveaux). Migration v22 → v23 non destructive.
- **Preuve** : build ok, **124 tests** verts (makeUnit applique les bonus %, migration v23), smoke **205 checks** (10 nouveaux B4 verts ; 2 échecs préexistants hors chantier), digest **inchangé `f72106ff…` 1379/3000** (les équipes du digest n'équipent rien — mesure consignée, pas d'ajustement).

## 2026-11-11 : MESURE — boucle v2 lot 3 livré (départ à 2 cartes + recrutement naturel)

- **Livré** : écran de départ — 4 propositions, une par race (`DEPART_CHOIX` = n1/n5/n10/n13 dans `data/engine.json`), le joueur en choisit une, la seconde est aléatoire parmi les trois restantes (2 cartes au départ, plus d'équipe complète ; les 5 jetons de départ sont conservés) ; migration v21 → v22 (`departFait`, les sauvegardes commencées sautent l'écran). Recrutement naturel : ~1 % de chance qu'un vaincu **hors boss et nommés** rejoigne la collection, taux calibré **par zone** dans `data/zones.json` (`recrute.taux` : 0,8 % → 1,6 %), limite de 3 exemplaires respectée, toast de recrue.
- **Preuve** : build ok, **122 tests** verts (migration v22, `recrutableMonsters` hors boss/nommés), smoke **195 checks** (7 nouveaux B3 verts ; 2 échecs préexistants hors chantier), digest **inchangé `f72106ff…` 1379/3000** (le lot 3 ne touche pas les maths de combat — les équipes du digest sont fixes).

## 2026-11-11 : MESURE — boucle v2 lot 2 livré (niveaux de donjon 1→25, bandes de rareté, bestiaires par mode)

- **Livré** : chaque marche (donjon × mode) porte un niveau 1→25 (`dungeonLevelOf` = tier × 5 modes + mode) et une bande de rareté en données (`bande` dans `data/difficulties.json` : Facile C→R, Normal UC→SR, Difficile R→UR, Très difficile SR→L, Enfer UR→M ; boss final en haut de bande, boss intermédiaire un cran sous). `makeWave` pioche dans la bande de la marche (bestiaire thématique croissant par mode) ; le sélecteur de marche affiche « Nv X » sur chaque mode et la bande en toutes lettres sur la carte. Validateur : bande cohérente avec minR/mobCap, boss5 < boss10.
- **Preuve** : build ok, **120 tests** verts (25 marches uniques 1..25, vagues dans la bande, boss = boss5/boss10), smoke **188 checks** (5 nouveaux B2 verts ; 2 échecs préexistants hors chantier), digest **changé `f72106ff…` 1379/3000, 0 exception, 1 marathon** (les bandes recâblées changent la composition des vagues — mesure consignée, aucune retouche de maths pour viser un taux).

## 2026-11-11 : MESURE — boucle v2 lot 1 livré (potions, or, persistance, autel, migration v21)

- **Livré** : action 🧪 Objet (potions soin 30/60 % et mana 40/80 %, chaque gorgée coûte le tour, utilisables entre les étages via le bouton Objets), rayon potions de la Boutique (50/120/60/140 or, `data/potions.json`), conversion 1 ⚡ = 1 or (`OR_PER_POINT`, `store.points` → `store.gold`), **persistance PV/mana au sein d'un run** (pas de régén entre combats, effets dissous entre combats), régén complète après le premier boss (`REGEN_BOSS_STAGE` = étage 5), soins complets entre deux runs, hook `autelDeSoin()` (soin complet + `AUTEL_SOIN_GRACE` = 5 pas, contrat `errance-topdown.md` §8), migration v20 → v21 non destructive (gold = points, potions et runState initialisés).
- **Preuve** : build ok, **118 tests** verts (migration v21 + drinkPotion + action Objet), smoke **183 checks** (12 nouveaux B1, tous verts ; les 2 échecs 46 g/45 e préexistent sur main avant le chantier), digest **inchangé `aed250f9…` 1274/3000, 0 exception, 0 marathon** — attendu : le digest simule des combats isolés à PV pleins, la persistance de run et les potions ne touchent pas ses maths. Mesure consignée, pas d'objectif : aucun ajustement de maths fait pour le digest.

## 2026-11-11 : ACTÉ — prompt de lancement du chantier boucle de jeu v2 (couloir 1)

`docs/prompt-boucle-v2.md` : le prompt à copier au début de la session agent du couloir 1. Il reprend la spec (`docs/design/boucle-v2-spec-plan.md`), les 6 lots avec leur contenu, le périmètre exclu (errance, craft/Boutique complète, équilibrage final, contenu v3, IA de combat), les règles d'or et la chaîne de preuve, dont le recalibrage du digest à chaque lot qui change les maths.

## 2026-11-11 : ACTÉ — héros de l'errance + WAN 2.1 14B pour tous les cycles vidéo

- **Le héros de l'errance est arbitré** : une **femme aux cheveux blancs sous une cape noire** (Marc-Olivier, 11/11). L'art de référence v2 (WAI v17, canon §15) est débloqué dès la validation de la planche vague 1 ; ADN à inscrire au species-map (héros d'errance : 1girl, white hair, black cape). Le cycle de marche (4 directions, dos via IPAdapter) suit l'art validé.
- **WAN 2.1 14B partout** (révision de « 5B ou 14B selon l'écran ») : Marc-Olivier arbitre le 14B pour TOUS les usages vidéo (cycles de marche errance, vidéos d'ambiance Accueil/Combat, FX quand débloqués) — plus long à générer mais meilleur résultat. Réglages retenus (recherche 11/11, ComfyUI natif ou WanVideoWrapper Kijai) : modèles `wan2.1_i2v_480p_14B` (sprites/errance) et `720p_14B` (ambiances pleine page) en **fp8 e4m3fn** (RTX 5070 12 Go : fp8 + offload/blockswap obligatoires, le bf16 natif demande 65-80 Go), text encoder `umt5_xxl_fp8_e4m3fn_scaled`, VAE `wan_2.1_vae`, CLIP Vision `clip_vision_h` pour l'i2v ; ~20 steps, CFG 3-6 (flow shift ~7 pour l'i2v) ; prompting en langage naturel (umT5), pas en tags danbooru ; caméra verrouillée (`static camera`) pour les cycles de marche, 60-81 frames pour un cycle complet.
- Conséquence : le point « WAN 5B vs 14B » et « qui est le héros de l'errance » de la charte v2 §8 sont TRANCHÉS. La question « vidéo vs parallaxe par écran » reste ouverte côté déco.

## 2026-11-11 : ACTÉ — redesign de l'IA de combat programmé après l'errance et le calibrage (Marc-Olivier)

Le couloir 1 enchaînera, après le bloc visuel (économie v2 → hub-ville → errance) et le calibrage digest, un **redesign de l'IA de combat** (les « bots IA ») : choix d'actions, de sorts et de cibles, mode 🤖 Auto du joueur et comportements des ennemis. Le brief détaillé sera écrit et tranché quand le chantier arrive ; il s'appuiera sur le moteur pas-à-pas (`beginRound`/`stepRound`) et sera mesuré au digest. Inscrit en roadmap point 10 (pistes et « plus tard » renumérotés).

## 2026-11-11 : ACTÉ — ordre de production des maquettes : charte puis menu/hub d'abord (retour de Marc-Olivier)

`docs/design/design-graphisme-v2-plan.md` §1.2 réordonné : (1) charte graphique v2 transverse, (2) **Accueil/hub-ville, le nouveau menu** (colonne vertébrale du redesign), (3) habillage des nouveautés boucle v2 (départ 2 cartes, sélecteur de marche, Récompenses, Objet, Inventaire, toasts — le couloir 1 en a besoin dès les lots 3-4, et la charte évite de relooker deux fois), (4) économie v2, (5) errance Marées. L'ordre de codage du couloir 1 ne change pas (roadmap point 9).

## 2026-11-11 : ACTÉ — écran de Récompenses après chaque combat, inventaire minimal au lot 4, errance après la boucle v2 (retour de Marc-Olivier)

1. **Écran « Récompenses » après chaque combat** : or gagné, XP, drops (matériaux, pièces) aux couleurs de rareté, carte recrue le cas échéant ; chaque élément est cliquable, bouton « Tout ramasser » pour reprendre le donjon. Aucun drop invisible.
2. **Inventaire minimal dès le lot 4 de la boucle v2** (révision d'ordonnancement datée) : page Inventaire groupée (potions, matériaux par zone, gemmes, pièces possédées) + équipement posé sur la fiche (2 slots personnage arme/armure + 2 slots d'équipe, pièces éligibles au clic, stats base + bonus % et bonus de set appliqués au moteur). La maquette complète, le craft et le rayon équipement de la Boutique restent au bloc visuel.
3. **Errance après la boucle v2** : confirmé. Le chantier errance (selon `docs/design/errance-topdown.md`, hub-ville en porte d'entrée) démarre à la fermeture du lot 6 ; sprites placeholder tant que l'art du héros attend la validation de la planche vague 1.

Spec mise à jour : `docs/design/boucle-v2-spec-plan.md` (§1.6, §2, §3) ; renvoi ajouté dans `docs/design/economie-v2-catalogues.md` (§5).

## 2026-11-11 : ACTÉ — brief du couloir design/graphisme : maquettes du bloc visuel en parallèle

`docs/design/design-graphisme-v2-plan.md` : la production design/graphisme démarre en parallèle du couloir 1 (parallélisation actée). Livrables : charte graphique v2 transverse ; maquettes dans l'ordre du code (économie v2 → Accueil/hub-ville → errance, zone témoin Marées) ; habillage des nouveautés boucle v2 (départ 2 cartes, sélecteur de marche, action Objet, toasts de recrue) ; DA (héros dédié après validation de la planche vague 1 et cycle de marche WAN, série 2 prioritaire). Une maquette validée par Marc-Olivier avant codage ; le couloir ne touche ni `src/` ni `data/`. PROPOSÉ en son sein : icônes d'équipement par type et niveau (pas un art par objet).

## 2026-11-11 : ACTÉ — spec et plan d'exécution de la boucle de jeu v2 (brief du couloir 1)

`docs/design/boucle-v2-spec-plan.md` : exigences moteur/data/UI et plan en 6 lots — (1) action Objet + achat minimal de potions + suppression de la régén/persistance + hook autel + migration ; (2) niveaux de donjon 1→25 et bandes de rareté ; (3) départ à 2 cartes + recrutement naturel ; (4) drops v2 (matériaux, pièces et matière de boss, gemmes brutes vendables) ; (5) XP longue échelle + sans perte nette + solos archivés + rang N des naissances ; (6) baseline finale documentée. Le moteur d'errance avec sprites placeholder reste possible en parallèle (roadmap point 9), hors périmètre de fermeture du chantier. Références : regles-jeu §2/§5/§6, economie-v2-catalogues §1/§6, errance-topdown §7/§8.

## 2026-11-11 : ACTÉ — calibrage post-lignes et précisions boucle v2 (retour de Marc-Olivier)

Réponses aux questions du couloir 1 (entrée « PROPOSÉ — sessions 5-7 » ci-dessous) et à l'ordonnancement de la boucle v2 :

1. **Protection arrière : aucun plafond supplémentaire.** L'Option A est conservée telle quelle (l'arrière encaisse 50 % des dégâts tant que l'avant tient) ; pas de plafond de dégâts encaissés. Si la re-mesure post-boucle v2 révèle un problème, une révision datée sera proposée.
2. **Zénith et taux global : tranchage différé.** Les 17 % de victoires du Zénith et les 42,4 % globaux de la baseline `aed250f9…` sont des mesures, pas l'équilibre final : la suppression de la régén, le départ à 2 cartes, le recrutement naturel et l'XP recalibrée changent les maths. On re-mesure après la boucle v2 et l'économie v2, on ne tranche qu'une fois.
3. **Soins complets entre deux runs distincts (précision à la boucle v2).** L'état de l'équipe (PV, mana, états) persiste au sein d'un run (étages d'un donjon ; plus tard au fil de l'errance, avec ses autels) ; au démarrage d'un nouveau run, l'équipe revient à plein.
4. **Potions en combat avancées au premier lot de la boucle v2 (révision datée d'ordonnancement).** La suppression de la régén ne peut pas atterrir sans moyen de se soigner en combat : l'action Objet (potions de soin et de mana, prix Boutique actés 50 et 60 or, `docs/design/economie-v2-catalogues.md`) quitte le bloc visuel et ouvre le chantier. Le reste de l'économie v2 (Boutique complète, marchand, Guilde, quêtes, craft) reste au bloc visuel.
5. **Parallélisation design/graphisme.** Le couloir design et le graphisme peuvent produire en parallèle les maquettes de l'errance, du menu et de la Boutique sans attendre le calibrage ; l'ordre de codage du couloir 1 reste : boucle v2 → économie v2 → hub-ville → errance.

## 2026-11-11 : ACTÉ — sets d'équipement par zone, façon Dofus (retour de Marc-Olivier)

Détail dans `docs/design/economie-v2-catalogues.md` (§2, sets par zone) :

1. **Un set thématique par zone** (ex : la Sirène pour les Marées) : une **armure générique + une arme par classe** à sa saveur (épée, bâton, sceptre, dagues, focus), soit 6 pièces par set.
2. **Trois niveaux par set** : **base** (C/UC), **supérieure** (R), **royale** (SR) ; les noms suivent (Robe de la sirène → robe supérieure de la sirène → robe royale de la sirène, avec l'arme qui va avec).
3. **Craft en ville** : la base s'assemble avec les ressources courantes de la zone ; la supérieure et la royale exigent en plus la **matière du boss** du donjon de la zone (elle ne s'achète pas).
4. **Drops** : les ressources tombent partout (errance et donjons) ; les équipements peuvent tomber partout à **taux très faible** ; le boss garantit sa pièce et sa matière.
5. **Bonus de set (Dofus)** : arme + armure du même set équipées sur un personnage = **+5 points de pourcentage** sur les effets des deux pièces (calibrage v0, à affiner au digest).
6. Les sets sont la **ligne noble** de l'équipement ; la Boutique garde les paliers génériques d'entrée.

## 2026-11-11 : ACTÉ — vague 1 de la campagne v2 livrée : correctifs récurrents + verdict IPAdapter

- **Vague 1 livrée** (commit 7ecfa63, rapport `tools/out-v2/RAPPORT-vague1.md`) : 53 références nommées + 6 fonds + tests IPAdapter, 271 prompts, 0 échec de mapping espèce, budgets v2 appliqués, masters conservés. Genre constaté 30 F / 17 M / 6 bestiaux, conforme à l'arbitrage sans quota. Graines conformes. Aucune intégration dist/site : validation en attente de Marc-Olivier sur la planche.
- **Trois correctifs de prompts récurrents** (détail charte v2 §14) : (1) visage noir/encapuchonné — positif `visible face, detailed eyes, face illuminated by soft glow, front lighting`, négatif `hooded, shadowed face, covered face, black face, obscured face, dark silhouette` ; (2) quasi-monochrome — l'élément colore effets/éclairage jamais la peau ni tout le fond, positif `colorful, vibrant colors` + accent par univers, négatif `monochrome, greyscale, single color palette` ; (3) peau dénaturée (Kenji bleu) — `fair skin, human skin tone` en positif, `blue skin, colored skin, inhuman skin` + `helmet, full helmet` en négatif pour Kenji, `bareheaded, beard stubble` en positif.
- **Signature d'artiste** vue sur e22 : `artist signature, artist name` au négatif global. **f13** renforcé (`colossal, bulky, beast-like, no humanoid proportions`, négatif `hood, slim, humanoid`).
- **IPAdapter : validé mécaniquement, réglage révisé** — à 0.6 `linear` le rendu brûle les couleurs (dérive magenta/cyan sur 3 tests). Réglage vague 2 : **poids 0.3-0.45, weight_type `ease in-out`, end_at 0.8-0.9**, à re-valider avant d'étendre aux 53 lignées. La fourchette 0.5-0.7 initiale est révisée (charte §2).
- **Conséquence** : retries de la vague 1 (cartes fautives + z19/z22 avec le nouveau mapping phénix) avec seed fixe, protocole QA, max 2 retries puis human review ; correctifs intégrés au négatif standard de `build-prompts.mjs` avant la campagne des génériques.


## 2026-11-11 : ACTÉ — les phénix sont des bêtes (retour vague 1 de la campagne v2)

- **Pyrrha (z19) et Fjalar (z22) sont des PHÉNIX, de vrais oiseaux de feu, pas des humanoïdes à ailes.** La première vague les avait rendus « hommes/femmes-phénix » : c'était une erreur de tags dans `tools/species-map.json` (`phoenix girl` / `phoenix spirit, humanoid`), corrigée en `phoenixFirebird` (tags : `phoenix, giant firebird, flaming bird, bird, beak, talons, ember feathers, blazing wings, beast-like`).
- **Nouvelle règle `beast: true` dans species-map** : pour une espèce bestiale, le genre est enregistré pour la fiche et le registre, mais **jamais injecté dans le prompt** (pas de `1girl`/`1boy` sur une bête) ; les antiTags de l'espèce sont obligatoires (ici : `human, humanoid, anthropomorphic, human face…`).
- Conséquence : z19/z22 à régénérer avec le nouveau mapping (seed fixe, protocole retry du pipeline QA).

## 2026-11-11 : ACTÉ — boucle de jeu v2 : régén, niveaux de donjon, départ, recrutement, équipement, XP, évolution, solos (retour de Marc-Olivier)

1. **Aucune régénération naturelle entre les combats** : des **autels de soin** dans les zones d'errance ; en donjon, une régén **après le premier boss**. Potions, équipement +PV % et soins deviennent le cœur de la survie. Changement de maths majeur : recalibrage digest obligatoire.
2. **Niveaux de donjon 1→25 (5 donjons × 5 modes conservés)** : chaque marche fixe la puissance attendue de l'équipe et la bande de rareté : **Facile C→R, Normal UC→SR, Difficile R→UR, Très difficile SR→L, Enfer UR→M** (boss final en haut de bande, boss intermédiaire un cran sous) ; bestiaire thématique croissant par mode (Zénith : fanatiques → fanatiques endurcis → anges → archanges → l'Astre Capiteux) ; courbe simulée au digest (fin des blocages et des enchaînements imprévisibles) ; un nouveau biome rallonge la chaîne d'un donjon. La variété vient des modes, pas d'une explosion du nombre de donjons (les 25 donjons distincts sont écartés pour l'instant).
3. **Départ de partie à 2 cartes** : une **choisie parmi 4 propositions** (un novice humain, un bestial, un mystique, un divin) et une **aléatoire parmi les trois restantes** ; plus d'équipe complète de départ ; l'équipe se remplit par recrutement naturel, quêtes et Guilde.
4. **Recrutement naturel** : pas de capture (système Pokémon écarté) ; ~1 % de chance qu'un vaincu demande à rejoindre la collection (hors nommés et boss), taux calibré par zone.
5. **Acquisition de l'équipement en mix** : matériaux de la saveur de chaque zone sur les monstres, pièce garantie sur les boss, **craft en ville** (matériaux + or) pour les paliers hauts ; la Boutique couvre le bas du catalogue.
6. **Gemmes brutes vendables** (révision datée de « gemmes jamais vendues » du 10/11) : à prix élevé à la Boutique ; les polies, gravées et éternelles restent aux boss.
7. **XP classique, pas de gel à paliers** : l'idée d'une échelle 1→100 avec stats gelées aux paliers et libération à l'évolution est **refusée** ; l'XP reste continue. La croissance par niveau (cumulative aujourd'hui) sera recalibrée sur l'échelle longue au digest.
8. **Palier d'évolution : jamais de perte nette** : la forme suivante au niveau 1 reste au moins aussi forte que la forme précédente au niveau 10 (stats principales) ; le palier exact se simule au digest, il ne se devine pas.
9. **Cartes solos archivées** : retrait du jeu actif, **greffe ultérieure à des familles** inscrite en roadmap.

### PISTE : affronter les mythiques en version diminuée

- Des créatures M rencontrées tôt en version diminuée (malus spécifique appliqué au boss) : on affronte l'ombre de l'Astre avant l'Astre ; la forme pleine arrive dans les marches hautes.

## 2026-11-11 : ACTÉ — catalogues de l'économie v2 : variantes d'armes, potions en combat, Guilde en rotation, noms aux trois saveurs (retour de Marc-Olivier)

La spec complète vit dans `docs/design/economie-v2-catalogues.md` (Boutique, équipement, quêtes, Guilde, inventaire). Les tranchages :

1. **Armes à variantes (choix de build)** : chaque classe a deux lignes d'armes par palier, frappe (+ATQ %) et finesse (+stat secondaire : +AGI Guerrier/Assassin, +INT Mage/Prêtre/Occultiste).
2. **Potions libres en combat** : autant de gorgées qu'on veut, chaque gorgée coûte le tour (nouvelle action « Objet » de la fenêtre d'action) ; utilisables aussi hors combat. Le prix des potions est le levier de calibrage du digest.
3. **Compagnons de la Guilde en rotation quotidienne** : 3 offres par jour (seed de la date) ; prix C 500 → UR 2 000 (calibrage v0 acté), le L jamais recrutable.
4. **Noms d'équipement aux trois saveurs** : zones/donjons, écoles et métiers mêlés (règle normative dans la spec).
5. **Pool de quêtes quotidiennes** : 12 quêtes proposées dans la spec (1 petite + 1 moyenne + 1 grande par jour, grande à carte N ou éclat un jour sur trois) ; la liste s'ajuste librement au chantier sans nouvel arbitrage tant que le format tient (3 par jour, bonus pierre d'éveil).

## 2026-11-11 : ACTÉ — recâblage famille → école (`FAM_SCHOOL` dans data/engine.json)

## 2026-11-11 : PROPOSÉ — sessions 5-7 du plan de lancement : état et questions pour Marc-Olivier

> Questions de calibrage tranchées le 11/11 : voir l'entrée « ACTÉ — calibrage post-lignes et précisions boucle v2 » en tête du journal.

- **Session 5 (contenu v3)** : audit — Sirènes des Récifs (e23-e30 + Méliane/Thalassa), variante Gobelin des Fumées, Clergé du Plein Jour (Apolline M, Justine L), 9/10 renommages verbatim (le Léviathan garde la forme « Nom, Titre » à virgule, conforme à la charte des nommées) sont déjà en data depuis le lot 6 du grand chantier. Restent à créer et à trancher avec toi : familles compagnons (7 UR + 7 L), lignées d'accueil des Enge (Sirène/Gorgonne/Fée Nouvelles, communes de la Crypte), familles divines côté joueur, intégration des 29 nommées de référence au manifeste d'arts (pipeline `campagne/`, hors dépôt).
- **Session 6 (v0.48 vidéos)** : fait — mapping `FX_SPELLS` en data, lecture des webm `site-assets/fx/` au cast du sort signature, fallback bandeau image si absent/lent, toggle 🎬 FX (persistant), ignoré en vitesse turbo. Digest inchangé (UI seule).
- **Session 7 (calibrage digest)** : pack de mesure post-lignes, N=10 000 combats, digest `4de4c0dc…`, **4239 victoires (42,4 %), 0 exception, 0 marathon**. Par équipe : novices-niv5 35 %, divines-niv12 46 %, familiales-niv15 36 %, mixte-niv8-20 52 %. Par donjon : Marées 66 %, Forge 57 %, Bosquet 43 %, Crypte 30 %, Zénith 17 % — rampe de difficulté lisible. Baseline 3000 retenue : `aed250f9…` 1274/3000. Questions de calibrage : la protection arrière à -50 % suffit-elle ou faut-il un plafond de dégâts encaissés en arrière ? Faut-il remonter légèrement les boss de Zénith (17 %) ? Le taux de victoire global visé (~42 % à N=10 000) convient-il ?

## 2026-11-11 : MESURE — chantier lignes avant/arrière terminé (lots A + B), nouvelle baseline digest

- **Lot A (moteur)** : rangs avant/arrière sur toutes les unités (joueur et monstres), Option A actée — l'arrière est ciblable et encaisse -50 % tant que l'avant tient (RANG_BACK_DMG_PCT), Guerrier/Assassin en arrière frappent à moitié (RANG_BACK_ATK_PCT, RANG_BACK_CLASSES), soins jamais affectés, attaques de zone ignorent la protection. Cibles : toutes les unités vivantes (l'ancien « avant d'abord » disparaît).
- **Lot B (data + UI + saves)** : champ `role` supprimé des 113 cartes et 153 monstres ; CROSS (Souffle/Frappe Croisée) retiré purement, comme acté ; vagues en pool plat (3 avant + 2 arrière côté monstres) ; formation 3+2 ou 2+3 choisie à l'écran d'équipe et figée pendant le combat ; migration v20 (`formation: '3-2'` par défaut) ; plateau rendu en deux rangées étiquetées.
- **Nouvelle baseline (11/11/2026)** : digest 3000 combats **`aed250f9b36dc3fbe74057fda5b24f5b178f4d7a9504845c966b8faed88631d8`**, **1274 victoires / 3000**, 0 exception, 0 marathon ; 115 tests verts, smoke 171 checks. Ancienne baseline `833a6d2c…` 518/3000 (0 exception, 1 marathon). La hausse vient des maths de rang (arrière protégé, soins intouchés) : c'est une mesure, pas une régression — le calibrage fin est prévu avec Marc-Olivier (session 7 du plan de lancement).

(docs : nouvelle baseline digest post-lignes (aed250f9…, 1274/3000, 0 exception) documentée dans arbitrages + roadmap)

- **Motif** : seules `lame` et `appel` coïncidaient avec une clé d'école ; les 9 autres familles portaient leur propre clé comme école, sans rôle ni fiche type (la fenêtre d'action retombait sur le ciblage par défaut). Le mapping est désormais en data (`FAM_SCHOOL`), câblé dans `src/ui.js` : les sorts de lignée portent la clé d'école réelle + le rôle de l'école.
- **Mapping proposé** (dérivé des voies/classes des familles et des lignes d'école des biomes ; `bouclier→rempart` et `aube→baume` étaient déjà actés en roadmap) : eau→lame, aube→baume, lame→lame, ombre→lame, bouclier→rempart, braise→mauvais-oeil, bosquet→entrave, crepuscule→mauvais-oeil, vol→ruse, zele→ferveur, appel→appel.
- **Comportement conservé** : les familles en ligne support (aube, bouclier, zèle) relèvent d'écoles non hostiles (soin/bouclier/boost), donc `foeFacingSpell` ne change pour aucune unité ; digest **inchangé** `833a6d2c…` 518/3000, 115 tests, smoke 171 checks.
- **Validé tel quel par Marc-Olivier** (retour du 10-11/11/2026, nuit) : le mapping est **ACTÉ**.

## 2026-11-10 (nuit, troisième tour) : ACTÉ — calibrage v0 de l'économie v2 (retour de Marc-Olivier)

Barème de départ acté pour le chantier économie v2 ; il se recalibre au digest après le chantier lignes (toute modification de maths = digest recalibré et documenté) :

1. **Conversion ⚡→or : 1 point = 1 or.** Un run de 10 étages ≈ 400 or (modulé par les mods de run) ; l'énergie actuelle (`store.points`, 40 par étage) est convertie en or au chantier économie.
2. **Boutique** : potion de soin 50 or, potion de mana 60 or, éclat 150 or, équipement de 200 (C) à 1 600 or (SR). Les gemmes ne s'achètent pas : elles restent des récompenses de boss (`BOSS_GEM`).
3. **Marchand de créatures, échelle exigeante** : C 200, UC 500, R 1 200, SR 3 500, **UR 10 000 or** (une UR ≈ 25 runs). Il remplace les jetons de génération (`JETON_RARITY` disparaît).
4. **Guilde (ex-Forge)** : les évolutions restent en gemmes (`EVO_COST` inchangé) ; le recrutement d'un compagnon coûte 500 à 2 000 or selon sa rareté.
5. **Quêtes quotidiennes** : **3 par jour en rotation**, récompenses 80 à 150 or, parfois une carte N, un éclat ou une pierre d'éveil ; **bonus de complétion totale : 1 pierre d'éveil**. Le défi du jour reste supprimé.
6. **Équipement** : **arme typée par classe** (épée pour le Guerrier, bâton pour le Mage, sceptre pour le Prêtre, dagues pour l'Assassin, focus pour l'Occultiste) + **armure générique** ; effets en pourcentage (+ATQ, +PV, +AGI, +INT) ; plus 2 slots d'équipe génériques (bannière, talisman de camp).

## 2026-11-10 (nuit, second tour) : ACTÉ — CROSS retiré, quêtes quotidiennes, équipement par classe, errance après le calibrage (retour de Marc-Olivier)

Dernier tour de tranchage de la session design ; les derniers points ouverts sont clos :

1. **CROSS retiré** : le système croisé actuel (Souffle/Frappe Croisée, `CROSS` dans `data/engine.json`) est **retiré**, pas retranché en position : défini par rôle, il disparaît avec la suppression du champ `role` au chantier lignes (lot B = suppression pure). v1.12 couvre déjà l'usage (⚔ Attaque universelle, sorts hostils résolus depuis n'importe quelle ligne).
2. **PISTE (Marc-Olivier, plus tard)** : des sorts spéciaux déclenchés par des conditions remplies en combat (synergie, position, seuil…) pourront constituer une nouvelle génération de sorts « croisés ». Rien à implémenter avant que les conditions soient designées.
3. **Quêtes quotidiennes : rotation quotidienne** : les quêtes changent chaque jour ; récompenses possibles : **or, carte N, pierre d'éveil et/ou éclats** (mélange exact et paliers au calibrage du chantier économie).
4. **Équipement : slots typés par classe** (mix acté) : les 1-2 slots par personnage sont **typés par classe** (épée pour le Guerrier, bâton pour le Mage…) ; les slots d'équipe restent génériques. Types exacts et prix : calibrage au chantier (page Personnage + rayon Boutique).
5. **Errance : programmée après le calibrage digest** (fin du plan code en cours), à la tête du bloc visuel : économie v2 → Accueil/hub-ville + Les Terres Sauvages → errance top-down (zone témoin : Marées) → généralisation. Le moteur d'errance (canvas procédural, guide `docs/design/errance-topdown.md`) peut être codé en parallèle avec sprites placeholder ; l'art du héros dédié attend la campagne d'arts v2 validée + le cycle de marche WAN.

## 2026-11-10 (nuit) : ACTÉ — budgets de fichiers v2 (charte images) : fin des budgets faméliques v1

- **Motif** : les budgets v1 (art 300×420 ≤ 30 Ko, fond 960×540 ≤ 110 Ko, JPEG très compressé) venaient de la contrainte « dist < 1 Mo tout en base64 », levée depuis le passage à assets.json/fichiers chargés à la demande. La vraie contrainte restante = fluidité (décodage + bande passante mobile), pas la taille du dist.
- **Nouveaux budgets (charte v2 §13)** : art de carte **400×560, JPEG q78-82, ~40-70 Ko** (affichage réel 200×280 ×2 DPR) ; fonds de donjon **1216×832, q70-75, ~150-250 Ko** ; fond-monde/key art accueil **1920×1080** ; **masters ComfyUI conservés en 1040×1520** pour upscale/print futur, archivés à part (jamais dans le dist).
- La règle de design « lisibilité 200×280, silhouette claire » est conservée : elle est indépendante du budget de fichier. `make-assets.py` appliquera les nouveaux budgets à la conversion.

## 2026-11-10 (nuit) : ACTÉ — économie v2 : l'or, la Boutique, le marchand de créatures, la Guilde, les quêtes quotidiennes (retour de Marc-Olivier)

- **L'or entre en jeu** : monnaie gagnée en errance et en donjon. Les combats d'errance lâchent or, objets, éclats et pierres d'éveil. **L'énergie actuelle (⚡ les points de donjon, `store.points`, 40 par étage modulé par les mods de run) est convertie en or** au chantier économie.
- **La Boutique** : on y achète des objets contre de l'or (un peu de tout : consommables, éclats, objets d'équipement).
- **Le marchand de créatures** : vend des créatures contre de l'or ; **il remplace le système de jetons de génération** (les jetons de la Forge et leur table `JETON_RARITY` disparaissent au chantier économie).
- **La Forge devient la Guilde** : évolutions + recrutement de compagnons contre de l'or.
- **Quêtes quotidiennes** : le défi du jour est **supprimé**, remplacé par un système de quêtes (ex. vaincre 10 monstres, finir 2 donjons) ; un onglet quêtes vit dans le menu guide. Récompenses et cadence à calibrer au chantier.
- Cap assumé : l'errance donne XP, or et drops ; le jeu s'oriente vers un vrai RPG.

## 2026-11-10 (nuit) : ACTÉ — errance et Les Terres Sauvages : héros dédié, zones à donjon, déblocage en chaîne (retour de Marc-Olivier)

- **Héros dédié** : le personnage incarné en errance est **créé pour l'errance** (ni une carte de la collection, ni un nommé existant) ; son art passe par la charte v2 (art de référence + cycle de marche WAN i2v).
- **Entrée par Les Terres Sauvages** : on choisit la zone d'errance où l'on va (Marées, montagne, feu…). **Départ : la zone de l'eau uniquement.**
- **Contenu d'une zone** : monstres, PNJ, objets à collecter ; on gagne XP et or ; un endroit porte **le donjon** (petit bâtiment), un autre **l'hôtel des crans** (enseignements de sorts, prolongement des enseignements des zones actuelles) ; des quêtes pourront y vivre.
- **Déblocage en chaîne** : vaincre le donjon d'une zone ouvre les zones suivantes (zone de l'eau → zone du feu + deuxième zone d'eau → …). **Un bâtiment donjon par zone** (l'alternative d'un donjon unique à difficulté croissante est écartée) ; pas d'open world complet, des zones reliées débloquées une à une.

## 2026-11-10 (nuit) : ACTÉ — l'équipement des personnages : le mix (retour de Marc-Olivier)

- Des objets d'équipement façon vrai RPG mais **simplifiés** (le catalogue est appelé à grandir, l'équipement individuel complet risquait de se perdre).
- **Tranché : le mix** — chaque personnage porte **1 à 2 slots** d'objets (armure, épée, arc, bâton de magie…) **plus des slots d'équipe** qui s'appliquent à tous.
- L'inventaire de la page Personnage et le rayon équipement de la Boutique en dépendent ; types d'objets, emplacements exacts et prix à calibrer au chantier.

## 2026-11-10 (soir) : ACTÉ — lignes avant/arrière et fin du rôle attaque/support (retour de Marc-Olivier)

- **La règle de rang existait en doc (`docs/regles-jeu.md`) mais pas dans le moteur** ; elle est reconfirmée et complétée :
  - Formation : 5 cartes max, 3 devant + 2 derrière ou 2 + 3, choisie avant le combat, **figée** pendant le combat.
  - L'arrière encaisse **50 % des dégâts** tant qu'un allié tient à l'avant ; l'avant tombe : la protection saute pour tous ; la protection de l'arrière ne couvre **pas** les attaques de zone.
  - Un **Guerrier ou un Assassin** en arrière frappe à moitié tant que l'avant tient ; les autres profils (Mage, Prêtre, Occultiste) frappent à plein.
  - **Complément acté ce jour : les soins ne sont JAMAIS affectés par la position** (seuls les dégâts).
- **Le rôle `attaque`/`support` est supprimé** : plus de distinction support/attaquant nulle part ; le champ `role` disparaît des data (113 cartes, 153 monstres), du moteur (lignes d'init, vagues ennemies, Souffle/Frappe Croisée) et de l'UI. Toute carte se place librement à l'avant ou à l'arrière ; son comportement suit sa classe et sa position, plus son rôle.
- Implémentation : chantier dédié « lignes avant/arrière » dans `docs/roadmap.md`, avant le contenu v3 restant (les nouvelles cartes naîtront sans `role`) et avant le calibrage du digest. Le moteur actuel n'a aucune notion d'avant/arrière (`src/engine/combat.js` : lignes par rôle uniquement).

## 2026-11-10 (soir) : ACTÉ — révision datée tranchée : règle de rang arrière = Option A, l'arrière est ciblable à -50 % (retour de Marc-Olivier)

- Le problème soulevé : la doc actée dit que l'arrière **encaisse 50 % des dégâts** tant que l'avant tient, mais le moteur actuel rend l'arrière **non ciblable** tant que l'avant tient (`enemyPickTarget` vise l'avant vivant d'abord), puis dégâts pleins : deux comportements incompatibles.
- **Tranché par Marc-Olivier : Option A, la règle doc s'applique telle quelle.** L'arrière est **ciblable** et encaisse **-50 %** tant que l'avant tient ; le comportement « non ciblable » du moteur actuel disparaît avec le chantier lignes.
- Rappels inchangés : les soins ne sont jamais affectés par la position ; la protection de l'arrière ne couvre pas les attaques de zone ; l'avant tombe : la protection saute pour tous.
- **Le chantier lignes avant/arrière est DÉBLOQUÉ** ; nouvelle baseline digest à documenter après implémentation (les maths changent, c'est une mesure, pas une régression).

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
