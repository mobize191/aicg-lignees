# Roadmap — AICG : Lignées

> Dernière mise à jour : 10/11/2026, après la migration d'arbitrages design (classes, écoles, sorts communs renommés) et la réorganisation de la documentation.

## État actuel (v0.46, en ligne)

- **Jeu** : `dist.html` autonome (HTML+JS+CSS, ~370 Ko), jouable en local (double-clic) ou en ligne (GitHub Pages).
- **Combat** : mode 🤖 Auto par défaut ; mode 🧭 Tactique = vrai tour de RPG :
  - Moteur pas-à-pas : `beginRound` (file d'actions triée par ATQ décroissante, équipe devant à égalité) / `peekRound` / `stepRound(state, choice)`.
  - `resolveTurn(state, choices)` conservé : composition des mêmes pièces, chemin Auto et digest intacts.
  - Fenêtre d'action par carte : illustration, PV/ATQ/mana, ⚔ attaque, sorts ✦ nommés (coût + infobulle, `.off` si mana insuffisant), ➕ Souffle Croisé, ⏸ attendre, puis ciblage explicite (liste cliquable + pion surligné `.targeted` + clic direct).
  - Anti-runs fantômes : `combatGen` incrémenté à chaque rendu, pauses hors vue, timers génération-capturés.
- **Correctifs terrain v0.46** : limite 3 exemplaires par équipe, pions mobiles `clamp(104px, 26vw, 136px)` (boss 130-172), images de combat éclaircies `brightness(1.12)`, fiche avec illustration `.modal-hero` 176 px, puces d'info ℹ️/🎰/🌱 cliquables en tête d'écran (rappels du bas supprimés), glossaire « Les symboles de l'écran ».
- **UI combat v2 (10/11/2026)** : ciblage interactif (cibles illuminées sur le plateau, contour doré pulsant + pastille + curseur de visée, clic pour résoudre, zone de 2 au survol, bouton Annuler, coût/zone visibles, clic hors cible sans effet), pied de stats sur chaque pion (PV/ATQ/mana actuel/total + icônes d'état, KO grisé), fiche plein cadre (illustration cover, bord doré, voile dégradé, sous-titre classe·élément·rareté). Moteur et data inchangés : digest `7dfab0a2…` intact, smoke 142 checks, 60 tests.
- **Validation** : baseline digest 3000 combats `c5ab2af1…` (534 victoires, 0 exceptions, 0 marathons) ; équivalence pas-à-pas/Auto prouvée par le check 46 i du smoke (deux combats identiques, événements JSON strictement égaux) ; smoke **121 checks** tout passant.
- **Images** : `assets.json` = 33 arts de cartes (300×420 JPEG) + 5 fonds de donjons (960×540) : les 15 naissances, 4 monstres des Marées, 14 monstres C des 4 autres donjons, les 5 fonds. Chargés automatiquement en ligne (http), sondage par fichier en `file://`.

## Migration d'arbitrages design (10/11/2026, poussée dans les data)

Les décisions de la session design sont appliquées aux données du jeu (voir `docs/arbitrages.md` pour le journal complet) :

- **Classe Invocateur retirée** : a21 (Invocateur de Fournaise) devient Mage, les 8 monstres Invocateurs reclassés Mage ou Occultiste ; les invocations vivent par l'école de l'Appel.
- **Gardien-Mécanique (s4) devient Guerrier**, le Rempart s'ouvre au profil Guerrier ; **l'Entrave s'ouvre au Mage et à l'Occultiste**.
- **Sorts d'écolage communs renommés** : Lame d'Écume, Mélodie envoûtante, Barrière de Corail, Vigie des Flots (ids inchangés, sauvegardes intactes).
- **Nouvelle baseline** : digest `7dfab0a2…`, 476 victoires / 3000 (0 exception, 0 marathon), smoke 121 verts, 60 tests verts. La baisse de victoires (534 avant) vient des reclassifications : à surveiller au recalibrage v0.47 caractéristiques.
- **Documentation réorganisée** : `docs/00-SOMMAIRE.md` (la carte), `docs/regles-jeu.md`, `docs/arbitrages.md`, `docs/prompt-lancement.md`, tableaux générés dans `docs/tables/` (`node tools/gen-tables.mjs`), designs dans `docs/design/`, images dans `docs/images/`, rapports dans `docs/historique/`.

## Ce qui reste à faire (ordre acté)

1. **Validation terrain v0.46** (à faire sur téléphone ET PC) : fenêtre d'action confortable ? ciblage lisible ? ordre de tour compréhensible ? tailles de pions avec images, images claires, fiche avec grande illustration, puces d'info. `docs/validation-ihm.md` fournit un protocole de test local automatisé (captures d'écran incluses).
2. **v0.47 — Caractéristiques (ACTÉ)** : Force / Vie / Agilité / Intelligence, principe de DÉRIVATION plutôt que d'empilement :
   - Force = l'ATQ existante (étiquette) ; Vie = les PV existants (le bouclier peut en dériver).
   - Agilité = (a) initiative : qui agit en premier dans le tour entrelacé (remplace le tri ATQ du moteur v0.46) et (b) esquive dérivée de l'écart AGI attaquant/défenseur, plafonnée (~25-30 %), fusionnée avec le dodge de classe existant.
   - Intelligence = (a) puissance des sorts et (b) résistance aux affections/malédictions (durée ET probabilité, tranché).
   - Formules : à calibrer AVEC Marc-Olivier (il travaille en parallèle) ; validation = recalibrage digest complet + vigilance lisibilité (4 badges de plus sur les pions téléphone).
3. **Familles et races v3** (document de référence VALIDÉ, ~100 cartes à créer, 10 renommages) : Sirènes des Récifs (L Méliane/Thalassa, naufrage d'Ahab), lignes gobelins rapides, M Clergé (Apolline + nouvelle L Justine), noms d'uniques verrouillés (Jeanne d'Arc, Siegfried, Zikka, Griknir, Pontos, Ombeline, Calcine, Vulcain, Mycola, Adriel, Vesna, Macha, Ysolde, Aurorine, Pyrrha, Fjalar, Célestin, Kairos, Écho, Ananké). La section 16 du document sert de brief à la génération d'images.
4. **Campagne d'illustrations ComfyUI** (ACTÉE 09/11, FAITE 10/11 : **DreamShaper XL** remplace WAI-Illustrious v17, prompts en langage naturel) : plan exécuté dans `docs/images/plan-comfyui-images-videos.md` — étape test 6 univers validée, 29 nommées de référence rendues (`campagne/references/`, seeds verrouillés dans `tools/seeds.csv`, NON intégrées au manifeste en attendant le contenu v3), 5 fonds + 231 arts rendus et intégrés à `assets.json` (7,8 Mo, ASCII pur, ≤ 30 Ko/art), planches de contrôle dans `docs/campagne-planches/`. Non-régression : digest `c5ab2af1...` et smoke inchangés, `dist.html` intact.
5. **Vidéos de sorts signature** (WAN 2.2 5B, ~0,8 s, 21 frames/25 fps, WebM) : les 10 premiers prompts sont dans `tools/fx-prompts.json`, rendus WAN 2.2 TI2V 5B (GGUF Q6_K) stockés dans `site-assets/fx/` (jamais en base64 dans le dist, ni dans `assets.json`) ; l'affichage dans le jeu est un chantier code séparé (v0.48+).
6. **Retours UI notés** : corriger la double bordure de la zone de texte des cartes et son fond flou.
7. **Plus tard (acté)** : méta P-Hub, déclinaisons des raretés basses à partir des arts de référence et de leurs seeds.

## Historique court des versions

- 10/11/2026 : UI du combat v2 implémentée (ciblage interactif, pied de stats, fiche plein cadre), moteur intact (digest inchangé) ; - 10/11/2026 : migration d'arbitrages design dans les data (Invocateur retiré, Gardien Guerrier, Entrave Mage + Occultiste, sorts communs renommés) ; documentation réorganisée (sommaire, règles, arbitrages, tables générées).
- v0.43.1 : le jeu complet autonome, poussé sur GitHub (Pages).
- v0.44 : combat plein écran (one-screen), grandes cartes, harnas complet (digest + smoke).
- v0.44.1 : menu toujours visible, 19 premières illustrations + 2 fonds (assets.json).
- v0.45 : emojis réparés, menu ☰ en combat, panneau Tactique défilable, pions image pleine, sorts spéciaux en bandeau.
- v0.46 : RPG tour par tour (fenêtre d'action, ciblage explicite), moteur pas-à-pas, correctifs terrain, 33 arts + 5 fonds.
