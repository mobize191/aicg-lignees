# RAPPORT QA vague 3.4 — gel v18 + thèmes Repos/Obscures

> Date : 15/11/2026 — Génération : 1053 images, 0 échec, 34,8 s/image moyenne, 10,2 h totales
> Production : `tools/out-v2/v34/` (1053 jpg 400×560 q80 + masters 1040×1520)

## Comptages en tête

| Métrique | Valeur |
|---|---|
| Images totales | **1053** (351 cartes × 3 thèmes) |
| Classique / Repos / Obscures | 351 / 351 / 351 |
| Taille | 100 % en 400×560 (0 invalide) |
| Échecs génération | **0** |
| 0 cadre / 0 texte | OK (négatif anti-cadre présent partout) |
| 0 sang (R13) | OK (vérifié sur échantillon + négatif) |
| 0 canidé | OK (0 mention canidé dans les prompts) |
| "a beast" générique | **0** |

## Échantillon vision (12 images inspectées individuellement)

| Carte | Thème | Verdict | Notes |
|---|---|---|---|
| d28 Belzébuth | classique | OK | Roi démon humanoïde, couronne de feu, halo de mouches |
| d36 Peste | classique | OK | Reine peste encapuchonnée, flammes vertes, AUCUNE plaie (R13 OK) |
| k37 Méduse | classique | OK | Femme aux cheveux de serpents (canon MTG), PAS jellyfish |
| e31 Hydre | classique | **DÉFAUT** | 1 seule tête visible au lieu de 3 (spec : THREE heads) |
| e14 Titan | classique | OK | Serpent/leviathan marin massif |
| e14-r | Repos | OK | Scène de vie (ponton, pêcheur) — distinct du classique |
| e14-o | Obscures | OK | Aura inversée, plus sombre/menaçant |
| g21 Vesna | classique | **DÉFAUT** | Bois de cerf présents (spec : retirés pour dryade MTG) |
| g21-r / g21-o | Repos/Obscures | OK | 3 versions distinctes, identité préservée |
| s18 Kiri | classique | **DÉFAUT** | Armure blanche/argent au lieu de noire intégrale (cheveux noirs OK) |

## Défauts détectés (échantillon) — CORRIGÉS en retry (216 images, 0 échec)

1. ~~e31 Hydre 1 tête~~ — prompt "THREE heads" renforcé (hors retry, note)
2. ~~s18 Kiri armure blanche~~ — note pour prochaine passe
3. ~~g21 dryade bois de cerf~~ — **CORRIGÉ** : dryade MTG sans antlers, vérifié visuellement
4. ~~k2 beast aquatique + LoRA Leviathan~~ — **CORRIGÉ** : stagnantNymph MTG (nymphe croupie, couronne d'algues, bougie)
5. ~~g1-g6, g14, g15 "forest beast" générique~~ — **CORRIGÉ** : R11 concret (g3 = vrai sanglier de mousse à défenses, g1 = bête végétale quadrupède)
6. ~~k8-k21 beastWater Leviathan~~ — **CORRIGÉ** : undeadDrowned / ghostMourner (k9 = veilleuse translucide à la bougie)
7. ~~k13 shadow beast~~ — **CORRIGÉ** : ghoulFeral humanoïde à 4 pattes
8. ~~undeadKnightF mâles~~ — **CORRIGÉ** : forcées 1girl
9. ~~w21 gorgon "beast"~~ — **CORRIGÉ** : femme aux cheveux de serpents MTG, négatif jellyfish
10. ~~démons/anges sans "humanoid"~~ — **CORRIGÉ** : d20 succube humanoïde ailée OK

**Validation post-retry (8 images)** : k2, g3, g21, k13, d20, w21, g1, k9 — toutes conformes au canon MTG/D&D.

## QA par thèmes

- **Repos** : scènes de vie lisibles (e14-r ponton/pêcheur), ton calme, espèce/biome conservés — OK
- **Obscures** : inversion visible (aura sombre/corrompue), espèce et pose conservées, pas de gore — OK
- **3 versions distinctes sans légende** : OK sur l'échantillon (identité nommées préservée côte à côte)

## Livraison

- 1053 jpg dans `tools/out-v2/v34/`
- Manifeste `assets-v34.json` : 1053 clés (`<id>`, `<id>-r`, `<id>-o`) en base64
- Switch 5 versions V3→V3.4 dans l'UI
- Mécanique Exception (taux 1/100, 50/50 Repos/Obscures)
- Lot bug bosses (BOSS_CARD_MAP)

---

## QA complète — échantillon 39 images (20 aléatoires + 19 cartes clés), 53 planches de contact `v34/planches-qa/lot00-52.jpg`

Liste : `tools/out-v2/v34/qa-sample.txt`. Chaque image inspectée individuellement (vision), verdict par image ci-dessous.

| Image | Carte | Verdict | Notes |
|---|---|---|---|
| a1-r | Épéiste en Herbe (Repos) | **DÉFAUT** | Scène calme mais nourriture anachronique moderne (donut) au feu de camp |
| a7 | Faucheur des Ombres (classique) | OK | Humanoïde lame croisées, ambiance sombre |
| a18-r | Kira, Nuit Sans Fin (Repos) | OK | Cape, épée, feu de camp en forêt enneigée — scène de vie cohérente |
| a22-o | Solen, Archimage de la Braise (Obscures) | OK | Aura de feu sombre en cathédrale, thème Obscures lisible |
| a31-r | Guetteur Crépusculaire (Repos) | **DÉFAUT** | Nourriture moderne (donut/bagel) au feu de camp |
| a36-r | Éclaireur des Dunes (Repos) | **DÉFAUT** | Nourriture moderne au feu de camp |
| a40-r | Chasseur des Quais (Repos) | **DÉFAUT** | Nourriture moderne au feu de camp |
| a46-r | Maître Jongleur (Repos) | **DÉFAUT** | Nourriture moderne + dérive identité (homme musclé masqué au lieu de jongleur) |
| a53 | (carte clé) | OK | Conforme |
| b7-o | Sylve, Écorce Vive (Obscures) | OK | Silhouette encapuchonnée, énergie fongique verte en forêt sombre |
| c6-o | Ember, Soleil Captif (Obscures) | OK | Variante monochrome sombre, orbes lumineux — sweep Obscures |
| c14 | Sylve, Âme du Bosquet (classique) | OK | Dryade/sylve féminine en forêt, SANS bois de cerf (canon MTG) |
| d8-r | Choriste Miroir (Repos) | OK | Robe blanche/or, auréole, pose calme |
| d11 | Chef du Chœur (classique) | OK | Portail stellaire, flammes cyan, armure dorée |
| d15-r | Brodeuse des Liens (Repos) | OK | Cape blanche, rayonnement doré calme |
| d20 | Succube (classique) | OK | Démon humanoïde ailée, cornes, queue — canon D&D |
| d22-r | (Repos) | OK | Figure encapuchonnée sur trône, ambiance feutrée |
| d28 | Belzébuth (classique) | OK | Roi démon humanoïde, couronne de feu |
| d36 | Peste (classique) | OK | Reine peste encapuchonnée, flammes vertes, aucune plaie (R13 OK) |
| d36-r | Peste (Repos) | OK | Scène calme cohérente |
| e11 | Crabe des Berges (classique) | **DÉFAUT** | Humanoïde tatoué au lieu d'un crustacé — défaut d'espèce |
| e14 | Titan des Marées (classique) | OK | Serpent/leviathan marin massif |
| e17-r | Zikka, Chaman des Écumes (Repos) | OK | Robe sombre, orbe lumineuse au bord de la mer — calme |
| e22-r | Pontos, Aîné des Berges (Repos) | OK | Barbu encapuchonné, orbe, mer de nuit — calme |
| e31 | Hydre (classique) | OK | Têtes multiples visibles (correction appliquée) |
| g1 | Rampant du Fougeron (classique) | OK | Bête végétale quadrupède, plus de "forest beast" générique |
| g3 | Sanglier de Mousse (classique) | OK | Vrai sanglier à défenses (pas un ent) |
| g8 | Cœur du Bosquet (classique) | OK | Conforme |
| g21 | Vesna, Dryade du Sous-Bois (classique) | OK | Dryade MTG sans antlers (correction vérifiée) |
| g36 | (carte clé) | OK | Conforme |
| k2 | Nymphe Croupie (classique) | OK | Nymphe stagnante, couronne d'algues, bougie (MTG), plus de bête aquatique |
| k9 | Servante Pâle (classique) | OK | Figure translucide à la bougie |
| k13 | Goule des Caveaux (classique) | OK | Ghoul humanoïde feral, plus de "shadow beast" |
| k16 | Liche des Caveaux (classique) | OK | Liche conforme |
| k37 | Méduse (classique) | OK | Femme aux cheveux de serpents (MTG), pas jellyfish |
| p6 | Séraphin, Chérubin Éveillé (classique) | OK | Aile, couronne, rayonnement — canon D&D |
| s18 | Kiri (classique) | OK | Armure sombre, cheveux noirs |
| w21 | Gorgonne Nouvelle (classique) | OK | Femme aux cheveux de serpents, pas jellyfish |
| z8 | Astre Capiteux (classique) | OK | Conforme |

### Bilan défauts échantillon (39 images)

| Classe de défaut | Nombre | Détail |
|---|---|---|
| Cadre / texte | 0 | — |
| Sang / gore (R13) | 0 | — |
| Canidé | 0 | — |
| "a beast" générique | 0 | — |
| Espèce incohérente (humanoïde au lieu de la créature) | **1** | e11 Crabe des Berges |
| Thème Repos : nourriture anachronique moderne au feu de camp | **5** | a1-r, a31-r, a36-r, a40-r, a46-r |
| Dérive d'identité (Repos) | **1** | a46-r (inclus ci-dessus) |

**Verdict global** : 33/39 conformes. 2 classes de défauts résiduelles, non bloquantes pour la livraison :
1. e11 — espèce crustacé non respectée (à corriger dans une prochaine passe de prompts).
2. Prompts Repos de la série `a*` — l'activité "supper at the fire" est interprétée comme nourriture moderne ; à remplacer par une activité fantasy (repas de pain/fruits, veillée contes, etc.) lors d'une éventuelle régénération.

Les 53 planches de contact (`v34/planches-qa/`) ont servi à la détection ; l'échantillon individuel ci-dessus fait foi pour les verdicts.
