# Comparaison de modèles — DreamShaper XL vs WAI-Illustrious v17

Deuxième passe de la campagne (10/11) dans `campagne-wai/` : mêmes 231 prompts + 5 fonds + 29 références, modèle `WAI-Nsfw-Illustrious-17.safetensors`, mêmes réglages (832×1216, dpmpp_2m_sde + karras, 28 steps, CFG 6).

## Planches

- `planche-comparaison-modeles.png` : les 29 nommées côte à côte (gauche = DreamShaper XL, droite = WAI), mêmes prompts.
- `planche-s1-wai.png`, `planche-fonds-wai.png`, `planche-<univers>-wai.png` : lots WAI complets.

## Constats

| Critère | DreamShaper XL (retenu) | WAI-Illustrious v17 |
|---|---|---|
| Style | painterly semi-réaliste, conforme à la feuille de conventions | anime / carte à collectionner |
| Texte dans l'image | aucun | texte/frames générés sur de nombreuses cartes (ex. « クスゼ », « 11100 », « RIP CALM ») — **interdit** par la règle « zéro texte » |
| Silhouette en vignette 200×280 | lisible | lisible mais très chargée (cadres ornés) |
| Palettes par univers | respectées | respectées mais rendues plus sombres/contrastées |

**Conclusion** : DreamShaper XL reste le modèle de production (décision du 09/11 confirmée). Les sorties WAI servent de référence de comparaison uniquement et ne sont PAS intégrées au manifeste. Vidéos WAN 2.1 i2v générées à partir des images WAI dans `site-assets/fx-wai/` (8 vidéos, 832×480, 0,84 s, 25 fps, WebM ≤ 400 Ko).
