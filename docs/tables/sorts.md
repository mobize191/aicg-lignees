# Tableau des sorts

> GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.

Les sorts vivent dans data/grimoire.json en six categories : `communs` (2), `entrees` (5), `race` (4), `ecole` (16), `lignee` (68), `uniques` (41).

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
| oeil-du-malheur | Œil du Malheur | Occultiste | mauvais-oeil | malus | 1 ennemi | 4 | 1.6 | Malédiction : −20 % de dégâts infligés par la cible pendant 2 tours. |

## Sorts de race (4)

| id | nom | race | ecole | role | cible | cout | mult | description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| discipline-de-ligne | Discipline de Ligne | humaine | ferveur | boost | soi | 3 | 1.5 | Le geste des lignes humaines : appris au drill, exécuté sans penser. |
| instinct-sauvage | Instinct Sauvage | bestiau | ferveur | degats | 1 ennemi | 3 | 1.5 | Le bestiau agit comme il respire : par instinct, vite et fort. |
| vol-en-rase-mottes | Vol en Rase-Mottes | enge | ruse | degats | 1 ennemi | 3 | 1.5 | L’enge plonge du ciel et remonte avant la riposte. |
| ferveur-celeste | Ferveur Céleste | divine | ferveur | boost | 1 allié | 3 | 1.5 | Une onction des camps divins qui aiguise le geste. |

## Sorts d'ecolage (16)

Appris en ecolant une zone. Le `cran` monte le cout et la largeur (cibles contigues, ou `equipe`/`equipe-renforcee`).

| id | nom | ecole | role | cible | crans (cout / largeur / effet) |
| --- | --- | --- | --- | --- | --- |
| morsure-decume | Lame d’Écume | lame | degats | - | I : 3 / 1 ; x1.5 ; II : 4 / 2 ; x1.8 ; III : 5 / 3 ; x2.2 ; IV : 6 / 5 ; x2.6 |
| chant-de-sirene | Mélodie envoûtante | entrave | controle | - | I : 3 / 1 ; taux 25%, 1 tour(s) ; II : 4 / 2 ; taux 20%, 1 tour(s) ; III : 5 / 3 ; taux 15%, 1 tour(s) ; IV : 6 / 5 ; taux 10%, 1 tour(s) |
| etreinte-des-profondeurs | Étreinte des Profondeurs | entrave | controle | - | I : 3 / 1 ; taux 30%, 1 tour(s) ; II : 4 / 2 ; taux 25%, 1 tour(s) ; III : 5 / 3 ; taux 20%, 1 tour(s) ; IV : 6 / 5 ; taux 15%, 1 tour(s) |
| carapace-de-corail | Barrière de Corail | rempart | bouclier | - | I : 3 / 1 ; x1.7 ; II : 4 / 2 ; x1.5 ; III : 5 / equipe ; x1.3 ; IV : 6 / equipe-renforcee ; x1.6 |
| marque-corrosive | Marque Corrosive | mauvais-oeil | malus | - | I : 3 / 1 ; taux 25%, 2 tour(s) ; II : 4 / 2 ; taux 20%, 2 tour(s) ; III : 5 / 3 ; taux 15%, 2 tour(s) ; IV : 6 / 5 ; taux 10%, 2 tour(s) |
| guet-des-fonds | Vigie des Flots | ferveur | boost | - | I : 3 / 1 ; taux 25% ; II : 4 / 2 ; taux 20% ; III : 5 / equipe ; taux 15% ; IV : 6 / equipe-renforcee ; taux 20% |
| colonne-de-feu | Colonne de Feu | mauvais-oeil | malus | - | I : 3 / 1 ; taux 25%, 2 tour(s) ; II : 4 / 2 ; taux 20%, 2 tour(s) ; III : 5 / 3 ; taux 15%, 2 tour(s) ; IV : 6 / 5 ; VIDE : attend un autre biome ou la zone d’errance |
| fournaise-invoquee | Fournaise Invoquée | appel | invocation | - | I : 3 / 1 ; II : 4 / 2 ; III : 5 / 3 ; IV : 6 / 5 ; VIDE : attend un autre biome ou la zone d’errance |
| seve-rongeuse | Sève Rongeuse | mauvais-oeil | malus | - | I : 3 / 1 ; taux 25%, 2 tour(s) ; II : 4 / 2 ; taux 20%, 2 tour(s) ; III : 5 / 3 ; VIDE : attend un autre biome ou la zone d’errance ; IV : 6 / 5 ; VIDE : attend un autre biome ou la zone d’errance |
| hurlement | Hurlement | entrave | controle | - | I : 3 / 1 ; taux 25%, 1 tour(s) ; II : 4 / 2 ; taux 20%, 1 tour(s) ; III : 5 / 3 ; taux 15%, 1 tour(s) ; IV : 6 / 5 ; taux 10%, 1 tour(s) |
| morsure-putride | Morsure Putride | mauvais-oeil | malus | - | I : 3 / 1 ; taux 25%, 2 tour(s) ; II : 4 / 2 ; taux 20%, 2 tour(s) ; III : 5 / 3 ; taux 15%, 2 tour(s) ; IV : 6 / 5 ; taux 10%, 2 tour(s) |
| renvoi-celeste | Renvoi Céleste | rempart | renvoi | - | I : 3 / 1 ; taux 25%, 2 tour(s) ; II : 4 / 2 ; taux 20%, 2 tour(s) ; III : 5 / equipe ; taux 15%, 2 tour(s) ; IV : 6 / equipe-renforcee ; taux 20%, 2 tour(s) |
| hymne | Hymne | ferveur | boost | - | I : 3 / 1 ; taux 25% ; II : 4 / 2 ; taux 20% ; III : 5 / equipe ; IV : 6 / equipe-renforcee ; taux 20% |
| frisson-du-vice | Frisson du Vice | vice | malus | - | I : 3 / 1 ; x1.5 ; II : 4 / 2 ; x1.8 ; III : 5 / 3 ; x2.2 ; IV : 6 / 5 ; x2.6 |
| grondement-demoniaque | Grondement Démoniaque | fureur | degats | - | I : 3 / 1 ; x1.5 ; II : 4 / 2 ; x1.8 ; III : 5 / 3 ; x2.2 ; IV : 6 / 5 ; x2.6 |
| eclair-de-lorgueil | Éclair de l’Orgueil | orgueil | degats | - | I : 3 / 1 ; x1.5 ; II : 4 / 2 ; x1.8 ; III : 5 / 3 ; x2.2 ; IV : 6 / 5 ; x2.6 |

## Sorts de lignee (68)

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
| chair | C | Frôlement du Vice | 2 | 1.4 | false | Un contact glacé qui sème le doute dans l’ennemi. |
| chair | UC | Regard de Luxure | 3 | 1.6 | false | Un regard qui brûle : malédiction d’ATQ −25 % (2 tours). |
| chair | R | Haleine du Gouffre | 5 | 1.8 | false | Un souffle de fosse qui ralentit (2 tours). |
| chair | SR | Charme de l’Abysse | 9 | 2.6 | true | Le charme abyssal : dégâts et malédiction (2 tours). |
| chair | UR | Asmodia : Danse des Vices | 14 | 3.4 | true | La reine danse : ses vices frappent l’ennemi. |
| chair | L | Désir Absolu | 20 | 4.5 | true | Le désir dévorant, ultime. |
| puissance | C | Grondement des Fosses | 2 | 1.4 | false | La terre elle-même gronde contre l’ennemi. |
| puissance | UC | Coup des Fosses | 3 | 1.6 | false | Un coup de poing venu des profondeurs. |
| puissance | R | Cri de Fureur | 5 | 1.8 | false | Un cri qui étourdit (1 tour). |
| puissance | SR | Terreur Majeure | 9 | 2.6 | true | La terreur majeure : dégâts et malédiction (2 tours). |
| puissance | UR | Belzébuth : Couronne de Fureur | 14 | 3.4 | true | Le roi couronne sa fureur d’un coup dévastateur. |
| puissance | L | Ultime Fureur | 20 | 4.5 | true | La fureur absolue. |
| devoyes | C | Éclat Dévoyé | 2 | 1.4 | false | Un éclat de lumière tombée du ciel. |
| devoyes | UC | Bannière Renversée | 3 | 1.6 | false | La bannière des cieux s’est retournée : malédiction (2 tours). |
| devoyes | R | Zénith Fêlé | 5 | 1.8 | false | Le zénith se fissure et ralentit l’ennemi (2 tours). |
| devoyes | SR | Châtiment Renversé | 9 | 2.6 | true | Le châtiment retombe sur l’agresseur. |
| devoyes | UR | Voûte Renversée | 14 | 3.4 | true | La voûte céleste s’effondre sur l’ennemi. |
| devoyes | L | Chute de l’Empyrée | 20 | 4.5 | true | L’Empyrée elle-même chute. |
| paladin | R | Croisade Blanche | 5 | 1.8 | false | La croisade ébrèche les ténèbres. |
| paladin | SR | Mur de Lumière | 9 | 2.6 | true | Un rempart de lumière frappe l’ennemi. |
| paladin | UR | Isaure : Égide Ardente | 14 | 3.4 | true | L’égide de l’aube s’abat. |
| paladin | L | Aube Absolue | 20 | 4.5 | true | L’aube ne se lève qu’une fois. |
| chevalerie | R | Forteresse Mobile | 5 | 1.8 | false | Le rempart avance et frappe. |
| chevalerie | SR | Siège Inébranlable | 9 | 2.6 | true | Le siège devient assaut. |
| chevalerie | UR | Kiri : Lame du Serment | 14 | 3.4 | true | La lame invincible du chevalier. |
| chevalerie | L | Muraille Absolue | 20 | 4.5 | true | Rien ne passe. |

## Sorts uniques (41)

| id | nom | carte porteuse | role | cible | cout | mult | description |
| --- | --- | --- | --- | --- | --- | --- | --- |
| maree-noire | Marée Noire | e13 | degats | tous les ennemis | 3 | 1.5 | Le flot noir qui submerge tous les ennemis. |
| abime-absolu | Abîme Absolu | e14 | degats | tous les ennemis | 3 | 1.5 | Le gouffre s’ouvre et referme. |
| songe-des-profondeurs | Songe des Profondeurs | e17 | controle | 1 ennemi | 3 | 1.6 | Le rêve qui noie. |
| couronne-des-ecumes | Couronne des Écumes | e19 | boost | l’équipe | 3 | 1.5 | L’onction royale. |
| benediction-des-berges | Bénédiction des Berges | e22 | soin | l’équipe | 3 | 1.5 | La bénédiction du bord de l’eau. |
| chant-du-naufrage | Chant du Naufrage | e28 | controle | tous les ennemis | 7 | 2 | Le chant qui couche les équipages. |
| colere-des-recifs | Colère des Récifs | e30 | degats | tous les ennemis | 3 | 1.6 | La reine qui flagelle. |
| nuit-de-cendres | Nuit de Cendres | f13 | degats | tous les ennemis | 6 | 2.6 | La nuit de cendres s’abat sur tous les ennemis et les enflamme (15 % × 2 tours). |
| fournaise-eternelle | Fournaise Éternelle | f12 | invocation | les renforts | 4 | - | La fournaise ne s’éteint pas : ses renforts renaissent tant que le Gardien des Foyers tient. |
| linceul-de-suie | Linceul de Suie | f18 | controle | tous les ennemis | 6 | - | Le voile de suie descend sur tous les ennemis et les fige sur place. |
| fournaise-de-calcine | Fournaise de Calcine | f21 | malus | la zone | 5 | - | La fournaise de la Dame des Cendres embrase la zone et la laisse se consumer (15 % × 3 tours). |
| colere-de-vulcain | Colère de Vulcain | f22 | degats | la zone | 5 | 2.2 | Le colosse ardent frappe la zone et l’enflamme (brûlure 15 % × 2 tours). |
| aube-foliaire | Aube Foliaire | g7 | degats | tous les ennemis | 6 | 2.6 | Le Patriarche du Bosquet lève l’aube foliaire : la lumière frappe tous les ennemis et nourrit son lanceur. |
| racine-monde | Racine-Monde | g8 | degats | tous les ennemis | 6 | 2.6 | La racine du monde traverse le champ, frappe tous les ennemis et la sève s’y installe (15 % × 2 tours). |
| nuee-de-spores | Nuée de Spores | g16 | malus | tous les ennemis | 6 | - | Mycola couvre tous les ennemis de sa nuée : la sève ronge la ligne trois tours (10 % × 3 tours). |
| premiere-clarte | Première Clarté | g18 | soin | l’équipe | 6 | - | Adriel lève la première clarté : l’équipe est pansée et l’âme tombée la plus grande revient à la lumière. |
| nuit-des-seves | Nuit des Sèves | g21 | degats | la zone | 5 | 2.2 | Vesna fauche la zone et la sève s’y glisse (15 % × 2 tours). |
| voie-du-tombeau | Voie du Tombeau | k7 | invocation | les renforts | 4 | - | L’Archiliche ouvre la voie du tombeau : les défunts sortent en renforts et se relèvent tant qu’elle règne. |
| abime-remontant | Abîme Remontant | k8 | degats | tous les ennemis | 6 | 2.6 | L’Ancien Naufragé fait remonter l’abîme : la vague frappe tous les ennemis et les ralentit. |
| hurlement-fatal | Hurlement Fatal | k14 | controle | la zone | 5 | - | Le hurlement de Macha glace la zone sur place et son souffle l’empoisonne (15 % × 2 tours). |
| fauchade-universelle | Fauchade Universelle | k17 | degats | tous les ennemis | 6 | 2.6 | La Mort fauche la ligne entière : tous tombent, et les plus affaiblis passent outre le seuil. |
| deuil-eternel | Deuil Éternel | k19 | controle | tous les ennemis | 6 | - | Ysolde pleure la ligne entière : les ennemis se figent et le deuil les marque. |
| harpon-du-naufrage | Harpon du Naufrage | k22 | degats | la zone | 5 | 2.2 | Ahab harponne la zone et la rouille (corrosion 15 % × 2 tours). |
| epee-de-laube | Épée de l’Aube | k27 | degats | tous les ennemis | 6 | 2.6 | Jeanne d’Arc lève l’épée de l’aube : la lumière frappe tous les ennemis et purifie la ligne alliée. |
| lame-du-serment | Lame du Serment | k30 | degats | tous les ennemis | 6 | 2.6 | Siegfried brise le serment sur la ligne entière et l’empoisonne (10 % × 2 tours). |
| sentence-solaire | Sentence Solaire | z7 | degats | tous les ennemis | 6 | 2.6 | Le Héraut proclame la sentence solaire : la lumière frappe tous les ennemis et les écrase de son jugement. |
| couronnement | Couronnement | z8 | malus | tous les ennemis | 6 | - | L’Astre Capiteux se couronne : la lumière embrase tous les ennemis (brûlure 10 % × 2 tours). |
| eclipse-montante | Éclipse Montante | z15 | degats | la zone | 5 | 2.2 | Aurorine lève l’éclipse montante : la lumière frappe la zone puis la dérobe à ses habitants. |
| renaissance-pyrique | Renaissance Pyrique | z19 | degats | la zone | 5 | 2.2 | Pyrrha embrase la zone et renaît de ses cendres une fois par combat. |
| immolation-retournee | Immolation Retournée | z22 | renvoi | l’équipe | 5 | - | Fjalar déploie ses ailes : l’équipe renvoie 35 % des coups pendant 3 tours. |
| cantique-final | Cantique Final | z26 | boost | l’équipe | 6 | - | Célestin entonne le cantique final : l’équipe se dresse, boostée et affermie, tant que l’apôtre chante. |
| peine-capitale | Peine Capitale | z29 | degats | tous les ennemis | 6 | 2.6 | Justine exécute la peine capitale : la lame frappe tous les ennemis et ignore leurs boucliers. |
| prophetie-du-plein-jour | Prophétie du Plein Jour | z30 | degats | tous les ennemis | 6 | 2.6 | Apolline proclame la prophétie du plein jour : la lumière embrase tous les ennemis et dévoile leurs faiblesses. |
| arret-du-temps | Arrêt du Temps | d6 | controle | tous les ennemis | 7 | - | Kairos, Arbitre du Seuil : le temps s’arrête sur toute la ligne ennemie. |
| refrain-eternel | Refrain Éternel | d12 | boost | l’équipe | 6 | - | Écho, Voix Miroir : le refrain du chœur ne s’éteint pas. |
| destin-tisse | Destin Tissé | d18 | manip | l’équipe | 6 | - | Ananké, Tisseuse du Pont : elle tisse le destin de toute l’équipe (lien 50 %). |
| extase-interdite | Extase Interdite | d23 | degats | 1 ennemi | 6 | 2 | La signature d’Asmodia : extase et malédiction. |
| sceptre-du-jugement | Sceptre du Jugement | d28 | degats | 1 ennemi | 6 | 2 | La signature de Belzébuth : jugement et étourdissement. |
| devoration-totale | Dévoration Totale | d32 | degats | 1 ennemi | 9 | 2.2 | La signature de Famine : tout dévorer. |
| souffle-noir | Souffle Noir | d36 | degats | 1 ennemi | 6 | 2 | La signature de Peste : un souffle de malédiction. |
| lumiere-noire | Lumière Noire | d40 | degats | 1 ennemi | 6 | 2 | La signature de l’Astre Rayonnant : la lumière qui brûle. |

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
| vice | le Vice | malus | Occultiste, Assassin | la chair, le désir |
| fureur | la Fureur | degats | Guerrier, Occultiste | la puissance, la fureur |
| orgueil | l'Orgueil | degats | Guerrier, Prêtre | mauvaise volonté, dévoyé |

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
| crepuscule | Griffe Nocturne / Voile d’Ombre / Malédiction du Soir / Danse des Ombres / Oubli Éternel / Nuit Sans Fin |
| vol | Larcin Agile / Coup de Jarnac / Dague dans le Dos / Fauchage / Embuscade / Coup de Grâce |
| zele | Étincelle de Foi / Hymne du Matin / Bénédiction du Jour / Croisade / Aurore Radieuse / Lumière Éternelle |
| appel | Appel Mineur / Élémentaire de Braise / Meute Spirituelle / Portail / Légion Céleste / Appel Suprême |
| seuil | Sablier I / Sablier II / Sablier III / Sablier IV / Sablier V / Sablier VI |
| miroir | Reflet I / Reflet II / Reflet III / Reflet IV / Reflet V / Reflet VI |
| pont | Fil I / Fil II / Fil III / Fil IV / Fil V / Fil VI |
| chair | Frôlement du Vice / Regard de Luxure / Haleine du Gouffre / Charme de l’Abysse / Asmodia : Danse des Vices / Désir Absolu |
| puissance | Grondement des Fosses / Coup des Fosses / Cri de Fureur / Terreur Majeure / Belzébuth : Couronne de Fureur / Ultime Fureur |
| devoyes | Éclat Dévoyé / Bannière Renversée / Zénith Fêlé / Châtiment Renversé / Voûte Renversée / Chute de l’Empyrée |
| paladin | Lumière du Serment / Frappe Consacrée / Croisade Blanche / Mur de Lumière / Isaure : Égide Ardente / Aube Absolue |
| chevalerie | Coup de Bouclier / Charge du Rempart / Forteresse Mobile / Siège Inébranlable / Kiri : Lame du Serment / Muraille Absolue |

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

### Donjon forge

| monstre | sort appris | cran |
| --- | --- | --- |
| f1 | morsure-decume | I |
| f2 | morsure-decume | I |
| f14 | morsure-decume | I |
| f3 | morsure-decume | II |
| f24 | morsure-decume | II |
| f4 | morsure-decume | II |
| f8 | morsure-decume | II |
| f11 | morsure-decume | II |
| f6 | morsure-decume | III |
| f17 | chant-de-sirene | IV |
| f16 | etreinte-des-profondeurs | II |
| f7 | onde-consacree | I |
| f9 | carapace-de-corail | I |
| f10 | carapace-de-corail | II |
| f15 | colonne-de-feu | I |
| f19 | colonne-de-feu | II |
| f20 | colonne-de-feu | III |
| f5 | fournaise-invoquee | I |
| f23 | fournaise-invoquee | II |
| f12 | - | - |
| f13 | - | - |
| f18 | - | - |
| f21 | - | - |
| f22 | - | - |

### Donjon bosquet

| monstre | sort appris | cran |
| --- | --- | --- |
| g1 | etreinte-des-profondeurs | I |
| g2 | morsure-decume | I |
| g3 | morsure-decume | II |
| g4 | morsure-decume | II |
| g5 | morsure-decume | III |
| g6 | morsure-decume | III |
| g9 | onde-consacree | I |
| g10 | fournaise-invoquee | I |
| g11 | carapace-de-corail | III |
| g12 | carapace-de-corail | I |
| g13 | fournaise-invoquee | II |
| g14 | seve-rongeuse | I |
| g15 | seve-rongeuse | II |
| g17 | onde-consacree | III |
| g19 | chant-de-sirene | IV |
| g20 | morsure-decume | III |
| g7 | - | - |
| g8 | - | - |
| g16 | - | - |
| g18 | - | - |
| g21 | - | - |
| g31 | seve-rongeuse | I |
| g32 | etreinte-des-profondeurs | II |

### Donjon crypte

| monstre | sort appris | cran |
| --- | --- | --- |
| k1 | morsure-decume | I |
| k2 | morsure-decume | I |
| k23 | morsure-decume | I |
| k3 | morsure-decume | II |
| k4 | morsure-decume | II |
| k5 | morsure-decume | III |
| k20 | morsure-decume | III |
| k28 | morsure-decume | III |
| k13 | morsure-putride | I |
| k6 | hurlement | III |
| k9 | onde-consacree | I |
| k10 | guet-des-fonds | I |
| k11 | onde-consacree | II |
| k12 | carapace-de-corail | I |
| k15 | fournaise-invoquee | I |
| k16 | fournaise-invoquee | III |
| k18 | oeil-du-malheur | IV |
| k21 | marque-corrosive | II |
| k24 | guet-des-fonds | III |
| k25 | carapace-de-corail | II |
| k26 | carapace-de-corail | III |
| k29 | guet-des-fonds | IV |
| k7 | - | - |
| k8 | - | - |
| k14 | - | - |
| k17 | - | - |
| k19 | - | - |
| k22 | - | - |
| k27 | - | - |
| k30 | - | - |
| k31 | morsure-putride | I |
| k32 | hurlement | I |

### Donjon zenith

| monstre | sort appris | cran |
| --- | --- | --- |
| z1 | morsure-decume | I |
| z2 | morsure-decume | I |
| z3 | morsure-decume | II |
| z4 | morsure-decume | II |
| z5 | morsure-decume | III |
| z6 | morsure-decume | IV |
| z13 | morsure-decume | III |
| z14 | morsure-decume | III |
| z28 | morsure-decume | III |
| z16 | colonne-de-feu | I |
| z17 | colonne-de-feu | II |
| z18 | colonne-de-feu | III |
| z12 | carapace-de-corail | I |
| z23 | carapace-de-corail | I |
| z20 | renvoi-celeste | I |
| z21 | renvoi-celeste | II |
| z9 | onde-consacree | I |
| z10 | onde-consacree | II |
| z11 | onde-consacree | III |
| z24 | onde-consacree | II |
| z25 | hymne | III |
| z27 | oeil-du-malheur | II |
| z7 | - | - |
| z8 | - | - |
| z15 | - | - |
| z19 | - | - |
| z22 | - | - |
| z26 | - | - |
| z29 | - | - |
| z30 | - | - |
| z31 | colonne-de-feu | I |
| z32 | renvoi-celeste | I |

### Donjon divin

| monstre | sort appris | cran |
| --- | --- | --- |
| d1 | hurlement | I |
| d2 | hurlement | II |
| d3 | etreinte-des-profondeurs | IV |
| d4 | hurlement | IV |
| d5 | hymne | IV |
| d6 | - | - |
| d7 | renvoi-celeste | I |
| d8 | hymne | I |
| d9 | renvoi-celeste | III |
| d10 | hymne | II |
| d11 | renvoi-celeste | IV |
| d12 | - | - |
| d13 | marque-corrosive | I |
| d14 | morsure-putride | II |
| d15 | marque-corrosive | IV |
| d16 | morsure-putride | III |
| d17 | morsure-putride | IV |
| d18 | - | - |
| n13 | onde-consacree | II |
| n14 | morsure-decume | I |
| n15 | oeil-du-malheur | II |
| p1 | onde-consacree | II |
| p2 | onde-consacree | II |
| d19 | frisson-du-vice | I |
| d20 | frisson-du-vice | II |
| d21 | frisson-du-vice | III |
| d22 | frisson-du-vice | IV |
| d29 | frisson-du-vice | III |
| d30 | frisson-du-vice | IV |
| d31 | grondement-demoniaque | III |
| d24 | grondement-demoniaque | I |
| d25 | grondement-demoniaque | II |
| d26 | grondement-demoniaque | III |
| d27 | grondement-demoniaque | IV |
| d33 | frisson-du-vice | II |
| d34 | grondement-demoniaque | II |
| d35 | grondement-demoniaque | IV |
| d23 | - | - |
| d28 | - | - |
| d32 | - | - |
| d36 | - | - |
| d37 | eclair-de-lorgueil | I |
| d38 | eclair-de-lorgueil | III |
| d39 | eclair-de-lorgueil | IV |
| d40 | - | - |

### Donjon recrues

| monstre | sort appris | cran |
| --- | --- | --- |
| n1 | carapace-de-corail | I |
| n2 | decharge-arcanique | I |
| n3 | onde-consacree | I |
| n4 | frappe-dans-le-dos | I |
| n5 | morsure-decume | I |
| n6 | colonne-de-feu | I |
| n7 | seve-rongeuse | I |
| n8 | morsure-putride | I |
| n9 | etreinte-des-profondeurs | I |
| n10 | carapace-de-corail | I |
| n11 | seve-rongeuse | II |
| n12 | etreinte-des-profondeurs | I |
| a3 | carapace-de-corail | I |
| a4 | colonne-de-feu | I |
| a9 | morsure-decume | I |
| s2 | onde-consacree | I |
| s3 | oeil-du-malheur | I |
| a34 | morsure-decume | I |
| a35 | onde-consacree | I |
| a36 | frappe-dans-le-dos | I |
| a37 | frappe-dans-le-dos | I |
| a38 | morsure-decume | I |
| a39 | guet-des-fonds | I |
| a40 | morsure-decume | II |
| a41 | carapace-de-corail | II |
| a42 | onde-consacree | I |
| a43 | onde-consacree | II |
| a44 | chant-de-sirene | II |
| a45 | frappe-dans-le-dos | II |
| a46 | morsure-decume | II |
| a47 | morsure-decume | I |
| a48 | carapace-de-corail | II |
| a49 | guet-des-fonds | II |

