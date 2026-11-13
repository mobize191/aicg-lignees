# RAPPORT de build — vague 3.3 (PHASE 1 uniquement, point d'arrêt avant génération)

Date : 13/11. Spec : `docs/images/spec-arts-v33.md` (arbitrages 13/11). Builder : `tools/build-prompts-v33.mjs`. Sortie : `tools/prompts-v33.json` (+ `tools/seeds-v33.csv`, `tools/gender-map-v33.csv`).

## 1. Comptages

- **308 prompts** au total = **271 relancées** (périmètre v3.1, dont 6 fonds repris tels quels) + **37 nouvelles cartes** (c1-c14, p5, p6, w1-w21).
- Auto-vérification du builder : **OK (0 erreur)** — aucun mot « card » en positif, aucun fragment de nom, cadrage conforme (UR/L/M = full body, sinon demi-corps), genre R10 verrouillé, seeds présents partout.
- **Seeds** : les 271 gardent exactement les seeds de `prompts-v3.json` / `seeds-v3.csv` (vérifié un par un) ; les 37 nouvelles = **2150000+** (c1=2150000 … w21=2150036), déjà consignés dans `tools/seeds-v3.csv`.
- Parité R10 : **124 F / 106 M** sur 230 humanoïdes genrés (hash v3.1 inchangé).

## 2. Conformité arbitrages 13/11 (vérifiée dans le build)

- **Zéro LoRA hors les 3 espèces gagnantes** : 25 prompts portent un LoRA, uniquement sur `Leviatan.safetensors` / `Golems.safetensors` / `Forest-Guardians-000014.safetensors`, uniquement sur leurs espèces (voir §3). LoRAs abandonnés (goblin, wow-undead, banshee, cordyceps, creepy wolf, mermaid) : **0 branchement**, espèces en description R11 seule.
- **Zéro tag R12** (ni `fully clothed…` en positif, ni `revealing…` en négatif) — test regex R12 sur positif ET négatif de toutes les cartes : 0 hit.
- **Anti-sang seul (R13)** : `blood splatter, gore, open wounds, blood stains` (4 tags) dans le négatif de **toutes les cartes** (302/302, fonds exclus).
- **Zéro prompt Fx** : aucun id `fx-*` dans `prompts-v33.json`.
- **Sirènes durcies sans LoRA** : positif `mermaid with a long fish tail instead of legs` + négatif `feet, human legs` sur les 9 sirènes : e23, e24, e25, e26, e27, e28, e29, e30, w19.

## 3. LoRAs par carte (poids retenu 3.2 = 0.7, jamais 1.0)

| Fichier LoRA | Cartes (espèce, trigger) |
|---|---|
| `Leviatan.safetensors` (11) | e14 (seaBehemoth), e13 (seaSerpent), k2, k8, k9, k10, k11, k12, k18, k20, k21 (beastWater) — trigger `leviathan a sea monster` |
| `Golems.safetensors` (2) | f22 Vulcain (magmaGolem), f13 Seigneur des Cendres (fireLord) — trigger `Magma Golem` |
| `Forest-Guardians-000014.safetensors` (12) | g7, g8 (treant, `FG-V2.0-Treant`), g9, g10, g11, g12, g17, g19, g20, g21 (dryad, `FG-V2.0-Dryad`), g18, w20 (fireflySpirit, `FG-V2.0-Spirit`) |

## 4. Longueurs de négatif

Toutes les cartes : **20 tags exactement** (plafond canon §15 respecté après ajout des 4 tags anti-sang ; ordre de priorité anti-cadre > anti-sang > ciblés > cadrage > qualité, dédupliqué, tronqué à 20). Positifs : 494-792 caractères.

## 5. Les 37 nouvelles cartes (seeds 2150000+)

| id | nom | rareté | espèce | seed | remarques |
|---|---|---|---|---|---|
| c1 | Yuki, Lame Ardente | UR | human | 2150000 | ipa b1 |
| c2 | Onyx, Lame Funeste | UR | human | 2150001 | ipa b2 |
| c3 | Naïa, Source du Large | UR | human | 2150002 | ipa b3 |
| c4 | Aïna, Chant de l'Aube | UR | human | 2150003 | ipa b4 |
| c5 | Roc, Montagne Vivante | UR | human | 2150004 | ipa b5 |
| c6 | Ember, Flamme Vive | UR | human | 2150005 | ipa b6 |
| c7 | Sylve, Griffe Sylvestre | UR | human | 2150006 | ipa b7 |
| c8 | Yuki, Sabre de l'Aurore | L | human | 2150007 | ipa c1 (même identité UR↔L) |
| c9 | Onyx, Ombre Éternelle | L | human | 2150008 | ipa c2 |
| c10 | Naïa, Marée Éternelle | L | human | 2150009 | ipa c3 |
| c11 | Aïna, Aurore Immortelle | L | human | 2150010 | ipa c4 |
| c12 | Roc, Rempart du Monde | L | human | 2150011 | ipa c5 |
| c13 | Ember, Soleil Captif | L | human | 2150012 | ipa c6 |
| c14 | Sylve, Âme du Bosquet | L | human | 2150013 | ipa c7 |
| p5 | Séraphin, Porteur de Lumière | UR | human (séraphin) | 2150014 | ref |
| p6 | Séraphin, Chérubin Éveillé | L | human (chérubin) | 2150015 | |
| w1 | Garde du Seuil | C | human | 2150016 | |
| w2 | Servante du Sablier | UC | human | 2150017 | |
| w3 | Huissier de l'Entre-Deux | R | human | 2150018 | |
| w4 | Juge des Heures | SR | human | 2150019 | |
| w5 | Maître des Sabliers | UR | human | 2150020 | |
| w6 | Kairos, Juge Éternel | L | human | 2150021 | ipa kairos, ref |
| w7 | Lame Miroir | C | echoSpirit | 2150022 | |
| w8 | Choriste Miroir | UC | echoSpirit | 2150023 | |
| w9 | Prisme du Chœur | R | echoSpirit | 2150024 | |
| w10 | Miroir Antiphonique | SR | echoSpirit | 2150025 | |
| w11 | Chef du Chœur | UR | echoSpirit | 2150026 | |
| w12 | Écho, Refrain Absolu | L | echoSpirit | 2150027 | |
| w13 | Fileuse du Pont | C | fateWeaver | 2150028 | |
| w14 | Aiguille du Pont | UC | fateWeaver | 2150029 | |
| w15 | Brodeuse des Liens | R | fateWeaver | 2150030 | |
| w16 | Tisseuse des Nœuds | SR | fateWeaver | 2150031 | |
| w17 | Architecte du Pont | UR | fateWeaver | 2150032 | |
| w18 | Ananké, Gardienne des Rives | L | human | 2150033 | ipa wan21-ananke, ref |
| w19 | Sirène Nouvelle | C | mermaid | 2150034 | durcissement sirène |
| w20 | Fée Nouvelle | C | fireflySpirit | 2150035 | LoRA Forest Guardians (FG-V2.0-Spirit) |
| w21 | Gorgonne Nouvelle | C | gorgon | 2150036 | morphologie pure R11, pas de LoRA |

Compagnons c1-c14 : `character_dna` renseigné + champ `ipa` (UR ref graine b1-b7, L ref son UR c1-c7) pour cohérence d'identité via IPAdapter (poids 0.4 ease in-out end_at 0.85, canon §15).

## 6. Point d'arrêt

Build terminé et poussé. **Aucune génération lancée** : la suite (relance des 271 + 37, post-traitement, QA, switch 4 versions, push auto) démarre uniquement après validation écrite des prompts par Marc-Olivier (« go » ou liste de corrections → rebuild → go).
