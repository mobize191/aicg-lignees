# RAPPORT — Session globale génération AICG v3.1 + Série 3 (relance 3.1 complète)

Date : 12/11. Pipeline : WAI-Illustrious v17, canon §15 (Euler a + normal, 28 steps, CFG 5.5, hires ×1.25 denoise 0.4, ADetailer 0.32, VAE baked), IPAdapter 0.4 ease in-out end_at 0.85 (série 2 + paliers équipement). Verrous 3.1 appliqués dans `tools/prompts-v3.json` (rebuild par `tools/build-prompts-v31.mjs`, auto-vérif 0 erreur).

## 1. Tableau récapitulatif

| Phase | Générés | Réussis | Retries | Échecs définitifs |
|---|---|---|---|---|
| 1 — Relance 3.1 vague 3 (cartes) | 271 | 271 (0 erreur technique) | 13 assets (1 retry chacun, seed+1 + négatif ciblé) | 0 |
| 2 — Série 3 vague 1 (cartes) | 7 | 7 | 0 | 0 |
| 3 — Série 3 vague 2 (équipement) | 90 | 90 | 1 (eq-set-bosquet-base-armure, humain sur objet) | 0 |
| 4 — Vidéos WAN 2.1 14B | 3 soumises | 2 livrées (hub, sprites) + 1 retry sprites | 1 (sprites-r1) | 1 (marees : interrompue volontairement, ~66 min/720p, vidéo vague 2 déjà livrée) |

## 2. Comptages QA (image par image, 26 analyses vision, échantillon ≥ 20 par lot)

Échantillon Phase 1 (20 cartes : 6 témoins + refs + génériques) :
- 0 cadre généré / 0 texte généré sur l'échantillon, SAUF signatures d'artiste en coin bas-droit sur 5/20 (z19, z22, g7, k14, g16) → classe « signature ».
- Cadrage ≥ plancher (poitrine complète) : conforme sur les C/UC/R/SR vus (a5, s5, g31) ; 1 défaut : b3 (UR rendue en demi-corps au lieu de full body) → retry framing-ur.
- Répartition F/M génériques : 110 F / 96 M consignés (`tools/gender-map-v3.csv`, hash déterministe) ; sur l'échantillon visuel F/M conforme au verrou (a5/b3/s5 F, n7 M, a15 M).
- 0 figure humaine sur beast:true : 3 défauts constatés (e14, e13, f13 rendus bipèdes humanoïdes) → retries beast-humanoid ; z19/z22/g7 = créatures pures conformes.
- Visages sombres/sous capuche : 6 défauts (f18, d6, g16, k14, z8, n7) → retries dark-face.

Échantillon Série 3 (g31 + 2 objets) : g31 conforme (1boy, half body, visage OK) ; épée bosquet conforme (objet seul) mais signature coin ; robe bosquet = défaut majeur (robe portée par une femme) → retry eq-human.

Détail garder/retry par lot : 271 Phase 1 = 258 garder + 13 retry ; série 3 = 96 garder + 1 retry ; vidéos = hub garder (dérive notée), sprites retry puis rejeté (voir §3).

## 3. Échecs / défauts persistants avec recommandation

- `v31-sprites` (2 essais) : le modèle i2v 480p dérive en plan cinématique (rotation dos / zoom visage) au lieu du cycle de marche strict face caméra. Recommandation : keyframe sur fond uni neutre + prompt « walking in place, facing camera » + strength i2v ~0.75, ou génération image-par-image (81 keyframes WAI) montée en vidéo.
- `v31-hub` : livré, conforme ambiance (place ensoleillée, fontaine, villageois), mais dérive de cadrage (léger zoom vers la fontaine) malgré « static camera ». Acceptable en ambiance ; retry possible avec prompt renforcé.
- `marees` 720p : job interrompu après ~66 min de rendu (coût GPU) ; à relancer hors session si besoin (vidéo vague 2 `marees_00001/00002_.mp4` déjà présente).
- Signatures d'artiste résiduelles (~25 % de l'échantillon) : le tag « signature » est dans le négatif mais WAI v17 signe quand même en coin. Recommandation : crop 4 % bas-droite en post-traitement, ou negative renforcée + ADetailer.
- Visages sous capuche persistants sur sujets sombres (6/20) : retries exécutés ; ADetailer ne rattrape pas un visage fully black — garder le positif « face fully visible, bright front light ».

## 4. Planches contact (détection d'amplitude uniquement, pas de verdict)

- `tools/out-v2/planche-v31.png` (271 vignettes, Phase 1)
- `tools/out-v2/planche-s3.png` (97 vignettes, série 3)

## 5. Chemins

- Masters : `ComfyUI/output/out-v2/state/masters-v31/` (271 PNG 1040×1520) et `masters-s3/` (97 PNG)
- Production : `tools/out-v2/v31/` (271 JPEG 400×560 q80 + masters/), `tools/out-v2/s3/` (97 JPEG 400×560 q80)
- Vidéos : `tools/out-v2/video/v31-hub_00001_.mp4` (1280×720×81f), `v31-sprites_00001_.mp4` + `v31-sprites-r1_00001_.mp4` (832×480×81f) ; frames QA `hub-v31-f*.png`, `spr-v31-f*.png`, `spr-r1-f*.png`
- Seeds consignés : `tools/seeds-v3.csv` (458 lignes : 271 v3.1 + 7 série 3 + 90 eq + retries seed+1) ; diff vs base = seeds inchangés (R6), retries en +1
- Genres : `tools/gender-map-v3.csv` (206 humanoïdes genrés, 110 F / 96 M)
- Logs : `state/run-log-v31.json` (271), `state/run-log-s3.json`, `state/run-log-retry-v31.json` (17 retries, 0 erreur), `tools/out-v2-run-v31.log`
- Scripts : `tools/build-prompts-v31.mjs`, `gen-v31.py`, `build-prompts-serie3.mjs`, `build-prompts-eq3.mjs`, `gen-serie3-eq.py`, `gen-retry-v31.py`, `gen-v31-video.py`

## 6. Conflits prompt vs fiche projet (signalés, prompt appliqué)

1. `species-map.json > genderPolicy` dit « SANS quota strict » (10/11) ; le prompt de session impose parité ~50/50 déterministe R10 → R10 appliqué (110 F / 96 M).
2. `species-map.json` tague fireElemental « female humanoid elemental » ; la fiche/correction le classe beast:true → traité comme bête pure (R8), tag humanisant retiré du prompt.
3. Prompt de session « régénérer ENTIÈREMENT la vague 3 » vs « ne pas régénérer ce qui figure dans assets-v3.json » (même phase) : résolu en relance complète des 271 (les arts du manifeste v3 étant supersédés par les verrous 3.1), la réutilisation du manifeste s'appliquant aux nouveautés série 3 (delta = 7 ids).
4. R10 « an adult man/woman » vs maturité C = 14-17 ans : résolu dans le builder série 3 par mot de genre adapté à l'âge ; la vague 3.1 garde la formulation du doc (artefact connu, non bloquant).
5. Calibration digest : non touchée (baselines f72106ff…/3f9fe198… verrouillées) — cette session ne produit que des mesures.
