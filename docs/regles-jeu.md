# Règles du jeu : la référence

> Source de vérité : `data/*.json` (toutes les valeurs chiffrées) et ce document (les règles). Les tableaux détaillés vivent dans `docs/tables/` (générés). Tout ce qui est `PISTE` dans `docs/arbitrages.md` n'est PAS joué, c'est du design cible en maquette. Les règles marquées **ACTÉ** sont tranchées et s'imposent aux data et au moteur ; celles du 10/11/2026 (lignes avant/arrière, économie v2, errance, équipement) sont en cours d'implémentation (chantier lignes puis bloc visuel, voir `docs/roadmap.md`).

## 1. L'identité d'une carte

- **Classes actives (5)** : Guerrier, Mage, Prêtre, Assassin, Occultiste. La classe Invocateur a été retirée le 10/11/2026 : les invocations passent par l'école de l'Appel.
- **Éléments (5)** : Feu, Eau, Terre, Ombre, Lumière. Roue des forces (`engine.BEATS`) : Feu bat Terre, Terre bat Eau, Eau bat Feu, Lumière bat Ombre, Ombre bat Lumière.
- **Races (4)** : humaine, monstre, mystique, divine (rangs d'éveil croissants dans `trees.json`).
- **Raretés** : C < UC < R < SR < UR < L, multiplicateur de puissance dans `engine.RARITY_POWER` (1 → 1.52).
- **Caractéristiques (v0.47)** : chaque carte porte ATQ (la stat principale de combat), PV, **AGI** (agilité) et **INT** (intelligence), réparties par profil (`engine.moteur.STAT_RATIOS` : la stat principale domine toujours, le Guerrier est agile, le Mage et le Prêtre sont intelligents, l'Assassin le plus agile).
- **Mana** : par palier de famille (`engine.FAMILY_MANA` : max 8/11/14/22/30/40, régén 2/3/3/5/6/8) ; **depuis la v0.47, l'intelligence enrichit le mana** : max = palier + 2×INT, recharge = palier + INT/2, bonus plafonnés à +50 % du palier (`MANA_PER_INT`, `MANA_REGEN_PER_INT`, `MANA_CAP_RATIO`) ; monstres 10 max, régén 2 (`MONSTER_MANA`).
- **Seuils de résistance** : palier de la cible + INT/2 (`SEUIL_PER_INT`) — les effets (poison, brûlure, contrôle...) passent contre ce seuil.
- **Rôle attaque/support supprimé (ACTÉ 10/11/2026, chantier lignes)** : plus de distinction attaque/support nulle part ; le champ `role` disparaît des data (113 cartes, 153 monstres), du moteur (lignes d'init, vagues ennemies) et de l'UI. Toute carte se place librement à l'avant ou à l'arrière ; son comportement suit sa classe et sa position. Les sorts gardent leur rôle d'école (dégâts, soin, bouclier…) défini dans `data/schools.json`.

## 2. Lignées et familles

- **7 familles** : aube, bosquet, bouclier, braise, eau, lame, ombre (`data/families.json`). Une famille = un chemin de cartes (`steps`) qui monte en rareté, une carte par palier.
- Chaque palier franchi apprend le **sort de lignée** du palier (`grimoire.lignee`, 42 sorts).
- Les cartes simples évoluent en crans (`data/evolutions.json`, `data/solo-steps.json`) : n1 → a30, etc. **ACTÉ 11/11/2026 : les cartes solos sont archivées** (retrait du jeu actif) ; greffe ultérieure à des familles en roadmap.
- **Évolution sans perte nette (ACTÉ 11/11/2026)** : la forme suivante au niveau 1 reste au moins aussi forte que la forme précédente au niveau 10 (stats principales) ; l'XP reste continue (pas de gel à paliers), croissance par niveau recalibrée sur l'échelle longue au digest.

## 3. Écoles et sorts

- **8 écoles** (`data/schools.json`) : la Lame (dégâts), le Baume (soin), le Rempart (bouclier), l'Appel (invocation), l'Entrave (contrôle), le Mauvais Œil (malus), la Ferveur (boost), la Ruse (manip).
- Une école s'ouvre par **profil** (classe de la carte) ou par **voie** (choix d'éveil). Verrous actuels : la Lame → Guerrier, Assassin ; le Baume → Prêtre ; le Rempart → Guerrier ; l'Appel → Mage, Occultiste ; l'Entrave → Mage, Occultiste ; le Mauvais Œil → Occultiste ; la Ferveur → Guerrier, Prêtre ; la Ruse → Assassin.
- **Six catégories de sorts** (`data/grimoire.json`) : communs (2), entrées de classe (5), sorts de race (4), sorts d'écolage (6), sorts de lignée (42), sorts uniques (7). Tableaux complets dans `docs/tables/sorts.md`.
- **École de référence des familles (ACTÉ 11/11/2026)** : chaque famille de lignée porte une école (`engine.FAM_SCHOOL`) dont ses sorts de lignée héritent le rôle et la fiche type : eau → la Lame, aube → le Baume, lame → la Lame, ombre → la Lame, bouclier → le Rempart, braise → le Mauvais Œil, bosquet → l'Entrave, crépuscule → le Mauvais Œil, vol → la Ruse, zèle → la Ferveur, appel → l'Appel.
- **Crans** : un sort appris monte par crans (I à IV) ; le cran monte le coût en mana, la largeur (cibles contiguës, jusqu'à `equipe`) et la puissance (multiplicateur ou taux). Certains crans sont `VIDE` : ils attendent un biome ou la zone d'errance.
- **Écolage** : on apprend les sorts d'écolage d'une zone en la parcourant (`data/zones.json`).
- **Fusion de monstres** (`data/fusion-map.json`) : fusionner un monstre enseigne son sort à un cran donné.

## 4. Arbres d'éveil

- Les **éveils** font passer une carte vers une autre par une **voie** (`data/trees.json`, 4 races) ; la voie choisie ouvre des écoles supplémentaires.
- Coût d'éveil dans `engine.EVO_COST` ; max 5 cartes dans l'équipe (`TEAM_MAX`).
- **Mécanismes spéciaux d'évolution** (lot 5, `data/evolutions.json`) : la **régression** (a17 Kenji, Sabre Céleste → a20 Mage de la Fournaise : par un Éclat de régression, nouvelle carte au rang inférieur qui garde 100 % des sorts et 10 % des stats, `REG_STATS_BONUS`), la **fusion** (a27 → a28 : deux exemplaires de Maïa, Lame du Bosquet fusionnent en Maïa, Déesse du Bosquet), la **malédiction des quais** (a34 le Braconnier des Quais → e3 le Pillard des Récifs, par l'événement du même nom), l'**événement d'équilibre** (p1 le Jeune Séraphin → d6 Kairos, Arbitre du Seuil : posséder l'Ange ET le Démon), et les **évolutions secrètes** (n4 le Voleur Novice → a37 le Jongleur de Fête : la voie de la fête, affichée « ?? » tant qu'elle n'est pas découverte).

## 5. Le combat

- Deux modes : 🤖 **Auto** (le moteur enchaîne tout seul) et 🧭 **Tactique** (vrai tour de RPG). En Tactique, le combat démarre et s'enchaîne **tout seul** : seul le tour d'une de vos cartes ouvre la fenêtre d'action, et un bouton ⏸ Pause fige le flux entre les tours.
- **Rail d'ordre du tour (v2.1)** : au-dessus du plateau, tout le monde dans l'ordre d'action (agilité décroissante, équipe d'abord à égalité) ; lueur sur vos cartes, acteur en cours doré, tombés grisés.
- **Moteur pas-à-pas (v0.46, ordre par AGI v0.47)** : file d'actions triée par agilité décroissante (équipe devant à égalité), `beginRound` / `peekRound` / `stepRound(state, choice)` ; le mode Auto compose les mêmes pièces (`resolveTurn`).
- **Esquive (v0.47)** : esquive = esquive de classe + écart d'AGI (attaquant − défenseur) × 0,01, plafonnée à 30 % (`engine.moteur.DODGE_PER_AGI`, `DODGE_CAP`).
- **Frappe simple universelle (v1.12)** : ⚔ Attaque (gratuite, désignation d'ennemi) est la première action de TOUTE carte, la ligne support comprise ; le support frappe à sa stat principale au rendement de sa classe, avec esquive et opposition d'élément. Les sorts hostils (dégâts, contrôle, malus) se résolvent sur les ennemis depuis n'importe quelle ligne, selon la fiche du sort.
- **Résolution des sorts hérités (v1.11)** : un sort hérité remappé par le tri (école + cran) se résout en fiche nommée au moment de l'affichage et du lancer (`resolveSpellEntry`) ; crans vides et sorts inconnus filtrés, sauvegardes inchangées.
- **Fenêtre d'action** : à chaque tour d'une carte, illustration, PV/ATQ/mana, puis des actions **détaillées** (v2.1) : badge de type (Dégâts, Soin, Bouclier… venant du rôle d'école dans `data/schools.json`), coût en mana, ligne méta école · puissance · zone, et le texte du sort ; actions éteintes si mana insuffisant ; puis **ciblage explicite** : liste cliquable + pion surligné sur le plateau + clic direct.
- **Formation** : 5 cartes max, 3 devant + 2 derrière ou 2 + 3, choisie avant le combat, **figée** pendant le combat (ACTÉ 10/11/2026).
- **Règles de rang (ACTÉES, Option A, 10/11/2026)** : l'arrière est **ciblable** et encaisse **-50 %** tant qu'un allié tient à l'avant ; un Guerrier ou un Assassin en arrière frappe à moitié tant que l'avant tient (les autres profils frappent à plein) ; **les soins ne sont jamais affectés par la position** (seuls les dégâts). L'avant tombe : la protection saute pour tous. La protection de l'arrière ne couvre **pas** les attaques de zone. Les monstres suivent les mêmes règles de rang.
- **Sorts croisés retirés (ACTÉ 10/11/2026, second tour)** : le système Souffle/Frappe Croisée (`CROSS` dans `data/engine.json`), défini par rôle, disparaît avec le rôle (lot B du chantier lignes, suppression pure) ; la frappe universelle ⚔ et la résolution des sorts hostils depuis n'importe quelle ligne (v1.12) couvrent l'usage. **PISTE** : des sorts spéciaux déclenchés par des conditions remplies en combat (synergie, position, seuil…) pourront plus tard constituer une nouvelle génération de sorts « croisés ».
- **Régénération (ACTÉE 11/11/2026)** : **aucune régénération naturelle entre les combats** ; des **autels de soin** dans les zones d'errance ; en donjon, une régén **après le premier boss**. Potions, équipement +PV % et soins : cœur de la survie (recalibrage digest).
- **Synergies d'équipe** (`data/synergies.json`) : par classe, paliers à 1 et 2 exemplaires (ex : Guerrier → +10 % puis +25 % ATQ d'équipe).
- **Mots-clés d'élément** (`data/keywords.json`) : brûlure, corrosion, poison, etc. : pourcentage de vie max par tour, contre le seuil de la cible.

## 6. Donjons, zones et progression

- **5 donjons** (`data/dungeons.json`) : Marées, Forge, Bosquet, Crypte, Zénith : 10 étages, boss aux étages 5 et 10, éclats (`shards`) à collectionner.
- **Difficultés et niveaux de donjon (ACTÉ 11/11/2026)** : chaque marche (donjon × mode) porte un **niveau de donjon** (1 → 25) qui fixe la puissance attendue de l'équipe et la bande de rareté : **Facile C→R, Normal UC→SR, Difficile R→UR, Très difficile SR→L, Enfer UR→M** (boss final en haut de bande, boss intermédiaire un cran sous) ; bestiaire thématique croissant par mode (Zénith : fanatiques → anges → archanges → l'Astre) ; un nouveau biome rallonge la chaîne d'un donjon ; drops et points suivent (`data/difficulties.json` à recâbler).
- **Errance v2 (ACTÉE 10/11/2026, bloc visuel après le calibrage)** : un **héros dédié** créé pour l'errance (ni une carte de la collection, ni un nommé existant) ; on entre par **Les Terres Sauvages** et l'on choisit sa zone (**départ : la zone de l'eau uniquement**). Une zone porte monstres, PNJ, objets à collecter, un endroit **donjon** (petit bâtiment) et un **hôtel des crans** (enseignements de sorts, prolongement des enseignements de zones actuelles) ; des quêtes pourront y vivre ; on y gagne XP et or. **Un bâtiment donjon par zone** : le vaincre débloque les zones suivantes (eau → feu + deuxième zone d'eau → …) ; pas d'open world complet, des zones reliées débloquées une à une. Moteur top-down : `docs/design/errance-topdown.md` (zone témoin : Marées, puis généralisation).
- **Difficultés** (`data/difficulties.json`) : Facile/Normal/Difficile... plafonnent les raretés mob/boss et règlent drops et points.
- **Recrutement naturel (ACTÉ 11/11/2026)** : pas de capture ; ~1 % de chance qu'un vaincu demande à rejoindre la collection (hors nommés et boss), taux calibré par zone.
- **Départ de partie (ACTÉ 11/11/2026)** : on commence avec 2 cartes : une choisie parmi 4 propositions (un novice humain, un bestial, un mystique, un divin) et une aléatoire parmi les trois restantes ; l'équipe se remplit ensuite par recrutement, quêtes et Guilde.
- **Modificateurs de run** (`data/run-mods.json`) : la Horde, le Mana Stérile, la Muraille... : chaque exploration a son tarif.
- **Fusion** : les monstres capturés fusionnent en lignées (`data/monster-families.json`) et enseignent des sorts.

## 7. Économie v2 (ACTÉE 10/11/2026, bloc visuel après le calibrage)

- **L'or entre en jeu** : gagné en errance et en donjon ; les combats d'errance lâchent or, objets, éclats et pierres d'éveil ; l'énergie actuelle (⚡ les points de donjon, `store.points`, 40 par étage modulé par les mods de run) est **convertis en or** au chantier économie.
- **Boutique** : on y achète des objets contre de l'or (consommables, éclats, équipement).
- **Marchand de créatures** : vend des créatures contre de l'or ; il **remplace les jetons de génération** (les jetons de la Forge et leur table `JETON_RARITY` disparaissent).
- **Guilde (ex-Forge)** : évolutions + recrutement de compagnons contre de l'or.
- **Quêtes quotidiennes** : le défi du jour est **supprimé**, remplacé par des quêtes qui changent chaque jour (ex. vaincre 10 monstres, finir 2 donjons) ; un onglet quêtes vit dans le menu guide ; **3 par jour en rotation**, récompenses 80 à 150 or, parfois une carte N, un éclat ou une pierre d'éveil, **bonus de complétion totale : 1 pierre d'éveil** (calibrage v0 acté le 10/11/2026, à affiner au digest).
- **Équipement (ACTÉ, le mix)** : des objets façon vrai RPG mais simplifiés ; chaque personnage porte **1 à 2 slots** : **arme typée par classe** (épée pour le Guerrier, bâton pour le Mage, sceptre pour le Prêtre, dagues pour l'Assassin, focus pour l'Occultiste) + **armure générique**, effets en pourcentage (+ATQ, +PV, +AGI, +INT) ; plus des **slots d'équipe** génériques (bannière, talisman de camp) qui s'appliquent à tous ; l'inventaire de la page Personnage et le rayon équipement de la Boutique en dépendent. Prix : de 200 (C) à 1 600 or (SR) (calibrage v0 acté le 10/11/2026).

## 8. Design cible des maquettes — IMPLÉMENTÉ le 10/11/2026 (UI du combat v2)

Les maquettes Vibe (errance, combat, fiches, DA) sont le **design cible** ; la page combat et la page fiches sont **implémentées** dans `dist.html` depuis le 10/11/2026 (voir `docs/arbitrages.md`) :

- **Ciblage v2** : le choix d'une action illumine les cibles éligibles sur le plateau, clic pour résoudre, zone de 2 contiguës suit le clic, bouton d'annulation, coût et zone visibles pendant toute la désignation.
- **Pied de stats** : PV, ATQ et mana en actuel/total sur chaque carte + icônes d'état (bonus, malus, bouclier), carte grisée quand elle tombe.
- **Combat v2.1 (retours terrain, 10/11/2026)** : rail d'ordre du tour au-dessus du plateau, combat auto en Tactique avec pause (plus de « Lancer le tour » obligatoire), actions détaillées au tour du joueur (badge de type, coût, école · puissance · zone, texte), fiche complète (statline corrigée, grille identité classe/élément/rareté/rôle, oppositions, Neutre affiché pour les naissances, sorts détaillés).
- **PISTE v1.1, la Garde du Gardien** : tant que le Gardien tient à l'avant, la ligne arrière ne peut pas être visée.
- **PISTE v2, grimoire élémentaire** : l'élément porterait le sort, la carte garderait une affinité ; voir `docs/arbitrages.md`.
- Le détail visuel des maquettes ne se duplique pas ici : les arbitrages OUI (dans `docs/arbitrages.md`), le visuel reste dans les maquettes.
