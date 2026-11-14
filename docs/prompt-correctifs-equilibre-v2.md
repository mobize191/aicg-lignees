# Prompt — correctifs d'équilibrage v2 : les 4 écarts mesurés de la validation (data d'abord, une seule baseline, 14/11)

Contexte : la validation de la refonte v2 au harnas (section « Validation de la refonte v2 (14/11/2026) » de [`docs/design/etude-reequilibrage-classes-cartes-2026-11-13.md`](https://github.com/mobize191/aicg-lignees/blob/main/docs/design/etude-reequilibrage-classes-cartes-2026-11-13.md), outils rejouables `tools/etude-v2-validation.mjs` / `tools/etude-v2-sensibilite.mjs` / `tools/etude-v2-pretres.mjs`) a confirmé la refonte (digest `29c995da…` 733/3000 et tableau M1 reproduits à l'identique, J1-J12/I1 en place) et mesuré **4 écarts à corriger avant verrouillage de la baseline PROPOSÉE** : Mage hors cible (racine data INT), I1 inversé (monstres sous les cartes), pathologie marathon des signatures de soin monstres (42/3000 sur 3× Diacre du Plein Jour, chemin canonique `byId`), plateau des trios non atteint (33,7 pts d'écart au R). **Les cibles consignées (suite 42) restent LA référence : facile/normal 70-80 %, difficile ~50 % ; mono-classe Guerrier 70-80 %, Mage et Assassin 60-70 %, supports 40-50 % max ; tout trio de classes différentes au même plateau.**

## INVARIANT (règle d'or du chantier)

**Le calibrage se fait par la DATA (fiches), mesurée au harnas à chaque lot, jamais à l'intuition** : une modif = une re-mesure protocole v3 (N = 3000/ligne, `stretchLevel(12)` = 45), et le garde 150 tours reste le détecteur de non-régression. **Aucun double recalibrage (M6)** : la nouvelle baseline unique est proposée en fin de chantier, verrouillage par Marc-Olivier. Les mesures de référence à battre sont celles du tableau « APRÈS » du rapport de clôture (`docs/historique/refonte-v2-rapport.md`).

## Lot 1 — Mage : la data INT suit le moteur (data, digest à MESURER)

Constat mesuré : mono-classe Mage **27,7 %** au R (cible 60-70), 18,3 % UC, 53,6 % SR, 74,7 % UR. Le moteur est sain (sensibilité : **+29 % ATQ = 0,0 pt ; +55 % INT = +11,3 pts ; INT 24 = 52,4 %**) : c'est la fiche qui n'a pas suivi. Aujourd'hui INT 11 au R (Guerrier atk 17), PV 70 (Guerrier 88), `strike` Mage 0,8 conservé (J3 : seuls `atkPct`/`hpPct` ont été mis à zéro).

1. **INT des Mages** (les DEUX collections, séries a et v du catalogue joueur + les Mages monstres) relevée à **parité de l'ATQ Guerrier du même palier** (proposition de départ : R 11 → 17 ; décliner proportionnellement C/UC/SR/UR/L). Vigilance : l'INT pilote aussi mana et soins, re-mesurer les marathons.
2. **PV des Mages** : aligner sur ~85-90 % du PV Guerrier du palier (R : 70 → ~78). **Strike** : tranchage J3 à compléter, normaliser `strike` M/P/O (0,8/0,7/0,6 → 1,0) OU le compenser dans l'INT — **une seule des deux options, documentée** (pas les deux : risque de sur-corriger).
3. Itérer au harnas jusqu'aux cibles : `node tools/etude-paliers.mjs dist.html 3000 UC,R,SR,UR` → **Mage R 60-70 %**, et à chaque palier Mage dans ±10 pts de l'Assassin ; contraintes de non-régression : Guerrier R reste 70-80, Assassin R 60-70, supports R 20-50 et jamais > 50, **0 marathon**, trios (Lot 4) écart max ≤ 12 pts.
4. **cardPower (M4)** : la métrique `(2,5 × atk + 0,6 × hp)` ignore l'INT devenu la stat de frappe des lanceurs — l'étude paliers choisit ses cartes avec, les futurs audits aussi. Intégrer le profil (proposition : power lanceurs = `(2,5 × INT + 0,6 × hp) × RARITY_POWER`, profil = classe du bloc `profils`) et **consigner le changement de métrique** avec les tables avant/après.
5. Si la bande 60-70 s'avère inatteignable par data seule, **consigner le meilleur plateau atteint + les options restantes en PROPOSITION** (mult de la Boule de Feu, `FAMILY_MANA`), sans recalibrage sauvage : tranchage Marc-Olivier.

## Lot 2 — Signatures de soin monstres : plus jamais de marathon (data + branchement mineur, digest à MESURER)

Constat mesuré : **3× Diacre du Plein Jour (z24) = 8,9 % et 42 marathons/3000** (33 avant la refonte) par le chemin canonique du jeu (`byId` : signature soin + commun soin + Boule de Feu). Les signatures bouclier ne marathonnent pas (e8 18,0 %, d9 19,7 %) : le point chaud est le **soin pur monstre** avec cap de soin retiré (J10) et régén mana par tour. Le « 0 marathon partout » du rapport de clôture était exact mais ne couvrait que les cartes joueur. J11 (« chaque soigneur a un sort de dégâts dès les bas niveaux ») est implémenté pour les cartes, pas pour les signatures monstres.

1. Les signatures de soin pur des monstres support deviennent **hybrides** : frappe + soin (la brique `soinPct` du lot 4 existe : `nova-vivifiante` ×1,2 soin 50 %, `balayage-regenere` ×1,3 zone soin 40 % servent de modèle ; garder l'identité soigneur : le soin garde ~la moitié de la valeur actuelle). Profil touché : les monstres `effect.kind: "heal"` (z24, z10 Serre-Soleil, et les homologues des autres paliers).
2. Acceptation : `node tools/etude-v2-pretres.mjs dist.html 3000` → **z24 et z10 ≥ 25 % et 0 marathon** ; e8/d9/e25 sans régression ; ajouter un **test de non-régression marathon** (3× chaque Prêtre monstre R et SR, garde 150) à la suite.
3. Outil en réserve (à PROPOSER, pas à implémenter sans tranchage) si des marathons réapparaissent ailleurs : la fatigue type PP sur les sorts de soin (vigilance J10 consignée dans l'étude).

## Lot 3 — I1 : le monstre recruté rattrape la carte (data, digest à MESURER)

Constat mesuré : le cran allégé (PV seuls) a retiré aux monstres leur ATQ effective sans compensation : mono-classe R **k4 64,2 %** (vs a48 76,0 %, −11,8 pts), **f11 42,7 %** (vs a41 58,9 %), **e25 18,3 %** (vs q3 31,2 %) ; seul le Mage s'aligne (z17 30,9 vs 27,7). Avant refonte l'écart G était de −5,7 pts. I1 est acté : à rareté et classe égales, monstre recruté ≈ carte humaine.

1. Remonter les **bases atk/hp des monstres recrutables** vers les bandes des cartes du même palier/classe (budget M4 partagé, les deux collections ; les fiches de référence sont les meilleures cartes joueur par palier). Le cran 5/10/15 % PV seul reste acté : il ne bouge PAS dans ce lot.
2. Conséquence assumée d'I1 (consignée dans l'étude) : le même catalogue alimente les vagues ennemies → la difficulté des donjons montera. **Re-mesurer et consigner digest 3000/10000 + difficultés d1/d2/d3** (`etude-paliers`), sans recalibrage sauvage : si le digest descend trop, le proposer au tranchage (contreparties possibles : bande de tolérance M1 au harnas, calibration des vagues par palier de donjon), pas de décision unilatérale.
3. Acceptance : `node tools/etude-v2-validation.mjs dist.html 3000` → **écart mono-classe R monstre vs carte ≤ 5 pts par classe**, paires jumelles toujours ≤ 5 pts par palier de cran, 0 marathon partout.

## Lot 4 — Clôture : tableau complet + nouvelle baseline (docs + mesures)

1. Rejouer et consigner le tableau complet avant/après : `etude-paliers` UC/R/SR/UR × 5 classes, les 18 lignes de `etude-v2-validation` (monstres, paires, slots, trios), `etude-v2-pretres`, digest 3000 **et** 10000. Cibles de sortie : les 4 écarts fermés ou **documentés avec proposition** ; trios à ≤ 12 pts d'écart ; difficulté du trio G/A/P toujours dans facile/normal 70-80 / difficile ~50.
2. Rapport `docs/historique/correctifs-v2-equilibre.md` (même format que `refonte-v2-rapport.md`), consignation `docs/arbitrages.md` (suites suivantes), **PROPOSITION DE NOUVELLE BASELINE unique** au verrouillage par Marc-Olivier. La baseline `29c995da…`/`bce556b3…` reste la référence jusqu'au verrouillage final (M6).

## Hors périmètre

- Le moteur de combat v2 (formules INT/déf/ratio, taunt, Boule de Feu) : RIEN ne bouge, sauf branchement mineur documenté au Lot 2.
- Les mults et coûts des sorts (M3), l'économie du mana (`FAMILY_MANA`), le cran de race (5/10/15 % acté), les sorts de trio.
- L'arbre des familles, la fusion v4, les donjons par famille, les arts, XP 1-100, l'UI.
- Les vitesses par contexte et la variance individuelle (déjà tranchées ailleurs).

## Preuves (chaque lot, discipline AGENT.md)

Build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + validateur 0 erreur + **digest 3000 et 10000 MESURÉS à chaque lot** (le digest bougera aux trois lots : consigné, sans recalibrage, M6) + `etude-paliers` + `etude-v2-validation` + `etude-v2-pretres` rejoués. **Un lot = un commit FR, re-fetch de main avant chaque lot** (couloirs parallèles). À la fin : rapport, push, CI verte. Validation terrain ensuite par Marc-Olivier (une équipe de Mages au R, une recrue Diacre du Plein Jour, un trio sans Guerrier).
