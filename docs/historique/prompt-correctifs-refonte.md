# Prompt de relance : correctifs post-refonte (T-FIX-1 à T-FIX-3)

Tu es un agent autonome de développement (session Vibe CLI ou OpenCode). Tu travailles dans le dépôt GitHub `mobize191/aicg-lignees`, branche `main`. La refonte majeure v1.0 a été livrée et mergée (PR #1) ; une vérification indépendante (docs/historique/rapport-verification-refonte.md) a relevé quatre écarts. Ta mission : exécuter les tickets correctifs T-FIX-1, T-FIX-2 et T-FIX-3, dans cet ordre, un ticket = une préoccupation = un commit. T-ZONES-1 est un draft : tu ne le touches pas.

## Ordre de lecture (avant toute ligne de code)

1. `docs/historique/rapport-verification-refonte.md` : les constats C1 à C4 avec leurs preuves reproductibles, et les trois tickets avec leurs critères.
2. `docs/design/spec-refonte-majeure.md` (exigences EXI) et `docs/design/plan-refonte-majeure.md` : le contexte de la refonte.

## Règles d'or

- `dist.html` est un artefact généré par `node build.mjs`. Tu ne l'édites JAMAIS à la main : toute feature vit dans `src/shell.html`, `src/ui.js` ou `data/*.json`, puis tu rebuilds.
- Le bouton 🖼️ de switch d'images (DreamShaper XL / WAI-Illustrious, localStorage `fondations-art-src`) est en production : son comportement ne change pas, et chaque ticket finit par prouver qu'il survit au rebuild.
- Le bouton de thème clair/sombre de v0.47.1 n'est PAS restauré (décision du designer) : tu n'y touches pas, même si tu croises ses traces dans l'historique git.
- Aucune valeur de design ne quitte `data/` ; aucune dépendance n'entre dans le repo ; Node 18+, `node --test`.
- Tu ne réécris pas les migrations existantes : elles sont bonnes, c'est leur branchement qui manque.

## Discipline d'exécution

- Après chaque étape, tu lances la commande de preuve du ticket. Si elle échoue, tu corriges la cause, tu ne contournes pas.
- Tu coches le ticket dans le rapport et tu committe.
- À la fin de chaque ticket, un mini-rapport : les commandes exécutées avec leur sortie réelle, puis en DERNIÈRE ligne, exactement :
  `VERDICT: PASS` ou `VERDICT: FAIL <raison>`
  Cette ligne reste lisible par une machine : jamais de texte après elle.
- T-FIX-2 exige une preuve de flux réel : le nouveau test doit exercer le chemin de chargement, pas seulement la fonction `migrate` isolée (c'est le constat C2 du rapport : un vert d'isolation a caché du code mort).

## Premier geste

Commence par T-FIX-1 : rapatrier le switch d'images 🖼️ (markup du bouton dans `src/shell.html`, CSS, `ART_MANIFESTS` / `artSrcKey` / `switchArtSrc` et le listener dans `src/ui.js`, entrée HISTORY v0.47.2), puis `node build.mjs`. Prouve par les quatre commandes du ticket, committe, puis T-FIX-2.

## Ce que tu rends à la fin

Un dépôt où `node build.mjs && node --test` passe de bout en bout, un dist committé identique au dist régénéré (plus jamais d'écart), le bouton 🖼️ présent dans `src/` et survivant à chaque build, la migration v8 -> v12 réellement appliquée au chargement d'une sauvegarde, le glossaire aligné sur le moteur, et trois mini-rapports clos par leur VERDICT. Rien d'autre ne change.
