# Prompt de lancement : la refonte majeure (mono-agent)

Tu es un agent autonome de développement (session Vibe CLI ou OpenCode). Tu travailles dans le dépôt GitHub `mobize191/aicg-lignees`, branche unique `main` : un jeu de cartes HTML/JS autonome, aujourd'hui un fichier `dist.html` monolithique (374 Ko, un seul bloc script) jouable en double-clic. Ta mission : exécuter le plan d'implémentation de la refonte majeure, phase par phase, dans l'ordre, jusqu'au bout ou jusqu'à un blocage réel.

## Ordre de lecture (avant toute ligne de code)

1. `docs/design/spec-refonte-majeure.md` : la spec. Ses exigences (EXI) et ses critères d'acceptation (ACC) font foi.
2. `docs/design/plan-refonte-majeure.md` : le plan, 25 tâches de T0.1 à T5.2. C'est ta feuille de route, il contient le code de départ des fichiers clés.
3. `docs/design/refonte-sorts.md`, `docs/design/design-arbres.md`, `docs/design/inventaire-sorts.md` : les designs normatifs (sorts v2.3, arbres v17, inventaire des 189 signatures).

En cas de contradiction entre documents, le design le plus récent gagne.

## Règles d'or

- Ne modifie JAMAIS `dist.html` à la main : il est généré par `node build.mjs`.
- Ne code JAMAIS une valeur de design (taux, mult, coût, nom de sort, id de carte) dans `src/engine/` : les valeurs vivent dans `data/*.json`. Le test allowlist (`tests/allowlist.test.js`) le vérifie à chaque passe.
- Ne saute JAMAIS une migration de sauvegarde : la chaîne v8 -> version courante est testée après chaque étape qui la fait bouger.
- Tu ne devines JAMAIS un design ambigu : tu notes la question dans le rapport de phase et tu prends en attendant l'option la plus conservatrice (comportement inchangé).
- Zéro dépendance : pas de `npm install`, pas de `node_modules`. Node 18+, tests via `node --test`.

## Discipline d'exécution

- Une tâche = une préoccupation = un commit. Le message de commit suit la formulation du plan.
- Après chaque étape, tu lances la commande de preuve indiquée par le plan. Elle doit passer avant de continuer. Si elle échoue, tu corriges la cause, tu ne contournes pas le test.
- Tu coches les cases du plan au fur et à mesure et tu committe le plan mis à jour.
- À la fin de chaque phase, tu produis un rapport : les critères ACC exécutés avec leur sortie réelle, les questions ouvertes pour le designer, puis en DERNIÈRE ligne, exactement :
  `VERDICT: PASS` ou `VERDICT: FAIL <raison>`
  Cette ligne reste lisible par une machine : jamais de texte après elle, jamais de mise en forme.
- Un échec de preuve ou un `VERDICT: FAIL` arrête la phase : tu ne passes à la suivante que si tout est vert et le dist régénéré est jouable.

## Critère d'arrêt d'une phase

Toutes les commandes ACC de la phase passent, `node build.mjs` régénère un dist jouable (7 routes, un combat complet, une sauvegarde migrée), le harnas de migration est vert, le rapport est rendu. Alors, et seulement alors, phase suivante.

## Premier geste

Commence par la tâche T0.1 du plan (le socle de repo : `package.json`, `.gitignore`, `tests/allowlist.txt`, `tests/helpers/rng.js`, `tests/smoke.test.js`), prouve par `npm test`, committe, puis T0.2. Suis ensuite le plan à la lettre, dans l'ordre des tâches et des étapes.

## Ce que tu rends à la fin

Un dépôt où `node build.mjs && npm test` passe de bout en bout, un `dist.html` régénéré et jouable, les six rapports de phase (chacun clos par son VERDICT), et un HISTORY à jour. Rien d'autre ne change : pas de refactor hors plan, pas de dépendance, pas de fichier parasite.
