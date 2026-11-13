# RAPPORT — vague 3.3 (base 3.1 + couche monstres + 37 nouvelles cartes)

Date : 13/11. Spec : `docs/images/spec-arts-v33.md` (arbitrages 13/11). Build : `tools/prompts-v33.json` (308 prompts, validé par Marc-Olivier — « go »). Génération : `tools/gen-v33.py` (ComfyUI local, canon §15 inchangé : WAI-Illustrious v17, Euler a + normal, 28 steps, CFG 5.5, hires ×1.25 denoise 0.4 → masters 1040×1520, ADetailer visage 0.32, VAE baked, IPAdapter 0.4 ease in-out end_at 0.85).

## 1. Tableau récapitulatif

| Sous-lot | Jobs | Générés | Retries (seed+1) | Échecs |
|---|---|---|---|---|
| 271 relancées (mêmes seeds 3.1, dont 6 fonds) | 271 | **271** | 0 | **0** |
| 37 nouvelles cartes (seeds 2150000+) | 37 | **37** | 0 | **0** |
| **Total** | **308** | **308** | **0** | **0** |

Aucun Fx généré. Masters 1040×1520 à part (`ComfyUI/output/out-v2/state/masters-v33/`, 308 PNG), production 400×560 JPEG q80 (`tools/out-v2/v33/`, 308 jpg + sous-dossier `masters/`). Crop 4 % bas-droit appliqué sur les 308 jpg de production (`tools/crop-signatures-v33.py`). Note pipeline (préexistante 3.1/3.2) : le convert 5:7 d'un master 1040×1520 ajoute un padding noir latéral (~23 px) — le contrôle « bordures sombres » le signale donc sur 308/308, identique aux vagues précédentes, pas un défaut de génération.

## 2. QA vision

**Reportée par arbitrage Marc-Olivier (13/11, fin de session)** : pas de passe QA image-par-image ni de retries en fin de session ; le comparatif sera fait plus tard par Marc-Olivier via le fichier local `tools/out-v2/COMPARATIF-v3x.md` (308 lignes, colonnes V3/V3.1/V3.2/V3.3 en vignettes cliquables). Le QA vision Vibe (réception, image par image) reste le point d'entrée après cette livraison.

## 3. Comparatif 3.2 vs 3.3 (cartes des 3 LoRAs) et poids retenus

Différé (mêmes seeds 3.1/3.2 côté 271, poids LoRA retenus = **0.7** pour les 3 LoRAs — verdicts uniformes 3.2, jamais 1.0). Cartes concernées : Leviatan `leviathan a sea monster` → e13, e14, k2, k8-k12, k18, k20, k21 ; Golems `Magma Golem` → f13, f22 ; Forest Guardians → g7, g8 (Treant), g9-g12, g17, g19-g21 (Dryad), g18, w20 (Spirit).

## 4. Cohérence UR↔L des 7 compagnons

Non évaluée image par image (QA différée). Mécanisme en place : `character_dna` + IPAdapter (UR ref graine b1-b7, L ref son UR c1-c7, poids 0.4 ease in-out end_at 0.85) — c8-c14 générées avec ref c1-c7 produites dans la même session (vérifié dans le log : `ipa=c1.png` etc.).

## 5. Switch 4 versions (v1.51) — preuves

- Code : `ART_MANIFESTS = { v3, v31, v32, v33 }`, cycle V3 → V3.1 → V3.2 → V3.3, étiquette « 🖼️ V3.x » sur le bouton, préférence persistée (`fondations-art-src`), manifeste manquant = bouton grisé libellé, jamais d'erreur, version courante inchangée (src/ui.js, src/shell.html).
- Tests headless : **256 tests verts** dont 4 nouveaux (`tests/art-switch-v33.test.js` : cycle complet, préférence persistée, manifeste manquant toléré). Smoke dédié S27 a-f ajouté à `smoke-ui.mjs` (le smoke s'arrête sur le crash B9 préexistant connu — dette consignée, identique sans ce changement ; la logique S27 est couverte par les tests headless).
- Digest **inchangé** : `9faff1b94ab5d3cd1ccb1c5523d5b3af1f1bf0da672e9312b9d0039ec08ce9a3`, 838/3000, 0 exception (mesuré après build v1.51).
- Protocole IHM : `docs/validation-ihm.md` v1.51, scénario **S27** (captures bouton à chaque version + rechargement + manifeste manquant + carte 3.3 dans toutes les versions).
- Manifestes : `assets-v33.json` (302 arts + 6 fonds), `assets-v32.json` (302 arts + 8 fonds), `assets-v3.json` mis à jour (+37 arts 3.3-only = 399 arts, présents partout). `tools/assets-manifest.json` rempli pour 3.2 ET 3.3 : 72 loras 3.2 complétées (civitaiId, version, poids 0.7 — **0 null**), 308 entrées 3.3 ajoutées (seed réellement utilisé), session `3.2+3.3`.

## 6. Conflits spec vs code

Aucun. Signal : arbitrage post-build 9e4998f (k2 Nymphe Croupie reclassée stagnantNymph, hors LoRA Leviathan) — l’image k2 de cette vague a été générée AVANT ce correctif (beastWater + Leviatan), conservée telle quelle (arbitrage « pas de retry, comparatif plus tard »). Note pipeline (hors spec, préexistante) : padding latéral noir du convert 5:7 (cf. §1). Fichier comparatif local non poussé : `tools/out-v2/COMPARATIF-v3x.md` (pointe vers les jpg locaux).
