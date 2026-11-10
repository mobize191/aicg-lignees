# Tableau des cartes

> GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.

**113 cartes jouables** (data/cards.json), reparties : Assassin 32, Guerrier 17, Mage 26, Occultiste 8, Prêtre 30.

Le sort signature est le `soloSpell` ; l'effet est le champ `effect` (kind + valeur). L'element et la famille sont absents des cartes non-elementaires.

## Classe Assassin (32)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a12 | Fantôme du Sanctuaire | SR | Ombre | - | 22 | 60 | 20 | 9 | ombre | - | - |
| a16 | Kira, Reine des Ombres | UR | Ombre | - | 32 | 72 | 29 | 13 | ombre | - | - |
| a18 | Kira, Nuit Sans Fin | L | Ombre | - | 42 | 88 | 38 | 17 | ombre | - | - |
| a2 | Rôdeur des Ombres | C | Ombre | - | 10 | 45 | 9 | 4 | ombre | - | - |
| a24 | Traqueur du Bosquet | C | Terre | - | 10 | 46 | 9 | 4 | bosquet | - | - |
| a25 | Chasseur du Bosquet | R | Terre | - | 15 | 56 | 14 | 6 | bosquet | - | - |
| a26 | Prédateur Sylvestre | SR | Terre | - | 22 | 61 | 20 | 9 | bosquet | - | - |
| a27 | Maïa, Lame du Bosquet | UR | Terre | - | 32 | 72 | 29 | 13 | bosquet | - | - |
| a28 | Maïa, Déesse du Bosquet | L | Terre | - | 42 | 88 | 38 | 17 | bosquet | - | - |
| a31 | Guetteur Crépusculaire | UC | Ombre | - | 12 | 50 | 11 | 5 | ombre | - | - |
| a33 | Pisteur du Bosquet | UC | Terre | - | 12 | 51 | 11 | 5 | bosquet | - | - |
| a34 | Braconnier des Quais | C | Eau | - | 9 | 47 | 8 | 4 | - | Flèche de Brume | - |
| a36 | Éclaireur des Dunes | UC | Terre | - | 12 | 49 | 11 | 5 | - | Pas de Sable | - |
| a37 | Jongleur de Fête | C | Lumière | - | 8 | 44 | 7 | 3 | - | Bottes Cachées | - |
| a40 | Chasseur des Quais | UC | Eau | - | 13 | 56 | 12 | 5 | - | Volée de Bruine | - |
| a41 | Maître des Brumes | R | Eau | - | 17 | 66 | 15 | 7 | - | Rideau de Brume | - |
| a44 | Guide des Dunes | R | Terre | - | 16 | 60 | 14 | 6 | - | Mirage du Désert | - |
| a45 | Artiste de Fête | UC | Lumière | - | 11 | 54 | 10 | 4 | - | Daguenaud | - |
| a46 | Maître Jongleur | R | Lumière | - | 15 | 63 | 14 | 6 | - | Carrousel de Lames | - |
| a7 | Faucheur des Ombres | R | Ombre | - | 15 | 55 | 14 | 6 | ombre | - | - |
| b2 | Onyx, Fil de Nuit | SR | Ombre | - | 26 | 66 | 23 | 10 | ombre | - | - |
| b7 | Sylve, Écorce Vive | SR | Terre | - | 25 | 72 | 23 | 10 | bosquet | - | - |
| n14 | Démon | C | Ombre | - | 10 | 52 | 9 | 4 | - | Trait de Vice | - |
| n4 | Voleur Novice | N | - | - | 9 | 47 | 8 | 4 | - | Larcin Rapide | - |
| n8 | Embryon des Ténèbres | N | - | - | 10 | 50 | 9 | 4 | - | Griffes Noires | - |
| s3 | Veilleur d’Acier | C | Ombre | - | 5 | 45 | 5 | 2 | - | Œil du Stratège | atkBuff 0.15 |
| t1 | Mercenaire | C | Ombre | - | 8 | 55 | 7 | 3 | vol | Larcin Agile — geste de palier C | - |
| t2 | Pillard | UC | Ombre | - | 10 | 62 | 9 | 4 | vol | Coup de Jarnac — geste de palier UC | - |
| t3 | Brigand | R | Ombre | - | 14 | 70 | 13 | 6 | vol | Dague dans le Dos — geste de palier R | - |
| t4 | Grand Brigand | SR | Ombre | - | 20 | 78 | 18 | 8 | vol | Fauchage — geste de palier SR | - |
| t5 | Fléau des Routes | UR | Ombre | - | 27 | 88 | 24 | 11 | vol | Embuscade — geste de palier UR | - |
| t6 | Gadianton, Chef des Brigands | L | Ombre | - | 36 | 105 | 32 | 14 | vol | Coup de Grâce — geste de palier L | - |

## Classe Guerrier (17)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a1 | Épéiste en Herbe | C | Feu | - | 8 | 60 | 6 | 3 | lame | - | - |
| a10 | Bretteur du Zénith | SR | Feu | - | 18 | 90 | 13 | 7 | lame | - | - |
| a15 | Kenji, Lame Éternelle | UR | Feu | - | 30 | 95 | 21 | 12 | lame | - | - |
| a17 | Kenji, Sabre Céleste | L | Feu | - | 40 | 105 | 28 | 16 | lame | - | - |
| a30 | Spadassin Vigilant | UC | Feu | - | 10 | 67 | 7 | 4 | lame | - | - |
| a38 | Raboteur de Berges | C | Eau | - | 10 | 62 | 7 | 4 | - | Coup de Rame | - |
| a47 | Charpentier des Berges | UC | Eau | - | 13 | 76 | 9 | 5 | - | Coup d’Étrave | - |
| a48 | Maître Charpentier | R | Eau | - | 17 | 88 | 12 | 7 | - | Rampe de Lancement | - |
| a6 | Épéiste Errant | R | Feu | - | 12 | 75 | 8 | 5 | lame | - | - |
| a9 | Pilier Mécanique | R | Terre | - | 11 | 80 | 8 | 4 | - | Charge Hydraulique | - |
| b1 | Yuki, Brise-Lame | SR | Feu | - | 24 | 82 | 17 | 10 | lame | - | - |
| n1 | Épéiste Novice | N | - | - | 8 | 55 | 6 | 3 | - | Prise de Garde | - |
| n5 | Embryon des Eaux | N | - | - | 9 | 60 | 6 | 4 | - | Bruissement d’Écume | - |
| s11 | Argus, Rempart Éveillé | UR | Terre | - | 6 | 92 | 4 | 2 | bouclier | - | shield 55 |
| s12 | Argus, Forteresse Vivante | L | Terre | - | 7 | 115 | 5 | 3 | bouclier | - | shield 75 |
| s4 | Gardien-Mécanique | C | Terre | - | 2 | 55 | 1 | 1 | bouclier | - | shield 15 |
| s6 | Sentinelle d’Acier | R | Terre | - | 4 | 62 | 3 | 2 | bouclier | - | shield 25 |

## Classe Mage (26)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a11 | Sorcière des Océans | SR | Eau | - | 20 | 65 | 10 | 16 | eau | - | - |
| a13 | Alix, Archimage des Marées | UR | Eau | - | 28 | 80 | 14 | 22 | eau | - | - |
| a14 | Alix, Déesse de l’Eau | L | Eau | - | 38 | 100 | 19 | 30 | eau | - | - |
| a19 | Allumeur de Braises | C | Feu | - | 9 | 43 | 5 | 7 | braise | - | - |
| a20 | Mage de la Fournaise | R | Feu | - | 14 | 51 | 7 | 11 | braise | - | - |
| a21 | Invocateur de Fournaise | SR | Feu | - | 21 | 65 | 11 | 17 | braise | - | summon 0.6 (ttl 3) |
| a22 | Solen, Archimage de la Braise | UR | Feu | - | 29 | 80 | 15 | 23 | braise | - | - |
| a23 | Solen, Roi des Braises | L | Feu | - | 39 | 100 | 20 | 31 | braise | - | - |
| a29 | Adepte des Rivières | UC | Eau | - | 11 | 46 | 6 | 9 | eau | - | - |
| a32 | Veilleur de Braise | UC | Feu | - | 11 | 47 | 6 | 9 | braise | - | - |
| a4 | Étincelle Vive | C | Feu | - | 9 | 40 | 5 | 7 | - | Trait Incandescent | - |
| a5 | Apprentie des Rivières | C | Eau | - | 9 | 42 | 5 | 7 | eau | - | - |
| a8 | Sorcière des Rivières | R | Eau | - | 14 | 50 | 7 | 11 | eau | - | - |
| b3 | Naïa, Sourcéleine | SR | Eau | - | 22 | 76 | 11 | 18 | eau | - | - |
| b6 | Ember, Cœur de Fournaise | SR | Feu | - | 23 | 74 | 12 | 18 | braise | - | - |
| n10 | Enge des Brumes | N | - | - | 9 | 56 | 5 | 7 | - | Voile de Brume | - |
| n2 | Mage Novice | N | - | - | 7 | 48 | 4 | 6 | - | Étincelle d’Étude | - |
| n6 | Embryon des Flammes | N | - | - | 10 | 52 | 5 | 8 | - | Souffle de Braise | - |
| n9 | Embryon des Cieux | N | - | - | 9 | 54 | 5 | 7 | - | Rafale Céleste | - |
| s7 | Bastion Arcanique | SR | Terre | - | 6 | 58 | 3 | 5 | bouclier | - | atkBuff 0.25 |
| v1 | Apprenti Invocateur | C | Lumière | - | 8 | 55 | 4 | 6 | appel | Appel Mineur — geste de palier C | - |
| v2 | Conjurateur | UC | Lumière | - | 10 | 62 | 5 | 8 | appel | Élémentaire de Braise — geste de palier UC | - |
| v3 | Évocateur | R | Lumière | - | 14 | 70 | 7 | 11 | appel | Meute Spirituelle — geste de palier R | - |
| v4 | Maître des Esprits | SR | Lumière | - | 20 | 78 | 10 | 16 | appel | Portail — geste de palier SR | - |
| v5 | Seigneur des Élémentaires | UR | Lumière | - | 27 | 88 | 14 | 22 | appel | Légion Céleste — geste de palier UR | - |
| v6 | Archimage de l’Appel | L | Lumière | - | 36 | 105 | 18 | 29 | appel | Appel Suprême — geste de palier L | - |

## Classe Occultiste (8)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| n12 | Enge des Caveaux | N | - | - | 9 | 53 | 5 | 7 | - | Froid du Caveau | - |
| n15 | Éveillé du Seuil | C | - | - | 8 | 55 | 4 | 6 | - | Regard du Seuil | - |
| q1 | Novice du Crépuscule | C | Ombre | - | 8 | 55 | 4 | 6 | crepuscule | Griffe Nocturne — geste de palier C | - |
| q2 | Disciple du Crépuscule | UC | Ombre | - | 10 | 62 | 5 | 8 | crepuscule | Voile d’Ombre — geste de palier UC | - |
| q3 | Prêtre du Crépuscule | R | Ombre | - | 14 | 70 | 7 | 11 | crepuscule | Malédiction du Soir — geste de palier R | - |
| q4 | Servante du Crépuscule | SR | Ombre | - | 20 | 78 | 10 | 16 | crepuscule | Danse des Ombres — geste de palier SR | - |
| q5 | Grande Prêtresse de l’Ombre | UR | Ombre | - | 27 | 88 | 14 | 22 | crepuscule | Oubli Éternel — geste de palier UR | - |
| q6 | Vesperine, Reine de la Nuit | L | Ombre | - | 36 | 105 | 18 | 29 | crepuscule | Nuit Sans Fin — geste de palier L | - |

## Classe Prêtre (30)

| id | nom | rarete | element | role | ATQ | PV | AGI | INT | famille | sort signature | effet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a3 | Garde-Promesse | C | Eau | - | 7 | 65 | 4 | 6 | - | Serment Protecteur | - |
| a35 | Palefrenière Errante | C | Terre | - | 2 | 52 | 1 | 2 | - | Litière Douce | heal 14 |
| a39 | Veilleuse du Guet | UC | Lumière | - | 3 | 54 | 2 | 2 | - | Lanterne du Guet | heal 20 |
| a42 | Écuyère des Routes | UC | Terre | - | 3 | 62 | 2 | 2 | - | Selle Réconfortante | heal 20 |
| a43 | Première Écuyère | R | Terre | - | 4 | 72 | 2 | 3 | - | Bénédiction du Chemin | heal 28 |
| a49 | Capitaine du Guet | R | Lumière | - | 4 | 66 | 2 | 3 | - | Ronde Éclairée | heal 30 |
| b4 | Aïna, Voix du Matin | SR | Lumière | - | 4 | 78 | 2 | 3 | aube | - | heal 46 |
| b5 | Roc, Épaule du Monde | SR | Terre | - | 5 | 96 | 3 | 4 | bouclier | - | shield 44 |
| n11 | Enge des Bois | N | - | - | 6 | 60 | 3 | 5 | - | Souffle des Sèves | heal 18 |
| n13 | Ange | C | Lumière | - | 6 | 58 | 3 | 5 | - | Éclat d’Aube | heal 20 |
| n3 | Prêtre Novice | N | - | - | 4 | 52 | 2 | 3 | - | Bénédiction Modeste | heal 18 |
| n7 | Embryon du Vivant | N | - | - | 7 | 62 | 4 | 6 | - | Sève Voleuse | heal 16 |
| p1 | Jeune Séraphin | UC | Lumière | - | 8 | 66 | 4 | 6 | - | Éclat d’Aube | heal 24 |
| p2 | Ange Gardien | C | Lumière | - | 6 | 58 | 3 | 5 | - | Éclat d’Aube | heal 20 |
| p3 | Pousse des Sèves | C | Terre | - | 5 | 60 | 3 | 4 | - | - | heal 16 |
| p4 | Fidèle du Jour | C | Lumière | - | 6 | 58 | 3 | 5 | - | - | heal 18 |
| s1 | Novice de l’Aube | C | Lumière | - | 3 | 50 | 2 | 2 | aube | - | heal 18 |
| s10 | Léna, Aube Éternelle | L | Lumière | - | 6 | 105 | 3 | 5 | aube | - | heal 80 |
| s13 | Servante de l’Aube | UC | Lumière | - | 3 | 55 | 2 | 2 | aube | - | heal 22 |
| s14 | Garde du Rempart | UC | Terre | - | 3 | 58 | 2 | 2 | bouclier | - | shield 20 |
| s2 | Médecin de Camp | C | Lumière | - | 2 | 48 | 1 | 2 | - | Baume Apaisant | heal 16 |
| s5 | Prêtresse de l’Aube | R | Lumière | - | 3 | 60 | 2 | 2 | aube | - | heal 26 |
| s8 | Grande Prêtresse de l’Aube | SR | Lumière | - | 4 | 70 | 2 | 3 | aube | - | heal 40 |
| s9 | Léna, Avatar de l’Aurore | UR | Lumière | - | 5 | 85 | 3 | 4 | aube | - | heal 58 |
| u1 | Fidèle du Matin | C | Lumière | - | 8 | 55 | 4 | 6 | zele | Étincelle de Foi — geste de palier C | - |
| u2 | Écuyer Fervent | UC | Lumière | - | 10 | 62 | 5 | 8 | zele | Hymne du Matin — geste de palier UC | - |
| u3 | Croisé de l’Aube | R | Lumière | - | 14 | 70 | 7 | 11 | zele | Bénédiction du Jour — geste de palier R | - |
| u4 | Chapelain du Jour | SR | Lumière | - | 20 | 78 | 10 | 16 | zele | Croisade — geste de palier SR | - |
| u5 | Arbalétrier Doré | UR | Lumière | - | 27 | 88 | 14 | 22 | zele | Aurore Radieuse — geste de palier UR | - |
| u6 | Lémion, Chef de la Légion Solaire | L | Lumière | - | 36 | 105 | 18 | 29 | zele | Lumière Éternelle — geste de palier L | - |

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
| crepuscule | Famille du Crépuscule | q1 Novice du Crépuscule -> q2 Disciple du Crépuscule -> q3 Prêtre du Crépuscule -> q4 Servante du Crépuscule -> q5 Grande Prêtresse de l’Ombre -> q6 Vesperine, Reine de la Nuit | - |
| vol | Famille du Vol | t1 Mercenaire -> t2 Pillard -> t3 Brigand -> t4 Grand Brigand -> t5 Fléau des Routes -> t6 Gadianton, Chef des Brigands | - |
| zele | Famille du Zèle | u1 Fidèle du Matin -> u2 Écuyer Fervent -> u3 Croisé de l’Aube -> u4 Chapelain du Jour -> u5 Arbalétrier Doré -> u6 Lémion, Chef de la Légion Solaire | - |
| appel | École des Invocations | v1 Apprenti Invocateur -> v2 Conjurateur -> v3 Évocateur -> v4 Maître des Esprits -> v5 Seigneur des Élémentaires -> v6 Archimage de l’Appel | - |

## Evolutions (data/evolutions.json)

Les cartes a choix listent chaque voie possible ; l'evolution exige le niveau 10 et des eclats (EVO_COST).

| carte | evolue vers | voie |
| --- | --- | --- |
| n1 Épéiste Novice | a30 Spadassin Vigilant | voie du guerrier |
| n1 Épéiste Novice | s14 Garde du Rempart | voie de la protection |
| n1 Épéiste Novice | a33 Pisteur du Bosquet | voie sylvestre |
| n2 Mage Novice | a29 Adepte des Rivières | les flots — l’Eau |
| n2 Mage Novice | a32 Veilleur de Braise | la fournaise — le Feu |
| n2 Mage Novice | a33 Pisteur du Bosquet | les Sylvains — la Terre |
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
| n11 Enge des Bois | g12 | la forme — Dryade |
| n12 Enge des Caveaux | k3 | la forme — le gouffre |
| n12 Enge des Caveaux | k12 | la forme — le deuil marin |
| n12 Enge des Caveaux | k24 | la forme — le devoir brisé |
| n9 Embryon des Cieux | z3 | la voie dorée — la Légion Solaire |
| n9 Embryon des Cieux | z16 | la voie du feu céleste — les Phénix |
| n9 Embryon des Cieux | z23 | la voie du plein jour — le Clergé |
| n13 Ange | p1 Jeune Séraphin | l’éveil du service — le Jeune Séraphin |
| n14 Démon | d8 | la voie du Chœur Miroir — la Réflexion |
| n15 Éveillé du Seuil | d14 | la voie du Pont — le Liage |
| a34 Braconnier des Quais | e3 | la malédiction des quais |
| a17 Kenji, Sabre Céleste | a20 Mage de la Fournaise | la régression |
| a27 Maïa, Lame du Bosquet | a28 Maïa, Déesse du Bosquet | la fusion du Bosquet |
| p1 Jeune Séraphin | d6 | l’équilibre |
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

