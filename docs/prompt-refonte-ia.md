# Prompt de lancement — refonte de l'IA de combat, Phase 1 : audit + spec (AUCUN code)

> À coller au couloir 1. Le chantier « refonte de l'IA » est différé après l'errance et le calibrage (arbitrage ACTÉ) : on ne lance maintenant que sa **Phase 1, la rédaction** (audit + spec). **Aucun code, aucune data : à l'issue de ce lancement, build, tests, smoke et digest sont strictement inchangés.** La Phase 2 (code) sera déverrouillée par les tranchages de la session du 12/11. Règles du repo : une tâche = un commit français ; re-fetch avant chaque édition ; toute décision de design vit dans `docs/arbitrages.md`.

## 0. Contexte

- Le chemin Auto actuel : `pickSpell` (le sort le plus cher abordable, sans lecture du contexte), `enemyPickTarget` (score : bonus de kill + avantage d'élément − PV), `actEnemySupport`, les gimmicks (bélier, carrousel, cale…), `castSummon`. Le digest mesure ce chemin : baseline verrouillée (arbitrage calibrage du 11/11, STATU QUO ACTÉ) `f72106ff…` 1379/3000 et `3f9fe198…` 4558/10000, courbe par donjon 71,6 → 22,1 %.
- Une refonte de l'IA **changera le digest** : c'est une MESURE à consigner, jamais un recalibrage caché. Le go/no-go et le calendrier appartiennent à Marc-Olivier : section Questions ouvertes.
- Les tranchages de la session (identité du jeu, niveaux 1→100, architecture donjons × errance) conditionnent ce que l'IA doit optimiser : la spec marque ces dépendances au lieu de les supposer.

## 1. Lectures obligatoires

- `docs/skills/game-ai/` (SKILL.md, `references/`, SOURCES.md) : choix du modèle de décision, garde-fous (hystérésis, équité de perception, anti-blocage), vérifications exécutables.
- `docs/skills/ai-behavior-trees-utility-ai/` (SKILL.md + 4 références, mêmes provenance et licence) : score d'utilité, considérations, courbes de réponse, hystérésis, cycle de vie, test headless — c'est la référence la plus directement applicable au combat tour par tour.
- `docs/arbitrages.md` : entrées calibrage (11/11), T0.2 (camp de ciblage), « 2026-11-11 (nuit, 2e tour) ».
- `docs/design/session-qa-direction.md` : points 1 (identité) et 5 (niveaux).
- Le code : `src/engine/combat.js` (`pickSpell`, `enemyPickTarget`, `actEnemyStriker`, `actEnemySupport`), `src/engine/spells.js` (`applySupport`, `foeFacingSpell`), `src/engine/summon.js`, `src/errance.js` (`astar`), `combat-digest.mjs` (le harnas de mesure).
- `docs/prompt-correctifs-ciblage.md` : les correctifs en cours touchent le même code ; la spec en tient compte, mais aucun chantier code IA ne part avant la session.

## 2. Livrable 1 — l'audit : `docs/design/refonte-ia-audit.md`

Un doc qui inventorie chaque décision actuelle de l'IA, son comportement exact et ses limites :

- **Choix de sort** (`pickSpell` : le plus cher abordable, pas de notion de contexte ; le sort de soin d'une carte de famille sans `effect` reste un coup sur l'ennemi en Auto : PISTE déjà consignée au correctif ciblage).
- **Ciblage** (`enemyPickTarget` : bonus de kill + avantage d'élément − PV ; l'arrière protégé à −50 % ; l'Option A).
- **Ligne support ennemie** (`actEnemySupport`), **invocations** (`castSummon`), **gimmicks**, **statuts** (dot, curse, reflect, stun).
- **Asymétries joueur/IA** : le joueur a la Tactique et sa fenêtre d'action ; l'IA a son propre chemin. Lister où l'IA est plus bête ou plus maline que le joueur.
- **Audit de l'A* de l'errance** (`src/errance.js`, `astar`) contre `references/pathfinding.md` du skill game-ai : admissibilité de l'heuristique (diagonales √2 vs 1), corner cutting, politique de repathing, anti-blocage. Pour chaque gotcha du skill : conforme ou écart.

Chaque constat : référence fichier/fonction + repro minimal quand c'est testable.

## 3. Livrable 2 — la spec : `docs/design/refonte-ia-spec-plan.md`

Trame des specs existantes (`docs/design/contenu-v3-spec-plan.md`, `docs/design/reste-code-spec-plan.md`) : contexte, verrous, lots, preuves attendues. Contenu attendu :

- **Modèle de décision recommandé** : selon la table du skill game-ai, un modèle par périmètre. Combat tour par tour : recommandation attendue = score d'utilité par unité (voir `references/utility-ai-system.md` du skill compagnon : considérations, courbes, hystérésis anti flip-flop), un arbre complet n'est probablement pas nécessaire. Errance : réactions simples, perception équitable (pas d'omniscience, réaction différée), garde-fous anti-blocage.
- **Ce que l'IA optimise** : deux variantes balisées `[À TRANCHE — SESSION 12/11]` selon (a) statu quo raretés/paliers, (b) niveaux 1→100 + fusions.
- **Lots proposés** : lot 0 = suite du correctif ciblage (chemin Auto des sorts alliés des lignées, PISTE existante) ; lot 1 = utilité de ciblage (menace, fragilité, position, lignes) ; lot 2 = choix de sort contextuel (soin si un allié est blessé, contrôle sur la plus grosse menace, burst si un kill est possible) ; lot 3 = intelligence graduée par étage de donjon (si l'architecture « 5 étages » passe en session : l'IA monte en compétence avec l'étage) `[À TRANCHE — SESSION 12/11]` ; lot 4 = errance (perception, réaction différée, anti-blocage).
- **Digest** : chaque lot changera la mesure → protocole : MESURE N = 3000 et N = 10 000 avant/après chaque lot, comparaison à la baseline verrouillée, écarts consignés dans arbitrages. Aucune maths du côté joueur ne bouge : la difficulté ne vient que de l'IA. Go/no-go final : Marc-Olivier `[À TRANCHE — SESSION 12/11]`.
- **Anti-triche** : l'IA ne lit aucune information cachée au joueur ; équité de perception du skill (dernière position connue, délai de réaction).
- **Preuves attendues par lot** : décisions déterministes semées et testables headless (cf. « Headless tick test » du skill compagnon), pas de validation à l'œil.

## 4. Interdits

- **Aucun code, aucune data dans cette phase** : deux documents uniquement.
- Le digest, les tests, le smoke et le build restent strictement inchangés à l'issue de ce lancement.
- Pas de moteur temps réel : les skills parlent d'agents temps réel (steering, tick par frame) ; le combat de Lignées est tour par tour : n'importer que les principes (modèle de décision, garde-fous, vérifications headless).
- Aucun lancement de chantier code IA avant les tranchages de la session du 12/11.

## 5. Preuves de la Phase 1

- Les deux docs poussés (audit, puis spec), un commit français par doc.
- Validation finale : build + `node --test` + `node smoke-ui.mjs dist.html` + digest inchangés (aucun code touché), validateur vert.
- Les sections Questions ouvertes alimentent la session du 12/11.
