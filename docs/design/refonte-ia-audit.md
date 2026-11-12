# Audit de l'IA de combat et de l'errance — refonte IA, Phase 1

> Date : 2026-11-12. Portée : moteur de décision du combat (choix de sort, choix de cible, modes Auto joueur et IA ennemie), gimmicks, statuts, et A* de l'errance. Hors périmètre : maths de combat, équilibrage, économie, contenu. Références : `docs/skills/game-ai/` (modèle de décision, perception, A*) et `docs/skills/ai-behavior-trees-utility-ai/` (utilité, hystérésis, vérifications headless). Prérequis vérifié : correctifs ciblage (`docs/prompt-correctifs-ciblage.md`, lots 1-3) livrés sur la branche (digest inchangé `f8a9f0bb…` 1359/3000).

## 1. Carte du chemin Auto / IA actuel

Le même code sert l'IA ennemie et le mode 🤖 Auto du joueur (`docs/roadmap.md` point 10) :

| Décision | Fonction | Fichier | Utilisé par |
|---|---|---|---|
| Choix de sort | `pickSpell(u)` | `src/engine/spells.js:4` | striker team (Auto) via `actTeamStriker`, striker ennemi via `actEnemyStriker`, support via `applySupport` |
| Choix de cible (ennemi) | `enemyPickTarget(e, targets, dmgBase)` | `src/engine/combat.js:497` | `actEnemyStriker` uniquement |
| Choix de cible (team Auto) | `foes[0]` (premier vivant) | `src/engine/combat.js` dans `actTeamStriker` | `actTeamStriker` en Auto sans désignation |
| Ligne support ennemie | `actEnemySupport` → `applySupport` | `src/engine/combat.js:660`, `src/engine/spells.js:135` | IA ennemie (et team Auto) |
| Invocation | `castSummon` | `src/engine/summon.js:3` | les deux camps |
| Gimmicks | dispersés dans `actTeamStriker` / `actEnemyStriker` / `applyDamage` | `src/engine/combat.js` | les deux camps |
| Errance | `astar` + `setTarget` + `stepErrance` | `src/errance.js:100,158,180` | joueur (clic) |

## 2. Inventaire décision par décision

### 2.1 Choix de sort — `pickSpell(u)` (`src/engine/spells.js:4-22`)

- **Comportement exact** : regen mana, puis prend le sort **le plus cher abordable** (`s.cost <= u.mana`, max cost). Règle d'« économie » : si le sort le plus cher de la liste (`u.spells[last]`) n'est pas abordable mais le sera dans ≤ 2 tours de regen (`cost <= mana + 2*manaRegen`), retourne `null` (la frappe simple est faite à la place). Aucun contexte de combat lu (pas de PV alliés, pas de menace, pas de kill possible).
- **Limites** : pas de soin d'urgence, pas de contrôle sur la plus grosse menace, pas de burst ciblé, pas d'efficacité coût/dégât. Le « save for top » peut réserver du mana indéfiniment si le regen est faible.
- **Repro minimal testable** : unité avec sorts coût 2 (mult 1.4) et 5 (mult 1.9), mana 5, un allié à 10 % PV et un ennemi killable en un coup → `pickSpell` retourne le sort à 5 dans les deux cas (aucune lecture du contexte). Test : `loadEngine()`, `makeUnit` avec spells injectés, assert sur le coût rendu.

### 2.2 Choix de cible — `enemyPickTarget(e, targets, dmgBase)` (`src/engine/combat.js:497-507`)

- **Comportement exact** : score = `+M.TARGET_KILL_BONUS` (1000) si `t.hp <= dmg` (kill possible), `+M.ELEMENT_ADVANTAGE_BONUS` (100) si l'élément du lanceur est fort contre la cible, puis `− t.hp`. Argmax, premier en cas d'égalité. Appelé **uniquement par l'IA ennemie**.
- **Limites** : pas de considération de menace (ATQ de la cible), pas de position/ligne (l'arrière protégé à −50 % est ciblé comme l'avant), pas d'hystérésis (la cible peut changer à chaque tour au bord du seuil — flip-flop possible quand deux cibles sont à score proche). Le camp joueur en Auto ne beneficie d'aucune de ces considérations : il frappe `foes[0]`.
- **Repro minimal testable** : deux cibles, l'une killable mais sans avantage élémentaire, l'autre non killable avec avantage élémentaire et moins de PV → la cible choisie est celle au score max ; refaire avec `dmgBase` à ±1 au seuil du kill pour montrer le flip-flop.

### 2.3 Choix de cible — équipe en Auto (`actTeamStriker`, `src/engine/combat.js:391-394`)

- **Comportement exact** : sans désignation tactique, cible = `foes[0]` (premier vivant de `enemyAll()` = avant puis arrière), jamais réévalué par utilité.
- **Asymétrie** : l'ennemi lit un score, le joueur Auto lit l'ordre de liste. C'est l'asymétrie principale du ciblage.

### 2.4 Ligne support — `applySupport` (`src/engine/spells.js:135-262`)

- **Comportement exact** : `pickSpell` (ou le sort désigné en Tactique). Si le sort est hostile (`foeFacingSpell`) → `castFoeSpell` sur les ennemis (ancrage = ennemi le plus faible, ou désigné). Sinon, retombe sur l'`effect` de la carte (`effKind` : heal/atkBuff/shield/stun/slow/dot/reflect/warcry/summon/curse/revive/link). Cartes sans `effect` + sort allié → **sort muet** en Auto (corrigé en Tactique par le lot 3 des correctifs ; le chemin Auto reste muet — c'est le lot 0 de cette refonte).
- **Limites** : le soin vise le plus blessé (`hurt` trié par PV) sans seuil d'urgence ; le boost/bouclier visent la ligne avant sans regarder qui en a besoin ; `dualSupport` soigne 2 alliés côté team seulement.
- **Repro minimal testable** : support sans `effect` + sort de lignée soin (aube), allié à 10 % PV, `stepRound(st, null)` → événement `cast`, aucun `heal` (avant lot 0).

### 2.5 Invocations — `castSummon` (`src/engine/summon.js:3-23`)

- **Comportement exact** : budget 3 invocations, max 2 `-inv` vivants dans la ligne avant, unité invoquée avec PV/ATQ dérivés du lanceur, sort fixe `SUMMON_SPELL`, TTL (`status.ttl`). Appelé quand un Invocateur avec `effect.kind === 'summon'` cast son sort (striker) ou via `effKind === 'summon'` (support).
- **Limites** : pas de choix d'invoquer ou non selon la situation (toujours si mana suffisant et budget restant) ; l'invoquée n'a pas de décision propre (elle frappe via le chemin Auto standard).
- **Repro minimal testable** : `initCombat` avec un Invocateur `effect.summon`, `playAuto` → compter les événements `summon` ≤ 3 et les `-inv` ≤ 2 vivants.

### 2.6 Gimmicks (comportement déterministe, les deux camps)

| Gimmick | Où | Comportement |
|---|---|---|
| `belier` | `actTeamStriker` / `actEnemyStriker` | ×`BELIER_BOOST` une fois par combat |
| `carrousel` | `actTeamStriker` | si `rng() < CARROUSEL_CHANCE`, dégâts de zone ×`CARROUSEL_SPLASH` |
| `cale` / `litiere` | `initCombat` | bouclier initial fixe |
| `ronde` | `beginRound` | +`RONDE_RATE` par ronde, cap `RONDE_CAP` |
| `voile` | touché (`actEnemyStriker`) | `rng() < VOILE_CHANCE` → esquive le coup |
| `mirage` | touché |renvoi de `REFLECT_SHARE` des dégâts |
| `benediction` | à sa mort | soigne toute l'équipe |
| `volee` | `actTeamStriker` | splash sur un autre ennemi (team seulement) |
| `prestige` | `makeUnit` | +2 regen mana |

- **Limite** : `volee` n'existe que côté team (asymétrie mineure, gimmick de carte joueur). Les gimmicks ne participent à aucune décision (l'IA ne « joue autour » d'aucun gimmick).

### 2.7 Statuts

`tickStatuses` (`src/engine/combat.js:130-177`) : dot, stun, slow, curse, reflect, dmgRed, copy, phoenix (`reviving`), link (`linkTtl`), ttl (invocations). Tous décrémentés en début de round. L'IA ne lit aucun statut dans ses décisions (ni les siens ni ceux de l'adversaire) : un ennemi stunné/dotté reste une cible comme une autre.

### 2.8 Asymétries joueur / IA

1. **Ciblage** : l'ennemi a `enemyPickTarget` (score), le team Auto a `foes[0]` (§2.3).
2. **Modificateurs d'équipe** : `teamModifiers` (synergies, regen, réductions, aoe…) ne s'appliquent qu'au camp `team` ; `actEnemySupport` et `castSummon` reçoivent `{}` côté ennemis. C'est une asymétrie de règles de jeu (voulue), pas de perception.
3. **Perception** : les deux camps lisent le même état public (`state`) ; aucune information cachée n'est lue (main du joueur, intentions, RNG futur non consommé). Le `copy` adverse lit `lastEnemySpell` (état public du round). **Anti-triche OK à ce jour** — à préserver et à vérifier par introspection dans le smoke (§ mise en place).
4. `volee` team-only (§2.6).

## 3. Audit du A* de l'errance (`src/errance.js:100-156`) contre `references/pathfinding.md`

| Critère (référence) | État | Détail |
|---|---|---|
| Heuristique admissible | ✅ | octile `max(dx,dy) + 0.4142*min(dx,dy)`, coût diagonal 1.4142 ≤ √2 → admissible et cohérent |
| Pas de corner cutting | ✅ | diagonale refusée si une orthogonale est solide (`errance.js:137`) |
| Butée d'expansion | ✅ | `guard < 4000` — un goal injoignable ne flood pas toute la carte, retourne `null` |
| Lissage | ✅ | `smoothPath` par ligne de vue (sampling ×2), ne traverse pas le solide |
| Repathing | ⚠️ | chemin calculé au clic (`setTarget`) uniquement ; **aucun repath en cours de route** |
| Anti-blocage | ⚠️ | collision par axe avec glissement, mais si le héros est bloqué (vitesse nulle, waypoint inatteignable) le chemin n'est jamais recalculé ni abandonné → stagnation possible |
| Perception équitable | ➖ N/A | pas d'ennemi poursuivant dans l'errance (rencontres aléatoires dans les hautes herbes, `encRate`) ; « dernière position connue / réaction différée » n'a pas de sens aujourd'hui, à garder en tête si des poursuivants arrivent |
| Changement d'état après échecs | ❌ | aucun : après un `setTarget` qui retourne `false` ou un blocage, aucun état alternatif (attendre, nouveau but) |

## 4. Constats transverses

1. **Modèle de décision actuel** : « règle fixe + argmax local » (pas de FSM/BT/utilité formel). Le skill `game-ai` recommande la couche percevoir → décider → agir ; ici tout est aplati dans `act*`.
2. **Hystérésis absente** partout : cible et sort peuvent flip-flopper au bord des seuils (skill utility-ai : bonus d'inertie ~0.05 sur l'action en cours).
3. **Pas de vérification headless des décisions** avant ce chantier : les tests couvrent les règles, pas les choix de l'IA.
4. **Déterminisme** : les décisions actuelles sont déterministes (hors gimmicks qui consomment `state.rng`) — à préserver : tests semés sur états reconstitués.
