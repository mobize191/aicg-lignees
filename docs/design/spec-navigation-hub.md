# Spec B — Navigation et hub (menu haut supprimé, Accueil par défaut)

> Statut : **PROPOSÉ** (12/11/2026) — rien ne se code avant la session de tranchage. ACTÉ du 11/11 nuit (arbitrages, point 1 ; doc de session §7) : menu du haut supprimé, menu latéral seul, Accueil = page par défaut toujours visible en fond, fond propre par page, petites interactions depuis l'Accueil vers Terres Sauvages / Boutique / Guilde, page Donjons absorbée par les Terres Sauvages, point de retour ville obligatoire dans chaque zone d'errance. Prompt : `docs/prompt-activites-immediates.md` (Phase 2, spec B). Trame : `docs/design/contenu-v3-spec-plan.md`.

## Contexte (état actuel v1.34)

- Routes enregistrées (`registerRoute`) : `#accueil`, `#equipe`, `#personnage`, `#collection`, `#forge` (Guilde), `#donjons`, `#quetes`, `#terres`, `#errance`, `#boutique`, `#inventaire`, `#combat`, `#glossaire`. Page par défaut : `go(location.hash || '#accueil')` — l'Accueil est déjà la page par défaut (v1.27).
- Navigation : menu latéral seul (hub-ville v1.27) ; un `<header class="top hub-top">` subsiste (badge points/or), ce n'est plus un menu de navigation.
- `#terres` : liste des 5 zones d'errance avec état verrouillé/débloqué (`zoneUnlocked`) et « visitée » ; `#donjons` existe encore comme page séparée avec sélecteur de marche (Nv 1→25) — l'ACTÉ prévoit de l'absorber dans les Terres.
- Errance (`src/errance.js`) : 5 zones, A* + pilotage inertiel, autel de soin (+5 pas de grâce), jarres, porte de donjon. **Aucun point de retour ville** : sans menu du haut, une fois en zone il n'existe aucun moyen de rentrer en ville (sauf rechargement).

## Périmètre ACTÉ (s'applique tel quel)

1. Menu du haut supprimé ; menu latéral seul ; Accueil page par défaut, toujours visible en fond ; fond propre à chaque page ; petites interactions depuis l'Accueil (Terres Sauvages, Boutique, Guilde).
2. Page Donjons supprimée, absorbée par les Terres Sauvages : on marche jusqu'au donjon, on entre, un écran affiche les paliers accessibles ; les Terres affichent l'état des donjons déjà bouclés.
3. **Point de retour ville obligatoire dans CHAQUE zone d'errance**.

## Proposition détaillée

- **Navigation** : confirmer la suppression du header haut (badge or déplacé dans le menu latéral) ; chaque page garde son fond propre (déjà le cas pour les pages récentes) ; depuis l'Accueil, 3 raccourcis cliquables vers `#terres`, `#boutique`, `#forge`.
- **Terres Sauvages** : chaque zone affiche son donjon avec **l'état bouclé** (ex. « Donjon des Marées — bouclé en Facile/Normal ») et un bouton « Entrer le donjon » ; la page `#donjons` disparaît (route supprimée, entrée directe depuis la carte de zone).
- **Écran d'entrée du donjon** : à l'entrée du bâtiment donjon en errance (ou depuis la carte de zone), un écran liste les **paliers accessibles** (les 5 modes × étages déjà bouclés, sélecteur de marche Nv 1→25 existant repris tel quel) avant de lancer le combat.
- **Point de retour ville** : un objet interactif « porte de la ville » (ou autel renommé) placé à un emplacement fixe de chaque zone (près du spawn, sur le chemin central) ; interaction → retour à `#accueil` (avec sauvegarde de la position d'errance, déjà persistée via `store.erranceSavedPos`). En data : `zone.errance.retourVille = {x, y}` ou dérivé du spawn.

## Hors périmètre (dépendances session)

Tout ce qui touche à l'architecture errance × donjons (profondeurs, grandes zones continues, « 25 donjons », zones d'errance intérieures) est **hors périmètre de cette spec** — la session du 12/11 tranche (doc de session §3). Points d'interface à lister sans les spécifier : profondeur de zone, ce qui bloque la grande carte, errance intérieure d'un donjon bouclé.

## Lots proposés

- **B1 (navigation)** : suppression du header haut, badge or dans le menu latéral, fonds par page vérifiés, raccourcis Accueil ; route `#donjons` supprimée.
- **B2 (Terres + entrée donjon)** : état des donjons bouclés sur les cartes de zone, écran d'entrée avec paliers accessibles (réutilise le sélecteur de marche existant).
- **B3 (retour ville)** : point de retour dans chaque zone d'errance (data `zones.json` + interaction `src/errance.js`, test headless : interaction → `go('#accueil')` + position persistée).
- **B4 (clôture)** : smoke (nouvelles sections), protocole IHM, CHANGELOG/HISTORY/roadmap.

## Preuves attendues

- Tests headless : route `#donjons` retirée, point de retour présent dans les 5 zones en data et cliquable (état d'errance → retour accueil), paliers accessibles = paliers bouclés.
- Smoke : sections dédiées (navigation, Terres avec état donjons, écran d'entrée, retour ville depuis une zone).
- Digest : **inchangé** (hors combat — MESURE de confirmation, baseline v1.34 `c62fcbd1…` 1281/3000 / `5059e683…` 4236/10000).

## Questions ouvertes

- [À TRANCHER — SESSION 12/11] Transitions entre pages : fond animé commun ou fondu simple ?
- [À TRANCHER — SESSION 12/11] Emplacement exact du point de retour ville (porte dédiée près du spawn, ou l'autel existant renommé « retour à la ville + soin » ?).
- [À TRANCHER — SESSION 12/11] Écran d'entrée du donjon : depuis la carte de zone, depuis l'errance (bâtiment), ou les deux ?
- [À TRANCHER — SESSION 12/11] Affichage des donjons bouclés dans les Terres : par palier (Facile…Enfer) ou compteur global ?
