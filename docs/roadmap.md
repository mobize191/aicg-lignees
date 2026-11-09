# Roadmap — AICG : Lignées

> Dernière mise à jour : 09/11/2026, après la v0.46 (moteur pas-à-pas + fenêtre RPG + 33 arts / 5 fonds).

## État actuel (v0.46, en ligne)

- **Jeu** : `dist.html` autonome (HTML+JS+CSS, ~370 Ko), jouable en local (double-clic) ou en ligne (GitHub Pages).
- **Combat** : mode 🤖 Auto par défaut ; mode 🧭 Tactique = vrai tour de RPG :
  - Moteur pas-à-pas : `beginRound` (file d'actions triée par ATQ décroissante, équipe devant à égalité) / `peekRound` / `stepRound(state, choice)`.
  - `resolveTurn(state, choices)` conservé : composition des mêmes pièces, chemin Auto et digest intacts.
  - Fenêtre d'action par carte : illustration, PV/ATQ/mana, ⚔ attaque, sorts ✦ nommés (coût + infobulle, `.off` si mana insuffisant), ➕ Souffle Croisé, ⏸ attendre, puis ciblage explicite (liste cliquable + pion surligné `.targeted` + clic direct).
  - Anti-runs fantômes : `combatGen` incrémenté à chaque rendu, pauses hors vue, timers génération-capturés.
- **Correctifs terrain v0.46** : limite 3 exemplaires par équipe, pions mobiles `clamp(104px, 26vw, 136px)` (boss 130-172), images de combat éclaircies `brightness(1.12)`, fiche avec illustration `.modal-hero` 176 px, puces d'info ℹ️/🎰/🌱 cliquables en tête d'écran (rappels du bas supprimés), glossaire « Les symboles de l'écran ».
- **Validation** : baseline digest 3000 combats `c5ab2af1…` (534 victoires, 0 exceptions, 0 marathons) ; équivalence pas-à-pas/Auto prouvée par le check 46 i du smoke (deux combats identiques, événements JSON strictement égaux) ; smoke **121 checks** tout passant.
- **Images** : `assets.json` = 33 arts de cartes (300×420 JPEG) + 5 fonds de donjons (960×540) : les 15 naissances, 4 monstres des Marées, 14 monstres C des 4 autres donjons, les 5 fonds. Chargés automatiquement en ligne (http), sondage par fichier en `file://`.

## Ce qui reste à faire (ordre acté)

1. **Validation terrain v0.46** (à faire sur téléphone ET PC) : fenêtre d'action confortable ? ciblage lisible ? ordre de tour compréhensible ? tailles de pions avec images, images claires, fiche avec grande illustration, puces d'info. `docs/validation-ihm.md` fournit un protocole de test local automatisé (captures d'écran incluses).
2. **v0.47 — Caractéristiques (ACTÉ)** : Force / Vie / Agilité / Intelligence, principe de DÉRIVATION plutôt que d'empilement :
   - Force = l'ATQ existante (étiquette) ; Vie = les PV existants (le bouclier peut en dériver).
   - Agilité = (a) initiative : qui agit en premier dans le tour entrelacé (remplace le tri ATQ du moteur v0.46) et (b) esquive dérivée de l'écart AGI attaquant/défenseur, plafonnée (~25-30 %), fusionnée avec le dodge de classe existant.
   - Intelligence = (a) puissance des sorts et (b) résistance aux affections/malédictions (durée ET probabilité, tranché).
   - Formules : à calibrer AVEC Marc-Olivier (il travaille en parallèle) ; validation = recalibrage digest complet + vigilance lisibilité (4 badges de plus sur les pions téléphone).
3. **Familles et races v3** (document de référence VALIDÉ, ~100 cartes à créer, 10 renommages) : Sirènes des Récifs (L Méliane/Thalassa, naufrage d'Ahab), lignes gobelins rapides, M Clergé (Apolline + nouvelle L Justine), noms d'uniques verrouillés (Jeanne d'Arc, Siegfried, Zikka, Griknir, Pontos, Ombeline, Calcine, Vulcain, Mycola, Adriel, Vesna, Macha, Ysolde, Aurorine, Pyrrha, Fjalar, Célestin, Kairos, Écho, Ananké). La section 16 du document sert de brief à la génération d'images.
4. **Campagne d'illustrations ComfyUI** (ACTÉE 09/11 : **DreamShaper XL** remplace WAI-Illustrious v17, prompts en langage naturel) : plan complet d'exécution dans `docs/plan-comfyui-images-videos.md` (9 tâches : étape test 6 univers, 29 nommées de référence, 5 fonds, 135 monstres, naissances/familiales/solos, intégration par lots, vidéos). Scripts prêts dans `tools/` (extraction du catalogue, génération des 231 prompts, batch API, intégration `assets.json`, planches de contrôle) ; les 29 nommées de référence (prompts dans `tools/serie1-prompts.json`) attendent l'intégration du contenu v3 et ne vont PAS au manifeste ; les 33 arts actuels restent en place jusqu'à leur remplacement lot par lot.
5. **Vidéos de sorts signature** (WAN 2.2 5B, ~0,8 s, 20 frames/25 fps, boucle fermée) après validation de la série d'images : les 10 premiers prompts sont rédigés dans le plan (tâche 8), stockage dans `site-assets/fx/`, jamais en base64 dans le dist ; l'affichage dans le jeu est un chantier code séparé (v0.48+).
6. **Retours UI notés** : corriger la double bordure de la zone de texte des cartes et son fond flou.
7. **Plus tard (acté)** : méta P-Hub, déclinaisons des raretés basses à partir des arts de référence et de leurs seeds.

## Historique court des versions

- v0.43.1 : le jeu complet autonome, poussé sur GitHub (Pages).
- v0.44 : combat plein écran (one-screen), grandes cartes, harnas complet (digest + smoke).
- v0.44.1 : menu toujours visible, 19 premières illustrations + 2 fonds (assets.json).
- v0.45 : emojis réparés, menu ☰ en combat, panneau Tactique défilable, pions image pleine, sorts spéciaux en bandeau.
- v0.46 : RPG tour par tour (fenêtre d'action, ciblage explicite), moteur pas-à-pas, correctifs terrain, 33 arts + 5 fonds.
