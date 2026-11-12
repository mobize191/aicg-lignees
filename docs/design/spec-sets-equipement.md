# Spec A — Équipement en sets assignables

> Statut : **PROPOSÉ** (12/11/2026) — rien ne se code avant la session de tranchage. ACTÉ du 11/11 nuit (arbitrages, « 2026-11-11 (nuit, 2e tour) », point 5 ; doc de session §6) : ~7 sets nommés à affinités/capacités, un set assigné à une carte y reste jusqu'à désassignation (1 set = 1 carte), sets par famille/biome façon panoplies Dofus/Wakfu, rareté d'équipement bornée par la rareté de la carte. Prompt de lancement : `docs/prompt-activites-immediates.md` (Phase 2, spec A). Trame : `docs/design/contenu-v3-spec-plan.md`.

## Contexte (état actuel v1.34)

- `data/equipment.json` : **150 pièces** — 60 `source: "boutique"` (armes typées par classe + armures + slots d'équipe, raretés C/UC/R, prix 200–1 600 or) et **90 `source: "set"`** organisées en 5 sets de zone existants (`set-marees`, `set-forge`, `set-bosquet`, `set-crypte`, `set-zenith`, 18 pièces chacun, 3 paliers × 6 pièces), obtenus en boss/craft (matière du boss pour les paliers hauts), **jamais à la Boutique**.
- Mécanique actuelle : 2 slots par carte (arme typée + armure générique) + 2 slots d'équipe (`store.equip[cardId] = {arme, armure}` + slots d'équipe), bonus en % sur les stats appliqués dans `makeUnit`, **bonus de set +5 %** (`SET_BONUS_PCT`) quand arme + armure du même set (`EQUIP_SETS`, `equipBonusOfCard`). Le bonus de set actuel est binaire (complet ou rien) et ne concerne que arme+armure.
- Les ~90 arts complets par objet (ACTÉ 11/11 soir) sont les pièces `source: "set"` — ils deviennent les pièces des nouveaux sets.

## Périmètre ACTÉ (s'applique tel quel)

1. **~7 sets nommés** (set assassin, set prêtre…) à affinités et capacités.
2. **Assignation** : un set = une carte à la fois ; un set assigné y reste jusqu'à désassignation explicite. UX dans la page Personnage (déjà à onglets depuis v1.31).
3. **Sets par famille/biome** façon panoplies (gobelin → gobelin royal → sauvage ; sirènes, monstres marins…).
4. **Bornes de rareté équipement/carte** : N ≈ C ; C → objets C/UC ; UC → +R ; R → +SR ; SR → +UR ; UR → +L (extrémités hautes à préciser). Règle d'affichage des objets non équipables par une carte.
5. **Bonus à 2 niveaux** : 2 pièces / set complet.

## Proposition détaillée

### Data (`data/equipment.json`)

- Découpage en **8 sets nommés** (proposition) : 5 sets de biome existants renommés en panoplies nommées (Marées → « de la Sirène », Forge → « du Maître des Fours », Bosquet → « de la Reine des Spores », Crypte, Zénith) + 3 sets de classe/affinité transverses (ex. « de l'Assassin », « du Prêtre », « du Guerrier »). Chaque set : `nom`, `affinite` (classe ou famille cible), `pieces[]` (arme/armure/talisman…), `bonus2` et `bonusComplet` en data.
- Mapping complet objet → set : champ `set` sur chaque pièce (déjà présent pour les 90 pièces de set ; à étendre aux lignes boutique si elles rejoignent un set).
- Nouvelle table `bornesRarete` en data : `{"N": ["C"], "C": ["C","UC"], "UC": ["C","UC","R"], "R": ["R","SR"], "SR": ["SR","UR"], "UR": ["UR","L"], "L": ["L"], "M": ["L"]}` — rareté max d'équipement = borne de la rareté de la carte.

### Moteur

- Réutiliser les bonus % existants (`makeUnit` applique déjà `equip.atkPct` etc.) ; le bonus de set passe de binaire à **2 niveaux** : `bonus2` si ≥ 2 pièces du set portées, `bonusComplet` si toutes les pièces. Calcul en data (`EQUIP_SETS[set].bonus2/bonusComplet`), appliqué par `equipBonusOfCard`.
- Assignation : `store.equipSet[cardId] = setId` (un seul set par carte), persistance + **migration de sauvegarde** (voir lots).

### UI

- Page Personnage → onglet Équipe → fiche carte : bloc « Set » avec sélecteur de set (un seul), bouton « Désassigner », affichage des pièces possédées/ manquantes et du bonus actif (2 pièces / complet).
- Fiche carte : les objets non équipables (hors bornes de rareté, mauvaise classe) sont grisés avec la raison.

## Lots proposés

- **A1 (data + migration)** : découpage des sets, table `bornesRarete`, bonus à 2 niveaux en data ; migration v28 (non destructive) : `store.equip` → `store.equipSets` (assignation par défaut : le set de la zone de la carte si pièces possédées, sinon aucun).
- **A2 (moteur)** : `equipBonusOfCard` lit le set assigné + pièces portées, applique bonus2/bonusComplet ; tests de non-régression des bonus % existants.
- **A3 (UI)** : assignation/désassignation dans la fiche (page Personnage), grisés hors bornes, affichage du bonus actif ; smoke.
- **A4 (clôture)** : tables `docs/tables/` régénérées, CHANGELOG/HISTORY/roadmap, protocole IHM versionné.

## Preuves attendues (à l'exécution future)

- Tests headless : bornes de rareté (une carte C ne peut pas porter d'objet SR), bonus à 2 niveaux (2 pièces → bonus2, complet → bonusComplet), migration v28 idempotente et sans perte.
- Smoke : section dédiée (assignation, désassignation, grisés, bonus affiché).
- Digest : **inchangé attendu** (l'équipement du digest est nul — MESURE de confirmation à la clôture, baseline v1.34 `c62fcbd1…` 1281/3000 / `5059e683…` 4236/10000).

## Questions ouvertes

- [À TRANCHER — SESSION 12/11] Nombre exact de sets au lancement (7 ou 8 ?) et nombre de pièces par set (3 comme aujourd'hui, ou 2 arme+armure+talisman ?).
- [À TRANCHER — SESSION 12/11] Panoplies par famille (13 familles de monstres) ou par biome × classe — la correspondance famille ↔ set exacte.
- [À TRANCHER — SESSION 12/11] Chiffrage des bonus de set (bonus2 / bonusComplet en % par set, ou global ?) et capacités spéciales de certains sets complets.
- [À TRANCHER — SESSION 12/11] Les 60 pièces `source: "boutique"` restent-elles hors sets, ou rejoignent-elles les sets de classe ?
