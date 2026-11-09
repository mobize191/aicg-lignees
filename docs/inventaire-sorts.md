# Inventaire complet des sorts

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

Un maillon apprend **un sort de lignée par palier franchi** et connaît ceux des paliers inférieurs. L'échelle des coûts est la même pour toutes les familles : 2, 3, 5, 9, 14 puis 20✦ ; les gros sorts (9✦ et plus) portent la marque du nommé aux paliers UR et L. Chez les soigneurs (Aube, Bouclier), plus le sort est cher, plus il soigne.

### Famille du Sabre

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Taillade du Mat | 2✦ | ×1.4 |  | Une frappe rapide portée au lever du jour. |
| UC | Lame Vive | 3✦ | ×1.6 |  | Une coupe sèche qui cherche la jointure de l’armure. |
| R | Lame Éclair | 5✦ | ×1.9 |  | Un sabre si rapide qu’on ne voit que la traînée. |
| SR | Millième Taillade | 9✦ | ×2.6 | oui | Mille coupes en un seul geste. |
| UR | Kenji : Zénith Tranchant | 14✦ | ×3.4 | oui | Le sabre atteint le sommet du ciel et retombe en éclair. |
| L | Kenji : Sabre Céleste | 20✦ | ×4.5 | oui | Une constellation de lames s’abat sur l’ennemi. |

### Famille de l’Ombre

| Palier | Sort | Coût | Puissance | Gros | Description |
| --- | --- | --- | --- | --- | --- |
| C | Poigne du Silence | 2✦ | ×1.4 |  | Une attaque sournoise sur les points faibles. |
| UC | Pas de l’Ombre | 3✦ | ×1.6 |  | Un déplacement imperceptible, puis la morsure. |
| R | Faux du Croissant | 5✦ | ×1.9 |  | Une faux qui ne luit que les nuits sans lune. |
| SR | Danse des Cent Lames | 9✦ | ×2.6 | oui | Cent ombres frappent là où une seule semble passer. |
| UR | Kira : Voile Déchiré | 14✦ | ×3.4 | oui | L’ombre elle-même est une arme entre ses mains. |
| L | Kira : Nuit Sans Fin | 20✦ | ×4.5 | oui | Le combat continue dans une nuit qui ne se lève plus. |

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