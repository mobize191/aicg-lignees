# Prompt de lancement — refonte de l'IA de combat : Phase 1 (audit + spec), Phase 2 (code), mise en place

> À coller au couloir 1. Règles du repo : une tâche = un commit français ; `data/*.json` source de vérité ; `dist.html` jamais édité à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant chaque édition ; toute décision de design vit dans `docs/arbitrages.md` (entrées récentes en haut, date + statut). Le chantier « refonte de l'IA » était différé après l'errance et le calibrage (arbitrage ACTÉ 11/11) : Marc-Olivier en demande le lancement complet. **Une refonte de l'IA changera le digest : chaque changement de mesure est une MESURE consignée dans arbitrages, jamais un recalibrage caché ; les maths du côté joueur ne bougent pas.**

## 0. Contexte et périmètre

- Le chemin Auto actuel : `pickSpell` (le sort le plus cher abordable, sans lecture du contexte), `enemyPickTarget` (score : bonus de kill + avantage d'élément − PV), `actEnemySupport`, les gimmicks (bélier, carrousel, cale…), `castSummon`. Ce chemin sert **à la fois l'ennemi et le mode 🤖 Auto du joueur** (roadmap, point 10 : les deux sont dans le périmètre).
- Baselines : verrouillées `f72106ff…` 1379/3000 et `3f9fe198…` 4558/10000 (courbe par donjon 71,6 → 22,1 %, calibrage STATU QUO ACTÉ) ; mesure courante post-contenu v3 `f8a9f0bb…` 1359/3000 et `978ed44b…` 4517/10000. **Baseline de comparaison du chantier : la mesure courante au lancement de chaque lot** (re-mesurée avant/après, `node combat-digest.mjs dist.html 3000` puis `10000` à la clôture).
- Périmètre : le moteur de décision du combat (choix de sort, choix de cible, modes Auto joueur et IA ennemie) et les garde-fous d'équité. Hors périmètre : maths de combat, équilibrage, économie, contenu, structure de l'errance.

## 1. Prérequis et lectures

- **Prérequis absolu** : le chantier correctifs ciblage (`docs/prompt-correctifs-ciblage.md`) est livré (le lot 0 de l'IA en est la suite directe). Sinon : le livrer d'abord.
- `docs/skills/game-ai/` et `docs/skills/ai-behavior-trees-utility-ai/` (SKILL.md + références, provenance dans les SOURCES.md) : modèle de décision, score d'utilité, hystérésis, équité de perception, vérifications headless.
- `docs/arbitrages.md` : calibrage (11/11), T0.2, « 2026-11-11 (nuit, 2e tour) ». `docs/design/session-qa-direction.md` : points 1 et 5.
- Le code : `src/engine/combat.js`, `src/engine/spells.js`, `src/engine/summon.js`, `src/errance.js` (`astar`), `combat-digest.mjs`.

## 2. Phase 1 — audit + spec (documents uniquement, aucun code)

**Livrable 1 : `docs/design/refonte-ia-audit.md`** — inventaire de chaque décision actuelle de l'IA (comportement exact, limites, référence fichier/fonction, repro minimal testable) : choix de sort, ciblage, ligne support ennemie, invocations, gimmicks, statuts ; asymétries joueur/IA ; audit du A* de l'errance contre `references/pathfinding.md` (admissibilité, corner cutting, repathing, anti-blocage).

**Livrable 2 : `docs/design/refonte-ia-spec-plan.md`** — la spec du chantier complet (trame des specs existantes : contexte, verrous, lots, preuves). Elle reprend les lots de la Phase 2 ci-dessous, les affine avec les constats de l'audit, et marque `[À TRANCHE — SESSION 12/11]` : ce que l'IA optimise (statu quo raretés vs niveaux 1→100), l'IA graduée par étage, le go/no-go digest. Chaque lot : preuves attendues (tests headless déterministes semés, jamais de validation à l'œil).

**Porte A (fin de Phase 1) — STOP** : la Phase 2 démarre quand les tranchages de la session du 12/11 sont consignés dans arbitrages. À défaut de tranchage explicite, les défauts suivants s'appliquent et sont consignés : variante (a) statu quo raretés/paliers ; pas d'IA par étage (lot 3 en version difficultés actuelles) ; go digest = oui, sous la tolérance du §4.

## 3. Phase 2 — le code, lot par lot

Un lot à la fois, preuve avant le suivant, un commit français par lot. Symétrie : chaque amélioration de décision s'applique à l'IA ennemie ET au mode 🤖 Auto du joueur, mêmes règles (l'IA ne lit que l'état public : anti-triche, équité de perception du skill).

- **Lot 0 — chemin Auto des sorts alliés des lignées** (suite directe du correctif ciblage, PISTE déjà consignée) : en Auto, un sort de lignée soin/boost/bouclier depuis l'arrière fait quelque chose d'utile (soigner le plus blessé, buffer l'avant) au lieu du comportement historique. Le chemin Tactique ne bouge pas. Première MESURE attendue du chantier.
- **Lot 1 — utilité de ciblage** (`enemyPickTarget`) : score d'utilité (fragilité/kill possible, menace, position et lignes, opposition d'élément) avec hystérésis anti flip-flop (pas de changement de cible au bord du seuil sans raison). Tests : décisions déterministes semées sur états reconstitués.
- **Lot 2 — choix de sort contextuel** (`pickSpell`) : considérations et courbes du skill compagnon (soin si un allié est blessé sous seuil, contrôle sur la plus grosse menace, burst si un kill est possible, sinon le sort le plus efficace par rapport au coût). Hystérésis, pas de flip-flop entre tours.
- **Lot 3 — graduation de l'intelligence** : profils par difficulté actuelle (Facile = choix pondérés volontairement sous-optimaux → Enfer = utilité complète) ; extensible aux étages si l'architecture « 5 étages » est tranchée en session `[À TRANCHE]`.
- **Lot 4 — errance** : garde-fous sur l'existant selon l'audit (perception équitable : dernière position connue, réaction différée, pas d'omniscience ; anti-blocage : repath après stagnation, changement d'état après échecs). Ce lot ne touche ni le décor ni la structure des zones (chantiers séparés).

## 4. Tolérance de mesure (défaut, portée aux tranchages)

Après chaque lot : MESURE N = 3000, comparaison à la mesure courante du lot précédent. Le lot passe si : écart du taux global ≤ 5 points, 0 exception, ≤ 1 marathon ; N = 10 000 à la clôture du chantier. Hors tolérance : STOP, consignation dans arbitrages, avis de Marc-Olivier avant de continuer. **Aucun ajustement des maths joueur pour « compenser » : la difficulté ne vient que de l'IA.**

## 5. Mise en place (clôture du chantier)

1. **Tests et smoke** : tests headless permanents des décisions (déterminisme semé) ; smoke enrichi (section dédiée : anti-triche vérifiée par introspection — l'IA ne lit aucune information hors état public ; modes Auto/ennemi sur chaque difficulté).
2. **Digest final** : MESURE N = 3000 + N = 10 000 consignée dans arbitrages, avec proposition de verrouillage de la nouvelle baseline (décision : Marc-Olivier).
3. **Protocole IHM** : `docs/validation-ihm.md` versionné (combats Tactique contre l'IA améliorée par difficulté, aucune régression du mode Auto, captures).
4. **Documentation** : CHANGELOG, HISTORY, roadmap, `docs/tables/` régénérées si utile ; glossaire joueur inchangé sauf si un libellé devient faux.
5. **Build et déploiement** : `node build.mjs`, CI verte (tests + Pages), dist publié.
6. **Validation finale** : Marc-Olivier sur téléphone ET PC selon le protocole, puis verrouillage de la baseline actée dans arbitrages.

## 6. Interdits

- L'IA ne lit aucune information cachée au joueur (main, intentions, RNG futur) ; équité de perception du skill (délai de réaction, dernière position connue).
- Pas de moteur temps réel : le combat de Lignées est tour par tour ; n'importer des skills que les principes (modèle de décision, garde-fous, vérifications headless).
- Pas de recalibrage caché, pas de nouvelle data d'équilibrage, pas de contenu, pas de refonte de l'errance ni de `src/ui.js` au-delà des branchements nécessaires du mode Auto.
- Un lot ne démarre jamais sans que le précédent ait sa preuve complète (build + tests + smoke + MESURE).

## 7. Récapitulatif des preuves

- Phase 1 : deux docs poussés, un commit par doc, build/tests/smoke/digest inchangés.
- Phase 2 : par lot, commit français + tests headless verts + MESURE dans la tolérance consignée dans arbitrages.
- Mise en place : smoke enrichi, MESURE finale N = 3000 + 10 000, protocole IHM versionné, docs à jour, CI verte, validation Marc-Olivier, baseline verrouillée.
