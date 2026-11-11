# RAPPORT VAGUE 3 — AICG : Lignées (11/11/2026)

Doc maîtresse : `docs/images/correction-prompts-v3.md` (règles R1-R7). Checkpoint WAI-Illustrious v17, réglages canon §15 inchangés (Euler a + normal, 28 steps, CFG 5.5, hires ×1.25 denoise 0.4, ADetailer visage 0.32, VAE baked).

## 1. Diagnostic style (en tête, critère bloquant)

Retour au **langage naturel painterly** (R1-R7) : plus aucun tag danbooru dans les positifs v3. Constat QA vision sur les planches `tools/out-v2/v3/planche-v3-*.png` :

- Style painterly **conforme à la spec v3**, homogène sur tous les lots (témoins, refs, génériques, série 2). Aucun cadre/bordure « carte » (R2 OK — visible sur le comparatif a15 : v2 avait des bordures, v3 non).
- Pas de dérive 2.5D/painterly involontaire à signaler : la v3 est volontairement painterly NL, la dérive v17 constatée en vague 2 ne s'applique pas ici.
- Négatifs courts : max 20 tags, conforme (≤20 imposé).

**Témoins (planche-v3-temoin.png)** :

| Témoin | Résultat |
|---|---|
| e14 | OK — titan bestial colossal, bleu, lisible |
| a15 | OK — masculin, tête nue, armure (1boy verrouillé) |
| z19 | OK — vrai oiseau de feu, aucune figure humaine |
| f18 | OK — visage dégagé, éclairage frontal, halo de feu |
| g16 | OK — aucune signature artiste |
| d6 | **ÉCHEC PERSISTANT** — visage toujours sous capuche malgré le correctif ; human review |

## 2. Bilan chiffré

- **271 prompts** (`tools/prompts-v3.json`) : 53 références nommées + 6 fonds + 212 génériques. Auto-vérification build-prompts-v3 : 0 erreur (0 fragment de nom FR — 5 alertes contrôlées = faux positifs de sous-chaînes anglaises : spores/mage/forge/ange ; 0 « card » dans les positifs ; cadrage conforme à la rareté ; négatif ≤20 tags).
- **274 images livrées** dans `tools/out-v2/v3/` (271 + héros d'errance + 2 stills), ~34-40 s/img, VRAM ~7,6 Go. Masters 1040×1520 conservés à part (`ComfyUI/output/out-v2/state/masters-v3/`), budgets §13 appliqués à la conversion.
- **Graines** : identiques à `seeds-v2.csv` pour les 265 cartes communes (0 mismatch). Écarts documentés : q6/t6/u6/v6 (sommets série 2) réutilisés depuis la v2 (« skip déjà fait » — seeds v2 effectifs) ; les 4 fonds bg-forge/bosquet/crypte/zenith/divin ont leurs seeds propres (2126101-2126105), hors csv v2.
- **Genres/espèces** (265 persos hors fonds) : ~116 humains (dont 101 génériques humaines avec aged up par rareté), 9 phénix `phoenixFirebird` (z19, z22 + 7 génériques z*, jamais de figure humaine), répartition par univers conforme aux planches. 0 échec de mapping espèce.

## 3. Comparatif canon avant/après (planche-v3-comparatif.png)

- **a15** : origine = carte avec bordures ; v2 = bordures carte ; **v3 = armure painterly sans cadre**, masculin — conforme R2.
- **f18** : origine/v2 = figure sombre cadrée ; **v3 = visage dégagé, halo frontal** — correctif §14 tenu.
- **z19** : origine/v2 = phénix ; **v3 = oiseau de feu seul sur rocher**, mapping phénix maintenu.

## 4. Vidéos WAN 2.1 14B (fp8 e4m3fn, ~20 steps, CFG 3-6, flow shift ~7, prompting naturel)

| Vidéo | Réglage | Durée rendu | Fichier | QA frame f40 |
|---|---|---|---|---|
| Hub-ville | i2v 1280×720×81f depuis still bg-hub-ville, seed 2130001 | 4519 s | `tools/out-v2/video/hub_00003_.mp4` (5,7 Mo) | OK — place ensoleillée, fontaine centrale, étals, lumière chaude (DA validée) |
| Marées | i2v 1280×720×81f depuis still bg-marees-combat, seed 2130002 | 4509 s | `tools/out-v2/video/marees_00002_.mp4` (10,3 Mo) | OK — houle turquoise, ambiance combat Marées |
| Sprites héros | i2v 832×480×81f, static camera, seed 2130010 | ~20 min | `tools/out-v2/video/sprites_00002_.mp4` (3,0 Mo) | OK — dos du héros, cheveux blancs, cape noire |

Frames de contrôle extraites dans `tools/out-v2/video/frames-v3/` (début/milieu/fin par vidéo).

## 5. Recommandations par lot

| Lot | Recommandation |
|---|---|
| 6 témoins | **garder** 5/6 ; **retry** d6 (visage capuche persistant, max 2 retries puis human review) |
| 53 refs + 6 fonds | **garder** |
| 212 génériques | **garder** |
| Série 2 (27, IPAdapter 0.4 ease in-out end 0.85) | **garder** — cohérence de lignée constatée |
| Héros d'errance + stills | **garder** |
| Vidéos (hub / marées / sprites) | **garder** |
| Relances | aucune |

Hors périmètre respecté : pas de planche d'icônes, aucune intégration dist/site, masters conservés à part. Rien n'a été commité.
