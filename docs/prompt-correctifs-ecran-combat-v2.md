# Prompt — Correctifs écran de combat v2 (retour terrain téléphone 15/11) : QUI JOUE lisible en 1 seconde + suppression du vide central

Contexte : le repositionnement de l'écran de combat (3 lots, maquette v2.3 validée, `docs/prompt-repositionnement-ecran-combat.md`) est LIVRÉ. Marc-Olivier a testé sur son téléphone (capture 390×844 fournie) : « cela rend mieux mais il reste quelques soucis » :

1. **On ne voit pas c'est le tour de qui de jouer.**
2. **Il y a un vide entre les cartes et l'endroit où l'on choisit (la fenêtre d'action), même en affichant les actions.**

## DIAGNOSTIC (couloir pilotage, vérifié dans le code)

**Souci 1, « qui joue » — 3 causes cumulées :**
- (a) **L'unité active n'est PAS marquée sur le terrain** : aucun surlignage de vignette au tour du combattant (la classe `.acting` n'existe que sur les chips du rail d'ordre, `rail-chip`).
- (b) **La chip `.acting` du rail est trop discrète** : texte 0,68rem, nom tronqué à 110 px, ▶ à 0,55rem, fond `rgba(255,213,79,.13)` — illisible en plein soleil sur téléphone ; pas de scroll auto du rail vers la chip active.
- (c) **Pendant les tours automatiques (alliés/ennemis), seule la chip du rail indique qui agit** : rien sur le terrain, rien dans la zone de lecture. Le titre de la fenêtre (`act-head` : nom + « à vous d'agir », 0,92rem) n'existe qu'en Tactique et reste discret.

**Souci 2, le vide — 1 cause :**
- En portrait, `#board` (`flex: 1 1 auto; flex-direction: column`) empile `#enemy-zone` / `#team-zone` / `#reserve-zone` **depuis le haut** : l'espace non rempli par les rangées reste **en bas du board**, juste au-dessus du mini-log et de la fenêtre d'action. D'où la bande morte entre les cartes alliées et la fenêtre. La maquette v2.3 (`docs/design/maquettes/ecran-combat-v2.html`, référence VALIDÉE) place ce vide résiduel **au CENTRE, entre les deux camps**, camp allié collé au bas du terrain.

## INVARIANTS (règles d'or, repris du chantier repositionnement)

1. **La fenêtre d'action ne recouvre JAMAIS le terrain.**
2. **Feedback au-dessus du point de contact, jamais sous le pouce** (règle d'occlusion) : tout indicateur de tour actif s'affiche AU-DESSUS de l'unité.
3. **Digest INCHANGÉ attendu** : pure présentation (HTML/CSS/JS d'affichage), aucun changement moteur ni data. Référence : baseline proposée PR #13 (`3b11106f…` 871/3000 / `6c86838b…` 2888/10000, verrouillage en attente). Toute divergence = STOP et MESURE, rien ne se recalibre ici.
4. **Aucun recouvrement entre vignettes** (boss 118 px, invocations en première ligne : la géométrie livrée ne se dégrade pas).

## Lot 1 — « QUI JOUE » lisible en 1 seconde, sur le terrain ET dans le rail

1. **Unité active surlignée SUR LE TERRAIN** : liseré or animé (pulse discret, pas de flash plein écran) + badge « ▶ » accroché AU-DESSUS de la vignette, posé au début du tour et retiré à la fin — pour le combattant actif **des deux camps** (allié en Tactique, allié comme ennemi pendant les tours auto). Convention du genre : stats et état se lisent SUR les unités (`docs/design/recherche-ecran-combat-2026-11-14.md`).
2. **Chip `.acting` du rail renforcée** : taille +1 cran (≥ 0,8rem), fond or nettement plus opaque, ▶ agrandi ; **scroll automatique du rail** pour que la chip active soit toujours visible (le rail déborde à 3+ unités par camp). L'indicateur « › » vers la suite du tour est conservé.
3. **Fenêtre d'action (Tactique)** : le nom du combattant actif passe en gras, taille +1 cran, et « à vous d'agir » devient un **badge or visible** (chip, pas texte gris) ; les stats PV/MP en clair sont conservées.
4. **Tours automatiques** : étiquette flottante au début de l'action de chaque unité — le NOM de l'unité au-dessus d'elle (au-dessus du point de contact, invariant 2), discret mais lisible, jamais cumulé avec les dégâts flottants (décalage vertical ou remplacement).
5. **Preuve** : captures portrait 390×844 d'un tour tactique ALLIÉ, d'un tour AUTO allié et d'un tour AUTO ennemi — QUI agit identifiable en 1 seconde sur le terrain ET sur le rail, sans lire le journal.

## Lot 2 — suppression du vide : le camp allié ancré au bas du terrain (maquette = référence)

1. **Ancrage bas** : le camp allié (sa ligne d'invocations incluse) est collé **au bas du terrain**, le vide résiduel se retrouve **au CENTRE entre les deux camps** — comme la maquette v2.3. Piste d'implémentation (à adapter) : `margin-top: auto` sur le groupe allié dans `#board`, ou `justify-content: space-between` sur `#board` selon l'ordre des zones ; l'important est le RÉSULTAT mesuré, pas la technique.
2. **Aucune bande morte entre les cartes alliées et la fenêtre d'action**, que la fenêtre affiche les actions OU soit réduite : mini-log et fenêtre restent collés sous le camp allié. C'est l'invariant de rendu : « commander en bas, lire en haut, le milieu au plateau seul ».
3. **La réserve reste solidaire du camp allié** (rangée arrière/badge ⇄ juste au-dessus ou à côté des alliés) : elle ne doit jamais se retrouver isolée dans le vide central.
4. **Paysage (rail latéral) et grand écran PC** : même ancrage vérifié — ennemis en haut, alliés en bas du terrain, vide central symétrique ; aucun chevauchement de vignettes (sweep 844×390, 1440×900, 2560×1080).
5. **Preuve** : captures portrait avant/après (fenêtre affichée ET réduite) + paysage + PC large : bande morte sous les alliés = 0 px, vide central mesuré entre les camps, terrain SVG entier visible à tout moment.

## Hors périmètre

- **Moteur, data, ciblage, IA, calibrage, vitesses** : inchangés (§0 n°5, rien ne bouge ici).
- **Arts/habillage** (couloir design) : positions, tailles et surlignages seulement, pas d'illustration.
- **Réorganisation des zones du terrain** (déplacer ennemis/alliés d'autres manières) : NON — la maquette v2.3 validée fait foi, ce chantier ne fait que la SERRER.

## Discipline

AGENT.md habituelle : un lot = un commit FR ; `data/*.json` source de vérité ; `dist.html` jamais à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant édition ; preuve = build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + digests `node combat-digest.mjs dist.html 3000` et `10000` (**INCHANGÉS attendus** contre la baseline proposée `3b11106f…`/`6c86838b…` : toute divergence = STOP + mesure consignée) ; captures dans `docs/captures-validation/repositionnement-ecran/` (préfixe `correctifs-v2-`) ; retour terrain de Marc-Olivier sur son téléphone attendu à la livraison.
