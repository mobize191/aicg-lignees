# Étude de polyvalence — full dégâts vs soin/support (13/11/2026)

> Demande de Marc-Olivier (retour terrain n°19) : « tu peux faire des tests, mais je suis sûr qu'une équipe full dégâts va beaucoup plus loin qu'une équipe avec du soin et du support et peu de dégâts ». Hypothèse secondaire : avec 3 cartes actives (formation 3+2), chaque emplacement pris par un soigneur ou un tank coûte un tiers de la puissance offensive — les cartes trop mono-rôle pénalisent l'équipe.

## 1. Protocole

Trois archétypes composés au MÊME palier (R, niveau 12), rejoués sur le protocole v3 du harnais (`combat-digest.mjs`) : mêmes seeds (n+1), mêmes donjons (5 biomes), mêmes étages (1..floors), mêmes difficultés (1-3), N = 3000 combats par équipe, sans modificateur.

| Équipe | Composition (2 avant + 1 arrière, niveau 12) | Logique |
| --- | --- | --- |
| **full-degats** | a6 Épéiste Errant (Guerrier, atk 12) + a7 Faucheur des Ombres (Assassin, atk 15) / a20 Mage de la Fournaise (Mage, atk 14) | 3 frappeurs, zéro soin |
| **mixte** | a6 + a20 / s5 Prêtresse de l'Aube (Prêtre, atk 3, soigne) | 2 frappeurs + 1 soigneur |
| **soin-support** | a6 + s5 / s6 Sentinelle d'Acier (Guerrier tank, atk 4, hp 62) | 1 frappeur + 1 soigneur + 1 tank |

Outil : `node tools/etude-polyvalence.mjs dist.html 3000` (rejouable à l'identique).

## 2. Résultats

| Équipe | Victoires | Taux | Tours moyens |
| --- | --- | --- | --- |
| **full-degats** | 1408 / 3000 | **46,9 %** | **5,7** |
| **mixte** | 1199 / 3000 | 40,0 % | 5,9 |
| **soin-support** | 1032 / 3000 | **34,4 %** | 7,5 |

0 exception, 0 marathon sur les trois séries.

## 3. Lecture

- **L'intuition de Marc-Olivier est CONFIRMÉE** : la full dégâts gagne 12,5 points de plus que l'équipe soin-support, et gagne AUSSI plus vite (5,7 vs 7,5 tours moyens — le soin allonge les combats sans les faire basculer).
- **La dégression est régulière** : chaque emplacement « non offensant » retiré à l'équipe coûte ~6-7 points de taux de victoire au palier R. Le soigneur (s5, atk 3) et le tank (s6, atk 4) sont quasi inoffensifs : à 3 actifs, un tour passé à soigner/encaisser est un tour où l'équipe ne tue pas, et la vague ennemie continue de frapper.
- **Limite de l'étude** : palier R, niveau 12, difficultés 1-3 du protocole v3. Le soin pourrait reprendre de la valeur à plus haut niveau (vagues plus longues, dégâts ennemis plus élevés) et sur les donjons royaux — à re-mesurer si besoin ; les potions en combat et le remplaçant K.O. gratuit réduisent déjà le besoin de soin en combat.

## 4. Recommandations (vers le rééquilibrage global des classes, Marc-Olivier, point 15)

1. **Polyvalence des rôles** : une carte soignante doit AUSSI frapper utilement (ATK de base relevée, ou sorts hybrides « drain/balayage » qui soignent en frappant) ; le support « pur » est un piège à 3 actifs.
2. **Le tank actif plutôt que passif** : converge avec le tranchage rempart du même jour (provocation 1 tour ou plus, boucliers, défense globale) — le tank ne doit pas seulement encaisser, il doit dévier les dégâts ET garder une menace (sa remontée d'ATK est déjà tranchée en direction).
3. **Sorts de lignée polyvalents** : à la vague 4, chaque famille gagnera à avoir 1-2 sorts à double usage (dégâts + effet de soutien) plutôt que des sorts purement « support » — à poser dans le rééquilibrage global des classes (chantier à ouvrir après le retour terrain), avec MESURE digest (le retrait du splash Mage et la remontée des soigneurs/tanks changent les maths : nouvelle baseline à verrouiller après).

Références : arbitrages du 14/11 (suite 24) ; harnais `combat-digest.mjs` (état courant du moteur : `3b11106f…` 871/3000, baseline PR #13 en attente de verrouillage) ; étude de durée `etude-duree-combats-2026-11-13.md`.
