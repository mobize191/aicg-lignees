# Prompt couloir 1 — Correctif Exception v3.4 (E1 code, E2 CSS) + lot retries design (E3, couloir local)

**Contexte** : la vague 3.4 a livré 1 053 arts (351 cartes × 3 thèmes Classique / Repos `-r` / Obscures `-o`, manifeste `assets-v34.json`, 1 059 clés). La revue indépendante (suite 57, rapport `docs/images/REVUE-vague3-4.md`) a constaté que la mécanique **Exception est du code mort** : `rollException` / `exceptionTheme` / `exceptionApposition` sont définis dans `src/ui.js` (~l. 1939-1962) mais jamais appelés, `c.exception` n'est jamais posé, aucune persistance, aucun test. Les 702 images `-r`/`-o` sont donc **inaccessibles en jeu**. Par ailleurs un seul marqueur CSS doré existe (`.exception`, `src/shell.html` l.131) alors que la spec exige Repos = sweep or 60° et **Obscures = liseré ROUGE SOMBRE**.

**Objectif** : livrer la mécanique Exception de bout en bout en suivant **le patron du lot 8 SHINY** (déjà en place, même fichier) : tirage unique à l'obtention, porté par l'exemplaire, persistance + migration versionnée idempotente, héritage fusion, art chaîné, marqueur visuel, tests + smoke. Rien d'autre ne bouge.

## Lot E1 — Câblage complet de l'Exception (BLOQUANT B1)

1. **Tirage à l'obtention** dans `newInst(id, lvl, xp)` (`src/ui.js` l.754) : après `rollShiny`, ajouter le tirage Exception — `const ex = rollException(uiRand) ? exceptionTheme(uiRand) : null;` et poser `exception: ex` sur l'exemplaire. **Un seul tirage porte le statut**, exactement comme le shiny. `rollException`/`exceptionTheme` prennent déjà un rng en paramètre : les utiliser au lieu de les laisser morts. Le shiny et l'Exception **coexistent** (suites 40/57 : shiny = variance stats, Exception = cosmétique).
2. **Alignement rng** : `exceptionApposition(id, theme, universe)` utilise `Math.random()` (non seedé) — remplacer par le rng passé en paramètre (même signature, ajouter le rng), à l'instar du harnas digest seedé du shiny.
3. **Chaînage d'art** dans `artKeyOf(c)` : ordre **shiny > exception > classique** — si `c.shiny` et `ART[id+'-s']` existe, clé shiny ; sinon si `c.exception` et `ART[id+'-'+c.exception]` existe (suffixe `-r`/`-o`), clé thème ; sinon fallback classique. Fallback propre : une Exception sans image thème affiche l'art classique (jamais de glyph cassé).
4. **Propagation du drapeau** : `instCard(c, inst)` et les points qui propagent `shiny` (fiche, slots d'équipe, collection, combat si pertinent) doivent aussi propager `exception: inst.exception || null`. `artOf` lit déjà `c.exception` pour la classe CSS — le brancher par thème (E2).
5. **Apposition** : le nom affiché (fiche + collection) reçoit l'apposition `exceptionApposition(...)` une seule fois par affichage, jamais persistée dans les données.
6. **Persistance** : sauvegarder/restaurer `exception` sur les exemplaires (comme `shiny` l.1156 : `raw.exception === 'r' || raw.exception === 'o' ? raw.exception : null`).
7. **Migration versionnée idempotente** (patron shiny lot 8, migration v32) : bump de version de sauvegarde, tirage **seedé** des exemplaires existants (1/100, 50/50 r/o), non destructive, rejouable sans double tirage (le flag existant gagne). Suivre le mécanisme `MIGRATIONS` existant (EXI-SAVE-1).
8. **Fusion v4** : héritage miroir du shiny — si **≥ 1 parent porte `exception`**, l'enfant est Exception avec **thème re-tiré 50/50 r/o** dans le plan de fusion (`fusionPreview`/`doFusion`), indépendamment de l'héritage shiny (les deux se cumulent).
9. **Collection** : compteur « ✦ n exceptions » à côté du compteur shiny + filtre « Exceptions seules » (patron filtres shiny, `filters.shiny` l.3533).
10. **Tests** (patron `tests/shiny-lot8` et `tests/correctifs-eq-v2-*`) : tirage seedé 1/100 (bornes), thème 50/50, round-trip save/restore, migration idempotente (2 passes = même résultat), transfert fusion (les 4 combinaisons shiny/exception), chaînage `artKeyOf` (shiny prioritaire, fallback classique), apposition seedée. **Smoke** : checks dédiés (E-SMOKE : exemplaire exception affiche l'art `-r`/`-o` + le marqueur du bon thème).
11. **Preuves attendues** : build ✔ ; tous les tests ✔ ; smoke TOUT PASSE ✔ ; validateur 0 erreur ✔ ; **digest 3000/10000 MESURÉ et INCHANGÉ attendu** (l'Exception est cosmétique, comme les arts 3.4 — le tirage passe par `uiRand` hors combat). Si le digest bouge, STOP et consigner l'écart avant tout recalibrage.

## Lot E2 — Marqueurs CSS par thème (BLOQUANT B2)

1. Remplacer le marqueur unique `.exception` (doré) par **deux marqueurs thématiques** dans `src/shell.html` :
   - `.exception-r` (Repos) : conserve le sweep or 60° actuel (animation `exception-sheen`, drop-shadow doré) ;
   - `.exception-o` (Obscures) : **liseré rouge sombre** — `box-shadow: inset 0 0 0 2px rgba(140, 20, 32, .55)` + drop-shadow rouge sombre + sheen rouge (dérivée de la même animation, teinte adaptée).
2. `artOf`/`cardFront` posent la classe selon `c.exception` (`art-img exception-r` / `art-img exception-o`). Garder `.exception` comme classe de base commune si utile, mais le visuel doit différer par thème.
3. Badges distincts : « ✦ Repos » / « ✧ Obscure » (à côté du badge ✨ Shiny, coexistence possible).
4. Vérifier le contraste sur les fonds de donjon sombres (pas de rouge illisible sur Crypte).

## Lot E3 — Lot retries design (COULOIR LOCAL ComfyUI, pas couloir 1)

Seeds : suite de `seeds-v3.csv` (renvoyer les entrées retry avec suffixe `-r2`), prompts de base repris de `docs/images/spec-arts-v34-gel-v18.md`, mêmes paramètres que la vague 3.4 (34,8 s/image constatés).

| Cible | Défaut constaté | Retry demandé |
|---|---|---|
| **e31 Hydre** ×3 (classique, `-r`, `-o`) | 1 tête au classique (2 sur `-r`/`-o`) au lieu de TROIS | Canon hydre 3 têtes sur les 3 versions ; `-r` doit rester une scène de vie |
| **s18 Kiri** (classique en priorité) | Armure blanche/argent au lieu de noire intégrale | Armure NOIRE intégrale, vérifier aussi `-r`/`-o` |
| **e14-r Titan Repos** | Scène menaçante (confrontation au ponton) | Scène de vie/paix (le Titan peut être présent mais pas en confrontation) ; vérifier `e14-o` (dérive d'identité possible) |
| **d28 Belzébuth** (optionnel, à trancher par Marc-Olivier) | Aucun motif mouche (yeux composés/halo de mouches) | Retry léger avec halo de mouches OU écart assumé |

Après génération : remplacer les clés correspondantes dans `assets-v34.json` (mêmes clés), re-déployer, QA vision sur les retries uniquement.

## Mineurs hors périmètre de ce chantier (déjà consignés suite 57)

- p4 encore au manifeste (retrait data en attente, suites 28/30) ;
- d20 succube décolleté profond (zone grise R12) — à trancher ;
- définition « Repos » sur les cartes M (présence admise, confrontation non).

## Livraison

- Commits FR par lot, consignation **suite 60 ou suivante** dans `docs/arbitrages.md` (**vérifier le dernier numéro dans le journal AVANT de consigner** ; relire le journal complet par morceaux — il dépasse 100 Ko, ne JAMAIS pousser une base tronquée).
- Aucune régénération de masse : ce chantier ne touche ni les prompts de génération, ni le data d'équilibrage.
