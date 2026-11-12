# Prompt de lancement — refonte visuelle de l'errance : appliquer la maquette A+ et le guide au jeu (zone témoin Marées, puis les 5 zones)

> À coller au couloir 1. **ACTÉ (Marc-Olivier, 12/11, 4e tour)** : la refonte visuelle de l'errance est lancée AVANT la session de tranchage, zone témoin Marées d'abord puis généralisation aux 5 zones. Références (dans le repo, verrouillées) : la maquette `docs/design/maquettes/errance-demo-jouable.html` (version A+, **plancher de qualité**) et le guide `docs/design/errance-topdown.md` (§1-§12, en particulier la checklist d'intégration §11). Règles du repo : une tâche = un commit français ; `data/*.json` source de vérité ; `dist.html` jamais édité à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant chaque édition.

## 0. État du code vérifié par le couloir pilotage (12/11, main `df1d9d1`)

**Déjà conforme au guide** (ne pas réécrire, préserver) :
- `src/errance.js` (284 lignes, logique pure testable) : `genZoneMap` (carte `Uint8Array` déterministe, seed en `data/zones.json`), `astar` 8-dir + `smoothPath` (string pulling), `createErranceState`/`setTarget`/`stepErrance` : pilotage inertiel §5 (vecteur vitesse, freinage, test « waypoint dépassé », collision par axe, `dt` borné), rencontres au pas §7 (grâce incluse), `interactAutel`/`interactJarre`, garde-fous anti-blocage IA lot 4 (`goal`/`stuckTime`/`repaths`, constantes `ERRANCE_GUARDS` en data).
- `src/ui.js` `renderErrance` (~2560) : pré-rendu §3 (canvas offscreen + 1 `drawImage`/frame + `repaintTile` à la casse de jarre), caméra §6 (lerp `min(1,k*dt)`, look-ahead 0,12 s, zoom 1,05→1,7), DPR ≤ 2 §9, entrées §10 (mémo tuile cible, `pointerup` sur `window`), héros sprite sheet WAN (`E.ERRANCE_HERO`, replis poster/procédural, `prefers-reduced-motion` respecté).
- Sauvegarde `store.errance` : `{ zone, x, y, grace, steps, looted, broken }` (positions en tuiles), jarres persistées par id `jarre-x-y`.
- Smoke : B13 (conformité pilotage inertiel) et B14 (5 zones en data, héros, chaîne de déblocage).

**Manquant (l'objet du chantier)** :
1. **La peinture** : `paintTile` remplit des tuiles plates monochromes (palette `cols` : prairie `#5d8a4a`, chemin `#b9a06a`… + 2 rectangles statiques pour les herbes) ; donjon = rectangle plat, autel = carré blanc, jarres = disques. RIEN de la peinture organique de la maquette (§3 du guide : taches organiques, touffes/fleurs/cailloux, chemin de terre texturé, étang complet, arbres en couches, rochers moussus, ombres portées).
2. **La couche d'ambiance §9bis** : absente en totalité (cycle jour/nuit, papillons/lucioles, traces de pas, lames animées réactives + rafales, écume, bordures de fleurs, graines de pissenlit).
3. **La qualité du layout** : `genZoneMap` produit un layout générique (ceinture eau/arbres, chemins en croix, étang 4×3, donjon 2×2) au lieu du layout soigné de la maquette (chemin sinueux par waypoints, étang à l'échelle avec nénuphars, huttes, rochers épars).
4. **Feedback d'action** : l'arc de frappe doré, les éclats de jarre, les étincelles de récolte de la maquette (§8) n'existent pas en jeu.

## 1. Plan en lots (chaque lot : build + `node --test` + smoke + digests INCHANGÉS `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000)

**Lot 1 — Peinture style A+ sur la zone témoin (layout actuel conservé)**
- Transposer les passes de peinture de la maquette §2-§3 dans un module dédié (proposition : `src/errance-paint.js`, pur + testable pour tout ce qui n'est pas canvas) : fond dégradé + taches organiques (ordres d'appel fixes), micro-détails (touffes, fleurs à tige, cailloux) sur prairie, chemin de terre (base large, cœur clair, ornières, cailloux), étang complet (rive, dégradé radial, profondeur, reflets statiques, nénuphars, roseaux), socles de patchs + bordures de fleurs (lecture visuelle des zones à rencontres), arbres en couches avec ombre portée, rochers moussus, donjon bâtiment peint (toit, briques, mousse, porte lumineuse), autel avec halo.
- RNG décor **déterministe par seed de zone** (déjà le cas pour la carte : même discipline, ordre d'appel fixe sans branche d'état — guide §2).
- Palette et paramètres en data (`data/zones.json` : extension du schéma `errance`, défauts pour les zones non paramétrées).
- `repaintTile` (casse de jarre) doit continuer de fonctionner ; les objets cassables restent dessinés hors du pré-rendu (§3 du guide).
- **Ne change NI la grille `terr`, NI le gameplay, NI les saves** : aucune migration ce lot.

**Lot 2 — Couche d'ambiance §9bis (zone témoin)**
- Cycle jour/nuit (`DAY_LEN` en data, ~100 s), overlays plein écran semi-transparents (jamais opaques : lisibilité des tuiles), ombre du héros étirée, halo nocturne, phase dans le HUD (throttle : écrire seulement si le libellé change).
- Faune symétrique jour/nuit : papillons le jour, lucioles la nuit ; graines de pissenlit ; lames de hautes herbes animées (regroupées par couleur en 2 `stroke()`, culling viewport, rafale dépendante de la position, écart au passage du héros) ; traces de pas sur le chemin ; écume animée de l'étang ; ombres de nuages dérivantes ; feuilles au vent ; fumée de cheminée si maisons.
- `prefers-reduced-motion` : animations décoratives gelées (frame fixe), comme le héros.
- Budget perf du guide §9/§9bis : zéro `ctx.filter`, zéro `shadowBlur`, DPR ≤ 2, culling, HUD throttlé, viser 60 fps desktop / 30+ fps mobile.

**Lot 3 — Layout v2 de la zone témoin + sûreté des sauvegardes**
- Layout data-driven façon maquette : chemin sinueux (waypoints), étang à l'échelle, 2 huttes décoratives (dialogues), coffres, rochers épars — paramètres en `data/zones.json` (`errance.layout`), `genZoneMap` les consomme avec repli sur le générateur actuel.
- **Point de retour ville (ACTÉ 11/11 nuit, point 7)** : tuile de retour dans chaque zone (porte de la ville), interaction → retour aux Terres Sauvages.
- Feedback d'action §8 : arc de frappe doré, éclats de jarre, étincelles de récolte.
- **Sûreté des saves** : le layout peut bouger → au chargement, si la position persistée du héros est solide ou orpheline, la **secourir** (tuile praticable la plus proche du spawn) ; les ids `jarre-x-y` cassés qui n'existent plus sont ignorés proprement ; migration non destructive si le schéma bouge (version +1). Tests : sauvetage de position, idempotence, sauvegarde pré-layout v2 relue sans perte.
- Note de mesure : la surface de patchs/herbe peut varier → fréquence de rencontres par distance légèrement différente ; l'errance n'entre pas dans le digest, aucune maths de combat touchée.

**Lot 4 — Généralisation aux 5 zones + preuves finales**
- Palettes par nature de zone (Marées, Forge, Bosquet, Crypte, Zénith) en data (proposition : Forge braises/fumées, Bosquet verts profonds, Crypte froide, Zénith doré clair) + paramètres d'ambiance par zone (ex. `DAY_LEN` ajustable, guide §11.8).
- Smoke : B13/B14 maintenues vertes + nouvelle section (ambiance initialisée par zone, phase HUD, lames/papillons/lucioles construits, culling actif).
- Protocole IHM : scénario dédié (proposition S24) avec **captures comparatives côte à côte maquette vs jeu**, viewports 1440×900 ET 390×844, 0 erreur console.

## 2. Interdits et limites

- **Hors périmètre (session du 12/11)** : architecture donjons × errance (« 25 donjons », profondeurs, grandes zones), élément des cartes, niveaux 1→100, gating des acquisitions, nombre d'équipes. Le présent chantier ne préjuge d'aucun tranchage : tout ce qui est codé ici (modules de peinture/ambiance, layout par zone en data) doit rester **réutilisable quelle que soit l'architecture tranchée**.
- Ne pas toucher : moteur de combat, maths, équilibrage, économie, contenu ; le câblage rencontres/grâce/autel/jarres/porte de donjon et les garde-fous anti-blocage IA restent intacts ; `ENC_RATE` par zone inchangé.
- Héros : garder le sprite sheet WAN (livré et validé) ; l'habiller (ombre portée, arc de frappe) sans le remplacer.
- Si un lot ne peut pas tenir la contrainte digests inchangés : STOP, consigner dans `docs/arbitrages.md` avant d'aller plus loin.
