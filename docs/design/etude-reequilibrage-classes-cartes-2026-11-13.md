
# Rééquilibrage des classes et des cartes : étude approfondie

**Jeu : Aicg : Lignées (DQM-like, partition RPG équipement + quêtes) : 13/11/2026**

## Question

Faut-il retravailler les caractéristiques, les classes, ou d'autres choses, pour un jeu plus équilibré ? Quels arbitrages trancher et quelles méthodes appliquer, sachant que le chantier « rééquilibrage global des classes » est déjà ouvert par les tranchages du 14/11 (retrait du splash Mage, variance individuelle, tank actif, indicateur ouvert) ?

## Synthèse exécutive

1. **Les trois couches sont en cause, dans cet ordre : mécaniques de soutien, puis data des cartes, puis réglages de classes.** Le problème n'est pas principalement les chiffres : une remontée de stats d'un soigneur (atk 3 → 10, int 2 → 12) ne récupère que **+1,6 point** de taux de victoire sur un slot qui en coûte **8,7**. Le coût d'un emplacement non-offensant est structurel (tour consommé sans tuer) : c'est l'économie d'action qui doit changer (provocation, sorts hybrides, soins qui ne volent pas le tempo de l'équipe).
2. **La hiérarchie de classes mesurée est très étalée au palier R, mais elle s'auto-corrige aux paliers hauts.** Au même palier (R, niveau 12), une armée mono-Guerrier gagne 78,6 % de ses combats, une armée mono-Mage 34,8 % (écart 2,3×) ; mais l'écart max tombe à 26,4 pts en SR et **11,8 pts en UR** (93,5 % vs 81,7 %) : le bas de tableau vient de la data des paliers bas (supports atk 2-6), pas des classes elles-mêmes. Et le Mage R était sous-estimé : sa meilleure carte (v3 Évocateur, hp 70) fait 58,9 %, contre 34,8 % pour a20 (hp 51) aux stats identiques par ailleurs : 24 pts d'écart dans une même classe = un bug de budget data. Prêtre offensif (39,3 %) et Occultiste (37,8 %) restent dans le bas de tableau ; les supports purs tombent à 6,5 %.
3. **La collection monstre (jouable : recrutement, marchand, Guilde, fusion) forme une deuxième pelouse d'équilibre, et la data y diverge de la collection humaine.** Mesuré au même protocole : le meilleur Mage monstre R vaut **57,4 %** quand le meilleur Mage carte R mesuré valait 34,8 % (+22,6 points, portés par hp 72 vs 51 ; corrigé le 13/11 au soir : la vraie meilleure carte Mage R, v3 l'Évocateur hp 70, fait 58,9 %, soit un alignement quasi parfait entre les deux collections sur les lanceurs) ; à l'inverse les supports monstres sont **pathologiques** : Prêtres monstres atk 2 à 6 **à tous les paliers** (C→L), 0,3 % de victoires et **33 combats-marathons** sur 3000 (soigneurs qui ne tuent jamais). Et le catalogue monstre est **racialement mixte** (73 monstres, 47 mystiques, 20 humains, 19 divins) : le cran de race (+10/+20/+30 % sur ATQ **et** PV) y est mesuré à **+6 à +8 points par palier de 10 %** (paires jumelles, §3), et l'écart « Nature vs Ombre » de 15,5 points constaté sur des stats identiques se décompose en **~12,6 points de cran de race** (divine vs monstre) et **~3 points d'élément**.
4. **L'INT est une stat quasi inutile en dégâts** : tous les sorts de dégâts passent par `u.atk × mult`, l'INT ne pilote que soins, boucliers, mana (plafonné +50 %) et seuils. Mesuré : un focus +25 % INT sur un Mage change le taux de 34,8 → 35,7 % (dans le bruit), quand une arme +25 % ATQ le monte à 41,5 %. Corollaire : 19 des 23 armes de chaque classe lanceuse donnent `atkPct`, et le Prêtre, « soigneur », a l'INT la plus basse du jeu (2 à 3 sur les paliers C-R) : ses soins de lignée soignent 3 PV.
5. **L'équipement fonctionne : c'est la partition RPG la mieux calibrée.** Une arme SR (+25 % ATQ) vaut **+6,2 à +6,7 points** de taux ; arme + armure (+25 % ATQ +25 % PV) valent **+10,4 points**. À conserver et étendre (pistes : 6-8 emplacements actés, panoplies).
6. **L'économie des sorts est uniforme et décroissante** : les 14 familles partagent exactement la même courbe coût/multiplicateur (2/3/5/9/14/20 mana pour ×1,4 → ×4,5), et le rendement par point de mana chute de 0,70 à 0,225. Les sorts de zone et uniques concentrent la vraie valeur ; les paliers hauts de lignée sont des bursts de mana, pas des upgrades d'efficacité.
7. **La roue des éléments tourne pour les monstres, dans les deux sens** : les 159 monstres portent tous un élément (les recrutés donnent donc au joueur des frappes typées et les synergies d'élément), tandis que 137 des 150 cartes humaines sont Neutres : une équipe humaine n'a ni bonus ni faiblesse d'élément, une équipe de monstres joue la roue complète (mesuré : ±3 points entre éléments d'une même classe, §3 ; le cran de race, lui, vaut 2 à 3× plus). Reste une vraie scorie : les 3 familles de l'école de la Lame (Neutre : lame, ombre, eau) ne bénéficient jamais du bonus d'opposition (+25 %).
8. **Le cran de race est le plus gros levier de data mesuré, et il est multiplicatif** : +10 % de cran (monstre) = **+6 à +8 points** de taux de victoire, mesuré deux fois indépendamment sur des paires quasi jumelles (Guerrier humain→monstre +7,9 ; Assassin monstre→mystique +6,3). Extrapolé, un divin (+30 %) vaut ~+19 à +24 points sur la même base : plus que l'écart entre la meilleure et la pire classe (2,3×). Comme il multiplie ATQ et PV, il **amplifie les bases** : il enrichit les attaquants et ne sauve pas les supports (un Prêtre divin atk 3 gagne +0,9 ATQ). Côté joueur, la couche est aujourd'hui quasi inexistante (13 cartes non humaines sur 150, toutes N/C/UC : 5 Embryons monstres, 3 Enges mystiques, 5 divins dont 3 Prêtres) ; le cycle de fusion v4 (humaine→monstre→mystique→divine) va l'ouvrir : il faut la **budgéter** avant (M4), sinon elle devient un vecteur de power creep.
9. **La méthode maison (digest SHA256, baseline verrouillée, mesure avant recalibrage) est saine** : elle correspond aux pratiques du genre (simulation de masse, tiering par l'usage). À étendre : des gates par classe dans le harnas, un tableau de cibles chiffrées, et une seule grosse refonte plutôt que des retouches dispersées.
10. **La refonte structurelle posée le 13/11 au soir (5 stats dont une INT qui pilote les sorts, provocations à charges, cran revu à la baisse, sorts débloqués par niveau, 3 voies) va dans le sens de toutes les mesures de l'étude** ; les trois points de vigilance : le cap de soins doit être remplacé par une borne de ressource (pas retiré seul), le retrait du splash Mage oblige à re-mesurer la voie magie, et les 5 classes survivent comme saveurs dans les 3 voies plutôt que d'être supprimées. Évaluation complète et précédents du genre : arbitrage J.

## Méthodologie

- **Sources internes (repo GitHub public)** : lecture complète de `docs/regles-jeu.md`, `docs/arbitrages.md` (journal des tranchages), `docs/design/session-qa-direction.md` §0 (tableau de bord), études existantes (`etude-polyvalence-2026-11-13.md`, `etude-duree-combats-2026-11-13.md`), et analyse exhaustive des 23 fichiers de `data/*.json` (150 cartes, 159 monstres, 309 sorts, 150 pièces d'équipement) et du moteur (`src/engine/combat.js`, `stats.js`, `spells.js`).
- **Reproduction du harnas** : le repo a été reconstruit localement (`node build.mjs`), 277/279 tests verts (2 échecs préexistants liés aux manifestes d'arts absents du clone), et le digest officiel **reproduit à l'identique : `3b11106f…` 871/3000** (29,0 %). Toutes les mesures qui suivent utilisent donc le moteur réel, protocole v3 du harnas (mêmes seeds n+1, 5 donjons, étages 1-10, difficultés 1-3, N = 3000 combats par configuration, 0 exception, 0 marathon).
- **Études originales** (scripts rejouables, même protocole que `tools/etude-polyvalence.mjs`) : mono-classe (3× la meilleure carte R de chaque classe, niveau 12, 2 avant + 1 arrière), coût de slot support, impact de l'équipement, et **mono-classe monstres recrutables** (3× le meilleur monstre R de chaque classe, même protocole, équipe témoin joueur rejouée à l'identique pour la reproductibilité : 2359/3000), et **paires quasi jumelles race/élément** (5 configurations supplémentaires pour isoler le cran de race de l'élément, N = 3000 chacune, 0 exception, 0 marathon), et **extension multi-paliers UC/R/SR/UR** (3× la meilleure carte joueur par classe et palier, critère cardPower, niveau 12, N = 3000 par ligne, 0 exception, 0 marathon).
- **Sources externes** : méthodes d'équilibrage du genre (simulation de risque, tiering par usage, formules de référence). Détail en fin de rapport.
- **Limites** : simulation auto-résolue (l'IA des deux camps, pas la saisie tactique humaine) ; palier R niveau 12 pour les études mono-classe (les paliers SR+ pourront corriger le classement, le Mage montée en puissance via ses uniques de zone) ; le taux de victoire dépend du protocole (équipe de 3 actifs, pas la formation 5 cartes complète).

## Constats chiffrés

### 1. Hiérarchie de classes mesurée (moteur réel, N = 3000, palier R niveau 12)

| Armée (3× même carte, 2 avant + 1 arrière) | Taux de victoire | Tours moyens |
| --- | --- | --- |
| Guerrier : 3× Maître Charpentier (a48, atk 17) | **78,6 %** | 6,1 |
| Assassin : 3× Maître des Brumes (a41, atk 17) | **67,4 %** | 6,1 |
| Prêtre offensif : 3× Croisé de l'Aube (u3, atk 14) | 39,3 % | 5,8 |
| Occultiste : 3× Prêtre du Crépuscule (q3, atk 14) | 37,8 % | 6,0 |
| Mage : 3× Mage de la Fournaise (a20, atk 14) | **34,8 %** | 4,6 |
| Prêtre soigneur : 3× Prêtresse de l'Aube (s5, atk 3) | **6,5 %** | 7,1 |
| Occultiste contrôle : 3× Servante du Sablier (w3, atk 2) | **6,4 %** | 7,4 |

À périmètre égal (meilleure carte R de la classe, synergies de classe incluses), les classes se séparent en trois strates : mêlée (Guerrier, Assassin) autour de 70-80 %, lanceurs autour de 35-40 %, et support pur effondré sous 7 %. L'écart de 43,8 points entre Guerrier et Mage est hors du bruit statistique (écart-type binomial ≈ 0,9 point à N = 3000).

**Pourquoi les lanceurs décrochent** (modèle du moteur, vérifié dans le code) :
- Frappe simple : `atk × strike` avec strike = 1,1 (Guerrier), 1,05 (Assassin), 0,8 (Mage), 0,7 (Prêtre), 0,6 (Occultiste).
- Sorts de dégâts : `atk × mult` (mana), **sans modificateur de classe** : le Mage ne « double » jamais sa frappe, il paie 2-5 mana pour ×1,4-1,9 ; à 3 tours d'intervalle de cast, son tour moyen vaut moins que la frappe d'un Guerrier.
- La valeur du Mage se concentre dans les sorts de zone (école Lame d'Écume, uniques ×2,6 sur toute la ligne), qui sont gated par les crans et paliers.
- Les PV moyens à plat : Mage hp 51 vs Guerrier 88 au palier R.

**Extension multi-paliers (mesure du 13/11 au soir, même protocole v3, 3× la meilleure carte JOUEUR par classe et palier, critère cardPower, niveau 12, N = 3000 par ligne, 0 exception, 0 marathon)** :

| Palier | Guerrier | Assassin | Mage | Prêtre | Occultiste | Écart max |
| --- | --- | --- | --- | --- | --- | --- |
| UC | 63,8 % (a47) | 55,2 % (a40) | 49,4 % (v2) | 31,4 % (p1) | 24,3 % (q2) | 39,5 pts |
| R | 78,6 % (a48) | 67,4 % (a41) | **58,9 % (v3)** | 39,3 % (u3) | 37,8 % (q3) | 40,8 pts |
| SR | 85,9 % (b1) | 80,0 % (b7) | 70,3 % (b6) | 63,0 % (u4) | 59,5 % (q4) | 26,4 pts |
| UR | 93,5 % (a15) | 87,5 % (a16) | 85,0 % (a22) | 83,7 % (u5) | 81,7 % (q5) | **11,8 pts** |

Décomposition par difficulté (d1/d2/d3) disponible dans le script `etude-paliers.mjs` ; repère : à UR, le pire mono-classe (Occultiste) fait 69,5 % en difficile, le meilleur (Guerrier) 89,7 %.

Trois lectures de l'extension :

1. **La hiérarchie s'auto-corrige aux paliers hauts** : l'écart max passe de 40,8 pts (R) à 11,8 pts (UR), parce que la data haut de gamme donne à tous des profils quasi offensifs (u5 Arbalétrier Doré, un Prêtre, atk 27 ; q5 Grande Prêtresse de l'Ombre atk 27). La question ouverte n°5 est répondue : oui, les paliers hauts resserrent l'écart, et ça éclaire le chantier : **le bas de tableau n'est pas un problème de classes, c'est un problème de data des paliers bas** (supports à atk 2-6).
2. **Le Mage R était sous-estimé, et l'écart est un bug de budget data** : la meilleure carte Mage R par puissance est v3 l'Évocateur (**58,9 %**), pas a20 la Fournaise (34,8 %) : mêmes atk 14, int 11, agi 7, seuls les PV diffèrent (70 vs 51). 24 points d'écart **dans la même classe, au même palier**, portés par une seule stat : le pool Mage R est incohérent (v-série hp 70, a-série hp 50-51). Le Mage n'est pas intrinsèquement faible : sa data de palier R l'est.
3. **Les cibles du concepteur (tranchées le 13/11 au soir)** : facile/normal 70-80 % de victoire, difficile ~50 % ; en mono-classe, Guerriers 70-80 %, Mages et Assassins 60-70 %, supports 40-50 % max (un trio full support ne fait pas de miracles) ; et tout trio de classes différentes (mage-prêtre-occultiste autant que guerrier-prêtre-mage) doit atteindre à peu près le même haut plateau. Mesuré : ces cibles sont tenables sans changer le moteur, en réalignant la data des paliers bas sur le modèle des paliers hauts.

### 2. Le coût d'un emplacement support, et pourquoi la data seule ne suffit pas

Avec la même paire offensive (2× Maître Charpentier) en avant :

| 3ᵉ carte (arrière) | Taux | Coût du slot |
| --- | --- | --- |
| a48 (full dégâts, référence) | 78,6 % | (référence) |
| s6 Sentinelle d'Acier (tank, atk 4, hp 62) | 70,9 % | **−7,7 pts** |
| s5 Prêtresse de l'Aube (soigneur, atk 3) | 69,9 % | **−8,7 pts** |
| s5 remonté en data (atk 10, int 12, agi 6) | 71,5 % | −7,1 pts (la remontée ne récupère que **+1,6 pt**) |
| s6 remonté en data (atk 12) | 74,9 % | −3,7 pts (la remontée récupère **+4,0 pts**) |

Lecture : la remontée d'ATQ du tank « fonctionne » à moitié (elle rend sa frappe utile), mais la remontée du soigneur est presque inopérante, parce que le problème n'est pas sa fiche, c'est **le tour qu'il consomme** : à 3 actifs, chaque tour de soin est un tour où l'équipe ne tue pas, et le plafond de soin (35 % PV max, seuil IA de soin à 35 %) empêche d'annuler les dégâts de la vague. Convergence exacte avec l'étude de polyvalence (full dégâts 46,9 % > mixte 40,0 % > soin-support 34,4 % au même protocole) : chaque slot non-offensant coûte 6 à 9 points, selon la puissance de l'équipe qui l'entoure.

### 3. Les monstres jouables : une deuxième collection, un écart de data et une pathologie

Les 159 monstres sont une collection **jouable** (recrutement ~1 % en donjon, rayon 🐾 de la Boutique, Guilde, fusion, lignées de fusion) : 5 classes réparties presque également (Guerrier 35, Occultiste 33, Prêtre 32, Mage 31, Assassin 28), un élément pour chacun, un sort signature (pas de liste de sorts), et la race porte un **cran** multiplicatif sur atk **et** pv : monstre +10 %, mystique +20 %, divine +30 %, humaine 0 %. **Le catalogue est racialement mixte** : 73 monstres (cran 10 %), 47 mystiques (20 %), 20 humains (0 %, la strate z des donjons) et 19 divins (30 %) ; la data diverge aussi par race (moyennes brutes R : divine atk 9,0/hp 70,5 orientée support, mystique 16,3/74,9, monstre 17,3/71,9 ; l'Occultiste domine les races élevées : 15/47 mystiques, 8/19 divins).

**Mesures mono-classe monstres** (même protocole v3, 3× le meilleur monstre R de la classe, niveau 12, équipe témoin joueur rejouée à l'identique : 2359/3000 ; la race est indiquée car elle porte le cran) :

| Armée (3× meilleur monstre R de la classe) | Taux de victoire | Tours moyens |
| --- | --- | --- |
| Guerrier : 3× Chevalier Défunt (k4, Ombre, mystique +20 %) | **72,9 %** | 6,3 |
| Assassin : 3× Brodeuse des Liens (d15, Nature, divine +30 %) | **73,4 %** | 5,7 |
| Assassin : 3× Traqueur de Suie (f11, Ombre, monstre +10 %) | 57,9 % | 6,0 |
| Mage : 3× Oiseau de Feu (z17, Feu, monstre +10 %) | **57,4 %** | 5,2 |
| Occultiste : 3× Voix du Large (e25, Eau, mystique +20 %) | 4,9 % | 7,8 |
| Prêtre : 3× Diacre du Plein Jour (z24, Lumière, humaine 0 %) | **0,3 %** (+33 marathons) | 9,6 |

**Joueur humain vs monstre recruté, même classe, même palier (R) :**

| Classe | Meilleure carte R (joueur) | Meilleur monstre R | Écart |
| --- | --- | --- | --- |
| Guerrier | 78,6 % (a48) | 72,9 % (k4) | −5,7 pts (la carte a atk 17/hp 88 ; k4 est **mystique** : atk 15/hp 72 bruts, 18/86 effectifs avec le cran +20 %) |
| Assassin | 67,4 % (a41) | 57,9 % (f11) / 73,4 % (d15) | l'écart f11→d15 se décompose : ~12,6 pts de cran (monstre→divine) + ~3 pts d'élément (§3) |
| Mage | 58,9 % (v3, hp 70) [34,8 % avec a20, hp 51] | **57,4 %** (z17, hp 72, Feu) | quasi alignement avec la vraie meilleure carte (v3) ; l'écart de 22,6 pts mesuré contre a20 venait du bug de PV de la série a |
| Prêtre | 6,5 % (s5) | **0,3 %** (z24, 33 marathons) | −6,2 pts |
| Occultiste | 6,4 % (w3) | 4,9 % (e25) | −1,5 pts |

Quatre lectures :

1. **La data des lanceurs divergeait entre les deux collections : c'était surtout un bug de data carte.** Le Mage monstre R (atk 15, hp 72, int 12) écrasait la carte Mage R mesurée (a20, atk 14, hp 51) : +22,6 points, dont l'essentiel venait des PV (+41 %) ; mais la vraie meilleure carte Mage R (v3, hp 70) fait 58,9 % : à data comparable, les collections s'alignent. L'élément Feu est mesuré ~neutre pour les Mages (d4 divine Lumière 69,5 % = z17 monstre Feu 57,4 % + cran +20 %, au point près). Reste une divergence réelle : les supports (lecture 2).
2. **Les supports monstres ne montent jamais.** Prêtres monstres : atk moyen 2,0 (C) → 3,2 (R) → **6,0 (L)** ; Occultistes monstres : 2,0 → 17,3. Là où les cartes humaines support montent au moins vers 13-14 en L, le monstre recruté reste un poids mort à tous les paliers. Et le cas extrême est **pathologique en plus d'être faible** : 3× Diacre = 0,3 % de victoires avec **33 combats de 150+ tours** (mutualisation des soins sans capacité de tuer) : c'est la queue de durée p95 constatée dans l'étude durée, incarnée côté joueur.
3. **Race et élément, décomposés par paires quasi jumelles.** L'expérience naturelle initiale (f11 Ombre 57,9 % vs d15 Nature 73,4 %, stats identiques) mélangeait **deux facteurs** : d15 est divine (+30 %) et f11 monstre (+10 %). Les paires jumelles du catalogue les séparent (mesures au même protocole, N = 3000) :

| Paire (même classe, stats quasi identiques) | Facteur isolé | Mesure |
| --- | --- | --- |
| z4 Lancier Solaire (humaine, Feu, 14/73) vs f4 Chevalier de Braise (monstre, Feu, 14/76) | **cran +10 %** (humaine→monstre) | 58,3 % vs 66,2 % → **+7,9 pts** |
| f11 Traqueur de Suie (monstre, Ombre, 15/70) vs k13 Goule des Caveaux (mystique, Ombre, 15/72) | **cran +10 %** (monstre→mystique) | 57,9 % vs 64,2 % → **+6,3 pts** |
| e4 Sergent des Brumes (Eau) / f4 (Feu) / g4 Gardien des Remparts Verts (Nature), Guerriers monstres 14/74-76 | **élément** (à cran fixe 10 %) | 64,5 % / 66,2 % / 64,4 % → **±1,7 pt** |
| e20 Rôdeur des Fonds (Eau, 14/70) vs f11 (Ombre, 15/70), Assassins monstres | **élément** (à cran fixe, léger bruit atk +1) | 54,3 % vs 57,9 % → **~+3 pts** pour l'Ombre |
| d4 Juge des Heures (divine, Lumière, Mage 15/72) vs z17 Oiseau de Feu (monstre, Feu, Mage 15/72) | **cran +20 %** (monstre→divine) | 57,4 % vs 69,5 % → **+12,1 pts** (cohérent avec 2× +6,3, l'élément Lumière vs Feu étant ~neutre) |

Lecture : le cran de race vaut **+6 à +8 points par palier de 10 %** (deux mesures indépendantes concordantes), l'élément pur **±1,7 à 3 points**. Les 15,5 points de l'écart d15→f11 se décomposent donc en **~12,6 points de cran** (monstre→divine) et **~3 points d'élément** (la synergie Nature +15 % ATQ d'équipe contre Ombre −25 % dégâts subis, plus l'exposition : une équipe full Ombre encaisse +25 % des frappes Lumière, et le Zénith est peuplé de Lumière ; les éléments séparés font mieux que le mono-Ombre : 64,0 %). Le slot support monstre coûte le même prix que côté humain : 2× k4 + soigneur z24 = **63,7 %** (−9,2 pts vs 3× k4), + contrôle e25 = 63,5 % (−9,4 pts).
4. **Le cran est un multiplicateur : il amplifie les bases au lieu de corriger les rôles.** +10 % sur atk **et** pv enrichit un attaquant (f4 : +1,4 atk/+7,6 pv effectifs) et ne sauve pas un support (un Prêtre divin atk 3 ne gagne que +0,9 atk ; son +30 % PV le rend seulement difficile à tuer). Conséquences : (a) extrapolé, un divin (+30 %) vaut ~+19 à +24 points sur la même base humaine, plus que l'écart entre la meilleure et la pire classe ; (b) la data divine est pourtant **orientée support** (moyenne brute atk 9,0, l'Occultiste en tête), donc la race la plus forte en théorie est posée sur les classes les plus faibles : un Assassin ou un Guerrier divin serait aujourd'hui sans équivalent en puissance ; (c) côté joueur, la couche est presque vide : **13 cartes non humaines sur 150**, toutes N/C/UC (5 Embryons monstres N, 3 Enges mystiques N, 5 divins dont 3 Prêtres : Ange, Jeune Séraphin, Ange Gardien) : le cran n'est pas encore accessible en palier R par les cartes. Le cycle de fusion v4 (humaine→monstre→mystique→divine) va l'ouvrir : **à budgéter avant** (M4), sinon la fusion devient un escalier de power creep de +7 pts par cran.

**Conséquence d'ensemble** : le joueur qui recrute des monstres accède à une couche du jeu (éléments, synergies d'élément, cran de race) que les cartes humaines ne voient pas, et réciproquement les monstres n'ont ni familles de lignée ni écoles. Le rééquilibrage doit donc se faire **par classe, sur les deux collections à la fois**, avec les mêmes contrats M1, et le cran de race traité comme un paramètre de budget explicite (M4), pas comme un décor.

### 4. Le modèle de stats : l'INT est une stat orpheline

Vérifié dans `makeUnit` et la résolution des sorts :
- **Dégâts (frappe et sorts hostiles)** : `u.atk` uniquement. L'INT n'apparaît nulle part dans le calcul de dégâts.
- **Soins et boucliers** : `statOf(u)` = stat principale du profil (INT pour Mage, Prêtre, Occultiste), plafonnés à 35 % PV max.
- **Mana** : palier de famille + 2×INT, plafonné à +50 % ; régén + INT/2, même plafond.
- **Seuil de résistance** : palier de la cible + INT/2 (le stun par `taux − seuil` du grimoire est inopérant depuis v0.47, déjà documenté ; le statut est désormais posé par un jet de taux).

Conséquences mesurées et de data :
- **Focus +25 % INT sur Mage : 34,8 → 35,7 %** (bruit). **Arme +25 % ATQ : 34,8 → 41,5 %.** L'INT n'achète que du mana et du soin : pour un nukeur, c'est une stat de support.
- **Le Prêtre est doublement pénalisé** : atk médian 4,7 à 5,6 sur les paliers C-R (vs 7 à 15 pour les autres classes), et INT médiane 2 à 3 (vs 4 à 11 pour le Mage au même palier). Le soigneur du jeu a la stat de soin la plus basse du jeu : Étreinte Matinale (lignée aube, coût 2, ×1,5) soigne **3 PV** avec INT 2. Seule la signature plate (effect.value 16-26) fait du soin réel.
- **Les armes sont mal typées pour la moitié des classes** : 19 des 23 armes de chaque classe donnent `atkPct`, y compris bâtons et focus ; les pièces `intPct` (4 par classe) sont minoritaires. Pour un Prêtre, une arme +25 % ATQ booste une frappe de 0,7 × atk 3 : quasi rien ; une arme +25 % INT boosterait ses soins de lignée, son mana et ses seuils.

### 5. Économie des sorts : courbe unique, rendement décroissant, valeur concentrée

- **Les 14 familles de lignée partagent la même courbe** : coût 2/3/5/9/14/20, multiplicateur 1,4/1,6/1,9/2,6/3,4/4,5 (soins et boucliers : 1,5 → 6). Aucune différenciation de famille : la lisibilité est maximale, l'identité nulle (l'arbitrage « école de référence des familles » du 11/11 ne s'est pas encore traduit en chiffres).
- **Rendement par mana décroissant** : DPM 0,70 au cran C, 0,225 au cran L. Les gros sorts sont des bursts hors regen (le cran L à 20 mana demande la réserve complète du palier UR). C'est un choix défendable (burst vs endurance), mais à cette condition : que le burst tue. Sinon le cran L est un piège à mana.
- **La zone est la vraie valeur** : sorts uniques ×2,6 sur toute la ligne à 6 mana (DPM effectif ×3-4 en multi-cibles), et les crans IV des sorts d'école (largeur 5). Les familles de lignée, elles, sont 100 % mono-cible : les 42 sorts de lignée ne ciblent qu'« 1 ennemi » (sauf soins/boucliers/renforts).
- **Palier de mana vs palier de sort** : FAMILY_MANA (8/11/14/22/30/40) + INT. Le cran L (20) devient jouable vers le palier SR-UR, mais le palier SR (22 + INT) lance aussi les crans I-III en rafale : l'optimum mesuré du harnas (combats courts) favorise les petits sorts.

### 6. Éléments et synergies : la roue appartient aux monstres, les humains la regardent

- **Cartes humaines : 137/150 Neutres** (3 Lumière, 1 Ombre, 9 sans champ). Les frappes d'une équipe humaine n'ont jamais de bonus ni de malus d'élément ; les sorts portent l'élément de leur école (la Lame = Neutre, le Baume/l'Appel/la Ferveur = Lumière, le Rempart = Nature, l'Entrave/le Mauvais Œil = Ombre, la Ruse = Eau). **Les monstres recrutés, eux, portent un élément** : une équipe mixte ou full-monstres joue la roue dans les deux sens (frappes typées +25 %, exposition +25 %, synergies d'élément à 2 exemplaires : Feu +10 % PV, Eau +10 % ATQ, Ombre −25 % dégâts subis, Nature +15 % ATQ, Lumière +10 % dégâts). Mesuré à cran de race fixe : **±1,7 à 3 points entre éléments d'une même classe** (§3) ; les écarts d'élément plus grands vus plus tôt étaient confondus avec le cran de race.
- **Répartition éléments × classes des monstres** (jouable par recrutement) : Mage 16/31 Feu, Assassin 15/28 Ombre, Prêtre 12/32 Lumière, Occultiste 11 Eau + 11 Ombre, Guerrier réparti (9 Eau, 8 Nature, 6 Feu, 6 Lumière, 6 Ombre) : les synergies d'élément se construisent naturellement par classe côté monstres.
- **Trois familles (lame, ombre, eau) sur 14 n'ont aucun élément porté par leurs sorts** (école de la Lame = Neutre) : elles ne profitent jamais du +25 % d'opposition, les 11 autres familles oui.
- **Synergies de classe** : Guerrier +10/+25 % ATQ d'équipe (les plus fortes, mesurées dans le 78,6 %), Mage p2 : première attaque du tour frappe tous les ennemis à 50 %, Assassin p2 : 20 % de double attaque, Prêtre : soins +50 % puis régén 5 %/tour (sur des soins faibles : +50 % de presque rien), Occultiste : malédictions 0,3 puis 0,45.

### 7. Équipement : la partition RPG qui marche (à quelques alignements près)

- Mesuré au même protocole : **arme SR +25 % ATQ = +6,2 pts** (Guerrier 78,6 → 84,8 %) ; **+ arme + armure (+25 % ATQ +25 % PV) = +10,4 pts** (89,0 %). C'est l'ordre de grandeur d'un palier de rareté : l'équipement est bien un pilier de puissance.
- Data : 150 pièces, bonus fixes par rareté (C +5 %, UC +10 %, R +15 %, SR +25 %), 115 armes (19 par classe en `atkPct`, 4 en `intPct`/`agiPct`), 19 armures `hpPct`, 16 slots d'équipe ; bonus de set 5 %, craft base/supérieure/royale.
- À aligner : armes `intPct` par défaut pour Mage/Prêtre/Occultiste (la stat de leurs soins et de leur mana), et si l'arbitrage « INT pilote les sorts de dégâts » est pris (voir plus bas), c'est le contraire qui doit être joué avec prudence : un seul des deux, pas les deux.

### 8. Progression, rareté, XP

- **XP par niveau quadratique** (`lvl × (1 + 0,25 × (lvl−1))` : 1 → 115 XP du niveau 1 au cap 20, cumul 874) : saine pour le cap actuel. La cible actée « progression 1 → 100 » demandera une courbe cubique (précédent Pokémon : total n³) et une table de minutes par niveau, pas un simple étirement.
- **Rareté = stats brutes croissantes × RARITY_POWER (1 → 1,52)** appliqué à la métrique de puissance des vagues : le budget de puissance d'une L est ~6× une C (4× par les stats, 1,5× par le facteur). Cohérent avec les bandes de difficulté par mode (C→R à M), à surveiller pour que la « commune niveau 100 » actée reste un objectif atteignable et pas un slogan.
- **Niveau de donjon 1 → 25, DUNGEON_TIER_LEVEL_MULT 1,5** : la difficulté suit les niveaux, la puissance suit les deux : c'est le bon squelette.
- **Monstres** : atk moyen C 6,6 → L 27,3 → M 53,3 ; joueur L 29-42 selon la classe : les boss (BOSS_HP_MULT 1,55, FINAL ×2,3) font le reste du travail. La piste avalisée « boss de fin de jeu à stats renforcées » est le bon endroit pour l'exception.

### 9. Ce qui tient déjà (à ne pas casser)

- **Durée des combats dans la norme du genre** (miroirs 10,1 tours ; flux donjon 6,8 ; comparatif VGC 8-10) : l'étude de durée l'a établi, le ressenti passe par la vitesse (×2 par défaut et ~400 ms/action déjà recommandés, à re-trancher avec les vitesses par contexte).
- **La formule de frappe (multiplier, ratio, plafonds de réduction 80 %)** n'a pas les pathologies classiques (pas d'immunité par défense soustractive, pas de croissance exponentielle).
- **Esquive et critique plafonnés** (30 % chacun), **exécution Assassin** (+25 % sous 35 % PV) : lisibles et bornés.
- **L'outillage** : digest SHA256, baseline verrouillée, audits rejouables (sorts, durée, polyvalence), tests de non-régression : c'est déjà une discipline de studio.

## Arbitrages à trancher

Chaque arbitrage reprend le format maison : options, recommandation, impact digest.

### A. Retrait du splash Mage (tranché « dans le cadre du rééquilibrage global »)

Le tranchage du 14/11 pose le retrait ; les mesures disent **attention** : le Mage est la classe la plus faible mesurée (34,8 %), et son splash (0,4 sur les autres cibles) est une de ses deux mécaniques identitaires.
- **Option A1** : retrait sec. Digest : Mage → probablement < 30 % mono-classe.
- **Option A2 (reco)** : retrait du splash **compensé dans le même chantier** : frappe 0,8 → 1,0, et le sort de zone devient le territoire exclusif du Mage (voir D).
- **Option A3** : conserver le splash, le documenter (déjà fait en fiche), et ne pas dépenser ce capital d'arbitrage ici.
- Recommandation : **A2**, en un seul lot avec les autres modifs Mage (une seule re-mesure).

### B. L'INT pilote-t-elle les sorts de dégâts ?

Aujourd'hui `atk × mult` pour tout le monde ; l'INT ne fait que mana/soin/seuils.
- **Option B1 (reco)** : **oui pour les profils INT** (Mage, Prêtre, Occultiste : les sorts de dégâts passent sur la stat principale INT du profil, comme les soins). Effets : l'INT devient la vraie stat de nukeur, les armes `intPct` deviennent naturelles, le Prêtre/Occultiste remontent via INT sans toucher leur identité de soigneur/contrôleur, et la data « INT 2 » des supports crève l'œil (corrigée en même temps).
- **Option B2** : statu quo, et les armes lanceurs passent `intPct` en data pour les soins/mana uniquement (gain mesuré ~1 pt : faible).
- **Option B3** : fusion ATQ/INT en une stat unique par profil (plus lisible, mais perd la dualité dégâts/soutien).
- Recommandation : **B1**, avec armes alignées (`intPct` pour les 3 profils INT) et data INT des lanceurs/soutiens relevée. Impact digest : majeur, une seule baseline en fin de chantier.

### C. Le tank actif (tranchage 6 du 14/11 : provocation, dégâts remontés, piste stat de défense)

Les mesures confirment la direction et donnent les ordres de grandeur :
- **Remontée d'ATQ** (s4 → 6, s11 → 12-14 proposés) : récupère ~+4 pts sur le slot tank, insuffisant seul (slot toujours à −3,7 pts).
- **Provocation** (sort de lignée du Rempart, force les monstres à cibler le tank 1 tour+) : c'est le levier qui change l'équation, car il valorise le tank par les dégâts qu'il **dévie** (le PV de l'arrière vaut plus que le sien) et rend le remplacement K.O. gratuit (Lot A) moins sollicité. À calibrer : durée (1-2 tours), fréquence (cooldown mana), résistance des boss (taux ×0,5 comme le curse).
- **Stat de DÉFENSE (piste)** : si elle voit le jour, utiliser la formule **ratio** `dmg × K/(K + def)` (chaque point de def ajoute la même fraction de PV effectif, jamais d'immunité) et **pas** la soustractive `atk − def` : à 3 actifs et des atk de 8 à 40, la soustractive crée des murs ou des dégâts 1. K = la défense qui divise les dégâts par 2 à mi-jeu (ex. 20).
- Recommandation : C complet (ATQ + provocation + défense ratio), chantier unique, MESURE digest.

### D. Sorts hybrides et économie d'action du soin (le vrai fix du support)

La remontée de data est nécessaire mais pas suffisante (+1,6 pt mesuré). Les leviers mécaniques, par valeur décroissante :
1. **Sorts de lignée hybrides** (reco déjà posée par l'étude de polyvalence) : drain (dégâts X + soin de la moitié à l'allié le plus blessé), balayage (dégâts de zone + bouclier). Le soigneur tue ET soigne dans le même tour.
2. **Signature drain pour les Prêtres à effet heal** : la signature plate (16-26 PV) devient « frappe ×0,6 + soin équivalent à 50 % des dégâts » : le soin devient indexé sur l'ATQ, qui est déjà la stat qui monte avec les paliers.
3. **Relâcher les verrous du soin** : cap 35 % → 45 %, et seuil IA de soin 35 % → 50 % (l'IA soigne avant l'agonie, le soin devient préventif et lisible).
4. **Sorts de contrôle qui rapportent un tempo mesurable** : le stun d'un ennemi à 6 tours moyens vaut ~1/6 du tour de vague ; les taux (0,15-0,3, ×0,5 sur boss) et durées (1-2 tours) sont déjà dans les data du correctif lot 5 : à re-mesurer avec l'implémentation.

### E. Familles de lignée : différencier sans casser la lisibilité

La courbe uniforme des 14 familles est un bon plancher ; l'école de référence de chaque famille (ACTÉ 11/11) donne la clé de la différenciation : appliquer un modificateur d'école à la courbe (ex. la Lame +10 % mult mais mono-cible ; le Baume ×0,8 mais drain ; le Rempart bouclier par INT avec coût réduit ; l'Entrave mult ×0,7 mais pose le statut). Recommandation : **modificateurs d'école en data** (pas 14 courbes à la main), mesurés par famille au harnas.

### F. La roue des éléments : trois sous-arbitrages

1. **Cartes humaines toutes Neutres** : la mesure du §3/§6 précise l'arbitrage : le joueur **peut** déjà jouer la roue (frappes typées, synergies d'élément) via les monstres recrutés ; mais la mesure corrigée réduit l'enjeu : à cran de race fixe, l'élément ne vaut que ±1,7 à 3 points (le gros levier des monstres est le cran de race, arbitrage I). La question reste de savoir si cette couche doit être **le privilège des monstres** (identité forte : les humains sont Neutres, l'élément vient des sorts et des créatures : reco, cohérente avec le lore du Lieur) ou si les écoles l'ouvrent aussi aux cartes humaines (2 cartes de la même école dans l'équipe → la synergie de l'élément de l'école). Dans le premier cas, documenter l'accès par les monstres dans les règles du jeu, c'est aujourd'hui invisible.
2. **La Lame = Neutre** : les familles lame/ombre/eau ne voient jamais le +25 % : option (a) assumé (l'identité Neutre = pas de bonus ni de malus, y compris adverse), option (b) la Lame reçoit un élément (Eau pour la lignée eau, Ombre pour ombre : cohérent avec les biomes), reco : **(b)**, à poser avec le grimoire élémentaire v2 (PISTE déjà ouverte dans `regles-jeu.md`).
3. **Grimoire élémentaire v2** (l'élément porte le sort) : c'est la piste déjà consignée ; elle résout 1 et 2 ensemble.

### G. Variance individuelle des stats (tranchage 4 : direction aimée, indicateur à trancher)

Reco : **indicateur visible** (rang de nature en fiche), pas caché : le jeu est une collection (inspecter la fiche est un acte central), les stats sont déjà fixes par carte + niveau, la variance sera une exception rare : la rendre lisible évite le sentiment de triche et nourrit la chasse à la carte parfaite. Taux à caler (précédent shiny : 1/50 des « Lignées d'Exception » : le même taux peut porter les deux). Boss de fin de jeu à stats renforcées : confirmé par les mesures (boss ×1,55 PV / ×1,08 ATK + l'exception individuelle aux 3 donjons divins à venir).

### H. Raccourcissement des combats (ATK ×1,25 + HP ×0,85 : −26 % mesuré)

Si c'est voulu, l'intégrer **dans** le rééquilibrage global (une seule nouvelle baseline), pas après : les cibles hits-to-kill (ci-dessous) doivent être re-dérivées avec les nouveaux modificateurs de classe, sinon deux recalibrages successifs.

### I. Les deux collections : un seul contrat de classe, deux jeux de data — **TRANCHÉ le 13/11 au soir : option I1 actée**

Le meilleur monstre Mage R bat la meilleure carte Mage R de 22,6 points (corrigé le 13/11 au soir : la vraie meilleure carte Mage R est v3 à 58,9 %, soit un alignement quasi parfait avec le meilleur monstre 57,4 % ; l'écart de 22,6 pts venait surtout du bug de PV de la série a, hp 51), et les supports monstres restent des poids morts à tous les paliers (Prêtre monstre : atk 6,0 **en L**) : les deux collections divergent alors qu'elles servent la même classe. Note de design : le catalogue monstre sert à la fois d'ennemis (vagues) et d'alliés recrutables : tout changement de budget se voit des deux côtés, la difficulté des donjons en dépend.
- **Option I1 : ACTÉE le 13/11 au soir.** **Un contrat de classe unique** (M1) et des budgets de stats par palier partagés : à rareté et classe égales, un monstre recruté ≈ une carte humaine. Le différentiel d'identité du monstre vient du cran allégé sur les PV (J4, 5/10/15), de son élément et de son sort signature, compensé par l'absence de familles/écoles côté monstre. Concrètement : relever les PV des cartes Mage humaines de la série a (51 → ~70 au palier R, le bug mesuré à 24 pts), et l'ATQ des supports monstres (2-6 → 8-14 selon palier, le lot non négociable avec ses 33 marathons).
- **Le cran par race doit être budgété, pas hérité** : le cran n'est pas un seul +10 %, c'est un escalier mesuré à **+6-8 points par palier** (§3) : avec le cran allégé de J4 (PV seulement, 5/10/15 %, attendu ~+1-3 pts par palier), l'escalier reste lisible sans dominer les contrats. Si la fusion v4 rend les races accessibles aux cartes du joueur, chaque cran doit se payer ailleurs (coût de fusion, XP, rareté d'accueil).
- **Option I2 (écartée)** : les monstres volontairement plus forts en combat (compensation de leur absence d'écoles/équipements typés) : l'écart mesuré devrait alors être **systématique** (toutes classes, tous paliers), pas accidentel comme aujourd'hui : écarté le 13/11.
- **Option I3 (écartée)** : statu quo documenté : fragile, car l'écart actuel n'a aucune cohérence de classe (il va dans les deux sens) : écarté le 13/11.
- **Conséquence I1 pour le chantier** : les budgets M4 par voie × classe s'appliquent aux DEUX catalogues ; après l'alignement, re-mesurer la difficulté des donjons (le même budget alimente les vagues ennemies) et verrouiller la nouvelle baseline en conséquence.

### J. Refonte structurelle v2 : les directions du 13/11 évaluées une à une

Le 13/11 au soir, le concepteur pose une refonte de fond plutôt qu'un rééquilibrage de data : 5 stats (dont une INT qui pilote les sorts), provocations à charges pour le gardien, cran de race revu à la baisse, cap de soins retiré, sorts débloqués par niveau, synergies revues, 3 voies de combat. Verdict point par point, avec la mesure interne et le précédent du genre. **Si ces directions se confirment, elles remplacent une partie des arbitrages ci-dessus (B, D, C déjà tranché, F) et réordonnent le plan de chantier : refonte moteur d'abord, data ensuite, une seule nouvelle baseline.**

| # | Direction posée | Verdict | Pourquoi (mesure interne + précédent du genre) |
| --- | --- | --- | --- |
| J1 | 5 stats : vie, dégâts, défense, agilité, intelligence ; l'INT pilote tous les sorts des mages, prêtres, occultistes (dégâts et soins) | **Tranché le 13/11 au soir : à faire** | Ça tranche l'arbitrage B dans le bon sens : aujourd'hui l'INT ne pilote rien en dégâts (mesuré : +25 % INT sur un Mage = du bruit, 35,7 vs 34,8 %), tous les sorts passent par `atk × mult`. Deux stats d'attaque (dégâts pour les physiques, INT pour les sorts) est le modèle Pokémon : la répartition physique/spéciale a été la refonte de la gen 4, précisément pour que chaque stat pilote quelque chose ([Smogon University](https://www.smogon.com/articles/physical-special-split)). Bonus confirmé : les équipements `intPct` deviennent enfin le levier d'amplification des lanceurs (l'arme du Mage). |
| J2 | La défense, stat globale (prêtres et certains guerriers plus tanky) | **À faire, avec la bonne formule** | Une stat de défense est saine si elle ne rend jamais immunisé : formule ratio `dmg × K/(K+def)` (chaque point de défense ajoute la même survie effective, rien ne tombe à zéro : la formule de League of Legends, K = la défense qui divise les dégâts par deux). Échelle du jeu : avec atk ~14, prendre K ~10 (déf 5 = dégâts ×2/3). C'est aussi la « piste stat de défense » de l'arbitrage C. |
| J3 | Retirer les modificateurs de dégâts par classe (guerrier 110 %, mage 70 %) | **À faire** | Le split stats de J1 les rend redondants : la différenciation vient des stats affichées (le mage a une grosse INT et une petite attaque), plus besoin d'un coefficient caché. Les multiplicateurs invisibles sont le levier le plus puissant du moteur (mesuré : +25 % ATQ = +6,2 pts) : les sortir du calcul et les remettre dans la data lisible simplifie les budgets M4. |
| J4 | Réduire ou retirer le cran de race (+10/+20/+30 %) | **Tranché le 13/11 au soir : cran allégé, porté par les PV seulement** | Le cran actuel vaut +6 à +8 points par palier de 10 %, gratuits (§3) ; le concepteur garde un symbole léger d'identité (« montrer que ces races ont quelque chose de plus puissant ») : piste **5/10/15 % sur les PV** (ou 3/6/9), à calibrer au harnas. Ordre de grandeur attendu : ~+1 à +3 pts par palier (mesure de référence : +25 % PV en équipement ≈ +4 pts, partagé avec l'ATQ). |
| J5 | Retirer le multi-coup permanent du Mage | **Oui, mais re-mesurer ; complément du 13/11 : le mage garde une attaque magique de base** | Le Mage mesuré à 34,8 % l'était AVEC ce splash (58,9 % avec sa vraie meilleure carte v3) : le retrait doit être compensé. Complément acté : un sort d'attaque de base façon « boule de feu », 1-2 mana, toujours disponible, qui frappe au fil de l'INT : le mage ne se retrouve jamais sans action, et ses vrais sorts restent des pics de puissance. Le multi-cible peut survivre comme sort de grimoire à gros coût mana, pas comme passif gratuit. |
| J6 | Sorts débloqués automatiquement au fil des niveaux + grimoires par zone pour débloquer/évoluer | **À faire** | C'est le standard du genre : Pokémon (les capacités arrivent par niveau), et DQM fait exactement le couple prévu : des talents qui se remplissent par points, dont beaucoup s'apprennent via des parchemins d'instruction, échangeables entre monstres ([Dragon Quest Wiki](https://dragonquest.fandom.com/wiki/List_of_talents_in_Dragon_Quest_Monsters:_The_Dark_Prince)). À dériver des cibles de minutes par niveau (M2), pas des paliers de rareté ; et y mettre tôt les sorts hybrides soin+dégâts (J11) pour que les supports soient jouables dès le début. |
| J7 | Retirer les synergies « 2 exemplaires » (et le typage éléments humain/monstre) | **Tranché le 13/11 au soir : suppression ; piste de remplacement = sorts de trio** | Dans une équipe de 5, un seuil à 2 exemplaires est atteint automatiquement : ce n'est plus un choix de composition (le précédent TFT : les synergies activent à des paliers qui « sautent », et c'est le palier qui crée le choix, [MetaBot.GG](https://metabot.gg/en/TFT/guides/tft-traits-origins-classes-synergies-explained)). Le concepteur supprime le système de bonus ; la piste de remplacement : des sorts spécifiques débloqués par la composition du trio (ex. mage + assassin + prêtre débloque un sort d'équipe unique), ce qui redonne une récompense de composition sans passifs cachés. À prototyper après le moteur v2. |
| J8 | Trois voies : magie (soin, dégâts, ralentissement) / tank première ligne / assassin (burst mono-cible, esquive) | **Tranché le 13/11 au soir : les 5 classes sont gardées comme saveurs des voies** | La mesure regroupe déjà les classes en 3 économies d'action (tuer vite, encaisser, contrôler) et l'extension paliers (§1) confirme que les classes ne sont pas le problème. Position du concepteur : Prêtre = mix guerrier-mage (soin + dégâts), Occultiste = mix mage-assassin (invocations, contrôle + dégâts), Mage = le mage, Guerrier et Assassin = eux-mêmes. Les contrats M1 se dérivent donc **par voie** (3 bandes), les 5 classes fournissant les saveurs et listes de sorts à l'intérieur. |
| J9 | Le gardien a un nombre de provocations par combat (protéger les mages) | **À faire (confirmé le 13/11, ancre Argus)** | C'est l'arbitrage C déjà tranché, et la granularité « charges par combat » est la bonne : la provocation est un achat de tempo, pas un passif, donc une ressource bornée. La ligne tank existe déjà dans la data : Argus le Rempart Éveillé (UR) puis Forteresse Vivante (L), atk 6-7, hp 92-115 : le candidat naturel du rôle. Deux bonus mesurés : ça protège les lanceurs sans cap de soins (J10), et des charges qui s'épuisent bornent aussi les combats. Conditions : l'IA ennemie doit respecter la provocation (changement moteur), et le nombre de charges doit être visible en jeu. |
| J10 | Retirer la limite de soins (« si un soin te régénère 70 %, tant mieux ») | **Tranché le 13/11 au soir : cap retiré, la borne = le mana persistant** | Le concepteur retire le cap en pourcentage et confirme la vraie borne du jeu : les MP ne se régénèrent PAS complètement entre combats (persistance des pertes PV/MP sur la marche, retour à l'autel pour soigner) : un soigneur qui « spame » épuise sa ressource, et la garde 150 tours du harnas reste le détecteur de régression. C'est l'équivalent exact du garde-fou Pokémon (PP finis = Struggle, [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/PP)) déplacé du sort vers la ressource de marche. Vigilance mesurée : si des marathons réapparaissent au harnas (33/3000 constatés sur 3× Diacre), la fatigue type PP sur les sorts de soin reste l'outil en réserve. |
| J11 | Les supports doivent faire autre chose que soigner | **À faire, non négociable** | La mesure interne le dit (0,3 % + marathons pour un pur soigneur) et le genre aussi : FFXIV conçoit ses soigneurs comme des dégâteurs assumés (~50 % de la sortie d'un DPS) parce que raccourcir le combat est la meilleure action de soin ([FFXIV Wiki, Healer Guide](https://ffxiv.consolegameswiki.com/wiki/Healer_Guide)) ; Guild Wars 2 a carrément supprimé le soigneur dédié ([Eurogamer](https://www.eurogamer.net/guild-wars-2-has-no-healers-or-tanks)). Concrètement : chaque soigneur a un sort de dégâts sur INT (J1) dès les bas niveaux, et les sorts hybrides (D) sont la règle, plus l'exception. |
| J12 | Fusions produisant des créatures de stades supérieurs | **À faire, budgété par simulation** | Le concepteur pose la méthode : « des dizaines, centaines, milliers de simulations, tester encore et encore » : c'est le harnas existant (protocole v3, N = 3000), étendu aux fusions. Précédent DQM : la synthèse hérite ~25 % des stats des parents + quelques sorts : une piste de budget où la fusion donne des sorts, pas des stats brutes (moins de power creep, plus de choix). Chaque cran gardé (J4 allégé) doit se retrouver payé dans la chaîne (coût, XP, rareté d'accueil). |

**Verdict d'ensemble** : ces directions vont dans le sens de toutes les mesures de l'étude (INT orpheline, cran trop fort, supports qui ne tapent pas, synergies automatiques). Les trois points de vigilance : (1) le cap de soins doit être remplacé par une borne de ressource, pas retiré seul (J10) ; (2) supprimer le splash Mage oblige à re-mesurer la voie magie avant de figer ses contrats (J5) ; (3) les 5 classes survivent comme saveurs dans les 3 voies, le contenu existant n'est pas à jeter (J8).

**Réordonnancement du plan de chantier si v2 confirmée** : lancement **gated sur la fin de la refonte de l'arbre des familles** (décision du 13/11 au soir : les budgets M4 et la Phase C, qui dérivent les sorts des familles/lignées, attendent l'arbre final). Ensuite : Phase A moteur (5 stats, INT sur les sorts, défense ratio, provocations à charges, modificateurs de classe et splash retirés, cap de soin remplacé par le mana persistant), Phase B data (budgets M4 par voie × classe appliqués aux DEUX catalogues, alignement I1 : supports monstres relevés à atk 8-14, PV de la série a Mage corrigés, cran allégé 5/10/15 % sur les PV), Phase C sorts au niveau + grimoires + sorts de trio (synergies supprimées, J7), Phase D mesure N = 3000 par voie, re-mesure de la difficulté des donjons (double usage ennemis/alliés) et verrouillage d'une nouvelle baseline (nouveau digest). Une seule baseline, comme pour le plan initial.

## Méthodes à appliquer (le cadre, réutilisable)

### M1. Contrats de classe chiffrés (avant tout changement de data)

Pour chaque classe, un contrat de 4 lignes mesurables au harnas, revu à chaque chantier :

| Classe | Identité | Contrat proposé (palier R, niv 12, mono-classe) |
| --- | --- | --- |
| Guerrier | front durable, frappe honnête, provocation | 70-80 % mono-classe ; encaisse 8-10 frappes égales ; ≥ 60 % des dégâts de la référence |
| Assassin | burst mono-cible, exécution, esquive | 65-75 % ; tue un égal en 2-3 tours ; esquive effective 20-30 % |
| Mage | nukeur de zone, burst mana | 55-70 % ; son AoE dépasse la frappe Guerrier dès 2 cibles ; burst cran L ≥ 2× frappe |
| Prêtre | sustain + soin d'opportunité (drain) | 50-65 % ; rend 25-40 % des PV de l'équipe par combat sans perdre le tempo |
| Occultiste | ligne entière + contrôle | 50-65 % ; le wave + le statut coûtent un tour mais retournent ≥ 1 tour de vague |

Bande de tolérance commune : **toute classe dans ±10 points de la référence au même palier, sur les DEUX collections** (cartes humaines et monstres recrutables, mesurés séparément) ; le support pur peut descendre à 40-50 % (il n'est pas joué seul), mais jamais sous 30 %. Un combat-marathon (garde 150 tours) est une violation du contrat, pas seulement un taux bas : à 0,3 % et 33 marathons, 3× Diacre du Plein Jour (Prêtre monstre R) échoue aux deux.

### M2. Cibles hits-to-kill et EHP (la dérivation, pas l'intuition)

Pour chaque palier : un ennemi égal meurt en **2-4 frappes** d'un frappeur du palier, survit le joueur à **5-8 frappes** égales, un boss prend **25-60 frappes** équipe complète. Toute nouvelle carte/ennemi entre dans le harnas avec ces asserts (dérivés de la formule, vérifiés par simulation : la méthode « risk analysis » du genre, une collection d'équations testée des milliers de fois).

### M3. Courbes de coût pour les sorts (le DPM comme ligne de base)

DPM cible par cran (mono-cible) : **0,5-0,7 du cran I au cran IV** (aujourd'hui 0,7 → 0,43 sur les sorts d'école : bien ; 0,7 → 0,225 sur les lignées : étalé trop bas). Sorts de zone : efficacité multi-cibles ≤ 0,7× la mono-cible à coût égal. Hybrides : la moitié du multiplicateur en soin. Toute exception (signature, unique) se paie ailleurs dans le budget de la carte.

### M4. Budget de puissance par carte (rareté × palier)

`power = (2,5 × atk + 0,6 × hp) × RARITY_POWER` existe déjà (`cardPower`) : en faire la référence des fiches data avec des bandes par rareté (une carte à ±20 % de sa bande est un bug de data ou une carte à gimmick documenté). Les tanks bas-ATK sont hors bande **par design** : les y inscrire explicitement (champ `budget: 'tank'`), sinon le futur outil de contrôle les flagera à chaque audit.

### M5. Tiering par l'usage (précédent Smogon adapté)

Le digest mesure le win rate global ; lui adjoindre le **win rate par classe et par famille** dans les packs de 10 000 (l'outil existe : les études mono-classe ci-dessus en sont le prototype). Règle de tri : une carte/famille hors des bandes de son palier deux digests de suite passe en file d'arbitrage (pas de nerf automatique : le digest propose, le tranchage dispose, comme aujourd'hui).

### M6. Procédure de chantier (la votre, formalisée)

1. Baseline verrouillée + études rejouables avant.
2. Contrats M1/M2 écrits.
3. Changements en lots par couche (data → moteur → synergie), mesure digest à chaque lot.
4. Nouvelle baseline proposée avec le tableau avant/après par classe.
5. Aucun double recalibrage : un chantier = une baseline.

## Plan de chantier proposé (4 phases, une seule nouvelle baseline)

**Phase 0 : Outils (1 session).** Commiter les études mono-classe/slots/équipement dans `tools/` (protocole v3, rejouables) ; ajouter la bande de tolérance M1 au harnas. Aucune modification du jeu.

**Phase 1 : Contrats + data (sans toucher le moteur).** Contrats M1 tranchés ; data : INT des Prêtres/Occultistes relevée (2-3 → 6-10 sur C-R), ATQ des tanks (tranchage 6a), armes `intPct` des profils INT, modificateurs d'école E, et **alignement des deux collections (arbitrage I)** : PV des cartes Mage humaines, ATQ des supports monstres (le lot non négociable : plus aucun support monstre sous atk 8, et vérification marathon au harnas), et **budget du cran de race** (10/20/30 % : matrice classe × race dans les contrats si la fusion v4 doit l'ouvrir aux cartes). Mesure : la strate des lanceurs doit rejoindre 50-60 %, supports purs 25-40 %.

**Phase 2 : Moteur.** B1 (sorts sur INT), C (provocation + défense ratio), D (hybrides/drain, cap de soin 45 %, seuil IA 50 %), A2 (splash Mage compensé), éventuel H (ATK ×1,25/HP ×0,85). Une mesure par lot, rapport avant/après par classe.

**Phase 3 : Écosystème.** Synergies d'élément (F), grimoire élémentaire v2, variance individuelle + indicateur (G), boss renforcés, courbe XP 1 → 100 (table de minutes par niveau, cubique). Verrouillage de la nouvelle baseline avec le tableau final.

## Notes de sources

| Source | Crédibilité | Dernière mise à jour |
| --- | --- | --- |
| [Repo Aicg : Lignées, data et moteur (data/*.json, src/engine/*)](https://github.com/mobize191/aicg-lignees) | 5/5 (source première, analysée intégralement) | 12/11/2026 (main) |
| [Journal des arbitrages du projet (docs/arbitrages.md)](https://github.com/mobize191/aicg-lignees/blob/main/docs/arbitrages.md) | 5/5 (décisions actées du concepteur) | 14/11/2026 |
| [Étude de polyvalence du projet (docs/design/etude-polyvalence-2026-11-13.md)](https://github.com/mobize191/aicg-lignees/blob/main/docs/design/etude-polyvalence-2026-11-13.md) | 5/5 (mesure interne, protocole v3, N = 3000) | 13/11/2026 |
| [Étude de durée des combats du projet (docs/design/etude-duree-combats-2026-11-13.md)](https://github.com/mobize191/aicg-lignees/blob/main/docs/design/etude-duree-combats-2026-11-13.md) | 5/5 (mesure interne, moteur réel) | 13/11/2026 |
| [Game Developer : Applying Risk Analysis To Play-Balance RPGs (A. Carpenter)](https://www.gamedeveloper.com/design/applying-risk-analysis-to-play-balance-rpgs) | 4/5 (méthode de référence, illustrée) | 11/06/2003 |
| [Smogon University : An Introduction to Smogon's Tier System](https://www.smogon.com/bw/articles/bw_tiers) | 4/5 (référence du tiering par l'usage) | ~2011 (article BW) |
| [Dragon Quest Monsters: Joker, Monster Growth Guide (GameFAQs)](https://gamefaqs.gamespot.com/ds/933956-dragon-quest-monsters-joker/faqs/53876) | 3/5 (guide communautaire de référence, DQM-like) | v1.0 (époque DQM:J) |
| [Bulbapedia : Experience (courbes XP Pokémon, n³)](https://bulbapedia.bulbagarden.net/wiki/Experience) | 4/5 (wiki de référence, formules vérifiées) | continu |
| [League of Legends Wiki : Armor (formule ratio 100/(100+armor))](https://wiki.leagueoflegends.com/en-us/Armor) | 4/5 (formule officielle documentée) | continu |
| [PoE Wiki : Resistance (plafond 75 %)](https://www.poewiki.net/wiki/Resistance) | 4/5 (wiki officiel du jeu) | continu |
| [Smogon University : If the Physical/Special Split Never Happened](https://www.smogon.com/articles/physical-special-split) | 4/5 (article d'analyse, lu en entier) | - |
| [Bulbapedia : PP (points d'usage des capacités, Struggle à sec)](https://bulbapedia.bulbagarden.net/wiki/PP) | 4/5 (wiki de référence, formules vérifiées) | continu |
| [MetaBot.GG : TFT Traits Explained (paliers 2/4/6)](https://metabot.gg/en/TFT/guides/tft-traits-origins-classes-synergies-explained) | 3/5 (guide de référence de l'auto-battler, lu en entier) | continu |
| [FFXIV Console Games Wiki : Healer Guide (soigneurs = dégâteurs ~50 % DPS)](https://ffxiv.consolegameswiki.com/wiki/Healer_Guide) | 3/5 (wiki communautaire de référence, lu en entier) | continu |
| [Eurogamer : Guild Wars 2 has no healers or tanks](https://www.eurogamer.net/guild-wars-2-has-no-healers-or-tanks) | 3/5 (presse spécialisée, extrait) | 2011 |
| [Darkest Dungeon Wiki : Stalling (renforts après 2 tours de stall)](https://darkestdungeon.wiki.gg/wiki/Stalling) | 3/5 (wiki du jeu, extrait) | continu |
| [Dragon Quest Wiki : talents de DQM The Dark Prince (points + parchemins d'instruction)](https://dragonquest.fandom.com/wiki/List_of_talents_in_Dragon_Quest_Monsters:_The_Dark_Prince) | 3/5 (wiki communautaire de référence, extrait) | 2024 |

Conflits et précautions : les cibles M1/M2 (bandes de win rate, hits-to-kill) sont des points de départ de design, pas des normes du genre mesurées ; le tranchage du splash Mage (A) oppose la mesure (le Mage est faible) à la décision du 14/11 : la recommandation A2 respecte la décision tout en la compensant ; les deux échecs de tests constatés au clonage sont liés aux manifestes d'arts (fichiers de 30 Mo non inclus), pas au moteur.

## Questions ouvertes

1. **La cible d'équilibre : TRANCHÉE le 13/11 au soir.** Facile/Normal : 70-80 % de victoire ; Difficile : ~50 % ou moins. En mono-classe : Guerriers 70-80 %, Mages et Assassins 60-70 %, supports 40-50 % max ; tout trio de classes différentes doit atteindre à peu près le même plateau. Les bandes M1 se dérivent de ces cibles.
2. **Le support doit-il être viable seul ? : TRANCHÉ le 13/11 au soir.** Non, pas viable seul : il doit pouvoir gagner un combat, mais 40-50 % max en mono ; un trio full support ne fait pas de miracles. C'est un choix d'identité acté.
3. **INT pilote les sorts (B1) : TRANCHÉ le 13/11 au soir (J1).** L'INT augmente le dégât des sorts de toutes les voies magiques, et les équipements deviennent le levier d'amplification des lanceurs.
4. **Les synergies : TRANCHÉ le 13/11 au soir (J7).** Suppression du système actuel ; piste de remplacement : des sorts spécifiques débloqués par la composition du trio, à prototyper après le moteur v2.
5. **Paliers hauts : RÉPONDU par la mesure du 13/11 (§1).** L'écart max de classes passe de 40,8 pts (R) à 11,8 pts (UR) : la hiérarchie s'auto-corrige aux paliers hauts, et le Mage R était sous-estimé (v3 Évocateur 58,9 % vs a20 34,8 %, écart de PV pur). Les contrats M1 restent à figer sur les 3 voies (J8).
6. **La place de la collection monstre : TRANCHÉE le 13/11 au soir : I1.** À rareté et classe égales, un monstre recruté ≈ une carte humaine (budgets M4 partagés) ; identité du monstre par le cran allégé sur les PV (J4), son élément et son sort signature. Lots non négociables : supports monstres relevés (atk 8-14), bug de PV de la série a Mage corrigé, et re-mesure de la difficulté des donjons après alignement (le catalogue alimente aussi les vagues ennemies).
7. **Le cran de race : TRANCHÉ le 13/11 au soir (J4).** Allégé, porté par les PV seulement, piste 5/10/15 % (ou 3/6/9) : à calibrer au harnas (attendu ~+1 à +3 pts par palier).
8. **Les 3 voies : TRANCHÉ le 13/11 au soir (J8).** Les 5 classes sont gardées comme saveurs des voies : Prêtre = mix guerrier-mage, Occultiste = mix mage-assassin.
9. **La borne du soin : TRANCHÉ le 13/11 au soir (J10).** Cap en pourcentage retiré ; borne = le mana, qui ne se régénère pas complètement entre combats (persistance des pertes, retour à l'autel). La garde 150 tours reste dans le harnas comme détecteur.