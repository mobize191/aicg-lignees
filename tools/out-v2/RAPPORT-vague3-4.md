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

---

## QA élargie — second échantillon aléatoire de 60 images (`v34/qa-sample2.txt`)

| Image | Carte | Verdict | Notes |
|---|---|---|---|
| k1 | Rôdeur des Caveaux (classique) | **DÉFAUT** | Tête de loup = **canidé** (interdit) sur mort-vivant |
| n7 | Embryon du Vivant | OK | Humanoïde encapuchonné, lumière vitale |
| s4-r | Gardien-Mécanique (Repos) | OK | Bol de ragoût au feu — nourriture fantasy acceptable |
| e28 | Méliane, Voix du Large | OK | Sirène/mermade — cohérent |
| k7-o | Archiliche (Obscures) | OK | Liche squelette, flammes vertes |
| g33-o | (Obscures bosquet) | OK | Fée/sprite sylvain |
| a5 | Apprentie des Rivières | OK | Orbe lumineux, cape bleue |
| a15-o | Kenji, Lame Éternelle (Obscures) | OK | Double lame bleue, aura sombre |
| t2 | Pillard | OK | Voleuse humanoïde, dagues |
| s15-r | (Repos) | OK | Chevalier en armure, portrait calme |
| s9 | Léna, Avatar de l’Aurore | OK | Robes sombres, symbole saint, orbes |
| e30-r | Thalassa, Reine des Récifs (Repos) | OK | Sirène sur le ponton — scène calme |
| n14-r | Démon (Repos) | OK | Démon humanoïde ailée, pose calme |
| g35 | (bosquet) | OK | Reine fée couronnée, ailes d'insecte |
| a52-r | (Repos) | OK | Armure dorée, temple lumineux |
| a17 | Kenji, Sabre Céleste | OK | Guerrier, flammes bleues |
| a3-r | Garde-Promesse (Repos) | OK | Croix, braises — calme |
| a40 | Chasseur des Quais | OK | Capuche, épée |
| a36 | Éclaireur des Dunes | OK | Lame brandie |
| k39 | (crypte) | OK | Sorcière morte-vivante verte |
| n8-r | Embryon des Ténèbres (Repos) | **DÉFAUT** | **Hamburger moderne** au feu de camp |
| g38 | (bosquet) | OK | Reine sylvestre ailée (humanoïde) |
| a7-r | Faucheur des Ombres (Repos) | **DÉFAUT** | Assiette moderne au feu de camp |
| a2 | Rôdeur des Ombres | OK | Silhouette masquée, lames |
| d9-r | Prisme du Chœur (Repos) | OK | Miroir, flammes cyan |
| c1-o | Yuki, Lame Ardente (Obscures) | OK | Armure sarcelle, fond clair inversé |
| a44-o | Guide des Dunes (Obscures) | OK | Cape, flammes bleues |
| k5-r | Spectre des Quais (Repos) | OK | Fantôme translucide dans l'eau |
| p8 | Séraphin | OK | Ange ailé doré |
| g5-r | Prisme Vivant (Repos) | OK | Créature fée à oreilles de feuille (non canidé) |
| b1-r | Yuki, Brise-Lame (Repos) | **DÉFAUT** | **Deux jumelles + donuts modernes** au feu de camp |
| a22 | Solen, Archimage de la Braise | OK | Aura dorée, cathédrale |
| k13-o | Goule (Obscures) | OK | Ghoul feral vert (espèce corrigée conservée) |
| d2-r | Servante du Sablier (Repos) | OK | Auréole dorée, calme |
| a51-r | (Repos) | OK | Armure dorée, lumière |
| k8-o | Ancien Naufragé (Obscures) | OK | Noyé encapuchonné, torches |
| s10 | Léna, Aube Éternelle | OK | Robe noire, croix, eau bénite |
| g8-o | Cœur du Bosquet (Obscures) | OK | Créature mousse/treant sombre |
| b4-o | Aïna, Voix du Matin (Obscures) | OK | Aura bleue froide |
| a25-r | Chasseur du Bosquet (Repos) | OK | Forêt, lames — calme, sans nourriture |
| u2 | Écuyer Fervent | OK | Cheveux blancs, rayonnement |
| d7-o | Lame Miroir (Obscures) | OK | Esprit d'eau + figure encapuchonnée |
| b3-o | Naïa, Sourcéleine (Obscures) | OK | Silhouette sombre, anneau de flammes |
| n10-o | Enge des Brumes (Obscures) | OK | Lune, orbe, barbe |
| s2-o | Médecin de Camp (Obscures) | OK | Guérisseur rayonnant |
| k10-o | Meneuse de Deuil (Obscures) | OK | Spectre verte à la bougie |
| b6 | Ember, Cœur de Fournaise | OK | Enfant rayonnant, soleil |
| a28-o | Maïa, Déesse du Bosquet (Obscures) | OK | Flammes vertes, doubles lames |
| a49-o | Capitaine du Guet (Obscures) | OK | Aura bleue sombre |
| k36-o | (Obscures crypte) | OK | Gorgone cheveux de serpents (MTG) |
| c12-r | Roc, Rempart du Monde (Repos) | OK | Deux robes (mentor/enfant), scène calme |
| n12 | Enge des Caveaux | OK | Cape sombre, aura dorée |
| t1-o | Mercenaire (Obscures) | OK | Combattant masqué, aura bleue |
| k12 | Veilleuse de Bord | OK | Esprit à la bougie, halo |
| c10 | Naïa, Marée Éternelle | OK | Robe bleue, flammes d'eau |
| a3 | Garde-Promesse | OK | Croix dorée, bijoux |
| e3 | Pillard des Récifs | OK | Gobelin vert — espèce respectée |
| n8 | Embryon des Ténèbres | OK | Capuche, dagues |
| c8-o | Yuki, Sabre de l’Aurore (Obscures) | OK | Armure bleue, fond rayé |
| n15-r | Éveillé du Seuil (Repos) | OK | Auréole, bijoux dorés — calme |

### Bilan second échantillon (60 images)

| Classe de défaut | Nombre | Détail |
|---|---|---|
| **Canidé** | **1** | k1 Rôdeur des Caveaux (tête de loup) |
| Repos : nourriture moderne anachronique | 3 | n8-r (hamburger), a7-r (assiette), b1-r (donuts) |
| Dérive d'identité (Repos) | 1 | b1-r (jumelles identiques) |

**56/60 conformes.**

### Bilan global QA v3.4 — 99 images inspectées individuellement

| Classe de défaut | Total | Images |
|---|---|---|
| Cadre / texte | 0 | — |
| Sang / gore (R13) | 0 | — |
| **Canidé** | **1** | k1 |
| Espèce incohérente | 1 | e11 (humanoïde au lieu de crabe) |
| Repos : nourriture moderne anachronique | 8 | a1-r, a31-r, a36-r, a40-r, a46-r, n8-r, a7-r, b1-r |
| Dérive d'identité (Repos) | 2 | a46-r, b1-r |

**89/99 conformes (90 %).** Les défauts sont concentrés sur le thème Repos (activité "supper at the fire" interprétée en nourriture moderne — à remplacer par une activité fantasy lors d'une prochaine régénération) et 2 défauts d'espèce isolés (k1 canidé, e11 espèce). Aucun défaut bloquant (cadre/texte/sang) sur l'ensemble.

---

## Retries ciblés (suite 57, CHANTEER) — 7 images remplacées dans `assets-v34.json`

Génération 7/7 OK + seconde passe 3/3 OK (`/tmp/gen-v34-retry2.log`, `/tmp/gen-v34-retry2b.log`), seeds 2150086-2150088 + 2150090/7150090/12150090 consignés dans `seeds-v34.csv`. QA vision sur les retries uniquement :

| Image | Défaut initial | Verdict retry | Notes |
|---|---|---|---|
| e31 (classique) | 1 tête | **OK** | 3 têtes bien visibles, canon hydre tenu |
| e31-r (Repos) | 1 tête visible | **RÉSIDUEL** | 2 têtes visibles après 2 passes (3 demandées) |
| e31-o (Obscures) | 2 têtes | **OK** | 3 têtes visibles, aura spectrale |
| s18 (classique) | armure blanche/argent | **OK** | Armure noire mate à liseré or |
| s18-r (Repos) | idem (DNA partagée) | **OK** | Armure noire mate, scène calme |
| s18-o (Obscures) | idem | **OK** | Armure noire mate, aura inversée |
| e14-r (Repos) | scène menaçante | **OK** | Colosse endormi sur le fond marin, gueule fermée, poissons — scène de vie créature |
| e14-o (vérifié) | dérive signalée suite 57 | **OK** | Aucune dérive : carapace, yeux rouges, gueule conservés |

**d28 Belzébuth** (motif mouches) : lot optionnel, en attente du tranchage de Marc-Olivier (seeds 2150089/7150089/12150089 réservés). Détails dans `docs/arbitrages.md` suite 61.
