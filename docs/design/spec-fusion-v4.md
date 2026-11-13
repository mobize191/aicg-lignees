# Spec — Fusion DQM v4 : deux cartes → un enfant (à lancer après arbitrage de la baseline)

> Chantier de contenu v4 n°1, rédigé par le couloir pilotage à partir des tranchages de Marc-Olivier (session du 12/11, items 6, 21, 25-32 du tableau de bord `docs/design/session-qa-direction.md`). PRÉREQUIS : baseline digest arbitrée. La fusion ne touche pas les maths de combat → digest inchangé attendu.

## 1. Tranchages actés (rien à rediscuter)

- **Forme exacte** : enfant **niveau 1** ; **25 % des stats cumulées des parents, plafonné par la rareté de l'enfant** ; **2-3 sorts hérités** (dont sorts de famille, jamais le signature de l'enfant) ; **famille et rareté par table de synthèse** en `data/`.
- **Famille conservée, palier pas automatiquement lié** : la table désigne l'enfant (famille + rareté), la fusion ne fait pas monter le palier d'office.
- **Table de synthèse de familles à la DQM** : certaines paires → l'une des deux familles **au hasard** ; d'autres paires → **automatiquement une TROISIÈME famille désignée** : humain + monstre aquatique → **sirène** ; humain + ent → **dryade** ; humain + ange → **demi-ange** (à incarner via les éveillés ou une créature intermédiaire à créer, HORS lot 1 : contenu v4).
- **Mystère des lignées** : on voit la carte, pas sa descendance — l'aperçu de fusion ne révèle jamais l'identité exacte de l'enfant.
- **Cohabitation avec l'évolution existante** : l'évolution par voie (paliers C→UC→R→SR→UR→L, matériaux et doublons, `data/evolutions.json` type « fusion » = doublons) est **conservée telle quelle** ; la fusion DQM est un **système nouveau et séparé**. Pas de réécriture rétroactive du mot « fusion » dans le changelog historique.

## 2. Règles moteur (défauts balisés [À TRANCHER] — Marc-Olivier tranche ou laisse le défaut)

1. **Deux cartes jouables → un enfant, les deux parents CONSOMMÉS** (retirés de la collection ; leur équipement revient à l'inventaire ; les cartes en équipe active ou uniques de collection sont REFUSÉES à la sélection). Familles divines (L) éligibles ? **[À TRANCHER] DÉFAUT : oui, mais l'enfant d'une paire avec une divine est plafonné par sa propre rareté — aucune légendaire créée ex nihilo.**
2. **Table de synthèse** `data/fusion-synthese.json` : clé = paire de familles triée ; valeur = `{ "famille": "A" | "B" | "hasard" | "<id famille cible>", "rarete": "max" | "<rareté fixe>" }`. La table couvre toutes les paires jouables (défaut : `A` pour les paires non listées) ; les paires désignées (hybrides) pointent vers la famille cible. **[À TRANCHER] Rareté de l'enfant — DÉFAUT : palier le plus haut des deux parents (`max`), les paires désignées peuvent surclasser d'un palier (l'hybride est le bonus).**
3. **Stats** : base de la carte enfant + `min(25 % × somme des stats des parents, plafond de rareté)`. Plafonds en data (`fusion.plafonds`) : **C +20 %, UC +25 %, R +30 %, SR +35 %, UR +40 %, L +50 %** [DÉFAUT À TRANCHER : calibrage, constants en data, MESURE de la courbe après].
4. **Sorts hérités** : jusqu'à 2-3 sorts des parents, **jamais le signature de l'enfant**. **[À TRANCHER] DÉFAUT : le joueur CHOISIT jusqu'à 2 sorts hérités dans la fenêtre de fusion (3 si les deux parents sont de palier SR ou plus)** ; les sorts appris sont conservés par l'enfant à cran I.
5. **Niveau** : l'enfant part niveau 1 (croissance inchangée `XP_GROWTH`) ; l'XP des parents est perdue avec eux.
6. **Familles prédominantes** (lignées exclusives initiales, spec séparée à venir) : la fusion y reste — marge prévue dans la table (`"famille": "A"` impose la famille prédominante), non branchée au lot 1.

## 3. UI

- **[À TRANCHER] DÉFAUT : bâtiment dédié du hub-ville, « l'Autel des Lignées »** (l'autel d'errance garde son rôle de repos). Sélection 2 cartes → **aperçu mystère** : famille cible (ou « ? » si hasard, avec les 2 candidats), palier, valeur du plafond, nombre de sorts hérités choisis ; l'identité exacte de l'enfant (nom, art) reste masquée jusqu'à la confirmation.
- Double confirmation (les deux parents sont consommés) ; toasts ; entrée changelog in-game ; scénario IHM **S27** ajouté au protocole (fusion de bout en bout, aperçu mystère, garde-fous).
- La collection reste silencieuse sur la descendance (mystère) ; aucune liste de recettes en jeu.

## 4. Lots (un commit FR chacun, discipline AGENT.md)

- **Lot 1 — data + moteur** : `data/fusion-synthese.json` + `fusion.plafonds` en data ; moteur de fusion (règles 1-6) ; tests génératifs : 100 fusions seedées → parents consommés, enfant niveau 1, plafond respecté pour toutes raretés, sorts hérités valides (jamais le signature), famille conforme à la table (hasard reproductible par seed), garde-fous (carte en équipe refusée).
- **Lot 2 — UI Autel des Lignées** : bâtiment hub-ville, sélection, aperçu mystère, choix des sorts hérités, double confirmation, toasts ; smoke (section dédiée) ; changelog + protocole IHM S27 ; capture à valider par Marc-Olivier (téléphone ET PC).
- **Digest** : inchangé attendu (aucune maths de combat) — MESURE de contrôle au lot 2 pour le prouver.
- Le demi-ange/éveillé et les arts des éventuelles nouvelles cartes hybrides : HORS périmètre, avec le contenu v4 (couloir design).

## 5. Hors périmètre (rappels)

- Systèmes HUR/HSR et hybrides « H » : DIFFÉRÉS après le 1→100.
- Lignées exclusives initiales : spec séparée (direction actée en principe, forme à préciser avec le lore Le Lieur).
- Fusion des sorts (accords) existante par ailleurs : inchangée.
