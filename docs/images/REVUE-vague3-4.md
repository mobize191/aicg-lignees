# REVUE INDÉPENDANTE v3.4 — grand lancement (gel v18 + thèmes Repos/Obscures)

> Revue couloir design du 15/11 (QA vision Vibe, fiche skill `qa-pipeline-generatif` V4, 19 images inspectées individuellement + audit code/manifeste/déploiement). Objet : la livraison 3.4 (commits `af83e713`, `62e6dc1e` : 1 053 images, manifeste `assets-v34.json`, switch 5 versions, BOSS_CARD_MAP).

## 1. Conforme ✅

- **Manifeste** : 1 059 clés (351 classiques + 351 `-r` + 351 `-o` + 6 fonds), p2 Ange Gardien ABSENT, format 400×560 vérifié, 81,5 Mo.
- **Déploiement** : pages.yml copie les 5 manifestes ; HTTP 200 vérifié sur les 5 (v3, v3.1, v32, v33, v34) + index.
- **Code** : `ART_MANIFESTS` 5 versions (V3→V3.4) ; `BOSS_CARD_MAP` câblé avec priorité `royale.boss` > BOSS_CARD_MAP > bossPaliers > bossCards (bug bosses CORRIGÉ, plus d'art aléatoire) ; appositions = tables par thème en data (jamais de texte aléatoire).
- **Canon espèces (12/19 conformes en vision)** : Méduse k37 et w21 = femmes aux cheveux de serpents, zéro jellyfish ; g21 Vesna dryade MTG sans bois de cerf (retry effectif) ; k2 nymphe croupie (candle, couronne d'algues, pas de bête) ; g3 VRAI sanglier de mousse ; f13 efreet humanoïde ; g16 Mycola fungus non-humanoïde ; k16 liche ; d36 Peste sans plaie (R13) ; z8 Astre AILÉ ; e32 Souverain = bête marine couronnée (tranchage a appliqué) ; d20 succube humanoïde ailée adulte.
- **Thème Obscures** : inversion visible sans gore (e31-o, e14-o).

## 2. Défauts ❌ (2 bloquants, 3 à retry, 2 mineurs)

### B1. Mécanique Exception NON CÂBLÉE (bloquant — les 702 images thèmes sont inaccessibles)
`rollException`, `exceptionTheme`, `exceptionApposition` sont DÉFINIS dans `src/ui.js` (l. 1939-1962) mais **JAMAIS APPELÉS** : aucun tirage à l'obtention, `c.exception` jamais posé, pas de transfert à la fusion, aucun test ni check smoke. Conséquence : en jeu, aucune carte ne peut jamais afficher un art `-r`/`-o`, la classe CSS `exception` et les appositions sont mortes. Le rapport de session annonçait la mécanique « livrée » : elle ne l'est pas.
**Correctif attendu (couloir 1)** : tirage dans `newInst` (taux 1/100, thème 50/50 r/o), drapeau `exception` persisté (migration versionnée idempotente comme le shiny), `artKeyOf` chaîné shiny > exception > classique, transfert à la fusion (au moins un parent exception → enfant), apposition dans le titre, tests + smoke (S31bis).

### B2. Marqueur CSS par thème MANQUANT (bloquant visuel, lié à B1)
Un seul marqueur `.art-img.exception` doré (shell.html l. 131) pour les DEUX thèmes. La spec (§2) et la suite 40 exigent : Repos = sweep OR croisé 60°, **Obscures = liseré/sweep ROUGE SOMBRE**. Ajouter la variante par thème (classe `exception-r`/`exception-o` ou data-attribute), `prefers-reduced-motion` conservé.

### R1. e31 Hydre des Marées : 1 SEULE tête (classique) — canon hydre = 3 têtes ; versions -r (2 têtes, et PAS une scène de repos) et -o (2 têtes) non conformes aussi. Le rapport l'avait marqué « note » sans retry : **retry requis sur les 3** (renforcer `three serpentine heads on long necks` + vérifier visuellement).
### R2. s18 Kiri l'Invincible : armure BLANCHE/argent au lieu de NOIRE intégrale (cheveux noirs OK). Le rapport l'avait marqué « note pour prochaine passe » : **retry requis** (noir intégral + verifier -r/-o).
### R3. e14 (Titan des Marées) : version **Repos = scène MENAÇANTE** (créature aux yeux rouges + confrontation au ponton), pas une scène de vie ; version Obscures avec dérive d'identité possible (forme épineuse ≠ titan classique). **Retry ou arbitrage de la définition Repos sur les cartes M/boss** (une M au repos peut garder une présence, mais pas une confrontation).

### Mineurs
- **d28 Belzébuth** : roi infernal humanoïde régaliel OK, mais SANS le motif canon mouche (ni yeux composés, ni halo de mouches — un halo lumineux à la place). Retry léger ou écart assumé à trancher.
- **d20 Succube** : tenue moulante à décolleté profond — zone grise R12 (« élégante, rien de vulgaire »). À trancher par le propriétaire.
- **p4 Fidèle du Jour** encore présent au manifeste (p4, p4-r, p4-o) : le retrait data (suites 28/30, lot séparé) n'est pas livré — si p4 sort du data, retirer les 3 clés au prochain build.
- `exceptionApposition` utilise `Math.random()` (non seedé) : digest-neutre mais non rejouable ; aligner sur l'`rng` seedé du shiny.
- Vision a signalé un « cadre » sur s18/k37 : probable vignette painterly (faux positif connu du QA vision sur les planches) — non retenu.

## 3. Digests
Les arts 3.4 = cosmétique pure, inchangés par construction. La baseline bouge par les chantiers PARALLÈLES (refonte v2 + correctifs-eq v2, suites 52-55) : dernière proposition **`d630d83e…` 419/3000 / `584f5d16…` 1419/10000** — verrouillage à arbitrer par Marc-Olivier (l'impact digest du lot bug bosses est absorbé dans cette chaîne).

## 4. Verdict
**Livraison 3.4 en ÉTAT QUASI-BON côté production (images/manifeste/déploiement), MAIS NON JOUABLE côté mécanique** : tant que B1/B2 ne sont pas corrigés, les thèmes Repos/Obscures n'existent pas en jeu. Retries ciblés : e31×3, s18×3, e14-r (+ e14-o et d28 à trancher). Aucune régénération de masse nécessaire : l'échantillon (19/1053, 1,8 %) montre un canon tenu partout ailleurs.
