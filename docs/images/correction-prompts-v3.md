# Spéc de correction — prompts v3 (retour au socle NL painterly d'origine, corrigé)

> **Statut 11/11/2026 : vague 3 LIVRÉE et VALIDÉE (v1.28)** — 271 prompts générés (`tools/prompts-v3.json`, auto-vérification 0 erreur), 274 images, rapport `tools/out-v2/RAPPORT-vague3.md`, manifeste unique `assets-v3.json`. Seul échec constaté : d6 (visage sous capuche, retry recommandé).

> Décision de Marc-Olivier du 11/11/2026 après verdict vague 2 : repartir des **prompts WAI d'origine (seeds-wai.csv)** comme socle et les corriger. Checkpoint inchangé : **WAI-Illustrious v17, réglages canon §15** (Euler a, tags qualité en fin si tags, VAE baked, hires fix denoise 0.35-0.5). Ce document remplace la grammaire danbooru de la vague 2 pour TOUTES les cartes (271).

## 1. Audit du socle d'origine (265 prompts analysés par le couloir design)

- **265/265 prompts en langage naturel, ancrés style painterly semi-réaliste** (phrase de style + palette par univers + escalade d'effets par rareté) : c'est le bon socle, conforme aux arts d'origine du jeu.
- **Défaut A — sujet pollué par la traduction littérale du nom français** : ~180 prompts de génériques commencent par un fragment non-pertinent hérité du nom de la carte (« A bow », « A sea foam », « A bone, bridge », « A sun », « A standard », « A dawn », « A hourglass », « A ash »…). Risque : le modèle illustre le mot (un arc, un soleil) au lieu du personnage.
- **Défaut B — ancre « trading card game artwork » présente 2× par prompt** : cause probable des effets de bordure / cadre de carte constatés.
- **Défaut C — pas de colonne négatif** dans le fichier d'origine : le négatif doit être reconstruit selon §15 (court) + §14.
- OK par ailleurs : cadrage portrait 85 / full body 175 (les 5 sans cadrage sont les fonds, normal), palettes par univers, poses calmes → épiques selon la rareté, « no humans » sur les fonds.

## 2. Règles de correction v3 (à implémenter dans build-prompts.mjs v3)

**R1 — Sujet corrigé, jamais depuis le nom.** La phrase-sujet vient UNIQUEMENT de `species-map.json` + `character_dna` : espèce (description fixe par famille), genre verrouillé (1girl/1boy pour les humaines, jamais sur une bête `beast:true`), âge (`aged up` dérivé de `humanMaturityByRarity` pour les génériques humaines, champ `age` prioritaire pour les nommées). Les fragments issus du nom français sont supprimés. Modèle : « A <description d'espèce>, <rôle d'archétype>, in a <palette univers>… ».

**Cas z19/z22 (confirmé par Marc-Olivier le 11/11 après vision QA des originaux)** : les prompts d'origine décrivent des phénix humanoïdes (« phoenix maiden », « phoenix warrior ») — ils sont **remplacés** par la description d'oiseau de feu géant (arbitrage `phoenixFirebird` / beast confirmé : jamais de figure humaine sur z19/z22 ni sur les phénix génériques z2/z6/z16/z17/z18/z20/z21).

**QA vision des 8 originaux (e14, f18, d6, z19, a15, g16, a13, a14) — constats intégrés** : 7/8 ont un cadre de carte décoratif + texte pseudo-jeu (confirme R2) ; f18 a déjà le visage sous capuche dans l'origine (R5 indispensable) ; a15 Kenji rendu féminin (verrou 1boy indispensable) ; e14 rendu trop humain (description d'espèce plus bestiale). Palette/style/cadrage d'origine = sains (multicolore, painterly, full body centré).

**QA vision des 8 cartes vague 2 (mêmes cartes) — comparatif** : cadre/texte corrigés sur 5/8 (e14, f18, a15, a13, z19 propres) MAIS nouveaux défauts : **signatures d'artiste** sur g16 et a14 (l'anti-signature de la v2 a échoué sur 2/8), **quasi-monochrome** sur a15/a14/z19 (confirmé ~15-20 % du rapport), **dérive style anime à contours nets** sur a15/g16/a14/a13 vs painterly de l'origine, et **d6 toujours en échec** (visage sous capuche + bordure résiduelle). Sujets : a15 Kenji maintenant masculin (verrou OK), z19 = oiseau de feu conforme à l'arbitrage, e14 toujours trop humanoïde pour un titan. **Conclusion : la spéc v3 couvre déjà tous les défauts constatés des deux vagues (R2 anti-cadre, R4 anti-signature + colorful, R5 d6/f18) ; aucun changement de règle nécessaire — le témoin v3 peut partir.**

**R2 — Anti-cadre.** Remplacer les deux occurrences du style par : « Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, intricate background, epic fantasy splash artwork, rim lighting » (plus aucun mot « card » / « trading card »). Ajouter au négatif : `card frame, card border, ornate border, picture frame, text, letters, watermark, signature, logo`.

**R3 — Cadrage par rareté (règle déjà actée, précisée par R9).** Demi-corps (half body, waist up — jamais plus serré, cf. verrou R9) pour C/UC/R/SR ; full body pour M/L/UR. Vérifier carte par carte la conformité du socle (85 portrait / 175 full) et corriger les écarts. Les fonds restent paysage sans humains.

**R4 — Négatif COURT canon (§15) + correctifs §14.** Canon court + anti-cadre (R2) + anti-tags ciblés par défaut : `front lighting, visible face` en positif et anti `dark face, hood covering face` pour les sujets à capuche/ombres ; `colorful` + accent de couleur de l'univers en positif contre le quasi-monochrome ; anti-signature ; renforts f13 (colossal, beast-like, no humanoid) et phénix (beast:true, bird only, no humans). **Maximum ~20 tags de négatif.**

**R5 — Les 4 human review de la vague 2** (z22 figure parasite, a16/d6/f18 visages sombres) reçoivent un prompt v3 explicite : éclairage frontal, visage dégagé, `no hood` ; z22 = grand oiseau de feu seul, `no humans, no humanoid figure`.

**R6 — À conserver de la vague 2 (acquis).** Seeds fixes consignés (témoin 1126001→1126006, refs 2126000+, génériques 2127000+, série 2 2128000+, héros 2129001), échec explicite de mapping avec id de carte, IPAdapter **0.4 ease in-out end 0.85** (jamais 0.6 linear) pour la série 2, budgets fichiers §13, ambiances 720p **en i2v depuis key frame WAI** (jamais t2v pur).

**R7 — QA.** Le style charte (painterly semi-réaliste, couleurs saines, zéro texte/cadre) est critère BLOQUANT sur chaque lot. Livrables : planches + comparatif canon avant/après (a15 / f18 / z19) en tête du rapport vague 3, diagnostic style en tête.

## 3. Process de relance (vague 3)

1. `build-prompts.mjs` v3 : socle NL painterly corrigé → `prompts-v3.json` (271). Les 271 seeds restent ceux de `seeds-v2.csv`.
2. **Pas de point d'arrêt** (choix de Marc-Olivier du 11/11) : les 271 partent en une seule session (53 refs + 212 génériques + 6 fonds + héros + stills + série 2 IPAdapter), les 6 cartes témoins (e14, f18, d6, z19, a15, g16) générées EN PREMIER et mises en tête de la planche de contrôle pour le QA vision immédiat à la réception.
3. QA vision du couloir design à la réception du rapport ; recommandations garder / retry / relance par lot.
4. Rapport : `tools/out-v2/RAPPORT-vague3.md`.

## 4. Correctifs v3.1 (retour QA vague 3 de Marc-Olivier, 11/11)

> Style VALIDÉ (« rendu vraiment top »). Trois défauts systémiques constatés : (1) monstres rendus en hybrides humain-monstre ou en humains ; (2) beaucoup trop de bustes, il devait y avoir majoritairement du demi-corps ; (3) ~95 % des humanoïdes sont féminins. Causes dans les prompts, corrections ci-dessous, régénération ciblée des seules cartes affectées (vague 3.1), mêmes seeds.

**R8 — Bêtes = créatures pures, zéro terme humain.** Pour toute espèce `beast:true` de `species-map.json` (fireElemental, beastWood, beastWater, beastDark, phoenixFirebird, seaBehemoth, seaSerpent, …) : le prompt ne contient AUCUN terme de rôle humanoïde (« warrior in armor », « mage », « priest », « support caster », « knight », « in robes » sont retirés — ils traînent depuis le socle d'origine, ex. « A giant crab, warrior in armor »), la phrase-sujet est une description de créature pure (« a giant armored crab, … »), complétée par « a wild non-humanoid creature, no human traits, no human face, no human posture ». Négatif : `humans, humanoid, 1girl, 1boy, man, woman, human face, human posture`. Les espèces humanoïdes assumées (mermaid, dryad, shaman, herald, apostle, celestialJudge, fateWeaver, echoSpirit, undeadKnightF, human) ne changent PAS.

**R9 — Demi-corps ≠ buste.** La formule du socle d'origine « Portrait framing, head and shoulders » produit des BUSTES. Elle est remplacée partout par : « half body framing, waist up, centered » pour C/UC/R/SR (demi-corps), « full body, centered » pour M/L/UR. « head and shoulders », « bust », « close-up », « portrait » passent au NÉGATIF des cartes demi-corps.
**Verrou de cadrage minimal acté par Marc-Olivier (11/11, QA v3.1, précisé le même jour)** : la coupe la plus serrée autorisée coupe **sous la poitrine complète** — la poitrine entière doit être visible dans l'image ; toute coupe plus serrée (poitrine tronquée, tête+épaules) est NON CONFORME. Le demi-corps complet (jusqu'à la taille/hanches) reste le cadrage cible de la règle R9 pour C/UC/R/SR, la coupe sous-poitrine étant le plancher toléré. Références canoniques : `e8.jpg`, `e7.jpg`, `e15.jpg` de la vague 3.1 (coupées à la taille/hanches, donc conformes au-dessus du plancher). QA vision sur ces 3 références : style painterly confirmé, zéro texte/signature (sauf **e7 : cadre de carte résiduel → retry**), palette quasi-monochrome bleu-vert sur e7/e15 → surveiller le renfort colorful (R4) sur les cartelettes sombres des Marées.

**R10 — Parité de genre explicite.** Le checkpoint favorise fortement 1girl : ~95 % des humanoïdes sortent féminins. Correction : (1) nommées = genre verrouillé par `character_dna` comme avant (a15/a17 Kenji = homme) ; (2) génériques humanoïdes = genre assigné EXPLICITEMENT par carte, parité ~50/50 sur l'ensemble, consigné dans `tools/gender-map-v3.csv` (file,genre) et forcé dans le prompt en tête de sujet (« an adult man, … » / « an adult woman, … » + tags `1boy, male` ou `1girl, female`). L'assignation est déterministe (hash de l'id) pour rester stable aux retries. Vérification au rapport : proportion F/M des humanoïdes.

## 5. Process vague 3.1 (correctif ciblé)

1. `build-prompts.mjs` patché R8/R9/R10 → régénère `prompts-v3.json`.
2. Lister les cartes affectées depuis le diff de prompts : toutes les `beast:true`, toutes les C/UC/R/SR (recadrage), tous les génériques humanoïdes (genre). Régénérer uniquement celles-ci, mêmes seeds.
3. Planches : planche-v3-1-beasts.png, planche-v3-1-framing.png, planche-v3-1-gender.png + comptages (buste/demi-corps/full, F/M).
4. Rapport : `tools/out-v2/RAPPORT-vague3-1.md`, diagnostic style inchangé (pas de re-test du style, il est validé).

## 6. Correctifs v3.2 (retour QA v3.1 de Marc-Olivier + QA vision couloir design, 12/11)

> Retour v3.1 : style, cadrage (plancher poitrine) et parité VALIDÉS. Quatre défauts systémiques restants : (1) monstres encore rendus en humanoïdes (gobelin des Marées = « créature mystique aquatique », fongus ≠ fongus MTG, cœur de la forêt ≠ ent du LotR) ; (2) personnages trop dévêtus (vêtements ouverts sous la poitrine, bandes de tissu) — ce n'est PAS un mode explicite, ce n'est pas le but ; (3) taches de sang sur le torse/illustration qui cassent l'image ; (4) visages noirs : parfois un style sympa (arbitrage du 12/11), à juger au cas par cas. Verrous R11-R14 ci-dessous, régénération ciblée des seules cartes affectées (vague 3.2), mêmes seeds, seed+1 aux retries.

**R11 — Monstres = monstres (morphologie d'espèce concrète).** Cause racine : les descriptions d'espèce de `species-map.json` sont trop courtes/vagues, le checkpoint les interprète en humanoïde générique. Correction en DEUX volets :
1. **Réécriture des descriptions d'espèce** en morphologie concrète, canon assumé = MTG / Seigneur des Anneaux : gobelin = « a small wiry green-skinned goblin, long pointed ears, hooked nose, hunched posture, ragged loincloth, no human proportions » ; champignon = « a fungal creature in the style of Magic: the Gathering fungus, mushroom caps and growths on a stocky non-human body, spore clouds, no human face, no human anatomy » ; cœur de la forêt = « an ent, a towering tree-being like Tolkien's Ents, bark skin, branch arms, root legs, deep-set wooden face » ; sirène des Marées, mort-vivant, etc. = même exercice (morphologie, proportions, anatomie non humaine explicites). Interdits dans ces prompts : tout terme de rôle/beauté humaine ; obligatoire : « non-human anatomy, no human proportions » + négatif R8 conservé.
2. **LoRAs Civitai (expérimental, test témoin OBLIGATOIRE avant tout déploiement)** : pour les espèces récalcitrantes (goblin, skeleton/undead, mermaid), tester 1 LoRA par espèce sur 6 images témoins (mêmes seeds), poids 0.6-0.8 (jamais 1.0). Le LoRA est GARDÉ seulement si le QA vision confirme simultanément (a) morphologie correcte ET (b) style painterly inchangé (pas de dérive anime). Sinon : rejet consigné dans le rapport, fallback sur le volet 1 (description). Aucune régression du style validé ne sera acceptée pour gagner de la morphologie.

**R12 — Tenues correctes (anti-dévêtissement).** Le checkpoint (biais danbooru) dénude par défaut. Positif ajouté aux humanoïdes : « fully clothed, practical adventurer outfit, modest fantasy attire, covered torso » adapté à la classe (armure pour guerriers, robe complète pour mages/prêtres). Négatif ajouté : `revealing clothing, exposed chest, cleavage, underboob, open shirt, bare torso, bandage wrap, loincloth`. Les humanoïdes assumés à l'anatomie particulière (sirène : écailles) gardent leur description d'espèce, qui précise le degré de couverture. BUT : un jeu de cartes tout public, PAS un mode explicite (arbitrage du 12/11).

**R13 — Pas de sang par défaut.** Négatif global ajouté : `blood splatter, gore, open wounds, blood stains`. Whitelist possible ultérieurement par carte (`blood-ok` dans species-map) pour les rares cartes où c'est thématiquement assumé ; en 3.2, AUCUNE carte n'est whitelistée.

**R14 — Visages sombres : tolérés au cas par cas (arbitrage Marc-Olivier 12/11).** Ce n'est plus un défaut bloquant systématique : « parfois cela donne un style sympa ». Règle : (1) PAS de retry automatique pour un visage sombre ; (2) le verrou « visage lisible » (front lighting, face clearly visible) reste OBLIGATOIRE pour les nommées avec character_dna et les héros (identité du personnage) ; (3) pour les génériques, verdict visuel au QA, retry seulement si le visage est censé porter l'expression de la carte et est totalement illisible. Les capuches ne sont plus forcées à tomber.

**Correctif résiduel v3.1 à intégrer au lot 3.2 (QA vision couloir design, 12/11)** : `b3` (UR) rendue en demi-corps au lieu du full body → retry framing-ur avec positif « full body framing, standing pose, entire figure visible from head to feet ». `e14`/`g7` : vérifier l'entrée `species-map.json` avant tout retry (l'image poussée semble humanoïde ; si l'espèce est assumée humanoïde, pas de défaut).

**Signatures d'artiste (~25 % de l'échantillon) : post-traitement, pas de régénération.** Le négatif ne suffit pas sur WAI v17. ACTÉ : crop systématique de 4 % du coin bas-droit en post-traitement sur TOUTE la production 400×560 (et vérification légère d'un liseré sombre en bordure, cf. sur-signal « cadre » sur 5/20 vignettes — si un vrai cadre généré est confirmé sur une carte, même medicine).

## 7. Process vague 3.2 (correctif ciblé)

1. Patcher `species-map.json` (descriptions R11) et `build-prompts-v31.mjs` → `build-prompts-v32.mjs` régénérant `prompts-v3.json` avec R11/R12/R13 (R14 = règle de QA, pas de prompt).
2. **Phase test LoRA (en tête de session, autonome)** : télécharger 2-4 LoRAs candidats, générer les témoins (6 par LoRA), QA vision auto, garder/rejeter chaque LoRA, consigner. Aucun arrêt humain : rejet = fallback description.
3. Régénérer uniquement les cartes affectées : toutes les `beast:true` + toutes les espèces réécrites R11, tous les humanoïdes (tenues R12), toutes les cartes avec sang (R13, détectées au QA vision par lot de ~20), + b3 + les éventuels échecs e14/g7 selon species-map. Mêmes seeds, retries en seed+1.
4. Crop signatures 4 % bas-droit sur l'ensemble de la production (3.1 + 3.2).
5. Planches : planche-v3-2-species.png, planche-v3-2-tenues.png + comptages (monstres humanoïdes, tenues non conformes, sang, visages).
6. Rapport unique : `tools/out-v2/RAPPORT-vague3-2.md` avec verdict LoRA par LoRA (gardé/rejeté + raison) et compter garder/retry par lot.
