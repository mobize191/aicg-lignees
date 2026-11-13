# Spec — Fusion DQM v4 : deux cartes → un enfant (baseline arbitrée : prête à lancer)

> Chantier de contenu v4 n°1, rédigé par le couloir pilotage à partir des tranchages de Marc-Olivier (session du 12/11, items 6, 21, 25-32 du tableau de bord `docs/design/session-qa-direction.md` ; **AMENDÉE le 13/11, suite 8 : la couche race**, tranchages dans `docs/arbitrages.md`). PRÉREQUIS SATISFAIT : baseline digest VERROUILLÉE par Marc-Olivier le 13/11 (`9faff1b9…` 838/3000 / `6103e7b0…` 2795/10000). La fusion ne touche pas les maths de combat → digest inchangé attendu contre cette baseline (MESURE de contrôle au lot 1 et au lot 2 pour le prouver).

## 1. Tranchages actés (rien à rediscuter)

- **Forme exacte** : enfant **niveau 1** ; **25 % des stats cumulées des parents, plafonné par la rareté de l'enfant** ; **2-3 sorts hérités** (dont sorts de famille, jamais le signature de l'enfant) ; **famille et rareté par table de synthèse** en `data/`.
- **Famille conservée, palier pas automatiquement lié** : la table désigne l'enfant (famille + rareté), la fusion ne fait pas monter le palier d'office.
- **Table de synthèse de familles à la DQM** : certaines paires → l'une des deux familles **au hasard** ; d'autres paires → **automatiquement une TROISIÈME famille désignée** : humain + monstre aquatique → **sirène** ; humain + ent → **dryade** (les deux réconciliées avec la couche race le 13/11 : elles sont les issues MYSTIQUES de ces paires). ~~Humain + ange → demi-ange~~ **RÉVISÉ le 13/11 (suite 8) : le demi-ange est RETIRÉ** — humaine + divin suit le cycle (→ monstre du biome + chance de démon, cf. §2).
- **Mystère des lignées** : on voit la carte, pas sa descendance — l'aperçu de fusion ne révèle jamais l'identité exacte de l'enfant.
- **Cohabitation avec l'évolution existante** : l'évolution par voie (paliers C→UC→R→SR→UR→L, matériaux et doublons, `data/evolutions.json` type « fusion » = doublons) est **conservée telle quelle** ; la fusion DQM est un **système nouveau et séparé**. **RÉVISION le 13/11 : le type « regression » MEURT** (cf. §2.5). Pas de réécriture rétroactive du mot « fusion » dans le changelog historique.

## 2. La couche RACE (TRANCHÉE le 13/11, suite 8 — vaut AU-DESSUS de la table famille)

La race de chaque carte est donnée par le moteur (`raceOfCard`, `RACE_MOD` : humaine +0 %, monstre +10 %, mystique +20 %, divine +30 %). La grammaire est DEUX-ÉTAGES : **la couche race décide du TYPE d'enfant (saut de race ou lignée parentale), la couche famille (table de synthèse) désigne la lignée.**

1. **Le cycle** : monstre → mystique → divine → monstre. **L'humain est le catalyseur** (le Lieur : seul l'humain crée du neuf) : humaine + monstre → enfant **mystique** ; humaine + mystique → enfant **divine** ; humaine + divin → enfant **monstre**.
2. **Taux de saut : 55 % uniforme**, en data (`fusion.sautRate`, ajustable). Échec du saut → règle des mêmes races : **carte de la lignée d'un des parents, 50/50** (sauf lignée prédominante : elle s'impose).
3. **Paires sans humain (Mo+My, Mo+D, My+D) : PAS de saut** — lignée d'un des parents, 50/50. Deux mêmes races : idem.
4. **humaine + divin réussi** : l'enfant est un VRAI monstre (gobelin, aquatique, feu, etc.) — biome cible listé par paire dans `fusion-synthese.json` [DÉFAUT À CALER : biome de l'élément de la famille humaine] ; **une chance de DÉMON est conservée** (taux dédié en data [DÉFAUT À CALER : 15-20 %], l'enfant tombe alors dans la famille démon du gel) — l'union interdite de l'humain et du divin peut engendrer un diable.
5. **Les régressions MEURENT (TRANCHÉ : « toutes les régressions passent par la fusion »)** : le type d'évolution « regression » et l'Éclat de régression sont retirés au lot 1 (l'entrée vivante `a17` Kenji, Sabre Céleste → `a20` Mage de la Fournaise dans `data/evolutions.json` est supprimée ; `eclat-regression` retiré des tables de butin ; **migration des éclats en stock** [DÉFAUT À CALER : conversion en or ou jetons]). Les **héros** atteignent leur état supérieur PAR FUSION : L humaine du starter + monstre → **forme MYSTIQUE du starter** (la prédominance capture le saut : la famille s'impose, la race suit le cycle) ; forme mystique + humaine → **forme DIVINE**. Les formes supérieures des starters sont des cartes à créer (contenu v4, arts après ids définitifs).
6. **N et M inchangés** : deux naissances N → fusion refusée ; N + famille → la lignée de l'autre parent (palier bas) ; paire avec un M → refusée.

## 3. Règles moteur (défauts balisés [À TRANCHER] — Marc-Olivier tranche ou laisse le défaut)

1. **Deux cartes jouables → un enfant, les deux parents CONSOMMÉS** (retirés de la collection ; leur équipement revient à l'inventaire ; les cartes en équipe active ou uniques de collection sont REFUSÉES à la sélection). Familles divines (L) éligibles ? **[À TRANCHER] DÉFAUT : oui, mais l'enfant d'une paire avec une divine est plafonné par sa propre rareté — aucune légendaire créée ex nihilo.**
2. **Table de synthèse** `data/fusion-synthese.json` : clé = paire de familles triée ; valeur = `{ "famille": "A" | "B" | "hasard" | "<id famille cible>", "rarete": "max" | "<rareté fixe>" }` — et pour les paires de saut, la lignée d'accueil de la race cible (sirène / dryade / démon / biome monstre). La table couvre toutes les paires jouables (défaut : `A` pour les paires non listées) ; les paires désignées (hybrides) pointent vers la famille cible. **[À TRANCHER] Rareté de l'enfant — DÉFAUT : palier le plus haut des deux parents (`max`), les paires désignées peuvent surclasser d'un palier (l'hybride est le bonus).**
3. **Stats** : base de la carte enfant + `min(25 % × somme des stats des parents, plafond de rareté)`. Plafonds en data (`fusion.plafonds`) : **C +20 %, UC +25 %, R +30 %, SR +35 %, UR +40 %, L +50 %** [DÉFAUT À TRANCHER : calibrage, constants en data, MESURE de la courbe après].
4. **Sorts hérités** : jusqu'à 2-3 sorts des parents, **jamais le signature de l'enfant**. **[À TRANCHER] DÉFAUT : le joueur CHOISIT jusqu'à 2 sorts hérités dans la fenêtre de fusion (3 si les deux parents sont de palier SR ou plus)** ; les sorts appris sont conservés par l'enfant à cran I.
5. **Niveau** : l'enfant part niveau 1 (croissance inchangée `XP_GROWTH`) ; l'XP des parents est perdue avec eux.
6. **Familles prédominantes** (lignées exclusives initiales, spec séparée à venir) : la fusion y reste — marge prévue dans la table (`"famille": "A"` impose la famille prédominante), non branchée au lot 1. **Amendé suite 8 : la prédominance capture AUSSI le saut de race (l'enfant du starter reste dans sa lignée, la race suit le cycle) → c'est le chemin des formes supérieures du starter (§2.5).**

## 4. UI

- **[À TRANCHER] DÉFAUT : bâtiment dédié du hub-ville, « l'Autel des Lignées »** (l'autel d'errance garde son rôle de repos). Sélection 2 cartes → **aperçu mystère** : race cible et famille cible (ou « ? » si hasard, avec les candidats), palier, valeur du plafond, nombre de sorts hérités choisis ; l'identité exacte de l'enfant (nom, art) reste masquée jusqu'à la confirmation.
- Double confirmation (les deux parents sont consommés) ; toasts ; entrée changelog in-game ; scénario IHM **S27** ajouté au protocole (fusion de bout en bout, aperçu mystère, garde-fous).
- La collection reste silencieuse sur la descendance (mystère) ; aucune liste de recettes en jeu.

## 5. Lots (un commit FR chacun, discipline AGENT.md)

- **Lot 1 — data + moteur** : `data/fusion-synthese.json` + `fusion.plafonds` + `fusion.sautRate` en data ; moteur de fusion (règles §2-§3) ; **retrait du type « regression », de l'entrée `a17` et de l'Éclat de régression + migration des éclats en stock** ; tests génératifs : 100 fusions seedées → parents consommés, enfant niveau 1, plafond respecté pour toutes raretés, sorts hérités valides (jamais le signature), race conforme au cycle (saut reproductible par seed), famille conforme à la table (hasard reproductible par seed), garde-fous (carte en équipe refusée).
- **Lot 2 — UI Autel des Lignées** : bâtiment hub-ville, sélection, aperçu mystère, choix des sorts hérités, double confirmation, toasts ; smoke (section dédiée) ; changelog + protocole IHM S27 ; capture à valider par Marc-Olivier (téléphone ET PC).
- **Digest** : inchangé attendu (aucune maths de combat ; le retrait de la régression change une condition d'évolution, pas les combats) — MESURE de contrôle au lot 1 et au lot 2 pour le prouver.
- Les formes supérieures des starters (mystique/divine) et les arts des nouvelles cartes hybrides : HORS périmètre moteur, avec le contenu v4 (couloir design, ids définitifs d'abord).

## 6. Hors périmètre (rappels)

- Systèmes HUR/HSR et hybrides « H » : DIFFÉRÉS après le 1→100.
- Lignées exclusives initiales : spec séparée (direction VALIDÉE dans l'esprit le 13/11 ; forme à préciser avec le lore du Lieur — 4 starters lame/eau/aube/ombre proposés au v18 §8, 3 questions ouvertes).
- Fusion des sorts (accords) existante par ailleurs : inchangée.
