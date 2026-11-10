# Brief : maquettes et graphismes du bloc visuel v2 (couloir design/graphisme)

> Statut : **ACTÉ** le 11/11/2026 (parallélisation design/graphisme, arbitrages « calibrage post-lignes et précisions boucle v2 »). Ce couloir produit design et graphisme **en parallèle du couloir 1**, sans attendre le calibrage digest. Il ne code pas : les maquettes validées passent au couloir 1 dans l'ordre acté (économie v2 → Accueil/hub-ville → errance). Toute décision nouvelle vit dans `docs/arbitrages.md` avec date et statut.

## 0. Références

- `docs/regles-jeu.md` §7 (économie v2 cible), §8 (design cible des maquettes ; combat v2 et fiches déjà implémentés).
- `docs/design/economie-v2-catalogues.md` : catalogues complets (Boutique, équipement et sets, quêtes, Guilde, inventaire, migration).
- `docs/design/errance-topdown.md` : moteur top-down complet (style « peint, non pixelisé », tuiles, caméra, rencontres, interactions, HUD, transitions).
- `docs/roadmap.md` point 9 (ordre acté du bloc visuel) et point 6 (contenu v3, campagne d'arts série 2).
- `docs/images/` : conventions graphiques, charte graphique v2 (proposée), plans de campagne d'illustrations et vidéos.

## 1. Livrables

### 1.1 Charte graphique v2 (transverse, d'abord)

- Palette, typographie, densité, états des contrôles (normal/actif/éteint), style des listes et boutons, cohérents avec le combat v2 déjà en ligne (`dist.html`).
- Contraintes : mobile-first, boutons ≥ 32 px, `dist.html` autonome (budget ~550 Ko à surveiller), aucune nouvelle technologie.

### 1.2 Maquettes écran par écran (dans l'ordre du code)

1. **Économie v2** : Boutique (rayons potions/éclats/gemmes brutes/équipement, prix affichés), page Quêtes du jour (3 quêtes + bonus de complétion), Guilde (évolutions + rotation de 3 compagnons), marchand de créatures, inventaire de la page Personnage (2 slots personnage + 2 slots d'équipe, stats base + bonus %).
2. **Accueil / hub-ville** : navigation vers Boutique, Guilde, quêtes, Personnage et Les Terres Sauvages ; c'est la porte de l'errance.
3. **Errance, zone témoin Marées** : HUD (PV/or/collectables), boutons flottants ⚔️/📦 tactiles, transitions de combat (flash + iris), autels, porte du bâtiment-donjon, hôtel des crans. Le moteur est déjà spécifié : la maquette **habille le contrat** de `errance-topdown.md` (tuiles, interactions, HUD), elle ne le réinvente pas.
4. **Habillage des nouveautés de la boucle v2** (le couloir 1 code en parallèle, spec `boucle-v2-spec-plan.md`) : écran de départ à 2 cartes, sélecteur de marche (niveaux 1 → 25, bandes de rareté), action Objet et compteurs de potions, toasts de recrue.

### 1.3 Arts et DA

- **Héros dédié de l'errance** : bloqué sur la validation de la planche vague 1 (en attente de Marc-Olivier) et le cycle de marche WAN ; les maquettes d'errance travaillent avec un sprite placeholder, le moteur d'errance peut être codé en parallèle (roadmap point 9).
- **Série 2 de la campagne** (27 arts, plan existant) : priorité au pipeline validé (correctifs de prompts, IPAdapter poids 0.3-0.45 `ease in-out` end_at 0.8-0.9, règle `beast: true`).
- **Équipement et sets** : PROPOSÉ — icônes par type et niveau (une icône par pièce de set et par palier d'arme/armure, pas un art illustré par objet) ; à trancher par Marc-Olivier. Les noms sont actés (`economie-v2-catalogues.md` §2).

## 2. Discipline

- Une maquette est validée par Marc-Olivier avant de passer au codage ; les tranchages sont consignés dans `docs/arbitrages.md` (statut ACTÉ).
- Les maquettes ne dupliquent pas les valeurs : prix et pourcentages restent dans `economie-v2-catalogues.md` (source de vérité `data/*.json` à terme).
- Ce couloir ne touche ni `src/`, ni `data/`, ni le build : ses livrables sont des planches, maquettes et fichiers de DA.
