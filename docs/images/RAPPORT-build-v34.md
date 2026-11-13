# RAPPORT BUILD v3.4 — prompts gel v18 + thèmes Repos/Obscures

> Date : 2026-11-15 — Spec : `docs/images/spec-arts-v34-gel-v18.md` (PRIME) + `spec-arts-v34.md` (base)
> Builder : `tools/build-prompts-v34.mjs` — Base : `tools/prompts-v33.json` (308 entrées)

## Comptages

| Catégorie | Nombre |
|---|---|
| Classique (repris v3.3) | 302 |
| Repos (`-r`, seed +5 000 000) | 302 |
| Obscures (`-o`, seed +10 000 000) | 302 |
| Fonds (repris tels quels) | 6 |
| **Total prompts** | **912** |

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

## Note prérequis data

**Le gel v18 (cartes d19-d40, nouveaux p-series, hydra/merSovereign) est ABSENT de `data/cards.json` et `data/monsters.json`** au moment du build. p2 (Ange Gardien) et p4 (Fidèle du Jour) sont encore présents. Le build couvre les 302 cartes existantes × 3 thèmes. Les nouvelles cartes du gel devront être ajoutées aux data par Marc-Olivier, puis le builder relancé pour générer leurs prompts (seeds à partir de 2 150 037).

## Fichiers générés

- `tools/prompts-v34.json` — 912 prompts (302 × 3 thèmes + 6 fonds)
- `tools/seeds-v34.csv` — seeds consignés (classique + `-r` + `-o`)
- `tools/species-map.json` — v3.4 (76 espèces)
- `tools/build-prompts-v34.mjs` — builder

## Durée estimée génération

~912 images × ~45 s/image ≈ **11,5 heures** de génération ComfyUI (hors retries)

---

**POINT D'ARRÊT PHASE 1** — En attente du « go » de Marc-Olivier pour la Phase 2 (génération).
