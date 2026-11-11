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
- **Maturité par rareté pour TOUTE carte de race humaine** (Marc-Olivier, 10/11 soir) : la règle ci-dessus est générale, pas réservée aux nommées — plus une carte humaine est rare, plus le personnage est mature. Échelle dans `tools/species-map.json` (`humanMaturityByRarity`) : C = adolescent·e (14-17) → UC = jeune adulte (18-22) → R = adulte (23-30) → SR = adulte confirmé·e (30-38) → UR = mature·aguerri·e (40-50) → L = force de l'âge légendaire, aura de vétéran (50+) → M = figure mythique d'âge indéterminé. Le champ `age` d'une nommée reste prioritaire (ex. Kenji adulte aguerri à tous les paliers, graines = jeunes). `build-prompts.mjs` dérive l'âge de la rareté pour les génériques humaines.
- **Contrôle qualité** : planche de contrôle par colonne de personnage ; rejet de toute itération où l'identité dérive.

## 3. Espèces et genres — verrous de génération (retour terrain 10/11, PRIORITAIRE)

Problèmes constatés : espèce déduite du nom → dérive au sein d'une famille (gobelin, puis humains, puis gobelin) ; « Bestiau d'eau » a donné une catgirl ; WAI tire massivement féminin.

1. **L'espèce vient des data, jamais du nom** : bloc `species` obligatoire par carte, dérivé de `data/` + document Familles et races v3. Mapping famille/espèce → tags danbooru dans `tools/species-map.json` ; `build-prompts.mjs` refuse une carte sans entrée (échec explicite).
2. **Bestiau = une vraie bête** : tags `beast, monstrous, claws, fangs, fur/scales` + négatif `catgirl, human, girl, elf, cute animal ears`. Objectif : l'espèce se lit en un coup d'œil, pas "effrayant".
3. **Genre : une seule identité par carte**, `1girl`/`1boy` verrouillé dans l'ADN. Variantes F/M aléatoires ÉCARTÉES (arts ×2, cohérence cassée).
4. **Équilibre sans quota strict** (Marc-Olivier, 10/11 soir) : le registre `seeds.csv` note le genre par carte, la planche de contrôle vérifie qu'aucune campagne ne part totalement d'un côté, SANS case 50/50 à remplir. Les nommées finissent ~30 F / 23 M, la campagne compense naturellement sur les génériques.
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
- **Phasage** : images partout d'abord ; vidéos d'ambiance ensuite, limitées à **Accueil + Combat**. **Modèle vidéo : WAN 2.1 14B partout** (arbitré 11/11 : plus long mais meilleur résultat ; fp8 + offload sur RTX 5070 — voir arbitrages). Jamais de vidéo en base64 dans le dist.
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
2. **Tier de bascule full body : TRANCHÉ (10/11 soir)** — full body pour **UR, L et M** ; demi-corps pour C/UC/R/SR.
3. **Liste des nommées** qui méritent un mini-LoRA ; validation de la méthode IPAdapter. (OUVERT)
4. **Tableau genre + espèce : TRANCHÉ ET CRÉÉ (10/11 soir)** — `tools/species-map.json` v1 couvre les 53 références nommées (35 monstres + 7 compagnons + 7 graines + 4 sommets v3), les 11 familles (dont Crépuscule/Vol/Zèle/Appel = humaines) et les règles génériques. Genres tranchés pour les 7 cas ambigus, dont **Ember = F** et **Archimage de l'Appel = F** (retours de Marc-Olivier) ; ratio final ~30 F / 23 M sans quota (voir §3.4 et §12). `build-prompts.mjs` doit échouer sans entrée.
5. **Vidéos FX : TRANCHÉ (10/11 soir)** — **aucune vidéo avant la v2 complète** : pas de mini-vidéos alimentées par les arts v1, la génération WAN démarre après la campagne d'arts v2 validée.
6. **Sort des 231 arts DreamShaper XL : TRANCHÉ (10/11 soir)** — **archivés en repli** jusqu'à la validation v2, remplacés carte par carte par la campagne v2, pas de suppression avant l'accord explicite.
7. Déco : vidéo vs parallaxe par écran ; ~~WAN 5B vs 14B~~ TRANCHÉ (2.1 14B partout) ; économie de la Boutique ; intérieur des Terres Sauvages (raccord donjons/errance) ; ~~qui est le héros de l'errance~~ TRANCHÉ (femme aux cheveux blancs sous une cape noire, 11/11).

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

## 12. Arbitrages de lancement (10/11/2026 soir) — TRANCHÉS, campagne débloquée

Réponses de Marc-Olivier après le test checkpoint (§11), entrées ACTÉ correspondantes dans `docs/arbitrages.md` :

1. **Full body dès UR** : UR, L et M en full body ; C/UC/R/SR en demi-corps.
2. **`tools/species-map.json` créé (v1)** : 53 nommées (genre + espèce + âge par palier), 11 familles (les 4 nouvelles v3 = humaines), tags anti-dérive par espèce, règles pour les 231 génériques. Genres tranchés : La Mort F, Archiliche M, Fjalar M, Kairos M, **Ember F**, Sylve F, **Archimage de l'Appel F**. Ratio nommées ~30 F / 23 M, **sans quota strict** : l'équilibre se juge sur la planche de contrôle, pas sur un chiffre imposé.
3. **Vidéos FX** : aucune avant la v2 complète — les mini-vidéos de sorts attendent la campagne d'arts v2 validée, le chantier WAN ne démarre pas avec les arts v1.
4. **231 arts DreamShaper** : archivés en repli, remplacés carte par carte, suppression seulement sur accord explicite après validation v2.

**Restent ouverts avant le lancement effectif** : la liste mini-LoRA + la validation IPAdapter (§8.3) — non bloquants pour la première vague de génération (test de la méthode IPAdapter sur 2-3 nommées à lignée longue suffit).

## 9. Impact sur les scripts

| Fichier | Changement |
|---|---|
| `tools/build-prompts.mjs` | 231 prompts en tags danbooru + cadrage + anti-texte + `character_dna` + `species` obligatoire (échec sans mapping) |
| `tools/species-map.json` | NOUVEAU : mapping famille/espèce → tags |
| `tools/serie1-prompts.json` | 29 références + 5 fonds (monstres) ; à étendre aux ~18 références manquantes (7 compagnons, 7 graines, Vesperine, Gadianton, Lémion, Aurorine + Macha, Ysolde, Pontos, Justine, Célestin selon priorités), avec ADN et espèce explicités |
| `tools/comfy-batch.mjs` | hires fix + ADetailer + IPAdapter, checkpoint configurable |
| `seeds.csv` | registre v2 (seeds v1 obsolètes au changement de checkpoint) + genre par carte |
| `docs/images/images-conventions.md` | réécriture après validation (ce document devient la référence) |

## 13. Budgets de fichiers v2 (ACTÉ 10/11 nuit) — remplace les budgets v1

Les budgets v1 (art 300×420 ≤ 30 Ko, fond 960×540 ≤ 110 Ko, compression agressive) venaient de la contrainte « dist < 1 Mo tout en base64 », qui est levée. La vraie contrainte restante = décodage et bande passante mobile, pas la taille du dist. Nouveaux budgets :

| Artefact | v1 | **v2** |
|---|---|---|
| Art de carte | 300×420, ≤ 30 Ko | **400×560, JPEG q78-82, ~40-70 Ko** (affichage réel 200×280 ×2 DPR) |
| Fond de donjon | 960×540, ≤ 110 Ko | **1216×832 (sortie naturelle hires fix), q70-75, ~150-250 Ko** |
| Fond-monde / key art accueil | n/a | **1920×1080**, libre (1 exemplaire, image pas vidéo) |
| Masters ComfyUI | non conservés | **conservés en 1040×1520** (hire fix ×1.25) pour upscale/print futur |

- La lisibilité 200×280 (§1) reste la règle de DESIGN : silhouette claire, 2-3 plages de contraste — elle est indépendante du budget de fichier.
- `make-assets.py` prendra ces budgets à la conversion ; les masters sont archivés à part (jamais dans le dist ni dans assets.json).
- La netteté du visage après ADetailer survit enfin au zoom de fiche (le v1 en q72 la sacrifiait).


## 14. Retours de la vague 1 (10-11/11/2026) — livrée, correctifs récurrents ACTÉS

**Vague 1 livrée** (commit 7ecfa63, rapport `tools/out-v2/RAPPORT-vague1.md`) : 63 images (53 références nommées + 6 fonds + 4 tests IPAdapter), 271 prompts générés, **0 échec de mapping espèce**. Stack confirmée : ComfyUI local, WAI v17, 832×1216, CFG 5.5, dpmpp_2m_sde + karras, hires fix ×1.25, ADetailer (masque fixe région tête), ~40 s/img, ~7,4 Go VRAM (RTX 5070). Budgets v2 appliqués (400×560 q80 / fonds 1216×832 q72), masters PNG conservés. Genre constaté : 30 F / 17 M / 6 bestiaux sans genre — conforme. Graines b1-b7 : conformes (jeunes, non sexualisées). Cadrage full body dès UR respecté. Rien n'a touché au dist ni aux 231 DreamShaper.

**Correctifs de prompts récurrents (première passe QA vision sur 8 cartes + rapport agent), à appliquer sur les retries puis au négatif standard de `build-prompts.mjs` :**

1. **Visage noir/encapuchonné** (a16 Kira, d6 Kairos, f18 Ombeline, f13) : ADetailer ne répare pas un visage invisible, correction prompt obligatoire — positif `visible face, detailed eyes, face illuminated by soft glow, front lighting` ; négatif `hooded, shadowed face, covered face, black face, obscured face, dark silhouette`. Univers sombres = tenue sombre, visage TOUJOURS éclairé.
2. **Quasi-monochrome** (a13 Alix, e22 Pontos) : l'élément colore les effets et l'éclairage, jamais la peau ni tout l'arrière-plan — positif `colorful, vibrant colors` + accent par univers (Marées : `coral accents, warm rim light`) ; négatif `monochrome, greyscale, single color palette, monochromatic background`.
3. **Peau dénaturée** (a15 Kenji, peau bleue par contamination Feu/flamme ; casque armure bleue en plus selon l'agent) : toute carte humaine porte `fair skin, human skin tone` en positif, `blue skin, colored skin, inhuman skin` en négatif ; Kenji en plus `bareheaded, beard stubble` en positif, `helmet, full helmet` en négatif.
4. **Signature d'artiste** (e22) : `artist signature, artist name` ajouté au négatif global.
5. **f13 Seigneur des Cendres** : malgré l'ADN fireLord, sorti en silhouette humanoïde encapuchonnée — renforcer `colossal, bulky, beast-like, no humanoid proportions` + négatif `hood, slim, humanoid`.
6. **Espèce phénix** (z19/z22) : corrigée dans `species-map.json` (cf. arbitrages « les phénix sont des bêtes ») — z19/z22 à régénérer.

**Verdict IPAdapter (test vague 1) — REVU le 11/11 après QA vision indépendante** : les 3 images de test (a15, a10, e27) sont **REJETÉES, pas juste « à régler »** : dérive psychédélique magenta/cyan, glitch chromatique, contours déformés — hors charte, elles ne peuvent figurer à côté d'aucun art v2. Le nœud n'est validé que MÉCANIQUEMENT (identité ancrée) ; à 0.6 `linear` le résultat est inutilisable. Réglage à re-tester en vague 2 : **poids 0.3-0.45, weight_type `ease in-out`, end_at 0.8-0.9**, et la re-validation doit porter sur **identité ET style ET couleurs** (les 3), pas sur l'identité seule. La fourchette « 0.5-0.7 » du §2 est révisée.

**Règle QA ajoutée (leçon du cas)** : les tests IPAdapter (et tout artefact intermédiaire) passent la **MÊME checklist complète** que les arts — sujet, anatomie, artefacts, cadrage, contamination + **style de la charte** (anime premium, contours nets, rendu éclairci, couleurs saines). Dérive de style = échec, même si « c'est classe » : une image hors thème n'entre jamais dans le jeu.

**Alerte style sur la référence a17** : la QA vision juge la référence Kenji a17 elle-même « concept art semi-réaliste, contours flous » — pas de l'anime premium. À vérifier sur la planche GLOBAL : si WAI dérive en painterly sur une partie des 53, renforcer les tags de style dans le prompt master (`anime style, anime illustration, sharp lineart, clean lineart` en positif, `painterly, brush strokes, concept art, semi-realistic` en négatif) et re-passér les fautives. À arbitrer après validation de la planche par Marc-Olivier.

## 15. Réglages WAI-Illustrious v17 canoniques (recherche du 11/11/2026) — source : page officielle du modèle + test indépendant lilting.ch

Sources : page WAI-illustrious-SDXL v17 (CivArchive/CivitAI.red) et test v17 de lilting.ch (seed fixé, v16 vs v17).

**Points où notre pipeline déviait du canon WAI :**

1. **Sampler** : officiel = **Euler a** (nous : dpmpp_2m_sde + karras). Le test indépendant utilise euler_ancestral + scheduler normal avec de très bons résultats.
2. **Tags de qualité OBLIGATOIRES, en FIN de prompt** : `, masterpiece, best quality, amazing quality` (la virgule initiale de la page officielle = à ajouter en fin de prompt, convention IL/danbooru : sujet → apparence → pose → fond → méta). L'ordre compte : qualité en premier = compositions encombrées.
3. **Négatif canonique COURT** : `bad quality, worst quality, worst detail, sketch, censor` — l'auteur du modèle prévient explicitement : « n'ajoutez pas trop de tags de qualité/esthétique ni de négatif trop long, ça RÉDUIT la qualité et rend l'image floue ». Notre négatif actuel (20+ tags) est suspect dans les rendus mous/painterly.
4. **VAE : intégré au checkpoint** — ne PAS charger de VAE externe par-dessus (le vérifier dans le workflow).
5. **Filtrage rating** : tags à 4 niveaux baked (general/sensitive/nsfw/explicit) — mettre **`nsfw` dans le négatif** pour filtrer ; `general` en positif pousse le SFW strict.
6. **Âge** : `(aged up:1.0-2.0)` ou `(mature female:1.0-2.0)` en tête de prompt = le mécanisme natif de la v17 pour vieillir un personnage — à utiliser pour l'échelle `humanMaturityByRarity` (et non des tags d'âge libres).
7. **Hires fix** : 0.35-0.5 de denoise, upscaler officiel **R-ESRGAN 4x+ Anime6B** (vs latent upscale) ; la v17 **auto-corrige les membres pendant le hires fix** — moins besoin d'ADetailer sur les membres.
8. **Résolution** : ≥ 1024×1024 recommandé côté officiel (nos 832×1216 ≈ 1 Mpx restent dans les clous du test indépendant ; 1024×1344 possible si rendu trop mou).

**Dérive semi-réaliste de la v17 : connue et documentée** (retours utilisateurs de la page modèle : « rendu des personnages plus réaliste », « trop proche des checkpoints 2.5D », conseil de repasser en v16/v15 pour certains personnages). Ce n'est pas une erreur de nos prompts : c'est un trait de la version. Options si le style v17 sort trop 2.5D : (a) tags de style anime renforcés + négatif épuré (canon), (b) test aveugle local v16 sur 3-4 cartes, (c) vivre avec et assumer le 2.5D premium. À arbitrer avec Marc-Olivier après la vague 1-bis.

**LoRA** : les LoRA entraînées v16 passent sur v17 « mais pas parfaitement » (test lilting) — si on entraîne des mini-LoRA de héros, le faire SUR v17 directement.
