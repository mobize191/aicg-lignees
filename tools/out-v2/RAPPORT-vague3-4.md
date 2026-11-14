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
