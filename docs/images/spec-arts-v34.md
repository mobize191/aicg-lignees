# Spéc v3.4 — Correctifs d'espèces + variantes « Lignées d'Exception » (2 images par carte)

> ARBITRÉ par Marc-Olivier le 13/11 : la 3.4 regroupe (1) les **correctifs d'espèces** de l'audit mystiques (`docs/images/audit-especes-mystiques.md`) et (2) les **variantes** : chaque carte obtient une seconde illustration, à la manière des Pokémon chromatiques. Génération des variantes = **légère variation dans le prompt sur la position, l'habit ou l'environnement** (pas un simple reseed, pas un prompt entièrement différent). En jeu, la variante donne un **petit bonus statistique ou un titre** [défauts balisés à trancher ci-dessous].

## 1. Périmètre classique (héritage 3.3, régénérations ciblées)

- **Base = prompts v3.3** (`tools/prompts-v33.json`) : verrous 3.3 inchangés (anti-sang R13 seul, PAS de R12, durcissement sirène, 3 LoRAs, k2 `stagnantNymph` actée — k2 ayant tourné en 3.3 avec le prompt bête, elle est régénérée ici).
- **Reclassifications de l'audit + arbitrages 13/11 (suite 14)** : k2 + k3, k5, k6, k8, k9, k10, k11, k16, k18, k20, k21 → espèces `stagnantNymph`, `undead`, `ghost`, `banshee`, `ghostMourner`, `undeadDrowned`, `lich` créées dans `species-map.json`, verrou R8 retiré pour ces cartes (ni positif bête ni négatif anti-humanoïde, hors LoRA Leviathan), genres fixés (F : k2, k6, k9, k10, k11, k18 ; M : k3, k8, k20, k21 ; k5 Spectre = F par défaut [À TRANCHER si besoin]). **Tranchés suite 14** : k1 = `carrionBeast` (goule/cadavre d'ANIMAL, quadrupède mort réanimé, reste bête MAIS tags undead explicites, pas un loup vivant) ; k12 = `ghostMourner` (femme de veille des noyés, F) ; k13 = `ghoulFeral` (humanoïde zombie ayant perdu son humanité, marche à 4 pattes comme une bête) ; k15 = `ghoulRisen` (humanoïde zombie ayant gardé un peu d'humanité, debout) ; g13 = `treant` (ent semateur, LoRA Forest Guardians, comme g7/g8) ; n14 = `diableHumanoide` (acté via le camp démon jouable, cf. gel v1).
- **Bloc Forge `fireElemental` (f1-f23, hors f22 Vulcain déjà magmaGolem) — TRANCHÉ suite 14 : LoRA Golems + GRADIENT D'HUMANITÉ PAR RARETÉ** : toutes ces cartes passent au LoRA Golems (triggers `Gol3em`/`Magma Golem`) avec une morphologie de plus en plus précise et humaine à mesure que la rareté monte : C = golem brut de cendre/magma à peine formé, masse informe ; UC = golem massif plus défini, membres visibles ; R = golem humanoïde avec silhouette et casque ; SR = silhouette humanoïde nette, traits partiellement humains (visage esquissé) ; UR = figure quasi humaine de feu et de braise (chevalier/mage de flammes) ; L (f21 Calcine) = la plus humaine du gradient, femme de cendres. Les descriptions R11 suivent le gradient, et les négatifs anti-humanoïde sont retirés à partir du rang SR (humanoïde assumé).
- **Constat loups (suite 14) — le bloc Bosquet `beastWood` rendu LOUP** (QA vision : g1, g2, g3, g4, g5, g14 tous rendus en canidés) : AUCUN loup n'existe dans le jeu, c'est l'artefact par défaut du checkpoint quand le prompt dit « a beast, monstrous ». **Règle 3.4 : plus AUCUN prompt « bête » générique** — chaque carte bête reçoit une description R11 concrète par carte : g1 = bête rampante des fougères (quadrupède végétal assumé, pas un canidé), g2 = grosse luciole-insecte hostile, g3 = VRAI sanglier de mousse (boar !), g4 = golem de ronces et de remparts végétaux, g5 = **être végétal translucide par photosynthèse** (voir ci-dessous), g14 = golem fongique (champignons-pierres), g15 = masse mycélienne humanoïde. Idem pour les bêtes restantes des autres biomes (e11 ci-dessous, etc.) : l'audit espèce-par-espèce du builder doit rejeter tout prompt « a beast » sans morphologie concrète.
- **g5 « Prisme Vivant » (SR, arbitrage 13/11 suite 15) : PAS de renommage** — la cohérence thème vient du lien **photosynthèse/sève** : description R11 « a living plant-glass being, body of translucent leaves like green stained glass, luminous sap veins glowing inside, blooming flowers along its limbs, refracting sunlight into little prisms, no human traits » : le prisme devient la lumière réfractée PAR la créature végétale, pas une créature de cristal minéral. Espèce `plantPrism`, reste beast:true (morphologie non-humanoïde), peut réutiliser le trigger Spirit du LoRA Forest Guardians.
- **e11 « Crabe des Berges » (UC, Marées — constat Marc-Olivier + QA vision suite 15) : reclassée `giantCrab`** (le prompt actuel demande « an adult man, warrior in armor » : rendu humain, totalement non représentatif). Description R11 : « a giant mossy riverbank crab, moss and barnacles on its cracked shell, barnacled claws raised, small wary eyes on stalks, a wild non-humanoid creature, no human traits » ; verrou R8 conservé (bête assumée, concrète) + anti-tags crab pour éviter le dérive canidé.
- **Ambigus TRANCHÉS (suite 14)** : k1, k12, k13, k15, n14, g13, f4/f5/f21/f23 et tout le bloc f — cf. lignes ci-dessus. Plus aucun ambigu en attente.
- **Cartes retirées/ajoutées** : la session démarre depuis `data/cards.json` APRÈS la mise à jour en cours (Ange Gardien retiré, oublis corrigés) — le builder régénère la liste depuis les données, les arts des cartes retirées ne sont plus embarqués.

## 2. Variantes « Lignées d'Exception » — génération

- **Une variante par carte existante** (y compris les 37 de la 3.3 et les cartes reclassées). Total ≈ 300-310 variantes.
- **Prompts** = prompt classique de la carte + **variations légères** sur UN ou DEUX des axes suivants (choisis par le builder selon la classe/espèce pour rester naturels) :
  - pose : « dynamic action pose » ↔ « confident pose » (inversion avec la version classique quand elle est posée) ;
  - tenue : rôle alternatif au sein du même univers de costume (« a mage in flowing robes casting a spell » ↔ « a robed scholar ») ;
  - environnement : variation du second plan du biome (ex. Bosquet : « golden spores » ↔ « morning mist and fireflies »).
  - **Interdits** : changer l'espèce, le genre, la magie dominante ou le biome ; ajouter du sang (R13 conservé sur les variantes).
- **Cartes nommées** (character_dna : Vesna, Macha, Zikka, Méliane, Thalassa, Léviathan, Titan, compagnons UR↔L…) : la variante garde le même personnage — mêmes speciesTags, même âge, même genre, IPAdapter identique ; seuls varient pose/tenue/accessoire via les axes ci-dessus. Accent chromatique alternatif OPTIONNEL (arbitrage 13/11 suite 6 : le marqueur visuel de la variante est la SURCOUCHE CSS, pas le prompt ; l'accent reste permis en flavor sur les nommées si le builder le juge naturel).
- **Cartes génériques** : mêmes axes de variation, sans contrainte d'identité (accent chromatique libre, non obligatoire).
- **Seeds** : variante = seed classique + 5 000 000, consigné dans `tools/seeds-v3.csv` (retries +1, max 2, même règle).
- **Fichiers** : `<id>-v.jpg` en production 400×560 JPEG q80 ; masters à part comme pour la vague classique.
- **Manifestes** : clé `"<id>-v"` dans la section `art` du même manifeste (`assets-v33.json` inchangé ; nouveau `assets-v34.json` = arts classiques 3.3 (ou régénérés 3.4 pour les reclassées) + toutes les variantes). Crop signatures 4 % bas-droit appliqué aux variantes comme au classique.

## 3. Mécanique de jeu [TRANCHÉE Marc-Olivier 13/11]

- **Obtention** : à l'acquisition d'une carte (pack, récompense, errance), jet de « Lignée d'Exception » : **1/100 (TRANCHÉ Marc-Olivier 13/11)**. Un tirage Exception remplace l'illustration par la variante, la carte EST la variante (une seule instance, pas deux copies distinctes).
- **Bonus = TITRE SEUL (TRANCHÉ Marc-Olivier 13/11)** : pas de bonus statistique. Le titre d'Exception n'est pas un simple suffixe : la carte variante reçoit une **APPOSITION décrivant l'action, le lieu ou la situation** de son illustration (ex. « Vesna, Dryade du Sous-Bois — Sous la Pluie de Spores », « Gobelin des Marées — Pillard au Pierroux »). Le builder la choisit dans une **table par axe de variation** (pose → action, tenue → fonction, environnement → lieu), une liste courte FR par biome/axe en data, jamais de texte généré au hasard. Titre affiché sur la fiche + compteur collection. **Digest inchangé** (cosmétique).
- **Collection** : compteur 2/2 par carte (classique + variante), badge ✨ sur la carte variante, aura dorée discrète sur l'art en combat.
- **Économie** : aucune vente/fusion spéciale en 3.4 ; **le statut Exception se TRANSFÈRE à la fusion (TRANCHÉ Marc-Olivier 13/11)** : une carte Exception fusionnée (même carte) transmet le statut au résultat, qui affiche SA variante (art `<résultat>-v` si le manifeste en contient une, sinon art classique + classe CSS `exception`).
- **Digest** : le bonus (a) impacte les combats → nouveau digest attendu et baseline à re-mesurer ; le titre (b) = digest inchangé. Consigner l'un OU l'autre dans le rapport.

## 4. UI / intégration

- `ART[id + '-v']` : fallback propre — si une carte n'a PAS de variante dans le manifeste courant (ex. V3.0-V3.3), le jeu affiche l'art classique, jamais d'erreur ni de trou.
- Switch 🖼️ : cycle **V3 → V3.1 → V3.2 → V3.3 → V3.4** (5 versions, même mécanique : manifeste manquant = grisé). `ART_MANIFESTS` étendu, déploiement Pages à mettre à jour avec `assets-v34.json`.
- Bestiaire/collection : pastille « ✨ 1/2 » ou « 2/2 » sur chaque carte, tri par complétion possible en 3.5.

## 5. Process (point d'arrêt conservé)

1. Mise à jour `data/cards.json` par Marc-Olivier (en cours) → attendre son signal.
2. Builder `build-prompts-v34.mjs` : base v3.3 + reclassifications audit + prompts variantes (axes §2, accent chromatique libre, seeds +5 000 000).
3. **POINT D'ARRÊT** : push `tools/prompts-v34.json` + rapport de build (comptages : classiques régénérés, variantes, longueurs négatif, espèces reclassées) → validation écrite de Marc-Olivier avant génération.
4. Génération locale ComfyUI (reclassées + variantes), mêmes seeds consignés, retries +1 max 2.
5. Crop signatures global sur la production.
6. QA agent par lots de ~20, rapport `tools/out-v2/RAPPORT-vague3-4.md` ; QA vision indépendant couloir design à la réception du push.
7. Push automatique en clôture : jpg classiques + variantes, manifeste `assets-v34.json`, code switch 5 versions + mécanique Exception + déploiement Pages.

## 6. QA spécifique variantes

- **MARQUEUR VISUEL = SURCOUCHE CSS** (arbitrage 13/11 suite 6) : une carte Exception porte la classe CSS `exception` — reflet doré CROISÉ (angle 60° vs 105° pour les rares existantes, teinte or chaud saturée), halo `drop-shadow` discret permanent, liseré dégradé or ; badge ✨ (coin) réservé à la collection. Animation coupée via `prefers-reduced-motion`. Ce marqueur est indépendant de l'image : il fonctionne même si la variante générée est subtile.
- Comptages : variantes distinctes du classique (pose/tenue/environnement à l'œil), identité préservée sur les nommées (comparaison côte à côte classique/variante), zéro sang, zéro Fx, style painterly sans dérive, classe CSS `exception` présente sur toute carte variante.
- Espèces reclassées : figure humanoïde/esprit (pas dragon/loup), k2 = figure nymphique, **zéro rendu canidé sur toute la production** (aucun loup n'existe dans le jeu : comptage loups = 0 attendu).
- Échantillon ≥ 20 par lot, verdicts image par image, planches contact = détection uniquement.
