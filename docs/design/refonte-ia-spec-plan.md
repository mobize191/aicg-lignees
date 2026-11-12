# Refonte de l'IA de combat — spec et plan (Phase 2 : lots 0-4 + mise en place)

> Date : 2026-11-12. Prompt de lancement : `docs/prompt-refonte-ia.md`. Audit préalable : `docs/design/refonte-ia-audit.md`. Skills de référence : `docs/skills/game-ai/` (percevoir → décider, hystérésis de seuil, garde-fous anti-blocage, vérifications headless) et `docs/skills/ai-behavior-trees-utility-ai/` (score d'utilité à considérations normalisées 0..1, sélection argmax + bonus d'inertie, tests headless à probe).

## Contexte

Le chemin Auto sert à la fois l'IA ennemie et le mode 🤖 Auto du joueur. Toute amélioration de décision s'applique aux **deux**, mêmes règles, état public uniquement (anti-triche). Baseline de comparaison du chantier : la mesure courante au lancement de chaque lot — `f8a9f0bb…` 1359/3000 (0 exception, 1 marathon) et `978ed44b…` 4517/10000, re-mesurées avant/après chaque lot (`node combat-digest.mjs dist.html 3000`, puis `10000` à la clôture). Baselines verrouillées de référence : `f72106ff…` 1379/3000, `3f9fe198…` 4558/10000.

## Verrous

- Les maths de combat et du côté joueur ne bougent pas ; la difficulté ne vient que de l'IA. Aucun recalibrage caché : chaque changement de mesure est une MESURE consignée dans `docs/arbitrages.md`.
- `data/*.json` source de vérité : tous les poids/ seuils de l'IA (hystérésis, seuils de soin, profils de difficulté) vivent en data (`data/engine.json` moteur, `data/difficulties.json` profils), jamais en dur dans `src/`. Le test allowlist le vérifie.
- `dist.html` régénéré par `node build.mjs`, jamais édité à la main. Zéro dépendance npm.
- Pas de moteur temps réel : le combat reste tour par tour ; on importe des skills leurs principes (modèle de décision, hystérésis, garde-fous, tests headless), pas leur code.
- Un lot ne démarre que quand le précédent a sa preuve complète : build + `node --test` + `node smoke-ui.mjs dist.html` + MESURE N = 3000 dans la tolérance.

## Tranches à trancher (session 12/11) — `[À TRANCHE — SESSION 12/11]`

1. **Ce que l'IA optimise** : statu quo (raretés/paliers, niveaux 1→25 des marches) vs niveaux 1→100 (point 5 de `docs/design/session-qa-direction.md`). Défaut appliqué si non tranché : **variante (a) statu quo raretés/paliers** — l'IA optimise la victoire du combat avec les paliers actuels.
2. **IA graduée par étage** : oui/non (architecture « 5 étages » du point 3 de la session). Défaut : **pas d'IA par étage** — le lot 3 reste en version difficultés actuelles (Facile → Enfer).
3. **Go/no-go digest** : oui, sous la tolérance du § Tolérance. Défaut : **oui**.

## Lots

### Lot 0 — chemin Auto des sorts alliés des lignées (suite directe des correctifs ciblage)

En Auto (`action` null), un sort de lignée soin/boost/bouclier cast depuis la ligne arrière fait quelque chose d'utile : soin → l'allié le plus blessé (montant = mult × stat principale du lanceur, plafonné au PV manquant), boost → atkBuff sur la ligne avant (valeur = mult − 1), bouclier → shield sur la ligne avant (plafonné à `HEAL_CAP_RATIO` × PV max). Le chemin Tactique ne bouge pas. Cartes avec `effect` : comportement historique (déjà couvert par `effKind`). **Première MESURE attendue du chantier** (le digest doit bouger, dans la tolérance).
- Preuves : tests headless déterministes (état reconstitué, `stepRound(st, null)`, événements attendus) ; build + tests + smoke + MESURE 3000 consignés dans arbitrages.

### Lot 1 — utilité de ciblage

`enemyPickTarget` devient un score d'utilité à considérations normalisées (skill utility-ai) : kill possible, menace (ATQ de la cible), position/ligne (arrière protégé pénalisé), opposition d'élément, fragilité (PV restants). **Hystérésis anti flip-flop** : la cible en cours est conservée si elle reste vivante et dans la marge d'hystérésis (bonus d'inertie, poids en data). Le score est partagé avec le chemin Auto du joueur (symétrie §2.3 de l'audit : `foes[0]` → même utilité), avec la même hystérésis (cible mémorisée par camp dans l'état de combat).
- Preuves : décisions déterministes semées sur états reconstitués (kill possible prime, menace prime, hystérésis bloque le changement au bord du seuil) ; MESURE 3000.

### Lot 2 — choix de sort contextuel

`pickSpell(u)` lit le contexte (état public) : soin si un allié est blessé sous le seuil (data), contrôle sur la plus grosse menace, burst si un kill est possible, sinon le sort le plus efficace relativement au coût (mult/coût). Hystérésis : pas de flip-flop entre tours (bonus d'inertie sur le sort en cours). S'applique aux deux camps (même fonction). La règle d'économie « save for top » reste en garde-fou.
- Preuves : tests headless déterministes (seuil de soin, kill possible, efficacité/coût, hystérésis) ; MESURE 3000.

### Lot 3 — graduation de l'intelligence

Profils par difficulté actuelle dans `data/difficulties.json` : Facile = choix pondérés volontairement sous-optimaux (une part des décisions tirée au sort dans une graine déterministe propre à l'IA, jamais dans le RNG de combat) → Enfer = utilité complète. Extensible aux étages si l'architecture « 5 étages » est tranchée `[À TRANCHE]` ; sinon version difficultés actuelles. La difficulté du combat passe par `initCombat(..., { difficulty })` ; le harnais digest passe la difficulté de la marche.
- Preuves : tests déterministes (même seed → mêmes choix ; profil Facile ≠ profil Enfer sur états reconstitués) ; MESURE 3000.

### Lot 4 — errance (garde-fous)

Selon l'audit §3 : **anti-blocage** — repath après stagnation (aucun progrès vers le prochain waypoint pendant ~2 s simulés) et changement d'état après échecs répétés (abandon du but, arrêt). **Perception équitable** : aucune omniscience (rien à changer aujourd'hui, pas de poursuivant), la règle « dernière position connue + réaction différée » est consignée pour le futur. Ni décor ni structure des zones touchés.
- Preuves : tests headless déterministes sur `stepErrance` (héros bloqué → repath tenté → abandon après N échecs) ; MESURE 3000 (l'errance n'est pas dans le digest : mesure de non-régression des tests d'errance existants).

## Tolérance de mesure (défaut, portée aux tranchages)

Après chaque lot : MESURE N = 3000, comparée à la mesure courante du lot précédent. Le lot passe si écart du taux global ≤ 5 points, 0 exception, ≤ 1 marathon. N = 10 000 à la clôture. Hors tolérance : STOP, consignation dans `docs/arbitrages.md`, avis de Marc-Olivier avant de continuer.

## Mise en place (clôture)

1. Tests headless permanents des décisions (déterminisme semé) ; smoke enrichi (section anti-triche par introspection + modes Auto/ennemi sur chaque difficulté).
2. Digest final N = 3000 + N = 10 000 consignés dans arbitrages, proposition de verrouillage de la nouvelle baseline (décision : Marc-Olivier).
3. Protocole IHM versionné (`docs/validation-ihm.md`) : combats Tactique contre l'IA améliorée par difficulté, aucune régression du mode Auto, captures.
4. CHANGELOG, HISTORY, roadmap, `docs/tables/` si utile ; glossaire joueur inchangé sauf libellé devenu faux.
5. `node build.mjs`, CI verte, dist publié.
6. Validation finale Marc-Olivier (téléphone ET PC), puis baseline verrouillée ACTÉ dans arbitrages.
