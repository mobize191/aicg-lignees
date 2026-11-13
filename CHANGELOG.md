# Changelog

## [post-v1.51] — 2026-11-15 — Correctif : un combat de zone (Terres Sauvages) ne s'affiche plus comme un donjon

L'en-tête du combat affichait le donjon associé à la zone (« étage 1/10 ») pendant une rencontre de l'errance. Désormais : « ⚔ {zone} — combat de zone » dans le titre et « ⚔ Combat de zone » dans le chip d'étape ; les runs de donjon (y compris l'entrée du donjon depuis l'errance) sont inchangés. 280 tests (nouveau test headless 3 phases), smoke 450 checks, **digests inchangés `3b11106f…` / `6c86838b…`**.

## [post-v1.51] — 2026-11-15 — Correctif écran de combat v4 (3e retour terrain téléphone) : tout tient sur l'écran, plus de scroll pour voir les deux équipes

Les cartes de combat restent en grand format mais sont désormais bornées par la hauteur aussi (`min(28vw, 11dvh)` en portrait, ~93 px sur 390×844 ; 14dvh en paysage) : les rangées ne wrappent plus et les deux camps tiennent entièrement dans le terrain, fenêtre de commandes ouverte comme en mode bandeau (seul le menu de choix des sorts défile en interne). Zone de commandement ramenée à `min(25dvh, 240px)`, marges resserrées (constantes, le terrain reste stable au pixel). Mesuré : `scrollHeight == clientHeight` sur 390×844, 844×390, 1440×900 et 2560×1080. 279 tests, smoke 450 checks, sweep Playwright 46/46, **digests inchangés `3b11106f…` 871/3000 / `6c86838b…` 2888/10000**. Captures `correctifs-v4-*`.

## [post-v1.51] — 2026-11-15 — Correctifs écran de combat v3 LIVRÉS (3 lots, pure UI, tranchage 15/11) — cartes plus grosses, camps face à face, terrain stable, défilement des tours visible

Prompt `docs/prompt-correctifs-ecran-combat-v3.md` (2e retour terrain téléphone). **Lot 1** : grand format constant (unités ~117 px sur 390 px, boss ~1,4×) et camps rapprochés face à face au CENTRE du terrain (écart mesuré 4 % de la hauteur du terrain) — le tranchage du 15/11 remplace le placement « alliés en bas » de la maquette v2.3. **Lot 2** : terrain STABLE — plus aucun resize à l'ouverture de la fenêtre, zone de commandement permanente à hauteur fixe (≤ 30dvh) en bas (portrait) / dans le rail (paysage), mini-log dans la zone ; preuve : positions des cartes identiques AU PIXEL entre fenêtre ouverte et fermée sur 4 résolutions. **Lot 3** : bandeau d'état permanent « ▶ Tour de [Nom] — ensuite : X › Y › Z » quand ce n'est pas au joueur (la fenêtre de commandes le remplace quand c'est à lui) ; bandeau, rail d'ordre et surlignage or de l'unité active désignent toujours le même combattant. 279 tests, smoke 448 checks (section 54), sweep Playwright 36/36, **digests inchangés `3b11106f…` 871/3000 / `6c86838b…` 2888/10000**. Captures `correctifs-v3-*`. Validation terrain Marc-Olivier en attente.

## [post-v1.51] — 2026-11-15 — Correctifs écran de combat v2 LIVRÉS (2 lots, pure UI) — « qui joue » lisible en 1 seconde, vide central supprimé

Prompt `docs/prompt-correctifs-ecran-combat-v2.md` (retour terrain téléphone 15/11). **Lot 1** : l'unité active est surlignée SUR le terrain (pulse or + badge ▶ au-dessus de la vignette, alliés comme ennemis, tours auto compris), la chip `.acting` du rail d'ordre est renforcée et le rail scrolle automatiquement vers elle, la fenêtre d'action affiche le nom du combattant en gras + un badge or « ▶ à vous d'agir », et chaque tour automatique pose une étiquette du nom de l'unité au-dessus d'elle (jamais cumulée avec les dégâts flottants). **Lot 2** : le camp allié est ancré AU BAS du terrain (`margin: auto 0 0`) — bande morte mesurée 0 px, le vide résiduel tombe au centre entre les deux camps comme la maquette v2.3 ; le badge ⇄ réserve rejoint le camp allié. 279 tests, smoke 434 checks (section 53), sweep Playwright 28/28 (390×844 → 2560×1080, 0 recouvrement, 0 erreur console), **digests inchangés `3b11106f…` 871/3000 / `6c86838b…` 2888/10000**. Captures `docs/captures-validation/repositionnement-ecran/correctifs-v2-*`. Validation terrain Marc-Olivier en attente.

## [post-v1.51] — 2026-11-14 — Retour terrain PC : l'écran de combat remplit les grands écrans (was: unités trop petites, espace perdu)

Sur écran large (≥ 1200px en paysage), les unités de combat sont à l'échelle du viewport (jusqu'à 250px, boss 340px) et les rangées s'étalent sur toute la largeur (`space-evenly`, marges symétriques) ; rail latéral élargi (min(430px, 26vw)). Pure présentation : 279 tests, smoke 421, sweep 43/43 (jusqu'à 2560×1080, app = 100 % de la largeur), **digests inchangés `3b11106f…` / `6c86838b…`**. Captures `docs/captures-validation/repositionnement-ecran/grand*`.

## [post-v1.51] — 2026-11-14 — Repositionnement de l'écran de combat LIVRÉ (3 lots, maquette v2.3 VALIDÉE 14/11) — commander en bas, lire en haut

Prompt `docs/prompt-repositionnement-ecran-combat.md` (TRANCHÉ 14/11, couloir 1, pure UI). **Lot 1** : tiers haut persistant — rail d'ordre du tour HORIZONTAL en haut (#topbar : ennemis inclus, acteur doré, chip boss élargi, chip invocation pointillé, séparateur ›, compteur étage à droite) + vitesse/pause persistants en haut à droite (#speedbar, hors fenêtre d'action) ; paysage = rail latéral droit (vitesse/pause en haut, rail d'ordre vertical, commandes en bas). **Lot 2** : la fenêtre d'action devient une BARRE de commandes compacte bornée à 30dvh (était 38dvh) — tête réduite, boutons en grille ≥ 44 px, sort indisponible grisé AVEC la raison (MP insuffisant x/y), fiche complète flottante à la demande ancrée au-dessus de la barre côté opposé au clic ; badge réserve ⇄ + mini-log 3 lignes juste au-dessus conservés. **Lot 3** : unités ≥ 74 px (boss ≥ 118 px + nom en gras), barres PV/MP + chiffres en clair sur les pions, bouclier = fine barre dorée AU-DESSUS de la barre PV + badge chiffré ; invocations en PREMIÈRE LIGNE (rangée dédiée devant chaque camp, carrés 40 px pointillés couleur de camp, cliquables, PV mini + ⏳ ttl) ; ciblage = cibles valides en pulse, invalides grisées pendant le choix, confirmation ✔ au-dessus de la cible, feedback flottant au-dessus de l'unité. Invariants tenus : la barre ne recouvre JAMAIS le terrain (0 recouvrement mesuré 390×844/844×390/1440×900). 279 tests, smoke 421 checks (nouvelle section 52), sweep Playwright 24/24, **digests INCHANGÉS `3b11106f…` 871/3000 / `6c86838b…` 2888/10000** (pure présentation, 0 exception). Captures `docs/captures-validation/repositionnement-ecran/`. Validation terrain Marc-Olivier en attente.

## [post-v1.51] — 2026-11-14 — Correctifs sorts LIVRÉS (5 lots, TRANCHÉ 14/11) — un sort fait EXACTEMENT ce que sa fiche affiche (audit 0 anomalie)

Prompt `docs/prompt-correctifs-sorts.md`, revue `docs/historique/revue-sorts.md`. **Lot 1** : lignée du Vol = attaques (les 6 sorts passent en « 1 ennemi », la fenêtre Tactique propose les ennemis). **Lot 2** : les signatures des recrues appliquent l'effet de leur fiche EN TACTIQUE (bouclier, boost, lien, copie, invocation, résurrection, stun/slow/dot/curse) — chemin Auto inchangé. **Lot 3** : la largeur d'un sort vient du cran du porteur, jamais du MAX des crans. **Lot 4** : Appel/Pont = vraie invocation (esprit temporaire, stats dérivées du lanceur, ttl 3 tours, un actif max) en Tactique ET en Auto. **Lot 5** : badges contrôle/malus implémentés — 24 sorts de lignée (Entrave : stun 25 %→15 %, 1-2 tours ; Mauvais-Œil : malédiction −15 %→−30 % de dégâts × 2 tours) + Œil du Malheur (−20 % de dégâts × 2 tours, desc corrigée) posent leur statut EN PLUS de leurs dégâts, en Tactique ET en Auto ; la fiche affiche « 25 % · 2 tours ». 279 tests, smoke 414 checks TOUT PASSE, **audit 309 sorts : 0 anomalie** (85 avant). **Digests MESURÉS** : lots 1-4 inchangés `4a5b0123…` 861/3000 / `3f828555…` 2864/10000 ; lot 5 **`3b11106f…` 871/3000 / `6c86838b…` 2888/10000** (aucun recalibrage ; nouvelle baseline proposée à Marc-Olivier, en attente de verrouillage dans `docs/arbitrages.md`). Validation terrain Marc-Olivier en attente.

## [post-v1.51] — 2026-11-13 — UX combat adaptatif LIVRÉE (2 lots, TRANCHÉ 13/11) — la fenêtre d'action ne recouvre JAMAIS le terrain

Prompt `docs/prompt-ux-combat-adaptatif.md`. **Lot 1 (layout)** : fenêtre d'action dans le flux (`#act-slot`) — portrait = panneau bas borné 38dvh avec terrain entier visible au-dessus ; paysage = rail latéral droit (≤40 %), terrain à gauche, zéro recouvrement (invariant vérifié 41/41 sur 5 résolutions) ; fiches flottantes au clic pendant un choix (fenêtre d'action non fermée) ; **réserve cachée** (badge ⇄ vivantes/total → sélecteur d'échange, 3+2 inchangé) ; pause 340 ms avant la fenêtre suivante. **Lot 2 (lisibilité)** : floatText 700 ms min garanti même à ×16/×32, trace source→cible sur chaque attaque, **mini-log permanent** de 3 lignes (toucher = log complet) traçant chaque événement (« X frappe Y : -12 PV »). 270 tests, smoke 414 checks. **Digests MESURÉS inchangés `4a5b0123…` 861/3000 et `3f828555…` 2864/10000** (présentation seule). Captures `docs/captures-validation/ux-combat/`. Validation terrain Marc-Olivier (téléphone + PC) en attente.

## [post-v1.50] — 2026-11-13 — Correctifs terrain v1.51 (9e signalement) — 3 LOTS LIVRÉS

Prompt `docs/prompt-correctifs-v1.51.md`. **Lot 1 (moteur, MESURÉ)** : signatures des 14 cartes Prêtre (et 14 monstres) soigneuses = de vrais soins (rôle soin embarqué, symétrie Auto joueur/ennemi) ; **Ascendance retirée** (tranchage oral 13/11 : statsAt sans asc, UI, migration save v28→v29) ; **défaite d'un combat de zone = écran dédié** « retour au Port des Brumes », plus de texte de donjon ; mana prouvé persistant entre combats de zone (test headless). **Lot 2 (UI, digest inchangé)** : fiche unifiée menu équipe = combat (illustration contenue, stats PV/ATQ/AGI/INT + mana en combat), badge élément réparé, splash Mage / wave Occultiste explicitées, cartes de combat plus grandes. **Lot 3 (économie)** : plus d'achat de cartes/monstres à l'or — recrutement UNIQUEMENT à la Guilde en jetons 🎫 ; Boutique = équipement à l'or uniquement. 266 tests, smoke 404 checks. **Digests MESURÉS `4a5b0123…` 861/3000 et `3f828555…` 2864/10000** (lot 1 : +0,77/+0,69 pt vs `9faff1b9…`/`6103e7b0…`, aucun recalibrage ; lots 2-3 inchangés).

## [post-v1.50] — 2026-11-13 — Correctifs smoke + heuristique IA — LOT 1 LIVRÉ (smoke robuste)

Prompt `docs/prompt-correctifs-smoke-ia.md`. **Lot 1 (script de test uniquement, jeu inchangé)** : B9 c ne cherche plus une quête « tuer » en dur (progresse la première quête non faite, quel que soit son type, + garde-fou B9 h sur 7 dates simulées) ; échecs préexistants traités avec justification en commentaire (43 B → 3 actifs + 2 réserve depuis v1.41 ; B1 c → prix débité + récompense de quête du jour ; B11 l → recrutement en jetons, jamais en or ; B29 h → date locale robuste au fuseau ; 45 e → assertions sémantiques ; crash `chr(233)` réparé). 252 tests, smoke **412 checks TOUT PASSE sans crash**. Digests inchangés `9faff1b9…` 838/3000 et `6103e7b0…` 2795/10000.
## [1.51] — 2026-11-13 — Switch 4 versions des illustrations (vague 3.3) — LIVRÉ

Le bouton 🖼️ cycle **V3 → V3.1 → V3.2 → V3.3** avec l’étiquette de version affichée sur le bouton, préférence persistée (`fondations-art-src`). `ART_MANIFESTS = { v3, v31, v32, v33 }` ; un manifeste manquant = bouton grisé libellé, jamais d’erreur, version courante inchangée. Les 37 arts de la vague 3.3 sont aussi ajoutés au manifeste par défaut `assets-v3.json` (présents dans toutes les versions). IHM seule : 256 tests (4 nouveaux, cycle complet + préférence persistée + manifeste manquant toléré), smoke S27 a-f, **digest inchangé `9faff1b9…` / `6103e7b0…`**. Protocole IHM v1.51 (scénario S27).

## [1.39] — 2026-11-12 — XP PAR COMBAT + fenêtre de fin de combat + SUPPRESSION DU MODE AUTO — LIVRÉE (2 lots)

## [1.40] — 2026-11-12 — Correctif errance : les interactions se déclenchent au clic — LIVRÉ

Prompt `docs/prompt-correctifs-v1.40.md` (bug signalé 12/11, 12e tour). Hitbox élargie : porte du donjon = tout le bâtiment + 1 anneau, autel/retour/huttes = tuile + 8-voisinage, toast de confirmation au clic. Arrivée garantie : tuile praticable recherchée au 8-voisinage (repli ±2), seuil d'arrivée en data (`ERRANCE_ARRIVAL_RADIUS = 1,9`), déclenchement immédiat si le héros est déjà à portée, toast « ✗ Chemin bloqué » + annulation si A* échoue (plus jamais de silence). Retour ville → hub-ville (`#accueil`). 214 tests, smoke B27 f/g, **digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000**.
Prompt `docs/prompt-correctifs-v1.39.md` (TRANCHÉ 12/11, 11e tour). **Lot 1** : l'XP est distribuée à **chaque combat terminé** (condition `(won || zoneFight)`, base ramenée à 1 étage `DIFFX.pts × (×1,5 victoire / ×1 défaite) × 0,8 × (×2 découverte) × xpMultFor`) — un run de 5 étages distribue 5 × la base, même total que l'ancienne formule `stages × base` ; l'écran **Récompenses affiche l'XP par personnage** (nom → niveau, % si mult < 1) avec l'or et les objets ; l'écran de fin de donjon devient un **récap** (somme du run, affichage seul) ; défaite de donjon : XP des combats gagnés conservée, combat perdu sans XP ; combat de zone : victoire et défaite distribuent (v1.38). **Lot 2** : le **mode auto est supprimé du combat joué** — `autoMode`, boutons `#mode` / `🤖 Auto ce tour`, boucle d'auto-enchaînement, `uiPrefs.combatAuto` (migration passive : champ ignoré, pas de bump de version), `combatTally` / `tactMult` / `tactXpMult` et les lignes 🧭 — les récompenses sont toujours intégrales. **L'auto-résolution interne du moteur (`src/engine/combat.js`) est intacte** : elle servira le futur mode « missions spéciales » (expéditions). Aide/glossaire et changelog in-game v1.39 mis à jour (entrées historiques intactes). 209 tests, smoke (B23/B28 adaptés), **digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000**.


## [1.38] — 2026-11-12 — Correctifs retours terrain 9e tour — LIVRÉE (2 lots)

Prompt `docs/prompt-correctifs-v1.38.md` (TRANCHÉ 12/11). **Lot 1** : tout combat de zone terminé (victoire **ou** défaite, porte du donjon de zone comprise) distribue désormais l'XP d'un étage de run à l'écran Récompenses — la condition `!won || finalClear` est devenue `!won || finalClear || zoneFight`. **Formule inchangée**, runs de donjon inchangés (XP en fin de run uniquement). **Lot 2 (TRANCHÉ)** : l'aléatoire se lance **par combat** — un compteur persisté (`zoneFightCount`) entre dans le seed des vagues de zone (`hash(jour|donjon|diff|compteur)`), chaque rencontre est différente et reproductible ; les donjons classiques gardent leur seed inchangé. Taille des vagues de zone en data (`errance.waveSize: [2, 3]` pour les 5 zones, consommée par `makeWave`) — la croissance se fera plus tard, en data uniquement. 202 tests, smoke 404 checks (B28/B29). **Digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000.**

## [1.37] — 2026-11-12 — Correctifs retours terrain 7e-8e tours — — LIVRÉE (7 lots)

Prompt `docs/prompt-correctifs-v1.37.md` (ACTÉ 12/11). **Lot 1** : garde « équipe formée » (entrée zone/donjon/combat de zone refusée sans carte en équipe, toast + redirection) + genre de combat rattaché au run (`runState.kind`) + fin des états zombies (rencontres de l'errance plus jamais bloquées, donjon enchaîné correctement) — module pur `src/engine/zoneflow.js`, 4 tests headless. **Lot 2** : boutons ＋/−/ℹ️ (collection) et − (slots équipe) déplacés en bas-droite, badge de niveau conservé en haut-droite — smoke B22. **Lot 3 (ACTÉ)** : mode **Tactique par défaut** (le bouton de bascule reste), choix **persisté dans la sauvegarde** (`uiPrefs.combatAuto`, champ additif sans changement de version de save, sauvegardes anciennes rechargées en Tactique). Rappel de l'effet récompenses existant, inchangé : prorata des tours joués en Tactique — tout en Tactique = récompenses intégrales, tout en Auto = ÷2 (or, éclats, XP). **Lot 4 (ACTÉ)** : Boutique épurée — le marchand de créatures n'affiche plus que les **3 offres du jour** (offre épuisée grisée avec compteur), les articles verrouillés par la progression sont **masqués**, le manque d'or seul laisse l'article visible avec bouton grisé ; potions/éclats/atelier inchangés. **Lot 5 (8e tour)** : l'esquive est enfin visible — floatText proéminent « 💨 Esquivé ! », pose du pion et **ligne de journal** (« X esquive la frappe de Y »), l'événement moteur porte désormais l'attaquant (`sourceId`) ; la fenêtre d'action affiche la frappe avec ses **dégâts effectifs et le % de frappe de la classe** (ex. Prêtre 70 %, `CLASSE_MODS.strike` en data), idem sur la fiche carte, et l'esquive de la cible est rappelée dans la désignation. **Lot 6 (8e tour)** : les sorts signature (cartes et monstres) ont désormais une fiche complète **rôle · cible · puissance**, dérivée des data (`signatureMetaOf`) ; le ciblage Tactique suit la fiche (plus de liste d'alliés pour un sort de dégâts — l'action frappe la cible désignée), et la métadonnée reste hors des objets lus par l'IA Auto (digest inchangé). **Lot 7 (8e tour)** : au lancement d'un combat depuis l'errance le héros est **figé** (chemin vidé) — au retour il ne repart que sur un tap ; la **grâce post-combat passe à 8 pas** (constante `ERRANCE_GRACE_COMBAT` en data). 196 tests, smoke 394 checks (B22-B27). **Digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000** — aucune maths, ENC_RATE, équilibrage ou économie touché.

## [1.36.1] — 2026-11-12 — Correctif errance (retours terrain 6e tour) : grand lac, thème plage, interactions, héros vectoriel

Prompt `docs/prompt-correctif-errance-v1.36.1.md` (ACTÉ 12/11). **Lot 1** : fix racine « grand lac » — pond peint = amas d'eau intérieur uniquement (débordement ≤ 0,25·T), garde-fou headless 5 zones. **Lot 2** : thème plage des Marées (layout v3, bande de mer sud en data) + `EAU_PROFONDE` (infranchissable) / `EAU_PEU_PROFONDE` (praticable) / `SABLE` en data pour les 5 zones. **Lot 3** : dialogues des huttes, feedbacks visibles (halos autel/retour/porte, marqueur de destination), enseignes « ↩ Ville » / « ⚔ Donjon », retour ville à ≤ 6 tuiles du spawn. **Lot 4** : héros vectoriel de la maquette A+ (remplace le sprite WAN, contrainte levée). 177 tests, smoke 362 checks (B21 durci). Digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000. Captures S24 : non réalisables dans le sandbox (pas de navigateur), à faire en validation IHM.

## [1.36] — 2026-11-12 — Refonte visuelle de l'errance (maquette A+ + guide, zone témoin Marées puis 5 zones)

Prompt `docs/prompt-refonte-errance.md` (ACTÉ 12/11, 4e tour), maquette `docs/design/maquettes/errance-demo-jouable.html`, guide `docs/design/errance-topdown.md`. **Lot 1** : peinture style A+ en pré-rendu unique (`src/errance-paint.js`, RNG décor déterministe seedé, palette en data) — taches organiques, chemin texturé, étang complet, arbres/rochers/donjon/autel peints avec ombres portées, bordures de fleurs des hautes herbes ; jarres par frame. **Lot 2** : ambiance §9bis — cycle jour/nuit (`ambiance.dayLen` en data), overlays semi-transparents + phase HUD, lames animées groupées (rafale positionnelle + écart au héros), traces de pas, écume d'étang, nuages, papillons/lucioles/pissenlits/feuilles, fumée, `prefers-reduced-motion` gelé. **Lot 3** : layout v2 data-driven des Marées (waypoints, étang à l'échelle, 2 huttes), **point de retour ville dans chaque zone**, sûreté des saves (position héros persistée/rechargée/secourue, migration v28). **Lot 4** : palettes des 5 zones (Forge braises, Bosquet profond, Crypte froide, Zénith doré). 175 tests, smoke 355 checks (B21). Digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000 — aucune maths, ENC_RATE, équilibrage ou contenu touché ; sprite WAN conservé. Protocole IHM v1.36 + scénario S24 (captures comparatives maquette vs jeu).

## [1.35] — 2026-11-12 — Parties multiples (4 slots de sauvegarde parallèles)

Prompt `docs/prompt-parties-multiples.md`. **Lot 1 (stockage + migration)** : 4 emplacements `fondations-cards-v1.p0`…`.p3` + index `.slots` (nom, version, date, résumé or/donjon·étage/niveau d'équipe), rotation `.bak` **par partie** ; à la première ouverture, la sauvegarde historique devient la **Partie 1** sans perte (clés historiques conservées en repli) ; API `listSlots`/`switchToSlot`/`newSlot`/`renameSlot`/`deleteSlot`. **Lot 2 (UI Accueil)** : panneau « Parties » à côté de la boîte 💾 — ▶ Jouer / ✨ Nouvelle partie (départ frais, écran de départ rejoué) / ✏️ Renommer / 🗑 Supprimer à double confirmation ; la partie en cours est sauvegardée avant toute bascule, la partie active est mémorisée et rechargée au lancement ; export/import FCSAVE1 inchangés (s'appliquent à la partie active). Questions ouvertes balisées `[À TRANCHER — SESSION 12/11]` dans `docs/arbitrages.md` (défauts appliqués : 4 slots, noms libres défaut « Partie N », active mémorisée). 171 tests, smoke 347 checks (B19/B20, 3 échecs préexistants hors périmètre). **Digests inchangés `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000** — chantier 100 % stockage/IHM, aucune maths touchée.

## [1.34] — 2026-11-12 — Refonte de l'IA de combat (chantier complet : audit, spec, lots 0-4)

Prompt `docs/prompt-refonte-ia.md`, audit `docs/design/refonte-ia-audit.md`, spec `docs/design/refonte-ia-spec-plan.md`. Prérequis : correctifs ciblage livrés (fiche `cible` des 84 sorts de lignée, camp depuis la fiche, sorts alliés de lignée résolus par rôle en Tactique — digest inchangé). **Lot 0** : en mode 🤖 Auto, les sorts alliés de lignée (soin/boost/bouclier) depuis l'arrière font leur effet. **Lot 1** : ciblage par utilité partagée IA/Auto (kill possible, menace, ligne arrière protégée, opposition d'élément) avec hystérésis anti flip-flop. **Lot 2** : choix de sort contextuel (soin sous seuil, contrôle sur la menace, burst si kill possible, sinon efficacité au coût) avec hystérésis. **Lot 3** : profils IA par difficulté en data (Facile sous-optimal → Enfer utilité complète, graine IA dédiée déterministe). **Lot 4** : garde-fous anti-blocage de l'errance (repath après stagnation, abandon après échecs). Poids en data, anti-triche vérifié par introspection (smoke B16). 171 tests, smoke 306 checks (3 échecs préexistants). MESURES par lot dans `docs/arbitrages.md` ; digest final N = 3000 `c62fcbd1…` 1281/3000 et N = 10 000 `5059e683…` 4236/10000 — écart 2,6 pts vs mesure de lancement, aucune maths joueur touchée.


## [1.33] — 2026-11-12 — Illustrations V3.1 en doublon commutable (bouton 🖼️)

Relance 3.1 complète livrée (271 cartes, verrous R8/R9/R10 + anti-cadre/anti-texte renforcés, rapport `tools/out-v2/RAPPORT-v31-session.md`) et publiée en second manifeste `assets-v3.1.json` (362 arts + 8 fonds, ~30 Mo), commutable avec V3.0 via le bouton 🖼️ (`ART_MANIFESTS = { v3, v31 }` dans `src/ui.js`, source choisie persistée en localStorage `fondations-art-src`). Les assets existant uniquement en 3.1 (7 cartes série 3 g31/g32/k31/k32/p2/z31/z32 + 90 arts d'équipement série 3) sont ajoutés au manifeste par défaut `assets-v3.json` : présents par défaut partout, le switch ne les retire pas. La CI Pages publie désormais `assets-v3.json` + `assets-v3.1.json`. Moteur et data inchangés : digest inchangé `f8a9f0bb…` 1359/3000.


## [1.32] — 2026-11-11 — Chantier « contenu v3 » exécuté (8 lots)

Spec et plan : `docs/design/contenu-v3-spec-plan.md`. **C1** : marchand de créatures v2 — 3 offres/jour (rotation `seedOfDay`), prix actés C 200 / UC 1 500 / R 4 500 / SR 8 000 / UR 10 000 or, raretés débloquées par difficulté de donjon bouclée (C, puis UC/R/SR/UR), limite 3 exemplaires. **C2** : Sirènes des Récifs auditées et verrouillées (e23-e30, L Méliane/Thalassa, vagues + errance). **C3** : gobelins régionaux — variantes C/UC au Bosquet (g31/g32), à la Crypte (k31/k32), au Zénith (z31/z32), foyer Marées ; digest re-mesuré `f8a9f0bb…` 1359/3000 (MESURE, sans recalibrage). **C4** : Clergé du Plein Jour audité (Apolline M, Justine L, Zénith à 2 M). **C5** : greffe des 31 solos archivés dans des familles d'accueil, cibles d'évolution préservées, plus d'archives. **C6** : familles compagnons — 7 voies b1-b7 → UR (c1-c7) → L nommée (c8-c14). **C7** : familles divines joueur (seuil/miroir/pont, w1-w18), maillons du Jeune Séraphin (p5 UR, p6 L), lignées d'accueil des Enge (w19-w21). **C8** : clôture — tables régénérées, protocole IHM v1.33, digest N = 10 000 `978ed44b…` 4517/10000 en MESURE. 150 tests, smoke 299 checks (2 échecs préexistants 46 g/45 e). MESURES consignées dans `docs/arbitrages.md` ; baseline verrouillée `f72106ff…`/`3f9fe198…` non touchée.


## [1.31] — 2026-11-11 — Chantier « reste code » exécuté (7 lots)

Spec et plan : `docs/design/reste-code-spec-plan.md`. **Lot 1** : correctifs terrain (doublons de sorts à l'évolution, `elOf()` sur les pions, bouton réduire la fenêtre d'action, `FAM_ORDER` des 4 familles v3, boutons ≥ 32 px, double bordure des cartes) + **migration v27** qui dédoublonne les sorts hérités (`acc`) des sauvegardes polluées. **Lots 2-4** : conformité vérifiée — rangs avant/arrière Option A dans le moteur (`RANG_BACK_*`, soins jamais affectés, zones non couvertes, CROSS retiré), champ `role` supprimé partout avec formation 3+2/2+3 choisie avant le combat, `FAM_SCHOOL` en data pour le recâblage famille → école. **Lot 5** : vidéos FX complètes — une seule vidéo décodée à la fois, pause hors écran, `prefers-reduced-motion` → image fixe, vitesse de lecture suivant le combat. **Lot 6** : héros d'errance intégré (sprite sheet 81 frames extraite du cycle WAN dans `site-assets/errance/`, publié par la CI, repli procédural hors ligne) et errance généralisée aux 5 zones (smoke B14). **Lot 7** : craft en ville (atelier de la Boutique : matériaux de zone + matière du boss pour les paliers hauts, coûts en data) + page Personnage à onglets (Équipe/Inventaire, bouton retour) (smoke B15). 144 tests, smoke 294 checks (seuls échecs préexistants 46 g/45 e), digest inchangé `f72106ff…` 1379/3000. MESURE consignées dans `docs/arbitrages.md`.


## [1.30] — 2026-11-11 — CI réparée + documentation à jour

Le workflow Pages copiait `assets.json`/`assets-wai.json`, archivés depuis v1.28 : le déploiement échouait. `.github/workflows/pages.yml` publie désormais `assets-v3.json` (manifeste unique) et `site-assets/fx/` → `fx/` (vidéos de sorts), précédé d'un job **test** (`node build.mjs && node --test`, 141 tests verts). README, travail-local, validation-ihm et roadmap alignés (manifeste v3, baseline courante `f72106ff…` 1379/3000, 141 tests, smoke 269 checks). Moteur et data inchangés : digest inchangé.


## [1.29] — 2026-11-11 — Correctifs terrain : CSS mobile + fluidité de l'errance

Le bloc CSS des écrans récents (Récompenses, Boutique, équipement, FX), collé après `</html>`, est remonté dans le `<style>` du head : plus aucun texte brut visible sur téléphone. Errance conforme au guide : pilotage inertiel (§5 : accélération, virages en arc, freinage, aucune orbite, collision par axe, tilt), caméra lerp indépendante du framerate + look-ahead 0,12 s + zoom 1,05→1,7 (§6), décor pré-rendu une fois puis un seul `drawImage` par frame (§3), canvas en résolution native avec DPR plafonné à 2, mémo A* au drag et `pointerup` sur `window` pour iOS (§4/§10). 141 tests, smoke 269 checks. Digest inchangé `f72106ff…` 1379/3000.


## [1.28] — 2026-11-11 — Illustrations : la campagne V3 devient la source unique, anciennes sources archivées

La vague 3 (271 prompts langage naturel painterly, `tools/prompts-v3.json`, rapport `tools/out-v2/RAPPORT-vague3.md`) est validée et devient l'unique source d'illustrations : nouveau manifeste `assets-v3.json` (265 arts + 8 fonds, budgets charte §13, 24 Mo, 0 au-dessus du plafond), `ART_MANIFESTS = { v3: 'assets-v3.json' }` dans `src/ui.js`. Les anciens manifests `assets.json` (DreamShaper XL), `assets-wai.json` (WAI comparatif) et `assets-v2.json` (vague 2) sont déplacés dans `archives/assets/`. Vidéos WAN 2.1 v3 (hub, Marées, sprites) livrées dans `tools/out-v2/video/` avec frames QA. Masters 1040×1520 conservés hors repo (ComfyUI/output/out-v2/state/masters-v3). Moteur et data inchangés.


## [1.27] — 2026-11-11 — Bloc visuel : hub-ville, Les Terres Sauvages, errance top-down (zone témoin Marées)

L'accueil devient un hub-ville (scène procédurale, menu latéral, quêtes du jour, héroïne cliquable) avec un gros bouton « LES TERRES SAUVAGES ». Nouvelle page Terres Sauvages : sélecteur de zones (départ verrouillé sur la zone de l'eau, déblocage en chaîne par le donjon de zone). Errance top-down dans la zone témoin Marées : carte canvas procédurale déterministe (seed en data), déplacement au clic avec A* + lissage, rencontres dans les hautes herbes, autel de soin et jarres, combats dans la chaîne d'étages (victoire = déblocage). Migration v26 non destructive. 139 tests, smoke 269 checks (11 nouveaux B12). Digest inchangé `f72106ff…` 1379/3000.


## [1.26] — 2026-11-11 — Correctif IHM + parcours de test complet

Le badge « nouvelle carte » (✨) ne reste plus affiché sur les cartes placées en équipe. Le smoke IHM gagne une section B11 : parcours complet (départ 2 cartes, équipe, donjon, combat, Récompenses, quêtes, Boutique, Guilde, inventaire, sauvegarde v25). 134 tests, smoke 258 checks (2 échecs préexistants hors chantier). Digest inchangé `f72106ff…` 1379/3000.


## [1.25] — 2026-11-11 — Économie v2 clôturée (lots E1-E5)

Clôture du chantier économie v2 : Boutique complète, marchand de créatures, Guilde et compagnons du jour, jetons de génération supprimés (conversion en or, migration v25), quêtes quotidiennes (migration v24). Digest inchangé : `f72106ff…` 1379/3000, `3f9fe198…` 4558/10000 (N = 10 000). 134 tests, smoke 243 checks. Rapport : `docs/historique/economie-v2.md`. Prochain bloc : hub-ville + errance (craft en ville et page Personnage à onglets avec la maquette).


## [1.24] — 2026-11-11 — Économie v2, lot E3b : les jetons de génération disparaissent (migration v25)

Les jetons de génération sont supprimés : plus d'octroi (départ, boss, jalons), plus de table `JETON_RARITY`. Les cartes naissent à la Guilde (compagnons du jour), au marchand de la Boutique, en quêtes quotidiennes et en donjon. Migration v25 non destructive : les jetons restants sont convertis en or (table `JETON_OR`, taux proposés C 100 → UR 5 000). Digest inchangé `f72106ff…` 1379/3000. 134 tests, smoke 243 checks (5 nouveaux verts).


## [1.23] — 2026-11-11 — Économie v2, lot E4 : quêtes quotidiennes (défi du jour supprimé, migration v24)

Nouvelle page 📜 Quêtes : 3 quêtes par jour en rotation quotidienne (1 petite + 1 moyenne + 1 grande), progression persistée remise à zéro chaque nuit. Récompenses en or, la grande quête porte une naissance (carte N) un jour sur trois ou un éclat brut ; bonus de complétion : 1 pierre d’éveil. Le défi du jour est supprimé. Migration v24 non destructive. Digest inchangé `f72106ff…` 1379/3000. 134 tests, smoke 238 checks (7 nouveaux verts).


## [1.22] — 2026-11-11 — Économie v2, lot E3a : la Guilde recrute des compagnons

La Forge s'appelle désormais la **Guilde**. Nouveau : les **compagnons du jour** — 3 offres en rotation quotidienne (seed de la date), rangs C à UR, 500 à 2 000 or, limite 3 exemplaires par carte, rang L jamais recrutable. Évolutions et autel inchangés. Digest inchangé `f72106ff…` 1379/3000. 132 tests, smoke 231 checks (7 nouveaux verts).


## [1.21] — 2026-11-11 — Économie v2, lot E2 : marchand de créatures à la Boutique

Nouveau rayon 🐾 à la Boutique : monstres non nommés, raretés C à UR, prix en données (C 200 → UR 10 000 or, paliers intermédiaires proposés), limite de 3 exemplaires par créature. Pour la fusion et les enseignements. Les jetons de génération disparaîtront au lot E3 (rework Forge → Guilde). Digest inchangé `f72106ff…` 1379/3000. 131 tests, smoke 224 checks (7 nouveaux verts).


## [1.20] — 2026-11-11 — Économie v2, lot E1 : Boutique complète (éclats bruts + rayon équipement)

La 🛒 Boutique couvre le catalogue fixe : potions, **éclats bruts** des 5 éléments (achat 150 or, revente 100 or via l'inventaire) et **rayon équipement** (60 pièces, 200 à 1 600 or — armes typées par classe, armures, slots d'équipe). Les pièces de set restent hors Boutique (boss, craft, évolutions). Pièces achetées équipables depuis la fiche. Digest inchangé `f72106ff…` 1379/3000. 130 tests, smoke 217 checks (7 nouveaux verts).


## [1.19] — 2026-11-11 — Campagne d’illustrations v2 en 3e source d’images

Le bouton 🖼️ cycle désormais entre **3 sources** : DreamShaper XL (`assets.json`, défaut), WAI-Illustrious v17 comparatif (`assets-wai.json`, inchangé) et la **campagne v2** (`assets-v2.json` : 265 arts WAI v17 + 6 fonds, budgets v2 charte §13 : arts 400×560 JPEG q80, fonds 1216×832 q72, manifeste ~21,5 Mo chargé en fetch, jamais embarqué dans le dist). Sources : `tools/out-v2/` (rapport `RAPPORT-vague2.md`), conversion `tools/make-assets.py --v2`. Moteur et data inchangés : digest `f72106ff…` 1379/3000 intact, 128 tests, smoke 210 checks (2 échecs 46 g / 45 e préexistants). Vidéos WAN et héros d’errance produits mais **non intégrés** (hors base64, arbitrage 10/11).

## [1.18] — 2026-11-11 — Boucle de jeu v2, lot 6 : baseline finale et clôture du chantier

Chantier boucle de jeu v2 clos (6 lots, commits `25fd0e1` → lot 6). **Nouvelle baseline digest au pack N = 10 000** : `3f9fe198…` 4558/10000 (45,6 %), 0 exception, 1 marathon — pack 3000 inchangé `f72106ff…` 1379/3000. Preuve finale : build ok, 128 tests verts, smoke 210 checks (2 échecs préexistants hors chantier), tableaux régénérés. Rapport de clôture : `docs/historique/rapport-boucle-v2.md`. Aucun ajustement de maths : les arbitrages d'équilibre restent ouverts jusqu'à la re-mesure finale après l'économie v2.


## [1.17] — 2026-11-11 — Boucle de jeu v2, lot 5 : progression (XP, palier sans perte nette, solos archivés, rang N)

**Courbe d'XP recalibrée** sur l'échelle longue (`moteur.XP_GROWTH` = 0,25 en données : XP du palier = niveau × (1 + 0,25 × (niveau−1))). **Palier d'évolution sans perte nette** : la forme suivante au niveau 1 reste au moins aussi forte (ATQ/PV) que la forme précédente au niveau 10 — bonus calculé depuis les données, vérifié par simulation, appliqué au moteur. **31 cartes solos archivées** : plus de drops ni de naissances, toujours jouables, regroupées dans « Les archives ». **Rang N achevé** : exclu des drops et du recrutement (écran de départ, quêtes, Guilde), éveil N→C par la pierre d'éveil inchangé, jouable en combat. Digest inchangé `f72106ff…` 1379/3000. 128 tests, smoke 210 checks (5 nouveaux verts).


## [1.16] — 2026-11-11 — Boucle de jeu v2, lot 4 : drops v2, Récompenses, inventaire, équipement

**Écran « Récompenses » après chaque combat** : or, XP, drops aux couleurs de rareté et recrues, chaque gain cliquable, « Tout ramasser » pour reprendre. **Drops v2** : matériau de la zone sur les monstres, pièce d'équipement du set de zone + matière du boss garanties sur les boss, équipement à taux très faible ailleurs, gemmes brutes vendables. **Inventaire** groupé (potions, matériaux par zone, gemmes, pièces). **Équipement sur la fiche** : 2 slots par carte (arme typée + armure) et 2 slots d'équipe, bonus de set +5 pts % (`data/equipment.json`, 150 pièces). Migration v23. Digest inchangé `f72106ff…` 1379/3000. 124 tests, smoke 205 checks (10 nouveaux verts).


## [1.15] — 2026-11-11 — Boucle de jeu v2, lot 3 : départ à 2 cartes et recrutement naturel

**Départ de partie à 2 cartes** : à la première partie, 4 novices sont proposés (un par race — humain, bestial, mystique, divin) ; vous en choisissez un, un second est tiré au hasard parmi les trois restantes. Plus d'équipe complète de départ. **Recrutement naturel** : après une victoire, chaque vaincu (hors boss et nommés) a ~1 % de chance de demander à rejoindre votre collection — taux calibré par zone dans `data/zones.json`, toast de recrue, limite de 3 exemplaires par carte. Migration v22 non destructive (les sauvegardes commencées sautent l'écran de départ). Digest inchangé `f72106ff…` 1379/3000. 122 tests, smoke 195 checks (7 nouveaux verts).


## [1.14] — 2026-11-11 — Boucle de jeu v2, lot 2 : niveaux de donjon 1→25 et bandes de rareté

Chaque marche (donjon × mode) porte désormais un **niveau de donjon 1→25** et une **bande de rareté** affichés dans le sélecteur (Facile C→R, Normal UC→SR, Difficile R→UR, Très difficile SR→L, Enfer UR→M ; boss final en haut de bande, boss intermédiaire un cran sous). Le bestiaire de chaque vague est pioché dans la bande de la marche : la difficulté monte, les créatures montent avec elle. `data/difficulties.json` porte les bandes (`bande`), le validateur vérifie leur cohérence. Digest recalibré et consigné : `f72106ff…` 1379/3000, 0 exception, 1 marathon. 120 tests, smoke 188 checks (5 nouveaux verts).


## [1.13] — 2026-11-11 — Boucle de jeu v2, lot 1 : potions, or et persistance

L’économie de survie entre en jeu (lot 1 de la boucle v2, `docs/design/boucle-v2-spec-plan.md`). L’énergie ⚡ devient de **l’or** (1 ⚡ = 1 or, conversion non destructive en sauvegarde v21). Nouvelle action **🧪 Objet** dans la fenêtre d’action : potions de soin (30/60 % des PV max) et de mana (40/80 %), chaque gorgée **coûte son tour**, utilisables aussi hors combat entre les étages (bouton 🧪 Objets). Point d’achat minimal : le rayon potions de la **Boutique** (50/120/60/140 or, `data/potions.json`). **Plus de régénération entre les combats d’un même run** : PV et mana persistent d’étage en étage, effets temporaires dissous entre combats, régénération complète après le premier boss (étage 5), soins complets entre deux runs distincts. Hook « autel de soin » posé pour l’errance (soin complet + 5 pas de grâce, `errance-topdown.md` §8). Preuve : digest inchangé `aed250f9…` (1274/3000, 0 exception — combats isolés à PV pleins), 118 tests, smoke 183 checks (12 nouveaux verts).


Toutes les versions notables d'AICG : Lignées. Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) ; les numéros suivent le prototype (pas de SemVer). Les entrées reprennent l'historique en jeu (menu ⚙ → Historique) : les versions v1.0 à v1.12 et le baptême rétroactif v0.47.3 datent du 10/11/2026 (journée de la refonte majeure et du grand chantier arbres + sorts) ; les versions antérieures n'ont pas de date archivée.

## [1.12] — 2026-11-10 — La ligne support frappe aussi

RETOUR TERRAIN. Deux manques corrigés d’un même geste. Un : le Garde du Rempart et tous les supports n’avaient que le bouton de soin — désormais la frappe simple (⚔, gratuite) est la première action de TOUTE carte : on désigne l’ennemi, elle frappe. Deux : un sort de dégâts, de contrôle ou de malus lancé depuis la ligne support se résout enfin sur les ennemis selon sa fiche (largeur, puissance, taux, tours) — fini le soin fantâme quand un Embryon tapait avec Instinct Sauvage. La stat principale du lanceur fait les dégâts, l’esquive et l’élément comptent comme pour la ligne d’attaque, et les sorts alliés gardent leur chemin. Les sorts malus ciblent désormais les ennemis dans les fiches résolues. Le digest bouge (documenté) : les supports mixtes frappent.

## [1.11] — 2026-11-10 — Fin des sorts undefined

RETOUR TERRAIN. Les sorts hérités d’une carte évoluée étaient stockés en sauvegarde sous leur forme remappée par le tri (école + cran), sans nom ni coût : la fenêtre d’action et la fiche affichaient des lignes « ✦ undefined », et le sort ne se lançait pas. Désormais chaque entrée se résout en fiche complète depuis le grimoire : nom, coût, puissance, taux, cible et description. Les uniques remappés se résolvent aussi ; les crans vides et les sorts inconnus disparaissent proprement de la liste. Les sauvegardes ne changent pas : la résolution se fait à l’usage, sans perte.

## [1.10] — 2026-11-10 — Le tri des recrues

LES NAISSANCES ET LES SOLOS RENDENT LEUR GESTE AU GRIMOIRE. Les 33 signatures du lot (les 12 naissances raciales, les 5 solos d’entrée, les 16 cartes des quais, de la fête, des routes, des dunes, des berges et du guet) fondent en crans I-II des écoles existantes : la prise de garde protège (le Rempart), le bruissement d’éume frappe (la Lame), le froid du caveau fige (l’Entrave), la lanterne du guet éclaire (la Ferveur). Les trois portes divines (l’Ange, le Démon, l’Éveillé du Seuil) gardent leur geste : les familles divines le dessineront. Les sauvegardes passent en v17 : les sorts hérités d’une recrue se re-mapent sur leurs crans. Le combat ne change pas : le digest reste le même.

## [1.9] — 2026-11-10 — Le tri du Zénith

LE ZÉNITH ARDENT FOND SES 30 SIGNATURES EN 22 CRANS D’ÉCOLE ET 8 UNIQUES. Le renvoi des phénix devient une ligne du Rempart (25/20 % × 2 tours, les ailes couvrent 1 puis 2 alliés), l’Hymne porte la Ferveur à l’équipe entière (boost 20 %, tenue 15 %), et les cartes nommées gardent leur geste : Sentence Solaire, Couronnement (l’Astre Capiteux), Éclipse Montante, Renaissance Pyrique, Immolation Retournée, Cantique Final, Peine Capitale, Prophétie du Plein Jour. Les sauvegardes passent en v16 : le Zénith trié re-mappe ses sorts connus. Le combat ne change pas : le digest reste le même.

## [1.8] — 2026-11-10 — Le tri de la Crypte

LA CRYPTE OUBLIÉE FOND SES 30 SIGNATURES EN 22 CRANS D’ÉCOLE ET 8 UNIQUES. Le hurlement des banshees devient un sort de l’Entrée (la zone au cran III), la morsure putride ouvre le poison du Mauvais Œil, la légion des caveaux rejoint l’Appel (3 renforts) et la Ferveur se remplit (deuil martial, étendard funèbre, serment rallié). Les cartes nommées gardent leur geste : Voie du Tombeau, Abîme Remontant, Hurlement Fatal, Fauchade Universelle (la Mort), Deuil Éternel, Harpon du Naufrage, Épée de l’Aube, Lame du Serment. Les sauvegardes passent en v15 : la Crypte triée re-mappe ses sorts connus. Le combat ne change pas : le digest reste le même.

## [1.7] — 2026-11-10 — Le tri du Bosquet

LE BOSQUET PROFOND FOND SES 21 SIGNATURES EN 16 CRANS D’ÉCOLE ET 5 UNIQUES. La sève rongeuse devient un sort du Mauvais Œil (25/20 % × 2 tours), les soins des dryades greffent l’entrée Onde Consacrée, la Sève Éveillée rejoint l’Appel (2 renforts sylvestres), et les cartes nommées gardent leur geste : Aube Foliaire, Racine-Monde, Nuée de Spores, Première Clarté, Nuit des Sèves. Les sauvegardes passent en v14 : le Bosquet trié re-mappe ses sorts connus. Le combat ne change pas : le digest reste le même.

## [1.6] — 2026-11-10 — Le tri de la Forge

LE GABARIT DES MARÉES S’ÉTEND À LA FORGE CENDRÉE. Les 24 signatures du biome fondent en 19 crans d’école et 5 uniques : la brûlure devient Colonne de Feu (le Mauvais Œil, taux normalisés 25/20/15 %), les invocations deviennent Fournaise Invoquée (l’Appel, la largeur compte les renforts), et les cartes nommées gardent leur geste sur une base d’école : Nuit de Cendres, Fournaise Éternelle, Linceul de Suie, Fournaise de Calcine, Colère de Vulcain. Les sauvegardes passent en v13 : les sorts connus d’un biome trié se re-mappent sur leurs crans. Le combat ne change pas : le digest reste le même.

## [1.5] — 2026-11-10 — Le rôle sort de l’affichage

LE RÔLE ATTAQUE/SUPPORT DISPARAÎT DE LA FICHE ET DES LIBELLÉS. La grille identité de la fiche garde Classe, Élément et Rareté ; le bloc des sorts croisés parle de gestes (panser, frapper), plus de camps. Le champ moteur reste purement interne : il trie les lignes d’équipe, il ne décrit plus la carte. Aucune mécanique ne change, le combat reste exactement le même (digest inchangé).

## [1.4] — 2026-11-10 — Le boost vise son camp

LE BUG DE CIBLAGE DU SORT DE BOOST EST CORRIGÉ. La fenêtre d’action ne décide plus du camp selon le rôle de la carte : elle lit la fiche du sort. Discipline de Ligne (soi) se pose sur son lanceur, sans liste de cibles ; Ferveur Céleste (1 allié) propose vos cartes ; et le moteur applique un vrai bonus d’ATQ pour la prochaine frappe au lieu de frapper l’ennemi. En mode Auto, le chemin historique ne bouge pas : le combat automatique reste exactement le même (indice de force et digest inchangés).

## [1.3] — 2026-11-10 — Les naissances dans la nature

TOUT CE QUI ENTRE AU ROYAUME DES NAISSANCES. (1) DEUX NAISSANCES OFFERTES au départ : l’Épéiste Novice et le Prêtre Novice rejoignent la collection, jouables immédiatement. (2) NAISSANCES SAUVAGES : chaque étage de donjon vaincu offre 2 % de chance qu’une naissance se joigne à vous, toujours bornée par vos déblocages. (3) LA TABLE DES JETONS PASSE EN DONNÉES ET DEVIENT CONFORME à la décision 8 : à chaque palier de donjons bouclés, la commune reste au taux de référence (50 %) et le taux décroî avec la rareté (palier 3 : 50/45/5, palier 5 : 50/40/10) — les paliers précédents favorisaient la peu commune, corrigé. Le moteur gagne les tirages purs : une naissance, une rareté de jeton.

## [1.2] — 2026-11-10 — La pierre d’éveil

L’ÉVEIL TROUVE SA MONNAIE. Une naissance (rang N) ne paie plus ses éclats pour s’ouvrir : son éveil consomme une PIERRE D’ÉVEIL, hors éléments. Les boss des donjons en lâchent rarement, le défi du jour en offre une chaque victoire, et la Forge affiche la réserve. Les autres rangs gardent leurs éclats ; la voie choisie, l’Ascendance et les sorts accumulés ne changent pas.

## [1.1] — 2026-11-10 — Le rang Naissance

LES NAISSANCES QUITTENT LA COMMUNE. Les 12 naissances raciales (les 4 Novices, les 5 Embryons — ex-Bestiaux — et les 3 Enge) passent au rang N, un cran sous la commune : elles n’ont encore rien choisi, on les amène où l’on veut. Le jeton et le défi du jour tirent désormais des naissances, jamais d’autres communes ; les cartes divines (Ange, Démon, Éveillé du Seuil) restent la porte du camp divin jusqu’à l’Esprit Divin. La puissance du rang N est calibrée 10 % sous la commune, et le glossaire s’ouvre sur le nouveau rang.

## [1.0] — 2026-11-10 — La refonte majeure

LE MONOLITHE DEVIENT MODULAIRE. Les donnees vivent desormais dans data/ (cartes, monstres, ecoles, grimoire a crans, arbres de race, zones), le moteur dans src/engine/ en modules purs, et dist.html est regenere par build.mjs. LES ARBRES DE RACE (v17) : crans +10/+20/+30 % en donnees, l’Ange Eveille remplace l’Ange Gardien, communes deleguees (Pousse des Seves, Fidele du Jour). LES SORTS (v2.3) : 8 ecoles, grimoire a crans I-IV, fusion des Marees (30 signatures -> 7 uniques + 23 fondues), fin du verrou de classe. LE MODE RPG : agilite et intelligence, mult sur la stat principale, la zone de 3, l’ordre du tour sur l’agilite, les taux contre les seuils. LES ZONES D’ERRANCE : cadence zone/donjon, recoltes, apprentissage des crans. Sauvegardes migrees de v8 a v12 sans perte.

## [0.47.3] — 2026-11-10 — Combat v2.1

LE CHANTIER DE PRÉSENTATION DU COMBAT, BAPTISÉ RÉTROACTIVEMENT. Rail d'ordre du tour (tout le monde dans l'ordre d'agilité, acteur doré, lueur sur vos cartes, KO grisés), combat AUTO en mode Tactique (démarre seul, bouton Pause / Lancer le tour), actions détaillées au tour du joueur (badge d'école, coût, méta école · ×puissance · zone, texte du sort), fiche complète (grille identité classe/élément/rareté, oppositions, sorts détaillés). Moteur et équilibrage inchangés.

## [0.47.2] — Source d’images au choix

Un bouton 🖼️ dans l’en-tête bascule les illustrations des cartes entre DreamShaper XL (assets.json, par défaut) et WAI-Illustrious v17 (assets-wai.json, campagne comparative), mémorisé entre les visites. Aucun impact sur le moteur.

## [0.47] — Tranche-Monde et Nuit Éternelle

LES SORTS SIGNATURE NE RÉPÈTENT PLUS LE NOM DE LEUR CARTE. Le sort L du Sabre (« Kenji : Sabre Céleste ») devient Tranche-Monde ; le sort L de l’Ombre (« Kira : Nuit Sans Fin ») devient Nuit Éternelle. « Kenji : Zénith Tranchant » reste ; l’Aube garde son exception assumée : Aube Éternelle, le plus fort sort de l’aube porte le nom de sa carte (Léna).

## [0.46] — Le RPG tour par tour

LE CHANTIER PROMIS. Le mode 🧭 Tactique devient un vrai tour de RPG : plus de panneau à remplir en bas de page. Chaque tour, les cartes des deux camps agissent une par une, de la plus forte attaque à la moins forte (la vôtre d’abord à égalité). Quand vient le tour d’une de vos cartes, une fenêtre s’ouvre pour elle : illustration, points de vie, attaque, mana — puis ses choix : ⚔ Attaque, sorts ✦ avec leur coût (atténués si le mana manque), ➕ Souffle Croisé pour les attaquants, ⏸ Attendre pour économiser le mana. Désignez ensuite la cible : ennemie à frapper ou allié à soigner, dans une liste cliquable — et le pion correspondant s’illumine sur le plateau. L’action s’exécute aussitôt, animée, puis la carte suivante joue, et les ennemis agissent de la même façon sous vos yeux. Le ciblage des ennemis, demandé au retour du terrain, est enfin explicite.

## [0.45] — Rien de caché, des pions à voir

SIX RETOURS DU TERRAIN CORRIGÉS. (1) Le code brut à la place de l’emoji disparaît : le bouton 🤖 « Auto ce tour », l’en-tête du panneau Tactique et les récompenses affichent enfin leurs pictogrammes. (2) Le menu ☰ reste joignable EN COMBAT : la navigation s’ouvre par-dessus l’écran, opaque et déroulante. (3) Le panneau Tactique n’est plus jamais coupé : il défile à l’intérieur de sa zone. (4) Les pions de combat grandissent (128 px, boss 162 px) et deviennent plus carrés : l’illustration occupe presque toute la carte, nom et stats en surimpression. (5) L’écran de combat ne coupe PLUS rien : si l’écran est trop petit, le contenu défile à l’intérieur de l’écran. (6) Les sorts spéciaux n’assombrissent plus le plateau : une bande compacte (illustration du lanceur + nom du sort) passe au-dessus sans rien masquer.

## [0.44] — Le combat plein écran

DEUX DEMANDES DE TERRAIN APPLIQUÉES. (1) Le combat tient sur UN SEUL ÉCRAN : en exploration la page ne scrolle plus, ni en bas ni sur les côtés — titre, boutons, plateau, panneau Tactique et journal se partagent la hauteur de l’écran, et les rappels restent compacts. (2) Les cartes s’agrandissent partout où l’image a sa place : collection, familles, équipe et fiche — les futures illustrations s’y liront ; en combat, chaque carte reste un pion lisible et l’image se loge en fond de carte.

## [0.43.1] — Correctifs terrain

QUATRE RETOURS DU TERRAIN APPLIQUÉS. (1) Le plateau applique une TAILLE UNIFORME : chaque carte garde la même largeur dans les deux camps, quel que soit le nombre de voisines — seul le boss garde sa prestance. (2) Le modificateur de run redevient réellement OPTIONNEL : l’accepter est gratuit (butin majoré), entrer sans lui aussi — seul le REMPLACEMENT du tirage coûte 1 éclat brut. Plus aucune obligation d’éclat pour refuser. (3) La collection montre la PORTE de chaque famille : le novice (ou la greffe) qui y entre figure en tête de chaîne. (4) Les anciennes branches SR (Yuki, Onyx, Naïa…) sont ARCHIVÉES : hors des tirages et des arbres, visibles seulement dans la section archives si vous en possédez.

## [0.43] — La grammaire des sorts, le plateau en ligne et l’indice de force

PLUS DE FAUX JUMEAUX, PLUS DE NIVEAUX VIDES. Chaque carte connaît désormais ses sorts par couches : le COMMUN (2✦), le sort DE RACE (3✦), le sort DE CLASSE (4✦) et sa SIGNATURE (5✦). L’Épéiste Novice et le Bestiau des Cieux ne partagent plus que le commun, et le Prêtre Novice a enfin son grimoire complet : des soins gradués, du pansement à la bénédiction. Le panneau Tactique détaille nom, coût et infobulle de chaque sort — y compris pour les soigneurs — et le Souffle Croisé est étiqueté pour ce qu’il est : une action d’équipe, pas un sort. Le plateau passe à une seule ligne par camp : fini la ligne support repoussée à l’arrière. Et la force conseillée des donjons devient un INDICE pondéré (ATQ, PV, rareté, nombre de sorts), auto-calibré sur le boss final réel — un niveau moyen ne veut rien dire : une équipe de SR niveau 5 n’est pas une équipe de communes niveau 5.

## [0.42] — Les modificateurs de run

CHAQUE EXPLORATION A SON TARIF. En entrant dans un donjon, un modificateur est tiré et montré AVANT le combat : 🐗 la Horde (+1 ennemi par vague, butin +20 %), 🕯 le Mana Stérile (régénération −1 pendant le combat, points +25 %), 🛡 la Muraille (ennemis +25 % PV, éclats +50 %), ⚔ la Rage Partagée (ennemis +15 % ATQ, points +40 %). La face rude paie la face compense : les points, les chances d’éclats d’évolution et de régression suivent le modificateur accepté. Le refuser coûte 1 éclat brut et le run se joue sans modificateur ; sans brut, on entre avec le tirage. Le moteur de vague reçoit le modificateur en paramètre OPTIONNEL — sans modificateur, le digest de 3000 combats reste IDENTIQUE (dormance prouvée).

## [0.41] — Les nouvelles lignées (patch 3.3)

LE RACCORDEMENT COMPLET, ZÉRO NOUVELLE CARTE. (1) Le Bestiau des Cieux (n9) ouvre ses trois voies vers le Zénith : la Légion Solaire (Arbalétrier Doré), les Phénix Célestes (Essor de Flammes), le Clergé du Plein Jour (Chapelain du Jour) — des chaînes qui montent jusqu’à SR/UR. (2) Les naissances divines entrent dans les lignées du Seuil : l’Ange (n13) rejoint les Arbitres, le Démon (n14) le Chœur Miroir, l’Éveillé du Seuil (n15) les Tisseuses du Pont ; les maillons de soudure (d3→d4, d9→d10, d15→d16) relient les lignes secondaires du web divin : les trois chaînes courent du C au L (Kairos, Écho, Ananké). (3) La voie de la suie poursuit : f3 évolue vers sa rare (f8). (4) AUDIT DES VIEILLES CARTES FERMÉ : les 5 solos d’origine deviennent des naissances raccourcies vers les chaînes humaines (Garde-Promesse → la garde, Étincelle Vive → la braise, Médecin de Camp → l’aube, Veilleur d’Acier → l’ombre, Pilier Mécanique → le bouclier) ; les jetons continuent de ne donner que les naissances raciales ; il ne reste hors architecture QUE les 7 branches SR (b1-b7), dormantes par design pour les futurs choix de palier.

## [0.40] — Le Mode Tactique

LE JOUEUR PREND LES COMMANDES : à chaque tour, en mode Tactique, chaque carte de la ligne choisit son action — attaque simple, un de ses sorts (soins et invocations sont des sorts comme les autres), le soin croisé des attaquants, ou attendre pour économiser le mana — et sa cible (ennemi pour frapper, allié pour soigner). « Lancer le tour » résout, « Auto ce tour » laisse l’IA jouer un tour. Le moteur ne change PAS : le plan remplace l’IA au point d’injection, le chemin auto reste au digest identique. ET les récompenses suivent le prorata des tours tactiques : tout en Tactique = intégrales, tout en auto = ÷ 2 (pts, éclats, XP).

## [0.39] — Les jalons dans l’architecture

CORRECTIF (retour terrain v0.38) : les jalons (premier donjon terminé, première Difficile) proposaient une carte Rare / Super Rare AU CHOIX parmi… les vieilles cartes de familles (c.family), hors architecture. Désormais les 3 propositions sont toujours des MAILLONS DES VOIES humaines (Paladin, Chevalier, Bretteur, Sorcière des Rivières…), sur les arbres définis. Avec la v0.38, il ne reste plus AUCUN chemin qui donne une carte hors architecture : jetons, défi du jour et jalons ne distribuent que des naissances raciales, des maillons de voie ou des naissances locales de biome.

## [0.38] — Les naissances raciales

CORRECTIF (retour terrain) : les jetons de génération donnaient les vieilles cartes de familles (Étincelle Vive, Rôdeur des Ombres, Servante de l’Ombre…) au lieu des naissances de la nouvelle architecture. Désormais un jeton ne donne QUE la naissance, au hasard — les 4 Novices, les 5 Bestiau, les 3 Enge, Ange / Démon / Éveillé du Seuil ; le jeton humain raffiné entre au maillon d’une voie (UC, 15 % R) ; le jeton d’évolution, au palier indiqué d’une voie raciale ; le défi du jour tire lui aussi une naissance raciale. Les vieilles cartes restent au catalogue (autel, futurs raccourcis). Et l’élément NEUTRE s’affiche enfin : ⚪ sur la carte, « ⚪ Neutre — hors oppositions » sur la fiche, au glossaire et à la collection — les naissances raciales naissent neutres, l’élément arrive avec la voie.

## [0.37] — Le correctif des invocations, les voies des races

CORRECTIF (retour terrain, boss final de la Forge) : les invocations (Golem de Fournaise du Seigneur des Cendres, Familier des Foyers...) faisaient PLANTER le combat — l’animation cherchait leur carte au catalogue et l’exception gelait la partie sans fin (combat bloqué, défaite sans explication). Elles s’affichent désormais : nom du sbire, arrivée visible 🕯, fiche au clic, et le combat se termine toujours. Patch 3.2 : les communes raciales ouvrent leurs VOIES vers les nœuds existants des webs — Bestiau des Eaux (pillage des récifs, berges), des Flammes (suie, fournaise, goblin), du Vivant (mousse, sèves), des Ténèbres (gouffre, deuil marin, devoir brisé), Enge des Brumes (la forme Sirène), des Bois (la forme Dryade), des Caveaux (les trois formes de la mort) ; le Bestiau des Cieux et les naissances divines (Ange, Démon, Éveillé) attendent leurs nœuds du patch 3.3 — trappes visibles, pas de trous cachés.

## [0.36] — Les choix de voie

Le premier choix du joueur arrive : à la première évolution, chaque Novice ouvre ses VOIES — l’épéiste (guerrier, protection, sylvestre), le mage (Eau, Feu, Sylvains, ou la lumière : l’élue rejoint la lignée du prêtre), le prêtre (la foi ou la garde), le voleur (assassinat, quais, fête) ; la Forge et la fiche affichent un bouton par voie et le choix est définitif pour l’exemplaire. Éclats GARANTIS en donjon (retour terrain) : 1 éclat brut par boss d’étage, 2 au boss final, plus la gemme de difficulté ; la fausse ligne « carte bonus du donjon » disparaît. Premier donjon recalibré : bonus de découverte renforcé (−30 % étages 1-5, −20 % 6-9, −55 % au boss final) et XP de run doublée jusqu’au premier bouclage — l’équipe de départ boucle l’Antre des Marées en ~3 runs (simulation : médiane 3, max 5). La collection est réorganisée par RACE (humaine et ses arbres, monstre et ses webs, mystique et ses familles d’accueil, divine) ; les textes obsolètes (éclats, v0.34) sont retirés. La fiche fusionne le Pouvoir dans la liste des sorts et chaque sort affiche ses dégâts concrets au niveau courant.

## [0.35] — La grande réparation

Les donjons ne droppent plus de cartes : le boss final lâche un JETON de génération, 1 par jour et par donjon (rareté selon les donjons bouclés), la première victoire finale d’un donjon offre un jeton bonus de son biome, et les jalons distribuent des jetons (humain raffiné, race, évolution). Les cartes naissent à la Forge. Jetons typés avec inventaire groupé : humain, humain raffiné (PC garantie, 15 % Rare), race, monstre, mystique, divine, évolution, biome. Captures et jauge de boss supprimées ; les monstres ne se capturent plus. La mécanique support/attaque disparaît des interfaces : les cartes font tout. Le mode manuel devient un vrai tour par tour (défaite seulement au tour 60). Courbes de donjons corrigées : la puissance grimpe de façon strictement croissante, boss compris (plus de salle plus dure que la suivante), niveaux conseillés abaissés (étage 10 du premier donjon : équipe de niveau ~17, salle 4 visée dès 10-12). L’Éclat de régression ne tombe plus qu’à partir de Difficile (1,2 %), puis Cauchemar (2,5 %) et Enfer (5 %). Départ à 5 jetons (2 humains, 1 humain raffiné, 2 races). 15 communes raciales : les 4 Novices (qui évoluent vers leur discipline), les 5 Bestiau, les 3 Enge, Ange, Démon et Éveillé du Seuil — le premier choix n’est pas au joueur, il est dans la carte. Cartes et textes agrandis sur téléphone, emplacements d’équipe sur deux lignes. Glossaire, donjons et onboarding mis à jour.

## [0.34] — Le rework des races

La race devient une donnée de fiche : Humaine (la référence), Monstre (+10 % de stats de base), Mystique (+20 %), Divine (+30 %) — la régression comble l’écart en entrant dans la race plus forte. L’élément Divin disparaît : les 18 cartes du Seuil prennent un vrai élément (Arbitres Lumière, Chœur Miroir Eau, Tisseuses du Pont Terre), l’Astre Capiteux devient divine, et le bonus des divines passe sur la race. Le défi du jour débloque une commune de n’importe quelle race (50 % humaine, 30 % monstre, 15 % mystique, 5 % divine) plus un éclat brut de son élément. Départ : 3 jetons de génération (l’humain garanti, les 4 races au tirage, une race non humaine au tirage — tous communs). L’Éclat de régression apparaît : il tombe dans tous les donjons (taux selon la difficulté) et ouvrira la régression — nouvelle carte au palier R, 100 % des sorts, 10 % des stats. Le modèle d’évolutions typées (standard, partage, convergence, régression, chute, malédiction, événement, secrète) et le verrou en fiche sont posés. Migration des sauvegardes : les gemmes de l’élément Divin deviennent des gemmes de Lumière.

## [0.33.2] — Deuxième retour terrain

Jetons : aléa propre à la page (plus de doublon identique après rechargement) et révélation face cachée retournée d’un appui (jeton, autel, évolution, halo selon la rareté). Départ à 5 jetons pour une première équipe complète. Bonus de découverte : les premiers étages du premier donjon sont affaiblis en Facile tant que l’étage 3 n’a jamais été vaincu. Après une défaite, relance immédiate de l’exploration. Le combat se lance tout seul dès l’entrée du donjon (sauf en mode manuel). Vitesse ×32 réellement instantanée (plateau seul), ×16 garde un léger rythme. Fiche : un sort de soin indique son soin (plus de « puissance ×1,5 » trompeur), un attaquant indique sa frappe en % d’ATQ, le Pouvoir est daté et expliqué, et l’appui court sur une carte déjà en équipe ouvre sa fiche.

## [0.33.1] — Retours terrain

Fiche lisible : stats réelles par niveau affichées, pouvoir documenté sur chaque carte, effets actifs (avec source) au clic en combat, étage verrouillé, vitesses ×16/×32 réelles (animations coupées), cartes plus grandes. Acquisition sans boutique : les boosters disparaissent — donjons (jauge de boss, captures), jetons, autel, jalons, défi divin. Plus de nourrir ni de sacrifice : les niveaux viennent de l’XP de donjon, les doublons passent par l’autel. Éclats bruts aussi aux étages intermédiaires.

## [0.33] — Méta de l’Ascension

Niveaux 1-20 par exemplaire individuel (niveau, Ascendance et nom propres), évolution dès le niveau 10 avec des éclats (jamais d’or), sorts cumulés à l’évolution, Ascendance +0,5 % par niveau d’attente, autel 5-pour-1, jetons de fin de donjon, boosters reworkés sans Légendaire au prix progressif quotidien ×1,5, XP de run avec fatigue quotidienne par carte.

## [0.32] — retours de terrain

La sauvegarde survit aux pages intégrées (stockage de secours en mémoire) et s’exporte en code depuis l’accueil. Le bouclier passif des Guerriers cesse de se doubler ; les vagues d’un étage sont fixes pour la journée ; le booster du défi passe à des slots déterministes (Légendaire : 5 % par booster) ; les monstres et cartes divines évoluent à la Forge le long de leur ligne de famille ; vitesses ×0,5 à ×32, lots ×20/×50, récapitulatif de fin de donjon, filtre par rareté, statuts visibles en combat et fiches détaillées.

## [0.31] — défi du jour et familles divines

Chaque jour, un défi divin : cinq cartes hors opposition tirées des trois familles divines — Arbitres du Seuil (contrôle du temps), Chœur Miroir (copie et renvoi de sorts), Tisseuses du Pont (liens chaînés). La victoire offre un booster du défi, seule source de ces cartes. Une par famille en équipe, trois maximum, +10 % dégâts et soins dès deux.

## [0.30] — tous les donjons en familles

Le Bosquet, la Crypte et le Zénith se rangent en familles : Bêtes du Fougeron, Gens des Sèves, Spectres des Caveaux, Naufragés, Chevalerie Défunte, Légion Solaire, Phénix Célestes, Clergé du Plein Jour. 45 nouvelles cartes, dont les Mythiques La Mort et Apolline ; le Phénix renaît de ses cendres.

## [0.29] — Forge en familles, glossaire

La Forge Cendrée se range en 3 familles (Cendrels, Enfants de la Braise, Gobelin des Fumées) et cette page naît pour documenter tout le jeu. Les monstres croisés en donjon comptent désormais comme découverts.

## [0.28] — six classes

Occultiste 🔮 et Invocateur 🕯️ rejoignent les 4 classes d’origine : malédictions (−ATQ temporaire, les boss résistent) et invocations de sbires temporaires. Une grande partie des monstres des Marées change de classe.

## [0.27] — illustrations

Un chargeur d’assets habille les cartes au premier lancement, le jeu reste léger à charger.

## [0.26] — familles et contrôle encadré

Les Marées s’affichent en grandes familles à la collection. Le contrôle passe sous embargo : un sort de contrôle (étourdissement, poison, malédiction…) ne s’applique que si son sort est lancé, côté joueur comme côté ennemis.

## [0.25] — statuts et effets

Le moteur apprend 10 effets : poison, renvoi, invocations, ranimation, liens, cri de guerre…

## [0.24] — équipes libres

Les postes attaque/support fixes deviennent 5 emplacements libres, et les niveaux se gagnent par carte (plus par exemplaire), conservés à l’évolution.

