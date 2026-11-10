# Tableau des cartes

> GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.

**89 cartes jouables** (data/cards.json), reparties : Assassin 26, Guerrier 17, Mage 20, Occultiste 2, Prêtre 24.

Le sort signature est le `soloSpell` ; l'effet est le champ `effect` (kind + valeur). L'element et la famille sont absents des cartes non-elementaires.

## Classe Assassin (26)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a12 | Fantôme du Sanctuaire | SR | Ombre | attaque | 22 | 60 | 18 | 13 | ombre | - | - |
| a16 | Kira, Reine des Ombres | UR | Ombre | attaque | 32 | 72 | 26 | 19 | ombre | - | - |
| a18 | Kira, Nuit Sans Fin | L | Ombre | attaque | 42 | 88 | 34 | 25 | ombre | - | - |
| a2 | Rôdeur des Ombres | C | Ombre | attaque | 10 | 45 | 8 | 6 | ombre | - | - |
| a24 | Traqueur du Bosquet | C | Terre | attaque | 10 | 46 | 8 | 6 | bosquet | - | - |
| a25 | Chasseur du Bosquet | R | Terre | attaque | 15 | 56 | 12 | 9 | bosquet | - | - |
| a26 | Prédateur Sylvestre | SR | Terre | attaque | 22 | 61 | 18 | 13 | bosquet | - | - |
| a27 | Maïa, Lame du Bosquet | UR | Terre | attaque | 32 | 72 | 26 | 19 | bosquet | - | - |
| a28 | Maïa, Déesse du Bosquet | L | Terre | attaque | 42 | 88 | 34 | 25 | bosquet | - | - |
| a31 | Guetteur Crépusculaire | UC | Ombre | attaque | 12 | 50 | 10 | 7 | ombre | - | - |
| a33 | Pisteur du Bosquet | UC | Terre | attaque | 12 | 51 | 10 | 7 | bosquet | - | - |
| a34 | Braconnier des Quais | C | Eau | attaque | 9 | 47 | 7 | 5 | - | Flèche de Brume | - |
| a36 | Éclaireur des Dunes | UC | Terre | attaque | 12 | 49 | 10 | 7 | - | Pas de Sable | - |
| a37 | Jongleur de Fête | C | Lumière | attaque | 8 | 44 | 6 | 5 | - | Bottes Cachées | - |
| a40 | Chasseur des Quais | UC | Eau | attaque | 13 | 56 | 10 | 8 | - | Volée de Bruine | - |
| a41 | Maître des Brumes | R | Eau | attaque | 17 | 66 | 14 | 10 | - | Rideau de Brume | - |
| a44 | Guide des Dunes | R | Terre | attaque | 16 | 60 | 13 | 10 | - | Mirage du Désert | - |
| a45 | Artiste de Fête | UC | Lumière | attaque | 11 | 54 | 9 | 7 | - | Daguenaud | - |
| a46 | Maître Jongleur | R | Lumière | attaque | 15 | 63 | 12 | 9 | - | Carrousel de Lames | - |
| a7 | Faucheur des Ombres | R | Ombre | attaque | 15 | 55 | 12 | 9 | ombre | - | - |
| b2 | Onyx, Fil de Nuit | SR | Ombre | attaque | 26 | 66 | 21 | 16 | ombre | - | - |
| b7 | Sylve, Écorce Vive | SR | Terre | attaque | 25 | 72 | 20 | 15 | bosquet | - | - |
| n14 | Démon | C | Ombre | attaque | 10 | 52 | 8 | 6 | - | Trait de Vice | - |
| n4 | Voleur Novice | C | - | attaque | 9 | 47 | 7 | 5 | - | Larcin Rapide | - |
| n8 | Bestiau des Ténèbres | C | - | attaque | 10 | 50 | 8 | 6 | - | Griffes Noires | - |
| s3 | Veilleur d’Acier | C | Ombre | support | 5 | 45 | 4 | 3 | - | Œil du Stratège | atkBuff 0.15 |

## Classe Guerrier (17)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a1 | Épéiste en Herbe | C | Feu | attaque | 8 | 60 | 6 | 5 | lame | - | - |
| a10 | Bretteur du Zénith | SR | Feu | attaque | 18 | 90 | 14 | 11 | lame | - | - |
| a15 | Kenji, Lame Éternelle | UR | Feu | attaque | 30 | 95 | 24 | 18 | lame | - | - |
| a17 | Kenji, Sabre Céleste | L | Feu | attaque | 40 | 105 | 32 | 24 | lame | - | - |
| a30 | Spadassin Vigilant | UC | Feu | attaque | 10 | 67 | 8 | 6 | lame | - | - |
| a38 | Raboteur de Berges | C | Eau | attaque | 10 | 62 | 8 | 6 | - | Coup de Rame | - |
| a47 | Charpentier des Berges | UC | Eau | attaque | 13 | 76 | 10 | 8 | - | Coup d’Étrave | - |
| a48 | Maître Charpentier | R | Eau | attaque | 17 | 88 | 14 | 10 | - | Rampe de Lancement | - |
| a6 | Épéiste Errant | R | Feu | attaque | 12 | 75 | 10 | 7 | lame | - | - |
| a9 | Pilier Mécanique | R | Terre | attaque | 11 | 80 | 9 | 7 | - | Charge Hydraulique | - |
| b1 | Yuki, Brise-Lame | SR | Feu | attaque | 24 | 82 | 19 | 14 | lame | - | - |
| n1 | Épéiste Novice | C | - | attaque | 8 | 55 | 6 | 5 | - | Prise de Garde | - |
| n5 | Bestiau des Eaux | C | - | attaque | 9 | 60 | 7 | 5 | - | Bruissement d’Écume | - |
| s11 | Argus, Rempart Éveillé | UR | Terre | support | 6 | 92 | 5 | 4 | bouclier | - | shield 55 |
| s12 | Argus, Forteresse Vivante | L | Terre | support | 7 | 115 | 6 | 4 | bouclier | - | shield 75 |
| s4 | Gardien-Mécanique | C | Terre | support | 2 | 55 | 2 | 1 | bouclier | - | shield 15 |
| s6 | Sentinelle d’Acier | R | Terre | support | 4 | 62 | 3 | 2 | bouclier | - | shield 25 |

## Classe Mage (20)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a11 | Sorcière des Océans | SR | Eau | attaque | 20 | 65 | 16 | 12 | eau | - | - |
| a13 | Alix, Archimage des Marées | UR | Eau | attaque | 28 | 80 | 22 | 17 | eau | - | - |
| a14 | Alix, Déesse de l’Eau | L | Eau | attaque | 38 | 100 | 30 | 23 | eau | - | - |
| a19 | Allumeur de Braises | C | Feu | attaque | 9 | 43 | 7 | 5 | braise | - | - |
| a20 | Mage de la Fournaise | R | Feu | attaque | 14 | 51 | 11 | 8 | braise | - | - |
| a21 | Invocateur de Fournaise | SR | Feu | attaque | 21 | 65 | 17 | 13 | braise | - | summon 0.6 (ttl 3) |
| a22 | Solen, Archimage de la Braise | UR | Feu | attaque | 29 | 80 | 23 | 17 | braise | - | - |
| a23 | Solen, Roi des Braises | L | Feu | attaque | 39 | 100 | 31 | 23 | braise | - | - |
| a29 | Adepte des Rivières | UC | Eau | attaque | 11 | 46 | 9 | 7 | eau | - | - |
| a32 | Veilleur de Braise | UC | Feu | attaque | 11 | 47 | 9 | 7 | braise | - | - |
| a4 | Étincelle Vive | C | Feu | attaque | 9 | 40 | 7 | 5 | - | Trait Incandescent | - |
| a5 | Apprentie des Rivières | C | Eau | attaque | 9 | 42 | 7 | 5 | eau | - | - |
| a8 | Sorcière des Rivières | R | Eau | attaque | 14 | 50 | 11 | 8 | eau | - | - |
| b3 | Naïa, Sourcéleine | SR | Eau | attaque | 22 | 76 | 18 | 13 | eau | - | - |
| b6 | Ember, Cœur de Fournaise | SR | Feu | attaque | 23 | 74 | 18 | 14 | braise | - | - |
| n10 | Enge des Brumes | C | - | attaque | 9 | 56 | 7 | 5 | - | Voile de Brume | - |
| n2 | Mage Novice | C | - | attaque | 7 | 48 | 6 | 4 | - | Étincelle d’Étude | - |
| n6 | Bestiau des Flammes | C | - | attaque | 10 | 52 | 8 | 6 | - | Souffle de Braise | - |
| n9 | Bestiau des Cieux | C | - | attaque | 9 | 54 | 7 | 5 | - | Rafale Céleste | - |
| s7 | Bastion Arcanique | SR | Terre | support | 6 | 58 | 5 | 4 | bouclier | - | atkBuff 0.25 |

## Classe Occultiste (2)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| n12 | Enge des Caveaux | C | - | attaque | 9 | 53 | 7 | 5 | - | Froid du Caveau | - |
| n15 | Éveillé du Seuil | C | - | attaque | 8 | 55 | 6 | 5 | - | Regard du Seuil | - |

## Classe Prêtre (24)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a3 | Garde-Promesse | C | Eau | attaque | 7 | 65 | 6 | 4 | - | Serment Protecteur | - |
| a35 | Palefrenière Errante | C | Terre | support | 2 | 52 | 2 | 1 | - | Litière Douce | heal 14 |
| a39 | Veilleuse du Guet | UC | Lumière | support | 3 | 54 | 2 | 2 | - | Lanterne du Guet | heal 20 |
| a42 | Écuyère des Routes | UC | Terre | support | 3 | 62 | 2 | 2 | - | Selle Réconfortante | heal 20 |
| a43 | Première Écuyère | R | Terre | support | 4 | 72 | 3 | 2 | - | Bénédiction du Chemin | heal 28 |
| a49 | Capitaine du Guet | R | Lumière | support | 4 | 66 | 3 | 2 | - | Ronde Éclairée | heal 30 |
| b4 | Aïna, Voix du Matin | SR | Lumière | support | 4 | 78 | 3 | 2 | aube | - | heal 46 |
| b5 | Roc, Épaule du Monde | SR | Terre | support | 5 | 96 | 4 | 3 | bouclier | - | shield 44 |
| n11 | Enge des Bois | C | - | support | 6 | 60 | 5 | 4 | - | Souffle des Sèves | heal 18 |
| n13 | Ange | C | Lumière | support | 6 | 58 | 5 | 4 | - | Éclat d’Aube | heal 20 |
| n3 | Prêtre Novice | C | - | support | 4 | 52 | 3 | 2 | - | Bénédiction Modeste | heal 18 |
| n7 | Bestiau du Vivant | C | - | support | 7 | 62 | 6 | 4 | - | Sève Voleuse | heal 16 |
| p1 | Ange Éveillé | UC | Lumière | support | 8 | 66 | 6 | 5 | - | Éclat d’Aube | heal 24 |
| p2 | Ange Gardien | C | Lumière | support | 6 | 58 | 5 | 4 | - | Éclat d’Aube | heal 20 |
| p3 | Pousse des Sèves | C | Terre | support | 5 | 60 | 4 | 3 | - | - | heal 16 |
| p4 | Fidèle du Jour | C | Lumière | support | 6 | 58 | 5 | 4 | - | - | heal 18 |
| s1 | Novice de l’Aube | C | Lumière | support | 3 | 50 | 2 | 2 | aube | - | heal 18 |
| s10 | Léna, Aube Éternelle | L | Lumière | support | 6 | 105 | 5 | 4 | aube | - | heal 80 |
| s13 | Servante de l’Aube | UC | Lumière | support | 3 | 55 | 2 | 2 | aube | - | heal 22 |
| s14 | Garde du Rempart | UC | Terre | support | 3 | 58 | 2 | 2 | bouclier | - | shield 20 |
| s2 | Médecin de Camp | C | Lumière | support | 2 | 48 | 2 | 1 | - | Baume Apaisant | heal 16 |
| s5 | Prêtresse de l’Aube | R | Lumière | support | 3 | 60 | 2 | 2 | aube | - | heal 26 |
| s8 | Grande Prêtresse de l’Aube | SR | Lumière | support | 4 | 70 | 3 | 2 | aube | - | heal 40 |
| s9 | Léna, Avatar de l’Aurore | UR | Lumière | support | 5 | 85 | 4 | 3 | aube | - | heal 58 |

## Familles de lignee (data/families.json)

Une famille = un chemin de cartes (steps) qui monte en rarete. `future` liste les extensions prevues par la spec v3.

| famille | nom | etapes (cartes) | future |
| --- | --- | --- | --- |
| eau | Famille de l’Eau | a5 Apprentie des Rivières -> a29 Adepte des Rivières -> a8 Sorcière des Rivières -> a11 Sorcière des Océans -> a13 Alix, Archimage des Marées -> a14 Alix, Déesse de l’Eau | - |
| lame | Famille du Sabre | a1 Épéiste en Herbe -> a30 Spadassin Vigilant -> a6 Épéiste Errant -> a10 Bretteur du Zénith -> a15 Kenji, Lame Éternelle -> a17 Kenji, Sabre Céleste | - |
| ombre | Famille de l’Ombre | a2 Rôdeur des Ombres -> a31 Guetteur Crépusculaire -> a7 Faucheur des Ombres -> a12 Fantôme du Sanctuaire -> a16 Kira, Reine des Ombres -> a18 Kira, Nuit Sans Fin | - |
| aube | Famille de l’Aube | s1 Novice de l’Aube -> s13 Servante de l’Aube -> s5 Prêtresse de l’Aube -> s8 Grande Prêtresse de l’Aube -> s9 Léna, Avatar de l’Aurore -> s10 Léna, Aube Éternelle | - |
| bouclier | Famille du Bouclier | s4 Gardien-Mécanique -> s14 Garde du Rempart -> s6 Sentinelle d’Acier -> s7 Bastion Arcanique -> s11 Argus, Rempart Éveillé -> s12 Argus, Forteresse Vivante | - |
| braise | Famille de la Braise | a19 Allumeur de Braises -> a32 Veilleur de Braise -> a20 Mage de la Fournaise -> a21 Invocateur de Fournaise -> a22 Solen, Archimage de la Braise -> a23 Solen, Roi des Braises | - |
| bosquet | Famille du Bosquet | a24 Traqueur du Bosquet -> a33 Pisteur du Bosquet -> a25 Chasseur du Bosquet -> a26 Prédateur Sylvestre -> a27 Maïa, Lame du Bosquet -> a28 Maïa, Déesse du Bosquet | - |

## Evolutions (data/evolutions.json + data/solo-steps.json)

Les cartes simples montent d'un cran (n1 -> a30...) ; les colonnes listent chaque carte et sa suivante.

| carte | evolue vers | suivante |
| --- | --- | --- |
| n1 Épéiste Novice | a30 Spadassin Vigilant | UC |
| n2 Mage Novice | a29 Adepte des Rivières | UC |
| n3 Prêtre Novice | s13 Servante de l’Aube | UC |
| n4 Voleur Novice | a31 Guetteur Crépusculaire | UC |
| a29 Adepte des Rivières | [object Object],[object Object] | - |
| a32 Veilleur de Braise | [object Object],[object Object] | - |
| n5 Bestiau des Eaux | [object Object],[object Object] | - |
| n6 Bestiau des Flammes | [object Object],[object Object],[object Object] | - |
| n7 Bestiau du Vivant | [object Object],[object Object] | - |
| n8 Bestiau des Ténèbres | [object Object],[object Object],[object Object] | - |
| n10 Enge des Brumes | [object Object] | - |
| n11 Enge des Bois | [object Object] | - |
| n12 Enge des Caveaux | [object Object],[object Object],[object Object] | - |
| n9 Bestiau des Cieux | [object Object],[object Object],[object Object] | - |
| n13 Ange | [object Object] | - |
| n14 Démon | [object Object] | - |
| n15 Éveillé du Seuil | [object Object] | - |
| a34 Braconnier des Quais | a40 Chasseur des Quais | UC |
| a40 Chasseur des Quais | a41 Maître des Brumes | R |
| a35 Palefrenière Errante | a42 Écuyère des Routes | UC |
| a42 Écuyère des Routes | a43 Première Écuyère | R |
| a36 Éclaireur des Dunes | a44 Guide des Dunes | R |
| a37 Jongleur de Fête | a45 Artiste de Fête | UC |
| a45 Artiste de Fête | a46 Maître Jongleur | R |
| a38 Raboteur de Berges | a47 Charpentier des Berges | UC |
| a47 Charpentier des Berges | a48 Maître Charpentier | R |
| a39 Veilleuse du Guet | a49 Capitaine du Guet | R |
| d3 | d4 | - |
| d9 | d10 | - |
| d15 | d16 | - |
| f3 | f8 | - |
| a3 Garde-Promesse | s14 Garde du Rempart | UC |
| a4 Étincelle Vive | a32 Veilleur de Braise | UC |
| a9 Pilier Mécanique | s7 Bastion Arcanique | SR |
| s2 Médecin de Camp | s13 Servante de l’Aube | UC |
| s3 Veilleur d’Acier | a31 Guetteur Crépusculaire | UC |

