# Revue design — 4 grilles (assets, feel, UI/UX, level design)

> Revue du 12/11 par le couloir design, à travers quatre référentiels transverses (création d'assets, game feel, UI/UX, level design). Constate ce qui est déjà conforme, liste les recommandations par priorité. Aucune décision n'est ACTÉE ici : les items à trancher partent en questions ouvertes ; les validations de maquettes et specs existantes sont inchangées.

## Constats conformes (rien à changer)

- **prefers-reduced-motion** respecté partout (vidéos gelées, décor errance figé, hero frame fixe) — rare et précieux, à préserver dans chaque nouvel écran.
- **HUD par événements** : le combat v2 est déjà piloté par les événements moteur (`hit`, `buff`, KO → `floatText`/`shake`), pas par polling.
- **Routes hash** (`#accueil`…) : le bouton retour Android fonctionne naturellement ; page par défaut Accueil actée.
- **Boutons ≥ 32 px, mobile-first, budget dist.html** : actés et tenus.
- **Pacing errance en dents de scie** : pas de grâce (rest après combat) et autel de soin (rest avant le climax donjon) = structure conforme au référentiel.
- **Pipeline assets** : familles générées depuis style board approuvé, normalisation déterministe (crop signatures), validation image par image à l'échelle native.

## Recommandations par priorité

### P1 — à faire (blocage réel ou risque juridique)

1. **Manifeste d'assets + provenance/licences** (référentiel assets) : registre par asset (id, source = WAI v17/LoRA Civitai id + version, licence du LoRA, statut QA, date). Motif : licences Civitai parfois non-commerciales ; le Steam AI Content Survey (si distribution) se répond depuis ce registre. Emplacement proposé : `docs/images/manifeste-assets.md` ou `tools/assets-manifest.json`, alimenté par le rapport de session 3.2.
2. **Retour ville en errance** (référentiel level design = anti soft-lock) : confirme la priorité de la spec B3 — sans menu du haut, une zone sans retour ville est un one-way drop qui piège le joueur.
3. **Système de feedback à 3 tiers proportionnels** (référentiel feel) : router les événements moteur existants vers un unique `feedback(tier, pos)` :
   - small (hover, or, jarre) : tick SFX ;
   - medium (coup, soin, achat) : flash léger + shake ~0.3 + pop overshoot sur `floatText` ;
   - large (crit, KO, boss, drop UR/compagnon) : flash + shake ~0.7 + hit-stop 100-150 ms + zoom.
   Vérification : le hit-stop ne bloque jamais l'entrée ; retour exact au repos à la fin de chaque effet.

### P2 — à intégrer au fil des lots UI

4. **Safe-area web mobile** (référentiel UI/UX) : `env(safe-area-inset-*)` sur le HUD d'errance et le menu latéral (PWA installée, encoche).
5. **Signal jamais couleur-seul** : bandes de rareté du sélecteur de marche = couleur + losange ◆ (déjà dans la DA or) ; audit contraste 4.5:1, cas à risque = or sur fond place ensoleillée.
6. **Réglage « réduire les flashs »** dans le jeu (en plus du prefers-reduced-motion OS) ; transitions combat errance ≤ 3 flashs/s.
7. **Sweep de résolutions** dans le protocole IHM : captures à 1280×720, ultrawide, 1080×2340 (automatisable en smoke).

### P3 — structure et vérifications

8. **Table de beats par zone d'errance** (level design) : intensité 0-1 par zone/étage, taux de rencontre piloté par la même table, rest avant chaque porte de donjon ; empêche les zones plates.
9. **Test headless de reachabilité errance** : depuis le spawn de chaque zone, A* (fonction existante) doit atteindre porte de donjon, autel, jarres, retour ville (B3). L'équivalent économie : aucun déblocage (spec gating) n'exige une ressource obtenable uniquement derrière lui (goal_reachable sur le graphe d'acquisition : or, jetons, pierre d'éveil, déblocages).
10. **Enseigner avant de tester** (level design) : chaque école de sorts née d'un biome doit se rencontrer d'abord à échec bon marché (étages 1-2, Facile) avant d'être exigée dans les difficultés hautes.
11. **Sprite de marche du héros** (référentiel assets) : l'i2v WAN est rejeté (dérive cinématique). Alternatives dans l'ordre : (a) famille de frames générées depuis l'art héros approuvé avec IPAdapter (4 directions × 4-6 frames, ancre bas-centre partagée, identité verrouillée), (b) MVP sprite statique + bob CSS (le moteur anime par code), la vidéo WAN restant réservée aux ambiances.

## Questions ouvertes (à trancher par Marc-Olivier)

- [ ] P1.3 : le hit-stop sur crit (100-150 ms) est-il souhaité dans un jeu de cartes au tour par tour, ou réservé aux transitions de combat errance ?
- [ ] P3.11 : quelle route pour le sprite héros — famille de frames IPAdapter, ou MVP statique + bob ?
- [ ] P1.1 : format du manifeste d'assets (markdown simple vs JSON consommable par le smoke) ?
