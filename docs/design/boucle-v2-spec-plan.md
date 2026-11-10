# Spec et plan : boucle de jeu v2 (moteur, data, UI — brief du couloir 1)

> Statut : **ACTÉ** le 11/11/2026. Toutes les règles de ce chantier sont tranchées (voir `docs/arbitrages.md`, entrées du 11/11 : « boucle de jeu v2 », « sets d'équipement par zone », « calibrage post-lignes et précisions boucle v2 »). Ce document fixe les exigences moteur/data/UI et le plan en lots. Source de vérité des valeurs : `data/*.json` ; chaque changement de maths = digest recalibré et documenté dans `docs/arbitrages.md`. Les questions d'équilibre (Zénith, taux global) restent ouvertes jusqu'à la re-mesure finale : **on n'équilibre qu'une fois**.

## 0. Références à lire avant de coder

- `docs/arbitrages.md` : entrées du 11/11 citées ci-dessus (les 9 points de la boucle v2, les tranchages de calibrage, la précision « soins complets entre deux runs »).
- `docs/regles-jeu.md` §2 (évolution sans perte nette, solos archivés), §5 (régénération, fenêtre d'action, formation et rangs), §6 (niveaux de donjon, errance v2, recrutement naturel, départ à 2 cartes).
- `docs/design/economie-v2-catalogues.md` §1 (potions : prix, gorgées libres en combat), §6 (impact moteur et migration).
- `docs/design/errance-topdown.md` §7 (contrat d'entrée/sortie de combat, grâce) et §8 (autels de la démo) pour le hook « autel de soin ».
- `docs/roadmap.md` point 5 (ce chantier), point 8 (calibrage digest différé), point 9 (bloc visuel, hors périmètre ici).

## 1. Exigences moteur et data

### 1.1 Régénération et persistance (Lot 1)

- **Aucune régénération naturelle entre les combats d'un même run** : PV et mana persistent d'un étage à l'autre et d'un combat à l'autre ; les effets temporaires de combat se dissolvent entre deux combats (comportement courant conservé).
- **Régénération complète après le premier boss** d'un donjon (étage 5). Pas de régénération au boss final.
- **Soins complets entre deux runs distincts** (précision ACTÉE 11/11) : la persistance ne vit qu'au sein d'un run (et, plus tard, au fil de l'errance) ; au démarrage d'un nouveau run, l'équipe revient à plein.
- **Hook « autel de soin »** : fonction dédiée (soin complet + pas de grâce, cf. démo §8 de `errance-topdown.md` : +5 pas), posée dès maintenant, branchée aux autels des zones d'errance quand l'errance arrive. Aucun écran d'errance n'est requis dans ce chantier.

### 1.2 Potions et action Objet (Lot 1)

- Nouvelle action **« Objet »** dans la fenêtre d'action : potions de soin (30 % puis 60 % des PV max) et de mana (40 % puis 80 %), chaque gorgée **coûte son tour** (ACTÉ) ; utilisables aussi hors combat, entre les étages. Prix Boutique : 50/120/60/140 or (`economie-v2-catalogues.md` §1).
- **Point d'achat minimal** : la conversion ⚡ → or (1 ⚡ = 1 or, ACTÉ) et un rayon potions font partie du Lot 1, sinon la suppression de la régén rend les donjons injouables. La Boutique complète (équipement, éclats, gemmes brutes, marchand, Guilde) reste au bloc visuel (roadmap point 9).
- Migration de sauvegarde (version +1) : stock de potions, solde en or (conversion du ⚡ existant), état de run.

### 1.3 Niveaux de donjon 1 → 25 (Lot 2)

- Chaque marche (donjon × mode, 25 marches) porte un **niveau de donjon** fixant la puissance attendue de l'équipe et la **bande de rareté** : Facile C → R, Normal UC → SR, Difficile R → UR, Très difficile SR → L, Enfer UR → M ; boss final en haut de bande, boss intermédiaire un cran sous.
- **Bestiaire thématique croissant par mode** (ex. Zénith : fanatiques → fanatiques endurcis → anges → archanges → l'Astre) : les pools par mode vivent dans les data de donjons/difficultés.
- Drops et points suivent le niveau ; courbe simulée au digest (fin des blocages et des enchaînements imprévisibles). Les 25 donjons distincts restent écartés.

### 1.4 Départ à 2 cartes (Lot 3)

- Écran de départ : **4 propositions, une par race** (un novice humain, un bestial, un mystique, un divin) ; le joueur en choisit une, la seconde est **aléatoire parmi les trois restantes**. Plus d'équipe complète de départ.
- L'équipe se remplit par recrutement naturel, quêtes et Guilde (la Guilde reste au bloc visuel : le recrutement naturel suffit d'ici là).

### 1.5 Recrutement naturel (Lot 3)

- **~1 %** de chance qu'un vaincu demande à rejoindre la collection, **hors nommés et boss** ; taux calibré **par zone** dans `data/zones.json`, jamais en dur.
- La limite de 3 exemplaires par carte s'applique ; toast de recrue à l'écran.

### 1.6 Drops v2 (Lot 4)

- **Matériaux de la saveur de chaque zone** sur les monstres ; **pièce d'équipement et matière garanties sur les boss** ; équipement à **taux très faible** partout ailleurs (sets par zone : `economie-v2-catalogues.md` §2).
- **Gemmes brutes vendables** (révision datée du 11/11) ; les polies, gravées et éternelles restent aux boss.
- Structure data : tables de drops par zone/matériau, référencées par le futur craft (bloc visuel). Le craft en ville n'est **pas** dans ce chantier.

### 1.7 Progression (Lot 5)

- **XP classique** : croissance par niveau recalibrée sur l'échelle longue (25 marches), simulée au digest ; pas de gel à paliers (refusé).
- **Palier d'évolution sans perte nette** : la forme suivante au niveau 1 reste au moins aussi forte que la forme précédente au niveau 10 (stats principales) ; vérifié par simulation, pas à la main.
- **Solos archivés** : retrait du pool actif (drops, recrutement, offres), les cartes restent en data pour les vieilles sauvegardes ; greffe future aux familles inscrite en roadmap.
- **Rang N des naissances** (ACTÉ, jamais migré) : rareté `N` sous C, éveil N → C, exclusions des drops et du recrutement ; les naissances restent jouables en combat (précision du 10/11).

## 2. Exigences UI

- Fenêtre d'action : bouton **Objet** au même rang que ⚔ et des sorts, badge de type, compteur de potions, action éteinte si stock vide.
- Persistance lisible : l'écran d'étage et le plateau montrent les PV/mana courants ; jamais de remise à plein en cours de run (sauf après le premier boss).
- Sélecteur de marche : niveau de donjon et bande de rareté affichés en toutes lettres.
- Écran de départ : les 4 propositions côte à côte, la choisie s'anime, l'aléatoire se révèle.
- Mobile : boutons ≥ 32 px (correctif terrain acté), aucun panneau plein écran sans bouton de fermeture.
- Non-régression : FX vidéos v0.48 (toggle 🎬) et ciblage v2 intacts.

## 3. Plan d'exécution

| Lot | Contenu | Digest |
|---|---|---|
| 1 | Action Objet + achat minimal + régén/persistance + hook autel + migration | recalibré |
| 2 | Niveaux de donjon 1 → 25, bandes de rareté, bestiaires par mode | recalibré |
| 3 | Départ à 2 cartes + recrutement naturel | recalibré |
| 4 | Drops v2 (matériaux, pièces et matière de boss, gemmes brutes) | recalibré |
| 5 | XP longue échelle + sans perte nette + solos archivés + rang N | recalibré |
| 6 | Baseline finale : digest documenté (N = 10 000, 0 exception, 0 marathon), build/tests/smoke, arbitrages | nouvelle baseline |

- Un lot = un ou plusieurs commits français ; `data/*.json` source de vérité, aucune valeur en dur dans le moteur.
- Chaque lot qui change une règle met à jour `docs/regles-jeu.md` (statut « implémenté ») et consigne sa mesure de digest dans `docs/arbitrages.md`.
- Non-régression de chaîne : build déterministe, tests et smoke au moins aux seuils courants (115 tests, 171 checks), `node tools/gen-tables.mjs` relancé après chaque changement de data.
- Le calibrage d'équilibre (Zénith, taux global, prix des potions) se tranchera **une seule fois**, après ce chantier et l'économie v2 (roadmap point 8).
- Le moteur d'errance peut être codé en parallèle avec sprites placeholder (roadmap point 9), mais il n'est pas requis pour fermer ce chantier.
