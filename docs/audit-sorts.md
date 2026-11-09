# Audit de cohérence des sorts (v0.43 à v0.45)

> Passe complète sur les 238 cartes du catalogue : qui acquiert quoi, quand, et si tout se tient. Méthode : extraction du CSV du catalogue v0.43.1, recoupement avec les données embarquées du `dist.html` (grammaire des sorts, chaînes d'évolution, sorts de famille), et lecture du moteur (règle de cumul `acc` à l'évolution). Effectué le 09/11/2026.

## Verdict global

**Le catalogue est propre.** La grammaire des sorts (v0.43) est appliquée sans exception sur les 238 cartes, les chaînes d'évolution sont intactes et la règle du cumul fonctionne. Un seul vrai défaut moteur (constat 1, la duplication du cumul), deux écarts assumés entre le jeu et le design (constats 3 et 5), et deux points à trancher (constats 2 et 4).

## Ce qui est vérifié et passe

| Contrôle | Résultat |
| --- | --- |
| Aucun lien d'évolution cassé (EVO_CHOICES, SOLO_STEPS, chaînes de familles, lignes de webs) | les 238 cartes sont joignables, aucune cible inconnue |
| Les 189 signatures | toutes distinctes, zéro doublon de nom |
| Les communs | 152 attaquants ont Frappe Précise, 86 soigneurs ont Premiers Soins : exactement 238, aucune exception |
| Les sorts de race | un sort unique par race (Discipline de Ligne, Instinct Sauvage, Vol en Rase-Mottes, Ferveur Céleste), porté par les 15 naissances |
| Les sorts de classe | un sort unique par classe (5 classes, 5 sorts), porté par les naissances et les solos ; aucune carte ne porte le sort d'une autre classe |
| Le cumul des familiales | chaque maillon contient les sorts de ses prédécesseurs plus exactement un sort nouveau ; aucun maillon ne perd un sort ; 6 sorts de lignée par famille (un par palier C à L), la fiche de la L compte 7 sorts (commun + 6) |
| L'échelle des coûts de lignée | identique pour les 7 familles : 2, 3, 5, 9, 14, 20✦ ; les gros sorts commencent au SR ; les multiplicateurs montent de ×1.4-1.5 (C) à ×4.5-6.0 (L) |
| Le mana des familiales | progressif par palier : 8, 11, 14, 22, 30 puis 40 de réserve |
| Les 7 graines archivées | portent exactement les 4 premiers sorts de lignée de leur famille (rang SR), aucune fuite vers une autre famille |
| Les sorts des nommés | chaque L de famille porte les deux ultimata au nom de son héros (Kenji : Zénith Tranchant puis Tranche-Monde, etc.) |

## Constat 1 (moteur) : le cumul duplique les sorts déjà appris

À chaque évolution, le moteur ajoute la liste **complète** de la forme passée au cumul de l'exemplaire (`inst.acc`), sans déduplication. Or les fiches des familiales sont déjà cumulatives : un exemplaire qui monte n1 → a30 → a6 → a10 → a15 → a17 arrive en combat avec **29 entrées de sorts pour 10 sorts réels** (Frappe Précise compte 6 fois, Taillade du Mat 5 fois, etc.). Conséquences :

- la fiche affiche « ✨ 22 hérités » alors que l'exemplaire n'a que 3 sorts hérités réellement nouveaux (Discipline de Ligne, Brise-Garde, Prise de Garde) ;
- en Mode Tactique, le panneau affiche un bouton par entrée : les sorts dupliqués apparaissent plusieurs fois ;
- l'auto-battle est neutre (elle lance le sort le plus cher payable, la duplication ne change rien), et la puissance d'équipe utilise la fiche du catalogue (pas le cumul) : l'équilibrage n'est pas touché.

**Recommandation** : dédupliquer par nom au moment du cumul (n'ajouter que les sorts jamais vus de l'exemplaire), ou au moment de l'affichage. Le compteur « hérités » doit compter les sorts uniques.

## Constat 2 (économie) : les portes C vers C du voleur

Le Voleur Novice (n4, palier C) évolue vers le Braconnier des Quais (a34, C) ou le Jongleur de Fête (a37, C) : une évolution **au même palier**, payée au tarif de la rareté de départ (3 éclats bruts). C'est cohérent avec le rôle de porte raccourcie des solos, mais le joueur paie un coût d'évolution sans gagner de palier. À assumer dans l'économie ou à tarif spécial.

## Constat 3 (jeu vs design) : les divines restent minces en sorts

Les 18 divines n'ont que 2 sorts au catalogue (commun + signature), même leurs trois L (Kairos, Écho, Ananké). Leurs mécaniques de famille (figer le temps, copier les sorts, lier les alliés) vivent dans leurs Pouvoirs automatiques, pas dans leurs sorts. Le design du rework des arbres (v13) prévoit des lignées divines complètes avec l'apprentissage par palier : ce chantier devra enrichir leurs fiches, ou assumer que la divine vit par son Pouvoir. À noter aussi : l'Ange entre les Arbitres directement au palier UC (n13 → d3), les deux communes d1 et d2 ne sont pas sur son chemin.

## Constat 4 (spec) : le modèle v3 « 4 sorts classiques » n'est pas celui du jeu embarqué

Le document de référence v3 prévoyait 4 sorts classiques appris en C, UC, R et SR, puis les sorts 5 et 6 de la voie. Le jeu embarqué applique un autre modèle, cohérent en soi : le commun partout, 4 sorts personnels pour les naissances, et **un sort de lignée par palier** pour les familiales (2 sorts au C, 7 à la L). Les sorts des nommés (Tranche-Monde) jouent de facto le rôle des sorts signature des L. Le rework des arbres (graphes en racines, sorts de voie) tranchera la réconciliation ; les deux documents doivent citer le même modèle.

## Constat 5 (jeu vs design) : les graines ne convergent pas

Le design v13 (fusion totale, 2.5) fait de chaque graine un SR alternatif qui converge vers l'UR de sa famille. Dans le jeu, les 7 graines archivées (b1 à b7) n'évoluent pas : « une branche ne fait pas partie d'une chaîne d'évolution ». Écart déjà documenté (elles sont « dormantes, pour les choix à venir ») : le chantier des racines les réactivera.

## Le point sur les convergences (a29, a32 → s5)

Au catalogue, la convergence élue de la lumière ne cumule pas : la Prêtresse de l'Aube ne porte pas les sorts Eau ou Braise de sa source. Mais le moteur cumule à l'échelle de l'exemplaire : il garde tout (règle des 100 % des sorts, la même que la régression et la conversion du design). Le comportement est donc correct en jeu ; seule la fiche cible ne montre pas l'origine. À tester en Mode Tactique : les sorts Eau hérités doivent apparaître dans le panneau de la prêtresse.

---

*Inventaires : `inventaire-cartes.md` et `inventaire-sorts.md`. Arbres : `arbres-evolution.md` et `arbres-sorts.md`.*

## Mise à jour v0.47

Le dist applique la règle : **un sort signature ne répète plus le nom de sa carte**. Le sort L du Sabre (« Kenji : Sabre Céleste ») devient **Tranche-Monde** ; le sort L de l’Ombre (« Kira : Nuit Sans Fin ») devient **Nuit Éternelle** ; « Kenji : Zénith Tranchant » reste ; l’Aube garde son exception assumée (Aube Éternelle, le nom de Léna).
