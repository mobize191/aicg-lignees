# Prompt — correctifs v1.37 : flux Terres Sauvages/donjons, boutons équipe, Tactique par défaut, Boutique (retours terrain de Marc-Olivier, 12/11 7e tour)

> Statut : ACTÉ par Marc-Olivier (12/11, 7e tour). Couloir 1 : exécute APRÈS le chantier errance v1.36.1 (`docs/prompt-correctif-errance-v1.36.1.md`), qui reste prioritaire. Une tâche = un commit FR. Preuve par lot : build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digests INCHANGÉS. Lot 2 : capture 390×844 exigée.

## Contexte (reproduit et vérifié sur main `a04aad23` par le couloir pilotage)

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

## Contraintes et hors périmètre

- `data/*.json` source de vérité ; `dist.html` via `node build.mjs` ; re-fetch avant chaque édition ; zéro dépendance npm.
- **Digests INCHANGÉS attendus** : `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000.
- Hors périmètre : refonte visuelle de l'errance (chantier v1.36.1 séparé), architecture donjons × errance (session), maths, équilibrage, économie.
- Consigner chaque lot dans `docs/arbitrages.md` (entrée en haut), CHANGELOG v1.37, roadmap à jour.
