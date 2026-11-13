# Étude — durée des combats : mesures de masse, comparaison au genre, leviers (13/11/2026)

> Demande de Marc-Olivier (13/11) : (1) le Gardien du Rempart, Guerrier, « n'a aucune force pour infliger des dégâts » ; (2) « les combats sont trop longs à mon goût » — recherche demandée sur les durées moyennes de combat dans DQM, Pokémon et autres jeux tour par tour, + simulation de masse (équipes niveaux ±3, rareté ±1) pour situer le jeu et proposer des améliorations. Méthode : le MOTEUR RÉEL du jeu (dist.html via `stub.mjs`), auto-résolu en headless, zéro modification du jeu. Outils rejouables : `etude-duree.mjs` (miroirs équilibrés) et `etude-duree-donjons.mjs` (flux donjons).

## 1. Mesures (moteur réel, auto-résolution, IA optimale des deux camps)

### Miroirs équilibrés (demande exacte : niveaux de base 5/10/15/20, ±3 par carte, raretés ±1 rang, 3 actifs + 2 réserve vs 3 avant + 2 arrière, 2000 combats)

| Mesure | Tours |
| --- | --- |
| **Moyenne** | **10,1** |
| Médiane | 9 |
| p75 / p90 / p95 | 12 / 17 / 21 |
| Max observé | 44 |
| Marathons (≥150) | 0 |

Stable par niveau (N5 : 10,0 ; N10 : 10,0 ; N15 : 10,3 ; N20 : 10,3). **Biais structurel constaté** : le camp « réserve » (joueur) perd 58 % des matchs contre le camp « arrière actif » (l'arrière ennemi JOUE — support/casts —, la réserve n'entre qu'au K.O.) : c'est le prix assumé du tranchage 3+2, pas un bug.

### Flux réel des donjons (protocole du digest, 2000 combats : 4 équipes × 5 donjons × étages × difficultés 1-3)

| Mesure | Tours |
| --- | --- |
| **Moyenne** | **6,8** |
| Médiane | 5 |
| p90 / p95 / p99 | 11 / 16 / 27 |
| Max observé | 45 |

Par donjon : Marées 7,7 ; Forge 5,7 ; Bosquet 6,9 ; Crypte 5,4 ; Zénith 8,1 (p95 à 26 : les soigneurs ennemis rallongent la queue de distribution, cohérent avec les signatures soigneuses v1.51).

## 2. Comparaison au genre (sources publiques)

- **VGC Pokémon (doubles 4v4)** : **8-10 tours** en moyenne (Nugget Bridge, « VGC battles average 8-10 turns »).
- **Pokémon sauvage 1v1 (aventure)** : 2-4 tours (combat de route classique, souvent moins d'une minute).
- **Pokémon 6v6 singles (compétitif)** : 40-50 tours et plus, jusqu'à ~1 h de temps réel (Smogon : Turns/b ~4-5 par Pokémon ; Reddit/stunfisk).
- **DQM Joker 3** : tour par tour classique, jusqu'à 4 monstres en rangée, avec **option « IA joue à ta place »** en plus du contrôle direct (RPGamer). Pas de stat publique en tours ; le standard Dragon Quest tourne autour de quelques tours par combat de route.
- **Ordre de grandeur D&D 5e** (temps réel) : ~3 rounds par rencontre, 15-25 minutes.

**Verdict : en NOMBRE DE TOURS, Aicg est DANS la norme du genre** : 10 tours en match équilibré (≈ VGC doubles 8-10), 6,8 tours dans le flux d'errance/donjon. Les combats ne sont pas anormalement longs en tours.

## 3. Pourquoi ça SEMBLE long : le temps réel par tour, pas les tours

- **Vitesse par défaut ×1 = 600 ms par action d'animation** (`SPEEDS[1]`, `speedIdx = 1`). Un combat réel de 6,8 tours × ~5-6 unités actives ≈ **35-40 actions animées** = ~25-35 s d'animations pures, + les vidéos FX (v1.31), shakes, hit-stop (v1.47), + **la saisie MANUELLE de chaque carte du joueur** (le mode auto a été supprimé v1.39, tranché) : ~20 clics de décision. Total ressenti : **1,5-2 min par combat**, contre ~20-40 s pour un combat de route Pokémon/DQM.
- La longueur perçue vient donc (a) du temps d'animation par action, (b) du tour par tour manuel complet, (c) de la queue de distribution (p95 = 16-27 tours sur les combats à soigneurs).

## 4. Leviers chiffrés (miroirs équilibrés, 1500 combats par variante, appliqués aux DEUX camps)

| Variante | Moyenne tours | Écart vs v0 (10,1) |
| --- | --- | --- |
| **v0 (actuel)** | **10,1** | — |
| ATK ×1,25 | 8,5 | −16 % |
| ATK ×1,5 | 7,5 | −26 % |
| HP ×0,8 | 8,2 | −19 % |
| HP ×0,7 | 7,3 | −28 % |
| ATK ×1,25 + HP ×0,85 (« mixte », 2000 combats mesurés) | **7,5** | **−26 %** |

**ATTENTION** : ces variantes = RECALIBRAGE (le digest change, le rapport de force donjons change : les combats plus courts avantagent aussi le joueur). AUCUNE ne s'applique sans tranchage explicite de Marc-Olivier + nouvelle mesure + nouvelle baseline.

## 5. Gardien du Rempart : la lignée des tanks n'a pas de dent offensive

Constat de Marc-Olivier confirmé dans `data/cards.json` — la lignée « rempart/gardiens » a des ATK délibérément basses + effets `shield` :

| Carte | Rareté | Classe | ATK | PV | Effet |
| --- | --- | --- | --- | --- | --- |
| s4 Gardien-Mécanique | C | **Guerrier** | **2** | 55 | bouclier 15 |
| s14 Garde du Rempart | UC | Prêtre | 3 | 58 | bouclier 20 |
| s11 Argus, Rempart Éveillé | UR | **Guerrier** | **6** | 92 | bouclier 55 |
| c12 Roc, Rempart du Monde | L | Prêtre | 7 | 115 | bouclier 75 |

Les Prêtres tanks (s14, c12) sont cohérents (leur valeur = bouclier + soins) ; les **Guerriers** (s4 à 2, s11 à 6) frappent à ~2-9 dégâts par tour : quasi zéro contribution offensive, et pour une UR c'est un problème de satisfaction de jeu. À titre de comparaison, un Guerrier C standard frappe à 8-10 (a1 Épéiste en Herbe 8, w1 Garde du Seuil 8), un UC à 10-13.

**Options [À TRANCHER]** :
- **A (recommandée)** : remonter l'ATK des deux Guerriers de la lignée à ~60-70 % d'un Guerrier standard de leur rareté (s4 : 2 → 6 ; s11 : 6 → 12-14), en gardant bouclier et PV. Impact digest : MESURE obligatoire (maths).
- **B** : identité défensive ACTIVE : gimmick « riposte » (contre-attaque quand frappé) ou « provocation » (attire les frappes) — plus de code, un vrai rôle de tank, pas un pion passif.
- **C** : statu quo (tank passif assumé).

## 6. Recommandations (couloir pilotage, à trancher par Marc-Olivier)

1. **PAS de recalibrage de tours** : le jeu est déjà dans la tranche du genre. Agir sur le **TEMPS RÉEL** : (a) vitesse par défaut relevée à ×2 (`speedIdx = 2` par défaut, persistée — le bouton ×0,5→×32 existe déjà), (b) durée d'action de base 600 → ~400 ms, (c) garder « Auto ce tour » pour enchaîner les tours évidents. Présentation seule : digest inchangé attendu.
2. **Gardien du Rempart** : option A ou B ci-dessus (option B = la plus « jeu », l'option A la plus rapide).
3. Si tu veux MALGRÉ TOUT raccourcir les tours : le mixte ATK ×1,25 + HP ×0,85 ≈ −25 %, avec nouvelle baseline digest à verrouiller après.
4. La queue (p95-99 : 16-45 tours) vient des combats à soigneurs multiples : un plafond d'usage des soins par combat (ex. 2-3 par Prêtre) la réduirait — à trancher séparément.

## Sources

- Nugget Bridge — Differences Between Single and Double Battles (« VGC battles average 8-10 turns ») : https://www.nuggetbridge.com/reports/differences-between-single-and-double-battles/
- Reddit r/stunfisk — durée des matchs 6v6 (jusqu'à ~1 h) : https://www.reddit.com/r/stunfisk/
- Smogon University PO Statistics (Turns/b par Pokémon) : https://www.smogon.com/forums/
- RPGamer — review DQM Joker 3 (tour par tour, 4 vs rangée, option IA) : https://www.rpgamer.com/review/dragon-quest-monsters-joker-3-import-review/
- HowLongToBeat — DQM Joker (complétion) : https://howlongtobeat.com/
