
# Fondations Cards — Prompt de génération d'images (série 1)

Série 1 = **29 cartes prioritaires + 5 fonds de donjons**, d'après la fiche de conventions (WAI-Illustrious v17). Ce sont les images RÉFÉRENCE : chaque carte nommée ci-dessous devient l'identité verrouillée de sa personne (les raretés basses seront déclinées plus tard à partir de ces arts et de leurs seeds). Les prompts sont en tags danbooru, prêts à copier dans ComfyUI.

## Réglages globaux (chaque image)

- **Modèle** : WAI-Illustrious v17 ; **sampler** : `dpmpp_2m` + `karras` ; **steps** : 28 ; **CFG** : 5-7.
- **Résolution de génération** : 832×1216 (portrait SDXL), puis downscale vers le master 400×560.
- **Export** : JPEG qualité ~60, cible ≤ 4 Ko par carte ; **consigner le seed de chaque image retenue** dans un registre.
- **Fichiers** : nommage par slug pour l'instant (`meliane.jpg`, `bg-marees.jpg`...), renommage vers l'id de carte (`e15.jpg`, `a38.jpg`...) au moment de l'intégration du contenu.
- **BASE positive** (à SUBSTITUER au jeton `BASE` en tête de chaque prompt ci-dessous) : `masterpiece, best quality, painterly, semi-realistic, digital painting, detailed shading, intricate background`
- **BASE négative** (pour toutes) : `lowres, worst quality, low quality, bad anatomy, bad hands, missing fingers, extra digits, extra arms, text, error, signature, watermark, username, jpeg artifacts, blurry, cropped, multiple views, multiple girls, monochrome, greyscale, low contrast`
- **Négatif RENFORT pour les cartes Lumière/Zénith** : ajouter `dark, gritty` à la base négative.

## Ordre de génération (important)

1. **Étape test (6 images)** : une carte par univers (`titan-marees`, `seigneur-cendres`, `coeur-bosquet`, `la-mort`, `astre-capiteux`, `kairos`) pour valider le rendu painterly de WAI. **Vérifier la dérive cel-shading avant de lancer le reste** (leçons de la fiche). Ajuster CFG/renforts si besoin.
2. **Les 5 fonds de donjons** (`bg-*.jpg`).
3. **Le reste du batch**, univers par univers (Marées → Forge → Bosquet → Crypte → Zénith → Divins).

Les genres et détails d'apparence (cheveux, armure) de chaque nommée sont des propositions : au premier jet, corriger le prompt plutôt que retry en boucle. Une image nommée retenue = référence verrouillée, seed noté.

## Marées (bleus profonds, écume turquoise, corail)

**titan-marees.jpg** (M · Eau)
- Positive : `BASE, colossal sea titan, muscular giant, long white beard, coral and barnacle armor, glowing turquoise eyes, holding trident, stormy ocean, crashing waves, sunken ruins, deep blue and turquoise palette, coral accents, rim lighting, epic scale, full body`
- Négative : base

**leviathan.jpg** (L · Eau · laser)
- Positive : `BASE, colossal leviathan sea serpent, gaping maw, glowing laser beam breath, churning dark ocean, bioluminescent turquoise glow, deep blue palette, epic scale, dramatic lighting, full body`
- Négative : base

**meliane.jpg** (L · Sirène, voie du Chant · Eau) — RÉFÉRENCE de Méliane
- Positive : `BASE, 1girl, mermaid siren, long flowing teal hair, singing, glowing musical magic swirls, hypnotic aura, shipwreck in background, coral jewelry, deep blue and turquoise palette, dynamic pose, full body`
- Négative : base

**thalassa.jpg** (L · Sirène, voie des Récifs · Eau) — RÉFÉRENCE de Thalassa
- Positive : `BASE, 1girl, mermaid siren warrior, coral reef armor, holding coral spear, aggressive stance, reef spikes, turquoise water, coral orange accents, dynamic action pose, full body`
- Négative : base

**zikka.jpg** (L · Zikka, Chaman des Écumes · Eau) — RÉFÉRENCE de Zikka
- Positive : `BASE, 1girl, goblin shaman, green skin, seaweed robes, staff with glowing pearl, tide magic, sea foam swirls, deep blue and turquoise palette, dynamic pose, full body`
- Négative : base

**griknir.jpg** (L · Griknir, Roi des Écumes · cri de guerre · Eau) — RÉFÉRENCE de Griknir
- Positive : `BASE, 1boy, goblin king, green skin, driftwood crown and armor, raising axe, war cry, commanding presence, stormy sea background, deep blue palette, dynamic pose, full body`
- Négative : base

**bg-marees.jpg** (fond 448×626)
- Positive : `BASE, no humans, scenery, underwater sunken temple ruins, shafts of filtered light, coral reef, drifting sea foam, deep blue and turquoise palette, atmospheric, empty foreground`
- Négative : base

## Forge (braises orange, suie, métal rougi)

**seigneur-cendres.jpg** (M · Feu)
- Positive : `BASE, colossal fire lord, molten slag armor, crown of embers, ember particles, cracked lava ground, orange and soot black palette, glowing red metal, rim lighting, epic scale, full body`
- Négative : base

**vulcain.jpg** (L · Vulcain, Colosse Ardent · Feu) — RÉFÉRENCE de Vulcain
- Positive : `BASE, colossal molten golem, glowing lava cracks, heavy fists, ember particles, ruined foundry, soot and ember orange palette, dramatic lighting, dynamic action pose, full body`
- Négative : base

**calcine.jpg** (L · Calcine, Dame des Cendres · Feu) — RÉFÉRENCE de Calcine
- Positive : `BASE, 1girl, ash empress, grey skin with glowing ember veins, gown of falling ash, ember particles, soot black palette with orange glow, elegant powerful pose, full body`
- Négative : base

**ombeline.jpg** (L · Ombeline, Tisseuse de Suie · Ombre) — RÉFÉRENCE d'Ombeline
- Positive : `BASE, 1girl, soot weaver, dark tattered robes, weaving threads of smoke, shadow magic, faint ember glow, soot black palette with orange highlights, mysterious, dynamic pose, full body`
- Négative : base

**gardien-foyers.jpg** (L · Gardien des Foyers · invocation · Feu)
- Positive : `BASE, 1boy, forge guardian, heavy blacksmith apron, commanding small flame elementals, multiple fire spirits, furnace ruins, ember orange palette, dynamic pose, full body`
- Négative : base

**bg-forge.jpg** (fond 448×626)
- Positive : `BASE, no humans, scenery, volcanic forge interior, lava cracks in dark stone, glowing molten metal, floating embers, soot black and ember orange palette, atmospheric, empty foreground`
- Négative : base

## Bosquet (verts mousse, spores dorées)

**coeur-bosquet.jpg** (M · Terre)
- Positive : `BASE, colossal forest heart spirit, giant tree guardian, glowing green heart core, moss and mushrooms, golden spores, moss green palette, warm rim lighting, epic scale, full body`
- Négative : base

**patriarche-bosquet.jpg** (L · invocation et résurrection · Terre)
- Positive : `BASE, ancient treant sage, mossy bark skin, lichen beard, living wood staff, summoning vines, golden spores, moss green palette, wise powerful pose, full body`
- Négative : base

**mycola.jpg** (L · Mycola, Reine des Spores · Terre) — RÉFÉRENCE de Mycola
- Positive : `BASE, 1girl, mushroom queen, mushroom crown, mycelium gown, cloud of glowing golden spores, giant mushrooms background, moss green and gold palette, dynamic pose, full body`
- Négative : base

**adriel.jpg** (L · Adriel, Lumignole des Clairières · Lumière) — RÉFÉRENCE d'Adriel
- Positive : `BASE, 1girl, glowing forest spirit maiden, radiant soft light, fireflies, golden sunlight through leaves, moss green and warm gold palette, serene powerful pose, full body`
- Négative : base + `dark, gritty`

**vesna.jpg** (L · Vesna, Dryade du Sous-Bois · Ombre) — RÉFÉRENCE de Vesna
- Positive : `BASE, 1girl, dark dryad, shadowy bark skin, venomous flowers, lurking in underbrush, dark moss green palette, cold rim light, mysterious dynamic pose, full body`
- Négative : base

**bg-bosquet.jpg** (fond 448×626)
- Positive : `BASE, no humans, scenery, enchanted forest glade, giant glowing mushrooms, floating golden spores, light rays through canopy, moss green palette, atmospheric, empty foreground`
- Négative : base

## Crypte (gris-vert, bougies, linceuls, brume froide)

**la-mort.jpg** (M · La Mort, Faucheuse des Tombes · Ombre)
- Positive : `BASE, 1girl, elegant death reaper, hooded veil, glowing scythe, tattered shroud, ghostly wisps, candlelight, grey green palette, cold mist, imposing full body`
- Négative : base

**archiliche.jpg** (L · Archiliche des Caveaux · Ombre)
- Positive : `BASE, 1boy, archlich, skeletal mage, ornate dark robes, floating grimoire, necromantic green flames, crypt sarcophagi, grey green palette, dynamic casting pose, full body`
- Négative : base

**ahab.jpg** (L · Ahab, Lord des Naufragés · Ombre) — RÉFÉRENCE d'Ahab
- Positive : `BASE, 1boy, drowned ghost captain, barnacle crown, rusted harpoon, wraiths of drowned sailors behind, stagnant water, grey green palette, cold mist, commanding pose, full body`
- Négative : base

**jeanne-darc.jpg** (L · Jeanne d'Arc, Chevalière de la Veille · Lumière) — RÉFÉRENCE de Jeanne (risque de dérive anime : renforts painterly déjà dans BASE)
- Positive : `BASE, 1girl, armored knight maiden, silver plate armor, holding banner, divine golden light halo, candlelit crypt background, grey green palette with holy gold light, heroic pose, full body`
- Négative : base + `dark, gritty`

**siegfried.jpg** (L · Siegfried, Chevalière du Serment Brisé · Ombre) — RÉFÉRENCE de Siegfried
- Positive : `BASE, 1girl, knight, blackened broken armor, torn cape, ghostly pale skin, faint spectral glow, candlelight, grey green palette, dramatic pose, full body`
- Négative : base

**bg-crypte.jpg** (fond 448×626)
- Positive : `BASE, no humans, scenery, flooded crypt interior, candle lit sarcophagi, stagnant green water, cold mist, tattered shrouds, grey green palette, atmospheric, empty foreground`
- Négative : base

## Zénith (or, lumière chaude, blanc ivoire)

**astre-capiteux.jpg** (M · Lumière/Feu)
- Positive : `BASE, radiant celestial lord, crown of sun, golden armor, solar flare wings, warm gold and ivory palette, luminous sky, rim lighting, epic scale, full body`
- Négative : base + `dark, gritty`

**apolline.jpg** (M · Apolline, Prophétesse du Jour · Lumière) — RÉFÉRENCE d'Apolline
- Positive : `BASE, 1girl, high prophetess, flowing sun vestments, golden halo, holy light rays, warm gold and ivory palette, commanding serene pose, full body`
- Négative : base + `dark, gritty`

**pyrrha.jpg** (L · Pyrrha, Cendre Éternelle · résurrection · Feu) — RÉFÉRENCE de Pyrrha
- Positive : `BASE, 1girl, eternal phoenix maiden, rising from ashes, flame wings, rebirth fire swirl, ember and gold palette, warm light, dynamic rising pose, full body`
- Négative : base + `dark, gritty`

**fjalar.jpg** (L · Fjalar, Phénix du Renvoi · renvoi · Feu) — RÉFÉRENCE de Fjalar
- Positive : `BASE, 1boy, phoenix warrior, blazing feathered cloak, wings of fire, deflecting fire shield, ember and gold palette, warm light, dynamic action pose, full body`
- Négative : base + `dark, gritty`

**heraut-zenith.jpg** (L · Héraut du Zénith · Lumière)
- Positive : `BASE, 1boy, celestial herald, winged messenger, golden trumpet, radiant light rays, ivory and gold palette, clear sky background, dynamic flying pose, full body`
- Négative : base + `dark, gritty`

**bg-zenith.jpg** (fond 448×626)
- Positive : `BASE, no humans, scenery, celestial sky sanctuary, golden clouds, warm sunlight, ivory and gold palette, atmospheric, empty foreground`
- Négative : base + `dark, gritty`

## Divins (ivoire, sabliers, miroirs, fils d'or)

**kairos.jpg** (L · Kairos, Arbitre du Seuil · stun et temps)
- Positive : `BASE, 1girl, time arbiter, ivory robes, golden hourglass, floating clock fragments, frozen time magic, mirror shards, ivory and gold palette, imposing pose, full body`
- Négative : base

**echo.jpg** (L · Écho, Voix Miroir · copie de sorts)
- Positive : `BASE, 1girl, mirror choir maiden, half mirror mask, choir robes, reflected silhouettes in mirror shards, ivory and gold palette, ethereal, mysterious pose, full body`
- Négative : base

**ananke.jpg** (L · Ananké, Tisseuse du Pont · liens)
- Positive : `BASE, 1girl, fate weaver, weaving golden threads between floating mirrors, ivory robes, luminous gold thread magic, ivory and gold palette, elegant dynamic pose, full body`
- Négative : base

## Vidéos (WAN 2.2 5B, après la série 1)

À lancer quand la série 1 est validée : ~0,8 s (20 frames, 25 fps), boucle fermée, fond compatible avec un voile sombre, format final à valider (WebM/APNG) selon le poids. Les sorts signature des L/M ci-dessus (laser du Léviathan, cri de Griknir, faux de la Mort, renaissance de Pyrrha, sablier de Kairos...) seront les premiers prompts vidéo, rédigés au tour contenu. Jamais en base64 dans le dist.

## Pendant la génération (rappels de la fiche)

- Jamais d'auto-retry en boucle sur une nommée : corriger le prompt, retenir la meilleure, verrouiller le seed.
- Prioriser lisibilité petit format (contraste, silhouette) sur le détail.
- Fonds : réessayer seulement si la palette ne correspond pas à l'univers.
- Noter pour chaque image retenue : fichier, seed, prompt final éventuellement corrigé (registre à me transmettre pour les déclinaisons futures).
