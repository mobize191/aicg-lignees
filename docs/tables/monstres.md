# Tableau des monstres

> GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.

**159 monstres** (data/monsters.json), par donjon. La classe determine les memes regles que les cartes (esquive, frappe a l'arriere).

## Donjon bosquet (23)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g1 | Rampant du Fougeron | C | Assassin | Terre | - | 8 | 58 | 7 | 3 | Étreinte de Racines | - |
| g10 | Druidesse des Sèves | R | Mage | Terre | - | 3 | 62 | 2 | 2 | Sève Vitale | summon 0.5 |
| g11 | Oracle des Clairières | SR | Prêtre | Lumière | - | 4 | 68 | 2 | 3 | Voûte de Clairière | shield 38 |
| g12 | Bergère des Sèves | UC | Prêtre | Terre | - | 3 | 54 | 2 | 2 | Claie de Branches | shield 18 |
| g13 | Semeur Sylvestre | SR | Mage | Terre | - | 21 | 64 | 11 | 17 | Sève Éveillée | summon 0.6 |
| g14 | Mycolithe | SR | Occultiste | Terre | - | 20 | 66 | 10 | 16 | Spores Vampires | - |
| g15 | Mycélium Vivant | UR | Occultiste | Terre | - | 28 | 80 | 14 | 22 | Filaments Rongeants | - |
| g16 | Mycola, Reine des Spores | L | Occultiste | Terre | - | 37 | 100 | 19 | 30 | Nuée de Spores | - |
| g17 | Dryade Radieuse | UR | Prêtre | Lumière | - | 5 | 76 | 3 | 4 | Rosée Radieuse | heal 48 |
| g18 | Adriel, Lumignole des Clairières | L | Prêtre | Lumière | - | 6 | 92 | 3 | 5 | Première Clarté | revive 0.6 |
| g19 | Dryade du Sous-Bois | SR | Occultiste | Ombre | - | 4 | 64 | 2 | 3 | Ombre Tissée | slow |
| g2 | Luciole Hargneuse | C | Mage | Lumière | - | 9 | 45 | 5 | 7 | Éclat Vif | - |
| g20 | Rôdeuse des Sous-Bois | UR | Assassin | Ombre | - | 29 | 76 | 26 | 12 | Lames de Branchage | - |
| g21 | Vesna, Dryade du Sous-Bois | L | Assassin | Ombre | - | 38 | 96 | 34 | 15 | Nuit des Sèves | - |
| g3 | Sanglier de Mousse | UC | Guerrier | Terre | - | 11 | 54 | 8 | 4 | Culbute de Mousse | - |
| g31 | Gobelin des Mousses | C | Assassin | Terre | - | 8 | 56 | 7 | 3 | Griffe de Mousse | - |
| g32 | Gobelin des Racines | UC | Guerrier | Terre | - | 11 | 54 | 8 | 4 | Coup de Racine | - |
| g4 | Gardien des Remparts Verts | R | Guerrier | Terre | - | 14 | 74 | 10 | 6 | Fronde de Ronce | - |
| g5 | Prisme Vivant | SR | Mage | Lumière | - | 21 | 63 | 11 | 17 | Rayon Prismatique | - |
| g6 | Colosse Sylvestre | UR | Guerrier | Terre | - | 29 | 82 | 20 | 12 | Poing Séculaire | - |
| g7 | Patriarche du Bosquet | L | Guerrier | Lumière | - | 40 | 104 | 28 | 16 | Aube Foliaire | - |
| g8 | Cœur du Bosquet | M | Guerrier | Terre | - | 53 | 146 | 37 | 21 | Racine-Monde | - |
| g9 | Lueur Bienveillante | C | Prêtre | Lumière | - | 2 | 50 | 1 | 2 | Baume Lumineux | heal 15 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Bêtes du Fougeron | g1 -> g3 -> g4 ; g13 -> g6 -> g7 ; g14 -> g15 -> g16 | g2, g5 | g8 |
| Gens des Sèves | g9 -> g12 -> g10 ; g11 -> g17 -> g18 ; g19 -> g20 -> g21 | - | - |
| Gobelins des Mousses | g31 -> g32 | - | - |

## Donjon crypte (32)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| k1 | Rôdeur des Caveaux | C | Assassin | Ombre | - | 9 | 50 | 8 | 4 | Griffe Ténébreuse | - |
| k10 | Meneuse de Deuil | R | Assassin | Ombre | - | 5 | 56 | 5 | 2 | Deuil Martial | atkBuff 0.18 |
| k11 | Prieuse des Naufragés | SR | Prêtre | Eau | - | 4 | 66 | 2 | 3 | Eau Bénite | heal 42 |
| k12 | Veilleuse de Bord | UC | Prêtre | Eau | - | 3 | 52 | 2 | 2 | Drap de Nappe | shield 17 |
| k13 | Goule des Caveaux | R | Assassin | Ombre | - | 15 | 72 | 14 | 6 | Morsure Putride | - |
| k14 | Macha, Hurleuse des Caveaux | L | Occultiste | Ombre | - | 40 | 100 | 20 | 32 | Hurlement Fatal | - |
| k15 | Éveillé des Caveaux | SR | Occultiste | Ombre | - | 4 | 66 | 2 | 3 | Rite d’Éveil | summon 0.5 |
| k16 | Liche des Caveaux | UR | Occultiste | Ombre | - | 5 | 72 | 3 | 4 | Légion des Caveaux | summon 0.6 |
| k17 | La Mort, Faucheuse des Tombes | M | Assassin | Ombre | - | 55 | 150 | 50 | 22 | Fauchade Universelle | - |
| k18 | Endeuillée des Flots | UR | Occultiste | Ombre | - | 5 | 74 | 3 | 4 | Chagrin Noyé | curse 0.25 |
| k19 | Ysolde, Veuve Éternelle | L | Occultiste | Ombre | - | 6 | 90 | 3 | 5 | Deuil Éternel | stun |
| k2 | Nymphe Croupie | C | Mage | Eau | - | 8 | 52 | 4 | 6 | Crachat Trouble | - |
| k20 | Capitaine Noyé | SR | Guerrier | Eau | - | 22 | 70 | 15 | 9 | Sabre Englouti | - |
| k21 | Revenu des Flots | UR | Occultiste | Eau | - | 28 | 84 | 14 | 22 | Noyade Vengeresse | - |
| k22 | Ahab, Lord des Naufragés | L | Guerrier | Eau | - | 40 | 106 | 28 | 16 | Harpon du Naufrage | - |
| k23 | Écuyer Défunt | C | Guerrier | Ombre | - | 8 | 60 | 6 | 3 | Estoc Rouillé | - |
| k24 | Porte-Étendard Défunt | UC | Guerrier | Ombre | - | 12 | 54 | 8 | 5 | Étendard Funèbre | - |
| k25 | Chevalière de la Veille | SR | Guerrier | Ombre | - | 20 | 72 | 14 | 8 | Vigilance Éternelle | - |
| k26 | Paladine Défunte | UR | Prêtre | Lumière | - | 5 | 74 | 3 | 4 | Égide Défunte | shield 50 |
| k27 | Jeanne d’Arc, Chevalière de la Veille | L | Guerrier | Lumière | - | 39 | 108 | 27 | 16 | Épée de l’Aube | - |
| k28 | Chevalière du Serment | SR | Assassin | Ombre | - | 21 | 68 | 19 | 8 | Serment Brisé | - |
| k29 | Sermenteuse Défunte | UR | Occultiste | Ombre | - | 5 | 72 | 3 | 4 | Serment Rallié | warcry 0.2 |
| k3 | Fossoyeur Nocturne | UC | Guerrier | Ombre | - | 12 | 52 | 8 | 5 | Coup de Bêche Noire | - |
| k30 | Siegfried, Chevalière du Serment Brisé | L | Assassin | Ombre | - | 40 | 98 | 36 | 16 | Lame du Serment | - |
| k31 | Gobelin des Caveaux | C | Assassin | Ombre | - | 9 | 50 | 8 | 4 | Griffe des Ténèbres | - |
| k32 | Gobelin des Ossements | UC | Guerrier | Ombre | - | 12 | 52 | 8 | 5 | Coup d'Os | - |
| k4 | Chevalier Défunt | R | Guerrier | Ombre | - | 15 | 72 | 11 | 6 | Frappe Rigide | - |
| k5 | Spectre des Quais | SR | Mage | Eau | - | 21 | 60 | 11 | 17 | Brume Mordante | - |
| k6 | Banshee des Caveaux | UR | Mage | Ombre | - | 30 | 76 | 15 | 24 | Hurlement Froid | - |
| k7 | Archiliche des Caveaux | L | Occultiste | Ombre | - | 38 | 104 | 19 | 30 | Voie du Tombeau | summon 0.7 |
| k8 | Ancien Naufragé | M | Mage | Eau | - | 54 | 148 | 27 | 43 | Abîme Remontant | - |
| k9 | Servante Pâle | C | Prêtre | Ombre | - | 2 | 48 | 1 | 2 | Soupir Glacé | heal 14 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Spectres des Caveaux | k1 -> k3 -> k13 ; k5 -> k6 -> k14 ; k15 -> k16 -> k7 | - | k17 |
| Les Naufragés | k2 -> k12 -> k10 ; k11 -> k18 -> k19 ; k20 -> k21 -> k22 | k9 | k8 |
| Chevalerie Défunte | k23 -> k24 -> k4 ; k25 -> k26 -> k27 ; k28 -> k29 -> k30 | - | - |
| Gobelins des Caveaux | k31 -> k32 | - | - |

## Donjon divin (18)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| d1 | Garde du Seuil | C | Guerrier | Lumière | - | 8 | 60 | 6 | 3 | Interdiction | - |
| d10 | Miroir Antiphonique | SR | Occultiste | Eau | - | 4 | 66 | 2 | 3 | Chant Miroir | copy |
| d11 | Chef du Chœur | UR | Prêtre | Eau | - | 5 | 74 | 3 | 4 | Renvoi en Chœur | reflect 0.3 |
| d12 | Écho, Voix Miroir | L | Occultiste | Eau | - | 6 | 92 | 3 | 5 | Refrain Éternel | copy |
| d13 | Fileuse du Pont | C | Assassin | Terre | - | 8 | 58 | 7 | 3 | Fil Tendu | - |
| d14 | Aiguille du Pont | UC | Prêtre | Terre | - | 3 | 54 | 2 | 2 | Point Serré | shield 17 |
| d15 | Brodeuse des Liens | R | Assassin | Terre | - | 15 | 70 | 14 | 6 | Point de Croix | - |
| d16 | Tisseuse des Nœuds | SR | Occultiste | Terre | - | 4 | 66 | 2 | 3 | Nœud d’Or | link |
| d17 | Architecte du Pont | UR | Prêtre | Terre | - | 5 | 74 | 3 | 4 | Deux Rives | link |
| d18 | Ananké, Tisseuse du Pont | L | Occultiste | Terre | - | 6 | 92 | 3 | 5 | Destin Tissé | link |
| d2 | Servante du Sablier | C | Occultiste | Lumière | - | 2 | 50 | 1 | 2 | Sable Glissant | slow |
| d3 | Huissier de l’Entre-Deux | UC | Occultiste | Lumière | - | 3 | 54 | 2 | 2 | Sentence Lente | stun |
| d4 | Juge des Heures | R | Mage | Lumière | - | 15 | 72 | 8 | 12 | Balance du Temps | - |
| d5 | Maître des Sabliers | SR | Occultiste | Lumière | - | 4 | 66 | 2 | 3 | Sablier Ensorcelé | curse 0.25 |
| d6 | Kairos, Arbitre du Seuil | L | Occultiste | Lumière | - | 6 | 92 | 3 | 5 | Arrêt du Temps | stun |
| d7 | Lame Miroir | C | Assassin | Eau | - | 9 | 46 | 8 | 4 | Frappe Réfléchie | - |
| d8 | Choriste Miroir | UC | Mage | Eau | - | 12 | 50 | 6 | 10 | Voix Doubles | - |
| d9 | Prisme du Chœur | R | Prêtre | Eau | - | 3 | 60 | 2 | 2 | Reflet Protecteur | shield 22 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Arbitres du Seuil | d1 -> d2 -> d3 ; d4 -> d5 -> d6 | - | - |
| Chœur Miroir | d7 -> d8 -> d9 ; d10 -> d11 -> d12 | - | - |
| Tisseuses du Pont | d13 -> d14 -> d15 ; d16 -> d17 -> d18 | - | - |

## Donjon forge (24)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| f1 | Golem de Cendre | C | Guerrier | Feu | - | 8 | 62 | 6 | 3 | Poing de Cendre | - |
| f10 | Souffleur de Braises | UC | Prêtre | Feu | - | 3 | 52 | 2 | 2 | Cendre Protectrice | shield 16 |
| f11 | Traqueur de Suie | R | Assassin | Ombre | - | 15 | 70 | 14 | 6 | Poigne de Suie | - |
| f12 | Gardien des Foyers | L | Mage | Feu | - | 39 | 106 | 20 | 31 | Fournaise Éternelle | summon 0.7 |
| f13 | Seigneur des Cendres | M | Assassin | Ombre | - | 54 | 142 | 49 | 22 | Nuit de Cendres | - |
| f14 | Braise Errante | C | Mage | Feu | - | 8 | 46 | 4 | 6 | Flammèche Errante | - |
| f15 | Semeur de Fournaise | UC | Mage | Feu | - | 11 | 50 | 6 | 9 | Semence Ardente | - |
| f16 | Mailleur de Suie | SR | Occultiste | Ombre | - | 4 | 64 | 2 | 3 | Filet de Suie | slow |
| f17 | Façonneur de Cendres | UR | Occultiste | Ombre | - | 4 | 70 | 2 | 3 | Tissage Ensorcelé | curse 0.25 |
| f18 | Ombeline, Tisseuse de Suie | L | Occultiste | Ombre | - | 5 | 84 | 3 | 4 | Linceul de Suie | stun |
| f19 | Champion de Cendre | SR | Mage | Feu | - | 22 | 66 | 11 | 18 | Vague de Cendres | - |
| f2 | Gobelin des Fumées | C | Assassin | Ombre | - | 9 | 44 | 8 | 4 | Lancer de Suie | - |
| f20 | Souffle Ardent | UR | Mage | Feu | - | 30 | 82 | 15 | 24 | Colonne de Feu | - |
| f21 | Calcine, Dame des Cendres | L | Mage | Feu | - | 38 | 102 | 19 | 30 | Fournaise de Calcine | - |
| f22 | Vulcain, Colosse Ardent | L | Guerrier | Feu | - | 40 | 112 | 28 | 16 | Colère de Vulcain | - |
| f23 | Maître des Foyers | UR | Mage | Feu | - | 5 | 72 | 3 | 4 | Gardiens Invoqués | summon 0.6 |
| f24 | Gobelin de Suie | UC | Assassin | Ombre | - | 11 | 48 | 10 | 4 | Poignée de Suie | - |
| f3 | Écorcheur de Suie | UC | Assassin | Ombre | - | 12 | 50 | 11 | 5 | Entaille Rousse | - |
| f4 | Chevalier de Braise | R | Guerrier | Feu | - | 14 | 76 | 10 | 6 | Frappe de Magma | - |
| f5 | Invocateur des Foyers | SR | Mage | Feu | - | 21 | 64 | 11 | 17 | Fournaise Invoquée | summon 0.6 |
| f6 | Colosse de Magma | UR | Guerrier | Feu | - | 30 | 90 | 21 | 12 | Éruption | - |
| f7 | Tisseur de Cendres | C | Prêtre | Ombre | - | 2 | 48 | 1 | 2 | Onguent de Suie | heal 14 |
| f8 | Foreuse d’Âmes | R | Assassin | Ombre | - | 5 | 55 | 5 | 2 | Cri de la Forge | atkBuff 0.15 |
| f9 | Idole de Magma | SR | Prêtre | Feu | - | 4 | 68 | 2 | 3 | Peau de Lave | shield 36 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Cendrels | f1 -> f10 -> f11 ; f16 -> f17 -> f18 ; f19 -> f20 -> f21 | f7, f3, f8 | f13 |
| Enfants de la Braise | f14 -> f15 -> f4 ; f9 -> f6 -> f22 ; f5 -> f23 -> f12 | - | - |
| Gobelin des Fumées | f2 -> f24 | - | - |

## Donjon marees (30)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| e1 | Gobelin des Marées | C | Guerrier | Eau | - | 8 | 58 | 6 | 3 | Jet d’Écume | - |
| e10 | Veuve des Récifs | UC | Prêtre | Eau | - | 2 | 54 | 1 | 2 | Larme Salée | heal 18 |
| e11 | Crabe des Berges | UC | Guerrier | Terre | - | 11 | 55 | 8 | 4 | Pince de Silex | - |
| e12 | Gardien des Galets | SR | Guerrier | Terre | - | 21 | 66 | 15 | 8 | Colère Sismique | - |
| e13 | Léviathan, Colère du Gouffre | L | Guerrier | Eau | - | 38 | 108 | 27 | 15 | Marée Noire | - |
| e14 | Titan des Marées | M | Guerrier | Eau | - | 52 | 145 | 36 | 21 | Abîme Absolu | - |
| e15 | Ancien des Berges | SR | Prêtre | Terre | - | 4 | 70 | 2 | 3 | Mur de Galet | shield 40 |
| e16 | Grand Chaman des Écumes | UR | Occultiste | Eau | - | 26 | 72 | 13 | 21 | Rituel des Écumes | - |
| e17 | Zikka, Chaman des Écumes | L | Occultiste | Eau | - | 35 | 98 | 18 | 28 | Songe des Profondeurs | - |
| e18 | Roi des Écumes | UR | Guerrier | Eau | - | 27 | 82 | 19 | 11 | Frappe Royale | - |
| e19 | Griknir, Roi des Écumes | L | Guerrier | Eau | - | 37 | 110 | 26 | 15 | Couronne des Écumes | - |
| e2 | Tirailleur des Récifs | C | Mage | Eau | - | 7 | 46 | 4 | 6 | Trait de Corail | - |
| e20 | Rôdeur des Fonds | R | Assassin | Eau | - | 14 | 70 | 13 | 6 | Vigie des Flots | - |
| e21 | Protecteur des Berges | UR | Guerrier | Terre | - | 5 | 78 | 4 | 2 | Écran de Galets | shield 52 |
| e22 | Pontos, Aîné des Berges | L | Prêtre | Terre | - | 6 | 88 | 3 | 5 | Bénédiction des Berges | heal 58 |
| e23 | Sirène Nouvelle | C | Occultiste | Eau | - | 2 | 48 | 1 | 2 | Berceuse des Récifs | heal 14 |
| e24 | Chanteuse des Récifs | UC | Occultiste | Eau | - | 3 | 52 | 2 | 2 | Marée Traîtresse | slow |
| e25 | Voix du Large | R | Occultiste | Eau | - | 3 | 58 | 2 | 2 | Chant Paralysant | stun |
| e26 | Écumeuse des Récifs | SR | Occultiste | Eau | - | 20 | 64 | 10 | 16 | Écume Tranchante | - |
| e27 | Sirène Ensorceleuse | UR | Occultiste | Eau | - | 4 | 68 | 2 | 3 | Chant Ensorceleur | curse 0.2 |
| e28 | Méliane, Voix du Large | L | Occultiste | Eau | - | 5 | 84 | 3 | 4 | Chant du Naufrage | stun |
| e29 | Gardienne des Récifs | UR | Guerrier | Eau | - | 27 | 80 | 19 | 11 | Corail Vengeur | - |
| e3 | Pillard des Récifs | UC | Assassin | Eau | - | 11 | 52 | 10 | 4 | Morsure des Récifs | - |
| e30 | Thalassa, Reine des Récifs | L | Assassin | Eau | - | 37 | 102 | 33 | 15 | Colère des Récifs | - |
| e4 | Sergent des Brumes | R | Guerrier | Eau | - | 14 | 74 | 10 | 6 | Brise-Garde | - |
| e5 | Prophète des Marées | SR | Mage | Eau | - | 20 | 62 | 10 | 16 | Vision Noyée | - |
| e6 | Avatar de l’Abîme | UR | Mage | Eau | - | 28 | 78 | 14 | 22 | Étreinte de l’Abîme | - |
| e7 | Moqueur des Marées | C | Prêtre | Eau | - | 2 | 50 | 1 | 2 | Chant de la Marée | heal 15 |
| e8 | Matriarche des Récifs | R | Prêtre | Eau | - | 3 | 60 | 2 | 2 | Barrière de Corail | shield 22 |
| e9 | Confesseur des Abysses | SR | Prêtre | Eau | - | 4 | 66 | 2 | 3 | Bénédiction de l’Abîme | heal 34 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Gobelins des Écumes | e1 -> e3 -> e4 -> e5 ; e16 -> e17 ; e18 -> e19 | e2, e10, e8 | - |
| Abîmaux | e7 -> e11 -> e20 ; e9 -> e6 -> e13 ; e15 -> e21 -> e22 | e12 | e14 |
| Sirènes des Récifs | e23 -> e24 -> e25 -> e26 ; e27 -> e28 ; e29 -> e30 | - | - |

## Donjon zenith (32)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| z1 | Écuyer du Zénith | C | Guerrier | Lumière | - | 8 | 60 | 6 | 3 | Estoc Brillant | - |
| z10 | Serre-Soleil | R | Prêtre | Lumière | - | 3 | 58 | 2 | 2 | Aile du Matin | heal 24 |
| z11 | Prêtresse du Plein Jour | SR | Prêtre | Lumière | - | 4 | 68 | 2 | 3 | Bénédiction Solaire | heal 44 |
| z12 | Garde-Flamme | UC | Prêtre | Feu | - | 3 | 54 | 2 | 2 | Rempart Ardent | shield 18 |
| z13 | Centurion Ardent | UR | Mage | Feu | - | 30 | 80 | 15 | 24 | Colonne Solaire | - |
| z14 | Lancière de l’Aube | UR | Guerrier | Lumière | - | 29 | 82 | 20 | 12 | Perce-Aube | - |
| z15 | Aurorine, Lance de l’Aube | L | Assassin | Lumière | - | 39 | 96 | 35 | 16 | Éclipse Montante | - |
| z16 | Essor de Flammes | UC | Mage | Feu | - | 12 | 50 | 6 | 10 | Envol Incandescent | - |
| z17 | Oiseau de Feu | R | Mage | Feu | - | 15 | 72 | 8 | 12 | Rafale de Braise | - |
| z18 | Cendre d’Éclosion | SR | Mage | Feu | - | 21 | 66 | 11 | 17 | Éclosion Ardente | - |
| z19 | Pyrrha, Cendre Éternelle | L | Mage | Feu | - | 38 | 100 | 19 | 30 | Renaissance Pyrique | - |
| z2 | Souffle-Mèche | C | Mage | Feu | - | 9 | 46 | 5 | 7 | Étincelle | - |
| z20 | Plume Miroir | SR | Prêtre | Feu | - | 4 | 64 | 2 | 3 | Plumage Miroir | reflect 0.25 |
| z21 | Phénix Miroir | UR | Prêtre | Feu | - | 5 | 72 | 3 | 4 | Renvoi Céleste | reflect 0.3 |
| z22 | Fjalar, Phénix du Renvoi | L | Occultiste | Feu | - | 6 | 88 | 3 | 5 | Immolation Retournée | reflect 0.35 |
| z23 | Chapelain du Jour | UC | Prêtre | Lumière | - | 3 | 54 | 2 | 2 | Aube Bénie | shield 18 |
| z24 | Diacre du Plein Jour | R | Prêtre | Lumière | - | 4 | 60 | 2 | 3 | Office du Matin | heal 26 |
| z25 | Cantatrice du Zénith | UR | Prêtre | Lumière | - | 5 | 74 | 3 | 4 | Hymne du Zénith | warcry 0.2 |
| z26 | Célestin, Apôtre du Chant | L | Prêtre | Lumière | - | 6 | 92 | 3 | 5 | Cantique Final | atkBuff 0.3 |
| z27 | Inquisitrice du Jour | SR | Occultiste | Lumière | - | 4 | 66 | 2 | 3 | Colonne de Purge | curse 0.2 |
| z28 | Justicière du Jour | UR | Assassin | Lumière | - | 30 | 78 | 27 | 12 | Verdict Solaire | - |
| z29 | Justine, Justicière du Jour | L | Assassin | Lumière | - | 39 | 100 | 35 | 16 | Peine Capitale | - |
| z3 | Arbalétrier Doré | UC | Assassin | Lumière | - | 12 | 50 | 11 | 5 | Carreau Doré | - |
| z30 | Apolline, Prophétesse du Jour | M | Mage | Lumière | - | 52 | 145 | 26 | 42 | Prophétie du Plein Jour | - |
| z31 | Gobelin des Nuages | C | Assassin | Lumière | - | 9 | 50 | 8 | 4 | Dard Céleste | - |
| z32 | Gobelin du Soleil | UC | Guerrier | Feu | - | 12 | 52 | 8 | 5 | Lame Solaire | - |
| z4 | Lancier Solaire | R | Guerrier | Feu | - | 14 | 73 | 10 | 6 | Lance Héliale | - |
| z5 | Voulige d’Aube | SR | Mage | Lumière | - | 21 | 62 | 11 | 17 | Falaise de Lumière | - |
| z6 | Phénix du Zénith | UR | Mage | Feu | - | 29 | 78 | 15 | 23 | Pluie de Feu | - |
| z7 | Héraut du Zénith | L | Guerrier | Lumière | - | 41 | 103 | 29 | 16 | Sentence Solaire | - |
| z8 | Astre Capiteux | M | Mage | Feu | - | 53 | 144 | 27 | 42 | Couronnement | - |
| z9 | Chantre du Zénith | C | Prêtre | Lumière | - | 2 | 50 | 1 | 2 | Hymne du Matin | heal 16 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Légion Solaire | z1 -> z3 -> z4 -> z5 ; z13 -> z7 ; z14 -> z15 | z12, z10 | z8 |
| Phénix Célestes | z2 -> z16 -> z17 ; z18 -> z6 -> z19 ; z20 -> z21 -> z22 | - | - |
| Clergé du Plein Jour | z9 -> z23 -> z24 -> z11 ; z25 -> z26 ; z27 -> z28 -> z29 | - | z30 |
| Gobelins Célestes | z31 -> z32 | - | - |

