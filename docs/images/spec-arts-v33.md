# Spéc v3.3 — Relance complète base 3.1 + couche monstres 3.2 (LoRAs gagnants)

> ARBITRÉ par Marc-Olivier le 13/11 : « la 3.1 a eu de meilleurs résultats globaux que la 3.2 sauf en génération de monstres ». Synthèse v3.3 : **relance complète des 271 depuis les prompts v3.1**, avec la couche monstres de la 3.2, **uniquement 3 LoRAs conservés** (Léviathan, Golems, Forest Guardians), et pour les défauts d'habillage : **« enlève juste le sang »** — PAS de R12 (tenues) en 3.3, PAS de négatif revealing ; seule l'anti-sang (R13) reste.
>
> **Compléments arbitrés le 13/11 (2e tour)** : (1) **aucun Fx généré** dans cette session (second temps) ; (2) **les 37 cartes manquantes de la 3.2 sont intégrées** à la session (compagnons c1-c14, p5, p6, w1-w21, cf. `arts-manquants-contenu-v3.md`, seeds 2150000+) ; (3) **push automatique des livrables en fin de session** (le manque de push de la 3.2 a bloqué le QA) ; (4) **switch 4 versions** sur le bouton 🖼️ : V3, V3.1, V3.2, V3.3 en parallèle avec l'étiquette de version affichée sur le bouton ; (5) **POINT D'ARRÊT après le build** : la génération ne démarre qu'après relecture et validation des prompts par Marc-Olivier.

## 1. Base : prompts v3.1, relance complète

- `build-prompts-v31.mjs` (R8/R9/R10 + anti-cadre/anti-texte) = base, mêmes seeds que la 3.1 (`tools/seeds-v3.csv`, témoins 1126001-1126006, refs 2126000+, génériques 2127000+), canon §15 inchangé (Euler a, VAE baked, hires 0.4, IPAdapter 0.4 ease in-out end_at 0.85, négatif court).
- **Aucun** ajout positif de type tenue/habillage (le R12 « fully clothed, modest attire » de la 3.2 est RETIRÉ — cause probable de l'uniformisation des costumes et de la baisse de rendu global).
- **Négatif = canon court 3.1 + anti-cadre/anti-texte + anti-sang (R13) UNIQUEMENT** : `blood splatter, gore, open wounds, blood stains` (4 tags). Le budget ~20 tags du canon §15 doit rester respecté : vérifier le total après ajout, sinon trimer.

## 2. Couche monstres (héritée 3.2)

- Descriptions d'espèce R11 (morphologie concrète canon MTG/LotR) : CONSERVÉES pour toutes les espèces beast:true + gobelin, fongus, undead/lich, banshee, sirène.
- **LoRAs : UNIQUEMENT les 3 gagnants, appliqués uniquement à leurs espèces** :
  1. **Leviathan XL** (`Leviatan.safetensors`, trigger `leviathan a sea monster`) : seaBehemoth/seaSerpent (e13 Léviathan, e14 Titan des Marées) + bêtes aquatiques massives (beastWater). Canon visuel : Léviathan du film « Atlantide, la cité perdue ».
  2. **Golems** (`Golems.safetensors`, triggers `Gol3em`, `Magma Golem`) : magmaGolem (f22 Vulcain), fireLord (f13) et espèces minérales/golemoïdes de la Forge.
  3. **Forest Guardians** (`Forest-Guardians-000014.safetensors`, triggers `FG-V2.0-Treant`, `FG-V2.0-Dryad`, `FG-V2.0-Spirit`) : treant (g7, g8 Cœur du Bosquet), dryad (g21 Vesna), fireflySpirit (g18 Adriel).
- **LoRAs ABANDONNÉS en 3.3** (arbitrage 13/11, non régénérés avec LoRA) : goblin DND, wow-undead, banshee, cordyceps, creepy wolf, mermaid. Les espèces concernées (gobelin des Marées, morts-vivants de la Crypte, banshee Macha, fongus Mycola, bêtes sombres, sirènes) sont générées avec la **description R11 seule**.
- Poids LoRA : reprendre le poids retenu en 3.2 si le rapport 3.2 le consigne, sinon 0.7 ; jamais 1.0.

## 3. Sirènes (durcissement prompt, sans LoRA)

Constat 3.2 : sirènes avec des pieds. Sans LoRA mermaid en 3.3, durcissement prompt obligatoire sur toutes les sirènes (e28 Méliane, e30 Thalassa, w19 Sirène Nouvelle, génériques) :
- Positif : `mermaid with a long fish tail instead of legs` en plus des speciesTags (`mermaid, long fish tail, scales`).
- Négatif ciblé (dans le budget) : `feet, human legs`.

## 4. Post-traitement global

- Crop 4 % du coin bas-droit sur toute la production (signatures d'artiste, constat ~25 % en 3.1) ; vérification des bordures sombres (si vrai cadre, même medicine).
- Masters à part, production 400×560 JPEG q80, mise à jour du manifeste de production (`assets-v3.1.json` en source de la vague 3.3, ou manifeste `assets-v33.json` selon l'architecture retenue au push).

## 5. QA (méthode obligatoire)

- Planches contact = détection d'amplitude UNIQUEMENT ; verdicts = image par image, échantillon ≥ 20 par lot, comptages en tête de rapport.
- Comptages v3.3 : monstres humanoïdes (espèce par espèce), cartes avec sang, cadrage ≥ plancher (poitrine complète / full body M-L-UR), F/M, **sirènes avec pieds**, **léviathan conforme canon Atlantide**, golems conformes (Magma Golem lisible), treants/dryades conformes (Forest Guardians), style painterly sans dérive anime/3D (le point critique avec les LoRAs).
- Comparatif explicite sur les cartes monstres 3 LoRAs : **3.2 vs 3.3** (même seed si possible) pour prouver le gain.
- Correctifs résiduels connus à re-vérifier : b3 (UR full body), e14/g7 (espèce dans species-map).

## 6. Rapport

`tools/out-v2/RAPPORT-vague3-3.md` : tableau récapitulatif (générés/retries/échecs), comptages par classe, verdict garder/retry par lot, poids retenus par LoRA, comparatif 3.2 vs 3.3 sur monstres, chemins masters/production/seeds, remplissage de `tools/assets-manifest.json` pour la 3.3 (civitaiId, version, seed, poids par carte LoRA).

## 7. Process

1. Builder `build-prompts-v33.mjs` = base v31 + descriptions R11 + anti-sang + durcissement sirène + branchement LoRAs (3 fichiers uniquement) + prompts des 37 nouvelles cartes (créés depuis `data/cards.json`, verrous 3.3, compagnons character_dna + IPAdapter UR↔L, Gorgonne = morphologie pure, seeds 2150000+ consignés dans `tools/seeds-v3.csv`).
2. **POINT D'ARRÊT (arbitrage 13/11)** : après le build, `tools/prompts-v33.json` est poussé sur GitHub avec un court rapport de build (comptages : 271 + 37, LoRAs par carte, longueurs de négatif, zéro R12, zéro Fx). **La génération attend la validation écrite de Marc-Olivier.** Il relit les prompts et donne le « go » (ou liste les corrections, un rebuild, puis go).
3. Après validation : relance complète 271 + génération des 37, mêmes seeds que la 3.1 pour les 271 (retries seed+1, max 2), **aucun Fx** (second temps, arbitré).
4. Crop signatures global.
5. QA vision par l'agent (par lot de ~20), rapport unique.
6. QA vision indépendant du couloir design (Vibe) à la réception, image par image.
7. **Push automatique en clôture** : rapport, planches, jpg de production, masters référencés, manifestes mis à jour — plus les livrables 3.2 non poussés si disponibles localement (`RAPPORT-vague3-2.md`, arts des 37 si déjà générés en 3.2, cf. §8).

## 8. Switch 4 versions (code, livré dans la même session)

- Bouton 🖼️ : cycle **V3 → V3.1 → V3.2 → V3.3** avec l'étiquette de version affichée sur le bouton (ex. « 🖼️ V3.3 »), préférence persistée comme aujourd'hui (`fondations-art-src`).
- Architecture : `ART_MANIFESTS = { v3: assets-v3.json, v31: assets-v3.1.json, v32: assets-v32.json, v33: assets-v33.json }` ; un manifeste manquant = bouton grisé avec le libellé (jamais d'erreur), la version courante inchangée.
- `assets-v32.json` et `assets-v33.json` sont créés depuis les sorties correspondantes (2.2/3.2 et 3.3) ; les arts existant dans une seule version (ex. les 37 nouvelles cartes) sont ajoutés au manifeste PAR DÉFAUT `assets-v3.json` comme le fait déjà v1.33 — présents partout, quelle que soit la version choisie.
- Digest **inchangé** (IHM seule) ; tests headless (cycle complet, préférence persistée, manifeste manquant toléré) + smoke dédié ; protocole IHM mis à jour (S du switch 4 versions).
