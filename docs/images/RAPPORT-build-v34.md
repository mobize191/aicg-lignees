# RAPPORT BUILD v3.4 — prompts gel v18 + thèmes Repos/Obscures

> Date : 2026-11-15 — Spec : `docs/images/spec-arts-v34-gel-v18.md` (PRIME) + `spec-arts-v34.md` (base)
> Builder : `tools/build-prompts-v34.mjs` — Base : `tools/prompts-v33.json` (308 entrées)

## Comptages

| Catégorie | Nombre |
|---|---|
| Classique (302 v3.3 + 54 gel v1) | 356 |
| Repos (`-r`, seed +5 000 000) | 356 |
| Obscures (`-o`, seed +10 000 000) | 356 |
| Fonds (repris tels quels) | 6 |
| **Total prompts** | **1 059** |
| **Cartes uniques** | **351** |

## Species-map v3.4

- **76 espèces** au total (35 nouvelles ajoutées pour le gel v18)
- Nouvelles : camp démon (18 : imp, demonDesire, succubus, succubusGreater, ladyOfDesire, asmodia, viceMaw, viceMawGreater, abyssMaw, famine, demonPit, demonGreater, demonLord, demonPrince, belzebuth, plagueDemon, plagueDemonGreater, plagueBearer, peste), anges (9 : seraphYoung, seraphBearer, angelLight, archangel, seraphUltimate, fallenAngelArdent, fallenAngelZenith, fallenStar, darkSun), gorgon réécrite (négatif jellyfish obligatoire), faerie, paladin/knight/kiri, hydra, merSovereign

## Vérifications auto

| Critère | Résultat |
|---|---|
| Erreurs de build | **0** |
| "a beast" générique | **0** (interdit) |
| Canidé (wolf/canine/dog) | **0** |
| R13 anti-sang | présent sur 100% |
| R12 | absent des ajouts thèmes |
| Négatifs > 20 tags | 0 (min 20, max 20) |
| Seeds Repos = classique +5M | OK |
| Seeds Obscures = classique +10M | OK |
| Gorgon négatif jellyfish | OK (w21 + toutes gorgones) |
| LoRAs branchés | 75 (3 LoRAs autorisés uniquement) |
| Thème Crépuscule | hors périmètre (0 détecté) |

## Note prérequis data — RÉSOLU (suite 39, gel v1 déclaré)

Le gel v1 est récupéré depuis `tools/prompts-gel-v1.json` (54 cartes × 3 thèmes, spec gelée suite 39) : d19-d40 (camp démon 18 + anges déchus 4 + anges 2), a50-a53 (paladins), s15-s18 (chevaliers), k33-k40 (gorgones), g33-g39 (fées), e31-e32 (boss Marées), re-arts p1/p5/p6/n14/z8. **Total : 351 cartes uniques × 3 thèmes = 1 053 prompts personnages + 6 fonds.** p2 absent des prompts (retiré), p4 encore présent dans data mais hors périmètre arts.

## Fichiers générés

- `tools/prompts-v34.json` — 912 prompts (302 × 3 thèmes + 6 fonds)
- `tools/seeds-v34.csv` — seeds consignés (classique + `-r` + `-o`)
- `tools/species-map.json` — v3.4 (76 espèces)
- `tools/build-prompts-v34.mjs` — builder

## Durée estimée génération

~1 053 images × ~45 s/image ≈ **13,2 heures** de génération ComfyUI (hors retries)

---

**POINT D'ARRÊT PHASE 1** — En attente du « go » de Marc-Olivier pour la Phase 2 (génération).
