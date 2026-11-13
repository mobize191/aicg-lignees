# Prompt — correctifs sorts : un sort fait ce que sa fiche affiche (tranchages de Marc-Olivier, 14/11)

Contexte : l'audit exhaustif `docs/audit-sorts.md` (outil rejouable `audit-sorts.mjs`, 309 sorts uniques rejoués en combat réel) a trouvé **85 anomalies en 5 racines**, déclenchées par le signalement terrain de Marc-Olivier : sur la famille du Vol (Grand Brigand & co), les sorts d'attaque ne peuvent viser que les alliés. **Les 4 tranchages de Marc-Olivier (14/11) sont actés** : lignée du Vol = attaque ; Appel/Pont = vraie invocation ; signatures des recrues = l'effet affiché s'applique en Tactique ; badges contrôle/malus = effets implémentés (taux/tours créés).

## INVARIANT (règle d'or du chantier)

**Un sort fait EXACTEMENT ce que sa fiche affiche, et la fenêtre d'action propose le camp que la fiche désigne.** Plus jamais : fiche « bouclier · l'équipe » qui frappe l'ennemi, fiche « dégâts ×2,6 » qui buff un allié, badge « contrôle » sans effet, attaque monocible qui frappe toute la vague. La revalidation passe par `node audit-sorts.mjs` : **0 anomalie** sur les lots livrés.

## Lot 1 — lignée du Vol : des attaques (data, digest Auto inchangé attendu)

1. `data/lineage-spells.json`, famille `vol` : les 6 sorts (Larcin Agile, Coup de Jarnac, Dague dans le Dos, Fauchage, Embuscade, Coup de Grâce) passent de `"cible": "1 allié"` à `"cible": "1 ennemi"`. Mults ×1,4→×4,5 inchangés : c'est la lignée d'attaque sournoise de la classe Assassin (mêmes mults que lame/ombre/eau).
2. Vérifier en Tactique : la fenêtre propose les ENNEMIS pour ces sorts ; le moteur résout les dégâts (`actTeamStriker` chemin hostile). En Auto le chemin historique frappe déjà : **digest inchangé attendu** (le bug était purement Tactique) — MESURE de contrôle.
3. `node audit-sorts.mjs` : les 6 sorts vol basculent de `ATTAQUE_RESOLUE_EN_BUFF_ATK` vers `HOSTILE_OK`.

## Lot 2 — signatures des recrues : l'effet affiché s'applique en Tactique (moteur, digest Auto inchangé attendu)

Racine : `applySupport` (lignes support = les ennemis) applique les rôles dérivés de `signatureMetaOf`, mais `actTeamStriker` (le joueur, ligne avant obligatoire depuis le Lot A) n'applique que le rôle soin (v1.51). Prolonger le tranchage v1.51 « une carte soigneuse a une signature de soin » à TOUS les rôles, **en Tactique uniquement** (branche `tacAct`, le chemin auto n'est PAS touché) :

1. Dans la branche Tactique de `actTeamStriker` (`tacAct.kind === 'spell'`), quand le sort est `cat: 'unique'`, résoudre par `signatureMetaOfUnit(u)` (le même switch que `applySupport`) : `bouclier`/`reflect` → bouclier (cap `HEAL_CAP_RATIO` comme ailleurs) ; `atkBuff`/`warcry` → boost ATQ ; `link` → lien du lanceur vers l'allié désigné ; `copy` → copie du dernier sort ennemi (le status copy existe) ; `summon` → `castSummon` (généraliser le déclenchement actuel `classe Invocateur + effect.kind summon` au rôle invocation) ; `revive` → relève le premier K.O. de l'équipe à `effect.value` (60 %), sinon se comporte en soin ; `stun`/`slow`/`dot`/`curse` → le statut sur l'ennemi désigné (côté joueur, l'effet data existe déjà pour ces monstres).
2. Ciblage fidèle à la fiche : `soi`/`l'équipe`/`les renforts` → pas de désignation ; `1 allié` → liste d'alliés ; `1 ennemi` → ennemis. La fenêtre affiche déjà le bon rôle (badges `signatureMetaOf`) : le moteur suit.
3. Les 33 sorts de l'audit (16 bouclier + 8 invocation + 8 boost/manip + revive) basculent vers `ALLIE_OK`/`HOSTILE_OK` selon leur fiche. **Chemin auto inchangé : digest inchangé attendu** — MESURE de contrôle.
4. Ne pas oublier les ennemis recrutés par le marchand : ce sont les mêmes monstres (test : une recrue `e8` Matriarche des Récifs pose bien sa Barrière de Corail sur son camp en Tactique).

## Lot 3 — largeur au cran du porteur, jamais le MAX (moteur, digest à MESURER)

1. `largeurOfSpellName` (`src/engine/spells.js` ~471) : pour un sort d'école du grimoire, la largeur prise est `Math.max` des crans → toute signature/carte portant un de ces 13 noms (Morsure Putride, Colonne de Feu…) frappe en zone totale. Corriger : la largeur vient du **cran du porteur** (le cran appris/possédé), et une signature sans cran d'école frappe en **monocible (1)**.
2. Constat direct à corriger : Souffle Ardent « Colonne de Feu » et Goule des Caveaux « Morsure Putride » frappent les 3 mannequins (fiche « 1 ennemi »).
3. Les ennemis passent aussi par `largeurOfSpellName` (`castFoeSpell`) : le digest Auto peut bouger si des ennemis jouent ces noms dans les runs de mesure — **MESURE obligatoire et consignée**, sans recalibrage.

## Lot 4 — invocations de lignée : l'Appel et le Pont invoquent VRAIMENT (data + moteur, digest bougera)

Tranchage acté : vraie invocation. Les 12 sorts des familles `appel` (v1-v6) et `pont` (w13-w18) invoquent un esprit au lieu du buff ATK actuel :

1. Data `lineage-spells.json` : chaque sort des deux familles reçoit `summon: { hpPct, ttl }` (proposition : hpPct 0,35 au palier C → 0,6 au palier L ; ttl 3 tours), et `"cible": "les renforts"` conservé (pas de désignation).
2. Moteur : réutiliser `castSummon` (déjà existant : Golem de Fournaise, ttl, hpPct) : l'esprit rejoint la ligne avant du camp, stats dérivées du lanceur (PV = lanceur × hpPct ; ATQ = stat principale du lanceur × mult × 0,5 arrondi ; agi du lanceur), ttl décrémenté par tour, K.O. définitif à expiration, un esprit actif MAX par lanceur (relancer remplace l'ancien), pas d'XP ni de récompense pour les esprits. Nom : « Esprit de l'Appel » / « Fil d'Ananké » (le nom du palier reste le nom du sort).
3. La résolution s'applique **en Tactique ET en Auto** (cohérence des chemins) : le digest Auto BOUGERA (les sorts Appel/Pont passent de frappe/buff à invocation) — **MESURE obligatoire, consignée comme digest documenté**, sans recalibrage. La baseline `4a5b0123…`/`3f828555…` sera dépassée à la fin du chantier : la nouvelle mesure sera proposée à Marc-Olivier pour verrouillage.
4. `node audit-sorts.mjs` : les 12 sorts basculent de `INVOC_RESOLUE_EN_BUFF_ATK`/`FICHE_INVOC_EFFET_HOSTILE` vers `ALLIE_OK (renfort)`.

## Lot 5 — badges contrôle/malus : les effets existent (data + moteur, digest bougera)

Tranchage acté : implémenter les effets (taux/tours à créer).

1. Data `lineage-spells.json` : les 12 sorts des familles `bosquet` et `seuil` (école Entrave) reçoivent un contrôle : `{ taux, tours }` (proposition : stun taux 25 % au palier C → 15 % au L, tours 1-2 ; le seuil de résistance de la cible compte déjà, comme le grimoire). Les 12 sorts des familles `braise` et `crepuscule` (école Mauvais-Œil) reçoivent un malus : curse `−20 %` dégâts infligés par la cible, 2 tours (valeur par palier : −15 % → −30 %).
2. Moteur : appliquer le statut en Tactique ET en Auto sur l'ennemi désigné/le plus menaçant (les briques existent : `status.stun`, `status.curse`, `applySupport` et le grimoire « Chant de Sirène » servent de modèle ; le sort garde SES dégâts + le statut).
3. `Œil du Malheur` (sort de classe Occultiste, desc « −20 % de précision × 2 tours » jamais appliquée) : implémenter (proposition : curse −20 % dégâts 2 tours, cohérent avec l'école Mauvais-Œil, et reformuler la desc en ce sens — OU réduire l'esquive de la cible si plus propre avec le moteur existant ; documenter le choix).
4. Les 6 signatures « contrôle » des recrues (Marée Traîtresse, Chant Paralysant, Filet de Suie, Ombre Tissée, Sable Glissant, Sentence Lente) : l'effet data `stun`/`slow` de ces monstres s'applique côté joueur via le switch du Lot 2.
5. Fiches : le taux et la durée s'affichent (comme le grimoire : « 25 % · 2 tours »). `node audit-sorts.mjs` : les 32 sorts `FICHE_CONTROLE_SANS_EFFET`/`FICHE_MALUS_SANS_EFFET` basculent vers `HOSTILE_OK` (dégâts + statut posé).
6. Digest Auto : BOUGERA — MESURE obligatoire, consignée, sans recalibrage.

## Hors périmètre

- Calibrage général (ATK/HP, splash Mage, Guerriers rempart) : §0 n°5-6, RIEN ne bouge ici.
- Vitesses par contexte : non tranchées (test terrain d'abord).
- Variance individuelle des stats (§0 n°4) : non tranchée, rien ne bouge.
- Les mults/coûts des sorts de lignée : inchangés (aucun recalibrage dans ce chantier).
- Les libellés « ×1,4 ATQ » des boosts Zèle (cohérents) : amélioration d'affichage possible mais pas bloquante.

## Preuves (chaque lot, discipline AGENT.md)

Build + `node --test tests/*.test.js` + `node smoke-ui.mjs dist.html` + `node audit-sorts.mjs` (0 anomalie sur les lots livrés, le décompte des verdicts dans le rapport de revue) + digests `node combat-digest.mjs dist.html 3000` et `10000` MESURÉS : lots 1-2 inchangés attendus (MESURE de contrôle), lots 3-4-5 le digest bougera (documenté, sans recalibrage, nouvelle baseline proposée en fin de chantier). Un lot = un commit FR. Re-fetch de main avant chaque lot (couloirs parallèles). À la fin : revue `docs/historique/revue-sorts.md` (décompte avant/après des 5 racines, digests consignés), push, CI verte. Validation terrain ensuite par Marc-Olivier (l'écran de combat réel avec une recrue à effet + la lignée du Vol).
