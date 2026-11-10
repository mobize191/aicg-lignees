# Fondations Cards — feuille de conventions projet

> Projet : AICG : Lignées (repo `mobize191/aicg-lignees`). Feuille opérationnelle pour la génération d'images (ComfyUI, DreamShaper XL) et de vidéos (WAN 2.2 5B). Plan d'exécution : `docs/images/plan-comfyui-images-videos.md` ; prompts opérationnels : `tools/serie1-prompts.json` (29 références + 5 fonds) et `prompts-draft.json` (231 cartes, produit par `tools/build-prompts.mjs`).
>
> Historique : le rendu WAI-Illustrious v17 (testé en aveugle nov. 2026, le plus attractif du test) est remplacé par **DreamShaper XL** (décision de Marc-Olivier du 09/11) : prompts recoordonnés en langage naturel, plus proche du style des cartes existantes. L'ancien brief WAI (`docs/images/images-prompt-serie1.md`) reste la référence descriptive des personnages.

## Project identity

- **Name / slug** : AICG : Lignées / `fondations-cards`
- **Asset types** : arts de cartes (monstres et compagnons, master 400×560, intégration 300×420 JPEG) ; fonds de donjons (960×540 JPEG) ; vidéos de sorts signature (~0,8 s, 20 frames à 25 fps, boucle fermée, WebM) ; animations de boss (après la première série)
- **Where files are generated** : ComfyUI sur PC, checkpoint **DreamShaper XL**, sortie `out/` (batch via `tools/comfy-batch.mjs` sur l'API HTTP `http://127.0.0.1:8188`, ou pilotage par le MCP ComfyUI). Convention de nommage : id de la carte (`e5.jpg`, `a13.jpg`...), fonds `bg-<donjon>.jpg`, vidéos `fx-<sort>.webm`, références v3 par slug (`meliane.jpg`).

## Global style (required)

- **Art style** : fantasy digital painting semi-réaliste, painterly. Phrase de style incluse dans chaque prompt positif : `Painted in a painterly, semi-realistic fantasy card game illustration style, detailed shading, intricate background, epic fantasy trading card game artwork, rim lighting.` DreamShaper XL travaille en **langage naturel** : phrases descriptives courtes, pas de listes de tags danbooru.
- **Global negative** : `low quality, worst quality, blurry, bad anatomy, bad hands, missing fingers, extra digits, extra arms, text, letters, numbers, watermark, signature, username, error, jpeg artifacts, cropped, multiple views, monochrome, greyscale, low contrast, flat cel shading, anime screencap` (+ `dark, gritty` pour Lumière/Zénith ; + `people, creatures, humans` pour les fonds).
- **Standard background / framing** : personnage en portrait 3/4 centré, tête et épaules pour C/UC, corps entier de R à M ; fond simple légèrement texturé pour les tiers bas ; marges autour du sujet (le voile dégradé et le texte se posent en bas, le point focal reste hors du quart bas).

## Project-specific rules (core of the checklist)

- **[Cohérence — nommées]** une carte nommée (Kenji, Méliane, Apolline...) représente la même personne sur toute sa ligne : générer d'abord la rareté la plus haute comme image de référence, verrouiller le seed (registre `seeds.csv`), puis décliner les raretés basses en rétrogradant posture et effets. Jamais d'auto-retry en boucle : corriger le prompt.
- **[Cohérence — génériques]** les monstres génériques n'exigent aucune cohérence entre eux : images libres, toutes différentes.
- **[Palettes par univers]** Marées : deep blue and turquoise, sea foam, coral. Forge : ember orange, soot black, glowing red metal. Bosquet : moss green, golden spores, giant mushrooms. Crypte : grey green, candlelight, cold mist. Zénith : warm gold, ivory, radiant light. Divin : ivory, hourglasses, mirrors, golden threads.
- **[Élément]** les effets respectent l'élément de la carte : Eau, Terre, Feu, Ombre, Lumière, ou palette Divin (hors opposition).
- **[Tier bas = calme]** C/UC/R : poses sobres, arrière-plan discret, pas d'effet chargé. SR/UR : action et effets modérés. L/M : pleine action, aura, effet signature.
- **[Lisibilité 200×280]** silhouette claire, 2-3 plages de contraste, aucun détail fin sous 10 % de la hauteur de carte ; vérifier sur la planche de contrôle en vignette.
- **[Zéro texte]** aucun texte, chiffre ou incrustation dans l'image ; bordures et badges gérés en CSS.
- **[Personnages historiques]** références traitées avec dignité (Jeanne d'Arc), sans moquerie du religieux.

## Technical pipelines

- **Image workflow** : DreamShaper XL (checkpoint dans `ComfyUI/models/checkpoints/`, nom exact via `COMFY_MODEL`), sampler `dpmpp_2m_sde` + `karras`, 28 steps, CFG 5-7 (6 par défaut), génération **832×1216** portrait (fonds **1216×832**), puis `tools/make-assets.py` : crop central 5:7 → master 400×560, intégration 300×420 JPEG ≤ 30 Ko (fonds : crop 16:9 → 960×540 ≤ 110 Ko), manifeste `assets.json` (base64, ASCII pur, cible ≤ 8 Mo). Seed consigné par image dans `seeds.csv`.
- **Video workflow** : WAN 2.2 5B (template natif ComfyUI), 20 frames, 25 fps, 832×480, boucle fermée (crossfade ffmpeg), export WebM VP9 ≤ 400 Ko ; jamais en base64 dans le dist (stockées dans `site-assets/fx/`).
- **Scripts** : `tools/extract-cards.mjs` (catalogue depuis le dist via le harnas), `tools/build-prompts.mjs` (231 prompts langage naturel), `tools/comfy-batch.mjs` (batch API + registre des seeds), `tools/make-assets.py` (crop/compression/manifeste), `tools/contact-sheet.py` (planches de contrôle).

## Project-specific retry rules

- Jamais d'auto-retry en boucle sur une carte nommée : valider la référence, puis décliner.
- Prioriser les défauts de lisibilité petit format (contraste, silhouette) sur les défauts de détail.
- Fonds de donjons : réessayer seulement si la palette ne correspond pas à l'univers, pas pour la composition exacte.
