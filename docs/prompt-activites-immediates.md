# Prompt de lancement — activités immédiates (couloir 1), en attendant la session de tranchage

> À coller au couloir 1. La session de tranchage (`docs/design/session-qa-direction.md`) peut réviser l'architecture du jeu (errance, donjons, élément des cartes, niveaux 1→100) : ce prompt ne contient QUE du non-controversable — des corrections de bugs déjà consignées et la rédaction de specs des ACTÉS du 11/11 nuit, les questions ouvertes étant balisées pour la session. Règles du repo : une tâche = un commit français ; `data/*.json` source de vérité ; `dist.html` jamais édité à la main (`node build.mjs`) ; zéro dépendance npm ; re-fetch avant chaque édition ; toute décision de design vit dans `docs/arbitrages.md`.

**À lire avant de commencer** : `AGENT.md`, `docs/roadmap.md` (section « Retours de session du 11/11 nuit »), `docs/arbitrages.md` (entrée « 2026-11-11 (nuit, 2e tour) »), `docs/prompt-correctifs-ciblage.md`, `docs/historique/revue-v1.34.md` (état v1.34, revue du couloir pilotage). Format des specs : reprendre la trame de `docs/design/contenu-v3-spec-plan.md` et `docs/design/reste-code-spec-plan.md` (contexte, verrous, lots, preuves attendues).

## Phase 1 — correctifs (priorité, à exécuter d'abord)

Le chantier de correctifs ciblage est LIVRÉ pour ses lots 1 à 3 (v1.34, revue `dfdda22`). Restent les **lots 4-5 — bugs rapides IHM** (détails de carte si équipe pleine, ajout involontaire à l'équipe, fiche des sorts complète, collections au propre) : les exécuter selon `docs/prompt-correctifs-ciblage.md`, avec la contrainte digest `c62fcbd1…` 1281/3000 et `5059e683…` 4236/10000 INCHANGÉS (baselines v1.34 ; les anciennes `f8a9f0bb…`/`978ed44b…` sont PÉRIMÉES). Les correctifs passent avant les specs.

## Phase 2 — specs des ACTÉS du 11/11 nuit (rédaction, AUCUN code)

Rédiger QUATRE specs de design. Chacune contient : le périmètre ACTÉ (déjà tranché, s'applique tel quel), la proposition détaillée (data, UI, moteur, migrations de sauvegarde), les preuves attendues à l'exécution future (tests, smoke, digest), et une section « Questions ouvertes » dont chaque item est balisé `[À TRANCHE — SESSION 12/11]` (elles alimenteront la session). Statut : specs PROPOSÉES, rien ne se code avant la session. Une spec = un commit français.

### Spec A — `docs/design/spec-sets-equipement.md` (ACTÉ : sets assignables)

- Découpage de `data/equipment.json` : les ~90 arts complets par objet (ACTÉ du 11/11 soir) deviennent des pièces de sets. Proposition : environ 7 à 10 sets nommés (set assassin, set prêtre…), nombre de pièces par set, mapping complet objet → set.
- Assignation : un set = une carte à la fois ; un set assigné reste sur la carte jusqu'à désassignation ; UX dans la page Personnage (déjà à onglets depuis v1.31).
- Bornes de rareté équipement/carte (ACTÉ) : tableau complet N/C/UC/R/SR/UR/L (N ≈ C ; C → objets C/UC ; UC → +R ; R → +SR ; SR → +UR ; UR → +L) et règle d'affichage des objets non équipables par une carte.
- Panoplies par famille/biome façon Dofus/Wakfu (gobelin → gobelin royal → sauvage, monstres marins, sirènes…) : proposition de correspondances famille ↔ set.
- Bonus de set : proposition à 2 niveaux (2 pièces / complet), affinités et capacités par set.
- Moteur et sauvegardes : réutiliser les bonus existants en % sur les stats ; migration des sauvegardes (objets possédés → pièces de sets, assignations par défaut).
- Questions ouvertes balisées : nombre exact de sets ; panoplies par famille (13 ?) ou par biome × classe ; chiffrage des bonus de set.

### Spec B — `docs/design/spec-navigation-hub.md` (ACTÉ : menu haut supprimé, accueil par défaut)

- Menu du haut supprimé, menu latéral seul ; l'Accueil = page par défaut, toujours visible en fond ; un fond propre à chaque page ; petites interactions depuis l'Accueil vers les Terres Sauvages, la Boutique, la Guilde.
- Point de retour ville obligatoire dans CHAQUE zone d'errance (sans menu du haut, c'est le seul moyen de rentrer) : proposition d'emplacement (porte de la ville, marqueur sur la carte).
- Écran d'entrée du donjon (paliers accessibles) et état des donjons déjà bouclés affiché dans les Terres Sauvages.
- Section « Dépendances session » : tout ce qui touche à l'architecture errance × donjons (profondeurs, grandes zones, « 25 donjons ») est HORS périmètre de cette spec — lister les points d'interface sans les spécifier, la session tranche.

### Spec C — `docs/design/spec-boutique-inventaire-onglets.md` (ACTÉ : onglets)

- Boutique : onglets par type (proposition : potions / éclats / armes / armures / talismans), refonte visuelle ; prix INCHANGÉS dans cette spec (le recalibrage attend la partie témoin de Marc-Olivier, voir spec D).
- Inventaire : onglets par type, petites cases symbole + nombre, description au clic, cohérence avec l'usage en combat et entre les étages.
- Figeage des listes : inventaire exact des objets actuels par catégorie (c'est aussi la mise au propre des collections, bug déjà consigné).

### Spec D — `docs/design/spec-gating-acquisitions.md` (ACTÉ : gating global par progression)

- Clé de gating proposée : donjon bouclé (le mécanisme du marchand v2, ACTÉ, rotation seedOfDay, fait foi) appliqué à TOUS les rayons : marchand, boutique, recrutements et acquisitions de cartes. Proposition de table : déblocage (donjon/palier/zone) → raretés et types autorisés.
- Guilde : l'hôtel de génération supprimé (ACTÉ) ; devenir des compagnons du jour : proposer les DEUX options avec chiffrage (supprimés d'un côté ; gardés mais gated, plus chers et recalibrés en puissance de l'autre, ils serviraient le recrutement façon Dragon Quest Monsters).
- Compagnons jugés trop forts et pas assez chers : proposition de recalibrage (prix, raretés, statistiques), marquée « à re-mesurer » après la partie à zéro de Marc-Olivier.
- Questions ouvertes balisées : clé exacte (donjon bouclé ? étage ? zone d'errance ?) ; la même clé pour tous les rayons ? ; sort final des compagnons.

## Interdits (coordination)

- Aucune refonte de fond de `src/ui.js` ni de l'errance et de son décor : la session de tranchage tranche l'architecture (points 3 à 5 du doc de session). Les lots 4-5 de la Phase 1 sont des correctifs ciblés, pas une refonte.
- **LEVÉE PARTIELLE (12/11, 4e tour, ACTÉ)** : la refonte visuelle de l'errance (peinture, ambiance, layout de zone) est lancée AVANT la session — `docs/prompt-refonte-errance.md`. L'interdit reste pour tout le reste, notamment l'architecture donjons × errance (points 3 à 5 du doc de session).
- Aucun changement de data d'équilibrage, aucun nouveau contenu : le contenu v3 est clos en v1.32.
- Les lots de la Phase 1 restent soumis à la contrainte digest inchangé du prompt de correctifs (baseline v1.34).
- Couloir design : hors de ce prompt, il continue selon `docs/images/spec-arts-serie3.md` (campagne d'arts série 3).
