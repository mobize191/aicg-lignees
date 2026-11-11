# Reste code — spec et plan (7 lots)

> Statut : **ACTÉ, en exécution** (11/11/2026). Ce document consolide tout le code restant qui ne dépend d'aucun tranchage de Marc-Olivier. Prompt de lancement : `docs/prompt-reste-code.md` (absorbe `docs/prompt-correctifs-terrain.md` et `docs/prompt-lignes-avant-arriere.md`, conservés pour historique). Renvois roadmap : points 1, 3, 4, 7 et 9. Décisions de fond : `docs/arbitrages.md` (règles de rang ACTÉES du 10/11 soir, Option A, CROSS retiré).

## Hors périmètre (ne pas coder sans Marc-Olivier)

- **Contenu v3 restant** (roadmap point 6) : Sirènes des Récifs, gobelins régionaux, Clergé du Plein Jour, familles compagnons (7 UR + 7 L), familles divines côté joueur, lignées d'accueil des Enge.
- **Calibrage digest** (roadmap point 8) : tranchage unique avec Marc-Olivier, après la re-mesure post-lot 2. Le lot 2 MESURE, il ne calibre pas.
- **Redesign de l'IA de combat** (roadmap point 10) : en dernier, après le calibrage.
- **Les 4 PROPOSÉ en attente** : `JETON_OR` (C 100 → UR 5 000), paliers du marchand (UC 600 / R 1 800 / SR 4 000), greffe des solos archivés à des familles, icônes d'équipement (une icône par type/niveau).

## Règles de chantier (rappel AGENT.md)

- Une tâche = un commit français ; `data/*.json` source de vérité ; `dist.html` régénéré par `node build.mjs`, jamais édité à la main ; zéro dépendance npm.
- **Re-fetch systématique avant chaque édition** : d'autres couloirs poussent aussi sur `main`.
- Toute décision vit dans `docs/arbitrages.md` avec date et statut (ACTÉ/PISTE/PROPOSÉ, entrées récentes en haut) ; une MESURE par lot.
- Chaîne de preuve par lot : build ok + tests (≥ 141) + smoke (≥ 277 checks, seul échec attendu : 46 g, préexistant moteur) + digest (inchangé attendu, sauf lot 2 : re-mesure obligatoire).
- Un seul chantier à la fois sur `ui.js` : les lots sont séquentiels.

## Lot 1 — correctifs terrain restants (roadmap point 1)

- **Sorts en doublon** (diagnostic posé, arbitrages du 10/11 soir) : à chaque évolution, tous les sorts courants de la carte sont recopiés dans `inst.acc` (ui.js, `oldSpells`) puis fusionnés avec les sorts de la nouvelle forme (`instSpells`) sans dédoublonnage ; un préfixe dupliqué fait s'afficher 5 à 6 fois les sorts d'une carte montée en famille. Correctif : dédoublonner par identité de sort (école + cran) à la fusion, **réparer les sauvegardes déjà polluées** (migration non destructive), ne cumuler dans `inst.acc` que les sorts que la nouvelle forme ne connaît pas déjà.
- **`elOf()`** doit surligner les pions du plateau, pas les rail-chips (ui.js:2966).
- **Bouton réduire/masquer** sur la fenêtre d'action tactique (elle masque toute la ligne équipe, jusqu'à 78 dvh, sans bouton pour la refermer).
- **Divers du point 1** : ajouter les 4 familles v3 à `FAM_ORDER` (crepuscule, vol, zele, appel), tailles de boutons mobile ≥ 32 px, corriger la double bordure de la zone de texte des cartes et son fond flou.
- Preuve attendue : tests + smoke verts, digest inchangé (chemin Auto non touché), test de non-régression sur une carte évoluée deux fois.

## Lot 2 — moteur : rangs avant/arrière (roadmap point 4, règles ACTÉES)

Implémenter dans `src/engine/combat.js` les règles de rang ACTÉES (arbitrages du 10/11 soir, Option A) :

- Formation 5 max : 3 devant + 2 derrière ou 2 + 3, **figée pendant le combat**.
- L'arrière encaisse **-50 %** tant qu'un allié tient à l'avant ; l'avant tombe : la protection saute.
- La protection de l'arrière ne couvre pas les attaques de zone.
- Un Guerrier ou un Assassin en arrière frappe à moitié, les autres profils à plein ; **les soins ne sont jamais affectés par la position**.
- CROSS (Souffle/Frappe Croisée) : **RETIRÉ**, non retranché en position (piste de sorts croisés conditionnels notée pour plus tard).
- **Digest : re-mesure obligatoire à ce lot** (les maths changent) : consigner une entrée MESURE dans arbitrages avec le nouveau sha et les taux (N = 3000), SANS tranchage. Le calibrage viendra avec Marc-Olivier (roadmap point 8).

## Lot 3 — suppression du champ `role` + formation avant combat (migration v27+)

- Retirer `role` partout : 113 cartes, 153 monstres, vagues ennemies, écran d'équipe, sauvegardes (migration non destructive versionnée).
- L'écran d'équipe choisit la formation (avant/arrière, 3+2 ou 2+3) **avant le combat**.
- À faire avant le contenu v3 restant (les nouvelles cartes naîtront sans `role`).

## Lot 4 — recâblage famille → école (roadmap point 3, `FAM_SCHOOL`)

- La clé d'école diffère du nom de famille pour 9 des 11 familles (Bouclier → Rempart, Aube → Baume… ; lame et appel coïncident seules).
- Poser le mapping `FAM_SCHOOL` en data et recâbler la fenêtre d'action pour que la fiche type pilote aussi les sorts de lignée ; comportement par défaut conservé sinon.

## Lot 5 — vidéos FX en jeu (roadmap point 7, v0.48)

- Les webm WAN 2.2 (~0,8 s, 21 frames/25 fps) sont déjà rendus et stockés dans `site-assets/fx/` (jamais en base64 dans le dist) ; la CI Pages les sert en ligne.
- Chantier : déclenchement au cast du sort signature, fallback image si absent/lent, toggle de vitesse, pause hors écran, `prefers-reduced-motion` → image fixe, une seule vidéo décodée à la fois.

## Lot 6 — héros d'errance + généralisation aux 5 zones (roadmap point 9, reste)

- Intégrer l'art livré : `tools/out-v2/v3/heros-errance.jpg` (héros dédié ACTÉ : femme cheveux blancs cape noire) + le cycle de marche `tools/out-v2/video/sprites_00002_.mp4` (extraction de frames → sprite sheet, plan hybride du guide).
- Généraliser l'errance aux 5 zones de `data/zones.json` : `zone-marees`, `zone-forge`, `zone-bosquet`, `zone-crypte`, `zone-zenith` ; le déblocage en chaîne est déjà posé, les monstres/collectables/enseignements par zone existent (LOT 7 fait).
- Conformité au guide `docs/design/errance-topdown.md` (pilotage inertiel §5, caméra §6, pré-rendu §3, DPR §9, entrées §4/§10) ; la régression smoke B13 doit rester verte.

## Lot 7 — craft en ville + page Personnage à onglets

- **Craft en ville** (boucle v2 point (e), spec `docs/design/economie-v2-catalogues.md`) : fabriquer les pièces de set à partir des matériaux de zone et de la matière du boss (sets base/supérieure/royale par zone), à côté de la Boutique et du marchand.
- **Page Personnage** (bloc visuel ACTÉ) : Équipe + Inventaire en onglets, avec l'équipement (slots par carte + slots d'équipe), bouton retour partout.

## Clôture du chantier

- Digest complet consigné dans arbitrages (MESURE) : N = 3000 ET N = 10 000.
- Roadmap : points 1, 3, 4, 7 passés FAIT ; point 9 complété (errance généralisée, héros intégré).
- `docs/validation-ihm.md` (protocole v1.30, scénarios S1-S15) joué en entier sans KO bloquant ; validation finale sur téléphone ET PC par Marc-Olivier.