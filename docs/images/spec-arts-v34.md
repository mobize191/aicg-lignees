# Spéc v3.4 — Correctifs d'espèces + variantes « Lignées d'Exception » (2 images par carte)

> ARBITRÉ par Marc-Olivier le 13/11 : la 3.4 regroupe (1) les **correctifs d'espèces** de l'audit mystiques (`docs/images/audit-especes-mystiques.md`) et (2) les **variantes** : chaque carte obtient une seconde illustration, à la manière des Pokémon chromatiques. Génération des variantes = **légère variation dans le prompt sur la position, l'habit ou l'environnement** (pas un simple reseed, pas un prompt entièrement différent). En jeu, la variante donne un **petit bonus statistique ou un titre** [défauts balisés à trancher ci-dessous].

## 1. Périmètre classique (héritage 3.3, régénérations ciblées)

- **Base = prompts v3.3** (`tools/prompts-v33.json`) : verrous 3.3 inchangés (anti-sang R13 seul, PAS de R12, durcissement sirène, 3 LoRAs, k2 `stagnantNymph` actée — k2 ayant tourné en 3.3 avec le prompt bête, elle est régénérée ici).
- **Reclassifications de l'audit** (§1 du doc d'audit) : k2 + k3, k5, k6, k8, k9, k10, k11, k16, k18, k20, k21 → espèces `stagnantNymph`, `undead`, `ghost`, `banshee`, `ghostMourner`, `undeadDrowned`, `lich` créées dans `species-map.json`, verrou R8 retiré pour ces cartes (ni positif bête ni négatif anti-humanoïde, hors LoRA Leviathan), genres fixés (F : k2, k6, k9, k10, k11, k18 ; M : k3, k8, k20, k21 ; k5 Spectre = F par défaut [À TRANCHER si besoin]).
- **Ambigus** (k1, k12, k13, k15, n14, g13, f5/f23, f4/f21) : traités selon l'arbitrage Marc-Olivier du jour même ; si non tranchés au lancement, la 3.4 les laisse en l'état (reportés 3.5).
- **Cartes retirées/ajoutées** : la session démarre depuis `data/cards.json` APRÈS la mise à jour en cours (Ange Gardien retiré, oublis corrigés) — le builder régénère la liste depuis les données, les arts des cartes retirées ne sont plus embarqués.

## 2. Variantes « Lignées d'Exception » — génération

- **Une variante par carte existante** (y compris les 37 de la 3.3 et les cartes reclassées). Total ≈ 300-310 variantes.
- **Prompts** = prompt classique de la carte + **variations légères** sur UN ou DEUX des axes suivants (choisis par le builder selon la classe/espèce pour rester naturels) :
  - pose : « dynamic action pose » ↔ « confident pose » (inversion avec la version classique quand elle est posée) ;
  - tenue : rôle alternatif au sein du même univers de costume (« a mage in flowing robes casting a spell » ↔ « a robed scholar ») ;
  - environnement : variation du second plan du biome (ex. Bosquet : « golden spores » ↔ « morning mist and fireflies »).
  - **Interdits** : changer l'espèce, le genre, la magie dominante ou le biome ; ajouter du sang (R13 conservé sur les variantes).
- **Cartes nommées** (character_dna : Vesna, Macha, Zikka, Méliane, Thalassa, Léviathan, Titan, compagnons UR↔L…) : la variante garde le même personnage — mêmes speciesTags, même âge, même genre, IPAdapter identique ; seuls varient pose/tenue/accessoire via les axes ci-dessus, + accent chromatique alternatif (la couleur d'accent magique passe à la couleur complémentaire du biome : Marées turquoise → or, Bosquet vert/or → bleu nuit, Forge orange → bleu spectral, Zénith ivoire → crépuscule violet).
- **Cartes génériques** : mêmes axes de variation, sans contrainte d'identité (l'accent chromatique alternatif s'applique aussi, c'est le marqueur visuel de la variante).
- **Seeds** : variante = seed classique + 5 000 000, consigné dans `tools/seeds-v3.csv` (retries +1, max 2, même règle).
- **Fichiers** : `<id>-v.jpg` en production 400×560 JPEG q80 ; masters à part comme pour la vague classique.
- **Manifestes** : clé `"<id>-v"` dans la section `art` du même manifeste (`assets-v33.json` inchangé ; nouveau `assets-v34.json` = arts classiques 3.3 (ou régénérés 3.4 pour les reclassées) + toutes les variantes). Crop signatures 4 % bas-droit appliqué aux variantes comme au classique.

## 3. Mécanique de jeu [défauts balisés — trancher avant codage]

- **Obtention** : à l'acquisition d'une carte (pack, récompense, errance), jet de « Lignée d'Exception » : **1/50 par défaut** [À TRANCHER : 1/50 vs 1/64 vs 1/100]. Un tirage Exception remplace l'illustration par la variante, la carte EST la variante (une seule instance, pas deux copies distinctes).
- **Bonus** [À TRANCHER entre les deux formes] : (a) **+5 % PV max** (arrondi sup), OU (b) titre « d'Exception » affiché sur la carte + compteur collection, sans bonus. Défaut si non tranché : titre seul (zéro impact digest, réversible).
- **Collection** : compteur 2/2 par carte (classique + variante), badge ✨ sur la carte variante, aura dorée discrète sur l'art en combat.
- **Économie** : aucune vente/fusion spéciale en 3.4 ; une carte variante fusionnée transfère son statut au résultat si même carte [À TRANCHER : transfert vs perte].
- **Digest** : le bonus (a) impacte les combats → nouveau digest attendu et baseline à re-mesurer ; le titre (b) = digest inchangé. Consigner l'un OU l'autre dans le rapport.

## 4. UI / intégration

- `ART[id + '-v']` : fallback propre — si une carte n'a PAS de variante dans le manifeste courant (ex. V3.0-V3.3), le jeu affiche l'art classique, jamais d'erreur ni de trou.
- Switch 🖼️ : cycle **V3 → V3.1 → V3.2 → V3.3 → V3.4** (5 versions, même mécanique : manifeste manquant = grisé). `ART_MANIFESTS` étendu, déploiement Pages à mettre à jour avec `assets-v34.json`.
- Bestiaire/collection : pastille « ✨ 1/2 » ou « 2/2 » sur chaque carte, tri par complétion possible en 3.5.

## 5. Process (point d'arrêt conservé)

1. Mise à jour `data/cards.json` par Marc-Olivier (en cours) → attendre son signal.
2. Builder `build-prompts-v34.mjs` : base v3.3 + reclassifications audit + prompts variantes (axes §2, accent chromatique par biome, seeds +5 000 000).
3. **POINT D'ARRÊT** : push `tools/prompts-v34.json` + rapport de build (comptages : classiques régénérés, variantes, longueurs négatif, espèces reclassées) → validation écrite de Marc-Olivier avant génération.
4. Génération locale ComfyUI (reclassées + variantes), mêmes seeds consignés, retries +1 max 2.
5. Crop signatures global sur la production.
6. QA agent par lots de ~20, rapport `tools/out-v2/RAPPORT-vague3-4.md` ; QA vision indépendant couloir design à la réception du push.
7. Push automatique en clôture : jpg classiques + variantes, manifeste `assets-v34.json`, code switch 5 versions + mécanique Exception + déploiement Pages.

## 6. QA spécifique variantes

- Comptages : variantes avec accent chromatique alternatif LISIBLE (couleur dominante ≠ classique), identité préservée sur les nommées (comparaison côte à côte classique/variante), zéro sang, zéro Fx, style painterly sans dérive.
- Espèces reclassées : figure humanoïde/esprit (pas dragon/loup), k2 = figure nymphique.
- Échantillon ≥ 20 par lot, verdicts image par image, planches contact = détection uniquement.
