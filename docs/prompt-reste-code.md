# Prompt de lancement — chantier « reste code » (7 lots)

> Prompt auto-suffisant pour le couloir 1. Spec et plan détaillés : `docs/design/reste-code-spec-plan.md`. Il absorbe `docs/prompt-correctifs-terrain.md` (lot 1) et `docs/prompt-lignes-avant-arriere.md` (lots 2-4), conservés pour historique.

---

Tu codes sur le repo `aicg-lignees` (branche `main`). Lis d'abord `AGENT.md`, puis `docs/design/reste-code-spec-plan.md`, `docs/arbitrages.md` (entrées des 10-11/11), `docs/roadmap.md` (points 1, 3, 4, 7, 9), `docs/design/errance-topdown.md` et `docs/design/economie-v2-catalogues.md`.

**Règles absolues** :

- `data/*.json` = source de vérité ; `dist.html` jamais édité à la main (`node build.mjs`) ; zéro dépendance npm.
- **Re-fetch systématique avant chaque édition** : d'autres couloirs poussent aussi sur `main`.
- Une tâche = un commit français ; toute décision dans `docs/arbitrages.md` avec date et statut (entrées récentes en haut, après la ligne « > Règle : … »).
- Migrations de sauvegarde non destructives, versionnées (v27+).
- Ne touche à RIEN hors périmètre : contenu v3, calibrage digest, redesign IA de combat, et les 4 PROPOSÉ en attente (voir « Hors périmètre » de la spec).

**Chaîne de preuve à chaque lot** : `node build.mjs` ; `node --test` (≥ 141 verts) ; `node smoke-ui.mjs dist.html` (≥ 277 checks, seul échec attendu : 46 g, préexistant moteur) ; `node combat-digest.mjs dist.html 3000` (inchangé attendu, SAUF lot 2 : re-mesure OBLIGATOIRE, consignée en MESURE dans arbitrages, sans tranchage). En clôture du chantier : digest 3000 ET 10000.

**Les 7 lots, dans l'ordre** (un chantier `ui.js` à la fois, détail dans la spec) :

1. **Correctifs terrain restants** : dédoublonnage des sorts à l'évolution (+ réparation des sauvegardes polluées), `elOf()` surligne les pions pas les rail-chips, bouton réduire sur la fenêtre d'action, `FAM_ORDER` des 4 familles v3 (crepuscule, vol, zele, appel), boutons mobiles ≥ 32 px, double bordure de la zone de texte des cartes. (roadmap point 1)
2. **Moteur rangs avant/arrière** : règles ACTÉES Option A — l'arrière encaisse -50 % tant que l'avant tient (protection saute si l'avant tombe, zones non couvertes), Guerrier/Assassin en arrière frappent à moitié, soins jamais affectés par la position, formation figée en combat, CROSS retiré. Re-mesure digest + MESURE. (point 4)
3. **Suppression du champ `role`** partout (113 cartes, 153 monstres, vagues, UI, sauvegardes, migration v27+) + écran de formation avant combat (3+2 / 2+3). (point 4)
4. **Recâblage famille → école** : mapping `FAM_SCHOOL` en data, la fiche type pilote aussi les sorts de lignée. (point 3)
5. **Vidéos FX en jeu** : déclenchement au cast du sort signature, fallback image si absent/lent, toggle de vitesse, une seule vidéo décodée à la fois, pause hors écran, `prefers-reduced-motion`. (point 7)
6. **Héros d'errance intégré** (`tools/out-v2/v3/heros-errance.jpg` + cycle `tools/out-v2/video/sprites_00002_.mp4` → sprite sheet) **+ généralisation de l'errance aux 5 zones** (`zone-marees`, `zone-forge`, `zone-bosquet`, `zone-crypte`, `zone-zenith`), conformité `docs/design/errance-topdown.md`, smoke B13 vert. (point 9)
7. **Craft en ville** (pièces de set : matériaux de zone + matière du boss, `docs/design/economie-v2-catalogues.md`) **+ page Personnage à onglets** (Équipe + Inventaire + équipement, bouton retour partout). (boucle v2 point (e), bloc visuel ACTÉ)

**À chaque lot** : commit + entrée MESURE dans `docs/arbitrages.md` + point roadmap marqué FAIT + CHANGELOG/HISTORY du dist si visible joueur.

**Critères d'acceptation finaux** : build + tests + smoke verts, digest re-mesuré et consigné (3000 et 10000), parcours `docs/validation-ihm.md` (S1-S15) joué sans KO bloquant, validation finale sur téléphone ET PC par Marc-Olivier.