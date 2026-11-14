# Tableau des monstres

> GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.

**198 monstres** (data/monsters.json), par donjon. La classe determine les memes regles que les cartes (esquive, frappe a l'arriere).

## Donjon bosquet (30)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g1 | Rampant du Fougeron | C | Assassin | Nature | - | 8 | 58 | 7 | 3 | Étreinte de Racines | - |
| g10 | Druidesse des Sèves | R | Mage | Nature | - | 3 | 78 | 2 | 17 | Sève Vitale | summon 0.5 |
| g11 | Oracle des Clairières | SR | Prêtre | Lumière | - | 11 | 68 | 6 | 9 | Voûte de Clairière | shield 38 |
| g12 | Bergère des Sèves | UC | Prêtre | Nature | - | 9 | 54 | 5 | 7 | Claie de Branches | shield 18 |
| g13 | Semeur Sylvestre | SR | Mage | Nature | - | 21 | 73 | 11 | 24 | Sève Éveillée | summon 0.6 |
| g14 | Mycolithe | SR | Occultiste | Nature | - | 20 | 66 | 10 | 16 | Spores Vampires | - |
| g15 | Mycélium Vivant | UR | Occultiste | Nature | - | 28 | 80 | 14 | 22 | Filaments Rongeants | - |
| g16 | Mycola, Reine des Spores | L | Occultiste | Nature | - | 37 | 100 | 19 | 30 | Nuée de Spores | - |
| g17 | Dryade Radieuse | UR | Prêtre | Lumière | - | 13 | 76 | 7 | 10 | Rosée Radieuse | heal 48 |
| g18 | Adriel, Lumignole des Clairières | L | Prêtre | Lumière | - | 14 | 92 | 7 | 11 | Première Clarté | revive 0.6 |
| g19 | Dryade du Sous-Bois | SR | Occultiste | Ombre | - | 11 | 64 | 6 | 9 | Ombre Tissée | slow |
| g2 | Luciole Hargneuse | C | Mage | Lumière | - | 9 | 55 | 5 | 10 | Éclat Vif | - |
| g20 | Rôdeuse des Sous-Bois | UR | Assassin | Ombre | - | 29 | 76 | 26 | 12 | Lames de Branchage | - |
| g21 | Vesna, Dryade du Sous-Bois | L | Assassin | Ombre | - | 38 | 96 | 34 | 15 | Nuit des Sèves | - |
| g3 | Sanglier de Mousse | UC | Guerrier | Nature | - | 11 | 54 | 8 | 4 | Culbute de Mousse | - |
| g31 | Gobelin des Mousses | C | Assassin | Nature | - | 8 | 56 | 7 | 3 | Griffe de Mousse | - |
| g32 | Gobelin des Racines | UC | Guerrier | Nature | - | 11 | 54 | 8 | 4 | Coup de Racine | - |
| g33 | Fée des Groves | R | Mage | Nature | - | 15 | 78 | 8 | 17 | Lueur des Groves | - |
| g34 | Fée des Jeux | SR | Mage | Nature | - | 18 | 73 | 9 | 24 | Rire Enchanté | - |
| g35 | Souveraine des Jeux | UR | Occultiste | Nature | - | 13 | 82 | 7 | 10 | Danse des Fées | - |
| g36 | Mab, Souveraine des Jeux | L | Occultiste | Nature | - | 15 | 94 | 8 | 12 | Royaume des Jeux | - |
| g37 | Fée des Ronces | SR | Mage | Nature | - | 18 | 73 | 9 | 24 | Épines Vives | - |
| g38 | Reine des Ronces | UR | Occultiste | Nature | - | 13 | 82 | 7 | 10 | Couronne d’Épines | - |
| g39 | Aubépine, Reine des Ronces | L | Occultiste | Nature | - | 15 | 94 | 8 | 12 | Souveraineté des Ronces | - |
| g4 | Gardien des Remparts Verts | R | Guerrier | Nature | - | 14 | 74 | 10 | 6 | Fronde de Ronce | - |
| g5 | Prisme Vivant | SR | Mage | Lumière | - | 21 | 73 | 11 | 24 | Rayon Prismatique | - |
| g6 | Colosse Sylvestre | UR | Guerrier | Nature | - | 29 | 82 | 20 | 12 | Poing Séculaire | - |
| g7 | Patriarche du Bosquet | L | Guerrier | Lumière | - | 40 | 104 | 28 | 16 | Aube Foliaire | - |
| g8 | Cœur du Bosquet | M | Guerrier | Nature | - | 53 | 146 | 37 | 21 | Racine-Monde | - |
| g9 | Lueur Bienveillante | C | Prêtre | Lumière | - | 8 | 50 | 4 | 6 | Baume Lumineux | heal 15 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Bêtes du Fougeron | g1 -> g3 -> g4 ; g13 -> g6 -> g7 ; g14 -> g15 -> g16 | g2, g5 | g8 |
| Dryades | g9 -> g12 -> g10 ; g11 -> g17 -> g18 ; g19 -> g20 -> g21 | - | - |
| Gobelins des Mousses | g31 -> g32 | - | - |
| Fées | g33 -> g34 -> g35 -> g36 ; g37 -> g38 -> g39 | - | - |

## Donjon crypte (40)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| k1 | Rôdeur des Caveaux | C | Assassin | Ombre | - | 9 | 50 | 8 | 4 | Griffe Ténébreuse | - |
| k10 | Meneuse de Deuil | R | Assassin | Ombre | - | 5 | 56 | 5 | 2 | Deuil Martial | atkBuff 0.18 |
| k11 | Prieuse des Naufragés | SR | Prêtre | Eau | - | 11 | 66 | 6 | 9 | Eau Bénite | heal 42 |
| k12 | Veilleuse de Bord | UC | Prêtre | Eau | - | 9 | 52 | 5 | 7 | Drap de Nappe | shield 17 |
| k13 | Goule des Caveaux | R | Assassin | Ombre | - | 15 | 72 | 14 | 6 | Morsure Putride | - |
| k14 | Macha, Hurleuse des Caveaux | L | Occultiste | Ombre | - | 40 | 100 | 20 | 32 | Hurlement Fatal | - |
| k15 | Éveillé des Caveaux | SR | Occultiste | Ombre | - | 11 | 66 | 6 | 9 | Rite d’Éveil | summon 0.5 |
| k16 | Liche des Caveaux | UR | Occultiste | Ombre | - | 13 | 72 | 7 | 10 | Légion des Caveaux | summon 0.6 |
| k17 | La Mort, Faucheuse des Tombes | M | Assassin | Ombre | - | 55 | 150 | 50 | 22 | Fauchade Universelle | - |
| k18 | Endeuillée des Flots | UR | Occultiste | Ombre | - | 13 | 74 | 7 | 10 | Chagrin Noyé | curse 0.25 |
| k19 | Ysolde, Veuve Éternelle | L | Occultiste | Ombre | - | 14 | 90 | 7 | 11 | Deuil Éternel | stun |
| k2 | Nymphe Croupie | C | Mage | Eau | - | 8 | 55 | 4 | 10 | Crachat Trouble | - |
| k20 | Capitaine Noyé | SR | Guerrier | Eau | - | 22 | 70 | 15 | 9 | Sabre Englouti | - |
| k21 | Revenu des Flots | UR | Occultiste | Eau | - | 28 | 84 | 14 | 22 | Noyade Vengeresse | - |
| k22 | Ahab, Lord des Naufragés | L | Guerrier | Eau | - | 40 | 106 | 28 | 16 | Harpon du Naufrage | - |
| k23 | Écuyer Défunt | C | Guerrier | Ombre | - | 8 | 60 | 6 | 3 | Estoc Rouillé | - |
| k24 | Porte-Étendard Défunt | UC | Guerrier | Ombre | - | 12 | 54 | 8 | 5 | Étendard Funèbre | - |
| k25 | Chevalière de la Veille | SR | Guerrier | Ombre | - | 20 | 72 | 14 | 8 | Vigilance Éternelle | - |
| k26 | Paladine Défunte | UR | Prêtre | Lumière | - | 13 | 74 | 7 | 10 | Égide Défunte | shield 50 |
| k27 | Jeanne d’Arc, Chevalière de la Veille | L | Guerrier | Lumière | - | 39 | 108 | 27 | 16 | Épée de l’Aube | - |
| k28 | Chevalière du Serment | SR | Assassin | Ombre | - | 21 | 68 | 19 | 8 | Serment Brisé | - |
| k29 | Sermenteuse Défunte | UR | Occultiste | Ombre | - | 13 | 72 | 7 | 10 | Serment Rallié | warcry 0.2 |
| k3 | Fossoyeur Nocturne | UC | Guerrier | Ombre | - | 12 | 52 | 8 | 5 | Coup de Bêche Noire | - |
| k30 | Siegfried, Chevalière du Serment Brisé | L | Assassin | Ombre | - | 40 | 98 | 36 | 16 | Lame du Serment | - |
| k31 | Gobelin des Caveaux | C | Assassin | Ombre | - | 9 | 50 | 8 | 4 | Griffe des Ténèbres | - |
| k32 | Gobelin des Ossements | UC | Guerrier | Ombre | - | 12 | 52 | 8 | 5 | Coup d'Os | - |
| k33 | Serpent des Récifs | UC | Assassin | Ombre | - | 11 | 52 | 10 | 4 | Morsure des Écueils | - |
| k34 | Fileuse du Regard | R | Assassin | Ombre | - | 15 | 62 | 14 | 6 | Fil du Regard | - |
| k35 | Pétrifiante des Écueils | SR | Occultiste | Ombre | - | 11 | 72 | 6 | 9 | Regard de Pierre | - |
| k36 | Gorgonne Immaculée | UR | Occultiste | Ombre | - | 13 | 82 | 7 | 10 | Cheveux de Serpents | - |
| k37 | Méduse, Reine des Écueils | L | Occultiste | Ombre | - | 15 | 94 | 8 | 12 | Pétrification | - |
| k38 | Mère des Serpents | SR | Assassin | Ombre | - | 18 | 68 | 16 | 7 | Nid de Serpents | - |
| k39 | Grande Serpentine | UR | Assassin | Ombre | - | 22 | 76 | 20 | 9 | Constriction | - |
| k4 | Chevalier Défunt | R | Guerrier | Ombre | - | 15 | 72 | 11 | 6 | Frappe Rigide | - |
| k40 | Euryale, Nourrice des Serpents | L | Assassin | Ombre | - | 26 | 88 | 23 | 10 | Morsure des Sœurs | - |
| k5 | Spectre des Quais | SR | Mage | Eau | - | 21 | 73 | 11 | 24 | Brume Mordante | - |
| k6 | Banshee des Caveaux | UR | Mage | Ombre | - | 30 | 85 | 15 | 30 | Hurlement Froid | - |
| k7 | Archiliche des Caveaux | L | Occultiste | Ombre | - | 38 | 104 | 19 | 30 | Voie du Tombeau | summon 0.7 |
| k8 | Ancien Naufragé | M | Mage | Eau | - | 54 | 148 | 27 | 43 | Abîme Remontant | - |
| k9 | Servante Pâle | C | Prêtre | Ombre | - | 8 | 48 | 4 | 6 | Soupir Glacé | heal 14 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Spectres des Caveaux | k1 -> k3 -> k13 ; k5 -> k6 -> k14 ; k15 -> k16 -> k7 | - | k17 |
| Les Naufragés | k2 -> k12 -> k10 ; k11 -> k18 -> k19 ; k20 -> k21 -> k22 | k9 | k8 |
| Chevalerie Défunte | k23 -> k24 -> k4 ; k25 -> k26 -> k27 ; k28 -> k29 -> k30 | - | - |
| Gobelins des Caveaux | k31 -> k32 | - | - |
| Gorgones | k33 -> k34 -> k35 -> k36 -> k37 ; k38 -> k39 -> k40 | - | - |

## Donjon divin (40)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| d1 | Garde du Seuil | C | Guerrier | Lumière | - | 8 | 60 | 6 | 3 | Interdiction | - |
| d10 | Miroir Antiphonique | SR | Occultiste | Eau | - | 11 | 66 | 6 | 9 | Chant Miroir | copy |
| d11 | Chef du Chœur | UR | Prêtre | Eau | - | 13 | 74 | 7 | 10 | Renvoi en Chœur | reflect 0.3 |
| d12 | Écho, Voix Miroir | L | Occultiste | Eau | - | 14 | 92 | 7 | 11 | Refrain Éternel | copy |
| d13 | Fileuse du Pont | C | Assassin | Nature | - | 8 | 58 | 7 | 3 | Fil Tendu | - |
| d14 | Aiguille du Pont | UC | Prêtre | Nature | - | 9 | 54 | 5 | 7 | Point Serré | shield 17 |
| d15 | Brodeuse des Liens | R | Assassin | Nature | - | 15 | 70 | 14 | 6 | Point de Croix | - |
| d16 | Tisseuse des Nœuds | SR | Occultiste | Nature | - | 11 | 66 | 6 | 9 | Nœud d’Or | link |
| d17 | Architecte du Pont | UR | Prêtre | Nature | - | 13 | 74 | 7 | 10 | Deux Rives | link |
| d18 | Ananké, Tisseuse du Pont | L | Occultiste | Nature | - | 14 | 92 | 7 | 11 | Destin Tissé | link |
| d19 | Démon du Désir | UC | Assassin | Ombre | - | 11 | 52 | 10 | 4 | Frôlement du Vice | - |
| d2 | Servante du Sablier | C | Occultiste | Lumière | - | 8 | 50 | 4 | 6 | Sable Glissant | slow |
| d20 | Succube | R | Occultiste | Ombre | - | 10 | 66 | 5 | 8 | Regard de Luxure | curse 0.25 |
| d21 | Grande Succube | SR | Occultiste | Ombre | - | 11 | 72 | 6 | 9 | Haleine du Gouffre | slow |
| d22 | Dame du Désir | UR | Occultiste | Ombre | - | 13 | 82 | 7 | 10 | Charme de l’Abysse | curse 0.25 |
| d23 | Asmodia, Reine du Désir | L | Occultiste | Ombre | - | 15 | 94 | 8 | 12 | Extase Interdite | curse 0.25 |
| d24 | Démon des Fosses | UC | Guerrier | Ombre | - | 10 | 66 | 7 | 4 | Grondement des Fosses | - |
| d25 | Démon Majeur | R | Guerrier | Ombre | - | 13 | 72 | 9 | 5 | Coup des Fosses | - |
| d26 | Seigneur Démon | SR | Guerrier | Ombre | - | 16 | 80 | 11 | 6 | Cri de Fureur | stun |
| d27 | Prince Démon | UR | Guerrier | Ombre | - | 20 | 88 | 14 | 8 | Terreur Majeure | curse 0.25 |
| d28 | Belzébuth, Roi des Démons | L | Guerrier | Ombre | - | 24 | 100 | 17 | 10 | Sceptre du Jugement | stun |
| d29 | Gouffre des Vices | R | Occultiste | Ombre | - | 10 | 66 | 5 | 8 | Gouffre Murmurant | slow |
| d3 | Huissier de l’Entre-Deux | UC | Occultiste | Lumière | - | 9 | 54 | 5 | 7 | Sentence Lente | stun |
| d30 | Grand Gouffre | SR | Occultiste | Ombre | - | 11 | 72 | 6 | 9 | Souffle des Vices | - |
| d31 | Gueule de l’Abysse | UR | Occultiste | Ombre | - | 13 | 82 | 7 | 10 | Morsure du Gouffre | - |
| d32 | Famine | L | Occultiste | Ombre | - | 15 | 94 | 8 | 12 | Dévoration Totale | - |
| d33 | Fléau Démoniaque | R | Occultiste | Ombre | - | 10 | 66 | 5 | 8 | Écho des Fosses | - |
| d34 | Grand Fléau | SR | Occultiste | Ombre | - | 11 | 72 | 6 | 9 | Rugissement du Fléau | - |
| d35 | Porte-Peste | UR | Occultiste | Ombre | - | 13 | 82 | 7 | 10 | Voix de l’Abysse | - |
| d36 | Peste, Mère des Fléaux | L | Occultiste | Ombre | - | 15 | 94 | 8 | 12 | Souffle Noir | curse 0.25 |
| d37 | Ange Ardent | R | Guerrier | Feu | - | 13 | 72 | 9 | 5 | Éclat Dévoyé | - |
| d38 | Ange du Zénith | SR | Guerrier | Lumière | - | 16 | 80 | 11 | 6 | Zénith Fêlé | slow |
| d39 | Astre Vaillant | UR | Guerrier | Lumière | - | 20 | 88 | 14 | 8 | Voûte Renversée | - |
| d4 | Juge des Heures | R | Mage | Lumière | - | 15 | 78 | 8 | 17 | Balance du Temps | - |
| d40 | Astre Rayonnant | L | Prêtre | Lumière | - | 14 | 94 | 7 | 11 | Lumière Noire | - |
| d5 | Maître des Sabliers | SR | Occultiste | Lumière | - | 11 | 66 | 6 | 9 | Sablier Ensorcelé | curse 0.25 |
| d6 | Kairos, Arbitre du Seuil | L | Occultiste | Lumière | - | 14 | 92 | 7 | 11 | Arrêt du Temps | stun |
| d7 | Lame Miroir | C | Assassin | Eau | - | 9 | 46 | 8 | 4 | Frappe Réfléchie | - |
| d8 | Choriste Miroir | UC | Mage | Eau | - | 12 | 68 | 6 | 13 | Voix Doubles | - |
| d9 | Prisme du Chœur | R | Prêtre | Eau | - | 10 | 60 | 5 | 8 | Reflet Protecteur | shield 22 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Arbitres du Seuil | d1 -> d2 -> d3 ; d4 -> d5 -> d6 | - | - |
| Chœur Miroir | d7 -> d9 ; d10 -> d11 -> d12 | - | - |
| Tisseuses du Pont | d13 -> d15 ; d16 -> d17 -> d18 | - | - |
| La Chair (camp démon) | d19 -> d20 -> d21 -> d22 -> d23 ; d29 -> d30 -> d31 -> d32 | - | - |
| La Puissance (camp démon) | d24 -> d25 -> d26 -> d27 -> d28 ; d33 -> d34 -> d35 -> d36 | - | - |
| Les Dévoyés (camp ange) | d37 -> d38 -> d39 -> d40 | - | - |

## Donjon forge (24)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| f1 | Golem de Cendre | C | Guerrier | Feu | - | 8 | 62 | 6 | 3 | Poing de Cendre | - |
| f10 | Souffleur de Braises | UC | Prêtre | Feu | - | 9 | 52 | 5 | 7 | Cendre Protectrice | shield 16 |
| f11 | Traqueur de Suie | R | Assassin | Ombre | - | 15 | 70 | 14 | 6 | Poigne de Suie | - |
| f12 | Gardien des Foyers | L | Mage | Feu | - | 39 | 93 | 20 | 40 | Fournaise Éternelle | summon 0.7 |
| f13 | Seigneur des Cendres | M | Assassin | Ombre | - | 54 | 142 | 49 | 22 | Nuit de Cendres | - |
| f14 | Braise Errante | C | Mage | Feu | - | 8 | 55 | 4 | 10 | Flammèche Errante | - |
| f15 | Semeur de Fournaise | UC | Mage | Feu | - | 11 | 68 | 6 | 13 | Semence Ardente | - |
| f16 | Mailleur de Suie | SR | Occultiste | Ombre | - | 11 | 64 | 6 | 9 | Filet de Suie | slow |
| f17 | Façonneur de Cendres | UR | Occultiste | Ombre | - | 13 | 70 | 7 | 10 | Tissage Ensorcelé | curse 0.25 |
| f18 | Ombeline, Tisseuse de Suie | L | Occultiste | Ombre | - | 14 | 84 | 7 | 11 | Linceul de Suie | stun |
| f19 | Champion de Cendre | SR | Mage | Feu | - | 22 | 73 | 11 | 24 | Vague de Cendres | - |
| f2 | Gobelin des Fumées | C | Assassin | Ombre | - | 9 | 44 | 8 | 4 | Lancer de Suie | - |
| f20 | Souffle Ardent | UR | Mage | Feu | - | 30 | 85 | 15 | 30 | Colonne de Feu | - |
| f21 | Calcine, Dame des Cendres | L | Mage | Feu | - | 38 | 93 | 19 | 40 | Fournaise de Calcine | - |
| f22 | Vulcain, Colosse Ardent | L | Guerrier | Feu | - | 40 | 112 | 28 | 16 | Colère de Vulcain | - |
| f23 | Maître des Foyers | UR | Mage | Feu | - | 5 | 85 | 3 | 30 | Gardiens Invoqués | summon 0.6 |
| f24 | Gobelin de Suie | UC | Assassin | Ombre | - | 11 | 48 | 10 | 4 | Poignée de Suie | - |
| f3 | Écorcheur de Suie | UC | Assassin | Ombre | - | 12 | 50 | 11 | 5 | Entaille Rousse | - |
| f4 | Chevalier de Braise | R | Guerrier | Feu | - | 14 | 76 | 10 | 6 | Frappe de Magma | - |
| f5 | Invocateur des Foyers | SR | Mage | Feu | - | 21 | 73 | 11 | 24 | Fournaise Invoquée | summon 0.6 |
| f6 | Colosse de Magma | UR | Guerrier | Feu | - | 30 | 90 | 21 | 12 | Éruption | - |
| f7 | Tisseur de Cendres | C | Prêtre | Ombre | - | 8 | 48 | 4 | 6 | Onguent de Suie | heal 14 |
| f8 | Foreuse d’Âmes | R | Assassin | Ombre | - | 5 | 55 | 5 | 2 | Cri de la Forge | atkBuff 0.15 |
| f9 | Idole de Magma | SR | Prêtre | Feu | - | 11 | 68 | 6 | 9 | Peau de Lave | shield 36 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Cendrels | f1 -> f10 -> f11 ; f16 -> f17 -> f18 ; f19 -> f20 -> f21 | f7, f3, f8 | f13 |
| Enfants de la Braise | f14 -> f15 -> f4 ; f9 -> f6 -> f22 ; f5 -> f23 -> f12 | - | - |
| Gobelin des Fumées | f2 -> f24 | - | - |

## Donjon marees (32)

| id | nom | rarete | classe | element | role | ATQ | PV | AGI | INT | sort solo | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| e1 | Gobelin des Marées | C | Guerrier | Eau | - | 8 | 58 | 6 | 3 | Jet d’Écume | - |
| e10 | Veuve des Récifs | UC | Prêtre | Eau | - | 9 | 54 | 5 | 7 | Larme Salée | heal 18 |
| e11 | Crabe des Berges | UC | Guerrier | Nature | - | 11 | 55 | 8 | 4 | Pince de Silex | - |
| e12 | Gardien des Galets | SR | Guerrier | Nature | - | 21 | 66 | 15 | 8 | Colère Sismique | - |
| e13 | Léviathan, Colère du Gouffre | L | Guerrier | Eau | - | 38 | 108 | 27 | 15 | Marée Noire | - |
| e14 | Titan des Marées | M | Guerrier | Eau | - | 52 | 145 | 36 | 21 | Abîme Absolu | - |
| e15 | Ancien des Berges | SR | Prêtre | Nature | - | 11 | 70 | 6 | 9 | Mur de Galet | shield 40 |
| e16 | Grand Chaman des Écumes | UR | Occultiste | Eau | - | 26 | 72 | 13 | 21 | Rituel des Écumes | - |
| e17 | Zikka, Chaman des Écumes | L | Occultiste | Eau | - | 35 | 98 | 18 | 28 | Songe des Profondeurs | - |
| e18 | Roi des Écumes | UR | Guerrier | Eau | - | 27 | 82 | 19 | 11 | Frappe Royale | - |
| e19 | Griknir, Roi des Écumes | L | Guerrier | Eau | - | 37 | 110 | 26 | 15 | Couronne des Écumes | - |
| e2 | Tirailleur des Récifs | C | Mage | Eau | - | 7 | 55 | 4 | 10 | Trait de Corail | - |
| e20 | Rôdeur des Fonds | R | Assassin | Eau | - | 14 | 70 | 13 | 6 | Vigie des Flots | - |
| e21 | Protecteur des Berges | UR | Guerrier | Nature | - | 5 | 78 | 4 | 2 | Écran de Galets | shield 52 |
| e22 | Pontos, Aîné des Berges | L | Prêtre | Nature | - | 14 | 88 | 7 | 11 | Bénédiction des Berges | heal 58 |
| e23 | Sirène Nouvelle | C | Occultiste | Eau | - | 8 | 48 | 4 | 6 | Berceuse des Récifs | heal 14 |
| e24 | Chanteuse des Récifs | UC | Occultiste | Eau | - | 9 | 52 | 5 | 7 | Marée Traîtresse | slow |
| e25 | Voix du Large | R | Occultiste | Eau | - | 10 | 58 | 5 | 8 | Chant Paralysant | stun |
| e26 | Écumeuse des Récifs | SR | Occultiste | Eau | - | 20 | 64 | 10 | 16 | Écume Tranchante | - |
| e27 | Sirène Ensorceleuse | UR | Occultiste | Eau | - | 13 | 68 | 7 | 10 | Chant Ensorceleur | curse 0.2 |
| e28 | Méliane, Voix du Large | L | Occultiste | Eau | - | 14 | 84 | 7 | 11 | Chant du Naufrage | stun |
| e29 | Gardienne des Récifs | UR | Guerrier | Eau | - | 27 | 80 | 19 | 11 | Corail Vengeur | - |
| e3 | Pillard des Récifs | UC | Assassin | Eau | - | 11 | 52 | 10 | 4 | Morsure des Récifs | - |
| e30 | Thalassa, Reine des Récifs | L | Assassin | Eau | - | 37 | 102 | 33 | 15 | Colère des Récifs | - |
| e31 | Hydre des Marées | L | Guerrier | Eau | - | 30 | 130 | 21 | 12 | Morsure Hydrique | - |
| e32 | Souverain des Marées | L | Guerrier | Eau | - | 34 | 150 | 24 | 14 | Couronne des Marées | - |
| e4 | Sergent des Brumes | R | Guerrier | Eau | - | 14 | 74 | 10 | 6 | Brise-Garde | - |
| e5 | Prophète des Marées | SR | Mage | Eau | - | 20 | 73 | 10 | 24 | Vision Noyée | - |
| e6 | Avatar de l’Abîme | UR | Mage | Eau | - | 28 | 85 | 14 | 30 | Étreinte de l’Abîme | - |
| e7 | Moqueur des Marées | C | Prêtre | Eau | - | 8 | 50 | 4 | 6 | Chant de la Marée | heal 15 |
| e8 | Matriarche des Récifs | R | Prêtre | Eau | - | 10 | 60 | 5 | 8 | Barrière de Corail | shield 22 |
| e9 | Confesseur des Abysses | SR | Prêtre | Eau | - | 11 | 66 | 6 | 9 | Bénédiction de l’Abîme | heal 34 |

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
| z10 | Serre-Soleil | R | Prêtre | Lumière | - | 10 | 58 | 5 | 8 | Aile du Matin | heal 24 |
| z11 | Prêtresse du Plein Jour | SR | Prêtre | Lumière | - | 11 | 68 | 6 | 9 | Bénédiction Solaire | heal 44 |
| z12 | Garde-Flamme | UC | Prêtre | Feu | - | 9 | 54 | 5 | 7 | Rempart Ardent | shield 18 |
| z13 | Centurion Ardent | UR | Mage | Feu | - | 30 | 85 | 15 | 30 | Colonne Solaire | - |
| z14 | Lancière de l’Aube | UR | Guerrier | Lumière | - | 29 | 82 | 20 | 12 | Perce-Aube | - |
| z15 | Aurorine, Lance de l’Aube | L | Assassin | Lumière | - | 39 | 96 | 35 | 16 | Éclipse Montante | - |
| z16 | Essor de Flammes | UC | Mage | Feu | - | 12 | 68 | 6 | 13 | Envol Incandescent | - |
| z17 | Oiseau de Feu | R | Mage | Feu | - | 15 | 78 | 8 | 17 | Rafale de Braise | - |
| z18 | Cendre d’Éclosion | SR | Mage | Feu | - | 21 | 73 | 11 | 24 | Éclosion Ardente | - |
| z19 | Pyrrha, Cendre Éternelle | L | Mage | Feu | - | 38 | 93 | 19 | 40 | Renaissance Pyrique | - |
| z2 | Souffle-Mèche | C | Mage | Feu | - | 9 | 55 | 5 | 10 | Étincelle | - |
| z20 | Plume Miroir | SR | Prêtre | Feu | - | 11 | 64 | 6 | 9 | Plumage Miroir | reflect 0.25 |
| z21 | Phénix Miroir | UR | Prêtre | Feu | - | 13 | 72 | 7 | 10 | Renvoi Céleste | reflect 0.3 |
| z22 | Fjalar, Phénix du Renvoi | L | Occultiste | Feu | - | 14 | 88 | 7 | 11 | Immolation Retournée | reflect 0.35 |
| z23 | Chapelain du Jour | UC | Prêtre | Lumière | - | 9 | 54 | 5 | 7 | Aube Bénie | shield 18 |
| z24 | Diacre du Plein Jour | R | Prêtre | Lumière | - | 10 | 60 | 5 | 8 | Office du Matin | heal 26 |
| z25 | Cantatrice du Zénith | UR | Prêtre | Lumière | - | 13 | 74 | 7 | 10 | Hymne du Zénith | warcry 0.2 |
| z26 | Célestin, Apôtre du Chant | L | Prêtre | Lumière | - | 14 | 92 | 7 | 11 | Cantique Final | atkBuff 0.3 |
| z27 | Inquisitrice du Jour | SR | Occultiste | Lumière | - | 11 | 66 | 6 | 9 | Colonne de Purge | curse 0.2 |
| z28 | Justicière du Jour | UR | Assassin | Lumière | - | 30 | 78 | 27 | 12 | Verdict Solaire | - |
| z29 | Justine, Justicière du Jour | L | Assassin | Lumière | - | 39 | 100 | 35 | 16 | Peine Capitale | - |
| z3 | Arbalétrier Doré | UC | Assassin | Lumière | - | 12 | 50 | 11 | 5 | Carreau Doré | - |
| z30 | Apolline, Prophétesse du Jour | M | Mage | Lumière | - | 52 | 145 | 26 | 42 | Prophétie du Plein Jour | - |
| z31 | Gobelin des Nuages | C | Assassin | Lumière | - | 9 | 50 | 8 | 4 | Dard Céleste | - |
| z32 | Gobelin du Soleil | UC | Guerrier | Feu | - | 12 | 52 | 8 | 5 | Lame Solaire | - |
| z4 | Lancier Solaire | R | Guerrier | Feu | - | 14 | 73 | 10 | 6 | Lance Héliale | - |
| z5 | Voulige d’Aube | SR | Mage | Lumière | - | 21 | 73 | 11 | 24 | Falaise de Lumière | - |
| z6 | Phénix du Zénith | UR | Mage | Feu | - | 29 | 85 | 15 | 30 | Pluie de Feu | - |
| z7 | Héraut du Zénith | L | Guerrier | Lumière | - | 41 | 103 | 29 | 16 | Sentence Solaire | - |
| z8 | Astre Capiteux | M | Mage | Lumière | - | 53 | 144 | 27 | 42 | Couronnement | - |
| z9 | Chantre du Zénith | C | Prêtre | Lumière | - | 8 | 50 | 4 | 6 | Hymne du Matin | heal 16 |

### Lignees de monstres du donjon (data/monster-families.json)

| lignee | lignes | side | mythique |
| --- | --- | --- | --- |
| Légion Solaire | z1 -> z3 -> z4 -> z5 ; z13 -> z7 ; z14 -> z15 | z12, z10 | z8 |
| Phénix Célestes | z2 -> z16 -> z17 ; z18 -> z6 -> z19 ; z20 -> z21 -> z22 | - | - |
| Clergé du Plein Jour | z9 -> z23 -> z24 -> z11 ; z25 -> z26 ; z27 -> z28 -> z29 | - | z30 |
| Gobelins Célestes | z31 -> z32 | - | - |

