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

### 1.2 Maquettes écran par écran (ordre de production ACTÉ 11/11 : menu d'abord, puis les besoins du couloir 1, puis le reste)

1. **Accueil / hub-ville (le nouveau menu)** — **VALIDÉE le 11/11** (maquette `docs/design/maquettes/accueil-hub-ville.html`) : navigation vers Boutique, Guilde, quêtes, Personnage et Les Terres Sauvages ; porte de l'errance et colonne vertébrale du redesign. DA révisée actée : cadres médiévaux dorés sur tous les boutons + place de village ensoleillée (fontaine, étals, villageois) ; la vidéo d'ambiance WAN 2.1 14B suivra cette direction. Passe au codage par le couloir 1.
2. **Habillage des nouveautés de la boucle v2 — VALIDÉE le 11/11** (maquette `docs/design/maquettes/boucle-v2.html` ; toast de recrue global acté : Récompenses, errance, fin de donjon). Couvre les lots 3-4 du couloir 1 (spec `boucle-v2-spec-plan.md`) : écran de départ à 2 cartes, sélecteur de marche (niveaux 1 → 25, bandes de rareté), écran Récompenses, action Objet et compteurs de potions, page Inventaire, toasts de recrue. La maquette passe au codage par le couloir 1.
3. **Économie v2** : Boutique (rayons potions/éclats/gemmes brutes/équipement, prix affichés), page Quêtes du jour (3 quêtes + bonus de complétion), Guilde (évolutions + rotation de 3 compagnons), marchand de créatures, vue équipement de la Boutique.
4. **Errance, zone témoin Marées** : HUD (PV/or/collectables), boutons flottants ⚔️/📦 tactiles, transitions de combat (flash + iris), autels, porte du bâtiment-donjon, hôtel des crans. Le moteur est déjà spécifié : la maquette **habille le contrat** de `errance-topdown.md` (tuiles, interactions, HUD), elle ne le réinvente pas.

L'ordre de **codage** du couloir 1 reste celui de la roadmap point 9 (économie v2 → hub → errance) ; seul l'ordre de production des maquettes change.

### 1.3 Arts et DA

- **Héros dédié de l'errance — ARBITRÉ 11/11** : **femme aux cheveux blancs sous une cape noire** (Marc-Olivier). L'art de référence v2 est débloqué dès la validation de la planche vague 1 ; cycle de marche en **WAN 2.1 14B i2v** (arbitré : 14B partout, fp8 + offload sur RTX 5070). Jusqu'à l'art validé, les maquettes d'errance travaillent avec un sprite placeholder, le moteur d'errance peut être codé en parallèle (roadmap point 9).
- **Série 2 de la campagne** (27 arts, plan existant) : priorité au pipeline validé (correctifs de prompts, IPAdapter poids 0.3-0.45 `ease in-out` end_at 0.8-0.9, règle `beast: true`).
- **Équipement et sets** : PROPOSÉ — icônes par type et niveau (une icône par pièce de set et par palier d'arme/armure, pas un art illustré par objet) ; à trancher par Marc-Olivier. Les noms sont actés (`economie-v2-catalogues.md` §2).

## 2. Discipline

- Une maquette est validée par Marc-Olivier avant de passer au codage ; les tranchages sont consignés dans `docs/arbitrages.md` (statut ACTÉ).
- Les maquettes ne dupliquent pas les valeurs : prix et pourcentages restent dans `economie-v2-catalogues.md` (source de vérité `data/*.json` à terme).
- Ce couloir ne touche ni `src/`, ni `data/`, ni le build : ses livrables sont des planches, maquettes et fichiers de DA.
