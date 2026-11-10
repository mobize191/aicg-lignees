# Inventaire du catalogue (extraction v0.43 à v0.45) — ARCHIVE

> **Archive** : fusion de `inventaire-cartes.md` (238 cartes) et `inventaire-sorts.md` (653 entrées de sorts), extraits du `dist.html` des v0.43 à v0.45 et du CSV du catalogue v0.43.1. Ces inventaires décrivent un état **dépassé** : le catalogue actuel vit dans `data/cards.json` (113 cartes) et se lit dans `docs/tables/` ; le design v3 de référence est `docs/design/familles-races-v3.md`. Contenu conservé tel quel.

## Partie 1 — Inventaire complet des cartes

> AICG : Lignées. Catalogue des **238 cartes** extrait du code source du jeu (`dist.html`, contenu des v0.43 à v0.45) et du CSV du catalogue v0.43.1. Ce document décrit l'état embarqué dans le jeu, à distinguer du design cible du rework des arbres (document « Rework des arbres » v13).

## Vue d'ensemble

| Type | Nombre | Grammaire de sorts | Acquisition |
| --- | --- | --- | --- |
| Naissance | 15 | commun + race + classe + signature (4 sorts) | défi du jour et événements, jamais en drop |
| Familiale | 42 | commun + sorts de lignée cumulés (2 au palier C, +1 par palier, 7 à la L) | évolution des naissances et des greffes |
| Solo | 21 | commun + classe + signature (3 sorts) | mini-lignées des donjons et jetons |
| Archivée | 7 | commun + 4 sorts de lignée (rang de graine SR) | anciennes branches, hors tirage (dormantes) |
| Monstre | 135 | commun + signature (2 sorts) | donjons (vagues, captures), autel, jetons |
| Divine | 18 | commun + signature (2 sorts) + Pouvoir de famille | défi du jour uniquement |

Paliers : **C → UC → R → SR → UR → L → M**. Toute carte a ATQ, PV, une réserve de mana (max + régénération par action), un sort commun et au moins un sort propre. Les sorts se **cumulent à chaque évolution** au niveau de l'exemplaire : il garde les sorts de ses formes passées.

## Les 15 naissances

Les portes des quatre races. Chaque naissance connaît 4 sorts dès son obtention : son commun, son sort de race, son sort de classe et sa signature (5✦ ×1.85). À l'évolution (niveau 10 + éclats), elle choisit sa voie, un choix définitif pour l'exemplaire.

| ID | Nom | Classe | Élément | Rôle | ATQ | PV | Signature | Voies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| n1 | Épéiste Novice | Guerrier | Neutre | attaque | 8 | 55 | Prise de Garde (5✦ ×1.85) | a30 Spadassin Vigilant · s14 Garde du Rempart · a33 Pisteur du Bosquet |
| n2 | Mage Novice | Mage | Neutre | attaque | 7 | 48 | Étincelle d’Étude (5✦ ×1.85) | a29 Adepte des Rivières · a32 Veilleur de Braise · a33 Pisteur du Bosquet · s13 Servante de l’Aube · a31 Guetteur Crépusculaire |
| n3 | Prêtre Novice | Prêtre | Neutre | support | 4 | 52 | Bénédiction Modeste (5✦ ×1.85) | s13 Servante de l’Aube · s14 Garde du Rempart |
| n4 | Voleur Novice | Assassin | Neutre | attaque | 9 | 47 | Larcin Rapide (5✦ ×1.85) | a31 Guetteur Crépusculaire · a34 Braconnier des Quais · a37 Jongleur de Fête |
| n5 | Bestiau des Eaux | Guerrier | Neutre | attaque | 9 | 60 | Bruissement d’Écume (5✦ ×1.85) | e3 Pillard des Récifs · e11 Crabe des Berges |
| n6 | Bestiau des Flammes | Mage | Neutre | attaque | 10 | 52 | Souffle de Braise (5✦ ×1.85) | f3 Écorcheur de Suie · f15 Semeur de Fournaise · f24 Gobelin de Suie |
| n7 | Bestiau du Vivant | Prêtre | Neutre | support | 7 | 62 | Sève Voleuse (5✦ ×1.85) | g3 Sanglier de Mousse · g12 Bergère des Sèves |
| n8 | Bestiau des Ténèbres | Assassin | Neutre | attaque | 10 | 50 | Griffes Noires (5✦ ×1.85) | k3 Fossoyeur Nocturne · k12 Veilleuse de Bord · k24 Porte-Étendard Défunt |
| n9 | Bestiau des Cieux | Mage | Neutre | attaque | 9 | 54 | Rafale Céleste (5✦ ×1.85) | z3 Arbalétrier Doré · z16 Essor de Flammes · z23 Chapelain du Jour |
| n10 | Enge des Brumes | Mage | Neutre | attaque | 9 | 56 | Voile de Brume (5✦ ×1.85) | e24 Chanteuse des Récifs |
| n11 | Enge des Bois | Prêtre | Neutre | support | 6 | 60 | Souffle des Sèves (5✦ ×1.85) | g12 Bergère des Sèves |
| n12 | Enge des Caveaux | Occultiste | Neutre | attaque | 9 | 53 | Froid du Caveau (5✦ ×1.85) | k3 Fossoyeur Nocturne · k12 Veilleuse de Bord · k24 Porte-Étendard Défunt |
| n13 | Ange | Prêtre | Lumière | support | 6 | 58 | Éclat d’Aube (5✦ ×1.85) | p1 Ange Éveillé |
| n14 | Démon | Assassin | Ombre | attaque | 10 | 52 | Trait de Vice (5✦ ×1.85) | d8 Choriste Miroir |
| n15 | Éveillé du Seuil | Occultiste | Neutre | attaque | 8 | 55 | Regard du Seuil (5✦ ×1.85) | d14 Aiguille du Pont |

## Les 7 familles compagnons (42 cartes)

Chaque famille est un tronc de 6 maillons (C → UC → R → SR → UR → L). Un maillon connaît le commun plus **un sort de lignée par palier franchi** : le catalogue est déjà cumulatif, la L connaît les 6 sorts de lignée. Le mana suit le palier (8 → 40).

### Famille du Sabre

| Palier | ID | Nom | Classe | Élément | ATQ | PV | Mana | Sort de lignée appris | Total sorts du maillon |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | a1 | Épéiste en Herbe | Guerrier | Feu | 8 | 60 | 8 +2 | Taillade du Mat (2✦ ×1.4) | 2 |
| UC | a30 | Spadassin Vigilant | Guerrier | Feu | 10 | 67 | 11 +3 | Lame Vive (3✦ ×1.6) | 3 |
| R | a6 | Épéiste Errant | Guerrier | Feu | 12 | 75 | 14 +3 | Lame Éclair (5✦ ×1.9) | 4 |
| SR | a10 | Bretteur du Zénith | Guerrier | Feu | 18 | 90 | 22 +5 | Millième Taillade (9✦ ×2.6, gros sort) | 5 |
| UR | a15 | Kenji, Lame Éternelle | Guerrier | Feu | 30 | 95 | 30 +6 | Kenji : Zénith Tranchant (14✦ ×3.4, gros sort) | 6 |
| L | a17 | Kenji, Sabre Céleste | Guerrier | Feu | 40 | 105 | 40 +8 | Kenji : Sabre Céleste (20✦ ×4.5, gros sort) | 7 |
Portes : n1 Épéiste Novice [voie du guerrier].
Graine : b1 Yuki, Brise-Lame (porte les 4 premiers sorts de lignée).

### Famille de l’Ombre

| Palier | ID | Nom | Classe | Élément | ATQ | PV | Mana | Sort de lignée appris | Total sorts du maillon |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | a2 | Rôdeur des Ombres | Assassin | Ombre | 10 | 45 | 8 +2 | Poigne du Silence (2✦ ×1.4) | 2 |
| UC | a31 | Guetteur Crépusculaire | Assassin | Ombre | 12 | 50 | 11 +3 | Pas de l’Ombre (3✦ ×1.6) | 3 |
| R | a7 | Faucheur des Ombres | Assassin | Ombre | 15 | 55 | 14 +3 | Faux du Croissant (5✦ ×1.9) | 4 |
| SR | a12 | Fantôme du Sanctuaire | Assassin | Ombre | 22 | 60 | 22 +5 | Danse des Cent Lames (9✦ ×2.6, gros sort) | 5 |
| UR | a16 | Kira, Reine des Ombres | Assassin | Ombre | 32 | 72 | 30 +6 | Kira : Voile Déchiré (14✦ ×3.4, gros sort) | 6 |
| L | a18 | Kira, Nuit Sans Fin | Assassin | Ombre | 42 | 88 | 40 +8 | Kira : Nuit Sans Fin (20✦ ×4.5, gros sort) | 7 |
Portes : n2 Mage Novice [l’ombre — l’élue du Crépuscule] · n4 Voleur Novice [voie de l’assassinat].
Graine : b2 Onyx, Fil de Nuit (porte les 4 premiers sorts de lignée).

### Famille de l’Eau

| Palier | ID | Nom | Classe | Élément | ATQ | PV | Mana | Sort de lignée appris | Total sorts du maillon |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | a5 | Apprentie des Rivières | Mage | Eau | 9 | 42 | 8 +2 | Goutte Percutante (2✦ ×1.4) | 2 |
| UC | a29 | Adepte des Rivières | Mage | Eau | 11 | 46 | 11 +3 | Brume Mordante (3✦ ×1.6) | 3 |
| R | a8 | Sorcière des Rivières | Mage | Eau | 14 | 50 | 14 +3 | Courant Battant (5✦ ×1.9) | 4 |
| SR | a11 | Sorcière des Océans | Mage | Eau | 20 | 65 | 22 +5 | Marée Ascendante (9✦ ×2.6, gros sort) | 5 |
| UR | a13 | Alix, Archimage des Marées | Mage | Eau | 28 | 80 | 30 +6 | Raz-de-Marée (14✦ ×3.4, gros sort) | 6 |
| L | a14 | Alix, Déesse de l’Eau | Mage | Eau | 38 | 100 | 40 +8 | Colère de l’Océan (20✦ ×4.5, gros sort) | 7 |
Portes : n2 Mage Novice [les flots — l’Eau].
Graine : b3 Naïa, Sourcéleine (porte les 4 premiers sorts de lignée).

### Famille de l’Aube

| Palier | ID | Nom | Classe | Élément | ATQ | PV | Mana | Sort de lignée appris | Total sorts du maillon |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | s1 | Novice de l’Aube | Prêtre | Lumière | 3 | 50 | 8 +2 | Étreinte Matinale (2✦ ×1.5) | 2 |
| UC | s13 | Servante de l’Aube | Prêtre | Lumière | 3 | 55 | 11 +3 | Rayon Matinal (3✦ ×1.7) | 3 |
| R | s5 | Prêtresse de l’Aube | Prêtre | Lumière | 3 | 60 | 14 +3 | Lumière Réconfortante (5✦ ×2.2) | 4 |
| SR | s8 | Grande Prêtresse de l’Aube | Prêtre | Lumière | 4 | 70 | 22 +5 | Bénédiction de l’Aurore (9✦ ×3.2, gros sort) | 5 |
| UR | s9 | Léna, Avatar de l’Aurore | Prêtre | Lumière | 5 | 85 | 30 +6 | Aurore Radieuse (14✦ ×4.4, gros sort) | 6 |
| L | s10 | Léna, Aube Éternelle | Prêtre | Lumière | 6 | 105 | 40 +8 | Aube Éternelle (20✦ ×6, gros sort) | 7 |
Portes : n2 Mage Novice [la lumière — l’élue de l’Aube] · n3 Prêtre Novice [la lumière — la foi].
Graine : b4 Aïna, Voix du Matin (porte les 4 premiers sorts de lignée).

### Famille du Bouclier

| Palier | ID | Nom | Classe | Élément | ATQ | PV | Mana | Sort de lignée appris | Total sorts du maillon |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | s4 | Gardien-Mécanique | Prêtre | Terre | 2 | 55 | 8 +2 | Carapace Réactive (2✦ ×1.5) | 2 |
| UC | s14 | Garde du Rempart | Prêtre | Terre | 3 | 58 | 11 +3 | Égide Renforcée (3✦ ×1.7) | 3 |
| R | s6 | Sentinelle d’Acier | Guerrier | Terre | 4 | 62 | 14 +3 | Mur Inflexible (5✦ ×2.2) | 4 |
| SR | s7 | Bastion Arcanique | Mage | Terre | 6 | 58 | 22 +5 | Barrière Runique (9✦ ×3.2, gros sort) | 5 |
| UR | s11 | Argus, Rempart Éveillé | Guerrier | Terre | 6 | 92 | 30 +6 | Argus : Rempart Éveillé (14✦ ×4.4, gros sort) | 6 |
| L | s12 | Argus, Forteresse Vivante | Guerrier | Terre | 7 | 115 | 40 +8 | Argus : Forteresse Vivante (20✦ ×6, gros sort) | 7 |
Portes : n1 Épéiste Novice [voie de la protection] · n3 Prêtre Novice [la garde — protéger les vivants].
Graine : b5 Roc, Épaule du Monde (porte les 4 premiers sorts de lignée).

### Famille de la Braise

| Palier | ID | Nom | Classe | Élément | ATQ | PV | Mana | Sort de lignée appris | Total sorts du maillon |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | a19 | Allumeur de Braises | Mage | Feu | 9 | 43 | 8 +2 | Étincelle Filante (2✦ ×1.4) | 2 |
| UC | a32 | Veilleur de Braise | Mage | Feu | 11 | 47 | 11 +3 | Flèche de Feu (3✦ ×1.6) | 3 |
| R | a20 | Mage de la Fournaise | Mage | Feu | 14 | 51 | 14 +3 | Jet de Braise (5✦ ×1.9) | 4 |
| SR | a21 | Invocateur de Fournaise | Invocateur | Feu | 21 | 65 | 22 +5 | Fournaise (9✦ ×2.6, gros sort) | 5 |
| UR | a22 | Solen, Archimage de la Braise | Mage | Feu | 29 | 80 | 30 +6 | Solen : Couronne de Feu (14✦ ×3.4, gros sort) | 6 |
| L | a23 | Solen, Roi des Braises | Mage | Feu | 39 | 100 | 40 +8 | Solen : Braise Éternelle (20✦ ×4.5, gros sort) | 7 |
Portes : n2 Mage Novice [la fournaise — le Feu].
Graine : b6 Ember, Cœur de Fournaise (porte les 4 premiers sorts de lignée).

### Famille du Bosquet

| Palier | ID | Nom | Classe | Élément | ATQ | PV | Mana | Sort de lignée appris | Total sorts du maillon |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | a24 | Traqueur du Bosquet | Assassin | Terre | 10 | 46 | 8 +2 | Trait d’Épine (2✦ ×1.4) | 2 |
| UC | a33 | Pisteur du Bosquet | Assassin | Terre | 12 | 51 | 11 +3 | Lance d’Aubier (3✦ ×1.6) | 3 |
| R | a25 | Chasseur du Bosquet | Assassin | Terre | 15 | 56 | 14 +3 | Épine Vengeresse (5✦ ×1.9) | 4 |
| SR | a26 | Prédateur Sylvestre | Assassin | Terre | 22 | 61 | 22 +5 | Rafale d’Épines (9✦ ×2.6, gros sort) | 5 |
| UR | a27 | Maïa, Lame du Bosquet | Assassin | Terre | 32 | 72 | 30 +6 | Maïa : Danse des Feuilles (14✦ ×3.4, gros sort) | 6 |
| L | a28 | Maïa, Déesse du Bosquet | Assassin | Terre | 42 | 88 | 40 +8 | Maïa : Cœur du Bosquet (20✦ ×4.5, gros sort) | 7 |
Portes : n1 Épéiste Novice [voie sylvestre] · n2 Mage Novice [les Sylvains — la Terre].
Graine : b7 Sylve, Écorce Vive (porte les 4 premiers sorts de lignée).

## Les 21 solos

### Les 6 mini-lignées (16 cartes)

Des recrues sans famille : trois sorts chacune (commun, classe, signature), une chaîne courte qui monte d'un ou deux paliers. Ce sont des raccourcis vers les hautes raretés.

| Mini-lignée | Chaîne |
| --- | --- |
| les quais | a34 Braconnier des Quais (C) → a40 Chasseur des Quais (UC) → a41 Maître des Brumes (R) |
| les routes | a35 Palefrenière Errante (C) → a42 Écuyère des Routes (UC) → a43 Première Écuyère (R) |
| les dunes | a36 Éclaireur des Dunes (UC) → a44 Guide des Dunes (R) |
| la fête | a37 Jongleur de Fête (C) → a45 Artiste de Fête (UC) → a46 Maître Jongleur (R) |
| les berges | a38 Raboteur de Berges (C) → a47 Charpentier des Berges (UC) → a48 Maître Charpentier (R) |
| le guet | a39 Veilleuse du Guet (UC) → a49 Capitaine du Guet (R) |

### Les 5 solos greffés (portes raccourcies des familles)

| ID | Nom | Palier | Signature | Rattache à |
| --- | --- | --- | --- | --- |
| a3 | Garde-Promesse | C | Serment Protecteur (5✦ ×1.85) | s14 Garde du Rempart |
| a4 | Étincelle Vive | C | Trait Incandescent (5✦ ×1.85) | a32 Veilleur de Braise |
| a9 | Pilier Mécanique | R | Charge Hydraulique (5✦ ×1.85) | s7 Bastion Arcanique |
| s2 | Médecin de Camp | C | Baume Apaisant (5✦ ×1.85) | s13 Servante de l’Aube |
| s3 | Veilleur d’Acier | C | Œil du Stratège (5✦ ×1.85) | a31 Guetteur Crépusculaire |

## Les 7 graines archivées

Les anciennes branches SR (voie B des familles). Elles portent le commun et les 4 premiers sorts de lignée de leur famille, mais n'évoluent pas : hors chaîne, elles restent dormantes en attendant le rework des arbres.

| ID | Nom | Famille | Sorts de lignée portés |
| --- | --- | --- | --- |
| b1 | Yuki, Brise-Lame | Famille du Sabre | Taillade du Mat, Lame Vive, Lame Éclair, Millième Taillade |
| b2 | Onyx, Fil de Nuit | Famille de l’Ombre | Poigne du Silence, Pas de l’Ombre, Faux du Croissant, Danse des Cent Lames |
| b3 | Naïa, Sourcéleine | Famille de l’Eau | Goutte Percutante, Brume Mordante, Courant Battant, Marée Ascendante |
| b4 | Aïna, Voix du Matin | Famille de l’Aube | Étreinte Matinale, Rayon Matinal, Lumière Réconfortante, Bénédiction de l’Aurore |
| b5 | Roc, Épaule du Monde | Famille du Bouclier | Carapace Réactive, Égide Renforcée, Mur Inflexible, Barrière Runique |
| b6 | Ember, Cœur de Fournaise | Famille de la Braise | Étincelle Filante, Flèche de Feu, Jet de Braise, Fournaise |
| b7 | Sylve, Écorce Vive | Famille du Bosquet | Trait d’Épine, Lance d’Aubier, Épine Vengeresse, Rafale d’Épines |

## Les monstres, donjon par donjon (135)

Les webs des cinq donjons : chaque famille a des lignes d'évolution (le monstre monte d'un maillon par évolution), des cousins sans évolution et souvent un mythe (M) hors chaîne. Chaque monstre connaît le commun et une signature propre (coût 3 à 8✦, ×1.4 à ×2.0).

### Antre des Marées

#### Gobelins des Écumes

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| e1 | Gobelin des Marées | C | Eau | Guerrier | 8 | 58 | Jet d’Écume (3✦ ×1.5) |  |
| e3 | Pillard des Récifs | UC | Eau | Assassin | 11 | 52 | Morsure des Récifs (3✦ ×1.5) |  |
| e4 | Sergent des Brumes | R | Eau | Guerrier | 14 | 74 | Brise-Garde (3✦ ×1.5) |  |
| e5 | Prophète des Marées | SR | Eau | Mage | 20 | 62 | Vision Noyée (3✦ ×1.5) |  |
| e16 | Grand Chaman des Écumes | UR | Eau | Occultiste | 26 | 72 | Rituel des Écumes (3✦ ×1.6) | brûlure 30 % × 2 tours (sur la signature) |
| e17 | Zikka, Chaman des Écumes | L | Eau | Occultiste | 35 | 98 | Songe des Profondeurs (3✦ ×1.6) | brûlure 35 % × 3 tours (sur la signature) |
| e18 | Roi des Écumes | UR | Eau | Guerrier | 27 | 82 | Frappe Royale (3✦ ×1.5) |  |
| e19 | Griknir, Roi des Écumes | L | Eau | Guerrier | 37 | 110 | Couronne des Écumes (3✦ ×1.5) |  |
| e2 | Tirailleur des Récifs | C | Eau | Mage | 7 | 46 | Trait de Corail (3✦ ×1.5) |  |
| e10 | Veuve des Récifs | UC | Eau | Prêtre | 2 | 54 | Larme Salée (3✦ ×1.5) | Pouvoir : heal 18 |
| e8 | Matriarche des Récifs | R | Eau | Prêtre | 3 | 60 | Carapace de Corail (3✦ ×1.5) | Pouvoir : shield 22 |

#### Abîmaux

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| e7 | Moqueur des Marées | C | Eau | Prêtre | 2 | 50 | Chant de la Marée (3✦ ×1.5) | Pouvoir : heal 15 |
| e11 | Crabe des Berges | UC | Terre | Guerrier | 11 | 55 | Pince de Silex (3✦ ×1.5) |  |
| e20 | Rôdeur des Fonds | R | Eau | Assassin | 14 | 70 | Guet des Fonds (3✦ ×1.5) |  |
| e9 | Confesseur des Abysses | SR | Eau | Prêtre | 4 | 66 | Bénédiction de l’Abîme (3✦ ×1.5) | Pouvoir : heal 34 |
| e6 | Avatar de l’Abîme | UR | Eau | Mage | 28 | 78 | Étreinte de l’Abîme (3✦ ×1.5) |  |
| e13 | Léviathan, Colère du Gouffre | L | Eau | Guerrier | 38 | 108 | Marée Noire (3✦ ×1.5) |  |
| e15 | Ancien des Berges | SR | Terre | Prêtre | 4 | 70 | Mur de Galet (3✦ ×1.5) | Pouvoir : shield 40 |
| e21 | Protecteur des Berges | UR | Terre | Guerrier | 5 | 78 | Écran de Galets (3✦ ×1.5) | Pouvoir : shield 52 |
| e22 | Pontos, Aîné des Berges | L | Terre | Prêtre | 6 | 88 | Bénédiction des Berges (3✦ ×1.5) | Pouvoir : heal 58 |
| e12 | Gardien des Galets | SR | Terre | Guerrier | 21 | 66 | Colère Sismique (3✦ ×1.5) |  |
| e14 | Titan des Marées | M | Eau | Guerrier | 52 | 145 | Abîme Absolu (3✦ ×1.5) |  |

Mythe : e14 Titan des Marées (M), hors chaîne d'évolution.

#### Sirènes des Récifs

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| e23 | Sirène Nouvelle | C | Eau | Occultiste | 2 | 48 | Berceuse des Récifs (3✦ ×1.5) | Pouvoir : heal 14 |
| e24 | Chanteuse des Récifs | UC | Eau | Occultiste | 3 | 52 | Marée Traîtresse (8✦ ×1.5) | Pouvoir : slow |
| e25 | Voix du Large | R | Eau | Occultiste | 3 | 58 | Chant Paralysant (6✦ ×1.5) | Pouvoir : stun |
| e26 | Écumeuse des Récifs | SR | Eau | Occultiste | 20 | 64 | Écume Tranchante (3✦ ×1.6) |  |
| e27 | Sirène Ensorceleuse | UR | Eau | Occultiste | 4 | 68 | Chant Ensorceleur (6✦ ×2) | Pouvoir : curse |
| e28 | Méliane, Voix du Large | L | Eau | Occultiste | 5 | 84 | Chant du Naufrage (7✦ ×2) | Pouvoir : stun |
| e29 | Gardienne des Récifs | UR | Eau | Guerrier | 27 | 80 | Corail Vengeur (3✦ ×1.6) |  |
| e30 | Thalassa, Reine des Récifs | L | Eau | Assassin | 37 | 102 | Colère des Récifs (3✦ ×1.6) | brûlure 30 % × 2 tours (sur la signature) |

### Forge Cendrée

#### Cendrels

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| f1 | Golem de Cendre | C | Feu | Guerrier | 8 | 62 | Poing de Cendre (3✦ ×1.5) |  |
| f10 | Souffleur de Braises | UC | Feu | Prêtre | 3 | 52 | Cendre Protectrice (3✦ ×1.5) | Pouvoir : shield 16 |
| f11 | Traqueur de Suie | R | Ombre | Assassin | 15 | 70 | Poigne de Suie (3✦ ×1.5) |  |
| f16 | Mailleur de Suie | SR | Ombre | Occultiste | 4 | 64 | Filet de Suie (8✦ ×1.5) | Pouvoir : slow |
| f17 | Façonneur de Cendres | UR | Ombre | Occultiste | 4 | 70 | Tissage Ensorcelé (6✦ ×2) | Pouvoir : curse |
| f18 | Ombeline, Tisseuse de Suie | L | Ombre | Occultiste | 5 | 84 | Linceul de Suie (7✦ ×2) | Pouvoir : stun |
| f19 | Champion de Cendre | SR | Feu | Mage | 22 | 66 | Vague de Cendres (3✦ ×1.6) | brûlure 30 % × 2 tours (sur la signature) |
| f20 | Souffle Ardent | UR | Feu | Mage | 30 | 82 | Colonne de Feu (3✦ ×1.6) | brûlure 35 % × 2 tours (sur la signature) |
| f21 | Calcine, Dame des Cendres | L | Feu | Mage | 38 | 102 | Fournaise de Calcine (3✦ ×1.6) | brûlure 35 % × 3 tours (sur la signature) |
| f7 | Tisseur de Cendres | C | Ombre | Prêtre | 2 | 48 | Onguent de Suie (3✦ ×1.5) | Pouvoir : heal 14 |
| f3 | Écorcheur de Suie | UC | Ombre | Assassin | 12 | 50 | Entaille Rousse (3✦ ×1.5) |  |
| f8 | Foreuse d’Âmes | R | Ombre | Assassin | 5 | 55 | Cri de la Forge (3✦ ×1.5) | Pouvoir : atkBuff 0.15 |
| f13 | Seigneur des Cendres | M | Ombre | Assassin | 54 | 142 | Nuit de Cendres (3✦ ×2) |  |

Mythe : f13 Seigneur des Cendres (M), hors chaîne d'évolution.

#### Enfants de la Braise

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| f14 | Braise Errante | C | Feu | Mage | 8 | 46 | Flammèche Errante (3✦ ×1.5) |  |
| f15 | Semeur de Fournaise | UC | Feu | Mage | 11 | 50 | Semence Ardente (3✦ ×1.5) | brûlure 25 % × 2 tours (sur la signature) |
| f4 | Chevalier de Braise | R | Feu | Guerrier | 14 | 76 | Frappe de Magma (3✦ ×1.5) |  |
| f9 | Idole de Magma | SR | Feu | Prêtre | 4 | 68 | Peau de Lave (3✦ ×1.5) | Pouvoir : shield 36 |
| f6 | Colosse de Magma | UR | Feu | Guerrier | 30 | 90 | Éruption (3✦ ×1.5) |  |
| f22 | Vulcain, Colosse Ardent | L | Feu | Guerrier | 40 | 112 | Colère de Vulcain (3✦ ×1.6) | brûlure 30 % × 2 tours (sur la signature) |
| f5 | Invocateur des Foyers | SR | Feu | Invocateur | 21 | 64 | Fournaise Invoquée (3✦ ×1.5) | Pouvoir : summon |
| f23 | Maître des Foyers | UR | Feu | Invocateur | 5 | 72 | Gardiens Invoqués (3✦ ×1.5) | Pouvoir : summon |
| f12 | Gardien des Foyers | L | Feu | Invocateur | 39 | 106 | Fournaise Éternelle (3✦ ×1.5) | Pouvoir : summon |

#### Gobelin des Fumées

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| f2 | Gobelin des Fumées | C | Ombre | Assassin | 9 | 44 | Lancer de Suie (3✦ ×1.5) |  |
| f24 | Gobelin de Suie | UC | Ombre | Assassin | 11 | 48 | Poignée de Suie (3✦ ×1.5) |  |

### Bosquet Profond

#### Bêtes du Fougeron

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g1 | Rampant du Fougeron | C | Terre | Assassin | 8 | 58 | Étreinte de Racines (3✦ ×1.5) |  |
| g3 | Sanglier de Mousse | UC | Terre | Guerrier | 11 | 54 | Culbute de Mousse (3✦ ×1.5) |  |
| g4 | Gardien des Remparts Verts | R | Terre | Guerrier | 14 | 74 | Fronde de Ronce (3✦ ×1.5) |  |
| g13 | Semeur Sylvestre | SR | Terre | Invocateur | 21 | 64 | Sève Éveillée (3✦ ×1.5) | Pouvoir : summon |
| g6 | Colosse Sylvestre | UR | Terre | Guerrier | 29 | 82 | Poing Séculaire (3✦ ×1.5) |  |
| g7 | Patriarche du Bosquet | L | Lumière | Guerrier | 40 | 104 | Aube Foliaire (3✦ ×1.5) |  |
| g14 | Mycolithe | SR | Terre | Occultiste | 20 | 66 | Spores Vampires (3✦ ×1.4) | brûlure 35 % × 2 tours (sur la signature) |
| g15 | Mycélium Vivant | UR | Terre | Occultiste | 28 | 80 | Filaments Rongeants (3✦ ×1.5) | brûlure 40 % × 2 tours (sur la signature) |
| g16 | Mycola, Reine des Spores | L | Terre | Occultiste | 37 | 100 | Nuée de Spores (3✦ ×1.6) | brûlure 40 % × 3 tours (sur la signature) |
| g2 | Luciole Hargneuse | C | Lumière | Mage | 9 | 45 | Éclat Vif (3✦ ×1.5) |  |
| g5 | Prisme Vivant | SR | Lumière | Mage | 21 | 63 | Rayon Prismatique (3✦ ×1.5) |  |
| g8 | Cœur du Bosquet | M | Terre | Guerrier | 53 | 146 | Racine-Monde (3✦ ×1.5) |  |

Mythe : g8 Cœur du Bosquet (M), hors chaîne d'évolution.

#### Gens des Sèves

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g9 | Lueur Bienveillante | C | Lumière | Prêtre | 2 | 50 | Baume Lumineux (3✦ ×1.5) | Pouvoir : heal 15 |
| g12 | Bergère des Sèves | UC | Terre | Prêtre | 3 | 54 | Claie de Branches (3✦ ×1.5) | Pouvoir : shield 18 |
| g10 | Druidesse des Sèves | R | Terre | Invocateur | 3 | 62 | Sève Vitale (3✦ ×1.5) | Pouvoir : summon |
| g11 | Oracle des Clairières | SR | Lumière | Prêtre | 4 | 68 | Voûte de Clairière (3✦ ×1.5) | Pouvoir : shield 38 |
| g17 | Dryade Radieuse | UR | Lumière | Prêtre | 5 | 76 | Rosée Radieuse (3✦ ×1.5) | Pouvoir : heal 48 |
| g18 | Adriel, Lumignole des Clairières | L | Lumière | Prêtre | 6 | 92 | Première Clarté (6✦ ×1.5) | Pouvoir : revive 0.6 |
| g19 | Dryade du Sous-Bois | SR | Ombre | Occultiste | 4 | 64 | Ombre Tissée (8✦ ×1.5) | Pouvoir : slow |
| g20 | Rôdeuse des Sous-Bois | UR | Ombre | Assassin | 29 | 76 | Lames de Branchage (3✦ ×1.6) |  |
| g21 | Vesna, Dryade du Sous-Bois | L | Ombre | Assassin | 38 | 96 | Nuit des Sèves (3✦ ×1.6) | brûlure 30 % × 2 tours (sur la signature) |

### Crypte Oubliée

#### Spectres des Caveaux

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| k1 | Rôdeur des Caveaux | C | Ombre | Assassin | 9 | 50 | Griffe Ténébreuse (3✦ ×1.5) |  |
| k3 | Fossoyeur Nocturne | UC | Ombre | Guerrier | 12 | 52 | Coup de Bêche Noire (3✦ ×1.5) |  |
| k13 | Goule des Caveaux | R | Ombre | Assassin | 15 | 72 | Morsure Putride (3✦ ×1.5) |  |
| k5 | Spectre des Quais | SR | Eau | Mage | 21 | 60 | Brume Mordante (3✦ ×1.5) |  |
| k6 | Banshee des Caveaux | UR | Ombre | Mage | 30 | 76 | Hurlement Froid (3✦ ×1.5) |  |
| k14 | Macha, Hurleuse des Caveaux | L | Ombre | Occultiste | 40 | 100 | Hurlement Fatal (3✦ ×1.6) | brûlure 35 % × 2 tours (sur la signature) |
| k15 | Éveillé des Caveaux | SR | Ombre | Invocateur | 4 | 66 | Rite d’Éveil (3✦ ×1.5) | Pouvoir : summon |
| k16 | Liche des Caveaux | UR | Ombre | Invocateur | 5 | 72 | Légion des Caveaux (3✦ ×1.5) | Pouvoir : summon |
| k7 | Archiliche des Caveaux | L | Ombre | Invocateur | 38 | 104 | Voie du Tombeau (3✦ ×1.5) | Pouvoir : summon |
| k17 | La Mort, Faucheuse des Tombes | M | Ombre | Assassin | 55 | 150 | Fauchade Universelle (3✦ ×2) |  |

Mythe : k17 La Mort, Faucheuse des Tombes (M), hors chaîne d'évolution.

#### Les Naufragés

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| k2 | Nymphe Croupie | C | Eau | Mage | 8 | 52 | Crachat Trouble (3✦ ×1.5) |  |
| k12 | Veilleuse de Bord | UC | Eau | Prêtre | 3 | 52 | Drap de Nappe (3✦ ×1.5) | Pouvoir : shield 17 |
| k10 | Meneuse de Deuil | R | Ombre | Assassin | 5 | 56 | Deuil Martial (3✦ ×1.5) | Pouvoir : atkBuff 0.18 |
| k11 | Prieuse des Naufragés | SR | Eau | Prêtre | 4 | 66 | Eau Bénite (3✦ ×1.5) | Pouvoir : heal 42 |
| k18 | Endeuillée des Flots | UR | Ombre | Occultiste | 5 | 74 | Chagrin Noyé (6✦ ×2) | Pouvoir : curse |
| k19 | Ysolde, Veuve Éternelle | L | Ombre | Occultiste | 6 | 90 | Deuil Éternel (7✦ ×2) | Pouvoir : stun |
| k20 | Capitaine Noyé | SR | Eau | Guerrier | 22 | 70 | Sabre Englouti (3✦ ×1.6) |  |
| k21 | Revenu des Flots | UR | Eau | Occultiste | 28 | 84 | Noyade Vengeresse (3✦ ×1.5) | brûlure 30 % × 2 tours (sur la signature) |
| k22 | Ahab, Lord des Naufragés | L | Eau | Guerrier | 40 | 106 | Harpon du Naufrage (3✦ ×1.6) | brûlure 30 % × 2 tours (sur la signature) |
| k9 | Servante Pâle | C | Ombre | Prêtre | 2 | 48 | Soupir Glacé (3✦ ×1.5) | Pouvoir : heal 14 |
| k8 | Ancien Naufragé | M | Eau | Mage | 54 | 148 | Abîme Remontant (3✦ ×1.5) |  |

Mythe : k8 Ancien Naufragé (M), hors chaîne d'évolution.

#### Chevalerie Défunte

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| k23 | Écuyer Défunt | C | Ombre | Guerrier | 8 | 60 | Estoc Rouillé (3✦ ×1.5) |  |
| k24 | Porte-Étendard Défunt | UC | Ombre | Guerrier | 12 | 54 | Étendard Funèbre (3✦ ×1.5) |  |
| k4 | Chevalier Défunt | R | Ombre | Guerrier | 15 | 72 | Frappe Rigide (3✦ ×1.5) |  |
| k25 | Chevalière de la Veille | SR | Ombre | Guerrier | 20 | 72 | Vigilance Éternelle (3✦ ×1.6) |  |
| k26 | Paladine Défunte | UR | Lumière | Prêtre | 5 | 74 | Égide Défunte (3✦ ×1.5) | Pouvoir : shield 50 |
| k27 | Jeanne d’Arc, Chevalière de la Veille | L | Lumière | Guerrier | 39 | 108 | Épée de l’Aube (3✦ ×1.6) |  |
| k28 | Chevalière du Serment | SR | Ombre | Assassin | 21 | 68 | Serment Brisé (3✦ ×1.6) |  |
| k29 | Sermenteuse Défunte | UR | Ombre | Occultiste | 5 | 72 | Serment Rallié (7✦ ×1.5) | Pouvoir : warcry |
| k30 | Siegfried, Chevalière du Serment Brisé | L | Ombre | Assassin | 40 | 98 | Lame du Serment (3✦ ×1.6) |  |

### Zénith Ardent

#### Légion Solaire

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| z1 | Écuyer du Zénith | C | Lumière | Guerrier | 8 | 60 | Estoc Brillant (3✦ ×1.5) |  |
| z3 | Arbalétrier Doré | UC | Lumière | Assassin | 12 | 50 | Carreau Doré (3✦ ×1.5) |  |
| z4 | Lancier Solaire | R | Feu | Guerrier | 14 | 73 | Lance Héliale (3✦ ×1.5) |  |
| z5 | Voulige d’Aube | SR | Lumière | Mage | 21 | 62 | Falaise de Lumière (3✦ ×1.5) |  |
| z13 | Centurion Ardent | UR | Feu | Mage | 30 | 80 | Colonne Solaire (3✦ ×1.6) | brûlure 35 % × 2 tours (sur la signature) |
| z7 | Héraut du Zénith | L | Lumière | Guerrier | 41 | 103 | Sentence Solaire (3✦ ×1.5) |  |
| z14 | Lancière de l’Aube | UR | Lumière | Guerrier | 29 | 82 | Perce-Aube (3✦ ×1.6) |  |
| z15 | Aurorine, Lance de l’Aube | L | Lumière | Assassin | 39 | 96 | Éclipse Montante (3✦ ×1.6) |  |
| z12 | Garde-Flamme | UC | Feu | Prêtre | 3 | 54 | Rempart Ardent (3✦ ×1.5) | Pouvoir : shield 18 |
| z10 | Serre-Soleil | R | Lumière | Prêtre | 3 | 58 | Aile du Matin (3✦ ×1.5) | Pouvoir : heal 24 |
| z8 | Astre Capiteux | M | Feu | Mage | 53 | 144 | Couronnement (3✦ ×1.5) |  |

Mythe : z8 Astre Capiteux (M), hors chaîne d'évolution.

#### Phénix Célestes

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| z2 | Souffle-Mèche | C | Feu | Mage | 9 | 46 | Étincelle (3✦ ×1.5) |  |
| z16 | Essor de Flammes | UC | Feu | Mage | 12 | 50 | Envol Incandescent (3✦ ×1.5) | brûlure 25 % × 2 tours (sur la signature) |
| z17 | Oiseau de Feu | R | Feu | Mage | 15 | 72 | Rafale de Braise (3✦ ×1.5) | brûlure 30 % × 2 tours (sur la signature) |
| z18 | Cendre d’Éclosion | SR | Feu | Mage | 21 | 66 | Éclosion Ardente (3✦ ×1.5) | brûlure 30 % × 2 tours (sur la signature) |
| z6 | Phénix du Zénith | UR | Feu | Mage | 29 | 78 | Pluie de Feu (3✦ ×1.5) |  |
| z19 | Pyrrha, Cendre Éternelle | L | Feu | Mage | 38 | 100 | Renaissance Pyrique (3✦ ×1.6) | brûlure 30 % × 2 tours (sur la signature) |
| z20 | Plume Miroir | SR | Feu | Prêtre | 4 | 64 | Plumage Miroir (6✦ ×1.5) | Pouvoir : reflect |
| z21 | Phénix Miroir | UR | Feu | Prêtre | 5 | 72 | Renvoi Céleste (6✦ ×1.5) | Pouvoir : reflect |
| z22 | Fjalar, Phénix du Renvoi | L | Feu | Occultiste | 6 | 88 | Immolation Retournée (7✦ ×2) | Pouvoir : reflect |

#### Clergé du Plein Jour

| ID | Nom | Palier | Élément | Classe | ATQ | PV | Signature | Pouvoir / effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| z9 | Chantre du Zénith | C | Lumière | Prêtre | 2 | 50 | Hymne du Matin (3✦ ×1.5) | Pouvoir : heal 16 |
| z23 | Chapelain du Jour | UC | Lumière | Prêtre | 3 | 54 | Aube Bénie (3✦ ×1.5) | Pouvoir : shield 18 |
| z24 | Diacre du Plein Jour | R | Lumière | Prêtre | 4 | 60 | Office du Matin (3✦ ×1.5) | Pouvoir : heal 26 |
| z11 | Prêtresse du Plein Jour | SR | Lumière | Prêtre | 4 | 68 | Bénédiction Solaire (3✦ ×1.5) | Pouvoir : heal 44 |
| z25 | Cantatrice du Zénith | UR | Lumière | Prêtre | 5 | 74 | Hymne du Zénith (7✦ ×1.5) | Pouvoir : warcry |
| z26 | Célestin, Apôtre du Chant | L | Lumière | Prêtre | 6 | 92 | Cantique Final (3✦ ×1.5) | Pouvoir : atkBuff 0.3 |
| z27 | Inquisitrice du Jour | SR | Lumière | Occultiste | 4 | 66 | Colonne de Purge (6✦ ×2) | Pouvoir : curse |
| z28 | Justicière du Jour | UR | Lumière | Assassin | 30 | 78 | Verdict Solaire (3✦ ×1.6) |  |
| z29 | Justine, Justicière du Jour | L | Lumière | Assassin | 39 | 100 | Peine Capitale (3✦ ×1.6) |  |
| z30 | Apolline, Prophétesse du Jour | M | Lumière | Mage | 52 | 145 | Prophétie du Plein Jour (3✦ ×1.6) | brûlure 30 % × 2 tours (sur la signature) |

Mythe : z30 Apolline, Prophétesse du Jour (M), hors chaîne d'évolution.

## Les 18 divines (Le Seuil)

Trois familles divines, chacune en deux lignes reliées par un pont (d3 → d4, d9 → d10, d15 → d16). Elles n'entrent jamais dans l'opposition des éléments, une seule par famille en équipe, trois maximum. Leur richesse vit dans leurs Pouvoirs (automatiques, sans mana) : étourdissement et lenteur chez les Arbitres, copie et renvoi chez le Chœur, liens entre alliés chez les Tisseuses.

Naissances d’entrée : n14 Démon → d8 Choriste Miroir (le Chœur) ; n15 Éveillé du Seuil → d14 Aiguille du Pont (les Tisseuses). L’Ange (n13) s’éveille en Ange Éveillé (p1, hors web — voir l’arbitrage du 10/11).

| ID | Nom | Palier | Classe | Camp | Signature | Pouvoir |
| --- | --- | --- | --- | --- | --- | --- |
| d1 | Garde du Seuil | C | Guerrier | Lumière | Interdiction (3✦ ×1.5) |  |
| d2 | Servante du Sablier | C | Occultiste | Lumière | Sable Glissant (8✦ ×1.5) | Pouvoir : slow |
| d3 | Huissier de l’Entre-Deux | UC | Occultiste | Lumière | Sentence Lente (6✦ ×1.5) | Pouvoir : stun |
| d4 | Juge des Heures | R | Mage | Lumière | Balance du Temps (5✦ ×1.8) |  |
| d5 | Maître des Sabliers | SR | Occultiste | Lumière | Sablier Ensorcelé (6✦ ×2) | Pouvoir : curse |
| d6 | Kairos, Arbitre du Seuil | L | Occultiste | Lumière | Arrêt du Temps (7✦ ×2) | Pouvoir : stun |
| d7 | Lame Miroir | C | Assassin | Ombre | Frappe Réfléchie (3✦ ×1.5) |  |
| d8 | Choriste Miroir | UC | Mage | Ombre | Voix Doubles (4✦ ×1.6) |  |
| d9 | Prisme du Chœur | R | Prêtre | Ombre | Reflet Protecteur (3✦ ×1.5) | Pouvoir : shield 22 |
| d10 | Miroir Antiphonique | SR | Occultiste | Ombre | Chant Miroir (6✦ ×1.5) | Pouvoir : copy |
| d11 | Chef du Chœur | UR | Prêtre | Ombre | Renvoi en Chœur (6✦ ×1.5) | Pouvoir : reflect |
| d12 | Écho, Voix Miroir | L | Occultiste | Ombre | Refrain Éternel (6✦ ×2) | Pouvoir : copy |
| d13 | Fileuse du Pont | C | Assassin | Terre | Fil Tendu (3✦ ×1.5) |  |
| d14 | Aiguille du Pont | UC | Prêtre | Terre | Point Serré (3✦ ×1.5) | Pouvoir : shield 17 |
| d15 | Brodeuse des Liens | R | Assassin | Terre | Point de Croix (5✦ ×1.8) |  |
| d16 | Tisseuse des Nœuds | SR | Occultiste | Terre | Nœud d’Or (6✦ ×1.5) | Pouvoir : link |
| d17 | Architecte du Pont | UR | Prêtre | Terre | Deux Rives (5✦ ×1.5) | Pouvoir : link |
| d18 | Ananké, Tisseuse du Pont | L | Occultiste | Terre | Destin Tissé (6✦ ×2) | Pouvoir : link |

---

*Le détail des sorts (lignée, signatures, coûts) et les arbres d'acquisition : `inventaire-sorts.md`, `arbres-evolution.md` et `arbres-sorts.md`. L'audit de cohérence : `audit-sorts.md`.*

## Partie 2 — Inventaire complet des sorts

> AICG : Lignées. Les **653 entrées de sorts** du catalogue des 238 cartes (238 sorts communs, 15 de race, 36 de classe, 175 de lignée, 189 signatures uniques), avec leur catégorie, leur coût en mana ✦, leur multiplicateur de puissance et leur règle d'acquisition. Source : `dist.html` (grammaire des sorts v0.43) et CSV du catalogue v0.43.1.

## La grammaire (v0.43)

Chaque carte connaît ses sorts par couches, du plus universel au plus personnel :

| Catégorie | Qui l'a | Coût | Règle |
| --- | --- | --- | --- |
| **Commun** | toutes les cartes | 2✦ | Frappe Précise (×1.3) pour les attaquants, Premiers Soins (×1.15) pour les soigneurs |
| **De race** | les 15 naissances | 3✦ ×1.5 | le geste de la race d'origine (humaine, bestiau, enge, divine) |
| **De classe** | les 15 naissances + les 21 solos | 3-4✦ | le geste de la classe (5 classes, 5 sorts) |
| **De lignée** | les familiales (+ les 7 graines) | 2 → 20✦ | un sort de lignée appris par palier, cumulatif : 6 sorts par famille, la L les connaît tous |
| **Signature** | toutes les cartes | 3-8✦ (5✦ pour les naissances) | le geste unique de la carte : 189 signatures, toutes distinctes |

À ces sorts s'ajoutent les **Pouvoirs** : des effets automatiques à chaque action, sans mana (soins, boucliers, invocations, brûlures, gimmicks), portés par 91 cartes (les 12 effets recensés, plus les gimmicks).

## Les sorts universels

### Les communs (238 cartes)

| Sort | Rôle | Coût | Puissance | Description |
| --- | --- | --- | --- | --- |
| Frappe Précise | attaque | 2✦ | ×1.3 | Le geste que toute carte de combat connaît : un coup net, sans gaspillage. |
| Premiers Soins | support | 2✦ | ×1.15 | Le soin élémentaire que tout soigneur connaît : un pansement rapide sur la pire plaie. |
| Discipline de Ligne | support | 3✦ | ×1.5 | Le geste des lignes humaines : appris au drill, exécuté sans penser. |
| Instinct Sauvage | support | 3✦ | ×1.5 | Le bestiau agit comme il respire : par instinct, vite et fort. |
| Vol en Rase-Mottes | support | 3✦ | ×1.5 | L’enge plonge du ciel et remonte avant la riposte. |
| Ferveur Céleste | support | 3✦ | ×1.5 | Une onction des camps divins qui aiguise le geste. |
| Brise-Garde | support | 4✦ | ×1.6 | Le coup du guerrier : chercher la jointure de la garde. |
| Décharge Arcanique | support | 4✦ | ×1.65 | Le mage vide un fragment de mana en un trait brut. |
| Onde Consacrée | support | 3✦ | ×1.3 | Le soin du prêtre : une onde qui referme les plaies. |
| Frappe dans le Dos | support | 4✦ | ×1.7 | L’assassin frappe là où l’on ne regarde pas. |
| Œil du Malheur | support | 4✦ | ×1.6 | L’occultiste marque sa proie d’un mauvais présage. |

### Les sorts de race (les 15 naissances, 3✦ ×1.5)

| Sort | Race | Description |
| --- | --- | --- |
| Discipline de Ligne | Humaine (n1 à n4) | Le geste des lignes humaines : appris au drill, exécuté sans penser. |
| Instinct Sauvage | Bestiau (n5 à n9) | Le bestiau agit comme il respire : par instinct, vite et fort. |
| Vol en Rase-Mottes | Enge (n10 à n12) | L’enge plonge du ciel et remonte avant la riposte. |
| Ferveur Céleste | Divine (n13 à n15) | Une onction des camps divins qui aiguise le geste. |
| Brise-Garde | undefined | Le coup du guerrier : chercher la jointure de la garde. |
| Décharge Arcanique | undefined | Le mage vide un fragment de mana en un trait brut. |
| Onde Consacrée | undefined | Le soin du prêtre : une onde qui referme les plaies. |
| Frappe dans le Dos | undefined | L’assassin frappe là où l’on ne regarde pas. |
| Œil du Malheur | undefined | L’occultiste marque sa proie d’un mauvais présage. |

### Les sorts de classe (naissances et solos)

| Sort | Classe | Coût | Puissance | Description |
| --- | --- | --- | --- | --- |
| Brise-Garde | Guerrier | 4✦ | ×1.6 | Le coup du guerrier : chercher la jointure de la garde. |
| Décharge Arcanique | Mage | 4✦ | ×1.65 | Le mage vide un fragment de mana en un trait brut. |
| Onde Consacrée | tre | 3✦ | ×1.3 | Le soin du prêtre : une onde qui referme les plaies. |
| Frappe dans le Dos | Assassin | 4✦ | ×1.7 | L’assassin frappe là où l’on ne regarde pas. |
| Œil du Malheur | Occultiste | 4✦ | ×1.6 | L’occultiste marque sa proie d’un mauvais présage. |

## Les sorts de lignée (7 familles × 6 paliers)

Un maillon apprend **un sort de lignée par palier franchi** et connaît ceux des paliers inférieurs. L'échelle des coûts est la même pour toutes les familles : 2, 3, 5, 9, 14 puis 20✦ ; les gros sorts (9✦ et plus) portent la marque du nommé aux paliers UR et L. Chez les soigneurs (Aube, Bouclier), plus le sort est cher, plus il soigne. ; et depuis la v0.47, le sort L ne répète plus le nom de sa carte : Tranche-Monde pour le Sabre, Nuit Éternelle pour l’Ombre (l’Aube garde son exception assumée : Aube Éternelle)

### Famille du Sabre

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Taillade du Mat | 2✦ | ×1.4 |  | Une frappe rapide portée au lever du jour. |
| UC | Lame Vive | 3✦ | ×1.6 |  | Une coupe sèche qui cherche la jointure de l’armure. |
| R | Lame Éclair | 5✦ | ×1.9 |  | Un sabre si rapide qu’on ne voit que la traînée. |
| SR | Millième Taillade | 9✦ | ×2.6 | oui | Mille coupes en un seul geste. |
| UR | Kenji : Zénith Tranchant | 14✦ | ×3.4 | oui | Le sabre atteint le sommet du ciel et retombe en éclair. |
| L | Tranche-Monde | 20✦ | ×4.5 | oui | Une constellation de lames s’abat sur l’ennemi. |

### Famille de l’Ombre

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Poigne du Silence | 2✦ | ×1.4 |  | Une attaque sournoise sur les points faibles. |
| UC | Pas de l’Ombre | 3✦ | ×1.6 |  | Un déplacement imperceptible, puis la morsure. |
| R | Faux du Croissant | 5✦ | ×1.9 |  | Une faux qui ne luit que les nuits sans lune. |
| SR | Danse des Cent Lames | 9✦ | ×2.6 | oui | Cent ombres frappent là où une seule semble passer. |
| UR | Kira : Voile Déchiré | 14✦ | ×3.4 | oui | L’ombre elle-même est une arme entre ses mains. |
| L | Nuit Éternelle | 20✦ | ×4.5 | oui | Le combat continue dans une nuit qui ne se lève plus. |

### Famille de l’Eau

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Goutte Percutante | 2✦ | ×1.4 |  | Une goutte lancée à la vitesse d’une flèche. |
| UC | Brume Mordante | 3✦ | ×1.6 |  | Un brouillard salé qui ronge armor et peau. |
| R | Courant Battant | 5✦ | ×1.9 |  | Le fleuve répond à son appel et charge l’ennemi. |
| SR | Marée Ascendante | 9✦ | ×2.6 | oui | Une vague montante qui emporte tout sur son passage. |
| UR | Raz-de-Marée | 14✦ | ×3.4 | oui | L’océan entier se soulève d’un seul geste d’Alix. |
| L | Colère de l’Océan | 20✦ | ×4.5 | oui | La déesse de l’eau réveille le gouffre des abysses. |

### Famille de l’Aube

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Étreinte Matinale | 2✦ | ×1.5 |  | La première lumière du jour referme les plaies. |
| UC | Rayon Matinal | 3✦ | ×1.7 |  | Un rayon oblique qui caresse la blessure. |
| R | Lumière Réconfortante | 5✦ | ×2.2 |  | Un rayon chaud qui chasse fatigue et blessures. |
| SR | Bénédiction de l’Aurore | 9✦ | ×3.2 | oui | Le soleil levant bénit l’équipe d’un souffle doré. |
| UR | Aurore Radieuse | 14✦ | ×4.4 | oui | La lumière de Léna coule comme une marée dorée. |
| L | Aube Éternelle | 20✦ | ×6 | oui | Un nouveau matin se lève et efface la nuit. |

### Famille du Bouclier

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Carapace Réactive | 2✦ | ×1.5 |  | Son blindage se raffermit au moment de l’impact. |
| UC | Égide Renforcée | 3✦ | ×1.7 |  | Une plaque de plus entre le coup et la ligne. |
| R | Mur Inflexible | 5✦ | ×2.2 |  | Là où elle se tient, la ligne ne cède jamais. |
| SR | Barrière Runique | 9✦ | ×3.2 | oui | Des runes gravées dans l’acier dévient les coups. |
| UR | Argus : Rempart Éveillé | 14✦ | ×4.4 | oui | La forteresse s’éveille et couvre toute l’équipe. |
| L | Argus : Forteresse Vivante | 20✦ | ×6 | oui | Le mur devient montagne, la montagne devient garde. |

### Famille de la Braise

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Étincelle Filante | 2✦ | ×1.4 |  | Une étincelle qui court plus vite que la flamme. |
| UC | Flèche de Feu | 3✦ | ×1.6 |  | Une flèche enflammée qui accroche l’air. |
| R | Jet de Braise | 5✦ | ×1.9 |  | Un souffle de braises brûlantes arraché au foyer. |
| SR | Fournaise | 9✦ | ×2.6 | oui | Le sol s’ouvre et crache un cercle de feu. |
| UR | Solen : Couronne de Feu | 14✦ | ×3.4 | oui | Une couronne de flammes consume les rangs adverses. |
| L | Solen : Braise Éternelle | 20✦ | ×4.5 | oui | Un feu qui ne s’éteint plus, où que l’ennemi fuie. |

### Famille du Bosquet

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Trait d’Épine | 2✦ | ×1.4 |  | Une épine sèche lancée du creux d’un fourré. |
| UC | Lance d’Aubier | 3✦ | ×1.6 |  | Un éclat de bois vert durci par la sève. |
| R | Épine Vengeresse | 5✦ | ×1.9 |  | La forêt rend coup pour coup à qui la blesse. |
| SR | Rafale d’Épines | 9✦ | ×2.6 | oui | Une tempête de ronces ferme l’horizon. |
| UR | Maïa : Danse des Feuilles | 14✦ | ×3.4 | oui | Ses feuilles dansent autour de la proie, puis tombent. |
| L | Maïa : Cœur du Bosquet | 20✦ | ×4.5 | oui | Le bosquet entier se lève et marche au combat. |

## Les 189 signatures

Chaque carte porte un geste unique : **aucune signature n'est partagée** (vérifié par l'audit). Le coût et la puissance des signatures de monstres montent avec leur palier (3 à 8✦, ×1.4 à ×2.0) ; celles des naissances sont uniformes (5✦ ×1.85).

### Les signatures des 15 naissances (5✦ ×1.85)

| Naissance | Signature |
| --- | --- |
| n1 Épéiste Novice | Prise de Garde |
| n2 Mage Novice | Étincelle d’Étude |
| n3 Prêtre Novice | Bénédiction Modeste |
| n4 Voleur Novice | Larcin Rapide |
| n5 Bestiau des Eaux | Bruissement d’Écume |
| n6 Bestiau des Flammes | Souffle de Braise |
| n7 Bestiau du Vivant | Sève Voleuse |
| n8 Bestiau des Ténèbres | Griffes Noires |
| n9 Bestiau des Cieux | Rafale Céleste |
| n10 Enge des Brumes | Voile de Brume |
| n11 Enge des Bois | Souffle des Sèves |
| n12 Enge des Caveaux | Froid du Caveau |
| n13 Ange | Éclat d’Aube |
| n14 Démon | Trait de Vice |
| n15 Éveillé du Seuil | Regard du Seuil |

### Les signatures des 21 solos

| ID | Nom | Palier | Signature | Coût | Puissance |
| --- | --- | --- | --- | --- | --- |
| a3 | Garde-Promesse | C | Serment Protecteur | 5✦ | ×1.85 |
| a4 | Étincelle Vive | C | Trait Incandescent | 5✦ | ×1.85 |
| a9 | Pilier Mécanique | R | Charge Hydraulique | 5✦ | ×1.85 |
| s2 | Médecin de Camp | C | Baume Apaisant | 5✦ | ×1.85 |
| s3 | Veilleur d’Acier | C | Œil du Stratège | 5✦ | ×1.85 |
| a34 | Braconnier des Quais | C | Flèche de Brume | 5✦ | ×1.85 |
| a35 | Palefrenière Errante | C | Litière Douce | 5✦ | ×1.85 |
| a36 | Éclaireur des Dunes | UC | Pas de Sable | 5✦ | ×1.85 |
| a37 | Jongleur de Fête | C | Bottes Cachées | 5✦ | ×1.85 |
| a38 | Raboteur de Berges | C | Coup de Rame | 5✦ | ×1.85 |
| a39 | Veilleuse du Guet | UC | Lanterne du Guet | 5✦ | ×1.85 |
| a40 | Chasseur des Quais | UC | Volée de Bruine | 4✦ | ×1.7 |
| a41 | Maître des Brumes | R | Rideau de Brume | 5✦ | ×1.9 |
| a42 | Écuyère des Routes | UC | Selle Réconfortante | 4✦ | ×1.6 |
| a43 | Première Écuyère | R | Bénédiction du Chemin | 5✦ | ×1.8 |
| a44 | Guide des Dunes | R | Mirage du Désert | 5✦ | ×1.9 |
| a45 | Artiste de Fête | UC | Daguenaud | 4✦ | ×1.7 |
| a46 | Maître Jongleur | R | Carrousel de Lames | 5✦ | ×1.9 |
| a47 | Charpentier des Berges | UC | Coup d’Étrave | 4✦ | ×1.7 |
| a48 | Maître Charpentier | R | Rampe de Lancement | 5✦ | ×1.9 |
| a49 | Capitaine du Guet | R | Ronde Éclairée | 5✦ | ×1.8 |

### Les signatures des 135 monstres

#### Antre des Marées

| ID | Nom | Palier | Signature | Coût | Puissance | Brûlure |
| --- | --- | --- | --- | --- | --- | --- |
| e1 | Gobelin des Marées | C | Jet d’Écume | 3✦ | ×1.5 |  |
| e3 | Pillard des Récifs | UC | Morsure des Récifs | 3✦ | ×1.5 |  |
| e4 | Sergent des Brumes | R | Brise-Garde | 3✦ | ×1.5 |  |
| e5 | Prophète des Marées | SR | Vision Noyée | 3✦ | ×1.5 |  |
| e16 | Grand Chaman des Écumes | UR | Rituel des Écumes | 3✦ | ×1.6 | 30 % × 2 tours |
| e17 | Zikka, Chaman des Écumes | L | Songe des Profondeurs | 3✦ | ×1.6 | 35 % × 3 tours |
| e18 | Roi des Écumes | UR | Frappe Royale | 3✦ | ×1.5 |  |
| e19 | Griknir, Roi des Écumes | L | Couronne des Écumes | 3✦ | ×1.5 |  |
| e2 | Tirailleur des Récifs | C | Trait de Corail | 3✦ | ×1.5 |  |
| e10 | Veuve des Récifs | UC | Larme Salée | 3✦ | ×1.5 |  |
| e8 | Matriarche des Récifs | R | Carapace de Corail | 3✦ | ×1.5 |  |
| e7 | Moqueur des Marées | C | Chant de la Marée | 3✦ | ×1.5 |  |
| e11 | Crabe des Berges | UC | Pince de Silex | 3✦ | ×1.5 |  |
| e20 | Rôdeur des Fonds | R | Guet des Fonds | 3✦ | ×1.5 |  |
| e9 | Confesseur des Abysses | SR | Bénédiction de l’Abîme | 3✦ | ×1.5 |  |
| e6 | Avatar de l’Abîme | UR | Étreinte de l’Abîme | 3✦ | ×1.5 |  |
| e13 | Léviathan, Colère du Gouffre | L | Marée Noire | 3✦ | ×1.5 |  |
| e15 | Ancien des Berges | SR | Mur de Galet | 3✦ | ×1.5 |  |
| e21 | Protecteur des Berges | UR | Écran de Galets | 3✦ | ×1.5 |  |
| e22 | Pontos, Aîné des Berges | L | Bénédiction des Berges | 3✦ | ×1.5 |  |
| e12 | Gardien des Galets | SR | Colère Sismique | 3✦ | ×1.5 |  |
| e14 | Titan des Marées | M | Abîme Absolu | 3✦ | ×1.5 |  |
| e23 | Sirène Nouvelle | C | Berceuse des Récifs | 3✦ | ×1.5 |  |
| e24 | Chanteuse des Récifs | UC | Marée Traîtresse | 8✦ | ×1.5 |  |
| e25 | Voix du Large | R | Chant Paralysant | 6✦ | ×1.5 |  |
| e26 | Écumeuse des Récifs | SR | Écume Tranchante | 3✦ | ×1.6 |  |
| e27 | Sirène Ensorceleuse | UR | Chant Ensorceleur | 6✦ | ×2 |  |
| e28 | Méliane, Voix du Large | L | Chant du Naufrage | 7✦ | ×2 |  |
| e29 | Gardienne des Récifs | UR | Corail Vengeur | 3✦ | ×1.6 |  |
| e30 | Thalassa, Reine des Récifs | L | Colère des Récifs | 3✦ | ×1.6 | 30 % × 2 tours |

#### Forge Cendrée

| ID | Nom | Palier | Signature | Coût | Puissance | Brûlure |
| --- | --- | --- | --- | --- | --- | --- |
| f1 | Golem de Cendre | C | Poing de Cendre | 3✦ | ×1.5 |  |
| f10 | Souffleur de Braises | UC | Cendre Protectrice | 3✦ | ×1.5 |  |
| f11 | Traqueur de Suie | R | Poigne de Suie | 3✦ | ×1.5 |  |
| f16 | Mailleur de Suie | SR | Filet de Suie | 8✦ | ×1.5 |  |
| f17 | Façonneur de Cendres | UR | Tissage Ensorcelé | 6✦ | ×2 |  |
| f18 | Ombeline, Tisseuse de Suie | L | Linceul de Suie | 7✦ | ×2 |  |
| f19 | Champion de Cendre | SR | Vague de Cendres | 3✦ | ×1.6 | 30 % × 2 tours |
| f20 | Souffle Ardent | UR | Colonne de Feu | 3✦ | ×1.6 | 35 % × 2 tours |
| f21 | Calcine, Dame des Cendres | L | Fournaise de Calcine | 3✦ | ×1.6 | 35 % × 3 tours |
| f7 | Tisseur de Cendres | C | Onguent de Suie | 3✦ | ×1.5 |  |
| f3 | Écorcheur de Suie | UC | Entaille Rousse | 3✦ | ×1.5 |  |
| f8 | Foreuse d’Âmes | R | Cri de la Forge | 3✦ | ×1.5 |  |
| f13 | Seigneur des Cendres | M | Nuit de Cendres | 3✦ | ×2 |  |
| f14 | Braise Errante | C | Flammèche Errante | 3✦ | ×1.5 |  |
| f15 | Semeur de Fournaise | UC | Semence Ardente | 3✦ | ×1.5 | 25 % × 2 tours |
| f4 | Chevalier de Braise | R | Frappe de Magma | 3✦ | ×1.5 |  |
| f9 | Idole de Magma | SR | Peau de Lave | 3✦ | ×1.5 |  |
| f6 | Colosse de Magma | UR | Éruption | 3✦ | ×1.5 |  |
| f22 | Vulcain, Colosse Ardent | L | Colère de Vulcain | 3✦ | ×1.6 | 30 % × 2 tours |
| f5 | Invocateur des Foyers | SR | Fournaise Invoquée | 3✦ | ×1.5 |  |
| f23 | Maître des Foyers | UR | Gardiens Invoqués | 3✦ | ×1.5 |  |
| f12 | Gardien des Foyers | L | Fournaise Éternelle | 3✦ | ×1.5 |  |
| f2 | Gobelin des Fumées | C | Lancer de Suie | 3✦ | ×1.5 |  |
| f24 | Gobelin de Suie | UC | Poignée de Suie | 3✦ | ×1.5 |  |

#### Bosquet Profond

| ID | Nom | Palier | Signature | Coût | Puissance | Brûlure |
| --- | --- | --- | --- | --- | --- | --- |
| g1 | Rampant du Fougeron | C | Étreinte de Racines | 3✦ | ×1.5 |  |
| g3 | Sanglier de Mousse | UC | Culbute de Mousse | 3✦ | ×1.5 |  |
| g4 | Gardien des Remparts Verts | R | Fronde de Ronce | 3✦ | ×1.5 |  |
| g13 | Semeur Sylvestre | SR | Sève Éveillée | 3✦ | ×1.5 |  |
| g6 | Colosse Sylvestre | UR | Poing Séculaire | 3✦ | ×1.5 |  |
| g7 | Patriarche du Bosquet | L | Aube Foliaire | 3✦ | ×1.5 |  |
| g14 | Mycolithe | SR | Spores Vampires | 3✦ | ×1.4 | 35 % × 2 tours |
| g15 | Mycélium Vivant | UR | Filaments Rongeants | 3✦ | ×1.5 | 40 % × 2 tours |
| g16 | Mycola, Reine des Spores | L | Nuée de Spores | 3✦ | ×1.6 | 40 % × 3 tours |
| g2 | Luciole Hargneuse | C | Éclat Vif | 3✦ | ×1.5 |  |
| g5 | Prisme Vivant | SR | Rayon Prismatique | 3✦ | ×1.5 |  |
| g8 | Cœur du Bosquet | M | Racine-Monde | 3✦ | ×1.5 |  |
| g9 | Lueur Bienveillante | C | Baume Lumineux | 3✦ | ×1.5 |  |
| g12 | Bergère des Sèves | UC | Claie de Branches | 3✦ | ×1.5 |  |
| g10 | Druidesse des Sèves | R | Sève Vitale | 3✦ | ×1.5 |  |
| g11 | Oracle des Clairières | SR | Voûte de Clairière | 3✦ | ×1.5 |  |
| g17 | Dryade Radieuse | UR | Rosée Radieuse | 3✦ | ×1.5 |  |
| g18 | Adriel, Lumignole des Clairières | L | Première Clarté | 6✦ | ×1.5 |  |
| g19 | Dryade du Sous-Bois | SR | Ombre Tissée | 8✦ | ×1.5 |  |
| g20 | Rôdeuse des Sous-Bois | UR | Lames de Branchage | 3✦ | ×1.6 |  |
| g21 | Vesna, Dryade du Sous-Bois | L | Nuit des Sèves | 3✦ | ×1.6 | 30 % × 2 tours |

#### Crypte Oubliée

| ID | Nom | Palier | Signature | Coût | Puissance | Brûlure |
| --- | --- | --- | --- | --- | --- | --- |
| k1 | Rôdeur des Caveaux | C | Griffe Ténébreuse | 3✦ | ×1.5 |  |
| k3 | Fossoyeur Nocturne | UC | Coup de Bêche Noire | 3✦ | ×1.5 |  |
| k13 | Goule des Caveaux | R | Morsure Putride | 3✦ | ×1.5 |  |
| k5 | Spectre des Quais | SR | Brume Mordante | 3✦ | ×1.5 |  |
| k6 | Banshee des Caveaux | UR | Hurlement Froid | 3✦ | ×1.5 |  |
| k14 | Macha, Hurleuse des Caveaux | L | Hurlement Fatal | 3✦ | ×1.6 | 35 % × 2 tours |
| k15 | Éveillé des Caveaux | SR | Rite d’Éveil | 3✦ | ×1.5 |  |
| k16 | Liche des Caveaux | UR | Légion des Caveaux | 3✦ | ×1.5 |  |
| k7 | Archiliche des Caveaux | L | Voie du Tombeau | 3✦ | ×1.5 |  |
| k17 | La Mort, Faucheuse des Tombes | M | Fauchade Universelle | 3✦ | ×2 |  |
| k2 | Nymphe Croupie | C | Crachat Trouble | 3✦ | ×1.5 |  |
| k12 | Veilleuse de Bord | UC | Drap de Nappe | 3✦ | ×1.5 |  |
| k10 | Meneuse de Deuil | R | Deuil Martial | 3✦ | ×1.5 |  |
| k11 | Prieuse des Naufragés | SR | Eau Bénite | 3✦ | ×1.5 |  |
| k18 | Endeuillée des Flots | UR | Chagrin Noyé | 6✦ | ×2 |  |
| k19 | Ysolde, Veuve Éternelle | L | Deuil Éternel | 7✦ | ×2 |  |
| k20 | Capitaine Noyé | SR | Sabre Englouti | 3✦ | ×1.6 |  |
| k21 | Revenu des Flots | UR | Noyade Vengeresse | 3✦ | ×1.5 | 30 % × 2 tours |
| k22 | Ahab, Lord des Naufragés | L | Harpon du Naufrage | 3✦ | ×1.6 | 30 % × 2 tours |
| k9 | Servante Pâle | C | Soupir Glacé | 3✦ | ×1.5 |  |
| k8 | Ancien Naufragé | M | Abîme Remontant | 3✦ | ×1.5 |  |
| k23 | Écuyer Défunt | C | Estoc Rouillé | 3✦ | ×1.5 |  |
| k24 | Porte-Étendard Défunt | UC | Étendard Funèbre | 3✦ | ×1.5 |  |
| k4 | Chevalier Défunt | R | Frappe Rigide | 3✦ | ×1.5 |  |
| k25 | Chevalière de la Veille | SR | Vigilance Éternelle | 3✦ | ×1.6 |  |
| k26 | Paladine Défunte | UR | Égide Défunte | 3✦ | ×1.5 |  |
| k27 | Jeanne d’Arc, Chevalière de la Veille | L | Épée de l’Aube | 3✦ | ×1.6 |  |
| k28 | Chevalière du Serment | SR | Serment Brisé | 3✦ | ×1.6 |  |
| k29 | Sermenteuse Défunte | UR | Serment Rallié | 7✦ | ×1.5 |  |
| k30 | Siegfried, Chevalière du Serment Brisé | L | Lame du Serment | 3✦ | ×1.6 |  |

#### Zénith Ardent

| ID | Nom | Palier | Signature | Coût | Puissance | Brûlure |
| --- | --- | --- | --- | --- | --- | --- |
| z1 | Écuyer du Zénith | C | Estoc Brillant | 3✦ | ×1.5 |  |
| z3 | Arbalétrier Doré | UC | Carreau Doré | 3✦ | ×1.5 |  |
| z4 | Lancier Solaire | R | Lance Héliale | 3✦ | ×1.5 |  |
| z5 | Voulige d’Aube | SR | Falaise de Lumière | 3✦ | ×1.5 |  |
| z13 | Centurion Ardent | UR | Colonne Solaire | 3✦ | ×1.6 | 35 % × 2 tours |
| z7 | Héraut du Zénith | L | Sentence Solaire | 3✦ | ×1.5 |  |
| z14 | Lancière de l’Aube | UR | Perce-Aube | 3✦ | ×1.6 |  |
| z15 | Aurorine, Lance de l’Aube | L | Éclipse Montante | 3✦ | ×1.6 |  |
| z12 | Garde-Flamme | UC | Rempart Ardent | 3✦ | ×1.5 |  |
| z10 | Serre-Soleil | R | Aile du Matin | 3✦ | ×1.5 |  |
| z8 | Astre Capiteux | M | Couronnement | 3✦ | ×1.5 |  |
| z2 | Souffle-Mèche | C | Étincelle | 3✦ | ×1.5 |  |
| z16 | Essor de Flammes | UC | Envol Incandescent | 3✦ | ×1.5 | 25 % × 2 tours |
| z17 | Oiseau de Feu | R | Rafale de Braise | 3✦ | ×1.5 | 30 % × 2 tours |
| z18 | Cendre d’Éclosion | SR | Éclosion Ardente | 3✦ | ×1.5 | 30 % × 2 tours |
| z6 | Phénix du Zénith | UR | Pluie de Feu | 3✦ | ×1.5 |  |
| z19 | Pyrrha, Cendre Éternelle | L | Renaissance Pyrique | 3✦ | ×1.6 | 30 % × 2 tours |
| z20 | Plume Miroir | SR | Plumage Miroir | 6✦ | ×1.5 |  |
| z21 | Phénix Miroir | UR | Renvoi Céleste | 6✦ | ×1.5 |  |
| z22 | Fjalar, Phénix du Renvoi | L | Immolation Retournée | 7✦ | ×2 |  |
| z9 | Chantre du Zénith | C | Hymne du Matin | 3✦ | ×1.5 |  |
| z23 | Chapelain du Jour | UC | Aube Bénie | 3✦ | ×1.5 |  |
| z24 | Diacre du Plein Jour | R | Office du Matin | 3✦ | ×1.5 |  |
| z11 | Prêtresse du Plein Jour | SR | Bénédiction Solaire | 3✦ | ×1.5 |  |
| z25 | Cantatrice du Zénith | UR | Hymne du Zénith | 7✦ | ×1.5 |  |
| z26 | Célestin, Apôtre du Chant | L | Cantique Final | 3✦ | ×1.5 |  |
| z27 | Inquisitrice du Jour | SR | Colonne de Purge | 6✦ | ×2 |  |
| z28 | Justicière du Jour | UR | Verdict Solaire | 3✦ | ×1.6 |  |
| z29 | Justine, Justicière du Jour | L | Peine Capitale | 3✦ | ×1.6 |  |
| z30 | Apolline, Prophétesse du Jour | M | Prophétie du Plein Jour | 3✦ | ×1.6 | 30 % × 2 tours |

### Les signatures des 18 divines

| ID | Nom | Palier | Signature | Coût | Puissance |
| --- | --- | --- | --- | --- | --- |
| d1 | Garde du Seuil | C | Interdiction | 3✦ | ×1.5 |
| d2 | Servante du Sablier | C | Sable Glissant | 8✦ | ×1.5 |
| d3 | Huissier de l’Entre-Deux | UC | Sentence Lente | 6✦ | ×1.5 |
| d4 | Juge des Heures | R | Balance du Temps | 5✦ | ×1.8 |
| d5 | Maître des Sabliers | SR | Sablier Ensorcelé | 6✦ | ×2 |
| d6 | Kairos, Arbitre du Seuil | L | Arrêt du Temps | 7✦ | ×2 |
| d7 | Lame Miroir | C | Frappe Réfléchie | 3✦ | ×1.5 |
| d8 | Choriste Miroir | UC | Voix Doubles | 4✦ | ×1.6 |
| d9 | Prisme du Chœur | R | Reflet Protecteur | 3✦ | ×1.5 |
| d10 | Miroir Antiphonique | SR | Chant Miroir | 6✦ | ×1.5 |
| d11 | Chef du Chœur | UR | Renvoi en Chœur | 6✦ | ×1.5 |
| d12 | Écho, Voix Miroir | L | Refrain Éternel | 6✦ | ×2 |
| d13 | Fileuse du Pont | C | Fil Tendu | 3✦ | ×1.5 |
| d14 | Aiguille du Pont | UC | Point Serré | 3✦ | ×1.5 |
| d15 | Brodeuse des Liens | R | Point de Croix | 5✦ | ×1.8 |
| d16 | Tisseuse des Nœuds | SR | Nœud d’Or | 6✦ | ×1.5 |
| d17 | Architecte du Pont | UR | Deux Rives | 5✦ | ×1.5 |
| d18 | Ananké, Tisseuse du Pont | L | Destin Tissé | 6✦ | ×2 |

## Les Pouvoirs (effets automatiques, sans mana)

À chaque action, certaines cartes déclenchent en plus un effet automatique : soin, bouclier, invocation, étourdissement, lenteur, malédiction, copie, renvoi, lien, résurrection, cri de guerre. Les trois familles divines vivent surtout par leurs Pouvoirs (le Chœur copie les sorts adverses, les Arbitres figent le temps, les Tisseuses lient les alliés). Le détail par carte figure dans `inventaire-cartes.md`.

| Effet | Nombre de cartes |
| --- | --- |
| heal | 31 |
| shield | 19 |
| summon | 9 |
| stun | 6 |
| atkBuff | 5 |
| curse | 5 |
| slow | 4 |
| reflect | 4 |
| link | 3 |
| warcry | 2 |
| copy | 2 |
| revive | 1 |

S'y ajoutent 10 gimmicks uniques (auras et effets de boss : la ronde du Capitaine du Guet, le rituel de la Matriarche des Récifs, etc.).

## Le mana, par palier

| Palier (familiales) | Mana max | Régénération par action |
| --- | --- | --- |
| C | 8 | +2 |
| UC | 11 | +3 |
| R | 14 | +3 |
| SR | 22 | +5 |
| UR | 30 | +6 |
| L | 40 | +8 |
| undefined | 10 | +2 |

Naissances, solos, monstres et divines : réserve fixe de **10 mana (+2 par action)**. Une incantation vide la réserve ; l'auto-battle lance le sort le plus cher payable et épargne si son gros sort est proche.

## Qui acquiert quoi, quand

| Quand | Quoi |
| --- | --- |
| À l'obtention d'une carte | son commun, plus ses sorts propres selon son type : race + classe + signature pour une naissance, classe + signature pour un solo, signature pour un monstre ou une divine, et 1 sort de lignée par palier pour une familiale |
| À chaque évolution (niveau 10 + éclats) | la forme supérieure apprend son sort de lignée (familiales) ou sa nouvelle signature (monstres, divines) et **l'exemplaire garde tous les sorts de ses formes passées** (cumul) |
| Coût d'évolution | C→UC : 3 éclats bruts · UC→R : 2 polis · R→SR : 4 polis · SR→UR : 2 gravés · UR→L : 4 gravés · L→M : 10 éternels, dans l'élément de la carte (le novice sans élément paie dans l'élément de sa voie) |

Le détail palier par palier et les chronologies d'exemplaires : `arbres-sorts.md`. L'audit du cumul (et de sa duplication) : `audit-sorts.md`.
