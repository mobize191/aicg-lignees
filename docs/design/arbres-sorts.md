# Les arbres de sorts : qui acquiert quoi, quand

> AICG : Lignées. La chronologie d'acquisition des sorts le long des arbres d'évolution : ce que chaque carte connaît au catalogue, ce que l'exemplaire garde à chaque évolution, et les exceptions (convergences, monstres, divines). Sources : `dist.html` et CSV v0.43.1. Les arbres eux-mêmes : `arbres-evolution.md`.

## Le modèle

Deux niveaux à ne pas confondre :

1. **Le catalogue** : la fiche d'une carte liste ses sorts propres. Pour les familiales, elle est déjà cumulative (la L connaît les 6 sorts de lignée gagnés palier après palier).
2. **L'exemplaire** : à chaque évolution, il **garde les sorts de sa forme passée** (le cumul `acc`). Un exemplaire d'Épéiste Novice devenu Kenji, Sabre Céleste connaît à la fois ses sorts de novice, les sorts de lignée du Sabre et ses formes intermédiaires.

Règle d'or du design (régression, conversion, convergences) : **100 % des sorts sont conservés** à travers les transformations.

Et depuis la v0.47, **le sort L d'une lignée ne répète plus le nom de sa carte** : le sort L du Sabre est Tranche-Monde (la carte reste « Kenji, Sabre Céleste »), celui de l’Ombre est Nuit Éternelle (la carte reste « Kira, Nuit Sans Fin ») ; l’Aube garde son exception assumée : Aube Éternelle, le nom de sa carte (Léna). Les sorts UR gardent leur marque « porteur : » (Kenji : Zénith Tranchant, Kira : Voile Déchiré, Solen : Couronne de Feu, Maïa : Danse des Feuilles, Argus : Rempart Éveillé) : la règle v0.47 ne s’applique qu’aux sorts L.

## Les 7 familles : un sort de lignée par palier

### Famille du Sabre

| Palier | Carte | Sort appris | Coût | Puissance | Sorts du maillon (catalogue) | Mana |
| --- | --- | --- | --- | --- | --- | --- |
| C | Épéiste en Herbe | Taillade du Mat | 2✦ | ×1.4 | commun + 1 de lignée (2 sorts) | 8 +2 |
| UC | Spadassin Vigilant | Lame Vive | 3✦ | ×1.6 | commun + 2 de lignée (3 sorts) | 11 +3 |
| R | Épéiste Errant | Lame Éclair | 5✦ | ×1.9 | commun + 3 de lignée (4 sorts) | 14 +3 |
| SR | Bretteur du Zénith | Millième Taillade (gros sort) | 9✦ | ×2.6 | commun + 4 de lignée (5 sorts) | 22 +5 |
| UR | Kenji, Lame Éternelle | Kenji : Zénith Tranchant (gros sort) | 14✦ | ×3.4 | commun + 5 de lignée (6 sorts) | 30 +6 |
| L | Kenji, Sabre Céleste | Tranche-Monde (gros sort) | 20✦ | ×4.5 | commun + 6 de lignée (7 sorts) | 40 +8 |

### Famille de l’Ombre

| Palier | Carte | Sort appris | Coût | Puissance | Sorts du maillon (catalogue) | Mana |
| --- | --- | --- | --- | --- | --- | --- |
| C | Rôdeur des Ombres | Poigne du Silence | 2✦ | ×1.4 | commun + 1 de lignée (2 sorts) | 8 +2 |
| UC | Guetteur Crépusculaire | Pas de l’Ombre | 3✦ | ×1.6 | commun + 2 de lignée (3 sorts) | 11 +3 |
| R | Faucheur des Ombres | Faux du Croissant | 5✦ | ×1.9 | commun + 3 de lignée (4 sorts) | 14 +3 |
| SR | Fantôme du Sanctuaire | Danse des Cent Lames (gros sort) | 9✦ | ×2.6 | commun + 4 de lignée (5 sorts) | 22 +5 |
| UR | Kira, Reine des Ombres | Kira : Voile Déchiré (gros sort) | 14✦ | ×3.4 | commun + 5 de lignée (6 sorts) | 30 +6 |
| L | Kira, Nuit Sans Fin | Nuit Éternelle (gros sort) | 20✦ | ×4.5 | commun + 6 de lignée (7 sorts) | 40 +8 |

### Famille de l’Eau

| Palier | Carte | Sort appris | Coût | Puissance | Sorts du maillon (catalogue) | Mana |
| --- | --- | --- | --- | --- | --- | --- |
| C | Apprentie des Rivières | Goutte Percutante | 2✦ | ×1.4 | commun + 1 de lignée (2 sorts) | 8 +2 |
| UC | Adepte des Rivières | Brume Mordante | 3✦ | ×1.6 | commun + 2 de lignée (3 sorts) | 11 +3 |
| R | Sorcière des Rivières | Courant Battant | 5✦ | ×1.9 | commun + 3 de lignée (4 sorts) | 14 +3 |
| SR | Sorcière des Océans | Marée Ascendante (gros sort) | 9✦ | ×2.6 | commun + 4 de lignée (5 sorts) | 22 +5 |
| UR | Alix, Archimage des Marées | Raz-de-Marée (gros sort) | 14✦ | ×3.4 | commun + 5 de lignée (6 sorts) | 30 +6 |
| L | Alix, Déesse de l’Eau | Colère de l’Océan (gros sort) | 20✦ | ×4.5 | commun + 6 de lignée (7 sorts) | 40 +8 |

### Famille de l’Aube

| Palier | Carte | Sort appris | Coût | Puissance | Sorts du maillon (catalogue) | Mana |
| --- | --- | --- | --- | --- | --- | --- |
| C | Novice de l’Aube | Étreinte Matinale | 2✦ | ×1.5 | commun + 1 de lignée (2 sorts) | 8 +2 |
| UC | Servante de l’Aube | Rayon Matinal | 3✦ | ×1.7 | commun + 2 de lignée (3 sorts) | 11 +3 |
| R | Prêtresse de l’Aube | Lumière Réconfortante | 5✦ | ×2.2 | commun + 3 de lignée (4 sorts) | 14 +3 |
| SR | Grande Prêtresse de l’Aube | Bénédiction de l’Aurore (gros sort) | 9✦ | ×3.2 | commun + 4 de lignée (5 sorts) | 22 +5 |
| UR | Léna, Avatar de l’Aurore | Aurore Radieuse (gros sort) | 14✦ | ×4.4 | commun + 5 de lignée (6 sorts) | 30 +6 |
| L | Léna, Aube Éternelle | Aube Éternelle (gros sort) | 20✦ | ×6 | commun + 6 de lignée (7 sorts) | 40 +8 |

### Famille du Bouclier

| Palier | Carte | Sort appris | Coût | Puissance | Sorts du maillon (catalogue) | Mana |
| --- | --- | --- | --- | --- | --- | --- |
| C | Gardien-Mécanique | Carapace Réactive | 2✦ | ×1.5 | commun + 1 de lignée (2 sorts) | 8 +2 |
| UC | Garde du Rempart | Égide Renforcée | 3✦ | ×1.7 | commun + 2 de lignée (3 sorts) | 11 +3 |
| R | Sentinelle d’Acier | Mur Inflexible | 5✦ | ×2.2 | commun + 3 de lignée (4 sorts) | 14 +3 |
| SR | Bastion Arcanique | Barrière Runique (gros sort) | 9✦ | ×3.2 | commun + 4 de lignée (5 sorts) | 22 +5 |
| UR | Argus, Rempart Éveillé | Argus : Rempart Éveillé (gros sort) | 14✦ | ×4.4 | commun + 5 de lignée (6 sorts) | 30 +6 |
| L | Argus, Forteresse Vivante | Argus : Forteresse Vivante (gros sort) | 20✦ | ×6 | commun + 6 de lignée (7 sorts) | 40 +8 |

### Famille de la Braise

| Palier | Carte | Sort appris | Coût | Puissance | Sorts du maillon (catalogue) | Mana |
| --- | --- | --- | --- | --- | --- | --- |
| C | Allumeur de Braises | Étincelle Filante | 2✦ | ×1.4 | commun + 1 de lignée (2 sorts) | 8 +2 |
| UC | Veilleur de Braise | Flèche de Feu | 3✦ | ×1.6 | commun + 2 de lignée (3 sorts) | 11 +3 |
| R | Mage de la Fournaise | Jet de Braise | 5✦ | ×1.9 | commun + 3 de lignée (4 sorts) | 14 +3 |
| SR | Invocateur de Fournaise | Fournaise (gros sort) | 9✦ | ×2.6 | commun + 4 de lignée (5 sorts) | 22 +5 |
| UR | Solen, Archimage de la Braise | Solen : Couronne de Feu (gros sort) | 14✦ | ×3.4 | commun + 5 de lignée (6 sorts) | 30 +6 |
| L | Solen, Roi des Braises | Solen : Braise Éternelle (gros sort) | 20✦ | ×4.5 | commun + 6 de lignée (7 sorts) | 40 +8 |

### Famille du Bosquet

| Palier | Carte | Sort appris | Coût | Puissance | Sorts du maillon (catalogue) | Mana |
| --- | --- | --- | --- | --- | --- | --- |
| C | Traqueur du Bosquet | Trait d’Épine | 2✦ | ×1.4 | commun + 1 de lignée (2 sorts) | 8 +2 |
| UC | Pisteur du Bosquet | Lance d’Aubier | 3✦ | ×1.6 | commun + 2 de lignée (3 sorts) | 11 +3 |
| R | Chasseur du Bosquet | Épine Vengeresse | 5✦ | ×1.9 | commun + 3 de lignée (4 sorts) | 14 +3 |
| SR | Prédateur Sylvestre | Rafale d’Épines (gros sort) | 9✦ | ×2.6 | commun + 4 de lignée (5 sorts) | 22 +5 |
| UR | Maïa, Lame du Bosquet | Maïa : Danse des Feuilles (gros sort) | 14✦ | ×3.4 | commun + 5 de lignée (6 sorts) | 30 +6 |
| L | Maïa, Déesse du Bosquet | Maïa : Cœur du Bosquet (gros sort) | 20✦ | ×4.5 | commun + 6 de lignée (7 sorts) | 40 +8 |

## Chronologie d'un exemplaire complet : l'Épéiste jusqu'à Kenji

Un exemplaire de n1 Épéiste Novice qui prend la voie du guerrier et monte tout le tronc :

| Étape | Forme | Sorts de la forme | Entrées cumulées | Liste de combat de l'exemplaire |
| --- | --- | --- | --- | --- |
| 1. Épéiste Novice (C) | Épéiste Novice | Frappe Précise, Discipline de Ligne, Brise-Garde, Prise de Garde | +4 (total 4) | 4 entrées, 4 sorts réels |
| 2. Spadassin Vigilant (UC) | Spadassin Vigilant | Frappe Précise, Taillade du Mat, Lame Vive | +3 (total 7) | 7 entrées, 6 sorts réels |
| 3. Épéiste Errant (R) | Épéiste Errant | Frappe Précise, Taillade du Mat, Lame Vive, Lame Éclair | +4 (total 11) | 11 entrées, 7 sorts réels |
| 4. Bretteur du Zénith (SR) | Bretteur du Zénith | Frappe Précise, Taillade du Mat, Lame Vive, Lame Éclair, Millième Taillade | +5 (total 16) | 16 entrées, 8 sorts réels |
| 5. Kenji, Lame Éternelle (UR) | Kenji, Lame Éternelle | Frappe Précise, Taillade du Mat, Lame Vive, Lame Éclair, Millième Taillade, Kenji : Zénith Tranchant | +6 (total 22) | 22 entrées, 9 sorts réels |
| 6. Kenji, Sabre Céleste (L) | Kenji, Sabre Céleste | Frappe Précise, Taillade du Mat, Lame Vive, Lame Éclair, Millième Taillade, Kenji : Zénith Tranchant, Tranche-Monde | +7 (total 29) | 29 entrées, 10 sorts réels |

À l'arrivée : l'exemplaire affiche **29 entrées de sorts** en combat, dont **10 sorts réels** (Frappe Précise, les 3 sorts personnels du novice et les 6 sorts de lignée du Sabre) : les 19 entrées dupliquées viennent du commun et des sorts de lignée déjà appris, comptés une fois par forme traversée (voir `audit-sorts.md`, constat n° 1).

## Ce que la naissance apporte à sa famille

Quand une naissance évolue, ses **4 sorts personnels** (commun, race, classe, signature) partent dans le cumul : la forme familiale garde pour toujours la Discipline de Ligne, le Brise-Garde et la signature du novice, à côté des sorts de lignée. Un Kenji issu de l'Épéiste se bat donc avec ses réflexes de novice en plus de son sabre. Les greffes solos font de même avec leurs 3 sorts.

## Les monstres : une signature par maillon, cumulées

Au catalogue, un monstre ne montre que le commun et sa signature : l'accumulation vit dans l'exemplaire. Un Pillard des Récifs devenu Sergent des Brumes garde Jet d'Écume et ajoute Brise-Garde. Exemple d'une ligne complète (Gobelins des Écumes, ligne du pillage) :

| Forme | Signature | Cumul de l'exemplaire |
| --- | --- | --- |
| e1 Gobelin des Marées (C) | Jet d’Écume | Jet d’Écume |
| e3 Pillard des Récifs (UC) | Morsure des Récifs | Jet d’Écume, Morsure des Récifs |
| e4 Sergent des Brumes (R) | Brise-Garde | Jet d’Écume, Morsure des Récifs, Brise-Garde |
| e5 Prophète des Marées (SR) | Vision Noyée | Jet d’Écume, Morsure des Récifs, Brise-Garde, Vision Noyée |

Les 6 lignes longues des donjons de 4 maillons (Gobelins des Écumes, Sirènes, Légion Solaire, Clergé, Bêtes du Fougeron, Spectres) offrent ainsi jusqu'à 4 signatures cumulées à leur sommet. Les cousins (side) n'évoluent pas : une seule signature pour toujours, sauf l'Écorcheur de Suie (f3) qui devient Foreuse d'Âmes (f8).

## Les divines : Pouvoirs d'abord, sorts ensuite

Les 18 divines ne portent que le commun et une signature au catalogue : leur force vit dans leurs **Pouvoirs** (étourdissement, lenteur, malédiction, copie, renvoi, lien). Le cumul d'exemplaire s'applique pareil : un Démon devenu Écho garde Ferveur Céleste, Onde Consacrée et sa signature d'origine, et empile les signatures des maillons franchis. L'entrée des naissances divines dans les webs se fait au palier UC (n14 Démon → d8 Choriste, n15 Éveillé du Seuil → d14 Aiguille) : les communes des familles (d1, d2...) restent des acquisitions d'autel ou de défi. L'Ange (n13) est l'exception : il s'éveille en Ange Éveillé (p1, effet remplace — l'Ange Gardien disparaît), hors web, ses portes (coloration, voie céleste, mauvaise volonté) attendent leurs maillons.

## Les exceptions du graphe

| Cas | Ce qui se passe |
| --- | --- |
| Convergence élue de la lumière (a29 → s5, a32 → s5) | l'exemplaire quitte l'Eau ou la Braise pour l'Aube : il garde ses sorts de lignée d'origine dans son cumul (règle des 100 %), mais la fiche de s5 ne montre que les sorts de l'Aube |
| Voleur, voies des quais et de la fête (n4 → a34, n4 → a37) | évolution C vers C : le solo est une porte au même palier ; l'exemplaire garde ses 4 sorts de novice et prend les 3 sorts du solo |
| Greffes solos (a3, a4, a9, s2, s3) | le solo rentre dans la famille au palier de son maillon d'attache (UC ou SR) avec ses 3 sorts en cumul |
| Graines archivées (b1 à b7) | hors chaîne : elles n'évoluent pas (dormantes), leurs sorts sont gelés au rang SR (4 sorts de lignée) |
| Mythes (M) | hors chaîne d'évolution : aucune L ne devient M dans le graphe actuel, la M s'acquiert à part (drop d'Enfer prévu par le design) |
