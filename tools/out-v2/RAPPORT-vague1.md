# Rapport — campagne v2, vague 1 (2026-11-10/11)

Checkpoint : **WAI-Illustrious v17** (seul ; NoobAI-XL écarté 6/0 au test aveugle).
Stack : ComfyUI 0.44.0 local, 832×1216 (fonds 1216×832), 28 steps, CFG 5.5, `dpmpp_2m_sde` + karras,
hires fix ×1.25 (masters 1040×1520 / fonds 1520×1040) denoise 0.4, ADetailer zone visage denoise 0.32
(masque fixe région tête, pas de détecteur installé), tags danbooru uniquement.
Budgets de fichiers v2 (charte §13) : arts **400×560 JPEG q80**, fonds **1216×832 JPEG q72**, masters PNG conservés.

## Étape 1 — build-prompts.mjs v2

- Lit `tools/species-map.json` (v1, 53 nommées + 11 familles + `humanMaturityByRarity`).
- **Échec explicite avec id de carte** pour toute carte sans entrée d'espèce (testé : p3 a fait échouer le build avant ajout de la règle biome).
- 271 prompts générés (`tools/prompts-v2.json`) : 53 références nommées + 212 génériques + 6 fonds.
- Cadrage : **full body dès UR** (UR/L/M), demi-corps C/UC/R/SR. ADN nommées embarqué (genre verrouillé 1girl/1boy,
  espèce, âge prioritaire) ; âge des génériques humaines dérivé de `humanMaturityByRarity`.
- Kenji (a15/a17) : `adult man, mature face, veteran warrior` + négatif `young, teen, boy`. f13 : ADN fireLord + négatif `knight, human, armor, humanoid`.
- `tools/seeds-v2.csv` ouvert avec les seeds témoins **1126001→1126006** + 53 seeds de refs (2126000+).

## Étape 2 — vague de génération (63 images)

| Lot | Images | Temps moyen | VRAM (RTX 5070 12 Go) |
|---|---|---|---|
| 53 références nommées | 53 | ~40 s/img | ~7,4 Go (max ~7,9 Go) |
| 6 fonds de donjons | 6 | ~25 s/img | ~7,6 Go |
| IPAdapter (4 dont 1 ref) | 4 | ~47 s/img | ~7,0 Go |

- **Échecs de mapping species : 0** (les 271 prompts ont tous résolu une espèce).
- Livrables : `tools/out-v2/` (63 `<id>.jpg` 400×560 q80 + 6 `bg-*.jpg` 1216×832 q72 + `masters/` 63 PNG 1040×1520/1520×1040).
  **Aucune intégration dist/site** (validation uniquement).
- Planches de contrôle : `tools/out-v2/planche-GLOBAL-53refs.png` + `planche-<univers>.png` (15 planches, id + genre annotés).
- **Genre global : 30 F / 17 M / 6 bestiaux sans genre** — conforme à l'arbitrage (~30/23 avec bestiaux), contrôle visuel OK, pas de quota.

## Étape 3 — verdict IPAdapter Plus (SDXL vit-h, clip_vision_h, poids 0.6 linear)

Tests : Kenji a17→a15, Yuki b1→a10 (évolution future), monstre e28→e27.

- **Mécaniquement validé** : le nœud tourne, l'identité est ancrée (même personnage lisible : armored knight pour Kenji,
  mermaid pour e27, jeune fille pour a10).
- **Mais à poids 0.6 `linear`, le rendu brûle les couleurs** (dérive psychédélique magenta/cyan sur les 3 tests).
  Recommandation : **poids 0.3-0.45, weight_type `ease in-out`, end_at 0.8-0.9** à re-tester avant d'étendre aux 53 lignées.
- Fichiers test : `a15-ipa.jpg`, `a10-ipa.jpg`, `e27-ipa.jpg` (+ `a17.jpg` ref) dans `tools/out-v2/`.

## Corrections à reporter avant la vague suivante

1. **Kenji (a15/a17)** : rendu en chevalier casqué armure bleue — le visage adulte aguerri n'est pas sorti.
   Ajouter au positif `bareheaded, visible face, skin-colored skin, beard stubble` et au négatif `helmet, full helmet, blue skin`.
2. **f13 Seigneur des Cendres** : sorti en silhouette humanoïde encapuchonnée malgré l'ADN fireLord.
   Renforcer : `colossal, bulky, beast-like, molten slag body, no humanoid proportions` + négatif `hood, slim, humanoid`.
3. **IPAdapter** : baisser le poids (voir verdict ci-dessus).
4. Graines (b1-b7) : conformes (jeunes, demi-corps, non sexualisées) — b1 validé visuellement.

## Fichiers

- `tools/build-prompts.mjs` (v2), `tools/prompts-v2.json`, `tools/seeds-v2.csv`, `tools/gen-v2.py`, `tools/planche-v2.py`
- `tools/out-v2/` : 63 arts/fonds JPEG + `masters/` + planches + `run-log.json` + ce rapport.
- Rien n'a touché aux 231 arts DreamShaper (archivés), au dist, ni à la série 1. Aucune vidéo générée.
