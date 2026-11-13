# Prompt — Repositionnement de l'écran de combat : commander en bas, lire en haut (maquette VALIDÉE v2.3, 14/11)

Contexte : retour terrain de Marc-Olivier après la PR #12 (« le travail sur le front est terminé mais je trouve cela encore mauvais »). Recherche du genre livrée (`docs/design/recherche-ecran-combat-2026-11-14.md` : Hearthstone, TCG Pocket, Marvel Snap, LoR, Star Rail, Epic Seven + UX mobile) et maquette comparative **VALIDÉE par Marc-Olivier le 14/11** : `docs/design/maquettes/ecran-combat-v2.html` (v2.3, interactive : AVANT/APRÈS + module boss + invocations). La convention du genre est unanime : **commander en bas, lire en haut, le milieu n'appartient qu'au plateau** ; stats sur les unités ; actions rares en zone de statut persistante ; feedback jamais sous le pouce.

## INVARIANTS (règles d'or du chantier)

1. **La fenêtre d'action ne recouvre JAMAIS le terrain** (repris tel quel du chantier UX combat adaptatif) : la barre compacte RÉDUIT encore l'emprise.
2. **Chiffres lisibles sans fiche** : PV/PVmax, MP/MPmax et bouclier en clair, portés par les unités.
3. **Feedback au-dessus du point de contact, jamais sous le pouce** (règle d'occlusion) : dégâts flottants et confirmations de ciblage s'affichent AU-DESSUS de l'unité.
4. **Digest INCHANGÉ attendu** : pure présentation (HTML/CSS), aucun changement moteur ni data. Référence : nouvelle baseline proposée par la PR #13 (`3b11106f…` 871/3000 / `6c86838b…` 2888/10000, verrouillage en attente). Toute divergence = STOP et MESURE, rien ne se recalibre ici.

## Lot 1 — tiers haut : l'ordre du tour + vitesse/pause persistants

1. **Ordre du tour** : le rail d'agilité quitte la zone au-dessus du plateau et devient un **RAIL HORIZONTAL EN HAUT de l'écran** : les deux camps, **ennemis inclus**, actif surligné or ; chip ÉLARGI pour un boss, chip POINTILLÉ pour une invocation (elles jouent dans l'ordre, PR #13) ; indicateur « › » vers la suite du tour.
2. **Compteur vague/étage** à droite du rail (texte court).
3. **Vitesse ×0,5→×32 et pause** : groupe **PERSISTANT en haut à droite**, hors de la fenêtre d'action (action rare, zone de statut ; plus de manipulation à chaque tour).
4. **Paysage** : rail d'ordre vertical en HAUT du rail latéral, commandes en BAS du rail (arc du pouce droit), vitesse/pause en haut du rail.
5. Preuve : captures 390×844 portrait + 844×390 paysage + 1440×900 ; invariant : le terrain SVG entier visible à tout moment.

## Lot 2 — la fenêtre d'action devient une barre de commandes compacte (≤ 30 % de l'écran)

1. La fenêtre devient une **BARRE** : nom du combattant actif + PV/MP en clair + rangée de boutons (Attaque, sorts, invocation, objet) ; **hauteur cible ≤ 30 % de l'écran** (actuellement ~38 dvh) ; la fiche détaillée ne vit PLUS dans la fenêtre.
2. **Boutons ≥ 44 px** (WCAG 2.5.5) ; sort indisponible = **GRISÉ avec la raison** (MP insuffisant, cooldown), jamais masqué (contrainte visible, leçon TCG Pocket) ; le bouton d'invocation vit dans la barre comme un sort.
3. La fiche complète (`ficheCoreHtml`, v1.51) reste **FLOTTANTE à la demande** (clic sur une unité, alliée ou ennemie), ancrée au-dessus de la barre, côté opposé au clic, jamais sous le pouce.
4. Badge réserve ⇄ conservé ; mini-log 3 lignes juste au-dessus de la barre (inchangé).
5. Preuve : captures portrait/paysage, fenêtre ≤ 30 % mesurée au sweep.

## Lot 3 — unités : icônes agrandies, chiffres, invocations en première ligne

1. **Icônes** : unités ≥ 74 px (56 aujourd'hui) ; **BOSS = 118 px + nom en gras** (icône XL, l'œil distingue combattant/boss/invoqué d'un coup).
2. **Chiffres sur les unités** : PV/PVmax et MP/MPmax en clair à côté des barres ; **BOUCLIER = fine barre dorée AU-DESSUS de la barre PV + badge chiffré** (ordre de lecture : bouclier avant PV).
3. **INVOCATIONS en PREMIÈRE LIGNE** (tranchage 7-b : « un esprit rejoint l'avant ») : petits carrés ~40 px à bordure pointillée, placés dans une **RANGÉE DÉDIÉE devant chaque camp** (vers le centre du terrain) : **rien à décaler, rien par-dessus les unités** ; couleur de camp (allié pointillé violet / ennemi pointillé rouge) ; **cliquables** (fiche de l'invocation : stats dérivées, ttl) ; PV mini + badge ⏳ tours restants sur le carré ; un actif max par lanceur.
4. **Ciblage** : cibles valides ILLUMINÉES (pulse), zones invalides GRISÉES pendant le choix ; confirmation de l'action affichée au-dessus de la cible.
5. **Géométrie** : aucune vignette ne se chevauche ; camp allié aligné SYMÉTRIQUEMENT sur la largeur (cf maquette : marges égales, ligne régulière).
6. Preuve : captures d'un combat de vague + d'un combat de BOSS avec une invocation visible en première ligne.

## Hors périmètre

- **Moteur, data, ciblage, IA : inchangés** (les invocations motrices viennent d'être livrées par la PR #13).
- **Vitesses par contexte** : non tranché (§0 n°5, Marc-Olivier teste la nouvelle fenêtre d'abord) ; le réglage manuel ×0,5→×32 reste.
- **Calibrage** (ATK/HP, splash Mage, Guerriers rempart) : séparé, §0 n°5-6, RIEN ne bouge ici.
- **Arts/habillage** (couloir design) : ce chantier ne touche que positions, tailles et structure, pas les illustrations.

## Discipline

AGENT.md habituelle : un lot = un commit FR ; `data/*.json` source de vérité ; `dist.html` jamais à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant édition ; preuve = build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digests `node combat-digest.mjs dist.html 3000` et `10000` (**INCHANGÉS attendus** contre la baseline proposée `3b11106f…`/`6c86838b…` : toute divergence = STOP + mesure consignée) ; captures dans `docs/captures-validation/repositionnement-ecran/` ; à la fin : rapport de lot + entrées smoke à jour.
