# Le monde et les constantes du moteur

> GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.

## Constantes du moteur (data/engine.json)

Ce fichier est LA source de verite du moteur : aucune valeur de design ne vit dans src/ (test allowlist).

| constante | valeur |
| --- | --- |
| CLASSES | ["Guerrier","Mage","Prêtre","Assassin","Occultiste"] |
| ELEMENTS | ["Feu","Eau","Terre","Ombre","Lumière"] |
| RACES | ["humaine","monstre","mystique","divine"] |
| RACE_LABEL | {"humaine":"Humaine","monstre":"Monstre","mystique":"Mystique","divine":"Divine"} |
| BEATS | {"Feu":"Terre","Terre":"Eau","Eau":"Feu","Lumière":"Ombre","Ombre":"Lumière"} |
| BEATEN_BY | {"Feu":"Eau","Eau":"Terre","Terre":"Feu","Lumière":"Ombre","Ombre":"Lumière"} |
| PALIERS | [2,4] |
| RARITY_POWER | {"N":0.9,"C":1,"UC":1.08,"R":1.16,"SR":1.26,"UR":1.38,"L":1.52} |
| FAMILY_MANA | [{"max":8,"regen":2},{"max":11,"regen":3},{"max":14,"regen":3},{"max":22,"regen":5},{"max":30,"regen":6},{"max":40,"regen":8}] |
| MONSTER_MANA | {"max":10,"regen":2} |
| SOLO_MANA | {"max":10,"regen":2} |
| EVO_COST | {"C":["brut",3],"UC":["poli",2],"R":["poli",4],"SR":["grave",2],"UR":["grave",4],"L":["eternel",10]} |
| TEAM_MAX | 5 |
| LEVEL_CAP | 20 |
| DMG_REDUCTION_MAX | 0.8 |
| SAVE_VERSION | 15 |
| VERSION | "1.0" |
| RACE_MOD | {"humaine":0,"monstre":0.1,"mystique":0.2,"divine":0.3} |
| CLASSE_MODS | {"Guerrier":{"atkPct":0.1,"hpPct":0.15,"strike":1,"dodge":0,"exec":0,"execBelow":0,"splash":0,"wave":false,"shieldOnHit":0.05},"Assassin":{"atkPct":0.05,"hpPct":-0.1,"strike":1,"dodge":0.15,"exec":0.25,"execBelow":0.35,"splash":0,"wave":false,"shieldOnHit":0},"Mage":{"atkPct":0.05,"hpPct":-0.05,"strike":0.8,"dodge":0,"exec":0,"execBelow":0,"splash":0.4,"wave":false,"shieldOnHit":0},"Prêtre":{"atkPct":-0.15,"hpPct":0,"strike":0.7,"dodge":0,"exec":0,"execBelow":0,"splash":0,"wave":false,"shieldOnHit":0},"Occultiste":{"atkPct":-0.2,"hpPct":0,"strike":0.6,"dodge":0,"exec":0,"execBelow":0,"splash":0,"wave":true,"shieldOnHit":0}} |
| SPELL_CAT_LABEL | {"commun":"commun","race":"de race","classe":"de classe","unique":"signature","lignée":"de lignée"} |

## Donjons (data/dungeons.json)

| id | nom | etages | tier | types | icone | eclats (shards) | boss |
| --- | --- | --- | --- | --- | --- | --- | --- |
| marees | L’Antre des Marées | 10 | 0 | Eau/Terre | 🌊 | a34, a38, a35, a36 | et.5 : Hydre des Marées ; et.10 : Souverain des Marées |
| forge | La Forge Cendrée | 10 | 1 | Feu/Ombre | 🔥 | - | et.5 : Maître des Fours ; et.10 : Seigneur des Cendres |
| bosquet | Le Bosquet Vermeil | 10 | 2 | Terre/Lumière | 🌿 | a35, a36, a37, a39 | et.5 : Mycola, Reine des Spores ; et.10 : Cœur du Bosquet |
| crypte | La Crypte Noyée | 10 | 3 | Ombre/Eau | 💀 | a34, a38 | et.5 : Goule des Caveaux ; et.10 : La Mort, Faucheuse des Tombes |
| zenith | Le Zénith Ardent | 10 | 4 | Lumière/Feu | ☀️ | a37, a39 | et.5 : Phénix du Zénith ; et.10 : Astre Capiteux |

## Difficultes (data/difficulties.json)

| id | nom | rarete min | plafond mob | boss 5 | boss 10 | tous boss | points | drop monstre | drop eclat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Facile | C | R | R | SR | false | 1 | 0.25 | 0.3 |
| 2 | Normal | UC | UR | SR | UR | false | 1.5 | 0.4 | 0.45 |
| 3 | Difficile | R | UR | UR | L | false | 2 | 0.55 | 0.6 |
| 4 | Très difficile | SR | L | L | M | false | 3 | 0.7 | 0.75 |
| 5 | Enfer | SR | L | L | M | true | 5 | 0.9 | 1 |

## Modificateurs de run (data/run-mods.json)

| id | glyph | nom | description |
| --- | --- | --- | --- |
| horde | 🐗 | La Horde | +1 ennemi dans chaque vague · butin +20 % (points et chances d'éclats). |
| sterile | 🕯 | Le Mana Stérile | La régénération de mana de l'équipe perd 1 point pendant chaque combat · points +25 %. |
| muraille | 🛡 | La Muraille | Les ennemis gagnent +25 % PV · chances d'éclats +50 %. |
| rage | ⚔ | La Rage Partagée | Les ennemis frappent +15 % fort · points +40 %. |

## Mots-cles d'element (data/keywords.json)

| mot-cle | element | biome | effet |
| --- | --- | --- | --- |
| brulure | Feu | forge | pourcentage de la vie max par tour, contre le seuil de la cible |
| corrosion | Eau | marees | pourcentage de la vie max par tour, contre le seuil de la cible |
| poison | Ombre | crypte | pourcentage de la vie max par tour, contre le seuil de la cible |
| seve | Terre | bosquet | sève rongeuse : pourcentage de la vie max par tour, contre le seuil de la cible |

## Zones d'errance (data/zones.json)

| zone | nature | cadence | apres | rencontres |
| --- | --- | --- | --- | --- |
| zone-marees | les berges des Marées (biome marees) | zone | donjon | 30 monstres : e1, e2, e3, e4, e5, e6, e13, e14, e11, e12, e7, e10, e8, e9, e15, e16, e17, e18, e19, e20, e21, e22, e23, e24, e25, e26, e27, e28, e29, e30 |
| zone-forge | les coulées de la Forge (biome forge) | zone | donjon | 24 monstres : f1, f2, f3, f4, f5, f6, f11, f12, f13, f14, f15, f19, f20, f21, f22, f24, f7, f10, f8, f9, f16, f17, f18, f23 |
| zone-bosquet | les clairières du Bosquet (biome bosquet) | zone | donjon | 21 monstres : g1, g2, g3, g4, g5, g6, g7, g8, g13, g14, g15, g16, g20, g21, g9, g12, g10, g11, g17, g18, g19 |
| zone-crypte | les galeries de la Crypte (biome crypte) | zone | donjon | 30 monstres : k1, k2, k3, k4, k5, k6, k7, k8, k13, k14, k17, k20, k21, k22, k23, k24, k25, k27, k28, k30, k9, k12, k10, k11, k15, k16, k18, k19, k26, k29 |
| zone-zenith | les pentes du Zénith (biome zenith) | zone | donjon | 30 monstres : z1, z2, z3, z4, z5, z6, z7, z8, z13, z14, z15, z16, z17, z18, z19, z28, z29, z30, z9, z12, z10, z11, z20, z21, z22, z23, z24, z25, z26, z27 |

## Arbres d'eveil (data/trees.json)

Les eveils font monter une carte vers une autre via une voie ; la voie ouvre des ecoles.

### Race humaine (rang 0)

| de | vers | voie | effet | ecoles ouvertes |
| --- | --- | --- | --- | --- |
| n1 | a30 | voie du guerrier | standard | - |
| n1 | s14 | voie de la protection | standard | - |
| n1 | a33 | voie sylvestre | standard | - |
| n2 | a29 | les flots — l’Eau | standard | - |
| n2 | a32 | la fournaise — le Feu | standard | - |
| n2 | a33 | les Sylvains — la Terre | standard | - |
| n2 | s13 | la lumière — l’élue de l’Aube | standard | - |
| n2 | a31 | l’ombre — l’élue du Crépuscule | standard | - |
| n3 | s13 | la lumière — la foi | standard | - |
| n3 | s14 | la garde — protéger les vivants | standard | - |
| n4 | a31 | voie de l’assassinat | standard | - |
| n4 | a34 | voie des quais | standard | - |
| n4 | a37 | voie de la fête | standard | - |

### Race monstre (rang 1)

| de | vers | voie | effet | ecoles ouvertes |
| --- | --- | --- | --- | --- |
| n5 | e3 | voie du pillage — les récifs | standard | - |
| n5 | e11 | voie des berges | standard | - |
| n6 | f3 | voie de la suie | standard | - |
| n6 | f15 | voie de la fournaise | standard | - |
| n6 | f24 | voie du goblin | standard | - |
| n7 | g3 | voie de la mousse | standard | - |
| n7 | g12 | voie des sèves | standard | - |
| n8 | k3 | le gouffre | standard | - |
| n8 | k12 | le deuil marin | standard | - |
| n8 | k24 | le devoir brisé | standard | - |
| n9 | z3 | la voie dorée — la Légion Solaire | standard | - |
| n9 | z16 | la voie du feu céleste — les Phénix | standard | - |
| n9 | z23 | la voie du plein jour — le Clergé | standard | - |

### Race mystique (rang 2)

| de | vers | voie | effet | ecoles ouvertes |
| --- | --- | --- | --- | --- |
| n10 | e24 | la forme — Sirène | standard | - |
| n11 | g12 | la forme — Dryade | standard | - |
| n12 | k3 | la forme — le gouffre | standard | - |
| n12 | k12 | la forme — le deuil marin | standard | - |
| n12 | k24 | la forme — le devoir brisé | standard | - |

### Race divine (rang 3)

| de | vers | voie | effet | ecoles ouvertes |
| --- | --- | --- | --- | --- |
| n13 | p1 | l’éveil du service — l’Ange Éveillé | remplace | - |
| n14 | d8 | la voie du Chœur Miroir — la Réflexion | standard | - |
| n15 | d14 | la voie du Pont — le Liage | standard | - |

## Synergies d'equipe (data/synergies.json)

| classe | palier 1 | palier 2 |
| --- | --- | --- |
| Guerrier | +10 % ATQ de l’équipe (la stat ⚔ des cartes) | +25 % ATQ de l’équipe (la stat ⚔ des cartes) |
| Mage | +10 % dégâts finaux (après l’ATQ, multiplie tout) | 1re attaque du tour frappe tous les ennemis à 50 % |
| Prêtre | Soins +50 % | Régén 5 % PV max / tour |
| Assassin | +15 % dégâts sur la cible la plus faible | 20 % de chance de double attaque |
| Occultiste | Malédictions −10 % d’ATQ en plus | Malédictions −25 % d’ATQ en plus |
| Feu | +10 % PV équipe | Vengeance : attaquants +20 % ATK quand une carte tombe |
| Eau | +10 % ATQ de l’équipe (la stat ⚔ des cartes) | Les supports ciblent 2 unités |
| Ombre | -10 % dégâts subis | -25 % dégâts subis |
| Terre | +15 % ATQ de l’équipe (la stat ⚔ des cartes) | Bouclier 10 % PV max au départ |
| Lumière | +10 % dégâts finaux (après l’ATQ, multiplie tout) | Régén 3 % PV max / tour |

