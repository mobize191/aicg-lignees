# Rapport de clôture — CORRECTIFS D'ÉQUILIBRE v2 (prompt `docs/prompt-correctifs-equilibre-v2.md`, 4 lots, couloir 1)

Date : 2026-11-15. Branche : `vibe/refonte-v2-ff7146`. Consignation : `docs/arbitrages.md` suites 52-55.

Contexte : la validation de la refonte v2 (14/11/2026, `docs/design/etude-reequilibrage-classes-cartes-2026-11-13.md` §Validation, outils rejouables `tools/etude-v2-*.mjs`) avait confirmé la refonte (digest `29c995da…` 733/3000 reproduit à l'identique) et mesuré **4 écarts** à corriger avant verrouillage de la baseline PROPOSÉE. Calibrage par la DATA mesurée au harnas à chaque lot (protocole v3, N = 3000/ligne, `stretchLevel(12)` = 45, garde 150), aucun recalibrage sauvage (M6 tenu : une seule baseline proposée en fin de chantier).

## Lots livrés (dans l'ordre du prompt)

| Lot | Contenu | Digest 3000 / 10000 |
| --- | --- | --- |
| 1 | Mage : data INT (cartes a/v INT_T par palier C21/UC26/R33/SR33/UR40/L55, Mages monstres à parité ATQ Guerrier, PV 89 % des deux côtés), `cardPower` profilé sur l'INT (M4), strike Mage 0,8 conservé (compensation dans la base INT — une seule des deux options J3) | `d0998c12…` 617/3000 · `6fc04f52…` 2064/10000 (suite 52) |
| 2 | Signatures de soin pur des 14 monstres `effect.kind: "heal"` en **hybrides** (frappe + `soinPct` = `SIGNATURE_SOIN_PCT` 0,5 en data, EXI-DATA-8) + branchements symétriques (ennemis + support arrière) ; commun soin conservé ; cartes soigneuses inchangées | `9bd6b11f…` 615/3000 · `fbe9a246…` 2053/10000 (suite 53) |
| 3 | I1 : 188 monstres recrutables alignés sur les bandes des meilleures cartes du palier/classe (atk = bande, INT = bande pour les lanceurs, PV cran-ajusté ; cran 5/10/15 % PV seul inchangé) | `d630d83e…` 419/3000 · `584f5d16…` 1419/10000 (suite 54) |
| 4 | Clôture (ce rapport) | `d630d83e…` 419/3000 · `584f5d16…` 1419/10000 |

## Preuves finales (chaîne de preuve du prompt, rejouée à la clôture)

- `node build.mjs` → dist régénéré (déterministe).
- `node --test tests/*.test.js` → **364 tests, 364 verts** (nouveaux `tests/correctifs-eq-v2-lot1/2/3.test.js`).
- `node smoke-ui.mjs dist.html` → **483 checks TOUT PASSE**.
- Validateur `validate()` → **0 erreur** (EXI-DATA-1…8, allowlist EXI-MOD-1 vert).
- `node tools/gen-tables.mjs` → tables régénérées.
- `node combat-digest.mjs dist.html 3000` → **`d630d83e…` 419/3000, 0 exception, 0 marathon**.
- `node combat-digest.mjs dist.html 10000` → **`584f5d16…` 1419/10000, 0 exception, 0 marathon**.

## Tableau avant/après (mono-classe, meilleure carte joueur par classe, `tools/etude-paliers.mjs dist.html 3000 UC,R,SR,UR`)

| Palier | Classe | AVANT (validation 14/11, suite 49) | APRÈS (final, lots 1-3) |
| --- | --- | --- | --- |
| UC | Guerrier | 61,2 % | 41,4 % |
| UC | Assassin | 45,9 % | 32,2 % |
| UC | Mage | 18,3 % | 31,5 % |
| UC | Prêtre | 26,8 % | 15,2 % |
| UC | Occultiste | 19,3 % | 11,5 % |
| R | Guerrier | 76,0 % | 59,9 % |
| R | Assassin | 58,9 % | 41,7 % |
| R | Mage | **27,7 %** | 48,4 % (61,7 % au lot 1, suite 52) |
| R | Prêtre | 31,1 % | 18,1 % |
| R | Occultiste | 31,2 % | 19,3 % |
| SR | Guerrier | 85,3 % | 81,5 % |
| SR | Assassin | 63,2 % | 44,5 % |
| SR | Mage | 53,6 % | 52,5 % |
| SR | Prêtre | 54,0 % | 37,0 % |
| SR | Occultiste | 51,6 % | 34,3 % |
| UR | Guerrier | 89,6 % | 89,0 % |
| UR | Assassin | 85,1 % | 77,4 % |
| UR | Mage | 74,7 % | 77,3 % |
| UR | Prêtre | 78,3 % | 67,2 % |
| UR | Occultiste | 75,3 % | 61,1 % |

**0 marathon, 0 exception sur toutes les lignes** (avant : 33-42 marathons/3000 sur 3× Diacre du Plein Jour). La baisse globale des lignes UC/R est la **conséquence assumée d'I1** (le même catalogue alimente les vagues, lot 3) — consignée suite 54, sans recalibrage, proposée au tranchage (contreparties : calibration des vagues par palier de donjon, bande de tolérance M1).

## Les 4 écarts mesurés — verdict

1. **Mage hors cible (R 27,7 %, cible 60-70)** : fermé au lot 1 — **Mage R 61,7 %** (`etude-paliers`), écarts M−A par palier UC +1,4 / R +10,2 / SR +8,6 / UR −0,7 (±10 ✓), Guerrier R 72,7 ✓, supports R 26,7/26,8 ✓, 0 marathon. Après la conséquence-vagues du lot 3 : Mage R 48,4 % — **repris au tranchage** (proposition : calibration des vagues par palier de donjon pour rendre la bande 60-70 et le digest).
2. **Marathon des signatures de soin monstres** : éradiqué au lot 2 — 3× Diacre du Plein Jour (z24) **22,4-23,4 % et 0 marathon** (était 8,9 % + 42 marathons/3000), z10 Serre-Soleil 22,4 % 0 marathon ; contrôles e8 16,4 / d9 16,5 / e25 16,2 sans régression. **Test de non-régression marathon** ajouté (3× chaque Prêtre monstre R/SR soigneur e9/k11/z10/z11/z24, garde 150, combat toujours tranché). Cible ≥ 25 % atteinte à 22,4-23,4 % (bruit N = 3000 ± ~1,5 pt) ; le levier propre pour franchir 25 % est le lot 3 (fait) ou un `soloMult` des signatures soigneur en proposition.
3. **I1 (monstre recruté < carte)** : après lot 3, écarts R monstre vs carte par classe : Mage z17 43,8 vs a8 48,4 (**−4,6 ✓**), Prêtre z24 22,4 vs p5 18,1 (**+4,3 ✓**), Occultiste e25 16,2 vs q3 19,3 (**−3,1 ✓**), Guerrier k4 53,0 vs a48 59,9 (−6,9, limite), Assassin f11/d15 29,9/29,5 vs a41 41,7 (−11,8/−12,2, **structurel** : stats identiques au `makeUnit`, l'écart vient du kit de sorts carte vs fiche monstre — proposition tranchage). Paires jumelles R ≤ 1,0 pt ✓ (z4/f4, f11/k13, z17/d4). 0 marathon partout ✓.
4. **Plateau des trios (écart 33,7 pts au R)** : resserré à **17,0 pts** (G/A/P 55,6 ; M/A/P 50,7 ; G/M/O 49,5 ; M/P/O 38,6) — cible ≤ 12 non atteinte, **documentée** : le trio M/P/O reste tiré vers le bas par les supports (P 18,1 / O 19,3 au R après la hausse des vagues). Difficulté du trio G/A/P : d1 74,2 / d2 55,1 / d3 37,5 % (facile 70-80 ✓, normal/difficile en dessous après la conséquence-vagues du lot 3 — même proposition de calibration).

## Chaîne des digests (M6 tenu : aucune baseline intermédiaire verrouillée)

`3b11106f…` 871/3000 (référence historique) → `29c995da…` 733/3000 + `bce556b3…` 2420/10000 (**référence en vigueur**, baseline PROPOSÉE de la refonte v2, M6) → lot 1 `d0998c12…` 617 + `6fc04f52…` 2064 → lot 2 `9bd6b11f…` 615 + `fbe9a246…` 2053 → lot 3/final `d630d83e…` 419 + `584f5d16…` 1419 (0 exception, 0 marathon à chaque mesure).

## PROPOSITION DE NOUVELLE BASELINE (unique, M6) — verrouillage par Marc-Olivier

**`d630d83e222ef0d6de51366475e39ba0ce14a1e046e3e8f9f4fbcaccae629f7e` 419/3000** et **`584f5d16e20e7cef31402dce7bc2e7f34eede388197bc159991afcf821c50e7f` 1419/10000** (0 exception, 0 marathon). La référence `29c995da…`/`bce556b3…` reste en vigueur jusqu'au verrouillage.

**Items de tranchage ouverts** (consignés suites 52-54) : (a) calibration des vagues par palier de donjon (rend la bande Mage R 60-70 et relève le digest après la conséquence I1) ; (b) écart Assassin monstre/carte structurel (kit de sorts) ; (c) trios ≤ 12 pts ; (d) `soloMult` des signatures soigneur (z24/z10 ≥ 25 %).

**Validation terrain ensuite par Marc-Olivier** : une équipe de Mages au R, une recrue Diacre du Plein Jour, un trio sans Guerrier.
