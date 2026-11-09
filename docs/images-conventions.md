
# Fondations Cards — Fiche de conventions images

> Feuille opérationnelle pour la génération d'images (ComfyUI). Remplie à partir du document de référence familles v3 et de la démo images. Les points marqués **(à ajuster au premier jet)** sont des hypothèses à valider sur la première série générée.

## Identité du projet

- **Nom / slug** : Fondations Cards / `fondations-cards`
- **Types d'assets** :
  - **Arts de cartes** (monstres et compagnons) : masters 400×560 px, publiés en ~200×280 px, JPEG qualité ~60.
  - **Fonds de donjons** : 448×626 px (écran d'accueil donjon + fond de combat avec voile).
  - **Vidéos de sorts signature** : ~0,8 s (20 frames à 25 fps), jamais en base64 dans le dist.
  - **Animations de boss** (salle du boss) : même format vidéo, à produire après la première série.
- **Où les fichiers sont générés** : ComfyUI sur PC (dossier de sortie : `fondations-cards/`). Convention de nommage : **id de la carte** (`e5.jpg`, `a13.jpg`, `s9.jpg`...), fonds `bg-<donjon>.jpg`, vidéos `fx-<sort>.mp4`.

## Style global (requis)

- **Art style** : fantasy digital painting, rendu semi-réaliste WAI-Illustrious (direction actée : le rendu WAI, jugé le plus attractif au test, prime sur le collage strict aux cartes existantes), rim lighting, couleurs saturées mais lisibles en petit format. Renforts painterly obligatoires dans chaque prompt : `painterly, semi-realistic, digital painting, detailed shading, intricate background`.
- **Global negative (tags danbooru pour WAI)** : `lowres, worst quality, low quality, bad anatomy, bad hands, missing fingers, extra digits, extra arms, text, error, signature, watermark, username, jpeg artifacts, blurry, cropped, multiple views, multiple girls, monochrome, greyscale, low contrast` (+ `dark, gritty` pour les cartes Lumière/Zénith).
- **Cadrage standard** : personnage portrait 3/4 (tête + buste pour C/UC, jusqu'au plein corps pour L/M), centré, fond simple légèrement texturé, marges autour du sujet (le voile dégradé et le texte se posent en bas).

## Règles spécifiques au projet (cœur de la checklist)

- **[Cohérence — cartes NOMMÉES]** Une carte nommée (Alix, Kenji, Jeanne d'Arc...) représente **la même personne sur toute sa ligne d'évolution** : même visage, même couleur de cheveux/signes distinctifs (Alix = cheveux bleus), qui évolue en contexte, posture et détail d'équipement de C à M. **Générer d'abord la rareté la plus haute (L/M) comme image de référence, verrouiller le seed, puis décliner les raretés basses en rétrogradant posture et effets.**
- **[Cohérence — cartes GÉNÉRIQUES]** Les cartes génériques (Gobelin des Marées, Cendrel...) n'exigent **aucune cohérence** entre elles : images libres, toutes différentes.
- **[Palettes par univers]**
  - Marées : bleus profonds, écume turquoise, corail.
  - Forge : braises orange, suie, métal rougi.
  - Bosquet : verts mousse, spores dorées.
  - Crypte : gris-vert, lueur de bougies, brume.
  - Zénith : or, lumière chaude, blanc ivoire.
  - Divin : ivoire, sabliers, miroirs, fils d'or.
- **[Élément]** Les effets visuels respectent l'élément de la carte : Eau, Terre, Feu, Ombre, Lumière, ou palette Divin (hors opposition).
- **[Tier bas = calme]** C/UC/R : poses sobres, arrière-plan discret, pas d'effet énergétique chargé (le voile + texte s'y posent). SR/UR : action et effets modérés. L/M : pleine action, aura, effet signature.
- **[Lisibilité 200×280]** Silhouette claire et reconnaissable, 2-3 plages de contraste, aucun détail fin en dessous de 10 % de la hauteur de carte ; le visage/point focal reste hors du quart bas (zone du voile de texte).
- **[Zéro texte]** Aucun texte, chiffre, rune-calligraphie lisible ou incrustation d'UI dans l'image. Bordures, badges et brillances sont gérés en CSS, jamais dans l'art.
- **[Personnages historiques]** Références historiques acceptées et traitées avec dignité (Jeanne d'Arc). Le Clergé du Plein Jour est représenté respectueusement, sans moquerie du religieux.

## Pipelines techniques

- **Workflow image** : générer en résolution native SDXL portrait (~832×1216 ou 1024×1408), puis downscale vers le master 400×560 px (SDXL ne produit pas de bonne qualité directement à 400×560 — petites dimensions = sujets ratés). Export JPEG qualité ~60, cible **≤ 4 Ko par carte** à l'intégration (budget total art dans le dist : 100-150 Ko) ; seed consigné par carte dans un registre à tenir à jour.
- **Modèle de génération** : **WAI-Illustrious v17** ✅ **(ACTÉ nov. 2026 — choix directeur artistique)** — retenu pour ses rendus, jugés les plus attractifs au test en aveugle (3/3 sur le sujet, poses les plus dynamiques de la comparaison). Réglages : `dpmpp_2m` + `karras`, 28 steps, CFG 5-7, prompts en tags danbooru. **Anti-dérive style (leçon du test)** : sur les prompts à fort tropisme anime (chevalière, halo, or), WAI peut basculer en cel-shading — toujours inclure des tags de renfort painterly dans le positif (`painterly, semi-realistic, digital painting, detailed shading, intricate background`) et vérifier la cohérence painterly sur les premières cartes de chaque famille avant de lancer le batch complet. Alternatives du test : DreamShaper XL (le plus proche du style des cartes existantes, langage naturel, `dpmpp_2m_sde` + karras) en secondaire ; NoobAI-XL v-pred écarté (sujet dérivant, lisibilité faible en petit format).
- **Workflow vidéo (sorts signature)** : ~0,8 s, 20 frames, 25 fps, boucle fermée, fond compatible avec un voile sombre ; format final à valider (WebM/APNG) selon le poids. **(à ajuster au premier essai)**
- **Scripts** : contact-sheet (planche de contrôle par famille) + vérificateur de poids avant intégration. À créer au moment de l'intégration.

## Règles de retry

- Jamais d'auto-retry en boucle sur une carte **nommée** : valider d'abord l'image de référence de la personne, puis décliner.
- Prioriser les défauts de **lisibilité petit format** (contraste, silhouette) sur les défauts de détail.
- Pour les fonds de donjon : réessayer seulement si la palette ne correspond pas à l'univers, pas pour la composition exacte.
