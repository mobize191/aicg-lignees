# Rapport de clôture — LA REFONTE v2 (prompt `docs/prompt-refonte-v2.md`, 11 lots, couloir 1)

Date : 2026-11-15. Branche : `vibe/refonte-v2-ff7146`. Consignation : `docs/arbitrages.md` suites 41-49.

## Lots livrés (dans l'ordre du prompt)

| Lot | Contenu | Digest 3000 |
| --- | --- | --- |
| 0 | Capture relevée (taux zone 8-12 %, plancher force 0,5, plafond ×3, borne 95 %) | INCHANGÉ (suite 41) |
| 1 | Gel v1 en data (54 cartes figées, budgets M4, hors pools) | INCHANGÉ sur le gel pur, puis impact pools au lot 5 |
| 2 | Moteur v2 J1-J12 (5 stats, INT sorts, défense ratio K/(K+def), cran race 5/10/15 % PV, boule de feu de base, provocation à charges, mana persistant) | `c46be8d5…` 752 (suite 41) |
| 3 | Data M1/M4 deux catalogues (supports relevés, bug PV Mage R 70, tanks, armes intPct) | `c4b34928…` 714 (suite 42) |
| 4 | Sorts au niveau + grimoires de zone + sorts de trio (J6/J11/J7) | `13d4e4bc…` 716 (suite 43) |
| 5 | Donjons par famille : 13 donjons (5 majeurs recyclés, 5 familles carte 1, 3 divins), Royale +10, panoplies, errance recâblée | `4b74c806…` 731 (suite 44) |
| 6 | Fusion v4 (Autel des Lignées, aperçu mystère, double confirmation, régression morte, migration v31) | `4b74c806…` 731 INCHANGÉ (suite 45) |
| 7 | Menus v2 (cibles 44 px, bloc mobile 520 px, retour au clic systématique via `ensureBackButton`) | `4b74c806…` 731 INCHANGÉ (suite 46) |
| 8 | SHINY (1/100 à l'obtention, variance +3-5 % couplée, art `<id>-s` + fallback, paillettes ✨, badge, collection, fusion héréditaire, migration v32) | `29c995da…` 733 (suite 47) |
| 9 | XP 1-100 (cap 100, courbe cubique n³, table de minutes par tranches grille v1, niveaux de donjon étirés ×4 sur la grille v1, LEVEL_BONUS 0,02 préservant la courbe de stats) | `29c995da…` 733 INCHANGÉ par construction (suite 48) |
| 10 | Clôture (ce rapport) | `29c995da…` 733 / `bce556b3…` 2420 |

## Preuves finales (chaîne de preuve du prompt, rejouée à la clôture)

- `node build.mjs` → dist régénéré (déterministe).
- `node --test tests/*.test.js` → **355 tests, 355 verts**.
- `node smoke-ui.mjs dist.html` → **483 checks TOUT PASSE** (S28 fusion, S29 menus, S30 shiny, S31 XP 1-100).
- Validateur `validate()` → **0 erreur** (EXI-DATA-1…7, EXI-DJ-1/2, EXI-P*, allowlist EXI-MOD-1 vert).
- `node tools/gen-tables.mjs` → tables régénérées (`docs/tables/`).
- `node combat-digest.mjs dist.html 3000` → **`29c995da…` 733/3000, 0 exception, 0 marathon**.
- `node combat-digest.mjs dist.html 10000` → **`bce556b3…` 2420/10000, 0 exception, 0 marathon**.

## Tableau M1 avant/après (mono-classe, meilleure carte joueur par classe, `tools/etude-paliers.mjs dist.html 3000 UC,R,SR,UR`, N = 3000/ligne)

| Palier | Voie | AVANT (pré-lot 3, suite 42) | APRÈS (final) |
| --- | --- | --- | --- |
| UC | Guerrier | 63,3 % | 61,2 % |
| UC | Assassin | 48,0 % | 45,9 % |
| UC | Mage | 25,3 % | 18,3 % |
| UC | Prêtre | 21,0 % | 26,8 % |
| UC | Occultiste | 25,3 % | 19,3 % |
| R | Guerrier | 75,3 % | 76,0 % |
| R | Assassin | 60,2 % | 58,9 % |
| R | Mage | 39,9 % | 27,7 % |
| R | Prêtre | 35,7 % | 31,1 % |
| R | Occultiste | 36,6 % | 31,2 % |
| SR | Guerrier | 84,5 % | 85,3 % |
| SR | Assassin | 78,5 % | 63,2 % |
| SR | Mage | 59,9 % | 53,6 % |
| SR | Prêtre | 59,6 % | 54,0 % |
| SR | Occultiste | 56,7 % | 51,6 % |
| UR | Guerrier | 89,3 % | 89,6 % |
| UR | Assassin | 85,1 % | 85,1 % |
| UR | Mage | 74,9 % | 74,7 % |
| UR | Prêtre | 79,7 % | 78,3 % |
| UR | Occultiste | 77,1 % | 75,3 % |

Lecture : **0 marathon partout** (33 marathons sur 3× Diacre du Plein Jour avant la refonte), hiérarchie lisible (Guerrier au-dessus, supports sous leur plafond 40-50 %, trios resserrés aux hauts paliers SR/UR 51-90 %), écarts de classe resserrés aux paliers hauts. Cibles non recalibrées (M6). Niveau d'équipe projeté sur la grille v1 (`stretchLevel(12)` = 45) pour mesurer les mêmes rapports de force qu'avant le lot 9.

## Critères d'acceptation finaux (prompt)

- build + tests + smoke verts ✔ (355 / 483).
- Contrats M1 tenus en MESURE : 0 marathon, hiérarchie de classes au même plateau aux paliers hauts ✔ (tableau ci-dessus).
- 22+ donjons jouables sur 4 régions avec leurs Royales → **livré pour la carte 1** : 13 donjons jouables (5 majeurs + 5 familles + 3 divins) avec Royale +10 ; cartes 2-4 = lots ultérieurs selon l'ordre de livraison §6 de la spec donjons (consigné suites 44/49).
- Fusion de bout en bout (S28) ✔ ; capture ~2-4/run (taux relevés lot 0) ✔ ; shiny de bout en bout (tirage, marqueur, collection, fusion — S30) ✔.
- **Une seule baseline proposée** (M6) : voir ci-dessous.

## Proposition de NOUVELLE baseline (verrouillage par Marc-Olivier)

**`29c995da256ffa22204ed51cda089e885822c650282cb70a1f344ef906321d67` — 733/3000 (0 exception, 0 marathon)**
**`bce556b301c6bd1bc1b8516d0eddfffc6d3a2b1341521238c94f9913e4850305` — 2420/10000 (0 exception, 0 marathon)**

Référence courante jusqu'au verrouillage : `3b11106f…` 871/3000 / `6c86838b…` 2888/10000.

## Reste à faire (hors couloir 1)

- Verrouillage de la baseline par Marc-Olivier (suite 49, statut PROPOSÉ).
- Validation IHM terrain (sweep Playwright côté CI ; snapshots DOM déjà en `docs/captures-validation/menus-v2/`).
- Images shiny `{id}-s.jpg` côté couloir design (manifeste étendu ; le jeu branche la structure, fallback art classique en attendant).
- Cartes 2-4 (régions 2-4) + donjons royaux dédiés (ordre de livraison §6 spec-donjons).
