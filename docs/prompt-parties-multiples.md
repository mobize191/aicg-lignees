# Prompt de lancement — parties multiples (slots de sauvegarde parallèles)

> À coller au couloir 1. Contexte : demande de Marc-Olivier (12/11) — pouvoir tester le jeu depuis le début (partie à zéro) sans vider le cache et les cookies : aujourd'hui une seule sauvegarde existe, la progression réelle ne peut être mise de côté qu'en copiant un code FCSAVE1 à réimporter à la main. Règles du repo : une tâche = un commit français ; `data/*.json` source de vérité ; `dist.html` jamais édité à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant chaque édition. Preuve de chaque lot : build + `node --test` + `node smoke-ui.mjs dist.html` + digest INCHANGÉ.

## 0. État du code vérifié par le couloir pilotage (12/11, main `6eb48ef`)

- Une seule partie en stock : `SAVE_KEY = "fondations-cards-v1"` (défini dans `data/engine.json`, repris dans `src/data.js` via `E.SAVE_KEY`) + `BAK_KEY = SAVE_KEY + '.bak'` (`src/ui.js` ~284).
- `makeSafeStorage()` (`src/ui.js` ~286) : wrapper localStorage avec repli mémoire ; `save()` (~1224) écrit SAVE_KEY et fait tourner le `.bak` ; `load()` (~1239) essaie SAVE_KEY puis BAK_KEY.
- `snapshot()` (~934) / `restore()` (~975) / `migrate()` : la sauvegarde est versionnée et les migrations existent déjà (une v8 traverse v9 → v12 au `restore`) — le format est prêt pour une tranche de migration.
- Export/import de codes « FCSAVE1 » : `buildSaveCode()` / `applySaveCode()` / `openSaveModal()` (~2700) ; boîte 💾 via `saveBoxHtml()` sur l'Accueil et d'autres pages.
- Préférences hors parties (restent globales) : manifeste d'arts (`fondations-art-src`), FX (`aicg-fx`).

## 1. Proposition (aucune maths, aucun équilibrage)

- **Emplacements** : 4 parties, clés `fondations-cards-v1.p0` … `.p3` + un index `fondations-cards-v1.slots` (par partie : nom libre, version de sauvegarde, date de dernière partie, résumé d'affichage : or, donjon·étage, niveau d'équipe). Le `.bak` tourne **par partie** (`pN.bak`).
- **Migration sans perte** : à la première ouverture après mise à jour, si l'index n'existe pas et que la clé historique existe, la sauvegarde actuelle de Marc-Olivier devient la **Partie 1** (p0). Les clés historiques ne sont pas effacées (repli de sécurité : `load()` sait encore les lire si l'index a disparu).
- **UI** : panneau « Parties » sur l'**Accueil** (page par défaut, déjà en place), à côté de la boîte 💾 : une carte par emplacement (résumé + date + partie active marquée), actions : ▶ Jouer / ✨ Nouvelle partie / ✏️ Renommer / 🗑 Supprimer (double confirmation). Bascule = sauvegarde de la partie en cours, puis restauration de la nouvelle. Export/import FCSAVE1 inchangés (ils s'appliquent à la partie active).
- **Partie active mémorisée** : l'index retient le dernier emplacement joué, le jeu le recharge au lancement ; changement possible depuis l'Accueil.
- **Portée IHM** : panneau ciblé sur l'Accueil. Pas de refonte de fond de `src/ui.js` : le chantier reste dans la couche stockage + un panneau.

## 2. Plan en lots

**Lot 1 (stockage + migration)**
- Clés par emplacement + index + rotation `.bak` par partie ; `save()`/`load()` passent par l'emplacement actif.
- Migration : clé historique → Partie 1, index créé, repli si index absent.
- Tests : la progression actuelle survit à la mise à jour (flux réel v8 → v12 rejoué sur la clé historique) ; bascule p0 ↔ p1 sans perte ni mélange ; rotation `.bak` par partie ; suppression d'un slot sans toucher aux autres.

**Lot 2 (UI Accueil)**
- Panneau « Parties » : résumé par emplacement, actions Jouer / Nouvelle partie / Renommer / Supprimer.
- Acceptation : Nouvelle partie sur un emplacement vide démarre un départ frais (2 cartes, 0 or, écran de départ v22 rejoué) ; Supprimer exige double confirmation et n'efface rien d'autre ; Renommer persiste ; la partie active est sauvegardée avant toute bascule (aucune perte lors du changement).

**Lot 3 (preuves)**
- Tests permanents du lot 1 rejoués en CI ; smoke enrichi : panneau visible sur l'Accueil, création puis bascule de partie ; 171 tests verts attendus + les nouveaux.

## 3. Preuves et limites

- Chaque lot : build, `node --test`, smoke à jour si l'IHM bouge, **digest `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000 INCHANGÉS** (`node combat-digest.mjs dist.html 3000` puis `10000`).
- Ne pas toucher : le moteur, les data d'équilibrage, l'économie, l'errance, le contenu, le chemin Auto.
- Les 3 échecs smoke préexistants (roadmap) restent hors périmètre.
- Si un lot ne peut pas tenir la contrainte digest inchangé : STOP, consigner dans `docs/arbitrages.md` avant d'aller plus loin.
- Questions ouvertes balisées `[À TRANCHE — SESSION 12/11]` : nombre d'emplacements (proposition : 4) ; noms libres vs fixes (proposition : libres, défaut « Partie 1 ») ; partie active mémorisée vs choix à chaque lancement (proposition : mémorisée).
