# Recherche — Écran de combat mobile : positionnement des éléments (tour par tour + jeux de cartes)

> 14/11/2026, couloir pilotage. Demande de Marc-Olivier : « le travail sur le front est terminé mais je trouve cela encore mauvais… faire une recherche sur les jeux mobiles de combat en tour par tour et de cartes (MTG, Hearthstone, etc.) pour analyser l'écran de combat et voir comment bien positionner les différents éléments ».

## Question

Où placer chaque élément de l'écran de combat de Lignées (fenêtre d'action, ordre du tour, PV/mana, log, fiches, cibles, vitesse) pour que la lecture soit immédiate sur mobile, en s'appuyant sur les conventions établies par les jeux de cartes mobiles (Hearthstone, Pokémon TCG Pocket, Marvel Snap, Legends of Runeterra) et les RPG tour-par-tour mobiles (Honkai: Star Rail, Epic Seven, Final Fantasy) ?

## Résumé exécutif

1. **La convention est unanime : commander en bas, lire en haut.** Hearthstone met la main du joueur en bas (chaque joueur se voit toujours « en bas »), Star Rail met les boutons Attaque/Compétence/Ultime en bas de l'écran et la barre d'ordre du tour EN HAUT. Le milieu de l'écran n'appartient qu'au plateau.
2. **L'ordre du tour se lit en haut, pas au milieu.** Star Rail affiche en haut une barre d'action qui montre qui joue ensuite, ennemis compris — le tempo reste lisible sans rien masquer. Un rail d'agilité posé au-dessus du plateau consomme la bande médiane, la plus précieuse.
3. **Les stats vivent sur les unités, pas dans des panneaux.** Hearthstone : PV, mana et héros entourent le plateau, au plus près des pièces ; Star Rail : faiblesses et barre de robustesse au-dessus de la barre de PV de chaque ennemi. Le panneau séparé est réservé au détail à la demande.
4. **Le tiers haut = statut, la bande médiane = secondaire, le tiers bas = actions primaires** (carte des zones du pouce, h-idris) ; rien d'important ne se place sous le pouce au repos, et le feedback doit apparaître au-dessus ou à côté du point de contact, jamais dessous (occlusion, wandr).
5. **La densité est une décision éditoriale, pas une contrainte.** Sur mobile, l'écran supporte moins d'éléments ; le test est « fréquent + urgent, sinon pas à l'écran ». La fiche complète n'apparaît qu'au clic (TCG Pocket : on tire la carte de la main, le reste est éphémère).
6. **Les infos critiques restent à l'écran.** La critique UX de TCG Pocket (Pratt) pointe l'info de faiblesse qui disparaît après une seconde : le joueur doit pouvoir se reposer sur « la connaissance dans le monde », pas dans sa tête. Nos mini-log et badges persistants vont dans le bon sens.
7. **Les commandes rares se rangent en haut à droite.** Vitesse, pause et automatismes sont des actions peu fréquentes : zone de statut, pas dans la fenêtre d'action.

## Méthodologie

Recherche web ciblée (14/11) : principes d'UX de jeu mobile (2 guides de référence lus intégralement), analyse de la disposition des écrans de combat des principaux jeux de cartes et RPG tour-par-tour mobiles (sources ouvertes ou extraits indexés), puis projection sur l'écran de combat actuel de Lignées (PR #12 : portrait panneau bas 38 dvh / paysage rail latéral, mini-log 3 lignes, fiches flottantes, badge réserve, ordre du tour au-dessus du plateau). Aucune mesure de terrain rejouée ici ; les constats de rendu « encore mauvais » viennent du retour de Marc-Olivier post-PR #12.

## Constat 1 — Jeux de cartes mobiles : la vue standard, la main en bas, le plateau au centre

- **Hearthstone** : chaque joueur se voit toujours en bas — la vue est une « illusion » standardisée. La main en éventail occupe le bas, les héros et cristaux de mana entourent le plateau, le milieu reste au plateau. Aucune UI n'y est superposée de façon permanente.
- **Pokémon TCG Pocket** (critique UX académique, principes de Norman) : la main est un éventail bas, les cartes se tirent vers le haut pour être posées ; **les zones valides pulsent, les zones invalides sont grises** (contrainte visible) ; le feedback de placement est immédiat. Critique la plus instructive : **l'information de faiblesse disparaît au bout d'une seconde** — elle devrait rester à l'écran, car le joueur doit pouvoir relire l'état à tout moment. L'auto-battle est basculable à tout moment, avant et pendant le combat.
- **Legends of Runeterra** : grandes zones d'unités + banc, et des fiches de carte riches et scrollables sur mobile, saluées par les joueurs comme la meilleure QoL du genre — la fiche détaillée à la demande ne gêne pas, elle rassure.
- **Marvel Snap** : la preuve par le minimalisme — 3 zones, un plateau court, des actions rares : le tour se joue en secondes. Moins d'éléments = plus de lisibilité, pas moins de profondeur.

Ce que le genre impose : **le plateau n'est jamais masqué par une UI permanente ; tout ce qui est action se joue en bas ; tout ce qui est état se lit sur les pièces ou en haut.**

## Constat 2 — RPG tour par tour mobiles : l'ordre du tour en haut, les stats sur les ennemis, les commandes en bas

- **Honkai: Star Rail** : barre d'action EN HAUT de l'écran, qui montre qui agit ensuite, **ennemis compris** — « le tempo reste lisible pendant toute la rencontre ». Les faiblesses élémentaires s'affichent au-dessus de la barre de PV de chaque ennemi ; la barre de robustesse est sur l'ennemi, pas dans un panneau. Les commandes Attaque/Compétence/Ultime sont en bas, l'ultime se déclenche à tout moment, y compris hors du tour du héros. Vitesse réglable et auto-battle : standard du genre mobile.
- **Convention de perspective** : l'équipe du joueur en bas, les ennemis en haut, vue 3/4 — l'écran raconte « toi ici, l'adversaire là-bas » sans apprentissage.
- **Epic Seven / FF mobile** : même grammaire — barre de tour horizontale en haut (icônes des deux camps dans l'ordre d'action), PV en barres directement sur les portraits, boutons de commande dans le coin bas.

Ce que le genre impose : **l'ordre du tour est une information de statut → bande haute ; les PV/mana/effets sont portés par les unités → pas de duplication dans un panneau ; les commandes → coin bas.**

## Constat 3 — Principes mobile : pouce, occlusion, densité, cibles

- **Carte des zones du pouce** (h-idris) : le tiers bas = actions primaires (le pouce y est précis et rapide) ; la bande médiane = actions secondaires ; **le tiers haut = statut seulement** ; rien d'important sous le pouce au repos. Designer pour un droitier à un pouce, puis vérifier le miroir.
- **Occlusion** (wandr) : le pouce masque ce qu'il touche — **le feedback doit apparaître au-dessus ou à côté du point de contact, jamais dessous**. C'est la règle la plus souvent violée par les menus bas d'écran : la confirmation d'un bouton du bas doit « remonter ».
- **Densité** (wandr) : sur mobile, moins d'espace ET moins de capacité d'attention ; la solution est éditoriale — retirer, pas rétrécir. Test du HUD : « fréquent + urgent, sinon pas à l'écran ».
- **Cibles tactiles** : WCAG 2.5.8 exige ≥ 24 px, 2.5.5 recommande 44 px ; sur téléphones > 6,5", les éléments critiques restent dans les deux tiers inférieurs (extrait timgraf, non ouvert).

## Application à Lignées — diagnostic et positionnement cible

Conforme au genre (à conserver) : fenêtre d'action en bas (portrait) et rail latéral (paysage), fiches flottantes à la demande, mini-log permanent, invariant « la fenêtre ne recouvre jamais le terrain », impacts + trace source→cible.

Écarts constatés au regard des conventions :

| # | Élément actuel | Convention du genre | Écart |
|---|---|---|---|
| 1 | Rail d'ordre du tour au-dessus du plateau | Barre d'ordre en HAUT de l'écran (Star Rail, Epic Seven), deux camps, ennemis compris | Le rail consomme la bande médiane, la plus précieuse ; il déplace le terrain vers le bas |
| 2 | Fenêtre d'action = fiche du combattant + stats + sorts mélangés | Barre de commandes compacte (boutons) en bas ; la fiche est flottante à la demande ; les stats vivent sur les unités | La fenêtre reste trop haute pour de la pure commande ; duplication stats/fenêtre |
| 3 | Vitesse ×0,5→×32 et pause dans la fenêtre d'action | Actions rares → zone de statut, haut-droite, persistantes | Occupe l'arc du pouce pour une action peu fréquente |
| 4 | PV/mana portés par les unités du terrain | Idem Hearthstone/Star Rail | À vérifier : aucun doublon avec la fenêtre |
| 5 | Ciblage : cibles illuminées | TCG Pocket : zones valides pulsées, invalides grises ; feedback au-dessus du point de contact | Vérifier que le bandeau de confirmation ne tombe pas sous le pouce |

Positionnement cible proposé (portrait 390×844, sans toucher au moteur — digest inchangé attendu, pure UI) :

1. **Tiers haut (statut)** : rail d'ordre du tour horizontal compact (les deux camps, ennemis inclus, l'actif surligné), compteur de vague/d'étage, et en haut à droite le groupe vitesse + pause persistant.
2. **Bande médiane (terrain)** : le terrain SVG ENTIER, sans aucun élément UI permanent par-dessus ; PV, mana et badges d'effets portés par les unités.
3. **Bande au-dessus de la fenêtre** : mini-log 3 lignes (déjà livré), position conforme (au-dessus de l'arc du pouce).
4. **Tiers bas (commande)** : fenêtre d'action réduite à une barre compacte — nom du combattant actif + rangée de boutons de sorts (cibles ≥ 44 px, état indisponible grisé) ; hauteur cible ≤ 30 % de l'écran contre 38 dvh aujourd'hui ; la fiche détaillée reste flottante au clic, ancrée au-dessus, jamais sous le pouce.
5. **Paysage** : rail latéral droit conservé, mais commandes dans le BAS du rail (arc du pouce droit) et statut en HAUT du rail.

## Notes de source

| Source | Lien | Crédibilité | Dernière mise à jour |
|---|---|---|---|
| wandr.studio — Mobile Game UI Design (principes pouce/occlusion/densité) | [wandr.studio](https://wandr.studio/blog/mobile-game-ui-design) | 4/5 | - |
| h-idris — Mobile Game UI Design (carte des zones du pouce, 5 contraintes) | [h-idris.com](https://h-idris.com/blog/mobile-game-ui-design.html) | 4/5 | - |
| IXD@Pratt — Design Critique : Pokémon TCG Pocket (Norman, mapping, info éphémère) | [ixd.prattsi.org](https://ixd.prattsi.org/2025/09/design-critique-pokemon-tcg-pocket-android-app/) | 4/5 | 2025-09 |
| Hearthstone Wiki — Battlefield (vue standard joueur en bas, main, mana) | [hearthstone.fandom.com](https://hearthstone.fandom.com/wiki/Battlefield) | 3/5 | - |
| Our Code World — Inside Honkai: Star Rail's Turn-Based Combat System (barre d'action en haut, faiblesses sur les ennemis) | [ourcodeworld.com](https://ourcodeworld.com/articles/read/2721/inside-honkai-star-rails-turn-based-combat-system) | 3/5 | - |
| TheGamer — Honkai: Star Rail Complete Combat Guide (toughness/PV sur l'ennemi) | [thegamer.com](https://www.thegamer.com/honkai-star-rail-combat-weakness-guide/) | 3/5 | - |
| timgraf — Cibles tactiles WCAG 24/44 px (extrait indexé, non ouvert) | [timgraf.com](https://timgraf.com) | 2/5 | - |

## Questions ouvertes

1. La barre compacte à ~30 % suffit-elle à loger 4-6 boutons de sorts lisibles à une main sur 390 px de large ? (à maqueter, couloir design possible)
2. Ordre du tour : rail horizontal déroulant (portrait) et vertical dans le rail latéral (paysage) — à trancher au moment du prompt.
3. Interaction avec les tranchages en cours : le chantier correctifs sorts (lots 3-5) fait bouger le digest ; le repositionnement UI seul ne doit pas le toucher (digest inchangé attendu).
4. Vitesses par contexte : toujours différées, à re-trancher après test terrain de la nouvelle fenêtre (§0 n°5).

## Recommandations

1. **Consigner ce document comme référence de positionnement** pour le prochain chantier UI combat.
2. **Tranchage proposé à Marc-Olivier** : (A) lancer un chantier couloir 1 « repositionnement écran combat » (ordre du tour en haut, vitesse/pause en haut-droite persistant, fenêtre compacte ≤ 30 %), pure UI, digest inchangé attendu, APRÈS la livraison des correctifs sorts pour ne pas croiser les branches ; ou (B) d'abord maquette/capture comparative (couloir design), puis chantier.
3. Ne pas retoucher le moteur ni les données : le positionnement est un chantier CSS/HTML exclusivement.
