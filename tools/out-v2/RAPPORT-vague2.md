# Rapport — campagne v2, vague 2 (2026-11-11)

Checkpoint : **WAI-Illustrious v17**, réglages **canon §15** appliqués : **Euler a** (`euler_ancestral`) + scheduler `normal` (exit `dpmpp_2m_sde`+karras), 28 steps, CFG 5.5, hires fix ×1.25 **denoise 0.4**, ADetailer visage 0.32, **VAE baked** (aucun VAE externe chargé). Négatif **court canon** (`bad quality, worst quality, worst detail, sketch, censor, nsfw` + anti-texte/zéro-cadre + anti-signature + anatomie minimale) **+ anti-tags ciblés §14** intégrés au négatif standard de `build-prompts.mjs` (anti visage noir/encapuchonné, anti quasi-monochrome, anti peau dénaturée, renforts f13/Kenji/phénix). Tags qualité `, masterpiece, best quality, amazing quality` **en FIN de prompt**. Âge : `(aged up:N)` en tête pour les 101 génériques humaines (échelle `humanMaturityByRarity` : C/UC 1.0 → M 2.0) ; champ `age` du character_dna prioritaire pour les nommées. R-ESRGAN 4x+Anime6B téléchargé dans `upscale_models/` pour les upscales futurs des masters (le hires fix ×1.25 reste en latent, la v17 auto-corrigeant les membres).

Stack : ComfyUI 0.44.0 local, RTX 5070 12 Go, 832×1216 (fonds 1216×832), masters 1040×1520 conservés, production **400×560 JPEG q80** / fonds **1216×832 q72** (budgets §13). ~34 s/img, VRAM max ~7,6 Go. Aucune intégration dist/site. Masters jamais dans le dist.

## Diagnostic STYLE (en tête, requis)

- **Dérive 2.5D/painterly de la v17 constatée et NON corrigée** par tags de style, conformément au brief : présente sur une partie des arts (contours parfois flous, rendu semi-réaliste local) et nettement sur les 2 stills vidéo. C'est un trait connu de la v17, pas une erreur de prompt.
- **Quasi-monochrome résiduel** sur environ 15-20 % des cartes, concentré sur les univers sombres (familles q/t, partie Marées) : le négatif anti-monochrome ne gagne pas toujours contre la palette univers + la référence IPAdapter. Visages globalement visibles et éclairés après les correctifs §14.
- Ailleurs : style charte respecté (anime premium, contours nets, couleurs saines), zéro texte/cadre, cadrage full body dès UR respecté. **Le style charte a été traité comme critère bloquant sur chaque lot**, tests IPAdapter compris.

## Étape 1 — Retries vague 1 (9 cartes, seed fixe = seed vague 1, max 2 retries)

| Carte | Défaut vague 1 | Retry 1 (canon) | Retry 2 (renfort ciblé) | Verdict |
|---|---|---|---|---|
| a15 Kenji | chevalier casqué, peau bleue | visage adulte aguerri, bareheaded, barbe — **corrigé** | — | **garder** |
| e22 Pontos | quasi-monochrome + signature | couleurs saines — **corrigé** | — | **garder** |
| f13 Seigneur des Cendres | silhouette humanoïde encapuchonnée | colossal beast-like, lave en fusion — **corrigé** | — | **garder** |
| z19 Pyrrha | femme-oiseau humanoïde | vrai oiseau de feu géant — **corrigé** | — | **garder** |
| a13 Alix | quasi-monochrome | — | multicolore (corail/rose/or) — **corrigé** | **garder** |
| z22 Fjalar | figure encapuchonnée parasite | oiseau OK, **figure parasite persistante** | renfort no-humanoid, toujours présente | **human review** |
| a16 Kira | visage noir sous capuche | capuche retirée mais **visage toujours sombre + image quasi-monochrome violette** | idem | **human review** |
| d6 Kairos | visage noir sans traits | **visage toujours sans traits** (masque lumineux) | idem | **human review** |
| f18 Ombeline | visage noir | yeux visibles mais **visage toujours ombragé** | idem | **human review** |

Comparatif canon avant/après : `tools/out-v2/planche-v2-comparatif.png` (a15 / f18 / z19, vague1 vs vague2). Masters vague 1 archivés en `*.v1.png`, retry 1 en `*.r1.png`.

## Étape 2 — Génériques (212 arts)

- **189 génériques hors série 2 générés, 189/189 OK**, ~34 s/img. Les 27 de la série 2 sont traités à l'étape 3 (dont 4 sommets déjà en refs). Total génériques livrés : **212/212**.
- **Échecs de mapping espèce : 0** (271 prompts résolus, `build-prompts.mjs` aurait échoué explicitement sinon). Espèce toujours depuis les data/species-map, jamais depuis le nom.
- 101 génériques humains, tous avec `(aged up:N)` dérivé de la rareté. Planches de contrôle : `tools/out-v2/planche-v2-generics-*.png`.

## Étape 3 — Série 2 (27 arts, IPAdapter 0.3-0.45)

- **27/27 OK** (q1-q6, t1-t6, u1-u6, v1-v6, p1, p3, p4), ~36-38 s/img avec IPAdapter, VRAM max ~7,6 Go.
- IPAdapter **poids 0.4, weight_type `ease in-out`, end_at 0.85** (jamais 0.6 linear) : q1-q5 réinjectés depuis q6, t1-t5 depuis t6, u1-u5 depuis u6, v1-v5 depuis v6 ; p1/p3/p4 et les sommets sans IPAdapter. **Identité de lignée lisible, aucune dérive psychédélique magenta/cyan** (le défaut 0.6 linear de la vague 1 est corrigé). Validation sur identité + style + couleurs.
- Planche : `tools/out-v2/planche-v2-serie2.png`. Résiduel : quasi-monochrome sur les familles q/t (voir diagnostic style).

## Étape 4 — Sprites d'errance (héros arbitré : FEMME, cheveux blancs, cape noire)

- Art de référence v2 : `heros-errance.jpg` (seed 2129001) — 1girl, long white hair, black cape, full body, visage visible. **Validé**.
- Cycle de marche WAN 2.1 i2v 480p : `tools/out-v2/video/sprites_00001_.mp4` (832×480, 81 frames, 16 fps, 5,06 s, 20 steps CFG 5 shift 7). Frames début/milieu/fin vérifiées : identité maintenue (cheveux blancs + cape noire lisibles de face et de dos). **Dérive de cadrage constatée** : WAN a produit un plan cinématique face→dos plutôt qu'un walk cycle top-down strict — risque documenté charte §7. Utilisable pour extraire une sheet face/dos ; les 2 directions latérales restent à générer avec un prompt top-down plus contraint si l'intégration l'exige.

## Étape 5 — Vidéos d'ambiance (WAN 2.1 14B)

Réglages : `wan2.1-i2v-14b-480p-Q4_K_M.gguf` (GGUF Q4_K_M — **le fp8 e4m3fn safetensors acté n'est pas installé sur le disque** ; le GGUF Q4 est encore plus léger en VRAM sur 12 Go, même famille 14B), `umt5_xxl_fp8_e4m3fn_scaled`, `wan_2.1_vae`, `clip_vision_h`, ~20 steps, CFG 5, flow shift 7, 81 frames, prompting en **langage naturel**, caméra statique.

| Vidéo | Mode | Résultat |
|---|---|---|
| `hub_00002_.mp4` (1280×720, 5,06 s) | **i2v depuis key frame** WAI `bg-hub-ville` | **Validé** — place médiévale ensoleillée, fontaine centrale, étals, villageois, lumière chaude, stable sur les 3 frames QA |
| `marees_00001_.mp4` (1280×720, 5,06 s) | i2v depuis `bg-marees-combat` | **Validé** — temple englouti, turquoise, corail, particules, mouvement lent stable |
| `sprites_00001_.mp4` (832×480) | i2v depuis `heros-errance` | voir étape 4 (dérive cadrage notée) |

**Échec documenté** : le t2v 720p pur (`hub_00001_.mp4`, archivé en `state/hub-t2v-rejete.mp4`) produit des frames boueuses — le modèle 480p est hors distribution en 1280×720 sans image de départ. **Recommandation actée de fait : ambiances 720p toujours en i2v depuis une key frame WAI 1280×720** (stills `bg-hub-ville` / `bg-marees-combat`, seeds 2130100/2130101).

## Comptages et registres

- **271/271 prompts livrés** : 53 références + 6 fonds + 212 génériques (dont 27 série 2) + héros + 2 stills. 0 échec de mapping.
- Genres (nommées, inchangé vague 1) : **30 F / 17 M / 6 bêtes sans genre** ; génériques sans verrou individuel, contrôle visuel sur planches (pas de quota).
- Espèces : 38 espèces résolues depuis les data (human 116, fireElemental 18, shaman 12, undeadKnightF 9, phoenixFirebird 9, herald 9, beastWood/Water 9+9, mermaid 8, dryad 8, …).
- Graines vérifiées : toutes les graines de la vague 2 consignées dans `tools/seeds-v2.csv` (seeds fixes, témoins 1126001→1126006 conservés en tête) ; log détaillé dans `ComfyUI/output/out-v2/state/run-log-vague2.json` (232 entrées).

## Recommandations par lot

- **Garder** : 189 génériques, 27 série 2, héros, vidéos hub/marées i2v, retries a15/e22/f13/z19/a13.
- **Human review** (max 2 retries atteint) : z22 (figure parasite), a16 (visage sombre + mono), d6 (visage sans traits), f18 (visage ombragé). Pistes : forcer `no hood` + éclairage frontal dur pour a16/d6/f18 ; pour z22, mask/regénération de la zone basse ou seed différent (hors retry auto).
- **Relancer / ajuster** : quasi-monochrome résiduel (~15-20 %, univers sombres) → renfort `multicolored` + accent univers en positif si Marc-Olivier le demande ; cycles de marche latéraux en top-down contraint ; ambiances 720p toujours en i2v depuis still.
- Hors périmètre respecté : planche d'icônes d'équipement non produite (arbitrage Marc-Olivier en attente) ; aucune intégration dist/site ; masters 1040×1520 conservés à part.

## Fichiers

- `tools/build-prompts.mjs` (canon §15 + correctifs §14), `tools/prompts-v2.json` (271), `tools/seeds-v2.csv`
- `tools/gen-vague2.py`, `tools/gen-vague2-stills.py`, `tools/gen-vague2-video.py`
- `tools/out-v2/` : 281 JPEG (arts/fonds/stills/héros) + `masters/` + planches v2 + `video/` (3 mp4) + ce rapport
- Rien n'a touché au dist, à la série 1, ni aux 231 arts DreamShaper archivés.
