# Chantier « correctifs-bots » (bots-v1.52) — 15/11/2026

> Objectif : demander à des milliers de bots de jouer le jeu de bout en bout (moteur ET UI) pour faire remonter un maximum de bugs de progression, d'équilibrage et de fonctionnement. Livré en 2 commits : le harnas `bots-boucle.mjs` (+ paire `removeCard` dans `stub.mjs`), puis les 4 correctifs + test de non-régression + fix du smoke + docs + dist.

## 1. Le harnas (`bots-boucle.mjs`)

Chaque bot joue une **partie complète** via le vrai dist embarqué dans un contexte VM (`stub.mjs`) :

- **Dotation de départ « compte revenant »** (or 500-1000 + jetons 120-240) pour que les boucles économiques (boutique, guilde) s'exercent réellement dès les premières actions.
- **Équipe formée par le vrai chemin** (`newInst` + `addCardIid`), 3-4 cartes non-N, parfois une carte libre hors équipe (candidat de fusion pour l'Autel).
- **~60 actions pondérées adaptatives** : tant que l'équipe moyenne est < niveau 9, le bot grind (42 % donjons / 23 % errance) ; ensuite il diversifie (économie, fusion 10 %, navigation).
- **Donjons JOUÉS COMME UN JOUEUR** : `enterAt` → modale du modificateur (`#mod-accept`) → rounds moteur (`resolveTurn`) jusqu'à vainqueur ou tour 60 (**la Fureur du donjon = égalité légitime, pas un marathon**) → miroir du gestionnaire de victoire (quêtes, or, record, drops, pièces de boss, écran Récompenses avec **vraies captures DQM cliquées**, XP exact avec fatigue/réserve/découverte, `persistRunStateFrom`) → la chaîne « Tout ramasser » avance l'étage (`store.stage += 1; save; go('#combat')`).
- **Errance top-down** : `enterZone`, cible POI (autel de soin, jarres → éclats bruts, porte du donjon de zone), `stepErrance`, rencontres → **vrai `startZoneFight`**, victoire sur la porte → `unlockZone`.
- **Économie réelle** : `buyPotion`, `buyEclat`, `buyEquipment`, `craftPiece`, `buyCompagnon` (id inconnu testé : refus gracieux attendu), `equipPiece`, `addCardIid`/`removeCard`.
- **Fusion à l'Autel des Lignées** : `fusionPreview` + `doFusion` avec `childIid: store.instanceSeq++` — l'iid de l'enfant doit être ENTIER.
- **Navigation des 6 pages** (`#accueil`, `#equipe`, `#collection`, `#forge`, `#donjons`, `#glossaire`) : chaque rendu doit passer sans erreur.
- **Save → load** : la partie doit survivre au rechargement, comparée champ par champ (or, jetons, instances, slots, pool, potions, collection, record, équipement).

**Invariants vérifiés après CHAQUE action** : or entier ≥ 0 ; iids entiers positifs ; niveaux bornés 1-100 ; cartes connues en collection ; équipe ≤ 5 sans doublon d'iid, sans slot orphelin, ≤ 3 exemplaires par carte ; PV/mana du pool de run bornés par le **vrai max de combat** (miroir de `makeUnit` : cran, éclats, shiny, fusion, équipement, INT) ; potions entières.

**Mode essaim** : au-delà de ~50-60 bots par processus (OOM : chaque bot boote un contexte VM ~1 Mo retenu par les timers UI), le harnas découpe en lots de 50 avec des graines distinctes (`--lot` = 1 rapport JSON sur stdout, `--essaim` = agrégation par vagues).

## 2. Les 4 bugs du dist d'origine, détectés puis corrigés

| # | Bug (symptôme remonté par le harnas) | Racine | Correctif |
|---|---|---|---|
| 1 | `enfant de fusion avec iid non entier : "fus-5-6"` puis iids non entiers récurrents, save/load divergents, slots orphelins | `doFusion` créait l'enfant avec l'iid **chaîne** `fus-A-B` : `byIid` ne résolvait plus, les slots et le pool PV/mana se perdaient au save/load | moteur : `opts.childIid` entier ; UI : `childIid: store.instanceSeq++` ; migration des vieilles sauvegardes (`iidRemap` dans `restore()`, slots réparés) |
| 2 | le 3e exemplaire d'une carte ajouté légalement disparaissait au rechargement | `sanitizeTeams` plafonnait à `Math.min(2, owned)` alors que `addCardIid` autorise 3 | `Math.min(3, owned)` (aligné sur le cap d'ajout) |
| 3 | PV/mana max hors combat faux (soins tronqués en donjon, écran boutique trompeur) | `curHpManaOf` plafonnait sur `statsAt` seul, ignorant le cran de race, les éclats de famille, le shiny, le bonus de fusion, l'équipement et l'enrichissement de mana par l'INT | nouveau `combatMaxOf(inst)`, miroir exact de la construction des unités de `renderCombat` ; ex. Sergent des Brumes (e4) : maxHp **88** (et non 84), manaMax **15** (et non 10) |
| 4 | exception `Carte inconnue` jetée à l'écran quand la Guilde recalcule une offre disparue | `buyCompagnon` utilisait `byId` (lève sur id inconnu) | `byIdSoft` : refus gracieux `false` |

**+ fix du harnas de vérification** : la course B11 du smoke (le pipeline asynchrone de victoire repeignait `#app` pendant le check de la page Quêtes, frappait les DEUX dists 3 fois sur 3) — `await wait(230)` après « Tout ramasser » ; 483/483 stable sur 6 runs (2 dists × 3).

## 3. Preuves

- **Build** : `dist.html` régénéré (1001725 caractères).
- **Tests** : **371/371 verts** (364 + 7 nouveaux dans `tests/correctifs-bots.test.js` : (a) iid enfant ENTIER, (b) slot de l'enfant préservé save → load, (c) sauvegarde LEGACY « fus-A-B » auto-réparée (iid remappé + slot réparé), (d) 3 exemplaires conservés, (e) cran +5 % → maxHp 88 vs 84, (f) mana enrichi par l'INT → 15 vs 10, (g) `buyCompagnon` id inconnu → false sans exception).
- **Smoke** : **483 checks TOUT PASSE, 3 runs consécutifs** (course B11 éliminée).
- **Digest** : **IDENTIQUE `d630d83e…` 419/3000 (0 exception, 0 marathon)** — les correctifs ne touchent pas le combat, preuve par l'identité.
- **Essaim 500 bots** (graines 11000-11949, 10 lots séquentiels de 50) : **29 735 actions, 13 441 combats, 3 121 victoires, 72 fusions, 780 achats, 3 629 captures DQM, 1 019 zones débloquées — 0 exception, 0 anomalie.**
- **Contrôle négatif** (dist d'origine reconstruit sans les correctifs, 150 bots, graines 12000-12149) : **447 anomalies + 336 exceptions détectées** — iids `fus-A-B` non entiers (enfant + récurrents), save/load divergents, exceptions « Carte inconnue » de `buyCompagnon`. Le harnas détecte bien les bugs réels ; les correctifs les éliminent.

## 4. Suit le projet

Le digest étant inchangé, la baseline PROPOSÉE `d630d83e…` / `584f5d16…` (suite 55) reste en vigueur en attente de verrouillage par Marc-Olivier. Le harnas devient un outil permanent rejouable : `node bots-boucle.mjs dist.html 500 10000 --essaim`.
