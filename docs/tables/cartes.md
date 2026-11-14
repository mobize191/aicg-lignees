# Tableau des cartes

> GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.

**160 cartes jouables** (data/cards.json), reparties : Assassin 40, Guerrier 28, Mage 33, Occultiste 17, Prêtre 42.

Le sort signature est le `soloSpell` ; l'effet est le champ `effect` (kind + valeur). L'element et la famille sont absents des cartes non-elementaires.

## Classe Assassin (40)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a12 | Fantôme du Sanctuaire | SR | Neutre | - | 22 | 60 | 20 | 9 | ombre | - | - |
| a16 | Kira, Reine des Ombres | UR | Neutre | - | 32 | 72 | 29 | 13 | ombre | - | - |
| a18 | Kira, Nuit Sans Fin | L | Neutre | - | 42 | 88 | 38 | 17 | ombre | - | - |
| a2 | Rôdeur des Ombres | C | Neutre | - | 10 | 45 | 9 | 4 | ombre | - | - |
| a24 | Traqueur du Bosquet | C | Neutre | - | 10 | 46 | 9 | 4 | bosquet | - | - |
| a25 | Chasseur du Bosquet | R | Neutre | - | 15 | 56 | 14 | 6 | bosquet | - | - |
| a26 | Prédateur Sylvestre | SR | Neutre | - | 22 | 61 | 20 | 9 | bosquet | - | - |
| a27 | Maïa, Lame du Bosquet | UR | Neutre | - | 32 | 72 | 29 | 13 | bosquet | - | - |
| a28 | Maïa, Déesse du Bosquet | L | Neutre | - | 42 | 88 | 38 | 17 | bosquet | - | - |
| a31 | Guetteur Crépusculaire | UC | Neutre | - | 12 | 50 | 11 | 5 | ombre | - | - |
| a33 | Pisteur du Bosquet | UC | Neutre | - | 12 | 51 | 11 | 5 | bosquet | - | - |
| a34 | Braconnier des Quais | C | Neutre | - | 9 | 47 | 8 | 4 | vol | Flèche de Brume | - |
| a36 | Éclaireur des Dunes | UC | Neutre | - | 12 | 49 | 11 | 5 | vol | Pas de Sable | - |
| a37 | Jongleur de Fête | C | Neutre | - | 8 | 44 | 7 | 3 | vol | Bottes Cachées | - |
| a40 | Chasseur des Quais | UC | Neutre | - | 13 | 56 | 12 | 5 | vol | Volée de Bruine | - |
| a41 | Maître des Brumes | R | Neutre | - | 17 | 66 | 15 | 7 | vol | Rideau de Brume | - |
| a44 | Guide des Dunes | R | Neutre | - | 16 | 60 | 14 | 6 | vol | Mirage du Désert | - |
| a45 | Artiste de Fête | UC | Neutre | - | 11 | 54 | 10 | 4 | vol | Daguenaud | - |
| a46 | Maître Jongleur | R | Neutre | - | 15 | 63 | 14 | 6 | vol | Carrousel de Lames | - |
| a7 | Faucheur des Ombres | R | Neutre | - | 15 | 55 | 14 | 6 | ombre | - | - |
| b2 | Onyx, Fil de Nuit | SR | Neutre | - | 26 | 66 | 23 | 10 | ombre | - | - |
| b7 | Sylve, Écorce Vive | SR | Neutre | - | 25 | 72 | 23 | 10 | bosquet | - | - |
| c14 | Sylve, Âme du Bosquet | L | Neutre | - | 42 | 88 | 38 | 17 | bosquet | - | - |
| c2 | Onyx, Lame Funeste | UR | Neutre | - | 32 | 72 | 29 | 13 | ombre | - | - |
| c7 | Sylve, Griffe Sylvestre | UR | Neutre | - | 32 | 72 | 29 | 13 | bosquet | - | - |
| c9 | Onyx, Ombre Éternelle | L | Neutre | - | 42 | 88 | 38 | 17 | ombre | - | - |
| n14 | Démon | C | Ombre | - | 10 | 52 | 9 | 4 | - | Trait de Vice | - |
| n4 | Voleur Novice | N | Neutre | - | 9 | 47 | 8 | 4 | - | Larcin Rapide | - |
| n8 | Embryon des Ténèbres | N | - | - | 10 | 50 | 9 | 4 | - | Griffes Noires | - |
| s3 | Veilleur d’Acier | C | Neutre | - | 5 | 45 | 5 | 2 | ombre | Œil du Stratège | atkBuff 0.15 |
| t1 | Mercenaire | C | Neutre | - | 8 | 55 | 7 | 3 | vol | Larcin Agile — geste de palier C | - |
| t2 | Pillard | UC | Neutre | - | 10 | 62 | 9 | 4 | vol | Coup de Jarnac — geste de palier UC | - |
| t3 | Brigand | R | Neutre | - | 14 | 70 | 13 | 6 | vol | Dague dans le Dos — geste de palier R | - |
| t4 | Grand Brigand | SR | Neutre | - | 20 | 78 | 18 | 8 | vol | Fauchage — geste de palier SR | - |
| t5 | Fléau des Routes | UR | Neutre | - | 27 | 88 | 24 | 11 | vol | Embuscade — geste de palier UR | - |
| t6 | Gadianton, Chef des Brigands | L | Neutre | - | 36 | 105 | 32 | 14 | vol | Coup de Grâce — geste de palier L | - |
| w13 | Fileuse du Pont | C | Neutre | - | 8 | 58 | 7 | 3 | pont | Fil Tendu | - |
| w15 | Brodeuse des Liens | R | Neutre | - | 15 | 70 | 14 | 6 | pont | Point de Croix | - |
| w21 | Gorgonne Nouvelle | C | Neutre | - | 9 | 48 | 8 | 4 | ombre | Regard Pétrifiant | - |
| w7 | Lame Miroir | C | Neutre | - | 9 | 46 | 8 | 4 | miroir | Frappe Réfléchie | - |

## Classe Guerrier (28)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a1 | Épéiste en Herbe | C | Neutre | - | 8 | 60 | 6 | 3 | lame | - | - |
| a10 | Bretteur du Zénith | SR | Neutre | - | 18 | 90 | 13 | 7 | lame | - | - |
| a15 | Kenji, Lame Éternelle | UR | Neutre | - | 30 | 95 | 21 | 12 | lame | - | - |
| a17 | Kenji, Sabre Céleste | L | Neutre | - | 40 | 105 | 28 | 16 | lame | - | - |
| a30 | Spadassin Vigilant | UC | Neutre | - | 10 | 67 | 7 | 4 | lame | - | - |
| a38 | Raboteur de Berges | C | Neutre | - | 10 | 62 | 7 | 4 | eau | Coup de Rame | - |
| a47 | Charpentier des Berges | UC | Neutre | - | 13 | 76 | 9 | 5 | eau | Coup d’Étrave | - |
| a48 | Maître Charpentier | R | Neutre | - | 17 | 88 | 12 | 7 | eau | Rampe de Lancement | - |
| a50 | Paladin | R | Neutre | - | 13 | 72 | 9 | 5 | paladin | Serment de Lumière | shield 25 |
| a51 | Paladin Sacré | SR | Neutre | - | 16 | 80 | 11 | 6 | paladin | Croisade | shield 30 |
| a52 | Paladine Sacrée | UR | Neutre | - | 20 | 88 | 14 | 8 | paladin | Égide Ardente | shield 40 |
| a53 | Isaure, Égide de l’Aube | L | Neutre | - | 24 | 100 | 17 | 10 | paladin | Égide de l’Aube | shield 60 |
| a6 | Épéiste Errant | R | Neutre | - | 12 | 75 | 8 | 5 | lame | - | - |
| a9 | Pilier Mécanique | R | Neutre | - | 11 | 80 | 8 | 4 | bouclier | Charge Hydraulique | - |
| b1 | Yuki, Brise-Lame | SR | Neutre | - | 24 | 82 | 17 | 10 | lame | - | - |
| c1 | Yuki, Lame Ardente | UR | Neutre | - | 30 | 95 | 21 | 12 | lame | - | - |
| c8 | Yuki, Sabre de l’Aurore | L | Neutre | - | 40 | 105 | 28 | 16 | lame | - | - |
| n1 | Épéiste Novice | N | Neutre | - | 8 | 55 | 6 | 3 | - | Prise de Garde | - |
| n5 | Embryon des Eaux | N | - | - | 9 | 60 | 6 | 4 | - | Bruissement d’Écume | - |
| s11 | Argus, Rempart Éveillé | UR | Neutre | - | 6 | 92 | 4 | 2 | bouclier | - | shield 55 |
| s12 | Argus, Forteresse Vivante | L | Neutre | - | 7 | 115 | 5 | 3 | bouclier | - | shield 75 |
| s15 | Chevalier | R | Neutre | - | 13 | 72 | 9 | 5 | chevalerie | Rempart Vivant | shield 25 |
| s16 | Chevalière du Rempart | SR | Neutre | - | 16 | 80 | 11 | 6 | chevalerie | Muraille | shield 30 |
| s17 | Gardienne du Rempart | UR | Neutre | - | 20 | 88 | 14 | 8 | chevalerie | Gardienne Éternelle | shield 40 |
| s18 | Kiri l’Invincible | L | Neutre | - | 24 | 100 | 17 | 10 | chevalerie | Lame Invincible | shield 60 |
| s4 | Gardien-Mécanique | C | Neutre | - | 2 | 55 | 1 | 1 | bouclier | - | shield 15 |
| s6 | Sentinelle d’Acier | R | Neutre | - | 4 | 62 | 3 | 2 | bouclier | - | shield 25 |
| w1 | Garde du Seuil | C | Neutre | - | 8 | 60 | 6 | 3 | seuil | Interdiction | - |

## Classe Mage (33)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a11 | Sorcière des Océans | SR | Neutre | - | 20 | 65 | 10 | 16 | eau | - | - |
| a13 | Alix, Archimage des Marées | UR | Neutre | - | 28 | 80 | 14 | 22 | eau | - | - |
| a14 | Alix, Déesse de l’Eau | L | Neutre | - | 38 | 100 | 19 | 30 | eau | - | - |
| a19 | Allumeur de Braises | C | Neutre | - | 9 | 43 | 5 | 7 | braise | - | - |
| a20 | Mage de la Fournaise | R | Neutre | - | 14 | 51 | 7 | 11 | braise | - | - |
| a21 | Invocateur de Fournaise | SR | Neutre | - | 21 | 65 | 11 | 17 | braise | - | summon 0.6 (ttl 3) |
| a22 | Solen, Archimage de la Braise | UR | Neutre | - | 29 | 80 | 15 | 23 | braise | - | - |
| a23 | Solen, Roi des Braises | L | Neutre | - | 39 | 100 | 20 | 31 | braise | - | - |
| a29 | Adepte des Rivières | UC | Neutre | - | 11 | 46 | 6 | 9 | eau | - | - |
| a32 | Veilleur de Braise | UC | Neutre | - | 11 | 47 | 6 | 9 | braise | - | - |
| a4 | Étincelle Vive | C | Neutre | - | 9 | 40 | 5 | 7 | braise | Trait Incandescent | - |
| a5 | Apprentie des Rivières | C | Neutre | - | 9 | 42 | 5 | 7 | eau | - | - |
| a8 | Sorcière des Rivières | R | Neutre | - | 14 | 50 | 7 | 11 | eau | - | - |
| b3 | Naïa, Sourcéleine | SR | Neutre | - | 22 | 76 | 11 | 18 | eau | - | - |
| b6 | Ember, Cœur de Fournaise | SR | Neutre | - | 23 | 74 | 12 | 18 | braise | - | - |
| c10 | Naïa, Marée Éternelle | L | Neutre | - | 38 | 100 | 19 | 30 | eau | - | - |
| c13 | Ember, Soleil Captif | L | Neutre | - | 39 | 100 | 20 | 31 | braise | - | - |
| c3 | Naïa, Source du Large | UR | Neutre | - | 28 | 80 | 14 | 22 | eau | - | - |
| c6 | Ember, Flamme Vive | UR | Neutre | - | 29 | 80 | 15 | 23 | braise | - | - |
| n10 | Enge des Brumes | N | - | - | 9 | 56 | 5 | 7 | - | Voile de Brume | - |
| n2 | Mage Novice | N | Neutre | - | 7 | 48 | 4 | 6 | - | Étincelle d’Étude | - |
| n6 | Embryon des Flammes | N | - | - | 10 | 52 | 5 | 8 | - | Souffle de Braise | - |
| n9 | Embryon des Cieux | N | - | - | 9 | 54 | 5 | 7 | - | Rafale Céleste | - |
| s7 | Bastion Arcanique | SR | Neutre | - | 6 | 58 | 3 | 5 | bouclier | - | atkBuff 0.25 |
| v1 | Apprenti Invocateur | C | Neutre | - | 8 | 55 | 4 | 6 | appel | Appel Mineur — geste de palier C | - |
| v2 | Conjurateur | UC | Neutre | - | 10 | 62 | 5 | 8 | appel | Élémentaire de Braise — geste de palier UC | - |
| v3 | Évocateur | R | Neutre | - | 14 | 70 | 7 | 11 | appel | Meute Spirituelle — geste de palier R | - |
| v4 | Maître des Esprits | SR | Neutre | - | 20 | 78 | 10 | 16 | appel | Portail — geste de palier SR | - |
| v5 | Seigneur des Élémentaires | UR | Neutre | - | 27 | 88 | 14 | 22 | appel | Légion Céleste — geste de palier UR | - |
| v6 | Archimage de l’Appel | L | Neutre | - | 36 | 105 | 18 | 29 | appel | Appel Suprême — geste de palier L | - |
| w20 | Fée Nouvelle | C | Neutre | - | 7 | 46 | 4 | 6 | bosquet | Lueur des Bois | - |
| w4 | Juge des Heures | SR | Neutre | - | 15 | 72 | 8 | 12 | seuil | Balance du Temps | - |
| w8 | Choriste Miroir | UC | Neutre | - | 12 | 50 | 6 | 10 | miroir | Voix Doubles | - |

## Classe Occultiste (17)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| n12 | Enge des Caveaux | N | - | - | 9 | 53 | 5 | 7 | - | Froid du Caveau | - |
| n15 | Éveillé du Seuil | C | - | - | 8 | 55 | 4 | 6 | - | Regard du Seuil | - |
| q1 | Novice du Crépuscule | C | Neutre | - | 8 | 55 | 4 | 6 | crepuscule | Griffe Nocturne — geste de palier C | - |
| q2 | Disciple du Crépuscule | UC | Neutre | - | 10 | 62 | 5 | 8 | crepuscule | Voile d’Ombre — geste de palier UC | - |
| q3 | Prêtre du Crépuscule | R | Neutre | - | 14 | 70 | 7 | 11 | crepuscule | Malédiction du Soir — geste de palier R | - |
| q4 | Servante du Crépuscule | SR | Neutre | - | 20 | 78 | 10 | 16 | crepuscule | Danse des Ombres — geste de palier SR | - |
| q5 | Grande Prêtresse de l’Ombre | UR | Neutre | - | 27 | 88 | 14 | 22 | crepuscule | Oubli Éternel — geste de palier UR | - |
| q6 | Vesperine, Reine de la Nuit | L | Neutre | - | 36 | 105 | 18 | 29 | crepuscule | Nuit Sans Fin — geste de palier L | - |
| w10 | Miroir Antiphonique | SR | Neutre | - | 4 | 66 | 2 | 3 | miroir | Chant Miroir | copy |
| w12 | Écho, Refrain Absolu | L | Neutre | - | 6 | 92 | 3 | 5 | miroir | Refrain Absolu | copy |
| w16 | Tisseuse des Nœuds | SR | Neutre | - | 4 | 66 | 2 | 3 | pont | Nœud d’Or | link |
| w18 | Ananké, Gardienne des Rives | L | Neutre | - | 6 | 92 | 3 | 5 | pont | Destin Gardé | link |
| w19 | Sirène Nouvelle | C | Neutre | - | 7 | 50 | 4 | 6 | eau | Berceuse des Brumes | - |
| w2 | Servante du Sablier | UC | Neutre | - | 2 | 50 | 1 | 2 | seuil | Sable Glissant | slow |
| w3 | Huissier de l’Entre-Deux | R | Neutre | - | 3 | 54 | 2 | 2 | seuil | Sentence Lente | stun |
| w5 | Maître des Sabliers | UR | Neutre | - | 4 | 66 | 2 | 3 | seuil | Sablier Ensorcelé | curse 0.25 |
| w6 | Kairos, Juge Éternel | L | Neutre | - | 6 | 92 | 3 | 5 | seuil | Sentence Éternelle | stun |

## Classe Prêtre (42)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a3 | Garde-Promesse | C | Neutre | - | 7 | 65 | 4 | 6 | bouclier | Serment Protecteur | - |
| a35 | Palefrenière Errante | C | Neutre | - | 2 | 52 | 1 | 2 | vol | Litière Douce | heal 14 |
| a39 | Veilleuse du Guet | UC | Neutre | - | 3 | 54 | 2 | 2 | bouclier | Lanterne du Guet | heal 20 |
| a42 | Écuyère des Routes | UC | Neutre | - | 3 | 62 | 2 | 2 | vol | Selle Réconfortante | heal 20 |
| a43 | Première Écuyère | R | Neutre | - | 4 | 72 | 2 | 3 | vol | Bénédiction du Chemin | heal 28 |
| a49 | Capitaine du Guet | R | Neutre | - | 4 | 66 | 2 | 3 | bouclier | Ronde Éclairée | heal 30 |
| b4 | Aïna, Voix du Matin | SR | Neutre | - | 4 | 78 | 2 | 3 | aube | - | heal 46 |
| b5 | Roc, Épaule du Monde | SR | Neutre | - | 5 | 96 | 3 | 4 | bouclier | - | shield 44 |
| c11 | Aïna, Aurore Immortelle | L | Neutre | - | 6 | 105 | 3 | 5 | aube | - | heal 80 |
| c12 | Roc, Rempart du Monde | L | Neutre | - | 7 | 115 | 4 | 6 | bouclier | - | shield 75 |
| c4 | Aïna, Chant de l’Aube | UR | Neutre | - | 5 | 85 | 3 | 4 | aube | - | heal 58 |
| c5 | Roc, Montagne Vivante | UR | Neutre | - | 6 | 92 | 3 | 5 | bouclier | - | shield 55 |
| n11 | Enge des Bois | N | - | - | 6 | 60 | 3 | 5 | - | Souffle des Sèves | heal 18 |
| n13 | Ange | C | Lumière | - | 6 | 58 | 3 | 5 | - | Éclat d’Aube | heal 20 |
| n3 | Prêtre Novice | N | Neutre | - | 4 | 52 | 2 | 3 | - | Bénédiction Modeste | heal 18 |
| n7 | Embryon du Vivant | N | - | - | 7 | 62 | 4 | 6 | - | Sève Voleuse | heal 16 |
| p1 | Jeune Séraphin | UC | Lumière | - | 8 | 66 | 4 | 6 | - | Éclat d’Aube | heal 24 |
| p2 | Ange Gardien | C | Lumière | - | 6 | 58 | 3 | 5 | aube | Éclat d’Aube | heal 20 |
| p3 | Pousse des Sèves | C | Neutre | - | 5 | 60 | 3 | 4 | bosquet | - | heal 16 |
| p4 | Fidèle du Jour | C | Neutre | - | 6 | 58 | 3 | 5 | zele | - | heal 18 |
| p5 | Séraphin, Porteur de Lumière | R | Neutre | - | 10 | 80 | 5 | 8 | seuil | Éclat du Matin | heal 40 |
| p6 | Séraphin, Archange Ultime | L | Neutre | - | 12 | 100 | 6 | 10 | seuil | Aube Éternelle | heal 60 |
| p7 | Ange de Lumière | SR | Lumière | - | 12 | 88 | 6 | 10 | seuil | Éclat d’Aile | heal 30 |
| p8 | Archange | UR | Lumière | - | 14 | 96 | 7 | 11 | seuil | Jugement Ailé | heal 30 |
| s1 | Novice de l’Aube | C | Neutre | - | 3 | 50 | 2 | 2 | aube | - | heal 18 |
| s10 | Léna, Aube Éternelle | L | Neutre | - | 6 | 105 | 3 | 5 | aube | - | heal 80 |
| s13 | Servante de l’Aube | UC | Neutre | - | 3 | 55 | 2 | 2 | aube | - | heal 22 |
| s14 | Garde du Rempart | UC | Neutre | - | 3 | 58 | 2 | 2 | bouclier | - | shield 20 |
| s2 | Médecin de Camp | C | Neutre | - | 2 | 48 | 1 | 2 | aube | Baume Apaisant | heal 16 |
| s5 | Prêtresse de l’Aube | R | Neutre | - | 3 | 60 | 2 | 2 | aube | - | heal 26 |
| s8 | Grande Prêtresse de l’Aube | SR | Neutre | - | 4 | 70 | 2 | 3 | aube | - | heal 40 |
| s9 | Léna, Avatar de l’Aurore | UR | Neutre | - | 5 | 85 | 3 | 4 | aube | - | heal 58 |
| u1 | Fidèle du Matin | C | Neutre | - | 8 | 55 | 4 | 6 | zele | Étincelle de Foi — geste de palier C | - |
| u2 | Écuyer Fervent | UC | Neutre | - | 10 | 62 | 5 | 8 | zele | Hymne du Matin — geste de palier UC | - |
| u3 | Croisé de l’Aube | R | Neutre | - | 14 | 70 | 7 | 11 | zele | Bénédiction du Jour — geste de palier R | - |
| u4 | Chapelain du Jour | SR | Neutre | - | 20 | 78 | 10 | 16 | zele | Croisade — geste de palier SR | - |
| u5 | Arbalétrier Doré | UR | Neutre | - | 27 | 88 | 14 | 22 | zele | Aurore Radieuse — geste de palier UR | - |
| u6 | Lémion, Chef de la Légion Solaire | L | Neutre | - | 36 | 105 | 18 | 29 | zele | Lumière Éternelle — geste de palier L | - |
| w11 | Chef du Chœur | UR | Neutre | - | 5 | 74 | 3 | 4 | miroir | Renvoi en Chœur | reflect 0.3 |
| w14 | Aiguille du Pont | UC | Neutre | - | 3 | 54 | 2 | 2 | pont | Point Serré | shield 17 |
| w17 | Architecte du Pont | UR | Neutre | - | 5 | 74 | 3 | 4 | pont | Deux Rives | link |
| w9 | Prisme du Chœur | R | Neutre | - | 3 | 60 | 2 | 2 | miroir | Reflet Protecteur | shield 22 |

## Familles de lignee (data/families.json)

Une famille = un chemin de cartes (steps) qui monte en rarete. `future` liste les extensions prevues par la spec v3.

| famille | nom | etapes (cartes) | future |
| --- | --- | --- | --- |
| eau | Famille de l’Eau | a5 Apprentie des Rivières -> a29 Adepte des Rivières -> a8 Sorcière des Rivières -> a11 Sorcière des Océans -> a13 Alix, Archimage des Marées -> a14 Alix, Déesse de l’Eau | a38, a47, a48, b3, c3, c10, w19 |
| lame | Famille du Sabre | a1 Épéiste en Herbe -> a30 Spadassin Vigilant -> a6 Épéiste Errant -> a10 Bretteur du Zénith -> a15 Kenji, Lame Éternelle -> a17 Kenji, Sabre Céleste | b1, c1, c8 |
| ombre | Famille de l’Ombre | a2 Rôdeur des Ombres -> a31 Guetteur Crépusculaire -> a7 Faucheur des Ombres -> a12 Fantôme du Sanctuaire -> a16 Kira, Reine des Ombres -> a18 Kira, Nuit Sans Fin | b2, s3, c2, c9, w21 |
| aube | Famille de l’Aube | s1 Novice de l’Aube -> s13 Servante de l’Aube -> s5 Prêtresse de l’Aube -> s8 Grande Prêtresse de l’Aube -> s9 Léna, Avatar de l’Aurore -> s10 Léna, Aube Éternelle | b4, p2, s2, c4, c11 |
| bouclier | Famille du Bouclier | s4 Gardien-Mécanique -> s14 Garde du Rempart -> s6 Sentinelle d’Acier -> s7 Bastion Arcanique -> s11 Argus, Rempart Éveillé -> s12 Argus, Forteresse Vivante | a3, a39, a49, a9, b5, c5, c12 |
| braise | Famille de la Braise | a19 Allumeur de Braises -> a32 Veilleur de Braise -> a20 Mage de la Fournaise -> a21 Invocateur de Fournaise -> a22 Solen, Archimage de la Braise -> a23 Solen, Roi des Braises | a4, b6, c6, c13 |
| bosquet | Famille du Bosquet | a24 Traqueur du Bosquet -> a33 Pisteur du Bosquet -> a25 Chasseur du Bosquet -> a26 Prédateur Sylvestre -> a27 Maïa, Lame du Bosquet -> a28 Maïa, Déesse du Bosquet | b7, p3, c7, c14, w20 |
| crepuscule | Famille du Crépuscule | q1 Novice du Crépuscule -> q2 Disciple du Crépuscule -> q3 Prêtre du Crépuscule -> q4 Servante du Crépuscule -> q5 Grande Prêtresse de l’Ombre -> q6 Vesperine, Reine de la Nuit | - |
| vol | Famille du Vol | t1 Mercenaire -> t2 Pillard -> t3 Brigand -> t4 Grand Brigand -> t5 Fléau des Routes -> t6 Gadianton, Chef des Brigands | a34, a35, a36, a37, a40, a41, a42, a43, a44, a45, a46 |
| zele | Famille du Zèle | u1 Fidèle du Matin -> u2 Écuyer Fervent -> u3 Croisé de l’Aube -> u4 Chapelain du Jour -> u5 Arbalétrier Doré -> u6 Lémion, Chef de la Légion Solaire | p4 |
| appel | École des Invocations | v1 Apprenti Invocateur -> v2 Conjurateur -> v3 Évocateur -> v4 Maître des Esprits -> v5 Seigneur des Élémentaires -> v6 Archimage de l’Appel | - |
| seuil | Arbitres du Seuil | w1 Garde du Seuil -> w2 Servante du Sablier -> w3 Huissier de l’Entre-Deux -> w4 Juge des Heures -> w5 Maître des Sabliers -> w6 Kairos, Juge Éternel | p5, p7, p8, p6 |
| miroir | Chœur Miroir | w7 Lame Miroir -> w8 Choriste Miroir -> w9 Prisme du Chœur -> w10 Miroir Antiphonique -> w11 Chef du Chœur -> w12 Écho, Refrain Absolu | - |
| pont | Tisseuses du Pont | w13 Fileuse du Pont -> w14 Aiguille du Pont -> w15 Brodeuse des Liens -> w16 Tisseuse des Nœuds -> w17 Architecte du Pont -> w18 Ananké, Gardienne des Rives | - |
| paladin | La voie du Paladin | a50 Paladin -> a51 Paladin Sacré -> a52 Paladine Sacrée -> a53 Isaure, Égide de l’Aube | - |
| chevalerie | La Chevalerie du Rempart | s15 Chevalier -> s16 Chevalière du Rempart -> s17 Gardienne du Rempart -> s18 Kiri l’Invincible | - |

## Evolutions (data/evolutions.json)

Les cartes a choix listent chaque voie possible ; l'evolution exige le niveau 10 et des eclats (EVO_COST).

| carte | evolue vers | voie |
| --- | --- | --- |
| n1 Épéiste Novice | a30 Spadassin Vigilant | voie du guerrier |
| n1 Épéiste Novice | s14 Garde du Rempart | voie de la protection |
| n1 Épéiste Novice | a33 Pisteur du Bosquet | voie sylvestre |
| n2 Mage Novice | a29 Adepte des Rivières | les flots — l’Eau |
| n2 Mage Novice | a32 Veilleur de Braise | la fournaise — le Feu |
| n2 Mage Novice | a33 Pisteur du Bosquet | les Sylvains — la Nature |
| n2 Mage Novice | s13 Servante de l’Aube | la lumière — l’élue de l’Aube |
| n2 Mage Novice | a31 Guetteur Crépusculaire | l’ombre — l’élue du Crépuscule |
| n2 Mage Novice | v1 Apprenti Invocateur | l’appel — Apprenti Invocateur |
| n3 Prêtre Novice | s13 Servante de l’Aube | la lumière — la foi |
| n3 Prêtre Novice | s14 Garde du Rempart | la garde — protéger les vivants |
| n3 Prêtre Novice | q1 Novice du Crépuscule | l’ombre — Novice du Crépuscule |
| n3 Prêtre Novice | u1 Fidèle du Matin | voie du zèle — Fidèle du Jour |
| n4 Voleur Novice | a31 Guetteur Crépusculaire | voie de l’assassinat |
| n4 Voleur Novice | a34 Braconnier des Quais | voie des quais |
| n4 Voleur Novice | a37 Jongleur de Fête | voie de la fête |
| n4 Voleur Novice | t1 Mercenaire | voie du vol — Mercenaire |
| a29 Adepte des Rivières | a8 Sorcière des Rivières | fidèle à l’Eau |
| a29 Adepte des Rivières | s5 Prêtresse de l’Aube | élue de la lumière — rejoint la lignée de Léna |
| a32 Veilleur de Braise | a20 Mage de la Fournaise | fidèle au Feu |
| a32 Veilleur de Braise | s5 Prêtresse de l’Aube | élue de la lumière — rejoint la lignée de Léna |
| n5 Embryon des Eaux | e3 | voie du pillage — les récifs |
| n5 Embryon des Eaux | e11 | voie des berges |
| n6 Embryon des Flammes | f3 | voie de la suie |
| n6 Embryon des Flammes | f15 | voie de la fournaise |
| n6 Embryon des Flammes | f24 | voie du goblin |
| n7 Embryon du Vivant | g3 | voie de la mousse |
| n7 Embryon du Vivant | g12 | voie des sèves |
| n8 Embryon des Ténèbres | k3 | le gouffre |
| n8 Embryon des Ténèbres | k12 | le deuil marin |
| n8 Embryon des Ténèbres | k24 | le devoir brisé |
| n10 Enge des Brumes | e24 | la forme — Sirène |
| n10 Enge des Brumes | w19 Sirène Nouvelle | la forme — Sirène Nouvelle (commune de la Crypte) |
| n11 Enge des Bois | g12 | la forme — Dryade |
| n11 Enge des Bois | w20 Fée Nouvelle | la forme — Fée Nouvelle (commune de la Crypte) |
| n12 Enge des Caveaux | k3 | la forme — le gouffre |
| n12 Enge des Caveaux | k12 | la forme — le deuil marin |
| n12 Enge des Caveaux | k24 | la forme — le devoir brisé |
| n12 Enge des Caveaux | w21 Gorgonne Nouvelle | la forme — Gorgonne Nouvelle (commune de la Crypte) |
| n9 Embryon des Cieux | z3 | la voie dorée — la Légion Solaire |
| n9 Embryon des Cieux | z16 | la voie du feu céleste — les Phénix |
| n9 Embryon des Cieux | z23 | la voie du plein jour — le Clergé |
| n13 Ange | p1 Jeune Séraphin | l’éveil du service — le Jeune Séraphin |
| n14 Démon | d19 | la voie de la chair — les succubes |
| n14 Démon | d24 | la voie de la puissance — les gouffres |
| n15 Éveillé du Seuil | d1 | la voie du Seuil — les Arbitres |
| n15 Éveillé du Seuil | d7 | la voie du Chœur Miroir — la Réflexion |
| n15 Éveillé du Seuil | d13 | la voie du Pont — le Liage |
| a34 Braconnier des Quais | e3 | la malédiction des quais |
| a17 Kenji, Sabre Céleste | a20 Mage de la Fournaise | la régression |
| a27 Maïa, Lame du Bosquet | a28 Maïa, Déesse du Bosquet | la fusion du Bosquet |
| p1 Jeune Séraphin | d6 | l’équilibre |
| p1 Jeune Séraphin | p5 Séraphin, Porteur de Lumière | la voie céleste — le Porteur de Lumière |
| p1 Jeune Séraphin | d37 | la mauvaise volonté — les anges dévoyés |
| q1 Novice du Crépuscule | q2 Disciple du Crépuscule | famille du crépuscule |
| q2 Disciple du Crépuscule | q3 Prêtre du Crépuscule | famille du crépuscule |
| q3 Prêtre du Crépuscule | q4 Servante du Crépuscule | famille du crépuscule |
| q4 Servante du Crépuscule | q5 Grande Prêtresse de l’Ombre | famille du crépuscule |
| q5 Grande Prêtresse de l’Ombre | q6 Vesperine, Reine de la Nuit | famille du crépuscule |
| t1 Mercenaire | t2 Pillard | famille du vol |
| t2 Pillard | t3 Brigand | famille du vol |
| t3 Brigand | t4 Grand Brigand | famille du vol |
| t4 Grand Brigand | t5 Fléau des Routes | famille du vol |
| t5 Fléau des Routes | t6 Gadianton, Chef des Brigands | famille du vol |
| u1 Fidèle du Matin | u2 Écuyer Fervent | famille du zèle |
| u2 Écuyer Fervent | u3 Croisé de l’Aube | famille du zèle |
| u3 Croisé de l’Aube | u4 Chapelain du Jour | famille du zèle |
| u4 Chapelain du Jour | u5 Arbalétrier Doré | famille du zèle |
| u5 Arbalétrier Doré | u6 Lémion, Chef de la Légion Solaire | famille du zèle |
| v1 Apprenti Invocateur | v2 Conjurateur | école des invocations |
| v2 Conjurateur | v3 Évocateur | école des invocations |
| v3 Évocateur | v4 Maître des Esprits | école des invocations |
| v4 Maître des Esprits | v5 Seigneur des Élémentaires | école des invocations |
| v5 Seigneur des Élémentaires | v6 Archimage de l’Appel | école des invocations |
| d19 | d20 | la chair — la voie des succubes |
| d19 | d29 | la trappe — le Gouffre des Vices |
| d20 | d21 | fidèle à la chair |
| d21 | d22 | fidèle à la chair |
| d22 | d23 | la reine du Désir |
| d29 | d30 | la trappe s’enfonce |
| d30 | d31 | la trappe s’ouvre |
| d31 | d32 | Famine, la nommée de la trappe |
| d24 | d25 | la puissance — les fosses |
| d24 | d33 | la trappe — le Fléau Démoniaque |
| d25 | d26 | fidèle à la puissance |
| d26 | d27 | fidèle à la puissance |
| d27 | d28 | Belzébuth, roi des Démons |
| d33 | d34 | le fléau grandit |
| d34 | d35 | le fléau porte la peste |
| d35 | d36 | Peste, Mère des Fléaux |
| a30 Spadassin Vigilant | a6 Épéiste Errant | fidèle au sabre |
| a30 Spadassin Vigilant | a50 Paladin | la lumière — le paladin |
| a50 Paladin | a51 Paladin Sacré | fidèle à la lumière |
| a50 Paladin | u3 Croisé de l’Aube | le zèle — Croisé de l’Aube |
| s14 Garde du Rempart | s6 Sentinelle d’Acier | fidèle au bouclier |
| s14 Garde du Rempart | s15 Chevalier | la voie du rempart — la chevalerie |
| w21 Gorgonne Nouvelle | k33 | la forme — la gorgone (lignée d’accueil de l’Enge des Caveaux) |
| w20 Fée Nouvelle | g2 | la forme — la fée (Luciole, lignée d’accueil de l’Enge des Bois) |
| g2 | g33 | la fée grandit — les Groves |

## Soudures solos (data/solo-steps.json)

Les solos sans voie montent d'un cran au palier indique.

| carte | evolue vers | rarete |
| --- | --- | --- |
| n1 Épéiste Novice | a30 Spadassin Vigilant | UC |
| n2 Mage Novice | a29 Adepte des Rivières | UC |
| n3 Prêtre Novice | s13 Servante de l’Aube | UC |
| n4 Voleur Novice | a31 Guetteur Crépusculaire | UC |
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
| b1 Yuki, Brise-Lame | c1 Yuki, Lame Ardente | UR |
| c1 Yuki, Lame Ardente | c8 Yuki, Sabre de l’Aurore | L |
| b2 Onyx, Fil de Nuit | c2 Onyx, Lame Funeste | UR |
| c2 Onyx, Lame Funeste | c9 Onyx, Ombre Éternelle | L |
| b3 Naïa, Sourcéleine | c3 Naïa, Source du Large | UR |
| c3 Naïa, Source du Large | c10 Naïa, Marée Éternelle | L |
| b4 Aïna, Voix du Matin | c4 Aïna, Chant de l’Aube | UR |
| c4 Aïna, Chant de l’Aube | c11 Aïna, Aurore Immortelle | L |
| b5 Roc, Épaule du Monde | c5 Roc, Montagne Vivante | UR |
| c5 Roc, Montagne Vivante | c12 Roc, Rempart du Monde | L |
| b6 Ember, Cœur de Fournaise | c6 Ember, Flamme Vive | UR |
| c6 Ember, Flamme Vive | c13 Ember, Soleil Captif | L |
| b7 Sylve, Écorce Vive | c7 Sylve, Griffe Sylvestre | UR |
| c7 Sylve, Griffe Sylvestre | c14 Sylve, Âme du Bosquet | L |
| p1 Jeune Séraphin | p5 Séraphin, Porteur de Lumière | R |
| p5 Séraphin, Porteur de Lumière | p7 Ange de Lumière | SR |
| p7 Ange de Lumière | p8 Archange | UR |
| p8 Archange | p6 Séraphin, Archange Ultime | L |

