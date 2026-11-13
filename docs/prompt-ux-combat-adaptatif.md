# Prompt — UX combat adaptatif : la fenêtre d'action ne recouvre jamais le terrain (tranchages de Marc-Olivier, 13/11)

Contexte : constat de Marc-Olivier, vérifié dans le code : la fenêtre d'action (`.act-modal`, `src/shell.html` ~875) est `position: fixed` bas d'écran, pleine largeur, fond quasi opaque `rgba(10,14,22,.97)`, `max-height: 78dvh` en combat tactile → elle recouvre jusqu'à 78 % de l'écran ; choisir un sort demande de réduire la fenêtre pour lire les PV/effets ennemis, l'impact de l'action se joue trop vite, la fenêtre suivante s'ouvre, et des PV se perdent sans explication visible. Tranchages de Marc-Olivier (13/11, à consigner) : **layout ADAPTATIF + paquet lisibilité COMPLET** ; vitesses par contexte : NON tranchées (test terrain d'abord, réglage manuel conservé).

## INVARIANT (règle d'or du chantier)

**La fenêtre d'action ne recouvre JAMAIS le terrain de combat.** À tout moment pendant un choix, le joueur voit : les positions, les barres de vie et les effets de TOUTES les cartes, sans réduire ni fermer quoi que ce soit. C'est le standard du genre (Pokémon, DQ XI, DQM) que Marc-Olivier a explicitement demandé.

## Lot 1 — layout adaptatif (portrait compact + paysage côte à côte)

1. **Portrait (mobile)** : la fenêtre d'action devient un panneau bas BORNÉ (hauteur max ~38-40 % de l'écran), fond toujours lisible mais terrain ENTIER visible au-dessus (le terrain peut se rétrécir légèrement quand la fenêtre est ouverte, mais reste complet et net) ; les sorts scrollent DANS le panneau si besoin ; plus jamais de recouvrement 78 %.
2. **Paysage (PC + mobile tourné)** : terrain à gauche, fenêtre d'action en RAIL LATÉRAL à droite (largeur bornée), jamais superposée. Le terrain SVG actuel est portrait `viewBox="0 0 390 844"` : en paysage, le recadrer/adapter proprement (`preserveAspectRatio`, media queries) — aucune carte coupée. Vérifier les 2 orientations sur mobile ET desktop.
3. **Fiches flottantes** : cliquer une carte (alliée ou ennemie) pendant un choix ouvre une fiche FLOTTANTE (repositionnable ou ancrée au bord opposé du panneau) qui NE FERME PAS la fenêtre d'action — on lit les stats et effets d'une cible pendant qu'on choisit son sort.
4. **Réserve cachée (Lot 3 du prompt smoke/IA, TOUJOURS EN ATTENTE)** : à intégrer ICI, même écran, un seul passage sur le layout : le rail `#reserve-zone` visible disparaît, remplacé par le badge compact latéral (compteur vivantes/total) qui ouvre le sélecteur d'échange existant ; mécanique 3+2 inchangée.
5. **Fenêtre suivante** : après l'action d'une carte, pause courte (~300-400 ms) avant d'ouvrir la fenêtre de la carte suivante (l'impact a le temps d'être lu).
6. Preuve : build + tests verts + smoke à jour (sections combat) + sweep : 390×844 portrait, 844×390 paysage, 1280×720, 2560×1080, 1080×2340 — invariant vérifié partout, rien de tronqué ; captures pour Marc-Olivier (téléphone ET PC). **Digest inchangé attendu** (présentation seule — MESURE de contrôle).

## Lot 2 — lisibilité des actions et traçabilité des dégâts

1. **Impacts lisibles** : chaque action jouée garde un temps de lecture garanti ~600-800 ms pour son effet visible (floatText de dégâts/soin/mana persistant, plus long qu'aujourd'hui) ; **trace visuelle source → cible** (ligne/flèche brève du frappeur vers sa cible) ; hit-stop conservé sur les gros coups et les K.O. ; ces temps sont INSENSIBLES au multiplicateur de vitesse (ou plafonnés : à ×16/×32 l'animation se coupe, mais le floatText reste lisible).
2. **Mini-log permanent** : une bande de 2-3 lignes, toujours visible pendant le combat, qui retrace chaque événement en texte court (« Pillard des Récifs frappe Ange : −12 PV », « Banshee maudit Nymphe : −2 tours ») — PLUS JAMAIS de perte de PV inexpliquée ; le log complet existant reste accessible.
3. **Fiche unifiée** (`ficheCoreHtml`, v1.51) utilisée par les fiches flottantes, avec les effets actifs.
4. Preuve : build + tests + smoke à jour + captures ; **digest inchangé attendu** (présentation seule).

## Hors périmètre

- Vitesses par contexte (errance rapide vs donjon réfléchi) : NON TRANCHÉ — Marc-Olivier veut tester la nouvelle fenêtre d'abord ; le réglage manuel ×0,5→×32 reste tel quel.
- Calibrage (ATK/HP, splash Mage, Guerriers rempart) : séparé, voir points à trancher §0 n°5-6 — RIEN ne bouge ici.
- Le moteur (maths, ciblage, IA) : inchangé.

## Discipline

AGENT.md habituelle : un lot = un commit FR, `data/*.json` source de vérité, re-fetch avant édition, preuve = build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digest MESURÉ (inchangé attendu : présentation seule). Captures portrait + paysage pour la validation terrain de Marc-Olivier.
