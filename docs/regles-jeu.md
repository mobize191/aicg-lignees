# Règles du jeu : la référence

> Source de vérité : `data/*.json` (toutes les valeurs chiffrées) et ce document (les règles). Les tableaux détaillés vivent dans `docs/tables/` (générés). Tout ce qui est `PISTE` dans `docs/arbitrages.md` n'est PAS joué, c'est du design cible en maquette.

## 1. L'identité d'une carte

- **Classes actives (5)** : Guerrier, Mage, Prêtre, Assassin, Occultiste. La classe Invocateur a été retirée le 10/11/2026 : les invocations passent par l'école de l'Appel.
- **Éléments (5)** : Feu, Eau, Terre, Ombre, Lumière. Roue des forces (`engine.BEATS`) : Feu bat Terre, Terre bat Eau, Eau bat Feu, Lumière bat Ombre, Ombre bat Lumière.
- **Races (4)** : humaine, monstre, mystique, divine (rangs d'éveil croissants dans `trees.json`).
- **Raretés** : C < UC < R < SR < UR < L, multiplicateur de puissance dans `engine.RARITY_POWER` (1 → 1.52).
- **Mana** : par palier de famille (`engine.FAMILY_MANA` : max 8/11/14/22/30/40, régén 2/3/3/5/6/8) ; monstres 10 max, régén 2 (`MONSTER_MANA`).

## 2. Lignées et familles

- **7 familles** : aube, bosquet, bouclier, braise, eau, lame, ombre (`data/families.json`). Une famille = un chemin de cartes (`steps`) qui monte en rareté, une carte par palier.
- Chaque palier franchi apprend le **sort de lignée** du palier (`grimoire.lignee`, 42 sorts).
- Les cartes simples évoluent en crans (`data/evolutions.json`, `data/solo-steps.json`) : n1 → a30, etc.

## 3. Écoles et sorts

- **8 écoles** (`data/schools.json`) : la Lame (dégâts), le Baume (soin), le Rempart (bouclier), l'Appel (invocation), l'Entrave (contrôle), le Mauvais Œil (malus), la Ferveur (boost), la Ruse (manip).
- Une école s'ouvre par **profil** (classe de la carte) ou par **voie** (choix d'éveil). Verrous actuels : la Lame → Guerrier, Assassin ; le Baume → Prêtre ; le Rempart → Guerrier ; l'Appel → Mage, Occultiste ; l'Entrave → Mage, Occultiste ; le Mauvais Œil → Occultiste ; la Ferveur → Guerrier, Prêtre ; la Ruse → Assassin.
- **Six catégories de sorts** (`data/grimoire.json`) : communs (2), entrées de classe (5), sorts de race (4), sorts d'écolage (6), sorts de lignée (42), sorts uniques (7). Tableaux complets dans `docs/tables/sorts.md`.
- **Crans** : un sort appris monte par crans (I à IV) ; le cran monte le coût en mana, la largeur (cibles contiguës, jusqu'à `equipe`) et la puissance (multiplicateur ou taux). Certains crans sont `VIDE` : ils attendent un biome ou la zone d'errance.
- **Écolage** : on apprend les sorts d'écolage d'une zone en la parcourant (`data/zones.json`).
- **Fusion de monstres** (`data/fusion-map.json`) : fusionner un monstre enseigne son sort à un cran donné.

## 4. Arbres d'éveil

- Les **éveils** font passer une carte vers une autre par une **voie** (`data/trees.json`, 4 races) ; la voie choisie ouvre des écoles supplémentaires.
- Coût d'éveil dans `engine.EVO_COST` ; max 5 cartes dans l'équipe (`TEAM_MAX`).

## 5. Le combat

- Deux modes : 🤖 **Auto** (le moteur enchaîne tout seul) et 🧭 **Tactique** (vrai tour de RPG).
- **Moteur pas-à-pas v0.46** : file d'actions triée par ATQ décroissante (équipe devant à égalité), `beginRound` / `peekRound` / `stepRound(state, choice)` ; le mode Auto compose les mêmes pièces (`resolveTurn`).
- **Fenêtre d'action** : à chaque tour d'une carte, illustration, PV/ATQ/mana, attaque, sorts nommés (coût + infobulle, éteints si mana insuffisant), attendre (le mana remonte), puis **ciblage explicite** : liste cliquable + pion surligné sur le plateau + clic direct.
- **Formation** : 5 cartes max, 3 devant + 2 derrière ou 2 + 3, choisie avant le combat, **figée** pendant le combat (ACTÉ 10/11/2026).
- **Règles de rang** (ACTÉES) : une carte de l'arrière encaisse 50 % des dégâts tant qu'un allié tient à l'avant ; un Guerrier ou un Assassin en arrière frappe à moitié tant que l'avant tient (les autres profils frappent à plein). L'avant tombe : la protection saute pour tous. La protection de l'arrière ne couvre **pas** les attaques de zone.
- **Synergies d'équipe** (`data/synergies.json`) : par classe, paliers à 1 et 2 exemplaires (ex : Guerrier → +10 % puis +25 % ATQ d'équipe).
- **Mots-clés d'élément** (`data/keywords.json`) : brûlure, corrosion, poison, etc. : pourcentage de vie max par tour, contre le seuil de la cible.

## 6. Donjons, zones et progression

- **5 donjons** (`data/dungeons.json`) : Marées, Forge, Bosquet, Crypte, Zénith : 10 étages, boss aux étages 5 et 10, éclats (`shards`) à collectionner.
- **Zones d'errance** (`data/zones.json`) : rencontres hors donjon, cadence zone.
- **Difficultés** (`data/difficulties.json`) : Facile/Normal/Difficile... plafonnent les raretés mob/boss et règlent drops et points.
- **Modificateurs de run** (`data/run-mods.json`) : la Horde, le Mana Stérile, la Muraille... : chaque exploration a son tarif.
- **Fusion** : les monstres capturés fusionnent en lignées (`data/monster-families.json`) et enseignent des sorts.

## 7. Design cible (maquettes, NON codé)

Les maquettes Vibe (errance, combat, fiches, DA) sont le **design cible** de la prochaine itération ; rien de cette section n'est dans `dist.html` :

- **Ciblage v2** : le choix d'une action illumine les cibles éligibles sur le plateau, clic pour résoudre, zone de 2 contiguës suit le clic, bouton d'annulation, coût et zone visibles pendant toute la désignation.
- **Pied de stats** : PV, ATQ et mana en actuel/total sur chaque carte + icônes d'état (bonus, malus, bouclier), carte grisée quand elle tombe.
- **PISTE v1.1, la Garde du Gardien** : tant que le Gardien tient à l'avant, la ligne arrière ne peut pas être visée.
- **PISTE v2, grimoire élémentaire** : l'élément porterait le sort, la carte garderait une affinité ; voir `docs/arbitrages.md`.
- Le détail visuel des maquettes ne se duplique pas ici : les arbitrages OUI (dans `docs/arbitrages.md`), le visuel reste dans les maquettes.
