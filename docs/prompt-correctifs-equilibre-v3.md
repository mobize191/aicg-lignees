# Prompt — correctifs d'équilibre v3 : les 4 tranchages de Marc-Olivier (data d'abord, une seule baseline, 15/11)

Contexte : la baseline **`d630d83e…` 419/3000 / `584f5d16…` 1419/10000 est VERROUILLÉE par Marc-Olivier** (suite 60, à la suite du check indépendant de la suite 58) : c'est LA référence officielle, la précédente (`29c995da…`/`bce556b3…`) est retirée. Le rapport de clôture v2 (`docs/historique/correctifs-v2-equilibre.md`) laisse 4 tranchages ouverts, **tranchés par Marc-Olivier** : **(a)** calibration des vagues par palier de donjon **LANCÉE** (rend la bande Mage R 60-70 %, relève le digest après la conséquence I1 du lot 3 v2, détend les difficultés) ; **(b)** kit de sorts de l'Assassin monstre **à harmoniser avec la carte** ; **(c)** trios ≤ 12 pts **DIFFÉRÉS** : décision après (a), sur la re-mesure documentée en clôture ; **(d)** `soloMult` des signatures soigneur **ACTIVÉ** (franchir la cible ≥ 25 %). **Les cibles consignées (suite 42) restent LA référence : facile/normal 70-80 %, difficile ~50 % ; mono-classe Guerrier 70-80 %, Mage et Assassin 60-70 %, supports 20-50 % et jamais > 50 ; tout trio de classes différentes au même plateau.**

## INVARIANT (règle d'or du chantier)

**La baseline est VERROUILLÉE** : tout chantier qui fait bouger le digest MESURE, CONSIGNE et PROPOSE, jamais de verrouillage sans Marc-Olivier (M6). **Le calibrage se fait par la DATA, mesurée au harnas à chaque lot, jamais à l'intuition** : une modif = une re-mesure protocole v3 (N = 3000/ligne, `stretchLevel(12)` = 45), le garde 150 tours reste le détecteur de non-régression. Les mesures de référence à battre sont celles du tableau « APRÈS » du rapport v2.

## Lot 1 — (a) Calibration des vagues par palier de donjon (data, digest à MESURER)

Constat mesuré (rapport v2) : après la remontée des monstres (lot 3 v2, conséquence assumée d'I1), **Mage R est retombé à 48,4 %** (cible 60-70 ; il était 61,7 % au lot 1 v2), et la difficulté du trio G/A/P a baissé : d1 74,2 / d2 55,1 / d3 37,5 % (cibles 70-80 / 70-80 / ~50). Les vagues tirent du même catalogue remonté en bande : `makeWave` (`src/engine/combat.js`) filtre `monstersOf(dungeon)` par bande de rareté du mode (`bandOf`), scale par `WAVE_VAR_MIN`/`WAVE_VAR_SPAN`, `levelIn`, la courbe `WAVE_POWER_GROWTH`/`WAVE_ATK_STEP`/`WAVE_HP_STEP`, et les mults `ELITE/BOSS/FINAL` — **tous des leviers en data (`data/engine.json`)**.

1. **Le levier : les constantes de vague en data, calibrées par palier de donjon/mode** (pas un coeff global unique qui aplatirait la courbe de difficulté). Documenter le levier choisi et la valeur avant/après de chaque constante touchée.
2. Itérer au harnas jusqu'aux bandes cibles : `node tools/etude-paliers.mjs dist.html 3000 UC,R,SR,UR` (Mage R 60-70, Assassin R 60-70, Guerrier R 70-80, supports 20-50 jamais > 50) + **difficultés d1/d2/d3 du trio G/A/P** (70-80 / 70-80 / ~50).
3. **Non-régression stricte** : les fiches recrutables ne redescendent PAS (I1 lot 3 v2 acté : bandes et cran 5/10/15 % PV seuls ne bougent pas, seules les vagues s'ajustent) ; 0 marathon, 0 exception partout ; paires jumelles ≤ 5 pts par palier de cran.
4. **Digest 3000 et 10000 MESURÉS** (il remontera : attendu, consigné sans recalibrage).
5. Si une bande s'avère inatteignable par data seule : consigner le meilleur plateau atteint + les options restantes en **PROPOSITION**, sans recalibrage sauvage (tranchage Marc-Olivier).

## Lot 2 — (b) Kit de sorts de l'Assassin monstre : harmoniser avec la carte (data, digest à MESURER)

Constat mesuré (rapport v2) : Assassin R **f11 29,9 / d15 29,5 vs carte a41 41,7 (−11,8/−12,2 pts)**, stats identiques au `makeUnit` : l'écart vient du **kit de sorts** (grimoire vs signature) de la fiche monstre, pas des stats. Tranchage acté : harmoniser.

1. Donner aux fiches monstres Assassin concernées **le même kit effectif que la carte de référence du palier/classe** (mêmes sorts résolus au `makeUnit`), en data d'abord, sans toucher les stats (I1 reste acté).
2. Acceptance : `node tools/etude-v2-validation.mjs dist.html 3000` → **écart Assassin R monstre vs carte ≤ 5 pts** ; sans régression des autres classes ni des paires jumelles ; **0 marathon partout**. Digest 3000/10000 mesurés (les vagues contiennent des Assassins : le digest bougera, consigné).
3. Étendue : les homologues Assassin des autres paliers porteurs du même écart, en le documentant ligne par ligne dans la consignation.

## Lot 3 — (d) soloMult des signatures soigneur : franchir 25 % (data, digest à MESURER)

Constat mesuré (rapport v2) : **z24 22,4-23,4 % / z10 22,4 %** (cible ≥ 25 %, l'écart est dans le bruit N = 3000 ± ~1,5 pt). Tranchage acté : activer le levier `soloMult` (champs `soloSpell`/`soloMult` de `data/monsters.json`, défaut 1,5 — cf. le mécanisme déjà en place dans `src/data.js`).

1. Remonter le `soloMult` des signatures des soigneurs monstres (z24, z10 + homologues des autres paliers, profil `effect.kind: "heal"`) **par pas mesurés** jusqu'à ≥ 25 %, sans sur-correction : les supports restent dans leur bande (20-50 %, jamais > 50) et le caractère hybride frappe + `soinPct` du lot 2 v2 est conservé.
2. Acceptance : `node tools/etude-v2-pretres.mjs dist.html 3000` → **z24 et z10 ≥ 25 % et 0 marathon** ; e8/d9/e25 sans régression ; **test de non-régression marathon toujours vert**. Digest 3000/10000 mesurés.

## Lot 4 — Clôture : trios documentés + tableau complet + PROPOSITION de nouvelle baseline

1. Rejouer et consigner le tableau complet avant/après : `etude-paliers` UC/R/SR/UR × 5 classes, les 18 lignes de `etude-v2-validation`, `etude-v2-pretres`, **digest 3000 ET 10000**.
2. **Trios (c, DIFFÉRÉ par tranchage)** : re-mesurer les 4 trios au R (G/A/P, M/A/P, G/M/O, M/P/O) après le Lot 1 ; si l'écart **≤ 12 pts** n'est pas atteint (17,0 pts mesurés en v2), **DOCUMENTER + PROPOSER** les options (ex. relever les supports en contexte trio) — **PAS d'implémentation sans tranchage de Marc-Olivier**.
3. Rapport `docs/historique/correctifs-v3-equilibre.md` (même format que le v2), consignation `docs/arbitrages.md` (suites suivantes), **PROPOSITION DE NOUVELLE BASELINE unique** au verrouillage par Marc-Olivier. **La baseline VERROUILLÉE `d630d83e…`/`584f5d16…` reste la référence jusqu'au verrouillage final (M6).**

## Hors périmètre

- Le moteur de combat v2 (formules INT/défense ratio, taunt, Boule de Feu, mana) : RIEN ne bouge.
- Les fiches recrutables remontées (I1 lot 3 v2), le cran de race 5/10/15 % PV seuls, les mults et coûts des sorts joueur (M3), l'économie du mana (`FAMILY_MANA`), les sorts de trio.
- L'arbre des familles, la fusion v4, la composition des donjons (`dungeons.json`), les arts, l'UI, XP 1-100, la mécanique Exception v3.4 (**autre chantier : `docs/prompt-exception-v34.md`, ne pas croiser**).

## Preuves (chaque lot, discipline AGENT.md)

Build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + validateur 0 erreur + **digest 3000 et 10000 MESURÉS à chaque lot** + `etude-paliers` + `etude-v2-validation` + `etude-v2-pretres` rejoués. **Un lot = un commit FR, re-fetch de main avant chaque lot** (couloirs parallèles). À la fin : rapport, push, CI verte. Validation terrain ensuite par Marc-Olivier (une équipe de Mages au R, une recrue Diacre du Plein Jour, un trio sans Guerrier).
