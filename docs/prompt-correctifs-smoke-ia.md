# Prompt — correctifs smoke + heuristique IA + UI réserve (après le grand lancement, couloir 1)

Contexte : revue indépendante du couloir pilotage (`docs/historique/revue-v1.50.md`) — le grand lancement v1.39 → v1.50 est livré et conforme. Trois chantiers courts restent, en 3 lots, un commit FR par lot. Ces correctifs ne touchent NI les maths de combat, NI le flux de jeu du joueur (le lot 2, ciblage IA, est à MESURER ; le lot 3 est de la présentation pure — mécanique de réserve INCHANGÉE).

## Lot 1 — smoke robuste (script de test, pas le jeu)

1. **B9 c crashe selon la date** : `smoke-ui.mjs:1177` fait `list.find((x) => x.type === 'tuer')` sur les quêtes du jour, tirées par **seed de la date** (`quetesDuJour()`) : dès que la petite quête du jour n'est pas de type « tuer », `q` est `undefined` → `TypeError`, le run s'arrête (constaté le 13/11). **Correction** : la section B9 doit être déterministe — soit itérer sur les quêtes réellement tirées du jour (progresser la première non faite, quel que soit son type, et vérifier la récompense selon SON montant), soit simuler une date fixe pour toute la section. Garde-fou ajouté : lancer la section B9 sur 7 dates simulées différentes sans crash.
2. **Échecs préexistants à traiter dans le même lot** : « 43 B 5 cartes posées » (obsolète depuis le 3+2 : mettre l'attendu à jour sur la formation actuelle), « 45 e », « B1 c achat : stock +1 et or débité (50 or) » (vérifier le comportement RÉEL de la Boutique v2 : si le jeu est en faut, corriger le jeu ; si le check est obsolète, aligner le check sur le comportement voulu — jamais sur le bug), « B29 h ». Chaque échec : réparé, ou check mis à jour AVEC justification en commentaire.
3. Preuve : build + tests verts + **smoke complet sans crash** (les échecs restants, s'il en subsiste, doivent être chacun justifiés). Digest inchangé attendu (script de test uniquement).

## Lot 2 — heuristique IA : école du sort, pas élément de la carte

1. Conflit signalé en clôture du grand lancement : le scoring d'utilité (ciblage IA, refonte v1.34) lit encore **l'élément de la carte** au lieu de **l'école du sort** envisagé. Les dégâts sont bien calculés école-du-sort depuis l'étape 3 ; seul le choix de cible/sort est faussé. Corriger : pour chaque coup évalué, scorer avec l'élément EFFECTIF du coup (école du sort joué ; frappe simple = élément de la carte qui frappe).
2. **MESURE digest 3000 + 10 000** : le ciblage change, les combats auto-résolus peuvent changer → MESURER et consigner l'écart vs la baseline **VERROUILLÉE par Marc-Olivier (13/11)** : `9faff1b9…` 838/3000 / `6103e7b0…` 2795/10000. **PAS de recalibrage** ; tout écart est consigné pour arbitrage avant tout nouveau verrouillage.
3. Tests headless : l'IA préfère la cible la plus vulnérable à l'école du sort joué (cas construits : sort Eau vs cible Feu vs cible Neutre ; frappe simple vs cible de l'élément opposé).
4. Docs : `docs/arbitrages.md` (entrée du lot), smoke inchangé sinon.

## Lot 3 — UI combat : réserve CACHÉE sur le côté (tranchage Marc-Olivier)

1. **Constat** : depuis v1.41, `#reserve-zone` peint un rail VISIBLE « réserve » (rangée dédiée sous la zone équipe, `src/ui.js` ~ligne 4594, commenté « Lot A : rail de réserve visible »). **Tranchage : cette rangée ne doit plus exister** — les cartes en réserve ne prennent plus de place sur l'écran de combat.
2. **Remplacer par un contrôle compact latéral** : un badge/bouton sur le CÔTÉ de la zone équipe (ex. « Réserve (2/2) » avec mini-portraits ou simple compteur vivantes/total), qui ouvre le sélecteur d'échange EXISTANT (celui de l'action « Échanger » : l'entrante coûte le tour du sortant, PV/mana conservés). C'est de la présentation : la mécanique v1.41 (échange volontaire = action de tour, remplacement K.O. automatique et gratuit) reste TELLE QUELLE.
3. Le contrôle doit refléter l'état (réserve vide → masqué ou grisé ; K.O. en réserve visibles dans le sélecteur), rester accessible sur mobile sans tronquer le HUD (safe-area déjà traitée en v1.49), et ne jamais cacher les rangées actives.
4. Le sélecteur ouvert depuis le badge doit proposer l'échange uniquement quand c'est un tour joueur et que l'action « Échanger » est légale (mêmes gardes que l'action existante).
5. Preuve : build + tests verts + smoke (section dédiée : badge réserve → sélecteur → échange effectué, badge masqué/grisé quand vide), **digest INCHANGÉ attendu** (présentation seule, aucune mécanique ni cible IA).

Ordre : Lot 1 puis Lot 2 puis Lot 3. Discipline AGENT.md habituelle : un lot = un commit FR, `data/*.json` source de vérité, preuve = build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digests MESURÉS au lot 2, inchangés attendus aux lots 1 et 3. Ensuite, sans attendre de validation : enchaîner sur la fusion DQM selon `docs/design/spec-fusion-v4.md`.
