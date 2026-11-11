# Spéc — campagne d'arts série 3 (couloir design)

> Complément design de la campagne d'arts série 3 définie dans `docs/design/contenu-v3-spec-plan.md`. Pipeline : WAI-Illustrious v17, prompts NL painterly, budgets §13, masters hors repo, manifeste `assets-v3.json`. **Cette spéc hérite de TOUS les verrous de `docs/images/correction-prompts-v3.md` (R1-R10) et du verdict QA `tools/out-v2/RAPPORT-qa-vague3.md`** : la vague 3 a échoué sur les cadrages bustes, la parité de genre, les bêtes humanoïdes et les cadres résiduels — les arts série 3 sont générés DIRECTEMENT en règles 3.1, sans passer par une itération de correction.

## Verrous (bloquants, hérités 3.1 + renforts)

1. **Anti-cadre / anti-texte renforcés** (défaut n°1 du QA v3) : positif « full bleed artwork, edge to edge illustration » ; négatif `card frame, card border, ornate border, picture frame, panel border, vignette border, text, letters, numbers, watermark, signature, logo, inscription`.
2. **Cadrage** : cartes humanoïdes C/UC/R/SR = demi-corps « half body framing, waist up » (plancher : poitrine complète visible, jamais plus serré) ; M/L/UR = full body. Fonds et objets = plan plein.
3. **Genre** : verrouillé par nommée (`character_dna`) ; génériques humanoïdes = genre explicite par carte, parité ~50/50, `tools/gender-map-v3.csv`.
4. **Espèces** : depuis `species-map.json` uniquement ; `beast:true` = créature pure sans aucun terme de rôle humain (négatif humans/humanoid) ; humanoides assumés (sirène, dryade, chaman…) inchangés.
5. **Palettes** : par donjon (charte), `colorful` + accent en positif contre le quasi-monochrome ; visage « clearly visible, front lighting » pour tout sujet.

## Réutilisation des arts existants (delta manifeste)

Ne PAS régénérer les arts déjà validés (v3/3.1 conformes au QA) : Sirènes e23-e27 + e29 (Méliane e28, Thalassa e30 existent déjà comme nommées), Clergé du Jour z29/z30 (Justine/Apolline), divines d1-d18, compagnons b1-b7 (7 UR), Ange n13, Enge (e23 Sirène Nouvelle…), solos archivés (arts des 31 solos déjà produits en v1/v2 — à vérifier en QA). Le compte exact des NOUVELLÉS se fait depuis le delta du manifeste `assets-v3.json` : nommées L des compagnons (7), gobelins régionaux (~8), maillons du Jeune Séraphin, Gorgonne/Fée Nouvelle, etc. Toute régénération d'un art existant se justifie par un défaut QA documenté.

## Équipement : 90 arts complets (5 sets × 6 pièces × 3 paliers)

- **Gabarit d'objet** (NL painterly) : « A single <pièce d'équipement> <description précise : forme, matière, détail signature du set>, presented alone, centered on a plain neutral surface, <palette du set/donjon>, soft ambient light, detailed shading. Painted in a painterly, semi-realistic fantasy illustration style, detailed shading, epic fantasy splash artwork, rim lighting. Full bleed artwork, no frame, no text. »
- **Zéro personnage** : l'objet est seul (pas de porteur, pas de main, pas de silhouette) — négatif `humans, humanoid, hands, character, 1girl, 1boy`.
- **3 paliers = escalade visuelle de la MÊME pièce** (identité de set lisible) : palier 1 = version simple, matière sobre ; palier 2 = runique, une lueur/gravure enchantée discrète ; palier 3 = version auréolée, matériaux précieux, effet magique affirmé. Garder la composition identique entre paliers d'une même pièce (vue et angle constants) pour lire la progression d'un coup d'œil ; IPAdapter depuis l'art palier 1 (poids 0.4, ease in-out, end_at 0.85) recommandé pour les paliers 2-3.
- **Identité de set** : une signature visuelle par set (matière, motif, symbole) constante sur les 6 pièces.
- Échelle d'image = même format que les cartes (400×560, §13), masters 1040×1520 hors repo.

## Livraison et QA

- 2 vagues : (v1) cartes v3 nouvelles — après que le couloir code a posé les ids définitifs ; (v2) équipement.
- **QA vision image par image avant intégration au manifeste** (Vibe, 20 images par session) : style charte bloquant, 0 cadre, 0 texte, cadrage conforme, genre conforme, bêtes bestiales. Planches de contrôle par lot + comptages en tête du rapport.
- Smoke : vérifier une image présente par carte/objet après intégration manifeste.
