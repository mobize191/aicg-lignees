# QA vision vague 3 — verdict et liste de retry (couloir design, 11/11/2026)

> QA réalisé par Vibe (vision) sur le lot v3 du repo (SHA f53e491). Méthode : analyse image par image (fiable) + analyse des planches par univers (utilisée en détection, voir réserve ci-dessous).

## 1. Verdict global

Le lot v3 a **trois défauts systémiques** (confirmés par le propriétaire) + deux défauts accidentels répandus. Ils correspondent EXACTEMENT aux manques corrigés par R8/R9/R10 de la spéc 3.1, qui n'étaient PAS encore appliqués à ce lot (généré avant la 3.1).

### Défauts systémiques (règles, pas accidents)

| Défaut | Constat QA | Règle corrective |
|---|---|---|
| Cadrage buste | Échantillon a1-a30 : coupures « poitrine » (a1, a30) ; planche gen-recrues : 33/33 vignettes en buste (toutes C/UC — la formule « head and shoulders » produit systématiquement des bustes sur les cartes C/UC/R/SR) | **R9** (waist up, plancher sous-poitrine) |
| Parité de genre | Échantillon a1-a30 : 22 femmes / 2 hommes (a15, a17 seulement, verrouillées par character_dna) ; biais 1girl total sur les génériques sans verrou | **R10** (genre forcé, parité ~50/50) |
| Bêtes humanoïdes | e8 (Matriarche des Récifs) rendue en femme à peau bleue au lieu d'une créature ; planche gen-crypte : k26/k28/k29 signalés humains (chevaliers défunts attendus bestiaux/défunts distincts) | **R8** (créature pure, zéro terme de rôle humain) |

### Défauts accidentels répandus (à_RETRY)

- **Cadres de carte résiduels** : échantillon a1-a30 : 8/24 (a2, a12, a19, a20, a24, a25, a27, a29) ; planche gen-crypte : 23/23 vignettes signalées ; gen-forge : 24/24 ; gen-divin : 18/18. Le négatif anti-cadre v3 ne tient pas partout → renforcer (anti-frame + suppression de toute évocation de cadre dans le positif, prompt « full bleed artwork »).
- **Texte/signature** : échantillon a1-a30 : 4/24 (a14, a17, a18, a20) ; planches zenith/refs/serie2 : signalé très largement.
- **Visages sombres/cachés** : a16, g2, a2, a7, f3, f4, f13, k3, k4, k23, k24, k25, d2, d3, d15, d16, b2, b3.
- **Quasi-monochrome** : a2, a13, a16, a18, a29, k5 (à vérifier individuellement).
- **d6** : échec persistant (capuche).

### Réserve méthodologique

L'analyse des planches sur-signal massivement « CADRE, TEXTE » (grille d'annotation + bordures de vignettes confondues avec des cadres de carte) : elle sert de détection d'amplitude, PAS de verdict par carte. Le verdict par carte ne peut venir que du QA image par image (limite technique : 20 images par session QA).

## 2. Recommandation : relance complète en v3.1 plutôt que retry ciblé

Les règles 3.1 (R8/R9/R10) + les renforts anti-cadre/anti-texte/visage touchent de fait **la quasi-totalité du lot** (~200/271 cartes par les seules règles + les accidents constatés sur les refs et la série 2). Un retry ciblé épargnerait moins de 70 images. **Recommandation : régénérer tout le lot en v3.1** (mêmes seeds), qui applique R8/R9/R10 + négatif anti-cadre renforcé + visage frontal généralisé. Coût marginal ≈ 3 h de GPU, cohérence garantie.

À l'exception de : héros d'errance, fonds, stills et vidéos v3 (validés, pas concernés par les règles).

## 3. Auto-QA exigé du rapport v3.1

- Comptages : % vignettes coupées ≥ sous-poitrine, proportion F/M des humanoïdes, 0 humain sur les espèces `beast:true`, 0 cadre, 0 texte/signature, 0 visage sombre (hors arbitrage volontaire).
- Le QA par planche du pipeline local DOIT être complété par un contrôle image par image sur un échantillon aléatoire de 20 cartes avant de conclure « garder ».
- Vibe refait le QA vision complet (image par image) à la réception du lot 3.1, avant intégration au dist.
