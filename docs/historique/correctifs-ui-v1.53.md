# Chantier « correctifs-ui » (ui-v1.53) — 14/11/2026

> Objectif : faire jouer des bots EXCLUSIVEMENT PAR L'UI (clics sur le DOM rendu, jamais l'API moteur) pour détecter les problèmes d'interface signalés par Marc-Olivier. Livré en 2 commits : le harnas `bot-ui.mjs` (+ `stub.mjs` amélioré pour la fidélité DOM), puis les 2 correctifs + tests de non-régression PAR CLICS + fix du smoke S28 + docs + dist.

## 1. Le harnas (`bot-ui.mjs`)

Chaque bot joue une **partie complète** dans le dist embarqué (VM `stub.mjs`), mais contrairement à `bots-boucle.mjs` il ne pilote **que le DOM rendu** : départ (`.depart-choice`), navigation par clics (liens nav + ancres du hub, délégation document-level), équipe (`.cell-btn` in/out, fiches au tap), donjons (`.diff-chip`, `.enter-btn`, modale du modificateur `#mod-accept`/`#mod-free`), combats tactiques par clics (`.act-attack`/`.act-item`/`.act-spell`/`.act-swap`/`.act-pass`, `.act-target`, `.act-potion`, `.act-cancel`), écran Récompenses (`.recomp-row`, `#recomp-all`), modales de fin, sac entre étages, boutique, guilde, **Autel des Lignées par clics** (`.autel-row`, `#autel-confirm` ×2), collection, errance top-down (`.enter-zone`, `#errance-back`, `#dj-normale`/`#dj-royale`, POI autel/jarre/porte, la boucle rAF de l'UI déplace le héros toute seule).

Détecteurs : exceptions dans les handlers (stack inclus), écran vide après navigation, fenêtre d'action sans boutons, aucune cible après Attaque, victoire sans écran Récompenses, Récompenses qui ne se referme pas, chaîne d'étages bloquée, aperçu de fusion absent, porte vaincue sans déblocage, **monde d'errance qui vit en coulisse après le retour**, toast ✗ = refus observable (compté comme refus, PAS anomalie), invariants `checkStore` après chaque action, save → load comparé. Dotation « compte revenant » (or 500-1000 + jetons 120-240), recrutement initial PAR CLICS à la guilde. Modes : `node bot-ui.mjs dist.html <N> <graine> [--lot|--essaim]` ; env `BOT_UI_SCALE`, `BOT_UI_BUDGET`, `BOT_UI_COMBAT_BUDGET` (25 s par défaut), `BOT_UI_LOT`/`BOT_UI_PAR`, `BOT_UI_LOTS_FILE` (reprise après interruption).

`stub.mjs` amélioré pour la fidélité UI (sans casser les suites existantes) : `doc.addEventListener/removeEventListener/dispatchEvent` RÉELS (la délégation document-level du jeu marche), `makeEl.click()` bulle vers document en respectant `stopPropagation`, `closest(sel)` réel, `firstChild`/`lastChild` (le pipeline combat faisait `logEl.firstChild.remove()`), `requestAnimationFrame` avec horodatage de l'horloge du contexte, `scrollTo/scrollY/innerWidth/innerHeight/devicePixelRatio`. **Piège découvert** : le stub ne découpe pas les sélecteurs composés (`.autel-row.sel`, `#errance-dlg.on` → 0 résultat) ni les attr-sélecteurs avec valeur quotée — toujours 1 token par sélecteur + filtre `classList`/`getAttribute` en JS.

## 2. Preuves du harnas

- **70 bots en essaim** (7 lots de 10, graines 6100-6700) : **39 216 clics, 528 combats, 134 victoires, 123 achats, 285 captures DQM : 0 exception, 0 divergence save → load.**
- **Lot de vérification sous charge** (3 processus parallèles, graines 7200/7300/7400, budget combat 40 s) : 30 bots, 282 combats, 65 victoires, **1 fusion accomplie PAR CLICS à l'Autel** (graine 7200), 0 exception, 0 anomalie de combat.
- **« combat sans issue (budget dépassé) » : 23 cas sous 10 processus parallèles, diagnostiqués CONTENTION CPU, pas un bug du jeu** — 0 en solo (lot 7100 : 83 combats, 0 anomalie), 0 sous 3 processus à budget 40 s. Le message d'anomalie embarque désormais les flags `fenêtres/busy/actEl/inCombat/hash` pour trancher.
- **« entrée de donjon sans modale » : reclassé REFUS LÉGITIME** — la garde équipe de `enterAt` (équipe vide → toast « ✗ Composez d'abord votre équipe. » + `go('#equipe')`) est un comportement voulu du jeu, pas un bug ; le harnas le compte désormais comme refus.

## 3. Les 2 bugs UI trouvés (et prouvés par sonde avant/après)

### Bug 1 — La fusion par l'Autel des Lignées ne marche JAMAIS (chaîne vs nombre)

`el.dataset.autelIid` (l. 6499 de `src/ui.js`) est une **chaîne** (`"3"`) poussée telle quelle dans `autelSel`, alors que les iids sont des **nombres** (3). Conséquences en cascade : `autelSel.includes(inst.iid)` (l. 6461) toujours faux → la sélection ne s'affiche jamais (`.sel` absente) ; `store.instances.find((i) => i.iid === autelSel[0])` (l. 6469) toujours faux → « aperçu indisponible » ; garde silencieuse au 2e clic de `#autel-confirm` → **la fusion par l'UI ne peut jamais aboutir**. Le harnas moteur (`bots-boucle.mjs`) ne l'a pas vu car il appelle `doFusion` directement.

Sonde déterministe (clics réels) : dist d'origine → `sel = 0`, « aperçu indisponible », **pas de bouton** ; dist corrigé → `sel = 2`, APERÇU OK, 2 clics → 3 instances (2 parents consommés + 1 enfant, iid entier).

**Correctif : `const iid = Number(el.dataset.autelIid);`** — `autelSel` contient des nombres partout, cohérent avec `includes`, `find` et `doFusion` (comparaison `===` stricte). `autelSel` est runtime-only (jamais persisté) : aucune migration nécessaire.

### Bug 2 — Le monde d'errance continue de vivre en coulisse après le retour (combats qui surgissent)

`#errance-back` (l. 3277) faisait `persistErrancePos(); save(); go('#accueil');` **sans remettre `store.errance` à null**. La boucle rAF (l. 3133 : `if (!store.errance || store.errance !== st) return;`) continuait donc de tourner : le héros poursuivait son chemin, les rencontres continuaient, et `startZoneFight` pouvait être déclenché **depuis un autre écran** (un combat surgit pendant que le joueur navigue dans les menus).

Sonde : héros envoyé vers la porte du donjon, `#errance-back` cliqué pendant la marche — dist d'origine : `store.errance` NON-NULL et le héros a parcouru **~10 tuiles en coulisse** (22.9/14.1 contre 23.4/24.4 au retour) ; dist corrigé : `store.errance = null`, héros figé, aucun combat en coulisse.

**Correctif : `store.errance = null;` dans le handler `#errance-back`** (et pareil au POI « retour ville » de la boucle). Strictement cohérent avec le modèle de persistance : `restore()` remet déjà `store.errance = null` à chaque chargement (la carte est reconstruite à l'entrée de zone depuis le seed), donc cet état est exactement celui d'un rechargement de page. Aucun autre lecteur de `store.errance` hors `ui.js`.

## 4. Fix du smoke S28 (le smoke passait PAR ACCIDENT)

Le scénario S28 de `smoke-ui.mjs` seedait des iids **chaînes** (`'smoke-dup-1'`/`'smoke-dup-2'`), qui matchaient le bug d'origine par accident (chaîne === chaîne). Corrigé : iids **numériques** `900001`/`900002` comme en jeu, et le `pick` compare `r.dataset.autelIid === String(iid)`. Sans ce fix, le correctif 1 faisait échouer S28 (NaN).

## 5. Preuves finales

- **373 tests verts** (2 nouveaux, `tests/correctifs-ui.test.js`, **PAR CLICS RÉELS** : fusion à l'Autel de bout en bout avec `.sel` visible et enfant iid entier ; `#errance-back` → `store.errance` null, héros figé après 1,5 s de boucle rAF, aucun combat en coulisse). Contrôle négatif : le test fusion ÉCHOUE sur le dist d'origine.
- **Smoke 483 TOUT PASSE** (2 runs).
- **Digest INCHANGÉ `d630d83e…` 419/3000 (0 exception, 0 marathon)** — les correctifs sont pure UI, le moteur n'est pas touché.

## 6. Suite

Recouper avec les problèmes constatés en main par Marc-Olivier (les 2 bugs corrigés sont de très bons candidats : fusion impossible + combats surgissant après le retour des Terres Sauvages). Poursuivre l'essaim UI sur d'autres graines pour couvrir les recoins rares (panoplies royales, autel de soin, huttes).
