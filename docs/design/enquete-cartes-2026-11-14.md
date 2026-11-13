# Enquête de traçabilité — les cartes « perdues » de Marc-Olivier (14/11, suite 26)

> Demande : « il y a plein de choses qui existaient et je ne les trouve plus... tu peux faire un peu de tri et d'ordre et de recherche. » Méthode : chaque carte citée a été cherchée dans les data du jeu (v1.51), le v18 (inventaire de l'état du jeu), le v17 (archive des propositions) et les tables générées (`docs/tables/cartes.md` et `monstres.md`). Pour voir les cartes dans le jeu : la collection par race (bandeau Crypte pour la nymphe, mini-lignées pour les quais et la fête), ou les tables générées dans `docs/tables/`.

## 1. Premier verdict : rien n'a disparu du jeu

Le v18 n'a rien supprimé : c'est l'inventaire de ce qui EST dans le jeu (v1.51) plus le gel à construire. Les propositions du v17 non construites vivent soit dans le gel (v18 §6), soit dans la liste différée v2+ (v18 §9, liste fermée). Aucune carte du jeu n'a été retirée par les refontes de docs. Ce qui « manque » dans la mémoire sont presque toujours les **sommets UR/L des mini-lignées**, définis en proposition au v17 et volontairement différés v2.

## 2. Les cartes citées, une par une

| Carte demandée | Verdict | Où elle est |
| --- | --- | --- |
| Nymphe Croupie | **DANS LE JEU** | k2, monstre C de la Crypte (Mage, Eau) ; famille des Naufragés, le deuil marin ; `data/monsters.json`, table `docs/tables/monstres.md` ; espèce d'art dédiée `stagnantNymph` (correctif d'art acté 13/11 : figure nymphique humanoïde, pas un monstre reptilien) |
| Servante Pâle | **DANS LE JEU** | k9, C Prêtre Ombre, même famille des Naufragés |
| « la famille des nymphes » | **DANS LE JEU, sous le nom NAUFRAGÉS** | la lignée du deuil marin de la Crypte : Nymphe Croupie, Servante Pâle, Veilleuse de Bord (k12), Meneuse de Deuil (k10), Capitaine Noyé, Prieuse des Naufragés, Revenu des Flots, Endeuillée des Flots → Ysolde et Ahab (L), M : Ancien Naufragé (v17 §8.4, v18 §4). Si le nom vitrine « Nymphes » doit revenir, c'est un renommage à trancher, pas une reconstruction |
| Braconnier des Quais → Chasseur des Quais → Maître des Brumes | **DANS LE JEU** | a34 → a40 → a41, mini-lignée des quais depuis n4 (v18 §3), verrou R |
| Brumaire (le sommet des quais) | **DIFFÉRÉE v2, pas perdue** | proposée v17 (« Brumaire, Renard des Quais ➕ · L, nom proposé »), jamais construite ; listée v18 §9 « sommets quais/fête » ; idem **Ombre des Quais ➕ · UR** |
| Jongleur de Fête → Artiste de Fête → Maître Jongleur | **DANS LE JEU** | a37 → a45 → a46, mini-lignée de la fête depuis n4 (v18 §3), verrou R |
| Colombine (le sommet de la fête) | **DIFFÉRÉE v2** | proposée v17 (« Colombine, Reine de la Fête ➕ · L ») ; idem **Virtuose de Fête ➕ · UR** ; v18 §9 |
| « une garde du rempart dans les prêtres » | **DANS LE JEU** | la voie « la garde » du Prêtre (n3) mène à s14 Garde du Rempart (UC, bouclier), qui continue vers la lignée du Bouclier (Sentinelle d'Acier → Bastion Arcanique → Argus) et le chevalier du gel (§6.4, vers Kiri l'Invincible) |
| Les autres mini-lignées (mémoire juste) | **DANS LE JEU** | Palefrenière a35 → Écuyère des Routes a42 → Première Écuyère a43 ; Dunes a36 → Guide des Dunes a44 ; Charpentiers a38 → a47 → Maître Charpentier a48 ; Guet a39 → Capitaine du Guet a49 (v18 §3 : « sommets UR/L différés v2 ») |

**Réponse directe** : les cartes existent toutes ; ce qui manque sont les sommets UR/L des mini-lignées, définis ensemble au v17 et volontairement différés v2. Si l'envie vient de les rapatrier dans le gel v1 (Brumaire, Colombine, Ombre des Quais, Virtuose de Fête), c'est un tranchage de périmètre à prendre explicitement.

## 3. Le lien n15 Éveillé du Seuil → d14 Aiguille du Pont : d'où il sort

- **Origine mécanique** : patch 3.3 du 09/11 (v0.41) — chaque naissance divine devait mener à une famille existante « sans trous cachés » : n13 → d3 (Seuil), n14 → d8 (Chœur), n15 → d14 (Pont). Le v17 l'avait justifié : « l'Éveillé du Seuil change de rôle : il est la commune de la troisième famille, celle qui ne choisit pas de camp. »
- **La vision d'origine de Marc-Olivier (reçue le 14/11, suite 26)** : n15 est **l'AÎNÉE COMMUNE des trois familles divines joueur** — la Garde du Seuil, la Lame Miroir, la Fileuse du Pont — nées d'une même lignée.
- **PROPOSITION (à trancher)** : recâbler l'éveil de n15 vers les TROIS familles divines au choix (d1 Garde du Seuil / d7 Lame Miroir / d13 Fileuse du Pont), le Pont restant le choix par défaut actuel. **Bonus** : cela résout l'accès au Chœur Miroir sans n14 (option d de la spec trappes §4), sans carte ni événement nouveaux, et c'est cohérent avec « celle qui ne choisit pas de camp » : les trois familles divines joueur sont précisément les sans-camp (les camps, c'est ange et démon).

## 4. Kairos et l'équilibre : divergence doc/jeu corrigée

- Le JEU dit : d6 = **« Kairos, Arbitre du Seuil »**, rareté L, Occultiste, Lumière (`data/monsters.json`, table monstres.md) — la L de la chaîne d1-d6 du Seuil.
- Le v18 écrivait « Kairos, Juge Éternel » dans la chaîne (§2 et diagramme 10.7) et étiquetait d6 « M monstre » dans le diagramme de l'événement (10.6) : les deux étaient des scories — « Juge Éternel » n'existe ni dans le jeu ni dans le v17 ni dans les arbitrages, et d6 est une L, pas une M. **Corrigé ce jour dans le v18** (alignement sur le jeu).
- La question « l'équilibre, comment le mettre » reste **OUVERTE** : l'événement d'équilibre (p1 → d6) et la M de l'Équilibre sont différés v2 (événements, v18 §9) ; le donjon Équilibre est tranché (sous-bosses puis Ananké en version supérieure). À reprendre au chantier des donjons divins.

## 5. La coloration : confirmation

« Tu peux la laisser, elle a déjà été définie » → **CONFIRMÉ** : la coloration reste DORMANTE en v1, déjà définie v14/v17 §3.1 : l'eau finit deux fois (la coloration divine en **Calypso, Déesse des Océans** ; la mortelle régressée garde son nom : **Alix, Déesse de l'Eau**), l'aube → Léna, le sabre → Kenji (v18 §9, destinées post-L). Elle n'est donc PAS réutilisée pour l'accès Chœur : l'option « coloration-eau » de la spec trappes est ÉCARTÉE, remplacée par l'option n15 (§3 ci-dessus).

## 6. Où chercher soi-même

- `docs/tables/cartes.md` (les 150 cartes joueur, id par id) et `docs/tables/monstres.md` (les 159 monstres) : générées depuis les data, référence exacte de ce qui est dans le jeu.
- `docs/design/design-arbres-v18.md` §2 (familles), §3 (mini-lignées), §4 (webs), §9 (différé v2).
- `docs/historique/design-arbres-v17.md` (archive des propositions, incl. les noms proposés jamais construits).
