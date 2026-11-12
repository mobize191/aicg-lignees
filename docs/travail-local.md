# Travail local — prompts pour l'agent

Trois prompts prêts à copier dans un agent local (Claude Code, Cursor, Vibe avec le MCP ComfyUI...). Le premier corrige les bugs du retour terrain, le deuxième valide par captures d'écran (après le premier), le troisième lance la campagne d'illustrations et de vidéos ComfyUI (DreamShaper XL).

---

## PROMPT A — Corrections des bugs v0.46 (à copier)

```text
Tu travailles sur AICG : Lignées, un jeu de cartes solo 100% navigateur. Repo GitHub : mobize191/aicg-lignees (clone-le). Le jeu embarqué est dist.html (bundle HTML+CSS+JS autonome, généré par `node build.mjs` depuis `src/` + `data/` : ne jamais éditer dist à la main). Harnas : combat-digest.mjs (digest de dormance du moteur) et smoke-ui.mjs (171 checks UI simulés). Baseline actuelle : digest 833a6d2c60131fbd21b021c701daa90f308275961e03c479500c032eb5b98a24, 518 victoires/3000, 0 exception, 1 marathon, smoke 171 PASS. Le mode Tactique v0.46 : moteur pas-à-pas (beginRound/peekRound/stepRound), fenêtre d'action .act-modal en bas de l'écran pour chaque carte à son tour, ciblage explicite (liste cliquable + pion surligné .targeted sur le plateau).

Un retour terrain sur TÉLÉPHONE rapporte 4 problèmes. Le harnas ne les voit pas : ce sont des bugs d'affichage/tactile réels, à reproduire dans un vrai Chromium en émulation mobile AVANT de corriger.

BUGS À CORRIGER :
1. Fenêtre d'action : trop petite sur téléphone, boutons trop petits, et l'illustration de la carte ne se voit pas dedans (alors que la fiche de carte .modal-hero la montre correctement).
2. AUCUN bouton de la fenêtre d'action ne répond au tap (⚔ Attaque, sorts ✦, ⏸ Attendre) : le joueur ne peut pas jouer en mode Tactique.
3. Le ciblage ne fonctionne pas (ni la liste des cibles, ni le tap sur les pions du plateau).
4. Fiche de carte (openUnitModal) : le bouton ✕ de fermeture ne marche plus après avoir fait défiler le contenu ; seul le tap à l'extérieur de la modale ferme.

MÉTHODE IMPOSÉE :
a) Reproduire d'abord : Playwright, contexte iPhone (viewport 390×844, isMobile: true, hasTouch: true), serve le repo (python3 -m http.server), entre dans un donjon, bascule en Mode Tactique, lance le tour. Utilise page.tap() (événement tactile réel), pas page.click().
b) Pour chaque bug, diagnostique AVANT de corriger. Ordre des vérifications :
   - élément couvrant : document.elementFromPoint(x, y) au centre du bouton : s'il ne renvoie pas le bouton ni un de ses descendants, quelque chose le couvre (pointer-events, z-index, overlay .special-overlay, nav, header sticky) ;
   - écouteur manquant : getEventListeners ou un simple el.dispatchEvent(click) programmatique : si le dispatch programmatique marche mais pas le tap réel → overlay/interception ;
   - zone de tap trop petite ou décalée : getBoundingClientRect du bouton (< 32 px de haut = trop petit sur mobile) ;
   - pour le bug 4 : le bouton ✕ est probablement en position:absolute DANS le contenu scrollable de la modale : après défilement il sort du stacking context ou passe SOUS le header sticky. Fix attendu : position:fixed + z-index au-dessus de tout, OU re-render du bouton hors de la zone scrollable, et garde le tap-extérieur comme mécanisme de secours ;
   - pour le bug 2/3 : vérifie si la fenêtre .act-modal ou son parent a un pointer-events:none qui se propage, ou si un reste d'état (tacArmed, .special-overlay, overlay de nav) capte les taps ; vérifie aussi que les handlers sont bien posés au moment de l'ouverture de la fenêtre (pas avant la création du DOM).
c) Contraintes de validation : le MOTEUR ne doit pas bouger → après tes correctifs, node combat-digest.mjs dist.html 3000 DOIT redonner le digest ci-dessus à l'identique (sinon tu as touché le moteur : revert et recommence). node smoke-ui.mjs DOIT rester 171 PASS (tu peux adapter un check si un sélecteur que tu renomme est testé, mais le total doit rester ≥ 171). node --check du bundle extrait : aucune erreur.
d) Fixes UI demandés (en plus des bugs) : fenêtre d'action plus haute en mobile (max-height supérieure en dvh), boutons ≥ 44 px de haut avec padding confortable, illustration de la carte en tête de la fenêtre (même mécanique que .modal-hero de la fiche : vignette de l'art avec repli glyphe si pas d'image).
e) Livraison : commit sur main avec message « v0.46.1 : correctifs terrain (fenêtre d'action, ciblage, fiche) » incluant dist.html et smoke-ui.mjs si adapté. Puis vérifie que le workflow GitHub Pages déploie ( Actions, le run doit être vert ; le site https://mobize191.github.io/aicg-lignees/ doit servir le nouveau dist). Termine par un rapport : cause racine de chaque bug, correctif appliqué, résultat du digest et du smoke.

PROTOCOLE POUR TOUTE FUTURE MISE À JOUR (réutilise-le à chaque fois) :
1. Reproduire le problème sur Chromium émulation mobile avant tout.
2. Édits ciblés dans dist.html : vérifier chaque ancre par grep -cF (compte == 1) avant tout remplacement ; le fichier mélange vraies apostrophes ’ et \u2019 littéraux, cat -A l'ancre si le compte échoue.
3. node --check sur le bundle + digest 3000 (identique si moteur intact, sinon documenter la nouvelle baseline et pourquoi) + smoke-ui.mjs.
4. Push sur main, vérifier le run Pages vert.
5. Mettre à jour le README (section baseline) si le digest change.
```

---

## PROMPT B — Validation IHM par captures d'écran (à copier, après le PROMPT A)

```text
Tu es un agent de validation UI pour AICG : Lignées, jeu de cartes solo 100% navigateur, servi sur http://localhost:8080/dist.html (clone le repo mobize191/aicg-lignees puis python3 -m http.server 8080). SPA à hash-routing : #accueil, #collection, #equipe, #donjons, #forge, #glossaire, #combat. Ta mission : vérifier le bon fonctionnement réel (taps tactiles, pas clicks programmatiques), l'alignement, que rien n'est coupé, et produire un rapport avec captures d'écran. Tu ne modifies AUCUN fichier du jeu.

RÈGLES GÉNÉRALES :
1. Deux viewports systématiques : desktop 1440×900 et mobile 390×844 EN ÉMULATION TACTILE (isMobile + hasTouch, page.tap partout).
2. À chaque page : capture plein écran + vérifie (a) zéro erreur console (page.on('console') et page.on('pageerror')), (b) pas de scroll horizontal, (c) aucun texte tronqué, (d) boutons interactifs ≥ 32 px (≥ 44 px dans la fenêtre d'action).
3. Les illustrations (arts de cartes + fonds de donjons) se chargent via assets-v3.json (manifeste par défaut V3.0 depuis v1.28, + assets-v3.1.json en doublon commutable via le bouton 🖼️ depuis v1.33) : vérifie qu'au moins une .art-img s'affiche en collection et qu'un combat a un fond. Sinon note « assets non chargés » sans échouer.
4. localStorage.clear() entre les scénarios qui posent une équipe.

SCÉNARIOS (dans l'ordre, capture à chaque étape dans les deux viewports) :
S1 — Premier lancement : accueil, bandeau + nav entiers sans scroll.
S2 — Forge : générer une carte (jetons de départ), révélation, badge « nouvelle » en collection.
S3 — Collection : sections par race, filtres en popup, aucune carte qui déborde.
S4 — Équipe : poser 5 cartes, la 4e pose du même exemplaire refusée (limite 3), puissance affichée, fiche au clic.
S5 — Donjons + modificateur : la modale propose Accepter / Entrer sans modificateur (gratuit) / Relancer (1 éclat brut).
S6 — Combat AUTO : plateau entier visible, journal défile, pastilles ℹ️/🎰/🌱 cliquables, bandeau de sort spécial non couvrant, menu ☰ en overlay au-dessus du jeu.
S7 — Combat TACTIQUE v0.46 (LE test critique, ~15 captures) : basculer en Mode Tactique, lancer le tour, et pour CHAQUE carte du joueur : (1) capture de la fenêtre d'action AVANT tap ; (2) tap sur ⚔ Attaque → capture de la liste de cibles ; (3) tap sur une cible de la liste ET vérifie que le pion correspondant est surligné .targeted sur le plateau (capture) ; (4) vérifie le tap direct sur un pion du plateau ; (5) teste un sort ✦ (coût + infobulle, sort grisé .off si mana insuffisant) ; (6) teste ⏸ Attendre. Vérifie que l'illustration de la carte est VISIBLE en tête de la fenêtre. Enchaîne un tour complet, capture le tour ennemi, vérifie l'absence de tour fantôme après changement d'onglet (page bringToFront + wait).
S8 — Fiches : ouvrir la fiche d'un pion en combat, FAIRE DÉFILER le contenu jusqu'en bas, puis taper le bouton ✕ : la fiche DOIT se fermer (capture avant/après). Répéter en haut du contenu.
S9 — Fin de combat : modale de récompenses, retour donjon, étage suivant proposé.
S10 — Glossaire : section « Les symboles de l'écran » documentée.

RAPPORT FINAL : docs/historique/rapport-validation.md avec, par scénario, statut OK/KO, captures nommées (S7-tactique-fenetre-mobile.png...), liste EXHAUSTIVE des erreurs console avec contexte, toute anomalie visuelle (coupé, chevauchement, mal aligné, tap sans effet) avec capture, verdict global, et les 3 corrections les plus urgentes.

HARNAS EN PLUS (rapide) : node combat-digest.mjs dist.html 3000 (attendu : digest 833a6d2c60131fbd21b021c701daa90f308275961e03c479500c032eb5b98a24, 518 victoires, 0 exception) et node smoke-ui.mjs (attendu : TOUT PASSE, ≥ 171 checks). Si le PROMPT A a été appliqué et que le digest/smoke diffèrent de ces valeurs, utilise les valeurs du README du repo à jour.
```

---

## PROMPT C — Campagne d'illustrations et vidéos ComfyUI (à copier)

```text
Tu travailles sur AICG : Lignées (repo GitHub mobize191/aicg-lignees, clone-le) et tu disposes de ComfyUI sur ce PC avec une GPU. Ta mission : exécuter le plan de campagne d'illustrations complet docs/images/plan-comfyui-images-videos.md du repo, tâche par tâche, dans l'ordre, en cochant chaque étape. Tous les scripts sont dans tools/ (déjà prêts et testés), les prompts de la série 1 dans tools/serie1-prompts.json.

MODÈLE : DreamShaper XL (checkpoint dans ComfyUI/models/checkpoints, passe son nom exact par la variable COMFY_MODEL). Prompts en LANGAGE NATUREL (phrases descriptives), sampler dpmpp_2m_sde + karras, 28 steps, CFG 5-7, génération 832×1216 portrait (fonds 1216×832). Chaque prompt positif se termine par la phrase de style : « Painted in a painterly, semi-realistic fantasy card game illustration style, detailed shading, intricate background, epic fantasy trading card game artwork, rim lighting. » Si tu préfères piloter par le MCP ComfyUI connecté, fais-le pour les réglages image par image ; les batches passent par node tools/comfy-batch.mjs (API http://127.0.0.1:8188).

RÈGLES DE QUALITÉ (feuille de conventions : docs/images/images-conventions.md) :
- Palettes par univers : Marées bleu profond/turquoise/corail, Forge braise/suie/métal rougi, Bosquet vert mousse/spores dorées, Crypte gris-vert/bougies/brume, Zénith or/lumière chaude/ivoire, Divin ivoire/sabliers/miroirs/fils d'or.
- Tier bas = calme (C/UC poses sobres, pas d'effet), L/M pleine action et aura ; zéro texte dans l'image ; silhouette lisible en vignette 200×280.
- Cartes NOMMÉES (Kenji, Méliane, Apolline...) : générer la rareté la plus haute en RÉFÉRENCE, faire valider, verrouiller le seed dans seeds.csv, puis décliner. JAMAIS d'auto-retry en boucle : corriger le prompt.
- Chaque image retenue va dans seeds.csv (fichier, seed, prompt final).

ORDRE (portes de validation obligatoires) :
1. Étape test : 6 images, une par univers (node tools/comfy-batch.mjs batch-test.json), planche de contrôle (python3 tools/contact-sheet.py out planche-test.png). STOP tant que le rendu painterly n'est pas validé : ajuster CFG/renforts si un rendu part en anime plat.
2. Série 1 : les 29 nommées de référence (tools/serie1-prompts.json) dans references/ avec registre des seeds. Elles ne sont PAS intégrées au manifeste (les cartes v3 n'existent pas encore).
3. Les 5 fonds de donjons → intégration (python3 tools/make-assets.py) → push.
4. Les 135 monstres par univers (batch-<univers>.json produits par tools/build-prompts.mjs) → planche par univers → intégration → push.
5. Naissances (15), familiales et solos : les nommées d'abord (référence la plus haute), puis les autres → intégration → push.
6. Vidéos de sorts signature (WAN 2.2 5B, 20 frames, 25 fps, boucle fermée ffmpeg, WebM) : après validation de la série d'images, stockées dans site-assets/fx/ (publiées en fx/ par la CI Pages), JAMAIS dans assets-v3.json ni en base64.

INTOUCHABLE : dist.html et le moteur. Après chaque intégration : git status dist.html doit être PROPRE, le digest (node combat-digest.mjs dist.html 3000 = 833a6d2c..., 518 victoires, 0 exception) et le smoke (node smoke-ui.mjs, 171 PASS) restent identiques. Budgets : ≤ 30 Ko par art, ≤ 110 Ko par fond, manifeste cible ≤ 8 Mo, ASCII pur.

À chaque fin de lot : planche de contrôle + rapport (retenues/refusées et pourquoi, seeds, poids) et faire valider par Marc-Olivier AVANT tout push. Termine chaque session par l'état d'avancement (tâches cochées, prochaines).
```

---

## Note

Ces trois prompts sont aussi disponibles dans le repo (docs/travail-local.md). Le modèle d'illustration est DreamShaper XL (décision du 09/11, il remplace WAI-Illustrious v17) ; les briefs et la feuille de conventions sont dans docs/images/images-conventions.md, le plan de campagne complet dans docs/images/plan-comfyui-images-videos.md.