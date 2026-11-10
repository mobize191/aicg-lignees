# Tableau des sorts

> GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.

Les sorts vivent dans data/grimoire.json en six categories : `communs` (2), `entrees` (5), `race` (4), `ecole` (6), `lignee` (42), `uniques` (7).

## Sorts communs (2)

| id | nom | ecole | role | cible | cout | mult | description |
| --- | --- | --- | --- | --- | --- | --- | --- |
| frappe-precise | Frappe Précise | lame | degats | 1 ennemi | 2 | 1.3 | Le geste que toute carte de combat connaît : un coup net, sans gaspillage. |
| premiers-soins | Premiers Soins | baume | soin | 1 allié | 2 | 1.15 | Le soin élémentaire que tout soigneur connaît : un pansement rapide sur la pire plaie. |

## Sorts d'entree de classe (5)

| id | nom | classe | ecole | role | cible | cout | mult | description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| brise-garde | Brise-Garde | Guerrier | lame | degats | 1 ennemi | 4 | 1.6 | Le coup du guerrier : chercher la jointure de la garde. |
| decharge-arcanique | Décharge Arcanique | Mage | lame | degats | zone | 5 | 1.65 | Le mage vide un fragment de mana en un trait brut. |
| onde-consacree | Onde Consacrée | Prêtre | baume | soin | l’équipe | 3 | 1.3 | Le soin du prêtre : une onde qui referme les plaies. |
| frappe-dans-le-dos | Frappe dans le Dos | Assassin | lame | degats | 1 ennemi | 4 | 1.7 | L’assassin frappe là où l’on ne regarde pas. |
| oeil-du-malheur | Œil du Malheur | Occultiste | mauvais-oeil | malus | 1 ennemi | 4 | 1.6 | L’occultiste marque sa proie d’un mauvais présage. |

## Sorts de race (4)

| id | nom | race | ecole | role | cible | cout | mult | description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| discipline-de-ligne | Discipline de Ligne | humaine | ferveur | boost | soi | 3 | 1.5 | Le geste des lignes humaines : appris au drill, exécuté sans penser. |
| instinct-sauvage | Instinct Sauvage | bestiau | ferveur | degats | 1 ennemi | 3 | 1.5 | Le bestiau agit comme il respire : par instinct, vite et fort. |
| vol-en-rase-mottes | Vol en Rase-Mottes | enge | ruse | degats | 1 ennemi | 3 | 1.5 | L’enge plonge du ciel et remonte avant la riposte. |
| ferveur-celeste | Ferveur Céleste | divine | ferveur | boost | 1 allié | 3 | 1.5 | Une onction des camps divins qui aiguise le geste. |

## Sorts d'ecolage (6)

Appris en ecolant une zone. Le `cran` monte le cout et la largeur (cibles contigues, ou `equipe`/`equipe-renforcee`).

| id | nom | ecole | role | cible | crans (cout / largeur / effet) |
| --- | --- | --- | --- | --- | --- |
| morsure-decume | Lame d’Écume | lame | degats | - | I : 3 / 1 ; x1.5 ; II : 4 / 2 ; x1.8 ; III : 5 / 3 ; x2.2 ; IV : 6 / 5 ; x2.6 |
| chant-de-sirene | Mélodie envoûtante | entrave | controle | - | I : 3 / 1 ; taux 25%, 1 tour(s) ; II : 4 / 2 ; taux 20%, 1 tour(s) ; III : 5 / 3 ; taux 15%, 1 tour(s) ; IV : 6 / 5 ; taux 10%, 1 tour(s) |
| etreinte-des-profondeurs | Étreinte des Profondeurs | entrave | controle | - | I : 3 / 1 ; VIDE : attend un autre biome ou la zone d’errance ; II : 4 / 2 ; VIDE : attend un autre biome ou la zone d’errance ; III : 5 / 3 ; taux 20%, 1 tour(s) ; IV : 6 / 5 ; VIDE : attend un autre biome ou la zone d’errance |
| carapace-de-corail | Barrière de Corail | rempart | bouclier | - | I : 3 / 1 ; x1.7 ; II : 4 / 2 ; VIDE : attend un autre biome ou la zone d’errance ; III : 5 / equipe ; x1.3 ; IV : 6 / equipe-renforcee ; x1.6 |
| marque-corrosive | Marque Corrosive | mauvais-oeil | malus | - | I : 3 / 1 ; VIDE : attend un autre biome ou la zone d’errance ; II : 4 / 2 ; VIDE : attend un autre biome ou la zone d’errance ; III : 5 / 3 ; taux 15%, 2 tour(s) ; IV : 6 / 5 ; VIDE : attend un autre biome ou la zone d’errance |
| guet-des-fonds | Vigie des Flots | ferveur | boost | - | I : 3 / 1 ; VIDE : attend un autre biome ou la zone d’errance ; II : 4 / 2 ; taux 20% ; III : 5 / equipe ; VIDE : attend un autre biome ou la zone d’errance ; IV : 6 / equipe-renforcee ; VIDE : attend un autre biome ou la zone d’errance |

## Sorts de lignee (42)

Un sort par palier de famille, appris en montant la lignee.

| famille | palier | sort | cout | mult | big | description |
| --- | --- | --- | --- | --- | --- | --- |
| lame | C | Taillade du Mat | 2 | 1.4 | false | Une frappe rapide portée au lever du jour. |
| lame | UC | Lame Vive | 3 | 1.6 | false | Une coupe sèche qui cherche la jointure de l’armure. |
| lame | R | Lame Éclair | 5 | 1.9 | false | Un sabre si rapide qu’on ne voit que la traînée. |
| lame | SR | Millième Taillade | 9 | 2.6 | true | Mille coupes en un seul geste. |
| lame | UR | Kenji : Zénith Tranchant | 14 | 3.4 | true | Le sabre atteint le sommet du ciel et retombe en éclair. |
| lame | L | Tranche-Monde | 20 | 4.5 | true | Une constellation de lames s’abat sur l’ennemi. |
| ombre | C | Poigne du Silence | 2 | 1.4 | false | Une attaque sournoise sur les points faibles. |
| ombre | UC | Pas de l’Ombre | 3 | 1.6 | false | Un déplacement imperceptible, puis la morsure. |
| ombre | R | Faux du Croissant | 5 | 1.9 | false | Une faux qui ne luit que les nuits sans lune. |
| ombre | SR | Danse des Cent Lames | 9 | 2.6 | true | Cent ombres frappent là où une seule semble passer. |
| ombre | UR | Kira : Voile Déchiré | 14 | 3.4 | true | L’ombre elle-même est une arme entre ses mains. |
| ombre | L | Nuit Éternelle | 20 | 4.5 | true | Le combat continue dans une nuit qui ne se lève plus. |
| eau | C | Goutte Percutante | 2 | 1.4 | false | Une goutte lancée à la vitesse d’une flèche. |
| eau | UC | Brume Mordante | 3 | 1.6 | false | Un brouillard salé qui ronge armor et peau. |
| eau | R | Courant Battant | 5 | 1.9 | false | Le fleuve répond à son appel et charge l’ennemi. |
| eau | SR | Marée Ascendante | 9 | 2.6 | true | Une vague montante qui emporte tout sur son passage. |
| eau | UR | Raz-de-Marée | 14 | 3.4 | true | L’océan entier se soulève d’un seul geste d’Alix. |
| eau | L | Colère de l’Océan | 20 | 4.5 | true | La déesse de l’eau réveille le gouffre des abysses. |
| aube | C | Étreinte Matinale | 2 | 1.5 | false | La première lumière du jour referme les plaies. |
| aube | UC | Rayon Matinal | 3 | 1.7 | false | Un rayon oblique qui caresse la blessure. |
| aube | R | Lumière Réconfortante | 5 | 2.2 | false | Un rayon chaud qui chasse fatigue et blessures. |
| aube | SR | Bénédiction de l’Aurore | 9 | 3.2 | true | Le soleil levant bénit l’équipe d’un souffle doré. |
| aube | UR | Aurore Radieuse | 14 | 4.4 | true | La lumière de Léna coule comme une marée dorée. |
| aube | L | Aube Éternelle | 20 | 6 | true | Un nouveau matin se lève et efface la nuit. |
| bouclier | C | Carapace Réactive | 2 | 1.5 | false | Son blindage se raffermit au moment de l’impact. |
| bouclier | UC | Égide Renforcée | 3 | 1.7 | false | Une plaque de plus entre le coup et la ligne. |
| bouclier | R | Mur Inflexible | 5 | 2.2 | false | Là où elle se tient, la ligne ne cède jamais. |
| bouclier | SR | Barrière Runique | 9 | 3.2 | true | Des runes gravées dans l’acier dévient les coups. |
| bouclier | UR | Argus : Rempart Éveillé | 14 | 4.4 | true | La forteresse s’éveille et couvre toute l’équipe. |
| bouclier | L | Argus : Forteresse Vivante | 20 | 6 | true | Le mur devient montagne, la montagne devient garde. |
| braise | C | Étincelle Filante | 2 | 1.4 | false | Une étincelle qui court plus vite que la flamme. |
| braise | UC | Flèche de Feu | 3 | 1.6 | false | Une flèche enflammée qui accroche l’air. |
| braise | R | Jet de Braise | 5 | 1.9 | false | Un souffle de braises brûlantes arraché au foyer. |
| braise | SR | Fournaise | 9 | 2.6 | true | Le sol s’ouvre et crache un cercle de feu. |
| braise | UR | Solen : Couronne de Feu | 14 | 3.4 | true | Une couronne de flammes consume les rangs adverses. |
| braise | L | Solen : Braise Éternelle | 20 | 4.5 | true | Un feu qui ne s’éteint plus, où que l’ennemi fuie. |
| bosquet | C | Trait d’Épine | 2 | 1.4 | false | Une épine sèche lancée du creux d’un fourré. |
| bosquet | UC | Lance d’Aubier | 3 | 1.6 | false | Un éclat de bois vert durci par la sève. |
| bosquet | R | Épine Vengeresse | 5 | 1.9 | false | La forêt rend coup pour coup à qui la blesse. |
| bosquet | SR | Rafale d’Épines | 9 | 2.6 | true | Une tempête de ronces ferme l’horizon. |
| bosquet | UR | Maïa : Danse des Feuilles | 14 | 3.4 | true | Ses feuilles dansent autour de la proie, puis tombent. |
| bosquet | L | Maïa : Cœur du Bosquet | 20 | 4.5 | true | Le bosquet entier se lève et marche au combat. |

## Sorts uniques (7)

| id | nom | carte porteuse | role | cible | cout | mult | description |
| --- | --- | --- | --- | --- | --- | --- | --- |
| maree-noire | Marée Noire | e13 | degats | tous les ennemis | 3 | 1.5 | Le flot noir qui submerge tous les ennemis. |
| abime-absolu | Abîme Absolu | e14 | degats | tous les ennemis | 3 | 1.5 | Le gouffre s’ouvre et referme. |
| songe-des-profondeurs | Songe des Profondeurs | e17 | controle | 1 ennemi | 3 | 1.6 | Le rêve qui noie. |
| couronne-des-ecumes | Couronne des Écumes | e19 | boost | l’équipe | 3 | 1.5 | L’onction royale. |
| benediction-des-berges | Bénédiction des Berges | e22 | soin | l’équipe | 3 | 1.5 | La bénédiction du bord de l’eau. |
| chant-du-naufrage | Chant du Naufrage | e28 | controle | tous les ennemis | 7 | 2 | Le chant qui couche les équipages. |
| colere-des-recifs | Colère des Récifs | e30 | degats | tous les ennemis | 3 | 1.6 | La reine qui flagelle. |

## Ecoles (data/schools.json)

Les verrous d'ouverture : une ecole s'ouvre par PROFIL (classe de carte) ou par VOIE (choix d'eveil).

| ecole | nom | role | profils | voies |
| --- | --- | --- | --- | --- |
| lame | la Lame | degats | Guerrier, Assassin | voie du sabre, voie du bretteur, voie de l’assassinat |
| baume | le Baume | soin | Prêtre | la foi, voie de la protection |
| rempart | le Rempart | bouclier | Guerrier | voie du rempart, voie mécanique |
| appel | l’Appel | invocation | Mage, Occultiste | voie céleste, le zèle, nécromancie |
| entrave | l’Entrave | controle | Mage, Occultiste | l’ombre, voie des sirènes |
| mauvais-oeil | le Mauvais Œil | malus | Occultiste | l’ombre, voie du caveau |
| ferveur | la Ferveur | boost | Guerrier, Prêtre | voie du guerrier, la foi, voie du zèle |
| ruse | la Ruse | manip | Assassin | voie du vol, voie des quais |

## Catalogue brut par famille (data/lineage-spells.json)

| famille | sorts (nom) |
| --- | --- |
| lame | Taillade du Mat / Lame Vive / Lame Éclair / Millième Taillade / Kenji : Zénith Tranchant / Tranche-Monde |
| ombre | Poigne du Silence / Pas de l’Ombre / Faux du Croissant / Danse des Cent Lames / Kira : Voile Déchiré / Nuit Éternelle |
| eau | Goutte Percutante / Brume Mordante / Courant Battant / Marée Ascendante / Raz-de-Marée / Colère de l’Océan |
| aube | Étreinte Matinale / Rayon Matinal / Lumière Réconfortante / Bénédiction de l’Aurore / Aurore Radieuse / Aube Éternelle |
| bouclier | Carapace Réactive / Égide Renforcée / Mur Inflexible / Barrière Runique / Argus : Rempart Éveillé / Argus : Forteresse Vivante |
| braise | Étincelle Filante / Flèche de Feu / Jet de Braise / Fournaise / Solen : Couronne de Feu / Solen : Braise Éternelle |
| bosquet | Trait d’Épine / Lance d’Aubier / Épine Vengeresse / Rafale d’Épines / Maïa : Danse des Feuilles / Maïa : Cœur du Bosquet |

## Fusions de monstres (data/fusion-map.json)

Fusionner un monstre enseigne son sort (`fusion`) a un cran donne.

### Donjon marees

| monstre | sort appris | cran |
| --- | --- | --- |
| e1 | morsure-decume | I |
| e2 | morsure-decume | I |
| e10 | morsure-decume | I |
| e3 | morsure-decume | II |
| e11 | morsure-decume | II |
| e12 | morsure-decume | III |
| e26 | morsure-decume | III |
| e18 | morsure-decume | IV |
| e7 | chant-de-sirene | I |
| e23 | chant-de-sirene | I |
| e24 | chant-de-sirene | II |
| e25 | chant-de-sirene | III |
| e27 | chant-de-sirene | IV |
| e6 | etreinte-des-profondeurs | III |
| e8 | carapace-de-corail | I |
| e15 | carapace-de-corail | III |
| e21 | carapace-de-corail | III |
| e29 | carapace-de-corail | IV |
| e16 | marque-corrosive | III |
| e20 | guet-des-fonds | II |
| e4 | brise-garde | II |
| e5 | oeil-du-malheur | II |
| e9 | onde-consacree | II |
| e13 | - | - |
| e14 | - | - |
| e17 | - | - |
| e19 | - | - |
| e22 | - | - |
| e28 | - | - |
| e30 | - | - |

