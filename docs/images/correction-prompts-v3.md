# Spéc de correction — prompts v3 (retour au socle NL painterly d'origine, corrigé)

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

**R3 — Cadrage par rareté (règle déjà actée).** Demi-corps (portrait framing, head and shoulders) pour C/UC/R/SR ; full body pour M/L/UR. Vérifier carte par carte la conformité du socle (85 portrait / 175 full) et corriger les écarts. Les fonds restent paysage sans humains.

**R4 — Négatif COURT canon (§15) + correctifs §14.** Canon court + anti-cadre (R2) + anti-tags ciblés par défaut : `front lighting, visible face` en positif et anti `dark face, hood covering face` pour les sujets à capuche/ombres ; `colorful` + accent de couleur de l'univers en positif contre le quasi-monochrome ; anti-signature ; renforts f13 (colossal, beast-like, no humanoid) et phénix (beast:true, bird only, no humans). **Maximum ~20 tags de négatif.**

**R5 — Les 4 human review de la vague 2** (z22 figure parasite, a16/d6/f18 visages sombres) reçoivent un prompt v3 explicite : éclairage frontal, visage dégagé, `no hood` ; z22 = grand oiseau de feu seul, `no humans, no humanoid figure`.

**R6 — À conserver de la vague 2 (acquis).** Seeds fixes consignés (témoin 1126001→1126006, refs 2126000+, génériques 2127000+, série 2 2128000+, héros 2129001), échec explicite de mapping avec id de carte, IPAdapter **0.4 ease in-out end 0.85** (jamais 0.6 linear) pour la série 2, budgets fichiers §13, ambiances 720p **en i2v depuis key frame WAI** (jamais t2v pur).

**R7 — QA.** Le style charte (painterly semi-réaliste, couleurs saines, zéro texte/cadre) est critère BLOQUANT sur chaque lot. Livrables : planches + comparatif canon avant/après (a15 / f18 / z19) en tête du rapport vague 3, diagnostic style en tête.

## 3. Process de relance (vague 3)

1. `build-prompts.mjs` v3 : socle NL painterly corrigé → `prompts-v3.json` (271). Les 271 seeds restent ceux de `seeds-v2.csv`.
2. **Pas de point d'arrêt** (choix de Marc-Olivier du 11/11) : les 271 partent en une seule session (53 refs + 212 génériques + 6 fonds + héros + stills + série 2 IPAdapter), les 6 cartes témoins (e14, f18, d6, z19, a15, g16) générées EN PREMIER et mises en tête de la planche de contrôle pour le QA vision immédiat à la réception.
3. QA vision du couloir design à la réception du rapport ; recommandations garder / retry / relance par lot.
4. Rapport : `tools/out-v2/RAPPORT-vague3.md`.
