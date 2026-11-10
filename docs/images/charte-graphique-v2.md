# Charte graphique v2 — personnages, environnements, déco (PROPOSITION)

> Statut : **PROPOSÉ** (10/11/2026), issu de la session design avec Marc-Olivier. Ne remplace pas encore `docs/images/images-conventions.md` : à faire entrer dans `docs/arbitrages.md` puis à acter après la campagne de validation. La feuille v1 reste la référence de production tant que la v2 n'est pas validée.

## 1. Direction artistique (ACTÉE par Marc-Olivier)

**Anime premium "assaini"** : l'esthétique WAI-Illustrious (contours nets, contraste élevé, finition carte premium) mais zéro artefact interdit, cadrage plus large, rendu éclairci (le rendu WAI v1 était trop sombre).

- **Rendu** : anime illustré haute qualité, contours nets, rim lighting, arrière-plan détaillé mais non concurrentiel.
- **Cadrage par défaut** : **demi-corps (tête → hanches/genoux)** pour tous les tiers ; **full body** pour les tiers hauts et les références v3. Jamais de plan visage/buste où la tête domine : tête ≤ ~25-30 % de la hauteur du cadre, épaules + torse + attribut visibles.
- **Netteté du visage** : garantie par **ADetailer** (face + hands) + hires fix ×1.25-1.5, pas par un cadrage serré. Négatif anti-close-up : `close-up, portrait, face only, headshot`.
- **Zéro texte, zéro cadre** : négatif dédié (`text, letters, numbers, watermark, signature, logo, frame, border, card frame, ornament, japanese text, chinese text, title, caption`), tout badge/cadre = CSS.
- **Lisibilité 200×280** : 2-3 plages de contraste, silhouette claire (règle v1 conservée).
- **Palettes** : les 6 palettes par univers conservées (Marées, Forge, Bosquet, Crypte, Zénith, Divin) ; ajouter au positif `bright, soft ambient light`, au négatif `dark, muddy colors` (sauf univers sombres voulus).

## 2. Cohérence des nommées (prioritaire)

Une carte nommée reste **le même personnage** sur toute sa lignée d'évolution, même si tenue, décor et effets changent.

- **Bloc ADN verrouillé** : `character_dna` (cheveux, yeux, traits distinctifs, silhouette, âge apparent) recopié à l'identique dans toutes les raretés ; champ séparé dans `serie1-prompts.json`, jamais dilué dans le prompt libre.
- **Image de référence obligatoire** : rareté la plus haute générée d'abord (règle v1), puis réinjection via **IPAdapter Plus (SDXL)** poids 0.5-0.7 pour chaque rareté basse.
- **Mini-LoRA par personnage** (8-15 images, entraînement local rapide) : réservé aux héros majeurs à lignes longue. Liste à établir.
- **Monstres évoluants** : même règle ; ADN (crâne, yeux, silhouette, motif de peau) figé, seuls taille/membres/aura évoluent.
- **Contrôle qualité** : planche de contrôle par colonne de personnage ; rejet de toute itération où l'identité dérive.

## 3. Espèces et genres — verrous de génération (retour terrain 10/11, PRIORITAIRE)

Problèmes constatés : espèce déduite du nom → dérive au sein d'une famille (gobelin, puis humains, puis gobelin) ; « Bestiau d'eau » a donné une catgirl ; WAI tire massivement féminin.

1. **L'espèce vient des data, jamais du nom** : bloc `species` obligatoire par carte, dérivé de `data/` + document Familles et races v3. Mapping famille/espèce → tags danbooru dans `tools/species-map.json` ; `build-prompts.mjs` refuse une carte sans entrée (échec explicite).
2. **Bestiau = une vraie bête** : tags `beast, monstrous, claws, fangs, fur/scales` + négatif `catgirl, human, girl, elf, cute animal ears`. Objectif : l'espèce se lit en un coup d'œil, pas "effrayant".
3. **Genre : une seule identité par carte**, `1girl`/`1boy` verrouillé dans l'ADN. Variantes F/M aléatoires ÉCARTÉES (arts ×2, cohérence cassée).
4. **Équilibre par campagne (~50/50)** : registre dans `seeds.csv`, ratio vérifié sur la planche de contrôle.
5. **Fées, divines, esprits** : tags explicites par famille + âge apparent cohérent ; divines gardent le traitement digne des conventions v1.

## 4. Stack technique ComfyUI

- **Checkpoint** : famille Illustrious-XL (WAI-Illustrious v17 en main) ; alternatives au test aveugle : NoobAI-XL ou finetune "clean".
- **Prompting en tags danbooru** (les Illustrious n'aiment pas le langage naturel de DreamShaper) → re-générer les 231 prompts de `tools/build-prompts.mjs`.
- Samplers conservés : dpmpp_2m_sde + karras, 28 steps, CFG 5-6 (tester 4-5 si le rendu "brûle").
- Génération 832×1216 portrait (fonds 1216×832), hires fix, ADetailer, IPAdapter pour les nommées.

## 5. Environnements (fonds de donjons)

Pipeline v1 conservé (1216×832, mêmes palettes, négatif `people, creatures, humans`), réaligné sur le style v2 (tags, `scenery, no humans, detailed background`). Pas de refonte de composition : les fonds actuels sont le point le plus sain de la charte v1.

## 6. Déco du jeu — hub-ville et menus (décisions TRANCHÉES, chantier non codé)

- **Principe** : chaque écran a un décor vrai + voile de lisibilité calibré ; panneaux semi-transparents au-dessus au lieu de blocs noirs.
- **Phasage** : images partout d'abord ; vidéos d'ambiance ensuite, limitées à **Accueil + Combat** (WAN 2.2 5B ou 2.1 14B selon l'écran). Jamais de vidéo en base64 dans le dist.
- **Fonds** : 1 fond-monde + key art d'accueil à générer en style v2 ; les 5 `bg-*` de donjons réutilisés pour Donjons/Forge/Combat.
- **Voile variable** : visible à l'Accueil, fort en Combat, intermédiaire ailleurs. Mobile : cover + focal-point CSS (une image par fond).
- **Accueil-ville (hub)** : fond vivant (ville médiévale fantastique, ambiance animée), menu latéral droit, bouton défi du jour, transitions animées entre écrans, personnage de référence interactif par écran (clic → bulle de dialogue, répliques en data JSON), bouton retour sur chaque page.
- **Navigation restructurée** : **Les Terres Sauvages** (Donjons + Errance fusionnés, gros bouton, pop-up si équipe vide) ; **La Guilde** (ex-Forge : évolutions + recrutement) ; page **Personnage** (Équipe + Inventaire en onglets) ; **Boutique** (acheter/vendre des éclats, économie à définir) ; **Paramètres** en pop-up.
- **Contrainte : la limite d'1 Mo du dist est LEVÉE** ; la vraie contrainte est la **fluidité** (une seule vidéo décodée à la fois, pause/déchargement hors écran, pas de backdrop-filter empilé sur vidéo, `prefers-reduced-motion` → image fixe, test bas de gamme).

## 7. Errance top-down — quoi générer, quoi garder procédural

Guide technique : `docs/design/errance-topdown.md`. Découpage :

- **Procédural conservé** : sols, chemins, étangs, micro-détails (reproductible par seed, perf maîtrisée) et toutes les ambiances animées (fumée, lucioles, reflets, nuages). Pas de vidéo plein écran en top-down.
- **Sprites IA (style v2)** : objets interactifs par univers (coffre, jarre, autel, rocher, herbe récoltable ≈ 25 générations), fond uni → retrait d'arrière-plan → PNG transparent, ombre portée peinte par le canvas ; héros + PNJ : art de référence v2 → cycle de marche WAN i2v (2.1 14B conseillé) → extraction de 6-8 frames → sprite sheet ; dos généré séparément via IPAdapter.
- **Jalons** : J1 zone témoin complète (Marées) validée en perf et visuel ; J2 arbitrage arbres/maisons (procédural vs sprites IA) ; J3 généralisation. Risque à tester : dérive de silhouette de WAN sur un cycle complet.

## 8. Points ouverts (bloquants avant génération)

1. **Checkpoint final** : WAI v17 vs NoobAI-XL vs autre finetune — test aveugle (5 cartes témoins + 1 fond).
2. **Tier de bascule full body** (R ? SR seulement ?).
3. **Liste des nommées** qui méritent un mini-LoRA ; validation de la méthode IPAdapter.
4. **Tableau genre + espèce des 29 nommées** à remplir (avec `tools/species-map.json` à créer depuis les data).
5. **Vidéos FX** : alimentées par les arts v1 ou régénérées en v2 ?
6. **Sort des 231 arts DreamShaper XL** : repli ou archivage de la campagne v1.
7. Déco : vidéo vs parallaxe par écran ; WAN 5B vs 14B ; économie de la Boutique ; intérieur des Terres Sauvages (raccord donjons/errance) ; qui est le héros de l'errance (avatar joueur ou carte de l'équipe).

## 9. Impact sur les scripts

| Fichier | Changement |
|---|---|
| `tools/build-prompts.mjs` | 231 prompts en tags danbooru + cadrage + anti-texte + `character_dna` + `species` obligatoire (échec sans mapping) |
| `tools/species-map.json` | NOUVEAU : mapping famille/espèce → tags |
| `tools/serie1-prompts.json` | 29 références + 5 fonds, avec ADN et espèce explicités |
| `tools/comfy-batch.mjs` | hires fix + ADetailer + IPAdapter, checkpoint configurable |
| `seeds.csv` | registre v2 (seeds v1 obsolètes au changement de checkpoint) + genre par carte |
| `docs/images/images-conventions.md` | réécriture après validation (ce document devient la référence) |
