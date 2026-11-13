# Revue — chantier correctifs sorts (TRANCHÉ 14/11, prompt `docs/prompt-correctifs-sorts.md`)

Date : 2026-11-14. Branche `vibe/correctifs-sorts-ec66f9`, 5 lots = 5 commits FR. Invariant tenu : **un sort fait EXACTEMENT ce que sa fiche affiche** — `node audit-sorts.mjs` passe de **85 anomalies à 0** sur les 309 sorts uniques rejoués en combat réel.

## Décompte avant/après des 5 racines (audit `audit-sorts.mjs`)

| Racine | Avant (audit initial, commit `5ff2447`) | Après | Lot |
|---|---|---|---|
| R1 — lignée du Vol « 1 allié » (attaques en buff) | 6 anomalies `ATTAQUE_RESOLUE_EN_BUFF_ATK` | 0 — 6 sorts `HOSTILE_OK` | 1 (`f7086df`) |
| R2 — Appel/Pont « invocation » jamais invoquée | 12 anomalies `INVOC_RESOLUE_EN_BUFF_ATK` / `FICHE_INVOC_EFFET_HOSTILE` | 0 — 12 sorts `ALLIE_OK (renfort)` (esprit invoqué) | 4 (`574645d`) |
| R3 — signatures des recrues = frappe au lieu de l'effet affiché | 33 anomalies | 0 — `ALLIE_OK` / `HOSTILE_OK` selon la fiche | 2 (`abd3dd3`) |
| R4 — largeur = MAX des crans (frappe zone totale) | noms fusionnés frappaient toute la vague | 0 — largeur au cran du porteur, monocible sinon | 3 (`1d3e9c6`) |
| R5 — badges contrôle/malus sans effet | 32 sorts `FICHE_CONTROLE/MALUS_SANS_EFFET` | 0 — 26 basculés `HOSTILE_OK` au lot 5 (les 6 signatures stun étaient déjà OK via le lot 2) | 5 (`04c435b`) |

**Final : 309 sorts audités, 0 anomalie** (répartition : 202 `HOSTILE_OK`, 65 `ALLIE_OK`, 20 `ALLIE_OK (renfort)`, 2 `ALLIE_OK (statut)`, reste conformes).

## Digests mesurés (aucun recalibrage, baseline `4a5b0123…`/`3f828555…` en référence)

| Étape | N=3000 | N=10000 |
|---|---|---|
| Baseline début de chantier | `4a5b0123…` 861/3000 | `3f828555…` 2864/10000 |
| Lots 1-2 (MESURE de contrôle, attendus inchangés) | inchangé (mesuré) | inchangé (mesuré) |
| Lot 3 (largeur au cran) | `4a5b0123…` 861/3000 inchangé (les ennemis des runs de mesure ne jouent pas les noms touchés) | `3f828555…` 2864/10000 inchangé |
| Lot 4 (vraie invocation, Tactique ET Auto) | `4a5b0123…` 861/3000 inchangé (mesuré) | `3f828555…` 2864/10000 inchangé (mesuré) |
| Lot 5 (contrôle/malus posés, Tactique ET Auto) | **`3b11106f…` 871/3000** | **`6c86838b…` 2888/10000** |

Écart lot 5 : +10/3000, +24/10000, 0 exception, 0 marathon — le digest bouge comme prévu au tranchage 7-d (les sorts Entrave/Mauvais-Œil posent désormais leur statut en Auto). **Nouvelle baseline PROPOSÉE à Marc-Olivier pour verrouillage : `3b11106f…` 871/3000 / `6c86838b…` 2888/10000** (jamais appliquée sans arbitrage).

## Preuves

- 279 tests `node --test tests/*.test.js` verts (9 tests dédiés dans `tests/correctifs-sorts.test.js`, déterministes et semés).
- Smoke `node smoke-ui.mjs dist.html` : 414 checks TOUT PASSE.
- `node audit-sorts.mjs` : 0 anomalie (résultat versionné `audit-sorts-resultat.json`).
- Build `node build.mjs` : dist.html régénéré, jamais édité à la main.

## Notes de conception consignées

- Lot 5 : le statut est posé sur un **jet de taux** (`rng() < taux`) dans le chemin d'attaque partagé (Tactique ET Auto) ; la curse prend sa valeur dans le sort (`curse`), réduite de moitié sur les boss (`CURSE_BOSS_FACTOR`). Le seuil de résistance `seuilOf` (palier + INT/2, `SEUIL_PER_INT = 0,5` depuis v0.47) n'est PAS soustrait ici : avec INT ≥ 1 sur toute unité réelle, seuil ≥ 0,5 > tout taux ≤ 0,3, la formule grimoire `taux − seuil` ne peut jamais passer en combat réel (le stun du grimoire est mort depuis v0.47 — hors périmètre calibrage, signalé à Marc-Olivier). Fiche : « 25 % · 2 tours » affiché comme le grimoire.
- Œil du Malheur : `taux: 1, tours: 2, curse: 0,2`, desc reformulée « −20 % de dégâts × 2 tours » (choix tranché : curse de dégâts, cohérent avec l'école Mauvais-Œil).

## Reste

Validation terrain par Marc-Olivier (écran de combat réel : lignée du Vol, recrue à effet, Appel/Pont, badges contrôle/malus), puis verrouillage de la nouvelle baseline dans `docs/arbitrages.md`.
