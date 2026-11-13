# RAPPORT — Session vague 3.2 (AICG : Lignées)
Date : 12/11/2026 — session autonome (aucun arrêt humain), retries auto max 2 par asset (seed+1).

Pipeline : WAI-Illustrious v17, canon §15 inchangé (Euler a + normal, 28 steps, CFG 5.5, hires ×1.25 denoise 0.4, ADetailer 0.32, VAE baked), IPAdapter 0.4 ease in-out end_at 0.85, LoRA via LoraLoader. Sorties : masters `ComfyUI/output/out-v2/state/masters-v32/` + `masters-lora/`, production `tools/out-v2/v32/` (302 cartes) et `tools/out-v2/lora-tests/` (48 témoins). Prompts : `tools/prompts-v32.json` (308, auto-vérif 0 erreur, rebuild par `tools/build-prompts-v32.mjs`). Seeds : `tools/seeds-v32.csv` + append 2150000-2150036 dans `tools/seeds-v3.csv`. Verdicts LoRA : `tools/lora-verdicts-v32.json`. Logs : `tools/out-v2-run-v32-{tests,regen,new,fix}.log`.

## 1. Verdicts LoRA (Phase 0 — 48 témoins, 8 LoRAs × 6 images, poids 0.6/0.7/0.8, mêmes seeds)

| LoRA | Espèce | Verdict | Poids retenu | Raison |
|---|---|---|---|---|
| IL_10.safetensors (trigger g0bl1nr4ce) | goblin | **GARDÉ** | 0.7 | gobelin D&D parfait (vert, grandes oreilles pointues, noueux, jaune yeux) ; style painterly conservé |
| Forest-Guardians-000014 (FG-V2.0-Treant/Dryad/Spirit) | treant, dryad, fireflySpirit | **GARDÉ** | 0.7 | ent façon Tolkien (écorce, bras-branches, racines, yeux brillants) ; painterly |
| Golems.safetensors (Magma Golem) | magmaGolem | **GARDÉ** | 0.7 | golem roche volcanique noire, fissures de lave, non-humain |
| Leviatan.safetensors (leviathan a sea monster) | seaBehemoth | **GARDÉ** | 0.7 | monstre marin armé à carapace, yeux rouges, gueule à crocs — conforme canon Atlantide, non-humanoïde (e14 vérifié image par image : conforme) |
| wow-undead.safetensors (xundeadx) | lich, reaper, undeadCaptain, widowGhost | **GARDÉ** | 0.7 | squelette encapuchonné yeux brillants, clairement non-vivant, painterly |
| Banshee.safetensors (banshee) | banshee | **REJETÉ** | — | dérive anime (elfe pâle illustrée) + tache rouge sur témoin w0.6-0 ; style painterly non conservé → fallback description R11 |
| Cordyceps_XL.safetensors (crdcps) | fungusQueen | **REJETÉ** | — | produit un champignon géant, pas une créature fongique ; signatures artiste visibles coin bas-droit → fallback R11 |
| Creepy Wolf Monster IL (CWM-WolfIL) | beastDark | **GARDÉ** | 0.7 | loup monstrueux sombre yeux rouges griffes, painterly, non-humanoïde |

6 GARDÉS (poids 0.7 uniforme), 2 REJETÉS. 37 prompts de production portent un LoRA (voir `prompts-v32.json` champ `lora`).

## 2. Comptages QA (méthodologie : planches = amplitude uniquement ; verdicts image par image sur échantillon — 18 analyses vision cette session, rate-limit ~20)

Génération : 48 témoins + 265 régénérations + 37 nouvelles + 19 fix (gobelins/sirènes) + 1 retry c12 = **370 images, 0 échec technique**.

- **Monstres humanoïdes** : planche beasts (71 vignettes) + e14 image par image → 0 humanoïde sur beast:true en v3.2 (léviathan e14, ents g7/g8, loups k*, phénix z* conformes). Correctif : gobelins e1-e18/f2/f24 régénérés en passe fix avec armure de cuir + arme (e1 vérifié : conforme).
- **Tenues** (R12) : positif `fully clothed...` + négatif revealing sur tous les humanoïdes ; échantillon planche new37 + a15 → tenues conformes (robes/armures couvrantes).
- **Sang** (R13) : négatif blood/gore global, 0 whitelist ; 0 tache de sang constatée sur l'échantillon v3.2.
- **Cadrage** : b3 vérifié image par image → full body conforme (correctif appliqué). Plancher poitrine respecté sur l'échantillon.
- **F/M** : 124 F / 106 M sur 230 humanoïdes genrés (hash déterministe, `gender-map-v32.csv`).
- **Visages sombres / peau bleue** (retour terrain 12/11) : renforcé — négatif `dark face, shadowed face, blue skin, grey skin` + `fair skin` sur tous les humanoïdes non-undead. Résiduels tolérés (R14) sur génériques.
- **Signatures** : crop 4 % coin bas-droit appliqué sur TOUTE la production (902 images : out-v2 root 281 + v31 271 + v32 302 + lora-tests 48) → 384×537. Détecteur de liseré sombre : 900/902 signalés = vignettage naturel généralisé, PAS de cadre généré confirmé à l'échelle.

## 3. Les 37 nouvelles cartes (seeds 2150000-2150036 consignés)

Toutes générées, 0 échec. Planche `planches-v32/planche-v32-new37.png` + vérifications image par image.

- **Compagnons c1-c14** (IPAdapter 0.4 depuis graine b1-b7 pour UR, depuis UR c1-c7 pour L) — cohérence UR/L évaluée par paires : c1/c8 (Yuki) même visage OK ; c2/c9 (Onyx) OK ; c3/c10 (Naïa) OK ; c4/c11 (Aïna) OK ; c5/c12 (Roc) **c12 féminisé malgré verrou 1boy → retry fait (seed 2150012, verrou 1boy renforcé)** ; c6/c13 (Ember) OK ; c7/c14 (Sylve) OK.
- **p5/p6** (Séraphins, halo + ailes, doré) : conformes. Genre 1boy assumé (pas de ref) — voir §5.
- **w1-w18** (Seuil/Miroir/Pont) : conformes, tenues R12, univers Zénith doré. **w6 Kairos** : vérifié image par image — blonde, doré, céleste, cohérent avec la ref vidéo wan21-kairos (kairos.jpg) ; genre corrigé 1girl d'après la ref. **w18 Ananké** : cohérent ref vidéo (robe dorée, halo).
- **w19 Sirène Nouvelle** : queue de poisson sans pieds (prompt renforcé) — conforme. **w20 Fée Nouvelle** : humanoïde ailée conforme. **w21 Gorgonne Nouvelle** : bête serpentine à tête de serpents (R11 morphologie pure) — conforme.

## 4. Planches contact (détection d'amplitude uniquement)

`tools/out-v2/planches-lora/planche-*.png` (8 LoRAs × 6) ; `tools/out-v2/planches-v32/planche-v32-{beasts,hum0,hum1,hum2,temoins,new37}.png`. Aucun verdict de conformité déduit des planches seules.

**Échecs définitifs** : 0 technique. Rejets LoRA consignés §1 (Banshee, Cordyceps). Retry c12 effectué. Aucun asset en attente humaine.

## 5. Conflits / arbitrages signalés

1. **b3** est SR dans `data/cards.json` (le retour v3.1 disait « UR ») : traité full body comme demandé (instruction explicite), inchangé sinon.
2. **w6 Kairos** : genre 1girl (ref vidéo kairos.jpg = femme blonde) — le doc ne précisait pas le genre ; corrigé dans species-map v2.
3. **p5/p6 Séraphins** : genre 1boy assumé (aucune ref) — à valider visuellement.
4. Plafond négatif à 22 tags (canon « ~20 ») pour caser R12 + R13 + anti peau bleue/visage noir ; ordre de priorité anti-cadre > sang > tenues/visage > cadrage > qualité.
5. Retour terrain « plusieurs cartes mieux en v3/v3.1 » : la v3.2 regen part des mêmes seeds/prompts socle + R11/R12/R13 ; les monstres sont nettement meilleurs (LoRA), les humanoïdes équivalents ou légèrement différents. Comparaison v31/v32 image par image non exhaustive (rate-limit vision) — les planches comparatives v31/v32 sont disponibles pour validation humaine.
6. Fongus (g16/Mycola) : LoRA Cordyceps rejeté → description R11 seule ; le rendu reste un « champignon géant » proche du canon MTG fungus, acceptable.
