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
- **Âge apparent par palier de rareté** (retour du test checkpoint 10/11) : pour toute nommée évolutive, le bloc `character_dna` fixe un âge apparent **par palier** (graine = jeune → chaque évolution = plus mature/plus grande), pour que la maturation fasse partie de la cohérence de lignée. Sans âge explicite, WAI tire vers le jeune.
- **Contrôle qualité** : planche de contrôle par colonne de personnage ; rejet de toute itération où l'identité dérive.

## 3. Espèces et genres — verrous de génération (retour terrain 10/11, PRIORITAIRE)

Problèmes constatés : espèce déduite du nom → dérive au sein d'une famille (gobelin, puis humains, puis gobelin) ; « Bestiau d'eau » a donné une catgirl ; WAI tire massivement féminin.

1. **L'espèce vient des data, jamais du nom** : bloc `species` obligatoire par carte, dérivé de `data/` + document Familles et races v3. Mapping famille/espèce → tags danbooru dans `tools/species-map.json` ; `build-prompts.mjs` refuse une carte sans entrée (échec explicite).
2. **Bestiau = une vraie bête** : tags `beast, monstrous, claws, fangs, fur/scales` + négatif `catgirl, human, girl, elf, cute animal ears`. Objectif : l'espèce se lit en un coup d'œil, pas "effrayant".
3. **Genre : une seule identité par carte**, `1girl`/`1boy` verrouillé dans l'ADN. Variantes F/M aléatoires ÉCARTÉES (arts ×2, cohérence cassée).
4. **Équilibre par campagne (~50/50)** : registre dans `seeds.csv`, ratio vérifié sur la planche de contrôle.
5. **Fées, divines, esprits** : tags explicites par famille + âge apparent cohérent ; divines gardent le traitement digne des conventions v1.

## 4. Stack technique ComfyUI

- **Checkpoint : WAI-Illustrious v17, TRANCHÉ le 10/11/2026** par test aveugle contre NoobAI-XL (6 cartes témoins, seeds 1126001→1126006, verdict de Marc-Olivier 6/0 « de très très loin »). **NoobAI-XL ÉCARTÉ.** Détails et corrections : §11.
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

1. **Checkpoint final : TRANCHÉ (10/11/2026)** — WAI v17 retenu, NoobAI-XL écarté (test aveugle 6/0, voir §11).
2. **Tier de bascule full body** (R ? SR seulement ?).
3. **Liste des nommées** qui méritent un mini-LoRA ; validation de la méthode IPAdapter.
4. **Tableau genre + espèce des ~47 nommées** à remplir (avec `tools/species-map.json` à créer depuis les data) : 29 monstres (série 1) + 7 têtes de familles compagnons (Kenji, Kira, Alix, Léna, Argus, Solen, Maïa) + 7 graines dormantes (Yuki, Onyx, Naïa, Aïna, Roc, Ember, Sylve) + les nouvelles familles v3 (Vesperine, Gadianton, Lémion) et Aurorine (z15, monstre non couvert par la série 1) — voir §10.
5. **Vidéos FX** : alimentées par les arts v1 ou régénérées en v2 ?
6. **Sort des 231 arts DreamShaper XL** : repli ou archivage de la campagne v1.
7. Déco : vidéo vs parallaxe par écran ; WAN 5B vs 14B ; économie de la Boutique ; intérieur des Terres Sauvages (raccord donjons/errance) ; qui est le héros de l'errance (avatar joueur ou carte de l'équipe).

## 10. Alignement sur les arbres v3 (comparaison du 10/11/2026)

Comparaison entre cette charte, `docs/design/familles-races-v3.md`, `docs/design/arbres-evolution.md` et les data (`cards.json`, `monsters.json`, `families.json`). Constat : **la charte datait d'avant les nouvelles familles ; le périmètre de la campagne est à revoir à la hausse.**

### Ce que les arbres v3 ajoutent

- **4 nouvelles familles humaines actées, déjà dans `data/families.json` et `cards.json`** : Crépuscule (q1→q6, sommet **Vesperine, Reine de la Nuit**), Vol (t1→t6, sommet **Gadianton, Chef des Brigands**), Zèle (u1→u6, sommet **Lémion, Chef de la Légion Solaire**, ex-Aurorine, tranché 10/11/2026), École des Invocations (v1→v6, sommet **Archimage de l'Appel**, sans nom propre). Aucune n'a d'art ni de prompt à ce jour.
- Les **7 graines dormantes** b1-b7 (Yuki, Onyx, Naïa, Aïna, Roc, Ember, Sylve) sont des nommées à part entière : une référence d'art chacune (elles sont les graines des 2es voies des familles compagnons, cf. doc v3).
- La **série 1 (34 prompts) ne couvre que les 29 nommées de monstres + 5 fonds** : ni les têtes de familles compagnons (Kenji, Kira, Alix, Léna, Argus, Solen, Maïa), ni Macha, Ysolde, Pontos, Justine, Célestin, Aurorine, ni les nouvelles familles. Le compte réel de références nommées à couvrir ≈ **47** (29 monstres + 7 compagnons + 7 graines + Vesperine, Gadianton, Lémion, Aurorine).

### Incohérence TRANCHÉE (10/11/2026) : Aurorine en double

- `z15` "Aurorine, Lance de l'Aube" (Zénith, Assassin, Légion Solaire) et `u6` (famille Zèle, Prêtre) portaient le même nom complet. **Tranché dans `docs/arbitrages.md`** : `z15` reste Aurorine (sommet acté de la Légion Solaire du Zénith), **`u6` devient "Lémion, Chef de la Légion Solaire"** (nom acté v3 pour le sommet du Zèle, parallèle à Gadianton, Chef des Brigands). Renommage d'affichage seul : l'identité visuelle redevient non ambiguë.
- Garde ajoutée dans le validateur (`EXI-DATA-3`) : deux nommées ne peuvent plus partager le même nom complet.

### L sans prénom : TRANCHÉ (10/11/2026) — futur nommé

Héraut du Zénith (z7), Gardien des Foyers (f12), Patriarche du Bosquet (g7), Archiliche des Caveaux (k7), Grande Prêtresse de l'Ombre (q5), Archimage de l'Appel (v6) portent un titre sans nom propre. **Tranché dans `docs/arbitrages.md`** : statut **futur nommé** conservé (art de référence verrouillé dès la série 1, ex. `heraut-zenith`, `archiliche`), PAS générique libre. Un éventuel prénom sera un renommage d'affichage seul, l'art reste le même personnage.

### Conséquences pour la campagne

1. Le périmètre passe de "231 arts + 29 références" à **231+24 arts (nouvelles familles) et ~46 références** : `tools/build-prompts.mjs` doit être relancé après ajout des q/t/u/v et re-extraction du catalogue.
2. `tools/species-map.json` doit couvrir les nouvelles familles dès sa création : Crépuscule/Vol/Zèle/Appel = **humaines** (tags `human` + tenue par univers), sauf décision contraire ; Vesperine et Gadianton reçoivent un ADN complet comme les autres nommées.
3. Le genre des nouvelles nommées (Vesperine, Gadianton) et des têtes de familles compagnons entre dans le tableau genre/espèce (~46 entrées) : viser ~50/50 sur l'ensemble, en comptant la série 1 existante (déjà plutôt féminine : Méliane, Thalassa, Zikka, Calcine, Ombeline, La Mort, Ysolde, Jeanne, Apolline, Pyrrha, Écho, Ananké, Kairos, Mycola, Adriel, Vesna vs Léviathan, Titan, Griknir, Seigneur des Cendres, Vulcain, Archiliche, Ahab, Astre Capiteux, Héraut, Fjalar, Célestin, Patriarche, Gardien des Foyers, Pontos) — **compagnons et graines doivent pencher masculin pour rééquilibrer** (ex. Kenji, Argus, Solen, Roc, Onyx ; à trancher dans le tableau).

## 11. Test checkpoint du 10/11/2026 (TRANCHÉ) — protocole, résultat, corrections

Test aveugle local ComfyUI, 6 cartes témoins × 2 checkpoints, paramètres identiques (832×1216, 28 steps, CFG ~5.5-6, hires fix ×1.25 denoise 0.4, ADetailer visage, seeds figés 1126001→1126006) : WAI v17 vs NoobAI-XL sur meliane, seigneur-cendres, leviathan, kenji, yuki, bg-marees.

**Résultat : WAI v17 6 — NoobAI-XL 0** (verdict global de Marc-Olivier : « de très très loin »). WAI v17 reste le checkpoint de référence de la charte v2 ; NoobAI-XL écarté.

### Enseignements → corrections de prompts

1. **Kenji rendu en gamin** : l'ADN data ne portait pas d'âge, le modèle a tiré jeune. Correction : verrouiller dans le bloc `character_dna` `1boy, adult man, mature face, veteran warrior`, avec `young, teen, boy` en négatif. L'âge attendu est fixé par les data, plus d'invention du modèle.
2. **Seigneur des Cendres rendu en chevalier en armure** (dérive dénoncée par le §3) : correction — ADN monstrueux `colossal fire lord, beast-like, molten slag body, crown of embers, glowing ember eyes`, négatif `knight, human, armor, humanoid`. La tête de héros aguerri obtenue par dérive revient à Kenji : les deux cartes se corrigent d'un coup.
3. **Yuki en gamine** : OK pour la graine (b1), mais à généraliser en règle : **âge apparent par palier de rareté** dans le `character_dna` (ajouté au §2). La cohérence de lignée inclut la maturation, pas seulement les traits.

Ces corrections sont à écrire dans `tests/checkpoint-2026-11/prompts.json` (registre local du test) puis à reporter dans les prompts de campagne v2.

## 9. Impact sur les scripts

| Fichier | Changement |
|---|---|
| `tools/build-prompts.mjs` | 231 prompts en tags danbooru + cadrage + anti-texte + `character_dna` + `species` obligatoire (échec sans mapping) |
| `tools/species-map.json` | NOUVEAU : mapping famille/espèce → tags |
| `tools/serie1-prompts.json` | 29 références + 5 fonds (monstres) ; à étendre aux ~18 références manquantes (7 compagnons, 7 graines, Vesperine, Gadianton, Lémion, Aurorine + Macha, Ysolde, Pontos, Justine, Célestin selon priorités), avec ADN et espèce explicités |
| `tools/comfy-batch.mjs` | hires fix + ADetailer + IPAdapter, checkpoint configurable |
| `seeds.csv` | registre v2 (seeds v1 obsolètes au changement de checkpoint) + genre par carte |
| `docs/images/images-conventions.md` | réécriture après validation (ce document devient la référence) |

