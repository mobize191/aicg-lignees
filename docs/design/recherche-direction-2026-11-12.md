# Recherche direction du jeu — session du 12/11/2026 (10e tour)

> Réponse aux demandes de recherche de Marc-Olivier émises pendant la session Q&A direction : taille d'équipe (étude comparative demandée), réserve et équipes de repli, HP/MP entre combats, fusion/synthèse (DQM), donjons chaînés + difficultés + panoplies (Dofus/Wakfu), expéditions (envoi de cartes en quête), capture vs vendeur, nommage des éléments, structure de la carte du monde, et propositions de but du jeu à partir des quatre races. Sources en section finale ; les propositions marquées « recommandation » attendent un tranchage.

## 1. Question

Comment calibrer les systèmes fondamentaux de Lignées (équipe, fusion, donjons, errance, acquisitions) pour un modèle DQM-like avec ~330 cartes jouables, une progression 1→100, et quel but de jeu bâtir sur les quatre races (humains, monstres, mystiques, divins) ?

## 2. Résumé exécutif (par ordre d'impact)

1. **Taille d'équipe** : aucun jeu à grande collection (>100 êtres jouables) ne met 5 cartes actives en combat. Le standard des grosses collections est **3 actifs** (DQM Joker, Monster Sanctuary, Clair Obscur) ou 4 (Octopath, Persona). Avec 5×5 unités par tour, les combats traînent et l'équilibrage s'effondre. **Recommandation : 3 actifs + 2 en réserve**, switch en combat coûtant un tour, réserve gagnant une XP réduite.
2. **Fusion** : la synthèse DQM (The Dark Prince) consomme les parents et produit un enfant **niveau 1** qui hérite **1/4 des stats cumulées** des parents et jusqu'à 3 talents (moitié des points investis conservés). Transposition directe recommandée pour Lignées : enfant niveau 1, héritage de stats plafonné + sorts des parents, rareté de l'enfant par table de synthèse.
3. **Donjons** : le modèle visé existe déjà chez Ankama — chaînes de donjons par famille (version « royale » ~10 niveaux au-dessus), **drops uniques du boss qui servent au craft des panoplies** (7-8 pièces, bonus par palier de pièces), et **deux difficultés par donjon** (Wakfu Stasis : niveaux de difficulté 1-20 sélectionnés à l'entrée, récompenses accrues).
4. **Expéditions** : deux précédents solides — Dragon Quest Treasures (missions d'envoi de monstres pour matériaux et trésors exclusifs) et Poké Jobs d'Épée/Bouclier (envoi des Pokémon de boîte sur des missions de plusieurs heures, XP + récompenses). L'idée de Marc-Olivier est validée par l'industrie ; c'est la réponse au « que font mes 300 cartes quand je ne les joue pas ».
5. **HP/MP entre combats** : Etrian Odyssey (TP persistant dans le donjon, restauré en ville) et Darkest Dungeon (HP + stress persistants) prouvent que la gestion de ressource rend chaque sortie pesée. **Recommandation : persistance dans le run de donjon uniquement**, récupération hors combat en errance.
6. **Éléments** : Dofus a un élément **Neutre** à côté de Terre/Eau/Air/Feu — précédent direct pour des humains neutres. Renommer « terre » : **Nature recommandé** (couvre ent, champignons, spores ; « Plante » trop botanique, « Terre » confond avec la roche).
7. **Carte du monde** : les références (Dofus, Wakfu, Pokémon, DQ Treasures) utilisent toutes des **cartes fixes** régionalisées, pas une carte géante générée. **Recommandation : 3-4 cartes régionales fixes** de 4-5 biomes, errance intérieure des donjons générée par seed comme aujourd'hui.
8. **But du jeu** : quatre propositions de lore bâties sur les quatre races (section 13), aucune n'est « tuer le grand méchant démon » ni « gérant de compagnie ».

## 3. Méthodologie

Recherche web du 12/11/2026 (couloir pilotage) : 18 requêtes ciblées, wikis de référence (Dragon Quest Wiki, Wakfu Wiki, Fandom Dofus, Final Fantasy Wiki, Etrian Odyssey Wiki), devblogs officiels Ankama (Stasis), guides spécialisés (Samurai Gamers, Game8, Serebii) et discussions de concepteurs (r/JRPG, forums RPG Maker) pour la question du rythme de combat. Limites : les mécaniques DQM Joker 1 et The Dark Prince sont parfois mélangées dans les sources (elles diffèrent sur des détails) ; les chiffres de synthèse cités sont ceux de The Dark Prince (2023), pas des Joker DS ; les discussions de forums sont des avis, pas des sources.

## 4. Taille d'équipe active — l'étude comparative demandée

| Jeu | Collection / roster | Actifs en combat | Réserve / switch |
| --- | --- | --- | --- |
| DQM: Joker (DS) | large, fusion | **3** | +3 en réserve, switch **hors combat** seulement |
| DQM: The Dark Prince | large, fusion | **3** | réserve |
| Monster Sanctuary | ~100+ monstres | **3** | équipe de combat de 3, pas de switch en combat |
| Clair Obscur: Expedition 33 | **6** personnages | **3** | switch imposé chaque tour (tour actif = personnage différent) |
| Final Fantasy X | 7 personnages | **3** | swap libre en combat, gratuit (CTB) |
| Final Fantasy VI | 14 personnages | 4 | — |
| Octopath Traveler | 8 | 4 | — |
| Persona 5 | ~10 | 4 | — |
| Suikoden | **108** étoiles | 6 | combats volontairement simples |
| Etrian Odyssey | 5+ créés, lignes avant/arrière | 5 | formation front/back |
| Pokémon | 400-1000 | 1 (en solo) | équipe de 6, switch libre coûte un tour |
| **Lignées aujourd'hui** | ~330 cibles (150 persos + 180 monstres env.) | **5** | 3 équipes de 5, pas de switch en combat |

**Constantes qui se dégagent** :

- Plus le roster est grand, plus les actifs sont resserrés : à 100+ êtres jouables, la norme est **3** (DQM, Monster Sanctuary, Expedition 33). Aucun gros collector ne dépasse 5 actifs (Suikoden 6, exception, avec des combats plats par design).
- Au-delà de 4-5 unités par camp, le tour de combat s'allonge mécaniquement (10 unités à 5×5) ; les retours de concepteurs (r/JRPG, RPG Maker) convergent : équilibrage et lisibilité s'effondrent après 4-5 actifs, et le « sweet spot » évoqué est 40-60 % du roster actif — mais pour un roster de 330, la vraie contrainte n'est pas le ratio, c'est **le rythme de chaque combat**.
- Les gros rosters sont servis par trois soupapes, pas par de gros combats : **réserve** (DQM), **switch en combat** (FFX, Expedition 33), et **occupations hors combat** (Poké Jobs, missions de DQ Treasures).

**Recommandation pour Lignées** :

- **Option A (recommandée)** : **3 actifs + 2 en réserve** au sein d'une équipe. Le switch en combat coûte le tour (contrairement à FFX où il est gratuit) pour garder des combats rapides mais pesés ; la réserve gagne 30-50 % de l'XP. Les combats passent de 10 à ~6 unités par tour : c'est le rythme DQM que Marc-Olivier cherche (« 3 par équipe avec des combats plus rapides »).
- **Option B (compromis)** : 4 actifs + 1 réserve, si le moteur actuel rend le passage à 3 coûteux.
- **Option C (rejetée)** : garder 5 actifs : c'est le seul cas sans précédent dans les jeux comparables, et le plus lent.

## 5. Réserve, switch, équipes de repli

- **FFX** : 3 actifs parmi 7, swap libre à tout instant, gratuit — la fluidité maximale.
- **Clair Obscur** : 3 actifs parmi 6 seulement, et le jeu **impose** le switch chaque tour : un roster petit se joue entièrement.
- **DQM Joker** : 3 + 3, mais la réserve ne s'échange qu'**hors combat** : en donjon, on vit avec ses choix.
- Pour l'idée de Marc-Olivier (« quand l'équipe principale meurt ou est trop affaiblie, on switche ») : deux calibrages possibles.
  1. **Réserve intégrée (recommandé)** : les 2 slots de réserve se substituent à un membre K.O. ou affaibli, en dépensant le tour du nouveau venu. Pas de téléportation gratuite, pas d'équipe B entière : le donjon garde sa pression.
  2. **Équipe de repli entière** : si l'équipe tombe, l'équipe 2 prend la suite. Plus généreux, risque d'annuler la tension de ressources ; à réserver à un mode « exploration » et jamais au mode « course ».

## 6. HP/MP entre les combats

- **Etrian Odyssey** : les TP ne se régénèrent qu'en ville ; chaque plongée de donjon est un budget. La sortie se décide avant d'entrer.
- **Darkest Dungeon** : HP et stress persistent du début à la fin de l'expédition ; le ravitaillement se prépare en ville.
- **Monster Sanctuary** : soin complet après chaque combat (comparaison utile : le jeu reste léger, aucune gestion de budget).
- **Série DQM (Joker)** : récupération de quasiment complète entre les combats — la ressource gérée y est le temps d'équipe, pas les MP. (Détail non re-sourcé à la lettre ; à confirmer sur un test de Joker si on veut le chiffrer.)

**Recommandation pour Lignées** (l'idée « vies et mana limités pour forcer le choix des sorts ») : deux couches.

- **En donjon (mode course)** : HP/MP **persistants du premier au dernier étage** ; on récupère en sortant (ville/autel) ou avec des consommables. C'est Etrian : chaque porte de donjon devient une décision de composition et de potions.
- **En errance (Terres Sauvages)** : récupération hors combat complète ou quasi complète. L'errance est la zone de farm tranquille et d'expérimentation ; la y soumettre à la pénurie tuerait le flow.
- Les sorts signature deviennent chers en MP : c'est là que « quel sort je choisis » devient un vrai choix.

## 7. Fusion / synthèse — comment font les autres, ce qu'on en tire

**DQM: The Dark Prince (chiffres sourcés)** :

- Les parents sont **consommés** ; l'enfant naît **niveau 1**.
- L'enfant hérite **1/4 des stats cumulées des deux parents** comme stats de départ (« plus les parents sont montés, plus l'enfant démarre fort »).
- Héritage de **talents** : jusqu'à 3 talents des parents ; **la moitié des points de talent investis** est conservée, un quart des non-investis devient libre à assigner.
- Le rang de l'enfant dépend du rang des parents (table de synthèse) ; des bonus « + » s'ajoutent selon le niveau des parents.
- Autres modèles : **Persona** (le résultat naît à son propre niveau de base, hérite 2-4 compétences) ; **Pokémon reproduction** (œuf niveau 1, héritage de capacités et d'IV, jamais de stats directes) ; **Monster Rancher** (combinaison, les stats influencent le résultat).

**Transposition recommandée pour Lignées** :

1. **Enfant toujours niveau 1** — c'est la boucle 1→100 de Marc-Olivier : la fusion donne un meilleur point de départ, jamais un raccourci.
2. **Héritage de stats** : 25 % des stats cumulées des parents, **plafonné par la rareté de l'enfant** (une fusion de communes surmontées ne doit pas créer une commune surpuissante, mais elle doit rester utile — rejoint l'objectif « une commune niveau 100 bien équipée rivalise avec une légendaire »).
3. **Héritage de sorts** : jusqu'à 2-3 sorts des parents, dont les sorts de famille ; le sort signature reste celui de l'enfant.
4. **Rareté de l'enfant par table de synthèse** : C+C peut surprendre en C+ ou UC ; la table est en `data/` et le **mystère est préservé dans la collection** (on voit la carte, pas sa descendance — ACTÉ en principe par Marc-Olivier ce jour).
5. **Bonus de fusion précoce** : les « + » de DQM valident l'idée d'un bonus de fusion dès le début de partie.

## 8. Donjons chaînés, deux difficultés, panoplies — le modèle Ankama

**Ce que font Dofus/Wakfu (sourcé)** :

- **Dofus** : un donjon par famille de monstres, boss final à mécanique propre ; **chaque boss et sa famille droppent les pièces d'une panoplie** (7-8 pièces, ex. panoplie du Wabbit, 7 pièces) ; bonus de panoplie par paliers de pièces portées ; chaînage naturel : donjon de la famille X, puis version « royale » ~10 niveaux au-dessus (Tofu → Tofu Royal, Bouftou → Bouftou Royal, la logique « gobelins des marais → gobelins royaux » citée par Marc-Olivier).
- **Wakfu Stasis (devblog officiel)** : à l'entrée du donjon, on choisit un **niveau de difficulté (Stasis 1-20, puis 21-30…)** en mode « rapide » ou « normal », avec niveau réel ou ajusté ; récompenses accrues à Stasis élevé. C'est exactement « deux difficultés par donjon » avec un curseur au lieu d'un palier binaire.

**Transposition pour Lignées** :

- **Chaînes par famille ACTÉES en principe** : donjon des Marées (Gobelins) bouclé → débloque le donjon des Gobelins Royaux (~10 niveaux au-dessus), etc. « Un donjon tous les ~5 niveaux » sur une courbe 1→100 ≈ **20-25 donjons** : l'intuition « 25 donjons » tient debout.
- **Drops uniques → craft** : chaque boss royal droppe des ressources exclusives qui servent au craft des pièces de panoplie ; les panoplies deviennent le but visible de chaque chaîne (répond à « que récompense un donjon au-delà du drop »).
- **Deux difficultés** : palier « normal » et palier « royal » (recommandation : binaire pour la lisibilité, pas 20 crans Wakfu, mais le Stasis prouve que le joueur comprend et réutilise un donjon plus dur pour un meilleur loot).
- **Manque constaté** : aucun donjon **divin** aujourd'hui (hors boss final du Zénith et phénix). À ajouter pour couvrir les quatre races : une chaîne Démons, une chaîne Anges, un donjon de l'Équilibre (Ananke) — matériaux divins de craft.

## 9. Expéditions — « envoyer nos cartes faire des quêtes »

**Précédents sourcés** :

- **Dragon Quest Treasures** : missions d'envoi (dispatch) de monstres partout dans le monde pour **ramener matériaux de craft et trésors**, débloquées en montant le rang du gang ; les monstres de la base sont occupés pendant l'envoi.
- **Pokémon Épée/Bouclier — Poké Jobs** : on envoie des Pokémon **de la boîte** sur des missions de plusieurs heures (temps réel) ; ils reviennent avec de l'XP et des récompenses. Les « cartes qui ne jouent pas » progressent quand même.
- Les gachas : expéditions hors ligne = standard du genre.

**Transposition recommandée pour Lignées** :

- « **Patrouilles de la Charte** » : envoyer 3-5 cartes (hors équipes actives, hors réserve) sur des missions de 4/8/12/24 h ; au retour : matériaux exclusifs (dont pièces de craft de panoplie) + XP réduite.
- Double bénéfice : ça occupe la collection dormante (répond au « j'ai 330 cartes, qu'est-ce que je peux en faire ») et ça donne une raison de monter des cartes secondaires.
- **À trancher** : temps réel (immersion, coût nul à implémenter) vs temps de jeu actif (évite « revenez demain » dans un jeu sans énergie). Recommandation : temps réel, plafonné, avec une notification de retour ; jamais de gating payant.

## 10. Capture en errance vs vendeur

- **DQM** : pas d'achat — le scouting se fait **au combat**, par démonstration de force (pourcentage affiché, on « convainc » le monstre).
- **SMT V** : recrutement par **négociation** pendant le combat (dialogue, ton, humeur) — le précédent pour recruter autrement que par la force.

**Transposition pour Lignées** (l'idée de Marc-Olivier : plutôt la capture en errance que le marchand) :

- **Monstres** : capture au combat / dans les hautes herbes, à la DQM (le % affiché est un excellent feedback, déjà testé côté moteur via le recrutement naturel).
- **Humains et mystiques** : pas de « capture » au sens esclavagiste (Marc-Olivier l'a exclue) — **épreuve de recrutement à la SMT, light** : un dialogue à choix + une condition (niveau, victoire d'un duel, objet-talisman). Le lore des quatre races peut typer ces épreuves (voir section 13 : allégeance pour les humains, énigme pour les mystiques).
- **Le vendeur garde UN rôle** : offres quotidiennes exceptionnelles (raretés ciblées, cartes introuvables en errance), achetées en **jetons déblocables par la progression** et non en or — ça protège l'économie (l'or se dilue, constat du 11/11) et ça sert le « j'aimerais bien choper un Ng des Brumes ».

## 11. Éléments — humains neutres, nommage

- **Dofus (sourcé)** : cinq éléments — **Neutre** (lié à la Force), Terre, Eau, Air, Feu. Le Neutre existe donc dans la référence commune du studio Ankama ; c'est le précédent direct pour des humains neutres.
- **Pokémon** : le type s'appelle « Plante » ; Dofus « Terre » couvre à la fois la roche et la nature — c'est exactement la confusion que Marc-Olivier veut éviter.

**Transposition pour Lignées** (TRANCHÉ en grande partie ce jour) :

- Les monstres **gardent leur élément inné permanent** (un ent est nature, un golem de feu est feu, un démon est démon, un ange est ange) ; **les humains sont Neutres** ; **les sorts portent aussi l'élément** (une sirène : surtout des sorts d'eau ; un humain peut apprendre le feu via grimoire). Les oppositions se calculent au sort.
- **Renommage de « terre »** : recommandation **Nature** (couvre ent, arbres, champignons, spores, marées végétales) ; « Plante » est l'alternative canonique Pokémon mais trop botanique pour un ent ; « Terre » est exclu (roche).
- **Grimoires en errance ACTÉS en principe** : drops/événements qui débloquent des sorts par palier ; les sorts se débloquent aussi **par niveau de la carte** selon sa classe et sa famille (les niveaux 1-4 de sorts existants sont conservés).

## 12. Carte du monde — une géante ou des régions ?

- **Dofus/Wakfu** : cartes fixes par nation, régions contiguës, gating par le level design et les donjons.
- **Pokémon** : régions fixes à routes, dévoilées à mesure.
- **DQ Treasures** : îles fixes, thématisées ; **DQM Joker 3** : zones fixes.
- Les mondes générés à l'infini sont l'apanage des roguelikes : mondes sans attachement au lieu.

**Transposition pour Lignées** (la question posée : une carte géante auto-générée, une par biome, ou des multibiomes ?) :

- **Recommandation : 3-4 cartes régionales FIXES**, de 4-5 biomes chacune (multibiomes assumés), plutôt qu'une géante générée. Trois raisons : (1) l'attachement au lieu — « le donjon des Gobelins des Marais » doit être un endroit précis du monde, pas une instance ; (2) le gating lisible — barrières/brumes aux entrées de région, l'état des donjons visible sur la carte ; (3) le coût : une carte géante générée à la volée est le chantier le plus risqué du moteur, des cartes régionales bornent le contenu naturellement (une région ≈ un « âge » du monde, ~25-30 niveaux de progression).
- **La génération par seed reste** : errance intérieure des donjons, profondeurs, labyrinthes — l'intérieur est procédural, le monde est dessiné. C'est déjà l'architecture actuelle, on la garde.

## 13. But du jeu — propositions de lore (les quatre races)

Matériaux : quatre races (humains, monstres, mystiques, divins), l'Ascendance, l'Enge, le Jeune Séraphin, les trois familles divines (seuil / miroir / pont), les oppositions d'éléments, les cinq biomes. Fait structurant : le joueur n'a pas d'avatar qui le représente, et ses équipes mélangent humains et monstres — le lore doit justifier qu'on **lië** des êtres de toutes les races sans tomber dans l'esclavage.

### Proposition 1 — Le Lieur (« l'unité retrouvée »)

Le monde s'est brisé quand les divins ont rompu le **Serment des Quatre Races** ; l'Ascendance s'est refermée, chaque race s'est repliée sur elle-même. Le joueur est le dernier **Lieur**, l'être capable de lier les quatre races : un humain par **allégeance**, un monstre par **pacte de force**, un mystique par **énigme**, un divin par **consécration**. Le but : retisser le Serment complet et rouvrir l'Ascendance. Fin : le joueur devient le pivot reconnu des quatre races — « l'assujettissement » dans sa version la plus classe : chaque race vous reconnaît comme le sien. Forces : le recrutement EST le lore (quatre verbes de recrutement qui collent aux mécaniques de capture) ; l'Enge et le Séraphin s'y raccrochent ; la collection est la progression de l'histoire elle-même.

### Proposition 2 — L'Échiquier des Quatre (domination, multi-fins)

Le monde est le plateau d'une partie millénaire : à chaque ère, les quatre races s'affrontent pour déterminer laquelle **porte l'âge du monde**. Le joueur est la pièce inclassable — né des quatre sangs, refuse d'appartenir à une race. But : gagner la partie. Fins : imposer l'une des quatre races (4 fins), l'équilibre des Quatre (fin unité), ou s'imposer soi-même (fin domination totale, celle que Marc-Olivier trouve « plus classe » que le gérant de compagnie). Forces : pas de grand méchant démon ; le multi-fins donne une rejouabilité naturelle ; les choix forcés (lignées exclusives, pierres d'évolution limitées) deviennent des enjeux narratifs.

### Proposition 3 — Le Silence du Zénith (la paix par la reconnaissance)

Les divins se sont tus ; sans juges, mystiques et monstres se déchirent et les humains survivent. Chaque donjon est une **épreuve de reconnaissance** : boucler un donjon au palier royal fait d'une race une alliée qui vous reconnaît. But : être reconnu des quatre races et rouvrir le Zénith. Fin à choix : rendre le jugement aux divins, ou prendre la place. Forces : chaque donjon est une étape d'histoire (répond à « récompenses au-delà du drop ») ; le Zénith existant devient le lieu narratif central ; le lore naît des cinq biomes actuels sans rien inventer de gigantesque.

### Proposition 4 — La Charte (la domination douce)

Après la Grande Interdiction qui a interdit de lier des êtres d'une autre race, seuls les porteurs d'une **Charte** peuvent encore lier quiconque. Le joueur tient la dernière. But : faire de sa maison la seule autorité que les quatre races reconnaissent — la domination par le réseau, le respect et la force, jamais le fouet. Forces : assume le goût de Marc-Olivier pour la gestion et le « maître du monde » sans jamais l'approcher de l'esclavage ; la Boutique, les patrouilles (expéditions) et la collection deviennent des actes de puissance.

**Mon avis** : les propositions 1 et 2 se combinent proprement — le Lieur comme prémisses (les quatre verbes de recrutement, le mystère de l'Ascendance), l'Échiquier comme fin à choix (imposer une race, l'équilibre, ou soi-même). La 3 est la plus économe en contenu neuf. La 4 est la plus fidèle au tempérament « gestion » mais la moins narrative. À trancher en session.

## 14. Ce que la recherche tranche ou laisse ouvert

- **Tranché par Marc-Olivier ce jour** (consigné dans `session-qa-direction.md` et `arbitrages.md`) : modèle DQM-like assuré, 3 équipes conservées, éléments gardés sur les monstres + humains Neutres + sorts typés, renommage de « terre » (à choisir : Nature ou Plante), progression 1→100, fusion DQM en principe, chaînes de donjons + drops uniques → craft panoplies, capture en errance + un vendeur à jetons, mystère des lignées dans la collection.
- **Reste à trancher** (questions posées en fin de tour) : taille d'équipe (recommandation 3+2), forme exacte de la fusion, but du jeu (propositions 1-4), Nature vs Plante, carte régionale vs géante, persistance HP/MP (recommandation : donjon seul), expéditions (temps réel), chaîne des donjons divins.

## 15. Notes de sources

| Source | Crédibilité | Dernière mise à jour |
| --- | --- | --- |
| [Dragon Quest Wiki — Monster synthesis (dragon-quest.org)](https://dragon-quest.org/w/index.php?title=Monster_synthesis&mobileaction=toggle_view_desktop) | 4/5 | - |
| [Samurai Gamers — DQM: The Dark Prince, Synthesis Guide (1/4 des stats, talents)](https://samurai-gamers.com/dragon-quest-monsters-the-dark-prince/synthesis-guide/) | 4/5 | - |
| [Dragon Quest Wiki — DQM: Joker (3 actifs + 3 en réserve, switch hors combat)](https://dragon-quest.org/wiki/Dragon_Quest_Monsters:_Joker) | 5/5 | - |
| [Pocket Gamer — test DQM: Joker (3+3)](https://pocketgamer.com/dragon-quest-monsters-joker/dragon-quest-monsters-joker/) | 3/5 | - |
| [RPG Site — DQ Treasures : dispatch missions, base, facilities](https://www.rpgsite.net/news/13317-new-dragon-quest-treasures-screenshots-detail-erik-mias-base-facilities-treasure-vault-dispatch-missions-and-more) | 4/5 | - |
| [Nintendo Everything — DQ Treasures : gang, missions, dortoirs](https://nintendoeverything.com/dragon-quest-treasures-details-base-gang-and-facilities/) | 4/5 | - |
| [Serebii — Poké Jobs (Pokémon Épée/Bouclier)](https://www.serebii.net/swordshield/pokejobs.shtml) | 5/5 | - |
| [Wakfu Devblog officiel — The Stasis Dungeons (difficultés 1-20, rapide/normal)](https://www.wakfu.com/en/mmorpg/news/devblog/tickets/599946-devblog-stasis-dungeons) | 5/5 | - |
| [Wakfu Wiki — Dungeon (1-4 salles, un donjon par famille)](https://wakfu.fandom.com/wiki/Dungeon) | 4/5 | - |
| [Wiki Dofus (Fandom) — Élément : Neutre, Terre, Eau, Air, Feu](https://dofuswiki.fandom.com/fr/wiki/El%C3%A9ment) | 4/5 | - |
| [MoonBot — panoplie du Wabbit, 7 pièces droppées au donjon](https://moon-bot.io/blog/craft-panoplie-wabbit/) | 3/5 | - |
| [Next Stage — panoplies de classe Dofus, obtention](https://www.next-stage.fr/2025/05/guide-complet-panoplies-classe-dofus-statistiques-bonus-astuces-tous-niveaux.html) | 3/5 | - |
| [Final Fantasy Wiki — FFX battle system (CTB, 3 actifs, swap)](https://finalfantasy.fandom.com/wiki/Final_Fantasy_X_battle_system) | 4/5 | - |
| [Expedition 33 Wiki — Characters (6 personnages)](https://expedition33.wiki.fextralife.com/Characters) | 4/5 | - |
| [Game Rant — les 6 personnages jouables de Clair Obscur](https://gamerant.com/clair-obscur-expedition-33-playable-party-members-characters-unlock/) | 3/5 | - |
| [Game8 — SMT V : Negotiation Guide (recrutement par dialogue)](https://game8.co/games/Shin-Megami-Tensei-V/archives/348793) | 4/5 | - |
| [Etrian Odyssey Wiki — Game Mechanics (TP, donjons)](https://etrianodyssey.wiki/wiki/Game_Mechanics) | 3/5 | - |
| [Darkest Dungeon Wiki — Stress (persistance, expéditions)](https://darkestdungeon.fandom.com/wiki/Stress) | 4/5 | - |
| [TheGamer — Monster Sanctuary : team building (équipe de 3)](https://www.thegamer.com/monster-sanctuary-team-building-tips/) | 3/5 | - |
| [r/JRPG + forums RPG Maker — discussions taille d'équipe (avis de concepteurs)](https://www.reddit.com/r/JRPG/comments/3t8k7o/why_is_the_maximum_party_for_most_games_3_or_4/) | 2/5 | - |

Conflits et réserves : les règles de synthèse citées sont celles de The Dark Prince ; Joker (DS) différait sur les détails (talents vs compétences, % d'héritage). La récupération HP/MP de la série Joker n'est pas sourcée à la lettre ici (section 6, marquée « à confirmer »). Les chiffres « Suikoden 6 actifs / FFVI 14 personnages / Octopath 4 sur 8 » relèvent de la connaissance générale des jeux, non de la présente recherche.
