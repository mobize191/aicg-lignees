# Prompt — Correctifs écran de combat v3 (2e retour terrain téléphone 15/11) : cartes PLUS GROSSES et RAPPROCHÉES, terrain STABLE, défilement des tours VISIBLE

Contexte : les correctifs v2 (`docs/prompt-correctifs-ecran-combat-v2.md`, PR #17 : surlignage de l'actif sur le terrain + chip rail renforcée ; camp allié ancré en bas du board) sont livrés. Marc-Olivier a re-testé sur son téléphone (captures `1000058854.png` / `1000058855.png` fournies) :

1. **« L'écart entre les cartes est énorme, mieux vaut les rapprocher et grossir les cartes. »**
2. **« Les cartes bougent tout le temps car quand c'est mon tour cela ouvre une fenêtre dessous qui vient tout dérégler. »**
3. **« On ne voit pas le défilement des tours des joueurs et c'est à qui de jouer. »**

**TRANCHAGE de Marc-Olivier (15/11, 2e test) qui PRIME sur la maquette v2.3** (convention du journal : un tranchage récent prime sur un acté antérieur) : le placement « camp allié collé au bas du board » de la maquette est remplacé par **les deux camps RAPPROCHÉS, face à face au centre du terrain** ; les cartes passent en **grand format constant** ; le bas de l'écran devient une **zone de commandement permanente**. Le reste de la maquette validée reste la règle (icônes chiffrées PV/MP + bouclier doré, invocations en première ligne, ordre du tour en haut, fiche flottante à la demande).

## DIAGNOSTIC (couloir pilotage, vérifié dans le code après la PR #17)

- **Souci 1** : `#team-zone { margin: auto 0 0 }` ancre les alliés AU BAS du board, les ennemis restent EN HAUT → sur 844 px, l'espace entre les deux camps est entièrement vide. Unités portrait : `clamp(84px, 20vw, 140px)` (≈ 84 px sur 390 px) : trop petites.
- **Souci 2** : `body.in-combat.act-open .unit { width: clamp(74px, 16vw, 96px) }` (et `boss` 100-128 px) rétrécit les cartes à l'ouverture de la fenêtre ; en plus la fenêtre prend 30dvh DANS le flux → le board change de hauteur à chaque ouverture/fermeture. Les cartes changent donc de taille ET de position à chaque tour : le « dérèglement » signalé.
- **Souci 3** : le surlignage de l'actif sur le terrain (liseré or + badge ▶) est livré et fonctionne ; mais l'ordre du tour reste une rangée de petites chips dans la topbar (0,68rem de base), difficile à percevoir comme un DÉFILEMENT, et rien n'affiche en clair qui joue quand la fenêtre du joueur est fermée.

## INVARIANTS (règles d'or)

1. **TERRAIN STABLE** : aucune carte ne change de taille ni de position, ni d'un pixel, entre fenêtre ouverte et fermée, à tout instant du combat (portrait, paysage, grand écran PC).
2. **Zone de commandement PERMANENTE** : le bas de l'écran (portrait) / le rail (paysage) est occupé EN PERMANENCE par une zone de hauteur FIXE : bandeau d'état du tour quand ce n'est pas au joueur, fenêtre de commandes quand c'est à lui. Le terrain au-dessus a une hauteur constante, rien ne recule ni ne saute.
3. **La fenêtre ne recouvre JAMAIS le terrain** ; feedback au-dessus du point de contact, jamais sous le pouce.
4. **Digest INCHANGÉ attendu** : pure présentation (HTML/CSS/JS d'affichage), aucun changement moteur ni data. Référence : baseline proposée PR #13 (`3b11106f…` 871/3000 / `6c86838b…` 2888/10000, verrouillage en attente). Toute divergence = STOP et MESURE.

## Lot 1 — cartes PLUS GROSSES, camps RAPPROCHÉS (tranchage 15/11, prime sur la maquette)

1. **Grand format constant** : unités portrait ≈ `clamp(104px, 30vw, 132px)` (cible : les 3 actifs couvrent ≈ 90-95 % de la largeur utile, ≈ 110-118 px sur 390 px), **boss ≈ 1,4× une unité** (cible ≈ 150 px sur 390 px) ; MÊME taille fenêtre ouverte ou fermée (cf. Lot 2). Adapter au paysage et au grand écran PC en gardant les proportions livrées (140-240 px).
2. **Camps rapprochés, face à face au CENTRE du terrain** : l'écart vertical entre la rangée ennemie la plus basse et la première rangée alliée est BORNÉ (cible ≤ 15 % de la hauteur du terrain) ; les deux camps se lisent comme deux lignes qui s'affrontent (convention Hearthstone/Snap). Le vide résiduel se répartit AU-DESSUS des ennemis et AU-DESSOUS des alliés, jamais entre les camps.
3. **Invocations toujours en première ligne** de chaque camp (carrés 40 px, cliquables), collées à leur camp : elles suivent le rapprochement, jamais isolées dans un vide.
4. **Aucun chevauchement**, aucune carte < 44 px de cible tactile, terrain SVG entier visible.
5. **Preuve** : capture portrait 390×844 : les deux camps occupent le centre, écart mesuré ≤ 15 %, grandes cartes lisibles.

## Lot 2 — TERRAIN STABLE : plus rien ne bouge (invariant 1-2)

1. **Supprimer tous les resizes liés à l'état de la fenêtre** : les règles `body.in-combat.act-open .unit { width: … }` (portrait, paysage ≤ 500px, grand écran) sont RETIRÉES — la taille des unités ne dépend QUE de la largeur/hauteur d'écran, jamais de l'ouverture de la fenêtre.
2. **Zone de commandement de hauteur FIXE** (portrait) : réserver en permanence la hauteur qu'occupe la fenêtre de commandes (max ≤ 30dvh) ; quand ce n'est pas au joueur, la zone affiche le bandeau d'état du Lot 3 ; quand c'est à lui, la fenêtre s'y ouvre SANS FAIRE BOUGER le terrain. Idem paysage : le rail latéral garde une largeur fixe, le bandeau d'état vit dans le rail, la fenêtre remplace le bandeau sans bouger le terrain.
3. Le mini-log (3 lignes) vit DANS la zone permanente (sous ou à côté du bandeau d'état), jamais en surimpression du terrain.
4. **Preuve** : 2 captures portrait superposables prises à la même frame de combat, l'une fenêtre fermée, l'autre ouverte : positions et tailles des cartes IDENTIQUES au pixel près ; vidéo ou série de captures montrant un tour complet sans aucun saut.

## Lot 3 — DÉFILEMENT DES TOURS visible : qui joue et qui vient

1. **Bandeau d'état permanent** (zone permanente, Lot 2) : quand ce n'est pas le tour du joueur, afficher EN CLAIR : **« ▶ Tour de [Nom] »** (le combattant actif, camp visible par la couleur) **+ la file des suivants** (ex. « ensuite : X › Y › Z », 3-4 prochains) : c'est ICI que se lit le défilement des tours, sans ouvrir de fiche. Mis à jour à chaque tour, en montée d'ordre d'agilité.
2. **Rail du haut conservé** (chips renforcées v2 : active or, boss élargi, invocation pointillé) ; ajouter le **scroll automatique** pour que la chip active reste toujours visible.
3. **Surlignage terrain conservé** (liseré or + badge ▶ au-dessus de l'unité active, livré v2) : le bandeau, le rail et le terrain désignent TOUJOURS le même combattant.
4. Quand c'est au joueur : la fenêtre de commandes (nom + « à vous d'agir » + stats, livrée v2) remplace le bandeau, la stabilité du Lot 2 s'applique.
5. **Preuve** : capture d'un tour ennemi puis d'un tour allié auto : QUI agit et QUI vient ensuite se lisent en 1 seconde (bandeau + terrain), sans le journal.

## Hors périmètre

- **Moteur, data, ciblage, IA, calibrage, vitesses** : inchangés. **Arts/habillage** : positions et tailles seulement.
- **Maquette v2.3** : les 2 points amendés par le tranchage du 15/11 (placement des camps, grand format) sont couverts par CE prompt ; le reste de la maquette reste la règle ; pas de re-validation maquette nécessaire avant exécution (tranchage explicite de Marc-Olivier).

## Discipline

AGENT.md habituelle : un lot = un commit FR ; `data/*.json` source de vérité ; `dist.html` jamais à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant édition ; preuve = build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digests `node combat-digest.mjs dist.html 3000` et `10000` (**INCHANGÉS attendus** contre la baseline proposée `3b11106f…`/`6c86838b…` : toute divergence = STOP + mesure consignée) ; captures dans `docs/captures-validation/repositionnement-ecran/` (préfixe `correctifs-v3-`, dont la paire superposable du Lot 2) ; retour terrain de Marc-Olivier sur son téléphone attendu à la livraison.
