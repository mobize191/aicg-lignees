# Prompt — correctifs v1.37 : flux Terres Sauvages/donjons, boutons équipe, Tactique par défaut, Boutique, esquive invisible, sorts signature, héros errant (retours terrain de Marc-Olivier, 12/11 7e et 8e tours)

> Statut : ACTÉ par Marc-Olivier (12/11, 7e et 8e tours). Couloir 1 : exécute APRÈS le chantier errance v1.36.1 (`docs/prompt-correctif-errance-v1.36.1.md`), qui reste prioritaire. Une tâche = un commit FR. Preuve par lot : build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digests INCHANGÉS. Lot 2 : capture 390×844 exigée ; lot 5 : capture du feedback d'esquive exigée.

## Contexte (reproduit et vérifié sur main par le couloir pilotage)

**8e tour (combats de zone dans les Marées, équipe Ange + Épéiste Novice vs Chanteuse + Pillard des Récifs, 6 fois le même bug)** :

1. **« Rien ne se passe » au tour 2 = esquive invisible.** Le Pillard des Récifs est un **Assassin** : esquive 15 % + 1 % par point d'AGI d'écart (plafond 30 %, `DODGE_PER_AGI`) → ~22 % contre l'Ange (AGI 3 vs 10). L'attaque de l'Ange au tour 2 a été **esquivée** : le moteur pousse bien un événement `dodge` (`src/engine/combat.js`), l'UI l'affiche seulement en `floatText('💨 Esquive')` fugace — invisible en jeu. Et comme le seed de la vague est **identique toute la journée** (`waveSeedFor` = hash de `jour|donjon|diff`), les 6 combats ont rejoué la même séquence → 6 fois le même jet d'esquive au tour 2. Attaquer la Chanteuse (Occultiste, 0 esquive) ne montre rien d'anormal, ce qui confirme.
2. **« 5 dégâts au lieu de 7 » = frappe de Prêtre à 70 %.** L'Ange (n13) est de classe **Prêtre** : `CLASSE_MODS.Prêtre.strike = 0.7` (dans `data/engine.json`) → 7 × 0,7 ≈ 5. Mécanique normale, mais **rien ne l'explique au joueur** (ni fiche, ni fenêtre d'action).
3. **Sorts signature : ciblage toujours « alliés » + effets absents.** Les sorts signature (`cat: 'unique'`, construits dans `src/data.js` et `src/ui.js` sans `cible` ni `role`) font renvoyer `null` par `spellSideOf` → le filet retombe sur `'ally'` → la fenêtre d'action propose **toujours les alliés** comme cibles, même pour un sort de dégâts ; le moteur, lui, applique les dégâts aux ennemis → « en sélectionnant une de mes cartes, ça attaque les ennemis ». Et la fiche n'affiche pas l'effet du sort signature (rôle, puissance, cible).
4. **Reprise de mouvement après combat.** `store.errance` traverse le combat tel quel (`hero.path`, `pending`, `goal` intacts) : au retour dans l'errance le héros **reprend son chemin tout seul** ; la grâce post-combat n'est que de **2 pas** (consommés en une à deux secondes) → rencontre relancée immédiatement après une victoire.

**7e tour (flux, IHM, Boutique)** :

1. **Flux zombie** : Marc-Olivier a pu **entrer dans les Terres Sauvages sans équipe formée** (`enterZone` n'a aucune garde). Une rencontre s'est lancée (`startZoneFight`), l'écran de combat a affiché « Placez d'abord des cartes dans votre équipe ! ». En quittant le combat par la navigation (lien « Composer mon équipe → »), **`store.zoneFight` n'est jamais nettoyé** : il n'est remis à null QUE sur victoire (`src/ui.js`, `zoneFight = null` dans la branche victoire). Conséquences en chaîne, toutes vérifiées dans le code :
   - **les rencontres de l'errance sont bloquées** : le déclencheur teste `ev.encounter && !store.zoneFight` ;
   - **le donjon lancé depuis le menu est détourné** : `enterAt` (lancement donjon) ne remet pas `store.zoneFight` à null, donc la victoire du 1er étage passe dans la branche « combat de zone » → retour aux Terres Sauvages à la position errance sauvegardée (là où la première rencontre avait eu lieu), **au lieu d'enchaîner l'étage 2** ; grâce + déblocage de zone appliqués comme pour un combat de zone ;
   - la « même équipe que dehors » : le combat de zone EST un étage 1 du donjon de la zone avec le même `waveSeedFor(donjon, diff)` → même vague que le donjon lancé ensuite ; pas un état de combat résuré, mais confusion garantie.
2. **Bouton sur le badge de niveau** : `.lvl-chip` (badge de niveau) et `.cell-actions` (boutons ℹ️ ＋/− de la collection) sont TOUS DEUX en `position:absolute; top:~4-5px; right:~4-5px` dans `src/shell.html` → les boutons recouvrent l'icône de niveau. Même collision pour le bouton − d'équipe en slot (`.slot .cell-btn.slot-out`, `top:4px; right:4px`).
3. **Mode par défaut** : `let autoMode = true;` (`src/ui.js`) → les combats démarrent en Auto. **ACTÉ : Tactique par défaut.**
4. **Boutique** : le marchand de créatures affiche le « Catalogue complet » toutes raretés, avec les non-débloquées grisées 🔒 (boutons disabled). **ACTÉ : seules les 3 offres du jour sont affichées ; tout article verrouillé par la progression est masqué, pas grisé.** NB : la règle vise les verrous de progression, pas le manque d'or (un article trop cher reste visible, bouton grisé).

## Lots

### Lot 1 — Garde « équipe formée » + cycle de vie des combats de zone (critique)

- **Garde équipe (≥ 1 carte en équipe)** exigée pour : entrer dans une zone des Terres Sauvages (`enterZone`), lancer un donjon (`enterAt`), et défensivement `startZoneFight`. Refus propre : toast « ✗ Composez d'abord votre équipe. » + redirection `#equipe`. Fini les combats lancés sans équipe.
- **Plus d'état zombie** : rattacher le genre de combat au run (`store.runState.kind = 'zone' | 'donjon' | 'defi'` à l'initialisation, consulté par le flux de récompenses/fin de combat), `store.zoneFight` ne servant plus de drapeau global. À minima, en complément : `enterAt` écrase `store.zoneFight = null` ; nettoyage systématique à la sortie du combat (navigation hors `#combat`) ; `enterZone` repart d'un état propre.
- **Comportements attendus** : donjon lancé depuis le menu → run DONJON, étages enchaînés jusqu'au bout, récompenses de donjon ; combat de zone (errance) → victoire puis retour errance (comportement actuel conservé) ; défaite de zone → retour errance sans état résiduel. Rencontres de l'errance : jamais bloquées par un état résiduel.
- **Garde-fous tests** (headless, dans `tests/`) : (a) `startZoneFight` sans équipe → refus, aucun combat ; (b) combat de zone quitté sans fin → rencontres de l'errance de nouveau possibles (simuler les pas) ; (c) `enterAt` avec un état de zone résiduel → victoire de l'étage 1 → passage à l'étage 2, PAS de retour errance ; (d) `enterZone` sans équipe → refus.

### Lot 2 — Boutons ＋/−/ℹ️ hors du badge de niveau

- Repositionner `.cell-actions` en **bas-droite** de la carte (collection : `.gcell`) et le bouton − des slots d'équipe (`.slot .cell-btn.slot-out`) pareil, badge de niveau (`.lvl-chip`) en haut-droite conservé. Vérifier l'absence de collision avec le badge `owned-badge` (haut-centre), `new-badge` ✨ et le pied de carte. Capture 390×844 + 1440×900 exigée (protocole IHM, scénario à ajouter).

### Lot 3 — Tactique par défaut (ACTÉ)

- `autoMode` initial **false** (Tactique), le bouton de bascule reste. Le choix est **persisté** dans la sauvegarde (dernier mode utilisé), migration non destructive si besoin. Rappeler l'effet récompenses existant (prorata Tactique intégrales / Auto ÷2) dans le CHANGELOG. Digests inchangés attendus (le mode par défaut ne touche pas le moteur headless).

### Lot 4 — Boutique : rien de verrouillé à l'écran (ACTÉ)

- **Marchand de créatures** : supprimer le « Catalogue complet » ; seules les **offres du jour (3)** sont affichées. Si une offre du jour est épuisée (max exemplaires), l'afficher grisée avec son compteur (c'est une offre achetable dans la journée, pas un verrou de progression).
- **Règle générale** : tout article verrouillé par la progression (raretés non débloquées, gating à venir de la spec acquisitions) est **masqué** ; le manque d'or seul garde le bouton grisé (article visible). Potions et éclats restent tels quels.
- Smoke : durcir la section Boutique (absence du catalogue complet dans le dist, présence des offres du jour uniquement).
- NB : la spec `docs/design/spec-boutique-inventaire-onglets.md` (PROPOSÉE) devra **harmoniser** ses questions ouvertes avec ce tranchage (le présent ACTÉ prime).

### Lot 5 — Esquive visible + dégâts de frappe expliqués (combat Tactique)

- **Esquive impossible à rater** : floatText « 💨 Esquivé ! » proéminent sur la cible (taille/durée au moins égales à un chiffre de dégâts), petite pose d'esquive du pion (translation rapide), et **ligne dans le journal de combat** (« Le Pillard des Récifs esquive la frappe de l'Ange. »). Aucune attaque résolue ne doit paraître « ne rien faire ».
- **Dégâts attendus affichés** : la fenêtre d'action montre la frappe simple avec sa puissance effective (« ⚔ Attaque — ~5 · frappe de Prêtre à 70 % »), et la fiche de chaque carte affiche le pourcentage de frappe de sa classe (issue de `CLASSE_MODS.strike`, en data — ne pas le coder en dur). L'esquive de la cible (si > 0, depuis sa classe/AGI) peut être rappelée dans la fenêtre de désignation.
- **Garde-fou test headless** : avec un seed fixe, une attaque contre un Assassin (esquive > 0) produit bien un événement `dodge` et zéro dégât (déterministe) ; test que `CLASSE_MODS.strike` existe pour toutes les classes. Capture du feedback exigée (protocole IHM).

### Lot 6 — Sorts signature : fiche complète et ciblage correct

- **Métadonnées en data** : chaque sort signature (cartes ET monstres, `cat: 'unique'`) reçoit `cible` ("1 ennemi" pour les dégâts, "1 allié"/"soi" pour soins et boosts, "zone"/"tous" le cas échéant) et `role` ('degats'/'soin'/'buff'/…), dérivés des champs existants (`soloMult`, `soloDot`, `effect.kind`) et complétés en data là où la sémantique manque. La fiche du sort signature affiche rôle · cible · puissance, comme les autres sorts.
- **Ciblage suit la fiche** : plus jamais de liste d'alliés pour un sort de dégâts ; l'action s'applique à la cible désignée. Fin du comportement « je clique un de mes cartes et ça frappe les ennemis ».
- **Garde-fou test headless** : pour 100 % des sorts de toutes les cartes et de tous les monstres, `spellSideOf(sort)` ≠ null ; un sort de rôle dégâts ne propose jamais de cible alliée (assertion structurelle sur les data).

### Lot 7 — Errance : héros figé après un combat

- Au lancement d'un combat depuis l'errance (rencontre ou porte du donjon) : **vider le mouvement** (`hero.path = []`, `pending = null`, `goal = null`) avant `go('#combat')`. Au retour de combat, le héros est **figé** : il ne se remet en marche que sur un tap du joueur.
- **Grâce post-combat relevée** : 8 pas (constante en data) après tout combat de zone, au lieu de 2.
- **Garde-fou test headless** : après un combat de zone, aucun pas automatique n'est joué et aucune rencontre ne peut se déclencher sans input joueur ; la grâce vaut 8.

## Contraintes et hors périmètre

- `data/*.json` source de vérité ; `dist.html` via `node build.mjs` ; re-fetch avant chaque édition ; zéro dépendance npm.
- **Digests INCHANGÉS attendus** : `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000.
- Hors périmètre : refonte visuelle de l'errance (chantier v1.36.1 séparé), architecture donjons × errance (session), maths, équilibrage, économie.
- Consigner chaque lot dans `docs/arbitrages.md` (entrée en haut), CHANGELOG v1.37, roadmap à jour.
