# Spec C — Boutique et Inventaire en onglets

> Statut : **PROPOSÉ** (12/11/2026) — rien ne se code avant la session de tranchage. ACTÉ du 11/11 nuit (arbitrages, point 6 ; doc de session §8) : Boutique refondue en onglets (potions / éclats / armes / armures / talismans… au lieu d'une liste déroulante) ; Inventaire refondu en onglets par type (petites cases symbole + nombre, description au clic) — « trop d'objets affichés aujourd'hui ». **Prix INCHANGÉS dans cette spec** (le recalibrage attend la partie à zéro de Marc-Olivier, voir spec D). Prompt : `docs/prompt-activites-immediates.md` (Phase 2, spec C). Trame : `docs/design/contenu-v3-spec-plan.md`.

## Contexte (état actuel v1.34)

- **Boutique** (`renderBoutique`, `#boutique`) : une seule page longue avec sections empilées — rayon potions (4 potions, `data/potions.json` : soin 30 % 50 or / soin 60 % 120 or / mana 40 % 60 or / mana 80 % 140 or), rayon éclats bruts (5 éléments, 150 or, revendables 100 or), rayon équipement (60 pièces `source: "boutique"`, 200–1 600 or), marchand de créatures v2 (3 offres du jour + catalogue avec cadenas 🔒 par `debloqueParDiff`), atelier de craft (90 pièces de set).
- **Inventaire** (`renderInventaire`, `#inventaire`, aussi onglet de la page Personnage depuis v1.31) : page groupée en 4 blocs — Potions, Pièces (équipement possédé), Gemmes, Matériaux — liste verticale, vente des éclats bruts en un clic.
- Usage en combat : action 🤭 Objet (potions, chaque gorgée coûte le tour) ; entre les étages via le bouton Objets.

## Périmètre ACTÉ (s'applique tel quel)

1. Boutique en **onglets par type** : proposition potions / éclats / armes / armures / talismans (+ onglets existants marchand et atelier à conserver).
2. Inventaire en **onglets par type**, petites cases symbole + nombre, description au clic.
3. **Prix inchangés** ; figeage des listes d'objets par catégorie (inventaire exact = aussi la mise au propre des collections, bug déjà consigné).

## Proposition détaillée

### Boutique — onglets

- Onglets : **🧪 Potions · 💎 Éclats · ⚔️ Armes · 🛡️ Armures · 📿 Talismans/équipement d'équipe · 🐾 Marchand · 🔨 Atelier**. Les armes/armures/talismans viennent du découpage des 60 pièces `source: "boutique"` par `slot` (arme/armure/equipe) et `ligne` en data — aucune pièce ajoutée ni retirée.
- Prix lus en data comme aujourd'hui (`data/potions.json`, `ECLAT_BUY_PRIX`, `prix` des pièces, `data/marchand.json`) : **aucun prix ne bouge**.
- Le marchand v2 et l'atelier restent des onglets à part (gating inchangé, voir spec D pour l'extension du gating).

### Inventaire — onglets + figeage

- Onglets par type : **Potions · Pièces · Gemmes · Matériaux**, chacun en grille de petites cases (symbole + ×N), description au clic (popover ou fiche courte).
- **Figeage des listes** (inventaire exact par catégorie, en data) : potions = les 4 ids de `data/potions.json` ; éclats bruts = les 5 éléments ; gemmes = `GEM_TIERS` en data ; pièces = `EQUIPMENT` possédées ; matériaux = `materiau`/`matiereBoss` des 5 zones (`data/zones.json`). Toute catégorie hors de cette liste n'existe pas (validateur data).
- Cohérence avec l'usage : depuis l'onglet Potions, bouton « Boire » grisé hors combat/entre-étages selon les règles actuelles (chaque gorgée coûte le tour en combat).

## Lots proposés

- **C1 (data)** : figeage — table `categoriesInventaire` en data (potions/éclats/gemmes/pièces/matériaux avec leurs ids), validateur qui refuse toute entrée hors liste.
- **C2 (UI Boutique)** : onglets par type, prix lus en data inchangés ; test : somme des prix affichés = somme des prix data.
- **C3 (UI Inventaire)** : onglets + cases symbole+nombre + description au clic ; vente des éclats conservée.
- **C4 (clôture)** : smoke sections neuves (onglets boutique/inventaire, figeage), protocole IHM, CHANGELOG/HISTORY/roadmap.

## Preuves attendues

- Tests headless : validateur de figeage (une entrée hors liste → erreur), prix boutique = data (inchangés), onglets = catégories figées.
- Smoke : sections dédiées (chaque onglet boutique rend ses rows, chaque onglet inventaire rend ses cases, description au clic).
- Digest : **inchangé** (hors combat — MESURE de confirmation, baseline v1.34 `c62fcbd1…` 1281/3000 / `5059e683…` 4236/10000).

## Questions ouvertes

- [À TRANCHER — SESSION 12/11] Liste exacte des onglets boutique : « talismans » séparé des armes/armures, ou un seul onglet « équipement » par slot ?
- [À TRANCHER — SESSION 12/11] Le marchand et l'atelier deviennent-ils des onglets de la Boutique ou restent-ils des sections/purs raccourcis depuis l'Accueil ?
- [À TRANCHER — SESSION 12/11] Inventaire : la vente des éclats bruts reste dans l'onglet Gemmes, ou un bouton global « tout vendre » ?
